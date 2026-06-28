"use client";

import { useMemo } from "react";

type TokenValue = string | number | boolean | null;

/**
 * Generic Design-token overrides.
 *
 * Templates have hardcoded styles (background gradients, padding, letter-
 * spacing). To make Studio Design panel changes visible *without* editing
 * every template, we emit a scoped `<style>` block that applies the active
 * tokens via `!important` rules targeting common elements within a
 * `[data-design-host]` wrapper. The host is the canvas preview in the editor
 * and the body wrapper in public render — both opt in by adding the attr.
 */
export function DesignOverrides({ tokens, hostSelector = "[data-design-host]" }: {
  tokens: Record<string, TokenValue> | undefined;
  hostSelector?: string;
}) {
  const css = useMemo(() => buildOverrideCss(tokens, hostSelector), [tokens, hostSelector]);
  if (!css) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function buildOverrideCss(tokens: Record<string, TokenValue> | undefined, host: string): string {
  if (!tokens) return "";
  const t = (k: string) => {
    const v = tokens[k];
    if (v === null || v === undefined || v === "") return null;
    return typeof v === "number" ? `${v}px` : String(v);
  };
  const px = (k: string) => {
    const v = tokens[k];
    if (v === null || v === undefined || v === "") return null;
    return typeof v === "number" ? `${v}px` : String(v);
  };
  const num = (k: string) => {
    const v = tokens[k];
    if (v === null || v === undefined || v === "") return null;
    return String(v);
  };
  const out: string[] = [];

  // Header scope: only the page-level header. Renderers (StudioCanvas + Tenant
  // PublicView) wrap the navbar section in `<div data-design-scope="header">`,
  // so all Hlavička edits stay contained — nested <nav> elements inside other
  // sections (About menus, sidebars, etc.) are not affected.
  const H = `[data-design-scope="header"]`;
  const HA = `[data-design-scope="header"] a`;

  /* ── Header / navbar ──────────────────────────────────────────────────── */
  const headerBg = t("header.bg.desktop") ?? t("header.bg");
  const headerPadH = px("header.padding.h.desktop") ?? px("header.padding.h");
  const headerPadV = px("header.padding.v.desktop") ?? px("header.padding.v");
  if (headerBg || headerPadH || headerPadV) {
    const decls: string[] = [];
    if (headerBg) decls.push(`background:${headerBg} !important;background-image:none !important`);
    if (headerPadH && headerPadV) decls.push(`padding:${headerPadV} ${headerPadH} !important`);
    else if (headerPadH) decls.push(`padding-left:${headerPadH} !important;padding-right:${headerPadH} !important`);
    else if (headerPadV) decls.push(`padding-top:${headerPadV} !important;padding-bottom:${headerPadV} !important`);
    // Push to both the scope wrapper AND the inner <nav>/<header> so a template
    // with its own gradient on the nav element gets overridden too.
    out.push(`${H},${H} nav,${H} header{${decls.join(";")}}`);
  }

  /* ── Main nav links ───────────────────────────────────────────────────── */
  const navColor   = t("nav.color");
  const navHover   = t("nav.hoverColor");
  const navActive  = t("nav.activeColor");
  const navFont    = t("nav.fontFamily");
  const navWeight  = num("nav.fontWeight");
  const navSize    = px("nav.size");
  const navItemGap = px("nav.itemGap");
  if (navColor || navFont || navWeight || navSize) {
    const decls: string[] = [];
    if (navColor)  decls.push(`color:${navColor} !important`);
    if (navFont)   decls.push(`font-family:${navFont} !important`);
    if (navWeight) decls.push(`font-weight:${navWeight} !important`);
    if (navSize)   decls.push(`font-size:${navSize} !important`);
    out.push(`${HA}{${decls.join(";")}}`);
  }
  if (navHover) out.push(`${HA}:hover{color:${navHover} !important;opacity:1 !important}`);
  if (navActive) out.push(`${HA}.active,${HA}[aria-current="page"]{color:${navActive} !important}`);
  if (navItemGap) {
    out.push(`${H} .flex,${H} [class*="lg:flex"]{gap:${navItemGap} !important}`);
  }

  /* ── CTA button (last link / button in nav) ───────────────────────────── */
  const ctaBg = t("ctaButton.bg");
  const ctaColor = t("ctaButton.color");
  const ctaRadius = px("ctaButton.radius");
  if (ctaBg || ctaColor || ctaRadius) {
    const decls: string[] = [];
    if (ctaBg)     decls.push(`background:${ctaBg} !important;background-image:none !important`);
    if (ctaColor)  decls.push(`color:${ctaColor} !important`);
    if (ctaRadius) decls.push(`border-radius:${ctaRadius} !important`);
    out.push(`${H} a[data-cta],${H} button[data-cta]{${decls.join(";")}}`);
  }

  /* ── Body text / page bg ──────────────────────────────────────────────── */
  // Body typography rules emit *only* when the user has explicitly set an
  // extended typography token (dotted key). Flat tokens like `fontBody` and
  // `colorText` are factory template defaults — emitting an !important rule
  // for those would clobber template-specific inline styles (e.g. nav links
  // with `style="color:#fff"`) by forcing the default color onto every span.
  const hasUserTypography =
    tokens["typography.weight"] !== undefined ||
    tokens["typography.italic"] !== undefined ||
    tokens["typography.size.desktop"] !== undefined ||
    tokens["typography.size"] !== undefined ||
    tokens["typography.lineHeight"] !== undefined;
  const bodyFont = hasUserTypography ? t("fontBody") : null;
  const bodyWeight = num("typography.weight");
  const bodySize = px("typography.size.desktop") ?? px("typography.size");
  const bodyLh = num("typography.lineHeight");
  const bodyColor = hasUserTypography ? t("colorText") : null;
  if (bodyFont || bodyWeight || bodySize || bodyLh || bodyColor) {
    const decls: string[] = [];
    if (bodyFont) decls.push(`font-family:${bodyFont} !important`);
    if (bodyWeight) decls.push(`font-weight:${bodyWeight} !important`);
    if (bodySize) decls.push(`font-size:${bodySize} !important`);
    if (bodyLh) decls.push(`line-height:${bodyLh} !important`);
    if (bodyColor) decls.push(`color:${bodyColor} !important`);
    // Target text-semantic containers only — not generic spans, which inherit
    // from their parent (e.g. nav link with style="color:#fff") and don't
    // need their own color override.
    out.push(`${host} p,${host} li,${host} blockquote{${decls.join(";")}}`);
  }
  // Page bg from `colorBackground` is already applied via the wrapper's inline
  // style in TenantPublicView/StudioCanvas. Emitting another !important rule
  // here would be redundant noise (same value, different specificity); only
  // do it when the user explicitly sets an extended `page.bg` token (not the
  // factory `colorBackground` default).
  const pageBg = tokens["page.bg"];
  if (typeof pageBg === "string" && pageBg) out.push(`${host}{background-color:${pageBg} !important}`);

  /* ── Links (anchors outside nav/footer) ───────────────────────────────── */
  const linkColor = t("link.color");
  const linkHover = t("link.hoverColor");
  const linkUnderline = tokens["link.underline"];
  if (linkColor || linkUnderline !== undefined) {
    const decls: string[] = [];
    if (linkColor) decls.push(`color:${linkColor} !important`);
    if (linkUnderline === true)  decls.push(`text-decoration:underline !important`);
    if (linkUnderline === false) decls.push(`text-decoration:none !important`);
    out.push(`${host} a:not(nav a):not(footer a):not([data-cta]){${decls.join(";")}}`);
  }
  if (linkHover) out.push(`${host} a:not(nav a):not(footer a):hover{color:${linkHover} !important}`);

  /* ── Headings (shared font + per-level overrides) ─────────────────────── */
  // Heading shared rule only fires when the user explicitly customises the
  // shared heading style via the extended `heading.color` token, or via the
  // flat `fontHeading` *if* the user actually changed it. Most templates seed
  // `fontHeading` with their own design font — emitting an !important rule
  // would clobber that. We use `heading.color` (extended) as the opt-in.
  const headingFont = tokens["heading.color"] !== undefined ? t("fontHeading") : null;
  const headingColor = t("heading.color");
  if (headingFont || headingColor) {
    const decls: string[] = [];
    if (headingFont)  decls.push(`font-family:${headingFont} !important`);
    if (headingColor) decls.push(`color:${headingColor} !important`);
    out.push(`${host} h1,${host} h2,${host} h3,${host} h4,${host} h5,${host} h6{${decls.join(";")}}`);
  }
  for (const lvl of [1, 2, 3, 4] as const) {
    const prefix = `h${lvl}`;
    const ff   = t(`${prefix}.fontFamily`);
    const w    = num(`${prefix}.weight`);
    const it   = tokens[`${prefix}.italic`];
    const size = px(`${prefix}.size.desktop`) ?? px(`${prefix}.size`);
    const lh   = num(`${prefix}.lineHeight`);
    const mb   = px(`${prefix}.marginBottom`);
    const color = t(`${prefix}.color`);
    if (!ff && !w && it === undefined && !size && !lh && !mb && !color) continue;
    const decls: string[] = [];
    if (ff) decls.push(`font-family:${ff} !important`);
    if (w) decls.push(`font-weight:${w} !important`);
    if (it === true)  decls.push(`font-style:italic !important`);
    if (it === false) decls.push(`font-style:normal !important`);
    if (size) decls.push(`font-size:${size} !important`);
    if (lh) decls.push(`line-height:${lh} !important`);
    if (mb) decls.push(`margin-bottom:${mb} !important`);
    if (color) decls.push(`color:${color} !important`);
    out.push(`${host} ${prefix}{${decls.join(";")}}`);
  }

  /* ── Footer ───────────────────────────────────────────────────────────── */
  const footerBg = t("footer.bg");
  const footerColor = t("footer.color");
  const footerPadH = px("footer.padding.h.desktop") ?? px("footer.padding.h");
  const footerPadV = px("footer.padding.v.desktop") ?? px("footer.padding.v");
  const footerLink = t("footer.linkColor");
  const footerLinkHover = t("footer.linkHoverColor");
  // Footer scope: same approach as header — page footer is wrapped in
  // `<div data-design-scope="footer">`, so we don't accidentally restyle nested
  // <footer> tags inside cards / testimonials / blog excerpts.
  const F = `[data-design-scope="footer"]`;
  if (footerBg || footerColor || footerPadH || footerPadV) {
    const decls: string[] = [];
    if (footerBg)    decls.push(`background:${footerBg} !important;background-image:none !important`);
    if (footerColor) decls.push(`color:${footerColor} !important`);
    if (footerPadH && footerPadV) decls.push(`padding:${footerPadV} ${footerPadH} !important`);
    out.push(`${F},${F} footer{${decls.join(";")}}`);
  }
  if (footerLink)      out.push(`${F} a{color:${footerLink} !important}`);
  if (footerLinkHover) out.push(`${F} a:hover{color:${footerLinkHover} !important}`);

  /* ── Sections (paddings, gap) ─────────────────────────────────────────── */
  const sectionBg   = t("section.bg");
  const sectionPadH = px("section.padding.h.desktop") ?? px("section.padding.h");
  const sectionPadV = px("section.padding.v.desktop") ?? px("section.padding.v");
  const sectionGap  = px("section.gap.desktop") ?? px("section.gap");
  // Section scope: only the renderer-marked sections (data-design-scope="section").
  if (sectionBg || sectionPadH || sectionPadV) {
    const decls: string[] = [];
    if (sectionBg) decls.push(`background:${sectionBg} !important`);
    if (sectionPadH && sectionPadV) decls.push(`padding:${sectionPadV} ${sectionPadH} !important`);
    out.push(`[data-design-scope="section"] > section,[data-design-scope="section"] > div > section{${decls.join(";")}}`);
  }
  if (sectionGap) out.push(`[data-design-scope="section"]+[data-design-scope="section"]{margin-top:${sectionGap} !important}`);

  /* ── Boxy (cards) — three styles ──────────────────────────────────────── */
  /**
   * Universal "card" target selectors. Templates use many class names — we
   * cover the most common patterns plus broader Tailwind utility hints
   * (`[class*="rounded"][class*="border"]`, `[class*="shadow"]`) so even
   * minimalist templates that don't name elements "card" still get styled.
   *
   * Style variants:
   *   .default  → all cards by default
   *   .primary  → opt-in via `[data-card="primary"]` (or class `primary`)
   *   .secondary→ opt-in via `[data-card="secondary"]`
   */
  const CARD_DEFAULT = `${host} :is(.card, [class*="card"], article, [class*="box"]:not([class*="boxed"]), [class*="testimonial"], [class*="feature"], [class*="b01-card"], [class*="b02-card"], [class*="b03-card"], [class*="b04-card"], [class*="b03p-card"], [class*="b03t-card"], [class*="b04s-card"]):not([data-card="primary"]):not([data-card="secondary"]):not([data-design-scope="header"] *):not([data-design-scope="footer"] *)`;
  const CARD_PRIMARY = `${host} [data-card="primary"], ${host} .card-primary, ${host} [class*="card"].primary`;
  const CARD_SECONDARY = `${host} [data-card="secondary"], ${host} .card-secondary, ${host} [class*="card"].secondary`;
  for (const [prefix, sel] of [
    ["card.default",   CARD_DEFAULT],
    ["card.primary",   CARD_PRIMARY],
    ["card.secondary", CARD_SECONDARY],
  ] as const) {
    const bg   = t(`${prefix}.bg`);
    const txt  = t(`${prefix}.textColor`);
    const title= t(`${prefix}.titleColor`);
    const padH = px(`${prefix}.padding.h.desktop`) ?? px(`${prefix}.padding.h`);
    const padV = px(`${prefix}.padding.v.desktop`) ?? px(`${prefix}.padding.v`);
    const bc   = t(`${prefix}.border.color`);
    const bs   = px(`${prefix}.border.size`);
    const br   = px(`${prefix}.border.radius`);
    const sc   = t(`${prefix}.shadow.color`);
    const sb   = num(`${prefix}.shadow.blur`);
    const sx   = num(`${prefix}.shadow.x`);
    const sy   = num(`${prefix}.shadow.y`);

    const decls: string[] = [];
    if (bg)   decls.push(`background:${bg} !important`);
    if (txt)  decls.push(`color:${txt} !important`);
    if (padH && padV) decls.push(`padding:${padV} ${padH} !important`);
    if (bc && bs) decls.push(`border:${bs} solid ${bc} !important`);
    if (br) decls.push(`border-radius:${br} !important`);
    if (sc && (sb || sx || sy)) {
      decls.push(`box-shadow:${sx ?? 0}px ${sy ?? 0}px ${sb ?? 0}px ${sc} !important`);
    }
    if (decls.length) out.push(`${sel}{${decls.join(";")}}`);
    if (title) out.push(`${sel} :is(h1,h2,h3,h4,h5,h6){color:${title} !important}`);
  }

  /* ── Layout (item gap) ─────────────────────────────────────────────────── */
  const gapH = px("layout.gap.h");
  const gapV = px("layout.gap.v");
  if (gapH || gapV) {
    const v = gapV ?? gapH ?? "0";
    const h = gapH ?? gapV ?? "0";
    out.push(`${host} :is(.grid, [class*="grid-"], [class*="flex"][class*="gap-"]){gap:${v} ${h} !important;row-gap:${v} !important;column-gap:${h} !important}`);
  }

  /* ── Obsahový slider padding ───────────────────────────────────────────── */
  const slPadH = px("slider.padding.h.desktop") ?? px("slider.padding.h");
  const slPadV = px("slider.padding.v.desktop") ?? px("slider.padding.v");
  if (slPadH || slPadV) {
    const v = slPadV ?? slPadH ?? "0";
    const h = slPadH ?? slPadV ?? "0";
    out.push(`${host} :is(.swiper, [class*="slider"], [class*="carousel"]){padding:${v} ${h} !important}`);
  }

  /* ── Harmonika (accordion) — both variants ────────────────────────────── */
  for (const [prefix, sel] of [
    ["accordion.classic", `${host} :is(details, [class*="accordion"], [class*="faq-item"], [class*="faq"] [class*="item"]):not([data-acc="more"])`],
    ["accordion.more",    `${host} [data-acc="more"], ${host} [class*="accordion"].more`],
  ] as const) {
    const titleFf  = t(`${prefix}.title.fontFamily`);
    const titleW   = num(`${prefix}.title.weight`);
    const titleSize= px(`${prefix}.title.size`);
    const titleTrk = px(`${prefix}.title.tracking`);
    const titleCol = t(`${prefix}.title.color`);
    const iconSize = px(`${prefix}.icon.size`);
    const txt   = t(`${prefix}.textColor`);
    const bg    = t(`${prefix}.bg`);
    const padH  = px(`${prefix}.padding.h`);
    const padV  = px(`${prefix}.padding.v`);
    const bc    = t(`${prefix}.border.color`);
    const bs    = px(`${prefix}.border.size`);
    const br    = px(`${prefix}.border.radius`);
    const sc    = t(`${prefix}.shadow.color`);
    const sb    = num(`${prefix}.shadow.blur`);
    const sx    = num(`${prefix}.shadow.x`);
    const sy    = num(`${prefix}.shadow.y`);
    const gap   = px(`${prefix}.gap`);

    const itemDecls: string[] = [];
    if (bg)   itemDecls.push(`background:${bg} !important`);
    if (txt)  itemDecls.push(`color:${txt} !important`);
    if (padH && padV) itemDecls.push(`padding:${padV} ${padH} !important`);
    if (bc && bs) itemDecls.push(`border:${bs} solid ${bc} !important`);
    if (br) itemDecls.push(`border-radius:${br} !important`);
    if (sc && (sb || sx || sy)) itemDecls.push(`box-shadow:${sx ?? 0}px ${sy ?? 0}px ${sb ?? 0}px ${sc} !important`);
    if (gap) itemDecls.push(`margin-bottom:${gap} !important`);
    if (itemDecls.length) out.push(`${sel}{${itemDecls.join(";")}}`);

    const titleDecls: string[] = [];
    if (titleFf) titleDecls.push(`font-family:${titleFf} !important`);
    if (titleW)  titleDecls.push(`font-weight:${titleW} !important`);
    if (titleSize) titleDecls.push(`font-size:${titleSize} !important`);
    if (titleTrk) titleDecls.push(`letter-spacing:${titleTrk} !important`);
    if (titleCol) titleDecls.push(`color:${titleCol} !important`);
    if (titleDecls.length) out.push(`${sel} :is(summary, [class*="title"], [class*="header"], button) {${titleDecls.join(";")}}`);
    if (iconSize) out.push(`${sel} :is(svg, [class*="icon"]){width:${iconSize} !important;height:${iconSize} !important}`);
  }

  /* ── Záložky (tabs) ───────────────────────────────────────────────────── */
  const tabSel       = `${host} :is([role="tab"], [class*="tab-button"], [class*="tabs"] [class*="item"]:not([class*="active"]), [class*="tab"]:not([class*="table"]):not([class*="tabular"]))`;
  const tabActiveSel = `${host} :is([role="tab"][aria-selected="true"], [class*="tab"][class*="active"], [class*="tab"].selected)`;
  const tabFf   = t("tabs.fontFamily");
  const tabW    = num("tabs.weight");
  const tabSize = px("tabs.size.desktop") ?? px("tabs.size");
  const tabCol  = t("tabs.color");
  const tabBg   = t("tabs.bg");
  const tabTrk  = px("tabs.tracking");
  const tabBc   = t("tabs.border.color");
  const tabBs   = px("tabs.border.size");
  const tabBr   = px("tabs.border.radius");
  const tabPadH = px("tabs.padding.h.desktop") ?? px("tabs.padding.h");
  const tabPadV = px("tabs.padding.v.desktop") ?? px("tabs.padding.v");
  const tabGap  = px("tabs.gap");

  const tabDecls: string[] = [];
  if (tabFf) tabDecls.push(`font-family:${tabFf} !important`);
  if (tabW) tabDecls.push(`font-weight:${tabW} !important`);
  if (tabSize) tabDecls.push(`font-size:${tabSize} !important`);
  if (tabCol) tabDecls.push(`color:${tabCol} !important`);
  if (tabBg) tabDecls.push(`background:${tabBg} !important`);
  if (tabTrk) tabDecls.push(`letter-spacing:${tabTrk} !important`);
  if (tabBc && tabBs) tabDecls.push(`border:${tabBs} solid ${tabBc} !important`);
  if (tabBr) tabDecls.push(`border-radius:${tabBr} !important`);
  if (tabPadH && tabPadV) tabDecls.push(`padding:${tabPadV} ${tabPadH} !important`);
  if (tabDecls.length) out.push(`${tabSel}{${tabDecls.join(";")}}`);
  if (tabGap) out.push(`${host} :is([role="tablist"], [class*="tabs"]){gap:${tabGap} !important}`);

  const tabAColor = t("tabs.active.color");
  const tabABg    = t("tabs.active.bg");
  const tabABorder= t("tabs.active.borderColor");
  const aDecls: string[] = [];
  if (tabAColor) aDecls.push(`color:${tabAColor} !important`);
  if (tabABg)    aDecls.push(`background:${tabABg} !important`);
  if (tabABorder) aDecls.push(`border-color:${tabABorder} !important;box-shadow:inset 0 -2px 0 0 ${tabABorder} !important`);
  if (aDecls.length) out.push(`${tabActiveSel}{${aDecls.join(";")}}`);

  /* ── Buttons — generic typography + 3 styles ──────────────────────────── */
  const em = (k: string) => {
    const v = tokens[k];
    if (v === null || v === undefined || v === "") return null;
    return typeof v === "number" ? `${v}em` : String(v);
  };
  // All buttons across templates. Includes:
  //  - <button> (excluding nav/footer/header chrome, tabs, gallery image cells, file inputs)
  //  - <a class="btn|button|cta"> (explicit CTA classes used in many templates)
  //  - <a href="#anchor"> outside header — in-page CTAs, common in barber/hotel/restaurant
  //    templates where Tailwind utility classes like "inline-block uppercase no-underline"
  //    are used instead of a "btn" class
  //  - Czech business CTA hints: "rezerv", "booking", "objednat"
  // Scoped out: anything inside header/footer regions (already handled per-area).
  const BTN_ALL = `${host} :is(button:not(nav button):not(footer button):not([class*="tab"]):not([role="tab"]):not([aria-label*="větší"]):not([aria-label*="zoom"]):not([type="file"]), a[class*="btn"], a[class*="button"], [class*="cta"], a[class*="rezerv"], a[class*="booking"], a[class*="objednat"], a[href^="#"]:not([href="#"])):not([data-design-scope="header"] *):not([data-design-scope="footer"] *)`;
  const btnFf  = t("btn.fontFamily");
  const btnSize = px("btn.size.medium");
  const btnSizeS = px("btn.size.small");
  const btnSizeL = px("btn.size.large");
  const btnUpper = tokens["btn.uppercase"];
  const btnTrack = em("btn.tracking");
  const btnPadH = em("btn.padding.h");
  const btnPadV = em("btn.padding.v");
  const btnDecls: string[] = [];
  if (btnFf)   btnDecls.push(`font-family:${btnFf} !important`);
  if (btnSize) btnDecls.push(`font-size:${btnSize} !important`);
  if (btnUpper === true)  btnDecls.push(`text-transform:uppercase !important`);
  if (btnUpper === false) btnDecls.push(`text-transform:none !important`);
  if (btnTrack) btnDecls.push(`letter-spacing:${btnTrack} !important`);
  if (btnPadH && btnPadV) btnDecls.push(`padding:${btnPadV} ${btnPadH} !important`);
  if (btnDecls.length) out.push(`${BTN_ALL}{${btnDecls.join(";")}}`);
  if (btnSizeS) out.push(`${BTN_ALL}[class*="sm"],${BTN_ALL}.small,${BTN_ALL}[data-size="sm"]{font-size:${btnSizeS} !important}`);
  if (btnSizeL) out.push(`${BTN_ALL}[class*="lg"],${BTN_ALL}.large,${BTN_ALL}[data-size="lg"]{font-size:${btnSizeL} !important}`);
  // Three button styles
  const btnStyleSelectors: Record<string, string> = {
    "btn.default": `${BTN_ALL}:not([class*="primary"]):not([data-btn="primary"]):not([class*="inverse"]):not([class*="inverted"]):not([data-btn="inverse"])`,
    "btn.primary": `${BTN_ALL}[class*="primary"],${BTN_ALL}[data-btn="primary"]`,
    "btn.inverse": `${BTN_ALL}[class*="inverse"],${BTN_ALL}[class*="inverted"],${BTN_ALL}[data-btn="inverse"]`,
  };
  for (const [prefix, sel] of Object.entries(btnStyleSelectors)) {
    const w  = num(`${prefix}.weight`);
    const it = tokens[`${prefix}.italic`];
    const c  = t(`${prefix}.color`);
    const bg = t(`${prefix}.bg`);
    const bc = t(`${prefix}.border.color`);
    const bs = px(`${prefix}.border.size`);
    const br = px(`${prefix}.border.radius`);
    const decls: string[] = [];
    if (w)  decls.push(`font-weight:${w} !important`);
    if (it === true)  decls.push(`font-style:italic !important`);
    if (it === false) decls.push(`font-style:normal !important`);
    if (c)  decls.push(`color:${c} !important`);
    if (bg) decls.push(`background:${bg} !important;background-image:none !important`);
    if (bc && bs) decls.push(`border:${bs} solid ${bc} !important`);
    if (br) decls.push(`border-radius:${br} !important`);
    if (decls.length) out.push(`${sel}{${decls.join(";")}}`);

    const hc  = t(`${prefix}.hover.color`);
    const hbg = t(`${prefix}.hover.bg`);
    const hbc = t(`${prefix}.hover.borderColor`);
    const hDecls: string[] = [];
    if (hc)  hDecls.push(`color:${hc} !important`);
    if (hbg) hDecls.push(`background:${hbg} !important;background-image:none !important`);
    if (hbc) hDecls.push(`border-color:${hbc} !important`);
    if (hDecls.length) out.push(`${sel}:hover{${hDecls.join(";")}}`);
  }

  /* ── Images (radius + shadow + hover filter / zoom) ───────────────────── */
  const imgRadius = px("image.radius");
  const imgSc = t("image.shadow.color"); const imgSb = num("image.shadow.blur"); const imgSx = num("image.shadow.x"); const imgSy = num("image.shadow.y");
  const imgHSc = t("image.hoverShadow.color"); const imgHSb = num("image.hoverShadow.blur"); const imgHSx = num("image.hoverShadow.x"); const imgHSy = num("image.hoverShadow.y");
  const imgZoom = tokens["image.zoom"];
  const imgFilter = t("image.filter.color");
  const imgHFilter = t("image.filter.hoverColor");
  const imgDecls: string[] = [];
  if (imgRadius) imgDecls.push(`border-radius:${imgRadius} !important;overflow:hidden !important`);
  if (imgSc && (imgSb || imgSx || imgSy)) imgDecls.push(`box-shadow:${imgSx ?? 0}px ${imgSy ?? 0}px ${imgSb ?? 0}px ${imgSc} !important`);
  if (imgDecls.length) out.push(`${host} img,${host} picture{${imgDecls.join(";")}}`);
  if (imgHSc && (imgHSb || imgHSx || imgHSy)) {
    out.push(`${host} a:hover img,${host} a:hover picture{box-shadow:${imgHSx ?? 0}px ${imgHSy ?? 0}px ${imgHSb ?? 0}px ${imgHSc} !important}`);
  }
  if (imgZoom === true) out.push(`${host} a img{transition:transform .35s ease !important}${host} a:hover img{transform:scale(1.06) !important}`);
  if (imgFilter)  out.push(`${host} a img{filter:none !important}${host} a:not(:hover) img{filter:none !important}${host} a img{box-shadow:inset 0 0 0 9999px ${imgFilter} !important}`);
  if (imgHFilter) out.push(`${host} a:hover img{box-shadow:inset 0 0 0 9999px ${imgHFilter} !important}`);
  const capColor = t("image.caption.color");
  if (capColor) out.push(`${host} figcaption,${host} [class*="caption"]:not([class*="inside"]){color:${capColor} !important}`);
  const capInColor = t("image.captionInside.color");
  const capInBg = t("image.captionInside.bg");
  if (capInColor || capInBg) {
    const decls: string[] = [];
    if (capInColor) decls.push(`color:${capInColor} !important`);
    if (capInBg)    decls.push(`background:${capInBg} !important`);
    out.push(`${host} [class*="caption-inside"],${host} figure figcaption[class*="overlay"]{${decls.join(";")}}`);
  }

  /* ── Slider dots + arrows ─────────────────────────────────────────────── */
  const dotColor  = t("dots.color");
  const dotActive = t("dots.activeColor");
  const dotSize   = px("dots.size");
  const dotGap    = px("dots.gap");
  if (dotColor || dotSize) {
    const decls: string[] = [];
    if (dotColor) decls.push(`background:${dotColor} !important`);
    if (dotSize) decls.push(`width:${dotSize} !important;height:${dotSize} !important`);
    out.push(`${host} :is(.swiper-pagination-bullet, [class*="dot"]:not([class*="dotted"]), [class*="pagination"] li){${decls.join(";")}}`);
  }
  if (dotActive) out.push(`${host} :is(.swiper-pagination-bullet-active, [class*="dot"][class*="active"], [class*="pagination"] li.active){background:${dotActive} !important}`);
  if (dotGap) out.push(`${host} :is(.swiper-pagination, [class*="dots"]){gap:${dotGap} !important}`);

  const arrowColor = t("arrows.color");
  const arrowHover = t("arrows.hoverColor");
  const arrowBg    = t("arrows.bg");
  const arrowSize  = px("arrows.size");
  const arrowRad   = px("arrows.radius");
  if (arrowColor || arrowSize || arrowBg) {
    const decls: string[] = [];
    if (arrowColor) decls.push(`color:${arrowColor} !important`);
    if (arrowBg) decls.push(`background:${arrowBg} !important`);
    if (arrowSize) decls.push(`width:${arrowSize} !important;height:${arrowSize} !important;font-size:${arrowSize} !important`);
    if (arrowRad) decls.push(`border-radius:${arrowRad} !important`);
    out.push(`${host} :is(.swiper-button-prev, .swiper-button-next, [class*="arrow"]:not([class*="arrowhead"]), [aria-label*="prev"], [aria-label*="next"]){${decls.join(";")}}`);
  }
  if (arrowHover) out.push(`${host} :is(.swiper-button-prev, .swiper-button-next, [class*="arrow"]):hover{color:${arrowHover} !important}`);

  /* ── Forms (three styles) ─────────────────────────────────────────────── */
  const formStyleSel: Record<string, string> = {
    "form.default": `${host} :is(input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), select, textarea):not([data-form="inverse"]):not([data-form="filled"])`,
    "form.inverse": `${host} [data-form="inverse"] :is(input, select, textarea)`,
    "form.filled":  `${host} [data-form="filled"] :is(input, select, textarea)`,
  };
  for (const [prefix, sel] of Object.entries(formStyleSel)) {
    const valSize = px(`${prefix}.value.size`);
    const valColor = t(`${prefix}.value.color`);
    const valTrack = px(`${prefix}.value.tracking`);
    const fieldBg  = t(`${prefix}.field.bg`);
    const placeholderC = t(`${prefix}.placeholder.color`);
    const bc = t(`${prefix}.border.color`);
    const bs = px(`${prefix}.border.size`);
    const br = px(`${prefix}.border.radius`);
    const padH = px(`${prefix}.gap.h`);
    const padV = px(`${prefix}.gap.v`);

    const decls: string[] = [];
    if (valSize) decls.push(`font-size:${valSize} !important`);
    if (valColor) decls.push(`color:${valColor} !important`);
    if (valTrack) decls.push(`letter-spacing:${valTrack} !important`);
    if (fieldBg) decls.push(`background:${fieldBg} !important`);
    if (bc && bs) decls.push(`border:${bs} solid ${bc} !important`);
    if (br) decls.push(`border-radius:${br} !important`);
    if (padH && padV) decls.push(`padding:${padV} ${padH} !important`);
    if (decls.length) out.push(`${sel}{${decls.join(";")}}`);
    if (placeholderC) out.push(`${sel}::placeholder{color:${placeholderC} !important}`);

    const aColor = t(`${prefix}.active.color`);
    const aBg    = t(`${prefix}.active.bg`);
    const aBc    = t(`${prefix}.active.borderColor`);
    const aDecls: string[] = [];
    if (aColor) aDecls.push(`color:${aColor} !important`);
    if (aBg) aDecls.push(`background:${aBg} !important`);
    if (aBc) aDecls.push(`border-color:${aBc} !important;outline:none !important`);
    if (aDecls.length) out.push(`${sel}:focus,${sel}:focus-visible{${aDecls.join(";")}}`);

    const labelSize  = px(`${prefix}.label.size`);
    const labelColor = t(`${prefix}.label.color`);
    const labelTrack = px(`${prefix}.label.tracking`);
    const labelDecls: string[] = [];
    if (labelSize) labelDecls.push(`font-size:${labelSize} !important`);
    if (labelColor) labelDecls.push(`color:${labelColor} !important`);
    if (labelTrack) labelDecls.push(`letter-spacing:${labelTrack} !important`);
    if (labelDecls.length) out.push(`${sel.replace(/:is\(input.+?\)/, "label")}{${labelDecls.join(";")}}`);
  }

  /* ── Listings (cards in galleries / blog / services) ──────────────────── */
  const listingTitleSize = px("listing.title.size.desktop") ?? px("listing.title.size");
  const listingTitleColor = t("listing.title.color");
  const listingTitleHover = t("listing.title.hoverColor");
  const listingTitleTrack = px("listing.title.tracking");
  const listingTextSize = px("listing.text.size.desktop") ?? px("listing.text.size");
  const listingTextColor = t("listing.text.color");
  if (listingTitleSize || listingTitleColor || listingTitleTrack) {
    const decls: string[] = [];
    if (listingTitleSize)  decls.push(`font-size:${listingTitleSize} !important`);
    if (listingTitleColor) decls.push(`color:${listingTitleColor} !important`);
    if (listingTitleTrack) decls.push(`letter-spacing:${listingTitleTrack} !important`);
    out.push(`${host} :is([class*="listing"], [class*="grid"]) :is(h2, h3, h4, [class*="title"]){${decls.join(";")}}`);
  }
  if (listingTitleHover) out.push(`${host} :is([class*="listing"], [class*="grid"]) :is(a:hover h2, a:hover h3, a:hover [class*="title"]){color:${listingTitleHover} !important}`);
  if (listingTextSize || listingTextColor) {
    const decls: string[] = [];
    if (listingTextSize)  decls.push(`font-size:${listingTextSize} !important`);
    if (listingTextColor) decls.push(`color:${listingTextColor} !important`);
    out.push(`${host} :is([class*="listing"], [class*="grid"]) p{${decls.join(";")}}`);
  }
  // Listing card (Karta)
  {
    const bg = t("listing.card.bg");
    const c  = t("listing.card.color");
    const padH = px("listing.card.padding.h");
    const padV = px("listing.card.padding.v");
    const bc = t("listing.card.border.color");
    const bs = px("listing.card.border.size");
    const br = px("listing.card.border.radius");
    const sc = t("listing.card.shadow.color");
    const sb = num("listing.card.shadow.blur");
    const sx = num("listing.card.shadow.x");
    const sy = num("listing.card.shadow.y");
    const decls: string[] = [];
    if (bg) decls.push(`background:${bg} !important`);
    if (c)  decls.push(`color:${c} !important`);
    if (padH && padV) decls.push(`padding:${padV} ${padH} !important`);
    if (bc && bs) decls.push(`border:${bs} solid ${bc} !important`);
    if (br) decls.push(`border-radius:${br} !important`);
    if (sc && (sb || sx || sy)) decls.push(`box-shadow:${sx ?? 0}px ${sy ?? 0}px ${sb ?? 0}px ${sc} !important`);
    if (decls.length) out.push(`${host} :is([class*="listing"], [class*="grid"]) :is([class*="card"], article){${decls.join(";")}}`);
  }
  // Meta
  {
    const c = t("listing.meta.color");
    const s = px("listing.meta.size");
    const u = tokens["listing.meta.uppercase"];
    const trk = px("listing.meta.tracking");
    const decls: string[] = [];
    if (c) decls.push(`color:${c} !important`);
    if (s) decls.push(`font-size:${s} !important`);
    if (u === true)  decls.push(`text-transform:uppercase !important`);
    if (u === false) decls.push(`text-transform:none !important`);
    if (trk) decls.push(`letter-spacing:${trk} !important`);
    if (decls.length) out.push(`${host} :is([class*="meta"], time, [class*="date"]){${decls.join(";")}}`);
  }

  /* ── Tables ───────────────────────────────────────────────────────────── */
  {
    const headBg = t("table.head.bg");
    const headColor = t("table.head.color");
    const rowBg = t("table.row.bg");
    const rowColor = t("table.row.color");
    const bc = t("table.border.color");
    const bs = px("table.border.size");
    const padH = px("table.cell.padding.h");
    const padV = px("table.cell.padding.v");
    const dh: string[] = [];
    if (headBg) dh.push(`background:${headBg} !important`);
    if (headColor) dh.push(`color:${headColor} !important`);
    // Header row: explicit <thead th> OR first row's <td>/<th> for tables
    // without <thead> (price tables, opening-hours tables, etc.).
    if (dh.length) out.push(`${host} table thead th,${host} table:not(:has(thead)) tr:first-child :is(td, th){${dh.join(";")}}`);
    const dr: string[] = [];
    if (rowBg) dr.push(`background:${rowBg} !important`);
    if (rowColor) dr.push(`color:${rowColor} !important`);
    if (dr.length) out.push(`${host} table tbody td,${host} table:not(:has(thead)) tr:not(:first-child) td{${dr.join(";")}}`);
    if (bc && bs) out.push(`${host} table :is(td, th){border:${bs} solid ${bc} !important}`);
    if (padH && padV) out.push(`${host} table :is(td, th){padding:${padV} ${padH} !important}`);
  }

  /* ── Quote (citace) ───────────────────────────────────────────────────── */
  {
    const ff = t("quote.fontFamily");
    const s  = px("quote.size");
    const c  = t("quote.color");
    const bc = t("quote.borderColor");
    const it = tokens["quote.italic"];
    const decls: string[] = [];
    if (ff) decls.push(`font-family:${ff} !important`);
    if (s)  decls.push(`font-size:${s} !important`);
    if (c)  decls.push(`color:${c} !important`);
    if (bc) decls.push(`border-left:3px solid ${bc} !important;padding-left:1rem !important`);
    if (it === true)  decls.push(`font-style:italic !important`);
    if (it === false) decls.push(`font-style:normal !important`);
    if (decls.length) out.push(`${host} :is(blockquote, [class*="quote"], [class*="testimonial"] p){${decls.join(";")}}`);
  }

  /* ── Social icons ─────────────────────────────────────────────────────── */
  {
    const c  = t("social.color");
    const hc = t("social.hoverColor");
    const s  = px("social.size");
    const g  = px("social.gap");
    // Universal social-link selector: matches anchors by href domain or by
    // aria-label naming (covers templates that don't wrap socials in a class).
    const SOCIAL_LINK = `a[href*="instagram"], a[href*="facebook"], a[href*="twitter"], a[href*="x.com"], a[href*="youtube"], a[href*="linkedin"], a[href*="tiktok"], a[href*="pinterest"], a[aria-label="Instagram"], a[aria-label="Facebook"], a[aria-label="Twitter"], a[aria-label="YouTube"], a[aria-label="LinkedIn"], a[aria-label="TikTok"], a[aria-label*="social"]`;
    if (c || s)  {
      const decls: string[] = [];
      if (c) decls.push(`color:${c} !important`);
      if (s) decls.push(`width:${s} !important;height:${s} !important;font-size:${s} !important`);
      out.push(`${host} :is(${SOCIAL_LINK}){${decls.join(";")}}`);
      // Also push to direct SVG children in case the icon has its own fill/stroke.
      if (c) out.push(`${host} :is(${SOCIAL_LINK}) svg{color:${c} !important;fill:currentColor !important;stroke:currentColor !important}`);
    }
    if (hc) out.push(`${host} :is(${SOCIAL_LINK}):hover{color:${hc} !important}`);
    if (g) {
      // Two strategies for the social-icon parent container:
      //  1) Direct class hint (`[class*="social"]`) — opt-in
      //  2) Modern `:has()` selector — any element directly containing 2+ social
      //     anchors. Supported by all evergreen browsers (Chrome 105+, Safari 15+).
      out.push(`${host} :is([class*="social"], [aria-label*="social"]){gap:${g} !important}`);
      out.push(`${host} *:has(> a[href*="instagram"], > a[href*="facebook"], > a[href*="tiktok"]):has(> a[aria-label]){gap:${g} !important}`);
    }
  }

  /* ── Divider ──────────────────────────────────────────────────────────── */
  {
    const c = t("divider.color");
    const tn = px("divider.thickness");
    const mt = px("divider.marginTop");
    const mb = px("divider.marginBottom");
    const decls: string[] = [];
    if (c) decls.push(`border-color:${c} !important;background-color:${c} !important`);
    if (tn) decls.push(`border-top-width:${tn} !important;height:${tn} !important`);
    if (mt) decls.push(`margin-top:${mt} !important`);
    if (mb) decls.push(`margin-bottom:${mb} !important`);
    if (decls.length) out.push(`${host} hr,${host} [role="separator"]{${decls.join(";")}}`);
  }

  /* ── Cookie lišta ─────────────────────────────────────────────────────── */
  {
    const COOK = `${host} :is([class*="cookie"][class*="bar"], [class*="cookie"][class*="banner"], [class*="cookie"][class*="consent"], [data-cookie-bar], .cookies-eu, .cc-window)`;
    const bg = t("cookie.bg");
    const maxW = px("cookie.maxWidth");
    const margin = px("cookie.margin");
    const radius = px("cookie.radius");
    const sc = t("cookie.shadow.color");
    const sb = num("cookie.shadow.blur");
    const sx = num("cookie.shadow.x");
    const sy = num("cookie.shadow.y");
    const type = t("cookie.type");
    const padH = px("cookie.padding.h");
    const padV = px("cookie.padding.v");
    const color = t("cookie.color");
    const titleSize = px("cookie.title.size");
    const textSize  = px("cookie.text.size");

    const decls: string[] = [];
    if (bg) decls.push(`background:${bg} !important`);
    if (maxW) decls.push(`max-width:${maxW} !important;margin-left:auto !important;margin-right:auto !important`);
    if (margin) decls.push(`margin:${margin} !important`);
    if (radius) decls.push(`border-radius:${radius} !important`);
    if (sc && (sb || sx || sy)) decls.push(`box-shadow:${sx ?? 0}px ${sy ?? 0}px ${sb ?? 0}px ${sc} !important`);
    if (padH && padV) decls.push(`padding:${padV} ${padH} !important`);
    if (color) decls.push(`color:${color} !important`);
    if (textSize) decls.push(`font-size:${textSize} !important`);
    if (type === "top-fixed")    decls.push(`position:fixed !important;top:0 !important;bottom:auto !important;left:0 !important;right:0 !important;z-index:9999 !important`);
    if (type === "bottom-fixed") decls.push(`position:fixed !important;bottom:0 !important;top:auto !important;left:0 !important;right:0 !important;z-index:9999 !important`);
    if (decls.length) out.push(`${COOK}{${decls.join(";")}}`);
    if (titleSize) out.push(`${COOK} :is(h1, h2, h3, h4, [class*="title"]){font-size:${titleSize} !important}`);
    const dialogOverlay = t("cookie.dialog.overlay");
    if (dialogOverlay && type === "dialog") {
      out.push(`${COOK}[class*="dialog"]::before,${COOK}[data-type="dialog"]::before{content:'';position:fixed;inset:0;background:${dialogOverlay};z-index:-1}`);
    }
    // Three cookie buttons (Accept / Reject / Settings)
    const cookieButtonMap: Record<string, string> = {
      "cookie.btnAccept":   `${COOK} :is([data-cookie="accept"], [class*="accept"]:not([class*="header"]):not([class*="footer"]), button[class*="agree"], button[class*="allow"])`,
      "cookie.btnReject":   `${COOK} :is([data-cookie="reject"], [class*="reject"], [class*="decline"], [class*="deny"])`,
      "cookie.btnSettings": `${COOK} :is([data-cookie="settings"], [class*="settings"]:not([class*="header"]):not([class*="footer"]), [class*="customize"], [class*="preferences"])`,
    };
    for (const [prefix, sel] of Object.entries(cookieButtonMap)) {
      const w  = num(`${prefix}.weight`);
      const it = tokens[`${prefix}.italic`];
      const c  = t(`${prefix}.color`);
      const bbg = t(`${prefix}.bg`);
      const bc = t(`${prefix}.border.color`);
      const bs = px(`${prefix}.border.size`);
      const br = px(`${prefix}.border.radius`);
      const d: string[] = [];
      if (w)  d.push(`font-weight:${w} !important`);
      if (it === true)  d.push(`font-style:italic !important`);
      if (it === false) d.push(`font-style:normal !important`);
      if (c)  d.push(`color:${c} !important`);
      if (bbg) d.push(`background:${bbg} !important;background-image:none !important`);
      if (bc && bs) d.push(`border:${bs} solid ${bc} !important`);
      if (br) d.push(`border-radius:${br} !important`);
      if (d.length) out.push(`${sel}{${d.join(";")}}`);
      const hc  = t(`${prefix}.hover.color`);
      const hbg = t(`${prefix}.hover.bg`);
      const hbc = t(`${prefix}.hover.borderColor`);
      const hd: string[] = [];
      if (hc)  hd.push(`color:${hc} !important`);
      if (hbg) hd.push(`background:${hbg} !important;background-image:none !important`);
      if (hbc) hd.push(`border-color:${hbc} !important`);
      if (hd.length) out.push(`${sel}:hover{${hd.join(";")}}`);
    }
  }

  /* ── Vyhledávání (search panel + trigger button) ──────────────────────── */
  {
    const W = `${host} :is([class*="search"][class*="panel"], [class*="search"][class*="modal"], [class*="search"][class*="wrapper"], [role="search"])`;
    const wBg = t("search.wrapper.bg");
    const wOv = t("search.wrapper.overlay");
    const wPH = px("search.wrapper.padding.h");
    const wPV = px("search.wrapper.padding.v");
    const wMW = px("search.wrapper.maxWidth");
    const d: string[] = [];
    if (wBg) d.push(`background:${wBg} !important`);
    if (wPH && wPV) d.push(`padding:${wPV} ${wPH} !important`);
    if (wMW) d.push(`max-width:${wMW} !important;margin-left:auto !important;margin-right:auto !important`);
    if (d.length) out.push(`${W}{${d.join(";")}}`);
    if (wOv) out.push(`${W}::before{content:'' !important;position:fixed !important;inset:0 !important;background:${wOv} !important;z-index:-1 !important}`);

    // Field
    const fldC = t("search.field.color");
    const fldBg = t("search.field.bg");
    const fldBc = t("search.field.border.color");
    const fldBs = px("search.field.border.size");
    const fldBr = px("search.field.border.radius");
    const fd: string[] = [];
    if (fldC) fd.push(`color:${fldC} !important`);
    if (fldBg) fd.push(`background:${fldBg} !important`);
    if (fldBc && fldBs) fd.push(`border:${fldBs} solid ${fldBc} !important`);
    if (fldBr) fd.push(`border-radius:${fldBr} !important`);
    if (fd.length) out.push(`${W} input[type="search"],${W} input[type="text"]{${fd.join(";")}}`);

    // Submit
    const subHide = tokens["search.submit.hideLabel"];
    const subC = t("search.submit.color");
    const subBg = t("search.submit.bg");
    const subBc = t("search.submit.border.color");
    const subBs = px("search.submit.border.size");
    const subBr = px("search.submit.border.radius");
    const sd: string[] = [];
    if (subC) sd.push(`color:${subC} !important`);
    if (subBg) sd.push(`background:${subBg} !important;background-image:none !important`);
    if (subBc && subBs) sd.push(`border:${subBs} solid ${subBc} !important`);
    if (subBr) sd.push(`border-radius:${subBr} !important`);
    if (sd.length) out.push(`${W} button[type="submit"],${W} [type="submit"]{${sd.join(";")}}`);
    if (subHide === true) out.push(`${W} button[type="submit"] :is(span, [class*="label"]){display:none !important}`);

    // Trigger (open search) — usually inside header navbar
    const TR = `${host} :is([data-search="trigger"], [aria-label*="search"], [aria-label*="hledat"], [class*="search-trigger"], button[class*="search"]:not([type="submit"]))`;
    const trSize = px("search.trigger.size.desktop") ?? px("search.trigger.size");
    const trC = t("search.trigger.color");
    const trHover = t("search.trigger.hoverColor");
    const trHide = tokens["search.trigger.hideLabel"];
    const td: string[] = [];
    if (trSize) td.push(`font-size:${trSize} !important`);
    if (trC) td.push(`color:${trC} !important`);
    if (td.length) out.push(`${TR}{${td.join(";")}}`);
    if (trHover) out.push(`${TR}:hover{color:${trHover} !important}`);
    if (trHide === true) out.push(`${TR} :is(span:not([class*="icon"]), [class*="label"]){display:none !important}`);
  }

  /* ── Video play button ────────────────────────────────────────────────── */
  {
    const playColor = t("video.playBtn.color");
    const playBg = t("video.playBtn.bg");
    const playSize = px("video.playBtn.size");
    const d: string[] = [];
    if (playColor) d.push(`color:${playColor} !important`);
    if (playBg) d.push(`background:${playBg} !important`);
    if (playSize) d.push(`width:${playSize} !important;height:${playSize} !important;font-size:${playSize} !important`);
    if (d.length) out.push(`${host} :is([class*="play-button"], [class*="play-btn"], [aria-label*="play"], [aria-label*="přehrát"]){${d.join(";")}}`);
  }

  /* ── Bullet list ──────────────────────────────────────────────────────── */
  {
    const c = t("bullet.color");
    if (c) out.push(`${host} ul li::marker,${host} ol li::marker{color:${c} !important}`);
  }

  /* ── Poster (image with overlay text) ─────────────────────────────────── */
  {
    const POSTER = `${host} :is([class*="poster"], [class*="bg-img"][class*="card"], [class*="hero-card"])`;
    const ff   = t("poster.fontFamily");
    const ts   = px("poster.title.size");
    const tc   = t("poster.title.color");
    const ovBg = t("poster.overlay.bg");
    const padH = px("poster.padding.h");
    const padV = px("poster.padding.v");
    if (ff || ts || tc) {
      const d: string[] = [];
      if (ff) d.push(`font-family:${ff} !important`);
      if (ts) d.push(`font-size:${ts} !important`);
      if (tc) d.push(`color:${tc} !important`);
      out.push(`${POSTER} :is(h1,h2,h3,h4,[class*="title"]){${d.join(";")}}`);
    }
    if (ovBg) out.push(`${POSTER} [class*="overlay"],${POSTER}::before{background:${ovBg} !important}`);
    if (padH && padV) out.push(`${POSTER}{padding:${padV} ${padH} !important}`);
  }

  /* ── Image card (imgCard) ─────────────────────────────────────────────── */
  {
    const IMGCARD = `${host} :is([class*="img-card"],[class*="image-card"],[class*="imgCard"],figure:has(figcaption))`;
    const bg   = t("imgCard.bg");
    const c    = t("imgCard.color");
    const padH = px("imgCard.padding.h");
    const padV = px("imgCard.padding.v");
    const bc   = t("imgCard.border.color");
    const bs   = px("imgCard.border.size");
    const br   = px("imgCard.border.radius");
    const sc   = t("imgCard.shadow.color");
    const sb   = num("imgCard.shadow.blur");
    const sx   = num("imgCard.shadow.x");
    const sy   = num("imgCard.shadow.y");
    const d: string[] = [];
    if (bg) d.push(`background:${bg} !important`);
    if (c)  d.push(`color:${c} !important`);
    if (padH && padV) d.push(`padding:${padV} ${padH} !important`);
    if (bc && bs) d.push(`border:${bs} solid ${bc} !important`);
    if (br) d.push(`border-radius:${br} !important`);
    if (sc && (sb || sx || sy)) d.push(`box-shadow:${sx ?? 0}px ${sy ?? 0}px ${sb ?? 0}px ${sc} !important`);
    if (d.length) out.push(`${IMGCARD}{${d.join(";")}}`);
  }

  /* ── Collage ──────────────────────────────────────────────────────────── */
  {
    const gap    = px("collage.gap");
    const radius = px("collage.radius");
    const COLL = `${host} :is([class*="collage"],[class*="gallery"][class*="grid"],[class*="photo-grid"])`;
    if (gap)    out.push(`${COLL}{gap:${gap} !important}`);
    if (radius) out.push(`${COLL} img{border-radius:${radius} !important}`);
  }

  /* ── Generic overlay ──────────────────────────────────────────────────── */
  {
    const color   = t("overlay.color");
    const opacity = num("overlay.opacity");
    const OV = `${host} :is([class*="overlay"],[class*="backdrop"]):not([data-design-scope])`;
    if (color)   out.push(`${OV}{background:${color} !important}`);
    if (opacity) out.push(`${OV}{opacity:${opacity} !important}`);
  }

  /* ── Icons (decorative, non-social) ──────────────────────────────────── */
  {
    const c  = t("icon.color");
    const hc = t("icon.hoverColor");
    const s  = px("icon.size");
    const ICON = `${host} :is([class*="icon"]:not([class*="social"]):not([class*="icon-btn"]),svg[data-icon])`;
    if (c || s) {
      const d: string[] = [];
      if (c) d.push(`color:${c} !important`);
      if (s) d.push(`width:${s} !important;height:${s} !important`);
      out.push(`${ICON}{${d.join(";")}}`);
    }
    if (hc) out.push(`a:hover ${ICON},button:hover ${ICON}{color:${hc} !important}`);
  }

  /* ── Listing border + featured + bgImage + social ─────────────────────── */
  {
    const LISTING_ITEM = `${host} :is([class*="listing"],[class*="items-grid"]) :is([class*="card"],article,li:not([class*="nav"]))`;

    // Border
    const lbc = t("listing.border.color");
    const lbs = px("listing.border.size");
    const lbr = px("listing.border.radius");
    const bd: string[] = [];
    if (lbc && lbs) bd.push(`border:${lbs} solid ${lbc} !important`);
    if (lbr) bd.push(`border-radius:${lbr} !important`);
    if (bd.length) out.push(`${LISTING_ITEM}{${bd.join(";")}}`);

    // Featured
    const FEAT = `${host} :is([class*="listing"],[class*="items-grid"]) :is([class*="featured"],[class*="highlight"],[aria-current="true"])`;
    const ftc = t("listing.featured.titleColor");
    const ftt = t("listing.featured.textColor");
    const fBg = t("listing.featured.bg");
    if (fBg) out.push(`${FEAT}{background:${fBg} !important}`);
    if (ftc) out.push(`${FEAT} :is(h1,h2,h3,h4,[class*="title"]){color:${ftc} !important}`);
    if (ftt) out.push(`${FEAT} p{color:${ftt} !important}`);

    // bgImage items
    const BGIMG = `${host} :is([class*="listing"],[class*="items-grid"]) :is([class*="bg-img"],[class*="bg-image"],[style*="background-image"])`;
    const biOv = t("listing.bgImage.overlay");
    const biOp = num("listing.bgImage.opacity");
    const biTc = t("listing.bgImage.titleColor");
    const biTxt = t("listing.bgImage.textColor");
    if (biOv) {
      const opPart = biOp ? `;opacity:${biOp} !important` : "";
      out.push(`${BGIMG}::before{background:${biOv} !important${opPart}}`);
    }
    if (biTc)  out.push(`${BGIMG} :is(h1,h2,h3,h4,[class*="title"]){color:${biTc} !important}`);
    if (biTxt) out.push(`${BGIMG} p{color:${biTxt} !important}`);

    // Social links within listing cards
    const LSOC_LINK = `a[href*="instagram"],a[href*="facebook"],a[href*="twitter"],a[href*="x.com"],a[href*="linkedin"],a[href*="tiktok"],a[href*="youtube"]`;
    const LSOC = `${host} :is([class*="listing"],[class*="items-grid"]) :is(${LSOC_LINK},[class*="social"] a)`;
    const lsc  = t("listing.social.color");
    const lshc = t("listing.social.hoverColor");
    const lss  = px("listing.social.size");
    const lsg  = px("listing.social.gap");
    if (lsc || lss) {
      const d: string[] = [];
      if (lsc) d.push(`color:${lsc} !important`);
      if (lss) d.push(`width:${lss} !important;height:${lss} !important;font-size:${lss} !important`);
      out.push(`${LSOC}{${d.join(";")}}`);
    }
    if (lshc) out.push(`${LSOC}:hover{color:${lshc} !important}`);
    if (lsg)  out.push(`${host} :is([class*="listing"],[class*="items-grid"]) [class*="social"]{gap:${lsg} !important}`);
  }

  return out.join("\n");
}
