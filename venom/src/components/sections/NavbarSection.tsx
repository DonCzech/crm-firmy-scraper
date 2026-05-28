"use client";

import { useEffect, useState } from "react";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { OptimizedPicture } from "@/components/OptimizedPicture";

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function NavbarSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  // §11.2 Esc closes mobile menu
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);
  const siteName = String(content.siteName ?? "Web");
  const logoUrl = String(content.logoUrl ?? "");
  const logoSrc = logoUrl || demoLogoDataUrl(siteName);
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "#");

  if (variant === "barber-overlay") {
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{ background: "linear-gradient(to bottom,rgba(0,0,0,.55) 0%,transparent 100%)" }}
      >
        <div className="max-w-[1200px] mx-auto px-10 py-[18px] flex items-center justify-between">
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="flex items-center shrink-0"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 90, height: 80 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(10)" }} />
            </GenericEditableImage>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-[13px] uppercase transition-opacity hover:opacity-70"
                style={{ color: "#fff", letterSpacing: "0.12em", fontWeight: 400 }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          <button
            className="md:hidden flex flex-col justify-between w-7 h-5 bg-transparent border-0 cursor-pointer p-0"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="block h-[1.5px] w-full bg-white" />
            <span className="block h-[1.5px] w-full bg-white" />
            <span className="block h-[1.5px] w-full bg-white" />
          </button>
        </div>

        {open && (
          <div
            className="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
            style={{ background: "rgba(10,8,6,.97)" }}
          >
            <button
              className="absolute top-5 right-5 text-white text-2xl bg-transparent border-0 cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
            >✕</button>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-lg font-normal uppercase"
                style={{ color: "#fff", letterSpacing: "0.12em" }}
                onClick={() => setOpen(false)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
        )}
      </nav>
    );
  }

  if (variant === "barber-overlay-promo") {
    const topbar = (content.topbar ?? {}) as {
      phone?: { label?: string; href?: string };
      social?: Array<{ icon?: string; label?: string; href?: string }>;
    };
    const phone = topbar.phone;
    const social = topbar.social ?? [];
    const hamburgerBp = Number(content.hamburgerBreakpoint ?? 992);
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{ background: "linear-gradient(to bottom,rgba(0,0,0,.65) 0%,rgba(0,0,0,.15) 75%,transparent 100%)" }}
        data-template="barber-03"
        data-hamburger-bp={hamburgerBp}
      >
        <div
          className="max-w-[1280px] mx-auto px-6 lg:px-10 py-2 flex items-center justify-between text-[12px]"
          style={{ borderBottom: "1px solid rgba(255,255,255,.08)", letterSpacing: "0.10em" }}
        >
          {phone?.href ? (
            <a
              href={phone.href}
              className="text-white/90 hover:text-white uppercase transition-colors"
              style={{ fontWeight: 500 }}
            >
              <GenericEditableText sectionId={sectionId} field="topbar.phone.label" value={phone.label ?? ""} tag="span" />
            </a>
          ) : <span />}
          <div className="flex items-center gap-4">
            {social.map((s, i) => (
              <a
                key={`${s.href}-${i}`}
                href={s.href ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label ?? s.icon ?? "social"}
                className="text-white/90 hover:text-white"
              >
                {s.icon === "instagram" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                  </svg>
                ) : <span className="text-[12px] uppercase">{s.label}</span>}
              </a>
            ))}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="flex items-center shrink-0"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 200, height: 56 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-[12.5px] uppercase transition-opacity hover:opacity-70"
                style={{ color: "#fff", letterSpacing: "0.16em", fontWeight: 500 }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          <button
            className="lg:hidden flex flex-col justify-between w-7 h-5 bg-transparent border-0 cursor-pointer p-0"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="block h-[1.5px] w-full bg-white" />
            <span className="block h-[1.5px] w-full bg-white" />
            <span className="block h-[1.5px] w-full bg-white" />
          </button>
        </div>

        {open && (
          <div
            className="lg:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-7"
            style={{ background: "rgba(15,10,7,.97)" }}
          >
            <button
              className="absolute top-5 right-5 text-white text-2xl bg-transparent border-0 cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
            >✕</button>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-lg font-normal uppercase"
                style={{ color: "#fff", letterSpacing: "0.16em" }}
                onClick={() => setOpen(false)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            {phone?.href && (
              <a
                href={phone.href}
                className="text-[13px] uppercase mt-4"
                style={{ color: "#c8a96e", letterSpacing: "0.16em" }}
                onClick={() => setOpen(false)}
              >
                {phone.label}
              </a>
            )}
          </div>
        )}
      </nav>
    );
  }

  if (variant === "barber-dark") {
    return (
      <nav
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: "var(--color-surface, #1E1E1E)",
          borderBottom: "1px solid var(--color-border, #2A2A2A)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="flex items-center shrink-0"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 176, height: 44 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                style={{ color: "var(--color-text-muted, #A0A0A0)", letterSpacing: "0.1em" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            {ctaText && (
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--color-accent, #C9A84C)",
                  color: "#111",
                  borderRadius: "var(--radius, 4px)",
                  letterSpacing: "0.1em",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            )}
          </div>

          {/* §11.2 44×44px touch target */}
          <button
            className="md:hidden self-center flex flex-col items-center justify-center gap-[5px] w-11 h-11 rounded"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="block w-6 h-0.5" style={{ backgroundColor: "var(--color-text, #F5F5F5)" }} />
            <span className="block w-6 h-0.5" style={{ backgroundColor: "var(--color-text, #F5F5F5)" }} />
            <span className="block w-6 h-0.5" style={{ backgroundColor: "var(--color-text, #F5F5F5)" }} />
          </button>
        </div>

        {open && (
          <div className="md:hidden px-4 pb-4 border-t" style={{ backgroundColor: "var(--color-surface, #1E1E1E)", borderColor: "var(--color-border, #2A2A2A)" }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="flex items-center min-h-[44px] text-xs font-bold uppercase tracking-widest border-b"
                style={{ color: "var(--color-text-muted, #A0A0A0)", borderColor: "var(--color-border, #2A2A2A)" }}
                onClick={() => setOpen(false)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            {ctaText && (
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                className="flex items-center justify-center w-full min-h-[44px] mt-3 text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: "var(--color-accent, #C9A84C)", color: "#111", borderRadius: "var(--radius, 4px)" }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            )}
          </div>
        )}
      </nav>
    );
  }

  if (content.layout === "cafe-wave") {
    const pinIcon = String(content.pinIcon ?? "/clones/costa/src/themes/template/build/icon-pin.svg");
    const userIcon = String(content.userIcon ?? "/clones/costa/src/themes/template/build/icon-user.svg");
    const loginLabel = String(content.loginLabel ?? "Přihlásit");
    const locationsHref = String(content.locationsHref ?? "/kavarny");
    const loginHref = String(content.loginHref ?? "/prihlaseni");
    return (
      <nav
        data-layout="cafe-wave"
        className="sticky top-0 z-50 w-full"
        style={{ fontFamily: "var(--font-body, 'CostaText', sans-serif)" }}
      >
        {/* Mobile row — solid bg, flex: [hamburger | logo(centered) | spacer] */}
        <div
          data-nav-row="mobile"
          className="flex items-center h-16 px-2"
          style={{ backgroundColor: "var(--color-primary, #6d1f37)" }}
        >
          <button
            type="button"
            className="flex flex-col gap-[5px] items-center justify-center w-11 h-11 text-white"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="block w-6 h-0.5 bg-white" />
            <span className="block w-6 h-0.5 bg-white" />
            <span className="block w-6 h-0.5 bg-white" />
          </button>
          <div className="flex-1 flex justify-center">
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
              className="flex items-center"
              title={siteName}
            >
              <GenericEditableImage
                sectionId={sectionId}
                field="logoUrl"
                src={logoSrc}
                alt={siteName}
                className="relative shrink-0 overflow-hidden"
                style={{ width: 140, height: 44 }}
              >
                <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </GenericEditableImage>
            </a>
          </div>
          <div className="w-11 shrink-0" /> {/* balances hamburger → logo truly centered */}
        </div>

        {/* Desktop row — transparent overlay over hero */}
        <div
          data-nav-row="desktop"
          className="flex relative max-w-7xl mx-auto px-8 items-center"
          style={{ backgroundColor: "transparent", height: 80, marginTop: -80 }}
        >
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="absolute left-12 flex items-center"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative shrink-0 overflow-hidden"
              style={{ width: 140, height: 44 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>
          <div
            className="flex items-center gap-7 mx-auto text-white"
            style={{ fontFamily: "var(--font-body, 'CostaText', sans-serif)" }}
          >
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-[15px] font-semibold uppercase tracking-wide hover:opacity-80 transition-opacity"
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-5 ml-auto">
            <a
              href={resolveDemoHref(locationsHref, tenantSlug, isAdmin)}
              className="inline-flex items-center justify-center w-9 h-9 hover:opacity-80"
              aria-label="Provozovny"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pinIcon} alt="" width={22} height={22} style={{ filter: "brightness(0) invert(1)" }} />
            </a>
            <a
              href={resolveDemoHref(loginHref, tenantSlug, isAdmin)}
              className="inline-flex items-center justify-center w-9 h-9 hover:opacity-80"
              aria-label={loginLabel}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={userIcon} alt="" width={22} height={22} style={{ filter: "brightness(0) invert(1)" }} />
            </a>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-white/15" style={{ backgroundColor: "var(--color-primary, #6d1f37)" }}>
            <div className="px-4 pb-4">
              {links.map((l, i) => (
                <a
                  key={`${l.href}-${i}`}
                  href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                  className="flex items-center min-h-[44px] text-white text-base font-semibold uppercase tracking-wide border-b border-white/10"
                  onClick={() => setOpen(false)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
              <a
                href={resolveDemoHref(loginHref, tenantSlug, isAdmin)}
                className="mt-2 flex items-center gap-3 min-h-[44px] text-white text-base font-semibold border-t border-white/15"
                onClick={() => setOpen(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={userIcon} alt="" width={22} height={22} style={{ filter: "brightness(0) invert(1)" }} />
                <GenericEditableText sectionId={sectionId} field="loginLabel" value={loginLabel} tag="span" />
              </a>
            </div>
          </div>
        )}
      </nav>
    );
  }

  if (content.layout === "logo-center") {
    return (
      <nav
        className="sticky top-0 z-30 w-full"
        style={{
          backgroundColor: "var(--color-surface, #fff)",
          borderBottom: "1px solid var(--color-border, #e5e7eb)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <button
            className="lg:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className="block w-6 h-0.5 bg-current mb-1.5" />
            <span className="block w-6 h-0.5 bg-current mb-1.5" />
            <span className="block w-6 h-0.5 bg-current" />
          </button>
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="absolute left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 flex items-center"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative shrink-0 overflow-hidden"
              style={{ width: 140, height: 44 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>
          <div className="hidden lg:flex items-center gap-6 mx-auto">
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-sm font-semibold hover:opacity-70"
                style={{ color: "var(--color-text, #111)" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {ctaText && (
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                className="hidden md:inline-block px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary, #6d1f37)" }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            )}
          </div>
        </div>
        {open && (
          <div className="lg:hidden px-4 pb-4 space-y-2" style={{ backgroundColor: "var(--color-surface, #fff)" }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="block text-sm font-semibold py-2"
                style={{ color: "var(--color-text, #111)" }}
                onClick={() => setOpen(false)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav
      className="sticky top-0 z-30 w-full"
      style={{
        backgroundColor: "var(--color-surface, #fff)",
        borderBottom: "1px solid var(--color-border, #e5e7eb)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
          className="font-bold text-lg truncate flex items-center"
          style={{ color: "var(--color-primary, #6366f1)", fontFamily: "var(--font-heading)" }}
        >
          <GenericEditableImage
            sectionId={sectionId}
            field="logoUrl"
            src={logoSrc}
            alt={siteName}
            className="relative shrink-0 overflow-hidden"
            style={{ width: 176, height: 44, borderRadius: "var(--radius, 8px)" }}
          >
            <OptimizedPicture
              src={logoSrc}
              alt={siteName}
              imgStyle={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
          </GenericEditableImage>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "var(--color-text, #111827)" }}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${links.indexOf(l)}.label`} value={l.label} tag="span" />
            </a>
          ))}
          {ctaText && (
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary, #6366f1)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1" style={{ color: "var(--color-text)" }} />
          <span className="block w-5 h-0.5 bg-current mb-1" style={{ color: "var(--color-text)" }} />
          <span className="block w-5 h-0.5 bg-current" style={{ color: "var(--color-text)" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-4 pb-4 space-y-2"
          style={{ backgroundColor: "var(--color-surface, #fff)" }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              className="block text-sm font-medium py-2"
              style={{ color: "var(--color-text, #111827)" }}
              onClick={() => setOpen(false)}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${links.indexOf(l)}.label`} value={l.label} tag="span" />
            </a>
          ))}
          {ctaText && (
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              className="block text-center px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary, #6366f1)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          )}
        </div>
      )}
    </nav>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

function demoLogoDataUrl(siteName: string) {
  const shortName = siteName.replace(/\s+/g, " ").trim().slice(0, 26) || "Demo";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="352" height="88" viewBox="0 0 352 88">
      <rect width="352" height="88" rx="14" fill="white"/>
      <rect x="2" y="2" width="348" height="84" rx="12" fill="none" stroke="#d9dee8" stroke-width="4"/>
      <circle cx="43" cy="44" r="19" fill="#1B3A6B"/>
      <path d="M34 47h18M43 35v18" stroke="#C8A96E" stroke-width="5" stroke-linecap="round"/>
      <text x="78" y="52" fill="#1A1A1A" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">${escapeSvg(shortName)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
