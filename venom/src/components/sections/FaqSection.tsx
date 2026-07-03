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
  if (variant === "ananda-01-faq")    return <FaqAnanda01 content={content} sectionId={sectionId} />;
  if (variant === "florist-01-faq")   return <FaqFlorist01 content={content} sectionId={sectionId} />;

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
              <div key={i} className="bc-faq-item" style={{ borderBottom: `1px solid ${BORDER}`, position: "relative", transition: "padding-left 0.3s ease" }} data-open={open === i ? "true" : "false"}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="bc-faq-btn"
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
// Luxe Warm Physio Sanctuary — 2-col FAQ, sticky levý header + accordion vpravo
// Header: rail 06 + eyebrow + H2 italic accent + subheading + primary CTA
// Accordion: card border hairline, question Inter 600 s Instrument Serif italic Q number,
// smooth height animation, chevron rotate, aktivní item cocoa-tint bg
// ────────────────────────────────────────────────────────────────────────────
function FaqFitness01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const items         = ((content as { items?: FaqItem[] }).items ?? []) as FaqItem[];
  const sectionTag    = String(content.sectionTag    ?? "FAQ");
  const eyebrowMark   = String(content.eyebrowMark   ?? "06");
  const headingPre    = String(content.headingPre    ?? "Máte dotaz");
  const headingAccent = String(content.headingAccent ?? "před tím,");
  const headingPost   = String(content.headingPost   ?? "než se objednáte?");
  const subheading    = String(content.subheading    ?? "");
  const ctaText       = String(content.ctaText       ?? "Zeptat se přímo");
  const ctaHref       = String(content.ctaHref       ?? "/kontakt");
  const showHeader    = (content as { showHeader?: boolean }).showHeader !== false;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="fit01-faq" data-template="fitness-01" data-noheader={showHeader ? undefined : "y"}>
      <div className="fit01-faq-inner">
        <div className="fit01-faq-grid">
          {/* Left sticky header */}
          {showHeader && (
            <div className="fit01-faq-sticky">
              <div className="fit01-faq-copy">
                <div className="fit01-services-rail" aria-hidden="true">
                  <span className="fit01-rail-line" />
                  <span className="fit01-rail-mark">{eyebrowMark}</span>
                </div>
                <div className="fit01-services-eyebrow">
                  <span className="fit01-tagline-mark" aria-hidden="true" />
                  <GenericEditableText sectionId={sectionId} field="sectionTag" value={sectionTag} tag="span" />
                </div>
                <h2 className="fit01-services-h2">
                  <span className="fit01-h2-line">
                    <GenericEditableText sectionId={sectionId} field="headingPre" value={headingPre} tag="span" />
                  </span>
                  <span className="fit01-h2-line fit01-h2-line-accent">
                    <span className="fit01-h2-accent">
                      <GenericEditableText sectionId={sectionId} field="headingAccent" value={headingAccent} tag="span" />
                    </span>{" "}
                    <span className="fit01-h2-post">
                      <GenericEditableText sectionId={sectionId} field="headingPost" value={headingPost} tag="span" />
                    </span>
                  </span>
                </h2>
                {subheading && (
                  <p className="fit01-services-sub">
                    <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                  </p>
                )}
                {ctaText && (
                  <a href={ctaHref} className="fit01-faq-cta" data-btn="primary">
                    <span>
                      <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                    </span>
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 5h11M8 1l4 4-4 4"/></svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Right accordion */}
          <div className="fit01-faq-list">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className={`fit01-faq-item${isOpen ? " fit01-faq-item-open" : ""}`} style={{ ["--i" as string]: i }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="fit01-faq-q"
                    aria-expanded={isOpen}
                  >
                    <span className="fit01-faq-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="fit01-faq-q-text">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" />
                    </span>
                    <span className="fit01-faq-toggle" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                        <line x1="2" y1="7" x2="12" y2="7" />
                        <line x1="7" y1="2" x2="7" y2="12" className="fit01-faq-toggle-v" />
                      </svg>
                    </span>
                  </button>
                  <div className="fit01-faq-a-wrap" aria-hidden={!isOpen}>
                    <div className="fit01-faq-a">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

function FaqAnanda01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const GOLD   = "#AA813A";
  const CREAM  = "#F2EDE4";
  const BORDER = "#e2d8cc";
  const TEXT   = "#334155";
  const title  = String(content.title ?? "Časté dotazy");
  const items  = ((content as { items?: Array<{ q?: string; a?: string }> }).items ?? []);
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;
  return (
    <>
      <style>{`
        .an01faq { padding: clamp(64px,10vw,100px) 24px; background: ${CREAM}; }
        .an01faq-inner { max-width: 780px; margin: 0 auto; }
        .an01faq-title { font-family: 'Jost', sans-serif; font-size: clamp(22px,3vw,34px); font-weight: 300; letter-spacing: 4px; text-transform: uppercase; color: ${GOLD}; text-align: center; margin-bottom: 48px; }
        .an01faq-item { border-bottom: 1px solid ${BORDER}; }
        .an01faq-q { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 0; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 16px; font-weight: 400; color: ${TEXT}; background: none; border: none; width: 100%; text-align: left; }
        .an01faq-q svg { flex-shrink: 0; transition: transform .28s ease; color: ${GOLD}; }
        .an01faq-q.open svg { transform: rotate(180deg); }
        .an01faq-a { overflow: hidden; max-height: 0; transition: max-height .32s ease, padding .28s ease; font-family: 'Jost', sans-serif; font-size: 15px; line-height: 1.7; color: #64748b; }
        .an01faq-a.open { max-height: 400px; padding-bottom: 20px; }
      `}</style>
      <section className="an01faq" data-template="ananda-01-faq">
        <div className="an01faq-inner">
          <h2 className="an01faq-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {items.map((item, i) => (
            <div key={i} className="an01faq-item">
              <button
                className={`an01faq-q${open === i ? " open" : ""}`}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <GenericEditableText sectionId={sectionId} field={`items.${i}.q`} value={item.q ?? ""} tag="span" />
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6l6 6 6-6"/></svg>
              </button>
              <div className={`an01faq-a${open === i ? " open" : ""}`}>
                <GenericEditableText sectionId={sectionId} field={`items.${i}.a`} value={item.a ?? ""} tag="span" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── florist-01-faq ────────────────────────────────────────────────────────────
// Botanical Atelier Editorial luxe FAQ:
// - Warm ivory bg + editorial 2-col split
// - LEFT sticky header: eyebrow + Georgia italic H2 + Inter kicker + CTA card
//   "Nenašli jste odpověď?" s tel/mail + Georgia italic note
// - RIGHT accordion Q&A list: dotted olive-gold separators, Georgia italic questions
//   + expand icon (+/–) v gold, Inter 300 answer s slide-down transition
// - Corner brackets olive-gold na CTA card
function FaqFlorist01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const MOSS   = "#2f4a3a";
  const SAGE   = "#5c8a6a";
  const IVORY  = "#faf7f2";
  const IVORY2 = "#f4efe6";
  const INK    = "#2a1a0a";
  const INK70  = "rgba(42,26,10,0.72)";
  const GOLD   = "#c9b78a";
  const BLUSH  = "#e8c5c0";
  const GEORGIA = "Georgia, 'Times New Roman', serif";
  const INTER   = "Inter, system-ui, sans-serif";

  const eyebrow  = String(content.eyebrow  ?? "07 · ČASTÉ DOTAZY");
  const title    = String(content.title    ?? "Otázky, které nejčastěji dostáváme");
  const kicker   = String(content.kicker   ?? "Odpovědi na dotazy o doručení, objednávkách, péči o květiny a firemních zakázkách. Cokoli dalšího vám rádi vysvětlíme telefonicky.");
  const helpTitle = String(content.helpTitle ?? "Nenašli jste odpověď?");
  const helpCopy  = String(content.helpCopy  ?? "Zavolejte nebo napište. Odpovídáme obvykle do jedné hodiny.");
  const phone     = String(content.phone     ?? "+420 731 456 789");
  const phoneHref = String(content.phoneHref ?? "tel:+420731456789");
  const email     = String(content.email     ?? "atelier@petala.cz");
  const emailHref = String(content.emailHref ?? "mailto:atelier@petala.cz");

  const rawItems = (content.items as Array<{ question?: string; answer?: string }>) ?? (content.faq as Array<{ question?: string; answer?: string }>) ?? [];
  const items = rawItems.length > 0 ? rawItems : [
    { question: "Do kdy si mám objednat, aby kytice dorazila ještě dnes?", answer: "Objednávky přijaté do 15:00 doručujeme týž den mezi 17. a 21. hodinou. Po 15:00 automaticky přesouváme na následující den — v košíku si můžete vybrat konkrétní čas doručení." },
    { question: "Kam všude doručujete?",                                     answer: "Doručujeme po celém Brně a do vzdálenosti 15 km od centra. Doprava je zdarma při objednávce nad 1 500 Kč, jinak 149 Kč. Do vzdálenějších obcí domlouváme individuálně." },
    { question: "Jak poznám, co obdarovaný převezme?",                       answer: "Před odjezdem řidiče vám pošleme foto vaší kytice na e-mail nebo Instagram — vždy vidíte, co bude doručeno. Pokud vám něco nesedí, ještě to stihneme upravit." },
    { question: "Jak dlouho kytice vydrží?",                                 answer: "Používáme jen sezónní čerstvé květiny přímo od pěstitelů. Při běžné péči (voda každé 2 dny, chladno) vydrží 5—10 dnů. K objednávce přikládáme malou kartičku s péčí o konkrétní květiny." },
    { question: "Můžu k objednávce přidat osobní vzkaz?",                   answer: "Ano. Do každé kytice vkládáme ručně malovanou kartičku Petala s vaším vzkazem — až 300 znaků. Vzkaz můžete napsat při objednávce v košíku." },
    { question: "Připravujete i svatební floristiku a firemní zakázky?",   answer: "Ano. Svatební kytice, výzdobu obřadu i sálů děláme podle individuálního brief-u. Pro firmy zajišťujeme týdenní dodávky do kanceláří i eventovou floristiku. Napište nám a domluvíme schůzku v ateliéru." }
  ];

  const [open, setOpen] = useState<number | null>(0);

  const showHeader = !!(eyebrow.trim() || title.trim());

  return (
    <section id="faq" data-template="florist-01" className="f01faq" style={{ background: IVORY, fontFamily: INTER, padding: "96px 24px 108px" }}>
      <style>{`
        .f01faq-inner { max-width: 1280px; margin: 0 auto; }
        .f01faq-grid { display: grid; grid-template-columns: minmax(0, 420px) 1fr; gap: 72px; align-items: flex-start; }

        /* LEFT sticky */
        .f01faq-left { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 24px; }
        .f01faq-eye { display: inline-flex; align-items: center; gap: 14px; font-family: ${INTER}; font-weight: 500; font-size: 11px; letter-spacing: 0.34em; text-transform: uppercase; color: ${MOSS}; }
        .f01faq-eye i { width: 26px; height: 1px; background: ${GOLD}; display: inline-block; }
        .f01faq-eye em { color: ${GOLD}; font-style: normal; font-size: 10px; }
        .f01faq-h { font-family: ${GEORGIA}; font-style: italic; font-weight: 400; font-size: clamp(30px, 3.6vw, 44px); line-height: 1.1; color: ${INK}; margin: 0; letter-spacing: -0.012em; }
        .f01faq-k { font-family: ${INTER}; font-weight: 300; font-size: 15px; line-height: 1.7; color: ${INK70}; margin: 0; max-width: 380px; }

        .f01faq-help { position: relative; margin-top: 8px; padding: 30px 28px 28px; background: ${IVORY2}; border: 1px solid ${GOLD}; }
        .f01faq-help::before { content: ""; position: absolute; top: -1px; left: -1px; width: 32px; height: 32px; border-top: 2px solid ${MOSS}; border-left: 2px solid ${MOSS}; }
        .f01faq-help::after { content: ""; position: absolute; bottom: -1px; right: -1px; width: 32px; height: 32px; border-bottom: 2px solid ${MOSS}; border-right: 2px solid ${MOSS}; }
        .f01faq-help-eye { font-family: ${INTER}; font-weight: 500; font-size: 10.5px; letter-spacing: 0.3em; text-transform: uppercase; color: ${MOSS}; }
        .f01faq-help-h { font-family: ${GEORGIA}; font-style: italic; font-size: 22px; color: ${INK}; margin: 8px 0 12px; letter-spacing: -0.005em; }
        .f01faq-help-p { font-family: ${INTER}; font-weight: 300; font-size: 13.5px; line-height: 1.6; color: ${INK70}; margin: 0 0 18px; }
        .f01faq-help-row { display: flex; flex-direction: column; gap: 10px; }
        .f01faq-help-row a { display: inline-flex; align-items: center; gap: 10px; font-family: ${GEORGIA}; font-style: italic; font-size: 16px; color: ${INK}; text-decoration: none; transition: color 0.3s ease; letter-spacing: -0.005em; }
        .f01faq-help-row a:hover { color: ${MOSS}; }
        .f01faq-help-row a svg { color: ${GOLD}; }

        /* RIGHT accordion */
        .f01faq-list { display: flex; flex-direction: column; gap: 0; border-top: 1px solid ${GOLD}; }
        .f01faq-item { border-bottom: 1px dotted ${GOLD}; padding: 6px 0; }
        .f01faq-btn { width: 100%; background: transparent; border: none; padding: 26px 0; display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: baseline; text-align: left; cursor: pointer; color: ${INK}; }
        .f01faq-num { font-family: ${GEORGIA}; font-style: italic; font-size: 14px; color: ${GOLD}; letter-spacing: 0.06em; }
        .f01faq-q { font-family: ${GEORGIA}; font-style: italic; font-weight: 400; font-size: clamp(18px, 1.6vw, 22px); line-height: 1.3; color: ${INK}; margin: 0; letter-spacing: -0.008em; transition: color 0.35s ease; }
        .f01faq-btn:hover .f01faq-q { color: ${MOSS}; }
        .f01faq-btn:hover .f01faq-icon { color: ${MOSS}; border-color: ${MOSS}; }
        .f01faq-icon { width: 34px; height: 34px; border-radius: 50%; border: 1px solid ${GOLD}; display: inline-flex; align-items: center; justify-content: center; color: ${INK70}; transition: color 0.35s ease, border-color 0.35s ease, transform 0.4s cubic-bezier(.6,.05,.35,1); position: relative; }
        .f01faq-icon::before, .f01faq-icon::after { content: ""; position: absolute; background: currentColor; }
        .f01faq-icon::before { width: 12px; height: 1px; }
        .f01faq-icon::after { width: 1px; height: 12px; transition: transform 0.4s cubic-bezier(.6,.05,.35,1); }
        .f01faq-item.open .f01faq-icon { transform: rotate(180deg); background: ${MOSS}; color: ${IVORY}; border-color: ${MOSS}; }
        .f01faq-item.open .f01faq-icon::after { transform: scaleY(0); }

        .f01faq-panel { max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(.6,.05,.35,1); }
        .f01faq-item.open .f01faq-panel { max-height: 500px; }
        .f01faq-a { padding: 0 44px 30px 62px; font-family: ${INTER}; font-weight: 300; font-size: 15px; line-height: 1.75; color: ${INK70}; margin: 0; max-width: 720px; }

        @media(max-width:960px){
          .f01faq-grid { grid-template-columns: 1fr; gap: 40px; }
          .f01faq-left { position: static; }
        }
        @media(max-width:600px){
          .f01faq { padding: 64px 20px 76px; }
          .f01faq-btn { padding: 22px 0; grid-template-columns: 1fr auto; gap: 14px; }
          .f01faq-num { display: none; }
          .f01faq-a { padding: 0 8px 26px 0; }
          .f01faq-help { padding: 24px 22px 22px; }
        }
      `}</style>

      <div className="f01faq-inner">
        <div className="f01faq-grid">
          <div className="f01faq-left">
            {showHeader && (
              <>
                <span className="f01faq-eye"><i /><em>✿</em>
                  <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
                  <em>✿</em><i />
                </span>
                <h2 className="f01faq-h">
                  <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
                </h2>
                <p className="f01faq-k">
                  <GenericEditableText sectionId={sectionId} field="kicker" value={kicker} tag="span" />
                </p>
              </>
            )}

            <aside className="f01faq-help">
              <span className="f01faq-help-eye">POMOC · KDYKOLIV</span>
              <h3 className="f01faq-help-h">
                <GenericEditableText sectionId={sectionId} field="helpTitle" value={helpTitle} tag="span" />
              </h3>
              <p className="f01faq-help-p">
                <GenericEditableText sectionId={sectionId} field="helpCopy" value={helpCopy} tag="span" />
              </p>
              <div className="f01faq-help-row">
                <a href={phoneHref}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" stroke="currentColor" strokeWidth="1.4"/></svg>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
                <a href={emailHref}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4z M4 6l8 6 8-6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </div>
            </aside>
          </div>

          <div className="f01faq-list">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className={`f01faq-item ${isOpen ? "open" : ""}`}>
                  <button className="f01faq-btn" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                    <span className="f01faq-num">0{i + 1}</span>
                    <h3 className="f01faq-q">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question ?? ""} tag="span" />
                    </h3>
                    <span className="f01faq-icon" aria-hidden />
                  </button>
                  <div className="f01faq-panel">
                    <p className="f01faq-a">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer ?? ""} tag="span" />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
