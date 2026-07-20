import { NextRequest } from "next/server";
import { getTenantBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Demo produktový feed (Shoptet-like XML) pro modul „Automatický import".
 * Obsahuje nové produkty, které v katalogu nejsou — import je založí jako drafty.
 */
const DEMO_ITEMS = [
  { code: "FEED-PWB-20K", name: "Powerbanka TITAN 20 000 mAh", price: "899", brand: "Voltix",
    desc: "Kompaktní powerbanka s rychlonabíjením 65 W, dvěma USB-C porty a LED displejem zbývající kapacity.",
    img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=75", ean: "8594001001234", stock: "24" },
  { code: "FEED-KBD-TKL", name: "Mechanická klávesnice Nordic TKL", price: "2490", brand: "Keychron",
    desc: "Bezdrátová mechanická klávesnice s hot-swap spínači, PBT klávesami a bílým podsvícením. CZ layout.",
    img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=75", ean: "8594001005678", stock: "12" },
  { code: "FEED-LAMP-DSK", name: "Stolní LED lampa ErgoLight", price: "1290", brand: "Lumina",
    desc: "Stmívatelná stolní lampa s nastavitelnou teplotou světla 2700–6500 K, USB nabíjením a dotykovým ovládáním.",
    img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=75", ean: "8594001009012", stock: "37" },
  { code: "FEED-CAM-4K", name: "Webkamera Stream 4K", price: "3190", brand: "Optiq",
    desc: "4K webkamera se sensorem Sony, autofokusem a duálními mikrofony s potlačením šumu. Ideální pro streaming a videohovory.",
    img: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=75", ean: "8594001003456", stock: "8" },
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return new Response("Not found", { status: 404 });

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<SHOP>
${DEMO_ITEMS.map((i) => `  <SHOPITEM>
    <CODE>${i.code}</CODE>
    <NAME>${i.name}</NAME>
    <DESCRIPTION><![CDATA[${i.desc}]]></DESCRIPTION>
    <MANUFACTURER>${i.brand}</MANUFACTURER>
    <PRICE_VAT>${i.price}</PRICE_VAT>
    <IMGURL>${i.img}</IMGURL>
    <EAN>${i.ean}</EAN>
    <STOCK>${i.stock}</STOCK>
  </SHOPITEM>`).join("\n")}
</SHOP>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
