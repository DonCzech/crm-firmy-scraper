import pg from "pg";
import { readFileSync } from "fs";

const url = readFileSync(".env.local", "utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url });
await c.connect();

// Tenant 525 subpage section IDs (from earlier discovery):
//
//  /sluzby (page 3495):
//    14571 navbar, 14572 hero (clinic-02-hero), 14573 services, 14574 footer
//
//  /o-nas (page 3496):
//    14575 navbar, 14576 hero, 14577 about, 14578 footer
//
//  /kontakt (page 3497):
//    14579 navbar, 14580 hero, 14581 contact, 14582 footer

// ── 1) Switch all subpage hero sections to slim banner variant ────────────────
await c.query("UPDATE sections SET section_variant='clinic-02-page-banner' WHERE id IN (14572, 14576, 14580)");
console.log("✓ Switched 3 subpage heroes to clinic-02-page-banner");

// ── 2) Patch each section content_overrides ──────────────────────────────────
async function setContent(id, content) {
  await c.query("UPDATE sections SET content_overrides=$1::jsonb WHERE id=$2", [JSON.stringify(content), id]);
  console.log(`✓ Section ${id} content set`);
}

// /sluzby (Zákroky)
await setContent(14572, {
  title: "Zákroky a ošetření",
  subtitle: "Kompletní nabídka estetické dermatologie — od preventivní péče přes injekční modelace až po neinvazivní lifting.",
  breadcrumb: "Domů",
  breadcrumbHref: "/",
});

// Empty the duplicate services header (kicker + title) — conditional showHeader
// pattern in code skips rendering when empty. Keep services array filled.
await setContent(14573, {
  showHeader: false,
  kicker: "",
  title: "",
  services: [
    {
      name: "Botulotoxin proti vráskám",
      description:
        "Jemné a přirozené uhlazení mimických vrásek na čele, mezi obočím a kolem očí. Originální Botox® od Allergan, výsledek nastupuje do 5 dnů a vydrží 4–6 měsíců.",
      price: "od 3 900 Kč",
      ctaText: "Více info",
      ctaHref: "/kontakt",
      imageUrl: "/images/clinic-02/service-botox.webp",
    },
    {
      name: "Výplně rtů a tváří",
      description:
        "Modelace rtů, vyplnění nosoretních rýh a obnova ztracených objemů kyselinou hyaluronovou Juvéderm Vycross®. Výsledek je viditelný okamžitě a vydrží 9–12 měsíců.",
      price: "od 6 900 Kč",
      ctaText: "Více info",
      ctaHref: "/kontakt",
      imageUrl: "/images/clinic-02/service-filler.webp",
    },
    {
      name: "Ultraformer HIFU lifting",
      description:
        "Neinvazivní lifting obličeje, krku a dekoltu fokusovaným ultrazvukem. Jediné ošetření zpevní pleť na 12 měsíců dopředu — bez jehly, bez rekonvalescence.",
      price: "od 14 900 Kč",
      ctaText: "Více info",
      ctaHref: "/kontakt",
      imageUrl: "/images/clinic-02/service-hifu.webp",
    },
  ],
});

// /o-nas
await setContent(14576, {
  title: "O klinice",
  subtitle: "Rodinná klinika estetické dermatologie v centru Prahy, kterou založila MUDr. Marie Hladíková. Tým 6 atestovaných lékařů a 18 let zkušeností.",
  breadcrumb: "Domů",
  breadcrumbHref: "/",
});

// Empty about header so banner H1 doesn't compete with section H2
await setContent(14577, {
  showHeader: false,
  kicker: "",
  title: "",
  body:
    "Aurélie Clinic je rodinná klinika estetické dermatologie v centru Prahy, kterou v roce 2008 založila MUDr. Marie Hladíková se svým týmem. Naše filozofie je jednoduchá — krása má zůstat přirozená, nikdy nepřetváříme, jen umně podtrhujeme. Pracujeme výhradně s originálními certifikovanými preparáty Allergan, Galderma a Merz a investujeme do nejmodernějších přístrojů (Ultraformer III, Fotona SP Dynamis, M22 IPL). Za 18 let jsme spojili tým 6 atestovaných dermatologů a plastických chirurgů, kteří se pravidelně vzdělávají na mezinárodních kongresech v Paříži, Miláně a Soulu. Každá klientka si u nás zaslouží 45 minut nezávazné konzultace, individuální plán ošetření a transparentní cenovou kalkulaci.",
  imageUrl: "/images/clinic-02/about.webp",
  features: [
    "Tým 6 atestovaných dermatologů a plastických chirurgů",
    "Pouze originální preparáty Allergan, Galderma, Merz",
    "Bezplatná vstupní konzultace s lékařem (45 minut)",
    "Diskrétní VIP zóna a soukromý vchod ze dvora",
    "Více než 18 000 spokojených klientů",
    "Garance vrácení peněz při neuspokojivém výsledku",
  ],
  ctaText: "Online rezervace",
  ctaHref: "/kontakt",
  statValue: "18",
  statLabel: "let zkušeností",
  statSub: "MUDr. Marie Hladíková · vedoucí lékařka kliniky",
});

// /kontakt
await setContent(14580, {
  title: "Kontakt",
  subtitle: "Najdete nás v centru Prahy na Vinohradech. Recepce je vám k dispozici po celý pracovní den.",
  breadcrumb: "Domů",
  breadcrumbHref: "/",
});

// Empty contact header so banner H1 dominates
await setContent(14581, {
  showHeader: false,
  kicker: "",
  title: "",
  address: "Vinohradská 2828/151",
  city: "130 00 Praha 3 — Vinohrady",
  phone: "+420 234 567 890",
  email: "info@aurelie-clinic.cz",
  hours: [
    { days: "Pondělí – Pátek", time: "8:00 – 20:00" },
    { days: "Sobota", time: "9:00 – 14:00" },
    { days: "Neděle", time: "zavřeno" },
  ],
  ctaCardTitle: "Rezervujte si návštěvu",
  ctaCardBody: "Vyberte si termín, který vám vyhovuje. Naše recepce vám odpoví do několika minut.",
  ctaCardBtn: "Online rezervace",
});

await c.end();
console.log("\nDone — clinic-02-v2 subpages wired up.");
