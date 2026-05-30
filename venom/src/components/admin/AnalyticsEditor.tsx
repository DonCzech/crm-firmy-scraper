"use client";

import { useState } from "react";

interface Props {
  tenantSlug: string;
  initialConfig: Record<string, string>;
  initialSearchConsole: string;
}

export function AnalyticsEditor({ tenantSlug, initialConfig, initialSearchConsole }: Props) {
  const [gtmId, setGtmId] = useState(initialConfig.gtm_id ?? "");
  const [ga4Id, setGa4Id] = useState(initialConfig.ga4_id ?? "");
  const [fbPixelId, setFbPixelId] = useState(initialConfig.fb_pixel_id ?? "");
  const [scVerification, setScVerification] = useState(initialSearchConsole);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/analytics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gtm_id: gtmId.trim() || null,
          ga4_id: ga4Id.trim() || null,
          fb_pixel_id: fbPixelId.trim() || null,
          search_console_verification: scVerification.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErrorMsg(d.error ?? "Chyba při ukládání");
        setStatus("error");
        return;
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setErrorMsg("Chyba sítě");
      setStatus("error");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-8">
      {/* GTM */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Google Tag Manager</h2>
        <p className="text-xs text-gray-500 mb-3">
          Doporučujeme GTM — přes něj pak snadno přidáte GA4, Meta Pixel i další. Formát: <code className="bg-gray-100 px-1 rounded">GTM-XXXXXX</code>
        </p>
        <input
          type="text"
          placeholder="GTM-XXXXXX"
          value={gtmId}
          onChange={(e) => setGtmId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </section>

      {/* GA4 */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Google Analytics 4</h2>
        <p className="text-xs text-gray-500 mb-3">
          Přímá integrace GA4 bez GTM. Formát: <code className="bg-gray-100 px-1 rounded">G-XXXXXXXXXX</code>
        </p>
        <input
          type="text"
          placeholder="G-XXXXXXXXXX"
          value={ga4Id}
          onChange={(e) => setGa4Id(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {gtmId && ga4Id && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠ Pokud používáte GTM, přidejte GA4 přes GTM a toto pole nechte prázdné — jinak se GA4 načte dvakrát.
          </p>
        )}
      </section>

      {/* Meta Pixel */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Meta Pixel (Facebook)</h2>
        <p className="text-xs text-gray-500 mb-3">
          ID vašeho Meta Pixel pro měření konverzí z Facebook/Instagram reklam. Formát: číselné ID, např. <code className="bg-gray-100 px-1 rounded">1234567890</code>
        </p>
        <input
          type="text"
          placeholder="1234567890"
          value={fbPixelId}
          onChange={(e) => setFbPixelId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </section>

      {/* Search Console */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-1">Google Search Console — ověření</h2>
        <p className="text-xs text-gray-500 mb-3">
          Obsah meta tagu pro ověření vlastnictví webu v Google Search Console. Vložte pouze hodnotu atributu <code className="bg-gray-100 px-1 rounded">content</code>.
        </p>
        <input
          type="text"
          placeholder="abc123xyz..."
          value={scVerification}
          onChange={(e) => setScVerification(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {scVerification && (
          <p className="text-xs text-gray-400 mt-1">
            Vygeneruje: <code className="bg-gray-100 px-1">{`<meta name="google-site-verification" content="${scVerification}" />`}</code>
          </p>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {status === "saving" ? "Ukládám…" : "Uložit nastavení"}
        </button>
        {status === "saved" && (
          <span className="text-sm text-green-600 font-medium">Uloženo ✓</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600">{errorMsg}</span>
        )}
      </div>
    </div>
  );
}
