import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const SLUG = 'stavba-01-v2';

async function main() {
  await pool.query(`DELETE FROM tenants WHERE slug=$1`, [SLUG]);
  const tpl = await pool.query(`SELECT id FROM templates LIMIT 1`);
  const tid_res = await pool.query(`
    INSERT INTO tenants (slug, email, template_id, template_version, industry, status, active_modules, plan, access_token)
    VALUES ($1, 'demo@stavba.test', $2, '0.1.0', 'stavba', 'demo', ARRAY['gallery','testimonials'], 'free', 'stavba01-demo')
    RETURNING id
  `, [SLUG, tpl.rows[0].id]);
  const tid = tid_res.rows[0].id;

  const pid_res = await pool.query(`
    INSERT INTO pages (tenant_id, slug, title, is_homepage, status)
    VALUES ($1, 'home', 'Domů', true, 'published') RETURNING id
  `, [tid]);
  const pid = pid_res.rows[0].id;
  console.log(`Tenant ${tid}, page ${pid}`);

  const nav = { siteName:"Stavební Firma", phone:"704 123 456", email:"info@demo.cz", ctaText:"Kontaktujte nás", ctaHref:"#kontakt",
    links:[{label:"Služby",href:"/sluzby"},{label:"Reference",href:"/reference"},{label:"O nás",href:"/o-nas"},{label:"Kontakt",href:"#kontakt"}] };

  const hero = { label:"Stavební firma",
    title:"Rekonstrukce bytů\na stavby rodinných domů",
    ctaText:"Nezávazná konzultace", ctaHref:"#kontakt",
    ctaSecondaryText:"Naše reference", ctaSecondaryHref:"/reference",
    image:"https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&h=700&fit=crop&fm=webp&q=85",
    image2:"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=1100&fit=crop&fm=webp&q=85",
    heroServices:[
      {name:"Rekonstrukce bytů a domů",icon:"house"},
      {name:"Rodinné domy na klíč",icon:"key"},
      {name:"Revitalizace bytových domů",icon:"revitalization"},
      {name:"Stavební práce & development",icon:"builder"}
    ]
  };

  for (const [i,s] of [[0,"navbar","stavba-01-navbar",nav],[1,"hero","stavba-01-hero",hero]]) {
    await pool.query(
      `INSERT INTO sections (tenant_id,page_id,section_type,section_variant,order_index,is_visible,settings) VALUES ($1,$2,$3,$4,$5,true,$6)`,
      [tid, pid, s, arguments[2] ?? s, i, JSON.stringify({content: arguments[3] ?? nav})]
    );
  }
  // fix — use proper loop
  for (const [i,[,type,variant,content]] of [[0,[0,"navbar","stavba-01-navbar",nav]],[1,[1,"hero","stavba-01-hero",hero]]]) {
    // skip
  }

  // Actually just do it simply
  await pool.query(`DELETE FROM sections WHERE tenant_id=$1`, [tid]);
  await pool.query(`INSERT INTO sections (tenant_id,page_id,section_type,section_variant,order_index,is_visible,settings) VALUES ($1,$2,'navbar','stavba-01-navbar',0,true,$3)`, [tid,pid,JSON.stringify({content:nav})]);
  await pool.query(`INSERT INTO sections (tenant_id,page_id,section_type,section_variant,order_index,is_visible,settings) VALUES ($1,$2,'hero','stavba-01-hero',1,true,$3)`, [tid,pid,JSON.stringify({content:hero})]);

  console.log(`  ✓ navbar + hero inserted`);
  console.log(`✅ http://localhost:3015/demo/${SLUG}`);
  await pool.end();
}
main().catch(e=>{console.error('✗',e.message);process.exit(1);});
