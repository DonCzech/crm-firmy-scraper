"use client";
import { useMemo, type CSSProperties, type ElementType } from "react";
import { PageBlock } from "@/astera/lib/content-types";
import { useContent } from "@/astera/context/ContentContext";
import { localizeHref, localizeHtmlHrefs, Lang } from "@/astera/lib/i18n";
import { createQrMatrix, createQrPath } from "@/astera/lib/qr-code";
import EditableImg from "@/astera/components/admin/EditableImg";
import EditableText from "@/astera/components/admin/EditableText";
import OptimizedImage, { optimizedImageSet } from "@/astera/components/OptimizedImage";
import FaqAccordionBlock from "@/astera/components/FaqAccordionBlock";
import ContactFormBlock from "@/astera/components/ContactFormBlock";

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

function editableText(ctx: EditableBlockContext, field: string, value: string, tag: string, style: CSSProperties, richText = false, className?: string, lang?: Lang) {
  if (!ctx) {
    const Tag = tag as ElementType;
    return richText
      ? <Tag style={style} className={className} dangerouslySetInnerHTML={{ __html: lang ? localizeHtmlHrefs(value, lang) : value }} />
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
  const { currentLang } = useContent();
  return (
    <div className="page-text-block" style={{ padding: "8px 0", textAlign: ALIGN[b.align || "left"] }}>
      {editableText(ctx, "content", b.content || "", "div", { fontFamily: "'Poppins', sans-serif", fontSize: 16, lineHeight: 1.7, color: "#374151" }, true, "page-text-content", currentLang)}
    </div>
  );
}

function ImageBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const { currentLang } = useContent();
  const imageStyle = { width: b.width || "100%", height: "auto", display: "block", borderRadius: 8 };
  const sizes = b.width && b.width !== "100%" ? String(b.width) : "(max-width: 768px) calc(100vw - 32px), 920px";
  const img = ctx ? (
    <EditableImg section="pages" field={fieldPath(ctx, "src")} mobileField={fieldPath(ctx, "mobileSrc")} alt={b.alt || ""} sizes={sizes} style={imageStyle} />
  ) : (
    <OptimizedImage src={b.src} mobileSrc={b.mobileSrc} alt={b.alt || ""} sizes={sizes} style={imageStyle} />
  );
  return (
    <div style={{ padding: "12px 0", textAlign: ALIGN[b.align || "center"] }}>
      {b.href ? <a href={localizeHref(b.href, currentLang)}>{img}</a> : img}
    </div>
  );
}

function ButtonBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const { currentLang } = useContent();
  const padding = b.size === "sm" ? "8px 20px" : b.size === "lg" ? "16px 48px" : "12px 32px";
  const fontSize = b.size === "sm" ? 13 : b.size === "lg" ? 17 : 15;
  return (
    <div style={{ padding: "12px 0", textAlign: ALIGN[b.align || "center"] }}>
      <a
        href={localizeHref(b.href || "#", currentLang)}
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
  const { currentLang } = useContent();
  const mobileBackground = b.mobileBgImage
    ? `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), ${optimizedImageSet(b.mobileBgImage)}`
    : undefined;
  return (
    <div className="page-banner-block" data-mobile-bg={mobileBackground ? "true" : undefined} style={{
      padding: "64px 32px",
      background: b.bgImage
        ? `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), ${optimizedImageSet(b.bgImage)} center/cover`
        : (b.bgColor || "linear-gradient(135deg,#7c3bb2,#5f2a8d)"),
      textAlign: ALIGN[b.align || "center"],
      borderRadius: 12,
      "--mobile-background-image": mobileBackground,
    } as CSSProperties}>
      {editableText(ctx, "content", b.content || "Banner nadpis", "h2", { color: "#fff", fontSize: 32, fontWeight: 700, fontFamily: "'Poppins',sans-serif", margin: "0 0 12px" }, false, "page-banner-title")}
      {b.subtitle && editableText(ctx, "subtitle", b.subtitle, "p", { color: "rgba(255,255,255,0.85)", fontSize: 16, fontFamily: "'Poppins',sans-serif", margin: "0 0 24px" }, false, "page-banner-subtitle")}
      {b.ctaText && (
        <a href={localizeHref(b.ctaHref || "#", currentLang)} className="page-button page-banner-button" style={{
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
  const { currentLang } = useContent();
  const mobileBackground = b.mobileHeroBgImage
    ? `${b.heroOverlay || "linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45))"}, ${optimizedImageSet(b.mobileHeroBgImage)}`
    : undefined;
  return (
    <div className="page-hero-block" data-mobile-bg={mobileBackground ? "true" : undefined} style={{
      position: "relative",
      minHeight: 480,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: b.heroBgImage
        ? `${b.heroOverlay || "linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45))"}, ${optimizedImageSet(b.heroBgImage)} center/cover no-repeat`
        : (b.bgColor || "linear-gradient(135deg,#1a0a2e,#2d1654)"),
      borderRadius: 12,
      overflow: "hidden",
      textAlign: ALIGN[b.align || "center"],
      padding: "60px 40px",
      "--mobile-background-image": mobileBackground,
    } as CSSProperties}>
      <div className="page-hero-content" style={{ position: "relative", zIndex: 1, maxWidth: 700 }}>
        {editableText(ctx, "content", b.content || "Hero Nadpis", "h1", { color: "#fff", fontSize: 48, fontWeight: 800, fontFamily: "'Poppins',sans-serif", margin: "0 0 16px", lineHeight: 1.15 }, false, "page-hero-title")}
        {b.subtitle && editableText(ctx, "subtitle", b.subtitle, "p", { color: "rgba(255,255,255,0.85)", fontSize: 20, fontFamily: "'Poppins',sans-serif", margin: "0 0 32px", lineHeight: 1.6 }, false, "page-hero-subtitle")}
        {b.ctaText && (
          <a href={localizeHref(b.ctaHref || "#", currentLang)} className="page-button page-hero-button" style={{
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
  const { currentLang } = useContent();
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
                <EditableImg section="pages" field={cardFieldPath(ctx, i, "image")} mobileField={cardFieldPath(ctx, i, "mobileImage")} alt={card.title} sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 900px) calc((100vw - 56px) / 2), 300px" className="page-card-image" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
              ) : (
                <OptimizedImage src={card.image} mobileSrc={card.mobileImage} alt={card.title} sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 900px) calc((100vw - 56px) / 2), 300px" className="page-card-image" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
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
                <a href={localizeHref(card.btnHref || "#", currentLang)} className="btn-primary page-button page-card-button" style={{ display: "inline-block", padding: "10px 24px", fontSize: 13, textDecoration: "none" }}>
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

function TwoColBlock({ b, ctx, pageSlug }: { b: PageBlock; ctx: EditableBlockContext; pageSlug?: string }) {
  const { currentLang } = useContent();
  const topAligned = pageSlug === "o-mne";
  const needsWhiteMatte = b.twoColImage === "/images/astera-about-home.png";
  const twoColImageStyle = {
    width: "100%",
    height: "auto",
    borderRadius: 12,
    display: "block",
    backgroundColor: needsWhiteMatte ? "#ffffff" : undefined,
  };
  const imgCol = (
    <div className="page-two-col-image" style={{ flex: 1, minWidth: 0 }}>
      {b.twoColImage && (
        ctx ? (
          <EditableImg section="pages" field={fieldPath(ctx, "twoColImage")} mobileField={fieldPath(ctx, "mobileTwoColImage")} alt={b.twoColTitle || ""} sizes="(max-width: 768px) calc(100vw - 32px), 460px" style={twoColImageStyle} />
        ) : (
          <OptimizedImage src={b.twoColImage} mobileSrc={b.mobileTwoColImage} alt={b.twoColTitle || ""} sizes="(max-width: 768px) calc(100vw - 32px), 460px" style={twoColImageStyle} pictureStyle={needsWhiteMatte ? { backgroundColor: "#ffffff" } : undefined} noPlaceholder={needsWhiteMatte} />
        )
      )}
    </div>
  );
  const textCol = (
    <div className="page-two-col-text" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: topAligned ? "flex-start" : "center" }}>
      {b.twoColTitle && editableText(ctx, "twoColTitle", b.twoColTitle, "h2", { fontFamily: "'Poppins',sans-serif", fontSize: 32, fontWeight: 700, color: "#1f1f1f", margin: "0 0 16px" }, false, "page-two-col-title")}
      {b.twoColText && editableText(ctx, "twoColText", b.twoColText, "div", { fontFamily: "'Poppins',sans-serif", fontSize: 16, lineHeight: 1.8, color: "#374151", margin: "0 0 24px" }, true, "page-two-col-content", currentLang)}
      {b.twoColBtnText && (
        <a href={localizeHref(b.twoColBtnHref || "#", currentLang)} className="btn-primary page-button page-two-col-button" style={{ display: "inline-block", padding: "12px 32px", fontSize: 15, textDecoration: "none", alignSelf: "flex-start" }}>
          {editableText(ctx, "twoColBtnText", b.twoColBtnText, "span", {})}
        </a>
      )}
    </div>
  );
  return (
    <div className="page-two-col-block" style={{ display: "flex", gap: 48, alignItems: topAligned ? "flex-start" : "center", padding: "40px 0", flexWrap: "wrap" }}>
      {b.imageLeft !== false ? imgCol : textCol}
      {b.imageLeft !== false ? textCol : imgCol}
    </div>
  );
}

const DEFAULT_DONATION_QR_PAYLOAD = "SPD*1.0*ACC:CZ0000000000000000000000*CC:CZK*MSG:POMOC PRES ASTERA LIGHT";

function DonationQrBlock({ b, ctx }: { b: PageBlock; ctx: EditableBlockContext }) {
  const payload = b.qrPayload || DEFAULT_DONATION_QR_PAYLOAD;
  const qr = useMemo(() => {
    try {
      const matrix = createQrMatrix(payload);
      return { error: "", size: matrix.length, path: createQrPath(matrix) };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "QR kód se nepodařilo vytvořit.", size: 0, path: "" };
    }
  }, [payload]);

  const account = b.qrAccountNumber || "000000-0000000000";
  const bank = b.qrBankCode || "0000";

  return (
    <section className="donation-qr-block" aria-label={b.qrTitle || "QR platba pro podporu"}>
      <div className="donation-qr-copy">
        {editableText(ctx, "qrEyebrow", b.qrEyebrow || "Dobrovolná podpora", "p", {}, false, "donation-qr-eyebrow")}
        {editableText(ctx, "qrTitle", b.qrTitle || "Pomozte tam, kde je to potřeba", "h2", {}, false, "donation-qr-title")}
        {editableText(ctx, "qrText", b.qrText || "QR kód slouží pro dobrovolný příspěvek na výklad či poradenství pro člověka, který podporu právě potřebuje, ale nemůže si ji dovolit.", "p", {}, false, "donation-qr-text")}
      </div>

      <div className="donation-qr-card">
        <div className="donation-qr-code-shell">
          {qr.error ? (
            <div className="donation-qr-error">{qr.error}</div>
          ) : (
            <svg
              className="donation-qr-code"
              viewBox={`0 0 ${qr.size + 8} ${qr.size + 8}`}
              role="img"
              aria-label="QR kód pro bankovní platbu"
              shapeRendering="crispEdges"
            >
              <rect width={qr.size + 8} height={qr.size + 8} rx="2.8" fill="#fffdfa" />
              <path d={qr.path} transform="translate(4 4)" fill="#23112f" />
            </svg>
          )}
        </div>
        <div className="donation-qr-brand">
          <span>Astera Light</span>
          <strong>QR platba</strong>
        </div>
        {editableText(ctx, "qrNote", b.qrNote || "Účet je zatím náhledový. Před spuštěním ho vyměníme za reálný.", "p", {}, false, "donation-qr-note")}
      </div>

      <div className="donation-qr-details" aria-label="Platební údaje">
        <div>
          <span>{editableText(ctx, "qrAccountLabel", b.qrAccountLabel || "Náhledový účet", "span", {})}</span>
          <strong>
            {editableText(ctx, "qrAccountNumber", account, "span", {})}
            <span>/</span>
            {editableText(ctx, "qrBankCode", bank, "span", {})}
          </strong>
        </div>
        <div>
          <span>Částka</span>
          <strong>Dobrovolná</strong>
        </div>
        <div>
          <span>Zpráva</span>
          <strong>{editableText(ctx, "qrMessage", b.qrMessage || "POMOC PRES ASTERA LIGHT", "span", {})}</strong>
        </div>
        {b.qrVariableSymbol && (
          <div>
            <span>Variabilní symbol</span>
            <strong>{editableText(ctx, "qrVariableSymbol", b.qrVariableSymbol, "span", {})}</strong>
          </div>
        )}
      </div>
    </section>
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
          {b.type === "two-col" && <TwoColBlock b={b} ctx={ctx} pageSlug={pageSlug} />}
          {b.type === "faq" && <FaqAccordionBlock b={b} />}
          {b.type === "contact-form" && <ContactFormBlock />}
          {b.type === "donation-qr" && <DonationQrBlock b={b} ctx={ctx} />}
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
        .page-text-content div,
        .page-two-col-content p,
        .page-two-col-content div {
          margin: 0 0 14px;
          min-height: 1em;
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
        .donation-qr-block {
          position: relative;
          isolation: isolate;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
          grid-template-areas:
            "copy card"
            "details card";
          gap: 34px;
          align-items: center;
          margin: 34px 0 70px;
          padding: 40px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.62);
          border-radius: 24px;
          background:
            linear-gradient(120deg, rgba(255,255,255,0.82), rgba(255,255,255,0.24) 38%, rgba(255,255,255,0.62) 72%),
            linear-gradient(135deg, rgba(184,138,53,0.14), transparent 38%),
            linear-gradient(135deg, #fdf7ee 0%, #f7e8d7 42%, #ead8f4 100%);
          box-shadow: 0 28px 80px rgba(58,31,78,0.16), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .donation-qr-block:before {
          content: "";
          position: absolute;
          inset: 12px;
          z-index: -1;
          border: 1px solid rgba(130,83,145,0.14);
          border-radius: 18px;
          pointer-events: none;
        }
        .donation-qr-copy {
          grid-area: copy;
          position: relative;
          z-index: 1;
          min-width: 0;
        }
        .donation-qr-eyebrow {
          margin: 0 0 10px;
          color: #8b5f18;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .donation-qr-title {
          max-width: 680px;
          margin: 0 0 14px;
          color: #26142f;
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          line-height: 1.06;
          font-weight: 700;
        }
        .donation-qr-text {
          max-width: 650px;
          margin: 0 0 24px;
          color: #57445f;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          line-height: 1.78;
          overflow-wrap: anywhere;
        }
        .donation-qr-details {
          grid-area: details;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          max-width: 650px;
        }
        .donation-qr-details div {
          min-width: 0;
          padding: 13px 15px;
          border: 1px solid rgba(80,47,89,0.12);
          border-radius: 14px;
          background: rgba(255,255,255,0.62);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.76);
        }
        .donation-qr-details span {
          display: block;
          margin-bottom: 4px;
          color: #8a718f;
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .donation-qr-details strong {
          display: flex;
          min-width: 0;
          gap: 2px;
          color: #281532;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }
        .donation-qr-card {
          grid-area: card;
          position: relative;
          justify-self: end;
          width: 100%;
          max-width: 340px;
          min-width: 0;
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.86);
          border-radius: 22px;
          background: rgba(255,255,255,0.58);
          box-shadow: 0 22px 55px rgba(44,21,58,0.18), inset 0 1px 0 rgba(255,255,255,0.92);
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
        }
        .donation-qr-code-shell {
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          padding: 14px;
          border-radius: 18px;
          background:
            linear-gradient(#fffdfa, #fffdfa) padding-box,
            linear-gradient(135deg, rgba(184,138,53,0.78), rgba(124,59,178,0.72)) border-box;
          border: 1px solid transparent;
          box-shadow: 0 14px 34px rgba(52,26,63,0.12);
        }
        .donation-qr-code {
          display: block;
          width: 100%;
          height: 100%;
        }
        .donation-qr-brand {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-top: 14px;
          color: #2a1734;
          font-family: 'Poppins', sans-serif;
        }
        .donation-qr-brand span {
          font-size: 13px;
          font-weight: 800;
        }
        .donation-qr-brand strong {
          padding: 6px 10px;
          border-radius: 999px;
          background: #2a1734;
          color: #fff9ef;
          font-size: 11px;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .donation-qr-note {
          margin: 12px 2px 0;
          color: #7b657d;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          line-height: 1.55;
        }
        .donation-qr-error {
          color: #8a1f2d;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }
        @media (max-width: 900px) {
          .page-banner-block[data-mobile-bg="true"],
          .page-hero-block[data-mobile-bg="true"] {
            background-image: var(--mobile-background-image) !important;
          }
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
          .donation-qr-block {
            grid-template-columns: 1fr !important;
            grid-template-areas:
              "copy"
              "card"
              "details" !important;
            gap: 24px !important;
            padding: 30px !important;
          }
          .donation-qr-card {
            justify-self: center !important;
          }
          .donation-qr-title {
            font-size: 34px !important;
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
          .donation-qr-block {
            margin: 20px 0 36px !important;
            padding: 18px 16px !important;
            border-radius: 16px !important;
            gap: 16px !important;
            background:
              linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42)),
              linear-gradient(135deg, #fdf7ee 0%, #f4e4d5 52%, #efe3f5 100%) !important;
            box-shadow: 0 14px 36px rgba(58,31,78,0.11), inset 0 1px 0 rgba(255,255,255,0.86) !important;
          }
          .donation-qr-block:before {
            inset: 7px !important;
            border-radius: 12px !important;
          }
          .donation-qr-eyebrow {
            margin-bottom: 6px !important;
            font-size: 10px !important;
            letter-spacing: 0.08em !important;
          }
          .donation-qr-title {
            font-size: 24px !important;
            line-height: 1.14 !important;
            margin-bottom: 9px !important;
          }
          .donation-qr-text {
            font-size: 14px !important;
            line-height: 1.58 !important;
            margin-bottom: 0 !important;
          }
          .donation-qr-details {
            grid-template-columns: 1fr !important;
            gap: 7px !important;
          }
          .donation-qr-details div {
            padding: 10px 12px !important;
            border-radius: 11px !important;
          }
          .donation-qr-card {
            max-width: 268px !important;
            padding: 10px !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 28px rgba(44,21,58,0.12), inset 0 1px 0 rgba(255,255,255,0.88) !important;
          }
          .donation-qr-code-shell {
            padding: 8px !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 20px rgba(52,26,63,0.09) !important;
          }
          .donation-qr-brand {
            flex-wrap: wrap !important;
            margin-top: 9px !important;
            gap: 7px !important;
          }
          .donation-qr-note {
            margin-top: 8px !important;
            font-size: 11px !important;
            line-height: 1.45 !important;
          }
          .donation-qr-details strong {
            display: block !important;
            font-size: 13px !important;
          }
          .donation-qr-details strong span {
            display: inline !important;
            margin: 0 !important;
          }
          .page-text-content h2,
          .page-two-col-content h2 {
            font-size: 23px !important;
            line-height: 1.25 !important;
          }
        }
        @media (max-width: 430px) {
          .page-block-donation-qr {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }
          .donation-qr-block {
            margin: 16px 0 32px !important;
            padding: 16px 12px !important;
            border-radius: 14px !important;
            gap: 14px !important;
          }
          .donation-qr-block:before {
            inset: 5px !important;
            border-radius: 10px !important;
          }
          .donation-qr-eyebrow {
            font-size: 9px !important;
            line-height: 1.35 !important;
          }
          .donation-qr-title {
            font-size: 22px !important;
            line-height: 1.14 !important;
            margin-bottom: 8px !important;
          }
          .donation-qr-text {
            font-size: 13px !important;
            line-height: 1.55 !important;
            margin-bottom: 0 !important;
          }
          .donation-qr-details {
            gap: 8px !important;
          }
          .donation-qr-details div {
            padding: 9px 10px !important;
            border-radius: 10px !important;
          }
          .donation-qr-details span {
            font-size: 10px !important;
          }
          .donation-qr-details strong {
            font-size: 12px !important;
          }
          .donation-qr-card {
            max-width: 238px !important;
            padding: 9px !important;
            border-radius: 14px !important;
          }
          .donation-qr-code-shell {
            padding: 7px !important;
            border-radius: 11px !important;
          }
          .donation-qr-brand {
            margin-top: 11px !important;
            gap: 8px !important;
          }
          .donation-qr-brand span {
            font-size: 11px !important;
          }
          .donation-qr-brand strong {
            padding: 5px 8px !important;
            font-size: 9px !important;
          }
          .donation-qr-note {
            font-size: 10px !important;
            line-height: 1.42 !important;
          }
        }
      `}</style>
    </>
  );
}
