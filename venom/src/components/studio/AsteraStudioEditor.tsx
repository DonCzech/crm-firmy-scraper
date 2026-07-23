"use client";

/**
 * Admin editing surface for astera-site tenants.
 *
 * Instead of forcing the whole astera page into Venom's generic StudioCanvas
 * (whose chrome would collide with astera's own fixed LiveEditor), we mount the
 * astera site 1:1 with its native LiveEditor active — the same editing UX the
 * client already knows from astera-web — authenticated by the Venom tenant
 * cookie. A thin top bar switches the language being edited (astera's own
 * in-page language switch relies on URL navigation, which doesn't apply here).
 */

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Section, Tenant } from "@/lib/db";
import type { Lang } from "@/astera/lib/i18n";
import { AsteraSiteTemplate, type AsteraSiteContent } from "@/components/templates/AsteraSiteTemplate";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ua", label: "Українська", flag: "🇺🇦" },
];

interface Props {
  tenant: Tenant;
  section: Section;
}

export function AsteraStudioEditor({ tenant, section }: Props) {
  // Language is URL-driven (?lang=) so both this top bar and astera's own
  // in-panel language tabs (LiveEditor.switchLanguage) stay in sync.
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const lang: Lang = langParam === "en" || langParam === "ua" ? langParam : "cs";
  const router = useRouter();
  const setLang = (next: Lang) => router.push(`/demo/${tenant.slug}/admin?lang=${next}`);
  // Local mirror of the section settings so saves accumulate across languages.
  const [settings, setSettings] = useState<Record<string, unknown>>(
    (section.settings ?? {}) as Record<string, unknown>
  );

  const content = (settings.content ?? {}) as Partial<AsteraSiteContent>;

  const onSaveSection = useCallback(
    async (sectionKey: string, sectionContent: unknown, saveLang: Lang) => {
      // Merge into settings.content[lang][sectionKey] without touching other langs.
      const prevContent = (settings.content ?? {}) as Record<string, Record<string, unknown>>;
      const prevLang = (prevContent[saveLang] ?? {}) as Record<string, unknown>;
      const nextSettings = {
        ...settings,
        content: { ...prevContent, [saveLang]: { ...prevLang, [sectionKey]: sectionContent } },
      };
      setSettings(nextSettings);
      const res = await fetch(`/api/demo/${tenant.slug}/sections/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: nextSettings }),
      });
      if (!res.ok) throw new Error("Failed to save astera section");
    },
    [settings, tenant.slug, section.id]
  );

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: "#1a1430",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        <span style={{ opacity: 0.7, marginRight: 4 }}>Upravovaný jazyk:</span>
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid " + (lang === l.code ? "#a78bfa" : "rgba(255,255,255,0.15)"),
              background: lang === l.code ? "#6d28d9" : "transparent",
              color: "#fff",
              cursor: "pointer",
              fontWeight: lang === l.code ? 600 : 400,
            }}
          >
            <span>{l.flag}</span>
            {l.label}
          </button>
        ))}
        <a
          href={`/demo/${tenant.slug}?lang=${lang}`}
          target="_blank"
          rel="noreferrer"
          style={{ marginLeft: "auto", color: "#c4b5fd", textDecoration: "none", fontSize: 12 }}
        >
          Náhled ↗
        </a>
      </div>

      <div style={{ paddingTop: 44 }}>
        {/* key on lang forces the astera provider to re-seed for the edited language */}
        <AsteraSiteTemplate
          key={lang}
          content={content as AsteraSiteContent}
          tenantSlug={tenant.slug}
          lang={lang}
          isAdmin
          adminEmail={`${tenant.slug}@webero.local`}
          onSaveSection={onSaveSection}
        />
      </div>
    </>
  );
}
