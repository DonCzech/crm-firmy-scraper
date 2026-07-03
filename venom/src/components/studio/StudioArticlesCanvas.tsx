"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft, Settings, Folder, Undo2, Redo2, Plus, Upload,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
} from "@/components/studio/icons";
import { useStudio } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";

interface BlogPost {
  id: number;
  title: string;
  status: string;
  slug: string;
  excerpt: string | null;
  annotation: string | null;
  allow_indexing: boolean | null;
  noindex: boolean | null;
  created_at: string;
  updated_at: string;
}

// ── Empty state illustration ───────────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <div className="w-full max-w-[280px] rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(24,24,27,0.68)] shadow-[0_18px_48px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl p-4">
      {[0.75, 0.55, 0.65].map((w, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="h-7 w-7 rounded-full bg-[var(--vs-surface-3)] shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-2 rounded bg-[var(--vs-surface-3)]" style={{ width: `${w * 100}%` }} />
            <div className="h-2 rounded bg-[var(--vs-surface-3)]" style={{ width: `${w * 60}%` }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-[var(--vs-accent-bg)] text-[var(--vs-accent)] flex items-center justify-center shrink-0">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
        <div className="h-2 rounded bg-[var(--vs-surface-3)] w-1/2" />
      </div>
    </div>
  );
}

// ── Toolbar button helper ──────────────────────────────────────────────────────

function ToolbarBtn({ onMouseDown, children }: { onMouseDown: (e: React.MouseEvent) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      className="flex h-6 w-6 items-center justify-center rounded text-white hover:bg-[var(--vs-surface-2)] transition-colors"
    >
      {children}
    </button>
  );
}

// ── List mode ─────────────────────────────────────────────────────────────────

function ListMode({ state, posts, loading, onNewArticle }: {
  state: StudioState;
  posts: BlogPost[];
  loading: boolean;
  onNewArticle: () => void;
}) {
  const studio = useStudio();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--vs-border)] border-t-[var(--vs-accent)] animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <EmptyIllustration />
        <p className="text-[14px] text-[var(--vs-text-muted)] text-center max-w-sm mt-6 leading-relaxed">
          Vytvořte si svůj první článek. Zajímavý a inspirativní obsah vám pomůže získat nové zákazníky.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onNewArticle}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nový článek
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--vs-border-strong)] px-4 py-2 text-[13.5px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            Import
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 pt-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-[var(--vs-text)]">Články ({posts.length})</h2>
        <button
          type="button"
          onClick={onNewArticle}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nový článek
        </button>
      </div>

      <div className="rounded-xl border border-[var(--vs-border)] overflow-hidden">
        {posts.map((post, idx) => (
          <button
            key={post.id}
            type="button"
            onClick={() => { studio.setCurrentArticleId(post.id); studio.setArticleMode("editor"); }}
            className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[var(--vs-surface-2)] transition-colors group ${idx > 0 ? "border-t border-[var(--vs-border)]" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[var(--vs-text)] truncate">
                {post.title || "Bez názvu"}
              </p>
              <p className="text-[12px] text-[var(--vs-text-dim)] mt-0.5">
                {new Date(post.created_at).toLocaleDateString("cs-CZ")}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              post.status === "published"
                ? "bg-[var(--vs-success-bg)] text-[var(--vs-success)]"
                : "bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)]"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {post.status === "published" ? "Publikováno" : "Koncept"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Editor mode ───────────────────────────────────────────────────────────────

function EditorMode({ state, post, onRefresh }: {
  state: StudioState;
  post: BlogPost | null;
  onRefresh: () => void;
}) {
  const studio = useStudio();
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize editor content once
  useEffect(() => {
    if (editorRef.current && post?.excerpt) {
      editorRef.current.innerHTML = post.excerpt;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  // Sync title from post
  useEffect(() => {
    setTitle(post?.title ?? "");
  }, [post?.title]);

  const debouncedSave = useCallback((newTitle: string, content: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!studio.currentArticleId) return;
      await fetch(`/api/demo/${state.tenant.slug}/blog/${studio.currentArticleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content }),
      });
    }, 1200);
  }, [studio.currentArticleId, state.tenant.slug]);

  const handleInput = useCallback(() => {
    const content = editorRef.current?.innerHTML ?? "";
    debouncedSave(title, content);
  }, [title, debouncedSave]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    debouncedSave(val, editorRef.current?.innerHTML ?? "");
  };

  // Floating toolbar on selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setShowToolbar(false);
        return;
      }
      // Check that selection is inside our editor
      if (!editorRef.current) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) {
        setShowToolbar(false);
        return;
      }
      const rect = range.getBoundingClientRect();
      setToolbarPos({ top: rect.top, left: rect.left + rect.width / 2 });
      setShowToolbar(true);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handlePublish = async () => {
    if (!studio.currentArticleId) return;
    await fetch(`/api/demo/${state.tenant.slug}/blog/${studio.currentArticleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    onRefresh();
  };

  const handlePublishUpdate = async () => {
    if (!studio.currentArticleId) return;
    const content = editorRef.current?.innerHTML ?? "";
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await fetch(`/api/demo/${state.tenant.slug}/blog/${studio.currentArticleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, status: "published" }),
    });
    onRefresh();
  };

  const indexing = post?.allow_indexing ?? false;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(255,255,255,0.09)] bg-[rgba(18,18,20,0.78)] px-6 py-3 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.16)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => studio.setArticleMode("list")}
            className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors"
          >
            <ArrowLeft size={16} /> Obsah
          </button>
          <div className="h-4 w-px bg-[var(--vs-surface-3)] mx-1" />
          <button
            type="button"
            className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors"
          >
            <Settings size={14} /> Nastavení
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--vs-text-dim)]">
            <Folder size={13} /> <span>Šablony / Články: Záhlaví</span>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
            indexing ? "bg-[var(--vs-success-bg)] text-[var(--vs-success)]" : "bg-red-500 text-white"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {indexing ? "Indexing" : "Not indexing"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-dim)] hover:text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-dim)] hover:text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            <Redo2 size={16} />
          </button>
          <div className="w-px h-4 bg-[var(--vs-surface-3)]" />
          <button
            type="button"
            onClick={handlePublish}
            className="bg-[var(--vs-accent)] text-white rounded-lg px-4 py-1.5 text-[13px] font-semibold hover:bg-[var(--vs-accent-solid)] transition-colors"
          >
            Publikovat
          </button>
          <button
            type="button"
            onClick={handlePublishUpdate}
            className="border border-[var(--vs-border-strong)] text-[var(--vs-text-soft)] rounded-lg px-3 py-1.5 text-[13px] hover:bg-[var(--vs-surface-2)] transition-colors"
          >
            Publikovat a aktualizovat
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto vs-canvas-deep">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-20">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Název článku"
            className="w-full border-0 outline-none text-[36px] font-bold text-[var(--vs-text)] placeholder-[var(--vs-text-disabled)] bg-transparent leading-tight mb-6"
          />
          <div className="border-b border-[var(--vs-border)] mb-6" />

          {/* Inline style for placeholder pseudo-element */}
          <style>{`
            [data-article-editor]:empty:before {
              content: attr(data-placeholder);
              color: #d1d5db;
              pointer-events: none;
            }
          `}</style>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            data-article-editor
            data-placeholder="Začněte psát zde..."
            className="min-h-[400px] text-[16px] text-[var(--vs-text-soft)] outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Floating toolbar */}
      {showToolbar && (
        <div
          style={{
            position: "fixed",
            top: toolbarPos.top,
            left: toolbarPos.left,
            transform: "translate(-50%, -100%) translateY(-8px)",
            zIndex: 1000,
          }}
          className="flex items-center gap-0.5 rounded-lg bg-[var(--vs-surface-3)] px-2 py-1.5 shadow-[var(--vs-shadow-lg)] ring-1 ring-[var(--vs-border-strong)]"
        >
          <select
            onChange={(e) => execCmd("formatBlock", e.target.value)}
            className="bg-transparent text-white text-[12px] border-0 outline-none mr-1 cursor-pointer"
            defaultValue="p"
          >
            <option value="p">Text</option>
            <option value="h1">Nadpis 1</option>
            <option value="h2">Nadpis 2</option>
            <option value="h3">Nadpis 3</option>
          </select>
          <div className="w-px h-4 bg-[var(--vs-border-strong)] mx-0.5" />
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("bold"); }}>
            <Bold size={14} />
          </ToolbarBtn>
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("italic"); }}>
            <Italic size={14} />
          </ToolbarBtn>
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("underline"); }}>
            <Underline size={14} />
          </ToolbarBtn>
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("strikeThrough"); }}>
            <Strikethrough size={14} />
          </ToolbarBtn>
          <div className="w-px h-4 bg-[var(--vs-border-strong)] mx-0.5" />
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("justifyLeft"); }}>
            <AlignLeft size={14} />
          </ToolbarBtn>
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("justifyCenter"); }}>
            <AlignCenter size={14} />
          </ToolbarBtn>
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("justifyRight"); }}>
            <AlignRight size={14} />
          </ToolbarBtn>
          <div className="w-px h-4 bg-[var(--vs-border-strong)] mx-0.5" />
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("insertUnorderedList"); }}>
            <List size={14} />
          </ToolbarBtn>
          <ToolbarBtn onMouseDown={(e) => { e.preventDefault(); document.execCommand("insertOrderedList"); }}>
            <ListOrdered size={14} />
          </ToolbarBtn>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function StudioArticlesCanvas({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/demo/${state.tenant.slug}/blog`);
      const data = (await res.json()) as { posts?: BlogPost[] };
      setPosts(data.posts ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [state.tenant.slug]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Fetch the specific post when in editor mode
  useEffect(() => {
    if (studio.articleMode !== "editor" || !studio.currentArticleId) {
      setCurrentPost(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/demo/${state.tenant.slug}/blog/${studio.currentArticleId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCurrentPost((data as { post?: BlogPost }).post ?? null);
      })
      .catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [studio.articleMode, studio.currentArticleId, state.tenant.slug]);

  const handleNewArticle = async () => {
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: `clanek-${Date.now()}`,
          title: "Nový článek",
          content: [],
          status: "draft",
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: number };
        if (data.id) {
          await fetchPosts();
          studio.setCurrentArticleId(data.id);
          studio.setArticleMode("editor");
        }
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="h-full overflow-y-auto vs-canvas-deep">
      {studio.articleMode === "editor" ? (
        <EditorMode
          state={state}
          post={currentPost}
          onRefresh={fetchPosts}
        />
      ) : (
        <ListMode
          state={state}
          posts={posts}
          loading={loading}
          onNewArticle={handleNewArticle}
        />
      )}
    </div>
  );
}
