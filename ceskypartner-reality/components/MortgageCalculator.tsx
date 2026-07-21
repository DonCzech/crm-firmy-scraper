"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Landmark, Send, ShieldCheck, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { SiteLocale } from "@/lib/locale";

type MortgageCalculatorProps = {
  /** Kupní cena nemovitosti v Kč */
  price: number;
  listingTitle?: string;
  refNumber?: string;
  /** DB id inzerátu — žádost se v CRM přiřadí k nemovitosti */
  listingId?: string;
  locale?: SiteLocale;
};

const INTEREST_RATE = 4.69; // % p.a. — orientační sazba
const MAX_LTV = 0.8;
const MIN_YEARS = 5;
const MAX_YEARS = 30;

const money = (n: number, en = false) => `${Math.round(n).toLocaleString(en ? "en-GB" : "cs-CZ")} ${en ? "CZK" : "Kč"}`;

function monthlyPayment(loan: number, years: number, ratePct: number): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

const inputClass =
  "h-12 w-full border border-line bg-paper px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-bronze";

export default function MortgageCalculator({ price, listingTitle, refNumber, listingId, locale = "cs" }: MortgageCalculatorProps) {
  const en = locale === "en";
  const amount = (value: number) => money(value, en);
  const maxLoan = Math.round((price * MAX_LTV) / 1000) * 1000;
  const minLoan = Math.min(Math.round((price * 0.1) / 1000) * 1000, maxLoan);
  const [loan, setLoan] = useState(maxLoan);
  const [years, setYears] = useState(MAX_YEARS);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [consent, setConsent] = useState(false);

  const payment = useMemo(() => monthlyPayment(loan, years, INTEREST_RATE), [loan, years]);
  const ownFunds = price - loan;
  const modalRef = useFocusTrap<HTMLDivElement>(showForm);

  // Modál — zámek scrollu + Esc pro zavření
  useEffect(() => {
    if (!showForm) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowForm(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [showForm]);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast.error(en ? "Please confirm your consent to the processing of personal data." : "Potvrďte prosím souhlas se zpracováním osobních údajů.");
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
          listingId,
          message: [
            `${en ? "Mortgage enquiry" : "Žádost o financování hypotékou"} — ${listingTitle || (en ? "property" : "nemovitost")}${refNumber ? ` (ref. ${refNumber})` : ""}`,
            "",
            `${en ? "Purchase price" : "Kupní cena"}: ${amount(price)}`,
            `${en ? "Mortgage amount" : "Výše hypotéky"}: ${amount(loan)} (LTV ${Math.round((loan / price) * 100)} %)`,
            `${en ? "Own funds" : "Vlastní zdroje"}: ${amount(ownFunds)}`,
            `${en ? "Term" : "Doba splácení"}: ${years} ${en ? "years" : "let"}`,
            `${en ? "Estimated monthly payment" : "Orientační splátka"}: ${amount(payment)} / ${en ? "month" : "měsíc"}`,
            fd.get("income") ? `${en ? "Net monthly income" : "Čistý měsíční příjem"}: ${fd.get("income")} ${en ? "CZK" : "Kč"}` : null,
            fd.get("note") ? `${en ? "Note" : "Poznámka"}: ${fd.get("note")}` : null,
          ].filter((line) => line !== null).join("\n"),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(en ? "We could not send your request. Please try again." : json.error || "Chyba při odesílání.");
      }
      (window as any).plausible?.("Poptavka", { props: { typ: "hypoteka" } });
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || (en ? "We could not send your request." : "Chyba při odesílání."));
    } finally {
      setSending(false);
    }
  };

  const sliderClass = "h-1 w-full cursor-pointer appearance-none rounded-full bg-stone accent-[#8a6d43]";

  return (
    <div className="border border-line bg-paper">
      <Toaster position="bottom-right" richColors />

      <div className="flex items-center gap-3.5 border-b border-line bg-stone/50 px-6 py-4">
        <Landmark size={18} strokeWidth={1.5} className="shrink-0 text-bronze" />
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em]">{en ? "Estimate your mortgage payment" : "Spočítejte si splátku hypotéky"}</p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {en ? "An indicative calculation — our mortgage specialist will prepare a tailored quotation." : "Orientační výpočet — přesnou nabídku vám připraví náš hypoteční specialista."}
          </p>
        </div>
      </div>

      <div className="grid gap-x-12 gap-y-8 p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div className="space-y-7">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-[14px] text-muted">{en ? "Property purchase price" : "Kupní cena nemovitosti"}</p>
            <p className="text-[17px] font-semibold tracking-[-0.01em]">{amount(price)}</p>
          </div>

          <div>
            <div className="mb-3 flex items-baseline justify-between gap-6">
              <label htmlFor="mortgage-loan" className="text-[14px] text-muted">{en ? "Mortgage amount" : "Výše hypotéky"}</label>
              <p className="text-[15px] font-semibold tabular-nums tracking-[-0.01em]">{amount(loan)}</p>
            </div>
            <input
              id="mortgage-loan"
              type="range"
              min={minLoan}
              max={maxLoan}
              step={10000}
              value={loan}
              onChange={(e) => setLoan(Number(e.target.value))}
              className={sliderClass}
            />
            <p className="mt-2 text-[12px] text-muted/80">
              {en ? "Own funds" : "Vlastní zdroje"} {amount(ownFunds)} · LTV {Math.round((loan / price) * 100)} %
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-baseline justify-between gap-6">
              <label htmlFor="mortgage-years" className="text-[14px] text-muted">{en ? "Mortgage term" : "Doba splácení"}</label>
              <p className="text-[15px] font-semibold tabular-nums tracking-[-0.01em]">{years} {en ? "years" : "let"}</p>
            </div>
            <input
              id="mortgage-years"
              type="range"
              min={MIN_YEARS}
              max={MAX_YEARS}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className={sliderClass}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 border-t border-line pt-6 md:w-[264px] md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <div>
            <p className="eyebrow text-muted">{en ? "Monthly payment from" : "Měsíční splátka od"}</p>
            <p className="mt-3 text-[clamp(1.7rem,2.4vw,2.2rem)] font-semibold leading-none tracking-[-0.02em] text-bronze-deep">
              {amount(payment)}
            </p>
            <p className="mt-2.5 text-[12.5px] text-muted">
              {en ? "Interest rate from" : "Úroková sazba od"} {INTEREST_RATE.toLocaleString(en ? "en-GB" : "cs-CZ")} % p.a.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSent(false); setConsent(false); setShowForm(true); }}
            className="w-full bg-ink px-6 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep"
          >
            {en ? "Discuss financing" : "Zařídit hypotéku"}
          </button>
        </div>
      </div>

      {/* Jednorázové náklady + povinný disclaimer */}
      <div className="border-t border-line bg-stone/30 px-6 py-4 md:px-8">
        <p className="text-[12.5px] leading-[1.65] text-muted">
          <span className="font-semibold text-ink/70">{en ? "Typical one-off purchase costs:" : "Jednorázové náklady při koupi:"}</span>{" "}
          {en
            ? "Land Registry filing fee CZK 2,000 · bank valuation typically CZK 4,000–6,000 (often covered by the bank) · our legal service and escrow are included."
            : "návrh na vklad do katastru 2 000 Kč · znalecký odhad pro banku obvykle 4 000–6 000 Kč (řada bank hradí v akci) · právní servis a úschova v režii naší kanceláře."}
        </p>
        <p className="mt-2 text-[11px] leading-[1.6] text-muted/70">
          {en
            ? "This indicative calculation is not an offer to enter into a contract. The actual rate and payment depend on the applicant’s circumstances, the property value and the lender’s terms."
            : "Výpočet je orientační reprezentativní příklad a není nabídkou k uzavření smlouvy. Skutečná úroková sazba a splátka závisí na bonitě žadatele, hodnotě nemovitosti a podmínkách konkrétní banky."}
        </p>
      </div>

      {/* Modální formulář — portál (fixed uvnitř Reveal transformu by se počítal špatně) */}
      {showForm && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={en ? "Mortgage financing enquiry" : "Žádost o financování hypotékou"}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div ref={modalRef} className="relative flex max-h-[94dvh] w-full max-w-lg animate-[modal-in_0.45s_cubic-bezier(0.22,1,0.36,1)] flex-col overflow-hidden bg-paper shadow-[0_48px_120px_rgba(20,24,26,0.45)] sm:mx-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute right-3.5 top-3.5 z-10 flex h-10 w-10 items-center justify-center text-muted transition-colors hover:text-ink"
              aria-label={en ? "Close form" : "Zavřít formulář"}
            >
              <X size={19} strokeWidth={1.5} />
            </button>

            {sent ? (
              <div className="flex flex-col items-center px-8 py-16 text-center sm:py-20">
                <CheckCircle2 size={50} strokeWidth={1.2} className="text-bronze" />
                <p className="mt-6 text-[22px] font-semibold tracking-[-0.01em]">{en ? "Thank you for your enquiry" : "Děkujeme za váš zájem"}</p>
                <p className="mt-3 max-w-sm text-[14.5px] leading-[1.65] text-muted">
                  {en ? "We have received your financing enquiry. Our mortgage specialist will contact you within 24 hours with a tailored, no-obligation proposal." : <>Žádost o financování jsme přijali. Náš hypoteční specialista vás bude kontaktovat do&nbsp;24&nbsp;hodin s nezávaznou nabídkou na míru.</>}
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="mt-8 border border-ink px-10 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
                >
                  {en ? "Close" : "Zavřít"}
                </button>
              </div>
            ) : (
              <div className="overflow-y-auto">
                <div className="border-b border-line bg-stone/60 px-5 py-5 pr-14 sm:px-7">
                  <p className="eyebrow text-bronze-deep">{en ? "Mortgage financing" : "Financování hypotékou"}</p>
                  <p className="mt-2 text-[19px] font-semibold leading-snug tracking-[-0.01em]">
                    {en ? "Request a no-obligation proposal" : "Nezávazná žádost o nabídku"}
                  </p>
                  {listingTitle && (
                    <p className="mt-1 text-[13px] text-muted">
                      {listingTitle}{refNumber ? ` · ref. ${refNumber}` : ""}
                    </p>
                  )}
                </div>

                {/* Souhrn parametrů z kalkulačky */}
                <div className="grid grid-cols-3 gap-px border-b border-line bg-line text-center">
                  {([
                    [en ? "Mortgage" : "Hypotéka", amount(loan)],
                    [en ? "Term" : "Splatnost", `${years} ${en ? "years" : "let"}`],
                    [en ? "Payment from" : "Splátka od", amount(payment)],
                  ] as const).map(([label, value]) => (
                    <div key={label} className="bg-paper px-1.5 py-3.5 sm:px-2">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-muted sm:text-[9.5px] sm:tracking-[0.16em]">{label}</p>
                      <p className="mt-1.5 text-[12px] font-semibold tabular-nums tracking-[-0.01em] sm:text-[13.5px]">{value}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={submitForm} className="space-y-3 px-5 py-6 sm:px-7">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="name" type="text" required placeholder={en ? "Full name *" : "Jméno a příjmení *"} className={inputClass} />
                    <input name="phone" type="tel" required placeholder={en ? "Phone *" : "Telefon *"} className={inputClass} />
                  </div>
                  <input name="email" type="email" required placeholder="E-mail *" className={inputClass} />
                  <input name="income" type="text" inputMode="numeric" placeholder={en ? "Net monthly income (CZK) — optional" : "Čistý měsíční příjem (Kč) — nepovinné"} className={inputClass} />
                  <textarea
                    name="note"
                    rows={2}
                    placeholder={en ? "Note — optional" : "Poznámka — nepovinné"}
                    className="w-full resize-none border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-bronze"
                  />
                  <label className="flex cursor-pointer items-start gap-3 pt-1 text-[12px] leading-relaxed text-muted">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#8a6d43]"
                    />
                    {en ? "I consent to the processing of my personal data for the purpose of arranging financing." : "Souhlasím se zpracováním osobních údajů za účelem zprostředkování financování."}
                  </label>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2.5 bg-ink py-4 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep disabled:opacity-50"
                  >
                    <Send size={14} strokeWidth={1.5} />
                    {sending ? (en ? "Sending…" : "Odesílám…") : (en ? "Send no-obligation request" : "Odeslat nezávaznou žádost")}
                  </button>
                  <p className="flex items-center justify-center gap-2 pt-1 text-[11.5px] text-muted/80">
                    <ShieldCheck size={13} strokeWidth={1.5} className="text-bronze" />
                    {en ? "Free and without obligation — we compare offers across lenders." : "Nezávazné a zdarma — nabídku porovnáme napříč bankami."}
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
