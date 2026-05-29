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

function NavbarSectionInner({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // §11.2 Esc closes mobile menu
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // scroll state for overlay navbars
  useEffect(() => {
    if (variant !== "peak-cut-minimal") return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);
  const siteName = String(content.siteName ?? "Web");
  const logoUrl = String(content.logoUrl ?? "");
  const logoSrc = logoUrl || demoLogoDataUrl(siteName);
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "#");

  if (variant === "peak-cut-minimal") {
    // peak-cut (Peak Cut — Minimal White) — pevný hlavičkový pruh, kompaktní logo SVG ikonka vlevo,
    // 4 nav linky uprostřed/vpravo, social ikonky úplně vpravo. Žádné Rezervovat CTA.
    const socials = (content.socials as Array<{ icon?: string; label?: string; href?: string }>) ?? [];
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      switch (name) {
        case "instagram":
          return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
        case "facebook":
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        default:
          return (<span style={{ fontSize: 11 }}>{name}</span>);
      }
    };
    const navBg = scrolled ? "#ffffff" : "transparent";
    const navShadow = scrolled ? "0 2px 24px rgba(0,0,0,0.08)" : "none";
    const navTextColor = scrolled ? "#1a1a1a" : "#ffffff";
    const navBorderColor = scrolled ? "#d0ccc6" : "rgba(255,255,255,0.55)";
    const logoFilter = scrolled ? "none" : "brightness(10)";
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{
          backgroundColor: navBg,
          boxShadow: navShadow,
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        }}
        data-template="peak-cut"
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          {/* Logo — jen SVG ikonka */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            className="flex items-center shrink-0"
            title={siteName}
            aria-label={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0 w-9 h-9 md:w-12 md:h-12"
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain", filter: logoFilter }} />
            </GenericEditableImage>
          </a>

          {/* Nav linky po logu */}
          <div className="hidden md:flex items-center gap-7 ml-10 mr-auto">
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-[14px] transition-opacity hover:opacity-70"
                style={{ color: navTextColor, fontWeight: 400, letterSpacing: "0.02em" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          {/* Social ikonky vpravo */}
          {socials.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {socials.map((s, i) => (
                <a
                  key={`pc-soc-${i}`}
                  href={s.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label ?? s.icon ?? "social"}
                  className="flex items-center justify-center rounded-full transition-colors duration-300"
                  style={{ width: 32, height: 32, border: `1px solid ${navBorderColor}`, color: navTextColor }}
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-between w-7 h-5 bg-transparent border-0 cursor-pointer p-0"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="block h-[1.5px] w-full" style={{ backgroundColor: navTextColor }} />
            <span className="block h-[1.5px] w-full" style={{ backgroundColor: navTextColor }} />
            <span className="block h-[1.5px] w-full" style={{ backgroundColor: navTextColor }} />
          </button>
        </div>

        {open && (
          <div
            className="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-6"
            style={{ backgroundColor: "#ffffff" }}
          >
            <button
              className="absolute top-5 right-5 text-2xl bg-transparent border-0 cursor-pointer"
              style={{ color: "#1a1a1a" }}
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
            >✕</button>
            {links.map((l, i) => (
              <a
                key={`pc-mob-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                className="text-lg"
                style={{ color: "#1a1a1a", fontWeight: 500 }}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            {socials.length > 0 && (
              <div className="flex items-center gap-4 mt-4">
                {socials.map((s, i) => (
                  <a
                    key={`pc-mob-soc-${i}`}
                    href={s.href ?? "#"}
                    aria-label={s.label ?? s.icon ?? "social"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 36, height: 36, border: "1px solid #cbc7be", color: "#3a3a3a" }}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
    );
  }

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

  if (variant === "barber-04-overlay") {
    // barber-04 (Černý Fade) — top-bar hidden < 768px, SVG icons pro FB/IG/YT/TikTok,
    // gold accent #d5b981, hamburger < 1024px (Bebas Neue navbar styl).
    const topbar = (content.topbar ?? {}) as {
      phone?: { label?: string; href?: string };
      social?: Array<{ icon?: string; label?: string; href?: string }>;
    };
    const phone = topbar.phone;
    const social = topbar.social ?? [];
    const hamburgerBp = Number(content.hamburgerBreakpoint ?? 1024);
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      switch (name) {
        case "instagram":
          return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
        case "facebook":
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case "youtube":
          return (<svg {...p}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/></svg>);
        case "tiktok":
          return (<svg {...p}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>);
        default:
          return (<span className="text-[12px] uppercase">{name}</span>);
      }
    };
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{ background: "linear-gradient(to bottom,rgba(0,0,0,.65) 0%,rgba(0,0,0,.15) 75%,transparent 100%)" }}
        data-template="barber-04"
        data-hamburger-bp={hamburgerBp}
      >
        {/* top-bar viditelný pouze ≥ 768px (md:flex) */}
        <div
          className="hidden md:flex max-w-[1280px] mx-auto px-6 lg:px-10 py-2 items-center justify-between text-[12px]"
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
                style={{ color: "#d5b981" }}
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-3 md:py-4 flex items-center justify-between">
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
              className="relative overflow-hidden shrink-0 w-[140px] h-[36px] md:w-[200px] md:h-[56px]"
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>

          <div className="hidden xl:flex items-center gap-6">
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
            className="xl:hidden flex flex-col justify-between w-7 h-5 bg-transparent border-0 cursor-pointer p-0"
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
            className="xl:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 overflow-y-auto py-12"
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
                className="text-base font-normal uppercase"
                style={{ color: "#fff", letterSpacing: "0.16em" }}
                onClick={() => setOpen(false)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            {phone?.href && (
              <a
                href={phone.href}
                className="text-[13px] uppercase mt-2"
                style={{ color: "#d5b981", letterSpacing: "0.16em" }}
                onClick={() => setOpen(false)}
              >
                {phone.label}
              </a>
            )}
            <div className="flex items-center gap-5 mt-2">
              {social.map((s, i) => (
                <a
                  key={`${s.href}-mob-${i}`}
                  href={s.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label ?? s.icon ?? "social"}
                  style={{ color: "#d5b981" }}
                  onClick={() => setOpen(false)}
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
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

// ---------------------------------------------------------------------------
// hair-01-topbar — Salon Aria
// Dark single-bar: logo vlevo, nav linky uprostřed, phone+email+social vpravo
// ---------------------------------------------------------------------------
function NavbarHair01Topbar({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Salon");
  const logoUrl = String(content.logoUrl ?? "");
  const logoSrc = logoUrl || demoLogoDataUrl(siteName);
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const socials = (content.socials as Array<{ label: string; href: string }>) ?? [];

  const BG = "#1e1e1e";
  const GOLD = "#8a6f28";
  const TEXT = "rgba(255,255,255,0.82)";
  const TEXT_HOVER = "#ffffff";
  const MONO = "'Montserrat',sans-serif";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: BG, fontFamily: MONO }}
      data-template="hair-01"
    >
      <div
        className="max-w-[1440px] mx-auto flex items-center"
        style={{ padding: "0 32px", height: 56 }}
      >
        {/* Logo */}
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
          className="shrink-0 flex items-center mr-10"
          aria-label={siteName}
        >
          <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative w-16 h-8 overflow-hidden">
            <img src={logoSrc} alt={siteName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </GenericEditableImage>
        </a>

        {/* Nav linky — desktop center */}
        <div className="hidden md:flex items-center gap-7 flex-1">
          {links.map((l, i) => (
            <a
              key={`h1-nav-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ color: TEXT, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </div>

        {/* Phone + Email + Social — desktop vpravo */}
        <div className="hidden md:flex items-center gap-5 ml-auto">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: TEXT, fontSize: 11, fontWeight: 400, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} style={{ color: TEXT, fontSize: 11, fontWeight: 400, letterSpacing: "0.06em" }}>
              <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          )}
          {socials.map((s, i) => (
            <a
              key={`h1-soc-${i}`}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              style={{ color: TEXT, fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
            >
              {s.label === "Facebook" ? "FB" : s.label === "Instagram" ? "IG" : s.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto flex flex-col justify-between w-6 h-4 bg-transparent border-0 cursor-pointer p-0"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: "#fff" }} />
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: "#fff" }} />
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: "#fff" }} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-7"
          style={{ backgroundColor: BG }}
        >
          <button
            className="absolute top-5 right-6 text-xl bg-transparent border-0 cursor-pointer"
            style={{ color: TEXT }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >✕</button>
          {links.map((l, i) => (
            <a
              key={`h1-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ color: TEXT, fontSize: 13, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          {phone && <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: GOLD, fontSize: 13 }}>{phone}</a>}
        </div>
      )}
    </nav>
  );
}

// Main exported dispatch — must be after all variant functions
export function NavbarSection(props: Props) {
  if (props.variant === "hair-01-topbar") return <NavbarHair01Topbar {...props} />;
  return <NavbarSectionInner {...props} />;
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
