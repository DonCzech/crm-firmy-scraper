import cron from 'node-cron';
import { fetchAllFeeds } from './rss-fetcher.js';
import { scrapeArticleBodies, scrapeArticleImages, backfillAllArticleImages } from './scraper.js';

export function startScheduler() {
  console.log('[SCHEDULER] Scheduler spuštěn');

  // Pipeline každých 15 minut
  cron.schedule('*/15 * * * *', async () => {
    console.log(`\n[PIPELINE] Start ${new Date().toISOString()}`);
    try {
      await fetchAllFeeds();
      await scrapeArticleBodies();
      await scrapeArticleImages();
    } catch (err) {
      console.error('[PIPELINE] Chyba:', err);
    }
    console.log(`[PIPELINE] End\n`);
  });

  // První run po startu (po 5s)
  setTimeout(async () => {
    console.log('\n[PIPELINE] První run po startu...');
    try {
      await fetchAllFeeds();
      await scrapeArticleBodies();
      await scrapeArticleImages();
    } catch (err) {
      console.error('[PIPELINE] Chyba prvního runu:', err);
    }
    console.log('[PIPELINE] První run dokončen\n');
  }, 5000);

  // Noční údržba: dočtení všech obrázků u recent článků (02:30 každý den).
  cron.schedule('30 2 * * *', async () => {
    console.log(`\n[NIGHTLY] Start ${new Date().toISOString()}`);
    try {
      await backfillAllArticleImages(700);
    } catch (err) {
      console.error('[NIGHTLY] Chyba:', err);
    }
    console.log('[NIGHTLY] End\n');
  });
}
