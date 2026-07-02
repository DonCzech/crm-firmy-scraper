import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/invoice-number";

const patchSchema = z.object({
  clientId: z.string().optional().nullable(),
  currency: z.string().optional(),
  issueDate: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  language: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
  note: z.string().optional().nullable(),
  noteBeforeItems: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().min(0).default(1),
    unit: z.string().optional(),
    unitPrice: z.number(),
    vatRate: z.number().int().min(0).max(21).default(0),
  })).optional(),
});

async function getQuote(id: string, companyId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_quotes WHERE id = $1 AND company_id = $2", [id, companyId]
  );
  return rows[0] ?? null;
}

async function validateClient(companyId: string, clientId?: string | null) {
  if (!clientId) return null;
  const { rows } = await query(
    "SELECT id FROM fak_clients WHERE id = $1 AND company_id = $2 AND archived = false",
    [clientId, companyId]
  );
  return rows[0] ? null : "Klient neexistuje";
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const quote = await getQuote(id, company.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order", [id]
  );
  const { rows: [client] } = await query(
    "SELECT * FROM fak_clients WHERE id = $1 AND company_id = $2", [quote.client_id ?? "", company.id]
  );
  return NextResponse.json({ ...quote, items, client: client ?? null });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const quote = await getQuote(id, company.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const d = parsed.data;
  const refError = await validateClient(company.id, d.clientId);
  if (refError) return NextResponse.json({ error: refError }, { status: 400 });

  const isVatPayer = company.vat_status === "vat_payer";
  const updates: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  const add = (column: string, value: unknown) => {
    updates.push(`${column} = $${idx++}`);
    vals.push(value);
  };

  if (d.clientId !== undefined) add("client_id", d.clientId || null);
  if (d.currency !== undefined) add("currency", d.currency);
  if (d.issueDate !== undefined) add("issue_date", d.issueDate);
  if (d.validUntil !== undefined) add("valid_until", d.validUntil || null);
  if (d.language !== undefined) add("language", d.language);
  if (d.status !== undefined) add("status", d.status);
  if (d.note !== undefined) add("note", d.note);
  if (d.noteBeforeItems !== undefined) add("note_before_items", d.noteBeforeItems);
  if (d.footerText !== undefined) add("footer_text", d.footerText);

  if (d.items !== undefined) {
    const calcItems = d.items.map((item) => {
      const totalWithoutVat = Math.round(item.quantity * item.unitPrice * 100) / 100;
      const totalVat = isVatPayer ? Math.round(totalWithoutVat * (item.vatRate / 100) * 100) / 100 : 0;
      return {
        ...item,
        totalWithoutVat,
        totalVat,
        totalWithVat: Math.round((totalWithoutVat + totalVat) * 100) / 100,
      };
    });

    add("subtotal", calcItems.reduce((sum, item) => sum + item.totalWithoutVat, 0));
    add("vat_total", calcItems.reduce((sum, item) => sum + item.totalVat, 0));
    add("total", calcItems.reduce((sum, item) => sum + item.totalWithVat, 0));

    await query("DELETE FROM fak_quote_items WHERE quote_id = $1", [id]);
    for (let i = 0; i < calcItems.length; i++) {
      const item = calcItems[i];
      await query(
        `INSERT INTO fak_quote_items
           (id, quote_id, name, quantity, unit, unit_price, vat_rate,
            total_without_vat, total_vat, total_with_vat, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [randomUUID(), id, item.name, item.quantity, item.unit ?? null,
         item.unitPrice, item.vatRate, item.totalWithoutVat, item.totalVat, item.totalWithVat, i]
      );
    }
  }

  add("updated_at", Math.floor(Date.now() / 1000));

  vals.push(id, company.id);
  await query(
    `UPDATE fak_quotes SET ${updates.join(", ")} WHERE id = $${idx++} AND company_id = $${idx}`,
    vals
  );

  const { rows } = await query("SELECT * FROM fak_quotes WHERE id = $1 AND company_id = $2", [id, company.id]);
  const { rows: items } = await query("SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order", [id]);
  return NextResponse.json({ ...rows[0], items });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const quote = await getQuote(id, company.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query("DELETE FROM fak_quotes WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json({ ok: true });
}

// POST /api/quotes/[id] with action=convert → create invoice from quote
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const quote = await getQuote(id, company.id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order", [id]
  );

  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + (company.default_due_days ?? 14) * 86400000).toISOString().split("T")[0];

  const number = generateInvoiceNumber({
    invoice_prefix: company.invoice_prefix ?? "",
    invoice_number_year_format: company.invoice_number_year_format ?? "full",
    invoice_number_month: company.invoice_number_month ?? false,
    invoice_number_position: company.invoice_number_position ?? "end",
    invoice_number_volume: company.invoice_number_volume ?? 10000,
    invoice_number_separator: company.invoice_number_separator ?? "-",
    invoice_next: company.invoice_next ?? 1,
  });

  await query("UPDATE fak_companies SET invoice_next = invoice_next + 1 WHERE id = $1", [company.id]);

  const invoiceId = randomUUID();
  const publicToken = randomBytes(24).toString("hex");

  await query(
    `INSERT INTO fak_invoices
       (id, company_id, client_id, number, variable_symbol, type, status, currency,
        issue_date, due_date, subtotal, vat_total, total, note, note_before_items,
        footer_text, payment_method, public_token, language)
     VALUES ($1,$2,$3,$4,$5,'invoice','draft',$6,$7,$8,$9,$10,$11,$12,$13,$14,'bank',$15,$16)`,
    [invoiceId, company.id, quote.client_id ?? null, number,
     number.replace(/\D/g, ""), quote.currency, today, due,
     quote.subtotal, quote.vat_total, quote.total,
     quote.note ?? null, quote.note_before_items ?? null, quote.footer_text ?? null,
     publicToken, quote.language ?? "cs"]
  );

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await query(
      `INSERT INTO fak_invoice_items
         (id, invoice_id, name, quantity, unit, unit_price, vat_rate,
          total_without_vat, total_vat, total_with_vat, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [randomUUID(), invoiceId, item.name, item.quantity, item.unit ?? null,
       item.unit_price, item.vat_rate, item.total_without_vat,
       item.total_vat, item.total_with_vat, i]
    );
  }

  // Link quote to invoice and mark as accepted
  await query(
    "UPDATE fak_quotes SET status = 'accepted', converted_invoice_id = $2 WHERE id = $1 AND company_id = $3",
    [id, invoiceId, company.id]
  );

  return NextResponse.json({ invoiceId }, { status: 201 });
}
