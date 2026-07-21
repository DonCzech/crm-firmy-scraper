"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Home,
  TreePine,
  Store,
  FileText,
  Settings,
  Image as ImageIcon,
  Mail,
  BarChart3,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof Building2;
  href: string;
  category: "listing" | "blog" | "page" | "action";
};

type ListingHit = {
  id: string;
  title: string;
  location: string;
  kind: string;
  deal: string;
  status: string;
  images: { url: string }[];
};

type BlogHit = {
  id: string;
  title: string;
  status: string;
};

const KIND_ICON: Record<string, typeof Building2> = {
  APARTMENT: Building2,
  HOUSE: Home,
  LAND: TreePine,
  COMMERCIAL: Store,
};

const DEAL_LABEL: Record<string, string> = {
  SALE: "Prodej",
  RENT: "Pronajem",
  INVESTMENT: "Investice",
};

const PAGES: SearchResult[] = [
  { id: "p-dash", title: "Dashboard", subtitle: "Prehled", icon: BarChart3, href: "/admin", category: "page" },
  { id: "p-nem", title: "Nemovitosti", subtitle: "Sprava inzeratu", icon: Building2, href: "/admin/nemovitosti", category: "page" },
  { id: "p-blog", title: "Blog", subtitle: "Clanky a novinky", icon: FileText, href: "/admin/blog", category: "page" },
  { id: "p-media", title: "Media", subtitle: "Knihovna souboru", icon: ImageIcon, href: "/admin/media", category: "page" },
  { id: "p-popt", title: "Poptavky", subtitle: "Zpravy od klientu", icon: Mail, href: "/admin/poptavky", category: "page" },
  { id: "p-export", title: "Export", subtitle: "Portaly", icon: BarChart3, href: "/admin/export", category: "page" },
  { id: "p-pripady", title: "Obchodni pripady", subtitle: "Pipeline zakazek", icon: BarChart3, href: "/admin/pripady", category: "page" },
  { id: "p-adresar", title: "Adresar", subtitle: "Kontakty klientu", icon: Mail, href: "/admin/adresar", category: "page" },
  { id: "p-obecne", title: "Obecne poptavky", subtitle: "Parovani s nabidkami", icon: Mail, href: "/admin/obecne-poptavky", category: "page" },
  { id: "p-uzaverky", title: "Uzaverky", subtitle: "Provize makleru", icon: BarChart3, href: "/admin/uzaverky", category: "page" },
  { id: "p-planovani", title: "Planovani", subtitle: "Kanban ukolu", icon: BarChart3, href: "/admin/planovani", category: "page" },
  { id: "p-dokumenty", title: "Dokumenty", subtitle: "Knihovna souboru", icon: FileText, href: "/admin/dokumenty", category: "page" },
  { id: "p-statistiky", title: "Statistiky", subtitle: "Vykonnost kancelare", icon: BarChart3, href: "/admin/statistiky", category: "page" },
  { id: "p-nastenka", title: "Nastenka", subtitle: "Vzkazy tymu", icon: Mail, href: "/admin/nastenka", category: "page" },
  { id: "p-set", title: "Nastaveni", subtitle: "Konfigurace", icon: Settings, href: "/admin/nastaveni", category: "page" },
];

const ACTIONS: SearchResult[] = [
  { id: "a-new-listing", title: "Novy inzerat", subtitle: "Vytvorit nemovitost", icon: Plus, href: "/admin/nemovitosti/novy", category: "action" },
  { id: "a-new-blog", title: "Novy clanek", subtitle: "Vytvorit blog post", icon: Plus, href: "/admin/blog/novy", category: "action" },
];

const CATEGORY_LABELS: Record<string, string> = {
  action: "Akce",
  listing: "Nemovitosti",
  blog: "Blog",
  page: "Stranky",
};

export default function CmdKSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search
  const search = useCallback(async (q: string) => {
    const lower = q.toLowerCase().trim();

    // Static results (pages + actions)
    const staticResults = [...ACTIONS, ...PAGES].filter(
      (r) => r.title.toLowerCase().includes(lower) || r.subtitle?.toLowerCase().includes(lower)
    );

    if (!lower) {
      setResults([...ACTIONS, ...PAGES]);
      return;
    }

    setLoading(true);

    try {
      const [listingsRes, blogRes] = await Promise.all([
        fetch(`/api/admin/listings?q=${encodeURIComponent(lower)}&limit=5`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/admin/blog?q=${encodeURIComponent(lower)}&limit=5`).then((r) => r.ok ? r.json() : null),
      ]);

      const listingResults: SearchResult[] = (listingsRes?.listings || []).map((l: ListingHit) => ({
        id: `l-${l.id}`,
        title: l.title,
        subtitle: `${l.location} · ${DEAL_LABEL[l.deal] || l.deal}`,
        icon: KIND_ICON[l.kind] || Building2,
        href: `/admin/nemovitosti/${l.id}`,
        category: "listing" as const,
      }));

      const blogResults: SearchResult[] = (blogRes?.posts || []).map((b: BlogHit) => ({
        id: `b-${b.id}`,
        title: b.title,
        subtitle: b.status === "PUBLISHED" ? "Publikovano" : "Koncept",
        icon: FileText,
        href: `/admin/blog/${b.id}`,
        category: "blog" as const,
      }));

      setResults([...staticResults.slice(0, 3), ...listingResults, ...blogResults, ...staticResults.slice(3)]);
    } catch {
      setResults(staticResults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      navigate(results[selected].href);
    }
  }

  if (!open) return null;

  // Group by category
  const grouped: { label: string; items: SearchResult[] }[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (!seen.has(r.category)) {
      seen.add(r.category);
      grouped.push({ label: CATEGORY_LABELS[r.category] || r.category, items: [] });
    }
    grouped.find((g) => g.label === CATEGORY_LABELS[r.category])?.items.push(r);
  }

  let flatIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[15%] z-[101] mx-auto max-w-[560px] overflow-hidden rounded-2xl border border-[var(--a-border)] bg-[var(--a-surface)] shadow-2xl">
        {/* Input */}
        <div className="flex items-center border-b border-[var(--a-border)] px-5">
          <Search size={16} className="shrink-0 text-[var(--a-text-3)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={onKeyDown}
            placeholder="Hledat nemovitosti, clanky, stranky..."
            className="h-14 flex-1 bg-transparent px-4 text-[14px] text-[var(--a-text)] outline-none placeholder:text-[var(--a-text-3)]"
          />
          {loading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
          )}
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 items-center rounded-md border border-[var(--a-border)] px-2 text-[10px] font-semibold text-[var(--a-text-3)]"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="px-5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">
                {group.label}
              </div>
              {group.items.map((item) => {
                flatIndex++;
                const idx = flatIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelected(idx)}
                    className={`flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                      selected === idx
                        ? "bg-[var(--a-surface-2)] text-[var(--a-text)]"
                        : "text-[var(--a-text-2)] hover:bg-[var(--a-surface-2)]"
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      item.category === "action"
                        ? "bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                        : "bg-[var(--a-surface-2)] text-[var(--a-text-3)]"
                    }`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-[11px] text-[var(--a-text-3)]">{item.subtitle}</p>
                      )}
                    </div>
                    {selected === idx && (
                      <ArrowRight size={13} className="shrink-0 text-[var(--a-text-3)]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {results.length === 0 && query && (
            <div className="px-5 py-8 text-center text-[13px] text-[var(--a-text-3)]">
              Zadne vysledky pro &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-[var(--a-border)] px-5 py-2.5 text-[10px] text-[var(--a-text-3)]">
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--a-border)] px-1">&#8593;&#8595;</kbd> navigace</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--a-border)] px-1">Enter</kbd> otevrit</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-[var(--a-border)] px-1">Esc</kbd> zavrit</span>
        </div>
      </div>
    </>
  );
}
