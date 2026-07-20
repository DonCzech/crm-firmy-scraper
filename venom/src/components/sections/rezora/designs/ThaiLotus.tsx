"use client";

/**
 * thaimasaze-02 „Lotus" — měkké pastely a kruhový ukazatel postupu: krok je
 * uvnitř prstence, obsah pod ním v jemných zaoblených blocích.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2 } };

export function ThaiLotus({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Masáž", "Terapeut", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;
  const total = st.steps.length;
  const done = b.done ? total : st.vstep + 1;
  const ring = (done / total) * 100;

  return (
    <section id="rezervace" className="tl" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tl-wrap">
        <header className="tl-head">
          <div className="tl-ring" style={{ ["--p" as string]: `${ring}%` }}>
            <span><b>{done}</b><i>/{total}</i></span>
          </div>
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{b.done ? "Rezervace dokončena" : st.steps[st.vstep]}</p>
          {b.step === 0 && !b.done && (
            <p className="tl-sub">{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          )}
        </header>

        {b.loading && <div className="tl-load"><span className="tl-spin" /></div>}
        {b.loadErr && !b.loading && <p className="tl-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="tl-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="tl-list">
                {b.services.map((svc) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <span className="tl-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                    <span className="tl-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="tl-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim}>
                <BackBar ns="tl" onBack={() => b.setStep(0)} title="Vyberte terapeuta" />
                <div className="tl-staff">
                  <button onClick={() => st.pickStaff(null)}><span className="tl-av tl-av--any">✦</span><b>Kdokoli</b></button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="tl-av" src={m.avatar_url} alt={m.name} />
                        : <span className="tl-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name.split(" ")[0]}</b>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim}>
                <BackBar ns="tl" onBack={st.backFromCalendar} title="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="tl-block">
                  <div className="tl-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="tl-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="tl-load"><span className="tl-spin" /></div> : (
                    <>
                      <div className="tl-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`tl-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="tl" who="terapeut" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim}>
                <BackBar ns="tl" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="tl-load"><span className="tl-spin" /></div> : b.slots.length === 0 ? (
                  <p className="tl-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="tl-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim}>
                <BackBar ns="tl" onBack={() => b.setStep(2)} title="Vaše údaje" />
                <div className="tl-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="tl" namePlaceholder="Jana Nováková" notesLabel="Přání nebo omezení" />
                {b.submitErr && <p className="tl-msg tl-msg--err">{b.submitErr}</p>}
                <button className="tl-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="tl-done">
                <h3>Těšíme se na vás</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="tl-done__l">
                  <li><i>Masáž</i><b>{b.service.name}</b></li>
                  <li><i>Terapeut</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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
.tl{padding:70px 20px}
.tl-wrap{max-width:560px;margin:0 auto}
.tl-head{text-align:center;margin-bottom:28px}
.tl-ring{width:84px;height:84px;border-radius:50%;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--color-primary) var(--p),color-mix(in srgb,var(--color-primary) 14%,transparent) 0)}
.tl-ring span{width:66px;height:66px;border-radius:50%;background:var(--color-bg);display:flex;align-items:baseline;justify-content:center;gap:1px}
.tl-ring b{font-size:1.5rem;font-weight:600;color:var(--color-text);align-self:center}
.tl-ring i{font-style:normal;font-size:.78rem;color:var(--color-text-muted);align-self:center}
.tl-head h2{font-size:clamp(1.6rem,3.6vw,2.1rem);font-weight:500;margin:0 0 6px;color:var(--color-text)}
.tl-head p{margin:0;color:var(--color-primary);font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
.tl-sub{color:var(--color-text-muted)!important;font-size:.9rem!important;font-weight:400!important;letter-spacing:0!important;text-transform:none!important;margin-top:10px!important;line-height:1.65}
.tl-load{display:flex;justify-content:center;padding:44px 0}
.tl-spin{width:24px;height:24px;border-radius:50%;border:3px solid color-mix(in srgb,var(--color-primary) 20%,transparent);border-top-color:var(--color-primary);animation:rezspin .8s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.tl-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 0;margin:0}
.tl-msg--err{color:#c4695a}
.tl-list{display:flex;flex-direction:column;gap:10px}
.tl-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:var(--color-surface,#fff);border:none;border-radius:calc(var(--radius,12px)*2);padding:17px 22px;cursor:pointer;color:var(--color-text);text-align:left;transition:.18s}
.tl-list button:hover{background:color-mix(in srgb,var(--color-primary) 10%,var(--color-surface,#fff))}
.tl-list__b b{display:block;font-size:1rem;font-weight:500}
.tl-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.8rem;color:var(--color-text-muted);margin-top:3px;line-height:1.5}
.tl-list__m{flex:0 0 auto;text-align:right}
.tl-list__m em{font-style:normal;display:block;font-weight:600;color:var(--color-primary)}
.tl-list__m small{font-size:.75rem;color:var(--color-text-muted)}
.tl-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.tl-bar button{width:36px;height:36px;border-radius:50%;border:none;background:var(--color-surface,#fff);color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.16s;flex:0 0 auto}
.tl-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tl-bar b{font-size:1.05rem;font-weight:500;color:var(--color-text)}
.tl-bar button.tl-bar__m{width:auto;height:auto;border-radius:99px;padding:7px 13px;font-size:.72rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.tl-staff{display:flex;flex-wrap:wrap;gap:10px}
.tl-staff button{display:flex;align-items:center;gap:9px;background:var(--color-surface,#fff);border:none;border-radius:99px;padding:6px 18px 6px 6px;cursor:pointer;color:var(--color-text);transition:.16s}
.tl-staff button:hover{background:color-mix(in srgb,var(--color-primary) 12%,var(--color-surface,#fff))}
.tl-staff b{font-size:.9rem;font-weight:500}
.tl-av{width:40px;height:40px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600}
.tl-av--any{border:1px dashed var(--color-border);color:var(--color-primary);background:none}
.tl-block{background:var(--color-surface,#fff);border-radius:calc(var(--radius,12px)*2);padding:20px}
.tl-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.tl-mnav b{font-weight:500;color:var(--color-text)}
.tl-mnav button{width:30px;height:30px;border-radius:50%;border:none;background:var(--color-bg);color:var(--color-text);cursor:pointer}
.tl-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tl-mnav button:disabled{opacity:.22;cursor:not-allowed}
.tl-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.tl-dow span{text-align:center;font-size:.65rem;font-weight:600;color:var(--color-text-muted);text-transform:uppercase}
.tl-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.tl-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:500;font-size:.86rem;opacity:.28;border-radius:50%}
.tl-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 11%,transparent);cursor:pointer;transition:.14s}
.tl-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tl-empty{margin-top:13px;text-align:center}
.tl-empty p{margin:0 0 10px;font-size:.85rem;color:var(--color-text-muted)}
.tl-empty b{color:var(--color-text)}
.tl-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.tl-empty button{background:var(--color-bg);border:none;color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.76rem;font-weight:600;cursor:pointer}
.tl-empty button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tl-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px}
.tl-slots button{padding:13px 6px;border:none;background:var(--color-surface,#fff);color:var(--color-text);font-weight:500;font-size:.88rem;border-radius:99px;cursor:pointer;transition:.14s}
.tl-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tl-slots button.is-off{opacity:.26;text-decoration:line-through;cursor:not-allowed}
.tl-recap{display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--color-primary) 9%,transparent);border-radius:calc(var(--radius,12px)*2);padding:15px 20px;margin-bottom:18px}
.tl-recap b{font-size:1rem;font-weight:500;color:var(--color-text)}
.tl-recap span{font-size:.81rem;color:var(--color-text-muted)}
.tl-recap em{font-style:normal;font-weight:600;color:var(--color-primary);margin-top:3px}
.tl-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.tl-form{grid-template-columns:1fr}}
.tl-wide{grid-column:1/-1}
.tl-form label{display:flex;flex-direction:column;gap:5px}
.tl-form label>span{font-size:.73rem;font-weight:600;color:var(--color-text)}
.tl-form label i{font-style:normal;color:var(--color-primary)}
.tl-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.tl-form input,.tl-form textarea{border:none;background:var(--color-surface,#fff);color:var(--color-text);border-radius:99px;padding:12px 18px;font-size:.91rem;font-family:inherit;outline:none;transition:.14s}
.tl-form textarea{border-radius:20px}
.tl-form input:focus,.tl-form textarea:focus{box-shadow:0 0 0 2px var(--color-primary)}
.tl-form small{color:#c4695a;font-size:.71rem;font-weight:600;padding-left:14px}
.tl-pay{display:flex;gap:9px}
.tl-pay button{flex:1;border:none;background:var(--color-surface,#fff);color:var(--color-text);border-radius:99px;padding:12px;font-weight:600;font-size:.85rem;cursor:pointer;transition:.14s}
.tl-pay button.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tl-cta{width:100%;margin-top:18px;padding:15px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:600;font-size:.94rem;cursor:pointer;transition:.14s}
.tl-cta:hover:not(:disabled){filter:brightness(1.06)}
.tl-cta:disabled{opacity:.38;cursor:not-allowed}
.tl-done{text-align:center}
.tl-done h3{font-size:1.45rem;font-weight:500;margin:0 0 8px;color:var(--color-text)}
.tl-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.9rem}
.tl-done__l{list-style:none;margin:0;padding:0;text-align:left;background:var(--color-surface,#fff);border-radius:calc(var(--radius,12px)*2);overflow:hidden}
.tl-done__l li{display:flex;justify-content:space-between;gap:14px;padding:13px 20px;border-top:1px solid var(--color-bg)}
.tl-done__l li:first-child{border-top:none}
.tl-done__l i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.tl-done__l b{font-size:.88rem;font-weight:500;color:var(--color-text);text-align:right}
`;
