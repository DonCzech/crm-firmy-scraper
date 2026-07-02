const { writeFile } = require('node:fs/promises');
const path = require('node:path');
const { prisma } = require('./db');
const { createRssXml } = require('./rss');

async function main() {
  const limit = Number(process.env.RSS_LIMIT || 1000);

  const movies = await prisma.movie.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      serverLinks: {
        orderBy: [{ languageLabel: 'asc' }, { position: 'asc' }]
      }
    }
  });

  const xml = createRssXml(movies);
  const output = path.join(process.cwd(), 'rss.xml');
  await writeFile(output, xml, 'utf8');
  console.log(`RSS written: ${output} (items=${movies.length})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
