import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getActiveAddonSlugs } from "@/lib/commerce/addons";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";

/** Modul „Mapa prodejen“ — kamenné pobočky s mapou. */
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ tenantSlug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Naše prodejny", robots: { index: false } };
}

const STORES = [
  {
    name: "Prodejna Praha — Anděl",
    street: "Nádražní 32",
    city: "150 00 Praha 5",
    phone: "+420 777 123 456",
    hours: ["Po–Pá: 9:00–19:00", "So: 9:00–13:00", "Ne: zavřeno"],
    // Anděl, Praha 5
    bbox: "14.3985%2C50.0685%2C14.4105%2C50.0745",
    marker: "50.0715%2C14.4045",
  },
  {
    name: "Prodejna Brno — centrum",
    street: "Masarykova 8",
    city: "602 00 Brno",
    phone: "+420 777 654 321",
    hours: ["Po–Pá: 9:00–18:00", "So: 9:00–12:00", "Ne: zavřeno"],
    // Masarykova, Brno
    bbox: "16.6055%2C49.1895%2C16.6175%2C49.1955",
    marker: "49.1925%2C16.6115",
  },
];

export default async function StoresPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop) return notFound();

  const addons = await getActiveAddonSlugs(tenant.id);
  if (!addons.has("mapa-prodejen")) return notFound();

  return (
    <div className="bg-white">
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-white text-[#111]">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          <h1 className="text-[30px] font-extrabold tracking-tight text-neutral-950">Naše prodejny</h1>
          <p className="mt-2 max-w-[640px] text-[15px] text-neutral-500">
            Zboží si můžete zdarma vyzvednout i osobně. Na prodejnách vám poradíme s výběrem a vyřídíme reklamace.
          </p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {STORES.map((s) => (
              <div key={s.name} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <iframe
                  title={`Mapa — ${s.name}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${s.bbox}&layer=mapnik&marker=${s.marker}`}
                  className="h-[260px] w-full border-0"
                  loading="lazy"
                />
                <div className="p-6">
                  <h2 className="text-[19px] font-extrabold text-neutral-950">{s.name}</h2>
                  <p className="mt-1 text-[15px] text-neutral-600">
                    {s.street}, {s.city}
                  </p>
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-1 inline-block text-[15px] font-semibold text-neutral-900 underline underline-offset-2">
                    {s.phone}
                  </a>
                  <div className="mt-4 rounded-xl bg-neutral-50 p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-400">Otevírací doba</p>
                    <ul className="mt-1.5 space-y-0.5 text-[14px] text-neutral-700">
                      {s.hours.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}
