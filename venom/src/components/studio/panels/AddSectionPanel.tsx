"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getSectionIcon, getSectionLabel } from "../studio-icons";
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
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="shrink-0 border-b border-[#27272a] p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#52525b]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat sekci…"
            className="w-full rounded-md border border-[#27272a] bg-[#0f0f10] py-1.5 pl-7 pr-2 text-[12px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Type tabs */}
      <div className="shrink-0 border-b border-[#27272a] overflow-x-auto">
        <div className="flex gap-0.5 p-1.5">
          <CategoryButton active={activeType === null} onClick={() => setActiveType(null)}>
            Vše
          </CategoryButton>
          {groupedTypes.map((t) => (
            <CategoryButton key={t} active={activeType === t} onClick={() => setActiveType(t)}>
              {TYPE_LABEL[t] ?? t}
            </CategoryButton>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-[11px] text-[#71717a]">
            Žádné sekce neodpovídají hledání.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-2">
            {filtered.map((item) => {
              const Icon = getSectionIcon(item.type);
              return (
                <button
                  key={`${item.type}-${item.variant}`}
                  type="button"
                  onClick={() => void state.addSection(item.type, item.variant)}
                  className="group flex flex-col items-start gap-1.5 rounded-md border border-[#27272a] bg-[#1a1a1c] p-2.5 text-left text-xs transition-colors duration-150 hover:border-blue-500/50 hover:bg-[#1f1f22]"
                  aria-label={`Přidat ${item.label}`}
                  title={item.description}
                >
                  <div className="flex w-full items-center gap-1.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#27272a] text-[#a1a1aa] group-hover:bg-blue-500/10 group-hover:text-blue-400">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                    <span className="truncate text-[10.5px] font-medium uppercase tracking-wide text-[#71717a]">
                      {TYPE_LABEL[item.type] ?? item.type}
                    </span>
                  </div>
                  <div className="text-[11.5px] font-medium leading-tight text-white">
                    {item.label}
                  </div>
                  <div className="line-clamp-2 text-[10.5px] leading-snug text-[#71717a]">
                    {item.description}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="shrink-0 border-t border-[#27272a] px-3 py-1.5 text-[10.5px] text-[#52525b]">
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
      className={`shrink-0 rounded-md px-2 py-1 text-[10.5px] font-medium transition-colors ${
        active ? "bg-[#27272a] text-white" : "text-[#a1a1aa] hover:bg-[#1f1f22] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
