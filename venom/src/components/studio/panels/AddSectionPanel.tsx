"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { getSectionIcon } from "../studio-icons";
import { Input, EmptyState, Pill } from "../ui";
import type { StudioState } from "../TenantStudioView";
import { buildSectionLibrary } from "@/sections/variants";

interface LibraryEntry {
  type: string;
  variant: string;
  label: string;
  description: string;
}

const ALL_LIBRARY: LibraryEntry[] = buildSectionLibrary().filter(
  (e) => e.type !== "navbar" && e.type !== "footer" && e.type !== "full-page-clone" && e.type !== "astera-home"
);

const TYPE_LABEL: Record<string, string> = {
  hero: "Hero",
  services: "Služby",
  pricing: "Ceník",
  testimonials: "Recenze",
  gallery: "Galerie",
  contact: "Kontakt",
  "opening-hours": "Otevírací doba",
  faq: "Časté dotazy",
  cta: "CTA",
  team: "Tým",
  about: "O nás",
  "blog-preview": "Blog",
  map: "Mapa",
  promo: "Promo",
  stats: "Statistiky",
  products: "Produkty",
};

// Default category tab order
const TYPE_ORDER = [
  "hero", "about", "services", "pricing", "gallery", "testimonials",
  "team", "stats", "cta", "promo", "faq", "blog-preview",
  "contact", "opening-hours", "map", "products",
];

export function AddSectionPanel({ state }: { state: StudioState }) {
  const [q, setQ] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);

  const groupedTypes = useMemo(() => {
    const set = new Set(ALL_LIBRARY.map((e) => e.type));
    return TYPE_ORDER.filter((t) => set.has(t)).concat(
      [...set].filter((t) => !TYPE_ORDER.includes(t))
    );
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_LIBRARY.filter((e) => {
      if (activeType && e.type !== activeType) return false;
      if (!needle) return true;
      return (
        e.label.toLowerCase().includes(needle) ||
        e.description.toLowerCase().includes(needle) ||
        e.variant.toLowerCase().includes(needle) ||
        TYPE_LABEL[e.type]?.toLowerCase().includes(needle)
      );
    });
  }, [q, activeType]);

  return (
    <div className="flex h-full flex-col vs-enter">
      {/* Search */}
      <div className="shrink-0 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-2">
        <Input
          iconLeft={<Search className="h-3.5 w-3.5" />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat sekci…"
          autoFocus
        />
      </div>

      {/* Type tabs */}
      <nav className="shrink-0 overflow-x-auto border-b border-[var(--vs-border)] vs-scroll">
        <div className="flex gap-0.5 px-2 py-1.5">
          <CategoryButton active={activeType === null} onClick={() => setActiveType(null)}>
            Vše
          </CategoryButton>
          {groupedTypes.map((t) => (
            <CategoryButton key={t} active={activeType === t} onClick={() => setActiveType(t)}>
              {TYPE_LABEL[t] ?? t}
            </CategoryButton>
          ))}
        </div>
      </nav>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto vs-scroll">
        {filtered.length === 0 ? (
          <EmptyState
            illustration="search"
            title="Nic nenalezeno"
            description="Zkus jiná klíčová slova nebo vyber jinou kategorii."
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2.5">
            {filtered.map((item) => {
              const Icon = getSectionIcon(item.type);
              return (
                <button
                  key={`${item.type}-${item.variant}`}
                  type="button"
                  onClick={() => void state.addSection(item.type, item.variant)}
                  className="vs-lift group relative flex flex-col items-start gap-1.5 overflow-hidden rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] p-2.5 text-left transition-[border-color] duration-150 hover:border-[var(--vs-accent-ring)] hover:shadow-[var(--vs-shadow-md)] vs-focus-ring"
                  aria-label={`Přidat ${item.label}`}
                  title={item.description}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--vs-border-strong)] to-transparent opacity-60"
                  />
                  <div className="flex w-full items-center gap-1.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)] transition-colors group-hover:bg-[var(--vs-accent-bg)] group-hover:text-[var(--vs-accent-hi)]">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                    <Pill tone="neutral" size="xs">{TYPE_LABEL[item.type] ?? item.type}</Pill>
                    <Plus className="ml-auto h-3 w-3 text-[var(--vs-text-dim)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="text-[11.5px] font-medium leading-tight text-[var(--vs-text)] line-clamp-2">
                    {item.label}
                  </div>
                  <div className="line-clamp-2 text-[10.5px] leading-snug text-[var(--vs-text-muted)]">
                    {item.description}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="shrink-0 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-1.5 text-[10.5px] text-[var(--vs-text-dim)]">
        {filtered.length} variant{filtered.length === 1 ? "a" : filtered.length < 5 ? "y" : ""}
      </div>
    </div>
  );
}

function CategoryButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-md px-2 py-1 text-[10.5px] font-medium tracking-tight transition-[background,color,box-shadow] duration-100 vs-focus-ring ${
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
          : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      }`}
    >
      {children}
    </button>
  );
}
