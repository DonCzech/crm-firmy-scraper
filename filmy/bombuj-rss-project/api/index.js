const path = require('node:path');
const fs = require('node:fs/promises');

module.exports = async function handler(_req, res) {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const html = await fs.readFile(htmlPath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
