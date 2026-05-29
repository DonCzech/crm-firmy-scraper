import { GenericEditableText } from "@/components/tenant/GenericEditableText";

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

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}
