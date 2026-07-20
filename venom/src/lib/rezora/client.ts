import "server-only";
import { queryOne } from "@/lib/db";

/**
 * Serverový klient k rezervačnímu účtu tenanta.
 *
 * Párovací klíč se čte z databáze a odchází výhradně v hlavičce serverového
 * požadavku — do prohlížeče se nikdy nedostane. Díky tomu spravuje majitel
 * rezervace přímo v administraci svého webu a do Rezory se přihlašovat nemusí.
 */

/**
 * Rezervační server. Výchozí je produkce — dřív se ve vývoji mlčky padalo na
 * `localhost:3199`, kde ale nic neběží, takže administrace hlásila „server je
 * nedostupný", i když bylo všechno v pořádku. Lokální instanci si vývojář
 * nastaví přes NEXT_PUBLIC_REZERVACE_ORIGIN.
 */
export const REZORA_API = (
  process.env.NEXT_PUBLIC_REZERVACE_ORIGIN || "https://app.rezora.cz"
).replace(/\/$/, "");

export interface RezoraBookingRow {
  id: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  client_name: string;
  client_email: string;
  client_phone: string;
  client_notes: string;
  payment_method: string;
  price: string;
  currency: string;
  created_at: string;
  staff_name: string | null;
  service_name: string | null;
}

/** Vrátí uložený párovací klíč tenanta, nebo null když web propojený není. */
export async function getConnectionKey(tenantId: number): Promise<string | null> {
  const row = await queryOne<{ rezora_connection_key: string | null }>(
    "SELECT rezora_connection_key FROM tenants WHERE id = $1",
    [tenantId]
  );
  return row?.rezora_connection_key ?? null;
}

interface FetchResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

async function callRezora<T>(
  key: string,
  path: string,
  init: RequestInit = {}
): Promise<FetchResult<T>> {
  try {
    const res = await fetch(`${REZORA_API}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      // Rezervace se mění každou chvíli — nikdy neservírovat z cache.
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    if (!res.ok) {
      return { ok: false, status: res.status, data: null, error: data?.error ?? "Chyba rezervačního serveru" };
    }
    return { ok: true, status: res.status, data };
  } catch {
    return { ok: false, status: 502, data: null, error: "Rezervační server je nedostupný" };
  }
}

export async function listBookings(
  key: string,
  scope: "upcoming" | "past" | "all" = "upcoming"
): Promise<FetchResult<{ bookings: RezoraBookingRow[]; account: { slug: string; name: string } }>> {
  return callRezora(key, `/api/connect/bookings?scope=${scope}&limit=100`);
}

export async function updateBookingStatus(
  key: string,
  id: string,
  status: RezoraBookingRow["status"]
): Promise<FetchResult<{ ok: boolean }>> {
  return callRezora(key, `/api/connect/bookings`, {
    method: "PATCH",
    body: JSON.stringify({ id, status }),
  });
}
