"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Plus, Trash2, AlertCircle, Upload, X } from "@/components/studio/icons";
import { useStudio } from "./StudioContext";
import type { StudioState } from "./TenantStudioView";
import type { Tenant } from "@/lib/db";

// ─── Studio settings UI primitives ────────────────────────────────────────────

function LInput({
  value, onChange, placeholder, disabled, type = "text",
}: {
  value: string; onChange?: (v: string) => void; placeholder?: string; disabled?: boolean; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={!onChange}
      className="w-full rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-field-bg)] px-3 py-2 text-[13px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] shadow-[var(--vs-shadow-sm)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-accent-ring)] disabled:bg-[var(--vs-surface-2)] disabled:opacity-60 transition-colors"
    />
  );
}

function LTextarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-field-bg)] px-3 py-2 text-[13px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] shadow-[var(--vs-shadow-sm)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vs-accent-ring)] transition-colors resize-none"
    />
  );
}

function LToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(212,212,216,0.35)] ${checked ? "bg-[var(--vs-accent)]" : "bg-[var(--vs-surface-3)]"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function LFormRow({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--vs-border)] py-4 last:border-0 sm:flex-row sm:gap-6 sm:py-5">
      <div className="shrink-0 sm:w-44">
        <p className="text-[13px] font-medium text-[var(--vs-text-soft)]">{label}</p>
        {help && <p className="mt-0.5 text-[11.5px] text-[var(--vs-text-dim)] leading-snug">{help}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function LSectionTitle({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--vs-text-dim)] pt-5 pb-2 first:pt-2">
      {children}
    </p>
  );
}

function LCard({ children }: { children: ReactNode }) {
  return (
    <div className="vs-chrome-card mb-4 overflow-x-auto rounded-xl border">
      <div className="px-4 sm:px-6">{children}</div>
    </div>
  );
}

function LSaveBar({
  status, onSave,
}: {
  status: "idle" | "saving" | "saved" | "error"; onSave: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "saved" && (
        <span className="flex items-center gap-1.5 text-[13px] text-[var(--vs-success)] font-medium">
          <Check className="h-4 w-4" /> Uloženo
        </span>
      )}
      {status === "error" && (
        <span className="flex items-center gap-1.5 text-[13px] text-red-500 font-medium">
          <AlertCircle className="h-4 w-4" /> Chyba při ukládání
        </span>
      )}
      <button
        type="button"
        disabled={status === "saving"}
        onClick={onSave}
        className="flex items-center gap-2 rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-50 transition-colors"
      >
        {status === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Uložit změny
      </button>
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader({
  title, onBack, status, onSave,
}: {
  title: string; onBack: () => void; status: "idle" | "saving" | "saved" | "error"; onSave: () => void;
}) {
  return (
    <div className="vs-chrome-header sticky top-0 z-10 flex flex-col items-stretch justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-8 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Nastavení
        </button>
        <span className="text-[var(--vs-text-disabled)]">/</span>
        <h1 className="truncate text-[15px] font-semibold text-[var(--vs-text)]">{title}</h1>
      </div>
      <LSaveBar status={status} onSave={onSave} />
    </div>
  );
}

// ─── useSettings hook: shared save logic ─────────────────────────────────────

function useSettingsSave(slug: string, getBody: () => Record<string, unknown>) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/demo/${slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getBody()),
      });
      if (!res.ok) { setStatus("error"); return; }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  return { status, save };
}

// ─── DOMAINS ─────────────────────────────────────────────────────────────────

interface DomainRow { id: number; domain: string; verified: boolean; created_at: string }

function DomainView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const domainsEndpoint = `/api/demo/${encodeURIComponent(tenant.slug)}/domains`;
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [verifyResult, setVerifyResult] = useState<Record<number, { verified: boolean; message: string }>>({});
  const [dnsInfo, setDnsInfo] = useState<{ ip: string; cname: string } | null>(null);

  useEffect(() => {
    fetch(domainsEndpoint)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setDomains(d.domains ?? []);
          setDnsInfo(d.dnsInstructions ?? null);
        }
      })
      .catch(() => {});
  }, [domainsEndpoint]);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch(domainsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba");
      setNewDomain("");
      setDomains((prev) => [...prev, { id: data.id ?? Date.now(), domain: data.domain, verified: false, created_at: new Date().toISOString() }]);
    } catch (err) {
      setAddError(String(err).replace("Error: ", ""));
    } finally {
      setAdding(false);
    }
  }

  async function removeDomain(id: number) {
    await fetch(`${domainsEndpoint}?id=${id}`, { method: "DELETE" });
    setDomains((prev) => prev.filter((d) => d.id !== id));
  }

  async function verifyDomain(d: DomainRow) {
    setVerifying(d.id);
    try {
      const res = await fetch(domainsEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id }),
      });
      const data = await res.json() as { verified: boolean };
      setVerifyResult((prev) => ({
        ...prev,
        [d.id]: { verified: data.verified, message: data.verified ? "DNS záznamy jsou správně nastavené!" : "DNS záznamy zatím nenalezeny. Počkejte na propagaci (1–24 h)." },
      }));
      if (data.verified) {
        setDomains((prev) => prev.map((x) => x.id === d.id ? { ...x, verified: true } : x));
      }
    } catch {
      setVerifyResult((prev) => ({ ...prev, [d.id]: { verified: false, message: "Chyba při ověřování DNS." } }));
    } finally {
      setVerifying(null);
    }
  }

  return (
    <>
      <PageHeader title="Vlastní doména" onBack={onBack} status="idle" onSave={async () => {}} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">

        {/* Webero URL */}
        <LCard>
          <LSectionTitle>Webero URL</LSectionTitle>
          <LFormRow label="Výchozí adresa" help="Tato adresa vždy funguje, bez nutnosti nastavení DNS.">
            <LInput value={`https://${tenant.slug}.webero.co`} disabled />
          </LFormRow>
        </LCard>

        {/* DNS instructions */}
        {dnsInfo && (
          <LCard>
            <LSectionTitle>Jak nastavit vlastní doménu</LSectionTitle>
            <div className="rounded-lg bg-[var(--vs-accent-bg)] border border-[var(--vs-border-strong)] p-4 text-[12.5px] text-[var(--vs-text-soft)] space-y-2.5">
              <p className="font-semibold">U svého registrátora domény přidejte tyto záznamy:</p>
              <div className="rounded-md bg-[var(--vs-surface)] border border-[var(--vs-accent-ring)] divide-y divide-[var(--vs-border)] font-mono text-[11.5px]">
                <div className="flex gap-4 px-3 py-2"><span className="w-16 text-[var(--vs-accent)]">Typ</span><span className="w-20 text-[var(--vs-accent)]">Název</span><span className="text-[var(--vs-accent)]">Hodnota</span></div>
                <div className="flex gap-4 px-3 py-2 text-[var(--vs-text-soft)]"><span className="w-16">A</span><span className="w-20">@</span><span>{dnsInfo.ip}</span></div>
                <div className="flex gap-4 px-3 py-2 text-[var(--vs-text-soft)]"><span className="w-16">CNAME</span><span className="w-20">www</span><span>{dnsInfo.cname}</span></div>
              </div>
              <p className="text-[11px] text-[var(--vs-accent-hi)]">Propagace DNS může trvat 1–24 hodin. Po přidání domény klikněte na Ověřit.</p>
            </div>
          </LCard>
        )}

        {/* Domain list */}
        <LCard>
          <LSectionTitle>Vlastní domény</LSectionTitle>
          {domains.length === 0 ? (
            <p className="py-4 text-[13px] text-[var(--vs-text-dim)]">Zatím žádná vlastní doména.</p>
          ) : (
            <div className="mb-4 divide-y divide-[var(--vs-border)]">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--vs-text)] truncate">{d.domain}</span>
                      {d.verified
                        ? <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700">Ověřeno</span>
                        : <span className="shrink-0 rounded-full bg-[var(--vs-warning-bg)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--vs-warning)]">Čeká na ověření</span>
                      }
                    </div>
                    {verifyResult[d.id] && (
                      <p className={`mt-0.5 text-[11.5px] ${verifyResult[d.id].verified ? "text-emerald-600" : "text-[var(--vs-warning)]"}`}>
                        {verifyResult[d.id].message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!d.verified && (
                      <button
                        type="button"
                        onClick={() => void verifyDomain(d)}
                        disabled={verifying === d.id}
                        className="rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-accent-bg)] px-3 py-1.5 text-[12px] font-medium text-[var(--vs-accent-hi)] hover:bg-[var(--vs-accent-bg)] disabled:opacity-50 transition-colors"
                      >
                        {verifying === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ověřit"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeDomain(d.id)}
                      className="rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-1.5 text-[var(--vs-text-dim)] hover:text-red-500 hover:border-red-200 hover:bg-[var(--vs-danger-bg)] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add domain form */}
          <form onSubmit={addDomain} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="mujweb.cz"
              className="flex-1 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-3 py-2 text-[13px] placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,212,216,0.25)]"
            />
            <button
              type="submit"
              disabled={adding || !newDomain.trim()}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-50 transition-colors"
            >
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Přidat
            </button>
          </form>
          {addError && <p className="mt-2 text-[12px] text-red-500">{addError}</p>}
        </LCard>
      </div>
    </>
  );
}

// ─── WEB ──────────────────────────────────────────────────────────────────────

function WebView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [allowIndexing, setAllowIndexing] = useState(tenant.allow_indexing ?? true);
  const [maintenanceMode, setMaintenanceMode] = useState(tenant.maintenance_mode ?? false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(tenant.maintenance_message ?? "Na stránkách právě probíhá aktualizace");
  const [siteMode, setSiteMode] = useState<"onepage" | "multipage">(tenant.site_mode ?? "multipage");
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    allow_indexing: allowIndexing,
    maintenance_mode: maintenanceMode,
    maintenance_message: maintenanceMessage,
    site_mode: siteMode,
  }));

  return (
    <>
      <PageHeader title="Nastavení webu" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Doména</LSectionTitle>
          <LFormRow label="URL webu" help="Výchozí adresa vašeho webu na platformě.">
            <LInput value={`https://${tenant.slug}.webero.co`} disabled />
            <button
              type="button"
              onClick={() => { /* handled by parent */ }}
              className="mt-1.5 text-[11.5px] text-[var(--vs-accent)] hover:underline text-left"
              data-settings-view="domain"
            >
              + Přidat vlastní doménu
            </button>
          </LFormRow>

          <LSectionTitle>Dostupnost</LSectionTitle>
          <LFormRow label="Indexování" help="Povoluje nebo zakazuje crawlerům indexovat web.">
            <div className="flex items-center gap-3">
              <LToggle checked={allowIndexing} onChange={setAllowIndexing} />
              <span className="text-[13px] text-[var(--vs-text-muted)]">{allowIndexing ? "Povoleno" : "Zakázáno"}</span>
            </div>
          </LFormRow>

          <LSectionTitle>Typ webu</LSectionTitle>
          <LFormRow label="One-page / Multi-page" help="One-page: veškerý obsah na jedné stránce se scroll navigací. Multi-page: samostatné podstránky.">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSiteMode(siteMode === "onepage" ? "multipage" : "onepage")}
                className="flex rounded-lg overflow-hidden border border-[var(--vs-border)] text-[12px] font-medium"
              >
                <span
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    background: siteMode === "onepage" ? "var(--vs-accent-bg)" : "var(--vs-surface)",
                    color: siteMode === "onepage" ? "var(--vs-accent-hi)" : "var(--vs-text-muted)",
                  }}
                >
                  One-page
                </span>
                <span
                  className="px-3 py-1.5 transition-colors"
                  style={{
                    background: siteMode === "multipage" ? "var(--vs-accent-bg)" : "var(--vs-surface)",
                    color: siteMode === "multipage" ? "var(--vs-accent-hi)" : "var(--vs-text-muted)",
                  }}
                >
                  Multi-page
                </span>
              </button>
            </div>
          </LFormRow>

          <LSectionTitle>Údržba</LSectionTitle>
          <LFormRow label="Režim údržby" help="Zobrazí návštěvníkům stránku údržby místo webu.">
            <div className="flex items-center gap-3 mb-3">
              <LToggle checked={maintenanceMode} onChange={setMaintenanceMode} />
              <span className="text-[13px] text-[var(--vs-text-muted)]">{maintenanceMode ? "Zapnuto" : "Vypnuto"}</span>
            </div>
            {maintenanceMode && (
              <LInput
                value={maintenanceMessage}
                onChange={setMaintenanceMessage}
                placeholder="Na stránkách právě probíhá aktualizace"
              />
            )}
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

function SeoView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [defaultTitle, setDefaultTitle] = useState(tenant.seo_default_title ?? "");
  const [titlePrefix, setTitlePrefix] = useState(tenant.seo_title_prefix ?? "");
  const [titleSuffix, setTitleSuffix] = useState(tenant.seo_title_suffix ?? "");
  const [defaultDescription, setDefaultDescription] = useState(tenant.seo_default_description ?? "");
  const [canonicalEnabled, setCanonicalEnabled] = useState(tenant.canonical_enabled ?? true);
  const [searchConsole, setSearchConsole] = useState(tenant.search_console_verification ?? "");
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    seo_default_title: defaultTitle || null,
    seo_title_prefix: titlePrefix || null,
    seo_title_suffix: titleSuffix || null,
    seo_default_description: defaultDescription || null,
    canonical_enabled: canonicalEnabled,
    search_console_verification: searchConsole || null,
  }));

  return (
    <>
      <PageHeader title="SEO — Výchozí nastavení" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Titulky stránek</LSectionTitle>
          <LFormRow label="Výchozí titulek" help="Použije se, pokud stránka nemá vlastní titulek.">
            <LInput value={defaultTitle} onChange={setDefaultTitle} placeholder="Název webu" />
          </LFormRow>
          <LFormRow label="Prefix titulku" help="Text přidaný před každý titulek stránky.">
            <LInput value={titlePrefix} onChange={setTitlePrefix} placeholder="Webero |" />
          </LFormRow>
          <LFormRow label="Suffix titulku" help="Text přidaný za každý titulek stránky.">
            <LInput value={titleSuffix} onChange={setTitleSuffix} placeholder="| Webero" />
          </LFormRow>

          <LSectionTitle>Meta</LSectionTitle>
          <LFormRow label="Výchozí popis" help="Výchozí meta description pro stránky bez vlastního popisu.">
            <LTextarea value={defaultDescription} onChange={setDefaultDescription} placeholder="Stručný popis webu..." rows={3} />
          </LFormRow>
          <LFormRow label="Kanonické URL" help="Přidá canonical tag pro lepší SEO.">
            <div className="flex items-center gap-3">
              <LToggle checked={canonicalEnabled} onChange={setCanonicalEnabled} />
              <span className="text-[13px] text-[var(--vs-text-muted)]">{canonicalEnabled ? "Zapnuto" : "Vypnuto"}</span>
            </div>
          </LFormRow>

          <LSectionTitle>Google Search Console</LSectionTitle>
          <LFormRow label="Ověřovací kód" help="Meta tag pro ověření vlastnictví webu.">
            <LInput value={searchConsole} onChange={setSearchConsole} placeholder="google-site-verification=..." />
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── COOKIES ──────────────────────────────────────────────────────────────────

const DEFAULT_COOKIE_TEXT = "Tento web používá soubory cookie, aby vám poskytoval co nejlepší zážitek. Pokračováním v prohlížení souhlasíte s jejich použitím.";

function CookiesView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [enabled, setEnabled] = useState(tenant.cookie_enabled ?? false);
  const [text, setText] = useState(tenant.cookie_text ?? DEFAULT_COOKIE_TEXT);
  const [showMore, setShowMore] = useState(tenant.cookie_show_more ?? true);
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    cookie_enabled: enabled,
    cookie_text: text || null,
    cookie_show_more: showMore,
  }));

  return (
    <>
      <PageHeader title="Cookie lišta" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Zobrazení</LSectionTitle>
          <LFormRow label="Cookie lišta" help="Zobrazí lištu se souhlasem s cookies návštěvníkům webu.">
            <div className="flex items-center gap-3">
              <LToggle checked={enabled} onChange={setEnabled} />
              <span className="text-[13px] text-[var(--vs-text-muted)]">{enabled ? "Lišta je zobrazena" : "Lišta je skryta"}</span>
            </div>
          </LFormRow>
          <LFormRow label="Odkaz Více informací" help="Zobrazí odkaz na stránku s podrobnostmi o cookies.">
            <div className="flex items-center gap-3">
              <LToggle checked={showMore} onChange={setShowMore} />
              <span className="text-[13px] text-[var(--vs-text-muted)]">{showMore ? "Odkaz zobrazen" : "Odkaz skryt"}</span>
            </div>
          </LFormRow>
          <LSectionTitle>Text</LSectionTitle>
          <LFormRow label="Text lišty" help="Text, který se zobrazí návštěvníkovi v cookie liště.">
            <LTextarea value={text} onChange={setText} placeholder="Text cookie lišty…" rows={4} />
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── USER ACCESS ──────────────────────────────────────────────────────────────

function AccessView({ onBack }: { tenant: Tenant; onBack: () => void }) {
  const [tab, setTab] = useState<"all" | "pending">("all");

  const users = [
    { initials: "TB", name: "Tomas Bartak", email: "group@email.cz", login: "group@email.cz", twofa: false, roles: "admin, owner", inviteStatus: "none" },
  ];

  return (
    <>
      <div className="vs-chrome-header sticky top-0 z-10 flex flex-col items-stretch justify-between gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-8 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)] transition-colors">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Nastavení
          </button>
          <span className="text-[var(--vs-text-disabled)]">/</span>
          <h1 className="truncate text-[15px] font-semibold text-[var(--vs-text)]">Uživatelské přístupy</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] transition-colors">
            <Plus className="h-3.5 w-3.5" /> Nový záznam
          </button>
          <button type="button" className="rounded-lg border border-[var(--vs-border-strong)] px-3.5 py-2 text-[13px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors">
            Pozvat uživatele
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 border-b border-[var(--vs-border)] mb-5">
          {(["all", "pending"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`pb-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                tab === t ? "border-[var(--vs-accent)] text-[var(--vs-accent-hi)]" : "border-transparent text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
              }`}
            >
              {t === "all" ? "Všechny" : "Čekající pozvánky"}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Vyhledávat ve všech sloupcích"
              className="w-full rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] py-1.5 pl-3 pr-3 text-[13px] text-[var(--vs-text-soft)] placeholder-[var(--vs-text-dim)] focus:border-[var(--vs-accent)] focus:outline-none sm:w-56"
            />
          </div>
          {["Název", "Přihlašovací jméno", "E-mail"].map((f) => (
            <button key={f} type="button" className="flex items-center gap-1 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2.5 py-1.5 text-[12.5px] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] transition-colors">
              {f} <span className="text-[var(--vs-text-dim)]">↓</span>
            </button>
          ))}
          <button type="button" className="text-[12.5px] text-[var(--vs-text-dim)] hover:text-[var(--vs-text-soft)] px-1 transition-colors">Zrušit filtry</button>
        </div>

        {/* Table */}
        <div className="vs-chrome-card rounded-xl border">
          <div className="space-y-3 p-3 sm:hidden">
            {users.map((u) => (
              <div key={u.email} className="rounded-lg border border-[var(--vs-border)] bg-[rgba(255,255,255,0.035)] p-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "var(--vs-grad-brand)" }}>
                    {u.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[var(--vs-text)]">{u.name}</p>
                    <p className="truncate text-[11.5px] text-[var(--vs-accent)]">{u.email}</p>
                  </div>
                  <button type="button" className="px-1 text-[var(--vs-text-disabled)] hover:text-[var(--vs-text-muted)]">···</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                  <div>
                    <p className="text-[var(--vs-text-dim)]">Role</p>
                    <p className="mt-0.5 text-[var(--vs-text-soft)]">{u.roles}</p>
                  </div>
                  <div>
                    <p className="text-[var(--vs-text-dim)]">2FA</p>
                    <p className="mt-0.5 text-[var(--vs-text-soft)]">{u.twofa ? "Zapnuto" : "Vypnuto"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[var(--vs-text-dim)]">Přihlašovací jméno</p>
                    <p className="mt-0.5 truncate text-[var(--vs-text-soft)]">{u.login}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-[640px] w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
                <th className="w-8 px-3 py-3"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)] uppercase text-[10.5px] tracking-wide">Uživatel</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)] uppercase text-[10.5px] tracking-wide">Přihlašovací jméno</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)] uppercase text-[10.5px] tracking-wide">2FA</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)] uppercase text-[10.5px] tracking-wide">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)] uppercase text-[10.5px] tracking-wide">Stav pozvánky</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-[var(--vs-border)] hover:bg-[var(--vs-surface-2)]/50">
                  <td className="px-3 py-3"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold" style={{ background: "var(--vs-grad-brand)" }}>
                        {u.initials}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--vs-text)]">{u.name}</p>
                        <p className="text-[11.5px] text-[var(--vs-accent)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--vs-text-soft)]">{u.login}</td>
                  <td className="px-4 py-3 text-[var(--vs-text-dim)]">—</td>
                  <td className="px-4 py-3 text-[var(--vs-text-soft)]">{u.roles}</td>
                  <td className="px-4 py-3 text-[var(--vs-text-dim)]">{u.inviteStatus}</td>
                  <td className="px-3 py-3">
                    <button type="button" className="text-[var(--vs-text-disabled)] hover:text-[var(--vs-text-muted)] px-1">···</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)]/50">
            <p className="text-[12px] text-[var(--vs-text-dim)]">Zobrazuji 1–1 z 1 záznamů</p>
            <select className="rounded border border-[var(--vs-border)] bg-[var(--vs-surface)] px-2 py-1 text-[12px] text-[var(--vs-text-muted)]">
              <option>20 záznamů</option>
              <option>50 záznamů</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── LANGUAGES ────────────────────────────────────────────────────────────────

function LanguagesView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [primaryLang, setPrimaryLang] = useState("cs");
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    primary_language: primaryLang,
  }));

  const languages = [
    { code: "cs", label: "Čeština" },
    { code: "sk", label: "Slovenčina" },
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "pl", label: "Polski" },
  ];

  return (
    <>
      <PageHeader title="Jazyky" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Primární jazyk</LSectionTitle>
          <LFormRow label="Jazyk webu" help="Primární jazyk obsahu webu.">
            <select
              value={primaryLang}
              onChange={(e) => setPrimaryLang(e.target.value)}
              className="w-full rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-3 py-2 text-[13px] text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(212,212,216,0.25)] transition-colors"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── EMAILS ───────────────────────────────────────────────────────────────────

function EmailsView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const emailSettings = (tenant.email_settings ?? {}) as Record<string, string>;
  const [fromName, setFromName] = useState(emailSettings.from_name ?? "");
  const [fromEmail, setFromEmail] = useState(emailSettings.from_email ?? "");
  const [replyTo, setReplyTo] = useState(emailSettings.reply_to ?? "");
  const [footerText, setFooterText] = useState(emailSettings.footer_text ?? "");
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    email_settings: { from_name: fromName, from_email: fromEmail, reply_to: replyTo, footer_text: footerText },
  }));

  return (
    <>
      <PageHeader title="E-maily" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Odesílatel</LSectionTitle>
          <LFormRow label="Jméno odesílatele" help="Zobrazené jméno odesílatele e-mailů.">
            <LInput value={fromName} onChange={setFromName} placeholder="Název firmy" />
          </LFormRow>
          <LFormRow label="E-mail odesílatele" help="Adresa, ze které jsou odesílány e-maily.">
            <LInput value={fromEmail} onChange={setFromEmail} placeholder="info@example.cz" type="email" />
          </LFormRow>
          <LFormRow label="Reply-To adresa" help="Adresa, na kterou chodí odpovědi.">
            <LInput value={replyTo} onChange={setReplyTo} placeholder="info@example.cz" type="email" />
          </LFormRow>

          <LSectionTitle>Patička e-mailu</LSectionTitle>
          <LFormRow label="Text patičky" help="Text zobrazený ve spodní části všech odesílaných e-mailů.">
            <LTextarea value={footerText} onChange={setFooterText} placeholder="© 2025 Název firmy. Všechna práva vyhrazena." rows={3} />
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── BILLING ──────────────────────────────────────────────────────────────────

interface SubStatus {
  status: string;
  plan: string;
  trial_ends_at: string | null;
  paid_at: string | null;
  next_billing_at: string | null;
  next_charge_at: string | null;
  days_remaining: number | null;
  payment_provider: string | null;
}
interface PaymentRow {
  gopay_id: string;
  order_number: string;
  status: string;
  amount_cents: number;
  created_at: string;
}

function BillingView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const billingData = (tenant.billing_data ?? {}) as Record<string, string>;
  const [companyName, setCompanyName] = useState(billingData.company_name ?? "");
  const [ico, setIco] = useState(billingData.ico ?? "");
  const [dic, setDic] = useState(billingData.dic ?? "");
  const [address, setAddress] = useState(billingData.address ?? "");
  const [city, setCity] = useState(billingData.city ?? "");
  const [zip, setZip] = useState(billingData.zip ?? "");
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    billing_data: { company_name: companyName, ico, dic, address, city, zip },
  }));

  const [sub, setSub] = useState<SubStatus | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Read payment result from URL (?payment=success|failed)
  const [payResult, setPayResult] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p) { setPayResult(p); }
  }, []);

  useEffect(() => {
    fetch(`/api/billing/gopay/status?tenantSlug=${encodeURIComponent(tenant.slug)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setSub(d.subscription);
          setPayments(d.recent_payments ?? []);
        }
      })
      .catch(() => {});
  }, [tenant.slug]);

  async function handleSubscribe() {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch("/api/billing/gopay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: tenant.slug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Chyba při zahájení platby");
      window.location.href = data.url;
    } catch (err) {
      setPayError(String(err).replace("Error: ", ""));
      setPaying(false);
    }
  }

  const isActive = sub?.status === "active";
  const isTrial = !sub || sub.status === "trial";
  const isExpired = sub?.status === "expired" || (isTrial && (sub?.days_remaining ?? 1) <= 0);
  const days = sub?.days_remaining ?? null;

  function fmtDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <>
      <PageHeader title="Fakturace a platby" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">

        {/* Payment result banner */}
        {payResult === "success" && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2.5 text-[13px] text-emerald-800">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Platba proběhla úspěšně! Váš plán je nyní aktivní.
          </div>
        )}
        {payResult === "failed" && (
          <div className="mb-4 rounded-lg bg-[var(--vs-danger-bg)] border border-red-200 px-4 py-3 flex items-center gap-2.5 text-[13px] text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            Platba nebyla dokončena. Zkuste to prosím znovu.
          </div>
        )}

        {/* Current plan */}
        <LCard>
          <LSectionTitle>Aktuální plán</LSectionTitle>
          <div className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:gap-6">
            <div>
              {isActive ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-[var(--vs-text)]">Webero Basic</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Aktivní</span>
                  </div>
                  <p className="text-[13px] text-[var(--vs-text-muted)]">
                    Příští platba: <span className="text-[var(--vs-text-soft)] font-medium">{fmtDate(sub?.next_billing_at ?? null)} · 499 Kč</span>
                  </p>
                </>
              ) : isExpired ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-[var(--vs-text)]">Trial</span>
                    <span className="rounded-full bg-[var(--vs-danger-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--vs-danger)]">Vypršel</span>
                  </div>
                  <p className="text-[13px] text-[var(--vs-text-muted)]">Web je pozastaven. Aktivujte předplatné pro obnovu.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-[var(--vs-text)]">Trial</span>
                    <span className="rounded-full bg-[var(--vs-accent-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--vs-accent-hi)]">zdarma</span>
                  </div>
                  <p className="text-[13px] text-[var(--vs-text-muted)]">
                    {days !== null
                      ? `Zbývá ${days} ${days === 1 ? "den" : days < 5 ? "dny" : "dní"} · do ${fmtDate(sub?.trial_ends_at ?? null)}`
                      : `Platné do ${fmtDate(sub?.trial_ends_at ?? null)}`}
                  </p>
                </>
              )}
            </div>
            {!isActive && (
              <div className="flex w-full shrink-0 flex-col items-stretch gap-1 sm:w-auto sm:items-end">
                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={paying}
                  className="rounded-lg bg-[var(--vs-accent)] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-60 transition-colors flex items-center gap-1.5"
                >
                  {paying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {paying ? "Přesměrování…" : "Předplatit · 499 Kč/měs."}
                </button>
                {payError && <p className="text-[11px] text-red-500">{payError}</p>}
              </div>
            )}
          </div>

          {isActive && (
            <div className="border-t border-[var(--vs-border)] pt-4 pb-1">
              <p className="text-[12px] text-[var(--vs-text-dim)]">
                Opakovaná platba kartou přes GoPay. Pro zrušení předplatného kontaktujte podporu.
              </p>
            </div>
          )}
        </LCard>

        {/* Payment history */}
        <LCard>
          <LSectionTitle>Objednávky a platby</LSectionTitle>
          {payments.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[var(--vs-text-dim)]">Zatím žádné platby</div>
          ) : (
            <div className="divide-y divide-[var(--vs-border)]">
              {payments.map((p) => (
                <div key={p.order_number} className="flex items-center justify-between py-3 text-[13px]">
                  <div>
                    <span className="text-[var(--vs-text-soft)] font-medium">{(p.amount_cents / 100).toFixed(0)} Kč</span>
                    <span className="ml-2 text-[var(--vs-text-dim)] font-mono text-[11px]">{p.order_number}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      p.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "failed" ? "bg-[var(--vs-danger-bg)] text-[var(--vs-danger)]" :
                      "bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)]"
                    }`}>{p.status === "paid" ? "Zaplaceno" : p.status === "failed" ? "Selhalo" : p.status}</span>
                    <span className="text-[var(--vs-text-dim)] text-[11px]">{fmtDate(p.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LCard>

        {/* Billing address */}
        <LCard>
          <LSectionTitle>Fakturační údaje</LSectionTitle>
          <LFormRow label="Název firmy">
            <LInput value={companyName} onChange={setCompanyName} placeholder="Firma s.r.o." />
          </LFormRow>
          <LFormRow label="IČO">
            <LInput value={ico} onChange={setIco} placeholder="12345678" />
          </LFormRow>
          <LFormRow label="DIČ">
            <LInput value={dic} onChange={setDic} placeholder="CZ12345678" />
          </LFormRow>
          <LFormRow label="Adresa">
            <LInput value={address} onChange={setAddress} placeholder="Ulice 123" />
          </LFormRow>
          <LFormRow label="Město">
            <LInput value={city} onChange={setCity} placeholder="Praha" />
          </LFormRow>
          <LFormRow label="PSČ">
            <LInput value={zip} onChange={setZip} placeholder="110 00" />
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── INTEGRATIONS / API ───────────────────────────────────────────────────────

function ApiView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [gtmId, setGtmId] = useState(tenant.gtm_id ?? "");
  const [gaMeasurementId, setGaMeasurementId] = useState(tenant.ga_measurement_id ?? "");
  const { status, save } = useSettingsSave(tenant.slug, () => ({
    gtm_id: gtmId || null,
    ga_measurement_id: gaMeasurementId || null,
  }));

  return (
    <>
      <PageHeader title="Integrace a API" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Google Analytics</LSectionTitle>
          <LFormRow label="Google Tag Manager" help="GTM Container ID (např. GTM-XXXXXXX).">
            <LInput value={gtmId} onChange={setGtmId} placeholder="GTM-XXXXXXX" />
          </LFormRow>
          <LFormRow label="GA4 Measurement ID" help="Google Analytics 4 měřicí ID (např. G-XXXXXXXXXX).">
            <LInput value={gaMeasurementId} onChange={setGaMeasurementId} placeholder="G-XXXXXXXXXX" />
          </LFormRow>
        </LCard>
      </div>
    </>
  );
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: number;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  created_at: string;
  user_label: string | null;
}

function ActivityView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/demo/${tenant.slug}/settings/activity`)
      .then((r) => r.json())
      .then((data: { entries?: ActivityEntry[] }) => setEntries(data.entries ?? []))
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [tenant.slug]);

  return (
    <>
      <PageHeader title="Záznam aktivity" onBack={onBack} status="idle" onSave={() => void 0} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <div className="vs-chrome-card rounded-xl border">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[var(--vs-text-dim)]">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítám...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-[var(--vs-text-dim)] text-[13px]">Žádná aktivita nebyla zaznamenána.</div>
          ) : (
            <>
            <div className="space-y-3 p-3 sm:hidden">
              {entries.map((e) => (
                <div key={e.id} className="rounded-lg border border-[var(--vs-border)] bg-[rgba(255,255,255,0.035)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--vs-text-soft)]">{e.action}</p>
                      <p className="mt-0.5 text-[11.5px] text-[var(--vs-text-dim)]">
                        {new Date(e.created_at).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--vs-border)] px-2 py-0.5 text-[10.5px] text-[var(--vs-text-muted)]">
                      {e.user_label ?? "Systém"}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-[11.5px] text-[var(--vs-text-muted)]">
                    {e.entity_type ? `${e.entity_type} #${e.entity_id}` : "Bez entity"}
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
            <table className="min-w-[640px] w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Čas</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Akce</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Entita</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Uživatel</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--vs-border)] hover:bg-[var(--vs-surface-2)]/50">
                    <td className="px-4 py-2.5 text-[var(--vs-text-dim)] whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[var(--vs-text-soft)]">{e.action}</td>
                    <td className="px-4 py-2.5 text-[var(--vs-text-muted)]">{e.entity_type ? `${e.entity_type} #${e.entity_id}` : "—"}</td>
                    <td className="px-4 py-2.5 text-[var(--vs-text-muted)]">{e.user_label ?? "Systém"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── CSS CLASSES ─────────────────────────────────────────────────────────────

interface CssClass { id: number; name: string; css_class: string; description?: string; }

function CssView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [rows, setRows] = useState<CssClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCss, setNewCss] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/demo/${tenant.slug}/css-classes`)
      .then((r) => r.json())
      .then((d: { classes?: CssClass[] }) => setRows(d.classes ?? []))
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [tenant.slug]);

  async function add() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/demo/${tenant.slug}/css-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), css_class: newCss.trim() }),
      });
      if (r.ok) {
        const d = await r.json() as { cssClass?: CssClass };
        if (d.cssClass) setRows((prev) => [...prev, d.cssClass!]);
        setNewName(""); setNewCss("");
      }
    } finally { setSaving(false); }
  }

  async function remove(id: number) {
    await fetch(`/api/demo/${tenant.slug}/css-classes/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <PageHeader title="CSS třídy" onBack={onBack} status="idle" onSave={() => void 0} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Přidat CSS třídu</LSectionTitle>
          <div className="flex flex-col gap-3 pb-5 sm:flex-row">
            <LInput value={newName} onChange={setNewName} placeholder=".nazev-tridy" />
            <LInput value={newCss} onChange={setNewCss} placeholder="color: red; font-weight: bold;" />
            <button
              type="button"
              onClick={() => void add()}
              disabled={saving || !newName.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Přidat
            </button>
          </div>
        </LCard>

        <div className="vs-chrome-card rounded-xl border overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[var(--vs-text-dim)]"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Načítám...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-[var(--vs-text-dim)] text-[13px]">Žádné CSS třídy.</div>
          ) : (
            <table className="min-w-[640px] w-full text-[12.5px]">
              <thead><tr className="border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Název</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">CSS</th>
                <th className="px-4 py-3 w-10" />
              </tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--vs-border)]">
                    <td className="px-4 py-2.5 font-mono text-[var(--vs-accent-hi)]">{row.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[var(--vs-text-soft)] max-w-xs truncate">{row.css_class}</td>
                    <td className="px-4 py-2.5">
                      <button type="button" onClick={() => void remove(row.id)} className="text-[var(--vs-text-disabled)] hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ─── HTTP HEADERS ─────────────────────────────────────────────────────────────

interface HttpHeader { id: number; name: string; value: string; }

function HeadersView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [rows, setRows] = useState<HttpHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/demo/${tenant.slug}/http-headers`)
      .then((r) => r.json())
      .then((d: { headers?: HttpHeader[] }) => setRows(d.headers ?? []))
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [tenant.slug]);

  async function add() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/demo/${tenant.slug}/http-headers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), value: newValue.trim() }),
      });
      if (r.ok) {
        const d = await r.json() as { header?: HttpHeader };
        if (d.header) setRows((prev) => [...prev, d.header!]);
        setNewName(""); setNewValue("");
      }
    } finally { setSaving(false); }
  }

  async function remove(id: number) {
    await fetch(`/api/demo/${tenant.slug}/http-headers/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <PageHeader title="HTTP Hlavičky" onBack={onBack} status="idle" onSave={() => void 0} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Přidat HTTP hlavičku</LSectionTitle>
          <div className="flex flex-col gap-3 pb-5 sm:flex-row">
            <LInput value={newName} onChange={setNewName} placeholder="X-Custom-Header" />
            <LInput value={newValue} onChange={setNewValue} placeholder="hodnota" />
            <button
              type="button"
              onClick={() => void add()}
              disabled={saving || !newName.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Přidat
            </button>
          </div>
        </LCard>

        <div className="vs-chrome-card rounded-xl border overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[var(--vs-text-dim)]"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Načítám...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-[var(--vs-text-dim)] text-[13px]">Žádné HTTP hlavičky.</div>
          ) : (
            <table className="min-w-[640px] w-full text-[12.5px]">
              <thead><tr className="border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Název</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Hodnota</th>
                <th className="px-4 py-3 w-10" />
              </tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--vs-border)]">
                    <td className="px-4 py-2.5 font-mono text-[var(--vs-text-soft)]">{row.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[var(--vs-text-muted)] max-w-xs truncate">{row.value}</td>
                    <td className="px-4 py-2.5">
                      <button type="button" onClick={() => void remove(row.id)} className="text-[var(--vs-text-disabled)] hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ─── REDIRECTS ────────────────────────────────────────────────────────────────

interface Redirect { id: number; from_path: string; to_path: string; status_code: number; }

function RedirectsView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const [rows, setRows] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newCode, setNewCode] = useState("301");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/demo/${tenant.slug}/redirects`)
      .then((r) => r.json())
      .then((d: { redirects?: Redirect[] }) => setRows(d.redirects ?? []))
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [tenant.slug]);

  async function add() {
    if (!newFrom.trim() || !newTo.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/demo/${tenant.slug}/redirects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_path: newFrom.trim(), to_path: newTo.trim(), status_code: parseInt(newCode) }),
      });
      if (r.ok) {
        const d = await r.json() as { redirect?: Redirect };
        if (d.redirect) setRows((prev) => [...prev, d.redirect!]);
        setNewFrom(""); setNewTo("");
      }
    } finally { setSaving(false); }
  }

  async function remove(id: number) {
    await fetch(`/api/demo/${tenant.slug}/redirects/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <>
      <PageHeader title="Přesměrování" onBack={onBack} status="idle" onSave={() => void 0} />
      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
        <LCard>
          <LSectionTitle>Přidat přesměrování</LSectionTitle>
          <div className="flex flex-col gap-3 pb-5 sm:flex-row items-end">
            <div className="flex-1"><p className="text-[11.5px] text-[var(--vs-text-dim)] mb-1">Z</p><LInput value={newFrom} onChange={setNewFrom} placeholder="/stara-stranka" /></div>
            <div className="flex-1"><p className="text-[11.5px] text-[var(--vs-text-dim)] mb-1">Na</p><LInput value={newTo} onChange={setNewTo} placeholder="/nova-stranka" /></div>
            <div className="w-full sm:w-24">
              <p className="text-[11.5px] text-[var(--vs-text-dim)] mb-1">Kód</p>
              <select
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2 py-2 text-[13px] text-[var(--vs-text)] focus:border-[var(--vs-accent)] focus:outline-none"
              >
                <option value="301">301</option>
                <option value="302">302</option>
                <option value="307">307</option>
                <option value="308">308</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => void add()}
              disabled={saving || !newFrom.trim() || !newTo.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--vs-accent)] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[var(--vs-accent-solid)] disabled:opacity-40 transition-colors mb-0"
            >
              <Plus className="h-3.5 w-3.5" /> Přidat
            </button>
          </div>
        </LCard>

        <div className="vs-chrome-card rounded-xl border overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[var(--vs-text-dim)]"><Loader2 className="h-4 w-4 animate-spin mr-2" /> Načítám...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-[var(--vs-text-dim)] text-[13px]">Žádná přesměrování.</div>
          ) : (
            <table className="min-w-[640px] w-full text-[12.5px]">
              <thead><tr className="border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Z</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Na</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--vs-text-muted)]">Kód</th>
                <th className="px-4 py-3 w-10" />
              </tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--vs-border)]">
                    <td className="px-4 py-2.5 font-mono text-[var(--vs-text-soft)]">{row.from_path}</td>
                    <td className="px-4 py-2.5 font-mono text-[var(--vs-text-muted)]">{row.to_path}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-[var(--vs-accent-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--vs-accent-hi)]">{row.status_code}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <button type="button" onClick={() => void remove(row.id)} className="text-[var(--vs-text-disabled)] hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ─── IDENTITA ────────────────────────────────────────────────────────────────

const GOOGLE_FONTS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito",
  "Raleway", "Playfair Display", "Merriweather", "Source Sans 3", "DM Sans",
  "Figtree", "Josefin Sans", "Cormorant Garamond", "Bricolage Grotesque",
] as const;

function LColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--vs-border)] shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-transform">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="h-full w-full" style={{ background: value }} />
      </div>
      <div className="flex-1">
        <p className="text-[12px] font-medium text-[var(--vs-text-soft)] mb-0.5">{label}</p>
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v); }}
          className="w-24 max-w-full rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2 py-1 text-[12px] font-mono text-[var(--vs-text-soft)] focus:border-[var(--vs-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--vs-accent)]/20"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function LLogoUpload({ slug, value, onChange, label, hint }: { slug: string; value: string; onChange: (url: string) => void; label: string; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/demo/${slug}/upload-image`, { method: "POST", body: fd });
      if (res.ok) {
        const d = await res.json() as { url?: string };
        if (d.url) onChange(d.url);
      }
    } finally { setUploading(false); }
  }

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--vs-text-soft)] mb-2">{label}</p>
      {hint && <p className="text-[11.5px] text-[var(--vs-text-dim)] mb-2">{hint}</p>}
      <div
        className={`relative flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${value ? "border-[var(--vs-border)] bg-[var(--vs-bg-soft)]" : "border-[var(--vs-border-strong)] bg-[var(--vs-accent-bg)]/40 hover:border-[var(--vs-accent)] hover:bg-[var(--vs-accent-bg)]"}`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="max-h-14 max-w-[160px] object-contain" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow hover:bg-[var(--vs-danger-bg)] text-[var(--vs-text-dim)] hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[var(--vs-accent)]" />
        ) : (
          <>
            <Upload className="h-5 w-5 text-[var(--vs-accent)]" />
            <span className="text-[12px] text-[var(--vs-accent)] font-medium">Nahrát logo</span>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*,.svg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
      </div>
    </div>
  );
}

function useDataSlotsSave(slug: string) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [values, setValues] = useState<Record<string, string>>({});
  const [initial, setInitial] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/demo/${slug}/data-slots`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { slots: Array<{ slot_key: string; value: unknown }> }) => {
        const map: Record<string, string> = {};
        for (const s of d.slots) {
          map[s.slot_key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
        }
        setValues(map);
        setInitial(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  function setSlot(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setStatus("saving");
    try {
      const dirty = Object.entries(values).filter(([k, v]) => initial[k] !== v);
      if (dirty.length > 0) {
        const res = await fetch(`/api/demo/${slug}/data-slots`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: dirty.map(([key, value]) => ({ key, value })) }),
        });
        if (!res.ok) throw new Error("save failed");
        setInitial(values);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  return { values, setSlot, save, status, loading };
}

function IdentitaView({ tenant, onBack }: { tenant: Tenant; onBack: () => void }) {
  const { values: v, setSlot, save, status, loading } = useDataSlotsSave(tenant.slug);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--vs-text-dim)]" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Identita značky" onBack={onBack} status={status} onSave={save} />
      <div className="max-w-2xl mx-auto px-4 py-4 sm:px-8 sm:py-6">

        {/* Branding */}
        <LCard>
          <LSectionTitle>Branding</LSectionTitle>
          <LFormRow label="Název firmy" help="Zobrazí se v záhlaví webu a v SEO titulcích.">
            <LInput value={v["brand.name"] ?? ""} onChange={(x) => setSlot("brand.name", x)} placeholder="Název vaší firmy" />
          </LFormRow>
          <LFormRow label="Tagline" help="Krátký popis nebo motto vaší značky.">
            <LInput value={v["brand.tagline"] ?? ""} onChange={(x) => setSlot("brand.tagline", x)} placeholder="Váš slogan..." />
          </LFormRow>
          <LFormRow label="Logo" help="Formát PNG, SVG nebo WebP.">
            <LLogoUpload slug={tenant.slug} value={v["brand.logoUrl"] ?? ""} onChange={(x) => setSlot("brand.logoUrl", x)} label="" />
          </LFormRow>
          <LFormRow label="Primární barva">
            <LColorPicker value={v["brand.colorPrimary"] || "var(--vs-accent-solid)"} onChange={(x) => setSlot("brand.colorPrimary", x)} label="Primární" />
          </LFormRow>
          <LFormRow label="Akcentová barva">
            <LColorPicker value={v["brand.colorAccent"] || "var(--vs-accent-solid)"} onChange={(x) => setSlot("brand.colorAccent", x)} label="Akcentová" />
          </LFormRow>
        </LCard>

        {/* Kontakt */}
        <LCard>
          <LSectionTitle>Kontakt</LSectionTitle>
          <LFormRow label="Telefon">
            <LInput value={v["contact.phone"] ?? ""} onChange={(x) => setSlot("contact.phone", x)} placeholder="+420 777 123 456" type="tel" />
          </LFormRow>
          <LFormRow label="E-mail">
            <LInput value={v["contact.email"] ?? ""} onChange={(x) => setSlot("contact.email", x)} placeholder="info@firma.cz" type="email" />
          </LFormRow>
          <LFormRow label="Adresa">
            <LInput value={v["contact.address"] ?? ""} onChange={(x) => setSlot("contact.address", x)} placeholder="Ulice 123" />
          </LFormRow>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[var(--vs-border)]">
            <div>
              <p className="text-[13px] font-medium text-[var(--vs-text-soft)] mb-1.5">Město</p>
              <LInput value={v["contact.city"] ?? ""} onChange={(x) => setSlot("contact.city", x)} placeholder="Praha" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--vs-text-soft)] mb-1.5">PSČ</p>
              <LInput value={v["contact.zip"] ?? ""} onChange={(x) => setSlot("contact.zip", x)} placeholder="110 00" />
            </div>
          </div>
        </LCard>

        {/* Otevírací doba */}
        <LCard>
          <LSectionTitle>Otevírací doba</LSectionTitle>
          {([
            ["hours.monday",    "Pondělí"],
            ["hours.tuesday",   "Úterý"],
            ["hours.wednesday", "Středa"],
            ["hours.thursday",  "Čtvrtek"],
            ["hours.friday",    "Pátek"],
            ["hours.saturday",  "Sobota"],
            ["hours.sunday",    "Neděle"],
          ] as [string, string][]).map(([key, label]) => (
            <LFormRow key={key} label={label}>
              <LInput value={v[key] ?? ""} onChange={(x) => setSlot(key, x)} placeholder="8:00 – 17:00" />
            </LFormRow>
          ))}
        </LCard>

        {/* Sociální sítě */}
        <LCard>
          <LSectionTitle>Sociální sítě</LSectionTitle>
          {([
            ["social.facebook",  "Facebook",  "https://facebook.com/..."],
            ["social.instagram", "Instagram", "https://instagram.com/..."],
            ["social.linkedin",  "LinkedIn",  "https://linkedin.com/..."],
            ["social.youtube",   "YouTube",   "https://youtube.com/..."],
            ["social.tiktok",    "TikTok",    "https://tiktok.com/@..."],
          ] as [string, string, string][]).map(([key, label, ph]) => (
            <LFormRow key={key} label={label}>
              <LInput value={v[key] ?? ""} onChange={(x) => setSlot(key, x)} placeholder={ph} type="url" />
            </LFormRow>
          ))}
        </LCard>

        {/* Firma */}
        <LCard>
          <LSectionTitle>Firma</LSectionTitle>
          <LFormRow label="IČO">
            <LInput value={v["company.ico"] ?? ""} onChange={(x) => setSlot("company.ico", x)} placeholder="12345678" />
          </LFormRow>
          <LFormRow label="DIČ">
            <LInput value={v["company.dic"] ?? ""} onChange={(x) => setSlot("company.dic", x)} placeholder="CZ12345678" />
          </LFormRow>
          <LFormRow label="Obchodní název" help="Celý právní název firmy.">
            <LInput value={v["company.legalName"] ?? ""} onChange={(x) => setSlot("company.legalName", x)} placeholder="Firma s.r.o." />
          </LFormRow>
        </LCard>

        {/* SEO výchozí */}
        <LCard>
          <LSectionTitle>SEO výchozí</LSectionTitle>
          <LFormRow label="Výchozí title" help="Použije se, pokud stránka nemá vlastní titulek.">
            <LInput value={v["seo.defaultTitle"] ?? ""} onChange={(x) => setSlot("seo.defaultTitle", x)} placeholder="Název firmy" />
          </LFormRow>
          <LFormRow label="Výchozí popis" help="Meta description pro stránky bez vlastního popisu.">
            <LTextarea value={v["seo.defaultDescription"] ?? ""} onChange={(x) => setSlot("seo.defaultDescription", x)} placeholder="Stručný popis webu..." rows={3} />
          </LFormRow>
          <LFormRow label="OG Image URL" help="Výchozí obrázek pro sdílení na sociálních sítích.">
            <LInput value={v["seo.ogImage"] ?? ""} onChange={(x) => setSlot("seo.ogImage", x)} placeholder="https://..." type="url" />
          </LFormRow>
        </LCard>

      </div>
    </>
  );
}

// ─── Main canvas component ────────────────────────────────────────────────────

const VIEW_LABELS: Record<string, string> = {
  identita: "Identita", web: "Web", domain: "Doména", seo: "SEO", cookies: "Cookie lišta", access: "Přístupy",
  languages: "Jazyky", emails: "E-maily", billing: "Fakturace",
  api: "Integrace", activity: "Aktivita", css: "CSS třídy",
  headers: "HTTP Hlavičky", redirects: "Přesměrování",
};

export function StudioSettingsCanvas({ state }: { state: StudioState }) {
  const studio = useStudio();
  const view = studio.settingsView;
  const tenant = state.tenant;

  function onBack() { studio.setSettingsView(null); }

  if (!view) return null;

  const props = { tenant, onBack };

  return (
    <div className="h-full overflow-x-hidden overflow-y-auto vs-canvas-deep">
      {view === "identita"  && <IdentitaView  {...props} />}
      {view === "web"       && <WebView       {...props} />}
      {view === "domain"    && <DomainView    {...props} />}
      {view === "seo"       && <SeoView       {...props} />}
      {view === "cookies"   && <CookiesView   {...props} />}
      {view === "access"    && <AccessView    {...props} />}
      {view === "languages" && <LanguagesView {...props} />}
      {view === "emails"    && <EmailsView    {...props} />}
      {view === "billing"   && <BillingView   {...props} />}
      {view === "api"       && <ApiView       {...props} />}
      {view === "activity"  && <ActivityView  {...props} />}
      {view === "css"       && <CssView       {...props} />}
      {view === "headers"   && <HeadersView   {...props} />}
      {view === "redirects" && <RedirectsView {...props} />}
      {!VIEW_LABELS[view] && (
        <div className="flex flex-col items-center justify-center h-full text-[var(--vs-text-dim)]">
          <p className="text-[13px]">Neznámé nastavení: <strong>{view}</strong></p>
          <button type="button" onClick={onBack} className="mt-3 text-[var(--vs-accent)] text-[13px] hover:underline">← Zpět</button>
        </div>
      )}
    </div>
  );
}
