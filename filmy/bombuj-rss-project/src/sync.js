const { prisma } = require('./db');
const { getMovieUrls, getUvodMovieUrls, scrapeMovie, slugFromUrl } = require('./bombuj');

const SCRAPE_LIMIT = Number(process.env.SCRAPE_LIMIT || 0);
const SCRAPE_CONCURRENCY = Number(process.env.SCRAPE_CONCURRENCY || 6);
const FULL_SYNC = String(process.env.FULL_SYNC || 'false').toLowerCase() === 'true';
const MIN_RESCRAPE_HOURS = Number(process.env.MIN_RESCRAPE_HOURS || 72);
const UVOD_PRIORITY = String(process.env.UVOD_PRIORITY || 'true').toLowerCase() === 'true';

function shouldSkipMovie(existing) {
  if (!existing?.lastScrapedAt) return false;
  const diffMs = Date.now() - new Date(existing.lastScrapedAt).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < MIN_RESCRAPE_HOURS;
}

async function upsertMovieWithLinks(movie) {
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const savedMovie = await tx.movie.upsert({
      where: { slug: movie.slug },
      update: {
        title: movie.title,
        pageUrl: movie.pageUrl,
        imdbId: movie.imdbId,
        tmdbId: movie.tmdbId,
        languageRaw: movie.languageRaw,
        lastScrapedAt: now
      },
      create: {
        slug: movie.slug,
        title: movie.title,
        pageUrl: movie.pageUrl,
        imdbId: movie.imdbId,
        tmdbId: movie.tmdbId,
        languageRaw: movie.languageRaw,
        lastScrapedAt: now
      }
    });

    await tx.movieServerLink.deleteMany({ where: { movieId: savedMovie.id } });

    if (movie.serverLinks.length > 0) {
      await tx.movieServerLink.createMany({
        data: movie.serverLinks.map((link) => ({
          movieId: savedMovie.id,
          languageLabel: link.languageLabel,
          serverName: link.serverName,
          playerUrl: link.playerUrl,
          playerPath: link.playerPath,
          position: link.position,
          isVip: link.isVip,
          isNew: link.isNew
        }))
      });
    }
  });
}

async function runPool(items, concurrency, worker) {
  let idx = 0;

  async function next() {
    const current = idx;
    idx += 1;
    if (current >= items.length) return;
    await worker(items[current], current);
    await next();
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => next());
  await Promise.all(workers);
}

async function main() {
  console.log('Loading sitemap + uvod...');
  const [sitemapUrls, uvodUrls] = await Promise.all([getMovieUrls(), getUvodMovieUrls()]);
  let urls = UVOD_PRIORITY
    ? [...new Set([...uvodUrls, ...sitemapUrls])]
    : [...new Set([...sitemapUrls, ...uvodUrls])];
  console.log(`Sitemap movies: ${sitemapUrls.length}`);
  console.log(`Uvod movies: ${uvodUrls.length}`);
  console.log(`Merged unique movies: ${urls.length}`);

  if (SCRAPE_LIMIT > 0) {
    urls = urls.slice(0, SCRAPE_LIMIT);
  }

  console.log(`Movies from sitemap: ${urls.length}`);

  const slugs = urls.map((u) => slugFromUrl(u));
  const existingMovies = await prisma.movie.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, lastScrapedAt: true }
  });
  const existingMap = new Map(existingMovies.map((m) => [m.slug, m]));

  const targetUrls = FULL_SYNC
    ? urls
    : urls.filter((u) => !shouldSkipMovie(existingMap.get(slugFromUrl(u))));

  console.log(`Target for scrape: ${targetUrls.length} (fullSync=${FULL_SYNC})`);

  let ok = 0;
  let failed = 0;
  let linksTotal = 0;

  await runPool(targetUrls, SCRAPE_CONCURRENCY, async (url, index) => {
    try {
      const movie = await scrapeMovie(url);
      await upsertMovieWithLinks(movie);
      ok += 1;
      linksTotal += movie.serverLinks.length;

      if ((index + 1) % 25 === 0 || index === targetUrls.length - 1) {
        console.log(`Progress ${index + 1}/${targetUrls.length} | ok=${ok} failed=${failed}`);
      }
    } catch (err) {
      failed += 1;
      console.error(`Failed: ${url}`);
      console.error(String(err));
    }
  });

  console.log('Done.');
  console.log(`Saved movies: ${ok}`);
  console.log(`Failed movies: ${failed}`);
  console.log(`Saved server links: ${linksTotal}`);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { main };
