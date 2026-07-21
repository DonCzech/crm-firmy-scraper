"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { Agent } from "@/data/details";
import type { SiteLocale } from "@/lib/locale";

type ContactAgentFormProps = {
  agent: Agent;
  refNumber: string;
  listingTitle: string;
  /** DB id inzerátu — poptávka se v CRM přiřadí k nemovitosti a makléři */
  listingId?: string;
  locale?: SiteLocale;
};

const inputClass =
  "h-11 w-full border border-line bg-paper px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-bronze";

export default function ContactAgentForm({ agent, refNumber, listingTitle, listingId, locale = "cs" }: ContactAgentFormProps) {
  const en = locale === "en";
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consent) {
      toast.error(en ? "Please confirm your consent to the processing of personal data." : "Potvrďte prosím souhlas se zpracováním osobních údajů.");
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          website: fd.get("website"),
          listingId,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(en ? "We could not send your enquiry. Please try again." : json.error || "Chyba při odesílání.");
      }

      toast.success(en ? "Thank you for your enquiry. We will contact you within 24 hours." : "Děkujeme za Váš zájem. Ozveme se do 24 hodin.");
      (window as any).plausible?.("Poptavka", { props: { typ: "nemovitost" } });
      form.reset();
      setConsent(false);
    } catch (err: any) {
      toast.error(err.message || (en ? "We could not send your enquiry." : "Chyba při odesílání."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="kontakt-makler" className="scroll-mt-24 border border-line bg-paper">
      <Toaster position="bottom-right" richColors />

      <div className="border-b border-line bg-stone/60 px-6 py-4">
        <p className="eyebrow text-bronze-deep">{en ? "Contact the listing agent" : "Kontaktujte makléře nemovitosti"}</p>
      </div>

      {/* Kompaktní portrét makléře — fotka vlevo, info vpravo */}
      <div className="flex items-center gap-5 px-6 py-5">
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border-2 border-bronze/30">
          <Image src={agent.photo} alt={agent.name} fill sizes="88px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold tracking-[-0.01em]">{agent.name}</p>
          <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-muted">{agent.role}</p>
          <div className="mt-2.5 space-y-1 text-[13.5px]">
            <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 transition-colors hover:text-bronze-deep">
              <Phone size={14} strokeWidth={1.5} className="text-bronze" />
              {agent.phone}
            </a>
            <a href={`mailto:${agent.email}`} className="flex items-center gap-2 transition-colors hover:text-bronze-deep">
              <Mail size={14} strokeWidth={1.5} className="text-bronze" />
              {agent.email}
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mx-6 mb-6 border-t border-line pt-4">
        <p className="text-[15px] font-semibold">{en ? "I am interested in this property" : "Zaujala mě tato nemovitost"}</p>
        <div className="mt-4 space-y-2.5">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <input name="name" type="text" required placeholder={en ? "Full name" : "Jméno a příjmení"} className={inputClass} />
          <input name="email" type="email" required placeholder="E-mail" className={inputClass} />
          <input name="phone" type="tel" placeholder={en ? "Phone" : "Telefon"} className={inputClass} />
          <textarea
            name="message"
            rows={3}
            defaultValue={en
              ? `Hello, I would like to arrange a viewing of ${listingTitle} (ref. ${refNumber}).`
              : `Dobrý den, mám zájem o prohlídku nemovitosti ${listingTitle} (ref. ${refNumber}).`}
            className="w-full resize-none border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed outline-none transition-colors focus:border-bronze"
          />
        </div>
        <label className="mt-3 flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#8a6d43]"
          />
          {en ? "I consent to the processing of my personal data for the purpose of handling this enquiry." : "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky."}
        </label>
        <button
          type="submit"
          disabled={sending}
          className="mt-4 w-full bg-ink py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep disabled:opacity-50"
        >
          {sending ? (en ? "Sending…" : "Odesílám...") : (en ? "Send enquiry" : "Odeslat poptávku")}
        </button>
      </form>
    </div>
  );
}
