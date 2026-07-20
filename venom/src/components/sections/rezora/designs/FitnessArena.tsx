"use client";

/**
 * fitness-01 „Arena" — sportovní energie: tmavá plocha, obří verzálky, kroky
 * jako dráha s běžcem, služby jako řádky se silovým pruhem.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.18 } };

export function FitnessArena({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Trénink", "Trenér", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;
  const pct = b.done ? 100 : ((st.vstep + 1) / st.steps.length) * 100;

  return (
    <section id="rezervace" className="fa" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fa-wrap">
        <header className="fa-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <div className="fa-track">
            <span className="fa-track__fill" style={{ width: `${pct}%` }} />
            <span className="fa-track__dot" style={{ left: `calc(${pct}% - 9px)` }} />
            <div className="fa-track__labels">
              {st.steps.map((l, i) => <span key={l} className={i <= st.vstep ? "is-on" : ""}>{l}</span>)}
            </div>
          </div>
        )}

        {b.loading && <div className="fa-load"><span className="fa-spin" /></div>}
        {b.loadErr && !b.loading && <p className="fa-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="fa-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="fa-rows">
                {b.services.map((svc, i) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <span className="fa-rows__n">{pad(i + 1)}</span>
                    <span className="fa-rows__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                    <span className="fa-rows__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                    <span className="fa-rows__bar" aria-hidden />
                  </button>
                ))}
                {b.services.length === 0 && <p className="fa-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim}>
                <BackBar ns="fa" onBack={() => b.setStep(0)} title="Vyber trenéra" />
                <div className="fa-staff">
                  <button onClick={() => st.pickStaff(null)}><span className="fa-av fa-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="fa-av" src={m.avatar_url} alt={m.name} />
                        : <span className="fa-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim}>
                <BackBar ns="fa" onBack={st.backFromCalendar} title="Vyber datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="fa-cal-box">
                  <div className="fa-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="fa-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="fa-load"><span className="fa-spin" /></div> : (
                    <>
                      <div className="fa-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`fa-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="fa" who="trenér" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim}>
                <BackBar ns="fa" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="fa-load"><span className="fa-spin" /></div> : b.slots.length === 0 ? (
                  <p className="fa-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="fa-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim}>
                <BackBar ns="fa" onBack={() => b.setStep(2)} title="Tvoje údaje" />
                <div className="fa-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="fa" />
                {b.submitErr && <p className="fa-msg fa-msg--err">{b.submitErr}</p>}
                <button className="fa-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="fa-done">
                <span className="fa-done__c">✓</span>
                <h3>Jsi zapsaný</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="fa-done__l">
                  <li><i>Trénink</i><b>{b.service.name}</b></li>
                  <li><i>Trenér</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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
.fa{padding:64px 20px}
.fa-wrap{max-width:780px;margin:0 auto}
.fa-head{margin-bottom:24px}
.fa-head h2{font-size:clamp(2rem,5.4vw,3.2rem);font-weight:900;text-transform:uppercase;letter-spacing:-.03em;line-height:.96;margin:0 0 8px;color:var(--color-text)}
.fa-head p{margin:0;color:var(--color-text-muted);font-size:.95rem}
.fa-track{position:relative;height:6px;background:var(--color-border);border-radius:99px;margin:0 0 40px}
.fa-track__fill{position:absolute;left:0;top:0;bottom:0;background:var(--color-primary);border-radius:99px;transition:width .4s cubic-bezier(.4,0,.2,1)}
.fa-track__dot{position:absolute;top:-6px;width:18px;height:18px;border-radius:50%;background:var(--color-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--color-primary) 25%,transparent);transition:left .4s cubic-bezier(.4,0,.2,1)}
.fa-track__labels{position:absolute;top:14px;left:0;right:0;display:flex;justify-content:space-between}
.fa-track__labels span{font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text-muted);opacity:.45}
.fa-track__labels span.is-on{opacity:1;color:var(--color-primary)}
.fa-load{display:flex;justify-content:center;padding:44px 0}
.fa-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.fa-msg{color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.fa-msg--err{color:#ff6b5a}
.fa-rows{display:flex;flex-direction:column;gap:8px}
.fa-rows button{position:relative;display:flex;align-items:center;gap:16px;width:100%;background:var(--color-surface,#151515);border:none;border-radius:var(--radius,10px);padding:18px 20px;cursor:pointer;color:var(--color-text);text-align:left;overflow:hidden;transition:.15s}
.fa-rows button:hover{transform:translateX(4px)}
.fa-rows__bar{position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--color-primary);transition:width .2s}
.fa-rows button:hover .fa-rows__bar{width:100%;opacity:.13}
.fa-rows__n{font-size:1.15rem;font-weight:900;color:var(--color-primary);flex:0 0 auto}
.fa-rows__b{flex:1;min-width:0}
.fa-rows__b b{display:block;font-size:1.1rem;font-weight:900;text-transform:uppercase;letter-spacing:-.01em}
.fa-rows__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.79rem;color:var(--color-text-muted);margin-top:2px}
.fa-rows__m{flex:0 0 auto;text-align:right}
.fa-rows__m em{font-style:normal;display:block;font-weight:900;font-size:1.02rem;color:var(--color-text)}
.fa-rows__m small{font-size:.74rem;color:var(--color-text-muted)}
.fa-bar{display:flex;align-items:center;gap:13px;margin-bottom:18px;flex-wrap:wrap}
.fa-bar button{width:38px;height:38px;border-radius:var(--radius,10px);border:none;background:var(--color-surface,#151515);color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.fa-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fa-bar b{font-size:1.3rem;font-weight:900;text-transform:uppercase;color:var(--color-text)}
.fa-bar button.fa-bar__m{width:auto;height:auto;border-radius:99px;padding:7px 13px;font-size:.72rem;font-weight:900;margin-left:auto;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.fa-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}
.fa-staff button{display:flex;flex-direction:column;align-items:center;gap:7px;padding:17px 10px;background:var(--color-surface,#151515);border:2px solid transparent;border-radius:var(--radius,10px);cursor:pointer;color:var(--color-text);text-align:center;transition:.15s}
.fa-staff button:hover{border-color:var(--color-primary)}
.fa-staff b{font-size:.9rem;font-weight:900;text-transform:uppercase}
.fa-staff i{font-style:normal;font-size:.71rem;color:var(--color-text-muted)}
.fa-av{width:56px;height:56px;border-radius:var(--radius,10px);object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:1.2rem}
.fa-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none}
.fa-cal-box{max-width:410px}
.fa-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.fa-mnav b{font-weight:900;text-transform:uppercase;color:var(--color-text)}
.fa-mnav button{width:32px;height:32px;border-radius:var(--radius,10px);border:none;background:var(--color-surface,#151515);color:var(--color-text);cursor:pointer}
.fa-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fa-mnav button:disabled{opacity:.25;cursor:not-allowed}
.fa-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.fa-dow span{text-align:center;font-size:.64rem;font-weight:900;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.07em}
.fa-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.fa-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:800;font-size:.86rem;opacity:.28;border-radius:var(--radius,10px)}
.fa-day.is-av{opacity:1;color:var(--color-text);background:var(--color-surface,#151515);cursor:pointer;transition:.12s}
.fa-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fa-empty{margin-top:13px;text-align:center}
.fa-empty p{margin:0 0 9px;font-size:.85rem;color:var(--color-text-muted)}
.fa-empty b{color:var(--color-text)}
.fa-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.fa-empty button{background:var(--color-surface,#151515);border:none;color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.75rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.04em}
.fa-empty button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fa-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:7px}
.fa-slots button{padding:13px 6px;border:none;background:var(--color-surface,#151515);color:var(--color-text);font-weight:900;font-size:.9rem;border-radius:var(--radius,10px);cursor:pointer;transition:.12s}
.fa-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fa-slots button.is-off{opacity:.25;text-decoration:line-through;cursor:not-allowed}
.fa-recap{display:flex;flex-direction:column;gap:3px;border-left:4px solid var(--color-primary);padding:4px 0 4px 15px;margin-bottom:18px}
.fa-recap b{font-size:1.05rem;font-weight:900;text-transform:uppercase;color:var(--color-text)}
.fa-recap span{font-size:.81rem;color:var(--color-text-muted)}
.fa-recap em{font-style:normal;font-weight:900;color:var(--color-primary);margin-top:3px}
.fa-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.fa-form{grid-template-columns:1fr}}
.fa-wide{grid-column:1/-1}
.fa-form label{display:flex;flex-direction:column;gap:5px}
.fa-form label>span{font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text)}
.fa-form label i{font-style:normal;color:var(--color-primary)}
.fa-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.fa-form input,.fa-form textarea{border:none;background:var(--color-surface,#151515);color:var(--color-text);border-radius:var(--radius,10px);padding:12px 14px;font-size:.93rem;font-family:inherit;outline:none;transition:.14s}
.fa-form input:focus,.fa-form textarea:focus{box-shadow:0 0 0 2px var(--color-primary)}
.fa-form small{color:#ff6b5a;font-size:.71rem;font-weight:700}
.fa-pay{display:flex;gap:9px}
.fa-pay button{flex:1;border:none;background:var(--color-surface,#151515);color:var(--color-text);border-radius:var(--radius,10px);padding:12px;font-weight:900;font-size:.84rem;text-transform:uppercase;cursor:pointer;transition:.14s}
.fa-pay button.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fa-cta{width:100%;margin-top:18px;padding:17px;border:none;border-radius:var(--radius,10px);background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:900;font-size:1rem;text-transform:uppercase;letter-spacing:.07em;cursor:pointer;transition:.14s}
.fa-cta:hover:not(:disabled){filter:brightness(1.1)}
.fa-cta:disabled{opacity:.4;cursor:not-allowed}
.fa-done{text-align:center;padding:10px 0}
.fa-done__c{width:66px;height:66px;border-radius:var(--radius,10px);background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.9rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.fa-done h3{font-size:1.8rem;font-weight:900;text-transform:uppercase;margin:0 0 8px;color:var(--color-text)}
.fa-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
.fa-done__l{list-style:none;margin:0;padding:0;text-align:left;max-width:420px;margin:0 auto}
.fa-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-top:1px solid var(--color-border)}
.fa-done__l li:first-child{border-top:none}
.fa-done__l i{font-style:normal;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.09em;color:var(--color-text-muted)}
.fa-done__l b{font-size:.9rem;font-weight:800;color:var(--color-text);text-align:right}
`;
