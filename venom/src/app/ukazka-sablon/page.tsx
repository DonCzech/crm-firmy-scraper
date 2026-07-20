import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "fs";
import path from "path";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { query } from "@/lib/db";

export const metadata: Metadata = {
  title: "Šablony — Webero",
  description:
    "100+ profesionálních šablon pro každý obor. Restaurace, salóny, řemeslo, reality, ordinace a další. Live editor, SEO, hosting v ceně.",
  alternates: { canonical: "/ukazka-sablon" },
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface Row {
  key: string;
  name: string;
  industry: string;
  reviewed_at: string | null;
}

const INDUSTRY_LABELS: Record<string, string> = {
  barber: "Barber & Holičství",
  beauty: "Beauty & Kosmetika",
  bakery: "Pekárny & Cukrárny",
  catering: "Catering",
  stavba: "Stavební firmy",
  elektro: "Elektroinstalace",
  instala: "Instalatérství",
  florist: "Květinářství",
  sweet: "Sweet & Dezerty",
  autoskola: "Autoškoly",
  lang: "Jazykové školy",
  kids: "Dětské služby",
  vet: "Veterináři",
  pethotel: "Pet hotely",
  grooming: "Grooming",
  ucetni: "Účetnictví",
  solar: "Fotovoltaika",
  arch: "Architekti",
  clean: "Úklid",
  klima: "Klimatizace",
  floors: "Podlahy",
  malir: "Malíři",
  garden: "Zahradnické služby",
  klempir: "Klempířství",
  arbo: "Arboristika",
  ddd: "DDD služby",
  chalet: "Chalupy & Penziony",
  hotel: "Hotely",
  photo: "Fotografové",
  events: "Eventy",
  dj: "DJ služby",
  video: "Videoprodukce",
  autoservis: "Autoservis",
};

function industryFromKey(key: string): string {
  const prefix = key.split("-")[0] ?? "";
  return INDUSTRY_LABELS[prefix] ?? prefix;
}

function industrySlug(industry: string): string {
  return industry.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/* Mosaic positioning — 12 floating cards behind hero, fixed coordinates so the
   layout is identical every render (no hydration mismatch). */
interface MosaicSlot {
  /** Tailwind position classes */
  pos: string;
  /** rotation deg */
  rot: number;
  /** width in px (responsive scales handled via Tailwind) */
  w: number;
  /** opacity 0-1 */
  op: number;
  /** z-index */
  z: number;
}

const MOSAIC_SLOTS: MosaicSlot[] = [
  { pos: "left-[-6%]  top-[8%]",   rot: -12, w: 280, op: 0.32, z: 0 },
  { pos: "left-[8%]   top-[55%]",  rot:   8, w: 240, op: 0.28, z: 0 },
  { pos: "left-[18%]  top-[18%]",  rot:  -5, w: 220, op: 0.40, z: 1 },
  { pos: "left-[28%]  top-[68%]",  rot:  14, w: 200, op: 0.30, z: 0 },
  { pos: "right-[28%] top-[6%]",   rot:   6, w: 200, op: 0.35, z: 1 },
  { pos: "right-[14%] top-[42%]",  rot: -10, w: 260, op: 0.38, z: 1 },
  { pos: "right-[4%]  top-[12%]",  rot:  10, w: 280, op: 0.30, z: 0 },
  { pos: "right-[-4%] top-[62%]",  rot:  -7, w: 240, op: 0.28, z: 0 },
  { pos: "left-[40%]  top-[2%]",   rot:  -3, w: 180, op: 0.22, z: 0 },
  { pos: "right-[40%] top-[82%]",  rot:   5, w: 200, op: 0.25, z: 0 },
  { pos: "left-[-2%]  top-[78%]",  rot:  -8, w: 220, op: 0.24, z: 0 },
  { pos: "right-[-8%] top-[88%]",  rot:  12, w: 240, op: 0.22, z: 0 },
];

export default async function ShowcaseIndexPage() {
  const rows = await query<Row>(
    `SELECT key, name, industry, reviewed_at
       FROM templates
      WHERE review_status = 'approved' AND status = 'active'
      ORDER BY reviewed_at DESC NULLS LAST, key ASC`
  );

  // Group by industry
  const byIndustry = new Map<string, Row[]>();
  for (const r of rows) {
    const ind = r.industry || industryFromKey(r.key);
    if (!byIndustry.has(ind)) byIndustry.set(ind, []);
    byIndustry.get(ind)!.push(r);
  }
  const industries = Array.from(byIndustry.entries());

  // Pick the first 12 templates with preview for the mosaic backdrop
  const mosaicSrcs: string[] = [];
  for (const r of rows) {
    if (mosaicSrcs.length >= MOSAIC_SLOTS.length) break;
    const fsWebp = path.join(process.cwd(), "public", "templates", r.key, "preview.webp");
    const fsPng  = path.join(process.cwd(), "public", "templates", r.key, "preview.png");
    if (existsSync(fsWebp)) mosaicSrcs.push(`/templates/${r.key}/preview.webp`);
    else if (existsSync(fsPng)) mosaicSrcs.push(`/templates/${r.key}/preview.png`);
  }
  // Pad with hero fallbacks
  const fallbackHeroes = [
    "/templates/arch-01/hero-1.webp",
    "/templates/clinic-02/hero-bg.webp",
    "/templates/dental-01/hero-bg.webp",
    "/templates/reality-01/hero-bg.webp",
    "/templates/solar-03/hero.webp",
    "/templates/malir-02/hero-1.webp",
  ];
  while (mosaicSrcs.length < MOSAIC_SLOTS.length) {
    mosaicSrcs.push(fallbackHeroes[mosaicSrcs.length % fallbackHeroes.length]!);
  }

  return (
    <>
      <PlatformHeader
        forceSolid
        navItems={[
          { label: "KATALOG",   href: "#showcase" },
          { label: "KATEGORIE", href: "#kategorie" },
          { label: "NOVINKY",   href: "#novinky" },
        ]}
      />
      <main className="bg-white text-[#0a0a0a] pt-[64px] lg:pt-[72px]">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  HERO — Dark, dramatic, with floating template mosaic backdrop    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0a0a0a]">

          {/* Floating mosaic of template cards */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
            {MOSAIC_SLOTS.map((slot, i) => (
              <div
                key={i}
                className={`absolute ${slot.pos} overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]`}
                style={{
                  width: `${slot.w}px`,
                  transform: `rotate(${slot.rot}deg)`,
                  opacity: slot.op,
                  zIndex: slot.z,
                }}
              >
                <div className="aspect-[16/10] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mosaicSrcs[i]!}
                    alt="Náhled šablony Webero"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Vignette gradient over mosaic */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 50%, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.92) 70%, #0a0a0a 100%)",
            }}
          />
          {/* Grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          {/* Indigo glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.22), transparent 70%), radial-gradient(40% 50% at 50% 100%, rgba(167,139,250,0.12), transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative mx-auto flex min-h-[640px] max-w-[1280px] flex-col items-center justify-center px-5 py-24 text-center sm:px-6 sm:py-32 lg:min-h-[760px] lg:px-10 lg:py-44">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/65 transition hover:text-white sm:mb-10"
              style={{ letterSpacing: "0.04em" }}
            >
              ← Zpět na webero.co
            </Link>

            <p
              className="mb-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase text-[#a5b4fc] sm:mb-7"
              style={{ letterSpacing: "0.18em" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              Knihovna šablon
            </p>

            <h1
              className="font-sans font-bold text-white"
              style={{
                fontSize: "clamp(54px, 10vw, 156px)",
                lineHeight: "0.92",
                letterSpacing: "-0.045em",
              }}
            >
              100+
            </h1>
            <h2
              className="mt-3 font-sans font-bold text-white"
              style={{
                fontSize: "clamp(32px, 5.5vw, 78px)",
                lineHeight: "1.0",
                letterSpacing: "-0.035em",
              }}
            >
              šablon. <span className="text-[#a5b4fc]">Pro každý obor.</span>
            </h2>

            <p className="mx-auto mt-7 max-w-[620px] text-[16px] leading-[1.65] text-white/75 sm:mt-9 sm:text-[18px]">
              Restaurace, salóny, řemeslo, reality, ordinace. Každá šablona prošla
              manuálním review. Klikni a prohlédni si ji do detailu — desktop, mobil,
              sekce, živé demo.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center">
              <a
                href="#showcase"
                className="inline-flex h-[54px] items-center justify-center rounded-full bg-white px-10 text-[15.5px] font-semibold text-[#0a0a0a] shadow-[0_8px_40px_rgba(255,255,255,0.18)] transition hover:bg-white/95 active:scale-[0.97]"
              >
                Procházet katalog
              </a>
              <a
                href="/#start"
                className="inline-flex h-[54px] items-center justify-center rounded-full border border-white/20 px-8 text-[14.5px] font-semibold text-white transition hover:border-white/50"
              >
                Vyzkoušet zdarma →
              </a>
            </div>

            {/* Stats row */}
            <dl className="mx-auto mt-16 grid max-w-[760px] grid-cols-3 gap-6 border-t border-white/15 pt-10 sm:mt-20 sm:gap-10">
              <DarkStat n={rows.length.toString()} label="Šablon" />
              <DarkStat n={byIndustry.size.toString()} label="Oborů" />
              <DarkStat n="99/100" label="PageSpeed" />
            </dl>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  CATEGORY PILLS — sticky, premium look                            */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {industries.length > 0 && (
          <nav
            id="kategorie"
            aria-label="Kategorie šablon"
            className="sticky top-[64px] z-30 scroll-mt-[80px] border-b border-[#ececec] bg-white/95 backdrop-blur lg:top-[72px]"
          >
            <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
              <div className="-mx-2 flex gap-2 overflow-x-auto py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <a
                  href="#showcase"
                  className="flex-shrink-0 rounded-full bg-[#0a0a0a] px-5 py-2 text-[13px] font-semibold text-white"
                  style={{ marginLeft: "0.5rem" }}
                >
                  Vše · {rows.length}
                </a>
                {industries.map(([industry, items]) => (
                  <a
                    key={industry}
                    href={`#industry-${industrySlug(industry)}`}
                    className="group flex flex-shrink-0 items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-5 py-2 text-[13px] font-medium text-[#374151] transition hover:border-[#6366f1] hover:bg-[#6366f1]/5 hover:text-[#0a0a0a]"
                  >
                    {INDUSTRY_LABELS[industry] ?? industryFromKey(items[0]!.key)}
                    <span className="rounded-full bg-[#f3f4f6] px-1.5 py-0.5 text-[10.5px] font-bold text-[#888] transition group-hover:bg-[#6366f1]/15 group-hover:text-[#4338ca]">
                      {items.length}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </nav>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  SHOWCASE — grouped by industry, premium cards                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section id="showcase" className="relative scroll-mt-[140px]">

          <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32">

            {rows.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#e5e5e5] bg-[#fafafa] p-16 text-center">
                <p className="text-[15.5px] text-[#666]">
                  Zatím nejsou publikované žádné šablony.
                </p>
                <Link
                  href="/admin/template-queue"
                  className="mt-4 inline-block text-[14px] font-semibold text-[#6366f1] hover:underline"
                >
                  Zveřejnit první šablonu →
                </Link>
              </div>
            )}

            {industries.map(([industry, items], idx) => {
              const label = INDUSTRY_LABELS[industry] ?? industryFromKey(items[0]!.key);
              const num = String(idx + 1).padStart(2, "0");
              return (
                <div
                  key={industry}
                  id={`industry-${industrySlug(industry)}`}
                  className={`scroll-mt-[140px] ${idx > 0 ? "mt-28 sm:mt-36" : ""}`}
                >
                  {/* Editorial section header */}
                  <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 md:flex-row md:items-end">
                    <div className="flex items-baseline gap-5">
                      <span
                        className="font-mono text-[18px] font-bold tracking-[-0.02em] text-[#6366f1] sm:text-[22px]"
                        style={{ letterSpacing: "0.04em" }}
                      >
                        {num}
                      </span>
                      <div>
                        <p
                          className="mb-2 text-[11px] font-semibold uppercase text-[#888]"
                          style={{ letterSpacing: "0.18em" }}
                        >
                          Kategorie
                        </p>
                        <h2
                          className="font-sans font-bold tracking-[-0.03em] text-[#0a0a0a]"
                          style={{ fontSize: "clamp(28px, 5vw, 56px)", lineHeight: "1.0" }}
                        >
                          {label}.
                        </h2>
                      </div>
                    </div>
                    <span
                      className="hidden text-[12px] font-semibold uppercase text-[#888] md:inline-block"
                      style={{ letterSpacing: "0.16em" }}
                    >
                      {items.length} {items.length === 1 ? "šablona" : items.length < 5 ? "šablony" : "šablon"}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r, i) => (
                      <ShowcaseCard key={r.key} row={r} featured={i === 0 && items.length >= 4} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/*  FINAL CTA — dark, indigo glow                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <section id="novinky" className="relative scroll-mt-[120px] overflow-hidden bg-[#0a0a0a]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 0%, rgba(99,102,241,0.22), transparent 70%), radial-gradient(40% 60% at 100% 100%, rgba(167,139,250,0.10), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div className="relative mx-auto max-w-[1280px] px-5 py-24 text-center sm:px-6 sm:py-32 lg:px-10 lg:py-40">
            <p
              className="mb-6 text-[12px] font-semibold uppercase text-[#a5b4fc]"
              style={{ letterSpacing: "0.18em" }}
            >
              Nenašli jste si?
            </p>
            <h2
              className="mx-auto max-w-[900px] font-sans font-bold text-white"
              style={{
                fontSize: "clamp(34px, 6.5vw, 80px)",
                lineHeight: "1.02",
                letterSpacing: "-0.04em",
              }}
            >
              Každý měsíc<br />
              <span className="text-[#a5b4fc]">2–3 nové šablony.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-[560px] text-[16px] leading-[1.65] text-white/80 sm:mt-8 sm:text-[17.5px]">
              Pošlete nám tip, co byste chtěli. Stávající šablony můžete vyzkoušet
              kdykoli zdarma, bez kreditní karty.
            </p>

            <div className="mt-11 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center">
              <a
                href="/#start"
                className="inline-flex h-[56px] items-center justify-center rounded-full bg-white px-12 text-[16px] font-semibold text-[#0a0a0a] shadow-[0_8px_40px_rgba(255,255,255,0.18)] transition hover:bg-white/95 active:scale-[0.97]"
              >
                Vyzkoušet zdarma
              </a>
              <a
                href="mailto:podpora@webero.co?subject=Tip%20na%20%C5%A1ablonu"
                className="inline-flex h-[56px] items-center justify-center rounded-full border border-white/20 px-8 text-[14.5px] font-semibold text-white transition hover:border-white/50"
              >
                Poslat tip na šablonu
              </a>
            </div>

            <p className="mt-7 text-[13px] text-white/55">
              Bez kreditní karty · Zrušíte kdykoli · 14 dní zdarma
            </p>
          </div>
        </section>

      </main>
      <PlatformFooter />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function DarkStat({ n, label }: { n: string; label: string }) {
  return (
    <div className="min-w-0 text-left">
      <div
        className="font-sans font-bold tracking-[-0.04em] text-white"
        style={{ fontSize: "clamp(32px, 5.5vw, 64px)", lineHeight: "1" }}
      >
        {n}
      </div>
      <div
        className="mt-2 text-[10.5px] font-semibold uppercase text-white/60 sm:text-[11.5px]"
        style={{ letterSpacing: "0.18em" }}
      >
        {label}
      </div>
    </div>
  );
}

function ShowcaseCard({ row, featured = false }: { row: Row; featured?: boolean }) {
  const previewWebp = path.join(process.cwd(), "public", "templates", row.key, "preview.webp");
  const previewPng  = path.join(process.cwd(), "public", "templates", row.key, "preview.png");
  const preview = existsSync(previewWebp)
    ? `/templates/${row.key}/preview.webp`
    : existsSync(previewPng) ? `/templates/${row.key}/preview.png` : null;
  const industryLabel = INDUSTRY_LABELS[row.industry] ?? row.industry;

  return (
    <Link
      href={`/ukazka-sablon/${row.key}`}
      className={`group relative block overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#6366f1]/40 hover:shadow-[0_30px_70px_-20px_rgba(99,102,241,0.30)] ${
        featured ? "sm:col-span-2 lg:col-span-1" : ""
      }`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-[#ececec] bg-[#f7f7f7] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <div className="ml-2 flex-1 truncate rounded bg-white px-2 py-0.5 text-[9.5px] text-[#9ca3af] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          {row.key}.webero.co
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#fafafa]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={row.name}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-[#aaa]">
            Bez náhledu
          </div>
        )}
        {/* Hover CTA */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/0 transition-colors duration-300 group-hover:bg-[#0a0a0a]/25">
          <span className="translate-y-2 rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-[#0a0a0a] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Prohlédnout →
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="min-w-0">
          <div
            className="text-[10.5px] font-semibold uppercase text-[#6366f1]"
            style={{ letterSpacing: "0.14em" }}
          >
            {industryLabel}
          </div>
          <div className="mt-0.5 truncate text-[15.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">
            {row.name}
          </div>
        </div>
        <span
          aria-hidden
          className="ml-3 text-[#9ca3af] transition-transform group-hover:translate-x-1 group-hover:text-[#6366f1]"
        >
          →
        </span>
      </div>
    </Link>
  );
}
