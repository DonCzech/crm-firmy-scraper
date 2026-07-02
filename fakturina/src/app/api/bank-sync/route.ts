import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { requireSession, getUserCompany } from "@/lib/auth";
import { initDb, query } from "@/lib/db";
import { BankConnection, NormalizedBankTransaction, matchIncomingPayment, syncBankConnection } from "@/lib/bank-sync";

const schema = z.object({
  connectionId: z.string().optional(),
  mockTransaction: z.object({
    providerTransactionId: z.string().min(1),
    bookingDate: z.string().nullable().optional(),
    amount: z.number(),
    currency: z.string().default("CZK"),
    accountNumber: z.string().nullable().optional(),
    bankCode: z.string().nullable().optional(),
    variableSymbol: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
  }).optional(),
});

async function loadConnections(companyId: string, connectionId?: string) {
  const params: unknown[] = [companyId];
  let extra = "";
  if (connectionId) {
    params.push(connectionId);
    extra = " AND id = $2";
  }
  const { rows } = await query(
    `SELECT * FROM fak_bank_connections
     WHERE company_id = $1 AND active = true${extra}
     ORDER BY created_at ASC`,
    params
  );
  return rows as BankConnection[];
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  await initDb();
  const runId = randomUUID();
  await query(
    `INSERT INTO fak_automation_runs (id, company_id, type, status, started_at, summary)
     VALUES ($1, $2, 'bank_sync_manual', 'running', $3, $4)`,
    [runId, company.id, Math.floor(Date.now() / 1000), JSON.stringify({ source: "manual" })]
  );

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    await query(
      "UPDATE fak_automation_runs SET status = 'error', finished_at = $1, error = $2 WHERE id = $3",
      [Math.floor(Date.now() / 1000), "Neplatné vstupy", runId]
    );
    return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });
  }

  if (parsed.data.mockTransaction && process.env.NODE_ENV !== "production") {
    const tx: NormalizedBankTransaction = {
      providerTransactionId: parsed.data.mockTransaction.providerTransactionId,
      bookingDate: parsed.data.mockTransaction.bookingDate ?? new Date().toISOString().slice(0, 10),
      amount: parsed.data.mockTransaction.amount,
      currency: parsed.data.mockTransaction.currency.toUpperCase(),
      accountNumber: parsed.data.mockTransaction.accountNumber ?? null,
      bankCode: parsed.data.mockTransaction.bankCode ?? null,
      variableSymbol: parsed.data.mockTransaction.variableSymbol?.replace(/\D/g, "") || null,
      message: parsed.data.mockTransaction.message ?? "Testovací příchozí platba",
      raw: parsed.data.mockTransaction,
    };
    const invoiceId = await matchIncomingPayment(company.id, tx);
    const summary = { mode: "mock", matched: invoiceId ? 1 : 0, invoiceId };
    await query(
      "UPDATE fak_automation_runs SET status = 'success', finished_at = $1, summary = $2 WHERE id = $3",
      [Math.floor(Date.now() / 1000), JSON.stringify(summary), runId]
    );
    return NextResponse.json({ ok: true, ...summary });
  }

  const connections = await loadConnections(company.id, parsed.data.connectionId);
  if (parsed.data.connectionId && connections.length === 0) {
    await query(
      "UPDATE fak_automation_runs SET status = 'error', finished_at = $1, error = $2 WHERE id = $3",
      [Math.floor(Date.now() / 1000), "Bankovní napojení neexistuje", runId]
    );
    return NextResponse.json({ error: "Bankovní napojení neexistuje" }, { status: 404 });
  }

  const results = [];
  for (const connection of connections) {
    try {
      const result = await syncBankConnection(connection);
      results.push({ connectionId: connection.id, provider: connection.provider, ok: true, ...result });
    } catch (err) {
      results.push({
        connectionId: connection.id,
        provider: connection.provider,
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
