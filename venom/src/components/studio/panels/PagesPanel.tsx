"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus, Home, ChevronUp, Loader2, Search, GripVertical,
  Settings2, Trash2, FileText, Link, Anchor, BookOpen,
  Calendar, Library, X,
} from "lucide-react";
import { useStudio } from "../StudioContext";
import type { StudioState } from "../TenantStudioView";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  is_homepage: boolean;
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  noindex: boolean | null;
  sections_count: number;
}

/**
 * Slugify Czech (and any) title into a URL-safe slug.
 *  - normalises NFKD so combining diacritics can be stripped
 *  - strips diacritics + special punctuation
 *  - lowercases, collapses runs to single hyphen, trims hyphens at edges
 *  - empty result falls back to "stranka"
 */
function slugify(input: string): string {
  if (!input) return "";
  const stripped = input
    .normalize("NFKD")
    // Remove combining marks (Unicode "Mn" category) — works for áčďéěíňóřšťúůýž etc.
    .replace(/\p{M}+/gu, "")
    // Common Czech custom transliterations that NFKD doesn't split (e.g. ß, đ, ø).
    .replace(/ß/g, "ss")
    .replace(/đ|Đ/g, "d")
    .replace(/ø|Ø/g, "o")
    .replace(/ł|Ł/g, "l")
    .replace(/æ|Æ/g, "ae")
    .toLowerCase();
  const slug = stripped
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "stranka";
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1.5 opacity-30 shrink-0">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

/* ── Add-page dropdown items ─────────────────────────────────────────────── */
const ADD_OPTIONS = [
  { type: "empty",   label: "Prázdná stránka",      Icon: FileText },
  { type: "library", label: "Stránka z knihovny...", Icon: Library },
  { type: "link",    label: "Odkaz",                 Icon: Link },
  { type: "anchor",  label: "Kotva",                 Icon: Anchor },
  { type: "blog",    label: "Blog",                  Icon: BookOpen },
  { type: "events",  label: "Události",              Icon: Calendar },
];

/* ── Page settings full-screen editor ────────────────────────────────────── */
/**
 * Renders a right-side overlay matching the design-spec `Home.pdf`:
 *  - Light theme on top of the studio (covers from the right-panel onwards)
 *  - Header bar: gear "Nastavení" (left) + blue "Uložit" (right)
 *  - Body: large page title, green "Zobrazit" toggle (= status: published),
 *    arrow nav between sibling pages, X close
 *  - Two-column form: field on the left, help text on the right
 *  - Fields: Název stránky*, Titulek (SEO), URL adresa, Popis (SEO description),
 *    Open Graph titulek (OG:Title), Open Graph popisek (OG:Description)
 */
function PageSettingsEditor({
  page,
  pages,
  tenantSlug,
  onClose,
  onSaved,
  onNavigate,
}: {
  page: PageRow;
  pages: PageRow[];
  tenantSlug: string;
  onClose: () => void;
  onSaved: () => void;
  onNavigate: (p: PageRow) => void;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(page.seo_description ?? "");
  const [ogTitle, setOgTitle] = useState(page.og_title ?? "");
  const [ogDesc, setOgDesc] = useState(page.og_description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(page.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isHomepage = page.is_homepage;

  // Sibling navigation (prev / next within the same page list).
  const idx = pages.findIndex((p) => p.id === page.id);
  const prevPage = idx > 0 ? pages[idx - 1] : null;
  const nextPage = idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : null;

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        seo_title: seoTitle.trim() || null,
        seo_description: seoDesc.trim() || null,
        og_title: ogTitle.trim() || null,
        og_description: ogDesc.trim() || null,
        status,
      };
      // Homepage slug is locked — don't even send it.
      if (!isHomepage) body.slug = slug.trim();
      const res = await fetch(`/api/demo/${tenantSlug}/pages/${page.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uložení selhalo");
    } finally {
      setBusy(false);
    }
  }

  // Esc closes the editor.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex bg-[var(--vs-surface)]">
      {/* Dark sidebar spacer keeps the Studio rail+panel visible (matches PDF
          layout where the left chrome stays put). */}
      <div className="w-[295px] shrink-0 bg-[var(--vs-bg-soft)] border-r border-[var(--vs-border)]" />

      {/* Right column — the actual editor surface */}
      <div className="flex flex-1 flex-col bg-[var(--vs-surface)]">
        {/* Top action bar */}
        <div className="flex h-[52px] shrink-0 items-center justify-between px-5 border-b border-[var(--vs-border)] bg-[var(--vs-surface)]">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--vs-accent)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--vs-accent-solid)]"
          >
            <Settings2 className="h-4 w-4" strokeWidth={2} />
            Nastavení
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="rounded-md bg-[var(--vs-accent)] px-5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-60"
          >
            {busy ? "Ukládám…" : "Uložit"}
          </button>
        </div>

        {/* Page body */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1180px] px-10 py-10">
            {/* Title row */}
            <div className="mb-10 flex items-start justify-between gap-6">
              <h1 className="text-[40px] font-semibold leading-tight text-[#0a0a0a] tracking-tight">
                {title || "Untitled"}
              </h1>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#0a0a0a]">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={status === "published"}
                    onClick={() => !isHomepage && setStatus(status === "published" ? "draft" : "published")}
                    disabled={isHomepage}
                    title={isHomepage ? "Úvodní stránka musí být publikovaná" : undefined}
                    className={`relative inline-flex h-[22px] w-[40px] items-center rounded-full transition-colors ${
                      status === "published" ? "bg-[#22c55e]" : "bg-[var(--vs-surface-3)]"
                    } ${isHomepage ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform ${
                        status === "published" ? "translate-x-[20px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                  Zobrazit
                </label>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Zavřít"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--vs-text-dim)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sibling navigation arrows — right-aligned */}
            <div className="-mt-8 mb-8 flex items-center justify-end gap-1 text-[var(--vs-text-disabled)]">
              <button
                type="button"
                onClick={() => prevPage && onNavigate(prevPage)}
                disabled={!prevPage}
                aria-label="Předchozí stránka"
                className="grid h-8 w-8 place-items-center rounded hover:text-[var(--vs-text-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button
                type="button"
                onClick={() => nextPage && onNavigate(nextPage)}
                disabled={!nextPage}
                aria-label="Další stránka"
                className="grid h-8 w-8 place-items-center rounded hover:text-[var(--vs-text-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Two-column form: field | help text */}
            <Field
              label={<>Název stránky <span className="text-red-500">*</span></>}
              help="Jde o unikátní a co nejkratší název stránky, pod jehož názvem se bude stránka zobrazovat na webu i v administraci. Z názvu stránky je zároveň automaticky vygenerovaná URL adresa stránky."
              input={
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputCls}
                />
              }
            />
            <Field
              label="Titulek"
              help="Čím kratší název vymyslíte, tím lepší. Ideálně by měl Title obsahovat jen jedno klíčové slovo nebo krátké sousloví."
              input={
                <input
                  type="text"
                  value={seoTitle}
                  placeholder={title || "Home"}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className={inputCls}
                />
              }
            />
            <Field
              label="URL adresa"
              help="URL adresa je název stránky, která se zobrazí za lomítkem vaší internetové domény, a pod kterým mohou všichni ostatní najít tento konkrétní obsah. URL adresa je automaticky generována z názvu stránky a je možné jí později ručně změnit."
              input={
                <input
                  type="text"
                  value={slug}
                  disabled={isHomepage}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  className={`${inputCls} ${isHomepage ? "bg-[var(--vs-bg-soft)] text-[var(--vs-text-dim)] cursor-not-allowed" : ""} font-mono`}
                />
              }
            />
            <Field
              label="Popis"
              help="Popisek je věta, která má smysluplně vystihovat, co se na dané stránce nachází. Zobrazuje se ve výsledku vyhledávání Google i Seznam jako dvouřádkový popis. Proto by měla být dostatečně dlouhá a vypovídající."
              input={
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Vyplňte popisek"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              }
            />
            <Field
              label="Open Graph titulek (OG:Title)"
              help="Díky Open Graph dokážete ovlivnit, v jaké podobě se zobrazí odkaz při sdílení na sociálních sítích. Titulek se použije jako název v náhledu při sdílení."
              input={
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder="Vyplňte Open Graph titulek"
                  className={inputCls}
                />
              }
            />
            <Field
              label="Open Graph popisek (OG:Description)"
              help="Díky Open Graph dokážete ovlivnit, v jaké podobě se zobrazí odkaz při sdílení na sociálních sítích. Popisek se použije jako podtitulek v náhledu při sdílení."
              last
              input={
                <textarea
                  value={ogDesc}
                  onChange={(e) => setOgDesc(e.target.value)}
                  placeholder="Vyplňte Open Graph popisek"
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              }
            />
            {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Shared input/textarea classes for PageSettingsEditor fields. */
const inputCls =
  "w-full rounded-lg border border-[var(--vs-border-strong)] px-3.5 py-2.5 text-[14px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-accent)] focus:ring-2 focus:ring-[var(--vs-accent)]/15 focus:outline-none transition-shadow";

/* Two-column "field on the left + help on the right" row. */
function Field({
  label,
  input,
  help,
  last,
}: {
  label: React.ReactNode;
  input: React.ReactNode;
  help: string;
  last?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[1fr_320px] gap-12 ${last ? "" : "mb-8"}`}>
      <div>
        <div className="mb-1.5 text-[13.5px] font-medium text-[var(--vs-text-soft)]">{label}</div>
        {input}
      </div>
      <p className="pt-7 text-[12.5px] leading-relaxed text-[var(--vs-text-muted)]">{help}</p>
    </div>
  );
}

/* ── Add-type dropdown ───────────────────────────────────────────────────── */
function AddDropdown({ onClose, onSelect }: { onClose: () => void; onSelect: (type: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 bg-[var(--vs-surface)] rounded-xl shadow-xl border border-[var(--vs-border)] z-50 w-[200px] py-1.5 overflow-hidden"
    >
      {ADD_OPTIONS.map((opt) => (
        <button
          key={opt.type}
          type="button"
          onClick={() => { onSelect(opt.type); onClose(); }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors text-left"
        >
          <opt.Icon className="h-4 w-4 text-[var(--vs-text-dim)] shrink-0" strokeWidth={1.5} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── PagesPanel ──────────────────────────────────────────────────────────── */
export function PagesPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  // Tracks whether the user has manually edited the slug field. While `false`,
  // the slug input mirrors a slugified version of `newTitle` so typing a title
  // is enough to create a page. As soon as the user types in the slug box, we
  // stop overwriting it.
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [addDropdownSection, setAddDropdownSection] = useState<string | null>(null);
  const [settingsPage, setSettingsPage] = useState<PageRow | null>(null);

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
    const title = newTitle.trim();
    if (!title) return;
    // Slug fallback: if user left it empty (or never edited it), derive from
    // title via Czech-aware slugify. Server still validates uniqueness; if
    // there's a collision we'll surface that via the catch branch.
    const slug = (newSlug.trim() || slugify(title));
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
      setNewSlug(""); setNewTitle(""); setSlugManuallyEdited(false); setCreating(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vytvoření selhalo");
    } finally {
      setBusy(false);
    }
  }

  async function deletePage(p: PageRow) {
    if (!confirm(`Smazat stránku "${p.title}"?`)) return;
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

  function navigateTo(p: PageRow) {
    if (p.id === state.page.id) return;
    // Push "pages" onto history BEFORE the reload so the back button returns here.
    studio.pushPanel("layers");
    const url = p.is_homepage
      ? `/demo/${state.tenant.slug}/admin`
      : `/demo/${state.tenant.slug}/admin/${encodeURIComponent(p.slug)}`;
    window.location.href = url;
  }

  const mainPages = pages.filter((p) => !p.slug.startsWith("404") && p.slug !== "404");
  const systemPages = pages.filter((p) => p.slug === "404" || p.slug.startsWith("404"));

  const filtered = search.trim()
    ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : null;

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <SearchHeader search={search} onSearch={setSearch} />
        <div className="flex items-center justify-center py-10 text-[var(--vs-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search header — replaces the shared StudioLeftPanel title bar */}
      <SearchHeader search={search} onSearch={setSearch} />

      {error && (
        <div className="shrink-0 border-b border-[rgba(248,113,113,0.30)] bg-red-500/5 px-4 py-1.5 text-[11px] text-[var(--vs-danger)]">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto vs-scroll">
        {/* Filtered search results */}
        {filtered ? (
          <div className="pt-2 pb-4">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[13px] italic text-[var(--vs-text-dim)]">Žádné výsledky</p>
            ) : (
              filtered.map((p) => (
                <PageItem
                  key={p.id}
                  page={p}
                  active={p.id === state.page.id}
                  onNavigate={() => navigateTo(p)}
                  onDelete={() => deletePage(p)}
                  onSettings={() => setSettingsPage(p)}
                  busy={busy}
                />
              ))
            )}
          </div>
        ) : (
          <>
            {/* HLAVNÍ NAVIGACE */}
            <NavSection
              title="HLAVNÍ NAVIGACE"
              onAdd={() => setAddDropdownSection(addDropdownSection === "main" ? null : "main")}
              addOpen={addDropdownSection === "main"}
              onAddClose={() => setAddDropdownSection(null)}
              onAddSelect={(type) => { if (type === "empty") setCreating(true); }}
              isFirst
            >
              {mainPages.length === 0 && !creating ? (
                <EmptyPlaceholder />
              ) : (
                mainPages.map((p) => (
                  <PageItem
                    key={p.id}
                    page={p}
                    active={p.id === state.page.id}
                    onNavigate={() => navigateTo(p)}
                    onDelete={() => deletePage(p)}
                    onSettings={() => setSettingsPage(p)}
                    busy={busy}
                  />
                ))
              )}
              {creating && (
                <form onSubmit={createPage} className="mx-3 my-2 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] p-3">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewTitle(v);
                      // Until the user explicitly edits the slug field, keep it in
                      // sync with a slugified version of the title — typing
                      // "Blogová stránka" gives "blogova-stranka" automatically.
                      if (!slugManuallyEdited) setNewSlug(slugify(v));
                    }}
                    placeholder="Název stránky"
                    autoFocus
                    className="mb-2 h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 text-[13px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-accent)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                    }}
                    placeholder={newTitle ? slugify(newTitle) : "url-slug (volitelné)"}
                    className="mb-2.5 h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 text-[13px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-accent)] focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setCreating(false); setNewSlug(""); setNewTitle(""); setSlugManuallyEdited(false); }} className="rounded-md px-2.5 py-1.5 text-[12px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]">Zrušit</button>
                    <button type="submit" disabled={busy || !newTitle} className="rounded-md bg-[var(--vs-accent)] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-50">{busy ? "Vytvářím…" : "Vytvořit"}</button>
                  </div>
                </form>
              )}
            </NavSection>

            {/* SEKUNDÁRNÍ NAVIGACE */}
            <NavSection title="SEKUNDÁRNÍ NAVIGACE" onAdd={() => {}}>
              <EmptyPlaceholder />
            </NavSection>

            {/* MIMO STRUKTURU */}
            <NavSection title="MIMO STRUKTURU" onAdd={() => {}}>
              {pages.filter(p => p.is_homepage && !mainPages.find(m => m.id === p.id)).map(p => (
                <PageItem key={p.id} page={p} active={p.id === state.page.id} onNavigate={() => navigateTo(p)} onDelete={() => deletePage(p)} onSettings={() => setSettingsPage(p)} busy={busy} />
              ))}
            </NavSection>

            {/* SYSTÉMOVÉ STRÁNKY */}
            <NavSection title="SYSTÉMOVÉ STRÁNKY">
              {systemPages.length === 0 ? (
                <p className="px-4 py-2 text-[13px] text-[#6b7280]">404</p>
              ) : (
                systemPages.map((p) => (
                  <PageItem key={p.id} page={p} active={p.id === state.page.id} onNavigate={() => navigateTo(p)} onDelete={() => deletePage(p)} onSettings={() => setSettingsPage(p)} busy={busy} />
                ))
              )}
            </NavSection>
          </>
        )}
        <div className="h-4" />
      </div>

      {/* Page settings full-screen editor (matches Home.pdf spec) */}
      {settingsPage && (
        <PageSettingsEditor
          page={settingsPage}
          pages={pages}
          tenantSlug={state.tenant.slug}
          onClose={() => setSettingsPage(null)}
          onSaved={reload}
          onNavigate={(p) => setSettingsPage(p)}
        />
      )}
    </div>
  );
}

/* ── SearchHeader ────────────────────────────────────────────────────────── */
function SearchHeader({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  return (
    <div className="flex h-[52px] shrink-0 items-center gap-2.5 px-4 border-b border-[var(--vs-border)]">
      <Search className="h-[15px] w-[15px] text-[#4b5563] shrink-0" strokeWidth={1.8} />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Hledat v navigaci"
        className="flex-1 bg-transparent text-[14px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] focus:outline-none"
      />
      {search && (
        <button type="button" onClick={() => onSearch("")} className="h-5 w-5 flex items-center justify-center rounded text-[#4b5563] hover:text-[#9ca3af]">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ── NavSection ──────────────────────────────────────────────────────────── */
function NavSection({
  title, onAdd, children, addOpen, onAddClose, onAddSelect, isFirst,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
  addOpen?: boolean;
  onAddClose?: () => void;
  onAddSelect?: (type: string) => void;
  isFirst?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className={isFirst ? "mt-3" : "mt-1 border-t border-[rgba(255,255,255,0.055)]"}>
      <div className="relative flex items-center px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          <span className="text-[11px] font-bold tracking-[0.10em] text-[#6b7280] uppercase">
            {title}
          </span>
          <ChevronUp
            className="h-3 w-3 text-[#6b7280] transition-transform duration-150"
            style={{ transform: open ? "rotate(0deg)" : "rotate(-180deg)" }}
            strokeWidth={2.5}
          />
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label="Přidat stránku"
            className="flex h-5 w-5 items-center justify-center rounded text-[#6b7280] hover:text-[#9ca3af] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
        {addOpen && onAddClose && onAddSelect && (
          <AddDropdown onClose={onAddClose} onSelect={onAddSelect} />
        )}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ── EmptyPlaceholder ────────────────────────────────────────────────────── */
function EmptyPlaceholder() {
  return (
    <p className="px-4 py-2 text-[13px] italic text-[#4b5563] leading-snug">
      Přidejte nebo přetáhněte<br />první položku
    </p>
  );
}

/* ── PageItem ────────────────────────────────────────────────────────────── */
function PageItem({
  page: p, active, onNavigate, onDelete, onSettings, busy,
}: {
  page: PageRow;
  active: boolean;
  onNavigate: () => void;
  onDelete: () => void;
  onSettings: () => void;
  busy: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`group relative flex items-center px-2 py-[6px] cursor-pointer select-none transition-colors duration-100 ${
        active ? "bg-[var(--vs-surface-2)]" : "hover:bg-[var(--vs-surface-2)]"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onNavigate}
    >
      {/* Drag handle */}
      <div className={`shrink-0 mr-1 transition-opacity duration-100 ${hover ? "opacity-100" : "opacity-0"}`}>
        <GripVertical className="h-3.5 w-3.5 text-[#4b5563]" strokeWidth={1.5} />
      </div>

      {/* Title + link icon.
          The homepage entry in this list is always labelled "Homepage" — that
          keeps the structure obvious to the editor regardless of the page's
          stored title (which may be template-specific, e.g. "Barbery" or
          "Studio Břitva"). The stored title remains the source of truth for
          SEO and for the editor's title field. */}
      <span className={`flex-1 text-[14px] font-medium leading-snug truncate flex items-center min-w-0 ${
        active ? "text-[#f4f4f7]" : "text-[#9ca3af]"
      }`}>
        {p.is_homepage ? "Homepage" : p.title}
        <LinkIcon />
      </span>

      {/* Right-side indicators */}
      {p.is_homepage && !hover && (
        <Home className="h-3.5 w-3.5 shrink-0 text-[#6b7280] ml-1.5" strokeWidth={1.5} />
      )}
      {!p.is_homepage && p.status === "draft" && !hover && (
        <span className="ml-1.5 shrink-0 text-[10px] font-medium uppercase tracking-wide text-[#f59e0b] opacity-70">
          koncept
        </span>
      )}

      {/* Hover actions: gear + trash */}
      {hover && (
        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={(e) => { e.stopPropagation(); onSettings(); }}
            className="h-6 w-6 flex items-center justify-center rounded text-[#6b7280] hover:bg-[var(--vs-surface-3)] hover:text-[#9ca3af] disabled:opacity-40 transition-colors"
          >
            <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          {!p.is_homepage && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="h-6 w-6 flex items-center justify-center rounded text-[#6b7280] hover:bg-[rgba(248,113,113,0.15)] hover:text-[var(--vs-danger)] disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
