"use client";

import { useEffect, useRef, useState } from "react";
import { useCommerceTheme } from "./shared";

/**
 * Demo simulace velkých integračních modulů. V demu neběží skutečné
 * napojení na dopravce/ERP/SMS bránu — simulace ukazuje, co modul
 * v ostrém provozu dělá, s realistickým průběhem a výstupem.
 */

interface DemoRow {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "muted";
}

export interface ModuleDemo {
  title: string;
  intro: string;
  runLabel: string;
  steps: string[];
  resultHeading: string;
  rows: DemoRow[];
  footnote?: string;
}

export const MODULE_DEMOS: Record<string, ModuleDemo> = {
  "tisk-stitku": {
    title: "Tisk přepravních štítků",
    intro: "Vygeneruje přepravní štítky pro objednávky ve stavu „Připravujeme“ a předá zásilky dopravci.",
    runLabel: "Vygenerovat štítky (3 objednávky)",
    steps: [
      "Načítám objednávky ve stavu Připravujeme…",
      "Ověřuji adresy příjemců…",
      "Zakládám zásilky u dopravce (PPL API)…",
      "Generuji PDF štítky 105×148 mm…",
      "Ukládám sledovací čísla k objednávkám…",
    ],
    resultHeading: "Štítky připraveny k tisku",
    rows: [
      { label: "Obj. 2026-0142 → PPL Parcel CZ", value: "TR9920815342CZ", tone: "ok" },
      { label: "Obj. 2026-0143 → PPL Parcel CZ", value: "TR9920815343CZ", tone: "ok" },
      { label: "Obj. 2026-0144 → Balíkovna", value: "NP442918030CZ", tone: "ok" },
      { label: "PDF k tisku", value: "stitky-2026-07-11.pdf (3 str.)", tone: "muted" },
    ],
    footnote: "V ostrém provozu se štítky tisknou přímo z detailu objednávky a sledovací číslo se odešle zákazníkovi e-mailem.",
  },
  "synchronizace-skladu": {
    title: "Synchronizace skladů",
    intro: "Obousměrná synchronizace skladových zásob s externím skladem či ERP (Pohoda, Money, ABRA).",
    runLabel: "Spustit synchronizaci",
    steps: [
      "Připojuji se k ERP Pohoda (mServer)…",
      "Stahuji skladové karty (247 položek)…",
      "Porovnávám stavy zásob s e-shopem…",
      "Zapisuji rozdíly do e-shopu…",
      "Odesílám rezervace z nevyřízených objednávek…",
    ],
    resultHeading: "Synchronizace dokončena",
    rows: [
      { label: "Porovnáno skladových karet", value: "247" },
      { label: "Aktualizováno zásob v e-shopu", value: "18", tone: "ok" },
      { label: "Rezervace odeslané do ERP", value: "5", tone: "ok" },
      { label: "Konflikty k ručnímu ověření", value: "1 (SKU TW-0421)", tone: "warn" },
    ],
    footnote: "Synchronizace běží automaticky každých 15 minut, ručně ji lze spustit kdykoli.",
  },
  "automaticky-import": {
    title: "Automatický import produktů",
    intro: "Pravidelný noční import produktů, cen a dostupnosti z XML/CSV feedu dodavatele.",
    runLabel: "Spustit import z feedu",
    steps: [
      "Stahuji feed dodavatele (https://feed.dodavatel.cz/products.xml)…",
      "Validuji strukturu feedu (1 512 položek)…",
      "Páruji položky podle EAN/SKU…",
      "Aktualizuji ceny a dostupnost…",
      "Zakládám nové produkty jako koncepty…",
    ],
    resultHeading: "Import dokončen za 42 s",
    rows: [
      { label: "Položek ve feedu", value: "1 512" },
      { label: "Aktualizované ceny", value: "312", tone: "ok" },
      { label: "Aktualizovaná dostupnost", value: "1 204", tone: "ok" },
      { label: "Nové produkty (koncepty)", value: "9", tone: "ok" },
      { label: "Nespárované položky", value: "14", tone: "warn" },
    ],
    footnote: "Nové produkty se zakládají jako koncepty — před publikací je zkontrolujete v katalogu.",
  },
  "hromadne-emaily": {
    title: "Hromadné rozesílání e-mailů",
    intro: "Newsletter kampaně na zákazníky s marketingovým souhlasem, včetně segmentace a statistik.",
    runLabel: "Odeslat testovací kampaň",
    steps: [
      "Sestavuji segment: zákazníci s nákupem za 90 dní…",
      "Kontroluji marketingové souhlasy (GDPR)…",
      "Renderuji šablonu „Letní výprodej −20 %“…",
      "Odesílám přes SMTP relay (dávky po 50)…",
      "Zapisuji doručenky a otevření…",
    ],
    resultHeading: "Kampaň odeslána",
    rows: [
      { label: "Příjemců v segmentu", value: "184" },
      { label: "Doručeno", value: "181 (98,4 %)", tone: "ok" },
      { label: "Otevřeno (za 1. hodinu)", value: "64 (35,4 %)", tone: "ok" },
      { label: "Prokliky do e-shopu", value: "22 (12,2 %)", tone: "ok" },
      { label: "Odhlášení z odběru", value: "1", tone: "muted" },
    ],
  },
  "sms-upozorneni": {
    title: "SMS upozornění",
    intro: "Automatické SMS zákazníkům při změně stavu objednávky a expedici zásilky.",
    runLabel: "Odeslat testovací SMS",
    steps: [
      "Připojuji se k SMS bráně…",
      "Skládám zprávu ze šablony „Objednávka odeslána“…",
      "Odesílám na +420 777 ••• 456…",
      "Čekám na doručenku…",
    ],
    resultHeading: "SMS doručena",
    rows: [
      { label: "Text zprávy", value: "Vase objednavka 2026-0144 byla odeslana. Sledovani: bit.ly/tr442918", tone: "muted" },
      { label: "Stav doručení", value: "Doručeno za 2,1 s", tone: "ok" },
      { label: "Cena SMS", value: "0,89 Kč bez DPH" },
    ],
    footnote: "SMS se odesílají automaticky u stavů: potvrzeno, expedováno, připraveno k vyzvednutí.",
  },
  "provizni-system": {
    title: "Provizní (affiliate) systém",
    intro: "Partnerské odkazy s měřením konverzí a automatickým výpočtem provizí.",
    runLabel: "Přepočítat provize za červen",
    steps: [
      "Načítám konverze partnerů za období 6/2026…",
      "Ověřuji dokončené objednávky (bez vratek)…",
      "Počítám provize dle sazby partnera…",
      "Připravuji podklady k fakturaci…",
    ],
    resultHeading: "Provize za červen 2026",
    rows: [
      { label: "blog-recenze.cz (8 %)", value: "23 objednávek → 4 210 Kč", tone: "ok" },
      { label: "srovnavac-cen.cz (5 %)", value: "41 objednávek → 3 875 Kč", tone: "ok" },
      { label: "instagram @stylova.domacnost (10 %)", value: "12 objednávek → 2 140 Kč", tone: "ok" },
      { label: "Celkem k vyplacení", value: "10 225 Kč" },
      { label: "Čeká na schválení (vratková lhůta)", value: "6 objednávek", tone: "warn" },
    ],
  },
  "pokrocile-seo": {
    title: "Pokročilé SEO",
    intro: "SEO audit e-shopu: meta tagy, strukturovaná data, rychlost, indexace a duplicitní obsah.",
    runLabel: "Spustit SEO audit",
    steps: [
      "Procházím stránky e-shopu (crawl 96 URL)…",
      "Kontroluji title a meta description…",
      "Validuji strukturovaná data (Product, Offer, BreadcrumbList)…",
      "Měřím Core Web Vitals…",
      "Hledám duplicitní obsah a chybějící alt texty…",
    ],
    resultHeading: "SEO skóre: 87/100",
    rows: [
      { label: "Strukturovaná data Product/Offer", value: "V pořádku (42 produktů)", tone: "ok" },
      { label: "Meta description", value: "3 stránky chybí", tone: "warn" },
      { label: "Alt texty obrázků", value: "12 obrázků bez alt textu", tone: "warn" },
      { label: "Core Web Vitals (LCP)", value: "1,9 s — v limitu", tone: "ok" },
      { label: "Sitemap.xml + robots.txt", value: "V pořádku", tone: "ok" },
    ],
    footnote: "Doporučení se generují automaticky každý týden; detail najdete v reportu.",
  },
  "cizi-meny": {
    title: "Cizí měny",
    intro: "Prodej v EUR a dalších měnách s automatickým přepočtem podle kurzu ČNB.",
    runLabel: "Aktualizovat kurzy ČNB",
    steps: [
      "Stahuji kurzovní lístek ČNB…",
      "Aplikuji obchodní přirážku +1,5 %…",
      "Přepočítávám ceníky (42 produktů × 3 měny)…",
      "Zaokrouhluji na marketingové ceny (…9,90)…",
    ],
    resultHeading: "Kurzy aktualizovány (11. 7. 2026)",
    rows: [
      { label: "EUR", value: "1 € = 24,85 Kč (prodejní 25,22)", tone: "ok" },
      { label: "USD", value: "1 $ = 22,10 Kč (prodejní 22,43)", tone: "ok" },
      { label: "PLN", value: "1 zł = 5,84 Kč (prodejní 5,93)", tone: "ok" },
      { label: "Přepočteno cen", value: "126", tone: "muted" },
    ],
    footnote: "Zákazník volí měnu v hlavičce e-shopu; objednávky se účtují v měně košíku.",
  },
  velkoobchod: {
    title: "Velkoobchod (B2B)",
    intro: "B2B ceníky, individuální slevy pro registrované firmy a nákup na fakturu se splatností.",
    runLabel: "Ukázat B2B cenotvorbu",
    steps: [
      "Načítám velkoobchodní partnery…",
      "Aplikuji cenové hladiny (VO1–VO3)…",
      "Počítám ukázkovou nabídku pro Interiéry Novák s.r.o.…",
    ],
    resultHeading: "Ukázka: Interiéry Novák s.r.o. (hladina VO2, −18 %)",
    rows: [
      { label: "Keramická váza Terra (maloobchod 890 Kč)", value: "VO cena 730 Kč", tone: "ok" },
      { label: "Lněný ubrus Natur (maloobchod 1 290 Kč)", value: "VO cena 1 058 Kč", tone: "ok" },
      { label: "Platební podmínky", value: "Faktura, splatnost 14 dní" },
      { label: "Minimální objednávka", value: "5 000 Kč bez DPH", tone: "muted" },
    ],
    footnote: "B2B zákazníci vidí velkoobchodní ceny po přihlášení; registrace firem schvalujete v sekci Zákazníci.",
  },
};

export function ModuleDemoModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const t = useCommerceTheme();
  const demo = MODULE_DEMOS[slug];
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  if (!demo) return null;

  function run() {
    setPhase("running");
    setStepIndex(0);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      if (i >= demo.steps.length) {
        if (timer.current) clearInterval(timer.current);
        setStepIndex(demo.steps.length);
        setPhase("done");
      } else {
        setStepIndex(i);
      }
    }, 650);
  }

  const toneCls: Record<string, string> = {
    ok: "text-emerald-600",
    warn: "text-amber-600",
    muted: "text-slate-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[86vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-indigo-500">Demo simulace</div>
            <h3 className="mt-0.5 text-[18px] font-extrabold text-slate-900">{demo.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Zavřít">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{demo.intro}</p>

        {phase === "idle" && (
          <button onClick={run} className={`mt-5 w-full justify-center ${t.btnPrimary}`}>
            {demo.runLabel}
          </button>
        )}

        {phase !== "idle" && (
          <div className="mt-5 rounded-xl bg-slate-950 p-4 font-mono text-[12px] leading-[1.9] text-slate-300">
            {demo.steps.slice(0, phase === "done" ? demo.steps.length : stepIndex + 1).map((s, i) => {
              const finished = phase === "done" || i < stepIndex;
              return (
                <div key={s} className="flex items-start gap-2">
                  <span className={finished ? "text-emerald-400" : "animate-pulse text-amber-300"}>
                    {finished ? "✓" : "…"}
                  </span>
                  <span>{s}</span>
                </div>
              );
            })}
          </div>
        )}

        {phase === "done" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <h4 className="text-[14px] font-extrabold text-slate-900">{demo.resultHeading}</h4>
            <dl className="mt-2.5 space-y-1.5">
              {demo.rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-4 text-[12.5px]">
                  <dt className="text-slate-600">{r.label}</dt>
                  <dd className={`text-right font-bold ${r.tone ? toneCls[r.tone] : "text-slate-900"}`}>{r.value}</dd>
                </div>
              ))}
            </dl>
            {demo.footnote && <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">{demo.footnote}</p>}
          </div>
        )}

        {phase === "done" && (
          <div className="mt-4 flex gap-2">
            <button onClick={run} className={`${t.btnGhost} flex-1 justify-center`}>Spustit znovu</button>
            <button onClick={onClose} className={`${t.btnPrimary} flex-1 justify-center`}>Hotovo</button>
          </div>
        )}
      </div>
    </div>
  );
}
