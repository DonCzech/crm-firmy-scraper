import { NextRequest, NextResponse } from "next/server";
import { initDb, query } from "@/lib/db";
import { generateQuoteHtml } from "@/lib/quote-render";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await initDb();

  const { rows: [quote] } = await query(
    `SELECT q.*,
       co.name as company_name, co.ico as company_ico, co.dic as company_dic,
       co.address as company_address, co.city as company_city, co.zip as company_zip,
       co.logo_url, co.vat_status, co.invoice_color, co.invoice_footer,
       cl.name as client_name, cl.ico as client_ico, cl.dic as client_dic,
       cl.address as client_address, cl.city as client_city, cl.zip as client_zip
     FROM fak_quotes q
     JOIN fak_companies co ON co.id = q.company_id
     LEFT JOIN fak_clients cl ON cl.id = q.client_id
     WHERE q.public_token = $1`,
    [token]
  );
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { rows: items } = await query(
    "SELECT * FROM fak_quote_items WHERE quote_id = $1 ORDER BY sort_order",
    [quote.id]
  );

  const html = generateQuoteHtml({
    number: quote.number,
    issueDate: quote.issue_date,
    validUntil: quote.valid_until,
    currency: quote.currency,
    note: quote.note,
    noteBeforeItems: quote.note_before_items,
    footerText: quote.footer_text ?? quote.invoice_footer,
    supplier: {
      name: quote.company_name,
      ico: quote.company_ico,
      dic: quote.company_dic,
      address: quote.company_address,
      city: quote.company_city,
      zip: quote.company_zip,
      logoUrl: quote.logo_url,
      vatStatus: quote.vat_status,
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
    isVatPayer: quote.vat_status === "vat_payer",
    accentColor: quote.invoice_color ?? "#0e7c5a",
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
        "Content-Disposition": `attachment; filename="nabidka-${quote.number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Quote PDF generation failed:", err);
    return NextResponse.json({ error: "PDF se nepodařilo vygenerovat" }, { status: 500 });
  }
}
