"use client";

import { useState } from "react";
import { SettingsLayout } from "./SettingsLayout";
import { Toggle, FormRow, Input, SectionHeader, SaveButton, StatusMessage, Card } from "./ui";
import type { Tenant } from "@/lib/db";

interface Props {
  tenant: Tenant;
}

export function SeoSettings({ tenant }: Props) {
  const [defaultTitle, setDefaultTitle] = useState(tenant.seo_default_title ?? "");
  const [titlePrefix, setTitlePrefix] = useState(tenant.seo_title_prefix ?? "");
  const [titleSuffix, setTitleSuffix] = useState(tenant.seo_title_suffix ?? "");
  const [defaultDescription, setDefaultDescription] = useState(tenant.seo_default_description ?? "");
  const [canonicalEnabled, setCanonicalEnabled] = useState(tenant.canonical_enabled ?? true);
  const [searchConsole, setSearchConsole] = useState(tenant.search_console_verification ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo_default_title: defaultTitle || null,
          seo_title_prefix: titlePrefix || null,
          seo_title_suffix: titleSuffix || null,
          seo_default_description: defaultDescription || null,
          canonical_enabled: canonicalEnabled,
          search_console_verification: searchConsole || null,
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
      activeItem="SEO"
      title="SEO — Výchozí nastavení"
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
            <SectionHeader title="Obecné" />
            <FormRow
              label="Výchozí titulek"
              help={{ title: "Výchozí SEO titulek", text: "Zobrazuje se ve výsledcích vyhledávání na stránkách, kde není nastaven specifický titulek." }}
            >
              <Input
                value={defaultTitle}
                onChange={setDefaultTitle}
                placeholder="Název vašeho webu"
              />
            </FormRow>
            <FormRow
              label="Prefix titulku"
              help={{ title: "Prefix titulku", text: "Text přidaný před titulek každé stránky. Např. 'Webero | '." }}
            >
              <Input
                value={titlePrefix}
                onChange={setTitlePrefix}
                placeholder="Např. Webero | "
              />
            </FormRow>
            <FormRow
              label="Suffix titulku"
              help={{ title: "Suffix titulku", text: "Text přidaný za titulek každé stránky. Např. ' | Webero'." }}
            >
              <Input
                value={titleSuffix}
                onChange={setTitleSuffix}
                placeholder="Např.  | Webero"
              />
            </FormRow>
            <FormRow
              label="Výchozí popis"
              help={{ title: "Meta description", text: "Stručný popis webu zobrazovaný ve výsledcích vyhledávání, pokud stránka nemá vlastní popis." }}
            >
              <Input
                value={defaultDescription}
                onChange={setDefaultDescription}
                placeholder="Stručný popis vašeho webu…"
              />
            </FormRow>

            <SectionHeader title="Technické" />
            <FormRow
              label="Kanonické URL"
              help={{ title: "Canonical URL", text: "Automaticky přidává kanonické URL na každou stránku, aby se předešlo duplicitnímu obsahu." }}
            >
              <div className="flex items-center gap-3">
                <Toggle checked={canonicalEnabled} onChange={setCanonicalEnabled} />
                <span className="text-[13px] text-[#a1a1aa]">
                  {canonicalEnabled ? "Kanonické URL jsou zapnuty" : "Kanonické URL jsou vypnuty"}
                </span>
              </div>
            </FormRow>
            <FormRow
              label="Google Search Console"
              help={{ title: "Ověření Search Console", text: "Vložte ověřovací kód z Google Search Console. Podporuje meta tag i DNS ověření." }}
            >
              <Input
                value={searchConsole}
                onChange={setSearchConsole}
                placeholder="google-site-verification=…"
              />
            </FormRow>
          </div>
        </Card>
      </div>
    </SettingsLayout>
  );
}
