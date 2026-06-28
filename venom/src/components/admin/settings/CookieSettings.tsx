"use client";

import { useState } from "react";
import { SettingsLayout } from "./SettingsLayout";
import { Toggle, FormRow, Textarea, SectionHeader, SaveButton, StatusMessage, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

const DEFAULT_COOKIE_TEXT =
  "Tento web používá soubory cookie, aby vám poskytoval co nejlepší zážitek. Pokračováním v prohlížení souhlasíte s jejich použitím.";

export function CookieSettings({ tenant }: Props) {
  const [cookieEnabled, setCookieEnabled] = useState(tenant.cookie_enabled ?? false);
  const [cookieText, setCookieText] = useState(tenant.cookie_text ?? DEFAULT_COOKIE_TEXT);
  const [cookieShowMore, setCookieShowMore] = useState(tenant.cookie_show_more ?? true);
  const [defaultConsent, setDefaultConsent] = useState(false);
  const [waitForUpdate, setWaitForUpdate] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookie_enabled: cookieEnabled,
          cookie_text: cookieText || null,
          cookie_show_more: cookieShowMore,
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
      activeItem="Cookie lišta"
      title="Cookie lišta"
      actionButton={
        <div className="flex items-center gap-3">
          <StatusMessage status={status} />
          <button
            type="button"
            onClick={() => setCookieText(DEFAULT_COOKIE_TEXT)}
            className="rounded-lg border border-white/[0.1] bg-[#1a1a1d] px-4 py-2 text-[13px] text-[#a1a1aa] hover:bg-[#222226] transition-colors"
          >
            Obnovit výchozí texty
          </button>
          <SaveButton loading={status === "saving"} onClick={handleSave} />
        </div>
      }
    >
      <div className="max-w-3xl">
        <Card>
          <div className="px-6">
            <SectionHeader title="Zobrazení" />
            <FormRow
              label="Cookie lišta"
              help={{ title: "Cookie consent", text: "Zobrazí lištu se souhlasem s cookies návštěvníkům webu." }}
            >
              <div className="flex items-center gap-3">
                <Toggle checked={cookieEnabled} onChange={setCookieEnabled} />
                <span className="text-[13px] text-[#a1a1aa]">
                  {cookieEnabled ? "Lišta je zobrazena" : "Lišta je skryta"}
                </span>
              </div>
            </FormRow>
            <FormRow
              label="Odkaz Více informací"
              help={{ title: "Zobrazit odkaz", text: "Zobrazí odkaz na stránku s podrobnostmi o cookies." }}
            >
              <div className="flex items-center gap-3">
                <Toggle checked={cookieShowMore} onChange={setCookieShowMore} />
                <span className="text-[13px] text-[#a1a1aa]">
                  {cookieShowMore ? "Odkaz zobrazen" : "Odkaz skryt"}
                </span>
              </div>
            </FormRow>

            <SectionHeader title="Text" />
            <FormRow
              label="Text lišty"
              help={{ title: "Zpráva cookie lišty", text: "Text, který se zobrazí návštěvníkovi v cookie liště." }}
            >
              <Textarea
                value={cookieText}
                onChange={setCookieText}
                placeholder="Text cookie lišty…"
                rows={4}
              />
            </FormRow>

            <SectionHeader title="Pokročilé" />
            <FormRow
              label="Výchozí souhlas"
              help={{ title: "Použití výchozího souhlasu", text: "Umožňuje nastavit výchozí stav souhlasu před interakcí uživatele." }}
            >
              <div className="flex items-center gap-3">
                <Toggle checked={defaultConsent} onChange={setDefaultConsent} />
                <span className="text-[13px] text-[#a1a1aa]">Použití výchozího souhlasu</span>
              </div>
            </FormRow>
            <FormRow
              label="Čekat na aktualizaci"
              help={{ title: "Počkejte na aktualizaci", text: "Blokuje analytické skripty, dokud uživatel neudělí souhlas." }}
            >
              <div className="flex items-center gap-3">
                <Toggle checked={waitForUpdate} onChange={setWaitForUpdate} />
                <span className="text-[13px] text-[#a1a1aa]">Počkejte na aktualizaci</span>
              </div>
            </FormRow>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
}
