import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { richTextToPlain } from "./html";

/**
 * Webero Commerce — produktové XML feedy pro srovnávače.
 * Google Merchant (RSS 2.0 + g: namespace) a Heureka (SHOP/SHOPITEM).
 * Položka = varianta; varianty téhož produktu sdílí item_group_id.
 */

interface FeedRow {
  product_id: number;
  slug: string;
  title: string;
  description: string | null;
  brand: string | null;
  category_name: string | null;
  variant_id: number;
  variant_title: string | null;
  sku: string | null;
  ean: string | null;
  price_cents: number;
  stock_qty: number;
  stock_policy: string;
  track_stock: boolean;
  variant_count: number;
  image_url: string | null;
}

async function getFeedRows(tenantId: number): Promise<FeedRow[]> {
  await initCommerceDb();
  return query<FeedRow>(
    `SELECT p.id AS product_id, p.slug, p.title, p.description, p.brand,
            c.name AS category_name,
            pv.id AS variant_id, pv.title AS variant_title, pv.sku, pv.ean,
            pv.price_cents, pv.stock_qty, pv.stock_policy, pv.track_stock,
            (SELECT COUNT(*)::int FROM product_variants x WHERE x.product_id = p.id) AS variant_count,
            (SELECT pi.url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.position, pi.id LIMIT 1) AS image_url
     FROM products p
     JOIN product_variants pv ON pv.product_id = p.id
     LEFT JOIN product_categories c ON c.id = p.primary_category_id
     WHERE p.tenant_id = $1 AND p.status = 'active'
     ORDER BY p.id, pv.position, pv.id`,
    [tenantId]
  );
}

function xml(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function price(cents: number): string {
  return (cents / 100).toFixed(2);
}

function inStock(r: FeedRow): boolean {
  return !r.track_stock || r.stock_policy === "continue" || r.stock_qty > 0;
}

function itemTitle(r: FeedRow): string {
  return r.variant_title ? `${r.title} — ${r.variant_title}` : r.title;
}

function productUrl(origin: string, tenantSlug: string, r: FeedRow): string {
  return `${origin}/demo/${tenantSlug}/obchod/${r.slug}`;
}

/** Google Merchant Center feed (RSS 2.0, g: namespace). */
export async function renderGoogleFeed(tenantId: number, tenantSlug: string, origin: string, shopName: string, currency: string): Promise<string> {
  const rows = await getFeedRows(tenantId);
  const items = rows.map((r) => `
    <item>
      <g:id>${r.variant_id}</g:id>
      ${r.variant_count > 1 ? `<g:item_group_id>${r.product_id}</g:item_group_id>` : ""}
      <g:title>${xml(itemTitle(r))}</g:title>
      <g:description>${xml(r.description ? richTextToPlain(r.description) : r.title)}</g:description>
      <g:link>${xml(productUrl(origin, tenantSlug, r))}</g:link>
      ${r.image_url ? `<g:image_link>${xml(r.image_url.startsWith("http") ? r.image_url : origin + r.image_url)}</g:image_link>` : ""}
      <g:availability>${inStock(r) ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${price(r.price_cents)} ${currency}</g:price>
      <g:condition>new</g:condition>
      ${r.brand ? `<g:brand>${xml(r.brand)}</g:brand>` : ""}
      ${r.ean ? `<g:gtin>${xml(r.ean)}</g:gtin>` : ""}
      ${r.sku ? `<g:mpn>${xml(r.sku)}</g:mpn>` : ""}
      <g:identifier_exists>${r.ean || r.sku ? "yes" : "no"}</g:identifier_exists>
      ${r.category_name ? `<g:product_type>${xml(r.category_name)}</g:product_type>` : ""}
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xml(shopName)}</title>
    <link>${xml(`${origin}/demo/${tenantSlug}/obchod`)}</link>
    <description>${xml(`Produktový feed — ${shopName}`)}</description>
${items}
  </channel>
</rss>`;
}

/** Heureka.cz feed (SHOP/SHOPITEM). */
export async function renderHeurekaFeed(tenantId: number, tenantSlug: string, origin: string): Promise<string> {
  const rows = await getFeedRows(tenantId);
  const items = rows.map((r) => `
  <SHOPITEM>
    <ITEM_ID>${r.variant_id}</ITEM_ID>
    ${r.variant_count > 1 ? `<ITEMGROUP_ID>${r.product_id}</ITEMGROUP_ID>` : ""}
    <PRODUCTNAME>${xml(itemTitle(r))}</PRODUCTNAME>
    <DESCRIPTION>${xml(r.description ? richTextToPlain(r.description) : r.title)}</DESCRIPTION>
    <URL>${xml(productUrl(origin, tenantSlug, r))}</URL>
    ${r.image_url ? `<IMGURL>${xml(r.image_url.startsWith("http") ? r.image_url : origin + r.image_url)}</IMGURL>` : ""}
    <PRICE_VAT>${price(r.price_cents)}</PRICE_VAT>
    ${r.brand ? `<MANUFACTURER>${xml(r.brand)}</MANUFACTURER>` : ""}
    ${r.category_name ? `<CATEGORYTEXT>${xml(r.category_name)}</CATEGORYTEXT>` : ""}
    ${r.ean ? `<EAN>${xml(r.ean)}</EAN>` : ""}
    ${r.sku ? `<PRODUCTNO>${xml(r.sku)}</PRODUCTNO>` : ""}
    <DELIVERY_DATE>${inStock(r) ? "0" : "7"}</DELIVERY_DATE>
  </SHOPITEM>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<SHOP>
${items}
</SHOP>`;
}
