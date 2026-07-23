"use client";
import { useEffect, useRef, useState } from "react";
import { useContent } from "@/astera/context/ContentContext";
import EditableText from "./admin/EditableText";
import { getOptimizedImage } from "@/astera/components/OptimizedImage";
import { localizeHref } from "@/astera/lib/i18n";
import { asteraUpload } from "@/astera/lib/host";

// Generic warm-tone gradient — shows for half a frame if LQIP isn't ready.
// Tones match the actual hero photo (cream / soft purple / window light).
const FALLBACK_LQIP_GRADIENT =
  "radial-gradient(circle at 28% 38%, rgba(220,196,205,0.65) 0%, transparent 45%)," +
  "radial-gradient(circle at 72% 62%, rgba(228,212,198,0.55) 0%, transparent 50%)," +
  "linear-gradient(135deg, #ece0d2 0%, #d8c5b6 50%, #c4ab9c 100%)";

export default function Hero() {
  const { content, admin, updateSection, currentLang } = useContent();
  const h = content.hero;
  const fileRef = useRef<HTMLInputElement>(null);

  const titleColor = h.titleColor || "#1f1f1f";
  const subtitleColor = h.subtitleColor || "#2d2530";
  const panelBackground = h.panelBackground || "rgba(255, 255, 255, 0.72)";
  const primaryButtonBg = h.primaryButtonBg || "#7c3bb2";
  const primaryButtonColor = h.primaryButtonColor || "#ffffff";

  const desktopSrc = h.backgroundImage;
  const mobileSrc = h.mobileImage || h.backgroundImage;

  const desktopImg = getOptimizedImage(desktopSrc);
  const mobileImg = getOptimizedImage(mobileSrc);

  const desktopLqip = desktopImg?.lqip;
  const mobileLqip = mobileImg?.lqip || desktopLqip;

  const mobileAspect =
    mobileImg?.width && mobileImg?.height
      ? `${mobileImg.width} / ${mobileImg.height}`
      : "900 / 1100";

  const [desktopLoaded, setDesktopLoaded] = useState(false);
  const [mobileLoaded, setMobileLoaded] = useState(false);
  const desktopImgRef = useRef<HTMLImageElement>(null);
  const mobileImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (desktopImgRef.current?.complete) setDesktopLoaded(true);
      if (mobileImgRef.current?.complete) setMobileLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await asteraUpload(fd);
    const data = await res.json();
    if (data.url) updateSection("hero", { ...h, backgroundImage: data.url });
    e.target.value = "";
  }

  return (
    <>
      <section
        id="home-hero"
        className="hero-section"
        style={{
          paddingTop: admin.isAdmin ? "128px" : "102px",
        }}
      >
        {/* DESKTOP background layer — absolutely fills section */}
        <div
          className="hero-bg hero-bg-desktop"
          style={{
            backgroundImage: desktopLqip
              ? `url("${desktopLqip}")`
              : FALLBACK_LQIP_GRADIENT,
          }}
        >
          <picture>
            {desktopImg && (
              <source
                srcSet={desktopImg.webpSrcSet || desktopImg.webp}
                sizes="100vw"
                type="image/webp"
              />
            )}
            <img
              ref={desktopImgRef}
              src={desktopImg?.fallback || desktopSrc || ""}
              srcSet={desktopImg?.fallbackSrcSet}
              sizes="100vw"
              alt=""
              role="presentation"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setDesktopLoaded(true)}
              className={`hero-img ${desktopLoaded ? "is-loaded" : ""}`}
            />
          </picture>
        </div>

        {/* MOBILE background layer — fills the hero like the desktop background */}
        <div
          className="hero-bg hero-bg-mobile"
          style={{
            aspectRatio: mobileAspect,
            backgroundImage: mobileLqip
              ? `url("${mobileLqip}")`
              : FALLBACK_LQIP_GRADIENT,
          }}
        >
          <div
            className="hero-shimmer"
            style={{ opacity: mobileLoaded ? 0 : 1 }}
            aria-hidden="true"
          />
          <picture>
            {mobileImg && (
              <source
                srcSet={mobileImg.webpSrcSet || mobileImg.webp}
                sizes="100vw"
                type="image/webp"
              />
            )}
            <img
              ref={mobileImgRef}
              src={mobileImg?.fallback || mobileSrc || ""}
              srcSet={mobileImg?.fallbackSrcSet}
              sizes="100vw"
              alt=""
              role="presentation"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setMobileLoaded(true)}
              className={`hero-img ${mobileLoaded ? "is-loaded" : ""}`}
            />
          </picture>
        </div>

        {admin.isAdmin && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="hero-admin-btn"
          >
            📷 Změnit pozadí
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleBgUpload}
        />

        <div className="container-main hero-content-wrap">
          <div className="hero-content-grid">
            <div className="hero-copy-panel">
              <div className="hero-copy-text">
                <EditableText
                  section="hero"
                  field="title"
                  tag="h1"
                  style={{
                    color: titleColor,
                    marginBottom: "6px",
                    marginTop: 0,
                    display: "block",
                    fontSize: "clamp(22px, 2.1vw, 29px)",
                    lineHeight: "1.08",
                    letterSpacing: 0,
                    textShadow: "0 1px 0 rgba(255,255,255,0.65)",
                  }}
                />
                <EditableText
                  section="hero"
                  field="subtitle"
                  tag="p"
                  richText
                  style={{
                    fontSize: "13.5px",
                    lineHeight: "1.4",
                    color: subtitleColor,
                    marginBottom: 0,
                    fontFamily: "'Poppins', sans-serif",
                    display: "block",
                  }}
                />
              </div>
              <div className="hero-actions">
                <a
                  href={localizeHref(h.ctaHref, currentLang)}
                  className="btn-primary hero-primary-button"
                  style={{ background: primaryButtonBg, color: primaryButtonColor }}
                >
                  <EditableText section="hero" field="ctaText" tag="span" />
                </a>
                <a
                  href="https://www.asteralight.cz/shop/"
                  className="btn-primary btn-secondary"
                >
                  E-shop
                </a>
              </div>
            </div>
            <div />
          </div>
        </div>

        <style>{`
          @keyframes hero-shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .hero-section {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding-bottom: 100px;
            overflow: hidden;
            background-color: #ece0d2;
            isolation: isolate;
          }
          .hero-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            overflow: hidden;
          }
          .hero-bg picture,
          .hero-bg picture img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
          }
          .hero-img {
            object-fit: cover;
            object-position: center center;
            opacity: 1;
            z-index: 2;
          }
          .hero-shimmer {
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            background: linear-gradient(
              100deg,
              transparent 25%,
              rgba(255, 255, 255, 0.35) 50%,
              transparent 75%
            );
            animation: hero-shimmer 1.8s linear infinite;
            transition: opacity 0.4s ease-out;
          }
          .hero-bg-mobile { display: none; }

          .hero-admin-btn {
            position: absolute;
            top: 120px;
            right: 20px;
            z-index: 10;
            background: rgba(0, 0, 0, 0.65);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 12px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .hero-content-wrap {
            position: relative;
            z-index: 2;
            width: 100%;
          }
          .hero-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
          }
          .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            justify-content: flex-end;
          }
          .btn-secondary {
            background: #ffffff !important;
            color: #7c3bb2 !important;
            box-shadow: inset 0 0 0 1px #7c3bb2;
          }
          .btn-secondary:hover {
            background: #f7f0fb !important;
          }
          .hero-copy-panel {
            width: min(100%, 610px);
            min-height: 108px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 20px;
            padding: 14px 18px 14px 20px;
            border: 1px solid rgba(255, 255, 255, 0.62);
            border-radius: 10px;
            box-shadow: 0 16px 38px rgba(52, 31, 64, 0.12);
            backdrop-filter: blur(10px);
            background: ${panelBackground};
          }
          .hero-primary-button {
            background: ${primaryButtonBg} !important;
            color: ${primaryButtonColor} !important;
          }
          .hero-copy-panel .btn-primary {
            padding: 7px 18px !important;
            font-size: 13px !important;
            border-radius: 999px;
          }
          .hero-copy-text { max-width: 410px; }

          @media (max-width: 900px) {
            .hero-copy-panel {
              width: min(100%, 520px);
              grid-template-columns: 1fr;
              gap: 14px;
            }
            .hero-actions { justify-content: flex-start; }
          }

          @media (max-width: 640px) {
            /* Na mobilu se hero neroztahuje na celou výšku okna. Obrázek teče
               v normálním toku, ukáže se celý (nic se neořezává) a text jde
               pod něj — sekce je pak přesně tak vysoká, jak potřebuje. */
            .hero-section {
              display: block !important;
              min-height: 0 !important;
              padding-top: 76px !important;
              padding-bottom: 32px !important;
              background-color: #ece0d2;
              overflow: hidden;
            }
            .hero-bg-desktop { display: none !important; }
            .hero-bg-mobile {
              display: block !important;
              position: relative !important;
              inset: auto !important;
              width: 100% !important;
              height: auto !important;
              aspect-ratio: auto !important;
              z-index: 0;
            }
            .hero-bg-mobile picture,
            .hero-bg-mobile picture img {
              position: relative !important;
              height: auto !important;
            }
            .hero-bg-mobile .hero-img {
              object-fit: contain !important;
              width: 100% !important;
              height: auto !important;
            }
            .hero-content-grid {
              grid-template-columns: 1fr !important;
              gap: 0 !important;
            }
            .hero-copy-panel {
              width: 100% !important;
              min-height: 0;
              grid-template-columns: 1fr;
              gap: 14px;
              padding: 16px 18px;
              margin-top: 18px;
              background: rgba(255, 255, 255, 0.92) !important;
              backdrop-filter: blur(8px);
            }
            .hero-actions { justify-content: center; }
            .hero-copy-text {
              max-width: none;
              text-align: center;
            }
            .hero-copy-text h1 { font-size: 24px !important; }
          }
        `}</style>
      </section>
    </>
  );
}
