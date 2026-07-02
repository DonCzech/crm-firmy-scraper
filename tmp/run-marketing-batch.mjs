const CORE = 'https://www.core.ceskypartner.cz';
const BLOG = 'https://www.cv-editor.com';
const SIZE = 30;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function nowId() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
}

async function fetchJson(url, init = {}, label = 'request', attempts = 5) {
  let lastErr = null;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: { ...(init.headers || {}) },
        signal: AbortSignal.timeout(240000),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const detail =
          (data && (data.error || data.message)) ||
          text.slice(0, 400) ||
          `HTTP ${res.status}`;
        throw new Error(`${label} failed (${res.status}): ${detail}`);
      }

      return data;
    } catch (error) {
      lastErr = error;
      const msg = error instanceof Error ? error.message : String(error);
      const retryable =
        /fetch failed|network|timeout|aborted|ENOTFOUND|ECONN|EAI_AGAIN/i.test(msg);
      if (!retryable || i === attempts) break;
      await sleep(1000 * i);
    }
  }
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`${label} network failure: ${msg}`);
}

function formatTable(rows) {
  const lines = ['| Slug | Status | Blog post ID |', '|---|---|---|'];
  for (const row of rows) {
    lines.push(`| ${row.slug} | ${row.status} | ${row.blogPostId || '-'} |`);
  }
  return lines.join('\n');
}

async function main() {
  const email = `seo-batch-${nowId()}@example.com`;
  const password = `TmpPass!${Math.random().toString(36).slice(2, 10)}A1`;
  console.log(`Registering temp user: ${email}`);

  const reg = await fetchJson(
    `${CORE}/api/auth/register`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: 'SEO',
        lastName: 'Batch',
      }),
    },
    'register',
    8,
  );
  const accessToken = reg?.accessToken || '';
  if (!accessToken) throw new Error('Nepodařilo se získat JWT token.');

  const authHeaders = {
    authorization: `Bearer ${accessToken}`,
    'content-type': 'application/json',
  };

  const batch = await fetchJson(
    `${CORE}/api/marketing/articles/next-batch?size=${SIZE}`,
    { headers: { authorization: `Bearer ${accessToken}` } },
    'next-batch',
    8,
  );

  const articles = Array.isArray(batch?.data) ? batch.data : [];
  console.log(`Fetched next batch: ${articles.length} articles`);
  if (!articles.length) {
    console.log('HOTOVO — všechny články jsou přepsány.');
    return;
  }

  const results = [];
  for (const article of articles) {
    const slug = String(article?.slug || '').trim();
    if (!slug) continue;

    try {
      const rewrite = await fetchJson(
        `${CORE}/api/marketing/rewrite-one?slug=${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          headers: { authorization: `Bearer ${accessToken}` },
        },
        `rewrite-one:${slug}`,
        5,
      );

      const rewrittenBody = String(rewrite?.rewrittenBody || '').trim();
      if (!rewrittenBody) throw new Error('rewrite-one nevrátil rewrittenBody');

      await fetchJson(
        `${CORE}/api/marketing/save-rewrite?slug=${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ rewrittenBody }),
        },
        `save-rewrite:${slug}`,
        5,
      );

      const parsed = JSON.parse(rewrittenBody);
      const blog = await fetchJson(
        `${BLOG}/api/blog/posts`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            adminKey: 'cveditor_admin_2024',
            slug,
            title: parsed?.title || article?.title || slug,
            metaTitle: parsed?.metaTitle || '',
            metaDescription: parsed?.metaDescription || '',
            focusKeyword: parsed?.focusKeyword || '',
            excerpt: parsed?.excerpt || article?.excerpt || '',
            rewrittenBody,
            sourceUrl: article?.sourceUrl || '',
            sourceSlug: slug,
            lang: 'cs',
          }),
        },
        `blog-import:${slug}`,
        5,
      );

      const postId = String(blog?.id || '').trim();
      if (!postId) throw new Error('blog import nevrátil id');

      await fetchJson(
        `${CORE}/api/marketing/articles/${encodeURIComponent(slug)}/mark-imported`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ postId }),
        },
        `mark-imported:${slug}`,
        5,
      );

      results.push({ slug, status: 'OK', blogPostId: postId });
      console.log(`[OK] ${slug} -> ${postId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ slug, status: `ERROR: ${msg}`.slice(0, 140), blogPostId: '' });
      console.log(`[ERROR] ${slug}: ${msg}`);
    }
  }

  console.log(`\n${formatTable(results)}`);
  console.log(`\nDávka hotova. Zpracováno ${results.length}/${SIZE}. Napiš 'pokračuj' pro další dávku.`);
}

main().catch((e) => {
  console.error('FATAL:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
