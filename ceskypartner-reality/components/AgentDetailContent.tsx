import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Mail, Phone } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { getAgentWithListings } from "@/lib/queries";
import { dbToCardListing } from "@/lib/mappers";
import { absoluteUrl, breadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import { toEnglishListing } from "@/data/listings-en";
import type { SiteLocale } from "@/lib/locale";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop";

export default async function AgentDetailContent({ id, locale = "cs" }: { id: string; locale?: SiteLocale }) {
  const data = await getAgentWithListings(id).catch(() => null);
  if (!data) notFound();

  const en = locale === "en";
  const { agent, listings } = data;
  const cards = listings.map(dbToCardListing).map((listing) => en ? toEnglishListing(listing) : listing);
  const basePath = en ? "/en/agents" : "/makleri";
  const homePath = en ? "/en" : "/";
  const bio = en
    ? "A member of the Český Partner team, providing considered, discreet representation to Czech and international clients."
    : agent.bio;

  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: agent.name,
          email: agent.email,
          telephone: agent.phone || undefined,
          image: agent.avatar || undefined,
          url: absoluteUrl(`${basePath}/${agent.id}`),
          worksFor: { "@type": "RealEstateAgent", name: "Český Partner", url: en ? `${SITE_URL}/en` : SITE_URL },
        },
        breadcrumbJsonLd([
          { name: en ? "Home" : "Úvod", path: homePath },
          { name: en ? "Our agents" : "Makléři", path: basePath },
          { name: agent.name, path: `${basePath}/${agent.id}` },
        ]),
      ]} />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <a href={homePath} className="transition-colors hover:text-ink">{en ? "Home" : "Úvod"}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <a href={basePath} className="transition-colors hover:text-ink">{en ? "Our agents" : "Makléři"}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{agent.name}</span>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-20">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                <Image src={agent.avatar || FALLBACK_AVATAR} alt={agent.name} fill priority sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <p className="eyebrow text-bronze-deep">{en ? "Real estate agent" : "Realitní makléř"}</p>
              <h1 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]">{agent.name}</h1>
              <dl className="mt-6 flex gap-10">
                <div>
                  <dt className="eyebrow text-muted">{en ? "Active listings" : "V nabídce"}</dt>
                  <dd className="mt-1.5 text-[24px] font-semibold tracking-[-0.01em] text-bronze-deep">{agent.activeCount}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-muted">{en ? "Completed" : "Dokončeno"}</dt>
                  <dd className="mt-1.5 text-[24px] font-semibold tracking-[-0.01em] text-bronze-deep">{agent.soldCount}</dd>
                </div>
              </dl>
              {bio && <p className="mt-6 max-w-2xl text-[15.5px] leading-[1.75] text-ink/85">{bio}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                {agent.phone && (
                  <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 bg-ink px-7 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep">
                    <Phone size={14} strokeWidth={1.8} />{agent.phone}
                  </a>
                )}
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2.5 border border-ink px-7 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper">
                  <Mail size={14} strokeWidth={1.8} />{en ? "Send an email" : "Napsat e-mail"}
                </a>
              </div>
            </Reveal>
          </div>

          {cards.length > 0 && (
            <Reveal className="mt-20">
              <p className="eyebrow text-muted">{en ? "Current listings from this agent" : "Aktuální nabídka makléře"}</p>
              <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((listing) => <ListingCard key={listing.id} listing={listing} locale={locale} />)}
              </div>
            </Reveal>
          )}
        </div>
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
