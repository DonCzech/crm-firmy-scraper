"use client";

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import clsx from "clsx";
import { useGenericInlineEditor, type GenericTextStyle } from "@/components/tenant/GenericInlineEditorContext";
import { useStudio } from "../StudioContext";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "56px", "72px"];
const WEIGHTS: Array<{ value: string; label: string }> = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Black" },
];

export function StyleInspectorTab({ section }: { section: Section; state: StudioState }) {
  const studio = useStudio();
  const editor = useGenericInlineEditor();
  const field = studio.selectedField;

  if (!field) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1c] text-[#52525b]">
          <Type className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <p className="text-xs text-[#a1a1aa]">Klikni na text v náhledu pro stylování.</p>
      </div>
    );
  }

  const style = editor.getStyle(section.id, field);

  function apply(patch: Partial<GenericTextStyle>) {
    editor.updateStyle(section.id, field as string, { ...style, ...patch });
  }

  const isBold = style.fontWeight && Number(style.fontWeight) >= 600;
  const isItalic = style.fontStyle === "italic";
  const isUnderline = style.textDecoration === "underline";

  return (
    <div className="space-y-4 p-3">
      <div>
        <Label>Pole</Label>
        <div className="mt-1 truncate rounded-md bg-[#0f0f10] px-2.5 py-1.5 font-mono text-[11px] text-blue-400">{field}</div>
      </div>

      <div>
        <Label>Barva</Label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={style.color ?? "#111827"}
            onChange={(e) => apply({ color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-[#27272a] bg-[#0f0f10]"
            aria-label="Barva textu"
          />
          <input
            type="text"
            value={style.color ?? ""}
            onChange={(e) => apply({ color: e.target.value })}
            placeholder="#111827"
            className="h-8 flex-1 rounded-md border border-[#27272a] bg-[#0f0f10] px-2.5 font-mono text-xs text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Velikost</Label>
          <select
            value={style.fontSize ?? ""}
            onChange={(e) => apply({ fontSize: e.target.value || undefined })}
            className="mt-1 h-8 w-full rounded-md border border-[#27272a] bg-[#0f0f10] px-2 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="">Výchozí</option>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <Label>Tloušťka</Label>
          <select
            value={style.fontWeight ?? ""}
            onChange={(e) => apply({ fontWeight: e.target.value || undefined })}
            className="mt-1 h-8 w-full rounded-md border border-[#27272a] bg-[#0f0f10] px-2 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="">Výchozí</option>
            {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>Formátování</Label>
        <div className="mt-1 flex gap-1">
          <Toggle
            active={!!isBold}
            label="Bold"
            onClick={() => apply({ fontWeight: isBold ? "400" : "700" })}
          ><Bold className="h-3.5 w-3.5" strokeWidth={1.75} /></Toggle>
          <Toggle
            active={!!isItalic}
            label="Italic"
            onClick={() => apply({ fontStyle: isItalic ? "normal" : "italic" })}
          ><Italic className="h-3.5 w-3.5" strokeWidth={1.75} /></Toggle>
          <Toggle
            active={!!isUnderline}
            label="Underline"
            onClick={() => apply({ textDecoration: isUnderline ? "none" : "underline" })}
          ><Underline className="h-3.5 w-3.5" strokeWidth={1.75} /></Toggle>
        </div>
      </div>

      <div>
        <Label>Zarovnání</Label>
        <div className="mt-1 flex gap-1">
          {(["left", "center", "right"] as const).map((a) => {
            const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
            return (
              <Toggle
                key={a}
                active={style.textAlign === a}
                label={a}
                onClick={() => apply({ textAlign: a })}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Toggle>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10.5px] font-medium uppercase tracking-wide text-[#a1a1aa]">{children}</span>;
}

function Toggle({ children, active, label, onClick }: { children: React.ReactNode; active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={clsx(
        "inline-flex h-8 flex-1 items-center justify-center rounded-md border transition-colors duration-150",
        active
          ? "border-blue-500 bg-blue-500/10 text-blue-300"
          : "border-[#27272a] bg-[#0f0f10] text-[#a1a1aa] hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
