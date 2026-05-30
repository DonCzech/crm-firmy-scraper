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

function NavbarHair02({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Hair Studio No.1");
  const logoUrl  = String(content.logoUrl ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  // Reference: hairsalon-no1-demo — bílá hlavička
  // Výška zmenšena o 30%: 90px → 63px, mobile 70px → 49px
  const BG    = "#ffffff";
  const TEXT  = "#4a4a4a";
  const TEAL  = "#459696";
  const SERIF = "Georgia, Times, 'Times New Roman', serif";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: "#ffffff" }}
      data-template="hair-02"
    >
      {/* Desktop — výška 63px (90px * 0.7) */}
      <div
        className="hidden md:flex items-center max-w-[1280px] mx-auto"
        style={{ height: 63, padding: "0 24px" }}
      >
        {/* Logo vlevo */}
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
          className="shrink-0 flex items-center"
          aria-label={siteName}
          style={{ marginRight: 32 }}
        >
          <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative overflow-hidden" style={{ width: 112, height: 28 }}>
            <img src={logoSrc} alt={siteName} style={{ width: 112, height: 28, objectFit: "contain" }} />
          </GenericEditableImage>
        </a>

        {/* Nav linky (flex-1) */}
        <nav className="flex items-center gap-6 flex-1">
          {links.map((l, i) => (
            <a
              key={`h2-nav-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{
                fontFamily: SERIF,
                fontSize: "0.82em",
                fontWeight: 400,
                color: TEXT,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
              onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </nav>

        {/* CTA vpravo — tmavý outline pill */}
        <a
          href={resolveDemoHref("/kontakt", tenantSlug, isAdmin)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            border: `1.5px solid ${TEXT}`,
            color: TEXT,
            fontFamily: SERIF,
            fontSize: "0.78em",
            fontWeight: 400,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "7px 18px",
            borderRadius: 99,
            whiteSpace: "nowrap",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = TEXT; e.currentTarget.style.color = BG; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = TEXT; }}
        >
          ON-LINE REZERVACE
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden><rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
        </a>
      </div>

      {/* Mobile — výška 49px (70px * 0.7) */}
      <div
        className="flex md:hidden items-center justify-between"
        style={{ height: 49, padding: "0 16px" }}
      >
        <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName}>
          <img src={logoSrc} alt={siteName} style={{ height: 28, objectFit: "contain" }} />
        </a>
        <button
          className="flex flex-col justify-between w-5 h-[14px] bg-transparent border-0 cursor-pointer p-0"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: TEXT }} />
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: TEXT }} />
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: TEXT }} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: "#ffffff" }}
        >
          <button
            className="absolute top-5 right-6 bg-transparent border-0 cursor-pointer"
            style={{ color: TEXT, fontSize: 22 }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >✕</button>
          {links.map((l, i) => (
            <a
              key={`h2-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ fontFamily: SERIF, color: TEXT, fontSize: 16, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolveDemoHref("/kontakt", tenantSlug, isAdmin)}
            style={{
              border: `1px solid ${TEAL}`, color: TEAL, fontFamily: SERIF,
              fontSize: 14, padding: "10px 24px", borderRadius: 99, textDecoration: "none", textTransform: "uppercase",
            }}
            onClick={() => setOpen(false)}
          >
            ON-LINE REZERVACE
          </a>
        </div>
      )}
    </header>
  );
}

// hair-03-navbar — Petra Studio
// Reference: petramechurova-demo — světlé #ebebeb pozadí (sjednocené s hero),
// position relative (ne fixed), SVG logo BEZ tmavého obdélníku (text přímo na světlém bg),
// nav linky centrálně, E-SHOP outline + ONLINE REZERVACE solid dark
// hair-03-navbar — Petra Studio
function NavbarHair03({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Petra Studio");
  const logoUrl  = String(content.logoUrl ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const DARK   = "#2f201a";
  const GOLD   = "#c8a97e";
  const SERIF  = "Georgia, 'Times New Roman', serif";
  const SANS   = "system-ui, -apple-system, sans-serif";
  const BG     = "#ebebeb";

  // Logo bez tmavého rect — text přímo na světlém pozadí navbaru
  const LogoSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 62" width="200" height="44" aria-label={siteName}>
      <text x="4" y="16" fontFamily={SERIF} fontSize="10" fill={GOLD} letterSpacing="4">HAIR MAKING</text>
      <text x="4" y="44" fontFamily={SERIF} fontSize="26" fontWeight="400" fill={DARK} letterSpacing="2">petra</text>
      <text x="98" y="44" fontFamily={SERIF} fontSize="26" fill={GOLD} letterSpacing="2"> studio</text>
      <line x1="4" y1="50" x2="276" y2="50" stroke={GOLD} strokeWidth="0.8" />
    </svg>
  );

  return (
    <header
      className="w-full"
      style={{ backgroundColor: BG, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      data-template="hair-03"
    >
      {/* ── Desktop ── */}
      <div
        className="hidden lg:flex items-center"
        style={{ maxWidth: 1400, margin: "0 auto", height: 76, padding: "0 24px", gap: 0 }}
      >
        {/* Logo vlevo */}
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
          className="shrink-0 flex items-center"
          style={{ marginRight: 32, textDecoration: "none" }}
          aria-label={siteName}
        >
          <GenericEditableImage
            sectionId={sectionId}
            field="logoUrl"
            src={logoUrl}
            alt={siteName}
            className="relative"
            style={{ width: 200, height: 44 }}
          >
            {logoUrl
              ? <img src={logoUrl} alt={siteName} style={{ width: 200, height: 44, objectFit: "contain" }} />
              : <LogoSvg />
            }
          </GenericEditableImage>
        </a>

        {/* Nav linky — ms-auto (Bootstrap-like), centrovaně */}
        <nav className="flex items-center flex-1 justify-center" style={{ gap: 32 }}>
          {links.map((l, i) => (
            <a
              key={`h3-nav-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 400,
                color: "#212529",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = DARK)}
              onMouseLeave={e => (e.currentTarget.style.color = "#212529")}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </nav>

        {/* Buttons vpravo */}
        <div className="flex items-center shrink-0" style={{ gap: 8 }}>
          {/* E-SHOP — outline, square corners */}
          <a
            href={resolveDemoHref("/kontakt", tenantSlug, isAdmin)}
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 400,
              color: DARK,
              border: `1px solid ${DARK}`,
              backgroundColor: "transparent",
              padding: "7px 20px",
              borderRadius: 0,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DARK; }}
          >
            E-SHOP
          </a>
          {/* ONLINE REZERVACE — solid dark, square corners */}
          <a
            href={resolveDemoHref("/kontakt", tenantSlug, isAdmin)}
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 400,
              color: "#ffffff",
              backgroundColor: DARK,
              border: `1px solid ${DARK}`,
              padding: "7px 20px",
              borderRadius: 0,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#4a3428"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; }}
          >
            ONLINE REZERVACE
          </a>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div
        className="flex lg:hidden items-center justify-between"
        style={{ height: 64, padding: "0 16px" }}
      >
        <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName}>
          <LogoSvg />
        </a>
        <button
          className="bg-transparent border-0 cursor-pointer p-2 flex flex-col justify-between"
          style={{ width: 28, height: 20 }}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block w-full" style={{ height: 1.5, backgroundColor: DARK }} />
          <span className="block w-full" style={{ height: 1.5, backgroundColor: DARK }} />
          <span className="block w-full" style={{ height: 1.5, backgroundColor: DARK }} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center"
          style={{ backgroundColor: "#f5f5f3", gap: 28 }}
        >
          <button
            className="absolute bg-transparent border-0 cursor-pointer"
            style={{ top: 20, right: 20, fontSize: 24, color: DARK }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít"
          >✕</button>
          {links.map((l, i) => (
            <a
              key={`h3-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ fontFamily: SANS, color: DARK, fontSize: 16, fontWeight: 400, textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolveDemoHref("/kontakt", tenantSlug, isAdmin)}
            style={{ fontFamily: SANS, backgroundColor: DARK, color: "#fff", fontSize: 14, fontWeight: 400, padding: "10px 28px", textDecoration: "none", letterSpacing: "0.02em", borderRadius: 0 }}
            onClick={() => setOpen(false)}
          >
            ONLINE REZERVACE
          </a>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// hair-04-navbar — Impresiv Studio (kim-impressive.cz inspirace)
// Originál: position:fixed; bg:#92a8d1; logo 120×81px vlevo; nav flex-end
// Container: width:100% padding:0 20px; links: padding:0.9em 1em; align-items:stretch
// ---------------------------------------------------------------------------
function NavbarHair04({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Impresiv Studio");
  const logoUrl  = String(content.logoUrl ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BG   = "#92a8d1";
  const TEXT = "#ffffff";
  const LATO = "'Lato', sans-serif";

  /* Demo logo — bílý wordmark na průhledném bg, proporce 120×81 jako originál */
  const LogoSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 81" width="120" height="81" aria-label={siteName}>
      {/* Dekorativní linka nahoře */}
      <line x1="0" y1="10" x2="120" y2="10" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      {/* Hlavní název */}
      <text
        x="60" y="46"
        textAnchor="middle"
        fontFamily={LATO}
        fontSize="22"
        fontWeight="700"
        fill={TEXT}
        letterSpacing="2"
      >IMPRESIV</text>
      {/* Podtitulek */}
      <text
        x="60" y="64"
        textAnchor="middle"
        fontFamily={LATO}
        fontSize="10"
        fontWeight="300"
        fill="rgba(255,255,255,0.85)"
        letterSpacing="4"
      >STUDIO</text>
      {/* Dekorativní linka dole */}
      <line x1="0" y1="72" x2="120" y2="72" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    </svg>
  );

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          backgroundColor: BG,
        }}
        data-template="hair-04"
      >
        {/* ── Desktop — align-items:stretch, žádná fixed výška (řídí se logem 81px) ── */}
        <div
          className="hidden lg:flex"
          style={{
            width: "100%",
            padding: "0 20px",
            alignItems: "stretch",
          }}
        >
          {/* Logo vlevo — padding-right:1em jako originál */}
          <div style={{ paddingRight: "1em", display: "flex", alignItems: "center" }}>
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
              style={{ textDecoration: "none", display: "block" }}
              aria-label={siteName}
            >
              <GenericEditableImage
                sectionId={sectionId}
                field="logoUrl"
                src={logoUrl}
                alt={siteName}
                className="relative"
                style={{ width: 120, height: 81 }}
              >
                {logoUrl
                  ? <img src={logoUrl} alt={siteName} style={{ maxWidth: 120, display: "block" }} />
                  : <LogoSvg />
                }
              </GenericEditableImage>
            </a>
          </div>

          {/* Nav — margin-left:auto, justify-content:flex-end, align-items:center */}
          <nav
            style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
            aria-label="Hlavní menu"
          >
            {links.map((l, i) => (
              <a
                key={`h4-nav-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: LATO,
                  fontSize: 14,
                  fontWeight: 400,
                  color: TEXT,
                  textDecoration: "none",
                  padding: "0.9em 1em",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
        </div>

        {/* ── Mobile ── */}
        <div
          className="flex lg:hidden items-center justify-between"
          style={{ padding: "0 16px", height: 64 }}
        >
          <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName} style={{ display: "flex", alignItems: "center" }}>
            {logoUrl
              ? <img src={logoUrl} alt={siteName} style={{ maxWidth: 90, maxHeight: 48, objectFit: "contain" }} />
              : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 44" width="110" height="40" aria-label={siteName}>
                  <text x="4" y="28" fontFamily={LATO} fontSize="20" fontWeight="700" fill={TEXT} letterSpacing="1.5">IMPRESIV</text>
                  <text x="4" y="40" fontFamily={LATO} fontSize="9" fontWeight="300" fill="rgba(255,255,255,0.8)" letterSpacing="3">STUDIO</text>
                </svg>
              )
            }
          </a>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: TEXT }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: TEXT }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: TEXT }} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            backgroundColor: BG,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32,
          }}
        >
          <button
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", fontSize: 28, color: TEXT, lineHeight: 1 }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít"
          >✕</button>
          {links.map((l, i) => (
            <a
              key={`h4-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ fontFamily: LATO, color: TEXT, fontSize: 20, fontWeight: 400, textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// beauty-01-topbar — Demo Beauty Studio
// Sticky white navbar: logo vlevo, nav linky uprostřed, phone + sand CTA vpravo
// Originál: selfbeauty.cz — Fahkwang font, white bg, sand #E0BE9A accent
// ---------------------------------------------------------------------------
function NavbarBeauty01({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Beauty Studio");
  const logoUrl  = String(content.logoUrl ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone    = String(content.phone ?? "");
  const ctaText  = String(content.ctaText ?? "REZERVACE");
  const ctaHref  = String(content.ctaHref ?? "#rezervace");

  const BG    = "#ffffff";
  const SAND  = "#E0BE9A";
  const TEXT  = "#1F1F1F";
  const MUTED = "#5B4D43";
  const FONT  = "'Fahkwang', serif";

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: BG, borderBottom: "1px solid rgba(224,190,154,0.25)", fontFamily: FONT }}
      data-template="beauty-01"
    >
      {/* Desktop — výška 88px */}
      <div
        className="hidden md:flex items-center max-w-[1280px] mx-auto"
        style={{ height: 88, padding: "0 32px" }}
      >
        {/* Logo vlevo */}
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
          className="shrink-0 flex items-center"
          aria-label={siteName}
          style={{ marginRight: 40 }}
        >
          <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative overflow-hidden" style={{ width: 160, height: 40 }}>
            <img src={logoSrc} alt={siteName} style={{ width: 160, height: 40, objectFit: "contain" }} />
          </GenericEditableImage>
        </a>

        {/* Nav linky */}
        <nav className="flex items-center gap-8 flex-1">
          {links.map((l, i) => (
            <a
              key={`b1-nav-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{
                fontFamily: FONT,
                fontSize: "0.78em",
                fontWeight: 400,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </nav>

        {/* Phone + CTA vpravo */}
        <div className="flex items-center gap-5 ml-auto shrink-0">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              style={{ fontFamily: FONT, fontSize: "0.78em", fontWeight: 400, color: MUTED, letterSpacing: "0.06em", whiteSpace: "nowrap", textDecoration: "none" }}
            >
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          )}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: SAND,
              color: TEXT,
              fontFamily: FONT,
              fontSize: "0.72em",
              fontWeight: 500,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "10px 22px",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#C4A07E"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = SAND; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      {/* Mobile — výška 64px */}
      <div
        className="flex md:hidden items-center justify-between"
        style={{ height: 64, padding: "0 20px" }}
      >
        <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName}>
          <img src={logoSrc} alt={siteName} style={{ height: 32, objectFit: "contain" }} />
        </a>
        <button
          className="flex flex-col justify-between w-5 h-[14px] bg-transparent border-0 cursor-pointer p-0"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: TEXT }} />
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: TEXT }} />
          <span className="block h-[1.5px] w-full" style={{ backgroundColor: TEXT }} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: BG, fontFamily: FONT }}
        >
          <button
            className="absolute top-5 right-6 bg-transparent border-0 cursor-pointer"
            style={{ color: TEXT, fontSize: 22 }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >✕</button>
          {links.map((l, i) => (
            <a
              key={`b1-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ fontFamily: FONT, color: TEXT, fontSize: 15, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.12em", textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            style={{
              backgroundColor: SAND, color: TEXT, fontFamily: FONT,
              fontSize: 13, fontWeight: 500, padding: "12px 32px",
              textTransform: "uppercase", letterSpacing: "0.14em", textDecoration: "none",
            }}
            onClick={() => setOpen(false)}
          >
            {ctaText}
          </a>
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: MUTED, fontFamily: FONT, fontSize: 13, textDecoration: "none" }}>
              {phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

// Main exported dispatch — must be after all variant functions
export function NavbarSection(props: Props) {
  if (props.variant === "hair-01-topbar") return <NavbarHair01Topbar {...props} />;
  if (props.variant === "hair-02-navbar") return <NavbarHair02 {...props} />;
  if (props.variant === "hair-03-navbar") return <NavbarHair03 {...props} />;
  if (props.variant === "hair-04-navbar") return <NavbarHair04 {...props} />;
  if (props.variant === "beauty-01-topbar") return <NavbarBeauty01 {...props} />;
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
