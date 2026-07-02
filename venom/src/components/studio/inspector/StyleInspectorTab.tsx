"use client";

import { useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon, Droplet } from "@/components/studio/icons";
import clsx from "clsx";
import { useGenericInlineEditor, type GenericTextStyle } from "@/components/tenant/GenericInlineEditorContext";
import { useStudio } from "../StudioContext";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";
import { FieldReset } from "./FieldReset";

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "40px", "56px", "72px"];
const WEIGHTS: Array<{ value: string; label: string }> = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Black" },
];

export function StyleInspectorTab({ section, state }: { section: Section; state: StudioState }) {
  const studio = useStudio();
  const editor = useGenericInlineEditor();
  const field = studio.selectedField;

  return (
    <div className="space-y-5 p-3">
      {/* Section background — section-level, always visible regardless of
          text-field selection. Wires through state.patchSection so the
          public site picks it up the same way as the hero inspector. */}
      <SectionBackground section={section} state={state} />

      <div className="-mx-3 h-px bg-[var(--vs-border)]" />

      {field
        ? <FieldStyling section={section} editor={editor} field={field} />
        : (
          <div className="flex flex-col items-center px-6 py-6 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--vs-surface)] text-[var(--vs-text-dim)]">
              <Type className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <p className="text-[11.5px] text-[var(--vs-text-muted)]">Klikni na text v náhledu pro stylování písma.</p>
          </div>
        )
      }
    </div>
  );
}

/* ── Section background ────────────────────────────────────────────────── */

type BgTab = "color" | "image" | "video";

function SectionBackground({ section, state }: { section: Section; state: StudioState }) {
  // Read current bg from settings. Hero variants persist into settings.heroBg;
  // every other section uses settings.layout.backgroundColor + settings.layout.backgroundImage.
  // We expose a unified UI and write to both shapes so the chosen renderer
  // picks up the change regardless of where it reads from.
  const settings = (section.settings ?? {}) as Record<string, unknown>;
  const heroBg = (settings.heroBg ?? {}) as { tab?: BgTab; color?: string; imageUrl?: string; videoUrl?: string };
  const layout = (settings.layout ?? {}) as { backgroundColor?: string; backgroundImage?: string };

  const initialTab: BgTab = heroBg.tab ?? (layout.backgroundImage ? "image" : "color");
  const [tab, setTab] = useState<BgTab>(initialTab);

  const color    = heroBg.color    ?? layout.backgroundColor ?? "#ffffff";
  const imageUrl = heroBg.imageUrl ?? layout.backgroundImage ?? "";
  const videoUrl = heroBg.videoUrl ?? "";

  async function commit(patch: Partial<{ tab: BgTab; color: string; imageUrl: string; videoUrl: string }>) {
    const nextHeroBg = { ...heroBg, ...patch };
    const nextLayout = { ...layout };
    if (patch.color !== undefined)    nextLayout.backgroundColor = patch.color;
    if (patch.imageUrl !== undefined) nextLayout.backgroundImage = patch.imageUrl;
    await state.patchSection(section.id, {
      settings: { ...settings, heroBg: nextHeroBg, layout: nextLayout },
    });
  }

  const tabs: Array<{ id: BgTab; label: string; Icon: typeof Droplet }> = [
    { id: "color", label: "Barva",   Icon: Droplet },
    { id: "image", label: "Obrázek", Icon: ImageIcon },
    { id: "video", label: "Video",   Icon: Type },
  ];

  return (
    <div>
      <Label>Pozadí sekce</Label>
      <div className="mt-1.5 flex gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); void commit({ tab: t.id }); }}
            className={clsx(
              "inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md border text-[11.5px] font-medium transition-colors",
              tab === t.id
                ? "border-[var(--vs-accent)] bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                : "border-[var(--vs-border)] bg-[var(--vs-bg-soft)] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]",
            )}
          >
            <t.Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "color" && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => void commit({ color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)]"
            aria-label="Barva pozadí"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => void commit({ color: e.target.value })}
            placeholder="#ffffff"
            className="h-8 flex-1 rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 font-mono text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          />
        </div>
      )}

      {tab === "image" && (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => void commit({ imageUrl: e.target.value })}
            placeholder="https://… nebo /uploads/…"
            className="h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          />
          {imageUrl && (
            <div
              className="h-20 w-full rounded-md border border-[var(--vs-border)] bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-label="Náhled pozadí"
            />
          )}
          <p className="text-[10.5px] text-[var(--vs-text-dim)]">Pro upload klikni na obrázek v plátně a vyber Nahrát.</p>
        </div>
      )}

      {tab === "video" && (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => void commit({ videoUrl: e.target.value })}
            placeholder="https://… (mp4/webm)"
            className="h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          />
          <p className="text-[10.5px] text-[var(--vs-text-dim)]">URL videa (mp4/webm). Podporováno pouze hero sekcemi.</p>
        </div>
      )}
    </div>
  );
}

/* ── Field-level text styling (existing) ───────────────────────────────── */

function FieldStyling({
  section, editor, field,
}: {
  section: Section;
  editor: ReturnType<typeof useGenericInlineEditor>;
  field: string;
}) {
  const style = editor.getStyle(section.id, field);

  function apply(patch: Partial<GenericTextStyle>) {
    editor.updateStyle(section.id, field as string, { ...style, ...patch });
  }

  const isBold = style.fontWeight && Number(style.fontWeight) >= 600;
  const isItalic = style.fontStyle === "italic";
  const isUnderline = style.textDecoration === "underline";

  return (
    <div className="space-y-4">
      <div>
        <Label>Pole</Label>
        <div className="mt-1 truncate rounded-md bg-[var(--vs-bg-soft)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--vs-accent-hi)]">{field}</div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Barva</Label>
          <FieldReset
            onReset={() => apply({ color: undefined })}
            modified={style.color != null && style.color !== ""}
            title="Vrátit barvu na výchozí (šablona)"
          />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={style.color ?? "#111827"}
            onChange={(e) => apply({ color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)]"
            aria-label="Barva textu"
          />
          <input
            type="text"
            value={style.color ?? ""}
            onChange={(e) => apply({ color: e.target.value })}
            placeholder="#111827"
            className="h-8 flex-1 rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 font-mono text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center justify-between">
            <Label>Velikost</Label>
            <FieldReset
              onReset={() => apply({ fontSize: undefined })}
              modified={style.fontSize != null && style.fontSize !== ""}
              title="Vrátit velikost písma na výchozí"
            />
          </div>
          <select
            value={style.fontSize ?? ""}
            onChange={(e) => apply({ fontSize: e.target.value || undefined })}
            className="mt-1 h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2 text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          >
            <option value="">Výchozí</option>
            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Tloušťka</Label>
            <FieldReset
              onReset={() => apply({ fontWeight: undefined })}
              modified={style.fontWeight != null && style.fontWeight !== ""}
              title="Vrátit tloušťku písma na výchozí"
            />
          </div>
          <select
            value={style.fontWeight ?? ""}
            onChange={(e) => apply({ fontWeight: e.target.value || undefined })}
            className="mt-1 h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2 text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          >
            <option value="">Výchozí</option>
            {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Formátování</Label>
          <FieldReset
            onReset={() => apply({ fontStyle: undefined, textDecoration: undefined })}
            modified={isItalic || isUnderline}
            title="Vrátit formátování (italic/underline) na výchozí"
          />
        </div>
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
        <div className="flex items-center justify-between">
          <Label>Zarovnání</Label>
          <FieldReset
            onReset={() => apply({ textAlign: undefined })}
            modified={style.textAlign != null}
            title="Vrátit zarovnání na výchozí"
          />
        </div>
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
  return <span className="block text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">{children}</span>;
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
          ? "border-[var(--vs-accent)] bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
          : "border-[var(--vs-border)] bg-[var(--vs-bg-soft)] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
      )}
    >
      {children}
    </button>
  );
}
