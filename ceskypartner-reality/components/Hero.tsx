"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import PropertySearchModal from "./PropertySearchModal";
import type { SiteLocale } from "@/lib/locale";

export default function Hero({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const [showVideo, setShowVideo] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    setShowVideo(wide.matches && motionOk.matches);
  }, []);

  return (
    <>
      <section className="relative flex h-[100svh] min-h-[620px] flex-col overflow-hidden" id={en ? "home" : "uvod"}>
        {/* Pozadí má vlastní stacking context, aby poster na mobilu nikdy
            nepřekryl navigaci a obsah hero sekce. */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/video/hero-poster.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {showVideo && (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/video/hero-poster.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src="/video/hero.mp4" type="video/mp4" />
            </video>
          )}
          {/* Vinětace — silnější ztmavení nahoře kvůli čitelnosti hlavičky nad videem */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(10,12,14,0.72)] via-[rgba(10,12,14,0.32)] via-40% to-[rgba(10,12,14,0.62)]" />
        </div>

        {/* Obsah */}
        <div className="relative z-20 mx-auto flex w-full max-w-site flex-1 flex-col items-center justify-center px-6 pt-[112px] text-center xl:px-10">
          <p className="eyebrow text-paper/70">
            {en ? "Exceptional property across the Czech Republic" : "Prémiové nemovitosti v České republice"}
          </p>

          <h1 className="mt-5 text-paper">
            <span className="block text-[clamp(2.6rem,5.5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
              Český Partner
            </span>
            <span className="mt-3 block text-[clamp(1.15rem,1.8vw,1.5rem)] font-normal tracking-[0.14em] text-paper/85">
              {en ? "Real Estate" : "Realitní kancelář"}
            </span>
          </h1>

          {/* CTA Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group relative mt-12 overflow-hidden border border-paper/50 transition-[border-color,box-shadow] duration-500 ease-luxe hover:border-paper hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            {/* Výplň vyjíždějící zespodu */}
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-luxe group-hover:scale-y-100" />
            <span className="relative z-10 flex items-center gap-4 px-12 py-[18px] text-[13px] font-semibold uppercase tracking-[0.2em] text-paper transition-colors duration-500 ease-luxe group-hover:text-ink md:px-16 md:py-[21px] md:text-[13.5px]">
              <Search
                size={16}
                strokeWidth={1.8}
                className="text-bronze transition-transform duration-500 ease-luxe group-hover:rotate-90"
              />
              {en ? "Explore our properties" : "Nabídka nemovitostí"}
            </span>
            {/* Bronzová linka dole */}
            <span className="absolute bottom-0 left-0 z-10 h-[2px] w-full origin-left scale-x-0 bg-bronze transition-transform duration-500 ease-luxe group-hover:scale-x-100" />
          </button>
        </div>

        {/* Scroll cue — label + linka se stékajícím zlatým světlem */}
        <div className="relative z-20 flex justify-center pb-8">
          <a
            href={en ? "#selected" : "#vybrane"}
            aria-label={en ? "Scroll to selected properties" : "Posunout na nabídku nemovitostí"}
            className="group flex flex-col items-center gap-3.5"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-paper/60 transition-colors duration-500 group-hover:text-paper [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
              {en ? "Discover more" : "Objevte více"}
            </span>
            <span className="relative h-14 w-px overflow-hidden" aria-hidden>
              <span className="absolute inset-0 bg-white/20" />
              <span className="scroll-line-runner absolute left-0 top-0 h-6 w-px bg-gradient-to-b from-transparent via-[#EAD3A2] to-bronze" />
            </span>
          </a>
        </div>
      </section>

      <PropertySearchModal open={searchOpen} onClose={() => setSearchOpen(false)} locale={locale} />
    </>
  );
}
