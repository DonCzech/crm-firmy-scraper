"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";
import { useStudio } from "../StudioContext";
import { FieldReset } from "./FieldReset";
import { Monitor, Tablet, Smartphone } from "@/components/studio/icons";

type Spacing = "tight" | "normal" | "airy";

/** Per-breakpoint padding overrides (3b). Undefined osa = dědí desktop hodnotu. */
type ResponsivePad = {
  paddingTop?: number;
  paddingBottom?: number;
  paddingX?: number;
};

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
  /** 3b — responsive editace: overrides platné jen pro tablet/mobile breakpoint */
  responsive?: {
    tablet?: ResponsivePad;
    mobile?: ResponsivePad;
  };
};

type OverlayLayer = "above" | "below";

const PAD_MAX_Y = 240;
const PAD_MAX_X = 80;
const PAD_STEP = 4;
const COMMIT_DEBOUNCE_MS = 250;

export function LayoutInspectorTab({ section, state }: { section: Section; state: StudioState }) {
  const studio = useStudio();
  const layout = (section.settings?.layout ?? {}) as LayoutSettings;
  const hiddenOn = ((section.settings?.hiddenOn as string[] | undefined) ?? []);
  const overlaySettings = (section.settings as Record<string, unknown> | undefined)?.overlay as
    { enabled?: boolean; layer?: OverlayLayer } | undefined;

  // 3b — aktivní breakpoint řídí, kam padding slidery zapisují:
  // desktop ⇒ layout.padding*, tablet/mobile ⇒ layout.responsive[bp].padding*
  const bp = studio.breakpoint;
  const isResponsiveBp = bp !== "desktop";
  const bpOverrides: ResponsivePad = (isResponsiveBp ? layout.responsive?.[bp] : undefined) ?? {};

  /** Efektivní hodnota pro zobrazení: override → fallback na desktop/base. */
  const effPad = (key: keyof ResponsivePad): number =>
    (isResponsiveBp ? bpOverrides[key] : undefined) ?? layout[key] ?? 0;

  const [pt, setPt] = useState<number>(effPad("paddingTop"));
  const [pb, setPb] = useState<number>(effPad("paddingBottom"));
  const [px, setPx] = useState<number>(effPad("paddingX"));
  const [bg, setBg] = useState(layout.backgroundColor ?? "");
  const [hideMobile, setHideMobile] = useState(hiddenOn.includes("mobile"));
  const [hideTablet, setHideTablet] = useState(hiddenOn.includes("tablet"));
  const [anchor, setAnchor] = useState(layout.anchorId ?? "");
  const [overlayEnabled, setOverlayEnabled] = useState(!!overlaySettings?.enabled);
  const [overlayLayer, setOverlayLayer] = useState<OverlayLayer>(overlaySettings?.layer ?? "above");

  // Debounce timers per slider — separate so simultaneous edits aren't
  // overwritten by a single trailing commit (e.g. quick drag pt → px).
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatch = useRef<Partial<LayoutSettings> & ResponsivePad>({});

  useEffect(() => {
    const ho = ((section.settings?.hiddenOn as string[] | undefined) ?? []);
    const lay = (section.settings?.layout ?? {}) as LayoutSettings;
    const ov = (section.settings as Record<string, unknown> | undefined)?.overlay as { enabled?: boolean; layer?: OverlayLayer } | undefined;
    const bpo: ResponsivePad = (bp !== "desktop" ? lay.responsive?.[bp] : undefined) ?? {};
    setPt(bpo.paddingTop ?? lay.paddingTop ?? 0);
    setPb(bpo.paddingBottom ?? lay.paddingBottom ?? 0);
    setPx(bpo.paddingX ?? lay.paddingX ?? 0);
    setBg(lay.backgroundColor ?? "");
    setHideMobile(ho.includes("mobile"));
    setHideTablet(ho.includes("tablet"));
    setAnchor(lay.anchorId ?? "");
    setOverlayEnabled(!!ov?.enabled);
    setOverlayLayer(ov?.layer ?? "above");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, bp]);

  function commitLayout(patch: Partial<LayoutSettings>): Promise<void> {
    const nextLayout = { ...layout, ...patch };
    return state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), layout: nextLayout },
    });
  }

  /** Zapíše padding patch do aktivního breakpointu (undefined = smaž override).
   *  Ruší rozjetý debounce — reset override nesmí být přepsán zpožděným commitem. */
  function commitPadding(patch: ResponsivePad) {
    if (commitTimer.current) { clearTimeout(commitTimer.current); commitTimer.current = null; }
    pendingPatch.current = {};
    if (!isResponsiveBp) {
      commitLayout(patch);
      return;
    }
    const merged: ResponsivePad = { ...(layout.responsive?.[bp] ?? {}), ...patch };
    const cleaned = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined)
    ) as ResponsivePad;
    const nextResponsive = { ...(layout.responsive ?? {}), [bp]: cleaned };
    // Tablet/mobile canvas je iframe — po uložení požádáme o jeho refresh,
    // aby se media-query override hned projevil v náhledu.
    void commitLayout({ responsive: nextResponsive }).then(() => {
      window.dispatchEvent(new Event("studio:request-iframe-refresh"));
    });
  }

  /** Coalesce rapid slider changes into one debounced commit. */
  function commitLayoutDebounced(patch: ResponsivePad) {
    pendingPatch.current = { ...pendingPatch.current, ...patch };
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      const merged = pendingPatch.current;
      pendingPatch.current = {};
      commitTimer.current = null;
      commitPadding(merged);
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
        <div className="flex items-center justify-between">
          <Label>Mezery kolem sekce</Label>
          {isResponsiveBp && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--vs-accent-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--vs-accent-hi)]">
              {bp === "tablet" ? <Tablet className="h-3 w-3" weight="duotone" /> : <Smartphone className="h-3 w-3" weight="duotone" />}
              Upravuješ {bp === "tablet" ? "Tablet" : "Mobil"}
            </span>
          )}
        </div>
        <PaddingSlider
          label="Nahoře"
          value={pt}
          onChange={(v) => { setPt(v); commitLayoutDebounced({ paddingTop: v }); }}
          min={0}
          max={PAD_MAX_Y}
          step={PAD_STEP}
          overridden={isResponsiveBp ? bpOverrides.paddingTop !== undefined : undefined}
          onClearOverride={isResponsiveBp ? () => { setPt(layout.paddingTop ?? 0); commitPadding({ paddingTop: undefined }); } : undefined}
        />
        <PaddingSlider
          label="Dole"
          value={pb}
          onChange={(v) => { setPb(v); commitLayoutDebounced({ paddingBottom: v }); }}
          min={0}
          max={PAD_MAX_Y}
          step={PAD_STEP}
          overridden={isResponsiveBp ? bpOverrides.paddingBottom !== undefined : undefined}
          onClearOverride={isResponsiveBp ? () => { setPb(layout.paddingBottom ?? 0); commitPadding({ paddingBottom: undefined }); } : undefined}
        />
        <PaddingSlider
          label="Po stranách"
          value={px}
          onChange={(v) => { setPx(v); commitLayoutDebounced({ paddingX: v }); }}
          min={0}
          max={PAD_MAX_X}
          step={PAD_STEP}
          overridden={isResponsiveBp ? bpOverrides.paddingX !== undefined : undefined}
          onClearOverride={isResponsiveBp ? () => { setPx(layout.paddingX ?? 0); commitPadding({ paddingX: undefined }); } : undefined}
        />
        <p className="text-[10.5px] leading-snug text-[var(--vs-text-muted)]">
          {isResponsiveBp
            ? `Hodnoty platí jen pro ${bp === "tablet" ? "tablet (768–1023 px)" : "mobil (do 767 px)"}. Bez úpravy sekce dědí hodnoty z desktopu.`
            : "Přidává extra prostor okolo sekce (nad rámec interních mezer šablony)."}
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
                      ? "border-[var(--vs-accent)] bg-[var(--vs-accent-solid)] text-white"
                      : "border-[var(--vs-border)] bg-[var(--vs-surface-3)] text-[var(--vs-text)] hover:border-[var(--vs-accent)]"
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
        checked ? "bg-[var(--vs-accent-solid)]" : "bg-[var(--vs-surface-3)]"
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
  label, value, onChange, min, max, step, overridden, onClearOverride,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  /** 3b — responsive režim: true = breakpoint má vlastní hodnotu, false = dědí desktop */
  overridden?: boolean;
  /** 3b — smaže breakpoint override (vrátí dědění z desktopu) */
  onClearOverride?: () => void;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const responsiveMode = onClearOverride !== undefined;
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--vs-text-soft)]">
          {label}
          {responsiveMode && overridden && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--vs-accent-hi)]" title="Vlastní hodnota pro tento breakpoint" />
          )}
        </span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
            className={clsx(
              "h-6 w-14 rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-1.5 text-right font-mono text-[11px] outline-none focus:border-[var(--vs-accent)]",
              responsiveMode && !overridden ? "text-[var(--vs-text-dim)]" : "text-[var(--vs-text)]"
            )}
            aria-label={`${label} v px`}
          />
          <span className="text-[10px] text-[var(--vs-text-muted)]">px</span>
          {responsiveMode ? (
            <FieldReset
              onReset={() => onClearOverride?.()}
              modified={!!overridden}
              title={`Zrušit ${label.toLowerCase()} pro tento breakpoint (dědit z desktopu)`}
            />
          ) : (
            <FieldReset
              onReset={() => onChange(0)}
              modified={value !== 0}
              title={`Vrátit ${label.toLowerCase()} na výchozí (0)`}
            />
          )}
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
