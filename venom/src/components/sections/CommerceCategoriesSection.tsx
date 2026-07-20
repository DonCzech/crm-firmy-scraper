"use client";

/**
 * Webero Commerce — `category-grid` sekce.
 * Kategorie z commerce tabulek (content.__commerce), velké obrazové dlaždice
 * s overlay názvem. Texty editovatelné, data read-only z DB.
 */

import Link from "next/link";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import type { CommerceCategoryCard, CommerceSectionData } from "@/lib/commerce/section-data";

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

function CategoryTile({ category, storeBase, isAdmin }: {
  category: CommerceCategoryCard;
  storeBase: string;
  isAdmin: boolean;
}) {
  const href = isAdmin ? "#" : `${storeBase}?kategorie=${category.slug}`;
  return (
    <Link href={href} className="wcc-tile group">
      <div className="wcc-tile-media">
        {category.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.image_url} alt={category.name} loading="lazy" />
        ) : (
          <div className="wcc-tile-fallback" aria-hidden />
        )}
        <div className="wcc-tile-overlay" />
        <div className="wcc-tile-label">
          <span className="wcc-tile-name">{category.name}</span>
          <span className="wcc-tile-count">{category.product_count} produktů</span>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
 * eshop-02 "Modrý Košík" — Shoptet Classic DNA
 * Světlé karty s fotkou, modrý hover ring, počet produktů.
 * ============================================================ */

function Eshop02CategoryTile({ category, storeBase, isAdmin }: {
  category: CommerceCategoryCard;
  storeBase: string;
  isAdmin: boolean;
}) {
  const href = isAdmin ? "#" : `${storeBase}?kategorie=${category.slug}`;
  return (
    <Link href={href} className="wc2c-tile">
      <div className="wc2c-media">
        {category.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={category.image_url} alt={category.name} loading="lazy" />
        ) : (
          <div className="wc2c-fallback" aria-hidden />
        )}
      </div>
      <div className="wc2c-body">
        <span className="wc2c-name">{category.name}</span>
        <span className="wc2c-count">{category.product_count} produktů</span>
        <span className="wc2c-arrow" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </div>
    </Link>
  );
}

function Eshop02CategoriesSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const BLUE = "#1266cc";
  const BLUE_DARK = "#0e51a3";
  const DARK = "#142b45";
  const MUTED = "#64748b";
  const BORDER = "#e3e9f0";
  const SURFACE = "#f5f8fb";
  const SANS = "'Open Sans', 'Segoe UI', Arial, sans-serif";

  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const categories = (data.categories ?? []).filter((c) => c.product_count > 0 || isAdmin);
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");

  const eyebrow = content.eyebrow === undefined ? "Kompletní sortiment" : String(content.eyebrow);
  const heading = content.heading === undefined ? "Nakupujte podle kategorií" : String(content.heading);
  const ctaLabel = content.ctaLabel === undefined ? "Celý sortiment" : String(content.ctaLabel);
  const rawCtaHref = typeof content.ctaHref === "string" && content.ctaHref.trim() !== "" ? content.ctaHref : "/obchod";
  const siteBase = storeBase.replace(/\/obchod$/, "");
  const ctaHref = isAdmin ? "#" : (rawCtaHref.startsWith("http") ? rawCtaHref : `${siteBase}${rawCtaHref}`);

  if (!categories.length && !isAdmin) return null;

  return (
    <section className="wc2c" data-variant={variant} id={typeof content.anchorId === "string" ? content.anchorId : undefined}>
      <style>{`
        .wc2c { background: ${SURFACE}; color: ${DARK}; font-family: ${SANS}; }
        .wc2c-inner { max-width: 1280px; margin: 0 auto; padding: clamp(48px,6vw,84px) 24px; }
        .wc2c-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: clamp(24px,3.5vw,38px); }
        .wc2c-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${BLUE}; margin: 0 0 8px; }
        .wc2c-title { font-size: clamp(24px,3vw,36px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin: 0; color: ${DARK}; }
        .wc2c-cta { flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 8px; border: 1.5px solid ${BLUE}; color: ${BLUE}; font-size: 14px; font-weight: 700; text-decoration: none; transition: background .2s, color .2s; }
        .wc2c-cta:hover { background: ${BLUE}; color: #fff; }
        .wc2c-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(12px,1.6vw,20px); }
        @media (max-width: 1024px) { .wc2c-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px)  { .wc2c-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 460px)  { .wc2c-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px)  { .wc2c-head { flex-direction: column; align-items: flex-start; gap: 14px; } }
        .wc2c-tile { display: flex; flex-direction: column; text-decoration: none; color: inherit; background: #fff; border: 1px solid ${BORDER}; border-radius: 12px; overflow: hidden; transition: border-color .2s, box-shadow .25s, transform .25s; }
        .wc2c-tile:hover { border-color: ${BLUE}; box-shadow: 0 10px 28px rgba(18,102,204,0.14); transform: translateY(-3px); }
        .wc2c-media { aspect-ratio: 4/3; overflow: hidden; background: ${SURFACE}; }
        .wc2c-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s cubic-bezier(.2,.6,.2,1); }
        .wc2c-tile:hover .wc2c-media img { transform: scale(1.06); }
        .wc2c-fallback { width: 100%; height: 100%; background: linear-gradient(160deg, ${SURFACE}, #e3ecf5); }
        .wc2c-body { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 14px 48px 14px 16px; }
        .wc2c-name { font-size: 16px; font-weight: 700; color: ${DARK}; transition: color .2s; }
        .wc2c-tile:hover .wc2c-name { color: ${BLUE_DARK}; }
        .wc2c-count { font-size: 12.5px; color: ${MUTED}; }
        .wc2c-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; border-radius: 999px; display: grid; place-items: center; background: ${SURFACE}; color: ${BLUE}; transition: background .2s, color .2s, transform .25s; }
        .wc2c-tile:hover .wc2c-arrow { background: ${BLUE}; color: #fff; transform: translateY(-50%) translateX(2px); }
        .wc2c-empty { border: 1px dashed ${BORDER}; border-radius: 12px; padding: 48px 24px; text-align: center; color: ${MUTED}; font-size: 14px; background: #fff; }
      `}</style>
      <div className="wc2c-inner">
        <div className="wc2c-head">
          <div>
            {eyebrow.trim() !== "" && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="wc2c-eyebrow" />
            )}
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc2c-title" />
          </div>
          {ctaLabel.trim() !== "" && (
            <Link href={ctaHref} className="wc2c-cta">
              <GenericEditableText sectionId={sectionId} field="ctaLabel" value={ctaLabel} tag="span" />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          )}
        </div>
        {categories.length === 0 ? (
          <div className="wc2c-empty">Zatím žádné kategorie — vytvořte je v administraci obchodu.</div>
        ) : (
          <div className="wc2c-grid">
            {categories.map((c) => (
              <Eshop02CategoryTile key={c.id} category={c} storeBase={storeBase} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CommerceCategoriesSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  if (variant === "eshop-02-categories") {
    return <Eshop02CategoriesSection content={content} variant={variant} isAdmin={isAdmin} tenantSlug={tenantSlug} sectionId={sectionId} />;
  }
  const data = (content.__commerce ?? {}) as Partial<CommerceSectionData>;
  const categories = (data.categories ?? []).filter((c) => c.product_count > 0 || isAdmin);
  const storeBase = data.storeBase ?? (tenantSlug ? `/demo/${tenantSlug}/obchod` : "/obchod");

  const eyebrow = content.eyebrow === undefined ? "Kategorie" : String(content.eyebrow);
  const heading = content.heading === undefined ? "Nakupujte podle kategorií" : String(content.heading);

  if (!categories.length && !isAdmin) return null;

  return (
    <section className="wcc" data-variant={variant} id={typeof content.anchorId === "string" ? content.anchorId : undefined}>
      <style>{`
        .wcc { background: #fafaf8; color: #101010; font-family: inherit; }
        .wcc-inner { max-width: 1280px; margin: 0 auto; padding: clamp(56px,7vw,104px) 24px; }
        .wcc-head { text-align: left; margin-bottom: clamp(28px,4vw,44px); }
        .wcc-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #9a9a9a; margin: 0 0 10px; }
        .wcc-title { font-size: clamp(26px,3.4vw,44px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.05; margin: 0; }
        .wcc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(12px,1.8vw,22px); }
        @media (max-width: 1024px) { .wcc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px)  { .wcc-grid { grid-template-columns: 1fr; } }
        .wcc-tile { display: block; text-decoration: none; color: inherit; }
        .wcc-tile-media { position: relative; aspect-ratio: 4/5; border-radius: 12px; overflow: hidden; background: #e8e8e4; }
        .wcc-tile-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .55s cubic-bezier(.2,.6,.2,1); }
        .wcc-tile:hover .wcc-tile-media img { transform: scale(1.05); }
        .wcc-tile-fallback { width: 100%; height: 100%; background: linear-gradient(160deg, #ececea, #dcdcd6); }
        .wcc-tile-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,10,0.55), rgba(10,10,10,0.06) 55%); transition: background .3s; }
        .wcc-tile:hover .wcc-tile-overlay { background: linear-gradient(to top, rgba(10,10,10,0.68), rgba(10,10,10,0.12) 60%); }
        .wcc-tile-label { position: absolute; left: 18px; right: 18px; bottom: 16px; display: flex; flex-direction: column; gap: 2px; }
        .wcc-tile-name { color: #fff; font-size: 19px; font-weight: 700; letter-spacing: -0.015em; }
        .wcc-tile-count { color: rgba(255,255,255,0.72); font-size: 12px; font-weight: 500; }
        .wcc-empty { border: 1px dashed #d8d8d4; border-radius: 12px; padding: 48px 24px; text-align: center; color: #9a9a9a; font-size: 14px; }
      `}</style>
      <div className="wcc-inner">
        <div className="wcc-head">
          {eyebrow.trim() !== "" && (
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="wcc-eyebrow" />
          )}
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wcc-title" />
        </div>
        {categories.length === 0 ? (
          <div className="wcc-empty">Zatím žádné kategorie — vytvořte je v administraci obchodu.</div>
        ) : (
          <div className="wcc-grid">
            {categories.map((c) => (
              <CategoryTile key={c.id} category={c} storeBase={storeBase} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
