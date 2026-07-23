"use client";

import { useEffect, useState } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { ServiceItem } from "@/astera/lib/content-types";
import { localizeHref } from "@/astera/lib/i18n";

const purple = "#7c3bb2";
const gold = "#c9a84c";
const goldLight = "#f5e9c8";
const cream = "#fffcf5";
const creamDeep = "#f5ede0";

function OrnamentDivider({ tight = false }: { tight?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: tight ? "14px 0" : "20px 0", color: gold }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold}77)` }} />
      <span style={{ fontSize: 11, letterSpacing: 7, opacity: 0.85 }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold}77)` }} />
    </div>
  );
}

function ServiceModal({ service, onClose }: { service: ServiceItem; onClose: () => void }) {
  const { currentLang } = useContent();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(25, 8, 45, 0.68)",
        backdropFilter: "blur(9px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "18px 16px",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{
        width: "min(100%, 980px)",
        maxHeight: "calc(100vh - 36px)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: `linear-gradient(160deg, ${cream} 0%, #fdf5e8 60%, ${creamDeep} 100%)`,
        borderRadius: 20,
        border: `1px solid ${gold}88`,
        boxShadow: "0 40px 100px rgba(20,8,40,0.55), inset 0 1px 0 rgba(255,255,255,0.9)",
        position: "relative",
        animation: "modalIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
      }} role="dialog" aria-modal="true">
        {(["tl","tr","bl","br"] as const).map(c => (
          <div key={c} aria-hidden style={{
            position: "absolute",
            top: c[0] === "t" ? 10 : undefined, bottom: c[0] === "b" ? 10 : undefined,
            left: c[1] === "l" ? 10 : undefined, right: c[1] === "r" ? 10 : undefined,
            width: 24, height: 24,
            borderTop: c[0] === "t" ? `1px solid ${gold}77` : undefined,
            borderBottom: c[0] === "b" ? `1px solid ${gold}77` : undefined,
            borderLeft: c[1] === "l" ? `1px solid ${gold}77` : undefined,
            borderRight: c[1] === "r" ? `1px solid ${gold}77` : undefined,
            borderRadius: c === "tl" ? "6px 0 0 0" : c === "tr" ? "0 6px 0 0" : c === "bl" ? "0 0 0 6px" : "0 0 6px 0",
            pointerEvents: "none",
          }} />
        ))}

        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          width: 30, height: 30, borderRadius: "50%",
          background: `${goldLight}cc`, border: `1px solid ${gold}66`,
          color: "#5a3a00", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Poppins',sans-serif",
        }}>x</button>

        <div style={{
          padding: "28px 38px 20px", textAlign: "center",
          borderBottom: `1px solid ${gold}44`,
          background: `radial-gradient(ellipse at 50% 0%, ${goldLight}77 0%, transparent 65%)`,
          position: "relative",
        }}>
          <div aria-hidden style={{
            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
            fontSize: 100, lineHeight: 1, color: gold, opacity: 0.055,
            fontFamily: "serif", pointerEvents: "none", userSelect: "none",
          }}>{service.symbol}</div>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 10px",
            background: `linear-gradient(135deg, ${cream} 0%, ${goldLight} 100%)`,
            border: `1.5px solid ${gold}88`, boxShadow: `0 4px 18px ${gold}33`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            position: "relative",
          }}>{service.emoji}</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px, 2.4vw, 25px)", fontWeight: 700, color: "#2a1a00", margin: "0 0 4px", lineHeight: 1.2 }}>{service.title}</h2>
          <OrnamentDivider tight />
          <p style={{ fontSize: 13, lineHeight: 1.58, color: "#4a3728", margin: "0 auto", maxWidth: 760, fontFamily: "'Poppins',sans-serif" }}>{service.lead}</p>
          {service.body && <p style={{ fontSize: 12, lineHeight: 1.5, color: "#6b5a3a", margin: "6px auto 0", maxWidth: 760, fontFamily: "'Poppins',sans-serif", fontStyle: "italic" }}>{service.body}</p>}
        </div>

        <div style={{ padding: "18px 34px 28px" }}>
          {service.sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: i < service.sections.length - 1 ? 12 : 0 }}>
              {sec.heading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: gold, fontSize: 9 }}>◆</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, fontStyle: "italic", color: "#5a3a00" }}>{sec.heading}</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${gold}55, transparent)` }} />
                </div>
              )}
              {sec.twoCol && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }} className="home-modal-twocol">
                  {sec.twoCol.map((col, j) => (
                    <div key={j} style={{ background: `linear-gradient(135deg, ${cream} 0%, ${goldLight}44 100%)`, borderRadius: 10, padding: "10px 12px", border: `1px solid ${gold}44` }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "#5a3a00", marginBottom: 5 }}>{col.label}</div>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, lineHeight: 1.6, color: "#4a3728" }}>{col.text}</div>
                    </div>
                  ))}
                </div>
              )}
              {sec.paragraphs?.map((p, j) => <p key={j} style={{ margin: "0 0 6px", fontFamily: "'Poppins',sans-serif", fontSize: 12, lineHeight: 1.55, color: "#4a3728" }}>{p}</p>)}
              {sec.list && (
                <ul style={{ margin: "0 0 8px", paddingLeft: 0, listStyle: "none" }}>
                  {sec.list.map((item, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, fontFamily: "'Poppins',sans-serif", fontSize: 12, color: "#4a3728", lineHeight: 1.45 }}>
                      <span style={{ color: gold, marginTop: 4, flexShrink: 0, fontSize: 8 }}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {sec.rows && (
                <div>
                  {sec.rows.map((row, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "6px 11px", borderRadius: 8, flexWrap: "wrap", background: j % 2 === 0 ? `linear-gradient(90deg, ${cream}, ${goldLight}44)` : "#fff", border: `1px solid ${gold}33`, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#4a3728", fontFamily: "'Poppins',sans-serif" }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#5a3a00", fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap" }}>{row.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <OrnamentDivider tight />
          <a href={localizeHref(service.cta.href, currentLang)} style={{ display: "block", textAlign: "center", background: `linear-gradient(135deg, ${purple} 0%, #5f2a8d 100%)`, color: "#fff", borderRadius: 999, padding: "11px 28px", fontSize: 13, fontWeight: 600, fontFamily: "'Poppins',sans-serif", textDecoration: "none", letterSpacing: 0.3, boxShadow: `0 4px 18px ${purple}44` }}>{service.cta.label}</a>
        </div>
      </div>
    </div>
  );
}

export default function HomeServices() {
  const { content } = useContent();
  const serviceContent = content.servicesContent;
  const serviceItems = serviceContent?.items || [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeService = serviceItems.find(service => service.id === activeId);

  return (
    <section style={{ background: "#ffffff", padding: "64px 0 72px" }}>
      <div className="container-main">
        <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 38px" }}>
          <div style={{ color: gold, fontSize: 18, letterSpacing: 8, marginBottom: 12 }}>{serviceContent.homeEyebrow}</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 3vw, 34px)",
            lineHeight: 1.18,
            margin: "0 0 12px",
            color: "#1f1f1f",
          }}>
            {serviceContent.homeTitle}
          </h2>
          <p style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            color: "#8b7a91",
            margin: 0,
            letterSpacing: "0.06em",
          }}>
            {serviceContent.homeSubtitle}
          </p>
        </div>

        <div className="home-services-grid">
          {serviceItems.map((service) => (
            <button type="button" onClick={() => setActiveId(service.id)} className="home-service-card" key={service.id}>
              <span className="home-service-symbol" aria-hidden>{service.symbol}</span>
              <span className="home-service-icon" style={{ borderColor: `${service.color}55`, background: `${service.color}12` }}>
                {service.emoji}
              </span>
              <span className="home-service-title">{service.title}</span>
              <span className="home-service-text">{service.teaser}</span>
              <span className="home-service-link">{serviceContent.homeCardLinkText}</span>
            </button>
          ))}
        </div>
      </div>
      {activeService && <ServiceModal service={activeService} onClose={() => setActiveId(null)} />}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .home-services-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .home-service-card {
          position: relative;
          min-height: 258px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 26px 24px 24px;
          border: 1px solid #ece4f2;
          border-radius: 8px;
          background: linear-gradient(180deg, #fff 0%, #fbf8fd 100%);
          box-shadow: 0 14px 32px rgba(82, 56, 104, 0.07);
          color: #1f1f1f;
          text-align: left;
          font: inherit;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .home-service-card:hover {
          transform: translateY(-3px);
          border-color: rgba(124, 59, 178, 0.28);
          box-shadow: 0 18px 40px rgba(82, 56, 104, 0.11);
        }
        .home-service-symbol {
          position: absolute;
          right: 18px;
          top: 12px;
          font-family: serif;
          font-size: 64px;
          line-height: 1;
          color: rgba(124, 59, 178, 0.06);
          pointer-events: none;
        }
        .home-service-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 18px;
        }
        .home-service-title {
          min-height: 46px;
          display: flex;
          align-items: center;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          line-height: 1.18;
          font-weight: 700;
          color: #221629;
          margin-bottom: 10px;
        }
        .home-service-text {
          flex: 1;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          line-height: 1.62;
          color: #65596c;
          margin-bottom: 18px;
        }
        .home-service-link {
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${purple};
        }
        @media (max-width: 920px) {
          .home-services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .home-services-grid { grid-template-columns: 1fr; }
          .home-service-card { min-height: auto; }
          .home-service-title { min-height: auto; }
          .home-modal-twocol { grid-template-columns: 1fr !important; }
          [role="dialog"] {
            align-self: flex-start;
            margin-top: 0;
            max-height: calc(100dvh - 28px) !important;
          }
        }
      `}</style>
    </section>
  );
}
