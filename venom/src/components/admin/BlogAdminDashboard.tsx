"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export interface AdminPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string | null;
  reading_time_min: number | null;
}

interface Props {
  tenantSlug: string;
  initialPosts: AdminPost[];
}

type StatusFilter = "all" | "published" | "draft" | "scheduled";

function fmt(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" });
}

export function BlogAdminDashboard({ tenantSlug, initialPosts }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const isScheduled = (p: AdminPost) =>
    p.status === "draft" && Boolean(p.scheduled_at) && new Date(p.scheduled_at as string) > new Date();

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft" && !isScheduled(p)).length,
      scheduled: posts.filter(isScheduled).length,
    }),
    [posts]
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter === "published" && p.status !== "published") return false;
      if (filter === "draft" && (p.status !== "draft" || isScheduled(p))) return false;
      if (filter === "scheduled" && !isScheduled(p)) return false;
      if (!needle) return true;
      return (
        p.title.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle) ||
        (p.category ?? "").toLowerCase().includes(needle) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [posts, q, filter]);

  async function api(path: string, init?: RequestInit): Promise<boolean> {
    setError("");
    try {
      const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Operace se nezdařila");
        return false;
      }
      return true;
    } catch {
      setError("Síťová chyba");
      return false;
    }
  }

  async function toggleStatus(post: AdminPost) {
    setBusyId(post.id);
    const nextStatus = post.status === "published" ? "draft" : "published";
    const ok = await api(`/api/demo/${tenantSlug}/blog/${post.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    if (ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: nextStatus, published_at: nextStatus === "published" ? new Date().toISOString() : p.published_at }
            : p
        )
      );
    }
    setBusyId(null);
  }

  async function duplicate(post: AdminPost) {
    setBusyId(post.id);
    const res = await fetch(`/api/demo/${tenantSlug}/blog/${post.slug}/duplicate`, { method: "POST" });
    if (res.ok) {
      const d = (await res.json()) as { slug: string };
      router.push(`/demo/${tenantSlug}/admin/blog/${d.slug}`);
      return;
    }
    setError("Duplikace se nezdařila");
    setBusyId(null);
  }

  async function remove(post: AdminPost) {
    if (!confirm(`Opravdu smazat článek „${post.title}“? Tuto akci nelze vrátit.`)) return;
    setBusyId(post.id);
    const ok = await api(`/api/demo/${tenantSlug}/blog/${post.id}`, { method: "DELETE" });
    if (ok) setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setBusyId(null);
  }

  const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Vše", count: stats.total },
    { key: "published", label: "Publikováno", count: stats.published },
    { key: "draft", label: "Koncepty", count: stats.draft },
    { key: "scheduled", label: "Naplánováno", count: stats.scheduled },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 text-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href={`/demo/${tenantSlug}/admin`} className="text-gray-400 hover:text-white transition-colors">← Editor</Link>
          <span className="font-semibold">Blog</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/demo/${tenantSlug}/blog/rss.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            RSS
          </a>
          <a
            href={`/demo/${tenantSlug}/blog`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Veřejný blog ↗
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Články</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {stats.published} publikováno · {stats.draft} konceptů{stats.scheduled ? ` · ${stats.scheduled} naplánováno` : ""}
            </p>
          </div>
          <Link
            href={`/demo/${tenantSlug}/admin/blog/new`}
            className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm text-center"
          >
            + Nový článek
          </Link>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" aria-hidden>⌕</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hledat podle názvu, slugu, kategorie nebo štítku…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {filterTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label} <span className="opacity-50">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-3xl mb-3" aria-hidden>✎</p>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {posts.length === 0 ? "Zatím žádné články" : "Nic nenalezeno"}
            </p>
            <p className="text-sm text-gray-400">
              {posts.length === 0 ? "Začněte psát první článek pro váš blog." : "Zkuste upravit hledání nebo filtr."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((post) => {
              const scheduled = isScheduled(post);
              const busy = busyId === post.id;
              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 transition-opacity ${busy ? "opacity-60" : ""}`}
                >
                  {/* Thumb */}
                  <Link
                    href={`/demo/${tenantSlug}/admin/blog/${post.slug}`}
                    className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 hidden sm:block"
                  >
                    {post.featured_image ? (
                      <Image src={post.featured_image} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold text-lg">
                        {post.title.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/demo/${tenantSlug}/admin/blog/${post.slug}`} className="font-semibold text-gray-900 truncate block hover:text-violet-700 transition-colors">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      /{post.slug}
                      {post.category ? ` · ${post.category}` : ""}
                      {post.reading_time_min ? ` · ${post.reading_time_min} min` : ""}
                      {" · "}
                      {post.status === "published" ? `publikováno ${fmt(post.published_at)}` : scheduled ? `naplánováno na ${fmt(post.scheduled_at)}` : `upraveno ${fmt(post.updated_at ?? post.created_at)}`}
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${
                      post.status === "published"
                        ? "bg-green-100 text-green-700"
                        : scheduled
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {post.status === "published" ? "Publikováno" : scheduled ? "Naplánováno" : "Koncept"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {post.status === "published" && (
                      <a
                        href={`/demo/${tenantSlug}/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Zobrazit na webu"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      >
                        ↗
                      </a>
                    )}
                    <button
                      onClick={() => toggleStatus(post)}
                      disabled={busy}
                      title={post.status === "published" ? "Přepnout na koncept" : "Publikovat"}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      {post.status === "published" ? "◎" : "▲"}
                    </button>
                    <button
                      onClick={() => duplicate(post)}
                      disabled={busy}
                      title="Duplikovat"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => remove(post)}
                      disabled={busy}
                      title="Smazat"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      ✕
                    </button>
                    <Link
                      href={`/demo/${tenantSlug}/admin/blog/${post.slug}`}
                      className="ml-1 px-3.5 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Upravit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
