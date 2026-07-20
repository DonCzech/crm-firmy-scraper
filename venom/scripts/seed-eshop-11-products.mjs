/**
 * Seed produktového katalogu pro eshop-11-v2 (HORAL — rockpoint DNA, outdoor vybavení).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-11-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-11-v2";

const U = (id, w = 900, h = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// Všechny fotky vizuálně ověřeny kontaktním archem (session 2026-07-14)
const P = {
  boots: "1520639888713-7851133b1ed0",
  backpackNavy: "1553062407-98eeb64c6a62",
  backpackLeather: "1547949003-9792a18a2601",
  backpackerFjord: "1568454537842-d933259bb258",
  hikers: "1551632811-561732d1e306",
  family: "1501554728187-ce583db33af7",
  lakeSit: "1465311440653-ba9b1d9b0f5b",
  amaDablam: "1454496522488-7a8e488e8606",
  valley: "1464822759023-fed622ff2c3b",
  steppe: "1486870591958-9b9d0d1dda99",
  climber: "1522163182402-834f871fd851",
  cams: "1516592673884-4a382d1124c2",
  tentInterior: "1504280390367-361c6d9f38f4",
  campfireTents: "1487730116645-74489c95b41b",
  tentSunset: "1510312305653-8ed496efae75",
  tentWoman: "1508873696983-2dfd5898f08b",
  tentMilkyWay: "1517824806704-9040b037703b",
  tentMoody: "1571687949921-1306bfb24b72",
  cairnHiker: "1526772662000-3f88f10405ff",
  peaksClouds: "1458668383970-8ddd3927deed",
  skier: "1551698618-1dfe5d97d256",
  forestMug: "1414016642750-7fdd78dc33d9",
  kayak: "1521336575822-6da63fb45455",
  winterRiver: "1455156218388-5e61b526818b",
  tee: "1521572163474-6864f9cf17ab",
  jacket: "1591047139829-d91aecb6caea",
  hoodie: "1556821840-3a63f95609a7",
  starsMountains: "1519681393784-d120267933ba",
  torres: "1544198365-f5d60b6d8190",
  gearFlatlay: "1504609773096-104ff2c73ba4",
  tentAutumn: "1476041800959-2f6bb412c8ce",
  tentSnow: "1455496231601-e6195da1f841",
  hammock: "1445307806294-bff7f67ff225",
  tentMeadowFeet: "1532339142463-fd0a8979791a",
  bottleGreen: "1602143407151-7111542de6e8",
  ridge: "1445452916036-9022dfd33aa8",
  glacier: "1600298881974-6be191ceeda1",
  ridgeMinimal: "1518214598173-1666bc921d66",
  oliveTee: "1519058082700-08a0b56da9b4",
  peakSunset: "1506905925346-21bda4d32df4",
};

const CATEGORIES = [
  { slug: "novinky", name: "Novinky", sort: 0, desc: "Čerstvě naskladněno — vybavení, které jsme právě otestovali v terénu." },
  { slug: "muzi", name: "Muži", sort: 1, desc: "Pánské outdoorové oblečení od základní vrstvy po hardshell." },
  { slug: "panske-bundy", name: "Pánské bundy", sort: 0, parent: "muzi" },
  { slug: "panske-kalhoty", name: "Pánské kalhoty", sort: 1, parent: "muzi" },
  { slug: "panske-mikiny", name: "Pánské mikiny a svetry", sort: 2, parent: "muzi" },
  { slug: "panske-termopradlo", name: "Pánské termoprádlo a merino", sort: 3, parent: "muzi" },
  { slug: "panska-tricka", name: "Pánská trička a košile", sort: 4, parent: "muzi" },
  { slug: "panske-doplnky", name: "Pánské čepice a rukavice", sort: 5, parent: "muzi" },
  { slug: "zeny", name: "Ženy", sort: 2, desc: "Dámské outdoorové oblečení na hřebenovky i pod stan." },
  { slug: "damske-bundy", name: "Dámské bundy", sort: 0, parent: "zeny" },
  { slug: "damske-kalhoty", name: "Dámské kalhoty a legíny", sort: 1, parent: "zeny" },
  { slug: "damske-mikiny", name: "Dámské mikiny a svetry", sort: 2, parent: "zeny" },
  { slug: "damske-termopradlo", name: "Dámské termoprádlo a merino", sort: 3, parent: "zeny" },
  { slug: "damska-tricka", name: "Dámská trička a košile", sort: 4, parent: "zeny" },
  { slug: "damske-doplnky", name: "Dámské čepice a čelenky", sort: 5, parent: "zeny" },
  { slug: "deti", name: "Děti", sort: 3, desc: "Outdoorové vybavení pro malé dobrodruhy." },
  { slug: "boty", name: "Boty", sort: 4, desc: "Treková, turistická i lezecká obuv — poradíme s výběrem na míru noze." },
  { slug: "trekova-obuv", name: "Treková obuv", sort: 0, parent: "boty" },
  { slug: "nizka-obuv", name: "Nízká turistická obuv", sort: 1, parent: "boty" },
  { slug: "trailova-obuv", name: "Trailová obuv", sort: 2, parent: "boty" },
  { slug: "lezecky", name: "Lezečky", sort: 3, parent: "boty" },
  { slug: "sandaly", name: "Sandály", sort: 4, parent: "boty" },
  { slug: "ponozky", name: "Ponožky", sort: 5, parent: "boty" },
  { slug: "batohy", name: "Batohy", sort: 5, desc: "Batohy vyzkoušené na vlastních zádech — od 15 do 70 litrů." },
  { slug: "turisticke-batohy", name: "Turistické batohy do 35 l", sort: 0, parent: "batohy" },
  { slug: "expedicni-batohy", name: "Expediční batohy 50 l+", sort: 1, parent: "batohy" },
  { slug: "lezecke-batohy", name: "Lezecké batohy", sort: 2, parent: "batohy" },
  { slug: "mestske-batohy", name: "Městské batohy a na cesty", sort: 3, parent: "batohy" },
  { slug: "batohy-doplnky", name: "Pláštěnky a doplňky", sort: 4, parent: "batohy" },
  { slug: "spani", name: "Spaní", sort: 6, desc: "Spacáky, karimatky a stany na tři roční období i zimní expedice." },
  { slug: "spacaky", name: "Spacáky", sort: 0, parent: "spani" },
  { slug: "karimatky", name: "Karimatky", sort: 1, parent: "spani" },
  { slug: "stany", name: "Stany", sort: 2, parent: "spani" },
  { slug: "hamaky", name: "Hamaky", sort: 3, parent: "spani" },
  { slug: "spani-doplnky", name: "Polštářky a vložky", sort: 4, parent: "spani" },
  { slug: "vybaveni", name: "Vybavení", sort: 7, desc: "Čelovky, vařiče, termosky a všechno, co unese celou výpravu." },
  { slug: "celovky", name: "Čelovky", sort: 0, parent: "vybaveni" },
  { slug: "trekove-hole", name: "Trekové hole", sort: 1, parent: "vybaveni" },
  { slug: "vareni", name: "Vaření a plyn", sort: 2, parent: "vybaveni" },
  { slug: "lahve-termosky", name: "Láhve a termosky", sort: 3, parent: "vybaveni" },
  { slug: "noze", name: "Nože a nářadí", sort: 4, parent: "vybaveni" },
  { slug: "lekarnicky", name: "Lékárničky", sort: 5, parent: "vybaveni" },
  { slug: "lezeni", name: "Lezení", sort: 8, desc: "Certifikované lezecké vybavení na skálu, stěnu i ferraty." },
  { slug: "uvazky", name: "Úvazky", sort: 0, parent: "lezeni" },
  { slug: "lana", name: "Lana", sort: 1, parent: "lezeni" },
  { slug: "karabiny", name: "Karabiny a expresky", sort: 2, parent: "lezeni" },
  { slug: "helmy", name: "Helmy", sort: 3, parent: "lezeni" },
  { slug: "magnezium", name: "Magnézium", sort: 4, parent: "lezeni" },
  { slug: "jisteni", name: "Jištění", sort: 5, parent: "lezeni" },
  { slug: "obleceni", name: "Oblečení", sort: 85, desc: "Outdoorové oblečení od merino vrstvy po hardshell — pro muže, ženy i děti." },
  { slug: "akce", name: "Akce", sort: 89, desc: "Aktuální akční nabídky a zvýhodněné ceny — jen dokud jsou skladem." },
  { slug: "vyprodej", name: "Výprodej", sort: 90, desc: "Zlevněné vybavení z minulých sezón — plná funkce, nižší cena." },
  { slug: "znacky", name: "Značky", sort: 96, desc: "Ověřené outdoorové značky, kterým sami věříme." },
  { slug: "petzl", name: "Petzl", sort: 0, parent: "znacky" },
  { slug: "salewa", name: "Salewa", sort: 1, parent: "znacky" },
  { slug: "la-sportiva", name: "La Sportiva", sort: 2, parent: "znacky" },
  { slug: "osprey", name: "Osprey", sort: 3, parent: "znacky" },
  { slug: "deuter", name: "Deuter", sort: 4, parent: "znacky" },
  { slug: "msr", name: "MSR", sort: 5, parent: "znacky" },
  { slug: "sea-to-summit", name: "Sea to Summit", sort: 6, parent: "znacky" },
  { slug: "icebreaker", name: "Icebreaker", sort: 7, parent: "znacky" },
  { slug: "horal", name: "HORAL", sort: 8, parent: "znacky" },
  { slug: "teva", name: "Teva", sort: 9, parent: "znacky" },
  { slug: "black-diamond", name: "Black Diamond", sort: 10, parent: "znacky" },
  { slug: "leki", name: "Leki", sort: 11, parent: "znacky" },
  { slug: "hydro-flask", name: "Hydro Flask", sort: 12, parent: "znacky" },
  { slug: "victorinox", name: "Victorinox", sort: 13, parent: "znacky" },
  { slug: "tendon", name: "Tendon", sort: 14, parent: "znacky" },
  // aktivity (panel Vybrat podle aktivity)
  { slug: "turistika", name: "Turistika a treking", sort: 91, desc: "Výběr vybavení na jednodenní túry i vícedenní treky." },
  { slug: "vysoke-hory", name: "Vysoké hory", sort: 92, desc: "Vybavení do velehor — expedice, ledovce, vysokohorská turistika." },
  { slug: "skialp-zima", name: "Skialp a zima", sort: 93, desc: "Zimní vrstvy a vybavení na skialp, sněžnice i mrazivé bivaky." },
  { slug: "kemp", name: "Kemp a festival", sort: 94, desc: "Pohodové kempování — stany, vařiče a spaní pod širákem." },
  { slug: "voda", name: "Voda a kajak", sort: 95, desc: "Vybavení k vodě — rychleschnoucí, nepromokavé, plovoucí." },
];

const SHOE = ["EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"];
const SHOE_W = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41"];
const APPAREL = ["S", "M", "L", "XL"];
const APPAREL_W = ["XS", "S", "M", "L"];
const SOCKS = ["36–39", "40–43", "44–47"];

// price v haléřích; acts = extra kategorie aktivit
const PRODUCTS = [
  // ── Boty ──
  { slug: "salewa-alp-trainer-2-mid-gtx", title: "Salewa Alp Trainer 2 Mid GTX", subtitle: "Treková klasika s Gore-Tex membránou a Vibram podešví", cat: "trekova-obuv", brand: "Salewa", genders: ["muzi", "zeny"], acts: ["turistika", "vysoke-hory"], price: 449900, stock: 14, flags: { featured: true }, img: [P.boots, P.hikers], sizes: SHOE },
  { slug: "la-sportiva-tx4-evo", title: "La Sportiva TX4 Evo", subtitle: "Přístupovka na kámen i sypké chodníky, guma FriXion", cat: "nizka-obuv", brand: "La Sportiva", genders: ["muzi"], acts: ["turistika", "lezeni"], price: 389900, compare: 429900, stock: 11, img: [P.ridgeMinimal], sizes: SHOE },
  { slug: "nadmorka-trail-runner-gtx", title: "HORAL Trail Runner GTX", subtitle: "Lehká trailovka s membránou na bláto i kamení", cat: "trailova-obuv", brand: "HORAL", genders: ["muzi", "zeny"], acts: ["turistika"], price: 329900, stock: 18, flags: { new: true, featured: true }, img: [P.ridge], sizes: SHOE },
  { slug: "la-sportiva-tarantulace", title: "La Sportiva Tarantulace", subtitle: "Nejoblíbenější lezečka na první stěny i celodenní ježdění", cat: "lezecky", brand: "La Sportiva", genders: ["muzi", "zeny"], acts: ["lezeni"], price: 259900, stock: 16, flags: { featured: true }, img: [P.climber], sizes: SHOE },
  { slug: "teva-hurricane-xlt2", title: "Teva Hurricane XLT2", subtitle: "Sandály na vodu i prašné treky, rychleschnoucí popruhy", cat: "sandaly", brand: "Teva", genders: ["muzi", "zeny"], acts: ["voda", "kemp"], price: 189900, compare: 219900, stock: 21, img: [P.lakeSit, P.kayak], sizes: SHOE_W },
  { slug: "nadmorka-merino-hike-2pack", title: "HORAL Merino Hike ponožky 2-pack", subtitle: "70 % merino, zesílená pata a špička, žádné puchýře", cat: "ponozky", brand: "HORAL", genders: ["muzi", "zeny"], acts: ["turistika", "skialp-zima"], price: 44900, stock: 60, img: [P.gearFlatlay], sizes: SOCKS },
  // ── Batohy ──
  { slug: "osprey-talon-33", title: "Osprey Talon 33", subtitle: "Turistický batoh s AirScape zády a bederákem, který sedí", cat: "turisticke-batohy", brand: "Osprey", genders: ["muzi", "zeny"], acts: ["turistika"], price: 379900, stock: 13, flags: { featured: true }, img: [P.backpackNavy, P.hikers], sizes: null },
  { slug: "deuter-aircontact-core-60", title: "Deuter Aircontact Core 60+10", subtitle: "Expediční nosič na vícedenní treky s plnou polní", cat: "expedicni-batohy", brand: "Deuter", genders: ["muzi", "zeny"], acts: ["vysoke-hory", "turistika"], price: 649900, stock: 7, img: [P.backpackerFjord], sizes: null },
  { slug: "black-diamond-rock-blitz-15", title: "Black Diamond Rock Blitz 15", subtitle: "Lezecký batoh na jednodélky — lano dovnitř, mag ven", cat: "lezecke-batohy", brand: "Black Diamond", genders: ["muzi", "zeny"], acts: ["lezeni"], price: 219900, stock: 10, img: [P.cams], sizes: null },
  { slug: "nadmorka-city-25", title: "HORAL City 25", subtitle: "Městský batoh z voskovaného plátna s koženými detaily", cat: "mestske-batohy", brand: "HORAL", genders: ["muzi", "zeny"], price: 249900, compare: 289900, stock: 19, flags: { featured: true }, img: [P.backpackLeather], sizes: null },
  { slug: "osprey-plastenka-m", title: "Osprey pláštěnka na batoh M", subtitle: "20–35 l, stažitelný lem, reflexní prvky", cat: "batohy-doplnky", brand: "Osprey", acts: ["turistika"], price: 74900, stock: 30, img: [P.valley], sizes: null },
  // ── Spaní ──
  { slug: "sea-to-summit-spark-spiii", title: "Sea to Summit Spark SpIII spacák", subtitle: "Ultralehké peří 850+ do −8 °C, 665 g v kompresním obalu", cat: "spacaky", brand: "Sea to Summit", acts: ["vysoke-hory", "turistika"], price: 749900, stock: 8, flags: { featured: true }, img: [P.tentInterior], sizes: null },
  { slug: "nadmorka-alpine-3s-spacak", title: "HORAL Alpine 3S spacák", subtitle: "Třísezónní syntetika do −2 °C, funguje i vlhká", cat: "spacaky", brand: "HORAL", acts: ["kemp", "turistika"], price: 459900, compare: 519900, stock: 15, img: [P.tentSunset], sizes: null },
  { slug: "sea-to-summit-ether-light-xt", title: "Sea to Summit Ether Light XT karimatka", subtitle: "10 cm vzduchu pod zády, R-value 3,2, sbalí se do dlaně", cat: "karimatky", brand: "Sea to Summit", acts: ["turistika", "kemp"], price: 429900, stock: 12, img: [P.tentMeadowFeet], sizes: null },
  { slug: "msr-hubba-hubba-nx2", title: "MSR Hubba Hubba NX 2", subtitle: "Legendární dvoumístný stan — 1,7 kg na hřebenovky", cat: "stany", brand: "MSR", acts: ["turistika", "kemp"], price: 1249900, stock: 5, flags: { featured: true }, img: [P.tentAutumn, P.tentMoody], sizes: null },
  { slug: "nadmorka-vrchol-2-stan", title: "HORAL Vrchol 2 expediční stan", subtitle: "Čtyřsezónní konstrukce do větru a sněhu, dvě apsidy", cat: "stany", brand: "HORAL", acts: ["vysoke-hory", "skialp-zima"], price: 899900, compare: 999900, stock: 6, flags: { new: true }, img: [P.tentSnow], sizes: null },
  { slug: "nadmorka-hamaka-ultralight", title: "HORAL Hamaka Ultralight", subtitle: "290 g včetně karabin, nosnost 180 kg, ripstop nylon", cat: "hamaky", brand: "HORAL", acts: ["kemp"], price: 129900, stock: 24, img: [P.hammock], sizes: null },
  { slug: "sea-to-summit-aeros-polstarek", title: "Sea to Summit Aeros polštářek", subtitle: "79 g luxusu, nafouknete třemi dechy", cat: "spani-doplnky", brand: "Sea to Summit", acts: ["kemp", "turistika"], price: 84900, stock: 28, img: [P.tentWoman], sizes: null },
  // ── Vybavení ──
  { slug: "petzl-actik-core-600", title: "Petzl Actik Core 600", subtitle: "600 lm, dobíjecí CORE aku i tužkovky, červené světlo", cat: "celovky", brand: "Petzl", acts: ["turistika", "vysoke-hory", "lezeni"], price: 189900, stock: 20, flags: { featured: true }, img: [P.tentMilkyWay], sizes: null },
  { slug: "petzl-tikkina-350", title: "Petzl Tikkina 350", subtitle: "Jednoduchá spolehlivá čelovka na kemp i chatu", cat: "celovky", brand: "Petzl", acts: ["kemp"], price: 79900, stock: 35, img: [P.starsMountains], sizes: null },
  { slug: "leki-makalu-cork-lite", title: "Leki Makalu Cork Lite", subtitle: "Korkové rukojeti, Speed Lock 2 — hole na tisíce kilometrů", cat: "trekove-hole", brand: "Leki", acts: ["turistika", "vysoke-hory"], price: 269900, stock: 14, img: [P.cairnHiker], sizes: null },
  { slug: "msr-pocketrocket-2", title: "MSR PocketRocket 2", subtitle: "73 g vařiče, litr vody vroucí za 3,5 minuty", cat: "vareni", brand: "MSR", acts: ["kemp", "turistika"], price: 139900, stock: 26, flags: { featured: true }, img: [P.forestMug], sizes: null },
  { slug: "msr-titan-sada", title: "MSR Titan titanová sada nádobí", subtitle: "Hrnec 850 ml + poklička-talíř, dohromady 122 g", cat: "vareni", brand: "MSR", acts: ["kemp"], price: 159900, stock: 17, img: [P.campfireTents], sizes: null },
  { slug: "hydro-flask-09-termoska", title: "Hydro Flask 0,9 l termoska", subtitle: "TempShield izolace — čaj horký 12 hodin i v mrazu", cat: "lahve-termosky", brand: "Hydro Flask", acts: ["skialp-zima", "turistika", "voda"], price: 99900, compare: 119900, stock: 32, flags: { featured: true }, img: [P.bottleGreen], sizes: null },
  { slug: "victorinox-hiker", title: "Victorinox Hiker", subtitle: "13 funkcí včetně pilky — nůž, co přežije generace", cat: "noze", brand: "Victorinox", acts: ["kemp", "turistika"], price: 89900, stock: 40, img: [P.gearFlatlay], sizes: null },
  { slug: "nadmorka-lekarnicka-trek", title: "HORAL první pomoc na trek", subtitle: "Sestaveno s horskou službou — 34 položek, 280 g", cat: "lekarnicky", brand: "HORAL", acts: ["turistika", "vysoke-hory"], price: 64900, stock: 25, img: [P.steppe], sizes: null },
  // ── Lezení ──
  { slug: "petzl-corax-lt", title: "Petzl Corax LT", subtitle: "Univerzální úvazek na skálu, stěnu i ferraty", cat: "uvazky", brand: "Petzl", acts: ["lezeni"], price: 179900, stock: 18, flags: { featured: true }, img: [P.climber], sizes: ["S", "M", "L"] },
  { slug: "tendon-master-97-70", title: "Tendon Master 9,7 mm / 70 m", subtitle: "Univerzální jednička s impregnací Complete Shield", cat: "lana", brand: "Tendon", acts: ["lezeni"], price: 449900, stock: 9, img: [P.glacier], sizes: null },
  { slug: "black-diamond-hotforge-6", title: "Black Diamond HotForge expresky 6-pack", subtitle: "Kované karabiny s keylock nosem, 12cm smyčky", cat: "karabiny", brand: "Black Diamond", acts: ["lezeni"], price: 279900, stock: 11, img: [P.ridge], sizes: null },
  { slug: "petzl-boreo", title: "Petzl Boreo", subtitle: "Odolná helma s rozšířenou ochranou týlu a spánků", cat: "helmy", brand: "Petzl", acts: ["lezeni", "vysoke-hory"], price: 169900, compare: 189900, stock: 15, img: [P.amaDablam], sizes: ["S/M", "M/L"] },
  { slug: "nadmorka-magnezium-block", title: "HORAL magnézium block 56 g", subtitle: "Čistý MgCO₃ bez příměsí, drží i ve vlhku", cat: "magnezium", brand: "HORAL", acts: ["lezeni"], price: 24900, stock: 80, img: [P.torres], sizes: null },
  { slug: "petzl-grigri-plus", title: "Petzl GriGri+", subtitle: "Asistované brždění s anti-panic funkcí, lana 8,5–11 mm", cat: "jisteni", brand: "Petzl", acts: ["lezeni"], price: 349900, stock: 8, flags: { new: true }, img: [P.peaksClouds], sizes: null },
  // ── Muži ──
  { slug: "nadmorka-hardshell-ridge-3l", title: "HORAL Hardshell Ridge 3L", subtitle: "Třívrstvá membrána 20k/20k, podpažní ventilace", cat: "panske-bundy", brand: "HORAL", genders: ["muzi"], acts: ["vysoke-hory", "skialp-zima"], price: 549900, stock: 12, flags: { featured: true, new: true }, img: [P.jacket], sizes: APPAREL },
  { slug: "salewa-pedroc-kalhoty", title: "Salewa Pedroc pánské kalhoty", subtitle: "Lehký strečový softshell na rychlé túry", cat: "panske-kalhoty", brand: "Salewa", genders: ["muzi"], acts: ["turistika"], price: 289900, stock: 16, img: [P.hikers], sizes: APPAREL },
  { slug: "icebreaker-merino-mikina-260", title: "Icebreaker merino mikina 260 Quantum", subtitle: "Hřeje, dýchá a nesmrdí ani po týdnu na treku", cat: "panske-mikiny", brand: "Icebreaker", genders: ["muzi"], acts: ["turistika", "skialp-zima"], price: 379900, compare: 419900, stock: 10, img: [P.hoodie], sizes: APPAREL },
  { slug: "icebreaker-oasis-200-triko", title: "Icebreaker Oasis 200 triko s dl. rukávem", subtitle: "Základní merino vrstva na celý rok", cat: "panske-termopradlo", brand: "Icebreaker", genders: ["muzi"], acts: ["skialp-zima", "vysoke-hory"], price: 219900, stock: 22, flags: { featured: true }, img: [P.oliveTee], sizes: APPAREL },
  { slug: "nadmorka-logo-tricko", title: "HORAL logo tričko", subtitle: "Organická bavlna 180 g, tisk vodou ředěnými barvami", cat: "panska-tricka", brand: "HORAL", genders: ["muzi"], price: 69900, stock: 45, flags: { new: true }, img: [P.tee], sizes: APPAREL },
  { slug: "nadmorka-merino-cepice", title: "HORAL merino čepice", subtitle: "Jemné merino 18,5 mikronu, nekouše ani na holé hlavě", cat: "panske-doplnky", brand: "HORAL", genders: ["muzi", "zeny"], acts: ["skialp-zima"], price: 54900, stock: 38, img: [P.winterRiver], sizes: null },
  // ── Ženy ──
  { slug: "nadmorka-softshell-sedlo-w", title: "HORAL Softshell Sedlo W", subtitle: "Větruodolný softshell s prodlouženými zády", cat: "damske-bundy", brand: "HORAL", genders: ["zeny"], acts: ["turistika"], price: 429900, compare: 479900, stock: 13, flags: { featured: true }, img: [P.torres], sizes: APPAREL_W },
  { slug: "salewa-agner-leginy-w", title: "Salewa Agner dámské legíny", subtitle: "Odolný streč s kapsou na mobil i mag", cat: "damske-kalhoty", brand: "Salewa", genders: ["zeny"], acts: ["turistika", "lezeni"], price: 239900, stock: 17, img: [P.family], sizes: APPAREL_W },
  { slug: "icebreaker-merino-mikina-w", title: "Icebreaker merino mikina Quantum W", subtitle: "Merino 260 g s kapucí a palcovými otvory", cat: "damske-mikiny", brand: "Icebreaker", genders: ["zeny"], acts: ["skialp-zima"], price: 359900, stock: 11, img: [P.lakeSit], sizes: APPAREL_W },
  { slug: "icebreaker-oasis-200-w", title: "Icebreaker Oasis 200 W triko", subtitle: "Dámská základní merino vrstva, plochý švy", cat: "damske-termopradlo", brand: "Icebreaker", genders: ["zeny"], acts: ["skialp-zima", "vysoke-hory"], price: 219900, stock: 19, img: [P.tentWoman], sizes: APPAREL_W },
  { slug: "nadmorka-tricko-hreben-w", title: "HORAL tričko Hřeben W", subtitle: "Grafika hřebenu Krkonoš, organická bavlna", cat: "damska-tricka", brand: "HORAL", genders: ["zeny"], price: 69900, compare: 79900, stock: 33, img: [P.valley], sizes: APPAREL_W },
  { slug: "nadmorka-merino-celenka", title: "HORAL merino čelenka", subtitle: "Na běžky, skialp i pod helmu", cat: "damske-doplnky", brand: "HORAL", genders: ["zeny"], acts: ["skialp-zima"], price: 34900, stock: 42, flags: { new: true }, img: [P.skier], sizes: null },
  // ── Děti ──
  { slug: "nadmorka-junior-bunda", title: "HORAL Junior bunda do deště", subtitle: "Membrána 10k, reflexní prvky, rostoucí rukávy", cat: "deti", brand: "HORAL", genders: ["deti"], acts: ["turistika", "kemp"], price: 249900, stock: 20, flags: { new: true }, img: [P.family], sizes: ["110", "122", "134", "146"] },
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
    const optName = p.sizes ? "Velikost" : "Provedení";
    const desc = `${p.subtitle}. ${p.title} od značky ${p.brand} — vybavení, které jsme sami vynesli do hor a otestovali. Doprava zdarma nad 1 499 Kč, vrácení do 90 dní a zákaznický klub se slevou až 15 %. Kdyby něco, stav se na prodejně v Praze nebo Brně.`;
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
    for (const g of p.genders ?? []) await link(pid, g);
    for (const a of p.acts ?? []) await link(pid, a);
    if (p.compare) { await link(pid, "vyprodej"); await link(pid, "akce"); }
    if (p.flags?.new) await link(pid, "novinky");
    const APPAREL_CATS = ["panske-bundy", "panske-kalhoty", "panske-mikiny", "panske-termopradlo", "panska-tricka", "panske-doplnky", "damske-bundy", "damske-kalhoty", "damske-mikiny", "damske-termopradlo", "damska-tricka", "damske-doplnky"];
    if (APPAREL_CATS.includes(p.cat)) await link(pid, "obleceni");
    const brandSlug = p.brand.toLowerCase().replace(/\s+/g, "-");
    await link(pid, brandSlug);

    for (let i = 0; i < p.img.length; i++) {
      await client.query(
        `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, pid, U(p.img[i]), `${p.title} — foto ${i + 1}`, i]
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
         VALUES ($1,$2,$3,$4,'import','eshop-11 seed')`,
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
