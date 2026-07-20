"use client";

/**
 * barber-02 „Ticket" — jednosloupcová účtenka: perforované předěly, monospace
 * časy a ceny, vodorovné čipy kroků. Kompaktní, funguje i v úzkém sloupci.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2 } };

export function BarberTicket({ b, sectionId }: DesignProps) {
  const s = useStaffStep(b, ["Služba", "Barber", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="bt" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bt-wrap">
        <header className="bt-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="bt-ticket">
          <span className="bt-notch bt-notch--l" aria-hidden />
          <span className="bt-notch bt-notch--r" aria-hidden />

          {!b.done && (
            <div className="bt-chips">
              {s.steps.map((label, i) => (
                <span key={label} className={`bt-chip ${i === s.vstep ? "is-on" : i < s.vstep ? "is-done" : ""}`}>
                  {i < s.vstep ? "✓" : i + 1}<i>{label}</i>
                </span>
              ))}
            </div>
          )}

          <div className="bt-perf" aria-hidden />

          {b.loading && <div className="bt-load"><span className="bt-spin" /></div>}
          {b.loadErr && !b.loading && <p className="bt-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="bt-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim}>
                  {b.services.map((svc) => (
                    <button key={svc.id} className="bt-row" onClick={() => b.pickService(svc)}>
                      <span className="bt-row__l">
                        <b>{svc.name}</b>
                        <i>{fmtDuration(svc.duration_minutes)}</i>
                      </span>
                      <span className="bt-dots" aria-hidden />
                      <span className="bt-row__p">{fmtPrice(Number(svc.price), svc.currency)}</span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="bt-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {s.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <Bar onBack={() => b.setStep(0)} title="Vyberte barbera" />
                  <div className="bt-staff">
                    <button className="bt-staff__i" onClick={() => s.pickStaff(null)}>
                      <span className="bt-staff__av bt-staff__av--any">✦</span>
                      <b>Kdokoli</b><i>nejbližší termín</i>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} className="bt-staff__i" onClick={() => s.pickStaff(m)}>
                        {m.avatar_url
                          ? <img className="bt-staff__av" src={m.avatar_url} alt={m.name} />
                          : <span className="bt-staff__av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                        <b>{m.name.split(" ")[0]}</b>{m.bio && <i>{m.bio}</i>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {s.showCalendar && b.service && (
                <motion.div key="s1b" {...anim}>
                  <Bar onBack={s.backFromCalendar} title="Vyberte datum"
                    meta={s.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                    onMeta={s.hasStaff ? () => s.setStaffChosen(false) : undefined} />
                  <div className="bt-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="bt-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="bt-load"><span className="bt-spin" /></div> : (
                    <>
                      <div className="bt-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`bt-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="bt-empty">
                          <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volný termín.</> : "V tomto měsíci nejsou volné termíny."}</p>
                          <div>
                            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                            {s.hasStaff && b.selStaff && <button onClick={() => s.setStaffChosen(false)}>Jiný barber</button>}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <Bar onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="bt-load"><span className="bt-spin" /></div> : b.slots.length === 0 ? (
                    <p className="bt-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="bt-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <Bar onBack={() => b.setStep(2)} title="Vaše údaje" />
                  <div className="bt-sum">
                    <span><i>Služba</i><b>{b.service.name}</b></span>
                    {b.selStaff && <span><i>Barber</i><b>{b.selStaff.name}</b></span>}
                    <span><i>Kdy</i><b>{fmtLongDate(b.date)}, {b.time}–{addMinutes(b.time, b.totalDuration)}</b></span>
                    <span className="bt-sum__tot"><i>Celkem</i><b>{fmtPrice(Number(b.service.price), b.service.currency)}</b></span>
                  </div>
                  <div className="bt-form">
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
                      <div className="bt-pay">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="bt-msg bt-msg--err">{b.submitErr}</p>}
                  <button className="bt-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="bt-done">
                  <span className="bt-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <div className="bt-perf" aria-hidden />
                  <div className="bt-sum">
                    <span><i>Služba</i><b>{b.service.name}</b></span>
                    <span><i>Barber</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></span>
                    <span><i>Kdy</i><b>{fmtLongDate(b.date)}, {b.time}–{addMinutes(b.time, b.totalDuration)}</b></span>
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

function Bar({ onBack, title, meta, onMeta }: { onBack: () => void; title: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="bt-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{title}</b>
      {meta && <button className="bt-bar__meta" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.bt{padding:68px 20px}
.bt-wrap{max-width:520px;margin:0 auto}
.bt-head{text-align:center;margin-bottom:26px}
.bt-head h2{font-size:clamp(1.7rem,4vw,2.3rem);font-weight:800;margin:0 0 8px;line-height:1.1;color:var(--color-text)}
.bt-head p{margin:0;color:var(--color-text-muted);font-size:.94rem}
.bt-ticket{position:relative;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.2);padding:24px 22px;box-shadow:0 14px 44px -22px rgba(0,0,0,.5)}
.bt-notch{position:absolute;top:78px;width:20px;height:20px;border-radius:50%;background:var(--color-bg);border:1px solid var(--color-border)}
.bt-notch--l{left:-11px;clip-path:inset(0 0 0 50%)}
.bt-notch--r{right:-11px;clip-path:inset(0 50% 0 0)}
.bt-perf{border-top:2px dashed var(--color-border);margin:16px -22px 18px}
.bt-chips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap}
.bt-chip{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:800;color:var(--color-text-muted);background:var(--color-bg);border:1px solid var(--color-border);border-radius:999px;padding:5px 11px;opacity:.55}
.bt-chip i{font-style:normal;font-weight:700}
.bt-chip.is-on{opacity:1;background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bt-chip.is-done{opacity:1;color:var(--color-primary);border-color:var(--color-primary)}
.bt-load{display:flex;justify-content:center;padding:44px 0}
.bt-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.bt-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 4px;margin:0}
.bt-msg--err{color:#c0392b}
.bt-row{display:flex;align-items:baseline;gap:10px;width:100%;background:none;border:none;padding:14px 2px;cursor:pointer;color:var(--color-text);border-bottom:1px solid var(--color-border);text-align:left}
.bt-row:last-of-type{border-bottom:none}
.bt-row:hover b{color:var(--color-primary)}
.bt-row__l{display:flex;flex-direction:column;gap:2px;flex:0 0 auto;max-width:65%}
.bt-row__l b{font-size:1rem;font-weight:700;transition:color .14s}
.bt-row__l i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.bt-dots{flex:1;border-bottom:2px dotted var(--color-border);transform:translateY(-3px)}
.bt-row__p{flex:0 0 auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:800;color:var(--color-primary);font-size:.94rem}
.bt-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.bt-bar button{width:36px;height:36px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.25rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.bt-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bt-bar b{font-size:1.1rem;font-weight:800;color:var(--color-text)}
.bt-bar button.bt-bar__meta{width:auto!important;height:auto!important;border-radius:999px!important;padding:6px 12px;font-size:.74rem;font-weight:800;color:var(--color-text-muted)!important;margin-left:auto}
.bt-bar__meta:hover{color:var(--color-on-primary,#fff)!important}
.bt-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px}
.bt-staff__i{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;background:none;border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);transition:.15s;text-align:center}
.bt-staff__i:hover{border-color:var(--color-primary)}
.bt-staff__i b{font-size:.9rem;font-weight:800}
.bt-staff__i i{font-style:normal;font-size:.7rem;color:var(--color-text-muted);line-height:1.25}
.bt-staff__av{width:48px;height:48px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.bt-staff__av--any{border:1.5px dashed var(--color-border);color:var(--color-primary)}
.bt-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.bt-mnav b{font-weight:800;color:var(--color-text)}
.bt-mnav button{width:34px;height:34px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer;transition:.15s}
.bt-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.bt-mnav button:disabled{opacity:.25;cursor:not-allowed}
.bt-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.bt-dow span{text-align:center;font-size:.66rem;font-weight:800;letter-spacing:.06em;color:var(--color-text-muted);text-transform:uppercase}
.bt-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.bt-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:.86rem;opacity:.3;border-radius:6px}
.bt-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 9%,transparent);cursor:pointer;transition:.12s}
.bt-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.bt-empty{margin-top:14px;text-align:center}
.bt-empty p{margin:0 0 10px;font-size:.88rem;color:var(--color-text-muted)}
.bt-empty b{color:var(--color-text)}
.bt-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.bt-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:999px;padding:8px 14px;font-size:.78rem;font-weight:700;cursor:pointer}
.bt-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.bt-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:7px}
.bt-slots button{padding:11px 6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:.88rem;border-radius:6px;cursor:pointer;transition:.12s}
.bt-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bt-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.bt-sum{display:flex;flex-direction:column;gap:7px;margin-bottom:18px}
.bt-sum span{display:flex;justify-content:space-between;gap:14px;align-items:baseline;font-size:.86rem}
.bt-sum i{font-style:normal;color:var(--color-text-muted);flex:0 0 auto}
.bt-sum b{text-align:right;color:var(--color-text);font-weight:700}
.bt-sum__tot{border-top:1px dashed var(--color-border);padding-top:8px;margin-top:2px}
.bt-sum__tot b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--color-primary);font-size:1.05rem;font-weight:800}
.bt-form{display:flex;flex-direction:column;gap:13px}
.bt-form label{display:flex;flex-direction:column;gap:5px}
.bt-form label>span{font-size:.78rem;font-weight:800;color:var(--color-text)}
.bt-form label i{font-style:normal;color:var(--color-primary)}
.bt-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.bt-form input,.bt-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:6px;padding:10px 12px;font-size:.92rem;font-family:inherit;outline:none;transition:border-color .14s}
.bt-form input:focus,.bt-form textarea:focus{border-color:var(--color-primary)}
.bt-form small{color:#e07a5f;font-size:.72rem;font-weight:600}
.bt-pay{display:flex;gap:8px}
.bt-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:10px;font-weight:700;font-size:.85rem;cursor:pointer;transition:.14s}
.bt-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 12%,transparent)}
.bt-cta{width:100%;margin-top:18px;padding:14px;border:none;border-radius:8px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.95rem;letter-spacing:.03em;text-transform:uppercase;cursor:pointer;transition:.14s}
.bt-cta:hover:not(:disabled){filter:brightness(1.08)}
.bt-cta:disabled{opacity:.4;cursor:not-allowed}
.bt-done{text-align:center}
.bt-done__c{width:58px;height:58px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:6px auto 14px}
.bt-done h3{font-size:1.4rem;font-weight:800;margin:0 0 6px;color:var(--color-text)}
.bt-done>p{color:var(--color-text-muted);font-size:.88rem;margin:0}
.bt-done .bt-sum{text-align:left;margin-bottom:0}
`;
