"use client";

import { useEffect, useRef } from "react";

interface Props {
  html: string;
  cssUrls?: string[];
  jsUrls?: string[];
  preloadImages?: string[];
  isAdmin?: boolean;
  sectionId?: number;
  tenantSlug?: string;
}

function extractHeroImage(html: string): string | null {
  const m = html.match(/url\(['"]?([^'")]+\.(jpg|jpeg|webp|png))['"]?\)/i);
  return m ? m[1] : null;
}

// Strip contentEditable artifacts from a cloned DOM tree before saving
function cleanHtmlForSave(container: HTMLElement): string {
  const clone = container.cloneNode(true) as HTMLElement;
  clone.querySelectorAll<HTMLElement>("[contenteditable]").forEach((el) => {
    el.removeAttribute("contenteditable");
    el.style.removeProperty("outline");
    el.style.removeProperty("cursor");
    el.style.removeProperty("background");
    el.style.removeProperty("box-shadow");
    if (!el.getAttribute("style")) el.removeAttribute("style");
  });
  // Also strip any injected admin UI nodes
  clone.querySelectorAll("[data-admin-ui]").forEach((el) => el.remove());
  return clone.innerHTML;
}

export function ClonedSiteRenderer({
  html,
  cssUrls = [],
  jsUrls = [],
  preloadImages,
  isAdmin,
  sectionId,
  tenantSlug,
}: Props) {
  const heroImage = preloadImages?.[0] ?? extractHeroImage(html);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin || !containerRef.current) return;

    const container = containerRef.current;

    // ── Selectors ────────────────────────────────────────────────────────────
    const TEXT_SELECTORS = "h1,h2,h3,h4,h5,h6,p,span,li,td,th,label,blockquote,a";

    // ── State ─────────────────────────────────────────────────────────────────
    let activeTextEl: HTMLElement | null = null;
    let activeImgEl: HTMLImageElement | null = null;
    let originalText = "";
    let originalSrc = "";
    let saving = false;

    // ── Studio bridge (active only when embedded in studio iframe) ─────────────
    const inStudio = typeof window !== "undefined" && window.parent !== window;
    let editIdCounter = 0;
    function ensureEditId(el: HTMLElement): string {
      let id = el.getAttribute("data-edit-id");
      if (!id) {
        id = `e${++editIdCounter}-${Date.now().toString(36)}`;
        el.setAttribute("data-edit-id", id);
      }
      return id;
    }
    function snapshotStyle(el: HTMLElement) {
      const cs = window.getComputedStyle(el);
      return {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        fontStyle: cs.fontStyle,
        textDecoration: cs.textDecorationLine || cs.textDecoration,
        color: cs.color,
        textAlign: cs.textAlign,
        backgroundColor: cs.backgroundColor,
      };
    }
    function postSelection(el: HTMLElement | null) {
      if (!inStudio) return;
      if (!el) {
        window.parent.postMessage({ __venomStudio: true, type: "deselect" }, "*");
        return;
      }
      const editId = ensureEditId(el);
      window.parent.postMessage({
        __venomStudio: true,
        type: "select",
        payload: {
          editId,
          tag: el.tagName.toLowerCase(),
          text: el.tagName === "IMG" ? "" : el.textContent?.slice(0, 200) ?? "",
          src: el.tagName === "IMG" ? (el as HTMLImageElement).src : null,
          style: snapshotStyle(el),
        },
      }, "*");
    }
    // Listen for inspector commands → apply + save
    function onStudioCommand(ev: MessageEvent) {
      const d = ev.data as { __venomStudioCmd?: boolean; type?: string; editId?: string; selector?: string; patch?: Record<string,string>; text?: string; src?: string };
      if (!d || !d.__venomStudioCmd) return;

      // ── Select-by-selector (clicked sub-layer in left panel) ──────────────
      if (d.type === "selectBySelector" && d.selector) {
        let el: HTMLElement | null = null;
        try { el = container.querySelector(d.selector) as HTMLElement | null; } catch { return; }
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Treat as click — image or text path
        if (el.tagName === "IMG") {
          activateImage(el as HTMLImageElement);
        } else {
          // Find a leaf editable element inside; if container has many children,
          // pick the first heading/text instead of activating the wrapper
          const inner = el.querySelector(TEXT_SELECTORS) as HTMLElement | null;
          if (inner && inner.textContent && inner.textContent.trim().length > 0) {
            activateText(inner);
          } else {
            // Just emit selection for inspector — style controls still work
            ensureEditId(el);
            postSelection(el);
            // Visual outline
            el.style.outline = "2px solid #6366f1";
            setTimeout(() => { el.style.outline = ""; }, 2500);
          }
        }
        return;
      }

      const target = container.querySelector(`[data-edit-id="${d.editId}"]`) as HTMLElement | null;
      if (!target) return;
      if (d.type === "setStyle" && d.patch) {
        for (const [k, v] of Object.entries(d.patch)) {
          (target.style as unknown as Record<string,string>)[k] = v;
        }
        void saveToDb();
        // Re-emit updated selection so inspector reflects applied style
        postSelection(target);
      } else if (d.type === "setText" && typeof d.text === "string") {
        target.textContent = d.text;
        void saveToDb();
      } else if (d.type === "setSrc" && typeof d.src === "string") {
        (target as HTMLImageElement).src = d.src;
        void saveToDb();
      }
    }
    if (inStudio) window.addEventListener("message", onStudioCommand);

    // ── Helper: create overlay element ────────────────────────────────────────
    function ui(tag: string, css: string, attrs: Record<string, string> = {}): HTMLElement {
      const el = document.createElement(tag);
      el.setAttribute("data-admin-ui", "1");
      el.style.cssText = css;
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    }

    // ── Status toast ──────────────────────────────────────────────────────────
    const toast = ui("div", `
      position:fixed;top:56px;left:50%;transform:translateX(-50%);
      background:#1e293b;color:#fff;font-size:12px;font-family:system-ui,sans-serif;
      padding:6px 18px;border-radius:20px;z-index:999999;
      pointer-events:none;opacity:0;transition:opacity .2s;white-space:nowrap;
      box-shadow:0 2px 12px rgba(0,0,0,.4);
    `);
    document.body.appendChild(toast);

    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    function showToast(msg: string, dur = 2500) {
      toast.textContent = msg;
      toast.style.opacity = "1";
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.style.opacity = "0"; }, dur);
    }

    // ── Formatting toolbar (text) ─────────────────────────────────────────────
    const fmtBar = ui("div", `
      position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
      background:#1e293b;border-radius:10px;z-index:999998;
      display:none;align-items:center;gap:2px;padding:4px 6px;
      box-shadow:0 4px 20px rgba(0,0,0,.5);
    `);

    const fmtButtons: [string, string, string][] = [
      ["B", "bold", "font-weight:700;font-size:14px"],
      ["I", "italic", "font-style:italic;font-size:14px"],
      ["U", "underline", "text-decoration:underline;font-size:14px"],
    ];

    fmtButtons.forEach(([label, cmd]) => {
      const btn = ui("button", `
        background:none;border:none;color:#e2e8f0;cursor:pointer;
        padding:5px 9px;border-radius:6px;font-family:system-ui,sans-serif;font-size:13px;
        transition:background .15s;
      `);
      btn.textContent = label;
      btn.title = cmd;
      btn.onmouseenter = () => { btn.style.background = "rgba(255,255,255,.15)"; };
      btn.onmouseleave = () => { btn.style.background = "none"; };
      btn.onmousedown = (e) => {
        e.preventDefault();
        document.execCommand(cmd, false);
      };
      fmtBar.appendChild(btn);
    });

    // Separator
    const sep = ui("div", "width:1px;height:18px;background:rgba(255,255,255,.2);margin:0 4px;");
    fmtBar.appendChild(sep);

    // Save text button
    const saveTextBtn = ui("button", `
      background:#16a34a;color:#fff;border:none;cursor:pointer;
      padding:5px 14px;border-radius:6px;font-size:12px;font-family:system-ui,sans-serif;
      transition:background .15s;
    `);
    saveTextBtn.textContent = "💾 Uložit";
    fmtBar.appendChild(saveTextBtn);

    // Cancel text button
    const cancelTextBtn = ui("button", `
      background:rgba(255,255,255,.1);color:#e2e8f0;border:none;cursor:pointer;
      padding:5px 10px;border-radius:6px;font-size:12px;font-family:system-ui,sans-serif;
      transition:background .15s;
    `);
    cancelTextBtn.textContent = "✕";
    cancelTextBtn.title = "Zrušit (Esc)";
    fmtBar.appendChild(cancelTextBtn);

    document.body.appendChild(fmtBar);

    // ── Image edit panel ──────────────────────────────────────────────────────
    const imgPanel = ui("div", `
      position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
      background:#1e293b;border-radius:12px;z-index:999998;
      display:none;flex-direction:column;gap:10px;padding:14px 18px;min-width:340px;
      box-shadow:0 4px 24px rgba(0,0,0,.6);
    `);

    const imgPanelTitle = ui("div", "color:#94a3b8;font-size:11px;font-family:system-ui,sans-serif;font-weight:600;letter-spacing:.05em;text-transform:uppercase;");
    imgPanelTitle.textContent = "Upravit obrázek";
    imgPanel.appendChild(imgPanelTitle);

    // URL input row
    const urlRow = ui("div", "display:flex;gap:8px;align-items:center;");
    const urlInput = document.createElement("input");
    urlInput.setAttribute("data-admin-ui", "1");
    urlInput.type = "text";
    urlInput.placeholder = "URL obrázku…";
    urlInput.style.cssText = `
      flex:1;background:#0f172a;border:1px solid #334155;color:#e2e8f0;
      border-radius:6px;padding:6px 10px;font-size:12px;font-family:system-ui,sans-serif;
      outline:none;
    `;
    urlRow.appendChild(urlInput);
    imgPanel.appendChild(urlRow);

    // Upload row
    const uploadRow = ui("div", "display:flex;gap:8px;align-items:center;");
    const fileInput = document.createElement("input");
    fileInput.setAttribute("data-admin-ui", "1");
    fileInput.type = "file";
    fileInput.accept = "image/jpeg,image/png,image/webp";
    fileInput.style.display = "none";

    const uploadBtn = ui("button", `
      background:#4f46e5;color:#fff;border:none;cursor:pointer;
      padding:6px 14px;border-radius:6px;font-size:12px;font-family:system-ui,sans-serif;
      display:flex;align-items:center;gap:6px;transition:background .15s;
    `);
    uploadBtn.setAttribute("type", "button");
    uploadBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/></svg> Nahrát foto`;
    uploadBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); fileInput.click(); };
    uploadRow.appendChild(uploadBtn);

    const uploadStatus = ui("span", "font-size:11px;color:#94a3b8;font-family:system-ui,sans-serif;");
    uploadRow.appendChild(uploadStatus);
    uploadRow.appendChild(fileInput);
    imgPanel.appendChild(uploadRow);

    // Image action buttons
    const imgBtnRow = ui("div", "display:flex;gap:8px;justify-content:flex-end;margin-top:4px;");
    const saveImgBtn = ui("button", `
      background:#16a34a;color:#fff;border:none;cursor:pointer;
      padding:6px 16px;border-radius:6px;font-size:12px;font-family:system-ui,sans-serif;
    `);
    saveImgBtn.setAttribute("type", "button");
    saveImgBtn.textContent = "💾 Uložit do DB";

    const cancelImgBtn = ui("button", `
      background:rgba(255,255,255,.1);color:#e2e8f0;border:none;cursor:pointer;
      padding:6px 12px;border-radius:6px;font-size:12px;font-family:system-ui,sans-serif;
    `);
    cancelImgBtn.setAttribute("type", "button");
    cancelImgBtn.textContent = "Zrušit";

    imgBtnRow.appendChild(cancelImgBtn);
    imgBtnRow.appendChild(saveImgBtn);
    imgPanel.appendChild(imgBtnRow);
    document.body.appendChild(imgPanel);

    // ── Save to DB ────────────────────────────────────────────────────────────
    async function saveToDb() {
      if (saving) return false;
      saving = true;
      try {
        const cleanHtml = cleanHtmlForSave(container);
        const res = await fetch(`/api/demo/${tenantSlug}/sections/${sectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: { html: cleanHtml, cssUrls, jsUrls } }),
        });
        saving = false;
        return res.ok;
      } catch {
        saving = false;
        return false;
      }
    }

    // ── Text element activation ───────────────────────────────────────────────
    function activateText(el: HTMLElement) {
      deactivateAll();
      activeTextEl = el;
      originalText = el.innerHTML;
      el.contentEditable = "true";
      el.style.outline = "2px solid #6366f1";
      el.style.cursor = "text";
      el.focus();

      fmtBar.style.display = "flex";
      showToast("Editujete text — Uložit (Ctrl+Enter) · Zrušit (Esc)");
      postSelection(el);
    }

    function deactivateText(save: boolean) {
      if (!activeTextEl) return;
      const el = activeTextEl;
      if (!save) el.innerHTML = originalText;
      el.contentEditable = "false";
      el.style.outline = "";
      el.style.cursor = "";
      activeTextEl = null;
      fmtBar.style.display = "none";
    }

    async function saveText() {
      if (!activeTextEl) return;
      const textEl = activeTextEl;
      // Deactivate FIRST so artifacts are removed before save
      deactivateText(true);
      saveTextBtn.textContent = "Ukládám…";
      fmtBar.style.display = "flex";

      const ok = await saveToDb();
      if (ok) {
        showToast("✓ Text uložen");
      } else {
        showToast("✗ Chyba při ukládání — zkus znovu", 3000);
        // Restore
        activeTextEl = textEl;
        textEl.contentEditable = "true";
        textEl.style.outline = "2px solid #6366f1";
      }
      saveTextBtn.textContent = "💾 Uložit";
      if (!activeTextEl) fmtBar.style.display = "none";
    }

    // ── Image element activation ──────────────────────────────────────────────
    function activateImage(img: HTMLImageElement) {
      deactivateAll();
      activeImgEl = img;
      originalSrc = img.src;
      img.style.outline = "3px solid #6366f1";
      img.style.cursor = "pointer";

      urlInput.value = img.src;
      imgPanel.style.display = "flex";
      showToast("Klikni Nahrát foto nebo zadej URL obrázku");
      postSelection(img);
    }

    function deactivateImage(save: boolean) {
      if (!activeImgEl) return;
      const img = activeImgEl;
      if (!save) img.src = originalSrc;
      img.style.outline = "";
      img.style.cursor = "";
      activeImgEl = null;
      imgPanel.style.display = "none";
      uploadStatus.textContent = "";
    }

    async function saveImage() {
      if (!activeImgEl) return;
      // Apply URL if user typed a real URL (not our placeholder text)
      const urlVal = urlInput.value.trim();
      if (urlVal && !urlVal.startsWith("(") && !urlVal.startsWith("data:")) {
        activeImgEl.src = urlVal;
      }
      // img.src is already updated (either from upload or URL input)
      deactivateImage(true);

      saveImgBtn.textContent = "Ukládám…";
      const ok = await saveToDb();
      showToast(ok ? "✓ Obrázek uložen do DB" : "✗ Chyba při ukládání", ok ? 2500 : 3000);
      saveImgBtn.textContent = "💾 Uložit do DB";
    }

    // ── File upload handler — client-side only, no server write ──────────────
    // Converts image to compressed JPEG via Canvas → base64 data URI
    // Stored directly in img.src → saved to Neon DB with the HTML blob
    fileInput.onchange = () => {
      const file = fileInput.files?.[0];
      if (!file || !activeImgEl) return;

      uploadStatus.textContent = "Zpracovávám…";
      uploadBtn.style.opacity = "0.6";
      uploadBtn.style.pointerEvents = "none";

      const reader = new FileReader();
      reader.onload = (ev) => {
        const raw = ev.target?.result as string;
        if (!raw) { uploadStatus.textContent = "✗ Nelze načíst"; return; }

        // Resize + compress via Canvas (max 1200px wide, quality 82%)
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let { width, height } = img;
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { uploadStatus.textContent = "✗ Canvas chyba"; return; }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUri = canvas.toDataURL("image/jpeg", 0.82);

          if (activeImgEl) {
            activeImgEl.src = dataUri;
            urlInput.value = "(nahraný obrázek)";
          }
          uploadStatus.textContent = `✓ Připraveno — klikni Uložit`;
          uploadBtn.style.opacity = "1";
          uploadBtn.style.pointerEvents = "auto";
          fileInput.value = "";
        };
        img.onerror = () => {
          uploadStatus.textContent = "✗ Neplatný obrázek";
          uploadBtn.style.opacity = "1";
          uploadBtn.style.pointerEvents = "auto";
        };
        img.src = raw;
      };
      reader.onerror = () => {
        uploadStatus.textContent = "✗ Chyba čtení";
        uploadBtn.style.opacity = "1";
        uploadBtn.style.pointerEvents = "auto";
      };
      reader.readAsDataURL(file);
    };

    // ── Deactivate all ────────────────────────────────────────────────────────
    function deactivateAll() {
      deactivateText(false);
      deactivateImage(false);
    }

    // ── Mouse handlers ────────────────────────────────────────────────────────
    function onMouseOver(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("[data-admin-ui]")) return;

      // Image hover
      if (t.tagName === "IMG" && container.contains(t)) {
        if (activeImgEl === t) return;
        (t as HTMLImageElement).style.outline = "2px dashed #6366f1";
        (t as HTMLImageElement).style.cursor = "pointer";
        return;
      }

      // Text hover
      const el = t.closest(TEXT_SELECTORS) as HTMLElement | null;
      if (!el || !container.contains(el) || el === activeTextEl) return;
      el.style.outline = "1px dashed #6366f1";
      el.style.cursor = "pointer";
      showToast("Klikni pro úpravu", 1200);
    }

    function onMouseOut(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("[data-admin-ui]")) return;

      if (t.tagName === "IMG") {
        if (activeImgEl === t) return;
        (t as HTMLImageElement).style.outline = "";
        (t as HTMLImageElement).style.cursor = "";
        return;
      }

      const el = t.closest(TEXT_SELECTORS) as HTMLElement | null;
      if (!el || el === activeTextEl) return;
      el.style.outline = "";
      el.style.cursor = "";
    }

    function onClick(e: MouseEvent) {
      const t = e.target as HTMLElement;

      // Ignore admin UI clicks
      if (t.closest("[data-admin-ui]")) return;

      // Image click
      if (t.tagName === "IMG" && container.contains(t)) {
        e.preventDefault();
        activateImage(t as HTMLImageElement);
        return;
      }

      // Link click — prevent navigation, allow text edit
      if (t.tagName === "A") e.preventDefault();

      // Text click
      const el = t.closest(TEXT_SELECTORS) as HTMLElement | null;
      if (!el || !container.contains(el)) {
        // Click outside → deactivate
        if (activeTextEl || activeImgEl) deactivateAll();
        return;
      }
      activateText(el);
    }

    // ── Keyboard ──────────────────────────────────────────────────────────────
    function onKeyDown(e: KeyboardEvent) {
      if (activeTextEl) {
        if (e.key === "Escape") { e.preventDefault(); deactivateText(false); }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); saveText(); }
      }
      if (activeImgEl) {
        if (e.key === "Escape") { e.preventDefault(); deactivateImage(false); }
      }
    }

    // ── Button wiring ─────────────────────────────────────────────────────────
    saveTextBtn.addEventListener("click", saveText);
    cancelTextBtn.addEventListener("click", () => deactivateText(false));
    saveImgBtn.addEventListener("click", saveImage);
    cancelImgBtn.addEventListener("click", () => deactivateImage(false));

    container.addEventListener("mouseover", onMouseOver);
    container.addEventListener("mouseout", onMouseOut);
    container.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);

    // Initial hint
    const hintTimer = setTimeout(() => showToast("Klikni na text nebo foto pro úpravu", 3000), 800);

    return () => {
      clearTimeout(hintTimer);
      if (toastTimer) clearTimeout(toastTimer);
      toast.remove();
      fmtBar.remove();
      imgPanel.remove();
      fileInput.remove();
      container.removeEventListener("mouseover", onMouseOver);
      container.removeEventListener("mouseout", onMouseOut);
      container.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
      if (inStudio) window.removeEventListener("message", onStudioCommand);
    };
  }, [isAdmin, sectionId, tenantSlug, cssUrls, jsUrls]);

  // Load external scripts in sequence, then run inline scripts.
  // "defer" is ignored for dynamically inserted scripts — they load async and
  // may arrive out of order (Slick before jQuery → Slick throws, never inits).
  // Sequential loading guarantees: jQuery → jquery-migrate → Slick → bundle
  // before any inline polling code runs.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const created: HTMLScriptElement[] = [];
    let cancelled = false;

    function injectInlineScripts() {
      if (cancelled || !containerRef.current) return;
      containerRef.current.querySelectorAll<HTMLScriptElement>("script").forEach((s) => {
        if (s.src) return;
        const t = (s.type ?? "").toLowerCase();
        if (t && t !== "text/javascript" && t !== "application/javascript") return;
        const code = s.textContent ?? "";
        if (!code.trim()) return;
        const ns = document.createElement("script");
        // IIFE prevents "duplicate variable" errors on StrictMode double-invoke
        ns.textContent = `;(function(){\n${code}\n})();`;
        document.body.appendChild(ns);
        created.push(ns);
      });
    }

    function loadNext(urls: string[], onDone: () => void) {
      if (cancelled || !urls.length) { onDone(); return; }
      const [src, ...rest] = urls;
      // Skip if already loaded (same src already in DOM)
      if (document.querySelector(`script[src="${src}"]`)) {
        loadNext(rest, onDone);
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => loadNext(rest, onDone);
      s.onerror = () => loadNext(rest, onDone); // continue on error
      document.body.appendChild(s);
      created.push(s);
    }

    loadNext(jsUrls, injectInlineScripts);

    return () => {
      cancelled = true;
      created.forEach((s) => s.remove());
    };
  }, [html, jsUrls]);

  return (
    <>
      {cssUrls.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      {heroImage && (
        <link rel="preload" as="image" href={heroImage} fetchPriority="high" />
      )}
      <div
        ref={containerRef}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
