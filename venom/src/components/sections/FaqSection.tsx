"use client";

import { useState } from "react";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin: boolean;
  sectionId: number;
}

export function FaqSection({ content, variant, sectionId }: Props) {
  if (variant === "stavba-01-faq")    return <FaqStavba01 content={content} sectionId={sectionId} />;
  if (variant === "ortho-01-faq")     return <FaqOrtho01 content={content} sectionId={sectionId} />;
  if (variant === "faq-fitness-01")   return <FaqFitness01 content={content} sectionId={sectionId} />;
  if (variant === "grooming-01-faq")  return <FaqGrooming01 content={content} sectionId={sectionId} />;
  if (variant === "ucetni-03-faq")    return <FaqUcetni03 content={content} sectionId={sectionId} />;
  if (variant === "instala-02-faq")   return <FaqInstala02 content={content} sectionId={sectionId} />;
  if (variant === "floors-01-faq")    return <FaqFloors01 content={content} sectionId={sectionId} />;
  if (variant === "malir-01-faq")     return <FaqMalir01  content={content} sectionId={sectionId} />;

  // Support both field name conventions: faq[]{question,answer} and items[]{q,a} (generator)
  const faq = (
    (content as { faq?: FaqItem[] }).faq ??
    ((content as { items?: Array<{ q?: string; question?: string; a?: string; answer?: string }> }).items ?? []).map(
      (i) => ({ question: i.q ?? i.question ?? "", answer: i.a ?? i.answer ?? "" })
    )
  );
  const title = String(content.title ?? "Časté dotazy");
  const [open, setOpen] = useState<number | null>(null);
  if (!faq.length) return null;

  if (variant === "barber-dark") {
    const GOLD = "#C9A84C";
    const BG   = "#111111";
    const BORDER = "rgba(201,168,76,0.15)";
    return (
      <section style={{ backgroundColor: BG, padding: "clamp(56px, 10vw, 100px) 24px" }} data-template="barber-01">
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "clamp(36px, 6vw, 56px)" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: 14 }}>FAQ</p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, color: "#F5F5F5", margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          {/* Items */}
          <div>
            {faq.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", gap: 16, textAlign: "left" }}
                >
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 600, color: open === i ? GOLD : "#F5F5F5", letterSpacing: "0.01em", transition: "color 0.2s", flex: 1 }}>
                    <GenericEditableText sectionId={sectionId} field={`faq.${i}.question`} value={item.question} tag="span" />
                  </span>
                  <span style={{ width: 24, height: 24, border: `1px solid ${BORDER}`, borderColor: open === i ? GOLD : BORDER, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.2s", color: open === i ? GOLD : "#A0A0A0", fontSize: 16, lineHeight: 1, fontWeight: 300 }}>
                    {open === i ? "−" : "+"}
                  </span>
                </button>
                {open === i && (
                  <div style={{ paddingBottom: 22, paddingRight: "clamp(0px, 5vw, 40px)" }}>
                    <p style={{ fontFamily: "var(--font-body, Inter, sans-serif)", fontSize: "0.9rem", color: "#A0A0A0", lineHeight: 1.75, margin: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={`faq.${i}.answer`} value={item.answer} tag="span" />
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface, #f9fafb)" }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--color-border, #e5e7eb)", borderRadius: "var(--radius, 8px)" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-4 flex justify-between items-center font-medium"
                style={{ backgroundColor: "var(--color-bg, #fff)", color: "var(--color-text, #111)" }}
              >
                <GenericEditableText sectionId={sectionId} field={`faq.${i}.question`} value={item.question} tag="span" />
                <span className="text-xl">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div
                  className="px-6 pb-4 text-sm"
                  style={{ backgroundColor: "var(--color-bg, #fff)", color: "var(--color-text-muted, #666)" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`faq.${i}.answer`} value={item.answer} tag="span" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ortho-01-faq ──────────────────────────────────────────────────────────────
// White bg, teal akcentový kruh toggle, max 740px centered
// ─────────────────────────────────────────────────────────────────────────────
function FaqOrtho01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const TEAL  = "#00b7ad";
  const SLATE = "#244757";
  const FONT  = "'Inter', 'DM Sans', Arial, sans-serif";

  const title = String(content.title ?? "Nejčastější otázky");
  const items = ((content.items as FaqItem[]) ?? []);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      data-section-type="faq"
      data-variant="ortho-01-faq"
      style={{ backgroundColor: "#fff", padding: "clamp(56px, 7vw, 96px) 0", fontFamily: FONT }}
    >
      <div style={{ maxWidth: "min(740px, 100%)", margin: "0 auto", padding: "0 clamp(16px, 5vw, 48px)" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
          fontWeight: 800,
          color: SLATE,
          margin: "0 0 clamp(32px, 5vw, 56px)",
          lineHeight: 1.2,
        }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: 12, border: `1px solid ${open === i ? TEAL : "#e2eaed"}`, overflow: "hidden", transition: "border-color 0.2s" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", background: open === i ? "#f0fafa" : "#fff",
                  border: "none", cursor: "pointer",
                  padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 16, fontFamily: FONT, transition: "background 0.2s",
                }}
              >
                <span style={{ fontSize: "clamp(0.9rem, 1.3vw, 1rem)", fontWeight: 600, color: SLATE, lineHeight: 1.4 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" />
                </span>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: open === i ? TEAL : "rgba(0,183,173,0.1)",
                  color: open === i ? "#fff" : TEAL,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, lineHeight: 1, fontWeight: 300, transition: "background 0.2s, color 0.2s",
                }}>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div style={{ padding: "0 22px 20px", fontSize: "0.92rem", color: "#506470", lineHeight: 1.75, background: "#f0fafa" }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── faq-fitness-01 ────────────────────────────────────────────────────────────
function FaqFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items = ((content as { items?: FaqItem[] }).items ?? []) as FaqItem[];
  const heading = String(content.heading ?? "Máte dotaz?");
  const [open, setOpen] = useState<number | null>(null);

  const BG     = "#FFF9F7";
  const ACCENT = "#AD8A72";
  const FONT   = "'Inter', sans-serif";

  return (
    <section id="faq" style={{ backgroundColor: BG, padding: "clamp(60px,8vw,100px) clamp(20px,5vw,60px)", fontFamily: FONT }} data-template="fitness-01">
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>FAQ</span>
          <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, color: "#1a1a1a", margin: 0, lineHeight: 1.15 }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(173,138,114,0.2)", background: "#fff" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                  padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 16, fontFamily: FONT,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" />
                </span>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: open === i ? ACCENT : "rgba(173,138,114,0.12)",
                  color: open === i ? "#fff" : ACCENT,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, lineHeight: 1, fontWeight: 300, transition: "background 0.2s, color 0.2s",
                }}>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px", fontSize: 14, color: "#54595F", lineHeight: 1.75 }}>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stavba-01 FAQ ────────────────────────────────────────────────────────────
function FaqStavba01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const ORANGE = "#FF6F0D";
  const DARK   = "#1a1a1a";
  const GRAY   = "#6b6b6b";
  const FONT   = "'Inter', sans-serif";

  const tagline = String(content.tagline ?? "Časté dotazy");
  const title   = String(content.title   ?? "Odpovědi na\nčasté otázky");
  const items   = (content.items as FaqItem[]) ?? [];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id={String(content.id ?? "faq")} style={{ backgroundColor: "#f8f7f4", fontFamily: FONT, padding: "clamp(64px,9vw,112px) 0" }} data-template="stavba-01">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div className="stavba-faq-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* Left — sticky header */}
          <div style={{ position: "sticky", top: 100 }}>
            <p style={{ color: ORANGE, fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </p>
            <h2 style={{ color: DARK, fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, whiteSpace: "pre-line" }}>
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>

          {/* Right — accordion */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item, i) => (
              <div key={i} style={{ borderBottom: "1px solid #e0e0e0" }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "22px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: FONT }}
                >
                  <span style={{ color: DARK, fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.4 }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" />
                  </span>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", backgroundColor: open === i ? ORANGE : "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open === i ? "#fff" : GRAY} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ transition: "transform 0.2s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <div style={{ paddingBottom: 22 }}>
                    <p style={{ color: GRAY, fontSize: "0.9rem", lineHeight: 1.75, margin: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" />
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .stavba-faq-grid { grid-template-columns: 1fr !important; gap: 36px !important; } }
      `}</style>
    </section>
  );
}

function FaqGrooming01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD = "#d0aa57";
  const DARK = "#101417";
  const FONT = "'Hanken Grotesk', 'Inter', sans-serif";

  type FItem = { question?: string; answer?: string };
  const heading = String(content.heading ?? "Časté dotazy");
  const kicker  = String(content.kicker  ?? "FAQ");
  const items   = (content.items as FItem[]) ?? [];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" data-template="grooming-01-faq" style={{ background: "#f6f6f6", fontFamily: FONT }}>
      <style>{`
        .gr01fq-inner{max-width:860px;margin:0 auto;padding:clamp(64px,8vw,100px) clamp(20px,5vw,48px);}
        .gr01fq-kicker{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${GOLD};margin:0 0 14px;text-align:center;}
        .gr01fq-h2{font-size:clamp(28px,3.5vw,44px);font-weight:700;color:${DARK};margin:0 0 56px;text-align:center;line-height:1.15;}
        .gr01fq-item{border-bottom:1px solid #e0e0e0;}
        .gr01fq-item:first-of-type{border-top:1px solid #e0e0e0;}
        .gr01fq-btn{width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px 0;text-align:left;}
        .gr01fq-q{font-size:17px;font-weight:600;color:${DARK};line-height:1.4;flex:1;}
        .gr01fq-icon{width:28px;height:28px;border-radius:50%;border:2px solid ${GOLD};display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s;}
        .gr01fq-btn[aria-expanded="true"] .gr01fq-icon{background:${GOLD};}
        .gr01fq-icon svg{transition:transform 0.3s;}
        .gr01fq-btn[aria-expanded="true"] .gr01fq-icon svg{transform:rotate(45deg);}
        .gr01fq-answer{overflow:hidden;transition:max-height 0.35s cubic-bezier(.4,0,.2,1),padding 0.35s;}
        .gr01fq-answer p{font-size:15px;color:#555;line-height:1.7;padding-bottom:24px;margin:0;}
      `}</style>
      <div className="gr01fq-inner">
        <p className="gr01fq-kicker">
          <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
        </p>
        <h2 className="gr01fq-h2">
          <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
        </h2>
        <div>
          {items.map((item, i) => (
            <div key={i} className="gr01fq-item">
              <button
                className="gr01fq-btn"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="gr01fq-q">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question ?? ""} tag="span" />
                </span>
                <span className="gr01fq-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <line x1="6" y1="0" x2="6" y2="12" stroke={open === i ? DARK : GOLD} strokeWidth="2" strokeLinecap="round"/>
                    <line x1="0" y1="6" x2="12" y2="6" stroke={open === i ? DARK : GOLD} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <div
                className="gr01fq-answer"
                style={{ maxHeight: open === i ? "400px" : "0px" }}
              >
                <p>
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer ?? ""} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ucetni-03-faq ─────────────────────────────────────────────────────────────
// White bg, centered H2 "Poradna" + lead, accordion items
// Q: bold #3c3d3d + green +/− toggle; A: #737b79; border-bottom #e4e4e4
// ─────────────────────────────────────────────────────────────────────────────
function FaqUcetni03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const DARK   = "#002000";
  const GREEN  = "#8ec63f";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', 'Helvetica Neue', Arial, sans-serif";

  const title = String(content.title ?? "Poradna");
  const lead  = String(content.lead  ?? "Naši poradnu využily již stovky lidí, protože dobrá rada zdarma je nad zlato.");

  const rawItems = (content.items as Array<{ question?: string; answer?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { question: "Jako OSVČ — mohu získat hypotéku?", answer: "Ano, OSVČ mohou hypotéku získat. Banky vyžadují zpravidla 2 roky daňových přiznání a stabilní příjem." },
    { question: "Je možné vzít si hypotéku na družstevní byt?", answer: "Standardně banky tuto hypotéku neposkytují. Existují ale alternativy — například převod bytu do osobního vlastnictví." },
    { question: "Co dělat, když mi banka zamítla hypotéku?", answer: "Zamítnutí jednou bankou neznamená konec. Každá banka má jiné podmínky a náš poradce vám pomůže najít tu pravou." },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <style>{`
        .ucn03faq-section {
          background: #ffffff;
          padding: 80px 40px;
          font-family: ${FONT_B};
        }
        .ucn03faq-inner { max-width: 860px; margin: 0 auto; }
        .ucn03faq-header { text-align: center; margin-bottom: 56px; }
        .ucn03faq-kicker {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${GREEN};
          margin-bottom: 12px;
        }
        .ucn03faq-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          font-weight: 800;
          color: ${DARK};
          margin: 0 0 16px 0;
        }
        .ucn03faq-lead {
          font-size: 1.02rem;
          color: #737b79;
          line-height: 1.65;
          margin: 0;
          max-width: 560px;
          margin: 0 auto;
        }
        .ucn03faq-item {
          border-bottom: 1px solid #e4e4e4;
        }
        .ucn03faq-item:first-child { border-top: 1px solid #e4e4e4; }
        .ucn03faq-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 22px 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .ucn03faq-q {
          font-family: ${FONT_H};
          font-size: 1rem;
          font-weight: 700;
          color: #3c3d3d;
          line-height: 1.4;
          flex: 1;
        }
        .ucn03faq-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${GREEN};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s;
        }
        .ucn03faq-icon.open { transform: rotate(45deg); }
        .ucn03faq-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        .ucn03faq-body.open {
          max-height: 400px;
          padding-bottom: 20px;
        }
        .ucn03faq-a {
          font-size: 0.95rem;
          color: #737b79;
          line-height: 1.75;
          margin: 0;
        }
        @media (max-width: 600px) {
          .ucn03faq-section { padding: 56px 20px; }
          .ucn03faq-q { font-size: 0.95rem; }
        }
      `}</style>

      <section className="ucn03faq-section" data-template="ucetni-03-faq">
        <div className="ucn03faq-inner">
          <div className="ucn03faq-header">
            <span className="ucn03faq-kicker">Časté dotazy</span>
            <h2 className="ucn03faq-h2">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            <p className="ucn03faq-lead">
              <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
            </p>
          </div>

          <div>
            {items.map((item, i) => (
              <div key={i} className="ucn03faq-item">
                <button className="ucn03faq-btn" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span className="ucn03faq-q">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={String(item.question ?? "")} tag="span" />
                  </span>
                  <span className={`ucn03faq-icon${open === i ? " open" : ""}`} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="#002000" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div className={`ucn03faq-body${open === i ? " open" : ""}`}>
                  <p className="ucn03faq-a">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={String(item.answer ?? "")} tag="span" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── instala-02 FAQ ──────────────────────────────────────────────────────────
function FaqInstala02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as Record<string, unknown>;
  const [open, setOpen] = useState<number | null>(null);

  const RED    = "#ee4036";
  const DARK   = "#111111";
  const WHITE  = "#ffffff";
  const FONT_H = "'Montserrat', sans-serif";
  const FONT_B = "'Roboto', sans-serif";

  const kicker   = String(c.kicker   ?? "Časté dotazy");
  const title    = String(c.title    ?? "Odpovědi na vaše otázky");
  const subtitle = String(c.subtitle ?? "Nenašli jste odpověď? Zavolejte nám.");
  const items    = (c.items as Array<{ question: string; answer: string }>) ?? [];

  return (
    <section
      data-template="instala-02-faq"
      style={{ backgroundColor: WHITE, fontFamily: FONT_B, padding: "96px 0" }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Roboto:wght@400;500&display=swap" />
      <style>{`        .i2faq-outer   { max-width: 880px; margin: 0 auto; padding: 0 48px; }
        .i2faq-header  { text-align: center; margin-bottom: 52px; }
        .i2faq-kicker  { font-family: ${FONT_H}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${RED}; margin: 0 0 14px; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .i2faq-kicker::before, .i2faq-kicker::after { content: ''; display: inline-block; width: 32px; height: 2px; background: ${RED}; }
        .i2faq-h2      { font-family: ${FONT_H}; font-size: clamp(26px, 3vw, 40px); font-weight: 800; color: ${DARK}; margin: 0 0 12px; line-height: 1.15; }
        .i2faq-sub     { font-size: 15px; color: #888; margin: 0; }

        .i2faq-list    { display: flex; flex-direction: column; gap: 0; border: 1.5px solid #e8e8e8; border-radius: 14px; overflow: hidden; }
        .i2faq-item    { border-bottom: 1px solid #e8e8e8; }
        .i2faq-item:last-child { border-bottom: none; }

        .i2faq-btn     { width: 100%; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 28px; text-align: left; transition: background .15s; }
        .i2faq-btn:hover { background: #fafafa; }
        .i2faq-btn.active { background: #fff8f7; }

        .i2faq-q       { font-family: ${FONT_H}; font-size: 15px; font-weight: 700; color: ${DARK}; line-height: 1.4; }
        .i2faq-btn.active .i2faq-q { color: ${RED}; }

        .i2faq-icon    { width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .2s, border-color .2s, transform .3s; }
        .i2faq-btn.active .i2faq-icon { background: ${RED}; border-color: ${RED}; transform: rotate(45deg); }

        .i2faq-body    { max-height: 0; overflow: hidden; transition: max-height .35s ease, padding .35s ease; }
        .i2faq-body.open { max-height: 400px; }
        .i2faq-a       { padding: 0 28px 22px; font-size: 15px; color: #555; line-height: 1.72; margin: 0; }

        @media (max-width: 640px) {
          .i2faq-outer { padding: 0 16px !important; }
          .i2faq-btn   { padding: 18px 20px !important; }
          .i2faq-a     { padding: 0 20px 18px !important; }
        }
      `}</style>

      <div className="i2faq-outer">
        <div className="i2faq-header">
          <p className="i2faq-kicker">
            <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
          </p>
          <h2 className="i2faq-h2">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          <p className="i2faq-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        </div>

        <div className="i2faq-list">
          {items.map((item, i) => (
            <div key={i} className="i2faq-item">
              <button
                className={`i2faq-btn${open === i ? " active" : ""}`}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="i2faq-q">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" />
                </span>
                <span className="i2faq-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke={open === i ? WHITE : "#999"} strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <div className={`i2faq-body${open === i ? " open" : ""}`}>
                <p className="i2faq-a">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── floors-01-faq ─────────────────────────────────────────────────────────────
function FaqFloors01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [open, setOpen] = useState<number | null>(null);

  const GREEN  = "#007d47";
  const DARK   = "#212529";
  const BORDER = "#dee2e6";
  const FONT   = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  const title = String(content.title ?? "Na co se nejčastěji ptáte?");
  type Item = { question: string; answer: string };
  const items = (content.items as Item[]) ?? [
    { question: "Jak vybrat správnou podlahu?",           answer: "Naprostým základem při výběru podlahoviny jsou vaše preference a způsob života. Neexistuje jedna univerzální podlaha — záleží na tom, zda preferujete snadnou údržbu, maximální komfort nebo specifický vzhled. Po technické stránce Vám rádi poradíme v kterémkoli showroomu." },
    { question: "Je vhodné podlahové vytápění?",          answer: "Záleží na materiálu. Podlahové vytápění bylo primárně vyvinuto pro dlažby. Pro dřevo či vinyl může být problematické — časté změny teplot poškozují materiál. V každém případě vám rádi poradíme, která podlaha je s podlahovým vytápěním kompatibilní." },
    { question: "Jaké jsou vlastnosti vinylových podlah?", answer: "Vinylové podlahy jsou oblíbené díky své pevnosti, voděodolnosti a věrohodné imitaci dřeva či kamene. Jejich nevýhodou je tepelná roztažnost — nejsou vhodné pro prostory vystavené extrémním teplotám (nad 26 °C nebo pod 15 °C)." },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .f01faq-section { padding: 40px 16px !important; }
          .f01faq-answer { padding-right: 8px !important; }
        }
      `}</style>
      <section className="f01faq-section" style={{ padding: "72px 20px", background: "#fff", fontFamily: FONT }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2"
            style={{ fontSize: 28, fontWeight: 800, color: DARK, textAlign: "center", margin: "0 0 48px", letterSpacing: "-0.01em" }}>
            {title}
          </GenericEditableText>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16, fontFamily: FONT }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, color: isOpen ? GREEN : DARK, lineHeight: 1.4, flex: 1 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span">{item.question}</GenericEditableText>
                    </span>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: isOpen ? GREEN : "transparent", border: `2px solid ${isOpen ? GREEN : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, border-color 0.2s" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <path d="M2 4l4 4 4-4" stroke={isOpen ? "#fff" : DARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                  <div style={{ overflow: "hidden", maxHeight: isOpen ? 400 : 0, transition: "max-height 0.3s ease" }}>
                    <p className="f01faq-answer" style={{ fontSize: 15, color: "#495057", lineHeight: 1.7, margin: "0 0 20px", paddingRight: 44 }}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span">{item.answer}</GenericEditableText>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ── malir-01-faq ──────────────────────────────────────────────────────────────
// 1:1 petrovomalovani.cz FAQ:
// - Světle šedé pozadí #f5f5f5, padding 80px 30px
// - Centrovaný blok max-width 770px
// - Amber tagline + Playfair H2, subtitle
// - Accordion: bílé karty, Raleway 900 otázka, amber chevron rotuje
// - Odpověď: 16px, šedá, text-align left, slide down
// ─────────────────────────────────────────────────────────────────────────────
function FaqMalir01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const [open, setOpen] = useState<number | null>(null);

  const AMBER    = "#E79B0E";
  const DARK     = "#1a1a1a";
  const MUTED    = "#555555";
  const PLAYFAIR = "'Playfair Display', 'Times New Roman', serif";
  const RALEWAY  = "'Raleway', sans-serif";

  const tagline  = String(content.tagline  ?? "Otázky a odpovědi");
  const title    = String(content.title    ?? "Časté dotazy");
  const subtitle = String(content.subtitle ?? "Podívejte se, jaké jsou nejčastější dotazy.");

  type FaqEntry = { question: string; answer: string };
  const items: FaqEntry[] = Array.isArray(content.items) && (content.items as unknown[]).length
    ? (content.items as FaqEntry[])
    : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Raleway:wght@400;600;900&display=swap" />
      <style>{`        .m01f-section { background: #f5f5f5; padding: 80px 30px; font-family: ${RALEWAY}; }
        .m01f-inner { max-width: 770px; margin: 0 auto; }
        .m01f-header { text-align: center; margin-bottom: 48px; }
        .m01f-tagline { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${AMBER}; margin-bottom: 12px; }
        .m01f-title { font-family: ${PLAYFAIR}; font-size: 36px; font-weight: 800; color: ${DARK}; margin: 0 0 12px; }
        .m01f-subtitle { font-size: 15px; color: ${MUTED}; margin: 0; line-height: 1.6; }
        .m01f-item { background: #fff; border-radius: 4px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
        .m01f-question { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; cursor: pointer; text-align: left; background: none; border: none; width: 100%; font-family: ${RALEWAY}; font-size: 16px; font-weight: 900; color: ${DARK}; line-height: 1.4; }
        .m01f-chevron { flex-shrink: 0; transition: transform 0.3s ease; color: ${AMBER}; }
        .m01f-chevron.open { transform: rotate(180deg); }
        .m01f-answer { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.3s ease; }
        .m01f-answer.open { max-height: 600px; }
        .m01f-answer-inner { padding: 0 24px 20px; font-size: 15px; line-height: 1.8; color: ${MUTED}; text-align: left; border-top: 2px dashed rgba(158,113,97,0.25); padding-top: 16px; }
        @media (max-width: 600px) { .m01f-section { padding: 60px 16px; } .m01f-title { font-size: 28px; } }
      `}</style>

      <section id="faq" className="m01f-section" data-template="malir-01">
        <div className="m01f-inner">
          <div className="m01f-header">
            <p className="m01f-tagline">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span">{tagline}</GenericEditableText>
            </p>
            <h2 className="m01f-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span">{title}</GenericEditableText>
            </h2>
            <p className="m01f-subtitle">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span">{subtitle}</GenericEditableText>
            </p>
          </div>

          {items.map((item, i) => (
            <div key={i} className="m01f-item">
              <button className="m01f-question" onClick={() => setOpen(open === i ? null : i)}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span">{item.question}</GenericEditableText>
                <svg className={`m01f-chevron${open === i ? " open" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`m01f-answer${open === i ? " open" : ""}`}>
                <div className="m01f-answer-inner">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span">{item.answer}</GenericEditableText>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
