"use client";
import { useEffect, useRef, useState } from "react";
import { useContent } from "@/context/ContentContext";
import EditableText from "./admin/EditableText";
import { cssImageUrl } from "@/lib/image-formats";

function currentTenantSlug() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/")[2] ?? "";
}

export default function Hero() {
  const { content, admin, updateSection } = useContent();
  const h = content.hero;
  const fileRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [heroHovered, setHeroHovered] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [bgDims, setBgDims] = useState<{ w: number; h: number } | null>(null);
  const titleColor = h.titleColor || "#1f1f1f";
  const subtitleColor = h.subtitleColor || "#2d2530";
  const panelBackground = h.panelBackground || "rgba(255, 255, 255, 0.52)";
  const primaryButtonBg = h.primaryButtonBg || "#7c3bb2";
  const primaryButtonColor = h.primaryButtonColor || "#ffffff";
  const secondaryButtonText = h.secondaryButtonText || "E-shop";
  const secondaryButtonHref = h.secondaryButtonHref || "/shop";

  useEffect(() => {
    if (!h.backgroundImage) {
      setBgDims(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setBgDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setBgDims(null);
    img.src = h.backgroundImage;
  }, [h.backgroundImage]);

  // Background image upload (for the CSS background — special case)
  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const target = targetFromElement(heroRef.current);
    if (target) {
      fd.append("targetWidth", String(target.width));
      fd.append("targetHeight", String(target.height));
      fd.append("fit", "cover");
    }
    const tenantSlug = currentTenantSlug();
    if (tenantSlug) fd.append("tenantSlug", tenantSlug);
    setUploadingBg(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (data.url) updateSection("hero", { ...h, backgroundImage: data.url });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Obrázek se nepodařilo nahrát.");
    } finally {
      setUploadingBg(false);
      e.target.value = "";
    }
  }

  return (
    <>
      {/* Desktop Hero */}
      <section
        ref={heroRef}
        id="home-hero"
        style={{
          backgroundImage: h.backgroundImage ? cssImageUrl(h.backgroundImage) : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: admin.isAdmin ? "128px" : "102px",
          paddingBottom: "100px",
          position: "relative",
        }}
        className="desktop-hero"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
      >
        {/* Admin: change background button */}
        {admin.isAdmin && heroHovered && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              position: "absolute",
              top: 120,
              right: 20,
              zIndex: 10,
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              display: "grid",
              gap: 4,
              textAlign: "right",
            }}
          >
            <span>{uploadingBg ? "Nahrávám..." : "Změnit obrázek"}</span>
            {bgDims && (
              <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                {bgDims.w} x {bgDims.h} px
              </span>
            )}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleBgUpload} />

        <div className="container-main" style={{ width: "100%" }}>
          <div className="hero-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}>
            <div className="hero-copy-panel">
              <div className="hero-copy-text">
                <EditableText
                  section="hero"
                  field="title"
                  tag="h1"
                  style={{ color: titleColor, marginBottom: "6px", marginTop: 0, display: "block", fontSize: "clamp(22px, 2.1vw, 29px)", lineHeight: "1.08", letterSpacing: 0, textShadow: "0 1px 0 rgba(255,255,255,0.65)" }}
                />
                <EditableText
                  section="hero"
                  field="subtitle"
                  tag="p"
                  richText
                  style={{ fontSize: "13.5px", lineHeight: "1.4", color: subtitleColor, marginBottom: 0, fontFamily: "'Poppins', sans-serif", display: "block" }}
                />
              </div>
              <div className="hero-actions">
                <a href={h.ctaHref} className="btn-primary hero-primary-button" style={{ background: primaryButtonBg, color: primaryButtonColor }}>
                  <EditableText section="hero" field="ctaText" tag="span" />
                </a>
                <a href={secondaryButtonHref} className="btn-primary btn-secondary">
                  {secondaryButtonText}
                </a>
              </div>
            </div>
            <div />
          </div>
        </div>
      </section>

      <style>{`
        .desktop-hero { display: flex; }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          justify-content: flex-end;
        }
        .hero-actions-mobile {
          justify-content: center;
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
          background: rgba(255, 255, 255, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.62);
          border-radius: 10px;
          box-shadow: 0 16px 38px rgba(52, 31, 64, 0.12);
          backdrop-filter: blur(10px);
        }
        .hero-copy-panel {
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
        .hero-copy-text {
          max-width: 410px;
        }
        @media (max-width: 900px) {
          .hero-copy-panel {
            width: min(100%, 520px);
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .hero-actions { justify-content: flex-start; }
        }
        @media (max-width: 640px) {
          .desktop-hero {
            display: flex !important;
            min-height: auto !important;
            align-items: flex-start !important;
            background-size: 100% auto !important;
            background-position: center 76px !important;
            background-color: #fbf8f5;
            padding-top: calc(76px + (100vw * 880 / 1787) + 54px) !important;
            padding-bottom: 32px !important;
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
            background: rgba(255, 255, 255, 0.78);
            backdrop-filter: blur(8px);
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-copy-text {
            max-width: none;
            text-align: center;
          }
          .hero-copy-text h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
    </>
  );
}

function targetFromElement(element: HTMLElement | null): { width: number; height: number } | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (width < 1 || height < 1) return null;
  return { width, height };
}
