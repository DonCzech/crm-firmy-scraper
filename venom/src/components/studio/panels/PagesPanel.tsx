"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, Trash2, ExternalLink, Loader2, Check } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

/**
 * F2 Sprint 3 — multi-page editor.
 *
 * Lists tenant pages from /api/demo/:slug/pages, supports create + delete +
 * basic SEO override. Switching active page reloads the studio iframe path
 * (per-page sections are loaded server-side on /demo/:slug/<page-slug>/studio
 * — currently studio renders homepage only, switching pages opens a new tab
 * on the public view so users can quickly verify).
 */
interface PageRow {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  noindex: boolean | null;
  sections_count: number;
}

export function PagesPanel({ state }: { state: StudioState }) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/pages`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { pages: PageRow[] };
      setPages(json.pages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }, [state.tenant.slug]);

  useEffect(() => { void reload(); }, [reload]);

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    const slug = newSlug.trim();
    const title = newTitle.trim();
    if (!slug || !title) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/pages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setNewSlug("");
      setNewTitle("");
      setCreating(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vytvoření selhalo");
    } finally {
      setBusy(false);
    }
  }

  async function deletePage(p: PageRow) {
    if (!confirm(`Smazat stránku "${p.title}"? Tuto akci nelze vrátit.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/pages/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Smazání selhalo");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: PageRow) {
    if (p.is_homepage) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/pages/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: p.status === "published" ? "draft" : "published" }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Změna stavu selhala");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Error banner */}
      {error && (
        <div className="shrink-0 border-b border-red-500/30 bg-red-500/5 px-3 py-1.5 text-[10.5px] text-red-300">
          {error}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-[11px] text-[#71717a]">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Načítám…
          </div>
        ) : pages.length === 0 ? (
          <div className="px-2 py-4 text-[11px] text-[#71717a]">Žádné stránky.</div>
        ) : (
          pages.map((p) => (
            <div
              key={p.id}
              className={`mb-1.5 rounded-md border px-2.5 py-2 transition-colors ${
                p.id === state.page.id
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-[#27272a] bg-[#1a1a1c] hover:border-[#3f3f46]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (p.id === state.page.id) return;
                  const url = p.slug === "home"
                    ? `/demo/${state.tenant.slug}/studio`
                    : `/demo/${state.tenant.slug}/studio?page=${encodeURIComponent(p.slug)}`;
                  window.location.href = url;
                }}
                className="flex w-full items-center gap-1.5 text-left disabled:cursor-default"
                disabled={p.id === state.page.id}
                title={p.id === state.page.id ? "Tato stránka se právě edituje" : `Editovat ${p.title}`}
              >
                <FileText className="h-3 w-3 text-[#a1a1aa]" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-white">{p.title}</div>
                  <div className="truncate text-[10px] text-[#71717a]">
                    /{p.slug === "home" ? "" : p.slug} · {p.sections_count} sekcí
                  </div>
                </div>
                {p.is_homepage && (
                  <span className="rounded bg-blue-500/15 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-blue-300">
                    home
                  </span>
                )}
                {!p.is_homepage && p.status === "draft" && (
                  <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-300">
                    koncept
                  </span>
                )}
              </button>
              <div className="mt-1.5 flex items-center gap-1">
                <a
                  href={`/demo/${state.tenant.slug}${p.slug === "home" ? "" : `/${p.slug}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
                  title="Otevřít náhled v novém okně"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  Náhled
                </a>
                {!p.is_homepage && (
                  <>
                    <button
                      type="button"
                      onClick={() => togglePublish(p)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white disabled:opacity-50"
                    >
                      <Check className="h-2.5 w-2.5" />
                      {p.status === "published" ? "Skrýt" : "Publikovat"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePage(p)}
                      disabled={busy}
                      className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-[#a1a1aa] hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      Smazat
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {/* Create form */}
        {creating ? (
          <form onSubmit={createPage} className="mt-3 rounded-md border border-[#27272a] bg-[#1a1a1c] p-2.5">
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[#a1a1aa]">
              Název stránky
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="O nás"
                autoFocus
                className="mt-1 h-7 w-full rounded border border-[#27272a] bg-[#0f0f10] px-2 text-[11px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block text-[10px] font-medium uppercase tracking-wide text-[#a1a1aa]">
              URL slug
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="o-nas"
                pattern="[a-z0-9-]+"
                className="mt-1 h-7 w-full rounded border border-[#27272a] bg-[#0f0f10] px-2 text-[11px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
              />
            </label>
            <div className="mt-2 flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => { setCreating(false); setNewSlug(""); setNewTitle(""); }}
                className="rounded px-2 py-1 text-[10.5px] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={busy || !newSlug || !newTitle}
                className="rounded bg-blue-600 px-2 py-1 text-[10.5px] font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {busy ? "Vytvářím…" : "Vytvořit"}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#3f3f46] px-2.5 py-2 text-[11px] text-[#a1a1aa] hover:border-blue-500/50 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Nová stránka
          </button>
        )}
      </div>

      {/* Footer info */}
      <div className="shrink-0 border-t border-[#27272a] px-3 py-1.5 text-[10.5px] text-[#52525b]">
        {pages.length} {pages.length === 1 ? "stránka" : pages.length < 5 ? "stránky" : "stránek"}
      </div>
    </div>
  );
}
