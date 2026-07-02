"use client";

import {
  useState, useRef, useEffect, useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { Info, Pencil, Trash2, Link2, Link2Off, Settings2, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import { MediaPickerModal } from "./MediaPickerModal";
import type { StudioState } from "./TenantStudioView";

// ─── Focus picker (same small circle as in HeroInspectorPanel) ────────────────

const PICKER_H = 220;

function FocusPicker({
  src, focus, onFocusChange,
}: {
  src: string;
  focus: { x: number; y: number };
  onFocusChange: (f: { x: number; y: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);
  // Actual rendered height of the img element (may exceed PICKER_H for tall images)
  const [imgH, setImgH] = useState(PICKER_H);

  // Track img height via ResizeObserver — fires on load AND on layout changes
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !src) return;
    const measure = () => setImgH(el.offsetHeight || PICKER_H);
    measure(); // in case already loaded (cached)
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  function calcXY(ev: ReactPointerEvent<HTMLDivElement>) {
    // Use IMG rect so the % is relative to the full image, not the clipped container
    const imgEl = imgRef.current;
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const r = imgEl ? imgEl.getBoundingClientRect() : containerEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((ev.clientY - r.top) / r.height) * 100));
    onFocusChange({ x: Math.round(x), y: Math.round(y) });
  }

  // Crosshair top in px within the container coordinate space
  const crosshairTopPx = (focus.y / 100) * imgH;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg bg-[#1e1e22] cursor-crosshair select-none touch-none"
      style={{ height: PICKER_H }}
      onPointerDown={(e) => {
        isDragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        calcXY(e);
      }}
      onPointerMove={(e) => { if (isDragging.current) calcXY(e); }}
      onPointerUp={() => { isDragging.current = false; }}
      onPointerCancel={() => { isDragging.current = false; }}
    >
      {src ? (
        /* Full image — not cropped, user picks focal point on the entire photo */
        <img
          ref={imgRef}
          src={src}
          alt="náhled"
          className="pointer-events-none block w-full h-auto"
          draggable={false}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[#555] text-[12px]">Bez obrázku</div>
      )}
      {/* Crosshair — positioned relative to full image height so it stays on the right spot */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white"
        style={{
          left: `${focus.x}%`,
          top: crosshairTopPx,
          boxShadow: "0 0 0 1.5px rgba(0,0,0,.6), 0 2px 10px rgba(0,0,0,.7)",
        }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
}

// ─── Mini toggle ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-[var(--vs-accent-solid)]" : "bg-[#3f3f46]"
      )}
    >
      <span className={clsx("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-1")} />
    </button>
  );
}

// ─── Main floating panel ──────────────────────────────────────────────────────

export function ImageFloatingPanel({ state }: { state: StudioState }) {
  const studio = useStudio();
  const panel = studio.imagePanel;

  const panelRef  = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const [pos, setPos]     = useState({ x: 0, y: 0 });
  const [focus, setFocus] = useState({ x: 50, y: 50 });
  const panelRef2 = useRef(panel); // keep latest panel ref for callbacks
  useEffect(() => { panelRef2.current = panel; }, [panel]);
  const [lightbox, setLightbox] = useState<"off" | "image" | "url">("off");
  const [showBtn, setShowBtn]   = useState(false);
  const [altText, setAltText]   = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Sync panel state when a new image is selected
  useEffect(() => {
    if (!panel) return;
    setPos({ x: panel.panelPos.x, y: panel.panelPos.y });
    setFocus({ x: panel.focus.x, y: panel.focus.y });
    setAltText(panel.alt ?? "");
    setLightbox("off");
    setShowBtn(false);
  }, [panel]);

  // Drag the panel
  function startDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button,input,select,textarea")) return;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    const onMove = (ev: PointerEvent) => {
      if (!dragStart.current) return;
      setPos({
        x: dragStart.current.px + ev.clientX - dragStart.current.mx,
        y: dragStart.current.py + ev.clientY - dragStart.current.my,
      });
    };
    const onUp = () => {
      dragStart.current = null;
      window.removeEventListener("pointermove", onMove);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  const close = useCallback(() => studio.setImagePanel(null), [studio]);

  // Close on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!panel || !mounted) return null;

  // Keep panel within viewport — panel is a scrollable flex column.
  // Ensure at least 350px of vertical space so FocusPicker + buttons + Hotovo are reachable.
  const clampedX = Math.max(8, Math.min(window.innerWidth  - 316, pos.x));
  const clampedY = Math.max(8, Math.min(window.innerHeight - 366, pos.y));
  const panelMaxH = window.innerHeight - clampedY - 16;

  return createPortal(
    <div data-studio>
      {/* Invisible backdrop to close on click-outside */}
      <button
        type="button"
        aria-label="Zavřít"
        tabIndex={-1}
        onClick={close}
        className="fixed inset-0 z-[200] cursor-default bg-transparent"
      />

      {/* The panel itself */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Nastavení obrázku"
        className="fixed z-[210] flex w-[300px] flex-col rounded-2xl border border-[#2a2a2e] bg-[var(--vs-surface)] shadow-[0_24px_80px_rgba(0,0,0,.75)]"
        style={{ left: clampedX, top: clampedY, maxHeight: panelMaxH }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="flex shrink-0 cursor-grab items-center justify-center py-2 active:cursor-grabbing"
          onPointerDown={startDrag}
        >
          <div className="h-1 w-10 rounded-full bg-[#3f3f46]" />
        </div>

        {/* Title */}
        <div className="shrink-0 px-4 pb-3">
          <span className="text-[15px] font-semibold text-white">Obrázek</span>
        </div>

        {/* Body — scrollable, fills remaining height between header and footer */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4 space-y-4">

          {/* Focus picker — drags update object-position live on the canvas image */}
          <FocusPicker
            src={panel.src}
            focus={focus}
            onFocusChange={(f) => {
              setFocus(f);
              panelRef2.current?.onFocusChange?.(f);
            }}
          />

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" title="Info o obrázku" className="text-[var(--vs-text-dim)] hover:text-white transition-colors">
                <Info className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                title="Vyměnit obrázek"
                onClick={() => setPickerOpen(true)}
                className="text-[var(--vs-text-dim)] hover:text-[var(--vs-accent)] transition-colors"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              {panel.onDelete && (
                <button
                  type="button"
                  title="Smazat z galerie"
                  onClick={() => { panel.onDelete!(); close(); }}
                  className="text-[var(--vs-text-dim)] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
            {/* Reset focal point to center */}
            <button
              type="button"
              title="Zarovnat na střed (50% 50%)"
              onClick={() => {
                const center = { x: 50, y: 50 };
                setFocus(center);
                panelRef2.current?.onFocusChange?.(center);
              }}
              className="rounded-lg border border-[var(--vs-surface-2)] bg-[#1a1a1d] px-2.5 py-1 text-[11px] text-[var(--vs-text-dim)] hover:text-white hover:border-[#3f3f46] transition-colors"
            >
              Střed
            </button>
          </div>

          {/* Vzhled row */}
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-[var(--vs-surface-2)] bg-[#1a1a1d] px-3 py-2.5 text-[13px] text-[var(--vs-text-muted)] hover:text-white transition-colors"
          >
            Vzhled <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {/* Odkaz */}
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--vs-text-dim)]">Odkaz</p>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--vs-surface-2)] bg-[#1a1a1d] px-3 py-2">
              <Link2 className="h-4 w-4 shrink-0 text-[var(--vs-text-dim)]" strokeWidth={1.75} />
              <span className="flex-1 truncate text-[12.5px] text-[var(--vs-text-muted)]">CMS odkaz</span>
              <div className="flex items-center gap-1.5 text-[var(--vs-text-dim)]">
                <button type="button" className="hover:text-[var(--vs-text-muted)]"><Pencil      className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
                <button type="button" className="hover:text-[var(--vs-text-muted)]"><Link2Off    className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
                <button type="button" className="hover:text-[var(--vs-text-muted)]"><Settings2   className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
              </div>
            </div>
          </div>

          {/* Lightbox */}
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--vs-text-dim)]">Otevřít v lightboxu</p>
            <div className="flex gap-1">
              {(["off","image","url"] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLightbox(opt)}
                  className={clsx(
                    "flex-1 rounded-lg border py-1.5 text-[11.5px] transition-colors",
                    lightbox === opt
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-[var(--vs-surface-2)] bg-[#1a1a1d] text-[var(--vs-text-dim)] hover:text-[var(--vs-text-muted)]"
                  )}
                >
                  {opt === "off" ? "Vypnuto" : opt === "image" ? "Obrázek" : "Odkaz"}
                </button>
              ))}
            </div>
          </div>

          {/* Další obsah */}
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.10em] text-[var(--vs-text-dim)]">Další obsah</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[var(--vs-text-muted)]">Zobrazit tlačítko</span>
              <Toggle checked={showBtn} onChange={setShowBtn} />
            </div>
            <div>
              <label className="block mb-1 text-[11.5px] text-[var(--vs-text-dim)]">Alternativní popisek</label>
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                className="w-full rounded-lg border border-[var(--vs-surface-2)] bg-[#1a1a1d] px-3 py-2 text-[12.5px] text-[var(--vs-text-muted)] outline-none focus:border-[#3f3f46] placeholder-[var(--vs-text-dim)]"
              />
            </div>
          </div>

          {/* Pokročilé */}
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-[var(--vs-surface-2)] bg-[#1a1a1d] px-3 py-2.5 text-[13px] text-[var(--vs-text-muted)] hover:text-white transition-colors"
          >
            Pokročilé <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--vs-surface-2)] px-4 py-3">
          <button
            type="button"
            onClick={() => { panelRef2.current?.onFocusSave?.(focus); close(); }}
            className="w-full rounded-xl bg-[var(--vs-surface-2)] py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#2a2a2e] transition-colors"
          >
            Hotovo
          </button>
        </div>
      </div>

      {/* Media picker modal */}
      {pickerOpen && (
        <MediaPickerModal
          tenantSlug={state.tenant.slug}
          onPick={(url, alt) => {
            if (panel.onReplace) panel.onReplace(url, alt);
            // Auto-align focal point to center when replacing image
            const center = { x: 50, y: 50 };
            setFocus(center);
            panelRef2.current?.onFocusChange?.(center);
            panelRef2.current?.onFocusSave?.(center);
            studio.setImagePanel({ ...panel, src: url, alt, focus: center });
            // Refresh mobile/tablet iframe preview (no-op on desktop canvas).
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("studio:request-iframe-refresh"));
            }
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>,
    document.body
  );
}
