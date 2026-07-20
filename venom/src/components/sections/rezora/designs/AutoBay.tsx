"use client";

/**
 * autoservis-02 „Bay" — dílenská stání: tmavé karty s diagonálním výstražným
 * pruhem, tučné verzálky, kroky jako číslovaná stání.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.17 } };

export function AutoBay({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Úkon", "Technik", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="ab" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ab-wrap">
        <header className="ab-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          {!b.done && (
            <div className="ab-bays">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                  <i>{pad(i + 1)}</i>{l}
                </span>
              ))}
            </div>
          )}
        </header>

        {b.loading && <div className="ab-load"><span className="ab-spin" /></div>}
        {b.loadErr && !b.loading && <p className="ab-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="ab-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="ab-grid">
                {b.services.map((svc) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <span className="ab-stripe" aria-hidden />
                    <b>{svc.name}</b>
                    {svc.description && <i>{svc.description}</i>}
                    <span className="ab-f"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="ab-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim} className="ab-panel">
                <BackBar ns="ab" onBack={() => b.setStep(0)} title="Vyberte technika" />
                <div className="ab-staff">
                  <button onClick={() => st.pickStaff(null)}><span className="ab-av ab-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="ab-av" src={m.avatar_url} alt={m.name} />
                        : <span className="ab-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim} className="ab-panel">
                <BackBar ns="ab" onBack={st.backFromCalendar} title="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="ab-cal-box">
                  <div className="ab-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="ab-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="ab-load"><span className="ab-spin" /></div> : (
                    <>
                      <div className="ab-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`ab-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="ab" who="technik" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim} className="ab-panel">
                <BackBar ns="ab" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="ab-load"><span className="ab-spin" /></div> : b.slots.length === 0 ? (
                  <p className="ab-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="ab-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim} className="ab-panel">
                <BackBar ns="ab" onBack={() => b.setStep(2)} title="Kontaktní údaje" />
                <div className="ab-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="ab" notesLabel="Vozidlo a popis závady" notesPlaceholder="Značka, model, rok, SPZ, popis problému…" />
                {b.submitErr && <p className="ab-msg ab-msg--err">{b.submitErr}</p>}
                <button className="ab-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Odesílám…" : "Závazně objednat"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="ab-panel ab-done">
                <span className="ab-done__c">✓</span>
                <h3>Objednávka přijata</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="ab-done__l">
                  <li><i>Úkon</i><b>{b.service.name}</b></li>
                  <li><i>Technik</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                  <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                  <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

const CSS = `
.ab{padding:64px 20px}
.ab-wrap{max-width:800px;margin:0 auto}
.ab-head{margin-bottom:24px}
.ab-head h2{font-size:clamp(1.8rem,4.4vw,2.6rem);font-weight:900;text-transform:uppercase;letter-spacing:-.025em;margin:0 0 8px;color:var(--color-text);line-height:1}
.ab-head p{margin:0 0 18px;color:var(--color-text-muted);font-size:.93rem}
.ab-bays{display:flex;flex-wrap:wrap;gap:7px}
.ab-bays span{display:inline-flex;align-items:center;gap:7px;font-size:.71rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text-muted);border:2px solid var(--color-border);padding:6px 12px;opacity:.6}
.ab-bays span i{font-style:normal;font-variant-numeric:tabular-nums;opacity:.7}
.ab-bays span.is-on{opacity:1;border-color:var(--color-primary);color:var(--color-primary)}
.ab-bays span.is-done{opacity:1;color:var(--color-text)}
.ab-load{display:flex;justify-content:center;padding:44px 0}
.ab-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.ab-msg{color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.ab-msg--err{color:#ff7a5a}
.ab-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.ab-grid button{position:relative;display:flex;flex-direction:column;gap:5px;background:var(--color-surface,#fff);border:2px solid var(--color-border);padding:20px 18px;cursor:pointer;color:var(--color-text);text-align:left;overflow:hidden;transition:.15s}
.ab-grid button:hover{border-color:var(--color-primary);transform:translateY(-2px)}
.ab-stripe{position:absolute;top:0;left:0;right:0;height:5px;background:repeating-linear-gradient(45deg,var(--color-primary) 0 8px,transparent 8px 16px)}
.ab-grid b{font-size:1.04rem;font-weight:900;text-transform:uppercase;line-height:1.15;margin-top:6px}
.ab-grid i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);line-height:1.4}
.ab-f{display:flex;align-items:baseline;justify-content:space-between;margin-top:auto;padding-top:10px;border-top:1px solid var(--color-border)}
.ab-f em{font-style:normal;font-weight:900;color:var(--color-primary);font-variant-numeric:tabular-nums}
.ab-f small{font-size:.74rem;color:var(--color-text-muted)}
.ab-panel{background:var(--color-surface,#fff);border:2px solid var(--color-border);padding:22px}
@media(max-width:520px){.ab-panel{padding:16px}}
.ab-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.ab-bar button{width:36px;height:36px;border:2px solid var(--color-border);background:none;color:var(--color-text);font-size:1.15rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.ab-bar button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.ab-bar b{font-size:1.12rem;font-weight:900;text-transform:uppercase;color:var(--color-text)}
.ab-bar button.ab-bar__m{width:auto;height:auto;border-width:1px;padding:6px 12px;font-size:.7rem;font-weight:900;margin-left:auto;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.ab-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(124px,1fr));gap:10px}
.ab-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:15px 9px;background:none;border:2px solid var(--color-border);cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.ab-staff button:hover{border-color:var(--color-primary)}
.ab-staff b{font-size:.88rem;font-weight:900;text-transform:uppercase}
.ab-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.ab-av{width:48px;height:48px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900}
.ab-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none}
.ab-cal-box{max-width:400px}
.ab-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.ab-mnav b{font-weight:900;text-transform:uppercase;color:var(--color-text)}
.ab-mnav button{width:30px;height:30px;border:2px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.ab-mnav button:hover:not(:disabled){border-color:var(--color-primary);color:var(--color-primary)}
.ab-mnav button:disabled{opacity:.25;cursor:not-allowed}
.ab-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.ab-dow span{text-align:center;font-size:.63rem;font-weight:900;color:var(--color-text-muted);text-transform:uppercase}
.ab-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.ab-day{aspect-ratio:1;border:2px solid transparent;background:none;color:var(--color-text-muted);font-weight:800;font-size:.85rem;font-variant-numeric:tabular-nums;opacity:.26}
.ab-day.is-av{opacity:1;color:var(--color-text);border-color:var(--color-border);cursor:pointer;transition:.12s}
.ab-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ab-empty{margin-top:12px;text-align:center}
.ab-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.ab-empty b{color:var(--color-text)}
.ab-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.ab-empty button{background:none;border:2px solid var(--color-border);color:var(--color-text);padding:7px 13px;font-size:.73rem;font-weight:900;cursor:pointer;text-transform:uppercase}
.ab-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.ab-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px}
.ab-slots button{padding:12px 5px;border:2px solid var(--color-border);background:none;color:var(--color-text);font-weight:900;font-size:.87rem;font-variant-numeric:tabular-nums;cursor:pointer;transition:.12s}
.ab-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ab-slots button.is-off{opacity:.24;text-decoration:line-through;cursor:not-allowed}
.ab-recap{display:flex;flex-direction:column;gap:3px;border-left:5px solid var(--color-primary);padding:4px 0 4px 14px;margin-bottom:18px}
.ab-recap b{font-size:1.02rem;font-weight:900;text-transform:uppercase;color:var(--color-text)}
.ab-recap span{font-size:.81rem;color:var(--color-text-muted)}
.ab-recap em{font-style:normal;font-weight:900;color:var(--color-primary);margin-top:3px;font-variant-numeric:tabular-nums}
.ab-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.ab-form{grid-template-columns:1fr}}
.ab-wide{grid-column:1/-1}
.ab-form label{display:flex;flex-direction:column;gap:4px}
.ab-form label>span{font-size:.67rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text)}
.ab-form label i{font-style:normal;color:var(--color-primary)}
.ab-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.ab-form input,.ab-form textarea{border:2px solid var(--color-border);background:none;color:var(--color-text);padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.ab-form input:focus,.ab-form textarea:focus{border-color:var(--color-primary)}
.ab-form small{color:#ff7a5a;font-size:.7rem;font-weight:700}
.ab-pay{display:flex;gap:8px}
.ab-pay button{flex:1;border:2px solid var(--color-border);background:none;color:var(--color-text);padding:11px;font-weight:900;font-size:.83rem;text-transform:uppercase;cursor:pointer;transition:.14s}
.ab-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 14%,transparent)}
.ab-cta{width:100%;margin-top:18px;padding:15px;border:none;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:900;font-size:.94rem;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;transition:.14s}
.ab-cta:hover:not(:disabled){filter:brightness(1.1)}
.ab-cta:disabled{opacity:.4;cursor:not-allowed}
.ab-done{text-align:center}
.ab-done__c{width:56px;height:56px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.ab-done h3{font-size:1.4rem;font-weight:900;text-transform:uppercase;margin:0 0 8px;color:var(--color-text)}
.ab-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.ab-done__l{list-style:none;margin:0;padding:0;text-align:left}
.ab-done__l li{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-top:2px solid var(--color-border)}
.ab-done__l li:first-child{border-top:none}
.ab-done__l i{font-style:normal;font-size:.67rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-muted)}
.ab-done__l b{font-size:.88rem;font-weight:800;color:var(--color-text);text-align:right}
`;
