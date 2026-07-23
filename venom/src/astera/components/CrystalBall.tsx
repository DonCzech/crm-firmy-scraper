"use client";
import Link from "next/link";
import { useState } from "react";
import OptimizedImage from "@/astera/components/OptimizedImage";
import { useContent } from "@/astera/context/ContentContext";
import { localizeHref } from "@/astera/lib/i18n";
import { DEFAULT_CONTENT } from "@/astera/lib/content-types";

export default function CrystalBall() {
  const { content, currentLang } = useContent();
  const crystalBall = { ...DEFAULT_CONTENT.crystalBall, ...content.crystalBall };
  const answers = crystalBall.answers?.length ? crystalBall.answers : DEFAULT_CONTENT.crystalBall.answers;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const askBall = () => {
    if (!question.trim() || isShaking) return;
    setIsShaking(true);
    setAnswer(null);
    setRevealed(false);

    setTimeout(() => {
      const pick = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(pick);
      setIsShaking(false);
      setTimeout(() => setRevealed(true), 80);
    }, 1800);
  };

  return (
    <section className="cb-section">
      <div className="container-main">
        <div className="cb-wrap">
          {/* Header */}
          <p className="cb-eyebrow">{crystalBall.eyebrow}</p>
          <h2 className="cb-title">{crystalBall.title}</h2>
          <p className="cb-subtitle">
            {crystalBall.subtitle}
          </p>

          {/* Ball */}
          <div className={`cb-ball-wrap${isShaking ? " cb-reading" : ""}`}>
            <div className="cb-table-glow" aria-hidden="true" />
            <div className="cb-aura" aria-hidden="true" />
            <div className="cb-sphere">
              <OptimizedImage
                src={crystalBall.image}
                mobileSrc={crystalBall.mobileImage}
                alt={crystalBall.eyebrow}
                className="cb-ball-img"
                sizes="(max-width: 600px) 98vw, 660px"
                loading="lazy"
                draggable={false}
              />
              <div className="cb-caustic cb-caustic-a" aria-hidden="true" />
              <div className="cb-caustic cb-caustic-b" aria-hidden="true" />
              <div className="cb-light-sweep" />
              <div className="cb-reading-veil" aria-hidden="true" />
              {answer && (
                <div className={`cb-inner-answer${revealed ? " cb-visible" : ""}`}>
                  <p className="cb-inner-text">{answer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="cb-input-row">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askBall()}
              placeholder={crystalBall.inputPlaceholder}
              className="cb-input"
            />
            <button
              onClick={askBall}
              disabled={!question.trim() || isShaking}
              className="cb-btn"
            >
              {isShaking ? crystalBall.loadingText : crystalBall.buttonText}
            </button>
          </div>

          {/* Answer below ball */}
          <div className={`cb-answer-row${revealed && answer ? " cb-answer-visible" : ""}`}>
            <p className="cb-answer-text">{answer}</p>
            <p className="cb-consult-text">
              {crystalBall.consultLead}{" "}
              <Link href={localizeHref("/sluzby", currentLang)} className="cb-consult-link">
                {crystalBall.consultLinkText}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .cb-section {
          position: relative;
          background:
            radial-gradient(ellipse 58% 44% at 50% 39%, rgba(236,218,255,0.20) 0%, rgba(180,143,211,0.10) 43%, transparent 72%),
            radial-gradient(ellipse 64% 18% at 50% 70%, rgba(255,237,207,0.11) 0%, transparent 66%),
            linear-gradient(180deg, #171021 0%, #21152c 42%, #15121c 100%);
          padding: 88px 0 98px;
          overflow: hidden;
          isolation: isolate;
        }
        .cb-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.045) 48%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.045) 52%, transparent 100%),
            radial-gradient(ellipse 70% 48% at 50% 28%, rgba(255,255,255,0.065) 0%, transparent 68%);
          opacity: 0.9;
          pointer-events: none;
          z-index: -2;
        }
        .cb-section::after {
          content: "";
          position: absolute;
          inset: auto 0 0;
          height: 36%;
          background:
            linear-gradient(180deg, transparent 0%, rgba(12,9,16,0.72) 100%),
            radial-gradient(ellipse at 50% 0%, rgba(155,116,186,0.20) 0%, transparent 68%);
          pointer-events: none;
          z-index: -1;
        }
        .cb-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .cb-eyebrow {
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: #c8aee4;
          margin: 0 0 10px;
        }
        .cb-title {
          font-family: 'Playfair Display', serif;
          color: #ffffff;
          font-size: 34px;
          line-height: 1.25;
          margin: 0 0 14px;
        }
        .cb-subtitle {
          font-family: 'Poppins', sans-serif;
          color: #d7c8e4;
          font-size: 15px;
          line-height: 1.75;
          margin: 0 0 46px;
          max-width: 480px;
        }

        /* ── Ball ── */
        .cb-ball-wrap {
          position: relative;
          width: min(96vw, 660px);
          aspect-ratio: 3 / 2;
          margin: 0 auto 40px;
          animation: cb-float 6.4s ease-in-out infinite;
          filter: drop-shadow(0 30px 34px rgba(0,0,0,0.38));
          transform-origin: 50% 55%;
          will-change: transform;
        }
        .cb-table-glow {
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 0;
          height: 24%;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(234,211,255,0.22) 0%, rgba(255,235,205,0.12) 34%, transparent 70%);
          filter: blur(18px);
          pointer-events: none;
          will-change: transform, opacity;
        }
        .cb-aura {
          position: absolute;
          inset: 12% 8% 6%;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 48%, rgba(255,240,218,0.52) 0%, rgba(224,199,247,0.20) 34%, transparent 72%);
          filter: blur(22px);
          transform: scale(1);
          pointer-events: none;
        }
        .cb-sphere {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 36px;
          transform: translateZ(0);
        }
        .cb-ball-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          user-select: none;
          transform: scale(1.01);
          filter: saturate(1.02) contrast(1.02);
          will-change: transform, opacity;
        }
        .cb-caustic {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          mix-blend-mode: screen;
          opacity: 0;
          filter: blur(10px);
          will-change: transform, opacity;
        }
        .cb-caustic-a {
          top: 22%;
          left: 27%;
          width: 45%;
          aspect-ratio: 1;
          background: radial-gradient(circle, rgba(255,246,226,0.32), rgba(224,195,246,0.16) 42%, transparent 68%);
        }
        .cb-caustic-b {
          top: 34%;
          left: 38%;
          width: 25%;
          aspect-ratio: 1;
          background: radial-gradient(circle, rgba(255,255,255,0.28), transparent 70%);
        }
        .cb-light-sweep {
          position: absolute;
          inset: 9% 18% 17%;
          background: linear-gradient(105deg, transparent 18%, rgba(255,255,255,0.20) 43%, transparent 62%);
          mix-blend-mode: screen;
          opacity: 0;
          transform: translateX(-70%) skewX(-10deg);
          pointer-events: none;
          will-change: transform, opacity;
        }
        .cb-reading-veil {
          position: absolute;
          top: 23%;
          left: 29%;
          right: 29%;
          aspect-ratio: 1;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(255,246,226,0.34) 0%, rgba(217,188,244,0.18) 42%, transparent 70%);
          opacity: 0;
          mix-blend-mode: screen;
          filter: blur(8px);
          transform: scale(0.72);
          pointer-events: none;
          will-change: transform, opacity;
        }
        .cb-inner-answer {
          position: absolute;
          top: 24%;
          left: 26%;
          right: 26%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(36,24,48,0.72) 0%, rgba(27,18,37,0.50) 58%, rgba(27,18,37,0.08) 72%, transparent 100%);
          backdrop-filter: blur(1.5px);
          opacity: 0;
          transition: opacity 0.9s ease, transform 0.9s ease;
          transform: scale(0.92);
        }
        .cb-inner-answer.cb-visible {
          opacity: 1;
          transform: scale(1);
        }
        .cb-inner-text {
          font-family: 'Playfair Display', serif;
          color: #f1e6ff;
          font-size: 15px;
          line-height: 1.55;
          margin: 0;
          text-shadow: 0 0 18px rgba(210,178,244,0.58);
        }
        .cb-reading {
          animation: cb-read-hold 1.45s cubic-bezier(.2,.7,.2,1) both;
          filter: drop-shadow(0 30px 34px rgba(0,0,0,0.40));
        }
        .cb-reading .cb-aura {
          animation: cb-aura-read 1.45s ease-in-out both;
        }
        .cb-reading .cb-ball-img {
          animation: cb-ball-read 1.45s ease-in-out both;
        }
        .cb-reading .cb-caustic-a {
          animation: cb-caustic-read 1.45s ease-in-out both;
        }
        .cb-reading .cb-caustic-b {
          animation: cb-caustic-read 1.45s ease-in-out 0.12s both;
        }
        .cb-reading .cb-light-sweep {
          animation: cb-sweep-read 1.45s ease-in-out both;
        }
        .cb-reading .cb-reading-veil {
          animation: cb-veil-read 1.45s ease-in-out both;
        }

        /* ── Input ── */
        .cb-input-row {
          display: flex;
          gap: 12px;
          width: 100%;
          max-width: 520px;
          margin-bottom: 32px;
        }
        .cb-input {
          flex: 1;
          padding: 14px 22px;
          border-radius: 50px;
          border: 1px solid rgba(167,139,218,0.35);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .cb-input:focus { border-color: rgba(167,139,218,0.75); }
        .cb-input::placeholder { color: rgba(196,168,232,0.5); }
        .cb-btn {
          padding: 14px 28px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #7c3bb2 0%, #5f2a8d 100%);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 18px rgba(124,59,178,0.45);
        }
        .cb-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .cb-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,59,178,0.6); }

        /* ── Answer below ── */
        .cb-answer-row {
          max-width: 440px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s;
          pointer-events: none;
        }
        .cb-answer-row.cb-answer-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .cb-answer-text {
          font-family: 'Playfair Display', serif;
          color: #e8d5ff;
          font-size: 20px;
          line-height: 1.5;
          margin: 0 0 12px;
        }
        .cb-consult-text {
          font-family: 'Poppins', sans-serif;
          color: #a78bda;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }
        .cb-consult-link {
          color: #c4a8e8;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .cb-consult-link:hover { color: #ffffff; }

        /* ── Animations ── */
        @keyframes cb-float {
          0%, 100% { transform: translateY(0) rotate(-0.25deg); }
          50% { transform: translateY(-10px) rotate(0.25deg); }
        }
        @keyframes cb-read-hold {
          0% { transform: translateY(0) scale(1); }
          45% { transform: translateY(-5px) scale(1.012); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes cb-aura-read {
          0% { opacity: 0.62; transform: scale(1); }
          45% { opacity: 0.92; transform: scale(1.06); }
          100% { opacity: 0.62; transform: scale(1); }
        }
        @keyframes cb-ball-read {
          0% { transform: scale(1.01); opacity: 1; }
          45% { transform: scale(1.018); opacity: 0.98; }
          100% { transform: scale(1.01); opacity: 1; }
        }
        @keyframes cb-caustic-read {
          0% { opacity: 0; transform: scale(0.8) translateY(4px); }
          42% { opacity: 0.88; transform: scale(1.08) translateY(0); }
          100% { opacity: 0; transform: scale(1.28) translateY(-3px); }
        }
        @keyframes cb-sweep-read {
          0% { opacity: 0; transform: translateX(-70%) skewX(-10deg); }
          38% { opacity: 0.42; }
          78%, 100% { opacity: 0; transform: translateX(62%) skewX(-10deg); }
        }
        @keyframes cb-veil-read {
          0% { opacity: 0; transform: scale(0.72); }
          46% { opacity: 0.82; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.18); }
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .cb-section { padding: 64px 0 76px; }
          .cb-title { font-size: 26px; }
          .cb-subtitle { margin-bottom: 36px; }
          .cb-ball-wrap { width: min(98vw, 520px); margin-bottom: 34px; }
          .cb-inner-answer {
            top: 23%;
            left: 24%;
            right: 24%;
            padding: 18px;
          }
          .cb-inner-text { font-size: 13px; line-height: 1.42; }
          .cb-input-row { flex-direction: column; }
          .cb-btn { border-radius: 50px; }
        }
      `}</style>
    </section>
  );
}
