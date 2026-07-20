"use client";

/**
 * hair-04 „Timeline" — svislá osa: spojnice vlevo, každý krok je uzel s obsahem
 * odsazeným vpravo. Hotové uzly zůstanou jako záznam, aktivní je zvýrazněný.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 }, transition: { duration: 0.18 } };

export function HairTimeline({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Kadeřník", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="ht" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ht-wrap">
        <header className="ht-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {b.loading && <div className="ht-load"><span className="ht-spin" /></div>}
        {b.loadErr && !b.loading && <p className="ht-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="ht-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          b.done && b.service && b.date && b.time ? (
            <div className="ht-done">
              <span className="ht-done__c">✓</span>
              <h3>Rezervace potvrzena</h3>
              <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
              <ul className="ht-done__l">
                <li><i>Služba</i><b>{b.service.name}</b></li>
                <li><i>Kadeřník</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
              </ul>
            </div>
          ) : (
            <ol className="ht-line">
              {/* 1 — Služba */}
              <Node n={1} label="Služba" state={b.step > 0 ? "done" : "on"}
                value={b.service ? `${b.service.name} · ${fmtPrice(Number(b.service.price), b.service.currency)}` : ""}
                onEdit={b.step > 0 ? () => b.setStep(0) : undefined}>
                <AnimatePresence mode="wait" initial={false}>
                  {b.step === 0 && (
                    <motion.ul key="c" {...anim} className="ht-opts">
                      {b.services.map((svc) => (
                        <li key={svc.id}>
                          <button onClick={() => b.pickService(svc)}>
                            <span><b>{svc.name}</b><i>{fmtDuration(svc.duration_minutes)}</i></span>
                            <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                          </button>
                        </li>
                      ))}
                      {b.services.length === 0 && <p className="ht-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </Node>

              {/* 2 — Kadeřník */}
              {st.hasStaff && (
                <Node n={2} label="Kadeřník"
                  state={st.staffChosen ? "done" : st.showStaffPicker ? "on" : "off"}
                  value={st.staffChosen ? (b.selStaff?.name || "Kdokoli") : ""}
                  onEdit={st.staffChosen ? () => st.setStaffChosen(false) : undefined}>
                  <AnimatePresence mode="wait" initial={false}>
                    {st.showStaffPicker && (
                      <motion.div key="c" {...anim} className="ht-staff">
                        <button onClick={() => st.pickStaff(null)}>
                          <span className="ht-av ht-av--any">✦</span><b>Kdokoli</b>
                        </button>
                        {b.staff.map((m) => (
                          <button key={m.id} onClick={() => st.pickStaff(m)}>
                            {m.avatar_url ? <img className="ht-av" src={m.avatar_url} alt={m.name} />
                              : <span className="ht-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                            <b>{m.name.split(" ")[0]}</b>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Node>
              )}

              {/* 3 — Datum */}
              <Node n={st.hasStaff ? 3 : 2} label="Datum"
                state={b.date ? "done" : st.showCalendar ? "on" : "off"}
                value={b.date ? fmtLongDate(b.date) : ""}
                onEdit={b.date ? () => b.setStep(1) : undefined}>
                <AnimatePresence mode="wait" initial={false}>
                  {st.showCalendar && (
                    <motion.div key="c" {...anim}>
                      <div className="ht-mnav">
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                        <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="ht-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                      {b.datesLoading ? <div className="ht-load"><span className="ht-spin" /></div> : (
                        <>
                          <div className="ht-cal">
                            {b.cells.map((d, i) => {
                              if (!d) return <span key={`p${i}`} />;
                              const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                              return <button key={ds} className={`ht-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                            })}
                          </div>
                          {b.dates.size === 0 && (
                            <div className="ht-empty">
                              <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                              <div>
                                <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                                {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiný kadeřník</button>}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Node>

              {/* 4 — Čas */}
              <Node n={st.hasStaff ? 4 : 3} label="Čas"
                state={b.time ? "done" : b.step === 2 ? "on" : "off"}
                value={b.time ? `${b.time} – ${addMinutes(b.time, b.totalDuration)}` : ""}
                onEdit={b.time ? () => b.setStep(2) : undefined}>
                <AnimatePresence mode="wait" initial={false}>
                  {b.step === 2 && (
                    <motion.div key="c" {...anim}>
                      {b.slotsLoading ? <div className="ht-load"><span className="ht-spin" /></div> : b.slots.length === 0 ? (
                        <p className="ht-msg">Pro tento den nejsou volné termíny.</p>
                      ) : (
                        <div className="ht-slots">
                          {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Node>

              {/* 5 — Údaje */}
              <Node n={st.hasStaff ? 5 : 4} label="Údaje" state={b.step === 3 ? "on" : "off"} value="" last>
                <AnimatePresence mode="wait" initial={false}>
                  {b.step === 3 && (
                    <motion.div key="c" {...anim}>
                      <div className="ht-form">
                        <label><span>Jméno a příjmení <i>*</i></span>
                          <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                        <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                          <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                          {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                        <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                          <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                        <label className="ht-wide"><span>Poznámka <em>(nepovinné)</em></span>
                          <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                        {b.paymentMethods > 1 && (
                          <div className="ht-pay ht-wide">
                            {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                            {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                          </div>
                        )}
                      </div>
                      {b.submitErr && <p className="ht-msg ht-msg--err">{b.submitErr}</p>}
                      <button className="ht-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                        {b.submitting ? "Rezervuji…" : b.service ? `Potvrdit · ${fmtPrice(Number(b.service.price), b.service.currency)}` : "Potvrdit rezervaci"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Node>
            </ol>
          )
        )}
      </div>
    </section>
  );
}

function Node({ n, label, state, value, onEdit, last, children }: {
  n: number; label: string; state: "on" | "done" | "off"; value: string;
  onEdit?: () => void; last?: boolean; children: React.ReactNode;
}) {
  return (
    <li className={`ht-node is-${state} ${last ? "is-last" : ""}`}>
      <span className="ht-node__dot">{state === "done" ? "✓" : n}</span>
      <div className="ht-node__b">
        <div className="ht-node__h">
          <b>{label}</b>
          {state === "done" && value && <span className="ht-node__v">{value}</span>}
          {state === "done" && onEdit && <button className="ht-node__e" onClick={onEdit}>změnit</button>}
        </div>
        {children}
      </div>
    </li>
  );
}

const CSS = `
.ht{padding:64px 20px}
.ht-wrap{max-width:600px;margin:0 auto}
.ht-head{margin-bottom:28px}
.ht-head h2{font-size:clamp(1.7rem,3.8vw,2.3rem);font-weight:700;margin:0 0 7px;color:var(--color-text);letter-spacing:-.01em}
.ht-head p{margin:0;color:var(--color-text-muted);font-size:.94rem}
.ht-load{display:flex;justify-content:center;padding:26px 0}
.ht-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.ht-msg{color:var(--color-text-muted);font-size:.9rem;padding:12px 0;margin:0}
.ht-msg--err{color:#c0392b}
.ht-line{list-style:none;margin:0;padding:0}
.ht-node{position:relative;padding:0 0 22px 42px}
.ht-node::before{content:"";position:absolute;left:13px;top:26px;bottom:0;width:2px;background:var(--color-border)}
.ht-node.is-last::before{display:none}
.ht-node.is-done::before{background:var(--color-primary);opacity:.45}
.ht-node__dot{position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;background:var(--color-surface,#fff);border:2px solid var(--color-border);color:var(--color-text-muted);z-index:1}
.ht-node.is-on .ht-node__dot{border-color:var(--color-primary);background:var(--color-primary);color:var(--color-on-primary,#fff)}
.ht-node.is-done .ht-node__dot{border-color:var(--color-primary);color:var(--color-primary)}
.ht-node.is-off{opacity:.42}
.ht-node__b{padding-top:3px}
.ht-node__h{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-height:22px}
.ht-node__h b{font-size:.95rem;font-weight:800;color:var(--color-text)}
.ht-node__v{font-size:.86rem;color:var(--color-text-muted);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ht-node__e{flex:0 0 auto;background:none;border:1px solid var(--color-border);color:var(--color-text-muted);border-radius:99px;padding:4px 10px;font-size:.7rem;font-weight:800;cursor:pointer;transition:.14s}
.ht-node__e:hover{border-color:var(--color-primary);color:var(--color-primary)}
.ht-opts{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:7px}
.ht-opts button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:12px 14px;cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.ht-opts button:hover{border-color:var(--color-primary)}
.ht-opts b{display:block;font-size:.94rem;font-weight:700}
.ht-opts i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.ht-opts em{font-style:normal;font-weight:800;color:var(--color-primary);flex:0 0 auto}
.ht-staff{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.ht-staff button{display:flex;align-items:center;gap:8px;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:99px;padding:5px 14px 5px 5px;cursor:pointer;color:var(--color-text);transition:.14s}
.ht-staff button:hover{border-color:var(--color-primary)}
.ht-staff b{font-size:.86rem;font-weight:700}
.ht-av{width:30px;height:30px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:.78rem}
.ht-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.ht-mnav{display:flex;align-items:center;justify-content:space-between;margin:12px 0 10px}
.ht-mnav b{font-weight:700;font-size:.94rem;color:var(--color-text)}
.ht-mnav button{width:30px;height:30px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);cursor:pointer}
.ht-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.ht-mnav button:disabled{opacity:.25;cursor:not-allowed}
.ht-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px}
.ht-dow span{text-align:center;font-size:.64rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.ht-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.ht-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.82rem;opacity:.3;border-radius:7px}
.ht-day.is-av{opacity:1;color:var(--color-text);background:var(--color-surface,#fff);border:1px solid var(--color-border);cursor:pointer;transition:.12s}
.ht-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ht-empty{margin-top:11px;text-align:center}
.ht-empty p{margin:0 0 8px;font-size:.83rem;color:var(--color-text-muted)}
.ht-empty b{color:var(--color-text)}
.ht-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.ht-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:6px 12px;font-size:.74rem;font-weight:700;cursor:pointer}
.ht-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.ht-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px;margin-top:12px}
.ht-slots button{padding:10px 5px;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-weight:700;font-size:.85rem;border-radius:8px;cursor:pointer;transition:.12s}
.ht-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ht-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.ht-form{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:12px}
@media(max-width:520px){.ht-form{grid-template-columns:1fr}}
.ht-wide{grid-column:1/-1}
.ht-form label{display:flex;flex-direction:column;gap:4px}
.ht-form label>span{font-size:.74rem;font-weight:800;color:var(--color-text)}
.ht-form label i{font-style:normal;color:var(--color-primary)}
.ht-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.ht-form input,.ht-form textarea{border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:8px;padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.ht-form input:focus,.ht-form textarea:focus{border-color:var(--color-primary)}
.ht-form small{color:#c0392b;font-size:.71rem;font-weight:600}
.ht-pay{display:flex;gap:8px}
.ht-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:8px;padding:10px;font-weight:700;font-size:.84rem;cursor:pointer;transition:.14s}
.ht-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.ht-cta{width:100%;margin-top:14px;padding:13px;border:none;border-radius:8px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.92rem;cursor:pointer;transition:.14s}
.ht-cta:hover:not(:disabled){filter:brightness(1.07)}
.ht-cta:disabled{opacity:.4;cursor:not-allowed}
.ht-done{text-align:center;padding:14px 0}
.ht-done__c{width:60px;height:60px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.ht-done h3{font-size:1.5rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.ht-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
.ht-done__l{list-style:none;margin:0;padding:0;text-align:left;border:1px solid var(--color-border);border-radius:var(--radius,12px);overflow:hidden}
.ht-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 15px;border-top:1px solid var(--color-border)}
.ht-done__l li:first-child{border-top:none}
.ht-done__l i{font-style:normal;font-size:.8rem;color:var(--color-text-muted)}
.ht-done__l b{font-size:.88rem;font-weight:700;color:var(--color-text);text-align:right}
`;
