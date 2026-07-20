"use client";

/**
 * Výchozí adaptivní design — dědí barvy/fonty/radius z CSS proměnných šablony.
 * Použije se jako fallback pro šablony bez vlastního designu.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.22 } };

export function DefaultDesign({ b, sectionId }: DesignProps) {
  const editable = b.step === 0 && !b.done;
  return (
    <section id="rezervace" className="rezd" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rezd-wrap">
        <header className="rezd-header">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.providerSlug ? (
          <div className="rezd-card"><div className="rezd-note">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : null}</div></div>
        ) : (
          <div className="rezd-card">
            {b.loading && <div className="rezd-loading"><span className="rezd-spin" /></div>}
            {b.loadErr && !b.loading && <div className="rezd-note rezd-note--err">{b.loadErr}</div>}
            {!b.loading && !b.loadErr && b.provider && (
              <>
                {!b.done && (
                  <div className="rezd-steps">
                    {["Služba", "Datum", "Čas", "Údaje"].map((label, i) => (
                      <div key={label} className={`rezd-step ${i === b.step ? "is-active" : i < b.step ? "is-done" : ""}`}>
                        <span className="rezd-step__dot">{i < b.step ? "✓" : i + 1}</span>
                        <span className="rezd-step__label">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  {b.step === 0 && (
                    <motion.div key="s0" {...anim}>
                      {b.staff.length > 0 && (
                        <div className="rezd-team">
                          {b.staff.map((m) => (
                            <div key={m.id} className="rezd-team__chip">
                              {m.avatar_url ? <img src={m.avatar_url} alt={m.name} /> : <span className="rezd-team__init" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                              <span>{m.name.split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="rezd-list">
                        {b.services.map((s, i) => (
                          <button key={s.id} className="rezd-service" onClick={() => b.pickService(s)}>
                            <span className="rezd-service__num">{pad(i + 1)}</span>
                            {s.image_url && <img className="rezd-service__img" src={s.image_url} alt="" />}
                            <span className="rezd-service__body">
                              <span className="rezd-service__name">{s.name}</span>
                              {s.description && <span className="rezd-service__desc">{s.description}</span>}
                              <span className="rezd-service__meta"><span>{fmtDuration(s.duration_minutes)}</span><span className="rezd-service__price">{fmtPrice(Number(s.price), s.currency)}</span></span>
                            </span>
                            <span className="rezd-service__arrow" aria-hidden>→</span>
                          </button>
                        ))}
                        {b.services.length === 0 && <div className="rezd-note">Momentálně nejsou k dispozici žádné služby.</div>}
                      </div>
                    </motion.div>
                  )}

                  {b.step === 1 && b.service && (
                    <motion.div key="s1" {...anim}>
                      <Head b={b} onBack={() => b.setStep(0)} title="Vyberte datum" sub={`${b.service.name} · ${fmtDuration(b.service.duration_minutes)}`} />
                      {b.staff.length > 0 && (
                        <div className="rezd-staffpick">
                          <button className={`rezd-pill ${!b.selStaff ? "is-on" : ""}`} onClick={() => b.setSelStaff(null)}>Kdokoli</button>
                          {b.staff.map((m) => <button key={m.id} className={`rezd-pill ${b.selStaff?.id === m.id ? "is-on" : ""}`} onClick={() => b.setSelStaff(b.selStaff?.id === m.id ? null : m)}>{m.name.split(" ")[0]}</button>)}
                        </div>
                      )}
                      <div className="rezd-calnav">
                        <button className="rezd-iconbtn" onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                        <strong>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</strong>
                        <button className="rezd-iconbtn" onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="rezd-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                      {b.datesLoading ? <div className="rezd-loading"><span className="rezd-spin" /></div> : (
                        <div className="rezd-grid">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const avail = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`rezd-day ${avail ? "is-avail" : "is-off"}`} disabled={!avail} onClick={() => avail && b.pickDate(ds)}>{d.getDate()}{avail && <span className="rezd-day__dot" />}</button>;
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {b.step === 2 && b.service && b.date && (
                    <motion.div key="s2" {...anim}>
                      <Head b={b} onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} sub={`${b.service.name} · ${fmtDuration(b.service.duration_minutes)}`} />
                      {b.slotsLoading ? <div className="rezd-loading"><span className="rezd-spin" /></div> : b.slots.length === 0 ? (
                        <div className="rezd-note">Pro tento den nejsou volné termíny. Zkuste jiné datum.</div>
                      ) : (
                        <>
                          <p className="rezd-count"><strong>{b.slots.filter((s) => s.available).length}</strong> volných termínů</p>
                          <div className="rezd-slots">
                            {b.slots.map((s) => <button key={s.time} className={`rezd-slot ${!s.available ? "is-off" : ""}`} disabled={!s.available} onClick={() => b.pickTime(s.time)}>{s.time}</button>)}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {b.step === 3 && b.service && b.date && b.time && (
                    <motion.div key="s3" {...anim}>
                      <Head b={b} onBack={() => b.setStep(2)} title="Vaše údaje" sub="Vyplňte kontaktní informace" />
                      <div className="rezd-summary">
                        <strong>{b.service.name}</strong>
                        {b.selStaff && <span>s {b.selStaff.name}</span>}
                        <span>{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                        <span className="rezd-summary__price">{fmtPrice(Number(b.service.price), b.service.currency)}</span>
                      </div>
                      <div className="rezd-fields">
                        <div className="rezd-field2">
                          <label>Celé jméno *<input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
                          <label>E-mail {b.rules.requireEmail ? "*" : <span className="rezd-opt">(nepovinné)</span>}
                            <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                            {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && (
                              <span className="rezd-hint">Zadejte e-mail ve tvaru jan@email.cz</span>
                            )}
                          </label>
                        </div>
                        <label>Telefon {b.rules.requirePhone ? "*" : <span className="rezd-opt">(nepovinné)</span>}<input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                        <label>Poznámka <span className="rezd-opt">(nepovinné)</span><textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                        {b.paymentMethods > 1 && (
                          <div className="rezd-pay">
                            {b.provider.payment_cash && <button type="button" className={`rezd-payopt ${b.payment === "cash" ? "is-on" : ""}`} onClick={() => b.setPayment("cash")}>Hotově<small>Na místě</small></button>}
                            {b.provider.payment_transfer && <button type="button" className={`rezd-payopt ${b.payment === "transfer" ? "is-on" : ""}`} onClick={() => b.setPayment("transfer")}>Převodem<small>QR v potvrzení</small></button>}
                          </div>
                        )}
                      </div>
                      {b.submitErr && <div className="rezd-note rezd-note--err">{b.submitErr}</div>}
                      <button className="rezd-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>{b.submitting ? "Rezervuji…" : `Potvrdit rezervaci${b.service.price ? ` · ${fmtPrice(Number(b.service.price), b.service.currency)}` : ""}`}</button>
                      <p className="rezd-fine">Po potvrzení obdržíte e-mail s detaily rezervace.</p>
                    </motion.div>
                  )}

                  {b.step === 4 && b.done && b.service && b.date && b.time && (
                    <motion.div key="s4" {...anim} className="rezd-success">
                      <div className="rezd-check">✓</div>
                      <h3>Rezervace potvrzena</h3>
                      <p>Potvrzení jsme poslali na <strong>{b.form.clientEmail}</strong>.</p>
                      <div className="rezd-ticket">
                        <strong>{b.service.name}</strong>
                        <span>{fmtLongDate(b.date)}</span>
                        <span>{b.time} – {addMinutes(b.time, b.totalDuration)}</span>
                        <span>{b.provider.name}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Head({ b, onBack, title, sub }: { b: DesignProps["b"]; onBack: () => void; title: string; sub: string }) {
  void b;
  return (
    <div className="rezd-head">
      <button className="rezd-back" onClick={onBack} aria-label="Zpět">‹</button>
      <div><strong>{title}</strong><span>{sub}</span></div>
    </div>
  );
}

const CSS = `
.rezd{padding:64px 20px}
.rezd-wrap{max-width:620px;margin:0 auto}
.rezd-header{text-align:center;margin-bottom:28px}
.rezd-header h2{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:800;color:var(--color-text);margin:0 0 8px;line-height:1.1}
.rezd-header p{color:var(--color-text-muted);margin:0;font-size:.95rem}
.rezd-card{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.4);padding:22px;box-shadow:0 10px 40px -18px rgba(0,0,0,.28)}
.rezd-loading{display:flex;justify-content:center;padding:48px 0;color:var(--color-text)}
.rezd-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.rezd-note{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:26px 8px}
.rezd-note--err{color:#c0392b}
.rezd-steps{display:flex;gap:6px;margin-bottom:22px}
.rezd-step{display:flex;align-items:center;gap:7px;flex:1;color:var(--color-text-muted);opacity:.5;font-size:.8rem;font-weight:600}
.rezd-step.is-active,.rezd-step.is-done{opacity:1}
.rezd-step__dot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;background:var(--color-border);color:var(--color-text)}
.rezd-step.is-active .rezd-step__dot,.rezd-step.is-done .rezd-step__dot{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.rezd-step__label{white-space:nowrap}
@media(max-width:520px){.rezd-step__label{display:none}}
.rezd-team{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;margin-bottom:16px}
.rezd-team__chip{display:flex;align-items:center;gap:8px;flex:0 0 auto;background:var(--color-bg);border:1px solid var(--color-border);border-radius:999px;padding:5px 14px 5px 5px;font-size:.82rem;font-weight:600;color:var(--color-text)}
.rezd-team__chip img,.rezd-team__init{width:30px;height:30px;border-radius:50%;object-fit:cover}
.rezd-team__init{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.8rem}
.rezd-list{display:flex;flex-direction:column;gap:10px}
.rezd-service{display:flex;align-items:center;gap:14px;text-align:left;width:100%;background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:16px;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;color:var(--color-text)}
.rezd-service:hover{border-color:var(--color-primary);transform:translateY(-1px);box-shadow:0 8px 24px -14px rgba(0,0,0,.3)}
.rezd-service__num{font-weight:800;font-size:1.1rem;color:var(--color-text-muted);opacity:.6;flex:0 0 auto;width:26px}
.rezd-service__img{width:52px;height:52px;border-radius:calc(var(--radius,12px)*.7);object-fit:cover;flex:0 0 auto}
.rezd-service__body{display:flex;flex-direction:column;gap:3px;flex:1;min-width:0}
.rezd-service__name{font-weight:700;font-size:1.02rem}
.rezd-service__desc{font-size:.82rem;color:var(--color-text-muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rezd-service__meta{display:flex;gap:12px;align-items:center;font-size:.8rem;color:var(--color-text-muted);margin-top:2px}
.rezd-service__price{font-weight:700;color:var(--color-primary)}
.rezd-service__arrow{flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 12%,transparent);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-weight:700;transition:background .15s,color .15s}
.rezd-service:hover .rezd-service__arrow{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.rezd-head{display:flex;align-items:center;gap:14px;margin-bottom:18px}
.rezd-back{flex:0 0 auto;width:40px;height:40px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.4rem;line-height:1;cursor:pointer;transition:background .15s,color .15s}
.rezd-back:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.rezd-head strong{display:block;font-size:1.2rem;font-weight:800;color:var(--color-text)}
.rezd-head span{font-size:.85rem;color:var(--color-text-muted)}
.rezd-staffpick{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.rezd-pill{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:999px;padding:7px 15px;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s}
.rezd-pill.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.rezd-calnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.rezd-calnav strong{font-size:1.05rem;font-weight:800;color:var(--color-text)}
.rezd-iconbtn{width:38px;height:38px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:all .15s}
.rezd-iconbtn:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.rezd-iconbtn:disabled{opacity:.3;cursor:not-allowed}
.rezd-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.rezd-dow span{text-align:center;font-size:.72rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.rezd-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.rezd-day{position:relative;aspect-ratio:1;border-radius:calc(var(--radius,12px)*.8);border:1px solid transparent;background:transparent;color:var(--color-text-muted);font-weight:700;font-size:.9rem;cursor:default}
.rezd-day.is-avail{background:color-mix(in srgb,var(--color-primary) 7%,transparent);border-color:var(--color-border);color:var(--color-text);cursor:pointer;transition:all .13s}
.rezd-day.is-avail:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.rezd-day.is-off{opacity:.35}
.rezd-day__dot{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--color-primary)}
.rezd-day.is-avail:hover .rezd-day__dot{background:var(--color-on-primary,#fff)}
.rezd-count{font-size:.85rem;color:var(--color-text-muted);margin:0 0 12px}
.rezd-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}
.rezd-slot{padding:12px 8px;border-radius:var(--radius,12px);border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.9rem;cursor:pointer;transition:all .13s}
.rezd-slot:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.rezd-slot.is-off{opacity:.35;text-decoration:line-through;cursor:not-allowed}
.rezd-summary{background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:14px 16px;margin-bottom:18px;display:flex;flex-direction:column;gap:3px}
.rezd-summary strong{font-size:1.05rem;color:var(--color-text)}
.rezd-summary span{font-size:.85rem;color:var(--color-text-muted)}
.rezd-summary__price{font-weight:800;color:var(--color-primary)!important;font-size:1rem!important;margin-top:2px}
.rezd-fields{display:flex;flex-direction:column;gap:14px}
.rezd-field2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:480px){.rezd-field2{grid-template-columns:1fr}}
.rezd-fields label{display:flex;flex-direction:column;gap:6px;font-size:.85rem;font-weight:700;color:var(--color-text)}
.rezd-opt{font-weight:400;color:var(--color-text-muted)}
.rezd-hint{font-size:.75rem;font-weight:600;color:#c0392b;margin-top:2px}
.rezd-fields input,.rezd-fields textarea{border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*.8);padding:11px 13px;font-size:.92rem;font-weight:400;background:var(--color-bg);color:var(--color-text);font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
.rezd-fields input:focus,.rezd-fields textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 18%,transparent)}
.rezd-pay{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.rezd-payopt{display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid var(--color-border);background:var(--color-bg);border-radius:var(--radius,12px);padding:12px 14px;cursor:pointer;font-weight:700;color:var(--color-text);transition:all .15s}
.rezd-payopt small{font-weight:400;color:var(--color-text-muted)}
.rezd-payopt.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 8%,transparent)}
.rezd-cta{width:100%;margin-top:18px;padding:15px;border:none;border-radius:999px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.98rem;cursor:pointer;transition:transform .12s,filter .15s}
.rezd-cta:hover:not(:disabled){filter:brightness(1.06)}
.rezd-cta:active:not(:disabled){transform:scale(.98)}
.rezd-cta:disabled{opacity:.5;cursor:not-allowed}
.rezd-fine{text-align:center;font-size:.78rem;color:var(--color-text-muted);margin:12px 0 0}
.rezd-success{text-align:center;padding:14px 0}
.rezd-check{width:66px;height:66px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:2rem;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-weight:700}
.rezd-success h3{font-size:1.6rem;font-weight:800;color:var(--color-text);margin:0 0 8px}
.rezd-success>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
.rezd-ticket{display:inline-flex;flex-direction:column;gap:4px;text-align:left;background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:16px 22px}
.rezd-ticket strong{font-size:1.05rem;color:var(--color-text);margin-bottom:2px}
.rezd-ticket span{font-size:.87rem;color:var(--color-text-muted)}
`;
