import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY není nastaven.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "Fakturina <noreply@fakturina.cz>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fakturina.cz";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

function baseHtml(title: string, content: string) {
  return `<!DOCTYPE html><html lang="cs">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:#4f46e5;padding:24px 32px;display:flex;align-items:center;gap:10px">
      <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">Fakturina</span>
    </div>
    <div style="padding:32px">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1e293b">${title}</h1>
      ${content}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0">
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center">
        Tento e-mail byl automaticky vygenerován systémem <a href="${APP_URL}" style="color:#6366f1;text-decoration:none">Fakturina.cz</a>.
        Pro správu upomínek se přihlaste do svého účtu.
      </p>
    </div>
  </div>
</body></html>`;
}

export interface ReminderEmailData {
  to: string;
  clientName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: string;
  publicToken: string;
  supplierName: string;
  template: string;
  daysOverdue?: number;
}

function renderTemplate(template: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll(`{{${k}}}`, v),
    template
  );
}

function invoiceButton(token: string, label: string) {
  const url = `${APP_URL}/invoice/${token}`;
  return `<div style="text-align:center;margin:24px 0">
    <a href="${url}" style="display:inline-block;padding:13px 32px;background:#4f46e5;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px">${label}</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-12px">
    Nebo zkopírujte odkaz: <a href="${url}" style="color:#6366f1">${url}</a>
  </p>`;
}

function publicButton(url: string, label: string) {
  return `<div style="text-align:center;margin:24px 0">
    <a href="${url}" style="display:inline-block;padding:13px 32px;background:#4f46e5;color:#fff;font-weight:700;border-radius:8px;text-decoration:none;font-size:15px">${label}</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-12px">
    Nebo zkopírujte odkaz: <a href="${url}" style="color:#6366f1">${url}</a>
  </p>`;
}

function metaBox(items: { label: string; value: string }[]) {
  const rows = items.map(({ label, value }) =>
    `<tr>
      <td style="padding:8px 14px;font-size:13px;color:#64748b;border-bottom:1px solid #f1f5f9">${label}</td>
      <td style="padding:8px 14px;font-size:13px;font-weight:600;color:#1e293b;text-align:right;border-bottom:1px solid #f1f5f9">${value}</td>
    </tr>`
  ).join("");
  return `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;margin:20px 0">${rows}</table>`;
}

async function sendResendEmail(payload: Parameters<ReturnType<typeof getResend>["emails"]["send"]>[0]) {
  const result = await getResend().emails.send(payload);
  if ("error" in result && result.error) {
    const message = typeof result.error === "object" && "message" in result.error
      ? String(result.error.message)
      : "Resend odeslání selhalo.";
    throw new Error(message);
  }
  return ("data" in result && result.data && "id" in result.data) ? String(result.data.id) : null;
}

export interface InvoiceEmailData {
  to: string;
  clientName: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: string;
  publicToken: string;
  supplierName: string;
  note?: string;
  pdfBuffer?: Buffer;
}

export interface QuoteEmailData {
  to: string;
  clientName: string;
  quoteNumber: string;
  total: number;
  currency: string;
  validUntil?: string | null;
  publicToken: string;
  supplierName: string;
  note?: string;
  pdfBuffer?: Buffer;
}

export function invoiceEmailSubject(data: Pick<InvoiceEmailData, "invoiceNumber" | "supplierName">) {
  return `Faktura č. ${data.invoiceNumber} od ${data.supplierName}`;
}

export function quoteEmailSubject(data: Pick<QuoteEmailData, "quoteNumber" | "supplierName">) {
  return `Nabídka č. ${data.quoteNumber} od ${data.supplierName}`;
}

export function reminderEmailSubject(data: Pick<ReminderEmailData, "invoiceNumber" | "daysOverdue">) {
  const isOverdue = (data.daysOverdue ?? 0) > 0;
  return isOverdue
    ? `Upomínka: Faktura č. ${data.invoiceNumber} je po splatnosti ${data.daysOverdue} dní`
    : `Připomínka splatnosti faktury č. ${data.invoiceNumber}`;
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<string | null> {
  const content = `
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">
      Dobrý den, ${data.clientName},<br><br>
      zasíláme Vám fakturu č. <strong>${data.invoiceNumber}</strong> od ${data.supplierName}.
    </p>
    ${data.note ? `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${data.note}</p>` : ""}
    ${metaBox([
      { label: "Číslo faktury", value: data.invoiceNumber },
      { label: "Částka k úhradě", value: fmt(data.total, data.currency) },
      { label: "Datum splatnosti", value: data.dueDate },
    ])}
    ${invoiceButton(data.publicToken, "Zobrazit fakturu online")}
  `;

  const attachments = data.pdfBuffer
    ? [{ filename: `faktura-${data.invoiceNumber}.pdf`, content: data.pdfBuffer }]
    : undefined;

  return sendResendEmail({
    from: FROM,
    to: data.to,
    subject: invoiceEmailSubject(data),
    html: baseHtml(`Faktura č. ${data.invoiceNumber}`, content),
    attachments,
  });
}

export async function sendQuoteEmail(data: QuoteEmailData): Promise<string | null> {
  const content = `
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">
      Dobrý den, ${data.clientName},<br><br>
      zasíláme Vám cenovou nabídku č. <strong>${data.quoteNumber}</strong> od ${data.supplierName}.
    </p>
    ${data.note ? `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${data.note}</p>` : ""}
    ${metaBox([
      { label: "Číslo nabídky", value: data.quoteNumber },
      { label: "Celková cena", value: fmt(data.total, data.currency) },
      ...(data.validUntil ? [{ label: "Platnost do", value: data.validUntil }] : []),
    ])}
    ${publicButton(`${APP_URL}/quote/${data.publicToken}`, "Zobrazit nabídku online")}
  `;

  const attachments = data.pdfBuffer
    ? [{ filename: `nabidka-${data.quoteNumber}.pdf`, content: data.pdfBuffer }]
    : undefined;

  return sendResendEmail({
    from: FROM,
    to: data.to,
    subject: quoteEmailSubject(data),
    html: baseHtml(`Nabídka č. ${data.quoteNumber}`, content),
    attachments,
  });
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<string | null> {
  const vars: Record<string, string> = {
    number: data.invoiceNumber,
    total: fmt(data.total, data.currency),
    dueDate: data.dueDate,
    clientName: data.clientName,
    supplierName: data.supplierName,
    daysOverdue: String(data.daysOverdue ?? 0),
  };

  const bodyText = renderTemplate(data.template, vars);
  const paragraphs = bodyText
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.65">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const isOverdue = (data.daysOverdue ?? 0) > 0;
  const subject = reminderEmailSubject(data);

  const accentColor = isOverdue ? "#dc2626" : "#4f46e5";
  const title = isOverdue
    ? `⚠ Faktura po splatnosti`
    : `Připomínka platby`;

  const content = `
    ${paragraphs}
    ${metaBox([
      { label: "Číslo faktury", value: data.invoiceNumber },
      { label: "Částka k úhradě", value: fmt(data.total, data.currency) },
      { label: "Datum splatnosti", value: data.dueDate },
      ...(isOverdue ? [{ label: "Dní po splatnosti", value: `<span style="color:${accentColor};font-weight:700">${data.daysOverdue}</span>` }] : []),
    ])}
    ${invoiceButton(data.publicToken, isOverdue ? "Zobrazit fakturu a zaplatit" : "Zobrazit fakturu")}
  `;

  return sendResendEmail({
    from: FROM,
    to: data.to,
    subject,
    html: baseHtml(title, content),
  });
}
