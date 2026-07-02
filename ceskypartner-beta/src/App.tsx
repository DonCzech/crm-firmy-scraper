import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { PDFDocument } from 'pdf-lib';
import { CountdownPage } from './pages/CountdownPage';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/content/default/content.min.css';

const navMain = [
  { key: 'accounts', label: 'Bydlení a reality', caret: true },
  { key: 'loans', label: 'Půjčky a hypotéky', caret: true },
  { key: 'investments', label: 'Investice a spoření', caret: true },
  { key: 'insurance', label: 'Pojištění', caret: true },
  { key: 'business', label: 'Podnikatelé', caret: true },
  { key: 'security', label: 'Bezpečnost', caret: true },
  { key: 'contacts', label: 'Kontakty', caret: true },
  { key: 'about', label: 'O nás', caret: false },
  { key: 'advice', label: 'Poradna', caret: false },
] as const;

const megaMenuContent: Record<string, {
  size: 'wide' | 'medium' | 'compact';
  cols: Array<Array<{ label: string; strong?: boolean; suffix?: string; to?: string }>>;
  promoTitle: string;
  promoRating: string;
  promoImage?: string;
}> = {
  accounts: {
    size: 'wide',
    cols: [
      [
        { label: 'Bydlení a reality', strong: true, to: '/bydleni-a-reality' },
        { label: 'Odhad nemovitosti', strong: true },
        { label: 'Prodej nemovitosti', strong: true },
        { label: 'Nákup bytu a domu', strong: true },
        { label: 'Novostavby v Praze', strong: true },
        { label: 'Investiční reality', strong: true },
        { label: 'Právní servis', strong: true },
      ],
      [
        { label: 'Hypotéční poradenství' },
        { label: 'Financování rekonstrukce' },
        { label: 'Analýza lokality' },
        { label: 'Stanovení tržní ceny' },
        { label: 'Správa pronájmu' },
      ],
      [
        { label: 'Bydlení bez starostí' },
        { label: 'Kompletní servis od A do Z' },
        { label: 'Rychlá realizace zakázky' },
        { label: 'Lokální experti v regionech' },
        { label: 'Osobní konzultace zdarma' },
      ],
    ],
    promoTitle: 'Bydlení a reality\nna jednom místě',
    promoRating: 'Pražské novostavby, odhady i prodej',
    promoImage: '/hero/prague-newbuild-hero.jpg',
  },
  loans: {
    size: 'wide',
    cols: [
      [
        { label: 'Půjčka', strong: true },
        { label: 'Hypotéka', strong: true },
        { label: 'Konsolidace', strong: true },
        { label: 'Refinancování', strong: true },
      ],
      [
        { label: 'Kalkulačka splátek' },
        { label: 'Předčasné splacení' },
        { label: 'Pojištění schopnosti splácet' },
        { label: 'Průvodce hypotékou' },
      ],
      [
        { label: 'Půjčka online do 5 minut' },
        { label: 'Bez poplatku za vyřízení' },
        { label: 'Férové podmínky' },
      ],
    ],
    promoTitle: 'Půjčka i hypotéka\nbez zbytečného papírování',
    promoRating: 'Online žádost 24/7',
  },
  investments: {
    size: 'medium',
    cols: [
      [
        { label: 'Investování', strong: true },
        { label: 'Spořicí účet', strong: true },
        { label: 'Termínovaný vklad', strong: true },
      ],
      [
        { label: 'Jak začít investovat' },
        { label: 'Modelová portfolia' },
        { label: 'Rizika a výnosy' },
      ],
      [
        { label: 'Vklad od 100 Kč' },
        { label: 'Správa v mobilu' },
        { label: 'Transparentní přehled poplatků' },
      ],
    ],
    promoTitle: 'Nechte své peníze\npracovat chytře',
    promoRating: 'Investujte už od 100 Kč',
  },
  insurance: {
    size: 'medium',
    cols: [
      [
        { label: 'Pojištění karet', strong: true },
        { label: 'Cestovní pojištění', strong: true },
        { label: 'Pojištění domácnosti', strong: true },
      ],
      [
        { label: 'Pojištění k půjčce' },
        { label: 'Hlášení škody online' },
        { label: 'Asistenční služby' },
      ],
      [
        { label: 'Rychlé sjednání online' },
        { label: 'Jasné podmínky' },
        { label: 'Podpora 24/7' },
      ],
    ],
    promoTitle: 'Pojištění, které\nvás opravdu podrží',
    promoRating: 'Vyřešíte online za pár minut',
  },
  business: {
    size: 'medium',
    cols: [
      [
        { label: 'Účet pro podnikatele', strong: true },
        { label: 'Podnikatelská karta', strong: true },
        { label: 'API pro firmy', strong: true },
      ],
      [
        { label: 'Platební terminály' },
        { label: 'Hromadné platby' },
        { label: 'Správa oprávnění' },
      ],
      [
        { label: 'Snadné účetnictví' },
        { label: 'Online bankovnictví pro tým' },
        { label: 'Podpora pro podnikatele' },
      ],
    ],
    promoTitle: 'Podnikatelské bankovnictví\nbez zbytečné byrokracie',
    promoRating: 'Začněte podnikat chytře',
  },
  security: {
    size: 'compact',
    cols: [
      [
        { label: 'Bezpečnostní centrum', strong: true },
        { label: 'Ochrana účtu', strong: true },
        { label: 'Bezpečné platby', strong: true },
      ],
      [
        { label: 'Aktuální podvody' },
        { label: 'Dvoufaktorové ověření' },
        { label: 'Blokace karty' },
      ],
      [
        { label: 'Jak poznat phishing' },
        { label: 'Bezpečnostní doporučení' },
        { label: 'Nahlásit incident' },
      ],
    ],
    promoTitle: 'Vaše peníze i data\nchráníme na maximum',
    promoRating: 'Bezpečnost na prvním místě',
  },
  contacts: {
    size: 'compact',
    cols: [
      [
        { label: 'Kontaktní centrum', strong: true, to: '/kontakty' },
        { label: 'Pobočky a bankomaty', strong: true },
        { label: 'Napište nám', strong: true },
      ],
      [
        { label: 'Chat podpora' },
        { label: 'Telefonická podpora' },
        { label: 'Reklamace a stížnosti' },
      ],
      [
        { label: 'Otevírací doba poboček' },
        { label: 'Nejčastější kontakty' },
        { label: 'Média a tisk' },
      ],
    ],
    promoTitle: 'Jsme tu pro vás,\nkdykoliv potřebujete',
    promoRating: 'Podpora každý den',
  },
};

type HomeContent = {
  heroLine1: string;
  heroLine2: string;
  heroDescription: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroImageH1: string;
  heroImageH2: string;
  heroImageH3: string;
  heroImageH4: string;
  productsHeading: string;
  perksHeading: string;
  perksDescription: string;
  appHeading: string;
  appLead: string;
  appDescription: string;
  appCtaOutline: string;
  appCtaSolid: string;
  shortcutLabels: [string, string, string, string, string];
  quickLinks: string[];
  faqItems: Array<{ q: string; a: string }>;
};

const defaultHomeContent: HomeContent = {
  heroLine1: 'S námi proměníte',
  heroLine2: 'své plány v realitu',
  heroDescription: 'Dopřejte si péči konzultantů z oboru financí a realit s nejvyšší spokojeností klientů na trhu.',
  heroCtaPrimary: 'Zjistěte více',
  heroCtaSecondary: 'Naše služby',
  heroImageH1: '/wp/AdobeStock_695328241_1-1170x785.jpg',
  heroImageH2: '/wp/agent-03.jpg',
  heroImageH3: '/wp/agent-01.jpg',
  heroImageH4: '/wp/agent-02.jpg',
  productsHeading: 'Co s námi řešíte?',
  perksHeading: 'S námi zvládnete všechno, co kolem peněz řešíte, od každodenních drobností až po ta největší finanční rozhodnutí',
  perksDescription: 'Neustále hledáme cesty, jak dělat bankovnictví jednodušší, férovější, přátelštější a výhodnější. Máme více než 100 důvodů, proč i banku můžete mít rádi. Žádnou jinou už nepotřebujete.',
  appHeading: 'Vše u nás začíná běžným účtem zdarma',
  appLead: 'Bankování s ním je tak snadné, že ho zvládnou už děti od 8 let.',
  appDescription: 'Základní výbava našeho účtu je tak bohatá, že při běžném bankování nezaplatíte ani korunu. K účtu navíc dostanete zdarma 2 karty a spoustu výhod. Můžete si o nich přečíst nebo je rovnou zažít.',
  appCtaOutline: 'Více o účtu',
  appCtaSolid: 'Založit účet',
  shortcutLabels: [
    'Bydlení a reality',
    'Spoření a investice',
    'Renta',
    'Zabezpečení',
    'Komplexní finanční plán',
  ],
  quickLinks: [
    'Přihlášení do internetového bankovnictví',
    'Aktivace nové karty',
    'Změna limitu karty',
    'Založení účtu online',
    'Převod účtu z jiné banky',
    'Pomoc a podpora',
  ],
  faqItems: [
    {
      q: 'Jak dlouho trvá založení účtu?',
      a: 'Online účet založíte obvykle do 10 minut. Ověření identity probíhá bezpečně v mobilu.',
    },
    {
      q: 'Kolik stojí vedení účtu?',
      a: 'Vedení běžného účtu je zdarma, stejně jako příchozí a odchozí platby v CZK.',
    },
    {
      q: 'Můžu vše řešit bez pobočky?',
      a: 'Ano. Většinu běžných požadavků vyřešíte v aplikaci nebo internetovém bankovnictví.',
    },
    {
      q: 'Jak funguje podpora?',
      a: 'Podpora je dostupná online i telefonicky. Když je potřeba, pomůžeme i na pobočce.',
    },
  ],
};

const shortcutItems = [
  { key: 'housing', icon: 'house' },
  { key: 'invest', icon: 'bars' },
  { key: 'renta', icon: 'money' },
  { key: 'secure', icon: 'umbrella' },
  { key: 'plan', icon: 'card' },
] as const;

const accountBenefits = [
  'Vedení účtu zdarma bez podmínek',
  'Příchozí i odchozí platby v CZK zdarma',
  '2 debetní karty zdarma k účtu',
  'Okamžité notifikace a přehled v aplikaci',
];

const accountFeatures = [
  {
    title: 'Až 10 účtů zdarma',
    text: 'Pro rodinu, rezervy i každodenní finance. Vše přehledně v jedné aplikaci.',
  },
  {
    title: 'Karty pod kontrolou',
    text: 'Dočasné zablokování, limity, online platby i nastavení plateb jedním kliknutím.',
  },
  {
    title: 'Okamžité platby',
    text: 'Peníze dorazí během pár sekund. Platby i převody řešíte rychle bez čekání.',
  },
  {
    title: 'Výběry po celém Česku',
    text: 'Široká síť výběrů a jednoduchá správa hotovosti přímo v mobilu.',
  },
  {
    title: 'Bankovní identita',
    text: 'Bezpečné přihlášení ke službám státu i partnerů bez dalších hesel.',
  },
  {
    title: 'Věrnostní výhody',
    text: 'Pravidelné bonusy, akce a výhody za aktivní používání účtu.',
  },
];

const accountOpenSteps = [
  'Vyplníte online žádost během pár minut.',
  'Ověříte identitu bezpečně v mobilu.',
  'Podepíšete smlouvu elektronicky.',
  'Účet můžete okamžitě používat.',
];

const accountFaq = [
  {
    q: 'Je vedení běžného účtu opravdu zdarma?',
    a: 'Ano, vedení účtu je zdarma bez podmínek. Stejně tak běžné tuzemské platby.',
  },
  {
    q: 'Jak dlouho trvá založení účtu?',
    a: 'Nejčastěji 10 až 15 minut. Celé založení zvládnete online bez návštěvy pobočky.',
  },
  {
    q: 'Dostanu k účtu platební kartu?',
    a: 'Ano, k běžnému účtu můžete mít karty zdarma a všechny limity si nastavíte v aplikaci.',
  },
  {
    q: 'Mohu účet využívat i pro dítě?',
    a: 'Ano, nabízíme varianty účtu i pro mladší klienty s jednoduchou správou.',
  },
];

const contactChannels = [
  { title: 'Telefon', value: '+420 800 123 456', note: 'Po–Pá 8:00–20:00' },
  { title: 'E-mail', value: 'info@ceskypartner.cz', note: 'Odpovídáme do 24 hodin' },
  { title: 'Online chat', value: 'Zahájit chat', note: 'Každý den 8:00–22:00' },
];

const contactBranches = [
  { city: 'Praha 1', address: 'Na Příkopě 12, Praha', hours: 'Po–Pá 9:00–18:00' },
  { city: 'Brno', address: 'Česká 18, Brno', hours: 'Po–Pá 9:00–17:00' },
  { city: 'Ostrava', address: 'Nádražní 52, Ostrava', hours: 'Po–Pá 9:00–17:00' },
];

const housingServices = [
  { title: 'Prodej nemovitostí', text: 'Strategický prodej, práce s daty a moderní marketing.', image: '/wp/AdobeStock_301062516.jpg' },
  { title: 'Pronájem nemovitostí', text: 'Zajištění bonitních nájemníků a dlouhodobá správa.', image: '/wp/AdobeStock_676156911-1.jpg' },
  { title: 'Nákup nemovitostí', text: 'Due diligence, vyjednání ceny a bezpečný převod.', image: '/wp/AdobeStock_575996968.jpg' },
  { title: 'Výkup nemovitostí', text: 'Rychlé řešení včetně právního a finančního servisu.', image: '/wp/AdobeStock_695328241_1.jpg' },
  { title: 'Odborné odhady nemovitostí', text: 'Certifikované odhady pro banky, dědictví i prodej.', image: '/wp/AdobeStock_323336140.jpg' },
  { title: 'Správa nemovitostí', text: 'Komplexní servis, administrativa a výnosový reporting.', image: '/wp/AdobeStock_676162468.jpg' },
  { title: 'Investiční nemovitosti', text: 'Analýza trhu a výběr příležitostí s dlouhodobým potenciálem.', image: '/wp/AdobeStock_695328241_1-1170x785.jpg' },
  { title: 'Pojištění a ochrana majetku', text: 'Optimální pojistné krytí rezidenčních i komerčních nemovitostí.', image: '/wp/5730ecff1daa4.jpg' },
];

const housingProcessSteps = [
  'Nezávazná konzultace a sběr klíčových informací.',
  'Odborné posouzení nemovitosti nebo zadání.',
  'Návrh strategie a cenového modelu.',
  'Realizace transakce nebo správy.',
  'Následná podpora a dlouhodobý servis.',
];

type ServiceDetailData = {
  eyebrow: string;
  crumb: string;
  title: string;
  lead: string;
  body: string;
  image: string;
  primaryCta: string;
  secondaryCta: string;
  stats: Array<{ value: string; label: string }>;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesIntro: string;
  cards: Array<{ title: string; text: string; tag: string }>;
  processEyebrow: string;
  processTitle: string;
  processIntro: string;
  steps: Array<{ title: string; text: string }>;
  asideTitle: string;
  asideText: string;
  asidePoints: string[];
  ctaTitle: string;
  ctaText: string;
};

const serviceDetailPages: Record<'housing' | 'loans' | 'investments' | 'insurance' | 'about', ServiceDetailData> = {
  housing: {
    eyebrow: 'Bydlení a reality',
    crumb: 'Služby / Bydlení a reality',
    title: 'Odhad, prodej, financování i bezpečný převod v jednom postupu.',
    lead: 'Nemovitost neřešíme jako izolovanou transakci. Hlídáme cenu, časování, financování, smlouvy i dopad na vaše další plány.',
    body: 'Pomůžeme při nákupu, prodeji, odhadu i správě nemovitosti. Vždy s ohledem na rozpočet, rezervu, pojištění a bezpečné dokončení převodu.',
    image: '/wp/quadrio-exterier-2@2x.1765184383.jpg.webp',
    primaryCta: 'Probrat nemovitost',
    secondaryCta: 'Zobrazit postup',
    stats: [
      { value: '1', label: 'partner pro cenu, smlouvy i financování' },
      { value: '4', label: 'návaznosti: odhad, prodej, úvěr, ochrana' },
      { value: '24 h', label: 'rychlá orientace v dalším kroku' },
    ],
    servicesEyebrow: 'Co řešíme',
    servicesTitle: 'Reality bez slepých míst',
    servicesIntro: 'Každý krok má dopad na další. Proto propojujeme realitní servis s financemi a ochranou majetku.',
    cards: [
      { title: 'Odhad tržní ceny', text: 'Realistická cena podle lokality, stavu, poptávky a účelu odhadu.', tag: 'cena' },
      { title: 'Prodej nemovitosti', text: 'Strategie, příprava, prezentace, vyjednávání a bezpečné dotažení smluv.', tag: 'prodej' },
      { title: 'Nákup bydlení', text: 'Kontrola rizik, financování, rezerva po koupi a návaznost na převod.', tag: 'nákup' },
      { title: 'Investiční nemovitost', text: 'Výnos, náklady, nájemní rizika a dopad na vaše portfolio.', tag: 'investice' },
      { title: 'Správa a pronájem', text: 'Nájemní smlouvy, výběr nájemníka, pojištění a dlouhodobá kontrola.', tag: 'správa' },
      { title: 'Bezpečný převod', text: 'Termíny, úschova, katastr, smlouvy a praktická koordinace kroků.', tag: 'převod' },
    ],
    processEyebrow: 'Postup',
    processTitle: 'Nejdřív souvislosti, potom doporučení',
    processIntro: 'Nezačínáme nabídkou. Nejdřív zjistíme, kde může vzniknout riziko a co na sebe navazuje.',
    steps: [
      { title: 'Zmapujeme situaci', text: 'Co vlastníte, co chcete změnit, jaký je časový tlak a kde jsou limity.' },
      { title: 'Ověříme hodnotu a rizika', text: 'Cena, právní návaznosti, financování, rezerva i pojistné krytí.' },
      { title: 'Navrhneme scénář', text: 'Dostanete postup s prioritami a jasným pořadím kroků.' },
      { title: 'Dohlédneme na dokončení', text: 'Smlouvy, banka, termíny a předání mají jednoho koordinátora.' },
    ],
    asideTitle: 'Typická situace',
    asideText: 'Kupujete nové bydlení a současně prodáváte stávající byt. Špatné pořadí kroků může rozhodit rozpočet, termíny i jistotu převodu.',
    asidePoints: ['odhad reálné ceny', 'hypotéka a rezerva', 'smlouvy a úschova'],
    ctaTitle: 'Chcete probrat konkrétní nemovitost?',
    ctaText: 'Pošlete základní informace. Vrátíme se s tím, co má smysl řešit jako první.',
  },
  loans: {
    eyebrow: 'Půjčky a hypotéky',
    crumb: 'Služby / Půjčky a hypotéky',
    title: 'Financování, které sedí k rozpočtu i dalším plánům.',
    lead: 'Nehledáme jen nejnižší sazbu. Díváme se na splátku, rezervu, fixaci, rizika a to, co se stane po podpisu.',
    body: 'Porovnáme hypotéku, refinancování, konsolidaci i spotřebitelský úvěr bez tlaku na jednu banku. Výsledek má být srozumitelný a dlouhodobě udržitelný.',
    image: '/wp/AdobeStock_575996968.jpg',
    primaryCta: 'Spočítat možnosti',
    secondaryCta: 'Jak postupujeme',
    stats: [
      { value: 'více', label: 'bank a variant vedle sebe' },
      { value: '0 Kč', label: 'úvodní konzultace' },
      { value: '1 plán', label: 'splátka, rezerva, ochrana' },
    ],
    servicesEyebrow: 'Možnosti',
    servicesTitle: 'Úvěr má zapadnout do života, ne ho převálcovat',
    servicesIntro: 'Každé financování hodnotíme podle dopadu na měsíční rozpočet, rezervu a rizika.',
    cards: [
      { title: 'Hypotéka na bydlení', text: 'Koupě, stavba, rekonstrukce a kontrola celkových nákladů.', tag: 'bydlení' },
      { title: 'Refinancování', text: 'Srovnání nové fixace, poplatků, sazby a flexibility splácení.', tag: 'fixace' },
      { title: 'Konsolidace', text: 'Sloučení závazků do přehlednější splátky bez zbytečného chaosu.', tag: 'přehled' },
      { title: 'Spotřebitelský úvěr', text: 'Rychlé financování s kontrolou celkového přeplacení.', tag: 'účel' },
      { title: 'Americká hypotéka', text: 'Financování proti nemovitosti, když dává smysl pro širší plán.', tag: 'zástava' },
      { title: 'Ochrana splácení', text: 'Nastavení krytí pro nemoc, výpadek příjmu nebo rodinnou změnu.', tag: 'riziko' },
    ],
    processEyebrow: 'Rozhodování',
    processTitle: 'Srovnáme varianty tak, aby byly čitelné',
    processIntro: 'Čísla mají být použitelná, ne jen hezká v tabulce.',
    steps: [
      { title: 'Spočítáme reálný rozpočet', text: 'Příjem, výdaje, rezerva, další cíle a prostor pro splátku.' },
      { title: 'Porovnáme varianty', text: 'Sazba, fixace, LTV, poplatky, podmínky čerpání i flexibilita.' },
      { title: 'Ošetříme rizika', text: 'Co se stane při výpadku příjmu, změně sazby nebo vyšších nákladech.' },
      { title: 'Dohlédneme na schválení', text: 'Podklady, banka, podpisy a návaznosti na kupní proces.' },
    ],
    asideTitle: 'Nejde jen o sazbu',
    asideText: 'Levnější nabídka na první pohled může být horší, pokud zhorší rezervu, má tvrdé podmínky nebo nevychází s termíny převodu.',
    asidePoints: ['splátka po podpisu', 'fixace a flexibilita', 'pojištění příjmu'],
    ctaTitle: 'Chcete vědět, co si můžete dovolit?',
    ctaText: 'Připravíme orientační scénáře a vysvětlíme, co znamenají pro váš měsíční rozpočet.',
  },
  investments: {
    eyebrow: 'Investice a spoření',
    crumb: 'Služby / Investice a spoření',
    title: 'Dlouhodobý plán, portfolio a ochrana rezerv.',
    lead: 'Investice nastavujeme podle cíle, horizontu a rizika. Ne podle toho, co je právě nejhlasitěji prodávané.',
    body: 'Pomůžeme rozdělit krátkou rezervu, dlouhodobé investice a ochranu příjmu tak, aby se jednotlivé produkty nepřetahovaly proti sobě.',
    image: '/wp/AdobeStock_676162468.jpg',
    primaryCta: 'Postavit plán',
    secondaryCta: 'Co zahrnout',
    stats: [
      { value: '3', label: 'vrstvy: rezerva, růst, ochrana' },
      { value: 'průběžně', label: 'kontrola podle životní situace' },
      { value: 'bez tlaku', label: 'na jeden produkt nebo fond' },
    ],
    servicesEyebrow: 'Portfolio',
    servicesTitle: 'Peníze mají mít pořadí a účel',
    servicesIntro: 'Jiné peníze patří do rezervy, jiné do dlouhodobých investic. Smíchání cílů často vytváří zbytečný stres.',
    cards: [
      { title: 'Krátká rezerva', text: 'Peníze dostupné pro nečekané výdaje a stabilitu domácnosti.', tag: 'rezerva' },
      { title: 'Dlouhodobé investice', text: 'Strategie podle horizontu, tolerance rizika a cíle.', tag: 'růst' },
      { title: 'Penzijní plán', text: 'Státní podpora, daňové možnosti a návaznost na jiné investice.', tag: 'důchod' },
      { title: 'Dětské cíle', text: 'Studium, start do života a postupné ukládání bez přehnaného rizika.', tag: 'rodina' },
      { title: 'Investiční nemovitosti', text: 'Výnos, likvidita, financování a rizika pronájmu v jednom pohledu.', tag: 'reality' },
      { title: 'Revize smluv', text: 'Kontrola starších produktů, nákladů, rizik a duplicit.', tag: 'kontrola' },
    ],
    processEyebrow: 'Strategie',
    processTitle: 'Plán se staví od cíle, ne od produktu',
    processIntro: 'Nejdřív si ujasníme, k čemu mají peníze sloužit.',
    steps: [
      { title: 'Rozdělíme cíle', text: 'Rezerva, bydlení, děti, důchod, podnikání nebo jiné horizonty.' },
      { title: 'Určíme riziko', text: 'Kolísání, dostupnost peněz a čas, po který má plán pracovat.' },
      { title: 'Navrhneme skladbu', text: 'Produkty, poměry, pravidelnost a návaznost na pojištění.' },
      { title: 'Pravidelně kontrolujeme', text: 'Plán se upravuje při změně příjmu, trhu nebo životní situace.' },
    ],
    asideTitle: 'Rezerva není investice',
    asideText: 'Když se krátkodobá rezerva zamkne do dlouhodobého produktu, člověk musí v horší chvíli prodávat nevhodně. Tomu se dá předejít.',
    asidePoints: ['dostupné peníze', 'dlouhý horizont', 'ochrana příjmu'],
    ctaTitle: 'Chcete dát úsporám jasný systém?',
    ctaText: 'Podíváme se na současné nastavení a navrhneme, co zjednodušit, chránit nebo rozvíjet.',
  },
  insurance: {
    eyebrow: 'Pojištění',
    crumb: 'Služby / Pojištění',
    title: 'Život, majetek, odpovědnost i podnikání bez zbytečných mezer.',
    lead: 'Dobré pojištění nepoznáte podle počtu smluv, ale podle toho, jestli kryje skutečné riziko ve správné výši.',
    body: 'Zkontrolujeme stávající smlouvy, duplicity, výluky a návaznost na hypotéku, rodinu, majetek i podnikání.',
    image: '/wp/5730ecff1daa4.jpg',
    primaryCta: 'Zkontrolovat smlouvy',
    secondaryCta: 'Typy krytí',
    stats: [
      { value: 'bez mezer', label: 'u příjmu, majetku a odpovědnosti' },
      { value: 'méně', label: 'duplicit a neúčinných připojištění' },
      { value: '1x ročně', label: 'doporučená kontrola nastavení' },
    ],
    servicesEyebrow: 'Ochrana',
    servicesTitle: 'Pojištění má chránit plán, ne jen existovat ve složce',
    servicesIntro: 'Krytí nastavujeme podle reálného dopadu rizika na domácnost, majetek nebo firmu.',
    cards: [
      { title: 'Životní pojištění', text: 'Příjem, rodina, závazky a rizika, která by rozpočet neunesl.', tag: 'příjem' },
      { title: 'Nemovitost a domácnost', text: 'Správná hodnota, limity, asistence a návaznost na hypotéku.', tag: 'majetek' },
      { title: 'Odpovědnost', text: 'Škody v běžném životě, podnikání nebo při správě nemovitosti.', tag: 'riziko' },
      { title: 'Pojištění k úvěru', text: 'Smysluplná ochrana splácení bez zbytečně drahých duplicit.', tag: 'úvěr' },
      { title: 'Podnikatelská rizika', text: 'Majetek, odpovědnost, přerušení provozu a klíčové osoby.', tag: 'firma' },
      { title: 'Revize smluv', text: 'Výluky, limity, zastaralé částky a překryvy mezi produkty.', tag: 'revize' },
    ],
    processEyebrow: 'Kontrola',
    processTitle: 'Nejdřív hledáme mezery, potom cenu',
    processIntro: 'Levnější pojistka nepomůže, když nekryje situaci, kvůli které ji potřebujete.',
    steps: [
      { title: 'Projít stávající smlouvy', text: 'Limity, výluky, připojištění, pojistné částky a duplicity.' },
      { title: 'Zmapovat dopad rizik', text: 'Co by znamenal výpadek příjmu, škoda na majetku nebo odpovědnost.' },
      { title: 'Navrhnout krytí', text: 'Priorita je správný rozsah, až potom optimalizace ceny.' },
      { title: 'Hlídání změn', text: 'Úprava při hypotéce, narození dítěte, koupi nemovitosti nebo podnikání.' },
    ],
    asideTitle: 'Největší problém bývá zastaralá smlouva',
    asideText: 'Hodnota nemovitosti roste, rodinná situace se mění a staré limity často zůstávají. Pak pojištění nevystačí právě ve chvíli, kdy má pomoci.',
    asidePoints: ['pojistné částky', 'výluky a limity', 'návaznost na úvěr'],
    ctaTitle: 'Chcete vědět, jestli vás smlouvy opravdu kryjí?',
    ctaText: 'Pošlete nám základní smlouvy nebo situaci. Řekneme, kde vidíme riziko a co má smysl upravit.',
  },
  about: {
    eyebrow: 'O nás',
    crumb: 'Český Partner / O nás',
    title: 'Jsme partner pro rozhodnutí, která se nevejdou do jedné kolonky.',
    lead: 'Spojujeme reality, finance, investice a ochranu majetku, protože klienti je v životě také neřeší odděleně.',
    body: 'Naším cílem je srozumitelný postup, méně přehazování mezi specialisty a dlouhodobá péče o souvislosti.',
    image: '/wp/AdobeStock_323336140.jpg',
    primaryCta: 'Seznámit se s námi',
    secondaryCta: 'Kontakt',
    stats: [
      { value: '1', label: 'kontaktní partner pro celý kontext' },
      { value: '4', label: 'oblasti, které se přirozeně potkávají' },
      { value: 'dlouhodobě', label: 'péče i po prvním rozhodnutí' },
    ],
    servicesEyebrow: 'Přístup',
    servicesTitle: 'Neprodáváme izolovaný produkt. Skládáme souvislosti.',
    servicesIntro: 'Když se řeší bydlení, často se zároveň řeší úvěr, rezerva, smlouvy a ochrana rodiny.',
    cards: [
      { title: 'Jeden kontext', text: 'Klient nemusí každému znovu vysvětlovat celou situaci.', tag: 'přehled' },
      { title: 'Srozumitelný postup', text: 'Doporučení má jasné pořadí, důvod a dopad.', tag: 'postup' },
      { title: 'Odbornost v návaznostech', text: 'Reality, finance a pojištění se potkávají na jednom místě.', tag: 'tým' },
      { title: 'Bez tlaku', text: 'Nezačínáme produktem, ale tím, co klient skutečně potřebuje vyřešit.', tag: 'férovost' },
      { title: 'Průběžná kontrola', text: 'Plán se mění s trhem, sazbami i životní situací.', tag: 'péče' },
      { title: 'Praktické dotažení', text: 'Hlídáme termíny, dokumenty a kroky, které rozhodnutí posouvají dál.', tag: 'realizace' },
    ],
    processEyebrow: 'Jak pracujeme',
    processTitle: 'Od první otázky k použitelnému rozhodnutí',
    processIntro: 'Dobrý výsledek vzniká z přesného pochopení situace, ne z rychlé nabídky.',
    steps: [
      { title: 'Poslechneme si zadání', text: 'Co řešíte, proč právě teď a kde je největší nejistota.' },
      { title: 'Spojíme oblasti', text: 'Najdeme vazby mezi bydlením, rozpočtem, investicemi a ochranou.' },
      { title: 'Navrhneme postup', text: 'Oddělíme urgentní kroky od těch, které mohou počkat.' },
      { title: 'Zůstaneme v kontaktu', text: 'Vracíme se k nastavení, když se změní život nebo trh.' },
    ],
    asideTitle: 'Proč jedna koordinace pomáhá',
    asideText: 'Když každý řeší jen svůj produkt, nikdo nemusí vidět celý dopad. Jeden kontext snižuje riziko protichůdných doporučení.',
    asidePoints: ['méně chaosu', 'lepší návaznosti', 'jasnější odpovědnost'],
    ctaTitle: 'Chcete vědět, jestli dáváme smysl pro vaši situaci?',
    ctaText: 'Napište nám. Krátce probereme, co řešíte, a řekneme, jak bychom postupovali.',
  },
};


type HomeBlockType = 'hero' | 'products' | 'perks' | 'app' | 'quick' | 'faq';

type HomeBlock = {
  id: string;
  type: HomeBlockType;
  enabled: boolean;
};

type VisualEdit = {
  mode: 'text' | 'image';
  value: string;
};

type MediaAsset = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type SeoPageMeta = {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
};

type BlogPost = {
  id: string;
  slug: string;
  slugLocked: boolean;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  publishAt: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
};

const HOME_BLOCKS_STORAGE_KEY = 'cp_home_blocks_v1';
const HOME_CONTENT_STORAGE_KEY = 'cp_home_content_v1';
const GLOBAL_VISUAL_EDITS_STORAGE_KEY = 'cp_global_visual_edits_v1';
const MEDIA_LIBRARY_STORAGE_KEY = 'cp_media_library_v1';
const CMS_AUTH_TOKEN_STORAGE_KEY = 'cp_cms_auth_token_v1';
const CMS_EDITOR_POSITION_STORAGE_KEY = 'cp_live_editor_position_v1';
const CMS_API_BASE = (import.meta.env.VITE_CMS_API_URL as string | undefined)?.trim() || 'http://localhost:3001/website-editor';
const CMS_API_BASE_STORAGE_KEY = 'cp_cms_api_base_v1';
function getCmsApiCandidates(): string[] {
  const fromEnv = [
    (import.meta.env.VITE_CMS_API_URL as string | undefined)?.trim(),
    (import.meta.env.VITE_API_URL as string | undefined)?.trim()
      ? `${String(import.meta.env.VITE_API_URL).trim().replace(/\/+$/, '')}/website-editor`
      : undefined,
    CMS_API_BASE,
    'http://localhost:3001/website-editor',
    'http://127.0.0.1:3001/website-editor',
    'http://localhost:3000/website-editor',
    'http://127.0.0.1:3000/website-editor',
  ].filter((v): v is string => Boolean(v && v.trim()));

  if (typeof window === 'undefined') {
    return Array.from(new Set(fromEnv));
  }

  const host = window.location.hostname || 'localhost';
  const protocol = window.location.protocol || 'http:';
  const runtime = [
    `${protocol}//${host}:3001/website-editor`,
    `${protocol}//${host}:3000/website-editor`,
  ];

  return Array.from(new Set([...fromEnv, ...runtime]));
}

type CmsPersistState = {
  blocks?: HomeBlock[];
  content?: Partial<HomeContent>;
  globalEdits?: Record<string, VisualEdit>;
  mediaLibrary?: MediaAsset[];
  blogPosts?: BlogPost[];
  seoPages?: Record<string, SeoPageMeta>;
  pageSections?: Record<string, unknown>;
  auditLog?: Array<{ id: string; at: string; actor: string; role?: string; action: string; keys: string[] }>;
  updatedAt?: string;
};

function isDataUrl(value: string): boolean {
  return value.trim().toLowerCase().startsWith('data:');
}

function sanitizeMediaLibrary(items: unknown): MediaAsset[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is MediaAsset => {
    if (!item || typeof item !== 'object') return false;
    const candidate = item as Partial<MediaAsset>;
    return (
      typeof candidate.id === 'string'
      && typeof candidate.url === 'string'
      && !isDataUrl(candidate.url)
      && typeof candidate.name === 'string'
      && typeof candidate.createdAt === 'string'
    );
  });
}

const defaultBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'jak-prodat-nemovitost-bez-chyb',
    slugLocked: true,
    title: 'Jak prodat nemovitost bez chyb',
    excerpt: 'Praktický postup od odhadu ceny po podpis kupní smlouvy.',
    content: 'Při prodeji nemovitosti je klíčová příprava, správná cenotvorba a kvalitní prezentace. V článku najdete krokový postup, který pomáhá zrychlit prodej a minimalizovat rizika.',
    coverImage: '/wp/AdobeStock_301062516.jpg',
    category: 'Bydlení a reality',
    author: 'Redakce Český Partner',
    status: 'published',
    publishAt: '2026-02-20T08:00',
    seoTitle: 'Jak prodat nemovitost bez chyb | Český Partner',
    seoDescription: 'Krokový návod na bezpečný a efektivní prodej nemovitosti.',
    publishedAt: '2026-02-20',
  },
];

const defaultSeoPages: Record<string, SeoPageMeta> = {
  '/': {
    title: 'Český Partner | Finance, reality a online projekty',
    description: 'Český Partner propojuje reality, finance a online projekty do jednoho funkčního řešení.',
  },
  '/bydleni-a-reality': {
    title: 'Bydlení a reality | Český Partner',
    description: 'Prodej, nákup, odhady a správa nemovitostí s kompletním realitním servisem.',
  },
  '/produkty/bezny-ucet': {
    title: 'Běžný účet | Český Partner',
    description: 'Běžný účet s moderní správou financí, plateb a digitálních služeb.',
  },
  '/kontakty': {
    title: 'Kontakty | Český Partner',
    description: 'Kontaktujte Český Partner. Telefon, e-mail, online chat i kontaktní formulář.',
  },
  '/o-nas': {
    title: 'O nás | Český Partner',
    description: 'Poznejte tým Český Partner a náš přístup k financím, realitám a digitálním službám.',
  },
  '/blog': {
    title: 'Blog a poradna | Český Partner',
    description: 'Články, návody a tipy z realit, financí a online projektů.',
  },
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeBlogPost(post: Partial<BlogPost>): BlogPost {
  const title = post.title ?? 'Nový článek';
  const slug = post.slug ?? slugify(title) ?? `clanek-${Date.now()}`;
  const publishAt = post.publishAt ?? new Date().toISOString().slice(0, 16);
  return {
    id: post.id ?? `post-${Date.now()}`,
    slug,
    slugLocked: post.slugLocked ?? true,
    title,
    excerpt: post.excerpt ?? title,
    content: post.content ?? '',
    coverImage: post.coverImage ?? '/wp/AdobeStock_301062516.jpg',
    category: post.category ?? 'Obecné',
    author: post.author ?? 'Redakce Český Partner',
    status: post.status ?? 'draft',
    publishAt,
    seoTitle: post.seoTitle ?? `${title} | Český Partner`,
    seoDescription: post.seoDescription ?? stripHtml(post.excerpt ?? title),
    publishedAt: post.publishedAt ?? publishAt.slice(0, 10),
  };
}

function isPublishedNow(post: BlogPost): boolean {
  if (post.status === 'draft') return false;
  const now = Date.now();
  const publishTs = new Date(post.publishAt || `${post.publishedAt}T00:00`).getTime();
  if (Number.isNaN(publishTs)) return post.status === 'published';
  return post.status === 'published' || (post.status === 'scheduled' && publishTs <= now);
}

const homeBlockLabels: Record<HomeBlockType, string> = {
  hero: 'Hero banner',
  products: 'Co s námi řešíte',
  perks: 'Úvodní text',
  app: 'Produktový banner',
  quick: 'Rychlé odkazy',
  faq: 'FAQ',
};

const defaultHomeBlocks: HomeBlock[] = [
  { id: 'hero-default', type: 'hero', enabled: true },
  { id: 'products-default', type: 'products', enabled: true },
  { id: 'perks-default', type: 'perks', enabled: true },
  { id: 'app-default', type: 'app', enabled: true },
  { id: 'quick-default', type: 'quick', enabled: true },
  { id: 'faq-default', type: 'faq', enabled: true },
];

function loadHomeBlocks(): HomeBlock[] {
  if (typeof window === 'undefined') return defaultHomeBlocks;
  try {
    const raw = window.localStorage.getItem(HOME_BLOCKS_STORAGE_KEY);
    if (!raw) return defaultHomeBlocks;
    const parsed = JSON.parse(raw) as HomeBlock[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultHomeBlocks;
    const isValid = parsed.every((item) => (
      item
      && typeof item.id === 'string'
      && typeof item.enabled === 'boolean'
      && ['hero', 'products', 'perks', 'app', 'quick', 'faq'].includes(item.type)
    ));
    return isValid ? parsed : defaultHomeBlocks;
  } catch {
    return defaultHomeBlocks;
  }
}

function loadHomeContent(): HomeContent {
  if (typeof window === 'undefined') return defaultHomeContent;
  try {
    const raw = window.localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
    if (!raw) return defaultHomeContent;
    const parsed = JSON.parse(raw) as Partial<HomeContent>;
    return { ...defaultHomeContent, ...parsed };
  } catch {
    return defaultHomeContent;
  }
}

function hasStoredHomeBlocks(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(HOME_BLOCKS_STORAGE_KEY);
    return Boolean(raw && raw.trim());
  } catch {
    return false;
  }
}

function hasStoredHomeContent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(HOME_CONTENT_STORAGE_KEY);
    return Boolean(raw && raw.trim());
  } catch {
    return false;
  }
}

async function fetchCmsState(): Promise<CmsPersistState | null> {
  for (const base of getCmsBaseCandidates()) {
    try {
      let res = await fetch(base, { method: 'GET', headers: { ...buildAuthHeaders() } });
      if ((res.status === 401 || res.status === 403) && loadCmsAuthToken()) {
        window.localStorage.removeItem(CMS_AUTH_TOKEN_STORAGE_KEY);
        res = await fetch(base, { method: 'GET' });
      }
      if (!res.ok) continue;
      const data = (await res.json()) as CmsPersistState;
      if (!data || typeof data !== 'object') continue;
      persistCmsBase(base);
      return data;
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function patchCmsState(partial: Partial<CmsPersistState>): Promise<boolean> {
  for (const base of getCmsBaseCandidates()) {
    try {
      let res = await fetch(base, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', ...buildAuthHeaders() },
        body: JSON.stringify(partial),
      });
      if ((res.status === 401 || res.status === 403) && loadCmsAuthToken()) {
        window.localStorage.removeItem(CMS_AUTH_TOKEN_STORAGE_KEY);
        res = await fetch(base, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(partial),
        });
      }
      if (res.ok) {
        persistCmsBase(base);
        return true;
      }
    } catch {
      // try next candidate
    }
  }
  return false;
}

type CmsMediaUploadResult =
  | { ok: true; url: string; name: string }
  | { ok: false; reason: string; status?: number };

async function readUploadError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();
    if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();
  } catch {
    // ignore and fallback to status text
  }
  return res.statusText || 'Neznama chyba serveru';
}

async function uploadCmsMedia(file: File): Promise<CmsMediaUploadResult> {
  const resized = await resizeImageFile(file);
  const prepared = withSafeUploadName(resized);
  let lastError = 'Neznama chyba uploadu';
  let lastStatus: number | undefined;
  for (const base of getCmsBaseCandidates()) {
    try {
      const form = new FormData();
      form.append('file', prepared);
      let res = await fetch(`${base}/media/upload`, {
        method: 'POST',
        headers: { ...buildAuthHeaders() },
        body: form,
      });
      if ((res.status === 401 || res.status === 403) && loadCmsAuthToken()) {
        window.localStorage.removeItem(CMS_AUTH_TOKEN_STORAGE_KEY);
        const fallbackForm = new FormData();
        fallbackForm.append('file', prepared);
        res = await fetch(`${base}/media/upload`, {
          method: 'POST',
          body: fallbackForm,
        });
      }
      if (!res.ok) {
        lastStatus = res.status;
        lastError = await readUploadError(res);
        continue;
      }
      const data = (await res.json()) as { url?: string; name?: string };
      if (!data?.url) {
        lastError = 'Server vratil prazdnou URL souboru';
        continue;
      }
      const absoluteBase = data.url.startsWith('http') ? data.url : `${toCmsRoot(base)}${data.url}`;
      const absolute = await resolveRenderableImageUrl(absoluteBase);
      persistCmsBase(base);
      return { ok: true, url: absolute, name: data.name || prepared.name || file.name };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Sitova chyba spojeni';
    }
  }
  return { ok: false, reason: lastError, status: lastStatus };
}

async function cmsLogin(email: string, password: string): Promise<{ token: string; role: string; email: string } | null> {
  for (const base of getCmsBaseCandidates()) {
    try {
      const root = toCmsRoot(base);
      const res = await fetch(`${root}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { accessToken?: string; user?: { role?: string; email?: string } };
      if (!data?.accessToken || !data?.user?.role) continue;
      persistCmsBase(base);
      return { token: data.accessToken, role: data.user.role, email: data.user.email || email };
    } catch {
      // try next candidate
    }
  }
  return null;
}

function SeoManager({ blogPosts, seoPages }: { blogPosts: BlogPost[]; seoPages: Record<string, SeoPageMeta> }) {
  const location = useLocation();

  useEffect(() => {
    const pages = { ...defaultSeoPages, ...seoPages };

    const fallback = pages['/'];
    const path = location.pathname;
    let seo: SeoPageMeta = pages[path] ?? fallback;
    let ogImage = seo?.ogImage || '';
    let canonical = seo?.canonical || '';

    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '').trim();
      const post = blogPosts
        .map((item) => normalizeBlogPost(item))
        .find((item) => item.slug === slug && isPublishedNow(item));
      if (post) {
        seo = {
          title: post.seoTitle || `${post.title} | Český Partner`,
          description: post.seoDescription || stripHtml(post.excerpt),
          ogImage: post.coverImage,
          canonical: `${window.location.origin}/blog/${post.slug}`,
        };
        ogImage = post.coverImage;
        canonical = `${window.location.origin}/blog/${post.slug}`;
      } else {
        seo = {
          title: 'Článek | Český Partner',
          description: 'Obsah článku z blogu Český Partner.',
        };
      }
    }

    document.title = seo.title;

    const upsertMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) tag.setAttribute('property', name);
        else tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    upsertMeta('description', seo.description);
    upsertMeta('og:title', seo.title, true);
    upsertMeta('og:description', seo.description, true);
    upsertMeta('og:type', 'website', true);
    if (ogImage) upsertMeta('og:image', ogImage, true);

    let canonicalTag = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical || `${window.location.origin}${path}`);
  }, [location.pathname, blogPosts, seoPages]);

  return null;
}

function getElementPath(element: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children).filter((child) => child.tagName === current!.tagName);
    const index = siblings.indexOf(current) + 1;
    segments.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return `body > ${segments.join(' > ')}`;
}

function loadGlobalVisualEdits(): Record<string, VisualEdit> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(GLOBAL_VISUAL_EDITS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, VisualEdit>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadMediaLibrary(): MediaAsset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MEDIA_LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeMediaLibrary(parsed);
  } catch {
    return [];
  }
}

function loadCmsAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(CMS_AUTH_TOKEN_STORAGE_KEY) || '';
}

function buildAuthHeaders(): Record<string, string> {
  const token = loadCmsAuthToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

const MAX_UPLOAD_BASE_LENGTH = 30;
const MAX_MEDIA_LABEL_LENGTH = 30;

function truncateMediaLabel(value: string, max = MAX_MEDIA_LABEL_LENGTH): string {
  const clean = value.trim();
  if (!clean) return '';
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(1, max - 3))}...`;
}

function buildSafeUploadName(originalName: string, forcedExt?: string): string {
  const extFromName = (originalName.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
  const extCandidate = (forcedExt || extFromName || '.jpg').toLowerCase();
  const ext = /^[.](png|jpe?g|webp|gif|svg)$/i.test(extCandidate) ? extCandidate : '.jpg';
  const rawBase = originalName.replace(/\.[^.]+$/, '').normalize('NFKD');
  const normalizedBase = rawBase
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  const base = (normalizedBase || 'image').slice(0, MAX_UPLOAD_BASE_LENGTH);
  return `${base}-${Date.now().toString(36)}${ext}`;
}

function withSafeUploadName(file: File, forcedExt?: string): File {
  const safeName = buildSafeUploadName(file.name || 'image', forcedExt);
  if (file.name === safeName) return file;
  return new File([file], safeName, { type: file.type, lastModified: Date.now() });
}

async function resizeImageFile(file: File, maxSide = 2200, quality = 0.88): Promise<File> {
  if (!file.type.startsWith('image/')) return withSafeUploadName(file);
  try {
    const bitmap = await createImageBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;
    const ratio = Math.min(1, maxSide / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * ratio));
    const targetH = Math.max(1, Math.round(height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return withSafeUploadName(file);
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), outputType, quality),
    );
    if (!blob) return withSafeUploadName(file);
    const ext = outputType === 'image/png' ? '.png' : '.jpg';
    const nextName = buildSafeUploadName(file.name, ext);
    return new File([blob], nextName, { type: outputType, lastModified: Date.now() });
  } catch {
    return withSafeUploadName(file);
  }
}

function loadPreferredCmsBase(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CMS_API_BASE_STORAGE_KEY);
}

function getCmsBaseCandidates(): string[] {
  const allCandidates = getCmsApiCandidates();
  const preferred = loadPreferredCmsBase();
  if (!preferred) return allCandidates;
  return [preferred, ...allCandidates.filter((c) => c !== preferred)];
}

function persistCmsBase(base: string): void {
  safeSetLocalStorage(CMS_API_BASE_STORAGE_KEY, base);
}

function toCmsRoot(base: string): string {
  return base.replace(/\/website-editor\/?$/, '');
}

function canLoadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  });
}

async function resolveRenderableImageUrl(url: string): Promise<string> {
  if (await canLoadImage(url)) return url;
  try {
    const u = new URL(url);
    const variants: string[] = [];
    if (u.port === '3000') {
      const v = new URL(url);
      v.port = '3001';
      variants.push(v.toString());
    } else if (u.port === '3001') {
      const v = new URL(url);
      v.port = '3000';
      variants.push(v.toString());
    }
    if (typeof window !== 'undefined') {
      const v = new URL(url);
      v.protocol = window.location.protocol;
      v.hostname = window.location.hostname;
      variants.push(v.toString());
    }
    for (const candidate of variants) {
      if (await canLoadImage(candidate)) return candidate;
    }
  } catch {
    // keep original url
  }
  return url;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Nepodařilo se načíst obrázek.'));
    };
    reader.onerror = () => reject(new Error('Nepodařilo se načíst obrázek.'));
    reader.readAsDataURL(file);
  });
}

async function pickLocalImage(): Promise<string | null> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  return new Promise((resolve) => {
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        resolve(dataUrl);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}

function RichTextEditor({
  value,
  onChange,
  height = 260,
  placeholder = '',
  onImageUploaded,
  defaultMode = 'rich',
}: {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
  onImageUploaded?: (url: string, name?: string) => void;
  defaultMode?: 'rich' | 'plain';
}) {
  const [mode, setMode] = useState<'rich' | 'plain'>(defaultMode);
  const [loadError, setLoadError] = useState(false);
  const [TinyEditor, setTinyEditor] = useState<any>(null);
  const tinyApiKey = (import.meta.env.VITE_TINYMCE_API_KEY as string | undefined)?.trim();
  const tinyScriptSrc = tinyApiKey
    ? `https://cdn.tiny.cloud/1/${tinyApiKey}/tinymce/7/tinymce.min.js`
    : 'https://cdn.tiny.cloud/1/no-api-key/tinymce/7/tinymce.min.js';

  useEffect(() => {
    if (mode !== 'rich' || TinyEditor || loadError) return;
    let alive = true;
    import('@tinymce/tinymce-react')
      .then((mod) => {
        if (alive) setTinyEditor(() => mod.Editor);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [mode, TinyEditor, loadError]);

  if (mode === 'plain') {
    return (
      <div className="rich-editor-wrap">
        <div className="rich-editor-toggle">
          <button type="button" className={mode === 'plain' ? 'is-active' : ''} onClick={() => setMode('plain')}>Textarea</button>
          <button type="button" className={mode === 'rich' ? 'is-active' : ''} onClick={() => setMode('rich')}>Rich editor</button>
        </div>
        <textarea
          rows={Math.max(6, Math.round(height / 32))}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  }

  if (!TinyEditor) {
    return (
      <div className="rich-editor-wrap">
        <div className="rich-editor-toggle">
          <button type="button" className={mode === 'plain' ? 'is-active' : ''} onClick={() => setMode('plain')}>Textarea</button>
          <button type="button" className={mode === 'rich' ? 'is-active' : ''} onClick={() => setMode('rich')}>Rich editor</button>
        </div>
        <div className="cms-auth-box">
          <p>{loadError ? 'Rich editor se nepodařilo načíst.' : 'Načítám rich editor...'}</p>
          {loadError && (
            <button type="button" onClick={() => { setLoadError(false); setMode('plain'); }}>
              Použít textarea
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rich-editor-wrap">
      <div className="rich-editor-toggle">
        <button type="button" onClick={() => setMode('plain')}>Textarea</button>
        <button type="button" className="is-active" onClick={() => setMode('rich')}>Rich editor</button>
      </div>
      <TinyEditor
        tinymceScriptSrc={tinyScriptSrc}
        value={value}
        onEditorChange={(next) => onChange(next)}
        init={{
          height,
          menubar: 'file edit view insert format tools table help',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'searchreplace', 'visualblocks', 'code', 'fullscreen', 'media', 'table', 'help', 'wordcount',
          ],
          toolbar:
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | ' +
            'link image media table | removeformat code fullscreen',
          toolbar_mode: 'sliding',
          font_family_formats:
            'Arial=arial,helvetica,sans-serif; Verdana=verdana,geneva,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif; ' +
            'Trebuchet MS=trebuchet ms,geneva,sans-serif; Times New Roman=times new roman,times,serif; ' +
            'Georgia=georgia,palatino,serif; Garamond=garamond,serif; Courier New=courier new,courier,monospace; ' +
            'Roboto=roboto,sans-serif; Montserrat=montserrat,sans-serif; Open Sans=open sans,sans-serif; Lato=lato,sans-serif;',
          font_size_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt 48pt 60pt 72pt',
          placeholder,
          branding: false,
          promotion: false,
          statusbar: false,
          elementpath: false,
          image_advtab: true,
          automatic_uploads: true,
          convert_urls: false,
          images_upload_handler: async (blobInfo) => {
            const blob = blobInfo.blob();
            const base64 = blobInfo.base64();
            const dataUrl = `data:${blob.type};base64,${base64}`;
            onImageUploaded?.(dataUrl, blobInfo.filename());
            return dataUrl;
          },
          file_picker_types: 'image',
          file_picker_callback: (callback, _value, meta) => {
            if (meta.filetype !== 'image') return;
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const tinymceRef = (window as unknown as { tinymce?: any }).tinymce;
                const base64 = String(reader.result).split(',')[1] || '';
                const dataUrl = String(reader.result);
                const id = `blobid${Date.now()}`;
                const cache = tinymceRef?.activeEditor?.editorUpload?.blobCache;
                if (cache) {
                  const blobInfo = cache.create(id, file, base64);
                  cache.add(blobInfo);
                  onImageUploaded?.(dataUrl, file.name);
                  callback(blobInfo.blobUri(), { title: file.name });
                } else {
                  onImageUploaded?.(dataUrl, file.name);
                  callback(dataUrl, { title: file.name });
                }
              };
              reader.readAsDataURL(file);
            };
            input.click();
          },
          content_style:
            'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif; font-size: 15px; line-height: 1.5; }',
        }}
      />
    </div>
  );
}

function GlobalVisualEditor({
  blogPosts,
  onChangeBlogPosts,
  blogSaveState,
  seoPages,
  onChangeSeoPages,
  auditLog,
}: {
  blogPosts: BlogPost[];
  onChangeBlogPosts: (posts: BlogPost[]) => void;
  blogSaveState: SaveState;
  seoPages: Record<string, SeoPageMeta>;
  onChangeSeoPages: (next: Record<string, SeoPageMeta>) => void;
  auditLog: Array<{ id: string; at: string; actor: string; role?: string; action: string; keys: string[] }>;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });
  const dragHoldTimerRef = useRef<number | null>(null);
  const suppressToggleClickRef = useRef(false);
  const [editorPosition, setEditorPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'text' | 'image'>('text');
  const [selectedValue, setSelectedValue] = useState('');
  const selectedElementRef = useRef<HTMLElement | null>(null);
  const [edits, setEdits] = useState<Record<string, VisualEdit>>(loadGlobalVisualEdits);
  const editsRef = useRef<Record<string, VisualEdit>>(edits);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'blog' | 'media' | 'seo' | 'auth'>('visual');
  const [visualMode, setVisualMode] = useState<'select' | 'edit'>('select');
  const [editHistory, setEditHistory] = useState<Array<Record<string, VisualEdit>>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [globalSaveState, setGlobalSaveState] = useState<SaveState>('idle');
  const [mediaSaveState, setMediaSaveState] = useState<SaveState>('idle');
  const [seoSaveState, setSeoSaveState] = useState<SaveState>('idle');
  const [pendingGlobalSync, setPendingGlobalSync] = useState(false);
  const [globalSavedAt, setGlobalSavedAt] = useState('');
  const [globalNotice, setGlobalNotice] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [actionNoticeState, setActionNoticeState] = useState<SaveState>('idle');
  const actionNoticeTimerRef = useRef<number | null>(null);
  const globalEditsDirtyRef = useRef(false);
  const mediaLibraryDirtyRef = useRef(false);
  const seoDirtyRef = useRef(false);

  const showToast = (message: string, state: SaveState = 'saved', timeout = 3500) => {
    setActionNotice(message);
    setActionNoticeState(state);
    if (actionNoticeTimerRef.current) window.clearTimeout(actionNoticeTimerRef.current);
    actionNoticeTimerRef.current = window.setTimeout(() => {
      setActionNotice('');
      setActionNoticeState('idle');
    }, timeout);
  };
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>(loadMediaLibrary);
  const mediaLibraryRef = useRef<MediaAsset[]>(mediaLibrary);
  const [cmsToken, setCmsToken] = useState(loadCmsAuthToken);
  const [cmsIdentity, setCmsIdentity] = useState<{ email: string; role: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editorError, setEditorError] = useState('');
  const [blogFilter, setBlogFilter] = useState<'all' | BlogPost['status']>('all');
  const [blogSearch, setBlogSearch] = useState('');
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);
  const [selectedSeoPath, setSelectedSeoPath] = useState('/');
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogImage, setNewBlogImage] = useState('/wp/AdobeStock_301062516.jpg');
  const [newBlogCategory, setNewBlogCategory] = useState('Obecné');
  const [newBlogAuthor, setNewBlogAuthor] = useState('Redakce Český Partner');
  const [newBlogStatus, setNewBlogStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [newBlogPublishAt, setNewBlogPublishAt] = useState(new Date().toISOString().slice(0, 16));
  const [newBlogSeoTitle, setNewBlogSeoTitle] = useState('');
  const [newBlogSeoDescription, setNewBlogSeoDescription] = useState('');

  useEffect(() => {
    editsRef.current = edits;
  }, [edits]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(CMS_EDITOR_POSITION_STORAGE_KEY);
  }, []);

  const clampEditorPosition = useCallback((x: number, y: number): { x: number; y: number } => {
    if (typeof window === 'undefined') return { x, y };
    const rect = editorRootRef.current?.getBoundingClientRect();
    const panelWidth = rect?.width ?? (open ? 420 : 180);
    const panelHeight = rect?.height ?? (open ? 520 : 60);
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - panelWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - panelHeight - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  }, [open]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;
      const next = clampEditorPosition(event.clientX - dragRef.current.offsetX, event.clientY - dragRef.current.offsetY);
      setEditorPosition(next);
    };
    const onUp = () => {
      dragRef.current.active = false;
      if (dragHoldTimerRef.current) {
        window.clearTimeout(dragHoldTimerRef.current);
        dragHoldTimerRef.current = null;
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [clampEditorPosition]);

  useEffect(() => {
    const onResize = () => {
      setEditorPosition((prev) => (prev ? clampEditorPosition(prev.x, prev.y) : prev));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampEditorPosition]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setEditorPosition((prev) => (prev ? clampEditorPosition(prev.x, prev.y) : prev));
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, activeTab, clampEditorPosition]);

  useEffect(() => {
    mediaLibraryRef.current = mediaLibrary;
  }, [mediaLibrary]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remote = await fetchCmsState();
      if (!alive) return;
      if (remote?.globalEdits && typeof remote.globalEdits === 'object') {
        const remoteEdits = remote.globalEdits as Record<string, VisualEdit>;
        setEdits((localEdits) => {
          // Backend is the source of truth after refresh; local cache fills only missing keys.
          const mergedEdits = { ...localEdits, ...remoteEdits };
          editsRef.current = mergedEdits;
          setEditHistory([mergedEdits]);
          setHistoryIndex(0);
          return mergedEdits;
        });
      }
      if (Array.isArray(remote?.mediaLibrary)) {
        setMediaLibrary(sanitizeMediaLibrary(remote.mediaLibrary));
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!cmsToken) return;
    try {
      const payloadRaw = atob(cmsToken.split('.')[1] || '');
      const payload = JSON.parse(payloadRaw) as { email?: string; role?: string };
      setCmsIdentity({
        email: payload.email || 'uzivatel',
        role: payload.role || 'user',
      });
    } catch {
      setCmsIdentity(null);
    }
  }, [cmsToken]);

  useEffect(() => {
    if (!ready || !globalEditsDirtyRef.current) return;
    globalEditsDirtyRef.current = false;
    setGlobalSaveState('saving');
    const localOk = safeSetLocalStorage(GLOBAL_VISUAL_EDITS_STORAGE_KEY, JSON.stringify(edits));
    if (!localOk) {
      setEditorError('Lokální úložiště je plné. Změny ukládám pouze na backend.');
    }
    const t = window.setTimeout(() => {
      patchCmsState({ globalEdits: edits }).then((ok) => {
        if (ok) {
          setPendingGlobalSync(false);
          setGlobalSaveState('saved');
          const now = new Date().toLocaleTimeString('cs-CZ');
          setGlobalSavedAt(now);
          setGlobalNotice(`Změny uloženy (${now})`);
          showToast(`Uloženo (${now})`, 'saved');
        } else if (!localOk) {
          setPendingGlobalSync(true);
          setGlobalSaveState('error');
          setGlobalNotice('Uložení selhalo (lokálně i na backendu).');
          showToast('Uložení selhalo', 'error');
        } else {
          setPendingGlobalSync(true);
          setGlobalSaveState('error');
          const now = new Date().toLocaleTimeString('cs-CZ');
          setGlobalSavedAt(now);
          setGlobalNotice(`Uloženo lokálně (${now}), čeká na backend.`);
          showToast(`Uloženo lokálně (${now})`, 'saving');
        }
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [edits, ready]);

  useEffect(() => {
    if (!ready || !pendingGlobalSync) return;
    const t = window.setInterval(() => {
      patchCmsState({ globalEdits: edits }).then((ok) => {
        if (!ok) return;
        setPendingGlobalSync(false);
        setGlobalSaveState('saved');
        const now = new Date().toLocaleTimeString('cs-CZ');
        setGlobalSavedAt(now);
        setGlobalNotice(`Synchronizováno s backendem (${now})`);
        showToast(`Synchronizováno (${now})`, 'saved');
      });
    }, 4000);
    return () => window.clearInterval(t);
  }, [edits, pendingGlobalSync, ready]);

  useEffect(() => () => {
    if (actionNoticeTimerRef.current) window.clearTimeout(actionNoticeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!ready || !mediaLibraryDirtyRef.current) return;
    mediaLibraryDirtyRef.current = false;
    setMediaSaveState('saving');
    const sanitizedMediaLibrary = sanitizeMediaLibrary(mediaLibrary);
    if (sanitizedMediaLibrary.length !== mediaLibrary.length) {
      setMediaLibrary(sanitizedMediaLibrary);
      return;
    }
    const localOk = safeSetLocalStorage(MEDIA_LIBRARY_STORAGE_KEY, JSON.stringify(sanitizedMediaLibrary));
    if (!localOk) {
      setEditorError('Mediální knihovna překročila limit localStorage. Změny ukládám pouze na backend.');
    }
    const t = window.setTimeout(() => {
      patchCmsState({ mediaLibrary: sanitizedMediaLibrary }).then((ok) => {
        if (ok) setMediaSaveState('saved');
        else setMediaSaveState(localOk ? 'error' : 'saved');
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [mediaLibrary, ready]);

  useEffect(() => {
    if (!ready || !seoDirtyRef.current) return;
    seoDirtyRef.current = false;
    setSeoSaveState('saving');
    const t = window.setTimeout(() => {
      patchCmsState({ seoPages }).then((ok) => {
        setSeoSaveState(ok ? 'saved' : 'error');
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [seoPages, ready]);

  const applyEditsToDom = useCallback(() => {
    const entries = Object.entries(edits);
    for (const [path, edit] of entries) {
      const node = document.querySelector(path);
      if (!node) continue;
      if (node.closest('.hero.hero-bcas')) continue;
      if (edit.mode === 'image' && node instanceof HTMLImageElement) {
        const currentSrcAttr = node.getAttribute('src') || '';
        if (currentSrcAttr !== edit.value) {
          node.setAttribute('src', edit.value);
        }
      } else if (edit.mode === 'text' && node instanceof HTMLElement) {
        if (node.innerHTML !== edit.value) {
          node.innerHTML = edit.value;
        }
      }
    }
  }, [edits]);

  useEffect(() => {
    applyEditsToDom();
    // Re-apply a few times to catch async rerenders after navigation/data hydration,
    // without keeping a long-running DOM observer.
    let cancelled = false;
    const timers: number[] = [];
    [60, 220, 500, 900].forEach((delay) => {
      const id = window.setTimeout(() => {
        if (!cancelled) applyEditsToDom();
      }, delay);
      timers.push(id);
    });
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [applyEditsToDom, location.pathname]);

  useEffect(() => {
    if (!selectedPath) return;
    const node = document.querySelector(selectedPath);
    if (!node) return;
    if (selectedMode === 'image' && node instanceof HTMLImageElement) {
      node.src = selectedValue;
      return;
    }
    if (selectedMode === 'text' && node instanceof HTMLElement) {
      node.innerHTML = selectedValue;
    }
  }, [selectedPath, selectedMode, selectedValue]);

  useEffect(() => {
    if (!open || activeTab !== 'visual' || visualMode !== 'select') return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('.cms-global-editor, .tox, .tox-tinymce-aux')) return;
      if (
        target.isContentEditable
        || ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'BUTTON', 'LABEL'].includes(target.tagName)
      ) {
        return;
      }

      const editable = target.closest('h1,h2,h3,h4,h5,h6,p,a,span,li,summary,strong,button,img') as HTMLElement | null;
      if (!editable) return;

      event.preventDefault();
      event.stopPropagation();

      const path = getElementPath(editable);
      const isImage = editable.tagName.toLowerCase() === 'img';
      const mode = isImage ? 'image' : 'text';
      const value = isImage ? ((editable as HTMLImageElement).src || '') : (editable.innerHTML || '');

      selectedElementRef.current = editable;
      setSelectedPath(path);
      setSelectedMode(mode);
      setSelectedValue(value);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [open, activeTab, visualMode]);

  useEffect(() => {
    setSelectedPath(null);
    setSelectedValue('');
    selectedElementRef.current = null;
  }, [location.pathname]);

  const saveSelected = async () => {
    if (!selectedPath) return;
    const now = new Date().toLocaleTimeString('cs-CZ');
    if (selectedMode === 'image') {
      const heroImageField = resolveSelectedHeroImageField();
      if (heroImageField) {
        const node = selectedElementRef.current ?? document.querySelector(selectedPath);
        if (node instanceof HTMLImageElement) {
          node.setAttribute('src', selectedValue);
          node.src = selectedValue;
        }
        setSelectedValue(selectedValue);
        const contentSaved = await persistSelectedHeroImageToHomeContent(selectedValue);
        if (!contentSaved) {
          setEditorError('Uložení do homepage obsahu selhalo. Změna může po refreshi zmizet.');
        } else {
          await clearGlobalEditForPath(selectedPath);
          setEditorError('');
        }
      } else {
        applyImageValueNow(selectedValue);
      }
      showToast(`Změna uložena (${now})`, 'saved');
      return;
    }
    const heroTextField = resolveSelectedHeroTextField();
    if (heroTextField) {
      const node = selectedElementRef.current ?? document.querySelector(selectedPath);
      if (node instanceof HTMLElement) {
        node.innerHTML = selectedValue;
      }
      setSelectedValue(selectedValue);
      const textSaved = await persistSelectedHeroTextToHomeContent(selectedValue);
      if (!textSaved) {
        setEditorError('Uložení hero textu selhalo. Změna může po refreshi zmizet.');
      } else {
        await clearGlobalEditForPath(selectedPath);
        setEditorError('');
      }
      showToast(`Změna uložena (${now})`, 'saved');
      return;
    }
    const node = selectedElementRef.current ?? document.querySelector(selectedPath);
    if (node instanceof HTMLElement) {
      node.innerHTML = selectedValue;
    }
    saveSelectedImmediate(selectedValue);
    showToast(`Změna uložena (${now})`, 'saved');
  };

  const saveSelectedImmediate = (value: string) => {
    if (!selectedPath) return;
    const nextMode = selectedMode;
    setSelectedValue(value);
    globalEditsDirtyRef.current = true;
    setEdits((prev) => {
      const next = {
        ...prev,
        [selectedPath]: { mode: nextMode, value },
      };
      editsRef.current = next;
      setEditHistory((history) => {
        const trimmed = history.slice(0, historyIndex + 1);
        return [...trimmed, next].slice(-100);
      });
      setHistoryIndex((idx) => Math.min(idx + 1, 99));
      return next;
    });
  };

  const applyImageValueNow = (value: string) => {
    if (!selectedPath) return;
    const node = selectedElementRef.current ?? document.querySelector(selectedPath);
    if (node instanceof HTMLImageElement) {
      node.src = value;
      node.setAttribute('src', value);
    }
    saveSelectedImmediate(value);
  };

  const clearSelected = () => {
    if (!selectedPath) return;
    globalEditsDirtyRef.current = true;
    setEdits((prev) => {
      const next = { ...prev };
      delete next[selectedPath];
      editsRef.current = next;
      setEditHistory((history) => {
        const trimmed = history.slice(0, historyIndex + 1);
        return [...trimmed, next].slice(-100);
      });
      setHistoryIndex((idx) => Math.min(idx + 1, 99));
      return next;
    });
  };

  const clearAll = () => {
    globalEditsDirtyRef.current = true;
    editsRef.current = {};
    setEdits({});
    setEditHistory((history) => {
      const trimmed = history.slice(0, historyIndex + 1);
      return [...trimmed, {}].slice(-100);
    });
    setHistoryIndex((idx) => Math.min(idx + 1, 99));
  };

  const undoEdits = () => {
    if (historyIndex <= 0) return;
    globalEditsDirtyRef.current = true;
    const nextIndex = historyIndex - 1;
    editsRef.current = editHistory[nextIndex] || {};
    setHistoryIndex(nextIndex);
    setEdits(editHistory[nextIndex] || {});
  };

  const redoEdits = () => {
    if (historyIndex < 0 || historyIndex >= editHistory.length - 1) return;
    globalEditsDirtyRef.current = true;
    const nextIndex = historyIndex + 1;
    editsRef.current = editHistory[nextIndex] || edits;
    setHistoryIndex(nextIndex);
    setEdits(editHistory[nextIndex] || edits);
  };

  const addBlogPost = () => {
    const title = newBlogTitle.trim();
    if (!title) return;
    const slugBase = slugify(title) || `clanek-${Date.now()}`;
    const used = new Set(blogPosts.map((p) => p.slug));
    let slug = slugBase;
    let i = 2;
    while (used.has(slug)) {
      slug = `${slugBase}-${i}`;
      i += 1;
    }
    const post = normalizeBlogPost({
      id: `post-${Date.now()}`,
      slug,
      title,
      excerpt: newBlogExcerpt.trim() || title,
      content: newBlogContent.trim() || 'Doplňte obsah článku.',
      coverImage: newBlogImage.trim() || '/wp/AdobeStock_301062516.jpg',
      category: newBlogCategory.trim() || 'Obecné',
      author: newBlogAuthor.trim() || 'Redakce Český Partner',
      status: newBlogStatus,
      publishAt: newBlogPublishAt,
      seoTitle: newBlogSeoTitle.trim() || `${title} | Český Partner`,
      seoDescription: newBlogSeoDescription.trim() || stripHtml(newBlogExcerpt.trim() || title),
      publishedAt: (newBlogPublishAt || new Date().toISOString().slice(0, 16)).slice(0, 10),
    });
    onChangeBlogPosts([post, ...blogPosts]);
    setNewBlogTitle('');
    setNewBlogExcerpt('');
    setNewBlogContent('');
    setNewBlogCategory('Obecné');
    setNewBlogAuthor('Redakce Český Partner');
    setNewBlogStatus('draft');
    setNewBlogPublishAt(new Date().toISOString().slice(0, 16));
    setNewBlogSeoTitle('');
    setNewBlogSeoDescription('');
  };

  const updateBlogPost = <K extends keyof BlogPost>(id: string, field: K, value: BlogPost[K]) => {
    onChangeBlogPosts(
      blogPosts.map((post) => {
        if (post.id !== id) return post;
        if (field === 'title') {
          const nextTitle = String(value);
          const nextSlug = post.slugLocked ? (slugify(nextTitle) || post.slug) : post.slug;
          return {
            ...post,
            title: nextTitle,
            slug: nextSlug,
            seoTitle: post.seoTitle.includes(post.title)
              ? `${nextTitle} | Český Partner`
              : post.seoTitle,
          };
        }
        if (field === 'publishAt') {
          const nextPublishAt = String(value);
          return {
            ...post,
            publishAt: nextPublishAt,
            publishedAt: nextPublishAt.slice(0, 10),
          };
        }
        if (field === 'slug') {
          return {
            ...post,
            slug: slugify(String(value)) || post.slug,
          };
        }
        return { ...post, [field]: value };
      }),
    );
  };

  const removeBlogPost = (id: string) => {
    onChangeBlogPosts(blogPosts.filter((post) => post.id !== id));
  };

  const saveStateLabel = (state: SaveState): string => {
    if (state === 'saving') return 'Ukládám...';
    if (state === 'saved') return 'Uloženo';
    if (state === 'error') return 'Chyba ukládání';
    return 'Připraveno';
  };

  const registerMediaAsset = (url: string, preferredName?: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (isDataUrl(cleanUrl)) return;
    const prev = mediaLibraryRef.current;
    if (prev.some((item) => item.url === cleanUrl)) return;
    const nextName = truncateMediaLabel(preferredName || '');
    const next: MediaAsset = {
      id: `media-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: nextName || `Obrázek ${prev.length + 1}`,
      url: cleanUrl,
      createdAt: new Date().toISOString(),
    };
    const nextLibrary = [next, ...prev];
    mediaLibraryRef.current = nextLibrary;
    mediaLibraryDirtyRef.current = true;
    setMediaLibrary(nextLibrary);
  };

  const persistMediaLibraryImmediately = async (forcedMediaLibrary?: MediaAsset[]): Promise<boolean> => {
    const libraryToSave = forcedMediaLibrary ?? mediaLibraryRef.current;
    setMediaSaveState('saving');
    const localOk = safeSetLocalStorage(MEDIA_LIBRARY_STORAGE_KEY, JSON.stringify(libraryToSave));
    const ok = await patchCmsState({ mediaLibrary: libraryToSave });
    if (ok) {
      setMediaSaveState('saved');
      return true;
    }
    setMediaSaveState(localOk ? 'error' : 'saved');
    return localOk;
  };

  const uploadMediaToLibrary = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      let uploadedAtLeastOneToServer = false;
      for (const file of files) {
        const uploaded = await uploadCmsMedia(file);
        if (uploaded.ok) {
          registerMediaAsset(uploaded.url, uploaded.name);
          uploadedAtLeastOneToServer = true;
        } else {
          const resized = await resizeImageFile(file);
          const localPreview = await readFileAsDataUrl(resized);
          registerMediaAsset(localPreview, resized.name || file.name);
          const statusPart = uploaded.status ? `HTTP ${uploaded.status}` : 'bez HTTP statusu';
          setEditorError(
            `Server upload selhal (${statusPart}: ${uploaded.reason}). Vlozen lokalni nahled obrazku (po refreshi nemusi zustat).`,
          );
        }
      }
      if (uploadedAtLeastOneToServer) {
        const saved = await persistMediaLibraryImmediately();
        if (saved) {
          window.location.reload();
          return;
        }
        setEditorError('Upload proběhl, ale okamžité uložení médií selhalo. Stránku nerefreshuji.');
      }
    };
    input.click();
  };

  const removeMediaAsset = (id: string) => {
    mediaLibraryDirtyRef.current = true;
    setMediaLibrary((prev) => prev.filter((item) => item.id !== id));
  };

  const pickAndUploadImage = async (
    options?: { applyToSelectedImage?: boolean },
  ): Promise<{ url: string; name: string } | null> => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    return new Promise((resolve) => {
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);

        try {
          const uploaded = await uploadCmsMedia(file);
          if (uploaded.ok) {
            const shouldApplyToSelectedImage = Boolean(
              options?.applyToSelectedImage && selectedMode === 'image' && selectedPath,
            );
            const targetPath = shouldApplyToSelectedImage ? selectedPath : null;

            if (targetPath) {
              const persisted = await applySelectedImageAndPersist(uploaded.url, true);
              if (!persisted) {
                resolve(null);
                return;
              }
              resolve({ url: uploaded.url, name: uploaded.name });
              return;
            }
            setEditorError('');
            resolve({ url: uploaded.url, name: uploaded.name });
          } else {
            const statusPart = uploaded.status ? `HTTP ${uploaded.status}` : 'bez HTTP statusu';
            setEditorError(
              `Server upload selhal (${statusPart}: ${uploaded.reason}). Vlozen lokalni nahled obrazku (po refreshi nemusi zustat).`,
            );
            resolve(null);
          }
        } catch {
          setEditorError('Nepodařilo se načíst vybraný obrázek.');
          resolve(null);
        }
      };
      input.click();
    });
  };

  const setSeoField = (path: string, field: keyof SeoPageMeta, value: string) => {
    seoDirtyRef.current = true;
    onChangeSeoPages({
      ...seoPages,
      [path]: {
        ...(seoPages[path] || defaultSeoPages[path] || { title: '', description: '' }),
        [field]: value,
      },
    });
  };

  const doLogin = async () => {
    setLoginError('');
    const result = await cmsLogin(loginEmail.trim(), loginPassword);
    if (!result) {
      setLoginError('Přihlášení selhalo. Zkontrolujte údaje.');
      return;
    }
    window.localStorage.setItem(CMS_AUTH_TOKEN_STORAGE_KEY, result.token);
    setCmsToken(result.token);
    setCmsIdentity({ email: result.email, role: result.role });
    setLoginPassword('');
  };

  const doLogout = () => {
    window.localStorage.removeItem(CMS_AUTH_TOKEN_STORAGE_KEY);
    setCmsToken('');
    setCmsIdentity(null);
  };

  const resolveSelectedHeroImageField = (): keyof HomeContent | null => {
    const node = selectedElementRef.current ?? (selectedPath ? document.querySelector(selectedPath) : null);
    if (!(node instanceof HTMLImageElement)) return null;
    const heroTile = node.closest('[class*="phImg"]');
    if (!(heroTile instanceof HTMLElement)) return null;
    const slotClass = Array.from(heroTile.classList).find((name) => /^phImg\d+$/.test(name));
    if (!slotClass) return null;
    const slotIndex = Number(slotClass.replace('phImg', ''));
    if (!Number.isFinite(slotIndex) || slotIndex <= 0) return null;
    const fields: Array<keyof HomeContent> = ['heroImageH1', 'heroImageH2', 'heroImageH3', 'heroImageH4'];
    return fields[(slotIndex - 1) % fields.length];
  };

  const persistSelectedHeroImageToHomeContent = async (value: string): Promise<boolean> => {
    const field = resolveSelectedHeroImageField();
    if (!field) return true;
    const current = loadHomeContent();
    const next: HomeContent = { ...current, [field]: value };
    safeSetLocalStorage(HOME_CONTENT_STORAGE_KEY, JSON.stringify(next));
    return patchCmsState({ content: next });
  };

  const resolveSelectedHeroTextField = (): keyof HomeContent | null => {
    const node = selectedElementRef.current ?? (selectedPath ? document.querySelector(selectedPath) : null);
    if (!(node instanceof HTMLElement)) return null;
    if (node.closest('.hero-bcas-copy .reasons-btn')) return 'heroCtaPrimary';
    if (node.closest('.hero-bcas-copy .outline-btn')) return 'heroCtaSecondary';
    if (node.closest('.hero-bcas-copy > p')) return 'heroDescription';
    if (node.closest('.hero-bcas-copy h2 span')) return 'heroLine2';
    return null;
  };

  const persistSelectedHeroTextToHomeContent = async (value: string): Promise<boolean> => {
    const field = resolveSelectedHeroTextField();
    if (!field) return true;
    const current = loadHomeContent();
    const next: HomeContent = { ...current, [field]: value };
    safeSetLocalStorage(HOME_CONTENT_STORAGE_KEY, JSON.stringify(next));
    return patchCmsState({ content: next });
  };

  const clearGlobalEditForPath = async (path?: string | null): Promise<void> => {
    if (!path) return;
    const next = { ...editsRef.current };
    if (!(path in next)) return;
    delete next[path];
    editsRef.current = next;
    setEdits(next);
    await persistGlobalEditsImmediately(next);
  };

  const applySelectedImageAndPersist = async (value: string, reloadAfterSave = false): Promise<boolean> => {
    const targetPath = selectedPath;
    if (!targetPath) return false;
    const node = document.querySelector(targetPath);
    if (node instanceof HTMLImageElement) {
      node.setAttribute('src', value);
      node.src = value;
    }
    const isHeroImage = Boolean(resolveSelectedHeroImageField());
    if (isHeroImage) {
      const contentSaved = await persistSelectedHeroImageToHomeContent(value);
      if (!contentSaved) {
        setEditorError('Uložení do homepage obsahu selhalo.');
        return false;
      }
      await clearGlobalEditForPath(targetPath);
      setSelectedValue(value);
      setEditorError('');
      if (reloadAfterSave) {
        window.setTimeout(() => window.location.reload(), 150);
      }
      return true;
    }
    const forcedEdits: Record<string, VisualEdit> = {
      ...editsRef.current,
      [targetPath]: { mode: 'image', value },
    };
    editsRef.current = forcedEdits;
    setSelectedValue(value);
    setEdits(forcedEdits);

    const saved = await persistGlobalEditsImmediately(forcedEdits);
    if (!saved) {
      setEditorError('Uložení změny obrázku selhalo. Stránku nerefreshuji.');
      return false;
    }
    const contentSaved = await persistSelectedHeroImageToHomeContent(value);
    if (!contentSaved) {
      setEditorError('Uložení do homepage obsahu selhalo.');
      return false;
    }
    setEditorError('');
    if (reloadAfterSave) {
      window.setTimeout(() => window.location.reload(), 150);
    }
    return true;
  };

  const persistGlobalEditsImmediately = async (forcedEdits?: Record<string, VisualEdit>): Promise<boolean> => {
    const editsToSave = forcedEdits ?? editsRef.current;
    setGlobalSaveState('saving');
    const localOk = safeSetLocalStorage(GLOBAL_VISUAL_EDITS_STORAGE_KEY, JSON.stringify(editsToSave));
    const ok = await patchCmsState({ globalEdits: editsToSave });
    if (ok) {
      setPendingGlobalSync(false);
      setGlobalSaveState('saved');
      const now = new Date().toLocaleTimeString('cs-CZ');
      setGlobalSavedAt(now);
      setGlobalNotice(`Změny uloženy (${now})`);
      return true;
    }
    setPendingGlobalSync(true);
    setGlobalSaveState('error');
    return localOk;
  };

  const managedPosts = blogPosts
    .filter((post) => (blogFilter === 'all' ? true : post.status === blogFilter))
    .filter((post) => {
      if (!blogSearch.trim()) return true;
      const q = blogSearch.toLowerCase();
      return `${post.title} ${stripHtml(post.excerpt)} ${stripHtml(post.content)} ${post.category} ${post.author}`.toLowerCase().includes(q);
    });

  const startEditorDrag = (clientX: number, clientY: number) => {
    const rect = editorRootRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      active: true,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
    suppressToggleClickRef.current = true;
  };

  const onTogglePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    if (dragHoldTimerRef.current) {
      window.clearTimeout(dragHoldTimerRef.current);
      dragHoldTimerRef.current = null;
    }
    const { clientX, clientY } = event;
    dragHoldTimerRef.current = window.setTimeout(() => {
      startEditorDrag(clientX, clientY);
      dragHoldTimerRef.current = null;
    }, 280);
  };

  const onTogglePointerUp = () => {
    if (dragHoldTimerRef.current) {
      window.clearTimeout(dragHoldTimerRef.current);
      dragHoldTimerRef.current = null;
    }
  };

  const onToggleClick = () => {
    if (suppressToggleClickRef.current) {
      suppressToggleClickRef.current = false;
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <div
      ref={editorRootRef}
      className={`cms-global-editor${open ? ' is-open' : ''}`}
      style={editorPosition ? { left: `${editorPosition.x}px`, top: `${editorPosition.y}px`, bottom: 'auto' } : undefined}
    >
      <button
        type="button"
        onClick={onToggleClick}
        onPointerDown={onTogglePointerDown}
        onPointerUp={onTogglePointerUp}
        onPointerCancel={onTogglePointerUp}
      >
        Live editor
      </button>
      {open && (
        <div className="cms-global-editor-panel">
          <div className="cms-global-editor-head">
            <h3>Live editor</h3>
            <button type="button" className="cms-global-editor-close" onClick={() => setOpen(false)} aria-label="Zavřít live editor">
              ×
            </button>
          </div>
          <div className="cms-global-tabs">
            <button type="button" className={activeTab === 'visual' ? 'is-active' : ''} onClick={() => setActiveTab('visual')}>
              Vizuální editor
            </button>
            <button type="button" className={activeTab === 'blog' ? 'is-active' : ''} onClick={() => setActiveTab('blog')}>
              Napsat článek
            </button>
            <button type="button" className={activeTab === 'media' ? 'is-active' : ''} onClick={() => setActiveTab('media')}>
              Média
            </button>
            <button type="button" className={activeTab === 'seo' ? 'is-active' : ''} onClick={() => setActiveTab('seo')}>
              SEO
            </button>
            <button type="button" className={activeTab === 'auth' ? 'is-active' : ''} onClick={() => setActiveTab('auth')}>
              Přístup
            </button>
          </div>
          {editorError && <p className="cms-save-state state-error">{editorError}</p>}

          {activeTab === 'visual' && (
            <>
              <h3>Vizuální editor všeho</h3>
              <p>Klikni na libovolný text nebo obrázek na stránce a uprav ho.</p>
              <p className={`cms-save-state state-${globalSaveState}`}>Vizuální změny: {saveStateLabel(globalSaveState)}</p>
              {globalNotice && (
                <p className={`cms-save-state state-${globalSaveState}`}>
                  {globalNotice}{globalSavedAt ? ` · ${globalSavedAt}` : ''}
                </p>
              )}
              <div className="cms-global-mode">
                <button type="button" className={visualMode === 'select' ? 'is-active' : ''} onClick={() => setVisualMode('select')}>
                  Výběr prvku
                </button>
                <button type="button" className={visualMode === 'edit' ? 'is-active' : ''} onClick={() => setVisualMode('edit')}>
                  Editace
                </button>
              </div>
              <p className="cms-global-tip">
                Režim: {visualMode === 'select' ? 'klikněte na prvek na stránce' : 'pole je odemčené pro psaní'}
              </p>

              <label>
                Hodnota
                {selectedMode === 'image' ? (
                  <div className="cms-image-field">
                    <input
                      type="url"
                      placeholder="https://... nebo /wp/obrazek.jpg"
                      value={selectedValue}
                      onChange={(e) => {
                        if (selectedMode === 'image') saveSelectedImmediate(e.target.value);
                        else setSelectedValue(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const media = await pickAndUploadImage({ applyToSelectedImage: true });
                        if (media) {
                          applyImageValueNow(media.url);
                          registerMediaAsset(media.url, media.name);
                        }
                      }}
                    >
                      Upload obrázku
                    </button>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          void applySelectedImageAndPersist(e.target.value);
                        }
                      }}
                    >
                      <option value="">Vybrat z knihovny médií</option>
                      {mediaLibrary.map((asset) => (
                        <option key={asset.id} value={asset.url}>{asset.name}</option>
                      ))}
                    </select>
                    {selectedValue && (
                      <img
                        src={selectedValue}
                        alt="Náhled vybraného obrázku"
                        style={{ width: '100%', maxHeight: 120, objectFit: 'contain', background: '#fff', border: '1px solid #d4dbe4', borderRadius: 8, padding: 6 }}
                        onError={() => setEditorError('URL obrázku je neplatná nebo nedostupná.')}
                      />
                    )}
                  </div>
                ) : (
                  <RichTextEditor
                    value={selectedValue}
                    onChange={setSelectedValue}
                    height={280}
                    placeholder="Upravte text, nadpis nebo blok..."
                    onImageUploaded={registerMediaAsset}
                    defaultMode="plain"
                  />
                )}
              </label>

              <div className="cms-global-actions">
                <button type="button" onClick={saveSelected} disabled={!selectedPath}>Uložit</button>
                <button type="button" onClick={clearSelected} disabled={!selectedPath}>Zrušit změnu prvku</button>
                <button type="button" onClick={undoEdits} disabled={historyIndex <= 0}>Undo</button>
                <button type="button" onClick={redoEdits} disabled={historyIndex >= editHistory.length - 1}>Redo</button>
                <button type="button" onClick={clearAll}>Smazat všechny globální úpravy</button>
              </div>
            </>
          )}

          {activeTab === 'blog' && (
            <>
              <h3>Blog</h3>
              <p>Vytvořte nový článek nebo upravte existující.</p>
              <p className={`cms-save-state state-${blogSaveState}`}>Blog: {saveStateLabel(blogSaveState)}</p>
              <div className="cms-blog-controls">
                <select value={blogFilter} onChange={(e) => setBlogFilter(e.target.value as typeof blogFilter)}>
                  <option value="all">Všechny stavy</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                <input
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder="Hledat v článcích..."
                />
              </div>

              <label>
                Titulek článku
                <input value={newBlogTitle} onChange={(e) => setNewBlogTitle(e.target.value)} />
              </label>
              <label>
                Perex
                <RichTextEditor
                  value={newBlogExcerpt}
                  onChange={setNewBlogExcerpt}
                  height={180}
                  placeholder="Krátké shrnutí článku..."
                  onImageUploaded={registerMediaAsset}
                />
              </label>
              <label>
                URL obrázku
                <div className="cms-image-field">
                  <input value={newBlogImage} onChange={(e) => setNewBlogImage(e.target.value)} />
                  <button
                    type="button"
                    onClick={async () => {
                      const media = await pickAndUploadImage();
                      if (media) {
                        setNewBlogImage(media.url);
                        registerMediaAsset(media.url, media.name);
                      }
                    }}
                  >
                    Upload obrázku
                  </button>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setNewBlogImage(e.target.value);
                    }}
                  >
                    <option value="">Vybrat z knihovny médií</option>
                    {mediaLibrary.map((asset) => (
                      <option key={asset.id} value={asset.url}>{asset.name}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label>
                Kategorie
                <input value={newBlogCategory} onChange={(e) => setNewBlogCategory(e.target.value)} />
              </label>
              <label>
                Autor
                <input value={newBlogAuthor} onChange={(e) => setNewBlogAuthor(e.target.value)} />
              </label>
              <label>
                Stav
                <select value={newBlogStatus} onChange={(e) => setNewBlogStatus(e.target.value as 'draft' | 'published' | 'scheduled')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>
              <label>
                Publikovat od
                <input type="datetime-local" value={newBlogPublishAt} onChange={(e) => setNewBlogPublishAt(e.target.value)} />
              </label>
              <label>
                SEO title
                <input value={newBlogSeoTitle} onChange={(e) => setNewBlogSeoTitle(e.target.value)} />
              </label>
              <label>
                SEO description
                <textarea rows={2} value={newBlogSeoDescription} onChange={(e) => setNewBlogSeoDescription(e.target.value)} />
              </label>
              <label>
                Obsah
                <RichTextEditor
                  value={newBlogContent}
                  onChange={setNewBlogContent}
                  height={320}
                  placeholder="Napište celý článek..."
                  onImageUploaded={registerMediaAsset}
                />
              </label>
              <button type="button" onClick={addBlogPost}>Publikovat článek</button>

              {managedPosts.map((post) => (
                <div key={post.id} className="cms-live-faq">
                  <label>
                    Titulek
                    <input value={post.title} onChange={(e) => updateBlogPost(post.id, 'title', e.target.value)} />
                  </label>
                  <label>
                    Slug
                    <input value={post.slug} disabled={post.slugLocked} onChange={(e) => updateBlogPost(post.id, 'slug', e.target.value)} />
                  </label>
                  <label className="cms-checkbox">
                    <input
                      type="checkbox"
                      checked={post.slugLocked}
                      onChange={(e) => updateBlogPost(post.id, 'slugLocked', e.target.checked)}
                    />
                    Zamknout slug k titulku
                  </label>
                  <label>
                    Perex
                    <RichTextEditor
                      value={post.excerpt}
                      onChange={(value) => updateBlogPost(post.id, 'excerpt', value)}
                      height={170}
                      placeholder="Krátké shrnutí článku..."
                      onImageUploaded={registerMediaAsset}
                    />
                  </label>
                  <label>
                    URL obrázku
                    <div className="cms-image-field">
                      <input value={post.coverImage} onChange={(e) => updateBlogPost(post.id, 'coverImage', e.target.value)} />
                      <button
                        type="button"
                        onClick={async () => {
                          const media = await pickAndUploadImage();
                          if (media) {
                            updateBlogPost(post.id, 'coverImage', media.url);
                            registerMediaAsset(media.url, media.name);
                          }
                        }}
                      >
                        Upload obrázku
                      </button>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) updateBlogPost(post.id, 'coverImage', e.target.value);
                        }}
                      >
                        <option value="">Vybrat z knihovny médií</option>
                        {mediaLibrary.map((asset) => (
                          <option key={asset.id} value={asset.url}>{asset.name}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label>
                    Kategorie
                    <input value={post.category} onChange={(e) => updateBlogPost(post.id, 'category', e.target.value)} />
                  </label>
                  <label>
                    Autor
                    <input value={post.author} onChange={(e) => updateBlogPost(post.id, 'author', e.target.value)} />
                  </label>
                  <label>
                    Stav
                    <select value={post.status} onChange={(e) => updateBlogPost(post.id, 'status', e.target.value as BlogPost['status'])}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </label>
                  <label>
                    Publikovat od
                    <input type="datetime-local" value={post.publishAt} onChange={(e) => updateBlogPost(post.id, 'publishAt', e.target.value)} />
                  </label>
                  <label>
                    SEO title
                    <input value={post.seoTitle} onChange={(e) => updateBlogPost(post.id, 'seoTitle', e.target.value)} />
                  </label>
                  <label>
                    SEO description
                    <textarea rows={2} value={post.seoDescription} onChange={(e) => updateBlogPost(post.id, 'seoDescription', e.target.value)} />
                  </label>
                  <label>
                    Obsah
                    <RichTextEditor
                      value={post.content}
                      onChange={(value) => updateBlogPost(post.id, 'content', value)}
                      height={320}
                      placeholder="Obsah článku..."
                      onImageUploaded={registerMediaAsset}
                    />
                  </label>
                  <button type="button" onClick={() => removeBlogPost(post.id)}>Smazat článek</button>
                  <button type="button" onClick={() => setPreviewPostId((prev) => (prev === post.id ? null : post.id))}>
                    {previewPostId === post.id ? 'Skrýt náhled' : 'Náhled článku'}
                  </button>
                  {previewPostId === post.id && (
                    <div className="cms-blog-preview">
                      <h4>{post.title}</h4>
                      <p>{post.category} · {post.author} · {post.status}</p>
                      <img src={post.coverImage} alt={post.title} />
                      <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <h3>SEO stránky</h3>
              <p>Upravte title, description, canonical a OG obrázek pro jednotlivé podstránky.</p>
              <p className={`cms-save-state state-${seoSaveState}`}>SEO: {saveStateLabel(seoSaveState)}</p>
              <label>
                Stránka
                <select value={selectedSeoPath} onChange={(e) => setSelectedSeoPath(e.target.value)}>
                  {Object.keys({ ...defaultSeoPages, ...seoPages }).map((pathKey) => (
                    <option key={pathKey} value={pathKey}>{pathKey}</option>
                  ))}
                </select>
              </label>
              <label>
                SEO Title
                <input
                  value={seoPages[selectedSeoPath]?.title ?? defaultSeoPages[selectedSeoPath]?.title ?? ''}
                  onChange={(e) => setSeoField(selectedSeoPath, 'title', e.target.value)}
                />
              </label>
              <label>
                SEO Description
                <textarea
                  rows={3}
                  value={seoPages[selectedSeoPath]?.description ?? defaultSeoPages[selectedSeoPath]?.description ?? ''}
                  onChange={(e) => setSeoField(selectedSeoPath, 'description', e.target.value)}
                />
              </label>
              <label>
                Canonical URL
                <input
                  value={seoPages[selectedSeoPath]?.canonical ?? ''}
                  onChange={(e) => setSeoField(selectedSeoPath, 'canonical', e.target.value)}
                  placeholder="https://..."
                />
              </label>
              <label>
                OG image URL
                <input
                  value={seoPages[selectedSeoPath]?.ogImage ?? ''}
                  onChange={(e) => setSeoField(selectedSeoPath, 'ogImage', e.target.value)}
                  placeholder="https://... nebo /website-media/..."
                />
              </label>
            </>
          )}

          {activeTab === 'auth' && (
            <>
              <h3>Přístup a audit</h3>
              <p>Pro produkci zapněte v backendu `WEBSITE_EDITOR_REQUIRE_AUTH=true`.</p>
              {cmsIdentity ? (
                <div className="cms-auth-box">
                  <p>Přihlášen: <strong>{cmsIdentity.email}</strong> ({cmsIdentity.role})</p>
                  <button type="button" onClick={doLogout}>Odhlásit</button>
                </div>
              ) : (
                <div className="cms-auth-box">
                  <label>
                    E-mail
                    <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </label>
                  <label>
                    Heslo
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  </label>
                  {loginError && <p className="cms-save-state state-error">{loginError}</p>}
                  <button type="button" onClick={doLogin}>Přihlásit do editoru</button>
                </div>
              )}
              <h4>Audit log (poslední změny)</h4>
              <div className="cms-audit-log">
                {auditLog.length === 0 && <p>Zatím bez záznamů.</p>}
                {auditLog.slice(0, 30).map((row) => (
                  <div key={row.id} className="cms-audit-row">
                    <strong>{new Date(row.at).toLocaleString('cs-CZ')}</strong>
                    <span>{row.actor}{row.role ? ` (${row.role})` : ''}</span>
                    <span>{row.keys.join(', ')}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'media' && (
            <>
              <h3>Knihovna médií</h3>
              <p>Nahrajte obrázky jednou a používejte je v bannerech, blocích i článcích.</p>
              <p className={`cms-save-state state-${mediaSaveState}`}>Média: {saveStateLabel(mediaSaveState)}</p>
              <div className="cms-global-actions">
                <button type="button" onClick={uploadMediaToLibrary}>Nahrát obrázky</button>
              </div>
              <div className="cms-media-grid">
                {mediaLibrary.map((asset) => (
                  <article key={asset.id} className="cms-media-card">
                    <img src={asset.url} alt={asset.name} />
                    <strong>{asset.name}</strong>
                    <small>{new Date(asset.createdAt).toLocaleString('cs-CZ')}</small>
                    <div className="cms-media-actions">
                      {selectedMode === 'image' && selectedPath && (
                        <button type="button" onClick={() => { void applySelectedImageAndPersist(asset.url); }}>
                          Použít do vybraného obrázku
                        </button>
                      )}
                      <button type="button" onClick={() => navigator.clipboard?.writeText(asset.url)}>Kopírovat URL</button>
                      <button type="button" onClick={() => removeMediaAsset(asset.id)}>Smazat</button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {actionNotice && (
        <div className={`cms-toast cms-toast--${actionNoticeState}`} role="status" aria-live="polite">
          {actionNotice}
        </div>
      )}
    </div>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const serviceLinks = [
    { href: '/bydleni-a-reality', label: 'Bydlení a reality', text: 'Odhad, prodej, financování i bezpečný převod.' },
    { href: '/investice-a-sporeni', label: 'Investice a spoření', text: 'Dlouhodobý plán, portfolio a ochrana rezerv.' },
    { href: '/pojisteni', label: 'Pojištění', text: 'Život, majetek, odpovědnost i podnikání.' },
    { href: '/pujcky-a-hypoteky', label: 'Půjčky a hypotéky', text: 'Srovnání možností bez tlaku na jednu banku.' },
  ];

  const navLinks = [
    { href: '/bydleni-a-reality', label: 'Reality' },
    { href: '/investice-a-sporeni', label: 'Investice' },
    { href: '/pojisteni', label: 'Pojištění' },
    { href: '/o-nas', label: 'O nás' },
  ];

  // unused vars kept to avoid breaking references in megaMenuContent
  void navMain; void megaMenuContent;

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255,255,255,0.94)',
      borderBottom: '1px solid rgba(17, 24, 39, 0.08)',
      boxShadow: '0 18px 50px rgba(15, 23, 42, 0.06)',
      backdropFilter: 'blur(18px)',
    }}>
      <div className="hidden-mobile" style={{ borderBottom: '1px solid rgba(17, 24, 39, 0.06)', background: '#f8fafc' }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '8px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          color: '#64748b',
          fontSize: 12.5,
          lineHeight: '16px',
          fontWeight: 650,
        }}>
          <span>Nezávislé poradenství pro reality, finance a ochranu majetku</span>
          <Link to="/kontakty" style={{ color: '#b91c1c', textDecoration: 'none', fontWeight: 800 }}>
            Domluvit schůzku
          </Link>
        </div>
      </div>

      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 76,
        gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          <Link to="/" aria-label="Český Partner homepage" style={{ display: 'flex', alignItems: 'center', gap: 13, textDecoration: 'none' }}>
            <img src="/brand/logo-ceskypartner.svg" alt="Český Partner" style={{ height: 50, width: 'auto', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span style={{ display: 'none' }}>Český Partner</span>
          </Link>

          <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="hidden-mobile" aria-label="Hlavní navigace">
            <div
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
              style={{ position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setServicesOpen((open) => !open)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  minHeight: 42,
                  padding: '0 14px',
                  border: '1px solid transparent',
                  borderRadius: 12,
                  background: servicesOpen ? '#f8fafc' : 'transparent',
                  color: '#0f172a',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: '18px',
                  fontWeight: 750,
                  fontFamily: 'inherit',
                }}
                aria-expanded={servicesOpen}
              >
                Služby
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9L12 15L18 9" stroke="#0f172a" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {servicesOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  left: -18,
                  width: 520,
                  padding: 14,
                  borderRadius: 18,
                  background: '#ffffff',
                  border: '1px solid rgba(15, 23, 42, 0.1)',
                  boxShadow: '0 28px 80px rgba(15, 23, 42, 0.16)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setServicesOpen(false)}
                        style={{
                          display: 'block',
                          padding: '14px 15px',
                          borderRadius: 12,
                          color: '#0f172a',
                          textDecoration: 'none',
                          background: isActive(link.href) ? '#fff1f2' : '#ffffff',
                        }}
                      >
                        <span style={{ display: 'block', fontSize: 14, lineHeight: '18px', fontWeight: 850 }}>{link.label}</span>
                        <span style={{ display: 'block', marginTop: 5, color: '#64748b', fontSize: 12.5, lineHeight: '17px', fontWeight: 550 }}>{link.text}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 42,
                padding: '0 13px',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: '18px',
                fontWeight: 750,
                color: isActive(link.href) ? '#b91c1c' : '#0f172a',
                background: isActive(link.href) ? '#fff1f2' : 'transparent',
                textDecoration: 'none',
              }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="hidden-mobile">
          <Link to="/kontakty" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 42,
            padding: '0 16px',
            borderRadius: 12,
            border: '1px solid rgba(15, 23, 42, 0.12)',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 800,
            textDecoration: 'none',
          }}>
            Kontakt
          </Link>
          <Link to="/kontakty" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 42,
            padding: '0 18px',
            borderRadius: 12,
            fontSize: 14,
            lineHeight: '18px',
            fontWeight: 850,
            color: '#fff',
            background: '#c81e1e',
            textDecoration: 'none',
            boxShadow: '0 14px 32px rgba(200, 30, 30, 0.22)',
          }}>
            Konzultace zdarma
          </Link>
        </div>

        <button
          className="show-mobile"
          onClick={() => setMobileOpen((open) => !open)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '1px solid rgba(15, 23, 42, 0.12)',
            background: '#ffffff',
            cursor: 'pointer',
            padding: 0,
            color: '#0f172a',
            fontSize: 22,
            lineHeight: '42px',
            textAlign: 'center',
          }}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '×' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', background: '#fff', padding: '14px 22px 22px' }}>
          {[...serviceLinks, ...navLinks.filter((link) => !serviceLinks.some((service) => service.href === link.href))].map((link) => (
            <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '13px 12px',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 750,
                color: isActive(link.href) ? '#b91c1c' : '#0f172a',
                background: isActive(link.href) ? '#fff1f2' : '#ffffff',
                textDecoration: 'none',
                marginBottom: 3,
              }}>
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: 14, marginTop: 10 }}>
            <Link to="/kontakty" onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '13px 12px', textAlign: 'center', borderRadius: 12, fontSize: 15, fontWeight: 850, color: '#fff', background: '#c81e1e', textDecoration: 'none' }}>
              Konzultace zdarma
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero({ content }: { content: HomeContent }) {
  void content;

  const heroServices = [
    { label: 'Reality', value: 'Odhad, prodej, nákup', href: '/bydleni-a-reality' },
    { label: 'Finance', value: 'Hypotéky, úvěry, plán', href: '/pujcky-a-hypoteky' },
    { label: 'Investice', value: 'Rezervy a dlouhodobý růst', href: '/investice-a-sporeni' },
    { label: 'Pojištění', value: 'Rodina, majetek, podnikání', href: '/pojisteni' },
  ];

  return (
    <section className="hero hero-bcas">
      <div className="shell hero-bcas-grid">
        <div className="hero-bcas-copy">
          <p className="hero-bcas-kicker">Český Partner</p>
          <h1>Rozhodnutí o penězích a bydlení pod jednou střechou</h1>
          <p>
            Spojujeme realitní zkušenost, finanční plánování, investice a pojištění do jednoho srozumitelného postupu. Bez prodejního tlaku, s jasným doporučením a člověkem, který drží kontext.
          </p>
          <div className="hero-bcas-actions">
            <Link to="/kontakty" className="reasons-btn">Chci konzultaci zdarma</Link>
            <Link to="/bydleni-a-reality" className="outline-btn">Prohlédnout služby</Link>
          </div>
          <div className="hero-bcas-trust" aria-label="Důležité informace">
            <span>Nezávislé poradenství</span>
            <span>Reality, finance, ochrana</span>
            <span>Osobní i online řešení</span>
          </div>
        </div>

        <div className="hero-bcas-mosaic pageHeader__imgs" aria-label="Přehled služeb Českého Partnera">
          <div className="hero-bcas-card hero-bcas-card-main">
            <span className="hero-bcas-card-eyebrow">Doporučený postup</span>
            <strong>Začněte konzultací. My poskládáme varianty.</strong>
            <p>Jedna schůzka stačí k tomu, abychom oddělili priority, rizika a další kroky.</p>
            <div className="hero-bcas-progress">
              <span style={{ width: '72%' }} />
            </div>
          </div>
          <div className="hero-bcas-service-grid">
            {heroServices.map((service) => (
              <Link key={service.href} to={service.href} className="hero-bcas-service">
                <span>{service.label}</span>
                <strong>{service.value}</strong>
              </Link>
            ))}
          </div>
          <div className="hero-bcas-note">
            <strong>1 partner</strong>
            <span>pro plán, smlouvy, bydlení i dlouhodobé rezervy</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Products({ content }: { content: HomeContent }) {
  const renderIcon = (icon: (typeof shortcutItems)[number]['icon']) => {
    switch (icon) {
      case 'card':
        return (
          <svg viewBox="0 0 64 64" aria-hidden>
            <rect x="10" y="16" width="38" height="26" rx="4" />
            <line x1="16" y1="25" x2="44" y2="25" />
            <line x1="16" y1="33" x2="30" y2="33" />
            <path d="M48 24c7 4 9 13 4 20-2 3-5 5-9 6" />
          </svg>
        );
      case 'money':
        return (
          <svg viewBox="0 0 64 64" aria-hidden>
            <circle cx="24" cy="39" r="8" />
            <path d="M24 34v10M20 38h8" />
            <path d="M36 20l8-4m-6 10l9-2m-24-2l2-8m17-2l8 2" />
            <path d="M43 20c6 2 10 8 10 15 0 10-8 18-18 18-3 0-6-1-8-2" />
          </svg>
        );
      case 'house':
        return (
          <svg viewBox="0 0 64 64" aria-hidden>
            <path d="M12 31L32 16l20 15" />
            <rect x="17" y="30" width="30" height="22" rx="2" />
            <rect x="29" y="38" width="8" height="14" />
            <path d="M39 12v7" />
          </svg>
        );
      case 'bars':
        return (
          <svg viewBox="0 0 64 64" aria-hidden>
            <rect x="14" y="20" width="9" height="28" rx="2" />
            <rect x="28" y="14" width="9" height="34" rx="2" />
            <rect x="42" y="26" width="9" height="22" rx="2" />
            <path d="M10 52h46" />
          </svg>
        );
      case 'umbrella':
        return (
          <svg viewBox="0 0 64 64" aria-hidden>
            <path d="M12 33c4-12 12-18 20-18s16 6 20 18H12z" />
            <path d="M32 15v25c0 4 1 7 4 7 2 0 4-2 4-4" />
            <path d="M22 33v4m10-4v4m10-4v4" />
          </svg>
        );
      case 'branch':
        return (
          <svg viewBox="0 0 64 64" aria-hidden>
            <rect x="10" y="22" width="44" height="28" rx="2" />
            <path d="M14 22l18-9 18 9" />
            <rect x="28" y="34" width="8" height="16" />
            <path d="M46 16c5 0 8 3 8 8 0 7-8 11-8 11s-8-4-8-11c0-5 3-8 8-8z" />
            <circle cx="46" cy="24" r="2.6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className="shortcuts-section">
      <div className="shell">
        <div className="shortcuts-panel">
          <p className="shortcuts-heading">{content.productsHeading}</p>
          {shortcutItems.map((item, idx) => (
            item.key === 'housing' ? (
              <Link to="/bydleni-a-reality" key={item.key} className="shortcut-item">
                <span className={`shortcut-icon shortcut-icon-${item.icon}`}>{renderIcon(item.icon)}</span>
                <span className="shortcut-label">{content.shortcutLabels[idx] ?? ''}</span>
                <i className="shortcut-arrow" aria-hidden>›</i>
              </Link>
            ) : (
              <a href="#" key={item.key} className="shortcut-item">
                <span className={`shortcut-icon shortcut-icon-${item.icon}`}>{renderIcon(item.icon)}</span>
                <span className="shortcut-label">{content.shortcutLabels[idx] ?? ''}</span>
                <i className="shortcut-arrow" aria-hidden>›</i>
              </a>
            )
          ))}
        </div>
      </div>
    </section>
  );
}

function Perks({ content }: { content: HomeContent }) {
  return (
    <section className="section finance-intro">
      <div className="shell finance-intro-wrap">
        <h2>
          {content.perksHeading}
        </h2>
        <p>{content.perksDescription}</p>
      </div>
    </section>
  );
}

function AppSection({ content }: { content: HomeContent }) {
  return (
    <section className="account-banner">
      <div className="shell account-banner-grid">
        <div className="account-banner-copy">
          <h2>{content.appHeading}</h2>
          <p className="lead">{content.appLead}</p>
          <p>
            {content.appDescription}
          </p>
          <div className="account-banner-cta">
            <Link to="/produkty/bezny-ucet" className="outline-btn">{content.appCtaOutline} <span aria-hidden>→</span></Link>
            <Link to="/produkty/bezny-ucet" className="solid-btn">{content.appCtaSolid} <span aria-hidden>→</span></Link>
          </div>
        </div>

        <div className="wallet-visual" aria-hidden>
          <div className="wallet-card wallet-card-1">1000</div>
          <div className="wallet-card wallet-card-2">debit</div>
          <div className="wallet-card wallet-card-3">air</div>
          <div className="wallet-body" />
        </div>
      </div>
    </section>
  );
}

function CurrentAccountPage() {
  return (
    <main className="current-account-page">
      <section className="current-hero">
        <div className="shell current-hero-grid">
          <div>
            <p className="current-crumbs">Produkty / Běžný účet</p>
            <h1>Běžný účet zdarma, který vás podrží každý den</h1>
            <p className="current-lead">
              Vše důležité máte pod kontrolou v aplikaci. Přehledně, rychle a bez zbytečných poplatků.
            </p>
            <div className="current-hero-cta">
              <a href="#" className="solid-btn">Založit účet online <span aria-hidden>→</span></a>
              <a href="#" className="outline-btn">Porovnat účty <span aria-hidden>→</span></a>
            </div>
          </div>
          <div className="current-hero-card">
            <h3>Co získáte hned po založení</h3>
            <ul>
              {accountBenefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section current-features">
        <div className="shell">
          <div className="section-head">
            <h2>Všechno důležité na jednom místě</h2>
          </div>
          <div className="current-feature-grid">
            {accountFeatures.map((item) => (
              <article key={item.title} className="current-feature-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint current-pricing">
        <div className="shell current-pricing-grid">
          <div>
            <h2>Poplatky, kterým rozumíte</h2>
            <p>
              Běžné bankování bez háčků. Jasně vidíte, co je zdarma a co případně stojí navíc.
            </p>
          </div>
          <div className="current-pricing-box">
            <div><span>Vedení účtu</span><strong>0 Kč</strong></div>
            <div><span>Příchozí platby</span><strong>0 Kč</strong></div>
            <div><span>Odchozí platby CZK</span><strong>0 Kč</strong></div>
            <div><span>Debetní karta</span><strong>0 Kč</strong></div>
            <div><span>Okamžité notifikace</span><strong>0 Kč</strong></div>
          </div>
        </div>
      </section>

      <section className="section current-open">
        <div className="shell current-open-grid">
          <div>
            <h2>Jak si účet založit</h2>
            <ol>
              {accountOpenSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <aside className="current-open-aside">
            <h3>Online založení do 15 minut</h3>
            <p>Bez návštěvy pobočky, bez papírů, bez čekání. Vše bezpečně z mobilu.</p>
            <a href="#" className="solid-btn">Začít založení <span aria-hidden>→</span></a>
          </aside>
        </div>
      </section>

      <section className="section tint faq">
        <div className="shell">
          <h2>Často se ptáte k běžnému účtu</h2>
          <div className="faq-list">
            {accountFaq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SubpageTopHero({
  sectionClassName,
  crumb,
  title,
  description,
  side,
  cta,
}: {
  sectionClassName?: string;
  crumb: string;
  title: string;
  description: ReactNode;
  side: ReactNode;
  cta?: ReactNode;
}) {
  return (
    <section className={`subpage-hero${sectionClassName ? ` ${sectionClassName}` : ''}`}>
      <div className="shell subpage-hero-grid">
        <div className="subpage-hero-copy">
          <p className="subpage-crumbs">{crumb}</p>
          <h1>{title}</h1>
          <div className="subpage-hero-text">{description}</div>
          {cta && <div className="subpage-hero-cta">{cta}</div>}
        </div>
        <div className="subpage-hero-side">{side}</div>
      </div>
    </section>
  );
}

function ServiceDetailPage({ data }: { data: ServiceDetailData }) {
  return (
    <main className="service-detail-page">
      <section className="service-detail-hero">
        <div className="service-detail-bg" aria-hidden="true" />
        <div className="service-detail-shell service-detail-hero-grid">
          <div className="service-detail-copy">
            <p className="service-detail-crumb">{data.crumb}</p>
            <span className="service-detail-eyebrow">{data.eyebrow}</span>
            <h1>{data.title}</h1>
            <p className="service-detail-lead">{data.lead}</p>
            <p className="service-detail-body">{data.body}</p>
            <div className="service-detail-actions">
              <Link to="/kontakty" className="service-detail-primary">{data.primaryCta}</Link>
              <a href="#postup" className="service-detail-secondary">{data.secondaryCta}</a>
            </div>
          </div>

          <aside className="service-detail-visual">
            <img src={data.image} alt="" />
            <div className="service-detail-visual-card">
              <span>souvislosti</span>
              <strong>Nejdřív kontext. Potom řešení.</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="service-detail-stats">
        <div className="service-detail-shell service-detail-stats-grid">
          {data.stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="service-detail-section">
        <div className="service-detail-shell">
          <div className="service-detail-heading">
            <div>
              <span>{data.servicesEyebrow}</span>
              <h2>{data.servicesTitle}</h2>
            </div>
            <p>{data.servicesIntro}</p>
          </div>

          <div className="service-detail-card-grid">
            {data.cards.map((card) => (
              <article key={card.title} className="service-detail-card">
                <span>{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="postup" className="service-detail-process">
        <div className="service-detail-shell service-detail-process-grid">
          <div>
            <span className="service-detail-eyebrow dark">{data.processEyebrow}</span>
            <h2>{data.processTitle}</h2>
            <p>{data.processIntro}</p>

            <div className="service-detail-step-list">
              {data.steps.map((step, idx) => (
                <article key={step.title}>
                  <span>0{idx + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="service-detail-aside">
            <span>v praxi</span>
            <h3>{data.asideTitle}</h3>
            <p>{data.asideText}</p>
            <div>
              {data.asidePoints.map((point) => (
                <strong key={point}>{point}</strong>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="service-detail-cta">
        <div className="service-detail-shell service-detail-cta-box">
          <div>
            <span>nezávazně</span>
            <h2>{data.ctaTitle}</h2>
            <p>{data.ctaText}</p>
          </div>
          <Link to="/kontakty" className="service-detail-primary">Domluvit konzultaci</Link>
        </div>
      </section>
    </main>
  );
}

function ContactsPage() {
  return (
    <main className="contacts-page">
      <SubpageTopHero
        sectionClassName="contacts-hero"
        crumb="Kontakty"
        title="Jsme tu pro vás, kdykoliv potřebujete"
        description={
          <p>
            Potřebujete poradit s účtem, kartou nebo internetovým bankovnictvím? Vyberte si kontakt,
            který vám vyhovuje nejvíce.
          </p>
        }
        side={(
          <div className="contacts-hero-badge">
            <strong>Podpora každý den</strong>
            <span>8:00–22:00</span>
          </div>
        )}
      />

      <section className="section contacts-channels">
        <div className="shell contacts-channel-grid">
          {contactChannels.map((item) => (
            <article key={item.title} className="contacts-card">
              <h3>{item.title}</h3>
              <p className="value">{item.value}</p>
              <p className="note">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section tint contacts-layout">
        <div className="shell contacts-layout-grid">
          <div>
            <h2>Pobočky</h2>
            <div className="contacts-branch-list">
              {contactBranches.map((branch) => (
                <article key={branch.city} className="contacts-branch">
                  <h3>{branch.city}</h3>
                  <p>{branch.address}</p>
                  <p>{branch.hours}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="contacts-form-box">
            <h3>Napište nám</h3>
            <form className="contacts-form">
              <input type="text" placeholder="Jméno a příjmení" />
              <input type="email" placeholder="E-mail" />
              <input type="tel" placeholder="Telefon" />
              <textarea placeholder="Vaše zpráva" rows={5} />
              <button type="submit" className="solid-btn">Odeslat zprávu</button>
            </form>
          </aside>
        </div>
      </section>

      <section className="section faq">
        <div className="shell">
          <h2>Často se ptáte ke kontaktům</h2>
          <div className="faq-list">
            <details>
              <summary>Kdy je dostupná telefonická podpora?</summary>
              <p>Telefonická podpora je dostupná každý pracovní den od 8:00 do 20:00.</p>
            </details>
            <details>
              <summary>Za jak dlouho odpovíte na e-mail?</summary>
              <p>Na většinu dotazů odpovídáme do 24 hodin.</p>
            </details>
            <details>
              <summary>Je možné řešit vše online?</summary>
              <p>Ano, většinu požadavků vyřešíte přes chat, e-mail nebo internetové bankovnictví.</p>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return <ServiceDetailPage data={serviceDetailPages.about} />;
}

function HousingRealityPage() {
  return <ServiceDetailPage data={serviceDetailPages.housing} />;
}

/* ─── Český Partner Homepage Sections ─── */

function CPHeroSection() {
  const cards = [
    { title: 'Reality', subtitle: 'Odhad, nákup, prodej i investiční nemovitosti.', href: '/bydleni-a-reality', image: '/wp/quadrio-exterier-2@2x.1765184383.jpg.webp' },
    { title: 'Investice', subtitle: 'Rezervy, portfolio a dlouhodobý plán růstu.', href: '/investice-a-sporeni', image: '/wp/AdobeStock_676162468.jpg' },
    { title: 'Pojištění', subtitle: 'Rodina, majetek, odpovědnost i podnikání.', href: '/pojisteni', image: '/wp/AdobeStock_676156911-1.jpg' },
    { title: 'Podnikání', subtitle: 'Financování a řešení pro růst firmy online.', href: '/podnikatele', image: '/wp/AdobeStock_695328241_1.jpg' },
  ];

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #fff7f7 46%, #f8fafc 100%)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(90deg, rgba(200,30,30,0.055) 1px, transparent 1px), linear-gradient(0deg, rgba(15,23,42,0.035) 1px, transparent 1px)',
          backgroundSize: '58px 58px',
          WebkitMaskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.38) 45%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.38) 45%, transparent 100%)',
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 1240,
        margin: '0 auto',
        padding: '72px 28px 76px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(420px, 0.9fr)',
        gap: 56,
        alignItems: 'center',
      }} className="cp-home-hero-shell">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 34,
            padding: '0 13px',
            borderRadius: 999,
            background: '#fff1f2',
            color: '#b91c1c',
            fontSize: 13,
            lineHeight: '18px',
            fontWeight: 850,
            marginBottom: 18,
          }}>
            Český Partner
          </div>
          <h1 style={{
            maxWidth: 720,
            margin: 0,
            fontSize: 'clamp(48px, 5.6vw, 82px)',
            fontWeight: 950,
            color: '#0f172a',
            lineHeight: 0.98,
            letterSpacing: 0,
          }}>
            Finance, reality a ochrana majetku v jednom plánu
          </h1>
          <p style={{
            maxWidth: 640,
            margin: '24px 0 0',
            color: '#475569',
            fontSize: 18,
            lineHeight: 1.58,
            fontWeight: 520,
          }}>
            Pomůžeme vám udělat pořádek v hypotéce, investicích, pojištění i bydlení. Dostanete konkrétní doporučení, ne další hromadu nabídek bez souvislostí.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link to="/kontakty" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 54,
              padding: '0 22px',
              borderRadius: 14,
              background: '#c81e1e',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 15,
              lineHeight: '18px',
              fontWeight: 850,
              boxShadow: '0 18px 40px rgba(200, 30, 30, 0.24)',
            }}>
              Chci konzultaci zdarma
            </Link>
            <Link to="/bydleni-a-reality" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 54,
              padding: '0 22px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.78)',
              color: '#0f172a',
              border: '1px solid rgba(15, 23, 42, 0.16)',
              textDecoration: 'none',
              fontSize: 15,
              lineHeight: '18px',
              fontWeight: 850,
            }}>
              Prohlédnout služby
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
            {['Nezávislé poradenství', 'Osobní i online řešení', 'Reality, finance, pojištění'].map((item) => (
              <span key={item} style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 32,
                padding: '0 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid rgba(15, 23, 42, 0.09)',
                color: '#475569',
                fontSize: 12.5,
                lineHeight: '16px',
                fontWeight: 750,
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          position: 'relative',
          minHeight: 520,
          padding: 22,
          borderRadius: 28,
          border: '1px solid rgba(15, 23, 42, 0.1)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.76))',
          boxShadow: '0 34px 90px rgba(15, 23, 42, 0.14)',
        }} className="cp-home-hero-panel">
          <div style={{
            padding: 28,
            borderRadius: 22,
            background: '#0f172a',
            color: '#ffffff',
            boxShadow: '0 22px 50px rgba(15, 23, 42, 0.2)',
          }}>
            <span style={{ display: 'block', marginBottom: 18, color: '#fca5a5', fontSize: 12, lineHeight: '16px', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Doporučený postup
            </span>
            <strong style={{ display: 'block', maxWidth: 350, fontSize: 28, lineHeight: 1.08, fontWeight: 900 }}>
              Začněte konzultací. My poskládáme varianty.
            </strong>
            <p style={{ maxWidth: 360, margin: '16px 0 0', color: '#cbd5e1', fontSize: 14, lineHeight: 1.52, fontWeight: 550 }}>
              Jedna schůzka stačí k tomu, abychom oddělili priority, rizika a další kroky.
            </p>
            <div style={{ height: 10, marginTop: 26, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '72%', height: '100%', borderRadius: 'inherit', background: '#ef4444' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }} className="cp-home-hero-card-grid">
            {cards.map((card) => (
              <Link key={card.href} to={card.href} className="cp-hero-card" style={{
                minHeight: 160,
                padding: 12,
                borderRadius: 18,
                background: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.09)',
                color: '#0f172a',
                textDecoration: 'none',
                boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
              }}>
                <img src={card.image} alt={card.title} style={{ width: '100%', height: 78, borderRadius: 12, objectFit: 'cover', display: 'block', marginBottom: 12 }} />
                <span style={{ display: 'block', color: '#b91c1c', fontSize: 12, lineHeight: '16px', fontWeight: 850 }}>{card.title}</span>
                <strong style={{ display: 'block', marginTop: 6, fontSize: 13.5, lineHeight: 1.24, fontWeight: 850 }}>{card.subtitle}</strong>
              </Link>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 12,
            padding: '16px 18px',
            borderRadius: 18,
            background: '#fff1f2',
            color: '#7f1d1d',
          }}>
            <strong style={{ flex: '0 0 auto', fontSize: 30, lineHeight: 1, fontWeight: 950 }}>1 partner</strong>
            <span style={{ fontSize: 13, lineHeight: 1.35, fontWeight: 750 }}>pro plán, smlouvy, bydlení i dlouhodobé rezervy</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CPMediaBar() {
  const items = [
    {
      value: '01',
      title: 'Nejdřív pochopíme situaci',
      text: 'Krátká konzultace ukáže, co řešit hned a co počká.',
    },
    {
      value: '02',
      title: 'Porovnáme možnosti',
      text: 'Reality, hypotéka, investice i pojištění se řeší v souvislostech.',
    },
    {
      value: '03',
      title: 'Dostanete doporučení',
      text: 'Jasný postup, konkrétní kroky a žádné zbytečné papírování.',
    },
    {
      value: '04',
      title: 'Hlídáme další návaznosti',
      text: 'Smlouvy, termíny i změny v životě mají jednoho partnera.',
    },
  ];

  return (
    <section className="cp-media-bar">
      <div className="cp-media-shell">
        <div className="cp-media-intro">
          <span>Jak pracujeme</span>
          <h2>Žádná univerzální nabídka. Nejdřív kontext, potom řešení.</h2>
        </div>
        <div className="cp-media-grid">
          {items.map((item) => (
            <article key={item.value} className="cp-media-card">
              <span>{item.value}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CPAboutSection() {
  const cards = [
    {
      title: 'Řeším bydlení a majetek',
      href: '/bydleni-a-reality',
      cta: 'Probrat bydlení',
      intro: 'Pomůžeme s prodejem, nákupem, hypotékou i ochranou nemovitosti. V jednom postupu vidíte cenu, rizika i další kroky.',
      points: [
        'Odhad reálné tržní ceny',
        'Hypotéka a financování v souvislostech',
        'Kontrola smluv, rizik a termínů',
        'Pojištění majetku a odpovědnosti',
      ],
      visual: 'home' as const,
    },
    {
      title: 'Řeším peníze a budoucnost',
      href: '/investice-a-sporeni',
      cta: 'Postavit finanční plán',
      intro: 'Dáme dohromady rezervy, investice, pojištění a dlouhodobé cíle tak, aby se jednotlivé produkty nepřetahovaly proti sobě.',
      points: [
        'Rezerva pro nečekané situace',
        'Investiční strategie podle horizontu',
        'Ochrana příjmu a rodiny',
        'Pravidelná kontrola nastavení',
      ],
      visual: 'plan' as const,
    },
  ];

  const renderMock = (kind: 'home' | 'plan') => {
    if (kind === 'home') {
      return (
        <div style={{ marginTop: 'auto', minHeight: 190, position: 'relative' }}>
          <div style={{ overflow: 'hidden', borderRadius: 22, background: '#ffffff', boxShadow: '0 18px 34px rgba(15,23,42,0.1)' }}>
            <img src="/wp/quadrio-exterier-2@2x.1765184383.jpg.webp" alt="" style={{ width: '100%', height: 126, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '14px 16px 16px', display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 11, fontWeight: 750 }}>Modelová hodnota</div>
                <div style={{ marginTop: 3, color: '#0f172a', fontSize: 28, lineHeight: 1, fontWeight: 950 }}>8,4 mil. Kč</div>
              </div>
              <span style={{ borderRadius: 999, padding: '8px 11px', background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 850 }}>
                prověřeno
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ marginTop: 'auto', minHeight: 190, position: 'relative' }}>
        <div style={{ borderRadius: 22, padding: 18, background: '#0f172a', color: '#ffffff', boxShadow: '0 18px 34px rgba(15,23,42,0.14)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: 11, fontWeight: 750 }}>Finanční plán</div>
              <div style={{ marginTop: 5, fontSize: 30, lineHeight: 1, fontWeight: 950 }}>12 let</div>
            </div>
            <div style={{ width: 82, height: 82, borderRadius: 999, background: 'conic-gradient(#ef4444 0 68%, rgba(255,255,255,0.14) 68% 100%)', padding: 9 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 999, background: '#0f172a' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 22 }}>
            {[44, 58, 74, 92].map((height, idx) => (
              <span key={height} style={{ height, borderRadius: 12, background: idx === 3 ? '#ef4444' : 'rgba(255,255,255,0.18)', alignSelf: 'end' }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section style={{ background: '#f8fafc', padding: '76px 24px 82px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: 44, alignItems: 'end', marginBottom: 34 }} className="cp-about-heading">
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 34, padding: '0 13px', borderRadius: 999, background: '#fff1f2', color: '#b91c1c', fontSize: 13, lineHeight: '18px', fontWeight: 850, marginBottom: 16 }}>
              Co řešíme
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(34px, 3.6vw, 56px)', lineHeight: 1.04, fontWeight: 930, color: '#0f172a', letterSpacing: 0 }}>
              Jedno místo pro rozhodnutí, která spolu souvisí
            </h2>
          </div>
          <p style={{ fontSize: 16, color: '#64748b', maxWidth: 560, margin: 0, lineHeight: 1.72, fontWeight: 540 }}>
            Neprodáváme izolované produkty. Pomáháme spojit bydlení, financování, investice a pojištění do plánu, který dává smysl pro vaši situaci.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 22 }} className="cp-about-card-grid">
          {cards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="cp-hero-card"
              style={{
                minHeight: 560,
                background: '#ffffff',
                borderRadius: 26,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
                padding: 28,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 'clamp(28px, 2.6vw, 42px)', lineHeight: 1.02, fontWeight: 930, color: '#0f172a', letterSpacing: 0 }}>
                {card.title}
              </div>
              <p style={{ marginTop: 16, marginBottom: 0, fontSize: 15, lineHeight: 1.62, color: '#475569', maxWidth: 520, fontWeight: 540 }}>
                {card.intro}
              </p>

              <ul style={{ margin: '22px 0 24px', padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {card.points.map((point) => (
                  <li key={point} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#0f172a', fontWeight: 650 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 999, background: '#fff1f2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, lineHeight: 1, flexShrink: 0, fontWeight: 900 }}>
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {renderMock(card.visual)}

              <div style={{ marginTop: 12 }}>
                <div style={{ width: '100%', minHeight: 50, borderRadius: 14, background: '#c81e1e', color: '#fff', fontSize: 15, fontWeight: 850, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 16px 32px rgba(200, 30, 30, 0.2)' }}>
                  <span>{card.cta}</span>
                  <span style={{ fontSize: 20 }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CPInvestmentSection() {
  const services = [
    {
      title: 'Bydlení a reality',
      href: '/bydleni-a-reality',
      image: '/wp/quadrio-exterier-2@2x.1765184383.jpg.webp',
      eyebrow: 'Nemovitost',
      text: 'Odhad ceny, příprava prodeje, financování nákupu i kontrola návazností.',
      points: ['Odhad tržní ceny', 'Prodej nebo nákup', 'Hypotéka a pojištění'],
    },
    {
      title: 'Investice a spoření',
      href: '/investice-a-sporeni',
      image: '/wp/AdobeStock_676162468.jpg',
      eyebrow: 'Budoucnost',
      text: 'Rezervy, dlouhodobé cíle, portfolio a pravidelná kontrola podle životní situace.',
      points: ['Krátká i dlouhá rezerva', 'Investiční strategie', 'Pravidelná revize'],
    },
    {
      title: 'Pojištění',
      href: '/pojisteni',
      image: '/wp/AdobeStock_676156911-1.jpg',
      eyebrow: 'Ochrana',
      text: 'Nastavení pojistek tak, aby chránily příjem, rodinu, majetek i podnikání.',
      points: ['Životní pojištění', 'Majetek a odpovědnost', 'Kontrola smluv'],
    },
    {
      title: 'Půjčky a hypotéky',
      href: '/pujcky-a-hypoteky',
      image: '/wp/AdobeStock_695328241_1.jpg',
      eyebrow: 'Financování',
      text: 'Srovnání možností, dopad na rozpočet a férový postup bez zbytečného tlaku.',
      points: ['Hypotéka', 'Refinancování', 'Konsolidace'],
    },
  ];

  return (
    <section style={{ background: '#ffffff', padding: '84px 24px 92px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 28, marginBottom: 34 }} className="cp-services-heading">
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 34, padding: '0 13px', borderRadius: 999, background: '#fff1f2', color: '#b91c1c', fontSize: 13, lineHeight: '18px', fontWeight: 850, marginBottom: 16 }}>
              Služby
            </span>
            <h2 style={{ margin: 0, maxWidth: 690, fontSize: 'clamp(34px, 3.6vw, 56px)', lineHeight: 1.04, fontWeight: 930, color: '#0f172a', letterSpacing: 0 }}>
              Vyberte, co chcete vyřešit jako první
            </h2>
          </div>
          <Link to="/kontakty" style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 50, padding: '0 18px', borderRadius: 14, background: '#0f172a', color: '#ffffff', textDecoration: 'none', fontSize: 14, fontWeight: 850 }}>
            Nechat si poradit
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }} className="cp-services-grid">
          {services.map((service) => (
            <Link
              key={service.href}
              to={service.href}
              className="cp-hero-card"
              style={{
                minHeight: 430,
                display: 'flex',
                flexDirection: 'column',
                padding: 14,
                borderRadius: 24,
                background: '#f8fafc',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 18px 44px rgba(15, 23, 42, 0.06)',
                color: '#0f172a',
                textDecoration: 'none',
              }}
            >
              <img src={service.image} alt={service.title} style={{ width: '100%', height: 170, borderRadius: 18, objectFit: 'cover', display: 'block' }} />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '18px 6px 4px' }}>
                <span style={{ color: '#b91c1c', fontSize: 12, lineHeight: '16px', fontWeight: 850 }}>{service.eyebrow}</span>
                <h3 style={{ margin: '9px 0 0', fontSize: 24, lineHeight: 1.08, fontWeight: 900, color: '#0f172a' }}>{service.title}</h3>
                <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 14, lineHeight: 1.5, fontWeight: 540 }}>{service.text}</p>
                <ul style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 7 }}>
                  {service.points.map((point) => (
                    <li key={point} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', fontSize: 13, lineHeight: 1.35, fontWeight: 700 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 999, background: '#fff1f2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
                <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', color: '#b91c1c', fontSize: 14, fontWeight: 850 }}>
                  Otevřít službu →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CPFinancingSection() {
  const products = [
    { title: 'Překlenovací úvěr', desc: 'Krátkodobé financování pro překlenutí cash flow', tag: '1–6 měsíců' },
    { title: 'Rychlý úvěr', desc: 'Financování investičních nemovitostních projektů', tag: 'do 48 h' },
    { title: 'Projektový úvěr', desc: 'Dlouhodobé financování výstavby nebo rekonstrukce', tag: '6–36 měsíců' },
    { title: 'Provozní úvěr', desc: 'Financování provozního kapitálu a růstu firmy', tag: 'flexibilní' },
  ];
  const params = [
    { value: '50 mil. Kč', label: 'Max. výše úvěru' },
    { value: '48 h', label: 'Posouzení žádosti' },
    { value: '4 dny', label: 'Čerpání prostředků' },
    { value: '0', label: 'Zbytečná byrokracie' },
  ];
  return (
    <section style={{ background: '#f4f7fc', padding: '96px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: 999, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Pro podnikatele</div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Financování pro vaše podnikání</h2>
          <p style={{ fontSize: 17, color: '#64748b', maxWidth: 560, margin: '0 auto' }}>Snadné a rychlé řešení bez zbytečného papírování. Peníze na účtu do 4 pracovních dnů.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 48 }}>
          {params.map((p) => (
            <div key={p.label} style={{ textAlign: 'center', padding: '24px 16px', borderRadius: 20, background: '#fff', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', marginBottom: 4 }}>{p.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{p.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {products.map((p) => (
            <div key={p.title} style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#dcfce7', color: '#15803d', display: 'inline-block', marginBottom: 12 }}>{p.tag}</span>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/financovani" style={{ padding: '14px 32px', borderRadius: 999, background: '#0d2b55', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Spočítat financování</Link>
          <Link to="/kontakty" style={{ padding: '14px 32px', borderRadius: 999, border: '2px solid #0d2b55', color: '#0d2b55', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Kontaktovat poradce</Link>
        </div>
      </div>
    </section>
  );
}

function CPStatsSection() {
  const stats = [
    { display: '4', label: 'Oblasti v jednom plánu', sub: 'reality, finance, investice, pojištění' },
    { display: '1', label: 'Kontaktní partner', sub: 'bez přehazování mezi odděleními' },
    { display: 'online', label: 'I osobně', sub: 'podle toho, co je pro vás rychlejší' },
    { display: 'průběžně', label: 'Kontrola nastavení', sub: 'protože život i trh se mění' },
  ];
  return (
    <section style={{ background: '#0f172a', padding: '72px 24px', color: '#ffffff' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 40, alignItems: 'center' }} className="cp-stats-wrap">
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 34, padding: '0 13px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: '#fca5a5', fontSize: 13, lineHeight: '18px', fontWeight: 850, marginBottom: 16 }}>
              Proč to drží pohromadě
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(34px, 3.5vw, 54px)', lineHeight: 1.04, fontWeight: 930, color: '#ffffff', letterSpacing: 0 }}>
              Méně chaosu. Více návazností.
            </h2>
            <p style={{ margin: '18px 0 0', color: '#cbd5e1', fontSize: 16, lineHeight: 1.7, fontWeight: 540 }}>
              Největší rozdíl není v jednom produktu, ale v tom, že rozhodnutí kolem bydlení, rezerv a ochrany neřešíte odděleně.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }} className="cp-stats-grid">
          {stats.map((s) => (
            <div key={s.label} style={{ minHeight: 168, padding: 22, borderRadius: 22, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 'clamp(30px, 3.2vw, 48px)', lineHeight: 1, fontWeight: 950, color: '#ffffff', marginBottom: 16 }}>{s.display}</div>
              <div style={{ fontSize: 15, lineHeight: 1.22, fontWeight: 850, color: '#ffffff', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: '#cbd5e1', fontWeight: 540 }}>{s.sub}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CPTestimonials() {
  const cases = [
    {
      label: 'Rodina kupuje byt',
      title: 'Hypotéka bez slepých míst',
      text: 'Porovnáme financování, rezervu po koupi, pojištění příjmu i návaznost na smlouvy a převod nemovitosti.',
      result: 'rozpočet drží i po nastěhování',
      steps: ['kupní smlouva', 'hypotéka', 'rezerva'],
    },
    {
      label: 'Majitel prodává nemovitost',
      title: 'Cena, příprava a bezpečný průběh',
      text: 'Pomůžeme určit realistickou cenu, připravit podklady a ohlídat, aby prodej navazoval na další bydlení nebo investice.',
      result: 'méně rizik mezi nabídkou a podpisem',
      steps: ['odhad ceny', 'prodej', 'navazující plán'],
    },
    {
      label: 'Klient řeší budoucnost',
      title: 'Rezerva, investice a ochrana',
      text: 'Srovnáme aktuální smlouvy, nastavíme rezervu a postavíme investiční plán podle horizontu a tolerance rizika.',
      result: 'produkty nepůsobí proti sobě',
      steps: ['rezerva', 'investice', 'ochrana příjmu'],
    },
  ];
  const timeline = [
    { time: '01', title: 'Co se mění dnes', text: 'Rozhodnutí, které potřebujete udělat teď: koupě, prodej, refinancování nebo kontrola smluv.' },
    { time: '02', title: 'Na co to navazuje', text: 'Dopad na rozpočet, rezervu, daňové a smluvní termíny i ochranu příjmu.' },
    { time: '03', title: 'Co hlídáme dál', text: 'Průběžná kontrola, aby plán zůstal použitelný i po změně sazeb, práce nebo rodinné situace.' },
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', padding: '90px 24px 98px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '0 0 auto',
          height: 280,
          background: 'linear-gradient(90deg, rgba(200,30,30,0.08), transparent 58%), linear-gradient(180deg, rgba(15,23,42,0.04), transparent)',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.86fr 1.14fr', gap: 48, alignItems: 'end', marginBottom: 38 }} className="cp-cases-heading">
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 34, padding: '0 13px', borderRadius: 999, background: '#fff1f2', color: '#b91c1c', fontSize: 13, lineHeight: '18px', fontWeight: 850, marginBottom: 16 }}>
              Typické situace
            </span>
            <h2 style={{ margin: 0, maxWidth: 640, fontSize: 'clamp(36px, 4vw, 62px)', lineHeight: 1.01, fontWeight: 940, color: '#0f172a', letterSpacing: 0 }}>
              Kdy společný postup udělá největší rozdíl
            </h2>
          </div>
          <div style={{ maxWidth: 600 }}>
            <p style={{ fontSize: 17, color: '#475569', margin: 0, lineHeight: 1.72, fontWeight: 550 }}>
              Nejčastěji nejde o jeden izolovaný požadavek. Hypotéka ovlivní rezervy, prodej nemovitosti investice a pojištění má chránit celý plán.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {['jeden kontext', 'méně slepých míst', 'jasné další kroky'].map((tag) => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 32, padding: '0 11px', borderRadius: 999, background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', color: '#334155', fontSize: 12.5, fontWeight: 820 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(340px, 0.8fr)', gap: 18, alignItems: 'stretch' }} className="cp-cases-layout">
          <div style={{ display: 'grid', gap: 14 }}>
            {cases.map((item, idx) => (
              <article
                key={item.label}
                className="cp-hero-card"
                style={{
                  minHeight: 214,
                  borderRadius: 28,
                  background: idx === 1 ? '#0f172a' : '#ffffff',
                  color: idx === 1 ? '#ffffff' : '#0f172a',
                  border: idx === 1 ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(15, 23, 42, 0.08)',
                  padding: 24,
                  display: 'grid',
                  gridTemplateColumns: '84px minmax(0, 1fr)',
                  gap: 22,
                  boxShadow: idx === 1 ? '0 26px 70px rgba(15, 23, 42, 0.18)' : '0 18px 44px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                  <span style={{ display: 'inline-flex', width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', background: idx === 1 ? '#c81e1e' : '#fff1f2', color: idx === 1 ? '#ffffff' : '#b91c1c', fontSize: 16, fontWeight: 930 }}>
                    0{idx + 1}
                  </span>
                  <span style={{ width: 2, flex: 1, minHeight: 70, marginLeft: 28, borderRadius: 999, background: idx === 1 ? 'rgba(255,255,255,0.18)' : 'rgba(200,30,30,0.18)' }} />
                </div>

                <div>
                  <div style={{ color: idx === 1 ? '#fca5a5' : '#b91c1c', fontSize: 12, lineHeight: '16px', fontWeight: 850, marginBottom: 8 }}>{item.label}</div>
                  <h3 style={{ margin: 0, color: 'inherit', fontSize: 'clamp(23px, 2.2vw, 34px)', lineHeight: 1.05, fontWeight: 920, letterSpacing: 0 }}>{item.title}</h3>
                  <p style={{ margin: '13px 0 0', color: idx === 1 ? '#cbd5e1' : '#475569', fontSize: 14.5, lineHeight: 1.58, fontWeight: 540, maxWidth: 620 }}>
                    {item.text}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 18 }}>
                    {item.steps.map((step) => (
                      <span key={step} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 30, padding: '0 10px', borderRadius: 999, background: idx === 1 ? 'rgba(255,255,255,0.1)' : '#f8fafc', border: idx === 1 ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.08)', color: idx === 1 ? '#ffffff' : '#334155', fontSize: 12, fontWeight: 780 }}>
                        {step}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8, color: idx === 1 ? '#ffffff' : '#0f172a', fontSize: 13, fontWeight: 880 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: idx === 1 ? '#ffffff' : '#0f172a', color: idx === 1 ? '#0f172a' : '#ffffff', fontSize: 12 }}>✓</span>
                    {item.result}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside style={{ position: 'relative', minHeight: 620, borderRadius: 30, overflow: 'hidden', background: '#111827', color: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.1)', boxShadow: '0 28px 80px rgba(15, 23, 42, 0.18)' }} className="cp-cases-aside">
            <img src="/wp/AdobeStock_676162468.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.24 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.52), #0f172a 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column', padding: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', width: 'max-content', minHeight: 34, padding: '0 12px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: '#fecaca', fontSize: 12, fontWeight: 850 }}>
                návaznosti v praxi
              </div>
              <h3 style={{ margin: '22px 0 0', fontSize: 'clamp(28px, 2.8vw, 42px)', lineHeight: 1.04, fontWeight: 930, color: '#ffffff', letterSpacing: 0 }}>
                Jedno rozhodnutí má několik dozvuků.
              </h3>
              <p style={{ margin: '14px 0 0', color: '#cbd5e1', fontSize: 14.5, lineHeight: 1.62, fontWeight: 540 }}>
                Proto se nedíváme jen na sazbu, cenu nebo pojistku. Sledujeme, co se stane před podpisem, po podpisu a za rok.
              </p>

              <div style={{ marginTop: 'auto', display: 'grid', gap: 12, paddingTop: 34 }}>
                {timeline.map((item) => (
                  <div key={item.time} style={{ display: 'grid', gridTemplateColumns: '46px minmax(0, 1fr)', gap: 14, alignItems: 'start', padding: 16, borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 14, background: '#ffffff', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 930 }}>
                      {item.time}
                    </span>
                    <div>
                      <strong style={{ display: 'block', color: '#ffffff', fontSize: 15, lineHeight: 1.22, fontWeight: 880 }}>{item.title}</strong>
                      <span style={{ display: 'block', marginTop: 6, color: '#cbd5e1', fontSize: 12.5, lineHeight: 1.48, fontWeight: 520 }}>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CPMobileAppSection() {
  const steps = [
    { title: 'Krátce popíšete situaci', text: 'Co řešíte teď, co vás tlačí časově a co nechcete pokazit.' },
    { title: 'Spojíme správné souvislosti', text: 'Bydlení, rozpočet, rezervu, smlouvy a ochranu dáme na jednu mapu.' },
    { title: 'Dostanete další krok', text: 'Jasné doporučení, co udělat první a co má počkat.' },
  ];
  const signals = [
    { value: '30 min', label: 'úvodní konzultace' },
    { value: '0 Kč', label: 'bez závazku' },
    { value: '1 plán', label: 'pro finance i bydlení' },
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#0f172a', padding: '92px 24px 104px', color: '#ffffff' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '62px 62px',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.82), transparent 86%)',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.82), transparent 86%)',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.02fr) minmax(360px, 0.98fr)',
            gap: 20,
            alignItems: 'stretch',
          }}
          className="cp-next-step-grid"
        >
          <div style={{ borderRadius: 32, padding: 34, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 28px 80px rgba(0,0,0,0.22)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 34, padding: '0 13px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', color: '#fca5a5', fontSize: 13, lineHeight: '18px', fontWeight: 850, marginBottom: 18 }}>
              Další krok
            </span>
            <h2 style={{ margin: 0, maxWidth: 650, fontSize: 'clamp(38px, 4.4vw, 68px)', lineHeight: 0.99, fontWeight: 950, color: '#ffffff', letterSpacing: 0 }}>
              Začněme tím, co potřebuje rozhodnutí nejdřív.
            </h2>
            <p style={{ maxWidth: 610, margin: '20px 0 0', color: '#cbd5e1', fontSize: 17, lineHeight: 1.7, fontWeight: 540 }}>
              Nemusíte mít připravené podklady ani přesné zadání. Stačí popsat, co se děje, a společně oddělíme urgentní kroky od věcí, které mají počkat.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 30 }} className="cp-next-step-signals">
              {signals.map((item) => (
                <div key={item.label} style={{ minHeight: 116, borderRadius: 22, padding: 18, background: '#ffffff', color: '#0f172a' }}>
                  <strong style={{ display: 'block', fontSize: 'clamp(25px, 2.6vw, 38px)', lineHeight: 1, fontWeight: 950 }}>{item.value}</strong>
                  <span style={{ display: 'block', marginTop: 10, color: '#64748b', fontSize: 13, lineHeight: 1.35, fontWeight: 720 }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
              <Link to="/kontakty" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 54, padding: '0 22px', borderRadius: 14, background: '#c81e1e', color: '#ffffff', textDecoration: 'none', fontSize: 15, lineHeight: '18px', fontWeight: 880, boxShadow: '0 18px 40px rgba(200, 30, 30, 0.28)' }}>
                Domluvit konzultaci
              </Link>
              <Link to="/bydleni-a-reality" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 54, padding: '0 22px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.18)', textDecoration: 'none', fontSize: 15, lineHeight: '18px', fontWeight: 850 }}>
                Projít služby
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 560, borderRadius: 32, overflow: 'hidden', background: '#ffffff', color: '#0f172a', boxShadow: '0 28px 80px rgba(0,0,0,0.24)' }} className="cp-next-step-panel">
            <img src="/wp/quadrio-exterier-2@2x.1765184383.jpg.webp" alt="" style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <span style={{ display: 'block', color: '#b91c1c', fontSize: 12, lineHeight: '16px', fontWeight: 850, marginBottom: 8 }}>rychlá orientace</span>
                  <h3 style={{ margin: 0, fontSize: 'clamp(27px, 2.7vw, 42px)', lineHeight: 1.02, fontWeight: 930, color: '#0f172a', letterSpacing: 0 }}>
                    Z konzultace má odejít klid i směr.
                  </h3>
                </div>
                <span style={{ flex: '0 0 auto', width: 54, height: 54, borderRadius: 18, background: '#fff1f2', color: '#b91c1c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, lineHeight: 1, fontWeight: 930 }}>
                  1
                </span>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {steps.map((step, idx) => (
                  <div key={step.title} style={{ display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gap: 14, alignItems: 'start', padding: 16, borderRadius: 20, background: idx === 1 ? '#fff1f2' : '#f8fafc', border: '1px solid rgba(15,23,42,0.07)' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 14, background: idx === 1 ? '#c81e1e' : '#0f172a', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 930 }}>
                      0{idx + 1}
                    </span>
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: 15.5, lineHeight: 1.25, fontWeight: 880 }}>{step.title}</strong>
                      <span style={{ display: 'block', marginTop: 6, color: '#64748b', fontSize: 13, lineHeight: 1.48, fontWeight: 530 }}>{step.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 22, background: '#0f172a', color: '#ffffff', display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 14, alignItems: 'center' }}>
                <span style={{ width: 42, height: 42, borderRadius: 15, background: '#c81e1e', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 930 }}>
                  ✓
                </span>
                <div>
                  <strong style={{ display: 'block', fontSize: 15, lineHeight: 1.24, fontWeight: 880 }}>Bez přeposílání mezi odděleními</strong>
                  <span style={{ display: 'block', marginTop: 4, color: '#cbd5e1', fontSize: 12.5, lineHeight: 1.45, fontWeight: 520 }}>Jeden partner drží kontext a hlídá návaznosti.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <CPHeroSection />
      <CPMediaBar />
      <CPAboutSection />
      <CPInvestmentSection />
      <CPStatsSection />
      <CPTestimonials />
      <CPMobileAppSection />
    </>
  );
}

function QuickActions({ content }: { content: HomeContent }) {
  return (
    <section className="section">
      <div className="shell">
        <h2>Rychlé odkazy</h2>
        <div className="quick-grid">
          {content.quickLinks.map((item, idx) => (
            <a key={`${item}-${idx}`} href="#" className="quick-item">
              {item || `Odkaz ${idx + 1}`}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ content }: { content: HomeContent }) {
  return (
    <section className="section tint faq">
      <div className="shell">
        <h2>Často se ptáte</h2>
        <div className="faq-list">
          {content.faqItems.map((item, idx) => (
            <details key={`${item.q}-${idx}`}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogListPage({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const visiblePosts = posts
    .map((post) => normalizeBlogPost(post))
    .filter((post) => isPublishedNow(post))
    .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
  const filteredPosts = visiblePosts.filter((post) => {
    const hay = `${post.title} ${stripHtml(post.excerpt)} ${stripHtml(post.content)} ${post.category} ${post.author}`.toLowerCase();
    return hay.includes(query.toLowerCase().trim());
  });
  const categories = Array.from(new Set(filteredPosts.map((p) => p.category))).filter(Boolean);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    setPage(1);
  }, [query]);

  return (
    <main className="contacts-page">
      <SubpageTopHero
        sectionClassName="contacts-hero"
        crumb="Poradna / Blog"
        title="Blog a poradna"
        description={<p>Novinky, tipy a praktické návody z financí, realit a online projektů.</p>}
        side={(
          <div className="contacts-hero-badge">
            <strong>{visiblePosts.length} článků</strong>
            <span>Průběžně aktualizováno</span>
          </div>
        )}
      />

      <section className="section">
        <div className="shell">
          <input
            type="search"
            style={{
              width: '100%',
              maxWidth: 560,
              minHeight: 44,
              border: '1px solid #d4dbe4',
              borderRadius: 999,
              padding: '0 16px',
              font: 'inherit',
            }}
            placeholder="Hledat v blogu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="quick-grid">
            {categories.map((cat) => (
              <span key={cat} className="quick-item">{cat}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell housing-grid">
          {paginatedPosts.map((post) => (
            <article key={post.id} className="housing-card">
              <img src={post.coverImage} alt={post.title} />
              <p className="subpage-crumbs">{post.category} · {post.author}</p>
              <h3>{post.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: post.excerpt }} />
              <p className="subpage-crumbs">{new Date(post.publishAt).toLocaleDateString('cs-CZ')}</p>
              <Link to={`/blog/${post.slug}`}>Číst článek</Link>
            </article>
          ))}
        </div>
        <div className="shell" style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button type="button" className="outline-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
            Předchozí
          </button>
          <span className="subpage-crumbs" style={{ alignSelf: 'center' }}>
            Strana {currentPage} / {totalPages}
          </span>
          <button type="button" className="outline-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
            Další
          </button>
        </div>
      </section>
    </main>
  );
}

function BlogDetailPage({ posts }: { posts: BlogPost[] }) {
  const { slug } = useParams();
  const post = posts.map((item) => normalizeBlogPost(item)).find((item) => item.slug === slug && isPublishedNow(item));

  if (!post) {
    return (
      <main className="contacts-page">
        <section className="section">
          <div className="shell">
            <h1>Článek nebyl nalezen</h1>
            <p>Zkontrolujte adresu nebo se vraťte na přehled blogu.</p>
            <Link to="/blog" className="solid-btn">Zpět na blog</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="contacts-page">
      <section className="section">
        <div className="shell">
          <p className="subpage-crumbs">Poradna / Blog / {post.title}</p>
          <h1>{post.title}</h1>
          <p>{post.category} · {post.author} · {new Date(post.publishAt).toLocaleDateString('cs-CZ')}</p>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', maxHeight: 480, objectFit: 'cover', borderRadius: 12 }} />
          <div style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: post.excerpt }} />
          <div style={{ marginTop: 18 }} dangerouslySetInnerHTML={{ __html: post.content }} />
          <Link to="/blog" className="outline-btn">Zpět na blog</Link>
        </div>
      </section>
    </main>
  );
}

function BetaPdfPage() {
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [positionX, setPositionX] = useState(80);
  const [positionY, setPositionY] = useState(120);
  const [signatureWidth, setSignatureWidth] = useState(180);
  const [signatureHeight, setSignatureHeight] = useState(70);
  const [hasInk, setHasInk] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ensureCanvas = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f1720';
  }, []);

  useEffect(() => {
    ensureCanvas();
  }, [ensureCanvas]);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleDrawStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ensureCanvas();
    const point = getCanvasPoint(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const handleDrawMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const point = getCanvasPoint(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasInk(true);
  };

  const handleDrawEnd = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    setStatusMessage(null);
  };

  const handlePickPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPdfFile(file);
    setStatusMessage(null);
    setPdfPageCount(1);
    setPageNumber(1);
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const pages = doc.getPages().length;
      const normalizedPages = Math.max(1, pages);
      setPdfPageCount(normalizedPages);
      setPageNumber(1);
    } catch {
      setPdfFile(null);
      setStatusMessage('Soubor není validní PDF dokument.');
    }
  };

  const handleSignAndDownload = async () => {
    if (!pdfFile) {
      setStatusMessage('Nejdříve nahrajte PDF soubor.');
      return;
    }
    if (!hasInk || !signatureCanvasRef.current) {
      setStatusMessage('Nejdříve vytvořte podpis do podpisového pole.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const targetIndex = Math.min(Math.max(1, pageNumber), pages.length) - 1;
      const targetPage = pages[targetIndex];
      const pngBytes = await fetch(signatureCanvasRef.current.toDataURL('image/png')).then((res) => res.arrayBuffer());
      const signatureImage = await pdfDoc.embedPng(pngBytes);

      const safeWidth = Math.max(40, Number(signatureWidth) || 180);
      const safeHeight = Math.max(20, Number(signatureHeight) || 70);
      const safeX = Math.max(0, Number(positionX) || 0);
      const safeTopY = Math.max(0, Number(positionY) || 0);
      const maxX = Math.max(0, targetPage.getWidth() - safeWidth);
      const drawX = Math.min(safeX, maxX);
      const drawYFromTop = targetPage.getHeight() - safeTopY - safeHeight;
      const maxY = Math.max(0, targetPage.getHeight() - safeHeight);
      const drawY = Math.max(0, Math.min(drawYFromTop, maxY));

      targetPage.drawImage(signatureImage, {
        x: drawX,
        y: drawY,
        width: safeWidth,
        height: safeHeight,
      });

      const output = await pdfDoc.save();
      const blob = new Blob([output], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sourceName = pdfFile.name.replace(/\.pdf$/i, '');
      link.href = objectUrl;
      link.download = `${sourceName || 'document'}-signed.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setStatusMessage('Podepsané PDF bylo vygenerováno a staženo.');
    } catch {
      setStatusMessage('Podepisování PDF selhalo. Zkontrolujte soubor a zkuste to znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="beta-pdf-page">
      <section className="section beta-pdf-section">
        <div className="shell">
          <div className="beta-pdf-head">
            <p className="subpage-crumbs">Nástroje / Beta PDF</p>
            <h1>Beta-pdf: podpis PDF online</h1>
            <p>
              Funkce inspirovaná flow „Make Signature PDF“: nahrajete PDF, nakreslíte podpis,
              nastavíte pozici a velikost a stáhnete podepsaný dokument.
            </p>
          </div>

          <div className="beta-pdf-grid">
            <article className="beta-pdf-card">
              <h2>1) Nahrajte PDF</h2>
              <input type="file" accept="application/pdf" onChange={handlePickPdf} />
              <p className="beta-pdf-note">
                {pdfFile ? `Soubor: ${pdfFile.name} (${pdfPageCount} stran)` : 'Zatím není nahraný žádný PDF soubor.'}
              </p>
            </article>

            <article className="beta-pdf-card">
              <h2>2) Nakreslete podpis</h2>
              <canvas
                ref={signatureCanvasRef}
                width={640}
                height={220}
                className="beta-signature-canvas"
                onPointerDown={handleDrawStart}
                onPointerMove={handleDrawMove}
                onPointerUp={handleDrawEnd}
                onPointerLeave={handleDrawEnd}
              />
              <div className="beta-pdf-actions">
                <button type="button" className="outline-btn" onClick={handleClearSignature}>Vymazat podpis</button>
              </div>
            </article>

            <article className="beta-pdf-card">
              <h2>3) Umístění a export</h2>
              <div className="beta-pdf-fields">
                <label>
                  Strana
                  <input
                    type="number"
                    min={1}
                    max={pdfPageCount}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(Number(e.target.value) || 1)}
                  />
                </label>
                <label>
                  X od levého okraje (pt)
                  <input
                    type="number"
                    min={0}
                    value={positionX}
                    onChange={(e) => setPositionX(Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Y od horního okraje (pt)
                  <input
                    type="number"
                    min={0}
                    value={positionY}
                    onChange={(e) => setPositionY(Number(e.target.value) || 0)}
                  />
                </label>
                <label>
                  Šířka podpisu (pt)
                  <input
                    type="number"
                    min={40}
                    value={signatureWidth}
                    onChange={(e) => setSignatureWidth(Number(e.target.value) || 180)}
                  />
                </label>
                <label>
                  Výška podpisu (pt)
                  <input
                    type="number"
                    min={20}
                    value={signatureHeight}
                    onChange={(e) => setSignatureHeight(Number(e.target.value) || 70)}
                  />
                </label>
              </div>
              <div className="beta-pdf-actions">
                <button type="button" className="solid-btn" onClick={handleSignAndDownload} disabled={isSubmitting}>
                  {isSubmitting ? 'Zpracovávám...' : 'Podepsat a stáhnout PDF'}
                </button>
              </div>
              {statusMessage ? <p className="beta-pdf-status">{statusMessage}</p> : null}
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function PujckyPage() {
  return <ServiceDetailPage data={serviceDetailPages.loans} />;
}

function InvesticePage() {
  return <ServiceDetailPage data={serviceDetailPages.investments} />;
}

function PojisteniPage() {
  return <ServiceDetailPage data={serviceDetailPages.insurance} />;
}

function PodnikatelePage() {
  return (
    <main>
      <SubpageTopHero
        sectionClassName="housing-hero"
        crumb="Home / Podnikatelé"
        title="Pro Podnikatele"
        description={(
          <>
            <p>
              Komplexní finanční a realitní servis pro OSVČ i firmy. Podnikatelský účet,
              firemní hypotéka, investice i správa obchodních nemovitostí — vše na jednom místě.
            </p>
            <p>
              Rozumíme podnikatelskému světu a navrhujeme řešení, která skutečně fungují.
            </p>
          </>
        )}
        cta={<Link to="/kontakty" className="solid-btn">Konzultace pro firmy →</Link>}
        side={(
          <figure className="subpage-hero-media">
            <img src="/wp/AdobeStock_323336140.jpg" alt="Pro podnikatele" />
          </figure>
        )}
      />

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>Služby pro podnikatele</h2>
          </div>
          <div className="current-feature-grid">
            {[
              { title: 'Podnikatelský účet', text: 'Vedení zdarma, hromadné platby, správa oprávnění pro celý tým. Vše online.' },
              { title: 'Firemní hypotéka', text: 'Financování komerčních nemovitostí, provozovny i investičních projektů.' },
              { title: 'Podnikatelská půjčka', text: 'Provozní a investiční úvěry pro OSVČ i s.r.o. Rychlé schválení, férové podmínky.' },
              { title: 'Správa komerčních nemovitostí', text: 'Pronájem, facility management a optimalizace výnosů firemních prostor.' },
              { title: 'API a integrace', text: 'Propojení s vaším účetnictvím nebo ERP systémem přes otevřené API.' },
              { title: 'Firemní pojištění', text: 'Pojištění majetku, odpovědnosti, vozového parku i klíčových osob firmy.' },
            ].map((item) => (
              <article key={item.title} className="current-feature-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint current-pricing">
        <div className="shell current-pricing-grid">
          <div>
            <h2>Podnikatelský účet bez poplatků</h2>
            <p>Základní provoz firmy za nula korun. Platíte jen za nadstandardní služby, které skutečně využíváte.</p>
          </div>
          <div className="current-pricing-box">
            <div><span>Vedení účtu</span><strong>0 Kč</strong></div>
            <div><span>Příchozí platby</span><strong>0 Kč</strong></div>
            <div><span>Odchozí platby CZK</span><strong>0 Kč</strong></div>
            <div><span>Platební karta</span><strong>0 Kč</strong></div>
            <div><span>Online správa</span><strong>0 Kč</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BezpecnostPage() {
  return (
    <main>
      <SubpageTopHero
        sectionClassName="housing-hero"
        crumb="Home / Bezpečnost"
        title="Bezpečnost"
        description={(
          <>
            <p>
              Vaše peníze a data chráníme na maximum. Moderní šifrování, dvoufaktorové ověření
              a nepřetržitý monitoring transakcí jsou samozřejmostí.
            </p>
            <p>
              Pokud si nejste jistí, zda jde o podvod nebo neobvyklou transakci — zavolejte nám.
              Jsme tu 24/7.
            </p>
          </>
        )}
        cta={<a href="tel:+420800123456" className="solid-btn">Nahlásit incident →</a>}
        side={(
          <figure className="subpage-hero-media">
            <img src="/wp/AdobeStock_676156911-1.jpg" alt="Bezpečnost" />
          </figure>
        )}
      />

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>Jak chráníme vaše finance</h2>
          </div>
          <div className="current-feature-grid">
            {[
              { title: 'Dvoufaktorové ověření', text: 'Přihlášení i platby potvrzujete v mobilu. Bez vašeho souhlasu se nic nepohne.' },
              { title: 'Šifrování dat', text: 'Veškerá komunikace probíhá přes šifrované spojení TLS 1.3. Data jsou chráněna na serverech v EU.' },
              { title: 'Monitoring transakcí', text: 'Systémy detekce podvodů sledují každou transakci v reálném čase a upozorní vás na nestandardní chování.' },
              { title: 'Okamžitá blokace karty', text: 'Kartu zablokujete v aplikaci okamžitě — bez čekání na zákaznickou linku.' },
              { title: 'Bezpečnostní notifikace', text: 'Každá platba a přihlášení vám přijde jako notifikace. Máte přehled o každém pohybu.' },
              { title: 'Vzdělávání a prevence', text: 'Pravidelně informujeme o aktuálních podvodech a phishingových kampaních cílených na české uživatele.' },
            ].map((item) => (
              <article key={item.title} className="current-feature-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint">
        <div className="shell">
          <div className="section-head">
            <h2>Jak poznat podvod</h2>
          </div>
          <div className="faq-list">
            {[
              { q: 'Volá mi někdo, kdo se vydává za Český Partner. Co mám dělat?', a: 'Nikdy neposkytujte hesla, PIN ani kódy z SMS. Zavěste a zavolejte nám na 800 123 456. Naši pracovníci nikdy žádají tyto údaje po telefonu.' },
              { q: 'Dostal jsem podezřelý e-mail s odkazem. Je to phishing?', a: 'Pravé e-maily od nás vždy končí @ceskypartner.cz. Neotevírejte přílohy ani neklikejte na odkazy z neznámých adres. Podejte hlášení přes kontaktní formulář.' },
              { q: 'Vidím transakci, kterou jsem neprovedl. Co teď?', a: 'Okamžitě zablokujte kartu v aplikaci a kontaktujte naši podporu na 800 123 456 (nonstop). Zahájíme reklamační řízení.' },
              { q: 'Je moje přihlášení bezpečné?', a: 'Doporučujeme zapnout dvoufaktorové ověření, používat silné heslo a nepřihlašovat se na veřejných Wi-Fi sítích bez VPN.' },
            ].map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Footer() {
  const footerCols = [
    {
      heading: 'Služby',
      links: [
        { label: 'Bydlení a reality', href: '/bydleni-a-reality' },
        { label: 'Půjčky a hypotéky', href: '/pujcky-a-hypoteky' },
        { label: 'Investice a spoření', href: '/investice-a-sporeni' },
        { label: 'Pojištění', href: '/pojisteni' },
      ],
    },
    {
      heading: 'Pro koho',
      links: [
        { label: 'Kupující nemovitost', href: '/bydleni-a-reality' },
        { label: 'Majitelé a prodávající', href: '/bydleni-a-reality' },
        { label: 'Rodiny a domácnosti', href: '/pojisteni' },
        { label: 'Podnikatelé', href: '/podnikatele' },
      ],
    },
    {
      heading: 'Společnost',
      links: [
        { label: 'O nás', href: '/o-nas' },
        { label: 'Kontakty', href: '/kontakty' },
        { label: 'Bezpečnost', href: '/bezpecnost' },
        { label: 'Poradna', href: '/poradna' },
      ],
    },
  ];
  const badges = ['reality', 'finance', 'ochrana', 'investice'];

  return (
    <footer style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', color: '#0f172a', borderTop: '1px solid rgba(15,23,42,0.08)' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '0 0 auto',
          height: 180,
          background: 'linear-gradient(90deg, rgba(200,30,30,0.08), transparent 56%)',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto', padding: '58px 24px 26px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr repeat(3, 0.72fr) 1fr', gap: 22, marginBottom: 42, alignItems: 'start' }} className="cp-footer-grid">
          <div style={{ maxWidth: 360 }}>
            <img
              src="/brand/logo-ceskypartner.svg"
              alt="Český Partner"
              style={{ height: 53, marginBottom: 18 }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p style={{ margin: '0 0 18px', color: '#475569', fontSize: 15, lineHeight: 1.62, fontWeight: 540 }}>
              Nezávislé poradenství pro rozhodnutí kolem bydlení, financí, rezerv a ochrany majetku.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {badges.map((badge) => (
                <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 30, padding: '0 10px', borderRadius: 999, background: '#fff1f2', color: '#b91c1c', fontSize: 12, fontWeight: 820 }}>
                  {badge}
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <a href="mailto:info@ceskypartner.cz" style={{ fontSize: 15, color: '#0f172a', textDecoration: 'none', fontWeight: 760 }}>info@ceskypartner.cz</a>
              <a href="tel:+420211221940" style={{ fontSize: 15, color: '#0f172a', textDecoration: 'none', fontWeight: 760 }}>+420 211 221 940</a>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 14, lineHeight: 1.2, fontWeight: 880, color: '#0f172a', margin: '0 0 14px' }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} style={{ fontSize: 14, lineHeight: 1.35, color: '#64748b', textDecoration: 'none', fontWeight: 620 }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ borderRadius: 24, padding: 22, background: '#0f172a', color: '#ffffff', boxShadow: '0 20px 50px rgba(15,23,42,0.16)' }}>
            <span style={{ display: 'block', color: '#fca5a5', fontSize: 12, lineHeight: '16px', fontWeight: 850, marginBottom: 10 }}>rychlý kontakt</span>
            <h4 style={{ margin: 0, color: '#ffffff', fontSize: 22, lineHeight: 1.12, fontWeight: 920 }}>
              Nejste si jistí, kde začít?
            </h4>
            <p style={{ margin: '12px 0 18px', color: '#cbd5e1', fontSize: 13.5, lineHeight: 1.55, fontWeight: 520 }}>
              Napište nám pár vět. Ozveme se a pomůžeme vybrat první rozumný krok.
            </p>
            <Link to="/kontakty" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 46, borderRadius: 14, background: '#c81e1e', color: '#ffffff', textDecoration: 'none', fontSize: 14, fontWeight: 880 }}>
              Kontaktovat poradce
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              <span style={{ minHeight: 58, borderRadius: 16, padding: 12, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontSize: 12, lineHeight: 1.3, fontWeight: 720 }}>online i osobně</span>
              <span style={{ minHeight: 58, borderRadius: 16, padding: 12, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontSize: 12, lineHeight: 1.3, fontWeight: 720 }}>bez závazku</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(15,23,42,0.1)', paddingTop: 18, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.45, fontWeight: 520 }}>
            Copyright 2026 © Český Partner. Všechna práva vyhrazena.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {[
              { label: 'Ochrana osobních údajů', href: '/ochrana-osobnich-udaju' },
              { label: 'Podmínky používání', href: '/podminky' },
              { label: 'Cookies', href: '/cookies' },
            ].map((link) => (
              <Link key={link.label} to={link.href} style={{ color: '#64748b', fontSize: 12.5, textDecoration: 'none', fontWeight: 650 }}>
                {link.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Zpět nahoru"
            style={{ width: 42, height: 42, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 900, cursor: 'pointer' }}
          >
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

export function App() {
  const isCountdownEnabled = import.meta.env.VITE_SHOW_COUNTDOWN === '1';
  const isBetaPreview = typeof window !== 'undefined' && window.location.pathname.startsWith('/beta');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(defaultBlogPosts.map((post) => normalizeBlogPost(post)));
  const [blogReady, setBlogReady] = useState(false);
  const [blogSaveState, setBlogSaveState] = useState<SaveState>('idle');
  const [seoPages, setSeoPages] = useState<Record<string, SeoPageMeta>>(defaultSeoPages);
  const [auditLog, setAuditLog] = useState<Array<{ id: string; at: string; actor: string; role?: string; action: string; keys: string[] }>>([]);
  const blogDirtyRef = useRef(false);
  const isCmsMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('cms') === '1' || params.get('editor') === '1' || window.location.pathname.startsWith('/cms');
  }, []);

  const handleChangeBlogPosts = (posts: BlogPost[]) => {
    blogDirtyRef.current = true;
    setBlogPosts(posts);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const remote = await fetchCmsState();
      if (!alive) return;
      if (Array.isArray(remote?.blogPosts) && remote.blogPosts.length > 0) {
        setBlogPosts(remote.blogPosts.map((post) => normalizeBlogPost(post)));
      }
      if (remote?.seoPages && typeof remote.seoPages === 'object') {
        setSeoPages({ ...defaultSeoPages, ...(remote.seoPages as Record<string, SeoPageMeta>) });
      }
      if (Array.isArray(remote?.auditLog)) {
        setAuditLog(remote.auditLog);
      }
      setBlogReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!blogReady || !blogDirtyRef.current) return;
    blogDirtyRef.current = false;
    setBlogSaveState('saving');
    const t = window.setTimeout(() => {
      patchCmsState({ blogPosts }).then((ok) => {
        setBlogSaveState(ok ? 'saved' : 'error');
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [blogPosts, blogReady]);

  if (isCountdownEnabled && !isBetaPreview) {
    return <CountdownPage />;
  }

  return (
    <>
      <SeoManager blogPosts={blogPosts} seoPages={seoPages} />
      {isCmsMode ? (
        <GlobalVisualEditor
          blogPosts={blogPosts}
          onChangeBlogPosts={handleChangeBlogPosts}
          blogSaveState={blogSaveState}
          seoPages={seoPages}
          onChangeSeoPages={setSeoPages}
          auditLog={auditLog}
        />
      ) : null}
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bydleni-a-reality" element={<HousingRealityPage />} />
        <Route path="/produkty/bezny-ucet" element={<CurrentAccountPage />} />
        <Route path="/pujcky-a-hypoteky" element={<PujckyPage />} />
        <Route path="/investice-a-sporeni" element={<InvesticePage />} />
        <Route path="/pojisteni" element={<PojisteniPage />} />
        <Route path="/podnikatele" element={<PodnikatelePage />} />
        <Route path="/bezpecnost" element={<BezpecnostPage />} />
        <Route path="/kontakty" element={<ContactsPage />} />
        <Route path="/o-nas" element={<AboutPage />} />
        <Route path="/beta-pdf" element={<BetaPdfPage />} />
        <Route path="/blog" element={<BlogListPage posts={blogPosts} />} />
        <Route path="/blog/:slug" element={<BlogDetailPage posts={blogPosts} />} />
      </Routes>
      <Footer />
    </>
  );
}
