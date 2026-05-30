import { TemplateDefinition } from "./types";
import { placeholderImage } from "./placeholder";

const SITE_NAME = "Název podniku";
const PRIMARY = "#6d1f37";
const PRIMARY_LIGHT = "#b51144";
const ACCENT_OFFWHITE = "#f4f3ef";

const navLinks = [
  { label: "Domů", href: "/" },
  { label: "Provozovny", href: "/kavarny" },
  { label: "Nabídka", href: "/nabidka" },
  { label: "O nás", href: "/o-nas" },
  { label: "Kontakt", href: "/kontakt" },
];

const COSTA_ASSETS = "/clones/costa/src/themes/template/build";
const COSTA_LOGO = `${COSTA_ASSETS}/costa-coffee-logo.svg`;
const COSTA_HERO = `${COSTA_ASSETS}/COSTA_banner_2026_05_1600x640_06.webp`;
const COSTA_PIN = `${COSTA_ASSETS}/icon-pin.svg`;
const COSTA_USER = `${COSTA_ASSETS}/icon-user.svg`;

const navbarContent = {
  siteName: SITE_NAME,
  logoUrl: COSTA_LOGO,
  layout: "cafe-wave",
  links: navLinks,
  pinIcon: COSTA_PIN,
  userIcon: COSTA_USER,
  loginLabel: "Přihlásit",
  loginHref: "/prihlaseni",
  locationsHref: "/kavarny",
};

const footerContent = {
  siteName: SITE_NAME,
  layout: "6col",
  columns: [
    {
      title: "Sloupec 1",
      links: [
        { label: "Položka 1", href: "/nabidka" },
        { label: "Položka 2", href: "/kavarny" },
        { label: "Položka 3", href: "/o-nas" },
      ],
    },
    {
      title: "Sloupec 2",
      links: [
        { label: "Položka 1", href: "/" },
        { label: "Položka 2", href: "/" },
      ],
    },
    {
      title: "Sloupec 3",
      links: [
        { label: "Položka 1", href: "/o-nas" },
        { label: "Položka 2", href: "/o-nas" },
        { label: "Položka 3", href: "/o-nas" },
      ],
    },
    {
      title: "Sloupec 4",
      links: [
        { label: "Položka 1", href: "/kavarny" },
        { label: "Položka 2", href: "/" },
        { label: "Položka 3", href: "/kontakt" },
      ],
    },
    {
      title: "Sloupec 5",
      links: [
        { label: "Položka 1", href: "/" },
        { label: "Položka 2", href: "/" },
      ],
    },
    {
      title: "Sloupec 6",
      links: [
        { label: "Položka 1", href: "#" },
        { label: "Položka 2", href: "#" },
      ],
    },
  ],
  legalLinks: [
    { label: "Ochrana osobních údajů", href: "#" },
    { label: "Zásady cookies", href: "#" },
  ],
  socials: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
  ],
};

export const cafe01Template: TemplateDefinition = {
  key: "cafe-01",
  name: "Cafe — Vlna kávy",
  industry: "cafe",
  version: "1.0.0",

  designTokens: {
    colorPrimary: PRIMARY,
    colorSecondary: PRIMARY_LIGHT,
    colorBackground: "#ffffff",
    colorSurface: ACCENT_OFFWHITE,
    colorText: "#222322",
    colorTextMuted: "#747474",
    colorAccent: PRIMARY_LIGHT,
    colorBorder: "#e5e5e5",
    fontHeading: "'CostaDisplayWave', Georgia, serif",
    fontBody: "'CostaText', system-ui, sans-serif",
    borderRadius: "9999px",
    spacing: "normal",
  },

  defaultSections: [
    { type: "navbar",       variant: "default",            order: 0, visible: true },
    { type: "hero",         variant: "hero-cafe-wave",     order: 1, visible: true },
    { type: "about",        variant: "cafe-loyalty-tilted", order: 2, visible: true },
    { type: "blog-preview", variant: "cafe-filled-cards",  order: 3, visible: true },
    { type: "cta",          variant: "cafe-magazine",      order: 4, visible: true },
    { type: "footer",       variant: "default",            order: 5, visible: true },
  ],

  pages: [
    {
      slug: "kavarny",
      title: "Provozovny",
      seoTitle: "Provozovny | " + SITE_NAME,
      seoDescription: "Krátký popis této podstránky pro vyhledávače.",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: navbarContent },
        { type: "hero", variant: "hero-centered", order: 1, visible: true, content: {
          title: "Nadpis podstránky\n(druhý řádek)",
          subtitle: "Krátký podtitulek pod nadpisem",
          ctaText: "Hlavní akce",
          ctaHref: "#mapa",
        } },
        { type: "contact", variant: "split", order: 2, visible: true, content: {
          title: "Kontaktní sekce",
          address: "Ulice 1, město, PSČ",
          phone: "+420 000 000 000",
          email: "info@vase-domena.cz",
        } },
        { type: "footer", variant: "default", order: 3, visible: true, content: footerContent },
      ],
    },
    {
      slug: "nabidka",
      title: "Nabídka",
      seoTitle: "Nabídka | " + SITE_NAME,
      seoDescription: "Krátký popis této podstránky pro vyhledávače.",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: navbarContent },
        { type: "hero", variant: "hero-centered", order: 1, visible: true, content: {
          title: "Naše nabídka",
          subtitle: "Krátký podtitulek pod nadpisem",
          ctaText: "",
          ctaHref: "",
        } },
        { type: "services", variant: "grid", order: 2, visible: true, content: {
          services: [
            { name: "Název služby 1", description: "Popis služby — co zákazník dostane.", price: "0 Kč", duration: "" },
            { name: "Název služby 2", description: "Popis služby — co zákazník dostane.", price: "0 Kč", duration: "" },
            { name: "Název služby 3", description: "Popis služby — co zákazník dostane.", price: "0 Kč", duration: "" },
            { name: "Název služby 4", description: "Popis služby — co zákazník dostane.", price: "0 Kč", duration: "" },
            { name: "Název služby 5", description: "Popis služby — co zákazník dostane.", price: "0 Kč", duration: "" },
            { name: "Název služby 6", description: "Popis služby — co zákazník dostane.", price: "0 Kč", duration: "" },
          ],
        } },
        { type: "cta", variant: "cafe-magazine", order: 3, visible: true, content: {
          title: "Nadpis CTA sekce",
          body: "Doplňující text k tlačítku — co zákazník po kliknutí dostane.",
          ctaText: "Hlavní akce",
          ctaHref: "#",
          image: placeholderImage(220, 300, "Obrázek"),
        } },
        { type: "footer", variant: "default", order: 4, visible: true, content: footerContent },
      ],
    },
    {
      slug: "o-nas",
      title: "O nás",
      seoTitle: "O nás | " + SITE_NAME,
      seoDescription: "Krátký popis této podstránky pro vyhledávače.",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: navbarContent },
        { type: "hero", variant: "hero-centered", order: 1, visible: true, content: {
          title: "Náš příběh",
          subtitle: "Krátký podtitulek pod nadpisem",
        } },
        { type: "about", variant: "two-col", order: 2, visible: true, content: {
          title: "Jak jsme začali",
          body: "Příběh podniku — jak vznikl, kdo ho založil, co je vaše hodnota. Tento odstavec je placeholder, který nahradíte vlastním textem o vás. Pište jednoduše a osobně, ať vám čtenáři uvěří.",
          image: placeholderImage(600, 400, "Obrázek příběhu"),
          highlight: "Citát nebo motto",
        } },
        { type: "cta", variant: "cafe-magazine", order: 3, visible: true, content: {
          title: "Nadpis CTA sekce",
          body: "Doplňující text k tlačítku — co zákazník po kliknutí dostane.",
          ctaText: "Hlavní akce",
          ctaHref: "#",
          image: placeholderImage(220, 300, "Obrázek"),
        } },
        { type: "footer", variant: "default", order: 4, visible: true, content: footerContent },
      ],
    },
    {
      slug: "kontakt",
      title: "Kontakt",
      seoTitle: "Kontakt | " + SITE_NAME,
      seoDescription: "Krátký popis této podstránky pro vyhledávače.",
      sections: [
        { type: "navbar", variant: "default", order: 0, visible: true, content: navbarContent },
        { type: "contact", variant: "split", order: 1, visible: true, content: {
          title: "Kontaktujte nás",
          address: "Ulice 1, 110 00 město",
          phone: "+420 000 000 000",
          email: "info@vase-domena.cz",
          nameLabel: "Jméno",
          emailLabel: "E-mail",
          messageLabel: "Zpráva",
          submitText: "Odeslat",
        } },
        { type: "footer", variant: "default", order: 2, visible: true, content: footerContent },
      ],
    },
  ],

  demoContent: {
    siteName: SITE_NAME,
    tagline: "Slogan podniku",
    description: "Krátký popis vašeho podniku.",

    navbar: navbarContent,

    hero: {
      title: "Ledové drinky\nv cherry stylu",
      subtitle: "Objevte novinky v naší kavárně",
      ctaText: "Zjistit více",
      ctaHref: "/nabidka",
      backgroundImage: COSTA_HERO,
    },

    about: {
      title: "Nadpis sekce o produktu nebo programu",
      body: "Dvouřádkový popisek, který doplňuje hlavní nadpis a vysvětluje, co tato sekce zákazníkovi nabízí.",
      image: placeholderImage(360, 225, "Obrázek"),
      highlight: "Tlačítko",
    },

    "blog-preview": {
      title: "Nadpis sekce s novinkami",
      items: [
        {
          title: "Název článku 1",
          excerpt: "Perex článku — krátký úryvek, který zákazníka navnadí na přečtení celého textu.",
          image: placeholderImage(640, 484, "Obrázek novinky 1"),
          date: "1. 1. 2026",
          href: "#",
        },
        {
          title: "Název článku 2",
          excerpt: "Perex článku — krátký úryvek, který zákazníka navnadí na přečtení celého textu.",
          image: placeholderImage(640, 484, "Obrázek novinky 2"),
          date: "1. 1. 2026",
          href: "#",
        },
        {
          title: "Název článku 3",
          excerpt: "Perex článku — krátký úryvek, který zákazníka navnadí na přečtení celého textu.",
          image: placeholderImage(640, 484, "Obrázek novinky 3"),
          date: "1. 1. 2026",
          href: "#",
        },
      ],
    },

    cta: {
      title: "Nadpis CTA sekce",
      subtitle: "",
      body: "Delší popis — co zákazník po kliknutí dostane, proč to chtít, kdy to využije. Dvě až tři věty stačí.",
      ctaText: "Hlavní akce",
      ctaHref: "#",
      image: placeholderImage(220, 300, "Obrázek"),
    },

    footer: footerContent,

    services: {
      services: [
        { name: "Název služby 1", description: "Popis služby 1", price: "0 Kč" },
        { name: "Název služby 2", description: "Popis služby 2", price: "0 Kč" },
        { name: "Název služby 3", description: "Popis služby 3", price: "0 Kč" },
        { name: "Název služby 4", description: "Popis služby 4", price: "0 Kč" },
        { name: "Název služby 5", description: "Popis služby 5", price: "0 Kč" },
        { name: "Název služby 6", description: "Popis služby 6", price: "0 Kč" },
      ],
    },

    contact: {
      title: "Kontaktujte nás",
      address: "Ulice 1, 110 00 město",
      phone: "+420 000 000 000",
      email: "info@vase-domena.cz",
      nameLabel: "Jméno",
      emailLabel: "E-mail",
      messageLabel: "Zpráva",
      submitText: "Odeslat",
    },
  },
};
