"use client";

import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface RezoraConfig {
  widgetId?: string;
  bookingUrl?: string;
  enabled?: boolean;
  ctaText?: string;
}

interface Props {
  config: Record<string, unknown>;
  sectionId: number;
}

export function RezoraWidget({ config, sectionId }: Props) {
  const c = config as RezoraConfig;

  if (!c.enabled) return null;

  // Rezora widget placeholder — real implementation connects to Rezora API
  return (
    <section id="rezervace" className="py-16 px-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-md mx-auto text-center">
        <div className="rounded-2xl border-2 border-dashed p-10" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-2xl mb-3">📅</p>
          <h3 className="font-bold mb-2" style={{ color: "var(--color-text)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={String(config.title ?? "Online rezervace")} tag="span" />
          </h3>
          <p className="text-sm mb-5" style={{ color: "var(--color-text-muted)" }}>
            <GenericEditableText sectionId={sectionId} field="subtitle" value={String(config.subtitle ?? "Rezervační systém Rezora")} tag="span" />
          </p>
          {c.bookingUrl ? (
            <a
              href={c.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 text-white font-medium rounded"
              style={{ backgroundColor: "var(--color-primary)", borderRadius: "var(--radius)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={c.ctaText ?? "Rezervovat termín"} tag="span" />
            </a>
          ) : (
            <p className="text-xs text-gray-400">
              <GenericEditableText sectionId={sectionId} field="emptyText" value={String(config.emptyText ?? "Nastavte rezervační URL v editoru")} tag="span" />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
