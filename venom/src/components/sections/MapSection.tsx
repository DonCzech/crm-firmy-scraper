"use client";

import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface MapContent {
  title?: string;
  address?: string;
  mapEmbed?: string; // Google Maps embed URL or iframe src
  zoom?: number;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  sectionId: number;
}

function buildGoogleMapsEmbedUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=${encoded}`;
}

export function MapSection({ content, isAdmin, sectionId }: Props) {
  const c = content as MapContent;
  const embedSrc = c.mapEmbed || (c.address ? buildGoogleMapsEmbedUrl(c.address) : "");

  if (!embedSrc && !isAdmin) return null;

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
      <div className="max-w-4xl mx-auto">
        {c.title && (
          <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={c.title} tag="span" />
          </h2>
        )}

        {c.address && (
          <p className="text-center mb-6 text-sm" style={{ color: "var(--color-text-muted, #6b7280)" }}>
            📍 <GenericEditableText sectionId={sectionId} field="address" value={c.address} tag="span" />
          </p>
        )}

        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid var(--color-border, #e5e7eb)", borderRadius: "var(--radius, 8px)" }}
        >
          {embedSrc ? (
            <iframe
              src={embedSrc}
              width="100%"
              height="400"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={c.title ?? "Mapa"}
            />
          ) : (
            <div
              className="flex items-center justify-center h-64 text-sm"
              style={{ backgroundColor: "var(--color-surface, #f9fafb)", color: "var(--color-text-muted, #6b7280)" }}
            >
              {isAdmin
                ? 'Vložte Google Maps embed URL do pole "mapEmbed" v editoru.'
                : "Mapa není k dispozici."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
