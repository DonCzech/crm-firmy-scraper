"use client";

import { useEffect, useState, Fragment } from "react";
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

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
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
    const isCafeWave = variant === "default" && content.layout === "cafe-wave";
    if (variant !== "peak-cut-minimal" && variant !== "barber-dark" && variant !== "barber-04-overlay" && variant !== "barber-overlay" && variant !== "barber-overlay-promo" && !isCafeWave) return;
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
  const siteMode = String(content.siteMode ?? "multipage");
  const navResolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  if (variant === "peak-cut-minimal") {
    // peak-cut (aka barber-05) — Brutalist Atelier White
    // Pure white nav over hero (transparent), → solid white + hairline black border on scroll.
    // Wordmark (Oswald uppercase wide-tracking) left; nav links with numbered /0X mono markers center;
    // optional phone link + ghost-outline RESERVATION CTA on right (surgical red on hover).
    const socials = (content.socials as Array<{ icon?: string; label?: string; href?: string }>) ?? [];
    const topPhone = String((content as Record<string, unknown>).topPhone ?? "");
    const topPhoneHref = String((content as Record<string, unknown>).topPhoneHref ?? "");
    const useWordmark = String((content as Record<string, unknown>).useWordmark ?? "yes") !== "no";
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
    const OSWALD = "var(--font-oswald), 'Oswald', 'Bebas Neue', Impact, sans-serif";
    const MONO   = "var(--font-overpass-mono), 'Overpass Mono', 'JetBrains Mono', Menlo, monospace";
    const RED    = "#c41e3a";
    const INK    = "#0a0a0a";
    const navBg = scrolled ? "#ffffff" : "transparent";
    const navShadow = "none";
    const navBorderBottom = scrolled ? `1px solid ${INK}` : "1px solid transparent";
    const navTextColor = scrolled ? INK : "#ffffff";
    const logoFilter = scrolled ? "none" : "brightness(10) contrast(1.15)";
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full pc-nav"
        style={{
          backgroundColor: navBg,
          boxShadow: navShadow,
          borderBottom: navBorderBottom,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
        data-template="peak-cut"
      >
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-6">
          {/* Brand — wordmark default, optional logo image */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            className="flex items-center shrink-0 pc-brand"
            title={siteName}
            aria-label={siteName}
            style={{ textDecoration: "none", color: navTextColor }}
          >
            {useWordmark ? (
              <span
                className="pc-wordmark"
                style={{
                  fontFamily: OSWALD,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: navTextColor,
                  whiteSpace: "nowrap",
                  textShadow: scrolled ? "none" : "0 1px 6px rgba(0,0,0,0.25)",
                  transition: "color 0.3s ease, text-shadow 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            ) : (
              <GenericEditableImage
                sectionId={sectionId}
                field="logoUrl"
                src={logoSrc}
                alt={siteName}
                className="relative overflow-hidden shrink-0 w-40 h-10 md:w-48 md:h-11"
              >
                <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain", filter: logoFilter, transition: "filter 0.3s ease" }} />
              </GenericEditableImage>
            )}
          </a>

          {/* Nav linky — center, čisté Oswald uppercase */}
          <div className="hidden md:flex items-center gap-9 mx-auto pc-nav-links">
            {links.map((l, i) => {
              return (
                <a
                  key={`${l.href}-${i}`}
                  href={navResolve(l.href)}
                  className="pc-nav-link relative inline-flex items-baseline"
                  style={{
                    color: navTextColor,
                    textDecoration: "none",
                    paddingBottom: 4,
                    whiteSpace: "nowrap",
                    textShadow: scrolled ? "none" : "0 1px 6px rgba(0,0,0,0.35)",
                    transition: "color 0.3s ease, text-shadow 0.3s ease",
                  }}
                >
                  <GenericEditableText
                    sectionId={sectionId}
                    field={`links.${i}.label`}
                    value={l.label}
                    tag="span"
                    style={{
                      fontFamily: OSWALD,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="pc-nav-underline"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: 1.5,
                      backgroundColor: RED,
                      transformOrigin: "left",
                      transform: "scaleX(0)",
                      transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </a>
              );
            })}
          </div>

          {/* Right cluster: phone + CTA + socials */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            {topPhone && (
              <a
                href={topPhoneHref || `tel:${topPhone.replace(/\s/g, "")}`}
                className="pc-nav-phone inline-flex items-center gap-2"
                style={{
                  color: navTextColor,
                  textDecoration: "none",
                  textShadow: scrolled ? "none" : "0 1px 6px rgba(0,0,0,0.35)",
                  transition: "color 0.3s ease, text-shadow 0.3s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <GenericEditableText
                  sectionId={sectionId}
                  field="topPhone"
                  value={topPhone}
                  tag="span"
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                  }}
                />
              </a>
            )}

            {ctaText && (
              <a
                href={navResolve(ctaHref)}
                className="pc-nav-cta inline-flex items-center justify-center"
                style={{
                  fontFamily: OSWALD,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.20em",
                  textTransform: "uppercase",
                  padding: "12px 22px",
                  border: `1px solid ${navTextColor}`,
                  color: navTextColor,
                  background: "transparent",
                  textDecoration: "none",
                  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            )}

            {socials.length > 0 && (
              <div className="flex items-center gap-2 pl-4" style={{ borderLeft: `1px solid ${scrolled ? "rgba(10,10,10,0.15)" : "rgba(255,255,255,0.3)"}` }}>
                {socials.map((s, i) => (
                  <a
                    key={`pc-soc-${i}`}
                    href={s.href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label ?? s.icon ?? "social"}
                    className="pc-nav-soc flex items-center justify-center"
                    style={{ width: 32, height: 32, color: navTextColor, transition: "color 0.3s ease, transform 0.3s ease" }}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger — 3 hairlines */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-11 h-11 bg-transparent border-0 cursor-pointer p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="block h-[1.5px] w-6" style={{ backgroundColor: navTextColor, transition: "background-color 0.3s ease" }} />
            <span className="block h-[1.5px] w-6" style={{ backgroundColor: navTextColor, transition: "background-color 0.3s ease" }} />
            <span className="block h-[1.5px] w-6" style={{ backgroundColor: navTextColor, transition: "background-color 0.3s ease" }} />
          </button>
        </div>

        {open && (
          <div
            className="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 pc-mob-menu"
            style={{ backgroundColor: "#ffffff" }}
          >
            <button
              className="absolute top-5 right-5 bg-transparent border-0 cursor-pointer p-2"
              style={{ color: INK }}
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
            {links.map((l, i) => (
              <a
                key={`pc-mob-${i}`}
                href={navResolve(l.href)}
                className="pc-mob-link"
                style={{ color: INK, textDecoration: "none", transition: "color 0.25s ease" }}
                onClick={() => setOpen(false)}
              >
                <span style={{ fontFamily: OSWALD, fontSize: 28, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>{l.label}</span>
              </a>
            ))}

            {(topPhone || ctaText) && (
              <div className="flex flex-col items-center gap-4 mt-6">
                {topPhone && (
                  <a
                    href={topPhoneHref || `tel:${topPhone.replace(/\s/g, "")}`}
                    style={{ fontFamily: MONO, fontSize: 14, color: INK, textDecoration: "none" }}
                    onClick={() => setOpen(false)}
                  >{topPhone}</a>
                )}
                {ctaText && (
                  <a
                    href={navResolve(ctaHref)}
                    style={{
                      fontFamily: OSWALD,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.20em",
                      textTransform: "uppercase",
                      padding: "14px 28px",
                      border: `1px solid ${INK}`,
                      color: INK,
                      textDecoration: "none",
                    }}
                    onClick={() => setOpen(false)}
                  >{ctaText}</a>
                )}
              </div>
            )}

            {socials.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                {socials.map((s, i) => (
                  <a
                    key={`pc-mob-soc-${i}`}
                    href={s.href ?? "#"}
                    aria-label={s.label ?? s.icon ?? "social"}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center"
                    style={{ width: 38, height: 38, border: `1px solid ${INK}`, color: INK }}
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
    const onScrollText = scrolled ? "#1a1a1a" : "#ffffff";
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{
          background: scrolled
            ? "rgba(249,247,245,0.94)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 70%, transparent 100%)",
          backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,169,110,0.25)" : "none",
          boxShadow: scrolled ? "0 1px 24px rgba(26,26,26,0.06)" : "none",
          transition: "background 0.45s cubic-bezier(.4,0,.2,1), backdrop-filter 0.45s cubic-bezier(.4,0,.2,1), box-shadow 0.45s ease, border-color 0.45s ease",
        }}
        data-template="barber-02"
      >
        <div
          className="max-w-[1240px] mx-auto px-6 lg:px-10 flex items-center justify-between"
          style={{
            paddingBlock: scrolled ? 14 : 22,
            transition: "padding 0.4s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {/* Brand — wordmark only (logo image zatím vypnuté, používá se editovatelný název) */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="flex items-center shrink-0 b02-brand"
            title={siteName}
            style={{ textDecoration: "none" }}
          >
            <span
              className="b02-sitename"
              style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: scrolled ? "20px" : "22px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: onScrollText,
                textShadow: scrolled ? "none" : "0 1px 14px rgba(0,0,0,0.4)",
                transition: "color 0.4s ease, font-size 0.4s ease, text-shadow 0.45s ease",
                whiteSpace: "nowrap",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center" style={{ gap: 36 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={navResolve(l.href)}
                className="b02-nav-link relative"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontSize: "13px",
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  color: onScrollText,
                  textShadow: scrolled ? "none" : "0 1px 6px rgba(0,0,0,0.45)",
                  textDecoration: "none",
                  paddingBottom: 3,
                  transition: "color 0.35s ease, text-shadow 0.4s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                <span
                  aria-hidden="true"
                  className="b02-nav-underline"
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 0,
                    width: "100%",
                    height: 1,
                    backgroundColor: "#d4a96e",
                    transformOrigin: "left",
                    transform: "scaleX(0)",
                    transition: "transform 0.45s cubic-bezier(.22,.68,0,1.1)",
                  }}
                />
              </a>
            ))}

            {ctaText && (
              <a
                href={navResolve(ctaHref)}
                className="b02-cta"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  paddingInline: 24,
                  paddingBlock: 11,
                  fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: scrolled ? "#ffffff" : "#ffffff",
                  backgroundColor: scrolled ? "#d4a96e" : "transparent",
                  border: scrolled ? "1px solid #d4a96e" : "1px solid rgba(255,255,255,0.85)",
                  borderRadius: 50,
                  textDecoration: "none",
                  transition: "background 0.4s ease, color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease",
                  boxShadow: scrolled ? "0 2px 0 rgba(154,122,80,0.2)" : "none",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span aria-hidden style={{
                  display: "inline-flex",
                  transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)",
                }} className="b02-cta-arrow">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col items-center justify-center gap-[6px] w-11 h-11 bg-transparent border-0 cursor-pointer p-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
          >
            <span
              className="block h-[1.5px] w-6 transition-all duration-300"
              style={{
                backgroundColor: scrolled ? "#1a1a1a" : "#ffffff",
                transform: open ? "rotate(45deg) translate(5px, 5px)" : "none",
              }}
            />
            <span
              className="block h-[1.5px] w-6 transition-all duration-300"
              style={{
                backgroundColor: scrolled ? "#1a1a1a" : "#ffffff",
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block h-[1.5px] w-6 transition-all duration-300"
              style={{
                backgroundColor: scrolled ? "#1a1a1a" : "#ffffff",
                transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none",
              }}
            />
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="md:hidden fixed inset-0 z-40 flex flex-col b02-drawer"
            style={{
              background: "rgba(249,247,245,0.98)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Top — close button + brand */}
            <div style={{
              padding: "22px 24px",
              borderBottom: "1px solid rgba(212,169,110,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "#1a1a1a",
              }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
              <button
                className="bg-transparent border-0 cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Zavřít menu"
                style={{ width: 40, height: 40, color: "#1a1a1a" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Links — Libre Baskerville italic */}
            <div style={{ flex: 1, paddingBlock: 24, overflowY: "auto" }}>
              {links.map((l, i) => (
                <a
                  key={`${l.href}-${i}`}
                  href={navResolve(l.href)}
                  className="flex items-center b02-drawer-link"
                  style={{
                    minHeight: 56,
                    padding: "0 24px",
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontSize: "20px",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#1a1a1a",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(212,169,110,0.12)",
                    transition: "color 0.3s ease, padding-left 0.3s ease",
                    animation: `b02DrawerFade 0.45s cubic-bezier(.22,.68,0,1.1) ${0.05 + i * 0.06}s both`,
                  }}
                  onClick={() => setOpen(false)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </div>

            {/* Bottom — CTA */}
            {ctaText && (
              <div style={{ padding: "20px 24px 30px", borderTop: "1px solid rgba(212,169,110,0.22)" }}>
                <a
                  href={navResolve(ctaHref)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    minHeight: 54,
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    backgroundColor: "#d4a96e",
                    borderRadius: 50,
                    textDecoration: "none",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </div>
            )}
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
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      const key = (name ?? "").toLowerCase();
      switch (true) {
        case key.includes("insta"):
          return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
        case key.includes("facebook") || key.includes("fb"):
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case key.includes("twitter") || key === "x":
          return (<svg {...p}><path d="M4 4l7.5 9.5L4.5 20H7l6-6.2L17.5 20H20l-7.8-10L19.5 4H17l-5.4 5.6L7 4z"/></svg>);
        case key.includes("tiktok"):
          return (<svg {...p}><path d="M21 8.5a6.4 6.4 0 0 1-4-1.4V15a6 6 0 1 1-6-6h1v3.5h-1a2.5 2.5 0 1 0 2.5 2.5V3h3a4 4 0 0 0 4 4z"/></svg>);
        case key.includes("youtube"):
          return (<svg {...p}><rect x="2" y="6" width="20" height="12" rx="3"/><polygon points="10 9 16 12 10 15" fill="currentColor"/></svg>);
        default:
          return <span className="text-[11px] uppercase">{name}</span>;
      }
    };
    return (
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{
          background: scrolled
            ? "rgba(28,20,16,0.92)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.18) 75%, transparent 100%)",
          backdropFilter: scrolled ? "blur(14px) saturate(150%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px) saturate(150%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(200,169,110,0.32)" : "none",
          boxShadow: scrolled ? "0 6px 28px rgba(0,0,0,0.4)" : "none",
          transition: "background 0.45s cubic-bezier(.4,0,.2,1), backdrop-filter 0.45s cubic-bezier(.4,0,.2,1), box-shadow 0.45s ease, border-color 0.45s ease",
        }}
        data-template="barber-03"
        data-hamburger-bp={hamburgerBp}
      >
        {/* Top utility strip — sbalí se po scrollu */}
        <div
          className="hidden lg:block overflow-hidden"
          style={{
            maxHeight: scrolled ? 0 : 42,
            opacity: scrolled ? 0 : 1,
            transition: "max-height 0.4s ease, opacity 0.3s ease",
            borderBottom: scrolled ? "0" : "1px solid rgba(255,255,255,0.10)",
            backgroundColor: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex items-center justify-between" style={{ height: 42 }}>
            {/* Phone with icon */}
            {phone?.href ? (
              <a
                href={phone.href}
                className="b03-topbar-phone"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#c8a96e",
                  textDecoration: "none",
                  transition: "color 0.3s ease, transform 0.3s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.45 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="topbar.phone.label" value={phone.label ?? ""} tag="span" />
              </a>
            ) : <span />}

            {/* Socials — gold ring on hover */}
            <div className="flex items-center" style={{ gap: 10 }}>
              {social.map((s, i) => (
                <a
                  key={`${s.href}-${i}`}
                  href={s.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label ?? s.icon ?? "social"}
                  className="b03-topbar-social"
                  style={{
                    width: 32, height: 32,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "rgba(255,255,255,0.78)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.3s ease, border-color 0.3s ease, transform 0.3s ease, background 0.3s ease",
                  }}
                >
                  <SocialIcon name={s.icon ?? s.label} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 flex items-center justify-between" style={{
          paddingBlock: scrolled ? 12 : 18,
          transition: "padding 0.4s cubic-bezier(.4,0,.2,1)",
        }}>
          {/* Logo */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="flex items-center shrink-0 b03-brand"
            title={siteName}
            style={{ textDecoration: "none", gap: 12 }}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{
                width: scrolled ? 170 : 200,
                height: scrolled ? 48 : 56,
                transition: "width 0.4s cubic-bezier(.4,0,.2,1), height 0.4s cubic-bezier(.4,0,.2,1)",
              }}
            >
              <OptimizedPicture
                src={logoSrc}
                alt={siteName}
                imgStyle={{
                  width: "100%", height: "100%", objectFit: "contain",
                  filter: scrolled ? "none" : "drop-shadow(0 2px 8px rgba(0,0,0,0.45))",
                  transition: "filter 0.4s ease",
                }}
              />
            </GenericEditableImage>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center" style={{ gap: 30 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={navResolve(l.href)}
                className="b03-nav-link relative"
                style={{
                  fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  textShadow: scrolled ? "none" : "0 1px 6px rgba(0,0,0,0.5)",
                  textDecoration: "none",
                  paddingBottom: 4,
                  transition: "color 0.35s ease, text-shadow 0.4s ease",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                <span
                  aria-hidden="true"
                  className="b03-nav-underline"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: 2,
                    backgroundColor: "#c8a96e",
                    transformOrigin: "left",
                    transform: "scaleX(0)",
                    transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)",
                  }}
                />
              </a>
            ))}

            {ctaText && (
              <a
                href={navResolve(ctaHref)}
                className="b03-cta"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  paddingInline: 26,
                  paddingBlock: 13,
                  fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#1c1410",
                  backgroundColor: "#c8a96e",
                  border: "1px solid #c8a96e",
                  textDecoration: "none",
                  transition: "background 0.35s ease, color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.3s ease",
                  boxShadow: "0 4px 14px rgba(200,169,110,0.32)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                  <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                  <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                  <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <span aria-hidden className="b03-cta-arrow" style={{
                  display: "inline-flex",
                  transition: "transform 0.4s cubic-bezier(.22,.68,0,1.1)",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col items-center justify-center gap-[6px] w-11 h-11 bg-transparent border-0 cursor-pointer p-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
          >
            <span className="block h-[1.5px] w-6 transition-all duration-300" style={{
              backgroundColor: scrolled ? "#c8a96e" : "#ffffff",
              transform: open ? "rotate(45deg) translate(5px, 5px)" : "none",
            }} />
            <span className="block h-[1.5px] w-6 transition-all duration-300" style={{
              backgroundColor: scrolled ? "#c8a96e" : "#ffffff",
              opacity: open ? 0 : 1,
            }} />
            <span className="block h-[1.5px] w-6 transition-all duration-300" style={{
              backgroundColor: scrolled ? "#c8a96e" : "#ffffff",
              transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }} />
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="lg:hidden fixed inset-0 z-40 flex flex-col b03-drawer"
            style={{
              background: "rgba(28,20,16,0.98)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Top — close button + brand */}
            <div style={{
              padding: "22px 24px",
              borderBottom: "1px solid rgba(200,169,110,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: "#f5efe6",
              }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
              <button
                className="bg-transparent border-0 cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Zavřít menu"
                style={{ width: 40, height: 40, color: "#c8a96e" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Links — Source Sans uppercase masculine */}
            <div style={{ flex: 1, paddingBlock: 24, overflowY: "auto" }}>
              {links.map((l, i) => (
                <a
                  key={`${l.href}-${i}`}
                  href={navResolve(l.href)}
                  className="flex items-center b03-drawer-link"
                  style={{
                    minHeight: 56,
                    padding: "0 24px",
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#f5efe6",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(200,169,110,0.12)",
                    transition: "color 0.3s ease, padding-left 0.3s ease, background-color 0.3s ease",
                    animation: `b03DrawerFade 0.45s cubic-bezier(.22,.68,0,1.1) ${0.05 + i * 0.06}s both`,
                  }}
                  onClick={() => setOpen(false)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </div>

            {/* Bottom — phone + CTA + socials */}
            <div style={{ padding: "20px 24px 30px", borderTop: "1px solid rgba(200,169,110,0.22)" }}>
              {phone?.href && (
                <a
                  href={phone.href}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    minHeight: 48,
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#c8a96e",
                    textDecoration: "none",
                    marginBottom: ctaText ? 12 : 18,
                  }}
                  onClick={() => setOpen(false)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.45 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {phone.label}
                </a>
              )}
              {ctaText && (
                <a
                  href={navResolve(ctaHref)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    minHeight: 54,
                    fontFamily: "'Source Sans Pro', system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#1c1410",
                    backgroundColor: "#c8a96e",
                    textDecoration: "none",
                    marginBottom: 18,
                  }}
                  onClick={() => setOpen(false)}
                >
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </a>
              )}
              {social.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 14, paddingTop: 4 }}>
                  {social.map((s, i) => (
                    <a
                      key={`${s.href}-${i}`}
                      href={s.href ?? "#"}
                      aria-label={s.icon}
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        border: "1px solid rgba(200,169,110,0.32)",
                        color: "#c8a96e",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SocialIcon name={s.icon ?? s.label} />
                    </a>
                  ))}
                </div>
              )}
            </div>
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
    // Industrial street-luxe: separate Reserve link (last item with "rezerv" in href/label) from regular nav links
    const isReserveLink = (l: { href?: string; label?: string }) => {
      const h = (l.href ?? "").toLowerCase();
      const lb = (l.label ?? "").toLowerCase();
      return h.includes("rezerv") || lb.includes("rezerv") || lb.includes("vytvořte si") || lb.includes("vytvorte si");
    };
    const navLinks = links.filter((l) => !isReserveLink(l));
    const reserveLink = links.find((l) => isReserveLink(l));
    // Krátký label pro reserve button (UPPERCASE button, krátké slovo lepší)
    const reserveLabel = (() => {
      const raw = (reserveLink?.label ?? "Rezervace").trim();
      if (/vytvořte|vytvorte/i.test(raw)) return "Rezervace";
      return raw;
    })();

    return (
      <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full b04-nav"
        data-template="barber-04"
        data-hamburger-bp={hamburgerBp}
        data-scrolled={scrolled ? "true" : "false"}
        style={{
          background: scrolled
            ? "rgba(10,8,6,.96)"
            : "rgba(10,8,6,.40)",
          boxShadow: scrolled ? "0 2px 18px rgba(0,0,0,.5)" : "none",
          transition: "background .3s ease, box-shadow .3s ease",
        }}
      >
        {/* top-bar viditelný pouze ≥ 768px (md:flex) */}
        <div
          className="hidden md:flex max-w-[1320px] mx-auto px-6 lg:px-10 py-2 items-center justify-between relative"
          style={{ fontFamily: "'Lato',Helvetica,Arial,sans-serif" }}
        >
          {/* subtle gold fade gradient divider */}
          <div aria-hidden style={{
            position: "absolute", left: "10%", right: "10%", bottom: 0, height: 1,
            background: "linear-gradient(90deg, transparent 0%, rgba(213,185,129,.35) 50%, transparent 100%)",
          }} />
          {/* Phone left */}
          {phone?.href ? (
            <a
              href={phone.href}
              className="b04-topbar-link"
              style={{
                color: "rgba(255,255,255,.78)",
                fontWeight: 500,
                fontSize: 11.5,
                letterSpacing: "0.12em",
                textDecoration: "none",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="topbar.phone.label" value={phone.label ?? ""} tag="span" />
            </a>
          ) : <span />}
          {/* Social right */}
          <div className="flex items-center" style={{ gap: 14 }}>
            {social.map((s, i) => (
              <a
                key={`${s.href}-${i}`}
                href={s.href ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label ?? s.icon ?? "social"}
                className="b04-social"
                style={{ color: "#d5b981", display: "inline-flex", opacity: 0.85 }}
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-3 md:py-4 flex items-center justify-between relative">
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="flex items-center shrink-0"
            title={siteName}
          >
            {logoUrl ? (
              <GenericEditableImage
                sectionId={sectionId}
                field="logoUrl"
                src={logoSrc}
                alt={siteName}
                className="relative overflow-hidden shrink-0 w-[140px] h-[36px] md:w-[200px] md:h-[56px]"
              >
                <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} fetchPriority="high" />
              </GenericEditableImage>
            ) : (
              <span style={{
                fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                fontSize: "clamp(22px,2vw,28px)",
                letterSpacing: "0.14em",
                color: "#ffffff",
                textShadow: "0 1px 8px rgba(0,0,0,.6)",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            )}
          </a>

          <div className="hidden lg:flex items-center" style={{ gap: 28 }}>
            <div className="flex items-center" style={{ gap: 22 }}>
              {navLinks.map((l, i) => (
                <a
                  key={`${l.href}-${i}`}
                  href={navResolve(l.href)}
                  className="b04-nav-link uppercase"
                  style={{
                    color: "#fff",
                    fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.10em",
                    fontWeight: 500,
                    position: "relative",
                    padding: "6px 0",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </div>
            {reserveLink && (
              <a
                href={navResolve(reserveLink.href ?? "#")}
                className="b04-reserve-btn uppercase"
                style={{
                  fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.20em",
                  color: "#d5b981",
                  background: "transparent",
                  padding: "10px 18px",
                  border: "1px solid #d5b981",
                  textDecoration: "none",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                <GenericEditableText
                  sectionId={sectionId}
                  field={`links.${links.indexOf(reserveLink)}.label`}
                  value={reserveLabel}
                  tag="span"
                />
              </a>
            )}
          </div>

          {/* Hamburger — viditelný backdrop + tři čáry s gold hover */}
          <button
            className="lg:hidden flex flex-col justify-between cursor-pointer border-0 p-0"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
            style={{
              width: 40,
              height: 40,
              background: "rgba(0,0,0,.45)",
              borderRadius: 4,
              padding: "10px 9px",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "stretch",
            }}
          >
            <span style={{ display: "block", height: 1.5, background: open ? "#d5b981" : "#fff", transition: "background .2s", borderRadius: 1 }} />
            <span style={{ display: "block", height: 1.5, background: open ? "#d5b981" : "#fff", transition: "background .2s", borderRadius: 1, opacity: open ? 0 : 1 }} />
            <span style={{ display: "block", height: 1.5, background: open ? "#d5b981" : "#fff", transition: "background .2s", borderRadius: 1 }} />
          </button>
        </div>

        {/* Side drawer */}
        <style>{`
          @keyframes b04DrawerIn  { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes b04FadeIn    { from { opacity: 0; } to { opacity: 1; } }
          .b04-drawer  { animation: b04DrawerIn .32s cubic-bezier(.22,.61,.36,1) both; }
          .b04-overlay { animation: b04FadeIn .25s ease both; }
        `}</style>

        {open && (
          <>
            {/* Backdrop */}
            <div
              className="b04-overlay lg:hidden fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(2px)" }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            {/* Panel */}
            <div
              className="b04-drawer lg:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col overflow-y-auto"
              style={{ width: "min(238px, 62vw)", background: "#0d0b09", borderLeft: "1px solid rgba(213,185,129,.18)" }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 17px 14px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"} onClick={() => setOpen(false)}>
                  <OptimizedPicture
                    src={logoSrc}
                    alt={siteName}
                    imgStyle={{ width: 105, height: 27, objectFit: "contain", filter: "brightness(0) invert(1)" }}
                  />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Zavřít menu"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 3, lineHeight: 1 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Navigační linky */}
              <nav style={{ display: "flex", flexDirection: "column", padding: "17px", gap: 1 }}>
                {links.map((l, i) => (
                  <a
                    key={`${l.href}-${i}`}
                    href={navResolve(l.href)}
                    onClick={() => setOpen(false)}
                    style={{
                      fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif",
                      fontSize: 14,
                      letterSpacing: "0.10em",
                      color: "#fff",
                      textDecoration: "none",
                      padding: "7px 0",
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                      display: "block",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#d5b981")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                ))}
              </nav>

              {/* Spodní část — telefon + sociální sítě */}
              <div style={{ marginTop: "auto", padding: "11px 17px 22px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
                {phone?.href && (
                  <a
                    href={phone.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block",
                      fontFamily: "'Lato',Helvetica,Arial,sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "#d5b981",
                      textDecoration: "none",
                      marginBottom: 14,
                    }}
                  >
                    {phone.label}
                  </a>
                )}
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {social.map((s, i) => (
                    <a
                      key={`${s.href}-mob-${i}`}
                      href={s.href ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label ?? s.icon ?? "social"}
                      onClick={() => setOpen(false)}
                      style={{ color: "#d5b981", opacity: 0.85, transition: "opacity .15s", transform: "scale(0.7)", transformOrigin: "center" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
                    >
                      <SocialIcon name={s.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
      </>
    );
  }

  if (variant === "barber-dark") {
    const phone = String(content.phone ?? "+420 777 123 456");
    const address = String(content.address ?? "Náměstí Svobody 5, Brno");
    const hoursLabel = String(content.hoursLabel ?? "Po–Pá 9:00–20:00 · So 9:00–14:00");
    const announcementText = String(content.announcementText ?? "Volná místa tento týden — rezervujte online");
    const socials = (content.socials as Array<{ icon?: string; href?: string }>) ?? [
      { icon: "instagram", href: "#" },
      { icon: "facebook",  href: "#" },
    ];
    const navShadow = scrolled
      ? "0 8px 28px rgba(0,0,0,0.55)"
      : "none";
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      switch (name) {
        case "instagram":
          return (<svg {...p}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
        case "facebook":
          return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case "twitter":
        case "x":
          return (<svg {...p}><path d="M4 4l7.5 9.5L4.5 20H7l6-6.2L17.5 20H20l-7.8-10L19.5 4H17l-5.4 5.6L7 4z"/></svg>);
        case "tiktok":
          return (<svg {...p}><path d="M21 8.5a6.4 6.4 0 0 1-4-1.4V15a6 6 0 1 1-6-6h1v3.5h-1a2.5 2.5 0 1 0 2.5 2.5V3h3a4 4 0 0 0 4 4z"/></svg>);
        default:
          return null;
      }
    };
    return (
      <>
      <nav
        className="fixed top-0 z-30 w-full"
        style={{
          background: scrolled
            ? "rgba(10,10,10,0.78)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.32) 70%, transparent 100%)",
          backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
          boxShadow: navShadow,
          transition: "background 0.4s ease, box-shadow 0.35s ease, backdrop-filter 0.4s ease",
        }}
        data-template="barber-01"
      >
        {/* Top utility strip — vždy viditelná, sbalí se po scrollu */}
        <div
          className="hidden md:block overflow-hidden"
          style={{
            maxHeight: scrolled ? 0 : 36,
            opacity: scrolled ? 0 : 1,
            transition: "max-height 0.35s ease, opacity 0.25s ease",
            borderBottom: scrolled ? "0" : "1px solid rgba(201,168,76,0.18)",
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        >
          <div className="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between" style={{ height: 36 }}>
            {/* Left — adresa + hodiny */}
            <div className="flex items-center" style={{ gap: 22, fontSize: "10.5px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(245,245,245,0.78)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #C9A84C)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </span>
              <span aria-hidden="true" style={{ width: 1, height: 12, backgroundColor: "rgba(201,168,76,0.28)" }} />
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #C9A84C)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
              </span>
            </div>

            {/* Right — phone + socials */}
            <div className="flex items-center" style={{ gap: 18 }}>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-accent, #C9A84C)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.45 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              {socials.length > 0 && (
                <>
                  <span aria-hidden="true" style={{ width: 1, height: 12, backgroundColor: "rgba(201,168,76,0.28)" }} />
                  <div className="flex items-center" style={{ gap: 12 }}>
                    {socials.map((s, i) => (
                      <a
                        key={`${s.icon}-${i}`}
                        href={s.href || "#"}
                        aria-label={s.icon}
                        style={{
                          color: "rgba(245,245,245,0.72)",
                          transition: "color 0.2s ease",
                          display: "inline-flex",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--color-accent, #C9A84C)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,245,245,0.72)"; }}
                      >
                        <SocialIcon name={s.icon} />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Announcement bar — visible only when scrolled (zachováno) */}
        <div
          className="hidden md:flex items-center justify-center px-8"
          style={{
            backgroundColor: "var(--color-accent, #C9A84C)",
            height: 28,
            display: scrolled ? undefined : "none",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#111",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="announcementText" value={announcementText} tag="span" />
          </span>
        </div>

        {/* Main navigation bar */}
        <div>
          <div className="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between" style={{ height: scrolled ? 68 : 80, transition: "height 0.3s ease" }}>

            {/* Logo s gold corner brackets (luxusní monogram rámeček) */}
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
              className="flex items-center shrink-0 group"
              title={siteName}
              style={{ position: "relative", padding: "8px 14px" }}
            >
              {/* Corner brackets — gold hairlines */}
              <span aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, borderTop: "1px solid var(--color-accent, #C9A84C)", borderLeft: "1px solid var(--color-accent, #C9A84C)", transition: "all 0.25s ease" }} className="bracket-tl" />
              <span aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, borderTop: "1px solid var(--color-accent, #C9A84C)", borderRight: "1px solid var(--color-accent, #C9A84C)", transition: "all 0.25s ease" }} className="bracket-tr" />
              <span aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, borderBottom: "1px solid var(--color-accent, #C9A84C)", borderLeft: "1px solid var(--color-accent, #C9A84C)", transition: "all 0.25s ease" }} className="bracket-bl" />
              <span aria-hidden="true" style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderBottom: "1px solid var(--color-accent, #C9A84C)", borderRight: "1px solid var(--color-accent, #C9A84C)", transition: "all 0.25s ease" }} className="bracket-br" />
              <GenericEditableImage
                sectionId={sectionId}
                field="logoUrl"
                src={logoSrc}
                alt={siteName}
                className="relative overflow-hidden shrink-0"
                style={{ width: 188, height: 46 }}
              >
                <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }} />
              </GenericEditableImage>
            </a>

            {/* Desktop nav — flush to right edge */}
            <div className="hidden md:flex items-center gap-9 ml-auto">
              {links.map((l, i) => (
                <a
                  key={`${l.href}-${i}`}
                  href={navResolve(l.href)}
                  className="relative group"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#F5F5F5",
                    textDecoration: "none",
                    paddingBottom: 2,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  {/* animated gold underline */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: 0,
                      width: "100%",
                      height: 1,
                      backgroundColor: "var(--color-accent, #C9A84C)",
                      transformOrigin: "left",
                      transform: "scaleX(0)",
                      transition: "transform 0.25s ease",
                    }}
                    className="barber-nav-underline"
                  />
                </a>
              ))}

              {ctaText && (
                <a
                  href={navResolve(ctaHref)}
                  data-btn="inverse"
                  className="barber-cta-premium"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    paddingInline: 22,
                    paddingBlock: 11,
                    fontSize: "11.5px",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#0a0a0a",
                    backgroundColor: "var(--color-accent, #C9A84C)",
                    border: "1px solid var(--color-accent, #C9A84C)",
                    borderRadius: 2,
                    textDecoration: "none",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.18)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 22px rgba(201,168,76,0.35)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 2px 0 rgba(0,0,0,0.18)";
                  }}
                >
                  {/* Scissors icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                  {/* Shimmer sweep on hover */}
                  <span aria-hidden="true" className="barber-cta-shimmer" style={{
                    position: "absolute",
                    top: 0, left: "-60%",
                    width: "50%", height: "100%",
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
                    transform: "skewX(-20deg)",
                    pointerEvents: "none",
                  }} />
                </a>
              )}
            </div>

            {/* Mobile hamburger — §11.2 44×44px */}
            <button
              className="md:hidden flex flex-col items-center justify-center gap-[5px] w-11 h-11"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={open}
            >
              <span
                className="block w-5 h-px transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-accent, #C9A84C)",
                  transform: open ? "rotate(45deg) translate(4px, 4px)" : "none",
                }}
              />
              <span
                className="block w-5 h-px transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-accent, #C9A84C)",
                  opacity: open ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-px transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-accent, #C9A84C)",
                  transform: open ? "rotate(-45deg) translate(4px, -4px)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            style={{
              backgroundColor: "#0d0d0d",
              borderTop: "1px solid rgba(201,168,76,0.15)",
              paddingBottom: 24,
            }}
          >
            {/* Phone in mobile */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid rgba(201,168,76,0.1)",
                marginBottom: 8,
              }}
            >
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-accent, #C9A84C)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.45 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {phone}
              </a>
            </div>

            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={navResolve(l.href)}
                className="flex items-center"
                style={{
                  minHeight: 48,
                  padding: "0 20px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#F5F5F5",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(201,168,76,0.08)",
                }}
                onClick={() => setOpen(false)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}

            {ctaText && (
              <div style={{ padding: "16px 20px 0" }}>
                <a
                  href={navResolve(ctaHref)}
                  data-btn="primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    minHeight: 48,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#0a0a0a",
                    backgroundColor: "var(--color-accent, #C9A84C)",
                    borderRadius: 2,
                    textDecoration: "none",
                  }}
                  onClick={() => setOpen(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </a>
              </div>
            )}
          </div>
        )}
      </nav>
      </>
    );
  }

  if (content.layout === "cafe-wave") {
    const loginLabel = String(content.loginLabel ?? "Přihlásit");
    const locationsLabel = String((content as Record<string, unknown>).locationsLabel ?? "Provozovny");
    const locationsHref = String(content.locationsHref ?? "/kavarny");
    const loginHref = String(content.loginHref ?? "/prihlaseni");
    return (
      <nav
        data-layout="cafe-wave"
        data-template="cafe-01"
        data-scrolled={scrolled ? "y" : "n"}
        className="cafe01-nav sticky top-0 z-50 w-full"
        style={{ fontFamily: "var(--font-body, 'CostaText', sans-serif)" }}
      >
        {/* Luxe top hairline — cherry → cream gradient */}
        <div className="cafe01-nav__hairline" aria-hidden="true" />

        {/* Mobile row — solid burgundy, flex: [hamburger | logo(centered) | login] */}
        <div
          data-nav-row="mobile"
          className="cafe01-nav__mobile flex items-center h-16 px-2"
        >
          <button
            type="button"
            className={`cafe01-nav__burger flex items-center justify-center w-11 h-11 text-white ${open ? "is-open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="cafe01-nav__burger-inner">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div className="flex-1 flex justify-center">
            <a
              href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
              className="cafe01-nav__logo flex items-center"
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
          <a
            href={navResolve(loginHref)}
            className="cafe01-nav__icon-btn cafe01-nav__icon-btn--mobile inline-flex items-center justify-center w-11 h-11 shrink-0 text-white"
            aria-label={loginLabel}
          >
            <IconUser />
          </a>
        </div>

        {/* Desktop row — SOLID burgundy bar (Costa Coffee style) */}
        <div
          data-nav-row="desktop"
          className="cafe01-nav__desktop"
        >
          <div className="cafe01-nav__desktop-inner flex relative max-w-[1360px] mx-auto px-8 items-center">
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
            className="cafe01-nav__logo flex items-center shrink-0"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative shrink-0 overflow-hidden"
              style={{ width: 148, height: 46 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>
          <div
            className="cafe01-nav__links flex items-center gap-8 mx-auto text-white"
            style={{ fontFamily: "var(--font-body, 'CostaText', sans-serif)" }}
          >
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={navResolve(l.href)}
                className="cafe01-nav__link"
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>
          <div className="cafe01-nav__actions flex items-center gap-2 ml-auto">
            <a
              href={navResolve(locationsHref)}
              className="cafe01-nav__icon-btn inline-flex items-center gap-2 px-3 h-10 text-white"
              aria-label={locationsLabel}
            >
              <IconPin />
              <GenericEditableText sectionId={sectionId} field="locationsLabel" value={locationsLabel} tag="span" className="cafe01-nav__icon-label" />
            </a>
            <a
              href={navResolve(loginHref)}
              className="cafe01-nav__icon-btn inline-flex items-center gap-2 px-3 h-10 text-white"
              aria-label={loginLabel}
            >
              <IconUser />
              <GenericEditableText sectionId={sectionId} field="loginLabel" value={loginLabel} tag="span" className="cafe01-nav__icon-label" />
            </a>
          </div>
          </div>
        </div>
        {open && (
          <div className="cafe01-nav__mobile-menu lg:hidden">
            <div className="px-4 pb-6 pt-2">
              {links.map((l, i) => (
                <a
                  key={`${l.href}-${i}`}
                  href={navResolve(l.href)}
                  className="cafe01-nav__mobile-link flex items-center min-h-[52px] text-white border-b border-white/10"
                  style={{ animationDelay: `${60 + i * 40}ms` }}
                  onClick={() => setOpen(false)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href={navResolve(locationsHref)}
                  className="cafe01-nav__mobile-action inline-flex items-center gap-2 h-11 px-3 text-white border border-white/25"
                  onClick={() => setOpen(false)}
                >
                  <IconPin />
                  <GenericEditableText sectionId={sectionId} field="locationsLabel" value={locationsLabel} tag="span" />
                </a>
                <a
                  href={navResolve(loginHref)}
                  className="cafe01-nav__mobile-action inline-flex items-center gap-2 h-11 px-3 text-white border border-white/25"
                  onClick={() => setOpen(false)}
                >
                  <IconUser />
                  <GenericEditableText sectionId={sectionId} field="loginLabel" value={loginLabel} tag="span" />
                </a>
              </div>
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
                href={navResolve(l.href)}
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
                href={navResolve(ctaHref)}
                data-btn="primary"
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
                href={navResolve(l.href)}
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
              href={navResolve(l.href)}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "var(--color-text, #111827)" }}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${links.indexOf(l)}.label`} value={l.label} tag="span" />
            </a>
          ))}
          {ctaText && (
            <a
              href={navResolve(ctaHref)}
              data-btn="primary"
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
              href={navResolve(l.href)}
              className="block text-sm font-medium py-2"
              style={{ color: "var(--color-text, #111827)" }}
              onClick={() => setOpen(false)}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${links.indexOf(l)}.label`} value={l.label} tag="span" />
            </a>
          ))}
          {ctaText && (
            <a
              href={navResolve(ctaHref)}
              data-btn="primary"
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
            <img loading="eager" src={logoSrc} alt={siteName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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
            <img loading="eager" src={logoSrc} alt={siteName} style={{ width: 112, height: 28, objectFit: "contain" }} />
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
          <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 28, objectFit: "contain" }} />
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
              ? <img loading="eager" src={logoUrl} alt={siteName} style={{ width: 200, height: 44, objectFit: "contain" }} />
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
                  ? <img loading="eager" src={logoUrl} alt={siteName} style={{ maxWidth: 120, display: "block" }} />
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
              ? <img loading="eager" src={logoUrl} alt={siteName} style={{ maxWidth: 90, maxHeight: 48, objectFit: "contain" }} />
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
  // beauty-01 — Sand-Cream Editorial Wellness navbar
  // Solid cream paper bg with sticky hairline border. Wordmark (Fahkwang uppercase wide tracking) left,
  // nav links center with sand hairline-underline slide on hover, phone + filled-sand CTA right.
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Atelier Lumina");
  const logoUrl  = String(content.logoUrl ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone    = String(content.phone ?? "");
  const ctaText  = String(content.ctaText ?? "Rezervovat");
  const ctaHref  = String(content.ctaHref ?? "/rezervace");
  const useWordmark = String((content as Record<string, unknown>).useWordmark ?? "yes") !== "no";
  const siteMode = String(content.siteMode ?? "multipage");
  const navR = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const BG    = "#FFF8F1";
  const SAND  = "#E0BE9A";
  const TEXT  = "#1F1F1F";
  const MUTED = "#5B4D43";
  const FONT  = "'Fahkwang', serif";
  const RULE  = "rgba(91,77,67,0.18)";

  return (
    <header
      className="sticky top-0 z-50 b01-nav"
      style={{ backgroundColor: BG, borderBottom: `1px solid ${RULE}`, fontFamily: FONT }}
      data-template="beauty-01"
    >
      {/* Desktop */}
      <div
        className="hidden md:flex items-center max-w-[1320px] mx-auto"
        style={{ height: 92, padding: "0 clamp(24px, 4vw, 56px)", gap: 32 }}
      >
        {/* Brand — wordmark default, optional logo image */}
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
          className="shrink-0 flex items-center"
          aria-label={siteName}
          style={{ textDecoration: "none", color: TEXT }}
        >
          {useWordmark ? (
            <span style={{
              fontFamily: FONT,
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: TEXT,
              whiteSpace: "nowrap",
            }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
          ) : (
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative overflow-hidden" style={{ width: 160, height: 40 }}>
              <img loading="eager" src={logoSrc} alt={siteName} style={{ width: 160, height: 40, objectFit: "contain" }} />
            </GenericEditableImage>
          )}
        </a>

        {/* Nav linky — center, hairline underline slide on hover */}
        <nav className="flex items-center mx-auto" style={{ gap: 36 }}>
          {links.map((l, i) => (
            <a
              key={`b1-nav-${i}`}
              href={navR(l.href)}
              className="b01-nav-link relative"
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 400,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.20em",
                textDecoration: "none",
                paddingBottom: 6,
                whiteSpace: "nowrap",
                transition: "color 0.25s ease",
              }}
            >
              <GenericEditableText
                sectionId={sectionId}
                field={`links.${i}.label`}
                value={l.label}
                tag="span"
                style={{ whiteSpace: "nowrap" }}
              />
              <span aria-hidden="true" className="b01-nav-underline" style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                height: 1, backgroundColor: SAND,
                transformOrigin: "left",
                transform: "scaleX(0)",
                transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
              }} />
            </a>
          ))}
        </nav>

        {/* Right — phone + CTA */}
        <div className="flex items-center gap-5 shrink-0">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="b01-nav-phone inline-flex items-center gap-2"
              style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 400, color: MUTED,
                letterSpacing: "0.05em", whiteSpace: "nowrap", textDecoration: "none",
                transition: "color 0.25s ease",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          )}
          <a
            href={navR(ctaHref)}
            data-btn="primary"
            className="b01-nav-cta inline-flex items-center"
            style={{
              backgroundColor: SAND,
              color: TEXT,
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "14px 26px",
              whiteSpace: "nowrap",
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <span aria-hidden="true" className="b01-nav-cta-arrow" style={{ marginLeft: 10, transition: "transform 0.3s ease" }}>→</span>
          </a>
        </div>
      </div>

      {/* Mobile — výška 64px */}
      <div
        className="flex md:hidden items-center justify-between"
        style={{ height: 64, padding: "0 20px" }}
      >
        <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName} style={{ textDecoration: "none", color: TEXT }}>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT, whiteSpace: "nowrap" }}>
            {siteName}
          </span>
        </a>
        <button
          className="flex flex-col justify-between w-6 h-[16px] bg-transparent border-0 cursor-pointer p-0"
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
            className="absolute top-5 right-6 bg-transparent border-0 cursor-pointer p-2"
            style={{ color: TEXT }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
          {links.map((l, i) => (
            <a
              key={`b1-mob-${i}`}
              href={navR(l.href)}
              className="b01-mob-link"
              style={{ fontFamily: FONT, color: TEXT, fontSize: 22, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.20em", textDecoration: "none", transition: "color 0.25s ease" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={navR(ctaHref)}
            data-btn="primary"
            style={{
              backgroundColor: SAND, color: TEXT, fontFamily: FONT,
              fontSize: 13, fontWeight: 500, padding: "14px 32px",
              textTransform: "uppercase", letterSpacing: "0.20em", textDecoration: "none",
            }}
            onClick={() => setOpen(false)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: MUTED, fontFamily: FONT, fontSize: 14, textDecoration: "none" }}>
              {phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

// massage-01-navbar — Demo Masáže Praha
// Layout: [Logo] | [telefon+divider] | [nav linky] | [divider+social IG/FB/TikTok]
// BG #0A0A0A, gold #C9A962, text #F5F0E8, secondary #A09888, Inter font
// Bez CTA tlačítka — přesná replika praha-masaze.cz originálu
// ---------------------------------------------------------------------------
function NavbarMassage01({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName     = String(content.siteName    ?? "Demo Masáže");
  const siteTagline  = String(content.siteTagline ?? "Demo šablona");
  const logoUrl      = String(content.logoUrl     ?? "");
  const links        = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone        = String(content.phone       ?? "");
  const facebookUrl  = String(content.facebookUrl  ?? "");
  const instagramUrl = String(content.instagramUrl ?? "");
  const tiktokUrl    = String(content.tiktokUrl    ?? "");

  const BG        = "#0A0A0A";
  const GOLD      = "#C9A962";
  const TEXT      = "#F5F0E8";
  const SECONDARY = "#A09888";
  const BORDER    = "#2A2520";
  const FONT      = "'Inter', sans-serif";
  const FONT_HEAD = "'Cormorant Garamond', serif";

  const hasSocial = instagramUrl || facebookUrl || tiktokUrl;

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: BG, borderBottom: `1px solid ${BORDER}`, fontFamily: FONT }}
      data-template="massage-01"
    >
      {/* Desktop — výška 72px, position:relative pro absolutní centrování středu */}
      <div
        className="hidden md:flex items-center justify-between"
        style={{ height: 72, maxWidth: 1280, margin: "0 auto", padding: "0 80px", position: "relative" }}
      >
        {/* Logo vlevo */}
        <a
          href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
          style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}
          aria-label={siteName}
        >
          {logoUrl && (
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="relative overflow-hidden" style={{ width: 37, height: 37 }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ width: 37, height: 37, objectFit: "contain" }} />
            </GenericEditableImage>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: 3, color: TEXT, textTransform: "uppercase" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: 2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
              <GenericEditableText sectionId={sectionId} field="siteTagline" value={siteTagline} tag="span" />
            </span>
          </div>
        </a>

        {/* Střed — absolutně centrováno: telefon | divider | nav linky */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 0 }}>
          {phone && (
            <>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                style={{ display: "flex", alignItems: "center", gap: 8, color: SECONDARY, fontSize: 13, textDecoration: "none", transition: "color 0.25s", marginRight: 32, whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.color = TEXT; }}
                onMouseLeave={e => { e.currentTarget.style.color = SECONDARY; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.44 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                </svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <div style={{ width: 1, height: 20, background: BORDER, marginRight: 32, flexShrink: 0 }} />
            </>
          )}
          <nav>
            <ul style={{ display: "flex", alignItems: "center", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
              {links.map((l, i) => (
                <li key={`m01-nav-${i}`}>
                  <a
                    href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                    style={{ fontSize: 13, fontWeight: 400, color: SECONDARY, textDecoration: "none", transition: "color 0.25s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.color = TEXT; }}
                    onMouseLeave={e => { e.currentTarget.style.color = SECONDARY; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Social ikony vpravo + levý divider */}
        {hasSocial && (
          <>
            <div style={{ width: 1, height: 20, background: BORDER, marginRight: 24, flexShrink: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: SECONDARY, display: "flex", alignItems: "center", transition: "color 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = SECONDARY; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: SECONDARY, display: "flex", alignItems: "center", transition: "color 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = SECONDARY; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: SECONDARY, display: "flex", alignItems: "center", transition: "color 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = SECONDARY; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                  </svg>
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile — výška 60px */}
      <div
        className="flex md:hidden items-center justify-between"
        style={{ height: 60, padding: "0 20px" }}
      >
        <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName} style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: 3, color: TEXT, textTransform: "uppercase" }}>{siteName}</span>
        </a>
        <button
          style={{ display: "flex", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 4 }}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span style={{ display: "block", width: 22, height: 1, backgroundColor: TEXT }} />
          <span style={{ display: "block", width: 22, height: 1, backgroundColor: TEXT }} />
          <span style={{ display: "block", width: 22, height: 1, backgroundColor: TEXT }} />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center"
          style={{ backgroundColor: BG, fontFamily: FONT, gap: 32 }}
        >
          <button
            style={{ position: "absolute", top: 20, right: 24, background: "transparent", border: "none", cursor: "pointer", color: TEXT, fontSize: 22 }}
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >✕</button>
          <span style={{ fontFamily: FONT_HEAD, fontSize: 28, color: TEXT, letterSpacing: 3 }}>{siteName}</span>
          {links.map((l, i) => (
            <a
              key={`m01-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              style={{ color: SECONDARY, fontSize: 13, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.14em", textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: SECONDARY, fontSize: 13, textDecoration: "none" }}>{phone}</a>
          )}
          <div style={{ display: "flex", gap: 24 }}>
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: SECONDARY }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>}
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer" style={{ color: SECONDARY }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>}
            {tiktokUrl && <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" style={{ color: SECONDARY }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg></a>}
          </div>
        </div>
      )}
    </header>
  );
}

// ── fitness-01-navbar ──────────────────────────────────────────────────────
// Luxe Warm Physio Sanctuary — cream #FFF9F7 sticky navbar
// Wordmark vlevo (Inter 800 + Instrument Serif italic accent dot),
// nav links s warm-brown hairline underline grow z centra,
// pill CTA s breathing glow + arrow slide, scroll → hairline bottom border,
// mobile: animated stack hamburger + fullscreen overlay se stagger reveal
// ──────────────────────────────────────────────────────────────────────────
function NavbarFitness01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const siteName    = String(content.siteName    ?? "Adam Vítek");
  const siteTagline = String(content.siteTagline ?? "Fyzio · Osobní trénink");
  const ctaText     = String(content.ctaText     ?? "První konzultace zdarma");
  const ctaHref     = String(content.ctaHref     ?? "/kontakt");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];
  const siteMode    = String(content.siteMode ?? "multipage");

  const BG      = "#FFF9F7";
  const BORDER  = "#E5D9D1";
  const ACCENT  = "#AD8A72";
  const ACCENT_LIGHT = "#C29A82";
  const TEXT    = "#0E0906";

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <>
      <header
        className="fit01-nav sticky top-0 z-50"
        data-scrolled={scrolled ? "y" : "n"}
        data-template="fitness-01"
      >
        {/* Desktop */}
        <div className="fit01-nav-row hidden md:grid">
          {/* Wordmark vlevo */}
          <a href={resolve("/")} className="fit01-wordmark" aria-label={siteName}>
            <span className="fit01-wm-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            <span className="fit01-wm-tagline">
              <span className="fit01-wm-dot" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="siteTagline" value={siteTagline} tag="span" />
            </span>
          </a>

          {/* Nav linky středem */}
          <nav className="fit01-nav-center" aria-label="Hlavní menu">
            <ul className="fit01-nav-list">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={resolve(l.href)} className="fit01-navlink">
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA vpravo */}
          <a href={resolve(ctaHref)} className="fit01-cta" data-btn="primary">
            <span className="fit01-cta-label">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </span>
            <svg className="fit01-cta-arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 5h11M8 1l4 4-4 4" />
            </svg>
          </a>
        </div>

        {/* Mobile */}
        <div className="fit01-nav-mobile flex md:hidden items-center justify-between">
          <a href={resolve("/")} className="fit01-wordmark-mobile" aria-label={siteName}>
            <span className="fit01-wm-name-m">{siteName}</span>
            <span className="fit01-wm-tagline-m">
              <span className="fit01-wm-dot" aria-hidden="true" />
              {siteTagline}
            </span>
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            className="fit01-burger"
            data-open={open ? "y" : "n"}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {open && (
        <div className="fit01-overlay" data-template="fitness-01" role="dialog" aria-modal="true">
          <div className="fit01-overlay-head">
            <div>
              <div className="fit01-wm-name-m" style={{ color: TEXT }}>{siteName}</div>
              <div className="fit01-wm-tagline-m">
                <span className="fit01-wm-dot" aria-hidden="true" />
                {siteTagline}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
              className="fit01-close"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobilní menu">
            <ul className="fit01-overlay-list">
              {links.map((l, i) => (
                <li key={i} className="fit01-overlay-item" style={{ ["--i" as string]: i }}>
                  <a
                    href={resolve(l.href)}
                    onClick={() => setOpen(false)}
                    className="fit01-overlay-link"
                  >
                    <span className="fit01-overlay-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="fit01-overlay-label">{l.label}</span>
                    <svg className="fit01-overlay-arrow" width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 6h13M10 1l4 5-4 5" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="fit01-overlay-cta-wrap">
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              className="fit01-overlay-cta"
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 5h11M8 1l4 4-4 4" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
}

// Main exported dispatch — must be after all variant functions
export function NavbarSection(props: Props) {
  if (props.variant === "hair-01-topbar") return <NavbarHair01Topbar {...props} />;
  if (props.variant === "hair-02-navbar") return <NavbarHair02 {...props} />;
  if (props.variant === "hair-03-navbar") return <NavbarHair03 {...props} />;
  if (props.variant === "hair-04-navbar") return <NavbarHair04 {...props} />;
  if (props.variant === "beauty-01-topbar") return <NavbarBeauty01 {...props} />;
  if (props.variant === "massage-01-navbar") return <NavbarMassage01 {...props} />;
  if (props.variant === "tawan-01-navbar") return <NavbarTawan01 {...props} />;
  if (props.variant === "ananda-01-navbar") return <NavbarAnanda01 {...props} />;
  if (props.variant === "tawan-02-navbar") return <NavbarTawan02 {...props} />;
  if (props.variant === "tattoo-01-navbar") return <NavbarTattoo01 {...props} />;
  if (props.variant === "tattoo-02-navbar") return <NavbarTattoo02 {...props} />;
  if (props.variant === "tattoo-03-navbar") return <NavbarTattoo03 {...props} />;
  if (props.variant === "nails-01-navbar")  return <NavbarNails01 {...props} />;
  if (props.variant === "nails-02-navbar")  return <NavbarNails02 {...props} />;
  if (props.variant === "nails-03-navbar")  return <NavbarNails03 {...props} />;
  if (props.variant === "clinic-02-navbar") return <NavbarClinic02 {...props} />;
  if (props.variant === "fitness-01-navbar") return <NavbarFitness01 {...props} />;
  if (props.variant === "fitness-02-navbar") return <NavbarFitness02 {...props} />;
  if (props.variant === "fyzio-01-navbar") return <NavbarFyzio01 {...props} />;
  if (props.variant === "fyzio-02-navbar") return <NavbarFyzio02 {...props} />;
  if (props.variant === "restaurant-01-navbar") return <NavbarRestaurant01 {...props} />;
  if (props.variant === "restaurant-02-navbar") return <NavbarRestaurant02 {...props} />;
  if (props.variant === "restaurant-03-navbar") return <NavbarRestaurant03 {...props} />;
  if (props.variant === "cafe-02-navbar") return <NavbarCafe02 {...props} />;
  if (props.variant === "cafe-03-navbar") return <NavbarCafe03 {...props} />;
  if (props.variant === "cafe-04-navbar") return <NavbarCafe04 {...props} />;
  if (props.variant === "bakery-01-navbar") return <NavbarBakery01 {...props} />;
  if (props.variant === "bakery-02-navbar") return <NavbarBakery02 {...props} />;
  if (props.variant === "reality-01-navbar") return <NavbarReality01 {...props} />;
  if (props.variant === "reality-02-navbar") return <NavbarReality02 {...props} />;
  if (props.variant === "reality-03-navbar") return <NavbarReality03 {...props} />;
  if (props.variant === "reality-04-navbar") return <NavbarReality04 {...props} />;
  if (props.variant === "reality-05-navbar") return <NavbarReality05 {...props} />;
  if (props.variant === "reality-06-navbar") return <NavbarReality06 {...props} />;
  if (props.variant === "autoservis-01-navbar") return <NavbarAutoservis01 {...props} />;
  if (props.variant === "autoservis-02-navbar") return <NavbarAutoservis02 {...props} />;
  if (props.variant === "autoservis-03-navbar") return <NavbarAutoservis03 {...props} />;
  if (props.variant === "dental-01-navbar") return <NavbarDental01 {...props} />;
  if (props.variant === "ortho-01-navbar") return <NavbarOrtho01 {...props} />;
  if (props.variant === "ortho-02-navbar") return <NavbarOrtho02 {...props} />;
  if (props.variant === "legal-02-navbar")  return <NavbarLegal02 {...props} />;
  if (props.variant === "lawyer-01-navbar") return <NavbarLawyer01 {...props} />;
  if (props.variant === "stavba-01-navbar") return <NavbarStavba01 {...props} />;
  if (props.variant === "stavba-02-navbar") return <NavbarStavba02 {...props} />;
  if (props.variant === "stavba-03-navbar") return <NavbarStavba03 {...props} />;
  if (props.variant === "elektro-01-navbar") return <NavbarElektro01 {...props} />;
  if (props.variant === "catering-01-navbar") return <NavbarCatering01 {...props} />;
  if (props.variant === "instala-01-navbar") return <NavbarInstala01 {...props} />;
  if (props.variant === "florist-01-navbar") return <NavbarFlorist01 {...props} />;
  if (props.variant === "autoskola-01-navbar") return <NavbarAutoskola01 {...props} />;
  if (props.variant === "sweet-01-navbar") return <NavbarSweet01 {...props} />;
  if (props.variant === "lang-01-navbar") return <NavbarLang01 {...props} />;
  if (props.variant === "kids-01-navbar") return <NavbarKids01 {...props} />;
  if (props.variant === "edu-01-navbar")      return <NavbarEdu01      {...props} />;
  if (props.variant === "grooming-01-navbar") return <NavbarGrooming01 {...props} />;
  if (props.variant === "pethotel-01-navbar") return <NavbarPethotel01 {...props} />;
  if (props.variant === "vet-01-navbar") return <NavbarVet01 {...props} />;
  if (props.variant === "ucetni-01-navbar") return <NavbarUcetni01 {...props} />;
  if (props.variant === "ucetni-02-navbar") return <NavbarUcetni02 {...props} />;
  if (props.variant === "ucetni-03-navbar") return <NavbarUcetni03 {...props} />;
  if (props.variant === "ucetni-04-navbar") return <NavbarUcetni04 {...props} />;
  if (props.variant === "solar-01-navbar")  return <NavbarSolar01  {...props} />;
  if (props.variant === "arch-01-navbar")   return <NavbarArch01   {...props} />;
  if (props.variant === "clean-01-navbar")  return <NavbarClean01  {...props} />;
  if (props.variant === "klima-01-navbar")  return <NavbarKlima01  {...props} />;
  if (props.variant === "instala-02-navbar") return <NavbarInstala02 {...props} />;
  if (props.variant === "solar-02-navbar")   return <NavbarSolar02   {...props} />;
  if (props.variant === "solar-03-navbar")   return <NavbarSolar03   {...props} />;
  if (props.variant === "floors-01-navbar")  return <NavbarFloors01  {...props} />;
  if (props.variant === "klempir-01-navbar") return <NavbarKlempir01 {...props} />;
  if (props.variant === "garden-01-navbar")  return <NavbarGarden01  {...props} />;
  if (props.variant === "malir-01-navbar")   return <NavbarMalir01   {...props} />;
  if (props.variant === "malir-02-navbar")   return <NavbarMalir02   {...props} />;
  if (props.variant === "garden-02-navbar")  return <NavbarGarden02  {...props} />;
  if (props.variant === "arbo-01-navbar")    return <NavbarArbo01    {...props} />;
  if (props.variant === "clean-02-navbar")  return <NavbarClean02  {...props} />;
  if (props.variant === "ddd-01-navbar")    return <NavbarDdd01    {...props} />;
  if (props.variant === "chalet-01-navbar") return <NavbarChalet01 {...props} />;
  if (props.variant === "hotel-01-navbar")  return <NavbarHotel01  {...props} />;
  if (props.variant === "hotel-02-navbar")  return <NavbarHotel02  {...props} />;
  if (props.variant === "photo-01-navbar")  return <NavbarPhoto01  {...props} />;
  if (props.variant === "video-01-navbar")  return <NavbarVideo01  {...props} />;
  if (props.variant === "events-01-navbar") return <NavbarEvents01 {...props} />;
  if (props.variant === "dj-01-navbar")     return <NavbarDj01     {...props} />;
  if (props.variant === "restaurant-04-navbar") return <NavbarRestaurant04 {...props} />;
  if (props.variant === "clinic-03-navbar")     return <NavbarClinic03     {...props} />;
  return <NavbarSectionInner {...props} />;
}

// ── dj-01-navbar ───────────────────────────────────────────────────────────────
// LUXE REDESIGN (Neon Nocturne — vasdj.cz Awwwards edition):
// - Fixed top, transparent na hero → scroll: midnight rgba(10,10,12,0.88) + backdrop-blur(14px) + subtle orange bottom border
// - Wordmark: Space Grotesk 700 s EQ-bar SVG ikonou (5 orange gradient bars, load-pulse animation)
// - Desktop nav: JetBrains Mono 500 12.5px uppercase letter-spacing 0.14em; gradient underline slide-in hover (orange→amber, left→right, 260ms)
// - Ultra-subtle 1px vertical dividers rgba(255,255,255,0.06)
// - Hamburger: 2px minimal spans → transforms na X při open
// - Mobile overlay: midnight blur backdrop + Space Grotesk oversized nav + stagger fade-in
// ──────────────────────────────────────────────────────────────────────────────
function NavbarDj01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const ORANGE = "#f15a24";
  const AMBER  = "#ff8347";
  const WHITE  = "#ffffff";

  const siteName = String(content.siteName ?? "NOKTURN");
  const logoUrl  = String(content.logoUrl ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" />
      <style>{`
        .dj01-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: transparent;
          padding: 1.35rem 1.5rem;
          transition: background 320ms cubic-bezier(.2,.7,.2,1), backdrop-filter 320ms cubic-bezier(.2,.7,.2,1), border-color 320ms cubic-bezier(.2,.7,.2,1), padding 320ms cubic-bezier(.2,.7,.2,1);
          border-bottom: 1px solid transparent;
        }
        .dj01-nav.dj01-scrolled {
          background: rgba(10,10,12,0.88);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          backdrop-filter: blur(14px) saturate(140%);
          border-bottom-color: rgba(241,90,36,0.18);
          padding: 0.95rem 1.5rem;
        }
        .dj01-nav.dj01-scrolled::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(241,90,36,0.55) 50%, transparent 100%);
          pointer-events: none;
        }
        .dj01-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .dj01-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
          z-index: 7;
          transition: transform 260ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-logo:hover { transform: translateY(-1px); }
        .dj01-logo-eq {
          display: inline-flex;
          align-items: flex-end;
          gap: 3px;
          height: 22px;
        }
        .dj01-logo-eq span {
          display: block;
          width: 3px;
          background: linear-gradient(180deg, ${AMBER} 0%, ${ORANGE} 100%);
          border-radius: 1px;
          transform-origin: bottom center;
          animation: dj01-eq-in 900ms cubic-bezier(.2,.7,.2,1) both;
        }
        .dj01-logo-eq span:nth-child(1) { height: 40%;  animation-delay:  0ms; }
        .dj01-logo-eq span:nth-child(2) { height: 80%;  animation-delay: 80ms; }
        .dj01-logo-eq span:nth-child(3) { height: 55%;  animation-delay: 160ms; }
        .dj01-logo-eq span:nth-child(4) { height: 95%;  animation-delay: 240ms; }
        .dj01-logo-eq span:nth-child(5) { height: 65%;  animation-delay: 320ms; }
        .dj01-logo:hover .dj01-logo-eq span {
          animation: dj01-eq-pulse 780ms cubic-bezier(.4,.0,.2,1) infinite;
        }
        .dj01-logo:hover .dj01-logo-eq span:nth-child(1) { animation-delay:   0ms; }
        .dj01-logo:hover .dj01-logo-eq span:nth-child(2) { animation-delay:  80ms; }
        .dj01-logo:hover .dj01-logo-eq span:nth-child(3) { animation-delay: 160ms; }
        .dj01-logo:hover .dj01-logo-eq span:nth-child(4) { animation-delay: 240ms; }
        .dj01-logo:hover .dj01-logo-eq span:nth-child(5) { animation-delay: 320ms; }
        @keyframes dj01-eq-in { from { transform: scaleY(0.05); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        @keyframes dj01-eq-pulse {
          0%,100% { transform: scaleY(1); }
          50%     { transform: scaleY(0.4); }
        }
        .dj01-logo-wordmark {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${WHITE};
          line-height: 1;
          padding-left: 0.15em;
        }
        .dj01-logo-wordmark .dj01-mark-dot { color: ${ORANGE}; }
        .dj01-logo img { height: 40px; width: auto; display: block; }
        .dj01-links {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0; padding: 0;
          gap: 0;
          font-family: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: 0.78rem;
          font-weight: 500;
        }
        .dj01-links li {
          align-items: center;
          display: flex;
          margin: 0;
          padding: 0 1.15rem;
          position: relative;
        }
        .dj01-links li + li::before {
          content: "";
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 1px;
          background: rgba(255,255,255,0.08);
        }
        .dj01-links li:first-child { padding-left: 0.35rem; }
        .dj01-links li:last-child  { padding-right: 0.35rem; }
        .dj01-links a {
          color: ${WHITE};
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          display: inline-block;
          padding: 0.4rem 0;
          position: relative;
          transition: color 240ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-links a::after {
          content: "";
          position: absolute;
          left: 0; right: auto;
          bottom: -2px;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
          transition: width 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-links a:hover,
        .dj01-links li.active a { color: ${ORANGE}; }
        .dj01-links a:hover::after,
        .dj01-links li.active a::after { width: 100%; }
        .dj01-hamburger {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          z-index: 10;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }
        .dj01-hamburger span {
          display: block;
          width: 24px; height: 2px;
          background: ${ORANGE};
          border-radius: 0;
          transition: transform 300ms cubic-bezier(.2,.7,.2,1), opacity 200ms cubic-bezier(.2,.7,.2,1);
          transform-origin: center;
        }
        .dj01-hamburger[data-open="true"] span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
        .dj01-hamburger[data-open="true"] span:nth-child(2) { opacity: 0; }
        .dj01-hamburger[data-open="true"] span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
        @media (max-width: 860px) {
          .dj01-links { display: none; }
          .dj01-hamburger { display: flex; }
          .dj01-logo-wordmark { font-size: 1.05rem; letter-spacing: 0.24em; }
        }
        @media (max-width: 480px) {
          .dj01-logo-wordmark { font-size: 0.95rem; }
          .dj01-logo-eq { height: 18px; }
          .dj01-nav { padding: 1rem 1.15rem; }
          .dj01-nav.dj01-scrolled { padding: 0.75rem 1.15rem; }
        }
        .dj01-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10,10,12,0.96);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: dj01-overlay-in 320ms cubic-bezier(.2,.7,.2,1) both;
        }
        @keyframes dj01-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        .dj01-overlay::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(241,90,36,0.55) 50%, transparent 100%);
        }
        .dj01-overlay-close {
          position: absolute;
          top: 1.35rem; right: 1.5rem;
          background: none; border: 1px solid rgba(255,255,255,0.15);
          width: 44px; height: 44px;
          font-size: 1.4rem;
          cursor: pointer;
          color: ${WHITE};
          line-height: 1;
          border-radius: 0;
          transition: color 240ms cubic-bezier(.2,.7,.2,1), border-color 240ms cubic-bezier(.2,.7,.2,1), transform 240ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-overlay-close:hover { color: ${ORANGE}; border-color: rgba(241,90,36,0.6); transform: rotate(90deg); }
        .dj01-overlay-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.34em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          text-decoration: none;
          margin-bottom: 2.5rem;
        }
        .dj01-overlay-brand .dj01-mark-dot { color: ${ORANGE}; }
        .dj01-overlay-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
          list-style: none; margin: 0; padding: 0 1.5rem;
        }
        .dj01-overlay-nav li {
          margin: 0;
          padding: 0;
          opacity: 0;
          transform: translateY(14px);
          animation: dj01-nav-in 520ms cubic-bezier(.2,.7,.2,1) both;
        }
        .dj01-overlay-nav li:nth-child(1) { animation-delay: 100ms; }
        .dj01-overlay-nav li:nth-child(2) { animation-delay: 160ms; }
        .dj01-overlay-nav li:nth-child(3) { animation-delay: 220ms; }
        .dj01-overlay-nav li:nth-child(4) { animation-delay: 280ms; }
        .dj01-overlay-nav li:nth-child(5) { animation-delay: 340ms; }
        .dj01-overlay-nav li:nth-child(6) { animation-delay: 400ms; }
        @keyframes dj01-nav-in { to { opacity: 1; transform: translateY(0); } }
        .dj01-overlay-nav a {
          display: inline-block;
          padding: 0.5rem 0.75rem;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 1.6rem;
          letter-spacing: 0.06em;
          color: ${WHITE};
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          transition: color 240ms cubic-bezier(.2,.7,.2,1), transform 240ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-overlay-nav a::after {
          content: "";
          position: absolute;
          left: 50%; bottom: 0.15rem;
          width: 0; height: 2px;
          background: linear-gradient(90deg, ${ORANGE} 0%, ${AMBER} 100%);
          transform: translateX(-50%);
          transition: width 320ms cubic-bezier(.2,.7,.2,1);
        }
        .dj01-overlay-nav a:hover { color: ${ORANGE}; transform: translateY(-2px); }
        .dj01-overlay-nav a:hover::after { width: 60%; }
      `}</style>

      <nav className={`dj01-nav${scrolled ? " dj01-scrolled" : ""}`} data-template="dj-01">
        <div className="dj01-inner">
          {/* Logo */}
          <a href={homeHref} className="dj01-logo" title={siteName} aria-label={siteName}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="relative overflow-hidden">
                <OptimizedPicture src={logoUrl} alt={siteName} imgStyle={{ height: "40px", width: "auto", objectFit: "contain" }} />
              </GenericEditableImage>
            ) : (
              <>
                <span className="dj01-logo-eq" aria-hidden="true">
                  <span /><span /><span /><span /><span />
                </span>
                <span className="dj01-logo-wordmark">
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">
                    {siteName}
                  </GenericEditableText>
                  <span className="dj01-mark-dot">.</span>
                </span>
              </>
            )}
          </a>

          {/* Desktop nav */}
          <ul className="dj01-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
                </a>
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button
            className="dj01-hamburger"
            data-open={open ? "true" : "false"}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="dj01-overlay" role="dialog" aria-modal="true" aria-label="Navigace">
          <button className="dj01-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
          <a href={homeHref} className="dj01-overlay-brand" onClick={() => setOpen(false)}>
            {siteName}<span className="dj01-mark-dot">.</span>
          </a>
          <ul className="dj01-overlay-nav">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ── klempir-01-navbar ─────────────────────────────────────────────────────────
// 1:1 klempirzprahy.cz:
// - Fixed TRANSPARENT navbar přes hero (ztmavení pochází z radial-gradient hero overlaye)
// - Na scrollu (>60px) → bílý bg + box-shadow 0 5px 15px rgba(0,0,0,0.1)
// - Logo vlevo: SVG max-height 50px (bílá verze transparent, tmavá verze scrolled)
// - Container: max-width 1200px, padding 20px 15px
// - Nav linky: bílé → tmavé, hover silver #c0c0c0 + 2px underline
// - Tel vpravo; hamburger na mobilu (<992px) → fullscreen tmavý overlay
// - Font: Montserrat 500
// ─────────────────────────────────────────────────────────────────────────────
function NavbarKlempir01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const SILVER = "#c0c0c0";
  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const FONT   = "'Montserrat', sans-serif";

  const siteName = String(content.siteName ?? "Klempířské práce");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const isLight   = scrolled || menuOpen;
  const navBg     = isLight ? WHITE : "transparent";
  const navShadow = scrolled ? "0 5px 15px rgba(0,0,0,0.1)" : "none";
  const linkColor = isLight ? DARK : WHITE;
  // White SVG logo rendered dark when navbar is on white bg
  const logoFilter = isLight ? "brightness(0) saturate(100%)" : "none";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" />
      <style>{`        .k01-header{position:fixed;width:100%;top:0;left:0;z-index:1000;transition:all 0.3s ease;}
        .k01-inner{display:flex;align-items:center;justify-content:space-between;width:90%;max-width:1200px;margin:0 auto;padding:20px 15px;}
        .k01-menu{display:flex;list-style:none;margin:0;padding:0;}
        .k01-menu li{margin:0 15px;}
        .k01-menu a{font-family:${FONT};font-weight:500;font-size:16.5px;text-decoration:none;transition:all 0.3s ease;position:relative;}
        .k01-menu a::after{content:'';position:absolute;width:0;height:2px;background-color:${SILVER};bottom:-5px;left:0;transition:all 0.3s ease;}
        .k01-menu a:hover::after{width:100%;}
        .k01-phone-link{font-family:${FONT};font-weight:500;font-size:16.5px;text-decoration:none;transition:all 0.3s ease;}
        .k01-phone-link:hover{color:${SILVER}!important;}
        .k01-hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:5px;}
        .k01-hamburger span{display:block;width:25px;height:2px;border-radius:2px;transition:all 0.3s ease;}
        .k01-header-right{display:flex;align-items:center;gap:20px;}
        @media(max-width:992px){
          .k01-menu-wrap{display:none!important;}
          .k01-phone-wrap{display:none!important;}
          .k01-hamburger{display:flex!important;}
        }
        .k01-mobile-overlay{position:fixed;top:0;left:0;width:100%;height:100vh;background:${DARK};z-index:999;padding:80px 30px 30px;display:flex;flex-direction:column;overflow-y:auto;}
        .k01-mobile-overlay a{color:${WHITE};font-family:${FONT};font-size:18px;font-weight:500;text-decoration:none;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.1);transition:color 0.2s;}
        .k01-mobile-overlay a:hover{color:${SILVER};}
        .k01-mobile-close{position:absolute;top:20px;right:20px;background:none;border:none;cursor:pointer;color:${WHITE};width:30px;height:30px;}
      `}</style>

      <header
        className="k01-header"
        data-template="klempir-01"
        style={{ backgroundColor: navBg, boxShadow: navShadow }}
      >
        <div className="k01-inner">
          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }} aria-label={siteName}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="relative overflow-hidden" style={{ height: 50 }}>
                <img
                  src={logoUrl} alt={siteName}
                  style={{ height: 50, width: "auto", objectFit: "contain", display: "block", filter: logoFilter, transition: "filter 0.3s ease" }}
                />
              </GenericEditableImage>
            ) : (
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: isLight ? DARK : WHITE, letterSpacing: "0.3px", whiteSpace: "nowrap", transition: "color 0.3s" }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="k01-menu-wrap" style={{ display: "flex" }}>
            <ul className="k01-menu">
              {links.map((l, i) => (
                <li key={`${l.href}-${i}`}>
                  <a
                    href={resolve(l.href)}
                    style={{ color: linkColor }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = SILVER; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = linkColor; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: phone + hamburger */}
          <div className="k01-header-right">
            <div className="k01-phone-wrap">
              <a
                className="k01-phone-link"
                href={`tel:${phone.replace(/\s/g, "")}`}
                style={{ color: linkColor }}
              >
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            </div>
            <button
              className="k01-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            >
              {[0, 1, 2].map(n => (
                <span key={n} style={{
                  backgroundColor: isLight ? DARK : WHITE,
                  transform: menuOpen
                    ? n === 0 ? "translateY(7px) rotate(45deg)"
                    : n === 2 ? "translateY(-7px) rotate(-45deg)"
                    : "scaleX(0)"
                    : "none",
                  opacity: menuOpen && n === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div className="k01-mobile-overlay">
          <button className="k01-mobile-close" onClick={() => setMenuOpen(false)} aria-label="Zavřít">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          {links.map((l, i) => (
            <a key={i} href={resolve(l.href)} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ marginTop: 20, color: SILVER, fontWeight: 700 }} onClick={() => setMenuOpen(false)}>{phone}</a>
        </div>
      )}
    </>
  );
}


// ── ucetni-01-navbar ──────────────────────────────────────────────────────────
// 1:1 ucetnictvispravne.cz (post-22.css):
// - bílý (#FFFFFF) navbar, padding 26px 20px, max-width 1320px
// - layout: logo vlevo (30%) | nav links vpravo (70%)
// - logo: tučný textový wordmark "Poctivé účetnictví" 1.9rem bold #000000
// - nav: Space Grotesk 1.2rem 500, #202124, hover #FFB500, gap 30px
// - ŽÁDNÉ CTA tlačítko
// - mobile: logo 80% / hamburger 20%; hamburger → fullscreen yellow overlay
// - font: Space Grotesk
// ─────────────────────────────────────────────────────────────────────────────
function NavbarUcetni01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  const YELLOW = "#FFB500";
  const DARK   = "#202124";
  const BLACK  = "#000000";
  const WHITE  = "#ffffff";
  const FONT   = "'Space Grotesk', Sans-serif";

  const siteName = String(content.siteName ?? "Poctivé účetnictví");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <style>{`
        .ucn01-nav {
          background: ${WHITE};
          font-family: ${FONT};
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }
        .ucn01-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 26px 20px 25px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .ucn01-logo {
          text-decoration: none;
          flex-shrink: 0;
          font-family: ${FONT};
          font-size: 1.9rem;
          font-weight: bold;
          color: ${BLACK};
          line-height: 1.1;
        }
        .ucn01-logo:hover { color: ${BLACK}; }
        .ucn01-links {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 30px;
        }
        .ucn01-links a {
          display: block;
          font-family: ${FONT};
          font-size: 1.2rem;
          font-weight: 500;
          text-transform: capitalize;
          line-height: 1em;
          color: ${DARK};
          text-decoration: none;
          padding: 8px 0;
          transition: color 0.2s;
        }
        .ucn01-links a:hover { color: ${YELLOW}; }
        .ucn01-burger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          flex-shrink: 0;
        }
        .ucn01-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: ${WHITE};
          flex-direction: column;
          padding: 24px 20px;
        }
        .ucn01-overlay.open { display: flex; }
        .ucn01-overlay-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .ucn01-overlay-head button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .ucn01-overlay-body {
          display: flex;
          flex-direction: column;
        }
        .ucn01-overlay-body a {
          display: block;
          font-family: ${FONT};
          font-size: 1.4rem;
          font-weight: 500;
          text-transform: capitalize;
          color: ${DARK};
          text-decoration: none;
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;
          transition: color 0.2s;
        }
        .ucn01-overlay-body a:hover { color: ${YELLOW}; }
        @media (max-width: 1024px) {
          .ucn01-links { gap: calc(43px / 2); }
          .ucn01-inner { padding: 20px 20px; }
        }
        @media (max-width: 767px) {
          .ucn01-links { display: none; }
          .ucn01-burger { display: flex; }
          .ucn01-logo { font-size: 1.6rem; }
        }
      `}</style>

      <nav className="ucn01-nav" data-template="ucetni-01-navbar">
        <div className="ucn01-inner">
          <a href={resolve("/")} className="ucn01-logo" aria-label={siteName}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </a>

          <ul className="ucn01-links">
            {links.map((link, i) => (
              <li key={i}>
                <a href={resolve(link.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <button className="ucn01-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className={`ucn01-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="ucn01-overlay-head">
          <span style={{ fontFamily: FONT, fontSize: "1.6rem", fontWeight: "bold", color: BLACK }}>
            {siteName}
          </span>
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLACK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="ucn01-overlay-body">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

// ── florist-01-navbar ─────────────────────────────────────────────────────────
// 1:1 freja.cz:
// - Topbar #121212 bg, Arimo font, 13px: 3 messages desktop / rotating slide mobile (2s interval)
// - Sticky white header, NO border, padding 10px 3rem mobile / 20px 3rem desktop
// - Logo: 170×75px "Flóra" SVG wordmark (Georgia serif italic, matching freja proportions)
// - Nav links centered: Arimo, rgba(18,18,18,0.75), hover full opacity, padding 8px 16px
// - Right (desktop): "Čeština ▾" lang, search icon, account icon, cart icon (freja SVGs 1:1)
// - Mobile: hamburger (freja SVG) → fullscreen white drawer with nav links
function NavbarFlorist01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  // freja.cz exact colors
  const FG      = "rgb(18,18,18)";         // color-scheme-1 foreground
  const FG75    = "rgba(18,18,18,0.75)";   // nav link default
  const WHITE   = "#ffffff";
  const TOPBG   = "#121212";               // color-scheme-4 background
  const TOPFG   = "rgba(255,255,255,0.75)"; // topbar text
  const ARIMO   = "Arimo, Arial, sans-serif";

  const siteName    = String(content.siteName    ?? "Flóra Květinářství");
  const logoUrl     = String(content.logoUrl     ?? "");
  const logoText    = String(content.logoText    ?? "Flóra");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];
  const topMessages = (content.topMessages as string[]) ?? [
    "⏰ Objednejte do 16:00 — doručíme dnes!",
    "🚚 Doprava zdarma od 2 000 Kč",
    "📞 Zavolejte nám — 704 123 456",
  ];

  useEffect(() => {
    if (topMessages.length < 2) return;
    const t = setInterval(() => setMsgIdx(i => (i + 1) % topMessages.length), 2000);
    return () => clearInterval(t);
  }, [topMessages.length]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  // Logo 170×75px matching freja.cz proportions — "Flóra" in script serif
  const LogoMark = () => {
    if (logoUrl) return <img loading="eager" src={logoUrl} alt={siteName} style={{ width: 187, height: 83, objectFit: "contain" }} />;
    return (
      <svg width="187" height="83" viewBox="0 0 170 75" xmlns="http://www.w3.org/2000/svg" aria-label={siteName} style={{ display: "block" }}>
        <text x="6" y="55" fontFamily="Georgia,serif" fontSize="52" fontStyle="italic" fontWeight="400" fill={FG} letterSpacing="-1">
          <tspan>{logoText}</tspan>
        </text>
        <text x="8" y="70" fontFamily="Arimo,Arial,sans-serif" fontSize="9.5" fontWeight="400" fill={FG75} letterSpacing="5">KVĚTINÁŘSTVÍ</text>
      </svg>
    );
  };

  // freja.cz exact SVG icons
  const SearchIcon = () => (
    <svg fill="none" viewBox="0 0 18 19" width="20" height="20" aria-hidden="true" style={{ display: "block" }}>
      <path fill="currentColor" fillRule="evenodd" d="M11.03 11.68A5.784 5.784 0 1 1 2.85 3.5a5.784 5.784 0 0 1 8.18 8.18m.26 1.12a6.78 6.78 0 1 1 .72-.7l5.4 5.4a.5.5 0 1 1-.71.7z" clipRule="evenodd"/>
    </svg>
  );
  const AccountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 19" width="20" height="20" aria-hidden="true" style={{ display: "block" }}>
      <path fill="currentColor" fillRule="evenodd" d="M6 4.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8m5.58 12.15c1.12.82 1.83 2.24 1.91 4.85H1.51c.08-2.6.79-4.03 1.9-4.85C4.66 11.75 6.5 11.5 9 11.5s4.35.26 5.58 1.15M9 10.5c-2.5 0-4.65.24-6.17 1.35C1.27 12.98.5 14.93.5 18v.5h17V18c0-3.07-.77-5.02-2.33-6.15-1.52-1.1-3.67-1.35-6.17-1.35" clipRule="evenodd"/>
    </svg>
  );
  const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" width="20" height="20" aria-hidden="true" style={{ display: "block" }}>
      <path fill="currentColor" fillRule="evenodd" d="M15.75 11.8h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33L28.4 11.8zm0 1h-2.22l-.71 10.67a4 4 0 0 0 3.99 4.27h7.38a4 4 0 0 0 4-4.27l-.72-10.67h-2.22v.63a4.75 4.75 0 1 1-9.5 0zm8.5 0h-7.5v.63a3.75 3.75 0 1 0 7.5 0z"/>
    </svg>
  );
  const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16" width="18" height="16" aria-hidden="true">
      <path fill="currentColor" d="M1 .5a.5.5 0 1 0 0 1h15.71a.5.5 0 0 0 0-1zM.5 8a.5.5 0 0 1 .5-.5h15.71a.5.5 0 0 1 0 1H1A.5.5 0 0 1 .5 8m0 7a.5.5 0 0 1 .5-.5h15.71a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5"/>
    </svg>
  );
  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 17" width="18" height="17" aria-hidden="true">
      <path fill="currentColor" d="M.865 15.978a.5.5 0 0 0 .707.707l7.433-7.431 7.579 7.282a.501.501 0 0 0 .846-.37.5.5 0 0 0-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 1 0-.707-.708L8.991 7.853 1.413.573a.5.5 0 1 0-.693.72l7.563 7.268z"/>
    </svg>
  );
  const CaretIcon = () => (
    <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" style={{ display: "inline", marginLeft: 4, verticalAlign: "middle" }}>
      <path fill="currentColor" fillRule="evenodd" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708" clipRule="evenodd"/>
    </svg>
  );

  const iconBtnStyle: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer",
    color: FG, padding: "8px", display: "flex", alignItems: "center",
    lineHeight: 1,
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;700&display=swap" />
      <style>{`        .f01-hamburger { display: flex; }
        .f01-mobile-logo { display: block; }
        .f01-desktop-nav { display: none; }
        .f01-desktop-icons { display: none; }
        .f01-mobile-icons { display: flex; }
        .f01-inner { padding-top: 10px; padding-bottom: 10px; }
        .f01-topbar-desktop { display: none; }
        .f01-topbar-mobile { display: flex; }
        @media (min-width: 768px) {
          .f01-topbar-desktop { display: flex; }
          .f01-topbar-mobile { display: none; }
        }
        @media (min-width: 1024px) {
          .f01-hamburger { display: none !important; }
          .f01-mobile-logo { display: none !important; }
          .f01-desktop-nav { display: flex; }
          .f01-desktop-icons { display: flex; }
          .f01-mobile-icons { display: none !important; }
          .f01-inner { padding-top: 20px; padding-bottom: 20px; }
        }
      `}</style>

      {/* ── Topbar ── #121212 bg, Arimo 13px, white text */}
      <div style={{ backgroundColor: TOPBG, fontFamily: ARIMO, fontSize: 13, lineHeight: 1.4 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 3rem" }}>
          <div className="f01-topbar-desktop" style={{ justifyContent: "space-between", alignItems: "center" }}>
            {topMessages.map((msg, i) => (
              <span key={i} style={{ color: TOPFG }}>
                <GenericEditableText sectionId={sectionId} field={`topMessages.${i}`} value={msg} tag="span" />
              </span>
            ))}
          </div>
          <div className="f01-topbar-mobile" style={{ justifyContent: "center", textAlign: "center", height: 18, overflow: "hidden" }}>
            <span style={{ color: TOPFG }}>
              <GenericEditableText sectionId={sectionId} field={`topMessages.${msgIdx}`} value={topMessages[msgIdx] ?? ""} tag="span" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Sticky header ── white, NO border */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: WHITE, fontFamily: ARIMO }} data-template="florist-01">
        <div className="f01-inner" style={{ maxWidth: 1200, margin: "0 auto", paddingLeft: "3rem", paddingRight: "3rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>

          {/* Hamburger — mobile only */}
          <button className="f01-hamburger" aria-label={open ? "Zavřít menu" : "Nabídka"} onClick={() => setOpen(!open)} style={{ ...iconBtnStyle, marginLeft: "-8px" }}>
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>

          {/* Logo + nav left group */}
          <div className="f01-desktop-nav" style={{ alignItems: "center", gap: 0, flex: 1 }}>
            <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", flexShrink: 0, lineHeight: 0, marginRight: 8 }}>
              <LogoMark />
            </a>
            {links.map((l, i) => (
              <a key={`${l.href}-${i}`} href={resolve(l.href)}
                style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", fontFamily: ARIMO, fontSize: 16, fontWeight: 400, color: FG75, textDecoration: "none", transition: "color 0.15s", letterSpacing: "0.01em" }}
                onMouseEnter={e => { e.currentTarget.style.color = FG; }}
                onMouseLeave={e => { e.currentTarget.style.color = FG75; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                {i === 0 && <CaretIcon />}
              </a>
            ))}
          </div>

          {/* Mobile: logo center */}
          <a className="f01-mobile-logo" href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", lineHeight: 0, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <LogoMark />
          </a>

          {/* Desktop right icons */}
          <div className="f01-desktop-icons" style={{ alignItems: "center", gap: 0, flexShrink: 0 }}>
            <button style={{ ...iconBtnStyle, gap: 3, color: FG75 }} aria-label="Jazyk">
              <span style={{ fontFamily: ARIMO, fontSize: 13.8 }}>Čeština</span>
              <CaretIcon />
            </button>
            <button style={iconBtnStyle} aria-label="Hledání"><SearchIcon /></button>
            <button style={iconBtnStyle} aria-label="Přihlásit se"><AccountIcon /></button>
          </div>

          {/* Mobile right: search + cart */}
          <div className="f01-mobile-icons" style={{ alignItems: "center", gap: 0 }}>
            <button style={iconBtnStyle} aria-label="Hledání"><SearchIcon /></button>
            <button style={iconBtnStyle} aria-label="Košík"><CartIcon /></button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer — fullscreen white, from left */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: WHITE, overflowY: "auto" }}
          role="dialog"
          aria-modal="true"
          aria-label="Nabídka"
        >
          {/* Drawer header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 1.5rem", borderBottom: "1px solid rgba(18,18,18,0.08)" }}>
            <LogoMark />
            <button
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
              style={{ ...iconBtnStyle, marginRight: "-8px" }}
            >
              <CloseIcon />
            </button>
          </div>
          {/* Drawer nav */}
          <nav style={{ padding: "0 1.5rem" }}>
            {links.map((l, i) => (
              <a
                key={`mob-${i}`}
                href={resolve(l.href)}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 0",
                  fontFamily: ARIMO, fontSize: 16, fontWeight: 400,
                  color: FG75, textDecoration: "none",
                  borderBottom: "1px solid rgba(18,18,18,0.08)",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                {i === 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10" width="14" height="10" aria-hidden="true">
                    <path fill="currentColor" fillRule="evenodd" d="M8.537.808a.5.5 0 0 1 .817-.162l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L11.793 5.5H1a.5.5 0 0 1 0-1h10.793L8.646 1.354a.5.5 0 0 1-.109-.546" clipRule="evenodd"/>
                  </svg>
                )}
              </a>
            ))}
          </nav>
          {/* Drawer footer: language */}
          <div style={{ padding: "24px 1.5rem", borderTop: "1px solid rgba(18,18,18,0.08)", marginTop: 16 }}>
            <button style={{ ...iconBtnStyle, fontSize: 13, gap: 4, color: FG75 }}>
              <span style={{ fontFamily: ARIMO }}>Čeština</span>
              <CaretIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── tawan-01-navbar ──────────────────────────────────────────────────────────
// Fixed overlay nad hero videom — ŽÁDNÝ spacer (hero jde od top: 0)
// Layout: [hamburger + "Menu"] | [logo centrovaný abs.] | [Poukazy + Rezervace]
// Tlačítka: asymetrický radius TL 16px + BR 16px (1:1 tawan.cz)
// Overlay menu: fullscreen purple, velké light links + CTA dole
// ─────────────────────────────────────────────────────────────────────────────
function NavbarTawan01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName    = String(content.siteName    ?? "Demo TAWAN");
  const ctaText     = String(content.ctaText     ?? "Rezervace");
  const ctaHref     = String(content.ctaHref     ?? "#kontakt");
  const voucherText = String(content.voucherText ?? "Dárkové poukazy");
  const voucherHref = String(content.voucherHref ?? "#kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const PURPLE = "#393145";
  const BRONZE = "#af8c6a";
  const WHITE  = "#ffffff";
  const FONT   = "'Muli', sans-serif";

  // asymetrický radius 1:1 tawan.cz
  const btnRadius = "16px 0 16px 0";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const navBg   = scrolled ? "#ffffff" : "transparent";
  const navText = scrolled ? PURPLE : WHITE;
  const navShadow = scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none";

  return (
    <>
      <style>{`@media(max-width:768px){.tawan-nav-cta{display:none!important}}`}</style>
      {/* Navbar — fixní transparentní overlay nad hero video */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: navBg, boxShadow: navShadow, transition: "background-color 0.3s ease, box-shadow 0.3s ease", fontFamily: FONT }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 24px", height: 83, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>

          {/* Hamburger + "Menu" text */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "8px 0", color: navText, transition: "color 0.3s" }}
          >
            <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: "block", width: 22, height: 1.5, backgroundColor: navText, transition: "background-color 0.3s" }} />
              ))}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: navText, transition: "color 0.3s" }}>
              Menu
            </span>
          </button>

          {/* Logo — absolutně centrovaný */}
          <a
            href={resolve("/")}
            aria-label={siteName}
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" }}
          >
            <img
              src="/clones/tawan/themes/custom/awesome/src/img/logo.svg"
              alt={siteName}
              style={{ height: 82, display: "block", filter: scrolled ? "invert(1) sepia(1) saturate(0) brightness(0.2)" : "none", transition: "filter 0.3s" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }}
            />
            {/* Fallback textové logo */}
            <span style={{ display: "none", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: navText, letterSpacing: 4, textTransform: "uppercase" }}>{siteName}</span>
              <span style={{ fontSize: 9, fontWeight: 300, color: BRONZE, letterSpacing: 3, textTransform: "uppercase" }}>thajské masáže</span>
            </span>
          </a>

          {/* CTA tlačítka — na mobile skrytá (jsou v overlay menu) */}
          <div className="tawan-nav-cta" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href={resolve(voucherHref)}
              style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: 1,
                color: WHITE, textDecoration: "none",
                padding: "0 20px", height: 44, lineHeight: "44px", display: "inline-block",
                backgroundColor: BRONZE, borderRadius: btnRadius, transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c19d7b")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRONZE)}
            >
              <GenericEditableText sectionId={sectionId} field="voucherText" value={voucherText} tag="span" />
            </a>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: 1,
                color: WHITE, textDecoration: "none",
                padding: "0 20px", height: 44, lineHeight: "44px", display: "inline-block",
                backgroundColor: BRONZE, borderRadius: btnRadius, transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c19d7b")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRONZE)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </nav>

      {/* Overlay menu — fullscreen purple */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: PURPLE,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Zavřít */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Zavřít menu"
          style={{ position: "absolute", top: 0, left: 24, height: 83, display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", color: WHITE, fontFamily: FONT }}
        >
          <span style={{ fontSize: 20 }}>✕</span>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Zavřít</span>
        </button>

        {/* Logo v overlay */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: 83, display: "flex", alignItems: "center" }}>
          <img loading="eager" src="/clones/tawan/themes/custom/awesome/src/img/logo.svg" alt={siteName} style={{ height: 36 }} />
        </div>

        {/* Nav links */}
        <nav>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, textAlign: "center" }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: FONT, fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 300, color: WHITE, textDecoration: "none", letterSpacing: 1, display: "block", padding: "10px 0", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = BRONZE)}
                  onMouseLeave={e => (e.currentTarget.style.color = WHITE)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom CTA */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 16 }}>
          <a href={resolve(voucherHref)} onClick={() => setMenuOpen(false)}
            style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: WHITE, textDecoration: "none", padding: "0 24px", height: 44, lineHeight: "44px", display: "inline-block", backgroundColor: BRONZE, borderRadius: btnRadius }}>
            {voucherText}
          </a>
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setMenuOpen(false)}
              style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: PURPLE, textDecoration: "none", padding: "12px 24px", backgroundColor: BRONZE }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
      </div>
    </>
  );
}

// ── ananda-01-navbar ─────────────────────────────────────────────────────────
// 1. Modrý promo bar (fixní, full-width) — voucher CTA
// 2. Gold navbar (fixní, pod promo barem) — logo vlevo, linky vpravo, pill CTA
// Mobile: hamburger vlevo + logo střed → fullscreen gold overlay
// Ref: anandaspa.cz — bg-gold-1000 #AA813A + bg-blue-1000 #2A9ABC
// ─────────────────────────────────────────────────────────────────────────────
function NavbarAnanda01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;

  const siteName     = String(content.siteName     ?? "Demo Ananda SPA");
  const promoText    = String(content.promoText     ?? "Vyberte si z nabídky našich voucherů a");
  const promoBold    = String(content.promoBold     ?? "darujte pravou ájurvédu");
  const promoHref    = String(content.promoHref     ?? "#voucher");
  const ctaText      = String(content.ctaText       ?? "REZERVOVAT");
  const ctaHref      = String(content.ctaHref       ?? "#kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const GOLD    = "#AA813A";
  const BLUE    = "#2A9ABC";
  const WHITE   = "#ffffff";
  const FONT    = "'Jost', sans-serif";
  const PROMO_H = 40; // px
  const NAV_H   = 68; // px

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  // Demo SVG logo — "ANANDA" gold wordmark
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="44" viewBox="0 0 160 44"><text x="0" y="30" font-family="Jost,Arial,sans-serif" font-size="26" font-weight="600" letter-spacing="5" fill="white">ANANDA</text><text x="2" y="43" font-family="Jost,Arial,sans-serif" font-size="9" font-weight="300" letter-spacing="4" fill="rgba(255,255,255,0.75)">AYURVÉDA &amp; SPA</text></svg>`;
  const logoUrl  = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap" />
      <style>{`        .ananda-nav-links a { color: ${WHITE}; text-decoration: none; font-family: ${FONT}; font-size: 14px; font-weight: 400; letter-spacing: 0.5px; transition: opacity 0.2s; white-space: nowrap; }
        .ananda-nav-links a:hover { opacity: 0.75; }
        @media(max-width: 1024px) { .ananda-nav-links { display: none !important; } .ananda-nav-cta-desktop { display: none !important; } }
        @media(min-width: 1025px) { .ananda-hamburger { display: none !important; } }
      `}</style>

      {/* 1. Promo bar */}
      <a
        href={resolve(promoHref)}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 110,
          height: PROMO_H, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          backgroundColor: BLUE, color: WHITE,
          fontFamily: FONT, fontSize: 15.5, fontWeight: 400, textDecoration: "none",
          textAlign: "center", padding: "0 16px",
        }}
      >
        <GenericEditableText sectionId={sectionId} field="promoText" value={promoText} tag="span" />&nbsp;<strong style={{ fontWeight: 700 }}><GenericEditableText sectionId={sectionId} field="promoBold" value={promoBold} tag="span" /></strong>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 9" style={{ height: 8, marginLeft: 6 }}>
          <path stroke="white" strokeWidth="1" d="M27.5,9l-.6-.6,3.4-3.4H0v-.9h30.3l-3.4-3.4L27.5,0,32,4.5Z" fill="none"/>
        </svg>
      </a>

      {/* 2. Navbar */}
      <nav style={{
        position: "fixed", top: PROMO_H, left: 0, right: 0, zIndex: 100,
        height: NAV_H, backgroundColor: GOLD,
        fontFamily: FONT,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Hamburger (mobile) */}
          <button
            className="ananda-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 0", display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: "block", width: 22, height: 1.5, backgroundColor: WHITE }} />
            ))}
          </button>

          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44 }} />
          </a>

          {/* Nav linky (desktop) */}
          <div className="ananda-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map((link, i) => (
              <a key={i} href={resolve(link.href)}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
              </a>
            ))}
          </div>

          {/* CTA (desktop) */}
          <a
            className="ananda-nav-cta-desktop"
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{
              fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 2,
              textTransform: "uppercase", color: WHITE, textDecoration: "none",
              padding: "10px 26px", border: `1.5px solid ${WHITE}`, borderRadius: 999,
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = WHITE; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </nav>

      {/* Bez spaceru — hero sekce začíná na top:0, navbar leží fixně nahoře (1:1 anandaspa.cz) */}

      {/* Fullscreen mobile overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: GOLD,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }}>
        {/* Zavřít */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Zavřít menu"
          style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", cursor: "pointer", color: WHITE, fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}
        >
          <span style={{ fontSize: 18 }}>✕</span> ZAVŘÍT
        </button>

        {/* Logo v overlay */}
        <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, marginBottom: 40 }} />

        {/* Nav linky */}
        <nav>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, textAlign: "center" }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: FONT, fontSize: "clamp(22px, 4vw, 42px)", fontWeight: 300, color: WHITE, textDecoration: "none", display: "block", padding: "10px 0", transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rezervovat CTA */}
        <a
          href={resolve(ctaHref)}
          data-btn="primary"
          onClick={() => setMenuOpen(false)}
          style={{ marginTop: 36, fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: GOLD, backgroundColor: WHITE, textDecoration: "none", padding: "14px 36px", borderRadius: 999 }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </>
  );
}

// ── tawan-02-navbar ──────────────────────────────────────────────────────────
// Announcement bar (#604B3A, 40px) + fixed navbar (transparent → #3C2F25 on scroll)
// Layout: [hamburger "Menu"] | [logo center abs.] | [Poukazy + Rezervace]
// Overlay menu: fullscreen #604B3A, velké cream links
// Ref: escapemassage.cz — Candara font, warm brown palette
// ─────────────────────────────────────────────────────────────────────────────
function NavbarTawan02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName      = String(content.siteName      ?? "Demo Escape Massage");
  const ctaText       = String(content.ctaText       ?? "Rezervace");
  const ctaHref       = String(content.ctaHref       ?? "#kontakt");
  const voucherText   = String(content.voucherText   ?? "Dárkové poukazy");
  const voucherHref   = String(content.voucherHref   ?? "#voucher");
  const announcementText = String(content.announcementText ?? "⚡ Online rezervace — zajistěte si svůj termín ještě dnes!");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const DARK   = "#604B3A";
  const BROWN  = "#3C2F25";
  const ACCENT = "#AD8F78";
  const CREAM  = "#D8CABF";
  const WHITE  = "#ffffff";
  const FONT   = "Candara, 'Candara Regular', Georgia, serif";

  const [menuOpen, setMenuOpen]         = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [announceVisible, setAnnounceVisible] = useState(true);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setAnnounceVisible(y < 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const navBg     = scrolled ? BROWN : "transparent";
  const navShadow = scrolled ? "0 2px 12px rgba(0,0,0,0.18)" : "none";
  const barH      = announceVisible ? 40 : 0;

  // Demo SVG logo — proporce 487:250 (~1.95:1), lotus motiv + elegantní serif
  // Světlá verze (na tmavém/průhledném pozadí) + tmavá verze (při scrollu na bílém)
  const mkLogo = (textColor: string, subColor: string, petalColor: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="194" height="100" viewBox="0 0 194 100">
      <!-- Lotus / květ: 5 okvětních lístků kolem středu -->
      <g transform="translate(97,28)">
        <!-- střed -->
        <circle cx="0" cy="0" r="4" fill="${petalColor}" opacity="0.9"/>
        <!-- lístky: horní, pravý, dolní, levý, diagonály -->
        <ellipse cx="0" cy="-13" rx="4" ry="8" fill="${petalColor}" opacity="0.75" transform="rotate(0)"/>
        <ellipse cx="0" cy="-13" rx="4" ry="8" fill="${petalColor}" opacity="0.75" transform="rotate(72)"/>
        <ellipse cx="0" cy="-13" rx="4" ry="8" fill="${petalColor}" opacity="0.75" transform="rotate(144)"/>
        <ellipse cx="0" cy="-13" rx="4" ry="8" fill="${petalColor}" opacity="0.75" transform="rotate(216)"/>
        <ellipse cx="0" cy="-13" rx="4" ry="8" fill="${petalColor}" opacity="0.75" transform="rotate(288)"/>
      </g>
      <!-- Hlavní název -->
      <text x="97" y="66" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="30" font-weight="400" letter-spacing="10" fill="${textColor}">ESCAPE</text>
      <!-- Podtitul s ornamenty -->
      <text x="97" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="9.5" font-weight="300" letter-spacing="5" fill="${subColor}">✦  THAJSKÉ MASÁŽE  ✦</text>
    </svg>`;

  const logoUrl     = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mkLogo("#ffffff", "rgba(217,202,191,0.9)", "rgba(217,202,191,0.85)"))}`;
  const logoDarkUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mkLogo("#3C2F25", "#927259", "#AD8F78"))}`;

  return (
    <>
      <style>{`
        .t02-nav-cta { display: flex; }
        @media(max-width: 900px) { .t02-nav-cta { display: none !important; } }
        .t02-menu-link:hover { color: ${ACCENT} !important; }
      `}</style>

      {/* Announcement bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 101,
        height: barH, overflow: "hidden",
        backgroundColor: DARK, color: CREAM,
        fontFamily: FONT, fontSize: 15, letterSpacing: 0.5,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "height 0.3s ease",
        pointerEvents: announceVisible ? "auto" : "none",
      }}>
        <GenericEditableText sectionId={sectionId} field="announcementText" value={announcementText} tag="span" />
      </div>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: barH, left: 0, right: 0, zIndex: 100,
        backgroundColor: navBg, boxShadow: navShadow,
        transition: "top 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
        fontFamily: FONT,
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 28px", height: 108, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>

          {/* Hamburger + Menu text */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}
          >
            <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: "block", width: i === 2 ? 16 : 24, height: 1.5, backgroundColor: scrolled ? ACCENT : WHITE }} />
              ))}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: scrolled ? ACCENT : WHITE }}>
              Menu
            </span>
          </button>

          {/* Logo — centrovaný absolutně */}
          <a
            href={resolve("/")}
            aria-label={siteName}
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textDecoration: "none" }}
          >
            <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 89, display: "block" }} />
          </a>

          {/* CTA tlačítka — outline styl */}
          <div className="t02-nav-cta" style={{ gap: 12, alignItems: "center" }}>
            <a
              href={resolve(voucherHref)}
              style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                color: scrolled ? ACCENT : CREAM, textDecoration: "none",
                padding: "0 22px", height: 42, lineHeight: "40px", display: "inline-block",
                backgroundColor: "transparent",
                border: `1.5px solid ${scrolled ? ACCENT : CREAM}`,
                borderRadius: "8px",
                transition: "color 0.2s, border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = scrolled ? "rgba(146,114,89,0.12)" : "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <GenericEditableText sectionId={sectionId} field="voucherText" value={voucherText} tag="span" />
            </a>
            <a
              href={resolve(ctaHref)}
              data-btn="inverse"
              style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                color: scrolled ? ACCENT : CREAM, textDecoration: "none",
                padding: "0 22px", height: 42, lineHeight: "40px", display: "inline-block",
                backgroundColor: "transparent",
                border: `1.5px solid ${scrolled ? ACCENT : CREAM}`,
                borderRadius: "8px",
                transition: "color 0.2s, border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = scrolled ? "rgba(146,114,89,0.12)" : "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </nav>

      {/* Fullscreen overlay menu */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: DARK,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }}>
        {/* Zavřít */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Zavřít menu"
          style={{ position: "absolute", top: 0, left: 28, height: 80, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: CREAM, fontFamily: FONT }}
        >
          <span style={{ fontSize: 18 }}>✕</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>Zavřít</span>
        </button>

        {/* Logo v overlay */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", height: 88, display: "flex", alignItems: "center" }}>
          <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 56 }} />
        </div>

        {/* Nav linky */}
        <nav>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, textAlign: "center" }}>
            {links.map((link, i) => (
              <li key={i} style={{ margin: "4px 0" }}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  className="t02-menu-link"
                  style={{ fontFamily: FONT, fontSize: "clamp(26px, 4vw, 48px)", fontWeight: 400, color: CREAM, textDecoration: "none", letterSpacing: 2, display: "block", padding: "8px 0", transition: "color 0.2s" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom CTA */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 14 }}>
          <a href={resolve(voucherHref)} onClick={() => setMenuOpen(false)}
            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BROWN, textDecoration: "none", padding: "0 24px", height: 44, lineHeight: "44px", display: "inline-block", backgroundColor: CREAM, borderRadius: "4px" }}>
            {voucherText}
          </a>
          <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setMenuOpen(false)}
            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "0 24px", height: 44, lineHeight: "44px", display: "inline-block", backgroundColor: ACCENT, borderRadius: "4px" }}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── tattoo-01-navbar ─────────────────────────────────────────────────────────
// Černý fixed navbar — tribo.cz inspired & vylepšen
// Layout: logo vlevo | nav linky uprostřed flex-end | 2× CTA (Objednat se + E-SHOP)
// Desktop výška 72px; bílé logo na černém bg; červená (#ff5c4b) pro CTA + hover
// Mobile: fullscreen černé overlay menu s velkými linky
// ─────────────────────────────────────────────────────────────────────────────
function NavbarTattoo01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const siteName   = String(content.siteName   ?? "Demo TRIBO Studio");
  const logoUrl    = String(content.logoUrl    ?? "");
  const ctaText    = String(content.ctaText    ?? "Objednat se");
  const ctaHref    = String(content.ctaHref    ?? "#kontakt");
  const shopHref   = String((content as Record<string,unknown>).shopHref   ?? "#");
  const shopText   = String((content as Record<string,unknown>).shopText   ?? "E-SHOP");
  const links      = (content.links as Array<{ label: string; href: string }>) ?? [];

  // Bílé logo pro tmavý podklad
  const whiteLogoUrl = logoUrl
    ? logoUrl.replace(/logo\.svg$/, "logo-white.svg")
    : "/templates/tattoo-01/logo-white.svg";
  const logoSrc = whiteLogoUrl;

  const ACCENT  = "#ff5c4b";
  const BG      = "#0a0a0a";
  const NAVTEXT = "rgba(255,255,255,0.82)";

  return (
    <>
      {/* spacer */}
      <div style={{ height: 79 }} aria-hidden />

      <header
        data-template="tattoo-01"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: BG,
        }}
      >
        {/* Tenká červená linka úplně nahoře — branding akcent */}
        <div style={{ height: 3, backgroundColor: ACCENT, width: "100%" }} aria-hidden />

        {/* Desktop bar */}
        <div
          className="hidden md:flex items-center max-w-[1360px] mx-auto"
          style={{ height: 76, padding: "0 40px", gap: 0 }}
        >
          {/* Logo vlevo */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            aria-label={siteName}
            style={{ flexShrink: 0, marginRight: 48 }}
          >
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative">
              <img
                src={logoSrc}
                alt={siteName}
                style={{ height: 50, width: "auto", objectFit: "contain", maxWidth: 220 }}
              />
            </GenericEditableImage>
          </a>

          {/* Nav linky — flex-1 zarovnané vlevo */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32, flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`t01-nav-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: "'Arial Narrow', Arial, Helvetica, sans-serif",
                  fontSize: "0.864rem",
                  fontWeight: 700,
                  color: NAVTEXT,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={e => (e.currentTarget.style.color = NAVTEXT)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Pravý blok — 2 CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* E-SHOP — ghost outline */}
            <a
              href={resolveDemoHref(shopHref, tenantSlug, isAdmin)}
              style={{
                display: "inline-flex", alignItems: "center",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.75)",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "8px 18px",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
              }}
            >
              <GenericEditableText sectionId={sectionId} field="shopText" value={shopText} tag="span" />
            </a>

            {/* Objednat se — červená filled */}
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              style={{
                display: "inline-flex", alignItems: "center",
                backgroundColor: ACCENT,
                color: "#ffffff",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "9px 20px",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e04a3a")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>

        {/* Mobile bar */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{ height: 62, padding: "0 20px" }}
        >
          <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName}>
            <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 38, width: "auto", objectFit: "contain" }} />
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 4px",
              display: "flex", flexDirection: "column", gap: 6,
            }}
          >
            <span style={{
              display: "block", width: 24, height: 1.5,
              backgroundColor: open ? ACCENT : "#ffffff",
              transform: open ? "translateY(7.5px) rotate(45deg)" : "none",
              transition: "transform 0.25s, background 0.2s",
            }} />
            <span style={{
              display: "block", width: 24, height: 1.5,
              backgroundColor: "#ffffff",
              opacity: open ? 0 : 1,
              transition: "opacity 0.2s",
            }} />
            <span style={{
              display: "block", width: 24, height: 1.5,
              backgroundColor: open ? ACCENT : "#ffffff",
              transform: open ? "translateY(-7.5px) rotate(-45deg)" : "none",
              transition: "transform 0.25s, background 0.2s",
            }} />
          </button>
        </div>

        {/* Mobile fullscreen overlay */}
        {open && (
          <div
            className="md:hidden"
            style={{
              position: "fixed", top: 65, left: 0, right: 0, bottom: 0,
              backgroundColor: "#0a0a0a",
              display: "flex", flexDirection: "column",
              padding: "32px 24px 40px",
              overflowY: "auto",
              zIndex: 49,
            }}
          >
            {/* Nav linky — velké */}
            {links.map((l, i) => (
              <a
                key={`t01-mob-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "18px 0",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  lineHeight: 1,
                }}
              >
                {l.label}
              </a>
            ))}

            {/* CTA buttons dole */}
            <div style={{ marginTop: "auto", paddingTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                data-btn="primary"
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "16px 24px",
                  backgroundColor: ACCENT, color: "#ffffff",
                  textAlign: "center", fontWeight: 800,
                  fontSize: "0.82rem", textTransform: "uppercase",
                  letterSpacing: "0.12em", textDecoration: "none",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <a
                href={resolveDemoHref(shopHref, tenantSlug, isAdmin)}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "14px 24px",
                  border: "1px solid rgba(255,255,255,0.4)", color: "rgba(255,255,255,0.8)",
                  textAlign: "center", fontWeight: 700,
                  fontSize: "0.78rem", textTransform: "uppercase",
                  letterSpacing: "0.12em", textDecoration: "none",
                }}
              >
                E-SHOP
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

// ── tattoo-02-navbar ─────────────────────────────────────────────────────────
// Bílý fixed navbar — homietattoo.cz inspired
// Layout: [logo vlevo] | [nav linky flex-1] | [CTA "Objednat se" zlaté]
// Topbar: kontaktní info (tel + adresa) na tmavém pruhu nahoře
// Desktop výška topbar 36px + nav 72px; Mobile: overlay menu bílé/tmavé
// ─────────────────────────────────────────────────────────────────────────────
function NavbarTattoo02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  const siteName = String(content.siteName ?? "Demo Homie Tattoo");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Objednat se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const logoSrc = logoUrl || "/templates/tattoo-02/logo.svg";
  const ACCENT = "#BF8A1D";
  const NAV_BG = "#ffffff";

  return (
    <>
      {/* spacer pod fixed navbar */}
      <div style={{ height: 80 }} aria-hidden />

      <header
        data-template="tattoo-02"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        {/* Desktop nav bar */}
        <div
          className="hidden md:flex items-center"
          style={{
            height: 80,
            backgroundColor: NAV_BG,
            borderBottom: "1px solid #e8e8e8",
            padding: "0 48px",
            maxWidth: "100%",
            gap: 0,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Logo vlevo */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            aria-label={siteName}
            style={{ flexShrink: 0, marginRight: 52 }}
          >
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative">
              <img
                src={logoSrc}
                alt={siteName}
                style={{ height: 58, width: "auto", objectFit: "contain", maxWidth: 240 }}
              />
            </GenericEditableImage>
          </a>

          {/* Nav linky */}
          <nav style={{ display: "flex", alignItems: "center", gap: 36, flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`t02-nav-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
                onMouseLeave={e => (e.currentTarget.style.color = "#1a1a1a")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA — zlaté */}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: ACCENT,
              color: "#ffffff",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "11px 24px",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a07318")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Mobile bar */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{
            height: 68,
            backgroundColor: NAV_BG,
            borderBottom: "1px solid #e8e8e8",
            padding: "0 20px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
        >
          <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"} aria-label={siteName}>
            <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 46, width: "auto", objectFit: "contain" }} />
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
            aria-expanded={open}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 4px",
              display: "flex", flexDirection: "column", gap: 5,
            }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: "block", width: 24, height: 2,
                  backgroundColor: open && i === 1 ? "transparent" : "#1a1a1a",
                  transform: open && i === 0 ? "translateY(7px) rotate(45deg)"
                           : open && i === 2 ? "translateY(-7px) rotate(-45deg)"
                           : "none",
                  transition: "transform 0.25s, background 0.2s",
                }}
              />
            ))}
          </button>
        </div>

        {/* Mobile fullscreen overlay */}
        {open && (
          <div
            className="md:hidden"
            style={{
              position: "fixed", top: 68, left: 0, right: 0, bottom: 0,
              backgroundColor: "#1a1a1a",
              display: "flex", flexDirection: "column",
              padding: "28px 24px 40px",
              overflowY: "auto",
              zIndex: 49,
            }}
          >
            {links.map((l, i) => (
              <a
                key={`t02-mob-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "18px 0",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  lineHeight: 1,
                }}
              >
                {l.label}
              </a>
            ))}
            <div style={{ marginTop: "auto", paddingTop: 32 }}>
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                data-btn="primary"
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "16px 24px",
                  backgroundColor: ACCENT, color: "#ffffff",
                  textAlign: "center", fontWeight: 800,
                  fontSize: "0.82rem", textTransform: "uppercase",
                  letterSpacing: "0.12em", textDecoration: "none",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}

function resolveNavHref(href: string, siteMode: string, tenantSlug?: string, isAdmin = false) {
  if (siteMode === "onepage") {
    if (href.startsWith("/#")) return resolveDemoHref("/", tenantSlug, isAdmin) + href.slice(1);
    if (href === "/" || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return resolveDemoHref(href, tenantSlug, isAdmin);
    const slug = href.replace(/^\//, "");
    return resolveDemoHref("/", tenantSlug, isAdmin) + "#" + slug;
  }
  if (href.startsWith("/#")) {
    const anchor = href.slice(2);
    return resolveDemoHref("/" + anchor, tenantSlug, isAdmin);
  }
  return resolveDemoHref(href, tenantSlug, isAdmin);
}

// ── nails-01-navbar ──────────────────────────────────────────────────────────
// Full-width fixed navbar — soho nails 1:1
// Layout: [nav links vlevo] [logo CENTER] [EN UA pill + CTA vpravo]
// Background: #f4f1e9 (teplá krémová), burgundy #79142b
// Logo: SVG monogram v oválu + "NAILS" + "NAILS & SPA" — vše centrované
// ─────────────────────────────────────────────────────────────────────────────
function NavbarNails01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const siteName = String(content.siteName ?? "Demo Nails Studio");
  const ctaText  = String(content.ctaText  ?? "Objednat se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const CREAM    = "#f4f1e9";
  const BURGUNDY = "#79142b";
  const NAV_H    = 108;

  // Centrovaný text-logo: monogram v oválu + NAILS + NAILS & SPA
  const LogoMark = () => (
    <a
      href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
      aria-label={siteName}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        lineHeight: 1,
      }}
    >
      {/* Monogram oval — +20% */}
      <svg width="58" height="67" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="28" rx="22" ry="26" stroke={BURGUNDY} strokeWidth="1.2"/>
        <ellipse cx="24" cy="28" rx="18" ry="22" stroke={BURGUNDY} strokeWidth="0.6" strokeDasharray="2 2"/>
        <text x="24" y="34" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" fill={BURGUNDY} letterSpacing="0">N</text>
      </svg>
      {/* NAILS text — +20% */}
      <span style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.14rem",
        fontWeight: 700,
        color: BURGUNDY,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        marginTop: 3,
      }}>
        NAILS
      </span>
      {/* NAILS & SPA subtitle — +20% */}
      <span style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: "0.66rem",
        fontWeight: 400,
        color: BURGUNDY,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        opacity: 0.75,
      }}>
        NAILS &amp; SPA
      </span>
    </a>
  );

  return (
    <>
      {/* Static full-width navbar */}
      <header
        data-template="nails-01"
        style={{
          position: "relative",
          backgroundColor: CREAM,
        }}
      >
        {/* Desktop bar — 3 zones: nav | logo | lang+cta */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "flex-end",
            padding: "20px 72px 16px",
          }}
        >
          {/* Zone 1 — Nav links vlevo */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {links.map((l, i) => (
              <a
                key={`n01-nav-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontSize: "0.94rem",
                  fontWeight: 500,
                  color: BURGUNDY,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.55")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Zone 2 — Logo centrovaný */}
          <LogoMark />

          {/* Zone 3 — Lang pills + CTA vpravo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
            {/* EN pill */}
            <span style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.84rem",
              fontWeight: 500,
              color: BURGUNDY,
              border: `1px solid ${BURGUNDY}`,
              borderRadius: 999,
              padding: "6px 16px",
              letterSpacing: "0.06em",
              cursor: "default",
              opacity: 0.75,
            }}>EN</span>
            {/* UA pill */}
            <span style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.84rem",
              fontWeight: 500,
              color: BURGUNDY,
              border: `1px solid ${BURGUNDY}`,
              borderRadius: 999,
              padding: "6px 16px",
              letterSpacing: "0.06em",
              cursor: "default",
              opacity: 0.75,
            }}>UA</span>
            {/* CTA button */}
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                backgroundColor: BURGUNDY, color: "#ffffff",
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: "0.86rem", fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                padding: "11px 26px",
                borderRadius: 999,
                flexShrink: 0,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#5e0e22")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BURGUNDY)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span style={{ fontSize: "0.8em" }}>↗</span>
            </a>
          </div>
        </div>

        {/* Mobile bar */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{ height: 64, padding: "0 18px" }}
        >
          <LogoMark />
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 24, height: 2,
                backgroundColor: BURGUNDY,
                transform: open ? (i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "none") : "none",
                opacity: open && i === 1 ? 0 : 1,
                transition: "transform 0.25s, opacity 0.2s",
              }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: CREAM,
            display: "flex", flexDirection: "column",
            padding: "90px 28px 40px",
            overflowY: "auto",
            zIndex: 49,
          }}
        >
          {links.map((l, i) => (
            <a
              key={`n01-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "18px 0",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: BURGUNDY,
                textDecoration: "none",
                borderBottom: `1px solid rgba(121,20,43,0.12)`,
                lineHeight: 1,
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "0.04em",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              style={{
                display: "block", padding: "16px 24px",
                backgroundColor: BURGUNDY, color: "#ffffff",
                textAlign: "center", fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                borderRadius: 999,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      )}

    </>
  );
}

// ── tattoo-03-navbar ─────────────────────────────────────────────────────────
// Overlay navbar vnořená do hero — magictattoo.cz inspired
// Pozice: relative + marginBottom: -80px (hero se vtáhne pod navbar)
// Transparentní → tmavý #0A0A0E při scrollu přes 50px
// Logo: textový wordmark "DEMO TATTOO" vlevo
// Nav linky: velké (1.05rem), červené CTA vpravo
// ─────────────────────────────────────────────────────────────────────────────
function NavbarTattoo03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener — transparentní → tmavý
  useState(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  });

  const siteName = String(content.siteName ?? "Demo Magic Tattoo Studio");
  const ctaText  = String(content.ctaText  ?? "Kontaktujte nás");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BG     = "#0A0A0E";
  const ACCENT = "#D41515";
  const NAVTEXT = "rgba(255,255,255,0.88)";
  const NAV_H  = 80;

  // Inline textové logo — "DEMO TATTOO" — jemnější font
  const LogoMark = () => (
    <a
      href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
      aria-label={siteName}
      style={{ textDecoration: "none", flexShrink: 0 }}
    >
      <span style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 300,
        fontSize: "1.4rem",
        color: "#ffffff",
        letterSpacing: "0.18em",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        gap: 0,
        textTransform: "uppercase",
      }}>
        <span style={{ color: ACCENT }}>DEMO</span>
        <span style={{ color: "#ffffff", marginLeft: 8 }}>TATTOO</span>
      </span>
    </a>
  );

  return (
    <>
      {/* Navbar vnořená do hero — position: relative + negativní margin */}
      <header
        data-template="tattoo-03"
        style={{
          position: "relative",
          zIndex: 50,
          marginBottom: -NAV_H,
          backgroundColor: scrolled ? BG : "transparent",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Desktop bar */}
        <div
          className="hidden md:flex items-center max-w-[1400px] mx-auto"
          style={{ height: NAV_H, padding: "0 48px", gap: 0 }}
        >
          {/* Logo */}
          <div style={{ flexShrink: 0, marginRight: 56 }}>
            <LogoMark />
          </div>

          {/* Nav linky — centrované */}
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`t03-nav-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: NAVTEXT,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={e => (e.currentTarget.style.color = NAVTEXT)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Červené CTA */}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            style={{
              display: "inline-flex", alignItems: "center",
              backgroundColor: ACCENT, color: "#ffffff",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: "0.88rem", fontWeight: 700,
              letterSpacing: "0.05em",
              textDecoration: "none",
              padding: "11px 28px",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b30000")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>

        {/* Mobile bar */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{ height: 64, padding: "0 20px" }}
        >
          <LogoMark />
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 26, height: 2,
                backgroundColor: i === 1 && open ? "transparent" : "#ffffff",
                transform: open ? (i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "none") : "none",
                transition: "transform 0.25s, background 0.2s",
              }} />
            ))}
          </button>
        </div>

        {/* Mobile fullscreen overlay */}
        {open && (
          <div
            className="md:hidden"
            style={{
              position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
              backgroundColor: BG,
              display: "flex", flexDirection: "column",
              padding: "32px 28px 40px",
              overflowY: "auto",
              zIndex: 49,
            }}
          >
            {links.map((l, i) => (
              <a
                key={`t03-mob-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "20px 0",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  lineHeight: 1,
                }}
              >
                {l.label}
              </a>
            ))}
            <div style={{ marginTop: "auto", paddingTop: 32 }}>
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                data-btn="primary"
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "16px 24px",
                  backgroundColor: ACCENT, color: "#ffffff",
                  textAlign: "center", fontWeight: 700,
                  fontSize: "0.9rem", letterSpacing: "0.06em",
                  textDecoration: "none",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

// ── nails-02-navbar ──────────────────────────────────────────────────────────
// Wix-style nehtové studio celebratesalon.cz — fixed transparent overlay nad
// hero (žádný spacer), bílé CELEBRATE geometric sans wordmark vlevo, bílé nav
// linky uprostřed; vpravo CS lang pill + IG + WhatsApp kruhové ikonky + taupe
// filled pill CTA "Objednat se". Light text na tmavé hero foto.
// Brand: #6b3f38 wine, #d4a080 taupe, bílá pro text/ikony.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarNails02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Sticky bg change po 60px scrollu (hero přechod → wine glass)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const siteName = String(content.siteName ?? "Premium Nails");
  const ctaText  = String(content.ctaText  ?? "Objednat se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const igHref   = String(content.igHref   ?? "https://instagram.com/demo");
  const waHref   = String(content.waHref   ?? "https://wa.me/420704123456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const TAUPE = "#d4a080";
  const LIGHT = "#ffffff";
  const NAV_H = 92;

  const Wordmark = () => (
    <a
      href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
      aria-label={siteName}
      style={{
        textDecoration: "none",
        color: LIGHT,
        fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
        fontWeight: 600,
        fontSize: "1.55rem",
        letterSpacing: "0.16em",
        lineHeight: 1,
        textTransform: "uppercase",
      }}
    >
      <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
    </a>
  );

  const IconCircle = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: 999,
        border: `1px solid rgba(255,255,255,0.7)`,
        color: LIGHT,
        textDecoration: "none",
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = LIGHT; e.currentTarget.style.color = "#1a1a1a"; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = LIGHT; }}
    >
      {children}
    </a>
  );

  return (
    <>
      <header
        data-template="nails-02"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: scrolled ? "rgba(31,20,17,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(10px) saturate(120%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(10px) saturate(120%)" : "none",
          borderBottom: scrolled ? `1px solid rgba(212,160,128,0.18)` : "1px solid transparent",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.25)" : "none",
          transition: "background-color 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, height 0.25s ease",
        }}
      >
        {/* Desktop */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 40,
            height: scrolled ? 68 : NAV_H,
            padding: "0 56px",
            maxWidth: 1600,
            margin: "0 auto",
            transition: "height 0.25s ease",
          }}
        >
          {/* Logo vlevo */}
          <Wordmark />

          {/* Nav linky uprostřed */}
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 44 }}>
            {links.map((l, i) => (
              <a
                key={`n02-nav-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 400,
                  color: LIGHT,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.65")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Vpravo: CS pill + IG + WA + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* CS language pill */}
            <button
              type="button"
              aria-label="Jazyk: čeština"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                color: LIGHT,
                border: `1px solid rgba(255,255,255,0.7)`,
                borderRadius: 999,
                padding: "8px 14px",
                fontFamily: "'Poppins', Arial, sans-serif",
                fontSize: "0.82rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              <span>CS</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Instagram */}
            <IconCircle href={igHref} label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
              </svg>
            </IconCircle>
            {/* WhatsApp */}
            <IconCircle href={waHref} label="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 14.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7.1-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2 3.1 4.9 4.4 1.7.7 2.4.8 3.3.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/>
                <path d="M20.5 3.5C18.3 1.3 15.3 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12 0-3.3-1.3-6.3-3.5-8.3zM12 21.8c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.5 15.6 2 13.8 2 12 2 6.5 6.5 2 12 2c2.7 0 5.2 1 7 2.9 1.9 1.9 2.9 4.4 2.9 7 .1 5.6-4.4 9.9-9.9 9.9z" opacity=".55"/>
              </svg>
            </IconCircle>
            {/* CTA filled taupe pill */}
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              style={{
                marginLeft: 4,
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: TAUPE,
                color: LIGHT,
                border: "none",
                fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                fontSize: "0.92rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                textDecoration: "none",
                padding: "12px 32px",
                borderRadius: 999,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c08e6e")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = TAUPE)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>

        {/* Mobile bar */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{ height: 68, padding: "0 20px" }}
        >
          <Wordmark />
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", width: 24, height: 2,
                backgroundColor: LIGHT,
                transform: open ? (i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "none") : "none",
                opacity: open && i === 1 ? 0 : 1,
                transition: "transform 0.25s, opacity 0.2s",
              }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "#1a1a1a",
            display: "flex", flexDirection: "column",
            padding: "90px 28px 40px",
            overflowY: "auto",
            zIndex: 49,
          }}
        >
          {links.map((l, i) => (
            <a
              key={`n02-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "18px 0",
                fontSize: "1.35rem",
                fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 400,
                color: LIGHT,
                textDecoration: "none",
                borderBottom: `1px solid rgba(255,255,255,0.10)`,
                letterSpacing: "0.04em",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 32,
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "14px 32px",
              backgroundColor: TAUPE,
              color: LIGHT,
              fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "0.95rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              textDecoration: "none",
              borderRadius: 999,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      )}
    </>
  );
}

// ── nails-03-navbar ──────────────────────────────────────────────────────────
// maidenstudio.cz — fixed cream #FCF9F0 navbar, near-black uppercase Manrope
// wordmark vlevo, dark nav linky uprostřed, brown #806248 pill CTA vpravo.
// Na scroll: lehký box-shadow. Mobile: hamburger + fullscreen cream overlay.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarNails03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const siteName = String(content.siteName ?? "Demo Maiden Studio");
  const ctaText  = String(content.ctaText  ?? "Objednat se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const igHref   = String(content.igHref   ?? "https://instagram.com/demo");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const CREAM  = "#FCF9F0";
  const DARK   = "#0B090C";
  const BROWN  = "#806248";
  const MUTED  = "#5a5047";
  const NAV_H  = 80;
  const FONT   = "'Manrope', 'Helvetica Neue', Arial, sans-serif";

  return (
    <>
      <header
        data-template="nails-03"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: NAV_H,
          backgroundColor: CREAM,
          boxShadow: scrolled ? "0 2px 16px rgba(11,9,12,0.10)" : "0 1px 0 rgba(11,9,12,0.06)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Wordmark */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            aria-label={siteName}
            style={{
              textDecoration: "none",
              color: DARK,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: "1.15rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </a>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="n03-nav-desktop">
            {links.map((l, i) => (
              <a
                key={`n03-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  textDecoration: "none",
                  color: MUTED,
                  fontFamily: FONT,
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = DARK; }}
                onMouseLeave={e => { e.currentTarget.style.color = MUTED; }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right: IG icon + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }} className="n03-nav-desktop">
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{ color: MUTED, display: "flex", alignItems: "center", transition: "color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = BROWN; }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              style={{
                padding: "10px 24px",
                backgroundColor: BROWN,
                color: CREAM,
                fontFamily: FONT,
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textDecoration: "none",
                borderRadius: 999,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#6e5238"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = BROWN; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Hamburger */}
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            className="n03-hamburger"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: DARK,
            }}
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: NAV_H }} />

      {/* Mobile overlay */}
      <style>{`
        @media (max-width: 900px) {
          .n03-nav-desktop { display: none !important; }
          .n03-hamburger   { display: flex !important; }
        }
      `}</style>

      {open && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          backgroundColor: CREAM,
          display: "flex",
          flexDirection: "column",
          padding: "100px 32px 40px",
          overflowY: "auto",
        }}>
          {links.map((l, i) => (
            <a
              key={`n03-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "18px 0",
                fontSize: "1.5rem",
                fontFamily: FONT,
                fontWeight: 700,
                color: DARK,
                textDecoration: "none",
                borderBottom: `1px solid rgba(11,9,12,0.08)`,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 40,
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "14px 32px",
              backgroundColor: BROWN,
              color: CREAM,
              fontFamily: FONT,
              fontSize: "0.95rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textDecoration: "none",
              borderRadius: 999,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      )}
    </>
  );
}

// ── clinic-02-navbar ─────────────────────────────────────────────────────────
// 2-řádkový navbar:
//   Řádek 1: logo centrované (velké + podtitul "CLINIC"), telefon + IG + FB vpravo
//   Řádek 2: nav linky uppercase centrované přes celou šířku
function NavbarClinic02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const BLACK  = "#1a1a1a";
  const WHITE  = "#FFFFFF";
  const MUTED  = "#888";
  const FONT   = "'Poppins', 'Arial', sans-serif";
  // Two rows: top 130px + gap 20px + nav 52px + pb 16px = 218px total
  const TOTAL_H = 218;

  const siteName    = String((content as Record<string,unknown>).siteName    ?? "AURÉLIE");
  const siteTagline = String((content as Record<string,unknown>).siteTagline ?? "CLINIC");
  const phone    = String(content.phone ?? "+420 234 567 890");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const igHref   = String((content as Record<string,unknown>).igHref  ?? "https://instagram.com/demo");
  const fbHref   = String((content as Record<string,unknown>).fbHref  ?? "https://facebook.com/demo");
  const siteMode = String(content.siteMode ?? "multipage");
  const navR = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <>
      <header
        data-template="clinic-02"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          backgroundColor: WHITE,
          boxShadow: "none",
          fontFamily: FONT,
        }}
      >
        {/* ── Row 1: logo center + contacts right ── */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 130,
          padding: "0 40px",
        }}>
          {/* Logo — absolutely centered */}
          <a
            href={resolveDemoHref("/", tenantSlug, isAdmin)}
            style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1 }}
          >
            <span style={{
              fontFamily: FONT,
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              fontWeight: 700,
              color: BLACK,
              letterSpacing: "0.06em",
            }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            <span style={{
              fontFamily: FONT,
              fontSize: "clamp(0.65rem, 1vw, 0.88rem)",
              fontWeight: 400,
              color: BLACK,
              letterSpacing: "0.55em",
              marginTop: 6,
            }}>
              <GenericEditableText sectionId={sectionId} field="siteTagline" value={siteTagline} tag="span" />
            </span>
          </a>

          {/* Right: phone + social (desktop) */}
          <div
            className="c02-top-right"
            style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 16 }}
          >
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ color: BLACK, textDecoration: "none", fontSize: "0.85rem", fontWeight: 400, whiteSpace: "nowrap" }}>
              {phone}
            </a>
            {/* Instagram */}
            <a href={igHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: BLACK, display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href={fbHref} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: BLACK, display: "flex" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>

          {/* Hamburger (mobile) */}
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            className="c02-hamburger"
            style={{ display: "none", position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 8, color: BLACK }}
          >
            {open
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            }
          </button>
        </div>

        {/* ── Row 2: nav links centered (no separator) ── */}
        <nav className="c02-nav-desktop" style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "clamp(16px, 3vw, 56px)",
          height: 52,
          padding: "0 40px",
          paddingTop: 20,
          paddingBottom: 16,
        }}>
          {links.map((l, i) => (
            <a
              key={`c02-${i}`}
              href={navR(l.href)}
              style={{
                textDecoration: "none",
                color: BLACK,
                fontSize: "0.86rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                transition: "color 0.18s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = MUTED; }}
              onMouseLeave={e => { e.currentTarget.style.color = BLACK; }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Spacer */}
      <div className="c02-spacer" style={{ height: TOTAL_H }} />

      <style>{`
        @media (max-width: 768px) {
          .c02-nav-desktop { display: none !important; }
          .c02-top-right   { display: none !important; }
          .c02-hamburger   { display: flex !important; }
          /* Compact header — hide row 2 + shrink row 1 */
          header[data-template="clinic-02"] > div:first-child {
            height: 64px !important;
            padding: 0 16px !important;
          }
          header[data-template="clinic-02"] a > span:first-child {
            font-size: 1.35rem !important;
            letter-spacing: 0.04em !important;
          }
          header[data-template="clinic-02"] a > span:last-child {
            font-size: 0.55rem !important;
            letter-spacing: 0.35em !important;
            margin-top: 2px !important;
          }
          .c02-spacer { height: 64px !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 49,
          backgroundColor: WHITE,
          display: "flex", flexDirection: "column",
          padding: "120px 32px 40px",
          overflowY: "auto",
        }}>
          {links.map((l, i) => (
            <a
              key={`c02-mob-${i}`}
              href={navR(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "16px 0", fontSize: "1.1rem", fontFamily: FONT, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: BLACK, textDecoration: "none", borderBottom: "1px solid rgba(0,0,0,0.07)" }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <a href={igHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: BLACK }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href={fbHref} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: BLACK }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
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

// ── fitness-02-navbar ──────────────────────────────────────────────────────────
// Black gradient overlay navbar — 1:1 fitnessvictory.cz
// Layout: logo (SVG/image, 160px wide) vlevo | nav links centrally | outlined pink CTA vpravo
// Gradient: linear-gradient(180deg, #000000 0%, transparent 100%), margin-bottom: -94px (overlaps hero)
// Nav items: 14px 600 uppercase, color #C3C3C3, hover #FFFFFF, underline accent #FF5500
// CTA: 16px, outlined border 2px solid #FF5500, color #FF5500, no fill; hover: bg #FF5500, color #000
// Mobile overlay: full-screen black, large links, pink CTA
// ─────────────────────────────────────────────────────────────────────────────
// ── fyzio-01-navbar ──────────────────────────────────────────────────────────
// Sticky bílý navbar bez topobar (jako fyziovsem.cz)
// Logo vlevo, nav linky uprostřed, navy CTA s phone ikonou vpravo
// ─────────────────────────────────────────────────────────────────────────────
function NavbarFyzio01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  const siteName = String(content.siteName ?? "Demo Fyzio Centrum");
  const logoUrl  = String(content.logoUrl  ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText  = String(content.ctaText ?? "Kontakt");
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const phone    = String(content.phone ?? "704 123 456");
  const email    = String(content.email ?? "info@demo.cz");

  const WHITE = "#ffffff";
  const NAVY  = "#1f2d69";
  const TEAL  = "#6bbea1";
  const TEXT  = "#333333";
  const SANS  = "'Open Sans', sans-serif";
  const MONT  = "'Montserrat', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  return (
    <>
      {/* ── Sticky navbar ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: WHITE, borderBottom: `1px solid #e8edf5`, boxShadow: "0 2px 12px rgba(31,45,105,0.08)", fontFamily: SANS }}
        data-template="fyzio-01"
      >
        <div
          style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          {/* Logo */}
          <a
            href={resolve("/")}
            style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" }}
            aria-label={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 207, height: 55 }}
            >
              <OptimizedPicture
                src={logoSrc}
                alt={siteName}
                imgStyle={{ width: 207, height: 55, objectFit: "contain" }}
              />
            </GenericEditableImage>
          </a>

          {/* Desktop nav linky — absolutně centrované */}
          <nav className="hidden md:flex items-center" style={{ gap: 36, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            {links.map((l, i) => (
              <a
                key={`fn-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: MONT, fontSize: 14, fontWeight: 500, color: TEXT, textDecoration: "none", letterSpacing: "0.02em", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* CTA — desktop — navy s phone ikonou */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="hidden md:inline-flex items-center"
              style={{
                backgroundColor: NAVY,
                color: WHITE,
                fontFamily: MONT,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.03em",
                padding: "10px 24px",
                borderRadius: 4,
                textDecoration: "none",
                whiteSpace: "nowrap",
                gap: 8,
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#162057")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = NAVY)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-between bg-transparent border-0 cursor-pointer p-1"
              style={{ width: 28, height: 20 }}
              onClick={() => setOpen(true)}
              aria-label="Otevřít menu"
              aria-expanded={open}
            >
              <span style={{ display: "block", height: 2, backgroundColor: NAVY, borderRadius: 1 }} />
              <span style={{ display: "block", height: 2, backgroundColor: NAVY, borderRadius: 1 }} />
              <span style={{ display: "block", height: 2, backgroundColor: NAVY, borderRadius: 1 }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: WHITE, display: "flex", flexDirection: "column", padding: "20px 24px", fontFamily: SANS }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
            <a href={resolve("/")} aria-label={siteName}>
              <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 60, width: "auto", objectFit: "contain" }} />
            </a>
            <button
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
              style={{ background: "none", border: "none", cursor: "pointer", color: NAVY, padding: 4 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="3" x2="21" y2="21"/>
                <line x1="21" y1="3" x2="3" y2="21"/>
              </svg>
            </button>
          </div>
          <nav style={{ flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`fn-mob-${i}`}
                href={resolve(l.href)}
                onClick={() => setOpen(false)}
                style={{ display: "block", padding: "14px 0", fontFamily: MONT, fontSize: 16, fontWeight: 600, color: TEXT, textDecoration: "none", borderBottom: `1px solid #e8edf5`, letterSpacing: "0.02em" }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div style={{ marginTop: 32 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: NAVY, color: WHITE, fontFamily: MONT, fontSize: 15, fontWeight: 600, padding: "14px 24px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.03em" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: NAVY, fontSize: 13, fontFamily: SANS, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
                +420 {phone}
              </a>
              <a href={`mailto:${email}`} style={{ color: NAVY, fontSize: 13, fontFamily: SANS, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="13" height="11" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {email}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavbarFitness02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const siteName    = String(content.siteName    ?? "Power Fitness");
  const logoUrl     = String(content.logoUrl     ?? "");
  const ctaText     = String(content.ctaText     ?? "Skupinové lekce");
  const ctaHref     = String(content.ctaHref     ?? "/lekce");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];
  const siteMode    = String(content.siteMode ?? "multipage");

  const BG      = "#000000";
  const ACCENT  = "#FF5500";
  const TEXT    = "#C3C3C3";
  const WHITE   = "#FFFFFF";
  const FONT    = "'Archivo Black', sans-serif";
  const BODY    = "'Montserrat', sans-serif";

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const logoSrc = logoUrl || "";

  // Split wordmark: first token white, rest orange (industrial signature)
  const nameTokens = siteName.trim().split(/\s+/);
  const nameHead = nameTokens[0] ?? siteName;
  const nameTail = nameTokens.slice(1).join(" ");

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{
          background: scrolled
            ? "rgba(0,0,0,0.97)"
            : "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0) 100%)",
          borderBottom: scrolled ? `1px solid rgba(255,85,0,0.35)` : `1px solid transparent`,
          backdropFilter: scrolled ? "saturate(140%) blur(6px)" : "none",
          WebkitBackdropFilter: scrolled ? "saturate(140%) blur(6px)" : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
          fontFamily: BODY,
        }}
        data-template="fitness-02"
        data-section="fitness-02-navbar"
      >
        {/* Desktop */}
        <div
          className="hidden md:flex items-center justify-between"
          style={{ height: 84, maxWidth: 1320, margin: "0 auto", padding: "0 48px" }}
        >
          {/* Logo vlevo */}
          <a
            href={resolve("/")}
            style={{ textDecoration: "none", flexShrink: 0 }}
            aria-label={siteName}
          >
            {logoSrc ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="relative overflow-hidden shrink-0" style={{ display: "inline-block" }}>
                <OptimizedPicture
                  src={logoSrc}
                  alt={siteName}
                  imgStyle={{ width: "220px", height: "auto", objectFit: "contain" }}
                />
              </GenericEditableImage>
            ) : (
              <span className="fitness02-wordmark" style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 22, color: WHITE, fontFamily: FONT, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
                <span aria-hidden="true" style={{ fontSize: 22, color: ACCENT, fontFamily: FONT, lineHeight: 1 }}>.</span>
              </span>
            )}
          </a>

          {/* Nav linky středem */}
          <nav style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <ul style={{ display: "flex", gap: 44, listStyle: "none", margin: 0, padding: 0 }}>
              {links.map((l, i) => (
                <li key={i}>
                  <a
                    href={resolve(l.href)}
                    className="fitness02-navlink"
                    style={{
                      position: "relative", display: "inline-block",
                      fontSize: 13, color: TEXT, textDecoration: "none",
                      letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT,
                      paddingBottom: 6,
                      transition: "color 0.35s cubic-bezier(0.22,0.61,0.36,1)",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA outlined vpravo */}
          <a
            href={resolve(ctaHref)}
            data-btn="inverse"
            className="fitness02-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "transparent", color: ACCENT,
              border: `2px solid ${ACCENT}`, borderRadius: 0,
              padding: "13px 30px",
              fontSize: 13, textDecoration: "none",
              letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: FONT, whiteSpace: "nowrap", flexShrink: 0,
              transition: "background 0.35s cubic-bezier(0.22,0.61,0.36,1), color 0.35s cubic-bezier(0.22,0.61,0.36,1), transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg className="fitness02-cta-arrow" width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true" style={{ transition: "transform 0.35s cubic-bezier(0.22,0.61,0.36,1)" }}>
              <path d="M0 5H12M12 5L8 1M12 5L8 9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </a>
        </div>

        {/* Mobile */}
        <div
          className="flex md:hidden items-center justify-between"
          style={{ height: 64, padding: "0 20px" }}
        >
          <a href={resolve("/")} style={{ textDecoration: "none" }}>
            {logoSrc ? (
              <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 36, width: "auto", objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 18, fontWeight: 900, color: WHITE, fontFamily: FONT, letterSpacing: "1px", textTransform: "uppercase" }}>{siteName}</span>
            )}
          </a>
          <button
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            className="fitness02-burger"
            style={{ background: ACCENT, border: "none", cursor: "pointer", padding: "10px 14px", color: BG, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease" }}
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="0" y1="2" x2="22" y2="2" />
              <line x1="0" y1="8" x2="18" y2="8" />
              <line x1="0" y1="14" x2="22" y2="14" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero spacer — navbar je fixed, takže hero sekce potřebuje offset */}
      <div style={{ height: 84 }} aria-hidden="true" className="hidden md:block" />
      <div style={{ height: 64 }} aria-hidden="true" className="block md:hidden" />

      {/* Mobile overlay menu */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: BG, display: "flex", flexDirection: "column",
            padding: "24px 28px", fontFamily: BODY,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            {logoSrc ? (
              <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 40, width: "auto", objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 20, fontWeight: 900, color: WHITE, fontFamily: FONT, letterSpacing: "1px", textTransform: "uppercase" }}>{siteName}</span>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
              style={{ background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 4 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="3" x2="21" y2="21" />
                <line x1="21" y1="3" x2="3" y2="21" />
              </svg>
            </button>
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              {links.map((l, i) => (
                <li key={i} style={{ borderBottom: "1px solid rgba(255,85,0,0.25)" }}>
                  <a
                    href={resolve(l.href)}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block", padding: "18px 0",
                      fontSize: 20, fontWeight: 700, color: WHITE,
                      textDecoration: "none", fontFamily: FONT,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ marginTop: 36 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              style={{
                display: "block", textAlign: "center",
                background: "transparent", color: ACCENT,
                border: `2px solid ${ACCENT}`,
                padding: "16px 24px", borderRadius: 0,
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                letterSpacing: "0.08em", textTransform: "uppercase",
                fontFamily: FONT,
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}

// ── fyzio-02-navbar ──────────────────────────────────────────────────────────
// Fixed transparent wrapper + bílá karta vnořená do hero — 1:1 resetclinic.cz
// nav2_component: position fixed, transparent bg, 5% padding
// nav2_container: white card, border-radius 0.8rem, box-shadow, margin-top 1rem
// ─────────────────────────────────────────────────────────────────────────────
function NavbarFyzio02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  const siteName = String(content.siteName ?? "American Clinic");
  const logoUrl  = String(content.logoUrl  ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText  = String(content.ctaText ?? "Rezervovat terapii");
  const ctaHref  = String(content.ctaHref ?? "#rezervace");
  const phone    = String(content.phone ?? "704 123 456");
  const email    = String(content.email ?? "info@demo.cz");

  const WHITE  = "#ffffff";
  const DARK   = "#1a2e4a";
  const TEAL   = "#c9a84c";
  const MUTED  = "#6b7280";
  const SANS   = "'Plus Jakarta Sans', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  return (
    <>
      {/* ── Fixed transparent outer wrapper — nezabírá výšku, karta floatuje nad hero ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "0 5%",
          pointerEvents: "none",
          fontFamily: SANS,
        }}
        data-template="fyzio-02"
      >
        {/* ── Bílá karta — nav2_container: white bg, border-radius 0.8rem, box-shadow ── */}
        <div
          style={{
            backgroundColor: WHITE,
            borderRadius: "0.8rem",
            boxShadow: "0 7px 20px rgba(0,0,0,0.06)",
            marginTop: "1rem",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "100rem",
            padding: "0.5rem 0.7rem 0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "auto",
            height: 64,
          }}
        >
          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", flexShrink: 0 }} aria-label={siteName}>
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: "auto", height: 48 }}
            >
              <OptimizedPicture
                src={logoSrc}
                alt={siteName}
                imgStyle={{ height: 48, width: "auto", objectFit: "contain" }}
              />
            </GenericEditableImage>
          </a>

          {/* Desktop nav linky */}
          <nav
            className="hidden md:flex items-center"
            style={{ gap: 0, flex: 1, justifyContent: "center" }}
          >
            {links.map((l, i) => (
              <a
                key={`fn2-nav-${i}`}
                href={resolve(l.href)}
                style={{
                  fontFamily: SANS,
                  fontSize: "0.935rem",
                  fontWeight: 400,
                  color: DARK,
                  textDecoration: "none",
                  padding: "0.75rem 0.8rem",
                  transition: "color 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = TEAL)}
                onMouseLeave={e => (e.currentTarget.style.color = DARK)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="hidden md:inline-flex items-center"
              style={{
                backgroundColor: TEAL,
                color: WHITE,
                fontFamily: SANS,
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "0.6rem 1.1rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b8943d")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = TEAL)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <button
              className="md:hidden flex flex-col justify-between bg-transparent border-0 cursor-pointer p-1"
              style={{ width: 28, height: 20 }}
              onClick={() => setOpen(true)}
              aria-label="Otevřít menu"
              aria-expanded={open}
            >
              <span style={{ display: "block", height: 2, backgroundColor: DARK, borderRadius: 1 }} />
              <span style={{ display: "block", height: 2, backgroundColor: DARK, borderRadius: 1 }} />
              <span style={{ display: "block", height: 2, backgroundColor: DARK, borderRadius: 1 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: WHITE, display: "flex", flexDirection: "column", padding: "20px 24px", fontFamily: SANS }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <a href={resolve("/")} aria-label={siteName}>
              <img loading="eager" src={logoSrc} alt={siteName} style={{ height: 40, width: "auto", objectFit: "contain" }} />
            </a>
            <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="3" x2="21" y2="21"/><line x1="21" y1="3" x2="3" y2="21"/>
              </svg>
            </button>
          </div>
          <nav style={{ flex: 1 }}>
            {links.map((l, i) => (
              <a key={`fn2-mob-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}
                style={{ display: "block", padding: "14px 0", fontFamily: SANS, fontSize: 18, fontWeight: 600, color: DARK, textDecoration: "none", borderBottom: "1px solid #e8edf5" }}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
          <div style={{ marginTop: 32 }}>
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: TEAL, color: WHITE, fontFamily: SANS, fontSize: 16, fontWeight: 600, padding: "16px 24px", borderRadius: 8, textDecoration: "none" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <a href={`tel:+420${phone.replace(/\s/g,"")}`} style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/></svg>
                +420 {phone}
              </a>
              <a href={`mailto:${email}`} style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="11" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {email}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── restaurant-01-navbar ──────────────────────────────────────────────────────
// Fixed transparentní overlay nad hero (žádný spacer — hero 100vh od top: 0)
// Layout: [hamburger ≡] | [SVG logo centrovaný abs.] | [Rezervace CTA + EN pill]
// On scroll: bg přechází na tmavé #1a0e0a
// Overlay menu: fullscreen dark, velké cream links + červené CTA dole
// Ref: ambi.cz (Ambiente) — prémiová restaurace Praha
// ─────────────────────────────────────────────────────────────────────────────
function NavbarRestaurant01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName  = String(content.siteName  ?? "Memento");
  const logoUrl   = String(content.logoUrl   ?? "/templates/restaurant-01/logo.svg");
  const ctaText   = String(content.ctaText   ?? "Rezervace");
  const ctaHref   = String(content.ctaHref   ?? "#kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const DARK   = "#1a0e0a";
  const CREAM  = "#f5ede0";
  const RED    = "#c0392b";
  const WHITE  = "#ffffff";
  const FONT   = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const navBg     = scrolled ? DARK : "transparent";
  const navText   = WHITE;
  const navShadow = scrolled ? "0 2px 16px rgba(0,0,0,0.4)" : "none";

  return (
    <>
      {/* Navbar — fixní overlay nad hero */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: navBg, boxShadow: navShadow,
        transition: "background-color 0.35s ease, box-shadow 0.35s ease",
        fontFamily: SANS,
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 clamp(32px, 5vw, 72px)",
          height: 92, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "relative",
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", color: navText }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: "block", width: 24, height: 1.5, backgroundColor: navText, transition: "background-color 0.3s" }} />
            ))}
          </button>

          {/* Logo — absolutně centrovaný */}
          <a
            href={resolve("/")}
            aria-label={siteName}
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textDecoration: "none", display: "flex", alignItems: "center" }}
          >
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logoUrl}
                alt={siteName}
                style={{ height: 42, display: "block" }}
              />
            </GenericEditableImage>
          </a>

          {/* Pravá strana: CTA + EN */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: WHITE, textDecoration: "none",
                padding: "10px 22px", backgroundColor: RED, borderRadius: 4,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <span style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
              color: `${WHITE}99`, border: `1px solid ${WHITE}40`,
              padding: "6px 12px", borderRadius: 3,
              display: "none",
            }}
            className="r01-lang-pill">
              CS
            </span>
          </div>
        </div>
      </nav>
      <style>{`@media(min-width:640px){.r01-lang-pill{display:inline-block!important}}`}</style>

      {/* Sidebar overlay — tmavý backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
        aria-hidden
      />

      {/* Sidebar panel — slide from left */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201,
        width: "clamp(260px, 40vw, 360px)",
        backgroundColor: "#ffffff",
        transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Zavřít — X nahoře vlevo */}
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Zavřít menu"
          style={{
            alignSelf: "flex-start", margin: "20px 0 0 20px",
            background: "none", border: "none", cursor: "pointer",
            color: "#1a1a1a", padding: 4, lineHeight: 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Hlavní links se separátory */}
        <nav style={{ flex: 1, padding: "16px 0 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: "0 0 0 20px" }}>
            {links.map((link, i) => (
              <li key={i} style={{ borderTop: "1px solid #e8e4e0" }}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: SANS, fontSize: "clamp(16px, 2.4vw, 21px)", fontWeight: 400,
                    color: "#1a1a1a", textDecoration: "none",
                    display: "block", padding: "13px 20px 13px 0",
                    transition: "color 0.18s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#c8943f")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#1a1a1a")}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
            <li style={{ borderTop: "1px solid #e8e4e0" }} />
          </ul>
        </nav>

        {/* Spodní CTA */}
        <div style={{ padding: "18px 20px 32px" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: WHITE, textDecoration: "none",
              padding: "11px 22px", backgroundColor: RED, borderRadius: 3,
              display: "inline-block", transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#a93226")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── restaurant-02-navbar ──────────────────────────────────────────────────────
// Transparentní fixed overlay nad hero — ref: restauracehybernska.cz
// Layout: [SVG logo vlevo] | [nav linky center — lowercase bold] | [english vpravo]
// On scroll: tmavé poloprůhledné pozadí pro čitelnost
// Mobile: fullscreen černý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarRestaurant02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Demo Hybernská");
  const logoUrl  = String(content.logoUrl  ?? "/templates/restaurant-02/logo.svg");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BLACK   = "#000000";
  const WHITE   = "#ffffff";
  const GHOST   = "rgba(255,255,255,0.78)";
  const POPPINS = "'Poppins', sans-serif";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const navBg = scrolled
    ? "rgba(0,0,0,0.82)"
    : "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)";

  return (
    <>
      <nav
        data-template="restaurant-02"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: navBg,
          transition: "background 0.35s ease",
          fontFamily: POPPINS,
        }}
      >
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)", height: 84, display: "flex", alignItems: "center" }}>
          {/* Logo vlevo */}
          <a
            href={resolve("/")}
            aria-label={siteName}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, objectFit: "contain", display: "block" }} />
            </GenericEditableImage>
          </a>

          {/* Nav linky — desktop, centrované */}
          <div className="r02-nav-desktop" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={i}
                href={resolve(l.href)}
                style={{ fontFamily: POPPINS, fontSize: 17, fontWeight: 700, color: GHOST, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          {/* Pravá strana: výběr jazyka */}
          <div className="r02-nav-right" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <a
              href={resolve("/en")}
              style={{ fontFamily: POPPINS, fontSize: 16, fontWeight: 500, color: GHOST, textDecoration: "none", letterSpacing: "0.03em", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
              onMouseLeave={e => (e.currentTarget.style.color = GHOST)}
            >
              english
            </a>
          </div>

          {/* Hamburger — mobile */}
          <button
            className="r02-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: "8px 0 8px 16px", flexDirection: "column", gap: 5, marginLeft: "auto" }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: "block", width: 24, height: 1.5, backgroundColor: WHITE }} />
            ))}
          </button>
        </div>
      </nav>

      <style>{`
        @media(max-width:900px){
          .r02-nav-desktop { display: none !important; }
          .r02-nav-right   { display: none !important; }
          .r02-hamburger   { display: flex !important; }
        }
      `}</style>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: BLACK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Zavřít menu"
            style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {links.map((l, i) => (
            <a key={i} href={resolve(l.href)} onClick={() => setMenuOpen(false)}
              style={{ fontFamily: POPPINS, fontSize: 17, fontWeight: 700, color: WHITE, textDecoration: "none", letterSpacing: "0.01em" }}
            >{l.label}</a>
          ))}
          <a href={resolve("/en")} onClick={() => setMenuOpen(false)}
            style={{ fontFamily: POPPINS, fontSize: 13, color: GHOST, textDecoration: "none", marginTop: 8 }}
          >english</a>
        </div>
      )}
    </>
  );
}


// ── restaurant-03-navbar ──────────────────────────────────────────────────────
// Fixed overlay vnořená do hero (žádný spacer, hero 100vh od top:0)
// Layout: [logo "Bon Appétit" vlevo] | [nav linky center] | [zlaté CTA vpravo]
// Bez sidebaru, bez hamburgeru. On scroll: tmavé #0c351a + shadow.
// Mobile (<768px): nav linky skryty, logo + CTA zůstanou.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarRestaurant03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Pacífico");
  const logoUrl  = String(content.logoUrl  ?? "/templates/restaurant-03/logo.svg");
  const ctaText  = String(content.ctaText  ?? "Rezervace");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const DARK = "#0d1b2a";
  const GOLD = "#e05e3f";
  const WHITE = "#ffffff";
  const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [mobileOpen, setMobileOpen] = useState(false);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: DARK,
        boxShadow: "0 2px 20px rgba(0,0,0,0.45)",
        fontFamily: SANS,
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 60px)",
          height: 80, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "relative",
        }}>

          {/* Logo — vlevo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", flexShrink: 0 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 38, display: "block" }} />
            </GenericEditableImage>
          </a>

          {/* Nav linky — absolutní střed (desktop) */}
          <ul className="r03-nav-center" style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "flex", alignItems: "center", gap: "clamp(18px, 3vw, 42px)",
            position: "absolute", left: "50%", transform: "translateX(-50%)",
          }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  style={{
                    fontFamily: SANS, fontSize: 12, fontWeight: 500,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: `${WHITE}e0`, textDecoration: "none",
                    transition: "color 0.18s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = `${WHITE}e0`)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          {/* Pravá strana */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {/* CTA — desktop */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="r03-nav-cta"
              style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: WHITE, textDecoration: "none",
                padding: "10px 24px", backgroundColor: GOLD, borderRadius: 2,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c04d2f")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            {/* Hamburger — mobile */}
            <button
              className="r03-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
              style={{
                display: "none", background: "none", border: "none", cursor: "pointer",
                padding: 8, color: WHITE, flexDirection: "column", gap: 5,
              }}
            >
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: WHITE, transition: "transform 0.2s, opacity 0.2s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: WHITE, transition: "opacity 0.2s", opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: WHITE, transition: "transform 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="r03-mobile-menu" style={{
            backgroundColor: DARK, borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "16px clamp(20px, 5vw, 40px) 24px",
          }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              {links.map((link, i) => (
                <li key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    href={resolve(link.href)}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block", padding: "14px 0",
                      fontFamily: SANS, fontSize: 13, fontWeight: 500,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: `${WHITE}cc`, textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li style={{ marginTop: 16 }}>
                <a
                  href={resolve(ctaHref)}
                  data-btn="primary"
                  style={{
                    display: "inline-block", padding: "12px 28px",
                    fontFamily: SANS, fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: WHITE, textDecoration: "none",
                    backgroundColor: GOLD, borderRadius: 2,
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
      <style>{`
        @media(max-width:768px){
          .r03-nav-center { display: none !important; }
          .r03-nav-cta { display: none !important; }
          .r03-hamburger { display: flex !important; }
        }
        @media(min-width:769px){
          .r03-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}

// ── cafe-02-navbar ───────────────────────────────────────────────────────────
// Ref: cafesavoy.ambi.cz
// Fixed overlay nad hero; transparentní→bílý po scrollu
// [hamburger (bílý→tmavý)] | [logo centrovaný abs. 66px] | [Rezervace gold]
// Sidebar: slide zleva, bílé bg, serif linky
// ────────────────────────────────────────────────────────────────────────────
function NavbarCafe02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Kavárna Republica");
  const logoUrl  = String(content.logoUrl  ?? "/templates/cafe-02/logo.svg");
  const ctaText  = String(content.ctaText  ?? "Rezervace");
  const ctaHref  = String(content.ctaHref  ?? "/rezervace");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const GOLD   = "#A89B67";
  const GOLD_DK = "#8A7E52";
  const DARK   = "#1A0E0A";
  const WHITE  = "#ffffff";
  const BORDER = "#E8E0D5";
  const SERIF  = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const navBg     = scrolled ? WHITE : "transparent";
  const navShadow = scrolled ? "0 1px 16px rgba(0,0,0,0.10)" : "none";
  const navBorder = scrolled ? `1px solid ${BORDER}` : "none";
  const fgColor   = scrolled ? DARK : WHITE;
  const logoFilter = scrolled ? "brightness(0)" : "brightness(0) invert(1)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: navBg, borderBottom: navBorder, boxShadow: navShadow,
        fontFamily: SANS,
        transition: "background-color 0.35s ease, box-shadow 0.35s ease",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 60px)",
          height: 88, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "relative",
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", zIndex: 1 }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: "block", width: 26, height: 1.5, backgroundColor: fgColor, transition: "background-color 0.3s" }} />
            ))}
          </button>

          {/* Logo — absolutně centrovaný, 73px výška */}
          <a href={resolve("/")} aria-label={siteName} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 73, display: "block", filter: logoFilter, transition: "filter 0.35s ease" }} />
            </GenericEditableImage>
          </a>

          {/* Zlaté CTA */}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "10px 22px", backgroundColor: GOLD, transition: "background-color 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_DK)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </nav>

      {/* Backdrop */}
      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none", transition: "opacity 0.3s ease" }} aria-hidden />

      {/* Sidebar */}
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: "clamp(280px, 45vw, 380px)", backgroundColor: WHITE, transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.36s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: menuOpen ? "4px 0 32px rgba(0,0,0,0.18)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
            <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 48, display: "block", filter: "brightness(0)" }} />
          </GenericEditableImage>
          <button onClick={() => setMenuOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4, lineHeight: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, letterSpacing: "0.04em", color: DARK, textDecoration: "none", display: "block", padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, transition: "color 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "20px 24px 36px" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "13px 28px", backgroundColor: GOLD, display: "inline-block", transition: "background-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_DK)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
          <div style={{ marginTop: 24, width: 48, height: 1, backgroundColor: GOLD }} />
        </div>
      </div>
    </>
  );
}

// ── cafe-03-navbar ────────────────────────────────────────────────────────────
// Ref: cathedral.cz (Kavárna & Restaurace, Praha)
// Fixed transparent→bílý navbar na scroll
// [Logo vlevo] | [nav linky center, desktop only] | [Rezervace CTA zlaté vpravo]
// Mobile: hamburger vpravo → fullscreen bílý overlay s nav linky
// ─────────────────────────────────────────────────────────────────────────────
function NavbarCafe03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Cathedral Café");
  const logoUrl  = String(content.logoUrl  ?? "/templates/cafe-03/logo.svg");
  const ctaText  = String(content.ctaText  ?? "Rezervace");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const GOLD   = "#C69C60";
  const GOLD_DK = "#A07840";
  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const BORDER = "#E8E2D8";
  const SANS   = "'Open Sans', sans-serif";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const navBg     = scrolled ? WHITE : "transparent";
  const navShadow = scrolled ? "0 1px 16px rgba(0,0,0,0.10)" : "none";
  const navBorder = scrolled ? `1px solid ${BORDER}` : "none";
  const fgColor   = scrolled ? DARK : WHITE;
  const logoFilter = scrolled ? "none" : "brightness(0) invert(1)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: navBg, borderBottom: navBorder, boxShadow: navShadow,
        fontFamily: SANS,
        transition: "background-color 0.35s ease, box-shadow 0.35s ease",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 60px)",
          height: 96, display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 20,
        }}>
          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 57, display: "block", filter: logoFilter, transition: "filter 0.35s ease" }} />
            </GenericEditableImage>
          </a>

          {/* Desktop nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 36px)", flex: 1, justifyContent: "center" }} aria-label="Hlavní navigace">
            {links.map((link, i) => (
              <a
                key={i}
                href={resolve(link.href)}
                style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, letterSpacing: "0.04em", color: fgColor, textDecoration: "none", transition: "color 0.2s, opacity 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = fgColor; }}
                className="c3-nav-link"
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            {/* Desktop CTA */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "10px 22px", backgroundColor: GOLD, transition: "background-color 0.2s", whiteSpace: "nowrap", display: "block" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_DK)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            {/* Hamburger (mobile only — hidden on desktop via media query via inline style trick) */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Otevřít menu"
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", marginLeft: 4 }}
              className="c3-hamburger"
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{ display: "block", width: 24, height: 1.5, backgroundColor: fgColor, transition: "background-color 0.3s" }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay backdrop */}
      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none", transition: "opacity 0.3s ease" }} aria-hidden />

      {/* Mobile fullscreen overlay */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201, width: "clamp(280px, 80vw, 420px)", backgroundColor: WHITE, transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.36s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: menuOpen ? "-4px 0 32px rgba(0,0,0,0.18)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, display: "block", filter: "none" }} />
          <button onClick={() => setMenuOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: SANS, fontSize: 17, fontWeight: 400, letterSpacing: "0.04em", color: DARK, textDecoration: "none", display: "block", padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, transition: "color 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "20px 24px 40px" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "13px 28px", backgroundColor: GOLD, display: "inline-block", transition: "background-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_DK)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .c3-hamburger { display: none !important; } }
        @media (max-width: 767px) { .c3-nav-link { display: none !important; } }
      `}</style>
    </>
  );
}

// ── bakery-01-navbar ─────────────────────────────────────────────────────────
// Ref: zrnozrnko.cz (Pekárna & Kavárna, Praha Nusle)
// Topbar: social ikony (FB, IG, Spotify, LinkedIn) barva #bebebe
// Main: sticky bílý navbar, logo centrovaný absolutně (SVG 66px výška),
//       nav linky vlevo uppercase s underline hover, hamburger vpravo mobile
// ─────────────────────────────────────────────────────────────────────────────
function NavbarBakery01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  const siteName = String(content.siteName ?? "Demo Zrno Zrnko");
  const logoUrl  = String(content.logoUrl  ?? "/templates/bakery-01/logo.svg");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const fbHref   = String(content.fbHref   ?? "https://facebook.com/demo");
  const igHref   = String(content.igHref   ?? "https://instagram.com/demo");

  const WHITE   = "#ffffff";
  const CHARCOAL = "#393939";
  const SOCIAL  = "#bebebe";
  const BORDER  = "#e8e8e8";
  const SANS    = "'Metropolis', 'Inter', 'Helvetica Neue', sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Main sticky navbar ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: WHITE, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", fontFamily: SANS }}
        data-template="bakery-01"
      >
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(40px, 6vw, 100px)", height: 86, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo — vlevo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 78, display: "block" }} />
            </GenericEditableImage>
          </a>

          {/* Desktop nav linky — vpravo */}
          <nav className="b01-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map((l, i) => (
              <a
                key={`b01-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: CHARCOAL, textDecoration: "none", paddingBottom: 2, borderBottom: "1px solid transparent", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = CHARCOAL)}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Hamburger — mobile */}
          <button
            className="b01-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 5 }}
          >
            <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: CHARCOAL }} />
            <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: CHARCOAL }} />
            <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: CHARCOAL }} />
          </button>
        </div>
      </header>

      {/* ── Mobile overlay backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.45)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }}
        aria-hidden
      />

      {/* ── Mobile sidebar ── */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201, width: "clamp(260px, 75vw, 320px)", backgroundColor: WHITE, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.12)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 36, display: "block" }} />
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: CHARCOAL, padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`b01-mob-${i}`}>
                <a
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: CHARCOAL, textDecoration: "none", display: "block", padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9f7fa")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "16px 24px 32px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 16 }}>
            <a href={fbHref} target="_blank" rel="noreferrer" aria-label="Facebook" style={{ color: SOCIAL }}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href={igHref} target="_blank" rel="noreferrer" aria-label="Instagram" style={{ color: SOCIAL }}><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913a5.885 5.885 0 001.384 2.126A5.868 5.868 0 004.14 23.37c.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558a5.898 5.898 0 002.126-1.384 5.86 5.86 0 001.384-2.126c.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913a5.89 5.89 0 00-1.384-2.126A5.847 5.847 0 0019.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 01-.899 1.382 3.744 3.744 0 01-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 01-1.379-.899 3.644 3.644 0 01-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z"/></svg></a>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .b01-hamburger { display: none !important; } }
        @media (max-width: 767px) { .b01-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}

// ── bakery-02-navbar ─────────────────────────────────────────────────────────
// Ref: antoninovopekarstvi.cz (Pekárna & Kavárna Praha, Marco WP theme)
// Transparent navbar přes hero; split nav 3+3 linky (vlevo/vpravo), logo centrovaně absolutně.
// Dual-logo: bílé (logoUrlLight) nad hero, tmavé (logoUrlDark) po scrollu.
// Scrolled: bílé bg + box-shadow. Mobile: hamburger → fullscreen overlay.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarBakery02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const siteName     = String(content.siteName     ?? "Demo Pekářství");
  const logoLight    = String(content.logoUrlLight  ?? "/templates/bakery-02/logo-white.svg");
  const logoDark     = String(content.logoUrlDark   ?? "/templates/bakery-02/logo-dark.svg");
  const fbHref       = String(content.fbHref        ?? "https://facebook.com/demo");
  const igHref       = String(content.igHref        ?? "https://instagram.com/demo");
  const linksLeft    = (content.linksLeft  as Array<{ label: string; href: string }>) ?? [];
  const linksRight   = (content.linksRight as Array<{ label: string; href: string }>) ?? [];
  const allLinks     = [...linksLeft, ...linksRight];

  const DARK  = "#333333";
  const WHITE = "#ffffff";
  const FONT  = "'Lato', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const DARK_NAV   = "rgba(17,17,17,0.92)";
  const navBg      = scrolled ? WHITE : DARK_NAV;
  const navShadow  = scrolled ? "0 2px 16px rgba(0,0,0,0.10)" : "0 2px 20px rgba(0,0,0,0.35)";
  const textColor  = scrolled ? DARK  : WHITE;
  const logoSrc    = scrolled ? logoDark : logoLight;
  const burgerColor = scrolled ? DARK : WHITE;

  const linkStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: textColor,
    textDecoration: "none",
    transition: "opacity 0.2s",
  };

  return (
    <>
      {/* ── Main navbar ── */}
      <header
        className="b02-navbar"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 50,
          backgroundColor: navBg,
          boxShadow: navShadow,
          transition: "background-color 0.35s ease, box-shadow 0.35s ease",
          fontFamily: FONT,
        }}
        data-template="bakery-02"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(24px, 5vw, 80px)", height: 80, display: "flex", alignItems: "center", position: "relative" }}>

          {/* Left nav links */}
          <nav className="b02-nav-left" style={{ display: "flex", alignItems: "center", gap: 28, flex: 1 }}>
            {linksLeft.map((l, i) => (
              <a
                key={`b02-l-${i}`}
                href={resolve(l.href)}
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field={`linksLeft.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Center logo — absolute */}
          <a
            href={resolve("/")}
            aria-label={siteName}
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textDecoration: "none", display: "flex", alignItems: "center" }}
          >
            <GenericEditableImage sectionId={sectionId} field={scrolled ? "logoUrlDark" : "logoUrlLight"} src={logoSrc} alt={siteName} style={{ display: "flex" }}>
              <img
                src={logoSrc}
                alt={siteName}
                style={{ height: 52, display: "block", transition: "opacity 0.35s ease" }}
              />
            </GenericEditableImage>
          </a>

          {/* Right nav links */}
          <nav className="b02-nav-right" style={{ display: "flex", alignItems: "center", gap: 28, flex: 1, justifyContent: "flex-end" }}>
            {linksRight.map((l, i) => (
              <a
                key={`b02-r-${i}`}
                href={resolve(l.href)}
                style={linkStyle}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field={`linksRight.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Hamburger — mobile */}
          <button
            className="b02-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "none", flexDirection: "column", gap: 6, position: "absolute", right: "clamp(16px, 5vw, 40px)" }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: "block", width: 28, height: 1.5, backgroundColor: burgerColor, transition: "background-color 0.35s" }} />
            ))}
          </button>
        </div>
      </header>

      {/* No spacer — hero overlaps behind fixed navbar like original */}

      {/* ── Mobile backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.5)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }}
        aria-hidden
      />

      {/* ── Mobile fullscreen overlay ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 201, backgroundColor: DARK, transform: open ? "translateY(0)" : "translateY(-100%)", transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}>
        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 24px" }}>
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 8 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="14" cy="14" r="12"/>
              <line x1="9" y1="9" x2="19" y2="19"/><line x1="19" y1="9" x2="9" y2="19"/>
            </svg>
          </button>
        </div>

        {/* Mobile nav links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", gap: 6 }}>
          {linksLeft.map((l, i) => (
            <a key={`b02-mob-l-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, letterSpacing: "0.16em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", opacity: 0.9, transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.9")}
            >
              <GenericEditableText sectionId={sectionId} field={`linksLeft.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
          {linksRight.map((l, i) => (
            <a key={`b02-mob-r-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, letterSpacing: "0.16em", textTransform: "uppercase", color: WHITE, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", opacity: 0.9, transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.9")}
            >
              <GenericEditableText sectionId={sectionId} field={`linksRight.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </nav>

        {/* Social links */}
        <div style={{ padding: "24px 40px 48px", display: "flex", gap: 20 }}>
          <a href={fbHref} target="_blank" rel="noreferrer" aria-label="Facebook" style={{ color: "rgba(255,255,255,0.5)", fontFamily: FONT, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>Facebook</a>
          <a href={igHref} target="_blank" rel="noreferrer" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.5)", fontFamily: FONT, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>Instagram</a>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .b02-hamburger { display: none !important; } }
        @media (max-width: 767px) {
          .b02-nav-left, .b02-nav-right { display: none !important; }
          .b02-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ── cafe-04-navbar ────────────────────────────────────────────────────────────
// Ref: coffeeroom.cz (Specialty kavárna, Praha)
// Fixed transparent→tmavý #1d1f2e navbar po scrollu
// Layout: [logo vlevo] | [text linky vpravo] — žádné CTA tlačítko
// Mobile: hamburger → fullscreen tmavý overlay, bílé serif linky
// ─────────────────────────────────────────────────────────────────────────────
function NavbarCafe04(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Demo Coffee Room");
  const logoUrl  = String(content.logoUrl  ?? "/templates/cafe-04/logo.svg");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const DARK    = "#1d1f2e";
  const COFFEE  = "#b79570";
  const WHITE   = "#ffffff";
  const FONT    = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const navBg     = scrolled ? DARK : "transparent";
  const navShadow = scrolled ? "0 1px 20px rgba(0,0,0,0.25)" : "none";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: navBg,
        boxShadow: navShadow,
        fontFamily: FONT,
        transition: "background-color 0.4s ease, box-shadow 0.4s ease",
      }}>
        <div style={{
          maxWidth: 1440, margin: "0 auto",
          padding: "0 clamp(40px, 6vw, 96px)",
          height: 80, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 48, display: "block" }} />
            </GenericEditableImage>
          </a>

          {/* Desktop nav links */}
          <ul className="cr04-nav-links" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "clamp(28px, 3.5vw, 52px)", alignItems: "center" }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: WHITE, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = COFFEE)}
                  onMouseLeave={e => (e.currentTarget.style.color = WHITE)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          {/* Hamburger — mobile only */}
          <button
            className="cr04-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Otevřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 4px", display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: "block", width: 24, height: 1.5, backgroundColor: WHITE }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.6)", opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none", transition: "opacity 0.3s ease" }}
        aria-hidden
      />

      {/* Mobile fullscreen menu */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 201,
        backgroundColor: DARK,
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.36s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(183,149,112,0.25)" }}>
          <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 40, filter: "brightness(0) invert(1)" }} />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Zavřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: FONT, fontSize: 22, fontWeight: 300, letterSpacing: "0.06em", color: WHITE, textDecoration: "none", display: "block", padding: "18px 28px", borderBottom: "1px solid rgba(183,149,112,0.15)", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = COFFEE)}
                  onMouseLeave={e => (e.currentTarget.style.color = WHITE)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "24px 28px 40px" }}>
          <div style={{ width: 32, height: 2, backgroundColor: COFFEE }} />
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .cr04-hamburger { display: none !important; } }
        @media (max-width: 767px) { .cr04-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}

// ── reality-02-navbar ─────────────────────────────────────────────────────────
// Ref: fermakleri.cz (Realitní matchmaker portál)
// Sticky bílý navbar #ffffff, výška 70px
// Layout: [logo + claim vlevo] | [uppercase nav linky uprostřed/vpravo] | [CTA tlačítko vpravo]
// Nav linky: Montserrat 700 uppercase, hover underline zelený #3DCE78
// CTA: zelené #3DCE78 pill tlačítko "Najít makléře"
// Mobile: hamburger → pravý sidebar, tmavý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarReality02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName = String(content.siteName ?? "Demo FER Makléři");
  const logoUrl  = String(content.logoUrl  ?? "/templates/reality-02/logo.svg");
  const claim    = String(content.claim    ?? "Nezávislý srovnávač makléřů");
  const ctaText  = String(content.ctaText  ?? "Najít makléře");
  const ctaHref  = String(content.ctaHref  ?? "#prodej");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone    = String(content.phone ?? "704 123 456");
  const email    = String(content.email ?? "email@demo.cz");

  const WHITE   = "#ffffff";
  const DARK    = "#05303a";
  const GREEN   = "#3DCE78";
  const MUTED   = "#6f898e";
  const BORDER  = "#d9e0e2";
  const FONT    = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const [open, setOpen] = useState(false);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: "#ffffff", fontFamily: FONT }}
        data-template="reality-02"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 48px)", height: 120, display: "flex", alignItems: "center", gap: 16 }}>

          {/* Logo + brand name + separator + claim */}
          <a href={resolve("/")} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex", alignItems: "center" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 46, display: "block" }} />
            </GenericEditableImage>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" style={{ fontSize: 22, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", whiteSpace: "nowrap" }} />
            <span aria-hidden style={{ width: 1, height: 30, backgroundColor: DARK, opacity: 0.25, flexShrink: 0, display: "block" }} />
            <GenericEditableText sectionId={sectionId} field="claim" value={claim} tag="span" className="r02-claim" style={{ fontSize: 16, fontWeight: 400, color: DARK, opacity: 0.7, letterSpacing: "0.01em", whiteSpace: "nowrap" }} />
          </a>

          {/* Desktop nav linky */}
          <nav className="r02-nav-links" style={{ display: "flex", alignItems: "center", gap: 28, marginLeft: "auto" }}>
            {links.map((l, i) => (
              <a
                key={`r02-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DARK, textDecoration: "none", paddingBottom: 2, borderBottom: "2px solid transparent", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderBottomColor = GREEN; e.currentTarget.style.color = GREEN; }}
                onMouseLeave={e => { e.currentTarget.style.borderBottomColor = "transparent"; e.currentTarget.style.color = DARK; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Hamburger — mobile */}
          <button
            className="r02-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 5, marginLeft: "auto" }}
          >
            <span style={{ display: "block", width: 22, height: 2, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 22, height: 2, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 22, height: 2, backgroundColor: DARK }} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.45)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }}
        aria-hidden
      />

      {/* Mobile sidebar */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201, width: "clamp(260px, 75vw, 320px)", backgroundColor: "#ffffff", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.12)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid rgba(5,48,58,0.12)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 34, display: "block" }} />
            <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }}>{siteName}</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`r02-mob-${i}`}>
                <a
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DARK, textDecoration: "none", display: "block", padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, transition: "background 0.15s, color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f0faf3"; e.currentTarget.style.color = GREEN; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = DARK; }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "20px 24px 32px" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "12px 20px", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 24, textAlign: "center", transition: "background 0.2s" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .r02-hamburger { display: none !important; } }
        @media (max-width: 767px) { .r02-nav-links, .r02-nav-cta, .r02-claim { display: none !important; } }
      `}</style>
    </>
  );
}

// ── reality-03-navbar ─────────────────────────────────────────────────────────
// Ref: realityskutovi.cz
// Sticky bílý (#ffffff) navbar, výška 80px
// Layout: [text logo vlevo: "Reality Premium" serif 28px + ochre subtitle] |
//         [dropdown "Nabídka nemovitostí" + PRODEJ + PRONÁJEM + O NÁS + BLOG + tel] |
//         [KONTAKT pill button #132538 border-radius:99rem]
// Přesné hodnoty z originálu: button border:2px solid #132538, padding:12px 30px,
//   font-size:1rem, font-weight:600, letter-spacing:1px, uppercase, border-radius:99rem
// ─────────────────────────────────────────────────────────────────────────────
function NavbarReality03({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName    = String(content.siteName    ?? "Reality Premium");
  const subtitle    = String(content.subtitle    ?? "MARCEL & HELENA");
  const logoUrl     = String(content.logoUrl     ?? "");
  const ctaText     = String(content.ctaText     ?? "Kontakt");
  const ctaHref     = String(content.ctaHref     ?? "#kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const WHITE  = "#ffffff";
  const DARK   = "#132538";
  const OCHRE  = "#e38a6a";
  const BORDER = "#e8e8e8";
  const SERIF  = "Georgia, 'Times New Roman', serif";
  const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [open, setOpen] = useState(false);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: WHITE }}
        data-template="reality-03"
      >
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(20px, 3vw, 48px)", height: 80, display: "flex", alignItems: "center", gap: 0 }}>

          {/* Logo — text wordmark (serif + ochre subtitle) */}
          <a href={resolve("/")} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: "auto" }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 62, width: 245, display: "block" }} />
              </GenericEditableImage>
            ) : (
              <>
                <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: DARK, lineHeight: 1.1, letterSpacing: "-0.3px" }}>
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
                <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: OCHRE, letterSpacing: "2.5px", marginTop: 3, textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
                </span>
              </>
            )}
          </a>

          {/* Desktop nav */}
          <nav className="r03-nav-links" style={{ display: "flex", alignItems: "center", gap: 0 }}>

            {/* Nav linky */}
            {links.map((l, i) => (
              <a
                key={`r03-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: SANS, fontSize: 14, fontWeight: 400, letterSpacing: "0.04em", textTransform: "uppercase", color: DARK, textDecoration: "none", padding: "14px 20px", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = OCHRE)}
                onMouseLeave={e => (e.currentTarget.style.color = DARK)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}

            {/* KONTAKT — pill button, přesně jako originál */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="r03-nav-cta"
              style={{ marginLeft: 8, padding: "12px 30px", border: `2px solid ${DARK}`, backgroundColor: DARK, color: WHITE, fontFamily: SANS, fontSize: 14, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", borderRadius: "99rem", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = WHITE; e.currentTarget.style.color = DARK; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = DARK; e.currentTarget.style.color = WHITE; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </nav>

          {/* Hamburger — mobile */}
          <button
            className="r03-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 5, marginLeft: "auto" }}
          >
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: DARK }} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.45)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }}
        aria-hidden
      />

      {/* Mobile sidebar */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201, width: "clamp(280px, 80vw, 340px)", backgroundColor: WHITE, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.12)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: DARK, lineHeight: 1.1 }}>{siteName}</span>
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, color: OCHRE, letterSpacing: "2px", marginTop: 2, textTransform: "uppercase" }}>{subtitle}</span>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`r03-mob-${i}`}>
                <a
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, letterSpacing: "0.04em", textTransform: "uppercase", color: DARK, textDecoration: "none", display: "block", padding: "14px 24px", borderBottom: `1px solid ${BORDER}`, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = OCHRE)}
                  onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "20px 24px 32px" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "12px 28px", border: `2px solid ${DARK}`, backgroundColor: DARK, color: WHITE, fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none", borderRadius: "99rem", textAlign: "center", transition: "all 0.2s" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 960px) { .r03-hamburger { display: none !important; } }
        @media (max-width: 959px) { .r03-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}

// ── reality-04-navbar ─────────────────────────────────────────────────────────
// Ref: quantumreality.cz
// Sticky bílý (#ffffff) navbar výška 72px
// Layout: [SVG Q-logo vlevo] | [flat nav linky: Služby / Nabídka / O nás / Kariéra] |
//         [zelený (#21b276) filled pill CTA 'Kontakty' vpravo, inset box-shadow, border-radius 50px]
// Mobile: fullscreen modrý (#1032CF) overlay + bílý text
// Přesné hodnoty z originálu: bg #ffffff, nav-link text #241f0c,
//   CTA bg #21b276 hover→transparent+#21b276 text, hamburger 1.5px span #241f0c
//   nav font-size 17.5px (14px × 1.25 dle požadavku uživatele)
// ─────────────────────────────────────────────────────────────────────────────
function NavbarReality04({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName     = String(content.siteName     ?? "Fox Reality");
  const logoUrl      = String(content.logoUrl      ?? "");
  const ctaText      = String(content.ctaText      ?? "Kontakty");
  const ctaHref      = String(content.ctaHref      ?? "#kontakt");
  const facebookUrl  = String(content.facebookUrl  ?? "");
  const instagramUrl = String(content.instagramUrl ?? "");
  const links        = (content.links as Array<{ label: string; href: string }>) ?? [];

  const WHITE   = "#ffffff";
  const DARK    = "#241f0c";
  const GREEN   = "#21b276";
  const BLUE    = "#1032CF";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const LINK_FS = 21;

  const [open, setOpen] = useState(false);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: WHITE }}
        data-template="reality-04"
      >
        <div style={{ maxWidth: 1434, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)", height: 100, display: "flex", alignItems: "center" }}>

          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0, marginRight: 40 }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 57, width: "auto", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: DARK }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            )}
          </a>

          {/* Desktop nav — linky hned za logem, flex:1 pushuje pravou část doprava */}
          <nav className="r04-nav-links" style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`r04-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: SANS, fontSize: LINK_FS, fontWeight: 400, color: DARK, textDecoration: "none", padding: "0 16px", lineHeight: "100px", transition: "color 0.15s ease-in-out", whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.color = GREEN)}
                onMouseLeave={e => (e.currentTarget.style.color = DARK)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Pravá část: sociální ikonky + CTA */}
          <div className="r04-nav-right" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", backgroundColor: "#f0f0f0", textDecoration: "none", transition: "background-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = BLUE; (e.currentTarget.querySelector("svg") as SVGElement | null)?.setAttribute("stroke", WHITE); }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f0f0f0"; (e.currentTarget.querySelector("svg") as SVGElement | null)?.setAttribute("stroke", DARK); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", backgroundColor: "#f0f0f0", textDecoration: "none", transition: "background-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#c13584"; (e.currentTarget.querySelector("svg") as SVGElement | null)?.setAttribute("stroke", WHITE); }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f0f0f0"; (e.currentTarget.querySelector("svg") as SVGElement | null)?.setAttribute("stroke", DARK); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="r04-nav-cta"
              style={{ marginLeft: 8, padding: "10px 28px", backgroundColor: GREEN, color: WHITE, fontFamily: SANS, fontSize: LINK_FS, fontWeight: 400, textDecoration: "none", borderRadius: 50, boxShadow: `inset 0px 0px 0px 2px ${GREEN}`, transition: "all 350ms ease", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = GREEN; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = GREEN; e.currentTarget.style.color = WHITE; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="r04-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 6, marginLeft: "auto" }}
          >
            <span style={{ display: "block", width: 28, height: 1.5, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 28, height: 1.5, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 28, height: 1.5, backgroundColor: DARK }} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.35)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.28s" }}
        aria-hidden
      />

      {/* Mobile fullscreen menu — modrý (#1032CF) overlay jako na originále */}
      <div style={{ position: "fixed", inset: 0, zIndex: 201, backgroundColor: BLUE, display: "flex", flexDirection: "column", transform: open ? "translateY(0)" : "translateY(-100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", overflowY: "auto" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: WHITE }}>{siteName}</span>
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`r04-mob-${i}`}>
                <a
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: SANS, fontSize: LINK_FS, fontWeight: 400, color: WHITE, textDecoration: "none", display: "block", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.12)", transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ display: "flex", gap: 10, padding: "16px 24px 0" }}>
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          )}
        </div>
        <div style={{ padding: "16px 24px 40px" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "14px 28px", backgroundColor: GREEN, color: WHITE, fontFamily: SANS, fontSize: LINK_FS, fontWeight: 400, textDecoration: "none", borderRadius: 50, textAlign: "center" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .r04-hamburger { display: none !important; } }
        @media (max-width: 899px) { .r04-nav-links { display: none !important; } .r04-nav-right { display: none !important; } }
      `}</style>
    </>
  );
}

// ── reality-01-navbar ─────────────────────────────────────────────────────────
// Sticky bílá navigace — ref: lexxusnorton.cz
// Layout: [SVG logo vlevo] | [2 icon nav links center] | [search ikona + hamburger vpravo]
// Mobile: fullscreen dark #1a3640 overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarReality01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Lexxus Norton");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone    = String(content.phone ?? "704 123 456");
  const email    = String(content.email ?? "email@demo.cz");

  const WHITE    = "#ffffff";
  const DARK     = "#1a3640";
  const TEXT     = "#141414";
  const TEXT_MUTED = "#6b7280";
  const MONTSERRAT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [menuOpen]);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);


  return (
    <>
      <nav
        data-template="reality-01"
        style={{
          position: "sticky", top: 0, left: 0, right: 0, zIndex: 100,
          backgroundColor: WHITE,
          fontFamily: MONTSERRAT,
        }}
      >
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 clamp(20px, 4vw, 56px)", height: 72, display: "flex", alignItems: "center" }}>
          {/* Logo — textový wordmark */}
          <a
            href={resolve("/")}
            aria-label={siteName}
            style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 2, lineHeight: 1, flexShrink: 0 }}
          >
            <span style={{ fontFamily: MONTSERRAT, fontSize: 20, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: TEXT, lineHeight: 1 }}>Luxusní</span>
            <span style={{ fontFamily: MONTSERRAT, fontSize: 10, fontWeight: 500, letterSpacing: "0.4em", textTransform: "uppercase", color: TEXT_MUTED, lineHeight: 1.4 }}>Nemovitosti</span>
          </a>

          {/* Nav linky — desktop, zarovnané vpravo */}
          <div className="r01-nav-links" style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {/* Najít nemovitost */}
            <a
              href={resolve("/vypis-nemovitosti")}
              className="r01-nav-link"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, textDecoration: "none", color: TEXT, fontSize: 14, fontWeight: 400, letterSpacing: "0.01em", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f4f6f7"; (e.currentTarget as HTMLElement).style.color = DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = TEXT; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m12.307 2.605 9.193 7.15V21h-1V10.244L12 3.633l-8.5 6.611V21h-1V9.756l9.193-7.15.307-.24z" fill="currentColor"/>
                <path d="M12.5 11.026c.845.1 1.713.48 2.354 1.12l-.707.707c-.566-.565-1.4-.868-2.138-.854-.462.009-.859.134-1.125.321-.256.18-.384.41-.384.68 0 .403.095.638.291.834.226.226.632.446 1.367.691.72.24 1.423.462 1.929.794.265.175.5.394.667.684.167.292.246.625.246.997 0 1.306-1.233 2.028-2.463 2.12l-.037.001V20h-1v-.935c-1.014-.178-2.07-.729-2.89-1.754L9 17l.39-.312c.894 1.116 2.107 1.507 3.073 1.435C13.483 18.047 14 17.519 14 17a1 1 0 0 0-.113-.5 1.04 1.04 0 0 0-.349-.345c-.37-.242-.916-.421-1.696-.681-.765-.255-1.36-.534-1.758-.933-.429-.429-.584-.945-.584-1.541 0-.65.333-1.163.808-1.497.339-.24.753-.39 1.192-.46V10h1z" fill="currentColor"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="links.0.label" value={links[0]?.label ?? "Najít nemovitost"} tag="span" />
            </a>
            {/* Nabídnout nemovitost */}
            <a
              href={resolve("/nabidnout-nemovitost")}
              className="r01-nav-link"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, textDecoration: "none", color: TEXT, fontSize: 14, fontWeight: 400, letterSpacing: "0.01em", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f4f6f7"; (e.currentTarget as HTMLElement).style.color = DARK; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = TEXT; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m12.307 2.605 9.193 7.15V21h-1V10.244L12 3.633l-8.5 6.611V21h-1V9.756l9.193-7.15.307-.24z" fill="currentColor"/>
                <path fillRule="evenodd" d="M17 18h-4.5v3h-1v-3H7v-7h10zm-9-1h8v-5H8z" clipRule="evenodd" fill="currentColor"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="links.1.label" value={links[1]?.label ?? "Nabídnout nemovitost"} tag="span" />
            </a>
          </div>

          {/* Pravá strana: search + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {/* Search ikona */}
            <button
              aria-label="Hledat nemovitosti"
              className="r01-search-btn"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: 6, color: TEXT, display: "flex", alignItems: "center", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f4f6f7"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path fillRule="evenodd" d="M13 4a7 7 0 0 0-5.605 11.191l-3.602 3.602 1.414 1.414 3.602-3.602A7 7 0 1 0 13 4m0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10" clipRule="evenodd" fill="currentColor"/>
              </svg>
            </button>

            {/* Hamburger — vždy viditelný pro mobile overlay */}
            <button
              className="r01-hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Otevřít menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: 6, color: TEXT, display: "flex", flexDirection: "column", gap: 4, transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f4f6f7"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <span style={{ display: "block", width: 22, height: 1.5, backgroundColor: TEXT }} />
              <span style={{ display: "block", width: 22, height: 1.5, backgroundColor: TEXT }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 199, backgroundColor: "rgba(0,0,0,0.45)" }}
          aria-hidden="true"
        />
      )}

      {/* Right-side sidebar */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigační menu"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 200,
          width: "clamp(300px, 85vw, 420px)",
          backgroundColor: DARK,
          display: "flex", flexDirection: "column", padding: "28px 32px",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
        }}
      >
        {/* Sidebar header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 56 }}>
          <a href={resolve("/")} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 3, lineHeight: 1 }}>
            <span style={{ fontFamily: MONTSERRAT, fontSize: 16, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#ffffff" }}>Luxusní</span>
            <span style={{ fontFamily: MONTSERRAT, fontSize: 8, fontWeight: 400, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textAlign: "center" }}>Nemovitosti</span>
          </a>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Zavřít menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: "4px", marginTop: 4, flexShrink: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Sidebar nav links */}
        <nav style={{ flex: 1 }}>
          {[
            { label: links[0]?.label ?? "Najít nemovitost", href: "/vypis-nemovitosti" },
            { label: links[1]?.label ?? "Nabídnout nemovitost", href: "/nabidnout-nemovitost" },
            { label: "Služby", href: "/sluzby" },
            { label: "O nás", href: "/o-nas" },
            { label: "Kontakt", href: "/kontakt" },
          ].map((l, i) => (
            <a
              key={i}
              href={resolve(l.href)}
              onClick={() => setMenuOpen(false)}
              style={{ display: "block", fontSize: 18, fontWeight: 600, color: WHITE, textDecoration: "none", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: MONTSERRAT, letterSpacing: "0.02em" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Sidebar footer — kontakt */}
        <div style={{ marginTop: 48, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 24 }}>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, marginBottom: 10, fontFamily: MONTSERRAT, letterSpacing: "0.1em", textTransform: "uppercase" }}>Kontakt</p>
          <a href={`tel:+420${phone.replace(/\s/g, "")}`} style={{ color: WHITE, textDecoration: "none", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6, fontFamily: MONTSERRAT }}>
            <GenericEditableText sectionId={sectionId} field="phone" value={`+420 ${phone}`} tag="span" />
          </a>
          <a href={`mailto:${email}`} style={{ color: "#d4a96e", textDecoration: "none", fontSize: 11, fontFamily: MONTSERRAT }}>
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) { .r01-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}

// ── reality-05-navbar ─────────────────────────────────────────────────────────
// Ref: ondrejkucera.com
// Sticky tmavý (#111111) navbar výška 72px
// Layout: [SVG serif logotyp vlevo] | [flat nav linky bílé, hover = zlatý #CFA968 bg-box] |
//         [bez CTA pilu — aktivní stav = golden square highlight]
// Mobile: fullscreen tmavý (#111111) overlay + bílý text
// Přesné hodnoty: bg #111111, text #ffffff, active/hover bg #CFA968, text #ffffff
// ─────────────────────────────────────────────────────────────────────────────
function NavbarReality05({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName = String(content.siteName ?? "Demo Pavel Červenka");
  const logoUrl  = String(content.logoUrl  ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BG      = "#111111";
  const WHITE   = "#ffffff";
  const PRIMARY = "#CFA968";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: BG }}
        data-template="reality-05"
      >
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 clamp(16px, 3vw, 48px)", height: 72, display: "flex", alignItems: "center" }}>

          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 52, width: "auto", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <span style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700, color: WHITE }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            )}
          </a>

          {/* Desktop nav — hned za logem s odsazením, bílé linky, hover = golden square box */}
          <nav className="r05-nav-links" style={{ display: "flex", alignItems: "stretch", height: "100%", gap: 0, marginLeft: 32, flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`r05-nav-${i}`}
                href={resolve(l.href)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  fontFamily: SANS,
                  fontSize: 18,
                  fontWeight: 400,
                  color: WHITE,
                  textDecoration: "none",
                  padding: "0 20px",
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  backgroundColor: hovered === i ? PRIMARY : "transparent",
                  transition: "background-color 0.18s",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Hamburger */}
          <button
            className="r05-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 5, marginLeft: "auto" }}
          >
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: WHITE }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: WHITE }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: WHITE }} />
          </button>
        </div>
      </header>

      {/* Mobile overlay backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.55)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.28s" }}
        aria-hidden
      />

      {/* Mobile fullscreen menu */}
      <div style={{ position: "fixed", inset: 0, zIndex: 201, backgroundColor: BG, display: "flex", flexDirection: "column", transform: open ? "translateY(0)" : "translateY(-100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          {logoUrl
            ? <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto" }} />
            : <span style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 700, color: WHITE }}>{siteName}</span>
          }
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`r05-mob-${i}`}>
                <a
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: SANS, fontSize: 16, fontWeight: 400, color: WHITE, textDecoration: "none", display: "block", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = PRIMARY; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        @media (min-width: 1024px) { .r05-hamburger { display: none !important; } }
        @media (max-width: 1023px) { .r05-nav-links { display: none !important; } }
      `}</style>
    </>
  );
}

// ── reality-06-navbar ─────────────────────────────────────────────────────────
// Ref: srubar.cz (jan-srubar) — osobní stránka makléře
// Layout: [DK monogram logo vlevo] | [nav linky uprostřed] | [social icons + sep + moon + flag vpravo]
// Přesné hodnoty z klonu: bg #ffffff, primary #263A82, text #141414, výška 72px
// ─────────────────────────────────────────────────────────────────────────────
function NavbarReality06({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName    = String(content.siteName    ?? "Dominik Krejčí");
  const logoUrl     = String(content.logoUrl     ?? "");
  const logoAlt     = String((content.logoAlt as string | undefined) ?? siteName);
  const ctaHref     = String(content.ctaHref     ?? "#kontakt");
  const fbUrl       = String((content.facebookUrl  as string | undefined) ?? "https://facebook.com/demo");
  const igUrl       = String((content.instagramUrl as string | undefined) ?? "https://instagram.com/demo");
  const liUrl       = String((content.linkedinUrl  as string | undefined) ?? "https://linkedin.com/in/demo");
  const ytUrl       = String((content.youtubeUrl   as string | undefined) ?? "https://youtube.com/demo");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];

  const WHITE   = "#ffffff";
  const DARK    = "#141414";
  const PRIMARY = "#263A82";
  const BORDER  = "#e5e7eb";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const [open, setOpen] = useState(false);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const initials = siteName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: WHITE, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 8px rgba(38,58,130,0.06)" }}
        data-template="reality-06"
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)", height: 72, display: "flex", alignItems: "center" }}>

          {/* Logo */}
          <a href={resolve("/")} aria-label={logoAlt} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0, marginRight: 32 }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={logoAlt} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={logoAlt} style={{ height: 48, width: "auto", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 42, height: 42, borderRadius: 6, backgroundColor: PRIMARY, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: WHITE, letterSpacing: "-0.5px" }}>{initials}</span>
                </span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: DARK, lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 400, color: MUTED, letterSpacing: "1.4px", textTransform: "uppercase", lineHeight: 1.2, marginTop: 2 }}>realitní makléř</span>
                </span>
              </span>
            )}
          </a>

          {/* Desktop nav — flex-1 */}
          <nav className="r06-nav-links" style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`r06-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: PRIMARY, textDecoration: "none", padding: "0 13px", lineHeight: "72px", transition: "opacity 0.18s", whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.65")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA button — desktop */}
          <a href={resolve(ctaHref)} data-btn="primary" className="r06-nav-links"
            style={{ display: "inline-flex", alignItems: "center", marginLeft: 16, padding: "9px 20px", backgroundColor: PRIMARY, color: WHITE, fontFamily: SANS, fontSize: 14, fontWeight: 600, textDecoration: "none", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={String(content.ctaText ?? "Nezávazná konzultace")} tag="span" />
          </a>

          {/* Right: social icons + separator + dark mode + language */}
          <div className="r06-right-icons" style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0, marginLeft: 8 }}>
            <a href={igUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, color: DARK, textDecoration: "none", borderRadius: 6, transition: "color 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, color: DARK, textDecoration: "none", borderRadius: 6, transition: "color 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href={liUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, color: DARK, textDecoration: "none", borderRadius: 6, transition: "color 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href={ytUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, color: DARK, textDecoration: "none", borderRadius: 6, transition: "color 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <span style={{ width: 1, height: 20, backgroundColor: BORDER, margin: "0 6px" }} />
            <button aria-label="Přepnout tmavý režim"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "none", border: "none", cursor: "pointer", color: DARK, borderRadius: 6, transition: "color 0.18s" }}
              onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <button aria-label="Změnit jazyk"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "none", border: "none", cursor: "pointer", borderRadius: 6 }}
            >
              <svg width="22" height="15" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="60" height="40" fill="#012169"/>
                <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8"/>
                <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="5"/>
                <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="12"/>
                <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="8"/>
              </svg>
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="r06-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 5, marginLeft: 16 }}
          >
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: DARK }} />
            <span style={{ display: "block", width: 24, height: 2, backgroundColor: DARK }} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.35)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.28s" }}
        aria-hidden
      />

      {/* Mobile sidebar */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201, width: "clamp(280px, 80vw, 340px)", backgroundColor: WHITE, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: open ? "-4px 0 24px rgba(38,58,130,0.12)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 32, height: 32, borderRadius: 5, backgroundColor: PRIMARY, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: WHITE }}>{initials}</span>
            </span>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: DARK }}>{siteName}</span>
          </span>
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={`r06-mob-${i}`}>
                <a
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: SANS, fontSize: 15, fontWeight: 400, color: DARK, textDecoration: "none", display: "block", padding: "15px 24px", borderBottom: `1px solid ${BORDER}`, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = PRIMARY)}
                  onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}` }}>
          <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
            style={{ display: "block", textAlign: "center", padding: "12px 20px", backgroundColor: PRIMARY, color: WHITE, fontFamily: SANS, fontSize: 14, fontWeight: 600, textDecoration: "none", borderRadius: 99 }}
          >
            {String(content.ctaText ?? "Nezávazná konzultace")}
          </a>
        </div>
        <div style={{ padding: "16px 24px 40px", display: "flex", gap: 16, justifyContent: "center" }}>
          {([{ href: igUrl, label: "Instagram" }, { href: fbUrl, label: "Facebook" }, { href: liUrl, label: "LinkedIn" }, { href: ytUrl, label: "YouTube" }] as Array<{href: string; label: string}>).map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              style={{ color: MUTED, textDecoration: "none", fontSize: 12, fontFamily: SANS }}
            >{label}</a>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .r06-hamburger { display: none !important; } }
        @media (max-width: 899px) { .r06-nav-links { display: none !important; } .r06-right-icons { display: none !important; } }
      `}</style>
    </>
  );
}

// ── autoservis-01-navbar ────────────────────────────────────────────────────
// Sticky bílý navbar 72px, oranžové #FFA500 CTA, hamburger → fullscreen overlay
// 1:1 referencia: bestdrive.cz — bílý korporátní autoservis design
// ───────────────────────────────────────────────────────────────────────────
function NavbarAutoservis01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName         = String(content.siteName  ?? "Demo BestDrive");
  const logoUrl          = String(content.logoUrl   ?? "");
  const ctaText          = String(content.ctaText   ?? "Objednat online");
  const ctaHref          = String(content.ctaHref   ?? "#kontakt");
  const phone            = String((content.phone as string | undefined) ?? "704 123 456");
  const links            = (content.links as Array<{ label: string; href: string }>) ?? [];
  const annText          = String((content.announcementText    as string | undefined) ?? "");
  const annSubtext       = String((content.announcementSubtext as string | undefined) ?? "");
  const annCta           = String((content.announcementCta     as string | undefined) ?? "");
  const annCtaHref       = String((content.announcementCtaHref as string | undefined) ?? "#");

  const WHITE   = "#ffffff";
  const DARK    = "#111111";
  const ORANGE  = "#FFA500";
  const BORDER  = "#e0e0e0";
  const MUTED   = "#6b7280";
  const SANS    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const ANN_KEY = "a01-ann-dismissed";

  const [open, setOpen] = useState(false);
  const [annVisible, setAnnVisible] = useState(false);
  const [annClosing, setAnnClosing] = useState(false);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  // Načti stav z localStorage — jen pokud je announcement nastaven
  useEffect(() => {
    if (!annText) return;
    try {
      const dismissed = localStorage.getItem(ANN_KEY);
      if (!dismissed) setAnnVisible(true);
    } catch { setAnnVisible(true); }
  }, [annText]);

  const dismissAnn = () => {
    setAnnClosing(true);
    setTimeout(() => {
      setAnnVisible(false);
      setAnnClosing(false);
      try { localStorage.setItem(ANN_KEY, "1"); } catch { /* ignore */ }
    }, 300);
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Sticky wrapper — obsahuje announcement + header v jednom sticky bloku */}
      <div className="sticky top-0 z-50 w-full">

        {/* Announcement bar — vždy renderováno, skryto přes max-height (SSR-safe) */}
        {annText && (
          <div
            suppressHydrationWarning
            style={{
              backgroundColor: ORANGE,
              overflow: "hidden",
              maxHeight: annVisible && !annClosing ? 80 : 0,
              opacity: annVisible && !annClosing ? 1 : 0,
              transition: "max-height 0.3s ease, opacity 0.3s ease",
            }}
          >
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)", height: 80, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, position: "relative" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: SANS, fontSize: 16.5, fontWeight: 700, color: DARK, lineHeight: 1.3 }}>
                  <GenericEditableText sectionId={sectionId} field="announcementText" value={annText} tag="span" />
                </div>
                {annSubtext && (
                  <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500, color: DARK, opacity: 0.75, lineHeight: 1.3, marginTop: 2 }}>
                    <GenericEditableText sectionId={sectionId} field="announcementSubtext" value={annSubtext} tag="span" />
                  </div>
                )}
              </div>
              {annCta && (
                <a
                  href={resolve(annCtaHref)}
                  style={{ display: "inline-block", padding: "9px 20px", backgroundColor: DARK, color: WHITE, fontFamily: SANS, fontSize: 14.5, fontWeight: 600, textDecoration: "none", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.18s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <GenericEditableText sectionId={sectionId} field="announcementCta" value={annCta} tag="span" />
                </a>
              )}
              <button
                onClick={dismissAnn}
                aria-label="Zavřít oznámení"
                style={{ position: "absolute", right: "clamp(16px, 3vw, 40px)", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 6, color: DARK, opacity: 0.7, transition: "opacity 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        <header
          style={{ backgroundColor: WHITE, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
          data-template="autoservis-01"
        >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 3vw, 40px)", height: 72, display: "flex", alignItems: "center", gap: 8 }}>

          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0, marginRight: 32 }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                {/* Orange circle badge with A */}
                <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>A</span>
                </span>
                {/* APEX wordmark */}
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                  <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: DARK, letterSpacing: "-0.5px" }}>APEX</span>
                  <span style={{ display: "block", height: 2.5, backgroundColor: ORANGE, borderRadius: 1, margin: "4px 0" }} />
                  <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "3.5px" }}>AUTOSERVIS</span>
                </span>
              </span>
            )}
          </a>

          {/* Desktop nav links */}
          <nav className="a01-nav-links" style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`a01-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: DARK, textDecoration: "none", padding: "0 14px", lineHeight: "72px", whiteSpace: "nowrap", transition: "color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
                onMouseLeave={e => (e.currentTarget.style.color = DARK)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Phone — desktop */}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="a01-nav-links"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto", fontFamily: SANS, fontSize: 14, fontWeight: 600, color: DARK, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
            onMouseLeave={e => (e.currentTarget.style.color = DARK)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>

          {/* CTA button — desktop */}
          <a href={resolve(ctaHref)} data-btn="primary" className="a01-nav-links"
            style={{ display: "inline-flex", alignItems: "center", marginLeft: 12, padding: "10px 22px", backgroundColor: ORANGE, color: DARK, fontFamily: SANS, fontSize: 14, fontWeight: 700, textDecoration: "none", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.18s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Hamburger — mobile */}
          <button
            className="a01-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, marginLeft: "auto" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>
      </div>{/* /sticky wrapper */}

      {/* Mobile fullscreen overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: WHITE, zIndex: 9999, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 64, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: DARK }}>{siteName}</span>
            <button onClick={() => setOpen(false)} aria-label="Zavřít menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {links.map((l, i) => (
                <li key={`a01-mob-${i}`}>
                  <a
                    href={resolve(l.href)}
                    onClick={() => setOpen(false)}
                    style={{ fontFamily: SANS, fontSize: 17, fontWeight: 500, color: DARK, textDecoration: "none", display: "block", padding: "16px 24px", borderBottom: `1px solid ${BORDER}`, transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
                    onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ padding: "16px 24px" }}>
            <a href={`tel:${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontSize: 16, fontWeight: 600, color: DARK, textDecoration: "none", marginBottom: 12 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {phone}
            </a>
          </div>
          <div style={{ padding: "0 24px 32px" }}>
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
              style={{ display: "block", textAlign: "center", padding: "14px 20px", backgroundColor: ORANGE, color: DARK, fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: "none", borderRadius: 6 }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) { .a01-hamburger { display: none !important; } }
        @media (max-width: 859px) { .a01-nav-links { display: none !important; } .a01-hamburger { display: flex !important; } }
      `}</style>
    </>
  );
}

// ── autoservis-03-navbar ────────────────────────────────────────────────────
// Dark sticky navbar 64px — bg black/95 + orange-500 border-bottom/20
// CTA "REZERVACE" — orange gradient rounded-full
// 1:1 reference: tomas clone — dark BMW autoservis
// ───────────────────────────────────────────────────────────────────────────
function NavbarAutoservis03({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName = String(content.siteName ?? "Demo Autoservis Tomáš");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "REZERVACE");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const phone    = String((content.phone as string | undefined) ?? "704 123 456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BLACK  = "#000000";
  const WHITE  = "#ffffff";
  const ORANGE = "#f97316";
  const MUTED  = "#9ca3af";
  const BORDER = "rgba(249,115,22,0.2)";
  const SANS   = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

  const [open, setOpen] = useState(false);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* fixed — navbar překrývá hero (žádný sticky push) */}
      <header
        className="fixed top-0 z-50 w-full"
        style={{
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
        }}
        data-template="autoservis-03"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)", height: 64, display: "flex", alignItems: "center", gap: 8 }}>

          {/* Logo — pouze text, bez ikony */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0, marginRight: 32 }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 36, width: "auto", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: WHITE, letterSpacing: "-0.3px" }}>
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            )}
          </a>

          {/* Desktop nav links */}
          <nav className="a03-nav-links" style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`a03-nav-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: SANS, fontSize: 15.4, fontWeight: 500, color: WHITE, textDecoration: "none", padding: "0 12px", lineHeight: "64px", whiteSpace: "nowrap", transition: "color 0.18s" }}
                onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
                onMouseLeave={e => (e.currentTarget.style.color = WHITE)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA rounded-full orange gradient — REZERVACE */}
          <a href={resolve(ctaHref)} data-btn="primary" className="a03-nav-links"
            style={{
              display: "inline-flex", alignItems: "center", marginLeft: 12, padding: "8px 22px",
              background: "linear-gradient(to right, #f97316, #ea6c08)",
              color: WHITE, fontFamily: SANS, fontSize: 14.3, fontWeight: 700, textDecoration: "none",
              borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0, transition: "opacity 0.18s",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Hamburger — mobile */}
          <button
            className="a03-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, marginLeft: "auto" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile fullscreen dark overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: BLACK, zIndex: 9999, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 64, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: WHITE, textTransform: "uppercase" }}>{siteName}</span>
            <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {links.map((l, i) => (
                <li key={`a03-mob-${i}`}>
                  <a
                    href={resolve(l.href)}
                    onClick={() => setOpen(false)}
                    style={{ fontFamily: SANS, fontSize: 17, fontWeight: 500, color: WHITE, textDecoration: "none", display: "block", padding: "16px 24px", borderBottom: `1px solid rgba(255,255,255,0.08)`, transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
                    onMouseLeave={e => (e.currentTarget.style.color = WHITE)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ padding: "16px 24px" }}>
            <a href={`tel:${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontSize: 16, fontWeight: 600, color: WHITE, textDecoration: "none", marginBottom: 12 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {phone}
            </a>
          </div>
          <div style={{ padding: "0 24px 32px" }}>
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
              style={{ display: "block", textAlign: "center", padding: "14px 20px", background: "linear-gradient(to right,#f97316,#ea6c08)", color: WHITE, fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: "none", borderRadius: 999, letterSpacing: "0.5px" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) { .a03-hamburger { display: none !important; } }
        @media (max-width: 859px) { .a03-nav-links { display: none !important; } .a03-hamburger { display: flex !important; } }
      `}</style>
    </>
  );
}

// ── autoservis-02-navbar ─────────────────────────────────────────────────────
// Top info bar (#f5f5f5, 36px) + sticky bílý navbar 80px + dropdown mega-menu
// Bez CTA tlačítka. Logo: wordmark "GARANT / AUTOSERVIS" Audi-servis styl.
// 1:1 referencia: autoservis-garant.cz — červený #d82a2a akcent, Open Sans
// ────────────────────────────────────────────────────────────────────────────
type A02NavLink = { label: string; href: string; children?: A02NavLink[] };
function NavbarAutoservis02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName = String(content.siteName ?? "Demo GARANT");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String((content.phone as string | undefined) ?? "704 123 456");
  const email    = String((content.email as string | undefined) ?? "email@demo.cz");
  const hours    = String((content.hours as string | undefined) ?? "Po–Pá 8–17, So 8–14");
  const links    = (content.links as A02NavLink[]) ?? [];

  const WHITE  = "#ffffff";
  const DARK   = "#1a1a1a";
  const RED    = "#d82a2a";
  const GRAY   = "#f5f5f5";
  const BORDER = "#e0e0e0";
  const MUTED  = "#6b7280";
  const SANS   = "'Open Sans', Arial, sans-serif";
  const NAV_H  = 80;

  const [open, setOpen]             = useState(false);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Top info bar */}
      <div style={{ backgroundColor: GRAY, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)", height: 36, display: "flex", alignItems: "center", gap: 20 }}>
          <a href={`tel:${phone.replace(/\s/g, "")}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: DARK, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = RED)}
            onMouseLeave={e => (e.currentTarget.style.color = DARK)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" className="a02-topbar" />
          </a>
          <a href={`mailto:${email}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: SANS, fontSize: 12, fontWeight: 400, color: MUTED, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = RED)}
            onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" className="a02-topbar" />
          </a>
          <span className="a02-topbar" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: SANS, fontSize: 12, color: MUTED, marginLeft: "auto" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" />
          </span>
        </div>
      </div>

      {/* Main navbar — 80px (o 25% vyšší než původní 64px) */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: WHITE, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 2px 10px rgba(0,0,0,0.07)" }}
        data-template="autoservis-02"
      >
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)", height: NAV_H, display: "flex", alignItems: "center", gap: 8 }}>

          {/* Logo — Audi Servis wordmark: GARANT bold / AUTOSERVIS red */}
          <a href={resolve("/")} aria-label={siteName}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0, marginRight: 32 }}
          >
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
                <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 46, width: "auto", display: "block" }} />
              </GenericEditableImage>
            ) : (
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, gap: 3 }}>
                <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: DARK, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
                <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: RED, letterSpacing: "4px", textTransform: "uppercase" }}>autoservis</span>
              </span>
            )}
          </a>

          {/* Desktop nav — dropdown on hover via CSS .a02-item:hover .a02-dropdown */}
          <nav className="a02-nav" style={{ display: "flex", alignItems: "center", flex: 1, height: NAV_H }}>
            {links.map((l, i) => (
              <div key={`a02-item-${i}`} className="a02-item" style={{ position: "relative", height: NAV_H, display: "flex", alignItems: "center" }}>
                <a
                  href={resolve(l.href)}
                  style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: DARK, textDecoration: "none", padding: "0 11px", height: NAV_H, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = RED)}
                  onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  {l.children && l.children.length > 0 && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                </a>
                {l.children && l.children.length > 0 && (
                  <div className="a02-dropdown" style={{
                    position: "absolute", top: NAV_H, left: 0,
                    backgroundColor: WHITE, border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    minWidth: 260, maxWidth: 300,
                    borderTop: `3px solid ${RED}`,
                    zIndex: 100, display: "none", flexDirection: "column",
                    maxHeight: "calc(100vh - 160px)", overflowY: "auto",
                  }}>
                    {l.children.map((ch, ci) => (
                      <a key={`a02-ch-${i}-${ci}`}
                        href={resolve(ch.href)}
                        style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 400, color: DARK, textDecoration: "none", padding: "9px 16px", borderBottom: `1px solid #f0f0f0`, display: "block", transition: "background 0.12s, color 0.12s" }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#fff5f5"; e.currentTarget.style.color = RED; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = DARK; }}
                      >
                        {ch.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Hamburger — mobile */}
          <button
            className="a02-hamburger"
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, marginLeft: "auto" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: WHITE, zIndex: 9999, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 64, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: "0.5px" }}>{siteName}</span>
            <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div style={{ backgroundColor: GRAY, padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: DARK, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {phone}
            </a>
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {links.map((l, i) => (
                <li key={`a02-mob-${i}`}>
                  {l.children && l.children.length > 0 ? (
                    <>
                      <button
                        onClick={() => setMobileOpen(mobileOpen === i ? null : i)}
                        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: DARK, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${BORDER}` }}
                      >
                        {l.label}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ transform: mobileOpen === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      {mobileOpen === i && (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0, backgroundColor: "#fafafa" }}>
                          {l.children.map((ch, ci) => (
                            <li key={`a02-mob-ch-${i}-${ci}`}>
                              <a href={resolve(ch.href)} onClick={() => setOpen(false)}
                                style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, color: DARK, textDecoration: "none", display: "block", padding: "11px 24px 11px 36px", borderBottom: `1px solid #f0f0f0` }}
                                onMouseEnter={e => (e.currentTarget.style.color = RED)}
                                onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                              >
                                {ch.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <a href={resolve(l.href)} onClick={() => setOpen(false)}
                      style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: DARK, textDecoration: "none", display: "block", padding: "14px 24px", borderBottom: `1px solid ${BORDER}` }}
                      onMouseEnter={e => (e.currentTarget.style.color = RED)}
                      onMouseLeave={e => (e.currentTarget.style.color = DARK)}
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) { .a02-hamburger { display: none !important; } }
        @media (max-width: 859px) { .a02-nav { display: none !important; } .a02-hamburger { display: flex !important; } }
        @media (max-width: 600px) { .a02-topbar { display: none !important; } }
        .a02-item:hover .a02-dropdown { display: flex !important; }
      `}</style>
    </>
  );
}

// ── dental-01-navbar ─────────────────────────────────────────────────────────
// Transparent overlay nad hero (BEZ spacer divu — header se překrývá s hero).
// Bílý + shadow po scrollu.
// Layout: [Logo vlevo] ··· [Nav links | FB IG icons | CTA tlačítko]
// Logo: SVG wordmark "Magic Smile" bílý na transparent, teal#14a2a8 po scrollu.
// Nav links: white transparent → #1c2335 scrolled, hover teal, uppercase, 13px.
// Social FB+IG: bílé ikony na transparent, teal po scrollu.
// CTA "Objednat se": teal pill, border-radius 10px.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarDental01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const TEAL  = "#14a2a8";
  const DARK  = "#1c2335";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', 'Arial', sans-serif";
  const HEIGHT = 100;

  const isScrolled = scrolled || open;
  const bgColor    = isScrolled ? WHITE : "rgba(0,0,0,0)";
  const shadow     = isScrolled ? "0px 4px 24px rgba(0,0,0,.18)" : "none";
  const linkColor  = isScrolled ? DARK : WHITE;
  const logoColor  = isScrolled ? TEAL : WHITE;
  const logoText   = isScrolled ? DARK : WHITE;
  const iconColor  = isScrolled ? TEAL : WHITE;

  const siteName = String(content.siteName ?? "Demo Magic Smile");
  const ctaText  = String(content.ctaText  ?? "Objednat se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const fbHref   = String(content.fbHref   ?? "https://facebook.com");
  const igHref   = String(content.igHref   ?? "https://instagram.com");

  const defaultLinks = [
    { label: "O NÁS",    href: "#o-nas" },
    { label: "POBOČKY",  href: "#pobocky" },
    { label: "SLUŽBY",   href: "#sluzby" },
    { label: "CENÍK",    href: "#cenik" },
    { label: "KONTAKTY", href: "#kontakt" },
  ];
  const navLinks = links.length > 0
    ? links.map(l => ({ ...l, label: l.label.toUpperCase() }))
    : defaultLinks;

  return (
    <>
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: HEIGHT,
        backgroundColor: bgColor,
        boxShadow: shadow,
        transition: "background-color 0.3s, box-shadow 0.3s",
        fontFamily: FONT,
      }}>
        <div style={{
          maxWidth: 1340,
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>

          {/* ── Logo (vlevo, flexShrink:0) ── */}
          <a href={resolveDemoHref("/", tenantSlug, isAdmin)} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <svg width="38" height="42" viewBox="0 0 38 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <path d="M19 2C12.4 2 6 7.2 6 14.5c0 3.2 1.1 5.8 2 8C9.9 26.2 10.5 28.5 10.5 31c0 4.2 1.7 7.8 3.2 10.2.7 1.2 1.6 1.8 2.6 1.8 1.2 0 1.9-.9 2.1-2.6L19 35.5l.6 4.9c.3 1.7.9 2.6 2.1 2.6 1 0 1.9-.6 2.6-1.8 1.5-2.4 3.2-6 3.2-10.2 0-2.5.6-4.8 2.5-8.5.9-2.2 2-4.8 2-8C32 7.2 25.6 2 19 2Z" fill={logoColor} />
              <path d="M14.5 36c0 1.5.3 3.2.8 4.6.2.6.5.9.8.9.4 0 .6-.4.7-1.1l.7-5.4h-3Z" fill={logoColor} opacity="0.6" />
              <path d="M23.5 36h-3l.7 5.4c.1.7.3 1.1.7 1.1.3 0 .6-.3.8-.9.5-1.4.8-3.1.8-4.6Z" fill={logoColor} opacity="0.6" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 800, color: logoColor, letterSpacing: "0.04em", fontFamily: FONT }}>Dental</span>
              <span style={{ fontSize: "1.05rem", fontWeight: 600, color: logoText, letterSpacing: "0.08em", fontFamily: FONT }}>CARE</span>
            </div>
          </a>

          {/* ── Nav centrovaný + social ikony (absolutní pozice = true center) ── */}
          <nav className="d01-nav-center" style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 32px)",
          }}>
            {navLinks.map((l, i) => (
              <a
                key={`d01-link-${i}`}
                href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                style={{
                  textDecoration: "none", color: linkColor,
                  fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.08em",
                  transition: "color 0.18s", whiteSpace: "nowrap", fontFamily: FONT,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.color = linkColor; }}
              >
                {l.label}
              </a>
            ))}
            {/* Separator */}
            <span style={{ width: 1, height: 16, backgroundColor: iconColor, opacity: 0.35, flexShrink: 0 }} aria-hidden />
            {/* Facebook */}
            <a href={fbHref} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              style={{ color: iconColor, transition: "color 0.18s", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = TEAL; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = iconColor; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            {/* Instagram */}
            <a href={igHref} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              style={{ color: iconColor, transition: "color 0.18s", display: "flex", alignItems: "center" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = TEAL; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = iconColor; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </nav>

          {/* ── CTA (vpravo) ── */}
          <div className="d01-right" style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            {/* CTA */}
            <a
              href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
              data-btn="primary"
              className="d01-cta"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "11px 22px", backgroundColor: TEAL, color: WHITE,
                fontSize: "0.94rem", fontWeight: 700, fontFamily: FONT, letterSpacing: "0.06em",
                textDecoration: "none", borderRadius: 10, border: `2px solid ${TEAL}`,
                transition: "background-color 0.18s, border-color 0.18s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0e787b"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#0e787b"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = TEAL; (e.currentTarget as HTMLAnchorElement).style.borderColor = TEAL; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            className="d01-hamburger"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: isScrolled ? DARK : WHITE }}
          >
            {open
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            }
          </button>
        </div>
      </header>

      {/* BEZ spacer divu — header se překrývá s hero sekcí */}

      <style>{`
        @media (min-width: 900px) { .d01-hamburger { display: none !important; } }
        @media (max-width: 899px) {
          .d01-nav-center { display: none !important; }
          .d01-right { display: none !important; }
          .d01-hamburger { display: flex !important; }
        }
      `}</style>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          backgroundColor: WHITE,
          display: "flex", flexDirection: "column",
          padding: `${HEIGHT + 8}px 32px 40px`,
          overflowY: "auto",
        }}>
          {navLinks.map((l, i) => (
            <a
              key={`d01-mob-${i}`}
              href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "16px 0",
                fontSize: "1rem",
                fontFamily: FONT,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: DARK,
                textDecoration: "none",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = TEAL; }}
              onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
            <a href={fbHref} target="_blank" rel="noopener noreferrer" style={{ color: TEAL }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href={igHref} target="_blank" rel="noopener noreferrer" style={{ color: TEAL }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
          <a
            href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "14px 28px",
              backgroundColor: TEAL, color: WHITE,
              fontSize: "0.9rem", fontWeight: 700, fontFamily: FONT, letterSpacing: "0.06em",
              textDecoration: "none", borderRadius: 10,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      )}
    </>
  );
}

// ── ortho-01-navbar ──────────────────────────────────────────────────────────
// Transparent overlay nad hero (margin-bottom -84px), bílý + shadow po scrollu.
// Logo: inline SVG tooth + wordmark — bílý transparent, teal+slate po scrollu.
// Nav: 6 linků. CTA: teal #00b7ad pill "Konzultace zdarma" + bílá šipka.
// Mobile: fullscreen slate #244757 overlay s bílými linky.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarOrtho01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const TEAL  = "#00b7ad";
  const SLATE = "#244757";
  const WHITE = "#ffffff";
  const FONT  = "'Inter', 'Arial', sans-serif";
  const HEIGHT = 92; // +10% of original 84px

  const isScrolled = scrolled || open;
  const bgColor   = isScrolled ? WHITE : "rgba(0,0,0,0)";
  const shadow    = isScrolled ? "0 2px 20px rgba(0,0,0,0.12)" : "none";
  const linkColor = isScrolled ? SLATE : WHITE;
  const logoTooth = isScrolled ? TEAL : WHITE;
  const logoText  = isScrolled ? SLATE : WHITE;
  const logoSub   = isScrolled ? TEAL  : "rgba(255,255,255,0.75)";

  const siteName  = String(content.siteName  ?? "Demo Svět rovnátek");
  const logoLine1 = String(content.logoLine1 ?? "Neviditelná");
  const logoLine2 = String(content.logoLine2 ?? "Rovnátka");
  const ctaText   = String(content.ctaText   ?? "Konzultace zdarma");
  const ctaHref   = String(content.ctaHref   ?? "#kontakt");
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];

  const defaultLinks = [
    { label: "Pro děti",       href: "#sluzby" },
    { label: "Pro teenagery",  href: "#sluzby" },
    { label: "Smile Makeover", href: "#sluzby" },
    { label: "Financování",    href: "#financovani" },
    { label: "FAQ",            href: "#faq" },
    { label: "Kontakt",        href: "#kontakt" },
  ];
  const navLinks = links.length > 0 ? links : defaultLinks;
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: HEIGHT,
        backgroundColor: bgColor,
        boxShadow: shadow,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        fontFamily: FONT,
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px)",
          height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }} title={siteName}>
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M18 2C13.2 2 9 5.8 9 10.8c0 2.3.7 4.3 1.5 6.2 1.2 2.8 1.5 4.8 1.5 7 0 3.2 1.1 6.4 2.3 8.8.5 1 1.2 1.7 2.2 1.7 1 0 1.6-.8 1.9-2.2l.6-4 .6 4c.3 1.4.9 2.2 1.9 2.2 1 0 1.7-.7 2.2-1.7C27 30.4 27 27.2 27 24c0-2.2.3-4.2 1.5-7 .8-1.9 1.5-3.9 1.5-6.2C30 5.8 22.8 2 18 2Z" fill={logoTooth}/>
              <rect x="11" y="12.5" width="14" height="3" rx="0.8" fill={logoTooth} opacity=".2"/>
              <rect x="12.5" y="12.5" width="2.4" height="3" rx=".5" fill={logoTooth}/>
              <rect x="16.8" y="12.5" width="2.4" height="3" rx=".5" fill={logoTooth}/>
              <rect x="21.1" y="12.5" width="2.4" height="3" rx=".5" fill={logoTooth}/>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontSize: "1.01rem", fontWeight: 800, color: logoText, letterSpacing: "-0.01em", fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field="logoLine1" value={logoLine1} tag="span" />
              </span>
              <span style={{ fontSize: "1.01rem", fontWeight: 800, color: logoTooth, letterSpacing: "-0.01em", fontFamily: FONT }}>
                <GenericEditableText sectionId={sectionId} field="logoLine2" value={logoLine2} tag="span" />
              </span>
            </div>
          </a>

          {/* Nav links (desktop) */}
          <nav className="o01-nav" style={{ display: "flex", alignItems: "center", gap: 40, flexGrow: 1, justifyContent: "center" }}>
            {navLinks.map((l, i) => (
              <a
                key={`o01-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: FONT, fontSize: "0.91rem", fontWeight: 500, color: linkColor, textDecoration: "none", whiteSpace: "nowrap", transition: "color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.color = linkColor; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="o01-cta"
            style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, backgroundColor: TEAL, color: WHITE, fontFamily: FONT, fontSize: "0.91rem", fontWeight: 600, padding: "11px 22px", borderRadius: 999, textDecoration: "none", transition: "opacity 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>

          {/* Hamburger */}
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"} aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="o01-hamburger"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: isScrolled ? SLATE : WHITE, zIndex: 60 }}
          >
            {open
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            }
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 900px) {
          .o01-nav       { display: none !important; }
          .o01-cta       { display: none !important; }
          .o01-hamburger { display: flex !important; }
        }
      `}</style>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 49, backgroundColor: SLATE, display: "flex", flexDirection: "column", padding: "100px 32px 40px", overflowY: "auto" }}>
          {navLinks.map((l, i) => (
            <a
              key={`o01-mob-${i}`}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "16px 0", fontFamily: FONT, fontSize: "1.1rem", fontWeight: 500, color: WHITE, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)" }}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 32, padding: "14px 28px", backgroundColor: TEAL, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, borderRadius: 999, textDecoration: "none", alignSelf: "flex-start" }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      )}
    </>
  );
}

// ── ortho-02-navbar ───────────────────────────────────────────────────────────
// Transparentní navbar vnořená do hero — position:relative + marginBottom:-80px
// Logo vlevo: SVG wordmark "PREMIUM CARE" (#B7B3A5, font-weight 200)
// Nav linky vlevo (stejná strana jako logo — centrovány v prostoru), search+CZ vpravo
// Beze stínu, bez separátoru, bílá → viditelná po scrollu
// Reference: perfect-smile.cz
// ─────────────────────────────────────────────────────────────────────────────
function NavbarOrtho02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const WHITE  = "#ffffff";
  const BEIGE  = "#cdc9c0";
  const DARK   = "#1a1a1a";
  const FONT   = "'Raleway', 'Helvetica Neue', Arial, sans-serif";
  const NAV_H  = 80;

  // transparent na hero, bílé po scrollu
  const bgColor  = scrolled ? "rgba(255,255,255,0.97)" : "transparent";
  const shadow   = scrolled ? "0 1px 16px rgba(0,0,0,0.08)" : "none";
  const linkClr  = scrolled ? DARK : WHITE;
  const iconClr  = scrolled ? DARK : WHITE;

  const siteName = String(content.siteName ?? "Premium Care");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <header style={{
        position: "relative",
        zIndex: 50,
        marginBottom: -NAV_H,
        backgroundColor: bgColor,
        boxShadow: shadow,
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        fontFamily: FONT,
        height: NAV_H,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 40px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}>
          {/* Logo wordmark — PREMIUM CARE thin SVG text, 10% větší */}
          <a
            href={resolve("/")}
            style={{ textDecoration: "none", flexShrink: 0, lineHeight: 1, marginRight: 36 }}
            aria-label={siteName}
          >
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" style={{ display: "none" }} />
            <svg viewBox="0 0 300 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 27, display: "block" }}>
              <text
                x="0" y="26"
                fontFamily="'Raleway','Helvetica Neue',Arial,sans-serif"
                fontWeight="300"
                fontSize="24"
                letterSpacing="6"
                fill={scrolled ? BEIGE : WHITE}
              >PREMIUM CARE</text>
            </svg>
          </a>

          {/* Nav links */}
          <nav className="o02-nav" style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.6vw, 26px)", flex: 1 }}>
            {links.map((l, i) => (
              <a
                key={`o02-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: FONT, fontSize: "0.97rem", fontWeight: 500, color: linkClr, textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.04em", transition: "color 0.2s", textShadow: scrolled ? "none" : "0 1px 5px rgba(0,0,0,0.45)" }}
                onMouseEnter={e => { e.currentTarget.style.color = BEIGE; }}
                onMouseLeave={e => { e.currentTarget.style.color = linkClr; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Right: search + CZ/EN */}
          <div className="o02-right" style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <button
              aria-label="Hledat"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", color: iconClr, display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 500, letterSpacing: "0.04em", textShadow: scrolled ? "none" : "0 1px 5px rgba(0,0,0,0.45)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              Hledat
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, color: iconClr, letterSpacing: "0.06em", cursor: "default", textShadow: scrolled ? "none" : "0 1px 5px rgba(0,0,0,0.45)" }}>CZ</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={iconClr} strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          {/* Hamburger (mobile) */}
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            className="o02-hamburger"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: iconClr, marginLeft: "auto" }}
          >
            {open
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            }
          </button>
        </div>
      </header>

      <style>{`
        @media (max-width: 900px) {
          .o02-nav       { display: none !important; }
          .o02-right     { display: none !important; }
          .o02-hamburger { display: flex !important; }
        }
      `}</style>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: WHITE, display: "flex", flexDirection: "column", padding: "90px 32px 40px", overflowY: "auto" }}>
          <button
            onClick={() => setOpen(false)}
            style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", cursor: "pointer", color: DARK, padding: 8 }}
            aria-label="Zavřít menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* Mobile logo */}
          <svg viewBox="0 0 240 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 16, marginBottom: 32 }}>
            <text x="0" y="20" fontFamily="'Raleway','Helvetica Neue',Arial,sans-serif" fontWeight="200" fontSize="18" letterSpacing="5" fill={BEIGE}>PREMIUM CARE</text>
          </svg>
          {links.map((l, i) => (
            <a
              key={`o02-mob-${i}`}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "14px 0", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 500, color: DARK, textDecoration: "none", borderBottom: "1px solid #f0f0f0", letterSpacing: "0.05em" }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
            <span style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: DARK, letterSpacing: "0.06em" }}>CZ</span>
            <span style={{ color: "#ccc" }}>/</span>
            <span style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 400, color: "#aaa", letterSpacing: "0.06em" }}>EN</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── legal-02-navbar ──────────────────────────────────────────────────────────
// 1:1 rowan.legal navbar — bg #143171 (navy), výška 152px, překrývá hero
// (position:relative + marginBottom:-152px). Logo SVG 207px vlevo. Nav linky
// bílé, hover: oranžová (#EB5C2E) linka dole. Dropdown chevron (▾) u O nás
// a Naše služby. External link ikona u Kariéra. CTA "Kontaktujte nás" v orange
// border-radius 64px outlined. Search ikona. CZ/▾ lang. Mobile hamburger.
// Font: bw_gradualregular/bold (woff2) s Montserrat fallback.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarLegal02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const NAVY   = "#143171";
  const ORANGE = "#EB5C2E";
  const WHITE  = "#ffffff";
  const FONT   = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const NAV_H  = 152;

  const siteName = String(content.siteName ?? "Demo ROWAN LEGAL");
  const logoUrl  = String(content.logoUrl  ?? "/templates/legal-02/logo.svg");
  const ctaText  = String(content.ctaText  ?? "Kontaktujte nás");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string; external?: boolean; dropdown?: boolean }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  // Links that get a dropdown chevron
  const dropdownSet = new Set(["O nás", "Naše služby"]);
  // Links that get external-link icon
  const externalSet = new Set(["Kariéra"]);

  return (
    <>
      {/* @font-face pro bw_gradual */}
      <style>{`
        @font-face {
          font-family: 'bw_gradualbold';
          src: url('/templates/legal-02/bwgradual-bold-webfont.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'bw_gradualregular';
          src: url('/templates/legal-02/bwgradual-regular-webfont.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .l02-link {
          position: relative;
          color: #fff;
          text-decoration: none;
          font-family: 'bw_gradualbold', 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 700;
          height: 152px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .l02-link::before {
          content: '';
          display: block;
          height: 2px;
          width: 100%;
          background: #EB5C2E;
          position: absolute;
          bottom: 0;
          left: 0;
          opacity: 0;
          transition: opacity 0.18s;
        }
        .l02-link:hover::before { opacity: 1; }
        .l02-cta {
          color: #fff;
          text-decoration: none;
          height: 64px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 8px 24px;
          border: 2px solid #EB5C2E;
          border-radius: 64px;
          font-family: 'bw_gradualbold', 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 700;
          white-space: nowrap;
          transition: border-color 0.18s;
        }
        .l02-cta:hover { border-color: #fff; }
        @media (max-width: 1024px) {
          .l02-nav       { display: none !important; }
          .l02-right     { display: none !important; }
          .l02-hamburger { display: flex !important; }
        }
      `}</style>

      <header
        data-template="legal-02"
        style={{
          position: "relative",
          zIndex: 50,
          marginBottom: -NAV_H,
          backgroundColor: NAVY,
          height: NAV_H,
          display: "flex",
          alignItems: "center",
          fontFamily: FONT,
        }}
      >
        <div style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 80px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}>
          {/* Logo — text wordmark "ADVOKÁTNÍ / KANCELÁŘ" */}
          <a
            href={resolve("/")}
            style={{ textDecoration: "none", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}
            aria-label={siteName}
          >
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" style={{ display: "none" }} />
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(20px, 2.1vw, 30px)", color: ORANGE, letterSpacing: "0.04em", lineHeight: 1.15, textTransform: "uppercase" as const }}>ADVOKÁTNÍ</span>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(20px, 2.1vw, 30px)", color: ORANGE, letterSpacing: "0.04em", lineHeight: 1.15, textTransform: "uppercase" as const }}>KANCELÁŘ</span>
          </a>

          {/* Desktop nav links — absolutně centrované v headeru */}
          <nav className="l02-nav" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "clamp(8px, 1.8vw, 28px)" }}>
            {links.map((l, i) => {
              const hasDropdown = dropdownSet.has(l.label);
              const isExternal  = externalSet.has(l.label);
              return (
                <a
                  key={`l02-${i}`}
                  href={resolve(l.href)}
                  className="l02-link"
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  {hasDropdown && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                  {isExternal && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right: CTA + search + lang */}
          <div className="l02-right" style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0, marginLeft: "auto" }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="l02-cta"
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            {/* Search */}
            <button
              aria-label="Hledat"
              style={{ background: "none", border: "none", cursor: "pointer", width: 24, height: 24, marginLeft: 12, marginRight: 12, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Lang CZ ▾ */}
            <button
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 2, fontFamily: FONT, fontSize: "15px", fontWeight: 700, color: WHITE, letterSpacing: "0.02em", padding: "0 4px" }}
            >
              CZ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            className="l02-hamburger"
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: WHITE, marginLeft: "auto" }}
          >
            {open
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            }
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: NAVY, display: "flex", flexDirection: "column", padding: "80px 32px 40px", overflowY: "auto" }}>
          <button
            onClick={() => setOpen(false)}
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 8 }}
            aria-label="Zavřít menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 60, width: "auto", objectFit: "contain", objectPosition: "left", marginBottom: 36 }} />
          {links.map((l, i) => (
            <a
              key={`l02-mob-${i}`}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "14px 0", fontFamily: FONT, fontSize: "1rem", fontWeight: 700, color: WHITE, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.12)", letterSpacing: "0.02em" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 32, color: WHITE, fontFamily: FONT, fontSize: "1rem", fontWeight: 700, textDecoration: "none", border: `2px solid ${ORANGE}`, borderRadius: 64, padding: "12px 28px" }}
          >
            {ctaText}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 24, fontFamily: FONT, fontSize: "0.85rem", fontWeight: 700, color: WHITE, letterSpacing: "0.06em" }}>
            <span>CZ</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
            <span style={{ opacity: 0.4 }}>EN</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── lawyer-01-navbar ──────────────────────────────────────────────────────────
// Inspirováno havelpartners.cz:
// TOP LIŠTA: "HAVEL & PARTNERS" wordmark bold navy vlevo + crimson tagline +
//   crimson underline; vpravo: search ikona + lang CZ/EN/SK (crimson) + email ikona.
// NAV ŘADA: centrované nav linky s chevron šipkami (navy→crimson hover) +
//   crimson filled CTA "Kontaktujte nás" vpravo.
// Sticky, box-shadow na scroll. Mobile: hamburger → navy fullscreen overlay.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarLawyer01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAVY    = "#141760";
  const CRIMSON = "#a70336";
  const WHITE   = "#ffffff";
  const FONT    = "'Source Sans 3','Source Sans Pro','Raleway','Helvetica Neue',Arial,sans-serif";
  const NAVFONT = "'Source Sans 3','Source Sans Pro','Open Sans','Helvetica Neue',Arial,sans-serif";

  const siteName = String(content.siteName ?? "Demo HAVEL & PARTNERS");
  const ctaText  = String(content.ctaText ?? "Kontaktujte nás");
  const ctaHref  = String(content.ctaHref ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const langs    = (content.langs as string[]) ?? ["CZ", "EN", "SK"];
  const email    = String(content.email ?? "email@demo.cz");
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  // Wordmark: strip "Demo " prefix for display, keep full for aria
  const displayName = siteName.replace(/^Demo\s+/i, "");

  // Nav links that realistically have dropdowns (for chevron rendering)
  const dropdownLinks = new Set(["O nás", "Tým", "Právní specializace", "Podnikatelské obory", "Média", "Akademie", "Kontakt"]);

  return (
    <>
      <header
        data-template="lawyer-01"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          fontFamily: FONT,
          backgroundColor: WHITE,
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.10)" : "0 1px 0 #e8eaed",
          transition: "box-shadow 0.25s ease",
        }}
      >
        {/* ── TOP LIŠTA ── wordmark vlevo | lang+ikony vpravo */}
        <div>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 48px", height: 64, display: "flex", alignItems: "center" }}>

            {/* Wordmark block */}
            <a
              href={resolve("/")}
              aria-label={siteName}
              style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", flexShrink: 0, gap: 2 }}
            >
              {/* "SVOBODA & PARTNERS" wordmark — editable in studio */}
              <GenericEditableText
                sectionId={sectionId}
                field="siteName"
                value={siteName}
                tag="span"
                style={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: "clamp(14px,1.6vw,20px)",
                  letterSpacing: "0.12em",
                  color: NAVY,
                  textTransform: "uppercase" as const,
                  lineHeight: 1,
                  borderBottom: `2px solid ${CRIMSON}`,
                  paddingBottom: 2,
                  display: "block",
                }}
              />
              {/* Tagline */}
              <span style={{
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: "clamp(7px,0.7vw,9px)",
                letterSpacing: "0.28em",
                color: CRIMSON,
                textTransform: "uppercase" as const,
                lineHeight: 1,
                marginTop: 3,
              }}>
                DEMO ADVOKÁTNÍ KANCELÁŘ
              </span>
            </a>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right icons: search + langs + email */}
            <div className="l01-topright" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Search icon */}
              <button aria-label="Hledat" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: CRIMSON }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>

              {/* Language switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT }}>
                {langs.map((lang, i) => (
                  <span key={lang} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {i > 0 && <span style={{ color: "#ddd", fontSize: 10 }}>|</span>}
                    <button
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: "2px 1px",
                        fontFamily: FONT, fontSize: "0.805rem", fontWeight: i === 0 ? 800 : 500,
                        color: CRIMSON, letterSpacing: "0.1em",
                        textDecoration: i === 0 ? "underline" : "none",
                        textUnderlineOffset: 2,
                      }}
                    >{lang}</button>
                  </span>
                ))}
              </div>

              {/* Email icon */}
              <a href={`mailto:${email}`} aria-label="Napište nám" style={{ display: "flex", alignItems: "center", color: CRIMSON, textDecoration: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                </svg>
              </a>
            </div>

            {/* Hamburger (mobile) */}
            <button
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
              onClick={() => setOpen(!open)}
              className="l01-hamburger"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: NAVY, marginLeft: 8 }}
            >
              {open
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
              }
            </button>
          </div>
        </div>

        {/* ── NAV ŘADA ── centrované linky + CTA vpravo */}
        <div>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 48px 10px", height: 52, display: "flex", alignItems: "center" }}>

            {/* Nav links – centered */}
            <nav className="l01-nav" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(6px, 1.8vw, 32px)" }}>
              {links.map((l, i) => {
                const hasDropdown = dropdownLinks.has(l.label);
                return (
                  <a
                    key={`l01-${i}`}
                    href={resolve(l.href)}
                    className="l01-navlink"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontFamily: NAVFONT, fontSize: "clamp(14.3px,1.16vw,17px)", fontWeight: 400,
                      color: NAVY, textDecoration: "none",
                      letterSpacing: "0.01em", whiteSpace: "nowrap",
                      transition: "color 0.18s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = CRIMSON; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = NAVY; }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                    {hasDropdown && (
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* CTA button */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="l01-cta"
              style={{
                display: "inline-flex", alignItems: "center", flexShrink: 0, marginLeft: 20,
                backgroundColor: CRIMSON, color: WHITE,
                fontFamily: FONT, fontSize: "0.75rem", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                padding: "9px 22px", textDecoration: "none",
                transition: "background-color 0.18s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#870229"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = CRIMSON; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </header>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" />
      <style>{`        @media (max-width: 900px) {
          .l01-nav       { display: none !important; }
          .l01-cta       { display: none !important; }
          .l01-topright  { display: none !important; }
          .l01-hamburger { display: flex !important; }
        }
      `}</style>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: NAVY, display: "flex", flexDirection: "column", padding: "72px 32px 40px", overflowY: "auto" }}>
          <button
            onClick={() => setOpen(false)}
            style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", cursor: "pointer", color: WHITE, padding: 8 }}
            aria-label="Zavřít menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* Wordmark */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 18, letterSpacing: "0.12em", color: WHITE, textTransform: "uppercase", borderBottom: `2px solid ${CRIMSON}`, display: "inline-block", paddingBottom: 2 }}>
              {displayName}
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 8, letterSpacing: "0.28em", color: CRIMSON, textTransform: "uppercase", marginTop: 4 }}>
              DEMO ADVOKÁTNÍ KANCELÁŘ
            </div>
          </div>
          {links.map((l, i) => (
            <a
              key={`l01-mob-${i}`}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "13px 0", fontFamily: FONT, fontSize: "0.875rem", fontWeight: 600, color: WHITE, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", letterSpacing: "0.05em" }}
            >
              {l.label}
            </a>
          ))}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "inline-block", marginTop: 28, backgroundColor: CRIMSON, color: WHITE, fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none" }}
          >
            {ctaText}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
            {langs.map((lang, i) => (
              <span key={lang} style={{ fontFamily: FONT, fontSize: "0.75rem", fontWeight: i === 0 ? 800 : 500, color: i === 0 ? WHITE : "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{lang}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── stavba-01-navbar ──────────────────────────────────────────────────────────
function NavbarStavba01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const GRAY   = "#6b6b6b";
  const FONT   = "'Inter', sans-serif";

  const siteName = String(content.siteName ?? "Stavební Firma");
  const logoUrl  = String(content.logoUrl  ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const phone    = String(content.phone    ?? "704 123 456");
  const ctaText  = String(content.ctaText  ?? "Kontaktujte nás");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  // when transparent (over hero): white text; when scrolled: dark text
  const navLinkColor  = scrolled ? GRAY  : "rgba(255,255,255,0.88)";
  const navLinkHover  = scrolled ? DARK  : WHITE;
  const navLinkHoverBg = scrolled ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.12)";
  const phoneColor    = scrolled ? DARK  : "rgba(255,255,255,0.88)";
  const phoneHover    = scrolled ? ORANGE : WHITE;

  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={scrolled ? DARK : WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const LogoMark = ({ light = false }: { light?: boolean }) => {
    const text = light ? WHITE : DARK;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 44" fill="none" style={{ width: 242, height: 42 }} aria-label={siteName}>
        <rect x="2" y="4"  width="13" height="9"  rx="2" fill={ORANGE}/>
        <rect x="2" y="15" width="21" height="9"  rx="2" fill={text}/>
        <rect x="2" y="26" width="29" height="9"  rx="2" fill={text}/>
        <rect x="2" y="37" width="29" height="4"  rx="2" fill={ORANGE}/>
        <text fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="19" fill={text} letterSpacing="-0.3">
          <tspan x="40" y="28">STAVEBNÍ</tspan>
          <tspan fill={ORANGE} fontWeight="500" fontSize="18" dx="6">FIRMA</tspan>
        </text>
      </svg>
    );
  };


  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          fontFamily: FONT,
          backgroundColor: scrolled ? WHITE : "transparent",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06)" : "none",
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        }}
        data-template="stavba-01"
      >
        {/* Main navbar row */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <LogoMark light={!scrolled} />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 2 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: FONT, fontSize: "0.925rem", fontWeight: 500, color: navLinkColor, textDecoration: "none", padding: "7px 15px", borderRadius: 6, transition: "color 0.2s, background-color 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.color = navLinkHover; e.currentTarget.style.backgroundColor = navLinkHoverBg; }}
                onMouseLeave={e => { e.currentTarget.style.color = navLinkColor; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 10 }}>
            <a
              href={`tel:+420${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 7, color: phoneColor, textDecoration: "none", fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, padding: "8px 14px", borderRadius: 8, transition: "color 0.2s, background-color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = phoneHover; e.currentTarget.style.backgroundColor = scrolled ? "rgba(255,111,13,0.06)" : "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = phoneColor; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <PhoneIcon /><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{ display: "inline-flex", alignItems: "center", backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, padding: "11px 26px", borderRadius: 8, textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.01em", boxShadow: "0 2px 12px rgba(255,111,13,0.30)", transition: "opacity 0.15s, transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,111,13,0.40)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(255,111,13,0.30)"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex lg:hidden"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>

        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99, backgroundColor: WHITE }}
          role="dialog"
          aria-modal="true"
        >
          {/* Drawer header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 72, borderBottom: "1px solid #f0f0f0" }}>
            <LogoMark />
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <XIcon />
            </button>
          </div>
          {/* Drawer links */}
          <nav style={{ padding: "12px 24px 32px" }}>
            {links.map((l, i) => (
              <a
                key={`mob-${l.href}-${i}`}
                href={resolve(l.href)}
                onClick={() => setOpen(false)}
                style={{ display: "block", padding: "15px 0", fontFamily: FONT, fontSize: "1.05rem", fontWeight: 500, color: DARK, textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              style={{ display: "block", marginTop: 28, backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, padding: "14px 0", borderRadius: 8, textAlign: "center", textDecoration: "none", boxShadow: "0 2px 12px rgba(255,111,13,0.30)" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <a
              href={`tel:+420${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 16, color: GRAY, textDecoration: "none", fontFamily: FONT, fontSize: "0.9rem" }}
            >
              <PhoneIcon /><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

// ── stavba-02-navbar ──────────────────────────────────────────────────────────
// Sticky opaque navbar (always cream bg), warm-brown color scheme
// Layout: logo left | nav links center (desktop) | phone + CTA right
// Mobile: phone + hamburger → full-width dropdown
function NavbarStavba02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  const BROWN = "#674832";
  const DARK  = "#3D2516";
  const CREAM = "#F8F5F0";
  const FONT  = "'Roboto', sans-serif";

  const siteName = String(content.siteName ?? "Demo Byty Jádra");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const ctaText  = String(content.ctaText  ?? "Nezávazná poptávka");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => {
    if (!href || href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) {
      const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
      return base + (href.startsWith("/") ? href : "/" + href);
    }
    return href;
  };

  const PhoneIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );

  const LogoMark = () => (
    <span style={{ display: "inline-flex", alignItems: "baseline", lineHeight: 1, userSelect: "none" }} aria-label={siteName}>
      <span style={{ fontFamily: "'Roboto', Arial, sans-serif", fontWeight: 700, fontSize: 22, color: DARK, letterSpacing: "-0.3px" }}>
        <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
      </span>
    </span>
  );

  return (
    <>
      <header
        style={{
          position: "sticky", top: 0, left: 0, right: 0, zIndex: 100,
          fontFamily: FONT,
          backgroundColor: CREAM,
          borderBottom: "1px solid rgba(103,72,50,0.12)",
          boxShadow: "0 2px 20px rgba(61,37,22,0.06)",
        }}
        data-template="stavba-02"
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 65, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <LogoMark />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 4 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: FONT, fontSize: "0.81rem", fontWeight: 500, color: DARK, textDecoration: "none", padding: "5px 12px", borderRadius: 6, transition: "color 0.2s, background-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = BROWN; e.currentTarget.style.backgroundColor = "rgba(103,72,50,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = DARK; e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Desktop right: phone + CTA */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 16 }}>
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 6, color: DARK, fontFamily: FONT, fontSize: "0.79rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = BROWN; }}
              onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
            >
              <span style={{ color: BROWN }}><PhoneIcon /></span>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              style={{ display: "inline-flex", alignItems: "center", backgroundColor: BROWN, color: "#fff", fontFamily: FONT, fontSize: "0.79rem", fontWeight: 600, padding: "9px 20px", borderRadius: 6, textDecoration: "none", transition: "opacity 0.18s, transform 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Mobile right: phone + hamburger */}
          <div className="flex lg:hidden" style={{ alignItems: "center", gap: 8 }}>
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 5, color: DARK, fontFamily: FONT, fontSize: "0.8rem", fontWeight: 500, textDecoration: "none" }}
              aria-label={`Zavolat na ${phone}`}
            >
              <span style={{ color: BROWN }}><PhoneIcon /></span>
              <span className="hidden sm:block">{phone}</span>
            </a>
            <button
              onClick={() => setOpen(o => !o)}
              aria-label="Menu"
              style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: DARK }}
            >
              {open ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="lg:hidden" style={{ backgroundColor: CREAM, borderTop: "1px solid rgba(103,72,50,0.10)", padding: "16px 24px 24px" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {links.map((l, i) => (
                <a
                  key={`mob-${l.href}-${i}`}
                  href={resolve(l.href)}
                  onClick={() => setOpen(false)}
                  style={{ fontFamily: FONT, fontSize: "1rem", fontWeight: 500, color: DARK, textDecoration: "none", padding: "11px 12px", borderRadius: 6, transition: "color 0.2s, background-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = BROWN; e.currentTarget.style.backgroundColor = "rgba(103,72,50,0.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = DARK; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
              <a
                href={resolve(ctaHref)}
                data-btn="primary"
                onClick={() => setOpen(false)}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: BROWN, color: "#fff", fontFamily: FONT, fontSize: "0.95rem", fontWeight: 600, padding: "12px 24px", borderRadius: 6, textDecoration: "none", marginTop: 12 }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

// ── stavba-03-navbar ──────────────────────────────────────────────────────────
// 1:1 baurekstav.cz:
// - White topbar 50px (lg+): phone+email left w/ orange icons, FB+IG right
// - White sticky navbar 90px: logo left | UPPERCASE nav (15px bold, 90px line-height) | full-height orange CTA right (no border-radius)
// - Mobile: hamburger → fullscreen white overlay
function NavbarStavba03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ORANGE = "#fa7d19";
  const DARK   = "#1b1a1a";
  const WHITE  = "#ffffff";
  const GRAY   = "#666666";
  const FONT   = "'Roboto', sans-serif";

  const siteName = String(content.siteName ?? "Demo BauRekStav");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "info@demo.cz");
  const ctaText  = String(content.ctaText  ?? "Nezávazná poptávka");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const PhoneIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );

  const LogoMark = () => {
    if (logoUrl) {
      return <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", objectFit: "contain" }} />;
    }
    return (
      <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 16, letterSpacing: "2.2px", color: DARK, textTransform: "uppercase" }} aria-label={siteName}>
        <GenericEditableText sectionId={sectionId} field="logoText" value={String(content.logoText ?? "Rekonstrukce")} tag="span" />
      </span>
    );
  };

  return (
    <>
      {/* Main navbar — sticky, 81px (-10%), white */}
      <header
        style={{
          position: "sticky", top: 0, left: 0, right: 0, zIndex: 100,
          height: 81,
          backgroundColor: WHITE,
          boxShadow: scrolled ? "0 3px 10px rgba(0,0,0,0.1)" : "0 3px 6px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s",
          fontFamily: FONT,
          display: "flex",
          alignItems: "stretch",
        }}
        data-template="stavba-03"
      >
        {/* Inner container */}
        <div style={{ maxWidth: 1200, margin: "0 auto", paddingLeft: 29, flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
            <LogoMark />
          </a>

          {/* Desktop nav — 81px line-height, 13px 700 */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", height: "100%" }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                style={{
                  display: "inline-block",
                  height: 81,
                  lineHeight: "81px",
                  marginRight: 27,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 700,
                  color: i === 0 ? ORANGE : DARK,
                  textDecoration: "none",
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = ORANGE; }}
                onMouseLeave={e => { e.currentTarget.style.color = i === 0 ? ORANGE : DARK; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex lg:hidden"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: DARK, marginRight: 8 }}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Desktop CTA — full-height 81px block, no border-radius */}
        <a
          href={resolve(ctaHref)}
          className="hidden lg:flex"
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            height: 81,
            minWidth: 198,
            paddingLeft: 25,
            paddingRight: 25,
            backgroundColor: ORANGE,
            color: WHITE,
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.3px",
            textDecoration: "none",
            borderRadius: 0,
            flexShrink: 0,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e86f0e"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ORANGE; }}
        >
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </header>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99, backgroundColor: WHITE, overflowY: "auto" }}
          role="dialog"
          aria-modal="true"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 80, borderBottom: "1px solid #eaeaea" }}>
            <LogoMark />
            <button
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: DARK }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav style={{ padding: "16px 24px 32px" }}>
            {links.map((l, i) => (
              <a
                key={`mob-${l.href}-${i}`}
                href={resolve(l.href)}
                onClick={() => setOpen(false)}
                style={{ display: "block", padding: "14px 0", fontFamily: FONT, fontSize: "1rem", fontWeight: 700, color: i === 0 ? ORANGE : DARK, textDecoration: "none", borderBottom: "1px solid #f0f0f0", textTransform: "uppercase", letterSpacing: "0.04em" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              style={{ display: "block", marginTop: 24, backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, padding: "15px 0", borderRadius: 0, textAlign: "center", textDecoration: "none" }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <a href={`tel:+420${phone.replace(/\s/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 8, color: GRAY, fontFamily: FONT, fontSize: "0.9rem", textDecoration: "none" }}>
                <span style={{ color: ORANGE, display: "flex" }}><PhoneIcon /></span>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: GRAY, fontFamily: FONT, fontSize: "0.9rem", textDecoration: "none" }}>
                <span style={{ color: ORANGE, display: "flex" }}><MailIcon /></span>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

// ── elektro-01-navbar ─────────────────────────────────────────────────────────
// 1:1 elektro-bohacek.cz:
// - logo: červený kruh + power symbol + "VÁŠ ELEKTRIKÁŘ" na jednom řádku
// - nav: ÚVOD SLUŽBY REFERENCE KONTAKT — vpravo, dole, s podtržítkem active+hover
// ─────────────────────────────────────────────────────────────────────────────
function NavbarElektro01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open,      setOpen]      = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [activeHref, setActiveHref] = useState("/");

  useEffect(() => {
    const sectionMap: Record<string, string> = {
      uvod:      "/",
      sluzby:    "#sluzby",
      reference: "#reference",
      kontakt:   "#kontakt",
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      if (window.scrollY < 80) { setActiveHref("/"); return; }
      for (const id of ["kontakt", "reference", "sluzby"]) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveHref(sectionMap[id] ?? "/");
          return;
        }
      }
      setActiveHref("/");
    };

    const onHash = () => setActiveHref(window.location.hash || "/");
    setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  const RED   = "#dd0808";
  const DARK  = "#1b1b1b";
  const WHITE = "#ffffff";
  const GRAY  = "#5a5a5a";
  const FONT  = "'Montserrat', sans-serif";

  const siteName = String(content.siteName ?? "Váš elektrikář");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const linkBase  = scrolled ? GRAY  : "rgba(255,255,255,0.88)";
  const linkHover = scrolled ? DARK  : WHITE;

  const MenuIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={scrolled ? DARK : WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const XIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  /* Logo: červený kruh + zástrčka (plug) + "VÁŠ ELEKTRIKÁŘ" 1 řádek — čisté, profesionální */
  const LogoMark = ({ onDark = true }: { onDark?: boolean }) => {
    const c = onDark ? WHITE : DARK;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 52" fill="none"
        style={{ width: 244, height: 51 }} aria-label={siteName}>
        <circle cx="26" cy="26" r="26" fill={RED}/>
        {/* Electrical plug icon */}
        <rect x="19" y="9"  width="4" height="11" rx="1.5" fill={WHITE}/>
        <rect x="29" y="9"  width="4" height="11" rx="1.5" fill={WHITE}/>
        <rect x="15" y="20" width="22" height="14" rx="3"   fill={WHITE}/>
        <rect x="23" y="34" width="6"  height="9"  rx="1.5" fill={WHITE}/>
        {/* Wordmark */}
        <text fontFamily="'Montserrat',Arial,sans-serif" fontWeight="800" fontSize="17.5" fill={c} letterSpacing="0.4">
          <tspan x="62" y="31">{siteName.toUpperCase()}</tspan>
        </text>
      </svg>
    );
  };

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          fontFamily: FONT,
          backgroundColor: scrolled ? WHITE : "transparent",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.13)" : "none",
          borderBottom: scrolled ? "1px solid #e8e8e8" : "none",
          transition: "background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        }}
        data-template="elektro-01"
      >
        {/* 86px výška, logo i nav vertikálně centrované */}
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 32px",
          height: 86, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>

          {/* Logo vlevo */}
          <a href={resolve("/")} aria-label={siteName}
            style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
            <LogoMark onDark={!scrolled} />
          </a>

          {/* Desktop nav — vpravo, aktivní + hover podtržítko */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 0 }}>
            {links.map((l, i) => {
              const isActive = activeHref === l.href;
              return (
                <a
                  key={`${l.href}-${i}`}
                  href={resolve(l.href)}
                  onClick={() => setActiveHref(l.href)}
                  style={{
                    display: "inline-block",
                    fontFamily: FONT, fontSize: "0.80rem", fontWeight: 700,
                    color: isActive ? (scrolled ? DARK : WHITE) : linkBase,
                    textDecoration: "none",
                    padding: "8px 18px",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    borderBottom: isActive ? `2px solid ${RED}` : "2px solid transparent",
                    transition: "color 0.18s, border-color 0.18s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = linkHover;
                    e.currentTarget.style.borderBottomColor = RED;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = isActive ? (scrolled ? DARK : WHITE) : linkBase;
                    e.currentTarget.style.borderBottomColor = isActive ? RED : "transparent";
                  }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex lg:hidden"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 6px 18px" }}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99, backgroundColor: WHITE }}
          role="dialog" aria-modal="true">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 86, borderBottom: "1px solid #f0f0f0" }}>
            <LogoMark onDark={false} />
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <XIcon />
            </button>
          </div>
          <nav style={{ padding: "8px 28px 32px" }}>
            {links.map((l, i) => (
              <a key={`mob-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}
                style={{ display: "block", padding: "16px 0", fontFamily: FONT, fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: DARK, textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

// ── catering-01 shared logo (inline SVG — used in navbar + footer) ──────────
// Big, uppercase, letter-spaced serif wordmark for high legibility.
// Left mark: olive-branch pair (leaves + berries). Ampersand in accent color.
export function CateringSaveurLogo({ color, accent, height = "3rem" }: { color: string; accent: string; height?: string }) {
  return (
    <svg viewBox="0 0 500 100" style={{ height, width: "auto", display: "block", flexShrink: 0 }} role="img" aria-label="Saveur & Co.">
      {/* Left mark — olive branch pair */}
      <g transform="translate(6,10)">
        {/* central stem */}
        <path d="M40 8 L40 72" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        {/* left leaves */}
        <ellipse cx="26" cy="22" rx="12" ry="4.2" fill={color} transform="rotate(-32 26 22)" />
        <ellipse cx="22" cy="40" rx="13" ry="4.4" fill={color} transform="rotate(-24 22 40)" />
        <ellipse cx="22" cy="58" rx="12" ry="4.2" fill={color} transform="rotate(-14 22 58)" />
        {/* right leaves */}
        <ellipse cx="54" cy="22" rx="12" ry="4.2" fill={color} transform="rotate(32 54 22)" />
        <ellipse cx="58" cy="40" rx="13" ry="4.4" fill={color} transform="rotate(24 58 40)" />
        <ellipse cx="58" cy="58" rx="12" ry="4.2" fill={color} transform="rotate(14 58 58)" />
        {/* berries */}
        <circle cx="40" cy="14" r="3" fill={accent} />
        <circle cx="40" cy="35" r="3" fill={accent} />
        <circle cx="40" cy="56" r="3" fill={accent} />
      </g>
      {/* Wordmark SAVEUR & CO. */}
      <text x="100" y="52" fontSize="42" fontFamily="Fraunces,'Playfair Display',Georgia,serif" fontWeight="500" fill={color} letterSpacing="4">
        SAVEUR <tspan fill={accent} fontWeight="400" fontStyle="italic" fontSize="46">&amp;</tspan> CO.
      </text>
      {/* Tagline */}
      <text x="102" y="76" fontSize="11" fontFamily="Inter,'Helvetica Neue',Arial,sans-serif" fontWeight="600" fill={color} letterSpacing="4.8" opacity="0.75">
        FINE-DINE CATERING · PRAHA
      </text>
    </svg>
  );
}

// ── catering-01-navbar ────────────────────────────────────────────────────────
// Nordic Minimal Gastro:
// - Fixed warm-white bar, forest green text, terracotta CTA
// - Logo left (Fraunces serif text), nav links center (Inter uppercase), CTA right
// - Scroll: subtle bottom border appears
// - Mobile (<1024): hamburger → fullscreen forest-green overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarCatering01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const GREEN  = "#2d4a3e";
  const TERRA  = "#c4755b";
  const WARM   = "#f8f5f0";
  const STONE  = "#e8e2d8";
  const TEXT   = "#1a1a1a";
  const SERIF  = "'Fraunces', Georgia, serif";
  const SANS   = "'Inter', system-ui, sans-serif";

  const siteName = String(content.siteName ?? "Saveur & Co.");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Poptávka");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const phone    = String(content.phone    ?? "775 288 400");
  const email    = String(content.email    ?? "info@saveur.cz");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const siteMode = String(content.siteMode ?? "multipage");

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@400;500;600&display=swap" />
      <style>{`
        .ct1h{position:fixed;top:0;left:0;right:0;z-index:200;background:${WARM};transition:box-shadow .3s ease,border-color .3s ease;border-bottom:1px solid transparent}
        .ct1h.scrolled{box-shadow:0 1px 12px rgba(0,0,0,.06);border-bottom-color:${STONE}}
        .ct1i{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.6rem;gap:1rem}
        .ct1logo{text-decoration:none;display:flex;align-items:center;gap:.6rem;flex-shrink:0}
        .ct1logo img{height:2.2rem;width:auto;object-fit:contain}
        .ct1logo-text{font-family:${SERIF};font-size:1.35rem;font-weight:400;color:${GREEN};letter-spacing:-.01em;line-height:1.2}
        .ct1links{display:none;list-style:none;padding:0;margin:0;gap:2rem;align-items:center}
        .ct1lnk{font-family:${SANS};font-size:.72rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${TEXT};text-decoration:none;position:relative;padding:.25rem 0;transition:color .2s}
        .ct1lnk::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:${TERRA};transition:width .3s cubic-bezier(.4,0,.2,1)}
        .ct1lnk:hover{color:${TERRA}}
        .ct1lnk:hover::after{width:100%}
        .ct1r{display:flex;align-items:center;gap:1rem}
        .ct1cta{background:${TERRA};color:#fff;font-family:${SANS};font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;padding:.65rem 1.4rem;border-radius:999px;transition:background .25s,transform .25s;display:none}
        .ct1cta:hover{background:#b0634a;transform:translateY(-1px)}
        .ct1hb{background:none;border:none;cursor:pointer;padding:.4rem;display:flex;flex-direction:column;gap:5px;width:28px}
        .ct1hb span{display:block;height:2px;background:${GREEN};border-radius:1px;transition:all .3s cubic-bezier(.4,0,.2,1)}
        .ct1hb.open span:first-child{transform:rotate(45deg) translate(5px,5px)}
        .ct1hb.open span:nth-child(2){opacity:0}
        .ct1hb.open span:last-child{transform:rotate(-45deg) translate(5px,-5px)}
        .ct1ov{position:fixed;inset:0;background:${GREEN};z-index:190;opacity:0;pointer-events:none;transition:opacity .35s ease}
        .ct1ov.open{opacity:1;pointer-events:auto}
        .ct1mn{position:fixed;inset:0;z-index:195;display:flex;flex-direction:column;justify-content:center;align-items:center;opacity:0;pointer-events:none;transition:opacity .3s ease .1s}
        .ct1mn.open{opacity:1;pointer-events:auto}
        .ct1mnl{list-style:none;padding:0;margin:0 0 2.5rem;text-align:center}
        .ct1mnl li{margin-bottom:1rem}
        .ct1mnlk{font-family:${SERIF};font-size:2.2rem;font-weight:300;color:${WARM};text-decoration:none;transition:color .2s;letter-spacing:.02em;line-height:1.5}
        .ct1mnlk:hover{color:${TERRA}}
        .ct1mnc{display:flex;flex-direction:column;align-items:center;gap:.6rem}
        .ct1mncl{font-family:${SANS};font-size:.85rem;color:rgba(248,245,240,.6);text-decoration:none;transition:color .2s}
        .ct1mncl:hover{color:${WARM}}
        .ct1mncta{margin-top:1.5rem;background:${TERRA};color:#fff;font-family:${SANS};font-size:.75rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;padding:.75rem 2rem;border-radius:999px;transition:background .25s}
        .ct1mncta:hover{background:#b0634a}
        @media(min-width:1024px){
          .ct1i{padding:1rem 2.5rem}
          .ct1links{display:flex}
          .ct1cta{display:inline-flex}
          .ct1hb{display:none}
          .ct1logo-text{font-size:1.5rem}
        }
        @media(min-width:1280px){
          .ct1i{padding:1.1rem 3rem}
          .ct1links{gap:2.4rem}
        }
      `}</style>

      <header className={`ct1h${scrolled ? " scrolled" : ""}`} data-template="catering-01">
        <div className="ct1i">
          <a href={resolve("/")} className="ct1logo" aria-label={siteName}>
            <CateringSaveurLogo color={GREEN} accent={TERRA} height="3rem" />
            {logoUrl && <span style={{ display: "none" }} data-field="logoUrl">{logoUrl}</span>}
          </a>

          <ul className="ct1links">
            {links.map((l, i) => (
              <li key={`nl-${i}`}>
                <a href={resolve(l.href)} className="ct1lnk">
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <div className="ct1r">
            <a href={resolve(ctaHref)} data-btn="primary" className="ct1cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <button
              className={`ct1hb${open ? " open" : ""}`}
              onClick={() => setOpen(o => !o)}
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={open}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`ct1ov${open ? " open" : ""}`} aria-hidden="true" />

      <div className={`ct1mn${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <ul className="ct1mnl" aria-label="Hlavní navigace">
          {links.map((l, i) => (
            <li key={`mnl-${i}`}>
              <a href={resolve(l.href)} className="ct1mnlk" onClick={() => setOpen(false)}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            </li>
          ))}
        </ul>
        <div className="ct1mnc">
          <a href={`tel:+420${phone.replace(/\s/g, "")}`} className="ct1mncl">
            +420 <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
          <a href={`mailto:${email}`} className="ct1mncl">
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
          </a>
          <a href={resolve(ctaHref)} className="ct1mncta" onClick={() => setOpen(false)}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── instala-01-navbar ─────────────────────────────────────────────────────────
// 1:1 instalateritopenari.cz:
// - fixed transparent overlay on hero (hlavička je součástí hero, žádný separator)
// - žlutý (#FFC527) topbar 42px: adresa + telefon + email
// - main nav: transparent, bílé (#FFF) nav linky, outline pill CTA (bílý rámeček)
// - při scrollu: tmavý poloprůhledný bg pro čitelnost
// - font: Outfit
// ─────────────────────────────────────────────────────────────────────────────
function NavbarInstala01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const YELLOW = "#FFC527";
  const DARK   = "#1e293b";
  const WHITE  = "#ffffff";
  const FONT   = "'Outfit', sans-serif";

  const siteName = String(content.siteName ?? "Demo Instalatéři Praha");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String(content.phone    ?? "704 123 456");
  const email    = String(content.email    ?? "info@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const ctaText  = String(content.ctaText  ?? "Zavolejte nám");
  const ctaHref  = String(content.ctaHref  ?? "tel:+420704123456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const MapPinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const LogoMark = () => {
    if (logoUrl) {
      return (
        <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", objectFit: "contain" }} />
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 48" fill="none" style={{ width: 270, height: 48 }} aria-label={siteName}>
        {/* Yellow circle with wrench icon */}
        <circle cx="24" cy="24" r="24" fill={YELLOW}/>
        {/* Wrench SVG path */}
        <path d="M32 12c-3.31 0-6 2.69-6 6 0 .78.15 1.52.42 2.2L14 32.62 15.38 34 27.8 21.58c.68.27 1.42.42 2.2.42 3.31 0 6-2.69 6-6 0-.56-.08-1.1-.22-1.62l-3.16 3.16-2.12-2.12 3.16-3.16C33.1 12.08 32.56 12 32 12z" fill={DARK}/>
        {/* Vertical divider */}
        <rect x="58" y="10" width="1.5" height="28" rx="0.75" fill="rgba(255,255,255,0.25)"/>
        {/* Main wordmark */}
        <text fontFamily="'Outfit',Arial,sans-serif" fontWeight="800" fontSize="16" fill={WHITE} letterSpacing="0.5">
          <tspan x="68" y="21">INSTALATÉRSKÉ</tspan>
        </text>
        <text fontFamily="'Outfit',Arial,sans-serif" fontWeight="400" fontSize="12" fill={YELLOW} letterSpacing="2.5">
          <tspan x="69" y="38">PRÁCE</tspan>
        </text>
      </svg>
    );
  };

  return (
    <>
      {/* Fixed transparent wrapper — overlays hero, no separator */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          fontFamily: FONT,
          backgroundColor: scrolled ? "rgba(30,41,59,0.96)" : "transparent",
          transition: "background-color 0.3s ease",
        }}
        data-template="instala-01-navbar"
      >
        {/* ── Main nav — transparent, white links ── */}
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          height: 86,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName}
            style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
            <LogoMark />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 2 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: WHITE,
                  textDecoration: "none",
                  padding: "15px 25px",
                  borderRadius: 6,
                  transition: "color 0.18s, background-color 0.18s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = YELLOW;
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = WHITE;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA — outline pill: white border + white text, hover → fill white */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 10 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="inverse"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                backgroundColor: "transparent",
                color: WHITE,
                border: "1px solid rgba(255,255,255,0.85)",
                fontSize: "0.9rem",
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: 50,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = WHITE;
                e.currentTarget.style.color = DARK;
                e.currentTarget.style.borderColor = WHITE;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = WHITE;
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.85)";
              }}
            >
              <PhoneIcon />
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          {/* Mobile hamburger — white icon on transparent bg */}
          <button
            className="flex lg:hidden"
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 101, backgroundColor: WHITE }}
          role="dialog"
          aria-modal="true"
        >
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", height: 72, borderBottom: `3px solid ${YELLOW}`,
          }}>
            <LogoMark />
            <button onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
              <XIcon />
            </button>
          </div>
          <nav style={{ padding: "12px 24px 32px" }}>
            {links.map((l, i) => (
              <a
                key={`mob-${i}`}
                href={resolve(l.href)}
                onClick={() => setOpen(false)}
                style={{
                  display: "block", padding: "15px 0",
                  fontFamily: FONT, fontSize: "1rem", fontWeight: 500,
                  color: DARK, textDecoration: "none",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: 28, backgroundColor: YELLOW, color: DARK,
                fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700,
                padding: "14px 0", borderRadius: 50, textAlign: "center", textDecoration: "none",
              }}
            >
              <PhoneIcon />
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

// ── sweet-01-navbar ───────────────────────────────────────────────────────────
// Ref: ovocnysvetozor.cz (Joomla + Gantry e-shop, cukrárna & pekárna)
// #fefefe sticky navbar, box-shadow 0 1px 8px rgba(0,0,0,0.06)
// Logo vlevo (SVG), nav linky (Roboto 12px uppercase), hamburger vpravo
// Primary red: #E2001A for hover/active
// ─────────────────────────────────────────────────────────────────────────────
function NavbarSweet01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  const siteName = String(content.siteName ?? "Demo Světozor");
  const logoUrl  = String(content.logoUrl  ?? "/templates/sweet-01/logo.svg");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText  = String(content.ctaText  ?? "Přejít do e-shopu");
  const ctaHref  = String(content.ctaHref  ?? "#eshop");

  const BG      = "#fefefe";
  const RED     = "#E2001A";
  const DARK    = "#0a0a0a";
  const BORDER  = "#e8e8e8";
  const FONT    = "'Roboto', 'Helvetica Neue', Arial, sans-serif";

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <style>{`
        .sw01-nav a:hover { color: ${RED} !important; }
        .sw01-cta:hover { background: ${RED} !important; color: #fff !important; }
        @media (min-width: 900px) { .sw01-ham { display: none !important; } }
        @media (max-width: 899px) { .sw01-desktop-nav { display: none !important; } .sw01-cta { display: none !important; } }
      `}</style>

      {/* ── Sticky navbar ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ backgroundColor: BG, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", fontFamily: FONT }}
        data-template="sweet-01"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 60px)", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>

          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "flex" }}>
              <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 56, width: "auto", display: "block" }} />
            </GenericEditableImage>
          </a>

          {/* Desktop nav */}
          <nav className="sw01-desktop-nav sw01-nav" style={{ display: "flex", alignItems: "center", gap: 32, flex: 1, justifyContent: "center" }}>
            {links.map((l, i) => (
              <a
                key={`sw01-${i}`}
                href={resolve(l.href)}
                style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: DARK, textDecoration: "none", transition: "color 0.2s" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Right: CTA + cart + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="sw01-cta"
              style={{ display: "inline-block", padding: "8px 18px", border: `2px solid ${RED}`, color: RED, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", transition: "background 0.2s, color 0.2s", whiteSpace: "nowrap", fontFamily: FONT }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            <button aria-label="Košík" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: DARK, lineHeight: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>

            <button
              className="sw01-ham"
              onClick={() => setOpen(true)}
              aria-label="Otevřít menu"
              aria-expanded={open}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 0", display: "flex", flexDirection: "column", gap: 5 }}
            >
              <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: DARK }} />
              <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: DARK }} />
              <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: DARK }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.45)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.3s ease" }}
        aria-hidden
      />

      {/* Mobile sidebar */}
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 201, width: "clamp(260px, 75vw, 320px)", backgroundColor: BG, transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.12)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 40, display: "block" }} />
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ background: "none", border: "none", cursor: "pointer", color: DARK, padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {links.map((l, i) => (
            <a
              key={`sw01-mob-${i}`}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "14px 24px", fontFamily: FONT, fontSize: 14, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: DARK, textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}
              onMouseEnter={e => { e.currentTarget.style.color = RED; e.currentTarget.style.backgroundColor = "#fef5f5"; }}
              onMouseLeave={e => { e.currentTarget.style.color = DARK; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </nav>
        <div style={{ padding: "20px 24px", borderTop: `1px solid ${BORDER}` }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "12px 0", backgroundColor: RED, color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", textAlign: "center", fontFamily: FONT }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── autoskola-01-navbar ───────────────────────────────────────────────────────
// 1:1 nobe.cz:
// - Bílý topbar 44px: telefon vlevo, YT/FB/IG social ikony + rating badge vpravo
// - Sticky bílá navbar 80px: SVG auto+wordmark logo vlevo, nav linky střed, oranžový (#f16823) filled CTA vpravo
// - Shadow po scrollu; font Roboto
// ─────────────────────────────────────────────────────────────────────────────
function NavbarAutoskola01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ORANGE = "#f16823";
  const DARK   = "#484848";
  const WHITE  = "#ffffff";
  const FONT   = "'Roboto', sans-serif";

  const siteName    = String(content.siteName    ?? "Autoškola DRIVE CZ");
  const logoUrl     = String(content.logoUrl     ?? "");
  const phone       = String(content.phone       ?? "704 123 456");
  const rating      = String(content.rating      ?? "4,9");
  const ratingCount = String(content.ratingCount ?? "2 847 hodnocení");
  const ctaText     = String(content.ctaText     ?? "Přihlásit se");
  const ctaHref     = String(content.ctaHref     ?? "/prihlaseni");
  const facebook    = String(content.facebook    ?? "https://facebook.com/demo");
  const instagram   = String(content.instagram   ?? "https://instagram.com/demo");
  const youtube     = String(content.youtube     ?? "https://youtube.com/demo");
  const links       = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const PhIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  const BurgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const LogoSVG = ({ dark = true }: { dark?: boolean }) => {
    if (logoUrl) return <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 42, width: "auto", objectFit: "contain" }} />;
    const tc = dark ? DARK : WHITE;
    return (
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1, userSelect: "none" }} aria-label={siteName}>
        <span style={{ fontFamily: "'Roboto', Arial, sans-serif", fontWeight: 400, fontSize: 14, letterSpacing: "0.28em", textTransform: "uppercase", color: ORANGE }}>AUTOŠKOLA</span>
        <span style={{ fontFamily: "'Roboto', Arial, sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.22em", textTransform: "uppercase", color: tc, marginTop: 2 }}>{siteName.replace(/^autoškola\s*/i, "").toUpperCase() || "DRIVE CZ"}</span>
      </div>
    );
  };

  const socialLinks = [
    { href: youtube, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={DARK} aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill={WHITE}/>
      </svg>
    )},
    { href: facebook, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={DARK} aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    )},
    { href: instagram, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    )},
  ];

  return (
    <>
      <div
        style={{ position: "sticky", top: 0, left: 0, right: 0, zIndex: 100, fontFamily: FONT, backgroundColor: WHITE, boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.10)" : "none", transition: "box-shadow 0.3s ease" }}
        data-template="autoskola-01-navbar"
      >
        {/* Topbar */}
        <div style={{ borderBottom: "1px solid #eeeeee", height: 44 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`}
              style={{ display: "flex", alignItems: "center", gap: 6, color: DARK, textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>
              <span style={{ color: ORANGE }}><PhIcon /></span>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
                {socialLinks.map(({ href, icon }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    style={{ opacity: 0.65, display: "flex", alignItems: "center", transition: "opacity 0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "0.65"; }}>
                    {icon}
                  </a>
                ))}
              </div>
              <div className="hidden md:block" style={{ width: 1, height: 20, backgroundColor: "#e0e0e0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={ORANGE} stroke="none" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span style={{ fontWeight: 700, color: DARK }}>
                  <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
                </span>
                <span style={{ color: "#969696" }} className="hidden sm:inline">
                  <GenericEditableText sectionId={sectionId} field="ratingCount" value={ratingCount} tag="span" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href={resolve("/")} aria-label={siteName} style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
            <LogoSVG />
          </a>
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 2 }}>
            {links.map((l, i) => (
              <a key={`${l.href}-${i}`} href={resolve(l.href)}
                style={{ fontSize: "15px", fontWeight: 500, color: DARK, textDecoration: "none", padding: "10px 16px", borderRadius: 4, transition: "color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = ORANGE; }}
                onMouseLeave={e => { e.currentTarget.style.color = DARK; }}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>
          <div className="hidden lg:flex">
            <a href={resolve(ctaHref)} data-btn="primary"
              style={{ display: "inline-flex", alignItems: "center", backgroundColor: ORANGE, color: WHITE, fontSize: "0.9rem", fontWeight: 700, padding: "11px 26px", borderRadius: 50, textDecoration: "none", whiteSpace: "nowrap", transition: "background-color 0.2s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#d95d18"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = ORANGE; e.currentTarget.style.transform = "translateY(0)"; }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
          <button className="flex lg:hidden" aria-label={open ? "Zavřít menu" : "Otevřít menu"} onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
            {open ? <CloseIcon /> : <BurgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 101, backgroundColor: WHITE, overflowY: "auto" }} role="dialog" aria-modal="true">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 80, borderBottom: `3px solid ${ORANGE}` }}>
            <LogoSVG />
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}><CloseIcon /></button>
          </div>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: ORANGE }}><PhIcon /></span>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`} style={{ color: DARK, textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>{phone}</a>
          </div>
          <nav style={{ padding: "8px 24px 32px" }}>
            {links.map((l, i) => (
              <a key={`mob-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}
                style={{ display: "block", padding: "15px 0", fontFamily: FONT, fontSize: "1.05rem", fontWeight: 500, color: DARK, textDecoration: "none", borderBottom: "1px solid #f0f0f0" }}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 28, backgroundColor: ORANGE, color: WHITE, fontFamily: FONT, fontSize: "0.95rem", fontWeight: 700, padding: "14px 0", borderRadius: 50, textAlign: "center", textDecoration: "none" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

// ── lang-01-navbar ────────────────────────────────────────────────────────────
// 1:1 jipka.cz:
// - Sticky bílý navbar (border-bottom #eef0f3); box-shadow po scrollu
// - SVG speech-bubble+wordmark logo vlevo (červený #e63946)
// - Flat Inter nav linky (#1a1a2e, hover #e63946) uprostřed
// - Červený (#e63946) filled rounded CTA 'Zapsat se' vpravo
// - Mobile hamburger → fullscreen bílý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarLang01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const RED   = "#e63946";
  const DARK  = "#1a1a2e";
  const WHITE = "#ffffff";
  const FONT  = "'Inter', -apple-system, sans-serif";

  const siteName = String(content.siteName ?? "Demo Jazykové kurzy");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Zapsat se");
  const ctaHref  = String(content.ctaHref  ?? "/kurzy");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const displayName = siteName.replace(/^demo\s*/i, "") || "Jazykové kurzy";

  const LogoMark = () => {
    if (logoUrl) return <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 32, width: "auto", objectFit: "contain" }} />;
    return (
      <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: RED, letterSpacing: "-0.5px", userSelect: "none" }}>
        <GenericEditableText sectionId={sectionId} field="siteName" value={displayName} tag="span" />
      </span>
    );
  };

  const BurgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .lang01nav{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #eef0f3;font-family:${FONT};transition:box-shadow 0.2s;}
        .lang01nav.scrolled{box-shadow:0 2px 16px rgba(0,0,0,0.08);}
        .lang01nav-inner{max-width:1280px;margin:0 auto;padding:14px 40px;display:flex;justify-content:space-between;align-items:center;}
        .lang01nav-menu{display:flex;gap:28px;align-items:center;}
        .lang01nav-menu a{color:${DARK};text-decoration:none;font-size:15px;font-weight:600;transition:color 0.2s;}
        .lang01nav-menu a:hover{color:${RED};}
        .lang01nav-cta{padding:10px 22px;background:${RED};color:#fff!important;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;transition:opacity 0.2s;}
        .lang01nav-cta:hover{opacity:0.88;}
        .lang01nav-burger{display:none;background:none;border:none;cursor:pointer;padding:4px;}
        .lang01nav-overlay{display:none;position:fixed;inset:0;background:#fff;z-index:100;flex-direction:column;padding:24px 32px;}
        .lang01nav-overlay.open{display:flex;}
        .lang01nav-overlay-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:36px;}
        .lang01nav-overlay-links{display:flex;flex-direction:column;gap:0;}
        .lang01nav-overlay-links a{font-size:20px;font-weight:700;color:${DARK};text-decoration:none;padding:14px 0;border-bottom:1px solid #eef0f3;}
        .lang01nav-overlay-cta{margin-top:24px;display:inline-block;padding:14px 28px;background:${RED};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;text-align:center;}
        @media(max-width:900px){.lang01nav-menu{display:none;}.lang01nav-burger{display:block;}.lang01nav-inner{padding:14px 20px;}}
      `}</style>

      <nav className={`lang01nav${scrolled ? " scrolled" : ""}`} data-template="lang-01">
        <div className="lang01nav-inner">
          <a href={resolve("/")} style={{ textDecoration: "none" }}>
            <LogoMark />
          </a>
          <div className="lang01nav-menu">
            {links.map((link, i) => (
              <a key={i} href={resolve(link.href)}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
              </a>
            ))}
            <a href={resolve(ctaHref)} data-btn="primary" className="lang01nav-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
          <button className="lang01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <BurgerIcon />
          </button>
        </div>
      </nav>

      <div className={`lang01nav-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="lang01nav-overlay-top">
          <LogoMark />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <CloseIcon />
          </button>
        </div>
        <div className="lang01nav-overlay-links">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
        </div>
        <a href={resolve(ctaHref)} data-btn="primary" className="lang01nav-overlay-cta" onClick={() => setOpen(false)}>{ctaText}</a>
      </div>
    </>
  );
}

// ── kids-01-navbar ────────────────────────────────────────────────────────────
// 1:1 scioles.cz:
// - position:fixed (float over hero — no separator)
// - Desktop TWO-ROW: top row blue #009BDE (logo + yellow CTA), bottom row white (dark nav links)
// - When scrolled: bottom row also blue, nav links white
// - Mobile: blue header row + fullscreen white overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarKids01(props: Props) {
  const { content, tenantSlug, isAdmin } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const BLUE   = "#009BDE";
  const YELLOW = "#ffc107";
  const DARK   = "#212529";
  const WHITE  = "#ffffff";
  const FONT   = "'Roboto', 'Nunito', sans-serif";

  const siteName = String(content.siteName ?? "Demo Kroužky");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Přihlásit dítě");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoMark = ({ dark = false }: { dark?: boolean }) => {
    if (logoUrl) return <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 48, width: "auto", objectFit: "contain", filter: dark ? "none" : "brightness(0) invert(1)" }} />;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, userSelect: "none" }}>
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <polygon points="16,2 27,17 5,17" fill={YELLOW}/>
          <polygon points="16,9 29,27 3,27" fill={dark ? BLUE : WHITE}/>
          <rect x="13" y="27" width="6" height="5" fill={dark ? BLUE : WHITE}/>
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: dark ? DARK : WHITE, lineHeight: 1, letterSpacing: "-0.3px" }}>{siteName}</div>
      </div>
    );
  };

  const BurgerIcon = () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="7" x2="23" y2="7"/><line x1="3" y1="13" x2="23" y2="13"/><line x1="3" y1="19" x2="23" y2="19"/>
    </svg>
  );
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .kids01nav{position:fixed;top:0;left:0;right:0;z-index:100;font-family:${FONT};transition:background 0.25s,box-shadow 0.25s;}
        .kids01nav.scrolled{background:${BLUE};box-shadow:0 3px 20px rgba(0,0,0,0.22);}
        /* Top row — transparent initially, blue when scrolled (via parent) */
        .kids01nav-top{background:transparent;width:100%;transition:background 0.25s;}
        .kids01nav.scrolled .kids01nav-top{background:transparent;}
        .kids01nav-top-inner{max-width:1140px;margin:0 auto;padding:10px 32px;display:flex;justify-content:space-between;align-items:center;}
        /* Bottom row — transparent initially, hides when scrolled (parent is blue) */
        .kids01nav-bottom{background:transparent;width:100%;}
        .kids01nav-bottom-inner{max-width:1140px;margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:4px;}
        .kids01nav-bottom-inner a{font-size:17px;font-weight:400;letter-spacing:0.3px;color:${WHITE};text-decoration:none;padding:10px 14px;display:block;transition:color 0.18s;text-shadow:0 1px 4px rgba(0,0,0,0.4);position:relative;}
        .kids01nav-bottom-inner a::after{content:'';position:absolute;bottom:6px;left:14px;right:14px;height:2px;background:${YELLOW};transform:scaleX(0);transition:transform .22s ease;}
        .kids01nav-bottom-inner a:hover{color:${YELLOW};}
        .kids01nav-bottom-inner a:hover::after{transform:scaleX(1);}
        .kids01nav.scrolled .kids01nav-bottom-inner a{text-shadow:none;}
        .kids01nav.scrolled .kids01nav-bottom-inner a:hover{color:${YELLOW};}
        .kids01nav.scrolled .kids01nav-bottom-inner a:hover::after{transform:scaleX(1);}
        /* CTA button */
        .kids01nav-cta{padding:9px 20px;background:${YELLOW};color:${DARK}!important;border-radius:4px;font-weight:500;font-size:14px;text-decoration:none;white-space:nowrap;transition:background .18s,transform .18s,box-shadow .18s;border:1px solid ${YELLOW};}
        .kids01nav-cta:hover{background:#e0a800;border-color:#d39e00;transform:translateY(-2px);box-shadow:0 4px 12px rgba(255,193,7,0.4);}
        /* Mobile */
        .kids01nav-burger{display:none;background:none;border:none;cursor:pointer;padding:4px;}
        @media(max-width:768px){
          .kids01nav-bottom{display:none;}
          .kids01nav-burger{display:block;}
          .kids01nav-top-inner{padding:10px 20px;}
        }
        /* Mobile overlay */
        .kids01nav-overlay{display:none;position:fixed;inset:0;background:${WHITE};z-index:200;flex-direction:column;padding:0;overflow-y:auto;}
        .kids01nav-overlay.open{display:flex;}
        .kids01nav-overlay-head{background:${BLUE};padding:14px 20px;display:flex;justify-content:space-between;align-items:center;}
        .kids01nav-overlay-body{flex:1;padding:0 24px;}
        .kids01nav-overlay-body a{display:block;font-size:18px;font-weight:500;color:${DARK};text-decoration:none;padding:14px 0;border-bottom:1px solid #e8e8e8;}
        .kids01nav-overlay-body a:hover{color:${BLUE};}
        .kids01nav-overlay-footer{padding:20px 24px;}
        .kids01nav-overlay-cta{display:block;padding:14px 24px;background:${YELLOW};color:${DARK};text-decoration:none;border-radius:4px;font-weight:500;font-size:16px;text-align:center;border:1px solid ${YELLOW};}
      `}</style>

      <nav className={`kids01nav${scrolled ? " scrolled" : ""}`} data-template="kids-01-navbar">
        {/* Top row: blue — logo + CTA */}
        <div className="kids01nav-top">
          <div className="kids01nav-top-inner">
            <a href={resolve("/")} style={{ textDecoration: "none", flexShrink: 0 }}>
              <LogoMark />
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href={resolve(ctaHref)} data-btn="primary" className="kids01nav-cta">{ctaText}</a>
              <button className="kids01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
                <BurgerIcon />
              </button>
            </div>
          </div>
        </div>
        {/* Bottom row: white (scrolled → blue) — nav links */}
        <div className="kids01nav-bottom">
          <div className="kids01nav-bottom-inner">
            {links.map((link, i) => (
              <a key={i} href={resolve(link.href)}>{link.label}</a>
            ))}
          </div>
        </div>
      </nav>

      <div className={`kids01nav-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="kids01nav-overlay-head">
          <LogoMark />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <CloseIcon />
          </button>
        </div>
        <div className="kids01nav-overlay-body">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
        </div>
        <div className="kids01nav-overlay-footer">
          <a href={resolve(ctaHref)} data-btn="primary" className="kids01nav-overlay-cta" onClick={() => setOpen(false)}>{ctaText}</a>
        </div>
      </div>
    </>
  );
}

// ── edu-01-navbar ─────────────────────────────────────────────────────────────
// 1:1 skolapopulo.cz:
// - Sticky tmavě navy (#132339) navbar 72px; box-shadow po scrollu
// - Text logo "DOUČOVÁNÍ" vlevo (bílé, tučné, bez ikony)
// - Flat Libre Franklin nav linky (bílé, hover #91bae4) uprostřed
// - Zelené telefonní tlačítko s pulzujícím dot + modrý CTA vpravo
// - Mobile hamburger → fullscreen bílý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarEdu01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAVY      = "#132339";
  const BLUE      = "#0059df";
  const LIGHT     = "#91bae4";
  const WHITE     = "#ffffff";
  const MINT      = "#e4f0f0"; // bg-potrubo-green rgb(228 240 240)
  const DOT_BG    = "#22a839"; // bg-green-dark    rgb(34 168 57)
  const DOT_RING  = "#34df51"; // border-green-light rgb(52 223 81)
  const FONT      = "'Libre Franklin', Arial, sans-serif";

  const ctaText  = String(content.ctaText  ?? "Klientská zóna");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const phone    = String(content.phone    ?? "");
  const siteName = String(content.siteName ?? "DOUČOVÁNÍ");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoMark = ({ white = true }: { white?: boolean }) => (
    <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: white ? WHITE : NAVY, letterSpacing: "-0.4px", userSelect: "none" as const }}>
      <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
    </span>
  );

  const BurgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .edu01nav{position:sticky;top:0;z-index:50;background:${NAVY};font-family:${FONT};transition:box-shadow 0.25s;}
        .edu01nav.scrolled{box-shadow:0 3px 20px rgba(0,0,0,0.30);}
        .edu01nav-inner{max-width:1280px;margin:0 auto;padding:0 40px;height:72px;display:flex;justify-content:space-between;align-items:center;gap:24px;}
        .edu01nav-menu{display:flex;gap:4px;align-items:center;flex:1;justify-content:center;}
        .edu01nav-menu a{color:${WHITE};text-decoration:none;font-size:15px;font-weight:500;padding:6px 14px;border-radius:4px;transition:color 0.18s,background 0.18s;}
        .edu01nav-menu a:hover{color:${LIGHT};background:rgba(255,255,255,0.06);}
        .edu01nav-phone{display:flex;align-items:center;gap:16px;background:${MINT};color:${NAVY};font-weight:600;font-size:15px;padding:12px 40px 12px 20px;border-radius:62px;text-decoration:none;white-space:nowrap;transition:background 0.15s,color 0.15s;}
        .edu01nav-phone:hover{background:${WHITE};color:${NAVY};}
        .edu01nav-phone-dot{width:20px;height:20px;border-radius:50%;background:${DOT_BG};border:4px solid ${DOT_RING};flex-shrink:0;animation:edu01pulse 1.8s ease-in-out infinite 0.3s;}
        @keyframes edu01pulse{0%,100%{transform:scale(1) translateZ(0);opacity:1;}50%{transform:scale(1.3) translateZ(0);opacity:0.7;}}
        .edu01nav-cta{display:inline-block;padding:12px 40px;background:transparent;color:${WHITE}!important;border:1px solid ${WHITE};border-radius:62px;font-weight:600;font-size:15px;text-decoration:none;white-space:nowrap;transition:background 0.15s,color 0.15s;}
        .edu01nav-cta:hover{background:${WHITE};color:${BLUE}!important;}
        .edu01nav-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
        .edu01nav-burger{display:none;background:none;border:none;cursor:pointer;padding:4px;}
        .edu01nav-overlay{display:none;position:fixed;inset:0;background:${WHITE};z-index:200;flex-direction:column;padding:24px 28px;overflow-y:auto;}
        .edu01nav-overlay.open{display:flex;}
        .edu01nav-overlay-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;padding-bottom:16px;border-bottom:2px solid ${BLUE};}
        .edu01nav-overlay-links{display:flex;flex-direction:column;gap:0;flex:1;}
        .edu01nav-overlay-links a{font-size:20px;font-weight:600;color:${NAVY};text-decoration:none;padding:14px 0;border-bottom:1px solid #e5e7eb;}
        .edu01nav-overlay-links a:hover{color:${BLUE};}
        .edu01nav-overlay-phone{display:flex;align-items:center;gap:16px;background:${MINT};color:${NAVY};font-weight:600;font-size:17px;padding:14px 28px;border-radius:62px;text-decoration:none;margin-top:20px;}
        .edu01nav-overlay-cta{margin-top:12px;display:block;padding:15px 28px;background:${BLUE};color:${WHITE};text-decoration:none;border-radius:62px;font-weight:700;font-size:17px;text-align:center;}
        @media(max-width:960px){.edu01nav-menu{display:none;}.edu01nav-phone{display:none;}.edu01nav-cta{display:none;}.edu01nav-burger{display:block;}.edu01nav-inner{padding:0 20px;}}
      `}</style>

      <nav className={`edu01nav${scrolled ? " scrolled" : ""}`} data-template="edu-01-navbar">
        <div className="edu01nav-inner">
          <a href={resolve("/")} style={{ textDecoration: "none", flexShrink: 0 }}>
            <LogoMark white />
          </a>
          <div className="edu01nav-menu">
            {links.map((link, i) => (
              <a key={i} href={resolve(link.href)}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
              </a>
            ))}
          </div>
          <div className="edu01nav-right">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="edu01nav-phone">
                <span className="edu01nav-phone-dot" />
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            <a href={resolve(ctaHref)} data-btn="primary" className="edu01nav-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
            <button className="edu01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
              <BurgerIcon />
            </button>
          </div>
        </div>
      </nav>

      <div className={`edu01nav-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="edu01nav-overlay-top">
          <LogoMark white={false} />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <CloseIcon />
          </button>
        </div>
        <div className="edu01nav-overlay-links">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="edu01nav-overlay-phone" onClick={() => setOpen(false)}>
            <span className="edu01nav-phone-dot" />
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
        )}
        <a href={resolve(ctaHref)} data-btn="primary" className="edu01nav-overlay-cta" onClick={() => setOpen(false)}>
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>
    </>
  );
}

// ── grooming-01-navbar ────────────────────────────────────────────────────────
// 1:1 cutedogs.cz:
// - Transparentní fixed navbar, po scrollu rgba(0,0,0,.8)
// - SVG tlapka + wordmark "Psí Salón" vlevo
// - Nav linky uppercase letter-spacing:1.6px, hover zlaté — BEZ CTA tlačítka
// - FB/IG ikonky 26×26px vpravo, mobile hamburger → tmavý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarGrooming01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const GOLD  = "#d0aa57";
  const DARK  = "#101417";
  const WHITE = "#ffffff";
  const FONT  = "'Hanken Grotesk', 'Inter', sans-serif";

  const siteName = String(content.siteName ?? "Psí Salón");
  const logoUrl  = String(content.logoUrl  ?? "");
  const links2   = (content.links as Array<{ label: string; href: string }>) ?? [];
  const socials2 = (content.socials as Array<{ icon?: string; href?: string; label?: string }>) ?? [];

  const resolve2 = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoMarkG = () => {
    if (logoUrl) return <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 67, width: "auto", objectFit: "contain" }} />;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, userSelect: "none" as const }}>
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <ellipse cx="16" cy="20" rx="9" ry="7" fill={GOLD} />
          <ellipse cx="8"  cy="13" rx="3.5" ry="4.5" fill={GOLD} />
          <ellipse cx="24" cy="13" rx="3.5" ry="4.5" fill={GOLD} />
          <ellipse cx="12" cy="10" rx="2.5" ry="3.2" fill={GOLD} />
          <ellipse cx="20" cy="10" rx="2.5" ry="3.2" fill={GOLD} />
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: WHITE, lineHeight: 1.1, letterSpacing: "0.3px" }}>
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
        </div>
      </div>
    );
  };

  const SocialIconG = ({ name }: { name?: string }) => {
    const p = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: WHITE, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
    if (name === "instagram") return (
      <svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill={WHITE} stroke="none"/></svg>
    );
    if (name === "facebook") return (
      <svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    );
    return null;
  };

  const BurgerIconG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const CloseIconG = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="2" y1="2" x2="20" y2="20"/><line x1="20" y1="2" x2="2" y2="20"/>
    </svg>
  );

  const navBg = scrolled ? "rgba(0,0,0,.8)" : "transparent";
  const navShadow = scrolled ? "0 2px 12px rgba(0,0,0,0.3)" : "none";

  return (
    <>
      <style>{`
        .gr01nav-inner{max-width:1424px;margin:0 auto;padding:0 40px;height:96px;display:flex;align-items:center;}
        .gr01nav-logo{flex-shrink:0;text-decoration:none;}
        .gr01nav-links{display:flex;align-items:center;flex:1;padding-left:40px;}
        .gr01nav-links a{color:${WHITE};text-decoration:none;font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1.6px;padding:0 20px;transition:color 0.2s;}
        .gr01nav-links a:first-child{padding-left:0;}
        .gr01nav-links a:hover{color:${GOLD};text-decoration:none;}
        .gr01nav-social{display:flex;align-items:center;gap:14px;margin-left:auto;flex-shrink:0;}
        .gr01nav-social a{color:${WHITE};display:flex;align-items:center;transition:opacity 0.2s;}
        .gr01nav-social a:hover{opacity:0.7;}
        .gr01nav-burger{display:none;background:none;border:none;cursor:pointer;padding:4px;margin-left:auto;}
        @media(max-width:960px){
          .gr01nav-links{display:none;}
          .gr01nav-social{display:none;}
          .gr01nav-burger{display:block;}
        }
        .gr01nav-overlay{display:none;position:fixed;inset:0;background:rgba(16,20,23,0.97);z-index:200;flex-direction:column;}
        .gr01nav-overlay.open{display:flex;}
        .gr01nav-overlay-head{padding:20px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(208,170,87,0.25);}
        .gr01nav-overlay-body{flex:1;padding:24px;display:flex;flex-direction:column;}
        .gr01nav-overlay-body a{display:block;font-size:20px;font-weight:600;text-transform:uppercase;letter-spacing:1.6px;color:${WHITE};text-decoration:none;padding:18px 0;border-bottom:1px solid rgba(255,255,255,0.1);}
        .gr01nav-overlay-body a:hover{color:${GOLD};}
        .gr01nav-overlay-social{padding:24px;display:flex;gap:20px;border-top:1px solid rgba(208,170,87,0.25);}
        .gr01nav-overlay-social a{display:flex;color:${WHITE};opacity:0.8;}
        .gr01nav-overlay-social a:hover{opacity:1;}
      `}</style>

      <nav style={{ background: navBg, boxShadow: navShadow, position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "background 0.3s, box-shadow 0.3s", fontFamily: FONT }} data-template="grooming-01-navbar">
        <div className="gr01nav-inner">
          <a href={resolve2("/")} className="gr01nav-logo">
            <LogoMarkG />
          </a>
          <div className="gr01nav-links">
            {links2.map((link, i) => (
              <a key={i} href={resolve2(link.href)}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
              </a>
            ))}
          </div>
          <div className="gr01nav-social">
            {socials2.map((s, i) => (
              <a key={i} href={s.href ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={s.label ?? s.icon ?? ""}>
                <SocialIconG name={s.icon} />
              </a>
            ))}
          </div>
          <button className="gr01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <BurgerIconG />
          </button>
        </div>
      </nav>

      <div className={`gr01nav-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="gr01nav-overlay-head">
          <LogoMarkG />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <CloseIconG />
          </button>
        </div>
        <div className="gr01nav-overlay-body">
          {links2.map((link, i) => (
            <a key={i} href={resolve2(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
        <div className="gr01nav-overlay-social">
          {socials2.map((s, i) => (
            <a key={i} href={s.href ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={s.label ?? s.icon ?? ""} onClick={() => setOpen(false)}>
              <SocialIconG name={s.icon} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}


// ── pethotel-01-navbar ────────────────────────────────────────────────────────
// 1:1 skolkapropejska.cz:
// - Fixed cream gradient (#fff5ee→#fcfae8) navbar, border-bottom #BA9972
// - Logo: tlapka SVG + "Demo Hotel pro psy" v #712419 (Quicksand)
// - Nav links: #712419, 18px, hover underline
// - Mobile: hamburger → fullscreen cream overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarPethotel01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  const PRIMARY = "#712419";
  const CREAM   = "#fff5ee";
  const BORDER  = "#BA9972";
  const FONT    = "'Quicksand', Arial, sans-serif";

  const siteName = String(content.siteName ?? "Demo Hotel pro psy");
  const logoUrl  = String(content.logoUrl  ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const PawLogo = () => {
    if (logoUrl) return (
      <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName}>
        <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 44, width: "auto", objectFit: "contain" }} />
      </GenericEditableImage>
    );
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, userSelect: "none" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 60 60" aria-hidden="true">
          <circle cx="18" cy="14" r="6" fill={PRIMARY}/>
          <circle cx="30" cy="9"  r="6" fill={PRIMARY}/>
          <circle cx="42" cy="14" r="6" fill={PRIMARY}/>
          <ellipse cx="30" cy="34" rx="13" ry="11" fill={PRIMARY}/>
          <circle cx="23" cy="44" r="5"  fill={PRIMARY}/>
          <circle cx="37" cy="44" r="5"  fill={PRIMARY}/>
        </svg>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: PRIMARY, lineHeight: 1 }}>
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
        </span>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .ph01nav{position:fixed;top:0;left:0;right:0;z-index:333;background:linear-gradient(to right,${CREAM} 0%,#fcfae8 100%);border-bottom:1px solid ${BORDER};font-family:${FONT};}
        .ph01nav-inner{max-width:1200px;margin:0 auto;padding:0 32px;height:72px;display:flex;align-items:center;justify-content:space-between;}
        .ph01nav-logo{text-decoration:none;}
        .ph01nav-links{display:flex;align-items:center;gap:2px;list-style:none;margin:0;padding:0;}
        .ph01nav-links a{font-family:${FONT};font-size:16px;font-weight:600;color:${PRIMARY};text-decoration:none;padding:8px 14px;display:block;transition:color 0.18s;position:relative;}
        .ph01nav-links a::after{content:'';position:absolute;bottom:2px;left:14px;right:14px;height:2px;background:${PRIMARY};transform:scaleX(0);transition:transform .2s ease;}
        .ph01nav-links a:hover::after{transform:scaleX(1);}
        .ph01nav-burger{display:none;background:none;border:none;cursor:pointer;padding:6px;flex-direction:column;gap:5px;}
        @media(max-width:768px){
          .ph01nav-links{display:none;}
          .ph01nav-burger{display:flex;}
          .ph01nav-inner{padding:0 20px;height:64px;}
        }
        .ph01nav-overlay{display:none;position:fixed;inset:0;background:linear-gradient(to right,${CREAM} 0%,#fcfae8 100%);z-index:400;flex-direction:column;}
        .ph01nav-overlay.open{display:flex;}
        .ph01nav-overlay-head{padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${BORDER};}
        .ph01nav-overlay-body{flex:1;padding:8px 24px;overflow-y:auto;}
        .ph01nav-overlay-body a{display:block;font-family:${FONT};font-size:18px;font-weight:600;color:${PRIMARY};text-decoration:none;padding:14px 0;border-bottom:1px solid #e8ddd5;}
        .ph01nav-overlay-body a:hover{text-decoration:underline;}
      `}</style>

      <nav className="ph01nav" data-template="pethotel-01-navbar">
        <div className="ph01nav-inner">
          <a href={resolve("/")} className="ph01nav-logo" aria-label={siteName}>
            <PawLogo />
          </a>

          <ul className="ph01nav-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <button className="ph01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true">
              <rect y="0"  width="24" height="3" rx="1.5" fill={PRIMARY}/>
              <rect y="7"  width="24" height="3" rx="1.5" fill={PRIMARY}/>
              <rect y="14" width="24" height="3" rx="1.5" fill={PRIMARY}/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`ph01nav-overlay${open ? " open" : ""}`} role="dialog" aria-label="Navigace">
        <div className="ph01nav-overlay-head">
          <PawLogo />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="ph01nav-overlay-body">
          {links.map((l, i) => (
            <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

// ── vet-01-navbar ──────────────────────────────────────────────────────────────
// 1:1 veterinafenix.cz:
// - Bílý navbar s border-bottom #D8D8D8
// - Row 1 (topbar): otevírací status + adresa + email + telefon, 13px #646464
// - Row 2 (logobar, sticky): SVG stetoskop+wordmark vlevo, Roboto Condensed 17px nav linky
//   #747474 → hover #286C7E, podtržení #B7D5DD
// - Mobile: hamburger → fullscreen bílý overlay
// ──────────────────────────────────────────────────────────────────────────────
function NavbarVet01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const PRIMARY   = "#286C7E";
  const NAV_TEXT  = "#747474";
  const UNDERLINE = "#B7D5DD";
  const GRAY_TEXT = "#646464";
  const ICON_COL  = "#7D999E";
  const BORDER    = "#D8D8D8";
  const WHITE     = "#ffffff";
  const FONT_NAV  = "'Roboto Condensed', 'Roboto', sans-serif";

  const siteName = String(content.siteName ?? "Demo Veterinární Klinika");
  const logoUrl  = String(content.logoUrl  ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const email    = String(content.email    ?? "info@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, Praha");
  const openText = String(content.openText ?? "Máme otevřeno");

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const defaultLogoUrl = "/templates/vet-01/logo.svg";
  const resolvedLogo = logoUrl || defaultLogoUrl;

  const VetLogoMark = () => (
    <img
      src={resolvedLogo}
      alt="Váš Veterinář"
      style={{ height: 53, width: "auto", objectFit: "contain", display: "block" }}
    />
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;500;700&display=swap" />
      <style>{`        .vet01nav{position:sticky;top:0;left:0;right:0;z-index:100;background:${WHITE};font-family:${FONT_NAV};transition:box-shadow 0.25s;}
        .vet01nav.scrolled{box-shadow:0 2px 16px rgba(0,0,0,0.10);}
        .vet01nav-topbar{background:${WHITE};border-bottom:1px solid ${BORDER};padding:6px 0;}
        .vet01nav-topbar-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:24px;font-size:13px;color:${GRAY_TEXT};}
        .vet01nav-topbar-item{display:flex;align-items:center;gap:5px;white-space:nowrap;}
        .vet01nav-topbar-item a{color:${GRAY_TEXT};text-decoration:none;}
        .vet01nav-topbar-item a:hover{color:${PRIMARY};}
        .vet01nav-logobar{background:${WHITE};border-bottom:1px solid ${BORDER};padding:0;}
        .vet01nav-logobar-inner{max-width:1200px;margin:0 auto;padding:0 32px;display:flex;align-items:center;justify-content:space-between;min-height:72px;}
        .vet01nav-links{display:flex;align-items:center;gap:0;list-style:none;margin:0;padding:0;}
        .vet01nav-links a{font-family:${FONT_NAV};font-size:17px;font-weight:400;color:${NAV_TEXT};text-decoration:none;padding:26px 14px;display:block;transition:color 0.18s;position:relative;}
        .vet01nav-links a::after{content:'';position:absolute;bottom:18px;left:14px;right:14px;height:2px;background:${UNDERLINE};transform:scaleX(0);transition:transform 0.22s ease;}
        .vet01nav-links a:hover{color:${PRIMARY};}
        .vet01nav-links a:hover::after{transform:scaleX(1);}
        .vet01nav-burger{display:none;background:none;border:none;cursor:pointer;padding:4px;}
        @media(max-width:900px){
          .vet01nav-links{display:none;}
          .vet01nav-burger{display:block;}
          .vet01nav-topbar{display:none;}
        }
        .vet01nav-overlay{display:none;position:fixed;inset:0;background:${WHITE};z-index:200;flex-direction:column;}
        .vet01nav-overlay.open{display:flex;}
        .vet01nav-overlay-head{background:${WHITE};border-bottom:1px solid ${BORDER};padding:16px 20px;display:flex;justify-content:space-between;align-items:center;}
        .vet01nav-overlay-body{flex:1;padding:0 24px;overflow-y:auto;}
        .vet01nav-overlay-body a{display:block;font-family:${FONT_NAV};font-size:18px;font-weight:500;color:${NAV_TEXT};text-decoration:none;padding:14px 0;border-bottom:1px solid #eee;}
        .vet01nav-overlay-body a:hover{color:${PRIMARY};}
      `}</style>

      <nav className={`vet01nav${scrolled ? " scrolled" : ""}`} data-template="vet-01-navbar">
        <div className="vet01nav-topbar">
          <div className="vet01nav-topbar-inner">
            <div className="vet01nav-topbar-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ICON_COL} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span><GenericEditableText sectionId={sectionId} field="openText" value={openText} tag="span" /></span>
            </div>
            <div className="vet01nav-topbar-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ICON_COL} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span>
            </div>
            <div className="vet01nav-topbar-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ICON_COL} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a>
            </div>
            <div className="vet01nav-topbar-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ICON_COL} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
              </svg>
              <a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a>
            </div>
          </div>
        </div>

        <div className="vet01nav-logobar">
          <div className="vet01nav-logobar-inner">
            <a href={resolve("/")} style={{ textDecoration: "none" }}>
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={resolvedLogo} alt={siteName} style={{ display: "block" }}>
                <VetLogoMark />
              </GenericEditableImage>
            </a>
            <ul className="vet01nav-links">
              {links.map((link, i) => (
                <li key={i}><a href={resolve(link.href)}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" /></a></li>
              ))}
            </ul>
            <button className="vet01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={NAV_TEXT} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="7" x2="23" y2="7"/><line x1="3" y1="13" x2="23" y2="13"/><line x1="3" y1="19" x2="23" y2="19"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className={`vet01nav-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="vet01nav-overlay-head">
          <VetLogoMark />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={NAV_TEXT} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="vet01nav-overlay-body">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ucetni-02-navbar ──────────────────────────────────────────────────────────
// 1:1 grantex.cz:
// - sticky bílý (#ffffff) navbar 80px
// - SVG 'G' monogram + "ADVISORY GROUP" wordmark vlevo (zelená #004835 + zlatá #bca160)
// - Montserrat nav linky (#3c3c3c, hover #004835 underline)
// - zlatý (#bca160) filled pill CTA 'Kontaktujte nás' s bílým textem vpravo
// - box-shadow po scrollu; mobile hamburger → fullscreen zelený overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarUcetni02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const GREEN  = "#004835";
  const GOLD   = "#bca160";
  const WHITE  = "#ffffff";
  const TEXT   = "#3c3c3c";
  const FONT   = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const siteName = String(content.siteName ?? "Demo Daňový Poradce");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Kontaktujte nás");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoMark = () => (
    <svg viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 51, width: "auto" }}>
      <circle cx="24" cy="24" r="20" fill={GREEN}/>
      <text x="24" y="29.5" textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontSize="15" fontWeight="700" fill={WHITE}>G</text>
      <line x1="19" y1="33" x2="29" y2="33" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
      <text x="52" y="21" fontFamily="Montserrat, Arial, sans-serif" fontSize="13" fontWeight="700" fill={GREEN} letterSpacing="0.5">DAŇOVÝ</text>
      <text x="52" y="36" fontFamily="Montserrat, Arial, sans-serif" fontSize="9.5" fontWeight="500" fill={GOLD} letterSpacing="2">PORADCE</text>
    </svg>
  );

  const styles = `
    .ucn02-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: ${WHITE};
      transition: box-shadow 0.25s ease;
      font-family: ${FONT};
    }
    .ucn02-nav.scrolled {
      box-shadow: 0 2px 16px rgba(0,72,53,0.12);
    }
    .ucn02-nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .ucn02-logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .ucn02-links {
      display: flex;
      align-items: center;
      gap: 4px;
      list-style: none;
      margin: 0 0 0 auto;
      padding: 0;
    }
    .ucn02-links a {
      display: block;
      padding: 8px 14px;
      font-size: 15px;
      font-weight: 400;
      color: ${TEXT};
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .ucn02-links a:hover {
      color: ${GREEN};
      border-bottom-color: ${GREEN};
    }
    .ucn02-burger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }
    .ucn02-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: ${GREEN};
      flex-direction: column;
      padding: 24px 32px;
    }
    .ucn02-overlay.open { display: flex; }
    .ucn02-overlay-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .ucn02-overlay-body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ucn02-overlay-body a {
      font-family: ${FONT};
      font-size: 22px;
      font-weight: 700;
      color: ${WHITE};
      text-decoration: none;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.12);
    }
    .ucn02-overlay-body a:hover { color: ${GOLD}; }
    @media (max-width: 900px) {
      .ucn02-links { display: none; }
      .ucn02-burger { display: block; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <nav className={`ucn02-nav${scrolled ? " scrolled" : ""}`} data-template="ucetni-02-navbar">
        <div className="ucn02-nav-inner">
          <a href={resolve("/")} className="ucn02-logo" aria-label={siteName}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <LogoMark />
            </GenericEditableImage>
          </a>

          <ul className="ucn02-links">
            {links.map((link, i) => (
              <li key={i}>
                <a href={resolve(link.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <button className="ucn02-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="7" x2="23" y2="7"/><line x1="3" y1="13" x2="23" y2="13"/><line x1="3" y1="19" x2="23" y2="19"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className={`ucn02-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="ucn02-overlay-head">
          <LogoMark />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="20" y2="20"/><line x1="20" y1="6" x2="6" y2="20"/>
            </svg>
          </button>
        </div>
        <div className="ucn02-overlay-body">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

// ── ucetni-03-navbar ──────────────────────────────────────────────────────────
// 1:1 gpf.cz (Gepard Finance):
// - single sticky nav, bílý bg
// - logo (text wordmark "Hypoteční Specialista") vlevo, h-20 desktop
// - vpravo: flex-col — row1: muted phone text (ml-auto) + burger mobile
//                     row2: nav linky (space-x-8) + 2 CTA buttons
// - žádné separátory mezi linky
// - CTA: tmavý #002000 "PRO PORADCE" + zelený #8ec63f "HYPOT. KALKULAČKA"
// - mobile hamburger → fullscreen #002000 overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarUcetni03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const DARK    = "#002000";
  const GREEN   = "#8ec63f";
  const WHITE   = "#ffffff";
  const TEXT    = "#3C3D3D";
  const MUTED   = "#737b79";
  const FONT    = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const siteName   = String(content.siteName   ?? "Demo Hypoteční Specialista");
  const logoUrl    = String(content.logoUrl    ?? "");
  const ctaText    = String(content.ctaText    ?? "Hypoteční kalkulačka");
  const ctaHref    = String(content.ctaHref    ?? "#kalkulacka");
  const cta2Text   = String(content.ctaSecondaryText ?? "Pro poradce");
  const cta2Href   = String(content.ctaSecondaryHref ?? "#kontakt");
  const phone      = String(content.phone      ?? "704 123 456");
  const topBarText = String(content.topBarText ?? "Nevíte si rady? Zavolejte nám:");
  const links      = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoMark = () => (
    <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 72, width: "auto" }}>
      {/* green accent bar vlevo */}
      <rect x="0" y="4" width="3" height="52" fill={GREEN} rx="1.5"/>
      {/* texty */}
      <text x="12" y="28" fontFamily={FONT} fontSize="20" fontWeight="800" fill={DARK} letterSpacing="0.3">Hypoteční</text>
      <text x="12" y="52" fontFamily={FONT} fontSize="20" fontWeight="700" fill={GREEN} letterSpacing="0.3">Specialista</text>
    </svg>
  );

  const ArrowRight = ({ color }: { color: string }) => (
    <svg width="20" height="11" viewBox="0 0 20 11" fill="none" style={{ marginLeft: 10, flexShrink: 0 }}>
      <path d="M0.94 5.16L18.72 5.16" stroke={color} strokeWidth="1.2"/>
      <path d="M14.53 0.51L19.17 5.15L14.46 9.87" stroke={color} strokeWidth="1.2"/>
    </svg>
  );

  const styles = `
    .ucn03-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: ${WHITE};
      font-family: ${FONT};
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
      border-bottom: 1px solid transparent;
    }
    .ucn03-nav.scrolled {
      box-shadow: 0 4px 24px rgba(0,32,0,0.09);
      border-bottom-color: #e8ede8;
    }
    .ucn03-nav-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items: stretch;
    }
    .ucn03-logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      padding: 12px 0;
    }
    .ucn03-right {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      padding-left: 32px;
    }
    /* Row 1: phone info */
    .ucn03-toprow {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      padding: 10px 0 8px;
      font-size: 13.5px;
      color: ${MUTED};
      border-bottom: 1px solid #f0f0f0;
    }
    .ucn03-toprow a {
      color: ${DARK};
      font-weight: 700;
      font-size: 13.5px;
      text-decoration: none;
      transition: color 0.2s;
    }
    .ucn03-toprow a:hover { color: ${GREEN}; }
    /* Row 2: links + CTAs */
    .ucn03-bottomrow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
    }
    .ucn03-links {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      height: 100%;
    }
    .ucn03-links li { height: 100%; display: flex; align-items: center; }
    .ucn03-links a {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 18px;
      font-size: 16px;
      font-weight: 500;
      color: ${TEXT};
      text-decoration: none;
      white-space: nowrap;
      position: relative;
      transition: color 0.2s;
    }
    .ucn03-links a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 18px;
      right: 18px;
      height: 2px;
      background: ${GREEN};
      transform: scaleX(0);
      transition: transform 0.22s ease;
    }
    .ucn03-links a:hover { color: ${DARK}; }
    .ucn03-links a:hover::after { transform: scaleX(1); }
    .ucn03-ctas {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      padding: 10px 0;
    }
    .ucn03-cta-dark {
      display: inline-flex;
      align-items: center;
      background: ${DARK};
      color: ${WHITE};
      font-family: ${FONT};
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      padding: 13px 20px;
      white-space: nowrap;
      letter-spacing: 0.2px;
      transition: opacity 0.2s;
    }
    .ucn03-cta-dark:hover { opacity: 0.82; }
    .ucn03-cta-green {
      display: inline-flex;
      align-items: center;
      background: ${GREEN};
      color: ${TEXT};
      font-family: ${FONT};
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      padding: 13px 20px;
      white-space: nowrap;
      letter-spacing: 0.2px;
      transition: filter 0.2s;
    }
    .ucn03-cta-green:hover { filter: brightness(0.9); }
    .ucn03-burger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }
    .ucn03-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: ${DARK};
      flex-direction: column;
      padding: 24px 20px;
    }
    .ucn03-overlay.open { display: flex; }
    .ucn03-overlay-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36px;
    }
    .ucn03-overlay-links {
      display: flex;
      flex-direction: column;
    }
    .ucn03-overlay-links a {
      font-family: ${FONT};
      font-size: 21px;
      font-weight: 700;
      color: ${WHITE};
      text-decoration: none;
      padding: 13px 0;
      border-bottom: 1px solid rgba(255,255,255,0.10);
    }
    .ucn03-overlay-links a:hover { color: ${GREEN}; }
    .ucn03-overlay-phone {
      margin-top: 28px;
      font-size: 13px;
      color: rgba(255,255,255,0.5);
    }
    .ucn03-overlay-phone a {
      color: ${GREEN};
      font-weight: 700;
      font-size: 18px;
      text-decoration: none;
      display: block;
      margin-top: 4px;
    }
    .ucn03-overlay-cta {
      display: inline-flex;
      align-items: center;
      padding: 14px 24px;
      background: ${GREEN};
      color: ${TEXT};
      font-family: ${FONT};
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      margin-top: 24px;
      align-self: flex-start;
    }
    @media (max-width: 1024px) {
      .ucn03-links, .ucn03-ctas { display: none; }
      .ucn03-burger { display: block; }
      .ucn03-toprow { display: none; }
      .ucn03-bottomrow { padding-left: 0; }
      .ucn03-nav-inner { padding-bottom: 16px; }
    }
  `;

  const logoOverlay = logoUrl ? (
    <OptimizedPicture src={logoUrl} alt={siteName} style={{ height: 56, width: "auto", display: "block" }} />
  ) : <LogoMark />;

  return (
    <>
      <style>{styles}</style>

      {/* Sticky nav */}
      <nav className={`ucn03-nav${scrolled ? " scrolled" : ""}`} data-template="ucetni-03-navbar">
        <div className="ucn03-nav-inner">
          {/* Logo */}
          <a href={resolve("/")} className="ucn03-logo" aria-label={siteName}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <LogoMark />
            </GenericEditableImage>
          </a>

          {/* Right column: phone row + links+CTA row */}
          <div className="ucn03-right">
            {/* Row 1: phone */}
            <div className="ucn03-toprow">
              <span><GenericEditableText sectionId={sectionId} field="topBarText" value={topBarText} tag="span" /></span>
              <a href={`tel:${phone.replace(/\s/g, "")}`}>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              {/* Mobile burger */}
              <button className="ucn03-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Row 2: nav links + CTAs */}
            <div className="ucn03-bottomrow">
              <ul className="ucn03-links">
                {links.map((link, i) => (
                  <li key={i}>
                    <a href={resolve(link.href)}>
                      <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="ucn03-ctas">
                <a href={resolve(cta2Href)} className="ucn03-cta-dark">
                  <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={cta2Text} tag="span" />
                  <ArrowRight color={TEXT} />
                </a>
                <a href={resolve(ctaHref)} data-btn="primary" className="ucn03-cta-green">
                  <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                  <ArrowRight color={TEXT} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`ucn03-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="ucn03-overlay-head">
          <LogoMark />
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="20" y2="20"/><line x1="20" y1="6" x2="6" y2="20"/>
            </svg>
          </button>
        </div>
        <div className="ucn03-overlay-links">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
        <div className="ucn03-overlay-phone">
          {topBarText}
          <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
        </div>
        <a href={resolve(ctaHref)} data-btn="primary" className="ucn03-overlay-cta" onClick={() => setOpen(false)}>
          {ctaText} <ArrowRight color={TEXT} />
        </a>
      </div>
    </>
  );
}

// ── solar-01-navbar ───────────────────────────────────────────────────────────
// solar-01 — B2B solar company, Awwwards-level upgrade.
// Two-tier navbar: utility strip (phone/hours/dotace-badge) + main row.
// SunMark w/ orbital ring + animated rays. Center-dot indicator nav links.
// Phone quick-action (>1200px), CTA gradient s shimmer + animated arrow.
// Mobile: fullscreen radial navy panel s grid overlay, numbered links,
// contact patička, close button rotation.
// resolveNavHref pro multipage/onepage compat.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarSolar01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const NAVY = "#0d2a3a";

  const siteMode      = String(content.siteMode ?? "multipage");
  const siteName      = String(content.siteName ?? "HeliosTech");
  const tagline       = String(content.tagline  ?? "Fotovoltaika & tepelná čerpadla");
  const links         = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText       = String(content.ctaText  ?? "Bezplatná nabídka");
  const ctaHref       = String(content.ctaHref  ?? "/kontakt");
  const phone         = String(content.phone    ?? "800 123 456");
  const phoneLabel    = String(content.phoneLabel  ?? "Volejte zdarma");
  const email         = String(content.email    ?? "info@heliostech-demo.cz");
  const hoursLabel    = String(content.hoursLabel ?? "Po–Pá 8:00–17:00");
  const badgeText     = String(content.badgeText  ?? "NZÚ dotace do 200 000 Kč");
  const mobileTitle   = String(content.mobileTitle ?? "Navigace");
  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const phoneTel = phone.replace(/\s+/g, "");

  /* Icons */
  const IconPhone = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72a2 2 0 0 1 1.72 2z"/>
    </svg>
  );
  const IconClock = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
  const IconMail = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const IconArrow = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
  const IconChevron = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
  const IconClose = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  /* SunMark — orbital ring + 8 rays + core */
  const SunMark = () => (
    <span className="s01nb-logo-mark" aria-hidden="true">
      <span className="s01nb-logo-orbit" />
      <svg className="s01nb-logo-sun" viewBox="0 0 28 28" fill="none">
        <g className="s01nb-logo-rays" stroke={NAVY} strokeWidth="2" strokeLinecap="round">
          <line x1="14" y1="2"  x2="14" y2="5.5"/>
          <line x1="14" y1="22.5" x2="14" y2="26"/>
          <line x1="2"  y1="14" x2="5.5" y2="14"/>
          <line x1="22.5" y1="14" x2="26" y2="14"/>
          <line x1="5"   y1="5"  x2="7.5" y2="7.5"/>
          <line x1="20.5" y1="20.5" x2="23" y2="23"/>
          <line x1="23"  y1="5"  x2="20.5" y2="7.5"/>
          <line x1="7.5" y1="20.5" x2="5"   y2="23"/>
        </g>
        <circle cx="14" cy="14" r="5.4" fill={NAVY}/>
      </svg>
    </span>
  );

  const LogoBlock = () => (
    <>
      <SunMark />
      <span className="s01nb-logo-text">
        <span className="s01nb-logo-name">
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
        </span>
        <span className="s01nb-logo-tag">
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </span>
      </span>
    </>
  );

  return (
    <>
      <header className="s01nb" data-template="solar-01" data-scrolled={scrolled ? "true" : "false"}>

        {/* ═══ Utility strip ═══ */}
        <div className="s01nb-util" role="complementary" aria-label="Kontaktní informace">
          <div className="s01nb-util-inner">
            <div className="s01nb-util-left">
              <a className="s01nb-util-item" href={`tel:${phoneTel}`}>
                <IconPhone />
                <span>
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                  {" "}
                  <strong style={{ color: "#fff", fontWeight: 600 }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </strong>
                </span>
              </a>
              <span className="s01nb-util-item s01nb-util-hide-sm" style={{ cursor: "default" }}>
                <IconClock />
                <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
              </span>
              <a className="s01nb-util-item s01nb-util-hide-sm" href={`mailto:${email}`}>
                <IconMail />
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            </div>
            <div className="s01nb-util-right">
              <span className="s01nb-util-badge">
                <span className="s01nb-util-badge-dot" />
                <GenericEditableText sectionId={sectionId} field="badgeText" value={badgeText} tag="span" />
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Main row ═══ */}
        <div className="s01nb-main">
          <a href={resolve("/")} className="s01nb-logo" aria-label={siteName}>
            <LogoBlock />
          </a>

          <nav className="s01nb-nav" aria-label="Hlavní menu">
            {links.map((l, i) => (
              <a key={`${l.href}-${i}`} href={resolve(l.href)} className="s01nb-link">
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          <div className="s01nb-actions">
            <a href={`tel:${phoneTel}`} className="s01nb-phone" aria-label={`Volejte ${phone}`}>
              <span className="s01nb-phone-icon"><IconPhone size={15} /></span>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, gap: 2 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#6b7c86", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                </span>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </span>
              </span>
            </a>

            <a href={resolve(ctaHref)} className="s01nb-cta" data-btn="primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span className="s01nb-cta-arrow"><IconArrow size={15} /></span>
            </a>

            <button
              type="button"
              className="s01nb-burger"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={open}
              data-open={open ? "true" : "false"}
            >
              <span className="s01nb-burger-line" />
              <span className="s01nb-burger-line" />
              <span className="s01nb-burger-line" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Mobile overlay ═══ */}
      <div className="s01mob" data-template="solar-01" data-open={open ? "true" : "false"} role="dialog" aria-modal="true" aria-label={mobileTitle}>
        <div className="s01mob-header">
          <a href={resolve("/")} className="s01nb-logo" onClick={() => setOpen(false)}>
            <LogoBlock />
          </a>
          <button
            type="button"
            className="s01mob-close"
            onClick={() => setOpen(false)}
            aria-label="Zavřít menu"
          >
            <IconClose />
          </button>
        </div>

        <nav className="s01mob-body" aria-label="Mobilní menu">
          {links.map((l, i) => (
            <a
              key={`mob-${l.href}-${i}`}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              className="s01mob-link"
              style={{ transitionDelay: open ? `${0.08 + i * 0.05}s` : "0s" }}
            >
              <span className="s01mob-link-num">{String(i + 1).padStart(2, "0")}</span>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              <span className="s01mob-link-arrow"><IconChevron size={18} /></span>
            </a>
          ))}
        </nav>

        <div className="s01mob-footer">
          <a href={resolve(ctaHref)} className="s01mob-cta" onClick={() => setOpen(false)}>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            <IconArrow size={16} />
          </a>
          <div className="s01mob-contact">
            <a href={`tel:${phoneTel}`} className="s01mob-contact-item">
              <IconPhone /> <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={`mailto:${email}`} className="s01mob-contact-item">
              <IconMail /> <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
            </a>
          </div>
        </div>
      </div>

      {/* Spacer — matches header height per breakpoint (utility strip visible >600px) */}
      <div className="s01nb-spacer" data-scrolled={scrolled ? "true" : "false"} data-template="solar-01" aria-hidden="true" />
    </>
  );
}

// ── arch-01-navbar ────────────────────────────────────────────────────────────
// 1:1 karesarch.cz:
// - fixed transparentní navbar 72px, překrývá fullscreen hero (žádný spacer)
// - logo vlevo: SVG bílý wordmark "ARCHITEKTA"
// - desktop: POUZE hamburger vpravo, žádné viditelné nav linky
// - hamburger → fullscreen černý overlay s velkými nav linky + tel + social ikonky
// ─────────────────────────────────────────────────────────────────────────────
function NavbarArch01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  const BLACK = "#000000";
  const WHITE = "#ffffff";
  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const siteName = String(content.siteName ?? "ARCHITEKTA");
  const logoUrl  = String(content.logoUrl ?? "");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone    = String(content.phone ?? "+420 704 123 456");
  const socials  = (content.socials as Array<{ icon?: string; href?: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const LogoMark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 32" width="265" height="34" aria-hidden="true">
      <text x="0" y="23" fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontSize="17" fontWeight="700" letterSpacing="5" fill={WHITE}>{siteName}</text>
    </svg>
  );

  const SocialIcon = ({ name }: { name?: string }) => {
    const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: WHITE, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
    switch (name) {
      case "instagram": return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill={WHITE} stroke="none"/></svg>);
      case "facebook":  return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
      case "youtube":   return (<svg {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16" fill={WHITE} stroke="none"/></svg>);
      default:          return (<span style={{ fontSize: 12, color: WHITE }}>{name}</span>);
    }
  };

  const styles = `
    .arch01-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      background: transparent;
      height: 72px;
      display: flex;
      align-items: center;
    }
    .arch01-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 48px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .arch01-logo { display: flex; align-items: center; text-decoration: none; }
    .arch01-right {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .arch01-burger {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px 4px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      align-items: center;
    }
    .arch01-burger-line {
      display: block;
      width: 24px;
      height: 1.5px;
      background: ${WHITE};
    }
    .arch01-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: ${BLACK};
      display: flex;
      flex-direction: column;
      transform: translateY(-100%);
      transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .arch01-overlay.open { transform: translateY(0); }
    .arch01-ov-head {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }
    .arch01-ov-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: ${WHITE};
      display: flex;
    }
    .arch01-ov-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 48px;
      gap: 4px;
      overflow-y: auto;
    }
    .arch01-ov-body a {
      color: ${WHITE};
      text-decoration: none;
      font-family: ${FONT};
      font-size: clamp(24px, 3.5vw, 44px);
      font-weight: 300;
      letter-spacing: 0.03em;
      opacity: 0.88;
      padding: 10px 0;
      transition: opacity 0.15s;
      display: block;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .arch01-ov-body a:last-child { border-bottom: none; }
    .arch01-ov-body a:hover { opacity: 0.4; }
    .arch01-ov-foot {
      padding: 20px 48px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .arch01-ov-phone {
      color: rgba(255,255,255,0.55);
      font-family: ${FONT};
      font-size: 13px;
      letter-spacing: 0.06em;
      text-decoration: none;
    }
    .arch01-ov-phone:hover { color: ${WHITE}; }
    .arch01-ov-socials {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .arch01-ov-socials a {
      opacity: 0.6;
      transition: opacity 0.15s;
      display: flex;
    }
    .arch01-ov-socials a:hover { opacity: 1; }
    @media (max-width: 900px) {
      .arch01-inner { padding: 0 20px; }
      .arch01-desktop-links { display: none; }
      .arch01-ov-head { padding: 0 20px; }
      .arch01-ov-body { padding: 0 20px; }
      .arch01-ov-foot { padding: 16px 20px; flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <nav className="arch01-nav" data-template="arch-01-navbar" aria-label="Hlavní navigace">
        <div className="arch01-inner">
          <a href={resolve("/")} className="arch01-logo" aria-label={siteName}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <LogoMark />
            </GenericEditableImage>
          </a>

          <div className="arch01-right">
            <button className="arch01-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
              <span className="arch01-burger-line" />
              <span className="arch01-burger-line" />
              <span className="arch01-burger-line" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`arch01-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="arch01-ov-head">
          <LogoMark />
          <button className="arch01-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={WHITE} strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="22" y2="22"/><line x1="22" y1="6" x2="6" y2="22"/>
            </svg>
          </button>
        </div>

        <div className="arch01-ov-body">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>

        <div className="arch01-ov-foot">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="arch01-ov-phone">
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
          {socials.length > 0 && (
            <div className="arch01-ov-socials">
              {socials.map((s, i) => (
                <a key={i} href={s.href ?? "#"} target="_blank" rel="noopener noreferrer" aria-label={s.icon ?? "social"}>
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── ucetni-04-navbar ──────────────────────────────────────────────────────────
// 1:1 bcas.cz (Broker Consulting):
// - sticky bílý (#ffffff) header s border-bottom #e8e8e8
// - vlevo: čistý textový wordmark "Finanční Konzultace" bez ikony (#003366 bold)
// - střed/vpravo: horizontální nav linky (#333, hover #003366 underline #d4a96e)
// - úplně vpravo: "Přihlásit se" outline button (#003366)
// - 8 položek: Úvod / Služby / Konzultanti / O společnosti / Franšízing / Kariéra / Pro média / Kontakty
// - mobile hamburger → fullscreen navy (#003366) overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarUcetni04(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAVY  = "#003366";
  const GOLD  = "#d4a96e";
  const WHITE = "#ffffff";
  const TEXT  = "#333333";
  const BORDER = "#e8e8e8";
  const FONT  = "Arial, 'Helvetica Neue', sans-serif";

  const siteName = String(content.siteName ?? "Finanční Konzultace");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Přihlásit se");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const styles = `
    .ucn04-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: ${WHITE};
      border-bottom: 1px solid ${BORDER};
      font-family: ${FONT};
      transition: box-shadow 0.2s;
    }
    .ucn04-header.scrolled {
      box-shadow: 0 2px 8px rgba(0,51,102,0.10);
    }
    .ucn04-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 76px;
      display: flex;
      align-items: center;
      gap: 0;
    }
    /* Logo */
    .ucn04-logo {
      text-decoration: none;
      flex-shrink: 0;
      margin-right: 32px;
    }
    .ucn04-logo-text {
      font-size: 19px;
      font-weight: 700;
      color: ${NAVY};
      letter-spacing: -0.3px;
      line-height: 1;
      white-space: nowrap;
    }
    /* Nav */
    .ucn04-nav {
      display: flex;
      align-items: stretch;
      justify-content: center;
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      height: 100%;
    }
    .ucn04-nav li {
      display: flex;
      align-items: stretch;
    }
    .ucn04-nav a {
      display: flex;
      align-items: center;
      padding: 0 13px;
      font-size: 14px;
      font-weight: 400;
      color: ${TEXT};
      text-decoration: none;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: color 0.15s, border-color 0.15s;
    }
    .ucn04-nav a:hover,
    .ucn04-nav a.active {
      color: ${NAVY};
      border-bottom-color: ${GOLD};
    }
    /* Login button */
    .ucn04-login {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: transparent;
      border: 1px solid ${NAVY};
      border-radius: 3px;
      color: ${NAVY};
      font-size: 14px;
      font-weight: 600;
      font-family: ${FONT};
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: 16px;
      transition: background 0.15s, color 0.15s;
    }
    .ucn04-login:hover {
      background: ${NAVY};
      color: ${WHITE};
    }
    /* Burger */
    .ucn04-burger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      margin-left: auto;
    }
    /* Mobile overlay */
    .ucn04-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: ${NAVY};
      flex-direction: column;
      padding: 24px 28px;
      overflow-y: auto;
    }
    .ucn04-overlay.open { display: flex; }
    .ucn04-overlay-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }
    .ucn04-overlay-logo {
      font-size: 18px;
      font-weight: 700;
      color: ${WHITE};
      text-decoration: none;
    }
    .ucn04-overlay-links {
      display: flex;
      flex-direction: column;
    }
    .ucn04-overlay-links a {
      font-family: ${FONT};
      font-size: 18px;
      font-weight: 600;
      color: ${WHITE};
      text-decoration: none;
      padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      transition: color 0.15s;
    }
    .ucn04-overlay-links a:hover { color: ${GOLD}; }
    .ucn04-overlay-btn {
      margin-top: 28px;
      display: inline-block;
      padding: 13px 24px;
      border: 2px solid ${WHITE};
      border-radius: 3px;
      color: ${WHITE};
      font-size: 15px;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
    }
    @media (max-width: 1024px) {
      .ucn04-nav { display: none; }
      .ucn04-login { display: none; }
      .ucn04-burger { display: block; }
    }
    @media (max-width: 1024px) {
      .ucn04-logo { margin-right: 0; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <header className={`ucn04-header${scrolled ? " scrolled" : ""}`} data-template="ucetni-04-navbar">
        <div className="ucn04-inner">
          {/* Logo — čistý text, bez ikony */}
          <a href={resolve("/")} className="ucn04-logo" aria-label={siteName}>
            <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} style={{ display: "block" }}>
              <span className="ucn04-logo-text">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
            </GenericEditableImage>
          </a>

          {/* Nav links */}
          <ul className="ucn04-nav">
            {links.map((link, i) => (
              <li key={i}>
                <a href={resolve(link.href)} className={i === 0 ? "active" : ""}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          {/* Přihlásit se */}
          <a href={resolve(ctaHref)} data-btn="primary" className="ucn04-login">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Mobile burger */}
          <button className="ucn04-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="7" x2="23" y2="7"/><line x1="3" y1="13" x2="23" y2="13"/><line x1="3" y1="19" x2="23" y2="19"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`ucn04-overlay${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <div className="ucn04-overlay-head">
          <span className="ucn04-overlay-logo">{siteName}</span>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="20" y2="20"/><line x1="20" y1="6" x2="6" y2="20"/>
            </svg>
          </button>
        </div>
        <div className="ucn04-overlay-links">
          {links.map((link, i) => (
            <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
            </a>
          ))}
        </div>
        <a href={resolve(ctaHref)} data-btn="primary" className="ucn04-overlay-btn" onClick={() => setOpen(false)}>
          {ctaText}
        </a>
      </div>
    </>
  );
}

// ── clean-01-navbar ───────────────────────────────────────────────────────────
// 1:1 cleancat.cz:
// - Sticky dark #0d1a20 header bar
// - Bílý šikmý panel vlevo (::before rotate 45° white square) s logem + tagline
// - Kontakt boxy uprostřed (Email + Tel + Tel)
// - Zelené kulaté/pill buttony vpravo: FB, Search, Language CS, ≡ MENU
// - MENU otevírá slide-in nav drawer zleva (nebo overlay)
// ─────────────────────────────────────────────────────────────────────────────
function NavbarClean01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const GREEN = "#69be28";
  const DARK  = "#0d1a20";
  const WHITE = "#ffffff";
  const FONT  = "Arial, Helvetica, sans-serif";

  const siteName = String(content.siteName ?? "Clean Service");
  const tagline  = String(content.tagline  ?? "Partner pro čistotu");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const email    = String(content.email    ?? "info@demo.cz");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.5 23.339" width="12" height="22" fill={WHITE} aria-hidden="true">
      <path d="m11.681 13.128.648-4.228H8.277V6.163a2.112 2.112 0 0 1 2.381-2.282H12.5V.285A22.469 22.469 0 0 0 9.23 0C5.891 0 3.71 2.023 3.71 5.685V8.9H0v4.224h3.71v10.215h4.567V13.128Z"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20.5 20.505" width="18" height="18" fill={WHITE} aria-hidden="true">
      <path d="m20.26 19.021-5.7-5.755a8.125 8.125 0 1 0-1.233 1.249l5.664 5.718a.877.877 0 0 0 1.239.032.883.883 0 0 0 .03-1.244ZM8.173 14.585a6.416 6.416 0 1 1 4.538-1.878 6.376 6.376 0 0 1-4.538 1.878Z"/>
    </svg>
  );

  const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.799 22.9" width="18" height="18" fill={WHITE} aria-hidden="true">
      <path fillRule="evenodd" d="M11.3 22.9A11.342 11.342 0 0 1 0 11.4 11.255 11.255 0 0 1 11.3 0a11.45 11.45 0 1 1 0 22.9Zm.688-12.19h4.675a23.3 23.3 0 0 0-.63-3.955 18.65 18.65 0 0 1-4.045.568Zm4.675 1.377h-4.677v3.388a18.589 18.589 0 0 1 4.045.568 16.807 16.807 0 0 0 .63-3.956Zm2.75 5.319a10.117 10.117 0 0 0 1.959-5.319h-3.34a18.477 18.477 0 0 1-.665 4.374 12.465 12.465 0 0 1 2.044.945Zm-2.914-1.117a17.318 17.318 0 0 0-3.607-.5v4.574c1.457-.371 2.743-1.914 3.601-4.074Zm-4.984 4.074v-4.574a17.328 17.328 0 0 0-3.607.5c1.382 2.16 2.138 3.703 3.601 4.074Zm-4.95-3.656a14.454 14.454 0 0 0 2.044-.944c.112-1.329-.612-2.8-.665-4.374H1.226A10.1 10.1 0 0 0 3.184 17.4Zm-1.958-6.69h3.337c.053-1.574.777-3.044.665-4.373a14.322 14.322 0 0 0-2.044-.945 10.765 10.765 0 0 0-1.958 5.318Zm2.862-6.381a11.338 11.338 0 0 0 1.571.7C6.093 4 6.636 3.8 7.275 2.113a10.079 10.079 0 0 0-3.187 2.216Zm6.521-2.957C9.146 1.743 8.39 3.286 7 5.447a34.211 34.211 0 0 1 3.607.913Zm0 5.951a21.009 21.009 0 0 1-4.045-.568 23.3 23.3 0 0 0-.63 3.955h4.675Zm-4.675 4.764a16.807 16.807 0 0 0 .63 3.956 20.931 20.931 0 0 1 4.045-.568v-3.388Zm6.052-10.715V6.36a34.273 34.273 0 0 1 3.607-.913c-.857-2.161-2.144-3.704-3.607-4.075Zm3.334.741C15.959 3.8 16.5 4 16.936 5.029a11.285 11.285 0 0 0 1.571-.7 10.063 10.063 0 0 0-3.187-2.216Zm4.091 3.279a12.549 12.549 0 0 1-2.044.945 18.46 18.46 0 0 1 .665 4.373h3.338a10.433 10.433 0 0 0-1.959-5.318Z"/>
    </svg>
  );

  const HambIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 18" width="22" height="14" fill={WHITE} aria-hidden="true">
      <path d="M0 18h27v-3H0Zm0-7.5h27v-3H0ZM0 0v3h27V0Z"/>
    </svg>
  );

  const styles = `
    .c01-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: ${DARK};
      font-family: ${FONT};
    }
    .c01-holder {
      display: flex;
      align-items: stretch;
      position: relative;
      min-height: 5rem;
    }
    /* Logo — čistý text, bez pozadí */
    .c01-logo-wrap {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.7rem 1.8rem 0.7rem 1.2rem;
      text-decoration: none;
      color: ${WHITE};
    }
    .c01-logo-name {
      font-size: 1.35rem;
      font-weight: 700;
      color: ${WHITE};
      letter-spacing: 0.04em;
      line-height: 1.2;
    }
    .c01-logo-text {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 300;
      color: rgba(255,255,255,0.55);
      margin-top: 0.2rem;
      letter-spacing: 0.06em;
      line-height: 1.3;
    }
    /* Right frame */
    .c01-frame {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      padding: 0 1.2rem 0 2rem;
      gap: 1.2rem;
    }
    /* Contact boxes */
    .c01-boxes {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 0.15rem;
      margin-right: 0.8rem;
    }
    @media (min-width: 48rem) {
      .c01-boxes { display: flex; }
    }
    @media (min-width: 90rem) {
      .c01-boxes { flex-direction: row; gap: 2rem; align-items: center; }
    }
    .c01-box {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .c01-box-label {
      font-weight: 700;
      color: ${WHITE};
    }
    .c01-box a {
      color: ${WHITE};
      text-decoration: none;
      transition: color 0.15s;
    }
    .c01-box a:hover { color: ${GREEN}; }
    .c01-box--secondary { font-weight: 400; }
    /* Buttons */
    .c01-buttons {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .c01-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${GREEN};
      color: ${WHITE};
      border: none;
      cursor: pointer;
      font-family: ${FONT};
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      text-decoration: none;
      transition: opacity 0.15s;
      padding: 0;
    }
    .c01-btn:hover { opacity: 0.82; }
    .c01-btn-icon {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
    }
    @media (min-width: 48rem) {
      .c01-btn-icon { width: 2.38rem; height: 2.38rem; }
    }
    .c01-btn-pill {
      height: 2.75rem;
      border-radius: calc(2.75rem / 2);
      padding: 0 0.9rem;
      gap: 0.4rem;
      white-space: nowrap;
    }
    @media (min-width: 48rem) {
      .c01-btn-pill { height: 2.38rem; border-radius: calc(2.38rem / 2); }
    }
    /* Overlay nav */
    .c01-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: ${DARK};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .c01-overlay.c01-open { opacity: 1; pointer-events: auto; }
    .c01-overlay a {
      color: ${WHITE};
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 600;
      font-family: ${FONT};
      transition: color 0.15s;
    }
    .c01-overlay a:hover { color: ${GREEN}; }
    .c01-ov-close {
      position: absolute;
      top: 1rem;
      right: 1.5rem;
      background: none;
      border: none;
      cursor: pointer;
      color: ${WHITE};
      font-size: 2rem;
      line-height: 1;
      padding: 4px;
      font-family: ${FONT};
      transition: color 0.15s;
    }
    .c01-ov-close:hover { color: ${GREEN}; }
    .c01-ov-contact {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      margin-top: 1rem;
      padding-top: 1.2rem;
      border-top: 1px solid rgba(255,255,255,0.15);
      width: 80%;
    }
    .c01-ov-contact a {
      font-size: 0.95rem !important;
      font-weight: 400 !important;
      color: rgba(255,255,255,0.6) !important;
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <header className="c01-header" data-template="clean-01-navbar">
        <div className="c01-holder">
          {/* Logo — čistý text */}
          <a href={resolve("/")} className="c01-logo-wrap" aria-label={siteName}>
            <span className="c01-logo-name">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            <p className="c01-logo-text">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
          </a>

          {/* Frame — contacts + buttons */}
          <div className="c01-frame">
            {/* Contact boxes */}
            <div className="c01-boxes">
              <div className="c01-box">
                <span className="c01-box-label">Email:</span>
                <a href={`mailto:${email}`}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
              <div className="c01-box">
                <span className="c01-box-label">Tel:</span>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="c01-buttons">
              {/* Facebook */}
              <a href="https://facebook.com/demo" className="c01-btn c01-btn-icon" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </a>
              {/* Search */}
              <button className="c01-btn c01-btn-icon" aria-label="Hledat" onClick={() => {}}>
                <SearchIcon />
              </button>
              {/* Language */}
              <button className="c01-btn c01-btn-pill" aria-label="Jazyk">
                <GlobeIcon />
                <span>cs</span>
                <svg width="8" height="6" viewBox="0 0 10 8" fill={WHITE} aria-hidden="true"><path d="M5 8 0 0h10Z"/></svg>
              </button>
              {/* MENU hamburger */}
              <button className="c01-btn c01-btn-pill" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
                <HambIcon />
                <span>Menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Nav overlay */}
      <div className={`c01-overlay${open ? " c01-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigační menu">
        <button className="c01-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        <a href={resolve("/")} style={{ marginBottom: 8, fontSize: "1.5rem", fontWeight: 700, color: "#ffffff", textDecoration: "none" }} onClick={() => setOpen(false)}>
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
        </a>
        {links.map((l, i) => (
          <a key={`mob-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}>
            <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
          </a>
        ))}
        <div className="c01-ov-contact">
          <a href={`mailto:${email}`}>
            <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
          </a>
          <a href={`tel:${phone.replace(/\s/g, "")}`}>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── klima-01-navbar ───────────────────────────────────────────────────────────
// 1:1 pragoclima.cz:
// - Fixed TRANSPARENT navbar (overlay přes hero), na scrollu → bílý bg
// - Logo vlevo: červený oval pill (#e30016) s bílým wordmarkem + ®
// - Separator: bílá poloprůhledná čára dole (transparent stav), šedá (scrolled)
// - Desktop nav linky bílé (přes hero), na scrollu → tmavé, hover červená
// - BEZ hamburger menu a mobile overlay
// - Font: Outfit
// ─────────────────────────────────────────────────────────────────────────────
function NavbarKlima01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const RED    = "#e30016";
  const DARK   = "#3d3d3d";
  const WHITE  = "#ffffff";
  const NAVY   = "#182545";
  const FONT   = "'Outfit', -apple-system, sans-serif";

  const siteName = String(content.siteName ?? "Klima Servis");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const linkColor = scrolled ? DARK  : WHITE;
  const navBg     = scrolled ? WHITE : "rgba(0,0,0,0.28)";
  const separator = scrolled ? "1px solid #e8e8e8" : "1px solid rgba(255,255,255,0.15)";
  const navShadow = scrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none";

  const LogoOval = () => (
    <div style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      backgroundColor: RED, color: WHITE,
      borderRadius: 23, padding: "0 22px", height: 46, minWidth: 120,
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
        <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
      </span>
    </div>
  );

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .klima-nav-links { display: none !important; }
          .klima-hamburger { display: flex !important; }
          .klima-mobile-menu { display: flex !important; }
        }
      `}</style>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          fontFamily: FONT,
          backgroundColor: menuOpen ? WHITE : navBg,
          borderBottom: menuOpen ? "1px solid #e8e8e8" : separator,
          boxShadow: menuOpen ? "0 2px 12px rgba(0,0,0,0.08)" : navShadow,
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          minHeight: 74,
        }}
        data-template="klima-01"
      >
        <div style={{
          maxWidth: 1440, margin: "0 auto", padding: "0 30px",
          height: 74, display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", flexShrink: 0 }} aria-label={siteName}>
            <LogoOval />
          </a>

          {/* Desktop nav linky */}
          <nav className="klima-nav-links" style={{ display: "flex", alignItems: "center" }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                style={{
                  color: linkColor, textDecoration: "none",
                  fontSize: 16, fontWeight: 400,
                  padding: "0 20px", height: 74,
                  display: "flex", alignItems: "center",
                  lineHeight: 1,
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = RED)}
                onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Hamburger */}
          <button
            className="klima-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            style={{
              display: "none", flexDirection: "column", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              padding: 8, zIndex: 10,
            }}
          >
            {[0, 1, 2].map(n => (
              <span key={n} style={{
                display: "block", width: 24, height: 2,
                backgroundColor: menuOpen ? DARK : WHITE,
                borderRadius: 2,
                transition: "transform 0.2s, opacity 0.2s",
                transform: menuOpen
                  ? n === 0 ? "translateY(7px) rotate(45deg)"
                  : n === 2 ? "translateY(-7px) rotate(-45deg)"
                  : "scaleX(0)"
                  : "none",
                opacity: (menuOpen && n === 1) ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="klima-mobile-menu"
            style={{
              display: "none", flexDirection: "column",
              backgroundColor: WHITE,
              borderTop: "1px solid #e8e8e8",
              padding: "8px 0 16px",
            }}
          >
            {links.map((l, i) => (
              <a
                key={i}
                href={resolve(l.href)}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: DARK, textDecoration: "none",
                  fontSize: 16, fontWeight: 400,
                  padding: "12px 30px",
                  display: "block",
                  borderBottom: i < links.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = RED)}
                onMouseLeave={e => (e.currentTarget.style.color = DARK)}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

// ── instala-02-navbar ─────────────────────────────────────────────────────────
// 1:1 vestop.cz:
// - bílý topbar 44px (border-bottom) s tel vlevo
// - sticky bílý navbar 72px: SVG logo vlevo, nav linky, červené CTA
// - červená #ee4036, Montserrat font
// ─────────────────────────────────────────────────────────────────────────────
function NavbarInstala02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const RED   = "#ee4036";
  const DARK  = "#111111";
  const WHITE = "#ffffff";
  const FONT  = "'Montserrat', sans-serif";

  const siteName = String(content.siteName ?? "Demo Vestop");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String(content.phone    ?? "704 123 456");
  const ctaText  = String(content.ctaText  ?? "Kontakt a poptávka");
  const ctaHref  = String(content.ctaHref  ?? "/kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.25 19.79 19.79 0 0 1 1.17 3.63 2 2 0 0 1 3.15 1.45h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
    </svg>
  );
  const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const LogoMark = () => {
    if (logoUrl) {
      return <img loading="eager" src={logoUrl} alt={siteName} style={{ height: 40, width: "auto", objectFit: "contain" }} />;
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" fill="none" style={{ width: 200, height: 40 }} aria-label={siteName}>
        <rect x="0" y="0" width="40" height="40" rx="4" fill={RED}/>
        <path d="M26 10a6 6 0 0 0-5.83 7.41L10 27.59 12.41 30l10.18-10.17A6 6 0 1 0 26 10zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill={WHITE}/>
        <rect x="46" y="8" width="1.5" height="24" rx="0.75" fill="#e0e0e0"/>
        <text fontFamily="'Montserrat',Arial,sans-serif" fontWeight="800" fontSize="15" fill={DARK} letterSpacing="0.5">
          <tspan x="54" y="18">DEMO</tspan>
        </text>
        <text fontFamily="'Montserrat',Arial,sans-serif" fontWeight="700" fontSize="12" fill={RED} letterSpacing="2">
          <tspan x="54" y="34">VESTOP</tspan>
        </text>
      </svg>
    );
  };

  return (
    <>
      {/* ── Sticky Navbar ── */}
      <div
        style={{
          position: "sticky", top: 0, left: 0, right: 0, zIndex: 100,
          fontFamily: FONT, backgroundColor: WHITE,
          boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.10)" : "0 1px 0 #e0e0e0",
          transition: "box-shadow 0.25s ease",
        }}
        data-template="instala-02-navbar"
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <a href={resolve("/")} aria-label={siteName} style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
            <LogoMark />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 0 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                style={{ fontSize: "15px", fontWeight: 500, color: DARK, textDecoration: "none", padding: "8px 18px", borderRadius: 4, transition: "color 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.color = RED; }}
                onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            className="hidden lg:inline-flex"
            style={{ alignItems: "center", backgroundColor: RED, color: WHITE, fontFamily: FONT, fontSize: "14px", fontWeight: 600, padding: "10px 22px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.3px", whiteSpace: "nowrap", transition: "background-color 0.18s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#c42d2d"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = RED; }}
          >
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            aria-label="Otevřít menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: WHITE, display: "flex", flexDirection: "column", fontFamily: FONT }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #e0e0e0" }}>
            <a href={resolve("/")} onClick={() => setOpen(false)} aria-label={siteName}>
              <LogoMark />
            </a>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
              <XIcon />
            </button>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px", gap: 0 }}>
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}
                style={{ fontSize: "18px", fontWeight: 600, color: DARK, textDecoration: "none", padding: "16px 0", borderBottom: "1px solid #f0f0f0", transition: "color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color = RED; }}
                onMouseLeave={e => { e.currentTarget.style.color = DARK; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
              style={{ marginTop: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: RED, color: WHITE, fontSize: "15px", fontWeight: 700, padding: "14px 28px", borderRadius: 4, textDecoration: "none" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </nav>
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 6, color: DARK, fontSize: "14px" }}>
            <span style={{ color: RED }}><PhoneIcon /></span>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`} style={{ color: DARK, textDecoration: "none" }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}


// ── solar-02-navbar ───────────────────────────────────────────────────────────
// solar-02 Demo Greensie / GREENIA:
// - announcement bar: zelený #79c44f, padding 10px 0, font 14px, SVG 18px check
// - overlay navbar: position absolute (transparent), fixed on scroll → rgba(10,37,53,0.88)
// - výška: 110px desktop, 90px mobile
// - border-bottom: 1px solid rgba(255,255,255,0.15)
// - logo: SVG leaf + wordmark "GREENIA" uppercase bílý
// - nav linky: bílé 15px (hover zelená #79c44f)
// - CTA: zelený #79c44f filled pill 110px výška button "Nezávazná poptávka"
// - mobile hamburger → fullscreen tmavý #0a2535 overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarSolar02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const GREEN     = "#79c44f";
  const DARK_NAV  = "rgba(10,37,53,0.88)";
  const DARK_MOB  = "#0a2535";
  const WHITE     = "#ffffff";
  const FONT      = "'DM Sans', -apple-system, sans-serif";

  const siteMode         = String(content.siteMode ?? "multipage");
  const siteName         = String(content.siteName ?? "GREENIA");
  const announcementText = String(content.announcementText ?? "Máme 98% úspěšnost při vyřizování firemních dotací z NRB. Vaše žádost je u nás v dobrých rukou.");
  const links            = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText          = String(content.ctaText ?? "Nezávazná poptávka");
  const ctaHref          = String(content.ctaHref ?? "/kontakt");
  const phone            = String(content.phone ?? "704 123 456");
  const resolve          = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  const MenuIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const XIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  /* SVG leaf logo */
  const LeafIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M16 3C9.5 3 5.5 9 5.5 16.5c0 4.5 2.8 7.5 6.5 8.7V21c0-4 2.5-7 6.5-8.5C17.5 16 18 19.5 20 22h1.5c3-1.8 4-5 4-8 0-6.5-4-11-9.5-11z" fill={WHITE}/>
      <line x1="16" y1="15" x2="16" y2="28" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  const LogoMark = () => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
      <LeafIcon />
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 18, letterSpacing: "0.08em", color: WHITE, lineHeight: 1, textTransform: "uppercase" }}>
        <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
      </span>
    </span>
  );

  return (
    <>
      {/* Safari macOS adaptive toolbar: čte html background + color-scheme */}
      <style dangerouslySetInnerHTML={{ __html: "html{background:#0b0f14;color-scheme:dark}" }} />

      {/* Fixed wrapper — takes zero flow space, overlays hero */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, fontFamily: FONT }}>

        {/* Announcement bar — refined: subtle gradient + letter-spacing + soft check */}
        <div
          className="s2-announce"
          style={{
            background: `linear-gradient(90deg, #6bb444 0%, ${GREEN} 45%, #8dd166 100%)`,
            color: WHITE,
            fontSize: 13.5,
            fontWeight: 500,
            letterSpacing: "0.01em",
            textAlign: "center",
            padding: "9px 20px",
            lineHeight: 1.45,
            borderBottom: "1px solid rgba(255,255,255,0.14)",
          }}
          data-template="solar-02"
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 9999, background: "rgba(255,255,255,0.16)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)" }}>
              <CheckIcon />
            </span>
            <GenericEditableText sectionId={sectionId} field="announcementText" value={announcementText} tag="span" />
          </span>
        </div>

        {/* Header row: transparent initially, dark on scroll */}
        <header
          style={{
            height: 110,
            backgroundColor: scrolled ? DARK_NAV : "transparent",
            backdropFilter: scrolled ? "blur(8px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            boxShadow: scrolled ? "0 0 10px rgba(0,0,0,0.3)" : "none",
            transition: "background-color 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            alignItems: "center",
          }}
          data-template="solar-02"
        >
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)",
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", flexShrink: 0 }} aria-label={siteName}>
            <LogoMark />
          </a>

          {/* Desktop nav — refined underline slide-in on hover */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 30 }}>
            {links.map((l, i) => (
              <a
                key={`${l.href}-${i}`}
                href={resolve(l.href)}
                className="s2-navlink"
                style={{ color: WHITE, textDecoration: "none", fontSize: 14.5, fontWeight: 500, letterSpacing: "0.005em", position: "relative", padding: "6px 0", transition: "color 0.25s cubic-bezier(.4,.14,.3,1)" }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="hidden lg:inline-flex s2-cta"
              style={{
                padding: "13px 24px 13px 26px",
                background: `linear-gradient(135deg, ${GREEN} 0%, #6bb444 100%)`,
                color: WHITE,
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 14.5,
                letterSpacing: "0.01em",
                textDecoration: "none",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(121,196,79,0.28), inset 0 0 0 1px rgba(255,255,255,0.12)",
                transition: "background 0.28s cubic-bezier(.4,.14,.3,1), transform 0.28s cubic-bezier(.4,.14,.3,1), box-shadow 0.28s cubic-bezier(.4,.14,.3,1)",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg className="s2-cta-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transition: "transform 0.28s cubic-bezier(.4,.14,.3,1)" }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <button
              className="flex lg:hidden"
              onClick={() => setOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            >
              {open ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        </header>
      </div>{/* /fixed wrapper */}

      {/* Mobile fullscreen overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, backgroundColor: DARK_MOB, display: "flex", flexDirection: "column", fontFamily: FONT }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 90, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <a href={resolve("/")} onClick={() => setOpen(false)} aria-label={siteName}>
              <LogoMark />
            </a>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
              <XIcon />
            </button>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px", gap: 0 }}>
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}
                style={{ fontSize: "17px", fontWeight: 600, color: "rgba(255,255,255,0.85)", textDecoration: "none", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", transition: "color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color = GREEN; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              >
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
            <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}
              style={{ marginTop: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: GREEN, color: WHITE, fontSize: "15px", fontWeight: 700, padding: "14px 28px", borderRadius: 9999, textDecoration: "none" }}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </nav>
          <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href={`tel:+420${phone.replace(/\s/g, "")}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}

// ── solar-03-navbar ───────────────────────────────────────────────────────────
// 1:1 ac-heating.cz — 3-řadý header:
// Row 1: announcement bar — gradient #ff8b00→#833500→#833500→#ff8b00, bílý text, close X
// Row 2: utility nav (bílá, ~44px) — Reference / Regulace xCC / Blog / Produkty / FAQ / O nás / Kontakt
// Row 3: hlavní nav (bílá, Montserrat bold, ~54px) — AC HEATING logo + tagline / nav links / CTA pill
// ─────────────────────────────────────────────────────────────────────────────
function NavbarSolar03(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen]         = useState(false);
  const [barVisible, setBarVisible] = useState(true);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const ORANGE      = "#ff8b00";
  const ORANGE_LT   = "#ffa733";
  const ORANGE_DK   = "#e07a00";
  const BROWN       = "#833500";
  const DARK        = "#222222";
  const WHITE       = "#ffffff";
  const MUTED       = "#575757";
  const FONT_U      = "'Inter', -apple-system, sans-serif";
  const FONT_M      = "'Inter', -apple-system, sans-serif";

  const siteMode = String(content.siteMode ?? "multipage");
  const siteName         = String(content.siteName ?? "Demo SolarPro");
  const tagline          = String(content.tagline ?? "Tepelná čerpadla & fotovoltaika");
  const announcementText = String(content.announcementText ?? "SPECIÁLNÍ NABÍDKA PRO PRŮMYSLOVÉ OBJEKTY 2026 —");
  const announcementLink = String(content.announcementLink ?? "ZAŽÁDAT O KONZULTACI");
  const announcementHref = String(content.announcementHref ?? "/kontakt");
  const utilLinks  = (content.links     as Array<{ label: string; href: string }>) ?? [];
  const mainLinks  = (content.navLinks  as Array<{ label: string; href: string }>) ?? [];
  const ctaText    = String(content.ctaText ?? "Bezplatná konzultace");
  const ctaHref    = String(content.ctaHref ?? "/kontakt");
  const resolve    = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const MenuIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
  const XIcon = ({ color = DARK }: { color?: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  // Solar/heat mark — sun rays + rising thermal wave inside rounded square
  const LogoIcon = () => (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 38, height: 38, borderRadius: 8,
        background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_LT} 100%)`,
        boxShadow: "0 4px 14px -4px rgba(255,139,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
        flexShrink: 0,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="3" />
        <line x1="12" y1="2.5" x2="12" y2="4" />
        <line x1="4.9" y1="4.9" x2="6"    y2="6" />
        <line x1="19.1" y1="4.9" x2="18"  y2="6" />
        <line x1="2.5" y1="9"   x2="4"    y2="9" />
        <line x1="20"  y1="9"   x2="21.5" y2="9" />
        <path d="M3 17c1.8-1.6 3.6-1.6 5.4 0s3.6 1.6 5.4 0 3.6-1.6 5.4 0" />
        <path d="M3 21c1.8-1.6 3.6-1.6 5.4 0s3.6 1.6 5.4 0 3.6-1.6 5.4 0" opacity="0.55" />
      </svg>
    </span>
  );

  const LogoMark = ({ dark = true }: { dark?: boolean }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <LogoIcon />
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{
          fontFamily: FONT_M, fontWeight: 800, fontSize: 20,
          letterSpacing: "-0.02em", color: dark ? DARK : WHITE,
          whiteSpace: "nowrap",
        }}>
          <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
        </span>
        <span style={{
          fontFamily: FONT_U, fontWeight: 500, fontSize: 10,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: ORANGE, marginTop: 4, whiteSpace: "nowrap",
        }}>
          <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
        </span>
      </span>
    </span>
  );

  /* sticky rows jsou v normal flow — spacer = 0 */
  const spacerH = 0;

  return (
    <>
      {/* ── Row 1: Announcement bar — gradient + bolt icon ─────────────── */}
      {barVisible && (
        <div
          style={{
            background: `linear-gradient(90deg, ${BROWN} 0%, ${ORANGE_DK} 30%, ${ORANGE} 50%, ${ORANGE_DK} 70%, ${BROWN} 100%)`,
            color: WHITE,
            fontFamily: FONT_U,
            fontSize: 13.5,
            fontWeight: 600,
            textAlign: "center",
            padding: "10px 56px 10px 18px",
            position: "sticky",
            top: 0,
            zIndex: 103,
            lineHeight: 1.4,
            letterSpacing: "0.02em",
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
          data-template="solar-03"
        >
          <span aria-hidden="true" style={{
            display: "inline-flex", verticalAlign: "-3px", marginRight: 8, opacity: 0.95,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={WHITE} stroke="none">
              <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>
            </svg>
          </span>
          <GenericEditableText sectionId={sectionId} field="announcementText" value={announcementText} tag="span" />
          {" "}
          <a
            href={resolve(announcementHref)}
            className="solar03-ann-link"
            style={{ color: WHITE, textDecoration: "none", fontWeight: 800, borderBottom: `1px solid rgba(255,255,255,0.6)`, paddingBottom: 1 }}
          >
            <GenericEditableText sectionId={sectionId} field="announcementLink" value={announcementLink} tag="span" />
            <span aria-hidden="true" style={{ marginLeft: 6, display: "inline-block" }}>→</span>
          </a>
          <button
            onClick={() => setBarVisible(false)}
            aria-label="Zavřít lištu"
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 4, cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
              transition: "background-color .22s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            <XIcon color={WHITE} />
          </button>
        </div>
      )}

      {/* ── Row 2: Utility nav ─────────────────────────────────────────── */}
      <div
        className="hidden lg:block"
        style={{
          backgroundColor: "#fafbfc",
          borderBottom: "1px solid #ebebeb",
          position: "sticky", top: barVisible ? 46 : 0, zIndex: 102,
        }}
        data-template="solar-03"
      >
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)", height: 44, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 26 }}>
          {utilLinks.map((l, i) => (
            <a
              key={i}
              href={resolve(l.href)}
              className="solar03-util-link"
              style={{
                color: MUTED, textDecoration: "none", fontSize: 13.5, fontWeight: 500,
                fontFamily: FONT_U, letterSpacing: "0.01em",
                transition: "color .22s ease",
                whiteSpace: "nowrap", position: "relative", padding: "4px 0",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = ORANGE)}
              onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
            >
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Row 3: Main nav — solar grid pattern + underline hover ─────── */}
      <header
        style={{
          backgroundColor: WHITE,
          position: "sticky", top: barVisible ? 90 : 44, zIndex: 101,
          boxShadow: "0 1px 0 #ebebeb, 0 6px 20px -12px rgba(34,34,34,0.14)",
          backgroundImage:
            "linear-gradient(#fff,#fff), " +
            "linear-gradient(to right, rgba(34,34,34,0.045) 1px, transparent 1px), " +
            "linear-gradient(to bottom, rgba(34,34,34,0.035) 1px, transparent 1px)",
          backgroundSize: "auto, 32px 32px, 32px 32px",
          backgroundBlendMode: "normal, multiply, multiply",
        }}
        data-template="solar-03"
      >
        {/* Orange hairline bottom accent */}
        <div aria-hidden="true" style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${ORANGE} 20%, ${ORANGE} 80%, transparent 100%)`,
          opacity: 0.9,
        }} />
        <div style={{
          maxWidth: 1440, margin: "0 auto", padding: "0 clamp(16px,3vw,40px)",
          height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
          position: "relative",
        }}>
          {/* Logo */}
          <a href={resolve("/")} style={{ textDecoration: "none", flexShrink: 0 }} aria-label={siteName}>
            <LogoMark />
          </a>

          {/* Desktop main nav */}
          <nav className="hidden lg:flex" style={{ alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
            {mainLinks.map((l, i) => (
              <a
                key={i}
                href={resolve(l.href)}
                className="solar03-main-link"
                style={{
                  color: DARK, textDecoration: "none", fontSize: 14, fontWeight: 600,
                  fontFamily: FONT_M, textTransform: "uppercase", letterSpacing: "0.08em",
                  transition: "color .22s ease",
                  whiteSpace: "nowrap", position: "relative", padding: "10px 14px",
                }}
              >
                <GenericEditableText sectionId={sectionId} field={`navLinks.${i}.label`} value={l.label} tag="span" />
              </a>
            ))}
          </nav>

          {/* CTA + phone + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="hidden lg:inline-flex solar03-cta"
              style={{
                alignItems: "center", gap: 8,
                padding: "12px 22px",
                background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_LT} 100%)`,
                color: WHITE,
                borderRadius: 6, fontWeight: 700, fontSize: 13.5,
                fontFamily: FONT_M, textTransform: "uppercase", letterSpacing: "0.06em",
                textDecoration: "none",
                boxShadow: "0 6px 18px -6px rgba(255,139,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)",
                transition: "transform .22s ease, box-shadow .22s ease, background .22s ease",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span aria-hidden="true" style={{ display: "inline-flex" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </a>
            <button
              className="flex lg:hidden"
              onClick={() => setOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            >
              {open ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay ─────────────────────────────────────────────── */}
      <div
        className="lg:hidden"
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: WHITE,
          display: "flex", flexDirection: "column",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #ebebeb" }}>
          <a href={resolve("/")} style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
            <LogoMark />
          </a>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Zavřít menu">
            <XIcon />
          </button>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
          {[...utilLinks, ...mainLinks].map((l, i) => (
            <a
              key={i}
              href={resolve(l.href)}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "14px 0", borderBottom: "1px solid #f0f0f0", color: DARK, textDecoration: "none", fontSize: 16, fontWeight: 600, fontFamily: FONT_U }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #ebebeb" }}>
          <a
            href={resolve(ctaHref)}
            data-btn="primary"
            onClick={() => setOpen(false)}
            style={{
              display: "block", textAlign: "center", padding: "14px",
              background: `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_LT} 100%)`,
              color: WHITE, borderRadius: 6, fontWeight: 700, fontSize: 14,
              textDecoration: "none", fontFamily: FONT_M,
              textTransform: "uppercase", letterSpacing: "0.06em",
              boxShadow: "0 6px 18px -6px rgba(255,139,0,0.55)",
            }}
          >
            {ctaText}
          </a>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ height: spacerH }} aria-hidden="true" />
    </>
  );
}

// ── floors-01-navbar ──────────────────────────────────────────────────────────
// 1:1 supellex.cz (viz screenshot):
// - Row 1 (~80px, tmavě zelená bg): Logo bílé vlevo | Search bar střed | Podpora:tel + Můj účet + Košík vpravo
// - Row 2 (~50px, bílá): ALL CAPS nav linky s ▼ šipkami pro kategorie
// - Mobile: hamburger → fullscreen overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarFloors01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  // Supellex color palette
  const GREEN      = "#007d47";
  const GREEN_DARK = "#005f35";   // darker tile for Můj účet / Košík blocks
  const WHITE      = "#ffffff";
  const DARK       = "#1a1a1a";
  const MUTED      = "#6c757d";
  const BORDER     = "#dee2e6";
  const NAVBG      = "#f9f9f9";   // very light nav row bg
  const FONT       = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  const siteName          = String(content.siteName          ?? "Demo Podlahy");
  const logoUrl           = String(content.logoUrl           ?? "");
  const phone             = String(content.phone             ?? "+420 704 123 456");
  const email             = String(content.email             ?? "info@demo.cz");
  const searchPlaceholder = String(content.searchPlaceholder ?? "Vyhledejte podlahu...");
  const links      = (content.links      as Array<{ label: string; href: string }>) ?? [];
  const categories = (content.categories as Array<{ label: string; items: Array<{ label: string; href: string; image?: string }> }>) ?? [];

  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  // Parquet floor planks icon — white on transparent (used inside green header)
  const LogoSVG = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* hexagon-ish shape with floor planks */}
      <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" fill="rgba(255,255,255,0.15)" />
      <rect x="9"  y="12" width="10" height="4" rx="1" fill={WHITE} opacity="0.9" />
      <rect x="21" y="12" width="10" height="4" rx="1" fill={WHITE} opacity="0.9" />
      <rect x="9"  y="18" width="6"  height="4" rx="1" fill={WHITE} opacity="0.9" />
      <rect x="17" y="18" width="14" height="4" rx="1" fill={WHITE} opacity="0.9" />
      <rect x="9"  y="24" width="14" height="4" rx="1" fill={WHITE} opacity="0.9" />
      <rect x="25" y="24" width="6"  height="4" rx="1" fill={WHITE} opacity="0.9" />
    </svg>
  );

  const CartIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const SearchIcon = ({ color = WHITE }: { color?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );

  const ChevronDown = ({ color = DARK }: { color?: string }) => (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 4l4 4 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const BurgerIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );

  const CloseIcon = ({ color = DARK }: { color?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <div data-template="floors-01">
      <style>{`[data-floors01-search]::placeholder { color: rgba(255,255,255,0.75); }`}</style>
      <header style={{ position: "sticky", top: 0, zIndex: 100, fontFamily: FONT }}>

        {/* ══ Row 1: Green header bar — Logo | Search | Podpora + Můj účet + Košík ══ */}
        <div style={{ background: GREEN }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            display: "flex", alignItems: "stretch",
            height: 80,
          }}>
            {/* Logo */}
            <a
              href={homeHref}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 24px 0 20px",
                textDecoration: "none", flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName} className="h-10 w-auto object-contain">
                  <OptimizedPicture src={logoUrl} alt={siteName} imgStyle={{ height: 40, width: "auto", objectFit: "contain" }} />
                </GenericEditableImage>
              ) : <LogoSVG />}
              <GenericEditableText sectionId={sectionId} field="siteName" tag="span" value={siteName} style={{
                fontSize: 21, fontWeight: 800, color: WHITE,
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                {siteName}
              </GenericEditableText>
            </a>

            {/* Search bar — desktop, fills available space */}
            <form
              className="hidden md:flex"
              style={{ flex: 1, alignItems: "center", padding: "0 24px" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: 620 }}>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  data-floors01-search=""
                  style={{
                    width: "100%", height: 48,
                    border: "1.5px solid rgba(255,255,255,0.8)", borderRadius: 6,
                    paddingLeft: 18, paddingRight: 52,
                    fontSize: 14, color: WHITE, outline: "none",
                    fontFamily: FONT, background: "transparent",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: "absolute", right: 0, top: 0, bottom: 0,
                    width: 50, background: "transparent", border: "none",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Hledat"
                >
                  <SearchIcon color={WHITE} />
                </button>
              </div>
            </form>

            {/* Right: Podpora phone + account tile + cart tile */}
            <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", flexShrink: 0 }} className="hidden md:flex">
              {/* Podpora phone */}
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-end",
                  padding: "0 20px", textDecoration: "none", gap: 2,
                }}
              >
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 400, letterSpacing: "0.01em" }}>Podpora:</span>
                <span style={{ fontSize: 20, color: WHITE, fontWeight: 700, letterSpacing: "0.01em" }}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText></span>
              </a>

              {/* Můj účet tile */}
              <a
                href={homeHref}
                aria-label="Můj účet"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  width: 80, height: "100%",
                  background: GREEN_DARK, textDecoration: "none", gap: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#004a28")}
                onMouseLeave={(e) => (e.currentTarget.style.background = GREEN_DARK)}
              >
                <UserIcon />
                <span style={{ fontSize: 11, color: WHITE, fontWeight: 500 }}>Můj účet</span>
              </a>

              {/* Košík tile */}
              <a
                href={homeHref}
                aria-label="Košík"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  width: 80, height: "100%",
                  background: GREEN_DARK, borderLeft: "1px solid rgba(255,255,255,0.15)",
                  textDecoration: "none", gap: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#004a28")}
                onMouseLeave={(e) => (e.currentTarget.style.background = GREEN_DARK)}
              >
                <CartIcon />
                <span style={{ fontSize: 11, color: WHITE, fontWeight: 500 }}>Košík</span>
              </a>
            </div>

            {/* Mobile: hamburger */}
            <button
              className="md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0 20px", marginLeft: "auto" }}
            >
              {open ? <CloseIcon color={WHITE} /> : <BurgerIcon />}
            </button>
          </div>
        </div>

        {/* ══ Row 2: White nav bar — ALL CAPS links ══ */}
        <nav
          className="hidden md:block"
          style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, boxShadow: "0 2px 4px rgba(0,0,0,0.06)" }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
            <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0 }}>
              {/* Categories with megamenu */}
              {categories.map((cat) => (
                <li
                  key={cat.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() => setMegaOpen(cat.label)}
                  onMouseLeave={() => setMegaOpen(null)}
                >
                  <button
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: "0 14px", height: 50,
                      fontSize: 13, fontWeight: 700, fontFamily: FONT,
                      color: megaOpen === cat.label ? GREEN : DARK,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      display: "flex", alignItems: "center", gap: 5,
                      borderBottom: megaOpen === cat.label ? `3px solid ${GREEN}` : "3px solid transparent",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {cat.label}
                    <ChevronDown color={megaOpen === cat.label ? GREEN : MUTED} />
                  </button>

                  {megaOpen === cat.label && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, zIndex: 300,
                      background: WHITE, border: `1px solid ${BORDER}`,
                      borderTop: `3px solid ${GREEN}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: 20, minWidth: 300,
                    }}>
                      <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 16px", listStyle: "none", margin: 0, padding: 0 }}>
                        {cat.items.map((item) => (
                          <li key={item.label}>
                            <a
                              href={resolve(item.href)}
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", textDecoration: "none", color: DARK, fontSize: 13, borderRadius: 3 }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = GREEN; (e.currentTarget.style.background = "#f4faf7"); }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = DARK; e.currentTarget.style.background = "transparent"; }}
                            >
                              {item.image && <img loading="eager" src={item.image} alt="" width={32} height={32} style={{ objectFit: "cover", borderRadius: 2, flexShrink: 0 }} />}
                              <span>{item.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}

              {/* Regular nav links — ALL CAPS */}
              {links.map((l) => (
                <li key={l.label}>
                  <a
                    href={resolve(l.href)}
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "0 14px", height: 50,
                      fontSize: 13, fontWeight: 700, color: DARK,
                      textDecoration: "none", letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      borderBottom: "3px solid transparent",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = GREEN;
                      e.currentTarget.style.borderBottomColor = GREEN;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = DARK;
                      e.currentTarget.style.borderBottomColor = "transparent";
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* ══ Mobile overlay ══ */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: WHITE, display: "flex", flexDirection: "column",
          padding: "0 24px 32px", overflowY: "auto",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
        className="md:hidden"
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 70, borderBottom: `1px solid ${BORDER}`, flexShrink: 0, background: GREEN, margin: "0 -24px", padding: "0 24px" }}>
          <a href={homeHref} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <LogoSVG />
            <span style={{ fontSize: 18, fontWeight: 800, color: WHITE, textTransform: "uppercase", letterSpacing: "0.04em" }}>{siteName}</span>
          </a>
          <button onClick={() => setOpen(false)} aria-label="Zavřít" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <CloseIcon color={WHITE} />
          </button>
        </div>

        {/* Search */}
        <form style={{ position: "relative", marginTop: 20 }} onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder={searchPlaceholder}
            style={{ width: "100%", height: 46, border: `1px solid ${BORDER}`, borderRadius: 4, paddingLeft: 16, paddingRight: 52, fontSize: 14, fontFamily: FONT, outline: "none" }} />
          <button type="submit" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 48, background: GREEN, border: "none", borderRadius: "0 4px 4px 0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SearchIcon color={WHITE} />
          </button>
        </form>

        {/* Nav links */}
        <nav style={{ marginTop: 20, display: "flex", flexDirection: "column" }}>
          {links.map((l, i) => (
            <a key={`mob-${i}`} href={resolve(l.href)} onClick={() => setOpen(false)}
              style={{ padding: "14px 0", fontSize: 14, fontWeight: 700, color: DARK, textDecoration: "none", borderBottom: `1px solid ${BORDER}`, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Contact */}
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontSize: 16, color: GREEN, fontWeight: 700, textDecoration: "none" }}>
            Podpora: {phone}
          </a>
          <a href={`mailto:${email}`} style={{ fontSize: 14, color: MUTED, textDecoration: "none" }}>{email}</a>
        </div>
      </div>
    </div>
  );
}

// ── malir-01-navbar ───────────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz:
// - Fixed černý (#000000) navbar
// - Logo vlevo: SVG wordmark
// - Nav linky bílé, hover amber (#F5AA23), active amber (#E79B0E)
// - Telefon vpravo s call ikonou, amber barva
// - Mobile: hamburger → fullscreen černý overlay
// - Font: Raleway
// ─────────────────────────────────────────────────────────────────────────────
function NavbarMalir01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const siteName = String(content.siteName ?? "Demo Malování");
  const logoUrl  = String(content.logoUrl ?? "");
  const phone    = String(content.phone ?? "704 123 456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const BLACK  = "#000000";
  const WHITE  = "#ffffff";
  const AMBER  = "#E79B0E";
  const AMBER2 = "#F5AA23";

  const S: Record<string, React.CSSProperties> = {
    nav: {
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: BLACK, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    },
    inner: {
      maxWidth: 1230, margin: "0 auto",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 30px", height: 78,
    },
    logo: {
      display: "flex", alignItems: "center", textDecoration: "none",
    },
    logoImg: { height: 57, width: 146 },
    desktopLinks: {
      display: "flex", gap: 24, listStyle: "none", margin: 0, padding: 0,
    },
    link: {
      color: WHITE, textDecoration: "none",
      fontFamily: "'Raleway', sans-serif", fontWeight: 600, fontSize: 16,
      letterSpacing: "0.04em", transition: "color 0.2s",
    },
    phone: {
      color: AMBER, fontFamily: "'Raleway', sans-serif", fontWeight: 600,
      fontSize: 18, textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
    },
    hamburger: {
      background: "none", border: "none", cursor: "pointer", padding: 4,
      display: "flex", flexDirection: "column", gap: 5,
    },
    bar: { width: 24, height: 2, background: WHITE, display: "block", borderRadius: 2 },
    overlay: {
      position: "fixed", inset: 0, background: BLACK, zIndex: 1001,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 28,
    },
    overlayLink: {
      color: WHITE, textDecoration: "none",
      fontFamily: "'Raleway', sans-serif", fontWeight: 700, fontSize: 22,
    },
    closeBtn: {
      position: "absolute", top: 16, right: 20,
      background: "none", border: "none", color: WHITE, fontSize: 28, cursor: "pointer",
    },
    phoneOverlay: {
      color: AMBER, fontFamily: "'Raleway', sans-serif", fontWeight: 700,
      fontSize: 20, textDecoration: "none", marginTop: 8,
    },
  };

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;900&display=swap" />
      <style>{`        .malir01-link:hover { color: ${AMBER2} !important; }
        .malir01-link.active { color: ${AMBER} !important; }
        .malir01-olink:hover { color: ${AMBER2} !important; }
        @media (max-width: 768px) { .malir01-desktop { display: none !important; } .malir01-hamburger { display: flex !important; } }
        @media (min-width: 769px) { .malir01-hamburger { display: none !important; } }
      `}</style>

      <nav style={S.nav} data-template="malir-01">
        <div style={S.inner}>
          {/* Logo */}
          <a href="/" style={S.logo}>
            {logoUrl
              ? (
                <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="eager" src={logoUrl} alt={siteName} style={S.logoImg} />
                </GenericEditableImage>
              )
              : <span style={{ color: WHITE, fontFamily: "'Raleway', sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: "0.05em" }}>{siteName}</span>
            }
          </a>

          {/* Desktop nav */}
          <ul style={S.desktopLinks} className="malir01-desktop">
            {links.map((l, i) => (
              <li key={i}>
                <a href={l.href} style={S.link} className="malir01-link">
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
                </a>
              </li>
            ))}
          </ul>

          {/* Phone */}
          <a href={`tel:${phone.replace(/\s/g, "")}`} style={S.phone} className="malir01-desktop">
            <PhoneIcon />
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
          </a>

          {/* Hamburger */}
          <button style={S.hamburger} className="malir01-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <span style={S.bar} />
            <span style={S.bar} />
            <span style={S.bar} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div style={S.overlay}>
          <button style={S.closeBtn} onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
          {links.map((l, i) => (
            <a key={i} href={l.href} style={S.overlayLink} className="malir01-olink" onClick={() => setOpen(false)}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
            </a>
          ))}
          <a href={`tel:${phone.replace(/\s/g, "")}`} style={S.phoneOverlay}>
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
          </a>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 78 }} />
    </>
  );
}

// ── garden-01-navbar ──────────────────────────────────────────────────────────
// 1:1 gerberra.cz:
// - Fixed TRANSPARENT navbar přes hero, na scrollu → tmavý #202714
// - Logo vlevo: SVG květ + Cardo uppercase "ZAHRADA" + zlatý tagline
// - Bílé nav linky (hover zlaté #bcba63) vpravo
// - CTA: zelená #6a961f, padding 16px 32px, border-radius 24px, 14px 700 Lato
// - Navbar height 85px, vnitřní obsah centrovaný
// - Mobile: hamburger → fullscreen tmavý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarGarden01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const DARK   = "#202714";
  const GREEN  = "#6a961f";
  const GOLD   = "#bcba63";
  const WHITE  = "#ffffff";
  const FONT_H = "'Cardo', Georgia, serif";
  const FONT_B = "'Inter', 'Lato', Arial, sans-serif";

  const siteName = String(content.siteName ?? "ZAHRADA");
  const tagline  = String(content.tagline  ?? "Zahradnické služby");
  const ctaText  = String(content.ctaText  ?? "Nezávazná poptávka");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const navBg     = scrolled ? DARK      : "transparent";
  const navShadow = scrolled ? "0 2px 16px rgba(0,0,0,0.45)" : "none";

  const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" stroke={GOLD} strokeWidth="1.5"/>
      <path d="M20 32C20 32 12 26 12 18.5C12 14 16 12 20 15C24 12 28 14 28 18.5C28 26 20 32 20 32Z" fill={GREEN} opacity="0.9"/>
      <circle cx="20" cy="16" r="3.5" fill={GOLD}/>
      <path d="M20 19.5L20 32" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&family=Inter:wght@400;500;600&family=Lato:wght@400;700&display=swap" />
      <style>{`        .g01-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          font-family: ${FONT_B};
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .g01-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          height: 85px;
          gap: 2rem;
        }
        .g01-logo {
          display: flex; align-items: center; gap: 0.85rem;
          text-decoration: none; flex-shrink: 0;
        }
        .g01-logo-texts { display: flex; flex-direction: column; }
        .g01-logo-name {
          font-family: ${FONT_H};
          font-size: 1.35rem; font-weight: 700;
          color: ${WHITE}; line-height: 1.15;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .g01-logo-tag {
          font-family: ${FONT_B}; font-size: 0.6rem; font-weight: 400;
          color: ${GOLD}; text-transform: uppercase;
          letter-spacing: 0.14em; margin-top: 0.15rem;
        }
        .g01-nav {
          display: none; list-style: none; margin: 0; padding: 0;
          gap: 0; flex: 1; justify-content: flex-end;
        }
        @media (min-width: 64rem) { .g01-nav { display: flex; } }
        .g01-nav a {
          display: flex; align-items: center; height: 85px;
          padding: 0 0.85rem;
          color: rgba(255,255,255,0.92);
          text-decoration: none; font-size: 0.92rem; font-weight: 500;
          font-family: ${FONT_B};
          transition: color 0.15s; white-space: nowrap;
        }
        .g01-nav a:hover { color: ${GOLD}; }
        .g01-cta { display: none; flex-shrink: 0; margin-left: 0.5rem; }
        @media (min-width: 64rem) { .g01-cta { display: flex; } }
        .g01-cta a {
          display: inline-block;
          background: ${GREEN};
          color: ${WHITE};
          font-family: 'Lato', ${FONT_B};
          font-size: 14px; font-weight: 700;
          text-decoration: none;
          text-transform: capitalize;
          letter-spacing: 0.4px;
          padding: 16px 32px;
          border-radius: 24px;
          white-space: nowrap;
          line-height: 1em;
          transition: opacity 0.15s;
        }
        .g01-cta a:hover { opacity: 0.85; }
        .g01-hamburger {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          padding: 0.5rem; margin-left: auto;
        }
        @media (min-width: 64rem) { .g01-hamburger { display: none; } }
        .g01-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: ${DARK};
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1.5rem;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .g01-overlay.g01-open { opacity: 1; pointer-events: auto; }
        .g01-overlay a {
          color: ${WHITE}; font-family: ${FONT_B};
          font-size: 1.4rem; font-weight: 500;
          text-decoration: none; transition: color 0.15s;
        }
        .g01-overlay a:hover { color: ${GOLD}; }
        .g01-ov-close {
          position: absolute; top: 1.2rem; right: 1.5rem;
          background: none; border: none; cursor: pointer;
          color: ${WHITE}; font-size: 2rem; line-height: 1; padding: 4px;
          font-family: ${FONT_B}; transition: color 0.15s;
        }
        .g01-ov-close:hover { color: ${GOLD}; }
        .g01-ov-cta { margin-top: 0.75rem; }
        .g01-ov-cta a {
          background: ${GREEN} !important; color: ${WHITE} !important;
          font-size: 1rem !important; font-weight: 700 !important;
          padding: 14px 28px; border-radius: 24px;
          text-transform: capitalize; letter-spacing: 0.4px;
        }
      `}</style>

      <header
        className="g01-header"
        data-template="garden-01-navbar"
        style={{ backgroundColor: navBg, boxShadow: navShadow }}
      >
        <div className="g01-inner">
          <a href={resolve("/")} className="g01-logo" aria-label={siteName}>
            <LogoIcon />
            <div className="g01-logo-texts">
              <span className="g01-logo-name">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
              <span className="g01-logo-tag">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </span>
            </div>
          </a>

          <ul className="g01-nav" role="list">
            {links.map((link, i) => (
              <li key={i}><a href={resolve(link.href)}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" /></a></li>
            ))}
          </ul>

          <div className="g01-cta">
            <a href={resolve(ctaHref)} data-btn="primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          <button className="g01-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden="true">
              <rect y="0"   width="24" height="2.5" rx="1.25" fill={WHITE}/>
              <rect y="8.5" width="24" height="2.5" rx="1.25" fill={WHITE}/>
              <rect y="17"  width="24" height="2.5" rx="1.25" fill={WHITE}/>
            </svg>
          </button>
        </div>
      </header>

      <div className={`g01-overlay${open ? " g01-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        <button className="g01-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        {links.map((link, i) => (
          <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <div className="g01-ov-cta">
          <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setOpen(false)}>{ctaText}</a>
        </div>
      </div>
    </>
  );
}

// ── garden-02-navbar ──────────────────────────────────────────────────────────
// 1:1 polgarden.cz:
// - Fixed TRANSPARENT přes hero → bílý (#ffffff) on-scroll + shadow
// - Logo vlevo: "pol" bold zelený #95c11f + "garden" thin tmavý #1a2a0a
// - Nav linky: bílé přes hero → #333333 on-scroll, hover #95c11f
// - Phone CTA pill vpravo s telefonní ikonou
// - Mobile: phone icon btn + hamburger → fullscreen bílý overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarGarden02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const PRIMARY = "#95c11f";
  const DARK    = "#1a2a0a";
  const WHITE   = "#ffffff";
  const TEXT    = "#333333";

  const siteName = String(content.siteName ?? "FreshGarden");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  const navBg     = scrolled ? WHITE       : "transparent";
  const navShadow = scrolled ? "0 2px 12px rgba(0,0,0,0.09)" : "none";
  const linkColor = scrolled ? TEXT        : "rgba(255,255,255,0.93)";

  // Split siteName at first uppercase after pos 0 → ["Fresh", "Garden"]
  const splitIdx  = siteName.slice(1).search(/[A-Z]/) + 1;
  const logoPart1 = splitIdx > 0 ? siteName.slice(0, splitIdx) : siteName;
  const logoPart2 = splitIdx > 0 ? siteName.slice(splitIdx) : "";

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.18 2 2 0 0 1 3.55 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.72A16 16 0 0 0 15.27 16.08l.89-.89a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );

  return (
    <>
      <style>{`
        .g02-header {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .g02-inner {
          max-width: 1240px; margin: 0 auto;
          padding: 0 1.5rem;
          display: flex; align-items: center; height: 72px; gap: 1.5rem;
        }
        .g02-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0;
          font-size: 1.725rem; line-height: 1;
          font-family: Arial, sans-serif;
        }
        .g02-logo-pol  { font-weight: 900; color: ${PRIMARY}; }
        .g02-logo-gard { font-weight: 300; transition: color 0.3s; }
        .g02-nav {
          display: none; list-style: none; margin: 0; padding: 0;
          gap: 0; flex: 1; justify-content: flex-end; align-items: center;
        }
        @media (min-width: 64rem) { .g02-nav { display: flex; } }
        .g02-nav a {
          display: flex; align-items: center; height: 72px;
          padding: 0 0.8rem;
          text-decoration: none; font-size: 1.035rem; font-weight: 500;
          transition: color 0.15s; white-space: nowrap;
        }
        .g02-nav a:hover { color: ${PRIMARY} !important; }
        .g02-phone { display: none; flex-shrink: 0; margin-left: 0.5rem; }
        @media (min-width: 64rem) { .g02-phone { display: flex; } }
        .g02-phone a {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: ${PRIMARY}; color: ${WHITE};
          font-size: 0.875rem; font-weight: 600;
          text-decoration: none;
          padding: 0.5rem 1.1rem; border-radius: 9999px;
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .g02-phone a:hover { opacity: 0.88; }
        .g02-phone-mobile {
          display: inline-flex; align-items: center; justify-content: center;
          background: ${PRIMARY}; color: ${WHITE};
          border: none; cursor: pointer;
          width: 40px; height: 40px; border-radius: 10px;
          font-size: 1.1rem; margin-left: auto; margin-right: 0.5rem;
          text-decoration: none;
        }
        @media (min-width: 64rem) { .g02-phone-mobile { display: none; } }
        .g02-hamburger {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer; padding: 0.4rem;
        }
        @media (min-width: 64rem) { .g02-hamburger { display: none; } }
        .g02-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: ${WHITE};
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1.25rem;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .g02-overlay.g02-open { opacity: 1; pointer-events: auto; }
        .g02-overlay a { color: ${TEXT}; font-size: 1.3rem; font-weight: 500; text-decoration: none; transition: color 0.15s; }
        .g02-overlay a:hover { color: ${PRIMARY}; }
        .g02-ov-close {
          position: absolute; top: 1.2rem; right: 1.5rem;
          background: none; border: none; cursor: pointer;
          color: ${TEXT}; font-size: 2rem; line-height: 1; padding: 4px;
        }
        .g02-ov-phone {
          display: inline-flex !important; align-items: center; gap: 0.4rem;
          background: ${PRIMARY}; color: ${WHITE} !important;
          font-size: 1rem !important; font-weight: 600 !important;
          padding: 0.6rem 1.4rem; border-radius: 9999px;
          margin-top: 0.5rem;
        }
      `}</style>

      <header
        className="g02-header"
        data-template="garden-02-navbar"
        style={{ backgroundColor: navBg, boxShadow: navShadow }}
      >
        <div className="g02-inner">
          <a href={resolve("/")} className="g02-logo" aria-label={siteName}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">
              <span className="g02-logo-pol">{logoPart1}</span>
              {logoPart2 && <span className="g02-logo-gard" style={{ color: scrolled ? DARK : WHITE }}>{logoPart2}</span>}
            </GenericEditableText>
          </a>

          <ul className="g02-nav" role="list">
            {links.map((link, i) => (
              <li key={i}>
                <a href={resolve(link.href)} style={{ color: linkColor }}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <div className="g02-phone">
            <a href={`tel:${phone.replace(/\s/g, "")}`}>
              <PhoneIcon />
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
          </div>

          <a href={`tel:${phone.replace(/\s/g, "")}`} className="g02-phone-mobile" aria-label="Zavolat">
            <PhoneIcon />
          </a>

          <button className="g02-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden="true">
              <rect y="0"   width="24" height="2.5" rx="1.25" fill={scrolled ? TEXT : WHITE}/>
              <rect y="8.5" width="24" height="2.5" rx="1.25" fill={scrolled ? TEXT : WHITE}/>
              <rect y="17"  width="24" height="2.5" rx="1.25" fill={scrolled ? TEXT : WHITE}/>
            </svg>
          </button>
        </div>
      </header>

      <div className={`g02-overlay${open ? " g02-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        <button className="g02-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        {links.map((link, i) => (
          <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="g02-ov-phone" onClick={() => setOpen(false)}>
          <PhoneIcon />
          {phone}
        </a>
      </div>
    </>
  );
}


// ── arbo-01-navbar ─────────────────────────────────────────────────────────────
// 1:1 lesarb.cz:
// - Transparent fixed header, 110px desktop / 80px mobile
// - On scroll: bg #f7f6fd, shadow, height 65px
// - Logo vlevo: img ze content.logoUrl (max-width 252px)
// - Nav links UPROSTŘED: #051d35, uppercase, 0.875rem, fw700, ls 0.05em
//   hover: bg #15472a pill, white text
// - CTA vpravo: bg #009739, diagonal arrow ↗, hover bg #15472a
// - Mobile: hamburger → full-screen overlay menu
// ─────────────────────────────────────────────────────────────────────────────
function NavbarArbo01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const siteName = String(content.siteName ?? "ARBORIST");
  const logoUrl  = String(content.logoUrl  ?? "");
  const ctaText  = String(content.ctaText  ?? "Nezávazná poptávka");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" />
      <style>{`
        .arbo01-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 110px;
          background: transparent;
          transition: background 0.3s ease, box-shadow 0.3s ease, height 0.3s ease;
          font-family: "AlanSans", "Inter", system-ui, sans-serif;
        }
        .arbo01-header.arbo01-scrolled {
          background: #f7f6fd;
          box-shadow: 0 5px 20px rgba(0,0,0,0.05);
          height: 65px;
        }
        @media (max-width: 959px) {
          .arbo01-header { height: 80px; }
          .arbo01-header.arbo01-scrolled { height: 60px; }
        }

        .arbo01-container {
          max-width: 1370px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* Logo */
        .arbo01-logo {
          display: flex; align-items: center;
          text-decoration: none; flex-shrink: 0;
          line-height: 1;
        }
        .arbo01-logo img {
          max-width: 252px;
          max-height: 66px;
          width: auto;
          height: auto;
          display: block;
          transition: max-width 0.3s ease;
        }
        .arbo01-scrolled .arbo01-logo img { max-height: 44px; }
        .arbo01-logo-fallback {
          font-size: 1.25rem; font-weight: 700;
          color: #009739;
          letter-spacing: 0.05em; text-transform: uppercase;
        }

        /* Nav links */
        .arbo01-nav {
          display: none; list-style: none; margin: 0; padding: 0;
          flex: 1; justify-content: center; align-items: center; gap: 0.25rem;
        }
        @media (min-width: 960px) { .arbo01-nav { display: flex; } }
        .arbo01-nav a {
          display: inline-flex; align-items: center;
          padding: 0.45em 0.85em;
          color: #051d35;
          text-decoration: none;
          font-size: 0.875rem; font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 9999px;
          white-space: nowrap;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .arbo01-header.arbo01-scrolled .arbo01-nav a { color: #051d35; }
        .arbo01-nav a:hover { background: #15472a; color: #ffffff; }

        /* CTA */
        .arbo01-cta { display: none; flex-shrink: 0; }
        @media (min-width: 960px) { .arbo01-cta { display: flex; } }
        .arbo01-cta a {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #009739;
          color: #ffffff;
          font-family: inherit;
          font-size: 0.9rem; font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          padding: 0.65rem 1.25rem;
          border-radius: 6px;
          white-space: nowrap;
          transition: background 0.2s ease;
        }
        .arbo01-cta a:hover { background: #15472a; }
        .arbo01-cta-arrow {
          display: inline-block; width: 16px; height: 16px; flex-shrink: 0;
          background-color: currentColor;
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M7 17L17 7M17 7H7M17 7v10'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M7 17L17 7M17 7H7M17 7v10'/%3E%3C/svg%3E");
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          -webkit-mask-size: contain; mask-size: contain;
        }

        /* Hamburger */
        .arbo01-hamburger {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
          padding: 0.5rem; color: #051d35;
        }
        @media (min-width: 960px) { .arbo01-hamburger { display: none; } }

        /* Mobile overlay */
        .arbo01-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 199;
          background: #fff;
          flex-direction: column;
          padding-top: 80px;
          overflow-y: auto;
        }
        .arbo01-overlay.arbo01-open { display: flex; }
        .arbo01-overlay a {
          color: #051d35;
          font-size: 1.1rem; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          text-decoration: none;
          padding: 1rem 2rem;
          border-bottom: 1px solid #f0f0f0;
          transition: color 0.15s;
        }
        .arbo01-overlay a:hover { color: #009739; }
        .arbo01-overlay-cta { padding: 1.5rem 2rem; }
        .arbo01-overlay-cta a {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: #009739; color: #fff !important;
          padding: 0.8rem 1.5rem;
          border-radius: 6px; text-transform: none !important;
          letter-spacing: 0 !important; font-size: 1rem !important;
          border-bottom: none !important;
          transition: background 0.2s;
        }
        .arbo01-overlay-cta a:hover { background: #15472a; }
      `}</style>

      <header className={`arbo01-header${scrolled ? " arbo01-scrolled" : ""}`} data-template="arbo-01-navbar">
        <div className="arbo01-container">
          {/* Logo */}
          <a href={resolve("/")} className="arbo01-logo" aria-label={siteName}>
            {logoUrl ? (
              <img loading="eager" src={logoUrl} alt={siteName} />
            ) : (
              <span className="arbo01-logo-fallback">{siteName}</span>
            )}
          </a>

          {/* Centered nav links */}
          <ul className="arbo01-nav" role="list">
            {links.map((link, i) => (
              <li key={i}>
                <a href={resolve(link.href)}>{link.label}</a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="arbo01-cta">
            <a href={resolve(ctaHref)} data-btn="primary">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <span className="arbo01-cta-arrow" aria-hidden="true" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="arbo01-hamburger"
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`arbo01-overlay${menuOpen ? " arbo01-open" : ""}`} aria-hidden={!menuOpen} role="dialog" aria-label="Navigace">
        {links.map((link, i) => (
          <a key={i} href={resolve(link.href)} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
        <div className="arbo01-overlay-cta">
          <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setMenuOpen(false)}>
            {ctaText}
            <span className="arbo01-cta-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}

// ── clean-02-navbar ───────────────────────────────────────────────────────────
// Bílý sticky navbar: logo vlevo | nav links střed | tel + CTA vpravo
// Sizes +25% oproti base designu
// ─────────────────────────────────────────────────────────────────────────────
function NavbarClean02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const siteName = String(content.siteName ?? "Clean Garden");
  const logoUrl  = String(content.logoUrl  ?? "");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const ctaText  = String(content.ctaText  ?? "Poptat úklid");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };

  const BLUE = "#1c91ff";
  const NAVY = "#0e0e53";
  const boxShadow = scrolled ? "0 2px 24px rgba(28,145,255,0.12)" : "0 15px 20px -15px rgba(28,120,255,0.10)";

  return (
    <>
      <style>{`
        .c02-nav {
          font-family: 'Onest', sans-serif;
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: #fff;
          border-bottom: 1px solid #dfecff;
          transition: box-shadow 0.3s;
        }
        .c02-inner {
          max-width: 80rem; margin: 0 auto; padding: 0 5%;
          height: 5.625rem; display: flex; align-items: center; justify-content: space-between; gap: 1.7rem;
        }
        .c02-logo { display: flex; align-items: center; flex-shrink: 0; text-decoration: none; }
        .c02-logo img { height: 2.475rem; width: auto; }
        .c02-logo-text {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-weight: 700; font-size: 1.24rem; color: ${NAVY}; white-space: nowrap;
        }
        .c02-links { display: flex; align-items: center; gap: 0.27rem; list-style: none; margin: 0; padding: 0; }
        .c02-links a {
          font-size: 1.01rem; font-weight: 500; color: ${NAVY}; text-decoration: none;
          padding: 0.45rem 0.85rem; border-radius: 6px; transition: color 0.2s, background 0.2s;
        }
        .c02-links a:hover { color: ${BLUE}; background: #f0f7ff; }
        .c02-right { display: flex; align-items: center; gap: 1.125rem; flex-shrink: 0; }
        .c02-phone {
          font-size: 0.985rem; font-weight: 500; color: ${NAVY};
          text-decoration: none; white-space: nowrap;
        }
        .c02-phone:hover { color: ${BLUE}; }
        .c02-cta {
          display: inline-flex; align-items: center; gap: 0.56rem;
          padding: 0.72rem 1.575rem; border-radius: 9999px;
          background: linear-gradient(90deg, #2bbbff, #2559e2);
          color: #fff; font-size: 0.985rem; font-weight: 600;
          text-decoration: none; white-space: nowrap;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 8px 25px -15px rgba(28,120,255,0.4);
        }
        .c02-cta:hover { opacity: 0.9; transform: translateY(-1px); }
        .c02-hamburger {
          display: none; background: none; border: none; cursor: pointer; padding: 4.5px;
          color: ${NAVY};
        }
        .c02-overlay {
          display: none; position: fixed; inset: 0; background: #fff; z-index: 200;
          flex-direction: column; padding: 2.25rem 1.7rem; gap: 1.35rem;
        }
        .c02-overlay.c02-open { display: flex; }
        .c02-ov-close {
          align-self: flex-end; background: none; border: none; font-size: 2.25rem;
          cursor: pointer; color: ${NAVY}; margin-bottom: 0.56rem; line-height: 1;
        }
        .c02-overlay a {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.4rem; font-weight: 600; color: ${NAVY}; text-decoration: none;
          padding: 0.56rem 0; border-bottom: 1px solid #dfecff;
        }
        .c02-ov-cta {
          margin-top: 1.125rem; display: inline-block; padding: 0.9rem 2rem;
          border-radius: 9999px; background: linear-gradient(90deg, #2bbbff, #2559e2);
          color: #fff; font-weight: 600; text-align: center; text-decoration: none;
        }
        @media (max-width: 1050px) {
          .c02-links, .c02-phone { display: none; }
          .c02-hamburger { display: block; }
        }
      `}</style>

      <nav className="c02-nav" data-template="clean-02-navbar" style={{ boxShadow }}>
        <div className="c02-inner">
          <a href={resolve("/")} className="c02-logo" aria-label={siteName}>
            {logoUrl ? (
              <img loading="eager" src={logoUrl} alt={siteName} />
            ) : (
              <span className="c02-logo-text"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
            )}
          </a>

          <ul className="c02-links" role="list">
            {links.map((link, i) => (
              <li key={i}>
                <a href={resolve(link.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <div className="c02-right">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="c02-phone">
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={resolve(ctaHref)} data-btn="primary" className="c02-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          <button className="c02-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" aria-hidden="true">
              <rect y="0"    width="28" height="3" rx="1.5" fill="currentColor"/>
              <rect y="10.5" width="28" height="3" rx="1.5" fill="currentColor"/>
              <rect y="21"   width="28" height="3" rx="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className={`c02-overlay${open ? " c02-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        <button className="c02-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        {links.map((link, i) => (
          <a key={i} href={resolve(link.href)} onClick={() => setOpen(false)}>{link.label}</a>
        ))}
        <a href={`tel:${phone.replace(/\s/g, "")}`} onClick={() => setOpen(false)} style={{ borderBottom: "none" }}>{phone}</a>
        <a href={resolve(ctaHref)} data-btn="primary" className="c02-ov-cta" onClick={() => setOpen(false)}>{ctaText}</a>
      </div>
    </>
  );
}


// ── ddd-01-navbar ─────────────────────────────────────────────────────────────
// 1:1 deratizacepraha.com:
// - Modrý (#0c93eb) announcement bar nahoře (normální flow), telefon POUZE zde
// - Header position:absolute přes hero — tmavý #064e86 bg (hero prosvítá), bílý text
// - Logo: 72px bug ikona SVG + bílý wordmark "Demo\nDeratizace" vedle sebe
// - Nav linky: uppercase, bílé, bez telefonu v navbaru
// - Hamburger: "Menu" label + tři čárky, mobile overlay tmavý #064e86
// ─────────────────────────────────────────────────────────────────────────────
function NavbarDdd01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const PRIMARY  = "#0c93eb";
  const DARK     = "#064e86";
  const WHITE    = "#ffffff";
  const FONT     = "'Figtree', system-ui, sans-serif";

  const siteName = String(content.siteName ?? "Demo Deratizace");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const announcementText = String(content.announcementText ?? "Pro bezplatnou konzultaci nebo objednávku volejte");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const logoUrl  = String(content.logoUrl ?? "");
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  const logoSrc = logoUrl || `/templates/ddd-01/logo.svg`;

  // Bug ikona — bílá verze (pro tmavý header)
  const BugIconWhite = () => (
    <svg viewBox="0 0 72 72" width="64" height="64" fill="none" aria-hidden="true">
      <ellipse cx="36" cy="44" rx="14" ry="18" fill={WHITE} fillOpacity="0.95"/>
      <ellipse cx="36" cy="27" rx="9" ry="8.5" fill={WHITE} fillOpacity="0.95"/>
      {/* Antennae */}
      <line x1="29" y1="20" x2="21" y2="11" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="43" y1="20" x2="51" y2="11" stroke={WHITE} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Legs left */}
      <line x1="22" y1="37" x2="10" y2="30" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="22" y1="44" x2="9"  y2="43" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="22" y1="51" x2="10" y2="58" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round"/>
      {/* Legs right */}
      <line x1="50" y1="37" x2="62" y2="30" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="50" y1="44" x2="63" y2="43" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="50" y1="51" x2="62" y2="58" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <>
      <style>{`
        /* ---- announcement bar ---- */
        .ddd01-bar {
          background: ${PRIMARY};
          color: ${WHITE};
          font-family: ${FONT};
          font-size: 0.875rem;
          text-align: center;
          padding: 0.55rem 1rem;
          line-height: 1.4;
        }
        .ddd01-bar a {
          color: ${WHITE};
          font-weight: 700;
          text-decoration: none;
        }
        .ddd01-bar a:hover { text-decoration: underline; }

        /* ---- header overlay přes hero ---- */
        .ddd01-header {
          background: ${DARK};
          color: ${WHITE};
          font-family: ${FONT};
          position: relative;
          z-index: 50;
        }
        .ddd01-header-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0.9rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        /* ---- logo ---- */
        .ddd01-logo {
          display: inline-grid;
          grid-template-columns: 64px auto;
          gap: 0.75em;
          align-items: center;
          text-decoration: none;
          color: ${WHITE};
          flex-shrink: 0;
        }
        .ddd01-logo-img { width: 100%; height: 100%; }
        .ddd01-logo-text {
          font-size: clamp(0.9rem, 1.3vw, 1.1rem);
          font-weight: 700;
          color: ${WHITE};
          line-height: 1.2;
          letter-spacing: 0.01em;
        }

        /* ---- nav links ---- */
        .ddd01-nav-list {
          display: flex;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 0;
        }
        .ddd01-nav-list a {
          color: ${WHITE};
          text-decoration: none;
          text-transform: uppercase;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          padding: 0.4rem 0.9rem;
          display: inline-block;
          transition: opacity 125ms;
        }
        .ddd01-nav-list a:hover { opacity: 0.75; }

        /* ---- hamburger ---- */
        .ddd01-toggler {
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          background: transparent;
          border: 0;
          cursor: pointer;
          color: ${WHITE};
          padding: 0.4rem;
        }
        .ddd01-toggler-bars {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 28px;
        }
        .ddd01-toggler-bars span {
          display: block;
          height: 2px;
          background: ${WHITE};
          border-radius: 2px;
          width: 100%;
        }
        .ddd01-toggler-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: ${WHITE};
          line-height: 1;
        }

        /* ---- mobile overlay ---- */
        .ddd01-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: ${DARK};
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }
        .ddd01-overlay.is-open { display: flex; }
        .ddd01-overlay-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: 0;
          font-size: 1.75rem;
          color: ${WHITE};
          cursor: pointer;
          line-height: 1;
        }
        .ddd01-overlay a {
          font-size: 1.1rem;
          font-weight: 500;
          color: ${WHITE};
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          width: 220px;
          text-align: center;
          transition: opacity 125ms;
        }
        .ddd01-overlay a:hover { opacity: 0.7; }

        @media (max-width: 992px) {
          .ddd01-nav-list { display: none; }
          .ddd01-toggler  { display: flex; }
        }
      `}</style>

      {/* Announcement bar — telefon POUZE zde */}
      <div className="ddd01-bar">
        <GenericEditableText sectionId={sectionId} field="announcementText" value={announcementText} tag="span" />
        {" "}<a href={`tel:${phone.replace(/\s/g, "")}`}>
          <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
        </a>.
      </div>

      {/* Header — tmavý overlay přes hero */}
      <header className="ddd01-header" data-template="ddd-01-navbar">
        <div className="ddd01-header-inner">

          {/* Logo: ikona + text */}
          <a href={homeHref} className="ddd01-logo" title={siteName}>
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 64, height: 64 }}
            >
              <BugIconWhite />
            </GenericEditableImage>
            <span className="ddd01-logo-text">
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
          </a>

          {/* Desktop nav */}
          <nav aria-label="Hlavní navigace">
            <ul className="ddd01-nav-list">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={resolve(l.href)}>
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hamburger */}
          <button className="ddd01-toggler" onClick={() => setOpen(true)} aria-label="Zobrazit hlavní menu" aria-expanded={open} aria-haspopup="true">
            <div className="ddd01-toggler-bars">
              <span/><span/><span/>
            </div>
            <span className="ddd01-toggler-label">Menu</span>
          </button>

        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`ddd01-overlay${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        <button className="ddd01-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">✕</button>
        {links.map((l, i) => (
          <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}

// ── chalet-01-navbar ──────────────────────────────────────────────────────────
// Transparentní overlay navbar → on-scroll tmavá; logo vlevo; nav linky uprostřed;
// telefon + "Rezervovat" vpravo; mobile hamburger → fullscreen dark overlay
function NavbarChalet01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const BEIGE  = "#c0bbad";
  const DARK   = "#1e2329";
  const WHITE  = "#ffffff";
  const FONT_H = "'Josefin Sans', 'Plus Jakarta Sans', system-ui, sans-serif";

  const siteName  = String(content.siteName  ?? "Demo Chalet");
  const phone     = String(content.phone     ?? "+420 704 123 456");
  const email     = String(content.email     ?? "email@demo.cz");
  const location  = String(content.location  ?? "Malá Úpa, Krkonoše");
  const instagram = String(content.instagram ?? "https://instagram.com/demo");
  const facebook  = String(content.facebook  ?? "https://facebook.com/demo");
  const youtube   = String(content.youtube   ?? "https://youtube.com/@demo");
  const links     = (content.links as Array<{ label: string; href: string }>) ?? [];
  const logoUrl   = String(content.logoUrl   ?? "");
  const resolve   = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref  = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";
  const logoSrc   = logoUrl || `/templates/chalet-01/logo.svg`;

  const navBg     = scrolled ? `rgba(30,35,45,0.97)` : "transparent";
  const navShadow = scrolled ? "0 2px 24px rgba(0,0,0,0.45)" : "0 4px 32px rgba(0,0,0,0.18)";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" />
      <style>{`        .ch01-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          font-family: ${FONT_H};
          transition: background 0.35s ease, box-shadow 0.35s ease;
        }
        .ch01-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 80px;
          display: flex;
          align-items: center;
          gap: 0;
        }
        /* ── Logo ── */
        .ch01-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          flex-shrink: 0;
          margin-right: auto;
        }
        .ch01-logo-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .ch01-logo:hover .ch01-logo-circle { border-color: ${WHITE}; }
        .ch01-logo-wordmark {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .ch01-logo-name {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${WHITE};
        }
        .ch01-logo-sub {
          font-size: 0.58rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        /* ── Center nav links ── */
        .ch01-links {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0;
        }
        .ch01-links a {
          display: block;
          padding: 0.25rem 0.7rem;
          font-size: 0.68rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${WHITE};
          text-decoration: none;
          opacity: 0.85;
          white-space: nowrap;
          transition: opacity 0.18s;
        }
        .ch01-links a:hover { opacity: 1; }
        /* ── Right icon buttons ── */
        .ch01-icons {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
          margin-left: auto;
        }
        .ch01-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.45);
          color: ${WHITE};
          text-decoration: none;
          transition: border-color 0.18s, background 0.18s;
          flex-shrink: 0;
        }
        .ch01-icon-btn:hover {
          border-color: ${WHITE};
          background: rgba(255,255,255,0.12);
        }
        /* ── Hamburger ── */
        .ch01-hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 26px;
          height: 18px;
          background: none;
          border: 0;
          cursor: pointer;
          padding: 0;
          margin-left: 1rem;
        }
        .ch01-hamburger span {
          display: block;
          height: 1.5px;
          width: 100%;
          background: ${WHITE};
          border-radius: 1px;
        }
        /* ── Mobile overlay ── */
        .ch01-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: ${DARK};
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
        }
        .ch01-overlay.is-open { display: flex; }
        .ch01-overlay-close {
          position: absolute;
          top: 1.25rem;
          right: 1.5rem;
          background: none;
          border: 0;
          color: ${WHITE};
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
          opacity: 0.65;
          transition: opacity 0.18s;
        }
        .ch01-overlay-close:hover { opacity: 1; }
        .ch01-ov-brand {
          position: absolute;
          top: 1.4rem;
          left: 2rem;
          font-family: ${FONT_H};
        }
        .ch01-ov-brand-name {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${WHITE};
        }
        .ch01-ov-brand-sub {
          display: block;
          font-size: 0.55rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
        }
        .ch01-ov-link {
          font-family: ${FONT_H};
          font-size: 0.95rem;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${WHITE};
          text-decoration: none;
          padding: 0.7rem 0;
          border-bottom: 1px solid rgba(192,187,173,0.15);
          width: 260px;
          text-align: center;
          transition: color 0.18s;
        }
        .ch01-ov-link:hover { color: ${BEIGE}; }
        .ch01-ov-icons {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-top: 2rem;
        }
        .ch01-ov-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.35);
          color: ${WHITE};
          text-decoration: none;
          transition: border-color 0.18s, background 0.18s;
        }
        .ch01-ov-icon-btn:hover {
          border-color: ${BEIGE};
          background: rgba(192,187,173,0.12);
        }
        @media (max-width: 1100px) {
          .ch01-links { display: none; }
          .ch01-icons { display: none; }
          .ch01-hamburger { display: flex; }
          .ch01-logo { margin-right: 0; }
        }
        @media (max-width: 480px) {
          .ch01-logo-wordmark { display: none; }
        }
      `}</style>

      <nav
        className="ch01-nav"
        style={{ background: navBg, boxShadow: navShadow }}
        data-template="chalet-01-navbar"
      >
        <div className="ch01-inner">
          {/* Logo left */}
          <a href={homeHref} className="ch01-logo" title={siteName}>
            <div className="ch01-logo-circle">
              <GenericEditableImage
                sectionId={sectionId}
                field="logoUrl"
                src={logoSrc}
                alt={siteName}
                className="relative overflow-hidden"
                style={{ width: 36, height: 36 }}
              >
                <img loading="eager" src={logoSrc} alt={siteName} style={{ width: 36, height: 36, objectFit: "contain" }} />
              </GenericEditableImage>
            </div>
            <span className="ch01-logo-wordmark">
              <span className="ch01-logo-name">
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </span>
              <span className="ch01-logo-sub">chalet</span>
            </span>
          </a>

          {/* Nav links center */}
          <ul className="ch01-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          {/* Right icon buttons */}
          <div className="ch01-icons">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="ch01-icon-btn" aria-label="Telefon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.58.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.03Z"/>
              </svg>
            </a>
            <a href={`mailto:${email}`} className="ch01-icon-btn" aria-label="E-mail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className="ch01-icon-btn" aria-label="Poloha">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="ch01-icon-btn" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href={facebook} target="_blank" rel="noopener noreferrer" className="ch01-icon-btn" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href={youtube} target="_blank" rel="noopener noreferrer" className="ch01-icon-btn" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
              </svg>
            </a>
          </div>

          <button className="ch01-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`ch01-overlay${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        <span className="ch01-ov-brand">
          <span className="ch01-ov-brand-name">
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </span>
          <span className="ch01-ov-brand-sub">chalet</span>
        </span>
        <button className="ch01-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        {links.map((l, i) => (
          <a key={i} href={resolve(l.href)} className="ch01-ov-link" onClick={() => setOpen(false)}>
            <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
          </a>
        ))}
        <div className="ch01-ov-icons">
          <a href={`tel:${phone.replace(/\s/g,"")}`} className="ch01-ov-icon-btn" aria-label="Telefon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.58.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.03Z"/>
            </svg>
          </a>
          <a href={`mailto:${email}`} className="ch01-ov-icon-btn" aria-label="E-mail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </a>
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="ch01-ov-icon-btn" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a href={facebook} target="_blank" rel="noopener noreferrer" className="ch01-ov-icon-btn" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href={youtube} target="_blank" rel="noopener noreferrer" className="ch01-ov-icon-btn" aria-label="YouTube">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

// ── hotel-01-navbar ───────────────────────────────────────────────────────────
function NavbarHotel01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const c = (content ?? {}) as Record<string, any>;
  const siteName     = c.siteName   ?? "BOUTIQUE HOTEL";
  const logoUrl      = c.logoUrl    ?? "";
  const phone        = c.phone      ?? "+420 704 123 456";
  const ctaText      = c.ctaText    ?? "Rezervujte";
  const ctaHref      = c.ctaHref    ?? "#kontakt";
  const overlayBgUrl = c.overlayBgUrl ?? "";
  const announcement = c.announcement ?? "Jarní akce · 3 noci za cenu 2";
  const announcementHref = c.announcementHref ?? "/nabidky";
  const monogram     = c.monogram   ?? "A";
  const links: { label: string; href: string }[] = c.links ?? [];
  const siteMode     = String(c.siteMode ?? "multipage");

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const resolve = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Poppins:wght@300;400;500&display=swap" />
      <style>{`
        .h01ann {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1001;
          height: 32px; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(90deg,#3e3e3e 0%,#4a4238 50%,#3e3e3e 100%);
          color: rgba(255,255,255,.86); text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase;
          border-bottom: 1px solid rgba(169,135,99,.32);
          transition: transform .45s cubic-bezier(.22,.68,0,1.1), opacity .35s;
        }
        .h01ann a { color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 12px; padding: 0 20px; transition: color .3s; }
        .h01ann a:hover { color: #d4b088; }
        .h01ann a::before, .h01ann a::after {
          content: ''; display: inline-block; width: 22px; height: 1px;
          background: linear-gradient(90deg, transparent, #a98763, transparent);
        }
        .h01ann.hidden { transform: translateY(-100%); opacity: 0; pointer-events: none; }

        .h01nav {
          position: fixed; top: 32px; left: 0; right: 0; z-index: 1000;
          transition: background .45s ease, box-shadow .45s ease, top .45s cubic-bezier(.22,.68,0,1.1), backdrop-filter .45s;
          background: transparent;
          font-family: 'Poppins', sans-serif;
        }
        .h01nav.scrolled {
          top: 0;
          background: rgba(28,26,24,0.92);
          backdrop-filter: blur(14px) saturate(1.3);
          -webkit-backdrop-filter: blur(14px) saturate(1.3);
          box-shadow: 0 8px 40px -8px rgba(0,0,0,0.5);
        }
        .h01nav.scrolled::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(169,135,99,.55) 20%, rgba(169,135,99,.75) 50%, rgba(169,135,99,.55) 80%, transparent 100%);
        }
        .h01nav-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 0;
          padding: 0 32px; height: 84px;
          transition: height .35s;
        }
        .h01nav.scrolled .h01nav-inner { height: 68px; }

        .h01nav-logo {
          display: flex; align-items: center; gap: 14px;
          text-decoration: none; flex-shrink: 0; margin-right: 44px;
          transition: opacity .3s;
        }
        .h01nav-logo:hover { opacity: .85; }
        .h01nav-logo img { height: 44px; width: auto; }
        .h01nav-logo-mark {
          width: 40px; height: 40px; position: relative; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .h01nav-logo-mark svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .h01nav-logo-mark span {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 500; font-size: 20px;
          color: #d4b088; line-height: 1; position: relative; z-index: 2;
        }
        .h01nav-logo-text { display: flex; flex-direction: column; gap: 3px; }
        .h01nav-logo-text b {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 500; font-size: 15px; letter-spacing: 0.28em; color: #fff;
          text-transform: uppercase; line-height: 1;
        }
        .h01nav-logo-text em {
          font-style: normal;
          font-family: 'Poppins', sans-serif;
          font-weight: 300; font-size: 9px; letter-spacing: 0.42em;
          color: rgba(169,135,99,.9); text-transform: uppercase; line-height: 1;
        }

        .h01nav-links {
          display: flex; align-items: center; gap: 4px; list-style: none;
          margin: 0; padding: 0; flex: 1;
        }
        .h01nav-links li a {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12.5px; letter-spacing: 0.14em; text-transform: uppercase;
          font-weight: 400;
          color: rgba(255,255,255,0.86); text-decoration: none;
          padding: 10px 16px; position: relative; display: inline-block;
          white-space: nowrap;
          transition: color 0.35s cubic-bezier(.22,.68,0,1.1);
        }
        .h01nav-links li a::before {
          content: ''; position: absolute; left: 16px; right: 16px; bottom: 3px;
          height: 1px; background: #a98763;
          transform: scaleX(0); transform-origin: right center;
          transition: transform .5s cubic-bezier(.22,.68,0,1.1);
        }
        .h01nav-links li a::after {
          content: ''; position: absolute; left: 50%; top: 2px;
          width: 4px; height: 4px; background: #a98763;
          transform: translateX(-50%) rotate(45deg) scale(0);
          transition: transform .45s cubic-bezier(.22,.68,0,1.1);
        }
        .h01nav-links li a:hover { color: #d4b088; }
        .h01nav-links li a:hover::before { transform: scaleX(1); transform-origin: left center; }
        .h01nav-links li a:hover::after { transform: translateX(-50%) rotate(45deg) scale(1); }

        .h01nav-right { display: flex; align-items: center; gap: 24px; flex-shrink: 0; }
        .h01nav-phone {
          font-size: 12.5px; color: rgba(255,255,255,0.82);
          text-decoration: none; letter-spacing: 0.08em;
          display: flex; align-items: center; gap: 8px;
          font-family: 'Poppins', sans-serif; font-weight: 400;
          transition: color 0.3s;
        }
        .h01nav-phone svg { color: #a98763; transition: transform .35s cubic-bezier(.22,.68,0,1.1); }
        .h01nav-phone:hover { color: #d4b088; }
        .h01nav-phone:hover svg { transform: rotate(-12deg) scale(1.1); }

        .h01nav-cta {
          position: relative; display: inline-flex; align-items: center; justify-content: center;
          background: transparent; color: #fff;
          border: 1px solid #a98763;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 13px 30px; text-decoration: none;
          transition: color .35s, border-color .35s;
          overflow: hidden; white-space: nowrap;
        }
        .h01nav-cta::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#a98763 0%,#c4a274 100%);
          transform: translateY(101%); transition: transform .5s cubic-bezier(.22,.68,0,1.1);
          z-index: 0;
        }
        .h01nav-cta:hover { border-color: #c4a274; color: #fff; }
        .h01nav-cta:hover::before { transform: translateY(0); }
        .h01nav-cta > * { position: relative; z-index: 1; }

        .h01nav-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 10px; margin-left: 12px;
        }
        .h01nav-hamburger span {
          display: block; width: 26px; height: 1.5px; background: #fff; transition: all 0.35s cubic-bezier(.22,.68,0,1.1);
        }
        .h01nav-hamburger:hover span { background: #d4b088; }
        .h01nav-hamburger:hover span:nth-child(1) { transform: translateX(-2px); }
        .h01nav-hamburger:hover span:nth-child(3) { transform: translateX(2px); }

        .h01nav-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(24,22,20,0.96);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity .55s cubic-bezier(.22,.68,0,1.1);
        }
        .h01nav-overlay.is-open { opacity: 1; pointer-events: all; }
        .h01nav-overlay-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          opacity: 0.14; pointer-events: none;
          filter: sepia(.2) contrast(1.1);
          transform: scale(1.08);
          transition: transform 6s ease-out;
        }
        .h01nav-overlay.is-open .h01nav-overlay-bg { transform: scale(1); }
        .h01nav-overlay::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 100% at 50% 50%, rgba(169,135,99,.08), transparent 70%),
            linear-gradient(180deg, rgba(24,22,20,.7) 0%, transparent 20%, transparent 80%, rgba(24,22,20,.85) 100%);
          pointer-events: none;
        }
        .h01nav-overlay-close {
          position: absolute; top: 24px; right: 32px;
          background: none; border: 1px solid rgba(169,135,99,.4);
          color: #fff; font-size: 22px; width: 46px; height: 46px;
          cursor: pointer; line-height: 1; opacity: 0.8;
          display: inline-flex; align-items: center; justify-content: center;
          transition: opacity .3s, border-color .3s, background .3s, transform .5s cubic-bezier(.22,.68,0,1.1);
          z-index: 3;
        }
        .h01nav-overlay-close:hover { opacity: 1; border-color: #a98763; background: rgba(169,135,99,.15); transform: rotate(90deg); }

        .h01nav-ov-eyebrow {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic; font-weight: 400; font-size: 14px;
          color: rgba(169,135,99,.85); letter-spacing: 0.24em;
          margin-bottom: 40px; position: relative; z-index: 2;
          opacity: 0; transform: translateY(20px);
          transition: opacity .5s ease .1s, transform .6s cubic-bezier(.22,.68,0,1.1) .1s;
        }
        .h01nav-overlay.is-open .h01nav-ov-eyebrow { opacity: 1; transform: translateY(0); }
        .h01nav-ov-eyebrow::before, .h01nav-ov-eyebrow::after {
          content: ''; display: inline-block; width: 40px; height: 1px;
          background: rgba(169,135,99,.55); vertical-align: middle; margin: 0 18px;
        }

        .h01nav-ov-links { display: flex; flex-direction: column; align-items: center; }
        .h01nav-ov-link {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 32px; letter-spacing: 0.08em; color: #fff;
          text-decoration: none; text-transform: uppercase; font-weight: 400;
          padding: 12px 0; position: relative; z-index: 2;
          opacity: 0; transform: translateY(28px);
          transition: opacity .5s ease var(--d,0s), transform .6s cubic-bezier(.22,.68,0,1.1) var(--d,0s), color .35s;
        }
        .h01nav-overlay.is-open .h01nav-ov-link { opacity: .92; transform: translateY(0); }
        .h01nav-ov-link::after {
          content: ''; position: absolute; left: 50%; bottom: 6px;
          width: 0; height: 1px; background: #a98763;
          transform: translateX(-50%); transition: width .5s cubic-bezier(.22,.68,0,1.1);
        }
        .h01nav-ov-link:hover { color: #d4b088; }
        .h01nav-ov-link:hover::after { width: 60%; }

        .h01nav-ov-cta {
          margin-top: 44px; background: transparent; color: #fff;
          border: 1px solid #a98763; position: relative; overflow: hidden;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px; letter-spacing: 0.24em; text-transform: uppercase;
          padding: 16px 44px; text-decoration: none; z-index: 2;
          opacity: 0; transform: translateY(28px);
          transition: opacity .5s ease .55s, transform .6s cubic-bezier(.22,.68,0,1.1) .55s, color .35s;
        }
        .h01nav-overlay.is-open .h01nav-ov-cta { opacity: 1; transform: translateY(0); }
        .h01nav-ov-cta::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#a98763 0%,#c4a274 100%);
          transform: translateY(101%); transition: transform .5s cubic-bezier(.22,.68,0,1.1);
          z-index: 0;
        }
        .h01nav-ov-cta:hover::before { transform: translateY(0); }
        .h01nav-ov-cta > * { position: relative; z-index: 1; }

        .h01nav-ov-contact {
          position: absolute; bottom: 48px; left: 0; right: 0;
          display: flex; justify-content: center; gap: 48px; z-index: 2;
          font-family: 'Poppins', sans-serif; font-size: 12px;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,.5);
          opacity: 0; transition: opacity .5s ease .8s;
        }
        .h01nav-overlay.is-open .h01nav-ov-contact { opacity: 1; }
        .h01nav-ov-contact a { color: rgba(169,135,99,.9); text-decoration: none; margin-left: 10px; transition: color .3s; }
        .h01nav-ov-contact a:hover { color: #d4b088; }

        .h01nav-mobile-bar {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
          height: 58px; box-shadow: 0 -6px 24px rgba(0,0,0,.25);
        }
        .h01nav-mobile-bar a {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase;
          color: #fff; text-decoration: none; height: 100%;
          transition: background .3s;
        }
        .h01nav-mobile-bar .h01-call { width: 42%; background: #3e3e3e; }
        .h01nav-mobile-bar .h01-book { width: 58%; background: linear-gradient(135deg,#a98763 0%,#c4a274 100%); }
        .h01nav-mobile-bar .h01-call:hover { background: #4a4238; }

        @media (max-width: 900px) {
          .h01ann { font-size: 10px; letter-spacing: .12em; height: 28px; }
          .h01ann a::before, .h01ann a::after { width: 12px; }
          .h01nav { top: 28px; }
          .h01nav-links { display: none; }
          .h01nav-phone { display: none; }
          .h01nav-cta { display: none; }
          .h01nav-hamburger { display: flex; margin-left: auto; }
          .h01nav-mobile-bar { display: flex; }
          .h01nav-inner { height: 64px; padding: 0 20px; }
          .h01nav.scrolled .h01nav-inner { height: 56px; }
          .h01nav-logo { margin-right: 0; }
          .h01nav-logo-text b { font-size: 12px; letter-spacing: 0.22em; }
          .h01nav-logo-text em { font-size: 8px; }
          .h01nav-ov-link { font-size: 22px; }
          .h01nav-ov-eyebrow { font-size: 12px; margin-bottom: 28px; }
          .h01nav-ov-eyebrow::before, .h01nav-ov-eyebrow::after { width: 20px; margin: 0 10px; }
          .h01nav-ov-contact { gap: 20px; flex-direction: column; align-items: center; bottom: 32px; }
        }
      `}</style>

      {announcement && (
        <div className={`h01ann${scrolled ? " hidden" : ""}`}>
          <a href={resolve(announcementHref)}>
            <GenericEditableText sectionId={sectionId} field="announcement" value={announcement} tag="span" />
          </a>
        </div>
      )}

      <nav className={`h01nav${scrolled ? " scrolled" : ""}`} data-template="hotel-01-navbar">
        <div className="h01nav-inner">
          <a href={resolve("/")} className="h01nav-logo" aria-label={siteName}>
            {logoUrl
              ? <img loading="eager" src={logoUrl} alt={siteName} />
              : (
                <>
                  <span className="h01nav-logo-mark" aria-hidden="true">
                    <svg viewBox="0 0 40 40" fill="none">
                      <rect x="1" y="1" width="38" height="38" stroke="#a98763" strokeWidth="0.6" opacity="0.55"/>
                      <path d="M6 6 L6 12 M6 6 L12 6 M34 6 L34 12 M34 6 L28 6 M6 34 L6 28 M6 34 L12 34 M34 34 L34 28 M34 34 L28 34" stroke="#a98763" strokeWidth="0.8" opacity="0.85"/>
                    </svg>
                    <span>{monogram}</span>
                  </span>
                  <span className="h01nav-logo-text">
                    <b><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></b>
                    <em>Boutique · Est. 1908</em>
                  </span>
                </>
              )
            }
          </a>

          <ul className="h01nav-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <div className="h01nav-right">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="h01nav-phone">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.7 16.94Z"/>
              </svg>
              <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
            </a>
            <a href={resolve(ctaHref)} data-btn="primary" className="h01nav-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>

          <button className="h01nav-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      <div className="h01nav-mobile-bar">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="h01-call">Zavolejte</a>
        <a href={resolve(ctaHref)} data-btn="primary" className="h01-book">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      <div className={`h01nav-overlay${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        {overlayBgUrl && (
          <div className="h01nav-overlay-bg" style={{ backgroundImage: `url('${overlayBgUrl}')` }} />
        )}
        <button className="h01nav-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        <div className="h01nav-ov-eyebrow">Grand Hotel Aurora · Anno 1908</div>
        <div className="h01nav-ov-links">
          {links.map((l, i) => (
            <a
              key={i}
              href={resolve(l.href)}
              className="h01nav-ov-link"
              onClick={() => setOpen(false)}
              style={{ ["--d" as any]: `${0.18 + i * 0.06}s` }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a href={resolve(ctaHref)} data-btn="primary" className="h01nav-ov-cta" onClick={() => setOpen(false)}>
          <span>{ctaText}</span>
        </a>
        <div className="h01nav-ov-contact">
          <span>Recepce<a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></span>
        </div>
      </div>
    </>
  );
}

// ── hotel-02-navbar ───────────────────────────────────────────────────────────
// 1:1 hotel-atlantis.cz:
// - Fixed transparentní navbar + bílý 1px border-bottom (is-l-header-border)
// - Na scrollu (>60px) → bílý solid bg, border-bottom primary #96A1AC
// - Logo: SVG wordmark bílý na transparent, tmavý na white; filter: brightness()
// - Montserrat font, uppercase nav linky bílé → tmavé on-scroll
// - CTA: filled #96A1AC "Rezervovat" + arrow icon vpravo
// - Mobile hamburger → fullscreen tmavý #1a2332 overlay
function NavbarHotel02(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const c = (content ?? {}) as Record<string, any>;
  const siteName   = c.siteName   ?? "RELAX HOTEL";
  const siteMark   = c.siteMark   ?? "&";
  const logoUrl    = c.logoUrl    ?? "";
  const phone      = c.phone      ?? "+420 704 123 456";
  const phoneLabel = c.phoneLabel ?? "Rezervace";
  const ctaText    = c.ctaText    ?? "Rezervovat pobyt";
  const ctaHref    = c.ctaHref    ?? "#kontakt";
  const links: { label: string; href: string }[] = c.links ?? [];
  const siteMode   = String(c.siteMode ?? "multipage");

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const resolve    = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const resolveCta = (href: string) =>
    href?.startsWith("#") ? (isAdmin ? "#" : href) : href ?? "#";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600;700&display=swap" />
      <style>{`        .h02nav {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
          transition: background 0.5s cubic-bezier(.22,.68,0,1), box-shadow 0.5s ease, backdrop-filter 0.5s, border-color 0.5s;
          background: linear-gradient(to bottom, rgba(10,14,22,0.55) 0%, rgba(10,14,22,0.10) 65%, transparent 100%);
          border-bottom: 1px solid rgba(255,255,255,0.14);
          font-family: 'Montserrat', sans-serif;
          box-sizing: border-box;
        }
        .h02nav.scrolled {
          background: rgba(255,255,255,0.97);
          backdrop-filter: saturate(140%) blur(10px);
          -webkit-backdrop-filter: saturate(140%) blur(10px);
          box-shadow: 0 6px 32px -12px rgba(26,35,50,0.16);
          border-bottom: 1px solid rgba(150,161,172,0.28);
        }
        .h02nav-inner {
          max-width: 1360px; margin: 0 auto;
          display: flex; align-items: center; gap: 0;
          padding: 0 32px; height: 108px;
          transition: height 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02nav.scrolled .h02nav-inner { height: 78px; }
        .h02nav-logo {
          display: inline-flex; align-items: baseline; gap: 12px;
          text-decoration: none; flex-shrink: 0; margin-right: 44px;
        }
        .h02nav-logo img {
          height: 46px; width: auto;
          transition: filter 0.5s ease, height 0.5s;
          filter: brightness(0) invert(1);
        }
        .h02nav.scrolled .h02nav-logo img { filter: brightness(0) invert(0); height: 38px; }
        .h02nav-logo-mark {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-style: italic; font-weight: 500;
          font-size: 34px; line-height: 1;
          color: #fff;
          transition: color 0.5s, transform 0.5s cubic-bezier(.22,.68,0,1);
          transform: translateY(2px);
        }
        .h02nav.scrolled .h02nav-logo-mark { color: #5B7A8E; }
        .h02nav-logo:hover .h02nav-logo-mark { transform: translateY(2px) rotate(-6deg); }
        .h02nav-logo-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px; font-weight: 600; letter-spacing: 0.28em;
          color: #fff; text-transform: uppercase; line-height: 1;
          transition: color 0.5s;
        }
        .h02nav.scrolled .h02nav-logo-text { color: #1a2332; }

        .h02nav-links {
          display: flex; align-items: center; gap: 2px; list-style: none;
          margin: 0; padding: 0; flex: 1; justify-content: center;
        }
        .h02nav-links li a {
          position: relative;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500; letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92); text-decoration: none;
          padding: 10px 16px; transition: color 0.3s; white-space: nowrap;
          display: inline-block;
        }
        .h02nav-links li a::after {
          content: ""; position: absolute; left: 50%; right: 50%; bottom: 4px;
          height: 1px; background: currentColor;
          transition: left 0.4s cubic-bezier(.22,.68,0,1), right 0.4s cubic-bezier(.22,.68,0,1);
        }
        .h02nav-links li a:hover::after { left: 16px; right: 16px; }
        .h02nav.scrolled .h02nav-links li a { color: #1a2332; }
        .h02nav-links li a:hover { color: #5B7A8E !important; }

        .h02nav-right { display: flex; align-items: center; gap: 22px; flex-shrink: 0; }
        .h02nav-phone {
          display: inline-flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.92); text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          transition: color 0.3s;
        }
        .h02nav.scrolled .h02nav-phone { color: #1a2332; }
        .h02nav-phone:hover { color: #5B7A8E !important; }
        .h02nav-phone-label {
          font-size: 9px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase;
          opacity: 0.65; display: block; line-height: 1; margin-bottom: 4px;
        }
        .h02nav-phone-num {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 18px; font-weight: 500; letter-spacing: 0.02em;
          display: block; line-height: 1;
        }
        .h02nav-phone-icon {
          width: 34px; height: 34px; border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid currentColor; opacity: 0.7;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1), opacity 0.3s;
          flex-shrink: 0;
        }
        .h02nav-phone:hover .h02nav-phone-icon { transform: rotate(-14deg); opacity: 1; }
        .h02nav-divider {
          width: 1px; height: 34px; background: rgba(255,255,255,0.30);
          transition: background 0.5s;
        }
        .h02nav.scrolled .h02nav-divider { background: rgba(150,161,172,0.45); }

        .h02nav-cta {
          position: relative; overflow: hidden; isolation: isolate;
          display: inline-flex; align-items: center; gap: 12px; justify-content: center;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.85);
          color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 14px 30px; text-decoration: none;
          transition: color 0.35s, border-color 0.35s; white-space: nowrap;
        }
        .h02nav-cta::before {
          content: ""; position: absolute; inset: 0; z-index: -1;
          background: #5B7A8E; transform: translateY(101%);
          transition: transform 0.5s cubic-bezier(.22,.68,0,1);
        }
        .h02nav-cta:hover::before { transform: translateY(0); }
        .h02nav-cta:hover { color: #fff; border-color: #5B7A8E; }
        .h02nav.scrolled .h02nav-cta { border-color: #1a2332; color: #1a2332; }
        .h02nav.scrolled .h02nav-cta::before { background: #1a2332; }
        .h02nav.scrolled .h02nav-cta:hover { color: #fff; border-color: #1a2332; }
        .h02nav-cta-arrow {
          width: 14px; height: 14px; flex-shrink: 0;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1);
        }
        .h02nav-cta:hover .h02nav-cta-arrow { transform: translate(3px,-3px); }

        .h02nav-hamburger {
          display: none; position: relative; width: 34px; height: 34px;
          background: none; border: none; cursor: pointer; padding: 0; margin-left: 12px;
        }
        .h02nav-hamburger span {
          position: absolute; left: 4px; right: 4px; height: 1.5px;
          background: #fff; transition: transform 0.35s cubic-bezier(.22,.68,0,1), top 0.35s, opacity 0.25s, background 0.5s;
        }
        .h02nav-hamburger span:nth-child(1) { top: 10px; }
        .h02nav-hamburger span:nth-child(2) { top: 16px; }
        .h02nav-hamburger span:nth-child(3) { top: 22px; }
        .h02nav.scrolled .h02nav-hamburger span { background: #1a2332; }
        .h02nav-hamburger[aria-expanded="true"] span:nth-child(1) { top: 16px; transform: rotate(45deg); }
        .h02nav-hamburger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
        .h02nav-hamburger[aria-expanded="true"] span:nth-child(3) { top: 16px; transform: rotate(-45deg); }

        /* Fullscreen overlay */
        .h02nav-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: #0f1622;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
          overflow: hidden;
        }
        .h02nav-overlay::before {
          content: ""; position: absolute; inset: -20%;
          background: radial-gradient(circle at 50% 30%, rgba(91,122,142,0.28) 0%, transparent 55%);
          pointer-events: none;
        }
        .h02nav-overlay.is-open { opacity: 1; pointer-events: all; }
        .h02nav-overlay-close {
          position: absolute; top: 24px; right: 28px;
          width: 44px; height: 44px; border-radius: 999px;
          background: none; border: 1px solid rgba(255,255,255,0.25);
          color: #fff; font-size: 26px;
          cursor: pointer; line-height: 1; opacity: 0.85;
          transition: opacity 0.2s, transform 0.4s, border-color 0.3s;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .h02nav-overlay-close:hover { opacity: 1; transform: rotate(90deg); border-color: #96A1AC; }
        .h02nav-ov-mark {
          font-family: 'Cormorant Garamond', 'Georgia', serif; font-style: italic;
          font-size: 56px; color: rgba(150,161,172,0.85); line-height: 1;
          margin-bottom: 28px;
        }
        .h02nav-ov-link {
          font-family: 'Cormorant Garamond', 'Georgia', serif;
          font-size: 30px; font-weight: 500; letter-spacing: 0.02em;
          color: rgba(255,255,255,0.92); text-decoration: none;
          padding: 10px 0; transition: color 0.25s, letter-spacing 0.35s;
          position: relative;
        }
        .h02nav-ov-link:hover { color: #96A1AC; letter-spacing: 0.06em; }
        .h02nav-ov-cta {
          margin-top: 32px; background: #96A1AC; color: #fff;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 16px 44px; text-decoration: none; border-radius: 2px;
          transition: background 0.3s;
        }
        .h02nav-ov-cta:hover { background: #5B7A8E; }
        .h02nav-ov-phone {
          margin-top: 18px; color: rgba(255,255,255,0.7); text-decoration: none;
          font-family: 'Cormorant Garamond', 'Georgia', serif; font-size: 20px; letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .h02nav-ov-phone:hover { color: #fff; }

        /* Mobile bottom bar */
        .h02nav-mobile-bar {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 999;
          height: 56px; box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
        }
        .h02nav-mobile-bar a {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: #fff; text-decoration: none; height: 100%;
          transition: background 0.25s;
        }
        .h02nav-mobile-bar .h02-call { width: 40%; background: #1a2332; }
        .h02nav-mobile-bar .h02-call:hover { background: #0f1622; }
        .h02nav-mobile-bar .h02-book { width: 60%; background: #5B7A8E; }
        .h02nav-mobile-bar .h02-book:hover { background: #96A1AC; }

        @media (max-width: 1024px) {
          .h02nav-phone, .h02nav-divider { display: none; }
        }
        @media (max-width: 960px) {
          .h02nav-links { display: none; }
          .h02nav-hamburger { display: block; }
          .h02nav-mobile-bar { display: flex; }
          .h02nav-inner { height: 76px; padding: 0 20px; }
          .h02nav.scrolled .h02nav-inner { height: 64px; }
          .h02nav-cta { padding: 11px 20px; font-size: 10px; letter-spacing: 0.16em; }
          .h02nav-logo-text { font-size: 12px; letter-spacing: 0.22em; }
          .h02nav-logo-mark { font-size: 28px; }
          .h02nav-ov-link { font-size: 26px; }
        }
        @media (max-width: 480px) {
          .h02nav-cta { display: none; }
          .h02nav-inner { padding: 0 16px; height: 64px; }
          .h02nav.scrolled .h02nav-inner { height: 56px; }
          .h02nav-logo-text { font-size: 11px; letter-spacing: 0.18em; }
          .h02nav-logo-mark { font-size: 24px; }
        }
      `}</style>

      <nav className={`h02nav${scrolled ? " scrolled" : ""}`} data-template="hotel-02-navbar">
        <div className="h02nav-inner">
          <a href={resolve("/")} className="h02nav-logo" aria-label={siteName}>
            {logoUrl ? (
              <img loading="eager" src={logoUrl} alt={siteName} />
            ) : (
              <>
                <span className="h02nav-logo-mark" aria-hidden="true">
                  <GenericEditableText sectionId={sectionId} field="siteMark" value={siteMark} tag="span" />
                </span>
                <span className="h02nav-logo-text">
                  <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
                </span>
              </>
            )}
          </a>

          <ul className="h02nav-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          <div className="h02nav-right">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="h02nav-phone">
              <span className="h02nav-phone-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </span>
              <span>
                <span className="h02nav-phone-label">
                  <GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" />
                </span>
                <span className="h02nav-phone-num">
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </span>
              </span>
            </a>
            <span className="h02nav-divider" aria-hidden="true" />
            <a href={resolveCta(ctaHref)} data-btn="primary" className="h02nav-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg className="h02nav-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </a>
          </div>

          <button className="h02nav-hamburger" onClick={() => setOpen(v => !v)} aria-label={open ? "Zavřít menu" : "Otevřít menu"} aria-expanded={open}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <div className="h02nav-mobile-bar">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="h02-call">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
          </svg>
          <span>Zavolat</span>
        </a>
        <a href={resolveCta(ctaHref)} data-btn="primary" className="h02-book">
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
      </div>

      {/* Fullscreen overlay */}
      <div className={`h02nav-overlay${open ? " is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Navigace">
        <button className="h02nav-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        <span className="h02nav-ov-mark" aria-hidden="true">
          <GenericEditableText sectionId={sectionId} field="siteMark" value={siteMark} tag="span" />
        </span>
        {links.map((l, i) => (
          <a key={i} href={resolve(l.href)} className="h02nav-ov-link" onClick={() => setOpen(false)}>
            <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
          </a>
        ))}
        <a href={resolveCta(ctaHref)} data-btn="primary" className="h02nav-ov-cta" onClick={() => setOpen(false)}>
          <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
        </a>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="h02nav-ov-phone" onClick={() => setOpen(false)}>
          <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
        </a>
      </div>
    </>
  );
}

// ── malir-02-navbar ───────────────────────────────────────────────────────────
// 1:1 malirstvi-bastar.cz:
// - Fixed navbar s tmavým gradient overlay (přes hero nesplývá)
// - Na scrollu (>60px) → bílý solid bg + shadow
// - Logo vlevo: SVG wordmark
// - Nav linky: bílé + text-shadow přes hero → tmavé #232323 na scrollu, hover #ff914d
// - Telefon vpravo s call ikonou, oranžová (#ff914d)
// - Font: Poppins 600 uppercase
// - Mobile (<768px): hamburger → fullscreen tmavý #232323 overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarMalir02({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const siteName = String(content.siteName ?? "Malířské Práce");
  const logoUrl  = String(content.logoUrl ?? "");
  const phone    = String(content.phone ?? "704 123 456");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];

  const ORANGE = "#ff914d";
  const DARK   = "#232323";
  const WHITE  = "#ffffff";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.13 1.18 2 2 0 012.11.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
    </svg>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
      <style>{`        .malir02-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: background 0.35s, box-shadow 0.35s;
        }
        .malir02-nav.transparent {
          background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 70%, transparent 100%);
          box-shadow: none;
        }
        .malir02-nav.scrolled {
          background: ${WHITE};
          box-shadow: 0 2px 20px rgba(0,0,0,0.12);
        }
        .malir02-link {
          color: ${WHITE}; text-decoration: none;
          font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 13px;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
          transition: color 0.2s, text-shadow 0.2s;
        }
        .malir02-nav.scrolled .malir02-link {
          color: ${DARK}; text-shadow: none;
        }
        .malir02-link:hover { color: ${ORANGE} !important; text-shadow: none !important; }
        .malir02-phone-link { color: ${ORANGE}; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        .malir02-nav.scrolled .malir02-phone-link { text-shadow: none; }
        @media (max-width: 768px) { .malir02-desktop { display: none !important; } .malir02-hamburger { display: flex !important; } }
        @media (min-width: 769px) { .malir02-hamburger { display: none !important; } }
      `}</style>

      <nav className={`malir02-nav ${scrolled ? "scrolled" : "transparent"}`} data-template="malir-02">
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", height: 72 }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            {logoUrl ? (
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoUrl} alt={siteName}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl} alt={siteName}
                  style={{ height: 48, filter: scrolled ? "none" : "brightness(10)", transition: "filter 0.35s" }}
                />
              </GenericEditableImage>
            ) : (
              <span style={{ color: scrolled ? DARK : WHITE, fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, transition: "color 0.3s", textShadow: scrolled ? "none" : "0 1px 4px rgba(0,0,0,0.5)" }}>
                {siteName}
              </span>
            )}
          </a>

          {/* Desktop nav */}
          <ul className="malir02-desktop" style={{ display: "flex", gap: 28, listStyle: "none", margin: 0, padding: 0 }}>
            {links.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="malir02-link">
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
                </a>
              </li>
            ))}
          </ul>

          {/* Phone */}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="malir02-desktop malir02-phone-link" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <PhoneIcon />
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
          </a>

          {/* Hamburger */}
          <button className="malir02-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 24, height: 2, background: scrolled ? DARK : WHITE, display: "block", borderRadius: 2, transition: "background 0.3s", boxShadow: scrolled ? "none" : "0 1px 3px rgba(0,0,0,0.5)" }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: DARK, zIndex: 1001, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }} role="dialog" aria-modal="true" aria-label="Navigace">
          <button onClick={() => setOpen(false)} aria-label="Zavřít menu" style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: WHITE, fontSize: 28, cursor: "pointer" }}>×</button>
          {links.map((l, i) => (
            <a key={i} href={l.href} onClick={() => setOpen(false)} style={{ color: WHITE, textDecoration: "none", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
            </a>
          ))}
          <a href={`tel:${phone.replace(/\s/g, "")}`} onClick={() => setOpen(false)} style={{ color: ORANGE, fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 18, textDecoration: "none", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <PhoneIcon />
            <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span">{phone}</GenericEditableText>
          </a>
        </div>
      )}
    </>
  );
}

// ── photo-01-navbar ────────────────────────────────────────────────────────────
// 1:1 zbiralova.cz: white sticky 100px navbar, Cinzel serif wordmark left, Inter 16px uppercase nav right
// ── events-01-navbar ──────────────────────────────────────────────────────────
// Prémiová event-agentura, dark blur fixed navbar, wordmark s micro gold dot,
// Služby dropdown (editable items) + nav links s gold hairline underline reveal,
// POPTÁVKA purple #931789 s luxe hover ringem. Awwwards-level polish 2026-07-01.
// ─────────────────────────────────────────────────────────────────────────────
function NavbarEvents01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const PURPLE = "#931789";
  const DARK   = "#0a0a0a";
  const WHITE  = "#ffffff";
  const GOLD   = "#d4b896";

  const siteName     = String(content.siteName ?? "DEMO EVENTS");
  const links        = (content.links as Array<{ label: string; href: string }>) ?? [];
  const poptavkaHref = String(content.poptavkaHref ?? "/kontakt");
  const poptavkaLabel = String(content.poptavkaLabel ?? "POPTÁVKA");
  const siteMode     = String(content.siteMode ?? "multipage");
  const resolve      = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);
  const homeHref     = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  const serviceItemsRaw = (content.serviceItems as Array<{ label: string; href: string; divider?: boolean }>) ?? [
    { label: "TEAMBUILDINGY",   href: "/sluzby" },
    { label: "KONFERENCE",       href: "/sluzby" },
    { label: "FIREMNÍ AKCE",     href: "/sluzby" },
    { label: "VENKOVNÍ EVENTY",  href: "/sluzby" },
    { label: "ROADSHOW",         href: "/sluzby" },
    { label: "VÁNOČNÍ EVENTY",   href: "/sluzby" },
    { label: "ONLINE EVENTY",    href: "/sluzby" },
    { label: "Palladium Roof Top Venue", href: "/sluzby", divider: true },
  ];
  const servicesLabel = String(content.servicesLabel ?? "Služby");

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@400;500;600;700&display=swap" />
      <style>{`        .ev01-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(10,10,10,0.72);
          backdrop-filter: blur(16px) saturate(1.1);
          -webkit-backdrop-filter: blur(16px) saturate(1.1);
          padding: 0 40px;
          height: 76px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(212,184,150,0.06);
          transition: background 0.5s cubic-bezier(.32,.72,0,1), border-color 0.5s cubic-bezier(.32,.72,0,1), height 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-nav[data-scrolled="true"] {
          background: rgba(10,10,10,0.88);
          border-bottom-color: rgba(212,184,150,0.14);
          height: 68px;
        }
        .ev01-nav-wrap {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
        }
        .ev01-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: ${WHITE};
          text-decoration: none;
          letter-spacing: 4px;
          text-transform: uppercase;
          white-space: nowrap;
          justify-self: start;
          transition: color 0.4s cubic-bezier(.32,.72,0,1), letter-spacing 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-logo::before {
          content: "";
          display: block;
          width: 6px;
          height: 6px;
          background: ${GOLD};
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(212,184,150,0.12);
          transition: box-shadow 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-logo:hover { letter-spacing: 4.5px; color: ${GOLD}; }
        .ev01-logo:hover::before { box-shadow: 0 0 0 5px rgba(212,184,150,0.2); transform: scale(1.15); }
        .ev01-nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
          list-style: none;
          margin: 0;
          padding: 0;
          justify-self: center;
        }
        .ev01-nav-links > li {
          position: relative;
          height: 76px;
          display: flex;
          align-items: center;
        }
        .ev01-nav-links > li > a {
          position: relative;
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.88);
          text-decoration: none;
          transition: color 0.35s cubic-bezier(.32,.72,0,1);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }
        .ev01-nav-links > li > a::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 1px;
          background: ${GOLD};
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.5s cubic-bezier(.32,.72,0,1);
        }
        .ev01-nav-links > li > a:hover { color: ${GOLD}; }
        .ev01-nav-links > li > a:hover::after { transform: scaleX(1); }
        .ev01-nav-caret {
          font-size: 8px;
          opacity: 0.55;
          transition: transform 0.35s cubic-bezier(.32,.72,0,1), opacity 0.35s;
        }
        .ev01-nav-links > li.has-sub:hover .ev01-nav-caret { transform: translateY(2px); opacity: 1; }
        .ev01-nav-links > li.has-sub:hover .ev01-sub { opacity: 1; visibility: visible; transform: translateY(0); }
        .ev01-sub {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-6px);
          position: absolute;
          top: 100%;
          left: -16px;
          background: rgba(14,14,14,0.94);
          backdrop-filter: blur(20px) saturate(1.2);
          -webkit-backdrop-filter: blur(20px) saturate(1.2);
          border: 1px solid rgba(212,184,150,0.12);
          border-top: 2px solid ${PURPLE};
          min-width: 250px;
          padding: 10px 0;
          z-index: 300;
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,184,150,0.04);
          transition: opacity 0.35s cubic-bezier(.32,.72,0,1), transform 0.35s cubic-bezier(.32,.72,0,1), visibility 0.35s;
        }
        .ev01-sub a {
          position: relative;
          display: block;
          padding: 10px 24px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          transition: color 0.3s cubic-bezier(.32,.72,0,1), background 0.3s cubic-bezier(.32,.72,0,1), padding-left 0.35s cubic-bezier(.32,.72,0,1);
        }
        .ev01-sub a::before {
          content: "";
          position: absolute;
          left: 12px;
          top: 50%;
          width: 6px;
          height: 1px;
          background: ${GOLD};
          transform: translateY(-50%) scaleX(0);
          transform-origin: left center;
          transition: transform 0.35s cubic-bezier(.32,.72,0,1);
        }
        .ev01-sub a:hover {
          background: linear-gradient(90deg, rgba(147,23,137,0.14) 0%, rgba(147,23,137,0.02) 100%);
          color: ${GOLD};
          padding-left: 32px;
        }
        .ev01-sub a:hover::before { transform: translateY(-50%) scaleX(1); }
        .ev01-sub-divider {
          border: none;
          border-top: 1px solid rgba(212,184,150,0.12);
          margin: 8px 20px;
        }
        .ev01-nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .ev01-btn-pop {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 11px 24px;
          background: ${PURPLE};
          color: ${WHITE};
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1), box-shadow 0.4s cubic-bezier(.32,.72,0,1);
          white-space: nowrap;
        }
        .ev01-btn-pop::before {
          content: "";
          position: absolute;
          inset: -3px;
          border: 1px solid rgba(212,184,150,0);
          transition: border-color 0.5s cubic-bezier(.32,.72,0,1);
          pointer-events: none;
        }
        .ev01-btn-pop:hover {
          background: #a5199a;
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -8px rgba(147,23,137,0.55);
        }
        .ev01-btn-pop:hover::before { border-color: rgba(212,184,150,0.6); }
        .ev01-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          width: 44px;
          height: 44px;
          background: none;
          border: 1px solid rgba(212,184,150,0.22);
          cursor: pointer;
          padding: 0;
          transition: border-color 0.4s cubic-bezier(.32,.72,0,1), background 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-hamburger:hover {
          border-color: ${GOLD};
          background: rgba(212,184,150,0.06);
        }
        .ev01-hamburger span {
          display: block;
          width: 20px;
          height: 1px;
          background: ${GOLD};
          transition: transform 0.35s cubic-bezier(.32,.72,0,1), width 0.35s cubic-bezier(.32,.72,0,1);
        }
        .ev01-hamburger span:nth-child(2) { width: 14px; align-self: flex-end; margin-right: 12px; }
        .ev01-hamburger span:nth-child(3) { width: 18px; }
        .ev01-hamburger:hover span:nth-child(2) { width: 20px; margin-right: 12px; }
        .ev01-hamburger:hover span:nth-child(3) { width: 20px; }
        @media (max-width: 1060px) {
          .ev01-nav { padding: 0 22px; }
          .ev01-nav-wrap { grid-template-columns: 1fr auto; }
          .ev01-nav-links { display: none; }
          .ev01-btn-pop { display: none; }
          .ev01-hamburger { display: flex; }
        }
        @media (max-width: 480px) {
          .ev01-nav { padding: 0 18px; }
          .ev01-logo { font-size: 13px; letter-spacing: 3px; gap: 10px; }
          .ev01-logo::before { width: 5px; height: 5px; box-shadow: 0 0 0 2px rgba(212,184,150,0.12); }
        }
        .ev01-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 90px 24px 40px;
          animation: ev01OverlayIn 0.5s cubic-bezier(.32,.72,0,1);
        }
        .ev01-overlay::before,
        .ev01-overlay::after {
          content: "";
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(212,184,150,0.28) 50%, transparent 100%);
        }
        .ev01-overlay::before { top: 76px; }
        .ev01-overlay::after  { bottom: 76px; }
        @keyframes ev01OverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .ev01-overlay-close {
          position: absolute;
          top: 22px; right: 22px;
          width: 44px; height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid rgba(212,184,150,0.22);
          font-size: 28px;
          cursor: pointer;
          color: ${GOLD};
          line-height: 1;
          transition: background 0.35s cubic-bezier(.32,.72,0,1), border-color 0.35s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-overlay-close:hover {
          background: rgba(212,184,150,0.08);
          border-color: ${GOLD};
          transform: rotate(90deg);
        }
        .ev01-overlay-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .ev01-overlay-nav a {
          position: relative;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 26px;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          color: rgba(255,255,255,0.88);
          text-decoration: none;
          transition: color 0.4s cubic-bezier(.32,.72,0,1);
          padding: 4px 0;
        }
        .ev01-overlay-nav a::after {
          content: "";
          position: absolute;
          left: 50%;
          right: 50%;
          bottom: -2px;
          height: 1px;
          background: ${GOLD};
          transition: left 0.5s cubic-bezier(.32,.72,0,1), right 0.5s cubic-bezier(.32,.72,0,1);
        }
        .ev01-overlay-nav a:hover { color: ${GOLD}; }
        .ev01-overlay-nav a:hover::after { left: 0; right: 0; }
        .ev01-overlay-pop {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 32px;
          background: ${PURPLE};
          color: ${WHITE};
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          text-decoration: none;
          margin-top: 1rem;
          transition: background 0.4s cubic-bezier(.32,.72,0,1), transform 0.4s cubic-bezier(.32,.72,0,1), box-shadow 0.4s cubic-bezier(.32,.72,0,1);
        }
        .ev01-overlay-pop::before {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(212,184,150,0);
          transition: border-color 0.5s cubic-bezier(.32,.72,0,1);
          pointer-events: none;
        }
        .ev01-overlay-pop:hover {
          background: #a5199a;
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -10px rgba(147,23,137,0.6);
        }
        .ev01-overlay-pop:hover::before { border-color: rgba(212,184,150,0.6); }
      `}</style>

      <nav className="ev01-nav" data-template="events-01-navbar" data-scrolled={scrolled ? "true" : "false"}>
        <div className="ev01-nav-wrap">
          <a href={homeHref} className="ev01-logo" aria-label={siteName}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">
              {siteName}
            </GenericEditableText>
          </a>

          <ul className="ev01-nav-links">
            {(() => {
              const servicesLink = links.find(l => l.label.toLowerCase() === servicesLabel.toLowerCase());
              const otherLinks = links.filter(l => l.label.toLowerCase() !== servicesLabel.toLowerCase());
              const servicesHref = servicesLink?.href ?? "/sluzby";
              const servicesIdx = links.findIndex(l => l.label.toLowerCase() === servicesLabel.toLowerCase());
              return (
                <>
                  <li className="has-sub">
                    <a href={resolve(servicesHref)}>
                      {servicesIdx >= 0 ? (
                        <GenericEditableText sectionId={sectionId} field={`links.${servicesIdx}.label`} value={servicesLink!.label} tag="span">{servicesLink!.label}</GenericEditableText>
                      ) : (
                        <GenericEditableText sectionId={sectionId} field="servicesLabel" value={servicesLabel} tag="span">{servicesLabel}</GenericEditableText>
                      )}
                      <span className="ev01-nav-caret">▾</span>
                    </a>
                    <div className="ev01-sub">
                      {serviceItemsRaw.map((it, i) => (
                        <Fragment key={i}>
                          {it.divider && <hr className="ev01-sub-divider" />}
                          <a href={resolve(it.href)}>
                            <GenericEditableText sectionId={sectionId} field={`serviceItems.${i}.label`} value={it.label} tag="span">{it.label}</GenericEditableText>
                          </a>
                        </Fragment>
                      ))}
                    </div>
                  </li>
                  {otherLinks.map((l) => {
                    const originalIdx = links.indexOf(l);
                    return (
                      <li key={originalIdx}>
                        <a href={resolve(l.href)}>
                          <GenericEditableText sectionId={sectionId} field={`links.${originalIdx}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
                        </a>
                      </li>
                    );
                  })}
                </>
              );
            })()}
          </ul>

          <div className="ev01-nav-right">
            <a href={resolve(poptavkaHref)} className="ev01-btn-pop">
              <GenericEditableText sectionId={sectionId} field="poptavkaLabel" value={poptavkaLabel} tag="span">{poptavkaLabel}</GenericEditableText>
            </a>
            <button className="ev01-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="ev01-overlay" role="dialog" aria-modal="true">
          <button className="ev01-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
          <a href={homeHref} style={{ display:"inline-flex", alignItems:"center", gap:12, fontFamily:"'Inter',sans-serif", fontSize:16, fontWeight:600, letterSpacing:"5px", color:WHITE, textDecoration:"none", textTransform:"uppercase", marginBottom:"1rem" }}>
            <span style={{ width:6, height:6, background:GOLD, borderRadius:"50%", boxShadow:"0 0 0 3px rgba(212,184,150,0.16)" }} />
            {siteName}
          </a>
          <nav className="ev01-overlay-nav">
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>
                <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
              </a>
            ))}
          </nav>
          <a href={resolve(poptavkaHref)} className="ev01-overlay-pop" onClick={() => setOpen(false)}>
            <GenericEditableText sectionId={sectionId} field="poptavkaLabel" value={poptavkaLabel} tag="span">{poptavkaLabel}</GenericEditableText>
          </a>
        </div>
      )}
    </>
  );
}

function NavbarPhoto01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const DARK   = "#1a1a1a";
  const WHITE  = "#ffffff";
  const BORDER = "#e8e3dd";

  const siteName = String(content.siteName ?? "DEMO FOTOGRAFKA");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Inter:wght@300;400&display=swap" />
      <style>{`        .ph01-nav {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: ${WHITE};
          border-bottom: 1px solid ${BORDER};
        }
        .ph01-inner {
          max-width: 90%;
          margin: 0 auto;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ph01-logo {
          display: block;
          text-decoration: none;
          flex-shrink: 0;
        }
        .ph01-logo-wordmark {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.2em;
          color: ${DARK};
          text-transform: uppercase;
          white-space: nowrap;
        }
        .ph01-links {
          display: flex;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0;
        }
        .ph01-links a {
          display: block;
          padding: 0.25rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: ${DARK};
          text-decoration: none;
          white-space: nowrap;
          transition: text-decoration 0.18s;
        }
        .ph01-links a:hover { text-decoration: underline; }
        .ph01-links li:first-child a { text-decoration: underline; }
        .ph01-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .ph01-hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: ${DARK};
          border-radius: 2px;
        }
        @media (max-width: 900px) {
          .ph01-inner { max-width: 92%; height: 70px; }
          .ph01-links { display: none; }
          .ph01-hamburger { display: flex; }
        }
        .ph01-overlay {
          position: fixed;
          inset: 0;
          background: ${WHITE};
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        .ph01-overlay-close {
          position: absolute;
          top: 1.25rem;
          right: 1.5rem;
          background: none;
          border: none;
          font-size: 1.75rem;
          cursor: pointer;
          color: ${DARK};
          line-height: 1;
        }
        .ph01-overlay-nav a {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: ${DARK};
          text-decoration: none;
          text-transform: uppercase;
          transition: opacity 0.18s;
        }
        .ph01-overlay-nav a:hover { opacity: 0.6; }
      `}</style>

      <nav className="ph01-nav" data-template="photo-01">
        <div className="ph01-inner">
          {/* Text-only wordmark — no icon, mirrors zbiralova.cz */}
          <a href={homeHref} className="ph01-logo" title={siteName} aria-label={siteName}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">
              <span className="ph01-logo-wordmark">{siteName}</span>
            </GenericEditableText>
          </a>

          {/* Desktop nav links */}
          <ul className="ph01-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">{l.label}</GenericEditableText>
                </a>
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button className="ph01-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="ph01-overlay" role="dialog" aria-modal="true" aria-label="Navigace">
          <button className="ph01-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
          <a href={homeHref} style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: 14, letterSpacing: "0.2em", color: DARK, textDecoration: "none", textTransform: "uppercase" as const, marginBottom: "1rem" }}>{siteName}</a>
          <nav className="ph01-overlay-nav" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

// ── video-01-navbar ────────────────────────────────────────────────────────────
// 1:1 honzakamenar.cz: bílý sticky 118px navbar, Playfair wordmark vlevo,
// Inter 300 nav linky #2E2A28, hover zlatý #C49A6C
function NavbarVideo01(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const DARK   = "#2E2A28";
  const GOLD   = "#C49A6C";
  const WHITE  = "#ffffff";
  const BORDER = "#e8e0d8";

  const siteName = String(content.siteName ?? "Demo Kameraman");
  const links    = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve  = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Inter:wght@300;400&display=swap" />
      <style>{`        .vd01-nav {
          position: sticky; top: 0; left: 0; right: 0;
          z-index: 100;
          background: ${WHITE};
          border-bottom: 1px solid ${BORDER};
        }
        .vd01-inner {
          max-width: 980px; margin: 0 auto;
          height: 118px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
        }
        .vd01-logo { display: block; text-decoration: none; flex-shrink: 0; }
        .vd01-wordmark {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 22px; font-weight: 400; letter-spacing: 0.04em;
          color: ${DARK}; white-space: nowrap;
        }
        .vd01-links {
          display: flex; align-items: center;
          list-style: none; margin: 0; padding: 0; gap: 0;
        }
        .vd01-links a {
          display: block; padding: 0.3rem 0.85rem;
          font-family: 'Inter', sans-serif; font-size: 16.5px; font-weight: 300;
          color: ${DARK}; text-decoration: none; white-space: nowrap;
          transition: color 0.3s ease;
        }
        .vd01-links a:hover { color: ${GOLD}; }
        .vd01-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .vd01-hamburger span {
          display: block; width: 24px; height: 1.5px;
          background: ${DARK}; border-radius: 2px;
        }
        @media (max-width: 900px) {
          .vd01-inner { height: 72px; }
          .vd01-links { display: none; }
          .vd01-hamburger { display: flex; }
          .vd01-wordmark { font-size: 18px; }
        }
        .vd01-overlay {
          position: fixed; inset: 0; background: ${WHITE}; z-index: 200;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;
        }
        .vd01-overlay-close {
          position: absolute; top: 1.25rem; right: 1.5rem;
          background: none; border: none; font-size: 1.75rem;
          cursor: pointer; color: ${DARK}; line-height: 1;
        }
        .vd01-overlay-nav { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .vd01-overlay-nav a {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.1rem; font-weight: 400; letter-spacing: 0.08em;
          color: ${DARK}; text-decoration: none; transition: color 0.2s;
        }
        .vd01-overlay-nav a:hover { color: ${GOLD}; }
      `}</style>

      <nav className="vd01-nav" data-template="video-01">
        <div className="vd01-inner">
          <a href={homeHref} className="vd01-logo" aria-label={siteName}>
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span">
              <span className="vd01-wordmark">{siteName}</span>
            </GenericEditableText>
          </a>

          <ul className="vd01-links">
            {links.map((l, i) => (
              <li key={i}>
                <a href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span">
                    {l.label}
                  </GenericEditableText>
                </a>
              </li>
            ))}
          </ul>

          <button className="vd01-hamburger" onClick={() => setOpen(true)} aria-label="Otevřít menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {open && (
        <div className="vd01-overlay" role="dialog" aria-modal="true" aria-label="Navigace">
          <button className="vd01-overlay-close" onClick={() => setOpen(false)} aria-label="Zavřít">×</button>
          <a href={homeHref} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, letterSpacing: "0.08em", color: DARK, textDecoration: "none", marginBottom: "0.5rem" }}>
            {siteName}
          </a>
          <nav className="vd01-overlay-nav">
            {links.map((l, i) => (
              <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

// ── restaurant-04-navbar ──────────────────────────────────────────────────────
// Fixed transparentní → tmavý #0d1f0a on scroll
// Logo: "Pizza Factory" inline SVG wordmark (červená + bílá)
// Gradient stín pod navbarem když je transparentní (aby text nesplýval s hero)
// [logo vlevo] | [nav linky center abs.] | [outline CTA + červené CTA vpravo]
// Mobile (<900px): hamburger → fullscreen dark overlay
// ─────────────────────────────────────────────────────────────────────────────
function NavbarRestaurant04(props: Props) {
  const { content, tenantSlug, isAdmin, sectionId } = props;
  const siteName = String(content.siteName ?? "Pizza Factory");
  const logoUrl  = String(content.logoUrl  ?? "/templates/restaurant-04/logo.svg");
  const ctaText  = String(content.ctaText  ?? "Rezervace");
  const ctaHref  = String(content.ctaHref  ?? "#kontakt");
  const cta2Text = String((content as any).cta2Text ?? "Objednat si");
  const cta2Href = String((content as any).cta2Href ?? "#objednat");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];

  const DARK   = "#0d1f0a";
  const RED    = "#c41c1c";
  const RED_DK = "#a01515";
  const CREAM  = "#f5f0e8";
  const SANS   = "'Nunito Sans', 'Helvetica Neue', Arial, sans-serif";
  const SERIF  = "'Fraunces', Georgia, 'Times New Roman', serif";

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Inline SVG logo — "Pizza Factory" wordmark */
  const LogoSvg = () => (
    <svg viewBox="0 0 200 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 48, display: "block" }}>
      {/* Pizza slice icon */}
      <path d="M8 38 L22 10 L36 38 Z" fill={RED} opacity="0.9" />
      <circle cx="22" cy="21" r="3.5" fill={CREAM} opacity="0.9" />
      <circle cx="17" cy="30" r="2.5" fill={CREAM} opacity="0.7" />
      <circle cx="28" cy="29" r="2" fill={CREAM} opacity="0.7" />
      {/* "PIZZA" text */}
      <text x="44" y="26" fontFamily="Georgia, serif" fontSize="18" fontWeight="700"
            fill={CREAM} letterSpacing="3" style={{ fontStyle: "italic" }}>PIZZA</text>
      {/* thin red divider */}
      <rect x="44" y="29" width="84" height="1.2" fill={RED} opacity="0.8" />
      {/* "FACTORY" text */}
      <text x="44" y="40" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="9.5"
            fontWeight="600" fill={CREAM} letterSpacing="5" opacity="0.85">FACTORY</text>
    </svg>
  );

  return (
    <>
      {/* Gradient stín pod navbarem — viditelný pouze když je transparentní */}
      {!scrolled && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 99, pointerEvents: "none",
          height: 180,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        }} />
      )}

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: scrolled ? DARK : "transparent",
        boxShadow: scrolled ? "0 2px 28px rgba(0,0,0,0.55)" : "none",
        transition: "background-color 0.4s ease, box-shadow 0.4s ease",
        fontFamily: SANS,
      }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 60px)",
          height: 76, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "relative",
        }}>

          {/* Logo vlevo */}
          <a href={resolve("/")} aria-label={siteName} style={{ textDecoration: "none", flexShrink: 0, zIndex: 2 }}>
            <LogoSvg />
          </a>

          {/* Nav linky — absolutní střed (desktop) */}
          <ul className="r04-nav-center" style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "flex", alignItems: "center", gap: "clamp(16px, 2.5vw, 38px)",
            position: "absolute", left: "50%", transform: "translateX(-50%)",
          }}>
            {links.map((link, i) => (
              <li key={i}>
                <a
                  href={resolve(link.href)}
                  style={{
                    fontFamily: SANS, fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: `${CREAM}cc`, textDecoration: "none",
                    transition: "color 0.18s", whiteSpace: "nowrap",
                    textShadow: scrolled ? "none" : "0 1px 4px rgba(0,0,0,0.5)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = CREAM)}
                  onMouseLeave={e => (e.currentTarget.style.color = `${CREAM}cc`)}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                </a>
              </li>
            ))}
          </ul>

          {/* Pravá strana — CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, zIndex: 2 }}>

            {/* Outline CTA — desktop */}
            <a
              href={resolve(cta2Href)}
              className="r04-cta2"
              style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: CREAM, textDecoration: "none",
                padding: "9px 18px", border: `1px solid ${CREAM}66`, borderRadius: 2,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = CREAM)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${CREAM}66`)}
            >
              <GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" />
            </a>

            {/* Filled CTA — desktop */}
            <a
              href={resolve(ctaHref)}
              data-btn="primary"
              className="r04-cta1"
              style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: CREAM, textDecoration: "none",
                padding: "9px 22px", backgroundColor: RED, borderRadius: 2,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = RED_DK)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = RED)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            {/* Hamburger — mobile */}
            <button
              className="r04-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
              style={{
                display: "none", background: "none", border: "none", cursor: "pointer",
                padding: 8, flexDirection: "column", gap: 5, flexShrink: 0,
              }}
            >
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: CREAM, transition: "transform 0.25s, opacity 0.25s", transform: mobileOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: CREAM, transition: "opacity 0.25s", opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 2, backgroundColor: CREAM, transition: "transform 0.25s", transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Mobile fullscreen overlay */}
        {mobileOpen && (
          <div style={{
            position: "fixed", inset: 0, backgroundColor: DARK, zIndex: 99,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "80px 40px 40px",
          }}>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Zavřít menu"
              style={{
                position: "absolute", top: 20, right: 20,
                background: "none", border: "none", cursor: "pointer",
                color: CREAM, fontSize: 28, lineHeight: 1, padding: 8,
              }}
            >×</button>
            {/* Mobile logo */}
            <div style={{ marginBottom: 40 }}><LogoSvg /></div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, textAlign: "center", width: "100%" }}>
              {links.map((link, i) => (
                <li key={i} style={{ borderBottom: `1px solid ${CREAM}14` }}>
                  <a
                    href={resolve(link.href)}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "block", padding: "16px 0",
                      fontFamily: SERIF, fontSize: "clamp(20px, 5vw, 30px)",
                      fontStyle: "italic", fontWeight: 400,
                      color: CREAM, textDecoration: "none", letterSpacing: "0.04em",
                    }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={link.label} tag="span" />
                  </a>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 36 }}>
              <a href={resolve(ctaHref)} data-btn="primary" onClick={() => setMobileOpen(false)} style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: CREAM, textDecoration: "none",
                padding: "14px 40px", backgroundColor: RED, borderRadius: 2,
              }}><GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" /></a>
              <a href={resolve(cta2Href)} onClick={() => setMobileOpen(false)} style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                textTransform: "uppercase", color: `${CREAM}cc`, textDecoration: "none",
                padding: "12px 32px", border: `1px solid ${CREAM}44`, borderRadius: 2,
              }}><GenericEditableText sectionId={sectionId} field="cta2Text" value={cta2Text} tag="span" /></a>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .r04-nav-center { display: none !important; }
          .r04-cta1 { display: none !important; }
          .r04-cta2 { display: none !important; }
          .r04-hamburger { display: flex !important; }
        }
        @media (min-width: 901px) {
          .r04-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}


// ── clinic-03-navbar ────────────────────────────────────────────────────────
// Yesvisage-style 2-row header:
//   Row 1 (top strip): locations left · phone + hours + link CTA right
//   Row 2 (main):      logo left · nav links center · gold CTA right
//   "Zákroky" link with megaMenu:true opens 4-column mega-menu panel with
//   category items + feature card. Fixed; scrolled → hides top strip.
//   Mobile (<900px): fullscreen cream overlay with centered links
// ─────────────────────────────────────────────────────────────────────────────
function NavbarClinic03({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [mobileOpen]);

  const GOLD       = "#97855F";
  const GOLD_HOVER = "#82734f";
  const CHARCOAL   = "#1A1A1A";
  const MUTED      = "#8a8a8a";
  const WHITE      = "#FFFFFF";
  const CREAM      = "#FAF7F0";
  const STRIP_BG   = "#F6F3EC";
  const SERIF      = "'Cormorant Garamond', Georgia, serif";
  const SANS       = "'DM Sans', 'Inter', Arial, sans-serif";

  const siteName   = String((content as Record<string,unknown>).siteName ?? "DIAMOND LOOK");
  const tagline    = String((content as Record<string,unknown>).tagline ?? "KLINIKA");
  const ctaText    = String(content.ctaText ?? "Kontaktujte nás");
  const ctaHref    = String(content.ctaHref ?? "/kontakt");
  const language   = String((content as Record<string,unknown>).language ?? "CZ");
  const topLinks   = ((content as Record<string,unknown>).topLinks as Array<{ label: string; href: string; dropdown?: boolean }>) ?? [];
  const links      = (content.links as Array<{ label: string; href: string; badge?: string; megaMenu?: boolean }>) ?? [];
  const megaMenu   = (content as Record<string,unknown>).megaMenu as {
    categories?: Array<{ num?: string; label: string; image?: string }>;
    footer?: Array<{ label: string; href: string }>;
  } | undefined;
  const siteMode = String(content.siteMode ?? "multipage");
  const resolve  = (href: string) => resolveNavHref(href, siteMode, tenantSlug, isAdmin);

  const TOP_H  = 100;
  const MAIN_H = 62;
  const NAV_H  = TOP_H + MAIN_H;

  return (
    <>
      <header
        data-template="clinic-03"
        onMouseLeave={() => setMegaOpen(false)}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          backgroundColor: scrolled ? WHITE : "rgba(255,255,255,0.96)",
          backdropFilter: scrolled ? "none" : "blur(12px)",
          WebkitBackdropFilter: scrolled ? "none" : "blur(12px)",
          boxShadow: scrolled ? "0 1px 0 rgba(151,133,95,0.12), 0 4px 20px rgba(0,0,0,0.05)" : "none",
          borderBottom: `1px solid ${scrolled ? `${GOLD}18` : "transparent"}`,
          transition: "box-shadow 0.4s ease, background-color 0.4s ease, border-color 0.4s ease",
          fontFamily: SANS,
        }}
      >
        {/* ─── TOP ROW: [top-links left] [big centered logo] [CTA + lang right] ─── */}
        <div className="c03-toprow" style={{
          height: TOP_H,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 24,
          width: "100%",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 56px)",
        }}>
          {/* Left: secondary text links */}
          <nav className="c03-toplinks" style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(24px, 3.5vw, 56px)",
          }}>
            {topLinks.map((lk, i) => (
              <a key={i} href={resolve(lk.href)} className="c03-toplink" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: SANS,
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: CHARCOAL,
                textDecoration: "none",
                transition: "color 0.25s",
              }}>
                {lk.label}
                {lk.dropdown && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </a>
            ))}
          </nav>

          {/* Center: big logo */}
          <a href={resolve("/")} className="c03-logo" style={{
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}>
            <GenericEditableText
              sectionId={sectionId}
              field="siteName"
              value={siteName}
              tag="span"
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)",
                fontWeight: 500,
                color: CHARCOAL,
                letterSpacing: "0.14em",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            />
            <GenericEditableText
              sectionId={sectionId}
              field="tagline"
              value={tagline}
              tag="span"
              style={{
                fontFamily: SANS,
                fontSize: "0.78rem",
                fontWeight: 500,
                color: CHARCOAL,
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                lineHeight: 1,
                paddingLeft: "0.5em",
              }}
            />
          </a>

          {/* Right: gold CTA + language + burger */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 24 }}>
            <a
              href={resolve(ctaHref)}
              className="c03-cta-btn"
              style={{
                fontFamily: SANS,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: WHITE,
                textDecoration: "none",
                backgroundColor: GOLD,
                padding: "16px 32px",
                transition: "background-color 0.3s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = GOLD_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = GOLD)}
            >
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingLeft: 20,
              borderLeft: `1px solid ${GOLD}30`,
              fontFamily: SANS,
              fontSize: "0.85rem",
              fontWeight: 500,
              color: CHARCOAL,
            }} className="c03-lang">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CHARCOAL} strokeWidth="1.5" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {language}
            </div>

            {/* Mobile hamburger */}
            <button
              className="c03-burger"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                display: "none",
                flexDirection: "column",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
              }}
              aria-label="Menu"
            >
              <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: CHARCOAL, transition: "transform 0.25s, opacity 0.25s", transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
              <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: CHARCOAL, transition: "opacity 0.2s", opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 24, height: 1.5, backgroundColor: CHARCOAL, transition: "transform 0.25s, opacity 0.25s", transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* ─── MAIN ROW: centered primary nav + search ─── */}
        <div className="c03-mainrow" style={{
          height: MAIN_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: `1px solid ${GOLD}18`,
          position: "relative",
        }}>
          <nav className="c03-nav-center" style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(28px, 4vw, 68px)",
          }}>
            {links.map((lk, i) => {
              const isMega = !!lk.megaMenu && !!megaMenu?.categories?.length;
              const isAkce = lk.badge === "sale";
              return (
                <a
                  key={i}
                  href={resolve(lk.href)}
                  className="c03-navlink"
                  onMouseEnter={() => setMegaOpen(isMega)}
                  onFocus={() => setMegaOpen(isMega)}
                  style={{
                    fontFamily: SANS,
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: CHARCOAL,
                    textDecoration: "none",
                    position: "relative",
                    padding: "6px 0",
                    transition: "color 0.3s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isAkce && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={GOLD} aria-hidden style={{ flexShrink: 0 }}>
                      <path d="M12 2 L14 6 L18 4 L17 8 L21 10 L17 12 L18 16 L14 14 L12 18 L10 14 L6 16 L7 12 L3 10 L7 8 L6 4 L10 6 Z" />
                      <text x="12" y="13" textAnchor="middle" fontSize="4.5" fill={WHITE} fontWeight="700" fontFamily="sans-serif">%</text>
                    </svg>
                  )}
                  {lk.label}
                  {isMega && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transition: "transform 0.3s", transform: megaOpen ? "rotate(180deg)" : "none" }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Search icon at far right of main row */}
          <button aria-label="Vyhledávání" className="c03-search" style={{
            position: "absolute",
            right: "clamp(20px, 4vw, 56px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            color: CHARCOAL,
            transition: "color 0.25s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={e => (e.currentTarget.style.color = CHARCOAL)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        {/* ─── MEGA-MENU PANEL — 3×3 grid, non-clickable category tiles ─── */}
        {megaMenu?.categories?.length && (
          <div
            className="c03-mega"
            style={{
              maxHeight: megaOpen ? 560 : 0,
              overflow: "hidden",
              backgroundColor: WHITE,
              borderTop: megaOpen ? `1px solid ${GOLD}22` : "1px solid transparent",
              transition: "max-height 0.35s ease, border-color 0.35s ease",
            }}
          >
            <div style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "44px clamp(20px, 4vw, 56px) 24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              rowGap: 30,
              columnGap: 60,
            }}>
              {megaMenu.categories.map((cat, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  cursor: "default",
                }}>
                  {cat.image && (
                    <div style={{
                      width: 66, height: 66, borderRadius: "50%",
                      overflow: "hidden", flexShrink: 0,
                      backgroundColor: `${GOLD}12`,
                    }}>
                      <img src={cat.image} alt="" width={66} height={66}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  {cat.num && (
                    <span style={{
                      fontFamily: SANS,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: MUTED,
                      letterSpacing: "0.05em",
                      minWidth: "1.5rem",
                    }}>{cat.num}</span>
                  )}
                  <span style={{
                    fontFamily: SANS,
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    color: CHARCOAL,
                    letterSpacing: "0.01em",
                  }}>{cat.label}</span>
                </div>
              ))}
            </div>

            {/* Footer strip */}
            {megaMenu.footer?.length && (
              <div style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "18px clamp(20px, 4vw, 56px) 28px",
                borderTop: `1px solid ${GOLD}20`,
                display: "flex",
                gap: 44,
              }}>
                {megaMenu.footer.map((lk, i) => (
                  <a key={i} href={resolve(lk.href)} style={{
                    fontFamily: SANS,
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: GOLD,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "color 0.25s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = GOLD_HOVER)}
                  onMouseLeave={e => (e.currentTarget.style.color = GOLD)}
                  >
                    {lk.label} <span aria-hidden>→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            backgroundColor: CREAM,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "c03overlayIn 0.35s cubic-bezier(.16,1,.3,1)",
          }}
        >
          {/* Close button top-right */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute",
              top: 22, right: 24,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
            }}
            aria-label="Zavřít"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke={CHARCOAL} strokeWidth="1.5" fill="none" aria-hidden>
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>

          {/* Diamond monogram */}
          <svg width="32" height="32" viewBox="0 0 30 30" style={{ marginBottom: 32, opacity: 0.4 }} aria-hidden>
            <path d="M15 2 L28 15 L15 28 L2 15 Z" fill="none" stroke={GOLD} strokeWidth="1.2" />
            <path d="M15 11 L19 15 L15 19 L11 15 Z" fill={GOLD} />
          </svg>

          <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, maxHeight: "60vh", overflowY: "auto" }}>
            {/* Primary links (main nav) */}
            {links.map((lk, i) => (
              <a
                key={`p-${i}`}
                href={resolve(lk.href)}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: SANS,
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: CHARCOAL,
                  textDecoration: "none",
                  padding: "12px 24px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = CHARCOAL)}
              >
                {lk.label}
              </a>
            ))}

            {/* Separator */}
            {topLinks.length > 0 && (
              <div style={{ width: 40, height: 1, backgroundColor: `${GOLD}40`, margin: "16px 0" }} />
            )}

            {/* Secondary links (top row) */}
            {topLinks.map((lk, i) => (
              <a
                key={`s-${i}`}
                href={resolve(lk.href)}
                onClick={() => setMobileOpen(false)}
                style={{
                  fontFamily: SANS,
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: MUTED,
                  textDecoration: "none",
                  padding: "8px 24px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
              >
                {lk.label}
              </a>
            ))}
          </nav>

          {/* CTA + language at bottom */}
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <a
              href={resolve(ctaHref)}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: SANS, fontSize: "0.85rem", fontWeight: 500,
                color: WHITE, textDecoration: "none",
                backgroundColor: GOLD, padding: "16px 40px",
              }}
            >
              {ctaText}
            </a>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: SANS, fontSize: "0.78rem", color: CHARCOAL, fontWeight: 500,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CHARCOAL} strokeWidth="1.5" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {language}
            </div>
          </div>
        </div>
      )}

      {/* Spacer — fixed to combined height so layout doesn't jump on scroll */}
      <div style={{ height: TOP_H + MAIN_H }} className="c03-spacer" />

      {/* CSS moved to globals.css — clinic-03 skin section */}
    </>
  );
}
