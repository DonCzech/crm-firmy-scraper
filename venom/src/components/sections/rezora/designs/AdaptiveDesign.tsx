"use client";

/**
 * Adaptivní rezervační widget — JEDNA komponenta, čtyři tvarové presety.
 *
 * Nahrazuje princip „jedna šablona = jeden bespoke design" (34 souborů, který by
 * při 90 šablonách přestal být udržitelný). Layout vychází z barber-01 „Luxe",
 * který je referenční laťkou: sticky editoriální sloupec vlevo (kicker, velký
 * titul, vertikální stepper, živý souhrn s cenou) + interaktivní tok vpravo.
 *
 * Barvy, fonty a pozadí se dědí z CSS proměnných šablony (`--color-primary`,
 * `--font-heading`, …), které per tenant nastavuje TenantPublicView. Preset řídí
 * JEN tvarový jazyk — rádiusy, sílu linek, hustotu, stín a typografický rytmus:
 *
 *   sharp     — ostré rohy, silné linky, verzálky   (barber, tattoo, auto, fitness)
 *   soft      — velké rádiusy, vzdušné, měkké stíny (wellness, masáže, nails)
 *   clinical  — mírné rádiusy, hodně bílé, mřížka   (dental, clinic, ortho, fyzio)
 *   editorial — serif kurzíva, tenké linky, prostrkání (hair, salony, premium)
 *
 * Logika je sdílená (`useRezoraBooking` + `useStaffStep`) a kontaktní pole i
 * prázdné stavy pocházejí z `common.tsx`, takže oprava chování se propíše do
 * všech presetů najednou.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, Spinner } from "../common";
import { RZ_CSS } from "./styles";
import {
  useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, fmtShortDate, addMinutes,
  DAY_HEADERS, MONTHS_NOM,
} from "../core";

export type RezPreset = "sharp" | "soft" | "clinical" | "editorial";

const anim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.22 },
};

/** Oslovení personálu + popisek kroku — laděné k tvarovému jazyku presetu. */
const VOICE: Record<RezPreset, { who: string; staffLabel: string; kicker: string }> = {
  sharp: { who: "pracovník", staffLabel: "Personál", kicker: "Rezervace online" },
  soft: { who: "terapeut", staffLabel: "Terapeut", kicker: "Rezervujte si chvíli pro sebe" },
  clinical: { who: "specialista", staffLabel: "Specialista", kicker: "Objednání k ošetření" },
  editorial: { who: "stylista", staffLabel: "Stylista", kicker: "Rezervace" },
};

/**
 * Režim `meeting` (konzultace / schůzka) přebíjí slovník presetu — logika i tok
 * jsou stejné jako u služby, mění se jen terminologie (advokáti, účetní, makléři,
 * architekti). `service` používá slovník podle presetu beze změny.
 */
const MEETING_VOICE = { who: "konzultant", staffLabel: "Konzultant", kicker: "Domluvte si schůzku" };

export function AdaptiveDesign({ b, sectionId, preset, mode }: DesignProps & { preset: RezPreset }) {
  const voice = mode === "meeting" ? MEETING_VOICE : VOICE[preset];
  const stepFirst = mode === "meeting" ? "Konzultace" : "Služba";
  const st = useStaffStep(b, [stepFirst, voice.staffLabel, "Termín", "Čas", "Kontakt"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className={`rz rz--${preset}`} style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: RZ_CSS }} />
      <div className="rz-grid">
        {/* ── levý editoriální sloupec ───────────────────────────────── */}
        <aside className="rz-aside">
          <span className="rz-kicker">{voice.kicker}</span>
          <h2 className="rz-title">
            {editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}
          </h2>
          <p className="rz-sub">
            {editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}
          </p>

          {!b.done && (
            <ol className="rz-steps">
              {st.steps.map((label, i) => (
                <li key={label} className={i === st.vstep ? "is-active" : i < st.vstep ? "is-done" : ""}>
                  <span className="rz-steps__n">{i < st.vstep ? "✓" : pad(i + 1)}</span>
                  <span className="rz-steps__l">{label}</span>
                </li>
              ))}
            </ol>
          )}

          {b.service && !b.done && (
            <div className="rz-recap">
              <span className="rz-recap__svc">{b.service.name}</span>
              {b.selStaff && <span className="rz-recap__row">u {b.selStaff.name}</span>}
              {b.date && (
                <span className="rz-recap__row">
                  {fmtShortDate(b.date)}{b.time ? ` · ${b.time}` : ""}
                </span>
              )}
              <span className="rz-recap__price">{fmtPrice(Number(b.service.price), b.service.currency)}</span>
            </div>
          )}
        </aside>

        {/* ── pravý interaktivní sloupec ─────────────────────────────── */}
        <div className="rz-panel">
          {b.loading && <Spinner ns="rz" />}
          {b.loadErr && !b.loading && <p className="rz-msg rz-msg--err">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && (
            <p className="rz-msg">{b.isAdmin ? "Propojte rezervační účet v administraci (Moduly → Rezervace)." : ""}</p>
          )}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {/* 0 · Služba */}
              {b.step === 0 && (
                <motion.div key="s0" {...anim}>
                  <div className="rz-list">
                    {b.services.map((s, i) => (
                      <button key={s.id} className="rz-svc" onClick={() => b.pickService(s)}>
                        <span className="rz-svc__n">{pad(i + 1)}</span>
                        <ServiceThumb src={s.image_url} alt={s.name} />
                        <span className="rz-svc__body">
                          <span className="rz-svc__name">{s.name}</span>
                          {s.description && <span className="rz-svc__desc">{s.description}</span>}
                        </span>
                        <span className="rz-svc__meta">
                          <span className="rz-svc__price">{fmtPrice(Number(s.price), s.currency)}</span>
                          <span className="rz-svc__dur">{fmtDuration(s.duration_minutes)}</span>
                        </span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="rz-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </div>
                </motion.div>
              )}

              {/* 1a · Personál */}
              {st.showStaffPicker && (
                <motion.div key="s1a" {...anim}>
                  <Bar onBack={() => b.setStep(0)} title={`Vyberte, kdo se o vás postará`} meta={b.service?.name} onMeta={() => b.setStep(0)} />
                  <div className="rz-team">
                    <button className="rz-person" onClick={() => st.pickStaff(null)}>
                      <span className="rz-person__av rz-person__av--any">✳</span>
                      <span className="rz-person__name">Kdokoli</span>
                      <span className="rz-person__bio">Nejbližší volný termín</span>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} className="rz-person" onClick={() => st.pickStaff(m)}>
                        <StaffAvatar src={m.avatar_url} name={m.name} />
                        <span className="rz-person__name">{m.name}</span>
                        {m.bio && <span className="rz-person__bio">{m.bio}</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 1b · Termín */}
              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <Bar
                    onBack={st.backFromCalendar}
                    title="Vyberte datum"
                    meta={b.selStaff ? b.selStaff.name.split(" ")[0] : b.service.name}
                    onMeta={st.hasStaff ? () => st.setStaffChosen(false) : () => b.setStep(0)}
                  />
                  <div className="rz-cal">
                    <button
                      className="rz-nav"
                      onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}
                      aria-label="Předchozí měsíc"
                    >‹</button>
                    <strong className="rz-month">{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</strong>
                    <button
                      className="rz-nav"
                      onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      aria-label="Další měsíc"
                    >›</button>
                  </div>
                  <div className="rz-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <Spinner ns="rz" /> : b.dates.size === 0 ? (
                    <EmptyMonth b={b} st={st} ns="rz" who={voice.who} />
                  ) : (
                    <div className="rz-days">
                      {b.cells.map((d, i) => {
                        if (!d) return <span key={`p${i}`} />;
                        const ds = ymd(d);
                        const avail = b.dates.has(ds) && d >= b.today;
                        return (
                          <button key={ds} className={`rz-day ${avail ? "is-on" : "is-off"}`} disabled={!avail} onClick={() => avail && b.pickDate(ds)}>
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* 2 · Čas */}
              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <Bar onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} meta={b.service.name} onMeta={() => b.setStep(0)} />
                  {b.slotsLoading ? <Spinner ns="rz" /> : b.slots.length === 0 ? (
                    <p className="rz-msg">Pro tento den nejsou volné termíny. Zkuste jiné datum.</p>
                  ) : (
                    <>
                      <p className="rz-count"><b>{b.slots.filter((s) => s.available).length}</b> volných termínů</p>
                      <div className="rz-slots">
                        {b.slots.map((s) => (
                          <button key={s.time} className={`rz-slot ${!s.available ? "is-off" : ""}`} disabled={!s.available} onClick={() => b.pickTime(s.time)}>
                            {s.time}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* 3 · Kontakt */}
              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <Bar onBack={() => b.setStep(2)} title="Vaše údaje" meta={b.time} onMeta={() => b.setStep(2)} />
                  <BookingFields b={b} ns="rz" />
                  {b.submitErr && <p className="rz-msg rz-msg--err">{b.submitErr}</p>}
                  <button className="rz-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                  <p className="rz-fine">Po potvrzení obdržíte e-mail s detaily rezervace.</p>
                </motion.div>
              )}

              {/* 4 · Hotovo */}
              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="rz-ok">
                  <span className="rz-ok__mark">✓</span>
                  <h3 className="rz-h3">Rezervace potvrzena</h3>
                  {b.form.clientEmail && <p className="rz-ok__lead">Potvrzení jsme poslali na <b>{b.form.clientEmail}</b>.</p>}
                  <div className="rz-ticket">
                    <b>{b.service.name}</b>
                    {b.selStaff && <span>s {b.selStaff.name}</span>}
                    <span>{fmtLongDate(b.date)}</span>
                    <span>{b.time} – {addMinutes(b.time, b.totalDuration)}</span>
                    <span>{b.provider.name}</span>
                  </div>
                  <button className="rz-again" onClick={b.reset}>Nová rezervace</button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Náhled služby. Když poskytovatel fotku nenahraje (běžný stav), vykreslí se
 * kreslený placeholder v barvách šablony — díky tomu mají všechny řádky stejnou
 * výšku a seznam nevypadá rozházeně. Pro službu se ZÁMĚRNĚ nepoužívá monogram
 * z názvu: názvy typu „60min Konzultace" by daly nesmyslné „6".
 */
function ServiceThumb({ src, alt }: { src?: string; alt: string }) {
  if (src) return <img className="rz-svc__img" src={src} alt="" />;
  return (
    <span className="rz-svc__ph" role="img" aria-label={alt}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" opacity=".55" />
        <path d="M12 7.4V12l3 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Avatar pracovníka. Bez fotky se použije monogram z křestního jména — u lidí
 * dává smysl (na rozdíl od služeb) a drží kulatý tvar i barvu motivu.
 */
function StaffAvatar({ src, name }: { src?: string; name: string }) {
  if (src) return <img className="rz-person__av" src={src} alt="" />;
  const initial = name.trim().charAt(0).toUpperCase() || "•";
  return <span className="rz-person__av rz-person__av--i" aria-hidden="true">{initial}</span>;
}

/** Lišta kroku — vlastní (ne common/BackBar), aby šla stylovat per preset. */
function Bar({ onBack, title, meta, onMeta }: { onBack: () => void; title: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="rz-bar">
      <button className="rz-bar__back" onClick={onBack} aria-label="Zpět">‹</button>
      <b className="rz-bar__t">{title}</b>
      {meta && <button className="rz-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}


/* Pojmenované varianty pro registr designů. */
export const SharpDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="sharp" />;
export const SoftDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="soft" />;
export const ClinicalDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="clinical" />;
export const EditorialDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="editorial" />;
