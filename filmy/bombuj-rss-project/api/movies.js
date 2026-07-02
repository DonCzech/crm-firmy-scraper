const { prisma } = require('../src/db');
const { requireAccess } = require('../src/auth');

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const limit = Math.min(Number(req.query.limit || 50), 200);
  const page = Math.max(Number(req.query.page || 1), 1);
  const skip = (page - 1) * limit;

  try {
    const [total, movies] = await Promise.all([
      prisma.movie.count(),
      prisma.movie.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          serverLinks: {
            orderBy: [{ languageLabel: 'asc' }, { position: 'asc' }]
          }
        }
      })
    ]);

    res.status(200).json({
      total,
      page,
      limit,
      data: movies
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
