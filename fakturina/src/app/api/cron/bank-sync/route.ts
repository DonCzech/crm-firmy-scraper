import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initDb, query } from "@/lib/db";
import { BankConnection, syncBankConnection } from "@/lib/bank-sync";
import { hasValidCronSecret } from "@/lib/security";

export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron není nakonfigurován" }, { status: 503 });
  }
  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDb();
  const runId = randomUUID();
  await query(
    `INSERT INTO fak_automation_runs (id, type, status, started_at, summary)
     VALUES ($1, 'bank_sync', 'running', $2, $3)`,
    [runId, Math.floor(Date.now() / 1000), JSON.stringify({ source: "cron" })]
  );

  const { rows } = await query(
    "SELECT * FROM fak_bank_connections WHERE active = true ORDER BY created_at ASC"
  );

  const results = [];
  for (const connection of rows as BankConnection[]) {
    try {
      const result = await syncBankConnection(connection);
      results.push({ connectionId: connection.id, companyId: connection.company_id, ok: true, ...result });
    } catch (err) {
      results.push({
        connectionId: connection.id,
        companyId: connection.company_id,
        ok: false,
        error: err instanceof Error ? err.message : "Synchronizace selhala",
      });
    }
  }

  const response = {
    ok: results.every((item) => item.ok),
    processed: results.length,
    results,
  };

  await query(
    `UPDATE fak_automation_runs
     SET status = $1, finished_at = $2, summary = $3
     WHERE id = $4`,
    [
      response.ok ? "success" : "partial_error",
      Math.floor(Date.now() / 1000),
      JSON.stringify(response),
      runId,
    ]
  );

  return NextResponse.json(response);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
