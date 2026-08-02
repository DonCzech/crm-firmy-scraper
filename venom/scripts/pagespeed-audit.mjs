#!/usr/bin/env node

/**
 * Resumable Google PageSpeed Insights audit for the complete Venom template set.
 *
 * Commands:
 *   node scripts/pagespeed-audit.mjs batch  --limit 8
 *   node scripts/pagespeed-audit.mjs report
 *   node scripts/pagespeed-audit.mjs status
 *   node scripts/pagespeed-audit.mjs manifest
 *
 * Durable queue state and normalized results live in Postgres. Full PSI responses
 * are gzip-compressed into artifacts/pagespeed/raw for the GitHub Actions artifact.
 */

import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import {
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const TEMPLATE_ROOT = join(ROOT, "src", "templates");
const ARTIFACT_ROOT = join(ROOT, "artifacts", "pagespeed");
const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const DEFAULT_BASE_URL = "https://webero.co";
const DEFAULT_BATCH_LIMIT = 8;
const DEFAULT_MIN_CYCLE_DAYS = 30;
const DEFAULT_MAX_TARGET_ATTEMPTS = 4;
const STALE_LOCK_MINUTES = 30;
const METRIC_AUDIT_IDS = new Set([
  "cumulative-layout-shift",
  "first-contentful-paint",
  "interactive",
  "largest-contentful-paint",
  "max-potential-fid",
  "speed-index",
  "total-blocking-time",
]);

const { Pool } = pg;

async function loadLocalEnv() {
  if (process.env.GITHUB_ACTIONS === "true") return;
  const path = join(ROOT, ".env.local");
  const content = await readFile(path, "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  });
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key] !== undefined) continue;
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value.replace(/\\n/g, "\n");
  }
}

function parseArgs(argv) {
  const command = argv[0] && !argv[0].startsWith("--") ? argv[0] : "status";
  const options = {};
  for (const token of argv.slice(command === argv[0] ? 1 : 0)) {
    if (!token.startsWith("--")) continue;
    const [rawKey, ...rest] = token.slice(2).split("=");
    options[rawKey] = rest.length ? rest.join("=") : true;
  }
  return { command, options };
}

function intOption(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === undefined || value === true) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`Invalid integer option: ${value} (expected ${min}–${max})`);
  }
  return parsed;
}

function normalizeBaseUrl(value) {
  const url = new URL(value || DEFAULT_BASE_URL);
  if (!/^https?:$/.test(url.protocol)) throw new Error("PAGESPEED_BASE_URL must use http(s)");
  return url.toString().replace(/\/$/, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)));
  return sorted[index];
}

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function compactItem(item) {
  if (!item || typeof item !== "object") return null;
  const node = item.node && typeof item.node === "object" ? item.node : null;
  const compact = {
    url: typeof item.url === "string" ? item.url : undefined,
    totalBytes: numberOrNull(item.totalBytes) ?? undefined,
    wastedBytes: numberOrNull(item.wastedBytes) ?? undefined,
    wastedMs: numberOrNull(item.wastedMs) ?? undefined,
    duration: numberOrNull(item.duration) ?? undefined,
    transferSize: numberOrNull(item.transferSize) ?? undefined,
    resourceSize: numberOrNull(item.resourceSize) ?? undefined,
    nodeLabel: typeof node?.nodeLabel === "string" ? node.nodeLabel.slice(0, 240) : undefined,
    snippet: typeof node?.snippet === "string" ? node.snippet.slice(0, 400) : undefined,
  };
  return Object.fromEntries(Object.entries(compact).filter(([, value]) => value !== undefined));
}

function extractFindings(audits) {
  if (!audits || typeof audits !== "object") return [];
  const findings = [];
  for (const [id, audit] of Object.entries(audits)) {
    if (!audit || typeof audit !== "object") continue;
    if (METRIC_AUDIT_IDS.has(id)) continue;
    const details = audit.details && typeof audit.details === "object" ? audit.details : {};
    const savingsMs = numberOrNull(details.overallSavingsMs);
    const savingsBytes = numberOrNull(details.overallSavingsBytes);
    const score = numberOrNull(audit.score);
    const failedNumericAudit = score !== null && score < 0.9;
    const actionableSavings = (savingsMs ?? 0) > 0 || (savingsBytes ?? 0) > 0;
    if (!failedNumericAudit && !actionableSavings) continue;

    const items = Array.isArray(details.items)
      ? details.items.map(compactItem).filter(Boolean).slice(0, 25)
      : [];
    findings.push({
      id,
      title: typeof audit.title === "string" ? audit.title : id,
      score,
      displayValue: typeof audit.displayValue === "string" ? audit.displayValue : null,
      savingsMs,
      savingsBytes,
      items,
    });
  }
  return findings;
}

function extractMeasurement(json, target) {
  const lighthouse = json?.lighthouseResult;
  if (!lighthouse?.audits || !lighthouse?.categories) {
    throw new Error("PSI response does not contain lighthouseResult");
  }
  const audits = lighthouse.audits;
  const metric = (id) => numberOrNull(audits[id]?.numericValue);
  const display = (id) => typeof audits[id]?.displayValue === "string" ? audits[id].displayValue : "–";
  const scoreRaw = numberOrNull(lighthouse.categories.performance?.score);
  return {
    templateKey: target.template_key,
    demoSlug: target.demo_slug,
    strategy: target.strategy,
    url: target.url,
    score: scoreRaw === null ? null : Math.round(scoreRaw * 100),
    metrics: {
      fcpMs: metric("first-contentful-paint"),
      lcpMs: metric("largest-contentful-paint"),
      tbtMs: metric("total-blocking-time"),
      cls: metric("cumulative-layout-shift"),
      speedIndexMs: metric("speed-index"),
      ttfbMs: metric("server-response-time") ?? metric("document-latency-insight"),
      totalBytes: metric("total-byte-weight"),
      display: {
        fcp: display("first-contentful-paint"),
        lcp: display("largest-contentful-paint"),
        tbt: display("total-blocking-time"),
        cls: display("cumulative-layout-shift"),
        speedIndex: display("speed-index"),
      },
    },
    findings: extractFindings(audits),
    environment: {
      lighthouseVersion: lighthouse.lighthouseVersion ?? null,
      fetchTime: lighthouse.fetchTime ?? null,
      benchmarkIndex: numberOrNull(lighthouse.environment?.benchmarkIndex),
      userAgent: lighthouse.userAgent ?? null,
      finalUrl: lighthouse.finalDisplayedUrl ?? lighthouse.finalUrl ?? target.url,
      warnings: Array.isArray(lighthouse.runWarnings) ? lighthouse.runWarnings : [],
    },
  };
}

async function discoverTemplateManifests() {
  const entries = await readdir(TEMPLATE_ROOT, { withFileTypes: true });
  const templates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const path = join(TEMPLATE_ROOT, entry.name, "template.json");
    try {
      const manifest = JSON.parse(await readFile(path, "utf8"));
      if (manifest.visibility === "private") continue;
      templates.push({
        key: entry.name,
        name: typeof manifest.name === "string" ? manifest.name : entry.name,
      });
    } catch (error) {
      if (error?.code !== "ENOENT") throw new Error(`Invalid template manifest ${path}: ${error.message}`);
    }
  }
  return templates.sort((a, b) => a.key.localeCompare(b.key));
}

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the durable PageSpeed queue");
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
    max: 3,
    application_name: "venom-pagespeed-audit",
  });
}

async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pagespeed_audit_runs (
      id BIGSERIAL PRIMARY KEY,
      status TEXT NOT NULL CHECK (status IN ('collecting','completed')) DEFAULT 'collecting',
      base_url TEXT NOT NULL,
      manifest JSONB NOT NULL DEFAULT '[]',
      manifest_hash TEXT NOT NULL,
      target_count INTEGER NOT NULL DEFAULT 0,
      completed_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS pagespeed_audit_targets (
      id BIGSERIAL PRIMARY KEY,
      run_id BIGINT NOT NULL REFERENCES pagespeed_audit_runs(id) ON DELETE CASCADE,
      template_key TEXT NOT NULL,
      demo_slug TEXT NOT NULL,
      strategy TEXT NOT NULL CHECK (strategy IN ('mobile','desktop')),
      url TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending','running','completed','failed')) DEFAULT 'pending',
      attempt_count INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      locked_at TIMESTAMPTZ,
      last_error TEXT,
      completed_at TIMESTAMPTZ,
      UNIQUE (run_id, template_key, strategy)
    );
    CREATE INDEX IF NOT EXISTS idx_pagespeed_targets_queue
      ON pagespeed_audit_targets(run_id, status, next_attempt_at, strategy, template_key);

    CREATE TABLE IF NOT EXISTS pagespeed_audit_measurements (
      id BIGSERIAL PRIMARY KEY,
      run_id BIGINT NOT NULL REFERENCES pagespeed_audit_runs(id) ON DELETE CASCADE,
      target_id BIGINT NOT NULL REFERENCES pagespeed_audit_targets(id) ON DELETE CASCADE,
      template_key TEXT NOT NULL,
      demo_slug TEXT NOT NULL,
      strategy TEXT NOT NULL CHECK (strategy IN ('mobile','desktop')),
      url TEXT NOT NULL,
      score INTEGER,
      metrics JSONB NOT NULL DEFAULT '{}',
      findings JSONB NOT NULL DEFAULT '[]',
      environment JSONB NOT NULL DEFAULT '{}',
      measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, template_key, strategy)
    );
    CREATE INDEX IF NOT EXISTS idx_pagespeed_measurements_run
      ON pagespeed_audit_measurements(run_id, strategy, score);

    -- Compatibility table used by the existing /admin/psi-audit dashboard.
    CREATE TABLE IF NOT EXISTS psi_audit_results (
      id SERIAL PRIMARY KEY,
      template_slug TEXT NOT NULL,
      strategy TEXT NOT NULL CHECK (strategy IN ('desktop','mobile')),
      score INTEGER,
      lcp TEXT,
      cls TEXT,
      tbt TEXT,
      fcp TEXT,
      si TEXT,
      raw_url TEXT,
      error TEXT,
      audited_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (template_slug, strategy)
    );
  `);
}

async function resolveManifest(pool, baseUrl) {
  const manifests = await discoverTemplateManifests();
  const keys = manifests.map((item) => item.key);
  const rows = await pool.query(`
    SELECT tpl.key,
      COALESCE(
        (SELECT t.slug FROM tenants t WHERE t.slug = tpl.primary_demo_slug LIMIT 1),
        (SELECT t.slug FROM tenants t WHERE t.template_id = tpl.id AND t.slug = tpl.key || '-v2' LIMIT 1),
        (SELECT t.slug FROM tenants t WHERE t.template_id = tpl.id AND t.slug = tpl.key || '-demo' LIMIT 1),
        (SELECT t.slug FROM tenants t WHERE t.template_id = tpl.id AND t.slug = tpl.key LIMIT 1),
        (SELECT t.slug FROM tenants t
          WHERE t.template_id = tpl.id
            AND EXISTS (
              SELECT 1 FROM sections s
              WHERE s.tenant_id = t.id AND s.content_source = 'v2'
            )
          ORDER BY t.id LIMIT 1)
      ) AS demo_slug
    FROM templates tpl
    WHERE tpl.key = ANY($1::text[])
  `, [keys]);
  const demoByKey = new Map(rows.rows.map((row) => [row.key, row.demo_slug]));
  return manifests.map((item) => {
    const demoSlug = demoByKey.get(item.key) ?? null;
    return {
      ...item,
      demoSlug,
      url: demoSlug ? `${baseUrl}/demo/${encodeURIComponent(demoSlug)}` : null,
    };
  });
}

async function createOrGetRun(pool, { baseUrl, minCycleDays, forceNew = false }) {
  const active = await pool.query(
    "SELECT * FROM pagespeed_audit_runs WHERE status='collecting' ORDER BY id DESC LIMIT 1"
  );
  if (active.rows[0]) return { run: active.rows[0], created: false, waiting: false };

  const latest = await pool.query(
    "SELECT * FROM pagespeed_audit_runs WHERE status='completed' ORDER BY completed_at DESC NULLS LAST, id DESC LIMIT 1"
  );
  if (!forceNew && latest.rows[0]?.completed_at) {
    const ageMs = Date.now() - new Date(latest.rows[0].completed_at).getTime();
    if (ageMs < minCycleDays * 86_400_000) {
      return { run: latest.rows[0], created: false, waiting: true };
    }
  }

  const manifest = await resolveManifest(pool, baseUrl);
  const mapped = manifest.filter((item) => item.url);
  if (!mapped.length) throw new Error("No public demo URL could be resolved from the Venom database");
  const manifestHash = createHash("sha256").update(JSON.stringify(manifest)).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [0x505349]);
    const concurrent = await client.query(
      "SELECT * FROM pagespeed_audit_runs WHERE status='collecting' ORDER BY id DESC LIMIT 1"
    );
    if (concurrent.rows[0]) {
      await client.query("COMMIT");
      return { run: concurrent.rows[0], created: false, waiting: false };
    }
    const inserted = await client.query(`
      INSERT INTO pagespeed_audit_runs(base_url, manifest, manifest_hash, target_count)
      VALUES ($1, $2::jsonb, $3, $4)
      RETURNING *
    `, [baseUrl, JSON.stringify(manifest), manifestHash, mapped.length * 2]);
    const run = inserted.rows[0];
    for (const item of mapped) {
      for (const strategy of ["mobile", "desktop"]) {
        await client.query(`
          INSERT INTO pagespeed_audit_targets(run_id, template_key, demo_slug, strategy, url)
          VALUES ($1,$2,$3,$4,$5)
        `, [run.id, item.key, item.demoSlug, strategy, item.url]);
      }
    }
    await client.query("COMMIT");
    return { run, created: true, waiting: false };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function claimTargets(pool, runId, limit, maxAttempts) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      UPDATE pagespeed_audit_targets
      SET status='pending', locked_at=NULL,
          last_error=COALESCE(last_error, 'Recovered stale worker lock')
      WHERE run_id=$1 AND status='running'
        AND locked_at < now() - ($2::text || ' minutes')::interval
    `, [runId, STALE_LOCK_MINUTES]);
    const claimed = await client.query(`
      WITH next_targets AS (
        SELECT id
        FROM pagespeed_audit_targets
        WHERE run_id=$1
          AND status='pending'
          AND attempt_count < $3
          AND next_attempt_at <= now()
        ORDER BY CASE strategy WHEN 'mobile' THEN 0 ELSE 1 END, template_key
        FOR UPDATE SKIP LOCKED
        LIMIT $2
      )
      UPDATE pagespeed_audit_targets target
      SET status='running', locked_at=now(), attempt_count=attempt_count + 1
      FROM next_targets
      WHERE target.id=next_targets.id
      RETURNING target.*
    `, [runId, limit, maxAttempts]);
    await client.query("COMMIT");
    return claimed.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function requestPsi(target, apiKey) {
  const endpoint = new URL(PSI_ENDPOINT);
  endpoint.searchParams.set("url", target.url);
  endpoint.searchParams.set("strategy", target.strategy);
  endpoint.searchParams.set("category", "performance");
  endpoint.searchParams.set("key", apiKey);

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json", "User-Agent": "webero-pagespeed-audit/1.0" },
        signal: AbortSignal.timeout(150_000),
      });
      if (response.ok) return await response.json();
      const body = await response.text().catch(() => "");
      const error = new Error(`PSI API ${response.status}: ${body.slice(0, 500)}`);
      error.status = response.status;
      error.retryAfter = Number.parseInt(response.headers.get("retry-after") ?? "", 10) || null;
      if (response.status !== 429 && response.status < 500) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (error?.status && error.status !== 429 && error.status < 500) throw error;
    }
    if (attempt < 3) {
      const retrySeconds = lastError?.retryAfter ?? (5 * (2 ** (attempt - 1)) + Math.random() * 2);
      await sleep(retrySeconds * 1000);
    }
  }
  throw lastError ?? new Error("PSI request failed");
}

async function writeRawArtifact(runId, target, json) {
  const safeName = `${target.template_key}-${target.strategy}`.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const directory = join(ARTIFACT_ROOT, "raw", `run-${runId}`);
  await mkdir(directory, { recursive: true });
  const path = join(directory, `${safeName}.json.gz`);
  await writeFile(path, gzipSync(Buffer.from(`${JSON.stringify(json)}\n`), { level: 9 }));
  return path;
}

async function saveSuccess(pool, runId, target, measurement) {
  const display = measurement.metrics.display;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      INSERT INTO pagespeed_audit_measurements(
        run_id,target_id,template_key,demo_slug,strategy,url,score,metrics,findings,environment
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb)
      ON CONFLICT (run_id,template_key,strategy) DO UPDATE SET
        target_id=EXCLUDED.target_id, demo_slug=EXCLUDED.demo_slug, url=EXCLUDED.url,
        score=EXCLUDED.score, metrics=EXCLUDED.metrics, findings=EXCLUDED.findings,
        environment=EXCLUDED.environment, measured_at=now()
    `, [
      runId, target.id, target.template_key, target.demo_slug, target.strategy, target.url,
      measurement.score, JSON.stringify(measurement.metrics), JSON.stringify(measurement.findings),
      JSON.stringify(measurement.environment),
    ]);
    await client.query(`
      UPDATE pagespeed_audit_targets
      SET status='completed', completed_at=now(), locked_at=NULL, last_error=NULL
      WHERE id=$1
    `, [target.id]);

    // Keep the existing admin dashboard current, but with the correct public demo slug.
    await client.query(`
      INSERT INTO psi_audit_results(
        template_slug,strategy,score,lcp,cls,tbt,fcp,si,raw_url,error,audited_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,now())
      ON CONFLICT (template_slug,strategy) DO UPDATE SET
        score=EXCLUDED.score, lcp=EXCLUDED.lcp, cls=EXCLUDED.cls,
        tbt=EXCLUDED.tbt, fcp=EXCLUDED.fcp, si=EXCLUDED.si,
        raw_url=EXCLUDED.raw_url, error=NULL, audited_at=now()
    `, [
      target.template_key, target.strategy, measurement.score, display.lcp, display.cls,
      display.tbt, display.fcp, display.speedIndex, target.url,
    ]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function saveFailure(pool, target, error, maxAttempts) {
  const message = error instanceof Error ? error.message : String(error);
  const terminal = target.attempt_count >= maxAttempts;
  const retryMinutes = Math.min(360, 15 * (2 ** Math.max(0, target.attempt_count - 1)));
  await pool.query(`
    UPDATE pagespeed_audit_targets
    SET status=$2, locked_at=NULL, last_error=$3,
        next_attempt_at=CASE WHEN $2='pending' THEN now() + ($4::text || ' minutes')::interval ELSE next_attempt_at END,
        completed_at=CASE WHEN $2='failed' THEN now() ELSE completed_at END
    WHERE id=$1
  `, [target.id, terminal ? "failed" : "pending", message.slice(0, 2000), retryMinutes]);
  return { terminal, message };
}

async function refreshRun(pool, runId) {
  const counts = await pool.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status='completed')::int AS completed,
      count(*) FILTER (WHERE status='failed')::int AS failed,
      count(*) FILTER (WHERE status IN ('pending','running'))::int AS remaining
    FROM pagespeed_audit_targets WHERE run_id=$1
  `, [runId]);
  const count = counts.rows[0];
  const finished = count.remaining === 0;
  const updated = await pool.query(`
    UPDATE pagespeed_audit_runs
    SET status=CASE WHEN $2 THEN 'completed' ELSE 'collecting' END,
        completed_count=$3, failed_count=$4, updated_at=now(),
        completed_at=CASE WHEN $2 THEN COALESCE(completed_at,now()) ELSE NULL END
    WHERE id=$1 RETURNING *
  `, [runId, finished, count.completed, count.failed]);
  return { ...updated.rows[0], remaining: count.remaining, completedNow: finished };
}

const RECOMMENDATIONS = {
  "render-blocking-insight": "Sloučit kritické styly, odložit nekritické CSS/JS a prověřit společný layout šablon.",
  "render-blocking-resources": "Sloučit kritické styly, odložit nekritické CSS/JS a prověřit společný layout šablon.",
  "unused-javascript": "Rozdělit klientský bundle a načítat galerie, mapy, video a editory až při skutečném použití.",
  "unused-css-rules": "Rozdělit společný CSS balík podle šablon/sekcí a odstranit pravidla neposílaná na danou stránku.",
  "image-delivery-insight": "Generovat správné AVIF/WebP varianty, doplnit sizes/srcset a neposílat větší obrázek než viewport potřebuje.",
  "uses-optimized-images": "Překomprimovat označené obrázky a zachovat jejich vizuální rozměry.",
  "uses-responsive-images": "Doplnit responzivní varianty a přesné sizes pro postižené společné komponenty.",
  "offscreen-images": "Lazy-loadnout obrázky mimo první viewport; LCP obrázek naopak nesmí být lazy.",
  "unsized-images": "Doplnit skutečné width/height nebo aspect-ratio do společných image rendererů a odstranit tím posuny layoutu.",
  "lcp-discovery-insight": "Zajistit, aby byl LCP zdroj v prvním HTML, měl fetchpriority=high a nebyl skrytý za JS/CSS backgroundem.",
  "largest-contentful-paint-element": "Najít společný hero renderer a optimalizovat konkrétní LCP prvek i jeho zdroj.",
  "font-display": "Lokalizovat fonty, použít font-display: swap/optional a preloadnout pouze skutečně kritický řez.",
  "font-display-insight": "Lokalizovat fonty, použít font-display: swap/optional a preloadnout pouze skutečně kritický řez.",
  "total-byte-weight": "Seřadit největší obrázky, video a JS podle opakování; opravit nejdřív sdílené zdroje.",
  "mainthread-work-breakdown": "Omezit hydrataci a klientské komponenty; statický obsah nechat serverový.",
  "bootup-time": "Rozdělit nebo odložit skripty s nejvyšší dobou parsování a vykonávání.",
  "legacy-javascript-insight": "Prověřit browserslist a transpilační výstup; moderním prohlížečům neposílat zbytečné polyfilly a legacy transformace.",
  "long-tasks": "Rozdělit dlouhé úlohy, omezit animace a práci při prvním renderu.",
  "dom-size-insight": "Zjednodušit opakované markup struktury a virtualizovat velké galerie/seznamy.",
  "dom-size": "Zjednodušit opakované markup struktury a virtualizovat velké galerie/seznamy.",
  "cls-culprits-insight": "Rezervovat rozměry médií a odstranit pozdní změny fontů, bannerů a sticky prvků.",
  "layout-shifts": "Rezervovat rozměry médií a odstranit pozdní změny fontů, bannerů a sticky prvků.",
  "third-parties-insight": "Načítat mapy, videa, chaty a analytiku až po interakci nebo souhlasu.",
  "third-party-summary": "Načítat mapy, videa, chaty a analytiku až po interakci nebo souhlasu.",
  "document-latency-insight": "Prověřit cache hlavního dokumentu, databázové dotazy a serverový render společné demo routy.",
  "server-response-time": "Prověřit cache hlavního dokumentu, databázové dotazy a serverový render společné demo routy.",
};

function normalizeResource(value, baseUrl) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, baseUrl);
    const path = decodeURIComponent(url.pathname);
    return url.origin === new URL(baseUrl).origin ? path : `${url.hostname}${path}`;
  } catch {
    return value.slice(0, 300);
  }
}

function aggregatePatterns(measurements, baseUrl) {
  const groups = new Map();
  for (const measurement of measurements) {
    const findings = Array.isArray(measurement.findings) ? measurement.findings : [];
    for (const finding of findings) {
      if (METRIC_AUDIT_IDS.has(finding.id)) continue;
      const key = `${measurement.strategy}:${finding.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          strategy: measurement.strategy,
          auditId: finding.id,
          title: finding.title || finding.id,
          templates: new Set(),
          savingsMs: [],
          savingsBytes: [],
          resources: new Map(),
        });
      }
      const group = groups.get(key);
      group.templates.add(measurement.template_key);
      if (typeof finding.savingsMs === "number") group.savingsMs.push(finding.savingsMs);
      if (typeof finding.savingsBytes === "number") group.savingsBytes.push(finding.savingsBytes);
      for (const item of finding.items ?? []) {
        const resource = normalizeResource(item.url, baseUrl);
        if (!resource) continue;
        if (!group.resources.has(resource)) group.resources.set(resource, new Set());
        group.resources.get(resource).add(measurement.template_key);
      }
    }
  }
  return [...groups.values()].map((group) => ({
    strategy: group.strategy,
    auditId: group.auditId,
    title: group.title,
    affectedCount: group.templates.size,
    templates: [...group.templates].sort(),
    medianSavingsMs: percentile(group.savingsMs, 0.5),
    totalSavingsBytes: group.savingsBytes.reduce((sum, value) => sum + value, 0),
    commonResources: [...group.resources.entries()]
      .map(([resource, templates]) => ({ resource, affectedCount: templates.size }))
      .filter((item) => item.affectedCount >= 2)
      .sort((a, b) => b.affectedCount - a.affectedCount)
      .slice(0, 5),
    recommendation: RECOMMENDATIONS[group.auditId]
      ?? "Prověřit společný renderer nebo asset pipeline u zasažených šablon a ověřit opravu na reprezentativním vzorku.",
  })).sort((a, b) =>
    b.affectedCount - a.affectedCount
      || (b.medianSavingsMs ?? 0) - (a.medianSavingsMs ?? 0)
      || a.auditId.localeCompare(b.auditId)
  );
}

function markdownEscape(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function loadRunData(pool, requestedRunId) {
  const runResult = requestedRunId
    ? await pool.query("SELECT * FROM pagespeed_audit_runs WHERE id=$1", [requestedRunId])
    : await pool.query("SELECT * FROM pagespeed_audit_runs ORDER BY id DESC LIMIT 1");
  const run = runResult.rows[0];
  if (!run) return null;
  const [targets, measurements] = await Promise.all([
    pool.query("SELECT * FROM pagespeed_audit_targets WHERE run_id=$1 ORDER BY strategy,template_key", [run.id]),
    pool.query("SELECT * FROM pagespeed_audit_measurements WHERE run_id=$1 ORDER BY strategy,template_key", [run.id]),
  ]);
  return { run, targets: targets.rows, measurements: measurements.rows };
}

function buildReport(data) {
  const { run, targets, measurements } = data;
  const manifest = Array.isArray(run.manifest) ? run.manifest : [];
  const missingDemos = manifest.filter((item) => !item.url);
  const patterns = aggregatePatterns(measurements, run.base_url);
  const byStrategy = {};
  for (const strategy of ["mobile", "desktop"]) {
    const rows = measurements.filter((row) => row.strategy === strategy && typeof row.score === "number");
    const scores = rows.map((row) => row.score);
    byStrategy[strategy] = {
      measured: rows.length,
      averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
      medianScore: percentile(scores, 0.5),
      minimumScore: scores.length ? Math.min(...scores) : null,
      below90: scores.filter((score) => score < 90).length,
      below50: scores.filter((score) => score < 50).length,
    };
  }
  const failed = targets.filter((target) => target.status === "failed");
  const summary = {
    generatedAt: new Date().toISOString(),
    run: {
      id: Number(run.id),
      status: run.status,
      startedAt: run.started_at,
      completedAt: run.completed_at,
      baseUrl: run.base_url,
      templateCount: manifest.length,
      targetCount: targets.length,
      completedCount: targets.filter((target) => target.status === "completed").length,
      failedCount: failed.length,
      pendingCount: targets.filter((target) => ["pending", "running"].includes(target.status)).length,
      progressPercent: targets.length
        ? Math.round((targets.filter((target) => ["completed", "failed"].includes(target.status)).length / targets.length) * 1000) / 10
        : 0,
    },
    byStrategy,
    missingDemos,
    failedTargets: failed.map((target) => ({
      templateKey: target.template_key,
      strategy: target.strategy,
      url: target.url,
      error: target.last_error,
    })),
    patterns,
  };

  const lines = [
    `# Venom PageSpeed audit — běh #${summary.run.id}`,
    "",
    `- Stav: **${summary.run.status}**`,
    `- Pokrok: **${summary.run.completedCount + summary.run.failedCount}/${summary.run.targetCount} (${summary.run.progressPercent} %)**`,
    `- Šablon v manifestu: **${summary.run.templateCount}**`,
    `- Zahájeno: ${new Date(summary.run.startedAt).toISOString()}`,
    `- Dokončeno: ${summary.run.completedAt ? new Date(summary.run.completedAt).toISOString() : "ještě ne"}`,
    "",
    "## Souhrn skóre",
    "",
    "| Režim | Změřeno | Průměr | Medián | Minimum | Pod 90 | Pod 50 |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...["mobile", "desktop"].map((strategy) => {
      const item = byStrategy[strategy];
      return `| ${strategy} | ${item.measured} | ${item.averageScore ?? "–"} | ${item.medianScore ?? "–"} | ${item.minimumScore ?? "–"} | ${item.below90} | ${item.below50} |`;
    }),
    "",
    "## Opakující se vzorce",
    "",
  ];

  if (!patterns.length) {
    lines.push("Zatím nejsou k dispozici žádné akční nálezy.", "");
  } else {
    for (const [index, pattern] of patterns.slice(0, 25).entries()) {
      lines.push(
        `### ${index + 1}. ${markdownEscape(pattern.title)} — ${pattern.strategy}`,
        "",
        `- Audit ID: \`${pattern.auditId}\``,
        `- Zasaženo: **${pattern.affectedCount} šablon**`,
        `- Typická odhadovaná úspora: ${pattern.medianSavingsMs == null ? "neuvedena" : `${Math.round(pattern.medianSavingsMs)} ms`}`,
        `- Šablony: ${pattern.templates.slice(0, 24).map((item) => `\`${item}\``).join(", ")}${pattern.templates.length > 24 ? ` a dalších ${pattern.templates.length - 24}` : ""}`,
        `- Doporučené řešení: ${pattern.recommendation}`,
      );
      if (pattern.commonResources.length) {
        lines.push("- Společné zdroje:");
        for (const resource of pattern.commonResources) {
          lines.push(`  - \`${resource.resource}\` (${resource.affectedCount} šablon)`);
        }
      }
      lines.push("");
    }
  }

  if (missingDemos.length) {
    lines.push(
      "## Šablony bez dohledatelného veřejného dema",
      "",
      missingDemos.map((item) => `\`${item.key}\``).join(", "),
      "",
    );
  }
  if (failed.length) {
    lines.push("## Trvale neúspěšná měření", "");
    for (const target of failed) {
      lines.push(`- \`${target.template_key}\` / ${target.strategy}: ${markdownEscape(target.last_error)}`);
    }
    lines.push("");
  }
  lines.push(
    "## Bezpečný postup opravy",
    "",
    "1. Vybrat nejvýše hodnocený společný vzorec.",
    "2. Dohledat společný renderer, CSS nebo asset pipeline v repozitáři.",
    "3. Opravit jednu reprezentativní šablonu v izolované větvi/worktree.",
    "4. Ověřit vizuální regresi, build a opakovaný PSI test.",
    "5. Teprve po prokázaném zlepšení aplikovat změnu na celou zasaženou skupinu.",
    "",
  );
  return { summary, markdown: `${lines.join("\n")}\n` };
}

async function writeReport(data) {
  const report = buildReport(data);
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  const markdownPath = join(ARTIFACT_ROOT, "report.md");
  const jsonPath = join(ARTIFACT_ROOT, "report.json");
  await writeFile(markdownPath, report.markdown, "utf8");
  await writeFile(jsonPath, `${JSON.stringify(report.summary, null, 2)}\n`, "utf8");
  return { ...report, markdownPath, jsonPath };
}

async function writeGithubOutputs(values) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  const existing = await readFile(outputPath, "utf8").catch(() => "");
  const lines = Object.entries(values).map(([key, value]) => `${key}=${String(value).replace(/\n/g, " ")}`);
  await writeFile(outputPath, `${existing}${lines.join("\n")}\n`, "utf8");
}

async function runBatch(pool, options) {
  const apiKey = process.env.GOOGLE_PSI_KEY;
  if (!apiKey) throw new Error("GOOGLE_PSI_KEY is required for PageSpeed API calls");
  const limit = intOption(options.limit ?? process.env.PAGESPEED_BATCH_LIMIT, DEFAULT_BATCH_LIMIT, { min: 1, max: 25 });
  const minCycleDays = intOption(
    options["min-cycle-days"] ?? process.env.PAGESPEED_MIN_CYCLE_DAYS,
    DEFAULT_MIN_CYCLE_DAYS,
    { min: 1, max: 365 },
  );
  const maxAttempts = intOption(process.env.PAGESPEED_MAX_TARGET_ATTEMPTS, DEFAULT_MAX_TARGET_ATTEMPTS, { min: 1, max: 10 });
  const delayMs = intOption(process.env.PAGESPEED_REQUEST_DELAY_MS, 2500, { min: 0, max: 60_000 });
  const baseUrl = normalizeBaseUrl(options["base-url"] ?? process.env.PAGESPEED_BASE_URL);
  const runState = await createOrGetRun(pool, {
    baseUrl,
    minCycleDays,
    forceNew: options["force-new"] === true || options["force-new"] === "true",
  });
  if (runState.waiting) {
    const data = await loadRunData(pool, runState.run.id);
    const report = await writeReport(data);
    console.log(`Latest run #${runState.run.id} is complete; next full cycle is not due yet.`);
    await writeGithubOutputs({ run_id: runState.run.id, completed: true, completed_now: false, processed: 0 });
    return report.summary;
  }

  const runId = runState.run.id;
  const targets = await claimTargets(pool, runId, limit, maxAttempts);
  console.log(`${runState.created ? "Created" : "Continuing"} run #${runId}; claimed ${targets.length} targets.`);
  let successful = 0;
  let failed = 0;
  for (const [index, target] of targets.entries()) {
    console.log(`[${index + 1}/${targets.length}] ${target.strategy.padEnd(7)} ${target.template_key} → ${target.url}`);
    try {
      const json = await requestPsi(target, apiKey);
      const measurement = extractMeasurement(json, target);
      await writeRawArtifact(runId, target, json);
      await saveSuccess(pool, runId, target, measurement);
      successful += 1;
      console.log(`  score ${measurement.score ?? "–"}, LCP ${measurement.metrics.display.lcp}, TBT ${measurement.metrics.display.tbt}`);
    } catch (error) {
      const result = await saveFailure(pool, target, error, maxAttempts);
      failed += 1;
      console.error(`  ${result.terminal ? "FAILED" : "retry scheduled"}: ${result.message.slice(0, 500)}`);
    }
    if (index < targets.length - 1 && delayMs > 0) await sleep(delayMs);
  }
  const refreshed = await refreshRun(pool, runId);
  const data = await loadRunData(pool, runId);
  const report = await writeReport(data);
  console.log(`Run #${runId}: ${refreshed.completed_count} completed, ${refreshed.failed_count} failed, ${refreshed.remaining} remaining.`);
  await writeGithubOutputs({
    run_id: runId,
    completed: refreshed.status === "completed",
    completed_now: refreshed.completedNow,
    processed: targets.length,
    successful,
    failed,
    progress_percent: report.summary.run.progressPercent,
  });
  return report.summary;
}

async function main() {
  await loadLocalEnv();
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === "manifest" && !process.env.DATABASE_URL) {
    const manifests = await discoverTemplateManifests();
    console.log(JSON.stringify({ count: manifests.length, templates: manifests }, null, 2));
    return;
  }

  const pool = createPool();
  try {
    await ensureSchema(pool);
    if (command === "batch") {
      await runBatch(pool, options);
      return;
    }
    if (command === "manifest") {
      const baseUrl = normalizeBaseUrl(options["base-url"] ?? process.env.PAGESPEED_BASE_URL);
      const manifest = await resolveManifest(pool, baseUrl);
      const result = {
        count: manifest.length,
        mapped: manifest.filter((item) => item.url).length,
        missing: manifest.filter((item) => !item.url).map((item) => item.key),
        templates: manifest,
      };
      if (options.summary) delete result.templates;
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (command === "report" || command === "status") {
      const runId = options.run ? intOption(options.run, null) : null;
      const data = await loadRunData(pool, runId);
      if (!data) {
        console.log("No PageSpeed audit run exists yet.");
        return;
      }
      const report = await writeReport(data);
      if (command === "report") console.log(report.markdown);
      else console.log(JSON.stringify(report.summary, null, 2));
      return;
    }
    throw new Error(`Unknown command: ${command}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
