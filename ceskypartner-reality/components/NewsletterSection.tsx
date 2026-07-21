"use client";

import { useState } from "react";
import { toast, Toaster } from "sonner";
import Reveal from "./Reveal";
import type { SiteLocale } from "@/lib/locale";

export default function NewsletterSection({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error(en ? "Please confirm that you agree to the processing of your personal data." : "Potvrďte prosím souhlas se zpracováním osobních údajů.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || (en ? "We could not complete your subscription." : "Chyba při přihlašování."));
      }
      (window as any).plausible?.("Newsletter");
      toast.success(en ? "Thank you. You are now subscribed." : "Děkujeme, jste přihlášeni k odběru.");
      setEmail("");
      setConsent(false);
    } catch (err: any) {
      toast.error(err.message || (en ? "We could not complete your subscription." : "Chyba při přihlašování."));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="border-t border-line bg-paper">
      <Toaster position="bottom-right" richColors />
      <div className="mx-auto grid max-w-site items-center gap-10 px-6 py-20 lg:grid-cols-2 xl:px-10">
        <Reveal>
          <p className="eyebrow text-muted">Newsletter</p>
          <h3 className="mt-4 text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
            {en ? "The finest new listings, in your inbox" : "Nejnovější nabídky do vašeho e-mailu"}
          </h3>
          <p className="mt-3 text-[14.5px] leading-[1.65] text-muted">
            {en ? "A thoughtful weekly edit of new properties and market insight. No noise, no spam." : "Jednou týdně. Vybrané nemovitosti a dění na trhu, žádný spam."}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <form onSubmit={submit} noValidate={false}>
            <div className="flex flex-col gap-px bg-line sm:h-16 sm:flex-row">
              <label className="flex-1 bg-paper">
                <span className="sr-only">{en ? "Your email address" : "Váš e-mail"}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={en ? "you@example.com" : "vas@email.cz"}
                  className="h-14 w-full border border-line bg-paper px-5 text-[14px] outline-none transition-colors placeholder:text-muted/70 focus:border-bronze sm:h-full"
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="h-14 bg-ink px-10 text-[13px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep disabled:opacity-50 sm:h-full"
              >
                {sending ? (en ? "Subscribing…" : "Přihlašuji…") : (en ? "Subscribe" : "Odebírat")}
              </button>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-[12.5px] leading-relaxed text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#8a6d43]"
              />
              {en
                ? "I agree to the processing of my personal data for the purpose of receiving marketing communications."
                : "Souhlasím se zpracováním osobních údajů za účelem zasílání obchodních sdělení."}
            </label>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
