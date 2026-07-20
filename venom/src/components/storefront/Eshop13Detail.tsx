"use client";

/**
 * eshop-13 "LUNELA" — milagro.cz detail produktu (vlastní editorial identita).
 *
 * Layout dle milagro reference (prace/eshop/Milagro/detai-produktu.pdf):
 *   breadcrumb → [vlevo galerie 2×2 šedých dlaždic] + [vpravo: H1 sans →
 *   cena tučně → Skladem zeleně → výběr velikosti (pills) → černé „Přidat do
 *   košíku" s taškou + čtvercové srdce → benefit odkazy s line ikonami] →
 *   „Podrobnosti o výrobku" (serif) + popis + tabulka parametrů s vlasovými
 *   linkami → „Mohlo by se vám také líbit" (light nadpis + šedé karty) →
 *   USP pás na šedých dlaždicích s růžovými ikonami.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif";
const INK = "#141414";
const TILE = "#EBECE9";
const PINK_ICON = "#ee9f9c";
const STOCK = "#2e9e5b";
const MUTED = "#83837f";
const HAIR = "#e4e4e1";

export interface Es13Variant {
  id: number;
  title: string | null;
  price_cents: number;
  compare_at_price_cents?: number | null;
  stock_qty: number;
  track_stock: boolean;
  stock_policy: string;
  is_default: boolean;
}

export interface Es13Related {
  slug: string;
  title: string;
  brand?: string | null;
  price_cents: number;
  image_url: string | null;
}

interface Props {
  tenantSlug: string;
  basePath: string;
  currency: string;
  shopName: string;
  crumbs: Array<{ slug: string; name: string }>;
  product: {
    title: string;
    subtitle: string | null;
    brand: string | null;
    description: string | null;
    sku?: string | null;
    isNew: boolean;
    images: Array<{ url: string; alt: string | null }>;
  };
  variants: Es13Variant[];
  optionName: string;
  related: Es13Related[];
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function Es13MiniIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: INK, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "gift": return (<svg {...common}><path d="M4.5 12v8.5h15V12"/><path d="M3.5 8.5h17V12h-17z"/><path d="M12 8.5v12"/><path d="M12 8.5C9.5 8.5 7.8 7.6 7.8 6.2c0-1 .7-1.7 1.7-1.7 1.6 0 2.5 1.7 2.5 4Z"/><path d="M12 8.5c2.5 0 4.2-.9 4.2-2.3 0-1-.7-1.7-1.7-1.7-1.6 0-2.5 1.7-2.5 4Z"/></svg>);
    case "return": return (<svg {...common}><path d="M9.5 14.5 5 10l4.5-4.5"/><path d="M5 10h9a5 5 0 0 1 0 10h-3"/></svg>);
    case "truck": return (<svg {...common}><path d="M3 6.5h12v10H3z"/><path d="M15 10h3.8l2.2 3v3.5h-2"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>);
    case "tag": default: return (<svg {...common}><path d="m12.6 4.5 7 7a2 2 0 0 1 0 2.8l-5.3 5.3a2 2 0 0 1-2.8 0l-7-7V6.5a2 2 0 0 1 2-2Z"/><circle cx="9" cy="8.9" r="1.4"/></svg>);
  }
}

function Es13UspMini({ icon }: { icon: string }) {
  const common = { width: 44, height: 44, viewBox: "0 0 48 48", fill: "none", stroke: PINK_ICON, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "exchange": return (<svg {...common}><circle cx="24" cy="24" r="15" strokeDasharray="4.5 4.5"/><path d="M17.5 20a7.5 7.5 0 0 1 13.4-1.4"/><path d="M31.5 13.5v5h-5"/><path d="M30.5 28a7.5 7.5 0 0 1-13.4 1.4"/><path d="M16.5 34.5v-5h5"/></svg>);
    case "tag": return (<svg {...common}><path d="M25.8 9.5 38 21.7a3 3 0 0 1 0 4.2L27.9 36a3 3 0 0 1-4.2 0L11.5 23.8a3 3 0 0 1-.9-2.1V13a3 3 0 0 1 3-3h8.1a3 3 0 0 1 2.1.9Z"/><circle cx="17.6" cy="16.8" r="2.2"/><path d="m21.5 26.5 2.8 2.8 5.7-5.7"/></svg>);
    case "badge": return (<svg {...common}><circle cx="24" cy="19" r="9.5"/><path d="m21.5 19 1.8 1.8 3.4-3.4"/><path d="m18.5 27-3.5 9 5.6-2.4 2 5.4 3-8.4"/><path d="m29.5 27 3.5 9-5.6-2.4-2 5.4-3-8.4"/></svg>);
    case "truck": return (<svg {...common}><path d="M12 14h17v16H15"/><path d="M29 19h6.5l4 5.5V30h-3"/><circle cx="19.5" cy="31.5" r="3"/><circle cx="32.5" cy="31.5" r="3"/><path d="M6 18h7"/><path d="M4 22h6"/></svg>);
    case "store": default: return (<svg {...common}><path d="M11 21v15h26V21"/><path d="M9 13h30l1.8 5a4.4 4.4 0 0 1-4.4 4.5 4.6 4.6 0 0 1-4.5-3.5 4.6 4.6 0 0 1-4.5 3.5A4.6 4.6 0 0 1 24 19.9a4.6 4.6 0 0 1-4.4 3.6 4.6 4.6 0 0 1-4.5-3.5 4.6 4.6 0 0 1-4.5 3.5A4.4 4.4 0 0 1 6.2 18Z"/><path d="M20 36v-8h8v8"/></svg>);
  }
}

const USP_ITEMS = [
  { icon: "exchange", title: "Výměna & Vrácení", text: "Výměna nebo vrácení do 30 dnů" },
  { icon: "tag", title: "Pravost & Původ", text: "Ručíme za pravost a původ našich šperků" },
  { icon: "badge", title: "Autorizovaný prodejce", text: "Jsme autorizovaný e-shop značek AURELLE a PALMERA" },
  { icon: "truck", title: "Doprava zdarma", text: "Dopravu zdarma získáte při nákupu nad 1 500 Kč" },
  { icon: "store", title: "Kamenné prodejny", text: "Máme 3 kamenné prodejny v ČR" },
];

export function Eshop13Detail({ tenantSlug, basePath, currency, crumbs, product, variants, optionName, related }: Props) {
  const inStock = (v: Es13Variant) => !v.track_stock || v.stock_qty > 0 || v.stock_policy === "continue";
  const firstAvailable = useMemo(() => variants.find((v) => v.is_default && inStock(v)) ?? variants.find(inStock) ?? variants[0], [variants]);
  const hasSizes = variants.length > 1;
  const [variantId, setVariantId] = useState<number | null>(hasSizes ? null : firstAvailable?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [needSize, setNeedSize] = useState(false);
  const [liked, setLiked] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const shown = selected ?? firstAvailable;
  const onSale = shown?.compare_at_price_cents != null && shown.compare_at_price_cents > shown.price_cents;
  const anyStock = variants.some(inStock);

  const brand = product.brand ?? "";
  const titleRest = brand ? product.title.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "") : product.title;

  const addToCart = async () => {
    if (busy) return;
    const v = hasSizes ? selected : firstAvailable;
    if (hasSizes && !selected) { setNeedSize(true); return; }
    if (!v) return;
    setBusy(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: v.id, qty: 1 }),
      });
      window.dispatchEvent(new CustomEvent("webero-cart-item-added", { detail: { title: product.title } }));
      window.dispatchEvent(new Event("webero-cart-updated"));
    } finally {
      setBusy(false);
    }
  };

  const specs: Array<[string, string]> = [
    ...(brand ? [["Značka", brand] as [string, string]] : []),
    ...(hasSizes ? [[optionName, variants.map(v => v.title).filter(Boolean).join(", ")] as [string, string]] : []),
    ["Dostupnost", anyStock ? "Skladem, expedice do 24 h" : "Aktuálně vyprodáno"],
    ["Dárkové balení", "Zdarma ke každé objednávce"],
    ["Záruka", "24 měsíců"],
    ["Pravost", "Garance pravosti a původu LUNELA"],
  ];

  const benefits = [
    { icon: "gift", label: "Dárkové balení šperků" },
    { icon: "return", label: "30 dní na vrácení" },
    { icon: "truck", label: "Možnosti doručení" },
    { icon: "tag", label: "10 % sleva na první objednávku" },
  ];

  const gallery = product.images.slice(0, 4);

  return (
    <div style={{ fontFamily: SANS, color: INK, maxWidth: 1140, margin: "0 auto", padding: "0 15px" }}>
      <style>{`
        .es13d-breadcrumb { display: flex; align-items: center; gap: 9px; padding: 20px 0 22px; font-size: 12.5px; color: ${MUTED}; }
        .es13d-breadcrumb a { color: ${MUTED}; text-decoration: none; }
        .es13d-breadcrumb a:hover { color: ${INK}; text-decoration: underline; text-underline-offset: 3px; }

        .es13d-top { display: grid; grid-template-columns: minmax(0, 58fr) minmax(0, 42fr); gap: 44px; align-items: start; }
        .es13d-gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .es13d-shot { aspect-ratio: 1 / 1; background: ${TILE}; overflow: hidden; }
        .es13d-shot img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es13d-shot:hover img { transform: scale(1.04); }

        .es13d-h1 { font-size: 27px; font-weight: 400; line-height: 1.35; margin: 0; }
        .es13d-price { font-size: 23px; font-weight: 700; margin-top: 10px; }
        .es13d-compare { font-size: 15px; color: ${MUTED}; text-decoration: line-through; font-weight: 400; margin-left: 10px; }

        .es13d-sizes { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .es13d-size { min-width: 52px; padding: 11px 14px; border: 1px solid #d6d6d2; background: #fff; font-family: ${SANS};
          font-size: 14px; color: ${INK}; cursor: pointer; text-align: center; transition: border-color 0.14s, background 0.14s, color 0.14s; }
        .es13d-size:hover { border-color: ${INK}; }
        .es13d-size--active { background: ${INK}; border-color: ${INK}; color: #fff; }

        .es13d-buy { display: flex; gap: 2px; margin-top: 22px; }
        .es13d-cart { flex: 1; height: 56px; border: none; background: ${INK}; color: #fff; font-family: ${SERIF};
          font-size: 18px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 12px;
          transition: background 0.16s, letter-spacing 0.2s; }
        .es13d-cart:hover { background: #000; }
        .es13d-cart:disabled { background: #b9b9b5; cursor: not-allowed; }
        .es13d-heart { width: 56px; height: 56px; border: none; background: ${INK}; color: #fff; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; transition: background 0.16s; }
        .es13d-heart:hover { background: #000; }

        .es13d-benefit { display: flex; align-items: center; gap: 14px; margin-top: 18px; font-size: 14px; color: ${INK}; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
        .es13d-benefit:hover { opacity: 0.6; }

        .es13d-details { max-width: 760px; margin: 64px auto 0; }
        .es13d-h2 { font-family: ${SERIF}; font-size: 27px; font-weight: 700; margin: 0 0 18px; }
        .es13d-desc { font-size: 15px; line-height: 1.75; color: #2f2f2c; margin: 0 0 26px; }
        .es13d-table { width: 100%; border-collapse: collapse; }
        .es13d-table td { border-bottom: 1px solid ${HAIR}; padding: 13px 4px; font-size: 14px; vertical-align: top; }
        .es13d-table td:first-child { color: ${INK}; width: 42%; }
        .es13d-table td:last-child { color: #2f2f2c; }

        .es13d-related { margin-top: 70px; }
        .es13d-h3 { font-size: 30px; font-weight: 300; margin: 0 0 24px; }
        .es13d-rel-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .es13d-rel-card { display: flex; flex-direction: column; background: ${TILE}; text-decoration: none; color: ${INK}; transition: transform 0.2s, box-shadow 0.2s; }
        .es13d-rel-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(20,20,20,0.12); }
        .es13d-rel-media { aspect-ratio: 1 / 1; overflow: hidden; }
        .es13d-rel-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(0.16,1,0.3,1); }
        .es13d-rel-card:hover .es13d-rel-media img { transform: scale(1.05); }
        .es13d-rel-body { padding: 4px 18px 20px; }
        .es13d-rel-name { font-size: 13.5px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .es13d-rel-brand { color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.03em; }
        .es13d-rel-price { font-size: 15.5px; font-weight: 700; margin-top: 9px; display: block; }

        .es13d-usp { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; margin: 70px 0 40px; }
        .es13d-usp-cell { background: #f2f2f0; padding: 26px 22px; display: flex; flex-direction: column; align-items: flex-start; }
        .es13d-usp-title { font-family: ${SERIF}; font-size: 17px; font-weight: 700; line-height: 1.5; margin: 14px 0 0; max-width: 120; }
        .es13d-usp-text { font-size: 13px; line-height: 1.55; color: #3c3c39; margin: 10px 0 0; max-width: 150px; }

        @media (max-width: 960px) {
          .es13d-top { grid-template-columns: 1fr; gap: 26px; }
          .es13d-rel-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .es13d-usp { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* Breadcrumb */}
      <nav className="es13d-breadcrumb" aria-label="Drobečková navigace">
        <Link href={basePath.replace(/\/obchod$/, "")}>Úvodní stránka</Link>
        {crumbs.map((c) => (
          <span key={c.slug} style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span aria-hidden>›</span>
            <Link href={`${basePath}?kategorie=${c.slug}`}>{c.name}</Link>
          </span>
        ))}
      </nav>

      <div className="es13d-top">
        {/* Galerie 2×2 */}
        <div className="es13d-gallery">
          {(gallery.length ? gallery : [null]).map((im, i) => (
            <span key={i} className="es13d-shot" style={gallery.length <= 1 ? { gridColumn: "1 / -1", aspectRatio: "10 / 8" } : undefined}>
              {im && <img src={im.url} alt={im.alt ?? product.title} loading={i === 0 ? "eager" : "lazy"} />}
            </span>
          ))}
        </div>

        {/* Pravý sloupec */}
        <div>
          <h1 className="es13d-h1">
            {brand && <span style={{ color: MUTED, textTransform: "uppercase", letterSpacing: "0.03em" }}>{brand}</span>}{brand ? " " : ""}{titleRest}
          </h1>
          <p className="es13d-price">
            {shown ? czk(shown.price_cents, currency) : "—"}
            {onSale && <span className="es13d-compare">{czk(shown!.compare_at_price_cents!, currency)}</span>}
          </p>
          <p style={{ marginTop: 16, fontSize: 13.5, fontWeight: 700, color: anyStock ? STOCK : MUTED }}>
            {anyStock ? "Skladem" : "Vyprodáno"}
          </p>

          {hasSizes && (
            <>
              <p style={{ margin: "20px 0 0", fontSize: 13.5, color: MUTED }}>
                {optionName}{needSize && !selected && <span style={{ color: "#c73737", fontWeight: 600 }}> — nejprve vyberte</span>}
              </p>
              <div className="es13d-sizes">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    className={`es13d-size${v.id === variantId ? " es13d-size--active" : ""}`}
                    disabled={!inStock(v)}
                    style={!inStock(v) ? { opacity: 0.4, cursor: "not-allowed", textDecoration: "line-through" } : undefined}
                    onClick={() => { setVariantId(v.id); setNeedSize(false); }}
                  >{v.title}</button>
                ))}
              </div>
            </>
          )}

          <div className="es13d-buy">
            <button className="es13d-cart" onClick={addToCart} disabled={!anyStock || busy}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 8h13l-.9 12.1a1.5 1.5 0 0 1-1.5 1.4H7.9a1.5 1.5 0 0 1-1.5-1.4L5.5 8Z"/><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10"/></svg>
              {busy ? "Přidávám…" : "Přidat do košíku"}
            </button>
            <button className="es13d-heart" aria-label="Přidat do oblíbených" aria-pressed={liked} onClick={() => setLiked(l => !l)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "#FFD2D0" : "none"} stroke={liked ? "#FFD2D0" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15.6 3.5 9.7a4.7 4.7 0 0 1 8.5-2.8A4.7 4.7 0 0 1 20.5 9.7c0 5.9-8.5 10.8-8.5 10.8z"/></svg>
            </button>
          </div>

          <div style={{ marginTop: 14 }}>
            {benefits.map((b) => (
              <a key={b.icon} href="#" onClick={(e) => e.preventDefault()} className="es13d-benefit">
                <Es13MiniIcon name={b.icon} />
                {b.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Podrobnosti */}
      <div className="es13d-details">
        <h2 className="es13d-h2">Podrobnosti o výrobku</h2>
        {(product.description || product.subtitle) && <p className="es13d-desc">{product.description ?? product.subtitle}</p>}
        <table className="es13d-table">
          <tbody>
            {specs.map(([k, v]) => (
              <tr key={k}><td>{k}</td><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mohlo by se vám také líbit */}
      {related.length > 0 && (
        <div className="es13d-related">
          <h2 className="es13d-h3">Mohlo by se vám také líbit</h2>
          <div className="es13d-rel-grid">
            {related.slice(0, 4).map((r) => {
              const rb = r.brand ?? "";
              const rRest = rb ? r.title.replace(new RegExp(`^${rb.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "") : r.title;
              return (
                <Link key={r.slug} href={`${basePath}/${r.slug}`} className="es13d-rel-card">
                  <span className="es13d-rel-media">
                    {r.image_url && <img src={r.image_url} alt={r.title} loading="lazy" />}
                  </span>
                  <span className="es13d-rel-body">
                    <span className="es13d-rel-name">{rb && <span className="es13d-rel-brand">{rb}</span>}{rb ? " " : ""}{rRest}</span>
                    <span className="es13d-rel-price">{czk(r.price_cents, currency)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* USP pás */}
      <div className="es13d-usp">
        {USP_ITEMS.map((u) => (
          <div key={u.icon} className="es13d-usp-cell">
            <Es13UspMini icon={u.icon} />
            <h3 className="es13d-usp-title">{u.title}</h3>
            <p className="es13d-usp-text">{u.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
