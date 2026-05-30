import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface Hour {
  day: string;
  hours: string;
}

interface Props {
  content: Record<string, unknown>;
  isAdmin: boolean;
  sectionId: number;
}

export function OpeningHoursSection({ content, sectionId }: Props) {
  const title = String(content.title ?? "Otevírací doba");
  // Support both field name conventions: openingHours (legacy) and hours (generator)
  const rawHours =
    (content as { openingHours?: Hour[] }).openingHours ??
    ((content as { hours?: Array<{ day: string; time?: string; hours?: string }> }).hours ?? []).map(
      (h) => ({ day: h.day, hours: h.time ?? h.hours ?? "" })
    );
  const hours = rawHours;
  if (!hours.length) return null;

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
