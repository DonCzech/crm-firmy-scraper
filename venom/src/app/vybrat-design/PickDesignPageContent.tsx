import Link from "next/link";
import type { Metadata } from "next";
import { existsSync, readdirSync } from "fs";
import path from "path";
import { ArrowRight } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { query } from "@/lib/db";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";
import { DesignGallery, type DesignTemplate } from "./DesignGallery";

export const metadata: Metadata = {
  title: "Vybrat design — Webero",
  description:
    "Kompletní katalog šablon. Začněte konceptem webu místo prázdné stránky — 99+ designů pro každý obor, plně editovatelné.",
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

const INDUSTRY_LABEL: Record<string, string> = {
  ananda: "Wellness", arbo: "Arboristika", arch: "Architekti",
  autoservis: "Autoservis", autoskola: "Autoškoly", bakery: "Pekárny",
  barber: "Barbershop", beauty: "Kosmetika", cafe: "Kavárny",
  catering: "Catering", chalet: "Chalupy", clean: "Úklid",
  clinic: "Kliniky", ddd: "DDD služby", dental: "Stomatologie",
  dj: "DJ", edu: "Vzdělávání", elektro: "Elektrikáři",
  events: "Eventy", fitness: "Fitness", floors: "Podlahy",
  florist: "Květinářství", fyzio: "Fyzioterapie", garden: "Zahrady",
  grooming: "Grooming", hair: "Holičství", hotel: "Hotely",
  instala: "Instalatéři", kids: "Dětské služby", klempir: "Klempíři",
  klima: "Klimatizace", lang: "Jazykové školy", lawyer: "Advokáti",
  legal: "Právní služby", malir: "Malíři", massage: "Masáže",
  nails: "Nehtové studio", ortho: "Ortodoncie", "peak-cut": "Barbershop",
  pethotel: "Pet hotely", photo: "Fotografové", reality: "Reality",
  restaurant: "Restaurace", solar: "Fotovoltaika", stavba: "Stavba",
  sweet: "Cukrárny", tattoo: "Tetování", ucetni: "Účetnictví",
  vet: "Veterináři", video: "Videoprodukce", lifestyle: "Lifestyle",
};

const CATEGORIES: { label: string; prefixes: string[] }[] = [
  { label: "Vše",          prefixes: [] },
  { label: "Krása & péče", prefixes: ["barber", "beauty", "nails", "hair", "tattoo", "massage", "grooming", "peak-cut"] },
  { label: "Zdraví",       prefixes: ["clinic", "dental", "ortho", "vet", "fyzio", "fitness", "ananda"] },
  { label: "Gastronomie",  prefixes: ["restaurant", "cafe", "bakery", "sweet", "catering"] },
  { label: "Ubytování",    prefixes: ["hotel", "chalet"] },
  { label: "Reality",      prefixes: ["reality"] },
  { label: "Řemesla",      prefixes: ["stavba", "elektro", "instala", "malir", "klempir", "klima", "floors", "solar", "autoservis"] },
  { label: "Služby",       prefixes: ["ucetni", "lawyer", "legal", "autoskola", "lang", "kids", "edu", "clean", "ddd", "arbo", "florist", "garden", "pethotel"] },
  { label: "Kreativní",    prefixes: ["photo", "video", "dj", "events", "arch"] },
];

const COPY = {
  cs: {
    eyebrow: "Webové koncepty",
    title: "Přivítejte webové koncepty.",
    muted: "Změnit v nich můžete vše.",
    intro: "Jsou kombinací designu, obsahu a funkcí pro daný obor. Představují nejlepší startovní bod pro váš web — vyberte si oborový pohled a spusťte ho za 5 minut.",
    ctaTitle: "Nenašli jste obor?",
    ctaMuted: "Přidáváme každý den.",
    ctaText: "Napište nám, jaký koncept vám chybí — připravíme ho přednostně. Mezitím můžete kterýkoliv z existujících designů přizpůsobit svému oboru.",
    suggest: "Navrhnout obor",
    pricing: "Zobrazit ceník",
  },
  en: {
    eyebrow: "Website concepts",
    title: "Meet website concepts.",
    muted: "You can change everything.",
    intro: "They combine design, content, and features for a specific industry. Pick a starting point for your business and launch it in five minutes.",
    ctaTitle: "Did not find your industry?",
    ctaMuted: "We add new concepts every day.",
    ctaText: "Tell us which concept is missing and we will prioritize it. Until then, any existing design can be adapted to your industry.",
    suggest: "Suggest an industry",
    pricing: "View pricing",
  },
} as const;

function findPreview(slug: string): string | null {
  const dir = path.join(process.cwd(), "public", "templates", slug);
  if (!existsSync(dir)) return null;
  const candidates = [
    `showcase/desktop-full.png`,
    `showcase/desktop-hero.png`,
    `preview.webp`,
    `hero-bg.webp`,
    `hero.webp`,
    `hero-1.webp`,
    `hero-art.webp`,
    `hero-2.webp`,
    `preview.png`,
  ];
  for (const c of candidates) {
    if (existsSync(path.join(dir, c))) return `/templates/${slug}/${c}`;
  }
  return null;
}

function industryFromSlug(slug: string): string {
  if (slug.startsWith("peak-cut")) return INDUSTRY_LABEL["peak-cut"];
  const base = slug.split("-")[0];
  return INDUSTRY_LABEL[base] || "Šablona";
}

function prettyName(slug: string): string {
  return slug.replace(/(\w+)-(\d+)/, "$1 — $2").replace(/-/g, " ");
}

async function getTemplates(): Promise<DesignTemplate[]> {
  const root = path.join(process.cwd(), "public", "templates");
  if (!existsSync(root)) return [];
  const slugs = readdirSync(root).filter((s) => !s.startsWith("."));

  let dbMeta: Map<string, { name: string; industry: string; demoSlug: string | null }> = new Map();
  try {
    const rows = await query<{ key: string; name: string; industry: string; primary_demo_slug: string | null }>(
      `SELECT key, name, industry, primary_demo_slug FROM templates WHERE status = 'active'`,
    );
    dbMeta = new Map(rows.map((r) => [r.key, { name: r.name, industry: r.industry, demoSlug: r.primary_demo_slug }]));
  } catch {}

  const items: DesignTemplate[] = [];
  for (const slug of slugs) {
    const preview = findPreview(slug);
    if (!preview) continue;
    const meta = dbMeta.get(slug);
    items.push({
      slug,
      name: meta?.name || prettyName(slug),
      industry: meta?.industry || industryFromSlug(slug),
      preview,
      demoSlug: meta?.demoSlug ?? null,
    });
  }
  items.sort((a, b) => a.slug.localeCompare(b.slug));
  return items;
}

export async function PickDesignPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const templates = await getTemplates();
  const copy = COPY[locale];

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid locale={locale} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[120px] lg:pt-[140px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.10), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1280px] px-6 pb-12 lg:px-10 lg:pb-16">
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            {copy.eyebrow}
          </p>
          <h1
            className="font-sans font-semibold tracking-[-0.03em]"
            style={{ fontSize: "clamp(40px, 5.5vw, 78px)", lineHeight: "1.02" }}
          >
            {copy.title}<br />
            <span className="text-[#9ca3af]">{copy.muted}</span>
          </h1>
          <p className="mt-7 max-w-[640px] text-[17px] leading-[1.6] text-[#4b5563]">
            {copy.intro}
          </p>
        </div>
      </section>

      {/* Gallery with client-side filter */}
      <section className="overflow-x-clip bg-white">
        <div className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-10 lg:pb-32">
          <DesignGallery templates={templates} categories={CATEGORIES} locale={locale} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <h2
            className="mx-auto max-w-[720px] font-sans font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: "1.05" }}
          >
            {copy.ctaTitle}<br /><span className="text-white/55">{copy.ctaMuted}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15.5px] leading-[1.65] text-white/65">
            {copy.ctaText}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="mailto:napady@webero.co" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              {copy.suggest} <ArrowRight size={16} />
            </Link>
            <Link href={platformPath("/cenik", locale)} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:border-white/40 hover:bg-white/5">
              {copy.pricing}
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter locale={locale} />
    </main>
  );
}

export default async function PickDesignPage() {
  return <PickDesignPageContent locale="cs" />;
}
