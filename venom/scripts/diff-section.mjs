#!/usr/bin/env node
// scripts/diff-section.mjs <original-slug> <engine-slug> <section-index>
//
// Porovná dva screenshoty per-section:
//   template-lab/audits/<original-slug>/screenshots/clone-section-<i>-{1440,375}.png
//   template-lab/audits/<engine-slug>/section-<i>/engine-{1440,375}.png
//
// Výstup: template-lab/audits/<engine-slug>/section-<i>/diff-report.json
//
// PASS = layout score ≥ 95 % AND výškový poměr v <0.9, 1.1>.
// Layout score = % stejných pixelů (tolerance 16 / kanál) z PNG po resamplu na
// stejnou výšku/šířku.
//
// Exit 0 = PASS, 1 = FAIL.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import sharp from "sharp";

const origSlug = process.argv[2];
const engSlug = process.argv[3];
const sectionIdx = process.argv[4];
if (!origSlug || !engSlug || !sectionIdx) {
  console.error("Usage: node scripts/diff-section.mjs <original-slug> <engine-slug> <section-index>");
  process.exit(2);
}

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const PIXEL_TOL = 16;          // tolerance na kanál pro "stejný pixel"
const LAYOUT_THRESHOLD = 0.95; // 95 % shodných pixelů
const HEIGHT_TOL = 0.1;        // ±10 % výška

async function compareViewport(vw) {
  const clonePath = join(
    ROOT,
    "template-lab/audits",
    origSlug,
    "screenshots",
    `clone-section-${sectionIdx}-${vw}.png`
  );
  const engPath = join(
    ROOT,
    "template-lab/audits",
    engSlug,
    `section-${sectionIdx}`,
    `engine-${vw}.png`
  );

  if (!existsSync(clonePath)) {
    return { viewport: vw, status: "missing-clone", path: clonePath };
  }
  if (!existsSync(engPath)) {
    return { viewport: vw, status: "missing-engine", path: engPath };
  }

  const clone = sharp(clonePath);
  const eng = sharp(engPath);
  const cm = await clone.metadata();
  const em = await eng.metadata();

  // Resample obě na min šířku, normalizovanou výšku
  const targetW = Math.min(cm.width, em.width);
  const targetH = Math.min(cm.height, em.height);

  const cloneBuf = await clone
    .resize({ width: targetW, height: targetH, fit: "fill" })
    .raw()
    .toBuffer();
  const engBuf = await eng
    .resize({ width: targetW, height: targetH, fit: "fill" })
    .raw()
    .toBuffer();

  let matching = 0;
  const total = targetW * targetH;
  for (let i = 0; i < cloneBuf.length; i += 3) {
    if (
      Math.abs(cloneBuf[i] - engBuf[i]) <= PIXEL_TOL &&
      Math.abs(cloneBuf[i + 1] - engBuf[i + 1]) <= PIXEL_TOL &&
      Math.abs(cloneBuf[i + 2] - engBuf[i + 2]) <= PIXEL_TOL
    ) {
      matching++;
    }
  }
  const layoutScore = matching / total;
  const heightRatio = em.height / cm.height;

  return {
    viewport: vw,
    status: "ok",
    cloneSize: { w: cm.width, h: cm.height },
    engineSize: { w: em.width, h: em.height },
    layoutScore: Number(layoutScore.toFixed(4)),
    heightRatio: Number(heightRatio.toFixed(3)),
    pass:
      layoutScore >= LAYOUT_THRESHOLD &&
      heightRatio >= 1 - HEIGHT_TOL &&
      heightRatio <= 1 + HEIGHT_TOL,
  };
}

const report = {
  origSlug,
  engineSlug: engSlug,
  section: Number(sectionIdx),
  thresholds: { layout: LAYOUT_THRESHOLD, heightTol: HEIGHT_TOL, pixelTol: PIXEL_TOL },
  viewports: [],
  pass: true,
};
for (const vw of [1440, 375]) {
  const r = await compareViewport(vw);
  report.viewports.push(r);
  if (r.status !== "ok" || !r.pass) report.pass = false;
}

const outDir = join(ROOT, "template-lab/audits", engSlug, `section-${sectionIdx}`);
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "diff-report.json");
writeFileSync(outPath, JSON.stringify(report, null, 2));

const COL = report.pass ? "\x1b[32m" : "\x1b[31m";
console.log(`${COL}${report.pass ? "PASS" : "FAIL"}\x1b[0m  section ${sectionIdx}  (${origSlug} → ${engSlug})`);
for (const v of report.viewports) {
  if (v.status !== "ok") {
    console.log(`  ${v.viewport}px  ✗ ${v.status}: ${v.path}`);
  } else {
    console.log(
      `  ${v.viewport}px  layout=${(v.layoutScore * 100).toFixed(1)}%  heightRatio=${v.heightRatio}  ${
        v.pass ? "✓" : "✗"
      }`
    );
  }
}
console.log(`Report: ${outPath}`);

process.exit(report.pass ? 0 : 1);
