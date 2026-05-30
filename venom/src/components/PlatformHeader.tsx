"use client";

import Link from "next/link";
import { useState } from "react";

export function PlatformHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white text-slate-950">
      <div className="mx-auto flex h-[72px] max-w-[1760px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2 font-black text-[30px] leading-none text-slate-950">
          <span className="font-black tracking-normal">Venom</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[15px] font-medium text-slate-950 lg:flex">
          <a href="#jak-to-funguje" className="transition-colors hover:text-[#7a6242]">Funkce</a>
          <a href="#ceny" className="transition-colors hover:text-[#7a6242]">Ceník</a>
          <a href="#sablony" className="transition-colors hover:text-[#7a6242]">Šablony</a>
          <a href="#reference" className="transition-colors hover:text-[#7a6242]">Reference</a>
          <a href="#podpora" className="transition-colors hover:text-[#7a6242]">Podpora</a>
          <a href="#kontakt" className="transition-colors hover:text-[#7a6242]">Kontakt</a>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a href="tel:+420704029722" className="text-[14px] font-medium text-slate-700 transition-colors hover:text-[#7a6242]">
            +420 704 029 722
          </a>
          <span className="text-[15px] font-medium">CZ</span>
          <Link href="/admin/login" className="text-[15px] font-medium text-slate-950 transition-colors hover:text-[#7a6242]">
            Přihlásit
          </Link>
          <a
            href="#start"
            className="bg-[#28a745] px-7 py-3 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(40,167,69,0.28)] transition hover:bg-[#218838] hover:shadow-[0_14px_30px_rgba(40,167,69,0.38)]"
          >
            Vyzkoušet zdarma
          </a>
        </div>

        <button
          className="p-2 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="text-lg font-black">{menuOpen ? "x" : "Menu"}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 text-[15px] font-medium text-slate-950 shadow-2xl lg:hidden">
          <a href="#jak-to-funguje" className="block" onClick={() => setMenuOpen(false)}>Funkce</a>
          <a href="#ceny" className="mt-4 block" onClick={() => setMenuOpen(false)}>Ceník</a>
          <a href="#sablony" className="mt-4 block" onClick={() => setMenuOpen(false)}>Šablony</a>
          <a href="#reference" className="mt-4 block" onClick={() => setMenuOpen(false)}>Reference</a>
          <a href="#podpora" className="mt-4 block" onClick={() => setMenuOpen(false)}>Podpora</a>
          <a href="#kontakt" className="mt-4 block" onClick={() => setMenuOpen(false)}>Kontakt</a>
          <Link href="/admin/login" className="mt-4 block">Přihlásit</Link>
          <a href="#start" className="mt-5 block bg-[#28a745] px-5 py-3 text-center font-bold text-white" onClick={() => setMenuOpen(false)}>Vyzkoušet zdarma</a>
        </div>
      )}
    </header>
  );
}
