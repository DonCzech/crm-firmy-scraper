"use client";

/**
 * nails-01 „Swatch" — vzorníková metafora: každá služba je lakový vzorek.
 * Odstíny se odvozují z akcentní barvy šablony (mix + rotace), takže paleta
 * vždy ladí s motivem — nikdy se nepoužije barva z databáze.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.19 } };

/** harmonické odstíny odvozené z --color-primary (žádné barvy z DB) */
const SWATCH = [
  "color-mix(in srgb, var(--color-primary) 100%, transparent)",
  "color-mix(in srgb, var(--color-primary) 62%, var(--color-surface, #fff))",
  "color-mix(in srgb, var(--color-primary) 78%, #7a3b5c)",
  "color-mix(in srgb, var(--color-primary) 40%, var(--color-surface, #fff))",
  "color-mix(in srgb, var(--color-primary) 86%, #402038)",
  "color-mix(in srgb, var(--color-primary) 52%, #d9a1b8)",
];

export function NailsSwatch({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Manikérka", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="ns" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ns-wrap">
        <header className="ns-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          {!b.done && (
            <div className="ns-steps">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                  <i style={i <= st.vstep ? { background: "var(--color-primary)" } : undefined} />{l}
                </span>
              ))}
            </div>
          )}
        </header>

        {b.loading && <div className="ns-load"><span className="ns-spin" /></div>}
        {b.loadErr && !b.loading && <p className="ns-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="ns-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="ns-grid">
                {b.services.map((svc, i) => (
                  <button key={svc.id} className="ns-swatch" onClick={() => b.pickService(svc)}>
                    <span className="ns-swatch__c" style={{ background: SWATCH[i % SWATCH.length] }} aria-hidden />
                    <span className="ns-swatch__b">
                      <b>{svc.name}</b>
                      {svc.description && <i>{svc.description}</i>}
                      <span className="ns-swatch__f">
                        <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                        <small>{fmtDuration(svc.duration_minutes)}</small>
                      </span>
                    </span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="ns-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim} className="ns-panel">
                <Bar onBack={() => b.setStep(0)} t="Kdo vám nehty udělá?" />
                <div className="ns-staff">
                  <button onClick={() => st.pickStaff(null)}>
                    <span className="ns-av ns-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                  </button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="ns-av" src={m.avatar_url} alt={m.name} />
                        : <span className="ns-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim} className="ns-panel">
                <Bar onBack={st.backFromCalendar} t="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="ns-cal-box">
                  <div className="ns-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="ns-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="ns-load"><span className="ns-spin" /></div> : (
                    <>
                      <div className="ns-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`ns-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="ns-empty">
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
              <motion.div key="s2" {...anim} className="ns-panel">
                <Bar onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="ns-load"><span className="ns-spin" /></div> : b.slots.length === 0 ? (
                  <p className="ns-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="ns-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim} className="ns-panel">
                <Bar onBack={() => b.setStep(2)} t="Vaše údaje" />
                <div className="ns-recap">
                  <span className="ns-recap__c" style={{ background: SWATCH[0] }} aria-hidden />
                  <span>
                    <b>{b.service.name}</b>
                    <i>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</i>
                  </span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <div className="ns-form">
                  <label><span>Jméno a příjmení <i>*</i></span>
                    <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                  <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                    <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                    {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                  <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                    <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                  <label className="ns-wide"><span>Poznámka <em>(nepovinné)</em></span>
                    <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                  {b.paymentMethods > 1 && (
                    <div className="ns-pay ns-wide">
                      {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                      {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                    </div>
                  )}
                </div>
                {b.submitErr && <p className="ns-msg ns-msg--err">{b.submitErr}</p>}
                <button className="ns-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="ns-panel ns-done">
                <span className="ns-done__c">✓</span>
                <h3>Rezervace potvrzena</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="ns-done__l">
                  <li><i>Služba</i><b>{b.service.name}</b></li>
                  <li><i>Manikérka</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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
    <div className="ns-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="ns-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.ns{padding:64px 20px}
.ns-wrap{max-width:720px;margin:0 auto}
.ns-head{text-align:center;margin-bottom:24px}
.ns-head h2{font-size:clamp(1.7rem,4vw,2.3rem);font-weight:800;margin:0 0 8px;color:var(--color-text);letter-spacing:-.02em}
.ns-head p{margin:0 0 16px;color:var(--color-text-muted);font-size:.93rem}
.ns-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:14px}
.ns-steps span{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-weight:700;color:var(--color-text-muted);opacity:.5}
.ns-steps span i{width:9px;height:9px;border-radius:50%;background:var(--color-border);display:block}
.ns-steps span.is-on{opacity:1;color:var(--color-text)}
.ns-steps span.is-done{opacity:1}
.ns-load{display:flex;justify-content:center;padding:44px 0}
.ns-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.ns-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 0;margin:0}
.ns-msg--err{color:#c0392b}
.ns-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.ns-swatch{display:flex;flex-direction:column;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.6);overflow:hidden;cursor:pointer;color:var(--color-text);text-align:left;transition:.17s}
.ns-swatch:hover{transform:translateY(-3px);box-shadow:0 14px 30px -20px rgba(0,0,0,.45)}
.ns-swatch__c{display:block;height:74px;position:relative}
.ns-swatch__c::after{content:"";position:absolute;inset:auto 0 0 0;height:16px;background:linear-gradient(to top,rgba(255,255,255,.22),transparent)}
.ns-swatch__b{display:flex;flex-direction:column;gap:3px;padding:13px 15px 15px;flex:1}
.ns-swatch__b b{font-size:.98rem;font-weight:800}
.ns-swatch__b i{font-style:normal;font-size:.78rem;color:var(--color-text-muted);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.ns-swatch__f{display:flex;align-items:baseline;justify-content:space-between;margin-top:auto;padding-top:9px}
.ns-swatch__f em{font-style:normal;font-weight:800;color:var(--color-primary)}
.ns-swatch__f small{font-size:.74rem;color:var(--color-text-muted)}
.ns-panel{background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.6);padding:22px}
.ns-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.ns-bar button{width:36px;height:36px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.25rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.ns-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ns-bar b{font-size:1.1rem;font-weight:800;color:var(--color-text)}
.ns-bar button.ns-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 12px;font-size:.73rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.ns-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px}
.ns-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:15px 9px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.4);cursor:pointer;color:var(--color-text);text-align:center;transition:.15s}
.ns-staff button:hover{border-color:var(--color-primary)}
.ns-staff b{font-size:.9rem;font-weight:800}
.ns-staff i{font-style:normal;font-size:.71rem;color:var(--color-text-muted)}
.ns-av{width:52px;height:52px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.1rem}
.ns-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.ns-cal-box{max-width:400px;margin:0 auto}
.ns-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.ns-mnav b{font-weight:800;color:var(--color-text)}
.ns-mnav button{width:31px;height:31px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);cursor:pointer}
.ns-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.ns-mnav button:disabled{opacity:.25;cursor:not-allowed}
.ns-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.ns-dow span{text-align:center;font-size:.65rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.ns-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.ns-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.85rem;opacity:.3;border-radius:50%}
.ns-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.ns-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.ns-empty{margin-top:12px;text-align:center}
.ns-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.ns-empty b{color:var(--color-text)}
.ns-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.ns-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.75rem;font-weight:700;cursor:pointer}
.ns-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.ns-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:7px}
.ns-slots button{padding:11px 6px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.87rem;border-radius:99px;cursor:pointer;transition:.12s}
.ns-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ns-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.ns-recap{display:flex;align-items:center;gap:13px;background:var(--color-bg);border-radius:calc(var(--radius,12px)*1.3);padding:12px 15px;margin-bottom:16px}
.ns-recap__c{width:34px;height:34px;border-radius:50%;flex:0 0 auto}
.ns-recap b{display:block;font-size:.95rem;font-weight:800;color:var(--color-text)}
.ns-recap i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.ns-recap em{font-style:normal;margin-left:auto;font-weight:800;color:var(--color-primary);flex:0 0 auto}
.ns-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.ns-form{grid-template-columns:1fr}}
.ns-wide{grid-column:1/-1}
.ns-form label{display:flex;flex-direction:column;gap:4px}
.ns-form label>span{font-size:.74rem;font-weight:800;color:var(--color-text)}
.ns-form label i{font-style:normal;color:var(--color-primary)}
.ns-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.ns-form input,.ns-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:10px 15px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.ns-form textarea{border-radius:16px}
.ns-form input:focus,.ns-form textarea:focus{border-color:var(--color-primary)}
.ns-form small{color:#c0392b;font-size:.71rem;font-weight:600;padding-left:12px}
.ns-pay{display:flex;gap:8px}
.ns-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:10px;font-weight:700;font-size:.84rem;cursor:pointer;transition:.14s}
.ns-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 12%,transparent)}
.ns-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.94rem;cursor:pointer;transition:.14s}
.ns-cta:hover:not(:disabled){filter:brightness(1.07)}
.ns-cta:disabled{opacity:.4;cursor:not-allowed}
.ns-done{text-align:center}
.ns-done__c{width:58px;height:58px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:6px auto 14px}
.ns-done h3{font-size:1.45rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.ns-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.ns-done__l{list-style:none;margin:0;padding:0;text-align:left;background:var(--color-bg);border-radius:calc(var(--radius,12px)*1.3);overflow:hidden}
.ns-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 16px;border-top:1px solid var(--color-border)}
.ns-done__l li:first-child{border-top:none}
.ns-done__l i{font-style:normal;font-size:.79rem;color:var(--color-text-muted)}
.ns-done__l b{font-size:.87rem;font-weight:800;color:var(--color-text);text-align:right}
`;
