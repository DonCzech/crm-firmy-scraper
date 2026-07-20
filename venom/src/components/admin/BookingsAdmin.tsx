"use client";

import { useState } from "react";
import type { RezoraBookingRow } from "@/lib/rezora/client";

/**
 * Přehled rezervací v administraci webu. Autoritativní data zůstávají v Rezoře —
 * tahle stránka je jen zobrazuje a posílá změny stavu přes server tenanta.
 */

const SCOPES = [
  { key: "upcoming", label: "Nadcházející" },
  { key: "past", label: "Proběhlé" },
  { key: "all", label: "Vše" },
] as const;
type Scope = (typeof SCOPES)[number]["key"];

const STATUS_LABEL: Record<string, string> = {
  pending: "Čeká",
  confirmed: "Potvrzeno",
  cancelled: "Zrušeno",
  completed: "Dokončeno",
};
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-blue-100 text-blue-700",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}
/** Z `10:00:00` udělá `10:00`; konec dopočítá z délky. */
function fmtRange(start: string, minutes: number) {
  const [h, m] = start.split(":").map(Number);
  const from = new Date(2000, 0, 1, h, m);
  const to = new Date(from.getTime() + minutes * 60000);
  const p = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${p(from)}–${p(to)}`;
}
function fmtPrice(price: string, currency: string) {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString("cs-CZ")} ${currency}`;
}

export function BookingsAdmin({
  tenantSlug,
  initial,
}: {
  tenantSlug: string;
  initial: RezoraBookingRow[];
}) {
  const [scope, setScope] = useState<Scope>("upcoming");
  const [rows, setRows] = useState<RezoraBookingRow[]>(initial);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load(next: Scope) {
    setScope(next);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/rezora-bookings?scope=${next}`);
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Načtení se nezdařilo");
        return;
      }
      setRows(d.bookings ?? []);
    } catch {
      setError("Chyba sítě");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: RezoraBookingRow["status"]) {
    if (status === "cancelled" && !confirm("Opravdu zrušit tuto rezervaci? Klient by měl být informován.")) return;
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/rezora-bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setError(d.error ?? "Změna se nezdařila");
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      setError("Chyba sítě");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            onClick={() => load(s.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              scope === s.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 py-10 text-center">Načítám…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            {scope === "upcoming" ? "Žádné nadcházející rezervace." : "Žádné rezervace."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((b) => {
            const price = fmtPrice(b.price, b.currency);
            const busy = busyId === b.id;
            return (
              <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900">{b.service_name ?? "Služba"}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {fmtDate(b.booking_date)} · {fmtRange(b.start_time, b.duration_minutes)}
                      {b.staff_name ? ` · ${b.staff_name}` : ""}
                      {price ? ` · ${price}` : ""}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {b.client_name}
                      {b.client_email ? ` · ${b.client_email}` : ""}
                      {b.client_phone ? ` · ${b.client_phone}` : ""}
                    </p>
                    {b.client_notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">„{b.client_notes}"</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {b.status !== "confirmed" && b.status !== "cancelled" && (
                      <button
                        onClick={() => setStatus(b.id, "confirmed")}
                        disabled={busy}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Potvrdit
                      </button>
                    )}
                    {b.status !== "completed" && b.status !== "cancelled" && (
                      <button
                        onClick={() => setStatus(b.id, "completed")}
                        disabled={busy}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 disabled:opacity-50"
                      >
                        Dokončeno
                      </button>
                    )}
                    {b.status !== "cancelled" && (
                      <button
                        onClick={() => setStatus(b.id, "cancelled")}
                        disabled={busy}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Zrušit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
