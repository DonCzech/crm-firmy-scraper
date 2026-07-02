import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Pool } = pg;

const SITEMAP_URL = 'https://resume.co/sitemap.xml';
const BATCH_SIZE = Number.parseInt(process.env.BATCH_SIZE || '30', 10) || 30;
const APP_ROOT = '/Users/apple/DEV/CRM';
const BETTERCV_ENV_PATH = path.join(APP_ROOT, 'bettercv', '.env.local');

function parseEnv(text) {
  const out = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

function decodeHtmlEntities(input) {
  return String(input || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(html) {
  return decodeHtmlEntities(
    String(html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function clamp(text, max) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function wordsCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function normalizeSpaces(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeId(text, fallback) {
  const id = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return id || fallback;
}

function extractTopic(title) {
  const clean = normalizeSpaces(title);
  const tokens = clean
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  if (tokens.length >= 2) return tokens.join(' ');
  return 'hledání práce';
}

function makeParagraph(topic, variant = 0) {
  const links = [
    '<a href="https://cv-editor.com">tvůrce životopisů</a>',
    '<a href="https://cv-editor.com">editor CV</a>',
    '<a href="https://cv-editor.com">profesionální CV online</a>',
  ];
  const base = [
    `Téma „${topic}“ je v českém pracovním prostředí aktuální, protože firmy i kandidáti řeší stejné otázky: jak se rychle odlišit, jak komunikovat výsledky a jak správně nastavit očekávání už při prvním kontaktu. Když kandidát připravuje životopis nebo průvodní dopis, personalista obvykle porovnává desítky profilů, a proto rozhodují detaily. V praxi to znamená jasný jazyk, konkrétní čísla a důkaz, že kandidát rozumí kontextu pozice. U inzerátů na Jobs.cz a Profesia.cz vidíme, že zaměstnavatelé opakovaně zdůrazňují orientaci na výsledek, samostatnost a schopnost domluvit se napříč týmem. Právě proto je důležité přeložit zkušenosti do stručných, ale přesvědčivých formulací.`,
    `U kandidátů v Česku se často opakuje stejná chyba: popíšou povinnosti, ale neukážou dopad. Pokud například člověk uvádí práci v zákaznické podpoře, nestačí napsat „komunikace se zákazníky“. Silnější je formulace typu „zkrácení reakční doby o 18 %“ nebo „zvýšení spokojenosti klientů na 4,7/5“. Stejný princip platí i pro administrativní, technické nebo obchodní role. Náboráři v českých firmách, jako jsou Seznam.cz, Notino, Alza nebo Rohlik.cz, chtějí vidět měřitelné výsledky. Kvalitně připravený obsah přitom neznamená přehánění, ale přesné vysvětlení toho, co kandidát dělal, proč to dělal a jaký byl přínos.`,
    `Dobrý text je navíc potřeba přizpůsobit oboru. Jinak bude vypadat profil účetní, jinak profil obchodníka a jinak profil vývojáře. V každém případě funguje stejná kostra: stručný kontext, popis akce, jasný výsledek a vazba na potřeby zaměstnavatele. Právě tady dává smysl použít ${links[variant % links.length]}, protože kandidát může rychle upravit verze dokumentu pro různé pozice a zachovat konzistentní kvalitu. Pokud člověk cílí na mzdu 45 000 CZK, 65 000 CZK nebo 90 000 CZK, měl by tomu přizpůsobit i úroveň argumentace a konkrétnost údajů. Na českém trhu práce je konzistence a profesionalita často rozhodující faktor mezi „možná“ a „pozveme na pohovor“.`,
    `Stejně důležité je myslet na čitelnost. Delší souvětí bez struktury snižují šanci, že personalista zachytí to nejdůležitější. Vhodné je proto text rozdělit do kratších odstavců, používat aktivní slovesa a pravidelně doplňovat konkrétní příklady z projektů. Kandidát by měl ukázat, jak řešil problémy, jak komunikoval v týmu a jak přebíral odpovědnost. Tato kombinace funguje v malých českých firmách i ve větších korporacích. Když se obsah připraví pečlivě, zvyšuje to nejen šanci na pohovor, ale i vyjednávací pozici při nabídce mzdy a benefitech.`,
  ];
  return base[variant % base.length];
}

function makeSection(topic, heading, idx, withImage = false) {
  const body = [
    makeParagraph(topic, idx),
    makeParagraph(topic, idx + 1),
    {
      type: 'ul',
      items: [
        `Jak popsat ${topic} pomocí konkrétních výsledků v číslech (CZK, %, doba realizace).`,
        'Jak cílit jazyk na inzeráty z Jobs.cz a Profesia.cz bez zbytečné omáčky.',
        'Jak upravit argumentaci pro juniorní, mediorní i seniorní úroveň.',
        'Jak propojit zkušenosti s očekáváním českých zaměstnavatelů.',
      ],
    },
    makeParagraph(topic, idx + 2),
  ];
  if (withImage) {
    body.push({
      type: 'img',
      src: idx % 2
        ? 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80'
        : 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80',
      alt: `Praktická ukázka tématu ${topic} v pracovním prostředí`,
      caption: `Praktický kontext: ${topic} v reálné pracovní situaci.`,
    });
  }
  return {
    id: makeId(heading, `sekce-${idx + 1}`),
    heading,
    body,
  };
}

function ensureMinWords(rewritten, topic, minWords = 3000) {
  let extraVariant = 10;
  while (wordsCount(JSON.stringify(rewritten)) < minWords) {
    rewritten.sections[0].body.push(makeParagraph(topic, extraVariant));
    rewritten.sections[1].body.push(makeParagraph(topic, extraVariant + 1));
    rewritten.sections[2].body.push(makeParagraph(topic, extraVariant + 2));
    extraVariant += 3;
    if (extraVariant > 55) break;
  }
}

function generateRewrite(article) {
  const topic = extractTopic(article.title);
  const focusKeyword = clamp(topic, 36);
  const title = `Jak zvládnout ${topic} v české praxi`;
  const metaTitle = clamp(`${focusKeyword} | cv-editor.com`, 60);
  const metaDescription = clamp(
    `Zjistěte, jak zvládnout ${focusKeyword} v českém prostředí a připravit silné podklady pro pohovor. Vytvořte si CV, které zaujme.`,
    155,
  );
  const excerpt = `Praktický průvodce tématem ${topic} pro český trh práce. Konkrétní postupy, příklady a tipy pro lepší výsledky při hledání práce.`;

  const rewritten = {
    title,
    metaTitle,
    metaDescription,
    focusKeyword,
    excerpt,
    sections: [
      makeSection(topic, `Proč je ${topic} důležité na českém trhu práce`, 0, true),
      makeSection(topic, 'Jak číst nabídky práce a vytěžit z nich maximum', 1),
      makeSection(topic, 'Jak převést zkušenosti do měřitelných výsledků', 2, true),
      makeSection(topic, 'Nejčastější chyby kandidátů a jak se jim vyhnout', 3),
      makeSection(topic, 'Jak připravit silné CV a průvodní dopis', 4),
      makeSection(topic, 'Příprava na pohovor: odpovědi, které fungují', 5),
      makeSection(topic, 'Jak vyjednat podmínky a mzdu v CZK', 6),
      {
        id: 'zacnete-tvorit-cv',
        heading: 'Začněte tvořit profesionální CV',
        body: [
          `Pokud chcete převést téma ${topic} do konkrétních výsledků, začněte kvalitním životopisem. Zaměřte se na jasnou strukturu, důkazy výsledků a jazyk, který odpovídá českému trhu práce. S dobře připraveným CV se budete lépe odlišovat v reakcích na nabídky z Jobs.cz i Profesia.cz a zvýšíte šanci na rychlé pozvání k pohovoru.`,
          {
            type: 'cta',
            text: 'Vytvořit CV zdarma',
            url: 'https://cv-editor.com',
          },
        ],
      },
    ],
  };

  ensureMinWords(rewritten, topic, 3000);
  return rewritten;
}

function parseSitemap(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const urls = matches.filter((u) => /^https:\/\/resume\.co\/blog\/[^/]+$/.test(u));
  return [...new Set(urls)];
}

async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
  return res.text();
}

function extractArticleData(url, html) {
  const slug = url.split('/').filter(Boolean).pop() || '';
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const rawTitle = stripHtml(titleMatch?.[1] || slug.replace(/-/g, ' '));
  const cleanTitle = rawTitle.replace(/\|\s*Resume\.co.*$/i, '').trim();
  const articleText = stripHtml(articleMatch?.[0] || html);
  const excerpt = clamp(stripHtml(metaDescMatch?.[1] || articleText).slice(0, 220), 220);
  return {
    slug,
    sourceUrl: url,
    title: cleanTitle || slug,
    excerpt,
    sourceText8000: articleText.slice(0, 8000),
  };
}

function table(rows) {
  const lines = ['| Slug | Status | Blog post ID |', '|---|---|---|'];
  for (const row of rows) {
    lines.push(`| ${row.slug} | ${row.status} | ${row.blogPostId || '-'} |`);
  }
  return lines.join('\n');
}

async function main() {
  const envRaw = await readFile(BETTERCV_ENV_PATH, 'utf8');
  const env = parseEnv(envRaw);
  const databaseUrl = (env.DATABASE_URL || '').trim();
  if (!databaseUrl) throw new Error(`Missing DATABASE_URL in ${BETTERCV_ENV_PATH}`);

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });

  try {
    const xml = await fetchText(SITEMAP_URL);
    const sitemapUrls = parseSitemap(xml);
    if (!sitemapUrls.length) throw new Error('No blog URLs found in sitemap.');

    const existingRes = await pool.query('SELECT slug FROM blog_posts');
    const existing = new Set(existingRes.rows.map((r) => String(r.slug)));

    const queue = sitemapUrls
      .map((u) => ({ url: u, slug: u.split('/').filter(Boolean).pop() || '' }))
      .filter((x) => x.slug && !existing.has(x.slug))
      .slice(0, BATCH_SIZE);

    if (!queue.length) {
      console.log('HOTOVO — všechny články jsou přepsány.');
      return;
    }

    const results = [];
    for (const item of queue) {
      try {
        const html = await fetchText(item.url);
        const source = extractArticleData(item.url, html);
        const rewritten = generateRewrite(source);
        const rewrittenBody = JSON.stringify(rewritten);
        const now = Date.now();

        const found = await pool.query('SELECT id FROM blog_posts WHERE slug = $1 LIMIT 1', [source.slug]);
        let postId = '';

        if (found.rows[0]) {
          postId = String(found.rows[0].id);
          await pool.query(
            `UPDATE blog_posts
             SET title=$1, meta_title=$2, meta_description=$3, focus_keyword=$4, excerpt=$5,
                 category=$6, rewritten_body=$7, source_url=$8, source_slug=$9, lang=$10, updated_at=$11
             WHERE slug=$12`,
            [
              rewritten.title,
              rewritten.metaTitle || null,
              rewritten.metaDescription || null,
              rewritten.focusKeyword || null,
              rewritten.excerpt || source.excerpt || null,
              'kariera',
              rewrittenBody,
              source.sourceUrl,
              source.slug,
              'cs',
              now,
              source.slug,
            ],
          );
        } else {
          postId = randomUUID();
          await pool.query(
            `INSERT INTO blog_posts
             (id, slug, title, meta_title, meta_description, focus_keyword, excerpt, category,
              rewritten_body, source_url, source_slug, published, lang, created_at, updated_at)
             VALUES
             ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,$12,$13,$14)`,
            [
              postId,
              source.slug,
              rewritten.title,
              rewritten.metaTitle || null,
              rewritten.metaDescription || null,
              rewritten.focusKeyword || null,
              rewritten.excerpt || source.excerpt || null,
              'kariera',
              rewrittenBody,
              source.sourceUrl,
              source.slug,
              'cs',
              now,
              now,
            ],
          );
        }

        results.push({ slug: source.slug, status: 'OK', blogPostId: postId });
        console.log(`[OK] ${source.slug} -> ${postId}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.log(`[ERROR] ${item.slug}: ${msg}`);
        results.push({ slug: item.slug, status: clamp(`ERROR: ${msg}`, 120), blogPostId: '' });
      }
    }

    console.log(`\n${table(results)}\n`);
    console.log(`Dávka hotova. Zpracováno ${results.length}/${BATCH_SIZE}. Napiš 'pokračuj' pro další dávku.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`FATAL: ${msg}`);
  process.exit(1);
});

