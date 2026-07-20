"use client";

/**
 * Eshop19Listing — Grunt (dek.cz DNA) stránka kategorie.
 * Breadcrumb → Space Grotesk H1 + popis → dlaždice podkategorií (DEK vzor:
 * bordered chipy s foto/iniciálou) → řadicí lišta (Doporučujeme / Nejnižší /
 * Nejvyšší ceny + stránkovací čísla vpravo) → grid 4 karet s DEK cenovkou
 * (žlutá skosená −% vlajka, červený badge Výhodná cena, červená cena +
 * „cena za <unit> s DPH", zelená skladovost „Skladem: > N ks" + „V prodejně",
 * qty stepper + zelené Do košíku, „celkem s DPH") → stránkování.
 */

import { useState } from "react";

const HEAD = "'Space Grotesk', 'Arial', sans-serif";
const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
const RED = "#d5232c";
const GRAPHITE = "#212428";
const INK = "#1d1f23";
const MUTED = "#6b6f76";
const PAPER = "#f4f3ef";
const LINE = "#e6e5e0";
const GREEN = "#1e8f4a";
const GREEN_DK = "#187a3f";
const YELLOW = "#ffd12e";

export interface Es19ListItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  image_url: string | null;
  price_min_cents: number;
  compare_at_max_cents: number | null;
  stock_total: number;
  default_variant_id: number | null;
  is_new: boolean;
  is_deal: boolean;
  unit: string;
}

export interface Es19Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url: string | null;
}

interface Props {
  items: Es19ListItem[];
  categories: Es19Category[];
  activeCategory: string | null;
  categoryName: string;
  categoryDescription: string | null;
  basePath: string;
  tenantSlug: string;
  currency: string;
  total: number;
  page: number;
  pages: number;
  perPage: number;
}

const SPECIAL_SLUGS = new Set(["akce", "novinky", "vyprodej"]);

export function Eshop19Listing({
  items, categories, activeCategory, categoryName, categoryDescription,
  basePath, tenantSlug, currency, total, page, pages,
}: Props) {
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<"reco" | "asc" | "desc">("reco");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
  const stockFmt = (n: number) => (n >= 500 ? "> 500" : n >= 100 ? "> 100" : n >= 20 ? "> 20" : String(n));

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const parent = active?.parent_id ? categories.find((c) => c.id === active.parent_id) : null;
  const tiles = (active
    ? categories.filter((c) => c.parent_id === active.id)
    : categories.filter((c) => !c.parent_id && !SPECIAL_SLUGS.has(c.slug))
  ).filter((c) => c.product_count > 0);
  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => `${basePath}?${activeCategory ? `kategorie=${activeCategory}&` : ""}strana=${n}`;

  const sorted = sort === "reco" ? items : [...items].sort((a, b) =>
    sort === "asc" ? a.price_min_cents - b.price_min_cents : b.price_min_cents - a.price_min_cents);

  const qtyOf = (slug: string) => Math.max(1, qtys[slug] ?? 1);
  const bumpQty = (e: React.MouseEvent, slug: string, delta: number) => {
    e.preventDefault(); e.stopPropagation();
    setQtys((q) => ({ ...q, [slug]: Math.max(1, (q[slug] ?? 1) + delta) }));
  };

  const quickAdd = (e: React.MouseEvent, it: Es19ListItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (!it.default_variant_id || adding) return;
    setAdding(it.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: it.default_variant_id, qty: qtyOf(it.slug) }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(it.slug);
        setTimeout(() => setAdded((cur) => (cur === it.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  const SORTS: Array<{ key: typeof sort; label: string }> = [
    { key: "reco", label: "Doporučujeme" },
    { key: "asc", label: "Nejnižší ceny" },
    { key: "desc", label: "Nejvyšší ceny" },
  ];

  return (
    <div style={{ fontFamily: SANS, background: "#fff" }}>
      <style>{`
        .es19L-crumb { color: ${MUTED}; text-decoration: none; font-size: 12.5px; font-weight: 500; transition: color 0.13s; }
        .es19L-crumb:hover { color: ${RED}; }

        .es19L-tiles { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        @media (max-width: 1100px) { .es19L-tiles { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 700px) { .es19L-tiles { grid-template-columns: repeat(2, 1fr); } }
        .es19L-tile { display: flex; align-items: center; gap: 10px; border: 1.5px solid ${LINE}; border-radius: 8px; background: #fff;
          padding: 9px 13px; text-decoration: none; transition: border-color 0.15s, background 0.15s, transform 0.14s; }
        .es19L-tile:hover { border-color: ${GRAPHITE}; background: ${PAPER}; transform: translateY(-1px); }

        .es19L-sort { border: none; background: none; cursor: pointer; font-family: ${SANS}; font-size: 13px; font-weight: 600; color: ${MUTED};
          padding: 8px 13px; border-radius: 6px; transition: color 0.14s, background 0.14s; }
        .es19L-sort:hover { color: ${INK}; }
        .es19L-sort.es19L-on { color: #fff; background: ${GRAPHITE}; font-weight: 700; }

        .es19L-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1100px) { .es19L-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 780px) { .es19L-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }

        .es19L-card { position: relative; background: #fff; border: 1.5px solid ${LINE}; border-radius: 8px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es19L-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(23,25,28,0.1); border-color: ${GRAPHITE}; }
        .es19L-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${PAPER}; }
        .es19L-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es19L-card:hover .es19L-media img { transform: scale(1.05); }
        .es19L-flag { position: absolute; left: -34px; top: 14px; transform: rotate(-45deg); width: 120px; text-align: center;
          background: ${YELLOW}; color: ${INK}; font-family: ${HEAD}; font-weight: 700; font-size: 12px; letter-spacing: 0.03em;
          padding: 5px 0; box-shadow: 0 4px 10px rgba(23,25,28,0.14); }
        .es19L-title { font-size: 13.5px; font-weight: 700; color: ${INK}; line-height: 1.38;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.76em; transition: color 0.14s; }
        .es19L-card:hover .es19L-title { color: ${RED}; }

        .es19L-qty { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 6px; background: #fff; }
        .es19L-qty button { border: none; background: none; cursor: pointer; padding: 5px 9px; color: ${INK}; display: flex; align-items: center; transition: opacity 0.13s; }
        .es19L-qty button:hover { opacity: 0.5; }
        .es19L-buy { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 36px; border: none; border-radius: 6px;
          background: ${GREEN}; color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.02em; cursor: pointer;
          transition: background 0.15s, transform 0.14s; }
        .es19L-buy:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        .es19L-buy:disabled { cursor: default; opacity: 0.8; }

        .es19L-page { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 34px; padding: 0 8px; border: 1.5px solid ${LINE};
          border-radius: 6px; background: #fff; color: ${INK}; font-size: 13px; font-weight: 700; text-decoration: none; transition: border-color 0.14s, background 0.14s, color 0.14s; }
        .es19L-page:hover { border-color: ${GRAPHITE}; }
        .es19L-page.es19L-cur { background: ${GRAPHITE}; border-color: ${GRAPHITE}; color: #fff; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "18px 28px 50px" }}>
        {/* Breadcrumb */}
        <nav aria-label="Drobečková navigace" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <a href={basePath.replace(/\/obchod$/, "")} className="es19L-crumb" aria-label="Domů">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}><path d="M4 11.5 12 4l8 7.5M6 10v10h12V10"/></svg>
          </a>
          <span style={{ color: LINE }}>›</span>
          <a href={basePath} className="es19L-crumb">Obchod</a>
          {parent && (<><span style={{ color: LINE }}>›</span><a href={catHref(parent.slug)} className="es19L-crumb">{parent.name}</a></>)}
          {active && (<><span style={{ color: LINE }}>›</span><span className="es19L-crumb" style={{ color: INK, fontWeight: 700 }}>{active.name}</span></>)}
        </nav>

        {/* H1 + popis */}
        <h1 style={{ fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 34px)", letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: "0 0 6px" }}>{categoryName}</h1>
        {categoryDescription && <p style={{ fontSize: 14, color: MUTED, maxWidth: 720, lineHeight: 1.6, margin: "0 0 18px" }}>{categoryDescription}</p>}

        {/* Dlaždice podkategorií */}
        {tiles.length > 0 && (
          <div className="es19L-tiles" style={{ margin: "6px 0 26px" }}>
            {tiles.map((c) => (
              <a key={c.slug} href={catHref(c.slug)} className="es19L-tile">
                <span style={{ width: 36, height: 36, borderRadius: 6, background: PAPER, overflow: "hidden", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {c.image_url
                    ? <img src={c.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 15, color: RED }}>{c.name.slice(0, 1)}</span>}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: MUTED }}>{c.product_count} položek</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {/* Řadicí lišta */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, padding: "9px 0", marginBottom: 18 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginRight: 4 }}>Řadit podle:</span>
          {SORTS.map((s) => (
            <button key={s.key} className={`es19L-sort${sort === s.key ? " es19L-on" : ""}`} onClick={() => setSort(s.key)}>{s.label}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: MUTED }}>{total} produktů</span>
        </div>

        {/* Grid produktů */}
        {sorted.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: MUTED, fontSize: 14.5 }}>V této kategorii zatím nejsou žádné produkty.</div>
        ) : (
          <div className="es19L-grid">
            {sorted.map((it) => {
              const sale = it.compare_at_max_cents != null && it.compare_at_max_cents > it.price_min_cents;
              const salePct = sale ? Math.round((1 - it.price_min_cents / (it.compare_at_max_cents as number)) * 100) : 0;
              const qty = qtyOf(it.slug);
              const isAdded = added === it.slug;
              return (
                <a key={it.id} className="es19L-card" href={`${basePath}/${it.slug}`}>
                  <span className="es19L-media">
                    {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                    {sale && salePct > 0 && <span className="es19L-flag">−{salePct} %</span>}
                    {it.is_new && (
                      <span style={{ position: "absolute", right: 10, top: 10, background: GRAPHITE, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4.5px 10px", borderRadius: 4 }}>Novinka</span>
                    )}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "11px 13px 13px" }}>
                    <span style={{ minHeight: 22, marginBottom: 4 }}>
                      {it.is_deal && <span style={{ display: "inline-block", background: RED, color: "#fff", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3.5px 8px", borderRadius: 3 }}>Výhodná cena</span>}
                    </span>
                    <span className="es19L-title">{it.title}</span>
                    {it.subtitle && <span style={{ marginTop: 3, fontSize: 11.5, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.subtitle}</span>}

                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
                      {sale && <s style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{fmt(it.compare_at_max_cents as number)}</s>}
                      <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 18, color: sale || it.is_deal ? RED : INK, whiteSpace: "nowrap" }}>{fmt(it.price_min_cents)}</span>
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED, marginTop: 1 }}>cena za {it.unit} s DPH</span>

                    <span style={{ display: "inline-flex", flexDirection: "column", gap: 1, marginTop: 8, fontSize: 12, fontWeight: 700 }}>
                      {it.stock_total <= 0 ? (
                        <span style={{ color: MUTED }}>Vyprodáno</span>
                      ) : (
                        <>
                          <span style={{ color: GREEN, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: 999, background: GREEN, flexShrink: 0 }} />
                            Skladem: {stockFmt(it.stock_total)} {it.unit}
                          </span>
                          <span style={{ color: MUTED, fontWeight: 500, fontSize: 11.5, paddingLeft: 13 }}>V prodejně</span>
                        </>
                      )}
                    </span>

                    {it.stock_total > 0 && it.default_variant_id != null && (
                      <>
                        <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}>
                          <span className="es19L-qty">
                            <button onClick={(e) => bumpQty(e, it.slug, -1)} aria-label="Snížit množství">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
                            <button onClick={(e) => bumpQty(e, it.slug, 1)} aria-label="Zvýšit množství">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                            </button>
                          </span>
                          <button className="es19L-buy" onClick={(e) => quickAdd(e, it)} disabled={adding === it.slug || isAdded} aria-label={`Přidat ${it.title} do košíku`}>
                            {isAdded ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                            ) : "Do košíku"}
                          </button>
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED, marginTop: 6 }}>{fmt(it.price_min_cents * qty)} celkem s DPH</span>
                      </>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Stránkování */}
        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 30 }}>
            {page > 1 && <a href={pageHref(page - 1)} className="es19L-page" aria-label="Předchozí strana">‹</a>}
            {Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2).map((n, i, arr) => (
              <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                {i > 0 && arr[i - 1] !== n - 1 && <span style={{ color: MUTED }}>…</span>}
                <a href={pageHref(n)} className={`es19L-page${n === page ? " es19L-cur" : ""}`}>{n}</a>
              </span>
            ))}
            {page < pages && <a href={pageHref(page + 1)} className="es19L-page" aria-label="Další strana">›</a>}
          </div>
        )}
      </div>
    </div>
  );
}
