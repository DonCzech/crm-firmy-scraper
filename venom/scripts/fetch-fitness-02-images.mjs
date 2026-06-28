#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'public/images/fitness-02');
fs.mkdirSync(DEST, { recursive: true });

const images = [
  // hero
  { file: 'hero.webp',             url: 'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?w=1920&h=1080&fit=crop&q=85' },
  // about
  { file: 'about-trainer.webp',    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=1000&fit=crop&q=85' },
  { file: 'about-reception.webp',  url: 'https://images.unsplash.com/photo-1660557989710-1a91e7e89d1c?w=900&h=700&fit=crop&q=85' },
  // services
  { file: 'service-silovy.webp',   url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop&q=85' },
  { file: 'service-joga.webp',     url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=85' },
  { file: 'service-kruhovy.webp',  url: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800&h=600&fit=crop&q=85' },
  { file: 'service-zumba.webp',    url: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&h=600&fit=crop&q=85' },
  { file: 'service-mma.webp',      url: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=800&h=600&fit=crop&q=85' },
  { file: 'service-kardio.webp',   url: 'https://images.unsplash.com/photo-1638183395699-2c0db5b6afbb?w=800&h=600&fit=crop&q=85' },
  // gallery
  { file: 'gallery-1.webp',        url: 'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-2.webp',        url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-3.webp',        url: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-4.webp',        url: 'https://images.unsplash.com/photo-1674834727206-4bc272bfd8da?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-5.webp',        url: 'https://images.unsplash.com/photo-1649068618811-9f3547ef98fc?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-6.webp',        url: 'https://images.unsplash.com/photo-1685633224597-294ff1adfd6f?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-7.webp',        url: 'https://images.unsplash.com/photo-1728486145245-d4cb0c9c3470?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-8.webp',        url: 'https://images.unsplash.com/photo-1689877020200-403d8542d95d?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-9.webp',        url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&h=700&fit=crop&q=85' },
  { file: 'gallery-10.webp',       url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=900&h=700&fit=crop&q=85' },
  // locations
  { file: 'location-centrum.webp', url: 'https://images.unsplash.com/photo-1766031263281-43cdaa6e624a?w=800&h=500&fit=crop&q=85' },
  { file: 'location-nusle.webp',   url: 'https://images.unsplash.com/photo-1689877020200-403d8542d95d?w=800&h=500&fit=crop&q=85' },
  { file: 'location-zabelice.webp',url: 'https://images.unsplash.com/photo-1649068618811-9f3547ef98fc?w=800&h=500&fit=crop&q=85' },
  { file: 'location-smichov.webp', url: 'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?w=800&h=500&fit=crop&q=85' },
];

async function download(file, url) {
  const dest = path.join(DEST, file);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 10000) throw new Error(`too small (${buf.length}B)`);
      fs.writeFileSync(dest, buf);
      console.log(`✓ ${file} — ${Math.round(buf.length / 1024)}KB`);
      return;
    } catch (e) {
      console.warn(`  attempt ${attempt} failed: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error(`✗ SKIP ${file}`);
}

for (const { file, url } of images) {
  await download(file, url);
}

console.log('\n=== HOTOVO ===');
console.log(`Obrázky uloženy do: public/images/fitness-02/`);
