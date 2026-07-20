"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ErrorBanner, useCommerceTheme, type CategoryRow } from "./shared";

function slugify(input: string): string {
  return input.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

interface TreeNode extends CategoryRow {
  children: TreeNode[];
  depth: number;
}

function buildTree(cats: CategoryRow[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  for (const c of cats) map.set(c.id, { ...c, children: [], depth: 0 });
  for (const c of cats) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      const parent = map.get(c.parent_id)!;
      node.depth = parent.depth + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  function sortChildren(nodes: TreeNode[]) {
    nodes.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    for (const n of nodes) sortChildren(n.children);
  }
  sortChildren(roots);
  return roots;
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];
  function walk(list: TreeNode[], depth: number) {
    for (const n of list) {
      n.depth = depth;
      result.push(n);
      walk(n.children, depth + 1);
    }
  }
  walk(nodes, 0);
  return result;
}

function collectTreeState(nodes: TreeNode[], parentId: number | null = null): Array<{ id: number; parent_id: number | null; sort_order: number }> {
  const result: Array<{ id: number; parent_id: number | null; sort_order: number }> = [];
  nodes.forEach((n, i) => {
    result.push({ id: n.id, parent_id: parentId, sort_order: i });
    result.push(...collectTreeState(n.children, n.id));
  });
  return result;
}

function isDescendant(nodeId: number, potentialAncestorId: number, map: Map<number, TreeNode>): boolean {
  let cur = map.get(nodeId);
  while (cur) {
    if (cur.id === potentialAncestorId) return true;
    cur = cur.parent_id ? map.get(cur.parent_id) : undefined;
  }
  return false;
}

export function CategoriesTab({ base }: { base: string }) {
  const theme = useCommerceTheme();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; slug: string; description: string; image_url: string }>({ name: "", slug: "", description: "", image_url: "" });

  // DnD state
  const [dragId, setDragId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: number; position: "before" | "after" | "child" } | null>(null);
  const dragCounter = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ categories: CategoryRow[] }>(`${base}/categories`);
      setCategories(data.categories);
      setTree(buildTree(data.categories));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function create() {
    const name = newName.trim();
    if (!name) return;
    try {
      await api(`${base}/categories`, {
        method: "POST",
        body: JSON.stringify({ name, slug: slugify(name), parent_id: newParentId }),
      });
      setNewName("");
      setNewParentId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vytvoření selhalo");
    }
  }

  async function saveTree(newTree: TreeNode[]) {
    setSaving(true);
    try {
      const treeData = collectTreeState(newTree);
      await api(`${base}/categories/reorder`, {
        method: "POST",
        body: JSON.stringify({ tree: treeData }),
      });
      setTree(newTree);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uložení pořadí selhalo");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number, name: string, count: number, hasChildren: boolean) {
    const msg = hasChildren
      ? `Smazat kategorii „${name}" včetně všech podkategorií?`
      : count > 0
        ? `Smazat kategorii „${name}"? Obsahuje ${count} produktů — ty zůstanou, jen ztratí zařazení.`
        : `Smazat kategorii „${name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await api(`${base}/categories/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Smazání selhalo");
    }
  }

  async function toggleVisible(id: number, visible: boolean) {
    try {
      await api(`${base}/categories/${id}`, { method: "PATCH", body: JSON.stringify({ is_visible: !visible }) });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uložení selhalo");
    }
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await api(`${base}/categories/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: editForm.slug.trim() || slugify(editForm.name),
          description: editForm.description.trim() || null,
          image_url: editForm.image_url.trim() || null,
        }),
      });
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uložení selhalo");
    }
  }

  function toggleCollapse(id: number) {
    setCollapsed((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  // ── Drag & Drop logic ──
  function removeNodeFromTree(nodes: TreeNode[], id: number): { tree: TreeNode[]; removed: TreeNode | null } {
    let removed: TreeNode | null = null;
    function walk(list: TreeNode[]): TreeNode[] {
      return list.filter((n) => {
        if (n.id === id) { removed = n; return false; }
        n.children = walk(n.children);
        return true;
      });
    }
    const newNodes = walk(nodes.map((n) => ({ ...n, children: [...n.children] })));
    return { tree: newNodes, removed };
  }

  function deepCloneTree(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((n) => ({ ...n, children: deepCloneTree(n.children) }));
  }

  function handleDrop() {
    if (!dragId || !dropTarget || dragId === dropTarget.id) {
      setDragId(null);
      setDropTarget(null);
      return;
    }

    const allMap = new Map<number, TreeNode>();
    flattenTree(tree).forEach((n) => allMap.set(n.id, n));
    if (isDescendant(dropTarget.id, dragId, allMap)) {
      setDragId(null);
      setDropTarget(null);
      return;
    }

    const cloned = deepCloneTree(tree);
    const { tree: withoutDrag, removed } = removeNodeFromTree(cloned, dragId);
    if (!removed) { setDragId(null); setDropTarget(null); return; }

    let newTree: TreeNode[];
    if (dropTarget.position === "child") {
      newTree = withoutDrag.map(function addChild(n): TreeNode {
        if (n.id === dropTarget.id) return { ...n, children: [...n.children, removed!] };
        return { ...n, children: n.children.map(addChild) };
      });
    } else {
      function insertInList(list: TreeNode[]): TreeNode[] {
        const result: TreeNode[] = [];
        for (const n of list) {
          if (n.id === dropTarget!.id && dropTarget!.position === "before") result.push(removed!);
          result.push({ ...n, children: insertInList(n.children) });
          if (n.id === dropTarget!.id && dropTarget!.position === "after") result.push(removed!);
        }
        return result;
      }
      newTree = insertInList(withoutDrag);
    }

    setDragId(null);
    setDropTarget(null);
    saveTree(newTree);
  }

  function getDropPosition(e: React.DragEvent, nodeId: number): "before" | "after" | "child" {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;
    if (y < h * 0.25) return "before";
    if (y > h * 0.75) return "after";
    return "child";
  }

  // ── Visible flat list (respecting collapsed) ──
  function getVisibleNodes(): TreeNode[] {
    const result: TreeNode[] = [];
    function walk(nodes: TreeNode[], depth: number) {
      for (const n of nodes) {
        const node = { ...n, depth };
        result.push(node);
        if (!collapsed.has(n.id)) walk(n.children, depth + 1);
      }
    }
    walk(tree, 0);
    return result;
  }

  const visible = getVisibleNodes();
  const flatAll = flattenTree(tree);
  const rootCats = categories.filter((c) => !c.parent_id);

  return (
    <div>
      <style>{`
        .cat-drop-before { border-top: 3px solid #2563eb !important; }
        .cat-drop-after { border-bottom: 3px solid #2563eb !important; }
        .cat-drop-child { background: rgba(37,99,235,0.06) !important; outline: 2px dashed #2563eb; outline-offset: -2px; }
        .cat-drag-active { opacity: 0.4; }
        .cat-row { transition: background 0.1s, border-color 0.1s; }
        .cat-row:hover { background: rgba(0,0,0,0.02); }
        .cat-chevron { transition: transform 0.15s ease; }
        .cat-chevron-open { transform: rotate(90deg); }
        @keyframes catFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .cat-edit-panel { animation: catFade 0.15s ease; }
      `}</style>

      {/* Add new category */}
      <div className={`${theme.toolbarCls} mb-4`}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
          placeholder="Název nové kategorie…"
          className={`${theme.inputCls} flex-1`}
        />
        <select
          value={newParentId ?? ""}
          onChange={(e) => setNewParentId(e.target.value ? Number(e.target.value) : null)}
          className={`${theme.inputCls} w-auto min-w-[160px]`}
        >
          <option value="">Hlavní kategorie</option>
          {flatAll.map((c) => (
            <option key={c.id} value={c.id}>{"—".repeat(c.depth)} {c.name}</option>
          ))}
        </select>
        <button onClick={create} className={theme.btnPrimary}>Přidat</button>
      </div>

      <ErrorBanner message={error} />

      {saving && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-700">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(37,99,235,0.2)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
          Ukládám pořadí…
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[13px] text-gray-400">Načítám kategorie…</div>
      ) : tree.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-[32px] mb-3">📁</div>
          <p className="text-[14px] font-semibold text-slate-600">Žádné kategorie</p>
          <p className="text-[13px] text-slate-400 mt-1">Vytvořte první kategorii pomocí formuláře výše.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          {/* Tree header */}
          <div className="flex items-center px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
            <div className="flex-1">Kategorie</div>
            <div className="w-20 text-center">Produktů</div>
            <div className="w-24 text-center">Viditelnost</div>
            <div className="w-28 text-right">Akce</div>
          </div>

          {/* Tree rows */}
          {visible.map((node) => {
            const hasChildren = node.children.length > 0;
            const isCollapsed = collapsed.has(node.id);
            const isDragging = dragId === node.id;
            const isDropChild = dropTarget?.id === node.id && dropTarget?.position === "child";
            const isDropBefore = dropTarget?.id === node.id && dropTarget?.position === "before";
            const isDropAfter = dropTarget?.id === node.id && dropTarget?.position === "after";

            return (
              <div key={node.id}>
                <div
                  className={`cat-row flex items-center px-4 py-2.5 border-b border-slate-50 cursor-grab active:cursor-grabbing
                    ${isDragging ? "cat-drag-active" : ""}
                    ${isDropChild ? "cat-drop-child" : ""}
                    ${isDropBefore ? "cat-drop-before" : ""}
                    ${isDropAfter ? "cat-drop-after" : ""}`}
                  draggable
                  onDragStart={(e) => {
                    setDragId(node.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(node.id));
                  }}
                  onDragEnd={() => { setDragId(null); setDropTarget(null); }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragId && dragId !== node.id) {
                      const pos = getDropPosition(e, node.id);
                      setDropTarget({ id: node.id, position: pos });
                    }
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    dragCounter.current++;
                  }}
                  onDragLeave={() => {
                    dragCounter.current--;
                    if (dragCounter.current === 0) {
                      if (dropTarget?.id === node.id) setDropTarget(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    dragCounter.current = 0;
                    handleDrop();
                  }}
                >
                  {/* Indent + expand/collapse + drag handle */}
                  <div className="flex items-center flex-1 min-w-0" style={{ paddingLeft: node.depth * 28 }}>
                    {/* Drag handle */}
                    <span className="mr-2 text-slate-300 hover:text-slate-500 cursor-grab flex-shrink-0" title="Přetáhněte pro přesunutí">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                    </span>

                    {/* Expand/collapse */}
                    {hasChildren ? (
                      <button
                        onClick={() => toggleCollapse(node.id)}
                        className="mr-1.5 flex items-center justify-center w-5 h-5 rounded hover:bg-slate-100 text-slate-400 flex-shrink-0"
                      >
                        <svg className={`cat-chevron ${isCollapsed ? "" : "cat-chevron-open"}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
                      </button>
                    ) : (
                      <span className="mr-1.5 w-5 h-5 flex items-center justify-center text-slate-200 flex-shrink-0">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="2.5" /></svg>
                      </span>
                    )}

                    {/* Category icon/image + name */}
                    {node.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={node.image_url} alt="" className="w-7 h-7 rounded-md object-cover mr-2.5 flex-shrink-0 border border-slate-100" />
                    ) : (
                      <span className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-50 to-blue-100 text-blue-500 text-[12px] font-bold flex items-center justify-center mr-2.5 flex-shrink-0">
                        {node.name.charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div className="min-w-0">
                      {renaming?.id === node.id ? (
                        <input
                          autoFocus
                          value={renaming.name}
                          onChange={(e) => setRenaming({ id: node.id, name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              api(`${base}/categories/${node.id}`, { method: "PATCH", body: JSON.stringify({ name: renaming.name.trim() }) }).then(load);
                              setRenaming(null);
                            }
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          onBlur={() => {
                            if (renaming.name.trim() && renaming.name.trim() !== node.name) {
                              api(`${base}/categories/${node.id}`, { method: "PATCH", body: JSON.stringify({ name: renaming.name.trim() }) }).then(load);
                            }
                            setRenaming(null);
                          }}
                          className={`${theme.inputCls} h-7 text-[13px] w-48`}
                        />
                      ) : (
                        <div
                          onDoubleClick={() => setRenaming({ id: node.id, name: node.name })}
                          className="cursor-text"
                          title="Dvojklik = přejmenovat"
                        >
                          <span className="text-[13px] font-semibold text-slate-800">{node.name}</span>
                          <span className="text-[11px] text-slate-400 ml-2">/{node.slug}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product count */}
                  <div className="w-20 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[22px] h-5 rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                      node.product_count > 0 ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                    }`}>
                      {node.product_count}
                    </span>
                  </div>

                  {/* Visibility toggle */}
                  <div className="w-24 text-center">
                    <button
                      onClick={() => toggleVisible(node.id, node.is_visible)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition ${
                        node.is_visible
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {node.is_visible ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      )}
                      {node.is_visible ? "Viditelná" : "Skrytá"}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="w-28 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        if (editingId === node.id) { setEditingId(null); return; }
                        setEditingId(node.id);
                        setEditForm({ name: node.name, slug: node.slug, description: node.description ?? "", image_url: node.image_url ?? "" });
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Upravit"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                    </button>
                    <button
                      onClick={() => remove(node.id, node.name, node.product_count, hasChildren)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Smazat"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2m1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6" /></svg>
                    </button>
                  </div>
                </div>

                {/* Edit panel */}
                {editingId === node.id && (
                  <div className="cat-edit-panel px-4 py-3 bg-slate-50 border-b border-slate-100" style={{ paddingLeft: node.depth * 28 + 16 }}>
                    <div className="grid grid-cols-2 gap-3 max-w-xl">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Název</label>
                        <input className={`${theme.inputCls} h-8 text-[13px]`} value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Slug</label>
                        <input className={`${theme.inputCls} h-8 text-[13px] font-mono`} value={editForm.slug}
                          onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Popis</label>
                        <textarea className={`${theme.inputCls} h-16 py-2 text-[13px]`} value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">URL obrázku</label>
                        <input className={`${theme.inputCls} h-8 text-[13px]`} value={editForm.image_url}
                          onChange={(e) => setEditForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://…" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={saveEdit} className={`${theme.btnPrimary} h-8 px-4 text-[12px]`}>Uložit</button>
                      <button onClick={() => setEditingId(null)} className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-500 hover:bg-white">Zrušit</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-[11.5px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          Přetáhněte kategorie pro změnu pořadí a zanořování
        </span>
        <span>·</span>
        <span>Dvojklik na název = přejmenovat</span>
        <span>·</span>
        <span>{flatAll.length} kategorií celkem</span>
      </div>
    </div>
  );
}
