import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface CtaContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  bookingUrl?: string;
  bookingEnabled?: boolean;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function CtaSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const c = content as CtaContent & { body?: string; image?: string };

  // hair-04: žlutý bar, text vlevo, tmavé pill tlačítko s telefonem vpravo — 1:1 kim-impressive.cz
  if (variant === "hair-04-cta-phone") {
    const title     = String((content as Record<string,unknown>).title ?? "Nechcete čekat? Zkuste nám zavolat");
    const phone     = String((content as Record<string,unknown>).phone ?? "704 123 456");
    const phoneHref = String((content as Record<string,unknown>).phoneHref ?? "tel:+420704123456");
    const GOLD      = "#FFDF25";
    const DARK      = "#0d0d0d";
    const LATO      = "'Lato', sans-serif";

    return (
      <>
      <style>{`
        @media (max-width: 640px) {
          [data-template="hair-04"] .h04-cta-phone-wrap {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            padding: 28px 24px !important;
            gap: 20px !important;
          }
          [data-template="hair-04"] .h04-cta-phone-btn {
            width: 100% !important;
            text-align: center !important;
            padding: 18px 24px !important;
          }
        }
      `}</style>
      <section
        data-template="hair-04"
        style={{ backgroundColor: GOLD, padding: "0 clamp(20px, 8vw, 140px)" }}
      >
        <div
          className="h04-cta-phone-wrap"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 110,
            gap: 32,
          }}
        >
          <GenericEditableText
            sectionId={sectionId}
            field="title"
            value={title}
            tag="p"
            style={{
              fontFamily: LATO,
              fontSize: "clamp(18px, 2vw, 26px)",
              fontWeight: 400,
              color: DARK,
              margin: 0,
              lineHeight: 1.3,
            }}
          />
          <a
            href={phoneHref}
            className="h04-cta-phone-btn"
            style={{
              fontFamily: LATO,
              fontSize: "clamp(16px, 1.5vw, 20px)",
              fontWeight: 500,
              color: GOLD,
              backgroundColor: DARK,
              borderRadius: 50,
              padding: "16px 36px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.2s, color 0.2s",
              display: "block",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#222"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; }}
          >
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
        </div>
      </section>
      </>
    );
  }

  // beauty-01: full-bleed foto, tmavý overlay, centrovaný text, sand CTA
  // Reference: selfbeautystudio.com — "Víc než střih. Zážitek."
  if (variant === "cta-beauty-01") {
    const bg       = String((content as Record<string,unknown>).backgroundImage ?? "");
    const title    = String(c.title    ?? "Víc než střih. Zážitek.");
    const subtitle = String(c.subtitle ?? "");
    const ctaText  = String(c.ctaText  ?? "NAVŠTIVTE NÁS");
    const ctaHref  = String(c.ctaHref  ?? "#kontakt");
    const FONT_H   = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const FONT_B   = "'Fahkwang', sans-serif";
    const SAND     = "#E0BE9A";
    return (
      <section
        id="rezervace"
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: 480, backgroundColor: "#2a2520" }}
        data-template="beauty-01"
      >
        {bg && (
          <Image
            src={bg}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={false}
            unoptimized={shouldSkipNextImageOptimization(bg)}
          />
        )}
        {/* Dark overlay */}
        <div aria-hidden className="absolute inset-0 z-[1]" style={{ backgroundColor: "rgba(0,0,0,0.52)" }} />

        {/* Content */}
        <div className="relative z-[2] text-center px-6" style={{ maxWidth: 760 }}>
          <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 400, color: "#ffffff", lineHeight: 1.15, marginBottom: 20, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ fontFamily: FONT_B, fontSize: 15, fontWeight: 300, color: "rgba(255,255,255,0.82)", lineHeight: 1.75, marginBottom: 36, maxWidth: 580, margin: "0 auto 36px" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: SAND,
              color: "#1F1F1F",
              fontFamily: FONT_B,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "14px 40px",
              transition: "background 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#C4A07E"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = SAND; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    );
  }

  // hair-02: beige 2-col, teal tag + H1 + lead + outline CTA, circle image right
  if (variant === "cta-hair-02-promo") {
    return <CtaHair02Promo content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  }

  // hair-01: cream bg, dark title, gold outline button
  if (variant === "cta-hair-01") {
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const title = c.title ?? "Zobrazit všechny služby";
    const subtitle = c.subtitle ?? "";
    const ctaText = c.ctaText ?? "Zobrazit";
    const ctaHref = resolveDemoHref(c.ctaHref ?? "#sluzby", tenantSlug, isAdmin);
    return (
      <section
        data-template="hair-01"
        style={{ backgroundColor: "#f5f1f0", padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", textAlign: "center", fontFamily: MONO }}
      >
        <h2 style={{ color: "#1e1e1e", fontSize: "clamp(20px,2.5vw,34px)", fontWeight: 300, letterSpacing: "0.06em", marginBottom: subtitle ? 16 : 32 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        {subtitle && (
          <p style={{ color: "#605f5f", fontSize: 14, fontWeight: 300, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 32px" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        <a
          href={ctaHref}
          style={{
            display: "inline-block",
            border: `1.5px solid ${GOLD}`,
            color: GOLD,
            backgroundColor: "transparent",
            fontFamily: MONO,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "14px 36px",
            textDecoration: "none",
          }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </section>
    );
  }

  if (variant === "barber-04-reservation-dark") {
    const title = c.title ?? "Objednejte se teď hned on-line";
    const subtitle = c.subtitle ?? "";
    const ctaText = c.ctaText ?? "vytvořit rezervaci";
    const ctaHref = resolveDemoHref(c.ctaHref ?? "#rezervace", tenantSlug, isAdmin);
    const bgImage = c.image ?? "";
    return (
      <section
        className="relative overflow-hidden"
        style={{ padding: "96px 24px", backgroundColor: "#1a1a1a" }}
        data-template="barber-04"
      >
        {bgImage && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.35,
              zIndex: 0,
            }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.75))", zIndex: 1 }}
        />
        <div className="relative max-w-[860px] mx-auto text-center" style={{ zIndex: 2 }}>
          <h2
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 300,
              fontSize: "clamp(24px, 2.6vw, 40px)",
              letterSpacing: 0,
              color: "#ffffff",
              margin: "0 auto 14px",
              lineHeight: 1.2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div
            aria-hidden
            className="mx-auto"
            style={{ width: 60, height: 2, backgroundColor: "#d5b981", opacity: 0.85, margin: "0 auto 24px" }}
          />
          {subtitle && (
            <p
              style={{
                fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1vw, 16px)",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.7,
                maxWidth: 640,
                margin: "0 auto 32px",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
          <a
            href={ctaHref}
            className="inline-block uppercase no-underline transition-colors hover:opacity-90"
            style={{
              backgroundColor: "#d5b981",
              color: "#ffffff",
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "2px",
              padding: "10px 28px",
              borderRadius: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </section>
    );
  }

  if (variant === "barber-dark") {
    return (
      <section
        className="py-24 px-6 text-center"
        style={{ backgroundColor: "var(--color-surface, #1E1E1E)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: "var(--color-accent, #C9A84C)", letterSpacing: "0.15em" }}
          >
            Online rezervace
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #F5F5F5)", lineHeight: 1.15 }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Rezervujte si termín"} tag="span" />
          </h2>
          {c.subtitle && (
            <p className="mb-10 text-base leading-relaxed" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
            </p>
          )}
          <a
            href={resolveDemoHref(c.ctaHref ?? "#kontakt", tenantSlug, isAdmin)}
            className="inline-block px-10 py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--color-accent, #C9A84C)",
              color: "#111",
              borderRadius: "var(--radius, 4px)",
              letterSpacing: "0.1em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat online"} tag="span" />
          </a>
        </div>
      </section>
    );
  }

  if (variant === "cafe-magazine") {
    return (
      <section className="py-16 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
        <div className="max-w-5xl mx-auto md:flex md:items-center md:gap-12 text-center md:text-left">
          <div className="md:w-1/2">
            <h2
              className="text-3xl md:text-4xl mb-6"
              style={{ color: "var(--color-text, #111)", fontFamily: "var(--font-heading)" }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Naše tištěné noviny"} tag="span" />
            </h2>
            {c.subtitle && (
              <p className="mb-6 text-base leading-relaxed" style={{ color: "var(--color-text-muted, #555)" }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
              </p>
            )}
            {c.body && (
              <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--color-text-muted, #555)" }}>
                <GenericEditableText sectionId={sectionId} field="body" value={c.body} tag="span" />
              </p>
            )}
            <a
              href={resolveDemoHref(c.ctaHref ?? "#", tenantSlug, isAdmin)}
              className="inline-block px-6 py-3 rounded-full font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary, #6d1f37)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Zobrazit"} tag="span" />
            </a>
          </div>
          {c.image && (
            <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
              <div className="w-[220px]">
                <img
                  src={c.image}
                  alt=""
                  className="w-full hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20 px-6 text-center"
      style={{ backgroundColor: "var(--color-primary, #6366f1)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={c.title ?? "Rezervujte si termín"} tag="span" />
        </h2>
        {c.subtitle && (
          <p className="text-white/80 mb-8">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {c.bookingEnabled && c.bookingUrl ? (
            <a
              href={c.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white font-semibold rounded hover:opacity-90 transition-opacity"
              style={{ color: "var(--color-primary, #6366f1)", borderRadius: "var(--radius, 4px)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat online"} tag="span" />
            </a>
          ) : (
            <a
              href={resolveDemoHref(c.ctaHref ?? "#kontakt", tenantSlug, isAdmin)}
              className="px-8 py-4 bg-white font-semibold rounded hover:opacity-90 transition-opacity"
              style={{ color: "var(--color-primary, #6366f1)", borderRadius: "var(--radius, 4px)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Kontaktujte nás"} tag="span" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// hair-02: beige (#ebe8e2) 2-col — left: teal h6 tag + H1 + lead + outline CTA; right: circle image
function CtaHair02Promo({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const tag     = String(content.tag     ?? "e-shop");
  const title   = String(content.title   ?? "REVOLUCE V PÉČI O VLASY");
  const body    = String(content.body    ?? "");
  const ctaText = String(content.ctaText ?? "Zjistit více");
  const ctaHref = resolveDemoHref(String(content.ctaHref ?? "#kontakt"), tenantSlug, isAdmin);
  const image   = String(content.image   ?? "");
  const TEAL  = "#8ab2ab";
  const BEIGE = "rgb(235,232,226)";
  const FONT  = "'Montserrat', sans-serif";

  return (
    <section
      id="promo"
      style={{ backgroundColor: BEIGE, padding: "70px 0", fontFamily: FONT }}
      data-template="hair-02"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 48 }}>
        {/* Left — text */}
        <div style={{ flex: "1 1 380px", minWidth: 280 }}>
          {/* Teal tag */}
          <p style={{ color: TEAL, fontFamily: FONT, fontSize: 14, fontWeight: 500, margin: "0 0 20px", textTransform: "lowercase", letterSpacing: "0.03em" }}>
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </p>
          {/* H1 */}
          <h2 style={{ color: "#000000", fontFamily: FONT, fontSize: "clamp(1.75rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.4, margin: "0 0 16px", textTransform: "uppercase" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {/* Lead */}
          {body && (
            <p style={{ color: "#000000", fontFamily: FONT, fontSize: 16, lineHeight: 1.7, margin: "0 0 28px" }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {/* Outline CTA */}
          <a
            href={ctaHref}
            style={{
              display: "inline-block",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              color: TEAL,
              border: `1.5px solid ${TEAL}`,
              borderRadius: 10,
              padding: "10px 30px",
              textDecoration: "none",
              textTransform: "lowercase",
              letterSpacing: "0.02em",
              transition: "background .2s, color .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = TEAL; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TEAL; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Right — circle image */}
        {image && (
          <div style={{ flex: "0 0 auto", width: "min(380px, 100%)", aspectRatio: "1/1", borderRadius: "50%", overflow: "hidden", position: "relative" }}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 380px"
              unoptimized={shouldSkipNextImageOptimization(image)}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}
