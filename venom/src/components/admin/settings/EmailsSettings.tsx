"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import { FormRow, Input, SectionHeader, SaveButton, StatusMessage, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

type Tab = "E-maily" | "Emailové šablony" | "Nastavení";

interface EmailSettings {
  sender_email?: string;
  sender_name?: string;
  reply_to?: string;
  logo_position?: string;
  logo_text?: string;
}

export function EmailsSettings({ tenant }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("E-maily");
  const stored = (tenant.email_settings ?? {}) as EmailSettings;
  const [senderEmail, setSenderEmail] = useState(stored.sender_email ?? tenant.email);
  const [senderName, setSenderName] = useState(stored.sender_name ?? (tenant.business_name ?? ""));
  const [replyTo, setReplyTo] = useState(stored.reply_to ?? "");
  const [logoPosition, setLogoPosition] = useState(stored.logo_position ?? "left");
  const [logoText, setLogoText] = useState(stored.logo_text ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const tabs: Tab[] = ["E-maily", "Emailové šablony", "Nastavení"];

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_settings: {
            sender_email: senderEmail,
            sender_name: senderName,
            reply_to: replyTo,
            logo_position: logoPosition,
            logo_text: logoText,
          },
        }),
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
      activeItem="E-maily"
      title="E-maily"
      actionButton={
        activeTab === "Nastavení" ? (
          <div className="flex items-center gap-3">
            <StatusMessage status={status} />
            <SaveButton loading={status === "saving"} onClick={handleSave} />
          </div>
        ) : undefined
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-blue-500 text-white"
                : "border-transparent text-[#71717a] hover:text-[#a1a1aa]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "E-maily" && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[14px] text-[#71717a]">Zatím žádné odeslané e-maily.</p>
        </div>
      )}

      {activeTab === "Emailové šablony" && (
        <div className="rounded-xl border border-white/[0.07] bg-[#111113] overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["NÁZEV ŠABLONY", "STAV"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.08em] text-[#52525b] uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
                <td className="px-4 py-3 text-white">Výchozí šablona</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">Aktivní</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Nastavení" && (
        <div className="max-w-3xl">
          <Card>
            <div className="px-6">
              <SectionHeader title="Odesílatel" />
              <FormRow label="E-mail odesílatele">
                <Input value={senderEmail} onChange={setSenderEmail} placeholder="info@firma.cz" />
              </FormRow>
              <FormRow label="Předmět / název">
                <Input value={senderName} onChange={setSenderName} placeholder="Název firmy" />
              </FormRow>
              <FormRow label="Reply-to">
                <Input value={replyTo} onChange={setReplyTo} placeholder="odpovedi@firma.cz" />
              </FormRow>

              <SectionHeader title="Logo" />
              <FormRow label="Pozice loga">
                <select
                  value={logoPosition}
                  onChange={(e) => setLogoPosition(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-3 py-2 text-[13px] text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="left">Vlevo</option>
                  <option value="center">Uprostřed</option>
                  <option value="right">Vpravo</option>
                </select>
              </FormRow>
              <FormRow label="Text loga">
                <Input value={logoText} onChange={setLogoText} placeholder="Název firmy v e-mailu" />
              </FormRow>
            </div>
          </Card>
        </div>
      )}
    </SettingsLayout>
  );
}
