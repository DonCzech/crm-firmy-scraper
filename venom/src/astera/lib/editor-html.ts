const BLOCK_TAGS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DIV",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "LI",
  "MAIN",
  "NAV",
  "P",
  "SECTION",
  "TD",
  "TH",
]);

const DROP_TAGS = new Set([
  "AUDIO",
  "BUTTON",
  "CANVAS",
  "IFRAME",
  "IMG",
  "INPUT",
  "SCRIPT",
  "SELECT",
  "STYLE",
  "SVG",
  "TEXTAREA",
  "VIDEO",
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToEditorHtml(value: string) {
  return escapeHtml(value).replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
}

function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  return "";
}

function sanitizeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent || "");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toUpperCase();
  if (DROP_TAGS.has(tag)) return "";
  if (tag === "BR") return "<br>";

  const children = Array.from(el.childNodes).map(sanitizeNode).join("");
  if (!children.trim() && !children.includes("<br>")) return "";

  if (tag === "B" || tag === "STRONG") return `<strong>${children}</strong>`;
  if (tag === "I" || tag === "EM") return `<em>${children}</em>`;
  if (tag === "U") return `<u>${children}</u>`;
  if (tag === "S" || tag === "STRIKE" || tag === "DEL") return `<s>${children}</s>`;
  if (tag === "A") {
    const href = cleanUrl(el.getAttribute("href") || "");
    return href ? `<a href="${escapeHtml(href)}">${children}</a>` : children;
  }

  if (BLOCK_TAGS.has(tag)) return `${children}<br>`;
  return children;
}

export function sanitizeEditorPaste(clipboard: DataTransfer, richText: boolean) {
  const plain = clipboard.getData("text/plain");
  if (!richText) return textToEditorHtml(plain);

  const html = clipboard.getData("text/html");
  if (!html) return textToEditorHtml(plain);

  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return Array.from(tmp.childNodes)
    .map(sanitizeNode)
    .join("")
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .replace(/^(\s*<br\s*\/?>)+|(<br\s*\/?>\s*)+$/gi, "")
    .trim();
}

export function selectionInside(root: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  return range.cloneRange();
}

export function restoreSelection(range: Range | null) {
  if (!range) return false;
  const sel = window.getSelection();
  if (!sel) return false;
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

export function ensureEditorSelection(root: HTMLElement, savedRange: Range | null) {
  root.focus();
  if (!selectionInside(root)) restoreSelection(savedRange);

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && root.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    if (!sel.isCollapsed) return sel.getRangeAt(0);
  }

  const range = document.createRange();
  range.selectNodeContents(root);
  sel?.removeAllRanges();
  sel?.addRange(range);
  return range;
}

export function applyInlineStyle(root: HTMLElement, savedRange: Range | null, styles: Partial<CSSStyleDeclaration>) {
  const range = ensureEditorSelection(root, savedRange);
  const selected = range.extractContents();
  const span = document.createElement("span");
  Object.assign(span.style, styles);
  span.appendChild(selected);
  range.insertNode(span);

  const sel = window.getSelection();
  const nextRange = document.createRange();
  nextRange.selectNodeContents(span);
  sel?.removeAllRanges();
  sel?.addRange(nextRange);
  return nextRange.cloneRange();
}
