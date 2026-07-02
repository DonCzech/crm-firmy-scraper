"use client";

import { useState } from "react";
import Link from "next/link";
import { MousePointer, Zap, ShieldCheck } from "lucide-react";

const YT_ID = "xlUXJ3Mt7lU";

const FEATURES = [
  { icon: MousePointer, label: "na pár kliknutí" },
  { icon: Zap,          label: "bez starostí"    },
  { icon: ShieldCheck,  label: "bezpečně"        },
];

/* ── MacBook Pro 2026 — Silver ────────────────────────────────────────────── */
function MacBook({ children }: { children: React.ReactNode }) {
  // Silver MBP 16" proportions
  const LW  = 600;        // lid outer width
  const LH  = 382;        // lid outer height  (16:10 screen + bezels)
  const BEZ = 9;          // ultra-thin top/side bezel
  const BBZ = 7;          // bottom bezel
  const NW  = 80;         // notch width
  const NH  = 12;         // notch height
  const BW  = LW + 52;    // base slightly wider than lid
  const BH  = 22;         // base height

  // Silver — bright aluminium with realistic sheen
  const BODY    = "linear-gradient(160deg,#f4f4f4 0%,#e2e2e2 40%,#d4d4d4 100%)";
  const BASE_BG = "linear-gradient(180deg,#dcdcdc 0%,#c8c8c8 100%)";

  return (
    <div style={{ position:"relative", width: BW, flexShrink:0 }}>

      {/* ── Lid ── */}
      <div style={{
        width: LW,
        height: LH,
        margin: "0 auto",
        background: BODY,
        borderRadius: 16,
        padding: `${BEZ + NH}px ${BEZ}px ${BBZ}px`,
        boxShadow:
          "0 1.5px 0 rgba(255,255,255,0.9) inset," +
          "0 -1px 0 rgba(0,0,0,0.18) inset," +
          "0 0 0 0.5px rgba(0,0,0,0.1) inset," +
          "0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.14)",
        position: "relative",
        boxSizing: "border-box",
      }}>

        {/* Notch — same color as lid body */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: NW,
          height: BEZ + NH + 1,
          background: BODY,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          zIndex: 3,
        }}/>

        {/* Camera */}
        <div style={{
          position: "absolute",
          top: Math.floor((BEZ + NH) / 2) - 3,
          left: "50%",
          transform: "translateX(-50%)",
          width: 6, height: 6,
          borderRadius: "50%",
          background: "#1a1a1a",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
          zIndex: 4,
        }}/>

        {/* Screen — deep black frame + content */}
        <div style={{
          width: "100%",
          height: "100%",
          background: "#050505",
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.05)",
        }}>
          {children}
        </div>
      </div>

      {/* ── Hinge line ── */}
      <div style={{
        width: LW - 32,
        height: 1,
        margin: "0 auto",
        background: "linear-gradient(90deg,transparent,rgba(0,0,0,0.12) 30%,rgba(0,0,0,0.12) 70%,transparent)",
      }}/>

      {/* ── Base ── */}
      <div style={{
        width: BW,
        height: BH,
        background: BASE_BG,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        boxShadow:
          "0 1.5px 0 rgba(255,255,255,0.8) inset," +
          "0 12px 32px rgba(0,0,0,0.18)",
        position: "relative",
      }}>
        {/* MagSafe notch centre-bottom */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 48, height: 4,
          background: "rgba(0,0,0,0.08)",
          borderRadius: "4px 4px 0 0",
        }}/>
        {/* Speaker grilles */}
        {(["left","right"] as const).map(side => (
          <div key={side} style={{
            position:"absolute",
            [side]: 32,
            top:"50%",
            transform:"translateY(-50%)",
            display:"flex", gap:3,
          }}>
            {[...Array(8)].map((_,i) => (
              <div key={i} style={{
                width: 2.5, height: 9,
                borderRadius: 2,
                background: "rgba(0,0,0,0.18)",
              }}/>
            ))}
          </div>
        ))}
      </div>

      {/* Ground shadow */}
      <div style={{
        width: BW * 0.7,
        height: 14,
        margin: "3px auto 0",
        background: "radial-gradient(ellipse,rgba(0,0,0,0.15) 0%,transparent 72%)",
        borderRadius: "50%",
      }}/>
    </div>
  );
}

/* ── YouTube player s thumbnail + play button ─────────────────────────────── */
function YouTubeScreen() {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://img.youtube.com/vi/${YT_ID}/maxresdefault.jpg`;

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#000", cursor:"pointer" }}
      onClick={() => setPlaying(true)}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1`}
          allow="autoplay; fullscreen"
          style={{ width:"100%", height:"100%", border:"none", display:"block" }}
        />
      ) : (
        <>
          {/* Thumbnail */}
          <img
            src={thumb}
            alt="Demo video"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />
          {/* Dark overlay */}
          <div style={{
            position:"absolute", inset:0,
            background:"rgba(0,0,0,0.28)",
          }}/>
          {/* Play button */}
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:68, height:68,
            borderRadius:"50%",
            background:"rgba(255,255,255,0.92)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
            transition:"transform .15s, background .15s",
          }}>
            {/* Triangle */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M6 4l14 8-14 8V4z" fill="#1a1a1a"/>
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
export default function HeroSlider() {
  return (
    <section className="bg-white">
      {/* ── Mobile hero ── */}
      <div className="md:hidden px-5 pt-10 pb-8">
        <h1 className="font-black text-[#0A0A0B] leading-[1.05] text-[40px] mb-4">
          Fakturujte<br />komfortně
        </h1>
        <p className="mb-7 text-[16px]" style={{ color: "#475569" }}>
          Stejně jako dalších 300&nbsp;000 podnikatelů v&nbsp;ČR.
        </p>

        {/* Feature icons */}
        <div className="flex items-start gap-5 mb-8">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center flex-1">
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "#EEF2FF",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={20} style={{ color: "#4F33E5" }} />
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/register"
          className="flex items-center justify-center w-full mb-5"
          style={{
            background: "#22C55E", color: "#fff", fontWeight: 800,
            borderRadius: 9999, fontSize: 16, padding: "16px 24px",
            textDecoration: "none",
          }}
        >
          Vyzkoušet zdarma
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <span style={{ fontWeight: 900, fontSize: 17, color: "#0a0a0b" }}>9/10</span>
          <div style={{ display: "flex", gap: 3 }}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24">
                <path fill="#FACC15" opacity={i === 5 ? 0.38 : 1}
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8" }}>Hodnocení 3&nbsp;285 zákazníků</p>
        </div>

        {/* Scaled MacBook preview */}
        <div className="mt-8 overflow-hidden rounded-xl" style={{ transform: "scale(0.56)", transformOrigin: "top left", width: "179%" }}>
          <MacBook>
            <YouTubeScreen />
          </MacBook>
        </div>
      </div>

      {/* ── Desktop hero ── */}
      <div
        className="hidden md:flex mx-auto px-10 items-center justify-between gap-12"
        style={{ maxWidth: 1300, padding: "72px 40px 88px" }}
      >
        {/* LEFT */}
        <div style={{ width: "40%", flexShrink: 0 }}>
          <h1
            className="font-black text-[#0A0A0B] leading-[1.05] mb-5"
            style={{ fontSize: "clamp(42px, 3.6vw, 62px)" }}
          >
            Fakturujte<br />komfortně
          </h1>
          <p className="mb-8" style={{ fontSize: 18, color: "#475569" }}>
            Stejně jako dalších 300&nbsp;000 podnikatelů v&nbsp;ČR.
          </p>

          <div className="flex items-start gap-8 mb-10">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "#EEF2FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={22} style={{ color: "#4F33E5" }} />
                </div>
                <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <Link
              href="/register"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "#22C55E", color: "#fff", fontWeight: 800,
                borderRadius: 9999, fontSize: 16, padding: "14px 34px",
                textDecoration: "none",
              }}
            >
              Vyzkoušet zdarma
            </Link>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: "#0a0a0b" }}>9/10</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24">
                      <path fill="#FACC15" opacity={i === 5 ? 0.38 : 1}
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Hodnocení 3&nbsp;285 zákazníků</p>
            </div>
          </div>
        </div>

        {/* RIGHT — MacBook Pro */}
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <MacBook>
            <YouTubeScreen />
          </MacBook>
        </div>
      </div>
    </section>
  );
}
