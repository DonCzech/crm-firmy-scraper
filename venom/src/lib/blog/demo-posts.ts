import type { BlogBlock } from "./content";

/**
 * Universal demo articles — the same five posts ship with every template.
 *
 * They exist to show off what the blog module can do, so between them they use
 * every block type: text, heading, image, gallery, quote, list (bulleted and
 * numbered), cta, divider and video. Because a barber, a law firm and an
 * e-shop all get these, the copy has to stay industry-neutral: it talks about
 * craft, clients, a working day and plans — never about haircuts or contracts.
 *
 * `{{brand}}` is replaced with the tenant's business name at seed time.
 */

export interface DemoPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  featured_image: string;
  seo_title: string;
  seo_description: string;
  /** Days before "now" — keeps the demo feed looking freshly maintained. */
  daysAgo: number;
  content: BlogBlock[];
}

export const DEMO_AUTHOR = "Redakce {{brand}}";

export const DEMO_POSTS: DemoPost[] = [
  {
    slug: "remeslo-ktere-nejde-uspechat",
    title: "Řemeslo, které nejde uspěchat",
    excerpt:
      "Proč u nás některé věci trvají déle, než by musely — a proč to zákazníci nakonec ocení.",
    category: "Za oponou",
    tags: ["řemeslo", "kvalita", "hodnoty"],
    featured_image: "/blog-demo/craft-hands.webp",
    seo_title: "Řemeslo, které nejde uspěchat | {{brand}}",
    seo_description:
      "Jak u {{brand}} pracujeme s detailem, proč nesnižujeme standard a co za tím stojí.",
    daysAgo: 4,
    content: [
      {
        type: "text",
        text: "Existuje jednoduchá zkouška kvality: vezměte hotovou práci do ruky a podívejte se na místa, která nikdo neuvidí. Právě tam se pozná, jestli někdo pracoval poctivě, nebo jen rychle.",
      },
      { type: "heading", level: 2, text: "Detail, který nikdo neuvidí" },
      {
        type: "text",
        text: "V <strong>{{brand}}</strong> jsme si na začátku řekli, že nebudeme dělat kompromisy tam, kde je nikdo nepozná. Zní to jako klišé, dokud nezačnete počítat hodiny. Ale zákazník, který se vrací potřetí, je ta nejlevnější reklama, jakou si můžete pořídit.",
      },
      {
        type: "image",
        url: "/blog-demo/craft-detail.webp",
        alt: "Detail ruční práce na pracovním stole",
        caption: "Většina času padne na posledních deset procent.",
      },
      { type: "heading", level: 2, text: "Tři zásady, kterých se držíme" },
      {
        type: "list",
        ordered: true,
        items: [
          "<strong>Raději odmítneme, než odbudeme.</strong> Když termín nedává smysl, řekneme to dopředu.",
          "<strong>Materiál se nešetří.</strong> Úspora na vstupu se vždycky vrátí jako reklamace.",
          "<strong>Co slíbíme, platí.</strong> Cena dohodnutá na začátku je cena na faktuře.",
        ],
      },
      {
        type: "quote",
        text: "Kvalita je to, co zůstane, když sleva dávno vyprchá.",
        cite: "{{brand}}",
      },
      { type: "divider" },
      {
        type: "text",
        text: "Nejde o dokonalost za každou cenu. Jde o to, aby se za svou práci člověk nemusel stydět, když ji za rok potká.",
      },
      {
        type: "cta",
        text: "Chcete vědět, jak bychom postupovali u vás?",
        ctaText: "Ozvěte se nám",
        ctaHref: "#kontakt",
      },
    ],
  },
  {
    slug: "na-co-se-nas-ptate-nejcasteji",
    title: "Na co se nás ptáte nejčastěji",
    excerpt:
      "Sesbírali jsme otázky, které slyšíme každý týden, a odpověděli na ně na jednom místě.",
    category: "Rady a tipy",
    tags: ["faq", "poradna", "klienti"],
    featured_image: "/blog-demo/team-talk.webp",
    seo_title: "Nejčastější dotazy klientů | {{brand}}",
    seo_description:
      "Odpovědi na otázky, které v {{brand}} slyšíme nejčastěji — termíny, ceny, průběh spolupráce.",
    daysAgo: 11,
    content: [
      {
        type: "text",
        text: "Za poslední rok jsme si zapisovali, na co se nás lidé ptají. Pár otázek se opakovalo tak často, že si zaslouží vlastní článek.",
      },
      { type: "heading", level: 2, text: "Jak dlouho to trvá?" },
      {
        type: "text",
        text: "Poctivá odpověď zní: záleží. Ale termín vám vždycky řekneme dřív, než se do čehokoli pustíme — a když se něco zdrží, dozvíte se to od nás, ne od někoho jiného.",
      },
      { type: "heading", level: 2, text: "Kolik to bude stát?" },
      {
        type: "text",
        text: "Cenu tvoříme dopředu a písemně. Nemáme rádi překvapení na faktuře o nic víc než vy.",
      },
      {
        type: "image",
        url: "/blog-demo/team-notes.webp",
        alt: "Konzultace nad poznámkami",
        caption: "První schůzka je vždycky o poslouchání.",
      },
      { type: "heading", level: 2, text: "Co si mám připravit předem?" },
      {
        type: "list",
        items: [
          "Představu o tom, čeho chcete dosáhnout — klidně jen v bodech.",
          "Rozpočet, se kterým počítáte. Ušetří to čas oběma stranám.",
          "Termín, do kdy to potřebujete mít hotové.",
          "Fotky nebo příklady toho, co se vám líbí.",
        ],
      },
      {
        type: "quote",
        text: "Nejlepší zakázky začínají otázkou, ne objednávkou.",
      },
      {
        type: "cta",
        text: "Nenašli jste svou otázku?",
        ctaText: "Zeptejte se přímo",
        ctaHref: "#kontakt",
      },
    ],
  },
  {
    slug: "jeden-den-u-nas",
    title: "Jeden den u nás: od prvního světla po zavíračku",
    excerpt:
      "Pojďte se podívat, jak vypadá běžný pracovní den — bez retuše a bez marketingových frází.",
    category: "Za oponou",
    tags: ["tým", "zákulisí", "reportáž"],
    featured_image: "/blog-demo/workspace.webp",
    seo_title: "Jeden den v {{brand}} | Zákulisí",
    seo_description:
      "Reportáž z běžného dne v {{brand}} — jak plánujeme, jak pracujeme a co nás baví.",
    daysAgo: 21,
    content: [
      {
        type: "text",
        text: "Lidé si často myslí, že naše práce začíná ve chvíli, kdy se otevřou dveře. Ve skutečnosti to zajímavé se odehraje o hodinu dřív.",
      },
      { type: "heading", level: 2, text: "Ráno: než přijde první zákazník" },
      {
        type: "text",
        text: "Den začíná krátkou poradou u kávy. Projdeme, co je v plánu, kdo na čem dělá a kde může něco skřípat. Trvá to deset minut a ušetří to celé odpoledne.",
      },
      {
        type: "image",
        url: "/blog-demo/morning-coffee.webp",
        alt: "Ranní káva před začátkem směny",
      },
      { type: "heading", level: 2, text: "Dopoledne: nejtěžší věci první" },
      {
        type: "text",
        text: "Co vyžaduje soustředění, řešíme dopoledne. Odpoledne patří konzultacím, domluvám a věcem, které snesou hluk.",
      },
      { type: "heading", level: 3, text: "A když se něco pokazí?" },
      {
        type: "text",
        text: "Pokazí se to vždycky. Rozdíl je v tom, jestli se o tom zákazník dozví od vás — nebo až když si toho všimne sám.",
      },
      {
        type: "gallery",
        images: [
          { url: "/blog-demo/gallery-1.webp", alt: "Práce v týmu" },
          { url: "/blog-demo/gallery-2.webp", alt: "Náš prostor" },
          { url: "/blog-demo/gallery-3.webp", alt: "Společná porada" },
          { url: "/blog-demo/storefront.webp", alt: "Pohled do provozovny" },
        ],
      },
      {
        type: "quote",
        text: "Dobrý den v práci poznáte podle toho, že večer nemusíte nic dohánět.",
        cite: "z ranní porady",
      },
      {
        type: "cta",
        text: "Chcete se podívat osobně?",
        ctaText: "Domluvit návštěvu",
        ctaHref: "#kontakt",
      },
    ],
  },
  {
    slug: "udrzitelnost-neni-marketing",
    title: "Udržitelnost není marketing. Takhle ji děláme my.",
    excerpt:
      "Konkrétní kroky místo obecných slibů — co jsme změnili, kolik to stálo a co se opravdu povedlo.",
    category: "Hodnoty",
    tags: ["udržitelnost", "odpovědnost", "provoz"],
    featured_image: "/blog-demo/green-leaf.webp",
    seo_title: "Jak přistupujeme k udržitelnosti | {{brand}}",
    seo_description:
      "Konkrétní opatření, kterými {{brand}} snižuje dopad svého provozu — bez greenwashingu.",
    daysAgo: 34,
    content: [
      {
        type: "text",
        text: "Slovo udržitelnost se za posledních pár let obnosilo natolik, že už skoro nic neznamená. Proto místo prohlášení uvádíme čísla a konkrétní kroky.",
      },
      { type: "heading", level: 2, text: "Co jsme změnili" },
      {
        type: "list",
        items: [
          "Přešli jsme na dodavatele, který vozí zboží v vratných obalech.",
          "Odpad třídíme na pěti místech provozu, ne jen v kanceláři.",
          "Tiskneme jen to, co musí být na papíře — smlouvy řešíme elektronicky.",
          "Vybavení opravujeme, dokud to dává smysl. Nové kupujeme až potom.",
        ],
      },
      {
        type: "image",
        url: "/blog-demo/materials.webp",
        alt: "Materiály a nástroje připravené k práci",
        caption: "Nejekologičtější je to, co nemusíte vyhodit.",
      },
      { type: "heading", level: 2, text: "Co se nepovedlo" },
      {
        type: "text",
        text: "Ne všechno vyšlo. Snaha o kompletně bezpapírový provoz narazila na úřady a část dodavatelů. Místo předstírání to říkáme na rovinu — a zkoušíme dál.",
      },
      {
        type: "quote",
        text: "Malý krok, který skutečně uděláte, je víc než velký závazek na webu.",
      },
      { type: "divider" },
      {
        type: "text",
        text: "Máte tip, co bychom mohli zlepšit? Rádi si ho poslechneme — nejlepší nápady k nám chodí od zákazníků.",
      },
    ],
  },
  {
    slug: "co-chystame-v-nove-sezone",
    title: "Co chystáme v nové sezoně",
    excerpt:
      "Nové služby, delší otevírací doba a jedna věc, na kterou se těšíme nejvíc.",
    category: "Novinky",
    tags: ["novinky", "plány", "sezona"],
    featured_image: "/blog-demo/planning.webp",
    seo_title: "Novinky a plány na novou sezonu | {{brand}}",
    seo_description:
      "Přehled novinek, které {{brand}} chystá — nové služby, otevírací doba a chystané akce.",
    daysAgo: 52,
    content: [
      {
        type: "text",
        text: "Zimu jsme strávili plánováním. Tady je přehled toho, co vás u nás čeká v následujících měsících.",
      },
      { type: "heading", level: 2, text: "Delší otevírací doba" },
      {
        type: "text",
        text: "Nejčastější přání z dotazníku bylo jednoduché: „Otevřete dýl.“ Od nové sezony máme otevřeno i ve čtvrtek do večera.",
      },
      {
        type: "image",
        url: "/blog-demo/sketch.webp",
        alt: "Poznámkový blok s plány",
      },
      { type: "heading", level: 2, text: "Nové služby" },
      {
        type: "list",
        ordered: true,
        items: [
          "Rozšířená nabídka pro stálé zákazníky, včetně přednostních termínů.",
          "Dárkové poukazy, které konečně půjde koupit online.",
          "Konzultace zdarma pro každého, kdo k nám přijde poprvé.",
        ],
      },
      { type: "heading", level: 2, text: "Podívejte se s námi" },
      {
        type: "text",
        text: "Krátké video, ve kterém procházíme, co se u nás za poslední rok změnilo:",
      },
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        caption: "Ohlédnutí za uplynulou sezonou.",
      },
      {
        type: "quote",
        text: "Nejlepší nápady na tenhle rok nepřišly od nás, ale z vašich zpráv.",
        cite: "{{brand}}",
      },
      {
        type: "cta",
        text: "Chcete být první, kdo se o novinkách dozví?",
        ctaText: "Napište nám",
        ctaHref: "#kontakt",
      },
    ],
  },
];

/** Replaces `{{brand}}` throughout a demo post with the tenant's real name. */
export function personalizeDemoPost(post: DemoPost, brand: string): DemoPost {
  const swap = (s: string) => s.replaceAll("{{brand}}", brand);
  return {
    ...post,
    title: swap(post.title),
    excerpt: swap(post.excerpt),
    seo_title: swap(post.seo_title),
    seo_description: swap(post.seo_description),
    content: post.content.map((b) => ({
      ...b,
      ...(b.text ? { text: swap(b.text) } : {}),
      ...(b.cite ? { cite: swap(b.cite) } : {}),
      ...(b.caption ? { caption: swap(b.caption) } : {}),
      ...(b.items ? { items: b.items.map(swap) } : {}),
    })),
  };
}
