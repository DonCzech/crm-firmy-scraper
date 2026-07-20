"use client";

/**
 * Webero Commerce — produktové sekce (`featured-products`, `product-grid`).
 *
 * Data přicházejí server-side v content.__commerce (hydrateCommerceSections)
 * — vždy z commerce tabulek, nikdy z editoru. Texty (eyebrow, heading, CTA)
 * jsou plně editovatelné přes GenericEditableText.
 *
 * Výchozí varianta = eshop-01 "Editorial": bílé plátno, přesná typografická
 * škála, karty s hover zoomem, badge Novinka/Sleva, vyprodáno stav.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import type { CommerceProductCard, CommerceSectionData } from "@/lib/commerce/section-data";

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);
}

function ProductCard({ product, currency, storeBase, isAdmin }: {
  product: CommerceProductCard;
  currency: string;
  storeBase: string;
  isAdmin: boolean;
}) {
  const soldOut = product.stock_total <= 0;
  const onSale = product.compare_at_price_cents != null && product.compare_at_price_cents > product.price_min_cents;
  const isNew = product.flags?.new === true;
  // V editoru nechceme odklikávat pryč z canvasu.
  const href = isAdmin ? "#" : `${storeBase}/${product.slug}`;

  return (
    <Link href={href} className="wc-card group" aria-disabled={isAdmin}>
      <div className="wc-card-media">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.image_alt ?? product.title} loading="lazy" />
        ) : (
          <div className="wc-card-placeholder" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        {(isNew || onSale || soldOut) && (
          <div className="wc-card-badges">
            {soldOut ? (
              <span className="wc-badge wc-badge-soldout">Vyprodáno</span>
            ) : (
              <>
                {isNew && <span className="wc-badge wc-badge-new">Novinka</span>}
                {onSale && <span className="wc-badge wc-badge-sale">Sleva</span>}
              </>
            )}
          </div>
        )}
      </div>
      {product.brand && <p className="wc-card-brand">{product.brand}</p>}
      <h3 className="wc-card-title">{product.title}</h3>
      <p className="wc-card-price">
        <span className={soldOut ? "wc-price-muted" : ""}>
          {product.price_min_cents === product.price_max_cents
            ? czk(product.price_min_cents, currency)
            : `od ${czk(product.price_min_cents, currency)}`}
        </span>
        {onSale && (
          <span className="wc-price-compare">{czk(product.compare_at_price_cents!, currency)}</span>
        )}
      </p>
    </Link>
  );
}

// ── eshop-02 (Shoptet Classic) ─────────────────────────────────────────────────
// Konverzní karty: bílá karta s borderem, 1:1 foto, badge AKCE/NOVINKA s % slevy,
// dostupnost „Skladem", modrá cena + přeškrtnutá původní, CTA „Do košíku" → PDP.
function Eshop02ProductCard({ product, currency, storeBase, isAdmin }: {
  product: CommerceProductCard;
  currency: string;
  storeBase: string;
  isAdmin: boolean;
}) {
  const soldOut = product.stock_total <= 0;
  const onSale = product.compare_at_price_cents != null && product.compare_at_price_cents > product.price_min_cents;
  const isNew = product.flags?.new === true;
  const salePct = onSale
    ? Math.round((1 - product.price_min_cents / product.compare_at_price_cents!) * 100)
    : 0;
  const href = isAdmin ? "#" : `${storeBase}/${product.slug}`;

  return (
    <Link href={href} className="wc2-card" aria-disabled={isAdmin}>
      <div className="wc2-media">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.image_alt ?? product.title} loading="lazy" />
        ) : (
          <div className="wc2-placeholder" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="wc2-badges">
          {soldOut ? (
            <span className="wc2-badge wc2-badge-soldout">Vyprodáno</span>
          ) : (
            <>
              {onSale && salePct > 0 && <span className="wc2-badge wc2-badge-sale">−{salePct} %</span>}
              {isNew && <span className="wc2-badge wc2-badge-new">Novinka</span>}
            </>
          )}
        </div>
      </div>
      <div className="wc2-body">
        {product.brand ? <p className="wc2-brand">{product.brand}</p> : <p className="wc2-brand">&nbsp;</p>}
        <h3 className="wc2-title">{product.title}</h3>
        <p className={`wc2-stock ${soldOut ? "wc2-stock-out" : ""}`}>
          {soldOut ? "Vyprodáno" : `Skladem (${product.stock_total} ks)`}
        </p>
        <div className="wc2-priceline">
          <span className="wc2-price">
            {product.price_min_cents === product.price_max_cents
              ? czk(product.price_min_cents, currency)
              : `od ${czk(product.price_min_cents, currency)}`}
          </span>
          {onSale && <span className="wc2-compare">{czk(product.compare_at_price_cents!, currency)}</span>}
        </div>
        <span className={`wc2-buy ${soldOut ? "wc2-buy-disabled" : ""}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 7h12l-1.2 10.5a1.8 1.8 0 0 1-1.8 1.5H9a1.8 1.8 0 0 1-1.8-1.5L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
          {soldOut ? "Detail produktu" : "Do košíku"}
        </span>
      </div>
    </Link>
  );
}

function Eshop02ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = data.products ?? [];
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");

  const eyebrow = content.eyebrow === undefined ? "" : String(content.eyebrow);
  const heading = content.heading === undefined ? "Akční zboží" : String(content.heading);
  const ctaLabel = content.ctaLabel === undefined ? "Všechny akce" : String(content.ctaLabel);
  const ctaHref = typeof content.ctaHref === "string" ? content.ctaHref : "";
  const accent = content.tone === "accent";
  const columns = Math.min(6, Math.max(2, Number(content.columns) || 4));

  if (!products.length && !isAdmin) return null;

  const ctaTarget = isAdmin ? "#" : (ctaHref ? `${storeBase.replace(/\/obchod$/, "")}${ctaHref}` : storeBase);

  return (
    <section className="wc2-products" data-variant={variant} id={typeof content.anchorId === "string" ? content.anchorId : undefined}>
      <style>{`
        .wc2-products { background: #fff; color: #142b45; font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif; }
        .wc2-inner { max-width: 1280px; margin: 0 auto; padding: clamp(44px,5.5vw,80px) 20px; }
        .wc2-head { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: clamp(22px,3vw,34px); }
        .wc2-headline { display: flex; align-items: center; gap: 12px; }
        .wc2-flash { width: 38px; height: 38px; border-radius: 10px; background: #f0803c18; color: #f0803c; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wc2-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #64748b; margin: 0 0 6px; }
        .wc2-heading { font-size: clamp(22px,2.6vw,32px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin: 0; }
        .wc2-cta { flex-shrink: 0; display: inline-flex; align-items: center; gap: 7px; height: 42px; padding: 0 18px; border-radius: 8px; border: 1.5px solid #e3e9f0; color: #1266cc; font-size: 13.5px; font-weight: 700; text-decoration: none; transition: border-color .15s, background .15s; }
        .wc2-cta:hover { border-color: #1266cc; background: #1266cc0a; }
        .wc2-grid { display: grid; grid-template-columns: repeat(var(--wc2-cols, 4), 1fr); gap: 16px; }
        @media (max-width: 1024px) { .wc2-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px)  { .wc2-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        .wc2-card { display: flex; flex-direction: column; text-decoration: none; color: inherit; background: #fff; border: 1px solid #e3e9f0; border-radius: 12px; overflow: hidden; transition: box-shadow .2s, transform .2s, border-color .2s; }
        .wc2-card:hover { box-shadow: 0 14px 34px rgba(20,43,69,0.1); transform: translateY(-3px); border-color: #d3dce6; }
        .wc2-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: #f5f8fb; }
        .wc2-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s cubic-bezier(.2,.6,.2,1); }
        .wc2-card:hover .wc2-media img { transform: scale(1.05); }
        .wc2-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #cbd5e1; }
        .wc2-badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
        .wc2-badge { font-size: 11px; font-weight: 800; letter-spacing: .04em; padding: 4px 9px; border-radius: 6px; }
        .wc2-badge-sale { background: #f0803c; color: #fff; }
        .wc2-badge-new { background: #1266cc; color: #fff; }
        .wc2-badge-soldout { background: rgba(255,255,255,0.94); color: #64748b; }
        .wc2-body { display: flex; flex-direction: column; flex: 1; padding: 14px 16px 16px; }
        .wc2-brand { margin: 0; font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #94a3b8; }
        .wc2-title { margin: 4px 0 0; font-size: 14px; font-weight: 700; line-height: 1.35; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.7em; }
        .wc2-stock { margin: 6px 0 0; font-size: 12px; font-weight: 600; color: #1e9e50; }
        .wc2-stock-out { color: #94a3b8; }
        .wc2-priceline { margin-top: 8px; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .wc2-price { font-size: 17px; font-weight: 800; color: #1266cc; letter-spacing: -0.01em; }
        .wc2-compare { font-size: 12.5px; font-weight: 600; color: #94a3b8; text-decoration: line-through; }
        .wc2-buy { margin-top: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 40px; border-radius: 8px; background: #1266cc; color: #fff; font-size: 13px; font-weight: 700; transition: background .15s; }
        .wc2-card:hover .wc2-buy { background: #0e51a3; }
        .wc2-buy-disabled { background: #e2e8f0; color: #64748b; }
        .wc2-card:hover .wc2-buy-disabled { background: #cbd5e1; }
        .wc2-empty { border: 1px dashed #cbd5e1; border-radius: 12px; padding: 48px 24px; text-align: center; color: #64748b; font-size: 14px; }
      `}</style>
      <div className="wc2-inner">
        <div className="wc2-head">
          <div className="wc2-headline">
            {accent && (
              <span className="wc2-flash" aria-hidden>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2Z"/></svg>
              </span>
            )}
            <div>
              {eyebrow.trim() !== "" && (
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="wc2-eyebrow" />
              )}
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc2-heading" />
            </div>
          </div>
          {ctaLabel.trim() !== "" && (
            <Link href={ctaTarget} className="wc2-cta">
              <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="wc2-empty">
            {"Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty)."}
          </div>
        ) : (
          <div className="wc2-grid" style={{ ["--wc2-cols" as string]: columns }}>
            {products.map((p) => (
              <Eshop02ProductCard key={p.id} product={p} currency={currency} storeBase={storeBase} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CommerceProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  if (variant === "eshop-05-products") {
    return <Eshop05ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-06-products") {
    return <Eshop06ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-07-products") {
    return <Eshop07ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-09-products") {
    return <Eshop09ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-10-products") {
    return <Eshop10ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-14-products") {
    return <Eshop14ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-16-products") {
    return <Eshop16ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-18-products") {
    return <Eshop18ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-20-products") {
    return <Eshop20ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-19-products") {
    return <Eshop19ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-17-products") {
    return <Eshop17ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-15-picks") {
    return <Eshop15ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-16-sale") {
    return <Eshop16SaleSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-16-multibuy") {
    return <Eshop16MultibuySection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-12-products") {
    return <Eshop12ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-13-products") {
    return <Eshop13ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-13-gift-grid") {
    return <Eshop13GiftGridSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-11-products") {
    return <Eshop11ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-11-brand-banner") {
    return <Eshop11BrandBanner content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-08-products") {
    return <Eshop08ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-02-products") {
    return <Eshop02ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-03-products") {
    return <Eshop03ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  if (variant === "eshop-04-products") {
    return <Eshop04ProductsSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = data.products ?? [];
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");

  const eyebrow = content.eyebrow === undefined ? "Náš výběr" : String(content.eyebrow);
  const heading = content.heading === undefined ? "Doporučujeme" : String(content.heading);
  const ctaLabel = content.ctaLabel === undefined ? "Zobrazit celý obchod" : String(content.ctaLabel);
  const columns = Math.min(6, Math.max(2, Number(content.columns) || 4));

  if (!products.length && !isAdmin) return null;

  return (
    <section className="wc-products" data-variant={variant} id={typeof content.anchorId === "string" ? content.anchorId : undefined}>
      <style>{`
        .wc-products { background: #fff; color: #101010; font-family: inherit; }
        .wc-products-inner { max-width: 1280px; margin: 0 auto; padding: clamp(56px,7vw,104px) 24px; }
        .wc-products-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: clamp(28px,4vw,48px); }
        .wc-products-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #9a9a9a; margin: 0 0 10px; }
        .wc-products-title { font-size: clamp(26px,3.4vw,44px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; margin: 0; }
        .wc-products-cta { flex-shrink: 0; font-size: 13.5px; font-weight: 600; color: #101010; text-decoration: none; border-bottom: 1px solid #101010; padding-bottom: 2px; transition: opacity .2s; }
        .wc-products-cta:hover { opacity: .55; }
        .wc-grid { display: grid; grid-template-columns: repeat(var(--wc-cols, 4), 1fr); gap: clamp(16px,2.2vw,28px) clamp(12px,1.8vw,22px); }
        @media (max-width: 1024px) { .wc-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px)  { .wc-grid { grid-template-columns: repeat(2, 1fr); } }
        .wc-card { display: block; text-decoration: none; color: inherit; }
        .wc-card-media { position: relative; aspect-ratio: 3/4; overflow: hidden; border-radius: 10px; background: #f4f4f2; }
        .wc-card-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s cubic-bezier(.2,.6,.2,1); }
        .wc-card:hover .wc-card-media img { transform: scale(1.045); }
        .wc-card-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #d4d4d0; }
        .wc-card-badges { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; }
        .wc-badge { font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 4px 9px; border-radius: 999px; }
        .wc-badge-new { background: #101010; color: #fff; }
        .wc-badge-sale { background: #c8442c; color: #fff; }
        .wc-badge-soldout { background: rgba(255,255,255,0.92); color: #6b6b6b; }
        .wc-card-brand { margin: 12px 0 0; font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #a0a0a0; }
        .wc-card-title { margin: 4px 0 0; font-size: 14.5px; font-weight: 600; line-height: 1.35; letter-spacing: -0.01em; }
        .wc-card:hover .wc-card-title { text-decoration: underline; text-underline-offset: 3px; }
        .wc-card-price { margin: 5px 0 0; font-size: 14px; font-weight: 600; display: flex; gap: 8px; align-items: baseline; }
        .wc-price-muted { color: #a8a8a8; }
        .wc-price-compare { color: #b0b0b0; text-decoration: line-through; font-weight: 500; font-size: 12.5px; }
        .wc-products-empty { border: 1px dashed #d8d8d4; border-radius: 12px; padding: 48px 24px; text-align: center; color: #9a9a9a; font-size: 14px; }
      `}</style>
      <div className="wc-products-inner">
        <div className="wc-products-head">
          <div>
            {eyebrow.trim() !== "" && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="wc-products-eyebrow" />
            )}
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc-products-title" />
          </div>
          {ctaLabel.trim() !== "" && (
            <Link href={isAdmin ? "#" : storeBase} className="wc-products-cta">
              <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
              {" →"}
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="wc-products-empty">
            {"Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty) nebo označte produkty jako „doporučené“."}
          </div>
        ) : (
          <div className="wc-grid" style={{ ["--wc-cols" as string]: columns }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} currency={currency} storeBase={storeBase} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-03 (Shoptet Disco) ───────────────────────────────────────────────────
// Disco produktové karty: flat bílá karta s borderem (radius 0), 1:1 foto,
// hranaté badge Akce (červená #d00000) / Novinka (modrá #086df7) / Tip (žlutá),
// dostupnost „Skladem" zeleně, černá cena Nunito 800 + přeškrtnutá původní,
// žluté uppercase CTA „Do košíku". Hover: shadow + podtržený titulek.
function Eshop03ProductCard({ product, currency, storeBase, isAdmin }: {
  product: CommerceProductCard;
  currency: string;
  storeBase: string;
  isAdmin: boolean;
}) {
  const soldOut = product.stock_total <= 0;
  const onSale = product.compare_at_price_cents != null && product.compare_at_price_cents > product.price_min_cents;
  const isNew = product.flags?.new === true;
  const salePct = onSale
    ? Math.round((1 - product.price_min_cents / product.compare_at_price_cents!) * 100)
    : 0;
  const href = isAdmin ? "#" : `${storeBase}/${product.slug}`;

  return (
    <Link href={href} className="wc3-card" aria-disabled={isAdmin}>
      <div className="wc3-media">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.image_alt ?? product.title} loading="lazy" />
        ) : (
          <div className="wc3-placeholder" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="wc3-badges">
          {soldOut ? (
            <span className="wc3-badge wc3-badge-soldout">Vyprodáno</span>
          ) : (
            <>
              {onSale && salePct > 0 && <span className="wc3-badge wc3-badge-sale">Akce −{salePct} %</span>}
              {isNew && <span className="wc3-badge wc3-badge-new">Novinka</span>}
            </>
          )}
        </div>
      </div>
      <div className="wc3-body">
        {product.brand ? <p className="wc3-brand">{product.brand}</p> : <p className="wc3-brand">&nbsp;</p>}
        <h3 className="wc3-title">{product.title}</h3>
        <p className={`wc3-stock ${soldOut ? "wc3-stock-out" : ""}`}>
          {soldOut ? "Vyprodáno" : "Skladem"}
        </p>
        <div className="wc3-priceline">
          <span className="wc3-price">
            {product.price_min_cents === product.price_max_cents
              ? czk(product.price_min_cents, currency)
              : `od ${czk(product.price_min_cents, currency)}`}
          </span>
          {onSale && <span className="wc3-compare">{czk(product.compare_at_price_cents!, currency)}</span>}
        </div>
      </div>
    </Link>
  );
}

function Eshop03ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = data.products ?? [];
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");

  const heading = content.heading === undefined ? "Doporučujeme" : String(content.heading);
  const ctaLabel = content.ctaLabel === undefined ? "Zobrazit vše" : String(content.ctaLabel);
  const ctaHref = typeof content.ctaHref === "string" ? content.ctaHref : "";
  const columns = Math.min(6, Math.max(2, Number(content.columns) || 4));

  if (!products.length && !isAdmin) return null;

  const ctaTarget = isAdmin ? "#" : (ctaHref ? `${storeBase.replace(/\/obchod$/, "")}${ctaHref}` : storeBase);

  return (
    <section className="wc3-products" data-variant={variant} id={typeof content.anchorId === "string" ? content.anchorId : undefined}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" />
      <style>{`
        .wc3-products { background: #fff; color: #1f1f1f; font-family: 'Nunito', 'Segoe UI', Arial, sans-serif; }
        .wc3-inner { max-width: 1280px; margin: 0 auto; padding: clamp(36px,4.5vw,64px) 20px; }
        .wc3-head { display: flex; align-items: baseline; justify-content: space-between; gap: 20px; margin-bottom: clamp(20px,2.6vw,30px); }
        .wc3-heading { font-size: clamp(24px,2.8vw,34px); font-weight: 900; letter-spacing: -0.01em; line-height: 1.1; margin: 0; color: #000; }
        .wc3-cta { flex-shrink: 0; font-size: 14px; font-weight: 800; color: #000; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; transition: color .2s; }
        .wc3-cta:hover { color: #FFC500; }
        .wc3-grid { display: grid; grid-template-columns: repeat(var(--wc3-cols, 4), 1fr); gap: 16px; }
        @media (max-width: 1024px) { .wc3-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 720px)  { .wc3-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        .wc3-card { display: flex; flex-direction: column; text-decoration: none; color: inherit; background: #fff; border: 1px solid #e6e6e6; overflow: hidden; transition: box-shadow .2s; }
        .wc3-card:hover { box-shadow: 0 0 14px rgba(0,0,0,0.16); }
        .wc3-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: #f6f6f6; }
        .wc3-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
        .wc3-card:hover .wc3-media img { transform: scale(1.04); }
        .wc3-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #ccc; }
        .wc3-badges { position: absolute; top: 0; left: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
        .wc3-badge { font-size: 11.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; padding: 5px 10px; }
        .wc3-badge-sale { background: #d00000; color: #fff; }
        .wc3-badge-new { background: #086df7; color: #fff; }
        .wc3-badge-soldout { background: rgba(255,255,255,0.94); color: #767676; }
        .wc3-body { display: flex; flex-direction: column; flex: 1; padding: 14px 16px 16px; }
        .wc3-brand { margin: 0; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #999; }
        .wc3-title { margin: 4px 0 0; font-size: 15px; font-weight: 700; line-height: 1.35; color: #000; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.7em; }
        .wc3-card:hover .wc3-title { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
        .wc3-stock { margin: 6px 0 0; font-size: 12.5px; font-weight: 700; color: #3a800e; }
        .wc3-stock-out { color: #999; }
        .wc3-priceline { margin-top: 6px; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
        .wc3-price { font-size: 18px; font-weight: 800; color: #000; }
        .wc3-compare { font-size: 12.5px; font-weight: 600; color: #999; text-decoration: line-through; }
        .wc3-empty { border: 1px dashed #ccc; padding: 48px 24px; text-align: center; color: #767676; font-size: 14px; }
      `}</style>
      <div className="wc3-inner">
        <div className="wc3-head">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc3-heading" />
          {ctaLabel.trim() !== "" && (
            <Link href={ctaTarget} className="wc3-cta">
              <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="wc3-empty">
            {"Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty)."}
          </div>
        ) : (
          <div className="wc3-grid" style={{ ["--wc3-cols" as string]: columns }}>
            {products.map((p) => (
              <Eshop03ProductCard key={p.id} product={p} currency={currency} storeBase={storeBase} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-04 (Shoptet Samba) ───────────────────────────────────────────────────
// Samba product-slider 1:1 dle reálného webu: FULLSCREEN sekce, centrované
// karty — Tip/Novinka/Akce pill nad fotkou, produktová fotka CONTAIN na bílé,
// centrovaný tučný název, „X Kč bez DPH" šedě, cena tučně, Skladem (x ks)
// zeleně / Vyprodáno červeně, periwinkle „Do košíku" s ikonou a textem.
// Tenké chevron šipky na krajích obrazovky + čárková paginace dole.
function Eshop04ProductCard({ product, currency, storeBase, isAdmin }: {
  product: CommerceProductCard;
  currency: string;
  storeBase: string;
  isAdmin: boolean;
}) {
  const soldOut = product.stock_total <= 0;
  const onSale = product.compare_at_price_cents != null && product.compare_at_price_cents > product.price_min_cents;
  const isNew = product.flags?.new === true;
  const href = isAdmin ? "#" : `${storeBase}/${product.slug}`;

  return (
    <Link href={href} className="wc4-card" aria-disabled={isAdmin}>
      <div className="wc4-media">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.image_alt ?? product.title} loading="lazy" />
        ) : (
          <div className="wc4-placeholder" aria-hidden>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="wc4-flags">
          {isNew && <span className="wc4-flag wc4-flag-new">Novinka</span>}
          {onSale && <span className="wc4-flag wc4-flag-sale">Akce</span>}
          {!isNew && !onSale && <span className="wc4-flag wc4-flag-tip">Tip</span>}
        </div>
      </div>
      <span className="wc4-title">{product.title}</span>
      <span className="wc4-price-add">{czk(Math.round(product.price_min_cents / 1.21), currency)} bez DPH</span>
      <span className="wc4-price">
        {product.price_min_cents === product.price_max_cents
          ? czk(product.price_min_cents, currency)
          : `od ${czk(product.price_min_cents, currency)}`}
        {onSale && <span className="wc4-compare">{czk(product.compare_at_price_cents!, currency)}</span>}
      </span>
      {soldOut ? (
        <span className="wc4-avail wc4-avail-out">Vyprodáno</span>
      ) : (
        <span className="wc4-avail">Skladem ({product.stock_total} ks)</span>
      )}
      <span className={`wc4-buy ${soldOut ? "wc4-buy-disabled" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M6 7h12l-1.2 10.5a1.8 1.8 0 0 1-1.8 1.5H9a1.8 1.8 0 0 1-1.8-1.5L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg>
        {soldOut ? "Detail" : "Do košíku"}
      </span>
    </Link>
  );
}

function Eshop04ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = data.products ?? [];
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const heading = content.heading === undefined ? "Doporučujeme" : String(content.heading);

  if (!products.length && !isAdmin) return null;

  const pages = Math.max(1, Math.ceil(products.length / 4));
  const goTo = (p: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (el) setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <section className="wc4-products" data-variant={variant} id={typeof content.anchorId === "string" ? content.anchorId : undefined}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .wc4-products { background: #fff; color: #161616; font-family: 'Raleway', 'Segoe UI', Arial, sans-serif; padding-bottom: clamp(28px,3.5vw,48px); }
        .wc4-heading { padding-top: 48px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 1.6px; line-height: 38px; margin: 0 0 clamp(26px,3.5vw,44px); color: #161616; }
        .wc4-slider { position: relative; width: 100%; padding: 0 clamp(44px, 4vw, 72px); }
        .wc4-track { display: flex; gap: clamp(20px, 2.5vw, 40px); overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .wc4-track::-webkit-scrollbar { display: none; }
        .wc4-card { flex: 0 0 calc(25% - 30px); scroll-snap-align: start; display: flex; flex-direction: column; align-items: center; text-align: center; text-decoration: none; color: inherit; background: #fff; }
        @media (max-width: 1024px) { .wc4-card { flex-basis: calc(33.333% - 27px); } }
        @media (max-width: 720px)  {
          .wc4-card { flex-basis: calc(50% - 8px); }
          .wc4-track { gap: 16px; }
          .wc4-slider { padding: 0 16px; }
          .wc4-nav { display: none; }
          .wc4-heading { font-size: 24px; line-height: 30px; padding-top: 32px; }
          .wc4-title { font-size: 16px; margin-top: 12px; }
          .wc4-price-add { margin-top: 10px; font-size: 12.5px; }
          .wc4-price { font-size: 17px; }
          .wc4-avail { font-size: 13px; }
          .wc4-buy { padding: 11px 16px; font-size: 13px; margin-top: 12px; }
          .wc4-flag { font-size: 12px; padding: 4px 12px; }
          .wc4-page { width: 28px; }
        }
        .wc4-media { position: relative; width: 100%; aspect-ratio: 4/3; background: #fff; }
        .wc4-media img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .wc4-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #ccc; }
        .wc4-flags { position: absolute; top: 0; left: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; z-index: 1; }
        .wc4-flag { font-size: 14px; font-weight: 600; padding: 6px 20px; border-radius: 8px; color: #fff; }
        .wc4-flag-tip { background: #008392; }
        .wc4-flag-new { background: #3a800e; }
        .wc4-flag-sale { background: #d34343; }
        .wc4-title { margin-top: 20px; font-size: 21px; font-weight: 700; line-height: 1.3; color: #161616; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .wc4-card:hover .wc4-title { color: #6883ba; }
        .wc4-price-add { margin-top: 22px; font-size: 14px; color: rgba(22,22,22,0.63); }
        .wc4-price { margin-top: 6px; font-size: 20px; font-weight: 600; color: #161616; display: flex; align-items: baseline; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .wc4-compare { font-size: 14px; color: rgba(22,22,22,0.5); text-decoration: line-through; }
        .wc4-avail { margin-top: 8px; font-size: 15px; font-weight: 600; color: #3a800e; }
        .wc4-avail-out { color: #d00000; }
        .wc4-buy { margin-top: 20px; display: inline-flex; align-items: center; gap: 9px; padding: 14px 24px; border-radius: 8px; background: #6883ba; color: #fff; font-size: 14px; font-weight: 600; transition: background .3s; }
        .wc4-card:hover .wc4-buy { background: #7999d9; }
        .wc4-buy-disabled { background: #cfcfcf; }
        .wc4-nav { position: absolute; top: 34%; z-index: 2; border: none; background: none; cursor: pointer; color: #161616; padding: 8px; transition: color 0.2s; }
        .wc4-nav:hover { color: #6883ba; }
        .wc4-nav-prev { left: clamp(6px, 1vw, 20px); }
        .wc4-nav-next { right: clamp(6px, 1vw, 20px); }
        .wc4-pages { display: flex; justify-content: center; gap: 8px; margin-top: clamp(24px,3vw,40px); }
        .wc4-page { width: 48px; height: 3px; border: none; padding: 0; cursor: pointer; background: #e0e0e0; transition: background 0.2s; }
        .wc4-page.is-active { background: #6883ba; }
        .wc4-empty { max-width: 1280px; margin: 0 auto; border: 1px dashed #ccc; border-radius: 12px; padding: 48px 24px; text-align: center; color: #6f6f6f; font-size: 14px; }
      `}</style>
      <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc4-heading" />

      {products.length === 0 ? (
        <div className="wc4-empty">
          {"Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty)."}
        </div>
      ) : (
        <>
          <div className="wc4-slider">
            <div className="wc4-track" ref={trackRef} onScroll={onScroll}>
              {products.map((p) => (
                <Eshop04ProductCard key={p.id} product={p} currency={currency} storeBase={storeBase} isAdmin={isAdmin} />
              ))}
            </div>
            {products.length > 4 && (
              <>
                <button className="wc4-nav wc4-nav-prev" aria-label="Předchozí" onClick={() => goTo(Math.max(0, page - 1))}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
                </button>
                <button className="wc4-nav wc4-nav-next" aria-label="Další" onClick={() => goTo(Math.min(pages - 1, page + 1))}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </>
            )}
          </div>
          {pages > 1 && (
            <div className="wc4-pages">
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i} className={`wc4-page${i === page ? " is-active" : ""}`} aria-label={`Strana ${i + 1}`} onClick={() => goTo(i)} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}


// ── eshop-05 (Hračkolandia / Pompo DNA) ────────────────────────────────────────
// Horizontální produktový karusel: bílé karty s hairline borderem, 1:1 foto,
// tmavý badge "Poslední šance" + červený % badge, dostupnost zeleně (Skladem
// online / Skladem v prodejně), navy cena (červená při slevě + přeškrtnutá
// původní), zelený kruhový košík button, šipky na okraji.
function Eshop05ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = data.products ?? [];
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const cardBadge = content.badge === undefined ? "" : String(content.badge);
  const trackRef = useRef<HTMLDivElement>(null);

  const RED = "#ff3b5c";
  const NAVY = "#0e1b2c";
  const GREEN = "#12b76a";
  const MUTED = "#64748b";
  const BORDER = "#e7eaee";
  const SANS = "'Nunito Sans','Segoe UI',Arial,sans-serif";

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es05p-card");
    const w = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant="eshop-05-products" style={{ fontFamily: SANS, background: "#fff", padding: "36px 0" }}>
      <style>{`
        .es05p-wrap { position: relative; max-width: 1580px; margin: 0 auto; padding: 0 14px; }
        .es05p-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 8px; }
        .es05p-track::-webkit-scrollbar { display: none; }
        .es05p-card { flex: 0 0 calc(20% - 13px); min-width: 240px; scroll-snap-align: start; display: flex; flex-direction: column; border: 1px solid ${BORDER}; border-radius: 10px; background: #fff; text-decoration: none; overflow: hidden; position: relative; transition: box-shadow 0.2s; }
        .es05p-card:hover { box-shadow: 0 14px 32px rgba(14,27,44,0.1); }
        .es05p-media { position: relative; aspect-ratio: 1/1; background: #fff; padding: 18px; }
        .es05p-media img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.35s; }
        .es05p-card:hover .es05p-media img { transform: scale(1.05); }
        .es05p-flag { position: absolute; top: 12px; left: 12px; padding: 6px 12px; background: ${NAVY}; color: #fff; font-size: 12px; font-weight: 800; border-radius: 4px; z-index: 2; }
        .es05p-sale { position: absolute; top: 12px; right: 12px; padding: 6px 10px; background: ${RED}; color: #fff; font-size: 12.5px; font-weight: 900; border-radius: 4px; z-index: 2; }
        .es05p-cart { position: absolute; right: 14px; bottom: 14px; width: 44px; height: 44px; border-radius: 50%; background: ${GREEN}; color: #fff; display: flex; align-items: center; justify-content: center; z-index: 2; opacity: 0; transform: translateY(6px); transition: opacity 0.2s, transform 0.2s; box-shadow: 0 6px 16px rgba(18,183,106,0.35); }
        .es05p-card:hover .es05p-cart { opacity: 1; transform: translateY(0); }
        .es05p-body { display: flex; flex-direction: column; gap: 8px; padding: 4px 16px 18px; flex: 1; }
        .es05p-title { font-size: 14.5px; font-weight: 700; color: ${NAVY}; line-height: 1.35; min-height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es05p-card:hover .es05p-title { text-decoration: underline; text-underline-offset: 3px; }
        .es05p-avail { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; }
        .es05p-price { display: flex; align-items: baseline; gap: 9px; margin-top: auto; }
        .es05p-arrow { position: absolute; top: 42%; z-index: 5; width: 52px; height: 64px; border: 1px solid ${BORDER}; background: #fff; color: ${NAVY}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, color 0.15s; }
        .es05p-arrow:hover { background: ${NAVY}; color: #fff; }
        .es05p-arrow--r { right: 0; border-radius: 8px 0 0 8px; box-shadow: -8px 0 20px rgba(14,27,44,0.08); }
        .es05p-arrow--l { left: 0; border-radius: 0 8px 8px 0; box-shadow: 8px 0 20px rgba(14,27,44,0.08); }
        @media (max-width: 1200px) { .es05p-card { flex-basis: calc(25% - 12px); } }
        @media (max-width: 900px) { .es05p-card { flex-basis: calc(33.3% - 11px); } .es05p-arrow { display: none; } }
        @media (max-width: 600px) { .es05p-card { flex-basis: calc(50% - 8px); min-width: 200px; } }
      `}</style>
      <div className="es05p-wrap">
        {heading.trim() !== "" && (
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="es05p-heading" style={{
            fontSize: 30, fontWeight: 900, color: NAVY, marginBottom: 28, letterSpacing: "-0.02em", textAlign: "center",
          }} />
        )}
        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "48px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu.
          </div>
        ) : (
          <>
            <div className="es05p-track" ref={trackRef}>
              {products.map((p) => {
                const soldOut = p.stock_total <= 0;
                const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
                const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
                return (
                  <Link key={p.id} href={href} className="es05p-card" aria-disabled={isAdmin}>
                    <div className="es05p-media">
                      {cardBadge && <span className="es05p-flag">{cardBadge}</span>}
                      {onSale && salePct > 0 && <span className="es05p-sale">-{salePct} %</span>}
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4d4d0" }}>
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                        </div>
                      )}
                      {!soldOut && (
                        <span className="es05p-cart">
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/><path d="M1 1h3.27l2.4 12.27a2 2 0 0 0 2 1.73h8.4a2 2 0 0 0 2-1.46L21 6H6"/></svg>
                        </span>
                      )}
                    </div>
                    <div className="es05p-body">
                      <span className="es05p-title">{p.title}</span>
                      <span className="es05p-avail" style={{ color: soldOut ? MUTED : GREEN }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>
                        {soldOut ? "Vyprodáno" : "Skladem online"}
                      </span>
                      <span className="es05p-avail" style={{ color: MUTED }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Dostupné v prodejně
                      </span>
                      <span className="es05p-price">
                        <span style={{ fontSize: 18, fontWeight: 900, color: onSale ? RED : NAVY }}>
                          {new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(p.price_min_cents / 100)}
                        </span>
                        {onSale && (
                          <span style={{ fontSize: 13, fontWeight: 600, color: MUTED, textDecoration: "line-through" }}>
                            {new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(p.compare_at_price_cents! / 100)}
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <button className="es05p-arrow es05p-arrow--l" aria-label="Předchozí" onClick={(e) => { e.preventDefault(); scrollBy(-1); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <button className="es05p-arrow es05p-arrow--r" aria-label="Další" onClick={(e) => { e.preventDefault(); scrollBy(1); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// ── eshop-06 (Ořeškárna / svetplodu DNA) ───────────────────────────────────────
// Editorial produktový karusel: čisté karty bez borderu — foto 1:1 (radius 12,
// cover, hover zoom), žlutý chip badge vlevo dole na fotce, růžový % badge,
// Archivo bold název, cena „Od X Kč". Nadpis sekce vlevo Archivo 800. Malé
// tmavé šipky po stranách (desktop), na mobilu swipe se scroll-snap (2 karty).
function Eshop06ProductsSection({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = data.products ?? [];
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const cardBadge = content.badge === undefined ? "" : String(content.badge);
  const trackRef = useRef<HTMLDivElement>(null);

  const CHARCOAL = "#1d1d1b";
  const YELLOW = "#f6c500";
  const MUTED = "#7a776f";
  const BORDER = "#eceae6";
  const SANS = "'Figtree','Segoe UI',Arial,sans-serif";
  const HEAD = "'Archivo','Helvetica Neue',Arial,sans-serif";

  const czkFmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es06p-card");
    const w = card ? card.offsetWidth + 18 : 320;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant="eshop-06-products" style={{ fontFamily: SANS, background: "#fff", padding: "30px 0 14px" }}>
      <style>{`
        .es06p-wrap { position: relative; max-width: 1320px; margin: 0 auto; padding: 0 24px; }
        .es06p-track { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px 2px 8px; }
        .es06p-track::-webkit-scrollbar { display: none; }
        .es06p-card { flex: 0 0 calc(25% - 13.5px); min-width: 232px; scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none; }
        .es06p-media { position: relative; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: #f5f5f2; }
        .es06p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es06p-card:hover .es06p-media img { transform: scale(1.06); }
        .es06p-flag { position: absolute; left: 12px; bottom: 12px; padding: 7px 12px; background: ${YELLOW}; color: ${CHARCOAL}; font-family: ${HEAD}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 8px; z-index: 2; }
        .es06p-sale { position: absolute; top: 12px; right: 12px; min-width: 46px; height: 46px; border-radius: 50%; background: #f8cede; color: ${CHARCOAL}; display: flex; align-items: center; justify-content: center; font-family: ${HEAD}; font-size: 12.5px; font-weight: 800; z-index: 2; padding: 0 5px; }
        .es06p-heart { position: absolute; top: 12px; left: 12px; width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.92); color: ${CHARCOAL}; display: flex; align-items: center; justify-content: center; z-index: 2; opacity: 0; transform: translateY(-4px); transition: opacity 0.18s, transform 0.18s, color 0.15s; }
        .es06p-card:hover .es06p-heart { opacity: 1; transform: translateY(0); }
        .es06p-heart:hover { color: #e04f70; }
        .es06p-title { font-family: ${HEAD}; font-size: 15px; font-weight: 800; color: ${CHARCOAL}; line-height: 1.3; margin-top: 13px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es06p-card:hover .es06p-title { text-decoration: underline; text-underline-offset: 3px; }
        .es06p-price { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; }
        .es06p-arrow { position: absolute; top: 34%; z-index: 5; width: 40px; height: 40px; border: none; border-radius: 10px; background: ${CHARCOAL}; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.15s; box-shadow: 0 8px 20px rgba(29,29,27,0.24); }
        .es06p-arrow:hover { background: #000; transform: scale(1.06); }
        .es06p-arrow--r { right: 6px; }
        .es06p-arrow--l { left: 6px; }
        .es06p-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
        .es06p-more { font-family: ${HEAD}; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${CHARCOAL}; text-decoration: none; border-bottom: 2px solid ${CHARCOAL}; padding-bottom: 3px; white-space: nowrap; transition: opacity 0.15s; }
        .es06p-more:hover { opacity: 0.6; }
        @media (max-width: 1100px) { .es06p-card { flex-basis: calc(33.33% - 12px); } }
        @media (max-width: 860px) {
          .es06p-card { flex-basis: calc(50% - 9px); min-width: 168px; }
          .es06p-arrow { display: none; }
          .es06p-track { gap: 14px; margin: 0 -24px; padding: 2px 24px 8px; }
          .es06p-flag { font-size: 10px; padding: 6px 9px; left: 8px; bottom: 8px; }
          .es06p-sale { min-width: 40px; height: 40px; font-size: 11.5px; top: 8px; right: 8px; }
          .es06p-heart { display: none; }
          .es06p-title { font-size: 13.5px; margin-top: 10px; }
        }
      `}</style>
      <div className="es06p-wrap">
        {heading.trim() !== "" && (
          <div className="es06p-head">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
              fontFamily: HEAD, fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 800, color: CHARCOAL,
              letterSpacing: "-0.02em", margin: 0,
            }} />
          </div>
        )}
        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "48px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu.
          </div>
        ) : (
          <>
            <div className="es06p-track" ref={trackRef}>
              {products.map((p) => {
                const soldOut = p.stock_total <= 0;
                const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
                const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
                const priceRange = p.price_min_cents !== p.price_max_cents;
                return (
                  <Link key={p.id} href={href} className="es06p-card" aria-disabled={isAdmin}>
                    <div className="es06p-media">
                      <span className="es06p-heart" aria-hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </span>
                      {onSale && salePct > 0 && <span className="es06p-sale">−{salePct} %</span>}
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4d4d0" }}>
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                        </div>
                      )}
                      {cardBadge && !soldOut && <span className="es06p-flag">{cardBadge}</span>}
                      {soldOut && <span className="es06p-flag" style={{ background: "#eceae6", color: MUTED }}>Vyprodáno</span>}
                    </div>
                    <span className="es06p-title">{p.title}</span>
                    <span className="es06p-price">
                      <span style={{ fontSize: 15.5, fontWeight: 700, color: soldOut ? MUTED : CHARCOAL }}>
                        {priceRange ? `Od ${czkFmt(p.price_min_cents)}` : czkFmt(p.price_min_cents)}
                      </span>
                      {onSale && (
                        <span style={{ fontSize: 13, fontWeight: 600, color: MUTED, textDecoration: "line-through" }}>
                          {czkFmt(p.compare_at_price_cents!)}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
            {products.length > 4 && (
              <>
                <button className="es06p-arrow es06p-arrow--l" aria-label="Předchozí" onClick={(e) => { e.preventDefault(); scrollBy(-1); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
                </button>
                <button className="es06p-arrow es06p-arrow--r" aria-label="Další" onClick={(e) => { e.preventDefault(); scrollBy(1); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// eshop-08 "Domea" product carousel (bonami DNA) — heading s šipkami, karty:
// foto 1:1, červený sale pill, srdce na hover, brand muted, název, dostupnost
// Skladem zeleně, cena tučně + přeškrtnutá původní.
// ══════════════════════════════════════════════════════════════════════════════
function Eshop08ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const SANS = "'DM Sans', 'Segoe UI', Arial, sans-serif";
  const INK = "#2b2b2b";
  const GREEN = "#3d9a50";
  const RED = "#d64541";
  const MUTED = "#8a8a86";
  const BORDER = "#e6e6e3";
  const SURFACE = "#f4f4f2";

  const commerce = (content as Record<string, unknown>).__commerce as CommerceSectionData | undefined;
  const products = commerce?.products ?? [];
  const heading = String((content as Record<string, unknown>).heading ?? "");
  const moreHref = String((content as Record<string, unknown>).moreHref ?? "/obchod");
  const storeBase = tenantSlug ? (isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}/obchod`) : "/obchod";
  const headingHref = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  const scrollBy = (dir: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * trackRef.current.offsetWidth * 0.8, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant="eshop-08-products" style={{ fontFamily: SANS, background: "#fff", padding: "34px 0 18px" }}>
      <style>{`
        .es08p-wrap { max-width: 1360px; margin: 0 auto; padding: 0 24px; }
        .es08p-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px; }
        .es08p-track::-webkit-scrollbar { display: none; }
        .es08p-card { flex: 0 0 calc(20% - 12.8px); min-width: 196px; scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none; position: relative; }
        .es08p-media { position: relative; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: ${SURFACE}; }
        .es08p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .es08p-card:hover .es08p-media img { transform: scale(1.05); }
        .es08p-sale { position: absolute; top: 10px; left: 10px; background: ${RED}; color: #fff; border-radius: 999px; padding: 5px 10px; font-size: 11.5px; font-weight: 800; z-index: 2; }
        .es08p-heart { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.94); color: ${INK}; display: flex; align-items: center; justify-content: center; z-index: 2; opacity: 0; transform: translateY(-4px); transition: opacity 0.18s, transform 0.18s, color 0.14s; }
        .es08p-card:hover .es08p-heart { opacity: 1; transform: translateY(0); }
        .es08p-heart:hover { color: ${RED}; }
        .es08p-brand { margin-top: 11px; font-size: 12px; font-weight: 500; color: ${MUTED}; }
        .es08p-title { font-size: 14px; font-weight: 600; color: ${INK}; line-height: 1.35; margin-top: 2px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .es08p-card:hover .es08p-title { text-decoration: underline; text-underline-offset: 3px; }
        .es08p-avail { margin-top: 5px; font-size: 12.5px; font-weight: 600; }
        .es08p-price { display: flex; align-items: baseline; gap: 8px; margin-top: 3px; }
        .es08p-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
        .es08p-head-link { display: inline-flex; align-items: center; gap: 7px; text-decoration: none; color: ${INK}; transition: color 0.14s; }
        .es08p-head-link:hover { color: ${GREEN}; }
        .es08p-arrow { width: 34px; height: 34px; border: 1px solid ${BORDER}; border-radius: 50%; background: #fff; color: ${INK}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.14s, border-color 0.14s; flex-shrink: 0; }
        .es08p-arrow:hover { background: ${SURFACE}; border-color: ${INK}; }
        @media (max-width: 1100px) { .es08p-card { flex-basis: calc(33.33% - 11px); } }
        @media (max-width: 700px) {
          .es08p-card { flex-basis: calc(50% - 8px); min-width: 156px; }
          .es08p-arrows { display: none; }
          .es08p-track { gap: 12px; margin: 0 -24px; padding: 2px 24px; }
        }
      `}</style>
      <div className="es08p-wrap">
        {heading.trim() !== "" && (
          <div className="es08p-head">
            <a href={headingHref} className="es08p-head-link">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
                fontFamily: SANS, fontSize: "clamp(19px, 2.1vw, 24px)", fontWeight: 800, letterSpacing: "-0.01em", margin: 0, color: "inherit",
              }} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2 }}><path d="M9 6l6 6-6 6"/></svg>
            </a>
            <span className="es08p-arrows" style={{ display: "inline-flex", gap: 8 }}>
              <button className="es08p-arrow" aria-label="Předchozí" onClick={() => scrollBy(-1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              <button className="es08p-arrow" aria-label="Další" onClick={() => scrollBy(1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </span>
          </div>
        )}
        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "44px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Zatím žádné produkty — přidejte je v administraci obchodu.
          </div>
        ) : (
          <div className="es08p-track" ref={trackRef}>
            {products.map((p) => {
              const soldOut = p.stock_total <= 0;
              const lastPieces = !soldOut && p.stock_total <= 8;
              const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
              const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
              const priceRange = p.price_min_cents !== p.price_max_cents;
              return (
                <Link key={p.id} href={href} className="es08p-card" aria-disabled={isAdmin}>
                  <div className="es08p-media">
                    {onSale && salePct > 0 && <span className="es08p-sale">−{salePct} %</span>}
                    <span className="es08p-heart" aria-hidden>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </span>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4d4d0" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                      </div>
                    )}
                  </div>
                  {p.brand && <span className="es08p-brand">{p.brand}</span>}
                  <span className="es08p-title">{p.title}</span>
                  <span className="es08p-avail" style={{ color: soldOut ? RED : GREEN }}>
                    {soldOut ? "Vyprodáno" : lastPieces ? "Skladem · Poslední kousky" : "Skladem"}
                  </span>
                  <span className="es08p-price">
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: onSale ? RED : INK }}>
                      {priceRange ? `od ${czk(p.price_min_cents)}` : czk(p.price_min_cents)}
                    </span>
                    {onSale && (
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: MUTED, textDecoration: "line-through" }}>
                        {czk(p.compare_at_price_cents!)}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// eshop-07 "Néroli parfumerie" product carousel (kosmetika-zdravi DNA) —
// centrovaný uppercase letterspaced nadpis, 4-up scroll-snap track, karty:
// mint SLEVA badge / ink NOVINKA, brand tučně, název, subtitle muted,
// cena (růžová #e84393 při slevě + přeškrtnutá původní), „včetně DPH |
// bez dopravy", skladem tyrkysově, deterministické hvězdičky.
// content.saleOnly === true → jen zlevněné produkty.
// ══════════════════════════════════════════════════════════════════════════════
function Eshop07ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const SANS = "'Hanken Grotesk', 'Segoe UI', Arial, sans-serif";
  const INK = "#16161d";
  const TEAL_DARK = "#14a99a";
  const MINT_BG = "#d9f3ee";
  const PINK = "#e84393";
  const MUTED = "#8b8f9c";
  const BORDER = "#e8e9ed";
  const SURFACE = "#f4f5f7";
  const GOLD = "#f0b429";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  let products = data.products ?? [];
  if (content.saleOnly === true) {
    products = products.filter(p => p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents);
  }
  products = products.slice(0, 8);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);

  const czkFmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es07p-card");
    const w = card ? card.offsetWidth + 18 : 320;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "34px 0 18px" }}>
      <style>{`
        .es07p-wrap { position: relative; max-width: 1360px; margin: 0 auto; padding: 0 24px; }
        .es07p-track { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px 2px 8px; }
        .es07p-track::-webkit-scrollbar { display: none; }
        .es07p-card { flex: 0 0 calc(25% - 13.5px); min-width: 236px; scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none; border: 1px solid ${BORDER}; border-radius: 12px; padding: 14px 14px 18px; background: #fff; transition: border-color 0.16s, transform 0.16s, box-shadow 0.16s; }
        .es07p-card:hover { border-color: ${INK}; transform: translateY(-2px); box-shadow: 0 14px 30px rgba(22,22,29,0.08); }
        .es07p-media { position: relative; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden; background: ${SURFACE}; }
        .es07p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es07p-card:hover .es07p-media img { transform: scale(1.05); }
        .es07p-badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; z-index: 2; }
        .es07p-badge { padding: 5px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .es07p-brand { margin-top: 13px; font-size: 13.5px; font-weight: 800; color: ${INK}; }
        .es07p-title { margin-top: 3px; font-size: 14.5px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es07p-card:hover .es07p-title { text-decoration: underline; text-underline-offset: 3px; }
        .es07p-sub { margin-top: 3px; font-size: 12.5px; font-weight: 500; color: ${MUTED}; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .es07p-arrow { position: absolute; top: 33%; z-index: 5; width: 42px; height: 42px; border: 1px solid ${BORDER}; border-radius: 50%; background: #fff; color: ${INK}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, border-color 0.15s, transform 0.15s; box-shadow: 0 8px 22px rgba(22,22,29,0.12); }
        .es07p-arrow:hover { background: ${INK}; border-color: ${INK}; color: #fff; transform: scale(1.05); }
        .es07p-arrow--r { right: 8px; }
        .es07p-arrow--l { left: 8px; }
        @media (max-width: 1100px) { .es07p-card { flex-basis: calc(33.33% - 12px); } }
        @media (max-width: 860px) {
          .es07p-card { flex-basis: calc(50% - 9px); min-width: 172px; }
          .es07p-arrow { display: none; }
          .es07p-track { gap: 14px; margin: 0 -24px; padding: 2px 24px 8px; }
        }
      `}</style>
      <div className="es07p-wrap">
        {heading.trim() !== "" && (
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: SANS, fontSize: "clamp(19px, 2vw, 24px)", fontWeight: 800, color: INK,
            textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center",
            margin: "0 0 26px",
          }} />
        )}
        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 12, padding: "44px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu.
          </div>
        ) : (
          <>
            <div className="es07p-track" ref={trackRef}>
              {products.map((p) => {
                const soldOut = p.stock_total <= 0;
                const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
                const isNew = p.flags?.new === true;
                const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
                const priceRange = p.price_min_cents !== p.price_max_cents;
                const rating = (43 + ((p.id * 37) % 7)) / 10;
                const reviews = 7 + ((p.id * 53) % 180);
                return (
                  <Link key={p.id} href={href} className="es07p-card" aria-disabled={isAdmin}>
                    <div className="es07p-media">
                      <div className="es07p-badges">
                        {soldOut ? (
                          <span className="es07p-badge" style={{ background: SURFACE, color: MUTED }}>Vyprodáno</span>
                        ) : (
                          <>
                            {onSale && salePct > 0 && <span className="es07p-badge" style={{ background: MINT_BG, color: INK }}>Sleva {salePct} %</span>}
                            {isNew && <span className="es07p-badge" style={{ background: INK, color: "#fff" }}>Novinka</span>}
                          </>
                        )}
                      </div>
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4d4d0" }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                        </div>
                      )}
                    </div>
                    {p.brand && <span className="es07p-brand">{p.brand}</span>}
                    <span className="es07p-title">{p.title}</span>
                    {p.subtitle && <span className="es07p-sub">{p.subtitle}</span>}
                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
                      {onSale && (
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: "line-through" }}>
                          {czkFmt(p.compare_at_price_cents!)}
                        </span>
                      )}
                      <span style={{ fontSize: 16.5, fontWeight: 800, color: soldOut ? MUTED : (onSale ? PINK : INK) }}>
                        {priceRange ? `od ${czkFmt(p.price_min_cents)}` : czkFmt(p.price_min_cents)}
                      </span>
                    </span>
                    <span style={{ marginTop: 3, fontSize: 11, fontWeight: 500, color: MUTED }}>včetně DPH | bez dopravy</span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: soldOut ? MUTED : TEAL_DARK }}>
                        {soldOut ? "vyprodáno" : "skladem"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <svg width="13" height="13" viewBox="0 0 20 20" fill={GOLD}><path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" /></svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{rating.toFixed(1)}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: MUTED }}>({reviews})</span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
            {products.length > 4 && (
              <>
                <button className="es07p-arrow es07p-arrow--l" aria-label="Předchozí" onClick={(e) => { e.preventDefault(); scrollBy(-1); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
                </button>
                <button className="es07p-arrow es07p-arrow--r" aria-label="Další" onClick={(e) => { e.preventDefault(); scrollBy(1); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// eshop-09 "Mobil Expres" product carousel (mp.cz DNA, vlastní navy/mint
// identita — žádná mp červená/žlutá/zelená). Hlava: nadpis vlevo + mint
// „Zobrazit vše" + kruhové šipky. Karty 5-up: coral −% badge, navy Novinka,
// cyan benefit pill přes foto (deterministicky dle id), titulek, mint
// „Skladem · ihned k odeslání", přeškrtnutá původní cena, navy blok akční
// ceny s mint labelem, „od X Kč/měs." (24 splátek), mint Koupit s košíkem.
// content.saleOnly === true → jen zlevněné produkty.
// ══════════════════════════════════════════════════════════════════════════════
function Eshop09ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const SANS = "'Archivo', 'Segoe UI', Arial, sans-serif";
  const INK = "#232a30";
  const NAVY = "#1d2433";
  const MINT = "#3ce0a6";
  const MINT_DARK = "#0f9d70";
  const ON_MINT = "#06281c";
  const CORAL = "#ff7a59";
  const MUTED = "#8b949c";
  const BORDER = "#e8e9eb";
  const SURFACE = "#f5f6f7";

  const ES09_PERKS = ["Záruka 3 roky zdarma", "Bonus k výkupní ceně", "Doprava zdarma", "Dárek k nákupu"];

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  let products = data.products ?? [];
  if (content.saleOnly === true) {
    products = products.filter(p => p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents);
  }
  products = products.slice(0, 10);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es09p-card");
    const w = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "38px 0 20px" }}>
      <style>{`
        .es09p-wrap { max-width: 1420px; margin: 0 auto; padding: 0 24px; }
        .es09p-head { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; }
        .es09p-more { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; font-size: 13.5px; font-weight: 700; color: ${MINT_DARK}; text-decoration: none; transition: color 0.14s, gap 0.14s; white-space: nowrap; }
        .es09p-more:hover { color: ${NAVY}; gap: 9px; }
        .es09p-arrow { width: 38px; height: 38px; border: 1px solid ${BORDER}; border-radius: 50%; background: #fff; color: ${INK}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.14s, border-color 0.14s, color 0.14s; flex-shrink: 0; }
        .es09p-arrow:hover { background: ${NAVY}; border-color: ${NAVY}; color: #fff; }

        .es09p-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px 2px 10px; }
        .es09p-track::-webkit-scrollbar { display: none; }
        .es09p-card { flex: 0 0 calc(20% - 12.8px); min-width: 218px; scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none; border: 1px solid ${BORDER}; border-radius: 16px; padding: 13px 13px 15px; background: #fff; transition: border-color 0.16s, transform 0.16s, box-shadow 0.16s; }
        .es09p-card:hover { border-color: rgba(29,36,51,0.4); transform: translateY(-3px); box-shadow: 0 18px 38px rgba(14,20,25,0.1); }

        .es09p-media { position: relative; aspect-ratio: 1/1; border-radius: 11px; overflow: hidden; background: ${SURFACE}; }
        .es09p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es09p-card:hover .es09p-media img { transform: scale(1.06); }
        .es09p-sale { position: absolute; top: 10px; left: 10px; z-index: 2; background: ${CORAL}; color: #fff; border-radius: 999px; padding: 6px 11px; font-size: 12px; font-weight: 800; box-shadow: 0 8px 18px rgba(255,122,89,0.4); }
        .es09p-new { position: absolute; top: 10px; right: 10px; z-index: 2; background: ${NAVY}; color: #fff; border-radius: 999px; padding: 6px 11px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
        .es09p-perk { position: absolute; left: 10px; bottom: 10px; z-index: 2; max-width: calc(100% - 20px); background: rgba(255,255,255,0.92); backdrop-filter: blur(3px); color: ${NAVY}; border: 1px solid rgba(29,36,51,0.1); border-radius: 999px; padding: 5px 11px; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .es09p-title { margin-top: 12px; font-size: 14.5px; font-weight: 700; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es09p-card:hover .es09p-title { text-decoration: underline; text-underline-offset: 3px; }

        .es09p-pricebox { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 10px; min-height: 52px; }
        .es09p-tag { background: ${NAVY}; border-radius: 10px 10px 10px 3px; padding: 6px 12px 7px; text-align: right; }
        .es09p-tag-label { display: block; font-size: 9.5px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: ${MINT}; }
        .es09p-tag-price { display: block; font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.01em; white-space: nowrap; }

        .es09p-buy { display: flex; align-items: center; justify-content: center; gap: 9px; height: 42px; margin-top: 12px; border-radius: 999px; background: ${MINT}; color: ${ON_MINT}; font-size: 13.5px; font-weight: 800; letter-spacing: 0.02em; transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .es09p-card:hover .es09p-buy { background: #63eabb; box-shadow: 0 10px 22px rgba(34,201,147,0.32); }
        .es09p-buy--out { background: ${SURFACE}; color: ${MUTED}; }
        .es09p-card:hover .es09p-buy--out { background: ${SURFACE}; box-shadow: none; }

        @media (max-width: 1180px) { .es09p-card { flex-basis: calc(25% - 12px); } }
        @media (max-width: 980px) { .es09p-card { flex-basis: calc(33.33% - 11px); } }
        @media (max-width: 700px) {
          .es09p-card { flex-basis: calc(50% - 8px); min-width: 168px; }
          .es09p-arrows { display: none; }
          .es09p-track { gap: 12px; margin: 0 -24px; padding: 2px 24px 10px; }
        }
      `}</style>
      <div className="es09p-wrap">
        {heading.trim() !== "" && (
          <div className="es09p-head">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
              fontFamily: SANS, fontSize: "clamp(20px, 2.2vw, 27px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: INK,
            }} />
            <a href={moreResolved} className="es09p-more">
              {moreLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <span className="es09p-arrows" style={{ display: "inline-flex", gap: 8 }}>
              <button className="es09p-arrow" aria-label="Předchozí" onClick={() => scrollBy(-1)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              <button className="es09p-arrow" aria-label="Další" onClick={() => scrollBy(1)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </span>
          </div>
        )}
        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 14, padding: "44px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Zatím žádné produkty — přidejte je v administraci obchodu.
          </div>
        ) : (
          <div className="es09p-track" ref={trackRef}>
            {products.map((p) => {
              const soldOut = p.stock_total <= 0;
              const lastPieces = !soldOut && p.stock_total <= 5;
              const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
              const isNew = p.flags?.new === true;
              const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
              const priceRange = p.price_min_cents !== p.price_max_cents;
              const perk = ES09_PERKS[p.id % ES09_PERKS.length];
              const monthly = Math.round(p.price_min_cents / 100 / 24);
              return (
                <Link key={p.id} href={href} className="es09p-card" aria-disabled={isAdmin}>
                  <div className="es09p-media">
                    {onSale && salePct > 0 && <span className="es09p-sale">−{salePct} %</span>}
                    {isNew && !soldOut && <span className="es09p-new">Novinka</span>}
                    {!soldOut && <span className="es09p-perk">{perk}</span>}
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4d4d0" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                      </div>
                    )}
                  </div>

                  <span className="es09p-title">{p.title}</span>
                  <span style={{ marginTop: 5, fontSize: 12.5, fontWeight: 700, color: soldOut ? CORAL : MINT_DARK }}>
                    {soldOut ? "Vyprodáno" : lastPieces ? "Skladem · poslední kusy" : "Skladem · ihned k odeslání"}
                  </span>

                  <span className="es09p-pricebox">
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      {onSale && (
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED, textDecoration: "line-through", whiteSpace: "nowrap" }}>
                          {fmt(p.compare_at_price_cents!)}
                        </span>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, whiteSpace: "nowrap" }}>
                        od {monthly.toLocaleString("cs-CZ")} Kč/měs.
                      </span>
                    </span>
                    {onSale ? (
                      <span className="es09p-tag">
                        <span className="es09p-tag-label">Akční cena</span>
                        <span className="es09p-tag-price">{priceRange ? `od ${fmt(p.price_min_cents)}` : fmt(p.price_min_cents)}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 17.5, fontWeight: 800, color: NAVY, whiteSpace: "nowrap" }}>
                        {priceRange ? `od ${fmt(p.price_min_cents)}` : fmt(p.price_min_cents)}
                      </span>
                    )}
                  </span>

                  <span className={`es09p-buy${soldOut ? " es09p-buy--out" : ""}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 9 8 3.5M18.5 9 16 3.5M3 9h18l-1.7 9.4a2 2 0 0 1-2 1.6H6.7a2 2 0 0 1-2-1.6L3 9z"/></svg>
                    {soldOut ? "Vyprodáno" : "Koupit"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-10-products ───────────────────────────────────────────────────────────
// BOTIQ produktový karusel (footshop DNA): borderless karty — foto 1:1 na surface,
// srdíčko wishlist (volt fill), vlevo nahoře stack badge (červená −% + volt
// EXTRA −5 %), NOVINKA černá/volt. Pod fotem brand condensed uppercase, titulek,
// cena (sale červeně + přeškrtnutá), tag ↗ Trending / + Novinka. Hover: zoom
// fotky, volt linka pod médiem, podtržený titulek. Hlava: volt čtvereček +
// nadpis, Zobrazit vše, hranaté šipky. Snap carousel 5/řadu.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop10ProductsSection({ content, variant, isAdmin, tenantSlug }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const COND = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
  const SANS = "'Barlow', 'Segoe UI', Arial, sans-serif";
  const VOLT = "#c8f53c";
  const ON_VOLT = "#111603";
  const VOLT_DEEP = "#6d9204";
  const SALE_INK = "#e8402c";
  const INK = "#121212";
  const MUTED = "#6f6f6f";
  const BORDER = "#e6e6e4";
  const SURFACE = "#f4f4f3";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  let products = data.products ?? [];
  if (content.saleOnly === true) {
    products = products.filter(p => p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents);
  }
  products = products.slice(0, 12);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const extraBadge = String(content.extraBadge ?? "");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const toggleWish = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    setWishlist(w => { const n = new Set(w); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es10p-card");
    const w = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "44px 0 18px" }}>
      <style>{`
        .es10p-wrap { max-width: 1460px; margin: 0 auto; padding: 0 24px; }
        .es10p-head { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .es10p-more { display: inline-flex; align-items: center; gap: 7px; margin-left: auto; font-family: ${COND};
          font-size: 15.5px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${VOLT_DEEP};
          text-decoration: none; white-space: nowrap; transition: color 0.14s, gap 0.14s; }
        .es10p-more:hover { color: ${INK}; gap: 11px; }
        .es10p-arrow { width: 40px; height: 40px; border: 2px solid ${BORDER}; border-radius: 2px; background: #fff;
          color: ${INK}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.14s, border-color 0.14s, color 0.14s; flex-shrink: 0; }
        .es10p-arrow:hover { background: ${VOLT}; border-color: ${VOLT}; color: ${ON_VOLT}; }

        .es10p-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory;
          scrollbar-width: none; -ms-overflow-style: none; padding: 2px 2px 8px; }
        .es10p-track::-webkit-scrollbar { display: none; }
        .es10p-card { flex: 0 0 calc(20% - 12.8px); min-width: 216px; scroll-snap-align: start;
          display: flex; flex-direction: column; text-decoration: none; background: #fff; }

        .es10p-media { position: relative; aspect-ratio: 1/1; border-radius: 2px; overflow: hidden; background: ${SURFACE}; }
        .es10p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es10p-card:hover .es10p-media img { transform: scale(1.06); }
        .es10p-underline { display: block; height: 2px; background: ${VOLT}; transform: scaleX(0); transform-origin: left;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1); }
        .es10p-card:hover .es10p-underline { transform: scaleX(1); }

        .es10p-badges { position: absolute; top: 10px; left: 10px; z-index: 2; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
        .es10p-sale { background: ${SALE_INK}; color: #fff; border-radius: 2px; padding: 5px 9px;
          font-family: ${COND}; font-size: 14px; font-weight: 800; letter-spacing: 0.04em; line-height: 1; }
        .es10p-extra { background: ${VOLT}; color: ${ON_VOLT}; border-radius: 2px; padding: 4px 8px;
          font-family: ${COND}; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; line-height: 1; }
        .es10p-new { background: #0a0a0b; color: ${VOLT}; border-radius: 2px; padding: 5px 9px;
          font-family: ${COND}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; line-height: 1; }

        .es10p-wish { position: absolute; top: 8px; right: 8px; z-index: 3; width: 34px; height: 34px; border: none;
          border-radius: 2px; background: rgba(255,255,255,0.92); color: ${INK}; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; transition: background 0.14s, color 0.14s, transform 0.14s; }
        .es10p-wish:hover { transform: scale(1.08); }
        .es10p-wish.es10p-wish--on { background: ${VOLT}; color: ${ON_VOLT}; }

        .es10p-brand { margin-top: 11px; font-family: ${COND}; font-size: 13px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: ${MUTED}; }
        .es10p-title { margin-top: 3px; font-size: 14.5px; font-weight: 600; color: ${INK}; line-height: 1.35;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es10p-card:hover .es10p-title { text-decoration: underline; text-underline-offset: 3px; }
        .es10p-prices { display: flex; align-items: baseline; gap: 8px; margin-top: 7px; }
        .es10p-price { font-size: 16.5px; font-weight: 800; color: ${INK}; letter-spacing: -0.01em; }
        .es10p-price--sale { color: ${SALE_INK}; }
        .es10p-compare { font-size: 13px; font-weight: 500; color: ${MUTED}; text-decoration: line-through; }
        .es10p-tagline { margin-top: 5px; font-family: ${COND}; font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; }

        @media (max-width: 1180px) { .es10p-card { flex-basis: calc(25% - 12px); } }
        @media (max-width: 980px) { .es10p-card { flex-basis: calc(33.33% - 11px); } }
        @media (max-width: 700px) {
          .es10p-card { flex-basis: calc(50% - 8px); min-width: 166px; }
          .es10p-arrows { display: none; }
        }
      `}</style>

      <div className="es10p-wrap">
        <div className="es10p-head">
          <span aria-hidden style={{ width: 10, height: 10, background: VOLT, flexShrink: 0 }} />
          {heading && (
            <h2 style={{ margin: 0, fontFamily: COND, fontSize: "clamp(26px, 2.6vw, 34px)", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: INK, lineHeight: 1 }}>{heading}</h2>
          )}
          <a href={moreResolved} className="es10p-more">
            {moreLabel}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <span className="es10p-arrows" style={{ display: "inline-flex", gap: 8 }}>
            <button type="button" className="es10p-arrow" aria-label="Posunout doleva" onClick={() => scrollBy(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            </button>
            <button type="button" className="es10p-arrow" aria-label="Posunout doprava" onClick={() => scrollBy(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </span>
        </div>

        <div ref={trackRef} className="es10p-track">
          {products.map((p) => {
            const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
            const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
            const isNew = p.flags?.new === true;
            const isTrending = p.flags?.featured === true;
            const wished = wishlist.has(p.id);
            return (
              <a key={p.id} href={isAdmin ? "#" : `${storeBase}/${p.slug}`} className="es10p-card">
                <span className="es10p-media">
                  {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                  <span className="es10p-badges">
                    {onSale && <span className="es10p-sale">−{salePct} %</span>}
                    {onSale && extraBadge && <span className="es10p-extra">{extraBadge}</span>}
                    {!onSale && isNew && <span className="es10p-new">Novinka</span>}
                  </span>
                  <button type="button" aria-label={wished ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                    className={`es10p-wish${wished ? " es10p-wish--on" : ""}`} onClick={(e) => toggleWish(e, p.id)}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15.6 3.5 9.7a4.7 4.7 0 0 1 8.5-2.8A4.7 4.7 0 0 1 20.5 9.7c0 5.9-8.5 10.8-8.5 10.8z"/></svg>
                  </button>
                </span>
                <span className="es10p-underline" />
                {p.brand && <span className="es10p-brand">{p.brand}</span>}
                <span className="es10p-title">{p.title}</span>
                <span className="es10p-prices">
                  <span className={`es10p-price${onSale ? " es10p-price--sale" : ""}`}>{fmt(p.price_min_cents)}</span>
                  {onSale && <span className="es10p-compare">{fmt(p.compare_at_price_cents!)}</span>}
                </span>
                {(isTrending || isNew) && (
                  <span className="es10p-tagline" style={{ color: isTrending ? VOLT_DEEP : MUTED }}>
                    {isTrending ? "↗ Trending" : "+ Novinka"}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── eshop-11-products ───────────────────────────────────────────────────────────
// HORAL (rockpoint DNA, povýšeno): produktový karusel — flat karty s vlasovým
// rámem (radius 0), zelený chip Nové / červený kódový chip, brand řádek,
// tučný titulek, hvězdičky (deterministicky z id), skladem zeleně, přeškrtnutá
// cena + zelená akční cena s −% chipem, outline Detail (hover ink fill).
// Centrovaný nadpis se zelenou linkou, plovoucí kruhové šipky po stranách
// tracku, scroll-snap. content: heading/moreLabel/moreHref/categorySlug/
// saleOnly/limit/promoCode.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop11ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const SANS = "'Fira Sans', 'Segoe UI', Arial, sans-serif";
  const INK = "#131313";
  const GREEN = "#0f7d4e";
  const GREEN_HOVER = "#0b613c";
  const RED = "#d92b2b";
  const STOCK = "#2e9e5b";
  const MUTED = "#6b6b66";
  const HAIR = "#e4e3df";
  const GREY = "#f5f5f4";
  const STAR = "#f2a90a";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  let products = data.products ?? [];
  if (content.saleOnly === true) {
    products = products.filter(p => p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents);
  }
  products = products.slice(0, 12);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);
  const promoCode = String(content.promoCode ?? "");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es11p-card");
    const w = card ? card.offsetWidth + 14 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "40px 0 22px" }}>
      <style>{`
        .es11p-wrap { max-width: 1440px; margin: 0 auto; padding: 0 24px; position: relative; }
        .es11p-head { display: flex; flex-direction: column; align-items: center; margin-bottom: 26px; }
        .es11p-more { display: inline-flex; align-items: center; gap: 7px; margin-top: 10px; font-size: 14px; font-weight: 700; color: ${GREEN}; text-decoration: none; transition: color 0.14s, gap 0.16s; }
        .es11p-more:hover { color: ${GREEN_HOVER}; gap: 11px; }

        .es11p-track { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px 2px 8px; }
        .es11p-track::-webkit-scrollbar { display: none; }
        .es11p-card { flex: 0 0 calc(20% - 11.2px); min-width: 226px; scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none;
          border: 1px solid ${HAIR}; background: #fff; padding: 14px 14px 16px; transition: border-color 0.16s, transform 0.18s, box-shadow 0.18s; }
        .es11p-card:hover { border-color: ${INK}; transform: translateY(-4px); box-shadow: 0 16px 32px rgba(19,19,19,0.12); }

        .es11p-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${GREY}; }
        .es11p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es11p-card:hover .es11p-media img { transform: scale(1.06); }
        .es11p-chips { position: absolute; top: 0; left: 0; z-index: 2; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
        .es11p-chip { padding: 6px 9px; font-size: 11.5px; font-weight: 700; line-height: 1; color: #fff; letter-spacing: 0.03em; }

        .es11p-brand { margin-top: 12px; font-size: 12px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: ${MUTED}; }
        .es11p-title { margin-top: 4px; font-size: 15.5px; font-weight: 700; color: ${INK}; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.6em; }
        .es11p-card:hover .es11p-title { color: ${GREEN_HOVER}; }

        .es11p-stars { display: flex; align-items: center; gap: 7px; margin-top: 7px; }
        .es11p-stock { margin-top: 8px; font-size: 12.5px; font-weight: 600; }

        .es11p-prices { display: flex; align-items: center; gap: 9px; margin-top: 4px; min-height: 30px; flex-wrap: wrap; }
        .es11p-price { font-size: 19px; font-weight: 800; color: ${INK}; white-space: nowrap; }
        .es11p-price--sale { color: ${GREEN}; }
        .es11p-compare { font-size: 13.5px; font-weight: 500; color: ${MUTED}; text-decoration: line-through; white-space: nowrap; }
        .es11p-pct { background: ${GREEN}; color: #fff; font-size: 12px; font-weight: 700; padding: 4px 7px; line-height: 1; }

        .es11p-btn { display: flex; align-items: center; justify-content: center; gap: 9px; height: 44px; margin-top: 12px;
          border: 1.5px solid ${INK}; background: #fff; color: ${INK}; font-size: 14px; font-weight: 600; transition: background 0.16s, color 0.16s; }
        .es11p-card:hover .es11p-btn { background: ${INK}; color: #fff; }
        .es11p-btn--out { border-color: ${HAIR}; color: ${MUTED}; }
        .es11p-card:hover .es11p-btn--out { background: ${GREY}; color: ${MUTED}; }
        .es11p-btn .es11p-btn-arr { transition: transform 0.18s; }
        .es11p-card:hover .es11p-btn .es11p-btn-arr { transform: translateX(4px); }

        .es11p-side { position: absolute; top: 45%; z-index: 5; width: 46px; height: 46px; border-radius: 50%; border: 1px solid ${HAIR};
          background: #fff; color: ${INK}; cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 24px rgba(19,19,19,0.16); transition: background 0.15s, color 0.15s, transform 0.15s; }
        .es11p-side:hover { background: ${INK}; color: #fff; transform: scale(1.06); }
        .es11p-side--l { left: 6px; }
        .es11p-side--r { right: 6px; }

        @media (max-width: 1180px) { .es11p-card { flex-basis: calc(25% - 10.5px); } }
        @media (max-width: 980px) { .es11p-card { flex-basis: calc(33.33% - 9.4px); } }
        @media (max-width: 700px) {
          .es11p-card { flex-basis: calc(50% - 7px); min-width: 172px; }
          .es11p-side { display: none; }
          .es11p-track { gap: 12px; margin: 0 -24px; padding: 2px 24px 8px; }
        }
      `}</style>
      <div className="es11p-wrap">
        {heading.trim() !== "" && (
          <div className="es11p-head">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
              fontFamily: SANS, fontSize: 31, fontWeight: 800, margin: 0, color: INK, textAlign: "center",
            }} />
            <span aria-hidden style={{ width: 46, height: 3.5, background: GREEN, marginTop: 12 }} />
            <a href={moreResolved} className="es11p-more">
              {moreLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        )}
        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${HAIR}`, padding: "44px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Zatím žádné produkty — přidejte je v administraci obchodu.
          </div>
        ) : (
          <>
            {products.length > 5 && (
              <>
                <button className="es11p-side es11p-side--l" aria-label="Předchozí" onClick={() => scrollBy(-1)}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
                </button>
                <button className="es11p-side es11p-side--r" aria-label="Další" onClick={() => scrollBy(1)}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </>
            )}
            <div className="es11p-track" ref={trackRef}>
              {products.map((p) => {
                const soldOut = p.stock_total <= 0;
                const lastPieces = !soldOut && p.stock_total <= 5;
                const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
                const isNew = p.flags?.new === true;
                const promo = promoCode !== "" && onSale && p.id % 3 === 0;
                const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
                const rating = (44 + (p.id % 7)) / 10; // 4.4–5.0 deterministicky
                const ratingCount = 3 + (p.id % 24);
                const fullStars = Math.round(rating);
                return (
                  <Link key={p.id} href={href} className="es11p-card" aria-disabled={isAdmin}>
                    <span className="es11p-media">
                      {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                      <span className="es11p-chips">
                        {promo && <span className="es11p-chip" style={{ background: RED }}>Extra −5 % | Kód: {promoCode}</span>}
                        {isNew && !soldOut && <span className="es11p-chip" style={{ background: GREEN }}>Nové</span>}
                        {soldOut && <span className="es11p-chip" style={{ background: "#8a8a85" }}>Vyprodáno</span>}
                      </span>
                    </span>
                    {p.brand && <span className="es11p-brand">{p.brand}</span>}
                    <span className="es11p-title">{p.title}</span>
                    <span className="es11p-stars">
                      <span style={{ display: "inline-flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(st => (
                          <svg key={st} width="13" height="13" viewBox="0 0 24 24" fill={st <= fullStars ? STAR : "#dcdbd6"}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"/></svg>
                        ))}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{rating.toFixed(1)}</span>
                      <span style={{ fontSize: 12.5, color: MUTED }}>({ratingCount})</span>
                    </span>
                    <span className="es11p-stock" style={{ color: soldOut ? MUTED : STOCK }}>
                      {soldOut ? "vyprodáno" : lastPieces ? `skladem poslední ${p.stock_total} ks` : "skladem"}
                    </span>
                    <span className="es11p-prices">
                      {onSale && <span className="es11p-compare">{fmt(p.compare_at_price_cents!)}</span>}
                      <span className={`es11p-price${onSale ? " es11p-price--sale" : ""}`}>
                        {p.price_min_cents === p.price_max_cents ? fmt(p.price_min_cents) : `od ${fmt(p.price_min_cents)}`}
                      </span>
                      {onSale && <span className="es11p-pct">−{salePct} %</span>}
                    </span>
                    <span className={`es11p-btn${soldOut ? " es11p-btn--out" : ""}`}>
                      {soldOut ? "Detail" : "Detail produktu"}
                      {!soldOut && <svg className="es11p-btn-arr" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><path d="M14 6l6 6-6 6"/></svg>}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ── eshop-11-brand-banner ───────────────────────────────────────────────────────
// HORAL (rockpoint DNA, povýšeno): brand blok — vlevo velký foto banner značky
// (chip, obří titulek, text, zelené CTA, hover zoom), vpravo 2×2 kompaktní
// produktové karty (chip Nové, brand, titulek, skladem, ceny s −% chipem).
// content: banner{kicker,title,text,ctaText,href,image} + categorySlug/limit.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop11BrandBanner({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const SANS = "'Fira Sans', 'Segoe UI', Arial, sans-serif";
  const INK = "#131313";
  const GREEN = "#0f7d4e";
  const GREEN_HOVER = "#0b613c";
  const STOCK = "#2e9e5b";
  const MUTED = "#6b6b66";
  const HAIR = "#e4e3df";
  const GREY = "#f5f5f4";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, 4);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const banner = (content.banner ?? {}) as { kicker?: string; title?: string; text?: string; ctaText?: string; href?: string; image?: string };
  const bannerHref = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${String(banner.href ?? "/obchod").startsWith("/obchod") ? banner.href : "/obchod"}` : String(banner.href ?? "/obchod"));

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "34px 0 22px" }}>
      <style>{`
        .es11bb-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.55fr); gap: 14px; }
        .es11bb-banner { position: relative; display: block; overflow: hidden; background: ${INK}; text-decoration: none; min-height: 560px; }
        .es11bb-banner img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .es11bb-banner:hover img { transform: scale(1.045); }
        .es11bb-cta { transition: background 0.16s; }
        .es11bb-banner:hover .es11bb-cta { background: ${GREEN_HOVER} !important; }
        .es11bb-cta .es11bb-arr { transition: transform 0.18s; }
        .es11bb-banner:hover .es11bb-arr { transform: translateX(4px); }

        .es11bb-cards { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 14px; }
        .es11bb-card { display: flex; gap: 14px; align-items: stretch; text-decoration: none; border: 1px solid ${HAIR}; background: #fff; padding: 12px; transition: border-color 0.16s, transform 0.18s, box-shadow 0.18s; }
        .es11bb-card:hover { border-color: ${INK}; transform: translateY(-3px); box-shadow: 0 14px 28px rgba(19,19,19,0.11); }
        .es11bb-media { position: relative; flex: 0 0 44%; overflow: hidden; background: ${GREY}; }
        .es11bb-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es11bb-card:hover .es11bb-media img { transform: scale(1.06); }
        .es11bb-title { font-size: 15px; font-weight: 700; color: ${INK}; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; transition: color 0.15s; }
        .es11bb-card:hover .es11bb-title { color: ${GREEN_HOVER}; }
        .es11bb-detail { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: ${INK}; border-bottom: 1.5px solid ${INK}; padding-bottom: 1px; transition: color 0.15s, border-color 0.15s; align-self: flex-start; }
        .es11bb-card:hover .es11bb-detail { color: ${GREEN_HOVER}; border-color: ${GREEN}; }

        @media (max-width: 1100px) { .es11bb-grid { grid-template-columns: 1fr; } .es11bb-banner { min-height: 380px; } }
        @media (max-width: 640px) { .es11bb-cards { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px" }}>
        <div className="es11bb-grid">
          <a href={bannerHref} className="es11bb-banner" aria-disabled={isAdmin}>
            {banner.image && <img src={banner.image} alt="" loading="lazy" />}
            <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(206deg, rgba(19,19,19,0.06) 30%, rgba(19,19,19,0.72) 100%)" }} />
            <span style={{ position: "absolute", left: 30, right: 30, top: 28, bottom: 28, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}>
              <span style={{ background: GREEN, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", padding: "7px 11px", lineHeight: 1 }}>{banner.kicker}</span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.06, textTransform: "uppercase", letterSpacing: "0.01em" }}>{banner.title}</span>
                {banner.text && <span style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", lineHeight: 1.5, maxWidth: 380 }}>{banner.text}</span>}
                <span className="es11bb-cta" style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 10, height: 50, padding: "0 26px", background: GREEN, color: "#fff", fontSize: 15, fontWeight: 600 }}>
                  {banner.ctaText ?? "Nakoupit"}
                  <svg className="es11bb-arr" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><path d="M14 6l6 6-6 6"/></svg>
                </span>
              </span>
            </span>
          </a>

          <div className="es11bb-cards">
            {products.map((p) => {
              const soldOut = p.stock_total <= 0;
              const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
              const isNew = p.flags?.new === true;
              const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
              return (
                <Link key={p.id} href={href} className="es11bb-card" aria-disabled={isAdmin}>
                  <span className="es11bb-media">
                    {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                    {isNew && !soldOut && <span style={{ position: "absolute", top: 0, left: 0, zIndex: 2, background: GREEN, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 8px", lineHeight: 1 }}>Nové</span>}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7, padding: "6px 2px" }}>
                    {p.brand && <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: MUTED }}>{p.brand}</span>}
                    <span className="es11bb-title">{p.title}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: soldOut ? MUTED : STOCK }}>{soldOut ? "vyprodáno" : "skladem"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {onSale && <span style={{ fontSize: 13, color: MUTED, textDecoration: "line-through" }}>{fmt(p.compare_at_price_cents!)}</span>}
                      <span style={{ fontSize: 17.5, fontWeight: 800, color: onSale ? GREEN : INK }}>{fmt(p.price_min_cents)}</span>
                      {onSale && <span style={{ background: GREEN, color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "3px 6px", lineHeight: 1 }}>−{salePct} %</span>}
                    </span>
                    <span className="es11bb-detail">
                      Detail
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><path d="M14 6l6 6-6 6"/></svg>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-12-products ───────────────────────────────────────────────────────────
// PACKA produktové karty (petcenter DNA): bílá karta radius 18, badge −% coral /
// Novinka purple, srdíčko, hvězdičky (mango, deterministické z id), titulek,
// „Skladem N ks" zeleně + dodání, cena mango + přeškrtnutá, zelené pill tlačítko
// DO KOŠÍKU (petcenter zelená). Centrovaný Baloo nadpis s tlapkou. layout:
// "grid" (4×N, homepage Vybíráme) | "carousel" (snap řada, Máme v akci).
// ──────────────────────────────────────────────────────────────────────────────
function Eshop12ProductsSection({ content, variant, isAdmin, tenantSlug }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const DISPLAY = "'Baloo 2', 'Segoe UI', system-ui, sans-serif";
  const SANS = "'Nunito', 'Segoe UI', system-ui, sans-serif";
  const PURPLE = "#6f45d1";
  const MANGO = "#ff8a3d", MANGO_DEEP = "#f06e1e";
  const NAVY = "#14224a", GREEN = "#16a06a", GREEN_DEEP = "#0e8557";
  const SALE = "#f5453b";
  const MUTED = "#71809a", BORDER = "#f0e7db", CREAM = "#fffbf6";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  let products = data.products ?? [];
  if (content.saleOnly === true) {
    products = products.filter(p => p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents);
  }
  products = products.slice(0, Number(content.limit) || 12);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const layout = String(content.layout ?? "grid");
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const toggleWish = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    setWishlist(w => { const n = new Set(w); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es12p-card");
    const w = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;
  const isCarousel = layout === "carousel";

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: CREAM, padding: "46px 0 26px" }}>
      <style>{`
        .es12p-wrap { max-width: 1360px; margin: 0 auto; padding: 0 24px; }
        .es12p-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        @media (max-width: 1180px) { .es12p-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 900px) { .es12p-grid { grid-template-columns: repeat(2, 1fr); } }
        .es12p-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory;
          scrollbar-width: none; padding: 2px 2px 10px; }
        .es12p-track::-webkit-scrollbar { display: none; }
        .es12p-track .es12p-card { flex: 0 0 calc(25% - 12px); min-width: 236px; scroll-snap-align: start; }
        @media (max-width: 1180px) { .es12p-track .es12p-card { flex-basis: calc(33.33% - 11px); } }
        @media (max-width: 900px) { .es12p-track .es12p-card { flex-basis: calc(50% - 8px); min-width: 196px; } }

        .es12p-card { display: flex; flex-direction: column; background: #fff; border: 1px solid ${BORDER};
          border-radius: 18px; padding: 14px 14px 16px; text-decoration: none; position: relative;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.2s; }
        .es12p-card:hover { transform: translateY(-4px); box-shadow: 0 18px 38px rgba(20,34,74,0.10); border-color: #e7dbc9; }
        .es12p-media { position: relative; aspect-ratio: 1/1; border-radius: 13px; overflow: hidden; background: #f7f2ea; }
        .es12p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es12p-card:hover .es12p-media img { transform: scale(1.06); }

        .es12p-badges { position: absolute; top: 10px; left: 10px; z-index: 2; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
        .es12p-sale { background: ${SALE}; color: #fff; border-radius: 999px; padding: 5px 11px;
          font-family: ${DISPLAY}; font-size: 13.5px; font-weight: 800; line-height: 1; box-shadow: 0 4px 10px rgba(245,69,59,0.3); }
        .es12p-new { background: ${PURPLE}; color: #fff; border-radius: 999px; padding: 5px 11px;
          font-family: ${DISPLAY}; font-size: 12.5px; font-weight: 700; line-height: 1; box-shadow: 0 4px 10px rgba(111,69,209,0.3); }

        .es12p-wish { position: absolute; top: 8px; right: 8px; z-index: 3; width: 34px; height: 34px; border: none;
          border-radius: 999px; background: rgba(255,255,255,0.94); color: ${NAVY}; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(20,34,74,0.12);
          transition: color 0.14s, transform 0.14s; }
        .es12p-wish:hover { transform: scale(1.1); color: ${MANGO_DEEP}; }
        .es12p-wish--on { color: ${MANGO_DEEP} !important; }

        .es12p-brand { margin-top: 11px; font-size: 11.5px; font-weight: 800; letter-spacing: 0.09em;
          text-transform: uppercase; color: ${MUTED}; }
        .es12p-title { margin-top: 3px; font-size: 14.5px; font-weight: 700; color: ${NAVY}; line-height: 1.35;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; }
        .es12p-card:hover .es12p-title { color: ${PURPLE}; }
        .es12p-stars { display: flex; align-items: center; gap: 5px; margin-top: 6px; }
        .es12p-avail { display: flex; align-items: center; gap: 6px; margin-top: 7px; font-size: 12.5px; font-weight: 700; color: ${GREEN}; }
        .es12p-avail small { font-weight: 600; color: ${MUTED}; }
        .es12p-prices { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; }
        .es12p-price { font-family: ${DISPLAY}; font-size: 19px; font-weight: 800; color: ${MANGO_DEEP}; }
        .es12p-compare { font-size: 13px; font-weight: 600; color: ${MUTED}; text-decoration: line-through; }
        .es12p-buy { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 11px;
          height: 42px; border-radius: 999px; background: ${GREEN}; color: #fff; font-family: ${DISPLAY};
          font-size: 14px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;
          box-shadow: 0 6px 14px rgba(22,160,106,0.28); transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .es12p-card:hover .es12p-buy { background: ${GREEN_DEEP}; transform: translateY(-1px); box-shadow: 0 10px 20px rgba(22,160,106,0.36); }

        .es12p-arrow { width: 42px; height: 42px; border: 2px solid ${BORDER}; border-radius: 999px; background: #fff;
          color: ${NAVY}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.14s, border-color 0.14s, color 0.14s; flex-shrink: 0; }
        .es12p-arrow:hover { background: ${MANGO}; border-color: ${MANGO}; color: #fff; }
        .es12p-morebtn { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 26px;
          border-radius: 999px; border: 2.5px solid ${PURPLE}; color: ${PURPLE}; font-family: ${DISPLAY};
          font-size: 15px; font-weight: 700; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .es12p-morebtn:hover { background: ${PURPLE}; color: #fff; }
      `}</style>

      <div className="es12p-wrap">
        {/* hlava — centrovaný nadpis s tlapkou (grid) / řádek se šipkami (carousel) */}
        {isCarousel ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <svg aria-hidden width="26" height="26" viewBox="0 0 24 24" fill={MANGO}><circle cx="6.2" cy="9.5" r="2.05"/><circle cx="10.4" cy="6.4" r="2.15"/><circle cx="14.9" cy="6.6" r="2.15"/><circle cx="18.6" cy="10.1" r="2"/><path d="M12.4 11.4c2.8 0 4.9 1.7 4.9 4 0 2.5-2.2 4.1-5.3 4.1-3 0-5.2-1.6-5.2-4 0-2.4 2.5-4.1 5.6-4.1Z"/></svg>
            {heading && <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(24px, 2.4vw, 32px)", fontWeight: 800, color: NAVY, lineHeight: 1 }}>{heading}</h2>}
            <a href={moreResolved} style={{ marginLeft: "auto", fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: PURPLE, textDecoration: "none", whiteSpace: "nowrap" }}>{moreLabel} →</a>
            <span style={{ display: "inline-flex", gap: 8 }}>
              <button type="button" className="es12p-arrow" aria-label="Posunout doleva" onClick={() => scrollBy(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
              </button>
              <button type="button" className="es12p-arrow" aria-label="Posunout doprava" onClick={() => scrollBy(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            </span>
          </div>
        ) : (
          heading && (
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <svg aria-hidden width="30" height="30" viewBox="0 0 24 24" fill={MANGO} style={{ transform: "rotate(-10deg)", marginBottom: 4 }}><circle cx="6.2" cy="9.5" r="2.05"/><circle cx="10.4" cy="6.4" r="2.15"/><circle cx="14.9" cy="6.6" r="2.15"/><circle cx="18.6" cy="10.1" r="2"/><path d="M12.4 11.4c2.8 0 4.9 1.7 4.9 4 0 2.5-2.2 4.1-5.3 4.1-3 0-5.2-1.6-5.2-4 0-2.4 2.5-4.1 5.6-4.1Z"/></svg>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontSize: "clamp(26px, 2.8vw, 36px)", fontWeight: 800, color: NAVY, lineHeight: 1.1 }}>{heading}</h2>
            </div>
          )
        )}

        <div ref={isCarousel ? trackRef : undefined} className={isCarousel ? "es12p-track" : "es12p-grid"}>
          {products.map((p) => {
            const onSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
            const salePct = onSale ? Math.round((1 - p.price_min_cents / p.compare_at_price_cents!) * 100) : 0;
            const isNew = p.flags?.new === true;
            const wished = wishlist.has(p.id);
            const rating = 4 + ((p.id % 10) / 10);
            const full = Math.round(Math.min(5, rating));
            const votes = 8 + (p.id % 87);
            return (
              <a key={p.id} href={isAdmin ? "#" : `${storeBase}/${p.slug}`} className="es12p-card">
                <span className="es12p-media">
                  {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                  <span className="es12p-badges">
                    {onSale && <span className="es12p-sale">−{salePct} %</span>}
                    {isNew && <span className="es12p-new">Novinka</span>}
                  </span>
                  <button type="button" aria-label={wished ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                    className={`es12p-wish${wished ? " es12p-wish--on" : ""}`} onClick={(e) => toggleWish(e, p.id)}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5S3.5 15.6 3.5 9.7a4.7 4.7 0 0 1 8.5-2.8A4.7 4.7 0 0 1 20.5 9.7c0 5.9-8.5 10.8-8.5 10.8z"/></svg>
                  </button>
                </span>
                {p.brand && <span className="es12p-brand">{p.brand}</span>}
                <span className="es12p-title">{p.title}</span>
                <span className="es12p-stars" aria-label={`Hodnocení ${rating.toFixed(1)} z 5`}>
                  <span style={{ display: "inline-flex", gap: 1 }}>
                    {[1, 2, 3, 4, 5].map(st => (
                      <svg key={st} width="13" height="13" viewBox="0 0 24 24" fill={st <= full ? MANGO : "#e8e0d4"}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>
                    ))}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: MUTED }}>({votes})</span>
                </span>
                <span className="es12p-avail">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  Skladem {p.stock_total > 20 ? ">20" : p.stock_total} ks <small>· u vás pozítří</small>
                </span>
                <span className="es12p-prices">
                  <span className="es12p-price">{p.price_min_cents !== p.price_max_cents ? `od ${fmt(p.price_min_cents)}` : fmt(p.price_min_cents)}</span>
                  {onSale && <span className="es12p-compare">{fmt(p.compare_at_price_cents!)}</span>}
                </span>
                <span className="es12p-buy">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.2l2.2 12.2a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/></svg>
                  Do košíku
                </span>
              </a>
            );
          })}
        </div>

        {!isCarousel && (
          <div style={{ textAlign: "center", marginTop: 26 }}>
            <a href={moreResolved} className="es12p-morebtn">
              {moreLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-14-products ───────────────────────────────────────────────────────────
// Zahradia: „Doporučujeme pro vás“ — karusel bílých karet (radius 18, vlasový
// rám, foto 1:1 radius 12, hover lift), název 2 řádky, cena forest 800 +
// přeškrtnutá compare + terakotový −% chip, terakotová pill „Do košíku“
// (quick-add přes default_variant_id, jinak proklik na detail). Centrovaný
// serif italic nadpis, kruhové šipky po stranách, scroll-snap.
// content: heading/moreLabel/moreHref/limit.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop14ProductsSection({ content, variant, isAdmin, tenantSlug }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const SERIF = "'Fraunces', Georgia, serif";
  const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";
  const FOREST = "#14352a";
  const TERRA = "#d96f32";
  const TERRA_DK = "#b8571f";
  const INK = "#1e2a24";
  const MUTED = "#6f7d72";
  const LINE = "#e5ddcb";
  const SAGE = "#e9efe6";
  const CREAM = "#faf7f0";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 10));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Doporučujeme pro vás");
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es14p-card");
    const w = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  const quickAdd = (e: React.MouseEvent, p: Record<string, unknown>) => {
    const variantId = (p as { default_variant_id?: number | null }).default_variant_id;
    if (!tenantSlug || !variantId) return; // necháme proklik na detail
    e.preventDefault();
    const slug = String(p.slug ?? "");
    setAdding(slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variant_id: variantId, qty: 1 }),
    })
      .then(() => window.dispatchEvent(new Event("webero-cart-item-added")))
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: CREAM, padding: "40px 0 26px" }}>
      <style>{`
        .es14p-wrap { max-width: 1400px; margin: 0 auto; padding: 0 28px; position: relative; }
        .es14p-more { display: inline-flex; align-items: center; gap: 7px; margin-top: 8px; font-size: 13.5px; font-weight: 700; color: ${TERRA_DK}; text-decoration: none; transition: color 0.14s, gap 0.18s; }
        .es14p-more:hover { color: ${TERRA}; gap: 11px; }

        .es14p-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 12px; }
        .es14p-track::-webkit-scrollbar { display: none; }
        .es14p-card { flex: 0 0 calc(20% - 12.8px); min-width: 236px; scroll-snap-align: start; display: flex; flex-direction: column; text-decoration: none;
          border: 1px solid ${LINE}; background: #fff; border-radius: 18px; padding: 14px 14px 16px; transition: transform 0.18s, box-shadow 0.18s; }
        .es14p-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(20,53,42,0.12); }

        .es14p-media { position: relative; aspect-ratio: 1/1; overflow: hidden; border-radius: 12px; background: ${SAGE}; }
        .es14p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es14p-card:hover .es14p-media img { transform: scale(1.06); }

        .es14p-title { margin-top: 12px; font-size: 15px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es14p-card:hover .es14p-title { color: ${TERRA_DK}; }

        .es14p-prices { display: flex; align-items: center; gap: 9px; margin-top: 8px; min-height: 28px; flex-wrap: wrap; }
        .es14p-price { font-size: 18.5px; font-weight: 800; color: ${FOREST}; white-space: nowrap; }
        .es14p-compare { font-size: 13px; font-weight: 500; color: ${MUTED}; text-decoration: line-through; white-space: nowrap; }
        .es14p-pct { background: ${TERRA}; color: #fff; font-size: 11.5px; font-weight: 700; padding: 4px 8px; border-radius: 999px; line-height: 1; }

        .es14p-btn { display: flex; align-items: center; justify-content: center; gap: 9px; height: 44px; margin-top: 12px; border: none; cursor: pointer;
          background: ${TERRA}; color: #fff; font-size: 13.5px; font-weight: 700; letter-spacing: 0.03em; border-radius: 999px; font-family: ${SANS};
          transition: background 0.15s, transform 0.14s; }
        .es14p-btn:hover { background: ${TERRA_DK}; transform: translateY(-1px); }
        .es14p-btn[disabled] { opacity: 0.55; cursor: default; }

        .es14p-arrow { position: absolute; top: 45%; z-index: 5; width: 46px; height: 46px; border-radius: 999px; background: #fff; color: ${FOREST};
          border: 1px solid ${LINE}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 24px rgba(20,53,42,0.14);
          transition: transform 0.14s, background 0.15s; }
        .es14p-arrow:hover { transform: scale(1.07); }
        @media (max-width: 700px) { .es14p-arrow { display: none; } .es14p-card { flex-basis: 68%; } }
      `}</style>
      <div className="es14p-wrap">
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(24px, 2.6vw, 33px)", color: FOREST, margin: 0 }}>{heading}</h2>
          {moreLabel && (
            <a href={moreResolved} className="es14p-more">
              {moreLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
          )}
        </div>

        <button className="es14p-arrow" style={{ left: 2 }} onClick={() => scrollBy(-1)} aria-label="Posunout doleva">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>
        </button>
        <button className="es14p-arrow" style={{ right: 2 }} onClick={() => scrollBy(1)} aria-label="Posunout doprava">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
        </button>

        <div className="es14p-track" ref={trackRef}>
          {products.map((p) => {
            const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
            const pct = sale ? Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100) : 0;
            const detailHref = isAdmin ? "#" : `${storeBase}/produkt/${p.slug}`;
            return (
              <a key={p.slug} href={detailHref} className="es14p-card">
                <span className="es14p-media">
                  {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" />}
                </span>
                <span className="es14p-title">{p.title}</span>
                <span className="es14p-prices">
                  <span className="es14p-price">{fmt(p.price_min_cents)}</span>
                  {sale && <span className="es14p-compare">{fmt(p.compare_at_price_cents as number)}</span>}
                  {sale && pct > 4 && <span className="es14p-pct">−{pct} %</span>}
                </span>
                <button
                  className="es14p-btn"
                  disabled={adding === p.slug}
                  onClick={(e) => quickAdd(e, p as unknown as Record<string, unknown>)}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/></svg>
                  Do košíku
                </button>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── eshop-13-products ───────────────────────────────────────────────────────────
// LUNELA (milagro DNA) — editorial produktový karusel v containeru 1140/15.
// Nadpis vlevo (Hanken 300/36, „Objevte nejnovější kolekci AURELLE"), vpravo
// dvě kruhové šipky (44px, hover ink fill). Karty celé na dlaždicové šedé
// #EBECE9 (radius 0): foto 1/1 nahoře, dole růžová badge Novinka (#FFD2D0),
// brand šedě + název černě v jednom odstavci, cena tučně (+ přeškrtnutá
// compare). Scroll-snap track, 4 karty na desktopu. content: heading /
// categorySlug / limit / badgeLabel / moreHref.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop13ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const SANS = "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif";
  const INK = "#141414";
  const TILE = "#EBECE9";
  const PINK = "#FFD2D0";
  const MUTED = "#83837f";
  const HAIR = "#dededb";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, 12);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const badgeLabel = String(content.badgeLabel ?? "Novinka");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es13p-card");
    const w = card ? card.offsetWidth + 24 : 300;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "34px 0 22px" }}>
      <style>{`
        .es13p-wrap { max-width: 1140px; margin: 0 auto; padding: 0 15px; }
        .es13p-head { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 26px; }

        .es13p-arrow { width: 44px; height: 44px; border-radius: 50%; border: 1px solid ${HAIR}; background: #fff; color: ${INK};
          cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.16s, color 0.16s, border-color 0.16s; }
        .es13p-arrow:hover { background: ${INK}; border-color: ${INK}; color: #fff; }

        .es13p-track { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; }
        .es13p-track::-webkit-scrollbar { display: none; }

        .es13p-card { flex: 0 0 calc(25% - 18px); min-width: 236px; scroll-snap-align: start; display: flex; flex-direction: column;
          background: ${TILE}; text-decoration: none; transition: box-shadow 0.2s, transform 0.2s; }
        .es13p-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(20,20,20,0.12); }

        .es13p-media { position: relative; aspect-ratio: 1 / 1; overflow: hidden; }
        .es13p-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(0.16,1,0.3,1); }
        .es13p-card:hover .es13p-media img { transform: scale(1.05); }

        .es13p-body { display: flex; flex-direction: column; align-items: flex-start; flex: 1; padding: 16px 18px 20px; }
        .es13p-badge { background: ${PINK}; color: ${INK}; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; padding: 5px 9px; line-height: 1; }
        .es13p-name { margin-top: 12px; font-size: 14.5px; line-height: 1.45; color: ${INK}; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; min-height: 3.4em; }
        .es13p-name .es13p-brand { color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.03em; }
        .es13p-card:hover .es13p-name { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
        .es13p-prices { margin-top: 12px; display: flex; align-items: baseline; gap: 9px; flex-wrap: wrap; }
        .es13p-price { font-size: 16.5px; font-weight: 700; color: ${INK}; white-space: nowrap; }
        .es13p-compare { font-size: 13px; font-weight: 400; color: ${MUTED}; text-decoration: line-through; white-space: nowrap; }

        @media (max-width: 1024px) { .es13p-card { flex-basis: calc(33.33% - 16px); } }
        @media (max-width: 760px) {
          .es13p-card { flex-basis: calc(50% - 8px); min-width: 168px; }
          .es13p-track { gap: 16px; margin: 0 -15px; padding: 0 15px; }
          .es13p-head h2 { font-size: 26px !important; }
          .es13p-arrows { display: none !important; }
        }
      `}</style>
      <div className="es13p-wrap">
        <div className="es13p-head">
          {heading.trim() !== "" && (
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
              fontFamily: SANS, fontSize: 36, fontWeight: 300, letterSpacing: "0.01em", margin: 0, color: INK, lineHeight: 1.2,
            }} />
          )}
          <div className="es13p-arrows" style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <button className="es13p-arrow" aria-label="Předchozí produkty" onClick={() => scrollBy(-1)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
            </button>
            <button className="es13p-arrow" aria-label="Další produkty" onClick={() => scrollBy(1)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ border: `1px dashed ${HAIR}`, padding: "44px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
            Produkty se načtou z katalogu obchodu (kategorie, štítky Novinka).
          </div>
        ) : (
          <div className="es13p-track" ref={trackRef}>
            {products.map((p) => {
              const isNew = (p.flags as Record<string, unknown> | undefined)?.new === true;
              const hasSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              return (
                <a key={p.id} href={isAdmin ? "#" : `${storeBase}/produkt/${p.slug}`} className="es13p-card">
                  <span className="es13p-media">
                    {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" />}
                  </span>
                  <span className="es13p-body">
                    {(isNew || hasSale) && <span className="es13p-badge">{hasSale && !isNew ? "Akce" : badgeLabel}</span>}
                    <span className="es13p-name">
                      {p.brand && <span className="es13p-brand">{p.brand}</span>}{p.brand ? " " : ""}{p.title.replace(new RegExp(`^${(p.brand ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")}
                    </span>
                    <span className="es13p-prices">
                      <span className="es13p-price">{fmt(p.price_min_cents)}</span>
                      {hasSale && <span className="es13p-compare">{fmt(p.compare_at_price_cents!)}</span>}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-13-gift-grid ──────────────────────────────────────────────────────────
// LUNELA (milagro DNA) — „Darujte radost s kolekcí AURELLE": nadpis vlevo
// (Hanken 300/36) + kruhové šipky vpravo (jen dekor/scroll na mobilu skryté),
// pod tím grid: vlevo vysoká lifestyle fotka přes obě řady s bílým serif brand
// overlayem dole, vpravo 2×2 produktové karty (celé #EBECE9, foto 4/5, růžová
// badge, brand+název, cena). content: heading / image / brandOverlay / href /
// categorySlug / limit / badgeLabel.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop13GiftGridSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const SERIF = "'Playfair Display', Georgia, serif";
  const SANS = "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif";
  const INK = "#141414";
  const TILE = "#EBECE9";
  const PINK = "#FFD2D0";
  const MUTED = "#83837f";

  const resolveHref = (href: string) =>
    isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${href.startsWith("/obchod") ? href : "/obchod"}` : href);

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, 4);
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = content.heading === undefined ? "" : String(content.heading);
  const image = String(content.image ?? "");
  const brandOverlay = String(content.brandOverlay ?? "");
  const href = String(content.href ?? "/obchod");
  const badgeLabel = String(content.badgeLabel ?? "Novinka");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "34px 0 22px" }}>
      <style>{`
        .es13g-wrap { max-width: 1140px; margin: 0 auto; padding: 0 15px; }
        .es13g-head { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
        .es13g-grid { display: grid; grid-template-columns: minmax(0, 545fr) minmax(0, 535fr); gap: 30px; align-items: stretch; }

        .es13g-photo { position: relative; display: block; overflow: hidden; background: ${TILE}; }
        .es13g-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .es13g-photo:hover img { transform: scale(1.035); }
        .es13g-brand { position: absolute; left: 0; right: 0; bottom: 46px; text-align: center; color: #fff;
          font-family: ${SERIF}; font-size: 42px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          text-shadow: 0 2px 22px rgba(0,0,0,0.28); }

        .es13g-products { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .es13g-card { display: flex; flex-direction: column; background: ${TILE}; text-decoration: none; transition: box-shadow 0.2s, transform 0.2s; }
        .es13g-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(20,20,20,0.12); }
        .es13g-media { position: relative; aspect-ratio: 4 / 5; overflow: hidden; }
        .es13g-media img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(0.16,1,0.3,1); }
        .es13g-card:hover .es13g-media img { transform: scale(1.05); }
        .es13g-body { display: flex; flex-direction: column; align-items: flex-start; flex: 1; padding: 14px 18px 20px; }
        .es13g-badge { background: ${PINK}; color: ${INK}; font-size: 12px; font-weight: 600; letter-spacing: 0.02em; padding: 5px 9px; line-height: 1; }
        .es13g-name { margin-top: 11px; font-size: 14.5px; line-height: 1.45; color: ${INK}; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
        .es13g-name .es13g-brandname { color: ${MUTED}; text-transform: uppercase; letter-spacing: 0.03em; }
        .es13g-card:hover .es13g-name { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
        .es13g-prices { margin-top: 11px; display: flex; align-items: baseline; gap: 9px; }
        .es13g-price { font-size: 16.5px; font-weight: 700; color: ${INK}; }
        .es13g-compare { font-size: 13px; color: ${MUTED}; text-decoration: line-through; }

        .es13g-arrow { width: 44px; height: 44px; border-radius: 50%; border: 1px solid #dededb; background: #fff; color: ${INK};
          cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: background 0.16s, color 0.16s, border-color 0.16s; }
        .es13g-arrow:hover { background: ${INK}; border-color: ${INK}; color: #fff; }

        @media (max-width: 900px) {
          .es13g-grid { grid-template-columns: 1fr; }
          .es13g-photo { aspect-ratio: 4 / 3; }
          .es13g-brand { font-size: 34px; bottom: 30px; }
          .es13g-head h2 { font-size: 26px !important; }
          .es13g-arrows { display: none !important; }
        }
      `}</style>
      <div className="es13g-wrap">
        <div className="es13g-head">
          {heading.trim() !== "" && (
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
              fontFamily: SANS, fontSize: 36, fontWeight: 300, letterSpacing: "0.01em", margin: 0, color: INK, lineHeight: 1.2,
            }} />
          )}
          <div className="es13g-arrows" style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <a className="es13g-arrow" aria-label="Předchozí" href={resolveHref(href)} style={{ opacity: 0.45 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
            </a>
            <a className="es13g-arrow" aria-label="Zobrazit kolekci" href={resolveHref(href)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        <div className="es13g-grid">
          <a href={resolveHref(href)} className="es13g-photo">
            {image && <img src={image} alt={brandOverlay || heading} loading="lazy" />}
            {brandOverlay && <span className="es13g-brand">{brandOverlay}</span>}
          </a>

          <div className="es13g-products">
            {products.map((p) => {
              const isNew = (p.flags as Record<string, unknown> | undefined)?.new === true;
              const hasSale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              return (
                <a key={p.id} href={isAdmin ? "#" : `${storeBase}/produkt/${p.slug}`} className="es13g-card">
                  <span className="es13g-media">
                    {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" />}
                  </span>
                  <span className="es13g-body">
                    {(isNew || hasSale) && <span className="es13g-badge">{hasSale && !isNew ? "Akce" : badgeLabel}</span>}
                    <span className="es13g-name">
                      {p.brand && <span className="es13g-brandname">{p.brand}</span>}{p.brand ? " " : ""}{p.title.replace(new RegExp(`^${(p.brand ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "")}
                    </span>
                    <span className="es13g-prices">
                      <span className="es13g-price">{fmt(p.price_min_cents)}</span>
                      {hasSale && <span className="es13g-compare">{fmt(p.compare_at_price_cents!)}</span>}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-16-products ───────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA): „Pro váš první nákup" — supermarketový karusel bílých
// karet (radius 16, vlasový rám, hover lift): foto 1:1, malinový −% chip,
// zelená badge „Srovnaná cena" (flags.priceMatch), název 2 řádky, šedý
// podtitulek „gramáž • jednotková cena", fíková cena 800 + přeškrtnutá compare,
// fíkové kruhové „+" (quick-add přes default_variant_id, po přidání ✓).
// Bricolage nadpis vlevo + „Zobrazit vše", kruhové šipky mizí na krajích.
// content: heading / moreLabel / moreHref / limit / featuredOnly.
// ──────────────────────────────────────────────────────────────────────────────
// ── eshop-15-picks ──────────────────────────────────────────────────────────────
// Apatyka „Vybrali jsme pro vás" — pilulka DNA 1:1. Velký tmavý nadpis, karusel
// karet: bílá karta s jemným rámečkem, čtvercové foto + tmavě zelený kruhový „+",
// chip Cashback na fotce; pod kartou cena (akční růžově s přeškrtnutou + Wow!),
// zelený pill „s apatyka PRO", brand link, titulek, jednotková cena, zelený
// řádek dostupnosti. Šipky po stranách jako u hero.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop15ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const GREEN = "#064740";
  const GREEN_DK = "#03332e";
  const TEAL = "#0f7a5e";
  const LIME_SOFT = "#c6f9ae";
  const PINK = "#e6007e";
  const PINK_SOFT = "#fccce6";
  const MINT = "#cdeed9";
  const INK = "#1c1c1c";
  const MUTED = "#6f6f6f";
  const LINE = "#e8e8e6";
  const SYS = "-apple-system, 'system-ui', 'Segoe UI', Roboto, Arial, sans-serif";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 10));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Vybrali jsme pro vás");
  const moreLabel = String(content.moreLabel ?? "");
  const moreHrefRaw = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHrefRaw.startsWith("/obchod") ? moreHrefRaw : "/obchod"}` : moreHrefRaw);
  const deliveryText = String(content.deliveryText ?? "Zítra od 07:00 u vás");
  const proSuffix = String(content.proSuffix ?? "s apatyka PRO");
  const wowLabel = String(content.wowLabel ?? "Wow!");
  const cashbackLabel = String(content.cashbackLabel ?? "Cashback");
  const ratingLabel = String(content.ratingLabel ?? "NutraRating");
  const brandTile = (content.brandTile ?? null) as { word?: string; tagline?: string; href?: string } | null;
  const ratingColor = (r: string) => (r.startsWith("A") ? "#7ac143" : r.startsWith("B") ? "#b5c227" : "#f0b429");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scrollByDir = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * Math.round((railRef.current?.clientWidth ?? 1000) * 0.75), behavior: "smooth" });
  };

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SYS, background: "#fff", padding: "26px 0 14px" }}>
      <style>{`
        .es15pk-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 14px; }
        .es15pk-rail::-webkit-scrollbar { display: none; }

        .es15pk-card { scroll-snap-align: start; flex: 0 0 calc(16.666% - 12px); min-width: 208px; text-decoration: none; display: flex; flex-direction: column; }

        .es15pk-media { position: relative; aspect-ratio: 1/1; border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; background: #fff; transition: box-shadow 0.22s, border-color 0.18s; }
        .es15pk-card:hover .es15pk-media { border-color: transparent; box-shadow: 0 14px 30px rgba(6,71,64,0.14); }
        .es15pk-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es15pk-card:hover .es15pk-media img { transform: scale(1.05); }
        .es15pk-cashback { position: absolute; top: 9px; right: 9px; background: ${GREEN}; color: #fff; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 999px; line-height: 1; }

        .es15pk-add { position: absolute; right: 10px; bottom: 10px; width: 42px; height: 42px; border-radius: 999px; border: none; cursor: pointer;
          background: ${GREEN}; color: #fff; display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.14s; }
        .es15pk-add:hover { background: ${GREEN_DK}; transform: scale(1.08); }
        .es15pk-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es15pk-add.is-added { background: #2fb26a; }

        .es15pk-priceline { display: flex; align-items: center; gap: 7px; margin-top: 11px; min-height: 24px; flex-wrap: wrap; }
        .es15pk-price { font-size: 16.5px; font-weight: 800; color: ${INK}; letter-spacing: -0.01em; white-space: nowrap; }
        .es15pk-sale { display: inline-flex; align-items: center; gap: 6px; background: ${PINK}; color: #fff; font-size: 13.5px; font-weight: 800; padding: 4px 9px; border-radius: 6px; line-height: 1.2; white-space: nowrap; }
        .es15pk-sale s { font-weight: 500; opacity: 0.75; font-size: 12px; }
        .es15pk-wow { background: ${PINK_SOFT}; color: #b3005f; font-size: 12px; font-weight: 800; padding: 4px 9px; border-radius: 6px; line-height: 1.2; }
        .es15pk-pro { display: inline-flex; margin-top: 6px; background: ${LIME_SOFT}; color: ${GREEN}; font-size: 12.5px; font-weight: 700; padding: 4px 9px; border-radius: 6px; line-height: 1.2; align-self: flex-start; }

        .es15pk-brand { margin-top: 8px; font-size: 13.5px; font-weight: 600; color: ${TEAL}; text-decoration: underline; text-underline-offset: 3px; align-self: flex-start; }
        .es15pk-title { margin-top: 4px; font-size: 14.5px; font-weight: 500; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es15pk-card:hover .es15pk-title { color: ${GREEN}; }
        .es15pk-sub { margin-top: 3px; font-size: 12.5px; color: ${MUTED}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; min-height: 1.35em; }
        .es15pk-ship { display: inline-flex; align-items: center; gap: 6px; margin-top: 9px; font-size: 12.5px; font-weight: 600; color: #159a62; }

        .es15pk-arrow { position: absolute; top: 190px; z-index: 5; width: 40px; height: 40px; border-radius: 999px;
          background: #fff; color: ${GREEN}; border: 1px solid #bfe3c8; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          transition: background 0.14s, transform 0.14s, opacity 0.18s; }
        .es15pk-arrow:hover { background: ${MINT}; transform: scale(1.08); }
        .es15pk-arrow:disabled { opacity: 0; pointer-events: none; }

        .es15pk-more { display: inline-flex; align-items: center; height: 36px; padding: 0 17px; border: 1px solid #c9cfc9; border-radius: 999px;
          background: #fff; color: ${GREEN}; font-size: 13.5px; font-weight: 600; text-decoration: none; white-space: nowrap;
          transition: background 0.14s, border-color 0.14s; }
        .es15pk-more:hover { background: ${MINT}; border-color: ${MINT}; }

        .es15pk-rating { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12.5px; color: ${INK}; }
        .es15pk-rating b { font-size: 11.5px; font-weight: 800; color: #fff; padding: 3px 7px; border-radius: 5px; line-height: 1; }

        .es15pk-tile { position: relative; scroll-snap-align: start; flex: 0 0 calc(33.333% - 10px); min-width: 320px; border-radius: 12px; overflow: hidden;
          text-decoration: none; display: flex; flex-direction: column; justify-content: flex-end; padding: 26px 28px;
          background: linear-gradient(146deg, ${GREEN} 12%, #0d6a52 58%, #159a62 100%); }
        .es15pk-tile::before { content: ""; position: absolute; width: 340px; height: 340px; border-radius: 999px; right: -110px; top: -130px;
          background: radial-gradient(circle, rgba(126,253,146,0.34), rgba(126,253,146,0) 68%); }
        .es15pk-tile::after { content: ""; position: absolute; width: 260px; height: 260px; border-radius: 999px; left: -90px; bottom: -110px;
          background: radial-gradient(circle, rgba(205,238,217,0.26), rgba(205,238,217,0) 70%); }
        .es15pk-tile-word { position: relative; font-weight: 800; font-size: clamp(50px, 5vw, 74px); letter-spacing: -0.03em; line-height: 0.95;
          color: #fff; text-transform: lowercase; transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
        .es15pk-tile:hover .es15pk-tile-word { transform: translateY(-4px); }
        .es15pk-tile-tag { position: relative; margin-top: 12px; font-size: 15px; font-weight: 600; color: ${MINT}; }

        @media (max-width: 1100px) { .es15pk-card { flex-basis: calc(25% - 11px); } }
        @media (max-width: 640px) { .es15pk-tile { flex-basis: 78%; min-width: 250px; padding: 20px 22px; } }
        @media (max-width: 640px) { .es15pk-card { flex-basis: 47%; min-width: 172px; } .es15pk-arrow { display: none; } }
        @media (prefers-reduced-motion: reduce) {
          .es15pk-media, .es15pk-media img, .es15pk-add, .es15pk-arrow { transition: none !important; }
          .es15pk-card:hover .es15pk-media img { transform: none; }
        }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 0 16px" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: SYS, fontWeight: 800, fontSize: "clamp(24px, 2.4vw, 32px)", letterSpacing: "-0.02em", color: GREEN, margin: 0,
          }} />
          {moreLabel && <a href={moreResolved} className="es15pk-more">{moreLabel}</a>}
        </div>

        {!products.length ? (
          <div style={{ padding: "34px 0", color: MUTED, fontSize: 14.5 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty).
          </div>
        ) : (
          <>
            <div className="es15pk-rail" ref={railRef} onScroll={updateArrows}>
              {brandTile?.word && (
                <a className="es15pk-tile" href={isAdmin ? "#" : (tenantSlug && brandTile.href?.startsWith("/obchod") ? `/demo/${tenantSlug}${brandTile.href}` : (brandTile.href ?? "#"))}>
                  <span className="es15pk-tile-word">{brandTile.word}</span>
                  {brandTile.tagline && <span className="es15pk-tile-tag">{brandTile.tagline}</span>}
                </a>
              )}
              {products.map((p) => {
                const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const proCents = typeof p.flags?.pro === "number" ? (p.flags.pro as number) : null;
                const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
                return (
                  <a key={p.id} className="es15pk-card" href={href}>
                    <div className="es15pk-media">
                      {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                      {p.flags?.cashback ? <span className="es15pk-cashback">{cashbackLabel}</span> : null}
                      <button
                        className={`es15pk-add${added === p.slug ? " is-added" : ""}`}
                        disabled={adding === p.slug || !p.default_variant_id}
                        onClick={(e) => quickAdd(e, p)}
                        aria-label={`Přidat ${p.title} do košíku`}
                      >
                        {added === p.slug ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    </div>

                    <span className="es15pk-priceline">
                      {sale ? (
                        <>
                          <span className="es15pk-sale">{fmt(p.price_min_cents)} <s>{fmt(p.compare_at_price_cents!)}</s></span>
                          <span className="es15pk-wow">{wowLabel}</span>
                        </>
                      ) : (
                        <span className="es15pk-price">{fmt(p.price_min_cents)}</span>
                      )}
                    </span>
                    {proCents != null && <span className="es15pk-pro">{fmt(proCents)} {proSuffix}</span>}

                    {p.brand && <span className="es15pk-brand">{p.brand}</span>}
                    <span className="es15pk-title">{p.title}</span>
                    {typeof p.flags?.rating === "string" && (
                      <span className="es15pk-rating">{ratingLabel} <b style={{ background: ratingColor(p.flags.rating as string) }}>{p.flags.rating as string}</b></span>
                    )}
                    {p.subtitle && <span className="es15pk-sub">{p.subtitle}</span>}

                    <span className="es15pk-ship">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                      {deliveryText}
                    </span>
                  </a>
                );
              })}
            </div>

            <button className="es15pk-arrow" style={{ left: 8 }} disabled={!canL} onClick={() => scrollByDir(-1)} aria-label="Předchozí produkty">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
            </button>
            <button className="es15pk-arrow" style={{ right: 8 }} disabled={!canR} onClick={() => scrollByDir(1)} aria-label="Další produkty">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function Eshop16ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const FIG_DK = "#3f152c";
  const RASP = "#d23c55";
  const GREEN = "#3e9b4f";
  const INK = "#241a20";
  const MUTED = "#7a6c74";
  const CREAM = "#fbf7f1";
  const LINE = "#e9dfe0";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 10));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Pro váš první nákup");
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);
  const tile = content.tile === true; // kosik DNA: karusel v surface dlaždici (Pekárna a cukrárna)
  const subheading = content.subheading === undefined ? "" : String(content.subheading);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.75), behavior: "smooth" });
  };

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16p-head { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
        .es16p-more { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: ${FIG}; text-decoration: none; white-space: nowrap; transition: gap 0.16s, color 0.14s; }
        .es16p-more:hover { gap: 11px; color: ${FIG_DK}; }

        .es16p-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 6px 2px 16px; }
        .es16p-rail::-webkit-scrollbar { display: none; }

        .es16p-card { scroll-snap-align: start; flex: 0 0 calc(16.666% - 10px); min-width: 198px; background: #fff; border: 1px solid ${LINE}; border-radius: 16px;
          padding: 12px 12px 14px; text-decoration: none; display: flex; flex-direction: column; position: relative;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.16s; }
        .es16p-card:hover { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(86,32,61,0.13); border-color: transparent; }

        .es16p-media { position: relative; aspect-ratio: 1/1; border-radius: 11px; overflow: hidden; background: ${CREAM}; }
        .es16p-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es16p-card:hover .es16p-media img { transform: scale(1.06); }
        .es16p-pct { position: absolute; top: 8px; left: 8px; background: ${RASP}; color: #fff; font-size: 12px; font-weight: 800; padding: 5px 9px; border-radius: 999px; line-height: 1; letter-spacing: 0.01em; }

        .es16p-flags { display: flex; gap: 6px; margin-top: 9px; min-height: 20px; }
        .es16p-match { display: inline-flex; align-items: center; gap: 4px; background: rgba(62,155,79,0.12); color: ${GREEN}; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; line-height: 1.2; }
        .es16p-newchip { display: inline-flex; align-items: center; background: rgba(242,165,65,0.16); color: #a86a12; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; line-height: 1.2; }

        .es16p-title { margin-top: 6px; font-size: 14px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es16p-card:hover .es16p-title { color: ${FIG}; }
        .es16p-sub { margin-top: 3px; font-size: 12px; color: ${MUTED}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; min-height: 1.35em; }

        .es16p-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; margin-top: 10px; }
        .es16p-prices { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .es16p-compare { font-size: 12px; color: ${MUTED}; white-space: nowrap; min-height: 1.3em; }
        .es16p-compare.is-sale { text-decoration: line-through; }
        .es16p-price { font-size: 18px; font-weight: 800; color: ${FIG}; white-space: nowrap; letter-spacing: -0.01em; }
        .es16p-price.is-sale { color: ${RASP}; }

        .es16p-add { flex: 0 0 auto; width: 42px; height: 42px; border-radius: 999px; border: none; cursor: pointer; background: ${FIG}; color: #fff;
          display: inline-flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.14s; }
        .es16p-add:hover { background: ${FIG_DK}; transform: scale(1.07); }
        .es16p-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es16p-add.is-added { background: ${GREEN}; }

        .es16p-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid ${LINE}; background: #fff; color: ${FIG}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 24px rgba(36,26,32,0.12); transition: background 0.15s, opacity 0.18s; }
        .es16p-arrow:hover { background: ${FIG}; color: #fff; }
        .es16p-arrow:disabled { opacity: 0; pointer-events: none; }

        @media (max-width: 1100px) { .es16p-card { flex-basis: calc(25% - 9px); } }
        @media (max-width: 640px) { .es16p-card { flex-basis: 46%; min-width: 168px; } .es16p-arrow { display: none; } }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es16p-head">
          <div style={{ minWidth: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
              fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.015em", color: INK, margin: 0,
            }} />
            {subheading.trim() !== "" && (
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="p" style={{
                margin: "3px 0 0", fontSize: 13.5, fontWeight: 500, color: MUTED, lineHeight: 1.4,
              }} />
            )}
          </div>
          {moreLabel && (
            <a href={moreResolved} className="es16p-more">
              {moreLabel}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
          )}
        </div>

        <div style={{ position: "relative", ...(tile ? { background: "#f6efe4", borderRadius: 18, padding: "12px 14px 0" } : {}) }}>
          <button className="es16p-arrow" style={{ left: -14 }} onClick={() => scrollBy(-1)} disabled={!canL} aria-label="Posunout doleva">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
          </button>

          {products.length === 0 ? (
            <div style={{ border: `1px dashed ${LINE}`, borderRadius: 16, padding: "40px 24px", textAlign: "center", color: MUTED, fontSize: 14 }}>
              Produkty se načtou z katalogu obchodu (štítek Doporučené).
            </div>
          ) : (
            <div className="es16p-rail" ref={railRef} onScroll={updateArrows}>
              {products.map((p) => {
                const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const pct = sale ? Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100) : 0;
                const priceMatch = p.flags?.priceMatch === true;
                const isNew = p.flags?.new === true;
                const isAdded = added === p.slug;
                return (
                  <a key={p.slug} href={isAdmin ? "#" : `${storeBase}/produkt/${p.slug}`} className="es16p-card">
                    <span className="es16p-media">
                      {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                      {sale && pct > 2 && <span className="es16p-pct">−{pct} %</span>}
                    </span>
                    <span className="es16p-flags">
                      {priceMatch && (
                        <span className="es16p-match">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          Srovnaná cena
                        </span>
                      )}
                      {!priceMatch && isNew && <span className="es16p-newchip">Novinka</span>}
                    </span>
                    <span className="es16p-title">{p.title}</span>
                    <span className="es16p-sub">{p.subtitle ?? ""}</span>
                    <span className="es16p-foot">
                      <span className="es16p-prices">
                        <span className={`es16p-compare${sale ? " is-sale" : ""}`}>{sale ? fmt(p.compare_at_price_cents as number) : " "}</span>
                        <span className={`es16p-price${sale ? " is-sale" : ""}`}>{fmt(p.price_min_cents)}</span>
                      </span>
                      <button
                        className={`es16p-add${isAdded ? " is-added" : ""}`}
                        disabled={adding === p.slug}
                        onClick={(e) => quickAdd(e, p)}
                        aria-label={`Přidat ${p.title} do košíku`}
                      >
                        {isAdded ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    </span>
                  </a>
                );
              })}
            </div>
          )}

          <button className="es16p-arrow" style={{ right: -14 }} onClick={() => scrollBy(1)} disabled={!canR} aria-label="Posunout doprava">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── eshop-16-sale ───────────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA): „Akční týden" — celá sekce v surface dlaždici (radius
// 18) na krému: vlevo fíkový promo banner (Bricolage titulek, meruňková pill
// CTA, obří % watermark, plovoucí −50 % bublina), vpravo karusel bílých karet
// s kosik cenovkou: malinový cenový box se superscript haléři + přeškrtnutá
// původní + chip „−NN % do <datum>", žlutá badge „Srovnaná cena" na fotce,
// fíkové „+" quick-add přes roh fotky. content: heading / moreLabel / moreHref
// / limit / categorySlug / source:"newest" / saleUntil / promo{title,text,cta}.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop16SaleSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const FIG_DK = "#3f152c";
  const APRICOT = "#f2a541";
  const RASP = "#d23c55";
  const INK = "#241a20";
  const MUTED = "#7a6c74";
  const CREAM = "#fbf7f1";
  const SURFACE = "#f6efe4";
  const LINE = "#e9dfe0";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? [])
    .filter((p) => p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents)
    .slice(0, Math.max(4, Number(content.limit) || 10));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Akční týden");
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const saleUntil = String(content.saleUntil ?? "");
  const promo = (content.promo ?? {}) as { title?: string; text?: string; cta?: string };
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  // kosik cenovka: celé Kč velké, haléře superscript (34⁹⁰)
  const splitPrice = (cents: number) => {
    const kc = Math.floor(cents / 100);
    const hal = String(cents % 100).padStart(2, "0");
    return { kc: new Intl.NumberFormat("cs-CZ").format(kc), hal };
  };
  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: "smooth" });
  };

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16s-head { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
        .es16s-more { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: ${FIG}; text-decoration: none; white-space: nowrap; transition: gap 0.16s, color 0.14s; }
        .es16s-more:hover { gap: 11px; color: ${FIG_DK}; }

        .es16s-tile { background: ${SURFACE}; border-radius: 18px; padding: 14px; display: flex; gap: 14px; position: relative; }

        .es16s-promo { flex: 0 0 300px; border-radius: 14px; overflow: hidden; position: relative; display: flex; flex-direction: column; justify-content: flex-end;
          background: radial-gradient(120% 120% at 20% 0%, #6d2f4e 0%, ${FIG} 55%, ${FIG_DK} 100%); color: #fff; padding: 104px 22px 24px; min-height: 340px; }
        .es16s-promo-mark { position: absolute; right: -18px; top: -30px; font-family: ${HEAD}; font-weight: 800; font-size: 190px; line-height: 1; color: rgba(255,255,255,0.07); pointer-events: none; }
        .es16s-bubble { position: absolute; top: 26px; left: 22px; background: ${RASP}; color: #fff; font-family: ${HEAD}; font-weight: 800; font-size: 22px;
          padding: 12px 16px; border-radius: 999px; transform: rotate(-6deg); box-shadow: 0 12px 26px rgba(210,60,85,0.4); }
        .es16s-promo h3 { font-family: ${HEAD}; font-weight: 800; font-size: 27px; letter-spacing: -0.015em; line-height: 1.12; margin: 0 0 8px; }
        .es16s-promo p { margin: 0 0 16px; font-size: 13.5px; color: rgba(255,255,255,0.82); line-height: 1.5; }
        .es16s-promo-cta { display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; background: ${APRICOT}; color: ${FIG_DK};
          font-size: 13.5px; font-weight: 800; padding: 11px 20px; border-radius: 999px; text-decoration: none; transition: transform 0.14s, background 0.15s; }
        .es16s-promo-cta:hover { transform: translateY(-2px); background: #f7b45c; }

        .es16s-railwrap { position: relative; flex: 1; min-width: 0; }
        .es16s-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; height: 100%; }
        .es16s-rail::-webkit-scrollbar { display: none; }

        .es16s-card { scroll-snap-align: start; flex: 0 0 calc(25% - 9px); min-width: 196px; background: #fff; border-radius: 14px; padding: 12px 12px 14px;
          text-decoration: none; display: flex; flex-direction: column; transition: transform 0.18s, box-shadow 0.18s; }
        .es16s-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(86,32,61,0.13); }

        .es16s-media { position: relative; aspect-ratio: 1/1; border-radius: 10px; overflow: hidden; background: ${CREAM}; }
        .es16s-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es16s-card:hover .es16s-media img { transform: scale(1.06); }
        .es16s-match { position: absolute; top: 8px; left: 8px; background: #f9e3b0; color: #7a5a12; font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 999px; line-height: 1.2; }
        .es16s-add { position: absolute; right: 8px; bottom: 8px; width: 38px; height: 38px; border-radius: 999px; border: none; cursor: pointer;
          background: ${FIG}; color: #fff; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 18px rgba(36,26,32,0.25);
          transition: background 0.15s, transform 0.14s; }
        .es16s-add:hover { background: ${FIG_DK}; transform: scale(1.08); }
        .es16s-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es16s-add.is-added { background: #3e9b4f; }

        .es16s-pricerow { display: flex; align-items: center; gap: 8px; margin-top: 11px; flex-wrap: wrap; }
        .es16s-pricebox { background: ${RASP}; color: #fff; border-radius: 8px; padding: 3px 8px 4px; font-family: ${HEAD}; font-weight: 800; font-size: 19px; line-height: 1; }
        .es16s-pricebox sup { font-size: 11px; font-weight: 800; margin-left: 1px; }
        .es16s-old { font-size: 12.5px; color: ${MUTED}; text-decoration: line-through; }
        .es16s-chip { display: inline-flex; margin-top: 7px; background: rgba(210,60,85,0.1); color: ${RASP}; font-size: 12px; font-weight: 700; padding: 4px 9px; border-radius: 999px; line-height: 1.2; align-self: flex-start; }
        .es16s-title { margin-top: 7px; font-size: 13.5px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es16s-card:hover .es16s-title { color: ${FIG}; }
        .es16s-sub { margin-top: 3px; font-size: 11.5px; color: ${MUTED}; line-height: 1.35; }

        .es16s-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid ${LINE}; background: #fff; color: ${FIG}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 24px rgba(36,26,32,0.12); transition: background 0.15s, opacity 0.18s; }
        .es16s-arrow:hover { background: ${FIG}; color: #fff; }
        .es16s-arrow:disabled { opacity: 0; pointer-events: none; }

        @media (max-width: 1100px) { .es16s-card { flex-basis: calc(33.33% - 8px); } }
        @media (max-width: 860px) {
          .es16s-tile { flex-direction: column; }
          .es16s-promo { flex: 0 0 auto; min-height: 220px; }
          .es16s-card { flex-basis: 46%; min-width: 168px; }
          .es16s-arrow { display: none; }
        }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es16s-head">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.015em", color: INK, margin: 0,
          }} />
          {moreLabel && (
            <a href={moreResolved} className="es16s-more">
              {moreLabel}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
          )}
        </div>

        <div className="es16s-tile">
          <div className="es16s-promo">
            <span className="es16s-promo-mark" aria-hidden>%</span>
            <span className="es16s-bubble">až −50 %</span>
            <h3>{String(promo.title ?? "Vidíte tu slevu?")}</h3>
            <p>{String(promo.text ?? "Každé pondělí nový výběr akcí. Jen dokud jsou skladem.")}</p>
            <a href={moreResolved} className="es16s-promo-cta">
              {String(promo.cta ?? "Objevit všechny")}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
          </div>

          <div className="es16s-railwrap">
            <button className="es16s-arrow" style={{ left: -8 }} onClick={() => scrollBy(-1)} disabled={!canL} aria-label="Posunout doleva">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
            </button>
            <div className="es16s-rail" ref={railRef} onScroll={updateArrows}>
              {products.map((p) => {
                const pct = Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100);
                const priceMatch = p.flags?.priceMatch === true;
                const { kc, hal } = splitPrice(p.price_min_cents);
                const isAdded = added === p.slug;
                return (
                  <a key={p.slug} href={isAdmin ? "#" : `${storeBase}/produkt/${p.slug}`} className="es16s-card">
                    <span className="es16s-media">
                      {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                      {priceMatch && <span className="es16s-match">Srovnaná cena</span>}
                      <button
                        className={`es16s-add${isAdded ? " is-added" : ""}`}
                        disabled={adding === p.slug}
                        onClick={(e) => quickAdd(e, p)}
                        aria-label={`Přidat ${p.title} do košíku`}
                      >
                        {isAdded ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        )}
                      </button>
                    </span>
                    <span className="es16s-pricerow">
                      <span className="es16s-pricebox">{kc}<sup>{hal}</sup></span>
                      <span className="es16s-old">{fmt(p.compare_at_price_cents as number)}</span>
                    </span>
                    <span className="es16s-chip">−{pct} %{saleUntil ? ` ${saleUntil}` : ""}</span>
                    <span className="es16s-title">{p.title}</span>
                    <span className="es16s-sub">{p.subtitle ?? ""}</span>
                  </a>
                );
              })}
            </div>
            <button className="es16s-arrow" style={{ right: -8 }} onClick={() => scrollBy(1)} disabled={!canR} aria-label="Posunout doprava">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── eshop-16-multibuy ───────────────────────────────────────────────────────────
// Spížka (kosik.cz DNA): „Multikup" — karusel karet s množstevní slevou
// (flags.multikup = { qty, price } v haléřích za kus při odběru qty+ ks):
// malinový cenový box se superscript haléři + „od N ks", pod tím šedě cena za
// 1 ks, fíkový chip MULTIKUP na fotce, „+" quick-add přes roh fotky. Layout
// vzor es16p (bílé karty na krému). content: heading/moreLabel/moreHref/limit/
// categorySlug/source:"newest".
// ──────────────────────────────────────────────────────────────────────────────
function Eshop16MultibuySection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const HEAD = "'Bricolage Grotesque', 'Segoe UI', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const FIG = "#56203d";
  const FIG_DK = "#3f152c";
  const RASP = "#d23c55";
  const INK = "#241a20";
  const MUTED = "#7a6c74";
  const CREAM = "#fbf7f1";
  const LINE = "#e9dfe0";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? [])
    .filter((p) => {
      const mb = p.flags?.multikup as { qty?: number; price?: number } | undefined;
      return mb && typeof mb.qty === "number" && typeof mb.price === "number";
    })
    .slice(0, Math.max(4, Number(content.limit) || 10));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Multikup");
  const moreLabel = String(content.moreLabel ?? "Zobrazit vše");
  const moreHref = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHref.startsWith("/obchod") ? moreHref : "/obchod"}` : moreHref);

  const splitPrice = (cents: number) => ({
    kc: new Intl.NumberFormat("cs-CZ").format(Math.floor(cents / 100)),
    hal: String(cents % 100).padStart(2, "0"),
  });
  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.75), behavior: "smooth" });
  };

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: CREAM, padding: "26px 0 12px" }}>
      <style>{`
        .es16m-head { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
        .es16m-more { display: inline-flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 700; color: ${FIG}; text-decoration: none; white-space: nowrap; transition: gap 0.16s, color 0.14s; }
        .es16m-more:hover { gap: 11px; color: ${FIG_DK}; }
        .es16m-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 4px 2px 16px; }
        .es16m-rail::-webkit-scrollbar { display: none; }
        .es16m-card { scroll-snap-align: start; flex: 0 0 calc(16.666% - 10px); min-width: 198px; background: #fff; border: 1px solid ${LINE}; border-radius: 16px;
          padding: 12px 12px 14px; text-decoration: none; display: flex; flex-direction: column; transition: transform 0.18s, box-shadow 0.18s, border-color 0.16s; }
        .es16m-card:hover { transform: translateY(-4px); box-shadow: 0 18px 36px rgba(86,32,61,0.13); border-color: transparent; }
        .es16m-media { position: relative; aspect-ratio: 1/1; border-radius: 11px; overflow: hidden; background: ${CREAM}; }
        .es16m-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.45s cubic-bezier(0.16,1,0.3,1); }
        .es16m-card:hover .es16m-media img { transform: scale(1.06); }
        .es16m-flag { position: absolute; top: 8px; left: 8px; background: ${FIG}; color: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: 0.07em; padding: 4px 9px; border-radius: 999px; line-height: 1.2; }
        .es16m-add { position: absolute; right: 8px; bottom: 8px; width: 38px; height: 38px; border-radius: 999px; border: none; cursor: pointer;
          background: ${FIG}; color: #fff; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 18px rgba(36,26,32,0.25);
          transition: background 0.15s, transform 0.14s; }
        .es16m-add:hover { background: ${FIG_DK}; transform: scale(1.08); }
        .es16m-add[disabled] { opacity: 0.6; cursor: default; transform: none; }
        .es16m-add.is-added { background: #3e9b4f; }
        .es16m-pricerow { display: flex; align-items: center; gap: 8px; margin-top: 11px; }
        .es16m-pricebox { background: ${RASP}; color: #fff; border-radius: 8px; padding: 3px 8px 4px; font-family: ${HEAD}; font-weight: 800; font-size: 19px; line-height: 1; }
        .es16m-pricebox sup { font-size: 11px; font-weight: 800; margin-left: 1px; }
        .es16m-qty { font-size: 13px; font-weight: 800; color: ${RASP}; }
        .es16m-single { margin-top: 5px; font-size: 12px; color: ${MUTED}; }
        .es16m-title { margin-top: 6px; font-size: 14px; font-weight: 600; color: ${INK}; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.7em; transition: color 0.14s; }
        .es16m-card:hover .es16m-title { color: ${FIG}; }
        .es16m-sub { margin-top: 3px; font-size: 11.5px; color: ${MUTED}; line-height: 1.35; }
        .es16m-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid ${LINE}; background: #fff; color: ${FIG}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 24px rgba(36,26,32,0.12); transition: background 0.15s, opacity 0.18s; }
        .es16m-arrow:hover { background: ${FIG}; color: #fff; }
        .es16m-arrow:disabled { opacity: 0; pointer-events: none; }
        @media (max-width: 1100px) { .es16m-card { flex-basis: calc(25% - 9px); } }
        @media (max-width: 640px) { .es16m-card { flex-basis: 46%; min-width: 168px; } .es16m-arrow { display: none; } }
      `}</style>
      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div className="es16m-head">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(20px, 2vw, 26px)", letterSpacing: "-0.015em", color: INK, margin: 0,
          }} />
          {moreLabel && (
            <a href={moreResolved} className="es16m-more">
              {moreLabel}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
            </a>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <button className="es16m-arrow" style={{ left: -14 }} onClick={() => scrollBy(-1)} disabled={!canL} aria-label="Posunout doleva">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6"/></svg>
          </button>
          <div className="es16m-rail" ref={railRef} onScroll={updateArrows}>
            {products.map((p) => {
              const mb = p.flags?.multikup as { qty: number; price: number };
              const { kc, hal } = splitPrice(mb.price);
              const isAdded = added === p.slug;
              return (
                <a key={p.slug} href={isAdmin ? "#" : `${storeBase}/produkt/${p.slug}`} className="es16m-card">
                  <span className="es16m-media">
                    {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                    <span className="es16m-flag">MULTIKUP</span>
                    <button
                      className={`es16m-add${isAdded ? " is-added" : ""}`}
                      disabled={adding === p.slug}
                      onClick={(e) => quickAdd(e, p)}
                      aria-label={`Přidat ${p.title} do košíku`}
                    >
                      {isAdded ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                      )}
                    </button>
                  </span>
                  <span className="es16m-pricerow">
                    <span className="es16m-pricebox">{kc}<sup>{hal}</sup></span>
                    <span className="es16m-qty">od {mb.qty} ks</span>
                  </span>
                  <span className="es16m-single">{fmt(p.price_min_cents)} za 1 ks</span>
                  <span className="es16m-title">{p.title}</span>
                  <span className="es16m-sub">{p.subtitle ?? ""}</span>
                </a>
              );
            })}
          </div>
          <button className="es16m-arrow" style={{ right: -14 }} onClick={() => scrollBy(1)} disabled={!canR} aria-label="Posunout doprava">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── eshop-17-products ───────────────────────────────────────────────────────────
// Rozkvět (florea.cz DNA): produktový grid „Oblíbené květiny a kytice" — bílé
// karty s vlasovým rámem (radius 12, hover lift), florea anatomie: NÁZEV
// NAHOŘE (2 řádky), čtvercové foto s badge vrstvou (bordó „MNOŽSTEVNÍ SLEVA
// N %" vpravo nahoře; nad spodní hranou fotky zlatý TIP, zelená DOPRAVA
// ZDARMA, bordó −N% s tag ikonou), pod fotkou zelená skladovost („Skladem
// X kusů" / „X kusů + dodání od zítřka"), cenový řádek s přeškrtnutou compare
// a bordó cenou, vpravo zelené pill tlačítko Detail. Fraunces nadpis bordó.
// Grid 4 sloupce → 2 na mobilu. content: heading / moreLabel / moreHref /
// limit / source („newest" vypne featuredOnly) / categorySlug.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop17ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const HEAD = "'Fraunces', Georgia, serif";
  const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";
  const BORDO = "#8f1d3d";
  const BORDO_DK = "#611028";
  const GOLD = "#c9a24b";
  const GREEN = "#3c7d46";
  const GREEN_DK = "#2f6238";
  const INK = "#241a1d";
  const MUTED = "#7d6d72";
  const LINE = "#eadfd6";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 8));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Oblíbené květiny a kytice");
  const moreLabel = String(content.moreLabel ?? "");
  const moreHrefRaw = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHrefRaw.startsWith("/obchod") ? moreHrefRaw : "/obchod"}` : moreHrefRaw);
  const stockLabel = String(content.stockLabel ?? "Skladem");
  const deliveryLabel = String(content.deliveryLabel ?? "dodání od");
  const detailLabel = String(content.detailLabel ?? "Detail");
  const bulkLabel = String(content.bulkLabel ?? "MNOŽSTEVNÍ SLEVA");
  const tipLabel = String(content.tipLabel ?? "TIP");
  const freeShipLabel = String(content.freeShipLabel ?? "DOPRAVA ZDARMA");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
  const deliveryDate = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })
    .format(new Date(Date.now() + 24 * 3600 * 1000));

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: "#fff", padding: "30px 0 16px" }}>
      <style>{`
        .es17p-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        @media (max-width: 1100px) { .es17p-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 820px) { .es17p-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } }

        .es17p-card { background: #fff; border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s, box-shadow 0.2s, border-color 0.18s; }
        .es17p-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(46,10,24,0.11); border-color: #ddc9b4; }

        .es17p-title { padding: 13px 15px 10px; font-size: 14px; font-weight: 700; color: ${INK}; line-height: 1.4;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: calc(2.8em + 23px); transition: color 0.14s; }
        .es17p-card:hover .es17p-title { color: ${BORDO}; }

        .es17p-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: #f7f1e8; }
        .es17p-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es17p-card:hover .es17p-media img { transform: scale(1.06); }

        .es17p-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em;
          padding: 4.5px 9px; border-radius: 6px; line-height: 1.25; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.18); }

        .es17p-stock { font-size: 12.5px; line-height: 1.4; padding: 10px 15px 0; min-height: 2.2em; }
        .es17p-priceline { display: flex; align-items: center; gap: 9px; padding: 8px 15px 15px; margin-top: auto; }
        .es17p-detail { margin-left: auto; display: inline-flex; align-items: center; background: ${GREEN}; color: #fff; font-size: 13px;
          font-weight: 700; padding: 9px 17px; border-radius: 999px; transition: background 0.15s, transform 0.14s; }
        .es17p-card:hover .es17p-detail { background: ${GREEN_DK}; transform: translateY(-1px); }

        .es17p-more { display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 18px; border: 1.5px solid ${BORDO};
          border-radius: 999px; color: ${BORDO}; font-size: 13.5px; font-weight: 700; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .es17p-more:hover { background: ${BORDO}; color: #fff; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "0 0 18px" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 600, fontSize: "clamp(23px, 2.2vw, 30px)", letterSpacing: "-0.01em", color: BORDO, margin: 0,
          }} />
          {moreLabel && <a href={moreResolved} className="es17p-more" style={{ marginLeft: "auto" }}>{moreLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
          </a>}
        </div>

        {!products.length ? (
          <div style={{ padding: "34px 0", color: MUTED, fontSize: 14.5 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty).
          </div>
        ) : (
          <div className="es17p-grid">
            {products.map((p) => {
              const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              const salePct = sale ? Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100) : 0;
              const bulk = typeof p.flags?.bulk === "number" ? (p.flags.bulk as number) : null;
              const isTip = p.flags?.featured === true;
              const freeShip = p.flags?.freeShip === true;
              const inStock = p.stock_total > 50;
              const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
              return (
                <a key={p.id} className="es17p-card" href={href}>
                  <span className="es17p-title">{p.title}</span>
                  <span className="es17p-media">
                    {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                    {bulk != null && (
                      <span className="es17p-badge" style={{ position: "absolute", top: 10, right: 10, background: BORDO }}>
                        {bulkLabel} {bulk} %
                      </span>
                    )}
                    <span style={{ position: "absolute", right: 10, bottom: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      {isTip && (
                        <span className="es17p-badge" style={{ background: GOLD, color: BORDO_DK }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 3.5h7.6l9.4 9.4a1.7 1.7 0 0 1 0 2.4l-5.2 5.2a1.7 1.7 0 0 1-2.4 0L3.5 11V3.5Z"/><circle cx="8" cy="8" r="1.4"/></svg>
                          {tipLabel}
                        </span>
                      )}
                      {freeShip && (
                        <span className="es17p-badge" style={{ background: GREEN }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                          {freeShipLabel}
                        </span>
                      )}
                      {sale && salePct > 0 && (
                        <span className="es17p-badge" style={{ background: BORDO_DK }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 3.5h7.6l9.4 9.4a1.7 1.7 0 0 1 0 2.4l-5.2 5.2a1.7 1.7 0 0 1-2.4 0L3.5 11V3.5Z"/><circle cx="8" cy="8" r="1.4"/></svg>
                          −{salePct} %
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="es17p-stock">
                    {p.stock_total <= 0 ? (
                      <span style={{ color: MUTED, fontWeight: 600 }}>Vyprodáno</span>
                    ) : inStock ? (
                      <span style={{ color: GREEN_DK, fontWeight: 700 }}>{stockLabel} {p.stock_total} {p.stock_total >= 5 ? "kusů" : p.stock_total === 1 ? "kus" : "kusy"}</span>
                    ) : (
                      <>
                        <span style={{ color: GREEN_DK, fontWeight: 700 }}>{p.stock_total} {p.stock_total >= 5 ? "kusů" : p.stock_total === 1 ? "kus" : "kusy"}</span>
                        <span style={{ display: "block", color: INK, fontWeight: 600 }}>{deliveryLabel} {deliveryDate}</span>
                      </>
                    )}
                  </span>
                  <span className="es17p-priceline">
                    {sale && <s style={{ color: MUTED, fontSize: 12.5, fontWeight: 500 }}>{fmt(p.compare_at_price_cents as number)}</s>}
                    <span style={{ fontSize: 16.5, fontWeight: 700, color: sale ? BORDO : INK, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{fmt(p.price_min_cents)}</span>
                    <span className="es17p-detail">{detailLabel}</span>
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-18-products ───────────────────────────────────────────────────────────
// Oktan (autokelly.cz DNA): produktový pás „Probíhající akce" / „Novinky" /
// „Mohli byste potřebovat" / „Výprodej" — jedna komponenta, řízená obsahem
// (heading, moreLabel/moreHref, limit, categorySlug, source:"newest").
// Karta: bílá radius 14, hover lift + karbonový rám; čtvercové foto na papíru
// s badge vrstvou (červený skosený −N %, žlutý TOP z flags.featured, karbonová
// NOVINKA z flags.new) a žlutým quick-add čtvercem (košík+, po přidání zelený
// check); tělo: uppercase značka, název 2 řádky, subtitle 1 řádek; zelená
// skladovost s tečkou („Skladem N ks" / „Běžně do 11 dnů" / „Vyprodáno");
// cenový řádek: přeškrtnutá compare + cena (sleva červeně) + drobné „s DPH".
// Hlavička: žlutý skosený mark + Archivo 900 italic uppercase nadpis, vpravo
// chip „Zobrazit vše". Grid 5 → 4 → 3 → 2 sloupce.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop18ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const HEAD = "'Archivo', 'Arial Black', sans-serif";
  const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
  const CARBON = "#131417";
  const CARBON_DK = "#0b0c0e";
  const YELLOW = "#ffd400";
  const YELLOW_DK = "#eec500";
  const INK = "#16171a";
  const MUTED = "#6a6e75";
  const PAPER = "#f5f5f2";
  const LINE = "#e4e5e0";
  const GREEN = "#1f9d55";
  const RED = "#e03131";

  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 5));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Probíhající akce");
  const moreLabel = String(content.moreLabel ?? "");
  const moreHrefRaw = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHrefRaw.startsWith("/obchod") ? moreHrefRaw : "/obchod"}` : moreHrefRaw);
  const stockLabel = String(content.stockLabel ?? "Skladem");
  const backorderLabel = String(content.backorderLabel ?? "Běžně do 11 dnů");
  const soldOutLabel = String(content.soldOutLabel ?? "Vyprodáno");
  const vatLabel = String(content.vatLabel ?? "s DPH");
  const topLabel = String(content.topLabel ?? "TOP");
  const newLabel = String(content.newLabel ?? "Novinka");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: PAPER, padding: "26px 0 12px" }}>
      <style>{`
        .es18p-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1280px) { .es18p-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 1020px) { .es18p-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 720px) { .es18p-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }

        .es18p-card { position: relative; background: #fff; border: 1.5px solid ${LINE}; border-radius: 14px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es18p-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(11,12,14,0.1); border-color: ${CARBON}; }

        .es18p-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${PAPER}; }
        .es18p-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es18p-card:hover .es18p-media img { transform: scale(1.05); }

        .es18p-chip { display: inline-flex; align-items: center; gap: 4px; font-family: ${HEAD}; font-weight: 800; font-stretch: 110%; font-size: 11px;
          letter-spacing: 0.07em; text-transform: uppercase; padding: 5px 11px; line-height: 1.2; clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%); }

        .es18p-add { position: absolute; right: 10px; bottom: 10px; width: 40px; height: 40px; border: none; border-radius: 11px; background: ${YELLOW};
          color: ${CARBON}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(11,12,14,0.16); transition: background 0.15s, color 0.15s, transform 0.15s; }
        .es18p-add:hover { background: ${CARBON}; color: ${YELLOW}; transform: translateY(-2px); }
        .es18p-add:disabled { cursor: default; opacity: 0.75; }
        .es18p-add.es18p-ok { background: ${GREEN}; color: #fff; }

        .es18p-title { font-size: 13.5px; font-weight: 700; color: ${INK}; line-height: 1.38;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.76em; transition: color 0.14s; }

        .es18p-more { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 19px; border: 1.5px solid ${CARBON}; border-radius: 11px;
          color: ${INK}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none;
          background: #fff; transition: background 0.15s, color 0.15s, gap 0.16s; }
        .es18p-more:hover { background: ${CARBON}; color: ${YELLOW}; gap: 12px; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 16px" }}>
          <span aria-hidden="true" style={{ width: 10, height: 26, background: YELLOW, transform: "skewX(-14deg)", flexShrink: 0 }} />
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontStretch: "115%", fontSize: "clamp(20px, 1.9vw, 26px)",
            letterSpacing: "0.01em", textTransform: "uppercase", color: INK, margin: 0,
          }} />
          {moreLabel && (
            <a href={moreResolved} className="es18p-more" style={{ marginLeft: "auto" }}>
              {moreLabel}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          )}
        </div>

        {!products.length ? (
          <div style={{ padding: "34px 0", color: MUTED, fontSize: 14.5 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty).
          </div>
        ) : (
          <div className="es18p-grid">
            {products.map((p) => {
              const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              const salePct = sale ? Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100) : 0;
              const isTop = p.flags?.featured === true;
              const isNew = p.flags?.new === true;
              const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
              const isAdded = added === p.slug;
              return (
                <a key={p.id} className="es18p-card" href={href}>
                  <span className="es18p-media">
                    {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                    <span style={{ position: "absolute", left: 10, top: 10, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                      {sale && salePct > 0 && <span className="es18p-chip" style={{ background: RED, color: "#fff" }}>−{salePct} %</span>}
                      {isTop && <span className="es18p-chip" style={{ background: YELLOW, color: CARBON }}>{topLabel}</span>}
                      {isNew && <span className="es18p-chip" style={{ background: CARBON, color: "#fff" }}>{newLabel}</span>}
                    </span>
                    {p.stock_total > 0 && p.default_variant_id != null && (
                      <button
                        className={`es18p-add${isAdded ? " es18p-ok" : ""}`}
                        onClick={(e) => quickAdd(e, p)}
                        disabled={adding === p.slug || isAdded}
                        aria-label={`Přidat ${p.title} do košíku`}
                      >
                        {isAdded ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.6l2.5 12h10.2l2.2-8.5H6.2"/><path d="M13.5 6.5h5M16 4v5"/></svg>
                        )}
                      </button>
                    )}
                  </span>

                  <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "11px 13px 13px" }}>
                    {p.brand && <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", color: MUTED, marginBottom: 4 }}>{p.brand}</span>}
                    <span className="es18p-title">{p.title}</span>
                    {p.subtitle && <span style={{ marginTop: 3, fontSize: 12, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.subtitle}</span>}

                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 9, fontSize: 12, fontWeight: 700 }}>
                      {p.stock_total <= 0 ? (
                        <span style={{ color: MUTED }}>{soldOutLabel}</span>
                      ) : p.stock_total > 15 ? (
                        <>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: GREEN, flexShrink: 0 }} />
                          <span style={{ color: GREEN }}>{stockLabel} {p.stock_total} ks</span>
                        </>
                      ) : (
                        <>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#e8a13c", flexShrink: 0 }} />
                          <span style={{ color: "#b97e22" }}>{backorderLabel}</span>
                        </>
                      )}
                    </span>

                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                      {sale && <s style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{fmt(p.compare_at_price_cents as number)}</s>}
                      <span style={{ fontFamily: HEAD, fontWeight: 800, fontStretch: "108%", fontSize: 17.5, letterSpacing: "0.005em", color: sale ? RED : INK, whiteSpace: "nowrap" }}>{fmt(p.price_min_cents)}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED }}>{vatLabel}</span>
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-19-products ───────────────────────────────────────────────────────────
// Grunt (dek.cz DNA): produktový pás „Akční položky" / „Novinky v sortimentu" —
// jedna komponenta řízená obsahem (heading, moreLabel/moreHref, limit,
// categorySlug, source:"newest"). Karta = DEK cenovka 1:1 povýšená: bílá radius
// 8, hover lift + grafitový rám; foto s vrstvou badge (žlutá skosená vlajka
// −N % vlevo nahoře, grafitová NOVINKA z flags.new); červený badge „Výhodná
// cena" nad názvem (flags.deal); přeškrtnutá compare + červená cena + „cena za
// <unit> s DPH" (flags.unit); zelená skladovost „Skladem: > N ks" + „V prodejně";
// qty stepper − 1 + a zelené tlačítko Do košíku (POST qty, event
// webero-cart-item-added), pod ním „celkem s DPH". Hlavička: červený slab +
// Space Grotesk uppercase nadpis, vpravo chip „Zobrazit vše". Grid 5→4→3→2.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop19ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const HEAD = "'Space Grotesk', 'Arial', sans-serif";
  const SANS = "'Inter', 'Segoe UI', system-ui, sans-serif";
  const RED = "#d5232c";
  const RED_DK = "#b31b23";
  const GRAPHITE = "#212428";
  const INK = "#1d1f23";
  const MUTED = "#6b6f76";
  const PAPER = "#f4f3ef";
  const LINE = "#e6e5e0";
  const GREEN = "#1e8f4a";
  const GREEN_DK = "#187a3f";
  const YELLOW = "#ffd12e";

  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 5));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Akční položky");
  const moreLabel = String(content.moreLabel ?? "");
  const moreHrefRaw = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHrefRaw.startsWith("/obchod") ? moreHrefRaw : "/obchod"}` : moreHrefRaw);
  const stockLabel = String(content.stockLabel ?? "Skladem:");
  const storeNote = String(content.storeNote ?? "V prodejně");
  const soldOutLabel = String(content.soldOutLabel ?? "Vyprodáno");
  const dealLabel = String(content.dealLabel ?? "Výhodná cena");
  const newLabel = String(content.newLabel ?? "Novinka");
  const buyLabel = String(content.buyLabel ?? "Do košíku");
  const totalNote = String(content.totalNote ?? "celkem s DPH");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
  const stockFmt = (n: number) => (n >= 500 ? "> 500" : n >= 100 ? "> 100" : n >= 20 ? "> 20" : String(n));

  const qtyOf = (slug: string) => Math.max(1, qtys[slug] ?? 1);
  const bumpQty = (e: React.MouseEvent, slug: string, delta: number) => {
    e.preventDefault(); e.stopPropagation();
    setQtys((q) => ({ ...q, [slug]: Math.max(1, (q[slug] ?? 1) + delta) }));
  };

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: qtyOf(p.slug) }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: PAPER, padding: "30px 0 16px" }}>
      <style>{`
        .es19p-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 1280px) { .es19p-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 1020px) { .es19p-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 720px) { .es19p-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; } }

        .es19p-card { position: relative; background: #fff; border: 1.5px solid ${LINE}; border-radius: 8px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es19p-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(23,25,28,0.1); border-color: ${GRAPHITE}; }

        .es19p-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${PAPER}; }
        .es19p-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es19p-card:hover .es19p-media img { transform: scale(1.05); }

        .es19p-flag { position: absolute; left: -34px; top: 14px; transform: rotate(-45deg); width: 120px; text-align: center;
          background: ${YELLOW}; color: ${INK}; font-family: ${HEAD}; font-weight: 700; font-size: 12px; letter-spacing: 0.03em;
          padding: 5px 0; box-shadow: 0 4px 10px rgba(23,25,28,0.14); }

        .es19p-title { font-size: 13.5px; font-weight: 700; color: ${INK}; line-height: 1.38;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.76em; transition: color 0.14s; }
        .es19p-card:hover .es19p-title { color: ${RED}; }

        .es19p-qty { display: inline-flex; align-items: center; border: 1.5px solid ${LINE}; border-radius: 6px; background: #fff; }
        .es19p-qty button { border: none; background: none; cursor: pointer; padding: 5px 9px; color: ${INK}; display: flex; align-items: center; transition: opacity 0.13s; }
        .es19p-qty button:hover { opacity: 0.5; }

        .es19p-buy { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 36px; border: none; border-radius: 6px;
          background: ${GREEN}; color: #fff; font-family: ${SANS}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.02em; cursor: pointer;
          transition: background 0.15s, transform 0.14s; }
        .es19p-buy:hover { background: ${GREEN_DK}; transform: translateY(-1px); }
        .es19p-buy:disabled { cursor: default; opacity: 0.8; }
        .es19p-buy.es19p-ok { background: ${GREEN_DK}; }

        .es19p-more { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 19px; border: 1.5px solid ${GRAPHITE}; border-radius: 6px;
          color: ${INK}; font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none;
          background: #fff; transition: background 0.15s, color 0.15s, gap 0.16s; }
        .es19p-more:hover { background: ${GRAPHITE}; color: #fff; gap: 12px; }
      `}</style>

      <div style={{ maxWidth: 1420, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 16px" }}>
          <span aria-hidden="true" style={{ width: 10, height: 26, background: RED, borderRadius: 2, flexShrink: 0 }} />
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            fontFamily: HEAD, fontWeight: 700, fontSize: "clamp(20px, 1.9vw, 26px)",
            letterSpacing: "0.02em", textTransform: "uppercase", color: INK, margin: 0,
          }} />
          {moreLabel && (
            <a href={moreResolved} className="es19p-more" style={{ marginLeft: "auto" }}>
              {moreLabel}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          )}
        </div>

        {!products.length ? (
          <div style={{ padding: "34px 0", color: MUTED, fontSize: 14.5 }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty).
          </div>
        ) : (
          <div className="es19p-grid">
            {products.map((p) => {
              const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
              const salePct = sale ? Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100) : 0;
              const isDeal = p.flags?.deal === true;
              const isNew = p.flags?.new === true;
              const unit = typeof p.flags?.unit === "string" ? (p.flags.unit as string) : "ks";
              const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
              const isAdded = added === p.slug;
              const qty = qtyOf(p.slug);
              return (
                <a key={p.id} className="es19p-card" href={href}>
                  <span className="es19p-media">
                    {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                    {sale && salePct > 0 && <span className="es19p-flag">−{salePct} %</span>}
                    {isNew && (
                      <span style={{ position: "absolute", right: 10, top: 10, background: GRAPHITE, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4.5px 10px", borderRadius: 4 }}>{newLabel}</span>
                    )}
                  </span>

                  <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "11px 13px 13px" }}>
                    <span style={{ minHeight: 22, marginBottom: 4 }}>
                      {isDeal && (
                        <span style={{ display: "inline-block", background: RED, color: "#fff", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3.5px 8px", borderRadius: 3 }}>{dealLabel}</span>
                      )}
                    </span>
                    <span className="es19p-title">{p.title}</span>
                    {p.subtitle && <span style={{ marginTop: 3, fontSize: 11.5, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.subtitle}</span>}

                    <span style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
                      {sale && <s style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{fmt(p.compare_at_price_cents as number)}</s>}
                      <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 18, letterSpacing: "0.005em", color: sale || isDeal ? RED : INK, whiteSpace: "nowrap" }}>{fmt(p.price_min_cents)}</span>
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED, marginTop: 1 }}>cena za {unit} s DPH</span>

                    <span style={{ display: "inline-flex", flexDirection: "column", gap: 1, marginTop: 8, fontSize: 12, fontWeight: 700 }}>
                      {p.stock_total <= 0 ? (
                        <span style={{ color: MUTED }}>{soldOutLabel}</span>
                      ) : (
                        <>
                          <span style={{ color: GREEN, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: 999, background: GREEN, flexShrink: 0 }} />
                            {stockLabel} {stockFmt(p.stock_total)} {unit}
                          </span>
                          <span style={{ color: MUTED, fontWeight: 500, fontSize: 11.5, paddingLeft: 13 }}>{storeNote}</span>
                        </>
                      )}
                    </span>

                    {p.stock_total > 0 && p.default_variant_id != null && (
                      <>
                        <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}>
                          <span className="es19p-qty">
                            <button onClick={(e) => bumpQty(e, p.slug, -1)} aria-label="Snížit množství">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
                            <button onClick={(e) => bumpQty(e, p.slug, 1)} aria-label="Zvýšit množství">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/></svg>
                            </button>
                          </span>
                          <button
                            className={`es19p-buy${isAdded ? " es19p-ok" : ""}`}
                            onClick={(e) => quickAdd(e, p)}
                            disabled={adding === p.slug || isAdded}
                            aria-label={`Přidat ${p.title} do košíku`}
                          >
                            {isAdded ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                            ) : buyLabel}
                          </button>
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: MUTED, marginTop: 6 }}>{fmt(p.price_min_cents * qty)} {totalNote}</span>
                      </>
                    )}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── eshop-20-products ───────────────────────────────────────────────────────────
// Vykuk (dedoles.cz DNA): produktový pás „Nejoblíbenější položky" / „Letní
// kolekce" / „Letní výprodej" / „Novinky" — jedna komponenta řízená obsahem
// (heading, moreLabel/moreHref, limit, categorySlug, source:"newest",
// promoText). Hlavička: centrovaný Baloo 800 uppercase kakaový nadpis s růžovým
// vlnitým podtrhem, „Zobrazit vše" podtržené vpravo. Rail: scroll-snap karusel
// (4 karty na desktopu) se šipkami v bílých kruzích mizícími na krajích.
// Karta Dedoles 1:1 povýšená: bílá radius 18, hover lift + růžový rám; čtvercové
// foto (hover zoom) s chipy (kakaová Novinka, limetková Léto), srdíčko wishlist
// (lokální toggle), růžový kruhový quick-add „+" → zelený check; červený promo
// řádek „S kódem VYKUK · 2 + 1 zdarma"; název 2 řádky; cena (sleva červeně)
// + přeškrtnutá compare + červený −N % pill vpravo. Vyprodáno = overlay.
// ──────────────────────────────────────────────────────────────────────────────
function Eshop20ProductsSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const HEAD = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";
  const SANS = "'Figtree', 'Segoe UI', system-ui, sans-serif";
  const COCOA = "#4b2413";
  const PINK = "#f6a7d7";
  const PINK_DEEP = "#e0559f";
  const LIME = "#d6e84a";
  const CREAM = "#fdf8f0";
  const INK = "#3c2010";
  const MUTED = "#8a7160";
  const LINE = "#efe4d5";
  const GREEN = "#2f9e44";
  const RED = "#e03131";

  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [loved, setLoved] = useState<Record<string, boolean>>({});
  const railRef = useRef<HTMLDivElement | null>(null);
  const [edge, setEdge] = useState<{ l: boolean; r: boolean }>({ l: true, r: false });

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const products = (data.products ?? []).slice(0, Math.max(4, Number(content.limit) || 8));
  const currency = data.currency ?? "CZK";
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");
  const heading = String(content.heading ?? "Nejoblíbenější položky");
  const moreLabel = String(content.moreLabel ?? "");
  const moreHrefRaw = String(content.moreHref ?? "/obchod");
  const moreResolved = isAdmin ? "#" : (tenantSlug ? `/demo/${tenantSlug}${moreHrefRaw.startsWith("/obchod") ? moreHrefRaw : "/obchod"}` : moreHrefRaw);
  const promoText = String(content.promoText ?? "");
  const newLabel = String(content.newLabel ?? "Novinka");
  const summerLabel = String(content.summerLabel ?? "Léto");
  const soldOutLabel = String(content.soldOutLabel ?? "Vyprodáno");

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);

  const updateEdges = () => {
    const el = railRef.current;
    if (!el) return;
    setEdge({ l: el.scrollLeft < 8, r: el.scrollLeft > el.scrollWidth - el.clientWidth - 8 });
  };
  useEffect(() => { updateEdges(); }, [products.length]);
  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  const quickAdd = (e: React.MouseEvent, p: CommerceProductCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tenantSlug || !p.default_variant_id || adding) return;
    setAdding(p.slug);
    fetch(`/api/demo/${tenantSlug}/shop/cart/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant_id: p.default_variant_id, qty: 1 }),
    })
      .then(() => {
        window.dispatchEvent(new Event("webero-cart-item-added"));
        setAdded(p.slug);
        setTimeout(() => setAdded((cur) => (cur === p.slug ? null : cur)), 1600);
      })
      .finally(() => setAdding(null));
  };

  const toggleLove = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLoved((m) => ({ ...m, [slug]: !m[slug] }));
  };

  if (!products.length && !isAdmin) return null;

  return (
    <section data-variant={variant} style={{ fontFamily: SANS, background: CREAM, padding: "clamp(30px, 4.5vw, 58px) 0 14px" }}>
      <style>{`
        .es20p-rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 4px 22px; scrollbar-width: none; }
        .es20p-rail::-webkit-scrollbar { display: none; }
        .es20p-cell { flex: 0 0 calc(25% - 11px); min-width: 232px; scroll-snap-align: start; }
        @media (max-width: 720px) { .es20p-cell { flex-basis: 68%; min-width: 218px; } }

        .es20p-card { position: relative; display: flex; flex-direction: column; height: 100%; background: #fff; border: 1.5px solid ${LINE}; border-radius: 18px;
          overflow: hidden; text-decoration: none; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.18s; }
        .es20p-card:hover { transform: translateY(-4px); box-shadow: 0 18px 34px rgba(56,25,12,0.12); border-color: ${PINK}; }

        .es20p-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${CREAM}; }
        .es20p-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es20p-card:hover .es20p-media img { transform: scale(1.06); }

        .es20p-chip { display: inline-flex; align-items: center; font-family: ${HEAD}; font-weight: 700; font-size: 11.5px; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 4px 12px; border-radius: 999px; line-height: 1.3; }

        .es20p-love { position: absolute; right: 10px; top: 10px; width: 36px; height: 36px; border: none; border-radius: 999px; background: rgba(255,255,255,0.92);
          color: ${COCOA}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: transform 0.15s, background 0.15s; }
        .es20p-love:hover { transform: scale(1.1); background: #fff; }

        .es20p-add { position: absolute; right: 10px; bottom: 10px; width: 42px; height: 42px; border: none; border-radius: 999px; background: ${PINK};
          color: ${COCOA}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(56,25,12,0.18); transition: background 0.15s, transform 0.15s; }
        .es20p-add:hover { background: ${PINK_DEEP}; color: #fff; transform: translateY(-2px) scale(1.05); }
        .es20p-add:disabled { cursor: default; opacity: 0.8; }
        .es20p-add.es20p-ok { background: ${GREEN}; color: #fff; }

        .es20p-title { font-size: 14px; font-weight: 600; color: ${INK}; line-height: 1.4;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: 2.8em; }

        .es20p-more { display: inline-flex; align-items: center; gap: 6px; color: ${INK}; font-size: 13.5px; font-weight: 700; text-decoration: none;
          border-bottom: 2px solid ${PINK}; padding-bottom: 2px; transition: opacity 0.15s, gap 0.16s; }
        .es20p-more:hover { opacity: 0.65; gap: 9px; }

        .es20p-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 46px; height: 46px; border-radius: 999px; border: 1.5px solid ${LINE};
          background: #fff; color: ${COCOA}; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(56,25,12,0.13); transition: background 0.15s, opacity 0.2s; }
        .es20p-arrow:hover { background: ${PINK}; }
        .es20p-arrow[data-hidden="true"] { opacity: 0; pointer-events: none; }
      `}</style>

      <div className="px-4 md:px-7" style={{ maxWidth: 1420, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "relative", textAlign: "center", margin: "0 0 18px" }}>
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" style={{
            display: "inline-block", position: "relative", fontFamily: HEAD, fontWeight: 800, fontSize: "clamp(21px, 2.2vw, 30px)",
            letterSpacing: "0.03em", textTransform: "uppercase", color: COCOA, margin: 0, paddingBottom: 10,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='5' viewBox='0 0 20 5'%3E%3Cpath d='M0 3.5c2.5 0 2.5-2.5 5-2.5s2.5 2.5 5 2.5 2.5-2.5 5-2.5 2.5 2.5 5 2.5' fill='none' stroke='%23f6a7d7' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat-x", backgroundPosition: "center bottom",
          }} />
          {moreLabel && (
            <a href={moreResolved} className="es20p-more hidden sm:inline-flex" style={{ position: "absolute", right: 0, bottom: 6 }}>
              {moreLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          )}
        </div>

        {!products.length ? (
          <div style={{ padding: "34px 0", color: MUTED, fontSize: 14.5, textAlign: "center" }}>
            Zatím žádné produkty k zobrazení — přidejte je v administraci obchodu (Obchod → Produkty).
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <button className="es20p-arrow hidden md:inline-flex" style={{ left: -10 }} data-hidden={edge.l} onClick={() => scrollBy(-1)} aria-label="Posunout doleva">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7"/></svg>
            </button>
            <button className="es20p-arrow hidden md:inline-flex" style={{ right: -10 }} data-hidden={edge.r} onClick={() => scrollBy(1)} aria-label="Posunout doprava">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7"/></svg>
            </button>

            <div className="es20p-rail" ref={railRef} onScroll={updateEdges}>
              {products.map((p) => {
                const sale = p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_min_cents;
                const salePct = sale ? Math.round((1 - p.price_min_cents / (p.compare_at_price_cents as number)) * 100) : 0;
                const isNew = p.flags?.new === true;
                const isSummer = (p.flags as Record<string, unknown> | null)?.summer === true;
                const href = isAdmin ? "#" : `${storeBase}/${p.slug}`;
                const isAdded = added === p.slug;
                const isLoved = !!loved[p.slug];
                const soldOut = p.stock_total <= 0;
                return (
                  <div key={p.id} className="es20p-cell">
                    <a className="es20p-card" href={href}>
                      <span className="es20p-media">
                        {p.image_url && <img src={p.image_url} alt={p.image_alt ?? p.title} loading="lazy" />}
                        <span style={{ position: "absolute", left: 10, top: 10, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                          {isNew && <span className="es20p-chip" style={{ background: COCOA, color: "#fff" }}>{newLabel}</span>}
                          {isSummer && <span className="es20p-chip" style={{ background: LIME, color: COCOA }}>{summerLabel}</span>}
                        </span>
                        <button className="es20p-love" onClick={(e) => toggleLove(e, p.slug)} aria-label={isLoved ? "Odebrat z oblíbených" : "Přidat do oblíbených"} aria-pressed={isLoved}>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill={isLoved ? PINK_DEEP : "none"} stroke={isLoved ? PINK_DEEP : "currentColor"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.1 4.6 4.6 0 0 1 8 3.1c0 6.1-8 11-8 11Z"/></svg>
                        </button>
                        {soldOut ? (
                          <span style={{ position: "absolute", inset: 0, background: "rgba(253,248,240,0.72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span className="es20p-chip" style={{ background: "#fff", color: MUTED, border: `1.5px solid ${LINE}` }}>{soldOutLabel}</span>
                          </span>
                        ) : p.default_variant_id != null && (
                          <button
                            className={`es20p-add${isAdded ? " es20p-ok" : ""}`}
                            onClick={(e) => quickAdd(e, p)}
                            disabled={adding === p.slug || isAdded}
                            aria-label={`Přidat ${p.title} do košíku`}
                          >
                            {isAdded ? (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
                            ) : (
                              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            )}
                          </button>
                        )}
                      </span>

                      <span style={{ display: "flex", flexDirection: "column", flex: 1, padding: "0 14px 14px" }}>
                        {promoText && (
                          <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: RED, padding: "9px 0", borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{promoText}</span>
                        )}
                        <span className="es20p-title" style={{ marginTop: 10 }}>{p.title}</span>
                        {p.subtitle && <span style={{ marginTop: 3, fontSize: 12, color: MUTED, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.subtitle}</span>}
                        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 10 }}>
                          <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 17.5, color: sale ? RED : COCOA, whiteSpace: "nowrap" }}>{fmt(p.price_min_cents)}</span>
                          {sale && <s style={{ color: MUTED, fontSize: 12.5, fontWeight: 500 }}>{fmt(p.compare_at_price_cents as number)}</s>}
                          {sale && salePct > 0 && (
                            <span style={{ marginLeft: "auto", background: RED, color: "#fff", fontFamily: HEAD, fontWeight: 700, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>−{salePct} %</span>
                          )}
                        </span>
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
