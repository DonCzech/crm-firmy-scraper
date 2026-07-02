function getAccessKey(req) {
  const headerKey = req.headers['x-access-key'];
  const queryKey = req.query?.key;

  if (typeof headerKey === 'string' && headerKey.trim()) return headerKey.trim();
  if (Array.isArray(headerKey) && headerKey[0]) return String(headerKey[0]).trim();
  if (typeof queryKey === 'string' && queryKey.trim()) return queryKey.trim();
  return '';
}

function requireAccess(req, res) {
  const expected = (process.env.APP_ACCESS_KEY || '').trim();

  if (!expected) {
    return true;
  }

  const provided = getAccessKey(req);
  if (provided && provided === expected) {
    return true;
  }

  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

module.exports = { requireAccess };
