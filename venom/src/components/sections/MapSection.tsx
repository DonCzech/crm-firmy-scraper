"use client";

import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface MapContent {
  title?: string;
  description?: string;
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

// OpenStreetMap embed — no API key needed
function buildOsmEmbedUrl(address: string): string {
  const encoded = encodeURIComponent(address);
  return `https://www.openstreetmap.org/export/embed.html?query=${encoded}&layer=mapnik`;
}

function MapElektro01({ content, sectionId }: { content: MapContent; sectionId: number }) {
  const RED  = "#dd0808";
  const DARK = "#1b1b1b";
  const FONT = "'Montserrat', Arial, sans-serif";

  const title       = content.title       ?? "Okruh působení";
  const description = content.description ?? "";
  const address     = content.address     ?? "";

  // Praha area bounding box for OSM embed
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=13.8,49.8,14.9,50.4&layer=mapnik&marker=50.0880,14.4208`;

  return (
    <section style={{ background: "#f5f5f5", paddingTop: 72, paddingBottom: 72 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{
            fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: RED, margin: "0 0 10px",
          }}>
            <GenericEditableText sectionId={sectionId} field="kicker" value={content.kicker ? String(content.kicker) : "Oblast služeb"} tag="span" />
          </p>
          <h2 style={{
            fontFamily: FONT, fontSize: "clamp(22px, 2.8vw, 36px)", fontWeight: 800,
            color: DARK, margin: 0, letterSpacing: "0.02em", textTransform: "uppercase",
          }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {description && (
            <p style={{
              fontFamily: FONT, fontSize: "0.95rem", color: "#5d5d5d",
              margin: "16px auto 0", maxWidth: 560, lineHeight: 1.65,
            }}>
              <GenericEditableText sectionId={sectionId} field="description" value={description} tag="span" />
            </p>
          )}
        </div>

        {/* Map container */}
        <div style={{
          position: "relative",
          borderRadius: 0,
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
        }}>
          <iframe
            src={content.mapEmbed || osmSrc}
            width="100%"
            height="440"
            style={{ border: 0, display: "block", height: "clamp(220px, 45vw, 440px)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
          />

          {/* Address badge overlay */}
          {address && (
            <div style={{
              position: "absolute", bottom: 20, left: 20,
              background: DARK, color: "#fff",
              fontFamily: FONT, fontSize: "0.82rem", fontWeight: 600,
              padding: "10px 18px",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}>
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
                <path d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 7 4.5a2.5 2.5 0 0 1 0 5z" fill={RED}/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export function MapSection({ content, isAdmin, sectionId, variant }: Props & { variant?: string }) {
  if (variant === "elektro-01-map") return <MapElektro01 content={content as MapContent} sectionId={sectionId} />;

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
