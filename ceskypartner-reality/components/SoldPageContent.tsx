import { ArrowUpRight, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { getClosedListings, getPublishedTestimonials } from "@/lib/queries";
import { dbToCardListing } from "@/lib/mappers";
import { breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import TestimonialsSection from "@/components/TestimonialsSection";
import { toEnglishListing } from "@/data/listings-en";
import type { SiteLocale } from "@/lib/locale";

const COPY = {
  cs: {
    home: "Úvod",
    breadcrumb: "Prodané nemovitosti",
    eyebrow: "Naše výsledky",
    title: "Úspěšně prodáno a pronajato",
    description:
      "Každá z těchto nemovitostí našla nového majitele nebo nájemce v našem exkluzivním zastoupení. Přesvědčte se, jak pracujeme — a svěřte nám i tu svoji.",
    sold: "Prodáno",
    rented: "Pronajato",
    emptyTitle: "První úspěchy tu zveřejníme už brzy",
    emptyText: "Mezitím se podívejte na aktuální nabídku.",
    ctaEyebrow: "Prodáváte nemovitost?",
    ctaTitle: "Prodáme i tu vaši — začněte odhadem ceny zdarma.",
    ctaButton: "Odhad ceny zdarma",
    ctaHref: "/odhad-nemovitosti",
    path: "/prodano",
  },
  en: {
    home: "Home",
    breadcrumb: "Sold properties",
    eyebrow: "Our track record",
    title: "Successfully sold and let",
    description:
      "Every property here found its new owner or tenant under our exclusive representation. See the standard of our work — and entrust your property to us too.",
    sold: "Sold",
    rented: "Let",
    emptyTitle: "Our latest successful completions will appear here soon",
    emptyText: "In the meantime, explore the properties currently available.",
    ctaEyebrow: "Thinking of selling?",
    ctaTitle: "Let us sell yours too — begin with a complimentary valuation.",
    ctaButton: "Request a valuation",
    ctaHref: "/en/valuation",
    path: "/en/sold",
  },
} as const;

export default async function SoldPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const copy = COPY[locale];
  const en = locale === "en";
  const [closed, testimonials] = await Promise.all([
    getClosedListings(60).catch(() => []),
    getPublishedTestimonials().catch(() => []),
  ]);
  const avgRating = testimonials.length > 0
    ? testimonials.reduce((a, t) => a + t.rating, 0) / testimonials.length
    : null;
  const cards = closed.map(dbToCardListing).map((listing) => en ? toEnglishListing(listing) : listing);
  const soldCount = closed.filter((listing) => listing.status === "SOLD").length;
  const rentedCount = closed.length - soldCount;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: copy.home, path: en ? "/en" : "/" },
            { name: copy.breadcrumb, path: copy.path },
          ]),
          ...(avgRating
            ? [{
                "@context": "https://schema.org",
                "@type": "RealEstateAgent",
                name: "Český Partner",
                url: en ? `${SITE_URL}/en` : SITE_URL,
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: Math.round(avgRating * 10) / 10,
                  reviewCount: testimonials.length,
                  bestRating: 5,
                },
              }]
            : []),
        ]}
      />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">{copy.home}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{copy.breadcrumb}</span>
          </nav>

          <Reveal className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
              <div className="max-w-2xl">
                <p className="eyebrow text-bronze-deep">{copy.eyebrow}</p>
                <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">{copy.title}</h1>
                <p className="mt-5 text-[15.5px] leading-[1.7] text-muted">{copy.description}</p>
              </div>
              {closed.length > 0 && (
                <dl className="flex gap-10">
                  <div>
                    <dt className="eyebrow text-muted">{copy.sold}</dt>
                    <dd className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">{soldCount}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-muted">{copy.rented}</dt>
                    <dd className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">{rentedCount}</dd>
                  </div>
                </dl>
              )}
            </div>
          </Reveal>

          {cards.length > 0 ? (
            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((listing, i) => (
                <Reveal key={listing.id} delay={(i % 3) * 80}>
                  <ListingCard listing={listing} locale={locale} />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="mt-14">
              <div className="border border-line bg-stone/50 px-8 py-16 text-center">
                <p className="text-[16px] font-semibold">{copy.emptyTitle}</p>
                <p className="mt-2 text-[14px] text-muted">{copy.emptyText}</p>
              </div>
            </Reveal>
          )}

          <Reveal className="mt-20">
            <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 bg-ink px-8 py-10 text-paper md:px-12">
              <div>
                <p className="eyebrow text-bronze">{copy.ctaEyebrow}</p>
                <p className="mt-3 max-w-xl text-[clamp(1.3rem,2.2vw,1.8rem)] font-semibold leading-[1.2] tracking-[-0.01em]">{copy.ctaTitle}</p>
              </div>
              <a href={copy.ctaHref} className="flex items-center gap-2.5 bg-paper px-8 py-4 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-bronze hover:text-ink">
                {copy.ctaButton}
                <ArrowUpRight size={15} strokeWidth={1.8} />
              </a>
            </div>
          </Reveal>
        </div>
      </main>
      <TestimonialsSection items={en ? undefined : testimonials} locale={locale} />
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
