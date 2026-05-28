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
    ((content as { reviews?: Array<{ author?: string; name?: string; text: string; rating: number }> }).reviews ?? []).map(
      (r) => ({ name: r.author ?? r.name ?? "", text: r.text, rating: r.rating })
    )
  );
  const title = String(content.title ?? (variant === "slider" ? "Co říkají klienti" : "Reference"));
  const [active, setActive] = useState(0);

  if (!testimonials.length) return null;

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
