import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, initDb } from "@/lib/db";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const DEMO_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

async function requireAdmin(): Promise<{ ok: boolean }> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false };
  const payload = verifyToken(token) as { email?: string } | null;
  return { ok: !!payload };
}

async function runPSI(url: string, strategy: "desktop" | "mobile"): Promise<{
  score: number | null;
  lcp: string; cls: string; tbt: string; fcp: string; si: string;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_PSI_KEY;
  const endpoint = `${PSI_API}?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance${apiKey ? `&key=${apiKey}` : ""}`;
  const res = await fetch(endpoint, { next: { revalidate: 0 } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`PSI API ${res.status}: ${body.slice(0, 120)}`);
  }
  const json = await res.json() as Record<string, unknown>;
  const lr = json.lighthouseResult as Record<string, unknown> | undefined;
  const cats = lr?.categories as Record<string, { score: number }> | undefined;
  const audits = lr?.audits as Record<string, { displayValue?: string }> | undefined;
  const score = cats?.performance?.score != null ? Math.round(cats.performance.score * 100) : null;
  return {
    score,
    lcp: audits?.["largest-contentful-paint"]?.displayValue ?? "–",
    cls: audits?.["cumulative-layout-shift"]?.displayValue ?? "–",
    tbt: audits?.["total-blocking-time"]?.displayValue ?? "–",
    fcp: audits?.["first-contentful-paint"]?.displayValue ?? "–",
    si:  audits?.["speed-index"]?.displayValue ?? "–",
  };
}

// GET — fetch stored results + list all template slugs from DB
export async function GET(req: NextRequest) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initDb();

  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");

  if (slug) {
    // single template — return both strategies
    const rows = await query<{
      strategy: string; score: number | null; lcp: string; cls: string;
      tbt: string; fcp: string; si: string; audited_at: string; error: string | null;
    }>(
      `SELECT strategy, score, lcp, cls, tbt, fcp, si, audited_at, error
       FROM psi_audit_results WHERE template_slug = $1 ORDER BY strategy`,
      [slug]
    );
    return NextResponse.json({ slug, results: rows });
  }

  // All — join with templates table to get known slugs + last scores
  const rows = await query<{
    key: string; name: string; industry: string; review_status: string;
    desktop_score: number | null; desktop_at: string | null;
    mobile_score: number | null; mobile_at: string | null;
  }>(`
    SELECT
      t.key,
      t.name,
      t.industry,
      t.review_status,
      d.score  AS desktop_score,
      d.audited_at AS desktop_at,
      m.score  AS mobile_score,
      m.audited_at AS mobile_at
    FROM templates t
    LEFT JOIN psi_audit_results d ON d.template_slug = t.key AND d.strategy = 'desktop'
    LEFT JOIN psi_audit_results m ON m.template_slug = t.key AND m.strategy = 'mobile'
    ORDER BY t.review_status DESC, t.key
  `);
  return NextResponse.json({ rows });
}

// POST { slug: string, strategy: "desktop"|"mobile"|"both" }
// Runs PSI for one template slug and upserts the result.
export async function POST(req: NextRequest) {
  const { ok } = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initDb();

  const body = await req.json() as { slug?: string; strategy?: string };
  const slug = body.slug?.trim();
  const strategyParam = body.strategy ?? "both";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const url = `${DEMO_BASE}/demo/${slug}`;
  const strategies: Array<"desktop" | "mobile"> =
    strategyParam === "desktop" ? ["desktop"] :
    strategyParam === "mobile"  ? ["mobile"]  :
    ["desktop", "mobile"];

  const results: Record<string, unknown> = {};

  for (const strategy of strategies) {
    try {
      const r = await runPSI(url, strategy);
      await query(
        `INSERT INTO psi_audit_results (template_slug, strategy, score, lcp, cls, tbt, fcp, si, raw_url, error, audited_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,now())
         ON CONFLICT (template_slug, strategy) DO UPDATE SET
           score=$3, lcp=$4, cls=$5, tbt=$6, fcp=$7, si=$8, raw_url=$9, error=NULL, audited_at=now()`,
        [slug, strategy, r.score, r.lcp, r.cls, r.tbt, r.fcp, r.si, url]
      );
      results[strategy] = { ...r, url };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      await query(
        `INSERT INTO psi_audit_results (template_slug, strategy, score, lcp, cls, tbt, fcp, si, raw_url, error, audited_at)
         VALUES ($1,$2,NULL,'–','–','–','–','–',$3,$4,now())
         ON CONFLICT (template_slug, strategy) DO UPDATE SET
           score=NULL, error=$4, audited_at=now()`,
        [slug, strategy, url, errMsg]
      );
      results[strategy] = { error: errMsg };
    }
    // throttle between strategies
    if (strategies.length > 1) await new Promise(r => setTimeout(r, 3000));
  }

  return NextResponse.json({ slug, results });
}
