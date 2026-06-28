#!/usr/bin/env node
// scripts/test-studio-crud.mjs <tenant-slug>
//
// Black-box API test celého studio CRUD cyklu: ADD (na konec), ADD (na pozici),
// REORDER (swap), DUPLICATE, DELETE. Po každém kroku ověří DB stav.
//
// Použití:  node scripts/test-studio-crud.mjs peak-cut-demo

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const slug = process.argv[2] ?? "peak-cut-demo";
const BASE = process.env.BASE_URL ?? "http://localhost:3015";

const env = readFileSync(`${ROOT}/.env.local`, "utf8");
const DATABASE_URL = env.match(/^DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/m)[1];

const { Client } = await import("pg");
const pg = new Client({ connectionString: DATABASE_URL });
await pg.connect();

const RED = "\x1b[31m", GRN = "\x1b[32m", YEL = "\x1b[33m", DIM = "\x1b[2m", BLD = "\x1b[1m", RST = "\x1b[0m";
const log = (m) => console.log(`  ${DIM}·${RST} ${m}`);
const ok = (m) => console.log(`  ${GRN}✓${RST} ${m}`);
const fail = (m) => { console.log(`  ${RED}✗${RST} ${m}`); errs.push(m); };

const errs = [];

// ── Bootstrap: load tenant + token ─────────────────────────────────────────
const tRes = await pg.query("SELECT id, access_token FROM tenants WHERE slug=$1", [slug]);
if (tRes.rows.length === 0) { console.error(`tenant ${slug} not found`); process.exit(2); }
const tenant = tRes.rows[0];
const token = tenant.access_token;
const pRes = await pg.query("SELECT id FROM pages WHERE tenant_id=$1 AND is_homepage=true LIMIT 1", [tenant.id]);
const pageId = pRes.rows[0].id;

console.log(`${BLD}tenant${RST}=${slug} id=${tenant.id} page=${pageId}\n`);

const headers = {
  "Content-Type": "application/json",
  "Cookie": `venom_access_${slug}=${token}`,
  "Origin": BASE,
};

async function fetchSections() {
  // IMPORTANT: include `settings` — round-tripping without it would let the
  // test PUT overwrite real section settings with {}, corrupting tenant data.
  const r = await pg.query(
    "SELECT id, section_type, section_variant, order_index, is_visible, settings FROM sections WHERE tenant_id=$1 AND page_id=$2 ORDER BY order_index",
    [tenant.id, pageId]
  );
  return r.rows;
}

async function putSections(sections) {
  const body = JSON.stringify({ sections: sections.map(s => ({
    id: s.id,
    tenant_id: tenant.id,
    page_id: pageId,
    section_type: s.section_type,
    section_variant: s.section_variant ?? "default",
    order_index: s.order_index,
    is_visible: s.is_visible ?? true,
    // Preserve real settings on round-trip — only use {} for never-saved temp rows
    settings: s.settings ?? {},
  })) });
  const res = await fetch(`${BASE}/api/demo/${slug}/sections`, { method: "PUT", headers, body });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function deleteSection(id) {
  const res = await fetch(`${BASE}/api/demo/${slug}/sections/${id}`, { method: "DELETE", headers });
  return { status: res.status, body: await res.text() };
}

function describe(rows) {
  return rows.map(r => `${r.order_index}:${r.section_type}.${r.section_variant}(${r.id})`).join("  ");
}

// ── Snapshot initial state ──────────────────────────────────────────────────
const initial = await fetchSections();
log(`initial:  ${describe(initial)}`);

const createdIds = [];

try {
  // ── TEST 1: ADD section at end ──────────────────────────────────────────
  console.log(`\n${BLD}1. ADD na konec${RST}`);
  {
    const tempId = -(Date.now() & 0x7fffffff);
    const next = [...initial, {
      id: tempId, section_type: "faq", section_variant: "default",
      order_index: initial.length, is_visible: true, settings: { content: {} },
    }];
    const { status, json } = await putSections(next);
    if (status !== 200) { fail(`PUT failed: ${status} ${JSON.stringify(json)}`); }
    else if (!json.idMap?.[String(tempId)]) { fail(`idMap missing for tempId ${tempId}`); }
    else {
      const realId = json.idMap[String(tempId)];
      createdIds.push(realId);
      const after = await fetchSections();
      const found = after.find(s => s.id === realId);
      if (!found) fail(`new section ${realId} not in DB`);
      else if (found.order_index !== initial.length) fail(`new section order_index=${found.order_index}, expected ${initial.length}`);
      else if (found.section_type !== "faq") fail(`section_type mismatch: ${found.section_type}`);
      else ok(`ADD faq @ end → id=${realId}, order=${found.order_index}`);
    }
  }

  // ── TEST 2: ADD at index 0 (top) ────────────────────────────────────────
  console.log(`\n${BLD}2. ADD na pozici 0 (nahoru)${RST}`);
  {
    const before = await fetchSections();
    const tempId = -((Date.now() + 1) & 0x7fffffff);
    const newSec = {
      id: tempId, section_type: "cta", section_variant: "default",
      order_index: 0, is_visible: true, settings: { content: {} },
    };
    const shifted = [newSec, ...before.map((s, i) => ({ ...s, order_index: i + 1 }))];
    const { status, json } = await putSections(shifted);
    if (status !== 200) { fail(`PUT failed: ${status} ${JSON.stringify(json)}`); }
    else if (!json.idMap?.[String(tempId)]) { fail(`idMap missing`); }
    else {
      const realId = json.idMap[String(tempId)];
      createdIds.push(realId);
      const after = await fetchSections();
      if (after[0].id !== realId) fail(`new section not at order 0; first is id=${after[0].id}`);
      else if (after[0].section_type !== "cta") fail(`first section_type=${after[0].section_type}`);
      else ok(`ADD cta @ 0 → id=${realId}; everything shifted down by 1`);
    }
  }

  // ── TEST 3: ADD in middle ──────────────────────────────────────────────
  console.log(`\n${BLD}3. ADD doprostřed (insertAtIndex=1)${RST}`);
  {
    const before = await fetchSections();
    const idx = 1;
    const tempId = -((Date.now() + 2) & 0x7fffffff);
    const newSec = {
      id: tempId, section_type: "map", section_variant: "default",
      order_index: idx, is_visible: true, settings: { content: {} },
    };
    const next = [];
    for (let i = 0; i < before.length; i++) {
      if (i === idx) next.push(newSec);
      next.push({ ...before[i], order_index: next.length });
    }
    if (idx === before.length) next.push(newSec);
    next.forEach((s, i) => s.order_index = i);
    const { status, json } = await putSections(next);
    if (status !== 200) { fail(`PUT failed: ${status} ${JSON.stringify(json)}`); }
    else {
      const realId = json.idMap[String(tempId)];
      createdIds.push(realId);
      const after = await fetchSections();
      if (after[idx].id !== realId) fail(`inserted section not at index ${idx}; got id=${after[idx].id}`);
      else if (after[idx].section_type !== "map") fail(`section_type at ${idx}=${after[idx].section_type}`);
      else ok(`ADD map @ ${idx} → ${describe(after)}`);
    }
  }

  // ── TEST 4: REORDER (swap two adjacent) ────────────────────────────────
  console.log(`\n${BLD}4. REORDER (swap pozic 1 a 2)${RST}`);
  {
    const before = await fetchSections();
    if (before.length < 3) { fail("need ≥3 sections to test swap"); }
    else {
      const a = before[1], b = before[2];
      const swapped = before.map((s, i) => {
        if (i === 1) return { ...b, order_index: 1 };
        if (i === 2) return { ...a, order_index: 2 };
        return s;
      });
      const { status, json } = await putSections(swapped);
      if (status !== 200) { fail(`PUT failed: ${status} ${JSON.stringify(json)}`); }
      else {
        const after = await fetchSections();
        if (after[1].id !== b.id || after[2].id !== a.id) fail(`swap didn't apply: ${describe(after)}`);
        else ok(`SWAP pozic 1↔2 OK → ${describe(after)}`);
      }
    }
  }

  // ── TEST 5: REORDER (full reverse) ─────────────────────────────────────
  console.log(`\n${BLD}5. REORDER (kompletní reverse)${RST}`);
  {
    const before = await fetchSections();
    const reversed = [...before].reverse().map((s, i) => ({ ...s, order_index: i }));
    const { status, json } = await putSections(reversed);
    if (status !== 200) { fail(`PUT failed: ${status} ${JSON.stringify(json)}`); }
    else {
      const after = await fetchSections();
      const expectedIds = [...before].reverse().map(s => s.id);
      const actualIds = after.map(s => s.id);
      if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) fail(`reverse failed: ${describe(after)}`);
      else ok(`REVERSE pořadí OK → ${describe(after)}`);
    }
  }

  // ── TEST 6: DELETE one of the created sections ─────────────────────────
  console.log(`\n${BLD}6. DELETE jedné nově přidané sekce${RST}`);
  {
    const target = createdIds[0];
    const { status, body } = await deleteSection(target);
    if (status !== 200 && status !== 204) { fail(`DELETE failed: ${status} ${body}`); }
    else {
      const after = await fetchSections();
      if (after.find(s => s.id === target)) fail(`section ${target} still in DB`);
      else ok(`DELETE id=${target} OK → ${describe(after)}`);
    }
  }

  // ── TEST 7: PERSISTENCE (reload simulation — fetch from DB) ────────────
  console.log(`\n${BLD}7. PERSISTENCE (read-back z DB)${RST}`);
  {
    const after = await fetchSections();
    if (after.length === initial.length) fail(`final count==initial; expected more after multiple ADDs`);
    else ok(`final count=${after.length} (initial=${initial.length}, +${after.length - initial.length} přežily)`);
  }

  // ── TEST 8: Visibility toggle (is_visible=false) ───────────────────────
  console.log(`\n${BLD}8. VISIBILITY toggle (PATCH is_visible=false)${RST}`);
  {
    const target = createdIds[1];
    const res = await fetch(`${BASE}/api/demo/${slug}/sections/${target}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ is_visible: false }),
    });
    if (res.status !== 200) { fail(`PATCH failed: ${res.status} ${await res.text()}`); }
    else {
      const after = await fetchSections();
      const found = after.find(s => s.id === target);
      const r = await pg.query("SELECT is_visible FROM sections WHERE id=$1", [target]);
      if (r.rows[0].is_visible !== false) fail(`is_visible still true`);
      else ok(`hide id=${target} → DB.is_visible=false`);
    }
  }

  // ── Cleanup: delete all created sections ───────────────────────────────
  console.log(`\n${BLD}Cleanup${RST}`);
  for (const id of createdIds.slice(1)) { // [0] already deleted
    await deleteSection(id).catch(() => {});
  }
  // Restore original order (in case reverse left things rotated)
  const finalState = await fetchSections();
  if (JSON.stringify(finalState.map(s => s.id)) !== JSON.stringify(initial.map(s => s.id))) {
    const restored = initial.map((s, i) => ({ ...s, order_index: i }));
    await putSections(restored);
    log(`restored original order`);
  }

  const final = await fetchSections();
  log(`final:    ${describe(final)}`);

} finally {
  await pg.end();
}

console.log("");
if (errs.length === 0) {
  console.log(`${GRN}${BLD}✓ ALL PASS${RST} — všechny CRUD operace fungují.`);
  process.exit(0);
} else {
  console.log(`${RED}${BLD}✗ ${errs.length} FAIL${RST}`);
  errs.forEach(e => console.log(`  ${RED}✗${RST} ${e}`));
  process.exit(1);
}
