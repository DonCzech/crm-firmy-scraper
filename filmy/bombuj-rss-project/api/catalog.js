const { prisma } = require('../src/db');
const { requireAccess } = require('../src/auth');

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const movies = await prisma.movie.findMany({
      orderBy: [{ title: 'asc' }],
      select: {
        slug: true,
        title: true,
        pageUrl: true,
        updatedAt: true,
        _count: { select: { serverLinks: true } }
      }
    });

    res.status(200).json({
      total: movies.length,
      data: movies.map((m) => ({
        slug: m.slug,
        title: m.title,
        pageUrl: m.pageUrl,
        updatedAt: m.updatedAt,
        serverLinksCount: m._count.serverLinks
      }))
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
