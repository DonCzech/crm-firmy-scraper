"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save, Loader2, Mail, FileText, Globe, Image as ImageIcon, ShieldCheck,
  Clock, History, Trash2, RotateCcw, MailOpen, MailCheck, ExternalLink,
} from "lucide-react";
import "../../studio/design-tokens.css";

/* ============================================================================
   Native drawer panels — replace the iframe placeholder for SEO, Zprávy, Verze
   and Audit drawers. Each component fetches its own data, supports inline
   editing/actions and persists via the existing tenant API endpoints. All
   use the shared cinematic dark tokens for visual consistency.
   ============================================================================ */

// ── SEO panel — per-page title/description/OG image/noindex form ──────────
interface SeoPage {
  id: number;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean;
}

export function SeoPanel({ tenantSlug }: { tenantSlug: string }) {
  const [pages, setPages] = useState<SeoPage[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/pages`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { pages: SeoPage[] };
        setPages(json.pages);
        setActiveId(json.pages[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Načtení selhalo");
      }
    })();
  }, [tenantSlug]);

  const active = pages?.find(p => p.id === activeId) ?? null;

  function updateActive(patch: Partial<SeoPage>) {
    if (!active) return;
    setPages(prev => prev?.map(p => p.id === active.id ? { ...p, ...patch } : p) ?? null);
  }

  const save = useCallback(async () => {
    if (!pages) return;
    setSaveState("saving");
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/seo`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pages: pages.map(p => ({
            id: p.id,
            seo_title: p.seo_title || null,
            seo_description: p.seo_description || null,
            og_image: p.og_image || null,
            noindex: p.noindex,
          })),
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setSaveState("saved");
      setTimeout(() => setSaveState(s => s === "saved" ? "idle" : s), 1500);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Uložení selhalo");
    }
  }, [pages, tenantSlug]);

  if (error && !pages) {
    return <ErrorState message={error} />;
  }
  if (!pages) {
    return <LoadingState />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page selector */}
      <div className="shrink-0 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-2 vs-scroll overflow-x-auto">
        <div className="flex gap-1">
          {pages.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(p.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-tight transition-[background,color] duration-100 ${
                activeId === p.id
                  ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
                  : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
              }`}
            >
              <FileText className="h-3 w-3" strokeWidth={1.75} />
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto vs-scroll p-4 space-y-4">
        {active && (
          <>
            <FormField
              label="SEO title"
              icon={<Globe className="h-3 w-3" />}
              hint="50–60 znaků, viditelné v Google výsledcích"
            >
              <input
                type="text"
                value={active.seo_title ?? ""}
                onChange={e => updateActive({ seo_title: e.target.value })}
                placeholder={active.title}
                maxLength={200}
                className="vs-input"
              />
              <CounterHint value={(active.seo_title ?? "").length} target={60} />
            </FormField>

            <FormField
              label="Meta description"
              icon={<FileText className="h-3 w-3" />}
              hint="120–160 znaků, podporuje CTR"
            >
              <textarea
                value={active.seo_description ?? ""}
                onChange={e => updateActive({ seo_description: e.target.value })}
                placeholder="Popis stránky, co návštěvník dostane…"
                maxLength={300}
                rows={3}
                className="vs-input resize-none"
              />
              <CounterHint value={(active.seo_description ?? "").length} target={160} />
            </FormField>

            <FormField
              label="Open Graph obrázek"
              icon={<ImageIcon className="h-3 w-3" />}
              hint="1200×630 px, formát JPG/PNG/WebP"
            >
              <input
                type="url"
                value={active.og_image ?? ""}
                onChange={e => updateActive({ og_image: e.target.value })}
                placeholder="/assets/<key>/og-image.webp"
                className="vs-input"
              />
              {active.og_image && (
                <div className="mt-2 overflow-hidden rounded-md border border-[var(--vs-border-strong)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={active.og_image} alt="OG preview" className="block aspect-[1.91/1] w-full object-cover" />
                </div>
              )}
            </FormField>

            <FormField
              label="Indexace"
              icon={<ShieldCheck className="h-3 w-3" />}
              hint="Pokud zaškrtnuto, vyhledávače stránku ignorují"
            >
              <label className="flex items-center gap-2 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!active.noindex}
                  onChange={e => updateActive({ noindex: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[var(--vs-accent)]"
                />
                <span className="text-[11.5px] text-[var(--vs-text-soft)]">Skrýt před vyhledávači (noindex)</span>
              </label>
            </FormField>

            <PreviewCard
              title={active.seo_title || active.title}
              description={active.seo_description || "Popis stránky, který se objeví ve výsledcích vyhledávání."}
              host={`webero.co/demo/${tenantSlug}`}
              path={active.slug === "home" ? "" : `/${active.slug}`}
            />
          </>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-2.5">
        <SaveStatusInline state={saveState} />
        <button
          type="button"
          onClick={save}
          disabled={saveState === "saving"}
          className="vs-grad-accent inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold tracking-tight text-white disabled:opacity-60"
        >
          {saveState === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Uložit
        </button>
      </div>
      <style>{`
        .vs-input {
          width: 100%;
          background: var(--vs-bg-soft);
          border: 1px solid var(--vs-border-strong);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12.5px;
          color: var(--vs-text);
          outline: none;
          transition: border-color 100ms, box-shadow 150ms;
        }
        .vs-input::placeholder { color: var(--vs-text-dim); }
        .vs-input:focus {
          border-color: var(--vs-accent);
          box-shadow: 0 0 0 3px var(--vs-accent-bg);
        }
      `}</style>
    </div>
  );
}

// ── Messages panel — incoming contact form submissions ─────────────────────
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export function MessagesPanel({ tenantSlug }: { tenantSlug: string }) {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/contact`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json() as { messages: ContactMessage[] };
      setMessages(json.messages ?? []);
      if (json.messages?.[0]) setActiveId((id) => id ?? json.messages[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Načtení selhalo");
    }
  }, [tenantSlug]);

  useEffect(() => { void reload(); }, [reload]);

  async function setStatus(id: number, status: ContactMessage["status"]) {
    setBusy(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await reload();
    } finally { setBusy(false); }
  }

  async function remove(id: number) {
    if (!window.confirm("Smazat tuto zprávu?")) return;
    setBusy(true);
    try {
      await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (activeId === id) setActiveId(null);
      await reload();
    } finally { setBusy(false); }
  }

  if (error && !messages) return <ErrorState message={error} />;
  if (!messages) return <LoadingState />;
  if (messages.length === 0) {
    return (
      <EmptyState
        Icon={Mail}
        title="Žádné zprávy"
        description="Když někdo odešle kontaktní formulář, zpráva se objeví tady."
      />
    );
  }

  const active = messages.find(m => m.id === activeId) ?? messages[0];

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex w-44 shrink-0 flex-col overflow-y-auto border-r border-[var(--vs-border)] bg-[var(--vs-bg-soft)] vs-scroll">
        {messages.map(m => {
          const isActive = m.id === active.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className={`group flex flex-col gap-0.5 border-b border-[var(--vs-border)] px-2.5 py-2 text-left transition-colors ${
                isActive ? "bg-[var(--vs-surface-2)]" : "hover:bg-[var(--vs-surface-2)]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {m.status === "new" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--vs-accent-hi)]" />}
                <span className="truncate text-[11.5px] font-medium text-[var(--vs-text)]">{m.name || m.email}</span>
              </div>
              <span className="truncate text-[10px] text-[var(--vs-text-muted)]">{m.message.slice(0, 32)}…</span>
              <span className="text-[9.5px] text-[var(--vs-text-dim)]">{new Date(m.created_at).toLocaleString("cs")}</span>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div className="flex flex-1 flex-col overflow-y-auto vs-scroll p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[14px] font-semibold tracking-tight text-[var(--vs-text)]">{active.name}</h3>
              {active.status === "new" && <span className="rounded-full bg-[var(--vs-accent-bg)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-accent-hi)]">nová</span>}
              {active.status === "read" && <span className="rounded-full bg-[var(--vs-surface-2)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-text-muted)]">přečtená</span>}
              {active.status === "replied" && <span className="rounded-full bg-[var(--vs-success-bg)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-success)]">odpovězeno</span>}
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[var(--vs-text-muted)]">
              <a href={`mailto:${active.email}`} className="hover:text-[var(--vs-accent-hi)]">{active.email}</a>
              {active.phone && <a href={`tel:${active.phone}`} className="hover:text-[var(--vs-accent-hi)]">{active.phone}</a>}
              <span>{new Date(active.created_at).toLocaleString("cs")}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 whitespace-pre-wrap rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] p-3 text-[12.5px] leading-relaxed text-[var(--vs-text-soft)]">
          {active.message}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {active.status === "new" && (
              <ActionBtn onClick={() => setStatus(active.id, "read")} disabled={busy}>
                <MailOpen className="h-3 w-3" strokeWidth={2} />
                Označit přečtené
              </ActionBtn>
            )}
            {active.status !== "replied" && (
              <ActionBtn onClick={() => setStatus(active.id, "replied")} disabled={busy} variant="success">
                <MailCheck className="h-3 w-3" strokeWidth={2} />
                Odpovězeno
              </ActionBtn>
            )}
            <ActionBtn onClick={() => remove(active.id)} disabled={busy} variant="danger">
              <Trash2 className="h-3 w-3" strokeWidth={2} />
              Smazat
            </ActionBtn>
          </div>
          <a
            href={`mailto:${active.email}?subject=Re:%20${encodeURIComponent("Vaše zpráva")}`}
            className="vs-grad-accent inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold text-white"
          >
            <Mail className="h-3 w-3" />
            Odpovědět e-mailem
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Revisions panel — historic snapshots with restore ──────────────────────
interface Revision {
  id: number;
  page_id: number;
  page_title?: string;
  created_at: string;
  created_by?: string | null;
  section_count?: number;
}

export function RevisionsPanel({ tenantSlug }: { tenantSlug: string }) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/revisions`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { revisions: Revision[] };
        setRevisions(json.revisions ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Načtení selhalo");
      }
    })();
  }, [tenantSlug]);

  async function restore(id: number) {
    if (!window.confirm("Obnovit tuto verzi? Aktuální stav se přepíše.")) return;
    setBusyId(id);
    try {
      const r = await fetch(`/api/demo/${tenantSlug}/revisions/${id}/restore`, { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Obnovení selhalo");
    } finally { setBusyId(null); }
  }

  if (error && !revisions) return <ErrorState message={error} />;
  if (!revisions) return <LoadingState />;
  if (revisions.length === 0) {
    return (
      <EmptyState
        Icon={History}
        title="Žádné verze"
        description="Verze se ukládají automaticky před každou významnou změnou."
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto vs-scroll">
      <div className="space-y-1.5 p-3">
        {revisions.map((r, idx) => (
          <div
            key={r.id}
            className="vs-lift group flex items-center gap-3 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-3 py-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)] group-hover:bg-[var(--vs-accent-bg)] group-hover:text-[var(--vs-accent-hi)]">
              <Clock className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-[var(--vs-text)]">
                  {r.page_title ?? `Stránka #${r.page_id}`}
                </span>
                {idx === 0 && (
                  <span className="rounded-full bg-[var(--vs-accent-bg)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--vs-accent-hi)]">
                    aktuální
                  </span>
                )}
              </div>
              <div className="text-[10.5px] text-[var(--vs-text-muted)]">
                {new Date(r.created_at).toLocaleString("cs")}
                {r.created_by && <> · {r.created_by}</>}
                {typeof r.section_count === "number" && <> · {r.section_count} sekcí</>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void restore(r.id)}
              disabled={idx === 0 || busyId === r.id}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2.5 text-[11px] font-medium text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] disabled:opacity-30 disabled:hover:bg-[var(--vs-surface)]"
            >
              {busyId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" strokeWidth={1.75} />}
              Obnovit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Audit panel — chronological action log ────────────────────────────────
interface AuditEvent {
  id: number;
  action: string;
  target_type: string | null;
  target_id: string | null;
  actor_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
  section_updated:               { label: "Sekce upravena",   tone: "accent" },
  section_overrides_reset:       { label: "Reset sekce",      tone: "warning" },
  sections_saved:                { label: "Uloženo",          tone: "success" },
  section_deleted:               { label: "Sekce smazána",    tone: "danger" },
  data_slots_updated:            { label: "Brand data",       tone: "accent" },
  data_slot_deleted:             { label: "Slot smazán",      tone: "warning" },
  page_created:                  { label: "Stránka přidána",  tone: "success" },
  page_updated:                  { label: "Stránka upravena", tone: "accent" },
  page_deleted:                  { label: "Stránka smazána",  tone: "danger" },
  tenant_published_to_homepage:  { label: "Web spuštěn",      tone: "success" },
  tenant_changed_template:       { label: "Změna designu",    tone: "accent" },
  media_uploaded:                { label: "Obrázek nahrán",   tone: "neutral" },
};

export function AuditPanel({ tenantSlug }: { tenantSlug: string }) {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/demo/${tenantSlug}/audit`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json() as { events: AuditEvent[] };
        setEvents(json.events ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Načtení selhalo");
      }
    })();
  }, [tenantSlug]);

  if (error && !events) return <ErrorState message={error} />;
  if (!events) return <LoadingState />;
  if (events.length === 0) {
    return (
      <EmptyState
        Icon={ShieldCheck}
        title="Zatím žádné záznamy"
        description="Každá změna ve studiu se sem zapíše s časem a autorem."
      />
    );
  }

  return (
    <div className="overflow-y-auto vs-scroll">
      <ol className="relative px-3 py-3">
        {/* Vertical timeline line */}
        <span aria-hidden className="absolute left-[19px] top-3 bottom-3 w-px bg-[var(--vs-border)]" />
        {events.map((e) => {
          const meta = ACTION_LABELS[e.action] ?? { label: e.action, tone: "neutral" as const };
          return (
            <li key={e.id} className="relative mb-3 pl-9">
              <span
                className="absolute left-[14px] top-1.5 h-2.5 w-2.5 rounded-full"
                style={{
                  background:
                    meta.tone === "accent" ? "var(--vs-accent-hi)" :
                    meta.tone === "success" ? "var(--vs-success)" :
                    meta.tone === "warning" ? "var(--vs-warning)" :
                    meta.tone === "danger" ? "var(--vs-danger)" :
                    "var(--vs-text-dim)",
                  boxShadow: "0 0 0 2px var(--vs-bg)",
                }}
              />
              <div className="rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-medium text-[var(--vs-text)]">{meta.label}</span>
                  <span className="text-[10px] text-[var(--vs-text-dim)]">{new Date(e.created_at).toLocaleString("cs")}</span>
                </div>
                {(e.target_type || e.actor_email) && (
                  <div className="mt-1 text-[10.5px] text-[var(--vs-text-muted)]">
                    {e.target_type && <code className="rounded bg-[var(--vs-surface-2)] px-1 py-px text-[10px]">{e.target_type}{e.target_id ? `#${e.target_id}` : ""}</code>}
                    {e.actor_email && <> · {e.actor_email}</>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Building blocks ────────────────────────────────────────────────────────
function FormField({
  label, icon, hint, children,
}: { label: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
        {icon}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10.5px] text-[var(--vs-text-dim)]">{hint}</p>}
    </div>
  );
}

function CounterHint({ value, target }: { value: number; target: number }) {
  const over = value > target;
  return (
    <p className={`mt-1 text-[10px] ${over ? "text-[var(--vs-warning)]" : "text-[var(--vs-text-dim)]"}`}>
      {value}/{target} znaků {over && "(příliš dlouhé)"}
    </p>
  );
}

function PreviewCard({
  title, description, host, path,
}: { title: string; description: string; host: string; path: string }) {
  return (
    <div className="mt-2 rounded-md border border-[var(--vs-border-strong)] bg-white/95 p-3 shadow-[var(--vs-shadow-md)]">
      <div className="text-[10.5px] text-emerald-700 tracking-tight">{host}{path}</div>
      <div className="mt-0.5 text-[15px] font-medium leading-snug text-blue-700">{title}</div>
      <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-gray-700">{description}</div>
      <p className="mt-1.5 text-[9.5px] uppercase tracking-wider text-gray-400">Náhled v Google</p>
    </div>
  );
}

function SaveStatusInline({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "saving") return <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--vs-warning)]"><Loader2 className="h-3 w-3 animate-spin" /> Ukládám…</span>;
  if (state === "saved")  return <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--vs-success)]"><Save className="h-3 w-3" /> Uloženo</span>;
  if (state === "error")  return <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--vs-danger)]">Chyba ukládání</span>;
  return <span className="text-[10.5px] text-[var(--vs-text-dim)]">Změny se neukládají automaticky.</span>;
}

function ActionBtn({
  children, onClick, disabled, variant = "default",
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "default" | "success" | "danger" }) {
  const base = "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-[background,color] duration-100";
  const variants = {
    default: "border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] text-[var(--vs-text-soft)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]",
    success: "bg-[var(--vs-success-bg)] text-[var(--vs-success)] ring-1 ring-inset ring-[rgba(52,211,153,0.30)] hover:bg-[rgba(52,211,153,0.18)]",
    danger:  "bg-[var(--vs-danger-bg)]  text-[var(--vs-danger)]  ring-1 ring-inset ring-[rgba(248,113,113,0.30)] hover:bg-[rgba(248,113,113,0.18)]",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} disabled:opacity-50`}>
      {children}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center text-[12px] text-[var(--vs-text-muted)]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Načítám…
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-[12px] text-[var(--vs-danger)]">{message}</p>
    </div>
  );
}

function EmptyState({
  Icon, title, description,
}: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--vs-surface)] ring-1 ring-[var(--vs-border-strong)] shadow-[var(--vs-shadow-md)]">
        <Icon className="h-5 w-5 text-[var(--vs-text-muted)]" strokeWidth={1.5} />
      </div>
      <h4 className="text-[13px] font-semibold text-[var(--vs-text)]">{title}</h4>
      <p className="mt-1.5 max-w-[260px] text-[11.5px] leading-snug text-[var(--vs-text-muted)]">{description}</p>
    </div>
  );
}
