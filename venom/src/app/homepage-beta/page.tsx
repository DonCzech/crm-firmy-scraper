"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── tiny helpers ─────────────────────────────────────────── */
const GREEN = "#22c55e";
const GREEN_DARK = "#16a34a";
const GREEN_GLOW = "0 10px 28px rgba(34,197,94,0.30)";

function Btn({ href = "#", children, outline = false, className = "", style: extraStyle }: {
  href?: string; children: React.ReactNode; outline?: boolean; className?: string; style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      className={className}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "13px 28px", borderRadius: 8, fontFamily: "Poppins,sans-serif",
        fontSize: 15, fontWeight: 600, textDecoration: "none", cursor: "pointer",
        transition: "all .18s ease",
        ...(outline
          ? { background: "transparent", color: "#111827", border: "2px solid #d1d5db" }
          : { background: GREEN, color: "#fff", border: "none", boxShadow: GREEN_GLOW }),
        ...extraStyle,
      }}
      onMouseEnter={e => {
        if (outline) { (e.currentTarget as HTMLAnchorElement).style.borderColor = GREEN; (e.currentTarget as HTMLAnchorElement).style.color = GREEN; }
        else { (e.currentTarget as HTMLAnchorElement).style.background = GREEN_DARK; }
      }}
      onMouseLeave={e => {
        if (outline) { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d1d5db"; (e.currentTarget as HTMLAnchorElement).style.color = "#111827"; }
        else { (e.currentTarget as HTMLAnchorElement).style.background = GREEN; }
      }}
    >{children}</a>
  );
}

/* ─── Header ───────────────────────────────────────────────── */
function Header() {
  const [open, setOpen] = useState(false);
  const navLinks = ["Funkce", "Šablony", "Integrace", "Ceník", "Reference", "Podpora"];
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <a href="/homepage-beta" style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 26, color: "#111827", textDecoration: "none", letterSpacing: "-0.5px" }}>
          <span style={{ color: GREEN }}>w</span>ebero
        </a>
        {/* Nav desktop */}
        <nav style={{ display: "flex", gap: 32, listStyle: "none" }} className="hb-nav">
          {navLinks.map(n => (
            <a key={n} href="#" style={{ fontFamily: "Poppins,sans-serif", fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none", transition: "color .15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = GREEN)} onMouseLeave={e => (e.currentTarget.style.color = "#374151")}>{n}</a>
          ))}
        </nav>
        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }} className="hb-nav">
          <a href="#" style={{ fontFamily: "Poppins,sans-serif", fontSize: 14, fontWeight: 500, color: "#374151", textDecoration: "none" }}>Přihlásit se</a>
          <Btn href="#">Vyzkoušet zdarma</Btn>
        </div>
        {/* Hamburger */}
        <button className="hb-hamburger" onClick={() => setOpen(!open)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 4 }}>
          {open ? "✕" : "☰"}
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="hb-hamburger" style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "16px 24px 24px" }}>
          {navLinks.map(n => <a key={n} href="#" style={{ display: "block", padding: "10px 0", fontFamily: "Poppins,sans-serif", fontSize: 15, fontWeight: 500, color: "#374151", textDecoration: "none", borderBottom: "1px solid #f3f4f6" }} onClick={() => setOpen(false)}>{n}</a>)}
          <a href="#" style={{ display: "block", padding: "10px 0", fontFamily: "Poppins,sans-serif", fontSize: 15, color: "#374151", textDecoration: "none" }}>Přihlásit se</a>
          <Btn href="#" style={{ display: "block", textAlign: "center", marginTop: 12 }}>Vyzkoušet zdarma</Btn>
        </div>
      )}
      <style>{`
        @media(max-width:900px){.hb-nav{display:none!important}}
        @media(max-width:900px){.hb-hamburger{display:block!important}}
      `}</style>
    </header>
  );
}

/* ─── Editor Mockup (Hero) ─────────────────────────────────── */
function EditorMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 560 }}>
      {/* Glow */}
      <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse at 60% 40%, rgba(34,197,94,0.12) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)", zIndex: 0, borderRadius: "50%" }} />
      {/* Browser frame */}
      <div style={{ position: "relative", zIndex: 1, background: "#fff", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #e5e7eb" }}>
        {/* Topbar */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 14, color: "#111827" }}><span style={{ color: GREEN }}>w</span>ebero</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>📱</span>
            <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>💻</span>
            <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>🖥</span>
          </div>
          <div style={{ background: GREEN, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 6, fontFamily: "Poppins,sans-serif" }}>Publikovat</div>
        </div>
        {/* Body: sidebar + canvas */}
        <div style={{ display: "flex", height: 320 }}>
          {/* Sidebar */}
          <div style={{ width: 64, background: "#f8fafc", borderRight: "1px solid #e5e7eb", padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {["Text", "Obrázek", "Tlačítko", "Sekce", "Rozložení", "Formulář", "Více"].map(item => (
              <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, background: "#e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  {item === "Text" ? "T" : item === "Obrázek" ? "🖼" : item === "Tlačítko" ? "⬜" : item === "Sekce" ? "▣" : item === "Rozložení" ? "⊞" : item === "Formulář" ? "📝" : "···"}
                </div>
                <span style={{ fontSize: 9, color: "#6b7280", fontFamily: "Poppins,sans-serif", fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
          {/* Canvas */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Image src="/preview-ananda-demo.jpg" alt="Webero editor náhled" fill style={{ objectFit: "cover", objectPosition: "top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.42) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20 }}>
              <div style={{ color: "#fff", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 18, textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Dopřejte si čas<br/>jen pro sebe</div>
              <div style={{ background: GREEN, color: "#fff", fontSize: 11, fontWeight: 600, padding: "7px 18px", borderRadius: 6, fontFamily: "Poppins,sans-serif", cursor: "pointer" }}>Rezervovat nyní</div>
            </div>
          </div>
        </div>
        {/* Bottom toolbar */}
        <div style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb", padding: "8px 16px", display: "flex", gap: 12, alignItems: "center" }}>
          {["B", "I", "U", "🔗", "📋", "↩", "↪"].map(t => (
            <span key={t} style={{ fontSize: 12, color: "#6b7280", cursor: "pointer", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Floating performance card */}
      <div style={{ position: "absolute", right: -24, top: "28%", background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.13)", padding: "16px 20px", zIndex: 10, minWidth: 160, border: "1px solid #e5e7eb" }}>
        <div style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 10, letterSpacing: "0.05em" }}>Výkon webu</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Circle */}
          <div style={{ position: "relative", width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle cx="26" cy="26" r="22" fill="none" stroke={GREEN} strokeWidth="4" strokeDasharray={`${2 * Math.PI * 22 * 0.99} ${2 * Math.PI * 22 * 0.01}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 13, color: GREEN, lineHeight: 1 }}>99</span>
              <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 8, color: "#6b7280" }}>/100</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[["Performance", "99"], ["Accessibility", "98"], ["Best Practices", "100"], ["SEO", "99"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 9, color: "#6b7280" }}>{k}</span>
                <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 9, fontWeight: 700, color: GREEN }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Live Editor Mockup (second mockup) ───────────────────── */
function LiveEditorMockup() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 540 }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #e5e7eb" }}>
        {/* Topbar */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 14, color: "#111827" }}><span style={{ color: GREEN }}>w</span>ebero</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: "#e5e7eb", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>Text</span>
            <span style={{ background: "#e5e7eb", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>Barva</span>
            <span style={{ background: "#e5e7eb", borderRadius: 4, padding: "3px 8px", fontSize: 10, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>Méně</span>
          </div>
          <div style={{ background: GREEN, color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 6, fontFamily: "Poppins,sans-serif" }}>Publikovat</div>
        </div>
        {/* Body */}
        <div style={{ display: "flex", height: 300 }}>
          {/* Left sidebar */}
          <div style={{ width: 64, background: "#f8fafc", borderRight: "1px solid #e5e7eb", padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {["Text", "Obrázek", "Tlačítko", "Sekce", "Rozložení", "Formulář", "Více"].map(item => (
              <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: 28, height: 28, background: item === "Text" ? "#dcfce7" : "#e5e7eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  {item === "Text" ? <span style={{ color: GREEN, fontWeight: 800, fontSize: 13 }}>T</span> : item === "Obrázek" ? "🖼" : item === "Tlačítko" ? "⬜" : item === "Sekce" ? "▣" : item === "Rozložení" ? "⊞" : item === "Formulář" ? "📝" : "···"}
                </div>
                <span style={{ fontSize: 9, color: item === "Text" ? GREEN : "#6b7280", fontFamily: "Poppins,sans-serif", fontWeight: item === "Text" ? 600 : 500 }}>{item}</span>
              </div>
            ))}
          </div>
          {/* Canvas */}
          <div style={{ flex: 1, background: "#f1f5f9", position: "relative", padding: 20 }}>
            {/* Selected text element */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "20px 24px", border: `2px solid ${GREEN}`, boxShadow: "0 4px 16px rgba(34,197,94,0.15)", marginBottom: 12 }}>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 18, color: "#111827", lineHeight: 1.3 }}>Zážitky, které<br/>zůstávají</div>
              <div style={{ position: "absolute", top: -1, left: -1, right: -1, bottom: -1, border: `1px dashed ${GREEN}`, borderRadius: 10, pointerEvents: "none" }} />
            </div>
            {/* Decorative plant image stub */}
            <div style={{ position: "absolute", right: 16, bottom: 16, width: 80, height: 100, background: "linear-gradient(135deg,#d1fae5,#bbf7d0)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🪴</div>
            {/* CTA */}
            <div style={{ display: "inline-block", background: GREEN, color: "#fff", fontSize: 11, fontWeight: 700, padding: "8px 18px", borderRadius: 6, fontFamily: "Poppins,sans-serif" }}>Objednat se</div>
          </div>
          {/* Right panel */}
          <div style={{ width: 120, background: "#f8fafc", borderLeft: "1px solid #e5e7eb", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", fontFamily: "Poppins,sans-serif" }}>Text</div>
            {[["Písmo", "Poppins"], ["Velikost", "28"], ["Váha", "Bold"], ["Barva", ""], ["Mezery", "12"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "Poppins,sans-serif" }}>{k}</div>
                <div style={{ background: "#e5e7eb", borderRadius: 4, padding: "3px 6px", fontSize: 9, color: "#374151", fontFamily: "Poppins,sans-serif", marginTop: 2 }}>{v || "■■■■"}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom toolbar */}
        <div style={{ background: "#f8fafc", borderTop: "1px solid #e5e7eb", padding: "8px 16px", display: "flex", gap: 12 }}>
          {["B", "I", "U", "🔗", "📋", "↩", "↪"].map(t => (
            <span key={t} style={{ fontSize: 12, color: "#6b7280", cursor: "pointer", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>{t}</span>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280", fontFamily: "Poppins,sans-serif" }}>12px</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Template Card ─────────────────────────────────────────── */
function TemplateCard({ title, desc, img, badge }: { title: string; desc: string; img: string; badge: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: 14, overflow: "hidden",
        border: "1px solid #e5e7eb",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "box-shadow .2s, transform .2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", height: 180, background: "linear-gradient(135deg,#e0f2fe,#dbeafe)", overflow: "hidden" }}>
        {img && <Image src={img} alt={title} fill style={{ objectFit: "cover", objectPosition: "top" }} />}
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.95)", borderRadius: 8, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: "#374151", fontFamily: "Poppins,sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {badge}
        </div>
        {hovered && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: GREEN, color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "Poppins,sans-serif" }}>Vybrat šablonu</div>
        </div>}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 14, color: "#111827" }}>{title}</div>
        <div style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── FAQ Item ──────────────────────────────────────────────── */
function FaqItem({ q }: { q: string }) {
  const [open, setOpen] = useState(false);
  const answers: Record<string, string> = {
    "Je Webero opravdu bez programování?": "Ano, Webero je plně vizuální editor. Vše upravíte kliknutím, přetažením nebo zadáním textu – žádný kód není potřeba.",
    "Mohu si web vyzkoušet zdarma?": "Ano, první měsíc je zdarma. Kreditní karta není potřeba.",
    "Je hosting zahrnutý v ceně?": "Ano, rychlý hosting v EU je součástí každého tarifu.",
    "Mohu připojit vlastní doménu?": "Ano, vlastní doménu připojíte jednoduše v nastavení webu.",
    "Jak funguje integrace s Rezora?": "Propojení s Rezora nastavíte za pár minut v sekci Integrace. Rezervační systém se automaticky zobrazí na vašem webu.",
    "Je můj web optimalizovaný pro Google?": "Ano, každý web dosahuje skóre 99/100 v Google PageSpeed. SEO nástroje jsou součástí platformy.",
    "Co když potřebuji pomoc?": "Česká podpora je vám k dispozici každý pracovní den. Odpovídáme do 24 hodin.",
    "Mohu kdykoli změnit nebo zrušit tarif?": "Ano, tarif nebo zrušení lze provést kdykoli bez závazků a sankcí.",
  };
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 0", cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 14, fontWeight: 600, color: "#111827" }}>{q}</span>
        <span style={{ color: open ? GREEN : "#6b7280", fontSize: 18, fontWeight: 300, flexShrink: 0, transition: "color .15s" }}>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
          {answers[q] ?? "Odpověď brzy doplníme."}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function HomepageBeta() {
  const [activeFilter, setActiveFilter] = useState("Všechny");
  const filters = ["Všechny", "Byznys", "Služby", "Zdraví a krása", "Gastronomie", "Osobní", "Reality", "Ostatní"];

  const templates = [
    { title: "Barber & Salon", desc: "Elegantní styl pro moderní salony a holiče.", img: "/preview-barber-urban.jpg", badge: "✂ Salony", cat: "Zdraví a krása" },
    { title: "Wellness & Masáže", desc: "Klidná a harmonická šablona pro wellness a masážní služby.", img: "/preview-ananda-demo.jpg", badge: "🌿 Wellness", cat: "Zdraví a krása" },
    { title: "Advokát & Poradce", desc: "Důstojná reprezentace pro právníky a poradce.", img: "", badge: "⚖ Právo", cat: "Byznys" },
    { title: "Reality & Developer", desc: "Prezentujte nemovitosti přehledně a atraktivně.", img: "/preview-escape-demo.jpg", badge: "🏠 Reality", cat: "Reality" },
    { title: "Restaurace & Kavárna", desc: "Lákavé šablony pro restaurace, kavárny a bistro.", img: "/preview-tribo-demo.jpg", badge: "🍽 Gastronomie", cat: "Gastronomie" },
    { title: "Osobní značka / Kouč", desc: "Budujte svou značku a oslovte správné publikum.", img: "/preview-petramechurova.jpg", badge: "👤 Osobní", cat: "Osobní" },
  ];

  const filtered = activeFilter === "Všechny" ? templates : templates.filter(t => t.cat === activeFilter);

  const faqLeft = [
    "Je Webero opravdu bez programování?",
    "Mohu si web vyzkoušet zdarma?",
    "Je hosting zahrnutý v ceně?",
    "Mohu připojit vlastní doménu?",
  ];
  const faqRight = [
    "Jak funguje integrace s Rezora?",
    "Je můj web optimalizovaný pro Google?",
    "Co když potřebuji pomoc?",
    "Mohu kdykoli změnit nebo zrušit tarif?",
  ];

  return (
    <div style={{ fontFamily: "Poppins,sans-serif", background: "#fff", color: "#111827" }}>
      <Header />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ paddingTop: 68 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="hb-hero-grid">
          {/* Left */}
          <div>
            <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(36px,4.5vw,56px)", lineHeight: 1.12, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              Profesionální web<br/>bez programování.
            </h1>
            <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "clamp(22px,3vw,34px)", color: GREEN, lineHeight: 1.25, marginBottom: 20 }}>
              Rychlý, přehledný<br/>a připravený růst.
            </div>
            <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 16, color: "#4b5563", lineHeight: 1.65, marginBottom: 32, maxWidth: 480 }}>
              Vytvořte moderní web během pár minut. S live editorem, profesionálními šablonami, špičkovým výkonem a napojením na doplňky jako Rezora.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              <Btn href="#">Vyzkoušet zdarma</Btn>
              <Btn href="#sablony" outline>Prohlédnout šablony</Btn>
            </div>
            {/* Trust row */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { icon: "</>", label: "Bez kódu" },
                { icon: "🇨🇿", label: "Česká podpora" },
                { icon: "99", label: "99/100 Google PageSpeed" },
                { icon: "🇪🇺", label: "Hosting v EU" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14, color: GREEN, fontWeight: 700 }}>{icon}</span>
                  <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right – editor mockup */}
          <div style={{ display: "flex", justifyContent: "flex-end" }} className="hb-hero-right">
            <EditorMockup />
          </div>
        </div>
      </section>

      {/* ── FEATURE ROW ──────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} className="hb-features-grid">
          {[
            { icon: "✏️", title: "Live editor bez omezení", desc: "Upravujte texty, obrázky a sekce stránek přesně tak, jak to chcete." },
            { icon: "🖼️", title: "Šablony pro každý obor", desc: "Vyberte si z více než 100 profesionálních šablon a přizpůsobte je sobě." },
            { icon: "⚡", title: "Výkon a SEO na prvním místě", desc: "Google PageSpeed 99/100, rychlý hosting v EU, který vám pomůže růst." },
            { icon: "🔌", title: "Napojení na doplňky", desc: "Snadno propojte Rezoru, rezervační, blog a další služby." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 4 }}>{title}</div>
                <div style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEMPLATES ────────────────────────────────────────── */}
      <section id="sablony" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,40px)", color: "#111827", margin: 0 }}>Více než 100 profesionálních šablon</h2>
            <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 16, color: "#6b7280", marginTop: 10, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>Moderní, responzivní a připravené k úpravám. Vyberte si tu pravou pro váš projekt.</p>
          </div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 36, marginTop: 28 }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  fontFamily: "Poppins,sans-serif", fontSize: 13, fontWeight: 600, padding: "8px 18px",
                  borderRadius: 8, cursor: "pointer", border: "none", transition: "all .15s",
                  background: activeFilter === f ? GREEN : "#f3f4f6",
                  color: activeFilter === f ? "#fff" : "#374151",
                  boxShadow: activeFilter === f ? GREEN_GLOW : "none",
                }}
              >{f}</button>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="hb-templates-grid">
            {filtered.map(t => <TemplateCard key={t.title} {...t} />)}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Btn href="#" outline>Prohlédnout všechny šablony</Btn>
          </div>
        </div>
      </section>

      {/* ── LIVE EDITOR ──────────────────────────────────────── */}
      <section style={{ background: "#fafafa", padding: "80px 24px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="hb-hero-grid">
          {/* Left */}
          <div>
            <div style={{ display: "inline-block", background: "#dcfce7", color: GREEN, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, letterSpacing: "0.08em", marginBottom: 18, fontFamily: "Poppins,sans-serif" }}>LIVE EDITOR</div>
            <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(28px,3vw,38px)", color: "#111827", margin: "0 0 16px", lineHeight: 1.2 }}>Tvořte přesně tak,<br/>jak chcete</h2>
            <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 15, color: "#4b5563", lineHeight: 1.65, marginBottom: 24 }}>Náš live editor vám dává naprostou svobodu. Bez kódu, bez omezení.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Drag & Drop – přetahujte prvky jednoduše",
                "Klikněte a upravte – texty, obrázky, barvy",
                "Responzivní náhled pro mobil, tablet i desktop",
                "Sekce, rozložení, typografie, galerie a další",
                "Rychlé úpravy a okamžité výsledky",
              ].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: GREEN, fontWeight: 700, fontSize: 15, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Right */}
          <div>
            <LiveEditorMockup />
          </div>
        </div>
      </section>

      {/* ── PERFORMANCE + INTEGRATIONS ───────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20, marginBottom: 40 }} className="hb-perf-grid">
            {[
              { icon: "⚡", score: "99/100", title: "Google PageSpeed", desc: "Špičkový výkon pro vaše pozice" },
              { icon: "🏢", score: "", title: "Rychlý hosting v EU", desc: "Výkonné servery s vysokou dostupností" },
              { icon: "🔍", score: "", title: "SEO nástroje", desc: "Title, meta popis, SEO, 301 a další" },
              { icon: "📱", score: "", title: "Mobilní verze automaticky", desc: "Vypadá skvěle na každém zařízení" },
              { icon: "🔌", score: "", title: "Integrace", desc: "Rezora, formuláře, analytika, blog a další" },
            ].map(({ icon, score, title, desc }) => (
              <div key={title} style={{ background: "#f0fdf4", borderRadius: 14, padding: "24px 18px", border: "1px solid #bbf7d0", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                {score && <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 22, color: GREEN, marginBottom: 4 }}>{score}</div>}
                <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 6 }}>{title}</div>
                <div style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
          {/* Integrations bar */}
          <div style={{ background: "#f8fafc", borderRadius: 14, padding: "20px 32px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>Oblíbené integrace:</span>
            {["Rezora", "Google Analytics", "Meta Pixel", "Mailchimp", "YouTube", "Google Maps", "+ další"].map(i => (
              <span key={i} style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, fontWeight: 600, color: i === "+ další" ? "#9ca3af" : "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 12px" }}>{i}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section style={{ background: "#fafafa", padding: "80px 24px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,40px)", color: "#111827", margin: "0 0 10px" }}>Jednoduché a férové ceny</h2>
            <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 16, color: "#6b7280" }}>Vše, co potřebujete pro úspěšný web. Bez skrytých poplatků.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 860, margin: "0 auto" }} className="hb-pricing-grid">
            {/* Main card */}
            <div style={{ background: "#fff", borderRadius: 18, border: `2px solid ${GREEN}`, padding: "36px 32px", boxShadow: "0 8px 40px rgba(34,197,94,0.12)", position: "relative" }}>
              <div style={{ position: "absolute", top: -14, left: 24, background: GREEN, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, fontFamily: "Poppins,sans-serif", letterSpacing: "0.05em" }}>NEJOBLÍBENĚJŠÍ</div>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 8 }}>Pronájem webu</div>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 42, color: "#111827", lineHeight: 1 }}>500 Kč<span style={{ fontSize: 16, fontWeight: 500, color: "#6b7280" }}> / měsíčně</span></div>
              <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#6b7280", marginTop: 10, marginBottom: 20 }}>Vše pro váš profesionální web v jednom balíčku.</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
                {["Live editor stránek", "100+ profesionálních šablon", "Rychlý hosting v EU", "SSL certifikát zdarma", "Základní SEO nástroje", "Česká podpora"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ color: GREEN, fontWeight: 700 }}>✓</span>
                    <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#374151" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Btn href="#" style={{ width: "100%", justifyContent: "center" } as React.CSSProperties}>Vyzkoušet zdarma</Btn>
              <div style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 10 }}>Bez závazku. Zrušte kdykoli.</div>
            </div>
            {/* Secondary card */}
            <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", padding: "36px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", marginBottom: 8 }}>Doplňky a rozšíření</div>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 20, color: "#374151" }}>Podle vašich potřeb</div>
              <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#6b7280", marginTop: 10, marginBottom: 20 }}>Rozšiřte svůj web o pokročilé funkce dle vašich požadavků.</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
                {["Rezora – rezervační systém", "Pokročilé formuláře", "Vícejazyčné verze", "E-shopy a platby online", "Vlastní doména"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ color: GREEN, fontWeight: 700 }}>✓</span>
                    <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#374151" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#" style={{ display: "block", textAlign: "center", padding: "13px 28px", borderRadius: 8, border: "2px solid #d1d5db", fontFamily: "Poppins,sans-serif", fontSize: 15, fontWeight: 600, color: "#374151", textDecoration: "none", transition: "border-color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = GREEN)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#d1d5db")}>Zjistit více</a>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 20, fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#9ca3af" }}>Všechny ceny jsou bez DPH.</div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,36px)", color: "#111827", textAlign: "center", marginBottom: 48 }}>Co o Webero říkají naši zákazníci</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }} className="hb-testi-grid">
            {[
              { quote: "Web jsem měl hotový za jeden večer. Editor je intuitivní a šablony jsou opravdu profesionální.", name: "Jan Dvořák", role: "Majitel salonu", avatar: "JD" },
              { quote: "Rychlost webu je skvělá a podpora vždy rychle poradí. Rezora integrace funguje bezchybně.", name: "Petra Novotná", role: "Wellness centrum", avatar: "PN" },
              { quote: "Konečně nástroj, kde nepotřebuju programátora. Vše upravím sám během pár kliknutí.", name: "Tomáš K.", role: "Kouč a mentor", avatar: "TK" },
            ].map(({ quote, name, role, avatar }) => (
              <div key={name} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>„{quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13 }}>{avatar}</div>
                  <div>
                    <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13, color: "#111827" }}>{name}</div>
                    <div style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#9ca3af" }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ background: "#fafafa", padding: "80px 24px", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,36px)", color: "#111827", textAlign: "center", marginBottom: 48 }}>Často kladené dotazy</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 56px" }} className="hb-faq-grid">
            <div>{faqLeft.map(q => <FaqItem key={q} q={q} />)}</div>
            <div>{faqRight.map(q => <FaqItem key={q} q={q} />)}</div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#ecfdf5 100%)", padding: "80px 24px", borderTop: "1px solid #bbf7d0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", color: "#111827", lineHeight: 1.2, margin: "0 0 16px" }}>
            Připraveni vytvořit web,<br/>který vás posune dál?
          </h2>
          <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 16, color: "#4b5563", lineHeight: 1.65, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
            Vyzkoušejte Webero zdarma a přesvědčte se, jak snadné je mít profesionální web bez kompromisů.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn href="#">Vyzkoušet zdarma</Btn>
            <Btn href="#sablony" outline>Prohlédnout šablony</Btn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: "#111827", color: "#9ca3af", padding: "60px 24px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }} className="hb-footer-grid">
            {/* Brand */}
            <div>
              <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: 24, color: "#fff", marginBottom: 12 }}>
                <span style={{ color: GREEN }}>w</span>ebero
              </div>
              <p style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, lineHeight: 1.65, marginBottom: 20, maxWidth: 220 }}>Moderní weby bez programování. Rychle, jednoduše a profesionálně.</p>
              <div style={{ display: "flex", gap: 10 }}>
                {["f", "in", "ig", "yt"].map(s => (
                  <a key={s} href="#" style={{ width: 32, height: 32, background: "#1f2937", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontFamily: "Poppins,sans-serif", fontSize: 11, fontWeight: 700, textDecoration: "none", transition: "background .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = GREEN)}
                    onMouseLeave={e => (e.currentTarget.style.background = "#1f2937")}>{s}</a>
                ))}
              </div>
            </div>
            {/* Columns */}
            {[
              { heading: "Produkt", links: ["Funkce", "Šablony", "Integrace", "Ceník", "Novinky"] },
              { heading: "Společnost", links: ["O nás", "Reference", "Kariéra", "Kontakt"] },
              { heading: "Podpora", links: ["Nápověda", "Videonávody", "Komunita", "Stav systému"] },
              { heading: "Právní informace", links: ["Obchodní podmínky", "Ochrana osobních údajů", "Cookies", "Licenční ujednání"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 14 }}>{heading}</div>
                {links.map(l => (
                  <a key={l} href="#" style={{ display: "block", fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#9ca3af", textDecoration: "none", marginBottom: 8, transition: "color .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          {/* Bottom */}
          <div style={{ borderTop: "1px solid #1f2937", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 12 }}>© 2026 Webero s.r.o. Všechna práva vyhrazena.</span>
            <span style={{ fontFamily: "Poppins,sans-serif", fontSize: 12 }}>Český produkt&nbsp;•&nbsp;Podpora v češtině&nbsp;•&nbsp;Hosting v EU</span>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE CSS ───────────────────────────────────── */}
      <style>{`
        @media(max-width:1024px){
          .hb-hero-grid{grid-template-columns:1fr!important;gap:40px!important}
          .hb-hero-right{justify-content:center!important}
          .hb-features-grid{grid-template-columns:1fr 1fr!important}
          .hb-perf-grid{grid-template-columns:1fr 1fr 1fr!important}
          .hb-footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important}
        }
        @media(max-width:768px){
          .hb-templates-grid{grid-template-columns:1fr 1fr!important}
          .hb-pricing-grid{grid-template-columns:1fr!important}
          .hb-testi-grid{grid-template-columns:1fr!important}
          .hb-faq-grid{grid-template-columns:1fr!important;gap:0!important}
          .hb-perf-grid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:480px){
          .hb-templates-grid{grid-template-columns:1fr!important}
          .hb-features-grid{grid-template-columns:1fr!important}
          .hb-perf-grid{grid-template-columns:1fr 1fr!important}
          .hb-footer-grid{grid-template-columns:1fr!important}
        }
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
