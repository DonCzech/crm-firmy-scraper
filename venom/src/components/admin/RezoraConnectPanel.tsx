"use client";

import { useEffect, useState } from "react";

/**
 * Propojení webu s rezervačním účtem přes párovací klíč.
 *
 * Majitel si v Rezoře (app.rezora.cz → Nastavení → Propojení webu) zkopíruje
 * klíč `rz_…` a vloží ho sem. Server ho ověří proti Rezoře a uloží do widgetu
 * jen veřejný slug — klíč se nikdy nedostane do stránky. Nahrazuje dřívější
 * ruční opisování slugu, u kterého šlo připojit i cizí kalendář.
 */

interface Status {
  connected: boolean;
  slug: string | null;
  widgetCount: number;
}

export function RezoraConnectPanel({ tenantSlug }: { tenantSlug: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const base = `/api/demo/${tenantSlug}/rezora-connect`;

  async function load() {
    try {
      const res = await fetch(base);
      if (res.ok) setStatus(await res.json());
    } catch {
      /* stav zůstane null → zobrazí se výchozí připojovací formulář */
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  async function connect() {
    setBusy(true);
    setError("");
    setOkMsg("");
    try {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setError(d.error ?? "Propojení se nezdařilo");
        return;
      }
      setKey("");
      setOkMsg(`Propojeno s účtem ${d.name ?? d.slug} (${d.updated} widgetů).`);
      setStatus({ connected: true, slug: d.slug, widgetCount: d.updated });
    } catch {
      setError("Chyba sítě");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!confirm("Odpojit rezervační účet od webu? Widget přestane zobrazovat termíny.")) return;
    setBusy(true);
    setError("");
    setOkMsg("");
    try {
      const res = await fetch(base, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setError(d.error ?? "Odpojení se nezdařilo");
        return;
      }
      setStatus({ connected: false, slug: null, widgetCount: d.updated });
      setOkMsg("Web byl odpojen.");
    } catch {
      setError("Chyba sítě");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-indigo-900">Propojit rezervace</span>
        {status?.connected && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            Propojeno
          </span>
        )}
      </div>

      {status?.connected ? (
        <div className="text-sm text-indigo-900/80">
          <p>
            Účet <code className="bg-white px-1 rounded">{status.slug}</code> je propojen
            {status.widgetCount ? ` (${status.widgetCount} widgetů na webu)` : ""}.
          </p>
          <button
            type="button"
            onClick={disconnect}
            disabled={busy}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline disabled:opacity-50"
          >
            Odpojit
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-indigo-900/70 mb-2">
            Vložte párovací klíč z Rezory (Nastavení → Propojení webu). Klíč se nikdy
            nezobrazí návštěvníkům webu.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="rz_…"
              spellCheck={false}
              className="flex-1 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={connect}
              disabled={busy || key.trim().length < 8}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
            >
              {busy ? "Ověřuji…" : "Propojit"}
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {okMsg && <p className="mt-2 text-xs text-green-700">{okMsg}</p>}
    </div>
  );
}
