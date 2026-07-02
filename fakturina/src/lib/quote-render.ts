type QuoteItem = {
  name: string;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  vatRate: number;
  totalWithoutVat: number;
  totalVat: number;
  totalWithVat: number;
};

export type QuoteRenderData = {
  number: string;
  issueDate: string;
  validUntil?: string | null;
  currency: string;
  note?: string | null;
  noteBeforeItems?: string | null;
  footerText?: string | null;
  supplier: {
    name: string;
    ico?: string | null;
    dic?: string | null;
    address?: string | null;
    city?: string | null;
    zip?: string | null;
    logoUrl?: string | null;
    vatStatus?: string | null;
  };
  client: {
    name?: string | null;
    ico?: string | null;
    dic?: string | null;
    address?: string | null;
    city?: string | null;
    zip?: string | null;
  };
  items: QuoteItem[];
  subtotal: number;
  vatTotal: number;
  total: number;
  isVatPayer: boolean;
  accentColor?: string | null;
};

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

export function generateQuoteHtml(data: QuoteRenderData) {
  const accent = data.accentColor || "#0e7c5a";
  return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #15171c; background: #f4f3ee; }
    .page { width: 794px; min-height: 1123px; margin: 0 auto; background: #fff; padding: 48px; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${accent}; padding-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 800; color: #15171c; }
    .title { text-align: right; }
    .title h1 { margin: 0; color: ${accent}; font-size: 30px; letter-spacing: .04em; }
    .muted { color: #6b7280; font-size: 13px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
    h3 { margin: 0 0 10px; font-size: 11px; color: #8a909b; text-transform: uppercase; letter-spacing: .12em; }
    .name { font-weight: 700; margin-bottom: 4px; }
    .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f6f5f0; border-radius: 12px; padding: 16px; margin: 28px 0; }
    .meta b { display: block; margin-top: 4px; font-size: 14px; }
    .note { border-left: 4px solid ${accent}; background: #f6f5f0; padding: 12px 14px; border-radius: 0 10px 10px 0; margin: 20px 0; font-size: 13px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { background: ${accent}; color: #fff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
    td { border-bottom: 1px solid #eceae2; padding: 12px 10px; vertical-align: top; }
    .right { text-align: right; }
    .total { margin-left: auto; width: 280px; margin-top: 24px; font-size: 14px; }
    .total div { display: flex; justify-content: space-between; padding: 6px 0; }
    .total .grand { border-top: 2px solid ${accent}; margin-top: 8px; padding-top: 12px; font-size: 21px; font-weight: 800; color: ${accent}; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eceae2; color: #8a909b; font-size: 12px; line-height: 1.5; }
    img.logo { max-height: 56px; max-width: 220px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div>${data.supplier.logoUrl ? `<img class="logo" src="${esc(data.supplier.logoUrl)}" />` : `<div class="brand">${esc(data.supplier.name)}</div>`}</div>
      <div class="title"><h1>NABÍDKA</h1><div class="muted">č. ${esc(data.number)}</div></div>
    </div>

    <div class="grid">
      <div>
        <h3>Dodavatel</h3>
        <div class="name">${esc(data.supplier.name)}</div>
        <div class="muted">${esc(data.supplier.address)}<br>${esc(data.supplier.zip)} ${esc(data.supplier.city)}</div>
        <div class="muted">${data.supplier.ico ? `IČO: ${esc(data.supplier.ico)}<br>` : ""}${data.supplier.dic ? `DIČ: ${esc(data.supplier.dic)}` : ""}</div>
      </div>
      <div>
        <h3>Klient</h3>
        <div class="name">${esc(data.client.name || "Bez klienta")}</div>
        <div class="muted">${esc(data.client.address)}<br>${esc(data.client.zip)} ${esc(data.client.city)}</div>
        <div class="muted">${data.client.ico ? `IČO: ${esc(data.client.ico)}<br>` : ""}${data.client.dic ? `DIČ: ${esc(data.client.dic)}` : ""}</div>
      </div>
    </div>

    <div class="meta">
      <div class="muted">Vystaveno<b>${esc(data.issueDate)}</b></div>
      <div class="muted">Platnost do<b>${esc(data.validUntil || "—")}</b></div>
      <div class="muted">Celkem<b>${fmt(data.total, data.currency)}</b></div>
    </div>

    ${data.noteBeforeItems ? `<div class="note">${esc(data.noteBeforeItems).replace(/\n/g, "<br>")}</div>` : ""}

    <table>
      <thead><tr><th>Položka</th><th class="right">Mn.</th><th class="right">Cena/ks</th>${data.isVatPayer ? `<th class="right">DPH</th>` : ""}<th class="right">Celkem</th></tr></thead>
      <tbody>
        ${data.items.map((item) => `<tr>
          <td><b>${esc(item.name)}</b></td>
          <td class="right">${item.quantity} ${esc(item.unit || "")}</td>
          <td class="right">${fmt(item.unitPrice, data.currency)}</td>
          ${data.isVatPayer ? `<td class="right">${item.vatRate} %</td>` : ""}
          <td class="right"><b>${fmt(data.isVatPayer ? item.totalWithVat : item.totalWithoutVat, data.currency)}</b></td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="total">
      ${data.isVatPayer ? `<div><span>Základ DPH</span><span>${fmt(data.subtotal, data.currency)}</span></div><div><span>DPH</span><span>${fmt(data.vatTotal, data.currency)}</span></div>` : ""}
      <div class="grand"><span>Celkem</span><span>${fmt(data.total, data.currency)}</span></div>
    </div>

    ${data.note ? `<div class="note">${esc(data.note).replace(/\n/g, "<br>")}</div>` : ""}
    <div class="footer">${esc(data.footerText || "Děkujeme za Váš zájem.").replace(/\n/g, "<br>")}</div>
  </div>
</body>
</html>`;
}
