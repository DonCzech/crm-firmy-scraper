export type PricingRow = { label: string; price: string };
export type TwoColItem = { label: string; text: string };
export type ServiceSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  rows?: PricingRow[];
  twoCol?: TwoColItem[];
  price?: string;
};

export type ServiceItem = {
  id: string;
  symbol: string;
  emoji: string;
  color: string;
  title: string;
  teaser: string;
  lead: string;
  body?: string;
  sections: ServiceSection[];
  cta: { label: string; href: string };
};

export const RESERVATION_URL = "https://app.rezora.cz/book/astera";
export const RESERVATION_LABEL = "Rezervovat termín";

export const services: ServiceItem[] = [
  {
    id: "karty", symbol: "☽", emoji: "🃏", color: "#9b6fd4",
    title: "Výklad karet",
    teaser: "Získejte jasnější pohled na to, co se právě děje – i kam vaše cesta směřuje.",
    lead: "Hledáte odpovědi, směr nebo ujištění v důležité životní situaci? Výklad karet vám pomůže nahlédnout pod povrch a získat jasnější pohled na to, co se právě děje – i kam vaše cesta směřuje.",
    body: "Vstupte do prostoru, kde se zastavuje čas a odpovědi přicházejí v pravý okamžik.",
    sections: [
      { heading: "Jak probíhá výklad", paragraphs: ["Výklad karet je hluboký a osobní proces. Každé sezení je zcela individuální a věnuji se pouze omezenému počtu klientů, aby byla zachována maximální kvalita a hloubka práce.", "Pracuji především s Tarotem, doplňkově využívám orákula, cikánské karty, runy a další nástroje."] },
      { heading: "Formy výkladu", rows: [{ label: "Online živě (60–90 minut)", price: "3 600 Kč" }, { label: "Videozpráva (soukromý odkaz na YouTube)", price: "2 600 Kč" }, { label: "Textová zpráva nebo e-mail včetně fotografií", price: "1 200 Kč" }] },
      { heading: "Osobní setkání v Praze", paragraphs: ["Pro hlubší a intenzivnější práci nabízím také osobní setkání (60–180 minut).", "Toto sezení je určeno pouze pro stávající klienty, kteří již mají zkušenost s online výkladem. Kombinuje výklad, poradenství, channeling, mediumství a energetickou harmonizaci."], rows: [{ label: "Cena osobního setkání", price: "5 900 Kč" }] },
    ],
    cta: { label: RESERVATION_LABEL, href: RESERVATION_URL },
  },
  {
    id: "ocista", symbol: "✦", emoji: "🏠", color: "#5a9e7c",
    title: "Očista prostor",
    teaser: "Navracím do domovů a pracovních prostor klid, lehkost a pocit bezpečí.",
    lead: "Pomáhám navracet do domovů i pracovních prostor klid, lehkost a pocit bezpečí. Očista přináší rovnováhu a uvolnění tam, kde se hromadí napětí nebo stagnace.",
    sections: [
      { heading: "Kdy je očista vhodná", list: ["při stěhování", "po náročných životních obdobích", "při dlouhodobé nemoci v prostoru", "při pocitu neklidu, napětí nebo nevysvětlitelných jevů"] },
      { heading: "Ceník (orientační)", paragraphs: ["Očistu provádím individuálně, s respektem k prostoru i jeho obyvatelům."], rows: [{ label: "Garsonka a 1+kk", price: "3 900 – 4 900 Kč" }, { label: "2+kk a byty do 50 m²", price: "5 900 – 7 900 Kč" }, { label: "3+kk až 5+kk do 120 m²", price: "8 900 – 13 900 Kč" }, { label: "Rodinné domy a samostatné objekty", price: "14 900 – 29 900 Kč" }, { label: "Průvodce samostatnou očistou (e-shop)", price: "1 290 Kč" }] },
    ],
    cta: { label: RESERVATION_LABEL, href: RESERVATION_URL },
  },
  {
    id: "amulety", symbol: "⊕", emoji: "✨", color: "#c08040",
    title: "Amulety a talismany",
    teaser: "Osobní předmět nositelem záměru, energie a vědomé práce na vaší cestě.",
    lead: "Osobní amulet nebo talisman je víc než jen předmět. Je nositelem záměru, energie a vědomé práce, která vás provází na vaší cestě.",
    body: "Každý kus vzniká individuálně, v napojení na vaši energii a konkrétní záměr.",
    sections: [
      { heading: "Rozdíl mezi amuletem a talismanem", twoCol: [{ label: "Amulet", text: "Chrání, vytváří štít a ochrannou bariéru. Pomáhá odpuzovat nežádoucí vlivy, situace, energie nebo konkrétní osoby. Omezuje to, co vás oslabuje nebo narušuje vaši rovnováhu." }, { label: "Talisman", text: "Posiluje to, co chcete ve svém životě rozvíjet. Přitahuje žádoucí energii, příležitosti a lidi. Podporuje vaše záměry, zvyšuje šance a zesiluje to, po čem toužíte." }] },
      { heading: "Možnosti využití", list: ["ochrana a posílení", "přitažení příležitostí", "podpora vztahů nebo přivolání partnera", "ochrana před toxickým prostředím", "důležité životní momenty (zkoušky, cesty apod.)"] },
      { heading: "Jak probíhá spolupráce", paragraphs: ["Součástí procesu je úvodní konzultace, během které společně ujasníme váš záměr a směr tvorby.", "Cena konzultace se následně odečítá z celkové ceny."], rows: [{ label: "Amulet / talisman na míru", price: "4 400 – 19 900 Kč" }] },
    ],
    cta: { label: RESERVATION_LABEL, href: RESERVATION_URL },
  },
  {
    id: "medium", symbol: "☆", emoji: "🌙", color: "#5878c0",
    title: "Mediumní výklady",
    teaser: "Pomáhám najít klid, pochopení a uzavření tam, kde zůstávají nevyřčené věci.",
    lead: "Neuzavřené vztahy nebo ztráta blízkého člověka mohou zůstávat hluboko v nás. Mediumní výklad vám může pomoci najít klid, pochopení i uzavření.",
    body: "Zprostředkovávám komunikaci a vhledy, které vám pomohou uvolnit emoce, dořešit nevyřčené a posunout se dál.",
    sections: [{ rows: [{ label: "Video, online setkání nebo osobně v Praze", price: "3 600 Kč" }] }],
    cta: { label: RESERVATION_LABEL, href: RESERVATION_URL },
  },
  {
    id: "energo", symbol: "◈", emoji: "💫", color: "#a84a80",
    title: "Energetická očista člověka",
    teaser: "Hluboká práce obnovující vnitřní rovnováhu a uvolňující to, co již neslouží.",
    lead: "Jemná, ale hluboká práce, která obnovuje vnitřní rovnováhu a uvolňuje to, co již neslouží.",
    body: "Energetická očista probíhá na dálku a zasahuje pět úrovní bytí – fyzickou, emoční, mentální i další jemnohmotné vrstvy. Výsledkem bývá pocit úlevy, větší lehkosti a návratu k sobě.",
    sections: [{ rows: [{ label: "Individuální sezení na dálku", price: "3 300 Kč" }] }],
    cta: { label: RESERVATION_LABEL, href: RESERVATION_URL },
  },
  {
    id: "na-miru", symbol: "✧", emoji: "🔮", color: "#7c6ad4",
    title: "Služby na míru",
    teaser: "Individuální kombinace vedení, výkladu a energetické práce podle toho, co právě potřebujete.",
    lead: "Někdy se situace nevejde do jedné konkrétní služby. Společně pojmenujeme, co právě řešíte, a navrhnu citlivý postup šitý na míru vašemu záměru, prostoru i aktuální energii.",
    body: "Služba může propojit konzultaci, výklad, očistu, práci se záměrem nebo doporučení dalších kroků podle vaší konkrétní situace.",
    sections: [
      { heading: "Kdy je vhodná", list: ["když si nejste jistí, jakou službu zvolit", "pokud se téma dotýká více oblastí najednou", "když potřebujete individuální plán nebo citlivé nasměrování", "při specifické životní situaci, která vyžaduje osobní přístup"] },
      { heading: "Cena a rozsah", paragraphs: ["Rozsah i forma se domlouvají individuálně podle tématu, hloubky práce a časové náročnosti."], rows: [{ label: "Individuální návrh služby", price: "dle domluvy" }] },
    ],
    cta: { label: RESERVATION_LABEL, href: RESERVATION_URL },
  },
];
