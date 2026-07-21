"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { SiteLocale } from "@/lib/locale";

const inputClass =
  "h-12 w-full border border-line bg-paper px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-bronze";
const selectClass =
  "h-12 w-full cursor-pointer border border-line bg-paper px-4 text-[14px] text-ink outline-none transition-colors focus:border-bronze";

export default function ValuationForm({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [consent, setConsent] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast.error(en ? "Please confirm that you agree to the processing of your personal data." : "Potvrďte prosím souhlas se zpracováním osobních údajů.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          website: fd.get("website"),
          message: [
            "Žádost o odhad ceny nemovitosti",
            "",
            `Typ: ${fd.get("kind")}`,
            `Dispozice: ${fd.get("disposition") || "—"}`,
            `Plocha: ${fd.get("area") || "—"} m²`,
            `Lokalita: ${fd.get("location")}`,
            `Záměr: ${fd.get("intent")}`,
            fd.get("note") ? `Poznámka: ${fd.get("note")}` : null,
          ].filter((line) => line !== null).join("\n"),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || (en ? "We could not submit your valuation request." : "Chyba při odesílání."));
      }
      (window as any).plausible?.("Poptavka", { props: { typ: "odhad" } });
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || (en ? "We could not submit your valuation request." : "Chyba při odesílání."));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center border border-line bg-paper px-8 py-16 text-center">
        <CheckCircle2 size={48} strokeWidth={1.2} className="text-bronze" />
        <p className="mt-6 text-[20px] font-semibold tracking-[-0.01em]">{en ? "We have received your valuation request" : "Žádost o odhad jsme přijali"}</p>
        <p className="mt-3 max-w-md text-[14.5px] leading-[1.7] text-muted">
          {en
            ? "Within 24 hours, a local specialist will contact you with an initial view of value and the most appropriate next step. There is no fee and no obligation."
            : "Do 24 hodin se vám ozve makléř specializovaný na vaši lokalitu s orientačním odhadem a návrhem dalšího postupu — vše zdarma a nezávazně."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-line bg-paper p-6 md:p-8">
      <Toaster position="bottom-right" richColors />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{en ? "Property type" : "Typ nemovitosti"} *</span>
          <select name="kind" required className={selectClass} defaultValue={en ? "Apartment" : "Byt"}>
            {(en ? ["Apartment", "Family house", "Land", "Commercial property", "Apartment building"] : ["Byt", "Rodinný dům", "Pozemek", "Komerční prostor", "Činžovní dům"]).map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{en ? "Your plans" : "Záměr"} *</span>
          <select name="intent" required className={selectClass} defaultValue={en ? "Sell" : "Prodej"}>
            {(en ? ["Sell", "Let", "I only need a valuation"] : ["Prodej", "Pronájem", "Jen chci znát cenu"]).map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <input name="disposition" type="text" placeholder={en ? "Layout (e.g. 3+kk)" : "Dispozice (např. 3+kk)"} className={inputClass} />
        <input name="area" type="text" inputMode="numeric" placeholder={en ? "Floor area (m²)" : "Plocha (m²)"} className={inputClass} />
        <div className="sm:col-span-2">
          <input name="location" type="text" required placeholder={en ? "Property address or location *" : "Adresa nebo lokalita nemovitosti *"} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="note"
            rows={3}
            placeholder={en ? "Condition, recent improvements or anything else we should know…" : "Stav nemovitosti, rekonstrukce, cokoli důležitého…"}
            className="w-full resize-none border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-bronze"
          />
        </div>
        <input name="name" type="text" required placeholder={en ? "Full name *" : "Jméno a příjmení *"} className={inputClass} />
        <input name="phone" type="tel" required placeholder={en ? "Telephone *" : "Telefon *"} className={inputClass} />
        <div className="sm:col-span-2">
          <input name="email" type="email" required placeholder="E-mail *" className={inputClass} />
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#8a6d43]"
        />
        {en ? "I agree to the processing of my personal data for the purpose of preparing the valuation." : "Souhlasím se zpracováním osobních údajů za účelem vypracování odhadu."}{" "}
        <a href={en ? "/en/privacy" : "/ochrana-osobnich-udaju"} className="underline underline-offset-2 hover:text-ink">{en ? "Privacy policy" : "Zásady zpracování"}</a>
      </label>
      <button
        type="submit"
        disabled={sending}
        className="mt-5 flex w-full items-center justify-center gap-2.5 bg-ink py-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep disabled:opacity-50"
      >
        <Send size={14} strokeWidth={1.5} />
        {sending ? (en ? "Sending…" : "Odesílám…") : (en ? "Request a complimentary valuation" : "Chci odhad zdarma")}
      </button>
    </form>
  );
}
