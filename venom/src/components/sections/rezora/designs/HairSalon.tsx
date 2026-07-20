"use client";

/**
 * hair-01 „Salon" — měkký, obrazově vedený: velké fotky služeb v dlaždicích,
 * oblé tvary, jemné stíny. Kroky jako tečkovaná osa nad obsahem.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.2 } };

export function HairSalon({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Kadeřník", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="hs" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="hs-wrap">
        <header className="hs-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <ol className="hs-dots">
            {st.steps.map((l, i) => (
              <li key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                <span /><b>{l}</b>
              </li>
            ))}
          </ol>
        )}

        <div className="hs-panel">
          {b.loading && <div className="hs-load"><span className="hs-spin" /></div>}
          {b.loadErr && !b.loading && <p className="hs-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="hs-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim} className="hs-tiles">
                  {b.services.map((svc) => (
                    <button key={svc.id} className="hs-tile" onClick={() => b.pickService(svc)}>
                      <span className="hs-tile__img">
                        {svc.image_url
                          ? <img src={svc.image_url} alt="" />
                          : <span className="hs-tile__ph" aria-hidden>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                                <line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" />
                              </svg>
                            </span>}
                      </span>
                      <span className="hs-tile__b">
                        <b>{svc.name}</b>
                        {svc.description && <i>{svc.description}</i>}
                        <span className="hs-tile__f">
                          <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                          <small>{fmtDuration(svc.duration_minutes)}</small>
                        </span>
                      </span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="hs-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <Bar onBack={() => b.setStep(0)} t="Kdo se o vás postará?" />
                  <div className="hs-staff">
                    <button onClick={() => st.pickStaff(null)}>
                      <span className="hs-av hs-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="hs-av" src={m.avatar_url} alt={m.name} />
                          : <span className="hs-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
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
                  <div className="hs-cal-box">
                    <div className="hs-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="hs-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="hs-load"><span className="hs-spin" /></div> : (
                      <>
                        <div className="hs-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`hs-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && (
                          <div className="hs-empty">
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
                  {b.slotsLoading ? <div className="hs-load"><span className="hs-spin" /></div> : b.slots.length === 0 ? (
                    <p className="hs-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="hs-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <Bar onBack={() => b.setStep(2)} t="Vaše údaje" />
                  <div className="hs-recap">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                    <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                  </div>
                  <div className="hs-form">
                    <label><span>Jméno a příjmení <i>*</i></span>
                      <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                    <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                      {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                    <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                    <label className="hs-wide"><span>Poznámka <em>(nepovinné)</em></span>
                      <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                    {b.paymentMethods > 1 && (
                      <div className="hs-pay hs-wide">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="hs-msg hs-msg--err">{b.submitErr}</p>}
                  <button className="hs-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="hs-done">
                  <span className="hs-done__c">✓</span>
                  <h3>Těšíme se na vás</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <div className="hs-recap hs-recap--done">
                    <b>{b.service.name}</b>
                    <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)}</span>
                    <span>{b.time} – {addMinutes(b.time, b.totalDuration)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="hs-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="hs-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.hs{padding:66px 20px}
.hs-wrap{max-width:780px;margin:0 auto}
.hs-head{text-align:center;margin-bottom:22px}
.hs-head h2{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:700;margin:0 0 8px;letter-spacing:-.01em;color:var(--color-text)}
.hs-head p{margin:0;color:var(--color-text-muted);font-size:.95rem}
.hs-dots{list-style:none;display:flex;justify-content:center;gap:0;margin:0 0 24px;padding:0;flex-wrap:wrap}
.hs-dots li{display:flex;align-items:center;gap:7px;padding:0 12px;position:relative}
.hs-dots li::after{content:"";position:absolute;right:-2px;width:4px;height:4px;border-radius:50%;background:var(--color-border)}
.hs-dots li:last-child::after{display:none}
.hs-dots li span{width:9px;height:9px;border-radius:50%;background:var(--color-border);transition:.2s}
.hs-dots li b{font-size:.78rem;font-weight:600;color:var(--color-text-muted);transition:.2s}
.hs-dots li.is-on span,.hs-dots li.is-done span{background:var(--color-primary)}
.hs-dots li.is-on b{color:var(--color-text);font-weight:800}
.hs-dots li.is-done b{color:var(--color-text-muted)}
.hs-panel{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*2);padding:26px;box-shadow:0 18px 50px -30px rgba(0,0,0,.4)}
.hs-load{display:flex;justify-content:center;padding:50px 0}
.hs-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.hs-msg{text-align:center;color:var(--color-text-muted);font-size:.92rem;padding:24px 0;margin:0}
.hs-msg--err{color:#c0392b}
.hs-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.hs-tile{display:flex;flex-direction:column;background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.4);overflow:hidden;cursor:pointer;color:var(--color-text);text-align:left;transition:.18s}
.hs-tile:hover{transform:translateY(-3px);box-shadow:0 14px 32px -20px rgba(0,0,0,.45);border-color:var(--color-primary)}
.hs-tile__img{display:block;height:130px;overflow:hidden}
.hs-tile__img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.hs-tile:hover .hs-tile__img img{transform:scale(1.06)}
.hs-tile__ph{display:flex;align-items:center;justify-content:center;height:100%;background:color-mix(in srgb,var(--color-primary) 10%,var(--color-surface,#fff));color:var(--color-primary)}
.hs-tile__ph svg{width:38px;height:38px;opacity:.55}
.hs-tile__b{display:flex;flex-direction:column;gap:4px;padding:14px 16px 16px;flex:1}
.hs-tile__b b{font-size:1.02rem;font-weight:700}
.hs-tile__b i{font-style:normal;font-size:.8rem;color:var(--color-text-muted);line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.hs-tile__f{display:flex;align-items:baseline;justify-content:space-between;margin-top:auto;padding-top:10px}
.hs-tile__f em{font-style:normal;font-weight:800;color:var(--color-primary);font-size:1rem}
.hs-tile__f small{font-size:.76rem;color:var(--color-text-muted)}
.hs-bar{display:flex;align-items:center;gap:13px;margin-bottom:20px;flex-wrap:wrap}
.hs-bar button{width:38px;height:38px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.3rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.hs-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.hs-bar b{font-size:1.15rem;font-weight:700;color:var(--color-text)}
.hs-bar button.hs-bar__m{width:auto!important;height:auto!important;border-radius:99px!important;padding:7px 13px;font-size:.75rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.hs-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
.hs-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 10px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.4);cursor:pointer;color:var(--color-text);text-align:center;transition:.16s}
.hs-staff button:hover{border-color:var(--color-primary);transform:translateY(-2px)}
.hs-staff b{font-size:.95rem;font-weight:700}
.hs-staff i{font-style:normal;font-size:.72rem;color:var(--color-text-muted);line-height:1.3}
.hs-av{width:66px;height:66px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.3rem}
.hs-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.hs-cal-box{max-width:430px;margin:0 auto}
.hs-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.hs-mnav b{font-weight:700;font-size:1.02rem;color:var(--color-text)}
.hs-mnav button{width:34px;height:34px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);cursor:pointer}
.hs-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.hs-mnav button:disabled{opacity:.25;cursor:not-allowed}
.hs-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.hs-dow span{text-align:center;font-size:.68rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.hs-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.hs-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.88rem;opacity:.3;border-radius:50%}
.hs-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);border:1px solid var(--color-border);cursor:pointer;transition:.12s}
.hs-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.hs-empty{margin-top:14px;text-align:center}
.hs-empty p{margin:0 0 10px;font-size:.86rem;color:var(--color-text-muted)}
.hs-empty b{color:var(--color-text)}
.hs-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.hs-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.77rem;font-weight:700;cursor:pointer}
.hs-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.hs-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}
.hs-slots button{padding:12px 6px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.9rem;border-radius:99px;cursor:pointer;transition:.12s}
.hs-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.hs-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.hs-recap{background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.2);padding:14px 17px;margin-bottom:18px;display:flex;flex-direction:column;gap:3px}
.hs-recap b{font-size:1rem;font-weight:700;color:var(--color-text)}
.hs-recap span{font-size:.84rem;color:var(--color-text-muted)}
.hs-recap em{font-style:normal;font-weight:800;color:var(--color-primary);margin-top:3px}
.hs-recap--done{margin:0 auto;max-width:340px;text-align:left}
.hs-form{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:540px){.hs-form{grid-template-columns:1fr}}
.hs-wide{grid-column:1/-1}
.hs-form label{display:flex;flex-direction:column;gap:5px}
.hs-form label>span{font-size:.77rem;font-weight:700;color:var(--color-text)}
.hs-form label i{font-style:normal;color:var(--color-primary)}
.hs-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.hs-form input,.hs-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:11px 16px;font-size:.92rem;font-family:inherit;outline:none;transition:.14s}
.hs-form textarea{border-radius:16px}
.hs-form input:focus,.hs-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 14%,transparent)}
.hs-form small{color:#c0392b;font-size:.72rem;font-weight:600;padding-left:14px}
.hs-pay{display:flex;gap:9px}
.hs-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:11px;font-weight:700;font-size:.86rem;cursor:pointer;transition:.14s}
.hs-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.hs-cta{width:100%;margin-top:18px;padding:15px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.96rem;cursor:pointer;transition:.14s}
.hs-cta:hover:not(:disabled){filter:brightness(1.07)}
.hs-cta:disabled{opacity:.4;cursor:not-allowed}
.hs-done{text-align:center;padding:14px 0}
.hs-done__c{width:64px;height:64px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.9rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.hs-done h3{font-size:1.55rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.hs-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
`;
