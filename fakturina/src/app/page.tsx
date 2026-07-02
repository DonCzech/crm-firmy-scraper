"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import FaqAccordion from "@/components/FaqAccordion";

/* ── Mockup: phone with invoice list ─────────────────────────────────────── */
function PhoneInvoiceList() {
  const rows = [
    { name: "Web Design — Novák s.r.o.", amount: "28 500 Kč", status: "zaplaceno", color: "#22c55e" },
    { name: "Konzultace Q2 — TopFirma", amount: "12 000 Kč", status: "odesláno",  color: "#6366f1" },
    { name: "SEO audit — Marta K.",      amount: "6 800 Kč",  status: "po splatnosti", color: "#ef4444" },
    { name: "Logo — BrandStudio",        amount: "9 200 Kč",  status: "zaplaceno", color: "#22c55e" },
    { name: "Hosting — Pavel Horák",     amount: "1 800 Kč",  status: "odesláno",  color: "#6366f1" },
  ];
  return (
    <div style={{
      width: 240, background: "#fff", borderRadius: 32,
      border: "1.5px solid #e2e8f0",
      boxShadow: "0 24px 64px rgba(79,51,229,0.13), 0 4px 16px rgba(0,0,0,0.07)",
      overflow: "hidden",
    }}>
      {/* Status bar */}
      <div style={{ height: 44, background: "linear-gradient(135deg,#4F33E5,#7c3aed)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
        <div style={{ width: 48, height: 5, borderRadius: 4, background: "rgba(255,255,255,0.4)" }} />
      </div>
      {/* App header */}
      <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Faktury</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Červen 2026</div>
      </div>
      {/* Invoice rows */}
      {rows.map((r, i) => (
        <div key={i} style={{ padding: "9px 14px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
            <div style={{ fontSize: 9.5, color: r.color, fontWeight: 600, marginTop: 1 }}>{r.status}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>{r.amount}</div>
        </div>
      ))}
      <div style={{ height: 16 }} />
    </div>
  );
}

/* ── Mockup: bank logos grid ─────────────────────────────────────────────── */
function BankGrid() {
  const banks = ["ČSOB", "Fio banka", "Airbank", "VÚB Banka", "Raiffeisen", "Komerční", "mBank", "Moneta"];
  return (
    <div style={{ position: "relative", width: 300 }}>
      {/* Phone frame */}
      <div style={{
        background: "#fff", borderRadius: 28,
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 20px 56px rgba(0,0,0,0.10)",
        overflow: "hidden", padding: "14px 14px 20px",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Napojené banky</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {banks.map(b => (
            <div key={b} style={{
              background: "#f8fafc", borderRadius: 10, padding: "8px 10px",
              fontSize: 10.5, fontWeight: 700, color: "#334155",
              border: "1px solid #e8edf2", textAlign: "center",
            }}>{b}</div>
          ))}
        </div>
      </div>
      {/* Coin stack decoration */}
      <div style={{ position: "absolute", bottom: -18, right: -28, display: "flex", flexDirection: "column-reverse", gap: 2, opacity: 0.92 }}>
        {[52, 48, 44, 40, 36, 30].map((w, i) => (
          <div key={i} style={{
            width: w, height: 12, borderRadius: 6,
            background: `linear-gradient(90deg, #fde68a, #fbbf24)`,
            boxShadow: `0 2px 6px rgba(251,191,36,0.35)`,
            margin: "0 auto",
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Mockup: laptop with dashboard ──────────────────────────────────────── */
function LaptopDashboard() {
  return (
    <div style={{ width: 360, position: "relative" }}>
      {/* Lid */}
      <div style={{
        width: 340, margin: "0 auto",
        background: "linear-gradient(160deg,#f4f4f4,#e0e0e0)",
        borderRadius: 10, padding: "6px 6px 5px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
      }}>
        {/* Screen */}
        <div style={{ background: "#f8faff", borderRadius: 6, overflow: "hidden" }}>
          {/* App bar */}
          <div style={{ height: 22, background: "linear-gradient(135deg,#4F33E5,#7c3aed)", display: "flex", alignItems: "center", paddingLeft: 8, gap: 4 }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />)}
          </div>
          {/* Dashboard content */}
          <div style={{ padding: "10px 12px", display: "flex", gap: 8 }}>
            {/* Sidebar */}
            <div style={{ width: 60, flexShrink: 0 }}>
              {["Přehled","Faktury","Klienti","Výdaje","Nastavení"].map((l,i) => (
                <div key={l} style={{
                  fontSize: 7, padding: "4px 6px", borderRadius: 5, marginBottom: 2,
                  background: i === 0 ? "#4F33E5" : "transparent",
                  color: i === 0 ? "#fff" : "#94a3b8", fontWeight: 600,
                }}>{l}</div>
              ))}
            </div>
            {/* Main content */}
            <div style={{ flex: 1 }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 8 }}>
                {[
                  { l: "Pohledávky", v: "84 200", c: "#4F33E5" },
                  { l: "Uhrazeno", v: "127 500", c: "#22c55e" },
                  { l: "Po splatnosti", v: "12 400", c: "#ef4444" },
                ].map(s => (
                  <div key={s.l} style={{ background: "#fff", borderRadius: 5, padding: "5px 6px", border: "1px solid #f0f0f0" }}>
                    <div style={{ fontSize: 5.5, color: "#94a3b8", marginBottom: 2 }}>{s.l}</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
              {/* Bar chart */}
              <div style={{ background: "#fff", borderRadius: 5, padding: "6px 8px", border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 6, color: "#94a3b8", marginBottom: 6 }}>Tržby — posledních 6 měsíců</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 32 }}>
                  {[60,45,75,55,85,70].map((h,i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0",
                      background: i === 4 ? "#4F33E5" : "#e0e7ff" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Base */}
      <div style={{
        width: 360, height: 12, background: "linear-gradient(180deg,#d8d8d8,#c4c4c4)",
        borderRadius: "0 0 8px 8px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }} />
    </div>
  );
}

/* ── Mockup: phone with revenue chart ───────────────────────────────────── */
function PhoneChart() {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        width: 220, background: "#fff", borderRadius: 30,
        border: "1.5px solid #e2e8f0",
        boxShadow: "0 20px 56px rgba(79,51,229,0.12), 0 4px 16px rgba(0,0,0,0.07)",
        overflow: "hidden",
      }}>
        {/* Top notch bar */}
        <div style={{ height: 42, background: "linear-gradient(135deg,#4F33E5,#7c3aed)", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom: 8 }}>
          <div style={{ width: 48, height: 5, borderRadius: 4, background: "rgba(255,255,255,0.4)" }} />
        </div>
        {/* Summary */}
        <div style={{ padding: "12px 16px 6px" }}>
          <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 2 }}>Celkem vyfakturováno</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>342 800 Kč</div>
          <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 600, marginTop: 2 }}>↑ +18 % oproti minulému měsíci</div>
        </div>
        {/* Bar chart */}
        <div style={{ padding: "6px 16px 14px" }}>
          <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 8 }}>Příjmy a výdaje</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 50 }}>
            {[
              { h: 55, v: 30 }, { h: 70, v: 40 }, { h: 45, v: 25 },
              { h: 85, v: 50 }, { h: 65, v: 35 }, { h: 90, v: 45 },
            ].map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column-reverse", gap: 2, height: "100%" }}>
                <div style={{ height: `${b.v}%`, borderRadius: "2px 2px 0 0", background: "#e0e7ff" }} />
                <div style={{ height: `${b.h - b.v}%`, borderRadius: "2px 2px 0 0", background: "#4F33E5" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 7, color: "#64748b" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#4F33E5" }} /> Příjmy
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 7, color: "#64748b" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#e0e7ff" }} /> Výdaje
            </div>
          </div>
        </div>
        {/* Invoice rows */}
        {[
          { n: "Faktura #0042", a: "28 500 Kč", s: "uhrazena", c: "#22c55e" },
          { n: "Faktura #0041", a: "9 200 Kč", s: "odesláno", c: "#6366f1" },
        ].map((r,i) => (
          <div key={i} style={{ margin: "0 10px", padding: "7px 8px", borderRadius: 8, background: "#f8fafc", marginBottom: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>{r.n}</div>
              <div style={{ fontSize: 8, color: r.c, fontWeight: 600 }}>{r.s}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#0f172a" }}>{r.a}</div>
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>
      {/* Wallet mascot decoration */}
      <div style={{
        position: "absolute", bottom: 10, right: -40,
        width: 64, height: 64,
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        borderRadius: 18,
        boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect x="3" y="10" width="28" height="18" rx="4" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.5"/>
          <rect x="20" y="16" width="8" height="6" rx="2" fill="rgba(255,255,255,0.5)"/>
          <circle cx="24" cy="19" r="1.5" fill="white"/>
          <path d="M8 5h14l3 5H5L8 5z" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.3"/>
        </svg>
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  { step: "01", title: "Zadáte klienta",     desc: "Přidejte klienta ručně nebo doplňte z ARES podle IČ." },
  { step: "02", title: "Vytvoříte fakturu",  desc: "Vyplňte položky, ceny a datum splatnosti. Fakturina vygeneruje číslo i QR platbu." },
  { step: "03", title: "Systém zkontroluje", desc: "Validátor ověří, že faktura má všechny zákonné náležitosti." },
  { step: "04", title: "Odešlete online",    desc: "Klient dostane jedinečný odkaz, kde vidí fakturu a může ji zaplatit." },
  { step: "05", title: "Fakturina hlídá",    desc: "Automatické upomínky a přehled pohledávek za vás." },
];

const PRICING = [
  {
    name: "Free", price: 0, desc: "Pro začátek", highlight: false, badge: "",
    features: ["5 faktur měsíčně", "PDF faktury", "QR platba", "ARES", "Watermark Fakturina.cz"],
    cta: "Začít zdarma",
  },
  {
    name: "Start", price: 149, desc: "Základní fakturace", highlight: false, badge: "",
    features: ["Neomezené faktury", "Vlastní logo", "Bez watermarku", "Základní upomínky", "Export PDF/CSV"],
    cta: "Vybrat Start",
  },
  {
    name: "Pro", price: 249, desc: "Pro aktivní podnikatele", highlight: true, badge: "Nejoblíbenější",
    features: ["Opakované faktury", "Automatické upomínky", "Účetní přístup", "Více číselných řad", "Zálohové faktury"],
    cta: "Vybrat Pro",
  },
  {
    name: "Business", price: 449, desc: "Pro firmy", highlight: false, badge: "",
    features: ["Více firem", "API přístup", "Webhooky", "Role uživatelů", "Audit log"],
    cta: "Vybrat Business",
  },
];

function Check({ color = "#22c55e" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity={0.12}/>
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white" style={{ boxShadow: "0 1px 0 #e8e8e8, 0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[70px] md:h-[80px] flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <span className="text-[22px] md:text-[28px] font-black tracking-tight text-slate-900 leading-none">Fakturina</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: "Vlastnosti",     href: "#vlastnosti",     dropdown: true  },
              { label: "Ceník",          href: "#cenik",          dropdown: false },
              { label: "Jak to funguje", href: "#jak-to-funguje", dropdown: false },
              { label: "Časté dotazy",   href: "#faq",            dropdown: false },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[14px] font-medium hover:bg-slate-50 transition-all"
                style={{ color: "#040506" }}>
                {item.label}
                {item.dropdown && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-bold text-blue-600 hover:bg-blue-50 transition-all underline underline-offset-2 decoration-blue-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Můj účet
            </Link>
            <Link href="/register" className="hidden sm:inline-flex bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] md:text-[14px] font-extrabold px-4 md:px-5 py-2 rounded-full transition-colors whitespace-nowrap">
              Registrovat ZDARMA
            </Link>
            <button
              className="md:hidden p-2 text-slate-700"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 shadow-lg">
            {[
              { label: "Vlastnosti",     href: "#vlastnosti"     },
              { label: "Ceník",          href: "#cenik"          },
              { label: "Jak to funguje", href: "#jak-to-funguje" },
              { label: "Časté dotazy",   href: "#faq"            },
              { label: "Můj účet",       href: "/login"          },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="block py-3 text-[15px] font-medium text-slate-800 border-b border-slate-100 last:border-0"
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/register"
              className="mt-4 flex items-center justify-center bg-[#22C55E] hover:bg-[#16A34A] text-white text-[15px] font-extrabold px-5 py-3 rounded-full transition-colors"
              onClick={() => setMobileOpen(false)}>
              Registrovat ZDARMA
            </Link>
          </div>
        )}
      </nav>

      <HeroSlider />

      {/* ── Stats bar ── */}
      <section style={{ borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 md:py-10">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { value: "300k+",   label: "podnikatelů"   },
              { value: "12 mil+", label: "faktur"         },
              { value: "4.7 ★",  label: "App Store"      },
            ].map(s => (
              <div key={s.label}
                className="group px-2 py-5 rounded-2xl cursor-default transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:bg-white"
                style={{ border: "1px solid transparent" }}
              >
                <div className="text-[1.6rem] sm:text-[2.4rem] font-black text-slate-900 leading-none mb-1.5 group-hover:text-indigo-600"
                  style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div className="text-[11px] sm:text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature 1 — Integrace s účetnictvím ── */}
      <section id="vlastnosti" style={{ background: "#FAF8F3" }} className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col gap-12 md:flex-row md:items-center md:gap-20">
            <div className="md:flex-[0_0_44%]">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-4">Integrace</p>
              <h2 className="text-[1.8rem] md:text-[2.1rem] font-black text-slate-900 leading-tight mb-5">
                Nechte účetní,<br />ať si stahují doklady samy
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                K dokladům ve fakturačním softwaru si účetní dostane 24/7 a na dálku. Vyhněte se přenášení krabic s doklady, posílání e-mailů a osobním schůzkám.
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-8">
                {["Money ERP", "Money S3", "Vario", "Pohoda"].map(name => (
                  <div key={name} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 shadow-sm">
                    {name}
                  </div>
                ))}
              </div>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 bg-white text-[14px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                Více o chytré funkci
              </Link>
            </div>
            <div className="flex justify-center md:flex-1">
              <div className="scale-[0.8] sm:scale-90 md:scale-100 origin-center">
                <PhoneInvoiceList />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 2 — Automatizace ── */}
      <section style={{ background: "#fff" }} className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col gap-12 md:flex-row md:items-center md:gap-20">
            <div className="md:flex-[0_0_44%]">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-4">Automatizace</p>
              <h2 className="text-[1.8rem] md:text-[2.1rem] font-black text-slate-900 leading-tight mb-5">
                Automatizujte,<br />automatizujte<br />a automatizujte
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                Již nebudete muset posílat upomínky svým zákazníkům ručně nebo pokaždé odkliknout, že faktura je uhrazena. Vytvářejte si šablony faktur, anebo nastavte jejich pravidelné vystavování a odesílání.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 bg-white text-[14px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                Více o chytré funkci
              </Link>
            </div>
            <div className="flex justify-center md:flex-1">
              <div className="scale-[0.8] sm:scale-90 md:scale-100 origin-center">
                <BankGrid />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 3 — Vystavit fakturu ── */}
      <section style={{ background: "#EEF2FF" }} className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col-reverse gap-12 md:flex-row md:items-center md:gap-20">
            <div className="flex justify-center md:flex-1">
              <div className="scale-[0.72] sm:scale-90 md:scale-100 origin-center">
                <LaptopDashboard />
              </div>
            </div>
            <div className="md:flex-[0_0_42%]">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-4">Fakturace</p>
              <h2 className="text-[1.8rem] md:text-[2.1rem] font-black text-slate-900 leading-tight mb-5">
                Vytvářejte vyladěné<br />faktury odkudkoliv
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                Cenovou nabídku, zálohovku nebo fakturu vystavíte za pár sekund – zadáte pár údajů a zbytek Fakturina doplní automaticky. QR platba, české náležitosti a export PDF jsou samozřejmostí.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white bg-white text-[14px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm">
                Více o chytré funkci
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 4 — Přehled příjmů ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col gap-12 md:flex-row md:items-center md:gap-20">
            <div className="md:flex-[0_0_44%]">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-4">Přehled</p>
              <h2 className="text-[2.1rem] font-black text-slate-900 leading-tight mb-5">
                Příjmy a výdaje<br />máte pod kontrolou
              </h2>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                V programu na faktury na jednom místě vidíte, kolik jste vyfakturovali, co vám přijde na účet a kolik musíte zaplatit.
              </p>
              <div className="flex items-center gap-3 mb-8">
                <Link href="#" style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 10, background: "#0a0a0b",
                  color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  App Store
                </Link>
                <Link href="#" style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 10, background: "#0a0a0b",
                  color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.33.18.7.24 1.08.17l11.37-11.37L12 9.13 3.18 23.76zm17.53-10.85L18 11.37 14.87 9.5 3.37.9C3.11.74 2.82.69 2.55.77L13.58 11.8l7.13 1.11zM2.55.77C2.27.86 2.05 1.1 2 1.42V22.6c.05.3.25.55.55.65L13.58 12.2 2.55.77zm12.18 11.03l2.96-1.66 2.02-1.17c.6-.35.6-1.22 0-1.57l-2.02-1.17L14.87 6.1 11.7 12l3.03 3.03.96.53 1.06 1.06-4.05-4.83z"/></svg>
                  Google Play
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:flex-1">
              <div className="scale-[0.8] sm:scale-90 md:scale-100 origin-center">
                <PhoneChart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="jak-to-funguje" className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-3">Postup</p>
            <h2 className="text-[2.4rem] font-black text-slate-900 leading-tight mb-4">Jak to funguje?</h2>
            <p className="text-slate-400 text-lg">Od klienta k zaplacené faktuře za minuty</p>
          </div>
          <div className="relative">
            {/* Vertical connector */}
            <div className="absolute left-[19px] top-10 bottom-10 w-px bg-slate-100" />
            <div className="space-y-0">
              {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
                <div key={step} className="relative flex gap-6 pb-8 last:pb-0">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-[13px] text-white relative z-10"
                    style={{ background: "linear-gradient(135deg,#4F33E5,#7c3aed)" }}>
                    {i + 1}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-[15px] text-slate-900 mb-1">{title}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="cenik" className="py-16 md:py-24" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-3">Ceník</p>
            <h2 className="text-[2.4rem] font-black text-slate-900 leading-tight mb-4">Transparentní ceník</h2>
            <p className="text-slate-400 text-lg">Začněte zdarma, rozšiřte kdykoliv</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PRICING.map((plan) => (
              <div key={plan.name}
                className="bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-200"
                style={{
                  border: plan.highlight ? "2px solid #4F33E5" : "1px solid #e8e8e8",
                  boxShadow: plan.highlight ? "0 8px 32px rgba(79,51,229,0.14)" : "0 1px 4px rgba(0,0,0,0.05)",
                }}>
                {plan.badge && (
                  <div className="text-center py-2 text-[12px] font-bold tracking-wide text-white"
                    style={{ background: "#4F33E5" }}>
                    {plan.badge}
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="font-black text-xl text-slate-900 mb-0.5">{plan.name}</div>
                  <div className="text-[13px] text-slate-400 mb-5">{plan.desc}</div>
                  <div className="flex items-end gap-1 mb-7">
                    <span className="text-[2.2rem] font-black text-slate-900 leading-none">
                      {plan.price === 0 ? "Zdarma" : plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 text-sm mb-1"> Kč/měs.</span>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-slate-600">
                        <Check color={plan.highlight ? "#4F33E5" : "#22c55e"} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register"
                    className="block text-center py-3 rounded-xl text-[14px] font-bold transition-colors"
                    style={plan.highlight
                      ? { background: "#4F33E5", color: "#fff" }
                      : { background: "#f1f5f9", color: "#334155" }}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-indigo-500 mb-3">FAQ</p>
            <h2 className="text-[2.4rem] font-black text-slate-900 leading-tight">Časté dotazy</h2>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden px-8">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1348 50%,#0f172a 100%)" }} className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold mb-8"
            style={{ background: "rgba(79,51,229,0.25)", color: "#a5b4fc" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Bezplatná registrace za 30 sekund
          </div>
          <h2 className="text-[2rem] sm:text-[2.6rem] font-black text-white leading-tight mb-5">
            Začněte fakturovat<br />chytře
          </h2>
          <p className="mb-10" style={{ color: "rgba(255,255,255,0.5)", fontSize: 17 }}>
            Žádná kreditní karta. Žádný závazek.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 font-bold rounded-full px-8 py-4 text-[15px] transition-all hover:scale-105"
            style={{ background: "#22C55E", color: "#fff", boxShadow: "0 8px 24px rgba(34,197,94,0.35)" }}>
            Vyzkoušet zdarma <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e8e8e8", boxShadow: "0 -2px 8px rgba(0,0,0,0.04)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="text-[22px] font-black text-slate-900 mb-3">Fakturina</div>
              <p className="text-[13px] leading-relaxed mb-5 text-slate-400">
                Moderní fakturace pro české podnikatele.
              </p>
            </div>
            {/* Product */}
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-5 text-slate-400">Produkt</div>
              <ul className="space-y-3">
                {["Vlastnosti", "Ceník", "Šablony faktur", "Changelog"].map(l => (
                  <li key={l}><Link href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            {/* Support */}
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-5 text-slate-400">Podpora</div>
              <ul className="space-y-3">
                {["Nápověda", "Kontakt", "Pro účetní", "API dokumentace"].map(l => (
                  <li key={l}><Link href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase mb-5 text-slate-400">Právní</div>
              <ul className="space-y-3">
                {["Podmínky použití", "Ochrana soukromí", "GDPR", "Cookies"].map(l => (
                  <li key={l}><Link href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100">
            <p className="text-[13px] text-slate-400">© 2026 Fakturina.cz — Všechna práva vyhrazena</p>
            <div className="flex gap-6">
              {["Přihlášení", "Registrace"].map(l => (
                <Link key={l} href={l === "Přihlášení" ? "/login" : "/register"}
                  className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
