"use client";
import { useState } from "react";

const FAQS = [
  { q: "Je faktura platná pro český trh?", a: "Ano. Fakturina generuje faktury se všemi náležitostmi dle českého zákona o DPH a účetnictví." },
  { q: "Umí Fakturina QR platby?", a: "Ano, každá faktura obsahuje QR platbu v českém formátu, který podporují všechny české bankovní aplikace." },
  { q: "Umí automatické upomínky?", a: "Ano, od tarifu Start. Systém posílá upomínky 3 dny před splatností, v den splatnosti a po splatnosti." },
  { q: "Je vhodná pro plátce DPH?", a: "Ano. Fakturina podporuje neplátce, plátce DPH i identifikované osoby se správnými sazbami 0/12/21 %." },
  { q: "Mohu dát přístup účetní?", a: "Ano, od tarifu Pro. Účetní dostane přístup s omezenými právy jen pro čtení a export." },
  { q: "Bude dostupný export?", a: "Ano, export do PDF i CSV je dostupný od tarifu Start." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-slate-100">
      {FAQS.map(({ q, a }, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left gap-6 group"
          >
            <span className="font-semibold text-slate-900 text-[15px] group-hover:text-indigo-600 transition-colors">
              {q}
            </span>
            <svg
              width="20" height="20" viewBox="0 0 20 20" fill="none"
              style={{ flexShrink: 0, transition: "transform .2s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path d="M5 7.5l5 5 5-5" stroke={open === i ? "#4F33E5" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{
            maxHeight: open === i ? 200 : 0,
            overflow: "hidden",
            transition: "max-height .25s ease",
          }}>
            <p className="text-slate-500 text-sm leading-relaxed pb-5">{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
