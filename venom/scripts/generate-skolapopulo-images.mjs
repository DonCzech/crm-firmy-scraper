/**
 * FÁZE 6 — skolapopulo-demo AI images
 */
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const SLUG = 'skolapopulo';
const IMG_DIR = `public/clones/${SLUG}/img`;

function log(m) { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); }

function download(url, dest, minKB = 15) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      const sz = fs.statSync(dest).size;
      if (sz > minKB * 1024) { log(`  SKIP ${path.basename(dest)} (${(sz/1024).toFixed(0)}KB)`); return resolve(true); }
    }
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest, minKB).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < minKB * 1024) return reject(new Error(`Too small: ${buf.length}B from ${url}`));
        fs.writeFileSync(dest, buf);
        log(`  OK ${path.basename(dest)} (${(buf.length/1024).toFixed(0)}KB)`);
        resolve(true);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function pollinationsUrl(prompt, w, h, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true`;
}

const images = [
  {
    file: 'large_Skola_Populo_10_2022_Socials_741_4_7afe053e0a.jpg',
    prompt: 'group of cheerful czech high school students studying together at long table, notebooks textbooks, bright modern classroom, professional educational stock photo',
    w: 800, h: 534, seed: 1001
  },
  {
    file: 'large_DSC_00123_42c323f1ab_1_fad7c99af9.jpeg',
    prompt: 'friendly experienced female teacher tutor helping teenage student with math homework at desk, warm natural light, educational coaching session, professional photo',
    w: 800, h: 600, seed: 1002
  },
  {
    file: 'large_SP_3_2023_806_9058ffa96d.jpg',
    prompt: 'three smiling teenage students working on project together in modern bright school cafeteria, books and laptops, collaborative learning, stock photo',
    w: 800, h: 534, seed: 1003
  },
  {
    file: 'large_Skola_Populo_10_2022_Socials_623_8b08042a9d.jpg',
    prompt: 'happy diverse group of high school students outdoor school courtyard, sunny day, educational campus, cheerful teenagers smiling, professional educational photo',
    w: 800, h: 534, seed: 1004
  },
  {
    file: 'thumbnail_Skola_Populo_10_2022_Socials_612_1_scaled_300x280_c_645fb02c89.jpg',
    prompt: 'smiling young student studying at desk with books, cozy home setting, warm light, focused learning, portrait style',
    w: 300, h: 280, seed: 1005
  },
  {
    file: 'populo-intro.jpg',
    prompt: 'modern bright tutoring learning center interior, students studying at desks, warm welcoming atmosphere, educational institution, wide angle panoramic photo',
    w: 1200, h: 600, seed: 1006
  },
  {
    file: 'large_portrait_smiling_beautiful_blond_woman_writing_down_notes_doing_homework_studying_from_home_doing_1258_254363_5e6344dc8c.jpg',
    prompt: 'beautiful young woman with notebook writing notes studying at home desk, natural window light, cozy home office, focused student portrait, stock photo',
    w: 800, h: 534, seed: 1007
  },
  {
    file: 'large_virtual_classroom_study_space_23_2149178644_1ac594bc94.jpg',
    prompt: 'modern bright virtual classroom study space, multiple students at computers with video calls on screens, clean modern educational office, professional photo',
    w: 800, h: 534, seed: 1008
  },
  {
    file: 'large_Nahledovky_do_videa_Online_vyuka_2_ced763247a.jpg',
    prompt: 'smiling teacher in front of whiteboard waving at camera, online teaching video thumbnail, friendly educator, bright modern classroom background',
    w: 800, h: 450, seed: 1009
  },
  {
    file: 'large_Jak_probiha_doucovani_video_a675dafde4.jpg',
    prompt: 'tutor and student sitting together at table with open books, tutoring session in progress, warm natural light, educational video thumbnail style',
    w: 800, h: 450, seed: 1010
  },
  {
    file: 'large_Nahledovky_do_videa_poznejte_8c20540d5c.jpg',
    prompt: 'team of friendly teachers educators standing together smiling, modern school hallway background, introductory video thumbnail, professional educational photo',
    w: 800, h: 450, seed: 1011
  },
  {
    file: 'small_contact_img_ecb85cd1c6.png',
    prompt: 'professional headshot of friendly female teacher educator, warm genuine smile, neutral light background, modern professional portrait',
    w: 200, h: 200, seed: 1012
  },
  {
    file: 'small_medium_shot_friends_enjoying_blue_matcha_720_fde3456018.jpg',
    prompt: 'two young students friends relaxing at cafe table with drinks and textbooks, casual study break, cheerful and relaxed, stock photo',
    w: 720, h: 480, seed: 1013
  },
  {
    file: 'footer.jpg',
    prompt: 'modern educational institution building exterior at golden hour, clean architectural photo, inspiring learning center, wide landscape',
    w: 1920, h: 400, seed: 1014
  },
  {
    file: 'HP_Lava_strana_CZ_300_DPI_8f1569cbc3.jpg',
    prompt: 'professional educational workbook cover left side, clean minimalist design, study guide book, blue and white color scheme',
    w: 800, h: 600, seed: 1015
  },
  {
    file: 'HP_Prava_strana_CZ_300_DPI_a00f82d561.jpg',
    prompt: 'professional educational workbook cover right side, clean minimalist design, study guide book, blue and white color scheme',
    w: 800, h: 600, seed: 1016
  },
];

for (const img of images) {
  const dest = path.join(IMG_DIR, img.file);
  const url = pollinationsUrl(img.prompt, img.w, img.h, img.seed);
  log(`Generating: ${img.file}`);
  let ok = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await download(url, dest, 15);
      ok = true;
      break;
    } catch (e) {
      log(`  attempt ${attempt} failed: ${e.message}`);
      if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
    }
  }
  if (!ok) log(`  FAILED: ${img.file}`);
  await new Promise(r => setTimeout(r, 800));
}

log('FÁZE 6 DONE ✅');
