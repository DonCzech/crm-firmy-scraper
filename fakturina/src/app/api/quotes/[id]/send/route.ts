import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/security";
import { query } from "@/lib/db";
import { requireSession, getUserCompany } from "@/lib/auth";
import { generateQuoteHtml } from "@/lib/quote-render";
import { quoteEmailSubject, sendQuoteEmail } from "@/lib/email";
import { emailLog } from "@/lib/email-log";

const schema = z.object({
  to: z.string().email().optional(),
  note: z.string().optional(),
  attachPdf: z.boolean().default(true),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(`quote-send:${requestIp(req)}`, 20, 60 * 60_000);
  if (!limited.allowed) return NextResponse.json({ error: "Limit odesílání byl vyčerpán" }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  const { id } = await params;
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const company = await getUserCompany(user.id);
  if (!company) return NextResponse.json({ error: "No company" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatné vstupy" }, { status: 400 });

  const { rows: [quote] } = await query(
    `SELECT q.*,
       c.name as client_name, c.email as client_email, c.ico as client_ico,
       c.dic as client_dic, c.address as client_address, c.city as client_city, c.zip as client_zip
     FROM fak_quotes q
     LEFT JOIN fak_clients c ON c.id = q.client_id
     WHERE q.id = $1 AND q.company_id = $2`,
    [id, company.id]
  );
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quote.converted_invoice_id) {
    return NextResponse.json({ error: "Nabídka už byla převedena na fakturu" }, { status: 400 });
  }

  const to = parsed.data.to || quote.client_email;
  if (!to) return NextResponse.json({ error: "Klient nemá e-mail" }, { status: 400 });

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order",
    [id]
  );

  const html = generateQuoteHtml({
    number: quote.number,
    issueDate: quote.issue_date,
    validUntil: quote.valid_until,
    currency: quote.currency,
    note: quote.note,
    noteBeforeItems: quote.note_before_items,
    footerText: quote.footer_text ?? company.invoice_footer,
    supplier: {
      name: company.name,
      ico: company.ico,
      dic: company.dic,
      address: company.address,
      city: company.city,
      zip: company.zip,
      logoUrl: company.logo_url,
      vatStatus: company.vat_status,
    },
    client: {
      name: quote.client_name,
      ico: quote.client_ico,
      dic: quote.client_dic,
      address: quote.client_address,
      city: quote.client_city,
      zip: quote.client_zip,
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
    subtotal: parseFloat(quote.subtotal),
    vatTotal: parseFloat(quote.vat_total),
    total: parseFloat(quote.total),
    isVatPayer: company.vat_status === "vat_payer",
    accentColor: company.invoice_color ?? "#0e7c5a",
  });

  let pdfBuffer: Buffer | undefined;
  if (parsed.data.attachPdf) {
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
      console.error("Quote PDF generation failed, sending without attachment:", err);
    }
  }

  const emailData = {
    to,
    clientName: quote.client_name ?? to,
    quoteNumber: quote.number,
    total: parseFloat(quote.total),
    currency: quote.currency,
    validUntil: quote.valid_until,
    publicToken: quote.public_token,
    supplierName: company.name,
    note: parsed.data.note,
    pdfBuffer,
  };

  try {
    const messageId = await sendQuoteEmail(emailData);
    await emailLog({
      companyId: company.id,
      quoteId: id,
      type: "quote",
      recipient: to,
      subject: quoteEmailSubject(emailData),
      status: "sent",
      providerMessageId: messageId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Odeslání e-mailu selhalo";
    await emailLog({
      companyId: company.id,
      quoteId: id,
      type: "quote",
      recipient: to,
      subject: quoteEmailSubject(emailData),
      status: "error",
      error: message,
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await query(
    "UPDATE fak_quotes SET status = 'sent', updated_at = $1 WHERE id = $2 AND company_id = $3 AND status = 'draft'",
    [Math.floor(Date.now() / 1000), id, company.id]
  );

  return NextResponse.json({ ok: true });
}
