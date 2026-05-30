"use client";
import { useState, useEffect } from "react";
import { useContent } from "@/context/ContentContext";
import { NavItem } from "@/lib/content-types";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";

export default function Header() {
  const { content, admin } = useContent();
  const { navItems, logoHref, signInHref } = content.header;
  const siteName = content.siteSettings?.metaTitle || "Demo web";
  const adminBarH = admin.isAdmin ? 26 : 0;

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
        {/* Logo */}
        <a href={logoHref} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <EditableImg
            section="siteSettings"
            field="logoUrl"
            alt={siteName}
            className="site-logo"
            style={{ height: scrolled ? "56px" : "72px", width: "auto", maxWidth: "168px", objectFit: "contain", transition: "height 0.3s ease" }}
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
                href={link.href}
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
                      href={item.href}
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

        {/* Sign In + Mobile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href={signInHref} className="btn-primary" style={{ padding: "8px 24px", fontSize: "13px" }}>
            Přihlášení
          </a>
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
              href={link.href}
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
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .hidden-mobile-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        @media (max-width: 640px) {
          .site-header {
            height: 76px !important;
          }
          .site-logo {
            height: 48px !important;
            max-width: 76px !important;
          }
          .site-header .btn-primary {
            padding: 6px 14px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </header>
  );
}
