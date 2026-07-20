"use client";

/**
 * ortho-02 „Dialog" — kompaktní dialog: pevná hlavičková lišta s počítadlem
 * kroků a tenkým podtržítkem postupu, obsah v sevřeném těle pod ní.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, x: 12 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -12 }, transition: { duration: 0.16 } };

export function OrthoDialog({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Lékař", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;
  const pct = b.done ? 100 : ((st.vstep + 1) / st.steps.length) * 100;
  const back = b.step === 0 ? null
    : st.showStaffPicker ? () => b.setStep(0)
    : st.showCalendar ? st.backFromCalendar
    : b.step === 2 ? () => b.setStep(1)
    : b.step === 3 ? () => b.setStep(2) : null;

  return (
    <section id="rezervace" className="od" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="od-wrap">
        <div className="od-intro">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </div>

        <div className="od-dialog">
          <div className="od-top">
            {back && !b.done ? <button className="od-back" onClick={back} aria-label="Zpět">‹</button> : <span className="od-back od-back--ghost" aria-hidden />}
            <span className="od-title">{b.done ? "Hotovo" : st.steps[st.vstep]}</span>
            {!b.done && <span className="od-count">{st.vstep + 1} / {st.steps.length}</span>}
          </div>
          <span className="od-prog"><i style={{ width: `${pct}%` }} /></span>

          <div className="od-body">
            {b.loading && <div className="od-load"><span className="od-spin" /></div>}
            {b.loadErr && !b.loading && <p className="od-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="od-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="od-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="od-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="od-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim} className="od-staff">
                    <button onClick={() => st.pickStaff(null)}><span className="od-av od-av--any">✦</span><b>Kdokoli</b></button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="od-av" src={m.avatar_url} alt={m.name} />
                          : <span className="od-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                        <b>{m.name.split(" ")[0]}</b>
                      </button>
                    ))}
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    {st.hasStaff && (
                      <button className="od-chip" onClick={() => st.setStaffChosen(false)}>
                        {b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli"} · změnit
                      </button>
                    )}
                    <div className="od-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="od-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="od-load"><span className="od-spin" /></div> : (
                      <>
                        <div className="od-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`od-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="od" who="lékař" />}
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <p className="od-sub">{fmtLongDate(b.date)}</p>
                    {b.slotsLoading ? <div className="od-load"><span className="od-spin" /></div> : b.slots.length === 0 ? (
                      <p className="od-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="od-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <div className="od-recap">
                      <b>{b.service.name}</b>
                      <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                      <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                    </div>
                    <BookingFields b={b} ns="od" notesLabel="Poznámka pro lékaře" />
                    {b.submitErr && <p className="od-msg od-msg--err">{b.submitErr}</p>}
                    <button className="od-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="od-done">
                    <span className="od-done__c">✓</span>
                    <h3>Rezervace potvrzena</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <ul className="od-done__l">
                      <li><i>Vyšetření</i><b>{b.service.name}</b></li>
                      <li><i>Lékař</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                      <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                      <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                    </ul>
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
.od{padding:64px 20px}
.od-wrap{max-width:480px;margin:0 auto}
.od-intro{text-align:center;margin-bottom:20px}
.od-intro h2{font-size:clamp(1.55rem,3.4vw,2rem);font-weight:700;margin:0 0 7px;color:var(--color-text)}
.od-intro p{margin:0;color:var(--color-text-muted);font-size:.9rem}
.od-dialog{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.3);overflow:hidden;box-shadow:0 18px 46px -30px rgba(0,0,0,.45)}
.od-top{display:flex;align-items:center;gap:10px;padding:13px 16px}
.od-back{width:28px;height:28px;border-radius:7px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.05rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.od-back:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.od-back--ghost{border-color:transparent;pointer-events:none}
.od-title{flex:1;font-size:.94rem;font-weight:700;color:var(--color-text)}
.od-count{font-size:.74rem;font-weight:700;color:var(--color-text-muted);font-variant-numeric:tabular-nums}
.od-prog{display:block;height:2px;background:var(--color-border)}
.od-prog i{display:block;height:100%;background:var(--color-primary);transition:width .35s cubic-bezier(.4,0,.2,1)}
.od-body{padding:18px 16px 20px}
.od-load{display:flex;justify-content:center;padding:38px 0}
.od-spin{width:23px;height:23px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.od-msg{text-align:center;color:var(--color-text-muted);font-size:.88rem;padding:18px 0;margin:0}
.od-msg--err{color:#c0392b}
.od-sub{margin:0 0 12px;font-size:.9rem;font-weight:700;color:var(--color-text)}
.od-list{display:flex;flex-direction:column;gap:7px}
.od-list button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;background:var(--color-bg);border:1px solid transparent;border-radius:9px;padding:12px 14px;cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.od-list button:hover{border-color:var(--color-primary)}
.od-list b{display:block;font-size:.94rem;font-weight:600}
.od-list i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.76rem;color:var(--color-text-muted);margin-top:2px}
.od-list__m{flex:0 0 auto;text-align:right}
.od-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.od-list__m small{font-size:.72rem;color:var(--color-text-muted)}
.od-staff{display:flex;flex-wrap:wrap;gap:8px}
.od-staff button{display:flex;align-items:center;gap:8px;background:var(--color-bg);border:1px solid transparent;border-radius:99px;padding:5px 14px 5px 5px;cursor:pointer;color:var(--color-text);transition:.14s}
.od-staff button:hover{border-color:var(--color-primary)}
.od-staff b{font-size:.87rem;font-weight:600}
.od-av{width:34px;height:34px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.8rem}
.od-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.od-chip{background:var(--color-bg);border:1px solid var(--color-border);color:var(--color-text-muted);border-radius:99px;padding:6px 12px;font-size:.72rem;font-weight:700;cursor:pointer;margin-bottom:12px}
.od-chip:hover{border-color:var(--color-primary);color:var(--color-primary)}
.od-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.od-mnav b{font-weight:700;font-size:.92rem;color:var(--color-text)}
.od-mnav button{width:28px;height:28px;border-radius:7px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.od-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.od-mnav button:disabled{opacity:.25;cursor:not-allowed}
.od-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.od-dow span{text-align:center;font-size:.62rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.od-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.od-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.82rem;opacity:.3;border-radius:7px}
.od-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.od-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.od-empty{margin-top:11px;text-align:center}
.od-empty p{margin:0 0 8px;font-size:.82rem;color:var(--color-text-muted)}
.od-empty b{color:var(--color-text)}
.od-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.od-empty button{background:var(--color-bg);border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 12px;font-size:.73rem;font-weight:700;cursor:pointer}
.od-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.od-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px}
.od-slots button{padding:10px 5px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:600;font-size:.85rem;border-radius:7px;cursor:pointer;transition:.12s}
.od-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.od-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.od-recap{display:flex;flex-direction:column;gap:2px;background:var(--color-bg);border-radius:9px;padding:11px 14px;margin-bottom:14px}
.od-recap b{font-size:.93rem;font-weight:600;color:var(--color-text)}
.od-recap span{font-size:.78rem;color:var(--color-text-muted)}
.od-recap em{font-style:normal;font-weight:700;color:var(--color-primary);margin-top:2px}
.od-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:440px){.od-form{grid-template-columns:1fr}}
.od-wide{grid-column:1/-1}
.od-form label{display:flex;flex-direction:column;gap:4px}
.od-form label>span{font-size:.71rem;font-weight:700;color:var(--color-text)}
.od-form label i{font-style:normal;color:var(--color-primary)}
.od-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.od-form input,.od-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:7px;padding:9px 11px;font-size:.88rem;font-family:inherit;outline:none;transition:.14s}
.od-form input:focus,.od-form textarea:focus{border-color:var(--color-primary)}
.od-form small{color:#c0392b;font-size:.7rem;font-weight:600}
.od-pay{display:flex;gap:8px}
.od-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:7px;padding:9px;font-weight:600;font-size:.82rem;cursor:pointer;transition:.14s}
.od-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.od-cta{width:100%;margin-top:14px;padding:13px;border:none;border-radius:8px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.9rem;cursor:pointer;transition:.14s}
.od-cta:hover:not(:disabled){filter:brightness(1.06)}
.od-cta:disabled{opacity:.4;cursor:not-allowed}
.od-done{text-align:center}
.od-done__c{width:52px;height:52px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 13%,transparent);color:var(--color-primary);font-size:1.5rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:2px auto 12px}
.od-done h3{font-size:1.25rem;font-weight:700;margin:0 0 7px;color:var(--color-text)}
.od-done>p{color:var(--color-text-muted);margin:0 0 16px;font-size:.88rem}
.od-done__l{list-style:none;margin:0;padding:0;text-align:left}
.od-done__l li{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--color-border)}
.od-done__l li:first-child{border-top:none}
.od-done__l i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.od-done__l b{font-size:.85rem;font-weight:600;color:var(--color-text);text-align:right}
`;
