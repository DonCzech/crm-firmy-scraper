"use client";
import { useState } from "react";
import { PageBlock } from "@/astera/lib/content-types";
import { localizeHtmlHrefs } from "@/astera/lib/i18n";
import { useContent } from "@/astera/context/ContentContext";

const purple = "#7c3bb2";
const cream = "#fdf8f3";
const gold = "#c9a84c";
const darkBrown = "#2a1a00";
const mutedBrown = "#6b5a3a";

interface Props {
  b: PageBlock;
}

export default function FaqAccordionBlock({ b }: Props) {
  const { currentLang } = useContent();
  const [openId, setOpenId] = useState<string | null>(null);
  const items = b.faqItems ?? [];

  return (
    <div style={{ padding: "48px 0 32px", maxWidth: 780, margin: "0 auto", width: "100%" }}>
      {(b.faqTitle || b.faqSubtitle) && (
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          {b.faqTitle && (
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 700,
              color: darkBrown,
              margin: "0 0 10px",
              letterSpacing: "-0.01em",
            }}>
              {b.faqTitle}
            </h1>
          )}
          {b.faqSubtitle && (
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 15,
              color: mutedBrown,
              margin: 0,
              lineHeight: 1.6,
            }}>
              {b.faqSubtitle}
            </p>
          )}
          <div style={{
            width: 48,
            height: 3,
            background: `linear-gradient(90deg, ${gold}, ${purple})`,
            borderRadius: 2,
            margin: "18px auto 0",
          }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, idx) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="faq-item"
              style={{
                background: isOpen ? `linear-gradient(135deg, ${cream} 0%, #fdf4fb 100%)` : "#fff",
                border: isOpen ? `1.5px solid ${purple}44` : `1.5px solid #e8ddd4`,
                borderRadius: 14,
                overflow: "hidden",
                transition: "border-color 0.2s, background 0.2s",
                boxShadow: isOpen ? `0 4px 24px ${purple}14` : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="faq-btn"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "16px 18px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  minHeight: 44,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span className="faq-num" style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: isOpen ? `linear-gradient(135deg, ${purple}, #5f2a8d)` : `${gold}22`,
                    border: isOpen ? "none" : `1.5px solid ${gold}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    color: isOpen ? "#fff" : gold,
                    transition: "all 0.2s",
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontWeight: isOpen ? 600 : 500,
                    color: isOpen ? purple : darkBrown,
                    lineHeight: 1.4,
                    transition: "color 0.2s",
                  }}>
                    {item.q}
                  </span>
                </span>
                <span style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isOpen ? `${purple}15` : "#f5f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.25s",
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke={isOpen ? purple : mutedBrown} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <div style={{
                maxHeight: isOpen ? 800 : 0,
                overflow: "hidden",
                transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div
                  className="faq-answer"
                  style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, lineHeight: 1.8, color: "#4a3728" }}
                  dangerouslySetInnerHTML={{ __html: localizeHtmlHrefs(item.a, currentLang) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <p style={{ textAlign: "center", color: mutedBrown, fontFamily: "'Poppins',sans-serif", fontSize: 14 }}>
          Žádné FAQ položky.
        </p>
      )}

      <style>{`
        .faq-answer {
          padding: 0 18px 18px 64px;
        }
        .faq-answer a { color: ${purple}; font-weight: 600; }
        .faq-answer ul, .faq-answer ol { padding-left: 20px; margin: 6px 0; }
        @media (max-width: 480px) {
          .faq-answer {
            padding: 0 14px 16px 14px;
          }
          .faq-btn {
            padding: 14px 14px !important;
          }
          .faq-num {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
