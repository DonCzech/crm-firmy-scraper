"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";

type Spacing = "tight" | "normal" | "airy";

export function LayoutInspectorTab({ section, state }: { section: Section; state: StudioState }) {
  const layout = (section.settings?.layout ?? {}) as {
    spacing?: Spacing; backgroundColor?: string; hideOnMobile?: boolean; anchorId?: string;
  };
  const [spacing, setSpacing] = useState<Spacing>(layout.spacing ?? "normal");
  const [bg, setBg] = useState(layout.backgroundColor ?? "");
  const [hideMob, setHideMob] = useState(layout.hideOnMobile ?? false);
  const [anchor, setAnchor] = useState(layout.anchorId ?? "");

  useEffect(() => {
    setSpacing(layout.spacing ?? "normal");
    setBg(layout.backgroundColor ?? "");
    setHideMob(layout.hideOnMobile ?? false);
    setAnchor(layout.anchorId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id]);

  function commit(patch: Partial<typeof layout>) {
    const nextLayout = { ...layout, ...patch };
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), layout: nextLayout },
    });
  }

  return (
    <div className="space-y-4 p-3">
      <div>
        <Label>Vnitřní mezery</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {(["tight", "normal", "airy"] as Spacing[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSpacing(s); commit({ spacing: s }); }}
              className={clsx(
                "h-8 rounded-md border text-[11px] transition-colors duration-150",
                spacing === s
                  ? "border-[var(--vs-accent)] bg-[var(--vs-accent-bg)] text-[var(--vs-accent-hi)]"
                  : "border-[var(--vs-border)] bg-[var(--vs-bg-soft)] text-[var(--vs-text-muted)] hover:text-[var(--vs-text)]"
              )}
            >
              {s === "tight" ? "Stísněné" : s === "normal" ? "Normální" : "Vzdušné"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Barva pozadí</Label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={bg || "#ffffff"}
            onChange={(e) => { setBg(e.target.value); commit({ backgroundColor: e.target.value }); }}
            className="h-8 w-10 cursor-pointer rounded border border-[var(--vs-border)] bg-[var(--vs-bg-soft)]"
            aria-label="Barva pozadí"
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            onBlur={() => commit({ backgroundColor: bg })}
            placeholder="auto"
            className="h-8 flex-1 rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 font-mono text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
          />
        </div>
      </div>

      <div>
        <Label>Anchor ID</Label>
        <input
          type="text"
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          onBlur={() => commit({ anchorId: anchor })}
          placeholder="napr-sluzby"
          className="mt-1 h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 font-mono text-xs text-[var(--vs-text)] outline-none focus:border-[var(--vs-accent)]"
        />
        <p className="mt-1 text-[10.5px] text-[var(--vs-text-muted)]">Použij pro odkazy v menu (#anchor-id)</p>
      </div>

      <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
        <div>
          <div className="text-xs text-[var(--vs-text)]">Skrýt na mobilu</div>
          <div className="text-[10.5px] text-[var(--vs-text-muted)]">Sekce zmizí pod 768px</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={hideMob}
          onClick={() => { const v = !hideMob; setHideMob(v); commit({ hideOnMobile: v }); }}
          className={clsx(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
            hideMob ? "bg-blue-600" : "bg-[var(--vs-surface-3)]"
          )}
        >
          <span className={clsx("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", hideMob ? "translate-x-4" : "translate-x-1")} />
        </button>
      </div>

      <div className="flex items-center justify-between rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2">
        <div>
          <div className="text-xs text-[var(--vs-text)]">Viditelnost sekce</div>
          <div className="text-[10.5px] text-[var(--vs-text-muted)]">{section.is_visible ? "Zobrazená" : "Skrytá"}</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={section.is_visible}
          onClick={() => void state.patchSection(section.id, { is_visible: !section.is_visible })}
          className={clsx(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
            section.is_visible ? "bg-blue-600" : "bg-[var(--vs-surface-3)]"
          )}
        >
          <span className={clsx("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", section.is_visible ? "translate-x-4" : "translate-x-1")} />
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">{children}</span>;
}
