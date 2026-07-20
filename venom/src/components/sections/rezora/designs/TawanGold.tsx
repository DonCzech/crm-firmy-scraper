"use client";

/**
 * tawan-01 „Gold" — thajský salon: symetrická osa, ornamentální tenké linky
 * a kosočtvercové oddělovače, zlaté akcenty na teakovém podkladu.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.24 } };

export function TawanGold({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Masáž", "Terapeut", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="tw" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tw-wrap">
        <header className="tw-head">
          <span className="tw-orn" aria-hidden />
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          {!b.done && (
            <div className="tw-steps">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
              ))}
            </div>
          )}
          <span className="tw-orn" aria-hidden />
        </header>

        {b.loading && <div className="tw-load"><span className="tw-spin" /></div>}
        {b.loadErr && !b.loading && <p className="tw-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="tw-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="tw-list">
                {b.services.map((svc) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <b>{svc.name}</b>
                    {svc.description && <i>{svc.description}</i>}
                    <span className="tw-meta"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="tw-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim} className="tw-panel">
                <BackBar ns="tw" onBack={() => b.setStep(0)} title="Vyberte terapeuta" />
                <div className="tw-staff">
                  <button onClick={() => st.pickStaff(null)}><span className="tw-av tw-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="tw-av" src={m.avatar_url} alt={m.name} />
                        : <span className="tw-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim} className="tw-panel">
                <BackBar ns="tw" onBack={st.backFromCalendar} title="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="tw-cal-box">
                  <div className="tw-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="tw-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="tw-load"><span className="tw-spin" /></div> : (
                    <>
                      <div className="tw-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`tw-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="tw" who="terapeut" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim} className="tw-panel">
                <BackBar ns="tw" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="tw-load"><span className="tw-spin" /></div> : b.slots.length === 0 ? (
                  <p className="tw-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="tw-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim} className="tw-panel">
                <BackBar ns="tw" onBack={() => b.setStep(2)} title="Vaše údaje" />
                <div className="tw-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="tw" namePlaceholder="Jana Nováková" notesLabel="Přání nebo omezení" />
                {b.submitErr && <p className="tw-msg tw-msg--err">{b.submitErr}</p>}
                <button className="tw-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="tw-panel tw-done">
                <span className="tw-done__c">✓</span>
                <h3>Rezervace potvrzena</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="tw-done__l">
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
.tw{padding:78px 20px}
.tw-wrap{max-width:620px;margin:0 auto;text-align:center}
.tw-head{margin-bottom:32px}
.tw-orn{display:block;height:1px;background:linear-gradient(90deg,transparent,var(--color-primary),transparent);position:relative;margin:0 0 22px}
.tw-orn::after{content:"";position:absolute;left:50%;top:50%;width:7px;height:7px;transform:translate(-50%,-50%) rotate(45deg);background:var(--color-primary)}
.tw-orn:last-child{margin:22px 0 0}
.tw-head h2{font-size:clamp(1.7rem,3.8vw,2.3rem);font-weight:400;margin:0 0 12px;color:var(--color-text);letter-spacing:.02em}
.tw-head p{margin:0 0 20px;color:var(--color-text-muted);font-size:.93rem;line-height:1.75}
.tw-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:18px}
.tw-steps span{font-size:.68rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--color-text-muted);opacity:.38}
.tw-steps span.is-on{opacity:1;color:var(--color-primary)}
.tw-steps span.is-done{opacity:.85;color:var(--color-text)}
.tw-load{display:flex;justify-content:center;padding:48px 0}
.tw-spin{width:24px;height:24px;border-radius:50%;border:1px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .9s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.tw-msg{color:var(--color-text-muted);font-size:.9rem;padding:22px 0;margin:0}
.tw-msg--err{color:#c4695a}
.tw-list{display:flex;flex-direction:column;gap:0}
.tw-list button{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;background:none;border:none;border-top:1px solid var(--color-border);padding:24px 10px;cursor:pointer;color:var(--color-text);transition:.2s}
.tw-list button:last-child{border-bottom:1px solid var(--color-border)}
.tw-list button:hover{background:color-mix(in srgb,var(--color-primary) 7%,transparent)}
.tw-list b{font-size:1.1rem;font-weight:400;letter-spacing:.02em}
.tw-list i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.82rem;color:var(--color-text-muted);line-height:1.6;max-width:42ch}
.tw-meta{display:flex;align-items:center;gap:14px;margin-top:5px}
.tw-meta em{font-style:normal;font-weight:600;color:var(--color-primary)}
.tw-meta small{font-size:.76rem;color:var(--color-text-muted)}
.tw-panel{border:1px solid var(--color-border);padding:28px;text-align:left}
@media(max-width:520px){.tw-panel{padding:18px}}
.tw-bar{display:flex;align-items:center;gap:13px;margin-bottom:20px;flex-wrap:wrap}
.tw-bar button{width:36px;height:36px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.15rem;cursor:pointer;transition:.18s;flex:0 0 auto}
.tw-bar button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.tw-bar b{font-size:1.08rem;font-weight:400;color:var(--color-text);letter-spacing:.02em}
.tw-bar button.tw-bar__m{width:auto;height:auto;padding:6px 12px;font-size:.71rem;font-weight:600;margin-left:auto;color:var(--color-text-muted);letter-spacing:.06em}
.tw-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:12px}
.tw-staff button{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 9px;background:none;border:1px solid var(--color-border);cursor:pointer;color:var(--color-text);text-align:center;transition:.18s}
.tw-staff button:hover{border-color:var(--color-primary)}
.tw-staff b{font-size:.92rem;font-weight:400}
.tw-staff i{font-style:normal;font-size:.71rem;color:var(--color-text-muted)}
.tw-av{width:58px;height:58px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:500;font-size:1.2rem}
.tw-av--any{border:1px dashed var(--color-border);color:var(--color-primary);background:none}
.tw-cal-box{max-width:390px;margin:0 auto}
.tw-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.tw-mnav b{font-weight:400;letter-spacing:.04em;color:var(--color-text)}
.tw-mnav button{width:30px;height:30px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.tw-mnav button:hover:not(:disabled){border-color:var(--color-primary);color:var(--color-primary)}
.tw-mnav button:disabled{opacity:.22;cursor:not-allowed}
.tw-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.tw-dow span{text-align:center;font-size:.64rem;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.1em}
.tw-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.tw-day{aspect-ratio:1;border:1px solid transparent;background:none;color:var(--color-text-muted);font-weight:400;font-size:.86rem;opacity:.25}
.tw-day.is-av{opacity:1;color:var(--color-text);border-color:var(--color-border);cursor:pointer;transition:.15s}
.tw-day.is-av:hover{border-color:var(--color-primary);color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 9%,transparent)}
.tw-empty{margin-top:15px;text-align:center}
.tw-empty p{margin:0 0 10px;font-size:.85rem;color:var(--color-text-muted)}
.tw-empty b{color:var(--color-text)}
.tw-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.tw-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);padding:8px 14px;font-size:.75rem;font-weight:600;cursor:pointer;letter-spacing:.04em}
.tw-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.tw-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:7px}
.tw-slots button{padding:12px 6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:400;font-size:.88rem;cursor:pointer;transition:.15s}
.tw-slots button:hover:not(.is-off){border-color:var(--color-primary);color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 9%,transparent)}
.tw-slots button.is-off{opacity:.24;text-decoration:line-through;cursor:not-allowed}
.tw-recap{display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border);padding:16px 2px;margin-bottom:22px}
.tw-recap b{font-size:1rem;font-weight:400;color:var(--color-text)}
.tw-recap span{font-size:.82rem;color:var(--color-text-muted)}
.tw-recap em{font-style:normal;font-weight:600;color:var(--color-primary);margin-top:4px}
.tw-form{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:520px){.tw-form{grid-template-columns:1fr}}
.tw-wide{grid-column:1/-1}
.tw-form label{display:flex;flex-direction:column;gap:6px}
.tw-form label>span{font-size:.68rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--color-text-muted)}
.tw-form label i{font-style:normal;color:var(--color-primary)}
.tw-form label em{font-style:normal;font-weight:400;text-transform:none;letter-spacing:.02em}
.tw-form input,.tw-form textarea{border:1px solid var(--color-border);background:none;color:var(--color-text);padding:11px 13px;font-size:.92rem;font-family:inherit;outline:none;transition:.18s}
.tw-form input:focus,.tw-form textarea:focus{border-color:var(--color-primary)}
.tw-form small{color:#c4695a;font-size:.71rem;font-weight:600}
.tw-pay{display:flex;gap:10px}
.tw-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);padding:12px;font-weight:500;font-size:.85rem;cursor:pointer;transition:.18s;letter-spacing:.04em}
.tw-pay button.is-on{border-color:var(--color-primary);color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 9%,transparent)}
.tw-cta{width:100%;margin-top:24px;padding:15px;border:1px solid var(--color-primary);background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:600;font-size:.9rem;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;transition:.2s}
.tw-cta:hover:not(:disabled){background:none;color:var(--color-primary)}
.tw-cta:disabled{opacity:.35;cursor:not-allowed}
.tw-done{text-align:center}
.tw-done__c{width:58px;height:58px;border:1px solid var(--color-primary);border-radius:50%;color:var(--color-primary);font-size:1.55rem;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}
.tw-done h3{font-size:1.42rem;font-weight:400;margin:0 0 10px;color:var(--color-text);letter-spacing:.02em}
.tw-done>p{color:var(--color-text-muted);margin:0 0 22px;font-size:.9rem}
.tw-done__l{list-style:none;margin:0;padding:0;text-align:left}
.tw-done__l li{display:flex;justify-content:space-between;gap:14px;padding:12px 2px;border-top:1px solid var(--color-border)}
.tw-done__l li:first-child{border-top:none}
.tw-done__l i{font-style:normal;font-size:.68rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--color-text-muted)}
.tw-done__l b{font-size:.89rem;font-weight:400;color:var(--color-text);text-align:right}
`;
