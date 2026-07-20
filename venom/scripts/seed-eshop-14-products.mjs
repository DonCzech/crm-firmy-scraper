/**
 * Seed produktového katalogu pro eshop-14-v2 (Zahradia — zahrada, bazény, wellness).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Fotky bere z ověřeného stromu v src/templates/eshop-14/content/cs.json.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-14-products.mjs
 */
import pg from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const TENANT_SLUG = "eshop-14-v2";
const __dirname = dirname(fileURLToPath(import.meta.url));
const cs = JSON.parse(readFileSync(join(__dirname, "..", "src", "templates", "eshop-14", "content", "cs.json"), "utf8"));

// slug -> ověřená fotka z mega menu
const IMG = {};
for (const cat of cs.navbar.categories) for (const ch of cat.children ?? []) IMG[ch.slug] = ch.image;
const pic = (slug, w = 900, h = 900) => (IMG[slug] ?? "").replace(/w=\d+&h=\d+/, `w=${w}&h=${h}`);

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 0, desc: "Čerstvě naskladněné novinky pro zahradu, bazén i dílnu." },
  { slug: "akce", name: "Akce", sort: 89, desc: "Zvýhodněné ceny — jen dokud jsou skladem." },

  { slug: "bazeny-hlavni", name: "Bazény", sort: 1, desc: "Nadzemní i zapuštěné bazény pro každou zahradu. Poradíme s výběrem, instalací i zazimováním." },
  { slug: "bazeny", name: "Nadzemní bazény", sort: 0, parent: "bazeny-hlavni" },
  { slug: "luxusni-zapustene-bazeny", name: "Luxusní zapuštěné bazény", sort: 1, parent: "bazeny-hlavni" },
  { slug: "bazenove-folie", name: "Bazénové folie", sort: 2, parent: "bazeny-hlavni" },
  { slug: "bazenove-schudky", name: "Bazénové schůdky", sort: 3, parent: "bazeny-hlavni" },
  { slug: "zastreseni-a-zakryti", name: "Zastřešení a zakrytí", sort: 4, parent: "bazeny-hlavni" },
  { slug: "ohrev-bazenu", name: "Ohřev bazénů", sort: 5, parent: "bazeny-hlavni" },
  { slug: "protiproudy", name: "Protiproudy", sort: 6, parent: "bazeny-hlavni" },
  { slug: "hracky-do-vody", name: "Hračky do vody", sort: 7, parent: "bazeny-hlavni" },

  { slug: "bazenova-chemie-hlavni", name: "Bazénová chemie a filtrace", sort: 2, desc: "Křišťálově čistá voda po celou sezónu — chemie, filtrace i robotické vysavače." },
  { slug: "bazenova-chemie", name: "Bazénová chemie", sort: 0, parent: "bazenova-chemie-hlavni" },
  { slug: "bazenove-filtrace", name: "Bazénové filtrace", sort: 1, parent: "bazenova-chemie-hlavni" },
  { slug: "bazenove-vysavace", name: "Bazénové vysavače", sort: 2, parent: "bazenova-chemie-hlavni" },
  { slug: "bazenove-prislusenstvi", name: "Bazénové příslušenství", sort: 3, parent: "bazenova-chemie-hlavni" },
  { slug: "solarni-sprchy", name: "Solární sprchy", sort: 4, parent: "bazenova-chemie-hlavni" },

  { slug: "virivky-hlavni", name: "Vířivky a wellness", sort: 3, desc: "Domácí wellness na terase — vířivky, sauny a ochlazovací kádě." },
  { slug: "virivky", name: "Vířivky", sort: 0, parent: "virivky-hlavni" },
  { slug: "sauny", name: "Sauny", sort: 1, parent: "virivky-hlavni" },
  { slug: "ochlazovaci-kade", name: "Ochlazovací kádě", sort: 2, parent: "virivky-hlavni" },

  { slug: "pro-deti", name: "Hřiště a hračky", sort: 4, desc: "Trampolíny, houpačky a hřiště, u kterých děti zapomenou na tablet." },
  { slug: "trampoliny", name: "Trampolíny", sort: 0, parent: "pro-deti" },
  { slug: "houpacky", name: "Houpačky a hřiště", sort: 1, parent: "pro-deti" },
  { slug: "detske-bazeny", name: "Dětské bazény", sort: 2, parent: "pro-deti" },
  { slug: "piskoviste", name: "Pískoviště a domky", sort: 3, parent: "pro-deti" },

  { slug: "zahrada", name: "Zahrada", sort: 5, desc: "Zahradní technika a vybavení s vlastním servisem a náhradními díly." },
  { slug: "sekacky-na-travu", name: "Sekačky na trávu", sort: 0, parent: "zahrada" },
  { slug: "zahradni-traktory", name: "Zahradní traktory", sort: 1, parent: "zahrada" },
  { slug: "krovinorezy", name: "Křovinořezy a vyžínače", sort: 2, parent: "zahrada" },
  { slug: "retezove-pily", name: "Řetězové pily", sort: 3, parent: "zahrada" },
  { slug: "vertikutatory", name: "Vertikutátory", sort: 4, parent: "zahrada" },
  { slug: "hadice-a-zavlazovani", name: "Hadice a zavlažování", sort: 5, parent: "zahrada" },
  { slug: "zahradni-grily", name: "Zahradní grily", sort: 6, parent: "zahrada" },
  { slug: "zahradni-nabytek", name: "Zahradní nábytek", sort: 7, parent: "zahrada" },
  { slug: "skleniky", name: "Skleníky a fóliovníky", sort: 8, parent: "zahrada" },
  { slug: "zahradni-domky", name: "Zahradní domky", sort: 9, parent: "zahrada" },
  { slug: "rucni-naradi", name: "Ruční nářadí", sort: 10, parent: "zahrada" },
  { slug: "aku-technika", name: "AKU technika", sort: 11, parent: "zahrada" },

  { slug: "dum-a-dilna", name: "Dům a dílna", sort: 6, desc: "Elektrocentrály, čerpadla a nářadí pro kutily i profíky." },
  { slug: "elektrocentraly", name: "Elektrocentrály", sort: 0, parent: "dum-a-dilna" },
  { slug: "cerpadla", name: "Čerpadla", sort: 1, parent: "dum-a-dilna" },
  { slug: "cistici-technika", name: "Vysavače a čisticí technika", sort: 2, parent: "dum-a-dilna" },
  { slug: "elektricke-naradi", name: "Elektrické nářadí", sort: 3, parent: "dum-a-dilna" },
  { slug: "zebriky", name: "Žebříky a schůdky", sort: 4, parent: "dum-a-dilna" },
  { slug: "dilensky-nabytek", name: "Dílenský nábytek", sort: 5, parent: "dum-a-dilna" },

  { slug: "chovatelske-potreby", name: "Chovatelské potřeby", sort: 7, desc: "Vše pro psy, kočky i menší mazlíčky." },
  { slug: "pro-psy", name: "Pro psy", sort: 0, parent: "chovatelske-potreby" },
  { slug: "pro-kocky", name: "Pro kočky", sort: 1, parent: "chovatelske-potreby" },
  { slug: "ptactvo-a-hlodavci", name: "Ptactvo a hlodavci", sort: 2, parent: "chovatelske-potreby" },
  { slug: "boudy-a-pelisky", name: "Boudy a pelíšky", sort: 3, parent: "chovatelske-potreby" },

  { slug: "elektrokola", name: "Elektrokola", sort: 8, desc: "Horská, trekingová i městská elektrokola se servisem do 24 hodin." },
  { slug: "horska-elektrokola", name: "Horská elektrokola", sort: 0, parent: "elektrokola" },
  { slug: "trekingova-elektrokola", name: "Trekingová elektrokola", sort: 1, parent: "elektrokola" },
  { slug: "mestska-elektrokola", name: "Městská elektrokola", sort: 2, parent: "elektrokola" },
  { slug: "elektrokola-prislusenstvi", name: "Baterie a příslušenství", sort: 3, parent: "elektrokola" },
];

const POOL_D = ["Ø 3,05 m", "Ø 3,66 m", "Ø 4,57 m"];
const BIKE_F = ['Rám 17"', 'Rám 19"', 'Rám 21"'];
const TRAMP_D = ["Ø 2,44 m", "Ø 3,05 m", "Ø 3,66 m"];

// price v haléřích
const PRODUCTS = [
  // ── Bazény ──
  { slug: "aqualine-frame-ratan", title: "AquaLine Frame Ratan", subtitle: "Rámový bazén v ratanovém designu s kartušovou filtrací", cat: "bazeny", brand: "AquaLine", price: 599000, compare: 819000, stock: 24, flags: { featured: true }, img: [pic("bazeny")], sizes: POOL_D },
  { slug: "aqualine-steel-classic", title: "AquaLine Steel Classic", subtitle: "Ocelová stěna 0,4 mm, hloubka 1,07 m, včetně skimmeru", cat: "bazeny", brand: "AquaLine", price: 1290000, stock: 9, flags: { featured: true }, img: [pic("bazeny")], sizes: POOL_D },
  { slug: "aqualine-infinity-zapusteny", title: "AquaLine Infinity 6×3 m", subtitle: "Zapuštěný keramický bazén na klíč včetně technologie", cat: "luxusni-zapustene-bazeny", brand: "AquaLine", price: 34900000, stock: 2, img: [pic("luxusni-zapustene-bazeny")], sizes: null },
  { slug: "aqualine-folie-modra", title: "AquaLine náhradní folie modrá", subtitle: "0,45 mm PVC folie s UV stabilizací pro kruhové bazény", cat: "bazenove-folie", brand: "AquaLine", price: 249000, compare: 299000, stock: 31, img: [pic("bazenove-folie")], sizes: POOL_D },
  { slug: "aqualine-schudky-nerez", title: "AquaLine nerezové schůdky", subtitle: "Trojstupňové schůdky s protiskluzem, do hloubky 1,2 m", cat: "bazenove-schudky", brand: "AquaLine", price: 189000, stock: 18, img: [pic("bazenove-schudky")], sizes: null },
  { slug: "aqualine-zastreseni-dome", title: "AquaLine zastřešení Dome", subtitle: "Posuvné obloukové zastřešení z polykarbonátu", cat: "zastreseni-a-zakryti", brand: "AquaLine", price: 6490000, stock: 3, flags: { new: true }, img: [pic("zastreseni-a-zakryti")], sizes: null },
  { slug: "aqualine-tepelne-cerpadlo-5kw", title: "AquaLine tepelné čerpadlo 5 kW", subtitle: "Prodlouží sezónu o dva měsíce, Wi-Fi ovládání", cat: "ohrev-bazenu", brand: "AquaLine", price: 1890000, compare: 2290000, stock: 7, flags: { featured: true }, img: [pic("ohrev-bazenu")], sizes: null },
  { slug: "aqualine-protiproud-jet50", title: "AquaLine protiproud JET 50", subtitle: "Plavání na místě — průtok 50 m³/h, pneumatické ovládání", cat: "protiproudy", brand: "AquaLine", price: 2790000, stock: 4, img: [pic("protiproudy")], sizes: null },
  { slug: "splashy-plamenak", title: "Splashy nafukovací plameňák XXL", subtitle: "Lehátko do vody se stabilními úchyty, 190 cm", cat: "hracky-do-vody", brand: "Splashy", price: 59000, compare: 79000, stock: 56, img: [pic("hracky-do-vody")], sizes: null },
  // ── Chemie a filtrace ──
  { slug: "aqualine-chlor-start-set", title: "AquaLine chlorový startovací set", subtitle: "Vše pro rozjezd sezóny — šok, tablety, pH mínus a tester", cat: "bazenova-chemie", brand: "AquaLine", price: 84900, stock: 42, flags: { featured: true }, img: [pic("bazenova-chemie")], sizes: null },
  { slug: "aqualine-piskova-filtrace-6", title: "AquaLine písková filtrace 6 m³/h", subtitle: "Šesticestný ventil, nádoba na 20 kg písku, tichý chod", cat: "bazenove-filtrace", brand: "AquaLine", price: 429000, compare: 499000, stock: 15, flags: { featured: true }, img: [pic("bazenove-filtrace")], sizes: null },
  { slug: "aqualine-robot-clean-pro", title: "AquaLine robot Clean Pro", subtitle: "Robotický vysavač na dno i stěny, filtrace 2v1", cat: "bazenove-vysavace", brand: "AquaLine", price: 1190000, stock: 8, flags: { new: true, featured: true }, img: [pic("bazenove-vysavace")], sizes: null },
  { slug: "aqualine-sitka-teleskop", title: "AquaLine síťka s teleskopickou tyčí", subtitle: "Hloubková síťka + tyč 1,8–3,6 m, hliník", cat: "bazenove-prislusenstvi", brand: "AquaLine", price: 44900, stock: 60, img: [pic("bazenove-prislusenstvi")], sizes: null },
  { slug: "aqualine-solarni-sprcha-35", title: "AquaLine solární sprcha 35 l", subtitle: "Ohřeje vodu sluncem až na 60 °C, směšovací baterie", cat: "solarni-sprchy", brand: "AquaLine", price: 349000, compare: 419000, stock: 12, img: [pic("solarni-sprchy")], sizes: null },
  // ── Vířivky a wellness ──
  { slug: "relaxo-spa-600", title: "Relaxo Spa 600", subtitle: "Vířivka pro 6 osob, 130 trysek, LED chromoterapie", cat: "virivky", brand: "Relaxo", price: 18900000, compare: 22900000, stock: 3, flags: { featured: true }, img: [pic("virivky")], sizes: null },
  { slug: "relaxo-nafukovaci-spa-4", title: "Relaxo nafukovací vířivka 4 osoby", subtitle: "Postavíte za 20 minut, ohřev do 40 °C, 120 trysek", cat: "virivky", brand: "Relaxo", price: 899000, compare: 1190000, stock: 11, flags: { featured: true }, img: [pic("virivky")], sizes: null },
  { slug: "relaxo-sauna-finska-2", title: "Relaxo finská sauna pro 2", subtitle: "Severský smrk, kamna 6 kW, LED osvětlení, montáž v ceně", cat: "sauny", brand: "Relaxo", price: 7990000, stock: 4, img: [pic("sauny")], sizes: null },
  { slug: "relaxo-kad-ledova", title: "Relaxo ochlazovací káď Nordic", subtitle: "Otužování na zahradě — termoizolační víko, filtrace", cat: "ochlazovaci-kade", brand: "Relaxo", price: 2490000, stock: 6, flags: { new: true }, img: [pic("ochlazovaci-kade")], sizes: null },
  // ── Hřiště a hračky ──
  { slug: "hopsa-trampolina-sit", title: "Hopsa trampolína s ochrannou sítí", subtitle: "Pozinkovaná konstrukce, síť uvnitř pružin, do 150 kg", cat: "trampoliny", brand: "Hopsa", price: 549000, compare: 699000, stock: 19, flags: { featured: true }, img: [pic("trampoliny")], sizes: TRAMP_D },
  { slug: "hopsa-houpackovy-set", title: "Hopsa houpačkový set se skluzavkou", subtitle: "Dvě houpačky, hnízdo a skluzavka na smrkové konstrukci", cat: "houpacky", brand: "Hopsa", price: 899000, stock: 8, img: [pic("houpacky")], sizes: null },
  { slug: "splashy-detsky-bazenek", title: "Splashy dětský bazének s ohradou", subtitle: "Nafukovací dno, stříška proti slunci UV 50+", cat: "detske-bazeny", brand: "Splashy", price: 89000, stock: 34, img: [pic("detske-bazeny")], sizes: null },
  { slug: "hopsa-piskoviste-domecek", title: "Hopsa pískoviště s domečkem", subtitle: "Impregnované dřevo, lavičky a krycí plachta", cat: "piskoviste", brand: "Hopsa", price: 349000, compare: 429000, stock: 13, img: [pic("piskoviste")], sizes: null },
  // ── Zahrada ──
  { slug: "greencut-aku-sekacka-46", title: "GreenCut AKU sekačka 46 cm", subtitle: "Dvě 40V baterie v ceně, mulčování, 65 l koš", cat: "sekacky-na-travu", brand: "GreenCut", price: 1290000, compare: 1490000, stock: 16, flags: { featured: true, new: true }, img: [pic("sekacky-na-travu")], sizes: null },
  { slug: "greencut-benzinova-sekacka-51", title: "GreenCut benzínová sekačka 51 cm", subtitle: "Pojezd s variátorem, centrální nastavení výšky", cat: "sekacky-na-travu", brand: "GreenCut", price: 989000, stock: 22, img: [pic("sekacky-na-travu")], sizes: null },
  { slug: "greencut-traktor-rider-92", title: "GreenCut Rider 92", subtitle: "Zahradní traktor se záběrem 92 cm a košem 240 l", cat: "zahradni-traktory", brand: "GreenCut", price: 8490000, compare: 9290000, stock: 5, flags: { featured: true }, img: [pic("zahradni-traktory")], sizes: null },
  { slug: "greencut-krovinorez-43", title: "GreenCut křovinořez 43 cm³", subtitle: "Popruh, strunová hlava i žací nůž v balení", cat: "krovinorezy", brand: "GreenCut", price: 449000, stock: 21, img: [pic("krovinorezy")], sizes: null },
  { slug: "greencut-retezova-pila-45", title: "GreenCut řetězová pila 45 cm³", subtitle: "Lišta 40 cm, antivibrační systém, snadné startování", cat: "retezove-pily", brand: "GreenCut", price: 549000, compare: 649000, stock: 14, img: [pic("retezove-pily")], sizes: null },
  { slug: "greencut-vertikutator-el", title: "GreenCut elektrický vertikutátor 1800 W", subtitle: "Provzdušnění a mech pryč — záběr 38 cm, koš 45 l", cat: "vertikutatory", brand: "GreenCut", price: 379000, stock: 17, img: [pic("vertikutatory")], sizes: null },
  { slug: "terragarden-zavlazovaci-set", title: "TerraGarden zavlažovací set 25 m", subtitle: "Hadice s rychlospojkami a sedmirežimovou pistolí", cat: "hadice-a-zavlazovani", brand: "TerraGarden", price: 99000, compare: 129000, stock: 48, img: [pic("hadice-a-zavlazovani")], sizes: null },
  { slug: "terragarden-gril-kamado", title: "TerraGarden keramický gril Kamado", subtitle: "Grilování, uzení i pečení — teplota stabilní hodiny", cat: "zahradni-grily", brand: "TerraGarden", price: 2190000, stock: 6, flags: { featured: true }, img: [pic("zahradni-grily")], sizes: null },
  { slug: "terragarden-lounge-set", title: "TerraGarden lounge set Riviéra", subtitle: "Rohová sedačka + stolek, umělý ratan, polstry v ceně", cat: "zahradni-nabytek", brand: "TerraGarden", price: 2790000, compare: 3490000, stock: 7, flags: { featured: true }, img: [pic("zahradni-nabytek")], sizes: null },
  { slug: "terragarden-sklenik-6m2", title: "TerraGarden skleník 6 m²", subtitle: "Hliníkový rám, 6mm polykarbonát, základna v ceně", cat: "skleniky", brand: "TerraGarden", price: 1590000, stock: 9, img: [pic("skleniky")], sizes: null },
  { slug: "terragarden-domek-zahradni", title: "TerraGarden zahradní domek 3×2 m", subtitle: "Smrková srubovka 19 mm, okno a dvoukřídlé dveře", cat: "zahradni-domky", brand: "TerraGarden", price: 3290000, stock: 4, img: [pic("zahradni-domky")], sizes: null },
  { slug: "zahradia-naradi-set-5", title: "Zahradia sada ručního nářadí 5 ks", subtitle: "Rýč, hrábě, motyka, lopatka a nůžky s jasanovými násadami", cat: "rucni-naradi", brand: "Zahradia", price: 129000, stock: 38, flags: { new: true }, img: [pic("rucni-naradi")], sizes: null },
  { slug: "greencut-aku-set-40v", title: "GreenCut AKU set 40V", subtitle: "Vyžínač + plotostřih + fukar, dvě baterie a nabíječka", cat: "aku-technika", brand: "GreenCut", price: 899000, compare: 1090000, stock: 12, flags: { featured: true }, img: [pic("aku-technika")], sizes: null },
  // ── Dům a dílna ──
  { slug: "powerhaus-elektrocentrala-3kw", title: "PowerHaus elektrocentrála 3 kW", subtitle: "Tichý invertor pro chatu, karavan i výpadky proudu", cat: "elektrocentraly", brand: "PowerHaus", price: 1490000, stock: 8, img: [pic("elektrocentraly")], sizes: null },
  { slug: "powerhaus-cerpadlo-ponorne", title: "PowerHaus ponorné čerpadlo 900 W", subtitle: "Na čistou i kalnou vodu, výtlak 8 m, plovák", cat: "cerpadla", brand: "PowerHaus", price: 189000, compare: 229000, stock: 26, img: [pic("cerpadla")], sizes: null },
  { slug: "powerhaus-tlakovy-cistic-140", title: "PowerHaus tlakový čistič 140 bar", subtitle: "Terasa, auto i fasáda — pěnovač a rotační tryska v ceně", cat: "cistici-technika", brand: "PowerHaus", price: 449000, stock: 19, flags: { featured: true }, img: [pic("cistici-technika")], sizes: null },
  { slug: "powerhaus-aku-vrtacka-20v", title: "PowerHaus AKU vrtačka 20V", subtitle: "Dvě baterie 2 Ah, kufr a 60 dílů příslušenství", cat: "elektricke-naradi", brand: "PowerHaus", price: 249000, compare: 319000, stock: 29, img: [pic("elektricke-naradi")], sizes: null },
  { slug: "powerhaus-zebrik-3x9", title: "PowerHaus hliníkový žebřík 3×9", subtitle: "Univerzál: opěrný, štafle i schodišťová pozice", cat: "zebriky", brand: "PowerHaus", price: 279000, stock: 16, img: [pic("zebriky")], sizes: null },
  { slug: "powerhaus-dilensky-ponk", title: "PowerHaus dílenský ponk 120 cm", subtitle: "Buková deska, dva šuplíky a perforovaná stěna", cat: "dilensky-nabytek", brand: "PowerHaus", price: 649000, stock: 7, img: [pic("dilensky-nabytek")], sizes: null },
  // ── Chovatelské potřeby ──
  { slug: "packfriend-granule-pes-12", title: "PackFriend granule pro psy 12 kg", subtitle: "Kuřecí s rýží, bez lepku, pro dospělé psy všech plemen", cat: "pro-psy", brand: "PackFriend", price: 89000, compare: 109000, stock: 44, flags: { featured: true }, img: [pic("pro-psy")], sizes: null },
  { slug: "packfriend-skrabadlo-tower", title: "PackFriend škrabadlo Tower 120 cm", subtitle: "Tři patra, jeskyňka a sisalové sloupky", cat: "pro-kocky", brand: "PackFriend", price: 149000, stock: 21, img: [pic("pro-kocky")], sizes: null },
  { slug: "packfriend-voliera-andulka", title: "PackFriend voliéra pro andulky", subtitle: "Prostorná klec 80 cm s bidýlky a krmítky", cat: "ptactvo-a-hlodavci", brand: "PackFriend", price: 129000, stock: 15, img: [pic("ptactvo-a-hlodavci")], sizes: null },
  { slug: "packfriend-bouda-zateplena", title: "PackFriend zateplená bouda L", subtitle: "Dvojité stěny, otevírací střecha, impregnace", cat: "boudy-a-pelisky", brand: "PackFriend", price: 349000, compare: 399000, stock: 9, img: [pic("boudy-a-pelisky")], sizes: null },
  // ── Elektrokola ──
  { slug: "voltride-mtb-29", title: "VoltRide MTB 29\"", subtitle: "Horské elektrokolo — motor 90 Nm, baterie 720 Wh", cat: "horska-elektrokola", brand: "VoltRide", price: 6490000, compare: 7290000, stock: 6, flags: { featured: true, new: true }, img: [pic("horska-elektrokola")], sizes: BIKE_F },
  { slug: "voltride-trek-lady", title: "VoltRide Trek Lady", subtitle: "Trekingové elektrokolo s nízkým nástupem a nosičem", cat: "trekingova-elektrokola", brand: "VoltRide", price: 5490000, stock: 8, img: [pic("trekingova-elektrokola")], sizes: BIKE_F },
  { slug: "voltride-city-comfort", title: "VoltRide City Comfort", subtitle: "Městské elektrokolo s košíkem a integrovaným světlem", cat: "mestska-elektrokola", brand: "VoltRide", price: 4290000, compare: 4790000, stock: 10, img: [pic("mestska-elektrokola")], sizes: BIKE_F },
  { slug: "voltride-baterie-720", title: "VoltRide náhradní baterie 720 Wh", subtitle: "Kompatibilní s modely 2024+, nabití za 3,5 h", cat: "elektrokola-prislusenstvi", brand: "VoltRide", price: 1490000, stock: 12, img: [pic("elektrokola-prislusenstvi")], sizes: null },
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
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible)
       VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort]
    );
    catIds.set(cat.slug, r.rows[0].id);
  }
  for (const cat of CATEGORIES.filter(x => x.parent)) {
    const r = await client.query(
      `INSERT INTO product_categories (tenant_id, slug, name, description, sort_order, is_visible, parent_id)
       VALUES ($1,$2,$3,$4,$5,true,$6) RETURNING id`,
      [tenantId, cat.slug, cat.name, cat.desc ?? null, cat.sort, catIds.get(cat.parent)]
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
    const variants = p.sizes ?? ["Standard"];
    const optName = p.sizes ? "Provedení" : "Provedení";
    const desc = `${p.subtitle}. ${p.title} od značky ${p.brand} — vybráno a otestováno našimi specialisty. Doprava zdarma nad 2 990 Kč, 54 prodejen po celé ČR a vlastní servis s náhradními díly. Rádi poradíme na prodejně i po telefonu.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.subtitle, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: optName, values: variants }]), JSON.stringify(p.flags ?? {})]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (p.compare) await link(pid, "akce");
    if (p.flags?.new) await link(pid, "novinky");

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, p.img[i], `${p.title} — foto ${i + 1}`, i]
      );
    }

    for (let i = 0; i < variants.length; i++) {
      const vr = await client.query(
        `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [tenantId, pid, `${p.slug.toUpperCase()}-${i}`, variants[i],
         JSON.stringify({ [optName]: variants[i] }), p.price, p.compare ?? null, p.stock, i === 0, i]
      );
      vc++;
      await client.query(
        `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
         VALUES ($1,$2,$3,$4,'import','eshop-14 seed')`,
        [tenantId, vr.rows[0].id, p.stock, p.stock]
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
