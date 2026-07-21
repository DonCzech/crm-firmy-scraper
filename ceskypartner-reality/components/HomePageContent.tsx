import AboutStatement from "@/components/AboutStatement";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import JsonLd from "@/components/JsonLd";
import ListingSection from "@/components/ListingSection";
import NewsletterSection from "@/components/NewsletterSection";
import NewsSectionServer from "@/components/NewsSectionServer";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { getActiveListings, getFeaturedListings, getPublishedBlogPosts, getListingCount, getPublishedTestimonials } from "@/lib/queries";
import { dbToCardListing } from "@/lib/mappers";
import { INVESTICE, PRODEJ, PRONAJEM, VYBRANE } from "@/data/listings";
import { toEnglishListing } from "@/data/listings-en";
import { SITE_URL } from "@/lib/seo";
import type { SiteLocale } from "@/lib/locale";

export default async function HomePageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const [dbFeatured, dbSale, dbRent, dbInvest, blogPosts, counts, testimonials] = await Promise.all([
    getFeaturedListings(8).catch(() => []),
    getActiveListings("SALE", 10).catch(() => []),
    getActiveListings("RENT", 8).catch(() => []),
    getActiveListings("INVESTMENT", 6).catch(() => []),
    getPublishedBlogPosts(5).catch(() => []),
    getListingCount().catch(() => ({ sale: 0, rent: 0, investment: 0 })),
    getPublishedTestimonials().catch(() => []),
  ]);
  const hasDbData = counts.sale + counts.rent + counts.investment > 0;
  const localize = (items: ReturnType<typeof dbToCardListing>[]) => en ? items.map(toEnglishListing) : items;
  const featured = localize(hasDbData ? (dbFeatured.length > 0 ? dbFeatured : dbSale).map(dbToCardListing) : VYBRANE);
  const sale = localize(hasDbData ? dbSale.map(dbToCardListing) : PRODEJ);
  const rent = localize(hasDbData ? dbRent.map(dbToCardListing) : PRONAJEM);
  const invest = localize(hasDbData ? dbInvest.map(dbToCardListing) : INVESTICE);

  return (
    <>
      {en && <JsonLd data={{
        "@context": "https://schema.org", "@type": "RealEstateAgent", name: "Český Partner Real Estate",
        url: `${SITE_URL}/en`, email: "info@ceskypartner.cz", telephone: "+420 224 000 111",
        knowsLanguage: ["English", "Czech"], areaServed: { "@type": "Country", name: "Czech Republic" },
      }} />}
      <Header locale={locale} />
      <Hero locale={locale} />

      <ListingSection
        id={en ? "selected" : "vybrane"}
        eyebrow={en ? "This week’s edit" : "Výběr týdne"}
        title={en ? "Selected properties" : "Vybrané nemovitosti"}
        ctaLabel={en ? "View the full collection" : "Zobrazit vše"}
        ctaHref={en ? "/en/properties/for-sale" : "/nabidka/prodej"}
        listings={featured}
        locale={locale}
      />
      {sale.length > 0 && <ListingSection
        id={en ? "for-sale" : "prodej"}
        eyebrow={en ? "For sale" : "Prodej"}
        title={en ? "Homes to make your own" : "Nemovitosti na prodej"}
        ctaLabel={en ? "Explore all properties for sale" : "Celá nabídka prodeje"}
        ctaHref={en ? "/en/properties/for-sale" : "/nabidka/prodej"}
        listings={sale}
        tone="stone"
        locale={locale}
      />}
      {rent.length > 0 && <ListingSection
        id={en ? "to-let" : "pronajem"}
        eyebrow={en ? "To let" : "Pronájem"}
        title={en ? "Exceptional homes to rent" : "Nemovitosti k pronájmu"}
        ctaLabel={en ? "Explore all rental properties" : "Celá nabídka pronájmů"}
        ctaHref={en ? "/en/properties/to-let" : "/nabidka/pronajem"}
        listings={rent}
        locale={locale}
      />}
      <AboutStatement locale={locale} />
      {invest.length > 0 && <ListingSection
        id={en ? "investment" : "investicni"}
        eyebrow={en ? "Investment" : "Investice"}
        title={en ? "Property with purpose" : "Investiční nemovitosti"}
        perex={en
          ? "Income-producing buildings, commercial assets and development opportunities selected for their long-term fundamentals."
          : "Činžovní domy, komerční objekty a developerské projekty s prověřeným výnosem."}
        ctaLabel={en ? "Explore investment opportunities" : "Investiční příležitosti"}
        ctaHref={en ? "/en/properties/investment" : "/nabidka/investicni"}
        listings={invest}
        tone="stone"
        locale={locale}
      />}
      <NewsSectionServer posts={blogPosts} locale={locale} />
      <ServicesSection locale={locale} />
      <TestimonialsSection items={en ? undefined : testimonials} locale={locale} />
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
