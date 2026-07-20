"use client";

import { useEffect, useState } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    const saved = localStorage.getItem("webero_cookie_consent");
    if (!saved) {
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function accept(all: boolean) {
    const consent = { necessary: true, analytics: all || prefs.analytics, marketing: all || prefs.marketing, ts: Date.now() };
    localStorage.setItem("webero_cookie_consent", JSON.stringify(consent));
    setShow(false);
  }

  function reject() {
    localStorage.setItem("webero_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false, ts: Date.now() }));
    setShow(false);
  }

  if (!show) return null;

  return (
    <>
      <style>{`
        .wcc-enter { animation: wccSlide 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes wccSlide { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div className="wcc-enter" style={{
        position: "fixed", bottom: 20, left: 20, right: 20, maxWidth: 520, zIndex: 9998,
        background: "#fff", borderRadius: 16, padding: "22px 24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>🍪</span>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#111" }}>Soubory cookies</h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0", lineHeight: 1.5 }}>
              Používáme cookies pro zlepšení Vašeho zážitku z nakupování, analýzu návštěvnosti a personalizaci obsahu.
            </p>
          </div>
        </div>

        {detail && (
          <div style={{ marginBottom: 14, padding: "12px 14px", background: "#f9fafb", borderRadius: 10, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "not-allowed" }}>
              <input type="checkbox" checked disabled style={{ accentColor: "#2563eb" }} />
              <span><strong>Nezbytné</strong> — vždy aktivní</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))} style={{ accentColor: "#2563eb" }} />
              <span><strong>Analytické</strong> — statistiky návštěvnosti</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))} style={{ accentColor: "#2563eb" }} />
              <span><strong>Marketingové</strong> — personalizovaná reklama</span>
            </label>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => accept(true)} style={{
            height: 38, padding: "0 20px", borderRadius: 10, border: "none",
            background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s",
          }}>
            Přijmout vše
          </button>
          <button onClick={() => { if (detail) accept(false); else setDetail(true); }} style={{
            height: 38, padding: "0 20px", borderRadius: 10, border: "1px solid #e5e7eb",
            background: "#fff", color: "#111", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
          }}>
            {detail ? "Uložit nastavení" : "Nastavení"}
          </button>
          <button onClick={reject} style={{
            height: 38, padding: "0 16px", borderRadius: 10, border: "none",
            background: "transparent", color: "#6b7280", fontSize: 13, fontWeight: 500,
            cursor: "pointer",
          }}>
            Odmítnout
          </button>
        </div>
      </div>
    </>
  );
}
