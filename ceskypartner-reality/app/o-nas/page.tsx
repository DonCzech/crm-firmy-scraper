import type { Metadata } from "next";
import {
  ArrowUpRight,
  Award,
  ChevronRight,
  Heart,
  Landmark,
  Mail,
  Phone,
  Shield,
  Target,
  Users,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import AboutStats from "@/components/AboutStats";

export const metadata: Metadata = {
  title: "O nás",
  description:
    "Poznejte tým Českého Partnera. 15 let zkušeností na českém realitním trhu, osobní přístup a 1 200+ úspěšných obchodů.",
  alternates: { canonical: "/o-nas" },
};

const VALUES = [
  {
    icon: Heart,
    title: "Osobni pristup",
    text: "Kazdy klient je pro nas jedinecny. Naslouchame, radime a hledame reseni sita na miru.",
  },
  {
    icon: Shield,
    title: "Duvera a transparentnost",
    text: "Otevřeně komunikujeme o cenách, podmínkách i rizicích. Bez skrytých poplatků, bez nátlaku.",
  },
  {
    icon: Target,
    title: "Orientace na vysledek",
    text: "Nas uspech merime vasim spokojenym usmevem a uspesne dokoncenymi obchody.",
  },
  {
    icon: Award,
    title: "Profesionalita",
    text: "Neustale se vzdelavame, sledujeme trendy a investujeme do modernich nastroju a technologii.",
  },
];

const TEAM = [
  {
    name: "Ing. Martin Novak",
    role: "Jednatel & hlavni makler",
    bio: "20 let v realitach. Specialist na premiovie nemovitosti v Praze 1-6 a investicni projekty.",
    phone: "+420 602 111 222",
    email: "novak@ceskypartner.cz",
  },
  {
    name: "Mgr. Katerina Svobodova",
    role: "Pravni oddeleni",
    bio: "Advokátka se specializací na realitní právo, smluvní dokumentaci a katastralní úkony.",
    phone: "+420 602 333 444",
    email: "svobodova@ceskypartner.cz",
  },
  {
    name: "Bc. Tomas Dvorak",
    role: "Makler — Rezidencni nemovitosti",
    bio: "Specialista na byty a domy v Praze a okolí. Osobní přístup ke každému klientovi.",
    phone: "+420 602 555 666",
    email: "dvorak@ceskypartner.cz",
  },
  {
    name: "Ing. Petra Horakova",
    role: "Financni poradkyne",
    bio: "Certifikovaná hypoteční specialistka. Porovná nabídky bank a najde nejlepší podmínky.",
    phone: "+420 602 777 888",
    email: "horakova@ceskypartner.cz",
  },
];

const MILESTONES = [
  { year: "2011", text: "Založení společnosti Český Partner s.r.o. v centru Prahy" },
  { year: "2014", text: "Rozšíření o oddělení správy nemovitostí a pronájmu" },
  { year: "2017", text: "500. úspěšně prodaná nemovitost, rozšíření týmu na 8 makléřů" },
  { year: "2020", text: "Spuštění online platformy, virtuální prohlídky, 3D prezentace" },
  { year: "2023", text: "1 000+ dokončených obchodů, ocenění za nejlepší klientský servis" },
  { year: "2026", text: "Nová digitální platforma, investiční divize, expanze do regionů" },
];

export default function AboutPage() {
  return (
    <>
      <Header variant="solid" />

      <main className="pt-16">
        {/* Hero */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 pb-0 pt-10 xl:px-10">
            <nav
              aria-label="Drobeckova navigace"
              className="flex items-center gap-2 text-[12.5px] text-muted"
            >
              <a href="/" className="transition-colors hover:text-ink">
                Uvod
              </a>
              <ChevronRight size={13} strokeWidth={1.5} />
              <span className="text-ink">O nas</span>
            </nav>

            <Reveal className="mt-10 pb-20">
              <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
                <div>
                  <p className="eyebrow text-bronze-deep">O nas</p>
                  <h1 className="mt-4 text-[clamp(2.2rem,4.2vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em]">
                    Nemovitost je vic nez adresa —
                    <span className="text-bronze">
                      {" "}
                      je to rozhodnuti na cely zivot.
                    </span>
                  </h1>
                </div>
                <p className="max-w-md text-[15.5px] leading-[1.75] text-muted lg:pb-2">
                  Od prvniho odhadu po predani klicu. Spojujeme detailni znalost
                  ceskeho trhu s diskretnim, osobnim pristupem — at prodavate
                  rodinny dum, hledate novy domov, nebo stavite investicni
                  portfolio.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-site px-6 py-20 md:py-24 xl:px-10">
            <AboutStats />
          </div>
        </section>

        {/* Values */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <Reveal>
              <p className="eyebrow text-muted">Nase hodnoty</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Na cem stavime
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="group flex h-full flex-col border border-line p-9 transition-all duration-500 ease-luxe hover:border-bronze/40">
                    <div className="flex h-12 w-12 items-center justify-center border border-line transition-colors duration-300 group-hover:border-bronze group-hover:bg-bronze/5">
                      <v.icon size={22} strokeWidth={1.2} className="text-bronze-deep" />
                    </div>
                    <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.01em]">
                      {v.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[14px] leading-[1.7] text-muted">
                      {v.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="border-t border-line bg-stone/40">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <Reveal>
              <p className="eyebrow text-bronze-deep">Nase cesta</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Milniky, ktere nas formovaly
              </h2>
            </Reveal>

            <div className="mt-14">
              <div className="relative border-l border-bronze/30 pl-10 md:pl-14">
                {MILESTONES.map((m, i) => (
                  <Reveal key={m.year} delay={i * 60}>
                    <div className="relative pb-12 last:pb-0">
                      <div className="absolute -left-10 top-0.5 flex h-5 w-5 items-center justify-center md:-left-14">
                        <span className="h-2.5 w-2.5 rounded-full bg-bronze" />
                      </div>
                      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-bronze-deep">
                        {m.year}
                      </span>
                      <p className="mt-2 max-w-lg text-[15px] leading-[1.65] text-muted">
                        {m.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-paper">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <Reveal>
              <p className="eyebrow text-muted">Nas tym</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Lide, kteri stoji za vasim obchodem
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((t, i) => (
                <Reveal key={t.name} delay={i * 80}>
                  <div className="group border border-line transition-all duration-500 ease-luxe hover:border-bronze/40">
                    <div className="flex aspect-[3/4] items-end justify-center bg-stone/60 px-6 pb-6">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-bronze/30 bg-paper text-[28px] font-semibold text-bronze-deep">
                        {t.name
                          .replace(/^(Ing\.|Mgr\.|Bc\.)\s*/, "")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </div>
                    </div>
                    <div className="p-7">
                      <h3 className="text-[16px] font-semibold">{t.name}</h3>
                      <p className="mt-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-bronze-deep">
                        {t.role}
                      </p>
                      <p className="mt-3 text-[13.5px] leading-[1.65] text-muted">
                        {t.bio}
                      </p>
                      <div className="mt-5 flex gap-3">
                        <a
                          href={`tel:${t.phone.replace(/\s/g, "")}`}
                          className="flex h-9 w-9 items-center justify-center border border-line text-muted transition-colors duration-300 hover:border-bronze hover:text-bronze"
                          aria-label={`Zavolat ${t.name}`}
                        >
                          <Phone size={14} strokeWidth={1.5} />
                        </a>
                        <a
                          href={`mailto:${t.email}`}
                          className="flex h-9 w-9 items-center justify-center border border-line text-muted transition-colors duration-300 hover:border-bronze hover:text-bronze"
                          aria-label={`E-mail ${t.name}`}
                        >
                          <Mail size={14} strokeWidth={1.5} />
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Partners & trust */}
        <section className="bg-ink text-paper">
          <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
              <Reveal>
                <p className="eyebrow text-paper/50">Spoluprace</p>
                <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                  Pracujeme s temi nejlepsimi
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-[1.75] text-paper/60">
                  Spolupracujeme s proverenimy advokáty, bankami, znalci a
                  developery. Nase sít partneru zajistuje, ze kazdy obchod
                  probehne hladce a bezpecne.
                </p>
              </Reveal>

              <Reveal delay={100}>
                <div className="grid grid-cols-2 gap-px bg-white/10">
                  {[
                    { icon: Landmark, label: "Advokátní kanceláře" },
                    { icon: Users, label: "Hypoteční specialisté" },
                    { icon: Shield, label: "Pojištění nemovitostí" },
                    { icon: Award, label: "Certifikovaní odhadci" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="flex flex-col items-center gap-4 bg-ink px-6 py-10 text-center"
                    >
                      <p.icon
                        size={28}
                        strokeWidth={1.2}
                        className="text-bronze"
                      />
                      <span className="text-[13px] font-semibold tracking-[0.02em] text-paper/70">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-line bg-paper">
          <div className="mx-auto max-w-site px-6 py-24 text-center md:py-32 xl:px-10">
            <Reveal>
              <p className="eyebrow text-bronze-deep">Dalsi krok</p>
              <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Chcete se s nami setkat?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.75] text-muted">
                Stavte se k nam do kancelare na kavu, zavolejte nebo napiste.
                Prvni konzultace je vzdy zdarma.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="/kontakt"
                  className="group inline-flex h-14 items-center gap-2 bg-ink px-10 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep"
                >
                  Kontaktujte nas
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.8}
                    className="text-bronze transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
                <a
                  href="/sluzby"
                  className="inline-flex h-14 items-center border border-line px-10 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  Nase sluzby
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <NewsletterSection />
      <Footer />
    </>
  );
}
