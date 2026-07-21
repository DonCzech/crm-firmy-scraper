"use client";

import { useState } from "react";
import { toast, Toaster } from "sonner";
import type { SiteLocale } from "@/lib/locale";

const inputClass =
  "h-12 w-full border border-line bg-paper px-4 text-[14px] outline-none transition-colors placeholder:text-muted/60 focus:border-bronze";

export default function ContactForm({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      toast.error(en ? "Please confirm that you agree to the processing of your personal data." : "Potvrďte prosím souhlas se zpracováním osobních údajů.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || (en ? "We could not send your message." : "Nepodařilo se odeslat zprávu."));
      }

      toast.success(en ? "Thank you. We will be in touch within 24 hours." : "Děkujeme za Váš zájem. Ozveme se do 24 hodin.");
      form.reset();
      setConsent(false);
    } catch (err: any) {
      toast.error(err.message || (en ? "We could not send your message." : "Chyba při odesílání."));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-paper p-8">
      <Toaster position="bottom-right" richColors />
      <h2 className="text-[17px] font-semibold">{en ? "Send us a message" : "Napište nám"}</h2>
      <div className="mt-6 space-y-3">
        <input name="name" type="text" required placeholder={en ? "Full name" : "Jméno a příjmení"} className={inputClass} />
        <input name="email" type="email" required placeholder="E-mail" className={inputClass} />
        <input name="phone" type="tel" placeholder={en ? "Telephone" : "Telefon"} className={inputClass} />
        <textarea
          name="message"
          rows={5}
          required
          placeholder={en ? "How can we help?" : "Vaše zpráva..."}
          className="w-full resize-none border border-line bg-paper px-4 py-3 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-muted/60 focus:border-bronze"
        />
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#8a6d43]"
        />
        {en ? "I agree to the processing of my personal data so that Český Partner can respond to my enquiry." : "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky."}
      </label>
      <button
        type="submit"
        disabled={sending}
        className="mt-6 h-13 w-full bg-ink py-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep disabled:opacity-50"
      >
        {sending ? (en ? "Sending…" : "Odesílám...") : (en ? "Send message" : "Odeslat zprávu")}
      </button>
    </form>
  );
}
