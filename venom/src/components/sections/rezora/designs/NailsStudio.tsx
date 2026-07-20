"use client";

/**
 * nails-03 „Studio" — tmavý glam: kroky jako segmentový přepínač s posuvným
 * indikátorem, na dokončené segmenty lze klikat zpět. Kompaktní panel pod ním.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.17 } };

export function NailsStudio({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Manikérka", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  // klik na dokončený segment = návrat na daný krok
  function goToStep(i: number) {
    if (i >= st.vstep) return;
    if (!st.hasStaff) { b.setStep(Math.min(i, 3) as 0 | 1 | 2 | 3); return; }
    if (i === 0) b.setStep(0);
    else if (i === 1) { b.setStep(1); st.setStaffChosen(false); }
    else if (i === 2) { b.setStep(1); st.setStaffChosen(true); }
    else if (i === 3) b.setStep(2);
  }

  return (
    <section id="rezervace" className="nst" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nst-wrap">
        <header className="nst-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && !b.loading && !b.loadErr && b.provider && (
          <div className="nst-seg" style={{ ["--n" as string]: st.steps.length, ["--i" as string]: st.vstep }}>
            <span className="nst-seg__pill" aria-hidden />
            {st.steps.map((l, i) => (
              <button key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : "is-off"}
                onClick={() => goToStep(i)} disabled={i >= st.vstep}>
                {i < st.vstep ? "✓ " : ""}{l}
              </button>
            ))}
          </div>
        )}

        <div className="nst-panel">
          {b.loading && <div className="nst-load"><span className="nst-spin" /></div>}
          {b.loadErr && !b.loading && <p className="nst-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="nst-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim} className="nst-rows">
                  {b.services.map((svc) => (
                    <button key={svc.id} onClick={() => b.pickService(svc)}>
                      <span><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                      <span className="nst-rows__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="nst-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim} className="nst-staff">
                  <button onClick={() => st.pickStaff(null)}>
                    <span className="nst-av nst-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                  </button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="nst-av" src={m.avatar_url} alt={m.name} />
                        : <span className="nst-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <div className="nst-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="nst-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="nst-load"><span className="nst-spin" /></div> : (
                    <>
                      <div className="nst-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`nst-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="nst-empty">
                          <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                          <div>
                            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                            {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiná manikérka</button>}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <p className="nst-sub">{fmtLongDate(b.date)}</p>
                  {b.slotsLoading ? <div className="nst-load"><span className="nst-spin" /></div> : b.slots.length === 0 ? (
                    <p className="nst-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="nst-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <div className="nst-recap">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                    <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                  </div>
                  <div className="nst-form">
                    <label><span>Jméno a příjmení <i>*</i></span>
                      <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                    <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                      {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                    <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                    <label className="nst-wide"><span>Poznámka <em>(nepovinné)</em></span>
                      <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                    {b.paymentMethods > 1 && (
                      <div className="nst-pay nst-wide">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="nst-msg nst-msg--err">{b.submitErr}</p>}
                  <button className="nst-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="nst-done">
                  <span className="nst-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <ul className="nst-done__l">
                    <li><i>Služba</i><b>{b.service.name}</b></li>
                    <li><i>Manikérka</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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
.nst{padding:64px 20px}
.nst-wrap{max-width:600px;margin:0 auto}
.nst-head{text-align:center;margin-bottom:22px}
.nst-head h2{font-size:clamp(1.65rem,3.8vw,2.2rem);font-weight:700;margin:0 0 7px;color:var(--color-text);letter-spacing:.01em}
.nst-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.nst-seg{position:relative;display:grid;grid-template-columns:repeat(var(--n),1fr);background:color-mix(in srgb,var(--color-text) 7%,transparent);border:1px solid var(--color-border);border-radius:99px;padding:4px;margin-bottom:18px}
.nst-seg__pill{position:absolute;top:4px;bottom:4px;left:4px;width:calc((100% - 8px)/var(--n));background:var(--color-primary);border-radius:99px;transform:translateX(calc(var(--i)*100%));transition:transform .3s cubic-bezier(.4,0,.2,1)}
.nst-seg button{position:relative;z-index:1;background:none;border:none;padding:9px 4px;font-size:.74rem;font-weight:700;color:var(--color-text-muted);cursor:default;border-radius:99px;transition:color .2s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nst-seg button.is-on{color:var(--color-on-primary,#fff)}
.nst-seg button.is-done{color:var(--color-primary);cursor:pointer}
.nst-seg button.is-done:hover{color:var(--color-text)}
.nst-panel{background:color-mix(in srgb,var(--color-text) 5%,transparent);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.4);padding:20px}
.nst-load{display:flex;justify-content:center;padding:42px 0}
.nst-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.nst-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.nst-msg--err{color:#e07a5f}
.nst-sub{margin:0 0 14px;font-size:.95rem;font-weight:700;color:var(--color-text)}
.nst-rows{display:flex;flex-direction:column}
.nst-rows button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:14px 4px;cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.nst-rows button:last-child{border-bottom:none}
.nst-rows button:hover{padding-left:12px;background:color-mix(in srgb,var(--color-primary) 8%,transparent)}
.nst-rows b{display:block;font-size:.97rem;font-weight:700}
.nst-rows i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);margin-top:2px}
.nst-rows__m{flex:0 0 auto;text-align:right}
.nst-rows__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary)}
.nst-rows__m small{font-size:.73rem;color:var(--color-text-muted)}
.nst-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:9px}
.nst-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:15px 9px;background:color-mix(in srgb,var(--color-text) 6%,transparent);border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);text-align:center;transition:.15s}
.nst-staff button:hover{border-color:var(--color-primary)}
.nst-staff b{font-size:.89rem;font-weight:700}
.nst-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.nst-av{width:50px;height:50px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.05rem}
.nst-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.nst-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.nst-mnav b{font-weight:700;color:var(--color-text)}
.nst-mnav button{width:31px;height:31px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.nst-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nst-mnav button:disabled{opacity:.25;cursor:not-allowed}
.nst-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.nst-dow span{text-align:center;font-size:.65rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.nst-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.nst-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.85rem;opacity:.3;border-radius:9px}
.nst-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-text) 8%,transparent);cursor:pointer;transition:.12s}
.nst-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nst-empty{margin-top:12px;text-align:center}
.nst-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.nst-empty b{color:var(--color-text)}
.nst-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.nst-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.75rem;font-weight:700;cursor:pointer}
.nst-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.nst-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:7px}
.nst-slots button{padding:11px 6px;border:1px solid var(--color-border);background:color-mix(in srgb,var(--color-text) 6%,transparent);color:var(--color-text);font-weight:700;font-size:.87rem;border-radius:9px;cursor:pointer;transition:.12s}
.nst-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.nst-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.nst-recap{display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--color-primary) 10%,transparent);border-radius:var(--radius,12px);padding:13px 16px;margin-bottom:16px}
.nst-recap b{font-size:.97rem;font-weight:700;color:var(--color-text)}
.nst-recap span{font-size:.8rem;color:var(--color-text-muted)}
.nst-recap em{font-style:normal;font-weight:800;color:var(--color-primary);margin-top:3px}
.nst-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.nst-form{grid-template-columns:1fr}}
.nst-wide{grid-column:1/-1}
.nst-form label{display:flex;flex-direction:column;gap:4px}
.nst-form label>span{font-size:.74rem;font-weight:700;color:var(--color-text)}
.nst-form label i{font-style:normal;color:var(--color-primary)}
.nst-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.nst-form input,.nst-form textarea{border:1px solid var(--color-border);background:color-mix(in srgb,var(--color-text) 6%,transparent);color:var(--color-text);border-radius:9px;padding:10px 13px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.nst-form input:focus,.nst-form textarea:focus{border-color:var(--color-primary)}
.nst-form small{color:#e07a5f;font-size:.71rem;font-weight:600}
.nst-pay{display:flex;gap:8px}
.nst-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:9px;padding:10px;font-weight:700;font-size:.84rem;cursor:pointer;transition:.14s}
.nst-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 14%,transparent)}
.nst-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.93rem;letter-spacing:.02em;cursor:pointer;transition:.14s}
.nst-cta:hover:not(:disabled){filter:brightness(1.1)}
.nst-cta:disabled{opacity:.4;cursor:not-allowed}
.nst-done{text-align:center}
.nst-done__c{width:58px;height:58px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:6px auto 14px}
.nst-done h3{font-size:1.42rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.nst-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.nst-done__l{list-style:none;margin:0;padding:0;text-align:left}
.nst-done__l li{display:flex;justify-content:space-between;gap:14px;padding:10px 2px;border-top:1px solid var(--color-border)}
.nst-done__l li:first-child{border-top:none}
.nst-done__l i{font-style:normal;font-size:.79rem;color:var(--color-text-muted)}
.nst-done__l b{font-size:.87rem;font-weight:700;color:var(--color-text);text-align:right}
`;
