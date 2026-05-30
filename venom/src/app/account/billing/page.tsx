"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BillingInfo {
  tenant_id: number;
  slug: string;
  sub_id: number | null;
  status: string | null;
  plan: string | null;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  paid_at: string | null;
  next_billing_at: string | null;
  price_czk: number | null;
  billing_cycle: string | null;
  days_remaining: number | null;
}

function formatDate(d: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("cs-CZ");
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get("tenant");

  const [billings, setBillings] = useState<BillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = tenantSlug ? `/api/account/billing?tenantSlug=${tenantSlug}` : "/api/account/billing";
    fetch(url)
      .then((r) => {
        if (r.status === 401) { router.push("/account/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setBillings(Array.isArray(data) ? data : [data]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, tenantSlug]);

  async function handleActivate(slug: string) {
    setActivating(slug);
    setMessage("");
    const res = await fetch("/api/account/billing/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: slug }),
    });
    const data = await res.json();
    setActivating(null);
    if (res.ok) {
      setMessage(data.message);
      setBillings((prev) =>
        prev.map((b) => b.slug === slug ? { ...b, status: "active", plan: "paid" } : b)
      );
    }
  }

  async function handleCancel(slug: string) {
    if (!confirm("Opravdu chcete zrušit předplatné?")) return;
    setCancelling(slug);
    const res = await fetch("/api/account/billing/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantSlug: slug }),
    });
    const data = await res.json();
    setCancelling(null);
    if (res.ok) {
      setMessage(data.message);
      setBillings((prev) =>
        prev.map((b) => b.slug === slug ? { ...b, status: "cancelled" } : b)
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/account/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-gray-900">Billing</span>
            </a>
          </div>
          <a href="/account/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Zpět na projekty
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Správa předplatného</h1>
        <p className="text-gray-500 mb-8">Plán: 500 Kč / měsíc za každý web</p>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
            {message}
          </div>
        )}

        {billings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            Žádné projekty k zobrazení.
          </div>
        ) : (
          <div className="grid gap-4">
            {billings.map((b) => (
              <div key={b.tenant_id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.slug}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {b.status === "active" ? "Aktivní předplatné" : b.status === "trial" ? "Zkušební doba" : b.status === "cancelled" ? "Zrušeno" : "Trial"}
                    </p>
                  </div>
                  <div className="text-right">
                    {b.status === "active" ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">Aktivní</span>
                    ) : b.status === "cancelled" ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Zrušeno</span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        {b.days_remaining !== null && b.days_remaining > 0 ? `${b.days_remaining} dní` : "Vypršelo"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trial začal</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.trial_starts_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trial končí</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.trial_ends_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Zaplaceno</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.paid_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Příští platba</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.next_billing_at)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">500 Kč</span> / měsíc
                  </p>
                  <div className="flex gap-3">
                    {b.status !== "active" && b.status !== "cancelled" && (
                      <button
                        onClick={() => handleActivate(b.slug)}
                        disabled={activating === b.slug}
                        className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
                      >
                        {activating === b.slug ? "Aktivuji…" : "Aktivovat předplatné (500 Kč/měs.)"}
                      </button>
                    )}
                    {b.status === "active" && (
                      <button
                        onClick={() => handleCancel(b.slug)}
                        disabled={cancelling === b.slug}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {cancelling === b.slug ? "Rušení…" : "Zrušit předplatné"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pricing info */}
        <div className="mt-8 bg-violet-50 border border-violet-200 rounded-2xl p-6">
          <h3 className="font-semibold text-violet-900 mb-3">Co je zahrnuto v plánu</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              "Vlastní doména",
              "Live editor webu",
              "Blog modul",
              "SEO nástroje",
              "Kontaktní formulář",
              "Analytics",
              "Neomezené stránky",
              "Technická podpora",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-sm text-violet-800">
                <svg className="w-4 h-4 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AccountBillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <BillingContent />
    </Suspense>
  );
}
