"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowLeft, Check, Loader2, Trash2, Eye, Type, Heading2, Image as ImageIcon,
  LayoutGrid, Quote, List, MousePointerClick, Minus, Video, Code2, Search, Send, CalendarClock,
} from "lucide-react";
import type { BlogBlock } from "@/lib/blog/content";
import { wordCount, readingTimeMinutes } from "@/lib/blog/content";
import { type EditorBlock, toEditorBlocks, toContentBlocks, defaultBlock, BLOCK_LABELS, newUid } from "./blog-editor/types";
import { BlockCard } from "./blog-editor/BlockCard";
import { ImageField } from "./blog-editor/ImageField";

interface PostData {
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string;
  og_image: string;
  author: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
  noindex: boolean;
  scheduled_at: string;
}

interface Props {
  tenantSlug: string;
  postSlug?: string;
  initial?: Partial<Omit<PostData, "tags">> & {
    id?: number;
    content?: BlogBlock[];
    tags?: string[] | string;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={14} />,
  heading: <Heading2 size={14} />,
  image: <ImageIcon size={14} />,
  gallery: <LayoutGrid size={14} />,
  quote: <Quote size={14} />,
  list: <List size={14} />,
  cta: <MousePointerClick size={14} />,
  divider: <Minus size={14} />,
  video: <Video size={14} />,
  code: <Code2 size={14} />,
};

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

export function BlogPostEditor({ tenantSlug, initial, postSlug }: Props) {
  const router = useRouter();
  const isNew = !postSlug;
  // Prefer the numeric id for API calls — it stays stable when the slug is edited
  const apiRef = initial?.id ?? postSlug;

  const initialTags = Array.isArray(initial?.tags)
    ? initial.tags
    : (initial?.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  const [data, setData] = useState<PostData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    featured_image: initial?.featured_image ?? "",
    og_image: initial?.og_image ?? "",
    author: initial?.author ?? "",
    category: initial?.category ?? "",
    tags: initialTags,
    status: initial?.status ?? "draft",
    seo_title: initial?.seo_title ?? "",
    seo_description: initial?.seo_description ?? "",
    noindex: initial?.noindex ?? false,
    scheduled_at: initial?.scheduled_at ?? "",
  });
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => {
    const parsed = toEditorBlocks(initial?.content);
    return parsed.length ? parsed : [defaultBlock("text")];
  });

  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [slugManual, setSlugManual] = useState(!isNew);
  const [tagInput, setTagInput] = useState("");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dataRef = useRef(data);
  dataRef.current = data;
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const words = useMemo(() => wordCount(toContentBlocks(blocks)), [blocks]);
  const readMin = useMemo(() => readingTimeMinutes(toContentBlocks(blocks)), [blocks]);

  function set<K extends keyof PostData>(key: K, value: PostData[K]) {
    setDirty(true);
    setData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugManual) next.slug = slugify(String(value));
      return next;
    });
  }

  function patchBlock(uid: string, patch: Partial<EditorBlock>) {
    setDirty(true);
    setBlocks((prev) => prev.map((b) => (b.uid === uid ? { ...b, ...patch } : b)));
  }

  function addBlock(type: string, afterUid?: string) {
    setDirty(true);
    setBlocks((prev) => {
      const block = defaultBlock(type);
      if (!afterUid) return [...prev, block];
      const idx = prev.findIndex((b) => b.uid === afterUid);
      const next = [...prev];
      next.splice(idx + 1, 0, block);
      return next;
    });
  }

  function duplicateBlock(uid: string) {
    setDirty(true);
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.uid === uid);
      if (idx < 0) return prev;
      const copy: EditorBlock = JSON.parse(JSON.stringify(prev[idx]));
      copy.uid = newUid();
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function removeBlock(uid: string) {
    setDirty(true);
    setBlocks((prev) => prev.filter((b) => b.uid !== uid));
  }

  function moveBlock(uid: string, dir: -1 | 1) {
    setDirty(true);
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.uid === uid);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      return arrayMove(prev, idx, target);
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDirty(true);
    setBlocks((prev) => {
      const oldIdx = prev.findIndex((b) => b.uid === active.id);
      const newIdx = prev.findIndex((b) => b.uid === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  }

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,+$/, "");
    if (!tag) return;
    setDirty(true);
    setData((prev) => (prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  }

  const buildPayload = useCallback((status: "draft" | "published") => {
    const d = dataRef.current;
    return {
      ...(d.slug ? { slug: d.slug } : {}),
      title: d.title,
      excerpt: d.excerpt,
      content: toContentBlocks(blocksRef.current),
      featured_image: d.featured_image || null,
      og_image: d.og_image || null,
      author: d.author,
      category: d.category,
      tags: d.tags,
      status,
      seo_title: d.seo_title || null,
      seo_description: d.seo_description || null,
      noindex: d.noindex,
      scheduled_at: d.scheduled_at ? new Date(d.scheduled_at).toISOString() : null,
    };
  }, [isNew]);

  const doSave = useCallback(async (status: "draft" | "published", silent = false): Promise<boolean> => {
    if (!silent) setSaving(true);
    setError("");
    const url = isNew ? `/api/demo/${tenantSlug}/blog` : `/api/demo/${tenantSlug}/blog/${apiRef}`;
    try {
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(status)),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        if (!silent) setError(d.error ?? "Chyba při ukládání");
        return false;
      }
      setDirty(false);
      return true;
    } catch {
      if (!silent) setError("Nepodařilo se uložit");
      return false;
    } finally {
      if (!silent) setSaving(false);
    }
  }, [isNew, tenantSlug, apiRef, buildPayload]);

  async function handleSave(status: "draft" | "published") {
    const ok = await doSave(status, false);
    if (ok) {
      router.push(`/demo/${tenantSlug}/admin/blog`);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!postSlug || !confirm("Opravdu smazat tento článek? Tuto akci nelze vrátit.")) return;
    await fetch(`/api/demo/${tenantSlug}/blog/${apiRef}`, { method: "DELETE" });
    router.push(`/demo/${tenantSlug}/admin/blog`);
    router.refresh();
  }

  // Autosave existing posts
  useEffect(() => {
    if (isNew || !dirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const ok = await doSave(dataRef.current.status, true);
      if (ok) {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 4000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [data, blocks, isNew, dirty, doSave]);

  // Cmd/Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void doSave(dataRef.current.status, false).then((ok) => {
          if (ok) {
            setAutoSaved(true);
            setTimeout(() => setAutoSaved(false), 2000);
          }
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doSave]);

  const serpTitle = data.seo_title || data.title || "Název článku";
  const serpDesc = data.seo_description || data.excerpt || "Popis článku pro vyhledávače…";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 text-sm sticky top-0 z-30 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/demo/${tenantSlug}/admin/blog`} className="text-gray-400 hover:text-white flex items-center gap-1 flex-shrink-0">
            <ArrowLeft size={14} /> Články
          </Link>
          <span className="font-semibold truncate">{isNew ? "Nový článek" : data.title || "Upravit článek"}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
            data.status === "published" ? "bg-green-500/20 text-green-300" : "bg-gray-600/50 text-gray-300"
          }`}>
            {data.status === "published" ? "Publikováno" : "Koncept"}
          </span>
          {autoSaved && (
            <span className="text-green-400 text-xs flex items-center gap-1 flex-shrink-0">
              <Check size={12} /> Uloženo
            </span>
          )}
          {dirty && !autoSaved && !isNew && (
            <span className="text-gray-500 text-xs flex-shrink-0">Neuložené změny…</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden md:inline text-xs text-gray-400 mr-1">
            {words} slov · {readMin} min čtení
          </span>
          {!isNew && data.status === "published" && (
            <a
              href={`/demo/${tenantSlug}/blog/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              title="Zobrazit na webu"
            >
              <Eye size={15} />
            </a>
          )}
          {!isNew && (
            <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-gray-800" title="Smazat článek">
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-semibold hover:bg-gray-600 disabled:opacity-60"
          >
            Uložit koncept
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 disabled:opacity-60 flex items-center gap-1.5"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {saving ? "Ukládám…" : "Publikovat"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* ── Main column ───────────────────────────────────────────── */}
        <div className="space-y-5 min-w-0">
          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

          {/* Title */}
          <input
            type="text"
            value={data.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full px-4 py-3 text-2xl font-bold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-gray-300"
            placeholder="Název vašeho článku…"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-xs">/blog/</span>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => { setSlugManual(true); set("slug", slugify(e.target.value) || e.target.value); }}
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="url-clanku"
            />
            {isNew && (
              <button
                type="button"
                onClick={() => { setSlugManual(false); set("slug", slugify(data.title)); }}
                className="text-xs text-violet-600 hover:underline flex-shrink-0"
              >
                auto
              </button>
            )}
          </div>

          {/* Excerpt */}
          <textarea
            value={data.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none placeholder:text-gray-300"
            placeholder="Perex — krátký úvod, který se zobrazí v přehledu a ve vyhledávačích…"
          />

          {/* Blocks */}
          <div>
            <p className={labelCls}>Obsah článku</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={blocks.map((b) => b.uid)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {blocks.map((block, i) => (
                    <BlockCard
                      key={block.uid}
                      block={block}
                      tenantSlug={tenantSlug}
                      isFirst={i === 0}
                      isLast={i === blocks.length - 1}
                      onChange={(patch) => patchBlock(block.uid, patch)}
                      onDuplicate={() => duplicateBlock(block.uid)}
                      onRemove={() => removeBlock(block.uid)}
                      onMove={(dir) => moveBlock(block.uid, dir)}
                      onInsertAfter={() => addBlock("text", block.uid)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add-block palette */}
            <div className="flex flex-wrap gap-2 mt-4 p-3 bg-white rounded-xl border border-gray-200">
              {Object.keys(BLOCK_LABELS).map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-colors flex items-center gap-1.5"
                >
                  {BLOCK_ICONS[type]} {BLOCK_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-5 lg:sticky lg:top-16">
          {/* Publishing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <CalendarClock size={15} className="text-violet-600" /> Publikace
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Autor</label>
                <input type="text" value={data.author} onChange={(e) => set("author", e.target.value)} className={inputCls} placeholder="Jméno" />
              </div>
              <div>
                <label className={labelCls}>Kategorie</label>
                <input type="text" value={data.category} onChange={(e) => set("category", e.target.value)} className={inputCls} placeholder="Tipy…" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Štítky</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => { setDirty(true); setData((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) })); }}
                      className="hover:text-violet-900"
                      aria-label={`Odebrat štítek ${tag}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.endsWith(",")) addTag(v);
                  else setTagInput(v);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                onBlur={() => addTag(tagInput)}
                className={inputCls}
                placeholder="Napište štítek a Enter"
              />
            </div>
            <div>
              <label className={labelCls}>Naplánované publikování</label>
              <input
                type="datetime-local"
                value={data.scheduled_at}
                onChange={(e) => set("scheduled_at", e.target.value)}
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 mt-1">Koncept se v tento čas publikuje automaticky.</p>
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm font-bold text-gray-800 mb-3">Hlavní obrázek</p>
            <ImageField tenantSlug={tenantSlug} value={data.featured_image} onChange={(url) => set("featured_image", url)} />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Search size={15} className="text-violet-600" /> SEO
            </p>

            {/* SERP preview */}
            <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50">
              <p className="text-[11px] text-gray-400 mb-1 truncate">
                www.vase-domena.cz › blog › {data.slug || "url-clanku"}
              </p>
              <p className="text-[15px] leading-snug text-blue-700 font-medium line-clamp-1">{serpTitle}</p>
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{serpDesc}</p>
            </div>

            <div>
              <label className={labelCls}>
                SEO titulek{" "}
                <span className={data.seo_title.length > 60 ? "text-orange-500" : "text-gray-400"}>
                  ({data.seo_title.length}/60)
                </span>
              </label>
              <input
                type="text"
                value={data.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                className={`${inputCls} ${data.seo_title.length > 60 ? "border-orange-300" : ""}`}
                placeholder={data.title || "SEO titulek"}
              />
            </div>
            <div>
              <label className={labelCls}>
                SEO popis{" "}
                <span className={data.seo_description.length > 160 ? "text-orange-500" : "text-gray-400"}>
                  ({data.seo_description.length}/160)
                </span>
              </label>
              <textarea
                value={data.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                rows={3}
                className={`${inputCls} resize-none ${data.seo_description.length > 160 ? "border-orange-300" : ""}`}
                placeholder={data.excerpt || "Popis pro vyhledávače"}
              />
            </div>
            <div>
              <label className={labelCls}>OG obrázek pro sociální sítě (volitelné)</label>
              <ImageField tenantSlug={tenantSlug} value={data.og_image} onChange={(url) => set("og_image", url)} compact />
              <p className="text-[11px] text-gray-400 mt-1">Když není nastaven, použije se hlavní obrázek.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.noindex}
                onChange={(e) => set("noindex", e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span className="text-sm text-gray-700">Nezařazovat do vyhledávačů (noindex)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
