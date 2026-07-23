"use client";
import { useState, useEffect } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { NavItem } from "@/astera/lib/content-types";
import { addLangPrefix, localizeHref } from "@/astera/lib/i18n";
import EditableText from "./admin/EditableText";
import OptimizedImage from "@/astera/components/OptimizedImage";
import LanguageSwitcher from "@/astera/components/LanguageSwitcher";
import MoonWidget from "@/astera/components/MoonWidget";

export default function Header() {
  const { content, admin, currentLang } = useContent();
  const { navItems } = content.header;
  // Use the active language from context (respects Venom's injected lang) rather
  // than detecting it from the pathname — under /demo/<slug> the path carries no
  // language prefix, so detectLang(pathname) would always fall back to "cs".
  const logoHref = addLangPrefix("/", currentLang);
  const logoUrl = content.siteSettings?.logoUrl || "/images/astera-logo.png";
  const mobileLogoUrl = content.siteSettings?.mobileLogoUrl || logoUrl;
  const adminBarH = admin.isAdmin ? 26 : 0;

  const localizeInternalHref = (href: string) => localizeHref(href, currentLang);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 94);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="site-header"
      style={{
        height: scrolled ? "80px" : "102px",
        backgroundColor: "#ffffff",
        boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.08)" : "none",
        transition: "height 0.3s ease, box-shadow 0.3s ease, top 0.2s ease",
        position: "fixed",
        top: adminBarH,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="container-main"
        style={{ display: "flex", alignItems: "center", height: "100%", justifyContent: "space-between" }}
      >
        {/* Moon widget — mobile header left (≤640px only) */}
        <div className="moon-widget-header-mobile">
          <MoonWidget headerHeight={40} />
        </div>

        {/* Logo */}
        <a href={logoHref} className="logo-link" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <OptimizedImage
            className="site-logo"
            src={logoUrl}
            mobileSrc={mobileLogoUrl}
            alt="Astera Light"
            sizes="92px"
            noPlaceholder
            fetchPriority="high"
            style={{ height: scrolled ? "56px" : "72px", width: "auto", maxWidth: "92px", objectFit: "contain", transition: "height 0.3s ease" }}
          />
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0" }} className="hidden-mobile-nav">
          {navItems.map((link: NavItem, i: number) => (
            <div
              key={i}
              style={{ position: "relative" }}
              onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={localizeInternalHref(link.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  height: scrolled ? "80px" : "102px",
                  fontSize: "14px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  color: "#1f1f1f",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  gap: 3,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#7c3bb2")}
                onMouseLeave={e => (e.currentTarget.style.color = "#1f1f1f")}
              >
                <EditableText
                  section="header"
                  field={`navItems.${i}.label`}
                  tag="span"
                />
                {link.dropdown && <span style={{ fontSize: "10px" }}>▾</span>}
              </a>

              {link.dropdown && activeDropdown === link.label && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    borderRadius: "4px",
                    minWidth: "220px",
                    zIndex: 100,
                    padding: "8px 0",
                  }}
                >
                  {link.dropdown.map(item => (
                    <a
                      key={item.label}
                      href={localizeInternalHref(item.href)}
                      style={{
                        display: "block",
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontFamily: "'Poppins', sans-serif",
                        color: "#1f1f1f",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#7c3bb2"; e.currentTarget.style.backgroundColor = "#f9f7f7"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#1f1f1f"; e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

        </nav>

        {/* Right corner: moon widget + mobile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div className="moon-widget-wrap">
            <MoonWidget headerHeight={scrolled ? 80 : 102} />
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: "8px" }}
            className="mobile-toggle"
            aria-label="Menu"
          >
            <span style={{ display: "block", width: "24px", height: "2px", background: "#1f1f1f", margin: "5px 0" }} />
            <span style={{ display: "block", width: "24px", height: "2px", background: "#1f1f1f", margin: "5px 0" }} />
            <span style={{ display: "block", width: "24px", height: "2px", background: "#1f1f1f", margin: "5px 0" }} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div style={{ backgroundColor: "#ffffff", borderTop: "1px solid #eee", padding: "16px 0" }}>
          {navItems.map((link: NavItem) => (
            <a
              key={link.label}
              href={localizeInternalHref(link.href)}
              style={{
                display: "block",
                padding: "12px 30px",
                fontSize: "15px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                color: "#1f1f1f",
                textDecoration: "none",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {link.label}
            </a>
          ))}
          {/* Language switcher + Moon widget — bottom of mobile menu */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "12px", padding: "10px 20px 8px", borderTop: "1px solid #f0f0f0",
          }}>
            <LanguageSwitcher compact />
            <div className="moon-widget-mobile">
              <MoonWidget headerHeight={40} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .hidden-mobile-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          /* Hide top-header moon widget on mobile — it lives in the mobile menu instead */
          .moon-widget-wrap { display: none !important; }
        }
        @media (max-width: 640px) {
          .site-header {
            height: 76px !important;
          }
          .site-logo {
            height: 48px !important;
            max-width: 76px !important;
          }
          .site-header .container-main {
            position: relative;
            justify-content: center !important;
          }
          .site-header .logo-link {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
          .site-header .mobile-toggle {
            position: absolute;
            right: 16px;
          }
        }
        /* Moon widget inside mobile menu — compact, with text */
        .moon-widget-mobile button {
          height: auto !important;
          padding: 6px 0 !important;
          font-size: 13px !important;
        }
        /* Moon widget in mobile header — hidden on desktop */
        .moon-widget-header-mobile {
          display: none;
        }
        @media (max-width: 640px) {
          .moon-widget-header-mobile {
            display: block;
            position: absolute;
            left: 16px;
          }
          .moon-widget-header-mobile button {
            height: auto !important;
            padding: 4px 0 !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </header>
  );
}
