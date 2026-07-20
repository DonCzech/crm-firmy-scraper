"use client";

/**
 * beauty-01 „Glow" — elegantní karta s přechodovým pruhem v hlavičce, plovoucím
 * čipem souhrnu a jemnými zářivými akcenty. Vzdušné, kosmetické.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.19 } };

export function BeautyGlow({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Specialistka", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="bg2" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bg2-wrap">
        <div className="bg2-card">
          <div className="bg2-glow" aria-hidden />
          <header className="bg2-head">
            <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
            <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
            {!b.done && (
              <div className="bg2-steps">
                {st.steps.map((l, i) => (
                  <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
                ))}
              </div>
            )}
          </header>

          <div className="bg2-body">
            {b.loading && <div className="bg2-load"><span className="bg2-spin" /></div>}
            {b.loadErr && !b.loading && <p className="bg2-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="bg2-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="bg2-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="bg2-list__b">
                          <b>{svc.name}</b>
                          {svc.description && <i>{svc.description}</i>}
                        </span>
                        <span className="bg2-list__m">
                          <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                          <small>{fmtDuration(svc.duration_minutes)}</small>
                        </span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="bg2-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <Bar onBack={() => b.setStep(0)} t="Kdo se o vás postará?" />
                    <div className="bg2-staff">
                      <button onClick={() => st.pickStaff(null)}>
                        <span className="bg2-av bg2-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                      </button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="bg2-av" src={m.avatar_url} alt={m.name} />
                            : <span className="bg2-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                          <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
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
                    <div className="bg2-cal-box">
                      <div className="bg2-mnav">
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                        <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="bg2-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                      {b.datesLoading ? <div className="bg2-load"><span className="bg2-spin" /></div> : (
                        <>
                          <div className="bg2-cal">
                            {b.cells.map((d, i) => {
                              if (!d) return <span key={`p${i}`} />;
                              const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                              return <button key={ds} className={`bg2-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                            })}
                          </div>
                          {b.dates.size === 0 && (
                            <div className="bg2-empty">
                              <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                              <div>
                                <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                                {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiná specialistka</button>}
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
                    {b.slotsLoading ? <div className="bg2-load"><span className="bg2-spin" /></div> : b.slots.length === 0 ? (
                      <p className="bg2-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="bg2-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <Bar onBack={() => b.setStep(2)} t="Vaše údaje" />
                    <div className="bg2-form">
                      <label><span>Jméno a příjmení <i>*</i></span>
                        <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                      <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                        {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                      <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                      <label className="bg2-wide"><span>Poznámka <em>(nepovinné)</em></span>
                        <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                      {b.paymentMethods > 1 && (
                        <div className="bg2-pay bg2-wide">
                          {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                          {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                        </div>
                      )}
                    </div>
                    {b.submitErr && <p className="bg2-msg bg2-msg--err">{b.submitErr}</p>}
                    <button className="bg2-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="bg2-done">
                    <span className="bg2-done__c">✓</span>
                    <h3>Těšíme se na vás</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <ul className="bg2-done__l">
                      <li><i>Služba</i><b>{b.service.name}</b></li>
                      <li><i>Specialistka</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                      <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                      <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* plovoucí čip souhrnu */}
        {b.service && !b.done && (
          <div className="bg2-chip">
            <b>{b.service.name}</b>
            <span>
              {b.selStaff ? `${b.selStaff.name.split(" ")[0]} · ` : ""}
              {b.date ? fmtLongDate(b.date) : "vyberte termín"}{b.time ? ` · ${b.time}` : ""}
            </span>
            <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
          </div>
        )}
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="bg2-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="bg2-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.bg2{padding:66px 20px}
.bg2-wrap{max-width:600px;margin:0 auto}
.bg2-card{position:relative;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*2.2);overflow:hidden;box-shadow:0 24px 60px -34px rgba(0,0,0,.4)}
.bg2-glow{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:420px;height:240px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--color-primary) 42%,transparent),transparent 68%);pointer-events:none}
.bg2-head{position:relative;text-align:center;padding:34px 28px 22px}
.bg2-head h2{font-size:clamp(1.6rem,3.6vw,2.2rem);font-weight:600;margin:0 0 8px;color:var(--color-text);letter-spacing:-.01em}
.bg2-head p{margin:0 0 18px;color:var(--color-text-muted);font-size:.92rem}
.bg2-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:5px}
.bg2-steps span{font-size:.7rem;font-weight:700;letter-spacing:.03em;color:var(--color-text-muted);background:var(--color-bg);border:1px solid var(--color-border);border-radius:99px;padding:5px 11px;opacity:.62}
.bg2-steps span.is-on{opacity:1;background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.bg2-steps span.is-done{opacity:1;color:var(--color-primary);border-color:color-mix(in srgb,var(--color-primary) 45%,transparent)}
.bg2-body{position:relative;padding:6px 28px 30px}
.bg2-load{display:flex;justify-content:center;padding:44px 0}
.bg2-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.bg2-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.bg2-msg--err{color:#c0392b}
.bg2-list{display:flex;flex-direction:column;gap:8px}
.bg2-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.5);padding:14px 18px;cursor:pointer;color:var(--color-text);text-align:left;transition:.16s}
.bg2-list button:hover{border-color:var(--color-primary);box-shadow:0 8px 22px -14px color-mix(in srgb,var(--color-primary) 60%,transparent)}
.bg2-list__b{min-width:0}
.bg2-list__b b{display:block;font-size:.97rem;font-weight:700}
.bg2-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);margin-top:2px}
.bg2-list__m{flex:0 0 auto;text-align:right}
.bg2-list__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary)}
.bg2-list__m small{font-size:.74rem;color:var(--color-text-muted)}
.bg2-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.bg2-bar button{width:36px;height:36px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.25rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.bg2-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bg2-bar b{font-size:1.08rem;font-weight:700;color:var(--color-text)}
.bg2-bar button.bg2-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 12px;font-size:.73rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.bg2-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(124px,1fr));gap:10px}
.bg2-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.5);cursor:pointer;color:var(--color-text);text-align:center;transition:.16s}
.bg2-staff button:hover{border-color:var(--color-primary)}
.bg2-staff b{font-size:.9rem;font-weight:700}
.bg2-staff i{font-style:normal;font-size:.71rem;color:var(--color-text-muted)}
.bg2-av{width:56px;height:56px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem}
.bg2-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.bg2-cal-box{max-width:400px;margin:0 auto}
.bg2-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.bg2-mnav b{font-weight:700;color:var(--color-text)}
.bg2-mnav button{width:31px;height:31px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);cursor:pointer}
.bg2-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.bg2-mnav button:disabled{opacity:.25;cursor:not-allowed}
.bg2-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.bg2-dow span{text-align:center;font-size:.65rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.bg2-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.bg2-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.85rem;opacity:.3;border-radius:50%}
.bg2-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.bg2-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.bg2-empty{margin-top:12px;text-align:center}
.bg2-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.bg2-empty b{color:var(--color-text)}
.bg2-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.bg2-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.75rem;font-weight:700;cursor:pointer}
.bg2-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.bg2-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:7px}
.bg2-slots button{padding:11px 6px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.87rem;border-radius:99px;cursor:pointer;transition:.12s}
.bg2-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bg2-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.bg2-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.bg2-form{grid-template-columns:1fr}}
.bg2-wide{grid-column:1/-1}
.bg2-form label{display:flex;flex-direction:column;gap:4px}
.bg2-form label>span{font-size:.74rem;font-weight:700;color:var(--color-text)}
.bg2-form label i{font-style:normal;color:var(--color-primary)}
.bg2-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.bg2-form input,.bg2-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:10px 15px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.bg2-form textarea{border-radius:16px}
.bg2-form input:focus,.bg2-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 15%,transparent)}
.bg2-form small{color:#c0392b;font-size:.71rem;font-weight:600;padding-left:12px}
.bg2-pay{display:flex;gap:8px}
.bg2-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:10px;font-weight:700;font-size:.84rem;cursor:pointer;transition:.14s}
.bg2-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.bg2-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.94rem;cursor:pointer;transition:.14s}
.bg2-cta:hover:not(:disabled){filter:brightness(1.07)}
.bg2-cta:disabled{opacity:.4;cursor:not-allowed}
.bg2-done{text-align:center;padding:10px 0}
.bg2-done__c{width:60px;height:60px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.75rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.bg2-done h3{font-size:1.45rem;font-weight:600;margin:0 0 8px;color:var(--color-text)}
.bg2-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.9rem}
.bg2-done__l{list-style:none;margin:0;padding:0;text-align:left;background:var(--color-bg);border-radius:calc(var(--radius,12px)*1.5);overflow:hidden}
.bg2-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 16px;border-top:1px solid var(--color-border)}
.bg2-done__l li:first-child{border-top:none}
.bg2-done__l i{font-style:normal;font-size:.79rem;color:var(--color-text-muted)}
.bg2-done__l b{font-size:.87rem;font-weight:700;color:var(--color-text);text-align:right}
.bg2-chip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;margin:16px auto 0;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:99px;padding:11px 22px;box-shadow:0 10px 28px -18px rgba(0,0,0,.4);width:fit-content;max-width:100%}
.bg2-chip b{font-size:.88rem;font-weight:700;color:var(--color-text)}
.bg2-chip span{font-size:.79rem;color:var(--color-text-muted)}
.bg2-chip em{font-style:normal;font-weight:800;color:var(--color-primary);font-size:.95rem}
`;
