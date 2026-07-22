"use client";
import type { JSX } from "react";

import { useEffect, useRef, useState } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  role?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
  tenantSlug?: string;
}

export function TestimonialsSection({ content, variant, sectionId, isAdmin, tenantSlug }: Props) {
  // Nahoře, aby se volal bezpodmínečně — pod early returny by změna varianty
  // za běhu měnila počet hooks a React by spadl.
  const [active, setActive] = useState(0);

  if (variant === "signal-01-testimonials") return <TestimonialsSignal01 content={content} sectionId={sectionId} />;
  if (variant === "proof-01-testimonials") return <TestimonialsProof01 content={content} sectionId={sectionId} />;
  if (variant === "eshop-02-testimonials") return <TestimonialsEshop02 content={content} sectionId={sectionId} />;
  if (variant === "eshop-07-reviews") return <TestimonialsEshop07 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "stavba-03-testimonials") return <TestimonialsStavba03 content={content} sectionId={sectionId} />;
  if (variant === "stavba-02-testimonials") return <TestimonialsStavba02 content={content} sectionId={sectionId} />;
  if (variant === "stavba-01-testimonials") return <TestimonialsStavba01 content={content} sectionId={sectionId} />;
  if (variant === "instala-01-testimonials") return <TestimonialsInstala01 content={content} sectionId={sectionId} />;
  if (variant === "fitness-01-testimonials-2col") return <TestimonialsFitness01 content={content} sectionId={sectionId} />;
  if (variant === "harmonie-01-testimonials")  return <TestimonialsHarmonie01 content={content} sectionId={sectionId} />;
  if (variant === "thaimasaze-02-testimonials")   return <TestimonialsThaimasaze02 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-01-testimonials")  return <TestimonialsTattoo01 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-02-testimonials")  return <TestimonialsTattoo02 content={content} sectionId={sectionId} />;
  if (variant === "tattoo-03-testimonials")  return <TestimonialsTattoo03 content={content} sectionId={sectionId} />;
  if (variant === "nails-02-testimonials")   return <TestimonialsNails02 content={content} sectionId={sectionId} />;
  if (variant === "nails-03-testimonials")   return <TestimonialsNails03 content={content} sectionId={sectionId} />;
  if (variant === "clinic-02-testimonials")  return <TestimonialsClinic02 content={content} sectionId={sectionId} />;
  if (variant === "ortho-01-testimonials")    return <TestimonialsOrtho01 content={content} sectionId={sectionId} />;
  if (variant === "fyzio-02-testimonials")    return <TestimonialsFyzio02 content={content} sectionId={sectionId} />;
  if (variant === "reality-03-testimonials") return <TestimonialsReality03 content={content} sectionId={sectionId} />;
  if (variant === "reality-04-testimonials") return <TestimonialsReality04 content={content} sectionId={sectionId} />;
  if (variant === "reality-05-testimonials") return <TestimonialsReality05 content={content} sectionId={sectionId} />;
  if (variant === "reality-06-testimonials") return <TestimonialsReality06 content={content} sectionId={sectionId} isAdmin={isAdmin} tenantSlug={tenantSlug} />;
  if (variant === "florist-01-testimonials") return <TestimonialsFlorist01 content={content} sectionId={sectionId} />;
  if (variant === "autoservis-03-testimonials") return <TestimonialsAutoservis03 content={content} sectionId={sectionId} />;
  if (variant === "ortho-02-testimonials")      return <TestimonialsOrtho02 content={content} sectionId={sectionId} />;
  if (variant === "malir-02-testimonials")      return <TestimonialsMalir02 content={content} sectionId={sectionId} />;
  // Support both field name conventions: testimonials (legacy) and reviews (generator)
  const testimonials = (
    (content as { testimonials?: Testimonial[] }).testimonials ??
    (content as { items?: Testimonial[] }).items ??
    ((content as { reviews?: Array<{ author?: string; name?: string; text: string; rating: number; role?: string }> }).reviews ?? []).map(
      (r): Testimonial => ({ name: r.author ?? r.name ?? "", text: r.text, rating: r.rating, role: r.role })
    )
  );
  const title = String(content.title ?? (variant === "slider" ? "Co říkají klienti" : "Reference"));

  if (variant === "massage-01-testimonials-3col") return <Massage01Testimonials3col content={content} sectionId={sectionId} />;
  if (variant === "tawan-01-reviews") return <ReviewsTawan01 content={content} sectionId={sectionId} />;
  if (variant === "autoskola-01-testimonials") return <TestimonialsAutoskola01 content={content} sectionId={sectionId} />;
  if (variant === "edu-01-testimonials")       return <TestimonialsEdu01 content={content} sectionId={sectionId} />;
  if (variant === "kids-01-testimonials")      return <TestimonialsKids01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-01-testimonials")    return <TestimonialsUcetni01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-04-testimonials")    return <TestimonialsUcetni04 content={content} sectionId={sectionId} />;
  if (variant === "solar-03-testimonials")     return <TestimonialsSolar03 content={content} sectionId={sectionId} />;
  if (variant === "solar-02-testimonials")     return <TestimonialsSolar02 content={content} sectionId={sectionId} />;
  if (variant === "klempir-01-testimonials")   return <TestimonialsKlempir01 content={content} sectionId={sectionId} />;
  if (variant === "rekonstrukce-01-testimonials") return <TestimonialsRekonstrukce01 content={content} sectionId={sectionId} />;
  if (variant === "malir-01-testimonials")    return <TestimonialsMalir01 content={content} sectionId={sectionId} />;
  if (variant === "clean-02-testimonials")    return <TestimonialsClean02 content={content} sectionId={sectionId} />;
  if (variant === "garden-02-testimonials")   return <TestimonialsGarden02 content={content} sectionId={sectionId} />;
  if (variant === "arbo-01-testimonials")     return <TestimonialsArbo01  content={content} sectionId={sectionId} />;
  if (variant === "video-01-testimonials")   return <TestimonialsVideo01 content={content} sectionId={sectionId} isAdmin={isAdmin} />;

  if (!testimonials.length) return null;

  // beauty-01 — Sand-Cream Editorial Wellness testimonials 3-col
  // Magazine header + 3-col paper cards on cream2 bg, BIG sand opening quote glyph,
  // italic body, hairline divider, Fahkwang name + mono role. Hover = card lift + sand border.
  if (variant === "beauty-01-testimonials-3col") {
    const cc = content as Record<string, unknown>;
    const eyebrowRaw  = cc.eyebrow;
    const titleAlt    = cc.title;
    const subtitleRaw = cc.subtitle;
    const ratingRaw   = cc.ratingLine;
    const eyebrow  = eyebrowRaw  === undefined ? "Reference" : String(eyebrowRaw);
    const titleStr = titleAlt    === undefined ? "Slovo klientů." : String(titleAlt);
    const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
    const ratingLine = ratingRaw === undefined ? "★ 4.9 / 5  ·  211 hodnocení" : String(ratingRaw);
    const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim() || ratingLine.trim());
    const CREAM2  = "#F5EDE4";
    const DARK    = "#1F1F1F";
    const MUTED   = "#5B4D43";
    const SAND    = "#E0BE9A";
    const FONT    = "'Fahkwang', Georgia, serif";
    const SANS    = "var(--font-overpass), 'Overpass', Inter, system-ui, sans-serif";
    const MONO    = "var(--font-overpass-mono), 'Overpass Mono', Menlo, monospace";
    return (
      <section
        id="reference"
        style={{
          backgroundColor: CREAM2,
          padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
        }}
        data-template="beauty-01"
      >
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          {showHeader && (
            <div className="b01-tst-head" style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "clamp(24px, 4vw, 64px)",
              alignItems: "end",
              paddingBottom: "clamp(40px, 5vw, 64px)",
              borderBottom: `1px solid ${DARK}`,
              marginBottom: "clamp(40px, 5vw, 64px)",
            }}>
              <div>
                {eyebrow.trim() && (
                  <span style={{
                    display: "inline-block",
                    fontFamily: MONO, fontSize: 11, letterSpacing: "0.28em",
                    textTransform: "uppercase", color: MUTED,
                    marginBottom: 18,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  </span>
                )}
                {titleStr.trim() && (
                  <h2 style={{
                    margin: 0,
                    fontFamily: FONT, fontWeight: 500,
                    fontSize: "clamp(36px, 5.5vw, 72px)",
                    lineHeight: 1.08, letterSpacing: "0.01em",
                    color: DARK, maxWidth: "13ch",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                  </h2>
                )}
              </div>
              <div style={{ justifySelf: "end", textAlign: "right", maxWidth: 460 }}>
                {subtitle.trim() && (
                  <p style={{
                    margin: "0 0 14px",
                    fontFamily: SANS, fontWeight: 300,
                    fontSize: "clamp(14px, 1.2vw, 17px)",
                    lineHeight: 1.65,
                    color: MUTED,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                  </p>
                )}
                {ratingLine.trim() && (
                  <p style={{
                    margin: 0,
                    fontFamily: MONO, fontSize: 12, letterSpacing: "0.10em",
                    color: SAND,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="ratingLine" value={ratingLine} tag="span" />
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="b01-tst-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "clamp(20px, 2.5vw, 32px)",
          }}>
            {testimonials.map((t, i) => (
              <article
                key={`rev-${i}`}
                className="b01-tst-card"
                style={{
                  backgroundColor: "#FFF8F1",
                  padding: "clamp(28px, 3vw, 40px)",
                  border: "1px solid rgba(224,190,154,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  transition: "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <span aria-hidden="true" className="b01-tst-quote" style={{
                  display: "block",
                  fontFamily: FONT, fontStyle: "italic",
                  fontSize: "clamp(56px, 7vw, 88px)",
                  fontWeight: 400,
                  lineHeight: 0.7,
                  color: SAND,
                  marginBottom: 0,
                  transition: "color 0.35s ease",
                }}>&ldquo;</span>

                {t.text && (
                  <p style={{
                    margin: 0,
                    fontFamily: SANS, fontWeight: 400,
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    color: DARK, lineHeight: 1.7, flex: 1,
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text} tag="span" />
                  </p>
                )}

                <div style={{ width: 32, height: 1, backgroundColor: SAND }} aria-hidden />

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {t.name && (
                      <span style={{
                        fontFamily: FONT, fontSize: 17, fontWeight: 500,
                        color: DARK, letterSpacing: "0.01em",
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={t.name} tag="span" />
                      </span>
                    )}
                    {t.role && (
                      <span style={{
                        fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em",
                        textTransform: "uppercase", color: MUTED,
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role} tag="span" />
                      </span>
                    )}
                  </div>
                  {(t.rating ?? 0) > 0 && (
                    <span aria-label={`Hodnocení ${t.rating} z 5`} style={{
                      display: "inline-flex", gap: 3,
                      fontFamily: MONO, fontSize: 14, color: SAND,
                    }}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} aria-hidden="true" style={{ color: k < (t.rating ?? 5) ? SAND : "rgba(91,77,67,0.25)" }}>★</span>
                      ))}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // hair-01: white bg, rating line, horizontal card row
    if (variant === "hair-01-cards") {
    return <TestimonialsHair01 content={content} sectionId={sectionId} />;
  }
    if (variant === "hair-02-testimonials") {
    return <TestimonialsHair02 content={content} sectionId={sectionId} />;
  }
    if (variant === "hair-03-testimonials") {
    return <TestimonialsHair03 content={content} sectionId={sectionId} />;
  }
    if (variant === "hair-04-testimonials") {
    return <TestimonialsHair04 content={content} sectionId={sectionId} />;
  }

  if (variant === "testimonials-peak-cut-grid") {
    // peak-cut (aka barber-05) — Brutalist Atelier White testimonials
    // Magazine header + 2x2 grid of quote cards. Each card: HUGE Oswald opening quote glyph,
    // body Overpass, hairline divider, name uppercase + 5-star row. Hover = red bottom bar slide.
    const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
    const OVERPASS = "var(--font-overpass), 'Overpass', 'Inter', system-ui, sans-serif";
    const INK    = "#0a0a0a";
    const cc = content as Record<string, unknown>;
    const eyebrowRaw  = cc.eyebrow;
    const titleRaw    = cc.title;
    const subtitleRaw = cc.subtitle;
    const eyebrow  = eyebrowRaw  === undefined ? "Reference" : String(eyebrowRaw);
    const titleStr = titleRaw    === undefined ? "Slovo klientů." : String(titleRaw);
    const subtitle = subtitleRaw === undefined ? "" : String(subtitleRaw);
    const showHeader = !!(eyebrow.trim() || titleStr.trim() || subtitle.trim());
    type T = { name?: string; text?: string; rating?: number; role?: string };
    const items: T[] = (cc.testimonials as T[]) ?? (cc.items as T[]) ?? [];
    return (
      <section
        id="reference"
        className="relative w-full overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          padding: "clamp(72px, 9vw, 128px) clamp(24px, 5vw, 64px)",
          borderTop: "1px solid rgba(10,10,10,0.08)",
        }}
        data-template="peak-cut"
      >
        <div className="mx-auto" style={{ maxWidth: 1320 }}>
          {showHeader && (
            <div className="pc-tst-head" style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "clamp(24px, 4vw, 64px)",
              alignItems: "end",
              paddingBottom: "clamp(40px, 5vw, 64px)",
              borderBottom: `1px solid ${INK}`,
              marginBottom: "clamp(40px, 5vw, 64px)",
            }}>
              <div>
                {eyebrow.trim() && (
                  <span style={{
                    display: "inline-block",
                    fontFamily: MONO, fontSize: 11, letterSpacing: "0.24em",
                    textTransform: "uppercase", color: "rgba(10,10,10,0.55)",
                    marginBottom: 18,
                  }}>
                    <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  </span>
                )}
                {titleStr.trim() && (
                  <h2 style={{
                    margin: 0,
                    fontFamily: OSWALD,
                    fontWeight: 700,
                    fontSize: "clamp(36px, 5.5vw, 72px)",
                    lineHeight: 1.05,
                    letterSpacing: "0.01em",
                    textTransform: "uppercase",
                    color: INK,
                    maxWidth: "13ch",
                  }}>
                    <GenericEditableText sectionId={sectionId} field="title" value={titleStr} tag="span" />
                  </h2>
                )}
              </div>
              {subtitle.trim() && (
                <p style={{
                  margin: 0,
                  fontFamily: OVERPASS, fontWeight: 300,
                  fontSize: "clamp(14px, 1.2vw, 17px)",
                  lineHeight: 1.65,
                  color: "rgba(10,10,10,0.7)",
                  maxWidth: 460,
                  justifySelf: "end",
                }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}

          <div className="pc-tst-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "clamp(20px, 2.5vw, 40px)",
          }}>
            {items.map((t, i) => {
              const rating = Number(t.rating ?? 5);
              return (
                <article
                  key={`pc-tst-${i}`}
                  className="pc-tst-card relative"
                  style={{
                    position: "relative",
                    padding: "clamp(28px, 3vw, 40px)",
                    backgroundColor: "#fafafa",
                    border: "1px solid rgba(10,10,10,0.08)",
                    transition: "border-color 0.3s ease, background-color 0.3s ease",
                  }}
                >
                  <span aria-hidden="true" className="pc-tst-bar" style={{
                    position: "absolute", left: 0, right: 0, bottom: -1, height: 2,
                    backgroundColor: "#c41e3a",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
                  }} />
                  <span aria-hidden="true" className="pc-tst-quote" style={{
                    display: "block",
                    fontFamily: OSWALD,
                    fontSize: "clamp(64px, 7vw, 96px)",
                    fontWeight: 700,
                    lineHeight: 0.7,
                    color: "rgba(10,10,10,0.15)",
                    marginBottom: 8,
                    transition: "color 0.35s ease",
                  }}>&ldquo;</span>

                  {t.text && (
                    <p style={{
                      margin: "0 0 28px",
                      fontFamily: OVERPASS,
                      fontWeight: 400,
                      fontSize: "clamp(15px, 1.2vw, 17px)",
                      lineHeight: 1.65,
                      color: "rgba(10,10,10,0.82)",
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text} tag="span" />
                    </p>
                  )}

                  <div style={{ borderTop: `1px solid rgba(10,10,10,0.15)`, paddingTop: 18, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {t.name && (
                        <span style={{
                          fontFamily: OSWALD, fontWeight: 600, fontSize: 13,
                          letterSpacing: "0.14em", textTransform: "uppercase", color: INK,
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={t.name} tag="span" />
                        </span>
                      )}
                      {t.role && (
                        <span style={{
                          fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em",
                          color: "rgba(10,10,10,0.5)",
                        }}>
                          <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role} tag="span" />
                        </span>
                      )}
                    </div>
                    {rating > 0 && (
                      <span aria-label={`Hodnocení ${rating} z 5`} style={{
                        display: "inline-flex", gap: 3,
                        fontFamily: MONO, fontSize: 14, color: "#c41e3a",
                      }}>
                        {Array.from({ length: 5 }).map((_, k) => (
                          <span key={k} aria-hidden="true" style={{ color: k < rating ? "#c41e3a" : "rgba(10,10,10,0.2)" }}>★</span>
                        ))}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "barber-04-single-stars") {
    const t = testimonials[active] ?? testimonials[0];
    const count = testimonials.length;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const innerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("b04t-vis"); obs.disconnect(); } }, { threshold: 0.15 });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    const role = String((t as unknown as Record<string, unknown>).role ?? (t as unknown as Record<string, unknown>).location ?? "");
    return (
      <section
        className="relative overflow-hidden"
        style={{ padding: "clamp(96px, 11vw, 140px) 24px", backgroundColor: "#0a0806" }}
        data-template="barber-04"
      >
        <style>{`
          @keyframes b04tFadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          .b04t-inner { opacity: 0; }
          .b04t-inner.b04t-vis { animation: b04tFadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
        `}</style>

        {/* Top gold fade divider */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.4) 50%, transparent 100%)",
        }} />

        {/* Oversized decorative quote mark — bg accent */}
        <div aria-hidden style={{
          position: "absolute",
          top: "clamp(72px, 9vw, 120px)",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(220px, 26vw, 380px)",
          lineHeight: 0.8,
          color: "rgba(213,185,129,0.08)",
          fontWeight: 400,
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}>
          „
        </div>

        <div ref={innerRef} className="b04t-inner relative z-10 max-w-[860px] mx-auto text-center">
          {/* Industrial numbered eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 28,
            fontFamily: "'Lato',Helvetica,Arial,sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.32em", color: "#d5b981", textTransform: "uppercase",
          }}>
            <GenericEditableText sectionId={sectionId} field="eyebrowNum" value={String((content as Record<string, unknown>).eyebrowNum ?? "04")} tag="span" style={{ fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif", fontWeight: 400, letterSpacing: "0.10em", fontSize: 14 }} />
            <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#d5b981", opacity: 0.7 }} />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={String((content as Record<string, unknown>).eyebrow ?? "Ohlasy zákazníků")} tag="span" />
          </div>

          {title && (
            <h2
              className="uppercase"
              style={{
                fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                fontWeight: 400,
                fontSize: "clamp(32px, 4vw, 52px)",
                letterSpacing: "0.03em",
                color: "#fff",
                margin: "0 auto 20px",
                lineHeight: 1.1,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          <div
            aria-hidden
            style={{
              width: 180, height: 1,
              margin: "0 auto 44px",
              background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.85) 50%, transparent 100%)",
            }}
          />
          {/* Stars */}
          <div className="flex items-center justify-center gap-1.5 mb-8" aria-label={`${t.rating ?? 5} z 5 hvězd`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={`star-${i}`}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={i < (t.rating ?? 5) ? "#d5b981" : "none"}
                stroke="#d5b981"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 9 12 2" />
              </svg>
            ))}
          </div>
          {/* Body */}
          <p
            style={{
              fontFamily: "'Lato',Helvetica,Arial,sans-serif",
              fontWeight: 400,
              fontSize: "clamp(17px, 1.4vw, 22px)",
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.65,
              maxWidth: 740,
              margin: "0 auto 36px",
            }}
          >
            <GenericEditableText sectionId={sectionId} field={`testimonials.${active}.text`} value={t.text} tag="span" />
          </p>
          {/* Author block */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <p
              className="uppercase"
              style={{
                fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                fontWeight: 400,
                fontSize: 20,
                letterSpacing: "0.18em",
                color: "#d5b981",
                margin: 0,
              }}
            >
              <GenericEditableText sectionId={sectionId} field={`testimonials.${active}.name`} value={t.name} tag="span" />
            </p>
            {role && (
              <p
                className="uppercase"
                style={{
                  fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.48)",
                  margin: 0,
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`testimonials.${active}.role`} value={role} tag="span" />
              </p>
            )}
          </div>

          {/* Pagination */}
          {count > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12" aria-hidden>
              {testimonials.map((_, i) => (
                <button
                  key={`tdot-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Recenze ${i + 1}`}
                  className="border-0 cursor-pointer"
                  style={{
                    width: i === active ? 28 : 10,
                    height: 2,
                    backgroundColor: i === active ? "#d5b981" : "rgba(255,255,255,0.20)",
                    padding: "11px 0",
                    backgroundClip: "content-box",
                    transition: "width .25s, background-color .25s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === "slider") {
    const t = testimonials[active];
    return (
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface, #f9f9f9)" }}>
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-3xl font-bold mb-12"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="mb-6">
            <p className="text-lg italic mb-4" style={{ color: "var(--color-text, #111)" }}>
              &ldquo;<GenericEditableText sectionId={sectionId} field={`testimonials.${active}.text`} value={t.text} tag="span" />&rdquo;
            </p>
            <p className="font-semibold" style={{ color: "var(--color-primary, #6366f1)" }}>
              <GenericEditableText sectionId={sectionId} field={`testimonials.${active}.name`} value={t.name} tag="span" />
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Recenze ${i + 1}`}
                className="relative flex items-center justify-center w-11 h-11 rounded-full transition-all bg-transparent border-0 cursor-pointer"
              >
                <span
                  className="w-2 h-2 rounded-full transition-all block"
                  style={{ backgroundColor: i === active ? "var(--color-primary, #6366f1)" : "var(--color-border, #ccc)" }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "barber-dark-3col") return <TestimonialsBarberDark3col content={content} testimonials={testimonials} title={title} sectionId={sectionId} />;

  // Default: static-cards
  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6"
              style={{
                backgroundColor: "var(--color-surface, #f4f6f9)",
                borderRadius: "var(--radius, 8px)",
              }}
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="italic mb-4 text-sm" style={{ color: "var(--color-text, #111)" }}>
                &ldquo;<GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text} tag="span" />&rdquo;
              </p>
              <p className="font-semibold text-sm" style={{ color: "var(--color-primary, #6366f1)" }}>
                <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={t.name} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── massage-01-testimonials-3col ─────────────────────────────────────────────
// Dark surface #141414, Google rating bar, infinite slider s šipkami
// 3 karty viditelné, klonovaný track pro bezešvé opakování
// ─────────────────────────────────────────────────────────────────────────────
function Massage01Testimonials3col({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const cc = content as Record<string, unknown>;
  const eyebrowRaw = cc.sectionTag;
  const titleRaw   = cc.heading;
  const sectionTag   = eyebrowRaw === undefined ? "Ohlasy klientů" : String(eyebrowRaw);
  const heading      = titleRaw   === undefined ? "Co o nás říkají" : String(titleRaw);
  const googleRating = String(cc.googleRating ?? "4.9");
  const googleCount  = String(cc.googleCount  ?? "94 recenzí");
  const showHeader = !!(sectionTag.trim() || heading.trim());
  const raw = (content.items as Array<{ text: string; author: string; stars: number }>) ?? [];

  const GOLD      = "#C9A962";
  const BORDER    = "#2A2520";
  const SECONDARY = "#A09888";

  const GAP = 28;

  const [perView, setPerView] = useState(3);
  const [idx, setIdx]             = useState(0);
  const [animated, setAnimated]   = useState(true);
  const viewportRef               = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const transitioning             = useRef(false);
  const idxRef                    = useRef(0);

  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) {
        const vw = viewportRef.current.offsetWidth;
        const pv = vw < 640 ? 1 : vw < 900 ? 2 : 3;
        setPerView(pv);
        setCardWidth((vw - GAP * (pv - 1)) / pv);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Pad to at least perView items so we always have a full first page
  const items = raw.length >= perView
    ? raw
    : [...raw, ...raw, ...raw, ...raw].slice(0, perView);
  const track = [...items, ...items, ...items];
  const startIdx = items.length;

  useEffect(() => {
    idxRef.current = startIdx;
    setIdx(startIdx);
  }, [startIdx]);

  const offset = idx * (cardWidth + GAP);

  const goTo = (next: number, anim = true) => {
    idxRef.current = next;
    setAnimated(anim);
    setIdx(next);
  };

  const handleTransitionEnd = () => {
    const cur = idxRef.current;
    if (cur >= items.length * 2) {
      goTo(cur - items.length, false);
    } else if (cur < items.length) {
      goTo(cur + items.length, false);
    }
    transitioning.current = false;
  };

  const prev = () => {
    if (transitioning.current) return;
    transitioning.current = true;
    goTo(idxRef.current - 1);
  };
  const next = () => {
    if (transitioning.current) return;
    transitioning.current = true;
    goTo(idxRef.current + 1);
  };

  const StarIcon = ({ size = 15 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={GOLD}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );

  const ArrowBtn = ({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) => (
    <button onClick={onClick} aria-label={dir === "left" ? "Předchozí" : "Další"} className="m01-tst-arrow">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left" ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 18l6-6-6-6"/>}
      </svg>
    </button>
  );

  return (
    <section
      id="reference"
      className="m01-tst"
      data-template="massage-01"
    >
      <div className="m01-tst-inner">
        {showHeader && (
          <div className="m01-services-header" style={{ marginBottom: 36 }}>
            <p className="m01-services-tag">
              <span className="m01-services-tag-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
            </p>
            <h2 className="m01-services-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
        )}

        {/* Google rating bar */}
        <div className="m01-tst-rating">
          <span className="m01-tst-rating-num">
            <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
          </span>
          <span className="m01-tst-rating-stars">{[1,2,3,4,5].map(n => <StarIcon key={n} size={18} />)}</span>
          <span className="m01-tst-rating-count">
            <GenericEditableText sectionId={sectionId} field="googleCount" value={googleCount} tag="span" />
          </span>
        </div>

        {/* Viewport */}
        <div ref={viewportRef} className="m01-tst-viewport">
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: "flex",
              gap: GAP,
              transform: `translateX(-${offset}px)`,
              transition: animated ? "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
              willChange: "transform",
            }}
          >
            {track.map((item, i) => {
              const origIdx = i % items.length;
              return (
                <div
                  key={i}
                  className="m01-tst-card"
                  style={{ width: cardWidth > 0 ? cardWidth : `calc((100% - ${GAP * (perView - 1)}px) / ${perView})` }}
                >
                  <span className="m01-tst-quote" aria-hidden="true">”</span>
                  <div className="m01-tst-stars">
                    {Array.from({ length: item.stars ?? 5 }).map((_, n) => <StarIcon key={n} />)}
                  </div>
                  <p className="m01-tst-text">
                    <GenericEditableText sectionId={sectionId} field={`items.${origIdx}.text`} value={item.text} tag="span" />
                  </p>
                  <p className="m01-tst-author">
                    <span className="m01-tst-author-line" aria-hidden="true" />
                    <GenericEditableText sectionId={sectionId} field={`items.${origIdx}.author`} value={item.author} tag="span" />
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Šipky pod sliderem */}
        <div className="m01-tst-arrows">
          <ArrowBtn dir="left" onClick={prev} />
          <ArrowBtn dir="right" onClick={next} />
        </div>
      </div>
    </section>
  );
}

// ── tawan-01-reviews ──────────────────────────────────────────────────────────
// Bílé BG, 3 karty vedle sebe, google rating badge nahoře vpravo
// Každá karta: hvězdičky + text + autor — 1:1 tawan.cz style
// ─────────────────────────────────────────────────────────────────────────────
function ReviewsTawan01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { text: string; author: string; stars: number };
  const sectionTag   = String(content.sectionTag   ?? "Reference");
  const heading      = String(content.heading      ?? "Co říkají naši klienti");
  const googleRating = String(content.googleRating ?? "4.9");
  const googleCount  = String(content.googleCount  ?? "120 recenzí");
  const items        = (content.items as Item[] | undefined) ?? [];

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const MUTED  = "#6b6278";
  const FONT   = "'Muli', sans-serif";

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.transform = "translateY(0)";
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    cardRefs.current.forEach(el => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const Stars = ({ count }: { count: number }) => (
    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? BRONZE : "#e0d9d0"} xmlns="http://www.w3.org/2000/svg">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section
      id="reference"
      style={{ backgroundColor: "#ffffff", padding: "96px 32px" }}
      data-template="tawan-01"
    >
      <style>{`
        .tw-rev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media(max-width:768px){ .tw-rev-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header s Google badge */}
      <div style={{ maxWidth: 1200, margin: "0 auto 56px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
        <div>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: BRONZE, display: "block", marginBottom: 16 }}>
            <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
          </span>
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px,3vw,44px)", fontWeight: 300, color: PURPLE, margin: "0 0 20px", letterSpacing: 1 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div style={{ width: 48, height: 1, backgroundColor: BRONZE }} />
        </div>

        {/* Google rating badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", border: `1px solid ${BRONZE}44`, flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: PURPLE, lineHeight: 1 }}>
              <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: MUTED, marginTop: 2 }}>
              <GenericEditableText sectionId={sectionId} field="googleCount" value={googleCount} tag="span" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={BRONZE} xmlns="http://www.w3.org/2000/svg">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Karty */}
      <div className="tw-rev-grid" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {items.map((item, i) => (
          <div
            key={i}
            ref={el => { cardRefs.current[i] = el; }}
            style={{
              backgroundColor: "#f8f7f5", padding: "36px 32px",
              borderLeft: `3px solid ${BRONZE}`,
              opacity: 0, transform: "translateY(24px)",
              transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
            }}
          >
            <Stars count={item.stars ?? 5} />
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 300, color: MUTED, lineHeight: 1.75, margin: "0 0 24px", fontStyle: "italic" }}>
              &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: BRONZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {(item.author ?? "?").charAt(0)}
                </span>
              </div>
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: PURPLE, letterSpacing: 0.5 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


// ── harmonie-01-testimonials ────────────────────────────────────────────────────
function TestimonialsHarmonie01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title      = String(content.title      ?? "VAŠE ZKUŠENOSTI S HARMONIE SPA");
  const scoreLabel = String(content.scoreLabel ?? "Hodnocení obchodu");
  const score      = String(content.score      ?? "4.8/5.0");
  const countLabel = String(content.countLabel ?? "Počet názorů");
  const count      = String(content.count      ?? "53");

  type Review = { date: string; rating: number; text: string; author?: string };
  const reviews: Review[] = (content.reviews as Review[] | undefined) ?? [
    { date: "29.03.2026", rating: 4, author: "Jana K.",    text: "Masáž perfektní, indická masérka byla zdvořilá s citlivým přístupem." },
    { date: "27.02.2026", rating: 5, author: "Petra N.",   text: "Harmonie SPA mohu jen vřele doporučit. Velmi profesionální a lidský přístup, klidná atmosféra a opravdová péče o klienta." },
    { date: "25.01.2026", rating: 5, author: "Martina V.", text: "Masáže byly hluboce uvolňující a ájurvéda provedena s citem a znalostí. Cítila jsem se zrelaxovaná ještě dlouho po návštěvě." },
    { date: "22.01.2026", rating: 5, author: "Lucie M.",   text: "Nádherné prostředí, profesionální přístup. Určitě se vrátím." },
  ];

  const [idx, setIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => { setIsMobile(e.matches); setIdx(0); };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  const perView = isMobile ? 1 : 2;
  const maxIdx = Math.max(0, reviews.length - perView);

  const GOLD  = "#AA813A";
  const CREAM = "#F2EDE4";
  const FONT  = "'Jost', sans-serif";
  const TEXT  = "#334155";

  const Stars = ({ n, size = 16 }: { n: number; size?: number }) => (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= n ? GOLD : "#e0d5c8"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id="recenze" data-template="harmonie-01" style={{ backgroundColor: "#ffffff", padding: "88px 0 96px" }}>
      <div className="harmonie-rev-wrap">
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(16px,2vw,20px)", fontWeight: 500, color: GOLD, letterSpacing: 5, textTransform: "uppercase", margin: 0, textAlign: "center" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="harmonie-rev-body">
          {/* Levý blok — skóre */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", color: TEXT, margin: 0 }}>{scoreLabel}</p>
            <p style={{ fontFamily: FONT, fontSize: 48, fontWeight: 300, color: GOLD, margin: 0, lineHeight: 1 }}>{score}</p>
            <Stars n={5} size={20} />
            <div style={{ width: 40, height: 1, backgroundColor: "#d4c9bb", margin: "4px 0" }} />
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", color: TEXT, margin: 0 }}>{countLabel}</p>
            <p style={{ fontFamily: FONT, fontSize: 36, fontWeight: 300, color: GOLD, margin: 0, lineHeight: 1 }}>{count}</p>
          </div>

          {/* Pravý blok — slider */}
          <div>
            <div className="harmonie-rev-slider">
              <div className="harmonie-rev-track" style={{ transform: isMobile ? `translateX(calc(-${idx} * (100% + 24px)))` : `translateX(calc(-${idx} * (100% / 2 + 12px)))` }}>
                {reviews.map((r, i) => (
                  <div key={i} className="harmonie-rev-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Stars n={r.rating} size={14} />
                      <span style={{ fontFamily: FONT, fontSize: 12, color: "#9b8e82", letterSpacing: 1 }}>{r.date}</span>
                    </div>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, color: TEXT, lineHeight: 1.75, margin: 0, flexGrow: 1 }}><GenericEditableText sectionId={sectionId} field={`reviews.${i}.text`} value={r.text} tag="span" /></p>
                    {r.author && (
                      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: GOLD, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}><GenericEditableText sectionId={sectionId} field={`reviews.${i}.author`} value={r.author} tag="span" /></p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="harmonie-rev-nav">
              <button className="harmonie-rev-btn" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Předchozí">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="harmonie-rev-btn" onClick={() => setIdx(i => Math.min(maxIdx, i + 1))} disabled={idx >= maxIdx} aria-label="Další">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── thaimasaze-02-testimonials ───────────────────────────────────────────────────
function TestimonialsThaimasaze02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const showHeader = content.showHeader !== false;
  const eyebrow = String(content.eyebrow ?? "Co říkají naši hosté");
  const title = String(content.title ?? "Skutečné zážitky,\nskutečná proměna");

  type Item = { text?: string; author?: string; name?: string; role?: string };
  const raw = (content.items ?? content.testimonials ?? content.reviews ?? []) as Item[];
  const DEFAULT_ITEMS: Item[] = [
    { text: "Od první minuty jsem se cítila jako v Thajsku. Atmosféra, vůně, profesionalita — vše na nejvyšší úrovni.", author: "Lucie M.", role: "stálá klientka" },
    { text: "Masáž lávovými kameny byla absolutně transformující. Odcházela jsem jako nový člověk.", author: "Petra K.", role: "první návštěva" },
    { text: "Nejlepší thajská masáž v Praze. Chodím pravidelně už třetím rokem a kvalita je stále stejně výjimečná.", author: "Tomáš V.", role: "stálý klient" },
    { text: "Aromaterapie tu má úplně jinou dimenzi. Cítila jsem se naprosto uvolněná ještě celý týden po návštěvě.", author: "Jana S.", role: "doporučení od přátel" },
  ];
  const items = raw.length > 0 ? raw.map(r => ({ text: r.text ?? "", author: r.author ?? r.name ?? "", role: r.role ?? "" })) : DEFAULT_ITEMS;

  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <section data-template="thaimasaze-02" className="t02-tsm">
      {showHeader && (
        <div className="t02-tsm-header">
          <span className="t02-tsm-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="t02-tsm-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>
      )}

      <div className="t02-tsm-grid">
        {items.map((item, i) => (
          <div key={i} className={`t02-tsm-card${i === active ? " t02-tsm-card--active" : ""}`}>
            <svg className="t02-tsm-quote-mark" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.7 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.171 0-2.247-.566-2.917-1.179zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.7 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.171 0-2.247-.566-2.917-1.179z"/></svg>
            <p className="t02-tsm-text">
              <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />
            </p>
            <div className="t02-tsm-author-row">
              <div className="t02-tsm-avatar">{(item.author ?? "?")[0]}</div>
              <div className="t02-tsm-author-info">
                <strong><GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author ?? ""} tag="span" /></strong>
                {item.role && <span className="t02-tsm-role">{item.role}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="t02-tsm-dots" role="tablist">
        {items.map((_, i) => (
          <button key={i} className={`t02-tsm-dot${i === active ? " active" : ""}`} onClick={() => setActive(i)} aria-label={`Reference ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}

// ── tattoo-01-testimonials ────────────────────────────────────────────────────
function TestimonialsTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading = String(content.heading ?? "Co říkají naši klienti");
  const eyebrow = String(content.eyebrow ?? "Reference");
  type TItem = { text?: string; quote?: string; author?: string; role?: string; image?: string };
  const items = (content.testimonials as TItem[]) ?? [];
  const ACCENT = "#ff5c4b";

  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [headVis, setHeadVis] = useState(false);
  const [gridVis, setGridVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setHeadVis(true); o.disconnect(); } }, { threshold: 0.3 });
    if (headRef.current) o.observe(headRef.current);
    return () => o.disconnect();
  }, []);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGridVis(true); o.disconnect(); } }, { threshold: 0.12 });
    if (gridRef.current) o.observe(gridRef.current);
    return () => o.disconnect();
  }, []);

  return (
    <section
      id="reference"
      data-template="tattoo-01"
      style={{ backgroundColor: "#0f0f0f", padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px)" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div ref={headRef} className={`t01-gal-reveal ${headVis ? "t01-visible" : ""}`} style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <p style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: ACCENT, margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <div style={{ width: 48, height: 3, backgroundColor: ACCENT, margin: "0 auto 24px" }} aria-hidden />
          <h2
            style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 900,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(16px, 2.5vw, 28px)",
          }}
        >
          {items.map((item, i) => {
            const text   = item.text ?? item.quote ?? "";
            const author = item.author ?? "";
            const role   = item.role ?? "";
            const image  = item.image ?? "";
            return (
              <div
                key={i}
                className={`t01-testi-card t01-gal-reveal ${gridVis ? "t01-visible" : ""}`}
                style={{ transitionDelay: gridVis ? `${i * 0.1}s` : "0s" }}
              >
                {image && (
                  <>
                    <GenericEditableImage
                      sectionId={sectionId}
                      field={`testimonials.${i}.image`}
                      src={image}
                      alt=""
                      className="t01-testi-bg"
                      style={{ position: "absolute" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" aria-hidden />
                    </GenericEditableImage>
                    <div className="t01-testi-scrim" aria-hidden />
                  </>
                )}

                <div className="t01-testi-mark" aria-hidden>&ldquo;</div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div className="t01-testi-stars" aria-hidden>
                    {[0, 1, 2, 3, 4].map((s) => (
                      <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={ACCENT}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="t01-testi-text">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={text} tag="span" />
                  </p>
                  <div className="t01-testi-author">
                    <span className="t01-testi-tick" aria-hidden />
                    <span className="t01-testi-name">
                      <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={author} tag="span" />
                    </span>
                    {role && (
                      <span className="t01-testi-role">
                        <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={role} tag="span" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── tattoo-02-testimonials ────────────────────────────────────────────────────
// Světlé bg, 3 karty vedle sebe, zlaté hvězdičky, iniciálový avatar.
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsTattoo02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const c = content as Record<string, unknown>;

  const eyebrowRaw = c.eyebrow;
  const headingRaw = c.heading;
  const eyebrow = eyebrowRaw === undefined ? "Recenze" : String(eyebrowRaw);
  const heading = headingRaw === undefined ? "Co říkají naši klienti" : String(headingRaw);
  const showHeader = !!(eyebrow.trim() || heading.trim());

  const items = (c.items as Array<{ author: string; role?: string; text: string; rating?: number }>) ?? [];

  const GOLD = "#BF8A1D";
  const FONT_DISPLAY = "var(--font-oswald), 'Oswald', sans-serif";

  const Stars = ({ count = 5 }: { count?: number }) => (
    <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={i < count ? GOLD : "#e0e0e0"} aria-hidden>
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id="recenze" data-template="tattoo-02" style={{ background: "#f7f6f4", padding: "clamp(64px,9vw,110px) clamp(20px,4vw,48px)" }}>
      {/* Header */}
      {showHeader && (
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
            <span aria-hidden style={{ width: 32, height: 2, background: GOLD }} />
            <GenericEditableText
              sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
              style={{ fontFamily: FONT_DISPLAY, fontSize: "0.74rem", fontWeight: 600, color: GOLD, letterSpacing: "0.24em", textTransform: "uppercase" }}
            />
            <span aria-hidden style={{ width: 32, height: 2, background: GOLD }} />
          </div>
          <h2 style={{
            fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(28px,3.6vw,46px)",
            color: "#1a1a1a", margin: 0, lineHeight: 1.08, textTransform: "uppercase", letterSpacing: "0.02em",
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>
      )}

      {/* Cards */}
      <div className="t02-tst-grid">
        {items.map((item, i) => {
          const initials = item.author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={i} className="t02-tst-card">
              <Stars count={item.rating ?? 5} />
              <p style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "0.95rem", color: "#4a4a4a", lineHeight: 1.75, margin: "0 0 30px", position: "relative", zIndex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="t02-tst-avatar" aria-hidden>{initials}</div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "0.92rem", color: "#1a1a1a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                  </div>
                  {item.role && (
                    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "0.74rem", color: "#999", marginTop: 3 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── tattoo-03-testimonials ────────────────────────────────────────────────────
// Dark #0a0a0a, score box left (Bebas 96px score + crimson stars),
// 3 review cards right with crimson top border + quote glyph + hover lift
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c           = content as Record<string, unknown>;
  const showHeader  = c.showHeader !== false;
  const eyebrow     = String(c.eyebrow     ?? "Reference");
  const heading     = String(c.heading     ?? "Slova pod kůží");
  const score       = String(c.score       ?? "4.9");
  const scoreLabel  = String(c.scoreLabel  ?? "z 5.0");
  const reviewCount = String(c.reviewCount ?? "1 280");
  const reviewSuffix = String(c.reviewCountSuffix ?? "hodnocení");
  const rawItems    = (c.items as Array<{ text: string; author: string; rating: number; role?: string }>) ?? [];

  const ACCENT = "#D41515";

  return (
    <section
      id="reference"
      data-template="tattoo-03"
      style={{ backgroundColor: "#0a0a0a", padding: "clamp(56px,8vw,112px) clamp(20px,4vw,40px)", position: "relative", overflow: "hidden" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600&family=Barlow:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 32, height: 1, background: ACCENT, display: "block" }} />
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.72rem", fontWeight: 600,
                color: ACCENT, letterSpacing: "0.22em",
                textTransform: "uppercase", margin: 0,
              }}>
                <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              </p>
              <span style={{ width: 32, height: 1, background: ACCENT, display: "block" }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "#ffffff", margin: 0,
              letterSpacing: "0.04em",
            }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
        )}

        <div className="t03-test-grid" style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: 40,
          alignItems: "start",
        }}>
          {/* Score box */}
          <div className="t03-test-score" style={{
            background: "linear-gradient(160deg, #141414 0%, #0e0e0e 100%)",
            border: "1px solid rgba(212,21,21,0.15)",
            padding: "48px 36px",
            textAlign: "center",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 40, height: 2, background: ACCENT }} />
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(72px, 8vw, 96px)",
              color: ACCENT,
              lineHeight: 0.9,
              marginBottom: 6,
            }}>
              <GenericEditableText sectionId={sectionId} field="score" value={score} tag="span" />
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.82rem", fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.08em",
              marginBottom: 20,
            }}>
              <GenericEditableText sectionId={sectionId} field="scoreLabel" value={scoreLabel} tag="span" />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 20 }}>
              {[0,1,2,3,4].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill={ACCENT}>
                  <polygon points="9,1.5 11.5,6.5 17,7.3 13,11.2 14,17 9,14.2 4,17 5,11.2 1,7.3 6.5,6.5"/>
                </svg>
              ))}
            </div>
            <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.1)", margin: "0 auto 20px" }} />
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(20px, 2vw, 28px)",
              color: "#ffffff",
              lineHeight: 1,
              marginBottom: 4,
            }}>
              <GenericEditableText sectionId={sectionId} field="reviewCount" value={reviewCount} tag="span" />
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              <GenericEditableText sectionId={sectionId} field="reviewCountSuffix" value={reviewSuffix} tag="span" />
            </div>
          </div>

          {/* Review cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}>
            {rawItems.map((item, i) => (
              <div
                key={i}
                className="t03-test-card"
                style={{
                  background: "#111111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderTop: `2px solid ${ACCENT}`,
                  padding: "32px 28px 28px",
                  position: "relative",
                }}
              >
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 52, lineHeight: 1,
                  color: "rgba(212,21,21,0.18)",
                  position: "absolute", top: 18, right: 24,
                  pointerEvents: "none",
                }}>&ldquo;</div>
                <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                  {[0,1,2,3,4].map(j => (
                    <svg key={j} width="13" height="13" viewBox="0 0 18 18" fill={j < (item.rating ?? 5) ? ACCENT : "rgba(255,255,255,0.15)"}>
                      <polygon points="9,1.5 11.5,6.5 17,7.3 13,11.2 14,17 9,14.2 4,17 5,11.2 1,7.3 6.5,6.5"/>
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.75,
                  margin: "0 0 22px",
                  fontStyle: "italic",
                }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />&rdquo;
                </p>
                <div style={{ width: 20, height: 1, background: ACCENT, marginBottom: 14, opacity: 0.5 }} />
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: "#ffffff",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </div>
                {item.role && (
                  <div style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 4,
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── nails-02-testimonials ─────────────────────────────────────────────────────
// Dark wine #1f1411 luxury sekce — (03) prefix taupe italic + serif italic cream
// "Recenze" + taupe linka + uppercase kicker. 3-card grid: taupe quote glyph,
// serif italic cream quote, taupe linka, sans uppercase autor. Cream pozadí
// karet (subtle) na tmavém wine pro kontrast. Footer: Google rating link.
// ─────────────────────────────────────────────────────────────────────────────
interface Nails02Review { quote: string; author: string; meta?: string }

function TestimonialsNails02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "#1f1411";
  const WINE  = "#6b3f38";
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
  const SANS  = "'Helvetica Neue', Arial, sans-serif";

  const numberPrefix    = String(content.numberPrefix    ?? "(03)");
  const title           = String(content.title           ?? "Recenze");
  const kicker          = String(content.kicker          ?? "Co o nás říkají klientky");
  const reviews         = (content.reviews as Nails02Review[]) ?? [];
  const ratingScore     = String(content.ratingScore     ?? "4.9");
  const ratingText      = String(content.ratingText      ?? "/ 5 hodnocení na Google");
  const ratingHref      = String(content.ratingHref      ?? "https://google.com/search?q=demo");
  const secondaryText   = String(content.secondaryText   ?? "Přečíst všechny recenze");
  const secondaryHref   = String(content.secondaryHref   ?? "https://google.com/search?q=demo");

  return (
    <section
      id="recenze"
      data-section-type="testimonials"
      data-variant="nails-02-testimonials"
      data-template="nails-02"
      style={{
        backgroundColor: DARK,
        padding: (title || kicker || numberPrefix) ? "clamp(90px, 12vw, 160px) clamp(24px, 6vw, 72px)" : "clamp(48px, 6vw, 72px) clamp(24px, 6vw, 72px)",
        position: "relative",
      }}
    >
      {/* Section eyebrow — hidden on subpages */}
      {(title || kicker || numberPrefix) && (
      <div
        className="n02-rev-eyebrow"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "clamp(40px, 6vw, 80px)",
          right: "clamp(24px, 6vw, 72px)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: SANS,
          fontSize: "0.7rem",
          fontWeight: 500,
          color: TAUPE,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          opacity: 0.75,
        }}
      >
        <span>Kapitola · 03</span>
        <span style={{ display: "block", width: 42, height: 1, backgroundColor: TAUPE, opacity: 0.6 }} />
      </div>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header — hidden on subpages where title+kicker are empty */}
        {(title || kicker || numberPrefix) && (
        <div style={{ marginBottom: "clamp(72px, 9vw, 120px)", maxWidth: 720 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <span aria-hidden style={{ display: "block", width: 1, height: 32, backgroundColor: TAUPE }} />
            <span style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.5rem, 1.9vw, 1.9rem)",
              color: TAUPE,
              lineHeight: 1,
              opacity: 0.9,
            }}>
              <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
            </span>
          </div>

          <h2
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(3.2rem, 7vw, 6.6rem)",
              lineHeight: 0.95,
              color: CREAM,
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div aria-hidden="true" style={{ width: 88, height: 1, backgroundColor: TAUPE, margin: "48px 0 28px" }} />
          <p
            style={{
              fontFamily: SANS,
              fontSize: "0.76rem",
              fontWeight: 600,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              margin: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
        </div>
        )}

        {/* 3-card grid */}
        <div
          className="nails02-reviews-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "clamp(24px, 3vw, 40px)",
          }}
        >
          {reviews.map((r, i) => {
            const nStr = String(i + 1).padStart(2, "0");
            return (
              <article
                key={`rv-${i}`}
                className="n02-rev-card"
                style={{
                  position: "relative",
                  padding: "48px 36px 40px",
                  backgroundColor: "rgba(246,239,233,0.04)",
                  border: `1px solid rgba(212,160,128,0.18)`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                  transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1), border-color 0.4s ease, background-color 0.4s ease",
                }}
              >
                {/* N°XX top-right */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 26,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "1.15rem",
                    color: TAUPE,
                    opacity: 0.7,
                    letterSpacing: "0.02em",
                  }}
                >
                  N°{nStr}
                </span>

                {/* Corner brackets — reveal on hover */}
                {[
                  { top: -1, left: -1, rotate: 0 },
                  { top: -1, right: -1, rotate: 90 },
                  { bottom: -1, right: -1, rotate: 180 },
                  { bottom: -1, left: -1, rotate: 270 },
                ].map(({ rotate, ...pos }, bi) => (
                  <span
                    key={`brk-${bi}`}
                    aria-hidden="true"
                    className="n02-rev-bracket"
                    style={{
                      position: "absolute",
                      ...pos,
                      width: 20,
                      height: 20,
                      transform: `rotate(${rotate}deg)`,
                      transformOrigin: "center",
                      pointerEvents: "none",
                      opacity: 0,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M20 0 H4 A4 4 0 0 0 0 4 V20" stroke={TAUPE} strokeWidth="1" fill="none"/>
                    </svg>
                  </span>
                ))}

                {/* 5-star row */}
                <div aria-hidden="true" style={{
                  display: "flex",
                  gap: 3,
                  color: TAUPE,
                  fontSize: "0.82rem",
                  letterSpacing: "0.15em",
                }}>
                  ★★★★★
                </div>

                {/* Big italic quote glyph */}
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "4.5rem",
                    lineHeight: 0.4,
                    color: TAUPE,
                    opacity: 0.6,
                    marginTop: -8,
                  }}
                >
                  “
                </span>

                <blockquote
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "1.28rem",
                    lineHeight: 1.55,
                    color: CREAM,
                    flex: 1,
                    letterSpacing: "0.005em",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.quote`} value={r.quote} tag="span" />
                </blockquote>

                <div aria-hidden="true" style={{ width: 42, height: 1, backgroundColor: TAUPE, opacity: 0.55 }} />

                {/* Author block with verified badge */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: TAUPE,
                        textTransform: "uppercase",
                        letterSpacing: "0.28em",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`reviews.${i}.author`} value={r.author} tag="span" />
                    </span>
                    {r.meta && (
                      <span
                        style={{
                          fontFamily: SERIF,
                          fontStyle: "italic",
                          fontSize: "0.9rem",
                          fontWeight: 400,
                          color: "rgba(246,239,233,0.55)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`reviews.${i}.meta`} value={r.meta} tag="span" />
                      </span>
                    )}
                  </div>
                  <span
                    aria-label="Ověřená recenze"
                    title="Ověřená recenze"
                    style={{
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border: `1px solid ${TAUPE}55`,
                      color: TAUPE,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Rating hero + secondary */}
        <div style={{
          marginTop: "clamp(64px, 8vw, 96px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}>
          <a
            href={ratingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="n02-rev-rating"
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 14,
              color: CREAM,
              textDecoration: "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(3rem, 4.5vw, 4rem)",
                lineHeight: 0.9,
                color: TAUPE,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ratingScore" value={ratingScore} tag="span" />
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: "0.82rem",
                fontWeight: 500,
                color: CREAM,
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                opacity: 0.85,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ratingText" value={ratingText} tag="span" />
            </span>
          </a>
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="n02-rev-secondary"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "1rem",
              color: TAUPE,
              textDecoration: "none",
              opacity: 0.8,
              paddingBottom: 4,
              borderBottom: `1px solid ${TAUPE}70`,
              transition: "opacity 0.3s ease, border-color 0.3s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="secondaryText" value={secondaryText} tag="span" />
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <style>{`
        .n02-rev-card:hover {
          transform: translateY(-6px);
          border-color: rgba(212,160,128,0.5);
          background-color: rgba(246,239,233,0.06);
        }
        .n02-rev-card:hover .n02-rev-bracket { opacity: 1; }
        .n02-rev-secondary:hover { opacity: 1; border-bottom-color: ${CREAM}; }
        .n02-rev-rating:hover { opacity: 0.85; }
        @media (max-width: 900px) {
          .nails02-reviews-grid { grid-template-columns: 1fr !important; }
          .n02-rev-eyebrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}

// ── nails-03-testimonials ──────────────────────────────────────────────────────
// Cream bg, centred header (kicker + H2), 3 cards in row with large brown quote
// glyph, italic quote text, author name, meta. Google rating link at bottom.
// ──────────────────────────────────────────────────────────────────────────────
function TestimonialsNails03({
  content,
  sectionId,
}: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const CREAM = "#FCF9F0";
  const DARK  = "#0B090C";
  const BROWN = "#806248";
  const FONT  = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  const title      = String(content.title      ?? "Recenze");
  const kicker     = String(content.kicker     ?? "Co o nás říkají klientky");
  const ratingText = String(content.ratingText ?? "4.9 / 5 hodnocení na Google");
  const ratingHref = String(content.ratingHref ?? "#");
  const reviews = ((content.reviews as Array<{ quote: string; author: string; meta?: string }>) ?? []);

  return (
    <section
      data-section-type="testimonials"
      data-variant="nails-03-testimonials"
      style={{ backgroundColor: CREAM, padding: "clamp(64px, 9vw, 104px) clamp(24px, 6vw, 80px)" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
        <p style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: BROWN,
          margin: "0 0 16px",
        }}>
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
          color: DARK,
          margin: 0,
          letterSpacing: "0.02em",
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
      </div>

      {/* Cards grid */}
      <div className="nails03-reviews-grid" style={{
        maxWidth: 1120,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "clamp(16px, 2.5vw, 28px)",
      }}>
        {reviews.map((r, i) => (
          <div key={i} style={{
            backgroundColor: "#fff",
            border: `1px solid rgba(128,98,72,0.12)`,
            borderRadius: 4,
            padding: "clamp(28px, 3vw, 40px)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {/* Large quote glyph */}
            <span aria-hidden="true" style={{
              fontFamily: "Georgia, serif",
              fontSize: "4rem",
              color: BROWN,
              lineHeight: 0.8,
              opacity: 0.35,
              userSelect: "none",
            }}>"</span>

            {/* Quote text */}
            <p style={{
              fontFamily: FONT,
              fontSize: "0.95rem",
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.7,
              color: DARK,
              margin: 0,
              flex: 1,
            }}>
              <GenericEditableText sectionId={sectionId} field={`reviews.${i}.quote`} value={r.quote} tag="span" />
            </p>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: `${BROWN}22` }} />

            {/* Author */}
            <div>
              <p style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "0.88rem",
                color: DARK,
                margin: "0 0 4px",
              }}>
                <GenericEditableText sectionId={sectionId} field={`reviews.${i}.author`} value={r.author} tag="span" />
              </p>
              {r.meta && (
                <p style={{
                  fontFamily: FONT,
                  fontSize: "0.78rem",
                  color: BROWN,
                  margin: 0,
                  opacity: 0.8,
                }}>
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.meta`} value={r.meta} tag="span" />
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Google rating */}
      <div style={{ textAlign: "center", marginTop: "clamp(40px, 5vw, 56px)" }}>
        <a
          href={ratingHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: FONT,
            fontSize: "0.82rem",
            fontWeight: 600,
            color: BROWN,
            letterSpacing: "0.06em",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            paddingBottom: 3,
            borderBottom: `1px solid ${BROWN}55`,
          }}
        >
          ★ <GenericEditableText sectionId={sectionId} field="ratingText" value={ratingText} tag="span" />
        </a>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .nails03-reviews-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 540px) and (max-width: 860px) {
          .nails03-reviews-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

// ── clinic-02-testimonials ─────────────────────────────────────────────────
// Navy bg + amber kicker + cream H2 + Google rating badge; 3 white cards with
// quotation-mark watermark, amber stars, avatar+author.
function TestimonialsClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#0F203E";
  const NAVY_D = "#0a172e";
  const AMBER  = "#ffa60b";
  const CREAM  = "#fffaf2";
  const MUTED  = "#5b6478";
  const WHITE  = "#FFFFFF";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title        = String(content.title  ?? "Co o nás říkají klientky");
  const kicker       = String(content.kicker ?? "5,0 hvězdiček na Google");
  const googleRating = String((content as Record<string,unknown>).googleRating ?? "5,0");
  const googleCount  = String((content as Record<string,unknown>).googleCount  ?? "482 recenzí");
  const testimonials = Array.isArray(content.testimonials)
    ? (content.testimonials as Array<{ text?: string; author?: string; role?: string; rating?: number }>)
    : [];

  const Stars = ({ n }: { n: number }) => (
    <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill={i < n ? AMBER : "rgba(15,32,62,0.15)"} style={{ flexShrink: 0 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section
      id="recenze"
      data-template="clinic-02"
      style={{
        backgroundColor: NAVY,
        padding: "clamp(72px,9vw,120px) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle navy gradient overlay */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at top, ${NAVY} 0%, ${NAVY_D} 100%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "0 clamp(24px,5vw,60px)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(48px,6vw,72px)" }}>
          <p style={{
            fontFamily: FONT_B, fontSize: "0.75rem", fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase", color: AMBER, margin: "0 0 18px",
            display: "inline-flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            <span style={{ width: 28, height: 1, backgroundColor: AMBER }} />
          </p>
          <h2 style={{
            fontFamily: FONT_H, fontSize: "clamp(1.9rem,3.6vw,2.8rem)", fontWeight: 700,
            color: CREAM, margin: "0 0 32px", letterSpacing: "-0.005em",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          {/* Google badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 16,
            backgroundColor: WHITE, color: NAVY,
            padding: "12px 22px", borderRadius: 999,
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
          }}>
            <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.4-17.7 10.7z"/>
              <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.6 37.3 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.7 41.4 15.3 46 24 46z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.9 6.3l6.7 5.5C41.5 37 44.5 31 44.5 24c0-1.3-.2-2.7-.5-4z"/>
            </svg>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: FONT_H, fontSize: "1.15rem", fontWeight: 800, lineHeight: 1 }}>
                <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={AMBER}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <span style={{ fontFamily: FONT_B, fontSize: "0.78rem", color: MUTED, fontWeight: 600 }}>
                <GenericEditableText sectionId={sectionId} field="googleCount" value={googleCount} tag="span" />
              </span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="c02-testi-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "clamp(20px,2.4vw,28px)",
        }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="c02-testi-card"
              style={{
                position: "relative",
                backgroundColor: WHITE,
                borderRadius: 6,
                padding: "clamp(30px,3.4vw,40px)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 16px 40px -12px rgba(0,0,0,0.28)",
                transition: "transform .3s ease, box-shadow .3s ease",
                overflow: "hidden",
              }}
            >
              {/* Decorative quote mark watermark */}
              <span aria-hidden style={{
                position: "absolute", top: -22, right: 14,
                fontFamily: "Georgia, serif", fontSize: "9rem",
                fontWeight: 700, color: "rgba(255,166,11,0.12)",
                lineHeight: 1, pointerEvents: "none", userSelect: "none",
              }}>"</span>

              <Stars n={t.rating ?? 5} />
              <p style={{
                fontFamily: FONT_B, fontSize: "0.94rem", color: "#3a414f",
                lineHeight: 1.75, margin: "0 0 28px", flex: 1,
                position: "relative", zIndex: 1,
              }}>
                „<GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" />"
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                borderTop: "1px solid rgba(15,32,62,0.10)",
                paddingTop: 22,
                position: "relative", zIndex: 1,
              }}>
                {/* Avatar circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${NAVY} 0%, #1a3361 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONT_H, fontSize: "0.94rem", fontWeight: 700, color: AMBER,
                  flexShrink: 0,
                  boxShadow: `0 4px 10px rgba(15,32,62,0.18)`,
                }}>
                  {(t.author ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: FONT_H, fontSize: "0.94rem", fontWeight: 700, color: NAVY, marginBottom: 2 }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" />
                  </div>
                  {t.role && (
                    <div style={{ fontFamily: FONT_B, fontSize: "0.76rem", color: MUTED, letterSpacing: "0.02em" }}>
                      <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role} tag="span" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .c02-testi-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 50px -12px rgba(0,0,0,0.4);
        }
        @media (max-width: 860px) {
          #recenze .c02-testi-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          #recenze .c02-testi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── fitness-01-testimonials-2col ──────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — 2-col testimonials nad soft warm-surface bg
// Header: rail 05 + eyebrow + H2 italic accent + subheading + Google badge s hvězdami
// Karty: warm-cream bg, italic serif intro-quote overlay, decorative mark ",
// Roboto body 300, hairline top před autorem, author name Instrument Serif italic,
// stagger reveal, hover subtle lift + border tint
// ────────────────────────────────────────────────────────────────────────────
function TestimonialsFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  interface Item { text: string; author: string; role?: string; stars?: number; }
  const items         = ((content as { items?: Item[] }).items ?? []) as Item[];
  const sectionTag    = String(content.sectionTag    ?? "Reference");
  const eyebrowMark   = String(content.eyebrowMark   ?? "05");
  const headingPre    = String(content.headingPre    ?? "Klienti,");
  const headingAccent = String(content.headingAccent ?? "kteří se vrátili");
  const headingPost   = String(content.headingPost   ?? "k pohybu");
  const subheading    = String(content.subheading    ?? "");
  const googleRating  = String(content.googleRating  ?? "5.0");
  const googleCount   = String(content.googleCount   ?? "84 recenzí");
  const googleLabel   = String(content.googleLabel   ?? "Průměr na Google");
  const showHeader    = (content as { showHeader?: boolean }).showHeader !== false;

  const Stars = ({ n = 5 }: { n?: number }) => (
    <div className="fit01-t-stars" aria-label={`Hodnocení ${n} z 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id="recenze" className="fit01-testi" data-template="fitness-01">
      <div className="fit01-testi-inner">
        {showHeader && (
          <div className="fit01-testi-header">
            <div className="fit01-testi-copy">
              <div className="fit01-services-rail" aria-hidden="true">
                <span className="fit01-rail-line" />
                <span className="fit01-rail-mark">{eyebrowMark}</span>
              </div>
              <div className="fit01-services-eyebrow">
                <span className="fit01-tagline-mark" aria-hidden="true" />
                <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
              </div>
              <h2 className="fit01-services-h2">
                <span className="fit01-h2-line">
                  <GenericEditableText sectionId={sectionId} field="headingPre" value={headingPre} tag="span" />
                </span>
                <span className="fit01-h2-line fit01-h2-line-accent">
                  <span className="fit01-h2-accent">
                    <GenericEditableText sectionId={sectionId} field="headingAccent" value={headingAccent} tag="span" />
                  </span>{" "}
                  <span className="fit01-h2-post">
                    <GenericEditableText sectionId={sectionId} field="headingPost" value={headingPost} tag="span" />
                  </span>
                </span>
              </h2>
              {subheading && (
                <p className="fit01-services-sub">
                  <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                </p>
              )}
            </div>
            <div className="fit01-google-badge">
              <div className="fit01-google-mark" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.4-17.7 10.7z"/><path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.6 37.3 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.7 41.4 15.3 46 24 46z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.9 6.3l6.7 5.5C41.5 37 44.5 31 44.5 24c0-1.3-.2-2.7-.5-4z"/></svg>
              </div>
              <div className="fit01-google-body">
                <div className="fit01-google-rating">
                  <span className="fit01-google-value">
                    <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
                  </span>
                  <div className="fit01-google-stars"><Stars n={5} /></div>
                </div>
                <div className="fit01-google-label">
                  <span>
                    <GenericEditableText sectionId={sectionId} field="googleLabel" value={googleLabel} tag="span" />
                  </span>
                  <span className="fit01-google-count">
                    ·{" "}
                    <GenericEditableText sectionId={sectionId} field="googleCount" value={googleCount} tag="span" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="fit01-testi-grid">
          {items.map((item, i) => (
            <article key={i} className="fit01-testi-card" style={{ ["--i" as string]: i }}>
              <span className="fit01-testi-mark" aria-hidden="true">&ldquo;</span>
              <div className="fit01-testi-stars-row">
                <Stars n={item.stars ?? 5} />
                <span className="fit01-testi-verified" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                  Ověřeno
                </span>
              </div>
              <p className="fit01-testi-text">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>
              <div className="fit01-testi-foot">
                <div className="fit01-testi-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </div>
                {item.role && (
                  <div className="fit01-testi-role">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── fyzio-02-testimonials ─────────────────────────────────────────────────────
// Navy #092029 band, split header (text + teal Google rating badge), 3 glassy
// karty s teal uvozovkou + hvězdami + initial avatar. Reveal on scroll. Movia.
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { author?: string; role?: string; text?: string; rating?: number };
  const id          = String(content.id          ?? "reference");
  const rating      = String(content.rating      ?? "4,9");
  const ratingLabel = String(content.ratingLabel ?? "Hodnocení na Google");
  const items       = ((content.items ?? content.testimonials) as Item[]) ?? [];

  // conditional header
  const eyebrowRaw = (content as Record<string, unknown>).tagline;
  const titleRaw   = (content as Record<string, unknown>).title;
  const bodyRaw    = (content as Record<string, unknown>).body;
  const tagline = eyebrowRaw === undefined ? "Reference" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Výsledky, které klienti cítí" : String(titleRaw);
  const body    = bodyRaw    === undefined ? "Přes 8 500 spokojených klientů. Přečtěte si, co jim terapie v Movii přinesla." : String(bodyRaw);
  const showHeader = !!(tagline.trim() || title.trim() || body.trim());

  const secRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = secRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("fz2-vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.14 });
    el.querySelectorAll<HTMLElement>("[data-fz2ts]").forEach(i => obs.observe(i));
    return () => obs.disconnect();
  }, []);

  const Stars = ({ count = 5 }: { count?: number }) => (
    <div className="fz2-ts-stars" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < count ? "currentColor" : "rgba(127,208,201,0.28)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section ref={secRef} id={id} data-template="fyzio-02" className="fz2-ts">
      <div className="fz2-ts-glow" aria-hidden="true" />
      <div className="fz2-ts-inner">
        {showHeader && (
          <div className="fz2-ts-head fz2-reveal" data-fz2ts>
            <div className="fz2-ts-head-txt">
              {tagline.trim() && (
                <span className="fz2-ts-pill">
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </span>
              )}
              {title.trim() && (
                <h2 className="fz2-ts-title">
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
              )}
              {body.trim() && (
                <p className="fz2-ts-lead">
                  <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
                </p>
              )}
            </div>

            <div className="fz2-ts-rating">
              <span className="fz2-ts-rating-num">
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </span>
              <Stars count={5} />
              <span className="fz2-ts-rating-label">
                <GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" />
              </span>
            </div>
          </div>
        )}

        <div className="fz2-ts-grid">
          {items.map((item, i) => {
            const author = item.author ?? "";
            const initial = author.trim().charAt(0).toUpperCase() || "•";
            return (
              <article key={i} className="fz2-ts-card fz2-reveal" data-fz2ts style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="fz2-ts-quote" aria-hidden="true">&ldquo;</span>
                <Stars count={item.rating ?? 5} />
                <p className="fz2-ts-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />
                </p>
                <div className="fz2-ts-author">
                  <span className="fz2-ts-avatar" aria-hidden="true">{initial}</span>
                  <span className="fz2-ts-author-meta">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={author} tag="strong" />
                    {(item.role ?? "").trim() && (
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role ?? ""} tag="span" />
                    )}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── reality-03-testimonials ───────────────────────────────────────────────────
// Světle béžový bg (#fcfbf8), velký dekorativní uvozovák vlevo
// Auto-scroll karusel (4 karty, loop): plynule posunuje, pauzuje při hoveru
// Každá karta: hvězdy (5×), text citace, tučné jméno, ochre čára pod jménem
// Scroll entrance: nadpis + uvozovák fade-up, karty fade in zleva
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsReality03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw = (content as Record<string, unknown>).eyebrow;
  const titleRaw   = (content as Record<string, unknown>).title;
  const eyebrow = eyebrowRaw === undefined ? "Spokojení klienti" : String(eyebrowRaw);
  const title   = titleRaw   === undefined ? "Co o nás říkají" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());
  const items = (content.items as Array<{ text: string; author: string; rating?: number; location?: string }>) ?? [];

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const BEIGE = "#fcfbf8";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const [visible, setVisible]   = useState(false);
  const [paused,  setPaused]    = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  const Stars = ({ n = 5 }: { n?: number }) => (
    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? OCHRE : "#ddd"} aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section ref={sectionRef} id="recenze" data-template="reality-03" style={{ backgroundColor: BEIGE, fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) 0", overflow: "hidden" }}>

      {/* Heading */}
      {showHeader && (
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 64px)",
        marginBottom: "clamp(40px, 6vw, 64px)",
        display: "flex", alignItems: "flex-end", gap: 24,
        opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)",
        transition: "opacity 0.65s ease, transform 0.65s ease",
      }}>
        {/* Dekorativní uvozovák */}
        <svg width="72" height="56" viewBox="0 0 72 56" fill="none" aria-hidden style={{ flexShrink: 0, marginBottom: 4 }}>
          <path d="M0 56V36.4C0 24.267 3.2 14.533 9.6 7.2 16 2.4 23.467 0 32 0v9.6c-5.333 0-9.6 1.867-12.8 5.6C16 18.933 14.4 24 14.4 30.4H28V56H0zm44 0V36.4c0-12.133 3.2-21.867 9.6-29.2C60 2.4 67.467 0 76 0v9.6c-5.333 0-9.6 1.867-12.8 5.6C60 18.933 58.4 24 58.4 30.4H72V56H44z" fill={OCHRE} fillOpacity="0.18"/>
        </svg>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: DARK, margin: 0, letterSpacing: "-0.03em" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>
      </div>
      )}

      {/* Karusel track */}
      <div
        style={{ overflow: "hidden", cursor: "default" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: 20,
            width: "max-content",
            animation: `r03Scroll ${items.length * 6}s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease 0.3s",
          }}
        >
          {doubled.map((item, i) => {
            const oi = i % (items.length || 1);
            return (
            <div
              key={`r03-rev-${i}`}
              className="r03-testi-card"
              style={{
                width: "clamp(280px, 28vw, 380px)",
                flexShrink: 0,
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: "clamp(24px, 3vw, 36px)",
                boxShadow: "0 2px 16px rgba(19,37,56,0.07)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s ease",
              }}
            >
              <Stars n={item.rating ?? 5} />
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.72, margin: "0 0 20px", flex: 1, fontStyle: "italic" }}>
                „<GenericEditableText sectionId={sectionId} field={`items.${oi}.text`} value={item.text} tag="span" />"
              </p>
              <div>
                <GenericEditableText sectionId={sectionId} field={`items.${oi}.author`} value={item.author} tag="p" style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: "0 0 4px" }} />
                {item.location && (
                  <GenericEditableText sectionId={sectionId} field={`items.${oi}.location`} value={item.location} tag="p" style={{ fontSize: 12.5, color: "#8a929b", margin: "0 0 8px" }} />
                )}
                <div style={{ width: 28, height: 2, borderRadius: 1, backgroundColor: OCHRE, marginTop: 8 }} />
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes r03Scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

// ── reality-04-testimonials ───────────────────────────────────────────────────
// Světlé #f8f8f8 bg; nadpis vlevo; 3-col grid karet.
// Karta: velká uvozovka #1032CF nahoře + text recenze + hvězdičky zlaté + jméno
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsReality04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const sectionAnchor = String(content.id ?? "recenze");
  const eyebrowRaw  = (content as Record<string, unknown>).eyebrow;
  const titleRaw    = (content as Record<string, unknown>).title;
  const subtitleRaw = (content as Record<string, unknown>).subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Ohlasy klientů" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Napsali o nás" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Skutečné recenze lidí, kterým jsme pomohli s prodejem, koupí nebo pronájmem." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const items = (content.items as Array<{ name: string; rating: number; text: string; role?: string }>) ?? [];

  const PRIMARY = "#1032CF";
  const GREEN   = "#21b276";
  const DARK    = "#141414";
  const MUTED   = "#6b7280";
  const GOLD    = "#f5a623";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

  return (
    <section id={sectionAnchor} style={{ backgroundColor: "#fff", padding: "clamp(56px, 7vw, 100px) 0" }} data-template="reality-04">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        {showHeader && (
          <div style={{ maxWidth: 640, marginBottom: "clamp(32px, 4vw, 52px)" }}>
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p"
                style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: GREEN, margin: "0 0 12px" }} />
            )}
            {title.trim() && (
              <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 700, color: DARK, margin: "0 0 14px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
            {subtitle.trim() && (
              <p style={{ fontFamily: SANS, fontSize: 16.5, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
          </div>
        )}

        <div className="r04-testi-grid">
          {items.map((item, i) => (
            <div key={i} className="r04-testi-card">
              {/* Velká uvozovka */}
              <span className="r04-testi-quote" aria-hidden="true">&ldquo;</span>
              {/* Hvězdičky */}
              <div style={{ color: GOLD, fontSize: 16, letterSpacing: 2, marginBottom: 14 }}>
                {"\u2605".repeat(Math.min(5, item.rating ?? 5))}
              </div>
              {/* Text recenze */}
              <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.75, color: "#33383f", margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>
              {/* Autor */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #eef0f4", paddingTop: 18, marginTop: 20 }}>
                <span className="r04-testi-avatar">{initials(item.name)}</span>
                <span style={{ display: "block" }}>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: DARK }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                  </span>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 2 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={String(item.role ?? "Spokojený klient")} tag="span" />
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .r04-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 2.5vw, 28px); }
        @media (max-width: 900px) { .r04-testi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .r04-testi-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ── reality-05-testimonials ───────────────────────────────────────────────────
// Ref: ondrejkucera.com — sekce Reference
// Tmavé #1c1c1c bg s bg-image + rgba overlay
// Centrovaný zlatý kicker + bílý H2
// 3-col grid karet: tmavá karta (#222), zlatý uvozovkový glyph, bílý citát, autor #aaa
// Hover: zlatý border-top 3px
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsReality05({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = (content as Record<string,unknown>).eyebrow;
  const titleRaw    = (content as Record<string,unknown>).title;
  const eyebrow  = eyebrowRaw  === undefined ? "Ohlasy klientů" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Reference" : String(titleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim());

  const bgImage  = String(content.bgImage ?? "/templates/reality-05/testi-bg.webp");
  type Item = { text: string; author: string };
  const items = (content.testimonials as Item[]) ?? [];

  const GOLD  = "#CFA968";
  const WHITE = "#ffffff";
  const SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section id="reference" data-template="reality-05" style={{ position: "relative", overflow: "hidden", backgroundColor: "#0a0a0a" }}>
      {/* BG image */}
      <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" style={{ position: "absolute", inset: 0 }}>
        <img loading="lazy" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </GenericEditableImage>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.68) 100%)", zIndex: 1, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "84px clamp(20px,5vw,60px) 88px" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            {eyebrow.trim() && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span"
                style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: GOLD, display: "block", marginBottom: 14 }}
              />
            )}
            {title.trim() && (
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
                style={{ fontFamily: SANS, fontSize: "clamp(26px,3vw,38px)", fontWeight: 700, color: WHITE, margin: "0 0 14px", lineHeight: 1.2 }}
              />
            )}
            <div style={{ width: 40, height: 2, backgroundColor: GOLD, margin: "0 auto", opacity: 0.5 }} />
          </div>
        )}

        {/* Cards grid */}
        <div className="r05-testi-grid">
          {items.map((item, i) => (
            <div key={i} className="r05-testi-card" style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(207,169,104,0.1)",
              padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16,
              position: "relative" as const,
              transition: "border-color 0.3s, background-color 0.3s, transform 0.3s",
            }}>
              {/* Gold top accent line */}
              <div style={{ position: "absolute", top: 0, left: 28, right: 28, height: 2, backgroundColor: GOLD, opacity: 0, transition: "opacity 0.3s" }} className="r05-testi-accent" />
              {/* Quote mark */}
              <span style={{ fontFamily: "Georgia, serif", fontSize: 52, lineHeight: 0.8, color: GOLD, display: "block", opacity: 0.6 }}>&ldquo;</span>
              <GenericEditableText
                sectionId={sectionId} field={`testimonials.${i}.text`} value={item.text} tag="p"
                style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.85)", margin: 0, flex: 1, fontStyle: "italic" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <div style={{ width: 20, height: 1, backgroundColor: GOLD, opacity: 0.5 }} />
                <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={item.author} tag="span"
                  style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", textTransform: "uppercase" as const }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── reality-06-testimonials ───────────────────────────────────────────────────
function TestimonialsReality06({
  content, sectionId, isAdmin, tenantSlug,
}: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean; tenantSlug?: string }) {
  const PRIMARY = "#263A82";
  const BG = "#F0F0F8";

  const title = (content as { title?: string }).title ?? "Co říkají moji klienti";
  const items = ((content as { testimonials?: { name?: string; rating?: number; text?: string }[] }).testimonials ?? []);

  return (
    <section id="reference" style={{ backgroundColor: BG, padding: "80px 0" }} data-template="reality-06-testimonials">
      <style>{`
        .r06-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .r06-testi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .r06-testi-grid { grid-template-columns: 1fr; } }
        .r06-testi-card { background: #fff; border-radius: 12px; padding: 28px 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 12px rgba(38,58,130,0.07); transition: box-shadow 0.2s, transform 0.2s; }
        .r06-testi-card:hover { box-shadow: 0 6px 28px rgba(38,58,130,0.14); transform: translateY(-3px); }
      `}</style>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <GenericEditableText
            sectionId={sectionId} field="title" value={title} tag="h2"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "clamp(26px,4vw,34px)", fontWeight: 700, color: PRIMARY, margin: 0 }}
          />
        </div>

        {/* Cards */}
        <div className="r06-testi-grid">
          {items.map((item, i) => (
            <div key={i} className="r06-testi-card">
              {/* Uvozovkový glyph */}
              <span style={{ fontFamily: "Georgia, serif", fontSize: 64, lineHeight: 1, color: PRIMARY, opacity: 0.18, display: "block", marginBottom: -16 }}>&ldquo;</span>

              {/* Hvězdičky */}
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                  <span key={s} style={{ color: "#FBBC04", fontSize: 18 }}>★</span>
                ))}
              </div>

              {/* Text recenze */}
              <GenericEditableText
                sectionId={sectionId} field={`testimonials.${i}.text`} value={item.text ?? ""} tag="p"
                style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 15, lineHeight: 1.7, color: "#333", margin: 0, flex: 1, fontStyle: "italic" }}
              />

              {/* Autor */}
              <p style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: PRIMARY }}>
                — <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={item.name ?? ""} tag="span" />
              </p>
            </div>
          ))}
        </div>

        {/* Google rating footer */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 100, padding: "10px 24px", boxShadow: "0 2px 10px rgba(38,58,130,0.1)" }}>
            {/* Google G */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#141414" }}>5,0</span>
            <span style={{ display: "flex", gap: 1 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#FBBC04", fontSize: 16 }}>★</span>)}
            </span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#666" }}>Google recenze</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── autoservis-03-testimonials ────────────────────────────────────────────────
function TestimonialsAutoservis03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const SANS = "'Inter', 'Helvetica Neue', sans-serif";
  const ORANGE = "#f97316";

  const tagline = (content.tagline as string) || "Co říkají naši zákazníci";
  const title = (content.title as string) || "Recenze spokojených klientů";
  const items = (content.items as Array<{ name: string; rating: number; date?: string; text: string; source?: string }>) || [];
  const googleUrl = (content.googleReviewUrl as string) || "#";

  return (
    <section
      id={(content.id as string) || "recenze"}
      data-template="autoservis-03-testimonials"
      style={{ backgroundColor: "#000", padding: "100px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ORANGE }}>
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 900, color: "#fff", margin: "12px 0 0", lineHeight: 1.2, whiteSpace: "pre-line" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: item.rating || 5 }).map((_, s) => (
                  <span key={s} style={{ color: "#FBBC04", fontSize: 18 }}>★</span>
                ))}
              </div>
              <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.75, color: "#d1d5db", margin: 0, flex: 1 }}>
                &ldquo;{item.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.name}</div>
                  {item.date && <div style={{ fontFamily: SANS, fontSize: 12, color: "#6b7280" }}>{item.date}</div>}
                </div>
                {item.source === "Google" && (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, border: "1px solid rgba(249,115,22,0.4)", borderRadius: 999, padding: "12px 28px", color: ORANGE, fontFamily: SANS, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "border-color 0.2s, background 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(249,115,22,0.08)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = ORANGE; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(249,115,22,0.4)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Přečíst všechny recenze na Google
          </a>
        </div>
      </div>
    </section>
  );
}

// ── ortho-01-testimonials ──────────────────────────────────────────────────────
// Porcelain V3: wash split karta — foto lékaře vlevo, velký Young Serif citát
// + authorName/authorRole/authorBio vpravo.
function TestimonialsOrtho01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const quote      = String(content.quote      ?? "Moderní ortodoncie dnes umožňuje dosáhnout krásného a zdravého úsměvu v jakémkoli věku.");
  const authorName = String(content.authorName ?? "Dr. Jan Demo");
  const authorRole = String(content.authorRole ?? "Zakladatel kliniky");
  const authorBio  = String(content.authorBio  ?? "");
  const imageUrl   = String(content.imageUrl   ?? "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=760&h=900&fit=crop&auto=format&q=80");

  return (
    <section data-section-type="testimonials" data-variant="ortho-01-testimonials" className="o01tm-section">
      <style>{`
        .o01tm-section {
          background: var(--color-bg, #FAFAF8);
          padding: clamp(3.5rem, 8vw, 6.5rem) 0;
          font-family: 'Outfit', sans-serif;
        }
        .o01tm-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .o01tm-card {
          display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
          background: #E9F4F1; border-radius: 20px; overflow: hidden;
          border: 1px solid var(--color-border, #E4E7E3);
        }
        .o01tm-media { position: relative; min-height: 22rem; }
        .o01tm-media-wrap { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .o01tm-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .o01tm-body {
          padding: clamp(2rem, 4.5vw, 3.6rem);
          display: flex; flex-direction: column; justify-content: center;
        }
        .o01tm-mark {
          font-family: 'Young Serif', serif; font-size: 3.4rem; line-height: 1;
          color: var(--color-primary, #0F766E); margin: 0 0 0.6rem;
        }
        .o01tm-quote {
          font-family: 'Young Serif', serif; font-weight: 400;
          font-size: clamp(1.35rem, 2.4vw, 1.85rem); color: var(--color-text, #14201E);
          line-height: 1.35; margin: 0 0 1.6rem; text-wrap: balance;
        }
        .o01tm-author { border-top: 1px solid rgba(15,118,110,0.22); padding-top: 1.2rem; }
        .o01tm-name { font-size: 1rem; font-weight: 700; color: var(--color-text, #14201E); margin: 0; }
        .o01tm-role { font-size: 0.86rem; font-weight: 600; color: var(--color-primary, #0F766E); margin: 0.15rem 0 0; }
        .o01tm-bio { font-size: 0.92rem; color: var(--color-text-muted, #5F6B68); line-height: 1.6; margin: 0.7rem 0 0; }
        @media (max-width: 860px) {
          .o01tm-card { grid-template-columns: 1fr; }
          .o01tm-media { min-height: 17rem; }
        }
      `}</style>
      <div className="o01tm-inner">
        <figure className="o01tm-card" style={{ margin: 0 }}>
          <div className="o01tm-media">
            <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={authorName} className="o01tm-media-wrap">
              <img src={imageUrl} alt={authorName} loading="lazy" />
            </GenericEditableImage>
          </div>
          <div className="o01tm-body">
            <span className="o01tm-mark" aria-hidden>&ldquo;</span>
            <blockquote className="o01tm-quote" style={{ fontFamily: "'Young Serif', serif", color: "var(--color-text, #14201E)" }}>
              <GenericEditableText sectionId={sectionId} field="quote" value={quote} tag="span" />
            </blockquote>
            <figcaption className="o01tm-author">
              <p className="o01tm-name">
                <GenericEditableText sectionId={sectionId} field="authorName" value={authorName} tag="span" />
              </p>
              <p className="o01tm-role">
                <GenericEditableText sectionId={sectionId} field="authorRole" value={authorRole} tag="span" />
              </p>
              {authorBio && (
                <p className="o01tm-bio">
                  <GenericEditableText sectionId={sectionId} field="authorBio" value={authorBio} tag="span" />
                </p>
              )}
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}

// ── ortho-02-testimonials ─────────────────────────────────────────────────────
function TestimonialsOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BEIGE  = "#B7B3A5";
  const DARK   = "#1a1a1a";
  const MUTED  = "#777";
  const GOLD   = "#b39f6b";
  const FONT   = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Raleway', Arial, sans-serif";

  const eyebrowRaw  = (content as Record<string,unknown>).subheading;
  const titleRaw    = (content as Record<string,unknown>).heading;
  const bodyRaw     = (content as Record<string,unknown>).body;
  const eyebrow  = eyebrowRaw === undefined ? "Co říkají pacienti" : String(eyebrowRaw);
  const title    = titleRaw   === undefined ? "Úsměvy, které mluví za vše" : String(titleRaw);
  const body     = bodyRaw    === undefined ? "Přečtěte si zkušenosti těch, kteří naší péčí prošli." : String(bodyRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || body.trim());

  type Item = { author: string; handle: string; text: string; rating: number };
  const rawItems = (content.items ?? []) as Item[];
  const defaultItems: Item[] = [
    { author: "Markéta V.", handle: "pacientka · alignery", text: "Neviditelné rovnátka splnily přesně to, co jsem si přála. Po deseti měsících mám úsměv, za který se nestydím. Celý tým byl neuvěřitelně vstřícný.", rating: 5 },
    { author: "Petr K.",    handle: "pacient · klasická",   text: "Jako dospělý jsem váhal, jestli není pozdě na rovnátka. Dnes vím, že to bylo jedno z nejlepších rozhodnutí. Profesionální přístup od první konzultace.", rating: 5 },
    { author: "Lucie N.",   handle: "maminka · dětská",     text: "Syn se léčby zpočátku bál, ale tady ho vždy přivítali s trpělivostí a milým slovem. Výsledek je skvělý a celá rodina je nadšená.",                   rating: 5 },
  ];
  const items: Item[] = (Array.isArray(rawItems) && rawItems.length > 0) ? rawItems : defaultItems;

  return (
    <section
      id="reference"
      data-template="ortho-02"
      style={{ backgroundColor: "#faf9f7", padding: "clamp(72px, 9vw, 120px) 0", fontFamily: FONT }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 16 }}>
              <GenericEditableText sectionId={sectionId} field="subheading" value={eyebrow} tag="span" />
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)", fontWeight: 300, color: DARK, margin: "0 auto 18px", lineHeight: 1.3, maxWidth: 700 }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={title} tag="span" />
            </h2>
            <p style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.02rem)", color: MUTED, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto", fontFamily: FONT_B, lineHeight: 1.7 }}>
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          </div>
        )}

        <div className="o02-testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(16px, 2vw, 28px)" }}>
          {items.map((item, i) => (
            <div key={i} className="o02-testi-card" style={{
              border: "1px solid #edeae5",
              borderRadius: 6,
              padding: "clamp(28px, 3.5vw, 40px)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              backgroundColor: "#ffffff",
              transition: "transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
            }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                  <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={GOLD} aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote style={{ margin: 0, padding: 0, flex: 1 }}>
                <p style={{ fontSize: "clamp(0.88rem, 1.1vw, 0.95rem)", color: "#555", lineHeight: 1.75, fontStyle: "italic", margin: 0, fontFamily: FONT_B }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />&rdquo;
                </p>
              </blockquote>

              {/* Author */}
              <div style={{ borderTop: "1px solid #edeae5", paddingTop: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                <p style={{ fontSize: "0.92rem", fontWeight: 600, color: DARK, margin: 0, fontFamily: FONT }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </p>
                <p style={{ fontSize: "0.78rem", fontWeight: 500, color: BEIGE, letterSpacing: "0.04em", margin: 0, fontFamily: FONT }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.handle`} value={item.handle} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stavba-01 Testimonials ───────────────────────────────────────────────────
function TestimonialsStavba01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const BG     = "#f8f7f4";
  const FONT   = "'Inter', sans-serif";

  interface Item { name: string; role?: string; text: string; stars?: number; }

  const taglineRaw = content.tagline;
  const titleRaw   = content.title;
  const tagline = taglineRaw === undefined ? "Co říkají klienti" : String(taglineRaw);
  const title   = titleRaw   === undefined ? "Reference\nnaších zákazníků" : String(titleRaw);
  const showHeader = !!(tagline.trim() || title.trim());
  const rating      = String(content.rating      ?? "4.9");
  const reviewCount = String(content.reviewCount ?? "");
  const reviewSuffix = String(content.reviewSuffix ?? "recenzí");
  const items       = (content.items as Item[]) ?? [];

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".s01-testi-card"));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.animationDelay = `${Math.max(0, cards.indexOf(el)) * 0.1}s`;
          el.classList.add("s01-testi-vis");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.14 });
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [items.length]);

  const Stars = ({ count = 5 }: { count?: number }) => (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? ORANGE : "#e0e0e0"} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id={String(content.id ?? "recenze")} style={{ backgroundColor: BG, fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header row */}
        {(showHeader || reviewCount) && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56, gap: 24, flexWrap: "wrap" }}>
          {showHeader && (
          <div>
            {tagline.trim() && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ display: "block", width: 30, height: 3, backgroundColor: ORANGE, borderRadius: 2 }} />
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="p"
                  style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }} />
              </div>
            )}
            {title.trim() && (
              <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, whiteSpace: "pre-line" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
            )}
          </div>
          )}
          {/* Rating badge */}
          {reviewCount && (
          <div className="s01-testi-rating" style={{ display: "flex", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 12, padding: "16px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: DARK, lineHeight: 1 }}>
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </div>
              <div style={{ marginTop: 4 }}><Stars /></div>
              <div style={{ color: GRAY, fontSize: "0.75rem", marginTop: 4 }}>
                <GenericEditableText sectionId={sectionId} field="reviewCount" value={reviewCount} tag="span" />{" "}
                <GenericEditableText sectionId={sectionId} field="reviewSuffix" value={reviewSuffix} tag="span" />
              </div>
            </div>
          </div>
          )}
        </div>
        )}

        {/* Cards */}
        <div ref={gridRef} className="stavba-testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} className="s01-testi-card" style={{ backgroundColor: "#fff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* Decorative quote glyph */}
              <span className="s01-testi-quote" aria-hidden="true" style={{ position: "absolute", top: 14, right: 24, fontSize: "5rem", lineHeight: 1, fontFamily: "Georgia, serif", fontWeight: 700, pointerEvents: "none" }}>&rdquo;</span>
              {/* Stars */}
              <Stars count={item.stars ?? 5} />
              {/* Quote */}
              <p style={{ color: DARK, fontSize: "0.925rem", lineHeight: 1.75, margin: 0, flex: 1, position: "relative", zIndex: 1 }}>
                &bdquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />&ldquo;
              </p>
              {/* Author */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, position: "relative", zIndex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: DARK }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </div>
                {item.role && (
                  <div style={{ color: GRAY, fontSize: "0.8rem", marginTop: 2 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
      <style>{`
        @media (max-width: 900px) { .stavba-testi-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .stavba-testi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ─── STAVBA-03 TESTIMONIALS ───────────────────────────────────────────────────
function TestimonialsStavba03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#fa7d19";
  const DARK = "#1b1a1a";
  const GRAY = "#666";
  const FONT = "'Roboto', sans-serif";

  const kicker = (content.kicker as string) ?? "Recenze";
  const heading = (content.heading as string) ?? "Co říkají naši zákazníci";
  const rawItems = Array.isArray(content.items) ? content.items : [];

  interface TItem { quote?: string; name?: string; role?: string; stars?: number; }
  const items: TItem[] = rawItems.map((x: unknown) => x as TItem);

  function Stars({ count = 5 }: { count?: number }) {
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? ORANGE : "#e0e0e0"}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  }

  function QuoteIcon() {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <path d="M9.333 20C7.493 20 6 18.507 6 16.667V14c0-3.682 2.985-6.667 6.667-6.667V10c-1.84 0-3.334 1.493-3.334 3.333H12c1.84 0 3.333 1.494 3.333 3.334V18c0 1.84-1.493 3.333-3.333 3.333H9.333zM22.667 20c-1.84 0-3.334-1.493-3.334-3.333V14c0-3.682 2.986-6.667 6.667-6.667V10c-1.84 0-3.333 1.493-3.333 3.333H25.333c1.84 0 3.334 1.494 3.334 3.334V18c0 1.84-1.494 3.333-3.334 3.333h-2.666z" fill={ORANGE} fillOpacity="0.25"/>
      </svg>
    );
  }

  return (
    <section style={{ background: "#f4f4f4", padding: "90px 0", fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: ORANGE, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ color: DARK, fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <div style={{ width: 48, height: 3, background: ORANGE, borderRadius: 2, margin: "18px auto 0" }} />
        </div>

        {/* Cards */}
        <div className="stavba03-testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 0,
              padding: "36px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderTop: `3px solid ${ORANGE}`,
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Stars count={item.stars ?? 5} />
                <QuoteIcon />
              </div>
              <p style={{ color: DARK, fontSize: "0.915rem", lineHeight: 1.78, margin: 0, flex: 1 }}>
                „<GenericEditableText sectionId={sectionId} field={`items.${i}.quote`} value={item.quote ?? ""} tag="span" />"
              </p>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 18 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: DARK }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" />
                </div>
                {item.role && (
                  <div style={{ color: GRAY, fontSize: "0.8rem", marginTop: 3 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
      <style>{`
        @media (max-width: 900px) { .stavba03-testi-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .stavba03-testi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── stavba-02-testimonials ────────────────────────────────────────────────────
// White bg, centered H2 + subtitle, 3-col cards with brown quote + italic text
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsStavba02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BROWN = "#674832";
  const DARK  = "#2D1A0F";
  const MUTED = "#7A6454";
  const FONT  = "'Roboto', sans-serif";

  const sectionId2 = String(content.id       ?? "reference");
  const title      = String(content.title    ?? "Naši spokojení klienti");
  const subtitle   = String(content.subtitle ?? "");

  type TItem = { text: string; name: string; location?: string };
  const defaultItems: TItem[] = [
    { text: "S firmou jsme byli maximálně spokojení. Celkově skvělá komunikace, termíny byly dodrženy a s kvalitou práce jsme velmi spokojeni.", name: "Demo Klient", location: "Praha" },
    { text: "Firmu bychom doporučili každému, kdo hledá spolehlivou a kvalitní firmu na stavební rekonstrukce. Spolupráce probíhala na velmi profesionální úrovni.", name: "Demo Zákazník", location: "Praha" },
    { text: "Tato firma nám provedla kompletní rekonstrukci. Jsou velmi spolehliví, termíny byly vždy řádně dodrženy. Dobrá profesionální práce za odpovídající cenu.", name: "Demo Referent", location: "Ostrava" },
  ];
  const rawItems = Array.isArray(content.items) ? content.items as Array<Record<string, unknown>> : [];
  const items: TItem[] = rawItems.length > 0
    ? rawItems.map(it => ({ text: String(it.text ?? ""), name: String(it.name ?? ""), location: it.location ? String(it.location) : undefined }))
    : defaultItems;

  return (
    <section id={sectionId2} style={{ backgroundColor: "#fff", fontFamily: FONT, padding: "clamp(64px, 8vw, 100px) 0" }} data-template="stavba-02">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ color: DARK, fontSize: "clamp(24px, 3.2vw, 40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ color: MUTED, fontSize: "clamp(14px, 1.3vw, 16px)", lineHeight: 1.65, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        {/* Cards grid */}
        <div className="s02-testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{ backgroundColor: "#fff", border: "1px solid #D4C9BE", borderRadius: 12, padding: "32px 28px 28px", display: "flex", flexDirection: "column", gap: 20, transition: "box-shadow 0.2s, transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(103,72,50,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Quote mark */}
              <span style={{ fontSize: 48, lineHeight: 1, color: BROWN, fontFamily: "Georgia, serif", display: "block", marginBottom: -8 }}>&ldquo;</span>

              {/* Text */}
              <p style={{ color: MUTED, fontSize: "0.93rem", lineHeight: 1.7, fontStyle: "italic", margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: "#E8E0D8" }} />

              {/* Author */}
              <div>
                <div style={{ color: DARK, fontSize: "0.88rem", fontWeight: 700 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
                </div>
                {item.location && (
                  <div style={{ color: MUTED, fontSize: "0.8rem", marginTop: 2 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={item.location} tag="span" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .s02-testi-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .s02-testi-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function TestimonialsInstala01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const YELLOW = "#FFC527";
  const DARK = "#1e293b";

  const kicker = (content.kicker as string) || "";
  const title = (content.title as string) || "";
  const subtitle = (content.subtitle as string) || "";
  const items = (content.items as Array<{ icon?: string; title?: string; text?: string; description?: string }>) || [];

  function IconBox({ icon }: { icon?: string }) {
    const size = 44;
    const stroke = DARK;
    const iconMap: Record<string, JSX.Element> = {
      "check-circle": (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      "zap": (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      ),
      "tag": (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      ),
    };
    return iconMap[icon || ""] || iconMap["check-circle"];
  }

  return (
    <section id={String(sectionId)} style={{ background: "#F2F5F7", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          {kicker && (
            <p style={{ fontSize: 15, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.14em", color: "#222222", marginBottom: 12 }}>
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
          )}
          <h2 style={{ fontSize: "clamp(28px,3.2vw,44px)", fontWeight: 600, textTransform: "capitalize", color: DARK, lineHeight: 1.2, marginBottom: 16 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p style={{ fontSize: 18, color: "#555", maxWidth: 640, margin: "0 auto" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        {/* Trust cards */}
        <div className="i01-trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 12,
              padding: "36px 32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: YELLOW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <IconBox icon={item.icon} />
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 600, color: "#222222", marginBottom: 8 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title || ""} tag="span" />
                </p>
                <p style={{ fontSize: 16, fontWeight: 400, color: "#444444", lineHeight: 1.6 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text || item.description || ""} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .i01-trust-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 540px) { .i01-trust-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ─── florist-01 Testimonials ─────────────────────────────────────────────────
// ── florist-01-testimonials ───────────────────────────────────────────────────
// Botanical Atelier Editorial luxe testimonials:
// - Deep moss #2f4a3a section pro dramatický contrast s ivory sekcemi
// - LEFT sticky aggregate rating card: huge Georgia italic "4,9" + 5 gold stars +
//   Google badge + trust copy + olive-gold corner brackets
// - RIGHT 3 testimonial cards ivory bg s pull-quote Georgia italic + author avatar circle
// - Olive-gold hairline separators mezi kartami
// - Conditional header pattern pro subpage FAQ
function TestimonialsFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const MOSS   = "#2f4a3a";
  const MOSSD  = "#243a2e";
  const SAGE   = "#5c8a6a";
  const IVORY  = "#faf7f2";
  const IVORY82 = "rgba(250,247,242,0.82)";
  const INK    = "#2a1a0a";
  const INK70  = "rgba(42,26,10,0.72)";
  const GOLD   = "#c9b78a";
  const GOLDBRIGHT = "#e5cd8d";
  const BLUSH  = "#e8c5c0";
  const GEORGIA = "Georgia, 'Times New Roman', serif";
  const INTER   = "Inter, system-ui, sans-serif";

  const eyebrow    = String(content.eyebrow    ?? "05 · RECENZE");
  const title      = String(content.title      ?? "Slova od těch, kteří u nás objednávají");
  const kicker     = String(content.kicker     ?? "Přes 220 hodnocení na Googlu za posledních 12 měsíců. Několik z nich čtete níže.");
  const rating     = String(content.rating     ?? "4,9");
  const ratingMax  = String(content.ratingMax  ?? "/ 5");
  const ratingText = String(content.ratingText ?? "220+ ověřených recenzí na Google");
  const trustCta   = String(content.trustCta   ?? "Zobrazit všechny recenze");
  const trustHref  = String(content.trustHref  ?? "https://google.com");

  const rawItems = (content.items as Array<{ text: string; author: string; location?: string; date?: string; initials?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { text: "Nádherné kytice, vždy čerstvé a doručené přesně na čas. Objednávám opakovaně a vždy je to zážitek — od otevření krabice po první pohled toho, kdo kytici dostane.", author: "Veronika H.", initials: "VH", location: "Brno-střed",       date: "leden 2026" },
    { text: "Objednala jsem kytici pro sestru k výročí. Přijela krásná, voněla celý byt a foto předem mi dodalo klid. Petala je moje první volba, kdykoliv chci potěšit někoho blízkého.", author: "Markéta S.", initials: "MS", location: "Brno-Královo Pole", date: "únor 2026" },
    { text: "Sháněla jsem svatební kytici na poslední chvíli. Domluva byla rychlá, kytice absolutně nádherná a všichni si mysleli, že jsem ji plánovala měsíce. Děkuji!", author: "Tereza K.",  initials: "TK", location: "Brno-Žabovřesky",    date: "duben 2026" },
  ];

  const showHeader = !!(eyebrow.trim() || title.trim());

  const Star = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLDBRIGHT} aria-hidden><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  );

  return (
    <section id="recenze" data-template="florist-01" className="f01test" style={{ background: MOSS, fontFamily: INTER, padding: "104px 24px 116px", color: IVORY, position: "relative", overflow: "hidden" }}>
      <style>{`
        .f01test::before, .f01test::after { content:""; position:absolute; width:220px; height:220px; border:1px solid ${GOLD}; opacity:0.14; pointer-events:none; }
        .f01test::before { top:-110px; left:-110px; transform: rotate(45deg); }
        .f01test::after  { bottom:-110px; right:-110px; transform: rotate(45deg); }

        .f01test-inner { max-width: 1280px; margin: 0 auto; position:relative; z-index:1; }
        .f01test-head { text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; margin-bottom: 64px; }
        .f01test-eye { display:inline-flex; align-items:center; gap:14px; font-family:${INTER}; font-weight:500; font-size:11px; letter-spacing:0.34em; text-transform:uppercase; color:${GOLDBRIGHT}; }
        .f01test-eye i { width:26px; height:1px; background:${GOLD}; display:inline-block; }
        .f01test-eye em { color:${GOLD}; font-style:normal; font-size:10px; }
        .f01test-h { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(30px, 3.6vw, 48px); line-height:1.12; color:${IVORY}; margin:0; letter-spacing:-0.012em; max-width:820px; }
        .f01test-k { font-family:${INTER}; font-weight:300; font-size:15px; line-height:1.7; color:${IVORY82}; max-width:640px; margin:0; }

        .f01test-grid { display:grid; grid-template-columns: minmax(0, 380px) 1fr; gap: 56px; align-items:flex-start; }

        /* LEFT sticky aggregate */
        .f01test-agg { position: sticky; top: 100px; background: ${MOSSD}; border: 1px solid ${GOLD}; padding: 44px 36px 40px; position:relative; }
        .f01test-agg::before, .f01test-agg::after { content:""; position:absolute; width:32px; height:32px; border:0 solid ${GOLD}; }
        .f01test-agg::before { top:-1px; left:-1px; border-top-width:2px; border-left-width:2px; }
        .f01test-agg::after  { bottom:-1px; right:-1px; border-bottom-width:2px; border-right-width:2px; }
        .f01test-agg-eye { font-family:${INTER}; font-weight:500; font-size:10.5px; letter-spacing:0.32em; text-transform:uppercase; color:${GOLDBRIGHT}; margin-bottom: 22px; display:inline-flex; align-items:center; gap:10px; }
        .f01test-agg-eye i { width: 18px; height:1px; background:${GOLDBRIGHT}; display:inline-block; }
        .f01test-rating { display:flex; align-items:flex-start; gap:6px; margin-bottom: 14px; }
        .f01test-rating-num { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:96px; line-height:0.9; color:${IVORY}; letter-spacing:-0.02em; }
        .f01test-rating-max { font-family:${GEORGIA}; font-style:italic; font-size:22px; color:${GOLDBRIGHT}; margin-top: 30px; letter-spacing:-0.01em; }
        .f01test-stars { display:flex; gap:4px; margin-bottom: 14px; }
        .f01test-agg-txt { font-family:${INTER}; font-weight:300; font-size:14px; line-height:1.6; color:${IVORY82}; margin: 0 0 22px; }
        .f01test-agg-hr { height:1px; background:${GOLD}; opacity:0.4; margin: 22px 0; }
        .f01test-google { display:flex; align-items:center; gap:12px; margin-bottom: 22px; font-family:${INTER}; font-size:12px; color:${IVORY82}; letter-spacing:0.14em; text-transform:uppercase; }
        .f01test-google-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 14px; border:1px solid ${GOLD}; }
        .f01test-agg-cta { display:inline-flex; align-items:center; gap:10px; font-family:${INTER}; font-weight:500; font-size:12px; letter-spacing:0.22em; text-transform:uppercase; color:${GOLDBRIGHT}; text-decoration:none; padding: 8px 0; position:relative; }
        .f01test-agg-cta::after { content:""; position:absolute; left:0; right:0; bottom:0; height:1px; background:${GOLDBRIGHT}; transform: scaleX(0.35); transform-origin: left; transition: transform 0.5s cubic-bezier(.6,.05,.35,1); }
        .f01test-agg-cta:hover::after { transform: scaleX(1); }
        .f01test-agg-cta:hover .arr { transform: translateX(4px); }
        .f01test-agg-cta .arr { transition: transform 0.4s ease; }

        /* RIGHT list */
        .f01test-list { display:flex; flex-direction:column; gap: 0; }
        .f01test-card { position:relative; padding: 34px 34px 34px; background: ${IVORY}; color:${INK}; }
        .f01test-card + .f01test-card { margin-top: 24px; }
        .f01test-card::before { content:""; position:absolute; top:-1px; left:-1px; width:36px; height:36px; border-top:1px solid ${GOLD}; border-left:1px solid ${GOLD}; }
        .f01test-card::after  { content:""; position:absolute; bottom:-1px; right:-1px; width:36px; height:36px; border-bottom:1px solid ${GOLD}; border-right:1px solid ${GOLD}; }
        .f01test-quote-mark { position:absolute; top:16px; right:26px; font-family:${GEORGIA}; font-style:italic; font-size:80px; line-height:1; color:${GOLD}; opacity:0.4; pointer-events:none; }
        .f01test-card-stars { display:flex; gap:3px; margin-bottom: 18px; }
        .f01test-card-stars svg { fill:${SAGE}; }
        .f01test-text { font-family:${GEORGIA}; font-style:italic; font-weight:400; font-size:clamp(16px, 1.4vw, 19px); line-height:1.65; color:${INK}; margin: 0 0 26px; letter-spacing:-0.005em; }
        .f01test-foot { display:flex; align-items:center; gap:14px; padding-top: 22px; border-top: 1px dotted ${GOLD}; }
        .f01test-ava { width:48px; height:48px; border-radius:50%; background:${MOSS}; color:${IVORY}; display:flex; align-items:center; justify-content:center; font-family:${GEORGIA}; font-style:italic; font-size:16px; letter-spacing:0.02em; flex-shrink:0; border: 1px solid ${GOLD}; }
        .f01test-author { display:flex; flex-direction:column; gap:2px; }
        .f01test-author-name { font-family:${GEORGIA}; font-style:italic; font-size:17px; color:${INK}; letter-spacing:-0.005em; }
        .f01test-author-meta { font-family:${INTER}; font-weight:400; font-size:11.5px; letter-spacing:0.2em; text-transform:uppercase; color:${INK70}; }

        @media(max-width:1024px){
          .f01test-grid { grid-template-columns: 1fr; gap: 40px; }
          .f01test-agg { position: static; max-width: 460px; }
        }
        @media(max-width:600px){
          .f01test { padding: 68px 20px 76px; }
          .f01test-agg { padding: 32px 26px 30px; }
          .f01test-rating-num { font-size: 78px; }
          .f01test-card { padding: 26px 24px 26px; }
          .f01test-quote-mark { font-size: 60px; top: 8px; right: 18px; }
        }
      `}</style>

      <div className="f01test-inner">
        {showHeader && (
          <header className="f01test-head">
            <span className="f01test-eye"><i /><em>✿</em>
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <em>✿</em><i />
            </span>
            <h2 className="f01test-h">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="f01test-k">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
          </header>
        )}

        <div className="f01test-grid">
          <aside className="f01test-agg">
            <span className="f01test-agg-eye"><i /> HODNOCENÍ</span>
            <div className="f01test-rating">
              <span className="f01test-rating-num">
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </span>
              <span className="f01test-rating-max">
                <GenericEditableText sectionId={sectionId} field="ratingMax" value={ratingMax} tag="span" />
              </span>
            </div>
            <div className="f01test-stars"><Star /><Star /><Star /><Star /><Star /></div>
            <p className="f01test-agg-txt">
              <GenericEditableText sectionId={sectionId} field="ratingText" value={ratingText} tag="span" />
            </p>
            <div className="f01test-agg-hr" aria-hidden />
            <div className="f01test-google">
              <span className="f01test-google-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.6-.2-2.4H12v4.5h5.9c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.4-4.9 3.4-8.3z"/>
                  <path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.7l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.8H1.8v2.9C3.7 20.4 7.6 23 12 23z"/>
                  <path fill="#FBBC04" d="M5.6 13.7c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V6.7H1.8C1 8.3.5 10.1.5 12s.5 3.7 1.3 5.3l3.8-2.9z"/>
                  <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 2 15.1 1 12 1 7.6 1 3.7 3.6 1.8 6.7l3.8 2.9C6.5 6.9 9 5.4 12 5.4z"/>
                </svg>
                <span>Google Reviews</span>
              </span>
            </div>
            <a href={trustHref} className="f01test-agg-cta" target="_blank" rel="noopener noreferrer">
              <GenericEditableText sectionId={sectionId} field="trustCta" value={trustCta} tag="span" />
              <span className="arr" aria-hidden>→</span>
            </a>
          </aside>

          <div className="f01test-list">
            {items.map((item, i) => (
              <article key={i} className="f01test-card">
                <span className="f01test-quote-mark" aria-hidden>&ldquo;</span>
                <div className="f01test-card-stars"><Star /><Star /><Star /><Star /><Star /></div>
                <p className="f01test-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
                <footer className="f01test-foot">
                  <span className="f01test-ava" aria-hidden>{item.initials ?? (item.author?.split(" ").map(w=>w[0]).slice(0,2).join("") || "")}</span>
                  <div className="f01test-author">
                    <span className="f01test-author-name">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                    </span>
                    {(item.location || item.date) && (
                      <span className="f01test-author-meta">
                        {item.location && <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={item.location} tag="span" />}
                        {item.location && item.date && <span aria-hidden> · </span>}
                        {item.date && <GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={item.date} tag="span" />}
                      </span>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── autoskola-01 Testimonials — 3 bílé karty na oranžovém bg ─────────────────
function TestimonialsAutoskola01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading    = String(content.heading    ?? "Co říkají absolventi");
  const subheading = String(content.subheading ?? "Přes 2 800 hodnocení, průměr 4,9 z 5");
  const items      = ((content.items as Record<string, unknown>[]) ?? []);

  const ORANGE = "#f16823";
  const FONT   = "'Roboto', sans-serif";

  const Stars = ({ count }: { count: number }) => (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill={i < count ? "#fbbf24" : "rgba(255,255,255,0.3)"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id={String(sectionId)} style={{ backgroundColor: ORANGE, padding: "80px clamp(24px, 6vw, 80px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", color: "#fff", margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "1rem", color: "rgba(255,255,255,0.85)", margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
        </div>

        {/* Karty */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {items.map((item, i) => {
            const name   = String(item.name   ?? "");
            const role   = String(item.role   ?? "");
            const text   = String(item.text   ?? "");
            const rating = Number(item.rating ?? 5);

            return (
              <div key={i} style={{ backgroundColor: "#fff", borderRadius: 4, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                {/* Uvozovka */}
                <svg width={32} height={24} viewBox="0 0 32 24" fill={ORANGE} opacity={0.25} aria-hidden>
                  <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 2.4C10.667 3.733 8 6.667 8 11.2V12h6.4V24H0zm17.6 0V14.4C17.6 6.4 22.4 1.6 32 0l1.6 2.4C28.267 3.733 25.6 6.667 25.6 11.2V12H32V24H17.6z"/>
                </svg>

                <p style={{ fontFamily: FONT, fontWeight: 400, fontSize: "0.9rem", color: "#484848", lineHeight: 1.75, margin: 0, flex: 1 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={text} tag="span" />
                </p>

                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9rem", color: "#484848" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                    </div>
                    <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 12, color: "#999", marginTop: 2 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={role} tag="span" />
                    </div>
                  </div>
                  <Stars count={rating} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── edu-01-testimonials ───────────────────────────────────────────────────────
// Světle šedé bg, centrovaný heading + rating badge, 3-sloupcový grid karet.
// Karta: uvozovka, text, dělicí čára, avatar initials + autor + předmět.
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsEdu01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY = "#132339";
  const BLUE = "#0059df";
  const FONT = "'Libre Franklin', Arial, sans-serif";

  const heading      = String(content.heading     ?? "Co o nás říkají studenti a rodiče");
  const rating       = String(content.rating      ?? "4,8");
  const ratingCount  = String(content.ratingCount ?? "127 recenzí");
  const items        = (content.items as Array<{ text: string; author: string; role?: string; subject?: string }>) ?? [];

  const AVATAR_COLORS = [BLUE, "#0d9488", "#7c3aed", "#b45309", "#be185d"];

  return (
    <>
      <style>{`
        .edu01tm{padding:100px 40px;background:#f3f6fb;font-family:${FONT};}
        .edu01tm-inner{max-width:1280px;margin:0 auto;}
        .edu01tm-head{text-align:center;margin-bottom:56px;}
        .edu01tm-eyebrow{display:inline-block;color:${BLUE};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:12px;}
        .edu01tm-head h2{font-family:${FONT};font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:${NAVY};margin:0 0 20px;letter-spacing:-0.04em;line-height:1.15;}
        .edu01tm-rating{display:inline-flex;align-items:center;gap:10px;background:#fff;border-radius:40px;padding:10px 20px;box-shadow:0 4px 16px rgba(0,0,0,0.08);}
        .edu01tm-stars{color:#f59e0b;font-size:18px;letter-spacing:2px;}
        .edu01tm-rating-val{font-size:18px;font-weight:800;color:${NAVY};}
        .edu01tm-rating-cnt{font-size:13px;color:#9ca3af;}
        .edu01tm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .edu01tm-card{background:#fff;border-radius:16px;padding:32px 28px;border:1.5px solid #e5e7eb;display:flex;flex-direction:column;transition:box-shadow 0.2s,transform 0.2s,border-color 0.2s;}
        .edu01tm-card:hover{box-shadow:0 16px 48px rgba(0,89,223,0.1);transform:translateY(-4px);border-color:rgba(0,89,223,0.25);}
        .edu01tm-quote{font-size:48px;line-height:0.8;color:${BLUE};opacity:0.25;font-family:Georgia,serif;margin-bottom:12px;user-select:none;}
        .edu01tm-text{font-size:14px;color:#4b5563;line-height:1.75;flex:1;margin:0 0 24px;}
        .edu01tm-divider{height:1px;background:#e5e7eb;margin-bottom:20px;}
        .edu01tm-footer{display:flex;align-items:center;gap:12px;}
        .edu01tm-avatar{width:40px;height:40px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;}
        .edu01tm-author{font-size:14px;font-weight:700;color:${NAVY};line-height:1.3;}
        .edu01tm-role{font-size:12px;color:#9ca3af;}
        .edu01tm-subject{display:inline-block;margin-top:4px;font-size:11px;font-weight:700;background:rgba(0,89,223,0.08);color:${BLUE};padding:2px 8px;border-radius:4px;}
        @media(max-width:960px){.edu01tm-grid{grid-template-columns:1fr 1fr;}.edu01tm{padding:72px 24px;}}
        @media(max-width:600px){.edu01tm-grid{grid-template-columns:1fr;}}
      `}</style>

      <section id={String(sectionId)} className="edu01tm" data-template="edu-01-testimonials">
        <div className="edu01tm-inner">
          <div className="edu01tm-head">
            <span className="edu01tm-eyebrow">Reference</span>
            <h2>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <div className="edu01tm-rating">
              <span className="edu01tm-stars">★★★★★</span>
              <span className="edu01tm-rating-val">
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </span>
              <span className="edu01tm-rating-cnt">
                <GenericEditableText sectionId={sectionId} field="ratingCount" value={ratingCount} tag="span" />
              </span>
            </div>
          </div>

          <div className="edu01tm-grid">
            {items.map((item, i) => {
              const initials = item.author.split(" ").map((w: string) => w[0]).slice(0, 2).join("");
              const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div key={i} className="edu01tm-card">
                  <div className="edu01tm-quote" aria-hidden="true">&ldquo;</div>
                  <p className="edu01tm-text">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                  </p>
                  <div className="edu01tm-divider" />
                  <div className="edu01tm-footer">
                    <div className="edu01tm-avatar" style={{ background: avatarBg }}>{initials}</div>
                    <div>
                      <div className="edu01tm-author">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                      </div>
                      {item.role && (
                        <div className="edu01tm-role">
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                        </div>
                      )}
                      {item.subject && (
                        <span className="edu01tm-subject">
                          <GenericEditableText sectionId={sectionId} field={`items.${i}.subject`} value={item.subject} tag="span" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── kids-01-testimonials ─────────────────────────────────────────────── */
function TestimonialsKids01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading  = String((content as any).heading  ?? "Říkají o nás");
  const label    = String((content as any).label    ?? "RODIČE O DEMO KROUŽCÍCH");
  const ctaText  = String((content as any).ctaText  ?? "Všechny zkušenosti");
  const ctaHref  = String((content as any).ctaHref  ?? "/rikaji-o-nas");
  const items    = ((content as any).items as Array<{ text: string; author: string; company?: string }>) ?? [];

  const sRef = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = sRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const BLUE  = "#009BDE";
  const LBG   = "#f0f9ff";
  const DARK  = "#1a2a3a";
  const FONT  = "'Gotham Rounded', 'Nunito', 'Trebuchet MS', sans-serif";

  return (
    <section
      ref={sRef}
      id={`section-${sectionId}`}
      style={{ background: LBG, padding: "80px 24px 96px", fontFamily: FONT }}
    >
      <style>{`
        .k01rev-heading {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .k01rev-heading.vis { opacity: 1; transform: translateY(0); }
        .k01rev-card {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.5s ease, transform 0.5s ease;
          background: #fff;
          border-radius: 10px;
          padding: 28px 28px 24px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.07);
          position: relative;
        }
        .k01rev-card.vis { opacity: 1; transform: translateY(0); }
        .k01rev-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 8px 28px rgba(0,155,222,0.16) !important;
        }
        .k01rev-quote-mark {
          position: absolute;
          top: 16px; left: 22px;
          font-size: 5rem;
          line-height: 1;
          color: ${BLUE};
          opacity: 0.13;
          font-family: Georgia, serif;
          pointer-events: none;
        }
        .k01rev-text {
          color: #444;
          font-size: 0.95rem;
          line-height: 1.75;
          margin: 0 0 18px;
          position: relative;
          z-index: 1;
        }
        .k01rev-author {
          font-weight: 700;
          font-size: 0.88rem;
          color: ${DARK};
        }
        .k01rev-company {
          font-size: 0.78rem;
          color: ${BLUE};
          font-weight: 500;
          margin-left: 6px;
        }
        .k01rev-stars {
          color: #ffc107;
          font-size: 1rem;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }
        .k01rev-cta {
          display: inline-block;
          margin-top: 48px;
          color: ${BLUE};
          font-family: ${FONT};
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          border-bottom: 2px solid ${BLUE};
          padding-bottom: 2px;
          transition: opacity 0.2s ease;
        }
        .k01rev-cta:hover { opacity: 0.7; }
        @media (max-width: 768px) {
          .k01rev-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div className={`k01rev-heading${vis ? " vis" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ color: BLUE, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 10px" }}>
            <GenericEditableText sectionId={sectionId} field="label" value={label} tag="span" />
          </p>
          <h2 style={{ color: DARK, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* Cards grid */}
        <div
          className="k01rev-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className={`k01rev-card${vis ? " vis" : ""}`}
              style={{ transitionDelay: vis ? `${i * 100}ms` : "0ms" }}
            >
              <div className="k01rev-quote-mark">&ldquo;</div>
              <div className="k01rev-stars">★★★★★</div>
              <p className="k01rev-text">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>
              <div>
                <span className="k01rev-author">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </span>
                {item.company && (
                  <span className="k01rev-company">— <GenericEditableText sectionId={sectionId} field={`items.${i}.company`} value={item.company} tag="span" /></span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {ctaText && (
          <div className={`k01rev-heading${vis ? " vis" : ""}`} style={{ textAlign: "center", transitionDelay: vis ? "450ms" : "0ms" }}>
            <a href={ctaHref} data-btn="primary" className="k01rev-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /> →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── ucetni-01-testimonials ──────────────────────────────────────────────────
// 1:1 ucetnictvispravne.cz section fa40a98:
// - White bg + decorative bg img top-right (contain)
// - Inner gradient card (#FFFFFF2B → #FFFBF1), border-radius 8px, padding 70px
// - Centered H2 3rem bold #202124
// - Auto-rotating slider (4s interval), fade transition, dot navigation
function TestimonialsUcetni01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK  = "var(--color-text, #202124)";
  const MUTED = "var(--color-text-muted, #515151)";
  const FONT  = "'Space Grotesk', 'Inter', Arial, sans-serif";

  const title = String(content.title ?? "Naši spokojení klienti");
  type Item = { name: string; role: string; text: string; rating?: number };
  const items = (content.items as Item[]) ?? [];

  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (idx: number) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 300);
  };

  useEffect(() => {
    if (items.length < 2) return;
    timerRef.current = setTimeout(() => {
      goTo((active + 1) % items.length);
    }, 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, items.length]);

  const item = items[active];

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "6rem 0", fontFamily: FONT, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: "30%", height: "100%",
        backgroundImage: "url('/templates/ucetni-01/testimonials-bg.png')",
        backgroundPosition: "100% 100%", backgroundRepeat: "no-repeat", backgroundSize: "30% auto",
        pointerEvents: "none",
      }} aria-hidden="true" />
      <style>{`
        .uc01test-inner { max-width: 1320px; margin: 0 auto; padding: 0 20px; }
        .uc01test-card {
          background: linear-gradient(269deg, rgba(255,255,255,0.17) 0%, #FFFBF1 100%);
          border-radius: 8px;
          padding: 70px;
        }
        .uc01test-title {
          text-align: center;
          font-family: ${FONT};
          font-size: 3rem;
          font-weight: 700;
          color: ${DARK};
          margin: 0 0 40px;
          line-height: 1.2;
        }
        .uc01test-slide {
          max-width: 720px;
          margin: 0 auto;
          text-align: left;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        .uc01test-slide.fading { opacity: 0; }
        .uc01test-stars { color: var(--color-primary, #FFB500); font-size: 1.3rem; margin-bottom: 20px; letter-spacing: 2px; }
        .uc01test-quote {
          font-family: ${FONT};
          font-size: 1.1rem;
          font-style: italic;
          color: #383737;
          line-height: 1.7;
          margin: 0 0 28px;
        }
        .uc01test-name {
          font-family: ${FONT};
          font-size: 1rem;
          font-weight: 700;
          color: #272727;
          margin: 0 0 4px;
        }
        .uc01test-role {
          font-family: ${FONT};
          font-size: 0.9rem;
          color: ${MUTED};
          margin: 0 0 32px;
        }
        .uc01test-dots {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .uc01test-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
          border: none;
          cursor: pointer;
          transition: background 0.25s, transform 0.25s;
          padding: 0;
        }
        .uc01test-dot.active {
          background: ${DARK};
          transform: scale(1.2);
        }
        @media (max-width: 900px) {
          .uc01test-card { padding: 40px 24px; }
          .uc01test-title { font-size: 2rem; }
          .uc01test-quote { font-size: 1rem; }
        }
      `}</style>
      <div className="uc01test-inner">
        <div className="uc01test-card">
          <h2 className="uc01test-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {item && (
            <div className={`uc01test-slide${fading ? " fading" : ""}`}>
              <div className="uc01test-stars">{"★".repeat(item.rating ?? 5)}</div>
              <p className="uc01test-quote">
                &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${active}.text`} value={item.text} tag="span" />&rdquo;
              </p>
              <div className="uc01test-name">
                <GenericEditableText sectionId={sectionId} field={`items.${active}.name`} value={item.name} tag="span" />
              </div>
              <div className="uc01test-role">
                <GenericEditableText sectionId={sectionId} field={`items.${active}.role`} value={item.role} tag="span" />
              </div>
            </div>
          )}
          {items.length > 1 && (
            <div className="uc01test-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  className={`uc01test-dot${i === active ? " active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-04-testimonials ────────────────────────────────────────────────────
// 1:1 bcas.cz refs section:
// - sectionHeader: eyebrow + H2 + perex, text-center, max-width 43.75em
// - grid 2 cols (nebo 3 na wide), gap 12px
// - každá karta: tmavé bg (gradient + foto), bílý quote box vlevo (padding 24px, max-w 19.5rem)
// - quote: font-weight 600, line-height 157%, color #171F22
// - sign strong: name, sign span: role 0.75rem muted
// - fade-in + slide-up stagger
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsUcetni04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BG   = "#FBF6EE";
  const NAVY = "#003366";
  const DARK = "#171F22";
  const FONT = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const kicker  = String(content.kicker  ?? "Reference");
  const heading = String(content.heading ?? "Říkáte o nás");
  const subtext = String(content.subtext ?? "Čísla a statistiky mluví jasně, nejvíce o nás ale stejně vypovídají vaše pochvalné reference.");
  const rawItems = Array.isArray(content.items)
    ? content.items as Array<{ quote?: string; name?: string; role?: string; imageUrl?: string }>
    : [];
  const items = rawItems.length > 0 ? rawItems : [
    { quote: "S Demo Finanční Poradce jsem vyřešil hypotéku během dvou týdnů. Poradce byl skvělý, vždy dostupný a vše vysvětlil srozumitelně.", name: "Martin Novák",      role: "Klient od roku 2021", imageUrl: "/templates/ucetni-04/testimonials/t1.jpg" },
    { quote: "Konečně mám přehled o svých financích. Díky komplexnímu finančnímu plánu spořím efektivněji a mám klid ohledně budoucnosti rodiny.",  name: "Jana Procházková", role: "Klientka od roku 2019", imageUrl: "/templates/ucetni-04/testimonials/t2.jpg" },
    { quote: "Oceňuji nezávislé poradenství – poradce mi doporučil to, co je skutečně výhodné pro mě, ne pro pojišťovnu.",                          name: "Tomáš Hájek",       role: "Klient od roku 2022", imageUrl: "/templates/ucetni-04/testimonials/t3.jpg" },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .ucn04refs { background: ${BG}; font-family: ${FONT}; }
        .ucn04refs-inner {
          max-width: 1296px;
          margin: 0 auto;
          padding: 0 24px clamp(56px,6vw,80px);
        }
        /* Section header */
        .ucn04refs-hdr {
          text-align: center;
          margin: 0 auto;
          padding: clamp(56px,8vw,100px) 0 clamp(36px,5vw,56px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          max-width: 43.75em;
        }
        .ucn04refs-eyebrow {
          font-size: 12px;
          font-weight: 600;
          color: ${NAVY};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
        }
        .ucn04refs-h2 {
          font-size: clamp(24px,2.8vw,36px);
          font-weight: 700;
          color: ${DARK};
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }
        .ucn04refs-sub {
          font-size: 15px;
          color: #486A72;
          line-height: 1.6;
          margin: 0;
        }
        /* Cards grid */
        .ucn04refs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        /* Individual card */
        .ucn04refs-card {
          position: relative;
          min-height: 260px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          overflow: hidden;
          border-radius: 2px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ucn04refs-card.ucn04refs-vis { opacity: 1; transform: translateY(0); }
        /* Background photo */
        .ucn04refs-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          filter: saturate(75%);
        }
        /* Dark gradient overlay */
        .ucn04refs-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(5,3,4,0.82) 15%, rgba(25,24,24,0.55) 85%);
        }
        /* White quote box */
        .ucn04refs-box {
          position: relative;
          z-index: 2;
          background: white;
          padding: 24px;
          font-size: 0.875em;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 19.5rem;
          align-self: stretch;
          justify-content: space-between;
        }
        .ucn04refs-quote {
          font-weight: 600;
          line-height: 1.57;
          color: ${DARK};
          margin: 0;
          font-style: normal;
          flex: 1;
        }
        .ucn04refs-sign strong {
          display: block;
          font-weight: 600;
          color: ${DARK};
          font-size: 0.9em;
        }
        .ucn04refs-sign span {
          display: block;
          font-size: 0.75rem;
          color: #486A72;
          margin-top: 2px;
        }
        @media (max-width: 640px) {
          .ucn04refs-grid { grid-template-columns: 1fr; }
          .ucn04refs-box { max-width: 100%; }
        }
      `}</style>
      <section ref={sectionRef} className="ucn04refs" data-template="ucetni-04-testimonials">
        <div className="ucn04refs-inner">
          <div className="ucn04refs-hdr">
            <p className="ucn04refs-eyebrow">
              <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
            </p>
            <h2 className="ucn04refs-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="ucn04refs-sub">
              <GenericEditableText sectionId={sectionId} field="subtext" value={subtext} tag="span" />
            </p>
          </div>
          <div className="ucn04refs-grid">
            {items.map((item, i) => {
              const imgSrc = String(item.imageUrl ?? `/templates/ucetni-04/testimonials/t${(i % 3) + 1}.jpg`);
              return (
                <article
                  key={i}
                  className={`ucn04refs-card${visible ? " ucn04refs-vis" : ""}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={imgSrc} alt="" className="ucn04refs-bg" style={{ display: "block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img loading="lazy" src={imgSrc} alt="" className="ucn04refs-bg" />
                  </GenericEditableImage>
                  <div className="ucn04refs-box">
                    <q className="ucn04refs-quote">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.quote`} value={String(item.quote ?? "")} tag="span" />
                    </q>
                    <div className="ucn04refs-sign">
                      <strong>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
                      </strong>
                      <span>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={String(item.role ?? "")} tag="span" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── solar-03-testimonials ─────────────────────────────────────────────────────
function TestimonialsSolar03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Review = { name?: string; text?: string; role?: string; city?: string };
  const eyebrow    = String(content.eyebrow    ?? "Zákazníci o nás");
  const title      = String(content.title      ?? "Ověřené hlasy od skutečných majitelů");
  const subtitle   = String(content.subtitle   ?? "Přes 15 000 realizací a stovky hodnocení na Google. Přečtěte si, jak SolarPro pomohl konkrétním rodinám a firmám snížit účty za energie.");
  const ratingLabel = String(content.ratingLabel ?? "Průměrné hodnocení");
  const ratingValue = String(content.ratingValue ?? "4,9 / 5,0");
  const ratingMeta  = String(content.ratingMeta  ?? "1 240 recenzí na Google");
  const reviews: Review[] = Array.isArray(content.reviews) ? (content.reviews as Review[]) : [];

  const Stars = () => (
    <span className="s03tm-stars" aria-label="5 hvězdiček">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbc04"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
    </span>
  );

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.75l7.97-6.16z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.25l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  );

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "•";
  };

  return (
    <section className="s03tm-section" data-template="solar-03" id="reference">
      <div className="s03tm-bg-grid" aria-hidden="true" />
      <div className="s03tm-inner">
        <div className="s03tm-header">
          <div className="s03tm-eyebrow">
            <span className="s03tm-eyebrow-dot" aria-hidden="true" />
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </div>
          <h2 className="s03tm-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="s03tm-sub-lead">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
          <div className="s03tm-rating">
            <span className="s03tm-rating-icon" aria-hidden="true"><GoogleIcon /></span>
            <span className="s03tm-rating-label">
              <GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" />
            </span>
            <span className="s03tm-rating-value">
              <GenericEditableText sectionId={sectionId} field="ratingValue" value={ratingValue} tag="span" />
            </span>
            <Stars />
            <span className="s03tm-rating-meta">
              · <GenericEditableText sectionId={sectionId} field="ratingMeta" value={ratingMeta} tag="span" />
            </span>
          </div>
        </div>

        <div className="s03tm-grid">
          {reviews.map((r, i) => {
            const name = String(r.name ?? "");
            const role = String(r.role ?? "");
            const city = String(r.city ?? "");
            return (
              <article className="s03tm-card" key={i}>
                <span className="s03tm-card-topline" aria-hidden="true" />
                <span className="s03tm-quote" aria-hidden="true">“</span>
                <Stars />
                <p className="s03tm-text">
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.text`} value={String(r.text ?? "")} tag="span" />
                </p>
                <div className="s03tm-author">
                  <span className="s03tm-avatar" aria-hidden="true">{initials(name)}</span>
                  <div className="s03tm-author-meta">
                    <span className="s03tm-name">
                      <GenericEditableText sectionId={sectionId} field={`reviews.${i}.name`} value={name} tag="span" />
                    </span>
                    <span className="s03tm-role">
                      <GenericEditableText sectionId={sectionId} field={`reviews.${i}.role`} value={role} tag="span" />
                      {role && city ? " · " : ""}
                      <GenericEditableText sectionId={sectionId} field={`reviews.${i}.city`} value={city} tag="span" />
                    </span>
                  </div>
                  <span className="s03tm-google" title="Ověřená recenze Google"><GoogleIcon /></span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── TestimonialsSolar02 ─── solar-02 Greenia reference + stats (luxe) ── */
function TestimonialsSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const showHeader = content.showHeader !== false;
  const eyebrow  = String(content.eyebrow  ?? "Reference");
  const title    = String(content.title    ?? "Přes 420 projektů, které vyrábějí každý den");
  const subtitle = String(content.subtitle ?? "Firmy, obce i SVJ v celé ČR i SK — a všichni by nás doporučili dál.");
  const stats = (content.stats as Array<{ value: string; label: string }> | undefined) ?? [
    { value: "4,9 ★", label: "Google recenze (240+)" },
    { value: "96 %",  label: "klientů doporučuje dál" },
    { value: "12 let", label: "na trhu s fotovoltaikou" },
  ];
  const reviews = (content.reviews as Array<{ name: string; company: string; text: string }> | undefined) ?? [
    { name: "Tomáš Blaha, technický ředitel", company: "Plastika Group a.s., Kroměříž", text: "Navrhli nám systém 480 kWp, který pokrývá 62 % roční spotřeby závodu. Návratnost pod 6 lety. Doporučujeme bez výhrad." },
    { name: "Ing. Radka Součková, starostka",  company: "Obec Březová nad Svitavou",    text: "Díky PPA modelu jsme získali solární energii bez jakékoli počáteční investice. Ušetřili jsme 280 000 Kč ročně na provoz obecních budov." },
    { name: "MVDr. Lukáš Pospíšil",            company: "Zemědělský podnik Pospíšil",   text: "Instalace proběhla v říjnu, do jara jsme měli vše v provozu. Monitoring funguje perfektně, vidím výrobu v reálném čase přes mobil." },
  ];

  const initial = (name: string) => (name.trim().split(/\s+/).pop() ?? name).charAt(0).toUpperCase() || "•";

  return (
    <section className="s02tmn" id="reference" data-template="solar-02">
      <div className="s02tmn-glow" aria-hidden="true" />
      <div className="s02tmn-inner">
        {showHeader && (
          <div className="s02tmn-head">
            <div className="s02tmn-eyebrow">
              <span className="s02tmn-eyebrow-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </div>
            <h2 className="s02tmn-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02tmn-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
        )}

        <div className="s02tmn-stats">
          {stats.map((s, i) => (
            <div className="s02tmn-stat" key={i}>
              <div className="s02tmn-val">
                <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
              </div>
              <div className="s02tmn-lbl">
                <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
              </div>
            </div>
          ))}
        </div>

        <div className="s02tmn-grid">
          {reviews.map((r, i) => (
            <article className="s02tmn-card" key={i}>
              <svg className="s02tmn-quote" width="52" height="42" viewBox="0 0 52 42" fill="none" aria-hidden="true">
                <path d="M14 42V22c0-11 6-19 18-22v6c-8 3-12 8-12 16h6v20H14zm26 0V22c0-11 6-19 18-22v6c-8 3-12 8-12 16h6v20H40z" fill="rgba(121,196,79,0.12)"/>
              </svg>
              <div className="s02tmn-stars" aria-label="5 z 5 hvězd">
                {[0,1,2,3,4].map(n => (
                  <svg key={n} width="15" height="15" viewBox="0 0 24 24" fill="#79c44f" aria-hidden="true">
                    <path d="M12 2l3 6.9 7.4.7-5.6 4.9 1.7 7.3L12 17.9l-6.5 3.9 1.7-7.3L1.6 9.6 9 8.9z"/>
                  </svg>
                ))}
              </div>
              <p className="s02tmn-text">
                <GenericEditableText sectionId={sectionId} field={`reviews.${i}.text`} value={r.text} tag="span" />
              </p>
              <div className="s02tmn-author">
                <span className="s02tmn-avatar" aria-hidden="true">{initial(r.name)}</span>
                <span className="s02tmn-author-body">
                  <span className="s02tmn-name">
                    <GenericEditableText sectionId={sectionId} field={`reviews.${i}.name`} value={r.name} tag="span" />
                  </span>
                  <span className="s02tmn-company">
                    <GenericEditableText sectionId={sectionId} field={`reviews.${i}.company`} value={r.company} tag="span" />
                  </span>
                </span>
              </div>
              <span className="s02tmn-corner" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── klempir-01-testimonials ───────────────────────────────────────────────────
// Copper & Slate: bílé bg, editorial header; 3 karty s copper hvězdami,
// Fraunces citátem a iniciálovým avatarem (žádné stock portréty).
function TestimonialsKlempir01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const kicker = String(content.kicker ?? "Recenze");
  const title = String(content.title ?? "Co říkají klienti");
  const items = (content.items as Array<{ name?: string; text?: string; rating?: number }>) ?? [];
  const initials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <style>{`
        .k01tm-section { background: #fff; padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Manrope', sans-serif; }
        .k01tm-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .k01tm-kicker {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #B4622D; margin-bottom: 1.1rem;
        }
        .k01tm-kicker::before { content: ""; width: 26px; height: 2px; background: #B4622D; }
        .k01tm-h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.9rem, 3.4vw, 2.8rem); font-weight: 600;
          color: #191C1F; line-height: 1.1; margin: 0 0 clamp(2rem, 4vw, 3rem); letter-spacing: -0.02em;
        }
        .k01tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .k01tm-card {
          background: #F5F3EF; border: 1px solid #E9E5DD; border-radius: 6px;
          padding: 1.8rem 1.7rem 1.6rem; display: flex; flex-direction: column; gap: 1rem;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .k01tm-card:hover { transform: translateY(-4px); box-shadow: 0 28px 50px -30px rgba(20,23,26,0.3); }
        .k01tm-stars { display: flex; gap: 3px; }
        .k01tm-text {
          font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 500;
          color: #23262A; line-height: 1.6; margin: 0; flex: 1; letter-spacing: -0.005em;
        }
        .k01tm-footer { display: flex; align-items: center; gap: 0.8rem; border-top: 1px solid #E9E5DD; padding-top: 1.1rem; }
        .k01tm-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: grid; place-items: center;
          font-size: 0.78rem; font-weight: 800; color: #B4622D; background: rgba(180,98,45,0.12);
          flex-shrink: 0;
        }
        .k01tm-name { font-weight: 700; color: #191C1F; font-size: 0.92rem; }
        @media (max-width: 900px) { .k01tm-grid { grid-template-columns: 1fr; gap: 1rem; } }
        @media (prefers-reduced-motion: reduce) { .k01tm-card { transition: none; } }
      `}</style>

      <section className="k01tm-section" id="recenze" data-template="klempir-01-testimonials">
        <div className="k01tm-inner">
          <p className="k01tm-kicker"><GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" /></p>
          <h2 className="k01tm-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          <div className="k01tm-grid">
            {items.map((item, i) => (
              <figure key={i} className="k01tm-card" style={{ margin: 0 }}>
                <div className="k01tm-stars" aria-label={`${item.rating ?? 5} z 5 hvězdiček`}>
                  {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                    <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill="#B4622D" aria-hidden="true"><path d="M12 2l2.9 6.26 6.87.6-5.2 4.53 1.55 6.72L12 16.54l-6.12 3.57 1.55-6.72-5.2-4.53 6.87-.6L12 2z"/></svg>
                  ))}
                </div>
                <blockquote className="k01tm-text" style={{ margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />
                </blockquote>
                <figcaption className="k01tm-footer">
                  <span className="k01tm-avatar" aria-hidden="true">{initials(item.name ?? "?")}</span>
                  <span className="k01tm-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name ?? ""} tag="span" /></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


// ── malir-01-testimonials ─────────────────────────────────────────────────────
// VYLEPŠENO (luxe malíř):
// - Surface bg #f8f7f5, 3 karty s amber quote mark, initial-avatary
// - Google rating badge (4.9 stars), hover lift+amber glow
// - Conditional header, staggered reveal
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsMalir01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const AMBER    = "#E79B0E";
  const DARK     = "#1a1a1a";
  const MUTED    = "#555555";
  const SURFACE  = "#f8f7f5";
  const FONT_H   = "'Playfair Display', Georgia, serif";
  const FONT_B   = "'Raleway', sans-serif";

  const eyebrow  = String(content.eyebrow ?? content.tagline ?? "Reference");
  const title    = String(content.title ?? "Co o nás říkají klienti");
  const subtitle = String(content.subtitle ?? "");
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());
  const googleRating = Number(content.googleRating ?? 4.9);
  const googleCount  = String(content.googleReviewCount ?? "60+");

  type ReviewItem = { text: string; name: string; role?: string };
  const defaultItems: ReviewItem[] = [
    { text: "Pánové přišli přesně na čas, pracovali pečlivě a rychle. Celý byt vypadá jako nový — a hlavně, po sobě dokonale uklidili. Naprostá spokojenost.", name: "Jana Kovářová", role: "Praha 6" },
    { text: "Objednal jsem vymalování celého domu. Cena odpovídala nabídce, termín splněn na den. Poradili s výběrem odstínu a výsledek předčil očekávání. Vřele doporučuji.", name: "Martin Dvořák", role: "Praha-západ" },
    { text: "Perfektní renovace oken — lakování dopadlo skvěle, vypadají jako nová. Rychlá komunikace, férový přístup a hlavně krásný výsledek. Příště se obrátím znovu.", name: "Eva Procházková", role: "Praha 4" },
  ];
  const items: ReviewItem[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as ReviewItem[])
    : defaultItems;

  const Stars = ({ size = 16 }: { size?: number }) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={AMBER} aria-hidden="true">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );

  return (
    <section id="hodnoceni" data-template="malir-01" style={{
      background: SURFACE, padding: "clamp(60px, 10vw, 110px) 0", fontFamily: FONT_B,
    }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 30px" }}>
        {/* Header */}
        {showHeader && (
          <div style={{ textAlign: "center", marginBottom: "clamp(36px, 5vw, 52px)" }}>
            <div className="m01t-reveal" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 14 }}>
              <span style={{ width: 32, height: 1, background: AMBER }} />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" style={{
                fontFamily: FONT_B, fontWeight: 600, fontSize: 12, color: AMBER,
                letterSpacing: "0.14em", textTransform: "uppercase" as const,
              }} />
              <span style={{ width: 32, height: 1, background: AMBER }} />
            </div>
            <div className="m01t-reveal" style={{ animationDelay: "0.1s" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{
                fontFamily: FONT_H, fontWeight: 800,
                fontSize: "clamp(26px, 3.5vw, 40px)", lineHeight: 1.2,
                color: DARK, margin: "0 0 8px",
              }} />
            </div>
            {/* Google rating badge */}
            <div className="m01t-reveal" style={{ animationDelay: "0.15s", display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginTop: 14 }}>
              <Stars size={14} />
              <GenericEditableText sectionId={sectionId} field="googleRating" value={String(googleRating)} tag="span" style={{
                fontFamily: FONT_B, fontWeight: 700, fontSize: 15, color: DARK,
              }} />
              <span style={{ color: MUTED, fontSize: 13 }}>·</span>
              <GenericEditableText sectionId={sectionId} field="googleReviewCount" value={googleCount} tag="span" style={{
                fontFamily: FONT_B, fontWeight: 400, fontSize: 13, color: MUTED,
              }} />
              <span style={{ fontFamily: FONT_B, fontSize: 13, color: MUTED }}>hodnocení na Google</span>
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(16px, 2vw, 24px)" }}>
          {items.map((item, i) => {
            const initials = item.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={i} className="m01t-card m01t-reveal" style={{
                animationDelay: `${0.1 + i * 0.08}s`,
                background: "#ffffff", borderRadius: 8,
                padding: "clamp(24px, 3vw, 32px)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
                transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
                position: "relative",
              }}>
                {/* Amber quote mark */}
                <svg width="28" height="22" viewBox="0 0 28 22" fill={`${AMBER}20`} aria-hidden="true" style={{ marginBottom: 14, flexShrink: 0 }}>
                  <path d="M0 22V13.2C0 9.27 .87 6.17 2.6 3.9 4.33 1.63 6.93.23 10.4 0l.93 3.47c-2.2.47-3.77 1.4-4.7 2.8-.93 1.4-1.4 3.13-1.4 5.2h4.5V22H0zm16.27 0V13.2c0-3.93.87-7.03 2.6-9.3C20.6 1.63 23.2.23 26.67 0l.93 3.47c-2.2.47-3.77 1.4-4.7 2.8-.93 1.4-1.4 3.13-1.4 5.2h4.5V22h-9.73z"/>
                </svg>

                <Stars />

                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="p" style={{
                  fontFamily: FONT_B, fontSize: 15, lineHeight: 1.8,
                  color: MUTED, margin: "14px 0 22px", flex: 1,
                  fontStyle: "italic" as const,
                }} />

                {/* Author */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${AMBER}15`, paddingTop: 16 }}>
                  {/* Initial avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `${AMBER}18`, color: AMBER,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: FONT_B, fontWeight: 700, fontSize: 14,
                    flexShrink: 0,
                  }}>{initials}</div>
                  <div>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="div" style={{
                      fontFamily: FONT_B, fontSize: 14, fontWeight: 700, color: DARK, lineHeight: 1.3,
                    }} />
                    {item.role && (
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="div" style={{
                        fontFamily: FONT_B, fontSize: 12, color: `${MUTED}bb`, marginTop: 2,
                      }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── clean-02-testimonials ─────────────────────────────────────────────────────
function TestimonialsClean02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title ?? "Co o nás říkají zákazníci");
  const items   = (content.items as Array<{ rating?: number; text?: string; author?: string; date?: string }>) ?? [];
  const initials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase();
  return (
    <>
      <style>{`
        .c02tm-section { background: var(--color-bg, #F4F6F9); padding: clamp(4rem, 8vw, 7rem) 0; font-family: 'Onest',sans-serif; }
        .c02tm-inner { max-width: 76rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .c02tm-header { margin-bottom: clamp(2.2rem, 4.5vw, 3.2rem); }
        .c02tm-kicker {
          display: inline-flex; align-items: center; gap: .55rem;
          font-size: .8rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
          color: var(--color-primary, #1B5BFF); margin-bottom: 1.1rem;
        }
        .c02tm-kicker::before { content: ''; width: 22px; height: 2px; background: var(--color-primary, #1B5BFF); border-radius: 2px; }
        .c02tm-h2 {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: clamp(1.9rem, 3.4vw, 2.9rem); font-weight: 750; color: var(--color-secondary, #0B1526);
          margin: 0; line-height: 1.08; letter-spacing: -0.03em;
        }
        .c02tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.3rem; }
        .c02tm-card {
          background: #fff; border: 1px solid var(--color-border, #E7EBF2); border-radius: 18px;
          padding: 1.9rem 1.8rem 1.7rem;
          display: flex; flex-direction: column; gap: 1.1rem;
          transition: box-shadow .3s, transform .3s, border-color .3s;
        }
        .c02tm-card:hover {
          transform: translateY(-4px); border-color: #D7E1F0;
          box-shadow: 0 30px 55px -30px rgba(11,21,38,0.25);
        }
        .c02tm-toprow { display: flex; align-items: center; justify-content: space-between; }
        .c02tm-stars { display: flex; gap: 2px; }
        .c02tm-star { width: 15px; height: 15px; }
        .c02tm-google { width: 19px; height: 19px; flex-shrink: 0; opacity: .9; }
        .c02tm-text {
          font-family: 'Bricolage Grotesque',sans-serif;
          font-size: 1.05rem; font-weight: 600; letter-spacing: -0.012em;
          color: #22304A; line-height: 1.55; margin: 0; flex: 1;
        }
        .c02tm-footer { display: flex; align-items: center; gap: .8rem; border-top: 1px solid #EDF1F7; padding-top: 1.15rem; }
        .c02tm-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bricolage Grotesque',sans-serif; font-size: .78rem; font-weight: 800;
          color: var(--color-primary, #1B5BFF); background: #EAF1FF; flex-shrink: 0;
        }
        .c02tm-info { flex: 1; min-width: 0; }
        .c02tm-author { font-weight: 700; color: var(--color-secondary, #0B1526); font-size: .89rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .c02tm-date { font-size: .74rem; color: #98A4B8; margin-top: 2px; font-variant-numeric: tabular-nums; }
        @media (max-width: 900px) { .c02tm-grid { grid-template-columns: 1fr; gap: 1rem; } }
        @media (prefers-reduced-motion: reduce) { .c02tm-card { transition: none; } }
      `}</style>
      <section className="c02tm-section" id="reference" data-template="clean-02-testimonials">
        <div className="c02tm-inner">
          <div className="c02tm-header">
            <p className="c02tm-kicker"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="c02tm-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          <div className="c02tm-grid">
            {items.map((item, i) => (
              <figure key={i} className="c02tm-card" style={{ margin: 0 }}>
                <div className="c02tm-toprow">
                  <div className="c02tm-stars" aria-label={`${item.rating ?? 5} z 5 hvězdiček`}>
                    {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                      <svg key={s} className="c02tm-star" viewBox="0 0 20 20" fill="#F5A623" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <svg className="c02tm-google" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Recenze Google">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <blockquote className="c02tm-text" style={{ margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />
                </blockquote>
                <figcaption className="c02tm-footer">
                  <div className="c02tm-avatar" aria-hidden="true">{initials(item.author ?? "?")}</div>
                  <div className="c02tm-info">
                    <div className="c02tm-author"><GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author ?? ""} tag="span" /></div>
                    <div className="c02tm-date"><GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={item.date ?? ""} tag="span" /></div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── garden-02: Testimonials — 3-col cards, white bg, stars ──────────────── */
function TestimonialsGarden02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrowRaw  = content.eyebrow;
  const titleRaw    = content.title;
  const subtitleRaw = content.subtitle;
  const eyebrow  = eyebrowRaw  === undefined ? "Reference" : String(eyebrowRaw);
  const title    = titleRaw    === undefined ? "Slovo mají naši klienti" : String(titleRaw);
  const subtitle = subtitleRaw === undefined ? "Přes 200 spokojených zákazníků v Praze a okolí — přečtěte si jejich příběhy." : String(subtitleRaw);
  const showHeader = !!(eyebrow.trim() || title.trim() || subtitle.trim());

  const items = ((content.testimonials as Array<{
    rating?: number; text?: string; author?: string; source?: string;
  }>) ?? []);

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const SURFACE = "#f5f5f0";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02tm-section {
          background: ${SURFACE}; padding: 100px 0;
          font-family: ${FONT}; position: relative; overflow: hidden;
        }
        .g02tm-section::after {
          content: ""; position: absolute; top: -60px; right: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(149,193,31,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .g02tm-inner { max-width: 1160px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 1; }
        .g02tm-head { text-align: center; margin-bottom: 3.2rem; }
        .g02tm-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: ${PRIMARY}; margin-bottom: 1rem;
        }
        .g02tm-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${PRIMARY}; box-shadow: 0 0 8px rgba(149,193,31,0.5);
        }
        .g02tm-h2 {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 800;
          color: ${DARK}; margin: 0 0 0.8rem; line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .g02tm-sub {
          font-size: 1rem; color: #666; max-width: 560px;
          margin: 0 auto; line-height: 1.7;
        }
        .g02tm-grid {
          display: grid; gap: 1.25rem;
          grid-template-columns: repeat(auto-fit, minmax(min(320px,100%), 1fr));
        }
        .g02tm-card {
          background: #fff; border-radius: 16px;
          padding: 1.75rem 1.75rem 1.5rem;
          display: flex; flex-direction: column; gap: 1rem;
          box-shadow: 0 2px 16px rgba(26,42,10,0.06);
          border: 1px solid transparent;
          position: relative; overflow: hidden;
          transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
        }
        .g02tm-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0;
          height: 3px; background: ${PRIMARY};
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1.1);
        }
        .g02tm-card:hover {
          border-color: rgba(149,193,31,0.15);
          box-shadow: 0 8px 32px rgba(26,42,10,0.10);
          transform: translateY(-4px);
        }
        .g02tm-card:hover::before { transform: scaleX(1); }
        .g02tm-quote-icon {
          color: ${PRIMARY}; opacity: 0.2; font-size: 2.2rem;
          line-height: 1; font-family: Georgia, serif;
          position: absolute; top: 1rem; right: 1.2rem;
        }
        .g02tm-stars { display: flex; gap: 2px; }
        .g02tm-star { color: ${PRIMARY}; font-size: 0.95rem; line-height: 1; }
        .g02tm-text {
          font-size: 0.95rem; color: #444; line-height: 1.75;
          flex: 1; font-style: italic;
        }
        .g02tm-footer {
          display: flex; align-items: center; gap: 0.75rem;
          padding-top: 0.8rem; border-top: 1px solid #eee;
        }
        .g02tm-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: ${DARK}; color: ${PRIMARY};
          display: flex; align-items: center; justify-content: center;
          font-family: ${FONT}; font-size: 0.82rem; font-weight: 700;
          flex-shrink: 0;
        }
        .g02tm-meta { display: flex; flex-direction: column; }
        .g02tm-author { font-size: 0.88rem; font-weight: 700; color: ${DARK}; }
        .g02tm-source { font-size: 0.7rem; color: #999; font-weight: 500; margin-top: 0.1rem; }
      `}</style>
      <section className="g02tm-section" data-template="garden-02" id="reference">
        <div className="g02tm-inner">
          {showHeader && (
            <div className="g02tm-head">
              {eyebrow.trim() && (
                <div className="g02tm-eyebrow">
                  <span className="g02tm-eyebrow-dot" aria-hidden="true" />
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </div>
              )}
              {title.trim() && (
                <h2 className="g02tm-h2">
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
              )}
              {subtitle.trim() && (
                <p className="g02tm-sub">
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </p>
              )}
            </div>
          )}
          <div className="g02tm-grid">
            {items.map((item, i) => {
              const stars = Math.min(5, Math.max(0, item.rating ?? 5));
              const initials = (item.author ?? "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={i} className="g02tm-card">
                  <span className="g02tm-quote-icon" aria-hidden="true">&ldquo;</span>
                  <div className="g02tm-stars">
                    {Array.from({ length: stars }).map((_, s) => <span key={s} className="g02tm-star">★</span>)}
                  </div>
                  <p className="g02tm-text">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={item.text ?? ""} tag="span" />
                  </p>
                  <div className="g02tm-footer">
                    <div className="g02tm-avatar" aria-hidden="true">{initials}</div>
                    <div className="g02tm-meta">
                      <span className="g02tm-author">
                        <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={item.author ?? ""} tag="span" />
                      </span>
                      {item.source && (
                        <span className="g02tm-source">
                          <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.source`} value={item.source} tag="span" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── arbo-01-testimonials ──────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - White bg, centered heading dark navy
// - 3-col cards desktop / 1-col mobile
// - Each card: large green quote mark, quote text, divider, bold author
// - No stars, no avatars — clean text only
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsArbo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title = String(content.title ?? "Spokojenost, která roste s každou zakázkou");
  const rawItems = (content.items as Array<{ text?: string; author?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { text: "Práce byla hotová za dva dny a od té doby s nimi spolupracujeme. Ceníme si spolehlivost, profesionální přístup a rychlé jednání.", author: "MROZEK a.s." },
    { text: "Splňovala podmínku odbornosti a cenové dostupnosti. Spolupracujeme s touto firmou již třetím rokem.", author: "Vladimír Mužík, místostarosta MČ Praha-Koloděje" },
    { text: "Práce byla provedena včas, precizně, s péčí o okolí domu, naprosto profesionálně. Vřele doporučujeme.", author: "Eva a Tomáš Macháčkovi" },
  ];

  return (
    <>
      <style>{`
        .arbo01-tm {
          background: #fff;
          padding: 5rem 1.5rem;
          font-family: "AlanSans","Inter",system-ui,sans-serif;
        }
        .arbo01-tm-inner {
          max-width: 1370px;
          margin: 0 auto;
        }
        .arbo01-tm-title {
          font-size: clamp(1.5rem, 2.5vw, 2.1rem);
          font-weight: 700;
          color: #051d35;
          text-align: center;
          margin: 0 0 3rem;
          line-height: 1.25;
        }
        .arbo01-tm-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .arbo01-tm-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .arbo01-tm-card {
          background: #f7f6fd;
          border-radius: 10px;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .arbo01-tm-quote-mark {
          font-size: 4rem;
          line-height: 1;
          color: #009739;
          font-family: Georgia, serif;
          margin-bottom: -0.5rem;
          user-select: none;
        }
        .arbo01-tm-text {
          font-size: 0.95rem;
          color: #3d4d5c;
          line-height: 1.7;
          margin: 0;
          flex: 1;
        }
        .arbo01-tm-divider {
          width: 40px;
          height: 2px;
          background: #009739;
          border-radius: 1px;
        }
        .arbo01-tm-author {
          font-size: 0.875rem;
          font-weight: 700;
          color: #051d35;
          margin: 0;
        }
      `}</style>

      <section className="arbo01-tm" id={String(sectionId)} data-template="arbo-01-testimonials">
        <div className="arbo01-tm-inner">
          <h2 className="arbo01-tm-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="arbo01-tm-grid">
            {items.map((item, i) => (
              <div key={i} className="arbo01-tm-card">
                <div className="arbo01-tm-quote-mark" aria-hidden="true">"</div>
                <p className="arbo01-tm-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />
                </p>
                <div className="arbo01-tm-divider" aria-hidden="true" />
                <p className="arbo01-tm-author">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author ?? ""} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-02-testimonials ─────────────────────────────────────────────────────
function TestimonialsMalir02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE  = "var(--color-primary, #ff914d)";
  const DARK    = "var(--color-secondary, #1a1a1a)";
  const POPPINS = "var(--font-body, 'Rubik', sans-serif)";

  type Item = { name: string; role: string; review: string; image: string };
  const heading = typeof content.heading === "string" ? content.heading : "co o nás říkají naši klienti";
  const kicker  = typeof content.kicker  === "string" ? content.kicker  : "Reference";
  const defaultItems: Item[] = [
    { name: "Jana Petelíková", role: "Klientka", review: "Velmi milé jednání, dochvilnost, precizní provedení malby, úklid po sobě samozřejmostí, dodržení předem stanoveného rozpočtu. Z práce jsme nadšeni. Děkujeme.", image: "/templates/malir-02/client-1.jpg" },
    { name: "Martin Dvořák",   role: "Klient",   review: "Perfektní přístup, skvělá komunikace a výsledek předčil naše očekávání. Ochotně poradili s výběrem barev a vše provedli rychle a čistě.",                    image: "/templates/malir-02/client-2.jpg" },
    { name: "Lucie Nováková",  role: "Klientka", review: "Malování proběhlo bez problémů, pracovníci byli velmi profesionální a spolehliví. Doporučím všem svým přátelům.",                                             image: "/templates/malir-02/client-3.jpg" },
  ];
  const items: Item[] = Array.isArray(content.items) && content.items.length ? content.items as Item[] : defaultItems;
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + items.length) % items.length);
  const next = () => setActive(i => (i + 1) % items.length);

  const cur = items[active];

  return (
    <>
      <style>{`
        .m02tm-section {
          background: ${DARK}; padding: 96px 0; position: relative; overflow: hidden;
        }
        /* subtle diagonal stripe pattern */
        .m02tm-section::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            -55deg,
            transparent, transparent 40px,
            rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px
          );
        }
        .m02tm-inner {
          position: relative; z-index: 1;
          max-width: 900px; margin: 0 auto; padding: 0 32px; text-align: center;
        }
        .m02tm-kicker {
          font-family: ${POPPINS}; font-weight: 700; font-size: 11px;
          letter-spacing: 0.18em; text-transform: uppercase; color: ${ORANGE};
          margin: 0 0 40px; display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .m02tm-kicker::before, .m02tm-kicker::after { content: ''; flex: 0 0 32px; height: 1px; background: ${ORANGE}; }
        /* quote mark */
        .m02tm-quote {
          font-family: Georgia, serif; font-size: 120px; line-height: 0.6;
          color: ${ORANGE}; opacity: 0.35; margin-bottom: 24px; display: block;
          user-select: none;
        }
        /* stars */
        .m02tm-stars { color: ${ORANGE}; font-size: 20px; letter-spacing: 3px; margin-bottom: 28px; }
        /* review text */
        .m02tm-review {
          font-family: ${POPPINS}; font-size: clamp(17px, 2.2vw, 22px);
          font-weight: 300; color: rgba(255,255,255,0.88);
          line-height: 1.7; font-style: italic; margin: 0 0 44px;
          min-height: 100px;
        }
        /* avatar + name */
        .m02tm-author { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .m02tm-avatar {
          width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
          border: 3px solid ${ORANGE}; display: block;
        }
        .m02tm-name {
          font-family: ${POPPINS}; font-weight: 700; font-size: 16px; color: #fff; margin: 0;
        }
        .m02tm-role {
          font-family: ${POPPINS}; font-size: 13px; color: rgba(255,255,255,0.45);
          margin: 2px 0 0; letter-spacing: 0.04em;
        }
        /* nav arrows + dots */
        .m02tm-nav { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 44px; }
        .m02tm-arrow {
          background: transparent; border: 1.5px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.6); width: 44px; height: 44px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .m02tm-arrow:hover { border-color: ${ORANGE}; color: ${ORANGE}; }
        .m02tm-dots { display: flex; gap: 8px; }
        .m02tm-dot {
          width: 8px; height: 8px; border-radius: 50%; cursor: pointer;
          background: rgba(255,255,255,0.2); transition: background 0.2s, transform 0.2s;
        }
        .m02tm-dot.active { background: ${ORANGE}; transform: scale(1.3); }
        @media (max-width: 600px) {
          .m02tm-section { padding: 64px 0; }
          .m02tm-review  { font-size: 16px; }
        }
      `}</style>

      <section className="m02tm-section" id="reference" data-template="malir-02">
        <div className="m02tm-inner">
          <p className="m02tm-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span">{kicker}</GenericEditableText>
          </p>

          <span className="m02tm-quote" aria-hidden="true">&ldquo;</span>
          <div className="m02tm-stars" aria-label="5 hvězdiček">★★★★★</div>

          <p className="m02tm-review">
            <GenericEditableText sectionId={sectionId} field={`items.${active}.review`} value={cur.review} tag="span">{cur.review}</GenericEditableText>
          </p>

          <div className="m02tm-author">
            <span className="m02-initials" aria-hidden style={{
            width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", background: "var(--color-primary, #ff914d)", color: "#fff",
            fontFamily: "var(--font-heading, 'Sora', sans-serif)", fontSize: 20, fontWeight: 700,
          }}>{String(cur.name ?? "").split(/\s+/).filter(Boolean).slice(0,2).map((w: string) => w[0]).join("").toUpperCase()}</span>
            <p className="m02tm-name">
              <GenericEditableText sectionId={sectionId} field={`items.${active}.name`} value={cur.name} tag="span">{cur.name}</GenericEditableText>
            </p>
            <p className="m02tm-role">
              <GenericEditableText sectionId={sectionId} field={`items.${active}.role`} value={cur.role} tag="span">{cur.role}</GenericEditableText>
            </p>
          </div>

          <div className="m02tm-nav">
            <button className="m02tm-arrow" onClick={prev} aria-label="Předchozí">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="m02tm-dots">
              {items.map((_, i) => (
                <button key={i} className={`m02tm-dot${i === active ? " active" : ""}`} onClick={() => setActive(i)} aria-label={`Recenze ${i + 1}`} />
              ))}
            </div>
            <button className="m02tm-arrow" onClick={next} aria-label="Další">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────
   video-01-testimonials  — 1:1 honzakamenar.cz
   White bg, eyebrow label, vertical list of 3
   quotes separated by thin dividers, author +
   venue below each, CTA "Další ohlasy" at bottom
───────────────────────────────────────────── */
function TestimonialsVideo01({ content, sectionId, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  isAdmin: boolean;
}) {
  const c = content as {
    eyebrow?: string; ctaText?: string; ctaHref?: string;
    testimonials?: { text: string; author: string; role: string }[];
  };
  const eyebrow = c.eyebrow ?? "Co na filmech oceňují páry:";
  const ctaText = c.ctaText ?? "Další ohlasy";
  const ctaHref = c.ctaHref ?? "#kontakt";
  const items   = c.testimonials ?? [];

  return (
    <section id={String(sectionId)} style={{ background: "#fff" }}>
      <style>{`
        .vd01tm-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 80px 24px 88px;
        }
        .vd01tm-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #C49A6C;
          margin: 0 0 48px;
          display: block;
        }
        .vd01tm-item {
          padding: 36px 0;
          border-top: 1px solid #e8e0d8;
        }
        .vd01tm-item:last-of-type { border-bottom: 1px solid #e8e0d8; }
        .vd01tm-quote {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 22px;
          font-weight: 400;
          color: #2E2A28;
          line-height: 1.55;
          margin: 0 0 18px;
        }
        .vd01tm-quote::before { content: "„"; }
        .vd01tm-quote::after  { content: """; }
        .vd01tm-author {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #2E2A28;
          letter-spacing: 0.04em;
          margin: 0 0 3px;
        }
        .vd01tm-role {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: #9a928c;
          letter-spacing: 0.03em;
          margin: 0;
        }
        .vd01tm-footer {
          margin-top: 48px;
        }
        .vd01tm-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2E2A28;
          text-decoration: none;
          border-bottom: 1px solid #2E2A28;
          padding-bottom: 3px;
          transition: color 0.2s, border-color 0.2s;
        }
        .vd01tm-cta:hover { color: #C49A6C; border-color: #C49A6C; }
        @media (max-width: 600px) {
          .vd01tm-wrap    { padding: 52px 20px 60px; }
          .vd01tm-quote   { font-size: 18px; }
          .vd01tm-eyebrow { font-size: 11px; margin-bottom: 36px; }
          .vd01tm-author  { font-size: 12px; }
          .vd01tm-role    { font-size: 11px; }
          .vd01tm-cta     { font-size: 11px; }
        }
      `}</style>

      <div className="vd01tm-wrap">
        <span className="vd01tm-eyebrow">
          {isAdmin ? <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /> : eyebrow}
        </span>

        {items.map((item, i) => (
          <div key={i} className="vd01tm-item">
            <p className="vd01tm-quote">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={item.text} tag="span" /> : item.text}
            </p>
            <p className="vd01tm-author">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={item.author} tag="span" /> : item.author}
            </p>
            <p className="vd01tm-role">
              {isAdmin ? <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={item.role} tag="span" /> : item.role}
            </p>
          </div>
        ))}

        <div className="vd01tm-footer">
          <a href={ctaHref} data-btn="primary" className="vd01tm-cta">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /> : ctaText}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * eshop-02 "Modrý Košík" — Shoptet Classic DNA
 * Recenze zákazníků: světlé karty s hvězdami, iniciál-avatar,
 * štítek "Ověřený zákazník", agregované hodnocení v hlavičce.
 * ============================================================ */

function Eshop02Stars({ rating }: { rating: number }) {
  return (
    <span className="wc2t-stars" aria-label={`${rating} z 5 hvězdiček`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= rating ? "#f5a623" : "#dbe3ec"} aria-hidden>
          <path d="M12 2l2.9 6.26 6.6.7-4.95 4.57 1.37 6.47L12 16.77 6.08 20l1.37-6.47L2.5 8.96l6.6-.7L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function TestimonialsEshop02({ content, sectionId }: {
  content: Record<string, unknown>;
  sectionId: number;
}) {
  const BLUE = "#1266cc";
  const DARK = "#142b45";
  const MUTED = "#64748b";
  const BORDER = "#e3e9f0";
  const SURFACE = "#f5f8fb";
  const GREEN = "#1f9d55";
  const SANS = "'Open Sans', 'Segoe UI', Arial, sans-serif";

  const eyebrow = content.eyebrow === undefined ? "Recenze" : String(content.eyebrow);
  const heading = content.heading === undefined ? "Co říkají naši zákazníci" : String(content.heading);
  const aggValue = content.aggValue === undefined ? "4,9" : String(content.aggValue);
  const aggLabel = content.aggLabel === undefined ? "z 12 000+ ověřených recenzí" : String(content.aggLabel);
  const items = Array.isArray(content.items) ? (content.items as Array<Record<string, unknown>>) : [];

  return (
    <section className="wc2t" data-variant="eshop-02-testimonials" id={typeof content.anchorId === "string" ? content.anchorId : "recenze"}>
      <style>{`
        .wc2t { background: ${SURFACE}; color: ${DARK}; font-family: ${SANS}; }
        .wc2t-inner { max-width: 1280px; margin: 0 auto; padding: clamp(48px,6vw,84px) 24px; }
        .wc2t-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: clamp(24px,3.5vw,38px); }
        @media (max-width: 720px) { .wc2t-head { flex-direction: column; align-items: flex-start; gap: 16px; } }
        .wc2t-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${BLUE}; margin: 0 0 8px; }
        .wc2t-title { font-size: clamp(24px,3vw,36px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin: 0; color: ${DARK}; }
        .wc2t-agg { flex-shrink: 0; display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid ${BORDER}; border-radius: 12px; padding: 12px 18px; }
        .wc2t-agg-value { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; color: ${DARK}; line-height: 1; }
        .wc2t-agg-meta { display: flex; flex-direction: column; gap: 3px; }
        .wc2t-agg-label { font-size: 12.5px; color: ${MUTED}; }
        .wc2t-stars { display: inline-flex; gap: 2px; }
        .wc2t-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(12px,1.6vw,20px); }
        @media (max-width: 980px) { .wc2t-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px) { .wc2t-grid { grid-template-columns: 1fr; } }
        .wc2t-card { display: flex; flex-direction: column; gap: 12px; background: #fff; border: 1px solid ${BORDER}; border-radius: 12px; padding: 22px; transition: border-color .2s, box-shadow .25s; }
        .wc2t-card:hover { border-color: ${BLUE}; box-shadow: 0 10px 28px rgba(18,102,204,0.10); }
        .wc2t-text { font-size: 14.5px; line-height: 1.7; color: #3b4a5e; margin: 0; flex: 1; }
        .wc2t-foot { display: flex; align-items: center; gap: 12px; padding-top: 14px; border-top: 1px solid ${BORDER}; }
        .wc2t-avatar { flex-shrink: 0; width: 40px; height: 40px; border-radius: 999px; background: ${BLUE}; color: #fff; display: grid; place-items: center; font-size: 15px; font-weight: 700; }
        .wc2t-name { display: block; font-size: 14px; font-weight: 700; color: ${DARK}; }
        .wc2t-verified { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: ${GREEN}; }
      `}</style>
      <div className="wc2t-inner">
        <div className="wc2t-head">
          <div>
            {eyebrow.trim() !== "" && (
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="p" className="wc2t-eyebrow" />
            )}
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="h2" className="wc2t-title" />
          </div>
          <div className="wc2t-agg">
            <GenericEditableText sectionId={sectionId} field="aggValue" value={aggValue} tag="span" className="wc2t-agg-value" />
            <div className="wc2t-agg-meta">
              <Eshop02Stars rating={5} />
              <GenericEditableText sectionId={sectionId} field="aggLabel" value={aggLabel} tag="span" className="wc2t-agg-label" />
            </div>
          </div>
        </div>
        <div className="wc2t-grid">
          {items.map((item, i) => {
            const name = String(item.name ?? "");
            const initial = name.trim().charAt(0).toUpperCase() || "Z";
            const rating = Math.min(5, Math.max(1, Number(item.rating) || 5));
            return (
              <article className="wc2t-card" key={i}>
                <Eshop02Stars rating={rating} />
                <p className="wc2t-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={String(item.text ?? "")} tag="span" />
                </p>
                <div className="wc2t-foot">
                  <span className="wc2t-avatar" aria-hidden>{initial}</span>
                  <div>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" className="wc2t-name" />
                    <span className="wc2t-verified">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                      Ověřený zákazník
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── eshop-07-reviews ────────────────────────────────────────────────────────────
// Kosmetika-zdravi.cz DNA (Néroli parfumerie): centrovaný kicker s hvězdami +
// uppercase nadpis, 3 bílé karty s hairline borderem (jméno + hvězdy, datum,
// text, podtržený odkaz na produkt, volitelná miniatura), šipky po stranách.
// ──────────────────────────────────────────────────────────────────────────────
type Es07Review = { name: string; date?: string; text: string; rating?: number; productLabel?: string; productHref?: string; image?: string };

function TestimonialsEshop07({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const c = content as { kicker?: string; heading?: string; reviews?: Es07Review[] };
  const reviews = c.reviews ?? [];

  const INK = "#16161d";
  const MUTED = "#8b8f9c";
  const BORDER = "#e8e9ed";
  const SURFACE = "#f4f5f7";
  const GOLD = "#f0b429";
  const SANS = "'Hanken Grotesk', 'Segoe UI', Arial, sans-serif";

  const base = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "";
  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".es07r-card");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 400) + 18), behavior: "smooth" });
  };

  if (!reviews.length) return null;

  const Stars = ({ n = 5 }: { n?: number }) => (
    <span style={{ display: "inline-flex", gap: 2 }} aria-label={`${n} z 5 hvězdiček`}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 20 20" fill={s <= n ? GOLD : BORDER}><path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.4l-4.94 2.71.94-5.5-4-3.9 5.61-.87L10 1z" /></svg>
      ))}
    </span>
  );

  return (
    <section style={{ background: "#fff", fontFamily: SANS, padding: "48px 0 40px" }} data-variant="eshop-07-reviews">
      <style>{`
        .es07r-track { display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -ms-overflow-style: none; padding: 2px; }
        .es07r-track::-webkit-scrollbar { display: none; }
        .es07r-card { flex: 0 0 calc(33.33% - 12px); min-width: 300px; scroll-snap-align: start; border: 1px solid ${BORDER}; border-radius: 12px; padding: 24px 26px; background: #fff; transition: border-color 0.16s, transform 0.16s, box-shadow 0.16s; }
        .es07r-card:hover { border-color: ${INK}; transform: translateY(-2px); box-shadow: 0 14px 30px rgba(22,22,29,0.07); }
        .es07r-product { color: ${INK}; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; transition: color 0.14s; }
        .es07r-product:hover { color: #14a99a; }
        .es07r-arrow { position: absolute; top: 46%; z-index: 5; width: 42px; height: 42px; border: 1px solid ${BORDER}; border-radius: 50%; background: #fff; color: ${INK}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s, border-color 0.15s, transform 0.15s; box-shadow: 0 8px 22px rgba(22,22,29,0.12); }
        .es07r-arrow:hover { background: ${INK}; border-color: ${INK}; color: #fff; transform: scale(1.05); }
        @media (max-width: 720px) { .es07r-arrow { display: none; } .es07r-track { margin: 0 -24px; padding: 2px 24px; } }
      `}</style>
      <div style={{ position: "relative", maxWidth: 1360, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          {c.kicker && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <Stars n={5} />
              <GenericEditableText sectionId={sectionId} field="kicker" value={String(c.kicker)} tag="span" style={{
                fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: MUTED,
              }} />
            </div>
          )}
          {c.heading && (
            <GenericEditableText sectionId={sectionId} field="heading" value={String(c.heading)} tag="h2" style={{
              fontFamily: SANS, fontSize: "clamp(19px, 2.2vw, 26px)", fontWeight: 800, color: INK,
              textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
            }} />
          )}
        </div>

        <div className="es07r-track" ref={trackRef}>
          {reviews.map((r, i) => (
            <article key={i} className="es07r-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 15.5, fontWeight: 800, color: INK }}>{r.name}</span>
                <Stars n={Math.max(1, Math.min(5, Math.round(r.rating ?? 5)))} />
              </div>
              {r.date && <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 500, color: MUTED }}>{r.date}</div>}
              <p style={{ margin: "14px 0 0", fontSize: 14, fontWeight: 500, lineHeight: 1.65, color: "#3d3f4a" }}>{r.text}</p>
              {(r.productLabel || r.image) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                  {r.image && (
                    <img src={r.image} alt="" width="44" height="44" loading="lazy" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: SURFACE, flexShrink: 0 }} />
                  )}
                  {r.productLabel && (
                    <a href={isAdmin ? "#" : `${base}${r.productHref ?? "/obchod"}`} className="es07r-product" style={{ fontSize: 13.5, lineHeight: 1.4 }}>{r.productLabel}</a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        {reviews.length > 3 && (
          <>
            <button className="es07r-arrow" style={{ left: 8 }} aria-label="Předchozí" onClick={() => scrollBy(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <button className="es07r-arrow" style={{ right: 8 }} aria-label="Další" onClick={() => scrollBy(1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// rekonstrukce-01 — Byty & Jádra reference karty
// - světlé bg #faf8f5, Inter font, ambrová #C2622B akcent, grafitová #1F1B17
// - eyebrow + H2 + subtitle centrované, ambrová linka pod H2
// - grid karet (bílé bg, radius 12, jemný stín), velké ambrové uvozovky,
//   italic text, jméno tučně + lokalita šedě
// - Responsive: 2-col @992px, 1-col @700px
// ─────────────────────────────────────────────────────────────────────────────
type R01Review = { text?: string; name?: string; location?: string };

function TestimonialsRekonstrukce01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const FONT  = "'Inter', sans-serif";
  const AMBER = "#C2622B";
  const DARK  = "#1F1B17";

  const eyebrow  = String(content.eyebrow  ?? "Reference");
  const title    = String(content.title    ?? "Naši spokojení klienti");
  const subtitle = String(content.subtitle ?? "");
  const items    = (Array.isArray(content.items) ? content.items : []) as R01Review[];

  return (
    <>
      <style>{`
        .r01-testi { background: #faf8f5; padding: clamp(64px, 9vw, 110px) 0; font-family: ${FONT}; }
        .r01-testi-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .r01-testi-eyebrow { display: block; text-align: center; color: ${AMBER}; font-size: 13px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin: 0 0 12px; }
        .r01-testi-h2 { text-align: center; color: ${DARK}; font-size: clamp(28px, 3.4vw, 42px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.12; margin: 0 0 16px; }
        .r01-testi-h2::after { content: ''; display: block; width: 56px; height: 3px; background: ${AMBER}; border-radius: 2px; margin: 18px auto 0; }
        .r01-testi-sub { text-align: center; color: #6f675e; font-size: 16px; line-height: 1.65; max-width: 620px; margin: 0 auto 48px; }
        .r01-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .r01-testi-card { background: #fff; border-radius: 12px; padding: 34px 30px 30px; box-shadow: 0 6px 24px rgba(31,27,23,0.06); border: 1px solid rgba(31,27,23,0.05); display: flex; flex-direction: column; }
        .r01-testi-quote { color: ${AMBER}; font-size: 44px; line-height: 1; font-weight: 800; font-family: Georgia, serif; margin-bottom: 12px; }
        .r01-testi-text { color: #4a443d; font-style: italic; font-size: 15px; line-height: 1.7; margin: 0 0 22px; flex-grow: 1; }
        .r01-testi-name { color: ${DARK}; font-weight: 700; font-size: 15px; margin: 0; }
        .r01-testi-loc { color: #9a9188; font-size: 13px; margin: 3px 0 0; }
        @media (max-width: 992px) { .r01-testi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 700px) { .r01-testi-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section id="reference" className="r01-testi" data-template="rekonstrukce-01">
        <div className="r01-testi-container">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" className="r01-testi-eyebrow" />
          <h2 className="r01-testi-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle.trim() && (
            <p className="r01-testi-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
          <div className="r01-testi-grid">
            {items.map((item, i) => (
              <div key={i} className="r01-testi-card">
                <span className="r01-testi-quote" aria-hidden>&ldquo;</span>
                <p className="r01-testi-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={String(item.text ?? "")} tag="span" />
                </p>
                <p className="r01-testi-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(item.name ?? "")} tag="span" />
                </p>
                {String(item.location ?? "").trim() && (
                  <p className="r01-testi-loc">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={String(item.location ?? "")} tag="span" />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


// barber-03 3col. Vlastní komponenta, aby se hooks nevolaly až za early
// returny dispatcheru — jinak změna varianty za běhu mění počet hooks.
function TestimonialsBarberDark3col({ content, testimonials, title, sectionId }: { content: Record<string, unknown>; testimonials: Testimonial[]; title: string; sectionId: number }) {
    const eyebrow  = String((content as Record<string, unknown>).eyebrow  ?? "");
    const subtitle = String((content as Record<string, unknown>).subtitle ?? "");
    const headRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const els = [headRef.current, gridRef.current].filter(Boolean) as HTMLElement[];
      const obs = els.map((el, i) => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.animationDelay = `${i * 0.15}s`; el.classList.add("b03t-vis"); o.disconnect(); } }, { threshold: 0.1 });
        o.observe(el); return o;
      });
      return () => obs.forEach(o => o.disconnect());
    }, []);
    return (
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "#1c1410",
          padding: "clamp(96px, 13vw, 150px) 24px",
        }}
        data-template="barber-03"
      >
        <style>{`
          @keyframes b03TFadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          .b03t-reveal { opacity: 0; }
          .b03t-reveal.b03t-vis { animation: b03TFadeUp 0.8s cubic-bezier(.22,.68,0,1.1) forwards; }
        `}</style>

        {/* Top + bottom gold hairlines — visual separation from neighbors */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 180, height: 1,
          background: "linear-gradient(90deg, transparent, #c8a96e 50%, transparent)",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: 180, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(200,169,110,0.5) 50%, transparent)",
        }} />

        {/* Warm golden ambient glow center top */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(200,169,110,0.08) 0%, transparent 55%)",
        }} />

        <div className="max-w-[1240px] mx-auto" style={{ position: "relative", zIndex: 1 }}>
          {/* Header — eyebrow + title + subtitle, cinematic urban editorial */}
          <div
            ref={headRef}
            className="b03t-reveal text-center"
            style={{ marginBottom: "clamp(56px, 8vw, 80px)" }}
          >
            {eyebrow && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#c8a96e" }} />
                <span style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "12px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#c8a96e",
                }}>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                </span>
                <span aria-hidden style={{ width: 42, height: 1, backgroundColor: "#c8a96e" }} />
              </div>
            )}
            <h2 style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: "clamp(2rem, 4.2vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "0.04em",
              color: "#f5efe6",
              textTransform: "uppercase",
              margin: "0 auto 22px",
              maxWidth: 760,
            }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {subtitle && (
              <p style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(0.98rem, 1.4vw, 1.1rem)",
                color: "rgba(245,239,230,0.72)",
                lineHeight: 1.7,
                margin: "0 auto",
                maxWidth: 600,
              }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </p>
            )}
            {/* Decorative rule */}
            <div aria-hidden style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 28 }}>
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
              <span style={{ width: 6, height: 6, backgroundColor: "#c8a96e", transform: "rotate(45deg)" }} />
              <span style={{ width: 48, height: 1, backgroundColor: "rgba(200,169,110,0.55)" }} />
            </div>
          </div>

          {/* Grid of testimonial cards */}
          <div ref={gridRef} className="b03t-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: "clamp(20px, 2.5vw, 32px)" }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="b03t-card relative"
                style={{
                  backgroundColor: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(200,169,110,0.2)",
                  padding: "44px 32px 32px",
                  borderRadius: 2,
                  animation: `b03TFadeUp 0.8s cubic-bezier(.22,.68,0,1.1) ${0.3 + i * 0.12}s both`,
                }}
              >
                {/* Big opening quote mark — typographic editorial accent */}
                <span aria-hidden style={{
                  position: "absolute",
                  top: -6, left: 26,
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontSize: "5rem",
                  fontWeight: 700,
                  color: "#c8a96e",
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                  pointerEvents: "none",
                }}>&ldquo;</span>

                {/* Gold corner accent top-right — animates on hover */}
                <span aria-hidden className="b03t-corner" style={{
                  position: "absolute", top: 14, right: 14, width: 20, height: 20,
                  borderTop: "1px solid #c8a96e", borderRight: "1px solid #c8a96e",
                  transition: "all 0.4s cubic-bezier(.22,.68,0,1.1)",
                }} />

                {/* Stars */}
                <div className="flex gap-1 mb-5" style={{ color: "#c8a96e", letterSpacing: "0.16em", fontSize: "1rem" }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="b03t-star" style={{
                      display: "inline-block",
                      transition: "transform 0.35s cubic-bezier(.22,.68,0,1.1)",
                      transitionDelay: `${j * 0.05}s`,
                    }}>★</span>
                  ))}
                </div>

                {/* Quote text */}
                <p style={{
                  color: "rgba(245,239,230,0.88)",
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontStyle: "italic",
                  lineHeight: 1.75,
                  fontSize: "1rem",
                  marginBottom: 28,
                  letterSpacing: "0.01em",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text} tag="span" />
                </p>

                {/* Decorative rule + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto" }}>
                  <span aria-hidden style={{ width: 28, height: 1, backgroundColor: "#c8a96e" }} />
                  <p style={{
                    color: "#c8a96e",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={t.name} tag="span" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
}

// ══ PROOF (proof-01) — reference (editorial featured layout) ═══════════════════
function TestimonialsProof01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title   ?? "Co říkají klienti");
  const lead    = String(content.lead    ?? "Hodnocení z reálných zakázek — bez úprav.");
  type T = { text?: string; quote?: string; name?: string; role?: string; rating?: number };
  const items = (content.testimonials as T[] | undefined) ?? (content.items as T[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .pf01ts { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#6A6E78; --pf-border:#E5E1D8; --pf-surface:#fff;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01ts-inner { max-width:1180px; margin:0 auto; }
        .pf01ts-head { max-width:640px; margin-bottom:clamp(32px,5vw,52px); }
        .pf01ts .pf01-eyebrow{ font-size:.78rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01ts .pf01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01ts-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--pf-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }
        .pf01ts-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01ts-grid { display:grid; grid-template-columns:1.15fr 1fr; gap:18px; }
        .pf01ts-card { display:flex; flex-direction:column; background:var(--pf-surface); border:1px solid var(--pf-border); border-radius:10px; padding:28px;
          transition:transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s; }
        .pf01ts-card:hover { transform:translateY(-4px); box-shadow:0 10px 24px -16px rgba(27,58,92,.22); }
        .pf01ts-card:first-child { grid-row:span 2; background:var(--pf-ink); border-color:var(--pf-ink); color:#fff; justify-content:center; padding:36px 32px; position:relative; overflow:hidden; }
        .pf01ts-card:first-child::after { content:''; position:absolute; bottom:-70px; left:-70px; width:220px; height:220px; border-radius:50%;
          background:none; pointer-events:none; }
        .pf01ts-card:first-child .pf01ts-quote { font-weight:600; font-style:italic; font-size:1.3rem; line-height:1.5; }
        .pf01ts-card:first-child .pf01ts-role { color:rgba(255,255,255,.55); }
        .pf01ts-card:first-child .pf01ts-av { background:var(--pf-accent); }
        .pf01ts-stars { display:flex; gap:3px; margin-bottom:16px; color:var(--pf-accent); }
        .pf01ts-quote { font-size:1.05rem; line-height:1.6; margin:0 0 22px; flex:none; }
        .pf01ts-quote::before { content:'\\201C'; color:var(--pf-accent); font-size:2rem; line-height:0; vertical-align:-.35em; margin-right:4px; }
        .pf01ts-meta { display:flex; align-items:center; gap:12px; }
        .pf01ts-av { width:44px; height:44px; border-radius:50%; background:var(--pf-ink); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0; }
        .pf01ts-name { font-weight:800; font-size:.96rem; }
        .pf01ts-role { font-size:.84rem; color:var(--pf-muted); }
        @media (max-width:820px){ .pf01ts-grid{ grid-template-columns:1fr; } .pf01ts-card:first-child{ grid-row:auto; } }
        @media (prefers-reduced-motion: reduce){ .pf01ts-card{ transition:none; } }
      `}</style>
      <section className="pf01ts" data-template="proof-01" id="reference">
        <div className="pf01ts-inner">
          <div className="pf01ts-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01ts-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01ts-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01ts-grid">
            {items.map((t, i) => {
              const rating = Math.max(1, Math.min(5, Number(t.rating ?? 5)));
              const name = String(t.name ?? "");
              return (
                <figure key={i} className="pf01ts-card" style={{ margin: 0 }}>
                  <div className="pf01ts-stars" role="img" aria-label={`Hodnocení ${rating} z 5`}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <svg key={si} width="17" height="17" viewBox="0 0 24 24" fill={si < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <blockquote className="pf01ts-quote" style={{ margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={String(t.text ?? t.quote ?? "")} tag="span" />
                  </blockquote>
                  <figcaption className="pf01ts-meta">
                    <span className="pf01ts-av" aria-hidden="true">{name.charAt(0) || "?"}</span>
                    <span>
                      <span className="pf01ts-name" style={{ display: "block" }}><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={name} tag="span" /></span>
                      <span className="pf01ts-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={String(t.role ?? "")} tag="span" /></span>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Reference: featured layout — první citace na charcoal, ostatní bílé hairline karty.
function TestimonialsSignal01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title   ?? "Co říkají klienti");
  const lead    = String(content.lead    ?? "Reference od lidí, kteří odpovídají za výsledek — jednatelé, CFO a ředitelé.");
  type T = { text?: string; quote?: string; name?: string; role?: string; rating?: number };
  const items = (content.testimonials as T[] | undefined) ?? (content.items as T[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .sg01ts { --sg-accent:#2563EB; --sg-accent-lt:#6EA8FE; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01ts-inner { max-width:1180px; margin:0 auto; }
        .sg01ts-head { max-width:660px; margin-bottom:clamp(32px,5vw,52px); }
        .sg01ts .sg01-eyebrow{ font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01ts .sg01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01ts-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01ts-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01ts-grid { display:grid; grid-template-columns:1.15fr 1fr; gap:18px; }
        .sg01ts-card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--sg-border); border-radius:10px; padding:28px;
          transition:transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s; }
        .sg01ts-card:hover { transform:translateY(-4px); box-shadow:0 10px 24px -16px rgba(16,20,24,.22); }
        .sg01ts-card:first-child { grid-row:span 2; background:var(--sg-ink); border-color:var(--sg-ink); color:#fff; justify-content:center; padding:36px 32px; }
        .sg01ts-card:first-child .sg01ts-quote { font-weight:600; font-size:1.28rem; line-height:1.55; }
        .sg01ts-card:first-child .sg01ts-role { color:rgba(255,255,255,.72); }
        .sg01ts-card:first-child .sg01ts-av { background:var(--sg-accent); }
        .sg01ts-stars { display:flex; gap:3px; margin-bottom:16px; color:var(--sg-accent); }
        .sg01ts-card:first-child .sg01ts-stars { color:var(--sg-accent-lt); }
        .sg01ts-quote { font-size:1.02rem; line-height:1.6; margin:0 0 22px; flex:none; }
        .sg01ts-quote::before { content:'\\201C'; color:var(--sg-accent); font-size:2rem; line-height:0; vertical-align:-.35em; margin-right:4px; }
        .sg01ts-card:first-child .sg01ts-quote::before { color:var(--sg-accent-lt); }
        .sg01ts-meta { display:flex; align-items:center; gap:12px; }
        .sg01ts-av { width:44px; height:44px; border-radius:50%; background:var(--sg-ink); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0; }
        .sg01ts-name { font-weight:800; font-size:.96rem; }
        .sg01ts-role { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; color:var(--sg-muted); }
        @media (max-width:820px){ .sg01ts-grid{ grid-template-columns:1fr; } .sg01ts-card:first-child{ grid-row:auto; } }
        @media (prefers-reduced-motion: reduce){ .sg01ts-card{ transition:none; } }
      `}</style>
      <section className="sg01ts" data-template="signal-01" id="reference">
        <div className="sg01ts-inner">
          <div className="sg01ts-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01ts-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01ts-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01ts-grid">
            {items.map((t, i) => {
              const rating = Math.max(1, Math.min(5, Number(t.rating ?? 5)));
              const name = String(t.name ?? "");
              return (
                <figure key={i} className="sg01ts-card" style={{ margin: 0 }}>
                  <div className="sg01ts-stars" role="img" aria-label={`Hodnocení ${rating} z 5`}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <svg key={si} width="16" height="16" viewBox="0 0 24 24" fill={si < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <blockquote className="sg01ts-quote" style={{ margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={String(t.text ?? t.quote ?? "")} tag="span" />
                  </blockquote>
                  <figcaption className="sg01ts-meta">
                    <span className="sg01ts-av" aria-hidden="true">{name.charAt(0) || "?"}</span>
                    <span>
                      <span className="sg01ts-name" style={{ display: "block" }}><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={name} tag="span" /></span>
                      <span className="sg01ts-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={String(t.role ?? "")} tag="span" /></span>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── hair-01-testimonials ──────────────────────────────────────────────────────
// V3 Ivory & Brass: hairline karty s iniciálovými avatary (žádné stock portréty),
// brass hvězdy, ratingLine pod titulkem.
function TestimonialsHair01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { name?: string; text?: string; rating?: number };
  const title = String(content.title ?? "Recenze našich klientů");
  const ratingLine = String(content.ratingLine ?? "");
  const items = ((content.items ?? content.testimonials) as Item[]) ?? [];

  return (
    <section data-section-type="testimonials" data-variant="hair-01-cards" className="ha1r-section">
      <style>{`
        .ha1r-section {
          background: var(--color-surface, #FFFFFF);
          padding: clamp(3.5rem, 8vw, 6.5rem) 0;
          font-family: 'Hanken Grotesk', sans-serif;
        }
        .ha1r-inner { max-width: 78rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.5rem); }
        .ha1r-head { text-align: center; margin-bottom: clamp(2rem, 4.5vw, 3rem); }
        .ha1r-eyebrow {
          display: flex; align-items: center; justify-content: center; gap: 0.7rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--color-primary, #A07C33); margin: 0 0 1rem;
        }
        .ha1r-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: var(--color-primary, #A07C33); }
        .ha1r-title {
          font-family: 'Libre Caslon Display', serif; font-weight: 400;
          font-size: clamp(1.9rem, 3.4vw, 2.7rem); color: var(--color-text, #16110C);
          line-height: 1.1; margin: 0 0 0.5rem; text-wrap: balance;
        }
        .ha1r-rating { font-size: 0.9rem; font-weight: 600; color: var(--color-text-muted, #756A5D); margin: 0; }
        .ha1r-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(1.2rem, 2.5vw, 2rem); }
        .ha1r-card {
          border: 1px solid var(--color-border, #E6DDD0); border-radius: 2px;
          padding: clamp(1.5rem, 3vw, 2rem); display: flex; flex-direction: column;
          background: var(--color-bg, #F6F3EE);
        }
        .ha1r-stars { display: flex; gap: 0.2rem; color: var(--color-primary, #A07C33); margin-bottom: 1rem; }
        .ha1r-text { font-size: 0.97rem; line-height: 1.7; color: var(--color-text, #16110C); margin: 0 0 1.4rem; flex: 1; font-style: italic; }
        .ha1r-person { display: flex; align-items: center; gap: 0.75rem; border-top: 1px solid var(--color-border, #E6DDD0); padding-top: 1.1rem; }
        .ha1r-avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: var(--color-secondary, #14100B); color: #F6F3EE;
          display: grid; place-items: center; font-family: 'Libre Caslon Display', serif; font-size: 0.95rem;
        }
        .ha1r-name { font-size: 0.92rem; font-weight: 600; color: var(--color-text, #16110C); margin: 0; }
        @media (max-width: 900px) { .ha1r-grid { grid-template-columns: 1fr; max-width: 34rem; margin: 0 auto; } }
      `}</style>
      <div className="ha1r-inner">
        <div className="ha1r-head">
          <p className="ha1r-eyebrow">Recenze</p>
          <h2 className="ha1r-title" style={{ fontFamily: "'Libre Caslon Display', serif", color: "var(--color-text, #16110C)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {ratingLine && (
            <p className="ha1r-rating"><GenericEditableText sectionId={sectionId} field="ratingLine" value={ratingLine} tag="span" /></p>
          )}
        </div>
        <div className="ha1r-grid">
          {items.map((t, i) => {
            const initials = (t.name ?? "").split(/\s+/).map(w => w[0] ?? "").join("").slice(0, 2).toUpperCase();
            return (
              <figure className="ha1r-card" key={i} style={{ margin: 0 }}>
                <div className="ha1r-stars" aria-label={`${t.rating ?? 5} z 5 hvězd`} role="img">
                  {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                    <svg key={j} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z"/></svg>
                  ))}
                </div>
                <blockquote className="ha1r-text">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={t.text ?? ""} tag="span" />
                </blockquote>
                <figcaption className="ha1r-person">
                  <span className="ha1r-avatar" aria-hidden>{initials}</span>
                  <p className="ha1r-name">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={t.name ?? ""} tag="span" />
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// hair-02-testimonials — V3: tmavá sekce (rytmus), iniciálové avatary (NIKDY stock
// portréty), hvězdy v clay, hairline sloupce. Pole: tagline/title/rating/ratingLabel,
// testimonials[].{author,role,rating,text}.
function TestimonialsHair02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; rating?: string; text?: string };
  const tagline = String(content.tagline ?? "Recenze");
  const title = String(content.title ?? "Co říkají klientky");
  const rating = String(content.rating ?? "");
  const ratingLabel = String(content.ratingLabel ?? "");
  const items = (content.testimonials as T[]) ?? [];
  const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <section id="recenze" data-section-type="testimonials" data-variant="hair-02-testimonials" className="h02tm-section" data-template="hair-02">
      <style>{`
        .h02tm-section {
          background: var(--color-secondary, #3B2B27); font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02tm-inner { max-width: 80rem; margin: 0 auto; }
        .h02tm-head {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
          flex-wrap: wrap; margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
        }
        .h02tm-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #E8A99D;
        }
        .h02tm-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: #E8A99D; }
        .h02tm-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.1rem, 4.4vw, 3.3rem); line-height: 1.08; letter-spacing: -0.02em;
          color: #FBF6F3; margin: 0; text-wrap: balance;
        }
        .h02tm-score { text-align: right; }
        .h02tm-score-v {
          font-family: 'Newsreader', Georgia, serif; font-size: clamp(2.4rem, 5vw, 3.2rem);
          color: #E8A99D; line-height: 1; display: block;
        }
        .h02tm-score-l { font-size: 0.86rem; color: rgba(251,246,243,0.72); }
        .h02tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .h02tm-item {
          padding: 0 clamp(1.2rem, 2.4vw, 2.2rem);
          border-left: 1px solid rgba(251,246,243,0.14);
        }
        .h02tm-item:first-child { padding-left: 0; border-left: none; }
        .h02tm-item:last-child { padding-right: 0; }
        .h02tm-stars { color: #E8A99D; font-size: 0.95rem; letter-spacing: 0.14em; margin-bottom: 1.1rem; }
        .h02tm-text {
          font-size: 1.02rem; line-height: 1.72; color: rgba(251,246,243,0.88); margin: 0 0 1.6rem;
        }
        .h02tm-who { display: flex; align-items: center; gap: 0.85rem; }
        .h02tm-av {
          width: 2.8rem; height: 2.8rem; border-radius: 999px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-primary, #C0685C); color: #fff;
          font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em;
        }
        .h02tm-name { font-size: 0.98rem; font-weight: 600; color: #FBF6F3; display: block; }
        .h02tm-role { font-size: 0.84rem; color: rgba(251,246,243,0.62); }
        @media (max-width: 899px) {
          .h02tm-grid { grid-template-columns: 1fr; gap: 2.2rem; }
          .h02tm-item { padding: 2.2rem 0 0; border-left: none; border-top: 1px solid rgba(251,246,243,0.14); }
          .h02tm-item:first-child { padding-top: 0; border-top: none; }
          .h02tm-score { text-align: left; }
        }
      `}</style>
      <div className="h02tm-inner">
        <div className="h02tm-head">
          <div>
            <span className="h02tm-eyebrow">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </span>
            <h2 className="h02tm-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          {rating && (
            <div className="h02tm-score">
              <span className="h02tm-score-v">
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </span>
              <span className="h02tm-score-l">
                <GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" />
              </span>
            </div>
          )}
        </div>
        <div className="h02tm-grid">
          {items.map((t, i) => (
            <figure className="h02tm-item" key={i}>
              <div className="h02tm-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>
                {"★".repeat(Number(t.rating ?? 5) || 5)}
              </div>
              <blockquote className="h02tm-text">
                <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" />
              </blockquote>
              <figcaption className="h02tm-who">
                <span className="h02tm-av" aria-hidden>{initials(t.author ?? "")}</span>
                <span>
                  <span className="h02tm-name">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" />
                  </span>
                  <span className="h02tm-role">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role ?? ""} tag="span" />
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// hair-03-testimonials — V3: bílá sekce, velký Archivo citát, iniciálové avatary
// (NIKDY stock portréty), oxblood hvězdy. Pole: tagline/title/rating/ratingLabel,
// testimonials[].{author,role,rating,text}.
function TestimonialsHair03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; rating?: string; text?: string };
  const tagline = String(content.tagline ?? "Recenze");
  const title = String(content.title ?? "Co říkají klienti");
  const rating = String(content.rating ?? "");
  const ratingLabel = String(content.ratingLabel ?? "");
  const items = (content.testimonials as T[]) ?? [];
  const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <section id="recenze" data-section-type="testimonials" data-variant="hair-03-testimonials" className="h03rv-section" data-template="hair-03">
      <style>{`
        .h03rv-section {
          background: var(--color-surface, #FFFFFF); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03rv-inner { max-width: 82rem; margin: 0 auto; }
        .h03rv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
        .h03-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--color-primary, #8E2B36);
        }
        .h03-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #8E2B36); }
        .h03rv-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110); margin: 0; text-wrap: balance;
        }
        .h03rv-score { text-align: right; }
        .h03rv-score-v { font-family: 'Archivo', sans-serif; font-weight: 800; font-size: clamp(2.2rem, 4.5vw, 3rem); color: var(--color-primary, #8E2B36); line-height: 1; display: block; }
        .h03rv-score-l { font-size: 0.84rem; color: var(--color-text-muted, #6E645D); }
        .h03rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .h03rv-item { padding: 0 clamp(1.2rem, 2.4vw, 2.2rem); border-left: 1px solid var(--color-border, #E0D9D2); }
        .h03rv-item:first-child { padding-left: 0; border-left: none; }
        .h03rv-item:last-child { padding-right: 0; }
        .h03rv-stars { color: var(--color-primary, #8E2B36); font-size: 0.92rem; letter-spacing: 0.16em; margin-bottom: 1rem; }
        .h03rv-text { font-size: 1.02rem; line-height: 1.7; color: var(--color-text, #141110); margin: 0 0 1.5rem; }
        .h03rv-who { display: flex; align-items: center; gap: 0.85rem; }
        .h03rv-av {
          width: 2.7rem; height: 2.7rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          background: var(--color-text, #141110); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.04em;
        }
        .h03rv-name { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 0.96rem; color: var(--color-text, #141110); display: block; }
        .h03rv-role { font-size: 0.83rem; color: var(--color-text-muted, #6E645D); }
        @media (max-width: 899px) {
          .h03rv-grid { grid-template-columns: 1fr; gap: 2rem; }
          .h03rv-item { padding: 2rem 0 0; border-left: none; border-top: 1px solid var(--color-border, #E0D9D2); }
          .h03rv-item:first-child { padding-top: 0; border-top: none; }
          .h03rv-score { text-align: left; }
        }
      `}</style>
      <div className="h03rv-inner">
        <div className="h03rv-head">
          <div>
            <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
            <h2 className="h03rv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          {rating && (
            <div className="h03rv-score">
              <span className="h03rv-score-v"><GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" /></span>
              <span className="h03rv-score-l"><GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" /></span>
            </div>
          )}
        </div>
        <div className="h03rv-grid">
          {items.map((t, i) => (
            <figure className="h03rv-item" key={i}>
              <div className="h03rv-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>{"★".repeat(Number(t.rating ?? 5) || 5)}</div>
              <blockquote className="h03rv-text"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" /></blockquote>
              <figcaption className="h03rv-who">
                <span className="h03rv-av" aria-hidden>{initials(t.author ?? "")}</span>
                <span>
                  <span className="h03rv-name"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" /></span>
                  <span className="h03rv-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role ?? ""} tag="span" /></span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// hair-04-testimonials — V3 Studio Pop: bílá sekce, karty s violet iniciálovými avatary
// (NIKDY stock portréty). Pole: tagline/title/rating/ratingLabel, testimonials[].
function TestimonialsHair04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; rating?: string; text?: string };
  const tagline = String(content.tagline ?? "Recenze");
  const title = String(content.title ?? "Co říkají klienti");
  const rating = String(content.rating ?? "");
  const ratingLabel = String(content.ratingLabel ?? "");
  const items = (content.testimonials as T[]) ?? [];
  const ini = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <section id="recenze" data-section-type="testimonials" data-variant="hair-04-testimonials" className="h04rv-section" data-template="hair-04">
      <style>{`
        .h04rv-section { background: var(--color-surface, #FFFFFF); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04rv-inner { max-width: 82rem; margin: 0 auto; }
        .h04rv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
          flex-wrap: wrap; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
        .h04-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-primary, #6D4AFF);
        }
        .h04-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #6D4AFF); }
        .h04rv-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.06; color: var(--color-text, #17132A); margin: 0; text-wrap: balance; }
        .h04rv-score { text-align: right; }
        .h04rv-score-v { font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          font-size: clamp(2.2rem, 4.5vw, 3rem); color: var(--color-primary, #6D4AFF); line-height: 1; display: block; }
        .h04rv-score-l { font-size: 0.84rem; color: var(--color-text-muted, #6A6382); }
        .h04rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.2rem, 2.4vw, 1.8rem); }
        .h04rv-card { background: var(--color-bg, #F5F4FA); border-radius: 14px; padding: clamp(1.4rem, 2.4vw, 1.9rem); display: flex; flex-direction: column; }
        .h04rv-stars { color: var(--color-primary, #6D4AFF); font-size: 0.92rem; letter-spacing: 0.16em; margin-bottom: 0.9rem; }
        .h04rv-text { font-size: 1rem; line-height: 1.68; color: var(--color-text, #17132A); margin: 0 0 1.4rem; flex: 1; }
        .h04rv-who { display: flex; align-items: center; gap: 0.8rem; }
        .h04rv-av { width: 2.7rem; height: 2.7rem; border-radius: 999px; flex-shrink: 0; display: flex;
          align-items: center; justify-content: center; background: var(--color-primary, #6D4AFF); color: #fff;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.86rem; font-weight: 700; }
        .h04rv-name { font-weight: 600; font-size: 0.96rem; color: var(--color-text, #17132A); display: block; }
        .h04rv-role { font-size: 0.83rem; color: var(--color-text-muted, #6A6382); }
        @media (max-width: 899px) { .h04rv-grid { grid-template-columns: 1fr; } .h04rv-score { text-align: left; } }
      `}</style>
      <div className="h04rv-inner">
        <div className="h04rv-head">
          <div>
            <span className="h04-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
            <h2 className="h04rv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          {rating && (
            <div className="h04rv-score">
              <span className="h04rv-score-v"><GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" /></span>
              <span className="h04rv-score-l"><GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" /></span>
            </div>
          )}
        </div>
        <div className="h04rv-grid">
          {items.map((t, i) => (
            <figure className="h04rv-card" key={i}>
              <div className="h04rv-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>{"★".repeat(Number(t.rating ?? 5) || 5)}</div>
              <blockquote className="h04rv-text"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" /></blockquote>
              <figcaption className="h04rv-who">
                <span className="h04rv-av" aria-hidden>{ini(t.author ?? "")}</span>
                <span>
                  <span className="h04rv-name"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" /></span>
                  <span className="h04rv-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role ?? ""} tag="span" /></span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
