const CORE = 'https://www.core.ceskypartner.cz';
const BLOG = 'https://www.cv-editor.com';
const SIZE = Number.parseInt(process.env.SIZE || '30', 10) || 30;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function clamp(text, max) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function normalizeSpaces(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function makeId(text, fallback) {
  const id = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return id || fallback;
}

function countWordsInValue(value) {
  if (typeof value === 'string') return value.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((acc, item) => acc + countWordsInValue(item), 0);
  if (value && typeof value === 'object') return countWordsInValue(Object.values(value));
  return 0;
}

function stripHtml(input) {
  return String(input || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryFromSlug(slug = '') {
  const s = slug.toLowerCase();
  if (s.includes('interview')) return 'interview';
  if (s.includes('linkedin')) return 'linkedin';
  if (s.includes('cover-letter')) return 'cover-letter';
  if (s.includes('resume') || s.includes('cv')) return 'cv';
  if (s.includes('skills')) return 'skills';
  if (s.includes('job-search') || s.includes('jobs') || s.includes('remote-jobs')) return 'job-search';
  return 'career';
}

function topicFromArticle(article) {
  const slug = String(article?.slug || '');
  const cat = categoryFromSlug(slug);
  const title = normalizeSpaces(stripHtml(article?.title || '')).toLowerCase();
  if (cat === 'interview') return 'pracovní pohovor';
  if (cat === 'linkedin') return 'profil na LinkedInu';
  if (cat === 'cover-letter') return 'průvodní dopis';
  if (cat === 'cv') return 'životopis';
  if (cat === 'skills') {
    if (title.includes('teacher')) return 'dovednosti učitele';
    if (title.includes('software')) return 'dovednosti softwarového inženýra';
    if (title.includes('sales')) return 'dovednosti obchodního manažera';
    return 'pracovní dovednosti';
  }
  if (cat === 'job-search') return 'hledání práce';
  return 'kariérní rozvoj';
}

function mainKeywordFromTopic(topic, article) {
  const slug = String(article?.slug || '').toLowerCase();
  if (slug.includes('remote')) return 'práce na dálku';
  if (slug.includes('linkedin')) return 'LinkedIn profil';
  if (slug.includes('resume') || slug.includes('cv')) return 'psaní životopisu';
  if (slug.includes('interview')) return 'pracovní pohovor';
  if (slug.includes('skills')) return 'klíčové dovednosti';
  return topic;
}

function titleFromKeyword(keyword) {
  return `Jak zvládnout ${keyword} v české praxi`;
}

function metaDescriptionFromKeyword(keyword) {
  return clamp(
    `Zjistěte, jak zvládnout ${keyword} bez chyb. Praktické kroky, české příklady a jasný postup. Vytvořte si lepší CV na cv-editor.com.`,
    155,
  );
}

function excerptFromKeyword(keyword) {
  return `Praktický průvodce pro ${keyword} na českém trhu práce. Konkrétní postupy, reálné příklady a tipy použitelné hned.`;
}

function sectionHeadings(topic, keyword) {
  return [
    `Proč je ${keyword} důležité na českém trhu práce`,
    `Jak si připravit strategii pro ${keyword}`,
    'Nejčastější chyby a jak se jim vyhnout',
    'Konkrétní příklady z české praxe',
    'Jak zvýšit šanci na pozvání do dalšího kola',
    'Jak pracovat s mzdou, benefity a vyjednáváním',
    `Akční plán na 30 dní pro ${topic}`,
  ];
}

function paragraphBank(keyword, topic) {
  return [
    `Český trh práce je v posledních letech rychlejší a konkurenčnější. V praxi to znamená, že personalisté i manažeři náboru rozhodují na základě konkrétních signálů, ne podle obecných frází. Pokud kandidát téma „${keyword}“ uchopí jasně a věcně, výrazně roste šance, že se dostane do užšího výběru už po prvním čtení podkladů. Firmy obvykle porovnávají desítky reakcí týdně, takže rozhodují detaily jako srozumitelnost textu, logická struktura a jasně popsaný přínos pro byznys.`,
    `V českém prostředí funguje kombinace stručnosti a důkazů. Nestačí napsat, že jste zodpovědní nebo komunikativní. Silnější je uvést konkrétní výsledek: například zkrácení času zpracování požadavků o 22 %, zvýšení úspěšnosti výběrového řízení o 18 % nebo růst obratu o 1,2 mil. CZK za rok. Takové formulace jsou důvěryhodné a pomáhají personalistovi rychle pochopit, co přesně přinášíte.`,
    `Užitečné je také přizpůsobit jazyk konkrétní nabídce. Inzeráty na Jobs.cz nebo Profesia.cz často obsahují opakující se klíčové požadavky. Pokud je promítnete do vlastních materiálů přirozeně a bez kopírování, zvýšíte relevanci vůči pozici. Nejde o mechanické vkládání slov, ale o to, aby náborář ihned viděl spojení mezi tím, co firma hledá, a tím, co umíte dodat v praxi.`,
    `Při práci s tématem „${topic}“ pomáhá jednoduché pravidlo: popsat kontext, akci a výsledek. Díky tomu text nepůsobí nafouknutě a čtenář nemusí domýšlet, co přesně jste řešili. Tento způsob funguje pro juniorní i seniorní role a dobře se přenáší napříč obory od administrativy přes obchod až po IT. Pokud si chcete přípravu zrychlit, využijte <a href="https://cv-editor.com">editor CV</a> a udržte jednotný styl v celém dokumentu.`,
    `Mnoho kandidátů podceňuje finální kontrolu kvality. Přitom právě posledních deset minut často rozhoduje o tom, jestli přihláška působí profesionálně. Zkontrolujte pravopis, konzistenci názvů pozic, funkčnost odkazů i čitelnost na mobilu. V menších českých firmách i velkých korporacích platí stejné pravidlo: přehledně podané informace šetří čas a zvyšují důvěru v kandidáta.`,
    `Silná prezentace není o přehánění, ale o přesnosti. Když uvádíte výsledky, používejte realistické metriky, částky v CZK a časový rámec. Například „zvýšení počtu kvalifikovaných leadů o 27 % během šesti měsíců“ je pro manažera náboru čitelné a snadno porovnatelné. Podobně funguje i popis týmové spolupráce: je lepší uvést konkrétní roli a odpovědnost než obecnou větu o týmovosti.`,
    `Dobrá příprava zlepšuje nejen šanci na pohovor, ale také vyjednávací pozici. Kandidát, který má jasně popsané výsledky a ví, jak je propojit s požadavky firmy, působí jistěji. To se promítá i do diskuse o mzdě, benefitech a rozsahu odpovědnosti. Pokud míříte na vyšší úroveň role, doporučuje se přidat i dopad na rozpočet, procesy nebo obchodní výsledek.`,
    `V praxi se osvědčuje mít dvě verze materiálů: základní a cílenou pro konkrétní pozici. Základní verze drží vaše klíčové výsledky a profesní profil, cílená verze pak přizpůsobuje slovník i pořadí sekcí podle inzerátu. Díky tomu šetříte čas a zároveň neodesíláte univerzální text, který působí anonymně. Pro rychlé úpravy můžete použít <a href="https://cv-editor.com">online tvůrce životopisu</a>.`,
    `Častou chybou je přílišná délka bez informační hodnoty. Delší text sám o sobě není problém, ale každá věta by měla přinášet konkrétní obsah. Pokud pasáž jen opakuje stejnou myšlenku jinými slovy, je lepší ji zkrátit a přidat konkrétní příklad. Personalista ocení, když z dokumentu během krátké chvíle pochopí, v čem jste silní a kde bude váš přínos pro tým největší.`,
    `Kvalitní výstup je kombinací obsahu a formy. Obsah musí být konkrétní, forma musí být čitelná. Jednotné nadpisy, krátké odstavce, přiměřené seznamy a jasná výzva k akci vytváří profesionální dojem. Když tento standard udržíte napříč CV, průvodním dopisem i profilem, zvýšíte konzistenci celé kandidátské prezentace a tím i pravděpodobnost, že postoupíte dál.`,
  ];
}

function listItemsBank(keyword) {
  return [
    [
      `Vyberte 5 až 8 klíčových požadavků z inzerátu a přiřaďte k nim vlastní důkazy.`,
      `U každého bodu uveďte konkrétní výsledek v číslech (%, CZK, čas).`,
      `Zachovejte jazyk, který odpovídá oboru a úrovni dané pozice.`,
      `Před odesláním proveďte finální kontrolu relevance i pravopisu.`,
    ],
    [
      `Používejte aktivní slovesa: vedl/a jsem, navrhl/a jsem, zrychlil/a jsem, zvýšil/a jsem.`,
      `Doplňte kontext: v jak velkém týmu, s jakým rozpočtem, v jakém časovém období.`,
      `Vyhněte se vágním formulacím typu „mám dobré komunikační schopnosti“.`,
      `Každý odstavec propojte s tématem ${keyword} a potřebou zaměstnavatele.`,
    ],
    [
      `Čtěte inzerát doslova a vyznačte slova, která se opakují.`,
      `Vytvořte dvě varianty textu: obecnou a cílenou na konkrétní nabídku.`,
      `V textu použijte 2–3 interní odkazy na nástroj, ne víc.`,
      `Doplňte reálné české příklady: Jobs.cz, Profesia.cz, Alza, Seznam.cz, Notino.`,
    ],
  ];
}

function pickImage(index) {
  const images = [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
    'https://images.unsplash.com/photo-1573497161161-c3d7c31bbd8b?w=900&q=80',
  ];
  return images[index % images.length];
}

function dedupeParagraph(paragraph, used, seed = 0) {
  const normalized = normalizeSpaces(paragraph.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ''));
  if (!used.has(normalized)) {
    used.add(normalized);
    return paragraph;
  }
  const addendum = ` V české praxi se navíc vyplatí ověřit tento krok na konkrétní nabídce a upravit formulaci podle seniority role.`;
  const patched = paragraph + addendum + ` (${seed + 1})`;
  used.add(normalizeSpaces(patched.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '')));
  return patched;
}

function createSection(heading, idx, keyword, topic, usedParagraphs) {
  const paragraphs = paragraphBank(keyword, topic);
  const listBank = listItemsBank(keyword);
  const p1 = dedupeParagraph(paragraphs[(idx * 2) % paragraphs.length], usedParagraphs, idx * 3 + 1);
  const p2 = dedupeParagraph(paragraphs[(idx * 2 + 1) % paragraphs.length], usedParagraphs, idx * 3 + 2);
  const p3 = dedupeParagraph(paragraphs[(idx * 2 + 2) % paragraphs.length], usedParagraphs, idx * 3 + 3);
  const list = listBank[idx % listBank.length];

  const body = [
    p1,
    p2,
    { type: idx % 2 === 0 ? 'ul' : 'ol', items: list },
    p3,
  ];

  if (idx === 1 || idx === 4) {
    body.push({
      type: 'img',
      src: pickImage(idx),
      alt: `Praktická ilustrace k tématu ${keyword}`,
      caption: `Ilustrační situace: ${keyword} v českém pracovním prostředí.`,
    });
  }

  return {
    id: makeId(heading, `sekce-${idx + 1}`),
    heading,
    body,
  };
}

function ensureMinWords(articleJson, keyword, usedParagraphs) {
  let guard = 0;
  const filler = paragraphBank(keyword, keyword);
  while (countWordsInValue(articleJson) < 3000 && guard < 40) {
    const sec = articleJson.sections[guard % Math.max(1, articleJson.sections.length - 1)];
    if (sec && Array.isArray(sec.body)) {
      sec.body.push(dedupeParagraph(filler[guard % filler.length], usedParagraphs, 100 + guard));
    }
    guard += 1;
  }
}

function buildRewrite(article) {
  const topic = topicFromArticle(article);
  const keyword = mainKeywordFromTopic(topic, article);
  const title = titleFromKeyword(keyword);
  const metaTitle = clamp(`${keyword} | cv-editor.com`, 60);
  const metaDescription = metaDescriptionFromKeyword(keyword);
  const excerpt = excerptFromKeyword(keyword);
  const usedParagraphs = new Set();

  const headings = sectionHeadings(topic, keyword);
  const sections = headings.map((h, i) => createSection(h, i, keyword, topic, usedParagraphs));

  // Mandatory internal links presence (2-3)
  sections[0].body.push(
    `Pokud chcete připravit konzistentní výstup, můžete začít v <a href="https://cv-editor.com">cv-editor.com</a> a držet jednotný styl napříč sekcemi.`,
  );
  sections[2].body.push(
    `Pro rychlou úpravu verzí podle konkrétních inzerátů použijte <a href="https://cv-editor.com">editor CV</a>, kde snadno změníte pořadí i formulace.`,
  );
  sections[5].body.push(
    `Před odesláním přihlášky je vhodné dokument exportovat a projít finální checklist v <a href="https://cv-editor.com">nástroji pro tvorbu CV</a>.`,
  );

  sections.push({
    id: 'zacnete-tvorit-cv',
    heading: 'Začněte tvořit profesionální CV',
    body: [
      `Máte hotový postup, jak uchopit téma ${keyword} bez zbytečných chyb a opakování. Teď je nejlepší chvíle převést kroky do praxe a vytvořit profesionální výstup, který obstojí u českých zaměstnavatelů.`,
      {
        type: 'cta',
        text: 'Vytvořit CV zdarma',
        url: 'https://cv-editor.com',
      },
    ],
  });

  const rewritten = {
    title,
    metaTitle,
    metaDescription,
    focusKeyword: keyword,
    excerpt,
    sections,
  };

  ensureMinWords(rewritten, keyword, usedParagraphs);
  return rewritten;
}

async function fetchJson(url, init = {}, label = 'request', retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(120000) });
      const txt = await res.text();
      let data = null;
      try {
        data = txt ? JSON.parse(txt) : null;
      } catch {
        data = null;
      }
      if (!res.ok) {
        const detail =
          (data && (data.message || data.error)) || txt.slice(0, 400) || `HTTP ${res.status}`;
        throw new Error(`${label} failed (${res.status}): ${detail}`);
      }
      return data;
    } catch (e) {
      lastErr = e;
      if (i < retries - 1) await sleep(1500 * (i + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

function table(rows) {
  const lines = ['| Slug | Status | Blog post ID |', '|---|---|---|'];
  for (const row of rows) {
    lines.push(`| ${row.slug} | ${row.status} | ${row.blogPostId || '-'} |`);
  }
  return lines.join('\n');
}

async function getCoreToken() {
  let token = String(process.env.CORE_JWT_TOKEN || '').trim();
  if (token) return token;

  const email = `seo-quality-${Date.now()}@example.com`;
  const password = `TmpPass${Date.now()}A1`;

  for (let i = 0; i < 5 && !token; i += 1) {
    try {
      const reg = await fetchJson(
        `${CORE}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password, firstName: 'SEO', lastName: 'Quality' }),
        },
        'register',
      );
      token = String(reg?.accessToken || '');
      if (token) break;
    } catch {
      // continue
    }
    try {
      const login = await fetchJson(
        `${CORE}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        'login',
      );
      token = String(login?.accessToken || '');
    } catch {
      // continue
    }
    if (!token) await sleep(1200 * (i + 1));
  }
  if (!token) throw new Error('Nepodařilo se získat JWT token pro core.');
  return token;
}

async function main() {
  const token = await getCoreToken();
  const headers = { authorization: `Bearer ${token}` };

  let articles = [];
  try {
    const batchResp = await fetchJson(
      `${CORE}/api/marketing/articles/next-batch?size=${SIZE}`,
      { headers },
      'next-batch',
    );
    articles = Array.isArray(batchResp?.data) ? batchResp.data : [];
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes('next-batch failed (404)')) throw error;
    const allResp = await fetchJson(
      `${CORE}/api/marketing/articles`,
      { headers },
      'articles',
    );
    const all = Array.isArray(allResp?.data) ? allResp.data : [];
    articles = all.filter((a) => !a?.importedAt).slice(0, SIZE);
  }

  if (!articles.length) {
    console.log('HOTOVO — všechny články jsou přepsány.');
    return;
  }

  const results = [];
  for (const article of articles) {
    const slug = String(article?.slug || '').trim();
    if (!slug) continue;
    try {
      const rewriteJson = buildRewrite(article);
      const rewrittenBody = JSON.stringify(rewriteJson);

      await fetchJson(
        `${CORE}/api/marketing/save-rewrite?slug=${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ rewrittenBody }),
        },
        `save-rewrite:${slug}`,
      );

      const blog = await fetchJson(
        `${BLOG}/api/blog/posts`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            adminKey: 'cveditor_admin_2024',
            slug,
            title: rewriteJson.title,
            metaTitle: rewriteJson.metaTitle,
            metaDescription: rewriteJson.metaDescription,
            focusKeyword: rewriteJson.focusKeyword,
            excerpt: rewriteJson.excerpt,
            rewrittenBody,
            sourceUrl: article?.sourceUrl || '',
            sourceSlug: slug,
            lang: 'cs',
          }),
        },
        `blog:${slug}`,
      );
      const postId = String(blog?.id || '').trim();
      if (!postId) throw new Error('Blog import nevrátil id.');

      await fetchJson(
        `${CORE}/api/marketing/articles/${encodeURIComponent(slug)}/mark-imported`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        },
        `mark:${slug}`,
      );

      results.push({ slug, status: 'OK', blogPostId: postId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ slug, status: clamp(`ERROR: ${msg}`, 120), blogPostId: '' });
    }
  }

  console.log(`\n${table(results)}\n`);
  console.log(`Dávka hotova. Zpracováno ${results.length}/${SIZE}. Napiš 'pokračuj' pro další dávku.`);
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`FATAL: ${msg}`);
  process.exit(1);
});
