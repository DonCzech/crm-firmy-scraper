"use client";

import { useState } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  content: Record<string, unknown>;
  isAdmin: boolean;
  sectionId: number;
}

export function FaqSection({ content, sectionId }: Props) {
  // Support both field name conventions: faq[]{question,answer} and items[]{q,a} (generator)
  const faq = (
    (content as { faq?: FaqItem[] }).faq ??
    ((content as { items?: Array<{ q?: string; question?: string; a?: string; answer?: string }> }).items ?? []).map(
      (i) => ({ question: i.q ?? i.question ?? "", answer: i.a ?? i.answer ?? "" })
    )
  );
  const title = String(content.title ?? "Časté dotazy");
  const [open, setOpen] = useState<number | null>(null);
  if (!faq.length) return null;

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface, #f9fafb)" }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--color-border, #e5e7eb)", borderRadius: "var(--radius, 8px)" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 flex justify-between items-center font-medium"
                style={{ backgroundColor: "var(--color-bg, #fff)", color: "var(--color-text, #111)" }}
              >
                <GenericEditableText sectionId={sectionId} field={`faq.${i}.question`} value={item.question} tag="span" />
                <span className="text-xl">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div
                  className="px-6 pb-4 text-sm"
                  style={{ backgroundColor: "var(--color-bg, #fff)", color: "var(--color-text-muted, #666)" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`faq.${i}.answer`} value={item.answer} tag="span" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
