/** Naplní popisky (description) všem kategoriím tenanta eshop-01-v2 — Alza-style SEO texty. */
import { Pool } from "pg";
import { readFileSync } from "fs";

for (const line of readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TENANT_ID = 1275;

const DESC: Record<string, string> = {
  novinky: "Čerstvě naskladněné produkty napříč celým sortimentem. Buďte první, kdo vyzkouší nejnovější elektroniku, módu i vybavení do domácnosti — novinky přidáváme každý týden.",
  akce: "Slevy až 45 % na vybrané produkty skladem. Akční nabídka platí do vyprodání zásob — u každého produktu vidíte původní cenu i výši slevy, žádné hvězdičky a podmínky pod čarou.",
  elektronika: "Notebooky, mobilní telefony, sluchátka, tablety i chytré hodinky od prověřených značek jako Apple, Samsung, Sony či Lenovo. Všechny produkty skladem s expedicí do 24 hodin, zárukou 24 měsíců a odborným poradenstvím zdarma.",
  notebooky: "Notebooky pro práci, studium i hraní — od lehkých ultrabooků po výkonné pracovní stroje. Vybírejte podle úhlopříčky, procesoru nebo výdrže baterie; s výběrem rádi poradíme.",
  mobily: "Mobilní telefony od vlajkových modelů po dostupné smartphony. Ke každému telefonu nabízíme ochranné sklo a pouzdro se slevou, starý telefon od vás vykoupíme.",
  sluchatka: "Bezdrátová sluchátka, špunty s ANC i studiové modely. Porovnejte výdrž baterie, aktivní potlačení hluku a kvalitu mikrofonů — testujeme každý model, který prodáváme.",
  tablety: "Tablety pro zábavu, práci i kreslení. iPady, Samsung Galaxy Tab i dostupné modely pro děti, včetně klávesnic, stylusů a obalů.",
  "prislusenstvi-el": "Nabíječky, kabely, powerbanky, USB-C huby a další příslušenství, bez kterého se moderní elektronika neobejde. Certifikované produkty s plnou kompatibilitou.",
  "chytre-hodinky": "Chytré hodinky a fitness náramky pro sport, zdraví i notifikace. Měření tepu, spánku, GPS a výdrž, na kterou se můžete spolehnout.",
  obleceni: "Pánská, dámská i dětská móda od základních kousků po prémiové kolekce. Trička, mikiny, bundy a kalhoty v kompletní velikostní řadě — vrácení do 30 dnů zdarma, výměna velikosti bez poplatku.",
  panske: "Pánská móda od basic triček po zimní parky. Střihy, které sedí, materiály, které vydrží — a velikosti od S po 3XL skladem.",
  damske: "Dámská kolekce pro každou příležitost — od pohodlných kousků na doma po elegantní outfity do práce. Nové modely přidáváme každou sezónu.",
  detske: "Dětské oblečení, které přežije hřiště i pračku. Certifikované materiály bez škodlivých látek, veselé barvy a ceny, ze kterých rodiče nezčervenají.",
  tricka: "Trička a polokošile z kvalitní bavlny — jednobarevná basic trička, oversized střihy i piqué polokošile. Gramáže od 160 do 240 g/m².",
  mikiny: "Mikiny a svetry na chladnější dny. S kapucí, na zip i pletené modely z merino vlny — vrstvěte podle počasí.",
  bundy: "Bundy a kabáty do každého počasí — lehké přechodové, nepromokavé i péřové parky do −20 °C. Vodní sloupec a zateplení uvádíme u každého modelu.",
  kalhoty: "Kalhoty a džíny, které opravdu sedí. Slim, regular i relaxed střihy, strečové materiály a kompletní tabulka rozměrů u každého modelu.",
  boty: "Tenisky, polobotky, sandály i zimní obuv — pro město, kancelář i hory. Pravé velikosti bez překvapení, výměna za jinou velikost zdarma a doprava od 1 500 Kč zdarma.",
  tenisky: "Tenisky na každý den i pro sběratele. Klasické silueta, běžecké modely do města a limitované edice — vše originál s dokladem o pravosti.",
  polobotky: "Kožené polobotky a elegantní obuv do práce i na společenské akce. Kůže, která si sedne, a podrážky, které vydrží roky.",
  sandaly: "Sandály a pantofle na léto — od trekových sandálů po domácí pantofle. Anatomicky tvarované stélky pro celodenní pohodlí.",
  "zimni-boty": "Zimní obuv s membránou a zateplením — sněhule, kotníkové boty i celokožené zimní polobotky. Protiskluzové podrážky testované na náledí.",
  sport: "Vybavení pro fitness, běh, cyklistiku, outdoor i jógu. Od činek po trekové boty — vše od značek, kterým věří profesionálové, s odborným poradenstvím a expedicí do 24 hodin.",
  fitness: "Činky, kettlebelly, odporové gumy a vybavení domácí posilovny. Litinové nádobí s trvanlivým povrchem a protiskluzové podložky.",
  cyklistika: "Cyklistické vybavení a příslušenství — přilby, světla, zámky, brašny i oblečení. Bezpečnost a komfort na prvním místě.",
  beh: "Běžecké vybavení od bot s carbonovou deskou po reflexní bundy. Poradíme s výběrem podle došlapu, kilometráže i povrchu.",
  outdoor: "Outdoorové a turistické vybavení — batohy, stany, trekové hole a boty s membránou. Vybavení testované v horách, ne v kanceláři.",
  joga: "Podložky, bloky, popruhy a oblečení na jógu a pilates. Protiskluzové povrchy, přírodní materiály a barvy, které uklidní.",
  domacnost: "Vše pro útulný domov — kuchyňské vybavení, textil, dekorace, svíčky i osvětlení. Kvalitní materiály, nadčasový design a ceny bez přirážky za hezký obal.",
  "svicky-vune": "Sójové svíčky, difuzéry a interiérové vůně. Doba hoření až 60 hodin, přírodní vosky a vůně namíchané ve Francii.",
  textil: "Povlečení, deky, ručníky a bytový textil z bavlny, lnu a bambusu. Certifikace OEKO-TEX a gramáže, které vydrží léta praní.",
  kuchyne: "Kuchyňské vybavení od pánví po kvalitní nože. Nádobí, které používají kuchaři, za ceny pro domácí vaření.",
  dekorace: "Vázy, rámečky, zrcadla a dekorace, které dají interiéru charakter. Kurátorovaný výběr — žádný kýč, jen kousky, které dávají smysl.",
  osvetleni: "Stolní lampy, stojací svítidla i LED pásky. Teplota světla, stmívání a design, který ladí s moderním interiérem.",
  kosmetika: "Péče o pleť, vlasová kosmetika, parfémy i BIO produkty. Originální produkty od ověřených distributorů, dárkové balení zdarma a vzorky ke každé objednávce.",
  "pece-o-plet": "Krémy, séra, masky a čisticí péče pro každý typ pleti. Složení bez kompromisů — INCI seznam a klíčové ingredience uvádíme u každého produktu.",
  "vlasova-kosmetika": "Šampony, kondicionéry a stylingová péče pro všechny typy vlasů. Profesionální značky ze salonů za internetové ceny.",
  parfemy: "Dámské i pánské parfémy od niche značek po klasiky. 100% originály s garancí pravosti — žádné tester přebaly.",
  "bio-eko": "Certifikovaná přírodní a BIO kosmetika. Bez parabenů, silikonů a zbytečné chemie — s certifikáty COSMOS a Ecocert.",
  knihy: "Knihy, diáře, zápisníky a kancelářské potřeby. Bestsellery i knižní klenoty, papírnictví, které dělá radost — zabalíme i jako dárek.",
  zahrada: "Zahradní nářadí, závlaha, květináče a vše pro pěstitele. Od balkonových truhlíků po chytrou WiFi závlahu — poradíme začátečníkům i zkušeným zahrádkářům.",
  potraviny: "Výběrová káva, čaje, čokoláda, vína a superpotraviny. Delikatesy od malých pražíren a vinařství, čerstvost garantujeme datem pražení i šarží.",
  "kava-caj": "Výběrová zrnková káva s datem pražení a sypané čaje z prémiových plantáží. Od světlého pražení pro filtr po tmavé espresso směsi.",
  cokolada: "Bean-to-bar čokolády, pralinky a sladké dárky. Vysoký podíl kakaa, férový původ bobů a chutě, které v supermarketu nenajdete.",
  vino: "Vína z českých i světových vinařství a výběrové likéry. Každé víno v nabídce prošlo naší degustací — kupujete jen to, co nám samotným chutná.",
  superpotraviny: "Superpotraviny, ořechová másla a zdravé mlsání. Chia, matcha, spirulina i proteinové snacky — vše s čistým složením.",
};

async function main() {
  let updated = 0;
  for (const [slug, description] of Object.entries(DESC)) {
    const r = await pool.query(
      `UPDATE product_categories SET description=$1 WHERE tenant_id=$2 AND slug=$3`,
      [description, TENANT_ID, slug]
    );
    if (r.rowCount) updated++;
    else console.log(`⚠️ nenalezeno: ${slug}`);
  }
  console.log(`Aktualizováno ${updated}/${Object.keys(DESC).length} kategorií.`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
