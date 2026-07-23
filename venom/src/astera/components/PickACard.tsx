"use client";
import Link from "next/link";
import { useState } from "react";
import OptimizedImage from "@/astera/components/OptimizedImage";
import { useContent } from "@/astera/context/ContentContext";
import { localizeHref } from "@/astera/lib/i18n";
import { DEFAULT_CONTENT } from "@/astera/lib/content-types";

type Phase = "idle" | "animating" | "revealed";

export default function PickACard() {
  const { content, currentLang } = useContent();
  const crystalBall = { ...DEFAULT_CONTENT.crystalBall, ...content.crystalBall };
  const answers = crystalBall.answers?.length ? crystalBall.answers : DEFAULT_CONTENT.crystalBall.answers;
  const [phase, setPhase] = useState<Phase>("idle");
  const [answer, setAnswer] = useState<string | null>(null);

  const handleClick = () => {
    if (phase === "animating") return;
    if (phase === "revealed") { setPhase("idle"); setAnswer(null); return; }
    setAnswer(null);
    setPhase("animating");
    setTimeout(() => {
      const pick = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(pick);
      setPhase("revealed");
    }, 1800);
  };

  return (
    <section className={`pac-section pac-section-${phase}`}>
      {/* Top fade separator */}
      <div className="pac-sep pac-sep-top" />

      <div className="container-main">
        <div className="pac-grid">

          {/* LEFT — ball */}
          <div className="pac-ball-col">
            {/* Outer: drop-shadow on hover (separate from mask) */}
            <div
              className={`pac-outer pac-outer-${phase}`}
              onClick={handleClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClick()}
              aria-label={crystalBall.ariaLabel}
            >
              {/* Inner mask: clips the white JPG background */}
              <div className="pac-mask">
                <div className="pac-ring pac-ring-a" aria-hidden="true" />
                <div className="pac-ring pac-ring-b" aria-hidden="true" />
                <OptimizedImage
                  src={crystalBall.image}
                  mobileSrc={crystalBall.mobileImage}
                  alt={crystalBall.eyebrow}
                  className="pac-img"
                  sizes="(max-width: 600px) 98vw, 660px"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* SPACER */}
          <div />

          {/* RIGHT */}
          <div className="pac-right">
            {phase === "idle" && (
              <>
                <span className="pac-line" />
                <h2 className="pac-title">{crystalBall.title}</h2>
                <p className="pac-subtitle">
                  {crystalBall.subtitle}
                </p>
              </>
            )}

            {phase === "animating" && (
              <div className="pac-waiting">
                <span className="pac-dot" /><span className="pac-dot" /><span className="pac-dot" />
              </div>
            )}

            {phase === "revealed" && answer && (
              <div className="pac-result">
                <span className="pac-line" />
                <p className="pac-answer">{answer}</p>
                <p className="pac-consult">
                  {crystalBall.consultLead}{" "}
                  <Link href={localizeHref("/sluzby", currentLang)} className="pac-consult-link">
                    {crystalBall.consultLinkText}
                  </Link>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom fade separator */}
      <div className="pac-sep pac-sep-bot" />

      <style>{`
        /* ── Section ── */
        .pac-section {
          position: relative;
          background:
            radial-gradient(ellipse 70% 90% at 26% 46%, rgba(255,246,230,0.94) 0%, rgba(248,239,255,0.86) 43%, rgba(231,219,249,0.74) 100%),
            radial-gradient(ellipse 80% 70% at 82% 50%, rgba(124,59,178,0.11) 0%, transparent 62%),
            linear-gradient(135deg, #fffaf2 0%, #f4edff 48%, #ebe1fa 100%);
          padding: 80px 0;
          overflow: hidden;
        }
        .pac-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(124,59,178,0.045) 1px, transparent 1px),
            linear-gradient(0deg, rgba(124,59,178,0.035) 1px, transparent 1px);
          background-size: 76px 76px;
          mask-image: radial-gradient(ellipse 65% 75% at 28% 50%, black 0%, transparent 72%);
          pointer-events: none;
        }

        /* Subtle separators — thin purple gradient lines at edges */
        .pac-sep {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%, rgba(124,59,178,0.18) 30%,
            rgba(124,59,178,0.18) 70%, transparent 100%);
        }
        .pac-sep-top { top: 0; }
        .pac-sep-bot { bottom: 0; }

        /* ── Grid ── */
        .pac-grid {
          display: grid;
          grid-template-columns: 5fr 1fr 4fr;
          align-items: center;
        }
        .pac-section-animating .pac-grid {
          grid-template-columns: 1fr;
        }
        .pac-section-animating .pac-grid > :nth-child(2),
        .pac-section-animating .pac-right {
          display: none;
        }
        .pac-section-animating .pac-ball-col {
          justify-content: center;
        }

        /* ── Ball ── */
        .pac-ball-col { display: flex; justify-content: center; }

        /* Outer — carries drop-shadow; separate from mask layer */
        .pac-outer {
          width: min(100%, 645px);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: filter 0.35s ease;
          filter: drop-shadow(0 18px 34px rgba(124,59,178,0.18));
          animation: pac-float 6.4s ease-in-out infinite;
          will-change: transform;
        }
        .pac-outer:hover {
          filter: drop-shadow(0 24px 54px rgba(124,59,178,0.42))
                  drop-shadow(0 0 70px rgba(255,230,188,0.24));
        }
        .pac-outer-animating {
          filter: drop-shadow(0 24px 48px rgba(124,59,178,0.36)) !important;
          animation: pac-divine-lift 1.45s cubic-bezier(.2,.7,.2,1) both;
        }
        .pac-outer-revealed {
          filter: drop-shadow(0 22px 44px rgba(124,59,178,0.34))
                  drop-shadow(0 0 60px rgba(255,230,188,0.2));
        }

        .pac-mask {
          position: relative;
          border-radius: 34px;
          overflow: hidden;
        }
        .pac-ring {
          position: absolute;
          left: 50%;
          top: 48%;
          width: 68%;
          aspect-ratio: 1;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          pointer-events: none;
          z-index: 2;
          will-change: transform, opacity;
        }
        .pac-ring-a {
          border: 1px solid rgba(255,239,210,0.48);
          box-shadow: 0 0 32px rgba(212,177,241,0.18);
        }
        .pac-ring-b {
          width: 84%;
          border: 1px dashed rgba(124,59,178,0.32);
        }
        .pac-outer-animating .pac-ring-a {
          animation: pac-ring-spin 1.45s cubic-bezier(.21,.72,.18,1) both;
        }
        .pac-outer-animating .pac-ring-b {
          animation: pac-ring-spin-reverse 1.45s cubic-bezier(.21,.72,.18,1) both;
        }
        .pac-outer-animating .pac-img {
          animation: pac-ball-focus 1.45s ease-in-out both;
        }
        .pac-outer-animating .pac-mask::after {
          animation: pac-sweep-fast 0.7s ease-in-out 0s 2;
        }
        .pac-mask::after {
          content: "";
          position: absolute;
          inset: 9% 17% 12%;
          background: linear-gradient(112deg, transparent 10%, rgba(255,255,255,0.34) 38%, transparent 55%);
          mix-blend-mode: screen;
          opacity: 0;
          transform: translateX(-74%) skewX(-14deg);
          animation: pac-sweep 5.8s ease-in-out infinite;
          pointer-events: none;
        }

        .pac-img {
          width: 100%;
          height: auto;
          display: block;
          user-select: none;
          filter: saturate(1.06) contrast(1.03);
          will-change: transform, opacity;
        }

        /* ── Right ── */
        .pac-right { color: #1f1f1f; }

        .pac-line {
          display: block;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #7c3bb2, transparent);
          margin-bottom: 18px;
          border-radius: 2px;
        }
        .pac-title {
          font-family: 'Playfair Display', serif;
          color: #1f1f1f;
          font-size: 26px;
          line-height: 1.3;
          margin: 0 0 14px;
        }
        .pac-subtitle {
          font-family: 'Poppins', sans-serif;
          color: #5a4a6b;
          font-size: 15px;
          line-height: 1.75;
          margin: 0;
        }

        /* Waiting dots */
        .pac-waiting {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .pac-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          background: #7c3bb2;
          opacity: 0.5;
          animation: pac-bounce 1.1s ease-in-out infinite;
        }
        .pac-dot:nth-child(2) { animation-delay: 0.18s; }
        .pac-dot:nth-child(3) { animation-delay: 0.36s; }

        /* Result */
        .pac-result { animation: pac-fadein 0.6s ease forwards; }
        .pac-answer {
          font-family: 'Playfair Display', serif;
          color: #2d1054;
          font-size: 34px;
          line-height: 1.4;
          margin: 0 0 20px;
        }
        .pac-consult {
          font-family: 'Poppins', sans-serif;
          color: #5a4a6b;
          font-size: 14px;
          line-height: 1.65;
          margin: 0;
        }
        .pac-consult-link {
          color: #7c3bb2;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .pac-consult-link:hover { color: #5f2a8d; }

        /* ── Keyframes ── */
        @keyframes pac-breathe {
          from { transform: scale(1);    }
          to   { transform: scale(1.025); }
        }
        @keyframes pac-float {
          0%, 100% { transform: translateY(0) rotate(-0.25deg); }
          50% { transform: translateY(-10px) rotate(0.25deg); }
        }
        @keyframes pac-sweep {
          0%, 52% { opacity: 0; transform: translateX(-74%) skewX(-14deg); }
          66% { opacity: 0.52; }
          82%, 100% { opacity: 0; transform: translateX(70%) skewX(-14deg); }
        }
        @keyframes pac-divine-lift {
          0% { transform: translateY(0) scale(1); }
          45% { transform: translateY(-8px) scale(1.025); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes pac-ring-spin {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7) rotate(0deg); }
          18% { opacity: 0.95; }
          82% { opacity: 0.72; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.18) rotate(260deg); }
        }
        @keyframes pac-ring-spin-reverse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.78) rotate(0deg); }
          22% { opacity: 0.74; }
          80% { opacity: 0.5; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.05) rotate(-210deg); }
        }
        @keyframes pac-ball-focus {
          0% { transform: scale(1); opacity: 1; }
          44% { transform: scale(1.018); opacity: 0.98; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pac-sweep-fast {
          0% { opacity: 0; transform: translateX(-82%) skewX(-14deg); }
          42% { opacity: 0.68; }
          100% { opacity: 0; transform: translateX(82%) skewX(-14deg); }
        }
        @keyframes pac-bounce {
          0%,80%,100% { transform: translateY(0);    }
          40%          { transform: translateY(-8px); }
        }
        @keyframes pac-fadein {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .pac-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pac-grid > :nth-child(2) { display: none; }
          .pac-outer { width: min(100%, 430px); margin: 0 auto; }
          .pac-right { text-align: center; }
          .pac-line { margin-left: auto; margin-right: auto; }
          .pac-title { font-size: 22px; }
          .pac-answer { font-size: 26px; }
          .pac-waiting { justify-content: center; }
        }
      `}</style>
    </section>
  );
}
