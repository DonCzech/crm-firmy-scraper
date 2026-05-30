"use client";
import type { CSSProperties, ElementType } from "react";
import { PageBlock } from "@/lib/content-types";
import { useContent } from "@/context/ContentContext";
import EditableImg from "@/components/admin/EditableImg";
import EditableText from "@/components/admin/EditableText";
import { OptimizedPicture } from "@/components/OptimizedPicture";
import { cssImageUrl } from "@/lib/image-formats";

const ALIGN = { left: "left", center: "center", right: "right" } as const;
type HeadingTag = "h1" | "h2" | "h3" | "h4";

type EditableBlockContext = {
  pageIndex: number;
  blockIndex: number;
} | null;

function fieldPath(ctx: EditableBlockContext, field: string) {
  return ctx ? `${ctx.pageIndex}.blocks.${ctx.blockIndex}.${field}` : "";
}

function cardFieldPath(ctx: EditableBlockContext, cardIndex: number, field: string) {
  return ctx ? `${ctx.pageIndex}.blocks.${ctx.blockIndex}.cards.${cardIndex}.${field}` : "";
}

function editableText(ctx: EditableBlockContext, field: string, value: string, tag: string, style: CSSProperties, richText = false, className?: string) {
  if (!ctx) {
    const Tag = tag as ElementType;
    return richText
      ? <Tag style={style} className={className} dangerouslySetInnerHTML={{ __html: value }} />
      : <Tag style={style} className={className}>{value}</Tag>;
  }

  return (
    <EditableText
      section="pages"
      field={fieldPath(ctx, field)}
      tag={tag}
      style={style}
      className={className}
      richText={richText}
    />
  );
}

function HeadingBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const Tag = (b.level || "h2") as HeadingTag;
  return (
    <div style={{ padding: "16px 0" }}>
      {editableText(ctx, "content", b.content || "Nadpis", Tag, {
        textAlign: ALIGN[b.align || "left"],
        color: b.color || "#1f1f1f",
        fontSize: b.fontSize ? b.fontSize + "px" : undefined,
        fontFamily: "'Poppins', sans-serif",
        margin: 0,
      })}
    </div>
  );
}

function TextBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  return (
    <div className="page-text-block" style={{ padding: "8px 0", textAlign: ALIGN[b.align || "left"] }}>
      {editableText(ctx, "content", b.content || "", "div", { fontFamily: "'Poppins', sans-serif", fontSize: 16, lineHeight: 1.7, color: "#374151" }, true, "page-text-content")}
    </div>
  );
}

function ImageBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const imageStyle = { width: b.width || "100%", height: "auto", display: "block", borderRadius: 8 };
  const img = ctx ? (
    <EditableImg section="pages" field={fieldPath(ctx, "src")} alt={b.alt || ""} style={imageStyle} />
  ) : (
    <OptimizedPicture src={b.src || ""} alt={b.alt || ""} style={imageStyle} />
  );
  return (
    <div style={{ padding: "12px 0", textAlign: ALIGN[b.align || "center"] }}>
      {b.href ? <a href={b.href}>{img}</a> : img}
    </div>
  );
}

function ButtonBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const padding = b.size === "sm" ? "8px 20px" : b.size === "lg" ? "16px 48px" : "12px 32px";
  const fontSize = b.size === "sm" ? 13 : b.size === "lg" ? 17 : 15;
  return (
    <div style={{ padding: "12px 0", textAlign: ALIGN[b.align || "center"] }}>
      <a
        href={b.href || "#"}
        className="page-button"
        style={{
          display: "inline-block",
          padding,
          fontSize,
          fontWeight: 700,
          fontFamily: "'Poppins', sans-serif",
          background: b.bgColor || "#7c3bb2",
          color: b.textColor || "#fff",
          borderRadius: 8,
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
      >
        {editableText(ctx, "content", b.content || "Button", "span", {}, false)}
      </a>
    </div>
  );
}

function BannerBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  return (
    <div className="page-banner-block" style={{
      padding: "64px 32px",
      background: b.bgImage ? undefined : (b.bgColor || "linear-gradient(135deg,#7c3bb2,#5f2a8d)"),
      backgroundImage: b.bgImage ? `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), ${cssImageUrl(b.bgImage)}` : undefined,
      backgroundPosition: b.bgImage ? "center" : undefined,
      backgroundSize: b.bgImage ? "cover" : undefined,
      textAlign: ALIGN[b.align || "center"],
      borderRadius: 12,
    }}>
      {editableText(ctx, "content", b.content || "Banner nadpis", "h2", { color: "#fff", fontSize: 32, fontWeight: 700, fontFamily: "'Poppins',sans-serif", margin: "0 0 12px" }, false, "page-banner-title")}
      {b.subtitle && editableText(ctx, "subtitle", b.subtitle, "p", { color: "rgba(255,255,255,0.85)", fontSize: 16, fontFamily: "'Poppins',sans-serif", margin: "0 0 24px" }, false, "page-banner-subtitle")}
      {b.ctaText && (
        <a href={b.ctaHref || "#"} className="page-button page-banner-button" style={{
          display: "inline-block", padding: "12px 32px", background: "#fff", color: b.bgColor || "#7c3bb2",
          fontWeight: 700, borderRadius: 8, textDecoration: "none", fontFamily: "'Poppins',sans-serif", fontSize: 15,
        }}>
          {editableText(ctx, "ctaText", b.ctaText, "span", {})}
        </a>
      )}
    </div>
  );
}

function NewsletterBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  return (
    <div className="page-newsletter-block" style={{ padding: "40px 32px", background: "#f9f7f7", borderRadius: 12, textAlign: ALIGN[b.align || "center"] }}>
      {editableText(ctx, "content", b.content || "Newsletter", "h3", { fontFamily: "'Poppins',sans-serif", fontSize: 24, fontWeight: 700, color: "#1f1f1f", margin: "0 0 12px" })}
      {b.body && editableText(ctx, "body", b.body, "p", { fontFamily: "'Poppins',sans-serif", fontSize: 15, color: "#6b7280", margin: "0 0 20px" })}
      <div className="page-newsletter-form" style={{ display: "flex", gap: 8, justifyContent: "center", maxWidth: 400, margin: "0 auto" }}>
        <input type="email" placeholder="Váš e-mail" style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontFamily: "'Poppins',sans-serif" }} />
        <button style={{ padding: "10px 20px", background: "#7c3bb2", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
          Odebírat
        </button>
      </div>
    </div>
  );
}

function HeroSectionBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  return (
    <div className="page-hero-block" style={{
      position: "relative",
      minHeight: 480,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: b.heroBgImage ? undefined : (b.bgColor || "linear-gradient(135deg,#1a0a2e,#2d1654)"),
      backgroundImage: b.heroBgImage ? `${b.heroOverlay || "linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45))"}, ${cssImageUrl(b.heroBgImage)}` : undefined,
      backgroundPosition: b.heroBgImage ? "center" : undefined,
      backgroundSize: b.heroBgImage ? "cover" : undefined,
      backgroundRepeat: b.heroBgImage ? "no-repeat" : undefined,
      borderRadius: 12,
      overflow: "hidden",
      textAlign: ALIGN[b.align || "center"],
      padding: "60px 40px",
    }}>
      <div className="page-hero-content" style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
        {editableText(ctx, "content", b.content || "Hero Nadpis", "h1", { color: "#fff", fontSize: 48, fontWeight: 800, fontFamily: "'Poppins',sans-serif", margin: "0 0 16px", lineHeight: 1.15 }, false, "page-hero-title")}
        {b.subtitle && editableText(ctx, "subtitle", b.subtitle, "p", { color: "rgba(255,255,255,0.85)", fontSize: 20, fontFamily: "'Poppins',sans-serif", margin: "0 0 32px", lineHeight: 1.6 }, false, "page-hero-subtitle")}
        {b.ctaText && (
          <a href={b.ctaHref || "#"} className="page-button page-hero-button" style={{
            display: "inline-block", padding: "14px 40px", background: b.bgColor || "#7c3bb2",
            color: "#fff", fontWeight: 700, borderRadius: 8, textDecoration: "none",
            fontFamily: "'Poppins',sans-serif", fontSize: 16,
          }}>
            {editableText(ctx, "ctaText", b.ctaText, "span", {})}
          </a>
        )}
      </div>
    </div>
  );
}

function CardsGridBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const cards = b.cards || [];
  return (
    <div className="page-cards-block" style={{ padding: "48px 0" }}>
      {b.sectionTitle && (
        editableText(ctx, "sectionTitle", b.sectionTitle, "h2", { textAlign: "center", fontFamily: "'Poppins',sans-serif", fontSize: 32, fontWeight: 700, color: "#1f1f1f", marginBottom: 36, marginTop: 0 }, false, "page-cards-title")
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: cards.length === 1 ? "1fr" : cards.length === 2 ? "repeat(2,1fr)" : "repeat(3,1fr)",
        gap: 24,
      }} className="cards-grid-block">
        {cards.map((card, i) => (
          <div key={i} className="page-card" style={{ background: "#fff", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            {card.image && (
              ctx ? (
                <EditableImg section="pages" field={cardFieldPath(ctx, i, "image")} alt={card.title} className="page-card-image" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              ) : (
                <OptimizedPicture src={card.image} alt={card.title} className="page-card-image" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              )
            )}
            <div className="page-card-body" style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
              {ctx ? (
                <EditableText section="pages" field={cardFieldPath(ctx, i, "title")} tag="h3" style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: "#1f1f1f", margin: "0 0 12px" }} />
              ) : (
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: "#1f1f1f", margin: "0 0 12px" }}>{card.title}</h3>
              )}
              {ctx ? (
                <EditableText section="pages" field={cardFieldPath(ctx, i, "text")} tag="p" style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: "#6b7280", lineHeight: 1.6, flex: 1, margin: "0 0 20px" }} />
              ) : (
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: "#6b7280", lineHeight: 1.6, flex: 1, margin: "0 0 20px" }}>{card.text}</p>
              )}
              {card.btnText && (
                <a href={card.btnHref || "#"} className="btn-primary page-button page-card-button" style={{ display: "inline-block", padding: "10px 24px", fontSize: 13, textDecoration: "none" }}>
                  {ctx ? <EditableText section="pages" field={cardFieldPath(ctx, i, "btnText")} tag="span" /> : card.btnText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoColBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const imgCol = (
    <div className="page-two-col-image" style={{ flex: 1, minWidth: 0 }}>
      {b.twoColImage && (
        ctx ? (
          <EditableImg section="pages" field={fieldPath(ctx, "twoColImage")} alt={b.twoColTitle || ""} style={{ width: "100%", height: "auto", borderRadius: 12, display: "block" }} />
        ) : (
          <OptimizedPicture src={b.twoColImage} alt={b.twoColTitle || ""} style={{ width: "100%", height: "auto", borderRadius: 12, display: "block" }} />
        )
      )}
    </div>
  );
  const textCol = (
    <div className="page-two-col-text" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {b.twoColTitle && editableText(ctx, "twoColTitle", b.twoColTitle, "h2", { fontFamily: "'Poppins',sans-serif", fontSize: 32, fontWeight: 700, color: "#1f1f1f", margin: "0 0 16px" }, false, "page-two-col-title")}
      {b.twoColText && editableText(ctx, "twoColText", b.twoColText, "div", { fontFamily: "'Poppins',sans-serif", fontSize: 16, lineHeight: 1.8, color: "#374151", margin: "0 0 24px" }, true, "page-two-col-content")}
      {b.twoColBtnText && (
        <a href={b.twoColBtnHref || "#"} className="btn-primary page-button page-two-col-button" style={{ display: "inline-block", padding: "12px 32px", fontSize: 15, textDecoration: "none", alignSelf: "flex-start" }}>
          {editableText(ctx, "twoColBtnText", b.twoColBtnText, "span", {})}
        </a>
      )}
    </div>
  );
  return (
    <div className="page-two-col-block" style={{ display: "flex", gap: 48, alignItems: "center", padding: "40px 0", flexWrap: "wrap" }}>
      {b.imageLeft !== false ? imgCol : textCol}
      {b.imageLeft !== false ? textCol : imgCol}
    </div>
  );
}

export default function BlockRenderer({ blocks, pageSlug }: { blocks: PageBlock[]; pageSlug?: string }) {
  const { content } = useContent();
  const pageIndex = pageSlug ? (content.pages || []).findIndex(p => p.slug === pageSlug) : -1;
  if (!blocks || blocks.length === 0) {
    return <div style={{ padding: "60px 32px", textAlign: "center", color: "#9ca3af", fontFamily: "'Poppins',sans-serif" }}>Tato stránka nemá žádný obsah. Přidej bloky v editoru (✏️).</div>;
  }
  return (
    <>
      {blocks.map((b, blockIndex) => {
        const ctx = pageIndex >= 0 ? { pageIndex, blockIndex } : null;
        return (
        <div key={b.id} className={`container-main page-block-container page-block-${b.type}`} style={{ paddingTop: 8, paddingBottom: 8 }}>
          {b.type === "heading" && <HeadingBlock b={b} ctx={ctx} />}
          {b.type === "text" && <TextBlock b={b} ctx={ctx} />}
          {b.type === "image" && <ImageBlock b={b} ctx={ctx} />}
          {b.type === "button" && <ButtonBlock b={b} ctx={ctx} />}
          {b.type === "banner" && <BannerBlock b={b} ctx={ctx} />}
          {b.type === "newsletter" && <NewsletterBlock b={b} ctx={ctx} />}
          {b.type === "spacer" && <div style={{ height: b.height || 40 }} />}
          {b.type === "hero-section" && <HeroSectionBlock b={b} ctx={ctx} />}
          {b.type === "cards-grid" && <CardsGridBlock b={b} ctx={ctx} />}
          {b.type === "two-col" && <TwoColBlock b={b} ctx={ctx} />}
        </div>
        );
      })}
      <style>{`
        .page-block-container {
          box-sizing: border-box;
        }
        .page-text-content h1,
        .page-text-content h2,
        .page-text-content h3,
        .page-two-col-content h1,
        .page-two-col-content h2,
        .page-two-col-content h3 {
          margin: 0 0 14px;
        }
        .page-text-content p,
        .page-two-col-content p {
          margin: 0 0 14px;
        }
        .page-text-content ul,
        .page-two-col-content ul {
          margin: 0 0 18px;
          padding-left: 22px;
        }
        .page-text-content li,
        .page-two-col-content li {
          margin-bottom: 7px;
        }
        .page-button {
          max-width: 100%;
          text-align: center;
          box-sizing: border-box;
          white-space: normal;
          overflow-wrap: anywhere;
        }
        .page-two-col-image img,
        .page-two-col-image > div,
        .page-card-image,
        .page-card-image img {
          max-width: 100%;
        }
        @media (max-width: 900px) {
          .page-hero-block {
            min-height: 360px !important;
            padding: 46px 28px !important;
          }
          .page-hero-title {
            font-size: 38px !important;
            line-height: 1.14 !important;
          }
          .page-hero-subtitle {
            font-size: 18px !important;
            line-height: 1.55 !important;
            margin-bottom: 26px !important;
          }
          .page-two-col-block {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 28px !important;
            padding: 30px 0 !important;
          }
          .page-two-col-image,
          .page-two-col-text {
            width: 100% !important;
            flex: 0 0 auto !important;
          }
          .page-two-col-image img,
          .page-two-col-image > div {
            width: 100% !important;
          }
          .cards-grid-block {
            grid-template-columns: 1fr 1fr !important;
          }
          .page-cards-title,
          .page-two-col-title {
            font-size: 28px !important;
            line-height: 1.2 !important;
          }
        }
        @media (max-width: 640px) {
          .page-block-container {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .page-hero-block {
            min-height: auto !important;
            padding: 40px 20px !important;
            border-radius: 10px !important;
          }
          .page-hero-title {
            font-size: 30px !important;
            line-height: 1.12 !important;
            margin-bottom: 12px !important;
          }
          .page-hero-subtitle {
            font-size: 16px !important;
            line-height: 1.55 !important;
            margin-bottom: 22px !important;
          }
          .page-hero-button,
          .page-banner-button,
          .page-card-button,
          .page-two-col-button {
            width: 100% !important;
            padding: 12px 18px !important;
            align-self: stretch !important;
          }
          .page-banner-block,
          .page-newsletter-block {
            padding: 34px 20px !important;
            border-radius: 10px !important;
          }
          .page-banner-title {
            font-size: 25px !important;
            line-height: 1.2 !important;
          }
          .page-newsletter-form {
            flex-direction: column !important;
          }
          .cards-grid-block {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
          }
          .page-cards-block {
            padding: 30px 0 !important;
          }
          .page-cards-title,
          .page-two-col-title {
            font-size: 25px !important;
            line-height: 1.22 !important;
            margin-bottom: 20px !important;
          }
          .page-card-body {
            padding: 18px 20px !important;
          }
          .page-card-image,
          .page-card-image img {
            height: 190px !important;
          }
          .page-two-col-content,
          .page-text-content {
            font-size: 15px !important;
            line-height: 1.68 !important;
          }
          .page-text-content h2,
          .page-two-col-content h2 {
            font-size: 23px !important;
            line-height: 1.25 !important;
          }
        }
      `}</style>
    </>
  );
}
