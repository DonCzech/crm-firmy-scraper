"use client";

export function HeurekaWidget({ shopId }: { shopId?: string }) {
  if (!shopId) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 100,
      width: 100, textAlign: "center",
    }}>
      <a
        href={`https://obchody.heureka.cz/overeno/info/${shopId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <div style={{
          width: 80, height: 80, margin: "0 auto",
          background: "#fff", borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 8, transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="#E6F9E6" stroke="#00A651" strokeWidth="2" />
            <path d="M14 24l7 7 13-14" stroke="#00A651" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#00A651", marginTop: 4, lineHeight: 1.1 }}>
            Ověřeno<br/>zákazníky
          </span>
        </div>
      </a>
    </div>
  );
}
