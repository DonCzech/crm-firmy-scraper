"use client";

/**
 * Poptávkový design widgetu — režimy `inquiry`, `course`, `table`, `stay`.
 *
 * Sdílí tvarový jazyk se slotovým `AdaptiveDesign` (stejné `.rz` třídy + presety
 * sharp/soft/clinical/editorial z `styles.ts`), takže poptávka na dané šabloně
 * vypadá jako pokračování jejího designu. Tok je řízený deklarativně přes
 * `useRezoraInquiry().flow` — každý krok se vykreslí genericky, žádné `if step`.
 *
 * Na rozdíl od rezervace tu není kalendář dostupnosti: `prefdate` i `dates` jsou
 * čistě preferenční (jakýkoli budoucí den), protože poptávku majitel potvrzuje.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { RZ_CSS } from "./styles";
import type { RezPreset } from "./AdaptiveDesign";
import {
  useRezoraInquiry, type InquiryStep,
} from "../inquiry";
import {
  pad, ymd, fmtPrice, fmtShortDate, fmtLongDate, isValidEmail,
  daysInMonthGrid, DAY_HEADERS, MONTHS_NOM, type RezService, type WidgetMode,
} from "../core";

const anim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.22 },
};

/** Předvolené časy pro režim „stůl" — jen preference, nejsou to sloty. */
const TABLE_TIMES = ["11:30", "12:00", "12:30", "13:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

const STEP_LABEL: Record<InquiryStep, string> = {
  offer: "Výběr",
  party: "Počet osob",
  prefdate: "Termín",
  dates: "Termín pobytu",
  contact: "Kontakt",
};

interface Props {
  content: Record<string, unknown>;
  mode: WidgetMode;
  preset: RezPreset;
  isAdmin: boolean;
  sectionId: number;
}

export function InquiryDesign({ content, mode, preset, isAdmin, sectionId }: Props) {
  const q = useRezoraInquiry(content, mode, isAdmin);
  const editable = q.stepIndex === 0 && !q.done;
  // Popisek kroku „offer" respektuje režim (Kurz / Ubytování / Poptávka…).
  const stepLabel = (s: InquiryStep) => (s === "offer" ? q.voice.offerLabel : STEP_LABEL[s]);

  return (
    <section id="rezervace" className={`rz rz--${preset}`} style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: RZ_CSS + INQUIRY_CSS }} />
      <div className="rz-grid">
        {/* ── levý editoriální sloupec ───────────────────────────────── */}
        <aside className="rz-aside">
          <span className="rz-kicker">{q.voice.kicker}</span>
          <h2 className="rz-title">
            {editable ? <GenericEditableText sectionId={sectionId} field="title" value={q.title} tag="span" /> : q.title}
          </h2>
          {q.subtitle && (
            <p className="rz-sub">
              {editable ? <GenericEditableText sectionId={sectionId} field="subtitle" value={q.subtitle} tag="span" /> : q.subtitle}
            </p>
          )}

          {!q.done && q.flow.length > 1 && (
            <ol className="rz-steps">
              {q.flow.map((s, i) => (
                <li key={s} className={i === q.stepIndex ? "is-active" : i < q.stepIndex ? "is-done" : ""}>
                  <span className="rz-steps__n">{i < q.stepIndex ? "✓" : pad(i + 1)}</span>
                  <span className="rz-steps__l">{stepLabel(s)}</span>
                </li>
              ))}
            </ol>
          )}

          {!q.done && (q.offer || q.partySize || q.checkIn) && (
            <div className="rz-recap">
              {q.offer && <span className="rz-recap__svc">{q.offer.name}</span>}
              {mode === "table" && <span className="rz-recap__row">{q.partySize} {czPeople(q.partySize)}{q.prefDate ? ` · ${fmtShortDate(q.prefDate)}` : ""}{q.prefTime ? ` · ${q.prefTime}` : ""}</span>}
              {mode === "stay" && q.checkIn && q.checkOut && (
                <span className="rz-recap__row">{fmtShortDate(q.checkIn)} → {fmtShortDate(q.checkOut)} · {q.nights} {czNights(q.nights)}</span>
              )}
              {q.offer && Number(q.offer.price) > 0 && (
                <span className="rz-recap__price">{fmtPrice(Number(q.offer.price), q.offer.currency)}{mode === "stay" ? " / noc" : ""}</span>
              )}
            </div>
          )}
        </aside>

        {/* ── pravý interaktivní sloupec ─────────────────────────────── */}
        <div className="rz-panel">
          {q.loading && <div className="rz-load"><span className="rz-spin" /></div>}
          {q.loadErr && !q.loading && <p className="rz-msg rz-msg--err">{q.loadErr}</p>}
          {!q.providerSlug && !q.loading && (
            <p className="rz-msg">{isAdmin ? "Propojte rezervační účet v administraci (Moduly → Rezervace)." : ""}</p>
          )}

          {!q.loading && !q.loadErr && q.providerSlug && (
            <AnimatePresence mode="wait" initial={false}>
              {q.done ? (
                <motion.div key="ok" {...anim} className="rz-ok">
                  <span className="rz-ok__mark">✓</span>
                  <h3 className="rz-h3">{q.voice.okTitle}</h3>
                  <p className="rz-ok__lead">{q.voice.okLead}</p>
                  {q.form.clientEmail && <p className="rz-ok__lead">Kopii jsme poslali na <b>{q.form.clientEmail}</b>.</p>}
                  <button className="rz-again" onClick={q.reset}>Nová poptávka</button>
                </motion.div>
              ) : (
                <motion.div key={q.current} {...anim}>
                  {q.stepIndex > 0 && (
                    <div className="rz-bar">
                      <button className="rz-bar__back" onClick={q.back} aria-label="Zpět">‹</button>
                      <b className="rz-bar__t">{stepLabel(q.current)}</b>
                    </div>
                  )}

                  {q.current === "offer" && (
                    <div className="rz-list">
                      {q.offers.map((o, i) => (
                        <button key={o.id} className={`rz-svc ${q.offer?.id === o.id ? "is-sel" : ""}`} onClick={() => { q.setOffer(o); q.next(); }}>
                          <span className="rz-svc__n">{pad(i + 1)}</span>
                          <OfferThumb o={o} />
                          <span className="rz-svc__body">
                            <span className="rz-svc__name">{o.name}</span>
                            {o.description && <span className="rz-svc__desc">{o.description}</span>}
                          </span>
                          {Number(o.price) > 0 && (
                            <span className="rz-svc__meta">
                              <span className="rz-svc__price">{fmtPrice(Number(o.price), o.currency)}{mode === "stay" ? " / noc" : ""}</span>
                            </span>
                          )}
                        </button>
                      ))}
                      {q.offers.length === 0 && <p className="rz-msg">Zatím tu nejsou žádné položky k výběru.</p>}
                    </div>
                  )}

                  {q.current === "party" && (
                    <div className="rz-party">
                      <p className="rz-party__q">Pro kolik osob?</p>
                      <div className="rz-stepper">
                        <button onClick={() => q.setPartySize(Math.max(1, q.partySize - 1))} disabled={q.partySize <= 1} aria-label="Méně">−</button>
                        <span className="rz-stepper__n">{q.partySize}</span>
                        <button onClick={() => q.setPartySize(Math.min(20, q.partySize + 1))} disabled={q.partySize >= 20} aria-label="Více">+</button>
                      </div>
                      <div className="rz-chips">
                        {[2, 4, 6, 8].map((n) => (
                          <button key={n} className={q.partySize === n ? "is-on" : ""} onClick={() => q.setPartySize(n)}>{n}</button>
                        ))}
                        <button className={q.partySize > 8 ? "is-on" : ""} onClick={() => q.setPartySize(Math.max(9, q.partySize))}>9+</button>
                      </div>
                      <button className="rz-cta" onClick={q.next} disabled={!q.stepValid}>Pokračovat</button>
                    </div>
                  )}

                  {q.current === "prefdate" && (
                    <SingleDate
                      value={q.prefDate}
                      today={q.today}
                      onPick={(d) => q.setPrefDate(d)}
                    >
                      {mode === "table" && (
                        <>
                          <p className="rz-count" style={{ marginTop: 18 }}>Preferovaný čas <em style={{ opacity: .6 }}>(nepovinné)</em></p>
                          <div className="rz-chips rz-chips--time">
                            {TABLE_TIMES.map((t) => (
                              <button key={t} className={q.prefTime === t ? "is-on" : ""} onClick={() => q.setPrefTime(q.prefTime === t ? "" : t)}>{t}</button>
                            ))}
                          </div>
                        </>
                      )}
                      <button className="rz-cta" onClick={q.next} disabled={!q.stepValid}>Pokračovat</button>
                    </SingleDate>
                  )}

                  {q.current === "dates" && (
                    <DateRange q={q} />
                  )}

                  {q.current === "contact" && (
                    <>
                      <ContactFields q={q} />
                      {q.submitErr && <p className="rz-msg rz-msg--err">{q.submitErr}</p>}
                      <button className="rz-cta" disabled={q.submitting || !q.canSubmit} onClick={q.submit}>
                        {q.submitting ? "Odesílám…" : q.voice.cta}
                      </button>
                      <p className="rz-fine">Odesláním souhlasíte se zpracováním údajů pro vyřízení poptávky.</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── dílčí komponenty ──────────────────────────────────────────────────── */

function OfferThumb({ o }: { o: RezService }) {
  if (o.image_url) return <img className="rz-svc__img" src={o.image_url} alt="" />;
  return (
    <span className="rz-svc__ph" role="img" aria-label={o.name}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" opacity=".55" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Jednoduchý měsíční kalendář — vybírá jedno budoucí datum (bez dostupnosti). */
function SingleDate({ value, today, onPick, children }: {
  value: string | null; today: Date; onPick: (d: string) => void; children?: React.ReactNode;
}) {
  return <Calendar today={today} isSelected={(ds) => ds === value} onPick={onPick}>{children}</Calendar>;
}

function DateRange({ q }: { q: ReturnType<typeof useRezoraInquiry> }) {
  const pick = (ds: string) => {
    // První klik = příjezd; druhý platný = odjezd; jinak nový příjezd.
    if (!q.checkIn || (q.checkIn && q.checkOut) || ds <= q.checkIn) {
      q.setCheckIn(ds); q.setCheckOut(null);
    } else {
      q.setCheckOut(ds);
    }
  };
  const inRange = (ds: string) =>
    !!(q.checkIn && q.checkOut && ds > q.checkIn && ds < q.checkOut);
  return (
    <Calendar
      today={q.today}
      isSelected={(ds) => ds === q.checkIn || ds === q.checkOut}
      isInRange={inRange}
      onPick={pick}
    >
      <div className="rz-range">
        <span><em>Příjezd</em> {q.checkIn ? fmtLongDate(q.checkIn) : "—"}</span>
        <span><em>Odjezd</em> {q.checkOut ? fmtLongDate(q.checkOut) : "—"}</span>
      </div>
      <button className="rz-cta" onClick={q.next} disabled={!q.stepValid}>Pokračovat</button>
    </Calendar>
  );
}

/** Mřížka měsíce s vlastní logikou výběru; měsíc se přepíná lokálně. */
function Calendar({ today, isSelected, isInRange, onPick, children }: {
  today: Date;
  isSelected: (ds: string) => boolean;
  isInRange?: (ds: string) => boolean;
  onPick: (ds: string) => void;
  children?: React.ReactNode;
}) {
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const cells = daysInMonthGrid(view.getFullYear(), view.getMonth());
  const prevDisabled = new Date(view.getFullYear(), view.getMonth(), 0) < today;
  return (
    <div>
      <div className="rz-cal">
        <button className="rz-nav" onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))} disabled={prevDisabled} aria-label="Předchozí měsíc">‹</button>
        <strong className="rz-month">{MONTHS_NOM[view.getMonth()]} {view.getFullYear()}</strong>
        <button className="rz-nav" onClick={() => setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))} aria-label="Další měsíc">›</button>
      </div>
      <div className="rz-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="rz-days">
        {cells.map((d, i) => {
          if (!d) return <span key={`p${i}`} />;
          const ds = ymd(d);
          const avail = d >= today;
          const sel = isSelected(ds);
          const range = isInRange?.(ds);
          return (
            <button
              key={ds}
              className={`rz-day ${avail ? "is-on" : "is-off"} ${sel ? "is-pick" : ""} ${range ? "is-range" : ""}`}
              disabled={!avail}
              onClick={() => avail && onPick(ds)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}

/** Kontaktní pole poptávky — stejné `.rz-form` třídy jako slotový widget, bez platby. */
function ContactFields({ q }: { q: ReturnType<typeof useRezoraInquiry> }) {
  const f = q.form;
  return (
    <div className="rz-form">
      <label>
        <span>Jméno a příjmení <i>*</i></span>
        <input value={f.clientName} onChange={(e) => q.setForm({ ...f, clientName: e.target.value })} placeholder="Jan Novák" />
      </label>
      <label>
        <span>E-mail {q.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
        <input type="email" value={f.clientEmail} onChange={(e) => q.setForm({ ...f, clientEmail: e.target.value })} placeholder="jan@email.cz" />
        {f.clientEmail.length > 0 && !isValidEmail(f.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}
      </label>
      <label>
        <span>Telefon {q.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
        <input type="tel" value={f.clientPhone} onChange={(e) => q.setForm({ ...f, clientPhone: e.target.value })} placeholder="+420 777 123 456" />
      </label>
      <label className="rz-wide">
        <span>{q.voice.notesLabel} <em>(nepovinné)</em></span>
        <textarea rows={3} value={f.clientNotes} onChange={(e) => q.setForm({ ...f, clientNotes: e.target.value })} placeholder={q.voice.notesPlaceholder} />
      </label>
    </div>
  );
}

function czPeople(n: number) { return n === 1 ? "osoba" : n >= 2 && n <= 4 ? "osoby" : "osob"; }
function czNights(n: number) { return n === 1 ? "noc" : n >= 2 && n <= 4 ? "noci" : "nocí"; }

/* ── doplňkové CSS specifické pro poptávkové kroky ─────────────────────── */
const INQUIRY_CSS = `
.rz-svc.is-sel{border-color:var(--color-primary);background:var(--rz-soft)}
/* výběr data */
.rz-day.is-pick{background:var(--color-primary)!important;color:var(--rz-on)!important;border-color:var(--color-primary)!important}
.rz-day.is-range{background:var(--rz-soft);color:var(--color-text)}
/* počet osob */
.rz-party{display:flex;flex-direction:column;align-items:center;gap:20px;padding:16px 0}
.rz-party__q{margin:0;font-family:var(--font-heading,inherit);font-size:1.15rem;font-weight:var(--rz-hw);
  color:var(--color-text);letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-stepper{display:flex;align-items:center;gap:22px}
.rz-stepper button{width:52px;height:52px;border-radius:var(--rz-r-av);cursor:pointer;font-size:1.5rem;line-height:1;
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-family:inherit;
  transition:all .15s}
.rz-stepper button:hover:not(:disabled){background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-stepper button:disabled{opacity:.3;cursor:not-allowed}
.rz-stepper__n{min-width:52px;text-align:center;font-family:var(--font-heading,inherit);
  font-size:2.4rem;font-weight:var(--rz-hw);color:var(--color-text)}
.rz-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.rz-chips--time{justify-content:flex-start;margin-top:8px}
.rz-chips button{padding:9px 16px;border-radius:var(--rz-r-btn);cursor:pointer;font-weight:700;font-size:.86rem;
  font-family:inherit;border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);
  transition:all .13s}
.rz-chips button:hover{border-color:var(--color-primary)}
.rz-chips button.is-on{background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
/* rozsah pobytu */
.rz-range{display:flex;gap:12px;margin-top:16px}
.rz-range span{flex:1;padding:12px 14px;border-radius:var(--rz-r-sm);border:var(--rz-bw) solid var(--color-border);
  background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.9rem;display:flex;flex-direction:column;gap:3px}
.rz-range em{font-style:normal;font-weight:600;font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-muted)}
`;
