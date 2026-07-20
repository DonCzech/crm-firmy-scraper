"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastData {
  id: number;
  title: string;
  variant?: string;
  price: string;
  image?: string;
  tenantSlug: string;
}

export function CartToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [exiting, setExiting] = useState<Set<number>>(new Set());

  const dismiss = useCallback((id: number) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 350);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d?.title) return;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-2), { ...d, id }]);
      setTimeout(() => dismiss(id), 5000);
    };
    window.addEventListener("webero-cart-item-added", handler);
    return () => window.removeEventListener("webero-cart-item-added", handler);
  }, [dismiss]);

  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes wc-toast-in {
          0% { opacity: 0; transform: translateX(100%) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes wc-toast-out {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(100%) scale(0.95); }
        }
        @keyframes wc-progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .wc-toast-enter { animation: wc-toast-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .wc-toast-exit { animation: wc-toast-out 0.3s ease-in forwards; }
      `}</style>
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 99999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none", maxWidth: 380 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={exiting.has(t.id) ? "wc-toast-exit" : "wc-toast-enter"}
            style={{
              position: "relative",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: 14,
              boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden",
              minWidth: 320,
            }}
          >
            {t.image && (
              <div style={{ width: 82, height: 82, flexShrink: 0, marginLeft: 12, borderRadius: 10, overflow: "hidden", background: "#f5f5f5" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#16a34a", flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Přidáno do košíku
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.title}
              </div>
              {t.variant && (
                <div style={{ fontSize: 12, color: "#737373" }}>{t.variant}</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 2 }}>{t.price}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <a
                  href={`/demo/${t.tenantSlug}/obchod/kosik`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    height: 32, padding: "0 14px", borderRadius: 8,
                    background: "#111", color: "#fff",
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
                >
                  Zobrazit košík
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  style={{
                    height: 32, padding: "0 12px", borderRadius: 8,
                    border: "1px solid #e5e5e5", background: "#fff", color: "#737373",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#999"; e.currentTarget.style.color = "#111"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#737373"; }}
                >
                  Pokračovat
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Zavřít"
              style={{
                position: "absolute", top: 6, right: 6,
                width: 24, height: 24, borderRadius: "50%",
                background: "rgba(0,0,0,0.06)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#999", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.12)"; e.currentTarget.style.color = "#333"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.color = "#999"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, #16a34a, #22c55e)",
              animation: "wc-progress 5s linear forwards",
            }} />
          </div>
        ))}
      </div>
    </>
  );
}
