"use client";
import { useState } from "react";
import { useContent } from "@/context/ContentContext";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Facebook: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  Instagram: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  YouTube: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  Pinterest: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>,
  TikTok: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
  LinkedIn: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
};

export default function Footer() {
  const { content, admin } = useContent();
  const f = content.footer;
  const logoHref = content.header?.logoHref || "/";
  const helpHref = logoHref.startsWith("/demo/") ? `${logoHref}/help` : "/help";
  const siteName = content.siteSettings?.metaTitle || "Demo web";
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Footer signup:", { firstName, email });
  };

  return (
    <footer style={{ backgroundColor: "#f1f6fc" }}>
      {/* Main footer */}
      <div className="container-main" style={{ padding: "90px 50px 40px" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}
          className="footer-grid"
        >
          {/* Left column */}
          <div>
            <a href={logoHref} style={{ display: "inline-block", marginBottom: "28px" }}>
              <EditableImg section="siteSettings" field="logoUrl" alt={siteName} style={{ height: "60px", width: "auto", objectFit: "contain" }} />
            </a>

            <div style={{ marginBottom: "24px" }}>
              <a href={helpHref} onClick={e => { if (admin.isAdmin) e.preventDefault(); }} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1f1f1f", textDecoration: "none", fontFamily: "'Poppins', sans-serif", fontSize: "14px", marginBottom: "12px" }} onMouseEnter={e => (e.currentTarget.style.color = "#7c3bb2")} onMouseLeave={e => (e.currentTarget.style.color = "#1f1f1f")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                <EditableText section="footer" field="helpLabel" fallback="Centrum pomoci" tag="span" />
              </a>
              <button style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1f1f1f", fontFamily: "'Poppins', sans-serif", fontSize: "14px", background: "none", border: "none", cursor: "pointer", padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = "#7c3bb2")} onMouseLeave={e => (e.currentTarget.style.color = "#1f1f1f")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
                <EditableText section="footer" field="contactLabel" fallback="Napište mi" tag="span" />
              </button>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {f.socialLinks.map((social, i) => (
                <a key={i} href={social.href} onClick={e => { if (admin.isAdmin) e.preventDefault(); }} aria-label={social.name} style={{ color: "#1f1f1f", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 6 }} onMouseEnter={e => (e.currentTarget.style.color = "#7c3bb2")} onMouseLeave={e => (e.currentTarget.style.color = "#1f1f1f")} target="_blank" rel="noopener noreferrer">
                  {SOCIAL_ICONS[social.name] || <span>{social.name}</span>}
                  {admin.isAdmin && (
                    <EditableText
                      section="footer"
                      field={`socialLinks.${i}.name`}
                      fallback={social.name}
                      tag="span"
                      style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, fontWeight: 600 }}
                    />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right column — Newsletter */}
          <div className="footer-newsletter">
            <EditableText
              section="footer"
              field="newsletterTitle"
              tag="h2"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 400, lineHeight: "1.4", maxWidth: "300px", marginTop: 0, marginBottom: "24px", color: "#1f1f1f", display: "block" }}
            />

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                <input type="text" placeholder="Jméno" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ flex: "1 1 120px", backgroundColor: "#ffffff", border: "1px solid #dde5f0", borderRadius: "20px", padding: "10px 18px", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none" }} />
                <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: "2 1 180px", backgroundColor: "#ffffff", border: "1px solid #dde5f0", borderRadius: "20px", padding: "10px 18px", fontFamily: "'Poppins', sans-serif", fontSize: "14px", outline: "none" }} />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: "12px 50px" }}>Přihlásit se</button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: "#f1f6fc", borderTop: "1px solid #dde5f0", minHeight: "60px", display: "flex", alignItems: "center" }}>
        <div className="container-main" style={{ padding: "0 50px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", width: "100%" }}>
          <EditableText
            section="footer"
            field="copyright"
            tag="p"
            style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#767676", margin: 0 }}
          />
          <nav style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            {f.footerLinks.map((link, i) => (
              <a key={i} href={link.href} onClick={e => { if (admin.isAdmin) e.preventDefault(); }} style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "#767676", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.color = "#7c3bb2")} onMouseLeave={e => (e.currentTarget.style.color = "#767676")}>
                <EditableText section="footer" field={`footerLinks.${i}.label`} fallback={link.label} tag="span" />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .footer-newsletter { display: block; }
        }
      `}</style>
    </footer>
  );
}
