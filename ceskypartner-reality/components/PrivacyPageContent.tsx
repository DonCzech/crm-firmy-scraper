import { ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { SiteLocale } from "@/lib/locale";

const COPY = {
  cs: {
    home: "Úvod",
    breadcrumb: "Ochrana osobních údajů",
    eyebrow: "Právní informace",
    title: "Zásady zpracování osobních údajů",
    effective: "Účinné od 1. 7. 2026",
    path: "/ochrana-osobnich-udaju",
    sections: [
      ["1. Správce osobních údajů", [
        "Správcem osobních údajů je společnost Český Partner s.r.o., se sídlem Václavské náměstí 1, 110 00 Praha 1 (dále jen „správce“). V záležitostech ochrany osobních údajů nás můžete kontaktovat na e-mailu info@ceskypartner.cz nebo telefonicky na +420 224 000 111.",
      ]],
      ["2. Jaké údaje zpracováváme a proč", [
        "Poptávkové formuláře (zájem o nemovitost, žádost o financování, odhad ceny): jméno, e-mail, telefon a obsah zprávy. Právním základem je provedení opatření před uzavřením smlouvy (čl. 6 odst. 1 písm. b) GDPR). Údaje uchováváme po dobu 3 let od poslední komunikace.",
        "Hlídací pes (zasílání nabídek dle kritérií): jméno, e-mail, telefon a parametry hledané nemovitosti. Právním základem je váš souhlas, který můžete kdykoli odvolat. Údaje uchováváme do odvolání souhlasu, nejdéle 3 roky.",
        "Newsletter: e-mailová adresa. Právním základem je váš souhlas; odhlásit se můžete kdykoli odpovědí na kterýkoli e-mail.",
        "Provozní údaje webu: web používá analytiku bez cookies (Plausible), která neukládá osobní údaje ani nesleduje návštěvníky napříč weby.",
      ]],
      ["3. Komu údaje předáváme", [
        "Údaje zpracováváme interně. V nezbytném rozsahu je předáváme poskytovatelům technické infrastruktury (hosting, e-mailové služby) a v případě žádosti o financování hypotečnímu specialistovi, se kterým spolupracujeme. Údaje nepředáváme do třetích zemí mimo EU/EHP.",
      ]],
      ["4. Vaše práva", [
        "Máte právo na přístup ke svým údajům, jejich opravu či výmaz, omezení zpracování, přenositelnost, vznesení námitky a právo odvolat souhlas. Můžete také podat stížnost u Úřadu pro ochranu osobních údajů (uoou.gov.cz).",
        "Pro uplatnění práv nás kontaktujte na info@ceskypartner.cz — odpovíme nejpozději do 30 dnů.",
      ]],
      ["5. Zabezpečení", [
        "Osobní údaje jsou uloženy v zabezpečené databázi s řízeným přístupem. Přenos dat probíhá šifrovaně (HTTPS). Přístup k údajům mají pouze pověření pracovníci správce.",
      ]],
    ],
  },
  en: {
    home: "Home",
    breadcrumb: "Privacy policy",
    eyebrow: "Legal information",
    title: "Personal data processing policy",
    effective: "Effective from 1 July 2026",
    path: "/en/privacy",
    sections: [
      ["1. Data controller", [
        "The controller of your personal data is Český Partner s.r.o., with its registered office at Václavské náměstí 1, 110 00 Prague 1, Czech Republic (the “Controller”). For privacy matters, contact us at info@ceskypartner.cz or on +420 224 000 111.",
      ]],
      ["2. What information we process and why", [
        "Enquiry forms (property enquiries, financing requests and valuations): your name, email address, telephone number and the content of your message. The legal basis is taking steps at your request before entering into a contract under Article 6(1)(b) GDPR. We retain this information for three years after our last communication.",
        "Property alerts (sending listings that match your criteria): your name, email address, telephone number and search preferences. Processing is based on your consent, which you may withdraw at any time. We retain the information until consent is withdrawn, for no longer than three years.",
        "Newsletter: your email address. Processing is based on your consent; you may unsubscribe at any time by replying to any newsletter email.",
        "Website operational data: this website uses cookie-free Plausible analytics, which does not store personal data or track visitors across websites.",
      ]],
      ["3. Who receives your information", [
        "We process information internally. Where necessary, we share it with providers of technical infrastructure, including hosting and email services, and with our mortgage specialist when you request financing assistance. We do not transfer personal data to countries outside the EU or EEA.",
      ]],
      ["4. Your rights", [
        "You have the right to access, correct or erase your personal data, restrict its processing, receive it in a portable format, object to certain processing and withdraw consent. You may also lodge a complaint with the Czech Office for Personal Data Protection (uoou.gov.cz).",
        "To exercise your rights, email info@ceskypartner.cz. We will respond within 30 days.",
      ]],
      ["5. Security", [
        "Personal data is held in a secured database with controlled access. Data is encrypted in transit using HTTPS, and access is limited to authorised members of the Controller’s team.",
      ]],
    ],
  },
} as const;

export default function PrivacyPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const copy = COPY[locale];
  const en = locale === "en";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: copy.home, path: en ? "/en" : "/" },
        { name: copy.breadcrumb, path: copy.path },
      ])} />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-10">
          <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <a href={en ? "/en" : "/"} className="transition-colors hover:text-ink">{copy.home}</a>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{copy.breadcrumb}</span>
          </nav>

          <Reveal className="mt-10">
            <p className="eyebrow text-bronze-deep">{copy.eyebrow}</p>
            <h1 className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em]">{copy.title}</h1>
            <p className="mt-4 text-[13.5px] text-muted">{copy.effective}</p>
          </Reveal>

          <div className="mt-12 space-y-10">
            {copy.sections.map(([title, paragraphs]) => (
              <Reveal key={title}>
                <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
                <div className="mt-4 space-y-3">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-[14.5px] leading-[1.75] text-ink/80">{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
