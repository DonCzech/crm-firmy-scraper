import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import WeberoCredit from "./WeberoCredit";
import type { SiteLocale } from "@/lib/locale";

const FOOTER_COLS_CS = [
  {
    title: "Nabídka",
    links: [
      { label: "Prodej", href: "/nabidka/prodej" },
      { label: "Pronájem", href: "/nabidka/pronajem" },
      { label: "Investiční nemovitosti", href: "/nabidka/investicni" },
      { label: "Prodané nemovitosti", href: "/prodano" },
      { label: "Odhad ceny zdarma", href: "/odhad-nemovitosti" },
    ],
  },
  {
    title: "Společnost",
    links: [
      { label: "O nás", href: "/o-nas" },
      { label: "Naši makléři", href: "/makleri" },
      { label: "Služby", href: "/sluzby" },
      { label: "Blog", href: "/blog" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "For international clients", href: "/en" },
    ],
  },
];
const FOOTER_COLS_EN = [
  {
    title: "Property",
    links: [
      { label: "For sale", href: "/en/properties/for-sale" },
      { label: "To let", href: "/en/properties/to-let" },
      { label: "Investment property", href: "/en/properties/investment" },
      { label: "Recently sold", href: "/en/sold" },
      { label: "Complimentary valuation", href: "/en/valuation" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/en/about" },
      { label: "Our agents", href: "/en/agents" },
      { label: "Services", href: "/en/services" },
      { label: "Journal", href: "/en/journal" },
      { label: "Contact", href: "/en/contact" },
      { label: "Czech version", href: "/" },
    ],
  },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Linkedin, label: "LinkedIn" },
];

export default function Footer({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const footerCols = en ? FOOTER_COLS_EN : FOOTER_COLS_CS;
  return (
    <footer id={en ? "contact" : "kontakt"} className="bg-ink text-paper/60">
      <div className="mx-auto max-w-site px-6 pb-10 pt-20 xl:px-10">
        <div className="text-paper">
          <Logo locale={locale} />
        </div>

        <div className="mt-14 grid gap-12 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-paper/40">{col.title}</h3>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] transition-colors duration-300 hover:text-bronze"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="eyebrow text-paper/40">{en ? "Contact" : "Kontakt"}</h3>
            <ul className="mt-6 space-y-3.5 text-[14px]">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-bronze" />
                Václavské náměstí 1, 110 00 {en ? "Prague 1" : "Praha 1"}
              </li>
              <li>
                <a href="tel:+420224000111" className="flex items-center gap-2.5 transition-colors duration-300 hover:text-bronze">
                  <Phone size={15} strokeWidth={1.5} className="shrink-0 text-bronze" />
                  +420 224 000 111
                </a>
              </li>
              <li>
                <a href="mailto:info@ceskypartner.cz" className="flex items-center gap-2.5 transition-colors duration-300 hover:text-bronze">
                  <Mail size={15} strokeWidth={1.5} className="shrink-0 text-bronze" />
                  info@ceskypartner.cz
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-paper/40">{en ? "Follow us" : "Sledujte nás"}</h3>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition-all duration-300 hover:border-bronze hover:text-bronze"
                >
                  <social.icon size={17} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-[12.5px] text-paper/40 sm:flex-row sm:items-center">
          <p>© 2026 Český Partner s.r.o. {en ? "All rights reserved." : "Všechna práva vyhrazena."}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href={en ? "/en/privacy" : "/ochrana-osobnich-udaju"} className="transition-colors duration-300 hover:text-paper">
              {en ? "Privacy policy" : "Ochrana osobních údajů"}
            </a>
            <WeberoCredit locale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}
