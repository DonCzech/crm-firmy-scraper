"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import { Input, SectionHeader, StatusMessage, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

function GaIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#E37400" />
      <rect x="6" y="18" width="6" height="8" rx="1" fill="white" />
      <rect x="13" y="12" width="6" height="14" rx="1" fill="white" opacity="0.8" />
      <rect x="20" y="6" width="6" height="20" rx="1" fill="white" opacity="0.6" />
    </svg>
  );
}

function GtmIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#4285F4" />
      <path d="M16 6l10 10-10 10L6 16z" fill="white" opacity="0.9" />
      <path d="M16 10l6 6-6 6-6-6z" fill="#4285F4" />
    </svg>
  );
}

function IntegrationCard({
  icon,
  title,
  description,
  value,
  placeholder,
  onChange,
  onConnect,
  onDisconnect,
  saving,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  saving: boolean;
}) {
  const isConnected = value.trim().length > 0;
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-start gap-4">
        <div className="shrink-0">{icon}</div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-white mb-0.5">{title}</p>
          <p className="text-[12px] text-[#71717a] mb-3">{description}</p>
          <div className="flex items-center gap-3">
            <Input value={value} onChange={onChange} placeholder={placeholder} />
            {isConnected ? (
              <button
                type="button"
                onClick={onDisconnect}
                disabled={saving}
                className="shrink-0 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
              >
                Odpojit
              </button>
            ) : (
              <button
                type="button"
                onClick={onConnect}
                disabled={saving}
                className="shrink-0 rounded-lg bg-[#2563eb] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
              >
                Propojit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoonCard({
  color,
  title,
  description,
  initial,
}: {
  color: string;
  title: string;
  description: string;
  initial: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white text-[12px] font-bold"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-white mb-0.5">{title}</p>
          <p className="text-[12px] text-[#71717a] mb-3">{description}</p>
          <span className="inline-flex items-center rounded-full bg-[#1a1a1d] border border-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-[#71717a]">
            Brzy k dispozici
          </span>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsSettings({ tenant }: Props) {
  const [gaId, setGaId] = useState(tenant.ga_measurement_id ?? "");
  const [gtmId, setGtmId] = useState(tenant.gtm_id ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(fields: Record<string, string | null>) {
    setSaving(true);
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) { setStatus("error"); } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsLayout
      tenantSlug={tenant.slug}
      activeItem="Integrace a API"
      title="Integrace a API"
      actionButton={<StatusMessage status={status} />}
    >
      <div className="max-w-3xl space-y-8">
        <div>
          <SectionHeader title="Analytické nástroje" />
          <div className="space-y-4 mt-2">
            <IntegrationCard
              icon={<GaIcon />}
              title="Google Analytics 4"
              description="Sledujte návštěvnost a chování uživatelů pomocí Google Analytics 4."
              value={gaId}
              placeholder="G-XXXXXXXXXX"
              onChange={setGaId}
              onConnect={() => save({ ga_measurement_id: gaId.trim() || null })}
              onDisconnect={() => { setGaId(""); save({ ga_measurement_id: null }); }}
              saving={saving}
            />
            <IntegrationCard
              icon={<GtmIcon />}
              title="Google Tag Manager"
              description="Spravujte všechny marketingové tagy na jednom místě bez zásahu do kódu."
              value={gtmId}
              placeholder="GTM-XXXXXX"
              onChange={setGtmId}
              onConnect={() => save({ gtm_id: gtmId.trim() || null })}
              onDisconnect={() => { setGtmId(""); save({ gtm_id: null }); }}
              saving={saving}
            />
          </div>
        </div>

        <div>
          <SectionHeader title="Exporty a CRM" />
          <div className="space-y-4 mt-2">
            <ComingSoonCard color="#0F9D58" title="Google Sheets" description="Automaticky exportujte data kontaktních formulářů do Google Sheets." initial="GS" />
            <ComingSoonCard color="#00A1E0" title="Salesforce" description="Synchronizujte kontakty a leady přímo do vašeho Salesforce CRM." initial="SF" />
            <ComingSoonCard color="#FFE01B" title="Mailchimp" description="Přidávejte nové kontakty automaticky do vašich Mailchimp seznamů." initial="MC" />
            <ComingSoonCard color="#21759B" title="Smartemailing" description="Propojte váš web s českým emailingovým nástrojem Smartemailing." initial="SE" />
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
