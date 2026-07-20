"use client";

/**
 * dental-01 „Clean" — sterilní bílá s modrou: přehledné bloky, zaoblené rohy,
 * kroky jako spojité pilulky a drobné signály důvěry pod formulářem.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.18 } };

export function DentalClean({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Ošetření", "Lékař", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="dc" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="dc-wrap">
        <header className="dc-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <div className="dc-steps">
            {st.steps.map((l, i) => (
              <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                <i>{i < st.vstep ? "✓" : i + 1}</i>{l}
              </span>
            ))}
          </div>
        )}

        <div className="dc-card">
          {b.loading && <div className="dc-load"><span className="dc-spin" /></div>}
          {b.loadErr && !b.loading && <p className="dc-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="dc-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim} className="dc-list">
                  {b.services.map((svc) => (
                    <button key={svc.id} onClick={() => b.pickService(svc)}>
                      <span className="dc-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                      <span className="dc-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="dc-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <BackBar ns="dc" onBack={() => b.setStep(0)} title="Vyberte lékaře" />
                  <div className="dc-staff">
                    <button onClick={() => st.pickStaff(null)}>
                      <span className="dc-av dc-av--any">✦</span><span><b>Kdokoli</b><i>nejbližší volný termín</i></span>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="dc-av" src={m.avatar_url} alt={m.name} />
                          : <span className="dc-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                        <span><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <BackBar ns="dc" onBack={st.backFromCalendar} title="Vyberte datum"
                    meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={() => st.setStaffChosen(false)} />
                  <div className="dc-cal-box">
                    <div className="dc-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="dc-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="dc-load"><span className="dc-spin" /></div> : (
                      <>
                        <div className="dc-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`dc-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="dc" who="lékař" />}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <BackBar ns="dc" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="dc-load"><span className="dc-spin" /></div> : b.slots.length === 0 ? (
                    <p className="dc-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="dc-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <BackBar ns="dc" onBack={() => b.setStep(2)} title="Vaše údaje" />
                  <div className="dc-recap">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                    <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                  </div>
                  <BookingFields b={b} ns="dc" notesLabel="Poznámka pro lékaře" notesPlaceholder="Alergie, obavy, předchozí ošetření…" />
                  {b.submitErr && <p className="dc-msg dc-msg--err">{b.submitErr}</p>}
                  <button className="dc-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                  <p className="dc-trust">Údaje jsou zabezpečené a slouží pouze k vyřízení rezervace.</p>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="dc-done">
                  <span className="dc-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <ul className="dc-done__l">
                    <li><i>Ošetření</i><b>{b.service.name}</b></li>
                    <li><i>Lékař</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                    <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                    <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                  </ul>
                  <p className="dc-trust">Dostavte se prosím 10 minut před termínem.</p>
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
.dc{padding:66px 20px}
.dc-wrap{max-width:600px;margin:0 auto}
.dc-head{text-align:center;margin-bottom:22px}
.dc-head h2{font-size:clamp(1.65rem,3.6vw,2.15rem);font-weight:700;margin:0 0 8px;color:var(--color-text);letter-spacing:-.01em}
.dc-head p{margin:0;color:var(--color-text-muted);font-size:.93rem}
.dc-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.dc-steps span{display:inline-flex;align-items:center;gap:6px;font-size:.74rem;font-weight:600;color:var(--color-text-muted);background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:99px;padding:6px 13px}
.dc-steps span i{font-style:normal;width:17px;height:17px;border-radius:50%;background:var(--color-border);color:var(--color-text);display:flex;align-items:center;justify-content:center;font-size:.66rem;font-weight:700}
.dc-steps span.is-on{background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.dc-steps span.is-on i{background:rgba(255,255,255,.28);color:inherit}
.dc-steps span.is-done{color:var(--color-primary);border-color:color-mix(in srgb,var(--color-primary) 40%,transparent)}
.dc-steps span.is-done i{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.dc-card{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.5);padding:24px;box-shadow:0 8px 30px -22px rgba(0,0,0,.3)}
@media(max-width:520px){.dc-card{padding:18px}}
.dc-load{display:flex;justify-content:center;padding:42px 0}
.dc-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.dc-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.dc-msg--err{color:#c0392b}
.dc-list{display:flex;flex-direction:column;gap:8px}
.dc-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:var(--color-bg);border:1px solid transparent;border-radius:var(--radius,12px);padding:15px 17px;cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.dc-list button:hover{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 6%,var(--color-bg))}
.dc-list__b b{display:block;font-size:.98rem;font-weight:600}
.dc-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.79rem;color:var(--color-text-muted);margin-top:3px;line-height:1.45}
.dc-list__m{flex:0 0 auto;text-align:right}
.dc-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.dc-list__m small{font-size:.75rem;color:var(--color-text-muted)}
.dc-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.dc-bar button{width:34px;height:34px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.15rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.dc-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.dc-bar b{font-size:1.06rem;font-weight:700;color:var(--color-text)}
.dc-bar button.dc-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 12px;font-size:.72rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.dc-staff{display:flex;flex-direction:column;gap:8px}
.dc-staff button{display:flex;align-items:center;gap:13px;padding:11px 14px;background:var(--color-bg);border:1px solid transparent;border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.dc-staff button:hover{border-color:var(--color-primary)}
.dc-staff b{display:block;font-size:.95rem;font-weight:600}
.dc-staff i{font-style:normal;font-size:.77rem;color:var(--color-text-muted)}
.dc-av{width:42px;height:42px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.dc-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.dc-cal-box{max-width:390px;margin:0 auto}
.dc-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.dc-mnav b{font-weight:700;color:var(--color-text)}
.dc-mnav button{width:30px;height:30px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);cursor:pointer}
.dc-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.dc-mnav button:disabled{opacity:.25;cursor:not-allowed}
.dc-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.dc-dow span{text-align:center;font-size:.65rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.dc-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.dc-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.85rem;opacity:.3;border-radius:8px}
.dc-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.dc-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.dc-empty{margin-top:12px;text-align:center}
.dc-empty p{margin:0 0 9px;font-size:.85rem;color:var(--color-text-muted)}
.dc-empty b{color:var(--color-text)}
.dc-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.dc-empty button{background:var(--color-bg);border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.76rem;font-weight:600;cursor:pointer}
.dc-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.dc-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px}
.dc-slots button{padding:12px 6px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:600;font-size:.88rem;border-radius:8px;cursor:pointer;transition:.12s}
.dc-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.dc-slots button.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed}
.dc-recap{display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--color-primary) 7%,transparent);border-radius:var(--radius,12px);padding:13px 16px;margin-bottom:16px}
.dc-recap b{font-size:.98rem;font-weight:600;color:var(--color-text)}
.dc-recap span{font-size:.81rem;color:var(--color-text-muted)}
.dc-recap em{font-style:normal;font-weight:700;color:var(--color-primary);margin-top:3px}
.dc-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.dc-form{grid-template-columns:1fr}}
.dc-wide{grid-column:1/-1}
.dc-form label{display:flex;flex-direction:column;gap:5px}
.dc-form label>span{font-size:.74rem;font-weight:600;color:var(--color-text)}
.dc-form label i{font-style:normal;color:var(--color-primary)}
.dc-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.dc-form input,.dc-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:8px;padding:10px 13px;font-size:.91rem;font-family:inherit;outline:none;transition:.14s}
.dc-form input:focus,.dc-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 13%,transparent)}
.dc-form small{color:#c0392b;font-size:.71rem;font-weight:600}
.dc-pay{display:flex;gap:9px}
.dc-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:8px;padding:11px;font-weight:600;font-size:.85rem;cursor:pointer;transition:.14s}
.dc-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.dc-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:8px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.93rem;cursor:pointer;transition:.14s}
.dc-cta:hover:not(:disabled){filter:brightness(1.06)}
.dc-cta:disabled{opacity:.4;cursor:not-allowed}
.dc-trust{text-align:center;font-size:.76rem;color:var(--color-text-muted);margin:12px 0 0}
.dc-done{text-align:center}
.dc-done__c{width:58px;height:58px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 13%,transparent);color:var(--color-primary);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.dc-done h3{font-size:1.4rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.dc-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.dc-done__l{list-style:none;margin:0;padding:0;text-align:left}
.dc-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-top:1px solid var(--color-border)}
.dc-done__l li:first-child{border-top:none}
.dc-done__l i{font-style:normal;font-size:.79rem;color:var(--color-text-muted)}
.dc-done__l b{font-size:.88rem;font-weight:600;color:var(--color-text);text-align:right}
`;
