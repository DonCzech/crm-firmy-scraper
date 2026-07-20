/**
 * Seed produktového katalogu pro eshop-20-v2 (Vykuk — veselá móda, Dedoles DNA).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Demo data: vlastní značka Vykuk, vlastní názvy designů (žádné originály z dedoles.cz),
 * ceny ±15–30 % od zadání. Velikostní varianty (Velikost) — ponožky 35–46, prádlo XS–XL,
 * obuv 36–45, děti 23–34. flags.featured = Nejoblíbenější, flags.new = Novinky,
 * flags.summer = Letní kolekce; compare → letni-vyprodej.
 * POZOR: motivy Unsplash fotek NUTNO OVĚŘIT kontaktním přehledem před produktovými sekcemi.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-20-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-20-v2";

const U = (id, w = 800, h = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;

// Motivy OVĚŘENY kontaktním přehledem 2026-07-17 (scratchpad/dedoles/contact*)
const IMG = {
  socksColor: U("photo-1586350977771-b3b0abd50c82"),   // veselé ponožky s pusinkami na nohou ✓
  socksFlat: U("photo-1582966772680-860e372bb558"),    // pár vzorovaných ponožek flatlay ✓
  socksPair: U("photo-1586350977771-b3b0abd50c82"),    // = socksColor (variety TODO)
  socksCozy: U("photo-1611911813383-67769b37a149"),    // pletený úplet closeup ✓
  sneakerRed: U("photo-1560769629-975ec94e6a86"),      // barevné tenisky na podstavci, bez loga ✓
  sneakerWhite: U("photo-1560769629-975ec94e6a86"),    // = sneakerRed ✓
  slippers: U("photo-1603487742131-4160ec999306"),     // korkové pantofle ✓
  sandals: U("photo-1519046904884-53103b34b206"),      // pláž s palmou ✓
  palms: U("photo-1520454974749-611b7248ffdb"),        // palmy proti nebi ✓
  sea: U("photo-1505118380757-91f5f5632de0"),          // moře shora tyrkys ✓
  pool: U("photo-1576013551627-0cc20b96c2a7"),         // zahradní bazén ✓
  swim: U("photo-1507525428034-b723cf961d3e"),         // pláž západ slunce ✓
  kids: U("photo-1503454537195-1dcabb73ffb9"),         // holčička ✓
  kids2: U("photo-1476234251651-f353703a034d"),        // děti venku ✓
  dog: U("photo-1583511655857-d19b40a7a54e"),          // buldoček ve svetru ✓
  backpack: U("photo-1553062407-98eeb64c6a62"),        // batoh ✓
  beanie: U("photo-1510598969022-c4c6c5d05769"),       // zelená pletená čepice ✓
  gift: U("photo-1549465220-1a8b9238cd48"),            // růžový dárek ✓
  pajamas: U("photo-1631049307264-da0ec9d70304"),      // postel ✓
  underwear: U("photo-1523381210434-271e8be1f52b"),    // trička na ramínkách ✓
  cozyFlat: U("photo-1556905055-8f358a7a47b2"),        // útulný flatlay ✓
  whiteSweat: U("photo-1620799140408-edc6dcb6d633"),   // bílá mikina flatlay ✓
};

const CATEGORIES = [
  { slug: "letni-vyprodej", name: "Letní výprodej", sort: 90, desc: "Slevy až −70 % na veselé kousky — jen dokud jsou skladem.", img: IMG.swim },
  { slug: "novinky", name: "Novinky", sort: 91, desc: "Čerstvé přírůstky do veselého šatníku Vykuk.", img: IMG.sneakerRed },
  { slug: "outlet", name: "Outlet", sort: 92, desc: "Poslední kusy za nejlepší ceny.", img: IMG.socksFlat },
  { slug: "letni-kolekce", name: "Letní kolekce", sort: 93, desc: "Melouny, plavky a žabky — všechno, co potřebuješ k vodě.", img: IMG.palms },
  { slug: "darky", name: "Pomocník s dárky", sort: 94, desc: "Veselé dárky, které potěší do minuty.", img: IMG.gift },

  { slug: "ponozky", name: "Ponožky", sort: 1, desc: "Veselé, sportovní i teplé ponožky s originálním designem navrženým u nás.", img: IMG.socksColor },
  { slug: "vesele-ponozky", name: "Veselé ponožky", sort: 0, parent: "ponozky", img: IMG.socksColor },
  { slug: "sportovni-ponozky", name: "Sportovní ponožky", sort: 1, parent: "ponozky", img: IMG.sneakerWhite },
  { slug: "kotnikove-ponozky", name: "Kotníkové ponožky", sort: 2, parent: "ponozky", img: IMG.socksFlat },
  { slug: "nizke-ponozky", name: "Nízké ponožky", sort: 3, parent: "ponozky", img: IMG.sneakerWhite },
  { slug: "teple-ponozky", name: "Teplé ponožky", sort: 4, parent: "ponozky", img: IMG.socksCozy },
  { slug: "detske-ponozky", name: "Dětské ponožky", sort: 5, parent: "ponozky", img: IMG.kids },

  { slug: "spodni-pradlo", name: "Spodní prádlo", sort: 2, desc: "Boxerky, trenky, kalhotky a pyžama, které vyjádří tvoje pravé já.", img: IMG.underwear },
  { slug: "panske-boxerky", name: "Pánské boxerky", sort: 0, parent: "spodni-pradlo", img: IMG.underwear },
  { slug: "panske-trenky", name: "Pánské trenky", sort: 1, parent: "spodni-pradlo", img: IMG.underwear },
  { slug: "damske-kalhotky", name: "Dámské kalhotky", sort: 2, parent: "spodni-pradlo", img: IMG.cozyFlat },
  { slug: "podprsenky", name: "Podprsenky", sort: 3, parent: "spodni-pradlo", img: IMG.cozyFlat },
  { slug: "chlapecke-boxerky", name: "Chlapecké boxerky", sort: 4, parent: "spodni-pradlo", img: IMG.kids },
  { slug: "divci-kalhotky", name: "Dívčí kalhotky", sort: 5, parent: "spodni-pradlo", img: IMG.kids2 },

  { slug: "obuv", name: "Obuv", sort: 3, desc: "Veselé pantofle, žabky, tenisky a papuče pro celou rodinu.", img: IMG.slippers },
  { slug: "pantofle", name: "Veselé pantofle", sort: 0, parent: "obuv", img: IMG.slippers },
  { slug: "zabky", name: "Žabky", sort: 1, parent: "obuv", img: IMG.sandals },
  { slug: "tenisky", name: "Tenisky", sort: 2, parent: "obuv", img: IMG.sneakerRed },
  { slug: "papuce", name: "Papuče", sort: 3, parent: "obuv", img: IMG.socksCozy },

  { slug: "plavky", name: "Plavky", sort: 4, desc: "Plavky a plavkové šortky s veselými motivy k vodě i na pláž.", img: IMG.pool },
  { slug: "damske-plavky", name: "Dámské plavky", sort: 0, parent: "plavky", img: IMG.pool },
  { slug: "panske-plavky", name: "Pánské plavky", sort: 1, parent: "plavky", img: IMG.sea },
  { slug: "detske-plavky", name: "Dětské plavky", sort: 2, parent: "plavky", img: IMG.kids2 },

  { slug: "pyzama", name: "Pyžama", sort: 5, desc: "Pohodlná pyžama pro veselé sny malých i velkých.", img: IMG.pajamas },
  { slug: "damska-pyzama", name: "Dámská pyžama", sort: 0, parent: "pyzama", img: IMG.pajamas },
  { slug: "panska-pyzama", name: "Pánská pyžama", sort: 1, parent: "pyzama", img: IMG.whiteSweat },
  { slug: "detska-pyzama", name: "Dětská pyžama", sort: 2, parent: "pyzama", img: IMG.kids2 },

  { slug: "doplnky", name: "Doplňky", sort: 6, desc: "Čepice, batohy a veselé maličkosti — i pro psí parťáky.", img: IMG.backpack },

  { slug: "doplnkove-sluzby", name: "Doplňkové služby", sort: 99, hidden: true },
  { slug: "cepice-a-celenky", name: "Čepice a čelenky", sort: 0, parent: "doplnky", img: IMG.beanie },
  { slug: "batohy-a-tasky", name: "Batohy a tašky", sort: 1, parent: "doplnky", img: IMG.backpack },
  { slug: "doplnky-pro-psy", name: "Doplňky pro psy", sort: 2, parent: "doplnky", img: IMG.dog },
  { slug: "darkove-baleni", name: "Dárkové balení", sort: 3, parent: "doplnky", img: IMG.gift },
];

// Velikostní sady
const SIZES = {
  sock: ["35–38", "39–42", "43–46"],
  kidsSock: ["23–26", "27–30", "31–34"],
  men: ["S", "M", "L", "XL"],
  women: ["XS", "S", "M", "L"],
  kids: ["110–116", "122–128", "134–140"],
  shoe: ["36–37", "38–39", "40–41", "42–43", "44–45"],
  uni: ["Uni"],
};

// price v haléřích; sub = materiál / typ; featured = Nejoblíbenější, new = Novinky, summer = Letní kolekce
const PRODUCTS = [
  // ── Veselé ponožky ──
  { slug: "vesele-ponozky-melounova-parada", title: "Veselé ponožky Melounová paráda", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, compare: 24900, stock: 240, flags: { featured: true, summer: true }, img: IMG.socksColor },
  { slug: "vesele-ponozky-kosmicky-vylet", title: "Veselé ponožky Kosmický výlet", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, compare: 24900, stock: 310, flags: { featured: true }, img: IMG.socksFlat },
  { slug: "vesele-ponozky-avokadova-laska", title: "Veselé ponožky Avokádová láska", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 190, flags: { featured: true }, img: IMG.socksPair },
  { slug: "vesele-ponozky-flamingo-tanec", title: "Veselé ponožky Plameňákový tanec", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 150, flags: { new: true, summer: true }, img: IMG.socksColor },
  { slug: "vesele-ponozky-kaktusove-objeti", title: "Veselé ponožky Kaktusové objetí", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 16900, compare: 21900, stock: 130, img: IMG.socksFlat },
  { slug: "vesele-ponozky-sushi-parta", title: "Veselé ponožky Sushi parta", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 220, img: IMG.socksPair },
  { slug: "vesele-ponozky-lenochodi-nedele", title: "Veselé ponožky Lenochodí neděle", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, compare: 24900, stock: 175, flags: { featured: true }, img: IMG.socksCozy },
  { slug: "vesele-ponozky-vceli-louka", title: "Veselé ponožky Včelí louka", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 145, flags: { new: true, summer: true }, img: IMG.socksColor },
  { slug: "vesele-ponozky-duhove-vlnky", title: "Veselé ponožky Duhové vlnky", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 16900, compare: 19900, stock: 260, img: IMG.socksFlat },
  { slug: "vesele-ponozky-kavova-pauza", title: "Veselé ponožky Kávová pauza", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 205, img: IMG.socksCozy },
  { slug: "vesele-ponozky-kocici-tlapky", title: "Veselé ponožky Kočičí tlapky", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 280, flags: { featured: true }, img: IMG.socksPair },
  { slug: "vesele-ponozky-psi-radost", title: "Veselé ponožky Psí radost", sub: "vysoké • česaná bavlna", cat: "vesele-ponozky", size: "sock", price: 19900, stock: 165, img: IMG.dog },

  // ── Sportovní ponožky ──
  { slug: "sportovni-ponozky-blesk", title: "Sportovní ponožky Blesk", sub: "funkční • froté chodidlo", cat: "sportovni-ponozky", size: "sock", price: 22900, compare: 27900, stock: 140, flags: { featured: true }, img: IMG.sneakerRed },
  { slug: "sportovni-ponozky-marathon-duha", title: "Sportovní ponožky Maraton Duha", sub: "funkční • froté chodidlo", cat: "sportovni-ponozky", size: "sock", price: 22900, stock: 120, img: IMG.sneakerWhite },
  { slug: "sportovni-lytkove-neon", title: "Sportovní lýtkové ponožky Neon", sub: "lýtkové • kompresní zóna", cat: "sportovni-ponozky", size: "sock", price: 24900, stock: 95, flags: { new: true }, img: IMG.socksColor },

  // ── Kotníkové / nízké / teplé / dětské ponožky ──
  { slug: "kotnikove-ponozky-jahudky", title: "Kotníkové ponožky Jahůdky", sub: "kotníkové • česaná bavlna", cat: "kotnikove-ponozky", size: "sock", price: 14900, compare: 17900, stock: 230, flags: { summer: true }, img: IMG.socksFlat },
  { slug: "kotnikove-ponozky-citronada", title: "Kotníkové ponožky Citronáda", sub: "kotníkové • česaná bavlna", cat: "kotnikove-ponozky", size: "sock", price: 14900, stock: 180, flags: { new: true, summer: true }, img: IMG.socksPair },
  { slug: "kotnikove-ponozky-panda", title: "Kotníkové ponožky Panda", sub: "kotníkové • česaná bavlna", cat: "kotnikove-ponozky", size: "sock", price: 14900, stock: 155, img: IMG.socksColor },
  { slug: "nizke-ponozky-melounek", title: "Nízké ponožky Melounek", sub: "nízké • neviditelné v tenisce", cat: "nizke-ponozky", size: "sock", price: 12900, stock: 320, flags: { summer: true }, img: IMG.sneakerWhite },
  { slug: "nizke-ponozky-bublinky", title: "Nízké ponožky Bublinky", sub: "nízké • neviditelné v tenisce", cat: "nizke-ponozky", size: "sock", price: 12900, compare: 15900, stock: 275, img: IMG.socksFlat },
  { slug: "teple-ponozky-horske-rano", title: "Teplé ponožky Horské ráno", sub: "vlněné • zesílené chodidlo", cat: "teple-ponozky", size: "sock", price: 26900, stock: 90, img: IMG.socksCozy },
  { slug: "teple-ponozky-sobi-vyprava", title: "Teplé ponožky Sobí výprava", sub: "vlněné • zesílené chodidlo", cat: "teple-ponozky", size: "sock", price: 26900, compare: 32900, stock: 70, img: IMG.socksCozy },
  { slug: "detske-ponozky-dino-parta", title: "Dětské ponožky Dino parta", sub: "dětské • česaná bavlna", cat: "detske-ponozky", size: "kidsSock", price: 12900, stock: 210, flags: { featured: true }, img: IMG.kids },
  { slug: "detske-ponozky-jednorozec", title: "Dětské ponožky Jednorožec", sub: "dětské • česaná bavlna", cat: "detske-ponozky", size: "kidsSock", price: 12900, stock: 185, flags: { new: true }, img: IMG.kids2 },

  // ── Pánské boxerky / trenky ──
  { slug: "panske-boxerky-planetarium", title: "Veselé pánské boxerky Planetárium", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 24900, compare: 32900, stock: 260, flags: { featured: true }, img: IMG.underwear },
  { slug: "panske-boxerky-fotbalovy-vecer", title: "Veselé pánské boxerky Fotbalový večer", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 24900, compare: 32900, stock: 240, img: IMG.underwear },
  { slug: "panske-boxerky-pivni-lednice", title: "Veselé pánské boxerky Pivní lednice", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 24900, compare: 32900, stock: 195, flags: { featured: true }, img: IMG.underwear },
  { slug: "panske-boxerky-avokado-amore", title: "Veselé pánské boxerky Avokádo amore", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 27900, stock: 160, img: IMG.underwear },
  { slug: "panske-boxerky-cyklovylet", title: "Veselé pánské boxerky Cyklovýlet", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 24900, compare: 32900, stock: 175, flags: { new: true }, img: IMG.underwear },
  { slug: "panske-boxerky-grilovacka", title: "Veselé pánské boxerky Grilovačka", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 24900, stock: 150, flags: { new: true, summer: true }, img: IMG.underwear },
  { slug: "panske-boxerky-klasik-cerne", title: "Černé pánské boxerky Klasik", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 26900, stock: 340, img: IMG.underwear },
  { slug: "panske-boxerky-kacenky", title: "Veselé pánské boxerky Kačenky", sub: "bavlna s elastanem • pružný pas", cat: "panske-boxerky", size: "men", price: 27900, compare: 32900, stock: 130, img: IMG.underwear },
  { slug: "panske-trenky-melounove", title: "Pánské trenky Melounové osvěžení", sub: "volný střih • 100% bavlna", cat: "panske-trenky", size: "men", price: 22900, stock: 145, flags: { summer: true }, img: IMG.underwear },
  { slug: "panske-trenky-kotvicky", title: "Pánské trenky Kotvičky", sub: "volný střih • 100% bavlna", cat: "panske-trenky", size: "men", price: 22900, stock: 120, flags: { new: true }, img: IMG.underwear },

  // ── Dámské prádlo ──
  { slug: "damske-kalhotky-lucni-kviti", title: "Dámské kalhotky Luční kvítí", sub: "bavlna s elastanem • klasický střih", cat: "damske-kalhotky", size: "women", price: 17900, stock: 280, flags: { featured: true }, img: IMG.underwear },
  { slug: "damske-kalhotky-levandule", title: "Dámské kalhotky Levandulový sen", sub: "bavlna s elastanem • klasický střih", cat: "damske-kalhotky", size: "women", price: 17900, compare: 21900, stock: 235, img: IMG.underwear },
  { slug: "bralette-lucni-kviti", title: "Bralette podprsenka Luční kvítí", sub: "bez kostic • nastavitelná ramínka", cat: "podprsenky", size: "women", price: 44900, stock: 110, flags: { new: true }, img: IMG.cozyFlat },
  { slug: "chlapecke-boxerky-bagry", title: "Chlapecké boxerky Bagry", sub: "dětské • 100% bavlna", cat: "chlapecke-boxerky", size: "kids", price: 16900, stock: 170, flags: { featured: true }, img: IMG.kids },
  { slug: "divci-kalhotky-duha", title: "Dívčí kalhotky Duha", sub: "dětské • 100% bavlna", cat: "divci-kalhotky", size: "kids", price: 14900, stock: 190, img: IMG.kids },

  // ── Pyžama ──
  { slug: "damske-pyzamo-spici-kocky", title: "Dámské pyžamo Spící kočky", sub: "dlouhé • jemný úplet", cat: "damska-pyzama", size: "women", price: 64900, compare: 79900, stock: 85, img: IMG.pajamas },
  { slug: "panske-pyzamo-horsky-tabor", title: "Pánské pyžamo Horský tábor", sub: "dlouhé • jemný úplet", cat: "panska-pyzama", size: "men", price: 64900, stock: 75, img: IMG.whiteSweat },
  { slug: "detske-pyzamo-dino-parta", title: "Dětské pyžamo Dino parta", sub: "dlouhé • 100% bavlna", cat: "detska-pyzama", size: "kids", price: 54900, stock: 105, flags: { new: true }, img: IMG.kids2 },

  // ── Obuv ──
  { slug: "vesele-pantofle-jahudky", title: "Veselé pantofle Jahůdky", sub: "pěnové • protiskluzová podrážka", cat: "pantofle", size: "shoe", price: 36900, compare: 55900, stock: 210, flags: { featured: true, summer: true }, img: IMG.slippers },
  { slug: "vesele-pantofle-kotatko", title: "Veselé pantofle Koťátko", sub: "pěnové • protiskluzová podrážka", cat: "pantofle", size: "shoe", price: 36900, compare: 55900, stock: 185, flags: { featured: true }, img: IMG.slippers },
  { slug: "vesele-pantofle-musle", title: "Veselé pantofle Mušle", sub: "pěnové • protiskluzová podrážka", cat: "pantofle", size: "shoe", price: 36900, compare: 55900, stock: 160, flags: { summer: true }, img: IMG.palms },
  { slug: "vesele-pantofle-morska-vlna", title: "Veselé pantofle Mořská vlna", sub: "pěnové • protiskluzová podrážka", cat: "pantofle", size: "shoe", price: 36900, compare: 55900, stock: 175, img: IMG.sea },
  { slug: "vesele-pantofle-sedmikrasky", title: "Veselé pantofle Sedmikrásky", sub: "pěnové • protiskluzová podrážka", cat: "pantofle", size: "shoe", price: 44900, compare: 55900, stock: 140, flags: { summer: true }, img: IMG.slippers },
  { slug: "vesele-pantofle-tresnovy-sad", title: "Veselé pantofle Třešňový sad", sub: "pěnové • protiskluzová podrážka", cat: "pantofle", size: "shoe", price: 44900, compare: 55900, stock: 125, img: IMG.slippers },
  { slug: "zabky-melounove", title: "Žabky Melounové léto", sub: "lehké • odolný pásek", cat: "zabky", size: "shoe", price: 29900, stock: 230, flags: { new: true, summer: true }, img: IMG.sandals },
  { slug: "tenisky-duhovka", title: "Tenisky Duhovka", sub: "plátěné • gumová špička", cat: "tenisky", size: "shoe", price: 89900, stock: 65, flags: { new: true }, img: IMG.sneakerRed },
  { slug: "papuce-medvidek", title: "Papuče Medvídek", sub: "hřejivé • pevná pata", cat: "papuce", size: "shoe", price: 39900, stock: 95, img: IMG.slippers },

  // ── Plavky ──
  { slug: "panske-plavkove-sortky-palmy", title: "Pánské plavkové šortky Palmy", sub: "rychleschnoucí • síťovaná vložka", cat: "panske-plavky", size: "men", price: 55900, compare: 74900, stock: 130, flags: { featured: true, summer: true }, img: IMG.palms },
  { slug: "panske-plavkove-sortky-noc", title: "Tmavě modré pánské plavkové šortky", sub: "rychleschnoucí • síťovaná vložka", cat: "panske-plavky", size: "men", price: 46900, compare: 74900, stock: 115, flags: { summer: true }, img: IMG.sea },
  { slug: "damske-plavky-slunecnice", title: "Dámské plavky Slunečnice", sub: "jednodílné • UV ochrana", cat: "damske-plavky", size: "women", price: 69900, stock: 90, flags: { new: true, summer: true }, img: IMG.pool },
  { slug: "damske-plavkove-kalhotky-zlute", title: "Zlatožluté plavkové kalhotky", sub: "zavazovací • rychleschnoucí", cat: "damske-plavky", size: "women", price: 20900, compare: 37900, stock: 150, flags: { summer: true }, img: IMG.swim },
  { slug: "detske-plavky-vcelka", title: "Dětské plavky Včelka", sub: "jednodílné • UV ochrana", cat: "detske-plavky", size: "kids", price: 55900, stock: 80, flags: { summer: true }, img: IMG.kids2 },

  // ── Doplňky ──
  { slug: "cepice-pletena-lisak", title: "Pletená čepice Lišák", sub: "pletená • fleecová podšívka", cat: "cepice-a-celenky", size: "uni", price: 34900, stock: 75, img: IMG.beanie },
  { slug: "batoh-vykukuv-vylet", title: "Batoh Vykukův výlet", sub: "20 l • voděodolný", cat: "batohy-a-tasky", size: "uni", price: 79900, stock: 55, flags: { new: true }, img: IMG.backpack },
  { slug: "satek-pro-psy-kosticky", title: "Šátek pro psy Kostičky", sub: "zavazovací • pratelný", cat: "doplnky-pro-psy", size: "uni", price: 24900, stock: 120, flags: { new: true }, img: IMG.dog },
  { slug: "darkova-krabicka-vykuk", title: "Dárková krabička Vykuk", sub: "recyklovaný karton • mašle", cat: "darkove-baleni", size: "uni", price: 9900, stock: 400, img: IMG.gift },

  // ── Doplňkové služby košíku (skrytá kategorie, slug prefix sluzba-) ──
  { slug: "sluzba-prioritni-vychystani", title: "Prioritní vychystání objednávky", sub: "objednávka jde ve frontě první", cat: "doplnkove-sluzby", size: "uni", price: 5900, stock: 9999, img: IMG.gift },
  { slug: "sluzba-eko-baleni", title: "Drobné pro ekologické balení", sub: "recyklovaný a kompostovatelný obal", cat: "doplnkove-sluzby", size: "uni", price: 2900, stock: 9999, img: IMG.gift },
  { slug: "sluzba-bezpecne-doruceni", title: "Bezpečné doručení", sub: "pojištění zásilky proti poškození", cat: "doplnkove-sluzby", size: "uni", price: 1900, stock: 9999, img: IMG.gift },
];

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  const tRes = await client.query("SELECT id FROM tenants WHERE slug = $1", [TENANT_SLUG]);
  if (!tRes.rows.length) throw new Error(`Tenant ${TENANT_SLUG} not found`);
  const tenantId = tRes.rows[0].id;

  await client.query("BEGIN");
  for (const tbl of ["stock_movements", "product_images", "product_category_links", "product_variants", "products", "product_categories"]) {
    await client.query(`DELETE FROM ${tbl} WHERE tenant_id = $1`, [tenantId]);
  }

  const catIds = new Map();
  for (const cat of CATEGORIES.filter(x => !x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, !cat.hidden, cat.img ?? null]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }
  for (const cat of CATEGORIES.filter(x => x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id, image_url)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent), cat.img ?? null]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }

  const link = async (pid, slug) => {
    if (!catIds.has(slug)) return;
    await client.query(
      `INSERT INTO product_category_links (tenant_id, product_id, category_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [tenantId, pid, catIds.get(slug)]
    );
  };

  let pc = 0, vc = 0;
  for (const p of PRODUCTS) {
    const sizes = SIZES[p.size] ?? SIZES.uni;
    const desc = `${p.title} (${p.sub}). Originální design navržený u nás — demo kolekce Vykuk. Vrácení až do 100 dnů, doprava zdarma nad 999 Kč. Dotazy rádi zodpovíme na email@demo.cz.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,'Vykuk','active',$6,$7,$8) RETURNING id`,
      [tenantId, p.slug, p.title, p.sub, desc, catIds.get(p.cat),
       JSON.stringify([{ name: "Velikost", values: sizes }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (p.flags?.new) await link(pid, "novinky");
    if (p.flags?.summer) await link(pid, "letni-kolekce");
    if (p.compare) { await link(pid, "letni-vyprodej"); await link(pid, "outlet"); }
    if (p.cat === "darkove-baleni" || p.flags?.featured) await link(pid, "darky");

    await client.query(
      `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,0)`,
      [tenantId, pid, p.img, p.title]
    );

    const perSize = Math.max(5, Math.round(p.stock / sizes.length));
    const defaultIdx = Math.floor((sizes.length - 1) / 2);
    for (let i = 0; i < sizes.length; i++) {
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase().slice(0, 36)}-${i}`, sizes[i],
         JSON.stringify({ "Velikost": sizes[i] }), p.price, p.compare ?? null, perSize, i === defaultIdx, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-20 seed')`,
        [tenantId, vr.rows[0].id, perSize, perSize]
      );
    }
  }

  await client.query("COMMIT");
  console.log(`✅ ${TENANT_SLUG}: ${catIds.size} kategorií, ${pc} produktů, ${vc} variant`);
} catch (e) {
  await client.query("ROLLBACK");
  console.error("❌", e.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
