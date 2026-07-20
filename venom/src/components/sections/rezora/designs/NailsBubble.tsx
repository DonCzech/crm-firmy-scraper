"use client";

/**
 * nails-02 „Bubble" — mobile-first: jedna otázka na obrazovku, velké dotykové
 * bubliny, kroky jako tečky, spodní pruh postupu. Minimum rámů a linek.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.97 }, transition: { duration: 0.18 } };

export function NailsBubble({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Manikérka", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;
  const pct = b.done ? 100 : Math.round(((st.vstep + 1) / st.steps.length) * 100);

  return (
    <section id="rezervace" className="nb" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="nb-wrap">
        <header className="nb-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {b.loading && <div className="nb-load"><span className="nb-spin" /></div>}
        {b.loadErr && !b.loading && <p className="nb-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="nb-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <>
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim}>
                  <p className="nb-q">Co si dáte?</p>
                  <div className="nb-bubbles">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <b>{svc.name}</b>
                        <span>{fmtDuration(svc.duration_minutes)}</span>
                        <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="nb-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </div>
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <Q onBack={() => b.setStep(0)} t="Ke komu?" />
                  <div className="nb-people">
                    <button onClick={() => st.pickStaff(null)}>
                      <span className="nb-av nb-av--any">✦</span><b>Kdokoli</b>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="nb-av" src={m.avatar_url} alt={m.name} />
                          : <span className="nb-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                        <b>{m.name.split(" ")[0]}</b>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <Q onBack={st.backFromCalendar} t="Kdy?"
                    meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={() => st.setStaffChosen(false)} />
                  <div className="nb-cal-box">
                    <div className="nb-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="nb-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="nb-load"><span className="nb-spin" /></div> : (
                      <>
                        <div className="nb-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`nb-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && (
                          <div className="nb-empty">
                            <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                            <div>
                              <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                              {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiná manikérka</button>}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <Q onBack={() => b.setStep(1)} t="V kolik?" sub={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="nb-load"><span className="nb-spin" /></div> : b.slots.length === 0 ? (
                    <p className="nb-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="nb-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <Q onBack={() => b.setStep(2)} t="Kam potvrzení?" />
                  <div className="nb-form">
                    <label><span>Jméno a příjmení <i>*</i></span>
                      <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                    <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                      {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                    <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                    <label><span>Poznámka <em>(nepovinné)</em></span>
                      <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                    {b.paymentMethods > 1 && (
                      <div className="nb-pay">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="nb-msg nb-msg--err">{b.submitErr}</p>}
                  <button className="nb-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : `Potvrdit · ${fmtPrice(Number(b.service.price), b.service.currency)}`}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="nb-done">
                  <span className="nb-done__c">✓</span>
                  <h3>Hotovo!</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <div className="nb-done__b">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? b.selStaff.name : b.provider.name}</span>
                    <span>{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!b.done && (
              <div className="nb-prog">
                <div><span style={{ width: `${pct}%` }} /></div>
                <small>{st.steps[st.vstep]} — krok {st.vstep + 1} z {st.steps.length}</small>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Q({ onBack, t, sub, meta, onMeta }: { onBack: () => void; t: string; sub?: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="nb-qbar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <span><p className="nb-q">{t}</p>{sub && <small>{sub}</small>}</span>
      {meta && <button className="nb-qbar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.nb{padding:64px 20px}
.nb-wrap{max-width:520px;margin:0 auto}
.nb-head{text-align:center;margin-bottom:26px}
.nb-head h2{font-size:clamp(1.7rem,4vw,2.2rem);font-weight:800;margin:0 0 7px;color:var(--color-text);letter-spacing:-.02em}
.nb-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.nb-load{display:flex;justify-content:center;padding:44px 0}
.nb-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.nb-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.nb-msg--err{color:#c0392b}
.nb-q{font-size:1.55rem;font-weight:800;color:var(--color-text);margin:0 0 16px;letter-spacing:-.02em}
.nb-qbar{display:flex;align-items:center;gap:12px;margin-bottom:6px;flex-wrap:wrap}
.nb-qbar button{width:38px;height:38px;border-radius:50%;border:none;background:var(--color-surface,#fff);color:var(--color-text);font-size:1.3rem;cursor:pointer;transition:.15s;flex:0 0 auto;box-shadow:0 4px 12px -6px rgba(0,0,0,.3)}
.nb-qbar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nb-qbar>span{display:flex;flex-direction:column}
.nb-qbar .nb-q{margin:0}
.nb-qbar small{font-size:.78rem;color:var(--color-text-muted)}
.nb-qbar button.nb-qbar__m{width:auto;height:auto;border-radius:99px;padding:7px 13px;font-size:.73rem;font-weight:800;margin-left:auto;color:var(--color-text-muted);box-shadow:none;border:1px solid var(--color-border)}
.nb-bubbles{display:flex;flex-direction:column;gap:11px}
.nb-bubbles button{display:flex;align-items:center;gap:12px;width:100%;background:var(--color-surface,#fff);border:none;border-radius:99px;padding:18px 26px;cursor:pointer;color:var(--color-text);text-align:left;transition:.16s;box-shadow:0 6px 18px -12px rgba(0,0,0,.35)}
.nb-bubbles button:hover{transform:translateY(-2px);box-shadow:0 12px 26px -14px color-mix(in srgb,var(--color-primary) 70%,transparent)}
.nb-bubbles b{font-size:1.02rem;font-weight:800;flex:1;min-width:0}
.nb-bubbles span{font-size:.78rem;color:var(--color-text-muted);flex:0 0 auto}
.nb-bubbles em{font-style:normal;font-weight:800;color:var(--color-primary);flex:0 0 auto}
.nb-people{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.nb-people button{display:flex;align-items:center;gap:10px;background:var(--color-surface,#fff);border:none;border-radius:99px;padding:7px 20px 7px 7px;cursor:pointer;color:var(--color-text);transition:.16s;box-shadow:0 5px 14px -10px rgba(0,0,0,.3)}
.nb-people button:hover{transform:translateY(-2px)}
.nb-people b{font-size:.94rem;font-weight:800}
.nb-av{width:44px;height:44px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.nb-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.nb-cal-box{background:var(--color-surface,#fff);border-radius:calc(var(--radius,12px)*2);padding:18px;margin-top:14px;box-shadow:0 8px 24px -16px rgba(0,0,0,.3)}
.nb-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.nb-mnav b{font-weight:800;color:var(--color-text)}
.nb-mnav button{width:32px;height:32px;border-radius:50%;border:none;background:var(--color-bg);color:var(--color-text);cursor:pointer}
.nb-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nb-mnav button:disabled{opacity:.25;cursor:not-allowed}
.nb-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.nb-dow span{text-align:center;font-size:.65rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.nb-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.nb-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.86rem;opacity:.3;border-radius:50%}
.nb-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.nb-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nb-empty{margin-top:12px;text-align:center}
.nb-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.nb-empty b{color:var(--color-text)}
.nb-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.nb-empty button{background:var(--color-bg);border:none;color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.76rem;font-weight:800;cursor:pointer}
.nb-empty button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nb-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px;margin-top:14px}
.nb-slots button{padding:14px 6px;border:none;background:var(--color-surface,#fff);color:var(--color-text);font-weight:800;font-size:.92rem;border-radius:99px;cursor:pointer;transition:.14s;box-shadow:0 5px 14px -10px rgba(0,0,0,.3)}
.nb-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);transform:translateY(-2px)}
.nb-slots button.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed;box-shadow:none}
.nb-form{display:flex;flex-direction:column;gap:12px;margin-top:14px}
.nb-form label{display:flex;flex-direction:column;gap:5px}
.nb-form label>span{font-size:.76rem;font-weight:800;color:var(--color-text);padding-left:14px}
.nb-form label i{font-style:normal;color:var(--color-primary)}
.nb-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.nb-form input,.nb-form textarea{border:none;background:var(--color-surface,#fff);color:var(--color-text);border-radius:99px;padding:14px 20px;font-size:.94rem;font-family:inherit;outline:none;transition:.14s;box-shadow:0 4px 12px -8px rgba(0,0,0,.28)}
.nb-form textarea{border-radius:20px}
.nb-form input:focus,.nb-form textarea:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 24%,transparent)}
.nb-form small{color:#c0392b;font-size:.72rem;font-weight:700;padding-left:14px}
.nb-pay{display:flex;gap:9px}
.nb-pay button{flex:1;border:none;background:var(--color-surface,#fff);color:var(--color-text);border-radius:99px;padding:13px;font-weight:800;font-size:.86rem;cursor:pointer;transition:.14s;box-shadow:0 4px 12px -8px rgba(0,0,0,.28)}
.nb-pay button.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.nb-cta{width:100%;margin-top:16px;padding:17px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:1rem;cursor:pointer;transition:.14s}
.nb-cta:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}
.nb-cta:disabled{opacity:.4;cursor:not-allowed}
.nb-prog{margin-top:26px;text-align:center}
.nb-prog div{height:6px;background:var(--color-border);border-radius:99px;overflow:hidden}
.nb-prog div span{display:block;height:100%;background:var(--color-primary);border-radius:99px;transition:width .4s cubic-bezier(.4,0,.2,1)}
.nb-prog small{display:block;margin-top:8px;font-size:.74rem;font-weight:700;color:var(--color-text-muted)}
.nb-done{text-align:center;padding:12px 0}
.nb-done__c{width:70px;height:70px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:2rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.nb-done h3{font-size:1.7rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.nb-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
.nb-done__b{display:flex;flex-direction:column;gap:4px;background:var(--color-surface,#fff);border-radius:calc(var(--radius,12px)*2);padding:18px 24px;box-shadow:0 8px 24px -16px rgba(0,0,0,.3)}
.nb-done__b b{font-size:1.05rem;font-weight:800;color:var(--color-text)}
.nb-done__b span{font-size:.86rem;color:var(--color-text-muted)}
`;
