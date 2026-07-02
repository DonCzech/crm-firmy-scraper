const { prisma } = require('../src/db');
const { requireAccess } = require('../src/auth');

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const q = String(req.query.q || '').trim();
  const limit = Math.min(Math.max(Number(req.query.limit || 25), 1), 100);
  const page = Math.max(Number(req.query.page || 1), 1);
  const skip = (page - 1) * limit;

  try {
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } }
          ]
        }
      : undefined;

    const [total, movies] = await Promise.all([
      prisma.movie.count({ where }),
      prisma.movie.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip,
        take: limit,
        include: {
          _count: { select: { serverLinks: true } }
        }
      })
    ]);

    res.status(200).json({
      query: q,
      total,
      count: movies.length,
      page,
      limit,
      hasMore: skip + movies.length < total,
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
