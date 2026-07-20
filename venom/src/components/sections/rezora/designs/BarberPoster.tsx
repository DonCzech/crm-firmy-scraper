"use client";

/**
 * barber-04 „Poster" — plakátový styl: obří číslice, celoplošné řádky bez karet,
 * lepivá spodní lišta se souhrnem a hlavní akcí. Vysoký kontrast, minimum chromu.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -14 }, transition: { duration: 0.2 } };

export function BarberPoster({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Barber", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="bp" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bp-wrap">
        <header className="bp-head">
          <span className="bp-step">{b.done ? "Hotovo" : `${String(st.vstep + 1).padStart(2, "0")} / ${String(st.steps.length).padStart(2, "0")} — ${st.steps[st.vstep]}`}</span>
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {b.loading && <div className="bp-load"><span className="bp-spin" /></div>}
        {b.loadErr && !b.loading && <p className="bp-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="bp-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim}>
                {b.services.map((svc, i) => (
                  <button key={svc.id} className="bp-row" onClick={() => b.pickService(svc)}>
                    <span className="bp-row__n">{pad(i + 1)}</span>
                    <span className="bp-row__t">
                      <b>{svc.name}</b>
                      {svc.description && <i>{svc.description}</i>}
                    </span>
                    <span className="bp-row__m">
                      <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                      <i>{fmtDuration(svc.duration_minutes)}</i>
                    </span>
                    <span className="bp-row__a" aria-hidden>↗</span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="bp-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim}>
                <Bar onBack={() => b.setStep(0)} t="Kdo vás ostříhá?" />
                <div className="bp-staff">
                  <button onClick={() => st.pickStaff(null)}>
                    <span className="bp-av bp-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                  </button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="bp-av" src={m.avatar_url} alt={m.name} />
                        : <span className="bp-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim}>
                <Bar onBack={st.backFromCalendar} t="Kdy se hodí?"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="bp-cal-box">
                  <div className="bp-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>←</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>→</button>
                  </div>
                  <div className="bp-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="bp-load"><span className="bp-spin" /></div> : (
                    <>
                      <div className="bp-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`bp-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="bp-empty">
                          <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
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
                <Bar onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="bp-load"><span className="bp-spin" /></div> : b.slots.length === 0 ? (
                  <p className="bp-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="bp-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim}>
                <Bar onBack={() => b.setStep(2)} t="Kam pošleme potvrzení?" />
                <div className="bp-form">
                  <label><span>Jméno a příjmení <i>*</i></span>
                    <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
                  <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                    <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                    {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}</label>
                  <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                    <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                  <label><span>Poznámka <em>(nepovinné)</em></span>
                    <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                  {b.paymentMethods > 1 && (
                    <div className="bp-pay">
                      {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                      {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                    </div>
                  )}
                </div>
                {b.submitErr && <p className="bp-msg bp-msg--err">{b.submitErr}</p>}
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="bp-done">
                <span className="bp-done__c">✓</span>
                <h3>Máte rezervováno</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <div className="bp-done__g">
                  <span><i>Služba</i><b>{b.service.name}</b></span>
                  <span><i>Barber</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></span>
                  <span><i>Kdy</i><b>{fmtLongDate(b.date)}</b></span>
                  <span><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* lepivá lišta se souhrnem — jen když je co shrnout a není hotovo */}
      {b.service && !b.done && (
        <div className="bp-sticky">
          <div className="bp-sticky__in">
            <div>
              <b>{b.service.name}</b>
              <span>
                {b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli"}
                {b.date ? ` · ${fmtLongDate(b.date)}` : ""}{b.time ? ` · ${b.time}` : ""}
              </span>
            </div>
            <div className="bp-sticky__r">
              <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
              {b.step === 3 && (
                <button disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="bp-bar">
      <button onClick={onBack} aria-label="Zpět">←</button>
      <b>{t}</b>
      {meta && <button className="bp-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.bp{padding:70px 20px 20px;position:relative}
.bp-wrap{max-width:860px;margin:0 auto;padding-bottom:96px}
.bp-head{margin-bottom:30px}
.bp-step{display:inline-block;font-size:.7rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--color-primary);margin-bottom:12px}
.bp-head h2{font-size:clamp(2.1rem,6vw,3.6rem);font-weight:900;letter-spacing:-.03em;line-height:.98;margin:0 0 10px;color:var(--color-text)}
.bp-head p{margin:0;color:var(--color-text-muted);font-size:1rem;max-width:46ch}
.bp-load{display:flex;justify-content:center;padding:56px 0}
.bp-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.bp-msg{color:var(--color-text-muted);font-size:.94rem;padding:22px 0;margin:0}
.bp-msg--err{color:#c0392b}
.bp-row{display:flex;align-items:center;gap:20px;width:100%;background:none;border:none;border-top:2px solid var(--color-text);padding:22px 4px;cursor:pointer;color:var(--color-text);text-align:left;transition:.16s}
.bp-row:last-of-type{border-bottom:2px solid var(--color-text)}
.bp-row:hover{padding-left:16px;background:color-mix(in srgb,var(--color-primary) 7%,transparent)}
.bp-row__n{font-size:1.5rem;font-weight:900;color:var(--color-primary);flex:0 0 auto;letter-spacing:-.04em}
.bp-row__t{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.bp-row__t b{font-size:1.3rem;font-weight:800;letter-spacing:-.02em}
.bp-row__t i{font-style:normal;font-size:.84rem;color:var(--color-text-muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.bp-row__m{flex:0 0 auto;text-align:right;display:flex;flex-direction:column;gap:2px}
.bp-row__m em{font-style:normal;font-weight:900;font-size:1.05rem;color:var(--color-text)}
.bp-row__m i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.bp-row__a{flex:0 0 auto;font-size:1.2rem;color:var(--color-primary);opacity:0;transition:.16s}
.bp-row:hover .bp-row__a{opacity:1}
.bp-bar{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap}
.bp-bar button{width:40px;height:40px;border-radius:50%;border:2px solid var(--color-text);background:none;color:var(--color-text);cursor:pointer;font-size:1rem;transition:.15s;flex:0 0 auto}
.bp-bar button:hover{background:var(--color-text);color:var(--color-bg)}
.bp-bar b{font-size:1.6rem;font-weight:900;letter-spacing:-.02em;color:var(--color-text)}
.bp-bar button.bp-bar__m{width:auto!important;height:auto!important;border-radius:99px!important;border-width:1px!important;padding:7px 14px;font-size:.76rem;font-weight:800;margin-left:auto;color:var(--color-text-muted)!important}
.bp-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.bp-staff button{display:flex;flex-direction:column;align-items:flex-start;gap:5px;padding:18px;background:none;border:2px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);transition:.16s;text-align:left}
.bp-staff button:hover{border-color:var(--color-primary)}
.bp-staff b{font-size:1.05rem;font-weight:800}
.bp-staff i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.bp-av{width:52px;height:52px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;margin-bottom:4px}
.bp-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none}
.bp-cal-box{max-width:460px}
.bp-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.bp-mnav b{font-weight:900;font-size:1.1rem;color:var(--color-text)}
.bp-mnav button{width:36px;height:36px;border-radius:50%;border:2px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.bp-mnav button:hover:not(:disabled){border-color:var(--color-primary);color:var(--color-primary)}
.bp-mnav button:disabled{opacity:.25;cursor:not-allowed}
.bp-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.bp-dow span{text-align:center;font-size:.68rem;font-weight:900;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em}
.bp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.bp-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:800;font-size:.92rem;opacity:.28;border-radius:50%}
.bp-day.is-av{opacity:1;color:var(--color-text);border:2px solid var(--color-border);cursor:pointer;transition:.12s}
.bp-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bp-empty{margin-top:16px;text-align:center}
.bp-empty p{margin:0 0 10px;font-size:.88rem;color:var(--color-text-muted)}
.bp-empty b{color:var(--color-text)}
.bp-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.bp-empty button{background:none;border:2px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:8px 15px;font-size:.78rem;font-weight:800;cursor:pointer}
.bp-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.bp-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px;max-width:620px}
.bp-slots button{padding:14px 6px;border:2px solid var(--color-border);background:none;color:var(--color-text);font-weight:800;font-size:.95rem;border-radius:99px;cursor:pointer;transition:.12s}
.bp-slots button:hover:not(.is-off){background:var(--color-text);color:var(--color-bg);border-color:var(--color-text)}
.bp-slots button.is-off{opacity:.25;text-decoration:line-through;cursor:not-allowed}
.bp-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;max-width:700px}
.bp-form label{display:flex;flex-direction:column;gap:6px}
.bp-form label>span{font-size:.74rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text)}
.bp-form label i{font-style:normal;color:var(--color-primary)}
.bp-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.bp-form input,.bp-form textarea{border:none;border-bottom:2px solid var(--color-border);background:none;color:var(--color-text);padding:9px 2px;font-size:1rem;font-family:inherit;outline:none;transition:border-color .14s}
.bp-form input:focus,.bp-form textarea:focus{border-color:var(--color-primary)}
.bp-form small{color:#c0392b;font-size:.73rem;font-weight:700}
.bp-form textarea{grid-column:1/-1}
.bp-pay{display:flex;gap:10px;grid-column:1/-1}
.bp-pay button{flex:1;border:2px solid var(--color-border);background:none;color:var(--color-text);border-radius:99px;padding:12px;font-weight:800;cursor:pointer;transition:.14s}
.bp-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 12%,transparent)}
.bp-sticky{position:sticky;bottom:0;left:0;right:0;margin:0 -20px;padding:12px 20px;background:color-mix(in srgb,var(--color-bg) 92%,transparent);backdrop-filter:blur(10px);border-top:2px solid var(--color-text);z-index:5}
.bp-sticky__in{max-width:860px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bp-sticky__in b{display:block;font-weight:800;font-size:.95rem;color:var(--color-text)}
.bp-sticky__in span{font-size:.78rem;color:var(--color-text-muted)}
.bp-sticky__r{display:flex;align-items:center;gap:14px}
.bp-sticky__r em{font-style:normal;font-weight:900;font-size:1.2rem;color:var(--color-text)}
.bp-sticky__r button{border:none;background:var(--color-primary);color:var(--color-on-primary,#fff);border-radius:99px;padding:13px 26px;font-weight:900;font-size:.92rem;cursor:pointer;transition:.14s}
.bp-sticky__r button:hover:not(:disabled){filter:brightness(1.08)}
.bp-sticky__r button:disabled{opacity:.4;cursor:not-allowed}
.bp-done{text-align:center;padding:20px 0}
.bp-done__c{width:66px;height:66px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.9rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}
.bp-done h3{font-size:2rem;font-weight:900;letter-spacing:-.02em;margin:0 0 8px;color:var(--color-text)}
.bp-done>p{color:var(--color-text-muted);margin:0 0 24px}
.bp-done__g{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;max-width:640px;margin:0 auto;text-align:left}
.bp-done__g span{display:flex;flex-direction:column;gap:3px;border-top:2px solid var(--color-text);padding-top:9px}
.bp-done__g i{font-style:normal;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.09em;color:var(--color-text-muted)}
.bp-done__g b{font-weight:800;font-size:.95rem;color:var(--color-text)}
`;
