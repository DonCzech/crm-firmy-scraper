import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogoMark } from "./ShopHeader";
import { ProductCard, type ProductItem } from "./ProductListing";
import { ShopNewsletterBand } from "./ShopNewsletterBand";

const FEATURED_BRAND_LOGO_SCALE: Record<string, number> = {
  apple: 1.75,
  columbia: 1.65,
  converse: 1.55,
};

interface Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url?: string | null;
}

interface Props {
  tenantSlug: string;
  shopName: string;
  categories: Category[];
  products: ProductItem[];
  brands: string[];
  currency: string;
  /** Modul top-10: nejprodávanější produkty (seřazené) */
  bestsellers?: ProductItem[];
}

const USPS = [
  { icon: "truck", title: "Doprava zdarma", text: "u objednávek nad 1 500 Kč" },
  { icon: "clock", title: "Expedice do 24 h", text: "objednávky do 14:00 týž den" },
  { icon: "undo", title: "30 dní na vrácení", text: "bez udání důvodu" },
  { icon: "chat", title: "Zákaznická podpora", text: "po–pá 8:00–18:00" },
];

function UspIcon({ name }: { name: string }) {
  const c = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "truck": return <svg {...c}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
    case "clock": return <svg {...c}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case "undo": return <svg {...c}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>;
    case "chat": return <svg {...c}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.4-.7L3 21l1.8-5.6A8.4 8.4 0 1 1 21 11.5z" /></svg>;
    default: return null;
  }
}

function SectionHeading({ title, subtitle, href, linkLabel }: { title: string; subtitle?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-[26px] font-extrabold tracking-tight text-neutral-950 sm:text-[30px]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13.5px] text-neutral-500">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden items-center gap-1.5 text-[13.5px] font-bold text-neutral-600 transition hover:text-neutral-950 sm:flex">
          {linkLabel ?? "Zobrazit vše"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      )}
    </div>
  );
}

export function ShopHomepage({ tenantSlug, categories, products, brands, currency, bestsellers = [] }: Props) {
  const base = `/demo/${tenantSlug}/obchod`;

  const topLevel = categories.filter((c) => !c.parent_id && c.slug !== "novinky" && c.slug !== "akce");
  const featured = products.filter((p) => p.is_featured).slice(0, 4);
  const onSale = products
    .filter((p) => (p.compare_at_max_cents && p.compare_at_max_cents > p.price_min_cents) || p.is_sale)
    .slice(0, 8);
  const newest = products.filter((p) => p.is_new).slice(0, 4);
  const fallback = products.slice(0, 4);

  const featuredList = featured.length >= 2 ? featured : fallback;
  const newestList = newest.length >= 2 ? newest : products.slice(4, 8);

  const heroCat = topLevel.find((c) => c.slug === "elektronika") ?? topLevel[0];
  const heroSide1 = topLevel.find((c) => c.slug === "obleceni") ?? topLevel[1];
  const heroSide2 = topLevel.find((c) => c.slug === "sport") ?? topLevel[2];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pt-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          {/* Main banner */}
          <Link
            href={heroCat ? `${base}?kategorie=${heroCat.slug}` : `${base}?vse=1`}
            className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-neutral-950 p-8 sm:min-h-[560px] sm:p-12"
          >
            {heroCat?.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroCat.image_url.replace("w=600&h=600", "w=1600&h=900")}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            <div className="relative max-w-[620px]">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-white/70">Letní kolekce {new Date().getFullYear()}</p>
              <h1 className="mt-3 text-[40px] font-extrabold leading-[1.02] tracking-tight text-white sm:text-[58px]">
                Vše, co potřebujete.
                <br />Na jednom místě.
              </h1>
              <p className="mt-4 max-w-[480px] text-[15.5px] leading-relaxed text-white/85 sm:text-[17px]">
                Elektronika, móda, sport i domácnost od prověřených značek — s dopravou zdarma od 1 500 Kč.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-8 py-4 text-[15.5px] font-bold text-neutral-950 shadow-lg transition-transform duration-300 group-hover:translate-x-1">
                  Nakupovat
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </div>
            </div>
          </Link>

          {/* Side tiles */}
          <div className="grid grid-rows-2 gap-4">
            {[
              { cat: heroSide1, label: "Nová kolekce", accent: "bg-blue-600" },
              { cat: heroSide2, label: "Výprodej až −30 %", accent: "bg-red-600" },
            ].map(({ cat, label, accent }, i) =>
              cat ? (
                <Link
                  key={cat.id}
                  href={`${base}?kategorie=${i === 1 ? "akce" : cat.slug}`}
                  className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 p-7"
                >
                  {cat.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url.replace("w=600&h=600", "w=800&h=500")}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="relative">
                    <span className={`inline-block rounded-md ${accent} px-2 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white`}>
                      {label}
                    </span>
                    <p className="mt-2 text-[20px] font-extrabold text-white">{i === 1 ? "Akce & Výprodej" : cat.name}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-white/90 underline-offset-4 group-hover:underline">
                      Prohlédnout
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </span>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* ── USP band ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pt-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {USPS.map((u) => (
            <div key={u.icon} className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 px-5 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <UspIcon name={u.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-neutral-950">{u.title}</p>
                <p className="truncate text-[12px] text-neutral-500">{u.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pt-14">
        <SectionHeading title="Nakupujte podle kategorií" subtitle="Vše přehledně na jednom místě" href={`${base}?vse=1`} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {topLevel.slice(0, 10).map((cat) => (
            <Link key={cat.id} href={`${base}?kategorie=${cat.slug}`} className="group">
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-neutral-100">
                {cat.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[15.5px] font-extrabold text-white">{cat.name}</p>
                  <p className="text-[11.5px] font-medium text-white/70">{cat.product_count} produktů</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TOP 10 nejprodávanější (modul top-10) ────────────── */}
      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-14">
          <SectionHeading title="TOP 10 nejprodávanějších" subtitle="Podle skutečných objednávek za poslední měsíc" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {bestsellers.map((p, i) => (
              <div key={p.id} className="relative">
                <span className={`absolute -left-1.5 -top-1.5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-extrabold shadow-md ${
                  i === 0 ? "bg-[#ffd200] text-neutral-950" : i < 3 ? "bg-neutral-950 text-white" : "bg-white text-neutral-950 ring-1 ring-neutral-200"
                }`}>
                  {i + 1}
                </span>
                <ProductCard p={p} basePath={base} currency={currency} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured products ────────────────────────────────── */}
      {featuredList.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-14">
          <SectionHeading title="Doporučujeme" subtitle="Výběr toho nejlepšího od našich nákupčích" href={`${base}?vse=1`} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featuredList.map((p) => (
              <ProductCard key={p.id} p={p} basePath={base} currency={currency} />
            ))}
          </div>
        </section>
      )}

      {/* ── Sale strip ───────────────────────────────────────── */}
      {onSale.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-14">
          <div className="overflow-hidden rounded-3xl bg-neutral-950">
            <div className="grid lg:grid-cols-[300px_1fr]">
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <span className="inline-block w-fit rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  Jen do vyprodání
                </span>
                <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-white">
                  Slevy až
                  <br /><span className="text-red-500">−30 %</span>
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-400">
                  Vybrané produkty za nejlepší ceny sezóny.
                </p>
                <Link
                  href={`${base}?kategorie=akce`}
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-bold text-neutral-950 transition hover:bg-neutral-200"
                >
                  Všechny slevy
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 lg:p-6">
                {onSale.map((p) => (
                  <ProductCard key={p.id} p={p} basePath={base} currency={currency} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── New arrivals ─────────────────────────────────────── */}
      {newestList.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-14">
          <SectionHeading title="Novinky" subtitle="Čerstvě naskladněno" href={`${base}?kategorie=novinky`} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {newestList.map((p) => (
              <ProductCard key={p.id} p={p} basePath={base} currency={currency} />
            ))}
          </div>
        </section>
      )}

      {/* ── Brand strip ──────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pt-14">
          <SectionHeading title="Značky, kterým věříme" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brands.slice(0, 18).map((b) => (
              <Link
                key={b}
                href={`${base}?znacka=${encodeURIComponent(b)}`}
                className="group relative flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200/80 bg-white px-4 py-4 text-center text-neutral-950 shadow-[0_18px_44px_-34px_rgba(17,24,39,0.55)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-[#fbfaf8] hover:shadow-[0_24px_50px_-32px_rgba(17,24,39,0.75)]"
              >
                <BrandLogoMark brand={b} logoScale={FEATURED_BRAND_LOGO_SCALE[b.toLowerCase()] ?? 1} />
                <span className="block max-w-full text-[13.5px] font-extrabold leading-tight tracking-tight">{b}</span>
                <ArrowUpRight className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-neutral-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900" strokeWidth={1.9} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Newsletter (světlý pás, oddělený od footeru) ─────── */}
      <div className="pt-16 pb-16">
        <ShopNewsletterBand tenantSlug={tenantSlug} />
      </div>
    </div>
  );
}
