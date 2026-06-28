export interface ModuleItem {
  slug: string;
  category: string;
  title: string;
  tagline: string;
  perex: string;
  image: string;
  imageAlt: string;
  bullets: string[];
  sections: { title: string; body: string }[];
  useCases: string[];
  faq: { q: string; a: string }[];
  related: string[];
}

export const MODULES: ModuleItem[] = [
  {
    slug: "clanky-blog",
    category: "Obsah",
    title: "Články a blog",
    tagline: "Publikujte rychle. Pište pohodlně. Najděte si nové čtenáře.",
    perex:
      "Plnohodnotný blog s WYSIWYG editorem, kategoriemi, autory, plánovanou publikací a SEO metadaty pro každý článek. Bez omezení počtu příspěvků.",
    image: "/modules/clanky-blog.jpg",
    imageAlt: "Editor článku v rozhraní Webera",
    bullets: [
      "Rich-text editor s podporou obrázků, videí a embedů",
      "Plánování publikace na konkrétní datum a čas",
      "Kategorie, štítky a více autorů s rolemi",
      "Per-článek SEO metadata, OG obrázek a canonical",
      "Automatický RSS feed a sitemap.xml",
      "Komentáře s antispamem nebo přes Disqus",
    ],
    sections: [
      {
        title: "Editor, který se vám přizpůsobí",
        body:
          "Píšete přímo do stránky tak, jak ji uvidí čtenář. Žádný admin se stovkami políček — jen čistý prostor pro text, obrázky a embedy. Ctrl+S, publikováno. Klávesové zkratky pro nadpisy, citace, seznamy a odkazy.",
      },
      {
        title: "SEO jako prioritu",
        body:
          "Každý článek má vlastní title, meta description, slug, canonical, JSON-LD article schema a Open Graph kartu pro sdílení. Automatická sitemap se aktualizuje při každé publikaci. Google ví o nových článcích během minut.",
      },
      {
        title: "Tým a workflow",
        body:
          "Pozvěte spolupracovníky jako autory nebo editory. Každý vidí jen své rozpracované koncepty. Šéfredaktor schvaluje finální verzi. Historie změn a možnost vrátit se k libovolné verzi článku.",
      },
    ],
    useCases: [
      "Firemní blog pro buildování značky a SEO",
      "Newsletter s archivem článků na webu",
      "Magazín s více autory a redakcí",
      "Korporátní press centrum s tiskovými zprávami",
    ],
    faq: [
      { q: "Můžu importovat články z WordPressu?", a: "Ano. Standardní WordPress XML export přečteme a převedeme včetně obrázků, kategorií a autorů. Migrace 200 článků trvá zhruba 10 minut." },
      { q: "Je tu omezení počtu článků?", a: "Žádné. Můžete publikovat tisíce článků a vše se servíruje stejně rychle díky edge cache." },
      { q: "Funguje na článcích AMP?", a: "AMP samostatně nepodporujeme — všechny články ale skórují PageSpeed 95+ i bez něj. Google AMP postupně utlumuje, takže to není ztráta." },
    ],
    related: ["seo-viditelnost", "media-knihovna", "newsletter-leady"],
  },
  {
    slug: "seo-viditelnost",
    category: "Marketing",
    title: "SEO a viditelnost",
    tagline: "Mezi prvními ve vyhledávání. Bez SEO specialisty.",
    perex:
      "Technické SEO máme vyřešené za vás — sitemap, robots, schema, canonical, hreflang, PageSpeed. Soustředíte se na obsah, my na technické detaily.",
    image: "/modules/seo-viditelnost.jpg",
    imageAlt: "SEO graf a metriky výkonu webu",
    bullets: [
      "Automatická sitemap.xml a robots.txt",
      "JSON-LD schema (Article, Product, Event, FAQ, Review)",
      "Per-stránka title, description, OG, canonical",
      "Hreflang pro vícejazyčné weby",
      "Auto-generated alt texty pro obrázky",
      "Lighthouse 95+ score z výroby",
    ],
    sections: [
      {
        title: "Technické SEO bez specialisty",
        body:
          "Sitemap se aktualizuje při každé změně stránky. Robots.txt umožňuje granulární kontrolu. JSON-LD schema generujeme automaticky z obsahu — pro články, produkty, eventy i recenze. Canonical odkazy hlídají duplicity. Hreflang propojuje jazykové varianty.",
      },
      {
        title: "Rychlost = pozice",
        body:
          "Google bere PageSpeed jako jeden z hlavních ranking faktorů. Vaše stránky se průměrně načítají pod 1 sekundu díky edge cache ve 270+ městech světa, AVIF/WebP obrázkům a code-splittingu. PageSpeed Insights vám ukáže 95+ score bez optimalizací.",
      },
      {
        title: "On-page SEO v editoru",
        body:
          "Při editaci každé stránky vidíte preview titulku v Google výsledcích, počet znaků, doporučená klíčová slova a indikátor SEO zdraví. Ukážeme vám, co dotvořit pro maximální dopad.",
      },
    ],
    useCases: [
      "Servisní firmy bojující o lokální pozice",
      "E-shopy soutěžící s velkými hráči",
      "B2B weby cílící na klíčové fráze",
      "Mezinárodní expanze s multi-language",
    ],
    faq: [
      { q: "Garantujete pozice ve vyhledávání?", a: "Nikdo seriózní negarantuje konkrétní pozice — záleží na obsahu a konkurenci. Garantujeme ale, že technické SEO máte na úrovni špičky." },
      { q: "Můžu mít vlastní Search Console a GA?", a: "Ano. Propojení dvěma kliky v adminu. Žádné copy-paste meta tagů." },
      { q: "Pomůžete s klíčovými slovy?", a: "Pro standardní plán doporučujeme nástroje jako Marketing Miner. Pro individuální péči máme tým SEO konzultantů." },
    ],
    related: ["clanky-blog", "rychlost-vykon", "analytika-konverze"],
  },
  {
    slug: "eshop-katalog",
    category: "E-commerce",
    title: "E-shop a katalog",
    tagline: "Prodávejte z webu od první minuty. Bez extra modulů.",
    perex:
      "Plnohodnotný e-shop přímo v platformě. Stripe, faktury, sklady, varianty, slevové kódy, propojení s dopravci — vše bez pluginů.",
    image: "/modules/eshop-katalog.jpg",
    imageAlt: "Detail produktu v e-shopu Webero",
    bullets: [
      "Stripe a PayPal bez extra transakční provize",
      "Faktury v PDF, čísla řad, archiv pro účetnictví",
      "Sklad s variantami (barva, velikost, materiál)",
      "Slevové kódy — procenta, fixní, limitované",
      "Zásilkovna a DPD na klik",
      "Opakované platby a předplatné",
    ],
    sections: [
      {
        title: "Pokladna optimalizovaná pro konverze",
        body:
          "Jeden krok, žádné nucené registrace, žádné rozptylování. Apple Pay, Google Pay, kartou nebo bankovním převodem. Konverzní poměr našich e-shopů je v průměru 2,3× vyšší než u WordPress řešení s WooCommerce.",
      },
      {
        title: "Sklad, faktury, doprava",
        body:
          "Sledování stavu zásob v reálném čase. Automatické faktury podle nastavené řady. Štítky pro Zásilkovnu a DPD přímo z objednávky. EET připraveno, kdyby se vrátilo.",
      },
      {
        title: "Předplatné a opakované platby",
        body:
          "Pro digitální produkty, kurzy nebo členství. Stripe Subscriptions s pravidelným strháváním, automatické notifikace o expiraci a obnově, customer portal pro klienta.",
      },
    ],
    useCases: [
      "Lokální výrobce prodávající přímo zákazníkům",
      "Lektor s online kurzy a předplatným",
      "Restaurace s online objednávkami",
      "Floristka s prodejem kytic na míru",
    ],
    faq: [
      { q: "Kolik si beru z každého prodeje?", a: "Webero si neúčtuje žádné procento. Platíte jen běžné poplatky Stripe (1,4 % + 6 Kč za EU karty)." },
      { q: "Můžu mít víc měn?", a: "Ano. Aktivujete v nastavení e-shopu. Stripe automaticky převede platbu na vaší preferovanou měnu." },
      { q: "Funguje s českou účetní firmou?", a: "Faktury jsou v PDF s běžnou strukturou (IČO, DIČ, dodavatel/odběratel, položky, DPH). Export CSV nebo XML pro POHODA, Money S3 a další." },
    ],
    related: ["rezervace-online", "platby-fakturace", "predplatne-kurzy"],
  },
  {
    slug: "rezervace-online",
    category: "Konverze",
    title: "Rezervace online (Rezora)",
    tagline: "Klienti se objednávají sami. 24/7, bez telefonu.",
    perex:
      "Rezervační systém Rezora propojený s Webera. Synchronizace s Google Kalendářem, SMS notifikace, platba zálohou — to vše během 5 minut nastavení.",
    image: "/modules/rezervace-online.jpg",
    imageAlt: "Rezervační kalendář Rezora",
    bullets: [
      "Synchronizace s Google Kalendářem a Outlookem",
      "SMS a e-mail notifikace klientovi i vám",
      "Zálohová platba přes Stripe",
      "Vícezdrojový kalendář (více pracovníků)",
      "Připomínky 24h před rezervací",
      "Customer no-show ochrana",
    ],
    sections: [
      {
        title: "Pro každý obor",
        body:
          "Barberi, kosmetičky, doktoři, fyzioterapeuti, autoservisy, autoškoly, fotografové. Nastavíte si vlastní služby s délkou trvání, cenou a kapacitou. Klient vidí jen volné termíny v reálném čase.",
      },
      {
        title: "Méně no-show, víc tržeb",
        body:
          "Zálohová platba předem snižuje no-show v průměru o 78 %. Pokud klient nepřijde, záloha vám zůstává. SMS připomínky 24 hodin předem zvyšují docházku o dalších 22 %.",
      },
      {
        title: "Integrace s pracovním rytmem",
        body:
          "Rezora se automaticky synchronizuje s vaším Google nebo Outlook kalendářem. Když si v něm zablokujete čas (oběd, dovolená), klienti nevidí volný slot. Žádné dvojrezervace.",
      },
    ],
    useCases: [
      "Holičství s týmem 3+ barberů",
      "Kosmetické studio s několika službami",
      "Autoškola s online přihláškami na zkoušky",
      "Fotograf s rezervací focení",
    ],
    faq: [
      { q: "Kolik Rezora stojí?", a: "Volitelný modul za 200 Kč/měs. nad rámec základního plánu Webera. Bez transakční provize z rezervací." },
      { q: "Můžu importovat klienty z předchozího systému?", a: "Ano, CSV import seznamu klientů včetně historie." },
      { q: "Funguje to bez Webera?", a: "Rezora je samostatná služba, ale s Weberem se propojuje na jeden klik. Embed kód funguje i na jiných webech." },
    ],
    related: ["formulare-leady", "platby-fakturace", "notifikace-sms"],
  },
  {
    slug: "formulare-leady",
    category: "Konverze",
    title: "Formuláře a lead capture",
    tagline: "Každý návštěvník je potenciální klient.",
    perex:
      "Vícekrokové formuláře, kvízy, popup-y a exit-intent. Propojeno s CRM, Mailchimpem, Slack i Google Sheets — bez programátora.",
    image: "/modules/formulare-leady.jpg",
    imageAlt: "Vícekrokový formulář s validací",
    bullets: [
      "Vícekrokové formuláře s podmíněnou logikou",
      "Validace v reálném čase (e-mail, telefon, IČO)",
      "Upload souborů (CV, projekty) až 25 MB",
      "Anti-spam (honeypot + reCAPTCHA v3)",
      "Notifikace na e-mail, Slack, Discord",
      "Export do CSV pro CRM",
    ],
    sections: [
      {
        title: "Konverze přes formuláře",
        body:
          "Vícekrokové formuláře konvertují průměrně o 86 % lépe než dlouhé jednostránkové. Klient vidí progress, vyplňuje jen 2–3 pole najednou a má pocit, že to za chvíli skončí. Konec abandoned formů.",
      },
      {
        title: "Lead routing",
        body:
          "Podle vyplněných odpovědí router pošle lead správnému člověku v týmu. Velký projekt → obchodní ředitel. Malý dotaz → support. SMS rozpočet < 50K → automatická odpověď s šablonou. Bez Zapieru, bez vývojáře.",
      },
      {
        title: "Pop-upy a exit-intent",
        body:
          "Vyskakovací okna s časovačem, scroll-trigger nebo exit-intent (když uživatel míří pryč). Sbírejte e-maily pro newsletter, nabízejte slevu na první objednávku, ukazujte sociální důkaz.",
      },
    ],
    useCases: [
      "Stavební firma s poptávkovým formulářem",
      "Online kurz se zdarma materiálem za e-mail",
      "Realitní makléř s předběžným ohodnocením",
      "Agency s briefingovým formulářem pro klienty",
    ],
    faq: [
      { q: "Mám limit na počet odeslání?", a: "Ne. Standardní plán pokrývá až 100 000 leadů měsíčně, což je víc než většina firem v Česku potřebuje." },
      { q: "Můžu si přizpůsobit design formuláře?", a: "Ano, plně — barvy, fonty, spacing, animace. Žádné iframe se značkou třetí strany." },
      { q: "Šifrujete data klientů?", a: "Ano. AES-256 at rest, TLS 1.3 in transit. Soubory v zašifrovaném S3 v EU." },
    ],
    related: ["rezervace-online", "integrace-zapier", "analytika-konverze"],
  },
  {
    slug: "media-knihovna",
    category: "Obsah",
    title: "Mediální knihovna",
    tagline: "Galerie, video, audio. Bez kompromisů na rychlosti.",
    perex:
      "Centrální správa fotek, videí a audio souborů. Automatická optimalizace, CDN distribuce, plný alt-text manager pro SEO i accessibility.",
    image: "/modules/media-knihovna.jpg",
    imageAlt: "Mediální knihovna s thumbnail mřížkou",
    bullets: [
      "AVIF/WebP konverze automaticky pro každý upload",
      "Více velikostí podle device pixel ratio",
      "Adaptivní streaming videa (HLS)",
      "Vlastní CDN ve 270+ městech světa",
      "Alt text manager s AI návrhy",
      "Watermark pro fotografy",
    ],
    sections: [
      {
        title: "Obrázky bez ztráty kvality, bez váhy",
        body:
          "Nahrajete originál v JPG, RAW nebo PNG. Webero ho automaticky převede do AVIF (nejmodernější formát) a WebP jako fallback. Servíruje variantu podle zařízení a rozlišení obrazovky. Průměrná úspora datového objemu: 73 %.",
      },
      {
        title: "Video bez YouTube",
        body:
          "Nahrajete MP4. My ho streamujeme adaptivně podle rychlosti připojení klienta (HLS). Pomalý mobil dostane 480p, gigabit fiber 4K. Žádný YouTube logo, žádné related videos vedoucí pryč z vašeho webu.",
      },
      {
        title: "Galerie pro fotografy",
        body:
          "Lightbox, masonry, slideshow, before/after slider, 360° panorama. Volitelný watermark s vaším logem. Pravoklik proti stahování. Vodoznak EXIF pro autorská práva.",
      },
    ],
    useCases: [
      "Svatební fotograf s rozsáhlým portfoliem",
      "Architektonické studio s 3D vizualizacemi",
      "Restaurace s vizuálním menu",
      "Hotel s prezentací pokojů",
    ],
    faq: [
      { q: "Kolik místa mám k dispozici?", a: "100 GB v základním plánu, což pokryje cca 10 000 high-res fotek nebo 200 hodin videa." },
      { q: "Můžu nahrát RAW soubory?", a: "Pro úložiště ano, ale na webu se zobrazují konverze. Originály si v knihovně držíme jako master." },
      { q: "Funguje to s Dropboxem nebo Drive?", a: "Ano, můžete synchronizovat složku v Dropboxu. Nové soubory se objeví v knihovně automaticky." },
    ],
    related: ["rychlost-vykon", "clanky-blog", "domena-hosting"],
  },
  {
    slug: "rychlost-vykon",
    category: "Výkon",
    title: "Rychlost a výkon",
    tagline: "Mezi 5 % nejrychlejších webů na internetu.",
    perex:
      "Edge cache ve 270+ městech, automatická optimalizace obrázků, code-splitting, prefetching. Lighthouse 95+ score je standard, ne výjimka.",
    image: "/modules/rychlost-vykon.jpg",
    imageAlt: "Lighthouse score 99 v prohlížeči",
    bullets: [
      "PageSpeed 95+ automaticky",
      "Edge cache ve 270+ městech",
      "AVIF/WebP obrázky, h.264/h.265 video",
      "Code-splitting per route",
      "Preconnect a prefetch klíčových zdrojů",
      "Real-time monitoring Lighthouse score",
    ],
    sections: [
      {
        title: "Rychlost znamená peníze",
        body:
          "Studie Google ukazuje: každá sekunda navíc v načítání snižuje konverze o 7 %. Web s 5s načítáním vydělává polovinu toho, co web s 1s načítáním. Naši zákazníci po migraci na Webero hlásí 18–34 % nárůst tržeb bez jediné jiné změny.",
      },
      {
        title: "Edge cache, ne jen CDN",
        body:
          "Tradiční CDN servíruje obrázky z blízkého serveru. Edge cache servíruje celé HTML stránky z lokality, kde sedí návštěvník. Praha → server v Praze. New York → server v New Yorku. Latence pod 50 ms globálně.",
      },
      {
        title: "Optimalizace, kterou neřešíte",
        body:
          "Image lazy-loading, font subsetting, CSS critical path, JS code-splitting, prefetch dalších routes — všechny pokročilé optimalizace běží automaticky. Vy se soustředíte na obsah.",
      },
    ],
    useCases: [
      "E-shop s velkým produktovým katalogem",
      "News site s rich-media články",
      "B2B web cílící na mezinárodní trh",
      "Hotel s galeriemi pokojů a videi",
    ],
    faq: [
      { q: "Co když mám video v hero sekci?", a: "Streamujeme adaptivně (HLS). Mobile dostane 480p variant, desktop full HD. Hero video do 8 MB je norma." },
      { q: "Měříte Lighthouse v reálném čase?", a: "Ano. V adminu máte dashboard s aktuálním PageSpeed score vašeho webu a alertem, když klesne pod 90." },
      { q: "Můžu vypnout cache pro určité stránky?", a: "Ano. Cache rules nastavitelné per route. Pro dynamický obsah (košík, login) cache automaticky obcházíme." },
    ],
    related: ["seo-viditelnost", "media-knihovna", "domena-hosting"],
  },
  {
    slug: "predplatne-kurzy",
    category: "Obsah",
    title: "Předplatné a kurzy",
    tagline: "Prodávejte vědění. Opakovaně, automaticky.",
    perex:
      "Členská sekce s drip-režimem, online kurzy s videolekcemi, předplatné s opakovanými platbami. Pro tvůrce, kteří chtějí pasivní příjem.",
    image: "/modules/predplatne-kurzy.jpg",
    imageAlt: "Online kurz se seznamem lekcí",
    bullets: [
      "Drip content (lekce po týdnech)",
      "Stripe Subscriptions s auto-renewal",
      "Video streaming bez YouTube logo",
      "Customer portal pro klienta",
      "Sleva pro roční předplatné",
      "Affiliate program pro propagátory",
    ],
    sections: [
      {
        title: "Členská sekce za 30 minut",
        body:
          "Vytvoříte úroveň (např. Basic, Pro, VIP), přiřadíte jí stránky/lekce a nastavíte cenu. Klient se registruje, zaplatí, dostává přístup. Customer portal mu umožní spravovat předplatné, fakturační údaje a zrušit kdykoliv.",
      },
      {
        title: "Online kurzy s drip-režimem",
        body:
          "Místo vychrlení 30 lekcí najednou je dávkujte po týdnech. Klient nezahlcený, dokončí kurz spíš, doporučí ho dál. Drip rules: po datu registrace, po dokončení předchozí lekce, na konkrétní datum.",
      },
      {
        title: "Affiliate pro růst",
        body:
          "Aktivujte affiliate program a partnerům se zobrazí dashboard s unikátním linkem, statistikami návštěv a provizí. Vy si nastavíte procento (např. 30 %) a platíte jen z reálných prodejů.",
      },
    ],
    useCases: [
      "Online škola s mnoha kurzy",
      "Newsletter s placeným archivem",
      "Komunita s discord/forum přístupem",
      "B2B vzdělávací platforma",
    ],
    faq: [
      { q: "Vy si berete provizi z prodejů?", a: "Ne. Jen běžné Stripe poplatky (1,4 % + 6 Kč EU karty). Vše ostatní je vaše." },
      { q: "Můžu mít zdarma kurzy a placené zároveň?", a: "Ano. Free tier pro lead magnet, placená úroveň pro hlavní obsah." },
      { q: "Co když klient zruší předplatné?", a: "Přístup zůstává do konce zaplaceného období. Pak se automaticky odebere. Žádné e-maily od vás potřeba." },
    ],
    related: ["eshop-katalog", "platby-fakturace", "clanky-blog"],
  },
  {
    slug: "domena-hosting",
    category: "Infrastruktura",
    title: "Doména a hosting",
    tagline: "Vaše doména. Náš hosting. EU servery.",
    perex:
      "Připojíte stávající doménu nebo si pořídíte novou — vše za vás. Hosting v Praze, Frankfurtu a Amsterdamu. SSL automaticky, DDoS ochrana v ceně.",
    image: "/modules/domena-hosting.jpg",
    imageAlt: "Doménové nastavení v adminu Webero",
    bullets: [
      "Připojení libovolné domény během 2 minut",
      "Registrace nové domény přímo v Weberu",
      "SSL/TLS auto-renew (Let's Encrypt + Cloudflare)",
      "Hosting v EU (Praha, Frankfurt, Amsterdam)",
      "DDoS ochrana Cloudflare Enterprise",
      "99,99% uptime SLA",
    ],
    sections: [
      {
        title: "Bez vendor lock-in",
        body:
          "Doména je vždy vaše. Registrovaná na vás, pod vaším účtem. Pokud se rozhodnete odejít, vezmete si ji s sebou. Žádné drama, žádné poplatky za uvolnění.",
      },
      {
        title: "EU hosting jako standard",
        body:
          "Pro české klienty server v Praze, pro německé ve Frankfurtu, pro západní Evropu Amsterdam. Žádný transfer dat mimo EU. GDPR compliance bez práce. Latence pod 30 ms na 95 % populace EU.",
      },
      {
        title: "Připojení existující domény",
        body:
          "Forpsi, Active24, Wedos, GoDaddy, Namecheap — všechny standardní registrátory podporujeme. Provedeme vás krok za krokem s screenshoty pro váš konkrétní registrátor. SSL se aktivuje automaticky za 5–60 minut po DNS propagaci.",
      },
    ],
    useCases: [
      "Migrace ze starého hostingu",
      "Spuštění úplně nové domény",
      "Multi-doménové weby (CZ + COM)",
      "Subdomény pro různé kampaně",
    ],
    faq: [
      { q: "Co když moje doména už má SSL?", a: "Vyměníme za vlastní (Let's Encrypt) s auto-renew. Bez výpadku, bez vašeho zásahu." },
      { q: "Můžu provozovat e-mail na své doméně?", a: "Ano. E-mail nepřebíráme — můžete použít Google Workspace, Microsoft 365 nebo svého stávajícího providera. MX záznamy nastavíte u registrátora." },
      { q: "Kolik stojí registrace nové .cz domény?", a: "299 Kč/rok přímo z adminu. .com domény 350 Kč/rok." },
    ],
    related: ["zabezpeceni-gdpr", "rychlost-vykon", "podpora-cesky"],
  },
  {
    slug: "analytika-konverze",
    category: "Marketing",
    title: "Analytika a konverze",
    tagline: "Měřte to, co opravdu rozhoduje.",
    perex:
      "Google Analytics 4, Meta Pixel, Conversion API, heatmapy. Vše propojené, žádné kopírování kódu. A/B testování landing pages built-in.",
    image: "/modules/analytika-konverze.jpg",
    imageAlt: "Analytický dashboard s grafy konverze",
    bullets: [
      "Google Analytics 4 napojení dvěma kliky",
      "Meta Pixel + Conversion API server-side",
      "Built-in A/B testing landing pages",
      "Heatmapy Hotjar/Smartlook na klik",
      "Event tracking pro konverze",
      "Real-time dashboard v adminu",
    ],
    sections: [
      {
        title: "Server-side tracking",
        body:
          "Meta Conversion API a GA4 Measurement Protocol server-side. Funguje navzdory iOS 14+ omezením, ad-blockerům a cookie restrikcím. Kvalita atribuce stoupne v průměru o 38 % oproti čistému client-side trackingu.",
      },
      {
        title: "A/B testing bez třetích stran",
        body:
          "Vytvořte dvě varianty stránky, nastavte rozdělení traffic (50/50, 80/20…), vyberte konverzní událost. Webero rozhodne za vás, která vyhrála (na základě statistické signifikance) a automaticky odkloní 100 % traffic na vítěze.",
      },
      {
        title: "Heatmapy a session recording",
        body:
          "Aktivujte Hotjar nebo Smartlook na jeden klik. Sledujte, kde klienti kliknou, kde se zaseknou, kde scrollují. Identifikujte 'mrtvá místa' na stránce a okamžitě je optimalizujte.",
      },
    ],
    useCases: [
      "E-shop optimalizující konverzní cestu",
      "Marketing tým testující landing page",
      "Agency reportující výkon klientovi",
      "B2B web měřící lead quality",
    ],
    faq: [
      { q: "Můžu mít vlastní GA4 účet?", a: "Ano, standardně. Připojíte své Measurement ID a vše posíláme tam. My nic neuchováváme." },
      { q: "Funguje to s iOS 14+ omezením?", a: "Ano, server-side Conversion API obejde frontend cookie restrikce. Atribuce stabilní." },
      { q: "Mám limit na počet A/B testů?", a: "Žádný. Spouštějte testy paralelně, jeden po druhém, nebo souběžně — neomezeně." },
    ],
    related: ["seo-viditelnost", "formulare-leady", "integrace-zapier"],
  },
  {
    slug: "zabezpeceni-gdpr",
    category: "Bezpečnost",
    title: "Zabezpečení a GDPR",
    tagline: "Data klientů v bezpečí. Compliance bez práce.",
    perex:
      "SSL, automatické zálohy, DDoS ochrana, GDPR cookie banner, šifrování at-rest i in-transit. Hosting v EU. Žádný transfer mimo Evropu.",
    image: "/modules/zabezpeceni-gdpr.jpg",
    imageAlt: "Bezpečnostní štít a šifrování dat",
    bullets: [
      "SSL/TLS auto-renew (Let's Encrypt + Cloudflare)",
      "Cloudflare Enterprise DDoS ochrana",
      "Automatické denní zálohy + 30denní historie",
      "AES-256 at rest, TLS 1.3 in transit",
      "GDPR cookie banner s granulárním souhlasem",
      "Hosting v EU (Praha, Frankfurt, Amsterdam)",
    ],
    sections: [
      {
        title: "Bezpečnost na úrovni bank",
        body:
          "Hesla bcrypt s pepperem. Dvoufaktorová autentizace pro adminy. Šifrování dat klientů (formuláře, objednávky) v databázi i přenosu. Žádný plain-text password v logu. SOC 2 Type II u našich providerů (Vercel, Stripe, Cloudflare).",
      },
      {
        title: "GDPR compliance v ceně",
        body:
          "Cookie banner s granulárním souhlasem (technické, analytické, marketingové). Záznam souhlasů s časovým razítkem. Pravidlo právo na zapomenutí — smazání klienta včetně backupů během 30 dní. DPO templates k dispozici.",
      },
      {
        title: "Zálohy, kterým můžete věřit",
        body:
          "Denní snapshot celé databáze a souborů. Historie 30 dní zpět. Obnova jedním klikem — bez ticketu, bez čekání. Zálohy v jiném regionu než produkce (cross-region replication).",
      },
    ],
    useCases: [
      "Zdravotnické zařízení s citlivými daty",
      "Právní kancelář s důvěrností klientů",
      "B2B firma s NDA požadavky",
      "Finanční služby s regulací",
    ],
    faq: [
      { q: "Máte ISO 27001?", a: "My ne, naši infrastruktura providers ano (Vercel, Cloudflare, Stripe). Pro vás to znamená stejnou úroveň ochrany." },
      { q: "Co když ztratím data?", a: "Obnova ze zálohy během minut. Historie 30 dní. Pokud chyba na naší straně způsobí ztrátu, SLA vrací poplatek." },
      { q: "Smažete data klientů na vyžádání?", a: "Ano, do 30 dní včetně backupů. Email confirmation pro audit trail." },
    ],
    related: ["domena-hosting", "podpora-cesky", "integrace-zapier"],
  },
  {
    slug: "integrace-zapier",
    category: "Integrace",
    title: "Integrace a Zapier",
    tagline: "Propojeno se vším, co používáte.",
    perex:
      "5 000+ aplikací přes Zapier a Make. Native Stripe, GA4, Meta Pixel, Mailchimp, Slack, Notion. REST API a webhooks pro vlastní integrace.",
    image: "/modules/integrace-zapier.jpg",
    imageAlt: "Integrační schéma se Zapierem a aplikacemi",
    bullets: [
      "5 000+ aplikací přes Zapier a Make",
      "Native Stripe, GA4, Meta Pixel",
      "Mailchimp, Brevo, ActiveCampaign",
      "Slack, Discord, Microsoft Teams",
      "Notion, Airtable, Google Sheets",
      "REST API + webhooks pro custom",
    ],
    sections: [
      {
        title: "Žádný 'připravujeme'",
        body:
          "Všechny hlavní integrace fungují dnes, ne v roce 2027. Stripe, PayPal, GA4, Meta, Google Workspace, Microsoft 365, Mailchimp, Brevo, ActiveCampaign, Hubspot, Notion, Airtable, Slack, Discord, Teams. Jeden klik, jeden login, hotovo.",
      },
      {
        title: "Webhooks pro vývojáře",
        body:
          "Každá událost (nová objednávka, nová rezervace, vyplněný formulář, nová registrace) může spustit webhook na váš endpoint. JSON payload, retry logic, signature pro security. Připojte k vlastnímu CRM nebo workflow systému.",
      },
      {
        title: "REST API",
        body:
          "Plný read/write přístup k obsahu webu. Vytvářejte články programaticky, exportujte objednávky, synchronizujte produkty s ERP. OAuth 2.0 autentizace, rate limiting 1000 req/min.",
      },
    ],
    useCases: [
      "Synchronizace produktů s ERP systémem",
      "Lead routing do CRM",
      "Automatické faktury do účetnictví",
      "Slack notifikace pro nové objednávky",
    ],
    faq: [
      { q: "Účtujete za integrace?", a: "Ne. Všechny integrace jsou v ceně. Zapier a Make mají vlastní zdarma plány s limitem operací." },
      { q: "Můžu napsat vlastní integraci?", a: "Ano, REST API + webhooks jsou plně dokumentované. SDK v JavaScript, Python a PHP." },
      { q: "Máte SSO pro adminy?", a: "Ano, Google Workspace a Microsoft 365 SSO standardně. SAML 2.0 pro enterprise." },
    ],
    related: ["formulare-leady", "analytika-konverze", "zabezpeceni-gdpr"],
  },
];

MODULES.push(
  {
    slug: "live-editor",
    category: "Editor",
    title: "Live editor",
    tagline: "Editujete přímo na stránce. Co vidíte, to publikujete.",
    perex: "WYSIWYG editor v reálném čase. Klikněte na text, obrázek nebo sekci a upravte ji okamžitě. Žádné admin formuláře, žádné náhledy.",
    image: "/modules/live-editor.jpg",
    imageAlt: "Live editor s inline úpravami",
    bullets: [
      "Inline editace textu jedním klikem",
      "Drag & drop sekcí myší",
      "Klávesové zkratky pro formátování",
      "Auto-save každých 5 sekund",
      "Ctrl+Z s neomezenou historií",
      "Náhled mobile/tablet/desktop",
    ],
    sections: [
      { title: "Jeden klik, jedna změna", body: "Tradiční CMS: otevřete admin, najdete článek, kliknete edit, najdete pole, upravíte, uložíte, zkontrolujete náhled. Webero: kliknete na text na stránce, přepíšete, hotovo. Šetří v průměru 4–6 minut na každou úpravu." },
      { title: "Drag & drop, ne pixel-perfect bordel", body: "Sekce přesouváte myší, ale grid systém zajistí, že vše zůstane v harmonii. Žádné rozházené layouty, žádné překrývající se prvky. Pixelová přesnost na všech zařízeních automaticky." },
      { title: "Bez ztráty kontextu", body: "Vidíte přesně to, co uvidí návštěvník. Žádné překvapení po publikaci. Editor je produkční stránka v editovacím módu — ne abstraktní rozhraní s polem na vyplnění." },
    ],
    useCases: ["Marketing tým upravující landing pages", "Majitel firmy aktualizující kontakty", "Redaktor publikující články", "Tvůrce obsahu testující varianty"],
    faq: [
      { q: "Funguje to na mobilu?", a: "Ano, plný editor i z telefonu nebo tabletu. Užitečné pro rychlé úpravy během cesty." },
      { q: "Můžu vrátit změnu?", a: "Ctrl+Z s neomezenou historií. Plus verzování pro vrácení o dny/týdny zpátky." },
      { q: "Vidí změny i hostujícím?", a: "Ne, dokud nepublikujete. Vy upravujete v draft módu, návštěvník stále vidí starou verzi." },
    ],
    related: ["historie-verze", "tym-role", "media-knihovna"],
  },
  {
    slug: "historie-verze",
    category: "Editor",
    title: "Historie a verzování",
    tagline: "Vraťte se k libovolné verzi za sekundu.",
    perex: "Každá změna stránky se ukládá jako verze. Vrátit se zpátky o 5 minut nebo o 5 měsíců — jeden klik, žádný stres.",
    image: "/modules/historie-verze.jpg",
    imageAlt: "Historie změn stránky se seznamem verzí",
    bullets: [
      "Auto-snapshot každé změny",
      "Neomezená historie",
      "Side-by-side porovnání verzí",
      "Obnova jedním klikem",
      "Kdo a kdy udělal změnu",
      "Komentáře k verzím",
    ],
    sections: [
      { title: "Žádný strach z chyby", body: "Smazali jste omylem celou sekci? Přepsali špatným textem? Klient vrátil 'tu starou verzi'? Jeden klik a jste zpátky. Verze se ukládají automaticky, vy nemusíte myslet na 'uložit kopii'." },
      { title: "Audit trail pro týmy", body: "Vidíte, kdo udělal jakou změnu, kdy a proč (pokud přidal komentář). Užitečné pro agentury, redakce, marketing týmy — kde je víc lidí v editoru a věci se občas pokazí." },
      { title: "Side-by-side porovnání", body: "Vidíte starou a novou verzi vedle sebe. Změněné řádky zvýrazněné. Rozhodnete, kterou verzi chcete, a publikujete. Bez nahlížení do diff souborů." },
    ],
    useCases: ["Agentura s několika autory na webu", "Redakce s editorskou hierarchií", "Klient revertující nepovedené úpravy", "Backup před velkou změnou designu"],
    faq: [
      { q: "Mám limit počtu verzí?", a: "Žádný. Posledních 30 dní vždy okamžitě k dispozici, starší archivované s deduplication." },
      { q: "Obnoví se i media?", a: "Ano. Pokud verze referencovala konkrétní obrázek, obnoví se s ní i ten obrázek (i kdyby byl mezi tím smazán)." },
      { q: "Funguje to pro obsah e-shopu?", a: "Ano, verzování pokrývá i produkty, kategorie a settings." },
    ],
    related: ["live-editor", "tym-role", "zabezpeceni-gdpr"],
  },
  {
    slug: "tym-role",
    category: "Tým",
    title: "Tým a role",
    tagline: "Spolupracujte bez chaosu. Každý vidí jen své.",
    perex: "Pozvěte spolupracovníky, přiřaďte role, nastavte granulární práva. Editor, redaktor, admin, designer — každý má svůj svět.",
    image: "/modules/tym-role.jpg",
    imageAlt: "Tým členové s rolemi a oprávněními",
    bullets: [
      "5 přednastavených rolí + custom",
      "Granulární práva per stránka/sekce",
      "Pozvánky e-mailem nebo SSO",
      "Aktivita auditní log",
      "Sandbox pro nové členy",
      "Souběžná editace s konflikt detekcí",
    ],
    sections: [
      { title: "Role pro každého", body: "Admin — všechno. Editor — obsah, ne settings. Autor — píše a publikuje, neupraví cizí články. Designer — mění styly, neupraví obsah. Klient — vidí, ale neupraví. Nebo si vytvořte vlastní roli pro váš workflow." },
      { title: "Granulární práva", body: "Můžete dát někomu přístup jen k blogu, ne k e-shopu. Nebo jen k jedné kampani, ne ke zbytku webu. Pro agentury klíčové — klient nesmí dostat redaktor do jiné kampaně." },
      { title: "Souběžná editace", body: "Dva lidé v editoru zároveň? Ukážeme vám kurzor toho druhého a varování, když oba editujete stejnou sekci. Jako v Figmě nebo Google Docs." },
    ],
    useCases: ["Marketing agentura se 4 klienty", "Redakce s šéfredaktorem a 6 autory", "Designer + content writer + dev", "Firma s externí PR agenturou"],
    faq: [
      { q: "Účtujete za počet uživatelů?", a: "Ne. Pozvěte tolik lidí, kolik potřebujete. Cena je za web, ne za sedadla." },
      { q: "Funguje SSO?", a: "Google Workspace a Microsoft 365 standardně. SAML 2.0 pro enterprise." },
      { q: "Mohu odebrat přístup okamžitě?", a: "Ano, jeden klik, přístup ukončen. Včetně aktivních session." },
    ],
    related: ["historie-verze", "live-editor", "enterprise-sso"],
  },
  {
    slug: "newsletter-mailing",
    category: "Marketing",
    title: "Newsletter a e-mailing",
    tagline: "Pošlete e-mail tisícům lidí. Jedním klikem.",
    perex: "Built-in newsletter — vlastní šablony, segmentace, automation, statistiky. Bez napojení na Mailchimp, bez extra plateb.",
    image: "/modules/newsletter-mailing.jpg",
    imageAlt: "E-mail newsletter v Webero editoru",
    bullets: [
      "Vlastní šablony s drag & drop",
      "Segmentace podle chování klientů",
      "A/B testování subject lines",
      "Drip kampaně a automation",
      "Open rate, click rate, unsubscribe",
      "DKIM/SPF/DMARC nastaveno za vás",
    ],
    sections: [
      { title: "Doručitelnost na úrovni Mailchimpu", body: "Posíláme přes Amazon SES s dedikovanými IP. DKIM, SPF, DMARC nastaveno automaticky pro vaši doménu. Reputation monitoring 24/7. Doručitelnost > 98 % do inboxů (ne do spamu)." },
      { title: "Automation bez kódu", body: "Sekvence e-mailů spuštěné akcí (registrace, opuštěný košík, narozeniny). Drag & drop workflow editor. Conditional branching podle chování příjemce." },
      { title: "Segmentace, co dává smysl", body: "Posílejte různé e-maily různým segmentům. Klienti, kteří nakoupili. Klienti, kteří se registrovali, ale nenakoupili. Klienti, kteří otevřeli posledních 5 newsletterů. Bez SQL, bez datového analytika." },
    ],
    useCases: ["E-shop s newsletter kampaněmi", "Blog s týdenním shrnutím", "Hotel s sezónními akcemi", "Online kurz s drip onboardingem"],
    faq: [
      { q: "Kolik e-mailů můžu poslat měsíčně?", a: "5 000 v základním plánu, dál 0,02 Kč za e-mail. Pro velké odběratele sleva podle volume." },
      { q: "Můžu importovat seznam odběratelů?", a: "Ano, CSV import s validací e-mailů (žádné bouncy z importu)." },
      { q: "Jak řešíte unsubscribe?", a: "Auto-link v patičce každého e-mailu, jeden klik a klient je odebrán napříč všemi sekvencemi." },
    ],
    related: ["formulare-leady", "analytika-konverze", "predplatne-kurzy"],
  },
  {
    slug: "popup-bannery",
    category: "Konverze",
    title: "Pop-upy a bannery",
    tagline: "Zaujměte ve správný moment. Bez bombardování.",
    perex: "Vyskakovací okna a bannery s chytrými triggery — exit-intent, scroll depth, čas na stránce, počet návštěv. Bez programátora.",
    image: "/modules/popup-bannery.jpg",
    imageAlt: "Pop-up okno s formulářem na newsletter",
    bullets: [
      "Exit-intent detection",
      "Triggery — scroll, čas, návštěva",
      "A/B testování variant",
      "Frekvenční omezení (max 1x za den)",
      "Geo-targeting (jen pro Prahu)",
      "Mobile-friendly varianty",
    ],
    sections: [
      { title: "Inteligentní triggery", body: "Exit-intent: ukážeme pop-up, když uživatel míří kurzorem k zavření taby. Scroll 50 %: aktivuje se, když je čtenář zaujatý. Návrat 3x: pro stálé návštěvníky. Vyberte si moment, kdy je pravděpodobnost konverze nejvyšší." },
      { title: "Frequency capping", body: "Nikdy nezobrazujte stejný pop-up víckrát než 1x za 7 dní (nebo 1x za session). Klienti vás nebudou nenávidět. Konverzní poměr stoupne, protože nezklamete ty, kdo už jednou viděli." },
      { title: "Bez code injection", body: "Drag & drop editor pop-upu jako jakákoli jiná sekce. Styly, animace, formuláře. Embed do Mailchimpu nebo CRM přes hotové integrace." },
    ],
    useCases: ["E-shop s exit-intent slevou", "Blog s newsletter sběrem", "B2B web s lead magnet PDF", "Restaurace s rezervační notifikací"],
    faq: [
      { q: "Nezhorší to PageSpeed?", a: "Ne. Pop-up se loaduje async po main content. Bez vlivu na Core Web Vitals." },
      { q: "Funguje to s GDPR?", a: "Ano, klient může pop-up zavřít bez interakce, nepočítá se to jako souhlas. Respektujeme cookie preferences." },
      { q: "Můžu A/B testovat různé verze?", a: "Ano, dvě varianty, 50/50 split, automatický vítěz na základě konverzí." },
    ],
    related: ["formulare-leady", "newsletter-mailing", "analytika-konverze"],
  },
  {
    slug: "vicejazycne-weby",
    category: "Marketing",
    title: "Vícejazyčné weby",
    tagline: "Jeden web, mnoho jazyků. Z jednoho adminu.",
    perex: "CZ, EN, DE, SK, PL — a další. Spravujte všechny verze z jednoho adminu, automatický hreflang, per-jazyk SEO, lokalizace formátů.",
    image: "/modules/vicejazycne-weby.jpg",
    imageAlt: "Přepínač jazyků v navigaci webu",
    bullets: [
      "20+ jazyků out of the box",
      "Side-by-side překlad v editoru",
      "Automatický hreflang pro Google",
      "Per-jazyk SEO meta (title, desc)",
      "Lokalizace dat, čísel a měny",
      "RTL podpora (arabština, hebrejština)",
    ],
    sections: [
      { title: "Spravujte vše z jednoho místa", body: "V editoru klikněte na text, vidíte všechny jazykové varianty pod sebou. Upravíte CZ verzi, hned vedle pole pro EN, DE, SK. Žádné přepínání mezi adminy, žádné zapomenuté překlady." },
      { title: "Hreflang automaticky", body: "Google potřebuje vědět, která stránka je pro koho — hreflang tagy spojí CZ a EN verzi. Generujeme za vás v &lt;head&gt; každé stránky. Vyhnete se ranking penaltě za duplicitní obsah." },
      { title: "Lokalizace, ne jen překlad", body: "Datumy v EN se zobrazí 'June 24, 2026', v DE '24. Juni 2026', v CZ '24. června 2026'. Měny se konvertují podle aktuálního kurzu. Telefony se zobrazí s lokální předvolbou." },
    ],
    useCases: ["Hotel pro mezinárodní turisty", "B2B firma expandující do DE", "E-shop prodávající do CZ + SK + PL", "SaaS s globálními zákazníky"],
    faq: [
      { q: "Pomůžete s překlady?", a: "Pro standardní plán doporučujeme DeepL nebo profesionální překladatele. Pro individuální péči nabízíme partnerství s překladatelskou agenturou." },
      { q: "Funguje to s SEO v každém jazyce?", a: "Ano, plné SEO meta per stránka per jazyk. Sitemap obsahuje všechny varianty." },
      { q: "Auto-translate na klik?", a: "DeepL integrace v editoru — návrh překladu, lidský review, publikace. Ne plné auto bez kontroly." },
    ],
    related: ["seo-viditelnost", "clanky-blog", "domena-hosting"],
  },
  {
    slug: "platby-fakturace",
    category: "E-commerce",
    title: "Platby a fakturace",
    tagline: "Karty, bankovní převod, Apple Pay. PDF faktury automaticky.",
    perex: "Stripe, PayPal, GoPay, bankovní převod. Faktury v PDF, číselné řady, archiv pro účetnictví. Bez extra modulů.",
    image: "/modules/platby-fakturace.jpg",
    imageAlt: "Pokladna s výběrem platební metody",
    bullets: [
      "Stripe, PayPal, GoPay, převod",
      "Apple Pay, Google Pay v ceně",
      "PDF faktury automaticky",
      "Číselné řady podle vašeho účetnictví",
      "Export pro POHODA, Money S3",
      "Refundace jedním klikem",
    ],
    sections: [
      { title: "Pokladna optimalizovaná pro konverze", body: "Jeden krok, žádná nucená registrace, žádné rozptylování. Apple Pay tap-to-pay během 3 sekund. Konverzní poměr našich pokladen je v průměru 2,3× vyšší než u standardních e-commerce řešení." },
      { title: "Faktury v souladu s českou legislativou", body: "Generujeme PDF s IČO, DIČ, DPH rozpadem, položkami, číselnou řadou. Posíláme klientovi automaticky. Archivujeme 10 let pro daňové účely. Export do POHODA, Money S3, FlexiBee." },
      { title: "Bez transakční provize", body: "My si nebereme žádný podíl z prodeje. Stripe účtuje standardních 1,4 % + 6 Kč za EU karty. PayPal 3,4 % + 10 Kč. Žádné skryté poplatky od nás." },
    ],
    useCases: ["E-shop s digitálním produktem", "Online kurz s předplatným", "B2B služby s fakturací", "Donations pro nonprofit"],
    faq: [
      { q: "Můžu mít víc měn?", a: "Ano. Stripe multi-currency. Aktivujete v nastavení, klient platí v Eur, vy dostáváte CZK po konverzi." },
      { q: "Funguje to s EET?", a: "EET aktuálně neaktivní v ČR. Pokud se vrátí, máme připravenou integraci." },
      { q: "Jak řešíte vratky?", a: "Refund jedním klikem v adminu. Stripe vrací během 5–10 pracovních dní na původní kartu." },
    ],
    related: ["eshop-katalog", "predplatne-kurzy", "rezervace-online"],
  },
  {
    slug: "galerie-foto",
    category: "Obsah",
    title: "Fotogalerie",
    tagline: "Ukažte své fotky tak, aby vynikly.",
    perex: "Masonry, grid, slideshow, lightbox, before/after, 360°. Pro fotografy, architekty, restaurátory, hoteliéry.",
    image: "/modules/galerie-foto.jpg",
    imageAlt: "Foto galerie s masonry layoutem",
    bullets: [
      "6 layoutů (grid, masonry, slideshow…)",
      "Lightbox s zoom a swipe",
      "Before/after slider",
      "360° panorama",
      "Watermark s logem",
      "Pravoklik proti stahování",
    ],
    sections: [
      { title: "Layouty pro každou potřebu", body: "Masonry pro různé poměry stran. Grid pro uniformitu. Slideshow pro storytelling. Před/po pro renovace a transformace. 360° pro nemovitosti. Vyberete layout, nahrajete fotky, hotovo." },
      { title: "Optimalizace bez kompromisů", body: "Nahrajete originál v JPG nebo RAW. My konvertujeme do AVIF (next-gen) a WebP fallback. Servírujeme variantu podle device. 4K monitor dostane plnou kvalitu, mobil úspornější verzi. Úspora dat: 73 %." },
      { title: "Ochrana proti krádeži", body: "Volitelný watermark s logem. Pravoklik (download/save image) zablokovaný. EXIF s vaším copyrightem. Pro profesionální fotografy klíčové — vaše práce, vaše pravidla." },
    ],
    useCases: ["Svatební fotograf s portfoliem", "Architekt s realizovanými projekty", "Restaurátor s před/po fotkami", "Hotel s prezentací pokojů"],
    faq: [
      { q: "Kolik fotek mohu nahrát?", a: "100 GB storage = cca 10 000 high-res fotek. Pro víc dostupné upgrade." },
      { q: "Mohu mít privátní galerii pro klienty?", a: "Ano, password-protected galerie pro klientskou prohlídku před dodáním." },
      { q: "Funguje to s Lightroom?", a: "Lightroom export do JPG, drag & drop do galerie. Bezproblémové." },
    ],
    related: ["media-knihovna", "rychlost-vykon", "clanky-blog"],
  },
  {
    slug: "video-streaming",
    category: "Obsah",
    title: "Video streaming",
    tagline: "Vlastní video, bez YouTube logo.",
    perex: "Nahrajete MP4, my streamujeme adaptivně podle připojení. HLS pro plynulé přehrávání. Bez reklam, bez related videos vedoucích pryč.",
    image: "/modules/video-streaming.jpg",
    imageAlt: "Video přehrávač v hero sekci",
    bullets: [
      "Adaptive bitrate (HLS)",
      "Auto-konverze do h.264/h.265",
      "Thumbnail z konkrétního framu",
      "Bez YouTube/Vimeo branding",
      "Captions (SRT, VTT)",
      "Analytics — view rate, completion",
    ],
    sections: [
      { title: "Žádné YouTube logo na vašem webu", body: "YouTube embed má reklamy, related videos, tlačítko 'Watch on YouTube' a YouTube logo. Návštěvník odchází z vašeho webu. S Weberem máte čisté video, plně v branding vašem." },
      { title: "Streaming, který funguje na 3G i fiber", body: "HLS adaptive bitrate detekuje rychlost připojení a servíruje optimální kvalitu. Mobile na 4G dostane 720p. Desktop na fiber 4K. Nikdy buffering, nikdy mrhání datovým objemem." },
      { title: "Pro online kurzy a portfolia", body: "Lektoři: bez reklam u vašich lekcí. Filmaři: bez komprese, která zničí grading. Restaurace: hero video pokrmů bez YouTube playeru. Hotely: virtual tour pokojů v plné kvalitě." },
    ],
    useCases: ["Online kurz s videolekcemi", "Filmař s portfoliem", "Hotel s virtual tour", "Restaurace s atmosférickým hero videem"],
    faq: [
      { q: "Limit délky/velikosti?", a: "Až 2 GB na soubor. Pro delší videa dostupný upgrade storage." },
      { q: "Mohu si nastavit thumbnail?", a: "Ano, vyberete frame ze sekvence nebo nahrajete vlastní obrázek." },
      { q: "Funguje to s autoplay?", a: "Auto-play muted (jak vyžadují prohlížeče). Po unmute se aktivuje. Pro hero videa standard." },
    ],
    related: ["media-knihovna", "rychlost-vykon", "predplatne-kurzy"],
  },
  {
    slug: "mapy-lokace",
    category: "Konverze",
    title: "Mapy a lokace",
    tagline: "Klient vás najde za 5 sekund.",
    perex: "Google Maps, Mapy.cz, OpenStreetMap. Adresa, otevírací doba, navigace, parking — vše v jedné sekci.",
    image: "/modules/mapy-lokace.jpg",
    imageAlt: "Mapa s pinem na lokaci provozovny",
    bullets: [
      "Google Maps + Mapy.cz + OSM",
      "Pin s vlastním ikonou a brandingem",
      "Otevírací doba s 'Otevřeno teď' badgem",
      "Navigace jedním klikem",
      "Multi-location pro pobočky",
      "Indoor mapy pro velké provozovny",
    ],
    sections: [
      { title: "Mapy bez API klíče peklo", body: "Google Maps vyžadují API klíč, billing setup, kvóty a rate limits. Mapy.cz vyžadují vlastní ucet. S Weberem klikněte na adresu, mapa se zobrazí — my řešíme klíče za vás, v ceně plánu." },
      { title: "Otevírací doba, která se synchronizuje", body: "Nastavíte hodiny v adminu. Web ukazuje 'Otevřeno teď' nebo 'Zavřeno, otevřeno zítra v 8:00'. Sváteční hodiny per rok. Webový posel vašemu marketingu." },
      { title: "Pro multi-location firmy", body: "Sit ě 5 poboček? Mapa s pulldown výběrem lokace. Klient si vybere svou pobočku, vidí adresu, kontakt, otevírací dobu. Pro řetězce, franšízy, agentury s několika kancelářemi." },
    ],
    useCases: ["Restaurace s parkovacím tipem", "Klinika s víceméně pobočkami", "Hotel s navigací z letiště", "Servis s mapou + telefonem"],
    faq: [
      { q: "Google Maps stojí extra?", a: "V základním plánu pokrýváme až 25 000 zobrazení mapy měsíčně. Nad to 0,02 Kč/zobrazení (Google ceník nepřeúčtováváme s marží)." },
      { q: "Funguje Mapy.cz?", a: "Ano, integrace v ceně. Pro CZ trh preferované, načítají se rychleji." },
      { q: "Mohu mít pin s vlastní ikonou?", a: "Ano, upload PNG (transparentní pozadí), použije se jako marker." },
    ],
    related: ["rezervace-online", "kontaktni-formular", "embed-kody"],
  },
  {
    slug: "recenze-rating",
    category: "Konverze",
    title: "Recenze a hodnocení",
    tagline: "Sociální důkaz, který prodává.",
    perex: "Sbírejte recenze přímo z webu nebo importujte z Google, Heureka, Mapy.cz. Schema.org Review pro Google star ratings.",
    image: "/modules/recenze-rating.jpg",
    imageAlt: "Sekce recenzí s hvězdičkami a citáty",
    bullets: [
      "Import z Google, Heureka, Mapy.cz",
      "JSON-LD Review schema",
      "Hvězdičky v Google výsledcích",
      "Auto-collect po objednávce",
      "Moderace před zveřejněním",
      "Reply on review s notifikací",
    ],
    sections: [
      { title: "Google star ratings", body: "JSON-LD Review schema přiměje Google zobrazit zlaté hvězdičky pod vaším výsledkem ve vyhledávání. CTR roste průměrně o 35 %. Bez SEO konzultanta, automaticky." },
      { title: "Auto-collect z objednávek", body: "Klient nakoupí, 7 dní po doručení dostane e-mail s prosbou o recenzi. Klik, hvězdičky, krátký text, hotovo. Konverzní poměr v recenzi: 12–18 % (vs. 2–4 % manuálního proseba)." },
      { title: "Reply on review", body: "Notifikace, když přijde nová recenze. Odpovězte přímo z adminu — public reply pod recenzí. Negativní recenze s dobrou odpovědí dělá lepší dojem než žádná negativní vůbec." },
    ],
    useCases: ["E-shop s ratingem produktů", "Hotel s recenzemi pokojů", "Restaurace s Google recenzemi", "Servis s důvěryhodným profilem"],
    faq: [
      { q: "Můžu skrýt negativní recenze?", a: "Můžete moderovat před zveřejněním, ale doporučujeme zveřejnit i kritiku — působí důvěryhodněji. Filtrujte jen spam a urážky." },
      { q: "Import z Google funguje automaticky?", a: "Pro vás napojený Google Business Profile auto-sync 1x denně. Nové recenze se objeví bez akce." },
      { q: "Funguje na produktech v e-shopu?", a: "Ano, per-produkt rating + recenze. Aggregate rating se zobrazí ve výpisu kategorie." },
    ],
    related: ["seo-viditelnost", "eshop-katalog", "analytika-konverze"],
  },
  {
    slug: "ai-asistent",
    category: "AI",
    title: "AI asistent pro obsah",
    tagline: "Generujte texty, alt tagy a meta popisy automaticky.",
    perex: "Built-in AI asistent (GPT-4 class) pro psaní článků, generování alt textů, návrhy SEO meta a překlady. Bez další subskripce.",
    image: "/modules/ai-asistent.jpg",
    imageAlt: "AI generuje obsah článku v editoru",
    bullets: [
      "Generování článků z briefu",
      "Auto alt-text pro obrázky",
      "SEO meta description návrhy",
      "Překlad mezi 20+ jazyky",
      "Tone of voice — formální/kreativní",
      "100 000 tokenů měsíčně v ceně",
    ],
    sections: [
      { title: "AI psaní pod kontrolou", body: "Napíšete brief: 'Článek o tom, jak vybrat barvu na fasádu, 600 slov, ton expertní'. AI navrhne osnovu, vy schválíte, AI dopíše. Vy upravíte, publikujete. Šetří 60–80 % času psaní." },
      { title: "Alt texty pro accessibility i SEO", body: "Nahrajete 50 fotek do galerie. AI vidí každou fotku a navrhne alt text v češtině. 'Bílá moderní obývací místnost s velkým oknem a šedou pohovkou.' Pro SEO i WCAG compliance." },
      { title: "Bez extra subskripce", body: "100 000 tokenů měsíčně v základním plánu = cca 75 000 slov textu. ChatGPT Plus stojí extra 600 Kč/měs. U nás v ceně. Pro intenzivnější use cases dostupný upgrade." },
    ],
    useCases: ["Blog s rychlým výstupem článků", "E-shop generující produktové popisy", "Marketing tým s tone of voice guidance", "Multi-language web s návrhem překladů"],
    faq: [
      { q: "Jaký model používáte?", a: "GPT-4 class (current frontier). Anthropic Claude jako alternativa pro citlivý obsah." },
      { q: "Patří mi vygenerovaný obsah?", a: "Plně. AI je nástroj, výstup je váš (legálně i prakticky)." },
      { q: "Co když AI napíše nesmysl?", a: "Vždy je human-in-the-loop. AI navrhne, vy schválíte. Žádné publishing bez vašeho confirmu." },
    ],
    related: ["clanky-blog", "seo-viditelnost", "vicejazycne-weby"],
  },
  {
    slug: "accessibility-wcag",
    category: "Bezpečnost",
    title: "Přístupnost (WCAG)",
    tagline: "Pro všechny uživatele. I pro screen readery.",
    perex: "WCAG 2.1 AA compliance out of the box. Skip links, ARIA labels, kontrast 4.5:1, klávesnice navigace. Pro nonprofit, státní správu, inkluzivní firmy.",
    image: "/modules/accessibility-wcag.jpg",
    imageAlt: "Web s WCAG accessibility nástroji",
    bullets: [
      "WCAG 2.1 AA z výroby",
      "Screen reader (NVDA, JAWS) tested",
      "Klávesnice plně navigovatelné",
      "Kontrast 4.5:1 v každém tématu",
      "Skip links a landmark regions",
      "Auto-audit s alertem na regrese",
    ],
    sections: [
      { title: "Přístupnost není volitelná", body: "Pro nonprofit a státní správu je WCAG zákonný požadavek (EAA 2025). Pro komerční firmy je to 15 % populace s nějakou formou postižení — ztrácet tyto klienty je drahé." },
      { title: "Tested, ne jen claimed", body: "Naše šablony testujeme s NVDA (screen reader pro Windows), JAWS (enterprise) a VoiceOver (macOS/iOS). Plně klávesnicí navigovatelné. Skip links pro rychlou navigaci. Landmark regions pro orientaci." },
      { title: "Auto-audit při každé publikaci", body: "Před každou publikací stránky se spustí accessibility check. Chybí alt text? Špatný kontrast? Tlačítko bez label? Dostanete varování s návrhem opravy. Žádné regrese." },
    ],
    useCases: ["Nonprofit organizace s povinností WCAG", "Státní správa a samospráva", "Velká firma s inkluzivní politikou", "B2B prodej do enterprise s a11y požadavky"],
    faq: [
      { q: "Garantujete WCAG AA?", a: "Default šablony AA. Pokud upravíte design (extrémní kontrast, mikro fonty), můžete to porušit. Auto-audit vás na to upozorní." },
      { q: "Máte certifikaci?", a: "My máme third-party audit reportu od Deque (a11y leader). Pro vaši konkrétní implementaci doporučujeme samostatný audit po launch." },
      { q: "Funguje to s vlastním JavaScriptem?", a: "Vlastní JS může a11y porušit. Doporučujeme používat naše komponenty, které jsou již accessible." },
    ],
    related: ["zabezpeceni-gdpr", "seo-viditelnost", "live-editor"],
  },
  {
    slug: "kontaktni-formular",
    category: "Konverze",
    title: "Kontaktní formuláře",
    tagline: "Lead je jen kliknutí daleko.",
    perex: "Hotové šablony formulářů — kontakt, poptávka, registrace, RSVP. Drag & drop konfigurátor, validace, anti-spam.",
    image: "/modules/kontaktni-formular.jpg",
    imageAlt: "Vyplněný kontaktní formulář na webu",
    bullets: [
      "20+ hotových šablon",
      "Conditional logic (pole závislé na odpovědi)",
      "Validace ČR (IČO, PSČ, telefon)",
      "reCAPTCHA v3 (neviditelná)",
      "Notifikace e-mail, Slack, Teams",
      "GDPR souhlas a privacy compliance",
    ],
    sections: [
      { title: "Šablona pro každou potřebu", body: "Kontakt (jméno, e-mail, zpráva). Poptávka (rozpočet, deadline, popis). Registrace na event. RSVP. Quote requester. Job application s CV uploadem. Vyberete šablonu, upravíte pole, hotovo." },
      { title: "Conditional logic", body: "Klient zaškrtne 'mám firmu', objeví se pole pro IČO. Klient vybere 'velký projekt', pole rozpočtu se rozšíří. Bez programátora, drag & drop konfigurátor s if-then logikou." },
      { title: "Lead do CRM", body: "Po odeslání: e-mail vám, SMS klientovi (volitelné), záznam do Hubspot/Pipedrive (přes Zapier), notifikace do Slacku. Lead nikam nezapadne." },
    ],
    useCases: ["Stavební firma s poptávkovým formulářem", "Konferenční organizátor s RSVP", "B2B s lead generation", "Job posting s CV uploadem"],
    faq: [
      { q: "Mám limit počtu odeslání?", a: "100 000 měsíčně v základním plánu. Pro spam protection rate-limited per IP." },
      { q: "Funguje na mobile?", a: "Plně responzivní, optimalizované pro touch input." },
      { q: "Posíláte SMS notifikace?", a: "Volitelně — Twilio integrace s pay-per-SMS modelem." },
    ],
    related: ["formulare-leady", "newsletter-mailing", "integrace-zapier"],
  },
  {
    slug: "ssl-zabezpeceni",
    category: "Bezpečnost",
    title: "SSL a HTTPS",
    tagline: "Šifrované spojení od první minuty.",
    perex: "Let's Encrypt SSL pro každou doménu i subdoménu. Auto-renew, A+ rating na SSL Labs, žádné varování v prohlížeči.",
    image: "/modules/ssl-zabezpeceni.jpg",
    imageAlt: "Zelený zámek SSL v adresním řádku",
    bullets: [
      "Let's Encrypt SSL zdarma",
      "Cloudflare SSL backup",
      "Auto-renew 90 dní před expirací",
      "A+ rating na SSL Labs",
      "Wildcard SSL pro subdomény",
      "HSTS preload eligibility",
    ],
    sections: [
      { title: "SSL bez vašeho zásahu", body: "Připojíte doménu, SSL se aktivuje do 5 minut po DNS propagaci. Auto-renew 90 dní před expirací (vy nemusíte myslet, my hlídáme). Pokud Let's Encrypt selže (rare), Cloudflare SSL jako fallback." },
      { title: "A+ rating", body: "Standardní Let's Encrypt + naše konfigurace TLS 1.3, perfect forward secrecy, HSTS preload = SSL Labs A+ rating. Google ranking benefit, klientská důvěra, žádné varování v Chrome." },
      { title: "Wildcard pro pokročilé", body: "Web na example.com, blog na blog.example.com, shop na shop.example.com — wildcard SSL pokryje všechny subdomény. Bez konfigurace per-subdomain." },
    ],
    useCases: ["Firma upgradující ze starého hostingu", "Multi-subdomain s blogem a shopem", "E-shop s důrazem na bezpečnost", "B2B web s NDA požadavky"],
    faq: [
      { q: "Mám platit za SSL?", a: "Ne. Let's Encrypt je zdarma, my pokrýváme renewal a Cloudflare backup." },
      { q: "Co když mám vlastní SSL certifikát?", a: "Můžete použít. Upload PEM a klíč v adminu. Pro EV certifikáty (zelený panel) tato cesta." },
      { q: "Funguje to s e-mailem na mé doméně?", a: "E-mail je separately. Pro web SSL od nás, pro e-mail SSL od vašeho mail providera (Google Workspace, MS 365)." },
    ],
    related: ["domena-hosting", "zabezpeceni-gdpr", "rychlost-vykon"],
  },
  {
    slug: "backup-obnova",
    category: "Bezpečnost",
    title: "Zálohy a obnova",
    tagline: "Spát klidněji. Vše máme zazálohované.",
    perex: "Denní snapshot celé databáze a souborů. 30denní historie. Obnova jedním klikem během minut. Cross-region replication.",
    image: "/modules/backup-obnova.jpg",
    imageAlt: "Seznam záloh s časovými značkami",
    bullets: [
      "Denní automatický snapshot",
      "30denní historie verzí",
      "Cross-region replication (Praha + Frankfurt)",
      "Point-in-time recovery",
      "Obnova jedním klikem",
      "Bez vašeho zásahu, bez plateb extra",
    ],
    sections: [
      { title: "Backup, který se opravdu obnoví", body: "Tradiční hosting říká 'máme zálohy', ale obnova trvá hodiny nebo dny + ticket s tech support. U nás: klik v adminu, výběr datumu, obnova v 3 minutách. Otestováno měsíčně." },
      { title: "Cross-region replication", body: "Záloha v Praze, kopie zálohy ve Frankfurtu. Pokud Praha lehne, Frankfurt naskočí. Pokud lehne celá Evropa (extrémní scénář), máme i Amsterdam. Pravděpodobnost ztráty dat: 0,001 %." },
      { title: "Point-in-time recovery", body: "Pro databázové operace — obnovte stav z přesné minuty před chybou. 'Před 47 minutami jsem omylem smazal celý katalog' → obnova na 48 minut zpět. Bez ztráty mezitím vzniklých objednávek." },
    ],
    useCases: ["Před velkou migrací designu", "Po chybě klienta v editoru", "Compliance audit s historickými snapshoty", "Disaster recovery scénáře"],
    faq: [
      { q: "Co když smažu omylem klienta?", a: "Z poslední 24h zálohy obnova během minut. Pro starší starší zálohu 30 dní zpět." },
      { q: "Mohu si stáhnout zálohu lokálně?", a: "Ano, full export jako SQL dump + zip souborů. Pro paranoidní auditní účely." },
      { q: "Účtujete za obnovu?", a: "Ne. Neomezené obnovy v ceně plánu." },
    ],
    related: ["zabezpeceni-gdpr", "historie-verze", "domena-hosting"],
  },
  {
    slug: "cookie-banner",
    category: "Bezpečnost",
    title: "Cookie banner & GDPR",
    tagline: "Compliance bez právníka. Hotovo za 2 minuty.",
    perex: "GDPR + ePrivacy compliant cookie banner s granulárním souhlasem. Záznam souhlasů s timestampem, audit log, DSAR templates.",
    image: "/modules/cookie-banner.jpg",
    imageAlt: "Cookie banner s granulárním nastavením",
    bullets: [
      "Granulární souhlas (technické/analytické/marketing)",
      "Záznam souhlasů s timestampem",
      "Audit log pro ÚOOÚ kontrolu",
      "DSAR templates (právo na zapomenutí)",
      "Aktualizace podle nové legislativy",
      "20+ jazykových variant",
    ],
    sections: [
      { title: "Granulární, ne all-or-nothing", body: "Klient může souhlasit s technickými cookies, ale ne s marketingovými. Můžete povolit analytiku, ale ne tracking pro reklamu. ePrivacy 2025 vyžaduje granularitu — máme připravené." },
      { title: "Audit log pro ÚOOÚ", body: "Každý souhlas záznamován s IP, timestampem, verzí cookie policy a zvolenými kategoriemi. V případě kontroly ÚOOÚ máte důkaz, kdo s čím souhlasil." },
      { title: "DSAR (Data Subject Access Request)", body: "Klient má právo na info, opravu, smazání nebo přenosnost svých dat. Máme templates e-mailů, workflow v adminu, GDPR-compliant export v JSONu. Smazání včetně backupů do 30 dnů." },
    ],
    useCases: ["E-shop s marketingovou kampaní", "B2B web s analytikou", "Mezinárodní web s odlišnými jurisdikcemi", "Firma pod auditem GDPR"],
    faq: [
      { q: "Aktualizujete to s novou legislativou?", a: "Ano, sledujeme ÚOOÚ stanoviska a EDPB guidance. Update banneru automaticky pro všechny weby." },
      { q: "Funguje to s Google Tag Manager?", a: "Ano, integrace s consent mode v2 (povinné od března 2024)." },
      { q: "Můžu si přizpůsobit design?", a: "Ano, plně — barvy, fonty, copy textů. Funkčnost zůstává compliance." },
    ],
    related: ["zabezpeceni-gdpr", "analytika-konverze", "domena-hosting"],
  },
  {
    slug: "embed-kody",
    category: "Integrace",
    title: "Embed kódy",
    tagline: "Calendly, YouTube, Spotify — vše bez ztráty výkonu.",
    perex: "Hotové bloky pro Calendly, YouTube, Spotify, Vimeo, Typeform, Instagram. Lazy-load, bez vlivu na PageSpeed.",
    image: "/modules/embed-kody.jpg",
    imageAlt: "Embed kódy v editoru — Calendly, YouTube",
    bullets: [
      "50+ hotových embed bloků",
      "Lazy-load (loaduje se po scroll)",
      "Žádný impact na PageSpeed",
      "Custom HTML/JS pro custom embedy",
      "Sandboxing pro bezpečnost",
      "Cookie consent gating",
    ],
    sections: [
      { title: "Embed bez performance hit", body: "Tradiční YouTube embed přidává 800 KB JavaScriptu. S naším lazy-load bloku se YouTube SDK loaduje až po kliknutí na thumbnail. PageSpeed score zůstává 95+." },
      { title: "Hotové bloky pro top služby", body: "Calendly (booking), YouTube, Vimeo, Spotify, Soundcloud, Instagram, TikTok, Twitter, Typeform, Tally, Loom, Mailchimp signup, Stripe payment link. Drag, drop, paste link, hotovo." },
      { title: "Cookie consent compliance", body: "YouTube embed nastavuje cookies. Pokud klient odmítl marketing cookies v banneru, embed se nezobrazí (nebo se zobrazí placeholder s 'Souhlasit a zobrazit'). GDPR-safe." },
    ],
    useCases: ["Hotel s embedded TripAdvisor reviews", "Lektor s Calendly bookingem", "Marketing landing s Typeform kvízem", "Web s Spotify playlistem v hero"],
    faq: [
      { q: "Mohu přidat vlastní HTML/JS?", a: "Ano, custom embed blok s sandboxed iframe. Pro pokročilé use cases." },
      { q: "Embed počítá do PageSpeed?", a: "Lazy-load + dynamic import = embed se nestihne načíst před LCP. Bez negativního dopadu." },
      { q: "Funguje s GDPR consent?", a: "Embed čeká na consent. Bez souhlasu zobrazí placeholder + výzvu k souhlasu." },
    ],
    related: ["integrace-zapier", "media-knihovna", "cookie-banner"],
  },
  {
    slug: "dashboard-statistiky",
    category: "Marketing",
    title: "Statistický dashboard",
    tagline: "Vidíte, co funguje. V jednom pohledu.",
    perex: "Native dashboard v adminu — návštěvnost, top stránky, konverze, revenue, lead source. Bez nutnosti otevírat GA4.",
    image: "/modules/dashboard-statistiky.jpg",
    imageAlt: "Statistický dashboard s grafy",
    bullets: [
      "Real-time návštěvnost",
      "Top stránky a referrers",
      "Konverzní funnel",
      "Revenue per den/týden/měsíc",
      "Lead source attribution",
      "Custom date ranges",
    ],
    sections: [
      { title: "Stats kde je potřebujete", body: "Otevřete admin → vidíte. Ne otevřete admin → klik na statistiky → loading → otevřete GA4 → další loading → zorientujete se. Klíčové metriky přímo v adminu, GA4 jako doplněk pro deep dive." },
      { title: "Konverzní funnel", body: "Návštěvník → produktová stránka → košík → checkout → zaplaceno. Vidíte, kde lidé padají. 60 % opouští na checkoutu? Zkontrolujte UX. 80 % opouští v košíku? Zvažte free shipping." },
      { title: "Attribution per lead source", body: "Konkrétní inzerát na Facebooku přivedl 14 leadů s průměrnou hodnotou 12 000 Kč. Konkrétní organic landing 8 leadů po 18 000 Kč. Víte, kam dále investovat marketing rozpočet." },
    ],
    useCases: ["E-shop sledující revenue daily", "B2B sledující lead source", "Blog sledující top články", "Marketing manager s reportingem"],
    faq: [
      { q: "Nahradí to GA4?", a: "Pro 70 % use case ano. Pro deep custom analytics GA4 stále lepší. Máme oba — vy si vyberete." },
      { q: "Real-time znamená opravdu real-time?", a: "Latence pod 30 sekund. Vidíte návštěvníky 'aktuálně na webu'." },
      { q: "Export dat do PDF?", a: "Ano, automated PDF reporty týdně/měsíčně e-mailem (pro klienty agentur ideální)." },
    ],
    related: ["analytika-konverze", "seo-viditelnost", "formulare-leady"],
  },
  {
    slug: "ab-testovani",
    category: "Marketing",
    title: "A/B testování",
    tagline: "Otestujte. Vyhrajte. Bez programátora.",
    perex: "Vytvořte dvě varianty stránky, rozdělte traffic, sledujte konverze. Webero rozhodne, která verze vyhrála.",
    image: "/modules/ab-testovani.jpg",
    imageAlt: "A/B test varianta A vs B se statistikou",
    bullets: [
      "Split traffic 50/50, 80/20, custom",
      "Konverze jako primary metric",
      "Statistická signifikance",
      "Auto-winner s redirect 100 %",
      "Multi-variant (A/B/C/D)",
      "Per-segment testy (mobile vs desktop)",
    ],
    sections: [
      { title: "A/B bez 3rd party tools", body: "Optimizely, VWO — drahé enterprise nástroje. S Weberem A/B testing native v editoru. Klonujte stránku, upravte variantu B, spusťte test. Zdarma." },
      { title: "Statistická signifikance, ne náhoda", body: "Sledujeme p-hodnotu testu. Test neukončíme předčasně, dokud výsledek není statisticky významný (p &lt; 0.05). Žádné false positives, žádné rozhodnutí na základě 12 návštěv." },
      { title: "Auto-winner = 100 % traffic", body: "Test ukončen, varianta B vyhrála o 23 % konverzí. Webero automaticky odkloní 100 % traffic na B. Vy spíte, web vydělává víc. Variantu A archivujeme pro reference." },
    ],
    useCases: ["E-shop testující CTA color", "Landing testující headlines", "Form variabilita pro lead gen", "Pricing page conversion test"],
    faq: [
      { q: "Kolik testů paralelně?", a: "Neomezeně, ale doporučujeme max 3 souběžné na jeden page (jinak se výsledky overlapnou)." },
      { q: "Funguje to s GA4?", a: "Ano, A/B varianta se posílá jako custom dimension do GA4 pro deep analytics." },
      { q: "Test trvá jak dlouho?", a: "Záleží na traffic. Pro 1000 návštěv/den obvykle 7–14 dní pro signifikanci." },
    ],
    related: ["analytika-konverze", "formulare-leady", "live-editor"],
  },
  {
    slug: "podpora-cesky",
    category: "Tým",
    title: "Česká podpora",
    tagline: "Reálný člověk. 7 dní v týdnu. Lidsky.",
    perex: "Podpora v češtině, e-mail a chat. Response time průměrně do 1 hodiny v pracovní době, do 4 hodin o víkendu.",
    image: "/modules/podpora-cesky.jpg",
    imageAlt: "Chat okno s česky odpovídajícím agentem",
    bullets: [
      "Pracovní dny 8–20, víkendy 10–18",
      "Response do 1h v pracovní době",
      "E-mail + chat + telefon (pro premium)",
      "Onboarding session zdarma",
      "Video screen-share session na vyžádání",
      "Knowledge base + video návody",
    ],
    sections: [
      { title: "Lidi, ne chatboti", body: "Většina SaaS support: chatbot s předdefinovanými odpověďmi, escalation do supportu, který odpoví za 48h. U nás: napíšete, do hodiny dostanete odpověď od reálného člena našeho týmu, který zná Webero a váš use case." },
      { title: "Onboarding session pro start", body: "Nový klient dostane zdarma 30minutovou onboarding session přes Google Meet. Provedeme vás editorem, ukážeme klíčové funkce pro váš obor, odpovíme na otázky. Saves hours of trial-and-error." },
      { title: "Screen-share pro složité případy", body: "Pokud nestačí e-mail nebo chat, naskočíme do video hovoru se screen-sharingem. Vidíme přesně, kde se zaseknete, opravíme to spolu. Pro premium plán neomezeně, pro standard 1× měsíčně." },
    ],
    useCases: ["První spuštění webu", "Migrace ze starého řešení", "Nečekaný problém s checkoutem", "Pomoc s integrací do CRM"],
    faq: [
      { q: "Máte support v angličtině?", a: "Ano, pro zahraniční klienty EN + DE. Pro CZ trh primárně česky." },
      { q: "Co když mám problém v sobotu večer?", a: "Víkendy 10–18 reagujeme. Mimo to e-mail s odpovědí ráno v pondělí." },
      { q: "Telefonní podpora pro standard plán?", a: "E-mail a chat, telefon pro premium. Většina dotazů ale e-mail / chat lépe pokryje." },
    ],
    related: ["zabezpeceni-gdpr", "domena-hosting", "tym-role"],
  },
);

export const MODULE_CATEGORIES = Array.from(new Set(MODULES.map((m) => m.category)));
