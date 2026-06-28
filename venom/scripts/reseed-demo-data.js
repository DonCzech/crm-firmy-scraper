/**
 * Reseed all existing demo tenants with updated content from templates.
 * Fixes content structure bugs and adds missing sections (navbar, footer, about, gallery, team, etc.)
 */

const { Pool } = require("pg");

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_RG6Q7owUlpXr@ep-still-recipe-alrqcrzd-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

// ── Template data (mirrors TypeScript templates) ──────────────────────────────

const TEMPLATES = {
  barber: {
    designTokens: {
      colorPrimary: "#C9A84C", colorSecondary: "#1A1A1A", colorBackground: "#111111",
      colorSurface: "#1E1E1E", colorText: "#F5F5F5", colorTextMuted: "#A0A0A0",
      colorAccent: "#C9A84C", colorBorder: "#2A2A2A",
      fontHeading: "Playfair Display, serif", fontBody: "Inter, sans-serif",
      borderRadius: "4px", spacing: "normal",
    },
    sections: [
      { type: "navbar", variant: "default", order: 0, visible: true },
      { type: "hero", variant: "hero-luxury-dark", order: 1, visible: true },
      { type: "services", variant: "pricing-list", order: 2, visible: true },
      { type: "gallery", variant: "masonry", order: 3, visible: true },
      { type: "testimonials", variant: "slider", order: 4, visible: true },
      { type: "team", variant: "cards-grid", order: 5, visible: true },
      { type: "rezora-cta", variant: "default", order: 6, visible: true },
      { type: "opening-hours", variant: "default", order: 7, visible: true },
      { type: "contact", variant: "map-split", order: 8, visible: true },
      { type: "footer", variant: "default", order: 9, visible: true },
    ],
    content: {
      navbar: {
        siteName: "Barber Studio",
        links: [
          { label: "Ceník", href: "#cenik" },
          { label: "Galerie", href: "#galerie" },
          { label: "Tým", href: "#tym" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        ctaText: "Rezervovat",
        ctaHref: "#rezervace",
      },
      hero: {
        title: "Váš styl,\nnáš um.",
        subtitle: "Luxusní barber studio v srdci Prahy. Přijďte zažít péči, která mění den.",
        ctaText: "Rezervovat termín",
        ctaHref: "#rezervace",
        backgroundImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&auto=format&fit=crop&q=80",
      },
      services: {
        services: [
          { name: "Střih vlasů", description: "Profesionální střih přizpůsobený vašemu obličeji a stylu", price: "450 Kč", duration: "45 min" },
          { name: "Holení břitvou", description: "Tradiční holení s horkým ručníkem a masáží obličeje", price: "350 Kč", duration: "30 min" },
          { name: "Úprava vousů", description: "Tvarování, střih a styling vousů včetně ošetření", price: "300 Kč", duration: "25 min" },
          { name: "Kompletní péče", description: "Střih + holení + styling + péče — premium balíček", price: "750 Kč", duration: "90 min" },
          { name: "Dětský střih", description: "Střih pro nejmenší klienty do 15 let", price: "280 Kč", duration: "30 min" },
          { name: "Barvení + střih", description: "Profesionální barvení nebo melíry + střih", price: "1 200 Kč", duration: "120 min" },
        ],
      },
      gallery: {
        title: "Naše práce",
        images: [
          { url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80", alt: "Profesionální střih vlasů" },
          { url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&auto=format&fit=crop&q=80", alt: "Barber při práci" },
          { url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80", alt: "Úprava střihu" },
          { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80", alt: "Interiér barber studia" },
          { url: "https://images.unsplash.com/photo-1570872626485-d8ffea69f463?w=600&auto=format&fit=crop&q=80", alt: "Holení a péče o vousy" },
          { url: "https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=600&auto=format&fit=crop&q=80", alt: "Barber křeslo" },
        ],
      },
      testimonials: {
        testimonials: [
          { name: "Tomáš N.", text: "Nejlepší barber v Praze. Přesně ví, co chci — výsledek je vždy dokonalý. Chodím sem každé 3 týdny.", rating: 5 },
          { name: "Martin K.", text: "Skvělá atmosféra, profesionální přístup, precizní práce. Konečně barber, kterému věřím.", rating: 5 },
          { name: "Pavel H.", text: "Holení břitvou je tady zážitek sám o sobě. Teplý ručník, masáž — naprostá dokonalost.", rating: 5 },
          { name: "Jakub R.", text: "2 roky jsem hledal dobrého barbera. Tady jsem doma. Chodím každý měsíc a jsem vždy spokojený.", rating: 5 },
        ],
      },
      team: {
        title: "Náš tým",
        subtitle: "Zkušení barbeři s vášní pro řemeslo",
        members: [
          { name: "Tomáš Krejčí", role: "Master Barber & Zakladatel", bio: "15 let zkušeností, školení v Londýně a Barceloně.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&auto=format&fit=crop&q=80" },
          { name: "David Novák", role: "Senior Barber", bio: "Specialista na tradiční holení břitvou a úpravu vousů. 8 let praxe.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&auto=format&fit=crop&q=80" },
          { name: "Marek Šimánek", role: "Barber & Stylista", bio: "Expert na moderní střihy, barvení a men's grooming trendy.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&auto=format&fit=crop&q=80" },
        ],
      },
      "rezora-cta": {
        title: "Rezervujte si termín online",
        subtitle: "Vyberte si čas, který vám vyhovuje. Rezervace je nezávazná a trvá jen minutu.",
        ctaText: "Rezervovat online",
        ctaHref: "#kontakt",
        bookingEnabled: false,
      },
      "opening-hours": {
        openingHours: [
          { day: "Pondělí – Pátek", hours: "9:00 – 20:00" },
          { day: "Sobota", hours: "9:00 – 16:00" },
          { day: "Neděle", hours: "Zavřeno" },
        ],
      },
      contact: {
        address: "Václavské náměstí 1, Praha 1",
        phone: "+420 777 123 456",
        email: "info@barberstudio.cz",
      },
      footer: {
        siteName: "Barber Studio Praha",
        tagline: "Profesionální péče o váš styl od roku 2015",
        links: [
          { label: "Ceník", href: "#cenik" },
          { label: "Galerie", href: "#galerie" },
          { label: "Tým", href: "#tym" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        phone: "+420 777 123 456",
        email: "info@barberstudio.cz",
        address: "Václavské náměstí 1, Praha 1",
      },
    },
  },

  wellness: {
    designTokens: {
      colorPrimary: "#7B9E87", colorSecondary: "#4A4A4A", colorBackground: "#FAFAF7",
      colorSurface: "#F0EDE8", colorText: "#2C2C2C", colorTextMuted: "#6B6B6B",
      colorAccent: "#C4956A", colorBorder: "#E0D9D0",
      fontHeading: "Cormorant Garamond, serif", fontBody: "Lato, sans-serif",
      borderRadius: "12px", spacing: "relaxed",
    },
    sections: [
      { type: "navbar", variant: "default", order: 0, visible: true },
      { type: "hero", variant: "hero-split-image", order: 1, visible: true },
      { type: "about", variant: "two-col", order: 2, visible: true },
      { type: "services", variant: "cards-grid", order: 3, visible: true },
      { type: "gallery", variant: "grid", order: 4, visible: true },
      { type: "testimonials", variant: "static-cards", order: 5, visible: true },
      { type: "faq", variant: "accordion", order: 6, visible: true },
      { type: "rezora-cta", variant: "soft", order: 7, visible: true },
      { type: "contact", variant: "default", order: 8, visible: true },
      { type: "footer", variant: "default", order: 9, visible: true },
    ],
    content: {
      navbar: {
        siteName: "Wellness Studio Klára",
        links: [
          { label: "O nás", href: "#o-nas" },
          { label: "Procedury", href: "#procedury" },
          { label: "Galerie", href: "#galerie" },
          { label: "FAQ", href: "#faq" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        ctaText: "Zarezervovat",
        ctaHref: "#rezervace",
      },
      hero: {
        title: "Najděte\nsvůj klid.",
        subtitle: "Profesionální wellness studio v Praze. Masáže, terapie a péče o tělo i mysl na jednom místě.",
        ctaText: "Zarezervovat proceduru",
        ctaHref: "#rezervace",
        backgroundImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=80",
      },
      about: {
        title: "Péče o tělo\ni mysl",
        body: "Wellness Studio Klára vzniklo z přesvědčení, že každý člověk potřebuje prostor pro skutečný odpočinek. Za 8 let praxe jsme vytvořili místo, kde se čas zastaví a vy se soustředíte jen na sebe. Naše terapeutky prošly profesionálním školením v Česku i zahraničí.",
        highlight: "Více než 2 000 spokojených klientů. Vracejí se znovu a znovu.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
      },
      services: {
        services: [
          { name: "Relaxační masáž", description: "Celotělová masáž pro uvolnění stresu a napětí v těle.", price: "890 Kč", duration: "60 min" },
          { name: "Lymfatická masáž", description: "Detoxikace organismu a podpora imunity jemnou technikou.", price: "1 100 Kč", duration: "75 min" },
          { name: "Horké kameny", description: "Hluboká relaxace s lávovými kameny na klíčové body těla.", price: "1 300 Kč", duration: "90 min" },
          { name: "Terapeutická masáž", description: "Cílená práce s napětím, bolestí zad a šíje.", price: "990 Kč", duration: "60 min" },
          { name: "Aromaterapie", description: "Masáž s esenciálními oleji pro hlubokou relaxaci těla i mysli.", price: "1 050 Kč", duration: "70 min" },
          { name: "Balíček pro dva", description: "Párová masáž — ideální dárek nebo společný zážitek.", price: "1 750 Kč", duration: "60 min" },
        ],
      },
      gallery: {
        title: "Naše studio",
        images: [
          { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80", alt: "Relaxační prostředí" },
          { url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&auto=format&fit=crop&q=80", alt: "Masáž zad" },
          { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80", alt: "Wellness procedura" },
          { url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80", alt: "Prostředí studia" },
          { url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop&q=80", alt: "Relaxační masáž" },
          { url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&auto=format&fit=crop&q=80", alt: "Péče o tělo" },
        ],
      },
      testimonials: {
        testimonials: [
          { name: "Jana M.", text: "Absolutní klid a pohoda. Terapeutka přesně věděla, kde mám napětí. Vracím se každý měsíc.", rating: 5 },
          { name: "Lucie K.", text: "Profesionální přístup, nádherné prostředí a masáž, která trvá ještě hodiny po odchodu. Doporučuji!", rating: 5 },
          { name: "Eva T.", text: "Horké kameny byly úžasné. Nikdy jsem takhle neodpočívala. Balíček pro dva s přítelem byl perfektní tip.", rating: 5 },
          { name: "Petra B.", text: "Lymfatická masáž mi pomohla s otoky. Výsledky jsou vidět. Klára ví, co dělá. Skvělá.", rating: 5 },
        ],
      },
      faq: {
        faq: [
          { question: "Jak se připravit na masáž?", answer: "Doporučujeme přijít 5–10 minut před termínem. Nejíst těžká jídla 2 hodiny před procedurou a vzít si pohodlné oblečení. Po masáži pijte dostatek vody." },
          { question: "Mohu přijít s bolestí zad?", answer: "Ano, informujte nás předem o svém stavu. Naše terapeutky proceduru přizpůsobí vašim potřebám. V akutní fázi bolesti doporučujeme nejprve konzultaci s lékařem." },
          { question: "Jak dlouho dopředu se rezervuje?", answer: "Ideálně 2–3 dny předem. V případě urgentní potřeby se nám ozvěte telefonicky — aktuální volné termíny uvidíte online." },
          { question: "Vydáváte dárkové poukazy?", answer: "Ano! Dárkový poukaz vydáme na jakoukoli proceduru nebo libovolnou částku. Platnost je 6 měsíců. Objednejte osobně nebo emailem." },
          { question: "Jak rušit rezervaci?", answer: "Rezervaci lze zrušit nejpozději 24 hodin před termínem bez poplatku. Pozdější zrušení nebo nedostavení se je zpoplatněno 50 % hodnoty procedury." },
        ],
      },
      "rezora-cta": {
        title: "Nechte se hýčkat",
        subtitle: "Vyberte si termín, který vám vyhovuje. Rezervace online nebo telefonicky — vždy bez závazků.",
        ctaText: "Zarezervovat proceduru",
        ctaHref: "#kontakt",
        bookingEnabled: false,
      },
      contact: {
        address: "Mánesova 15, Praha 2",
        phone: "+420 776 456 789",
        email: "info@wellness-klara.cz",
      },
      footer: {
        siteName: "Wellness Studio Klára",
        tagline: "Prostor pro vaši duši i tělo",
        links: [
          { label: "O nás", href: "#o-nas" },
          { label: "Procedury", href: "#procedury" },
          { label: "FAQ", href: "#faq" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        phone: "+420 776 456 789",
        email: "info@wellness-klara.cz",
        address: "Mánesova 15, Praha 2",
      },
    },
  },

  lawyer: {
    designTokens: {
      colorPrimary: "#1B3A6B", colorSecondary: "#2C2C2C", colorBackground: "#FFFFFF",
      colorSurface: "#F4F6F9", colorText: "#1A1A1A", colorTextMuted: "#5A5A5A",
      colorAccent: "#C8A96E", colorBorder: "#DDE1E7",
      fontHeading: "Merriweather, serif", fontBody: "Source Sans Pro, sans-serif",
      borderRadius: "4px", spacing: "normal",
    },
    sections: [
      { type: "navbar", variant: "default", order: 0, visible: true },
      { type: "hero", variant: "hero-centered", order: 1, visible: true },
      { type: "about", variant: "professional", order: 2, visible: true },
      { type: "services", variant: "icon-grid", order: 3, visible: true },
      { type: "testimonials", variant: "static-cards", order: 4, visible: true },
      { type: "faq", variant: "accordion", order: 5, visible: true },
      { type: "cta", variant: "consultation", order: 6, visible: true },
      { type: "contact", variant: "form-split", order: 7, visible: true },
      { type: "footer", variant: "default", order: 8, visible: true },
    ],
    content: {
      navbar: {
        siteName: "Mgr. Novák — Advokát",
        links: [
          { label: "O mně", href: "#o-mne" },
          { label: "Specializace", href: "#specializace" },
          { label: "Reference", href: "#reference" },
          { label: "FAQ", href: "#faq" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        ctaText: "Sjednat konzultaci",
        ctaHref: "#kontakt",
      },
      hero: {
        title: "Právní pomoc,\nna které záleží.",
        subtitle: "Profesionální advokátní kancelář v Praze. Obchodní, pracovní a rodinné právo. 12 let zkušeností.",
        ctaText: "Sjednat konzultaci",
        ctaHref: "#kontakt",
        backgroundImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&auto=format&fit=crop&q=80",
      },
      about: {
        title: "Mgr. Jan Novák\n— Váš advokát",
        body: "Advokacii se věnuji více než 12 let. Pracoval jsem v přední pražské advokátní kanceláři, než jsem se rozhodl poskytovat klientům individuálnější přístup. Každý případ řeším osobně — s maximálním nasazením a transparentní komunikací.",
        image: "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=800&auto=format&fit=crop&q=80",
        values: [
          { icon: "⚖️", title: "Odbornost", text: "12 let praxe v obchodním, pracovním a rodinném právu." },
          { icon: "🤝", title: "Důvěra", text: "Transparentní honoráře, jasná komunikace, žádná překvapení." },
          { icon: "⏱️", title: "Dostupnost", text: "Reagujeme do 24 hodin. Urgentní věci řešíme ihned." },
        ],
      },
      services: {
        services: [
          { name: "Obchodní právo", description: "Smlouvy, zakládání a přeměny firem, vymáhání pohledávek a obchodní spory.", icon: "briefcase" },
          { name: "Pracovní právo", description: "Pracovní smlouvy, výpovědi, DPP/DPČ, spory se zaměstnavatelem či zaměstnancem.", icon: "users" },
          { name: "Rodinné právo", description: "Rozvody, úprava péče o děti, výživné a majetkové vypořádání manželů.", icon: "home" },
          { name: "Nemovitosti", description: "Kupní smlouvy, převody nemovitostí, věcná břemena a pronájem.", icon: "building" },
        ],
      },
      testimonials: {
        testimonials: [
          { name: "Roman B.", text: "Skvělý advokát. Náš firemní spor vyřešil rychle, profesionálně a za rozumné peníze. Vřele doporučuji.", rating: 5 },
          { name: "Petra V.", text: "Precizní práce, vždy dostupný, výborná komunikace. Advokát, který vše vysvětlí srozumitelně.", rating: 5 },
          { name: "Jakub S.", text: "Pomohl mi s pracovněprávním sporem — výsledek předčil očekávání. Profesionál ve všech směrech.", rating: 5 },
        ],
      },
      faq: {
        faq: [
          { question: "Jak probíhá první konzultace?", answer: "První konzultace trvá 30–60 minut. Probereme váš případ, zodpovíme dotazy a navrhneme konkrétní postup. Konzultace je zpoplatněna dle hodinové sazby." },
          { question: "Jak účtujete honoráře?", answer: "Pracujeme na hodinové sazbě nebo smluvním paušálu — vždy dohodnutém předem. Transparentnost je pro nás základ." },
          { question: "Jak rychle mi odpovíte?", answer: "Na urgentní záležitosti reagujeme do 24 hodin. Standardní dotazy zodpovíme do 2 pracovních dnů." },
          { question: "Pracujete i mimo Prahu?", answer: "Ano, zastupujeme klienty po celé České republice. Mnoho věcí lze efektivně vyřídit online nebo telefonicky." },
          { question: "Jaké dokumenty přinést na první schůzku?", answer: "Přineste vše, co se k vašemu případu vztahuje — smlouvy, korespondenci, rozhodnutí soudů. Čím více informací, tím přesnější bude naše analýza." },
        ],
      },
      cta: {
        title: "Řešíte právní problém?",
        subtitle: "Neztrácejte čas. Včasná konzultace s advokátem vám může ušetřit roky sporů a nemalé peníze.",
        ctaText: "Sjednat konzultaci",
        ctaHref: "#kontakt",
      },
      contact: {
        address: "Politických vězňů 12, Praha 1",
        phone: "+420 775 987 654",
        email: "novak@advokat-novak.cz",
      },
      footer: {
        siteName: "Mgr. Jan Novák — Advokát",
        tagline: "Profesionální právní poradenství v Praze",
        links: [
          { label: "O mně", href: "#o-mne" },
          { label: "Specializace", href: "#specializace" },
          { label: "Reference", href: "#reference" },
          { label: "Kontakt", href: "#kontakt" },
        ],
        phone: "+420 775 987 654",
        email: "novak@advokat-novak.cz",
        address: "Politických vězňů 12, Praha 1",
      },
    },
  },
};

// ── Migration ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting demo data reseed...\n");

  // Get all tenants with their template keys
  const { rows: tenants } = await pool.query(`
    SELECT t.id, t.slug, t.industry, tmp.key AS template_key
    FROM tenants t
    LEFT JOIN templates tmp ON tmp.id = t.template_id
    ORDER BY t.id
  `);

  console.log(`Found ${tenants.length} tenants\n`);

  for (const tenant of tenants) {
    const tpl = TEMPLATES[tenant.template_key];
    if (!tpl) {
      console.log(`  [SKIP] ${tenant.slug} — unknown template: ${tenant.template_key}`);
      continue;
    }

    console.log(`Processing: ${tenant.slug} (${tenant.template_key})`);

    // Get the homepage
    const { rows: pages } = await pool.query(
      "SELECT id FROM pages WHERE tenant_id = $1 AND is_homepage = true LIMIT 1",
      [tenant.id]
    );
    if (!pages.length) {
      console.log(`  [SKIP] No homepage found`);
      continue;
    }
    const pageId = pages[0].id;

    // Delete all existing sections for this page (full reseed)
    await pool.query(
      "DELETE FROM sections WHERE tenant_id = $1 AND page_id = $2",
      [tenant.id, pageId]
    );

    // Insert fresh sections with correct content
    for (const section of tpl.sections) {
      const content = tpl.content[section.type] ?? {};
      await pool.query(
        `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          tenant.id,
          pageId,
          section.type,
          section.variant,
          section.order,
          section.visible,
          JSON.stringify({ content, designTokens: tpl.designTokens }),
        ]
      );
    }

    console.log(`  ✓ Reseeded ${tpl.sections.length} sections`);
  }

  console.log("\nDone.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
