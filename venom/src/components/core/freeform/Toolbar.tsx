"use client";

import { Type, AlignLeft, MousePointer, Image as ImageIcon, Minus, Square, Trash2, Copy as CopyIcon, Plus, ChevronsUp, ChevronUp, ChevronsDown, ChevronDown, Undo2, Redo2, Smartphone, EyeOff } from "lucide-react";
import type { ElementType, FreeformEl, ButtonEl, BaseEl } from "./types";

type AnimPreset = NonNullable<BaseEl["animation"]>["preset"];
const ANIM_PRESETS: { value: AnimPreset; label: string }[] = [
  { value: "none",        label: "— Bez animace" },
  { value: "fade-in",     label: "Fade in" },
  { value: "slide-up",    label: "Slide nahoru" },
  { value: "slide-right", label: "Slide zprava" },
  { value: "zoom-in",     label: "Zoom in" },
  { value: "scale-hover", label: "Scale on hover" },
];

interface Props {
  onAdd: (t: ElementType) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  selectedEl: FreeformEl | null;
  onPatch: (patch: Partial<FreeformEl>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onToggleMobileHidden?: () => void;
}

const iconBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 26, width: 26, padding: 0,
  borderRadius: 6, border: "none",
  background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer",
};

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: 26, padding: "0 8px",
        borderRadius: 6, border: "none",
        background: "rgba(255,255,255,0.08)", color: "#fff",
        fontSize: 11, fontWeight: 600, cursor: "pointer",
      }}
    >
      <Plus className="h-3 w-3" strokeWidth={2.5} />
      {icon}
      {label}
    </button>
  );
}

export function FreeformAdminToolbar({
  onAdd, onDelete, onDuplicate, selectedEl, onPatch,
  onUndo, onRedo, canUndo, canRedo,
  onBringToFront, onSendToBack, onBringForward, onSendBackward,
  onToggleMobileHidden,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 70,
        zIndex: 5,
        marginBottom: 12,
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        padding: "6px 8px",
        borderRadius: 10,
        background: "rgba(15,23,42,0.94)",
        boxShadow: "0 12px 24px rgba(15,23,42,0.28)",
        color: "#fff",
      }}
    >
      <button onClick={onUndo} disabled={!canUndo} title="Zpět (⌘Z)" style={{ ...iconBtnStyle, opacity: canUndo ? 1 : 0.4 }}>
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} title="Vpřed (⌘⇧Z)" style={{ ...iconBtnStyle, opacity: canRedo ? 1 : 0.4 }}>
        <Redo2 className="h-3.5 w-3.5" />
      </button>
      <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />

      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, opacity: 0.6, paddingLeft: 4 }}>Přidat:</span>
      <ToolBtn onClick={() => onAdd("heading")} icon={<Type className="h-3.5 w-3.5" />}        label="Heading" />
      <ToolBtn onClick={() => onAdd("text")}    icon={<AlignLeft className="h-3.5 w-3.5" />}   label="Text" />
      <ToolBtn onClick={() => onAdd("button")}  icon={<MousePointer className="h-3.5 w-3.5" />} label="Button" />
      <ToolBtn onClick={() => onAdd("image")}   icon={<ImageIcon className="h-3.5 w-3.5" />}   label="Image" />
      <ToolBtn onClick={() => onAdd("divider")} icon={<Minus className="h-3.5 w-3.5" />}       label="Divider" />
      <ToolBtn onClick={() => onAdd("shape")}   icon={<Square className="h-3.5 w-3.5" />}      label="Shape" />

      {selectedEl && (
        <>
          <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />
          {(selectedEl.type === "heading" || selectedEl.type === "text" || selectedEl.type === "button") && (
            <>
              <input
                type="color"
                value={selectedEl.style?.color ?? "#0f172a"}
                onChange={(e) => onPatch({ style: { ...selectedEl.style, color: e.target.value } } as Partial<FreeformEl>)}
                title="Barva textu"
                style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
              />
              <input
                type="number"
                value={selectedEl.style?.fontSize ?? 16}
                onChange={(e) => onPatch({ style: { ...selectedEl.style, fontSize: parseInt(e.target.value, 10) || 16 } } as Partial<FreeformEl>)}
                style={{ width: 50, height: 24, padding: "0 4px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
                title="Velikost (px)"
              />
              <select
                value={selectedEl.style?.fontWeight ?? 400}
                onChange={(e) => onPatch({ style: { ...selectedEl.style, fontWeight: parseInt(e.target.value, 10) } } as Partial<FreeformEl>)}
                style={{ height: 24, borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
              >
                <option value={300}>300</option><option value={400}>400</option>
                <option value={500}>500</option><option value={600}>600</option>
                <option value={700}>700</option><option value={800}>800</option>
              </select>
            </>
          )}
          {(selectedEl.type === "button" || selectedEl.type === "shape" || selectedEl.type === "divider") && (
            <input
              type="color"
              value={selectedEl.style?.background ?? "var(--vs-accent)"}
              onChange={(e) => onPatch({ style: { ...selectedEl.style, background: e.target.value } } as Partial<FreeformEl>)}
              title="Barva pozadí"
              style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
            />
          )}
          {selectedEl.type === "button" && (
            <input
              type="url"
              value={(selectedEl as ButtonEl).href ?? ""}
              onChange={(e) => onPatch({ href: e.target.value } as Partial<FreeformEl>)}
              placeholder="Odkaz"
              style={{ width: 160, height: 24, padding: "0 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11 }}
            />
          )}
          <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
          {onBringToFront  && <button onClick={onBringToFront}  title="Úplně dopředu"      style={iconBtnStyle}><ChevronsUp   className="h-3.5 w-3.5" /></button>}
          {onBringForward  && <button onClick={onBringForward}  title="O úroveň dopředu"   style={iconBtnStyle}><ChevronUp    className="h-3.5 w-3.5" /></button>}
          {onSendBackward  && <button onClick={onSendBackward}  title="O úroveň dozadu"    style={iconBtnStyle}><ChevronDown  className="h-3.5 w-3.5" /></button>}
          {onSendToBack    && <button onClick={onSendToBack}    title="Úplně dozadu"        style={iconBtnStyle}><ChevronsDown className="h-3.5 w-3.5" /></button>}
          <span style={{ height: 18, width: 1, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
          {onDuplicate && <button onClick={onDuplicate} title="Duplikovat" style={iconBtnStyle}><CopyIcon className="h-3.5 w-3.5" /></button>}
          {onToggleMobileHidden && (
            <button
              onClick={onToggleMobileHidden}
              title={selectedEl?.mobileHidden ? "Skrytý na mobilu — klikni pro zobrazení" : "Skrýt na mobilu"}
              style={{ ...iconBtnStyle, color: selectedEl?.mobileHidden ? "#fbbf24" : "rgba(255,255,255,0.5)" }}
            >
              {selectedEl?.mobileHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
            </button>
          )}
          <select
            value={selectedEl?.animation?.preset ?? "none"}
            onChange={(e) => onPatch({ animation: { preset: e.target.value as AnimPreset } } as Partial<FreeformEl>)}
            title="Animace při načtení"
            style={{ height: 24, borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 11, paddingLeft: 4 }}
          >
            {ANIM_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {onDelete    && <button onClick={onDelete}    title="Smazat"     style={{ ...iconBtnStyle, color: "#fda4af" }}><Trash2 className="h-3.5 w-3.5" /></button>}
        </>
      )}
    </div>
  );
}
