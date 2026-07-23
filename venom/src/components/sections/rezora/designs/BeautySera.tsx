"use client";

/**
 * beauty-02 „Séra" — bespoke luxe split rezervace.
 * Vlevo tmavě hnědý brand panel (diamant, Montserrat titul, trust body, gold glow),
 * vpravo elegantní booking karta s kroky/službami/kalendářem/sloty/formulářem.
 * Paleta: coffee brown #523E35 / dark #2A211C / gold #B98A54 / cream #F6F1EB, Montserrat.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.19 } };

export function BeautySera({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Specialistka", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="bcr" data-template="beauty-02">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bcr-wrap">
        {/* Brand panel */}
        <aside className="bcr-aside" aria-hidden={false}>
          <div className="bcr-aside__glow" aria-hidden />
          <div className="bcr-aside__in">
            <svg className="bcr-mark" width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#C9A26A" strokeWidth={1.5} strokeLinejoin="round" aria-hidden="true"><path d="M11 6 H29 L36 15 L20 35 L4 15 Z" /><path d="M4 15 H36" /><path d="M11 6 L15 15 L20 35 M29 6 L25 15 L20 35 M15 15 H25" /></svg>
            <span className="bcr-eyebrow">Rezervace online</span>
            <h2 className="bcr-title">{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
            <p className="bcr-sub">{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
            <ul className="bcr-trust">
              <li><i>✦</i> Okamžité potvrzení e-mailem</li>
              <li><i>✦</i> Otevřeno 7 dní · 13:00–22:30</li>
              <li><i>✦</i> Bez registrace, zcela zdarma</li>
            </ul>
            {b.provider?.name && <div className="bcr-prov">{b.provider.name}</div>}
          </div>
        </aside>

        {/* Booking card */}
        <div className="bcr-card">
          {!b.done && (
            <div className="bcr-steps">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
              ))}
            </div>
          )}

          <div className="bcr-body">
            {b.loading && <div className="bcr-load"><span className="bcr-spin" /></div>}
            {b.loadErr && !b.loading && <p className="bcr-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="bcr-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="bcr-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="bcr-list__b">
                          <b>{svc.name}</b>
                          {svc.description && <i>{svc.description}</i>}
                        </span>
                        <span className="bcr-list__m">
                          <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                          <small>{fmtDuration(svc.duration_minutes)}</small>
                        </span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="bcr-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <Bar onBack={() => b.setStep(0)} t="Kdo se o vás postará?" />
                    <div className="bcr-staff">
                      <button onClick={() => st.pickStaff(null)}>
                        <span className="bcr-av bcr-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                      </button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="bcr-av" src={m.avatar_url} alt={m.name} />
                            : <span className="bcr-av" style={{ background: m.color || "#523E35" }}>{m.name[0]}</span>}
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
                    <div className="bcr-cal-box">
                      <div className="bcr-mnav">
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                        <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                      </div>
                      <div className="bcr-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                      {b.datesLoading ? <div className="bcr-load"><span className="bcr-spin" /></div> : (
                        <>
                          <div className="bcr-cal">
                            {b.cells.map((d, i) => {
                              if (!d) return <span key={`p${i}`} />;
                              const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                              return <button key={ds} className={`bcr-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                            })}
                          </div>
                          {b.dates.size === 0 && (
                            <div className="bcr-empty">
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
                    {b.slotsLoading ? <div className="bcr-load"><span className="bcr-spin" /></div> : b.slots.length === 0 ? (
                      <p className="bcr-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="bcr-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <Bar onBack={() => b.setStep(2)} t="Vaše údaje" />
                    <div className="bcr-form">
                      <label><span>Jméno a příjmení <i>*</i></span>
                        <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                      <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                        {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                      <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                        <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                      <label className="bcr-wide"><span>Poznámka <em>(nepovinné)</em></span>
                        <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                      {b.paymentMethods > 1 && (
                        <div className="bcr-pay bcr-wide">
                          {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                          {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                        </div>
                      )}
                    </div>
                    {b.submitErr && <p className="bcr-msg bcr-msg--err">{b.submitErr}</p>}
                    <button className="bcr-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="bcr-done">
                    <span className="bcr-done__c">✓</span>
                    <h3>Těšíme se na vás</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <ul className="bcr-done__l">
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

          {/* živý souhrn */}
          {b.service && !b.done && (
            <div className="bcr-chip">
              <b>{b.service.name}</b>
              <span>
                {b.selStaff ? `${b.selStaff.name.split(" ")[0]} · ` : ""}
                {b.date ? fmtLongDate(b.date) : "vyberte termín"}{b.time ? ` · ${b.time}` : ""}
              </span>
              <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Bar({ onBack, t, meta, onMeta }: { onBack: () => void; t: string; meta?: string; onMeta?: () => void }) {
  return (
    <div className="bcr-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{t}</b>
      {meta && <button className="bcr-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const F = "var(--font-montserrat), 'Montserrat', system-ui, sans-serif";
const CSS = `
.bcr{padding:clamp(64px,8vw,110px) clamp(20px,5vw,64px);background:#F6F1EB;font-family:${F}}
.bcr-wrap{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:0.82fr 1.18fr;border-radius:22px;overflow:hidden;box-shadow:0 40px 90px -50px rgba(26,33,15,.55)}
.bcr *{font-family:${F}}
/* aside */
.bcr-aside{position:relative;background:linear-gradient(160deg,#2A211C 0%,#3A2C22 100%);color:#fff;overflow:hidden}
.bcr-aside__glow{position:absolute;top:-80px;right:-60px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(201,162,106,.32),transparent 68%);pointer-events:none}
.bcr-aside__in{position:relative;padding:clamp(34px,4vw,52px);display:flex;flex-direction:column;height:100%}
.bcr-mark{margin-bottom:26px}
.bcr-eyebrow{font-size:11.5px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#C9A26A;margin-bottom:16px}
.bcr-title{font-size:clamp(1.7rem,2.6vw,2.5rem);font-weight:800;line-height:1.04;letter-spacing:-.02em;margin:0 0 16px;color:#fff}
.bcr-sub{font-size:.95rem;line-height:1.6;color:rgba(255,255,255,.7);margin:0 0 28px;max-width:300px}
.bcr-trust{list-style:none;margin:0 0 auto;padding:0;display:flex;flex-direction:column;gap:13px}
.bcr-trust li{display:flex;align-items:center;gap:11px;font-size:.9rem;font-weight:500;color:rgba(255,255,255,.9)}
.bcr-trust i{font-style:normal;color:#C9A26A;font-size:.95rem;flex:0 0 auto}
.bcr-prov{margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12);font-size:.82rem;font-weight:700;letter-spacing:.04em;color:rgba(255,255,255,.65)}
/* card */
.bcr-card{position:relative;background:#fff;padding:clamp(28px,3.2vw,44px)}
.bcr-steps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:24px}
.bcr-steps span{font-size:.68rem;font-weight:700;letter-spacing:.03em;color:#6B5D52;background:#F6F1EB;border:1px solid rgba(82,62,53,.16);border-radius:99px;padding:6px 12px;opacity:.7}
.bcr-steps span.is-on{opacity:1;background:#523E35;border-color:#523E35;color:#fff}
.bcr-steps span.is-done{opacity:1;color:#523E35;border-color:rgba(82,62,53,.4)}
.bcr-body{position:relative;min-height:240px}
.bcr-load{display:flex;justify-content:center;padding:60px 0}
.bcr-spin{width:26px;height:26px;border-radius:50%;border:3px solid rgba(82,62,53,.18);border-top-color:#523E35;animation:bcrspin .7s linear infinite;display:inline-block}
@keyframes bcrspin{to{transform:rotate(360deg)}}
.bcr-msg{text-align:center;color:#6B5D52;font-size:.9rem;padding:24px 0;margin:0}
.bcr-msg--err{color:#c0392b}
.bcr-list{display:flex;flex-direction:column;gap:9px}
.bcr-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:#FBF8F4;border:1px solid rgba(82,62,53,.14);border-radius:14px;padding:16px 20px;cursor:pointer;color:#1A210F;text-align:left;transition:.2s cubic-bezier(.22,1,.36,1)}
.bcr-list button:hover{border-color:#523E35;transform:translateX(4px);box-shadow:0 12px 30px -18px rgba(82,62,53,.6)}
.bcr-list__b{min-width:0}
.bcr-list__b b{display:block;font-size:1rem;font-weight:700}
.bcr-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:#6B5D52;margin-top:3px}
.bcr-list__m{flex:0 0 auto;text-align:right}
.bcr-list__m em{font-style:normal;display:block;font-weight:800;color:#523E35;font-size:1.02rem}
.bcr-list__m small{font-size:.74rem;color:#6B5D52}
.bcr-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.bcr-bar button{width:38px;height:38px;border-radius:50%;border:1px solid rgba(82,62,53,.22);background:#fff;color:#1A210F;font-size:1.3rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.bcr-bar button:hover{background:#523E35;color:#fff;border-color:#523E35}
.bcr-bar b{font-size:1.1rem;font-weight:800;color:#1A210F}
.bcr-bar button.bcr-bar__m{width:auto;height:auto;border-radius:99px;padding:7px 13px;font-size:.72rem;font-weight:700;margin-left:auto;color:#6B5D52}
.bcr-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px}
.bcr-staff button{display:flex;flex-direction:column;align-items:center;gap:7px;padding:18px 10px;background:#FBF8F4;border:1px solid rgba(82,62,53,.14);border-radius:14px;cursor:pointer;color:#1A210F;text-align:center;transition:.18s}
.bcr-staff button:hover{border-color:#523E35;transform:translateY(-2px)}
.bcr-staff b{font-size:.9rem;font-weight:700}
.bcr-staff i{font-style:normal;font-size:.71rem;color:#6B5D52}
.bcr-av{width:58px;height:58px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.25rem}
.bcr-av--any{border:1.5px dashed rgba(82,62,53,.3);color:#B98A54;background:none}
.bcr-cal-box{max-width:400px;margin:0 auto}
.bcr-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.bcr-mnav b{font-weight:800;color:#1A210F}
.bcr-mnav button{width:33px;height:33px;border-radius:50%;border:1px solid rgba(82,62,53,.22);background:#fff;color:#1A210F;cursor:pointer}
.bcr-mnav button:hover:not(:disabled){background:#523E35;color:#fff}
.bcr-mnav button:disabled{opacity:.25;cursor:not-allowed}
.bcr-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.bcr-dow span{text-align:center;font-size:.64rem;font-weight:700;color:#6B5D52;text-transform:uppercase}
.bcr-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.bcr-day{aspect-ratio:1;border:none;background:none;color:#6B5D52;font-weight:600;font-size:.85rem;opacity:.3;border-radius:50%}
.bcr-day.is-av{opacity:1;color:#1A210F;background:#F6F1EB;cursor:pointer;transition:.12s}
.bcr-day.is-av:hover{background:#523E35;color:#fff}
.bcr-empty{margin-top:14px;text-align:center}
.bcr-empty p{margin:0 0 10px;font-size:.84rem;color:#6B5D52}
.bcr-empty b{color:#1A210F}
.bcr-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.bcr-empty button{background:none;border:1px solid rgba(82,62,53,.22);color:#1A210F;border-radius:99px;padding:8px 14px;font-size:.75rem;font-weight:700;cursor:pointer}
.bcr-empty button:hover{border-color:#523E35;color:#523E35}
.bcr-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
.bcr-slots button{padding:12px 6px;border:1px solid rgba(82,62,53,.18);background:#FBF8F4;color:#1A210F;font-weight:700;font-size:.88rem;border-radius:10px;cursor:pointer;transition:.14s}
.bcr-slots button:hover:not(.is-off){background:#523E35;color:#fff;border-color:#523E35;transform:translateY(-1px)}
.bcr-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.bcr-form{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:520px){.bcr-form{grid-template-columns:1fr}}
.bcr-wide{grid-column:1/-1}
.bcr-form label{display:flex;flex-direction:column;gap:5px}
.bcr-form label>span{font-size:.74rem;font-weight:700;color:#1A210F}
.bcr-form label i{font-style:normal;color:#523E35}
.bcr-form label em{font-style:normal;font-weight:400;color:#6B5D52}
.bcr-form input,.bcr-form textarea{border:1px solid rgba(82,62,53,.2);background:#FBF8F4;color:#1A210F;border-radius:10px;padding:12px 15px;font-size:.9rem;outline:none;transition:.14s}
.bcr-form textarea{border-radius:12px}
.bcr-form input:focus,.bcr-form textarea:focus{border-color:#523E35;background:#fff;box-shadow:0 0 0 3px rgba(82,62,53,.12)}
.bcr-form small{color:#c0392b;font-size:.71rem;font-weight:600;padding-left:6px}
.bcr-pay{display:flex;gap:9px}
.bcr-pay button{flex:1;border:1px solid rgba(82,62,53,.2);background:#FBF8F4;color:#1A210F;border-radius:10px;padding:11px;font-weight:700;font-size:.84rem;cursor:pointer;transition:.14s}
.bcr-pay button.is-on{border-color:#523E35;background:rgba(82,62,53,.1)}
.bcr-cta{width:100%;margin-top:18px;padding:16px;border:none;border-radius:10px;background:#523E35;color:#fff;font-weight:800;font-size:.92rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:.16s;box-shadow:0 16px 34px -18px rgba(82,62,53,.7)}
.bcr-cta:hover:not(:disabled){background:#6B5142;transform:translateY(-2px)}
.bcr-cta:disabled{opacity:.4;cursor:not-allowed}
.bcr-done{text-align:center;padding:16px 0}
.bcr-done__c{width:64px;height:64px;border-radius:50%;background:#523E35;color:#fff;font-size:1.85rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}
.bcr-done h3{font-size:1.5rem;font-weight:800;margin:0 0 8px;color:#1A210F}
.bcr-done>p{color:#6B5D52;margin:0 0 22px;font-size:.9rem}
.bcr-done__l{list-style:none;margin:0;padding:0;text-align:left;background:#FBF8F4;border-radius:14px;overflow:hidden}
.bcr-done__l li{display:flex;justify-content:space-between;gap:14px;padding:13px 18px;border-top:1px solid rgba(82,62,53,.12)}
.bcr-done__l li:first-child{border-top:none}
.bcr-done__l i{font-style:normal;font-size:.79rem;color:#6B5D52}
.bcr-done__l b{font-size:.88rem;font-weight:700;color:#1A210F;text-align:right}
.bcr-chip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:22px;background:#FBF8F4;border:1px solid rgba(82,62,53,.16);border-radius:14px;padding:14px 20px}
.bcr-chip b{font-size:.9rem;font-weight:800;color:#1A210F}
.bcr-chip span{font-size:.8rem;color:#6B5D52}
.bcr-chip em{font-style:normal;font-weight:800;color:#523E35;font-size:.98rem;margin-left:auto}
@media(max-width:820px){.bcr-wrap{grid-template-columns:1fr}.bcr-aside__in{padding:32px}.bcr-sub{max-width:none}.bcr-trust{flex-direction:row;flex-wrap:wrap;gap:10px 20px}}
`;
