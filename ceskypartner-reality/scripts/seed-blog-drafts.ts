/**
 * Evergreen blog drafty — vloží 5 článků jako DRAFT (v adminu zkontrolovat,
 * upravit a publikovat). Spuštění: npx tsx scripts/seed-blog-drafts.ts
 * Existující slugy přeskakuje, takže je bezpečné pouštět opakovaně.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const p = (...paras: string[]) => paras.map((x) => `<p>${x}</p>`).join("\n");
const h2 = (text: string) => `<h2>${text}</h2>`;

const ARTICLES = [
  {
    title: "Jak probíhá prodej bytu krok za krokem",
    slug: "jak-probiha-prodej-bytu-krok-za-krokem",
    excerpt: "Od odhadu ceny přes inzerci a prohlídky až po předání klíčů. Kompletní průvodce prodejem bytu v roce 2026 — s časovou osou a nejčastějšími chybami.",
    tags: ["prodej", "průvodce"],
    content:
      p("Prodej bytu trvá v průměru šest až deset týdnů — pokud víte, co děláte. Tady je celý proces krok za krokem, včetně věcí, o kterých se v inzerátech nemluví.") +
      h2("1. Odhad tržní ceny") +
      p("Základ všeho. Cena postavená na přání („soused prodal za...“) byt spolehlivě zablokuje na inzertních portálech na měsíce. Profesionální odhad vychází z reálně uzavřených obchodů v okolí, stavu bytu a aktuální poptávky. U nás je <a href=\"/odhad-nemovitosti\">odhad zdarma</a>.") +
      h2("2. Příprava nemovitosti a dokumentace") +
      p("List vlastnictví, prohlášení vlastníka, PENB, vyúčtování služeb. Zároveň home staging — uklizený, neutrálně zařízený byt se prodává rychleji a dráž. Profesionální fotografie nejsou luxus, ale nutnost: inzerát s fotkami z mobilu ztrácí polovinu zájemců.") +
      h2("3. Inzerce a prohlídky") +
      p("Exkluzivní zastoupení znamená jednu cenu všude a jednoho makléře, který zná odpověď na každou otázku. Prohlídky koncentrujeme do bloků — vytváří to zdravý konkurenční tlak mezi zájemci.") +
      h2("4. Rezervace, kupní smlouva, úschova") +
      p("Vážný zájemce podepisuje rezervační smlouvu a skládá rezervační zálohu. Kupní cena jde do advokátní úschovy — prodávající je chráněn, kupující také. Návrh na vklad do katastru podáváme my.") +
      h2("5. Předání") +
      p("Po zápisu v katastru (obvykle 20 dní) předáváme byt s protokolem: stavy měřidel, klíče, převody energií. Tím to pro vás končí — a pro nového majitele začíná."),
  },
  {
    title: "Daně při prodeji nemovitosti: co vás čeká v roce 2026",
    slug: "dane-pri-prodeji-nemovitosti-2026",
    excerpt: "Kdy je prodej osvobozen od daně z příjmu, jak funguje časový test a na co si dát pozor u družstevních bytů a dědictví.",
    tags: ["daně", "prodej"],
    content:
      p("Daň z nabytí nemovitosti byla zrušena, ale daň z příjmu při prodeji zůstává. Dobrá zpráva: ve většině případů se jí legálně vyhnete. Rozhoduje takzvaný časový test.") +
      h2("Časový test 10 let") +
      p("Pokud nemovitost vlastníte déle než 10 let (u nemovitostí nabytých do konce roku 2020 platí 5 let), je příjem z prodeje od daně osvobozen. Lhůta se počítá od zápisu do katastru.") +
      h2("Výjimka: bydliště") +
      p("Bydleli jste v nemovitosti alespoň 2 roky bezprostředně před prodejem? Pak jste osvobozeni bez ohledu na dobu vlastnictví. A pokud jste bydleli kratší dobu, ale peníze použijete na obstarání vlastní bytové potřeby, osvobození platí také — nově je ale nutné to oznámit finančnímu úřadu.") +
      h2("Dědictví a darování") +
      p("U zděděných nemovitostí se do časového testu započítává i doba vlastnictví zůstavitele v přímé linii. U darů je situace složitější — poradíme konkrétně, jde o rozdíl v řádech statisíců.") +
      p("<em>Tento článek je obecný přehled, ne daňové poradenství. Před prodejem konkrétní situaci vždy konzultujte — v rámci našich služeb daňovou konzultaci zajistíme.</em>"),
  },
  {
    title: "Osobní vs. družstevní vlastnictví: rozdíly, které rozhodují",
    slug: "osobni-vs-druzstevni-vlastnictvi",
    excerpt: "Družstevní byt bývá o 10–20 % levnější než stejný byt v osobním vlastnictví. Kdy se vyplatí a jaká má omezení u hypotéky a pronájmu?",
    tags: ["průvodce", "koupě"],
    content:
      p("V inzerátech na to narazíte hned: „OV“ a „DV“. Rozdíl není formalita — ovlivňuje cenu, financování i to, co s bytem smíte dělat.") +
      h2("Co vlastně kupujete") +
      p("V osobním vlastnictví kupujete byt jako nemovitost zapsanou v katastru. U družstevního bytu kupujete podíl v bytovém družstvu s právem nájmu konkrétního bytu — byt patří družstvu.") +
      h2("Financování") +
      p("Na družstevní podíl nelze vystavit klasickou hypotéku se zástavou kupovaného bytu. Řeší se to předhypotečním úvěrem, zástavou jiné nemovitosti, nebo úvěrem ze stavebního spoření. Pokud má družstvo v plánu převod do OV, banky bývají vstřícnější.") +
      h2("Pronájem a úpravy") +
      p("Podnájem družstevního bytu obvykle vyžaduje souhlas družstva a někdy poplatek. Stavební úpravy také. V osobním vlastnictví jste omezeni jen stanovami SVJ a stavebním zákonem.") +
      h2("Kdy družstevní byt dává smysl") +
      p("Když kupujete za hotové, plánujete v bytě bydlet a cena je výrazně pod srovnatelným OV — anebo když je na dohled převod do osobního vlastnictví. Anuita a stav družstva se ale musí prověřit vždy; to je přesně práce pro nás."),
  },
  {
    title: "Hypotéka v roce 2026: sazby, LTV a jak se připravit",
    slug: "hypoteka-2026-sazby-ltv-priprava",
    excerpt: "Co znamená LTV a DSTI, kolik potřebujete vlastních zdrojů a čím si řeknete o lepší sazbu. Praktický průvodce financováním nemovitosti.",
    tags: ["hypotéka", "financování"],
    content:
      p("Sazby hypoték se drží kolem 4,5–5 % p.a. a banky opět soutěží o klienty. Kdo přijde připravený, dokáže vyjednat výrazně lepší podmínky.") +
      h2("Kolik vlastních zdrojů potřebujete") +
      p("Banky standardně půjčují do 80 % hodnoty nemovitosti (LTV), žadatelé do 36 let dosáhnou na 90 %. U bytu za 8 milionů tedy počítejte s 800 tisíci až 1,6 milionu vlastních prostředků — plus rezerva na vybavení a stěhování.") +
      h2("Co banka posuzuje") +
      p("Čisté příjmy, závazky (i kreditní karty a kontokorenty!), věk a hodnotu zastavované nemovitosti. Ukazatel DSTI říká, že splátky všech úvěrů by neměly přesáhnout zhruba polovinu čistého příjmu.") +
      h2("Jak si říct o lepší sazbu") +
      p("Porovnat nabídky více bank (rozdíl 0,3 % = statisíce za dobu splácení), sjednat si pojištění či účet u banky výměnou za slevu, a načasovat fixaci. Náš hypoteční specialista tohle dělá denně — <strong>porovnání připravíme zdarma</strong> ke každé nemovitosti z nabídky; kalkulačku najdete přímo v detailu inzerátu."),
  },
  {
    title: "Proč exkluzivní zastoupení prodá nemovitost dráž",
    slug: "proc-exkluzivni-zastoupeni-proda-draz",
    excerpt: "Inzerát u pěti kanceláří najednou vypadá jako víc šancí. Ve skutečnosti sráží cenu. Vysvětlujeme, proč exkluzivita funguje v zájmu prodávajícího.",
    tags: ["prodej", "exkluzivita"],
    content:
      p("„Dám to všem kancelářím, ať se snaží.“ Zní to logicky — a je to nejdražší chyba, kterou může prodávající udělat.") +
      h2("Stejný byt, pět cen") +
      p("Každá kancelář nasadí trochu jinou cenu a jiné fotky. Kupující vidí tentýž byt pětkrát a vyhodnotí ho jako problémový. První otázka zájemce pak nezní „kdy se můžu nastěhovat“, ale „proč to nikdo nechce koupit“. Vyjednávací pozice prodávajícího se hroutí.") +
      h2("Nikdo do toho nic nedá") +
      p("Kancelář bez exkluzivity nezaplatí profesionální fotografie, home staging ani placenou propagaci — investice by se jí nemusela vrátit. Výsledek: pět polovičatých inzerátů místo jedné špičkové prezentace.") +
      h2("Jak vypadá exkluzivita u nás") +
      p("Časově omezená smlouva (žádný doživotní závazek), garance konkrétních kroků: profesionální fotografie a video, 3D prohlídka, inzerce na desítkách portálů s jednotnou cenou, prohlídky s makléřem, který byt skutečně zná, a pravidelný report. Výsledky vidíte <a href=\"/prodano\">v našich referencích</a>."),
  },
];

async function main() {
  const author = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!author) {
    console.error("Žádný uživatel v DB — nejdřív spusťte základní seed.");
    process.exit(1);
  }
  let created = 0;
  for (const article of ARTICLES) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: article.slug } });
    if (exists) {
      console.log(`— přeskočeno (existuje): ${article.slug}`);
      continue;
    }
    await prisma.blogPost.create({
      data: { ...article, status: "DRAFT", authorId: author.id },
    });
    created++;
    console.log(`✓ vytvořen draft: ${article.title}`);
  }
  console.log(`Hotovo — ${created} nových draftů. Zkontrolujte a publikujte v adminu → Blog.`);
}

main().finally(() => prisma.$disconnect());
