"use client";

// Webero Commerce admin — design system & shared utilities.

import { createContext, useContext, type ReactNode } from "react";

export type CommerceAdminDesign = "ink" | "glass" | "webero" | "studio";

export const COMMERCE_DEFAULT_DESIGN: CommerceAdminDesign = "ink";

export const COMMERCE_DESIGN_OPTIONS: Array<{ key: CommerceAdminDesign; label: string; dot: string }> = [
  { key: "ink", label: "Webero Ink", dot: "bg-[#1d9a44]" },
  { key: "glass", label: "Studio glass", dot: "bg-[#d7f99c]" },
  { key: "webero", label: "Webero clarity", dot: "bg-indigo-500" },
  { key: "studio", label: "Studio editor", dot: "bg-violet-500" },
];

export interface CommerceTheme {
  design: CommerceAdminDesign;
  inputCls: string;
  labelCls: string;
  btnPrimary: string;
  btnGhost: string;
  btnDanger: string;
  toolbarCls: string;
  tableShellCls: string;
  tableHeadRowCls: string;
  tableRowCls: string;
  pagerBtnCls: string;
  cardCls: string;
  sectionCls: string;
  sectionTitleCls: string;
  noticeCls: string;
  linkAccentCls: string;
  ctaSmallCls: string;
  metricActionCls: string;
  periodShellCls: string;
  periodTileActiveCls: string;
  periodTileActiveArrowCls: string;
  periodTileInactiveCls: string;
  periodActiveLabelCls: string;
  headingAccentCls: string;
  chartPrimary: string;
  chartSecondary: string;
  chartSecondarySoft: string;
  chartGrid: string;
  statusFallbackBadge: string;
  expandedRowCls: string;
  detailPanelCls: string;
  variantHeadRowCls: string;
  rankBadgeCls: string;
  selectedChipCls: string;
  choiceChipCls: string;
  checkboxAccentCls: string;
  drawerBackdropCls: string;
  drawerShellCls: string;
  drawerHeaderCls: string;
  drawerArchiveLinkCls: string;
  imageMainBadgeCls: string;
  // Nové pro lepší design
  tabBarCls: string;
  tabActiveCls: string;
  tabInactiveCls: string;
  emptyStateCls: string;
  badgeNeutralCls: string;
  dropdownCls: string;
  dropdownItemCls: string;
  accentColor: string;
  // Hover náhled objednávky (popover)
  popoverShellCls: string;
  popoverTintCls: string;
  popoverFooterCls: string;
}

export const COMMERCE_THEMES: Record<CommerceAdminDesign, CommerceTheme> = {
  ink: {
    design: "ink",
    accentColor: "#1d9a44",
    inputCls: "h-[40px] w-full rounded-xl border border-[#e4e4db] bg-white px-3.5 text-[13px] text-[#141613] outline-none shadow-[0_1px_2px_rgba(20,22,19,0.04)] transition-all duration-200 placeholder:text-[#a3a69c] focus:border-[#1d9a44] focus:shadow-[0_0_0_3px_rgba(29,154,68,0.12)] focus:ring-0",
    labelCls: "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8a8d82]",
    btnPrimary: "inline-flex h-[40px] items-center gap-2 rounded-xl bg-gradient-to-b from-[#26b854] to-[#1d9a44] px-5 text-[13px] font-bold text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)] transition-all duration-200 hover:from-[#2cc75c] hover:to-[#21a94b] hover:shadow-[0_4px_16px_rgba(29,154,68,0.4)] active:scale-[0.97] disabled:opacity-50",
    btnGhost: "inline-flex h-[40px] items-center gap-2 rounded-xl border border-[#e4e4db] bg-white px-4 text-[13px] font-semibold text-[#3a3d35] shadow-[0_1px_2px_rgba(20,22,19,0.04)] transition-all duration-200 hover:border-[#141613] hover:text-[#141613] active:scale-[0.97] disabled:opacity-50",
    btnDanger: "inline-flex h-[40px] items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-600 shadow-[0_1px_2px_rgba(20,22,19,0.04)] transition-all duration-200 hover:border-rose-400 hover:bg-rose-50 active:scale-[0.97] disabled:opacity-50",
    toolbarCls: "mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e9e9e0] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(20,22,19,0.03)]",
    tableShellCls: "overflow-hidden rounded-[20px] border border-[#e9e9e0] bg-white shadow-[0_1px_2px_rgba(20,22,19,0.04),0_16px_40px_rgba(20,22,19,0.05)]",
    tableHeadRowCls: "border-b border-[#efefe6] bg-[#fafaf5] text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8a8d82]",
    tableRowCls: "border-b border-[#f3f3ea] transition-colors duration-150 hover:bg-[#f3faf4]",
    pagerBtnCls: "rounded-lg border border-[#e4e4db] bg-white px-3 py-1.5 text-[13px] text-[#5a5d53] shadow-[0_1px_2px_rgba(20,22,19,0.04)] transition-all duration-200 hover:border-[#141613] hover:text-[#141613] disabled:opacity-40",
    cardCls: "rounded-[20px] border border-[#e9e9e0] bg-white shadow-[0_1px_2px_rgba(20,22,19,0.04),0_16px_40px_rgba(20,22,19,0.05)]",
    sectionCls: "rounded-[20px] border border-[#e9e9e0] bg-white p-6 shadow-[0_1px_2px_rgba(20,22,19,0.04)]",
    sectionTitleCls: "mb-5 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-[0.1em] text-[#141613] after:flex-1 after:h-px after:bg-[#efefe6]",
    noticeCls: "mt-4 rounded-xl border border-[#efefe6] bg-[#fafaf5] px-4 py-2.5 text-[12px] text-[#8a8d82]",
    linkAccentCls: "font-semibold text-[#1d9a44] transition-colors hover:text-[#137a35]",
    ctaSmallCls: "rounded-lg bg-[#141613] px-3.5 py-1.5 text-[11.5px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#1d9a44]",
    metricActionCls: "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,22,19,0.08)]",
    periodShellCls: "grid grid-cols-2 overflow-hidden rounded-[20px] border border-[#e9e9e0] bg-white shadow-[0_1px_2px_rgba(20,22,19,0.04),0_16px_40px_rgba(20,22,19,0.05)] lg:grid-cols-4",
    periodTileActiveCls: "bg-[#141613] text-white",
    periodTileActiveArrowCls: "bg-[#141613]",
    periodTileInactiveCls: "bg-white text-[#141613]",
    periodActiveLabelCls: "text-[#7ee2a0]",
    headingAccentCls: "text-[#141613]",
    chartPrimary: "#1d9a44",
    chartSecondary: "#d7a84f",
    chartSecondarySoft: "rgba(215,168,79,0.14)",
    chartGrid: "#efefe6",
    statusFallbackBadge: "border-[#bfe6c9] bg-[#eaf7ee] text-[#137a35]",
    expandedRowCls: "bg-[#fafaf5]",
    detailPanelCls: "grid gap-5 rounded-xl bg-white p-5 md:grid-cols-[1fr_280px]",
    variantHeadRowCls: "border-b border-[#efefe6] bg-[#fafaf5] text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8a8d82]",
    rankBadgeCls: "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf7ee] text-[10.5px] font-bold text-[#137a35]",
    selectedChipCls: "border-[#141613] bg-[#141613] text-white shadow-sm",
    choiceChipCls: "border-[#e4e4db] bg-white text-[#5a5d53] transition-colors hover:border-[#1d9a44] hover:text-[#137a35]",
    checkboxAccentCls: "accent-[#1d9a44]",
    drawerBackdropCls: "absolute inset-0 bg-[#141613]/45 backdrop-blur-[6px]",
    drawerShellCls: "relative flex h-full w-full max-w-[860px] flex-col bg-[#f6f6f0] shadow-2xl",
    drawerHeaderCls: "flex shrink-0 items-center gap-3 border-b border-[#e9e9e0] bg-white px-6 py-4 shadow-[0_1px_2px_rgba(20,22,19,0.04)]",
    drawerArchiveLinkCls: "text-[12.5px] font-semibold text-[#a3a69c] transition-colors hover:text-rose-500",
    imageMainBadgeCls: "absolute left-1.5 top-1.5 rounded-md bg-[#141613] px-2 py-0.5 text-[10px] font-bold text-white",
    tabBarCls: "flex gap-0 border-b border-[#e9e9e0]",
    tabActiveCls: "relative px-4 py-3 text-[13px] font-bold text-[#141613] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-[#1d9a44]",
    tabInactiveCls: "px-4 py-3 text-[13px] font-medium text-[#a3a69c] transition-colors hover:text-[#3a3d35]",
    emptyStateCls: "rounded-[20px] border-2 border-dashed border-[#ddddd2] bg-[#fafaf5] py-12 text-center",
    badgeNeutralCls: "inline-flex items-center rounded-md border border-[#e9e9e0] bg-[#fafaf5] px-2 py-0.5 text-[11px] font-semibold text-[#5a5d53]",
    dropdownCls: "absolute left-0 top-full z-30 mt-1.5 min-w-[200px] rounded-xl border border-[#e9e9e0] bg-white py-1.5 shadow-[0_12px_36px_rgba(20,22,19,0.12),0_2px_6px_rgba(20,22,19,0.05)]",
    dropdownItemCls: "block w-full px-4 py-2 text-left text-[13px] text-[#3a3d35] transition-colors hover:bg-[#f3faf4]",
    popoverShellCls: "overflow-hidden rounded-2xl border border-[#e4e4db] bg-white shadow-[0_18px_50px_rgba(20,22,19,0.18),0_4px_12px_rgba(20,22,19,0.08)]",
    popoverTintCls: "bg-[#f3faf4]",
    popoverFooterCls: "bg-[#fafaf5]",
  },
  glass: {
    design: "glass",
    accentColor: "#7fa52c",
    inputCls: "h-[38px] w-full rounded-[10px] border border-slate-200/80 bg-white px-3.5 text-[13px] text-slate-800 outline-none shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#a3c95f] focus:shadow-[0_0_0_3px_rgba(163,201,95,0.12)] focus:ring-0",
    labelCls: "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500",
    btnPrimary: "inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-[#2d3a25] px-5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(45,58,37,0.15)] transition-all duration-200 hover:bg-[#1f2a19] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(45,58,37,0.2)] active:scale-[0.98] disabled:opacity-50",
    btnGhost: "inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-50",
    btnDanger: "inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] disabled:opacity-50",
    toolbarCls: "mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm",
    tableShellCls: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
    tableHeadRowCls: "border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-[0.06em] text-slate-500",
    tableRowCls: "border-b border-slate-50 transition-colors duration-150 hover:bg-[#f9faf6]",
    pagerBtnCls: "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40",
    cardCls: "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
    sectionCls: "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    sectionTitleCls: "mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-slate-800 after:flex-1 after:h-px after:bg-slate-100",
    noticeCls: "mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-[12px] text-slate-500",
    linkAccentCls: "font-semibold text-[#5e7828] hover:text-[#3f5519] transition-colors",
    ctaSmallCls: "rounded-lg bg-[#2d3a25] px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1f2a19]",
    metricActionCls: "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
    periodShellCls: "grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] lg:grid-cols-4",
    periodTileActiveCls: "bg-[#151d17] text-white",
    periodTileActiveArrowCls: "bg-[#151d17]",
    periodTileInactiveCls: "bg-white text-slate-800",
    periodActiveLabelCls: "text-[#d7f99c]",
    headingAccentCls: "text-slate-900",
    chartPrimary: "#7fa52c",
    chartSecondary: "#d7a84f",
    chartSecondarySoft: "rgba(215,168,79,0.14)",
    chartGrid: "#f1f3ee",
    statusFallbackBadge: "border-lime-200 bg-lime-50 text-lime-800",
    expandedRowCls: "bg-[#fafbf8]",
    detailPanelCls: "grid gap-5 rounded-xl bg-white p-5 md:grid-cols-[1fr_280px]",
    variantHeadRowCls: "border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-[0.06em] text-slate-500",
    rankBadgeCls: "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10.5px] font-bold text-slate-600",
    selectedChipCls: "border-[#2d3a25] bg-[#2d3a25] text-white shadow-sm",
    choiceChipCls: "border-slate-200 bg-white text-slate-600 hover:border-[#a3c95f] hover:text-[#3f5519] transition-colors",
    checkboxAccentCls: "accent-[#7fa52c]",
    drawerBackdropCls: "absolute inset-0 bg-black/30 backdrop-blur-[6px]",
    drawerShellCls: "relative flex h-full w-full max-w-[860px] flex-col bg-[#f8f9f6] shadow-2xl",
    drawerHeaderCls: "flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
    drawerArchiveLinkCls: "text-[12.5px] font-semibold text-slate-400 hover:text-rose-500 transition-colors",
    imageMainBadgeCls: "absolute left-1.5 top-1.5 rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-semibold text-white",
    tabBarCls: "flex gap-0 border-b border-slate-200",
    tabActiveCls: "relative px-4 py-3 text-[13px] font-semibold text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7fa52c] after:rounded-t",
    tabInactiveCls: "px-4 py-3 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors",
    emptyStateCls: "rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center",
    badgeNeutralCls: "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600",
    dropdownCls: "absolute left-0 top-full z-30 mt-1.5 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04)]",
    dropdownItemCls: "block w-full px-4 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50",
    popoverShellCls: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.07)]",
    popoverTintCls: "bg-[#f6f9ee]",
    popoverFooterCls: "bg-slate-50",
  },
  webero: {
    design: "webero",
    accentColor: "#4f46e5",
    inputCls: "h-[38px] w-full rounded-[10px] border border-slate-200 bg-white px-3.5 text-[13px] text-slate-900 outline-none shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] focus:ring-0",
    labelCls: "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500",
    btnPrimary: "inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-indigo-600 px-5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(79,70,229,0.2)] transition-all duration-200 hover:bg-indigo-700 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(79,70,229,0.25)] active:scale-[0.98] disabled:opacity-50",
    btnGhost: "inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.98] disabled:opacity-50",
    btnDanger: "inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-rose-200 bg-white px-4 text-[13px] font-semibold text-rose-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-rose-50 hover:border-rose-300 active:scale-[0.98] disabled:opacity-50",
    toolbarCls: "mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    tableShellCls: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
    tableHeadRowCls: "border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-[0.06em] text-slate-500",
    tableRowCls: "border-b border-slate-50 transition-colors duration-150 hover:bg-indigo-50/40",
    pagerBtnCls: "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 disabled:opacity-40",
    cardCls: "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
    sectionCls: "rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    sectionTitleCls: "mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-slate-800 after:flex-1 after:h-px after:bg-slate-100",
    noticeCls: "mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-[12px] text-slate-500",
    linkAccentCls: "font-semibold text-indigo-600 hover:text-indigo-700 transition-colors",
    ctaSmallCls: "rounded-lg bg-indigo-600 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700",
    metricActionCls: "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
    periodShellCls: "grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] lg:grid-cols-4",
    periodTileActiveCls: "bg-indigo-600 text-white",
    periodTileActiveArrowCls: "bg-indigo-600",
    periodTileInactiveCls: "bg-white text-slate-800",
    periodActiveLabelCls: "text-indigo-100",
    headingAccentCls: "text-slate-900",
    chartPrimary: "#6366f1",
    chartSecondary: "#14b8a6",
    chartSecondarySoft: "rgba(20,184,166,0.14)",
    chartGrid: "#f1f5f9",
    statusFallbackBadge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    expandedRowCls: "bg-indigo-50/30",
    detailPanelCls: "grid gap-5 rounded-xl bg-white p-5 md:grid-cols-[1fr_280px]",
    variantHeadRowCls: "border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-[0.06em] text-slate-500",
    rankBadgeCls: "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10.5px] font-bold text-indigo-700",
    selectedChipCls: "border-indigo-600 bg-indigo-600 text-white shadow-sm",
    choiceChipCls: "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors",
    checkboxAccentCls: "accent-indigo-600",
    drawerBackdropCls: "absolute inset-0 bg-black/30 backdrop-blur-[6px]",
    drawerShellCls: "relative flex h-full w-full max-w-[860px] flex-col bg-[#f8fafc] shadow-2xl",
    drawerHeaderCls: "flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
    drawerArchiveLinkCls: "text-[12.5px] font-semibold text-slate-400 hover:text-rose-500 transition-colors",
    imageMainBadgeCls: "absolute left-1.5 top-1.5 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white",
    tabBarCls: "flex gap-0 border-b border-slate-200",
    tabActiveCls: "relative px-4 py-3 text-[13px] font-semibold text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-600 after:rounded-t",
    tabInactiveCls: "px-4 py-3 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors",
    emptyStateCls: "rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center",
    badgeNeutralCls: "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600",
    dropdownCls: "absolute left-0 top-full z-30 mt-1.5 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04)]",
    dropdownItemCls: "block w-full px-4 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-50",
    popoverShellCls: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(30,27,75,0.16),0_4px_12px_rgba(30,27,75,0.07)]",
    popoverTintCls: "bg-indigo-50/60",
    popoverFooterCls: "bg-slate-50",
  },
  studio: {
    design: "studio",
    accentColor: "#8b5cf6",
    inputCls: "h-[38px] w-full rounded-[10px] border border-white/20 bg-white/90 px-3.5 text-[13px] text-slate-900 outline-none shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-md transition-all duration-200 placeholder:text-slate-400 focus:border-violet-400 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] focus:ring-0",
    labelCls: "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500",
    btnPrimary: "inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-violet-600 px-5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(139,92,246,0.25)] transition-all duration-200 hover:bg-violet-700 hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_20px_rgba(139,92,246,0.3)] active:scale-[0.98] disabled:opacity-50",
    btnGhost: "inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-white/30 bg-white/80 px-4 text-[13px] font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] active:scale-[0.98] disabled:opacity-50",
    btnDanger: "inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-rose-200/60 bg-white/80 px-4 text-[13px] font-semibold text-rose-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:bg-rose-50/80 active:scale-[0.98] disabled:opacity-50",
    toolbarCls: "mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl",
    tableShellCls: "overflow-hidden rounded-2xl border border-white/15 bg-white/92 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl",
    tableHeadRowCls: "border-b border-violet-100/60 bg-violet-50/40 text-left text-[11px] uppercase tracking-[0.06em] text-slate-500",
    tableRowCls: "border-b border-slate-100/60 transition-colors duration-150 hover:bg-violet-50/30",
    pagerBtnCls: "rounded-lg border border-white/30 bg-white/80 px-3 py-1.5 text-[13px] text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] disabled:opacity-40",
    cardCls: "rounded-2xl border border-white/15 bg-white/92 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl",
    sectionCls: "rounded-2xl border border-white/20 bg-white/92 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-xl",
    sectionTitleCls: "mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.06em] text-slate-800 after:flex-1 after:h-px after:bg-violet-100/60",
    noticeCls: "mt-4 rounded-xl border border-violet-100/50 bg-violet-50/30 px-4 py-2.5 text-[12px] text-slate-500",
    linkAccentCls: "font-semibold text-violet-600 hover:text-violet-700 transition-colors",
    ctaSmallCls: "rounded-lg bg-violet-600 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-violet-700",
    metricActionCls: "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(139,92,246,0.1)]",
    periodShellCls: "grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-white/92 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:grid-cols-4",
    periodTileActiveCls: "bg-[#111014] text-white",
    periodTileActiveArrowCls: "bg-[#111014]",
    periodTileInactiveCls: "bg-white/80 text-slate-800",
    periodActiveLabelCls: "text-violet-300",
    headingAccentCls: "text-slate-900",
    chartPrimary: "#8b5cf6",
    chartSecondary: "#10b981",
    chartSecondarySoft: "rgba(16,185,129,0.14)",
    chartGrid: "#ede9fe",
    statusFallbackBadge: "border-violet-200 bg-violet-50 text-violet-700",
    expandedRowCls: "bg-violet-50/30",
    detailPanelCls: "grid gap-5 rounded-xl bg-white/90 p-5 backdrop-blur-md md:grid-cols-[1fr_280px]",
    variantHeadRowCls: "border-b border-violet-100/60 bg-violet-50/40 text-left text-[11px] uppercase tracking-[0.06em] text-slate-500",
    rankBadgeCls: "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-50 text-[10.5px] font-bold text-violet-700",
    selectedChipCls: "border-violet-600 bg-violet-600 text-white shadow-sm",
    choiceChipCls: "border-slate-200/60 bg-white/80 text-slate-600 hover:border-violet-300 hover:text-violet-700 transition-colors",
    checkboxAccentCls: "accent-violet-600",
    drawerBackdropCls: "absolute inset-0 bg-black/40 backdrop-blur-[8px]",
    drawerShellCls: "relative flex h-full w-full max-w-[860px] flex-col border-l border-white/10 bg-[#f5f3f9]/95 shadow-2xl backdrop-blur-2xl",
    drawerHeaderCls: "flex shrink-0 items-center gap-3 border-b border-violet-200/40 bg-white/90 px-6 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur",
    drawerArchiveLinkCls: "text-[12.5px] font-semibold text-slate-400 hover:text-rose-500 transition-colors",
    imageMainBadgeCls: "absolute left-1.5 top-1.5 rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white",
    tabBarCls: "flex gap-0 border-b border-violet-100/60",
    tabActiveCls: "relative px-4 py-3 text-[13px] font-semibold text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-violet-500 after:rounded-t",
    tabInactiveCls: "px-4 py-3 text-[13px] font-medium text-slate-400 hover:text-slate-600 transition-colors",
    emptyStateCls: "rounded-2xl border-2 border-dashed border-violet-200/40 bg-violet-50/20 py-12 text-center",
    badgeNeutralCls: "inline-flex items-center rounded-md border border-violet-200/50 bg-violet-50/40 px-2 py-0.5 text-[11px] font-semibold text-slate-600",
    dropdownCls: "absolute left-0 top-full z-30 mt-1.5 min-w-[200px] rounded-xl border border-white/20 bg-white/95 py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] backdrop-blur-xl",
    dropdownItemCls: "block w-full px-4 py-2 text-left text-[13px] text-slate-700 transition-colors hover:bg-violet-50/50",
    popoverShellCls: "overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-[0_18px_50px_rgba(76,29,149,0.2),0_4px_12px_rgba(76,29,149,0.08)] backdrop-blur-xl",
    popoverTintCls: "bg-violet-50/60",
    popoverFooterCls: "bg-violet-50/40",
  },
};

const CommerceThemeContext = createContext<CommerceTheme>(COMMERCE_THEMES.glass);

export function CommerceThemeProvider({ design, children }: { design: CommerceAdminDesign; children: ReactNode }) {
  return (
    <CommerceThemeContext.Provider value={COMMERCE_THEMES[design]}>
      {children}
    </CommerceThemeContext.Provider>
  );
}

export function useCommerceTheme() {
  return useContext(CommerceThemeContext);
}

/**
 * Chrome stránky (velká hlavička s kickerem/titulkem) — tab si ji může schovat,
 * když renderuje vlastní celostránkový pohled (např. detail objednávky).
 */
export const PageChromeContext = createContext<{ setPageHeaderHidden: (hidden: boolean) => void }>({
  setPageHeaderHidden: () => {},
});

export function usePageChrome() {
  return useContext(PageChromeContext);
}

export function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 })
    .format(cents / 100);
}

export function czkShort(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(cents / 100);
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export function centsToKcInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}
export function kcInputToCents(value: string): number | null {
  const v = value.replace(/\s/g, "").replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body instanceof FormData ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Chyba ${res.status}`);
  return data as T;
}

export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  draft: "Koncept", active: "Aktivní", archived: "Archiv",
};
export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Nová", confirmed: "Potvrzená", processing: "Zpracovává se",
  shipped: "Odeslaná", completed: "Dokončená", cancelled: "Stornovaná",
};
export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Čeká", authorized: "Autorizovaná", paid: "Zaplaceno", failed: "Selhala",
  cancelled: "Zrušená", refunded: "Vráceno", partially_refunded: "Část. vráceno",
};
export const ORDER_NEXT: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

const STATUS_COLORS: Record<string, string> = {
  active: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  paid: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  completed: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200/80 bg-rose-50 text-rose-700",
  failed: "border-rose-200/80 bg-rose-50 text-rose-700",
  archived: "border-rose-200/80 bg-rose-50/70 text-rose-600",
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  pending: "border-amber-200/80 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200/80 bg-blue-50 text-blue-700",
  processing: "border-violet-200/80 bg-violet-50 text-violet-700",
  shipped: "border-sky-200/80 bg-sky-50 text-sky-700",
  authorized: "border-amber-200/80 bg-amber-50 text-amber-700",
  refunded: "border-slate-200 bg-slate-50 text-slate-600",
  partially_refunded: "border-orange-200/80 bg-orange-50 text-orange-700",
};

export function StatusBadge({ value, map }: { value: string; map: Record<string, string> }) {
  const theme = useCommerceTheme();
  const tone = STATUS_COLORS[value] ?? theme.statusFallbackBadge;
  return (
    <span className={`inline-flex min-h-[22px] items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-none ${tone}`}>
      {map[value] ?? value}
    </span>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
      <span>{message}</span>
    </div>
  );
}

export const inputCls = COMMERCE_THEMES.glass.inputCls;
export const labelCls = COMMERCE_THEMES.glass.labelCls;
export const btnPrimary = COMMERCE_THEMES.glass.btnPrimary;
export const btnGhost = COMMERCE_THEMES.glass.btnGhost;
export const tableShellCls = COMMERCE_THEMES.glass.tableShellCls;
export const tableHeadRowCls = COMMERCE_THEMES.glass.tableHeadRowCls;
export const tableRowCls = COMMERCE_THEMES.glass.tableRowCls;
export const pagerBtnCls = COMMERCE_THEMES.glass.pagerBtnCls;

// ── API row types ────────────────────────────────────────────────────────────

export interface ProductRow {
  id: number; slug: string; title: string; brand: string | null; status: string;
  price_min_cents: number; price_max_cents: number; stock_total: number;
  variant_count: number; sku: string | null; image_url: string | null; updated_at: string;
  flags: string; created_at: string;
}
export interface CategoryRow {
  id: number; slug: string; name: string; parent_id: number | null;
  is_visible: boolean; product_count: number; sort_order: number;
  image_url: string | null; description: string | null;
}
export interface OrderAddressData {
  name?: string; street?: string; city?: string; zip?: string;
  country?: string; phone?: string; company?: string; ico?: string; dic?: string;
}
export interface OrderRow {
  id: number; order_number: string; email: string; status: string; payment_status: string;
  total_cents: number; currency: string; placed_at: string; item_count: number;
  phone: string | null; shipping_method: string | null; payment_method: string | null;
  billing_address: OrderAddressData | null; shipping_address: OrderAddressData | null;
}
export interface OrderItemRow {
  id: number; title: string; variant_title: string | null; sku: string | null;
  qty: number; unit_price_cents: number; total_cents: number;
  image_url?: string | null;
}
export interface OrderEventRow { id: number; type: string; message: string | null; created_at: string; actor_email: string | null }
export interface OrderDetailData extends OrderRow {
  subtotal_cents: number; shipping_cents: number; discount_cents: number;
  tax_cents: number; admin_note: string | null; customer_note: string | null;
  items: OrderItemRow[]; events: OrderEventRow[];
}
export interface VariantData {
  id?: number; sku: string | null; ean: string | null; title: string | null;
  option_values: Record<string, string>; price_cents: number;
  compare_at_price_cents: number | null; cost_cents: number | null;
  weight_grams: number | null; stock_qty: number; stock_policy: "deny" | "continue";
  track_stock: boolean; is_default: boolean; position: number;
}
export interface ImageData { id?: number; url: string; alt: string | null; position?: number }
export interface ProductDetailData {
  id: number; slug: string; title: string; subtitle: string | null; description: string | null;
  brand: string | null; status: "draft" | "active" | "archived"; tax_rate: number | null;
  primary_category_id: number | null; options: Array<{ name: string; values: string[] }>;
  flags: Record<string, unknown>; seo_title: string | null; seo_description: string | null;
  og_image: string | null; variants: VariantData[]; images: ImageData[]; category_ids: number[];
}
