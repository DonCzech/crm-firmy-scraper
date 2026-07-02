import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().optional(),
  unitPrice: z.number(),
  vatRate: z.number().int().min(0).max(21),
});

const schema = z.object({
  clientId: z.string().optional().nullable(),
  type: z.enum(["invoice", "proforma", "advance", "credit_note", "tax_document"]).optional(),
  currency: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  taxableDate: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  variableSymbol: z.string().optional(),
  paymentMethod: z.enum(["bank", "card", "cash", "cod", "other"]).optional(),
  orderNumber: z.string().optional().nullable(),
  noteBeforeItems: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  language: z.string().optional(),
  reverseCharge: z.boolean().optional(),
  discountAmount: z.number().optional().nullable(),
  discountPct: z.number().optional().nullable(),
  showAlreadyPaid: z.boolean().optional(),
  showIban: z.string().optional(),
  bankAccountId: z.string().optional().nullable(),
  invoiceTemplate: z.string().optional().nullable(),
  invoiceColor: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).optional(),
  items: z.array(itemSchema).optional(),
});

async function getOwnedInvoice(invoiceId: string, companyId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_invoices WHERE id = $1 AND company_id = $2",
    [invoiceId, companyId]
  );
  return rows[0] ?? null;
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoice = await getOwnedInvoice(id, company.id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );
  return NextResponse.json({ ...invoice, items });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoice = await getOwnedInvoice(id, company.id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const data = parsed.data;
  const refError = await validateInvoiceRefs(company.id, data);
  if (refError) return NextResponse.json({ error: refError }, { status: 400 });

  const isVatPayer = company.vat_status === "vat_payer";

  const fields: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  const addField = (col: string, val: unknown) => {
    fields.push(`${col} = $${idx++}`);
    vals.push(val);
  };

  if (data.clientId !== undefined) addField("client_id", data.clientId);
  if (data.type !== undefined) addField("type", data.type);
  if (data.currency !== undefined) addField("currency", data.currency);
  if (data.issueDate !== undefined) addField("issue_date", data.issueDate);
  if (data.dueDate !== undefined) addField("due_date", data.dueDate);
  if (data.taxableDate !== undefined) addField("taxable_date", data.taxableDate);
  if (data.note !== undefined) addField("note", data.note);
  if (data.variableSymbol !== undefined) addField("variable_symbol", data.variableSymbol);
  if (data.paymentMethod !== undefined) addField("payment_method", data.paymentMethod);
  if (data.orderNumber !== undefined) addField("order_number", data.orderNumber);
  if (data.noteBeforeItems !== undefined) addField("note_before_items", data.noteBeforeItems);
  if (data.footerText !== undefined) addField("footer_text", data.footerText);
  if (data.language !== undefined) addField("language", data.language);
  if (data.reverseCharge !== undefined) addField("reverse_charge", data.reverseCharge);
  if (data.discountAmount !== undefined) addField("discount_amount", data.discountAmount);
  if (data.discountPct !== undefined) addField("discount_pct", data.discountPct);
  if (data.showAlreadyPaid !== undefined) addField("show_already_paid", data.showAlreadyPaid);
  if (data.showIban !== undefined) addField("show_iban", data.showIban);
  if (data.bankAccountId !== undefined) addField("bank_account_id", data.bankAccountId);
  if (data.invoiceTemplate !== undefined) addField("invoice_template", data.invoiceTemplate);
  if (data.invoiceColor !== undefined) addField("invoice_color", data.invoiceColor);
  if (data.status !== undefined) {
    addField("status", data.status);
    if (data.status === "paid") addField("paid_at", Math.floor(Date.now() / 1000));
    if (data.status === "sent") addField("sent_at", Math.floor(Date.now() / 1000));
    await auditLog({ userId: user.id, companyId: company.id, action: `invoice.${data.status}`, entityType: "invoice", entityId: id });
  }

  if (data.items !== undefined) {
    const items = data.items.map((item) => {
      const totalWithoutVat = Math.round(item.quantity * item.unitPrice * 100) / 100;
      const totalVat = isVatPayer ? Math.round(totalWithoutVat * (item.vatRate / 100) * 100) / 100 : 0;
      const totalWithVat = Math.round((totalWithoutVat + totalVat) * 100) / 100;
      return { ...item, totalWithoutVat, totalVat, totalWithVat };
    });

    const subtotal = items.reduce((s, i) => s + i.totalWithoutVat, 0);
    const vatTotal = items.reduce((s, i) => s + i.totalVat, 0);
    const gross = Math.round((subtotal + vatTotal) * 100) / 100;
    const discountPct = data.discountPct ?? invoice.discount_pct ?? 0;
    const discountAmount = data.discountAmount ?? invoice.discount_amount ?? 0;
    const discountValue = discountPct > 0
      ? Math.round(gross * (discountPct / 100) * 100) / 100
      : discountAmount > 0 ? discountAmount : 0;
    const total = Math.round((gross - discountValue) * 100) / 100;

    addField("subtotal", subtotal);
    addField("vat_total", vatTotal);
    addField("total", total);
    addField("updated_at", Math.floor(Date.now() / 1000));

    await query("DELETE FROM fak_invoice_items WHERE invoice_id = $1", [id]);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await query(
        `INSERT INTO fak_invoice_items
           (id, invoice_id, name, quantity, unit, unit_price, vat_rate,
            total_without_vat, total_vat, total_with_vat, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [randomUUID(), id, item.name, item.quantity, item.unit ?? null,
         item.unitPrice, item.vatRate, item.totalWithoutVat, item.totalVat, item.totalWithVat, i]
      );
    }
  }

  if (fields.length > 0) {
    vals.push(id, company.id);
    await query(`UPDATE fak_invoices SET ${fields.join(", ")} WHERE id = $${idx++} AND company_id = $${idx}`, vals);
  }

  if (data.tagIds !== undefined) {
    await query("DELETE FROM fak_invoice_tags WHERE invoice_id = $1", [id]);
    for (const tagId of data.tagIds) {
      await query(
        "INSERT INTO fak_invoice_tags (invoice_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [id, tagId]
      );
    }
  }

  const { rows } = await query("SELECT * FROM fak_invoices WHERE id = $1 AND company_id = $2", [id, company.id]);
  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );
  return NextResponse.json({ ...rows[0], items });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoice = await getOwnedInvoice(id, company.id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query("UPDATE fak_invoices SET status = 'cancelled' WHERE id = $1 AND company_id = $2", [id, company.id]);
  await auditLog({ userId: user.id, companyId: company.id, action: "invoice.cancelled", entityType: "invoice", entityId: id });
  return NextResponse.json({ ok: true });
}
