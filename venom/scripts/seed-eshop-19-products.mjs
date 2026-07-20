/**
 * Seed produktového katalogu pro eshop-19-v2 (Grunt — stavebniny, dek.cz DNA).
 * Idempotentní: smaže a znovu naseje kategorie + produkty tenanta.
 * Demo data: vlastní demo značky (KVADRIT zdicí materiály, Termolan izolace,
 * HYDROTES hydroizolace, fasadin omítky a barvy, OCELIT nářadí a výztuž,
 * LUMEN+ elektro, Akvaterm voda/topení, GRUNT Mix suché směsi) — žádné
 * originály z dek.cz (Porfix→KVADRIT, Baumit→GRUNT Mix…), ceny ±15–30 %.
 * flags.featured = Akční položky, flags.new = Novinky, flags.deal = badge Výhodná cena.
 * Usage: DATABASE_URL=... node scripts/seed-eshop-19-products.mjs
 */
import pg from "pg";

const TENANT_SLUG = "eshop-19-v2";

const U = (id, w = 800, h = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;

// Ověřené HEAD requestem 2026-07-17 (motivy vizuálně kontrolovat na kartách)
const IMG = {
  bricks: U("photo-1616621859311-19dff47afafc"),
  siteCrane: U("photo-1504307651254-35680f356dfd"),
  workers: U("photo-1541888946425-d81bb19240f5"),
  blueprint: U("photo-1503387762-592deb58ef4e"),
  engineer: U("photo-1581094794329-c8112a89af12"),
  labWorker: U("photo-1581092160562-40aa08e78837"),
  house: U("photo-1523217582562-09d0def993a6"),
  scaffold: U("photo-1516216628859-9bccecab13ca"),
  roof: U("photo-1426927308491-6380b6a9936f"),
  warehouse: U("photo-1586528116311-ad8dd3c8310d"),
  interior: U("photo-1560184897-ae75f418493e"),
  drywall: U("photo-1632759145351-1d592919f522"),
  tiles: U("photo-1517089596392-fb9a9033e05b"),
  timber: U("photo-1489514354504-1653aa90e34e"),
  roofTiles: U("photo-1503594384566-461fe158e797"),
  concrete: U("photo-1616621859311-19dff47afafc"),
  paintCans: U("photo-1562259949-e8e7689d7828"),
  toolsWall: U("photo-1504148455328-c376907d081c"),
  cables: U("photo-1621905251918-48416bd8575a"),
  breaker: U("photo-1621905252507-b35492cc74b4"),
  lamp: U("photo-1580901368919-7738efb0f87e"),
  heating: U("photo-1600585154340-be6161a56a0c"),
  bathroom: U("photo-1584622650111-993a426fbf0a"),
  pipes: U("photo-1607472586893-edb57bdc0e39"),
  kitchen: U("photo-1556909114-f6e7ad7d3136"),
  facade: U("photo-1600607687939-ce8a6c25118c"),
  attic: U("photo-1535732820275-9ffd998cac22"),
  insulation: U("photo-1615971677499-5467cbab01c0"),
  sand: U("photo-1614977645540-7abd88ba8e56"),
  measure: U("photo-1591955506264-3f5a6834570a"),
  drill: U("photo-1504148455328-c376907d081c"),
  ladder: U("photo-1553356084-58ef4a67b2a7"),
  mixer: U("photo-1572981779307-38b8cabb2407"),
  plaster: U("photo-1585128792020-803d29415281"),
  floor: U("photo-1513467535987-fd81bc7d62f8"),
};

const CATEGORIES = [
  { slug: "akce", name: "Akce", sort: 90, desc: "Akční položky — stavební materiál a vybavení za akční ceny." },
  { slug: "novinky", name: "Novinky", sort: 91, desc: "Čerstvé přírůstky v sortimentu Grunt." },
  { slug: "vyprodej", name: "Výprodej", sort: 92, desc: "Doprodej skladových zásob — jen dokud jsou skladem." },

  { slug: "stavebniny", name: "Stavebniny", sort: 1, desc: "Kompletní materiál pro hrubou stavbu, střechy, izolace i fasády." },
  { slug: "hruba-stavba", name: "Hrubá stavba", sort: 0, parent: "stavebniny", desc: "Zdicí materiály, překlady, stropní systémy, pojiva a ztracené bednění." },
  { slug: "strechy", name: "Střechy", sort: 1, parent: "stavebniny", desc: "Krytiny, fólie a doplňky pro šikmé i ploché střechy." },
  { slug: "tepelne-izolace", name: "Tepelné izolace", sort: 2, parent: "stavebniny", desc: "Minerální vata, polystyren a PIR pro fasády, střechy i podlahy." },
  { slug: "hydroizolace", name: "Hydroizolace", sort: 3, parent: "stavebniny", desc: "Asfaltové pásy, fólie a stěrky proti vodě a vlhkosti." },
  { slug: "sucha-vystavba", name: "Suchá výstavba", sort: 4, parent: "stavebniny", desc: "Sádrokartonové desky, profily a příslušenství." },
  { slug: "fasadni-systemy", name: "Fasádní systémy", sort: 5, parent: "stavebniny", desc: "Zateplovací systémy, omítky a fasádní doplňky." },
  { slug: "suche-smesi", name: "Suché směsi a stavební chemie", sort: 6, parent: "stavebniny", desc: "Betony, malty, lepidla a stěrky připravené k rozmíchání." },
  { slug: "podlahy-obklady", name: "Podlahy a obklady", sort: 7, parent: "stavebniny", desc: "Anhydrity, nivelační stěrky, obklady a lepidla." },

  { slug: "elektromaterial", name: "Elektromateriál", sort: 2, desc: "Kabely, jističe, vypínače a osvětlení pro celou stavbu." },
  { slug: "kabely-vodice", name: "Kabely a vodiče", sort: 0, parent: "elektromaterial" },
  { slug: "jistice-rozvadece", name: "Jističe a rozvaděče", sort: 1, parent: "elektromaterial" },
  { slug: "vypinace-zasuvky", name: "Vypínače a zásuvky", sort: 2, parent: "elektromaterial" },
  { slug: "osvetleni", name: "Osvětlení", sort: 3, parent: "elektromaterial" },

  { slug: "voda-topeni-sanita", name: "Voda Topení Sanita", sort: 3, desc: "Rozvody, topení a sanita od sklepa po střechu." },
  { slug: "rozvody-vody", name: "Rozvody vody", sort: 0, parent: "voda-topeni-sanita" },
  { slug: "topeni", name: "Topení", sort: 1, parent: "voda-topeni-sanita" },
  { slug: "sanita", name: "Sanita", sort: 2, parent: "voda-topeni-sanita" },
  { slug: "odvodneni", name: "Odvodnění a drenáže", sort: 3, parent: "voda-topeni-sanita" },

  { slug: "naradi", name: "Nářadí", sort: 4, desc: "Elektrické i ruční nářadí, měření a ochranné pomůcky." },
  { slug: "elektricke-naradi", name: "Elektrické nářadí", sort: 0, parent: "naradi" },
  { slug: "rucni-naradi", name: "Ruční nářadí", sort: 1, parent: "naradi" },
  { slug: "merici-technika", name: "Měřicí technika", sort: 2, parent: "naradi" },
  { slug: "zebriky-leseni", name: "Žebříky a lešení", sort: 3, parent: "naradi" },
  { slug: "ochranne-pomucky", name: "Ochranné pomůcky", sort: 4, parent: "naradi" },

  { slug: "barvy-laky", name: "Barvy a laky", sort: 5, desc: "Interiérové i fasádní barvy, laky, lazury a malířské potřeby." },
  { slug: "interierove-barvy", name: "Interiérové barvy", sort: 0, parent: "barvy-laky" },
  { slug: "fasadni-barvy", name: "Fasádní barvy", sort: 1, parent: "barvy-laky" },
  { slug: "laky-lazury", name: "Laky a lazury", sort: 2, parent: "barvy-laky" },
  { slug: "malirske-potreby", name: "Malířské potřeby", sort: 3, parent: "barvy-laky" },

  { slug: "pujcovna", name: "Půjčovna", sort: 6, desc: "Profesionální stroje a zařízení k pronájmu — bez kauce a bez rizika." },
  { slug: "stavebni-stroje", name: "Stavební stroje", sort: 0, parent: "pujcovna" },
  { slug: "vibracni-technika", name: "Vibrační technika", sort: 1, parent: "pujcovna" },
  { slug: "leseni-pujcovna", name: "Lešení k pronájmu", sort: 2, parent: "pujcovna" },
  { slug: "uklid-stavby", name: "Úklid stavby", sort: 3, parent: "pujcovna" },
];

// price v haléřích; sub = specifikace; unit = cenová jednotka („ks“, „bal.“, „m²“, „den“);
// featured = Akční položky, new = Novinky, deal = badge Výhodná cena
const PRODUCTS = [
  // ── Hrubá stavba (KVADRIT) ──
  { slug: "kvadrit-prickovka-p2-500-100", title: "KVADRIT příčkovka P2-500 100×500×250 mm", sub: "pórobeton • 8,6 kg • 120 ks/pal.", cat: "hruba-stavba", brand: "KVADRIT", price: 5890, compare: 6690, stock: 1240, unit: "ks", flags: { featured: true, deal: true }, img: IMG.concrete },
  { slug: "kvadrit-prickovka-p2-500-150", title: "KVADRIT příčkovka P2-500 150×500×250 mm", sub: "pórobeton • 12,9 kg • 80 ks/pal.", cat: "hruba-stavba", brand: "KVADRIT", price: 9190, compare: 10490, stock: 860, unit: "ks", flags: { deal: true }, img: IMG.concrete },
  { slug: "kvadrit-tvarnice-p2-440-250", title: "KVADRIT tvárnice P2-440 PDK 250×500×250 mm", sub: "pórobeton • pero-drážka-kapsa", cat: "hruba-stavba", brand: "KVADRIT", price: 13290, compare: 15990, stock: 620, unit: "ks", flags: { featured: true, deal: true }, img: IMG.bricks },
  { slug: "kvadrit-preklad-nosny-kp-7", title: "KVADRIT překlad nosný KP 7/125", sub: "1250×70×250 mm • nosný", cat: "hruba-stavba", brand: "KVADRIT", price: 47590, compare: 53990, stock: 96, unit: "ks", flags: { featured: true }, img: IMG.workers },
  { slug: "kvadrit-cihla-brousena-38", title: "KVADRIT cihla broušená TB 38 Profi", sub: "380×248×249 mm • P10", cat: "hruba-stavba", brand: "KVADRIT", price: 11490, stock: 2200, unit: "ks", flags: { new: true }, img: IMG.bricks },
  { slug: "grunt-ztracene-bedneni-20", title: "GRUNT Mix ztracené bednění 200×500×250 mm", sub: "beton • 24 kg", cat: "hruba-stavba", brand: "GRUNT Mix", price: 7290, stock: 1500, unit: "ks", img: IMG.concrete },
  { slug: "ocelit-kari-sit-kh30", title: "OCELIT kari síť KH 30 drát 6 mm — 2×3 m", sub: "oko 100×100 mm • 2×3 m", cat: "hruba-stavba", brand: "OCELIT", price: 72900, compare: 97900, stock: 180, unit: "ks", flags: { featured: true, deal: true }, img: IMG.siteCrane },

  // ── Střechy ──
  { slug: "kvadrit-taska-betonova-natura", title: "KVADRIT taška střešní betonová Natura", sub: "engoba cihlová • 10 ks/m²", cat: "strechy", brand: "KVADRIT", price: 3790, compare: 4390, stock: 4800, unit: "ks", flags: { featured: true, deal: true }, img: IMG.roofTiles },
  { slug: "hydrotes-folie-podstresni-n8", title: "HYDROTES fólie podstřešní N8 (K) — 75 m²", sub: "1,5×50 m • difuzně otevřená", cat: "strechy", brand: "HYDROTES", price: 76900, compare: 92900, stock: 64, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.roof },
  { slug: "ocelit-plech-trapezovy-t18", title: "OCELIT plech trapézový T18 — 2 m", sub: "0,5 mm • polyester RAL 8004", cat: "strechy", brand: "OCELIT", price: 41900, stock: 260, unit: "ks", flags: { new: true }, img: IMG.roof },
  { slug: "grunt-lat-stresni-40-60", title: "GRUNT lať střešní 40×60×4000 mm sušená", sub: "smrk • impregnovaná", cat: "strechy", brand: "GRUNT Mix", price: 11590, stock: 720, unit: "ks", img: IMG.timber },

  // ── Tepelné izolace (Termolan) ──
  { slug: "termolan-fasadni-desky-100", title: "Termolan fasádní desky EPS 70 F — 100 mm", sub: "1000×500 mm • 5 m²/bal.", cat: "tepelne-izolace", brand: "Termolan", price: 32900, compare: 39900, stock: 340, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.insulation },
  { slug: "termolan-mineralni-vata-160", title: "Termolan minerální vata UNI 160 mm", sub: "λ 0,035 • 3,05 m²/bal.", cat: "tepelne-izolace", brand: "Termolan", price: 54900, stock: 210, unit: "bal.", flags: { new: true }, img: IMG.attic },
  { slug: "termolan-pir-deska-80", title: "Termolan PIR deska ALU 80 mm", sub: "1200×600 mm • λ 0,022", cat: "tepelne-izolace", brand: "Termolan", price: 44900, compare: 52900, stock: 150, unit: "ks", flags: { deal: true }, img: IMG.house },
  { slug: "termolan-podlahovy-eps-50", title: "Termolan podlahový polystyren EPS 100 — 50 mm", sub: "1000×500 mm • 10 m²/bal.", cat: "tepelne-izolace", brand: "Termolan", price: 28900, stock: 420, unit: "bal.", img: IMG.floor },

  // ── Hydroizolace (HYDROTES) ──
  { slug: "hydrotes-pas-dekbit-v60", title: "HYDROTES asfaltový pás V60 S35 — 10 m²", sub: "role 10×1 m • skelná vložka", cat: "hydroizolace", brand: "HYDROTES", price: 84900, compare: 99900, stock: 96, unit: "role", flags: { featured: true, deal: true }, img: IMG.warehouse },
  { slug: "hydrotes-sterka-2k-20kg", title: "HYDROTES hydroizolační stěrka 2K — 20 kg", sub: "dvousložková • balkony a koupelny", cat: "hydroizolace", brand: "HYDROTES", price: 189000, stock: 44, unit: "bal.", flags: { new: true }, img: IMG.labWorker },
  { slug: "hydrotes-nopova-folie-8", title: "HYDROTES nopová fólie 8 mm — 1×20 m", sub: "HDPE • 400 g/m²", cat: "hydroizolace", brand: "HYDROTES", price: 79900, stock: 78, unit: "role", img: IMG.pipes },

  // ── Suchá výstavba ──
  { slug: "kvadrit-sadrokarton-rb-125", title: "KVADRIT deska sádrokartonová RB 12,5 mm", sub: "2000×1250 mm • bílá", cat: "sucha-vystavba", brand: "KVADRIT", price: 20690, compare: 24190, stock: 980, unit: "ks", flags: { featured: true, deal: true }, img: IMG.drywall },
  { slug: "ocelit-profil-cd-60-3m", title: "OCELIT profil CD 60×27 mm — 3 m", sub: "pozink • tl. 0,6 mm", cat: "sucha-vystavba", brand: "OCELIT", price: 5090, compare: 5990, stock: 2400, unit: "ks", flags: { featured: true }, img: IMG.drywall },
  { slug: "ocelit-profil-ud-28-3m", title: "OCELIT profil obvodový UD 28×27 mm — 3 m", sub: "pozink • tl. 0,6 mm", cat: "sucha-vystavba", brand: "OCELIT", price: 5190, stock: 1800, unit: "ks", img: IMG.drywall },
  { slug: "grunt-tmel-sadrovy-5kg", title: "GRUNT Mix tmel sádrový Finish — 5 kg", sub: "finální • brousitelný", cat: "sucha-vystavba", brand: "GRUNT Mix", price: 16900, stock: 310, unit: "bal.", flags: { new: true }, img: IMG.plaster },

  // ── Fasádní systémy (fasadin) ──
  { slug: "fasadin-omitka-silikonova-25", title: "fasadin omítka silikonová FO990 — 25 kg", sub: "zrno 1,5 mm • bílá", cat: "fasadni-systemy", brand: "fasadin", price: 129000, compare: 155000, stock: 88, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.facade },
  { slug: "fasadin-lepidlo-etics-25", title: "fasadin lepicí a stěrková hmota ETICS — 25 kg", sub: "na EPS i vatu", cat: "fasadni-systemy", brand: "fasadin", price: 18990, compare: 22900, stock: 520, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.plaster },
  { slug: "fasadin-perlinka-145", title: "fasadin sklotextilní síťovina 145 g — 55 m²", sub: "4×4 mm • role 1,1×50 m", cat: "fasadni-systemy", brand: "fasadin", price: 84900, stock: 130, unit: "role", img: IMG.facade },
  { slug: "termolan-hmozdinka-talirova", title: "Termolan talířová hmoždinka 10×160 — 100 ks", sub: "zatloukací • ocelový trn", cat: "fasadni-systemy", brand: "Termolan", price: 44900, stock: 240, unit: "bal.", flags: { new: true }, img: IMG.toolsWall },

  // ── Suché směsi (GRUNT Mix) ──
  { slug: "grunt-beton-c20-25", title: "GRUNT Mix beton C16/20 — 25 kg", sub: "zavlhlá směs • do 10 cm", cat: "suche-smesi", brand: "GRUNT Mix", price: 9790, compare: 11490, stock: 1600, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.mixer },
  { slug: "grunt-hmota-lepici-sterka-25", title: "GRUNT Mix lepicí a stěrková hmota W700 — 25 kg", sub: "flexibilní • mráz i interiér", cat: "suche-smesi", brand: "GRUNT Mix", price: 18790, compare: 22900, stock: 740, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.sand },
  { slug: "grunt-malta-zdici-25", title: "GRUNT Mix malta zdicí M10 — 25 kg", sub: "pro běžné zdění", cat: "suche-smesi", brand: "GRUNT Mix", price: 8290, stock: 1900, unit: "bal.", img: IMG.sand },
  { slug: "grunt-niveleta-20", title: "GRUNT Mix nivelační stěrka N20 — 25 kg", sub: "2–20 mm • samonivelační", cat: "podlahy-obklady", brand: "GRUNT Mix", price: 27900, stock: 380, unit: "bal.", flags: { new: true }, img: IMG.floor },
  { slug: "grunt-lepidlo-obklady-c2t", title: "GRUNT Mix lepidlo na obklady C2T — 25 kg", sub: "mrazuvzdorné • flexibilní", cat: "podlahy-obklady", brand: "GRUNT Mix", price: 21900, compare: 25900, stock: 460, unit: "bal.", flags: { deal: true }, img: IMG.tiles },

  // ── Elektromateriál (LUMEN+) ──
  { slug: "lumen-kabel-cyky-3x25", title: "LUMEN+ kabel CYKY-J 3×2,5 — 100 m", sub: "měď • pevný rozvod", cat: "kabely-vodice", brand: "LUMEN+", price: 219000, compare: 259000, stock: 58, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.cables },
  { slug: "lumen-jistic-b16", title: "LUMEN+ jistič 1P B16", sub: "10 kA • char. B", cat: "jistice-rozvadece", brand: "LUMEN+", price: 10900, stock: 640, unit: "ks", img: IMG.breaker },
  { slug: "lumen-zasuvka-ip44", title: "LUMEN+ zásuvka nástěnná IP44", sub: "bílá • s víčkem", cat: "vypinace-zasuvky", brand: "LUMEN+", price: 12900, stock: 380, unit: "ks", flags: { new: true }, img: IMG.breaker },
  { slug: "lumen-led-reflektor-50w", title: "LUMEN+ LED reflektor 50 W se senzorem", sub: "4000 K • IP65", cat: "osvetleni", brand: "LUMEN+", price: 54900, compare: 64900, stock: 140, unit: "ks", flags: { featured: true }, img: IMG.lamp },

  // ── Voda Topení Sanita (Akvaterm) ──
  { slug: "akvaterm-trubka-ppr-20", title: "Akvaterm trubka PPR PN20 20×3,4 — 4 m", sub: "studená i teplá voda", cat: "rozvody-vody", brand: "Akvaterm", price: 6590, stock: 890, unit: "ks", img: IMG.pipes },
  { slug: "akvaterm-podlahovka-deska", title: "Akvaterm systémová deska podlahového topení", sub: "1400×800 mm • nopová", cat: "topeni", brand: "Akvaterm", price: 32900, compare: 38900, stock: 260, unit: "ks", flags: { featured: true, deal: true }, img: IMG.heating },
  { slug: "akvaterm-radiator-22-600", title: "Akvaterm deskový radiátor 22K 600×1000", sub: "boční připojení • bílý", cat: "topeni", brand: "Akvaterm", price: 289000, stock: 46, unit: "ks", flags: { new: true }, img: IMG.interior },
  { slug: "akvaterm-sprchovy-zlab-80", title: "Akvaterm sprchový žlab 800 mm nerez", sub: "suchá klapka • rošt lines", cat: "sanita", brand: "Akvaterm", price: 219000, compare: 269000, stock: 34, unit: "ks", flags: { deal: true }, img: IMG.bathroom },
  { slug: "akvaterm-drenazni-trubka-100", title: "Akvaterm drenážní trubka DN100 — 50 m", sub: "perforovaná • s kokosem", cat: "odvodneni", brand: "Akvaterm", price: 169000, stock: 52, unit: "role", img: IMG.pipes },

  // ── Nářadí (OCELIT) ──
  { slug: "ocelit-aku-vrtacka-20v", title: "OCELIT aku vrtačka ProDrive 20 V — 2× aku", sub: "65 Nm • kufr + 2× 4 Ah", cat: "elektricke-naradi", brand: "OCELIT", price: 349000, compare: 429000, stock: 64, unit: "ks", flags: { featured: true, deal: true }, img: IMG.drill },
  { slug: "ocelit-uhlova-bruska-125", title: "OCELIT úhlová bruska 125 mm 1200 W", sub: "regulace otáček", cat: "elektricke-naradi", brand: "OCELIT", price: 149000, stock: 110, unit: "ks", flags: { new: true }, img: IMG.toolsWall },
  { slug: "ocelit-michadlo-1600", title: "OCELIT míchadlo stavebních směsí 1600 W", sub: "metla 140 mm • 2 rychlosti", cat: "elektricke-naradi", brand: "OCELIT", price: 219000, compare: 259000, stock: 42, unit: "ks", flags: { featured: true }, img: IMG.mixer },
  { slug: "ocelit-zednicka-lzice", title: "OCELIT zednická lžíce 180 mm", sub: "nerez • ergonomická rukojeť", cat: "rucni-naradi", brand: "OCELIT", price: 15900, stock: 520, unit: "ks", img: IMG.toolsWall },
  { slug: "ocelit-laser-krizovy", title: "OCELIT křížový laser GreenLine 30 m", sub: "zelený paprsek • ±0,3 mm/m", cat: "merici-technika", brand: "OCELIT", price: 259000, compare: 319000, stock: 38, unit: "ks", flags: { featured: true, new: true, deal: true }, img: IMG.measure },
  { slug: "ocelit-zebrik-3x9", title: "OCELIT žebřík hliníkový 3×9 příček", sub: "univerzální • do 150 kg", cat: "zebriky-leseni", brand: "OCELIT", price: 269000, stock: 56, unit: "ks", img: IMG.ladder },
  { slug: "ocelit-helma-profi", title: "OCELIT ochranná přilba Profi", sub: "EN 397 • račna", cat: "ochranne-pomucky", brand: "OCELIT", price: 34900, stock: 240, unit: "ks", flags: { new: true }, img: IMG.engineer },

  // ── Barvy a laky (fasadin) ──
  { slug: "fasadin-malirska-barva-15", title: "fasadin malířská barva Interiér Bílá — 15 kg", sub: "otěruvzdorná • 105 m²", cat: "interierove-barvy", brand: "fasadin", price: 79900, compare: 94900, stock: 180, unit: "bal.", flags: { featured: true, deal: true }, img: IMG.paintCans },
  { slug: "fasadin-fasadni-barva-silikon", title: "fasadin fasádní barva silikonová — 15 kg", sub: "samočisticí • bílá", cat: "fasadni-barvy", brand: "fasadin", price: 219000, stock: 76, unit: "bal.", flags: { new: true }, img: IMG.facade },
  { slug: "fasadin-lazura-tenkovrstva", title: "fasadin lazura tenkovrstvá ořech — 2,5 l", sub: "UV filtr • exteriér", cat: "laky-lazury", brand: "fasadin", price: 64900, stock: 130, unit: "ks", img: IMG.timber },
  { slug: "fasadin-valecek-sada", title: "fasadin malířský váleček 25 cm + mřížka", sub: "mikrovlákno • sada", cat: "malirske-potreby", brand: "fasadin", price: 18900, stock: 340, unit: "ks", img: IMG.paintCans },

  // ── Půjčovna (GRUNT Rent — cena za den) ──
  { slug: "rent-minibagr-18t", title: "Půjčovna: minibagr 1,8 t", sub: "hloubka 2,3 m • bez kauce", cat: "stavebni-stroje", brand: "GRUNT Rent", price: 249000, stock: 6, unit: "den", flags: { featured: true }, img: IMG.siteCrane },
  { slug: "rent-vibracni-deska-90", title: "Půjčovna: vibrační deska 90 kg", sub: "benzín • reverzní", cat: "vibracni-technika", brand: "GRUNT Rent", price: 89000, stock: 12, unit: "den", flags: { new: true }, img: IMG.workers },
  { slug: "rent-leseni-ram-100", title: "Půjčovna: rámové lešení 100 m²", sub: "vč. podlážek • týdenní sazba", cat: "leseni-pujcovna", brand: "GRUNT Rent", price: 690000, stock: 4, unit: "týden", img: IMG.scaffold },
  { slug: "rent-stavebni-vysavac", title: "Půjčovna: stavební vysavač M-třída", sub: "1400 W • mokro/sucho", cat: "uklid-stavby", brand: "GRUNT Rent", price: 59000, stock: 9, unit: "den", img: IMG.warehouse },

  // ── Výprodej ──
  { slug: "vyprodej-obklad-metro-bily", title: "Obklad Metro lesklý bílý 10×20 — doprodej", sub: "1. jakost • 19 m² skladem", cat: "vyprodej", brand: "KVADRIT", price: 24900, compare: 39900, stock: 19, unit: "m²", flags: { deal: true }, img: IMG.tiles },
  { slug: "vyprodej-dlazba-betonova-40", title: "Dlažba betonová 40×40 přírodní — doprodej", sub: "tl. 4 cm • 62 ks", cat: "vyprodej", brand: "KVADRIT", price: 6900, compare: 10900, stock: 62, unit: "ks", flags: { deal: true }, img: IMG.concrete },
  { slug: "vyprodej-barva-tonovana-vzornik", title: "fasadin barva tónovaná — vzorkové odstíny 5 kg", sub: "mix odstínů dle skladu", cat: "vyprodej", brand: "fasadin", price: 19900, compare: 34900, stock: 28, unit: "bal.", flags: { deal: true }, img: IMG.paintCans },
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
    const desc = `${p.title} (${p.sub}). Skladem na centrálním skladu i prodejnách — dnes objednáte, zítra vyzvednete nebo dovezeme vlastní flotilou s hydraulickou rukou. Odborné poradenství na zákaznické lince 704 123 456.`;
    const r = await client.query(
      `INSERT INTO products (tenant_id, slug, title, subtitle, description, brand, status, primary_category_id, options, flags)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9) RETURNING id`,
      [tenantId, p.slug, p.title, p.sub, desc, p.brand, catIds.get(p.cat),
       JSON.stringify([{ name: "Provedení", values: ["Standard"] }]),
       JSON.stringify({ ...(p.flags ?? {}), unit: p.unit ?? "ks" })]
    );
    const pid = r.rows[0].id;
    pc++;

    await link(pid, p.cat);
    const parent = CATEGORIES.find(x => x.slug === p.cat)?.parent;
    if (parent) await link(pid, parent);
    if (p.flags?.featured) await link(pid, "akce");
    if (p.flags?.new) await link(pid, "novinky");

    await client.query(
      `INSERT INTO product_images (tenant_id, product_id, url, alt, position) VALUES ($1,$2,$3,$4,0)`,
      [tenantId, pid, p.img, p.title]
    );

    const vr = await client.query(
      `INSERT INTO product_variants (tenant_id, product_id, sku, title, option_values, price_cents, compare_at_price_cents, stock_qty, is_default, position)
       VALUES ($1,$2,$3,'Standard',$4,$5,$6,$7,true,0) RETURNING id`,
      [tenantId, pid, `${p.slug.toUpperCase().slice(0, 40)}-0`, JSON.stringify({ "Provedení": "Standard" }), p.price, p.compare ?? null, p.stock]
    );
    vc++;
    await client.query(
      `INSERT INTO stock_movements (tenant_id, variant_id, delta, qty_after, reason, note)
       VALUES ($1,$2,$3,$4,'import','eshop-19 seed')`,
      [tenantId, vr.rows[0].id, p.stock, p.stock]
    );
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
