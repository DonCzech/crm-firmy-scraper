const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

async function fetchWithNode(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; BombujSyncBot/1.0)',
        accept: 'text/html,application/xml,text/xml,*/*'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithCurl(url, timeoutSec) {
  const { stdout } = await execFileAsync('curl', [
    '-sS',
    '-L',
    '--max-time',
    String(timeoutSec),
    '--retry',
    '2',
    '--retry-delay',
    '1',
    '--retry-connrefused',
    '-H',
    'User-Agent: Mozilla/5.0 (compatible; BombujSyncBot/1.0)',
    '-H',
    'Accept: text/html,application/xml,text/xml,*/*',
    url
  ]);

  if (!stdout || !stdout.trim()) {
    throw new Error('Empty response');
  }

  return stdout;
}

async function fetchText(url, options = {}) {
  const retries = Number(options.retries ?? 3);
  const timeoutMs = Number(options.timeoutMs ?? 25000);
  const timeoutSec = Math.max(5, Math.ceil(timeoutMs / 1000));

  let lastErr;

  for (let i = 0; i < retries; i += 1) {
    try {
      return await fetchWithNode(url, timeoutMs);
    } catch (err) {
      lastErr = err;
      try {
        return await fetchWithCurl(url, timeoutSec);
      } catch (curlErr) {
        lastErr = curlErr;
      }
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }

  throw new Error(`Failed to fetch ${url}: ${String(lastErr)}`);
}

module.exports = { fetchText };
