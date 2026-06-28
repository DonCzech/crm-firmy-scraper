import Link from "next/link";
import { query } from "@/lib/db";
import { existsSync } from "fs";
import path from "path";

/**
 * Server component — renders approved templates from DB.
 *
 * Used both at homepage #sablony anchor and at /sablony standalone page.
 * Approved = templates.review_status='approved'. Empty state hides itself.
 */
interface TemplateRow {
  key: string;
  name: string;
  industry: string;
  reviewer_email: string | null;
  reviewed_at: string | null;
}

const INDUSTRY_LABELS: Record<string, string> = {
  cafe: "Kavárna", bakery: "Pekárna", restaurant: "Restaurace", barber: "Barbershop",
  hairdresser: "Kadeřnictví", wellness: "Wellness", beauty: "Beauty", nails: "Nehtové studio",
  fitness: "Fitness", physio: "Fyzioterapie", dentist: "Stomatologie", lawyer: "Advokát",
  realEstate: "Reality", auto: "Autoservis", cleaning: "Úklid", construction: "Stavebnictví",
  florist: "Květinářství", catering: "Catering", hotel: "Hotel", events: "Eventy",
  tattoo: "Tetování", veterinary: "Veterinář", clinic: "Beauty", accounting: "Účetnictví",
  finance: "Finance", architecture: "Architektura", solar: "Fotovoltaika", photographer: "Foto",
  dj: "DJ", education: "Vzdělávání", pets: "Mazlíčci",
};

export async function LiveTemplatesCatalog({ heading, limit, compact }: { heading?: string; limit?: number; compact?: boolean }) {
  let rows: TemplateRow[] = [];
  try {
    rows = await query<TemplateRow>(
      `SELECT key, name, industry, reviewer_email, reviewed_at
         FROM templates
        WHERE review_status = 'approved'
          AND status = 'active'
        ORDER BY reviewed_at DESC NULLS LAST, key ASC
        ${limit ? `LIMIT ${limit}` : ""}`
    );
  } catch {
    rows = [];
  }

  if (rows.length === 0) return null;

  return (
    <section id="sablony" className="bg-[#f1f5f9] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#14532d]">
              {heading ?? "Hotové šablony"}
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {rows.length} šablon{rows.length === 1 ? "a" : rows.length < 5 ? "y" : ""} připraven{rows.length === 1 ? "á" : "ých"} k aktivaci.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Vyber, aktivuj a začni upravovat. Vše plně responzivní, SEO ready, na klíč.
            </p>
          </div>
          {!compact && (
            <Link
              href="/sablony"
              className="self-start rounded bg-[#14532d] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0f3f23]"
            >
              Zobrazit všechny
            </Link>
          )}
        </div>

        <div className={`mt-10 grid gap-5 ${compact ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"}`}>
          {rows.map((tpl) => (
            <TemplateCard key={tpl.key} row={tpl} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({ row }: { row: TemplateRow }) {
  const screenshotFs = path.join(process.cwd(), "public", "templates", row.key, "preview.png");
  const screenshot = existsSync(screenshotFs) ? `/templates/${row.key}/preview.png` : null;
  const industryLabel = INDUSTRY_LABELS[row.industry] ?? row.industry;

  return (
    <article className="group flex flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshot}
            alt={row.name}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-3xl text-slate-400">
            {row.name.slice(0, 1)}
          </div>
        )}
        <span className="absolute right-2 top-2 rounded bg-emerald-600/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          schváleno
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-wide text-[#14532d]">{industryLabel}</div>
        <h3 className="mt-1 text-base font-black text-slate-950">{row.name}</h3>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link
            href={`/sablony/${row.key}`}
            className="block w-full rounded bg-[#14532d] px-4 py-2 text-center text-sm font-black text-white transition hover:bg-[#0f3f23]"
          >
            Aktivovat šablonu →
          </Link>
          <div className="flex items-center justify-between">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{row.key}</code>
            <Link
              href={`/sablony/${row.key}`}
              className="text-[11px] text-slate-400 hover:text-[#14532d] hover:underline"
            >
              Detail
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
