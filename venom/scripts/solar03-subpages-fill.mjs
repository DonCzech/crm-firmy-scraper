import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const TENANT_ID = 1055;
const DEFAULT_TOKENS = {
  spacing: "normal",
  fontBody: "'Inter', -apple-system, sans-serif",
  colorText: "#222222",
  colorAccent: "#ff8b00",
  colorBorder: "#ebebeb",
  fontHeading: "'Inter', -apple-system, sans-serif",
  borderRadius: "9999px",
  colorPrimary: "#ff8b00",
  colorSurface: "#f3f5f6",
  colorSecondary: "#222222",
  colorTextMuted: "#575757",
  colorBackground: "#ffffff"
};

// Get pageId → sections
async function getPage(slug) {
  const p = await c.query("SELECT id FROM pages WHERE tenant_id=$1 AND slug=$2", [TENANT_ID, slug]);
  return p.rows[0]?.id;
}
async function getSections(pageId) {
  const s = await c.query("SELECT id, section_type, section_variant, order_index FROM sections WHERE page_id=$1 ORDER BY order_index", [pageId]);
  return s.rows;
}

async function updateSection(id, patch) {
  const parts = [];
  const vals = [];
  let i = 1;
  for (const [k,v] of Object.entries(patch)) {
    if (k === "content_overrides") { parts.push(`content_overrides = $${i}::jsonb`); vals.push(JSON.stringify(v)); }
    else if (k === "settings") { parts.push(`settings = $${i}::jsonb`); vals.push(JSON.stringify(v)); }
    else { parts.push(`${k} = $${i}`); vals.push(v); }
    i++;
  }
  vals.push(id);
  await c.query(`UPDATE sections SET ${parts.join(", ")}, updated_at = NOW() WHERE id = $${i}`, vals);
}

async function insertSection(pageId, tenantId, type, variant, orderIndex, contentOverrides) {
  const settings = { content: contentOverrides, designTokens: DEFAULT_TOKENS };
  const r = await c.query(
    `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
     VALUES ($1, $2, $3, $4, $5, true, $6::jsonb, $7::jsonb, 'v2') RETURNING id`,
    [tenantId, pageId, type, variant, orderIndex, JSON.stringify(settings), JSON.stringify(contentOverrides)]
  );
  return r.rows[0].id;
}

// Per-page banner overrides (hero slim variant)
function bannerOverrides({ title, eyebrow, subtitle, current }) {
  return { eyebrow, title, subtitle, breadcrumb: "Domů", breadcrumbHref: "/", current: current || title };
}

// Content section templates
const CONTENT = {
  ofirme: {
    banner: bannerOverrides({
      eyebrow: "O SolarPro",
      title: "Dvě dekády tichého závazku energetice",
      subtitle: "Jsme český výrobce s vlastním vývojem, výrobou i servisní sítí. Nezaklikáváme přeprodej — dodáváme technologie, které vznikají u nás doma a stojíme za nimi 20 let.",
      current: "O firmě"
    }),
    sections: [
      { type: "about", variant: "solar-03-about", content: {
        eyebrow: "Naše hodnoty",
        title: "Deset zásad, které dodržujeme od roku 2006",
        subtitle: "Podle čeho poznáte, že máte před sebou skutečně SolarPro a ne montážní firmu bez odpovědnosti.",
        items: [
          { title: "Český výrobce, ne přeprodejce",     description: "Vlastní vývoj i výroba klíčových komponent v Jihočeském kraji." },
          { title: "Vlastní servisní síť",              description: "Technici v každém kraji, reakce do 24 hodin ve všední den." },
          { title: "Prodloužená záruka až 10 let",      description: "Ošetřeno smluvně, ne slibem. Za jasnou cenou i po záruce." },
          { title: "Certifikované komponenty",          description: "CE, TÜV, evropská certifikace a ověřená životnost 25+ let." },
          { title: "Individuální projekt každé zakázce",description: "Žádné typové řešení. Návrh podle vašeho objektu a spotřeby." },
          { title: "Kompletní dotační servis",          description: "NZÚ, OP TAK, Nová zelená úsporám. 99% úspěšnost žádostí." },
          { title: "Vzdálený monitoring 24/7",          description: "Problém odhalíme dříve, než ho zaznamenáte. Prevence než servis." },
          { title: "Fixní cena bez skrytých položek",   description: "Cena z nabídky = cena z faktury. Zvýšení jen po dohodě." },
          { title: "Etický obchodní kodex",             description: "Nepodepíšete, když si nejste 100% jistí. Konzultace zdarma." },
          { title: "Ochrana životního prostředí",       description: "Nulové emise CO₂ z provozu. Recyklace komponent po jejich životnosti." }
        ]
      }},
      { type: "stats", variant: "solar-03-stats", content: {
        eyebrow: "SolarPro v číslech",
        title: "Fakta místo marketingu",
        subtitle: "Čísla, která můžeme kdykoliv doložit smlouvami, referencemi a servisními výkazy.",
        stats: [
          { icon: "trophy",  value: "20",       label: "let na českém trhu", description: "Od roku 2006 dodáváme energetická řešení pro rodinné i komerční projekty." },
          { icon: "house",   value: "15 000+",  label: "hotových instalací", description: "Rodiny, firmy i SVJ, kteří nám svěřili své vytápění nebo výrobu elektřiny." },
          { icon: "factory", value: "100 %",    label: "česká výroba",       description: "Klíčové komponenty vznikají v Jihočeském kraji. Kupujete českou preciznost." },
          { icon: "check",   value: "99 %",     label: "úspěšnost dotací",   description: "Zpracováváme žádosti NZÚ a Nová zelená úsporám. Bez dohodnutí neplatíte nic." }
        ]
      }},
      { type: "testimonials", variant: "solar-03-testimonials", content: {
        eyebrow: "Reference",
        title: "Co říkají zákazníci, kterým jsme dodali",
        subtitle: "Přes 15 000 realizací a stovky hodnocení na Google. Vybíráme ty, kteří nejlépe popisují náš přístup.",
        ratingLabel: "Průměrné hodnocení",
        ratingValue: "4,9 / 5,0",
        ratingMeta: "1 240 recenzí na Google",
        reviews: [
          { name: "Petra Horáčková", role: "majitelka RD", city: "České Budějovice",
            text: "Celý proces od první schůzky přes projektovou dokumentaci až po spuštění systému proběhl naprosto hladce. Tým SolarPro byl vždy dostupný a odpovídal rychle. Vřele doporučuji." },
          { name: "Roman Blažek", role: "investor komerční nemovitosti", city: "Brno",
            text: "Měl jsem obavy z administrativy kolem dotace, ale SolarPro vyřídilo vše za mě. Bez starostí, v termínu a za cenu z nabídky." },
          { name: "Jana Kubešová", role: "majitelka rodinného domu", city: "Plzeň",
            text: "Po půl roce provozu kombinace čerpadla a fotovoltaiky šetřím přes 60 %. Instalace za dva dny, montéři precizní. Lepší investici jsem neudělala." }
        ]
      }}
    ]
  },

  kontakt: {
    banner: bannerOverrides({
      eyebrow: "Kontakt",
      title: "Ozvěte se nám a spočítáme vám úsporu",
      subtitle: "Do 48 hodin od poptávky vám zavolá energetický poradce. Prohlédne váš objekt, spočítá spotřebu a připraví nezávazný návrh systému.",
      current: "Kontakt"
    }),
    sections: [
      { type: "promo", variant: "solar-03-process", content: {
        eyebrow: "Jak se s námi spojit",
        title: "Čtyři cesty, jak nastartovat spolupráci",
        subtitle: "Zavolejte, napište nebo přijeďte do showroomu. Vždy máte konkrétního člověka, který vaši poptávku převezme.",
        image: "/templates/solar-03/process.webp",
        specValue: "48 h",
        specLabel: "reakční doba od doručení poptávky",
        steps: [
          { title: "Zavolejte našim energetickým poradcům",  description: "+420 800 555 234 · Po–Pá 8:00–18:00. Poradce vás vyslechne, ujasní si rozsah a předá vaši poptávku technikovi ve vašem regionu." },
          { title: "Napište přes online poptávkový formulář", description: "info@solarpro.cz. Přílohy typu fotky objektu, faktury za energie a půdorys nám velmi pomůžou při návrhu." },
          { title: "Přijeďte do showroomu v Českých Budějovicích", description: "Průmyslová 1428. Uvidíte tepelná čerpadla, panely i baterie fyzicky. Konzultace zdarma, na termín stačí zavolat den předem." },
          { title: "Nechte si od nás zavolat zpět",           description: "Vyplňte krátký formulář — jméno, telefon, adresa objektu. Volnáme zpět do 4 hodin ve všední den." }
        ]
      }},
      { type: "about", variant: "solar-03-about", content: {
        eyebrow: "Praktické informace",
        title: "Vše, co potřebujete vědět předem",
        subtitle: "Otevírací doba, adresy, servisní linka a kontakty na jednotlivé regiony — kompaktně na jednom místě.",
        items: [
          { title: "Ústředí a výrobní závod",       description: "Průmyslová 1428, 370 01 České Budějovice · Po–Pá 8:00–17:00" },
          { title: "Regionální kancelář Praha",     description: "Vinohradská 2828/151, 130 00 Praha 3 · Po–Pá 9:00–17:00" },
          { title: "Regionální kancelář Brno",      description: "Cejl 494/25, 602 00 Brno · Po–Pá 8:30–17:00" },
          { title: "Regionální kancelář Ostrava",   description: "28. října 3117, 702 00 Ostrava · Po–Pá 8:30–16:30" },
          { title: "Servisní linka NON-STOP",       description: "+420 800 555 999 · pouze pro zákazníky se servisní smlouvou" },
          { title: "Obchodní linka",                description: "+420 800 555 234 · Po–Pá 8:00–18:00, So 9:00–12:00" },
          { title: "E-mail poptávky",               description: "info@solarpro.cz · odpovídáme do 4 hodin ve všední den" },
          { title: "E-mail servisu",                description: "servis@solarpro.cz · pro reklamace a servisní zásahy" },
          { title: "E-mail dotací",                 description: "dotace@solarpro.cz · přímý kontakt na oddělení NZÚ" },
          { title: "IČ a DIČ",                      description: "IČ 26749823 · DIČ CZ26749823 · spisová značka C 12 345 vedená u KS v ČB" }
        ]
      }}
    ]
  },

  realizace: {
    banner: bannerOverrides({
      eyebrow: "Realizace",
      title: "Projekty, které mluví za nás",
      subtitle: "Vybrané instalace tepelných čerpadel, fotovoltaiky a hybridních systémů z posledních let. Reálné objekty, reálné úspory, reálné rodiny.",
      current: "Realizace"
    }),
    sections: [
      { type: "services", variant: "solar-03-services", content: {
        eyebrow: "Nedávné projekty",
        title: "Tři instalace, které dokončily rozhodování zákazníků",
        subtitle: "Konkrétní čísla, konkrétní objekty. Rádi vás k nim vezmeme na osobní návštěvu — reference jsou domluvitelné.",
        cards: [
          { tag: "Rodinný dům", title: "RD České Budějovice — vzduch-voda 12 kW",
            subtitle: "výměna plynového kotle za tepelné čerpadlo",
            image: "/templates/solar-03/services-1.webp",
            bullets: ["Roční úspora 68 % oproti plynu", "COP 4,8 při dodávkové teplotě 35 °C", "Instalace za 3 pracovní dny"],
            ctaText: "Detail realizace", ctaHref: "/realizace" },
          { tag: "Bytový dům", title: "SVJ Praha 4 — FVE 34 kWp + BESS 30 kWh",
            subtitle: "sdílená spotřeba pro 24 bytových jednotek",
            image: "/templates/solar-03/services-2.webp",
            bullets: ["Roční výroba 34 MWh", "Průměrná úspora 2 800 Kč / rok / byt", "Dotace NZÚ 40 % pokryta"],
            ctaText: "Detail realizace", ctaHref: "/realizace" },
          { tag: "Komerční", title: "Výrobní hala Plzeň — hybridní systém 78 kWp",
            subtitle: "FVE + tepelná čerpadla + baterie",
            image: "/templates/solar-03/services-3.webp",
            bullets: ["Soběstačnost 74 % v letní sezóně", "Návratnost 5,8 roku", "Nulové emise CO₂ z vytápění haly"],
            ctaText: "Detail realizace", ctaHref: "/realizace" }
        ]
      }},
      { type: "testimonials", variant: "solar-03-testimonials", content: {
        eyebrow: "Slovo od zákazníků",
        title: "Jak proběhla spolupráce z jejich pohledu",
        subtitle: "Nekurátorované úryvky z Google recenzí a servisních dotazníků. Odkazy na originály na požádání.",
        ratingLabel: "Průměrné hodnocení",
        ratingValue: "4,9 / 5,0",
        ratingMeta: "1 240 recenzí na Google",
        reviews: [
          { name: "Petra Horáčková", role: "majitelka RD", city: "České Budějovice",
            text: "Instalace čerpadla proběhla přesně tak, jak bylo domluveno. Žádné překvapení, žádné vícenáklady. Systém funguje první rok bez závady." },
          { name: "Roman Blažek", role: "SVJ Praha 4", city: "Praha",
            text: "Za SVJ bych si to znovu vybral. Administrativa dotace, spouštění, i následný monitoring — vše hladké." },
          { name: "Jana Kubešová", role: "majitelka rodinného domu", city: "Plzeň",
            text: "Hybridní systém překonal moje očekávání. V létě jsem téměř mimo síť, v zimě šetřím výrazně na topení." }
        ]
      }}
    ]
  },

  sortiment: {
    banner: bannerOverrides({
      eyebrow: "Sortiment",
      title: "Modelová řada 2026 pro rodinné i komerční projekty",
      subtitle: "Tepelná čerpadla, fotovoltaika, baterie a monitoring. Vše z vlastního vývoje, sladěné do jednoho systému, který spolu komunikuje.",
      current: "Sortiment"
    }),
    sections: [
      { type: "services", variant: "solar-03-services", content: {
        eyebrow: "Modelové řady",
        title: "Tři platformy, které pokryjí všechny typy objektů",
        subtitle: "Vybíráte podle výkonu a zdroje energie. Konzultace zdarma vám pomůže vybrat konkrétní model.",
        cards: [
          { tag: "Tepelná čerpadla", title: "EcoTherm Air",
            subtitle: "vzduch-voda 6 / 9 / 12 kW",
            image: "/templates/solar-03/services-1.webp",
            bullets: ["COP až 5,1 při 7 °C", "Tichý provoz od 35 dB", "Wi-Fi monitoring v ceně"],
            ctaText: "Datasheet & ceník", ctaHref: "/kontakt" },
          { tag: "Fotovoltaika", title: "SolarPanel 550 W",
            subtitle: "monokrystalické panely + optimizéry",
            image: "/templates/solar-03/services-2.webp",
            bullets: ["Výkon 550 Wp / panel", "Účinnost 22,1 %", "Záruka výkonu 25 let"],
            ctaText: "Datasheet & ceník", ctaHref: "/kontakt" },
          { tag: "Baterie", title: "BatteryPro LiFePO4",
            subtitle: "úložiště 10 / 15 / 20 kWh",
            image: "/templates/solar-03/services-3.webp",
            bullets: ["6 000 cyklů životnost", "Ochranné prvky proti požáru", "Skalovatelné po 5 kWh"],
            ctaText: "Datasheet & ceník", ctaHref: "/kontakt" }
        ]
      }},
      { type: "about", variant: "solar-03-about", content: {
        eyebrow: "Technické parametry",
        title: "Deset vlastností, které dělají rozdíl",
        subtitle: "Co všechny naše modely v roce 2026 sdílí a v čem jsou napřed proti konkurenci.",
        items: [
          { title: "Kompatibilita napříč řadou",          description: "Čerpadlo, panely i baterie komunikují přes jednu centrálu — bez třetích stran." },
          { title: "Chladivo R290 (propan)",              description: "Přírodní chladivo s minimálním dopadem na atmosféru (GWP < 3)." },
          { title: "Modulace výkonu invertorem",          description: "Plynulá regulace 25–100 % výkonu. Šetří elektřinu i mechanické díly." },
          { title: "Chytrá krátká cesta k SVE",           description: "V zimě předehřev, v létě chlazení. Jeden systém, dvě funkce." },
          { title: "Cloud monitoring 24/7",               description: "Webová aplikace a mobilní app. Zdarma po celou životnost systému." },
          { title: "IP54 venkovní jednotky",              description: "Odolné vůči dešti, sněhu i prachu. Nepotřebují stříšku ani přístřešek." },
          { title: "Rychlá diagnostika chyb",             description: "Servisní technik vidí historii i aktuální stav ještě před odjezdem." },
          { title: "Kompatibilita s bezdotovými wallboxy", description: "Panely mohou přednostně napájet nabíječku elektromobilu s optimalizací výkonu." },
          { title: "Firmware update over-the-air",        description: "Nové funkce dostanete bez návštěvy technika. Vždy nejnovější verze." },
          { title: "Snadná servisovatelnost",             description: "Modulární design. Výměna jednotlivých částí bez demontáže celého systému." }
        ]
      }}
    ]
  },

  poradna: {
    banner: bannerOverrides({
      eyebrow: "Poradna",
      title: "Nejčastější otázky, ke kterým se pořád vracíme",
      subtitle: "Sbírka odpovědí, které nám zákazníci nejčastěji kladou. Vybíráme to podstatné — dotace, technika, provoz i servis.",
      current: "Poradna"
    }),
    sections: [
      { type: "about", variant: "solar-03-about", content: {
        eyebrow: "Časté otázky",
        title: "Deset odpovědí, se kterými se rozhodnete klidněji",
        subtitle: "Pokud vaši otázku nevidíte, ozvěte se nám — energetický poradce vám odpoví do 4 hodin ve všední den.",
        items: [
          { title: "Kolik stojí tepelné čerpadlo pro průměrný RD?", description: "Ceníková cena instalace 6 kW začíná okolo 285 000 Kč včetně DPH. Konečná cena po dotaci NZÚ může být pod 150 000 Kč." },
          { title: "Za jak dlouho se instalace vrátí?",             description: "U tepelných čerpadel typicky 6–8 let, u kombinace čerpadlo + FVE 4–6 let. Konkrétní výpočet zpracujeme v návrhu." },
          { title: "Jak dlouho trvá vyřízení dotace NZÚ?",          description: "Podání žádosti do 2 týdnů od podpisu smlouvy. Rozhodnutí SFŽP obvykle do 3 měsíců. Výplata dotace do 6 měsíců od realizace." },
          { title: "Můžu mít fotovoltaiku bez baterie?",             description: "Ano, ale zbytek elektřiny prodáte distribuci za nižší cenu. Baterie zvýší soběstačnost z ~30 % na 70–80 %." },
          { title: "Zvládne čerpadlo topit i v −25 °C?",             description: "Ano. Naše řada EcoTherm Air je dimenzovaná na provoz do −27 °C. Při extrémních teplotách se aktivuje elektrická vložka pro krátkodobou pomoc." },
          { title: "Bude na střeše vidět kabeláž?",                  description: "Ne. Veškerá kabeláž vede uvnitř střešní krytiny nebo v maskovacích lištách. Estetika je součástí zadání." },
          { title: "Musím mít třífázové připojení?",                 description: "Pro čerpadla nad 8 kW ano. Pro FVE nad 10 kWp také. Menší systémy zvládne i jednofázová přípojka." },
          { title: "Co se stane při výpadku sítě?",                  description: "Standardní FVE se odpojí (podmínka distribuce). Náš hybridní systém s baterií a UPS modulem umí ostrovní provoz do několika hodin." },
          { title: "Jak často je nutný servis?",                     description: "Preventivní prohlídka jednou ročně. Vzdálený monitoring odhalí problém automaticky, takže nemusíte hlídat." },
          { title: "Prodám instalaci s domem?",                      description: "Ano, převod technologie je součástí kupní smlouvy. Nový majitel dostává zbytek záruky i servisní smlouvy." }
        ]
      }},
      { type: "promo", variant: "solar-03-process", content: {
        eyebrow: "Dotační proces krok za krokem",
        title: "Jak si zajistíme dotaci NZÚ za vás",
        subtitle: "Většina zákazníků neví, kudy začít. Zjednodušili jsme celý dotační proces do čtyř kroků, které řešíme my — vy jen podepisujete.",
        image: "/templates/solar-03/process.webp",
        specValue: "99 %",
        specLabel: "úspěšnost dotačních žádostí v roce 2025",
        steps: [
          { title: "Ověření nároku a příprava podkladů",          description: "Zkontrolujeme vaše LV, energetický průkaz a vlastnické vztahy. Připravíme kompletní balík dokumentů pro žádost." },
          { title: "Podání žádosti přes portál SFŽP",             description: "Podáme žádost do 14 dní od podpisu smlouvy. Sledujeme stav v systému a hlásíme vám změny." },
          { title: "Realizace a dokumentace pro výplatu",         description: "Po instalaci připravíme protokol o dokončení, foto dokumentaci a technické podklady pro výplatu dotace." },
          { title: "Výplata dotace přímo na váš účet",            description: "SFŽP vyplácí dotaci přímo vám. My hlídáme, aby výplata proběhla v termínu. Bez dohodnutí neplatíte." }
        ]
      }}
    ]
  },

  aktuality: {
    banner: bannerOverrides({
      eyebrow: "Aktuality",
      title: "Novinky ze světa energetiky a firmy",
      subtitle: "Změny dotačních programů, technické novinky, návody a příběhy zákazníků. Aktualizujeme, když je co říct — bez plnícího obsahu.",
      current: "Aktuality"
    }),
    sections: [
      { type: "services", variant: "solar-03-services", content: {
        eyebrow: "Nejnovější články",
        title: "Tři témata, která teď stojí za pozornost",
        subtitle: "Vybrané texty z posledních týdnů. Kompletní archiv článků najdete v našem newsletteru — přihlaste se přes kontaktní formulář.",
        cards: [
          { tag: "Dotace 2026", title: "Nová vlna NZÚ pro bytové domy",
            subtitle: "publikováno 12. června 2026",
            image: "/templates/solar-03/services-1.webp",
            bullets: ["Zvýšené dotace až 60 %", "Rozšíření o rekuperační jednotky", "Podávání od 1. září 2026"],
            ctaText: "Přečíst článek", ctaHref: "/aktuality" },
          { tag: "Technika", title: "SolarPanel 620 W přichází v Q4",
            subtitle: "publikováno 3. června 2026",
            image: "/templates/solar-03/services-2.webp",
            bullets: ["Účinnost 23,4 %", "Nová řada TOPCon buněk", "Kompatibilita s BESS 3. gen"],
            ctaText: "Přečíst článek", ctaHref: "/aktuality" },
          { tag: "Příběh", title: "Rodina Novákových: rok s hybridem",
            subtitle: "publikováno 28. května 2026",
            image: "/templates/solar-03/services-3.webp",
            bullets: ["Roční úspora 74 000 Kč", "Soběstačnost 76 %", "Fotografie a rozhovor uvnitř"],
            ctaText: "Přečíst článek", ctaHref: "/aktuality" }
        ]
      }}
    ]
  },

  monitoring: {
    banner: bannerOverrides({
      eyebrow: "Monitoring",
      title: "Vždy víte, jak váš systém pracuje",
      subtitle: "Naše cloudová platforma vám ukazuje výrobu, spotřebu i úspory v reálném čase. Zdarma po celou životnost systému a bez závislosti na třetích stranách.",
      current: "Monitoring"
    }),
    sections: [
      { type: "services", variant: "solar-03-services", content: {
        eyebrow: "Co monitoring umí",
        title: "Tři nástroje, které máte v jedné aplikaci",
        subtitle: "Web, iOS i Android. Rozdělené role pro majitele, technika i servis — každý vidí, co potřebuje.",
        cards: [
          { tag: "Přehled", title: "Live dashboard výroby a spotřeby",
            subtitle: "grafy v reálném čase",
            image: "/templates/solar-03/services-2.webp",
            bullets: ["Aktuální výkon FVE i čerpadla", "Sledování soběstačnosti", "Historie za 5 let zpět"],
            ctaText: "Zobrazit ukázku", ctaHref: "/kontakt" },
          { tag: "Úspory", title: "Ekonomický přehled a bilance",
            subtitle: "měsíční a roční reporty",
            image: "/templates/solar-03/services-1.webp",
            bullets: ["Automatický výpočet úspor", "Export pro účetnictví", "Porovnání proti historii"],
            ctaText: "Zobrazit ukázku", ctaHref: "/kontakt" },
          { tag: "Servis", title: "Prediktivní diagnostika závad",
            subtitle: "cloud + AI vyhodnocení",
            image: "/templates/solar-03/services-3.webp",
            bullets: ["Automatické upozornění na anomálie", "Notifikace pro majitele i servis", "Předchází výpadku o týdny"],
            ctaText: "Zobrazit ukázku", ctaHref: "/kontakt" }
        ]
      }},
      { type: "about", variant: "solar-03-about", content: {
        eyebrow: "Proč cloudový monitoring SolarPro",
        title: "Deset důvodů, proč nespoléhat na aplikaci třetí strany",
        subtitle: "Většina konkurentů dodává hardware jednoho výrobce a monitoring jiného. My máme vše pod jednou střechou — a to je znát.",
        items: [
          { title: "Zdarma po celou životnost systému",   description: "Žádné roční poplatky ani limitace funkcí. Cena systému = cena monitoringu." },
          { title: "Data zůstávají v ČR",                  description: "Hostujeme na tuzemské infrastruktuře, splňujeme GDPR i NIS2." },
          { title: "Otevřené API pro integrace",           description: "Napojte si data na Home Assistant, LoxONE nebo vlastní systém." },
          { title: "Historie 5+ let zpět",                 description: "Neztrácíme starší data. Grafy si můžete zobrazit i po letech." },
          { title: "Nativní iOS + Android + web",          description: "Tři platformy s identickými funkcemi. Přizpůsobené rozlišením." },
          { title: "Notifikace push i e-mailem",           description: "Vy si vyberete, na co chcete být upozorněni a jakou cestou." },
          { title: "Rozdělené role v aplikaci",            description: "Majitel vidí úspory, technik vidí diagnostiku. Práva na míru." },
          { title: "Automatické firmware updaty",          description: "Nové funkce dostanete bez zásahu — vždy máte nejnovější verzi." },
          { title: "Export do CSV i JSON",                 description: "Data si můžete kdykoliv stáhnout. Nikdy nejste zamčeni v našem ekosystému." },
          { title: "Uptime 99,95 %",                       description: "Historicky měřená dostupnost cloudu. SLA i výkazy si můžete vyžádat." }
        ]
      }}
    ]
  }
};

// Execute per subpage
async function processSubpage(slug, config) {
  const pageId = await getPage(slug);
  if (!pageId) { console.log(`SKIP ${slug} — page not found`); return; }
  const secs = await getSections(pageId);
  console.log(`\n▶ /${slug} (page ${pageId}) — ${secs.length} sections`);

  const hero = secs.find(s => s.section_type === "hero");
  const footer = secs.find(s => s.section_type === "footer");

  // 1. Update hero → slim banner variant
  if (hero) {
    const heroSettings = { content: config.banner, designTokens: DEFAULT_TOKENS };
    await updateSection(hero.id, {
      section_variant: "hero-solar-03-page",
      content_overrides: config.banner,
      settings: heroSettings
    });
    console.log(`  ✓ hero ${hero.id} → hero-solar-03-page`);
  }

  // 2. Move footer to high temp index
  if (footer) {
    await updateSection(footer.id, { order_index: 999 });
  }

  // 3. Insert new content sections (2, 3, 4...) — first delete any prior "content" sections between hero and footer beyond the original navbar/hero/footer
  const nonEssential = secs.filter(s => !["navbar","hero","footer"].includes(s.section_type));
  for (const s of nonEssential) {
    await c.query("DELETE FROM sections WHERE id=$1", [s.id]);
    console.log(`  ✗ removed old ${s.section_type} ${s.id}`);
  }

  let orderIdx = 2;
  for (const cs of config.sections) {
    const newId = await insertSection(pageId, TENANT_ID, cs.type, cs.variant, orderIdx, cs.content);
    console.log(`  ➕ ${cs.type} ${cs.variant} (id ${newId}) at ${orderIdx}`);
    orderIdx++;
  }

  // 4. Restore footer to end
  if (footer) {
    await updateSection(footer.id, { order_index: orderIdx });
    console.log(`  ✓ footer ${footer.id} moved to ${orderIdx}`);
  }
}

for (const [slug, cfg] of Object.entries(CONTENT)) {
  await processSubpage(slug, cfg);
}

console.log("\n✅ ALL SUBPAGES DONE");
await c.end();
