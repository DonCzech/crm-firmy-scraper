"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { SiteLocale } from "@/lib/locale";

type WatchdogFormProps = {
  /** SALE | RENT | INVESTMENT — předvyplní se z aktuální kategorie */
  deal?: string;
  /** APARTMENT | HOUSE | LAND | COMMERCIAL */
  kind?: string | null;
  /** Kompaktní varianta do empty state filtrů */
  compact?: boolean;
  locale?: SiteLocale;
};

const inputClass =
  "h-12 w-full border border-line bg-paper px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-bronze";

export default function WatchdogForm({ deal = "SALE", kind = null, compact = false, locale = "cs" }: WatchdogFormProps) {
  const en = locale === "en";
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    try {
      const res = await fetch("/api/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          website: fd.get("website"),
          priceMax: String(fd.get("priceMax") || "").replace(/\D/g, ""),
          note: fd.get("note"),
          deal,
          kind,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || (en ? "We could not submit your request." : "Chyba při odesílání."));
      }
      (window as any).plausible?.("HlidaciPes");
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || (en ? "We could not submit your request." : "Chyba při odesílání."));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center border border-line bg-paper px-8 py-12 text-center">
        <Check size={36} strokeWidth={1.4} className="text-bronze" />
        <p className="mt-4 text-[18px] font-semibold tracking-[-0.01em]">{en ? "Your property alert is active" : "Hlídací pes je aktivní"}</p>
        <p className="mt-2 max-w-md text-[14px] leading-[1.7] text-muted">
          {en
            ? "We will contact you as soon as a property matching your requirements becomes available — often before it reaches the public market."
            : "Jakmile se objeví nemovitost podle vašich kritérií, ozveme se vám jako prvnímu — často ještě před zveřejněním na portálech."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper">
      <Toaster position="bottom-right" richColors />
      <div className="flex items-center gap-3.5 border-b border-line bg-stone/50 px-6 py-4">
        <BellRing size={18} strokeWidth={1.5} className="shrink-0 text-bronze" />
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em]">{en ? "Property alert" : "Hlídací pes"}</p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            {en
              ? "Still looking? We will email suitable new properties, often before they appear on the portals."
              : "Nenašli jste, co hledáte? Nové nemovitosti vám pošleme e-mailem — dřív, než se objeví na portálech."}
          </p>
        </div>
      </div>
      <form onSubmit={submit} className={`grid gap-3 p-6 ${compact ? "" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <input name="name" type="text" placeholder={en ? "Full name" : "Jméno a příjmení"} className={inputClass} />
        <input name="email" type="email" required placeholder="E-mail *" className={inputClass} />
        <input name="phone" type="tel" placeholder={en ? "Telephone" : "Telefon"} className={inputClass} />
        <input name="priceMax" type="text" inputMode="numeric" placeholder={en ? "Maximum price (CZK)" : "Cena do (Kč)"} className={inputClass} />
        <div className={compact ? "" : "sm:col-span-2 lg:col-span-3"}>
          <input name="note" type="text" placeholder={en ? "What are you looking for? Location, layout, terrace…" : "Vaše představa — lokalita, dispozice, terasa…"} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="h-12 bg-ink px-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep disabled:opacity-50"
        >
          {sending ? (en ? "Activating…" : "Aktivuji…") : (en ? "Create alert" : "Aktivovat hlídání")}
        </button>
        <p className={`text-[11px] leading-[1.6] text-muted/80 ${compact ? "" : "sm:col-span-2 lg:col-span-4"}`}>
          {en
            ? "By submitting, you agree to the processing of your personal data for property recommendations. You can unsubscribe at any time."
            : "Odesláním souhlasíte se zpracováním osobních údajů za účelem zasílání nabídek. Odhlásit se můžete kdykoli."}
        </p>
      </form>
    </div>
  );
}
