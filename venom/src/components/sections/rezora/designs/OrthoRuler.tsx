"use client";

/**
 * ortho-01 „Ruler" — přesnost: vlevo svislé měřítko se značkami kroků,
 * vpravo obsah. Technické, přesné, s výraznou mřížkou.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.16 } };

export function OrthoRuler({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Lékař", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="or" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="or-wrap">
        <header className="or-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="or-grid">
          {!b.done && (
            <div className="or-ruler">
              {st.steps.map((l, i) => (
                <div key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                  <span className="or-ruler__tick" aria-hidden />
                  <span className="or-ruler__n">{pad(i + 1)}</span>
                  <span className="or-ruler__l">{l}</span>
                </div>
              ))}
            </div>
          )}

          <div className="or-main">
            {b.loading && <div className="or-load"><span className="or-spin" /></div>}
            {b.loadErr && !b.loading && <p className="or-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="or-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="or-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="or-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="or-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="or-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <BackBar ns="or" onBack={() => b.setStep(0)} title="Vyberte lékaře" />
                    <div className="or-staff">
                      <button onClick={() => st.pickStaff(null)}><span className="or-av or-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="or-av" src={m.avatar_url} alt={m.name} />
                            : <span className="or-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                          <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <BackBar ns="or" onBack={st.backFromCalendar} title="Vyberte datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="or-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="or-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="or-load"><span className="or-spin" /></div> : (
                      <>
                        <div className="or-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`or-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="or" who="lékař" />}
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <BackBar ns="or" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                    {b.slotsLoading ? <div className="or-load"><span className="or-spin" /></div> : b.slots.length === 0 ? (
                      <p className="or-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="or-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <BackBar ns="or" onBack={() => b.setStep(2)} title="Vaše údaje" />
                    <dl className="or-spec">
                      <div><dt>Vyšetření</dt><dd>{b.service.name}</dd></div>
                      {b.selStaff && <div><dt>Lékař</dt><dd>{b.selStaff.name}</dd></div>}
                      <div><dt>Termín</dt><dd>{fmtLongDate(b.date)}, {b.time}–{addMinutes(b.time, b.totalDuration)}</dd></div>
                      <div><dt>Cena</dt><dd className="or-spec__p">{fmtPrice(Number(b.service.price), b.service.currency)}</dd></div>
                    </dl>
                    <BookingFields b={b} ns="or" notesLabel="Poznámka pro lékaře" />
                    {b.submitErr && <p className="or-msg or-msg--err">{b.submitErr}</p>}
                    <button className="or-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="or-done">
                    <span className="or-done__c">✓</span>
                    <h3>Rezervace potvrzena</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <dl className="or-spec">
                      <div><dt>Vyšetření</dt><dd>{b.service.name}</dd></div>
                      <div><dt>Lékař</dt><dd>{b.selStaff ? b.selStaff.name : b.provider.name}</dd></div>
                      <div><dt>Datum</dt><dd>{fmtLongDate(b.date)}</dd></div>
                      <div><dt>Čas</dt><dd>{b.time} – {addMinutes(b.time, b.totalDuration)}</dd></div>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.or{padding:64px 20px}
.or-wrap{max-width:820px;margin:0 auto}
.or-head{margin-bottom:24px}
.or-head h2{font-size:clamp(1.6rem,3.5vw,2.1rem);font-weight:700;margin:0 0 7px;color:var(--color-text);letter-spacing:-.01em}
.or-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.or-grid{display:grid;grid-template-columns:172px minmax(0,1fr);gap:26px;align-items:start}
@media(max-width:760px){.or-grid{grid-template-columns:1fr;gap:16px}}
.or-ruler{border-left:2px solid var(--color-border);padding-left:0}
@media(max-width:760px){.or-ruler{display:flex;overflow-x:auto;border-left:none;border-top:2px solid var(--color-border);padding-top:0}}
.or-ruler div{position:relative;display:flex;align-items:center;gap:9px;padding:12px 0 12px 16px;opacity:.4;transition:opacity .2s}
@media(max-width:760px){.or-ruler div{padding:12px 16px 0;flex:0 0 auto}}
.or-ruler div.is-on,.or-ruler div.is-done{opacity:1}
.or-ruler__tick{position:absolute;left:-2px;top:50%;width:12px;height:2px;background:var(--color-border);transform:translateY(-50%)}
.or-ruler div.is-on .or-ruler__tick{width:20px;height:3px;background:var(--color-primary)}
.or-ruler div.is-done .or-ruler__tick{background:var(--color-primary)}
@media(max-width:760px){.or-ruler__tick{left:16px;right:16px;top:-2px;width:auto;transform:none}}
.or-ruler__n{font-size:.68rem;font-weight:800;font-variant-numeric:tabular-nums;color:var(--color-text-muted)}
.or-ruler div.is-on .or-ruler__n{color:var(--color-primary)}
.or-ruler__l{font-size:.82rem;font-weight:600;color:var(--color-text)}
.or-main{border:2px solid var(--color-border);padding:22px}
@media(max-width:520px){.or-main{padding:16px}}
.or-load{display:flex;justify-content:center;padding:42px 0}
.or-spin{width:24px;height:24px;border:3px solid var(--color-border);border-top-color:var(--color-primary);border-radius:50%;animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.or-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.or-msg--err{color:#c0392b}
.or-list{display:flex;flex-direction:column}
.or-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:none;border:none;border-bottom:2px solid var(--color-border);padding:14px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.or-list button:last-child{border-bottom:none}
.or-list button:hover{padding-left:10px}
.or-list__b b{display:block;font-size:.97rem;font-weight:700}
.or-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);margin-top:2px}
.or-list__m{flex:0 0 auto;text-align:right}
.or-list__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary);font-variant-numeric:tabular-nums}
.or-list__m small{font-size:.74rem;color:var(--color-text-muted)}
.or-bar{display:flex;align-items:center;gap:11px;margin-bottom:16px;flex-wrap:wrap}
.or-bar button{width:32px;height:32px;border:2px solid var(--color-border);background:none;color:var(--color-text);font-size:1.1rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.or-bar button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.or-bar b{font-size:1.04rem;font-weight:700;color:var(--color-text)}
.or-bar button.or-bar__m{width:auto;height:auto;border-width:1px;padding:5px 11px;font-size:.71rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.or-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:9px}
.or-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 9px;background:none;border:2px solid var(--color-border);cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.or-staff button:hover{border-color:var(--color-primary)}
.or-staff b{font-size:.88rem;font-weight:700}
.or-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.or-av{width:46px;height:46px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.or-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none}
.or-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;max-width:380px}
.or-mnav b{font-weight:700;color:var(--color-text)}
.or-mnav button{width:29px;height:29px;border:2px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.or-mnav button:hover:not(:disabled){border-color:var(--color-primary);color:var(--color-primary)}
.or-mnav button:disabled{opacity:.25;cursor:not-allowed}
.or-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;max-width:380px}
.or-dow span{text-align:center;font-size:.63rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.or-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;max-width:380px}
.or-day{aspect-ratio:1;border:2px solid transparent;background:none;color:var(--color-text-muted);font-weight:700;font-size:.84rem;font-variant-numeric:tabular-nums;opacity:.28}
.or-day.is-av{opacity:1;color:var(--color-text);border-color:var(--color-border);cursor:pointer;transition:.12s}
.or-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.or-empty{margin-top:12px;max-width:380px;text-align:center}
.or-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.or-empty b{color:var(--color-text)}
.or-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.or-empty button{background:none;border:2px solid var(--color-border);color:var(--color-text);padding:7px 12px;font-size:.74rem;font-weight:700;cursor:pointer}
.or-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.or-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px;max-width:450px}
.or-slots button{padding:11px 5px;border:2px solid var(--color-border);background:none;color:var(--color-text);font-weight:700;font-size:.86rem;font-variant-numeric:tabular-nums;cursor:pointer;transition:.12s}
.or-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.or-slots button.is-off{opacity:.25;text-decoration:line-through;cursor:not-allowed}
.or-spec{margin:0 0 16px;padding:0}
.or-spec div{display:flex;justify-content:space-between;gap:14px;padding:8px 0;border-bottom:2px solid var(--color-border)}
.or-spec dt{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--color-text-muted)}
.or-spec dd{margin:0;font-size:.87rem;font-weight:700;color:var(--color-text);text-align:right}
.or-spec__p{color:var(--color-primary)!important;font-variant-numeric:tabular-nums}
.or-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.or-form{grid-template-columns:1fr}}
.or-wide{grid-column:1/-1}
.or-form label{display:flex;flex-direction:column;gap:4px}
.or-form label>span{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text)}
.or-form label i{font-style:normal;color:var(--color-primary)}
.or-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.or-form input,.or-form textarea{border:2px solid var(--color-border);background:none;color:var(--color-text);padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.or-form input:focus,.or-form textarea:focus{border-color:var(--color-primary)}
.or-form small{color:#c0392b;font-size:.71rem;font-weight:700}
.or-pay{display:flex;gap:8px}
.or-pay button{flex:1;border:2px solid var(--color-border);background:none;color:var(--color-text);padding:10px;font-weight:700;font-size:.84rem;cursor:pointer;transition:.14s}
.or-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.or-cta{width:100%;margin-top:16px;padding:14px;border:none;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.92rem;letter-spacing:.05em;cursor:pointer;transition:.14s}
.or-cta:hover:not(:disabled){filter:brightness(1.07)}
.or-cta:disabled{opacity:.4;cursor:not-allowed}
.or-done{text-align:center}
.or-done__c{width:54px;height:54px;border:2px solid var(--color-primary);color:var(--color-primary);font-size:1.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.or-done h3{font-size:1.35rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.or-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.or-done .or-spec{text-align:left;margin-bottom:0}
`;
