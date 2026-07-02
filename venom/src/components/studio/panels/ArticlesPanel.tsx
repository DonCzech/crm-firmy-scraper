"use client";

import { useEffect, useState } from "react";
import {
  Plus, Upload, AlignLeft, FileText, FolderOpen, Tag, Calendar,
  User, Clock, Image as ImageIcon, Type, ClipboardList, Square, ArrowLeft,
} from "@/components/studio/icons";
import { useStudio } from "../StudioContext";
import { SkeletonRows } from "../ui";
import type { StudioState } from "../TenantStudioView";

interface BlogPost {
  id: number;
  title: string;
  status: string;
  annotation: string | null;
  created_at: string;
  updated_at: string;
}

function SmallIllustration() {
  return (
    <div className="w-24 h-20 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] flex flex-col gap-1.5 p-3">
      {[0.7, 0.5, 0.6].map((w, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-full bg-[var(--vs-border-strong)] shrink-0" />
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="h-1 rounded-full bg-[var(--vs-border-strong)]" style={{ width: `${w * 100}%` }} />
            <div className="h-1 rounded-full bg-[var(--vs-border-strong)]" style={{ width: `${w * 65}%` }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="h-3.5 w-3.5 rounded-full bg-[rgba(212,212,216,0.4)] shrink-0 flex items-center justify-center">
          <Plus className="h-2 w-2 text-[var(--vs-accent-hi)]" strokeWidth={2.5} />
        </div>
        <div className="h-1 rounded-full bg-[rgba(212,212,216,0.4)]" style={{ width: "60%" }} />
      </div>
    </div>
  );
}

const TILE_SECTION_BLOG = [
  { icon: Type,          label: "Název" },
  { icon: AlignLeft,     label: "Anotace" },
  { icon: FileText,      label: "Popis" },
  { icon: FolderOpen,    label: "Kategorie" },
  { icon: Tag,           label: "Tagy" },
  { icon: Calendar,      label: "Vytvořeno" },
  { icon: User,          label: "Autor" },
  { icon: Clock,         label: "Doba čtení" },
];

const TILE_SECTION_OSTATNI = [
  { icon: Type,          label: "Text" },
  { icon: ClipboardList, label: "Formulář" },
  { icon: ImageIcon,     label: "Obrázek" },
  { icon: Square,        label: "Box" },
];

function EditorMode({ state }: { state: StudioState }) {
  const studio = useStudio();

  return (
    <div className="vs-enter flex-1 overflow-y-auto vs-scroll">
      {/* Back button */}
      <button
        type="button"
        onClick={() => studio.setArticleMode("list")}
        className="flex items-center gap-1.5 w-full px-4 py-3 text-[12.5px] text-[var(--vs-text-dim)] hover:text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors border-b border-[var(--vs-border)]"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        Obsah
      </button>

      <div className="px-3 pt-4 pb-2">
        {/* BLOG section */}
        <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--vs-text-dim)] mb-2 px-1">
          BLOG
        </p>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {TILE_SECTION_BLOG.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="rounded-lg bg-[var(--vs-surface-2)] hover:bg-[var(--vs-surface-3)] p-2 flex items-center gap-2 cursor-pointer text-[12px] text-[var(--vs-text-soft)] transition-colors"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--vs-text-dim)]" strokeWidth={1.75} />
              {label}
            </button>
          ))}
          {/* Galerie záznamu — full width */}
          <button
            type="button"
            className="col-span-2 rounded-lg bg-[var(--vs-surface-2)] hover:bg-[var(--vs-surface-3)] p-2 flex items-center gap-2 cursor-pointer text-[12px] text-[var(--vs-text-soft)] transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[var(--vs-text-dim)]" strokeWidth={1.75} />
            Galerie záznamu
          </button>
        </div>

        {/* OSTATNÍ section */}
        <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--vs-text-dim)] mb-2 px-1">
          OSTATNÍ
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {TILE_SECTION_OSTATNI.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="rounded-lg bg-[var(--vs-surface-2)] hover:bg-[var(--vs-surface-3)] p-2 flex items-center gap-2 cursor-pointer text-[12px] text-[var(--vs-text-soft)] transition-colors"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--vs-text-dim)]" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArticlesPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/demo/${state.tenant.slug}/blog`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setPosts((data as { posts?: BlogPost[] }).posts ?? []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [state.tenant.slug]);

  if (studio.articleMode === "editor") {
    return <EditorMode state={state} />;
  }

  // List mode
  const handleNewArticle = async () => {
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: `clanek-${Date.now()}`, title: "Nový článek", content: [], status: "draft" }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: number };
        if (data.id) {
          studio.setCurrentArticleId(data.id);
          studio.setArticleMode("editor");
        }
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="vs-enter flex-1 overflow-y-auto vs-scroll">
      {loading ? (
        <SkeletonRows rows={5} />
      ) : posts.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-full min-h-[320px] px-6 text-center gap-5">
          <SmallIllustration />
          <p className="text-[12.5px] text-[var(--vs-text-muted)] leading-relaxed max-w-[200px]">
            Vytvořte si svůj první článek. Zajímavý a inspirativní obsah vám pomůže získat nové zákazníky.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNewArticle}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--vs-accent)] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Nový článek
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] px-3 py-1.5 text-[12px] font-medium text-[var(--vs-text-soft)] hover:text-[var(--vs-text)] hover:border-[var(--vs-text-muted)] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
              Import
            </button>
          </div>
        </div>
      ) : (
        /* Articles list */
        <div className="py-2">
          <div className="flex items-center justify-between px-4 pb-2">
            <button
              type="button"
              onClick={handleNewArticle}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--vs-accent)] px-2.5 py-1.5 text-[11.5px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] transition-colors"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Nový
            </button>
          </div>
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => { studio.setCurrentArticleId(post.id); studio.setArticleMode("editor"); }}
              className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-[var(--vs-surface-2)] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-[var(--vs-text)] font-medium truncate leading-snug">
                  {post.title || "Bez názvu"}
                </p>
                <p className="text-[11px] text-[var(--vs-text-dim)] mt-0.5">
                  {post.status === "published" ? "Publikováno" : "Koncept"}
                </p>
              </div>
              <span className={`shrink-0 mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                post.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}>
                {post.status === "published" ? "✓" : "•"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
