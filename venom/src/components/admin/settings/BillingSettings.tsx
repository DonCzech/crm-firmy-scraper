"use client";

import { SettingsLayout } from "./SettingsLayout";
import { SectionHeader, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

function planLabel(plan: string): string {
  switch (plan) {
    case "paid": return "Placený";
    case "trial": return "Zkušební";
    case "free": return "Zdarma";
    default: return plan;
  }
}

export function BillingSettings({ tenant }: Props) {
  return (
    <SettingsLayout
      tenantSlug={tenant.slug}
      activeItem="Fakturace a platby"
      title="Fakturace a platby"
      actionButton={
        <a
          href={`/demo/${tenant.slug}/admin/settings/billing/fakturacni-udaje`}
          className="rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#222226] hover:text-white transition-colors"
        >
          Fakturační údaje
        </a>
      }
    >
      <div className="max-w-3xl space-y-6">
        <Card>
          <div className="px-6 py-5">
            <SectionHeader title="Aktuální plán" />
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[18px] font-bold text-white">{planLabel(tenant.plan)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    tenant.plan === "paid" ? "bg-green-500/10 text-green-400" :
                    tenant.plan === "trial" ? "bg-yellow-500/10 text-yellow-400" :
                    "bg-[#2a2a2d] text-[#71717a]"
                  }`}>
                    {tenant.status === "active" ? "Aktivní" : tenant.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#71717a]">
                  Web vytvořen: {new Date(tenant.created_at).toLocaleDateString("cs-CZ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Funkce brzy k dispozici")}
                className="shrink-0 rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
              >
                PRODLOUŽIT
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-6 py-5">
            <SectionHeader title="Objednávky a faktury" />
            <div className="py-6 text-center">
              <p className="text-[13px] text-[#71717a] italic">Zatím žádné objednávky.</p>
            </div>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
}
