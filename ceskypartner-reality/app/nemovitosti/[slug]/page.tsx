import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import WatchdogForm from "@/components/WatchdogForm";
import JsonLd from "@/components/JsonLd";
import { searchListings } from "@/lib/queries";
import { dbToCardListing } from "@/lib/mappers";
import { allLocalPages, getLocalPage, localTitle, LOCAL_KINDS, LOCAL_REGIONS, type LocalPage } from "@/lib/localSeo";
import { allEnglishLocalPages } from "@/lib/localSeoEn";
import { breadcrumbJsonLd, itemListJsonLd, absoluteUrl } from "@/lib/seo";

export const revalidate = 300;
export const dynamicParams = false;

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return allLocalPages().map((p) => ({ slug: p.slug }));
}

function metaDescription(p: LocalPage, count: number): string {
  const kde = p.region ? ` ${p.region.locative}` : " v celé ČR";
  return `${localTitle(p)} — aktuálně ${count > 0 ? `${count} nemovitostí` : "pečlivě vybraná nabídka"} v exkluzivním zastoupení. Prověřené nemovitosti${kde}, osobní přístup, právní servis v ceně.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = getLocalPage(params.slug);
  if (!p) return {};
  const listings = await fetchListings(p);
  const title = localTitle(p);
  const englishPage = allEnglishLocalPages().find((page) => page.czechSlug === p.slug);
  const czechPath = `/nemovitosti/${p.slug}`;
  const englishPath = englishPage ? `/en/real-estate/${englishPage.slug}` : "/en/properties/all";
  return {
    title,
    description: metaDescription(p, listings.length),
    alternates: {
      canonical: czechPath,
      languages: { "cs-CZ": czechPath, "en-GB": englishPath, "x-default": czechPath },
    },
    openGraph: { title, description: metaDescription(p, listings.length) },
  };
}

function fetchListings(p: LocalPage) {
  return searchListings({
    deal: p.deal.value,
    kind: p.kind.value,
    ...(p.region ? { regions: [p.region.value] } : {}),
  }).catch(() => []);
}

/** FAQ — z reálných dat (průměrná cena) + evergreen odpovědi */
function buildFaq(p: LocalPage, avgPrice: number | null, count: number) {
  const kde = p.region ? ` ${p.region.locative}` : "";
  const isRent = p.deal.value === "RENT";
  const items: { q: string; a: string }[] = [];

  if (avgPrice) {
    items.push({
      q: `Kolik stojí ${p.kind.singular} ${p.deal.suffix}${kde}?`,
      a: `Průměrná cena v naší aktuální nabídce je ${Math.round(avgPrice).toLocaleString("cs-CZ")} Kč${isRent ? " měsíčně" : ""}. Konkrétní cena závisí na lokalitě, stavu a dispozici — rádi vám připravíme přesný odhad zdarma.`,
    });
  }
  items.push({
    q: `Jak probíhá ${isRent ? "pronájem" : "koupě"} přes Český Partner?`,
    a: isRent
      ? "Vybranou nemovitost si prohlédnete s makléřem, který ji osobně zná. Smlouvu připraví náš právník, kauce jde do úschovy a předání proběhne s protokolem — bez skrytých poplatků."
      : "Po prohlídce s makléřem rezervujete nemovitost rezervační smlouvou. Kupní cenu kryje advokátní úschova, právní servis a katastr vyřídíme za vás. Průměrně celý proces trvá 4–6 týdnů.",
  });
  items.push({
    q: "Co znamená exkluzivní zastoupení?",
    a: "Každou nemovitost nabízíme jako jediná kancelář. Znamená to jednotnou cenu na všech portálech, prověřenou dokumentaci a makléře, který nemovitost skutečně zná — žádné přeprodané inzeráty.",
  });
  if (count === 0) {
    items.push({
      q: `Aktuálně nemáte ${p.kind.genitive}${kde} v nabídce — co teď?`,
      a: "Nastavte si hlídacího psa níže. Jakmile odpovídající nemovitost zařadíme, dostanete ji e-mailem jako první — často ještě před zveřejněním na portálech.",
    });
  }
  return items;
}

export default async function LocalSeoPage({ params }: PageProps) {
  const p = getLocalPage(params.slug);
  if (!p) notFound();

  const listings = await fetchListings(p);
  const cards = listings.map(dbToCardListing);
  const prices = listings.map((l) => l.price).filter((x) => x > 0);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
  const title = localTitle(p);
  const faq = buildFaq(p, avgPrice, listings.length);

  // Interní prolinkování: stejný typ v jiných krajích + jiné typy ve stejném kraji
  const sameKindLinks = p.region
    ? LOCAL_REGIONS.filter((r) => r.value !== p.region!.value).slice(0, 8).map((r) => ({
        label: `${p.kind.plural} ${p.deal.suffix} — ${r.label}`,
        href: `/nemovitosti/${p.deal.slug}-${p.kind.slug}-${r.slug}`,
      }))
    : [];
  const sameRegionLinks = LOCAL_KINDS.filter((k) => k.value !== p.kind.value).map((k) => ({
    label: `${k.plural} ${p.deal.suffix}${p.region ? ` — ${p.region.label}` : ""}`,
    href: `/nemovitosti/${p.deal.slug}-${k.slug}${p.region ? `-${p.region.slug}` : ""}`,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Úvod", path: "/" },
            { name: p.deal.label, path: `/nabidka/${p.deal.slug}` },
            { name: title, path: `/nemovitosti/${p.slug}` },
          ]),
          itemListJsonLd(cards.map((l) => ({ name: l.title, path: `/nemovitost/${l.id}` }))),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          },
        ]}
      />
      <Header variant="solid" />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label="Drobečková navigace" className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
            <a href="/" className="transition-colors hover:text-ink">Úvod</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <a href={`/nabidka/${p.deal.slug}`} className="transition-colors hover:text-ink">{p.deal.label}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{title}</span>
          </nav>

          <Reveal className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
              <div className="max-w-2xl">
                <p className="eyebrow text-bronze-deep">{p.deal.label}</p>
                <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                  {title}
                </h1>
                <p className="mt-5 text-[15.5px] leading-[1.7] text-muted">
                  {p.kind.plural} {p.deal.suffix}{p.region ? ` ${p.region.locative}` : " po celé České republice"} v
                  exkluzivním zastoupení. Každou nemovitost známe osobně — od dispozice po sousedství —
                  a ručíme za prověřenou dokumentaci i férovou cenu.
                </p>
              </div>
              {listings.length > 0 && (
                <dl className="flex gap-10">
                  <div>
                    <dt className="eyebrow text-muted">V nabídce</dt>
                    <dd className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">
                      {listings.length}
                    </dd>
                  </div>
                  {avgPrice && (
                    <div>
                      <dt className="eyebrow text-muted">Průměrná cena</dt>
                      <dd className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">
                        {(avgPrice >= 1_000_000
                          ? `${(avgPrice / 1_000_000).toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} mil.`
                          : `${Math.round(avgPrice / 1000).toLocaleString("cs-CZ")} tis.`)} Kč
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </Reveal>

          {cards.length > 0 ? (
            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((listing, i) => (
                <Reveal key={listing.id} delay={(i % 3) * 80}>
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mt-14">
              <div className="border border-line bg-stone/50 px-8 py-14 text-center">
                <p className="text-[17px] font-semibold">Aktuálně tu žádnou nemovitost nemáme</p>
                <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                  Nabídka se mění každý týden. Aktivujte si níže hlídacího psa a novou nemovitost
                  dostanete e-mailem jako první.
                </p>
              </div>
            </Reveal>
          )}

          {/* FAQ */}
          <Reveal className="mt-20">
            <p className="eyebrow text-muted">Časté dotazy</p>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronRight size={16} strokeWidth={1.8} className="shrink-0 text-bronze transition-transform duration-300 group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 max-w-3xl text-[14.5px] leading-[1.75] text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>

          {/* Hlídací pes s předvyplněnými kritérii */}
          <Reveal className="mt-16">
            <WatchdogForm deal={p.deal.value} kind={p.kind.value} />
          </Reveal>

          {/* Interní prolinkování */}
          {(sameKindLinks.length > 0 || sameRegionLinks.length > 0) && (
            <Reveal className="mt-16">
              <p className="eyebrow text-muted">Mohlo by vás zajímat</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {[...sameRegionLinks, ...sameKindLinks].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="border border-line bg-paper px-4 py-2.5 text-[13px] transition-all duration-300 hover:border-ink"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </main>
      <NewsletterSection />
      <Footer />
    </>
  );
}
