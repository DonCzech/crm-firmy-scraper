import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim();
const c = new pg.Client({ connectionString: url }); await c.connect();
const t = await c.query("SELECT id FROM tenants WHERE slug='barber-01'");
const tid = t.rows[0].id;

// Subpage hero: switch to slim "hero-barber-page" variant + sensible page title
const subpages = [
  { slug: "o-nas",   title: "O nás",   breadcrumb: "Domů" },
  { slug: "sluzby",  title: "Služby",  breadcrumb: "Domů" },
  { slug: "galerie", title: "Galerie", breadcrumb: "Domů" },
  { slug: "kontakt", title: "Kontakt", breadcrumb: "Domů" },
];

for (const sp of subpages) {
  const p = await c.query("SELECT id FROM pages WHERE tenant_id=$1 AND slug=$2", [tid, sp.slug]);
  if (!p.rows.length) continue;
  const pid = p.rows[0].id;

  // Update hero section if present, OR insert new hero at top
  const heroRow = await c.query("SELECT id, section_variant, content_overrides FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type='hero'", [tid, pid]);
  if (heroRow.rows.length) {
    const ov = heroRow.rows[0].content_overrides || {};
    ov.title = sp.title;
    ov.breadcrumb = sp.breadcrumb;
    ov.breadcrumbHref = "/";
    ov.backgroundImage = "/images/barber-01/hero.webp";
    // remove duplicate-ish fields from old hero-centered
    delete ov.subtitle;
    delete ov.ctaText;
    delete ov.ctaHref;
    delete ov.ctaSecondaryText;
    delete ov.ctaSecondaryHref;
    delete ov.eyebrow;
    await c.query("UPDATE sections SET section_variant='hero-barber-page', content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), heroRow.rows[0].id]);
    console.log(`updated hero on /${sp.slug} -> hero-barber-page (${sp.title})`);
  } else {
    // /kontakt has no hero — insert one
    const nextOrder = -1; // put at top: lower than any existing order
    await c.query("UPDATE sections SET order_index = order_index + 1 WHERE tenant_id=$1 AND page_id=$2", [tid, pid]);
    await c.query(
      `INSERT INTO sections (tenant_id, page_id, section_type, section_variant, order_index, is_visible, settings, content_overrides, content_source)
       VALUES ($1,$2,'hero','hero-barber-page',0,true,'{}'::jsonb,$3::jsonb,'v2')`,
      [tid, pid, JSON.stringify({ title: sp.title, breadcrumb: sp.breadcrumb, breadcrumbHref: "/", backgroundImage: "/images/barber-01/hero.webp" })]
    );
    console.log(`inserted slim hero on /${sp.slug}`);
  }
}

// /sluzby — change services H2 to avoid duplicate with banner "Služby"
// Banner says "Služby", services section title can be more specific
{
  const p = await c.query("SELECT id FROM pages WHERE tenant_id=$1 AND slug='sluzby'", [tid]);
  if (p.rows.length) {
    const s = await c.query("SELECT id, content_overrides FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type='services'", [tid, p.rows[0].id]);
    for (const row of s.rows) {
      const ov = row.content_overrides || {};
      ov.title    = "Ceník služeb";
      ov.eyebrow  = ov.eyebrow  ?? "Klasika & precizní řemeslo";
      ov.subtitle = ov.subtitle ?? "Každý zákrok provádíme s důrazem na detail, čisté linie a péči o váš osobní styl. Ceny jsou konečné, bez skrytých poplatků.";
      ov.footnote = ov.footnote ?? "Ceny jsou orientační — finální cena závisí na délce vlasů a vousů. Rezervace minimálně 24h předem.";
      ov.ctaText  = ov.ctaText  ?? "Rezervovat termín";
      ov.ctaHref  = ov.ctaHref  ?? "/kontakt";
      await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
      console.log("aligned /sluzby services section");
    }
  }
}

// /galerie — gallery section title
{
  const p = await c.query("SELECT id FROM pages WHERE tenant_id=$1 AND slug='galerie'", [tid]);
  if (p.rows.length) {
    const s = await c.query("SELECT id, content_overrides FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type='gallery'", [tid, p.rows[0].id]);
    for (const row of s.rows) {
      const ov = row.content_overrides || {};
      ov.title    = "Naše práce";
      ov.eyebrow  = ov.eyebrow  ?? "Naše portfolio";
      ov.subtitle = ov.subtitle ?? "Vyberte si z naší galerie střihů, holení a finálního stylingu — každá fotka je skutečný klient ze studia v Brně.";
      await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
      console.log("aligned /galerie gallery section");
    }
  }
}

// /o-nas — about section keep its own title
{
  const p = await c.query("SELECT id FROM pages WHERE tenant_id=$1 AND slug='o-nas'", [tid]);
  if (p.rows.length) {
    const s = await c.query("SELECT id, section_type, content_overrides FROM sections WHERE tenant_id=$1 AND page_id=$2 AND section_type IN ('about','team')", [tid, p.rows[0].id]);
    for (const row of s.rows) {
      const ov = row.content_overrides || {};
      if (row.section_type === 'team') {
        ov.title = "Náš tým";
        ov.subtitle = "Každý z nás žije tímto řemeslem";
      }
      await c.query("UPDATE sections SET content_overrides=$1::jsonb, updated_at=now() WHERE id=$2", [JSON.stringify(ov), row.id]);
    }
    console.log("aligned /o-nas team section");
  }
}

await c.end();
console.log("done");
