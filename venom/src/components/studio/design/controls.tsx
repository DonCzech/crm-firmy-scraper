"use client";

import { Monitor, Tablet, Smartphone, Link as LinkIcon, Unlink } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useDesignTokens } from "./DesignTokensContext";

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Section groupings inside a Design popup panel                              *
 * ─────────────────────────────────────────────────────────────────────────── */

export function SubGroup({ label, right, children }: { label: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="pt-3 first:pt-1">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.10em] text-[var(--vs-text-muted)] uppercase">
          {label}
        </span>
        {right}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

export function RowLabel({ children }: { children: ReactNode }) {
  return <span className="text-[12px] text-[var(--vs-text-soft)]">{children}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Breakpoint toggle (mobile / tablet / desktop)                              *
 * ─────────────────────────────────────────────────────────────────────────── */

export type Bp = "mobile" | "tablet" | "desktop";
const BP_ICON = { mobile: Smartphone, tablet: Tablet, desktop: Monitor } as const;

export function BreakpointTabs({ value, onChange, hide }: { value: Bp; onChange: (b: Bp) => void; hide?: Bp[] }) {
  const items: Bp[] = (["mobile", "tablet", "desktop"] as Bp[]).filter(b => !hide?.includes(b));
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md bg-[var(--vs-surface-2)] p-0.5">
      {items.map(b => {
        const Icon = BP_ICON[b];
        const active = value === b;
        return (
          <button
            key={b}
            type="button"
            onClick={() => onChange(b)}
            aria-pressed={active}
            className={`grid h-5 w-6 place-items-center rounded transition-colors ${
              active ? "bg-[var(--vs-surface-3)] text-[var(--vs-accent-hi)]" : "text-[var(--vs-text-dim)] hover:text-[var(--vs-text-soft)]"
            }`}
          >
            <Icon className="h-3 w-3" />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Color (with checker pattern when unset / transparent)                      *
 * ─────────────────────────────────────────────────────────────────────────── */

export function ColorField({ label, tokenKey, defaultValue = "" }: { label: string; tokenKey: string; defaultValue?: string }) {
  const { get, set } = useDesignTokens();
  const value = get<string>(tokenKey, defaultValue);
  const isEmpty = !value;
  return (
    <div className="flex items-center justify-between gap-2">
      <RowLabel>{label}</RowLabel>
      <label className="relative inline-flex h-6 w-9 cursor-pointer items-center justify-center overflow-hidden rounded ring-1 ring-[var(--vs-border-strong)]">
        <span
          className={`absolute inset-0 ${isEmpty ? "vs-checker" : ""}`}
          style={isEmpty ? undefined : { background: value }}
        />
        <input
          type="color"
          value={value || "#000000"}
          onChange={e => set({ [tokenKey]: e.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Toggle (boolean)                                                           *
 * ─────────────────────────────────────────────────────────────────────────── */

export function ToggleField({ label, tokenKey, defaultValue = false }: { label: string; tokenKey: string; defaultValue?: boolean }) {
  const { get, set } = useDesignTokens();
  const value = get<boolean>(tokenKey, defaultValue);
  return (
    <div className="flex items-center justify-between gap-2">
      <RowLabel>{label}</RowLabel>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => set({ [tokenKey]: !value })}
        className={`relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors ${
          value ? "bg-[#6366f1]" : "bg-[var(--vs-border-strong)]"
        }`}
      >
        <span
          className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-[16px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Slider + numeric input (for "Mezera mezi regiony", "Rozmazání pozadí", …)  *
 * ─────────────────────────────────────────────────────────────────────────── */

export function SliderField({
  label, tokenKey, min = 0, max = 100, step = 1, unit = "px", defaultValue = 0,
}: {
  label: string; tokenKey: string; min?: number; max?: number; step?: number; unit?: string; defaultValue?: number;
}) {
  const { get, set } = useDesignTokens();
  const raw = get<number | string>(tokenKey, defaultValue);
  const n = typeof raw === "number" ? raw : Number(raw) || 0;
  return (
    <div className="space-y-1">
      <RowLabel>{label}</RowLabel>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={n}
          onChange={e => set({ [tokenKey]: Number(e.target.value) })}
          className="flex-1 accent-[#6366f1]"
        />
        <div className="flex h-6 w-14 items-center justify-end gap-1 rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-1.5 text-[11.5px] text-[var(--vs-text)]">
          <input
            type="number"
            value={n}
            min={min}
            max={max}
            onChange={e => set({ [tokenKey]: Number(e.target.value) })}
            className="w-full bg-transparent text-right outline-none"
          />
          <span className="text-[10px] text-[var(--vs-text-dim)]">{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Padding pair (Horizontal + Vertical with link toggle)                      *
 * ─────────────────────────────────────────────────────────────────────────── */

export function PadField({
  label, hKey, vKey, defaultH = 0, defaultV = 0,
}: {
  label: string; hKey: string; vKey: string; defaultH?: number; defaultV?: number;
}) {
  const { get, set } = useDesignTokens();
  const h = Number(get<number | string>(hKey, defaultH)) || 0;
  const v = Number(get<number | string>(vKey, defaultV)) || 0;
  const [linked, setLinked] = useState(false);

  function update(which: "h" | "v", n: number) {
    if (linked) set({ [hKey]: n, [vKey]: n });
    else set({ [which === "h" ? hKey : vKey]: n });
  }

  return (
    <div className="space-y-1">
      <RowLabel>{label}</RowLabel>
      <div className="flex items-center gap-1.5">
        <PadInput icon="h" value={h} onChange={n => update("h", n)} sub="Horizontal" />
        <PadInput icon="v" value={v} onChange={n => update("v", n)} sub="Vertical" />
        <button
          type="button"
          onClick={() => setLinked(l => !l)}
          aria-pressed={linked}
          title={linked ? "Odpojit" : "Propojit"}
          className={`grid h-7 w-7 place-items-center rounded border border-[var(--vs-border-strong)] ${
            linked ? "bg-[var(--vs-surface-3)] text-[var(--vs-accent-hi)]" : "bg-[var(--vs-bg-soft)] text-[var(--vs-text-muted)]"
          }`}
        >
          {linked ? <LinkIcon className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

function PadInput({ icon, value, onChange, sub }: { icon: "h" | "v"; value: number; onChange: (n: number) => void; sub: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <div className="flex h-7 items-center rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-1.5 focus-within:border-[var(--vs-accent)]">
        <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 text-[var(--vs-text-dim)]" fill="currentColor">
          {icon === "h" ? (
            <path d="M2 3v10h1V3H2zm11 0v10h1V3h-1zM4 7.5h8v1H4v-1z" />
          ) : (
            <path d="M3 2v1h10V2H3zm0 11v1h10v-1H3zM7.5 4v8h1V4h-1z" />
          )}
        </svg>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="ml-1 w-full bg-transparent text-right text-[11.5px] text-[var(--vs-text)] outline-none"
        />
        <span className="text-[10px] text-[var(--vs-text-dim)]">px</span>
      </div>
      <span className="text-[10px] text-[var(--vs-text-dim)]">{sub}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Select (font, weight, etc.)                                                *
 * ─────────────────────────────────────────────────────────────────────────── */

export function SelectField({
  label, tokenKey, options, defaultValue,
}: {
  label: string; tokenKey: string; options: { value: string; label: string }[]; defaultValue?: string;
}) {
  const { get, set } = useDesignTokens();
  const value = get<string>(tokenKey, defaultValue ?? options[0]?.value ?? "");
  return (
    <div className="space-y-1">
      <RowLabel>{label}</RowLabel>
      <select
        value={value}
        onChange={e => set({ [tokenKey]: e.target.value })}
        className="block h-8 w-full appearance-none rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-2 pr-7 text-[12px] text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%238a8a96' stroke-width='1.5'><path d='M3 4.5l3 3 3-3'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 6px center",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Compact numeric box used inside compound rows (Border / Shadow)           *
 * ─────────────────────────────────────────────────────────────────────────── */

function NumBox({ value, onChange, sub, min = 0, max = 200 }: { value: number; onChange: (n: number) => void; sub: string; min?: number; max?: number }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <div className="flex h-7 items-center rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-1.5 focus-within:border-[var(--vs-accent)]">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent text-right text-[11.5px] text-[var(--vs-text)] outline-none"
        />
        <span className="ml-0.5 text-[10px] text-[var(--vs-text-dim)]">px</span>
      </div>
      <span className="text-[10px] text-[var(--vs-text-dim)]">{sub}</span>
    </div>
  );
}

function ColorSwatch({ tokenKey }: { tokenKey: string }) {
  const { get, set } = useDesignTokens();
  const value = get<string>(tokenKey, "");
  const isEmpty = !value;
  return (
    <div className="flex flex-col gap-0.5">
      <label className="relative inline-flex h-7 w-9 cursor-pointer items-center justify-center overflow-hidden rounded border border-[var(--vs-border-strong)]">
        <span className={`absolute inset-0 ${isEmpty ? "vs-checker" : ""}`} style={isEmpty ? undefined : { background: value }} />
        <input
          type="color"
          value={value || "#000000"}
          onChange={e => set({ [tokenKey]: e.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <span className="text-[10px] text-[var(--vs-text-dim)]">Color</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Border (Color + Size + Radius row)                                         *
 * ─────────────────────────────────────────────────────────────────────────── */

export function BorderField({ label = "Rámeček", colorKey, sizeKey, radiusKey }: { label?: string; colorKey: string; sizeKey: string; radiusKey: string }) {
  const { get, set } = useDesignTokens();
  const size = Number(get<number | string>(sizeKey, 0)) || 0;
  const radius = Number(get<number | string>(radiusKey, 0)) || 0;
  return (
    <div className="space-y-1">
      <RowLabel>{label}</RowLabel>
      <div className="flex items-end gap-1.5">
        <ColorSwatch tokenKey={colorKey} />
        <NumBox value={size}   onChange={n => set({ [sizeKey]: n })}   sub="Size" />
        <NumBox value={radius} onChange={n => set({ [radiusKey]: n })} sub="Radius" max={120} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Shadow (Color + Blur + X + Y row)                                          *
 * ─────────────────────────────────────────────────────────────────────────── */

export function ShadowField({ label = "Stín", colorKey, blurKey, xKey, yKey }: { label?: string; colorKey: string; blurKey: string; xKey: string; yKey: string }) {
  const { get, set } = useDesignTokens();
  const blur = Number(get<number | string>(blurKey, 0)) || 0;
  const x = Number(get<number | string>(xKey, 0)) || 0;
  const y = Number(get<number | string>(yKey, 0)) || 0;
  return (
    <div className="space-y-1">
      <RowLabel>{label}</RowLabel>
      <div className="flex items-end gap-1.5">
        <ColorSwatch tokenKey={colorKey} />
        <NumBox value={blur} onChange={n => set({ [blurKey]: n })} sub="Blur" />
        <NumBox value={x}    onChange={n => set({ [xKey]: n })}    sub="X" min={-200} />
        <NumBox value={y}    onChange={n => set({ [yKey]: n })}    sub="Y" min={-200} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Text input (label / value)                                                 *
 * ─────────────────────────────────────────────────────────────────────────── */

export function TextField({ label, tokenKey, defaultValue = "", placeholder }: { label: string; tokenKey: string; defaultValue?: string; placeholder?: string }) {
  const { get, set } = useDesignTokens();
  const value = get<string>(tokenKey, defaultValue);
  return (
    <div className="space-y-1">
      <RowLabel>{label}</RowLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => set({ [tokenKey]: e.target.value })}
        className="block h-8 w-full rounded border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-2 text-[12px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none focus:border-[var(--vs-accent)]"
      />
    </div>
  );
}
