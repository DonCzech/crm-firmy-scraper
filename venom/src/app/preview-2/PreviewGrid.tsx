"use client";

import { useMemo, useState } from "react";

export interface PreviewItem {
  key: string;
  name: string;
  industry: string;
  category: string;
  version: string;
  description: string;
  baseTemplate: string | null;
  primaryColor: string;
  accentColor: string;
  screenshot: string | null;
  demoSlug: string;
  tenantStatus: string;
  accessToken: string | null;
  showcaseKind: string | null;
  variants?: Array<{
    kind: "core" | "showcase";
    label: string;
    demoSlug: string;
    tenantStatus: string;
    accessToken: string | null;
  }>;
}

interface Props {
  items: PreviewItem[];
}

export function PreviewGrid({ items }: Props) {
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) map.set(it.category, (map.get(it.category) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "cs"));
  }, [items]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (selectedCategory !== "all" && it.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.key.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q)
      );
    });
  }, [items, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="border-b border-[#1e1e21] px-6 md:px-12 py-5 sticky top-0 z-30 bg-[#0a0a0b]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] tracking-[3px] text-zinc-500 uppercase">Webero · Engine v2</div>
            <h1 className="text-xl font-semibold mt-1">Hotové šablony</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Hledat (jméno, klíč, popis)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-[#141416] border border-[#27272a] rounded-md px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <span className="text-xs text-zinc-500 hidden md:inline">{filtered.length} / {items.length}</span>
          </div>
        </div>

        {/* Category pills */}
        <div className="max-w-7xl mx-auto mt-4 flex flex-wrap gap-2">
          <CategoryPill active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>
            Všechny ({items.length})
          </CategoryPill>
          {categories.map(([cat, count]) => (
            <CategoryPill
              key={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </CategoryPill>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-zinc-500 text-sm">
            {items.length === 0 ? (
              <>Zatím tady nejsou žádné šablony engine v2. Až přidáš adresář do <code className="text-zinc-300">src/templates/</code>, zobrazí se zde.</>
            ) : (
              <>Žádná šablona neodpovídá filtru.</>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <TemplateCard key={t.key} item={t} />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pb-10 pt-4 text-xs text-zinc-600">
        Webero · interní přehled šablon engine v2 · <a href="/admin" className="text-zinc-400 hover:text-zinc-200">Platform Admin</a>
      </div>
    </div>
  );
}

function CategoryPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border " +
        (active
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-[#141416] border-[#27272a] text-zinc-300 hover:border-[#3f3f46] hover:text-white")
      }
    >
      {children}
    </button>
  );
}

function TemplateCard({ item }: { item: PreviewItem }) {
  const variants = item.variants && item.variants.length > 0
    ? item.variants
    : [{ kind: "core" as const, label: "Core", demoSlug: item.demoSlug, tenantStatus: item.tenantStatus, accessToken: item.accessToken }];
  const [activeKind, setActiveKind] = useState<"core" | "showcase">(variants[0].kind);
  const active = variants.find((v) => v.kind === activeKind) ?? variants[0];
  const isLive = active.tenantStatus !== "missing" && active.tenantStatus !== "suspended";
  return (
    <div className="bg-[#111114] border border-[#1f1f23] rounded-xl overflow-hidden flex flex-col hover:border-[#2d2d31] transition-colors">
      {/* Preview */}
      <div
        className="relative aspect-[16/10] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: item.primaryColor }}
      >
        {item.screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.screenshot} alt={item.name} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold tracking-tight" style={{ color: item.accentColor, fontFamily: "Georgia, serif" }}>
              {item.name.split(" ")[0]}
            </div>
            <div className="text-[10px] text-white/40 mt-2 uppercase tracking-wider">
              {item.key} · v{item.version}
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span
            className={
              "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider " +
              (isLive ? "bg-emerald-600 text-white" : "bg-zinc-700 text-zinc-200")
            }
          >
            {isLive ? "Live" : "Nenazeedován"}
          </span>
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white border border-white/10">
            engine v2
          </span>
        </div>
      </div>

      {/* Variant tabs */}
      {variants.length > 1 && (
        <div className="flex border-b border-[#1f1f23] bg-[#0a0a0b]">
          {variants.map((v) => {
            const isActive = v.kind === activeKind;
            return (
              <button
                key={v.kind}
                onClick={() => setActiveKind(v.kind)}
                className={
                  "flex-1 text-[11px] font-semibold uppercase tracking-wider py-2.5 transition-colors " +
                  (isActive
                    ? (v.kind === "core" ? "text-emerald-400 border-b-2 border-emerald-400 -mb-px" : "text-amber-400 border-b-2 border-amber-400 -mb-px")
                    : "text-zinc-500 hover:text-zinc-300")
                }
              >
                {v.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-base">{item.name}</h2>
          <span
            className="text-[10px] px-2 py-0.5 rounded-md border"
            style={{ color: item.accentColor, borderColor: item.accentColor + "40", background: item.accentColor + "10" }}
          >
            {item.category}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 font-mono">
          {item.key} · v{item.version}
          {item.baseTemplate && <> · extends <span className="text-zinc-400">{item.baseTemplate}</span></>}
        </div>
        {item.description && (
          <p className="text-[13px] text-zinc-400 leading-relaxed mt-1 line-clamp-3">{item.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        {isLive && active.accessToken ? (
          <>
            <div className="bg-[#0a0a0b] border border-[#1f1f23] rounded-lg px-3 py-2">
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">
                Admin heslo {variants.length > 1 && <span className="text-zinc-600">· {active.label}</span>}
              </div>
              <code className="text-[12px] font-mono break-all" style={{ color: item.accentColor }}>{active.accessToken}</code>
            </div>
            <div className="flex gap-2">
              <a
                href={`/demo/${active.demoSlug}`}
                target="_blank"
                rel="noopener"
                className="flex-1 text-center text-[12px] font-semibold py-2.5 rounded-lg bg-[#1e1e21] hover:bg-[#27272a] border border-[#2a2a2e] text-zinc-200 transition-colors"
              >
                Náhled
              </a>
              <a
                href={`/demo/${active.demoSlug}/login`}
                target="_blank"
                rel="noopener"
                className="flex-1 text-center text-[12px] font-semibold py-2.5 rounded-lg bg-zinc-200 hover:bg-white text-black transition-colors"
              >
                Editor
              </a>
              <a
                href={`/demo/${active.demoSlug}/studio`}
                target="_blank"
                rel="noopener"
                className="flex-1 text-center text-[12px] font-semibold py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Studio
              </a>
            </div>
          </>
        ) : (
          <div className="text-[12px] text-zinc-500 bg-[#0a0a0b] border border-dashed border-[#27272a] rounded-lg px-3 py-2.5">
            Žádný demo tenant. Spusť <code className="text-zinc-300">node scripts/seed-{item.key}.mjs</code>.
          </div>
        )}
      </div>
    </div>
  );
}
