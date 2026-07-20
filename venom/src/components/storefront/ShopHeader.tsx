"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url?: string | null;
}

interface Props {
  tenantSlug: string;
  shopName: string;
  categories: Category[];
  brands: string[];
  activeCategory: string | null;
  /** Modul cizi-meny — přepínač zobrazovací měny */
  currencySwitcher?: boolean;
  /** Modul cizi-jazyky — přepínač jazyka obsahu */
  localeSwitcher?: boolean;
}

const USP_ITEMS = [
  { icon: "truck", text: "Doprava zdarma od 1 500 Kč" },
  { icon: "clock", text: "Odesíláme do 24 hodin" },
  { icon: "undo", text: "Vrácení zboží do 30 dnů" },
  { icon: "shield", text: "Garance nejnižší ceny" },
];

const BRAND_LOGO_BASE = "/assets/eshop-01/logos/brands";

function brandLogo(file: string) {
  return `${BRAND_LOGO_BASE}/${file}.webp`;
}

const BRAND_LOGOS: Record<string, string> = {
  techpro: brandLogo("techpro"),
  samsung: brandLogo("samsung"),
  apple: brandLogo("apple"),
  xiaomi: brandLogo("xiaomi"),
  lenovo: brandLogo("lenovo"),
  sony: brandLogo("sony"),
  jbl: brandLogo("jbl"),
  bose: brandLogo("bose"),
  nike: brandLogo("nike"),
  adidas: brandLogo("adidas"),
  puma: brandLogo("puma"),
  "new balance": brandLogo("new-balance"),
  "under armour": brandLogo("under-armour"),
  reebok: brandLogo("reebok"),
  "the north face": brandLogo("the-north-face"),
  columbia: brandLogo("columbia"),
  patagonia: brandLogo("patagonia"),
  salomon: brandLogo("salomon"),
  loreal: brandLogo("loreal"),
  nivea: brandLogo("nivea"),
  rituals: brandLogo("rituals"),
  clinique: brandLogo("clinique"),
  "the ordinary": brandLogo("the-ordinary"),
  "ikea hack": brandLogo("ikea-hack"),
  "ferm living": brandLogo("ferm-living"),
  hay: brandLogo("hay"),
  muuto: brandLogo("muuto"),
  lavazza: brandLogo("lavazza"),
  illy: brandLogo("illy"),
  "harney and sons": brandLogo("harney-and-sons"),
  lindt: brandLogo("lindt"),
  valrhona: brandLogo("valrhona"),
  moleskine: brandLogo("moleskine"),
  leuchtturm1917: brandLogo("leuchtturm1917"),
  garmin: brandLogo("garmin"),
  fitbit: brandLogo("fitbit"),
  suunto: brandLogo("suunto"),
  crocs: brandLogo("crocs"),
  "dr martens": brandLogo("dr-martens"),
  vans: brandLogo("vans"),
  converse: brandLogo("converse"),
};

const WHITE_LOGO_SURFACE_BRANDS = new Set([
  "bose",
  "clinique",
  "dr martens",
  "garmin",
  "lavazza",
  "patagonia",
  "reebok",
  "salomon",
  "suunto",
]);

type LogoDims = {
  boxWidth: number;
  boxHeight: number;
  imageWidth: number;
  imageHeight: number;
  scale: number;
  filter?: string;
  fontSize?: number;
  letterSpacing?: string;
};

const DEFAULT_LOGO_DIMS: Record<"desktop" | "compact", LogoDims> = {
  desktop: { boxWidth: 66, boxHeight: 40, imageWidth: 48, imageHeight: 24, scale: 1 },
  compact: { boxWidth: 50, boxHeight: 32, imageWidth: 36, imageHeight: 20, scale: 1 },
};

const BRAND_LOGO_DIMS: Record<string, Partial<Record<"desktop" | "compact", Partial<LogoDims>>>> = {
  adidas: { desktop: { imageWidth: 38, imageHeight: 24 }, compact: { imageWidth: 28, imageHeight: 18 } },
  apple: { desktop: { imageWidth: 29, imageHeight: 29 }, compact: { imageWidth: 22, imageHeight: 22 } },
  bose: { desktop: { boxWidth: 92, imageWidth: 82, imageHeight: 30, scale: 1.08 }, compact: { boxWidth: 68, imageWidth: 60, imageHeight: 22, scale: 1.05 } },
  clinique: { desktop: { boxWidth: 92, imageWidth: 84, imageHeight: 31, scale: 1.02 }, compact: { boxWidth: 68, imageWidth: 60, imageHeight: 23, scale: 1 } },
  columbia: { desktop: { imageWidth: 35, imageHeight: 27, scale: 1.08 }, compact: { imageWidth: 27, imageHeight: 21, scale: 1.05 } },
  converse: { desktop: { imageWidth: 42, imageHeight: 26, scale: 1.1 }, compact: { imageWidth: 31, imageHeight: 21, scale: 1.08 } },
  "dr martens": { desktop: { boxWidth: 78, imageWidth: 62, imageHeight: 34, scale: 1.42 }, compact: { boxWidth: 58, imageWidth: 45, imageHeight: 25, scale: 1.28 } },
  "ferm living": { desktop: { imageWidth: 34, imageHeight: 27, scale: 1.16 }, compact: { imageWidth: 26, imageHeight: 21, scale: 1.12 } },
  garmin: { desktop: { boxWidth: 94, imageWidth: 86, imageHeight: 31, scale: 1.02 }, compact: { boxWidth: 70, imageWidth: 62, imageHeight: 23, scale: 1 } },
  hay: { desktop: { imageWidth: 42, imageHeight: 25, scale: 1.08 }, compact: { imageWidth: 32, imageHeight: 19, scale: 1.06 } },
  "harney and sons": { desktop: { imageWidth: 34, imageHeight: 28, scale: 1.35 }, compact: { imageWidth: 26, imageHeight: 22, scale: 1.25 } },
  jbl: { desktop: { imageWidth: 34, imageHeight: 27, scale: 1.1 }, compact: { imageWidth: 25, imageHeight: 21, scale: 1.08 } },
  loreal: { desktop: { boxWidth: 96, imageWidth: 80, imageHeight: 27, scale: 1.02 }, compact: { boxWidth: 70, imageWidth: 58, imageHeight: 20, scale: 1 } },
  lavazza: { desktop: { boxWidth: 96, imageWidth: 84, imageHeight: 32, scale: 1.02 }, compact: { boxWidth: 70, imageWidth: 60, imageHeight: 24, scale: 1 } },
  lenovo: { desktop: { boxWidth: 88, imageWidth: 78, imageHeight: 31, scale: 1.04 }, compact: { boxWidth: 66, imageWidth: 58, imageHeight: 23, scale: 1 } },
  leuchtturm1917: { desktop: { imageWidth: 34, imageHeight: 28, scale: 1.18 }, compact: { imageWidth: 26, imageHeight: 22, scale: 1.14 } },
  moleskine: { desktop: { boxWidth: 78, imageWidth: 64, imageHeight: 28, scale: 1.18 }, compact: { boxWidth: 58, imageWidth: 46, imageHeight: 21, scale: 1.14 } },
  muuto: { desktop: { imageWidth: 39, imageHeight: 28, scale: 1.12 }, compact: { imageWidth: 30, imageHeight: 22, scale: 1.08 } },
  nike: { desktop: { imageWidth: 44, imageHeight: 25, scale: 1.12 }, compact: { imageWidth: 33, imageHeight: 19, scale: 1.1 } },
  nivea: { desktop: { boxWidth: 86, imageWidth: 76, imageHeight: 34, scale: 1.02 }, compact: { boxWidth: 64, imageWidth: 56, imageHeight: 25, scale: 1 } },
  patagonia: { desktop: { boxWidth: 90, imageWidth: 78, imageHeight: 32, scale: 1.22 }, compact: { boxWidth: 66, imageWidth: 56, imageHeight: 24, scale: 1.12 } },
  puma: { desktop: { imageWidth: 45, imageHeight: 25, scale: 1.1 }, compact: { imageWidth: 34, imageHeight: 19, scale: 1.08 } },
  reebok: { desktop: { boxWidth: 88, imageWidth: 76, imageHeight: 33, scale: 1.08 }, compact: { boxWidth: 66, imageWidth: 56, imageHeight: 24, scale: 1.03 } },
  rituals: { desktop: { boxWidth: 98, imageWidth: 86, imageHeight: 30, scale: 1, filter: "brightness(0)" }, compact: { boxWidth: 72, imageWidth: 62, imageHeight: 22, scale: 1, filter: "brightness(0)" } },
  salomon: { desktop: { boxWidth: 88, imageWidth: 76, imageHeight: 33, scale: 1.02 }, compact: { boxWidth: 66, imageWidth: 56, imageHeight: 25, scale: 1 } },
  samsung: { desktop: { boxWidth: 96, imageWidth: 88, imageHeight: 31, scale: 1.03 }, compact: { boxWidth: 72, imageWidth: 64, imageHeight: 23, scale: 1 } },
  sony: { desktop: { boxWidth: 86, imageWidth: 74, imageHeight: 27, scale: 1.38 }, compact: { boxWidth: 64, imageWidth: 54, imageHeight: 20, scale: 1.26 } },
  suunto: { desktop: { boxWidth: 92, imageWidth: 80, imageHeight: 32, scale: 1.06 }, compact: { boxWidth: 68, imageWidth: 58, imageHeight: 24, scale: 1.02 } },
  "the north face": { desktop: { boxWidth: 72, imageWidth: 55, imageHeight: 27, scale: 1.12 }, compact: { boxWidth: 56, imageWidth: 42, imageHeight: 21, scale: 1.1 } },
  "the ordinary": { desktop: { boxWidth: 92, imageWidth: 76, imageHeight: 30, scale: 1, fontSize: 11.5, letterSpacing: "0.01em" }, compact: { boxWidth: 68, imageWidth: 56, imageHeight: 22, scale: 1, fontSize: 9.5, letterSpacing: "0" } },
  "under armour": { desktop: { imageWidth: 42, imageHeight: 27, scale: 1.1 }, compact: { imageWidth: 32, imageHeight: 21, scale: 1.08 } },
  valrhona: { desktop: { boxWidth: 82, imageWidth: 68, imageHeight: 34, scale: 1.25 }, compact: { boxWidth: 62, imageWidth: 50, imageHeight: 25, scale: 1.15 } },
  xiaomi: { desktop: { imageWidth: 34, imageHeight: 28, scale: 1.1 }, compact: { imageWidth: 26, imageHeight: 22, scale: 1.08 } },
  illy: { desktop: { imageWidth: 34, imageHeight: 30, scale: 1.12 }, compact: { imageWidth: 26, imageHeight: 23, scale: 1.08 } },
};

function normalizeBrandName(brand: string) {
  return brand
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function brandInitials(brand: string) {
  if (brand.length <= 8) return brand;
  return brand
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getLogoDims(brand: string, compact: boolean): LogoDims {
  const mode = compact ? "compact" : "desktop";
  return {
    ...DEFAULT_LOGO_DIMS[mode],
    ...(BRAND_LOGO_DIMS[normalizeBrandName(brand)]?.[mode] ?? {}),
  };
}

export function BrandLogoMark({ brand, compact = false, logoScale = 1 }: { brand: string; compact?: boolean; logoScale?: number }) {
  const [failed, setFailed] = useState(false);
  const normalizedBrand = normalizeBrandName(brand);
  const logoSrc = BRAND_LOGOS[normalizedBrand];
  const dims = getLogoDims(brand, compact);
  const hasWhiteSurface = WHITE_LOGO_SURFACE_BRANDS.has(normalizedBrand);
  const markStyle: CSSProperties = {
    width: dims.boxWidth,
    height: dims.boxHeight,
    ...(hasWhiteSurface
      ? {
          background: "#ffffff",
          borderColor: "rgba(229, 229, 229, 0.96)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.98), 0 10px 22px -17px rgba(17,24,39,0.55)",
        }
      : {}),
  };
  const imageStyle: CSSProperties = {
    width: dims.imageWidth,
    height: dims.imageHeight,
    objectFit: "contain",
    transform: dims.scale * logoScale !== 1 ? `scale(${dims.scale * logoScale})` : undefined,
    transformOrigin: "center",
    filter: dims.filter,
  };

  return (
    <span
      style={markStyle}
      className={`${compact ? "rounded-xl" : "rounded-2xl"} relative flex shrink-0 items-center justify-center overflow-hidden border border-neutral-200/80 bg-[linear-gradient(145deg,#ffffff_0%,#fbfaf8_48%,#eee9df_100%)] text-[10.5px] font-black tracking-tight text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_-16px_rgba(17,24,39,0.7)] transition duration-300 group-hover:border-neutral-300 group-hover:bg-white group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_28px_-18px_rgba(17,24,39,0.9)]`}
    >
      {logoSrc && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt={`${brand} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          style={imageStyle}
          className="block opacity-95 transition duration-300 group-hover:opacity-100"
        />
      ) : (
        <span aria-label={`${brand} logo fallback`}>{brandInitials(brand)}</span>
      )}
    </span>
  );
}

function UspIcon({ name }: { name: string }) {
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "truck": return <svg {...common}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case "undo": return <svg {...common}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>;
    case "shield": return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    default: return null;
  }
}

export function ShopHeader({ tenantSlug, shopName, categories, brands, activeCategory, currencySwitcher = false, localeSwitcher = false }: Props) {
  const base = `/demo/${tenantSlug}/obchod`;
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<number | "brands" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topLevel = categories.filter((c) => !c.parent_id);
  const childrenOf = useCallback(
    (id: number) => categories.filter((c) => c.parent_id === id),
    [categories]
  );

  // Live cart count
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/demo/${tenantSlug}/shop/cart`);
        const data = await res.json();
        if (!cancelled) setCartCount(data?.cart?.item_count ?? 0);
      } catch { /* noop */ }
    }
    load();
    const handler = () => load();
    window.addEventListener("webero-cart-updated", handler);
    return () => { cancelled = true; window.removeEventListener("webero-cart-updated", handler); };
  }, [tenantSlug]);

  // Live wishlist count
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/demo/${tenantSlug}/shop/wishlist`);
        const data = await res.json();
        if (!cancelled) setWishCount(Array.isArray(data?.items) ? data.items.length : 0);
      } catch { /* noop */ }
    }
    load();
    const handler = () => load();
    window.addEventListener("webero-wishlist-updated", handler);
    return () => { cancelled = true; window.removeEventListener("webero-wishlist-updated", handler); };
  }, [tenantSlug]);

  // Close mega menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenMenu(null); setMobileOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function enter(id: number | "brands") {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(id);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  const openCatChildren = typeof openMenu === "number" ? childrenOf(openMenu) : [];
  const openCatParent = typeof openMenu === "number" ? topLevel.find((c) => c.id === openMenu) : null;

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-[0_1px_0_rgba(0,0,0,0.07)]">
      {/* ── USP bar ────────────────────────────────────────────── */}
      <style>{`
        @keyframes uspIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes uspTruck { 0%, 68%, 100% { transform: translateX(0); } 74% { transform: translateX(3px); } 80% { transform: translateX(-2px); } 86% { transform: translateX(0); } }
        @keyframes uspClock { 0%, 68%, 100% { transform: rotate(0); } 74% { transform: rotate(-14deg); } 80% { transform: rotate(10deg); } 86% { transform: rotate(0); } }
        @keyframes uspUndo { 0%, 72%, 100% { transform: rotate(0); } 88% { transform: rotate(-360deg); } }
        @keyframes uspRing { 0%, 82%, 100% { transform: rotate(0); } 85% { transform: rotate(-16deg); } 88% { transform: rotate(13deg); } 91% { transform: rotate(-9deg); } 94% { transform: rotate(5deg); } 97% { transform: rotate(0); } }
        @keyframes uspSheen { 0%, 62% { transform: translateX(-130%) skewX(-18deg); } 100% { transform: translateX(1400%) skewX(-18deg); } }
        @keyframes uspCycle {
          0% { opacity: 0; transform: translateY(9px); }
          4%, 24% { opacity: 1; transform: translateY(0); }
          28%, 100% { opacity: 0; transform: translateY(-9px); }
        }
        .usp-in { animation: uspIn 0.5s ease-out both; }
        .usp-icon-truck { animation: uspTruck 7s ease-in-out 1.5s infinite; }
        .usp-icon-clock { animation: uspClock 7s ease-in-out 3.5s infinite; transform-origin: 50% 50%; }
        .usp-icon-undo { animation: uspUndo 7s cubic-bezier(0.45,0,0.25,1) 5.5s infinite; transform-origin: 50% 50%; }
        .usp-icon-ring { animation: uspRing 7s ease-in-out 2.5s infinite; transform-origin: 60% 40%; }
        .usp-sheen { animation: uspSheen 9s ease-in-out 2s infinite; }
        .usp-cycle { animation: uspCycle 16s ease-in-out infinite; }
        .usp-item:hover .usp-hover-icon { transform: translateY(-1px) scale(1.12); }
        .usp-hover-icon { transition: transform 0.25s ease; }
        @media (prefers-reduced-motion: reduce) {
          .usp-in, .usp-icon-truck, .usp-icon-clock, .usp-icon-undo, .usp-icon-ring, .usp-sheen { animation: none; }
          .usp-cycle { animation-duration: 24s; }
        }
      `}</style>
      <div className="relative overflow-hidden bg-neutral-950 text-white">
        {/* Světelný přejezd přes lištu */}
        <span aria-hidden className="usp-sheen pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-center gap-8 px-5 text-[11.5px] font-medium tracking-wide sm:justify-between">
          <div className="hidden items-center gap-7 sm:flex">
            {USP_ITEMS.slice(0, 3).map((u, i) => (
              <span key={u.icon} className="usp-item usp-in flex cursor-default items-center gap-1.5 text-neutral-300 transition-colors hover:text-white" style={{ animationDelay: `${i * 0.12}s` }}>
                <span className={`usp-hover-icon text-neutral-400 usp-icon-${u.icon}`}><UspIcon name={u.icon} /></span>
                {u.text}
              </span>
            ))}
          </div>
          {/* Mobil: rotující USP zprávy */}
          <div className="relative h-9 flex-1 sm:hidden">
            {USP_ITEMS.map((u, i) => (
              <span key={u.icon} className="usp-cycle absolute inset-0 flex items-center justify-center gap-1.5 text-neutral-300 opacity-0" style={{ animationDelay: `${i * 4}s` }}>
                <span className="text-neutral-400"><UspIcon name={u.icon} /></span>
                {u.text}
              </span>
            ))}
          </div>
          <div className="hidden items-center gap-5 text-neutral-400 lg:flex">
            <Link href={`${base}/ucet`} className="usp-item usp-in flex items-center gap-1.5 transition-colors hover:text-white" style={{ animationDelay: "0.36s" }}>
              <span className="usp-hover-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8" /></svg>
              </span>
              Sledování zásilky
            </Link>
            <a href="tel:+420777123456" className="usp-item usp-in flex items-center gap-1.5 transition-colors hover:text-white" style={{ animationDelay: "0.48s" }}>
              <span className="usp-hover-icon usp-icon-ring inline-flex">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
              </span>
              +420 777 123 456
            </a>
          </div>
        </div>
      </div>

      {/* ── Main row: logo / search / actions ─────────────────── */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-4 px-5 lg:gap-8">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 lg:hidden"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>

          {/* Logo */}
          <Link href={base} className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2cc75c] via-[#1d9a44] to-[#137a35] text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.5" fill="currentColor" /><circle cx="19" cy="21" r="1.5" fill="currentColor" /><path d="M2 3h3l2.7 13.4a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L23 7H6" /></svg>
            </span>
            <span className="hidden text-[19px] font-extrabold tracking-tight text-neutral-950 sm:block">
              {shopName || "Obchod"}
            </span>
          </Link>

          {/* Search */}
          <div className="hidden min-w-0 flex-1 md:block md:max-w-[560px]">
            <SearchAutocomplete tenantSlug={tenantSlug} />
          </div>
          <div className="flex-1 md:hidden" />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {localeSwitcher && <LocaleSwitcher tenantSlug={tenantSlug} />}
            {currencySwitcher && <CurrencySwitcher tenantSlug={tenantSlug} />}
            <Link href={`${base}/ucet`} className="group flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2.5 text-neutral-700 transition hover:bg-neutral-100 sm:px-3">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
              <span className="hidden text-[10px] font-semibold leading-none text-neutral-500 group-hover:text-neutral-800 lg:block">Účet</span>
            </Link>
            <Link href={`${base}/oblibene`} className="group hidden h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-3 text-neutral-700 transition hover:bg-neutral-100 sm:flex">
              <span className="relative">
                <svg width="21" height="21" viewBox="0 0 24 24" fill={wishCount > 0 ? "#ef4444" : "none"} stroke={wishCount > 0 ? "#ef4444" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.4 4.6a5.5 5.5 0 0 0-7.8 0L12 5.2l-.6-.6a5.5 5.5 0 0 0-7.8 7.8l.6.6L12 20.8 19.8 13l.6-.6a5.5 5.5 0 0 0 0-7.8z" /></svg>
                {wishCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#1d9a44] px-1 text-[10px] font-bold leading-none text-white">
                    {wishCount > 99 ? "99+" : wishCount}
                  </span>
                )}
              </span>
              <span className="hidden text-[10px] font-semibold leading-none text-neutral-500 group-hover:text-neutral-800 lg:block">Oblíbené</span>
            </Link>
            <Link href={`${base}/kosik`} className="group relative flex h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2.5 text-neutral-700 transition hover:bg-neutral-100 sm:px-3">
              <span className="relative">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.5" /><circle cx="19" cy="21" r="1.5" /><path d="M2 3h3l2.7 13.4a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L23 7H6" /></svg>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#1d9a44] px-1 text-[10px] font-bold leading-none text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span className="hidden text-[10px] font-semibold leading-none text-neutral-500 group-hover:text-neutral-800 lg:block">Košík</span>
            </Link>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="px-5 pb-3 md:hidden">
          <SearchAutocomplete tenantSlug={tenantSlug} />
        </div>
      </div>

      {/* ── Category nav + mega menu ──────────────────────────── */}
      <div className="relative hidden border-b border-neutral-200 bg-white lg:block" onMouseLeave={scheduleClose}>
        <nav className="mx-auto flex max-w-[1400px] items-stretch overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={`${base}?vse=1`}
            onClick={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpenMenu(null); }}
            className={`flex h-12 items-center whitespace-nowrap border-b-2 px-3 text-[13.5px] font-semibold transition-colors ${
              !activeCategory ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-600 hover:text-neutral-950"
            }`}
          >
            Vše
          </Link>
          {topLevel.map((cat) => {
            const kids = childrenOf(cat.id);
            const isActive = activeCategory === cat.slug || kids.some((k) => k.slug === activeCategory);
            const isSale = cat.slug === "akce" || cat.slug === "vyprodej";
            const isNew = cat.slug === "novinky";
            return (
              <div key={cat.id} onMouseEnter={() => (kids.length ? enter(cat.id) : setOpenMenu(null))}>
                <Link
                  href={`${base}?kategorie=${cat.slug}`}
                  onClick={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpenMenu(null); }}
                  className={`flex h-12 items-center gap-1 whitespace-nowrap border-b-2 px-3 text-[13.5px] font-semibold transition-colors ${
                    isActive
                      ? "border-neutral-950 text-neutral-950"
                      : isSale
                        ? "border-transparent text-red-600 hover:text-red-700"
                        : isNew
                          ? "border-transparent text-[#1d9a44] hover:text-[#137a35]"
                          : "border-transparent text-neutral-600 hover:text-neutral-950"
                  } ${openMenu === cat.id ? "!border-neutral-950 !text-neutral-950" : ""}`}
                >
                  {cat.name}
                  {kids.length > 0 && (
                    <svg className={`h-3 w-3 transition-transform duration-200 ${openMenu === cat.id ? "rotate-180" : "opacity-40"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                  )}
                </Link>
              </div>
            );
          })}
          {brands.length > 0 && (
            <div onMouseEnter={() => enter("brands")} className="ml-auto">
              <button
                className={`flex h-12 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-[13.5px] font-semibold transition-colors ${
                  openMenu === "brands" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Značky
                <svg className={`h-3 w-3 transition-transform duration-200 ${openMenu === "brands" ? "rotate-180" : "opacity-40"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
          )}
        </nav>

        {/* Mega panel: category */}
        {openCatParent && openCatChildren.length > 0 && (
          <div
            className="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white shadow-[0_32px_64px_-20px_rgba(0,0,0,0.22)]"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_300px] gap-8 px-5 py-7">
              <div>
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="text-[16px] font-extrabold tracking-tight text-neutral-950">{openCatParent.name}</h3>
                  <Link
                    href={`${base}?kategorie=${openCatParent.slug}`}
                    onClick={() => setOpenMenu(null)}
                    className="text-[12.5px] font-bold text-neutral-500 underline-offset-4 transition hover:text-neutral-950 hover:underline"
                  >
                    Zobrazit vše ({openCatParent.product_count}) →
                  </Link>
                </div>
                {/* Image tiles */}
                <div className="grid grid-cols-4 gap-3 xl:grid-cols-5">
                  {openCatChildren.slice(0, 10).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`${base}?kategorie=${sub.slug}`}
                      onClick={() => setOpenMenu(null)}
                      className="group/tile"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                        {sub.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sub.image_url}
                            alt={sub.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.08]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-300">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100" />
                      </div>
                      <p className="mt-2 text-[12.5px] font-bold leading-tight text-neutral-800 transition group-hover/tile:text-neutral-950">
                        {sub.name}
                      </p>
                      <p className="text-[11px] tabular-nums text-neutral-400">{sub.product_count} produktů</p>
                    </Link>
                  ))}
                </div>
                {/* Overflow as chips */}
                {openCatChildren.length > 10 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {openCatChildren.slice(10).map((sub) => (
                      <Link
                        key={sub.id}
                        href={`${base}?kategorie=${sub.slug}`}
                        onClick={() => setOpenMenu(null)}
                        className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-[12.5px] font-semibold text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Promo tile with category image */}
              <Link
                href={`${base}?kategorie=${openCatParent.slug}`}
                onClick={() => setOpenMenu(null)}
                className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl bg-neutral-950 p-6"
              >
                {openCatParent.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={openCatParent.image_url}
                    alt={openCatParent.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
                <div className="relative">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/70">Doporučujeme</p>
                  <p className="mt-1.5 text-[21px] font-extrabold leading-tight text-white">
                    {openCatParent.name}
                  </p>
                  <p className="mt-0.5 text-[13px] text-white/80">od nejlepších značek</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-neutral-950 transition-transform duration-300 group-hover:translate-x-1">
                    Nakupovat
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Mega panel: brands */}
        {openMenu === "brands" && (
          <div
            className="absolute inset-x-0 top-full z-50 border-b border-neutral-200 bg-white shadow-[0_28px_56px_-18px_rgba(0,0,0,0.2)]"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="mx-auto max-w-[1400px] px-5 py-8">
              <div className="mb-6 flex items-end justify-between gap-6 border-b border-neutral-100 pb-5">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-neutral-400">Výběr značek</p>
                  <h3 className="mt-1 text-[18px] font-extrabold tracking-tight text-neutral-950">Všechny značky</h3>
                </div>
                <p className="max-w-[360px] text-right text-[12.5px] leading-relaxed text-neutral-500">
                  Kurátorované kolekce od ověřených výrobců a studií.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2.5 xl:grid-cols-5">
                {brands.map((b) => (
                  <Link
                    key={b}
                    href={`${base}?znacka=${encodeURIComponent(b)}`}
                    onClick={() => setOpenMenu(null)}
                    className="group flex min-h-[62px] items-center gap-3 rounded-2xl border border-neutral-200/70 bg-white px-3 py-2.5 text-neutral-900 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-[#fbfaf8] hover:shadow-[0_18px_36px_-28px_rgba(17,24,39,0.85)]"
                  >
                    <BrandLogoMark brand={b} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold tracking-tight">{b}</span>
                      <span className="mt-0.5 block text-[11px] font-medium text-neutral-400">Zobrazit kolekci</span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900" strokeWidth={1.9} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-[360px] flex-col bg-white shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-neutral-100 px-5">
              <span className="text-[16px] font-extrabold text-neutral-950">{shopName || "Menu"}</span>
              <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100" aria-label="Zavřít">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <Link href={base} onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3 text-[14.5px] font-semibold text-neutral-900 transition hover:bg-neutral-50">
                Všechny produkty
              </Link>
              {topLevel.map((cat) => {
                const kids = childrenOf(cat.id);
                const expanded = mobileExpanded === cat.id;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center">
                      <Link
                        href={`${base}?kategorie=${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className={`flex-1 rounded-xl px-4 py-3 text-[14.5px] font-semibold transition hover:bg-neutral-50 ${cat.slug === "akce" ? "text-red-600" : "text-neutral-900"}`}
                      >
                        {cat.name}
                      </Link>
                      {kids.length > 0 && (
                        <button
                          onClick={() => setMobileExpanded(expanded ? null : cat.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400"
                          aria-label={expanded ? "Sbalit" : "Rozbalit"}
                        >
                          <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                        </button>
                      )}
                    </div>
                    {expanded && (
                      <div className="mb-1 ml-3 border-l border-neutral-100 pl-2">
                        {kids.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`${base}?kategorie=${sub.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950"
                          >
                            {sub.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={sub.image_url} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="h-9 w-9 shrink-0 rounded-lg bg-neutral-100" />
                            )}
                            <span className="flex-1">{sub.name}</span>
                            <span className="text-[11px] text-neutral-300">{sub.product_count}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {brands.length > 0 && (
                <div className="mt-4 border-t border-neutral-100 pt-4">
                  <p className="px-4 pb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-neutral-400">Značky</p>
                  <div className="grid grid-cols-1 gap-1">
                    {brands.slice(0, 10).map((b) => (
                      <Link
                        key={b}
                        href={`${base}?znacka=${encodeURIComponent(b)}`}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-neutral-900 transition hover:bg-neutral-50"
                      >
                        <BrandLogoMark brand={b} compact />
                        <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold">{b}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 transition group-hover:text-neutral-900" strokeWidth={1.8} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-neutral-100 p-4">
              <Link href={`${base}/ucet`} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-neutral-950 px-4 py-3 text-[14px] font-semibold text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
                Můj účet
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
