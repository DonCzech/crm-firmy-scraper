"use client";

/**
 * tattoo-03 „Gallery" — portfolio: výběr motivu jako obrazová mřížka s textem
 * v přetisku; po výběru se přes ni vysune spodní panel, ve kterém běží zbytek
 * toku. Nahoře zůstane pruh s vybraným motivem.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.18 } };
const sheet = { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 26 }, transition: { duration: 0.26 } };

export function TattooGallery({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Motiv", "Tatér", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="tg" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tg-wrap">
        <header className="tg-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {b.loading && <div className="tg-load"><span className="tg-spin" /></div>}
        {b.loadErr && !b.loading && <p className="tg-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="tg-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <>
            {/* galerie motivů */}
            {b.step === 0 && (
              <motion.div key="g" {...anim} className="tg-grid">
                {b.services.map((svc) => (
                  <button key={svc.id} className="tg-tile" onClick={() => b.pickService(svc)}>
                    {svc.image_url
                      ? <img src={svc.image_url} alt="" />
                      : <span className="tg-tile__ph" aria-hidden />}
                    <span className="tg-tile__veil" aria-hidden />
                    <span className="tg-tile__t">
                      <b>{svc.name}</b>
                      <span><em>{fmtPrice(Number(svc.price), svc.currency)}</em> · {fmtDuration(svc.duration_minutes)}</span>
                    </span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="tg-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {/* pruh s vybraným motivem + spodní panel */}
            {b.step > 0 && b.service && (
              <>
                <div className="tg-picked">
                  {b.service.image_url && <img src={b.service.image_url} alt="" />}
                  <span>
                    <i>Vybraný motiv</i>
                    <b>{b.service.name}</b>
                  </span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                  {!b.done && <button onClick={() => b.setStep(0)}>změnit</button>}
                </div>

                <motion.div key="sheet" {...sheet} className="tg-sheet">
                  <span className="tg-grip" aria-hidden />
                  {!b.done && (
                    <div className="tg-steps">
                      {st.steps.map((l, i) => (
                        <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
                      ))}
                    </div>
                  )}

                  <AnimatePresence mode="wait" initial={false}>
                    {st.showStaffPicker && (
                      <motion.div key="s1a" {...anim}>
                        <Bar onBack={() => b.setStep(0)} t="Kdo tě potetuje?" />
                        <div className="tg-staff">
                          <button onClick={() => st.pickStaff(null)}>
                            <span className="tg-av tg-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                          </button>
                          {b.staff.map((m) => (
                            <button key={m.id} onClick={() => st.pickStaff(m)}>
                              {m.avatar_url ? <img className="tg-av" src={m.avatar_url} alt={m.name} />
                                : <span className="tg-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                              <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {st.showCalendar && (
                      <motion.div key="s1b" {...anim}>
                        <Bar onBack={st.backFromCalendar} t="Vyber datum"
                          meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                          onMeta={() => st.setStaffChosen(false)} />
                        <div className="tg-cal-box">
                          <div className="tg-mnav">
                            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                            <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                          </div>
                          <div className="tg-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                          {b.datesLoading ? <div className="tg-load"><span className="tg-spin" /></div> : (
                            <>
                              <div className="tg-cal">
                                {b.cells.map((d, i) => {
                                  if (!d) return <span key={`p${i}`} />;
                                  const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                                  return <button key={ds} className={`tg-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                                })}
                              </div>
                              {b.dates.size === 0 && (
                                <div className="tg-empty">
                                  <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                                  <div>
                                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                                    {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiný tatér</button>}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {b.step === 2 && b.date && (
                      <motion.div key="s2" {...anim}>
                        <Bar onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                        {b.slotsLoading ? <div className="tg-load"><span className="tg-spin" /></div> : b.slots.length === 0 ? (
                          <p className="tg-msg">Pro tento den nejsou volné termíny.</p>
                        ) : (
                          <div className="tg-slots">
                            {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {b.step === 3 && b.date && b.time && (
                      <motion.div key="s3" {...anim}>
                        <Bar onBack={() => b.setStep(2)} t="Tvoje údaje" />
                        <div className="tg-form">
                          <label><span>Jméno a příjmení <i>*</i></span>
                            <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
                          <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                            <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                            {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}</label>
                          <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                            <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                          <label className="tg-wide"><span>Popis motivu <em>(nepovinné)</em></span>
                            <textarea rows={3} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} placeholder="Umístění, velikost, styl, reference…" /></label>
                          {b.paymentMethods > 1 && (
                            <div className="tg-pay tg-wide">
                              {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                              {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                            </div>
                          )}
                        </div>
                        {b.submitErr && <p className="tg-msg tg-msg--err">{b.submitErr}</p>}
                        <button className="tg-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                          {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                        </button>
                      </motion.div>
                    )}

                    {b.step === 4 && b.done && b.date && b.time && (
                      <motion.div key="s4" {...anim} className="tg-done">
                        <span className="tg-done__c">✓</span>
                        <h3>Rezervace potvrzena</h3>
                        <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                        <ul className="tg-done__l">
                          <li><i>Tatér</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                          <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                          <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="tg-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="tg-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.tg{padding:64px 20px}
.tg-wrap{max-width:860px;margin:0 auto}
.tg-head{text-align:center;margin-bottom:22px}
.tg-head h2{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:800;margin:0 0 8px;color:var(--color-text);letter-spacing:-.02em}
.tg-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.tg-load{display:flex;justify-content:center;padding:44px 0}
.tg-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.tg-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.tg-msg--err{color:#ff6b5a}
.tg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:10px}
.tg-tile{position:relative;aspect-ratio:3/4;border:none;padding:0;overflow:hidden;cursor:pointer;border-radius:var(--radius,12px);background:var(--color-surface,#111)}
.tg-tile img{width:100%;height:100%;object-fit:cover;transition:transform .5s;filter:grayscale(.5)}
.tg-tile:hover img{transform:scale(1.06);filter:grayscale(0)}
.tg-tile__ph{display:block;width:100%;height:100%;background:linear-gradient(150deg,color-mix(in srgb,var(--color-primary) 45%,#000),color-mix(in srgb,var(--color-primary) 10%,#000))}
.tg-tile__veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88) 6%,rgba(0,0,0,.25) 46%,transparent 72%)}
.tg-tile__t{position:absolute;left:0;right:0;bottom:0;padding:16px;text-align:left;display:flex;flex-direction:column;gap:3px}
.tg-tile__t b{font-size:1.05rem;font-weight:800;color:#fff;line-height:1.15}
.tg-tile__t span{font-size:.79rem;color:rgba(255,255,255,.75)}
.tg-tile__t em{font-style:normal;font-weight:800;color:var(--color-primary)}
.tg-picked{display:flex;align-items:center;gap:14px;background:var(--color-surface,#111);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:10px 16px 10px 10px;margin-bottom:12px}
.tg-picked img{width:52px;height:52px;object-fit:cover;border-radius:calc(var(--radius,12px)*.6);flex:0 0 auto}
.tg-picked span{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.tg-picked i{font-style:normal;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.11em;color:var(--color-text-muted)}
.tg-picked b{font-size:.98rem;font-weight:800;color:var(--color-text)}
.tg-picked em{font-style:normal;font-weight:800;color:var(--color-primary);flex:0 0 auto}
.tg-picked>button{flex:0 0 auto;background:none;border:1px solid var(--color-border);color:var(--color-text-muted);border-radius:99px;padding:6px 12px;font-size:.72rem;font-weight:800;cursor:pointer;transition:.14s}
.tg-picked>button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.tg-sheet{background:var(--color-surface,#111);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.8);padding:14px 22px 24px}
.tg-grip{display:block;width:44px;height:4px;border-radius:99px;background:var(--color-border);margin:0 auto 16px}
.tg-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.tg-steps span{font-size:.7rem;font-weight:800;color:var(--color-text-muted);border:1px solid var(--color-border);border-radius:99px;padding:5px 11px;opacity:.55}
.tg-steps span.is-on{opacity:1;background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.tg-steps span.is-done{opacity:1;color:var(--color-primary);border-color:color-mix(in srgb,var(--color-primary) 50%,transparent)}
.tg-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.tg-bar button{width:36px;height:36px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.tg-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.tg-bar b{font-size:1.08rem;font-weight:800;color:var(--color-text)}
.tg-bar button.tg-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 12px;font-size:.72rem;font-weight:800;margin-left:auto;color:var(--color-text-muted)}
.tg-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(122px,1fr));gap:10px}
.tg-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:15px 9px;background:none;border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);text-align:center;transition:.15s}
.tg-staff button:hover{border-color:var(--color-primary)}
.tg-staff b{font-size:.89rem;font-weight:800}
.tg-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.tg-av{width:52px;height:52px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.tg-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.tg-cal-box{max-width:400px;margin:0 auto}
.tg-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.tg-mnav b{font-weight:800;color:var(--color-text)}
.tg-mnav button{width:31px;height:31px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.tg-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tg-mnav button:disabled{opacity:.25;cursor:not-allowed}
.tg-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.tg-dow span{text-align:center;font-size:.65rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.tg-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.tg-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.85rem;opacity:.28;border-radius:9px}
.tg-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-text) 8%,transparent);cursor:pointer;transition:.12s}
.tg-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tg-empty{margin-top:12px;text-align:center}
.tg-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.tg-empty b{color:var(--color-text)}
.tg-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.tg-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.75rem;font-weight:800;cursor:pointer}
.tg-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.tg-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:7px}
.tg-slots button{padding:11px 6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:800;font-size:.87rem;border-radius:9px;cursor:pointer;transition:.12s}
.tg-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.tg-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.tg-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.tg-form{grid-template-columns:1fr}}
.tg-wide{grid-column:1/-1}
.tg-form label{display:flex;flex-direction:column;gap:4px}
.tg-form label>span{font-size:.73rem;font-weight:800;color:var(--color-text)}
.tg-form label i{font-style:normal;color:var(--color-primary)}
.tg-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.tg-form input,.tg-form textarea{border:1px solid var(--color-border);background:color-mix(in srgb,var(--color-text) 5%,transparent);color:var(--color-text);border-radius:9px;padding:10px 13px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.tg-form input:focus,.tg-form textarea:focus{border-color:var(--color-primary)}
.tg-form small{color:#ff6b5a;font-size:.71rem;font-weight:700}
.tg-pay{display:flex;gap:8px}
.tg-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:9px;padding:10px;font-weight:800;font-size:.84rem;cursor:pointer;transition:.14s}
.tg-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 14%,transparent)}
.tg-cta{width:100%;margin-top:16px;padding:15px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.93rem;cursor:pointer;transition:.14s}
.tg-cta:hover:not(:disabled){filter:brightness(1.1)}
.tg-cta:disabled{opacity:.4;cursor:not-allowed}
.tg-done{text-align:center}
.tg-done__c{width:58px;height:58px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.tg-done h3{font-size:1.42rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.tg-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.tg-done__l{list-style:none;margin:0;padding:0;text-align:left}
.tg-done__l li{display:flex;justify-content:space-between;gap:14px;padding:10px 2px;border-top:1px solid var(--color-border)}
.tg-done__l li:first-child{border-top:none}
.tg-done__l i{font-style:normal;font-size:.79rem;color:var(--color-text-muted)}
.tg-done__l b{font-size:.87rem;font-weight:800;color:var(--color-text);text-align:right}
`;
