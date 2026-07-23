"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Header from "@/astera/components/Header";
import Footer from "@/astera/components/Footer";
import { useContent } from "@/astera/context/ContentContext";
import { ServiceItem } from "@/astera/lib/content-types";
import { localizeHref, UI_STRINGS } from "@/astera/lib/i18n";
import WheelOfFortunePopup from "@/astera/components/WheelOfFortunePopup";

const purple = "#7c3bb2";
const gold   = "#c9a84c";
const goldLight = "#f5e9c8";
const cream  = "#fffcf5";
const creamDeep = "#f5ede0";

// ─── Data ──────────────────────────────────────────────────────────────────

type PricingRow  = { label: string; price: string };
type TwoColItem  = { label: string; text: string };
type Section     = { heading?: string; paragraphs?: string[]; list?: string[]; rows?: PricingRow[]; twoCol?: TwoColItem[]; price?: string };

const legacyServices: {
  id: string; symbol: string; emoji: string; color: string;
  title: string; teaser: string; lead: string; body?: string;
  sections: Section[];
  cta: { label: string; href: string };
}[] = [
  {
    id: "karty", symbol: "☽", emoji: "🃏", color: "#9b6fd4",
    title: "Výklad karet",
    teaser: "Získejte jasnější pohled na to, co se právě děje – i kam vaše cesta směřuje.",
    lead: "Hledáte odpovědi, směr nebo ujištění v důležité životní situaci? Výklad karet vám pomůže nahlédnout pod povrch a získat jasnější pohled na to, co se právě děje – i kam vaše cesta směřuje.",
    body: "Vstupte do prostoru, kde se zastavuje čas a odpovědi přicházejí v pravý okamžik.",
    sections: [
      {
        heading: "Jak probíhá výklad",
        paragraphs: [
          "Výklad karet je hluboký a osobní proces. Každé sezení je zcela individuální a věnuji se pouze omezenému počtu klientů, aby byla zachována maximální kvalita a hloubka práce.",
          "Pracuji především s Tarotem, doplňkově využívám orákula, cikánské karty, runy a další nástroje.",
        ],
      },
      {
        heading: "Formy výkladu",
        rows: [
          { label: "Online živě (60–90 minut)", price: "3 600 Kč" },
          { label: "Videozpráva (soukromý odkaz na YouTube)", price: "2 600 Kč" },
          { label: "Textová zpráva nebo e-mail včetně fotografií", price: "1 200 Kč" },
        ],
      },
      {
        heading: "Osobní setkání v Praze",
        paragraphs: [
          "Pro hlubší a intenzivnější práci nabízím také osobní setkání (60–180 minut).",
          "Toto sezení je určeno pouze pro stávající klienty, kteří již mají zkušenost s online výkladem. Kombinuje výklad, poradenství, channeling, mediumství a energetickou harmonizaci.",
        ],
        rows: [{ label: "Cena osobního setkání", price: "5 900 Kč" }],
      },
    ],
    cta: { label: "Rezervovat výklad", href: "mailto:info@asteralight.cz?subject=Rezervace%20výkladu%20karet" },
  },
  {
    id: "ocista", symbol: "✦", emoji: "🏠", color: "#5a9e7c",
    title: "Očista prostor",
    teaser: "Navracím do domovů a pracovních prostor klid, lehkost a pocit bezpečí.",
    lead: "Pomáhám navracet do domovů i pracovních prostor klid, lehkost a pocit bezpečí. Očista přináší rovnováhu a uvolnění tam, kde se hromadí napětí nebo stagnace.",
    sections: [
      {
        heading: "Kdy je očista vhodná",
        list: ["při stěhování", "po náročných životních obdobích", "při dlouhodobé nemoci v prostoru", "při pocitu neklidu, napětí nebo nevysvětlitelných jevů"],
      },
      {
        heading: "Ceník (orientační)",
        paragraphs: ["Očistu provádím individuálně, s respektem k prostoru i jeho obyvatelům."],
        rows: [
          { label: "Garsonka a 1+kk", price: "3 900 – 4 900 Kč" },
          { label: "2+kk a byty do 50 m²", price: "5 900 – 7 900 Kč" },
          { label: "3+kk až 5+kk do 120 m²", price: "8 900 – 13 900 Kč" },
          { label: "Rodinné domy a samostatné objekty", price: "14 900 – 29 900 Kč" },
          { label: "Průvodce samostatnou očistou (e-shop)", price: "1 290 Kč" },
        ],
      },
    ],
    cta: { label: "Domluvit očistu", href: "mailto:info@asteralight.cz?subject=Chci%20se%20objednat%20-%20očista%20prostor" },
  },
  {
    id: "amulety", symbol: "⊕", emoji: "✨", color: "#c08040",
    title: "Amulety a talismany",
    teaser: "Osobní předmět nositelem záměru, energie a vědomé práce na vaší cestě.",
    lead: "Osobní amulet nebo talisman je víc než jen předmět. Je nositelem záměru, energie a vědomé práce, která vás provází na vaší cestě.",
    body: "Každý kus vzniká individuálně, v napojení na vaši energii a konkrétní záměr.",
    sections: [
      {
        heading: "Rozdíl mezi amuletem a talismanem",
        twoCol: [
          { label: "Amulet", text: "Chrání, vytváří štít a ochrannou bariéru. Pomáhá odpuzovat nežádoucí vlivy, situace, energie nebo konkrétní osoby. Omezuje to, co vás oslabuje nebo narušuje vaši rovnováhu." },
          { label: "Talisman", text: "Posiluje to, co chcete ve svém životě rozvíjet. Přitahuje žádoucí energii, příležitosti a lidi. Podporuje vaše záměry, zvyšuje šance a zesiluje to, po čem toužíte." },
        ],
      },
      {
        heading: "Možnosti využití",
        list: ["ochrana a posílení", "přitažení příležitostí", "podpora vztahů nebo přivolání partnera", "ochrana před toxickým prostředím", "důležité životní momenty (zkoušky, cesty apod.)"],
      },
      {
        heading: "Jak probíhá spolupráce",
        paragraphs: [
          "Součástí procesu je úvodní konzultace, během které společně ujasníme váš záměr a směr tvorby.",
          "Cena konzultace se následně odečítá z celkové ceny.",
        ],
        rows: [{ label: "Amulet / talisman na míru", price: "4 400 – 19 900 Kč" }],
      },
    ],
    cta: { label: "Nechat vytvořit amulet nebo talisman", href: "mailto:info@asteralight.cz?subject=Amulet%20nebo%20talisman%20na%20míru" },
  },
  {
    id: "medium", symbol: "☆", emoji: "🌙", color: "#5878c0",
    title: "Mediumní výklady",
    teaser: "Pomáhám najít klid, pochopení a uzavření tam, kde zůstávají nevyřčené věci.",
    lead: "Neuzavřené vztahy nebo ztráta blízkého člověka mohou zůstávat hluboko v nás. Mediumní výklad vám může pomoci najít klid, pochopení i uzavření.",
    body: "Zprostředkovávám komunikaci a vhledy, které vám pomohou uvolnit emoce, dořešit nevyřčené a posunout se dál.",
    sections: [
      {
        rows: [{ label: "Video, online setkání nebo osobně v Praze", price: "3 600 Kč" }],
      },
    ],
    cta: { label: "Objednat mediumní výklad", href: "mailto:info@asteralight.cz?subject=Mediumní%20výklad" },
  },
  {
    id: "energo", symbol: "◈", emoji: "💫", color: "#a84a80",
    title: "Energetická očista člověka",
    teaser: "Hluboká práce obnovující vnitřní rovnováhu a uvolňující to, co již neslouží.",
    lead: "Jemná, ale hluboká práce, která obnovuje vnitřní rovnováhu a uvolňuje to, co již neslouží.",
    body: "Energetická očista probíhá na dálku a zasahuje pět úrovní bytí – fyzickou, emoční, mentální i další jemnohmotné vrstvy. Výsledkem bývá pocit úlevy, větší lehkosti a návratu k sobě.",
    sections: [
      {
        rows: [{ label: "Individuální sezení na dálku", price: "3 300 Kč" }],
      },
    ],
    cta: { label: "Objednat energetickou očistu", href: "mailto:info@asteralight.cz?subject=Energetická%20očista%20člověka" },
  },
  {
    id: "na-miru", symbol: "✧", emoji: "🔮", color: "#7c6ad4",
    title: "Služby na míru",
    teaser: "Individuální kombinace vedení, výkladu a energetické práce podle toho, co právě potřebujete.",
    lead: "Někdy se situace nevejde do jedné konkrétní služby. Společně pojmenujeme, co právě řešíte, a navrhnu citlivý postup šitý na míru vašemu záměru, prostoru i aktuální energii.",
    body: "Služba může propojit konzultaci, výklad, očistu, práci se záměrem nebo doporučení dalších kroků podle vaší konkrétní situace.",
    sections: [
      {
        heading: "Kdy je vhodná",
        list: [
          "když si nejste jistí, jakou službu zvolit",
          "pokud se téma dotýká více oblastí najednou",
          "když potřebujete individuální plán nebo citlivé nasměrování",
          "při specifické životní situaci, která vyžaduje osobní přístup",
        ],
      },
      {
        heading: "Cena a rozsah",
        paragraphs: ["Rozsah i forma se domlouvají individuálně podle tématu, hloubky práce a časové náročnosti."],
        rows: [{ label: "Individuální návrh služby", price: "dle domluvy" }],
      },
    ],
    cta: { label: "Domluvit službu na míru", href: "mailto:info@asteralight.cz?subject=Služba%20na%20míru" },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function OrnamentDivider({ tight = false }: { tight?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: tight ? "14px 0" : "20px 0", color: gold }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold}77)` }} />
      <span style={{ fontSize: 11, letterSpacing: 7, opacity: 0.85 }}>✦ ✦ ✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold}77)` }} />
    </div>
  );
}

const inlineLinkStyle: React.CSSProperties = {
  color: purple,
  fontWeight: 700,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const CONSULT_TEXT: Record<string, React.ReactNode> = {
  cs: (
    <>
      Pokud si nejste jistí, jakou službu zvolit, projděte si{" "}
      <Link href="/sluzby" style={inlineLinkStyle}>přehled služeb</Link>
      , rezervujte si{" "}
      <a href="https://app.rezora.cz/book/astera" style={inlineLinkStyle}>konzultaci</a>
      , nebo si vyberte praktické návody v{" "}
      <a href="https://shop.asteralight.cz" style={inlineLinkStyle}>e-shopu</a>.
    </>
  ),
  en: (
    <>
      Not sure which service to choose? Browse the{" "}
      <Link href="/en/services" style={inlineLinkStyle}>service overview</Link>
      , book a{" "}
      <a href="https://app.rezora.cz/book/astera" style={inlineLinkStyle}>consultation</a>
      , or find practical guides in the{" "}
      <a href="https://shop.asteralight.cz" style={inlineLinkStyle}>e-shop</a>.
    </>
  ),
  ua: (
    <>
      Якщо ви не впевнені, яку послугу обрати, перегляньте{" "}
      <Link href="/ua/posluhy" style={inlineLinkStyle}>перелік послуг</Link>
      , забронюйте{" "}
      <a href="https://app.rezora.cz/book/astera" style={inlineLinkStyle}>консультацію</a>
      , або оберіть практичні посібники в{" "}
      <a href="https://shop.asteralight.cz" style={inlineLinkStyle}>е-магазині</a>.
    </>
  ),
};

function LinkedConsultText() {
  const { currentLang } = useContent();
  return <>{CONSULT_TEXT[currentLang]}</>;
}

function LinkedPhrase({ text }: { text: string }) {
  if (text.includes("e-shop")) {
    const [before, after = ""] = text.split("e-shop");
    return (
      <>
        {before}
        <a href="https://shop.asteralight.cz" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>
          e-shop
        </a>
        {after}
      </>
    );
  }

  if (text.toLowerCase().includes("konzultace")) {
    return (
      <a href="https://app.rezora.cz/book/astera" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>
        {text}
      </a>
    );
  }

  return <>{text}</>;
}

function ScrollDownControl() {
  const { currentLang } = useContent();
  const scrollToServices = () => {
    document.getElementById("sluzby-karty")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={scrollToServices}
      aria-label={UI_STRINGS[currentLang].scrollToServices}
      className="services-scroll-down"
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        margin: "0 auto 16px",
        background: `linear-gradient(135deg, ${goldLight} 0%, ${gold}55 100%)`,
        border: `1px solid ${gold}77`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#5a3a00",
        cursor: "pointer",
        boxShadow: `0 10px 24px ${gold}22`,
      }}
    >
      <svg
        aria-hidden
        className="scroll-motif"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path d="M5 6.5 12 13.5 19 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12.5 12 19.5 19 12.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────

function Modal({ service, onClose }: { service: ServiceItem; onClose: () => void }) {
  const { currentLang } = useContent();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(25, 8, 45, 0.68)",
        backdropFilter: "blur(9px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "18px 16px",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{
        width: "min(100%, 980px)",
        maxHeight: "calc(100vh - 36px)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: `linear-gradient(160deg, ${cream} 0%, #fdf5e8 60%, ${creamDeep} 100%)`,
        borderRadius: 20,
        border: `1px solid ${gold}88`,
        boxShadow: `0 40px 100px rgba(20,8,40,0.55), inset 0 1px 0 rgba(255,255,255,0.9)`,
        position: "relative",
        animation: "modalIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
      }} role="dialog" aria-modal="true">

        {/* corner ornaments */}
        {(["tl","tr","bl","br"] as const).map(c => (
          <div key={c} aria-hidden style={{
            position: "absolute",
            top: c[0]==="t" ? 10 : undefined, bottom: c[0]==="b" ? 10 : undefined,
            left: c[1]==="l" ? 10 : undefined, right: c[1]==="r" ? 10 : undefined,
            width: 24, height: 24,
            borderTop:    c[0]==="t" ? `1px solid ${gold}77` : undefined,
            borderBottom: c[0]==="b" ? `1px solid ${gold}77` : undefined,
            borderLeft:   c[1]==="l" ? `1px solid ${gold}77` : undefined,
            borderRight:  c[1]==="r" ? `1px solid ${gold}77` : undefined,
            borderRadius: c==="tl"?"6px 0 0 0":c==="tr"?"0 6px 0 0":c==="bl"?"0 0 0 6px":"0 0 6px 0",
            pointerEvents: "none",
          }} />
        ))}

        {/* close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          width: 30, height: 30, borderRadius: "50%",
          background: `${goldLight}cc`, border: `1px solid ${gold}66`,
          color: "#5a3a00", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Poppins',sans-serif",
        }}>✕</button>

        {/* header */}
        <div style={{
          padding: "28px 38px 20px", textAlign: "center",
          borderBottom: `1px solid ${gold}44`,
          background: `radial-gradient(ellipse at 50% 0%, ${goldLight}77 0%, transparent 65%)`,
          position: "relative",
        }}>
          {/* ghost symbol */}
          <div aria-hidden style={{
            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
            fontSize: 100, lineHeight: 1, color: gold, opacity: 0.055,
            fontFamily: "serif", pointerEvents: "none", userSelect: "none",
          }}>{service.symbol}</div>

          {/* emoji medallion */}
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 10px",
            background: `linear-gradient(135deg, ${cream} 0%, ${goldLight} 100%)`,
            border: `1.5px solid ${gold}88`, boxShadow: `0 4px 18px ${gold}33`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
            position: "relative",
          }}>{service.emoji}</div>

          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(20px, 2.4vw, 25px)", fontWeight: 700,
            color: "#2a1a00", margin: "0 0 4px", lineHeight: 1.2,
          }}>{service.title}</h2>

          <OrnamentDivider tight />

          <p style={{
            fontSize: 13, lineHeight: 1.58, color: "#4a3728",
            margin: "0 auto", maxWidth: 760, fontFamily: "'Poppins',sans-serif",
          }}>{service.lead}</p>

          {service.body && (
            <p style={{
              fontSize: 12, lineHeight: 1.5, color: "#6b5a3a", margin: "6px auto 0",
              maxWidth: 760, fontFamily: "'Poppins',sans-serif", fontStyle: "italic",
            }}>{service.body}</p>
          )}
        </div>

        {/* body */}
        <div style={{ padding: "18px 34px 28px" }}>
          {service.sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: i < service.sections.length - 1 ? 12 : 0 }}>
              {sec.heading && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginBottom: 7,
                }}>
                  <span style={{ color: gold, fontSize: 9 }}>◆</span>
                  <span style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 14, fontWeight: 700, fontStyle: "italic",
                    color: "#5a3a00",
                  }}>{sec.heading}</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${gold}55, transparent)` }} />
                </div>
              )}
              {sec.twoCol && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }} className="modal-twocol">
                  {sec.twoCol.map((col, j) => (
                    <div key={j} style={{
                      background: `linear-gradient(135deg, ${cream} 0%, ${goldLight}44 100%)`,
                      borderRadius: 10, padding: "10px 12px",
                      border: `1px solid ${gold}44`,
                    }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 13, color: "#5a3a00", marginBottom: 5 }}>{col.label}</div>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, lineHeight: 1.6, color: "#4a3728" }}>{col.text}</div>
                    </div>
                  ))}
                </div>
              )}
              {sec.paragraphs?.map((p, j) => (
                <p key={j} style={{ margin: "0 0 6px", fontFamily: "'Poppins',sans-serif", fontSize: 12, lineHeight: 1.55, color: "#4a3728" }}>{p}</p>
              ))}
              {sec.list && (
                <ul style={{ margin: "0 0 8px", paddingLeft: 0, listStyle: "none" }}>
                  {sec.list.map((item, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4, fontFamily: "'Poppins',sans-serif", fontSize: 12, color: "#4a3728", lineHeight: 1.45 }}>
                      <span style={{ color: gold, marginTop: 4, flexShrink: 0, fontSize: 8 }}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {sec.rows && (
                <div>
                  {sec.rows.map((row, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                      padding: "6px 11px", borderRadius: 8, flexWrap: "wrap",
                      background: j % 2 === 0 ? `linear-gradient(90deg, ${cream}, ${goldLight}44)` : "#fff",
                      border: `1px solid ${gold}33`, marginBottom: 6,
                    }}>
                      <span style={{ fontSize: 12, color: "#4a3728", fontFamily: "'Poppins',sans-serif" }}><LinkedPhrase text={row.label} /></span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#5a3a00", fontFamily: "'Playfair Display',serif", whiteSpace: "nowrap" }}>{row.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <OrnamentDivider tight />

          <a href={localizeHref(service.cta.href, currentLang)} style={{
            display: "block", textAlign: "center",
            background: `linear-gradient(135deg, ${purple} 0%, #5f2a8d 100%)`,
            color: "#fff", borderRadius: 999,
            padding: "11px 28px", fontSize: 13, fontWeight: 600,
            fontFamily: "'Poppins',sans-serif", textDecoration: "none",
            letterSpacing: 0.3, boxShadow: `0 4px 18px ${purple}44`,
          }}>{service.cta.label}</a>
        </div>
      </div>
    </div>
  );
}

// ─── Service Tile ───────────────────────────────────────────────────────────

function ServiceTile({ s, linkText, onClick }: { s: ServiceItem; linkText: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        minHeight: 292,
        padding: "34px 24px 30px", borderRadius: 18,
        border: `1px solid ${hov ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.09)"}`,
        background: hov ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        cursor: "pointer",
        transition: "all 0.25s ease",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hov ? "0 20px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)" : "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div aria-hidden style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          fontSize: 60, color: "rgba(255,255,255,0.07)", fontFamily: "serif", lineHeight: 1, pointerEvents: "none",
        }}>{s.symbol}</div>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, position: "relative",
        }}>{s.emoji}</div>
      </div>
      <h3 style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "clamp(16px, 1.8vw, 19px)", fontWeight: 700, color: "#fff",
        margin: "0 0 10px", lineHeight: 1.28,
        minHeight: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>{s.title}</h3>
      <p style={{
        fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.58)",
        margin: "0 0 20px", fontFamily: "'Poppins',sans-serif", flex: 1,
        maxWidth: 280,
      }}>{s.teaser}</p>
      <div style={{ width: 36, height: 1, background: `linear-gradient(90deg, transparent, ${gold}88, transparent)`, marginBottom: 14 }} />
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.09em",
        textTransform: "uppercase" as const, fontFamily: "'Poppins',sans-serif",
        color: hov ? "#fff" : "rgba(255,255,255,0.5)", transition: "color 0.2s",
      }}>{linkText}</span>
    </button>
  );
}

// ─── Page section wrapper (cream style) ────────────────────────────────────

function CreamSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{
      background: `linear-gradient(160deg, ${cream} 0%, #fdf5e8 100%)`,
      borderTop: `1px solid ${gold}33`,
      borderBottom: `1px solid ${gold}33`,
      ...style,
    }}>
      {children}
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SluzbyPage() {
  const { content, currentLang } = useContent();
  const serviceContent = content.servicesContent;
  const serviceItems = serviceContent?.items || [];
  const [active, setActive] = useState<string | null>(null);
  const activeService = serviceItems.find(s => s.id === active) ?? null;

  return (
    <>
      <Header />
      <main style={{ paddingTop: "102px" }}>

        {/* ── HERO ───────────────────────────────────────────── */}
        <section style={{
          background: "linear-gradient(135deg, #1a0a2e 0%, #2d1654 55%, #7c3bb2 100%)",
          padding: "80px 30px 90px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden style={{ position: "absolute", top: -100, right: -100, width: 380, height: 380, borderRadius: "50%", background: "rgba(255,255,255,0.025)", pointerEvents: "none" }} />
          <div aria-hidden style={{ position: "absolute", bottom: -70, left: -70, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              fontFamily: "'Poppins',sans-serif", fontSize: 11, letterSpacing: "0.12em",
              textTransform: "uppercase" as const, color: `${gold}cc`,
              margin: "0 0 16px",
            }}>{serviceContent.pageHeroEyebrow}</p>
            <h1 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 800, color: "#fff",
              margin: "0 0 16px", lineHeight: 1.1, letterSpacing: 1,
            }}>{serviceContent.pageHeroTitle}</h1>
            <OrnamentDivider />
            <p style={{
              fontSize: "clamp(14px, 1.8vw, 17px)", lineHeight: 1.7,
              color: "rgba(255,255,255,0.75)", maxWidth: 540, margin: "0 auto 36px",
              fontFamily: "'Poppins',sans-serif",
            }}>
              {serviceContent.pageHeroText}
            </p>
            <a href={localizeHref(serviceContent.pageHeroButtonHref, currentLang)} style={{
              display: "inline-block", background: "#fff", color: purple,
              borderRadius: 999, padding: "13px 38px",
              fontSize: 14, fontWeight: 700, fontFamily: "'Poppins',sans-serif",
              textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}>{serviceContent.pageHeroButtonText} →</a>
          </div>
        </section>

        {/* ── INTRO ────────────────────────────────────────────── */}
        <CreamSection>
          <div className="container-main" style={{ padding: "44px 30px" }}>
            <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
              <ScrollDownControl />
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700,
                color: "#2a1a00", margin: "0 0 6px",
              }}>{serviceContent.pageIntroTitle}</h2>
              <OrnamentDivider tight />
              <p style={{ fontSize: 14, color: "#4a3728", margin: 0, lineHeight: 1.78, fontFamily: "'Poppins',sans-serif" }}>
                {serviceContent.pageIntroText}
              </p>
            </div>
          </div>
        </CreamSection>

        {/* ── CARDS GRID ───────────────────────────────────────── */}
        <section id="sluzby-karty" style={{
          background: "linear-gradient(160deg, #0f0520 0%, #1e0840 40%, #2d1654 80%, #1a0a2e 100%)",
          padding: "70px 30px 80px", position: "relative", overflow: "hidden",
          scrollMarginTop: 102,
        }}>
          {[
            { top: "10%", left: "5%", size: 300, c: "#7c3bb2" },
            { top: "60%", right: "6%", size: 220, c: "#4a80d4" },
            { bottom: "15%", left: "42%", size: 180, c: "#a84a80" },
          ].map((b, i) => (
            <div key={i} aria-hidden style={{
              position: "absolute", top: b.top, left: b.left, right: b.right, bottom: b.bottom,
              width: b.size, height: b.size, borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c}1a 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
          ))}
          <div className="container-main" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 700, color: gold,
                margin: "0 0 8px", letterSpacing: 0.5,
              }}>{serviceContent.pageGridTitle}</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Poppins',sans-serif", margin: 0, letterSpacing: "0.06em" }}>
                {serviceContent.pageGridSubtitle}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="services-grid">
              {serviceItems.map(s => (
                <ServiceTile key={s.id} s={s} linkText={serviceContent.pageTileLinkText} onClick={() => setActive(s.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── PROČ PRACOVAT SE MNOU ────────────────────────────── */}
        <CreamSection>
          <div className="container-main" style={{ padding: "64px 30px" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 14, color: gold, letterSpacing: 8 }}>✦ ✦ ✦</div>
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(21px, 3vw, 30px)", fontWeight: 700,
                color: "#2a1a00", margin: "0 0 8px",
              }}>{serviceContent.pageWhyTitle}</h2>
              <OrnamentDivider />
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#4a3728", margin: "0 0 12px", fontFamily: "'Poppins',sans-serif" }}>
                {serviceContent.pageWhyText1}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#4a3728", margin: "0 0 30px", fontFamily: "'Poppins',sans-serif" }}>
                {serviceContent.pageWhyText2}
              </p>
              <a href={localizeHref(serviceContent.pageWhyButtonHref, currentLang)} style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${purple}, #5f2a8d)`,
                color: "#fff", borderRadius: 999, padding: "12px 36px",
                fontSize: 14, fontWeight: 600, fontFamily: "'Poppins',sans-serif",
                textDecoration: "none", boxShadow: `0 4px 18px ${purple}44`,
              }}>{serviceContent.pageWhyButtonText}</a>
            </div>
          </div>
        </CreamSection>

        {/* ── SPECIFICKÉ PŘÍPADY + NEMÁTE JISTOTU ─────────────── */}
        <section style={{ background: "#fff", borderTop: `1px solid ${gold}22` }}>
          <div className="container-main" style={{ padding: "56px 30px 64px" }}>
            <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }} className="bottom-grid">

              {/* specifické */}
              <div style={{
                background: `linear-gradient(135deg, ${cream} 0%, ${goldLight}44 100%)`,
                borderRadius: 16, padding: "28px 30px",
                border: `1px solid ${gold}55`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{serviceContent.pageSpecificIcon}</span>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#2a1a00", margin: 0 }}>
                    {serviceContent.pageSpecificTitle}
                  </h3>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.78, color: "#4a3728", margin: "0 0 8px", fontFamily: "'Poppins',sans-serif" }}>
                  {serviceContent.pageSpecificText1}
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.78, color: "#4a3728", margin: 0, fontFamily: "'Poppins',sans-serif" }}>
                  {serviceContent.pageSpecificText2}
                </p>
              </div>

              {/* nemáte jistotu */}
              <div style={{
                background: `linear-gradient(135deg, #faf7ff 0%, #f0eaff 100%)`,
                borderRadius: 16, padding: "28px 30px",
                border: `1px solid ${purple}33`,
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 20 }}>{serviceContent.pageConsultIcon}</span>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#2a1a2e", margin: 0 }}>
                    {serviceContent.pageConsultTitle}
                  </h3>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.78, color: "#374151", margin: "0 0 20px", fontFamily: "'Poppins',sans-serif", flex: 1 }}>
                  <LinkedConsultText />
                </p>
                <a href={localizeHref(serviceContent.pageConsultButtonHref, currentLang)} style={{
                  display: "inline-block", alignSelf: "flex-start",
                  background: `linear-gradient(135deg, ${purple}, #5f2a8d)`,
                  color: "#fff", borderRadius: 999, padding: "11px 28px",
                  fontSize: 14, fontWeight: 600, fontFamily: "'Poppins',sans-serif",
                  textDecoration: "none", boxShadow: `0 4px 14px ${purple}33`,
                }}>{serviceContent.pageConsultButtonText}</a>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />

      {activeService && <Modal service={activeService} onClose={() => setActive(null)} />}
      <WheelOfFortunePopup />

      <style>{`
        @keyframes servicesArrowBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(7px); }
        }
        .services-scroll-down .scroll-motif {
          animation: servicesArrowBounce 1.35s ease-in-out infinite;
        }
        .services-scroll-down:hover,
        .services-scroll-down:focus-visible {
          transform: translateY(2px);
          box-shadow: 0 12px 26px ${gold}33 !important;
          outline: none;
        }
        .services-scroll-down:focus-visible {
          box-shadow: 0 0 0 4px ${gold}44, 0 12px 26px ${gold}33 !important;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .modal-twocol { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bottom-grid   { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .modal-twocol  { grid-template-columns: 1fr !important; }
          [role="dialog"] {
            align-self: flex-start;
            margin-top: 0;
            max-height: calc(100dvh - 28px) !important;
          }
          .services-grid button {
            min-height: auto !important;
            padding: 30px 22px 28px !important;
          }
        }
      `}</style>
    </>
  );
}
