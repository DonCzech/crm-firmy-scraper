"use client";

/**
 * fyzio-01 „Care" — klidná klinická linka: hodně vzduchu, měkké karty, kroky
 * jako spojité body, uklidňující formulace a jasná hierarchie.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2 } };

export function FyzioCare({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Terapeut", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="fc" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fc-wrap">
        <header className="fc-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <ol className="fc-steps">
            {st.steps.map((l, i) => (
              <li key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                <span>{i < st.vstep ? "✓" : i + 1}</span><b>{l}</b>
              </li>
            ))}
          </ol>
        )}

        <div className="fc-card">
          {b.loading && <div className="fc-load"><span className="fc-spin" /></div>}
          {b.loadErr && !b.loading && <p className="fc-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="fc-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim}>
                  <p className="fc-lead">S čím vám můžeme pomoci?</p>
                  <div className="fc-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="fc-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="fc-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="fc-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </div>
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <BackBar ns="fc" onBack={() => b.setStep(0)} title="Kdo se vám bude věnovat?" />
                  <div className="fc-staff">
                    <button onClick={() => st.pickStaff(null)}>
                      <span className="fc-av fc-av--any">✦</span>
                      <span><b>Kdokoli z týmu</b><i>nabídneme nejbližší termín</i></span>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="fc-av" src={m.avatar_url} alt={m.name} />
                          : <span className="fc-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                        <span><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <BackBar ns="fc" onBack={st.backFromCalendar} title="Vyberte datum"
                    meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={() => st.setStaffChosen(false)} />
                  <div className="fc-cal-box">
                    <div className="fc-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="fc-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="fc-load"><span className="fc-spin" /></div> : (
                      <>
                        <div className="fc-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`fc-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="fc" who="terapeut" />}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <BackBar ns="fc" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="fc-load"><span className="fc-spin" /></div> : b.slots.length === 0 ? (
                    <p className="fc-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="fc-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <BackBar ns="fc" onBack={() => b.setStep(2)} title="Vaše údaje" />
                  <div className="fc-recap">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                    <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                  </div>
                  <BookingFields b={b} ns="fc" notesLabel="Popis obtíží" notesPlaceholder="Co vás trápí, jak dlouho, po jakém úrazu…" />
                  {b.submitErr && <p className="fc-msg fc-msg--err">{b.submitErr}</p>}
                  <button className="fc-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                  <p className="fc-fine">Vaše údaje slouží pouze k vyřízení rezervace.</p>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="fc-done">
                  <span className="fc-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <ul className="fc-done__l">
                    <li><i>Vyšetření</i><b>{b.service.name}</b></li>
                    <li><i>Terapeut</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                    <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                    <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                  </ul>
                  <p className="fc-fine">Přijďte prosím 5 minut předem.</p>
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
.fc{padding:70px 20px}
.fc-wrap{max-width:640px;margin:0 auto}
.fc-head{text-align:center;margin-bottom:26px}
.fc-head h2{font-size:clamp(1.7rem,3.8vw,2.25rem);font-weight:600;margin:0 0 9px;color:var(--color-text);letter-spacing:-.01em}
.fc-head p{margin:0;color:var(--color-text-muted);font-size:.95rem;line-height:1.55}
.fc-steps{list-style:none;display:flex;justify-content:center;flex-wrap:wrap;gap:0;margin:0 0 24px;padding:0}
.fc-steps li{display:flex;align-items:center;gap:8px;padding:0 14px;position:relative}
.fc-steps li::after{content:"";position:absolute;right:-1px;top:50%;width:2px;height:2px;border-radius:50%;background:var(--color-border)}
.fc-steps li:last-child::after{display:none}
.fc-steps li span{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;background:var(--color-surface,#fff);border:1px solid var(--color-border);color:var(--color-text-muted)}
.fc-steps li b{font-size:.79rem;font-weight:600;color:var(--color-text-muted)}
.fc-steps li.is-on span{background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.fc-steps li.is-on b{color:var(--color-text);font-weight:700}
.fc-steps li.is-done span{border-color:var(--color-primary);color:var(--color-primary)}
.fc-card{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.6);padding:28px;box-shadow:0 12px 40px -28px rgba(0,0,0,.35)}
@media(max-width:520px){.fc-card{padding:20px}}
.fc-load{display:flex;justify-content:center;padding:44px 0}
.fc-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.fc-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.fc-msg--err{color:#c0392b}
.fc-lead{margin:0 0 16px;font-size:1.08rem;font-weight:600;color:var(--color-text)}
.fc-list{display:flex;flex-direction:column;gap:9px}
.fc-list button{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:16px 18px;cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.fc-list button:hover{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 5%,var(--color-bg))}
.fc-list__b{min-width:0}
.fc-list__b b{display:block;font-size:.99rem;font-weight:600}
.fc-list__b i{font-style:normal;font-size:.81rem;color:var(--color-text-muted);margin-top:3px;display:block;line-height:1.45}
.fc-list__m{flex:0 0 auto;text-align:right}
.fc-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.fc-list__m small{font-size:.76rem;color:var(--color-text-muted)}
.fc-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.fc-bar button{width:36px;height:36px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.fc-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.fc-bar b{font-size:1.1rem;font-weight:600;color:var(--color-text)}
.fc-bar button.fc-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 12px;font-size:.73rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.fc-staff{display:flex;flex-direction:column;gap:9px}
.fc-staff button{display:flex;align-items:center;gap:14px;padding:12px 15px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.fc-staff button:hover{border-color:var(--color-primary)}
.fc-staff b{display:block;font-size:.96rem;font-weight:600}
.fc-staff i{font-style:normal;font-size:.79rem;color:var(--color-text-muted)}
.fc-av{width:46px;height:46px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.fc-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.fc-cal-box{max-width:400px;margin:0 auto}
.fc-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.fc-mnav b{font-weight:600;color:var(--color-text)}
.fc-mnav button{width:31px;height:31px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);cursor:pointer}
.fc-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fc-mnav button:disabled{opacity:.25;cursor:not-allowed}
.fc-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.fc-dow span{text-align:center;font-size:.66rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.fc-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.fc-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.86rem;opacity:.3;border-radius:50%}
.fc-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 9%,transparent);cursor:pointer;transition:.12s}
.fc-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fc-empty{margin-top:13px;text-align:center}
.fc-empty p{margin:0 0 10px;font-size:.86rem;color:var(--color-text-muted)}
.fc-empty b{color:var(--color-text)}
.fc-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.fc-empty button{background:var(--color-bg);border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.77rem;font-weight:600;cursor:pointer}
.fc-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.fc-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px}
.fc-slots button{padding:12px 6px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:600;font-size:.89rem;border-radius:var(--radius,12px);cursor:pointer;transition:.12s}
.fc-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.fc-slots button.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed}
.fc-recap{display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--color-primary) 7%,transparent);border-radius:var(--radius,12px);padding:14px 17px;margin-bottom:18px}
.fc-recap b{font-size:1rem;font-weight:600;color:var(--color-text)}
.fc-recap span{font-size:.82rem;color:var(--color-text-muted)}
.fc-recap em{font-style:normal;font-weight:700;color:var(--color-primary);margin-top:3px}
.fc-form{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:520px){.fc-form{grid-template-columns:1fr}}
.fc-wide{grid-column:1/-1}
.fc-form label{display:flex;flex-direction:column;gap:5px}
.fc-form label>span{font-size:.78rem;font-weight:600;color:var(--color-text)}
.fc-form label i{font-style:normal;color:var(--color-primary)}
.fc-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.fc-form input,.fc-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:var(--radius,12px);padding:11px 14px;font-size:.92rem;font-family:inherit;outline:none;transition:.14s}
.fc-form input:focus,.fc-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 13%,transparent)}
.fc-form small{color:#c0392b;font-size:.72rem;font-weight:600}
.fc-pay{display:flex;gap:9px}
.fc-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:var(--radius,12px);padding:11px;font-weight:600;font-size:.86rem;cursor:pointer;transition:.14s}
.fc-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.fc-cta{width:100%;margin-top:18px;padding:14px;border:none;border-radius:var(--radius,12px);background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.95rem;cursor:pointer;transition:.14s}
.fc-cta:hover:not(:disabled){filter:brightness(1.06)}
.fc-cta:disabled{opacity:.4;cursor:not-allowed}
.fc-fine{text-align:center;font-size:.78rem;color:var(--color-text-muted);margin:12px 0 0}
.fc-done{text-align:center}
.fc-done__c{width:62px;height:62px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 14%,transparent);color:var(--color-primary);font-size:1.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 16px}
.fc-done h3{font-size:1.45rem;font-weight:600;margin:0 0 8px;color:var(--color-text)}
.fc-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
.fc-done__l{list-style:none;margin:0;padding:0;text-align:left}
.fc-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-top:1px solid var(--color-border)}
.fc-done__l li:first-child{border-top:none}
.fc-done__l i{font-style:normal;font-size:.8rem;color:var(--color-text-muted)}
.fc-done__l b{font-size:.89rem;font-weight:600;color:var(--color-text);text-align:right}
`;
