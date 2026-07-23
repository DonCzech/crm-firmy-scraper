export const SITE_URL = "https://asteralight.cz";
export const SITE_NAME = "Astera Light";
export const SITE_LOCALE = "cs_CZ";
export const SITE_LANGUAGE = "cs-CZ";

export type PublicRoute = {
  path: string;
  title: string;
  description: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
};

export const PUBLIC_ROUTES: PublicRoute[] = [
  {
    path: "/",
    title: "Astera Light | výklad karet, očista prostoru a intuitivní vedení",
    description:
      "Astera Light nabízí výklady karet, očistu prostor, energetickou práci a jemné intuitivní vedení pro klidnější domov i život.",
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    path: "/about",
    title: "O Asteře | Astera Light",
    description:
      "Poznejte Asteru, intuitivní průvodkyni pro práci s energií, kartami, prostorem a osobní proměnou.",
    priority: 0.78,
    changeFrequency: "monthly",
  },
  {
    path: "/sluzby",
    title: "Služby | výklad karet, očista prostoru a energetická práce",
    description:
      "Přehled služeb Astera Light: výklad karet, očista prostor, amulety, mediumní výklady a individuální energetická práce.",
    priority: 0.94,
    changeFrequency: "weekly",
  },
  {
    path: "/pick-a-card",
    title: "Karta dne zdarma | vyberte si intuitivní kartu",
    description:
      "Vyberte si intuitivní kartu dne zdarma a získejte jemný vzkaz pro další krok, zklidnění a lepší napojení na sebe.",
    priority: 0.9,
    changeFrequency: "daily",
  },
  {
    path: "/events",
    title: "Akce a online setkání | Astera Light",
    description:
      "Živá a online setkání s Asterou pro výklad karet, intuici, zklidnění, práci se záměrem a jemné vedení v bezpečném prostoru.",
    priority: 0.88,
    changeFrequency: "weekly",
  },
];

export type SeoPage = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lead: string;
  sections: Array<{ title: string; body: string }>;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  related: string[];
  priority: number;
};

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "vyklad-karet",
    title: "Výklad karet online i osobně | Astera Light",
    description:
      "Citlivý výklad karet pro vztahy, životní rozhodnutí, práci i vnitřní směr. Online, formou zprávy nebo po domluvě osobně.",
    eyebrow: "Tarot, orákula a intuitivní vhled",
    heading: "Výklad karet pro chvíle, kdy potřebujete jasněji vidět",
    lead:
      "Výklad karet u Astery není rychlá atrakce, ale klidný prostor pro pojmenování toho, co se děje pod povrchem. Pomáhá získat nadhled, ulevit napětí a vybrat další krok s větší důvěrou.",
    sections: [
      {
        title: "Kdy výklad pomáhá",
        body:
          "Hodí se ve chvílích, kdy řešíte vztahy, práci, rozhodování, opakující se vzorce nebo vnitřní nejistotu. Karty neberou odpovědnost z vašich rukou, ale dokážou ukázat souvislosti, které v běžném napětí snadno zaniknou.",
      },
      {
        title: "Jak probíhá",
        body:
          "Sezení může proběhnout online živě, formou soukromé videozprávy nebo textového výkladu. Astera pracuje s tarotem, orákuly a intuicí tak, aby výstup byl srozumitelný, laskavý a prakticky použitelný.",
      },
    ],
    bullets: ["vztahy a životní rozhodnutí", "práce, poslání a další směr", "vnitřní bloky a opakující se vzorce", "jemné doporučení dalších kroků"],
    ctaLabel: "Rezervovat výklad",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["karta-dne", "oracle-karty", "intuitivni-vhled"],
    priority: 0.86,
  },
  {
    slug: "ocista-prostor",
    title: "Očista prostor a domova | Astera Light",
    description:
      "Energetická očista bytu, domu nebo pracovního prostoru pro větší klid, lehkost a pocit bezpečí.",
    eyebrow: "Domov, energie a bezpečí",
    heading: "Očista prostor pro návrat lehkosti a klidu",
    lead:
      "Domov i pracovní prostředí v sobě nesou nálady, události a napětí. Očista prostoru pomáhá uvolnit stagnaci a vrátit místu pocit bezpečí, čistoty a přirozeného nadechnutí.",
    sections: [
      {
        title: "Pro jaké situace je vhodná",
        body:
          "Očista se hodí po stěhování, rozchodu, dlouhodobé nemoci, náročných konfliktech nebo ve chvíli, kdy se v prostoru necítíte dobře bez jasné příčiny.",
      },
      {
        title: "Citlivý a praktický přístup",
        body:
          "Astera pracuje s respektem k místu i lidem, kteří v něm žijí. Součástí může být doporučení jednoduchých kroků, jak si harmonii prostoru udržovat i po samotné očistě.",
      },
    ],
    bullets: ["byty, domy a pracovní prostory", "očista po náročném období", "zklidnění napětí v prostoru", "doporučení pro dlouhodobou péči"],
    ctaLabel: "Domluvit očistu",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["energeticka-ocista", "harmonizace-domova", "prace-s-energii"],
    priority: 0.86,
  },
  {
    slug: "energeticka-ocista",
    title: "Energetická očista člověka | Astera Light",
    description:
      "Jemná energetická práce na dálku pro uvolnění zátěže, větší lehkost a návrat k sobě.",
    eyebrow: "Vnitřní rovnováha",
    heading: "Energetická očista pro uvolnění toho, co už neslouží",
    lead:
      "Energetická očista člověka je citlivá práce s tím, co se v těle, emocích a vnitřním prostoru nahromadilo. Cílem je úleva, zklidnění a posílení přirozené rovnováhy.",
    sections: [
      {
        title: "Co můžete očekávat",
        body:
          "Práce probíhá individuálně a na dálku. Zaměřuje se na uvolnění přetížení, podporu vnitřní stability a jemné navrácení pozornosti zpět k sobě.",
      },
      {
        title: "Kdy ji zvolit",
        body:
          "Může být vhodná po intenzivním období, při pocitu vyčerpání, vnitřní zahlcenosti nebo ve chvíli, kdy potřebujete podpořit hlubší změnu.",
      },
    ],
    bullets: ["uvolnění emoční zátěže", "podpora při změně", "jemná práce na dálku", "větší klid a ukotvení"],
    ctaLabel: "Rezervovat termín",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["ocista-prostor", "osobni-transformace", "vnitrni-klid"],
    priority: 0.82,
  },
  {
    slug: "karta-dne",
    title: "Karta dne zdarma | intuitivní vzkaz od Astery",
    description:
      "Vytáhněte si kartu dne a získejte krátké intuitivní vedení pro dnešní energii, rozhodnutí nebo zklidnění.",
    eyebrow: "Denní intuitivní vzkaz",
    heading: "Karta dne jako jemné zastavení uprostřed dne",
    lead:
      "Karta dne je jednoduchý způsob, jak se na chvíli zastavit, nadechnout a všimnout si, co s vámi právě rezonuje. Není to předpověď osudu, ale laskavý podnět k vnitřnímu naslouchání.",
    sections: [
      {
        title: "Jak s kartou pracovat",
        body:
          "Než kartu vyberete, položte si v duchu otázku nebo záměr. Vzkaz si přečtěte pomalu a všímejte si, která slova se vás dotýkají nejvíc.",
      },
      {
        title: "Proč jen jednou denně",
        body:
          "Jedna karta za den pomáhá udržet výběr čistý a soustředěný. Místo opakovaného klikání dává prostor tomu, aby vzkaz mohl opravdu doznít.",
      },
    ],
    bullets: ["krátký vzkaz pro dnešní den", "intuitivní výběr karty", "zastavení a zklidnění", "navazující výklad karet"],
    ctaLabel: "Vybrat kartu",
    ctaHref: "/pick-a-card",
    related: ["pick-a-card", "vyklad-karet", "oracle-karty"],
    priority: 0.84,
  },
  {
    slug: "oracle-karty",
    title: "Oracle karty a intuitivní vedení | Astera Light",
    description:
      "Oracle karty jako nástroj pro intuici, klidnější rozhodování a jemné vedení v každodenním životě.",
    eyebrow: "Práce s orákuly",
    heading: "Oracle karty otevírají prostor pro intuici",
    lead:
      "Oracle karty pomáhají pojmenovat jemné pocity, skryté souvislosti a vnitřní impulzy. Astera je používá jako nástroj vedení, který propojuje intuici s praktickým uchopením tématu.",
    sections: [
      {
        title: "Rozdíl oproti tarotu",
        body:
          "Oracle karty nejsou vázané jedním pevným systémem. Díky tomu mohou být velmi jemné, obrazové a přístupné i lidem, kteří s kartami teprve začínají.",
      },
      {
        title: "V čem pomáhají",
        body:
          "Mohou podpořit sebereflexi, zklidnění a citlivější vnímání dalšího kroku. Nejde o definitivní verdikt, ale o pozvání k hlubšímu rozhovoru se sebou.",
      },
    ],
    bullets: ["intuitivní práce s obrazy", "jemné otázky a odpovědi", "podpora v rozhodování", "propojení s výkladem karet"],
    ctaLabel: "Vyzkoušet kartu dne",
    ctaHref: "/pick-a-card",
    related: ["vyklad-karet", "intuitivni-vhled", "oracle-circle"],
    priority: 0.8,
  },
  {
    slug: "intuitivni-vhled",
    title: "Intuitivní vhled a duchovní vedení | Astera Light",
    description:
      "Jemný intuitivní vhled pro vztahy, práci, osobní cestu a období změny.",
    eyebrow: "Jasnost ve změně",
    heading: "Intuitivní vhled pro situace, které nejdou rozhodnout jen hlavou",
    lead:
      "Někdy fakta nestačí. Intuitivní vhled pomáhá zachytit hlubší vrstvu situace, pojmenovat vnitřní dynamiku a najít směr, který je pravdivý i praktický.",
    sections: [
      {
        title: "Pro koho je vhodný",
        body:
          "Pro lidi, kteří stojí na prahu rozhodnutí, opakují se jim podobné situace nebo cítí, že potřebují slyšet i jemnější souvislosti, ne jen logickou analýzu.",
      },
      {
        title: "Jaký má výstup",
        body:
          "Cílem je srozumitelný vhled, doporučení dalších kroků a větší vnitřní klid. Astera kombinuje intuici s citlivým vedením a jasným jazykem.",
      },
    ],
    bullets: ["vztahy a osobní témata", "rozhodování v nejistotě", "vnitřní směr a poslání", "praktické kroky po sezení"],
    ctaLabel: "Domluvit konzultaci",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["vyklad-karet", "osobni-transformace", "vnitrni-klid"],
    priority: 0.8,
  },
  {
    slug: "amulety-a-talismany",
    title: "Amulety a talismany na míru | Astera Light",
    description:
      "Osobní amulet nebo talisman vytvořený podle záměru, energie a aktuální životní situace.",
    eyebrow: "Záměr, ochrana a podpora",
    heading: "Amulety a talismany jako osobní nositel záměru",
    lead:
      "Amulet nebo talisman může být jemnou připomínkou rozhodnutí, ochrany nebo energie, kterou chcete ve svém životě posílit. Astera tvoří každý kus individuálně.",
    sections: [
      {
        title: "Amulet a talisman",
        body:
          "Amulet obvykle podporuje ochranu a vymezení. Talisman naopak posiluje to, co chcete rozvíjet, například odvahu, lásku, prosperitu nebo důvěru.",
      },
      {
        title: "Tvorba na míru",
        body:
          "Proces začíná konzultací záměru. Důležité je nejen to, co chcete přitáhnout, ale i to, co už nechcete dál nést.",
      },
    ],
    bullets: ["ochrana a posílení záměru", "individuální konzultace", "ruční tvorba podle energie", "vhodné pro důležité životní období"],
    ctaLabel: "Domluvit tvorbu",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["prace-s-energii", "osobni-transformace", "sluzby-na-miru"],
    priority: 0.78,
  },
  {
    slug: "mediumni-vyklad",
    title: "Mediumní výklad | Astera Light",
    description:
      "Citlivý mediumní výklad pro témata ztráty, neuzavřených vztahů a vnitřního smíření.",
    eyebrow: "Smíření a uzavření",
    heading: "Mediumní výklad pro nevyřčené a nedořečené věci",
    lead:
      "Mediumní práce se dotýká velmi citlivých témat. Jejím cílem není senzace, ale pochopení, uvolnění a vnitřní klid tam, kde zůstala bolest nebo nevyřčené otázky.",
    sections: [
      {
        title: "Citlivý rámec",
        body:
          "Astera přistupuje k mediumním tématům s respektem, klidem a jasnými hranicemi. Sezení je vedené tak, aby bylo podpůrné, nikoli zahlcující.",
      },
      {
        title: "Kdy může pomoci",
        body:
          "Vhodné může být po ztrátě blízkého člověka, při neuzavřeném vztahu nebo ve chvíli, kdy potřebujete najít vnitřní smíření.",
      },
    ],
    bullets: ["neuzavřená témata", "ztráta a smíření", "citlivé vedení", "bezpečný prostor pro emoce"],
    ctaLabel: "Rezervovat termín",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["intuitivni-vhled", "vnitrni-klid", "vyklad-karet"],
    priority: 0.76,
  },
  {
    slug: "sluzby-na-miru",
    title: "Služby na míru | Astera Light",
    description:
      "Individuální kombinace výkladu, energetické práce, očisty prostoru a intuitivního vedení podle vaší situace.",
    eyebrow: "Individuální cesta",
    heading: "Služby na míru pro témata, která se nevejdou do jedné krabičky",
    lead:
      "Někdy potřebujete kombinaci více přístupů. Služba na míru pomáhá pojmenovat hlavní téma, vybrat vhodný postup a projít jím citlivě a prakticky.",
    sections: [
      {
        title: "Co může obsahovat",
        body:
          "Součástí může být konzultace, výklad karet, práce se záměrem, energetická očista nebo doporučení další péče o prostor i vnitřní nastavení.",
      },
      {
        title: "Proč individuálně",
        body:
          "Každý člověk a každá situace má jinou dynamiku. Individuální postup umožní pracovat cíleněji a bez zbytečných kroků.",
      },
    ],
    bullets: ["kombinace více služeb", "osobní doporučení", "citlivé nasměrování", "řešení specifické situace"],
    ctaLabel: "Domluvit konzultaci",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["sluzby", "intuitivni-vhled", "ocista-prostor"],
    priority: 0.78,
  },
  {
    slug: "harmonizace-domova",
    title: "Harmonizace domova | Astera Light",
    description:
      "Jemné kroky pro energeticky klidnější domov, lepší pocit bezpečí a podporující atmosféru.",
    eyebrow: "Domov jako opora",
    heading: "Harmonizace domova pomáhá prostoru znovu dýchat",
    lead:
      "Domov má být místem návratu. Když je zahlcený napětím, starými stopami nebo chaosem, může nás unavovat víc, než si uvědomujeme. Harmonizace pomáhá obnovit přirozený klid.",
    sections: [
      {
        title: "Praktická a energetická vrstva",
        body:
          "Astera propojuje práci s energií s doporučeními, která dávají smysl v běžném životě. Nejde o divadlo, ale o stabilní pocit lehkosti.",
      },
      {
        title: "Kdy začít",
        body:
          "Vhodná je po změně životní etapy, po náročném období nebo kdykoliv, kdy cítíte, že prostor ztratil přirozenou oporu.",
      },
    ],
    bullets: ["větší pocit bezpečí", "uvolnění stagnace", "domov po změně", "návaznost na očistu prostor"],
    ctaLabel: "Domluvit harmonizaci",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["ocista-prostor", "energeticka-ocista", "ritualy-a-energie"],
    priority: 0.74,
  },
  {
    slug: "osobni-transformace",
    title: "Osobní transformace a vnitřní změna | Astera Light",
    description:
      "Podpora při životní změně, práci se záměrem, uvolnění starých vzorců a návratu k sobě.",
    eyebrow: "Změna s respektem",
    heading: "Osobní transformace nemusí být tlak, ale návrat k sobě",
    lead:
      "Skutečná změna často začíná tiše. Ne tím, že se přinutíte být někým jiným, ale tím, že přestanete nést to, co už není vaše.",
    sections: [
      {
        title: "Co se v procesu otevírá",
        body:
          "Může jít o staré vzorce, vztah k sobě, strach z rozhodnutí nebo téma, které se vrací v různých podobách. Cílem je větší vědomí a konkrétní kroky.",
      },
      {
        title: "Jak Astera pracuje",
        body:
          "Podpora může kombinovat výklad, intuitivní vhled, práci s energií a záměrem. Důležité je tempo, které je pro vás únosné a pravdivé.",
      },
    ],
    bullets: ["uvolnění starých vzorců", "práce se záměrem", "citlivá podpora při změně", "větší důvěra v sebe"],
    ctaLabel: "Začít konzultací",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["intuitivni-vhled", "energeticka-ocista", "manifestace"],
    priority: 0.74,
  },
  {
    slug: "manifestace",
    title: "Manifestace a práce se záměrem | Astera Light",
    description:
      "Vědomá práce se záměrem, intuicí a každodenními kroky pro to, co chcete ve svém životě tvořit.",
    eyebrow: "Záměr a každodennost",
    heading: "Manifestace začíná tam, kde se záměr potká s pravdivým krokem",
    lead:
      "Manifestace není jen přání. Je to vědomá práce s tím, co chcete tvořit, co vás brzdí a jaké kroky dokážete skutečně žít.",
    sections: [
      {
        title: "Bez tlaku na výkon",
        body:
          "Astera vede k manifestaci, která není odtržená od reality. Záměr má být živý, laskavý a propojený s tím, co je pro vás opravdu důležité.",
      },
      {
        title: "Podpora knihou i konzultací",
        body:
          "Téma manifestace se může otevřít v konzultaci, při práci s kartami nebo skrze inspiraci v knize a navazujících materiálech.",
      },
    ],
    bullets: ["ujasnění záměru", "uvolnění vnitřních bloků", "praktické kroky", "napojení na intuici"],
    ctaLabel: "Prozkoumat služby",
    ctaHref: "/sluzby",
    related: ["osobni-transformace", "kniha-a-inspirace", "oracle-karty"],
    priority: 0.72,
  },
  {
    slug: "vnitrni-klid",
    title: "Vnitřní klid a zklidnění mysli | Astera Light",
    description:
      "Jemné vedení pro návrat k vnitřnímu klidu, lepšímu ukotvení a větší důvěře ve vlastní cestu.",
    eyebrow: "Zklidnění a návrat k sobě",
    heading: "Vnitřní klid vzniká, když přestanete bojovat sami se sebou",
    lead:
      "Vnitřní klid není prázdnota ani výkon. Je to schopnost slyšet sebe i uprostřed okolního hluku. Astera pomáhá vytvořit prostor, ve kterém se tento hlas může znovu objevit.",
    sections: [
      {
        title: "Když je všeho moc",
        body:
          "V obdobích tlaku, změny nebo zahlcení může být těžké rozlišit strach od intuice. Jemné vedení pomáhá zpomalit a znovu se zorientovat.",
      },
      {
        title: "Praktická opora",
        body:
          "Součástí práce mohou být jednoduché otázky, rituály nebo doporučení, která podporují klid i mimo samotné sezení.",
      },
    ],
    bullets: ["zklidnění při nejistotě", "lepší kontakt se sebou", "jemná opora ve změně", "návaznost na kartu dne"],
    ctaLabel: "Vybrat kartu dne",
    ctaHref: "/pick-a-card",
    related: ["karta-dne", "intuitivni-vhled", "energeticka-ocista"],
    priority: 0.72,
  },
  {
    slug: "ritualy-a-energie",
    title: "Rituály a práce s energií | Astera Light",
    description:
      "Jednoduché rituály, záměry a energetická práce pro domov, vztahy i osobní rovnováhu.",
    eyebrow: "Vědomá práce s energií",
    heading: "Rituály dávají záměru tvar a pozornost",
    lead:
      "Rituál nemusí být složitý. Může to být vědomé zastavení, očištění prostoru, práce se světlem, kartou nebo slovem, které pomůže ukotvit změnu.",
    sections: [
      {
        title: "Rituál jako kotva",
        body:
          "Dobře zvolený rituál pomáhá tělu i mysli pochopit, že začíná nová fáze. Podporuje rozhodnutí, loučení i přivítání nového.",
      },
      {
        title: "Bez zbytečné složitosti",
        body:
          "Astera volí postupy, které jsou srozumitelné a proveditelné. Důležité je napojení, záměr a respekt, ne množství pomůcek.",
      },
    ],
    bullets: ["rituály pro domov", "práce se záměrem", "očista a uzavření období", "jednoduché kroky pro každý den"],
    ctaLabel: "Domluvit vedení",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["ocista-prostor", "manifestace", "harmonizace-domova"],
    priority: 0.7,
  },
  {
    slug: "kniha-a-inspirace",
    title: "Kniha a inspirace Astera Light",
    description:
      "Inspirace pro práci se záměrem, intuicí, manifestací a osobním růstem v každodenním životě.",
    eyebrow: "Čtení, které vede k sobě",
    heading: "Kniha a inspirace pro chvíle, kdy chcete tvořit vědoměji",
    lead:
      "Astera propojuje duchovní témata s praktickým jazykem. Kniha a navazující inspirace pomáhají zůstat v kontaktu se záměrem i ve dnech, kdy se cesta zdá nejasná.",
    sections: [
      {
        title: "Témata, která se vracejí",
        body:
          "Manifestace, intuice, důvěra, práce se strachem a schopnost všímat si jemných signálů. To vše může být součástí osobní praxe.",
      },
      {
        title: "Pro koho je vhodná",
        body:
          "Pro čtenáře, kteří chtějí méně teorie a více živého propojení s každodenními kroky, rozhodnutími a vnitřním nastavením.",
      },
    ],
    bullets: ["manifestace a záměr", "intuice v praxi", "osobní růst", "inspirace pro každodenní kroky"],
    ctaLabel: "Přejít na služby",
    ctaHref: "/sluzby",
    related: ["manifestace", "osobni-transformace", "oracle-karty"],
    priority: 0.68,
  },
  {
    slug: "oracle-circle",
    title: "Oracle Circle | Astera Light",
    description:
      "Členský prostor pro práci s kartami, intuicí, pravidelnou inspirací a jemným vedením.",
    eyebrow: "Pravidelná inspirace",
    heading: "Oracle Circle jako prostor pro rozvoj intuice",
    lead:
      "Oracle Circle je určený pro ty, kdo chtějí s kartami a intuicí pracovat průběžně. Nabízí rytmus, inspiraci a podporu, která se dá přenést do běžného dne.",
    sections: [
      {
        title: "Proč pravidelně",
        body:
          "Intuice sílí pozorností. Pravidelný kontakt s kartami a otázkami pomáhá lépe rozeznat vlastní hlas od strachu nebo tlaku okolí.",
      },
      {
        title: "Navázání na služby",
        body:
          "Členství může doplnit individuální výklady nebo osobní konzultace. Je vhodné pro ty, kdo chtějí vlastní praxi rozvíjet s větší lehkostí.",
      },
    ],
    bullets: ["práce s oracle kartami", "pravidelné vnitřní zastavení", "rozvoj intuice", "komunitní inspirace"],
    ctaLabel: "Vyzkoušet kartu dne",
    ctaHref: "/pick-a-card",
    related: ["oracle-karty", "karta-dne", "vyklad-karet"],
    priority: 0.66,
  },
  {
    slug: "akce-a-setkani",
    title: "Akce a setkání | Astera Light",
    description:
      "Živé i online akce Astera Light pro intuici, práci s kartami, energii a osobní rozvoj.",
    eyebrow: "Společný prostor",
    heading: "Akce a setkání pro hlubší zkušenost",
    lead:
      "Některá témata se nejlépe otevírají ve sdíleném prostoru. Akce Astera Light propojují inspiraci, praxi a jemné vedení pro ty, kdo chtějí zažít víc než jen text na stránce.",
    sections: [
      {
        title: "Online i živě",
        body:
          "Setkání mohou probíhat online nebo živě podle aktuální nabídky. Důležitá je bezpečná atmosféra, jasný záměr a praktický přínos.",
      },
      {
        title: "Témata akcí",
        body:
          "Karty, intuice, očista, manifestace, práce se záměrem a osobní transformace. Každé setkání má vlastní rytmus a konkrétní zaměření.",
      },
    ],
    bullets: ["online webináře", "živá setkání", "práce s kartami", "intuice a manifestace"],
    ctaLabel: "Zobrazit služby",
    ctaHref: "/sluzby",
    related: ["oracle-circle", "oracle-karty", "manifestace"],
    priority: 0.64,
  },
  {
    slug: "prace-s-energii",
    title: "Práce s energií | Astera Light",
    description:
      "Citlivá práce s energií člověka, prostoru a záměru pro větší lehkost, stabilitu a jasnost.",
    eyebrow: "Jemná vrstva každodennosti",
    heading: "Práce s energií pomáhá pojmenovat to, co není vidět, ale je cítit",
    lead:
      "Energetická práce není náhrada praktických kroků. Je to jemná vrstva podpory, která pomáhá uvolnit napětí, obnovit stabilitu a lépe vnímat, co je potřeba změnit.",
    sections: [
      {
        title: "Člověk i prostor",
        body:
          "Astera pracuje s energií jednotlivce i místa. Obě roviny se často ovlivňují: když se zklidní prostor, lépe se dýchá i člověku, který v něm žije.",
      },
      {
        title: "Respekt a hranice",
        body:
          "Základem je etický přístup, souhlas a jasné pojmenování cíle. Práce má podporovat svobodu a klid, ne vytvářet závislost.",
      },
    ],
    bullets: ["energetická očista", "harmonizace prostoru", "práce se záměrem", "citlivé vedení"],
    ctaLabel: "Probrat vhodný postup",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["energeticka-ocista", "ocista-prostor", "sluzby-na-miru"],
    priority: 0.7,
  },
  {
    slug: "duchovni-pruvodcovstvi",
    title: "Duchovní průvodcovství | Astera Light",
    description:
      "Citlivé duchovní vedení pro období změny, hledání směru, vnitřní nejistoty a osobního růstu.",
    eyebrow: "Doprovod na cestě",
    heading: "Duchovní průvodcovství jako klidný rozhovor se sebou",
    lead:
      "Duchovní průvodcovství nemusí znamenat vzdálené pojmy. V praxi jde o schopnost ztišit se, pojmenovat pravdu a udělat další krok s větší důvěrou.",
    sections: [
      {
        title: "Když hledáte směr",
        body:
          "Vhodné je ve chvílích, kdy cítíte, že starý způsob už nefunguje, ale nový ještě nemá jasný tvar. Průvodcovství pomáhá udržet klid uprostřed přechodu.",
      },
      {
        title: "Bez hotových dogmat",
        body:
          "Astera pracuje citlivě, individuálně a s respektem k vaší zkušenosti. Nejde o hotové návody, ale o vedení k vlastnímu vnímání.",
      },
    ],
    bullets: ["hledání směru", "období změny", "intuice a důvěra", "jemné individuální vedení"],
    ctaLabel: "Domluvit konzultaci",
    ctaHref: "https://app.rezora.cz/book/astera",
    related: ["intuitivni-vhled", "osobni-transformace", "vnitrni-klid"],
    priority: 0.68,
  },
];

export function absoluteUrl(path: string) {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function findSeoPage(slug: string) {
  return SEO_PAGES.find((page) => page.slug === slug);
}
