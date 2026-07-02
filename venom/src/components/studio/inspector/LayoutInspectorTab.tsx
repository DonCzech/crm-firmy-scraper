"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";
import { FieldReset } from "./FieldReset";

type Spacing = "tight" | "normal" | "airy";

/** Layout settings persisted in section.settings.layout. New padding* fields
 *  (T1.2) are interpreted as EXTRA outer spacing applied on the SectionFrame
 *  wrapper. Legacy `spacing` preset is kept readable for back-compat but is
 *  no longer written from this UI — T1.4 codemod will migrate templates to
 *  read --section-pt/pb/px CSS vars directly. */
type LayoutSettings = {
  spacing?: Spacing;
  paddingTop?: number;
  paddingBottom?: number;
  paddingX?: number;
  backgroundColor?: string;
  anchorId?: string;
};

type OverlayLayer = "above" | "below";

const PAD_MAX_Y = 240;
const PAD_MAX_X = 80;
const PAD_STEP = 4;
const COMMIT_DEBOUNCE_MS = 250;

export function LayoutInspectorTab({ section, state }: { section: Section; state: StudioState }) {
  const layout = (section.settings?.layout ?? {}) as LayoutSettings;
  const hiddenOn = ((section.settings?.hiddenOn as string[] | undefined) ?? []);
  const overlaySettings = (section.settings as Record<string, unknown> | undefined)?.overlay as
    { enabled?: boolean; layer?: OverlayLayer } | undefined;

  const [pt, setPt] = useState<number>(layout.paddingTop ?? 0);
  const [pb, setPb] = useState<number>(layout.paddingBottom ?? 0);
  const [px, setPx] = useState<number>(layout.paddingX ?? 0);
  const [bg, setBg] = useState(layout.backgroundColor ?? "");
  const [hideMobile, setHideMobile] = useState(hiddenOn.includes("mobile"));
  const [hideTablet, setHideTablet] = useState(hiddenOn.includes("tablet"));
  const [anchor, setAnchor] = useState(layout.anchorId ?? "");
  const [overlayEnabled, setOverlayEnabled] = useState(!!overlaySettings?.enabled);
  const [overlayLayer, setOverlayLayer] = useState<OverlayLayer>(overlaySettings?.layer ?? "above");

  // Debounce timers per slider — separate so simultaneous edits aren't
  // overwritten by a single trailing commit (e.g. quick drag pt → px).
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<Partial<LayoutSettings>>({});

  useEffect(() => {
    const ho = ((section.settings?.hiddenOn as string[] | undefined) ?? []);
    const lay = (section.settings?.layout ?? {}) as LayoutSettings;
    const ov = (section.settings as Record<string, unknown> | undefined)?.overlay as { enabled?: boolean; layer?: OverlayLayer } | undefined;
    setPt(lay.paddingTop ?? 0);
    setPb(lay.paddingBottom ?? 0);
    setPx(lay.paddingX ?? 0);
    setBg(lay.backgroundColor ?? "");
    setHideMobile(ho.includes("mobile"));
    setHideTablet(ho.includes("tablet"));
    setAnchor(lay.anchorId ?? "");
    setOverlayEnabled(!!ov?.enabled);
    setOverlayLayer(ov?.layer ?? "above");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]);

  function commitLayout(patch: Partial<LayoutSettings>) {
    const nextLayout = { ...layout, ...patch };
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), layout: nextLayout },
    });
  }

  /** Coalesce rapid slider changes into one debounced commit. */
  function commitLayoutDebounced(patch: Partial<LayoutSettings>) {
    pendingPatch.current = { ...pendingPatch.current, ...patch };
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      const merged = pendingPatch.current;
      pendingPatch.current = {};
      commitTimer.current = null;
      commitLayout(merged);
    }, COMMIT_DEBOUNCE_MS);
  }

  function commitOverlay(enabled: boolean, layer: OverlayLayer) {
    const prevOverlay = (section.settings as Record<string, unknown> | undefined)?.overlay as Record<string, unknown> | undefined;
    void state.patchSection(section.id, {
      settings: {
        ...(section.settings ?? {}),
        overlay: { ...prevOverlay, enabled, layer },
      },
    });
  }

  function commitHiddenOn(mobile: boolean, tablet: boolean) {
    const next: string[] = [];
    if (mobile) next.push("mobile");
    if (tablet) next.push("tablet");
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), hiddenOn: next },
    });
  }

  return (
    <div className="space-y-4 p-3">
      <div className="space-y-3">
        <Label>Mezery kolem sekce</Label>
        <PaddingSlider
          label="Nahoře"
          value={pt}
          onChange={(v) => { setPt(v); commitLayoutDebounced({ paddingTop: v }); }}
          min={0}
          max={PAD_MAX_Y}
          step={PAD_STEP}
        />
        <PaddingSlider
          label="Dole"
          value={pb}
          onChange={(v) => { setPb(v); commitLayoutDebounced({ paddingBottom: v }); }}
          min={0}
          max={PAD_MAX_Y}
          step={PAD_STEP}
        />
        <PaddingSlider
          label="Po stranách"
          value={px}
          onChange={(v) => { setPx(v); commitLayoutDebounced({ paddingX: v }); }}
          min={0}
          max={PAD_MAX_X}
          step={PAD_STEP}
        />
        <p className="text-[10.5px] leading-snug text-[var(--vs-text-muted)]">
          Přidává extra prostor okolo sekce (nad rámec interních mezer šablony).
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Barva pozadí</Label>
          <FieldReset
            onReset={() => { setBg(""); commitLayout({ backgroundColor: undefined }); }}
            modified={bg !== ""}
            title="Vrátit barvu pozadí na výchozí (šablona)"
          />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={bg || "#ffffff"}
            onChange={(e) => { setBg(e.target.value); commitLayout({ backgroundColor: e.target.value }); }}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)]"
            aria-label="Barva pozadí"
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            onBlur={() => commitLayout({ backgroundColor: bg || undefined })}
            placeholder="auto"
            className="h-8 flex-1 rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 font-mono text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Anchor ID</Label>
          <FieldReset
            onReset={() => { setAnchor(""); commitLayout({ anchorId: undefined }); }}
            modified={anchor !== ""}
            title="Vrátit anchor ID na výchozí (žádný)"
          />
        </div>
        <input
          type="text"
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          onBlur={() => commitLayout({ anchorId: anchor || undefined })}
          placeholder="napr-sluzby"
          className="mt-1 h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 font-mono text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
        />
        <p className="mt-1 text-[10.5px] text-[var(--vs-text-muted)]">Použij pro odkazy v menu (#anchor-id)</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Skrýt sekci na zařízeních</Label>
          <FieldReset
            onReset={() => {
              setHideMobile(false);
              setHideTablet(false);
              commitHiddenOn(false, false);
            }}
            modified={hideMobile || hideTablet}
            title="Vrátit viditelnost na výchozí (vidět všude)"
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
          <div>
            <div className="text-xs text-[var(--vs-text)]">📱 Mobil</div>
            <div className="text-[10.5px] text-[var(--vs-text-muted)]">Skryje pod 768px šířky</div>
          </div>
          <Toggle
            checked={hideMobile}
            onChange={(v) => { setHideMobile(v); commitHiddenOn(v, hideTablet); }}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
          <div>
            <div className="text-xs text-[var(--vs-text)]">📟 Tablet</div>
            <div className="text-[10.5px] text-[var(--vs-text-muted)]">Skryje 768–1023px šířky</div>
          </div>
          <Toggle
            checked={hideTablet}
            onChange={(v) => { setHideTablet(v); commitHiddenOn(hideMobile, v); }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
        <div>
          <div className="text-xs text-[var(--vs-text)]">Viditelnost sekce</div>
          <div className="text-[10.5px] text-[var(--vs-text-muted)]">{section.is_visible ? "Zobrazená" : "Skrytá"}</div>
        </div>
        <Toggle
          checked={section.is_visible}
          onChange={() => void state.patchSection(section.id, { is_visible: !section.is_visible })}
        />
      </div>

      {/* T2.3 — Overlay layer toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
          <div>
            <div className="text-xs text-[var(--vs-text)]">✦ Overlay vrstva</div>
            <div className="text-[10.5px] text-[var(--vs-text-muted)]">Přidá volnou vrstvu pro text, tlačítka, obrázky</div>
          </div>
          <Toggle
            checked={overlayEnabled}
            onChange={(v) => { setOverlayEnabled(v); commitOverlay(v, overlayLayer); }}
          />
        </div>
        {overlayEnabled && (
          <div className="rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-2.5 space-y-1.5">
            <div className="text-[10.5px] font-medium text-[var(--vs-text-muted)] uppercase tracking-wide">Pozice vrstvy</div>
            <div className="flex gap-2">
              {(["above", "below"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => { setOverlayLayer(l); commitOverlay(overlayEnabled, l); }}
                  className={clsx(
                    "flex-1 rounded-md px-2 py-1.5 text-[10.5px] font-medium border transition-colors",
                    overlayLayer === l
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-[var(--vs-border)] bg-[var(--vs-surface-3)] text-[var(--vs-text)] hover:border-blue-400"
                  )}
                >
                  {l === "above" ? "↑ Nad obsahem" : "↓ Pod obsahem"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-blue-600" : "bg-[var(--vs-surface-3)]"
      )}
    >
      <span className={clsx(
        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-4" : "translate-x-1"
      )} />
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">{children}</span>;
}

function PaddingSlider({
  label, value, onChange, min, max, step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-[var(--vs-text-soft)]">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
            className="h-6 w-14 rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-1.5 text-right font-mono text-[11px] text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
            aria-label={`${label} v px`}
          />
          <span className="text-[10px] text-[var(--vs-text-muted)]">px</span>
          <FieldReset
            onReset={() => onChange(0)}
            modified={value !== 0}
            title={`Vrátit ${label.toLowerCase()} na výchozí (0)`}
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--vs-surface-3)] accent-[var(--vs-accent)]"
        aria-label={label}
      />
    </div>
  );
}
