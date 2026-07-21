"use client";

import { useState } from "react";
import { Check, Printer, Share2 } from "lucide-react";
import type { SiteLocale } from "@/lib/locale";

type ShareActionsProps = {
  title: string;
  locale?: SiteLocale;
};

// Sdílení (native share / kopírování odkazu) + tisk detailu do PDF přes print CSS
export default function ShareActions({ title, locale = "cs" }: ShareActionsProps) {
  const en = locale === "en";
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const btnClass =
    "flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 hover:border-ink print:hidden";

  return (
    <>
      <button type="button" onClick={share} aria-label={en ? "Share property" : "Sdílet nemovitost"} title={copied ? (en ? "Link copied" : "Odkaz zkopírován") : (en ? "Share" : "Sdílet")} className={btnClass}>
        {copied ? <Check size={17} strokeWidth={1.5} className="text-bronze" /> : <Share2 size={17} strokeWidth={1.5} />}
      </button>
      <button type="button" onClick={() => window.print()} aria-label={en ? "Print or save as PDF" : "Vytisknout nebo uložit jako PDF"} title={en ? "Print / PDF" : "Tisk / PDF"} className={btnClass}>
        <Printer size={17} strokeWidth={1.5} />
      </button>
    </>
  );
}
