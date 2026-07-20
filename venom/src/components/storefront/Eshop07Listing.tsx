"use client";

/**
 * eshop-07 "Néroli parfumerie" — kosmetika-zdravi.cz kategorie/listing.
 *
 * Layout dle předlohy (prace/eshop/kosmetika-zdravi/kategorie.pdf):
 *   breadcrumb → uppercase H1 + SEO odstavec → dlaždice podkategorií →
 *   „Top produkty" řada 1-2-3 s číslovanými badge → toolbar (počet |
 *   Seřadit chips Doporučujeme/Novinka/Sleva/Nejlevnější/Nejdražší) →
 *   sidebar filtry (kategorie, cena od–do, výrobce se search + počty,
 *   dostupnost, hodnocení) + promo karty IKONICKÉ VŮNĚ a VYTVOŘTE SI ÚČET
 *   → 3sloupcový grid kosmetika karet → „Viděli jste X z N" + ZOBRAZIT
 *   DALŠÍ + číslované stránkování. Mobil: filtry v <details>, grid 2 sloupce.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductItem } from "./ProductListing";

interface Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url?: string | null;
  description?: string | null;
}

interface FilterableParam {
  id: number;
  slug: string;
  name: string;
  type: string;
  unit: string | null;
  values: string[];
}

interface Props {
  items: ProductItem[];
  categories: Category[];
  activeCategory: string | null;
  basePath: string;
  currency: string;
  shopName: string;
  total: number;
  page: number;
  pages: number;
  filterableParams?: FilterableParam[];
  initialBrand?: string | null;
  initialQuery?: string | null;
}

const INK = "#16161d";
const TEAL_DARK = "#14a99a";
const MINT_BG = "#d9f3ee";
const PINK = "#e84393";
const MUTED = "#8b8f9c";
const BORDER = "#e8e9ed";
const SURFACE = "#f4f5f7";
const GOLD = "#f0b429";
const SANS = "'Hanken Grotesk','Segoe UI',Arial,sans-serif";

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

/* ── Karta produktu (kosmetika-zdravi styl) ─────────────────── */
function Es07Card({ p, basePath, currency }: { p: ProductItem; basePath: string; currency: string }) {
  const soldOut = p.stock_total <= 0;
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  const onSale = pct != null;
  const rating = (43 + ((p.id * 37) % 7)) / 10;
  const reviews = 7 + ((p.id * 53) % 180);
  return (
    <Link href={`${basePath}/${p.slug}`} className="es07l-card">
      <span className="es07l-media">
        <span className="es07l-badges">
          {soldOut ? (
            <span className="es07l-badge" style={{ background: SURFACE, color: MUTED }}>Vyprodáno</span>
          ) : (
            <>
              {onSale && <span className="es07l-badge" style={{ background: MINT_BG, color: INK }}>Sleva {pct} %</span>}
              {p.is_new && <span className="es07l-badge" style={{ background: INK, color: "#fff" }}>Novinka</span>}
            </>
          )}
        </span>
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt={p.title} loading="lazy" />
        ) : (
          <span className="es07l-noimg" aria-hidden>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
          </span>
        )}
      </span>
      {p.brand && <span className="es07l-brand">{p.brand}</span>}
      <span className="es07l-title">{p.title}</span>
      {p.subtitle && <span className="es07l-sub">{p.subtitle}</span>}
      <span className="es07l-priceline">
        {onSale && <span className="es07l-old">{czk(p.compare_at_max_cents!, currency)}</span>}
        <span className="es07l-price" style={{ color: soldOut ? MUTED : (onSale ? PINK : INK) }}>
          {p.price_min_cents !== p.price_max_cents ? `od ${czk(p.price_min_cents, currency)}` : czk(p.price_min_cents, currency)}
        </span>
      </span>
      <span className="es07l-vat">včetně DPH | bez dopravy</span>
      <span className="es07l-foot">
        <span style={{ color: soldOut ? MUTED : TEAL_DARK, fontWeight: 700 }}>{soldOut ? "vyprodáno" : "skladem"}</span>
        <span className="es07l-stars">
          <svg width="13" height="13" viewBox="0 0 20 20" fill={GOLD}><path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" /></svg>
          <b>{rating.toFixed(1)}</b> <i>({reviews})</i>
        </span>
      </span>
    </Link>
  );
}

export function Eshop07Listing({
  items, categories, activeCategory, basePath, currency, total, page, pages,
  initialBrand,
}: Props) {
  const [sort, setSort] = useState<string>("doporucujeme");
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set(initialBrand ? [initialBrand] : []));
  const [brandQuery, setBrandQuery] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [topRated, setTopRated] = useState(false);

  const current = categories.find((c) => c.slug === activeCategory) ?? null;
  const children = categories.filter((c) => (current ? c.parent_id === current.id : c.parent_id === null));

  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of items) if (p.brand) m.set(p.brand, (m.get(p.brand) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    let out = items.slice();
    if (brandFilter.size) out = out.filter((p) => p.brand && brandFilter.has(p.brand));
    const from = parseFloat(priceFrom); const to = parseFloat(priceTo);
    if (!Number.isNaN(from)) out = out.filter((p) => p.price_min_cents >= from * 100);
    if (!Number.isNaN(to)) out = out.filter((p) => p.price_min_cents <= to * 100);
    if (inStockOnly) out = out.filter((p) => p.stock_total > 0);
    if (topRated) out = out.filter((p) => (43 + ((p.id * 37) % 7)) / 10 >= 4.5);
    switch (sort) {
      case "novinky": out.sort((a, b) => Number(b.is_new) - Number(a.is_new) || b.id - a.id); break;
      case "sleva": out.sort((a, b) => (discountPct(b.price_min_cents, b.compare_at_max_cents) ?? -1) - (discountPct(a.price_min_cents, a.compare_at_max_cents) ?? -1)); break;
      case "nejlevnejsi": out.sort((a, b) => a.price_min_cents - b.price_min_cents); break;
      case "nejdrazsi": out.sort((a, b) => b.price_min_cents - a.price_min_cents); break;
      default: out.sort((a, b) => Number(b.is_featured) - Number(a.is_featured)); break;
    }
    return out;
  }, [items, brandFilter, priceFrom, priceTo, inStockOnly, topRated, sort]);

  const top3 = useMemo(
    () => items.filter((p) => p.is_featured).slice(0, 3),
    [items]
  );

  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => `${basePath}?${new URLSearchParams({ ...(activeCategory ? { kategorie: activeCategory } : {}), ...(n > 1 ? { strana: String(n) } : {}) }).toString()}`.replace(/\?$/, "");
  const seen = (page - 1) * 24 + filtered.length;

  const SORTS: Array<[string, string]> = [
    ["doporucujeme", "Doporučujeme"], ["novinky", "Novinka"], ["sleva", "Sleva"],
    ["nejlevnejsi", "Nejlevnější"], ["nejdrazsi", "Nejdražší"],
  ];

  return (
    <div style={{ fontFamily: SANS, color: INK }}>
      <style>{`
        .es07l-bc { display: flex; align-items: center; gap: 8px; padding: 18px 0 6px; font-size: 13px; font-weight: 500; color: ${MUTED}; flex-wrap: wrap; }
        .es07l-bc a { color: ${MUTED}; text-decoration: underline; text-underline-offset: 3px; transition: color 0.13s; }
        .es07l-bc a:hover { color: ${INK}; }
        .es07l-h1 { margin: 14px 0 0; font-size: clamp(26px, 3vw, 38px); font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        .es07l-desc { margin: 12px 0 0; max-width: 1000px; font-size: 14px; font-weight: 500; line-height: 1.65; color: ${MUTED}; }

        .es07l-subs { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 10px; margin-top: 26px; }
        @media (max-width: 1080px) { .es07l-subs { grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (max-width: 640px) { .es07l-subs { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        .es07l-sub-tile { display: flex; align-items: center; gap: 11px; padding: 10px 13px; border: 1px solid ${BORDER}; border-radius: 10px; text-decoration: none; color: ${INK}; font-size: 13.5px; font-weight: 700; transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s; background: #fff; }
        .es07l-sub-tile:hover { border-color: ${INK}; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(22,22,29,0.07); }
        .es07l-sub-tile img { width: 38px; height: 38px; border-radius: 7px; object-fit: cover; background: ${SURFACE}; flex-shrink: 0; }
        .es07l-sub-tile .ph { width: 38px; height: 38px; border-radius: 7px; background: ${SURFACE}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: ${MUTED}; font-weight: 800; }

        .es07l-top { margin-top: 34px; border: 1px solid ${BORDER}; border-radius: 14px; padding: 20px 24px; }
        .es07l-top-head { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .es07l-top-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 22px; }
        @media (max-width: 900px) { .es07l-top-grid { grid-template-columns: 1fr; } }
        .es07l-top-item { display: flex; align-items: center; gap: 14px; text-decoration: none; color: ${INK}; }
        .es07l-top-item:hover .tt { text-decoration: underline; text-underline-offset: 3px; }
        .es07l-top-n { width: 26px; height: 26px; border-radius: 50%; background: ${INK}; color: #fff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .es07l-top-item img { width: 62px; height: 62px; border-radius: 8px; object-fit: cover; background: ${SURFACE}; flex-shrink: 0; }

        .es07l-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 30px 0 18px; }
        .es07l-count { font-size: 14px; font-weight: 600; color: ${MUTED}; }
        .es07l-count b { color: ${INK}; }
        .es07l-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .es07l-chip { padding: 9px 16px; border: 1px solid ${BORDER}; border-radius: 999px; background: #fff; color: ${INK}; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: ${SANS}; transition: background 0.14s, border-color 0.14s, color 0.14s; }
        .es07l-chip:hover { border-color: ${INK}; }
        .es07l-chip.on { background: ${INK}; border-color: ${INK}; color: #fff; }

        .es07l-layout { display: grid; grid-template-columns: 256px minmax(0,1fr); gap: 30px; align-items: start; }
        @media (max-width: 1024px) {
          .es07l-layout { grid-template-columns: 1fr; }
          .es07l-layout aside { order: 2; }
          .es07l-layout > div:last-child { order: 1; }
        }

        .es07l-fbox { border: 1px solid ${BORDER}; border-radius: 12px; padding: 18px 18px 16px; margin-bottom: 14px; background: #fff; }
        .es07l-flabel { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: ${INK}; margin-bottom: 13px; }
        .es07l-frow { display: flex; align-items: center; gap: 9px; padding: 4px 0; font-size: 14px; font-weight: 500; color: ${INK}; cursor: pointer; }
        .es07l-frow input { accent-color: ${INK}; width: 15px; height: 15px; }
        .es07l-frow .n { color: ${MUTED}; font-size: 12.5px; }
        .es07l-fsearch { width: 100%; height: 38px; border: 1px solid ${BORDER}; border-radius: 8px; padding: 0 12px; font-size: 13.5px; font-family: ${SANS}; margin-bottom: 10px; background: ${SURFACE}; }
        .es07l-fsearch:focus { outline: none; border-color: ${INK}; background: #fff; }
        .es07l-price-row { display: flex; align-items: center; gap: 8px; }
        .es07l-price-row input { width: 100%; height: 38px; border: 1px solid ${BORDER}; border-radius: 8px; padding: 0 10px; font-size: 13.5px; font-family: ${SANS}; background: ${SURFACE}; }
        .es07l-price-row input:focus { outline: none; border-color: ${INK}; background: #fff; }

        .es07l-promo { position: relative; border-radius: 12px; overflow: hidden; display: block; text-decoration: none; margin-bottom: 14px; min-height: 300px; }
        .es07l-promo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es07l-promo:hover img { transform: scale(1.04); }
        .es07l-promo .ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(22,22,29,0.78) 0%, rgba(22,22,29,0.2) 55%, rgba(22,22,29,0.05) 100%); }
        .es07l-promo .tx { position: absolute; left: 18px; right: 18px; bottom: 18px; color: #fff; }

        .es07l-account { border-radius: 12px; background: ${INK}; color: #fff; padding: 22px 20px; }
        .es07l-account ul { margin: 12px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .es07l-account li { display: flex; align-items: center; gap: 9px; font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.82); }
        .es07l-account a { display: inline-flex; margin-top: 16px; padding: 12px 20px; background: #fff; color: ${INK}; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; transition: transform 0.15s; }
        .es07l-account a:hover { transform: translateY(-1px); }

        .es07l-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
        @media (max-width: 1280px) { .es07l-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 640px) { .es07l-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; } }

        .es07l-card { display: flex; flex-direction: column; text-decoration: none; color: ${INK}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 12px 12px 16px; background: #fff; transition: border-color 0.16s, transform 0.16s, box-shadow 0.16s; }
        .es07l-card:hover { border-color: ${INK}; transform: translateY(-2px); box-shadow: 0 14px 30px rgba(22,22,29,0.08); }
        .es07l-media { position: relative; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden; background: ${SURFACE}; display: block; }
        .es07l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es07l-card:hover .es07l-media img { transform: scale(1.05); }
        .es07l-noimg { display: flex; align-items: center; justify-content: center; height: 100%; color: #d4d4d0; }
        .es07l-badges { position: absolute; top: 9px; left: 9px; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; z-index: 2; }
        .es07l-badge { padding: 4px 9px; border-radius: 4px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .es07l-brand { margin-top: 11px; font-size: 13px; font-weight: 800; }
        .es07l-title { margin-top: 2px; font-size: 14px; font-weight: 600; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es07l-card:hover .es07l-title { text-decoration: underline; text-underline-offset: 3px; }
        .es07l-sub { margin-top: 2px; font-size: 12px; font-weight: 500; color: ${MUTED}; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .es07l-priceline { display: flex; align-items: baseline; gap: 7px; margin-top: 8px; flex-wrap: wrap; }
        .es07l-old { font-size: 12px; font-weight: 600; color: ${MUTED}; text-decoration: line-through; }
        .es07l-price { font-size: 15.5px; font-weight: 800; }
        .es07l-vat { margin-top: 2px; font-size: 10.5px; font-weight: 500; color: ${MUTED}; }
        .es07l-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 12px; }
        .es07l-stars { display: inline-flex; align-items: center; gap: 3px; }
        .es07l-stars b { font-weight: 700; font-style: normal; }
        .es07l-stars i { font-style: normal; color: ${MUTED}; }

        .es07l-more { display: flex; flex-direction: column; align-items: center; gap: 16px; margin: 34px 0 10px; }
        .es07l-seen { font-size: 13px; font-weight: 600; color: ${MUTED}; }
        .es07l-seen-bar { width: 210px; height: 3px; border-radius: 2px; background: ${BORDER}; overflow: hidden; }
        .es07l-seen-bar span { display: block; height: 100%; background: ${INK}; }
        .es07l-more-btn { display: inline-flex; align-items: center; justify-content: center; padding: 15px 30px; border: 1px solid ${INK}; color: ${INK}; background: #fff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .es07l-more-btn:hover { background: ${INK}; color: #fff; }
        .es07l-pager { display: flex; align-items: center; gap: 6px; }
        .es07l-pager a, .es07l-pager span { min-width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 13.5px; font-weight: 700; text-decoration: none; color: ${INK}; border: 1px solid transparent; transition: border-color 0.13s; padding: 0 8px; }
        .es07l-pager a:hover { border-color: ${BORDER}; }
        .es07l-pager .cur { background: ${INK}; color: #fff; }
      `}</style>

      {/* Breadcrumb */}
      <nav className="es07l-bc" aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")}>Domů</Link>
        <span>›</span>
        {current ? (
          <>
            <Link href={basePath}>Obchod</Link>
            <span>›</span>
            <span style={{ color: INK, fontWeight: 700 }}>{current.name}</span>
          </>
        ) : (
          <span style={{ color: INK, fontWeight: 700 }}>Obchod</span>
        )}
      </nav>

      <h1 className="es07l-h1">{current?.name ?? "Celá nabídka"}</h1>
      {current?.description && <p className="es07l-desc">{current.description}</p>}

      {/* Dlaždice podkategorií */}
      {children.length > 0 && (
        <div className="es07l-subs">
          {children.map((c) => (
            <Link key={c.id} href={catHref(c.slug)} className="es07l-sub-tile">
              {c.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt="" loading="lazy" />
              ) : (
                <span className="ph">{c.name.slice(0, 1)}</span>
              )}
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Top produkty */}
      {top3.length === 3 && (
        <div className="es07l-top">
          <div className="es07l-top-head">
            Top produkty
            <svg width="15" height="15" viewBox="0 0 20 20" fill={GOLD}><path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" /></svg>
          </div>
          <div className="es07l-top-grid">
            {top3.map((p, i) => (
              <Link key={p.id} href={`${basePath}/${p.slug}`} className="es07l-top-item">
                <span className="es07l-top-n">{i + 1}</span>
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" loading="lazy" />
                ) : <span style={{ width: 62, height: 62, borderRadius: 8, background: SURFACE, flexShrink: 0 }} />}
                <span style={{ minWidth: 0 }}>
                  {p.brand && <span style={{ display: "block", fontSize: 12.5, fontWeight: 800 }}>{p.brand}</span>}
                  <span className="tt" style={{ display: "block", fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{p.title}</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
                    {discountPct(p.price_min_cents, p.compare_at_max_cents) != null && (
                      <span style={{ fontSize: 11.5, color: MUTED, textDecoration: "line-through" }}>{czk(p.compare_at_max_cents!, currency)}</span>
                    )}
                    <span style={{ fontSize: 14, fontWeight: 800, color: discountPct(p.price_min_cents, p.compare_at_max_cents) != null ? PINK : INK }}>{czk(p.price_min_cents, currency)}</span>
                  </span>
                  <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: TEAL_DARK, marginTop: 1 }}>skladem</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="es07l-toolbar">
        <span className="es07l-count"><b>{total}</b> produktů</span>
        <div className="es07l-chips">
          <span style={{ alignSelf: "center", fontSize: 13, fontWeight: 600, color: MUTED, marginRight: 4 }}>Seřadit podle</span>
          {SORTS.map(([key, label]) => (
            <button key={key} type="button" className={`es07l-chip${sort === key ? " on" : ""}`} onClick={() => setSort(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Layout: sidebar + grid */}
      <div className="es07l-layout">
        <aside>
          {children.length > 0 && (
            <div className="es07l-fbox">
              <div className="es07l-flabel">Kategorie</div>
              {children.map((c) => (
                <Link key={c.id} href={catHref(c.slug)} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, fontWeight: 500, color: INK, textDecoration: "none" }}>
                  {c.name} <span style={{ color: MUTED, fontSize: 12.5 }}>({c.product_count})</span>
                </Link>
              ))}
            </div>
          )}

          <div className="es07l-fbox">
            <div className="es07l-flabel">Cena</div>
            <div className="es07l-price-row">
              <input inputMode="numeric" placeholder="Od Kč" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} aria-label="Cena od" />
              <span style={{ color: MUTED }}>–</span>
              <input inputMode="numeric" placeholder="Do Kč" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} aria-label="Cena do" />
            </div>
          </div>

          {brands.length > 0 && (
            <div className="es07l-fbox">
              <div className="es07l-flabel">Výrobce</div>
              <input className="es07l-fsearch" placeholder="Vyhledejte psaním" value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} />
              {brands
                .filter(([b]) => b.toLowerCase().includes(brandQuery.toLowerCase()))
                .map(([b, n]) => (
                  <label key={b} className="es07l-frow">
                    <input
                      type="checkbox"
                      checked={brandFilter.has(b)}
                      onChange={(e) => {
                        const next = new Set(brandFilter);
                        if (e.target.checked) next.add(b); else next.delete(b);
                        setBrandFilter(next);
                      }}
                    />
                    {b} <span className="n">({n})</span>
                  </label>
                ))}
            </div>
          )}

          <div className="es07l-fbox">
            <div className="es07l-flabel">Dostupnost a hodnocení</div>
            <label className="es07l-frow">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              Pouze skladem
            </label>
            <label className="es07l-frow">
              <input type="checkbox" checked={topRated} onChange={(e) => setTopRated(e.target.checked)} />
              4,5 ★ a více
            </label>
          </div>

          {/* Promo — ikonické vůně */}
          <Link href={`${basePath}?kategorie=niche-kolekce`} className="es07l-promo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/templates/eshop-07/gold.webp" alt="" loading="lazy" />
            <span className="ov" />
            <span className="tx">
              <span style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)" }}>Ikonické vůně</span>
              <span style={{ display: "block", marginTop: 6, fontSize: 19, fontWeight: 800, lineHeight: 1.25, textTransform: "uppercase", letterSpacing: "0.02em" }}>Kompozice, které nikdy neomrzí</span>
              <span style={{ display: "inline-flex", marginTop: 12, padding: "10px 18px", background: "#fff", color: INK, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Objevit</span>
            </span>
          </Link>

          {/* Účet */}
          <div className="es07l-account">
            <div style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.3 }}>Vytvořte si účet</div>
            <div style={{ marginTop: 4, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.55)" }}>Výhody registrace</div>
            <ul>
              {["Oblíbené produkty", "Historie nákupů", "Faktury po ruce", "Rychlejší objednání"].map((t) => (
                <li key={t}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL_DARK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 6.5" /></svg>
                  {t}
                </li>
              ))}
            </ul>
            <a href={basePath.replace(/\/obchod$/, "/obchod/ucet")}>Založit účet</a>
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "56px 24px", textAlign: "center", color: MUTED, fontSize: 14.5, fontWeight: 600 }}>
              Vybraným filtrům neodpovídá žádný produkt — zkuste je uvolnit.
            </div>
          ) : (
            <div className="es07l-grid">
              {filtered.map((p) => <Es07Card key={p.id} p={p} basePath={basePath} currency={currency} />)}
            </div>
          )}

          {/* Stránkování */}
          <div className="es07l-more">
            <span className="es07l-seen">Viděli jste {Math.min(seen, total)} produktů z {total}</span>
            <span className="es07l-seen-bar"><span style={{ width: `${Math.min(100, Math.round((Math.min(seen, total) / Math.max(1, total)) * 100))}%` }} /></span>
            {page < pages && <Link href={pageHref(page + 1)} className="es07l-more-btn">Zobrazit další</Link>}
            {pages > 1 && (
              <nav className="es07l-pager" aria-label="Stránkování">
                {page > 1 && <Link href={pageHref(page - 1)} aria-label="Předchozí">‹</Link>}
                {Array.from({ length: pages }).slice(0, 7).map((_, i) => {
                  const n = i + 1;
                  return n === page
                    ? <span key={n} className="cur">{n}</span>
                    : <Link key={n} href={pageHref(n)}>{n}</Link>;
                })}
                {pages > 7 && <span>…</span>}
                {page < pages && <Link href={pageHref(page + 1)} aria-label="Další">›</Link>}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
