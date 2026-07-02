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
// Ref: coffeeroom.cz 1:1 — centered, subheadline-wrap deco lines + pobočky pod sebou
// CSS: .subheadline-wrap, .subheadline-deco-line, .label.cc-subheadline, .time_wrap, .days_wrap, .days, .time
// ─────────────────────────────────────────────────────────────────────────────
function LocationsCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const title    = String(content.title ?? "opening hours");
  const branches = (content.branches as Array<{
    name: string;
    hours: Array<{ day: string; hours: string }>;
  }>) ?? [];

  return (
    <section style={{ backgroundColor: "#fff", fontFamily: "Montserrat, sans-serif", paddingBottom: 80 }}>
      <style>{`
        .cr04-locs-wrap { width: 70%; margin-left: auto; margin-right: auto; }
        .cr04-subheadline-wrap { text-align: center; justify-content: center; align-items: center; margin-bottom: 20px; display: flex; }
        .cr04-deco-line { background-color: #ececed; width: 30px; height: 1px; display: inline-block; }
        .cr04-label-sub { opacity: 0.9; color: #b79570; letter-spacing: 2px; text-transform: uppercase; font-size: 12px; font-weight: 700; line-height: 18px; font-family: Montserrat, sans-serif; margin-left: 15px; margin-right: 15px; }
        .cr04-time-wrap { flex-direction: row; justify-content: center; align-items: flex-start; margin-bottom: 40px; display: flex; }
        .cr04-days-wrap { flex-direction: column; display: flex; }
        .cr04-days { text-align: left; margin-top: 0; margin-bottom: 0; margin-right: 20px; font-family: Montserrat, sans-serif; font-size: 23px; font-weight: 600; color: #1d1f2e; }
        .cr04-time { text-align: left; margin-top: 0; margin-bottom: 0; margin-left: 20px; font-size: 23px; font-weight: 400; font-family: Montserrat, sans-serif; color: #1d1f2e; }
        @media (max-width: 828px) {
          .cr04-locs-wrap { width: 90%; }
          .cr04-days { margin-right: 10px; font-size: 16px; }
          .cr04-time { margin-left: 0; font-size: 16px; }
        }
      `}</style>
      <div className="cr04-locs-wrap">
        {/* "opening hours" nadpis */}
        <div className="cr04-subheadline-wrap">
          <div className="cr04-deco-line" />
          <span className="cr04-label-sub">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </span>
          <div className="cr04-deco-line" />
        </div>

        {/* Pobočky */}
        {branches.map((branch, bi) => (
          <div key={bi}>
            <div className="cr04-subheadline-wrap">
              <div className="cr04-deco-line" />
              <span className="cr04-label-sub">
                <GenericEditableText sectionId={sectionId} field={`branches.${bi}.name`} value={branch.name} tag="span" />
              </span>
              <div className="cr04-deco-line" />
            </div>
            <div className="cr04-time-wrap">
              <div className="cr04-days-wrap">
                {(branch.hours ?? []).map((h, hi) => (
                  <h2 key={hi} className="cr04-days">
                    <GenericEditableText sectionId={sectionId} field={`branches.${bi}.hours.${hi}.day`} value={h.day} tag="span" />
                  </h2>
                ))}
              </div>
              <div className="cr04-days-wrap">
                {(branch.hours ?? []).map((h, hi) => (
                  <h2 key={hi} className="cr04-time">
                    <GenericEditableText sectionId={sectionId} field={`branches.${bi}.hours.${hi}.hours`} value={h.hours} tag="span" />
                  </h2>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
