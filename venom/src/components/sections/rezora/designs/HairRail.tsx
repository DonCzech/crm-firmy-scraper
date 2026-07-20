"use client";

/**
 * hair-03 „Rail" — checkout uspořádání: obsah vlevo, vpravo lepivá karta
 * souhrnu, která se postupně plní a nese hlavní akci. Světlé, vzdušné, hutné.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.18 } };

export function HairRail({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Kadeřník", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="hr" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="hr-wrap">
        <header className="hr-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="hr-grid">
          {/* obsah */}
          <div className="hr-main">
            {!b.done && (
              <div className="hr-crumbs">
                {st.steps.map((l, i) => (
                  <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                    {i < st.vstep && <i>✓</i>}{l}
                  </span>
                ))}
              </div>
            )}

            {b.loading && <div className="hr-load"><span className="hr-spin" /></div>}
            {b.loadErr && !b.loading && <p className="hr-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="hr-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="hr-opts">
                    {b.services.map((svc) => (
                      <button key={svc.id} className="hr-opt" onClick={() => b.pickService(svc)}>
                        <span className="hr-opt__b">
                          <b>{svc.name}</b>
                          {svc.description && <i>{svc.description}</i>}
                          <small>{fmtDuration(svc.duration_minutes)}</small>
                        </span>
                        <span className="hr-opt__p">{fmtPrice(Number(svc.price), svc.currency)}</span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="hr-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <Bar onBack={() => b.setStep(0)} t="Vyberte kadeřníka" />
                    <div className="hr-opts">
                      <button className="hr-opt hr-opt--staff" onClick={() => st.pickStaff(null)}>
                        <span className="hr-av hr-av--any">✦</span>
                        <span className="hr-opt__b"><b>Kdokoli</b><i>nejbližší volný termín</i></span>
                      </button>
                      {b.staff.map((m) => (
                        <button key={m.id} className="hr-opt hr-opt--staff" onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="hr-av" src={m.avatar_url} alt={m.name} />
                            : <span className="hr-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                          <span className="hr-opt__b"><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <Bar onBack={st.backFromCalendar} t="Vyberte datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="hr-card">
                      <div className="hr-mnav">
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                        <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="hr-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                      {b.datesLoading ? <div className="hr-load"><span className="hr-spin" /></div> : (
                        <>
                          <div className="hr-cal">
                            {b.cells.map((d, i) => {
                              if (!d) return <span key={`p${i}`} />;
                              const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                              return <button key={ds} className={`hr-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                            })}
                          </div>
                          {b.dates.size === 0 && (
                            <div className="hr-empty">
                              <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                              <div>
                                <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                                {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiný kadeřník</button>}
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
                    {b.slotsLoading ? <div className="hr-load"><span className="hr-spin" /></div> : b.slots.length === 0 ? (
                      <p className="hr-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="hr-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <Bar onBack={() => b.setStep(2)} t="Vaše údaje" />
                    <div className="hr-form">
                      <label><span>Jméno a příjmení <i>*</i></span>
                        <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                      <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                        {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                      <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                      <label className="hr-wide"><span>Poznámka <em>(nepovinné)</em></span>
                        <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                      {b.paymentMethods > 1 && (
                        <div className="hr-pay hr-wide">
                          {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                          {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                        </div>
                      )}
                    </div>
                    {b.submitErr && <p className="hr-msg hr-msg--err">{b.submitErr}</p>}
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="hr-done">
                    <span className="hr-done__c">✓</span>
                    <h3>Rezervace potvrzena</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* lepivá karta souhrnu */}
          {!b.loading && !b.loadErr && b.provider && (
            <aside className="hr-side">
              <div className="hr-sum">
                <span className="hr-sum__t">{b.done ? "Rezervováno" : "Vaše rezervace"}</span>
                <ul>
                  <li className={b.service ? "is-set" : ""}><i>Služba</i><b>{b.service?.name || "—"}</b></li>
                  {st.hasStaff && <li className={b.selStaff || st.staffChosen ? "is-set" : ""}><i>Kadeřník</i><b>{st.staffChosen ? (b.selStaff?.name || "Kdokoli") : "—"}</b></li>}
                  <li className={b.date ? "is-set" : ""}><i>Datum</i><b>{b.date ? fmtLongDate(b.date) : "—"}</b></li>
                  <li className={b.time ? "is-set" : ""}><i>Čas</i><b>{b.time ? `${b.time} – ${addMinutes(b.time, b.totalDuration)}` : "—"}</b></li>
                </ul>
                <div className="hr-sum__tot">
                  <i>Celkem</i>
                  <b>{b.service ? fmtPrice(Number(b.service.price), b.service.currency) : "—"}</b>
                </div>
                {b.step === 3 && !b.done && (
                  <button className="hr-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                )}
                {!b.done && b.step < 3 && <p className="hr-sum__hint">Vyplňte kroky vlevo</p>}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="hr-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="hr-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.hr{padding:64px 20px}
.hr-wrap{max-width:1000px;margin:0 auto}
.hr-head{margin-bottom:24px}
.hr-head h2{font-size:clamp(1.7rem,3.6vw,2.3rem);font-weight:700;margin:0 0 7px;color:var(--color-text);letter-spacing:-.01em}
.hr-head p{margin:0;color:var(--color-text-muted);font-size:.94rem}
.hr-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:26px;align-items:start}
@media(max-width:860px){.hr-grid{grid-template-columns:1fr}}
.hr-crumbs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.hr-crumbs span{display:inline-flex;align-items:center;gap:5px;font-size:.76rem;font-weight:700;color:var(--color-text-muted);background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:99px;padding:6px 12px}
.hr-crumbs span i{font-style:normal;color:var(--color-primary)}
.hr-crumbs span.is-on{background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.hr-load{display:flex;justify-content:center;padding:46px 0}
.hr-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.hr-msg{color:var(--color-text-muted);font-size:.91rem;padding:20px 0;margin:0}
.hr-msg--err{color:#c0392b}
.hr-opts{display:flex;flex-direction:column;gap:9px}
.hr-opt{display:flex;align-items:center;gap:14px;justify-content:space-between;width:100%;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:15px 17px;cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.hr-opt:hover{border-color:var(--color-primary);box-shadow:0 6px 18px -12px rgba(0,0,0,.35)}
.hr-opt--staff{justify-content:flex-start}
.hr-opt__b{display:flex;flex-direction:column;gap:2px;min-width:0}
.hr-opt__b b{font-size:.98rem;font-weight:700}
.hr-opt__b i{font-style:normal;font-size:.79rem;color:var(--color-text-muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.hr-opt__b small{font-size:.74rem;color:var(--color-text-muted);margin-top:2px}
.hr-opt__p{flex:0 0 auto;font-weight:800;color:var(--color-primary)}
.hr-av{width:42px;height:42px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.hr-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.hr-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.hr-bar button{width:34px;height:34px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.hr-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.hr-bar b{font-size:1.1rem;font-weight:700;color:var(--color-text)}
.hr-bar button.hr-bar__m{width:auto!important;height:auto!important;border-radius:99px!important;padding:6px 12px;font-size:.73rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.hr-card{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:18px}
.hr-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.hr-mnav b{font-weight:700;color:var(--color-text)}
.hr-mnav button{width:31px;height:31px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.hr-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.hr-mnav button:disabled{opacity:.25;cursor:not-allowed}
.hr-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.hr-dow span{text-align:center;font-size:.66rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.hr-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.hr-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.85rem;opacity:.3;border-radius:8px}
.hr-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 8%,transparent);cursor:pointer;transition:.12s}
.hr-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.hr-empty{margin-top:12px;text-align:center}
.hr-empty p{margin:0 0 9px;font-size:.85rem;color:var(--color-text-muted)}
.hr-empty b{color:var(--color-text)}
.hr-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.hr-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.76rem;font-weight:700;cursor:pointer}
.hr-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.hr-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px}
.hr-slots button{padding:12px 6px;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-weight:700;font-size:.88rem;border-radius:9px;cursor:pointer;transition:.12s}
.hr-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.hr-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.hr-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:560px){.hr-form{grid-template-columns:1fr}}
.hr-wide{grid-column:1/-1}
.hr-form label{display:flex;flex-direction:column;gap:5px}
.hr-form label>span{font-size:.75rem;font-weight:700;color:var(--color-text)}
.hr-form label i{font-style:normal;color:var(--color-primary)}
.hr-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.hr-form input,.hr-form textarea{border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:9px;padding:10px 13px;font-size:.92rem;font-family:inherit;outline:none;transition:.14s}
.hr-form input:focus,.hr-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 14%,transparent)}
.hr-form small{color:#c0392b;font-size:.72rem;font-weight:600}
.hr-pay{display:flex;gap:9px}
.hr-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:9px;padding:11px;font-weight:700;font-size:.85rem;cursor:pointer;transition:.14s}
.hr-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.hr-side{position:sticky;top:24px}
@media(max-width:860px){.hr-side{position:static}}
.hr-sum{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.2);padding:19px}
.hr-sum__t{display:block;font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:13px}
.hr-sum ul{list-style:none;margin:0 0 13px;padding:0;display:flex;flex-direction:column;gap:10px}
.hr-sum li{display:flex;flex-direction:column;gap:1px;opacity:.42;transition:opacity .2s}
.hr-sum li.is-set{opacity:1}
.hr-sum li i{font-style:normal;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-muted)}
.hr-sum li b{font-size:.9rem;font-weight:700;color:var(--color-text)}
.hr-sum__tot{display:flex;align-items:baseline;justify-content:space-between;border-top:1px solid var(--color-border);padding-top:12px}
.hr-sum__tot i{font-style:normal;font-size:.8rem;color:var(--color-text-muted)}
.hr-sum__tot b{font-size:1.25rem;font-weight:800;color:var(--color-primary)}
.hr-sum__hint{margin:12px 0 0;font-size:.75rem;color:var(--color-text-muted);text-align:center}
.hr-cta{width:100%;margin-top:14px;padding:13px;border:none;border-radius:9px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.92rem;cursor:pointer;transition:.14s}
.hr-cta:hover:not(:disabled){filter:brightness(1.07)}
.hr-cta:disabled{opacity:.4;cursor:not-allowed}
.hr-done{padding:20px 0}
.hr-done__c{width:56px;height:56px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.hr-done h3{font-size:1.45rem;font-weight:700;margin:0 0 7px;color:var(--color-text)}
.hr-done>p{color:var(--color-text-muted);margin:0;font-size:.92rem}
`;
