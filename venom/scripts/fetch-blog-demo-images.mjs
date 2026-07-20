#!/usr/bin/env node
/**
 * Images for the universal demo blog posts (see src/lib/blog/demo-posts.ts).
 *
 * These ship with every template, so every motif has to stay industry-neutral:
 * hands at work, a team talking, a desk, a storefront — nothing that reads as
 * "gym" or "law firm" specifically. Verify new motifs visually after download;
 * a 200 from HEAD says nothing about what is in the frame.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'public/blog-demo');
fs.mkdirSync(DEST, { recursive: true });

const W = 'w=1600&h=900&fit=crop&q=85';
const S = 'w=900&h=700&fit=crop&q=85';

const images = [
  // 1 — craft / hands at work (cover: "řemeslo")
  { file: 'craft-hands.webp',    url: `https://images.unsplash.com/photo-1503387762-592deb58ef4e?${W}` },
  { file: 'craft-detail.webp',   url: `https://images.unsplash.com/photo-1506806732259-39c2d0268443?${S}` },
  // 2 — team / people talking (cover: "otázky klientů")
  { file: 'team-talk.webp',      url: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?${W}` },
  { file: 'team-notes.webp',     url: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${S}` },
  // 3 — behind the scenes / workspace (cover: "den u nás")
  { file: 'workspace.webp',      url: `https://images.unsplash.com/photo-1497215728101-856f4ea42174?${W}` },
  { file: 'morning-coffee.webp', url: `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?${S}` },
  { file: 'storefront.webp',     url: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${S}` },
  // 4 — sustainability / materials (cover: "udržitelnost")
  { file: 'green-leaf.webp',     url: `https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?${W}` },
  { file: 'materials.webp',      url: `https://images.unsplash.com/photo-1452860606245-08befc0ff44b?${S}` },
  // 5 — what's next / planning (cover: "co chystáme")
  { file: 'planning.webp',       url: `https://images.unsplash.com/photo-1531403009284-440f080d1e12?${W}` },
  { file: 'sketch.webp',         url: `https://images.unsplash.com/photo-1517842645767-c639042777db?${S}` },
  // gallery fillers
  { file: 'gallery-1.webp',      url: `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?${S}` },
  { file: 'gallery-2.webp',      url: `https://images.unsplash.com/photo-1524758631624-e2822e304c36?${S}` },
  { file: 'gallery-3.webp',      url: `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?${S}` },
];

async function download(file, url) {
  const dest = path.join(DEST, file);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 5000) throw new Error(`suspiciously small: ${buf.length} B`);
      fs.writeFileSync(dest, buf);
      console.log(`  ok  ${file}  ${(buf.length / 1024).toFixed(0)} kB`);
      return;
    } catch (err) {
      if (attempt === 3) { console.error(`  FAIL ${file}: ${err.message}`); process.exitCode = 1; }
      else await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

console.log(`→ ${DEST}`);
for (const img of images) await download(img.file, img.url);
