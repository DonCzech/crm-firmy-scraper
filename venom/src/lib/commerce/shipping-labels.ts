import { query, queryOne } from "@/lib/db";

/**
 * Modul „Tisk štítků“ — přepravní štítky s reálným Code39 barcode (SVG)
 * a trvalým tracking číslem uloženým v orders.meta.tracking_number.
 */

export interface LabelOrder {
  id: number;
  order_number: string;
  email: string;
  phone: string | null;
  shipping_method: string | null;
  payment_method: string | null;
  total_cents: number;
  currency: string;
  shipping_address: Record<string, string>;
  billing_address: Record<string, string>;
  meta: Record<string, unknown>;
}

// ── Code39 ────────────────────────────────────────────────────────────────────
// 9 prvků na znak (5 čar + 4 mezery, střídavě), n = úzký, w = široký.
const CODE39: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn",
  A: "wnnnnwnnw", B: "nnwnnwnnw", C: "wnwnnwnnn", D: "nnnnwwnnw",
  E: "wnnnwwnnn", F: "nnwnwwnnn", G: "nnnnnwwnw", H: "wnnnnwwnn",
  I: "nnwnnwwnn", J: "nnnnwwwnn", K: "wnnnnnnww", L: "nnwnnnnww",
  M: "wnwnnnnwn", N: "nnnnwnnww", O: "wnnnwnnwn", P: "nnwnwnnwn",
  Q: "nnnnnnwww", R: "wnnnnnwwn", S: "nnwnnnwwn", T: "nnnnwnwwn",
  U: "wwnnnnnnw", V: "nwwnnnnnw", W: "wwwnnnnnn", X: "nwnnwnnnw",
  Y: "wwnnwnnnn", Z: "nwwnwnnnn",
  "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
};

/** Vygeneruje skenovatelný Code39 barcode jako inline SVG. */
export function code39Svg(text: string, height = 64): string {
  const value = `*${text.toUpperCase().replace(/[^0-9A-Z\-. ]/g, "")}*`;
  const narrow = 2;
  const wide = 5;
  let x = 0;
  const rects: string[] = [];
  for (const ch of value) {
    const pattern = CODE39[ch];
    if (!pattern) continue;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === "w" ? wide : narrow;
      if (i % 2 === 0) rects.push(`<rect x="${x}" y="0" width="${w}" height="${height}" fill="#000"/>`);
      x += w;
    }
    x += narrow; // mezera mezi znaky
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${height}" viewBox="0 0 ${x} ${height}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}

// ── Tracking číslo ────────────────────────────────────────────────────────────

function mod10(digits: string): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits.charCodeAt(digits.length - 1 - i) - 48;
    const n = d >= 0 && d <= 9 ? d : 0;
    sum += i % 2 === 0 ? (n * 2 > 9 ? n * 2 - 9 : n * 2) : n;
  }
  return (10 - (sum % 10)) % 10;
}

/** Vrátí tracking číslo objednávky; při prvním tisku ho vygeneruje a uloží do meta. */
export async function ensureTrackingNumber(tenantId: number, order: LabelOrder): Promise<string> {
  const existing = order.meta?.tracking_number;
  if (typeof existing === "string" && existing) return existing;

  const digits = `${new Date().getFullYear()}${String(order.id).padStart(7, "0")}`;
  const tracking = `WB${digits}${mod10(digits)}`;
  await query(
    `UPDATE orders SET meta = meta || jsonb_build_object('tracking_number', $3::text), updated_at = now()
     WHERE tenant_id = $1 AND id = $2`,
    [tenantId, order.id, tracking]
  );
  return tracking;
}

export async function getLabelOrder(tenantId: number, orderId: number): Promise<LabelOrder | null> {
  return queryOne<LabelOrder>(
    `SELECT id, order_number, email, phone, shipping_method, payment_method,
            total_cents, currency, shipping_address, billing_address, meta
     FROM orders WHERE tenant_id = $1 AND id = $2`,
    [tenantId, orderId]
  );
}

// ── HTML štítku ───────────────────────────────────────────────────────────────

const SHIPPING_LABELS: Record<string, string> = {
  zasilkovna: "Zásilkovna",
  ppl: "PPL",
  balikovna: "Balíkovna",
  posta: "Česká pošta",
  courier: "Kurýr",
  pickup: "Osobní odběr",
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function addrLines(a: Record<string, string>): string[] {
  return [
    [a.first_name, a.last_name].filter(Boolean).join(" ") || a.name || "",
    a.company || "",
    [a.street, a.street_number].filter(Boolean).join(" ") || a.address1 || "",
    [a.zip ?? a.postal_code, a.city].filter(Boolean).join("  "),
    a.country || "Česká republika",
  ].filter(Boolean);
}

/** A6 přepravní štítek (105×148 mm) s barcode, adresou a dobírkou. */
export function renderLabelHtml(opts: {
  shopName: string;
  order: LabelOrder;
  tracking: string;
  autoPrint?: boolean;
}): string {
  const { shopName, order, tracking, autoPrint } = opts;
  const barcode = code39Svg(tracking, 70);
  const to = addrLines(order.shipping_address ?? {});
  const toFinal = to.length > 1 ? to : addrLines(order.billing_address ?? {});
  const carrier = SHIPPING_LABELS[order.shipping_method ?? ""] ?? (order.shipping_method || "Přeprava");
  const cod = order.payment_method === "cod";
  const codAmount = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: order.currency || "CZK", maximumFractionDigits: 0 }).format(order.total_cents / 100);

  return `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><title>Štítek ${esc(order.order_number)}</title>
<style>
  @page { size: 105mm 148mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; background: #e5e5e5; }
  .label { width: 105mm; height: 148mm; background: #fff; margin: 8mm auto; padding: 7mm; display: flex; flex-direction: column; }
  @media print { body { background: #fff; } .label { margin: 0; } .no-print { display: none; } }
  .carrier { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #000; padding-bottom: 3mm; }
  .carrier b { font-size: 19px; letter-spacing: .02em; text-transform: uppercase; }
  .carrier span { font-size: 10.5px; color: #444; }
  .from { margin-top: 3.5mm; font-size: 9.5px; color: #555; line-height: 1.45; }
  .from b { color: #000; font-size: 10.5px; }
  .to { margin-top: 5mm; border: 1.8px solid #000; border-radius: 2mm; padding: 4mm; flex: 0 0 auto; }
  .to .t { font-size: 8.5px; text-transform: uppercase; letter-spacing: .1em; color: #666; }
  .to .lines { margin-top: 1.5mm; font-size: 14.5px; font-weight: 700; line-height: 1.42; }
  .meta { margin-top: 4mm; display: flex; gap: 4mm; font-size: 10.5px; }
  .meta div { flex: 1; border: 1px solid #bbb; border-radius: 1.5mm; padding: 2.5mm; }
  .meta .k { font-size: 8px; text-transform: uppercase; letter-spacing: .08em; color: #777; }
  .meta .v { margin-top: 1mm; font-weight: 800; font-size: 12.5px; }
  .cod .v { color: #b91c1c; }
  .bc { margin-top: auto; text-align: center; padding-top: 4mm; }
  .bc svg { max-width: 100%; height: 17mm; }
  .bc .num { margin-top: 1.5mm; font-size: 13px; font-weight: 800; letter-spacing: .28em; }
  .toolbar { text-align: center; padding: 12px; }
  .toolbar button { font: inherit; font-weight: 700; padding: 10px 26px; border-radius: 999px; border: 0; background: #111; color: #fff; cursor: pointer; }
</style></head><body>
<div class="toolbar no-print"><button onclick="window.print()">🖨 Vytisknout štítek</button></div>
<div class="label">
  <div class="carrier"><b>${esc(carrier)}</b><span>Obj. ${esc(order.order_number)}</span></div>
  <div class="from"><b>Odesílatel: ${esc(shopName)}</b><br>e-shop Webero Commerce · ${esc(order.email)}</div>
  <div class="to">
    <div class="t">Příjemce</div>
    <div class="lines">${toFinal.map((l) => esc(l)).join("<br>")}</div>
    ${order.phone ? `<div style="margin-top:2mm;font-size:11px;color:#333">☎ ${esc(order.phone)}</div>` : ""}
  </div>
  <div class="meta">
    <div><div class="k">Služba</div><div class="v">${esc(carrier)}</div></div>
    <div class="${cod ? "cod" : ""}"><div class="k">${cod ? "Dobírka" : "Platba"}</div><div class="v">${cod ? esc(codAmount) : "Uhrazeno"}</div></div>
    <div><div class="k">Hmotnost</div><div class="v">— kg</div></div>
  </div>
  <div class="bc">${barcode}<div class="num">${esc(tracking)}</div></div>
</div>
${autoPrint ? "<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300));</script>" : ""}
</body></html>`;
}
