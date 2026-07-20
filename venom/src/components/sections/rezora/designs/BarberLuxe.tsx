"use client";

/**
 * barber-01 — „Luxe": tmavý editoriální dvousloupec. Vlevo velký serif titul +
 * vertikální stepper a živý souhrn, vpravo interaktivní tok. Zlaté akcenty,
 * verzálky s prostrkáním. Dědí barvy z motivu šablony (zlatá = --color-primary).
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, fmtShortDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.24 } };

export function BarberLuxe({ b, sectionId }: DesignProps) {
  const editable = b.step === 0 && !b.done;
  const st = useStaffStep(b, ["Služba", "Barber", "Termín", "Čas", "Kontakt"]);
  const { hasStaff, steps: STEPS, vstep } = st;
  return (
    <section id="rezervace" className="bl" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bl-grid">
        {/* levý editoriální sloupec */}
        <aside className="bl-aside">
          <span className="bl-kicker">Rezervace online</span>
          <h2 className="bl-title">{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p className="bl-sub">{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>

          {!b.done && (
            <ol className="bl-steps">
              {STEPS.map((label, i) => (
                <li key={label} className={i === vstep ? "is-active" : i < vstep ? "is-done" : ""}>
                  <span className="bl-steps__n">{i < vstep ? "✓" : `0${i + 1}`}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          )}

          {b.service && !b.done && (
            <div className="bl-recap">
              <span className="bl-recap__svc">{b.service.name}</span>
              {b.selStaff && <span className="bl-recap__row">u {b.selStaff.name}</span>}
              {b.date && <span className="bl-recap__row">{fmtShortDate(b.date)}{b.time ? ` · ${b.time}` : ""}</span>}
              <span className="bl-recap__price">{fmtPrice(Number(b.service.price), b.service.currency)}</span>
            </div>
          )}
        </aside>

        {/* pravý interaktivní sloupec */}
        <div className="bl-panel">
          {b.loading && <div className="bl-load"><span className="bl-spin" /></div>}
          {b.loadErr && !b.loading && <p className="bl-err">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="bl-err">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim}>
                  <ul className="bl-list">
                    {b.services.map((s, i) => (
                      <li key={s.id}>
                        <button onClick={() => b.pickService(s)}>
                          <span className="bl-list__n">{pad(i + 1)}</span>
                          <span className="bl-list__b">
                            <span className="bl-list__name">{s.name}</span>
                            {s.description && <span className="bl-list__desc">{s.description}</span>}
                          </span>
                          <span className="bl-list__meta">
                            <span className="bl-list__price">{fmtPrice(Number(s.price), s.currency)}</span>
                            <span className="bl-list__dur">{fmtDuration(s.duration_minutes)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                    {b.services.length === 0 && <p className="bl-err">Momentálně nejsou k dispozici žádné služby.</p>}
                  </ul>
                </motion.div>
              )}

              {/* KROK Barber — samostatný, jen když je personál a ještě není zvolen */}
              {st.showStaffPicker && b.service && (
                <motion.div key="s1-staff" {...anim}>
                  <div className="bl-back">
                    <button onClick={() => b.setStep(0)} aria-label="Zpět">‹</button>
                    <strong>Vyberte barbera</strong>
                  </div>
                  <div className="bl-staff">
                    <button className="bl-staff__card bl-staff__any" onClick={() => st.pickStaff(null)}>
                      <span className="bl-staff__ico">✦</span>
                      <span className="bl-staff__nm">Kdokoli</span>
                      <span className="bl-staff__role">Nejbližší volný termín</span>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} className="bl-staff__card" onClick={() => st.pickStaff(m)}>
                        {m.avatar_url
                          ? <img className="bl-staff__av" src={m.avatar_url} alt={m.name} />
                          : <span className="bl-staff__av bl-staff__av--txt" style={{ background: m.color || "var(--color-primary)" }}>{m.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>}
                        <span className="bl-staff__nm">{m.name}</span>
                        {m.bio && <span className="bl-staff__role">{m.bio}</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* KROK Termín — kalendář (po volbě barbera, nebo rovnou když není personál) */}
              {st.showCalendar && b.service && (
                <motion.div key="s1-cal" {...anim}>
                  <div className="bl-back">
                    <button onClick={st.backFromCalendar} aria-label="Zpět">‹</button>
                    <strong>Vyberte termín</strong>
                  </div>
                  {hasStaff && (
                    <button className="bl-change" onClick={() => st.setStaffChosen(false)}>
                      <span>Barber: <b>{b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli"}</b></span>
                      <span className="bl-change__act">změnit</span>
                    </button>
                  )}
                  <div className="bl-calnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <strong>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</strong>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="bl-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="bl-load"><span className="bl-spin" /></div> : (
                    <>
                      <div className="bl-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`bl-day ${av ? "is-av" : "is-off"}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="bl-empty">
                          <p>
                            {b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volný termín.</> : "V tomto měsíci nejsou volné termíny."}
                          </p>
                          <div className="bl-empty__acts">
                            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                            {hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Zvolit jiného barbera</button>}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <BackBar b={b} to={1} label={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="bl-load"><span className="bl-spin" /></div> : b.slots.length === 0 ? (
                    <p className="bl-err">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="bl-slots">
                      {b.slots.map((s) => <button key={s.time} className={s.available ? "" : "is-off"} disabled={!s.available} onClick={() => b.pickTime(s.time)}>{s.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <BackBar b={b} to={2} label="Vaše kontaktní údaje" />
                  <div className="bl-form">
                    <label>
                      <span className="bl-lb">Jméno a příjmení <i>*</i></span>
                      <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" />
                    </label>
                    <label>
                      <span className="bl-lb">
                        E-mail {b.rules.requireEmail ? <i>*</i> : <span className="bl-optional">(nepovinné)</span>}
                      </span>
                      <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
                      {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && (
                        <em className="bl-hint">Zadejte e-mail ve tvaru jan@email.cz</em>
                      )}
                    </label>
                    <label>
                      <span className="bl-lb">
                        Telefon {b.rules.requirePhone ? <i>*</i> : <span className="bl-optional">(nepovinné)</span>}
                      </span>
                      <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" />
                    </label>
                    <label>
                      <span className="bl-lb">Poznámka <span className="bl-optional">(nepovinné)</span></span>
                      <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} />
                    </label>
                    {b.paymentMethods > 1 && (
                      <div className="bl-pay">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="bl-err">{b.submitErr}</p>}
                  <button className="bl-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="bl-done">
                  <span className="bl-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Detaily jsme poslali na <strong>{b.form.clientEmail}</strong>.</p>
                  <div className="bl-done__t">
                    <strong>{b.service.name}</strong>
                    <span>{fmtLongDate(b.date)}</span>
                    <span>{b.time} – {addMinutes(b.time, b.totalDuration)}</span>
                    <span>{b.selStaff ? `Barber: ${b.selStaff.name}` : b.provider.name}</span>
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

function BackBar({ b, to, label }: { b: DesignProps["b"]; to: 0 | 1 | 2 | 3; label: string }) {
  return (
    <div className="bl-back">
      <button onClick={() => b.setStep(to)} aria-label="Zpět">‹</button>
      <strong>{label}</strong>
    </div>
  );
}

const CSS = `
.bl{padding:76px 20px;color:var(--color-text)}
.bl-grid{max-width:1040px;margin:0 auto;display:grid;grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr);gap:48px;align-items:start}
@media(max-width:860px){.bl-grid{grid-template-columns:1fr;gap:28px}}
.bl-aside{position:sticky;top:32px}
@media(max-width:860px){.bl-aside{position:static}}
.bl-kicker{font-size:.72rem;font-weight:800;letter-spacing:.28em;text-transform:uppercase;color:var(--color-primary)}
.bl-title{font-family:var(--font-display,inherit);font-size:clamp(2rem,4.5vw,3.2rem);line-height:1.02;font-weight:800;margin:14px 0 12px;color:var(--color-text)}
.bl-sub{color:var(--color-text-muted);font-size:.98rem;line-height:1.5;max-width:36ch;margin:0}
.bl-steps{list-style:none;margin:36px 0 0;padding:0;display:flex;flex-direction:column;gap:2px}
.bl-steps li{display:flex;align-items:center;gap:14px;padding:9px 0;font-weight:700;font-size:.95rem;opacity:.4;transition:opacity .2s}
.bl-steps li.is-active,.bl-steps li.is-done{opacity:1}
.bl-steps__n{width:34px;font-family:var(--font-display,inherit);font-size:1rem;color:var(--color-primary);letter-spacing:.05em}
.bl-recap{margin-top:32px;padding-top:24px;border-top:1px solid var(--color-border);display:flex;flex-direction:column;gap:5px}
.bl-recap__svc{font-family:var(--font-display,inherit);font-size:1.25rem;font-weight:700}
.bl-recap__row{font-size:.88rem;color:var(--color-text-muted)}
.bl-recap__price{font-size:1.35rem;font-weight:800;color:var(--color-primary);margin-top:6px}
.bl-panel{min-height:280px}
.bl-load{display:flex;justify-content:center;padding:60px 0}
.bl-spin{width:28px;height:28px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.bl-err{color:var(--color-text-muted);font-size:.92rem;padding:24px 0}
.bl-team{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:22px}
.bl-team__c{display:inline-flex;align-items:center;gap:8px;font-size:.82rem;font-weight:700;color:var(--color-text-muted)}
.bl-team__c img,.bl-team__c em{width:32px;height:32px;border-radius:50%;object-fit:cover;font-style:normal;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700}
.bl-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.bl-list li{border-top:1px solid var(--color-border)}
.bl-list li:last-child{border-bottom:1px solid var(--color-border)}
.bl-list button{width:100%;display:flex;align-items:center;gap:18px;padding:20px 6px;background:none;border:none;cursor:pointer;text-align:left;color:var(--color-text);transition:padding .18s}
.bl-list button:hover{padding-left:16px}
.bl-list__n{font-family:var(--font-display,inherit);font-size:1.1rem;color:var(--color-primary);opacity:.55;width:26px;flex:0 0 auto}
.bl-list__b{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.bl-list__name{font-family:var(--font-display,inherit);font-size:1.2rem;font-weight:700}
.bl-list__desc{font-size:.84rem;color:var(--color-text-muted);overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.bl-list__meta{text-align:right;flex:0 0 auto;display:flex;flex-direction:column;gap:2px}
.bl-list__price{font-weight:800;color:var(--color-primary)}
.bl-list__dur{font-size:.78rem;color:var(--color-text-muted)}
.bl-back{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.bl-back button{width:42px;height:42px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.4rem;cursor:pointer;transition:.15s}
.bl-back button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bl-back strong{font-family:var(--font-display,inherit);font-size:1.4rem;font-weight:700;color:var(--color-text)}
.bl-change{display:inline-flex;align-items:center;gap:12px;margin:0 0 18px;background:color-mix(in srgb,var(--color-primary) 8%,transparent);border:1px solid var(--color-border);color:var(--color-text);border-radius:999px;padding:8px 8px 8px 16px;font-size:.84rem;font-weight:600;cursor:pointer;transition:.15s;line-height:1}
.bl-change b{font-weight:800}
.bl-change:hover{border-color:var(--color-primary)}
.bl-change__act{background:var(--color-primary);color:var(--color-on-primary,#fff);border-radius:999px;padding:5px 12px;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.bl-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
.bl-staff__card{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:22px 14px;background:none;border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);transition:.16s}
.bl-staff__card:hover{border-color:var(--color-primary);transform:translateY(-2px)}
.bl-staff__av{width:64px;height:64px;border-radius:50%;object-fit:cover}
.bl-staff__av--txt{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem}
.bl-staff__ico{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;border:1.5px dashed var(--color-border);color:var(--color-primary)}
.bl-staff__nm{font-family:var(--font-display,inherit);font-size:1.05rem;font-weight:700}
.bl-staff__role{font-size:.76rem;color:var(--color-text-muted);line-height:1.3}
.bl-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
.bl-pills button{border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:999px;padding:8px 16px;font-size:.85rem;font-weight:700;cursor:pointer;transition:.15s}
.bl-pills button.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bl-calnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.bl-calnav strong{font-family:var(--font-display,inherit);font-size:1.15rem;font-weight:700}
.bl-calnav button{width:40px;height:40px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.15s}
.bl-calnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.bl-calnav button:disabled{opacity:.25;cursor:not-allowed}
.bl-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:8px}
.bl-dow span{text-align:center;font-size:.7rem;font-weight:800;letter-spacing:.08em;color:var(--color-text-muted);text-transform:uppercase}
.bl-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.bl-day{aspect-ratio:1;border-radius:calc(var(--radius,12px)*.7);border:1px solid transparent;background:none;color:var(--color-text-muted);font-weight:700;font-size:.92rem;cursor:default}
.bl-day.is-av{border-color:var(--color-border);color:var(--color-text);cursor:pointer;transition:.13s}
.bl-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bl-day.is-off{opacity:.3}
.bl-empty{margin-top:18px;padding:18px;border:1px dashed var(--color-border);border-radius:var(--radius,12px);text-align:center}
.bl-empty p{margin:0 0 12px;color:var(--color-text-muted);font-size:.92rem}
.bl-empty b{color:var(--color-text)}
.bl-empty__acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.bl-empty__acts button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:999px;padding:9px 16px;font-size:.82rem;font-weight:700;cursor:pointer;transition:.15s}
.bl-empty__acts button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.bl-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
.bl-slots button{padding:13px 8px;border-radius:calc(var(--radius,12px)*.7);border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:700;font-size:.92rem;cursor:pointer;transition:.13s}
.bl-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.bl-slots button.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed}
.bl-form{display:flex;flex-direction:column;gap:15px}
.bl-form label{display:flex;flex-direction:column;gap:6px;font-size:.82rem;font-weight:800;letter-spacing:.02em;color:var(--color-text)}
.bl-form label i{font-style:normal;color:var(--color-primary)}
.bl-form label span{font-weight:400;color:var(--color-text-muted)}
.bl-hint{font-style:normal;font-size:.75rem;font-weight:600;color:#e07a5f;margin-top:2px}
.bl-form input,.bl-form textarea{border:none;border-bottom:1.5px solid var(--color-border);background:none;padding:9px 2px;font-size:.98rem;font-weight:400;color:var(--color-text);font-family:inherit;outline:none;transition:border-color .15s}
.bl-form input:focus,.bl-form textarea:focus{border-color:var(--color-primary)}
.bl-pay{display:flex;gap:10px}
.bl-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:calc(var(--radius,12px)*.7);padding:12px;font-weight:700;cursor:pointer;transition:.15s}
.bl-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 12%,transparent)}
.bl-cta{width:100%;margin-top:22px;padding:16px;border:none;border-radius:999px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:1rem;letter-spacing:.02em;cursor:pointer;transition:.15s}
.bl-cta:hover:not(:disabled){filter:brightness(1.08)}
.bl-cta:disabled{opacity:.45;cursor:not-allowed}
.bl-done{text-align:center;padding:30px 0}
.bl-done__c{width:70px;height:70px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:2rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.bl-done h3{font-family:var(--font-display,inherit);font-size:1.8rem;font-weight:700;margin:0 0 10px;color:var(--color-text)}
.bl-done>p{color:var(--color-text-muted);margin:0 0 22px}
.bl-done__t{display:inline-flex;flex-direction:column;gap:5px;text-align:left;border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:18px 24px}
.bl-done__t strong{font-family:var(--font-display,inherit);font-size:1.15rem}
.bl-done__t span{font-size:.86rem;color:var(--color-text-muted)}
`;
