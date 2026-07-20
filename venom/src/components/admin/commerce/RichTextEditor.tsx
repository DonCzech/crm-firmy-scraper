"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { sanitizeRichHtml, looksLikeHtml, plainTextToHtml } from "@/lib/commerce/html";

/**
 * Lehký WYSIWYG editor popisků (bez závislostí, contentEditable + execCommand).
 * Hodnota = sanitizované HTML (whitelist viz lib/commerce/html.ts).
 * Vkládané obrázky se nahrávají přes /api/demo/{slug}/upload-image.
 */

interface Props {
  value: string;
  onChange: (html: string) => void;
  tenantSlug: string;
  placeholder?: string;
  minHeight?: number;
  /** Editor se roztáhne na výšku flex rodiče (žádná max výška). */
  fill?: boolean;
}

interface ToolbarBtn {
  key: string;
  label: React.ReactNode;
  title: string;
  cmd?: string;
  block?: string;
  wide?: boolean;
}

const BTN_GROUPS: ToolbarBtn[][] = [
  [
    { key: "p", label: "Text", title: "Odstavec", block: "P", wide: true },
    { key: "h2", label: "H2", title: "Nadpis sekce", block: "H2" },
    { key: "h3", label: "H3", title: "Podnadpis", block: "H3" },
  ],
  [
    { key: "bold", label: <strong>B</strong>, title: "Tučně (⌘B)", cmd: "bold" },
    { key: "italic", label: <em className="font-serif">I</em>, title: "Kurzíva (⌘I)", cmd: "italic" },
    { key: "underline", label: <span className="underline">U</span>, title: "Podtržení (⌘U)", cmd: "underline" },
  ],
  [
    { key: "insertUnorderedList", label: "• —", title: "Odrážkový seznam", cmd: "insertUnorderedList" },
    { key: "insertOrderedList", label: "1. —", title: "Číslovaný seznam", cmd: "insertOrderedList" },
  ],
  [
    { key: "justifyLeft", title: "Zarovnat vlevo", cmd: "justifyLeft", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h12M3 18h15" /></svg> },
    { key: "justifyCenter", title: "Zarovnat na střed", cmd: "justifyCenter", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M6 12h12M4.5 18h15" /></svg> },
    { key: "justifyRight", title: "Zarovnat vpravo", cmd: "justifyRight", label: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M9 12h12M6 18h15" /></svg> },
  ],
];

export function RichTextEditor({ value, onChange, tenantSlug, placeholder, minHeight = 320, fill = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef<string>("");
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [empty, setEmpty] = useState(!value);
  const [expanded, setExpanded] = useState(false);
  const [imgSel, setImgSel] = useState<HTMLImageElement | null>(null);
  const [, setImgVer] = useState(0);

  function selectImage(img: HTMLImageElement | null) {
    setImgSel((prev) => {
      if (prev && prev !== img) { prev.style.outline = ""; prev.style.outlineOffset = ""; }
      if (img) { img.style.outline = "3px solid #6366f1"; img.style.outlineOffset = "2px"; }
      return img;
    });
  }

  function setImageAlign(align: "left" | "right" | "full") {
    if (!imgSel) return;
    if (align === "full") imgSel.removeAttribute("data-align");
    else imgSel.setAttribute("data-align", align);
    emitRef.current?.();
    setImgVer((v) => v + 1); // data-align žije v DOM — vynutit překreslení aktivního stavu tlačítek
  }

  function removeImage() {
    if (!imgSel) return;
    imgSel.remove();
    setImgSel(null);
    emitRef.current?.();
  }

  // emit je definován níže — ref kvůli použití v handlerech výše
  const emitRef = useRef<(() => void) | null>(null);

  // Fullscreen režim: Escape zavírá, stránka pod popupem neroluje
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setExpanded(false); } };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  // Přepnutí režimu přemountuje contentEditable (portál) → znovu naplnit obsah
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = value ? (looksLikeHtml(value) ? sanitizeRichHtml(value) : plainTextToHtml(value)) : "";
    lastEmitted.current = value;
    setEmpty(!el.textContent?.trim() && !el.querySelector("img"));
    setImgSel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // Vnější hodnota → editor (jen když se liší od naposledy emitované, jinak skáče kurzor)
  useEffect(() => {
    const el = ref.current;
    if (!el || value === lastEmitted.current) return;
    const html = value ? (looksLikeHtml(value) ? sanitizeRichHtml(value) : plainTextToHtml(value)) : "";
    el.innerHTML = html;
    lastEmitted.current = value;
    setEmpty(!el.textContent?.trim() && !el.querySelector("img"));
  }, [value]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const html = sanitizeRichHtml(el.innerHTML);
    lastEmitted.current = html;
    setEmpty(!el.textContent?.trim() && !el.querySelector("img"));
    onChange(html);
  }, [onChange]);
  emitRef.current = emit;

  const refreshActive = useCallback(() => {
    const states: Record<string, boolean> = {};
    for (const cmd of ["bold", "italic", "underline", "insertUnorderedList", "insertOrderedList", "justifyLeft", "justifyCenter", "justifyRight"]) {
      try { states[cmd] = document.queryCommandState(cmd); } catch { states[cmd] = false; }
    }
    try {
      const block = (document.queryCommandValue("formatBlock") || "").toLowerCase();
      states.h2 = block === "h2";
      states.h3 = block === "h3";
      states.p = block === "p" || block === "div" || block === "";
    } catch { /* noop */ }
    setActive(states);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (ref.current && document.activeElement === ref.current) refreshActive();
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [refreshActive]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
    refreshActive();
  }

  function applyBtn(b: ToolbarBtn) {
    if (b.block) exec("formatBlock", `<${b.block}>`);
    else if (b.cmd) exec(b.cmd);
  }

  function addLink() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { alert("Nejdřív označte text, který má být odkazem."); return; }
    const url = window.prompt("Adresa odkazu (URL):", "https://");
    if (!url) return;
    exec("createLink", url);
  }

  async function uploadImage(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    // Okamžitý placeholder v místě kurzoru — uživatel vidí, že se obrázek nahrává
    const phId = `img-upload-${Date.now()}`;
    ref.current?.focus();
    document.execCommand(
      "insertHTML", false,
      `<p id="${phId}" style="background:#eef2ff;border:1px dashed #a5b4fc;border-radius:10px;padding:14px;text-align:center;color:#6366f1;font-size:12.5px;font-weight:600">⏳ Nahrávám obrázek ${file.name}…</p>`
    );
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/demo/${tenantSlug}/upload-image`, { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Upload selhal");
      const ph = ref.current?.querySelector(`#${phId}`);
      const img = document.createElement("img");
      img.src = (data as { url: string }).url;
      img.alt = "";
      if (ph) ph.replaceWith(img);
      else ref.current?.appendChild(img);
      emit();
    } catch (e) {
      ref.current?.querySelector(`#${phId}`)?.remove();
      emit();
      alert(e instanceof Error ? e.message : "Upload obrázku selhal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const insert = html ? sanitizeRichHtml(html) : plainTextToHtml(text);
    document.execCommand("insertHTML", false, insert);
    emit();
  }

  const btnCls = (isActive?: boolean) =>
    `inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[12.5px] font-semibold transition ${
      isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
    }`;

  const editorPanel = (
    <div className={expanded
      ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      : `${fill ? "flex min-h-0 flex-1 flex-col " : ""}overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-slate-400 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.06)]`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/95 px-2 py-1.5 backdrop-blur">
        {BTN_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5 after:mx-1.5 after:h-5 after:w-px after:bg-slate-200 last:after:hidden">
            {group.map((b) => (
              <button key={b.key} type="button" title={b.title} tabIndex={-1}
                onMouseDown={(e) => { e.preventDefault(); applyBtn(b); }}
                className={btnCls(active[b.cmd ?? b.key])}>
                {b.label}
              </button>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-0.5">
          <button type="button" title="Vložit odkaz" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); addLink(); }} className={btnCls()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
          </button>
          <button type="button" title="Vložit obrázek" tabIndex={-1} disabled={uploading}
            onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }} className={btnCls()}>
            {uploading ? (
              <span className="text-[11px]">…</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            )}
          </button>
          <button type="button" title="Vodorovná čára" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); exec("insertHorizontalRule"); }} className={btnCls()}>
            —
          </button>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <button type="button" title="Vyčistit formátování" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); exec("formatBlock", "<P>"); }}
            className={`${btnCls()} text-[11.5px]`}>
            Vyčistit
          </button>
          <button type="button" tabIndex={-1}
            title={expanded ? "Zavřít velký editor (Esc)" : "Roztáhnout na celou obrazovku"}
            onMouseDown={(e) => { e.preventDefault(); setExpanded((x) => !x); }}
            className={btnCls(expanded)}>
            {expanded ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
            )}
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files)} />
      </div>

      {/* Kontextová lišta vybraného obrázku */}
      {imgSel && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-indigo-100 bg-indigo-50/80 px-3 py-1.5">
          <span className="mr-1 text-[11.5px] font-bold uppercase tracking-wide text-indigo-500">Obrázek:</span>
          {([
            ["left", "◧ Obtékat vlevo", "Obrázek vlevo, text obtéká zprava"],
            ["right", "◨ Obtékat vpravo", "Obrázek vpravo, text obtéká zleva"],
            ["full", "▭ Celá šířka", "Obrázek přes celou šířku popisu"],
          ] as const).map(([align, label, title]) => {
            const isOn = align === "full" ? !imgSel.getAttribute("data-align") : imgSel.getAttribute("data-align") === align;
            return (
              <button key={align} type="button" title={title} tabIndex={-1}
                onMouseDown={(e) => { e.preventDefault(); setImageAlign(align); }}
                className={`inline-flex h-7 items-center rounded-lg px-2.5 text-[12px] font-semibold transition ${
                  isOn ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-700 hover:bg-indigo-100"
                }`}>
                {label}
              </button>
            );
          })}
          <span className="mx-1 h-4 w-px bg-indigo-200" />
          <button type="button" title="Smazat obrázek" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); removeImage(); }}
            className="inline-flex h-7 items-center rounded-lg px-2.5 text-[12px] font-semibold text-rose-600 transition hover:bg-rose-100">
            🗑 Smazat
          </button>
          <button type="button" tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); selectImage(null); }}
            className="ml-auto inline-flex h-7 items-center rounded-lg px-2 text-[12px] text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-700">
            ✕
          </button>
        </div>
      )}

      {/* Plocha editoru */}
      <div
        className={expanded || fill ? "relative min-h-0 flex-1 overflow-y-auto" : "relative"}
        style={!expanded && fill ? { minHeight } : undefined}
      >
        {empty && placeholder && (
          <div className="pointer-events-none absolute left-4 top-3.5 text-[13.5px] text-slate-400">{placeholder}</div>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          onPaste={onPaste}
          onFocus={refreshActive}
          onClick={(e) => {
            selectImage(e.target instanceof HTMLImageElement ? e.target : null);
          }}
          className={[
            expanded
              ? "mx-auto min-h-full w-full max-w-[900px] px-6 py-6 text-[15px] leading-[1.75]"
              : fill
                ? "min-h-full px-4 py-3.5 text-[13.5px] leading-[1.7]"
                : "max-h-[560px] overflow-y-auto px-4 py-3.5 text-[13.5px] leading-[1.7]",
            "flow-root text-slate-800 outline-none",
            "[&>*:first-child]:mt-0",
            "[&_h2]:mt-6 [&_h2]:clear-both [&_h2]:text-[17px] [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:text-slate-900",
            "[&_h3]:mt-5 [&_h3]:text-[14.5px] [&_h3]:font-bold [&_h3]:text-slate-900",
            "[&_p]:mt-3",
            "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:mt-1",
            "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:mt-1",
            "[&_strong]:font-bold [&_b]:font-bold",
            "[&_a]:text-blue-700 [&_a]:underline [&_a]:underline-offset-2",
            "[&_img]:mt-4 [&_img]:max-w-full [&_img]:cursor-pointer [&_img]:rounded-xl",
            // obtékané obrázky — stejné chování jako na stránce produktu
            "[&_img[data-align=left]]:float-left [&_img[data-align=left]]:mr-5 [&_img[data-align=left]]:mb-2 [&_img[data-align=left]]:!mt-1 [&_img[data-align=left]]:w-[42%]",
            "[&_img[data-align=right]]:float-right [&_img[data-align=right]]:ml-5 [&_img[data-align=right]]:mb-2 [&_img[data-align=right]]:!mt-1 [&_img[data-align=right]]:w-[42%]",
            "[&_hr]:my-5 [&_hr]:clear-both [&_hr]:border-slate-200",
            "[&_blockquote]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:italic",
          ].join(" ")}
          style={expanded || fill ? undefined : { minHeight }}
        />
      </div>
    </div>
  );

  if (!expanded) return editorPanel;

  // Portál na body: overlay překryje celý admin včetně levého menu,
  // bez ohledu na stacking contexty rodičů (transform/backdrop-filter apod.)
  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex flex-col bg-slate-900/60 p-2 font-sans text-slate-900 antialiased backdrop-blur-sm sm:p-5"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
    >
      {editorPanel}
    </div>,
    document.body
  );
}
