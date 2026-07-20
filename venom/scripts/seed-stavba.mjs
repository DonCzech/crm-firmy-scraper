import pg from 'pg';

const DB = process.env.DATABASE_URL;
const SLUG = 'stavba-01-v2';
const pool = new pg.Pool({ connectionString: DB });

const navbar = {
  siteName: "Stavební Firma",
  logoUrl: "/templates/stavba-01/logo.svg",
  phone: "704 123 456",
  email: "info@demo.cz",
  ctaText: "Kontaktujte nás",
  ctaHref: "#kontakt",
  links: [
    { label: "Služby",     href: "/sluzby" },
    { label: "Reference",  href: "/reference" },
    { label: "O nás",      href: "/o-nas" },
    { label: "Kontakt",    href: "#kontakt" },
  ],
};

const hero = {
  label: "Stavební firma",
  title: "Rekonstrukce bytů\na stavby rodinných domů",
  ctaText: "Nezávazná konzultace",
  ctaHref: "#kontakt",
  ctaSecondaryText: "Naše reference",
  ctaSecondaryHref: "/reference",
  image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&h=700&fit=crop&fm=webp&q=85",
  image2: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=1100&fit=crop&fm=webp&q=85",
  heroServices: [
    { name: "Rekonstrukce bytů a domů",    icon: "house" },
    { name: "Rodinné domy na klíč",         icon: "key" },
    { name: "Revitalizace bytových domů",   icon: "revitalization" },
    { name: "Stavební práce & development", icon: "builder" },
  ],
};

const services = {
  id: "sluzby",
  tagline: "Co umíme",
  title: "Naše stavební\nslužby",
  items: [
    {
      name: "Rekonstrukce bytů",
      description: "Kompletní přestavba bytových jednotek od dispozičních změn přes nové rozvody až po finální povrchy. Výsledkem je moderní domov na míru vašim potřebám.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&fm=webp&q=85",
      ctaText: "Více o službě",
      ctaHref: "/sluzby",
    },
    {
      name: "Rekonstrukce rodinných domů",
      description: "Rozsáhlé renovace rodinných domů zahrnující střechy, fasády, interiéry i energetické úspory. Dílo předáme s tříletou zárukou.",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop&fm=webp&q=85",
      ctaText: "Více o službě",
      ctaHref: "/sluzby",
    },
    {
      name: "Rodinné domy na klíč",
      description: "Výstavba novostaveb rodinných domů od projektu až po předání klíčů. Pevný termín, transparentní cena, bez skrytých nákladů.",
      image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=600&h=400&fit=crop&fm=webp&q=85",
      ctaText: "Více o službě",
      ctaHref: "/sluzby",
    },
    {
      name: "Revitalizace bytových domů",
      description: "Zateplení, nová fasáda, oprava střechy a společných prostor pro bytová družstva a SVJ. Dotace z IROP a zelené bonusy.",
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop&fm=webp&q=85",
      ctaText: "Více o službě",
      ctaHref: "/sluzby",
    },
  ],
};

const about = {
  id: "o-nas",
  tagline: "Náš model spolupráce",
  title: "O vaši zakázku se\nstaráme 3 odborníci",
  body: "Ke každé zakázce přiřadíme tříčlenný tým: architekta, projektového manažera a stavbyvedoucího. Architekt navrhne dispozice a materiály, manažer koordinuje termíny a dodavatele, stavbyvedoucí dohlíží na kvalitu přímo na místě. Vy máte jedno kontaktní místo a průběžný přehled o postupu prací.",
  steps: [
    { number: "01", title: "Architekt",             desc: "Návrh dispozic, výběr materiálů, vizualizace" },
    { number: "02", title: "Projektový manažer",    desc: "Koordinace termínů, dodavatelů a rozpočtu" },
    { number: "03", title: "Stavbyvedoucí",         desc: "Dohled nad kvalitou a dodržením standardů přímo na stavbě" },
  ],
  ctaText: "Proč s námi?",
  ctaHref: "/o-nas",
  image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&fm=webp&q=85",
  stats: [
    { value: "850+",   label: "dokončených projektů" },
    { value: "14",     label: "let zkušeností" },
    { value: "3 roky", label: "prodloužená záruka" },
  ],
};

const testimonials = {
  id: "recenze",
  tagline: "Co říkají klienti",
  title: "Reference\nnaších zákazníků",
  rating: "4.9",
  reviewCount: "214",
  items: [
    { name: "Jan Novák",       role: "Rekonstrukce bytu 3+1, Praha 5",       stars: 5, text: "Rekonstrukci jsme jim svěřili v dost chaotickém stavu a výsledek předčil naše očekávání. Tým komunikoval na denní bázi, termín dodrželi na den přesně a předaný byt byl naprosto čistý." },
    { name: "Petra Svobodová", role: "Novostavba rodinného domu, Průhonice",  stars: 5, text: "Dům na klíč jsme zadali Stavební Firma po doporučení od sousedů. Projekt od návrhu po stěhování trval 11 měsíců — přesně jak slíbili. Cena odpovídala nabídce bez překvapení." },
    { name: "Tomáš Dvořák",    role: "Revitalizace bytového domu, Praha 4",   stars: 5, text: "Jako předseda SVJ jsem ocenil, že veškerá agenda šla přes jediného manažera. Zateplení, výměna výplní i oprava střechy proběhly v jedné sezoně. Dotace jsme dostali o 3 měsíce dříve, než jsme čekali." },
  ],
};

const cta = {
  id: "cta-konzultace",
  tagline: "Zdarma a nezávazně",
  title: "Zvažujete rekonstrukci?",
  subtitle: "Zavolejte nebo napište — rádi Vám poradíme s rozsahem, termíny i financováním vaší stavby.",
  ctaText: "Nezávazná konzultace",
  ctaHref: "#kontakt",
  ctaSecondaryText: "704 123 456",
  ctaSecondaryHref: "tel:+420704123456",
};

const gallery = {
  id: "reference",
  tagline: "Portfolio",
  title: "Naše reference",
  subtitle: "Ukázky dokončených rekonstrukcí a novostaveb",
  items: [
    { title: "Rekonstrukce bytu 4+1, Praha 2",    category: "Rekonstrukce bytů",  image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&fm=webp&q=85" },
    { title: "Rodinný dům na klíč, Říčany",       category: "Novostavby",         image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&fm=webp&q=85" },
    { title: "Rekonstrukce domu, Praha-západ",    category: "Rekonstrukce domů",  image: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&h=600&fit=crop&fm=webp&q=85" },
    { title: "Revitalizace BD, Praha 4",          category: "Revitalizace",       image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop&fm=webp&q=85" },
    { title: "Půdní vestavba, Praha 1",           category: "Rekonstrukce bytů",  image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&fm=webp&q=85" },
    { title: "Rodinný dům, Průhonice",            category: "Novostavby",         image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&h=600&fit=crop&fm=webp&q=85" },
  ],
};

const faq = {
  id: "faq",
  tagline: "Časté dotazy",
  title: "Odpovědi na\nčasté otázky",
  items: [
    { question: "Jak dlouho trvá rekonstrukce bytu?",          answer: "Standardní rekonstrukce bytu 2+1 trvá 6–10 týdnů v závislosti na rozsahu prací. Přesný harmonogram dostanete před zahájením, termín dodávky je smluvně závazný." },
    { question: "Jaká je záruka na stavební práce?",            answer: "Na veškeré stavební práce poskytujeme 3letou záruku — dvojnásobek zákonného minima. Na zabudované materiály platí záruky výrobce." },
    { question: "Zvládnete financování nebo pomoc s dotacemi?", answer: "Ano — spolupracujeme s finančními poradci a máme zkušenosti s dotacemi IROP, Zelená úsporám i komunitními programy. Provedeme vás celým procesem." },
    { question: "Zajišťujete také architektonický návrh?",      answer: "Součástí každé zakázky je návrh od interního architekta. Pokud preferujete vlastního architekta, rádi spolupracujeme — pouze koordinujeme technické provedení." },
    { question: "Jak probíhá cenová nabídka?",                  answer: "Po úvodní bezplatné konzultaci zpracujeme podrobný itemizovaný rozpočet do 5 pracovních dní. Nabídka je fixní — výsledná cena neobsahuje skryté položky." },
  ],
};

const contact = {
  id: "kontakt",
  tagline: "Napište nebo zavolejte",
  title: "Domluvme si\nkonzultaci",
  address: "Ukázková 123, 110 00 Praha 1",
  phone: "704 123 456",
  email: "info@demo.cz",
  hours: "Po–Pá 8:00–17:00",
  mapEmbedUrl: "",
};

const footer = {
  siteName: "Stavební Firma",
  logoUrl: "/templates/stavba-01/logo-light.svg",
  tagline: "Rekonstrukce bytů a stavby rodinných domů",
  email: "info@demo.cz",
  phone: "704 123 456",
  address: "Ukázková 123\n110 00 Praha 1",
  companyName: "Demo Studio s.r.o.",
  ico: "12345678",
  dic: "CZ12345678",
  links: [
    { label: "Služby",    href: "/sluzby" },
    { label: "Reference", href: "/reference" },
    { label: "O nás",     href: "/o-nas" },
    { label: "Kontakt",   href: "#kontakt" },
  ],
  socialFacebook: "https://facebook.com/demo",
  socialInstagram: "https://instagram.com/demo",
};

const SECTIONS = [
  { type: "navbar",       variant: "stavba-01-navbar",       content: navbar },
  { type: "hero",         variant: "stavba-01-hero",         content: hero },
  { type: "services",     variant: "stavba-01-services",     content: services },
  { type: "about",        variant: "stavba-01-about",        content: about },
  { type: "testimonials", variant: "stavba-01-testimonials", content: testimonials },
  { type: "cta",          variant: "stavba-01-cta",          content: cta },
  { type: "gallery",      variant: "stavba-01-gallery",      content: gallery },
  { type: "faq",          variant: "stavba-01-faq",          content: faq },
  { type: "contact",      variant: "stavba-01-contact",      content: contact },
  { type: "footer",       variant: "stavba-01-footer",       content: footer },
];

async function main() {
  await pool.query(`DELETE FROM tenants WHERE slug=$1`, [SLUG]);
  const tplRes = await pool.query(`SELECT id FROM templates LIMIT 1`);
  const templateId = tplRes.rows[0].id;

  const tenantRes = await pool.query(`
    INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token)
    VALUES ($1, 'demo@stavba.test', $2, '0.1.0', 'stavba', 'demo', ARRAY['gallery','testimonials'], 'free', 'stavba01-demo')
    RETURNING id
  `, [SLUG, templateId]);
  const tenantId = tenantRes.rows[0].id;

  const pageRes = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, status)
    VALUES ($1, 'home', 'Domů', true, 'published') RETURNING id
  `, [tenantId]);
  const pageId = pageRes.rows[0].id;

  console.log(`Tenant ${tenantId}, page ${pageId}`);

  for (let i = 0; i < SECTIONS.length; i++) {
    const { type, variant, content } = SECTIONS[i];
    await pool.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings)
       VALUES ($1, $2, $3, $4, $5, true, $6)`,
      [tenantId, pageId, type, variant, i, JSON.stringify({ content })]
    );
    console.log(`  ✓ ${variant}`);
  }

  console.log(`\n✅ http://localhost:3015/demo/${SLUG}`);
  await pool.end();
}

main().catch(e => { console.error('✗', e.message); process.exit(1); });
