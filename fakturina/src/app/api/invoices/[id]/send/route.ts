import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { generateInvoiceHtml } from "@/lib/invoice-pdf";
import { invoiceEmailSubject, sendInvoiceEmail } from "@/lib/email";
import { emailLog } from "@/lib/email-log";
import { z } from "zod";

const schema = z.object({
  to: z.string().email(),
  note: z.string().optional(),
  attachPdf: z.boolean().default(true),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });
  const { to, note, attachPdf } = parsed.data;

  const { rows } = await query(
    `SELECT i.*, c.name as client_name, c.email as client_email,
            c.ico as client_ico, c.dic as client_dic, c.address as client_address,
            c.city as client_city, c.zip as client_zip
     FROM fak_invoices i
     LEFT JOIN fak_clients c ON c.id = i.client_id
     WHERE i.id = $1 AND i.company_id = $2`,
    [id, company.id]
  );
  const invoice = rows[0];
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [id]
  );

  // Resolve per-invoice bank account override
  let bankAccount = company.bank_account as string | undefined;
  let iban = company.iban as string | undefined;
  let swift = company.swift as string | undefined;

  if (invoice.bank_account_id) {
    const { rows: bankRows } = await query(
      "SELECT * FROM fak_bank_accounts WHERE id = $1 AND company_id = $2",
      [invoice.bank_account_id, company.id]
    );
    if (bankRows[0]) {
      bankAccount = bankRows[0].bank_account ?? bankAccount;
      iban = bankRows[0].iban ?? iban;
      swift = bankRows[0].swift ?? swift;
    }
  }

  const showIban = (invoice.show_iban ?? "auto") as string;
  if (showIban === "never") iban = undefined;

  const isVatPayer = company.vat_status === "vat_payer";

  const html = generateInvoiceHtml({
    number: invoice.number,
    type: invoice.type,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    taxableDate: invoice.taxable_date,
    currency: invoice.currency,
    note: invoice.note,
    variableSymbol: invoice.variable_symbol,
    supplier: {
      name: company.name,
      ico: company.ico,
      dic: company.dic,
      address: company.address ?? "",
      city: company.city ?? "",
      zip: company.zip ?? "",
      bankAccount: bankAccount ?? undefined,
      iban: iban ?? undefined,
      swift: swift ?? undefined,
      logoUrl: company.logo_url ?? undefined,
      vatStatus: company.vat_status,
    },
    client: {
      name: invoice.client_name ?? "",
      ico: invoice.client_ico,
      dic: invoice.client_dic,
      address: invoice.client_address ?? "",
      city: invoice.client_city ?? "",
      zip: invoice.client_zip ?? "",
    },
    items: items.map((item) => ({
      name: item.name,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      unitPrice: parseFloat(item.unit_price),
      vatRate: item.vat_rate,
      totalWithoutVat: parseFloat(item.total_without_vat),
      totalVat: parseFloat(item.total_vat),
      totalWithVat: parseFloat(item.total_with_vat),
    })),
    subtotal: parseFloat(invoice.subtotal),
    vatTotal: parseFloat(invoice.vat_total),
    total: parseFloat(invoice.total),
    isVatPayer,
    template: invoice.invoice_template ?? company.invoice_template ?? "modern",
    accentColor: invoice.invoice_color ?? company.invoice_color ?? "#4f46e5",
    paymentMethod: invoice.payment_method,
    orderNumber: invoice.order_number,
    noteBeforeItems: invoice.note_before_items,
    footerText: invoice.footer_text ?? company.invoice_footer,
    discountPct: invoice.discount_pct ? parseFloat(invoice.discount_pct) : undefined,
    discountAmount: invoice.discount_amount ? parseFloat(invoice.discount_amount) : undefined,
    reverseCharge: invoice.reverse_charge ?? false,
    showAlreadyPaid: invoice.show_already_paid ?? false,
    showIban,
    watermark: false,
  });

  let pdfBuffer: Buffer | undefined;
  if (attachPdf) {
    try {
      const puppeteer = await import("puppeteer-core");
      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ??
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      const browser = await puppeteer.default.launch({
        executablePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        headless: true,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const pdf = await page.pdf({
        format: "A4",
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        printBackground: true,
      });
      await browser.close();
      pdfBuffer = Buffer.from(pdf);
    } catch (err) {
      console.error("PDF generation failed, sending without attachment:", err);
    }
  }

  const emailData = {
    to,
    clientName: invoice.client_name ?? to,
    invoiceNumber: invoice.number,
    total: parseFloat(invoice.total),
    currency: invoice.currency,
    dueDate: invoice.due_date,
    publicToken: invoice.public_token,
    supplierName: company.name,
    note,
    pdfBuffer,
  };

  try {
    const messageId = await sendInvoiceEmail(emailData);
    await emailLog({
      companyId: company.id,
      invoiceId: id,
      type: "invoice",
      recipient: to,
      subject: invoiceEmailSubject(emailData),
      status: "sent",
      providerMessageId: messageId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Odeslání e-mailu selhalo";
    await emailLog({
      companyId: company.id,
      invoiceId: id,
      type: "invoice",
      recipient: to,
      subject: invoiceEmailSubject(emailData),
      status: "error",
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Mark as sent if still draft
  if (invoice.status === "draft") {
    await query(
      "UPDATE fak_invoices SET status = 'sent', sent_at = $1 WHERE id = $2 AND company_id = $3",
      [Math.floor(Date.now() / 1000), id, company.id]
    );
  }

  return NextResponse.json({ ok: true });
}
