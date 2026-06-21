"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Monitor, Smartphone, RefreshCw, ExternalLink, CheckCircle2,
  AlertTriangle, Loader2, Rocket, Edit3, Image as ImageIcon, Type, FileText,
  ChevronDown, Copy, Check, KeyRound, Wand2, AlertCircle, Lightbulb,
} from "lucide-react";

interface TemplateRow {
  id: number;
  key: string;
  name: string;
  industry: string;
  current_version: string;
  review_status: "pending" | "reviewed" | "approved" | "blocked";
  review_notes: string | null;
  reviewed_at: string | null;
  reviewer_email: string | null;
  assigned_date: string | null;
  review_checklist: Record<string, boolean> | null;
  last_perf_score: number | null;
  last_residue_count: number | null;
  v2_tenant_count: number;
  primary_tenant_slug: string | null;
  primary_tenant_token: string | null;
}

interface AuditNotes {
  done: string[];
  todo: string[];
  hints: string[];
  generatedAt: string;
}

interface ScanReport {
  key: string;
  tenant: string | null;
  residue: {
    diskCount: number;
    diskFindings: Array<{ file: string; pattern: string; count: number; sample: string }>;
    renderFindings: Array<{ pattern: string; count: number }>;
  };
  perf: {
    elapsed?: number;
    bytesKb?: number;
    inlineCssBytes?: number;
    inlineJsBytes?: number;
    imgs?: number;
    lazyImgs?: number;
    jsonLd?: number;
    ogTags?: number;
    hasViewport?: boolean;
    hasDescription?: boolean;
    h1Count?: number;
    issues?: string[];
    score?: number;
    error?: string;
  } | null;
}

const CHECKLIST_ITEMS = [
  { id: "desktop_rendering", label: "Desktop renderování OK",        Icon: Monitor },
  { id: "mobile_rendering",  label: "Mobile renderování OK",         Icon: Smartphone },
  { id: "no_original_text",  label: "Žádný původní text z konkurence", Icon: Type },
  { id: "no_original_imgs",  label: "Obrázky unikátní (žádné z konkurence)", Icon: ImageIcon },
  { id: "sections_work",     label: "Všechny sekce fungují",          Icon: CheckCircle2 },
  { id: "sections_toggle",   label: "Sekce lze vypínat a zapínat",    Icon: Edit3 },
  { id: "sections_reorder",  label: "Sekce lze přesouvat",            Icon: Edit3 },
  { id: "editor_clickable",  label: "Klikací editor funguje",         Icon: Edit3 },
  { id: "pagespeed_ok",      label: "PageSpeed score ≥ 80",           Icon: Rocket },
  { id: "seo_complete",      label: "SEO (title, meta, JSON-LD, h1)", Icon: FileText },
];

export function TemplateReviewClient({ templateKey }: { templateKey: string }) {
  const [tpl, setTpl] = useState<TemplateRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<"both" | "desktop" | "mobile">("both");
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanReport | null>(null);
  const [scanning, setScanning] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const [auditNotes, setAuditNotes] = useState<AuditNotes | null>(null);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedAt, setSavedAt] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((c) => c === label ? null : c), 1500);
    } catch {}
  }

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/template-queue?all=1`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) { window.location.href = "/admin/login?next=" + encodeURIComponent(`/admin/template-queue/${templateKey}`); return; }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      const found = (json.items as TemplateRow[]).find((r) => r.key === templateKey);
      if (!found) throw new Error("Šablona neexistuje");
      setTpl(found);

      // Try to parse stored review_notes as AuditNotes JSON; fall back to plain text
      try {
        if (found.review_notes && found.review_notes.startsWith("{")) {
          setAuditNotes(JSON.parse(found.review_notes) as AuditNotes);
          setNotes("");
        } else {
          setNotes(found.review_notes ?? "");
        }
      } catch { setNotes(found.review_notes ?? ""); }

      setChecklist((found.review_checklist as Record<string, boolean>) ?? {});
      if (found.primary_tenant_slug) setPreviewSlug(found.primary_tenant_slug);

      // Scan in background — display results when ready
      const tenantRes = await fetch(`/api/admin/template-queue/${templateKey}/scan`, { method: "POST" });
      if (tenantRes.ok) {
        const sc = await tenantRes.json() as ScanReport;
        setScan(sc);
        if (sc.tenant && !found.primary_tenant_slug) setPreviewSlug(sc.tenant);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba načtení");
    } finally {
      setLoading(false);
    }
  }, [templateKey]);

  useEffect(() => { void reload(); }, [reload]);

  async function runScan() {
    setScanning(true);
    try {
      const res = await fetch(`/api/admin/template-queue/${templateKey}/scan`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setScan(json);
      if (json.tenant) setPreviewSlug(json.tenant);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sken selhal");
    } finally {
      setScanning(false);
    }
  }

  async function runAutoFix() {
    if (!confirm("Spustit auto-fix? Provede: cleanup residuí, download externích assetů, re-seed do DB, vyčištění starých overrides.")) return;
    setAutoFixing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/template-queue/${templateKey}/auto-fix`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.scan) setScan({
        key: templateKey,
        tenant: json.tenantSlug,
        residue: { diskCount: json.scan.residueDisk, diskFindings: [], renderFindings: [] },
        perf: { score: json.scan.perfScore, bytesKb: json.scan.bytesKb, elapsed: json.scan.elapsedMs, issues: json.scan.perfIssues, h1Count: json.scan.hasH1 ? 1 : 0, jsonLd: json.scan.jsonLdCount },
      } as ScanReport);
      if (json.notes) setAuditNotes(json.notes);
      if (json.checklist) setChecklist(json.checklist);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-fix selhal");
    } finally {
      setAutoFixing(false);
    }
  }

  const saveProgress = useCallback(async () => {
    if (!tpl) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/template-queue/${templateKey}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          review_notes: notes,
          review_checklist: checklist,
          review_status: tpl.review_status === "pending" ? "reviewed" : tpl.review_status,
        }),
      });
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  }, [templateKey, notes, checklist, tpl]);

  // Debounced autosave
  useEffect(() => {
    if (!tpl) return;
    const t = setTimeout(() => { void saveProgress(); }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, checklist]);

  async function publishToCatalog() {
    if (!tpl) return;
    const allChecked = CHECKLIST_ITEMS.every((c) => checklist[c.id]);
    if (!allChecked) {
      if (!confirm("Některé checklist body nejsou odškrtnuté. Opravdu publikovat?")) return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/template-queue/${templateKey}`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publikace selhala");
    } finally {
      setPublishing(false);
    }
  }

  async function setStatus(newStatus: TemplateRow["review_status"]) {
    setSaving(true);
    try {
      await fetch(`/api/admin/template-queue/${templateKey}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ review_status: newStatus }),
      });
      await reload();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Načítám…
      </div>
    );
  }
  if (!tpl) {
    return (
      <div className="px-6 py-10 text-center text-gray-400">
        {error ?? "Šablona neexistuje"}
        <div className="mt-4">
          <Link href="/admin/template-queue" className="text-indigo-400 hover:underline">
            ← Zpět na frontu
          </Link>
        </div>
      </div>
    );
  }

  const previewBase = previewSlug ? `/demo/${previewSlug}` : null;
  const completedCount = CHECKLIST_ITEMS.filter((c) => checklist[c.id]).length;

  return (
    <div className="flex h-screen flex-col text-gray-900">
      {/* TopBar */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/template-queue"
            className="inline-flex items-center gap-1 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div
            className="h-7 w-12 rounded bg-cover bg-center"
            style={{ backgroundImage: `url(/templates/${tpl.key}/preview.png)`, backgroundColor: "#1a1a1c" }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              {tpl.name}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-normal text-gray-700">{tpl.key}</code>
            </div>
            <div className="text-[11px] text-gray-400">{tpl.industry} · {tpl.v2_tenant_count} v2 tenants · v{tpl.current_version}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedAt > 0 && (
            <span className="text-[10.5px] text-gray-400">Uloženo {new Date(savedAt).toLocaleTimeString("cs")}</span>
          )}
          <DeviceTabs device={device} onChange={setDevice} />
          <button
            onClick={runAutoFix}
            disabled={autoFixing}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            title="Spustit auto-fix: cleanup, download, reseed, vyčistit overrides, generovat poznámky"
          >
            {autoFixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            Auto-fix
          </button>
          <button
            onClick={runScan}
            disabled={scanning}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            {scanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Skenovat
          </button>
          {previewSlug && (
            <a
              href={`/demo/${previewSlug}/studio`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              title="Otevřít studio v novém okně"
            >
              <Edit3 className="h-3 w-3" /> Studio
            </a>
          )}
          {tpl.review_status === "approved" ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Publikováno
            </span>
          ) : (
            <button
              onClick={publishToCatalog}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-emerald-500 disabled:opacity-60"
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
              Publikovat na homepage
            </button>
          )}
          <StatusDropdown current={tpl.review_status} onChange={setStatus} />
        </div>
      </div>

      {/* Body — left previews, right checklist */}
      <div className="flex flex-1 min-h-0">
        {/* Preview pane */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {!previewBase ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <div className="text-sm text-gray-400">
                Pro tuto šablonu zatím není v2 tenant — náhled není dostupný.<br />
                Vytvoř tenanta v admin / template-lab nebo přes onboarding.
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-start justify-center gap-6">
              {(device === "both" || device === "desktop") && (
                <DevicePreview label="Desktop 1280×800" width={1280} height={800} src={previewBase} />
              )}
              {(device === "both" || device === "mobile") && (
                <DevicePreview label="Mobile 390×844" width={390} height={844} src={previewBase} />
              )}
            </div>
          )}
        </div>

        {/* Side panel — checklist + scan + notes */}
        <div className="w-96 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
          {/* Tenant access card */}
          {tpl.primary_tenant_slug && tpl.primary_tenant_token && (
            <Section title="Přístup k webu">
              <div className="space-y-1.5 rounded border border-indigo-200 bg-indigo-50/40 p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <div className="text-[9px] uppercase tracking-wider text-indigo-600">URL studia</div>
                    <code className="block truncate text-[11px] text-gray-900">/demo/{tpl.primary_tenant_slug}/studio</code>
                  </div>
                  <a
                    href={`/demo/${tpl.primary_tenant_slug}/studio`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-[10.5px] font-semibold text-white hover:bg-indigo-500"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    Otevřít
                  </a>
                </div>
                <div className="border-t border-indigo-200 pt-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-wider text-indigo-600">Heslo (access_token)</div>
                      <code className="block truncate font-mono text-[10.5px] text-gray-700">{tpl.primary_tenant_token.slice(0, 24)}…</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(tpl.primary_tenant_token!, "token")}
                      className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[10.5px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {copied === "token" ? <><Check className="h-2.5 w-2.5 text-emerald-600" /> OK</> : <><Copy className="h-2.5 w-2.5" /> Kopírovat</>}
                    </button>
                  </div>
                </div>
                <div className="border-t border-indigo-200 pt-1.5">
                  <a
                    href={`/demo/${tpl.primary_tenant_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10.5px] font-medium text-indigo-700 hover:underline"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    Veřejný náhled (jako návštěvník)
                  </a>
                </div>
                <div className="border-t border-indigo-200 pt-1.5 text-[9.5px] text-indigo-700">
                  <KeyRound className="mr-1 inline h-2.5 w-2.5" />
                  Pro přihlášení do studia použij URL <code>/demo/&lt;slug&gt;/login</code> + tento token, nebo otevři přímo studia link výše.
                </div>
              </div>
            </Section>
          )}

          {/* Auto-generated audit notes */}
          {auditNotes && <AuditNotesSection notes={auditNotes} />}

          {/* Scan result */}
          {scan && <ScanSummary scan={scan} />}

          {/* Checklist */}
          <Section title={`QA Checklist · ${completedCount}/${CHECKLIST_ITEMS.length}`}>
            {CHECKLIST_ITEMS.map((c) => {
              const checked = !!checklist[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChecklist((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                  className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-[12px] transition-colors ${
                    checked
                      ? "border-emerald-300 bg-emerald-50 text-emerald-200"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked ? "border-emerald-500 bg-emerald-500/30 text-emerald-700" : "border-gray-600"
                  }`}>
                    {checked && <CheckCircle2 className="h-3 w-3" strokeWidth={3} />}
                  </div>
                  <c.Icon className="h-3.5 w-3.5 text-gray-400" />
                  <span className="flex-1">{c.label}</span>
                </button>
              );
            })}
          </Section>

          {/* Notes */}
          <Section title="Poznámky">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Co je hotové, co zbývá, problémy…"
              rows={6}
              className="w-full resize-none rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
              <span>{saving ? "Ukládám…" : "Auto-save"}</span>
              {tpl.reviewer_email && <span>Reviewer: {tpl.reviewer_email}</span>}
            </div>
          </Section>

          {error && (
            <div className="mx-3 my-2 rounded border border-red-300 bg-red-50 p-2 text-[11px] text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DevicePreview({ label, width, height, src }: { label: string; width: number; height: number; src: string }) {
  const scale = width === 1280 ? 0.6 : 0.7;
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1.5 text-[10.5px] uppercase tracking-wide text-gray-400">{label}</div>
      <div
        className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl"
        style={{
          width: width * scale,
          height: height * scale,
        }}
      >
        <iframe
          src={src}
          title={label}
          style={{
            width,
            height,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}

function DeviceTabs({ device, onChange }: { device: "both" | "desktop" | "mobile"; onChange: (d: "both" | "desktop" | "mobile") => void }) {
  return (
    <div className="flex rounded-md bg-white p-0.5">
      <Btn active={device === "desktop"} onClick={() => onChange("desktop")}><Monitor className="h-3.5 w-3.5" /></Btn>
      <Btn active={device === "both"}    onClick={() => onChange("both")}>Both</Btn>
      <Btn active={device === "mobile"}  onClick={() => onChange("mobile")}><Smartphone className="h-3.5 w-3.5" /></Btn>
    </div>
  );
}

function Btn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${active ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-900"}`}
    >
      {children}
    </button>
  );
}

function StatusDropdown({ current, onChange }: { current: TemplateRow["review_status"]; onChange: (s: TemplateRow["review_status"]) => void }) {
  const [open, setOpen] = useState(false);
  const options: Array<{ value: TemplateRow["review_status"]; label: string; color: string }> = [
    { value: "pending",  label: "Čeká",      color: "text-amber-700" },
    { value: "reviewed", label: "V review",  color: "text-blue-700" },
    { value: "blocked",  label: "Blokováno", color: "text-red-700" },
  ];
  const currentOpt = options.find((o) => o.value === current);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
      >
        <span className={currentOpt?.color ?? "text-gray-700"}>{currentOpt?.label ?? current}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-xl">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 ${o.color}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 px-3 py-3">
      <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-gray-400">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function AuditNotesSection({ notes }: { notes: AuditNotes }) {
  return (
    <Section title="Poznámky od Claude (auto-fix)">
      {notes.done.length > 0 && (
        <div className="rounded border border-emerald-200 bg-emerald-50/50 p-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Hotovo
          </div>
          <ul className="space-y-1 text-[11px] text-gray-700">
            {notes.done.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 inline-block h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notes.todo.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50/50 p-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            <AlertCircle className="h-3 w-3" /> Pro tebe (10 %)
          </div>
          <ul className="space-y-1 text-[11px] text-gray-700">
            {notes.todo.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {notes.hints.length > 0 && (
        <div className="rounded border border-sky-200 bg-sky-50/50 p-2">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-700">
            <Lightbulb className="h-3 w-3" /> Doporučení
          </div>
          <ul className="space-y-1 text-[11px] text-gray-700">
            {notes.hints.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-0.5 inline-block h-1 w-1 shrink-0 rounded-full bg-sky-500" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-[9.5px] text-gray-400">
        Vygenerováno {new Date(notes.generatedAt).toLocaleString("cs")}
      </div>
    </Section>
  );
}

function ScanSummary({ scan }: { scan: ScanReport }) {
  const residueTotal = scan.residue.diskCount + scan.residue.renderFindings.reduce((a, f) => a + f.count, 0);
  const perf = scan.perf;
  return (
    <Section title="Sken">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-wider text-gray-400">Perf</div>
          <div className={`text-lg font-bold ${
            perf?.score == null ? "text-gray-400" :
            perf.score >= 90 ? "text-emerald-600" :
            perf.score >= 70 ? "text-amber-600" : "text-red-600"
          }`}>
            {perf?.score ?? "—"}
          </div>
          {perf?.bytesKb && <div className="text-[10px] text-gray-400">{perf.bytesKb} KB · {perf.elapsed}ms</div>}
        </div>
        <div className="rounded border border-gray-200 bg-gray-50 px-2 py-1.5">
          <div className="text-[9px] uppercase tracking-wider text-gray-400">Rezidua</div>
          <div className={`text-lg font-bold ${residueTotal === 0 ? "text-emerald-600" : "text-red-600"}`}>
            {residueTotal}
          </div>
          {residueTotal > 0 && (
            <div className="text-[10px] text-red-700">
              {scan.residue.diskFindings.slice(0, 2).map((f) => f.pattern).join(", ")}
            </div>
          )}
        </div>
      </div>
      {perf?.issues && perf.issues.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-[10.5px] text-amber-700">
          {perf.issues.slice(0, 4).map((i, idx) => (
            <li key={idx} className="flex items-start gap-1">
              <span>·</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
