"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { useApi, apiDelete } from "@/lib/useApi";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  status: string;
  tags: string[];
  coverImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null } | null;
};

type BlogResponse = {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
};

const STATUS_BADGE: Record<string, { label: string; dot: string; bg: string }> = {
  DRAFT: { label: "Koncept", dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-2)]" },
  PUBLISHED: { label: "Publikovano", dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]", bg: "bg-emerald-500/10 text-emerald-400" },
  ARCHIVED: { label: "Archiv", dot: "bg-[var(--a-text-3)]", bg: "bg-[var(--a-surface)] text-[var(--a-text-3)]" },
};

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [contextMenu, setContextMenu] = useState<string | null>(null);

  const params = new URLSearchParams();
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  if (search) params.set("q", search);

  const { data, loading, refetch } = useApi<BlogResponse>(`/api/admin/blog?${params}`);

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat tento clanek?")) return;
    const { error } = await apiDelete(`/api/admin/blog/${id}`);
    if (!error) refetch();
  }

  const posts = data?.posts || [];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[32px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">
            {data?.total ?? "-"}
          </span>
          <span className="text-[14px] text-[var(--a-text-3)]">clanku</span>
        </div>
        <Link
          href="/admin/blog/novy"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl"
        >
          <Plus size={14} /> Novy clanek
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat clanky..."
            className="h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent pl-10 pr-4 text-[12.5px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[11.5px] font-semibold transition-all duration-300 ${
                statusFilter === s
                  ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                  : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text-2)]"
              }`}
            >
              {s !== "ALL" && STATUS_BADGE[s] && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_BADGE[s].dot}`} />}
              {s === "ALL" ? "Vse" : STATUS_BADGE[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      )}

      {/* Posts grid */}
      {!loading && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const badge = STATUS_BADGE[post.status] || STATUS_BADGE.DRAFT;
            return (
              <article
                key={post.id}
                className="glass-card group overflow-hidden rounded-2xl transition-all duration-300"
              >
                <div className="relative aspect-[2/1] overflow-hidden bg-[var(--a-surface-2)]">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--a-text-3)] text-[11px]">Bez obrazku</div>
                  )}
                  <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${badge.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                  <div className="relative float-right mr-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setContextMenu(contextMenu === post.id ? null : post.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/70 group-hover:opacity-100"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {contextMenu === post.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setContextMenu(null)} />
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] py-1 shadow-2xl backdrop-blur-xl">
                          <Link href={`/admin/blog/${post.id}`} className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-[var(--a-text-2)] hover-row hover:text-[var(--a-text)]" onClick={() => setContextMenu(null)}>
                            <Pencil size={13} /> Upravit
                          </Link>
                          <div className="my-1 border-t border-[var(--a-border)]" />
                          <button
                            onClick={() => { setContextMenu(null); handleDelete(post.id); }}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] text-red-400 hover:bg-red-500/[0.06]"
                          >
                            <Trash2 size={13} /> Smazat
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-2.5 flex flex-wrap gap-1.5">
                    {post.tags?.map((t) => (
                      <span key={t} className="rounded-md bg-[var(--a-surface-2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--a-text-3)]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-[15px] font-semibold leading-snug text-[var(--a-text)]">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--a-text-2)]">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3 border-t border-[var(--a-border)] pt-3 text-[11px] text-[var(--a-text-3)]">
                    <span className="flex items-center gap-1">
                      <User size={11} /> {post.author?.name || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString("cs-CZ")}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
          {posts.length === 0 && (
            <div className="col-span-full py-12 text-center text-[14px] text-[var(--a-text-3)]">
              Zadne clanky
            </div>
          )}
        </div>
      )}
    </div>
  );
}
