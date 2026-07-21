// Vizuální energetický štítek PENB — plný žebřík A–G se zvýrazněnou třídou.
// Barvy odpovídají oficiální škále průkazu energetické náročnosti budovy.

type EnergyClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";
import type { SiteLocale } from "@/lib/locale";

const SCALE: { grade: EnergyClass; color: string; darkText: boolean; label: string }[] = [
  { grade: "A", color: "#009E4F", darkText: false, label: "Mimořádně úsporná" },
  { grade: "B", color: "#52B153", darkText: false, label: "Velmi úsporná" },
  { grade: "C", color: "#A5CD3C", darkText: true, label: "Úsporná" },
  { grade: "D", color: "#F5EA0C", darkText: true, label: "Méně úsporná" },
  { grade: "E", color: "#F5B90F", darkText: true, label: "Nehospodárná" },
  { grade: "F", color: "#EC6707", darkText: false, label: "Velmi nehospodárná" },
  { grade: "G", color: "#E2001A", darkText: false, label: "Mimořádně nehospodárná" },
];
const LABEL_EN: Record<EnergyClass, string> = {
  A: "Extremely efficient", B: "Very efficient", C: "Efficient", D: "Less efficient",
  E: "Inefficient", F: "Very inefficient", G: "Extremely inefficient",
};

function findGrade(grade?: string | null) {
  return SCALE.find((s) => s.grade === grade?.trim().toUpperCase()) ?? null;
}

export function energyClassLabel(grade?: string | null): string | null {
  const row = findGrade(grade);
  return row ? `Třída ${row.grade} — ${row.label}` : null;
}

/** Kompaktní štítek k ceně v hlavičce detailu — šipka doleva jako na průkazu */
export function EnergyBadgeInline({ grade, locale = "cs" }: { grade: string; locale?: SiteLocale }) {
  const row = findGrade(grade);
  if (!row) return null;
  return (
    <span
      className="inline-flex h-[30px] items-center gap-2.5 pl-[18px] pr-3.5"
      title={locale === "en" ? `Building energy rating — class ${row.grade} (${LABEL_EN[row.grade]})` : `Energetická náročnost budovy — třída ${row.grade} (${row.label})`}
      style={{
        backgroundColor: row.color,
        color: row.darkText ? "#14181A" : "#FFFFFF",
        clipPath: "polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)",
      }}
    >
      <span className="text-[15px] font-bold leading-none">{row.grade}</span>
      <span className="text-[9.5px] font-bold uppercase leading-none tracking-[0.14em]">{locale === "en" ? LABEL_EN[row.grade] : row.label}</span>
    </span>
  );
}

/** Plný žebřík A–G — sekce Podrobné informace */
export default function EnergyLabel({ grade, locale = "cs" }: { grade: string; locale?: SiteLocale }) {
  const en = locale === "en";
  const active = findGrade(grade);
  if (!active) return null;

  return (
    <div className="border border-line bg-paper">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line bg-stone/50 px-4 py-4 sm:px-6">
        <p className="eyebrow text-muted">{en ? "Building energy rating" : "Energetická náročnost budovy"}</p>
        <p className="text-[11.5px] text-muted/70">{en ? "Energy performance certificate under Czech Decree No. 264/2020." : "Průkaz energetické náročnosti dle vyhl. č. 264/2020 Sb."}</p>
      </div>
      <div className="space-y-[7px] px-4 py-5 sm:px-6 sm:py-6">
        {SCALE.map((row, i) => {
          const isActive = row.grade === active.grade;
          // Délka pruhu roste od A po G; neaktivní třídy ustupují do pozadí.
          // Aktivní pruh se smí smrsknout, aby se chip vešel i na úzkých displejích.
          const width = 34 + i * 7.5;
          return (
            <div key={row.grade} className="flex h-[30px] items-center">
              <div
                className="flex h-full items-center pl-3 text-[12px] font-bold transition-opacity duration-500 sm:pl-3.5 sm:text-[13px]"
                style={{
                  flex: `0 ${isActive ? 1 : 0} ${width}%`,
                  minWidth: 44,
                  backgroundColor: row.color,
                  color: row.darkText ? "#14181A" : "#FFFFFF",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                  opacity: isActive ? 1 : 0.28,
                }}
              >
                {row.grade}
              </div>
              {isActive && (
                <div className="ml-auto flex shrink-0 items-center gap-3 pl-3 sm:pl-4">
                  <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted md:block">
                    {en ? "This property" : "Tato nemovitost"}
                  </span>
                  <span
                    className="flex h-[32px] items-center gap-2 pl-[17px] pr-3 shadow-[0_8px_20px_rgba(20,24,26,0.16)] sm:h-[34px] sm:gap-2.5 sm:pl-[19px] sm:pr-4"
                    style={{
                      backgroundColor: row.color,
                      color: row.darkText ? "#14181A" : "#FFFFFF",
                      clipPath: "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)",
                    }}
                  >
                    <span className="text-[15px] font-bold leading-none sm:text-[17px]">{row.grade}</span>
                    <span className="text-[9px] font-bold uppercase leading-none tracking-[0.11em] sm:text-[10px] sm:tracking-[0.13em]">
                      {en ? LABEL_EN[row.grade] : row.label}
                    </span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
