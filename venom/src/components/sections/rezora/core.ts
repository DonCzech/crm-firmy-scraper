"use client";

/**
 * Sdílené jádro rezervačního widgetu — typy, čisté helpery a `useRezoraBooking`
 * hook. Veškerá logika (fetch poskytovatele/služeb, dostupné dny, sloty, odeslání
 * rezervace) žije zde; jednotlivé per-šablonové designy jsou pouze prezentační
 * vrstva nad tímto hookem. Napojuje se přímo na REST API projektu `rezervace`
 * přes absolutní `apiBaseUrl`, takže funguje i po přepnutí šablony na custom
 * doménu (API má CORS `*`).
 */

import { useState, useEffect, useMemo, useCallback } from "react";

export const DEFAULT_API = "https://app.rezora.cz";

export interface RezService {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number | string;
  currency: string;
  color?: string;
  image_url?: string;
  is_addon?: boolean;
}
export interface RezStaff {
  id: string;
  name: string;
  color?: string;
  avatar_url?: string;
  bio?: string;
}
export interface RezProvider {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
  avatar_color?: string;
  bio?: string;
  payment_cash?: boolean;
  payment_transfer?: boolean;
  bank_iban?: string;
  bank_owner?: string;
  payment_note?: string;
  require_email?: boolean;
  require_phone?: boolean;
}
export interface RezSlot { time: string; available: boolean }

export interface RezForm {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNotes: string;
}

/* ── čisté date helpery (bez date-fns) ─────────────────────────────────── */
export const DAY_HEADERS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
export const MONTHS = ["ledna","února","března","dubna","května","června","července","srpna","září","října","listopadu","prosince"];
export const MONTHS_NOM = ["Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec"];
export const WEEKDAYS = ["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"];

export const pad = (n: number) => String(n).padStart(2, "0");
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function daysInMonthGrid(year: number, month0: number): (Date | null)[] {
  const first = new Date(year, month0, 1);
  const dow = first.getDay();
  const padStart = dow === 0 ? 6 : dow - 1;
  const count = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < padStart; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(new Date(year, month0, d));
  return cells;
}
export function fmtDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
export function fmtPrice(price: number, currency: string) {
  if (!price) return "Zdarma";
  return `${Number(price).toLocaleString("cs-CZ")} ${currency}`;
}
export function fmtLongDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function fmtShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}
/**
 * Widget není <form>, takže nativní validace prohlížeče (required + type=email)
 * se nespustí — vynucujeme zde. Povinnost e-mailu/telefonu si řídí poskytovatel
 * v adminu (`require_email` / `require_phone`); server validuje totéž znovu.
 */
export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
export function canSubmitBooking(form: RezForm, rules?: ContactRules) {
  const requireEmail = rules?.requireEmail !== false;
  const requirePhone = rules?.requirePhone === true;
  if (form.clientName.trim().length < 2) return false;
  if (requireEmail && !isValidEmail(form.clientEmail)) return false;
  // vyplněný e-mail musí být platný i když povinný není
  if (!requireEmail && form.clientEmail.trim() && !isValidEmail(form.clientEmail)) return false;
  if (requirePhone && form.clientPhone.trim().length < 6) return false;
  // rezervace bez jakéhokoli kontaktu je nedoručitelná
  if (!form.clientEmail.trim() && !form.clientPhone.trim()) return false;
  return true;
}

export interface ContactRules {
  requireEmail: boolean;
  requirePhone: boolean;
}

export function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
}

export type RezStep = 0 | 1 | 2 | 3 | 4;

export interface RezoraBooking {
  // config
  apiBase: string;
  providerSlug: string;
  title: string;
  subtitle: string;
  // data
  provider: RezProvider | null;
  services: RezService[];
  staff: RezStaff[];
  loading: boolean;
  loadErr: string | null;
  paymentMethods: number;
  /** povinnost kontaktů dle nastavení poskytovatele */
  rules: ContactRules;
  canSubmit: boolean;
  // flow
  step: RezStep;
  setStep: (s: RezStep) => void;
  service: RezService | null;
  selStaff: RezStaff | null;
  setSelStaff: (s: RezStaff | null) => void;
  month: Date;
  setMonth: (fn: (m: Date) => Date) => void;
  dates: Set<string>;
  datesLoading: boolean;
  date: string | null;
  slots: RezSlot[];
  slotsLoading: boolean;
  time: string | null;
  form: RezForm;
  setForm: (f: RezForm) => void;
  payment: "cash" | "transfer" | "";
  setPayment: (p: "cash" | "transfer" | "") => void;
  submitting: boolean;
  submitErr: string;
  done: boolean;
  isAdmin: boolean;
  // derived
  today: Date;
  cells: (Date | null)[];
  totalDuration: number;
  // actions
  pickService: (s: RezService) => void;
  pickDate: (d: string) => void;
  pickTime: (t: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

/**
 * Krok výběru personálu jako plnohodnotný krok stepperu.
 * Hook `useRezoraBooking` drží kroky 0–4; výběr personálu je pod-krok kroku 1,
 * protože načtení dostupných dnů je na step===1 navázané. Tenhle helper z toho
 * dělá viditelný samostatný krok — a hlavně sjednocuje chování napříč designy
 * (jinak by ho každý design implementoval znovu a jinak).
 */
export function useStaffStep(b: RezoraBooking, labels: string[] = ["Služba", "Personál", "Termín", "Čas", "Kontakt"]) {
  const hasStaff = b.staff.length > 0;
  const [staffChosen, setStaffChosen] = useState(false);
  useEffect(() => { if (b.step === 0) setStaffChosen(false); }, [b.step]);

  const steps = hasStaff ? labels : [labels[0], ...labels.slice(2)];
  let vstep: number;
  if (!hasStaff) vstep = Math.min(b.step, 4);
  else if (b.step === 0) vstep = 0;
  else if (b.step === 1) vstep = staffChosen ? 2 : 1;
  else vstep = b.step + 1;

  return {
    hasStaff,
    staffChosen,
    setStaffChosen,
    steps,
    vstep,
    /** true = zobrazit výběr personálu, false = zobrazit kalendář */
    showStaffPicker: b.step === 1 && hasStaff && !staffChosen,
    showCalendar: b.step === 1 && (!hasStaff || staffChosen),
    pickStaff: (m: RezStaff | null) => { b.setSelStaff(m); setStaffChosen(true); },
    backFromCalendar: () => { if (hasStaff) setStaffChosen(false); else b.setStep(0); },
  };
}

export function useRezoraBooking(content: Record<string, unknown>, isAdmin = false): RezoraBooking {
  const apiBase = String(content.apiBaseUrl || DEFAULT_API).replace(/\/$/, "");
  const providerSlug = String(content.providerSlug || content.slug || "").trim();
  const title = String(content.title ?? "Rezervujte si termín");
  const subtitle = String(content.subtitle ?? "Vyberte službu a čas — potvrzení dorazí e-mailem.");

  // Nabídku (poskytovatel, služby, personál) přednačítá server ve `withRezoraPrefetch`
  // a předává ji v `content.__prefetch` — widget je pak vyplněný už v prvním HTML,
  // bez spinneru a viditelně pro vyhledávače. Když prefetch chybí (výpadek
  // rezervačního serveru, starší sekce), spadne se na původní načtení v prohlížeči.
  const prefetch = content.__prefetch as
    | { user: RezProvider; services: RezService[]; staff: RezStaff[] }
    | undefined;

  const [provider, setProvider] = useState<RezProvider | null>(prefetch?.user ?? null);
  const [services, setServices] = useState<RezService[]>(
    prefetch ? (prefetch.services || []).filter((s) => !s.is_addon) : []
  );
  const [staff, setStaff] = useState<RezStaff[]>(prefetch?.staff ?? []);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(!prefetch);

  const [step, setStep] = useState<RezStep>(0);
  const [service, setService] = useState<RezService | null>(null);
  const [selStaff, setSelStaff] = useState<RezStaff | null>(null);
  const [month, setMonthState] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [datesLoading, setDatesLoading] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<RezSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState<RezForm>({ clientName: "", clientEmail: "", clientPhone: "", clientNotes: "" });
  // Když poskytovatel nabízí jen jednu platbu, je předvolená. Při přednačtení
  // se to musí nastavit rovnou — fetch, který to dřív dělal, už neproběhne.
  const [payment, setPayment] = useState<"cash" | "transfer" | "">(() => {
    const u = prefetch?.user;
    if (!u) return "";
    if (u.payment_cash && !u.payment_transfer) return "cash";
    if (!u.payment_cash && u.payment_transfer) return "transfer";
    return "";
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!providerSlug) { setLoading(false); return; }
    // Data už dorazila ze serveru — žádný požadavek z prohlížeče není potřeba.
    if (prefetch) return;
    let cancelled = false;
    setLoading(true);

    // VÝKON: data se tahají, až když se sekce blíží do viewportu (rootMargin
    // 600px). Widget bývá pod ohybem → při prvním vykreslení stránky neproběhne
    // žádný požadavek navíc (PageSpeed), ale jakmile k němu uživatel scrolluje,
    // načte se okamžitě — žádné umělé čekání.
    // Kotvu #rezervace renderuje každý design, takže není potřeba ref přes 34 souborů.
    const run = () => {
      if (cancelled) return;
    fetch(`${apiBase}/api/users/${encodeURIComponent(providerSlug)}`)
      .then((r) => { if (!r.ok) throw new Error("not-found"); return r.json(); })
      .then((data) => {
        if (cancelled) return;
        setProvider(data.user);
        setServices((data.services || []).filter((s: RezService) => !s.is_addon));
        setStaff(data.staff || []);
        setLoading(false);
        const opts = data.user || {};
        if (opts.payment_cash && !opts.payment_transfer) setPayment("cash");
        else if (!opts.payment_cash && opts.payment_transfer) setPayment("transfer");
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

  useEffect(() => {
    if (step !== 1 || !provider) return;
    setDatesLoading(true);
    const m = `${month.getFullYear()}-${pad(month.getMonth() + 1)}`;
    const sp = selStaff ? `&staffId=${selStaff.id}` : "";
    fetch(`${apiBase}/api/bookings/available-dates?slug=${providerSlug}&month=${m}${sp}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.dates)) setDates(new Set(d.dates)); })
      .catch(() => {})
      .finally(() => setDatesLoading(false));
  }, [step, provider, month, selStaff, apiBase, providerSlug]);

  useEffect(() => {
    if (step !== 2 || !service || !date) return;
    setSlotsLoading(true);
    const sp = new URLSearchParams({ slug: providerSlug, date, serviceId: service.id });
    if (selStaff) sp.set("staffId", selStaff.id);
    fetch(`${apiBase}/api/bookings/slots?${sp}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [step, service, date, selStaff, apiBase, providerSlug]);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const cells = useMemo(() => daysInMonthGrid(month.getFullYear(), month.getMonth()), [month]);
  const paymentMethods = provider ? (provider.payment_cash ? 1 : 0) + (provider.payment_transfer ? 1 : 0) : 0;
  const totalDuration = service ? service.duration_minutes : 0;
  const rules: ContactRules = {
    requireEmail: provider?.require_email !== false,
    requirePhone: provider?.require_phone === true,
  };
  const canSubmit = canSubmitBooking(form, rules);

  const setMonth = useCallback((fn: (m: Date) => Date) => setMonthState(fn), []);
  const pickService = useCallback((s: RezService) => { setService(s); setStep(1); }, []);
  const pickDate = useCallback((d: string) => { setDate(d); setTime(null); setStep(2); }, []);
  const pickTime = useCallback((t: string) => { setTime(t); setStep(3); }, []);
  const reset = useCallback(() => {
    setStep(0); setService(null); setSelStaff(null); setDate(null); setTime(null);
    setForm({ clientName: "", clientEmail: "", clientPhone: "", clientNotes: "" });
    setDone(false); setSubmitErr("");
  }, []);

  const submit = useCallback(async () => {
    if (!service || !date || !time) return;
    if (paymentMethods > 1 && !payment) { setSubmitErr("Vyberte způsob platby"); return; }
    if (isAdmin) { setSubmitErr("Náhled v editoru — rezervace se neodešle."); return; }
    setSubmitErr(""); setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id, providerSlug,
          clientName: form.clientName, clientEmail: form.clientEmail,
          clientPhone: form.clientPhone, clientNotes: form.clientNotes,
          bookingDate: date, startTime: time,
          staffId: selStaff?.id || null, paymentMethod: payment,
        }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Rezervace selhala"); }
      setDone(true); setStep(4);
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : "Nastala chyba. Zkuste to prosím znovu.");
    } finally { setSubmitting(false); }
  }, [service, date, time, paymentMethods, payment, isAdmin, apiBase, providerSlug, form, selStaff]);

  return {
    apiBase, providerSlug, title, subtitle,
    provider, services, staff, loading, loadErr, paymentMethods, rules, canSubmit,
    step, setStep, service, selStaff, setSelStaff, month, setMonth,
    dates, datesLoading, date, slots, slotsLoading, time,
    form, setForm, payment, setPayment, submitting, submitErr, done, isAdmin,
    today, cells, totalDuration,
    pickService, pickDate, pickTime, submit, reset,
  };
}
