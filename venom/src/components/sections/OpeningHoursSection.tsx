import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface Hour {
  day: string;
  hours: string;
}

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin: boolean;
  sectionId: number;
}

export function OpeningHoursSection({ content, variant, sectionId }: Props) {
  if (variant === "cafe-04-locations") return <LocationsCafe04 content={content} sectionId={sectionId} />;

  const title = String(content.title ?? "Otevírací doba");
  // Support both field name conventions: openingHours (legacy) and hours (generator)
  const rawHours =
    (content as { openingHours?: Hour[] }).openingHours ??
    ((content as { hours?: Array<{ day: string; time?: string; hours?: string }> }).hours ?? []).map(
      (h) => ({ day: h.day, hours: h.time ?? h.hours ?? "" })
    );
  const hours = rawHours;
  if (!hours.length) return null;

  if (variant === "barber-dark") {
    const GOLD   = "#C9A84C";
    const BG     = "#0a0a0a";
    const BORDER = "rgba(201,168,76,0.12)";
    return (
      <section style={{ backgroundColor: BG, padding: "clamp(56px, 9vw, 90px) 24px" }} data-template="barber-01">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 18 }}>
              <span style={{ flex: 1, height: 1, background: BORDER }} />
              <p style={{ fontFamily: "var(--font-heading)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, margin: 0, whiteSpace: "nowrap" }}>
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </p>
              <span style={{ flex: 1, height: 1, background: BORDER }} />
            </div>
          </div>
          {/* Rows */}
          <div>
            {hours.map((h, i) => {
              const isClosed = h.hours.toLowerCase().includes("zavřeno") || h.hours.toLowerCase().includes("closed");
              return (
                <div key={i} className="bc-hours-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px", borderBottom: `1px solid ${BORDER}`, position: "relative" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: isClosed ? "#555" : "#A0A0A0" }}>
                    <GenericEditableText sectionId={sectionId} field={`openingHours.${i}.day`} value={h.day} tag="span" />
                  </span>
                  <span style={{ fontFamily: "var(--font-body, Inter, sans-serif)", fontSize: "0.9rem", fontWeight: isClosed ? 400 : 600, color: isClosed ? "#444" : GOLD, letterSpacing: isClosed ? 0 : "0.04em" }}>
                    <GenericEditableText sectionId={sectionId} field={`openingHours.${i}.hours`} value={h.hours} tag="span" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
      <div className="max-w-sm mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-8"
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="space-y-3">
          {hours.map((h, i) => (
            <div key={i} className="flex justify-between py-2 border-b" style={{ borderColor: "var(--color-border, #e5e7eb)" }}>
              <span style={{ color: "var(--color-text-muted, #666)" }}>
                <GenericEditableText sectionId={sectionId} field={`openingHours.${i}.day`} value={h.day} tag="span" />
              </span>
              <span className="font-medium" style={{ color: "var(--color-text, #111)" }}>
                <GenericEditableText sectionId={sectionId} field={`openingHours.${i}.hours`} value={h.hours} tag="span" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── cafe-04-locations ─────────────────────────────────────────────────────────
// Editorial multi-location card grid — coffee-gold hairline detaily, hover lift,
// day/hours rows s dotted leader, Google Maps directions link, 4 pobočky 2×2
// ─────────────────────────────────────────────────────────────────────────────
function LocationsCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Branch = {
    name: string;
    address?: string;
    mapHref?: string;
    directionsLabel?: string;
    hours: Array<{ day: string; hours: string }>;
  };
  const eyebrow  = String(content.eyebrow ?? "Otevírací doba");
  const title    = String(content.title    ?? "Najdete nás na čtyřech místech.");
  const tagline  = String(content.tagline ?? content.subtitle ?? "Každá pobočka má vlastní charakter — od klidných Vinohrad po rušný Karlín.");
  const branches = (content.branches as Branch[]) ?? [];

  return (
    <section className="cr04-locs" data-template="cafe-04">
      <div className="cr04-locs-header">
        <span className="cr04-locs-eyebrow">
          <span className="cr04-locs-eyebrow-rule" aria-hidden />
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </span>
        <h2 className="cr04-locs-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <p className="cr04-locs-tagline">
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </p>
      </div>

      <div className="cr04-locs-grid">
        {branches.map((branch, bi) => {
          const mapHref = branch.mapHref || `https://maps.google.com/?q=${encodeURIComponent(branch.address || branch.name)}`;
          const dirLabel = branch.directionsLabel || "Zobrazit trasu";
          return (
            <article key={bi} className="cr04-locs-card">
              <span className="cr04-locs-index" aria-hidden>{String(bi + 1).padStart(2, "0")}</span>
              <div className="cr04-locs-card-head">
                <h3 className="cr04-locs-name">
                  <GenericEditableText sectionId={sectionId} field={`branches.${bi}.name`} value={branch.name} tag="span" />
                </h3>
                {branch.address && (
                  <p className="cr04-locs-addr">
                    <GenericEditableText sectionId={sectionId} field={`branches.${bi}.address`} value={branch.address} tag="span" />
                  </p>
                )}
              </div>

              <div className="cr04-locs-hours">
                {(branch.hours ?? []).map((h, hi) => (
                  <div key={hi} className="cr04-locs-hours-row">
                    <span className="cr04-locs-hours-day">
                      <GenericEditableText sectionId={sectionId} field={`branches.${bi}.hours.${hi}.day`} value={h.day} tag="span" />
                    </span>
                    <span className="cr04-locs-hours-dots" aria-hidden />
                    <span className="cr04-locs-hours-time">
                      <GenericEditableText sectionId={sectionId} field={`branches.${bi}.hours.${hi}.hours`} value={h.hours} tag="span" />
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="cr04-locs-dir"
              >
                <GenericEditableText sectionId={sectionId} field={`branches.${bi}.directionsLabel`} value={dirLabel} tag="span" />
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                  <path d="M1 5H13M9 1L13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
