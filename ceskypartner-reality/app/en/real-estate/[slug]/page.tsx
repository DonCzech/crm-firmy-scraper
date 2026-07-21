import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import ListingCard from "@/components/ListingCard";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import WatchdogForm from "@/components/WatchdogForm";
import { toEnglishListing } from "@/data/listings-en";
import { searchListings } from "@/lib/queries";
import { dbToCardListing } from "@/lib/mappers";
import { absoluteUrl, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { allEnglishLocalPages, getEnglishLocalPage } from "@/lib/localSeoEn";

export const revalidate = 300;
export const dynamicParams = false;
type Props = { params: { slug: string } };

export function generateStaticParams() {
  return allEnglishLocalPages().map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getEnglishLocalPage(params.slug);
  if (!page) return {};
  const enPath = `/en/real-estate/${page.slug}`;
  const csPath = `/nemovitosti/${page.czechSlug}`;
  const description = `${page.title} represented exclusively by Český Partner. Verified documentation, English-speaking agents and complete legal support.`;
  return {
    title: page.title,
    description,
    alternates: {
      canonical: enPath,
      languages: { "en-GB": enPath, "cs-CZ": csPath, "x-default": csPath },
    },
    openGraph: { title: page.title, description, locale: "en_GB", alternateLocale: ["cs_CZ"] },
  };
}

export default async function EnglishLocalSeoPage({ params }: Props) {
  const page = getEnglishLocalPage(params.slug);
  if (!page) notFound();

  const source = page.source;
  const rows = await searchListings({
    deal: source.deal.value,
    kind: source.kind.value,
    ...(source.region ? { regions: [source.region.value] } : {}),
  }).catch(() => []);
  const listings = rows.map(dbToCardListing).map(toEnglishListing);
  const prices = rows.map((listing) => listing.price).filter((price) => price > 0);
  const averagePrice = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null;
  const categoryPath = source.deal.value === "SALE" ? "/en/properties/for-sale" : "/en/properties/to-let";
  const faq = [
    {
      q: `How do I buy or rent ${page.kind.singular === "property" ? "a property" : `a ${page.kind.singular}`} in ${page.region?.label ?? "the Czech Republic"}?`,
      a: "We begin with a clear brief and arrange viewings with an agent who knows the property personally. Our team then coordinates negotiation, legal review, solicitor escrow where relevant, documentation and handover entirely in English.",
    },
    {
      q: "Can international clients complete remotely?",
      a: "Yes. Depending on the transaction, video viewings, electronic signatures and a power of attorney can allow much of the process to be completed without repeated travel to the Czech Republic.",
    },
    {
      q: "What does exclusive representation mean?",
      a: "Each property is represented by one agency at one consistent price. Documentation is verified centrally and your agent has direct knowledge of the property, owner and transaction.",
    },
  ];
  const enPath = `/en/real-estate/${page.slug}`;
  const relatedPages = allEnglishLocalPages()
    .filter((candidate) => candidate.slug !== page.slug && (
      (candidate.source.kind.value === source.kind.value && candidate.source.deal.value === source.deal.value) ||
      (candidate.source.region?.value === source.region?.value && candidate.source.deal.value === source.deal.value)
    ))
    .slice(0, 12);

  return (
    <>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: "Home", path: "/en" }, { name: source.deal.value === "SALE" ? "For sale" : "To let", path: categoryPath }, { name: page.title, path: enPath }]),
        itemListJsonLd(listings.map((listing) => ({ name: listing.title, path: `/en/property/${listing.id}` }))),
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
        { "@context": "https://schema.org", "@type": "CollectionPage", name: page.title, url: absoluteUrl(enPath), inLanguage: "en-GB" },
      ]} />
      <Header variant="solid" locale="en" />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted"><a href="/en">Home</a><ChevronRight size={13} /><a href={categoryPath}>{source.deal.value === "SALE" ? "For sale" : "To let"}</a><ChevronRight size={13} /><span className="text-ink">{page.title}</span></nav>
          <Reveal className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
              <div className="max-w-2xl">
                <p className="eyebrow text-bronze-deep">{source.deal.value === "SALE" ? "For sale" : "To let"}</p>
                <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">{page.title}</h1>
                <p className="mt-5 text-[15.5px] leading-[1.75] text-muted">Carefully selected {page.kind.plural.toLowerCase()} {page.action}{page.region ? ` in ${page.region.label}` : " across the Czech Republic"}, represented exclusively. Every instruction combines verified documentation, local knowledge and complete English-language support.</p>
              </div>
              {listings.length > 0 && (
                <dl className="flex gap-10">
                  <div>
                    <dt className="eyebrow text-muted">Available</dt>
                    <dd className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">{listings.length}</dd>
                  </div>
                  {averagePrice && (
                    <div>
                      <dt className="eyebrow text-muted">Average price</dt>
                      <dd className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">
                        {averagePrice >= 1_000_000
                          ? `CZK ${(averagePrice / 1_000_000).toLocaleString("en-GB", { maximumFractionDigits: 1 })}m`
                          : `CZK ${Math.round(averagePrice / 1000).toLocaleString("en-GB")}k`}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </Reveal>
          {listings.length ? (
            <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing, index) => <Reveal key={listing.id} delay={(index % 3) * 80}><ListingCard listing={listing} locale="en" /></Reveal>)}</div>
          ) : (
            <Reveal className="mt-14">
              <div className="border border-line bg-stone/50 px-8 py-14 text-center"><p className="font-semibold">No matching properties are publicly available at present.</p><p className="mt-2 text-[14px] text-muted">Register your requirements below to hear about suitable opportunities, including discreet off-market instructions.</p></div>
            </Reveal>
          )}
          <Reveal className="mt-20"><p className="eyebrow text-muted">Frequently asked questions</p><div className="mt-6 divide-y divide-line border-y border-line">{faq.map((item) => <details key={item.q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold">{item.q}<ChevronRight size={16} className="text-bronze transition-transform group-open:rotate-90" /></summary><p className="mt-3 max-w-3xl text-[14.5px] leading-[1.75] text-muted">{item.a}</p></details>)}</div></Reveal>
          <Reveal className="mt-16"><WatchdogForm deal={source.deal.value} kind={source.kind.value} locale="en" /></Reveal>
          {relatedPages.length > 0 && (
            <Reveal className="mt-16">
              <p className="eyebrow text-muted">You may also be interested in</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {relatedPages.map((related) => (
                  <a key={related.slug} href={`/en/real-estate/${related.slug}`} className="border border-line bg-paper px-4 py-2.5 text-[13px] transition-all duration-300 hover:border-ink">
                    {related.title}
                  </a>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </main>
      <NewsletterSection locale="en" />
      <Footer locale="en" />
    </>
  );
}
