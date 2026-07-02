const { prisma } = require('../src/db');
const { createRssXml } = require('../src/rss');
const { requireAccess } = require('../src/auth');

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const limit = Math.min(Number(req.query.limit || 2000), 5000);

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
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send(`RSS generation failed: ${String(err)}`);
  }
};
