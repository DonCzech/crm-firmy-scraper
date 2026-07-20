"use client";

import { useState } from "react";
import clsx from "clsx";
import { SettingsLayout } from "./SettingsLayout";
import { Toggle } from "./ui";
import { ShieldAlert, Code2 } from "lucide-react";

export interface CustomCodeValue {
  enabled: boolean;
  head_html: string;
  body_end_html: string;
  custom_css: string;
  custom_js: string;
}

interface Props {
  tenantSlug: string;
  initialCode: CustomCodeValue;
}

type TabKey = "head_html" | "custom_css" | "custom_js" | "body_end_html";

const TABS: Array<{ key: TabKey; label: string; lang: string; placeholder: string; help: string }> = [
  {
    key: "head_html",
    label: "HTML hlavička",
    lang: "html",
    placeholder: "<!-- Např. měřicí kódy (Google Analytics, Meta Pixel), fonty, ověřovací tagy -->",
    help: "Kód se vloží na začátek každé veřejné stránky webu i e-shopu. Skripty a styly fungují stejně jako v <head>. Externí skripty musí být načítané přes https://.",
  },
  {
    key: "custom_css",
    label: "CSS styly",
    lang: "css",
    placeholder: "/* Např. .hero h1 { letter-spacing: 0.05em; } */",
    help: "Vlastní styly se aplikují na všechny veřejné stránky — přepíšou styly šablony. Aktualizace šablony tím zůstávají zachované, váš CSS se aplikuje navrch.",
  },
  {
    key: "custom_js",
    label: "JavaScript",
    lang: "js",
    placeholder: "// Např. document.querySelectorAll('.faq-item')...",
    help: "Skript se spustí na konci každé veřejné stránky (po načtení obsahu). Nepoužívejte document.write.",
  },
  {
    key: "body_end_html",
    label: "HTML patička",
    lang: "html",
    placeholder: "<!-- Např. chat widget, remarketingové kódy -->",
    help: "Kód se vloží před konec stránky — ideální pro chat widgety a kódy, které nemusí blokovat vykreslení.",
  },
];

export function CustomCodeSettings({ tenantSlug, initialCode }: Props) {
  const [code, setCode] = useState<CustomCodeValue>(initialCode);
  const [tab, setTab] = useState<TabKey>("head_html");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const activeTab = TABS.find((t) => t.key === tab)!;

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/custom-code`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(code),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage({ kind: "ok", text: "Uloženo. Změny se na webu projeví do pár minut." });
      } else {
        setMessage({ kind: "error", text: (data as { error?: string }).error ?? "Uložení se nezdařilo." });
      }
    } catch {
      setMessage({ kind: "error", text: "Uložení se nezdařilo — zkuste to znovu." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsLayout
      tenantSlug={tenantSlug}
      activeItem="Vlastní kód"
      title="Vlastní kód"
      actionButton={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
        >
          {saving ? "Ukládám…" : "Uložit změny"}
        </button>
      }
    >
      <div className="space-y-5">
        {/* Intro + master toggle */}
        <div className="flex items-start justify-between gap-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-start gap-3">
            <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-[#60a5fa]" />
            <div className="text-[12.5px] leading-relaxed text-[#a1a1aa]">
              <p className="font-semibold text-[#e4e4e7]">Úpravy vzhledu a funkcí bez zásahu do šablony</p>
              <p className="mt-1">
                Vložený HTML, CSS a JavaScript se aplikuje na všechny veřejné stránky webu i e-shopu
                (nikdy do administrace). Šablona zůstává nedotčená — aktualizace šablon se vás dál týkají
                a váš kód se aplikuje navrch.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[12px] text-[#a1a1aa]">{code.enabled ? "Aktivní" : "Vypnuto"}</span>
            <Toggle checked={code.enabled} onChange={(v) => setCode((c) => ({ ...c, enabled: v }))} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1">
          {TABS.map((t) => {
            const filled = code[t.key].trim().length > 0;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                  tab === t.key ? "bg-[#2563eb] text-white" : "text-[#a1a1aa] hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {t.label}
                {filled && <span className={clsx("h-1.5 w-1.5 rounded-full", tab === t.key ? "bg-white" : "bg-[#60a5fa]")} />}
              </button>
            );
          })}
        </div>

        {/* Editor */}
        <div>
          <textarea
            value={code[tab]}
            onChange={(e) => setCode((c) => ({ ...c, [tab]: e.target.value }))}
            placeholder={activeTab.placeholder}
            spellCheck={false}
            rows={18}
            className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#0b0b0d] p-4 font-mono text-[12.5px] leading-relaxed text-[#e4e4e7] outline-none placeholder:text-[#3f3f46] focus:border-[#2563eb]/60"
          />
          <p className="mt-2 text-[12px] text-[#71717a]">{activeTab.help}</p>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-[12px] leading-relaxed text-[#d4d4d8]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold text-amber-200">Bezpečnostní omezení</p>
            <p className="mt-1 text-[#a1a1aa]">
              Z bezpečnostních důvodů nejsou povoleny: externí skripty bez https://, tag &lt;base&gt;,
              javascript: odkazy, meta refresh, CSS expression() a kód cílící na administraci platformy.
              Limit je 64 KB na pole. Každá změna se zapisuje do záznamu aktivity.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={clsx(
              "rounded-lg px-4 py-3 text-[13px]",
              message.kind === "ok"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "bg-red-500/10 text-red-300 border border-red-500/20"
            )}
          >
            {message.text}
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
