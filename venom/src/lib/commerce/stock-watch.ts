import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { isAddonActive } from "./addons";
import { getShopByTenantId } from "./shop";

/**
 * Modul „Hlídací pes" — e-mail zákazníkovi, jakmile je hlídaná varianta zpět skladem.
 * Volá se po každém zápisu skladu (ruční úprava, sync feedu, import, editace produktu).
 * Fire-and-forget: selhání nesmí shodit skladovou operaci.
 */

interface WatcherRow {
  id: number;
  email: string;
  variant_id: number;
  product_title: string;
  variant_title: string | null;
  product_slug: string;
  stock_qty: number;
}

export async function notifyStockWatchers(tenantId: number, variantIds: number[]): Promise<number> {
  if (!variantIds.length) return 0;
  if (!(await isAddonActive(tenantId, "hlidaci-pes"))) return 0;

  const watchers = await query<WatcherRow>(
    `SELECT n.id, n.email, n.variant_id, p.title AS product_title, pv.title AS variant_title,
            p.slug AS product_slug, pv.stock_qty
     FROM commerce_stock_notifications n
     JOIN product_variants pv ON pv.id = n.variant_id
     JOIN products p ON p.id = pv.product_id
     WHERE n.tenant_id = $1 AND n.notified = false AND n.variant_id = ANY($2)
       AND pv.stock_qty > 0 AND p.status = 'active'`,
    [tenantId, variantIds]
  );
  if (!watchers.length) return 0;

  const [shop, tenant] = await Promise.all([
    getShopByTenantId(tenantId),
    query<{ slug: string }>("SELECT slug FROM tenants WHERE id = $1", [tenantId]).then((r) => r[0]),
  ]);
  const shopName = shop?.name || "Obchod";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3015";

  let sent = 0;
  for (const w of watchers) {
    const productUrl = `${baseUrl}/demo/${tenant?.slug}/obchod/${w.product_slug}`;
    const title = `${w.product_title}${w.variant_title ? ` — ${w.variant_title}` : ""}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="font-size:20px">🐶 Hlídací pes: zboží je zpět skladem!</h2>
        <p><strong>${title}</strong> je znovu dostupný v obchodě ${shopName}.</p>
        <p>Skladem: ${w.stock_qty} ks — s objednávkou neváhejte, zájem bývá velký.</p>
        <p style="margin:24px 0">
          <a href="${productUrl}" style="background:#111;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:bold">
            Zobrazit produkt
          </a>
        </p>
        <p style="font-size:12px;color:#888">Tento e-mail jste dostali, protože jste si u produktu nastavili hlídání dostupnosti.</p>
      </div>`;
    try {
      await sendEmail({ to: w.email, subject: `${w.product_title} je zpět skladem — ${shopName}`, html });
      await query("UPDATE commerce_stock_notifications SET notified = true WHERE id = $1", [w.id]);
      sent++;
    } catch (e) {
      console.error("[stock-watch] send failed:", e);
    }
  }
  return sent;
}
