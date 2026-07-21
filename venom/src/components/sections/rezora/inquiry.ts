"use client";

/**
 * Jádro poptávkových režimů widgetu (`inquiry`, `course`, `table`, `stay`).
 *
 * Na rozdíl od `useRezoraBooking` tu není kalendář dostupnosti ani sloty — tyhle
 * režimy neblokují konkrétní termín, jen posílají nezávaznou poptávku, kterou
 * majitel potvrzuje v administraci Rezory (`/admin/inquiries`). Nabídka
 * (services = témata / kurzy / typy pokojů) se přednačítá stejně jako u slotového
 * widgetu přes `content.__prefetch`, takže widget je vyplněný už v prvním HTML.
 *
 * Tok je řízený deklarativně: `INQUIRY_FLOW[mode]` je seznam kroků, kterými se
 * prochází — UI (`InquiryDesign`) je vykresluje genericky, žádné `if (step===N)`.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DEFAULT_API, canSubmitBooking, daysInMonthGrid,
  type RezProvider, type RezService, type RezForm, type ContactRules, type WidgetMode,
} from "./core";

/** Jeden krok poptávkového toku. `offer` se vynechá, když nabídka nemá položky. */
export type InquiryStep = "offer" | "party" | "prefdate" | "dates" | "contact";

const FLOW: Record<Extract<WidgetMode, "inquiry" | "course" | "table" | "stay">, InquiryStep[]> = {
  inquiry: ["offer", "contact"],
  course: ["offer", "contact"],
  table: ["party", "prefdate", "contact"],
  stay: ["offer", "dates", "contact"],
};

/** Slovník režimu — kicker, název kroku „offer", CTA, potvrzení. */
export interface InquiryVoice {
  kicker: string;
  offerTitle: string;
  offerLabel: string;
  cta: string;
  okTitle: string;
  okLead: string;
  notesLabel: string;
  notesPlaceholder: string;
}

export const INQUIRY_VOICE: Record<string, InquiryVoice> = {
  inquiry: {
    kicker: "Nezávazná poptávka",
    offerTitle: "S čím vám můžeme pomoci?",
    offerLabel: "Poptávka",
    cta: "Odeslat poptávku",
    okTitle: "Poptávka odeslána",
    okLead: "Ozveme se vám co nejdříve.",
    notesLabel: "Co potřebujete",
    notesPlaceholder: "Popište, s čím vám můžeme pomoci…",
  },
  course: {
    kicker: "Přihláška na kurz",
    offerTitle: "Vyberte kurz",
    offerLabel: "Kurz",
    cta: "Odeslat přihlášku",
    okTitle: "Přihláška odeslána",
    okLead: "Potvrzení a další kroky vám pošleme.",
    notesLabel: "Poznámka",
    notesPlaceholder: "Zkušenosti, dotazy, preferovaný termín…",
  },
  table: {
    kicker: "Rezervace stolu",
    offerTitle: "Rezervace stolu",
    offerLabel: "Stůl",
    cta: "Odeslat rezervaci",
    okTitle: "Rezervace odeslána",
    okLead: "Potvrzení stolu vám dáme obratem vědět.",
    notesLabel: "Přání",
    notesPlaceholder: "Alergie, oslava, umístění stolu…",
  },
  stay: {
    kicker: "Poptávka pobytu",
    offerTitle: "Vyberte ubytování",
    offerLabel: "Ubytování",
    cta: "Odeslat poptávku",
    okTitle: "Poptávka odeslána",
    okLead: "Dostupnost a cenu vám potvrdíme e-mailem.",
    notesLabel: "Přání",
    notesPlaceholder: "Počet osob, strava, speciální přání…",
  },
};

export interface RezoraInquiry {
  apiBase: string;
  providerSlug: string;
  mode: WidgetMode;
  title: string;
  subtitle: string;
  voice: InquiryVoice;
  // data
  provider: RezProvider | null;
  offers: RezService[];
  loading: boolean;
  loadErr: string | null;
  rules: ContactRules;
  isAdmin: boolean;
  // flow
  flow: InquiryStep[];
  stepIndex: number;
  current: InquiryStep;
  next: () => void;
  back: () => void;
  // selection
  offer: RezService | null;
  setOffer: (o: RezService | null) => void;
  partySize: number;
  setPartySize: (n: number) => void;
  prefDate: string | null;
  setPrefDate: (d: string | null) => void;
  prefTime: string;
  setPrefTime: (t: string) => void;
  checkIn: string | null;
  setCheckIn: (d: string | null) => void;
  checkOut: string | null;
  setCheckOut: (d: string | null) => void;
  form: RezForm;
  setForm: (f: RezForm) => void;
  // derived
  today: Date;
  nights: number;
  stepValid: boolean;
  canSubmit: boolean;
  // status
  submitting: boolean;
  submitErr: string;
  done: boolean;
  // actions
  submit: () => Promise<void>;
  reset: () => void;
}

export function useRezoraInquiry(
  content: Record<string, unknown>,
  mode: WidgetMode,
  isAdmin = false
): RezoraInquiry {
  const apiBase = String(content.apiBaseUrl || DEFAULT_API).replace(/\/$/, "");
  const providerSlug = String(content.providerSlug || content.slug || "").trim();
  const voice = INQUIRY_VOICE[mode] ?? INQUIRY_VOICE.inquiry;
  const title = String(content.title ?? voice.offerTitle);
  const subtitle = String(content.subtitle ?? "");

  const prefetch = content.__prefetch as
    | { user: RezProvider; services: RezService[]; staff: RezService[] }
    | undefined;

  const [provider, setProvider] = useState<RezProvider | null>(prefetch?.user ?? null);
  const [offers, setOffers] = useState<RezService[]>(
    prefetch ? (prefetch.services || []).filter((s) => !s.is_addon) : []
  );
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(!prefetch);

  const [offer, setOffer] = useState<RezService | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [prefDate, setPrefDate] = useState<string | null>(null);
  const [prefTime, setPrefTime] = useState("");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [form, setForm] = useState<RezForm>({ clientName: "", clientEmail: "", clientPhone: "", clientNotes: "" });

  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [done, setDone] = useState(false);

  // Nabídka se dotáhne na serveru (prefetch); fallback na fetch v prohlížeči,
  // stejnou strategií jako slotový widget (IntersectionObserver na #rezervace).
  useEffect(() => {
    if (!providerSlug) { setLoading(false); return; }
    if (prefetch) return;
    let cancelled = false;
    setLoading(true);
    const run = () => {
      if (cancelled) return;
      fetch(`${apiBase}/api/users/${encodeURIComponent(providerSlug)}`)
        .then((r) => { if (!r.ok) throw new Error("not-found"); return r.json(); })
        .then((data) => {
          if (cancelled) return;
          setProvider(data.user);
          setOffers((data.services || []).filter((s: RezService) => !s.is_addon));
          setLoading(false);
        })
        .catch(() => { if (!cancelled) { setLoadErr("Rezervační systém je dočasně nedostupný."); setLoading(false); } });
    };
    const el = typeof document !== "undefined" ? document.getElementById("rezervace") : null;
    if (!el || typeof IntersectionObserver === "undefined") { run(); return () => { cancelled = true; }; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); run(); }
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); };
  }, [apiBase, providerSlug]);

  // Efektivní tok: „offer" dává smysl jen když je z čeho vybírat.
  const flow = useMemo<InquiryStep[]>(() => {
    const base = FLOW[mode as keyof typeof FLOW] ?? FLOW.inquiry;
    return offers.length === 0 ? base.filter((s) => s !== "offer") : base;
  }, [mode, offers.length]);

  const current = flow[Math.min(stepIndex, flow.length - 1)];
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn + "T00:00:00");
    const b = new Date(checkOut + "T00:00:00");
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const rules: ContactRules = {
    requireEmail: provider?.require_email !== false,
    requirePhone: provider?.require_phone === true,
  };
  const contactOk = canSubmitBooking(form, rules);

  // Validace aktuálního kroku → povoluje „Pokračovat" / „Odeslat".
  const stepValid = useMemo(() => {
    switch (current) {
      case "offer": return offer != null;
      case "party": return partySize > 0;
      case "prefdate": return Boolean(prefDate);
      case "dates": return Boolean(checkIn && checkOut && nights > 0);
      case "contact": return contactOk;
      default: return true;
    }
  }, [current, offer, partySize, prefDate, checkIn, checkOut, nights, contactOk]);

  // K odeslání musí sedět kontakt i všechny strukturované kroky toku.
  const canSubmit = useMemo(() => {
    if (!contactOk) return false;
    if (flow.includes("offer") && !offer) return false;
    if (flow.includes("party") && !(partySize > 0)) return false;
    if (flow.includes("prefdate") && !prefDate) return false;
    if (flow.includes("dates") && !(checkIn && checkOut && nights > 0)) return false;
    return true;
  }, [contactOk, flow, offer, partySize, prefDate, checkIn, checkOut, nights]);

  const next = useCallback(() => setStepIndex((i) => Math.min(i + 1, flow.length - 1)), [flow.length]);
  const back = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);

  const reset = useCallback(() => {
    setStepIndex(0); setOffer(null); setPartySize(2);
    setPrefDate(null); setPrefTime(""); setCheckIn(null); setCheckOut(null);
    setForm({ clientName: "", clientEmail: "", clientPhone: "", clientNotes: "" });
    setDone(false); setSubmitErr("");
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    if (isAdmin) { setSubmitErr("Náhled v editoru — poptávka se neodešle."); return; }
    setSubmitErr(""); setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerSlug, mode,
          serviceId: offer?.id ?? null,
          clientName: form.clientName, clientEmail: form.clientEmail,
          clientPhone: form.clientPhone, clientNotes: form.clientNotes,
          partySize: mode === "table" ? partySize : null,
          preferredDate: mode === "table" ? prefDate : null,
          preferredTime: mode === "table" ? prefTime : null,
          checkIn: mode === "stay" ? checkIn : null,
          checkOut: mode === "stay" ? checkOut : null,
        }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Odeslání selhalo"); }
      setDone(true);
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "Nastala chyba. Zkuste to prosím znovu.");
    } finally { setSubmitting(false); }
  }, [canSubmit, isAdmin, apiBase, providerSlug, mode, offer, form, partySize, prefDate, prefTime, checkIn, checkOut]);

  return {
    apiBase, providerSlug, mode, title, subtitle, voice,
    provider, offers, loading, loadErr, rules, isAdmin,
    flow, stepIndex, current, next, back,
    offer, setOffer, partySize, setPartySize,
    prefDate, setPrefDate, prefTime, setPrefTime,
    checkIn, setCheckIn, checkOut, setCheckOut,
    form, setForm,
    today, nights, stepValid, canSubmit,
    submitting, submitErr, done,
    submit, reset,
  };
}

/** Mřížka měsíce pro jednoduché datové kroky (sdílí helper se slotovým jádrem). */
export { daysInMonthGrid };
