import { query } from "@/lib/db";

/**
 * Webero Commerce — Czech invoice system.
 *
 * Generates invoices (faktury) compliant with Czech law for 2026:
 * - Zákon č. 235/2004 Sb. o DPH (§ 29 — náležitosti daňového dokladu)
 * - Zákon č. 563/1991 Sb. o účetnictví
 * - Numbering series with auto-increment per year
 * - Support for: Faktura, Dobropis, Zálohová faktura, Dodací list
 */

export type InvoiceType = "invoice" | "proforma" | "credit_note" | "delivery_note";

export interface InvoiceInput {
  orderId?: number;
  type?: InvoiceType;
  supplierOverrides?: Partial<SupplierInfo>;
  customerOverrides?: Partial<CustomerInfo>;
  items?: InvoiceItemInput[];
  note?: string;
  dueDate?: string;
  taxableDate?: string;
  paymentMethod?: string;
  variableSymbol?: string;
}

export interface SupplierInfo {
  name: string;
  ico: string | null;
  dic: string | null;
  address: string;
  city: string;
  zip: string;
  country: string;
  bank_account: string | null;
  iban: string | null;
  swift: string | null;
  email: string | null;
  phone: string | null;
  registration: string | null;
}

export interface CustomerInfo {
  name: string;
  ico: string | null;
  dic: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  email: string | null;
  phone: string | null;
}

export interface InvoiceItemInput {
  description: string;
  qty: number;
  unit?: string;
  unitPriceCents: number;
  taxRate?: number;
}

export interface Invoice {
  id: number;
  tenant_id: number;
  order_id: number | null;
  invoice_number: string;
  invoice_type: string;
  issued_at: string;
  taxable_date: string;
  due_date: string;
  supplier_name: string;
  supplier_ico: string | null;
  supplier_dic: string | null;
  supplier_address: string;
  supplier_city: string;
  supplier_zip: string;
  supplier_country: string;
  supplier_bank_account: string | null;
  supplier_iban: string | null;
  supplier_swift: string | null;
  supplier_email: string | null;
  supplier_phone: string | null;
  supplier_registration: string | null;
  customer_name: string;
  customer_ico: string | null;
  customer_dic: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_zip: string | null;
  customer_country: string;
  customer_email: string | null;
  customer_phone: string | null;
  payment_method: string | null;
  variable_symbol: string | null;
  constant_symbol: string | null;
  specific_symbol: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  rounding_cents: number;
  note: string | null;
  internal_note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  qty: number;
  unit: string;
  unit_price_cents: number;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  position: number;
}

const TYPE_PREFIX: Record<InvoiceType, string> = {
  invoice: "FV",
  proforma: "ZF",
  credit_note: "DC",
  delivery_note: "DL",
};

const TYPE_LABEL: Record<InvoiceType, string> = {
  invoice: "Faktura — daňový doklad",
  proforma: "Zálohová faktura",
  credit_note: "Dobropis",
  delivery_note: "Dodací list",
};

export { TYPE_LABEL };

async function nextInvoiceNumber(tenantId: number, type: InvoiceType): Promise<string> {
  const prefix = TYPE_PREFIX[type];
  const year = new Date().getFullYear();

  const rows = await query<{ last_number: number }>(
    `INSERT INTO commerce_invoice_series (tenant_id, prefix, year, last_number)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (tenant_id, prefix, year)
     DO UPDATE SET last_number = commerce_invoice_series.last_number + 1
     RETURNING last_number`,
    [tenantId, prefix, year]
  );

  const num = rows[0].last_number;
  return `${prefix}${year}${String(num).padStart(4, "0")}`;
}

function roundToWhole(cents: number): { rounded: number; diff: number } {
  const rounded = Math.round(cents / 100) * 100;
  return { rounded, diff: rounded - cents };
}

export async function createInvoice(tenantId: number, input: InvoiceInput): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
  const type: InvoiceType = input.type ?? "invoice";
  const invoiceNumber = await nextInvoiceNumber(tenantId, type);

  let orderData: Record<string, unknown> | null = null;
  let orderItems: Array<{ title: string; variant_title: string | null; sku: string | null; qty: number; unit_price_cents: number; total_cents: number }> = [];

  if (input.orderId) {
    const orders = await query<Record<string, unknown>>(
      "SELECT * FROM orders WHERE tenant_id = $1 AND id = $2",
      [tenantId, input.orderId]
    );
    if (orders.length > 0) {
      orderData = orders[0];
      orderItems = await query(
        "SELECT title, variant_title, sku, qty, unit_price_cents, total_cents FROM order_items WHERE tenant_id = $1 AND order_id = $2 ORDER BY id",
        [tenantId, input.orderId]
      );
    }
  }

  const shop = await query<{ name: string; currency: string; company: Record<string, string> | null }>(
    "SELECT name, currency, company FROM shops WHERE tenant_id = $1",
    [tenantId]
  );
  const shopInfo = shop[0] ?? { name: "E-shop", currency: "CZK", company: null };
  const company = shopInfo.company ?? {};

  // Dodavatel = fakturační údaje z Nastavení obchodu (shops.company)
  const supplier: SupplierInfo = {
    name: input.supplierOverrides?.name ?? company.name ?? shopInfo.name,
    ico: input.supplierOverrides?.ico ?? company.ico ?? null,
    dic: input.supplierOverrides?.dic ?? company.dic ?? null,
    address: input.supplierOverrides?.address ?? company.address ?? "",
    city: input.supplierOverrides?.city ?? company.city ?? "",
    zip: input.supplierOverrides?.zip ?? company.zip ?? "",
    country: input.supplierOverrides?.country ?? "CZ",
    bank_account: input.supplierOverrides?.bank_account ?? company.bank_account ?? null,
    iban: input.supplierOverrides?.iban ?? company.iban ?? null,
    swift: input.supplierOverrides?.swift ?? company.swift ?? null,
    email: input.supplierOverrides?.email ?? company.order_email ?? null,
    phone: input.supplierOverrides?.phone ?? company.phone ?? null,
    registration: input.supplierOverrides?.registration ?? company.registration ?? null,
  };

  // Odběratel = fakturační adresa z objednávky
  const billing = (orderData?.billing_address ?? null) as
    | { name?: string; company?: string; street?: string; city?: string; zip?: string; country?: string; ico?: string; dic?: string }
    | null;
  const customer: CustomerInfo = {
    name: input.customerOverrides?.name ?? billing?.name ?? (orderData?.email as string ?? "Zákazník"),
    ico: input.customerOverrides?.ico ?? billing?.ico ?? null,
    dic: input.customerOverrides?.dic ?? billing?.dic ?? null,
    address: input.customerOverrides?.address ?? billing?.street ?? null,
    city: input.customerOverrides?.city ?? billing?.city ?? null,
    zip: input.customerOverrides?.zip ?? billing?.zip ?? null,
    country: input.customerOverrides?.country ?? billing?.country ?? "CZ",
    email: input.customerOverrides?.email ?? (orderData?.email as string ?? null),
    phone: input.customerOverrides?.phone ?? (orderData?.phone as string ?? null),
  };

  const invoiceItems: InvoiceItemInput[] = input.items ?? orderItems.map((oi) => ({
    description: oi.title + (oi.variant_title ? ` — ${oi.variant_title}` : ""),
    qty: oi.qty,
    unit: "ks",
    unitPriceCents: oi.unit_price_cents,
    taxRate: 21,
  }));

  if (orderData && !input.items) {
    const shippingCents = Number(orderData.shipping_cents ?? 0);
    if (shippingCents > 0) {
      invoiceItems.push({
        description: (orderData.shipping_method as string) ?? "Doprava",
        qty: 1,
        unit: "ks",
        unitPriceCents: shippingCents,
        taxRate: 21,
      });
    }
    // Sleva (kupón) — záporná položka, aby faktura seděla s objednávkou
    const discountCents = Number(orderData.discount_cents ?? 0);
    if (discountCents > 0) {
      const couponMatch = String(orderData.customer_note ?? "").match(/Kupón:\s*(\S+)/);
      invoiceItems.push({
        description: couponMatch ? `Sleva — kupón ${couponMatch[1]}` : "Sleva",
        qty: 1,
        unit: "ks",
        unitPriceCents: -discountCents,
        taxRate: 21,
      });
    }
  }

  let subtotalCents = 0;
  let taxCentsTotal = 0;
  const itemsToInsert: Array<{
    description: string; qty: number; unit: string;
    unit_price_cents: number; tax_rate: number; tax_cents: number; total_cents: number; position: number;
  }> = [];

  for (let i = 0; i < invoiceItems.length; i++) {
    const item = invoiceItems[i];
    const taxRate = item.taxRate ?? 21;
    const itemTotal = Math.round(item.unitPriceCents * item.qty);
    const taxBase = Math.round(itemTotal / (1 + taxRate / 100));
    const itemTax = itemTotal - taxBase;

    subtotalCents += taxBase;
    taxCentsTotal += itemTax;
    itemsToInsert.push({
      description: item.description,
      qty: item.qty,
      unit: item.unit ?? "ks",
      unit_price_cents: item.unitPriceCents,
      tax_rate: taxRate,
      tax_cents: itemTax,
      total_cents: itemTotal,
      position: i,
    });
  }

  const rawTotal = subtotalCents + taxCentsTotal;
  const { rounded: totalCents, diff: roundingCents } = roundToWhole(rawTotal);

  const now = new Date();
  const taxableDate = input.taxableDate ?? now.toISOString().slice(0, 10);
  const dueDate = input.dueDate ?? new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);
  const variableSymbol = input.variableSymbol
    ?? (orderData?.order_number ? String(orderData.order_number).replace(/\D/g, "").slice(0, 10) : invoiceNumber.replace(/\D/g, ""));

  const rows = await query<Invoice>(
    `INSERT INTO commerce_invoices (
      tenant_id, order_id, invoice_number, invoice_type, taxable_date, due_date,
      supplier_name, supplier_ico, supplier_dic, supplier_address, supplier_city, supplier_zip, supplier_country,
      supplier_bank_account, supplier_iban, supplier_swift, supplier_email, supplier_phone, supplier_registration,
      customer_name, customer_ico, customer_dic, customer_address, customer_city, customer_zip, customer_country,
      customer_email, customer_phone,
      payment_method, variable_symbol,
      subtotal_cents, tax_cents, total_cents, currency, rounding_cents, note
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
      $20,$21,$22,$23,$24,$25,$26,$27,$28,
      $29,$30,$31,$32,$33,$34,$35,$36
    ) RETURNING *`,
    [
      tenantId, input.orderId ?? null, invoiceNumber, type, taxableDate, dueDate,
      supplier.name, supplier.ico, supplier.dic, supplier.address, supplier.city, supplier.zip, supplier.country,
      supplier.bank_account, supplier.iban, supplier.swift, supplier.email, supplier.phone, supplier.registration,
      customer.name, customer.ico, customer.dic, customer.address, customer.city, customer.zip, customer.country,
      customer.email, customer.phone,
      input.paymentMethod ?? null, variableSymbol,
      subtotalCents, taxCentsTotal, totalCents, shopInfo.currency, roundingCents, input.note ?? null,
    ]
  );

  const invoice = rows[0];

  const insertedItems: InvoiceItem[] = [];
  for (const item of itemsToInsert) {
    const r = await query<InvoiceItem>(
      `INSERT INTO commerce_invoice_items (invoice_id, description, qty, unit, unit_price_cents, tax_rate, tax_cents, total_cents, position)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [invoice.id, item.description, item.qty, item.unit, item.unit_price_cents, item.tax_rate, item.tax_cents, item.total_cents, item.position]
    );
    insertedItems.push(r[0]);
  }

  return { invoice, items: insertedItems };
}

export async function getInvoice(tenantId: number, invoiceId: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  const rows = await query<Invoice>(
    "SELECT * FROM commerce_invoices WHERE tenant_id = $1 AND id = $2",
    [tenantId, invoiceId]
  );
  if (rows.length === 0) return null;
  const items = await query<InvoiceItem>(
    "SELECT * FROM commerce_invoice_items WHERE invoice_id = $1 ORDER BY position",
    [rows[0].id]
  );
  return { invoice: rows[0], items };
}

export async function listInvoices(tenantId: number, opts: {
  type?: InvoiceType; page?: number; perPage?: number; orderId?: number;
}): Promise<{ items: Invoice[]; total: number }> {
  const where = ["tenant_id = $1"];
  const values: unknown[] = [tenantId];

  if (opts.type) {
    values.push(opts.type);
    where.push(`invoice_type = $${values.length}`);
  }
  if (opts.orderId) {
    values.push(opts.orderId);
    where.push(`order_id = $${values.length}`);
  }

  const countRows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM commerce_invoices WHERE ${where.join(" AND ")}`,
    values
  );
  const total = parseInt(countRows[0]?.count ?? "0", 10);

  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 50;
  values.push(perPage, (page - 1) * perPage);

  const items = await query<Invoice>(
    `SELECT * FROM commerce_invoices WHERE ${where.join(" AND ")}
     ORDER BY id DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { items, total };
}

export async function cancelInvoice(tenantId: number, invoiceId: number): Promise<Invoice | null> {
  const rows = await query<Invoice>(
    `UPDATE commerce_invoices SET status = 'cancelled', cancelled_at = now(), updated_at = now()
     WHERE tenant_id = $1 AND id = $2 AND status = 'issued' RETURNING *`,
    [tenantId, invoiceId]
  );
  return rows[0] ?? null;
}

// ── Czech invoice HTML renderer ──────────────────────────────────────────────

function fmtCzk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 2 }).format(cents / 100);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "long" }).format(new Date(iso));
}

function fmtQty(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

export function renderInvoiceHtml(invoice: Invoice, items: InvoiceItem[], type?: "delivery", opts?: { qrSvg?: string | null }): string {
  const isDelivery = type === "delivery" || invoice.invoice_type === "delivery_note";
  const typeLabel = isDelivery ? "Dodací list" : TYPE_LABEL[invoice.invoice_type as InvoiceType] ?? "Faktura";
  const isCredit = invoice.invoice_type === "credit_note";

  const taxGroups = new Map<number, { base: number; tax: number; total: number }>();
  for (const item of items) {
    const g = taxGroups.get(item.tax_rate) ?? { base: 0, tax: 0, total: 0 };
    const base = Math.round(item.total_cents / (1 + item.tax_rate / 100));
    g.base += base;
    g.tax += item.tax_cents;
    g.total += item.total_cents;
    taxGroups.set(item.tax_rate, g);
  }

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${typeLabel} č. ${invoice.invoice_number}</title>
<style>
  @page { size: A4; margin: 11mm 18mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; font-size: 11pt; line-height: 1.4; }
  .invoice { max-width: 760px; margin: 0 auto; padding: 10px 20px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 3px solid #1a1a1a; }
  .header h1 { font-size: 22pt; font-weight: 800; letter-spacing: -0.02em; }
  .header .number { font-size: 12pt; color: #555; margin-top: 4px; }
  .header .meta { text-align: right; font-size: 9.5pt; color: #555; }
  .header .meta strong { color: #1a1a1a; }

  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 18px; }
  .party { padding: 14px 16px; border: 1px solid #e0e0e0; border-radius: 6px; }
  .party.supplier { border-left: 4px solid #1a1a1a; }
  .party.customer { border-left: 4px solid #3b82f6; }
  .party-label { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-bottom: 6px; }
  .party-name { font-size: 12pt; font-weight: 700; margin-bottom: 4px; }
  .party-detail { font-size: 9.5pt; color: #444; line-height: 1.5; }

  .payment-wrap { display: flex; gap: 12px; margin-bottom: 18px; align-items: stretch; }
  .payment-info { flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 12px 16px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e8e8e8; }
  .qr-pay { width: 132px; padding: 10px 12px 8px; background: #f8f9fa; border: 1px solid #e8e8e8; border-radius: 6px; text-align: center; }
  .qr-pay svg { width: 100px; height: 100px; display: block; margin: 0 auto; }
  .qr-pay .qr-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-top: 5px; }
  .pi-item { }
  .pi-label { font-size: 8.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
  .pi-value { font-size: 10.5pt; font-weight: 600; margin-top: 2px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead th { background: #1a1a1a; color: #fff; font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 10px; text-align: left; }
  thead th:first-child { border-radius: 4px 0 0 0; }
  thead th:last-child { border-radius: 0 4px 0 0; }
  thead th.right { text-align: right; }
  tbody td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 10pt; }
  tbody td.right { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  tbody tr:last-child td { border-bottom: 2px solid #ddd; }

  .tax-summary { display: flex; justify-content: flex-end; margin-bottom: 16px; }
  .tax-table { width: auto; min-width: 340px; }
  .tax-table th, .tax-table td { padding: 4px 10px; font-size: 9.5pt; }
  .tax-table th { background: #f0f0f0; color: #555; }

  .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
  .totals-box { text-align: right; min-width: 260px; }
  .totals-row { display: flex; justify-content: space-between; gap: 24px; padding: 4px 0; font-size: 10pt; }
  .totals-row.grand { padding: 10px 0 6px; border-top: 2px solid #1a1a1a; font-size: 14pt; font-weight: 800; }
  .totals-row .label { color: #555; }

  .notes { margin-top: 16px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 9.5pt; }
  .notes strong { display: block; margin-bottom: 4px; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.08em; color: #92400e; }

  .footer { margin-top: 22px; padding-top: 12px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 8.5pt; color: #888; }
  .stamp-area { width: 180px; height: 60px; border: 1px dashed #ccc; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 8pt; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
<div class="no-print" style="text-align:center;padding:10px;background:#f0f0f0;font-size:12px">
  <button onclick="window.print()" style="padding:8px 24px;font-size:14px;font-weight:600;background:#1a1a1a;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Vytisknout</button>
  <button onclick="window.close()" style="padding:8px 16px;font-size:14px;background:#fff;border:1px solid #ccc;border-radius:6px;cursor:pointer;margin-left:8px">Zavřít</button>
</div>
<div class="invoice">
  <div class="header">
    <div>
      <h1>${typeLabel}</h1>
      <div class="number">č. ${invoice.invoice_number}</div>
    </div>
    <div class="meta">
      <div>Datum vystavení: <strong>${fmtDate(invoice.issued_at)}</strong></div>
      ${!isDelivery ? `<div>Datum uskutečnění zdanitelného plnění: <strong>${fmtDate(invoice.taxable_date)}</strong></div>
      <div>Datum splatnosti: <strong>${fmtDate(invoice.due_date)}</strong></div>` : ""}
    </div>
  </div>

  <div class="parties">
    <div class="party supplier">
      <div class="party-label">Dodavatel</div>
      <div class="party-name">${esc(invoice.supplier_name)}</div>
      <div class="party-detail">
        ${invoice.supplier_address ? `${esc(invoice.supplier_address)}<br>` : ""}
        ${invoice.supplier_zip ? `${esc(invoice.supplier_zip)} ` : ""}${esc(invoice.supplier_city)}
        ${invoice.supplier_ico ? `<br>IČO: ${esc(invoice.supplier_ico)}` : ""}
        ${invoice.supplier_dic ? `<br>DIČ: ${esc(invoice.supplier_dic)}` : ""}
        ${invoice.supplier_registration ? `<br>${esc(invoice.supplier_registration)}` : ""}
        ${invoice.supplier_email ? `<br>E-mail: ${esc(invoice.supplier_email)}` : ""}
        ${invoice.supplier_phone ? `<br>Tel: ${esc(invoice.supplier_phone)}` : ""}
      </div>
    </div>
    <div class="party customer">
      <div class="party-label">Odběratel</div>
      <div class="party-name">${esc(invoice.customer_name)}</div>
      <div class="party-detail">
        ${invoice.customer_address ? `${esc(invoice.customer_address)}<br>` : ""}
        ${invoice.customer_zip ? `${esc(invoice.customer_zip)} ` : ""}${invoice.customer_city ? esc(invoice.customer_city) : ""}
        ${invoice.customer_ico ? `<br>IČO: ${esc(invoice.customer_ico)}` : ""}
        ${invoice.customer_dic ? `<br>DIČ: ${esc(invoice.customer_dic)}` : ""}
        ${invoice.customer_email ? `<br>E-mail: ${esc(invoice.customer_email)}` : ""}
        ${invoice.customer_phone ? `<br>Tel: ${esc(invoice.customer_phone)}` : ""}
      </div>
    </div>
  </div>

  ${!isDelivery ? `<div class="payment-wrap">
  <div class="payment-info">
    ${invoice.payment_method ? `<div class="pi-item"><div class="pi-label">Způsob platby</div><div class="pi-value">${esc(invoice.payment_method)}</div></div>` : ""}
    ${invoice.supplier_bank_account ? `<div class="pi-item"><div class="pi-label">Bankovní účet</div><div class="pi-value">${esc(invoice.supplier_bank_account)}</div></div>` : ""}
    ${invoice.variable_symbol ? `<div class="pi-item"><div class="pi-label">Variabilní symbol</div><div class="pi-value">${esc(invoice.variable_symbol)}</div></div>` : ""}
    ${invoice.constant_symbol ? `<div class="pi-item"><div class="pi-label">Konstantní symbol</div><div class="pi-value">${esc(invoice.constant_symbol)}</div></div>` : ""}
    ${invoice.supplier_iban ? `<div class="pi-item"><div class="pi-label">IBAN</div><div class="pi-value">${esc(invoice.supplier_iban)}</div></div>` : ""}
    ${invoice.supplier_swift ? `<div class="pi-item"><div class="pi-label">SWIFT/BIC</div><div class="pi-value">${esc(invoice.supplier_swift)}</div></div>` : ""}
  </div>
  ${opts?.qrSvg ? `<div class="qr-pay">${opts.qrSvg}<div class="qr-label">QR Platba</div></div>` : ""}
  </div>` : ""}

  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>Popis</th>
        <th class="right" style="width:50px">Mn.</th>
        <th style="width:35px">J.</th>
        ${!isDelivery ? `<th class="right" style="width:100px">Cena/j. (vč. DPH)</th>
        <th class="right" style="width:50px">DPH %</th>
        <th class="right" style="width:100px">Celkem (vč. DPH)</th>` : ""}
      </tr>
    </thead>
    <tbody>
      ${items.map((item, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(item.description)}</td>
        <td class="right">${fmtQty(Number(item.qty))}</td>
        <td>${esc(item.unit)}</td>
        ${!isDelivery ? `<td class="right">${fmtCzk(item.unit_price_cents)}</td>
        <td class="right">${item.tax_rate} %</td>
        <td class="right">${isCredit ? "−" : ""}${fmtCzk(item.total_cents)}</td>` : ""}
      </tr>`).join("\n")}
    </tbody>
  </table>

  ${!isDelivery ? `<div class="tax-summary">
    <table class="tax-table">
      <thead><tr><th>Sazba DPH</th><th class="right">Základ</th><th class="right">DPH</th><th class="right">Celkem</th></tr></thead>
      <tbody>
        ${[...taxGroups.entries()].map(([rate, g]) =>
          `<tr><td>${rate} %</td><td class="right">${fmtCzk(g.base)}</td><td class="right">${fmtCzk(g.tax)}</td><td class="right">${fmtCzk(g.total)}</td></tr>`
        ).join("\n")}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span class="label">Mezisoučet bez DPH:</span><span>${fmtCzk(invoice.subtotal_cents)}</span></div>
      <div class="totals-row"><span class="label">DPH celkem:</span><span>${fmtCzk(invoice.tax_cents)}</span></div>
      ${invoice.rounding_cents !== 0 ? `<div class="totals-row"><span class="label">Zaokrouhlení:</span><span>${fmtCzk(invoice.rounding_cents)}</span></div>` : ""}
      <div class="totals-row grand"><span>Celkem k úhradě:</span><span>${isCredit ? "−" : ""}${fmtCzk(invoice.total_cents)}</span></div>
    </div>
  </div>` : ""}

  ${invoice.note ? `<div class="notes"><strong>Poznámka</strong>${esc(invoice.note)}</div>` : ""}

  <div class="footer">
    <div>
      <div>Vystavil: ${esc(invoice.supplier_name)}</div>
      ${!isDelivery && invoice.supplier_dic ? `<div>${invoice.supplier_dic ? "Plátce" : "Neplátce"} DPH</div>` : ""}
    </div>
    <div class="stamp-area">Razítko a podpis</div>
  </div>
</div>
</body>
</html>`;
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
