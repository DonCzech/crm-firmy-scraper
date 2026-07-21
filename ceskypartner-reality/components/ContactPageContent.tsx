import type { Metadata } from "next";
import {
  ArrowUpRight,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import DetailMap from "@/components/DetailMap";
import type { SiteLocale } from "@/lib/locale";

const CONTACTS = [
  {
    icon: Phone,
    label: "Telefon",
    value: "+420 224 000 111",
    href: "tel:+420224000111",
    note: "Po-Pa 9:00-18:00",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "info@ceskypartner.cz",
    href: "mailto:info@ceskypartner.cz",
    note: "Odpovídáme do 24 hodin",
  },
  {
    icon: MapPin,
    label: "Adresa",
    value: "Václavské náměstí 42, 110 00 Praha 1",
    href: "https://www.openstreetmap.org/?mlat=50.0818&mlon=14.4253#map=17/50.0818/14.4253",
    note: "3. patro, výtah",
  },
  {
    icon: Clock,
    label: "Otevírací doba",
    value: "Po-Pá 9:00-18:00, So 10:00-14:00",
    href: null,
    note: "Neděle zavřeno",
  },
];
const CONTACTS_EN = [
  { icon: Phone, label: "Phone", value: "+420 224 000 111", href: "tel:+420224000111", note: "Monday–Friday, 9:00–18:00" },
  { icon: Mail, label: "Email", value: "info@ceskypartner.cz", href: "mailto:info@ceskypartner.cz", note: "We reply within 24 hours" },
  { icon: MapPin, label: "Address", value: "Václavské náměstí 42, 110 00 Prague 1", href: "https://www.openstreetmap.org/?mlat=50.0818&mlon=14.4253#map=17/50.0818/14.4253", note: "Third floor, lift access" },
  { icon: Clock, label: "Office hours", value: "Mon–Fri 9:00–18:00, Sat 10:00–14:00", href: null, note: "Closed on Sunday" },
];

const TEAM_CONTACTS = [
  {
    name: "Ing. Martin Novák",
    role: "Jednatel & hlavní makléř",
    spec: "Prémiové nemovitosti Praha 1-6",
    phone: "+420 602 111 222",
    email: "novak@ceskypartner.cz",
  },
  {
    name: "Bc. Tomáš Dvořák",
    role: "Makléř — Rezidence",
    spec: "Byty a domy Praha a okolí",
    phone: "+420 602 555 666",
    email: "dvorak@ceskypartner.cz",
  },
  {
    name: "Ing. Petra Horáková",
    role: "Finanční poradkyně",
    spec: "Hypotéky a financování",
    phone: "+420 602 777 888",
    email: "horakova@ceskypartner.cz",
  },
];
const TEAM_CONTACTS_EN = TEAM_CONTACTS.map((member, index) => ({
  ...member,
  role: ["Managing Director & Lead Agent", "Residential Property Agent", "Mortgage Adviser"][index],
  spec: ["Prime property in Prague 1–6", "Apartments and houses in Prague and its surroundings", "Mortgages and property financing"][index],
}));

export default function ContactPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const contacts = en ? CONTACTS_EN : CONTACTS;
  const teamContacts = en ? TEAM_CONTACTS_EN : TEAM_CONTACTS;
  return (
    <>
      <Header variant="solid" locale={locale} />

      <main className="pt-16">
        {/* Breadcrumbs + Heading */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 pt-10 xl:px-10">
            <nav
              aria-label={en ? "Breadcrumb" : "Drobečková navigace"}
              className="flex items-center gap-2 text-[12.5px] text-muted"
            >
              <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">
                {en ? "Home" : "Úvod"}
              </a>
              <ChevronRight size={13} strokeWidth={1.5} />
              <span className="text-ink">{en ? "Contact" : "Kontakt"}</span>
            </nav>

            <Reveal className="mt-10 pb-16">
              <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
                <div>
                  <p className="eyebrow text-bronze-deep">{en ? "Contact" : "Kontakt"}</p>
                  <h1 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                    {en ? "Talk to us —" : "Ozvěte se nám —"}
                    <span className="text-bronze">{en ? " considered advice starts here." : " rádi vám poradíme."}</span>
                  </h1>
                </div>
                <p className="max-w-md text-[15.5px] leading-[1.75] text-muted lg:pb-2">
                  {en ? "Whether you are looking for a home, considering a sale or need an informed valuation, our English-speaking team is ready to help. Your first consultation is complimentary." : "Ať hledáte nový domov, chcete prodat nebo zjistit hodnotu své nemovitosti — jsme tu pro vás. Konzultace je zdarma a bez závazku."}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="border-t border-line bg-stone/40">
          <div className="mx-auto max-w-site px-6 py-16 xl:px-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contacts.map((c, i) => (
                <Reveal key={c.label} delay={i * 60}>
                  <div className="flex h-full flex-col border border-line bg-paper p-7 transition-all duration-500 ease-luxe hover:border-bronze/40">
                    <div className="flex h-11 w-11 items-center justify-center border border-line">
                      <c.icon size={19} strokeWidth={1.3} className="text-bronze-deep" />
                    </div>
                    <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {c.label}
                    </p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="mt-2 text-[15px] font-semibold transition-colors duration-300 hover:text-bronze-deep"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-2 text-[15px] font-semibold">{c.value}</p>
                    )}
                    <p className="mt-1.5 text-[12.5px] text-muted">{c.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Form + Map */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <Reveal>
                <p className="eyebrow text-muted">{en ? "Write to us" : "Napište nám"}</p>
                <h2 className="mt-4 mb-8 text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
                  {en ? "Start a conversation" : "Nezávazná poptávka"}
                </h2>
                <ContactForm locale={locale} />
              </Reveal>

              <Reveal delay={100}>
                <div className="space-y-6">
                  <p className="eyebrow text-muted">{en ? "Where to find us" : "Kde nás najdete"}</p>
                  <h2 className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
                    {en ? "Our Prague office" : "Naše kancelář"}
                  </h2>
                  <p className="text-[14.5px] leading-[1.7] text-muted">
                    {en ? "We are located on Wenceslas Square in central Prague. Parking is available in nearby garages; Můstek metro station (lines A and B) is a short walk away." : "Sídlíme přímo na Václavském náměstí v centru Prahy. Parkování je dostupné v přilehlých garážích, nejbližší metro je stanice Můstek (linky A, B)."}
                  </p>

                  <div className="relative aspect-[4/3] overflow-hidden border border-line">
                    <DetailMap lat={50.0818} lng={14.4253} title={en ? "Český Partner — Prague office" : "Český Partner — kancelář"} locale={locale} />
                  </div>

                  <div className="border border-line bg-stone/30 p-7">
                    <h3 className="text-[15px] font-semibold">{en ? "Office hours" : "Otevírací doba"}</h3>
                    <dl className="mt-4 space-y-2.5 text-[14px]">
                      <div className="flex justify-between">
                        <dt className="text-muted">{en ? "Monday — Friday" : "Pondělí — Pátek"}</dt>
                        <dd className="font-medium">9:00 — 18:00</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted">{en ? "Saturday" : "Sobota"}</dt>
                        <dd className="font-medium">10:00 — 14:00</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted">{en ? "Sunday" : "Neděle"}</dt>
                        <dd className="text-muted">{en ? "Closed" : "Zavřeno"}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-[12.5px] text-muted">
                      {en ? "Appointments outside these hours can be arranged in advance." : "Osobní schůzku mimo otevírací dobu rádi domluvíme individuálně."}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Team Direct Contacts */}
        <section className="border-t border-line bg-stone/40">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <Reveal>
              <p className="eyebrow text-bronze-deep">{en ? "Direct contacts" : "Přímé kontakty"}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {en ? "Speak directly to the right specialist" : "Kontaktujte přímo vašeho specialistu"}
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {teamContacts.map((t, i) => (
                <Reveal key={t.name} delay={i * 80}>
                  <div className="group border border-line bg-paper p-8 transition-all duration-500 ease-luxe hover:border-bronze/40">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-bronze/30 bg-stone/50 text-[16px] font-semibold text-bronze-deep">
                        {t.name
                          .replace(/^(Ing\.|Mgr\.|Bc\.)\s*/, "")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold">{t.name}</h3>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-bronze-deep">
                          {t.role}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[13.5px] leading-[1.65] text-muted">
                      {t.spec}
                    </p>
                    <div className="mt-5 space-y-2">
                      <a
                        href={`tel:${t.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2.5 text-[14px] text-muted transition-colors duration-300 hover:text-bronze-deep"
                      >
                        <Phone size={14} strokeWidth={1.5} className="text-bronze" />
                        {t.phone}
                      </a>
                      <a
                        href={`mailto:${t.email}`}
                        className="flex items-center gap-2.5 text-[14px] text-muted transition-colors duration-300 hover:text-bronze-deep"
                      >
                        <Mail size={14} strokeWidth={1.5} className="text-bronze" />
                        {t.email}
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-site px-6 py-24 text-center md:py-28 xl:px-10">
            <Reveal>
              <h2 className="mx-auto max-w-2xl text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {en ? "Not sure where to begin?" : "Nejste si jistí, kam začít?"}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.75] text-paper/60">
                {en ? "Call us and we will connect you with the right specialist for your situation. No pressure and no obligation." : "Zavolejte nám — rádi vás nasměrujeme ke správnému specialistovi podle vaší situace. Žádný nátlak, žádné závazky."}
              </p>
              <a
                href="tel:+420224000111"
                className="group mt-10 inline-flex h-14 items-center gap-3 bg-bronze px-10 text-[13px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-bronze-deep hover:text-paper"
              >
                <Phone size={16} strokeWidth={1.5} />
                +420 224 000 111
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.8}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
