export interface PdfInvoiceData {
  number: string;
  type: string;
  issueDate: string;
  dueDate: string;
  taxableDate?: string;
  currency: string;
  note?: string;
  variableSymbol?: string;
  template?: string;
  accentColor?: string;
  paymentMethod?: string;
  orderNumber?: string;
  footerText?: string;
  noteBeforeItems?: string;
  discountPct?: number;
  discountAmount?: number;
  reverseCharge?: boolean;
  showAlreadyPaid?: boolean;
  showIban?: string;
  supplier: {
    name: string;
    ico?: string;
    dic?: string;
    address: string;
    city: string;
    zip: string;
    bankAccount?: string;
    iban?: string;
    swift?: string;
    logoUrl?: string;
    vatStatus: string;
  };
  client: {
    name: string;
    ico?: string;
    dic?: string;
    address: string;
    city: string;
    zip: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    vatRate: number;
    totalWithoutVat: number;
    totalVat: number;
    totalWithVat: number;
  }>;
  subtotal: number;
  vatTotal: number;
  total: number;
  isVatPayer: boolean;
  watermark?: boolean;
}

function vatBreakdownRows(items: PdfInvoiceData["items"], currency: string, rowClass: string): string {
  const byRate = new Map<number, { base: number; vat: number }>();
  for (const item of items) {
    const existing = byRate.get(item.vatRate) ?? { base: 0, vat: 0 };
    byRate.set(item.vatRate, {
      base: existing.base + item.totalWithoutVat,
      vat: existing.vat + item.totalVat,
    });
  }
  return Array.from(byRate.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([rate, { base, vat }]) =>
      `<div class="${rowClass}"><span>Základ DPH ${rate} %</span><span>${fmt(base, currency)}</span></div>` +
      (rate > 0 ? `<div class="${rowClass}"><span>DPH ${rate} %</span><span>${fmt(vat, currency)}</span></div>` : "")
    )
    .join("");
}

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    invoice: "FAKTURA",
    proforma: "PROFORMA FAKTURA",
    advance: "ZÁLOHOVÁ FAKTURA",
    credit_note: "DOBROPIS",
    tax_document: "DAŇOVÝ DOKLAD",
  };
  return labels[type] ?? "FAKTURA";
}

// ─── FAKTUROID style ───────────────────────────────────────────────
function templateFakturoid(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${fmt(i.unitPrice, data.currency)}</td>
      ${isVat ? `<td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${i.vatRate} %</td>` : ""}
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat, data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size:13px; color:#333; background:#fff; padding:30px 40px; }
  .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; border-bottom:3px solid #2d6a4f; padding-bottom:20px; }
  .logo { max-height:55px; max-width:160px; object-fit:contain; }
  .doc-title { text-align:right; }
  .doc-title h1 { font-size:22px; font-weight:700; color:#2d6a4f; margin-bottom:4px; }
  .doc-title .num { font-size:14px; color:#666; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:30px; margin-bottom:24px; }
  .party-label { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#999; font-weight:700; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px; }
  .party-name { font-size:14px; font-weight:700; color:#222; margin-bottom:4px; }
  .party p { font-size:12px; color:#555; line-height:1.6; }
  .meta-row { display:flex; gap:0; margin-bottom:24px; background:#f9f9f9; border:1px solid #eee; border-radius:4px; overflow:hidden; }
  .meta-cell { flex:1; padding:10px 14px; border-right:1px solid #eee; }
  .meta-cell:last-child { border-right:none; }
  .meta-cell .lbl { font-size:10px; text-transform:uppercase; color:#999; letter-spacing:0.5px; margin-bottom:3px; }
  .meta-cell .val { font-size:13px; font-weight:600; color:#222; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead th { background:#2d6a4f; color:#fff; padding:9px 10px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; text-align:left; }
  thead th:not(:first-child) { text-align:center; }
  thead th:last-child { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .totals-inner { min-width:260px; border:1px solid #eee; border-radius:4px; overflow:hidden; }
  .totals-row { display:flex; justify-content:space-between; padding:8px 14px; border-bottom:1px solid #eee; font-size:13px; }
  .totals-row:last-child { border-bottom:none; background:#2d6a4f; color:#fff; font-weight:700; font-size:15px; }
  .payment { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  .payment-box { background:#f9f9f9; border:1px solid #eee; border-radius:4px; padding:14px; }
  .payment-box .lbl { font-size:10px; text-transform:uppercase; color:#999; letter-spacing:0.5px; margin-bottom:8px; font-weight:700; }
  .payment-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; }
  .payment-row span:last-child { font-weight:600; }
  .note { background:#fff8e1; border-left:3px solid #ffc107; padding:12px 14px; font-size:12px; color:#555; margin-bottom:20px; }
  .footer { text-align:center; font-size:11px; color:#aaa; border-top:1px solid #eee; padding-top:14px; margin-top:20px; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(0,0,0,0.04); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${data.watermark ? `<div class="watermark">Fakturina.cz FREE</div>` : ""}
<div class="top">
  <div>${data.supplier.logoUrl ? `<img src="${data.supplier.logoUrl}" class="logo" alt="logo">` : `<div style="font-size:20px;font-weight:700;color:#2d6a4f">${data.supplier.name}</div>`}</div>
  <div class="doc-title"><h1>${typeLabel(data.type)}</h1><div class="num">č. ${data.number}</div></div>
</div>
<div class="parties">
  <div>
    <div class="party-label">Dodavatel</div>
    <div class="party-name">${data.supplier.name}</div>
    <p>${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</p>
    ${data.supplier.ico ? `<p style="margin-top:6px">IČ: <strong>${data.supplier.ico}</strong></p>` : ""}
    ${data.supplier.dic ? `<p>DIČ: <strong>${data.supplier.dic}</strong></p>` : ""}
    ${data.supplier.vatStatus === "non_vat" ? `<p style="color:#888;font-style:italic;margin-top:4px">Neplátce DPH</p>` : ""}
  </div>
  <div>
    <div class="party-label">Odběratel</div>
    <div class="party-name">${data.client.name || "—"}</div>
    <p>${data.client.address}<br>${data.client.zip} ${data.client.city}</p>
    ${data.client.ico ? `<p style="margin-top:6px">IČ: <strong>${data.client.ico}</strong></p>` : ""}
    ${data.client.dic ? `<p>DIČ: <strong>${data.client.dic}</strong></p>` : ""}
  </div>
</div>
<div class="meta-row">
  <div class="meta-cell"><div class="lbl">Datum vystavení</div><div class="val">${data.issueDate}</div></div>
  <div class="meta-cell"><div class="lbl">Datum splatnosti</div><div class="val">${data.dueDate}</div></div>
  ${data.taxableDate ? `<div class="meta-cell"><div class="lbl">DUZP</div><div class="val">${data.taxableDate}</div></div>` : ""}
  ${data.variableSymbol ? `<div class="meta-cell"><div class="lbl">Variabilní symbol</div><div class="val">${data.variableSymbol}</div></div>` : ""}
</div>
<table>
  <thead><tr>
    <th style="width:42%;text-align:left">Položka</th>
    <th>Množství</th>
    <th>Cena/ks</th>
    ${isVat ? `<th>DPH</th>` : ""}
    <th>Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div class="totals"><div class="totals-inner">
  ${isVat ? vatBreakdownRows(data.items, data.currency, "totals-row") : ""}
  <div class="totals-row"><span>CELKEM K ÚHRADĚ</span><span>${fmt(data.total, data.currency)}</span></div>
</div></div>
<div class="payment">
  <div class="payment-box">
    <div class="lbl">Platební údaje</div>
    ${data.supplier.bankAccount ? `<div class="payment-row"><span>Číslo účtu</span><span>${data.supplier.bankAccount}</span></div>` : ""}
    ${data.supplier.iban ? `<div class="payment-row"><span>IBAN</span><span>${data.supplier.iban}</span></div>` : ""}
    ${data.supplier.swift ? `<div class="payment-row"><span>SWIFT/BIC</span><span>${data.supplier.swift}</span></div>` : ""}
    ${data.variableSymbol ? `<div class="payment-row"><span>Var. symbol</span><span>${data.variableSymbol}</span></div>` : ""}
    <div class="payment-row" style="border-top:1px solid #ddd;padding-top:6px;margin-top:6px"><span>K úhradě</span><span style="color:#2d6a4f;font-size:14px">${fmt(data.total, data.currency)}</span></div>
  </div>
  <div class="payment-box" style="display:flex;align-items:center;justify-content:center">
    <div style="text-align:center"><div style="width:80px;height:80px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#aaa;margin:0 auto 6px">QR platba</div><div style="font-size:10px;color:#aaa">Naskenujte QR kód</div></div>
  </div>
</div>
${data.note ? `<div class="note"><strong>Poznámka:</strong> ${data.note}</div>` : ""}
<div class="footer">Faktura byla vystavena elektronicky a je platná bez razítka a podpisu.${data.watermark ? "<br>Vystaveno přes Fakturina.cz" : ""}</div>
</body></html>`;
}

// ─── MODERN style (indigo, rounded) ───────────────────────────────
function templateModern(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const itemRows = data.items.map((i) => `
    <tr style="border-bottom:1px solid #f1f5f9">
      <td style="padding:10px 12px;font-size:12px;color:#1e293b;font-weight:500">${i.name}</td>
      <td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${fmt(i.unitPrice, data.currency)}</td>
      ${isVat ? `<td style="padding:10px 8px;text-align:right;font-size:12px;color:#64748b">${i.vatRate} %</td>` : ""}
      <td style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#4f46e5">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat, data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#1e293b; background:#fff; padding:36px 44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; }
  .logo { max-height:56px; max-width:170px; object-fit:contain; }
  .title h1 { font-size:26px; font-weight:800; color:#4f46e5; letter-spacing:-0.5px; }
  .title .num { font-size:13px; color:#94a3b8; margin-top:3px; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:28px; }
  .party-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1.2px; color:#94a3b8; font-weight:700; margin-bottom:8px; }
  .party-name { font-size:14px; font-weight:700; color:#0f172a; margin-bottom:5px; }
  .party p { font-size:12px; color:#475569; line-height:1.65; }
  .meta { display:grid; grid-template-columns:repeat(4,1fr); gap:0; background:#f8fafc; border-radius:12px; overflow:hidden; margin-bottom:28px; }
  .meta-item { padding:12px 16px; border-right:1px solid #e2e8f0; }
  .meta-item:last-child { border-right:none; }
  .meta-lbl { font-size:9px; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; margin-bottom:4px; }
  .meta-val { font-size:13px; font-weight:600; color:#0f172a; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead tr { background:#4f46e5; border-radius:8px; }
  thead th { padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:0.6px; color:#fff; text-align:left; font-weight:600; }
  thead th:not(:first-child) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .totals-box { min-width:250px; }
  .t-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#475569; }
  .t-total { display:flex; justify-content:space-between; padding:10px 0; font-size:17px; font-weight:800; color:#4f46e5; border-top:2px solid #4f46e5; margin-top:4px; }
  .payment { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .pay-box { background:#f8fafc; border-radius:10px; padding:16px; }
  .pay-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; margin-bottom:10px; }
  .pay-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; color:#475569; }
  .pay-row span:last-child { font-weight:600; color:#1e293b; }
  .note { background:#fffbeb; border-left:3px solid #f59e0b; padding:12px 14px; border-radius:0 8px 8px 0; font-size:12px; color:#78350f; margin-bottom:20px; }
  .footer { text-align:center; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:14px; margin-top:16px; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(79,70,229,0.05); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${data.watermark ? `<div class="watermark">Fakturina.cz FREE</div>` : ""}
<div class="header">
  <div>${data.supplier.logoUrl ? `<img src="${data.supplier.logoUrl}" class="logo" alt="logo">` : `<div style="font-size:20px;font-weight:800;color:#4f46e5">${data.supplier.name}</div>`}</div>
  <div class="title"><h1>${typeLabel(data.type)}</h1><div class="num">č. ${data.number}</div></div>
</div>
<div class="parties">
  <div>
    <div class="party-lbl">Dodavatel</div>
    <div class="party-name">${data.supplier.name}</div>
    <p>${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</p>
    ${data.supplier.ico ? `<p style="margin-top:6px">IČ: ${data.supplier.ico}</p>` : ""}
    ${data.supplier.dic ? `<p>DIČ: ${data.supplier.dic}</p>` : ""}
    ${data.supplier.vatStatus === "non_vat" ? `<p style="color:#94a3b8;font-style:italic;margin-top:3px">Neplátce DPH</p>` : ""}
  </div>
  <div>
    <div class="party-lbl">Odběratel</div>
    <div class="party-name">${data.client.name || "—"}</div>
    <p>${data.client.address}<br>${data.client.zip} ${data.client.city}</p>
    ${data.client.ico ? `<p style="margin-top:6px">IČ: ${data.client.ico}</p>` : ""}
    ${data.client.dic ? `<p>DIČ: ${data.client.dic}</p>` : ""}
  </div>
</div>
<div class="meta">
  <div class="meta-item"><div class="meta-lbl">Datum vystavení</div><div class="meta-val">${data.issueDate}</div></div>
  <div class="meta-item"><div class="meta-lbl">Datum splatnosti</div><div class="meta-val">${data.dueDate}</div></div>
  ${data.taxableDate ? `<div class="meta-item"><div class="meta-lbl">DUZP</div><div class="meta-val">${data.taxableDate}</div></div>` : `<div class="meta-item"></div>`}
  ${data.variableSymbol ? `<div class="meta-item"><div class="meta-lbl">Var. symbol</div><div class="meta-val">${data.variableSymbol}</div></div>` : `<div class="meta-item"></div>`}
</div>
<table>
  <thead><tr>
    <th style="width:40%;text-align:left">Položka</th>
    <th>Množství</th><th>Cena/ks</th>
    ${isVat ? `<th>DPH %</th>` : ""}
    <th>Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div class="totals"><div class="totals-box">
  ${isVat ? vatBreakdownRows(data.items, data.currency, "t-row") : ""}
  <div class="t-total"><span>CELKEM</span><span>${fmt(data.total, data.currency)}</span></div>
</div></div>
<div class="payment">
  <div class="pay-box">
    <div class="pay-lbl">Platební údaje</div>
    ${data.supplier.bankAccount ? `<div class="pay-row"><span>Číslo účtu</span><span>${data.supplier.bankAccount}</span></div>` : ""}
    ${data.supplier.iban ? `<div class="pay-row"><span>IBAN</span><span>${data.supplier.iban}</span></div>` : ""}
    ${data.supplier.swift ? `<div class="pay-row"><span>SWIFT/BIC</span><span>${data.supplier.swift}</span></div>` : ""}
    ${data.variableSymbol ? `<div class="pay-row"><span>Var. symbol</span><span>${data.variableSymbol}</span></div>` : ""}
  </div>
  <div class="pay-box" style="display:flex;align-items:center;justify-content:center;background:#eef2ff">
    <div style="text-align:center"><div style="width:80px;height:80px;background:#c7d2fe;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#4f46e5;margin:0 auto 6px">QR kód</div><div style="font-size:10px;color:#818cf8">Naskenujte pro platbu</div></div>
  </div>
</div>
${data.note ? `<div class="note"><strong>Poznámka:</strong> ${data.note}</div>` : ""}
<div class="footer">Faktura vystavena elektronicky přes Fakturina.cz${data.watermark ? " — FREE tarif" : ""}</div>
</body></html>`;
}

// ─── MINIMAL style ─────────────────────────────────────────────────
function templateMinimal(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:12px">${i.name}</td>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice, data.currency)}</td>
      ${isVat ? `<td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat, data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; font-size:12px; color:#222; background:#fff; padding:48px 56px; }
  .header { display:flex; justify-content:space-between; margin-bottom:48px; }
  .logo { max-height:48px; max-width:150px; object-fit:contain; }
  .title { text-align:right; }
  .title h1 { font-size:28px; font-weight:300; letter-spacing:4px; color:#111; text-transform:uppercase; }
  .title .num { font-size:12px; color:#aaa; margin-top:4px; letter-spacing:1px; }
  hr { border:none; border-top:1px solid #ddd; margin:0 0 28px; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-bottom:32px; }
  .party-lbl { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#aaa; margin-bottom:10px; }
  .party-name { font-size:13px; font-weight:600; margin-bottom:4px; }
  .party p { font-size:12px; color:#555; line-height:1.7; }
  .meta { display:flex; gap:40px; margin-bottom:36px; }
  .meta-item .lbl { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#aaa; margin-bottom:4px; }
  .meta-item .val { font-size:12px; font-weight:600; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead th { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:#aaa; padding:0 0 10px; text-align:left; border-bottom:1px solid #ddd; font-weight:400; }
  thead th:not(:first-child) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:32px; }
  .totals-box { min-width:200px; }
  .t-row { display:flex; justify-content:space-between; font-size:12px; color:#666; margin-bottom:4px; }
  .t-total { display:flex; justify-content:space-between; font-size:16px; font-weight:600; border-top:1px solid #222; padding-top:10px; margin-top:8px; }
  .payment .lbl { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:#aaa; margin-bottom:10px; }
  .pay-row { display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px; color:#444; }
  .note { border-left:2px solid #ddd; padding:10px 14px; font-size:12px; color:#666; margin:20px 0; }
  .footer { text-align:center; font-size:10px; color:#ccc; border-top:1px solid #eee; padding-top:16px; margin-top:24px; letter-spacing:0.5px; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(0,0,0,0.03); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${data.watermark ? `<div class="watermark">Fakturina.cz FREE</div>` : ""}
<div class="header">
  <div>${data.supplier.logoUrl ? `<img src="${data.supplier.logoUrl}" class="logo" alt="logo">` : `<div style="font-size:18px;font-weight:600;letter-spacing:1px">${data.supplier.name}</div>`}</div>
  <div class="title"><h1>${typeLabel(data.type)}</h1><div class="num">${data.number}</div></div>
</div>
<hr>
<div class="parties">
  <div>
    <div class="party-lbl">Dodavatel</div>
    <div class="party-name">${data.supplier.name}</div>
    <p>${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</p>
    ${data.supplier.ico ? `<p style="margin-top:5px">IČ: ${data.supplier.ico}</p>` : ""}
    ${data.supplier.dic ? `<p>DIČ: ${data.supplier.dic}</p>` : ""}
    ${data.supplier.vatStatus === "non_vat" ? `<p style="color:#aaa;font-style:italic">Neplátce DPH</p>` : ""}
  </div>
  <div>
    <div class="party-lbl">Odběratel</div>
    <div class="party-name">${data.client.name || "—"}</div>
    <p>${data.client.address}<br>${data.client.zip} ${data.client.city}</p>
    ${data.client.ico ? `<p style="margin-top:5px">IČ: ${data.client.ico}</p>` : ""}
    ${data.client.dic ? `<p>DIČ: ${data.client.dic}</p>` : ""}
  </div>
</div>
<div class="meta">
  <div class="meta-item"><div class="lbl">Vystaveno</div><div class="val">${data.issueDate}</div></div>
  <div class="meta-item"><div class="lbl">Splatnost</div><div class="val">${data.dueDate}</div></div>
  ${data.taxableDate ? `<div class="meta-item"><div class="lbl">DUZP</div><div class="val">${data.taxableDate}</div></div>` : ""}
  ${data.variableSymbol ? `<div class="meta-item"><div class="lbl">Var. symbol</div><div class="val">${data.variableSymbol}</div></div>` : ""}
</div>
<table>
  <thead><tr>
    <th style="width:42%">Položka</th><th style="text-align:right">Mn.</th><th style="text-align:right">Cena/ks</th>
    ${isVat ? `<th style="text-align:right">DPH</th>` : ""}
    <th style="text-align:right">Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div class="totals"><div class="totals-box">
  ${isVat ? vatBreakdownRows(data.items, data.currency, "t-row") : ""}
  <div class="t-total"><span>Celkem k úhradě</span><span>${fmt(data.total, data.currency)}</span></div>
</div></div>
${(data.supplier.bankAccount || data.supplier.iban) ? `<div class="payment">
  <div class="lbl">Platební údaje</div>
  ${data.supplier.bankAccount ? `<div class="pay-row"><span>Číslo účtu</span><span>${data.supplier.bankAccount}</span></div>` : ""}
  ${data.supplier.iban ? `<div class="pay-row"><span>IBAN</span><span>${data.supplier.iban}</span></div>` : ""}
  ${data.variableSymbol ? `<div class="pay-row"><span>Var. symbol</span><span>${data.variableSymbol}</span></div>` : ""}
</div>` : ""}
${data.note ? `<div class="note">${data.note}</div>` : ""}
<div class="footer">FAKTURA VYSTAVENA ELEKTRONICKY — PLATNÁ BEZ RAZÍTKA A PODPISU${data.watermark ? " — FAKTURINA.CZ" : ""}</div>
</body></html>`;
}

// ─── CLASSIC style (dark header) ──────────────────────────────────
function templateClassic(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${fmt(i.unitPrice, data.currency)}</td>
      ${isVat ? `<td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px">${i.vatRate} %</td>` : ""}
      <td style="padding:9px 12px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:700">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat, data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#333; background:#fff; }
  .header-bar { background:#1e293b; color:#fff; padding:24px 40px; display:flex; justify-content:space-between; align-items:center; }
  .header-bar h1 { font-size:24px; font-weight:700; letter-spacing:2px; }
  .header-bar .num { font-size:13px; color:#94a3b8; margin-top:3px; }
  .logo { max-height:50px; max-width:150px; object-fit:contain; filter:brightness(0) invert(1); }
  .body { padding:32px 40px; }
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:24px; background:#f8fafc; padding:20px; border-radius:4px; }
  .party-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1.5px; color:#64748b; font-weight:700; margin-bottom:8px; }
  .party-name { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:5px; }
  .party p { font-size:11px; color:#475569; line-height:1.7; }
  .meta { display:flex; gap:32px; margin-bottom:24px; border-bottom:2px solid #1e293b; padding-bottom:16px; }
  .meta-item .lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:3px; }
  .meta-item .val { font-size:13px; font-weight:600; color:#1e293b; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead tr { background:#1e293b; }
  thead th { padding:10px 12px; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#fff; text-align:left; }
  thead th:not(:first-child) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:24px; }
  .totals-box { min-width:240px; border:2px solid #1e293b; border-radius:4px; overflow:hidden; }
  .t-row { display:flex; justify-content:space-between; padding:7px 14px; font-size:12px; color:#475569; border-bottom:1px solid #e2e8f0; }
  .t-total { display:flex; justify-content:space-between; padding:12px 14px; font-size:16px; font-weight:700; background:#1e293b; color:#fff; }
  .payment { background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:16px; margin-bottom:16px; }
  .pay-lbl { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; font-weight:700; margin-bottom:10px; }
  .pay-row { display:flex; justify-content:space-between; font-size:12px; color:#475569; margin-bottom:5px; }
  .pay-row span:last-child { font-weight:600; color:#1e293b; }
  .note { background:#fffbeb; border:1px solid #fde68a; padding:12px; border-radius:4px; font-size:12px; color:#78350f; margin-bottom:16px; }
  .footer { text-align:center; font-size:10px; color:#94a3b8; padding:16px 40px; border-top:1px solid #e2e8f0; }
  .watermark { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:72px; color:rgba(0,0,0,0.04); font-weight:900; white-space:nowrap; pointer-events:none; }
</style></head><body>
${data.watermark ? `<div class="watermark">Fakturina.cz FREE</div>` : ""}
<div class="header-bar">
  <div>${data.supplier.logoUrl ? `<img src="${data.supplier.logoUrl}" class="logo" alt="logo">` : `<div style="font-size:16px;font-weight:700;color:#e2e8f0">${data.supplier.name}</div>`}</div>
  <div style="text-align:right"><h1>${typeLabel(data.type)}</h1><div class="num">č. ${data.number}</div></div>
</div>
<div class="body">
  <div class="parties">
    <div>
      <div class="party-lbl">Dodavatel</div>
      <div class="party-name">${data.supplier.name}</div>
      <p>${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</p>
      ${data.supplier.ico ? `<p style="margin-top:5px">IČ: ${data.supplier.ico}</p>` : ""}
      ${data.supplier.dic ? `<p>DIČ: ${data.supplier.dic}</p>` : ""}
      ${data.supplier.vatStatus === "non_vat" ? `<p style="color:#94a3b8;font-style:italic">Neplátce DPH</p>` : ""}
    </div>
    <div>
      <div class="party-lbl">Odběratel</div>
      <div class="party-name">${data.client.name || "—"}</div>
      <p>${data.client.address}<br>${data.client.zip} ${data.client.city}</p>
      ${data.client.ico ? `<p style="margin-top:5px">IČ: ${data.client.ico}</p>` : ""}
      ${data.client.dic ? `<p>DIČ: ${data.client.dic}</p>` : ""}
    </div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="lbl">Datum vystavení</div><div class="val">${data.issueDate}</div></div>
    <div class="meta-item"><div class="lbl">Datum splatnosti</div><div class="val">${data.dueDate}</div></div>
    ${data.taxableDate ? `<div class="meta-item"><div class="lbl">DUZP</div><div class="val">${data.taxableDate}</div></div>` : ""}
    ${data.variableSymbol ? `<div class="meta-item"><div class="lbl">Var. symbol</div><div class="val">${data.variableSymbol}</div></div>` : ""}
  </div>
  <table>
    <thead><tr>
      <th style="width:40%;text-align:left">Položka</th><th style="text-align:right">Mn.</th><th style="text-align:right">Cena/ks</th>
      ${isVat ? `<th style="text-align:right">DPH</th>` : ""}
      <th style="text-align:right">Celkem</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals"><div class="totals-box">
    ${isVat ? vatBreakdownRows(data.items, data.currency, "t-row") : ""}
    <div class="t-total"><span>CELKEM K ÚHRADĚ</span><span>${fmt(data.total, data.currency)}</span></div>
  </div></div>
  ${(data.supplier.bankAccount || data.supplier.iban) ? `<div class="payment">
    <div class="pay-lbl">Platební údaje</div>
    ${data.supplier.bankAccount ? `<div class="pay-row"><span>Číslo účtu</span><span>${data.supplier.bankAccount}</span></div>` : ""}
    ${data.supplier.iban ? `<div class="pay-row"><span>IBAN</span><span>${data.supplier.iban}</span></div>` : ""}
    ${data.supplier.swift ? `<div class="pay-row"><span>SWIFT/BIC</span><span>${data.supplier.swift}</span></div>` : ""}
    ${data.variableSymbol ? `<div class="pay-row"><span>Var. symbol</span><span>${data.variableSymbol}</span></div>` : ""}
  </div>` : ""}
  ${data.note ? `<div class="note"><strong>Poznámka:</strong> ${data.note}</div>` : ""}
</div>
<div class="footer">Faktura byla vystavena elektronicky a je platná bez razítka a podpisu.${data.watermark ? " Vystaveno přes Fakturina.cz" : ""}</div>
</body></html>`;
}

function paymentMethodLabel(m?: string) {
  const map: Record<string,string> = { bank:"Převodem", card:"Kartou", cash:"Hotově", cod:"Dobírka", other:"Jiná" };
  return map[m ?? "bank"] ?? "Převodem";
}

// ─── SOLARIS ───────────────────────────────────────────────────────
function templateSolaris(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const ac = data.accentColor ?? "#333333";
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:7px 0;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice, data.currency)}</td>
      ${isVat ? `<td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:7px 0;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithoutVat : i.totalWithoutVat, data.currency)}</td>
    </tr>`).join("");

  const vatRows = (() => {
    if (!isVat) return "";
    const m = new Map<number,{base:number;vat:number}>();
    data.items.forEach(i => { const e = m.get(i.vatRate)??{base:0,vat:0}; m.set(i.vatRate,{base:e.base+i.totalWithoutVat,vat:e.vat+i.totalVat}); });
    return Array.from(m.entries()).sort((a,b)=>b[0]-a[0]).map(([r,{base,vat}])=>
      `<div style="display:grid;grid-template-columns:70px 1fr 1fr;font-size:11px;margin-bottom:2px;color:#555">
        <span>${r} %</span><span style="text-align:right">${fmt(base,data.currency)}</span><span style="text-align:right">${fmt(vat,data.currency)}</span>
      </div>`
    ).join("");
  })();

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${data.watermark ? `<div class="wm">Fakturina FREE</div>` : ""}
<div style="border-top:3px solid ${ac};margin-bottom:22px"></div>
${data.supplier.logoUrl ? `<div style="margin-bottom:16px"><img src="${data.supplier.logoUrl}" style="max-height:50px;max-width:160px;object-fit:contain" alt="logo"></div>` : ""}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:18px">
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">DODAVATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.supplier.name}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</div>
    ${data.supplier.ico ? `<div style="font-size:11px;margin-top:5px">IČO <strong>${data.supplier.ico}</strong>${data.supplier.dic ? `&nbsp;&nbsp;DIČ <strong>${data.supplier.dic}</strong>` : ""}</div>` : ""}
    ${data.supplier.vatStatus==="non_vat" ? `<div style="font-size:10px;color:#aaa;font-style:italic;margin-top:2px">Neplátce DPH</div>` : ""}
  </div>
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">ODBĚRATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.client.name||"—"}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${data.client.address}<br>${data.client.zip} ${data.client.city}</div>
    ${data.client.ico ? `<div style="font-size:11px;margin-top:5px">IČO <strong>${data.client.ico}</strong>${data.client.dic ? `&nbsp;&nbsp;DIČ <strong>${data.client.dic}</strong>` : ""}</div>` : ""}
  </div>
</div>
<div style="text-align:right;margin-bottom:14px">
  <div style="font-size:20px;font-weight:700">${typeLabel(data.type)} ${data.number}</div>
  ${isVat ? `<div style="font-size:11px;color:#888;margin-top:2px">Daňový doklad</div>` : ""}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:12px 0;margin-bottom:18px">
  <div>
    ${data.supplier.bankAccount ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Bankovní účet</span><span style="font-weight:600">${data.supplier.bankAccount}</span></div>` : ""}
    ${data.variableSymbol ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Variabilní symbol</span><span style="font-weight:600">${data.variableSymbol}</span></div>` : ""}
    <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Způsob platby</span><span style="font-weight:600">${paymentMethodLabel(data.paymentMethod)}</span></div>
    ${data.orderNumber ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin-top:3px"><span style="color:#888">Číslo objednávky</span><span style="font-weight:600">${data.orderNumber}</span></div>` : ""}
  </div>
  <div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum vystavení</span><span style="font-weight:600">${data.issueDate}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum splatnosti</span><span style="font-weight:600">${data.dueDate}</span></div>
    ${data.taxableDate ? `<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Datum zdan. plnění</span><span style="font-weight:600">${data.taxableDate}</span></div>` : ""}
  </div>
</div>
${data.noteBeforeItems ? `<div style="font-size:12px;color:#555;margin-bottom:12px;font-style:italic">${data.noteBeforeItems}</div>` : ""}
<table style="width:100%;border-collapse:collapse;margin-bottom:14px">
  <thead><tr>
    <th style="text-align:left;padding:5px 8px 5px 0;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${ac}">Popis</th>
    <th style="text-align:center;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${ac}">MJ</th>
    <th style="text-align:right;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${ac}">Cena za MJ</th>
    ${isVat ? `<th style="text-align:center;padding:5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${ac}">DPH</th>` : ""}
    <th style="text-align:right;padding:5px 0 5px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid ${ac}">Celkem bez DPH</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:18px">
  <div style="min-width:280px">
    ${isVat ? `<div style="display:grid;grid-template-columns:70px 1fr 1fr;font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;margin-bottom:5px"><span>SAZBA</span><span style="text-align:right">ZÁKLAD</span><span style="text-align:right">DPH</span></div>${vatRows}` : ""}
    <div style="border-top:2px solid ${ac};padding-top:6px;margin-top:5px;text-align:right;font-size:20px;font-weight:700">${fmt(data.total,data.currency)}</div>
  </div>
</div>
${data.note ? `<div style="border-left:3px solid #ccc;padding:10px 14px;font-size:11px;color:#555;margin-bottom:16px">${data.note}</div>` : ""}
<div style="font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:12px;margin-top:8px">${data.footerText || "Faktura byla vystavena elektronicky a je platná bez razítka a podpisu."}</div>
</body></html>`;
}

// ─── AURORA ────────────────────────────────────────────────────────
function templateAurora(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const accent = data.accentColor ?? "#7c3aed";
  const accentDark = accent;
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:8px 6px 8px 0;border-bottom:1px solid #f0f0f0;font-size:12px">${i.name}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice,data.currency)}</td>
      ${isVat ? `<td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:8px 0 8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat,data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${data.watermark ? `<div class="wm">Fakturina FREE</div>` : ""}
<!-- HEADER -->
<div style="background:${accent};padding:28px 40px 0;position:relative;overflow:hidden;min-height:160px">
  <svg style="position:absolute;bottom:0;left:0;width:100%;height:60px" viewBox="0 0 600 60" preserveAspectRatio="none">
    <path d="M0,60 L0,30 Q50,0 100,20 Q150,40 200,15 Q250,-10 300,25 Q350,55 400,20 Q450,-10 500,30 Q550,60 600,20 L600,60 Z" fill="${accentDark}" opacity="0.5"/>
    <path d="M0,60 L0,40 Q80,10 160,35 Q240,55 320,25 Q400,-5 480,30 Q540,55 600,35 L600,60 Z" fill="rgba(0,0,0,0.15)"/>
  </svg>
  <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      ${data.supplier.logoUrl ? `<img src="${data.supplier.logoUrl}" style="max-height:44px;max-width:140px;object-fit:contain;filter:brightness(0) invert(1);margin-bottom:12px" alt="logo">` : ""}
      <div style="font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Daňový doklad</div>
      <div style="font-size:22px;font-weight:800;color:#fff">${typeLabel(data.type)} ${data.number}</div>
      <div style="font-size:26px;font-weight:800;color:#fff;margin-top:6px">${fmt(data.total,data.currency)}</div>
    </div>
    <div style="background:rgba(255,255,255,0.12);border-radius:8px;width:70px;height:70px;display:flex;align-items:center;justify-content:center">
      <div style="font-size:9px;color:rgba(255,255,255,0.6);text-align:center">QR<br>Platba</div>
    </div>
  </div>
</div>
<!-- META -->
<div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #eee">
  ${data.supplier.bankAccount ? `<div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Bankovní účet</div><div style="font-size:12px;font-weight:600">${data.supplier.bankAccount}</div></div>` : `<div style="padding:12px 14px;border-right:1px solid #eee"></div>`}
  ${data.variableSymbol ? `<div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Var. symbol</div><div style="font-size:12px;font-weight:600">${data.variableSymbol}</div></div>` : `<div style="padding:12px 14px;border-right:1px solid #eee"></div>`}
  <div style="padding:12px 14px;border-right:1px solid #eee"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Datum splatnosti</div><div style="font-size:12px;font-weight:600">${data.dueDate}</div></div>
  <div style="padding:12px 14px"><div style="font-size:9px;color:#999;text-transform:uppercase;margin-bottom:3px">Datum vystavení</div><div style="font-size:12px;font-weight:600">${data.issueDate}</div></div>
</div>
<!-- BODY -->
<div style="padding:24px 40px">
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr style="background:${accent}">
    <th style="text-align:left;padding:9px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#fff;font-weight:600">Položka</th>
    <th style="text-align:center;padding:9px 8px;font-size:10px;color:#fff;font-weight:600">MJ</th>
    <th style="text-align:right;padding:9px 8px;font-size:10px;color:#fff;font-weight:600">Cena/ks</th>
    ${isVat ? `<th style="text-align:center;padding:9px 8px;font-size:10px;color:#fff;font-weight:600">DPH</th>` : ""}
    <th style="text-align:right;padding:9px 10px;font-size:10px;color:#fff;font-weight:600">Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:20px">
  <div style="min-width:240px">
    ${isVat ? vatBreakdownRows(data.items,data.currency,"") : ""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${accent};font-size:16px;font-weight:700;color:${accent}"><span>CELKEM</span><span>${fmt(data.total,data.currency)}</span></div>
  </div>
</div>
${data.note ? `<div style="border-left:3px solid ${accent};padding:10px 14px;font-size:11px;color:#555;margin-bottom:16px;background:#f5f3ff">${data.note}</div>` : ""}
</div>
<!-- FOOTER -->
<div style="background:#f8fafc;border-top:1px solid #eee;padding:16px 40px;display:grid;grid-template-columns:1fr 1fr;gap:24px">
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:5px">DODAVATEL</div>
    <div style="font-size:11px;font-weight:700">${data.supplier.name}</div>
    <div style="font-size:10px;color:#64748b;line-height:1.6">${data.supplier.address}, ${data.supplier.zip} ${data.supplier.city}${data.supplier.ico ? ` &nbsp; IČO ${data.supplier.ico}` : ""}${data.supplier.dic ? ` &nbsp; DIČ ${data.supplier.dic}` : ""}</div>
  </div>
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:5px">ODBĚRATEL</div>
    <div style="font-size:11px;font-weight:700">${data.client.name||"—"}</div>
    <div style="font-size:10px;color:#64748b;line-height:1.6">${data.client.address}, ${data.client.zip} ${data.client.city}${data.client.ico ? ` &nbsp; IČO ${data.client.ico}` : ""}${data.client.dic ? ` &nbsp; DIČ ${data.client.dic}` : ""}</div>
  </div>
</div>
</body></html>`;
}

// ─── FÉNIX ─────────────────────────────────────────────────────────
function templateFenix(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const accent = data.accentColor ?? "#2563eb";
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:7px 6px 7px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;border-left:3px solid ${accent}">${i.name}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice,data.currency)}</td>
      ${isVat ? `<td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:7px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat,data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${data.watermark ? `<div class="wm">Fakturina FREE</div>` : ""}
<div style="text-align:center;margin-bottom:20px">
  <div style="font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase">${typeLabel(data.type)} <span style="color:${accent}">${data.number}</span></div>
  ${isVat ? `<div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:2px">DAŇOVÝ DOKLAD</div>` : ""}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px">
  <div>
    <div style="font-size:11px;color:#888;margin-bottom:6px">Částka k úhradě</div>
    <div style="font-size:28px;font-weight:800;color:${accent};margin-bottom:10px">${fmt(data.total,data.currency)}</div>
    ${data.supplier.bankAccount ? `<div style="font-size:13px;font-weight:700;color:${accent};margin-bottom:4px">${data.supplier.bankAccount}</div>` : ""}
    ${data.variableSymbol ? `<div style="font-size:11px;color:#555;margin-bottom:2px">Var. symbol: <strong>${data.variableSymbol}</strong></div>` : ""}
    <div style="font-size:11px;color:#555">Způsob platby: <strong>Převodem</strong></div>
  </div>
  <div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:7px">ODBĚRATEL</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.client.name||"—"}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${data.client.address}<br>${data.client.zip} ${data.client.city}</div>
      ${data.client.ico ? `<div style="font-size:11px;margin-top:4px">IČO <strong>${data.client.ico}</strong>${data.client.dic ? `&nbsp; DIČ <strong>${data.client.dic}</strong>` : ""}</div>` : ""}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
      <div style="font-size:10px;color:#888">Vystavení<br><strong style="font-size:11px;color:#333">${data.issueDate}</strong></div>
      <div style="font-size:10px;color:#888">Splatnost<br><strong style="font-size:11px;color:#333">${data.dueDate}</strong></div>
    </div>
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr>
    <th style="text-align:left;padding:7px 14px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Popis</th>
    <th style="text-align:center;padding:7px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">MJ</th>
    <th style="text-align:right;padding:7px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Cena/ks</th>
    ${isVat ? `<th style="text-align:center;padding:7px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">DPH</th>` : ""}
    <th style="text-align:right;padding:7px 8px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:20px">
  <div style="min-width:240px">
    ${isVat ? vatBreakdownRows(data.items,data.currency,"") : ""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${accent};font-size:16px;font-weight:700;color:${accent}"><span>CELKEM</span><span>${fmt(data.total,data.currency)}</span></div>
  </div>
</div>
${data.note ? `<div style="border-left:3px solid ${accent};padding:10px 14px;font-size:11px;color:#555;margin-bottom:16px">${data.note}</div>` : ""}
<div style="border-top:1px solid #eee;padding-top:16px;margin-top:8px">
  <div style="font-size:13px;color:${accent};font-weight:700;margin-bottom:4px">Díky!</div>
  <div style="font-size:11px;font-weight:600">${data.supplier.name}</div>
  <div style="font-size:10px;color:#888;line-height:1.6">${data.supplier.address}, ${data.supplier.zip} ${data.supplier.city}${data.supplier.ico ? ` &nbsp; IČO ${data.supplier.ico}` : ""}</div>
  <div style="font-size:10px;color:#aaa;margin-top:8px">Faktura vystavena elektronicky — platná bez razítka a podpisu.</div>
</div>
</body></html>`;
}

// ─── ORION ─────────────────────────────────────────────────────────
function templateOrion(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const accent = data.accentColor ?? "#c2410c";
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:12px">${i.name}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice,data.currency)}</td>
      ${isVat ? `<td style="padding:8px 8px;border-bottom:1px solid #eee;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat,data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:0;}
.body{padding:24px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${data.watermark ? `<div class="wm">Fakturina FREE</div>` : ""}
${data.supplier.logoUrl ? `<div style="padding:16px 40px 0"><img src="${data.supplier.logoUrl}" style="max-height:44px;max-width:140px;object-fit:contain" alt="logo"></div>` : ""}
<div style="background:${accent};padding:14px 40px;margin-top:${data.supplier.logoUrl ? "10px" : "0"}">
  <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:20px;font-weight:700;color:#fff">${typeLabel(data.type)} ${data.number}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.8)">${isVat ? "Daňový doklad" : ""}</div>
  </div>
</div>
<div class="body">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:18px;margin-top:16px">
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">DODAVATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.supplier.name}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</div>
    ${data.supplier.ico ? `<div style="font-size:11px;margin-top:4px">IČO <strong>${data.supplier.ico}</strong>${data.supplier.dic ? `&nbsp; DIČ <strong>${data.supplier.dic}</strong>` : ""}</div>` : ""}
    ${data.supplier.vatStatus==="non_vat" ? `<div style="font-size:10px;color:#aaa;font-style:italic">Neplátce DPH</div>` : ""}
  </div>
  <div>
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#999;font-weight:700;margin-bottom:7px">ODBĚRATEL</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.client.name||"—"}</div>
    <div style="font-size:11px;color:#555;line-height:1.7">${data.client.address}<br>${data.client.zip} ${data.client.city}</div>
    ${data.client.ico ? `<div style="font-size:11px;margin-top:4px">IČO <strong>${data.client.ico}</strong>${data.client.dic ? `&nbsp; DIČ <strong>${data.client.dic}</strong>` : ""}</div>` : ""}
  </div>
</div>
<div style="background:${accent}15;border-radius:6px;padding:10px 14px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
  <div>
    ${data.supplier.bankAccount ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Bankovní účet</span><span style="font-weight:700;color:${accent}">${data.supplier.bankAccount}</span></div>` : ""}
    ${data.variableSymbol ? `<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Var. symbol</span><span style="font-weight:700;color:${accent}">${data.variableSymbol}</span></div>` : ""}
    <div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Způsob platby</span><span style="font-weight:600">Převodem</span></div>
  </div>
  <div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum vystavení</span><span style="font-weight:600">${data.issueDate}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#888">Datum splatnosti</span><span style="font-weight:700;color:${accent}">${data.dueDate}</span></div>
    ${data.taxableDate ? `<div style="display:flex;justify-content:space-between;font-size:11px"><span style="color:#888">Datum zdan. plnění</span><span style="font-weight:600">${data.taxableDate}</span></div>` : ""}
  </div>
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr style="background:${accent}">
    <th style="text-align:left;padding:8px 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.4px;color:#fff;font-weight:600">Popis</th>
    <th style="text-align:center;padding:8px;font-size:10px;color:#fff;font-weight:600">MJ</th>
    <th style="text-align:right;padding:8px;font-size:10px;color:#fff;font-weight:600">Cena/ks</th>
    ${isVat ? `<th style="text-align:center;padding:8px;font-size:10px;color:#fff;font-weight:600">DPH</th>` : ""}
    <th style="text-align:right;padding:8px 10px;font-size:10px;color:#fff;font-weight:600">Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
  <div style="min-width:240px">
    ${isVat ? vatBreakdownRows(data.items,data.currency,"") : ""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${accent};font-size:18px;font-weight:700;color:${accent}"><span>CELKEM</span><span>${fmt(data.total,data.currency)}</span></div>
  </div>
</div>
${data.note ? `<div style="border-left:3px solid ${accent};padding:10px 14px;font-size:11px;color:#555;margin-bottom:14px">${data.note}</div>` : ""}
<div style="font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:10px">Faktura byla vystavena elektronicky a je platná bez razítka a podpisu.</div>
</div>
</body></html>`;
}

// ─── LYRA ──────────────────────────────────────────────────────────
function templateLyra(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const accent = data.accentColor ?? "#c2410c";
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:8px 8px 8px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;border-left:3px solid ${accent}">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice,data.currency)}</td>
      ${isVat ? `<td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat,data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:32px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${data.watermark ? `<div class="wm">Fakturina FREE</div>` : ""}
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
  <div>
    <div style="font-size:22px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase">${typeLabel(data.type)} <span style="color:${accent}">${data.number}</span></div>
    ${isVat ? `<div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#aaa;margin-top:2px">DAŇOVÝ DOKLAD</div>` : ""}
  </div>
  <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:center;width:52px;height:52px">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="${accent}" stroke-width="2"/><path d="M7 8h10M7 12h7M7 16h5" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/></svg>
  </div>
</div>
<div style="height:3px;background:${accent};margin-bottom:18px;border-radius:2px"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
  <div style="display:flex;gap:10px">
    <div style="writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ccc;white-space:nowrap;align-self:center">DODAVATEL</div>
    <div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.supplier.name}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${data.supplier.address}<br>${data.supplier.zip} ${data.supplier.city}</div>
      ${data.supplier.ico ? `<div style="font-size:11px;margin-top:4px">IČO <strong>${data.supplier.ico}</strong>${data.supplier.dic ? `&nbsp; DIČ <strong>${data.supplier.dic}</strong>` : ""}</div>` : ""}
      ${data.supplier.vatStatus==="non_vat" ? `<div style="font-size:10px;color:#aaa;font-style:italic">Neplátce DPH</div>` : ""}
    </div>
  </div>
  <div style="display:flex;gap:10px">
    <div style="writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ccc;white-space:nowrap;align-self:center">ODBĚRATEL</div>
    <div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.client.name||"—"}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${data.client.address}<br>${data.client.zip} ${data.client.city}</div>
      ${data.client.ico ? `<div style="font-size:11px;margin-top:4px">IČO <strong>${data.client.ico}</strong>${data.client.dic ? `&nbsp; DIČ <strong>${data.client.dic}</strong>` : ""}</div>` : ""}
    </div>
  </div>
</div>
<div style="margin-bottom:18px">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${accent}20;border-radius:3px;flex-shrink:0;text-align:center;line-height:16px;font-size:9px;color:${accent}">📅</span>
    <span style="font-size:11px;color:#888;min-width:130px">Datum vystavení</span>
    <span style="font-size:11px;font-weight:600">${data.issueDate}</span>
  </div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${accent}20;border-radius:3px;flex-shrink:0;text-align:center;line-height:16px;font-size:9px;color:${accent}">📅</span>
    <span style="font-size:11px;color:#888;min-width:130px">Datum splatnosti</span>
    <span style="font-size:11px;font-weight:700;color:${accent}">${data.dueDate}</span>
  </div>
  ${data.taxableDate ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${accent}20;border-radius:3px;flex-shrink:0"></span>
    <span style="font-size:11px;color:#888;min-width:130px">Datum zdan. plnění</span>
    <span style="font-size:11px;font-weight:600">${data.taxableDate}</span>
  </div>` : ""}
  ${data.supplier.bankAccount ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
    <span style="display:inline-block;width:16px;height:16px;background:${accent}20;border-radius:3px;flex-shrink:0;text-align:center;line-height:16px;font-size:9px;color:${accent}">💳</span>
    <span style="font-size:11px;color:#888;min-width:130px">Bankovní účet</span>
    <span style="font-size:11px;font-weight:700;color:${accent}">${data.supplier.bankAccount}</span>
  </div>` : ""}
  ${data.variableSymbol ? `<div style="display:flex;align-items:center;gap:10px">
    <span style="display:inline-block;width:16px;height:16px;background:${accent}20;border-radius:3px;flex-shrink:0"></span>
    <span style="font-size:11px;color:#888;min-width:130px">Variabilní symbol</span>
    <span style="font-size:11px;font-weight:600;color:${accent}">${data.variableSymbol}</span>
  </div>` : ""}
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
  <thead><tr>
    <th style="text-align:left;padding:6px 14px;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Popis</th>
    <th style="text-align:center;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">MJ</th>
    <th style="text-align:right;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Cena/ks</th>
    ${isVat ? `<th style="text-align:center;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">DPH</th>` : ""}
    <th style="text-align:right;padding:6px 8px;font-size:9px;color:#aaa;font-weight:400;border-bottom:1px solid #ddd">Celkem</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
  <div style="min-width:240px">
    ${isVat ? vatBreakdownRows(data.items,data.currency,"") : ""}
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${accent};font-size:16px;font-weight:700;color:${accent}"><span>CELKEM</span><span>${fmt(data.total,data.currency)}</span></div>
  </div>
</div>
${data.note ? `<div style="border-left:3px solid ${accent};padding:10px 14px;font-size:11px;color:#555;margin-bottom:14px">${data.note}</div>` : ""}
<div style="border-top:1px solid #eee;padding-top:12px;margin-top:8px">
  <div style="font-size:13px;color:${accent};font-weight:700;margin-bottom:3px">Díky!</div>
  <div style="font-size:11px;font-weight:600">${data.supplier.name}</div>
  <div style="font-size:10px;color:#888">${data.supplier.address}, ${data.supplier.zip} ${data.supplier.city}${data.supplier.ico ? ` &nbsp; IČO ${data.supplier.ico}` : ""}</div>
  <div style="font-size:10px;color:#aaa;margin-top:8px">Faktura vystavena elektronicky — platná bez razítka a podpisu.</div>
</div>
</body></html>`;
}

// ─── VEGA ──────────────────────────────────────────────────────────
function templateVega(data: PdfInvoiceData): string {
  const isVat = data.isVatPayer;
  const accent = data.accentColor ?? "#c2410c";
  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-size:12px">${i.name}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.quantity}${i.unit ? ` ${i.unit}` : ""}</td>
      <td style="padding:8px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;color:#666">${fmt(i.unitPrice,data.currency)}</td>
      ${isVat ? `<td style="padding:8px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666">${i.vatRate} %</td>` : ""}
      <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:12px;font-weight:600">${fmt(isVat ? i.totalWithVat : i.totalWithoutVat,data.currency)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8">
<style>* { margin:0;padding:0;box-sizing:border-box; } body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;background:#fff;padding:0;}
.body{padding:22px 40px;}
.wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;color:rgba(0,0,0,0.04);font-weight:900;white-space:nowrap;pointer-events:none;}</style></head><body>
${data.watermark ? `<div class="wm">Fakturina FREE</div>` : ""}
<!-- TOP BAND -->
<div style="background:${accent};padding:20px 40px;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center">
  <div>
    <div style="font-size:22px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:0.5px">${typeLabel(data.type)} ${data.number}</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px">${isVat ? "Daňový doklad" : ""}</div>
    ${data.supplier.logoUrl ? `<img src="${data.supplier.logoUrl}" style="max-height:36px;max-width:120px;object-fit:contain;filter:brightness(0) invert(1);margin-top:10px" alt="logo">` : ""}
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:2px">Částka k úhradě</div>
    <div style="font-size:26px;font-weight:800;color:#fff">${fmt(data.total,data.currency)}</div>
    ${data.supplier.bankAccount ? `<div style="font-size:11px;color:rgba(255,255,255,0.85);margin-top:4px">${data.supplier.bankAccount}</div>` : ""}
    ${data.variableSymbol ? `<div style="font-size:11px;color:rgba(255,255,255,0.7)">VS: ${data.variableSymbol}</div>` : ""}
    <div style="font-size:11px;color:rgba(255,255,255,0.7)">Převodem</div>
  </div>
</div>
<!-- DATE BAND -->
<div style="background:${accent}18;display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid ${accent}30">
  <div style="padding:10px 14px;border-right:1px solid ${accent}30">
    <div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:2px">Datum vystavení</div>
    <div style="font-size:12px;font-weight:600">${data.issueDate}</div>
  </div>
  <div style="padding:10px 14px;border-right:1px solid ${accent}30;background:${accent}25">
    <div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:2px">Datum splatnosti</div>
    <div style="font-size:12px;font-weight:700;color:${accent}">${data.dueDate}</div>
  </div>
  <div style="padding:10px 14px">
    <div style="font-size:9px;color:#888;text-transform:uppercase;margin-bottom:2px">${data.taxableDate ? "Datum zdan. plnění" : "Způsob platby"}</div>
    <div style="font-size:12px;font-weight:600">${data.taxableDate || "Převodem"}</div>
  </div>
</div>
<!-- BODY -->
<div class="body">
  <div style="border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div>
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:700;margin-bottom:6px">ODBĚRATEL</div>
      <div style="font-size:13px;font-weight:700;margin-bottom:3px">${data.client.name||"—"}</div>
      <div style="font-size:11px;color:#555;line-height:1.7">${data.client.address}<br>${data.client.zip} ${data.client.city}</div>
      ${data.client.ico ? `<div style="font-size:11px;margin-top:4px">IČO <strong>${data.client.ico}</strong>${data.client.dic ? `&nbsp; DIČ <strong>${data.client.dic}</strong>` : ""}</div>` : ""}
    </div>
    <div style="display:grid;align-content:center">
      ${data.supplier.iban ? `<div style="font-size:10px;color:#888;margin-bottom:2px">IBAN</div><div style="font-size:11px;font-weight:600;margin-bottom:8px">${data.supplier.iban}</div>` : ""}
      ${data.supplier.swift ? `<div style="font-size:10px;color:#888;margin-bottom:2px">SWIFT/BIC</div><div style="font-size:11px;font-weight:600">${data.supplier.swift}</div>` : ""}
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
    <thead><tr style="background:#f8fafc;border-top:2px solid ${accent}">
      <th style="text-align:left;padding:8px 10px;font-size:9px;text-transform:uppercase;letter-spacing:0.4px;color:#888;font-weight:600">Popis</th>
      <th style="text-align:center;padding:8px;font-size:9px;color:#888;font-weight:600">MJ</th>
      <th style="text-align:right;padding:8px;font-size:9px;color:#888;font-weight:600">Cena/ks</th>
      ${isVat ? `<th style="text-align:center;padding:8px;font-size:9px;color:#888;font-weight:600">DPH</th>` : ""}
      <th style="text-align:right;padding:8px 10px;font-size:9px;color:#888;font-weight:600">Celkem</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
    <div style="min-width:240px">
      ${isVat ? vatBreakdownRows(data.items,data.currency,"") : ""}
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid ${accent};font-size:18px;font-weight:700;color:${accent}"><span>CELKEM</span><span>${fmt(data.total,data.currency)}</span></div>
    </div>
  </div>
  ${data.note ? `<div style="border-left:3px solid ${accent};padding:10px 14px;font-size:11px;color:#555;margin-bottom:14px">${data.note}</div>` : ""}
</div>
<!-- FOOTER -->
<div style="background:#f8fafc;border-top:1px solid #eee;padding:16px 40px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center">
  <div>
    <div style="font-size:13px;color:${accent};font-weight:700;margin-bottom:3px">Díky!</div>
    <div style="font-size:11px;font-weight:600">${data.supplier.name}</div>
    <div style="font-size:10px;color:#888">${data.supplier.address}, ${data.supplier.zip} ${data.supplier.city}${data.supplier.ico ? ` &nbsp; IČO ${data.supplier.ico}` : ""}</div>
  </div>
  <div style="font-size:10px;color:#ccc;text-align:right">Vystaveno elektronicky</div>
</div>
</body></html>`;
}

// ─── Router ────────────────────────────────────────────────────────
export function generateInvoiceHtml(data: PdfInvoiceData): string {
  let html: string;
  switch (data.template) {
    case "solaris":   html = templateSolaris(data); break;
    case "aurora":    html = templateAurora(data); break;
    case "fenix":     html = templateFenix(data); break;
    case "orion":     html = templateOrion(data); break;
    case "lyra":      html = templateLyra(data); break;
    case "vega":      html = templateVega(data); break;
    case "fakturoid": html = templateFakturoid(data); break;
    case "minimal":   html = templateMinimal(data); break;
    case "classic":   html = templateClassic(data); break;
    case "modern":
    default:          html = templateModern(data); break;
  }
  return postProcess(html, data);
}

function postProcess(html: string, data: PdfInvoiceData): string {
  // 1. Already-paid banner — inject immediately after <body> opening tag
  if (data.showAlreadyPaid) {
    const banner = `<div style="background:#dcfce7;border-bottom:3px solid #16a34a;padding:13px 40px;text-align:center;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#15803d;letter-spacing:1px;text-transform:uppercase">&#10003; Neplatte — faktura již byla uhrazena</div>`;
    html = html.replace(/<body([^>]*)>/, (_m, attrs) => `<body${attrs}>${banner}`);
  }

  // 2. Reverse charge notice — inject before the CELKEM total line
  if (data.reverseCharge) {
    const notice = `<div style="font-size:11px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px 12px;margin-bottom:8px;color:#92400e;text-align:center">Přenesená daňová povinnost dle § 92a ZDPH — DPH odvádí zákazník</div>`;
    html = injectBeforeCelkem(html, notice, data);
  }

  // 3. Discount row — inject before the CELKEM total line
  const gross = Math.round((data.subtotal + data.vatTotal) * 100) / 100;
  const discountValue = Math.round((gross - data.total) * 100) / 100;
  if (discountValue > 0.005) {
    const label = (data.discountPct ?? 0) > 0 ? `Sleva (${data.discountPct} %)` : "Sleva";
    const discountHtml = `<div style="display:flex;justify-content:space-between;font-size:13px;color:#16a34a;font-weight:600;margin-bottom:6px;padding:4px 0"><span>${label}</span><span>&#8722;${fmt(discountValue, data.currency)}</span></div>`;
    html = injectBeforeCelkem(html, discountHtml, data);
  }

  return html;
}

function injectBeforeCelkem(html: string, inject: string, data: PdfInvoiceData): string {
  const totalFormatted = fmt(data.total, data.currency);
  // All known CELKEM patterns across templates
  const patterns = [
    `<span>CELKEM K ÚHRADĚ</span><span>${totalFormatted}</span>`,
    `<span>CELKEM</span><span>${totalFormatted}</span>`,
    `<span>Celkem k úhradě</span><span>${totalFormatted}</span>`,
  ];
  for (const p of patterns) {
    if (html.includes(p)) {
      return html.replace(p, inject + p);
    }
  }
  return html;
}

export const INVOICE_TEMPLATES = [
  { id: "solaris",  label: "Solaris",  desc: "Čistý klasický styl, tenká linka" },
  { id: "aurora",   label: "Aurora",   desc: "Geometrická barevná hlavička" },
  { id: "fenix",    label: "Fénix",    desc: "Platební informace vlevo, klient vpravo" },
  { id: "orion",    label: "Orion",    desc: "Barevný nadpisový pruh" },
  { id: "lyra",     label: "Lyra",     desc: "Tučný nadpis, svislé popisky, ikony" },
  { id: "vega",     label: "Vega",     desc: "Široký platební pruh nahoře" },
  { id: "modern",   label: "Modern",   desc: "Indigo akcent, zaoblené rohy" },
  { id: "classic",  label: "Classic",  desc: "Tmavá hlavička, formální styl" },
  { id: "minimal",  label: "Minimal",  desc: "Velmi čistý, minimalistický" },
] as const;
