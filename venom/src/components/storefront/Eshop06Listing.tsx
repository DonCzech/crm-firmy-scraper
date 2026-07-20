"use client";

/**
 * eshop-06 "Ořeškárna" — svetplodu.cz kategorie/listing.
 *
 * Layout dle předlohy (prace/eshop/svetplodu/kategorie.pdf):
 *   breadcrumb → barevný banner kategorie (Archivo nadpis + popis + žlutá
 *   řečová bublina) → dlaždice podkategorií → toolbar (počet + Seřadit)
 *   → 4sloupcový grid karet (foto 1:1, srdíčko, růžový −% kruh, NOVINKA
 *   chip, Archivo název, „Od X Kč" + přeškrtnutá) → „Načíst další" +
 *   číslované stránkování → SEO text z popisu kategorie.
 * Mobil: 2sloupcový grid, dlaždice swipe, toolbar pod sebou.
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

const CHARCOAL = "#1d1d1b";
const YELLOW = "#f6c500";
const GREEN = "#21a95c";
const MUTED = "#7a776f";
const BORDER = "#eceae6";
const SURFACE = "#f5f5f2";
const SANS = "'Figtree','Segoe UI',Arial,sans-serif";
const HEAD = "'Archivo','Helvetica Neue',Arial,sans-serif";

const PASTELS = ["#eef7e6", "#e8f1fb", "#fdeef3", "#fdf6dc", "#f3ecfb"];

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function discountPct(price: number, compare: number | null | undefined): number | null {
  if (!compare || compare <= price) return null;
  return Math.round((1 - price / compare) * 100);
}

/* ── Karta produktu (svetplodu styl) ─────────────────────────── */
function Es06Card({ p, basePath, currency }: { p: ProductItem; basePath: string; currency: string }) {
  const [liked, setLiked] = useState(false);
  const soldOut = p.stock_total <= 0;
  const pct = discountPct(p.price_min_cents, p.compare_at_max_cents);
  return (
    <Link href={`${basePath}/${p.slug}`} className="es06l-card">
      <span className="es06l-media">
        {pct != null && <span className="es06l-sale">−{pct} %</span>}
        <button
          type="button"
          aria-label="Přidat do oblíbených"
          className="es06l-heart"
          style={liked ? { opacity: 1, color: "#e04f70" } : undefined}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image_url} alt={p.title} loading="lazy" />
        ) : (
          <span className="es06l-noimg" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          </span>
        )}
        {soldOut ? (
          <span className="es06l-chip" style={{ background: "#eceae6", color: MUTED }}>Vyprodáno</span>
        ) : p.is_new ? (
          <span className="es06l-chip" style={{ background: YELLOW }}>Novinka</span>
        ) : null}
      </span>
      <span className="es06l-title">{p.title}</span>
      <span className="es06l-price">
        {pct != null && <s>{czk(p.compare_at_max_cents!, currency)}</s>}
        <b style={{ color: soldOut ? MUTED : CHARCOAL }}>
          {p.price_min_cents === p.price_max_cents ? czk(p.price_min_cents, currency) : `Od ${czk(p.price_min_cents, currency)}`}
        </b>
      </span>
    </Link>
  );
}

export function Eshop06Listing({
  items, categories, activeCategory, basePath, currency, shopName,
  total, page, pages, initialQuery,
}: Props) {
  const [sort, setSort] = useState("doporucujeme");
  const [inStockOnly, setInStockOnly] = useState(false);

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) ?? null : null;
  const subcats = useMemo(
    () => categories.filter((c) => (active ? c.parent_id === active.id : c.parent_id === null)),
    [categories, active]
  );
  const bannerBg = PASTELS[(active?.id ?? 0) % PASTELS.length];
  const shopBase = basePath.replace(/\/obchod.*$/, "/obchod");
  const catHref = (slug: string) => `${shopBase}?kategorie=${slug}`;
  const pageHref = (n: number) =>
    `${shopBase}?${activeCategory ? `kategorie=${activeCategory}&` : ""}strana=${n}`;

  const visible = useMemo(() => {
    let arr = [...items];
    if (inStockOnly) arr = arr.filter((p) => p.stock_total > 0);
    if (sort === "nejlevnejsi") arr.sort((a, b) => a.price_min_cents - b.price_min_cents);
    else if (sort === "nejdrazsi") arr.sort((a, b) => b.price_min_cents - a.price_min_cents);
    else if (sort === "novinky") arr.sort((a, b) => Number(b.is_new) - Number(a.is_new));
    return arr;
  }, [items, sort, inStockOnly]);

  const heading = active?.name ?? (initialQuery ? `Hledání „${initialQuery}“` : "Celý sortiment");
  const bannerText = active?.description
    ?? "Všechno, co u nás křupe: ořechy z vlastní pražírny, křupavé ovoce i poctivé směsi. Pražíme v malých šaržích a balíme ručně.";

  return (
    <div style={{ fontFamily: SANS, color: CHARCOAL }}>
      <style>{`
        .es06l-crumb { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: ${MUTED}; padding: 14px 0 16px; flex-wrap: wrap; }
        .es06l-crumb a { color: ${CHARCOAL}; text-decoration: underline; text-underline-offset: 3px; }
        .es06l-crumb a:hover { color: ${GREEN}; }

        .es06l-banner { position: relative; border-radius: 16px; padding: clamp(26px, 4vw, 46px) clamp(22px, 4vw, 50px); padding-right: clamp(120px, 18vw, 250px); overflow: hidden; }
        .es06l-banner h1 { font-family: ${HEAD}; font-size: clamp(26px, 3.2vw, 40px); font-weight: 800; letter-spacing: -0.02em; margin: 0 0 10px; }
        .es06l-banner p { font-size: 15px; font-weight: 500; line-height: 1.65; color: #4c4a44; max-width: 560px; margin: 0; }
        .es06l-bubble { position: absolute; top: 24px; right: 28px; background: ${YELLOW}; color: ${CHARCOAL}; font-family: ${HEAD}; font-size: 13px; font-weight: 800; text-transform: uppercase; line-height: 1.25; padding: 14px 18px; border-radius: 16px 16px 16px 4px; transform: rotate(3deg); box-shadow: 0 10px 24px rgba(29,29,27,0.14); max-width: 190px; text-align: center; }

        .es06l-tiles { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
        .es06l-tile { display: flex; align-items: center; gap: 11px; padding: 11px 18px 11px 12px; background: #fff; border: 1.5px solid ${BORDER}; border-radius: 12px; text-decoration: none; color: ${CHARCOAL}; font-family: ${HEAD}; font-size: 12.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s; }
        .es06l-tile:hover { border-color: ${CHARCOAL}; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(29,29,27,0.08); }
        .es06l-tile-ic { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-family: ${HEAD}; font-size: 14px; font-weight: 800; flex-shrink: 0; }

        .es06l-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 26px 0 18px; flex-wrap: wrap; }
        .es06l-count { font-size: 14px; font-weight: 600; color: ${MUTED}; }
        .es06l-count b { color: ${CHARCOAL}; font-weight: 800; }
        .es06l-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .es06l-stock { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border: 1.5px solid ${BORDER}; border-radius: 10px; background: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer; user-select: none; transition: border-color 0.15s; }
        .es06l-stock:hover { border-color: ${CHARCOAL}; }
        .es06l-stock input { accent-color: ${GREEN}; width: 15px; height: 15px; }
        .es06l-sort { display: inline-flex; align-items: center; gap: 9px; font-size: 13.5px; font-weight: 700; }
        .es06l-sort select { height: 42px; border: 1.5px solid ${BORDER}; border-radius: 10px; background: #fff; padding: 0 12px; font-family: ${SANS}; font-size: 13.5px; font-weight: 700; color: ${CHARCOAL}; cursor: pointer; outline: none; }
        .es06l-sort select:focus { border-color: ${CHARCOAL}; }

        .es06l-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px 18px; }
        .es06l-card { display: flex; flex-direction: column; text-decoration: none; }
        .es06l-media { position: relative; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: ${SURFACE}; display: block; }
        .es06l-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es06l-card:hover .es06l-media img { transform: scale(1.06); }
        .es06l-card:hover .es06l-title { text-decoration: underline; text-underline-offset: 3px; }
        .es06l-noimg { display: flex; align-items: center; justify-content: center; height: 100%; color: #d4d4d0; }
        .es06l-sale { position: absolute; top: 10px; left: 10px; z-index: 2; min-width: 44px; height: 44px; border-radius: 50%; background: #f8cede; color: ${CHARCOAL}; display: flex; align-items: center; justify-content: center; font-family: ${HEAD}; font-size: 12px; font-weight: 800; padding: 0 5px; }
        .es06l-heart { position: absolute; top: 10px; right: 10px; z-index: 2; width: 38px; height: 38px; border: none; border-radius: 50%; background: rgba(255,255,255,0.92); color: ${CHARCOAL}; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transform: translateY(-4px); transition: opacity 0.18s, transform 0.18s, color 0.15s; }
        .es06l-card:hover .es06l-heart { opacity: 1; transform: translateY(0); }
        .es06l-heart:hover { color: #e04f70; }
        .es06l-chip { position: absolute; left: 10px; bottom: 10px; z-index: 2; padding: 7px 12px; border-radius: 8px; background: ${YELLOW}; color: ${CHARCOAL}; font-family: ${HEAD}; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .es06l-title { font-family: ${HEAD}; font-size: 14.5px; font-weight: 800; line-height: 1.3; color: ${CHARCOAL}; margin-top: 12px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es06l-price { display: flex; align-items: baseline; gap: 8px; margin-top: 5px; font-size: 15px; }
        .es06l-price s { color: ${MUTED}; font-weight: 600; font-size: 13px; }
        .es06l-price b { font-weight: 700; }

        .es06l-more { display: flex; flex-direction: column; align-items: center; gap: 16px; margin: 34px 0 8px; }
        .es06l-more-btn { display: inline-flex; align-items: center; justify-content: center; height: 52px; padding: 0 34px; background: ${CHARCOAL}; color: #fff; border-radius: 10px; font-family: ${HEAD}; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; text-decoration: none; transition: background 0.16s; }
        .es06l-more-btn:hover { background: #000; }
        .es06l-pager { display: flex; align-items: center; gap: 6px; }
        .es06l-pager a, .es06l-pager span { min-width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 14px; font-weight: 700; color: ${CHARCOAL}; text-decoration: none; border: 1.5px solid transparent; }
        .es06l-pager a:hover { border-color: ${BORDER}; }
        .es06l-pager .es06l-pg-act { background: ${CHARCOAL}; color: #fff; }
        .es06l-strana { font-size: 13px; font-weight: 600; color: ${MUTED}; }

        .es06l-seo { margin: 36px 0 10px; padding: 26px 28px; background: ${SURFACE}; border-radius: 14px; font-size: 14px; font-weight: 500; line-height: 1.7; color: #4c4a44; }
        .es06l-seo h2 { font-family: ${HEAD}; font-size: 17px; font-weight: 800; color: ${CHARCOAL}; margin: 0 0 8px; }

        @media (max-width: 1100px) { .es06l-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px) {
          .es06l-grid { grid-template-columns: repeat(2, 1fr); gap: 18px 12px; }
          .es06l-banner { padding-right: clamp(22px, 4vw, 50px); }
          .es06l-bubble { position: static; display: inline-block; margin-bottom: 14px; transform: rotate(-2deg); }
          .es06l-tiles { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-left: -20px; margin-right: -20px; padding: 2px 20px 6px; }
          .es06l-tiles::-webkit-scrollbar { display: none; }
          .es06l-tile { white-space: nowrap; flex-shrink: 0; }
          .es06l-toolbar { flex-direction: column; align-items: flex-start; }
          .es06l-sale { min-width: 38px; height: 38px; font-size: 11px; }
          .es06l-heart { display: none; }
          .es06l-title { font-size: 13px; }
        }
      `}</style>

      {/* Breadcrumb */}
      <nav className="es06l-crumb" aria-label="Drobečková navigace">
        <Link href={shopBase.replace(/\/obchod$/, "")}>Úvod</Link>
        <span aria-hidden>/</span>
        {active ? (
          <>
            <Link href={shopBase}>Sortiment</Link>
            <span aria-hidden>/</span>
            <span>{active.name}</span>
          </>
        ) : (
          <span>{heading}</span>
        )}
      </nav>

      {/* Banner kategorie */}
      <header className="es06l-banner" style={{ background: bannerBg }}>
        <span className="es06l-bubble">To nejlepší z naší pražírny</span>
        <h1>{heading}</h1>
        <p>{bannerText}</p>
      </header>

      {/* Dlaždice podkategorií */}
      {subcats.length > 0 && (
        <div className="es06l-tiles">
          {subcats.map((c, i) => (
            <Link key={c.slug} href={catHref(c.slug)} className="es06l-tile">
              <span className="es06l-tile-ic" style={{ background: PASTELS[i % PASTELS.length] }}>{c.name.charAt(0)}</span>
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="es06l-toolbar">
        <span className="es06l-count">Zobrazujeme <b>{visible.length}</b> z <b>{total}</b> produktů</span>
        <div className="es06l-controls">
          <label className="es06l-stock">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
            Jen skladem
          </label>
          <label className="es06l-sort">
            Seřadit
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="doporucujeme">Doporučujeme</option>
              <option value="nejlevnejsi">Od nejlevnějšího</option>
              <option value="nejdrazsi">Od nejdražšího</option>
              <option value="novinky">Novinky první</option>
            </select>
          </label>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div style={{ padding: "56px 24px", textAlign: "center", color: MUTED, fontSize: 15, fontWeight: 600, background: SURFACE, borderRadius: 14 }}>
          Tady zatím nic nekřupe — zkuste jinou kategorii.
        </div>
      ) : (
        <div className="es06l-grid">
          {visible.map((p) => (
            <Es06Card key={p.id} p={p} basePath={basePath} currency={currency} />
          ))}
        </div>
      )}

      {/* Načíst další + stránkování */}
      {pages > 1 && (
        <div className="es06l-more">
          {page < pages && <Link href={pageHref(page + 1)} className="es06l-more-btn">Načíst další</Link>}
          <div className="es06l-pager">
            {page > 1 && (
              <Link href={pageHref(page - 1)} aria-label="Předchozí strana">‹</Link>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 7).map((n) =>
              n === page ? <span key={n} className="es06l-pg-act">{n}</span> : <Link key={n} href={pageHref(n)}>{n}</Link>
            )}
            {page < pages && (
              <Link href={pageHref(page + 1)} aria-label="Další strana">›</Link>
            )}
          </div>
          <span className="es06l-strana">Strana {page} z {pages}</span>
        </div>
      )}

      {/* SEO text */}
      {active?.description && (
        <div className="es06l-seo">
          <h2>{active.name} od {shopName}</h2>
          {active.description}
        </div>
      )}
    </div>
  );
}
