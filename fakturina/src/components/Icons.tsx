// Premium custom SVG icons — duotone on gradient backgrounds
// Designed specifically for invoicing context (not generic SaaS)

type FrameProps = { g: [string, string]; children: React.ReactNode; size?: number };

function Frame({ g, children, size = 56 }: FrameProps) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 15,
      background: `linear-gradient(140deg, ${g[0]} 0%, ${g[1]} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: `0 6px 20px ${g[0]}44`,
    }}>
      {children}
    </div>
  );
}

/* ── For Who ─────────────────────────────────────────────────────────────── */

export function IconReceipt() {
  return (
    <Frame g={["#4F33E5", "#7c3aed"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Document */}
        <path d="M7 3h10l4 4v15l-2.5-1.8L16 22l-2.5-1.8L11 22 8.5 20.2 6 22V7l1-4z"
          fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
        {/* Fold */}
        <path d="M17 3v4h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        {/* Lines */}
        <line x1="10" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="13" x2="15" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        {/* Price row */}
        <line x1="10" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <rect x="15.5" y="14.5" width="4" height="3" rx="1.2" fill="rgba(255,255,255,0.35)"/>
      </svg>
    </Frame>
  );
}

export function IconBuilding() {
  return (
    <Frame g={["#0369a1", "#0ea5e9"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Taller right building */}
        <rect x="15" y="4" width="9" height="20" rx="1.5" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.3"/>
        {/* Shorter left building */}
        <rect x="4" y="9" width="9" height="15" rx="1.5" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.3"/>
        {/* Windows right */}
        <rect x="17" y="7" width="2" height="2.5" rx="0.6" fill="white" opacity="0.7"/>
        <rect x="20" y="7" width="2" height="2.5" rx="0.6" fill="white" opacity="0.7"/>
        <rect x="17" y="12" width="2" height="2.5" rx="0.6" fill="white" opacity="0.5"/>
        <rect x="20" y="12" width="2" height="2.5" rx="0.6" fill="white" opacity="0.5"/>
        <rect x="17" y="17" width="2" height="2.5" rx="0.6" fill="white" opacity="0.4"/>
        <rect x="20" y="17" width="2" height="2.5" rx="0.6" fill="white" opacity="0.4"/>
        {/* Windows left */}
        <rect x="6" y="12" width="2" height="2.5" rx="0.6" fill="white" opacity="0.6"/>
        <rect x="9.5" y="12" width="2" height="2.5" rx="0.6" fill="white" opacity="0.6"/>
        {/* Door */}
        <rect x="10.5" y="19.5" width="2.5" height="4.5" rx="0.6" fill="white" opacity="0.5"/>
        {/* Ground */}
        <line x1="3" y1="24" x2="25" y2="24" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      </svg>
    </Frame>
  );
}

export function IconPen() {
  return (
    <Frame g={["#0891b2", "#06b6d4"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Pen body */}
        <path d="M18 4l6 6-12 12-7 2 2-7L18 4z"
          fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
        {/* Nib tip */}
        <path d="M6 22l2.5-1 1 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
        {/* Shine on barrel */}
        <line x1="19.5" y1="5.5" x2="23.5" y2="9.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.5"/>
        {/* Groove */}
        <line x1="8" y1="20" x2="20" y2="8" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        {/* Ink dot */}
        <circle cx="8" cy="20" r="1.2" fill="white" opacity="0.9"/>
      </svg>
    </Frame>
  );
}

export function IconNetwork() {
  return (
    <Frame g={["#6d28d9", "#a855f7"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Center node */}
        <circle cx="14" cy="14" r="3.5" fill="white"/>
        {/* Outer nodes */}
        <circle cx="6"  cy="7"  r="2.8" fill="rgba(255,255,255,0.7)"/>
        <circle cx="22" cy="7"  r="2.8" fill="rgba(255,255,255,0.7)"/>
        <circle cx="6"  cy="21" r="2.8" fill="rgba(255,255,255,0.55)"/>
        <circle cx="22" cy="21" r="2.8" fill="rgba(255,255,255,0.55)"/>
        {/* Connectors */}
        <line x1="8.4" y1="8.8"  x2="11.5" y2="12"   stroke="white" strokeWidth="1.3" opacity="0.6"/>
        <line x1="19.6" y1="8.8" x2="16.5" y2="12"   stroke="white" strokeWidth="1.3" opacity="0.6"/>
        <line x1="8.4" y1="19.2" x2="11.5" y2="16"   stroke="white" strokeWidth="1.3" opacity="0.45"/>
        <line x1="19.6" y1="19.2" x2="16.5" y2="16"  stroke="white" strokeWidth="1.3" opacity="0.45"/>
      </svg>
    </Frame>
  );
}

export function IconChart() {
  return (
    <Frame g={["#059669", "#10b981"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Bars */}
        <rect x="4"  y="16" width="4.5" height="8" rx="1.2" fill="rgba(255,255,255,0.45)"/>
        <rect x="10" y="11" width="4.5" height="13" rx="1.2" fill="rgba(255,255,255,0.65)"/>
        <rect x="16" y="7"  width="4.5" height="17" rx="1.2" fill="rgba(255,255,255,0.85)"/>
        {/* Arrow */}
        <path d="M22 4l2 2-2 2M24 6H16" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Axis */}
        <path d="M3 25h22" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      </svg>
    </Frame>
  );
}

export function IconBag() {
  return (
    <Frame g={["#b45309", "#f59e0b"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Bag body */}
        <path d="M6 11h16l-2 13H8L6 11z"
          fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
        {/* Handle */}
        <path d="M10 11V9a4 4 0 0 1 8 0v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Tag */}
        <circle cx="20" cy="8" r="2" fill="white" opacity="0.6"/>
        <line x1="20" y1="10" x2="20" y2="13" stroke="white" strokeWidth="1.1" opacity="0.5"/>
        {/* Stripe on bag */}
        <line x1="11" y1="17" x2="17" y2="17" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      </svg>
    </Frame>
  );
}

/* ── Benefits ─────────────────────────────────────────────────────────────── */

export function IconTimer() {
  return (
    <Frame g={["#4F33E5", "#7c3aed"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Clock ring */}
        <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
        {/* Crown */}
        <path d="M11 5h6M14 3v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Hands */}
        <line x1="14" y1="15" x2="14" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="15" x2="19" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        {/* Center dot */}
        <circle cx="14" cy="15" r="1.5" fill="white"/>
        {/* Lightning */}
        <path d="M21 3l-3 5h2l-3 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75"/>
      </svg>
    </Frame>
  );
}

export function IconShield() {
  return (
    <Frame g={["#0369a1", "#0ea5e9"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Shield */}
        <path d="M14 3l9 4v7c0 5.5-4 9.5-9 11C9 23.5 5 19.5 5 14V7l9-4z"
          fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
        {/* Checkmark */}
        <path d="M9.5 14l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Czech stripe detail */}
        <path d="M5 12h4" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
        <path d="M19 12h4" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.4"/>
      </svg>
    </Frame>
  );
}

export function IconQR() {
  return (
    <Frame g={["#16a34a", "#22c55e"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Phone */}
        <rect x="4" y="4" width="12" height="20" rx="2.5" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.3"/>
        <line x1="7" y1="21" x2="13" y2="21" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
        {/* QR on phone screen */}
        <rect x="6.5" y="7" width="3" height="3" rx="0.7" fill="white" opacity="0.8"/>
        <rect x="10.5" y="7" width="3" height="3" rx="0.7" fill="white" opacity="0.5"/>
        <rect x="6.5" y="11" width="3" height="3" rx="0.7" fill="white" opacity="0.5"/>
        <rect x="10.5" y="11" width="1.2" height="1.2" rx="0.3" fill="white" opacity="0.7"/>
        <rect x="12.3" y="11" width="1.2" height="1.2" rx="0.3" fill="white" opacity="0.7"/>
        <rect x="10.5" y="12.8" width="1.2" height="1.2" rx="0.3" fill="white" opacity="0.7"/>
        {/* Scan beam */}
        <path d="M17 13h4M21 9v9" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
        <line x1="19" y1="18" x2="25" y2="18" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.45"/>
      </svg>
    </Frame>
  );
}

export function IconDatabase() {
  return (
    <Frame g={["#0369a1", "#0ea5e9"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* DB cylinders */}
        <ellipse cx="13" cy="7" rx="8" ry="3" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.3"/>
        <path d="M5 7v5c0 1.66 3.58 3 8 3s8-1.34 8-3V7" stroke="white" strokeWidth="1.3"/>
        <path d="M5 12v5c0 1.66 3.58 3 8 3" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        <ellipse cx="13" cy="12" rx="8" ry="3" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="1.1" opacity="0.5"/>
        {/* Magnifier */}
        <circle cx="21" cy="21" r="4.5" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
        <line x1="24.5" y1="24.5" x2="27" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="19" y1="21" x2="23" y2="21" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="21" y1="19" x2="21" y2="23" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      </svg>
    </Frame>
  );
}

export function IconBell() {
  return (
    <Frame g={["#4F33E5", "#7c3aed"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Bell body */}
        <path d="M14 3a7 7 0 0 1 7 7v5l2 3H5l2-3V10a7 7 0 0 1 7-7z"
          fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
        {/* Clapper */}
        <path d="M11 18a3 3 0 0 0 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Sound waves */}
        <path d="M21 7a9 9 0 0 1 2 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"/>
        <path d="M7 7A9 9 0 0 0 5 13" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"/>
        <path d="M23 4a13 13 0 0 1 2.5 8" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.3"/>
        <path d="M5 4A13 13 0 0 0 2.5 12" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.3"/>
        {/* Dot */}
        <circle cx="14" cy="3" r="1.5" fill="white"/>
      </svg>
    </Frame>
  );
}

export function IconCalLoop() {
  return (
    <Frame g={["#16a34a", "#22c55e"]}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Calendar */}
        <rect x="3" y="7" width="18" height="16" rx="2" fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="1.4"/>
        {/* Header bar */}
        <rect x="3" y="7" width="18" height="5" rx="2" fill="rgba(255,255,255,0.25)"/>
        {/* Pegs */}
        <line x1="8" y1="4" x2="8" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="16" y1="4" x2="16" y2="9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Grid dots */}
        <circle cx="7.5" cy="16" r="1.1" fill="white" opacity="0.7"/>
        <circle cx="12" cy="16" r="1.1" fill="white" opacity="0.7"/>
        <circle cx="7.5" cy="20" r="1.1" fill="white" opacity="0.5"/>
        <circle cx="12" cy="20" r="1.1" fill="white" opacity="0.5"/>
        {/* Loop arrow */}
        <path d="M22 14c2 0 4 1.8 4 4s-1.8 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M22 22v-4h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Frame>
  );
}
