"use client";

import { useState } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
}

export function TestimonialsSection({ content, variant, sectionId }: Props) {
  // Support both field name conventions: testimonials (legacy) and reviews (generator)
  const testimonials = (
    (content as { testimonials?: Testimonial[] }).testimonials ??
    (content as { items?: Testimonial[] }).items ??
    ((content as { reviews?: Array<{ author?: string; name?: string; text: string; rating: number }> }).reviews ?? []).map(
      (r) => ({ name: r.author ?? r.name ?? "", text: r.text, rating: r.rating })
    )
  );
  const title = String(content.title ?? (variant === "slider" ? "Co říkají klienti" : "Reference"));
  const [active, setActive] = useState(0);

  if (!testimonials.length) return null;

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
    return (
      <section
        className="relative"
        style={{ padding: "88px 24px", backgroundColor: "#ffffff" }}
        data-template="barber-04"
      >
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
    return (
      <section className="px-6" style={{ backgroundColor: "#1c1410", padding: "100px 24px" }} data-template="barber-03">
        <div className="max-w-[1200px] mx-auto">
          <h2
            className="text-center uppercase mb-16"
            style={{
              fontFamily: "var(--font-heading)",
              color: "#c8a96e",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              letterSpacing: "0.16em",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-8"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(200,169,110,0.18)",
                  borderRadius: 2,
                }}
              >
                <div className="flex gap-1 mb-4" style={{ color: "#c8a96e", letterSpacing: "0.18em" }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
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
