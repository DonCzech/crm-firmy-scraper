import Anthropic from '@anthropic-ai/sdk';
import { getPendingRewrites, updateRewrittenArticle, markRewriteFailed } from './database.js';
import { AI_CONFIG } from './config.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Jsi redaktor českého zpravodajského portálu. Dostaneš článek
z jiného média a tvým úkolem je ho kompletně přepsat vlastními slovy.

PRAVIDLA:
- Zachovej všechna fakta, čísla, jména a data přesně
- Kompletně změň formulace, strukturu vět a pořadí informací
- Piš přirozenou českou novinářskou češtinou
- Titulek musí být výstižný, max 100 znaků
- Perex 1-2 věty, max 200 znaků
- Body: 3-5 odstavců, každý 3-5 vět

VÝSTUP: Odpověz POUZE validním JSON, nic jiného:
{
  "title": "Přepsaný titulek",
  "perex": "Přepsaný perex.",
  "body": ["První odstavec...", "Druhý odstavec...", "Třetí odstavec..."]
}`;

export async function rewritePendingArticles() {
  const articles = getPendingRewrites(AI_CONFIG.maxArticlesPerFetch);
  console.log(`[AI] Přepisuji ${articles.length} článků`);

  for (const article of articles) {
    try {
      const rewritten = await rewriteArticle(article);
      updateRewrittenArticle(article.id, {
        title:        rewritten.title,
        perex:        rewritten.perex,
        body:         JSON.stringify(rewritten.body),
        rewritten_at: new Date().toISOString()
      });
      console.log(`[AI] ✓ Přepsán: ${rewritten.title.substring(0, 60)}...`);
    } catch (err) {
      console.error(`[AI] ✗ ID ${article.id}:`, err.message);
      markRewriteFailed(article.id, err.message);
    }
    await sleep(AI_CONFIG.rewriteDelayMs);
  }
}

async function rewriteArticle(article) {
  const userPrompt = `Přepiš tento článek:

TITULEK: ${article.original_title}
PEREX: ${article.original_perex || ''}
TEXT: ${article.original_body || article.original_perex || ''}`;

  const message = await anthropic.messages.create({
    model:      AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: userPrompt }]
  });

  const raw = message.content[0].text.trim()
    .replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

  const parsed = JSON.parse(raw);
  if (!parsed.title || !parsed.perex || !Array.isArray(parsed.body)) {
    throw new Error('Neplatný formát odpovědi AI');
  }
  return parsed;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
