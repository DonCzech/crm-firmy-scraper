/**
 * Vlastní téma editoru (Vzhled editoru → „Vlastní").
 *
 * Uživatel vybere jednu základní barvu a odsud se odvodí kompletní akcentová
 * paleta (akcenty, solid tlačítka, brand gradient, glow, CTA rodina, canvas
 * glow). Shell zůstává neutrálně grafitový jako u výchozího violet tématu —
 * mění se všechno barevné. Aplikuje se jako <style id="vs-custom-theme">
 * s data-vs-theme="custom" selektory, tj. stejný mechanismus jako
 * silver/indigo témata v design-tokens.css.
 */

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360 / 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t0: number) => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(f(hue + 1 / 3) * 255),
    Math.round(f(hue) * 255),
    Math.round(f(hue - 1 / 3) * 255),
  ];
}

function hsl(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function rgbList(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `${r}, ${g}, ${b}`;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Vygeneruje CSS blok custom tématu z jedné základní barvy (#rrggbb). */
export function buildCustomThemeCss(baseHex: string): string {
  const parsed = hexToHsl(baseHex);
  if (!parsed) return "";
  const { h } = parsed;
  // Sytost držíme v rozumném pásmu — přesycené/vyšedlé volby by rozbily čitelnost
  const s = clamp(parsed.s, 0.25, 0.85);

  const accent      = hsl(h, s, 0.70);
  const accentHi    = hsl(h, s, 0.82);
  const accentRgb   = rgbList(h, s, 0.70);
  const solid       = hsl(h, clamp(s, 0.25, 0.72), 0.44);
  const solidHi     = hsl(h, clamp(s, 0.25, 0.72), 0.52);
  // Gradient: tmavší → base → světlejší s jemným posunem odstínu (jako violet)
  const gFrom       = hsl(h - 10, s, 0.46);
  const gMid        = hsl(h, s, 0.56);
  const gTo         = hsl(h + 10, s, 0.64);
  const gFromHi     = hsl(h - 10, s, 0.54);
  const gMidHi      = hsl(h, s, 0.64);
  const gToHi       = hsl(h + 10, s, 0.72);
  const ctaRgb      = rgbList(h, s, 0.56);
  const ctaSoftRgb  = rgbList(h, s, 0.72);
  const ctaText     = hsl(h, s, 0.74);
  const ctaTextHi   = hsl(h, clamp(s, 0.25, 0.6), 0.88);

  return [
    `:root[data-vs-theme="custom"],`,
    `:root[data-vs-theme="custom"] [data-studio] {`,
    `  --vs-accent: ${accent};`,
    `  --vs-accent-hi: ${accentHi};`,
    `  --vs-accent-bg: rgba(${accentRgb}, 0.12);`,
    `  --vs-accent-ring: rgba(${accentRgb}, 0.38);`,
    `  --vs-accent-solid: ${solid};`,
    `  --vs-accent-solid-hi: ${solidHi};`,
    `  --vs-grad-brand: linear-gradient(135deg, ${gFrom} 0%, ${gMid} 56%, ${gTo} 100%);`,
    `  --vs-grad-brand-hi: linear-gradient(135deg, ${gFromHi} 0%, ${gMidHi} 56%, ${gToHi} 100%);`,
    `  --vs-glow-accent: 0 0 0 1px rgba(${accentRgb}, 0.35), 0 8px 24px rgba(${accentRgb}, 0.16);`,
    `  --vs-glow-brand: 0 1px 0 0 rgba(255,255,255,0.20) inset, 0 2px 10px rgba(${ctaRgb}, 0.42), 0 6px 22px rgba(${ctaRgb}, 0.24);`,
    `  --vs-cta-grad: linear-gradient(135deg, ${gFrom} 0%, ${gMid} 56%, ${gTo} 100%);`,
    `  --vs-cta-rgb: ${ctaRgb};`,
    `  --vs-cta-soft-rgb: ${ctaSoftRgb};`,
    `  --vs-cta-text: ${ctaText};`,
    `  --vs-cta-text-hi: ${ctaTextHi};`,
    `  --vs-canvas-glow-rgb: ${ctaRgb};`,
    `}`,
  ].join("\n");
}
