"use client";

/**
 * fitness-02 „Grid" — světlá tabulková mřížka: služby jako rozvrh s tabulárními
 * čísly, kroky jako číslované záložky, hodně bílé a tvrdé linky.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } };

export function FitnessGrid({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Trénink", "Trenér", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="fg" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fg-wrap">
        <header className="fg-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <div className="fg-tabs">
            {st.steps.map((l, i) => (
              <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                <i>{pad(i + 1)}</i>{l}
              </span>
            ))}
          </div>
        )}

        <div className="fg-panel">
          {b.loading && <div className="fg-load"><span className="fg-spin" /></div>}
          {b.loadErr && !b.loading && <p className="fg-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="fg-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim} className="fg-table">
                  <div className="fg-table__h"><span>Trénink</span><span>Délka</span><span>Cena</span></div>
                  {b.services.map((svc) => (
                    <button key={svc.id} onClick={() => b.pickService(svc)}>
                      <span className="fg-table__n"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                      <span className="fg-table__d">{fmtDuration(svc.duration_minutes)}</span>
                      <span className="fg-table__p">{fmtPrice(Number(svc.price), svc.currency)}</span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="fg-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <BackBar ns="fg" onBack={() => b.setStep(0)} title="Vyberte trenéra" />
                  <div className="fg-staff">
                    <button onClick={() => st.pickStaff(null)}><span className="fg-av fg-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="fg-av" src={m.avatar_url} alt={m.name} />
                          : <span className="fg-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                        <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <BackBar ns="fg" onBack={st.backFromCalendar} title="Vyberte datum"
                    meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={() => st.setStaffChosen(false)} />
                  <div className="fg-cal-box">
                    <div className="fg-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="fg-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="fg-load"><span className="fg-spin" /></div> : (
                      <>
                        <div className="fg-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`fg-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="fg" who="trenér" />}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <BackBar ns="fg" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="fg-load"><span className="fg-spin" /></div> : b.slots.length === 0 ? (
                    <p className="fg-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="fg-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <BackBar ns="fg" onBack={() => b.setStep(2)} title="Vaše údaje" />
                  <dl className="fg-spec">
                    <div><dt>Trénink</dt><dd>{b.service.name}</dd></div>
                    {b.selStaff && <div><dt>Trenér</dt><dd>{b.selStaff.name}</dd></div>}
                    <div><dt>Termín</dt><dd>{fmtLongDate(b.date)}, {b.time}–{addMinutes(b.time, b.totalDuration)}</dd></div>
                    <div><dt>Cena</dt><dd className="fg-spec__p">{fmtPrice(Number(b.service.price), b.service.currency)}</dd></div>
                  </dl>
                  <BookingFields b={b} ns="fg" />
                  {b.submitErr && <p className="fg-msg fg-msg--err">{b.submitErr}</p>}
                  <button className="fg-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="fg-done">
                  <span className="fg-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <dl className="fg-spec">
                    <div><dt>Trénink</dt><dd>{b.service.name}</dd></div>
                    <div><dt>Trenér</dt><dd>{b.selStaff ? b.selStaff.name : b.provider.name}</dd></div>
                    <div><dt>Datum</dt><dd>{fmtLongDate(b.date)}</dd></div>
                    <div><dt>Čas</dt><dd>{b.time} – {addMinutes(b.time, b.totalDuration)}</dd></div>
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

const CSS = `
.fg{padding:64px 20px}
.fg-wrap{max-width:760px;margin:0 auto}
.fg-head{margin-bottom:20px}
.fg-head h2{font-size:clamp(1.7rem,4vw,2.3rem);font-weight:800;margin:0 0 7px;color:var(--color-text);letter-spacing:-.02em}
.fg-head p{margin:0;color:var(--color-text-muted);font-size:.93rem}
.fg-tabs{display:flex;flex-wrap:wrap;border:2px solid var(--color-text);border-bottom:none}
.fg-tabs span{flex:1;min-width:96px;display:flex;align-items:center;gap:7px;padding:11px 12px;font-size:.75rem;font-weight:800;color:var(--color-text-muted);border-right:2px solid var(--color-text);background:var(--color-bg)}
.fg-tabs span:last-child{border-right:none}
.fg-tabs span i{font-style:normal;font-variant-numeric:tabular-nums;opacity:.5}
.fg-tabs span.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fg-tabs span.is-on i{opacity:1}
.fg-tabs span.is-done{color:var(--color-text)}
.fg-panel{border:2px solid var(--color-text);padding:20px}
.fg-load{display:flex;justify-content:center;padding:42px 0}
.fg-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.fg-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.fg-msg--err{color:#c0392b}
.fg-table{display:flex;flex-direction:column}
.fg-table__h{display:grid;grid-template-columns:1fr 90px 110px;gap:12px;padding:0 2px 8px;border-bottom:2px solid var(--color-text)}
.fg-table__h span{font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-muted)}
.fg-table__h span:not(:first-child){text-align:right}
.fg-table button{display:grid;grid-template-columns:1fr 90px 110px;gap:12px;align-items:center;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:13px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.fg-table button:hover{background:color-mix(in srgb,var(--color-primary) 9%,transparent);padding-left:10px}
.fg-table__n b{display:block;font-size:.98rem;font-weight:800}
.fg-table__n i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.77rem;color:var(--color-text-muted);margin-top:2px}
.fg-table__d{text-align:right;font-variant-numeric:tabular-nums;font-size:.84rem;color:var(--color-text-muted)}
.fg-table__p{text-align:right;font-variant-numeric:tabular-nums;font-weight:900;color:var(--color-primary)}
.fg-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.fg-bar button{width:34px;height:34px;border:2px solid var(--color-text);background:none;color:var(--color-text);font-size:1.15rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.fg-bar button:hover{background:var(--color-text);color:var(--color-bg)}
.fg-bar b{font-size:1.1rem;font-weight:800;color:var(--color-text)}
.fg-bar button.fg-bar__m{width:auto;height:auto;border-width:1px;border-color:var(--color-border);padding:6px 11px;font-size:.71rem;font-weight:800;margin-left:auto;color:var(--color-text-muted)}
.fg-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(124px,1fr));gap:0;border-top:1px solid var(--color-border);border-left:1px solid var(--color-border)}
.fg-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 9px;background:none;border:none;border-right:1px solid var(--color-border);border-bottom:1px solid var(--color-border);cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.fg-staff button:hover{background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.fg-staff b{font-size:.89rem;font-weight:800}
.fg-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.fg-av{width:50px;height:50px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.fg-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none}
.fg-cal-box{max-width:400px}
.fg-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.fg-mnav b{font-weight:800;color:var(--color-text)}
.fg-mnav button{width:30px;height:30px;border:2px solid var(--color-text);background:none;color:var(--color-text);cursor:pointer}
.fg-mnav button:hover:not(:disabled){background:var(--color-text);color:var(--color-bg)}
.fg-mnav button:disabled{opacity:.25;cursor:not-allowed}
.fg-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.fg-dow span{text-align:center;font-size:.63rem;font-weight:900;color:var(--color-text-muted);text-transform:uppercase}
.fg-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:0;border-top:1px solid var(--color-border);border-left:1px solid var(--color-border)}
.fg-cal>span,.fg-day{aspect-ratio:1;border-right:1px solid var(--color-border);border-bottom:1px solid var(--color-border)}
.fg-day{border-top:none;border-left:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.84rem;font-variant-numeric:tabular-nums;opacity:.3}
.fg-day.is-av{opacity:1;color:var(--color-text);cursor:pointer;transition:.12s}
.fg-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fg-empty{margin-top:13px;text-align:center}
.fg-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.fg-empty b{color:var(--color-text)}
.fg-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.fg-empty button{background:none;border:2px solid var(--color-text);color:var(--color-text);padding:7px 13px;font-size:.74rem;font-weight:800;cursor:pointer}
.fg-empty button:hover{background:var(--color-text);color:var(--color-bg)}
.fg-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:0;border-top:1px solid var(--color-border);border-left:1px solid var(--color-border)}
.fg-slots button{padding:13px 6px;border:none;border-right:1px solid var(--color-border);border-bottom:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:800;font-size:.87rem;font-variant-numeric:tabular-nums;cursor:pointer;transition:.12s}
.fg-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fg-slots button.is-off{opacity:.25;text-decoration:line-through;cursor:not-allowed}
.fg-spec{margin:0 0 18px;padding:0}
.fg-spec div{display:flex;justify-content:space-between;gap:14px;padding:8px 0;border-bottom:1px solid var(--color-border)}
.fg-spec dt{font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.09em;color:var(--color-text-muted)}
.fg-spec dd{margin:0;font-size:.88rem;font-weight:700;color:var(--color-text);text-align:right}
.fg-spec__p{color:var(--color-primary)!important;font-weight:900;font-variant-numeric:tabular-nums}
.fg-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.fg-form{grid-template-columns:1fr}}
.fg-wide{grid-column:1/-1}
.fg-form label{display:flex;flex-direction:column;gap:5px}
.fg-form label>span{font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.09em;color:var(--color-text)}
.fg-form label i{font-style:normal;color:var(--color-primary)}
.fg-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.fg-form input,.fg-form textarea{border:2px solid var(--color-border);background:none;color:var(--color-text);padding:10px 12px;font-size:.92rem;font-family:inherit;outline:none;transition:.14s}
.fg-form input:focus,.fg-form textarea:focus{border-color:var(--color-primary)}
.fg-form small{color:#c0392b;font-size:.71rem;font-weight:700}
.fg-pay{display:flex;gap:9px}
.fg-pay button{flex:1;border:2px solid var(--color-border);background:none;color:var(--color-text);padding:11px;font-weight:800;font-size:.84rem;text-transform:uppercase;cursor:pointer;transition:.14s}
.fg-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 12%,transparent)}
.fg-cta{width:100%;margin-top:18px;padding:15px;border:none;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:900;font-size:.94rem;text-transform:uppercase;letter-spacing:.07em;cursor:pointer;transition:.14s}
.fg-cta:hover:not(:disabled){filter:brightness(1.08)}
.fg-cta:disabled{opacity:.4;cursor:not-allowed}
.fg-done{text-align:center}
.fg-done__c{width:56px;height:56px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.fg-done h3{font-size:1.4rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.fg-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.fg-done .fg-spec{text-align:left;margin-bottom:0}
`;
