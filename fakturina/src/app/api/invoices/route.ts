import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/invoice-number";

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().optional(),
  unitPrice: z.number(),
  vatRate: z.number().int().min(0).max(21),
});

const schema = z.object({
  clientId: z.string().optional().nullable(),
  type: z.enum(["invoice", "proforma", "advance", "credit_note", "tax_document"]).default("invoice"),
  currency: z.string().default("CZK"),
  issueDate: z.string(),
  dueDate: z.string(),
  taxableDate: z.string().optional(),
  note: z.string().optional(),
  variableSymbol: z.string().optional(),
  paymentMethod: z.enum(["bank", "card", "cash", "cod", "other"]).default("bank"),
  orderNumber: z.string().optional(),
  noteBeforeItems: z.string().optional(),
  footerText: z.string().optional(),
  language: z.string().optional().default("cs"),
  reverseCharge: z.boolean().optional().default(false),
  discountAmount: z.number().optional().nullable(),
  discountPct: z.number().optional().nullable(),
  showAlreadyPaid: z.boolean().optional().default(false),
  invoiceTemplate: z.string().optional(),
  invoiceColor: z.string().optional(),
  bankAccountId: z.string().optional().nullable(),
  showIban: z.string().optional().default("auto"),
  tagIds: z.array(z.string()).optional(),
  items: z.array(itemSchema).min(0),
});

function calcItems(items: z.infer<typeof itemSchema>[], isVatPayer: boolean) {
  return items.map((item) => {
    const totalWithoutVat = Math.round(item.quantity * item.unitPrice * 100) / 100;
    const totalVat = isVatPayer ? Math.round(totalWithoutVat * (item.vatRate / 100) * 100) / 100 : 0;
    const totalWithVat = Math.round((totalWithoutVat + totalVat) * 100) / 100;
    return { ...item, totalWithoutVat, totalVat, totalWithVat };
  });
}

async function validateInvoiceRefs(companyId: string, data: {
  clientId?: string | null;
  bankAccountId?: string | null;
  tagIds?: string[];
}) {
  if (data.clientId) {
    const { rows } = await query(
      "SELECT id FROM fak_clients WHERE id = $1 AND company_id = $2 AND archived = false",
      [data.clientId, companyId]
    );
    if (!rows[0]) return "Klient neexistuje";
  }
  if (data.bankAccountId) {
    const { rows } = await query(
      "SELECT id FROM fak_bank_accounts WHERE id = $1 AND company_id = $2",
      [data.bankAccountId, companyId]
    );
    if (!rows[0]) return "Bankovní účet neexistuje";
  }
  if (data.tagIds?.length) {
    const { rows } = await query(
      "SELECT id FROM fak_tags WHERE company_id = $1 AND id = ANY($2::text[])",
      [companyId, data.tagIds]
    );
    if (rows.length !== new Set(data.tagIds).size) return "Některý štítek neexistuje";
  }
  return null;
}

export async function GET(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json([]);

  const status = req.nextUrl.searchParams.get("status");
  const whereStatus = status ? " AND i.status = $2" : "";

  const { rows } = await query(
    `SELECT i.*, c.name as client_name
     FROM fak_invoices i
     LEFT JOIN fak_clients c ON c.id = i.client_id
     WHERE i.company_id = $1${whereStatus}
     ORDER BY i.created_at DESC`,
    status ? [company.id, status] : [company.id]
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy", details: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  const refError = await validateInvoiceRefs(company.id, data);
  if (refError) return NextResponse.json({ error: refError }, { status: 400 });

  const isVatPayer = company.vat_status === "vat_payer";
  const calcedItems = calcItems(data.items, isVatPayer);

  const subtotal = calcedItems.reduce((s, i) => s + i.totalWithoutVat, 0);
  const vatTotal = calcedItems.reduce((s, i) => s + i.totalVat, 0);
  const total = Math.round((subtotal + vatTotal) * 100) / 100;

  // Generate invoice number using new configurable format
  const number = generateInvoiceNumber({
    invoice_prefix: company.invoice_prefix ?? "",
    invoice_number_year_format: company.invoice_number_year_format ?? "full",
    invoice_number_month: company.invoice_number_month ?? false,
    invoice_number_position: company.invoice_number_position ?? "end",
    invoice_number_volume: company.invoice_number_volume ?? 10000,
    invoice_number_separator: company.invoice_number_separator ?? "-",
    invoice_next: company.invoice_next ?? 1,
  }, new Date(data.issueDate));

  await query(
    "UPDATE fak_companies SET invoice_next = invoice_next + 1 WHERE id = $1",
    [company.id]
  );

  const id = randomUUID();
  const publicToken = randomBytes(24).toString("hex");

  await query(
    `INSERT INTO fak_invoices
       (id, company_id, client_id, number, variable_symbol, type, status, currency,
        issue_date, due_date, taxable_date, subtotal, vat_total, total, note,
        payment_method, order_number, note_before_items, footer_text, public_token,
        language, reverse_charge, discount_amount, discount_pct, show_already_paid,
        invoice_template, invoice_color, bank_account_id, show_iban)
     VALUES ($1,$2,$3,$4,$5,$6,'draft',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)`,
    [
      id, company.id, data.clientId ?? null, number,
      data.variableSymbol ?? number.replace(/\D/g, ""),
      data.type, data.currency,
      data.issueDate, data.dueDate,
      data.taxableDate ?? null,
      subtotal, vatTotal, total,
      data.note ?? null,
      data.paymentMethod ?? "bank",
      data.orderNumber ?? null,
      data.noteBeforeItems ?? null,
      data.footerText ?? null,
      publicToken,
      data.language ?? "cs",
      data.reverseCharge ?? false,
      data.discountAmount ?? null,
      data.discountPct ?? null,
      data.showAlreadyPaid ?? false,
      data.invoiceTemplate ?? null,
      data.invoiceColor ?? null,
      data.bankAccountId ?? null,
      data.showIban ?? "auto",
    ]
  );

  // Save tags
  if (data.tagIds?.length) {
    for (const tagId of data.tagIds) {
      await query(
        "INSERT INTO fak_invoice_tags (invoice_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [id, tagId]
      );
    }
  }

  for (let idx = 0; idx < calcedItems.length; idx++) {
    const item = calcedItems[idx];
    await query(
      `INSERT INTO fak_invoice_items
         (id, invoice_id, name, quantity, unit, unit_price, vat_rate,
          total_without_vat, total_vat, total_with_vat, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [randomUUID(), id, item.name, item.quantity, item.unit ?? null,
       item.unitPrice, item.vatRate, item.totalWithoutVat, item.totalVat, item.totalWithVat, idx]
    );
  }

  await auditLog({ userId: user.id, companyId: company.id, action: "invoice.created", entityType: "invoice", entityId: id });
  const { rows } = await query("SELECT * FROM fak_invoices WHERE id = $1 AND company_id = $2", [id, company.id]);
  return NextResponse.json(rows[0], { status: 201 });
}
