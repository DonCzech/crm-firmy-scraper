"use client";

import { useState } from "react";
import { SettingsLayout } from "./SettingsLayout";
import { Toggle, FormRow, Input, SectionHeader, SaveButton, StatusMessage, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

export function WebSettings({ tenant }: Props) {
  const [allowIndexing, setAllowIndexing] = useState(tenant.allow_indexing ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(tenant.maintenance_mode ?? false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    tenant.maintenance_message ?? "Na stránkách právě probíhá aktualizace"
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allow_indexing: allowIndexing, maintenance_mode: maintenanceMode, maintenance_message: maintenanceMessage }),
      });
      if (!res.ok) { setStatus("error"); return; }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <SettingsLayout
      tenantSlug={tenant.slug}
      activeItem="Web"
      title="Nastavení webu"
      actionButton={
        <div className="flex items-center gap-3">
          <StatusMessage status={status} />
          <SaveButton loading={status === "saving"} onClick={handleSave} />
        </div>
      }
    >
      <div className="max-w-3xl">
        <Card>
          <div className="px-6">
            <SectionHeader title="Doména" />
            <FormRow
              label="URL webu"
              help={{ title: "Adresa vašeho webu", text: "Toto je výchozí URL, pod kterou je váš web dostupný na platformě." }}
            >
              <Input value={`https://${tenant.slug}.webero.co`} disabled />
              <p className="mt-1.5 text-[11px] text-[#52525b]">
                Pro vlastní doménu přejděte do sekce Domény.
              </p>
            </FormRow>

            <SectionHeader title="Dostupnost webu" />
            <FormRow
              label="Indexování"
              help={{ title: "Indexování vyhledávači", text: "Indexování je pro crawlery povoleno. Vypněte, pokud chcete skrýt web před vyhledávači (přidá noindex)." }}
            >
              <div className="flex items-center gap-3">
                <Toggle checked={allowIndexing} onChange={setAllowIndexing} />
                <span className="text-[13px] text-[#a1a1aa]">
                  {allowIndexing ? "Indexování povoleno" : "Indexování zakázáno"}
                </span>
              </div>
            </FormRow>

            <SectionHeader title="Údržba" />
            <FormRow
              label="Režim údržby"
              help={{ title: "Režim údržby", text: "Při zapnutí se návštěvníkům zobrazí stránka údržby místo vašeho webu." }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
                <span className="text-[13px] text-[#a1a1aa]">
                  {maintenanceMode ? "Režim údržby zapnut" : "Web je dostupný"}
                </span>
              </div>
              {maintenanceMode && (
                <Input
                  value={maintenanceMessage}
                  onChange={setMaintenanceMessage}
                  placeholder="Na stránkách právě probíhá aktualizace"
                />
              )}
            </FormRow>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
}
