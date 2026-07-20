"use client";

/**
 * clinic-03 „Chevron" — kroky jako navazující šipkové segmenty (breadcrumb),
 * pod nimi čistá karta. Střízlivé, srozumitelné na první pohled.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.17 } };

export function ClinicChevron({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Lékař", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="cv" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cv-wrap">
        <header className="cv-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <div className="cv-chevrons">
            {st.steps.map((l, i) => (
              <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
            ))}
          </div>
        )}

        <div className="cv-card">
          {b.loading && <div className="cv-load"><span className="cv-spin" /></div>}
          {b.loadErr && !b.loading && <p className="cv-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="cv-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim} className="cv-list">
                  {b.services.map((svc) => (
                    <button key={svc.id} onClick={() => b.pickService(svc)}>
                      <span className="cv-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                      <span className="cv-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="cv-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <BackBar ns="cv" onBack={() => b.setStep(0)} title="Vyberte lékaře" />
                  <div className="cv-staff">
                    <button onClick={() => st.pickStaff(null)}><span className="cv-av cv-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="cv-av" src={m.avatar_url} alt={m.name} />
                          : <span className="cv-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                        <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <BackBar ns="cv" onBack={st.backFromCalendar} title="Vyberte datum"
                    meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={() => st.setStaffChosen(false)} />
                  <div className="cv-cal-box">
                    <div className="cv-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="cv-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="cv-load"><span className="cv-spin" /></div> : (
                      <>
                        <div className="cv-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`cv-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="cv" who="lékař" />}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <BackBar ns="cv" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="cv-load"><span className="cv-spin" /></div> : b.slots.length === 0 ? (
                    <p className="cv-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="cv-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <BackBar ns="cv" onBack={() => b.setStep(2)} title="Vaše údaje" />
                  <div className="cv-recap">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                    <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                  </div>
                  <BookingFields b={b} ns="cv" notesLabel="Poznámka pro lékaře" />
                  {b.submitErr && <p className="cv-msg cv-msg--err">{b.submitErr}</p>}
                  <button className="cv-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="cv-done">
                  <span className="cv-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <ul className="cv-done__l">
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
    </section>
  );
}

const CSS = `
.cv{padding:64px 20px}
.cv-wrap{max-width:640px;margin:0 auto}
.cv-head{margin-bottom:20px}
.cv-head h2{font-size:clamp(1.6rem,3.5vw,2.1rem);font-weight:700;margin:0 0 7px;color:var(--color-text)}
.cv-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.cv-chevrons{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:16px}
.cv-chevrons span{position:relative;flex:1;min-width:88px;background:var(--color-surface,#fff);border:1px solid var(--color-border);color:var(--color-text-muted);font-size:.73rem;font-weight:600;padding:10px 12px 10px 20px;clip-path:polygon(0 0,calc(100% - 11px) 0,100% 50%,calc(100% - 11px) 100%,0 100%,11px 50%)}
.cv-chevrons span:first-child{padding-left:14px;clip-path:polygon(0 0,calc(100% - 11px) 0,100% 50%,calc(100% - 11px) 100%,0 100%)}
.cv-chevrons span:last-child{clip-path:polygon(0 0,100% 0,100% 100%,0 100%,11px 50%)}
.cv-chevrons span.is-on{background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.cv-chevrons span.is-done{background:color-mix(in srgb,var(--color-primary) 13%,var(--color-surface,#fff));color:var(--color-primary)}
.cv-card{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:22px}
@media(max-width:520px){.cv-card{padding:16px}}
.cv-load{display:flex;justify-content:center;padding:42px 0}
.cv-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.cv-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.cv-msg--err{color:#c0392b}
.cv-list{display:flex;flex-direction:column}
.cv-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:14px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.cv-list button:last-child{border-bottom:none}
.cv-list button:hover{padding-left:10px;background:color-mix(in srgb,var(--color-primary) 5%,transparent)}
.cv-list__b b{display:block;font-size:.97rem;font-weight:600}
.cv-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);margin-top:2px}
.cv-list__m{flex:0 0 auto;text-align:right}
.cv-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.cv-list__m small{font-size:.74rem;color:var(--color-text-muted)}
.cv-bar{display:flex;align-items:center;gap:11px;margin-bottom:16px;flex-wrap:wrap}
.cv-bar button{width:33px;height:33px;border-radius:6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.12rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.cv-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.cv-bar b{font-size:1.05rem;font-weight:700;color:var(--color-text)}
.cv-bar button.cv-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 11px;font-size:.71rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.cv-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(122px,1fr));gap:9px}
.cv-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 9px;background:none;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.cv-staff button:hover{border-color:var(--color-primary)}
.cv-staff b{font-size:.89rem;font-weight:600}
.cv-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.cv-av{width:46px;height:46px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.cv-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.cv-cal-box{max-width:390px}
.cv-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.cv-mnav b{font-weight:700;color:var(--color-text)}
.cv-mnav button{width:29px;height:29px;border-radius:6px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.cv-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.cv-mnav button:disabled{opacity:.25;cursor:not-allowed}
.cv-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.cv-dow span{text-align:center;font-size:.64rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.cv-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.cv-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.84rem;opacity:.3;border-radius:6px}
.cv-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 8%,transparent);cursor:pointer;transition:.12s}
.cv-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.cv-empty{margin-top:12px;text-align:center}
.cv-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.cv-empty b{color:var(--color-text)}
.cv-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.cv-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 12px;font-size:.74rem;font-weight:600;cursor:pointer}
.cv-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.cv-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px}
.cv-slots button{padding:11px 5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:600;font-size:.86rem;border-radius:6px;cursor:pointer;transition:.12s}
.cv-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.cv-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.cv-recap{display:flex;flex-direction:column;gap:3px;border-left:3px solid var(--color-primary);padding:3px 0 3px 13px;margin-bottom:16px}
.cv-recap b{font-size:.97rem;font-weight:600;color:var(--color-text)}
.cv-recap span{font-size:.81rem;color:var(--color-text-muted)}
.cv-recap em{font-style:normal;font-weight:700;color:var(--color-primary);margin-top:3px}
.cv-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.cv-form{grid-template-columns:1fr}}
.cv-wide{grid-column:1/-1}
.cv-form label{display:flex;flex-direction:column;gap:4px}
.cv-form label>span{font-size:.73rem;font-weight:700;color:var(--color-text)}
.cv-form label i{font-style:normal;color:var(--color-primary)}
.cv-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.cv-form input,.cv-form textarea{border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:10px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.cv-form input:focus,.cv-form textarea:focus{border-color:var(--color-primary)}
.cv-form small{color:#c0392b;font-size:.71rem;font-weight:600}
.cv-pay{display:flex;gap:8px}
.cv-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:10px;font-weight:600;font-size:.84rem;cursor:pointer;transition:.14s}
.cv-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.cv-cta{width:100%;margin-top:16px;padding:13px;border:none;border-radius:6px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.92rem;cursor:pointer;transition:.14s}
.cv-cta:hover:not(:disabled){filter:brightness(1.06)}
.cv-cta:disabled{opacity:.4;cursor:not-allowed}
.cv-done{text-align:center}
.cv-done__c{width:54px;height:54px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 13%,transparent);color:var(--color-primary);font-size:1.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.cv-done h3{font-size:1.35rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.cv-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.cv-done__l{list-style:none;margin:0;padding:0;text-align:left}
.cv-done__l li{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid var(--color-border)}
.cv-done__l li:first-child{border-top:none}
.cv-done__l i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.cv-done__l b{font-size:.87rem;font-weight:600;color:var(--color-text);text-align:right}
`;
