import { NextRequest, NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";
import { generateInvoiceHtml } from "@/lib/invoice-pdf";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/security";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const limited = rateLimit(`public-invoice-pdf:${requestIp(req)}`, 20, 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Příliš mnoho PDF požadavků" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  const { token } = await params;
  await initDb();

  const { rows } = await query(
    `SELECT i.*,
       co.name as company_name, co.ico as company_ico, co.dic as company_dic,
       co.address as company_address, co.city as company_city, co.zip as company_zip,
       co.bank_account, co.iban, co.swift, co.logo_url, co.vat_status,
       co.invoice_template, co.invoice_color, co.invoice_footer,
       cl.name as client_name, cl.ico as client_ico, cl.dic as client_dic,
       cl.address as client_address, cl.city as client_city, cl.zip as client_zip
     FROM fak_invoices i
     JOIN fak_companies co ON co.id = i.company_id
     LEFT JOIN fak_clients cl ON cl.id = i.client_id
     WHERE i.public_token = $1 AND i.status != 'cancelled'`,
    [token]
  );
  const invoice = rows[0];
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_invoice_items WHERE invoice_id = $1 ORDER BY sort_order ASC",
    [invoice.id]
  );

  const isVatPayer = invoice.vat_status === "vat_payer";

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
      name: invoice.company_name,
      ico: invoice.company_ico,
      dic: invoice.company_dic,
      address: invoice.company_address ?? "",
      city: invoice.company_city ?? "",
      zip: invoice.company_zip ?? "",
      bankAccount: invoice.bank_account,
      iban: invoice.iban,
      swift: invoice.swift,
      logoUrl: invoice.logo_url,
      vatStatus: invoice.vat_status,
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
    template: invoice.invoice_template ?? "modern",
    accentColor: invoice.invoice_color ?? "#4f46e5",
    paymentMethod: invoice.payment_method,
    orderNumber: invoice.order_number,
    noteBeforeItems: invoice.note_before_items,
    footerText: invoice.footer_text ?? invoice.invoice_footer,
    watermark: false,
  });

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
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      printBackground: true,
    });
    await browser.close();

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="faktura-${invoice.number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json({ error: "PDF se nepodařilo vygenerovat" }, { status: 500 });
  }
}
