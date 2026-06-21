import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "fs";
import path from "path";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { queryOne, query } from "@/lib/db";

interface Props { params: Promise<{ key: string }> }

interface TemplateRow {
  id: number;
  key: string;
  name: string;
  industry: string;
  current_version: string;
  review_status: string;
  reviewed_at: string | null;
}

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const row = await queryOne<TemplateRow>(
    "SELECT key, name, industry FROM templates WHERE key = $1 AND review_status = 'approved' AND status = 'active'",
    [key]
  );
  if (!row) return { title: "Šablona nenalezena — Webero" };
  return {
    title: `${row.name} — Šablona Webero`,
    description: `Hotová šablona pro obor ${row.industry}. Aktivace na pár kliků, plně editovatelná, SEO ready.`,
    alternates: { canonical: `/sablony/${row.key}` },
    openGraph: {
      title: row.name,
      images: [`/templates/${row.key}/preview.png`],
    },
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { key } = await params;
  const row = await queryOne<TemplateRow>(
    `SELECT id, key, name, industry, current_version, review_status, reviewed_at
       FROM templates
      WHERE key = $1 AND review_status = 'approved' AND status = 'active'`,
    [key]
  );
  if (!row) return notFound();

  // Find a representative v2 demo tenant for live preview
  const tenant = await queryOne<{ slug: string }>(
    `SELECT t.slug FROM tenants t
       JOIN sections s ON s.tenant_id = t.id
      WHERE t.template_id = $1 AND s.content_source = 'v2'
      ORDER BY t.id LIMIT 1`,
    [row.id]
  );

  const screenshotFs = path.join(process.cwd(), "public", "templates", row.key, "preview.png");
  const screenshot = existsSync(screenshotFs) ? `/templates/${row.key}/preview.png` : null;

  // Related templates from same industry
  const related = await query<{ key: string; name: string }>(
    `SELECT key, name FROM templates
      WHERE review_status = 'approved' AND status = 'active'
        AND industry = $1 AND key != $2
      ORDER BY reviewed_at DESC NULLS LAST LIMIT 4`,
    [row.industry, row.key]
  );

  return (
    <>
      <PlatformHeader />
      <main className="bg-[#f8fafc]">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link href="/sablony" className="text-sm font-bold text-[#14532d] hover:underline">
              ← Všechny šablony
            </Link>
            <div className="mt-4 grid items-start gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
                  {screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={screenshot} alt={row.name} className="w-full" />
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-slate-200 to-slate-300" />
                  )}
                </div>
              </div>
              <aside className="lg:col-span-2">
                <p className="text-sm font-black uppercase tracking-wide text-[#14532d]">{row.industry}</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{row.name}</h1>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                  <span className="rounded bg-emerald-100 px-2.5 py-1 text-emerald-800">Schváleno</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-700">v{row.current_version}</span>
                  <code className="rounded bg-slate-100 px-2.5 py-1 text-slate-500">{row.key}</code>
                </div>

                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  <Feature label="Plně editovatelný klikací editor — žádné HTML, žádné CSS." />
                  <Feature label="Mobile a desktop layout připravený a otestovaný." />
                  <Feature label="SEO komplet — title, meta, OG, JSON-LD LocalBusiness/Organization." />
                  <Feature label="WebP obrázky, lazy loading, font preload." />
                  <Feature label="Sekce lze přidávat, mazat, přesouvat a vypínat — bez restrikcí." />
                  <Feature label="Slot data (telefon, e-mail, název) přežijí změnu designu." />
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {tenant && (
                    <a
                      href={`/demo/${tenant.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center rounded bg-white px-5 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                      Živý náhled
                    </a>
                  )}
                  <Link
                    href={`/?template=${row.key}#sablony`}
                    className="inline-flex flex-1 items-center justify-center rounded bg-[#14532d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0f3f23]"
                  >
                    Aktivovat tuto šablonu
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-slate-950">Podobné šablony</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.key}
                  href={`/sablony/${r.key}`}
                  className="group rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="font-bold text-slate-900 group-hover:text-[#14532d]">{r.name}</div>
                  <code className="text-[10.5px] text-slate-400">{r.key}</code>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <PlatformFooter />
    </>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2">
      <span aria-hidden className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#14532d]/10 text-[#14532d]">
        <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5"><path d="M3.5 6.5L5 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
      </span>
      <span>{label}</span>
    </div>
  );
}
