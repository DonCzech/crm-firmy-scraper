const { prisma } = require('../src/db');
const { requireAccess } = require('../src/auth');

module.exports = async function handler(req, res) {
  if (!requireAccess(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const slug = String(req.query.slug || '').trim();
  if (!slug) {
    res.status(400).json({ error: 'Missing slug' });
    return;
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        serverLinks: {
          orderBy: [{ languageLabel: 'asc' }, { position: 'asc' }]
        }
      }
    });

    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }

    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
