"use client";

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
  if (variant === "stavba-03-testimonials") return <TestimonialsStavba03 content={content} sectionId={sectionId} />;
  if (variant === "stavba-02-testimonials") return <TestimonialsStavba02 content={content} sectionId={sectionId} />;
  if (variant === "stavba-01-testimonials") return <TestimonialsStavba01 content={content} sectionId={sectionId} />;
  if (variant === "instala-01-testimonials") return <TestimonialsInstala01 content={content} sectionId={sectionId} />;
  if (variant === "fitness-01-testimonials-2col") return <TestimonialsFitness01 content={content} sectionId={sectionId} />;
  if (variant === "ananda-01-testimonials")  return <TestimonialsAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "tawan-02-testimonials")   return <TestimonialsTawan02 content={content} sectionId={sectionId} />;
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
  const [active, setActive] = useState(0);

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
  if (variant === "malir-01-testimonials")    return <TestimonialsMalir01 content={content} sectionId={sectionId} />;
  if (variant === "clean-02-testimonials")    return <TestimonialsClean02 content={content} sectionId={sectionId} />;
  if (variant === "garden-02-testimonials")   return <TestimonialsGarden02 content={content} sectionId={sectionId} />;
  if (variant === "arbo-01-testimonials")     return <TestimonialsArbo01  content={content} sectionId={sectionId} />;
  if (variant === "video-01-testimonials")   return <TestimonialsVideo01 content={content} sectionId={sectionId} isAdmin={isAdmin} />;

  if (!testimonials.length) return null;

  // beauty-01: 3-col grid, cream bg, uppercase title, star rating per card
  // Reference: selfbeautystudio.com — "MILÁČEK V SRDCI PRAHY", simple text cards
  if (variant === "beauty-01-testimonials-3col") {
    const subtitle    = String(content.subtitle    ?? "Co říkají naši klienti:");
    const ratingLine  = String(content.ratingLine  ?? "Hodnocení 5★ od našich klientů");
    const CREAM2  = "#F5EDE4";
    const DARK    = "#1F1F1F";
    const MUTED   = "#5B4D43";
    const SAND    = "#E0BE9A";
    const FONT_H  = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const FONT_B  = "'Fahkwang', sans-serif";
    return (
      <section id="reference" style={{ backgroundColor: CREAM2, padding: "80px 24px" }} data-template="beauty-01">
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, letterSpacing: "0.22em", color: MUTED, textTransform: "uppercase", marginBottom: 10 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </p>
            {subtitle && (
              <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, color: DARK, marginBottom: 12 }}>
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </h2>
            )}
            {ratingLine && (
              <p style={{ fontFamily: FONT_B, fontSize: 13, fontWeight: 300, color: MUTED, letterSpacing: "0.06em" }}>
                <GenericEditableText sectionId={sectionId} field="ratingLine" value={ratingLine} tag="span" />
              </p>
            )}
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {testimonials.map((t, i) => (
              <div
                key={`rev-${i}`}
                style={{
                  backgroundColor: "#FFF8F1",
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* Stars */}
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                    <span key={j} style={{ color: SAND, fontSize: 16 }}>★</span>
                  ))}
                </div>
                {/* Quote text */}
                <p style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 300, color: DARK, lineHeight: 1.75, flex: 1, fontStyle: "italic" }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={t.text} tag="span" />&rdquo;
                </p>
                {/* Divider */}
                <div style={{ width: 32, height: 1, backgroundColor: SAND }} aria-hidden />
                {/* Name + role */}
                <div>
                  <p style={{ fontFamily: FONT_H, fontSize: 17, fontWeight: 400, color: DARK, marginBottom: 3 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={t.name} tag="span" />
                  </p>
                  {t.role && (
                    <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={t.role} tag="span" />
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // hair-01: white bg, rating line, horizontal card row
  if (variant === "hair-01-cards") {
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const ratingLine = String((content as Record<string,unknown>).ratingLine ?? "");
    return (
      <section
        data-template="hair-01"
        style={{ backgroundColor: "#ffffff", padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", fontFamily: MONO }}
      >
        <div className="max-w-[1440px] mx-auto">
          {ratingLine && (
            <p style={{ color: GOLD, fontSize: 12, fontWeight: 500, letterSpacing: "0.14em", textAlign: "center", marginBottom: 8, textTransform: "uppercase" }}>
              {ratingLine}
            </p>
          )}
          <h2
            className="text-center"
            style={{ color: "#1e1e1e", fontSize: "clamp(20px,2.2vw,32px)", fontWeight: 300, letterSpacing: "0.06em", marginBottom: "clamp(40px,5vw,64px)" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px,100%),1fr))" }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{ backgroundColor: "#f5f1f0", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ color: GOLD, letterSpacing: "0.08em", fontSize: 14 }}>
                  {Array.from({ length: t.rating }).map((_, j) => <span key={j}>★</span>)}
                </div>
                <p style={{ color: "#1e1e1e", fontSize: 14, fontWeight: 300, lineHeight: 1.8, fontStyle: "italic", flex: 1 }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text} tag="span" />&rdquo;
                </p>
                <p style={{ color: "#605f5f", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={t.name} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "barber-04-single-stars") {
    const t = testimonials[active] ?? testimonials[0];
    const count = testimonials.length;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const secRef = useRef<HTMLElement>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const el = secRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("b04t-vis"); obs.disconnect(); } }, { threshold: 0.15 });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);
    return (
      <section
        ref={secRef}
        className="relative b04t-reveal"
        style={{ padding: "88px 24px", backgroundColor: "#ffffff" }}
        data-template="barber-04"
      >
        <style>{`
          @keyframes b04FadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          .b04t-reveal { opacity: 0; }
          .b04t-reveal.b04t-vis { animation: b04FadeUp 0.72s cubic-bezier(.22,.68,0,1.2) forwards; }
        `}</style>
        <div className="max-w-[860px] mx-auto text-center">
          {title && (
            <h2
              className="uppercase"
              style={{
                fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                fontWeight: 300,
                fontSize: "clamp(22px, 2.2vw, 34px)",
                letterSpacing: 0,
                color: "#d5b981",
                margin: "0 auto 14px",
                lineHeight: 1.2,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          )}
          <div
            aria-hidden
            className="mx-auto"
            style={{ width: 60, height: 2, backgroundColor: "#d5b981", opacity: 0.7, margin: "0 auto 28px" }}
          />
          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-6" aria-label={`${t.rating ?? 5} z 5 hvězd`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={`star-${i}`}
                width="22"
                height="22"
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
              fontStyle: "italic",
              fontSize: "clamp(15px, 1.2vw, 19px)",
              color: "#1a1a1a",
              lineHeight: 1.7,
              maxWidth: 720,
              margin: "0 auto 24px",
            }}
          >
            <GenericEditableText sectionId={sectionId} field={`testimonials.${active}.text`} value={t.text} tag="span" />
          </p>
          {/* Author */}
          <p
            className="uppercase"
            style={{
              fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
              fontWeight: 400,
              fontSize: 18,
              letterSpacing: 1.5,
              color: "#d5b981",
            }}
          >
            <GenericEditableText sectionId={sectionId} field={`testimonials.${active}.name`} value={t.name} tag="span" />
          </p>

          {/* Pagination (jen pokud > 1 recenze) */}
          {count > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10" aria-hidden>
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
                    backgroundColor: i === active ? "#d5b981" : "rgba(0,0,0,0.25)",
                    padding: 0,
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
                className="relative flex items-center justify-center w-6 h-6 rounded-full transition-all"
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

  if (variant === "barber-dark-3col") {
    const headRef = useRef<HTMLHeadingElement>(null);
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
      <section className="px-6" style={{ backgroundColor: "#1c1410", padding: "clamp(56px, 10vw, 100px) 24px" }} data-template="barber-03">
        <style>{`
          @keyframes b03FadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
          .b03t-reveal { opacity: 0; }
          .b03t-reveal.b03t-vis { animation: b03FadeUp 0.7s cubic-bezier(.22,.68,0,1.2) forwards; }
          .b03t-card { transition: transform 0.32s ease, box-shadow 0.32s ease, border-color 0.32s ease; }
          .b03t-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.45); border-color: rgba(200,169,110,0.55) !important; }
        `}</style>
        <div className="max-w-[1200px] mx-auto">
          <h2
            ref={headRef}
            className="b03t-reveal text-center uppercase mb-8 md:mb-16"
            style={{ fontFamily: "var(--font-heading)", color: "#c8a96e", fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "0.16em" }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div ref={gridRef} className="b03t-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="b03t-card p-8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,169,110,0.18)", borderRadius: 2 }}
              >
                <div className="flex gap-1 mb-4" style={{ color: "#c8a96e", letterSpacing: "0.18em" }}>
                  {Array.from({ length: t.rating }).map((_, j) => (<span key={j}>★</span>))}
                </div>
                <p style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontStyle: "italic", lineHeight: 1.7, fontSize: "0.98rem", marginBottom: "1.5rem" }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text} tag="span" />&rdquo;
                </p>
                <p style={{ color: "#c8a96e", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={t.name} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
  const sectionTag   = String(content.sectionTag   ?? "Reference");
  const heading      = String(content.heading      ?? "Co říkají naši klienti");
  const googleRating = String(content.googleRating ?? "4.9");
  const googleCount  = String(content.googleCount  ?? "80 recenzí");
  const raw = (content.items as Array<{ text: string; author: string; stars: number }>) ?? [];

  const SURFACE   = "#141414";
  const BG        = "#0A0A0A";
  const BORDER    = "#2A2520";
  const GOLD      = "#C9A962";
  const TEXT      = "#F5F0E8";
  const SECONDARY = "#A09888";
  const STAR      = "#FBBF24";
  const FONT      = "'Inter', sans-serif";
  const SERIF     = "'Cormorant Garamond', serif";

  const PER_VIEW = 4;
  const GAP      = 24;

  // Pad to at least PER_VIEW items so we always have a full first page
  const items = raw.length >= PER_VIEW
    ? raw
    : [...raw, ...raw, ...raw, ...raw].slice(0, PER_VIEW);
  const track = [...items, ...items, ...items];
  const startIdx = items.length;

  const [idx, setIdx]             = useState(startIdx);
  const [animated, setAnimated]   = useState(true);
  const viewportRef               = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);
  const transitioning             = useRef(false);
  const idxRef                    = useRef(startIdx);

  useEffect(() => {
    const measure = () => {
      if (viewportRef.current) {
        const vw = viewportRef.current.offsetWidth;
        setCardWidth((vw - GAP * (PER_VIEW - 1)) / PER_VIEW);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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

  const StarIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={STAR}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );

  const ArrowBtn = ({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={dir === "left" ? "Předchozí" : "Další"}
        style={{
          width: 48, height: 48, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          border: `1px solid ${hovered ? GOLD : BORDER}`,
          color: hovered ? GOLD : SECONDARY,
          cursor: "pointer",
          transition: "border-color 0.25s, color 0.25s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {dir === "left"
            ? <path d="M15 18l-6-6 6-6"/>
            : <path d="M9 18l6-6-6-6"/>
          }
        </svg>
      </button>
    );
  };

  return (
    <section
      id="reference"
      style={{ backgroundColor: SURFACE, padding: "100px 0" }}
      data-template="massage-01"
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 80px" }}>
        {/* Section header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", marginBottom: 48 }}>
          <p style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontFamily: FONT, fontSize: 11, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, background: GOLD, borderRadius: "50%" }} />
            <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: TEXT, lineHeight: 1.1, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* Google rating bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: TEXT }}>
            <GenericEditableText sectionId={sectionId} field="googleRating" value={googleRating} tag="span" />
          </span>
          <div style={{ display: "flex", gap: 4 }}>{[1,2,3,4,5].map(n => <StarIcon key={n} size={20} />)}</div>
          <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, color: SECONDARY }}>
            <GenericEditableText sectionId={sectionId} field="googleCount" value={googleCount} tag="span" />
          </span>
        </div>

        {/* Viewport */}
        <div ref={viewportRef} style={{ overflow: "hidden", marginBottom: 32 }}>
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: "flex",
              gap: GAP,
              transform: `translateX(-${offset}px)`,
              transition: animated ? "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
              willChange: "transform",
            }}
          >
            {track.map((item, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: cardWidth > 0 ? cardWidth : `calc((100% - ${GAP * (PER_VIEW - 1)}px) / ${PER_VIEW})`,
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: item.stars ?? 5 }).map((_, n) => <StarIcon key={n} />)}
                </div>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, color: SECONDARY, lineHeight: 1.6, margin: 0, flex: 1 }}>
                  {item.text}
                </p>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: TEXT, margin: 0 }}>
                  {item.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Šipky pod sliderem */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
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


// ── ananda-01-testimonials ────────────────────────────────────────────────────
function TestimonialsAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title      = String(content.title      ?? "VAŠE ZKUŠENOSTI S ANANDA SPA");
  const scoreLabel = String(content.scoreLabel ?? "Hodnocení obchodu");
  const score      = String(content.score      ?? "4.8/5.0");
  const countLabel = String(content.countLabel ?? "Počet názorů");
  const count      = String(content.count      ?? "53");

  type Review = { date: string; rating: number; text: string; author?: string };
  const reviews: Review[] = (content.reviews as Review[] | undefined) ?? [
    { date: "29.03.2026", rating: 4, author: "Jana K.",    text: "Masáž perfektní, indická masérka byla zdvořilá s citlivým přístupem." },
    { date: "27.02.2026", rating: 5, author: "Petra N.",   text: "Ananda Spa mohu jen vřele doporučit. Velmi profesionální a lidský přístup, klidná atmosféra a opravdová péče o klienta." },
    { date: "25.01.2026", rating: 5, author: "Martina V.", text: "Masáže byly hluboce uvolňující a ájurvéda provedena s citem a znalostí. Cítila jsem se zrelaxovaná ještě dlouho po návštěvě." },
    { date: "22.01.2026", rating: 5, author: "Lucie M.",   text: "Nádherné prostředí, profesionální přístup. Určitě se vrátím." },
  ];

  const [idx, setIdx] = useState(0);
  const perView = 2;
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
    <section id="recenze" style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
      <style>{`
        .ana-rev-wrap { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
        .ana-rev-body { display: grid; grid-template-columns: 220px 1fr; gap: 64px; align-items: start; margin-top: 56px; }
        @media(max-width: 768px) { .ana-rev-body { grid-template-columns: 1fr; gap: 40px; } }
        .ana-rev-slider { overflow: hidden; }
        .ana-rev-track { display: flex; gap: 24px; transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94); }
        .ana-rev-card {
          flex: 0 0 calc(50% - 12px);
          background: ${CREAM};
          padding: 28px;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media(max-width: 640px) { .ana-rev-card { flex: 0 0 100%; } }
        .ana-rev-nav { display: flex; gap: 12px; margin-top: 28px; }
        .ana-rev-btn {
          width: 44px; height: 44px;
          border: 1.5px solid ${GOLD};
          background: transparent;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
          color: ${GOLD};
        }
        .ana-rev-btn:hover { background: ${GOLD}; color: #fff; }
        .ana-rev-btn:disabled { opacity: 0.3; cursor: default; }
        .ana-rev-btn:disabled:hover { background: transparent; color: ${GOLD}; }
      `}</style>

      <div className="ana-rev-wrap">
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(16px,2vw,20px)", fontWeight: 500, color: GOLD, letterSpacing: 5, textTransform: "uppercase", margin: 0, textAlign: "center" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="ana-rev-body">
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
            <div className="ana-rev-slider">
              <div className="ana-rev-track" style={{ transform: `translateX(calc(-${idx} * (100% / 2 + 12px)))` }}>
                {reviews.map((r, i) => (
                  <div key={i} className="ana-rev-card">
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

            <div className="ana-rev-nav">
              <button className="ana-rev-btn" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} aria-label="Předchozí">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="ana-rev-btn" onClick={() => setIdx(i => Math.min(maxIdx, i + 1))} disabled={idx >= maxIdx} aria-label="Další">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── tawan-02-testimonials ───────────────────────────────────────────────────
function TestimonialsTawan02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { text?: string; author?: string; name?: string };
  const title = String(content.title ?? "Reference návštěvníků");
  const raw = (content.items ?? content.testimonials ?? content.reviews ?? []) as Item[];
  const items = raw.map(r => ({ text: r.text ?? "", author: r.author ?? r.name ?? "" }));

  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const goTo = (idx: number) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => { setActive(idx); setFading(false); }, 320);
  };

  const advance = (dir: 1 | -1) => goTo((active + dir + items.length) % items.length);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(a => (a + 1) % items.length);
        setFading(false);
      }, 320);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const FONT   = "Candara, 'Trebuchet MS', Arial, sans-serif";
  const ACCENT = "#AD8F78";

  return (
    <section style={{
      padding: "50px 0 70px",
      textAlign: "center",
      fontFamily: FONT,
      backgroundImage: "url(/clones/escape/wp-content/themes/twentyseventeen/assets/images/flower-testimonial.png)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "bottom right",
      backgroundColor: "#fff",
    }}>
      <style>{`
        .t02-sep { display: flex; align-items: center; column-gap: 10px; margin: 0 auto 30px; justify-content: center; }
        .t02-sep::before, .t02-sep::after { content: ''; width: 60px; height: 1px; background: ${ACCENT}; }
        .t02-tsm-quote { font-size: clamp(17px,2vw,22px); line-height: 1.9; color: rgba(60,47,37,0.7); margin: 0 0 20px; transition: opacity 0.32s ease; }
        .t02-tsm-author { font-size: 18px; color: #3C2F25; font-weight: 600; transition: opacity 0.32s ease; }
        .t02-tsm-dots { display: flex; justify-content: center; gap: 8px; margin-top: 32px; }
        .t02-tsm-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(146,114,89,0.3); border: none; cursor: pointer; padding: 0; transition: background 0.2s, transform 0.2s; }
        .t02-tsm-dot.active { background: ${ACCENT}; transform: scale(1.25); }
        .t02-tsm-arrows { display: flex; justify-content: center; gap: 20px; margin-top: 28px; }
        .t02-tsm-arr { width: 40px; height: 40px; border-radius: 50%; border: 1.5px solid ${ACCENT}; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: ${ACCENT}; transition: background 0.2s, color 0.2s; }
        .t02-tsm-arr:hover { background: ${ACCENT}; color: #fff; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ fontFamily: FONT, fontSize: "clamp(24px,3vw,38px)", fontWeight: 700, color: "#3C2F25", marginBottom: 0 }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="t02-sep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src="/clones/escape/wp-content/uploads/2023/08/heart.png" alt="" style={{ height: 26 }} />
        </div>

        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p className="t02-tsm-quote" style={{ opacity: fading ? 0 : 1 }}>
            <GenericEditableText sectionId={sectionId} field={`items.${active}.text`} value={items[active]?.text ?? ""} tag="span" />
          </p>
          <p className="t02-tsm-author" style={{ opacity: fading ? 0 : 1 }}>
            — <GenericEditableText sectionId={sectionId} field={`items.${active}.author`} value={items[active]?.author ?? ""} tag="span" /> —
          </p>
        </div>

        <div className="t02-tsm-arrows">
          <button className="t02-tsm-arr" onClick={() => advance(-1)} aria-label="Předchozí">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M7 1.5L3 5L7 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="t02-tsm-arr" onClick={() => advance(1)} aria-label="Další">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="t02-tsm-dots" role="tablist">
          {items.map((_, i) => (
            <button key={i} className={`t02-tsm-dot${i === active ? " active" : ""}`} onClick={() => goTo(i)} aria-label={`Reference ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── tattoo-01-testimonials ────────────────────────────────────────────────────
function TestimonialsTattoo01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const heading = String(content.heading ?? "Co říkají naši klienti");
  type TItem = { text?: string; quote?: string; author?: string; image?: string };
  const items = (content.testimonials as TItem[]) ?? [];
  const ACCENT = "#ff5c4b";
  const SANS   = "Arial, Helvetica, sans-serif";

  return (
    <section
      id="reference"
      data-template="tattoo-01"
      style={{ backgroundColor: "#0f0f0f", padding: "clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px)" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(16px, 2.5vw, 28px)",
          }}
        >
          {items.map((item, i) => {
            const text   = item.text ?? item.quote ?? "";
            const author = item.author ?? "";
            const image  = item.image ?? "";
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 320,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "clamp(24px, 3vw, 36px)",
                  backgroundColor: "#1a1a1a",
                }}
              >
                {image && (
                  <>
                    <GenericEditableImage
                      sectionId={sectionId}
                      field={`testimonials.${i}.image`}
                      src={image}
                      alt=""
                      className="absolute inset-0 w-full h-full"
                      style={{ position: "absolute" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt=""
                        aria-hidden
                        style={{
                          position: "absolute", inset: 0,
                          width: "100%", height: "100%",
                          objectFit: "cover", objectPosition: "center",
                          display: "block",
                          opacity: 0.28,
                        }}
                      />
                    </GenericEditableImage>
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.2) 100%)",
                    }} aria-hidden />
                  </>
                )}

                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 20,
                    left: "clamp(20px, 3vw, 32px)",
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(72px, 8vw, 96px)",
                    fontWeight: 700,
                    color: ACCENT,
                    lineHeight: 1,
                    opacity: 0.5,
                    userSelect: "none",
                  }}
                >&ldquo;</div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <p
                    style={{
                      fontFamily: SANS,
                      fontSize: "clamp(0.9rem, 1.3vw, 1rem)",
                      fontWeight: 300,
                      color: "rgba(255,255,255,0.88)",
                      lineHeight: 1.7,
                      margin: "0 0 20px",
                      fontStyle: "italic",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={text} tag="span" />
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 1.5, backgroundColor: ACCENT, flexShrink: 0 }} aria-hidden />
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={author} tag="span" />
                    </span>
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
  const c       = content as Record<string, unknown>;
  const heading = String(c.heading ?? "Co říkají naši zákazníci");
  const items   = (c.items as Array<{
    author: string; role?: string; text: string; rating?: number;
  }>) ?? [];

  const GOLD = "#BF8A1D";

  const Stars = ({ count = 5 }: { count?: number }) => (
    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={i < count ? GOLD : "#e0e0e0"} aria-hidden>
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <>
      <style>{`
        .tt02-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        @media (max-width: 860px) { .tt02-grid { grid-template-columns: 1fr; max-width: 520px; } }
        .tt02-card {
          background: #fff;
          border: 1px solid #ebebeb;
          padding: 36px 32px;
          position: relative;
          transition: box-shadow 0.25s, transform 0.25s;
        }
        .tt02-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          transform: translateY(-4px);
        }
        .tt02-card::before {
          content: '"';
          position: absolute; top: 20px; right: 28px;
          font-size: 72px; line-height: 1;
          color: ${GOLD}; opacity: 0.18;
          font-family: Georgia, serif;
        }
      `}</style>

      <section
        id="recenze"
        data-section="testimonials-tattoo-02"
        style={{ background: "#f7f6f4", padding: "clamp(64px,9vw,110px) clamp(20px,4vw,48px)" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{
            fontFamily: "Arial, sans-serif", fontSize: "0.7rem", fontWeight: 700,
            color: GOLD, letterSpacing: "0.3em", textTransform: "uppercase",
            margin: "0 0 14px",
          }}>Recenze</p>
          <div aria-hidden style={{ width: 48, height: 2, backgroundColor: GOLD, margin: "0 auto 20px" }} />
          <h2 style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontWeight: 900, fontSize: "clamp(26px,3.5vw,42px)",
            color: "#1a1a1a", margin: 0, lineHeight: 1.15,
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* Karty */}
        <div className="tt02-grid">
          {items.map((item, i) => {
            const initials = item.author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={i} className="tt02-card">
                <Stars count={item.rating ?? 5} />
                <p style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "0.95rem", color: "#444",
                  lineHeight: 1.7, margin: "0 0 28px",
                  fontStyle: "italic",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Iniciálový avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    backgroundColor: GOLD,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Arial Black', Arial, sans-serif",
                    fontWeight: 900, fontSize: "0.85rem", color: "#fff",
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "Arial, sans-serif", fontWeight: 700,
                      fontSize: "0.9rem", color: "#1a1a1a",
                    }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                    </div>
                    {item.role && (
                      <div style={{
                        fontFamily: "Arial, sans-serif", fontSize: "0.75rem",
                        color: "#999", marginTop: 2,
                      }}>
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Zlatá linka dole */}
                <div aria-hidden style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 3, backgroundColor: GOLD,
                }} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ── tattoo-03-testimonials ────────────────────────────────────────────────────
// Tmavý bg #0e0e0e, velké skóre 4.9/5.0 + počet recenzí vlevo (1-col),
// 3 bílé karty vpravo (hvězdičky + citát + autor) — magictattoo.cz inspired
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsTattoo03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c           = content as Record<string, unknown>;
  const heading     = String(c.heading     ?? "Co říkají naši klienti");
  const subheading  = String(c.subheading  ?? "Přidejte se k tisícům spokojených klientů");
  const score       = String(c.score       ?? "4.9");
  const reviewCount = String(c.reviewCount ?? "1612");
  const rawItems    = (c.items as Array<{ text: string; author: string; rating: number }>) ?? [];

  const BG     = "#0e0e0e";
  const ACCENT = "#D41515";

  return (
    <section id="reference" style={{ backgroundColor: BG, padding: "clamp(48px,7vw,96px) clamp(20px,4vw,40px)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Nadpis */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "0.75rem", fontWeight: 700,
            color: ACCENT, letterSpacing: "0.18em",
            textTransform: "uppercase", margin: "0 0 8px",
          }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(22px, 2.8vw, 38px)",
            color: "#ffffff", margin: 0,
          }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>

        {/* Layout: skóre vlevo + karty vpravo */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 40,
          alignItems: "start",
        }} className="t03-testimonials-grid">
          <style>{`
            @media (max-width: 900px) { .t03-testimonials-grid { grid-template-columns: 1fr !important; } }
          `}</style>

          {/* Skóre box */}
          <div style={{
            backgroundColor: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "40px 32px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 900,
              fontSize: 72,
              color: ACCENT,
              lineHeight: 1,
              marginBottom: 8,
            }}>
              <GenericEditableText sectionId={sectionId} field="score" value={score} tag="span" />
            </div>
            <div style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "0.82rem",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 16,
            }}>
              <GenericEditableText sectionId={sectionId} field="scoreLabel" value="z 5.0 hvězdiček" tag="span" />
            </div>
            {/* Hvězdičky */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
              {[0,1,2,3,4].map(i => (
                <svg key={i} width="20" height="20" viewBox="0 0 18 18" fill={ACCENT}>
                  <polygon points="9,1.5 11.5,6.5 17,7.3 13,11.2 14,17 9,14.2 4,17 5,11.2 1,7.3 6.5,6.5"/>
                </svg>
              ))}
            </div>
            <div style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.45)",
            }}>
              <GenericEditableText sectionId={sectionId} field="reviewCount" value={reviewCount} tag="span" /><GenericEditableText sectionId={sectionId} field="reviewCountSuffix" value="+ recenzí" tag="span" />
            </div>
          </div>

          {/* Karty */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {rawItems.map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: "28px 24px",
                }}
              >
                {/* Hvězdičky */}
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[0,1,2,3,4].map(j => (
                    <svg key={j} width="14" height="14" viewBox="0 0 18 18" fill={j < (item.rating ?? 5) ? ACCENT : "rgba(255,255,255,0.2)"}>
                      <polygon points="9,1.5 11.5,6.5 17,7.3 13,11.2 14,17 9,14.2 4,17 5,11.2 1,7.3 6.5,6.5"/>
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "0.88rem",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.7,
                  margin: "0 0 20px",
                  fontStyle: "italic",
                }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />&rdquo;
                </p>
                <div style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: "#ffffff",
                }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </div>
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
  const TAUPE = "#d4a080";
  const CREAM = "#f6efe9";

  const numberPrefix = String(content.numberPrefix ?? "(03)");
  const title        = String(content.title        ?? "Recenze");
  const kicker       = String(content.kicker       ?? "Co o nás říkají klientky");
  const reviews      = (content.reviews as Nails02Review[]) ?? [];
  const ratingText   = String(content.ratingText   ?? "4.9 / 5 hodnocení na Google");
  const ratingHref   = String(content.ratingHref   ?? "https://google.com/search?q=demo");

  return (
    <section
      id="recenze"
      data-section-type="testimonials"
      data-variant="nails-02-testimonials"
      data-template="nails-02"
      style={{
        backgroundColor: DARK,
        padding: "clamp(80px, 12vw, 160px) clamp(24px, 6vw, 72px)",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "clamp(56px, 8vw, 96px)" }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(1.5rem, 2vw, 2rem)",
              color: TAUPE,
              letterSpacing: "0.06em",
              marginBottom: 28,
              opacity: 0.9,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="numberPrefix" value={numberPrefix} tag="span" />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(3.2rem, 6.8vw, 6.4rem)",
              lineHeight: 1,
              color: CREAM,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div aria-hidden="true" style={{ width: 64, height: 1, backgroundColor: TAUPE, margin: "40px 0 28px" }} />
          <p
            style={{
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              margin: 0,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
        </div>

        {/* 3-card grid */}
        <div
          className="nails02-reviews-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "clamp(24px, 3vw, 36px)",
          }}
        >
          {reviews.map((r, i) => (
            <article
              key={`rv-${i}`}
              style={{
                padding: "44px 36px 40px",
                backgroundColor: "rgba(246,239,233,0.04)",
                border: `1px solid rgba(212,160,128,0.18)`,
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "4rem",
                  lineHeight: 0.5,
                  color: TAUPE,
                  opacity: 0.85,
                }}
              >
                “
              </span>
              <blockquote
                style={{
                  margin: 0,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "1.25rem",
                  lineHeight: 1.55,
                  color: CREAM,
                  flex: 1,
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`reviews.${i}.quote`} value={r.quote} tag="span" />
              </blockquote>
              <div aria-hidden="true" style={{ width: 32, height: 1, backgroundColor: TAUPE, opacity: 0.6 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: TAUPE,
                    textTransform: "uppercase",
                    letterSpacing: "0.24em",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.author`} value={r.author} tag="span" />
                </span>
                {r.meta && (
                  <span
                    style={{
                      fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                      fontSize: "0.78rem",
                      fontWeight: 300,
                      color: "rgba(246,239,233,0.55)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`reviews.${i}.meta`} value={r.meta} tag="span" />
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Footer rating */}
        <div style={{ marginTop: "clamp(48px, 6vw, 72px)", textAlign: "center" }}>
          <a
            href={ratingHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.84rem",
              fontWeight: 500,
              color: TAUPE,
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              textDecoration: "none",
              paddingBottom: 4,
              borderBottom: `1px solid ${TAUPE}`,
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = CREAM; e.currentTarget.style.borderBottomColor = CREAM; }}
            onMouseLeave={e => { e.currentTarget.style.color = TAUPE; e.currentTarget.style.borderBottomColor = TAUPE; }}
          >
            <span aria-hidden="true" style={{ letterSpacing: 2 }}>★★★★★</span>
            <GenericEditableText sectionId={sectionId} field="ratingText" value={ratingText} tag="span" />
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .nails02-reviews-grid { grid-template-columns: 1fr !important; }
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
// Surface bg, 3 white cards + Google rating kicker, amber stars
function TestimonialsClinic02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const NAVY   = "#0F203E";
  const AMBER  = "#ffa60b";
  const MUTED  = "#606266";
  const FONT_H = "'Poppins', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title        = String(content.title  ?? "Recenze klientů");
  const kicker       = String(content.kicker ?? "5 z 5 hvězdiček na Google.com i Seznam.cz");
  const testimonials = Array.isArray(content.testimonials)
    ? (content.testimonials as Array<{ text?: string; author?: string; role?: string; rating?: number }>)
    : [];

  const Stars = ({ n }: { n: number }) => (
    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < n ? AMBER : "#ddd"} style={{ flexShrink: 0 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id="recenze" style={{ backgroundColor: "#FFFFFF", padding: "clamp(64px,8vw,100px) 0" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 clamp(24px,5vw,60px)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px,5vw,60px)" }}>
          <p style={{
            fontFamily: FONT_B, fontSize: "0.75rem", fontWeight: 600,
            letterSpacing: "0.18em", textTransform: "uppercase", color: AMBER, margin: "0 0 12px",
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, color: NAVY, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "clamp(16px,2.5vw,28px)",
        }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 4,
              padding: "clamp(24px,3vw,36px)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 16px rgba(15,32,62,0.06)",
            }}>
              <Stars n={t.rating ?? 5} />
              <p style={{
                fontFamily: FONT_B, fontSize: "0.9rem", color: MUTED,
                lineHeight: 1.8, margin: "0 0 24px", flex: 1,
                fontStyle: "italic",
              }}>
                „<GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" />"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid rgba(15,32,62,0.08)", paddingTop: 20 }}>
                {/* Avatar circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONT_H, fontSize: "0.85rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {(t.author ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: FONT_H, fontSize: "0.88rem", fontWeight: 700, color: NAVY }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" />
                  </div>
                  {t.role && (
                    <div style={{ fontFamily: FONT_B, fontSize: "0.75rem", color: MUTED }}>
                      {t.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #recenze > div > div:last-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          #recenze > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── fitness-01-testimonials-2col ──────────────────────────────────────────────
function TestimonialsFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  interface Item { text: string; author: string; role?: string; stars?: number; }
  const items        = ((content as { items?: Item[] }).items ?? []) as Item[];
  const sectionTag   = String(content.sectionTag   ?? "Reference");
  const heading      = String(content.heading      ?? "Co říkají klienti");
  const googleRating = String(content.googleRating ?? "5.0");
  const googleCount  = String(content.googleCount  ?? "60+ recenzí");

  const BG     = "#FFF9F7";
  const BEIGE  = "#D9C6B9";
  const ACCENT = "#AD8A72";
  const FONT   = "'Inter', sans-serif";

  void BG; void BEIGE;

  const Stars = ({ n }: { n: number }) => (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.5" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id="recenze" style={{ backgroundColor: "#D9C6B9", padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", fontFamily: FONT }} data-template="fitness-01">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 52, gap: 24, flexWrap: "wrap" }}>
          <div>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 10 }}>
              <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem,2.8vw,2.4rem)", fontWeight: 800, color: "#1a1a1a", margin: 0, lineHeight: 1.1 }}>
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.6 0-14.2 4.4-17.7 10.7z"/>
              <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.8 14.4-4.9l-6.7-5.5C29.6 37.3 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.7 41.4 15.3 46 24 46z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.9 6.3l6.7 5.5C41.5 37 44.5 31 44.5 24c0-1.3-.2-2.7-.5-4z"/>
            </svg>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>{googleRating}</div>
              <div style={{ fontSize: 11, color: "#54595F", marginTop: 2 }}>{googleCount}</div>
            </div>
            <Stars n={5} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }} className="fitness01-testimonials-grid">
          {items.map((item, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
              <Stars n={item.stars ?? 5} />
              <p style={{ fontSize: 15, color: "#3a3a3a", lineHeight: 1.75, margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>
              <div style={{ borderTop: "1px solid rgba(173,138,114,0.15)", paddingTop: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </div>
                {item.role && <div style={{ fontSize: 12, color: ACCENT, marginTop: 2 }}>{item.role}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) { .fitness01-testimonials-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── fyzio-02-testimonials ─────────────────────────────────────────────────────
// Navy bg, centrovaný header, 3-col karty s hvězdami + citát + autor
// Google rating badge vlevo, zlaté hvězdy
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsFyzio02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { author?: string; role?: string; text?: string; rating?: number };
  const tagline     = String(content.tagline     ?? "Reference");
  const title       = String(content.title       ?? "Co říkají naši klienti");
  const body        = String(content.body        ?? "");
  const rating      = String(content.rating      ?? "5.0");
  const ratingLabel = String(content.ratingLabel ?? "Průměrné hodnocení na Google");
  const id          = String(content.id          ?? "reference");
  const items       = ((content.items ?? content.testimonials) as Item[]) ?? [];

  const NAVY  = "#1a2e4a";
  const GOLD  = "#c9a84c";
  const WHITE = "#ffffff";
  const MUTED = "rgba(255,255,255,0.65)";
  const SERIF = "'DM Serif Display', serif";
  const SANS  = "'Plus Jakarta Sans', sans-serif";

  const Stars = ({ count = 5 }: { count?: number }) => (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? GOLD : "rgba(201,168,76,0.25)"} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section id={id} data-template="fyzio-02" style={{ backgroundColor: NAVY, padding: "80px 24px", fontFamily: SANS }}>
      <style>{`
        .f02-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media(max-width: 900px) { .f02-testi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media(max-width: 560px) { .f02-testi-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 52 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ width: 24, height: 2, backgroundColor: GOLD }} />
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 400, color: WHITE, lineHeight: 1.2, marginBottom: body ? 12 : 0 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.75, maxWidth: 480 }}>
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
          </div>

          {/* Google rating badge */}
          <div style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 400, color: WHITE, lineHeight: 1 }}>
              <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
            </span>
            <Stars count={5} />
            <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED, textAlign: "center", maxWidth: 120 }}>
              <GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" />
            </span>
          </div>
        </div>

        {/* Karty */}
        <div className="f02-testi-grid">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "28px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 16 }}>
              <Stars count={item.rating ?? 5} />
              <p style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.75, margin: 0, flex: 1 }}>
                „<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" />"
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: WHITE, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author ?? ""} tag="span" />
                </p>
                {item.role && (
                  <p style={{ fontFamily: SANS, fontSize: 12, color: GOLD, margin: "2px 0 0" }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span" />
                  </p>
                )}
              </div>
            </div>
          ))}
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
  const title = String(content.title ?? "Co o nás říkají");
  const items = (content.items as Array<{ text: string; author: string; rating?: number }>) ?? [];

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
    <section ref={sectionRef} id="recenze" style={{ backgroundColor: BEIGE, fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) 0", overflow: "hidden" }}>

      {/* Heading */}
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
          <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 10px" }}>Spokojení klienti</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: DARK, margin: 0, letterSpacing: "-0.03em" }}>
            <span>{title}</span>
          </h2>
        </div>
      </div>

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
          {doubled.map((item, i) => (
            <div
              key={`r03-rev-${i}`}
              style={{
                width: "clamp(280px, 28vw, 380px)",
                flexShrink: 0,
                backgroundColor: "#fff",
                borderRadius: 8,
                padding: "clamp(24px, 3vw, 36px)",
                boxShadow: "0 2px 16px rgba(19,37,56,0.07)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stars n={item.rating ?? 5} />
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.72, margin: "0 0 20px", flex: 1, fontStyle: "italic" }}>
                „{item.text}"
              </p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: "0 0 8px" }}>{item.author}</p>
                <div style={{ width: 28, height: 2, borderRadius: 1, backgroundColor: OCHRE }} />
              </div>
            </div>
          ))}
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
  const sectionAnchor = String(content.id    ?? "recenze");
  const title         = String(content.title ?? "Napsali o nás");
  const items = (content.items as Array<{ name: string; rating: number; text: string }>) ?? [];

  const PRIMARY = "#1032CF";
  const DARK    = "#241f0c";
  const MUTED   = "#666";
  const GOLD    = "#f5a623";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  return (
    <section id={sectionAnchor} style={{ backgroundColor: "#f8f8f8", padding: "clamp(56px, 7vw, 96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)" }}>

        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px, 2.8vw, 36px)", fontWeight: 700, color: DARK, marginTop: 0, marginBottom: "clamp(32px, 4vw, 52px)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="r04-testi-grid">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: 8, padding: "clamp(24px, 3vw, 36px)", display: "flex", flexDirection: "column", gap: 16, border: "1px solid #e8e8e8" }}>
              {/* Velká uvozovka */}
              <div style={{ fontFamily: "Georgia, serif", fontSize: 64, lineHeight: 0.8, color: PRIMARY, opacity: 0.18, userSelect: "none", marginBottom: 4 }}>&ldquo;</div>
              {/* Text recenze */}
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: DARK, margin: 0, flex: 1 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </p>
              {/* Hvězdičky */}
              <div style={{ color: GOLD, fontSize: 16, letterSpacing: 2 }}>
                {"★".repeat(Math.min(5, item.rating ?? 5))}
              </div>
              {/* Jméno */}
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: MUTED, borderTop: "1px solid #e8e8e8", paddingTop: 14 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span" />
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
  const title    = String(content.title   ?? "Reference");
  const bgImage  = String(content.bgImage ?? "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&h=600&fit=crop&q=80");
  type Item = { text: string; author: string };
  const items = (content.testimonials as Item[]) ?? [];

  const GOLD  = "#CFA968";
  const WHITE = "#ffffff";
  const SANS  = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  return (
    <section style={{ position: "relative", overflow: "hidden", backgroundColor: "#1c1c1c" }} id="reference" data-r05-testi>
      {/* BG foto — editovatelné přes GenericEditableImage */}
      <GenericEditableImage sectionId={sectionId} field="bgImage" src={bgImage} alt="" className="absolute inset-0 z-0" style={{ position: "absolute" }}>
        <img loading="lazy" src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </GenericEditableImage>
      {/* pointerEvents none: kliky prochází na GenericEditableImage */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.78)", zIndex: 1, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "72px clamp(20px,5vw,60px)" }}>
        {/* Nadpis */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px,5vw,60px)" }}>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, margin: "0 0 14px" }}>
            Co říkají klienti
          </p>
          <GenericEditableText
            sectionId={sectionId} field="title" value={title} tag="h2"
            style={{ fontFamily: SANS, fontSize: "clamp(24px,3vw,38px)", fontWeight: 700, color: WHITE, margin: 0 }}
          />
        </div>

        {/* Grid karet */}
        <div className="r05-testi-grid">
          {items.map((item, i) => (
            <div
              key={i}
              className="r05-testi-card"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", borderTop: `3px solid transparent`, padding: "28px 26px", display: "flex", flexDirection: "column", gap: 16, transition: "border-color 0.2s, background-color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderTopColor = GOLD; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderTopColor = "transparent"; (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            >
              {/* Zlatý uvozovkový glyph */}
              <span style={{ fontFamily: "Georgia, serif", fontSize: 56, lineHeight: 1, color: GOLD, display: "block", marginBottom: -8, opacity: 0.9 }}>"</span>
              <GenericEditableText
                sectionId={sectionId} field={`testimonials.${i}.text`} value={item.text} tag="p"
                style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,0.88)", margin: 0, flex: 1 }}
              />
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#aaaaaa", margin: 0, letterSpacing: "0.04em" }}>
                — <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={item.author} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .r05-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(14px, 2vw, 24px); }
        @media (max-width: 900px) { .r05-testi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .r05-testi-grid { grid-template-columns: 1fr; } }
      `}</style>
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
// Surface bg (#eef8f8), velká uvozovka, citát doktora, foto vpravo
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsOrtho01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL    = "#00b7ad";
  const SLATE   = "#244757";
  const SURFACE = "#eef8f8";
  const FONT    = "'Inter', 'DM Sans', Arial, sans-serif";

  const quote      = String(content.quote      ?? "Moderní ortodoncie dnes umožňuje dosáhnout krásného a zdravého úsměvu.");
  const authorName = String(content.authorName ?? "Dr. Jan Demo, Dr. h. c.");
  const authorRole = String(content.authorRole ?? "Zakladatel kliniky");
  const authorBio  = String(content.authorBio  ?? "");
  const imageUrl   = String(content.imageUrl   ?? "");

  return (
    <section
      data-section-type="testimonials"
      data-variant="ortho-01-testimonials"
      style={{ backgroundColor: SURFACE, padding: "clamp(56px, 7vw, 96px) 0", fontFamily: FONT }}
    >
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 clamp(20px, 5vw, 60px)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "clamp(40px, 6vw, 80px)",
        alignItems: "center",
      }}
        className="o01-testi-grid"
      >
        {/* Text side */}
        <div>
          {/* Giant quote mark */}
          <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden style={{ display: "block", marginBottom: 16 }}>
            <text x="0" y="44" fontFamily="Georgia, serif" fontSize="80" fill={TEAL} opacity="0.25">&ldquo;</text>
          </svg>

          <blockquote style={{ margin: "0 0 32px" }}>
            <p style={{
              fontSize: "clamp(1.15rem, 2vw, 1.55rem)",
              fontWeight: 600,
              color: SLATE,
              lineHeight: 1.65,
              fontStyle: "italic",
              margin: 0,
            }}>
              <GenericEditableText sectionId={sectionId} field="quote" value={quote} tag="span" />
            </p>
          </blockquote>

          {/* Divider */}
          <div style={{ width: 48, height: 3, backgroundColor: TEAL, borderRadius: 2, marginBottom: 20 }} />

          <p style={{ fontSize: "1rem", fontWeight: 700, color: SLATE, margin: "0 0 4px" }}>
            <GenericEditableText sectionId={sectionId} field="authorName" value={authorName} tag="span" />
          </p>
          <p style={{ fontSize: "0.88rem", color: TEAL, fontWeight: 500, margin: "0 0 16px" }}>
            <GenericEditableText sectionId={sectionId} field="authorRole" value={authorRole} tag="span" />
          </p>
          {authorBio && (
            <p style={{ fontSize: "0.88rem", color: "#506470", lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
              <GenericEditableText sectionId={sectionId} field="authorBio" value={authorBio} tag="span" />
            </p>
          )}
        </div>

        {/* Doctor photo */}
        <div style={{ flexShrink: 0, width: "clamp(200px, 22vw, 320px)", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", position: "relative" }}>
          <GenericEditableImage sectionId={sectionId} field="imageUrl" src={imageUrl} alt={authorName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <img loading="lazy" src={imageUrl} alt={authorName} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
          </GenericEditableImage>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .o01-testi-grid { grid-template-columns: 1fr !important; }
          .o01-testi-grid > div:last-child { width: 100% !important; aspect-ratio: 4/3 !important; }
        }
      `}</style>
    </section>
  );
}

// ── ortho-02-testimonials ─────────────────────────────────────────────────────
function TestimonialsOrtho02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const BEIGE  = "#B7B3A5";
  const DARK   = "#1a1a1a";
  const MUTED  = "#888";
  const FONT   = "'Raleway', 'Montserrat', Arial, sans-serif";

  const heading    = String(content.heading    ?? "Nejvíce nás těší vytvářet krásné úsměvy");
  const subheading = String(content.subheading ?? "Reference");
  const body       = String(content.body       ?? "Přesvědčte se sami — naši pacienti mluví za vše.");

  type Item = { author: string; handle: string; text: string; rating: number };
  const rawItems = (content.items ?? []) as Item[];
  const items: Item[] = Array.isArray(rawItems) ? rawItems : [];

  return (
    <section
      id="reference"
      data-section-type="testimonials"
      data-variant="ortho-02-testimonials"
      style={{ backgroundColor: "#fff", padding: "clamp(64px, 8vw, 112px) 0", fontFamily: FONT }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 60px)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <p style={{ fontSize: "clamp(0.7rem, 1vw, 0.78rem)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, marginBottom: 14 }}>
            <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)", fontWeight: 300, color: DARK, margin: "0 auto 18px", lineHeight: 1.25, maxWidth: 760 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
          <p style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)", color: MUTED, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
          </p>
        </div>

        {/* Cards */}
        <div className="o02-testi-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(16px, 2vw, 28px)" }}>
          {items.map((item, i) => (
            <div key={i} style={{
              border: "1px solid #e8e5e0",
              borderRadius: 4,
              padding: "clamp(24px, 3vw, 36px)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              backgroundColor: "#fafaf9",
            }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: BEIGE, letterSpacing: "0.05em", margin: 0 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.handle`} value={item.handle} tag="span" />
              </p>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={BEIGE} aria-hidden>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <blockquote style={{ margin: 0, padding: 0 }}>
                <p style={{ fontSize: "clamp(0.88rem, 1.1vw, 0.97rem)", color: "#444", lineHeight: 1.75, fontStyle: "italic", margin: 0 }}>
                  &ldquo;<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />&rdquo;
                </p>
              </blockquote>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: DARK, margin: 0, borderTop: "1px solid #e8e5e0", paddingTop: 16 }}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .o02-testi-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
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

  const tagline     = String(content.tagline     ?? "Co říkají klienti");
  const title       = String(content.title       ?? "Reference\nnaších zákazníků");
  const rating      = String(content.rating      ?? "4.9");
  const reviewCount = String(content.reviewCount ?? "");
  const items       = (content.items as Item[]) ?? [];

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
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 56, gap: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          {/* Rating badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 12, padding: "16px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: DARK, lineHeight: 1 }}>
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </div>
              <div style={{ marginTop: 4 }}><Stars /></div>
              {reviewCount && (
                <div style={{ color: GRAY, fontSize: "0.75rem", marginTop: 4 }}>
                  <GenericEditableText sectionId={sectionId} field="reviewCount" value={reviewCount} tag="span" /> recenzí
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="stavba-testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {/* Stars */}
              <Stars count={item.stars ?? 5} />
              {/* Quote */}
              <p style={{ color: DARK, fontSize: "0.925rem", lineHeight: 1.75, margin: 0, flex: 1 }}>
                „<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />"
              </p>
              {/* Author */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16 }}>
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

function TestimonialsInstala01({ content, sectionId }: { content: Record<string, unknown>; sectionId: string }) {
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
function TestimonialsFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title      = (content.title      as string) ?? "Co říkají naši zákazníci";
  const ratingText = (content.ratingText as string) ?? "4.9 z 5 na základě 150+ hodnocení";
  const items      = (content.items as Array<{ text: string; author: string; location?: string; date?: string }>) ?? [];

  const FONT = "'Arimo', Arial, sans-serif";

  const StarRow = () => (
    <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="16" height="16" viewBox="0 0 24 24" fill="#121212">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </div>
  );

  return (
    <section style={{ backgroundColor: "#fff", padding: "72px 0", fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;700&display=swap');
        .f01-rev-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .f01-rev-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .f01-rev-grid { grid-template-columns: 1fr; } }
        .f01-rev-card { background: #f9f9f9; padding: 28px 24px; display: flex; flex-direction: column; }
        .f01-rev-text { font-size: 14px; color: #121212; line-height: 1.7; flex: 1; margin-bottom: 20px; font-family: 'Arimo', Arial, sans-serif; }
        .f01-rev-author { font-size: 13px; font-weight: 700; color: #121212; font-family: 'Arimo', Arial, sans-serif; }
        .f01-rev-meta { font-size: 12px; color: rgba(18,18,18,0.5); font-family: 'Arimo', Arial, sans-serif; margin-top: 2px; }
        .f01-rev-header { text-align: center; margin-bottom: 48px; }
        .f01-rev-title { font-size: 28px; font-weight: 700; color: #121212; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; }
        .f01-rev-rating { font-size: 13px; color: rgba(18,18,18,0.55); font-family: 'Arimo', Arial, sans-serif; }
        @media (max-width: 600px) { .f01-rev-title { font-size: 22px; } .f01-rev-header { margin-bottom: 32px; } }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
        <div className="f01-rev-header">
          <div className="f01-rev-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </div>
          <div className="f01-rev-rating">
            <GenericEditableText sectionId={sectionId} field="ratingText" value={ratingText} tag="span" />
          </div>
        </div>

        <div className="f01-rev-grid">
          {items.map((item, i) => (
            <div key={i} className="f01-rev-card">
              <StarRow />
              <div className="f01-rev-text">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span" />
              </div>
              <div>
                <div className="f01-rev-author">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author} tag="span" />
                </div>
                {(item.location || item.date) && (
                  <div className="f01-rev-meta">
                    {item.location && <GenericEditableText sectionId={sectionId} field={`items.${i}.location`} value={item.location} tag="span" />}
                    {item.location && item.date && " · "}
                    {item.date && <GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={item.date} tag="span" />}
                  </div>
                )}
              </div>
            </div>
          ))}
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
function TestimonialsEdu01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number | string }) {
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
            <a href={ctaHref} className="k01rev-cta">
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
  const DARK  = "#202124";
  const MUTED = "#515151";
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
        .uc01test-stars { color: #FFB500; font-size: 1.3rem; margin-bottom: 20px; letter-spacing: 2px; }
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
  const FONT_M = "'Montserrat', 'Inter', sans-serif";
  const DARK   = "#222222";
  const GRAY   = "#575757";

  type Review = { name?: string; text?: string };
  const title   = String(content.title ?? "Co říkají naši zákazníci");
  const reviews: Review[] = Array.isArray(content.reviews) ? (content.reviews as Review[]) : [];

  const Stars = () => (
    <span style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#fbbc04"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      ))}
    </span>
  );

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.14z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.16C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.16C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.75l7.97-6.16z"/>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.25l7.98 6.16C12.43 13.72 17.74 9.5 24 9.5z"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @media (max-width: 768px) { .s03tm-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 481px) and (max-width: 768px) { .s03tm-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
      <section style={{ background: "#f3f5f6", padding: "72px 0 80px" }} data-template="solar-03">
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontFamily: FONT_M, fontWeight: 800, fontSize: "clamp(20px,2.2vw,30px)", color: DARK, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 48px" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="s03tm-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 6, padding: "24px 26px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Stars />
                  <GoogleIcon />
                </div>
                <p style={{ fontSize: 14, color: GRAY, lineHeight: 1.7, margin: 0, flex: 1, fontStyle: "italic" }}>
                  „<GenericEditableText sectionId={sectionId} field={`reviews.${i}.text`} value={String(r.text ?? "")} tag="span" />"
                </p>
                <p style={{ fontFamily: FONT_M, fontWeight: 700, fontSize: 14, color: DARK, margin: 0 }}>
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.name`} value={String(r.name ?? "")} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── TestimonialsSolar02 ─── solar-02 Greenia reference + stats ────────── */
function TestimonialsSolar02({ content, sectionId }: { content: Record<string, unknown>; sectionId: string }) {
  const title    = String(content.title    ?? "Co říkají naši klienti");
  const subtitle = String(content.subtitle ?? "Stovky realizovaných projektů po celé České republice.");
  const stats = (content.stats as Array<{ value: string; label: string }> | undefined) ?? [
    { value: "350+",  label: "realizovaných projektů" },
    { value: "98%",   label: "úspěšnost dotací" },
    { value: "12 MWp", label: "celkový instalovaný výkon" },
    { value: "10 let", label: "zkušeností na trhu" },
  ];
  const reviews = (content.reviews as Array<{ name: string; company: string; text: string }> | undefined) ?? [
    { name: "Ing. Pavel Novák", company: "výrobní podnik, Praha",   text: "S GREENIA jsme snížili náklady na elektřinu o 40 %. Celý proces od analýzy po spuštění proběhl hladce a přesně dle harmonogramu." },
    { name: "Starostka Jana Horáková", company: "obec Dolní Lhota", text: "Díky PPA modelu jsme mohli FVE realizovat bez jediné koruny z obecního rozpočtu. Doporučujeme každé obci." },
    { name: "Předseda SVJ Marek Kříž", company: "bytový dům, Brno", text: "Profesionální přístup, férová cena a výborný servis. Nájemníci jsou spokojeni se sníženými zálohovými platbami." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        .s02tmn { background: #f4f8f2; padding: 80px 0; }
        .s02tmn-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .s02tmn-head { text-align: center; margin-bottom: 52px; }
        .s02tmn-h2 { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 38px; color: #0b0f14; margin: 0 0 12px; letter-spacing: -0.5px; }
        .s02tmn-sub { font-family: 'DM Sans', sans-serif; font-size: 17px; color: #556070; margin: 0; }
        .s02tmn-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 52px; }
        .s02tmn-stat { background: #fff; border-radius: 14px; padding: 28px 20px; text-align: center; border: 1px solid rgba(121,196,79,0.2); }
        .s02tmn-val { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 34px; color: #79c44f; line-height: 1; margin-bottom: 6px; }
        .s02tmn-lbl { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #556070; line-height: 1.4; }
        .s02tmn-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .s02tmn-card { background: #fff; border-radius: 14px; padding: 30px 26px; border: 1px solid #e6f0df; }
        .s02tmn-stars { display: flex; gap: 3px; margin-bottom: 14px; }
        .s02tmn-star { color: #f4b400; font-size: 16px; }
        .s02tmn-text { font-family: 'DM Sans', sans-serif; font-size: 15px; color: #3d4f5c; line-height: 1.65; margin: 0 0 20px; font-style: italic; }
        .s02tmn-name { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px; color: #0b0f14; margin: 0 0 2px; }
        .s02tmn-company { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #79c44f; margin: 0; }
        @media (max-width: 860px) {
          .s02tmn-stats { grid-template-columns: repeat(2, 1fr); }
          .s02tmn-grid  { grid-template-columns: 1fr; }
          .s02tmn-h2    { font-size: 26px; }
        }
        @media (max-width: 480px) { .s02tmn-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
      <section className="s02tmn" id="reference">
        <div className="s02tmn-inner">
          <div className="s02tmn-head">
            <h2 className="s02tmn-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="s02tmn-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          </div>
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
              <div className="s02tmn-card" key={i}>
                <div className="s02tmn-stars">{[1,2,3,4,5].map(n => <span key={n} className="s02tmn-star">★</span>)}</div>
                <p className="s02tmn-text">
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.text`} value={r.text} tag="span" />
                </p>
                <p className="s02tmn-name">
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.name`} value={r.name} tag="span" />
                </p>
                <p className="s02tmn-company">
                  <GenericEditableText sectionId={sectionId} field={`reviews.${i}.company`} value={r.company} tag="span" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── klempir-01-testimonials ───────────────────────────────────────────────────
// 1:1 klempirzprahy.cz reviews section:
// - #f9f9f9 bg, padding 80px 0
// - H2 "Co říkají klienti" centered + silver underline
// - Centered rating badge: ★★★★★ gold stars + "4.9 (27 recenzí)"
// - 3-col grid of review cards (white bg, radius 10px, shadow, padding 30px)
//   - Card header: 60px circular avatar + name (18px) + gold ★★★★★
//   - Italic review text, line-height 1.6
// - Responsive: 2-col @992px, 1-col @768px
// ─────────────────────────────────────────────────────────────────────────────
interface TestimonialsK01Props {
  content: Record<string, unknown>;
  sectionId: number;
}
type K01Review = { name?: string; text?: string; rating?: number; image?: string };

function TestimonialsKlempir01({ content, sectionId }: TestimonialsK01Props) {
  const FONT   = "'Montserrat', sans-serif";
  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const MEDIUM = "#3a3a3a";
  const GRAY   = "#717171";
  const GOLD   = "#FFD700";

  const title    = String(content.title    ?? "Co říkají klienti");
  const subtitle = String(content.subtitle ?? "Hodnocení 4.9★ (27 recenzí)");
  const items    = (Array.isArray(content.items) ? content.items : []) as K01Review[];

  const stars = (n: number) => "★".repeat(Math.min(5, Math.max(0, n))) + "☆".repeat(5 - Math.min(5, Math.max(0, n)));

  return (
    <>
      <style>{`
        .k01-reviews { background: #f9f9f9; padding: 80px 0; position: relative; font-family: ${FONT}; }
        .k01-reviews::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(0,0,0,0.05); }
        .k01-reviews-container { width: 90%; max-width: 1200px; margin: 0 auto; padding: 0 15px; }
        .k01-reviews-h2 { font-size: 36px; font-weight: 600; color: ${DARK}; text-align: center; margin-bottom: 50px; position: relative; font-family: ${FONT}; }
        .k01-reviews-h2::after { content: ''; display: block; width: 80px; height: 3px; background: ${SILVER}; margin: 15px auto 0; }
        .k01-rating-badge { display: flex; flex-direction: column; align-items: center; background: #fff; padding: 15px 30px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.05); width: fit-content; margin: 0 auto 40px; }
        .k01-rating-stars { color: ${GOLD}; font-size: 24px; margin-bottom: 5px; letter-spacing: 2px; }
        .k01-rating-text { display: flex; align-items: center; gap: 5px; }
        .k01-rating-value { font-size: 20px; font-weight: 700; color: ${MEDIUM}; }
        .k01-rating-count { color: ${GRAY}; font-size: 14px; }
        .k01-reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin: 0; }
        .k01-review-card { background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
        .k01-review-head { display: flex; align-items: center; margin-bottom: 20px; }
        .k01-review-avatar { width: 60px; height: 60px; border-radius: 50%; overflow: hidden; margin-right: 15px; flex-shrink: 0; background: ${SILVER}; }
        .k01-review-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .k01-review-name { margin: 0 0 5px; font-size: 18px; font-weight: 600; color: ${MEDIUM}; font-family: ${FONT}; }
        .k01-review-star { color: ${GOLD}; font-size: 14px; letter-spacing: 1px; }
        .k01-review-text { font-style: italic; color: ${GRAY}; line-height: 1.6; margin: 0; flex-grow: 1; font-size: 15px; }
        @media (max-width: 992px) { .k01-reviews-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .k01-reviews-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section id="recenze" className="k01-reviews" data-template="klempir-01">
        <div className="k01-reviews-container">
          <h2 className="k01-reviews-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>

          {/* Rating badge */}
          <div className="k01-rating-badge">
            <div className="k01-rating-stars">★★★★★</div>
            <div className="k01-rating-text">
              <span className="k01-rating-value">4,9</span>
              <span className="k01-rating-count">
                <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
              </span>
            </div>
          </div>

          <div className="k01-reviews-grid">
            {items.map((item, i) => {
              const name   = String(item.name  ?? "");
              const text   = String(item.text  ?? "");
              const rating = Number(item.rating ?? 5);
              const avatar = String(item.image ?? "");
              return (
                <div key={i} className="k01-review-card">
                  <div className="k01-review-head">
                    <div className="k01-review-avatar">
                      {avatar && (
                        <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={avatar} alt={name} style={{}}>
                          <img loading="lazy" src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </GenericEditableImage>
                      )}
                    </div>
                    <div>
                      <h4 className="k01-review-name">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={name} tag="span" />
                      </h4>
                      <div className="k01-review-star">{stars(rating)}</div>
                    </div>
                  </div>
                  <p className="k01-review-text">
                    "<GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={text} tag="span" />"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-01-testimonials ─────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz reference sekce:
// - Bílé pozadí, padding 80px 30px, text-align center
// - Amber tagline + Playfair H2, subtitle s Google odkazem
// - 3 bílé karty v řadě (mobile: sloupec):
//   každá karta: 5 amber hvězdiček nahoře, text recenze, tučné jméno
// ─────────────────────────────────────────────────────────────────────────────
function TestimonialsMalir01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const AMBER    = "#E79B0E";
  const DARK     = "#1a1a1a";
  const MUTED    = "#555555";
  const PLAYFAIR = "'Playfair Display', 'Times New Roman', serif";
  const RALEWAY  = "'Raleway', sans-serif";

  const tagline  = String(content.tagline  ?? "Co říkají zákazníci");
  const title    = String(content.title    ?? "Řekli o nás");
  const subtitle = String(content.subtitle ?? "Všechna naše hodnocení si můžete ověřit na Google.com");

  type ReviewItem = { text: string; name: string; role?: string };
  const items: ReviewItem[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as ReviewItem[])
    : [];

  const Stars = () => (
    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={AMBER} aria-hidden="true">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Raleway:wght@400;600;700&display=swap');
        .m01t-section { background: #ffffff; padding: 80px 30px; font-family: ${RALEWAY}; text-align: center; }
        .m01t-header { max-width: 770px; margin: 0 auto 48px; }
        .m01t-tagline { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${AMBER}; margin-bottom: 12px; }
        .m01t-title { font-family: ${PLAYFAIR}; font-size: 36px; font-weight: 800; color: ${DARK}; margin: 0 0 12px; }
        .m01t-subtitle { font-size: 15px; color: ${MUTED}; margin: 0; line-height: 1.6; }
        .m01t-grid { display: flex; gap: 24px; max-width: 1100px; margin: 0 auto; }
        .m01t-card { flex: 1; background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; padding: 28px 24px; text-align: left; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .m01t-text { font-size: 15px; line-height: 1.8; color: ${MUTED}; margin: 0 0 20px; flex: 1; }
        .m01t-author { font-size: 14px; font-weight: 700; color: ${DARK}; }
        .m01t-role { font-size: 13px; color: #999; margin-top: 2px; }
        @media (max-width: 768px) { .m01t-grid { flex-direction: column; } }
        @media (max-width: 600px) { .m01t-section { padding: 60px 16px; } .m01t-title { font-size: 28px; } }
      `}</style>

      <section id="hodnoceni" className="m01t-section" data-template="malir-01">
        <div className="m01t-header">
          <p className="m01t-tagline">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
          </p>
          <h2 className="m01t-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">{title}</GenericEditableText>
          </h2>
          <p className="m01t-subtitle">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">{subtitle}</GenericEditableText>
          </p>
        </div>

        <div className="m01t-grid">
          {items.map((item, i) => (
            <div key={i} className="m01t-card">
              <Stars />
              <p className="m01t-text">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text} tag="span">{item.text}</GenericEditableText>
              </p>
              <div className="m01t-author">
                <GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={item.name} tag="span">{item.name}</GenericEditableText>
              </div>
              {item.role && (
                <div className="m01t-role">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={item.role} tag="span">{item.role}</GenericEditableText>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── clean-02-testimonials ─────────────────────────────────────────────────────
function TestimonialsClean02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title ?? "Co o nás říkají zákazníci");
  const items   = (content.items as Array<{ rating?: number; text?: string; author?: string; date?: string }>) ?? [];
  const NAVY = "#0e0e53"; const BLUE = "#019dff"; const GRAY = "#6b77a4";
  const AVATAR_COLORS = ["#2559e2","#019dff","#6b77a4","#0e0e53","#2bbbff"];
  const initials = (name: string) => name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join("").toUpperCase();
  return (
    <>
      <style>{`
        .c02tm-section { background: #fff; padding: 5.5rem 5%; font-family: 'Onest',sans-serif; }
        .c02tm-inner { max-width: 80rem; margin: 0 auto; }
        .c02tm-header { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 3.5rem; }
        .c02tm-kicker { display: inline-flex; align-items: center; gap: .45rem; font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${BLUE}; margin-bottom: .75rem; }
        .c02tm-kicker::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${BLUE}; }
        .c02tm-h2 { font-family: 'Bricolage Grotesque',sans-serif; font-size: clamp(1.65rem,3.2vw,2.5rem); font-weight: 800; color: ${NAVY}; margin: 0; line-height: 1.2; }
        .c02tm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.75rem; }
        .c02tm-card { background: #f3f9ff; border: 1px solid #dfecff; border-radius: 16px; padding: 2rem 1.75rem 1.75rem; display: flex; flex-direction: column; gap: 1rem; position: relative; transition: box-shadow .25s, transform .25s; }
        .c02tm-card:hover { box-shadow: 0 12px 40px -10px rgba(1,157,255,.15); transform: translateY(-2px); }
        .c02tm-quote { font-family: Georgia,serif; font-size: 4rem; line-height: .8; color: ${BLUE}; opacity: .2; position: absolute; top: 1.25rem; right: 1.5rem; user-select: none; }
        .c02tm-stars { display: flex; gap: 3px; }
        .c02tm-star { width: 16px; height: 16px; }
        .c02tm-text { font-size: .9rem; color: #3a4466; line-height: 1.75; margin: 0; flex: 1; font-style: italic; }
        .c02tm-divider { border: none; border-top: 1px solid #dfecff; margin: 0; }
        .c02tm-footer { display: flex; align-items: center; gap: .85rem; }
        .c02tm-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Bricolage Grotesque',sans-serif; font-size: .8rem; font-weight: 800; color: #fff; flex-shrink: 0; }
        .c02tm-info { flex: 1; min-width: 0; }
        .c02tm-author { font-weight: 700; color: ${NAVY}; font-size: .875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .c02tm-date { font-size: .72rem; color: ${GRAY}; margin-top: 2px; }
        .c02tm-google { width: 20px; height: 20px; flex-shrink: 0; }
        @media(max-width:900px) { .c02tm-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:550px) { .c02tm-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="c02tm-section" id="reference" data-template="clean-02-testimonials">
        <div className="c02tm-inner">
          <div className="c02tm-header">
            <p className="c02tm-kicker"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="c02tm-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          <div className="c02tm-grid">
            {items.map((item, i) => (
              <div key={i} className="c02tm-card">
                <span className="c02tm-quote">&ldquo;</span>
                <div className="c02tm-stars">
                  {Array.from({ length: item.rating ?? 5 }).map((_, s) => (
                    <svg key={s} className="c02tm-star" viewBox="0 0 20 20" fill="#f59e0b"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="c02tm-text"><GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={item.text ?? ""} tag="span" /></p>
                <hr className="c02tm-divider" />
                <div className="c02tm-footer">
                  <div className="c02tm-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {initials(item.author ?? "?")}
                  </div>
                  <div className="c02tm-info">
                    <div className="c02tm-author"><GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={item.author ?? ""} tag="span" /></div>
                    <div className="c02tm-date"><GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={item.date ?? ""} tag="span" /></div>
                  </div>
                  <svg className="c02tm-google" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── garden-02: Testimonials — 3-col cards, white bg, stars ──────────────── */
function TestimonialsGarden02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = (content.title    as string) ?? "Co o nás říkají klienti";
  const subtitle = (content.subtitle as string) ?? "";
  const items = ((content.testimonials as Array<{
    rating?: number; text?: string; author?: string; source?: string;
  }>) ?? []);

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const FONT    = "'Inter', Arial, sans-serif";

  return (
    <>
      <style>{`
        .g02tm-section { background: #f5f5f0; padding: 88px 0; font-family: ${FONT}; }
        .g02tm-inner   { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
        .g02tm-head    { text-align: center; margin-bottom: 52px; }
        .g02tm-kicker  { display: inline-flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${PRIMARY}; margin-bottom: 14px; }
        .g02tm-kicker::before, .g02tm-kicker::after { content: ""; display: block; width: 24px; height: 2px; background: ${PRIMARY}; }
        .g02tm-h2      { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; color: ${DARK}; margin: 0 0 10px; line-height: 1.25; }
        .g02tm-sub     { font-size: 1rem; color: #666; max-width: 580px; margin: 0 auto; line-height: 1.6; }
        .g02tm-grid    { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(min(320px,100%), 1fr)); }
        .g02tm-card    { background: #fff; border-radius: 14px; padding: 28px 28px 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
        .g02tm-stars   { display: flex; gap: 3px; }
        .g02tm-star    { color: ${PRIMARY}; font-size: 1.1rem; line-height: 1; }
        .g02tm-text    { font-size: 0.97rem; color: #444; line-height: 1.7; flex: 1; font-style: italic; }
        .g02tm-footer  { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e8e8e0; }
        .g02tm-author  { font-size: 0.88rem; font-weight: 700; color: ${DARK}; }
        .g02tm-source  { font-size: 0.75rem; color: #999; font-weight: 500; }
      `}</style>
      <section className="g02tm-section">
        <div className="g02tm-inner">
          <div className="g02tm-head">
            <div className="g02tm-kicker">Reference</div>
            <h2 className="g02tm-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            {subtitle && <p className="g02tm-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
          </div>
          <div className="g02tm-grid">
            {items.map((item, i) => {
              const stars = Math.min(5, Math.max(0, item.rating ?? 5));
              return (
                <div key={i} className="g02tm-card">
                  <div className="g02tm-stars">
                    {Array.from({ length: stars }).map((_, s) => <span key={s} className="g02tm-star">★</span>)}
                  </div>
                  <p className="g02tm-text">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={item.text ?? ""} tag="span" />
                  </p>
                  <div className="g02tm-footer">
                    <span className="g02tm-author">
                      <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={item.author ?? ""} tag="span" />
                    </span>
                    {item.source && <span className="g02tm-source">{item.source}</span>}
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
  const ORANGE  = "#ff914d";
  const DARK    = "#1a1a1a";
  const POPPINS = "'Poppins', sans-serif";

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
            <GenericEditableImage sectionId={sectionId} field={`items.${active}.image`} src={cur.image} alt={cur.name} style={{ borderRadius: "50%", width: "72px", height: "72px", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" src={cur.image} alt={cur.name} className="m02tm-avatar" />
            </GenericEditableImage>
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
  sectionId: string;
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
    <section id={sectionId} style={{ background: "#fff" }}>
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
          <a href={ctaHref} className="vd01tm-cta">
            {isAdmin ? <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /> : ctaText}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
