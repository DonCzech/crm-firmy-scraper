import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "fs";
import path from "path";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { ActivateButton } from "@/components/ActivateButton";
import { queryOne, query } from "@/lib/db";
import { LiveDesktopFrame, LiveMobileFrame } from "./LiveFrames";

interface Props {
  params: Promise<{ key: string }>;
}

interface TemplateRow {
  id: number;
  key: string;
  name: string;
  industry: string;
  current_version: string;
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

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const row = await queryOne<TemplateRow>(
    "SELECT key, name, industry FROM templates WHERE key = $1 AND review_status = 'approved' AND status = 'active'",
    [key]
  );
  if (!row) return { title: "Ukázka šablony nenalezena — Webero" };
  return {
    title: `${row.name} — Ukázka šablony | Webero`,
    description: `Detailní ukázka šablony ${row.name}. Desktop, mobil, sekce, živé demo — vyberte si svůj web během minut.`,
    alternates: { canonical: `/ukazka-sablon/${row.key}` },
    openGraph: {
      title: `${row.name} — ukázka`,
      images: [`/templates/${row.key}/preview.png`],
    },
  };
}

function asset(key: string, file: string): string | null {
  // Prefer WebP over PNG if available
  if (file.endsWith(".png")) {
    const webpFile = file.replace(/\.png$/, ".webp");
    const webpFs = path.join(process.cwd(), "public", "templates", key, ...webpFile.split("/"));
    if (existsSync(webpFs)) return `/templates/${key}/${webpFile}`;
  }
  const fs = path.join(process.cwd(), "public", "templates", key, ...file.split("/"));
  return existsSync(fs) ? `/templates/${key}/${file}` : null;
}

export default async function ShowcaseDetailPage({ params }: Props) {
  const { key } = await params;
  const row = await queryOne<TemplateRow & { primary_demo_slug: string | null }>(
    `SELECT id, key, name, industry, current_version, reviewed_at, primary_demo_slug
       FROM templates
      WHERE key = $1 AND review_status = 'approved' AND status = 'active'`,
    [key]
  );
  if (!row) return notFound();

  // Prefer explicitly set primary_demo_slug; fall back to first v2 tenant by id
  const tenant = row.primary_demo_slug
    ? await queryOne<{ slug: string }>(
        `SELECT slug FROM tenants WHERE slug = $1`,
        [row.primary_demo_slug]
      )
    : await queryOne<{ slug: string }>(
        `SELECT t.slug FROM tenants t
           JOIN sections s ON s.tenant_id = t.id AND s.content_source = 'v2'
          WHERE t.template_id = $1
          ORDER BY t.id LIMIT 1`,
        [row.id]
      );

  const preview = asset(row.key, "preview.png");
  const desktopHero = asset(row.key, "showcase/desktop-hero.png") ?? preview;
  const desktopFull = asset(row.key, "showcase/desktop-full.png");
  const sectionShots = [1, 2, 3, 4]
    .map((i) => asset(row.key, `showcase/section-${i}.png`))
    .filter((s): s is string => Boolean(s));

  const gallery = sectionShots.length > 0 ? sectionShots : [desktopFull].filter((s): s is string => Boolean(s));

  const industryLabel = INDUSTRY_LABELS[row.industry] ?? row.industry;
  const demoUrl = tenant ? `/demo/${tenant.slug}` : null;
  const studioUrl = tenant ? `/demo/${tenant.slug}/studio` : null;

  const related = await query<{ key: string; name: string }>(
    `SELECT key, name FROM templates
      WHERE review_status = 'approved' AND status = 'active'
        AND industry = $1 AND key != $2
      ORDER BY reviewed_at DESC NULLS LAST LIMIT 6`,
    [row.industry, row.key]
  );

  return (
    <>
      <PlatformHeader
        forceSolid
        navItems={[
          { label: "PŘEHLED", href: "#top" },
          { label: "EDITOR",  href: "#editor" },
          ...(gallery.length > 0 ? [{ label: "SEKCE", href: "#sekce" }] : []),
          ...(related.length > 0 ? [{ label: "PODOBNÉ", href: "#podobne" }] : []),
        ]}
      />
      <main className="bg-white text-[#0a0a0a] pt-[64px] lg:pt-[72px]">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section id="top" className="scroll-mt-[80px] relative border-b border-[#ececec] bg-white">
          <div className="mx-auto max-w-[1280px] px-5 pt-6 sm:px-6 lg:px-10 lg:pt-10">
            <Link
              href="/ukazka-sablon"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#666] hover:text-[#0a0a0a]"
              style={{ letterSpacing: "0.04em" }}
            >
              ← Všechny šablony
            </Link>
          </div>

          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 pt-8 pb-16 sm:px-6 sm:gap-14 sm:pt-10 sm:pb-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:pb-28">

            {/* LEFT — Copy + CTAs */}
            <div className="lg:col-span-5">
              <p
                className="mb-4 text-[11px] font-semibold uppercase text-[#6366f1] sm:mb-5 sm:text-[12px]"
                style={{ letterSpacing: "0.16em" }}
              >
                Šablona · {industryLabel}
              </p>
              <h1
                className="font-sans font-bold tracking-[-0.035em] text-[#0a0a0a]"
                style={{ fontSize: "clamp(34px, 8.5vw, 72px)", lineHeight: "1.02" }}
              >
                {row.name}
              </h1>
              <p className="mt-5 max-w-[480px] text-[15.5px] leading-[1.6] text-[#555] sm:mt-6 sm:text-[17px] sm:leading-[1.65]">
                Profesionální šablona pro obor <span className="font-semibold text-[#0a0a0a]">{industryLabel}</span>.
                Plně responzivní, live editor, SEO-ready. Aktivace na pár kliků.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
                <ActivateButton templateKey={row.key} templateName={row.name} />
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]"
                  >
                    Otevřít živé demo
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[#ececec] pt-6 sm:mt-12 sm:gap-6 sm:pt-7">
                <Spec label="Verze" value={`v${row.current_version}`} />
                <Spec label="Obor" value={industryLabel} />
                <Spec label="Stav" value="Schváleno" tone="ok" />
              </dl>
            </div>

            {/* RIGHT — Desktop: Studio Display. Mobile: iPhone */}
            <div className="lg:col-span-7">
              {/* Mobile (< lg): iPhone */}
              <div className="flex justify-center lg:hidden">
                <LiveMobileFrame demoUrl={demoUrl} />
              </div>
              {/* Desktop (lg+): Apple Studio Display */}
              <div className="hidden lg:block">
                <LiveDesktopFrame demoUrl={demoUrl} compact />
              </div>
            </div>

          </div>
        </section>

        {/* ── EDITOR SHOWCASE — Split: real product UI left, features right ── */}
        <section id="editor" className="scroll-mt-[80px] border-b border-[#ececec] bg-[#fafafa]">
          <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-36">

            <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-12 lg:gap-20">

              {/* LEFT — Studio editor mockup */}
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)]">
                  {/* Studio top bar */}
                  <div className="flex items-center justify-between border-b border-[#ececec] bg-white px-3 py-2 sm:px-4 sm:py-2.5">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      <div className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#6366f1] to-[#4338ca] sm:h-6 sm:w-6">
                        <svg width="12" height="12" viewBox="0 0 30 30" fill="none">
                          <path d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="truncate text-[11px] font-semibold text-[#0a0a0a] sm:text-[12.5px]">Studio · {row.name}</span>
                      <span className="hidden text-[11.5px] text-[#888] sm:inline">/ Hero</span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                      <span className="hidden rounded-md bg-[#22c55e]/10 px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#16a34a] sm:inline-block">
                        Uloženo
                      </span>
                      <span className="rounded-md bg-[#0a0a0a] px-2 py-0.5 text-[9.5px] font-semibold text-white sm:px-2.5 sm:py-1 sm:text-[10.5px]">
                        Publikovat
                      </span>
                    </div>
                  </div>

                  {/* Editor body: sidebar (≥sm only) + canvas */}
                  <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] md:grid-cols-[160px_1fr]">
                    {/* Sidebar — hidden on mobile, shown ≥sm */}
                    <aside className="hidden border-r border-[#ececec] bg-[#fafafa] p-3 sm:block">
                      <div className="mb-3 px-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#888]">
                        Sekce
                      </div>
                      {[
                        ["Hero",    true],
                        ["O nás",   false],
                        ["Služby",  false],
                        ["Galerie", false],
                        ["Reference", false],
                        ["Kontakt", false],
                      ].map(([label, active]) => (
                        <div
                          key={String(label)}
                          className={`mb-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[12px] ${
                            active
                              ? "bg-white font-semibold text-[#0a0a0a] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                              : "text-[#666] hover:bg-white/50"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#6366f1]" : "bg-[#ccc]"}`}
                          />
                          {label}
                        </div>
                      ))}
                    </aside>

                    {/* Canvas — real template hero with selected element */}
                    <div className="relative aspect-[16/10.5] overflow-hidden bg-[#f3f4f6]">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={preview}
                          alt={`${row.name} editor canvas`}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#e7e5e0] to-[#cdbf9f]" />
                      )}

                      {/* Selected heading + floating toolbar */}
                      <div className="absolute left-[5%] top-[12%] max-w-[70%] sm:left-[6%] sm:top-[14%] sm:max-w-[60%]">
                        <div className="relative inline-block rounded border-2 border-[#6366f1] bg-white/95 px-2 py-1.5 text-[11px] font-bold tracking-[-0.01em] text-[#0a0a0a] shadow-lg sm:px-3 sm:py-2 sm:text-[14px]">
                          {row.name}
                          <span className="absolute -top-2.5 left-1.5 rounded bg-[#6366f1] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white sm:-top-3 sm:left-2 sm:px-2 sm:text-[9px]">
                            Heading
                          </span>
                        </div>
                        <div className="mt-1.5 inline-flex items-center gap-0.5 rounded-md bg-[#0a0a0a] px-1.5 py-1 text-white shadow-lg sm:mt-2 sm:gap-1 sm:px-2 sm:py-1.5">
                          <span className="px-1 text-[9px] font-bold sm:px-1.5 sm:text-[11px]">B</span>
                          <span className="px-1 text-[9px] italic sm:px-1.5 sm:text-[11px]">I</span>
                          <span className="px-1 text-[9px] underline sm:px-1.5 sm:text-[11px]">U</span>
                          <span className="mx-0.5 h-2.5 w-px bg-white/20 sm:h-3" />
                          <span className="h-2.5 w-2.5 rounded-sm bg-[#6366f1] sm:h-3.5 sm:w-3.5" />
                          <span className="h-2.5 w-2.5 rounded-sm bg-[#22c55e] sm:h-3.5 sm:w-3.5" />
                          <span className="hidden h-3.5 w-3.5 rounded-sm bg-[#f59e0b] sm:inline-block" />
                        </div>
                      </div>

                      {/* PageSpeed badge — desktop only */}
                      <div className="absolute bottom-4 right-4 hidden rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 shadow-md md:flex md:items-center md:gap-2.5">
                        <div className="relative grid h-9 w-9 place-items-center">
                          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e8fbe8" strokeWidth="2.5" />
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#0cce6b" strokeWidth="2.5"
                                    strokeDasharray="97.4" strokeDashoffset="0.97" strokeLinecap="round" />
                          </svg>
                          <span className="text-[12.5px] font-bold tracking-[-0.04em] text-[#0a0a0a]">99</span>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#0a7a2f]">PageSpeed</div>
                          <div className="text-[11px] font-semibold text-[#0a0a0a]">Mobile · Desktop</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Headline + refined feature list */}
              <div className="lg:col-span-5">
                <p
                  className="mb-4 text-[11px] font-semibold uppercase text-[#6366f1] sm:mb-5 sm:text-[12px]"
                  style={{ letterSpacing: "0.16em" }}
                >
                  Klikni a uprav.
                </p>
                <h2
                  className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
                  style={{ fontSize: "clamp(28px, 6vw, 48px)", lineHeight: "1.05" }}
                >
                  Tečka.
                </h2>
                <p className="mt-5 max-w-[440px] text-[15.5px] leading-[1.6] text-[#555] sm:text-[16.5px] sm:leading-[1.65]">
                  Otevřete admin, klikněte na nadpis, obrázek nebo tlačítko, změňte ho.
                  Hotovo. Žádný backend, žádné šablony k editaci v kódu, žádné konzole.
                </p>

                <ul className="mt-7 space-y-3.5 sm:mt-9 sm:space-y-4">
                  {[
                    { k: "Live editor",     v: "Klikni → uprav → ulož. Bez kódu." },
                    { k: "PageSpeed 99/100", v: "Optimalizováno pro Google a mobil." },
                    { k: "Mobile-first",     v: "Bez rozbitých layoutů, bez horizontálního scrollu." },
                    { k: "SEO ready",        v: "Title, meta, OG tagy, JSON-LD schéma — out of the box." },
                    { k: "Vlastní doména",   v: "mojefirma.cz s automatickým HTTPS." },
                    { k: "EU hosting",       v: "Datacentrum v Praze a Frankfurtu. CDN po celé Evropě." },
                  ].map((f) => (
                    <li key={f.k} className="flex items-start gap-3">
                      <span className="mt-[3px] grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#22c55e]/15 text-[#16a34a]">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      </span>
                      <span className="text-[14.5px] leading-[1.5] sm:text-[15px]">
                        <span className="font-semibold text-[#0a0a0a]">{f.k}.</span>{" "}
                        <span className="text-[#555]">{f.v}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>


        {/* ── SECTION GALLERY ─────────────────────────────────────────── */}
        {gallery.length > 0 && (
          <section id="sekce" className="scroll-mt-[80px] border-y border-[#ececec] bg-[#fafafa]">
            <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-36">
              <div className="mx-auto mb-10 max-w-[820px] text-center sm:mb-14">
                <p
                  className="mb-4 text-[11px] font-semibold uppercase text-[#6366f1] sm:mb-5 sm:text-[12px]"
                  style={{ letterSpacing: "0.16em" }}
                >
                  Sekce po sekci
                </p>
                <h2
                  className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
                  style={{ fontSize: "clamp(28px, 7vw, 56px)", lineHeight: "1.05" }}
                >
                  Každý detail<br />
                  <span className="text-[#9ca3af]">promyšlený.</span>
                </h2>
              </div>

              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {gallery.map((src, i) => (
                  <figure
                    key={src}
                    className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[#0a0a0a]/30 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)] sm:rounded-2xl"
                  >
                    <div className="flex items-center gap-1.5 border-b border-[#ececec] bg-[#f7f7f7] px-3 py-2">
                      <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                      <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                      <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Sekce ${i + 1}`} loading="lazy" className="h-full w-full object-cover object-top" />
                    </div>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FINAL CTA — Dark, indigo glow, homepage style ───────────── */}
        <section className="relative overflow-hidden bg-[#0a0a0a]">
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

          <div className="relative mx-auto max-w-[1280px] px-5 py-20 text-center sm:px-6 sm:py-28 lg:px-10 lg:py-40">
            <p
              className="mb-5 text-[11px] font-semibold uppercase text-[#a5b4fc] sm:mb-7 sm:text-[12px]"
              style={{ letterSpacing: "0.18em" }}
            >
              Začněte ještě dnes
            </p>
            <h2
              className="mx-auto max-w-[820px] font-sans font-bold text-white"
              style={{
                fontSize: "clamp(30px, 7vw, 72px)",
                lineHeight: "1.04",
                letterSpacing: "-0.035em",
              }}
            >
              Zkuste si <span className="text-[#a5b4fc]">{row.name}</span> hned teď.
            </h2>
            <p className="mx-auto mt-5 max-w-[540px] text-[15.5px] leading-[1.6] text-white/80 sm:mt-7 sm:text-[17px] sm:leading-[1.65]">
              Otevřete živé demo, klikejte, scrollujte, vyzkoušejte mobilní pohled.
              Žádná registrace, žádný závazek.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center">
              <ActivateButton templateKey={row.key} templateName={row.name} />
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/0 px-7 text-[15px] font-semibold text-white transition hover:border-white/50"
                >
                  Otevřít živé demo
                  <span aria-hidden>↗</span>
                </a>
              )}
              {studioUrl && (
                <a
                  href={studioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 text-[14px] font-semibold text-white/85 transition hover:border-white/40 hover:text-white"
                >
                  Studio editor ↗
                </a>
              )}
            </div>

            <p className="mt-6 text-[13px] text-white/55 sm:mt-7">
              Bez kreditní karty · Zrušíte kdykoli
            </p>
          </div>
        </section>

        {/* ── RELATED TEMPLATES ───────────────────────────────────────── */}
        {related.length > 0 && (
          <section id="podobne" className="scroll-mt-[80px] bg-white">
            <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-32">
              <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:mb-12 md:flex-row md:items-end">
                <div>
                  <p
                    className="mb-3 text-[11px] font-semibold uppercase text-[#6366f1] sm:text-[12px]"
                    style={{ letterSpacing: "0.16em" }}
                  >
                    Podobné šablony
                  </p>
                  <h2
                    className="font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
                    style={{ fontSize: "clamp(22px, 5vw, 42px)", lineHeight: "1.1" }}
                  >
                    Další ukázky ze stejného oboru.
                  </h2>
                </div>
                <Link
                  href="/ukazka-sablon"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#6366f1] hover:underline"
                >
                  Všechny šablony
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => {
                  const p = asset(r.key, "preview.png");
                  return (
                    <Link
                      key={r.key}
                      href={`/ukazka-sablon/${r.key}`}
                      className="group overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0a0a0a]/30 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex items-center gap-1.5 border-b border-[#ececec] bg-[#f7f7f7] px-3 py-2">
                        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                        <div className="ml-2 flex-1 truncate rounded bg-white px-2 py-0.5 text-[9.5px] text-[#9ca3af] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
                          {r.key}.webero.co
                        </div>
                      </div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#fafafa]">
                        {p ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p}
                            alt={r.name}
                            loading="lazy"
                            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[12px] text-[#aaa]">
                            Bez náhledu
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between px-5 py-4">
                        <div>
                          <div
                            className="text-[10.5px] font-semibold uppercase text-[#6366f1]"
                            style={{ letterSpacing: "0.14em" }}
                          >
                            {INDUSTRY_LABELS[row.industry] ?? row.industry}
                          </div>
                          <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-[#0a0a0a] group-hover:text-[#0a0a0a]">
                            {r.name}
                          </div>
                        </div>
                        <span className="text-[#9ca3af] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0a0a0a]" aria-hidden>→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <PlatformFooter />
    </>
  );
}

function Spec({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="min-w-0">
      <dt
        className="text-[9.5px] font-bold uppercase text-[#888] sm:text-[10.5px]"
        style={{ letterSpacing: "0.16em" }}
      >
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-[#0a0a0a] sm:mt-1.5 sm:text-[14.5px]">
        {tone === "ok" && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22c55e]" />}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  );
}


