import Image from "next/image";
import { ArrowUpRight, ChevronRight, Mail, Phone } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { getPublicAgents } from "@/lib/queries";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { SiteLocale } from "@/lib/locale";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80&auto=format&fit=crop";

const COPY = {
  cs: {
    home: "Úvod", breadcrumb: "Makléři", eyebrow: "Náš tým",
    title: "Makléři, kteří znají každou nemovitost osobně",
    description: "Pracujeme výhradně v exkluzivním zastoupení — každý makléř se věnuje jen tolika nemovitostem, kolika se dokáže věnovat naplno.",
    active: (count: number) => `${count} aktivních nabídek`,
    completed: (count: number) => `${count} úspěšně dokončených`,
    emptyTitle: "Profily makléřů doplňujeme",
    emptyText: "Kontaktujte nás zatím na info@ceskypartner.cz.",
  },
  en: {
    home: "Home", breadcrumb: "Our agents", eyebrow: "Our team",
    title: "Agents who know every property personally",
    description: "We work exclusively and deliberately limit each agent’s portfolio, creating the time and accountability required for exceptional representation.",
    active: (count: number) => `${count} active ${count === 1 ? "listing" : "listings"}`,
    completed: (count: number) => `${count} completed`,
    emptyTitle: "Agent profiles are being prepared",
    emptyText: "In the meantime, contact us at info@ceskypartner.cz.",
  },
};

export default async function AgentsPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const agents = await getPublicAgents().catch(() => []);
  const en = locale === "en";
  const copy = COPY[locale];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: copy.home, path: en ? "/en" : "/" },
        { name: copy.breadcrumb, path: en ? "/en/agents" : "/makleri" },
      ])} />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">{copy.home}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{copy.breadcrumb}</span>
          </nav>

          <Reveal className="mt-10">
            <div className="max-w-2xl">
              <p className="eyebrow text-bronze-deep">{copy.eyebrow}</p>
              <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">{copy.title}</h1>
              <p className="mt-5 text-[15.5px] leading-[1.7] text-muted">{copy.description}</p>
            </div>
          </Reveal>

          {agents.length > 0 ? (
            <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, i) => (
                <Reveal key={agent.id} delay={(i % 3) * 80}>
                  <a href={en ? `/en/agents/${agent.id}` : `/makleri/${agent.id}`} className="group block" aria-label={agent.name}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                      <Image
                        src={agent.avatar || FALLBACK_AVATAR}
                        alt={agent.name}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-[800ms] ease-luxe group-hover:scale-[1.03]"
                      />
                      <span className="absolute bottom-5 right-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-paper text-ink opacity-0 transition-all duration-[400ms] ease-luxe group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight size={17} strokeWidth={1.5} />
                      </span>
                    </div>
                    <div className="pt-5">
                      <h2 className="text-[19px] font-semibold tracking-[-0.01em]"><span className="card-title">{agent.name}</span></h2>
                      <p className="mt-1.5 text-[13px] text-muted">
                        {copy.active(agent.activeCount)}
                        {agent.soldCount > 0 ? ` · ${copy.completed(agent.soldCount)}` : ""}
                      </p>
                      <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13.5px] text-muted">
                        {agent.phone && <p className="flex items-center gap-2"><Phone size={13} strokeWidth={1.5} className="text-bronze" />{agent.phone}</p>}
                        <p className="flex items-center gap-2"><Mail size={13} strokeWidth={1.5} className="text-bronze" />{agent.email}</p>
                      </div>
                    </div>
                  </a>
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
        </div>
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
