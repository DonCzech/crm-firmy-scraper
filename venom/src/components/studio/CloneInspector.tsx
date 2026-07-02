"use client";

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import clsx from "clsx";
import { useStudio, type CloneSelection } from "./StudioContext";

/**
 * Right-side Inspector for full-page-clone tenants.
 * Shown when an element inside the clone iframe is selected. Editing
 * controls dispatch `CloneCommand` via studio.cloneCommand which is
 * registered by ClonedStudioFrame and forwarded to the iframe runtime.
 */

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "56px", "72px"];
const WEIGHTS: Array<{ value: string; label: string }> = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Black" },
];

function cssColorToHex(c: string): string {
  // Accept already-hex
  if (c.startsWith("#")) return c;
  const m = c.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return "#000000";
  const [, r, g, b] = m;
  const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function pxToNearest(value: string, list: string[]): string {
  const px = parseFloat(value);
  if (!Number.isFinite(px)) return list[2];
  let best = list[0];
  let dist = Infinity;
  for (const s of list) {
    const d = Math.abs(parseFloat(s) - px);
    if (d < dist) { dist = d; best = s; }
  }
  return best;
}

export function CloneInspector({ selected }: { selected: CloneSelection }) {
  const studio = useStudio();

  function send(patch: Partial<CloneSelection["style"]>) {
    studio.cloneCommand?.({ type: "setStyle", editId: selected.editId, patch });
  }

  const isBold = Number(selected.style.fontWeight) >= 600;
  const isItalic = selected.style.fontStyle === "italic";
  const isUnderline = (selected.style.textDecoration || "").includes("underline");
  const align = (selected.style.textAlign || "left") as "left" | "center" | "right" | "justify" | "start" | "end";

  return (
    <div className="space-y-4 p-3 text-xs text-[var(--vs-text-soft)]">
      <div>
        <Label>Vybraný prvek</Label>
        <div className="mt-1 flex items-center gap-2 rounded-md bg-[#0f0f10] px-2.5 py-2 font-mono text-[11px]">
          <span className="text-[var(--vs-accent)]">{`<${selected.tag}>`}</span>
          {selected.tag === "img" ? (
            <span className="truncate text-[var(--vs-text-muted)]">{selected.src?.split("/").pop()}</span>
          ) : (
            <span className="truncate text-[var(--vs-text-muted)]">{selected.text.slice(0, 40) || "(prázdné)"}</span>
          )}
        </div>
      </div>

      {selected.tag !== "img" && (
        <>
          <div>
            <Label>Formátování</Label>
            <div className="mt-1 flex gap-1">
              <ToggleBtn active={isBold} onClick={() => send({ fontWeight: isBold ? "400" : "700" })}><Bold className="h-3.5 w-3.5" /></ToggleBtn>
              <ToggleBtn active={isItalic} onClick={() => send({ fontStyle: isItalic ? "normal" : "italic" })}><Italic className="h-3.5 w-3.5" /></ToggleBtn>
              <ToggleBtn active={isUnderline} onClick={() => send({ textDecoration: isUnderline ? "none" : "underline" })}><Underline className="h-3.5 w-3.5" /></ToggleBtn>
            </div>
          </div>

          <div>
            <Label>Zarovnání</Label>
            <div className="mt-1 flex gap-1">
              <ToggleBtn active={align === "left" || align === "start"} onClick={() => send({ textAlign: "left" })}><AlignLeft className="h-3.5 w-3.5" /></ToggleBtn>
              <ToggleBtn active={align === "center"} onClick={() => send({ textAlign: "center" })}><AlignCenter className="h-3.5 w-3.5" /></ToggleBtn>
              <ToggleBtn active={align === "right" || align === "end"} onClick={() => send({ textAlign: "right" })}><AlignRight className="h-3.5 w-3.5" /></ToggleBtn>
            </div>
          </div>

          <div>
            <Label>Velikost</Label>
            <select
              className="mt-1 w-full rounded-md border border-[var(--vs-surface-2)] bg-[#0f0f10] px-2 py-1.5 text-[12px] text-white focus:border-[var(--vs-accent)] focus:outline-none"
              value={pxToNearest(selected.style.fontSize, SIZES)}
              onChange={(e) => send({ fontSize: e.target.value })}
            >
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <Label>Tloušťka písma</Label>
            <select
              className="mt-1 w-full rounded-md border border-[var(--vs-surface-2)] bg-[#0f0f10] px-2 py-1.5 text-[12px] text-white focus:border-[var(--vs-accent)] focus:outline-none"
              value={selected.style.fontWeight || "400"}
              onChange={(e) => send({ fontWeight: e.target.value })}
            >
              {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label} ({w.value})</option>)}
            </select>
          </div>

          <div>
            <Label>Barva textu</Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={cssColorToHex(selected.style.color)}
                onChange={(e) => send({ color: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded-md border border-[var(--vs-surface-2)] bg-transparent"
              />
              <code className="font-mono text-[11px] text-[var(--vs-text-muted)]">{cssColorToHex(selected.style.color)}</code>
            </div>
          </div>
        </>
      )}

      <div>
        <Label>Pozadí</Label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={cssColorToHex(selected.style.backgroundColor)}
            onChange={(e) => send({ backgroundColor: e.target.value })}
            className="h-8 w-12 cursor-pointer rounded-md border border-[var(--vs-surface-2)] bg-transparent"
          />
          <code className="font-mono text-[11px] text-[var(--vs-text-muted)]">{cssColorToHex(selected.style.backgroundColor)}</code>
          <button
            type="button"
            onClick={() => send({ backgroundColor: "transparent" })}
            className="ml-auto rounded-md border border-[var(--vs-surface-2)] bg-[#0f0f10] px-2 py-1 text-[11px] text-[var(--vs-text-muted)] hover:text-white"
          >
            Průhledné
          </button>
        </div>
      </div>

      {selected.tag === "img" && selected.src && (
        <div>
          <Label>URL obrázku</Label>
          <input
            type="text"
            defaultValue={selected.src}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== selected.src) {
                studio.cloneCommand?.({ type: "setSrc", editId: selected.editId, src: v });
              }
            }}
            className="mt-1 w-full rounded-md border border-[var(--vs-surface-2)] bg-[#0f0f10] px-2 py-1.5 font-mono text-[11px] text-white focus:border-[var(--vs-accent)] focus:outline-none"
          />
        </div>
      )}

      <div className="border-t border-[var(--vs-surface-2)] pt-3 text-[10px] uppercase tracking-wider text-[var(--vs-text-dim)]">
        <Type className="mr-1 inline h-3 w-3" />Tip: Klikni v náhledu na text pro inline úpravu.
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--vs-text-dim)]">{children}</div>;
}

function ToggleBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
        active
          ? "border-[var(--vs-accent)] bg-[var(--vs-accent-bg)] text-[var(--vs-accent)]"
          : "border-[var(--vs-surface-2)] bg-[#0f0f10] text-[var(--vs-text-muted)] hover:border-[#3f3f46] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
