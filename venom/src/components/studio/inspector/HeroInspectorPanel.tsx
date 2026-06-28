"use client";

import {
  useState, useRef, useCallback, useEffect, type PointerEvent as ReactPointerEvent,
} from "react";
import { Monitor, Tablet, Info, Pencil, Trash2, AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-react";
import clsx from "clsx";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";
import { useStudio } from "../StudioContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type BgTab        = "color" | "image" | "video";
type GradType     = "solid" | "linear" | "radial" | "conic";
type FitOption    = "cover" | "contain" | "none";
type HeightOption = "s" | "m" | "l" | "auto" | "full";
type WidthOption  = "narrow" | "grid" | "wide" | "full";
type AlignOption  = "top" | "center" | "bottom";
type TextColor    = "auto" | "default" | "inverse";

export interface HeroBgSettings {
  tab: BgTab;
  // color
  color: string;
  gradType: GradType;
  // image
  imageUrl: string;
  imageFocus: { x: number; y: number };
  imageFit: FitOption;
  // video
  videoUrl: string;
  videoMobile: boolean;
  // content
  height: HeightOption;
  contentWidth: WidthOption;
  align: AlignOption;
  textColor: TextColor;
}

const DEFAULTS: HeroBgSettings = {
  tab: "image", color: "#1e3a5f", gradType: "solid",
  imageUrl: "", imageFocus: { x: 50, y: 50 }, imageFit: "cover",
  videoUrl: "", videoMobile: false,
  height: "m", contentWidth: "grid", align: "center", textColor: "default",
};

// ─── HSV ↔ Hex math ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
}
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h /= 360; s /= 100; v /= 100;
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break; default: r = v; g = p; b = q;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ─── HSV Picker ───────────────────────────────────────────────────────────────

const PRESETS = ["#ffffff", "#d4d4d4", "#a3a3a3", "#c8a96e", "#22c55e", "#0ea5e9", "#6366f1", "#ec4899", "#ef4444", "#f97316", "#eab308", "#000000"];

function HsvPicker({ color, onChange }: { color: string; onChange: (hex: string) => void }) {
  const [h, s, v] = rgbToHsv(...hexToRgb(color));
  const [hexInput, setHexInput] = useState(color.replace("#", ""));

  // Keep hex input in sync when color changes from outside
  useEffect(() => { setHexInput(color.replace("#", "")); }, [color]);

  const svRef  = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  function dragSV(e: ReactPointerEvent<HTMLDivElement>) {
    const el = svRef.current; if (!el) return;
    el.setPointerCapture(e.pointerId);
    function move(ev: PointerEvent) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const ny = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
      const rgb = hsvToRgb(h, nx * 100, (1 - ny) * 100);
      onChange(rgbToHex(...rgb));
    }
    move(e.nativeEvent as PointerEvent);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", () => window.removeEventListener("pointermove", move), { once: true });
  }

  function dragHue(e: ReactPointerEvent<HTMLDivElement>) {
    const el = hueRef.current; if (!el) return;
    el.setPointerCapture(e.pointerId);
    function move(ev: PointerEvent) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nh = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
      const rgb = hsvToRgb(nh * 360, s, v);
      onChange(rgbToHex(...rgb));
    }
    move(e.nativeEvent as PointerEvent);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", () => window.removeEventListener("pointermove", move), { once: true });
  }

  function onHexBlur() {
    const h6 = hexInput.replace("#", "");
    if (/^[0-9a-fA-F]{6}$/.test(h6)) onChange("#" + h6);
  }

  const hueColor = rgbToHex(...hsvToRgb(h, 100, 100));
  const svX = `${s}%`, svY = `${100 - v}%`;

  return (
    <div className="space-y-3 py-1">
      {/* Saturation / Value 2-D picker */}
      <div
        ref={svRef}
        className="relative h-[140px] w-full cursor-crosshair rounded-lg select-none touch-none"
        style={{
          backgroundColor: hueColor,
          backgroundImage: "linear-gradient(to right, white, transparent), linear-gradient(to bottom, transparent, black)",
        }}
        onPointerDown={dragSV}
      >
        <div
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: svX, top: svY, boxShadow: "0 0 0 1px rgba(0,0,0,.4), 0 1px 4px rgba(0,0,0,.6)" }}
        />
      </div>

      <div className="flex gap-2">
        {/* Hue vertical bar */}
        <div
          ref={hueRef}
          className="relative w-4 shrink-0 cursor-ns-resize rounded select-none touch-none"
          style={{ background: "linear-gradient(to bottom,hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))" }}
          onPointerDown={dragHue}
        >
          <div
            className="pointer-events-none absolute left-1/2 h-2.5 w-full -translate-x-1/2 -translate-y-1/2 rounded border-2 border-white shadow"
            style={{ top: `${(h / 360) * 100}%`, boxShadow: "0 0 0 1px rgba(0,0,0,.35)" }}
          />
        </div>

        {/* Swatch preview + HEX input */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded border border-[var(--vs-border)]" style={{ background: color }} />
            <div className="flex flex-1 items-center rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2">
              <span className="text-[11px] text-[var(--vs-text-muted)]">#</span>
              <input
                value={hexInput}
                onChange={e => setHexInput(e.target.value.toUpperCase())}
                onBlur={onHexBlur}
                maxLength={6}
                className="flex-1 bg-transparent px-1 font-mono text-[12px] text-[var(--vs-text)] outline-none"
              />
            </div>
          </div>
          {/* H S V inputs */}
          <div className="grid grid-cols-3 gap-1.5">
            {([["H", h, (x: number) => { const rgb = hsvToRgb(x, s, v); onChange(rgbToHex(...rgb)); }],
               ["S", s, (x: number) => { const rgb = hsvToRgb(h, x, v); onChange(rgbToHex(...rgb)); }],
               ["V", v, (x: number) => { const rgb = hsvToRgb(h, s, x); onChange(rgbToHex(...rgb)); }],
            ] as [string, number, (x: number) => void][]).map(([lbl, val, fn]) => (
              <label key={lbl} className="flex flex-col items-center gap-0.5">
                <input
                  type="number"
                  min={0}
                  max={lbl === "H" ? 360 : 100}
                  value={val}
                  onChange={e => fn(Number(e.target.value))}
                  className="h-7 w-full rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-1 text-center font-mono text-[11px] text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
                />
                <span className="text-[10px] text-[var(--vs-text-muted)]">{lbl}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {PRESETS.map(p => (
          <button
            key={p}
            type="button"
            title={p}
            onClick={() => onChange(p)}
            className={clsx(
              "h-6 w-6 rounded border transition-transform hover:scale-110",
              color.toLowerCase() === p.toLowerCase() ? "border-[var(--vs-accent)]" : "border-[var(--vs-border-strong)]"
            )}
            style={{ background: p }}
          />
        ))}
        <button
          type="button"
          title="Přidat barvu"
          className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-[var(--vs-border-strong)] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
        >
          <span className="text-sm leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

// ─── Focus point dragger ───────────────────────────────────────────────────────

function FocusPicker({
  src, focus, onFocusChange,
}: {
  src: string;
  focus: { x: number; y: number };
  onFocusChange: (f: { x: number; y: number }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function drag(e: ReactPointerEvent<HTMLDivElement>) {
    const el = ref.current; if (!el) return;
    el.setPointerCapture(e.pointerId);
    function move(ev: PointerEvent) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
      const y = Math.max(0, Math.min(100, ((ev.clientY - r.top) / r.height) * 100));
      onFocusChange({ x: Math.round(x), y: Math.round(y) });
    }
    move(e.nativeEvent as PointerEvent);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", () => window.removeEventListener("pointermove", move), { once: true });
  }

  return (
    <div
      ref={ref}
      className="relative h-[160px] w-full overflow-hidden rounded-lg bg-[var(--vs-surface-2)] cursor-crosshair select-none touch-none"
      onPointerDown={drag}
    >
      {src ? (
        <img
          src={src}
          alt="náhled"
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
          draggable={false}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[var(--vs-text-dim)] text-[12px]">Bez obrázku</div>
      )}
      {/* Focus crosshair */}
      <div
        className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
        style={{
          left: `${focus.x}%`,
          top: `${focus.y}%`,
          boxShadow: "0 0 0 1.5px rgba(0,0,0,.5), 0 2px 8px rgba(0,0,0,.5)",
        }}
      />
    </div>
  );
}

// ─── Shared OBSAH section ─────────────────────────────────────────────────────

function ObsahSection({
  s, update,
}: {
  s: HeroBgSettings;
  update: (patch: Partial<HeroBgSettings>) => void;
}) {
  return (
    <div className="space-y-3 pt-4 border-t border-[var(--vs-border)]">
      <p className="text-[10px] font-bold tracking-[.10em] uppercase text-[var(--vs-text-dim)]">Obsah</p>

      {/* Height */}
      <div>
        <Label>Výška sekce</Label>
        <div className="mt-1 flex gap-1">
          {(["s","m","l","auto","plná"] as const).map((opt, i) => {
            const key = (["s","m","l","auto","full"] as const)[i];
            return (
              <SegBtn key={key} active={s.height === key} onClick={() => update({ height: key })}>
                {opt.toUpperCase()}
              </SegBtn>
            );
          })}
        </div>
      </div>

      {/* Width */}
      <div>
        <Label>Šířka obsahu</Label>
        <div className="mt-1 flex gap-1">
          {([["narrow","úzká"],["grid","na mřížku"],["wide","široká"],["full","plná"]] as const).map(([key, lbl]) => (
            <SegBtn key={key} active={s.contentWidth === key} onClick={() => update({ contentWidth: key })}>
              {lbl}
            </SegBtn>
          ))}
        </div>
      </div>

      {/* Align */}
      <div>
        <Label>Zarovnání položek</Label>
        <div className="mt-1 flex gap-1">
          {([
            ["top",    <AlignStartVertical  key="t" className="h-3.5 w-3.5" strokeWidth={1.75} />],
            ["center", <AlignCenterVertical key="c" className="h-3.5 w-3.5" strokeWidth={1.75} />],
            ["bottom", <AlignEndVertical    key="b" className="h-3.5 w-3.5" strokeWidth={1.75} />],
          ] as [AlignOption, React.ReactNode][]).map(([key, icon]) => (
            <SegBtn key={key} active={s.align === key} onClick={() => update({ align: key })} square>
              {icon}
            </SegBtn>
          ))}
        </div>
      </div>

      {/* Text color */}
      <div>
        <Label>Barva textu</Label>
        <div className="mt-1 flex gap-1">
          {(["auto","default","inverse"] as TextColor[]).map((key) => (
            <SegBtn key={key} active={s.textColor === key} onClick={() => update({ textColor: key })}>
              {key === "auto" ? "auto" : key === "default" ? "výchozí" : "inverzní"}
            </SegBtn>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Small primitives ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">{children}</span>;
}

function SegBtn({
  children, active, onClick, square,
}: {
  children: React.ReactNode; active: boolean; onClick: () => void; square?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center rounded border text-[11px] transition-colors",
        square ? "h-8 w-8" : "h-7 flex-1 px-1",
        active
          ? "border-[var(--vs-accent)] bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
          : "border-[var(--vs-border)] bg-[var(--vs-bg-soft)] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
      )}
    >
      {children}
    </button>
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
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked ? "bg-blue-500" : "bg-[var(--vs-surface-3)]"
      )}
    >
      <span className={clsx("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-1")} />
    </button>
  );
}

// ─── Tab components ───────────────────────────────────────────────────────────

function ColorTab({ s, update }: { s: HeroBgSettings; update: (p: Partial<HeroBgSettings>) => void }) {
  const GRAD_TYPES: [GradType, string][] = [
    ["solid", "Barva"], ["linear", "Lineární"], ["radial", "Radiální"], ["conic", "Kónické"],
  ];
  return (
    <div className="space-y-3 p-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Pozadí</Label>
          <div className="h-5 w-5 rounded border border-[var(--vs-border)]" style={{ background: s.color }} />
        </div>
        {/* Gradient type selector */}
        <div className="flex gap-1 mb-3">
          {GRAD_TYPES.map(([key, lbl]) => (
            <SegBtn key={key} active={s.gradType === key} onClick={() => update({ gradType: key })}>
              {lbl}
            </SegBtn>
          ))}
        </div>
        <HsvPicker color={s.color} onChange={(c) => update({ color: c })} />
      </div>
    </div>
  );
}

function ImageTab({
  s, update, onOpenPicker,
}: {
  s: HeroBgSettings;
  update: (p: Partial<HeroBgSettings>) => void;
  onOpenPicker: () => void;
}) {
  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-[.10em] uppercase text-[var(--vs-text-dim)]">Nastavení obrázku</p>
        <div className="flex gap-1 text-[var(--vs-text-dim)]">
          <button type="button" title="Tablet" className="rounded p-0.5 hover:text-[var(--vs-text-soft)]"><Tablet className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
          <button type="button" title="Desktop" className="rounded p-0.5 text-[var(--vs-accent-hi)]"><Monitor className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
        </div>
      </div>

      {/* Thumbnail + focus picker */}
      <FocusPicker
        src={s.imageUrl}
        focus={s.imageFocus}
        onFocusChange={(f) => update({ imageFocus: f })}
      />

      {/* Action icons */}
      <div className="flex items-center justify-end gap-2">
        <button type="button" title="Info" className="text-[var(--vs-text-dim)] hover:text-[var(--vs-text-soft)]"><Info className="h-4 w-4" strokeWidth={1.75} /></button>
        <button type="button" title="Vyměnit obrázek" onClick={onOpenPicker} className="text-[var(--vs-text-dim)] hover:text-[var(--vs-accent-hi)]"><Pencil className="h-4 w-4" strokeWidth={1.75} /></button>
        <button type="button" title="Smazat obrázek" onClick={() => update({ imageUrl: "" })} className="text-[var(--vs-text-dim)] hover:text-red-400"><Trash2 className="h-4 w-4" strokeWidth={1.75} /></button>
      </div>

      {/* Fit */}
      <div>
        <Label>Přizpůsobení obrázku</Label>
        <div className="mt-1 flex gap-1">
          {([["cover","oříznout"],["contain","vyplnit"],["none","žádné"]] as [FitOption,string][]).map(([key,lbl]) => (
            <SegBtn key={key} active={s.imageFit === key} onClick={() => update({ imageFit: key })}>
              {lbl}
            </SegBtn>
          ))}
        </div>
      </div>

      <ObsahSection s={s} update={update} />
    </div>
  );
}

function VideoTab({ s, update }: { s: HeroBgSettings; update: (p: Partial<HeroBgSettings>) => void }) {
  return (
    <div className="space-y-3 p-3">
      <div>
        <p className="text-[10.5px] font-semibold text-[var(--vs-text)] mb-0.5">Video</p>
        <p className="text-[10.5px] text-[var(--vs-text-muted)] mb-2">Odkaz uvádějte ve tvaru s https://</p>
        <input
          type="url"
          value={s.videoUrl}
          onChange={e => update({ videoUrl: e.target.value })}
          placeholder="URL videa ze služby Youtube nebo Vimeo"
          className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2 text-[12px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none focus:border-[var(--vs-accent)]"
        />
      </div>

      <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[var(--vs-text)]">Přehrávat na mobilech/tabletech</span>
          <button type="button" title="Info" className="text-[var(--vs-text-dim)]"><Info className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
        </div>
        <Toggle checked={s.videoMobile} onChange={v => update({ videoMobile: v })} />
      </div>

      <ObsahSection s={s} update={update} />

      <div className="space-y-1 pt-2">
        {["Další nastavení", "Pokročilé"].map(lbl => (
          <button
            key={lbl}
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-2.5 text-[12.5px] text-[var(--vs-text-soft)] hover:text-[var(--vs-text)]"
          >
            {lbl} <span className="text-[var(--vs-text-dim)]">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ImagePickerModal ──────────────────────────────────────────────────────────

function ImagePickerModal({
  tenantSlug, onPick, onClose,
}: {
  tenantSlug: string;
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<{ id: number; url: string; filename: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/demo/${tenantSlug}/media`)
      .then(r => r.json())
      .then((d: { items?: { id: number; url: string; filename: string }[] }) => setItems(d.items ?? []))
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[640px] max-h-[80vh] flex flex-col rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--vs-border)] px-4 py-3">
          <span className="text-[14px] font-semibold text-[var(--vs-text)]">Vybrat obrázek</span>
          <button type="button" onClick={onClose} className="text-[var(--vs-text-dim)] hover:text-[var(--vs-text)]">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-[var(--vs-text-muted)] text-[13px]">Načítám…</div>
          ) : items.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-[var(--vs-text-muted)] text-[13px]">Žádná média</div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onPick(item.url); onClose(); }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--vs-border)] hover:border-[var(--vs-accent)] transition-colors"
                >
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function HeroInspectorPanel({ section, state }: { section: Section; state: StudioState }) {
  const studio = useStudio();
  const [pickerOpen, setPickerOpen] = useState(false);

  const stored = (section.settings?.heroBg ?? {}) as Partial<HeroBgSettings>;
  const cnt = (section.settings?.content ?? {}) as Record<string, unknown>;
  const fallbackImageUrl =
    (cnt.backgroundImage as string | undefined) ||
    (cnt.image as string | undefined) ||
    ((section.settings as Record<string, unknown>)?.backgroundImage as string | undefined) ||
    "";
  const savedBg: HeroBgSettings = { ...DEFAULTS, imageUrl: fallbackImageUrl, ...stored };

  // Live override — all changes here go directly to heroOverride in StudioContext
  // so StudioCanvas re-renders instantly (no DB round trips during drag/picking).
  const liveBg: HeroBgSettings =
    studio.heroOverride?.sectionId === section.id
      ? (studio.heroOverride.bg as unknown as HeroBgSettings)
      : savedBg;

  // Tab is local — switching is instant
  const [activeTab, setActiveTab] = useState<BgTab>(savedBg.tab);
  useEffect(() => {
    setActiveTab(savedBg.tab);
    studio.setHeroOverride(null); // clear live override when section changes
  }, [section.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Use a ref so live() always reads the latest liveBg/activeTab without stale closure
  const liveRef = useRef({ liveBg, activeTab, sectionId: section.id, studio });
  liveRef.current = { liveBg, activeTab, sectionId: section.id, studio };

  // Push a live update — updates canvas instantly, NOT saved to DB yet
  const live = useCallback((patch: Partial<HeroBgSettings>) => {
    const { liveBg: lb, activeTab: at, sectionId, studio: s } = liveRef.current;
    const next: HeroBgSettings = { ...lb, tab: at, ...patch };
    s.setHeroOverride({ sectionId, bg: next as unknown as Record<string, unknown> });
  }, []); // stable — reads latest values from ref

  // Save current live state to DB
  const commit = useCallback(() => {
    const { liveBg: lb, activeTab: at } = liveRef.current;
    const toSave: HeroBgSettings = { ...lb, tab: at };
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), heroBg: toSave },
    });
  }, [section, state]);

  const reset = useCallback(() => {
    studio.setHeroOverride(null);
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), heroBg: null },
    });
  }, [section, state, studio]);

  const tabs: [BgTab, React.ReactNode, string][] = [
    ["color", <svg key="c" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path d="M8 2a6 6 0 1 0 6 6h-1a5 5 0 1 1-5-5V2z"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>, "Barva"],
    ["image", <svg key="i" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><circle cx="5.5" cy="6.5" r="1.5"/><path d="m1.5 11 3.5-4 3 3.5 2-2 3.5 4.5"/></svg>, "Obrázek"],
    ["video", <svg key="v" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><circle cx="8" cy="8" r="6.5"/><path d="m6.5 5.5 4 2.5-4 2.5V5.5z" fill="currentColor" stroke="none"/></svg>, "Video"],
  ];

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Panel title */}
        <div className="shrink-0 border-b border-[var(--vs-border)] px-3 py-2.5">
          <span className="text-[13px] font-semibold text-[var(--vs-text)]">Nastavení sekce</span>
        </div>

        {/* Tab selector */}
        <div className="flex shrink-0 border-b border-[var(--vs-border)]">
          {tabs.map(([key, icon, lbl]) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActiveTab(key); live({ tab: key }); }}
              className={clsx(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
                activeTab === key
                  ? "border-b-2 border-[var(--vs-accent-hi)] text-[var(--vs-text)]"
                  : "text-[var(--vs-text-muted)] hover:text-[var(--vs-text-soft)]"
              )}
            >
              {icon}
              {lbl}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto vs-scroll">
          {activeTab === "color" && <ColorTab s={liveBg} update={live} />}
          {activeTab === "image" && (
            <ImageTab s={liveBg} update={live} onOpenPicker={() => setPickerOpen(true)} />
          )}
          {activeTab === "video" && <VideoTab s={liveBg} update={live} />}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-[var(--vs-border)] px-3 py-2">
          <button
            type="button"
            onClick={reset}
            className="text-[11.5px] text-[var(--vs-text-muted)] hover:text-[var(--vs-text-soft)]"
          >
            Původní nastavení
          </button>
          <button
            type="button"
            onClick={() => { commit(); studio.setSelection(null); }}
            className="rounded-lg bg-[var(--vs-accent)] px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-[var(--vs-accent-hi)]"
          >
            Hotovo
          </button>
        </div>
      </div>

      {pickerOpen && (
        <ImagePickerModal
          tenantSlug={state.tenant.slug}
          onPick={(url) => live({ imageUrl: url, tab: "image" })}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
