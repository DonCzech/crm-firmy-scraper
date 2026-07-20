"use client";

/**
 * tattoo-01 „Flash" — flash sheet: služby v rámovaných buňkách s rohovými
 * značkami a pořadovým číslem, tvrdá kondenzovaná typografie, hodně černé.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.16 } };

export function TattooFlash({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Motiv", "Tatér", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="tf" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tf-wrap">
        <header className="tf-head">
          <span className="tf-rule" aria-hidden />
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          {!b.done && (
            <div className="tf-steps">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                  {pad(i + 1)} <i>{l}</i>
                </span>
              ))}
            </div>
          )}
          <span className="tf-rule" aria-hidden />
        </header>

        {b.loading && <div className="tf-load"><span className="tf-spin" /></div>}
        {b.loadErr && !b.loading && <p className="tf-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="tf-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="tf-sheet">
                {b.services.map((svc, i) => (
                  <button key={svc.id} className="tf-cell" onClick={() => b.pickService(svc)}>
                    <span className="tf-cell__n">{pad(i + 1)}</span>
                    {svc.image_url && <img src={svc.image_url} alt="" />}
                    <b>{svc.name}</b>
                    {svc.description && <i>{svc.description}</i>}
                    <span className="tf-cell__f">
                      <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                      <small>{fmtDuration(svc.duration_minutes)}</small>
                    </span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="tf-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim} className="tf-box">
                <Bar onBack={() => b.setStep(0)} t="Kdo tě potetuje?" />
                <div className="tf-staff">
                  <button onClick={() => st.pickStaff(null)}>
                    <span className="tf-av tf-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                  </button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="tf-av" src={m.avatar_url} alt={m.name} />
                        : <span className="tf-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim} className="tf-box">
                <Bar onBack={st.backFromCalendar} t="Vyber datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="tf-cal-box">
                  <div className="tf-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="tf-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="tf-load"><span className="tf-spin" /></div> : (
                    <>
                      <div className="tf-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`tf-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="tf-empty">
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
              <motion.div key="s2" {...anim} className="tf-box">
                <Bar onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="tf-load"><span className="tf-spin" /></div> : b.slots.length === 0 ? (
                  <p className="tf-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="tf-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim} className="tf-box">
                <Bar onBack={() => b.setStep(2)} t="Tvoje údaje" />
                <div className="tf-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <div className="tf-form">
                  <label><span>Jméno a příjmení <i>*</i></span>
                    <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
                  <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                    <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                    {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}</label>
                  <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                    <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                  <label className="tf-wide"><span>Popiš motiv <em>(nepovinné)</em></span>
                    <textarea rows={3} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} placeholder="Umístění, velikost, styl, reference…" /></label>
                  {b.paymentMethods > 1 && (
                    <div className="tf-pay tf-wide">
                      {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                      {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                    </div>
                  )}
                </div>
                {b.submitErr && <p className="tf-msg tf-msg--err">{b.submitErr}</p>}
                <button className="tf-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="tf-box tf-done">
                <span className="tf-done__c">✓</span>
                <h3>Rezervace potvrzena</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="tf-done__l">
                  <li><i>Motiv</i><b>{b.service.name}</b></li>
                  <li><i>Tatér</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                  <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                  <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="tf-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="tf-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.tf{padding:66px 20px}
.tf-wrap{max-width:800px;margin:0 auto}
.tf-head{text-align:center;margin-bottom:26px}
.tf-rule{display:block;height:3px;background:var(--color-text);margin:0 0 18px}
.tf-rule:last-child{margin:18px 0 0}
.tf-head h2{font-size:clamp(1.9rem,5vw,3rem);font-weight:900;letter-spacing:-.03em;text-transform:uppercase;margin:0 0 8px;color:var(--color-text);line-height:.98}
.tf-head p{margin:0 0 16px;color:var(--color-text-muted);font-size:.92rem}
.tf-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:16px}
.tf-steps span{font-size:.7rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:var(--color-text-muted);opacity:.42}
.tf-steps span i{font-style:normal}
.tf-steps span.is-on{opacity:1;color:var(--color-primary)}
.tf-steps span.is-done{opacity:1;color:var(--color-text)}
.tf-load{display:flex;justify-content:center;padding:46px 0}
.tf-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.tf-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 0;margin:0}
.tf-msg--err{color:#e0573f}
.tf-sheet{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0;border:2px solid var(--color-text);border-right:none;border-bottom:none}
.tf-cell{position:relative;display:flex;flex-direction:column;gap:5px;padding:20px 18px;background:none;border:none;border-right:2px solid var(--color-text);border-bottom:2px solid var(--color-text);cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.tf-cell:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.tf-cell__n{font-size:.68rem;font-weight:900;letter-spacing:.14em;opacity:.5}
.tf-cell>img{width:100%;height:96px;object-fit:cover;filter:grayscale(1) contrast(1.15);margin:2px 0 4px}
.tf-cell:hover>img{filter:none}
.tf-cell b{font-size:1.06rem;font-weight:900;text-transform:uppercase;letter-spacing:-.01em;line-height:1.1}
.tf-cell i{font-style:normal;font-size:.78rem;color:var(--color-text-muted);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.tf-cell:hover i{color:inherit;opacity:.8}
.tf-cell__f{display:flex;align-items:baseline;justify-content:space-between;margin-top:auto;padding-top:10px}
.tf-cell__f em{font-style:normal;font-weight:900;color:var(--color-primary)}
.tf-cell:hover .tf-cell__f em{color:inherit}
.tf-cell__f small{font-size:.72rem;opacity:.65}
.tf-box{border:2px solid var(--color-text);padding:22px}
.tf-bar{display:flex;align-items:center;gap:13px;margin-bottom:18px;flex-wrap:wrap}
.tf-bar button{width:38px;height:38px;border:2px solid var(--color-text);background:none;color:var(--color-text);font-size:1.25rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.tf-bar button:hover{background:var(--color-text);color:var(--color-bg)}
.tf-bar b{font-size:1.15rem;font-weight:900;text-transform:uppercase;letter-spacing:-.01em;color:var(--color-text)}
.tf-bar button.tf-bar__m{width:auto;height:auto;border-width:1px;padding:6px 12px;font-size:.72rem;font-weight:800;margin-left:auto;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.tf-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}
.tf-staff button{display:flex;flex-direction:column;align-items:center;gap:7px;padding:16px 10px;background:none;border:2px solid var(--color-border);cursor:pointer;color:var(--color-text);text-align:center;transition:.15s}
.tf-staff button:hover{border-color:var(--color-primary)}
.tf-staff b{font-size:.9rem;font-weight:900;text-transform:uppercase}
.tf-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.tf-av{width:56px;height:56px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:1.2rem;filter:grayscale(1)}
.tf-staff button:hover .tf-av{filter:none}
.tf-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none;filter:none}
.tf-cal-box{max-width:410px}
.tf-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.tf-mnav b{font-weight:900;text-transform:uppercase;color:var(--color-text)}
.tf-mnav button{width:32px;height:32px;border:2px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.tf-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.tf-mnav button:disabled{opacity:.25;cursor:not-allowed}
.tf-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.tf-dow span{text-align:center;font-size:.64rem;font-weight:900;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em}
.tf-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.tf-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:800;font-size:.86rem;opacity:.25}
.tf-day.is-av{opacity:1;color:var(--color-text);border:2px solid var(--color-border);cursor:pointer;transition:.12s}
.tf-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.tf-empty{margin-top:13px;text-align:center}
.tf-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.tf-empty b{color:var(--color-text)}
.tf-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.tf-empty button{background:none;border:2px solid var(--color-border);color:var(--color-text);padding:7px 13px;font-size:.74rem;font-weight:800;cursor:pointer;text-transform:uppercase;letter-spacing:.04em}
.tf-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.tf-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:6px}
.tf-slots button{padding:13px 6px;border:2px solid var(--color-border);background:none;color:var(--color-text);font-weight:900;font-size:.88rem;cursor:pointer;transition:.12s}
.tf-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.tf-slots button.is-off{opacity:.25;text-decoration:line-through;cursor:not-allowed}
.tf-recap{display:flex;flex-direction:column;gap:3px;border-left:4px solid var(--color-primary);padding:4px 0 4px 14px;margin-bottom:18px}
.tf-recap b{font-size:1.02rem;font-weight:900;text-transform:uppercase;color:var(--color-text)}
.tf-recap span{font-size:.8rem;color:var(--color-text-muted)}
.tf-recap em{font-style:normal;font-weight:900;color:var(--color-primary);margin-top:3px}
.tf-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.tf-form{grid-template-columns:1fr}}
.tf-wide{grid-column:1/-1}
.tf-form label{display:flex;flex-direction:column;gap:5px}
.tf-form label>span{font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text)}
.tf-form label i{font-style:normal;color:var(--color-primary)}
.tf-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.tf-form input,.tf-form textarea{border:2px solid var(--color-border);background:none;color:var(--color-text);padding:10px 12px;font-size:.92rem;font-family:inherit;outline:none;transition:.14s}
.tf-form input:focus,.tf-form textarea:focus{border-color:var(--color-primary)}
.tf-form small{color:#e0573f;font-size:.71rem;font-weight:700}
.tf-pay{display:flex;gap:9px}
.tf-pay button{flex:1;border:2px solid var(--color-border);background:none;color:var(--color-text);padding:11px;font-weight:900;font-size:.84rem;text-transform:uppercase;cursor:pointer;transition:.14s}
.tf-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 15%,transparent)}
.tf-cta{width:100%;margin-top:18px;padding:16px;border:none;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:900;font-size:.95rem;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;transition:.14s}
.tf-cta:hover:not(:disabled){filter:brightness(1.1)}
.tf-cta:disabled{opacity:.4;cursor:not-allowed}
.tf-done{text-align:center}
.tf-done__c{width:60px;height:60px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:6px auto 16px}
.tf-done h3{font-size:1.5rem;font-weight:900;text-transform:uppercase;margin:0 0 8px;color:var(--color-text)}
.tf-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.tf-done__l{list-style:none;margin:0;padding:0;text-align:left}
.tf-done__l li{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-top:2px solid var(--color-border)}
.tf-done__l li:first-child{border-top:none}
.tf-done__l i{font-style:normal;font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text-muted)}
.tf-done__l b{font-size:.88rem;font-weight:800;color:var(--color-text);text-align:right}
`;
