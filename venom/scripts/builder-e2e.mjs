/**
 * E2E test builderu „vlastní šablona od nuly".
 *
 * 1. Načte sekce blank tenanta z DB (navbar/hero/footer)
 * 2. Přes stejné API jako Studio přidá kurátorované sekce (about, services,
 *    stats, gallery, testimonials, faq, cta, contact) mezi hero a footer
 * 3. Nastaví náhodně zvolený design: deep-forest + amber, Playfair Display +
 *    Figtree, radius 14px — přes /design-tokens API (panel Design)
 * 4. Ověří public render: 200, texty sekcí, CSS proměnné s novými barvami
 */
import { readFileSync } from "fs";
import pg from "pg";

const SLUG = "builder-od-nuly";
const BASE = "http://localhost:3015";
const TOKEN = process.argv[2];
if (!TOKEN) { console.error("usage: node builder-e2e.mjs <accessToken>"); process.exit(1); }

const env = readFileSync("/Users/apple/DEV/CRM/venom/.env.local", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^"|"$/g, "");
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const t = (await client.query("SELECT id FROM tenants WHERE slug=$1", [SLUG])).rows[0];
const page = (await client.query("SELECT id FROM pages WHERE tenant_id=$1 AND is_homepage", [t.id])).rows[0];
const existing = (await client.query(
  "SELECT id, tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings FROM sections WHERE tenant_id=$1 AND page_id=$2 ORDER BY order_index",
  [t.id, page.id],
)).rows;
console.log("existing:", existing.map(s => `${s.id}:${s.section_type}/${s.section_variant}@${s.order_index}`).join(", "));

const HDRS = {
  "content-type": "application/json",
  origin: BASE,
  cookie: `webero_access_${SLUG}=${TOKEN}`,
};

// ── 1. Poskládej stránku: navbar, hero, [8 nových], footer ──────────────────
const navbar = existing.find(s => s.section_type === "navbar");
const hero = existing.find(s => s.section_type === "hero");
const footer = existing.find(s => s.section_type === "footer");

const NEW = [
  ["about", "two-col", { title: "Kdo jsme", body: "Rodinná pražírna kávy z Vysočiny. Pražíme v malých dávkách a rozvážíme do 48 hodin od upražení.", image: "" }],
  ["services", "cards-grid", { title: "Naše služby", items: [
    { title: "Výběrová káva", description: "Přímý výkup od farmářů z Etiopie a Kolumbie." },
    { title: "Předplatné", description: "Čerstvě pražená káva každý měsíc do schránky." },
    { title: "Kurzy baristiky", description: "Víkendové kurzy v naší pražírně." },
  ]}],
  ["stats", "default", { title: "Čísla, která nás těší", items: [
    { value: "12", label: "let pražíme" },
    { value: "480+", label: "odběratelů předplatného" },
    { value: "9", label: "farem, se kterými spolupracujeme" },
  ]}],
  ["gallery", "gallery-universal", { title: "Z pražírny", skin: "bento", images: [] }],
  ["testimonials", "default", { title: "Co říkají zákazníci", items: [
    { quote: "Nejlepší espresso blend, jaký jsem doma měl.", author: "Petr H." },
    { quote: "Předplatné funguje jak hodinky, káva vždy čerstvá.", author: "Jana K." },
  ]}],
  ["faq", "default", { title: "Časté dotazy", items: [
    { question: "Jak rychle kávu doručíte?", answer: "Do 48 hodin od upražení, obvykle druhý den." },
    { question: "Mělete kávu?", answer: "Ano, na přání zdarma dle vaší přípravy." },
  ]}],
  ["cta", "default", { title: "Ochutnejte rozdíl", subtitle: "První objednávka s 15% slevou.", ctaText: "Objednat kávu", ctaHref: "#kontakt" }],
  ["contact", "map-split", { title: "Kontakt", email: "ahoj@prazirna.cz", phone: "+420 777 123 456", address: "Nádražní 12, Žďár nad Sázavou" }],
];

const tempId = -1000;
const batch = [
  { ...navbar, order_index: 0 },
  { ...hero, order_index: 1 },
  ...NEW.map(([type, variant, content], i) => ({
    id: tempId - i, tenant_id: t.id, page_id: page.id,
    section_type: type, section_variant: variant,
    order_index: 2 + i, is_visible: true,
    settings: { content },
  })),
  { ...footer, order_index: 2 + NEW.length },
];

let res = await fetch(`${BASE}/api/demo/${SLUG}/sections`, { method: "PUT", headers: HDRS, body: JSON.stringify({ sections: batch }) });
console.log("PUT sections:", res.status, JSON.stringify(await res.json()).slice(0, 200));

// ── 2. Náhodný design (hozeno kostkou): deep forest + amber, serif nadpisy ──
const design = {
  colorPrimary: "#0E3B2E",
  colorSecondary: "#14532D",
  colorAccent: "#E8A13D",
  colorBackground: "#FAF7F2",
  colorSurface: "#F1EAE0",
  colorText: "#1C1917",
  colorTextMuted: "#6B6259",
  colorBorder: "#E2D9CC",
  fontHeading: "Playfair Display",
  fontBody: "Figtree",
  borderRadius: "14px",
  // pár rozšířených tokenů z panelu Design (tlačítka + hlavička)
  "btn.primary.bg": "#E8A13D",
  "btn.primary.color": "#1C1917",
  "header.bg": "#0E3B2E",
  "nav.color": "#FAF7F2",
  "h1.weight": "700",
};
res = await fetch(`${BASE}/api/demo/${SLUG}/design-tokens`, { method: "POST", headers: HDRS, body: JSON.stringify(design) });
console.log("POST design-tokens:", res.status, JSON.stringify(await res.json()).slice(0, 160));

// ── 3. Ověření public renderu ────────────────────────────────────────────────
res = await fetch(`${BASE}/demo/${SLUG}`);
const html = await res.text();
console.log("GET public:", res.status, "bytes:", html.length);
const checks = [
  ["hero", "Tady začíná váš nový web"],
  ["about", "Kdo jsme"],
  ["services", "Výběrová káva"],
  ["stats", "odběratelů předplatného"],
  ["gallery", "Z pražírny"],
  ["testimonials", "Nejlepší espresso blend"],
  ["faq", "Jak rychle kávu doručíte"],
  ["cta", "Ochutnejte rozdíl"],
  ["contact", "ahoj@prazirna.cz"],
  ["token: primary", "#0E3B2E"],
  ["token: accent", "#E8A13D"],
  ["token: font heading", "Playfair Display"],
  ["token: font body", "Figtree"],
  ["token: radius", "14px"],
];
let fail = 0;
for (const [name, needle] of checks) {
  const ok = html.includes(needle);
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${name}: "${needle}"`);
}

// ── 4. Editor (studio) se načte ──────────────────────────────────────────────
res = await fetch(`${BASE}/demo/${SLUG}/admin`, { headers: { cookie: HDRS.cookie } });
console.log(`${res.status === 200 ? "✅" : "❌"} studio admin: HTTP ${res.status}`);

// ── 5. Replace-variant PATCH (změna rozložení sekce in-place) ────────────────
const aboutRow = (await client.query(
  "SELECT id FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type='about' LIMIT 1", [t.id, page.id],
)).rows[0];
res = await fetch(`${BASE}/api/demo/${SLUG}/sections/${aboutRow.id}`, {
  method: "PATCH", headers: HDRS, body: JSON.stringify({ section_variant: "about-fyzio-02-features" }),
});
console.log(`${res.ok ? "✅" : "❌"} replace variant PATCH: HTTP ${res.status}`);
// vrať zpět
await fetch(`${BASE}/api/demo/${SLUG}/sections/${aboutRow.id}`, {
  method: "PATCH", headers: HDRS, body: JSON.stringify({ section_variant: "two-col" }),
});

await client.end();
console.log(fail === 0 ? "\n=== ALL CHECKS PASSED ===" : `\n=== ${fail} CHECKS FAILED ===`);
process.exit(fail === 0 ? 0 : 1);
