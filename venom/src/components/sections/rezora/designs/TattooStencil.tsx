"use client";

/**
 * tattoo-02 „Stencil" — šablonová/technická estetika: čárkované obrysy, svislý
 * otočený pruh s názvem kroku na levém okraji, technické popisky a měřítka.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.17 } };

export function TattooStencil({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Motiv", "Tatér", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="ts" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ts-wrap">
        <header className="ts-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="ts-frame">
          {/* svislý pruh s aktuálním krokem */}
          <div className="ts-spine">
            <span className="ts-spine__t">
              {b.done ? "Potvrzeno" : `${pad(st.vstep + 1)} / ${pad(st.steps.length)} — ${st.steps[st.vstep]}`}
            </span>
          </div>

          <div className="ts-body">
            {b.loading && <div className="ts-load"><span className="ts-spin" /></div>}
            {b.loadErr && !b.loading && <p className="ts-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="ts-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim}>
                    <p className="ts-label">Vyber motiv</p>
                    <div className="ts-list">
                      {b.services.map((svc, i) => (
                        <button key={svc.id} onClick={() => b.pickService(svc)}>
                          <span className="ts-list__n">{pad(i + 1)}</span>
                          <span className="ts-list__b">
                            <b>{svc.name}</b>
                            {svc.description && <i>{svc.description}</i>}
                          </span>
                          <span className="ts-list__m">
                            <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                            <small>{fmtDuration(svc.duration_minutes)}</small>
                          </span>
                        </button>
                      ))}
                      {b.services.length === 0 && <p className="ts-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                    </div>
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <Bar onBack={() => b.setStep(0)} t="Vyber tatéra" />
                    <div className="ts-staff">
                      <button onClick={() => st.pickStaff(null)}>
                        <span className="ts-av ts-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                      </button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="ts-av" src={m.avatar_url} alt={m.name} />
                            : <span className="ts-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                          <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <Bar onBack={st.backFromCalendar} t="Vyber datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="ts-cal-box">
                      <div className="ts-mnav">
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                        <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="ts-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                      {b.datesLoading ? <div className="ts-load"><span className="ts-spin" /></div> : (
                        <>
                          <div className="ts-cal">
                            {b.cells.map((d, i) => {
                              if (!d) return <span key={`p${i}`} />;
                              const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                              return <button key={ds} className={`ts-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                            })}
                          </div>
                          {b.dates.size === 0 && (
                            <div className="ts-empty">
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

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <Bar onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                    {b.slotsLoading ? <div className="ts-load"><span className="ts-spin" /></div> : b.slots.length === 0 ? (
                      <p className="ts-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="ts-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <Bar onBack={() => b.setStep(2)} t="Tvoje údaje" />
                    <dl className="ts-spec">
                      <div><dt>Motiv</dt><dd>{b.service.name}</dd></div>
                      {b.selStaff && <div><dt>Tatér</dt><dd>{b.selStaff.name}</dd></div>}
                      <div><dt>Termín</dt><dd>{fmtLongDate(b.date)}, {b.time}–{addMinutes(b.time, b.totalDuration)}</dd></div>
                      <div><dt>Cena</dt><dd className="ts-spec__p">{fmtPrice(Number(b.service.price), b.service.currency)}</dd></div>
                    </dl>
                    <div className="ts-form">
                      <label><span>Jméno a příjmení <i>*</i></span>
                        <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
                      <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                        {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}</label>
                      <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                      <label className="ts-wide"><span>Popis motivu <em>(nepovinné)</em></span>
                        <textarea rows={3} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} placeholder="Umístění, velikost, styl, reference…" /></label>
                      {b.paymentMethods > 1 && (
                        <div className="ts-pay ts-wide">
                          {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                          {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                        </div>
                      )}
                    </div>
                    {b.submitErr && <p className="ts-msg ts-msg--err">{b.submitErr}</p>}
                    <button className="ts-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="ts-done">
                    <span className="ts-done__c">✓</span>
                    <h3>Rezervace potvrzena</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <dl className="ts-spec">
                      <div><dt>Motiv</dt><dd>{b.service.name}</dd></div>
                      <div><dt>Tatér</dt><dd>{b.selStaff ? b.selStaff.name : b.provider.name}</dd></div>
                      <div><dt>Datum</dt><dd>{fmtLongDate(b.date)}</dd></div>
                      <div><dt>Čas</dt><dd>{b.time} – {addMinutes(b.time, b.totalDuration)}</dd></div>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="ts-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <p className="ts-label ts-label--bar">{t}</p>
      {meta && <button className="ts-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.ts{padding:64px 20px}
.ts-wrap{max-width:720px;margin:0 auto}
.ts-head{margin-bottom:22px}
.ts-head h2{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:800;margin:0 0 8px;color:var(--color-text);letter-spacing:-.01em}
.ts-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.ts-frame{display:grid;grid-template-columns:46px minmax(0,1fr);border:1.5px dashed var(--color-border)}
@media(max-width:560px){.ts-frame{grid-template-columns:32px minmax(0,1fr)}}
.ts-spine{border-right:1.5px dashed var(--color-border);display:flex;align-items:center;justify-content:center;padding:16px 0;background:color-mix(in srgb,var(--color-primary) 6%,transparent)}
.ts-spine__t{writing-mode:vertical-rl;transform:rotate(180deg);font-size:.68rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--color-primary);white-space:nowrap}
.ts-body{padding:22px}
@media(max-width:560px){.ts-body{padding:16px}}
.ts-load{display:flex;justify-content:center;padding:42px 0}
.ts-spin{width:24px;height:24px;border-radius:50%;border:2.5px dashed var(--color-primary);animation:rezspin 1.4s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.ts-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.ts-msg--err{color:#e0573f}
.ts-label{font-size:.68rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--color-text-muted);margin:0 0 14px}
.ts-label--bar{margin:0;color:var(--color-text);font-size:.9rem;letter-spacing:.06em}
.ts-list{display:flex;flex-direction:column}
.ts-list button{display:flex;align-items:center;gap:14px;width:100%;background:none;border:none;border-top:1.5px dashed var(--color-border);padding:14px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.ts-list button:last-child{border-bottom:1.5px dashed var(--color-border)}
.ts-list button:hover{padding-left:12px}
.ts-list button:hover .ts-list__n{color:var(--color-primary)}
.ts-list__n{font-size:.7rem;font-weight:800;letter-spacing:.1em;color:var(--color-text-muted);flex:0 0 auto;transition:.14s}
.ts-list__b{flex:1;min-width:0}
.ts-list__b b{display:block;font-size:1rem;font-weight:800}
.ts-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);margin-top:2px}
.ts-list__m{flex:0 0 auto;text-align:right}
.ts-list__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary)}
.ts-list__m small{font-size:.72rem;color:var(--color-text-muted)}
.ts-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.ts-bar button{width:34px;height:34px;border:1.5px dashed var(--color-border);background:none;color:var(--color-text);font-size:1.15rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.ts-bar button:hover{border-style:solid;border-color:var(--color-primary);color:var(--color-primary)}
.ts-bar button.ts-bar__m{width:auto;height:auto;padding:6px 11px;font-size:.7rem;font-weight:800;margin-left:auto;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em}
.ts-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(124px,1fr));gap:10px}
.ts-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:15px 9px;background:none;border:1.5px dashed var(--color-border);cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.ts-staff button:hover{border-style:solid;border-color:var(--color-primary)}
.ts-staff b{font-size:.88rem;font-weight:800}
.ts-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.ts-av{width:52px;height:52px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.ts-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.ts-cal-box{max-width:400px}
.ts-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.ts-mnav b{font-weight:800;font-size:.94rem;color:var(--color-text);text-transform:uppercase;letter-spacing:.04em}
.ts-mnav button{width:30px;height:30px;border:1.5px dashed var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.ts-mnav button:hover:not(:disabled){border-style:solid;border-color:var(--color-primary);color:var(--color-primary)}
.ts-mnav button:disabled{opacity:.25;cursor:not-allowed}
.ts-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.ts-dow span{text-align:center;font-size:.62rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em}
.ts-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.ts-day{aspect-ratio:1;border:1.5px dashed transparent;background:none;color:var(--color-text-muted);font-weight:700;font-size:.84rem;opacity:.25}
.ts-day.is-av{opacity:1;color:var(--color-text);border-color:var(--color-border);cursor:pointer;transition:.12s}
.ts-day.is-av:hover{border-style:solid;border-color:var(--color-primary);color:var(--color-primary)}
.ts-empty{margin-top:12px;text-align:center}
.ts-empty p{margin:0 0 9px;font-size:.83rem;color:var(--color-text-muted)}
.ts-empty b{color:var(--color-text)}
.ts-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.ts-empty button{background:none;border:1.5px dashed var(--color-border);color:var(--color-text);padding:7px 12px;font-size:.73rem;font-weight:800;cursor:pointer;text-transform:uppercase;letter-spacing:.05em}
.ts-empty button:hover{border-style:solid;border-color:var(--color-primary);color:var(--color-primary)}
.ts-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:6px}
.ts-slots button{padding:11px 5px;border:1.5px dashed var(--color-border);background:none;color:var(--color-text);font-weight:800;font-size:.86rem;cursor:pointer;transition:.12s}
.ts-slots button:hover:not(.is-off){border-style:solid;border-color:var(--color-primary);color:var(--color-primary)}
.ts-slots button.is-off{opacity:.25;text-decoration:line-through;cursor:not-allowed}
.ts-spec{margin:0 0 18px;padding:0;display:flex;flex-direction:column}
.ts-spec div{display:flex;justify-content:space-between;gap:14px;padding:8px 0;border-top:1.5px dashed var(--color-border)}
.ts-spec div:first-child{border-top:none}
.ts-spec dt{font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-muted)}
.ts-spec dd{margin:0;font-size:.88rem;font-weight:700;color:var(--color-text);text-align:right}
.ts-spec__p{color:var(--color-primary)!important;font-weight:800}
.ts-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.ts-form{grid-template-columns:1fr}}
.ts-wide{grid-column:1/-1}
.ts-form label{display:flex;flex-direction:column;gap:5px}
.ts-form label>span{font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text)}
.ts-form label i{font-style:normal;color:var(--color-primary)}
.ts-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.ts-form input,.ts-form textarea{border:1.5px dashed var(--color-border);background:none;color:var(--color-text);padding:10px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.ts-form input:focus,.ts-form textarea:focus{border-style:solid;border-color:var(--color-primary)}
.ts-form small{color:#e0573f;font-size:.71rem;font-weight:700}
.ts-pay{display:flex;gap:9px}
.ts-pay button{flex:1;border:1.5px dashed var(--color-border);background:none;color:var(--color-text);padding:11px;font-weight:800;font-size:.82rem;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;transition:.14s}
.ts-pay button.is-on{border-style:solid;border-color:var(--color-primary);color:var(--color-primary)}
.ts-cta{width:100%;margin-top:18px;padding:15px;border:1.5px solid var(--color-primary);background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.92rem;text-transform:uppercase;letter-spacing:.08em;cursor:pointer;transition:.14s}
.ts-cta:hover:not(:disabled){filter:brightness(1.1)}
.ts-cta:disabled{opacity:.4;cursor:not-allowed}
.ts-done{text-align:center}
.ts-done__c{width:56px;height:56px;border:1.5px dashed var(--color-primary);color:var(--color-primary);font-size:1.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.ts-done h3{font-size:1.4rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.ts-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.ts-done .ts-spec{text-align:left;margin-bottom:0}
`;
