import { sendEmail, type EmailAttachment } from "@/lib/email";
import { createInvoice, getInvoice, listInvoices, renderInvoiceHtml } from "./invoices";
import { renderInvoicePdf } from "./invoice-pdf";
import { invoiceQrSvg } from "./qr-payment";
import type { OrderDetail, Shop } from "./types";

/** Webero Commerce — transakční e-maily (Fáze 4). Fire-and-forget. */

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 })
    .format(cents / 100);
}

const PAYMENT_LABEL: Record<string, string> = {
  gopay: "Platba kartou online",
  bank_transfer: "Bankovní převod",
  cod: "Dobírka",
};

function itemsTable(order: OrderDetail): string {
  const rows = order.items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">${i.title}${i.variant_title ? ` — ${i.variant_title}` : ""}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${i.qty}×</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${czk(i.total_cents, order.currency)}</td>
    </tr>`).join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${rows}
      <tr><td colspan="2" style="padding:8px 0;text-align:right;color:#666;">Doprava a platba</td>
        <td style="padding:8px 0;text-align:right;">${czk(order.shipping_cents, order.currency)}</td></tr>
      ${order.discount_cents > 0 ? `<tr><td colspan="2" style="padding:4px 0;text-align:right;color:#666;">Sleva</td>
        <td style="padding:4px 0;text-align:right;">−${czk(order.discount_cents, order.currency)}</td></tr>` : ""}
      <tr><td colspan="2" style="padding:10px 0;text-align:right;font-weight:bold;font-size:16px;">Celkem</td>
        <td style="padding:10px 0;text-align:right;font-weight:bold;font-size:16px;white-space:nowrap;">${czk(order.total_cents, order.currency)}</td></tr>
    </table>`;
}

function bankInstructions(order: OrderDetail, shop: Shop): string {
  if (order.payment_method !== "bank_transfer") return "";
  const account = (shop.company as { bank_account?: string })?.bank_account;
  const vs = order.order_number.replace(/\D/g, "").slice(-9);
  return `
    <div style="margin:20px 0;padding:16px;background:#f7f7f5;border-radius:8px;font-size:14px;">
      <strong>Platební údaje pro převod</strong><br/>
      ${account ? `Číslo účtu: <strong>${account}</strong><br/>` : ""}
      Variabilní symbol: <strong>${vs}</strong><br/>
      Částka: <strong>${czk(order.total_cents, order.currency)}</strong><br/>
      <span style="color:#666;">Zboží odešleme po připsání platby.</span>
    </div>`;
}

/** Vystaví (nebo dohledá) fakturu k objednávce a vrátí ji jako PDF přílohu. */
async function invoiceAttachments(order: OrderDetail): Promise<EmailAttachment[]> {
  try {
    const existing = await listInvoices(order.tenant_id, { orderId: order.id, type: "invoice" });
    const detail = existing.items.length > 0
      ? await getInvoice(order.tenant_id, existing.items[0].id)
      : await createInvoice(order.tenant_id, {
          orderId: order.id,
          type: "invoice",
          paymentMethod: PAYMENT_LABEL[order.payment_method ?? ""] ?? order.payment_method ?? undefined,
        });
    if (!detail) return [];
    const qrSvg = await invoiceQrSvg(detail.invoice);
    const pdf = await renderInvoicePdf(renderInvoiceHtml(detail.invoice, detail.items, undefined, { qrSvg }));
    if (!pdf) return [];
    return [{
      filename: `faktura-${detail.invoice.invoice_number.replace(/[^\w-]+/g, "-")}.pdf`,
      content: pdf.toString("base64"),
    }];
  } catch (e) {
    console.error("[commerce email] invoice PDF attachment failed:", e);
    return [];
  }
}

export async function sendOrderEmails(order: OrderDetail, shop: Shop, tenantEmail: string): Promise<void> {
  const shopName = shop.name || "Obchod";
  const addr = order.shipping_address;

  const customerHtml = `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
      <h1 style="font-size:20px;">Děkujeme za objednávku ${order.order_number}</h1>
      <p style="font-size:14px;color:#444;">Potvrzujeme přijetí vaší objednávky v obchodě <strong>${shopName}</strong>.</p>
      ${itemsTable(order)}
      ${bankInstructions(order, shop)}
      <div style="margin-top:20px;font-size:13px;color:#444;">
        <strong>Doručení:</strong> ${order.shipping_method ?? "—"}<br/>
        <strong>Platba:</strong> ${PAYMENT_LABEL[order.payment_method ?? ""] ?? order.payment_method ?? "—"}<br/>
        <strong>Adresa:</strong> ${[addr.name, addr.street, `${addr.zip ?? ""} ${addr.city ?? ""}`].filter(Boolean).join(", ")}
      </div>
      <p style="margin-top:24px;font-size:12px;color:#999;">Fakturu najdete v příloze tohoto e-mailu. O odeslání zásilky vás budeme informovat dalším e-mailem.</p>
    </div>`;

  const ownerEmail = (shop.company as { order_email?: string })?.order_email || tenantEmail;
  const ownerHtml = `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
      <h1 style="font-size:18px;">🛒 Nová objednávka ${order.order_number} — ${czk(order.total_cents, order.currency)}</h1>
      <p style="font-size:14px;">Zákazník: <strong>${order.email}</strong>${order.phone ? ` · ${order.phone}` : ""}</p>
      ${itemsTable(order)}
      <p style="font-size:13px;color:#444;">
        Doručení: ${order.shipping_method ?? "—"} · Platba: ${PAYMENT_LABEL[order.payment_method ?? ""] ?? "—"}<br/>
        ${order.customer_note ? `Poznámka: ${order.customer_note}` : ""}
      </p>
    </div>`;

  // Fire-and-forget — e-mail nesmí shodit checkout
  const attachments = await invoiceAttachments(order);
  await Promise.allSettled([
    sendEmail({ to: order.email, subject: `Potvrzení objednávky ${order.order_number} — ${shopName}`, html: customerHtml, attachments }),
    sendEmail({ to: ownerEmail, subject: `Nová objednávka ${order.order_number} (${czk(order.total_cents, order.currency)})`, html: ownerHtml, attachments }),
  ]);
}

/** E-mail zákazníkovi při přepnutí objednávky na „Odesláno". */
export async function sendOrderShippedEmail(order: OrderDetail, shop: Shop): Promise<void> {
  const shopName = shop.name || "Obchod";
  const addr = order.shipping_address;
  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
      <h1 style="font-size:20px;">📦 Objednávka ${order.order_number} je na cestě</h1>
      <p style="font-size:14px;color:#444;">Dobrý den${addr?.name ? `, ${addr.name}` : ""},<br/>
      vaši objednávku z obchodu <strong>${shopName}</strong> jsme právě předali dopravci.</p>
      <div style="margin:20px 0;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:14px;">
        <strong>Doprava:</strong> ${order.shipping_method ?? "—"}<br/>
        <strong>Doručovací adresa:</strong> ${[addr?.name, addr?.street, `${addr?.zip ?? ""} ${addr?.city ?? ""}`.trim()].filter(Boolean).join(", ")}
      </div>
      ${itemsTable(order)}
      <p style="margin-top:24px;font-size:12px;color:#999;">Děkujeme za nákup v obchodě ${shopName}.</p>
    </div>`;
  await sendEmail({ to: order.email, subject: `Objednávka ${order.order_number} byla odeslána — ${shopName}`, html })
    .catch((e) => console.error("[commerce email] shipped email failed:", e));
}

export async function sendPaymentConfirmedEmail(order: OrderDetail, shop: Shop): Promise<void> {
  const shopName = shop.name || "Obchod";
  const html = `
    <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
      <h1 style="font-size:20px;">Platba přijata — ${order.order_number}</h1>
      <p style="font-size:14px;color:#444;">Přijali jsme platbu <strong>${czk(order.total_cents, order.currency)}</strong> za vaši objednávku v obchodě <strong>${shopName}</strong>. Připravujeme ji k odeslání.</p>
    </div>`;
  await sendEmail({ to: order.email, subject: `Platba přijata — objednávka ${order.order_number}`, html })
    .catch((e) => console.error("[commerce email] payment confirm failed:", e));
}
