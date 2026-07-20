"use client";

/**
 * barber-03 „Chrome" — širokoúhlý wizard: nahoře průběžný pruh postupu,
 * obsah v mřížce karet přes celou šířku. Technický, kontrastní, bez serifů.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, scale: 0.985 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.985 }, transition: { duration: 0.18 } };

export function BarberChrome({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Barber", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;
  const pct = b.done ? 100 : Math.round((st.vstep / (st.steps.length - 1)) * 100);

  return (
    <section id="rezervace" className="bc" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bc-wrap">
        <header className="bc-head">
          <div>
            <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
            <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          </div>
          {b.service && !b.done && (
            <div className="bc-tag">
              <b>{b.service.name}</b>
              <span>{b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli"}{b.date ? ` · ${fmtLongDate(b.date).split(",")[0]}` : ""}{b.time ? ` · ${b.time}` : ""}</span>
              <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
            </div>
          )}
        </header>

        {!b.done && (
          <div className="bc-prog">
            <div className="bc-prog__bar"><span style={{ width: `${pct}%` }} /></div>
            <div className="bc-prog__labels">
              {st.steps.map((l, i) => <span key={l} className={i <= st.vstep ? "is-on" : ""}>{l}</span>)}
            </div>
          </div>
        )}

        <div className="bc-body">
          {b.loading && <div className="bc-load"><span className="bc-spin" /></div>}
          {b.loadErr && !b.loading && <p className="bc-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="bc-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim} className="bc-cards">
                  {b.services.map((svc) => (
                    <button key={svc.id} className="bc-card" onClick={() => b.pickService(svc)}>
                      {svc.image_url && <img src={svc.image_url} alt="" />}
                      <b>{svc.name}</b>
                      {svc.description && <span>{svc.description}</span>}
                      <div className="bc-card__f">
                        <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                        <i>{fmtDuration(svc.duration_minutes)}</i>
                      </div>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="bc-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <Head onBack={() => b.setStep(0)} t="Kdo se vám bude věnovat?" />
                  <div className="bc-cards bc-cards--staff">
                    <button className="bc-card bc-card--any" onClick={() => st.pickStaff(null)}>
                      <span className="bc-av bc-av--any">✦</span><b>Kdokoli</b><span>Nejbližší volný termín</span>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} className="bc-card" onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="bc-av" src={m.avatar_url} alt={m.name} />
                          : <span className="bc-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                        <b>{m.name}</b>{m.bio && <span>{m.bio}</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {st.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <Head onBack={st.backFromCalendar} t="Vyberte datum"
                    meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={() => st.setStaffChosen(false)} />
                  <div className="bc-cal-wrap">
                    <div className="bc-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="bc-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="bc-load"><span className="bc-spin" /></div> : (
                      <>
                        <div className="bc-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`bc-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && (
                          <div className="bc-empty">
                            <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volný termín.</> : "V tomto měsíci nejsou volné termíny."}</p>
                            <div>
                              <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                              {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiný barber</button>}
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
                  <Head onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="bc-load"><span className="bc-spin" /></div> : b.slots.length === 0 ? (
                    <p className="bc-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="bc-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <Head onBack={() => b.setStep(2)} t="Vaše údaje" />
                  <div className="bc-form">
                    <label><span>Jméno a příjmení <i>*</i></span>
                      <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
                    <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                      {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}</label>
                    <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                    <label className="bc-form--wide"><span>Poznámka <em>(nepovinné)</em></span>
                      <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                    {b.paymentMethods > 1 && (
                      <div className="bc-pay bc-form--wide">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově<i>na místě</i></button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem<i>QR v potvrzení</i></button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="bc-msg bc-msg--err">{b.submitErr}</p>}
                  <button className="bc-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : `Potvrdit rezervaci · ${fmtPrice(Number(b.service.price), b.service.currency)}`}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="bc-done">
                  <span className="bc-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <dl className="bc-dl">
                    <div><dt>Služba</dt><dd>{b.service.name}</dd></div>
                    <div><dt>Barber</dt><dd>{b.selStaff ? b.selStaff.name : b.provider.name}</dd></div>
                    <div><dt>Datum</dt><dd>{fmtLongDate(b.date)}</dd></div>
                    <div><dt>Čas</dt><dd>{b.time} – {addMinutes(b.time, b.totalDuration)}</dd></div>
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

function Head({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="bc-bar">
      <button onClick={onBack} aria-label="Zpět">←</button>
      <b>{t}</b>
      {meta && <button className="bc-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.bc{padding:64px 20px}
.bc-wrap{max-width:960px;margin:0 auto}
.bc-head{display:flex;gap:20px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;margin-bottom:22px}
.bc-head h2{font-size:clamp(1.6rem,3.4vw,2.2rem);font-weight:800;margin:0 0 6px;letter-spacing:-.02em;color:var(--color-text)}
.bc-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.bc-tag{display:flex;flex-direction:column;gap:2px;text-align:right;border-left:3px solid var(--color-primary);padding-left:14px}
.bc-tag b{font-weight:800;font-size:.95rem;color:var(--color-text)}
.bc-tag span{font-size:.78rem;color:var(--color-text-muted)}
.bc-tag em{font-style:normal;font-weight:800;color:var(--color-primary);font-size:1.05rem}
.bc-prog{margin-bottom:24px}
.bc-prog__bar{height:4px;background:var(--color-border);border-radius:99px;overflow:hidden}
.bc-prog__bar span{display:block;height:100%;background:var(--color-primary);border-radius:99px;transition:width .35s cubic-bezier(.4,0,.2,1)}
.bc-prog__labels{display:flex;justify-content:space-between;margin-top:8px}
.bc-prog__labels span{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text-muted);opacity:.45}
.bc-prog__labels span.is-on{opacity:1;color:var(--color-primary)}
.bc-body{min-height:240px}
.bc-load{display:flex;justify-content:center;padding:56px 0}
.bc-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.bc-msg{text-align:center;color:var(--color-text-muted);font-size:.92rem;padding:26px 0;margin:0}
.bc-msg--err{color:#c0392b}
.bc-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.bc-cards--staff{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.bc-card{display:flex;flex-direction:column;gap:5px;text-align:left;padding:16px;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);transition:.16s}
.bc-card:hover{border-color:var(--color-primary);transform:translateY(-2px);box-shadow:0 10px 26px -16px rgba(0,0,0,.4)}
.bc-card>img{width:100%;height:104px;object-fit:cover;border-radius:calc(var(--radius,12px)*.6);margin-bottom:4px}
.bc-card b{font-size:1rem;font-weight:800}
.bc-card>span{font-size:.8rem;color:var(--color-text-muted);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.bc-card__f{display:flex;justify-content:space-between;align-items:baseline;margin-top:auto;padding-top:8px;border-top:1px solid var(--color-border)}
.bc-card__f em{font-style:normal;font-weight:800;color:var(--color-primary)}
.bc-card__f i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.bc-cards--staff .bc-card{align-items:center;text-align:center}
.bc-av{width:60px;height:60px;border-radius:14px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.3rem;margin-bottom:4px}
.bc-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.bc-bar{display:flex;align-items:center;gap:14px;margin-bottom:18px;flex-wrap:wrap}
.bc-bar button{width:38px;height:38px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-size:1rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.bc-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bc-bar b{font-size:1.2rem;font-weight:800;color:var(--color-text)}
.bc-bar button.bc-bar__m{width:auto!important;height:auto!important;padding:8px 14px;font-size:.76rem;font-weight:800;border-radius:99px!important;color:var(--color-text-muted)}
.bc-cal-wrap{max-width:460px}
.bc-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.bc-mnav b{font-weight:800;color:var(--color-text)}
.bc-mnav button{width:34px;height:34px;border-radius:9px;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);cursor:pointer}
.bc-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.bc-mnav button:disabled{opacity:.25;cursor:not-allowed}
.bc-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.bc-dow span{text-align:center;font-size:.68rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em}
.bc-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.bc-day{aspect-ratio:1;border:1px solid transparent;background:none;color:var(--color-text-muted);font-weight:700;font-size:.88rem;border-radius:9px;opacity:.3}
.bc-day.is-av{opacity:1;color:var(--color-text);background:var(--color-surface,#fff);border-color:var(--color-border);cursor:pointer;transition:.12s}
.bc-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bc-empty{margin-top:14px;padding:16px;border:1px dashed var(--color-border);border-radius:var(--radius,12px);text-align:center}
.bc-empty p{margin:0 0 10px;font-size:.88rem;color:var(--color-text-muted)}
.bc-empty b{color:var(--color-text)}
.bc-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.bc-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.78rem;font-weight:700;cursor:pointer}
.bc-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.bc-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;max-width:620px}
.bc-slots button{padding:13px 6px;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-weight:800;font-size:.9rem;border-radius:10px;cursor:pointer;transition:.12s}
.bc-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bc-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.bc-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;max-width:720px}
.bc-form--wide{grid-column:1/-1}
.bc-form label{display:flex;flex-direction:column;gap:5px}
.bc-form label>span{font-size:.78rem;font-weight:800;color:var(--color-text)}
.bc-form label i{font-style:normal;color:var(--color-primary)}
.bc-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.bc-form input,.bc-form textarea{border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:9px;padding:11px 13px;font-size:.93rem;font-family:inherit;outline:none;transition:.14s}
.bc-form input:focus,.bc-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 16%,transparent)}
.bc-form small{color:#c0392b;font-size:.73rem;font-weight:600}
.bc-pay{display:flex;gap:10px}
.bc-pay button{flex:1;display:flex;flex-direction:column;gap:2px;align-items:flex-start;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:10px;padding:12px 14px;font-weight:800;cursor:pointer;transition:.14s}
.bc-pay button i{font-style:normal;font-weight:400;font-size:.75rem;color:var(--color-text-muted)}
.bc-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.bc-cta{margin-top:20px;padding:15px 34px;border:none;border-radius:10px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.96rem;cursor:pointer;transition:.14s}
.bc-cta:hover:not(:disabled){filter:brightness(1.08)}
.bc-cta:disabled{opacity:.4;cursor:not-allowed}
.bc-done{text-align:center;padding:16px 0}
.bc-done__c{width:62px;height:62px;border-radius:16px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.bc-done h3{font-size:1.6rem;font-weight:800;margin:0 0 6px;color:var(--color-text)}
.bc-done>p{color:var(--color-text-muted);margin:0 0 22px;font-size:.9rem}
.bc-dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;max-width:620px;margin:0 auto;text-align:left}
.bc-dl div{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:10px;padding:12px 14px}
.bc-dl dt{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text-muted);margin-bottom:3px}
.bc-dl dd{margin:0;font-weight:700;font-size:.92rem;color:var(--color-text)}
`;
