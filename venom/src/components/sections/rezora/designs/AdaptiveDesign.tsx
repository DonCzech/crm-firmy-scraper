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

export function AdaptiveDesign({ b, sectionId, preset }: DesignProps & { preset: RezPreset }) {
  const voice = VOICE[preset];
  const st = useStaffStep(b, ["Služba", voice.staffLabel, "Termín", "Čas", "Kontakt"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className={`rz rz--${preset}`} style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
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

/* ──────────────────────────────────────────────────────────────────────────
   CSS — struktura je společná, preset přepisuje jen tvarové proměnné.
   Barvy/fonty se dědí z --color-* / --font-* nastavených TenantPublicView.
   ────────────────────────────────────────────────────────────────────────── */
const CSS = `
.rz{
  --rz-r:10px; --rz-r-sm:8px; --rz-r-btn:10px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:14px;
  --rz-caps:none; --rz-track:0; --rz-hw:800;
  --rz-on:var(--color-on-primary,#fff);
  --rz-soft:color-mix(in srgb,var(--color-primary) 8%,transparent);
  --rz-panel-bg:transparent; --rz-panel-pad:0px; --rz-panel-bd:none; --rz-panel-sh:none;
  --rz-row-y:16px; --rz-row-x:18px;
  padding:80px 24px; font-family:var(--font-body,inherit);
}
.rz *{box-sizing:border-box}

/* ── presety ─────────────────────────────────────────────────────────── */
.rz--sharp{
  --rz-r:0px; --rz-r-sm:0px; --rz-r-btn:0px; --rz-r-av:0px;
  --rz-bw:2px; --rz-caps:uppercase; --rz-track:.08em; --rz-hw:900;
}
.rz--soft{
  --rz-r:24px; --rz-r-sm:16px; --rz-r-btn:999px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:12px; --rz-hw:700;
  --rz-panel-bg:var(--color-surface,#fff); --rz-panel-pad:30px;
  --rz-panel-bd:1px solid var(--color-border);
  --rz-panel-sh:0 26px 64px -30px rgba(0,0,0,.3);
}
.rz--clinical{
  --rz-r:8px; --rz-r-sm:6px; --rz-r-btn:8px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:8px; --rz-track:.01em; --rz-hw:700;
  --rz-panel-bg:var(--color-surface,#fff); --rz-panel-pad:26px;
  --rz-panel-bd:1px solid var(--color-border);
  --rz-panel-sh:0 8px 28px -20px rgba(0,0,0,.22);
}
.rz--editorial{
  --rz-r:2px; --rz-r-sm:2px; --rz-r-btn:2px; --rz-r-av:50%;
  --rz-bw:1px; --rz-gap:0px; --rz-caps:uppercase; --rz-track:.16em; --rz-hw:400;
}

/* ── mřížka ──────────────────────────────────────────────────────────── */
/* 1040px = rytmus obsahu šablon (bl-grid 1040, ostatní kontejnery 1024),
   aby widget lícoval s patičkou i zbytkem stránky. */
.rz-grid{max-width:1040px;margin:0 auto;display:grid;
  grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:48px;align-items:start}
@media(max-width:920px){.rz-grid{grid-template-columns:1fr;gap:30px}}
.rz-aside{position:sticky;top:32px}
@media(max-width:880px){.rz-aside{position:static}}
.rz-panel{min-height:300px;background:var(--rz-panel-bg);padding:var(--rz-panel-pad);
  border:var(--rz-panel-bd);border-radius:var(--rz-r);box-shadow:var(--rz-panel-sh)}

/* ── levý sloupec ────────────────────────────────────────────────────── */
.rz-kicker{display:block;font-size:.7rem;font-weight:800;letter-spacing:.26em;
  text-transform:uppercase;color:var(--color-primary)}
.rz-title{font-family:var(--font-heading,inherit);font-size:clamp(1.9rem,4.2vw,3rem);line-height:1.05;
  font-weight:var(--rz-hw);margin:14px 0 12px;color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-sub{color:var(--color-text-muted);margin:0;font-size:.92rem;line-height:1.55}
.rz--editorial .rz-title{font-style:italic;text-transform:none;letter-spacing:.01em}
.rz--editorial .rz-sub{text-transform:uppercase;letter-spacing:.13em;font-size:.7rem;line-height:1.9}

.rz-steps{list-style:none;margin:34px 0 0;padding:0;display:flex;flex-direction:column;gap:2px}
.rz-steps li{display:flex;align-items:center;gap:14px;padding:9px 0;font-weight:700;font-size:.92rem;
  opacity:.38;transition:opacity .2s;color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-steps li.is-active,.rz-steps li.is-done{opacity:1}
.rz-steps__n{flex:0 0 auto;width:32px;font-family:var(--font-heading,inherit);font-size:.95rem;
  color:var(--color-primary);letter-spacing:.05em}
.rz-steps__l{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.rz-recap{margin-top:30px;padding-top:22px;border-top:1px solid var(--color-border);
  display:flex;flex-direction:column;gap:5px}
.rz-recap__svc{font-family:var(--font-heading,inherit);font-size:1.2rem;font-weight:var(--rz-hw);
  color:var(--color-text);letter-spacing:var(--rz-track)}
.rz-recap__row{font-size:.86rem;color:var(--color-text-muted)}
.rz-recap__price{font-size:1.3rem;font-weight:800;color:var(--color-primary);margin-top:6px}

/* ── stavy ───────────────────────────────────────────────────────────── */
.rz-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 8px;margin:0}
.rz-msg--err{color:#c0392b}
.rz-load{display:flex;justify-content:center;padding:44px 0}
.rz-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);
  border-top-color:var(--color-primary);animation:rzspin .7s linear infinite;display:inline-block}
@keyframes rzspin{to{transform:rotate(360deg)}}

/* ── seznam služeb ───────────────────────────────────────────────────── */
.rz-list{display:flex;flex-direction:column;gap:var(--rz-gap)}
.rz-svc{display:flex;align-items:center;gap:14px;width:100%;text-align:left;cursor:pointer;
  background:var(--color-bg);border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  padding:var(--rz-row-y) var(--rz-row-x);color:var(--color-text);font-family:inherit;
  transition:border-color .15s,transform .15s,background .15s}
.rz-svc:hover{border-color:var(--color-primary);transform:translateY(-1px)}
.rz-svc__n{flex:0 0 auto;font-size:.78rem;font-weight:800;color:var(--color-text-muted);opacity:.55;letter-spacing:.04em}
.rz-svc__img,.rz-svc__ph{flex:0 0 auto;width:50px;height:50px;border-radius:var(--rz-r-sm)}
.rz-svc__img{object-fit:cover}
/* Placeholder bez fotky — kreslený z barev motivu, aby seděl do každé šablony. */
.rz-svc__ph{display:flex;align-items:center;justify-content:center;color:var(--color-primary);
  border:1px solid color-mix(in srgb,var(--color-primary) 22%,transparent);
  background:
    linear-gradient(135deg,color-mix(in srgb,var(--color-primary) 15%,transparent),
                           color-mix(in srgb,var(--color-primary) 4%,transparent))}
.rz-svc__ph svg{width:22px;height:22px}
.rz-svc:hover .rz-svc__ph{border-color:color-mix(in srgb,var(--color-primary) 45%,transparent)}
.rz-svc__body{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.rz-svc__name{font-weight:700;font-size:1rem;color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-svc__desc{font-size:.8rem;color:var(--color-text-muted);line-height:1.4;overflow:hidden;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rz-svc__meta{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.rz-svc__price{font-weight:800;font-size:.96rem;color:var(--color-primary);white-space:nowrap}
.rz-svc__dur{font-size:.75rem;color:var(--color-text-muted);white-space:nowrap}
.rz--editorial .rz-svc{border-left:none;border-right:none;border-top:none;border-radius:0;
  background:transparent;padding:18px 2px}
.rz--editorial .rz-svc:hover{background:var(--rz-soft);transform:none}

/* ── lišta kroku ─────────────────────────────────────────────────────── */
.rz-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.rz-bar__back{flex:0 0 auto;width:38px;height:38px;border-radius:var(--rz-r-av);cursor:pointer;
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);
  font-size:1.3rem;line-height:1;font-family:inherit;transition:background .15s,color .15s}
.rz-bar__back:hover{background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-bar__t{flex:1;min-width:0;font-family:var(--font-heading,inherit);font-size:1.05rem;font-weight:var(--rz-hw);
  color:var(--color-text);letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-bar button.rz-bar__m{flex:0 0 auto;font-size:.73rem;font-weight:600;cursor:pointer;padding:6px 11px;
  border-radius:var(--rz-r-btn);border:var(--rz-bw) solid var(--color-border);background:transparent;
  color:var(--color-text-muted);font-family:inherit;max-width:46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rz-bar button.rz-bar__m:hover{color:var(--color-primary);border-color:var(--color-primary)}

/* ── personál ────────────────────────────────────────────────────────── */
.rz-team{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:var(--rz-gap)}
.rz--editorial .rz-team{gap:10px}
.rz-person{display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;padding:18px 12px;
  background:var(--color-bg);border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  color:var(--color-text);font-family:inherit;transition:border-color .15s,transform .15s}
.rz-person:hover{border-color:var(--color-primary);transform:translateY(-2px)}
.rz-person__av{width:54px;height:54px;border-radius:var(--rz-r-av);object-fit:cover;display:flex;
  align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;
  background:var(--rz-soft);color:var(--color-primary)}
/* Monogram místo chybějící fotky — jemný prstenec, ať nepůsobí jako prázdné místo. */
.rz-person__av--i{border:1px solid color-mix(in srgb,var(--color-primary) 30%,transparent);
  background:linear-gradient(140deg,color-mix(in srgb,var(--color-primary) 18%,transparent),
                                    color-mix(in srgb,var(--color-primary) 5%,transparent))}
.rz-person__av--any{font-size:1.3rem}
.rz-person__name{font-weight:700;font-size:.9rem;text-align:center;color:var(--color-text)}
.rz-person__bio{font-size:.73rem;color:var(--color-text-muted);text-align:center;line-height:1.35;
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}

/* ── kalendář ────────────────────────────────────────────────────────── */
.rz-cal{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.rz-month{font-family:var(--font-heading,inherit);font-size:1rem;font-weight:var(--rz-hw);color:var(--color-text);
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-nav{width:36px;height:36px;border-radius:var(--rz-r-av);cursor:pointer;font-size:1.15rem;font-family:inherit;
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);transition:all .15s}
.rz-nav:hover:not(:disabled){background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-nav:disabled{opacity:.3;cursor:not-allowed}
.rz-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.rz-dow span{text-align:center;font-size:.67rem;font-weight:700;color:var(--color-text-muted);
  text-transform:uppercase;letter-spacing:.06em}
.rz-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.rz-day{aspect-ratio:1;border-radius:var(--rz-r-sm);border:var(--rz-bw) solid transparent;background:transparent;
  color:var(--color-text-muted);font-weight:700;font-size:.88rem;font-family:inherit;cursor:default}
.rz-day.is-on{background:var(--rz-soft);border-color:var(--color-border);color:var(--color-text);
  cursor:pointer;transition:all .13s}
.rz-day.is-on:hover{background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-day.is-off{opacity:.3}
.rz-empty{text-align:center;padding:26px 6px}
.rz-empty p{color:var(--color-text-muted);font-size:.9rem;margin:0 0 14px}
.rz-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rz-empty button{cursor:pointer;font-size:.81rem;font-weight:700;padding:9px 15px;border-radius:var(--rz-r-btn);
  border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-family:inherit}
.rz-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}

/* ── sloty ───────────────────────────────────────────────────────────── */
.rz-count{font-size:.81rem;color:var(--color-text-muted);margin:0 0 12px}
.rz-count b{color:var(--color-primary)}
.rz-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:7px}
.rz-slot{padding:12px 6px;border-radius:var(--rz-r-sm);cursor:pointer;font-weight:700;font-size:.88rem;
  font-family:inherit;border:var(--rz-bw) solid var(--color-border);background:var(--color-bg);
  color:var(--color-text);transition:all .13s}
.rz-slot:hover:not(.is-off){background:var(--color-primary);color:var(--rz-on);border-color:var(--color-primary)}
.rz-slot.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed}

/* ── formulář ────────────────────────────────────────────────────────── */
.rz-form{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:520px){.rz-form{grid-template-columns:1fr}}
.rz-form label{display:flex;flex-direction:column;gap:5px;font-size:.79rem;font-weight:700;color:var(--color-text)}
.rz-form label.rz-wide{grid-column:1/-1}
.rz-form label span i{color:#c0392b;font-style:normal}
.rz-form label span em{font-weight:400;font-style:normal;color:var(--color-text-muted)}
.rz-form input,.rz-form textarea{padding:11px 13px;font-size:.9rem;font-weight:400;font-family:inherit;
  border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  background:var(--color-bg);color:var(--color-text);outline:none;transition:border-color .15s,box-shadow .15s}
.rz-form input:focus,.rz-form textarea:focus{border-color:var(--color-primary);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 16%,transparent)}
.rz-form small{font-size:.71rem;font-weight:600;color:#c0392b}
.rz-pay{display:flex;gap:9px}
.rz-pay button{flex:1;padding:11px;cursor:pointer;font-weight:700;font-size:.84rem;font-family:inherit;
  border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm);
  background:var(--color-bg);color:var(--color-text)}
.rz-pay button.is-on{border-color:var(--color-primary);background:var(--rz-soft);color:var(--color-primary)}
.rz-cta{width:100%;margin-top:18px;padding:15px;cursor:pointer;border:none;border-radius:var(--rz-r-btn);
  background:var(--color-primary);color:var(--rz-on);font-family:inherit;font-weight:800;font-size:.95rem;
  letter-spacing:var(--rz-track);text-transform:var(--rz-caps);transition:filter .15s,transform .12s}
.rz-cta:hover:not(:disabled){filter:brightness(1.07)}
.rz-cta:active:not(:disabled){transform:scale(.99)}
.rz-cta:disabled{opacity:.45;cursor:not-allowed}
.rz-fine{text-align:center;font-size:.75rem;color:var(--color-text-muted);margin:11px 0 0}

/* ── potvrzení ───────────────────────────────────────────────────────── */
.rz-ok{text-align:center;padding:10px 0}
.rz-ok__mark{width:62px;height:62px;border-radius:var(--rz-r-av);background:var(--color-primary);color:var(--rz-on);
  font-size:1.9rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-weight:700}
.rz-h3{font-family:var(--font-heading,inherit);font-size:1.45rem;font-weight:var(--rz-hw);color:var(--color-text);
  margin:0 0 8px;letter-spacing:var(--rz-track);text-transform:var(--rz-caps)}
.rz-ok__lead{color:var(--color-text-muted);margin:0 0 18px;font-size:.89rem}
.rz-ticket{display:inline-flex;flex-direction:column;gap:4px;text-align:left;padding:16px 22px;
  background:var(--color-bg);border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-sm)}
.rz-ticket b{font-size:1rem;color:var(--color-text);margin-bottom:2px}
.rz-ticket span{font-size:.84rem;color:var(--color-text-muted)}
.rz-again{display:block;margin:18px auto 0;padding:10px 20px;cursor:pointer;font-size:.83rem;font-weight:700;
  font-family:inherit;border:var(--rz-bw) solid var(--color-border);border-radius:var(--rz-r-btn);
  background:transparent;color:var(--color-text-muted)}
.rz-again:hover{border-color:var(--color-primary);color:var(--color-primary)}
`;

/* Pojmenované varianty pro registr designů. */
export const SharpDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="sharp" />;
export const SoftDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="soft" />;
export const ClinicalDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="clinical" />;
export const EditorialDesign = (p: DesignProps) => <AdaptiveDesign {...p} preset="editorial" />;
