import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug } from "@/lib/db";
import { getConnectionKey, listBookings } from "@/lib/rezora/client";
import { BookingsAdmin } from "@/components/admin/BookingsAdmin";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Správa rezervací přímo v administraci webu.
 *
 * Data patří Rezoře; sem se načtou serverově přes párovací klíč, takže majitel
 * nemusí na app.rezora.cz vůbec chodit. Klíč zůstává na serveru — do stránky
 * se posílají jen samotné rezervace.
 */
export default async function BookingsAdminPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const key = await getConnectionKey(tenant.id);
  if (!key) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
            ← Zpět na admin
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Rezervace</h1>
          <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/60 p-5">
            <p className="text-sm text-indigo-900">
              Web zatím není propojený s rezervačním účtem. Propojení nastavíte v sekci{" "}
              <a href={`/demo/${tenantSlug}/admin/modules`} className="underline font-medium">
                Moduly → Rezervace
              </a>
              , kde vložíte párovací klíč z Rezory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const res = await listBookings(key, "upcoming");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <a href={`/demo/${tenantSlug}/admin`} className="text-sm text-gray-500 hover:underline">
          ← Zpět na admin
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">Rezervace</h1>
        <p className="text-sm text-gray-500 mb-8">
          {res.data?.account
            ? `Propojeno s účtem ${res.data.account.name}. Změny se ukládají přímo do rezervačního systému.`
            : "Změny se ukládají přímo do rezervačního systému."}
        </p>

        {res.ok ? (
          <BookingsAdmin tenantSlug={tenantSlug} initial={res.data?.bookings ?? []} />
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {res.error ?? "Rezervace se nepodařilo načíst."}
          </div>
        )}
      </div>
    </div>
  );
}
