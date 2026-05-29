import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { GenericSortableList } from "@/components/tenant/GenericSortableList";
import { shouldSkipNextImageOptimization } from "@/lib/image-source";

interface Service {
  name: string;
  description: string;
  price?: string;
  duration?: string;
  icon?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
}

export function ServicesSection({ content, variant, sectionId }: Props) {

  // hair-01: 4 numbered cards (01–04), gold číslo, Montserrat, cream bg
  if (variant === "hair-numbered-cards") {
    interface HairItem { number?: string; name: string; description: string; ctaText?: string; ctaHref?: string; }
    const items = (content.items as HairItem[]) ?? (content.services as HairItem[]) ?? [];
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const CREAM = "#f5f1f0";
    return (
      <section id="sluzby" data-template="hair-01" style={{ backgroundColor: CREAM, padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", fontFamily: MONO }}>
        <div
          className="max-w-[1280px] mx-auto grid gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px,100%), 1fr))" }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              style={{ backgroundColor: "#fff", padding: "40px 32px 36px", display: "flex", flexDirection: "column", gap: 16 }}
            >
              <span style={{ color: GOLD, fontSize: 28, fontWeight: 200, letterSpacing: "0.04em", lineHeight: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.number`} value={it.number ?? `0${i+1}.`} tag="span" />
              </span>
              <p style={{ color: "#1e1e1e", fontSize: "clamp(15px,1.3vw,18px)", fontWeight: 600, lineHeight: 1.3, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={it.name} tag="span" />
              </p>
              <p style={{ color: "#605f5f", fontSize: 14, fontWeight: 300, lineHeight: 1.7, flex: 1, margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={it.description} tag="span" />
              </p>
              {it.ctaText && (
                <a
                  href={it.ctaHref ?? "#rezervace"}
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    border: `1.5px solid ${GOLD}`,
                    color: GOLD,
                    backgroundColor: "transparent",
                    fontFamily: MONO,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "12px 24px",
                    textDecoration: "none",
                    alignSelf: "flex-start",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GOLD; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaText`} value={it.ctaText} tag="span" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Support both field name conventions: services[] and items[] (generator/pricing section)
  const services = (
    (content as { services?: Service[] }).services ??
    (content as { items?: Service[] }).items ??
    []
  );
  const title = String(content.title ?? (variant === "pricing-list" ? "Ceník služeb" : "Naše služby"));

  if (variant === "barber-04-pricing-flat") {
    // barber-04 (Černý Fade) — plochý seznam ceníku s podporou kategorií.
    // Items: [{ category?, name, description?, price, duration? }]
    type PricingItem = Service & { category?: string };
    const items = services as PricingItem[];
    const grouped: { category: string; items: PricingItem[] }[] = [];
    items.forEach((it) => {
      const cat = it.category ?? "default";
      let g = grouped.find((x) => x.category === cat);
      if (!g) {
        g = { category: cat, items: [] };
        grouped.push(g);
      }
      g.items.push(it);
    });
    let itemIdx = 0;
    return (
      <section
        className="relative"
        style={{ padding: "72px 24px", backgroundColor: "#ffffff" }}
        data-template="barber-04"
      >
        <div className="max-w-[860px] mx-auto">
          {grouped.map((g, gi) => (
            <div key={`grp-${gi}`} className={gi > 0 ? "mt-16" : ""}>
              {g.category !== "default" && (
                <>
                  <h3
                    className="uppercase text-center"
                    style={{
                      fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                      fontWeight: 300,
                      fontSize: "clamp(20px, 2vw, 28px)",
                      letterSpacing: 0,
                      color: "#d5b981",
                      margin: "0 auto 12px",
                      lineHeight: 1.2,
                    }}
                  >
                    {g.category}
                  </h3>
                  <div
                    aria-hidden
                    className="mx-auto"
                    style={{ width: 50, height: 2, backgroundColor: "#d5b981", opacity: 0.7, margin: "0 auto 28px" }}
                  />
                </>
              )}
              {g.items.map((it) => {
                const idx = itemIdx++;
                return (
                  <div
                    key={`pi-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 24,
                      padding: "14px 0",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                          fontSize: "clamp(15px, 1.2vw, 18px)",
                          fontWeight: 300,
                          letterSpacing: 1,
                          color: "#1a1a1a",
                          textTransform: "uppercase",
                          margin: 0,
                        }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`services.${idx}.name`} value={it.name} tag="span" />
                      </p>
                      {it.description && (
                        <p
                          style={{
                            fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                            fontSize: 13,
                            color: "#666",
                            lineHeight: 1.6,
                            margin: "4px 0 0",
                          }}
                        >
                          <GenericEditableText sectionId={sectionId} field={`services.${idx}.description`} value={it.description} tag="span" />
                        </p>
                      )}
                    </div>
                    {it.price && (
                      <span
                        style={{
                          fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                          fontSize: "clamp(16px, 1.3vw, 20px)",
                          fontWeight: 400,
                          letterSpacing: 1,
                          color: "#d5b981",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`services.${idx}.price`} value={it.price} tag="span" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "barber-04-services-cards") {
    // barber-04 — 4-cards grid s tmavým pozadím a velkými H4 Bebas Neue
    return (
      <section
        className="relative"
        style={{ padding: "72px 24px", backgroundColor: "#1a1a1a" }}
        data-template="barber-04"
      >
        <div className="max-w-[1180px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {services.map((sv, i) => (
              <div
                key={`svc-${i}`}
                style={{
                  backgroundColor: "#0f0f0f",
                  padding: "40px 28px",
                  textAlign: "center",
                  minHeight: 220,
                }}
              >
                <h4
                  className="uppercase"
                  style={{
                    fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                    fontWeight: 300,
                    fontSize: "clamp(18px, 1.5vw, 22px)",
                    letterSpacing: 2,
                    color: "#d5b981",
                    margin: "0 auto 16px",
                    lineHeight: 1.2,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
                </h4>
                <p
                  style={{
                    fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.78)",
                    margin: 0,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "pricing-list") {
    return (
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface, #1e1e1e)" }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent, #C9A84C)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div>
            <GenericSortableList sectionId={sectionId} field="services" items={services as unknown as Record<string, unknown>[]}>
              {(s, i, handle) => {
                const sv = s as unknown as Service;
                return (
                  <div
                    className="flex items-start py-5 border-b"
                    style={{ borderColor: "var(--color-border, #2a2a2a)" }}
                  >
                    {handle}
                    <div className="flex flex-1 justify-between items-start">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-text, #f5f5f5)" }}>
                          <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #a0a0a0)" }}>
                          <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
                          {sv.duration && ` · ${sv.duration}`}
                        </p>
                      </div>
                      {sv.price && (
                        <span className="font-bold ml-4" style={{ color: "var(--color-accent, #C9A84C)" }}>
                          <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={sv.price} tag="span" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
            </GenericSortableList>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "pricing-urban") {
    return (
      <section
        className="py-24 px-6"
        style={{ backgroundColor: "var(--color-bg, #1e1e1e)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-4xl font-black uppercase mb-2"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #f4f4f4)",
              letterSpacing: "0.04em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div
            style={{
              width: 40,
              height: 3,
              backgroundColor: "var(--color-primary, #ff5268)",
              marginBottom: "3rem",
            }}
          />
          <GenericSortableList sectionId={sectionId} field="services" items={services as unknown as Record<string, unknown>[]}>
            {(s, i, handle) => {
              const sv = s as unknown as Service;
              return (
                <div
                  className="flex items-start gap-4 py-6"
                  style={{ borderBottom: "1px solid var(--color-border, #2a2a2a)" }}
                >
                  {handle}
                  <span
                    className="select-none"
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 900,
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-primary, #ff5268)",
                      opacity: 0.22,
                      lineHeight: 1,
                      minWidth: "3rem",
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-lg"
                      style={{ color: "var(--color-text, #f4f4f4)", fontFamily: "var(--font-heading)" }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={sv.name} tag="span" />
                    </p>
                    {sv.description && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-muted, #888)", lineHeight: 1.6 }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={sv.description} tag="span" />
                      </p>
                    )}
                  </div>
                  {sv.price && (
                    <span
                      className="font-bold text-base whitespace-nowrap flex-shrink-0"
                      style={{ color: "var(--color-primary, #ff5268)" }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={sv.price} tag="span" />
                    </span>
                  )}
                </div>
              );
            }}
          </GenericSortableList>
        </div>
      </section>
    );
  }

  if (variant === "pricing-cols") {
    interface PricingItem { name: string; price: string; }
    interface PricingCategory { name: string; subtitle?: string; items: PricingItem[]; }
    const categories = (content as { categories?: PricingCategory[] }).categories ?? [];
    const bgImage = String((content as { backgroundImage?: string }).backgroundImage ?? "");
    const catTitle = String(content.title ?? "Ceník");
    return (
      <section
        className="relative py-24 px-6 overflow-hidden"
        style={{ backgroundColor: "#111" }}
      >
        {bgImage && (
          <div className="absolute inset-0" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bgImage} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(.25)" }} />
            <div className="absolute inset-0" style={{ background: "rgba(10,8,6,.75)" }} />
          </div>
        )}
        <div className="relative z-10 max-w-[1200px] mx-auto">
          <h2
            className="text-center mb-14 font-normal uppercase"
            style={{ fontFamily: "var(--font-heading, 'Libre Baskerville', serif)", color: "var(--color-accent, #d4a96e)", letterSpacing: "0.15em", fontSize: "clamp(1.4rem,3vw,2rem)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={catTitle} tag="span" />
          </h2>
          <div
            data-pricing-cols
            className="grid gap-14"
            style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}
          >
            {categories.map((cat, ci) => (
              <div key={ci}>
                <p
                  className="mb-1 font-normal uppercase"
                  style={{ fontFamily: "var(--font-heading, 'Libre Baskerville', serif)", fontSize: "1.2rem", letterSpacing: "0.15em", color: "var(--color-accent, #d4a96e)" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`categories.${ci}.name`} value={cat.name} tag="span" />
                </p>
                {cat.subtitle && (
                  <p className="mb-4 text-sm" style={{ color: "#b89060", letterSpacing: "0.05em" }}>
                    <GenericEditableText sectionId={sectionId} field={`categories.${ci}.subtitle`} value={cat.subtitle} tag="span" />
                  </p>
                )}
                <ul>
                  {cat.items.map((item, ii) => (
                    <li
                      key={ii}
                      className="flex justify-between items-baseline gap-3 py-2"
                      style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}
                    >
                      <span className="text-sm font-light" style={{ color: "rgba(255,255,255,.85)" }}>
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ii}.name`} value={item.name} tag="span" />
                      </span>
                      <span className="text-sm whitespace-nowrap font-normal" style={{ color: "var(--color-accent, #d4a96e)" }}>
                        <GenericEditableText sectionId={sectionId} field={`categories.${ci}.items.${ii}.price`} value={item.price} tag="span" />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media(max-width:900px){[data-pricing-cols]{grid-template-columns:1fr !important;gap:3rem !important;}}
        `}</style>
      </section>
    );
  }

  if (variant === "peak-cut-pricing") {
    // peak-cut Minimal — bezserif kapitálky, tenké linky mezi položkami, černé ceny vpravo.
    return (
      <section className="py-16 px-6" style={{ backgroundColor: "#ffffff" }} data-template="peak-cut">
        <div className="max-w-[1180px] mx-auto">
          <h2
            className="uppercase"
            style={{
              fontFamily: "'Oswald','Arial Narrow',Arial,sans-serif",
              fontWeight: 500,
              fontSize: "clamp(28px, 3.4vw, 48px)",
              letterSpacing: "0.02em",
              color: "#1a1a1a",
              margin: "0 0 36px",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div>
            {services.map((s, i) => (
              <div
                key={`pc-pr-${i}`}
                className="flex items-start justify-between gap-8"
                style={{
                  padding: "18px 0",
                  borderTop: i === 0 ? "1px solid #cfcbc3" : "none",
                  borderBottom: "1px solid #cfcbc3",
                }}
              >
                <div className="flex-1">
                  <p
                    className="uppercase"
                    style={{
                      fontFamily: "'Oswald','Arial Narrow',Arial,sans-serif",
                      fontWeight: 500,
                      fontSize: "clamp(15px, 1.2vw, 18px)",
                      letterSpacing: "0.04em",
                      color: "#1a1a1a",
                      margin: 0,
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={s.name} tag="span" />
                  </p>
                  {s.description && (
                    <p
                      style={{
                        fontFamily: "'Overpass',Arial,sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        color: "#5a5651",
                        lineHeight: 1.6,
                        margin: "6px 0 0",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={s.description} tag="span" />
                    </p>
                  )}
                </div>
                {s.price && (
                  <span
                    style={{
                      fontFamily: "'Oswald','Arial Narrow',Arial,sans-serif",
                      fontWeight: 500,
                      fontSize: "clamp(15px, 1.2vw, 18px)",
                      letterSpacing: "0.04em",
                      color: "#1a1a1a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={s.price} tag="span" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "pricing-rows") {
    return (
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
        <div className="max-w-2xl mx-auto">
          <h2
            className="font-bold mb-2 uppercase"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-text, #000)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              letterSpacing: "0.02em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {/* Gradient rule under heading — peak-cut visual signature */}
          <div
            className="mb-12"
            style={{ height: 1, background: "linear-gradient(90deg,#000,transparent)", width: "100%" }}
          />
          <div>
            {services.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-start py-5"
                style={{
                  borderTop: i > 0 ? "none" : undefined,
                  position: "relative",
                }}
              >
                {i > 0 && (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: 1,
                      background: "linear-gradient(90deg,#000,transparent)",
                    }}
                  />
                )}
                <div className="pr-4">
                  <p
                    className="font-medium mb-1 uppercase"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "var(--color-text, #000)",
                      fontSize: "1.25rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={s.name} tag="span" />
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted, #666)", fontFamily: "var(--font-body)", fontWeight: 200 }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={s.description} tag="span" />
                    {s.duration && <span style={{ opacity: 0.6 }}> · {s.duration}</span>}
                  </p>
                </div>
                {s.price && (
                  <span
                    className="font-semibold shrink-0"
                    style={{
                      color: "var(--color-primary, #004679)",
                      fontFamily: "var(--font-heading)",
                      fontSize: "1.125rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={s.price} tag="span" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "pricing-table-video") {
    const videoPoster = String(content.videoPoster ?? "");
    const leftTitle = String(content.leftTitle ?? "");
    const rightTitle = String(content.rightTitle ?? title);
    const columns = (content.columns as string[]) ?? [];
    const rows = (content.rows as Array<{ service: string; prices: string[] }>) ?? [];
    const notes = (content.notes as string[]) ?? [];
    const ctas = (content.ctas as Array<{ label: string; href: string; primary?: boolean }>) ?? [];
    return (
      <section style={{ backgroundColor: "#0f0a07", padding: "100px 0" }} data-template="barber-03">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid gap-12 lg:gap-16" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))" }}>
          <div>
            <h3
              className="uppercase mb-8"
              style={{ fontFamily: "var(--font-heading)", color: "#c8a96e", fontWeight: 700, fontSize: "clamp(1.4rem, 2.4vw, 2rem)", letterSpacing: "0.16em" }}
            >
              <GenericEditableText sectionId={sectionId} field="leftTitle" value={leftTitle} tag="span" />
            </h3>
            {videoPoster && (
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/9", borderRadius: 2, backgroundColor: "#1c1410" }}>
                <GenericEditableImage sectionId={sectionId} field="videoPoster" src={videoPoster} alt={leftTitle} className="absolute inset-0 w-full h-full">
                  <Image src={videoPoster} alt={leftTitle} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" unoptimized={shouldSkipNextImageOptimization(videoPoster)} />
                </GenericEditableImage>
                <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div style={{ width: 72, height: 72, borderRadius: 50, border: "1.5px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3
              className="uppercase mb-8"
              style={{ fontFamily: "var(--font-heading)", color: "#c8a96e", fontWeight: 700, fontSize: "clamp(1.4rem, 2.4vw, 2rem)", letterSpacing: "0.16em" }}
            >
              <GenericEditableText sectionId={sectionId} field="rightTitle" value={rightTitle} tag="span" />
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", color: "rgba(255,255,255,0.92)", fontFamily: "var(--font-body)", fontSize: "0.92rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(200,169,110,0.4)" }}>
                    <th style={{ textAlign: "left", padding: "12px 8px", color: "#c8a96e", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.78rem", fontWeight: 600 }}>Služba</th>
                    {columns.map((col, ci) => (
                      <th key={ci} style={{ textAlign: "right", padding: "12px 8px", color: "#c8a96e", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.78rem", fontWeight: 600 }}>
                        <GenericEditableText sectionId={sectionId} field={`columns.${ci}`} value={col} tag="span" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "14px 8px" }}>
                        <GenericEditableText sectionId={sectionId} field={`rows.${ri}.service`} value={row.service} tag="span" />
                      </td>
                      {row.prices.map((p, pi) => (
                        <td key={pi} style={{ padding: "14px 8px", textAlign: "right", color: "#c8a96e", fontWeight: 500 }}>
                          <GenericEditableText sectionId={sectionId} field={`rows.${ri}.prices.${pi}`} value={p} tag="span" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notes.length > 0 && (
              <div className="mt-6" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                {notes.map((n, ni) => (
                  <p key={ni}>
                    <GenericEditableText sectionId={sectionId} field={`notes.${ni}`} value={n} tag="span" />
                  </p>
                ))}
              </div>
            )}
            {ctas.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {ctas.map((cta, ci) => {
                  const isPrimary = cta.primary !== false;
                  return (
                    <a
                      key={ci}
                      href={cta.href}
                      className="inline-block uppercase no-underline transition-colors"
                      style={{
                        border: isPrimary ? "1.5px solid #c8a96e" : "1.5px solid rgba(255,255,255,0.8)",
                        backgroundColor: isPrimary ? "#c8a96e" : "transparent",
                        color: isPrimary ? "#1c1410" : "#fff",
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.18em",
                        padding: "14px 28px",
                        borderRadius: 2,
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`ctas.${ci}.label`} value={cta.label} tag="span" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: cards-grid
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-xl"
              style={{
                backgroundColor: "var(--color-surface, #f9fafb)",
                borderRadius: "var(--radius, 8px)",
              }}
            >
              {s.icon && <div className="text-3xl mb-3">{iconEmoji(s.icon)}</div>}
              <h3 className="font-bold mb-2" style={{ color: "var(--color-text, #111)" }}>
                <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={s.name} tag="span" />
              </h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted, #666)" }}>
                <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={s.description} tag="span" />
              </p>
              {s.price && (
                <p className="font-semibold mt-3" style={{ color: "var(--color-primary, #6366f1)" }}>
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={s.price} tag="span" />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function iconEmoji(icon: string): string {
  const map: Record<string, string> = {
    briefcase: "💼", users: "👥", home: "🏠", building: "🏛️",
  };
  return map[icon] ?? "📋";
}
