"use client";

import { useState } from "react";

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
}

export function ZasilkovnaWidget({ onSelect }: { onSelect: (point: PickupPoint | null) => void }) {
  const [selected, setSelected] = useState<PickupPoint | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const demoPoints: PickupPoint[] = [
    { id: "1", name: "Zásilkovna - Albert Dejvická", address: "Dejvická 14", city: "Praha 6", zip: "160 00" },
    { id: "2", name: "Zásilkovna - Tesco Letňany", address: "Veselská 663", city: "Praha 9", zip: "199 00" },
    { id: "3", name: "Zásilkovna - Penny Vinohrady", address: "Korunní 33", city: "Praha 2", zip: "120 00" },
    { id: "4", name: "Zásilkovna - Z-BOX Holešovice", address: "U Průhonu 12", city: "Praha 7", zip: "170 00" },
    { id: "5", name: "Zásilkovna - Brno Královo Pole", address: "Palackého tř. 78", city: "Brno", zip: "612 00" },
  ];

  function selectPoint(p: PickupPoint) {
    setSelected(p);
    onSelect(p);
    setShowPicker(false);
  }

  return (
    <div>
      {selected ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0",
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>{selected.name}</div>
            <div style={{ fontSize: 12, color: "#15803d" }}>{selected.address}, {selected.zip} {selected.city}</div>
          </div>
          <button onClick={() => setShowPicker(true)} style={{
            fontSize: 12, fontWeight: 600, color: "#2563eb", background: "none",
            border: "none", cursor: "pointer", textDecoration: "underline",
          }}>
            Změnit
          </button>
        </div>
      ) : (
        <button onClick={() => setShowPicker(true)} style={{
          width: "100%", height: 44, borderRadius: 10,
          border: "1.5px dashed #d1d5db", background: "#fafafa",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.background = "#f5f5f5"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fafafa"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
          </svg>
          Vybrat výdejní místo Zásilkovny
        </button>
      )}

      {showPicker && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowPicker(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 16, width: "min(480px, 90vw)",
            maxHeight: "80vh", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid #f3f4f6",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Vyberte výdejní místo</h3>
              <button onClick={() => setShowPicker(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "#f3f4f6", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "calc(80vh - 60px)" }}>
              {demoPoints.map((p) => (
                <button key={p.id} onClick={() => selectPoint(p)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "14px 20px", border: "none",
                  background: "transparent", cursor: "pointer",
                  textAlign: "left", borderBottom: "1px solid #f9fafb",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{p.address}, {p.zip} {p.city}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
