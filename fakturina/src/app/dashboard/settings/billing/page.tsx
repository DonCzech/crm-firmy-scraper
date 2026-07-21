import { redirect } from "next/navigation";
import { getSession, getSubscription } from "@/lib/auth";
import { PLANS } from "@/lib/stripe";
import BillingActions from "@/components/BillingActions";
import { CheckCircle, Zap } from "lucide-react";

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["5 faktur měsíčně", "PDF faktury", "QR platba", "ARES", "Watermark Fakturina.cz"],
  start: ["Neomezené faktury", "Vlastní logo", "Bez watermarku", "Základní upomínky", "Export PDF/CSV"],
  pro: ["Opakované faktury", "Automatické upomínky", "Účetní přístup", "Více číselných řad", "Zálohové faktury"],
  business: ["Více firem", "API přístup", "Webhooky", "Role uživatelů", "Audit log", "Vlastní SMTP"],
};

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string; cancelled?: string }> }) {
  const { success, cancelled } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/login");
  const subscription = await getSubscription(user.id);
  const currentPlan = subscription?.plan ?? "free";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Předplatné</h1>
        <p className="text-slate-500 text-sm mt-0.5">Spravujte svůj tarif a fakturaci</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          Platba proběhla úspěšně! Váš tarif byl aktivován.
        </div>
      )}
      {cancelled && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-xl">
          Platba byla zrušena.
        </div>
      )}

      {/* Current plan */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Aktuální tarif</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-indigo-700 capitalize">{currentPlan === "free" ? "Zdarma" : currentPlan}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${subscription?.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {subscription?.status === "active" ? "Aktivní" : subscription?.status ?? "—"}
              </span>
            </div>
          </div>
          {subscription?.stripe_subscription_id && <BillingActions mode="portal" />}
        </div>
        {subscription?.current_period_end && (
          <p className="text-sm text-slate-500">
            Obnovení: {new Date(subscription.current_period_end * 1000).toLocaleDateString("cs-CZ")}
          </p>
        )}
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const isCurrent = key === currentPlan;
          const features = PLAN_FEATURES[key] ?? [];
          return (
            <div key={key} className={`card p-5 flex flex-col ${isCurrent ? "ring-2 ring-indigo-500" : ""}`}>
              {isCurrent && (
                <div className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full self-start mb-3">
                  Váš tarif
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-900 capitalize">{plan.name}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mb-4">
                {plan.price === 0 ? "Zdarma" : `${plan.price} Kč`}
                {plan.price > 0 && <span className="text-sm font-normal text-slate-400">/měs.</span>}
              </div>
              <ul className="space-y-1.5 flex-1 mb-5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && key !== "free" && (
                <BillingActions mode="upgrade" plan={key as "start" | "pro" | "business"} />
              )}
              {isCurrent && key === "free" && (
                <span className="text-xs text-center text-slate-400">Aktuální tarif</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
