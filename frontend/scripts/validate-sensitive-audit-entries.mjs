import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src', 'crm');
const REQUIRED_KEYS = ['area', 'action', 'result', 'actorRole', 'actorUserId'];

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

function lineOfOffset(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

function findAuditCalls(source) {
  const calls = [];
  let idx = 0;
  const token = 'appendSensitiveActionAudit({';
  while (idx < source.length) {
    const start = source.indexOf(token, idx);
    if (start === -1) break;

    let i = start + token.length;
    let depth = 1;
    while (i < source.length && depth > 0) {
      const ch = source[i];
      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;
      i += 1;
    }

    const body = source.slice(start + token.length, i - 1);
    calls.push({ start, body });
    idx = i;
  }
  return calls;
}

function hasKey(body, key) {
  const explicitKeyRe = new RegExp(`\\b${key}\\s*:`, 'm');
  if (explicitKeyRe.test(body)) return true;
  const shorthandKeyRe = new RegExp(`(^|[,{\\s])${key}(?=\\s*[,}\\n])`, 'm');
  return shorthandKeyRe.test(body);
}

const files = walk(ROOT).filter((file) => !file.endsWith(path.join('services', 'sensitive-actions-audit.ts')));
const violations = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const calls = findAuditCalls(text);
  for (const call of calls) {
    const missing = REQUIRED_KEYS.filter((key) => !hasKey(call.body, key));
    if (missing.length === 0) continue;
    violations.push({
      file,
      line: lineOfOffset(text, call.start),
      missing,
    });
  }
}

if (violations.length > 0) {
  console.error('Sensitive audit validation failed:');
  for (const v of violations) {
    const rel = path.relative(process.cwd(), v.file);
    console.error(`- ${rel}:${v.line} missing keys: ${v.missing.join(', ')}`);
  }
  process.exit(1);
}

console.log('Sensitive audit validation passed.');
