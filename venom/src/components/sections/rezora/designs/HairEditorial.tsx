"use client";

/**
 * hair-02 „Editorial" — magazínový split. Levý obrazový panel reaguje na kontext
 * (fotka služby → fotka kadeřníka → shrnutí termínu), vpravo běží tok.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2 } };

export function HairEditorial({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Kadeřník", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  // kontextový vizuál levého panelu
  const heroImg = (st.showStaffPicker || (b.selStaff && b.step >= 1)) && b.selStaff?.avatar_url
    ? b.selStaff.avatar_url
    : b.service?.image_url || b.services.find((s) => s.image_url)?.image_url || "";

  return (
    <section id="rezervace" className="he" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="he-grid">
        {/* levý obrazový panel */}
        <aside className="he-visual">
          <div className="he-visual__img">
            {heroImg ? <img src={heroImg} alt="" /> : <span className="he-visual__ph" aria-hidden />}
            <span className="he-visual__veil" aria-hidden />
          </div>
          <div className="he-visual__txt">
            <span className="he-kicker">{b.done ? "Hotovo" : st.steps[st.vstep]}</span>
            <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
            {b.service && !b.done ? (
              <p className="he-visual__recap">
                <b>{b.service.name}</b>
                {b.selStaff && <span>{b.selStaff.name}</span>}
                {b.date && <span>{fmtLongDate(b.date)}{b.time ? ` · ${b.time}` : ""}</span>}
                <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
              </p>
            ) : (
              <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
            )}
          </div>
        </aside>

        {/* pravý tok */}
        <div className="he-flow">
          {!b.done && (
            <div className="he-rail">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{i < st.vstep ? "✓" : i + 1}</span>
              ))}
            </div>
          )}

          {b.loading && <div className="he-load"><span className="he-spin" /></div>}
          {b.loadErr && !b.loading && <p className="he-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="he-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

          {!b.loading && !b.loadErr && b.provider && (
            <AnimatePresence mode="wait" initial={false}>
              {b.step === 0 && (
                <motion.div key="s0" {...anim}>
                  <h3 className="he-h">Vyberte službu</h3>
                  <ul className="he-list">
                    {b.services.map((svc) => (
                      <li key={svc.id}>
                        <button onClick={() => b.pickService(svc)}>
                          <span><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                          <span className="he-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {b.services.length === 0 && <p className="he-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </motion.div>
              )}

              {st.showStaffPicker && b.service && (
                <motion.div key="s1a" {...anim}>
                  <Bar onBack={() => b.setStep(0)} t="Vyberte kadeřníka" />
                  <div className="he-staff">
                    <button onClick={() => st.pickStaff(null)}>
                      <span className="he-av he-av--any">✦</span>
                      <span><b>Kdokoli</b><i>nejbližší volný termín</i></span>
                    </button>
                    {b.staff.map((m) => (
                      <button key={m.id} onClick={() => st.pickStaff(m)}>
                        {m.avatar_url ? <img className="he-av" src={m.avatar_url} alt={m.name} />
                          : <span className="he-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                        <span><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
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
                  <div className="he-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="he-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="he-load"><span className="he-spin" /></div> : (
                    <>
                      <div className="he-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`he-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && (
                        <div className="he-empty">
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

              {b.step === 2 && b.service && b.date && (
                <motion.div key="s2" {...anim}>
                  <Bar onBack={() => b.setStep(1)} t={fmtLongDate(b.date)} />
                  {b.slotsLoading ? <div className="he-load"><span className="he-spin" /></div> : b.slots.length === 0 ? (
                    <p className="he-msg">Pro tento den nejsou volné termíny.</p>
                  ) : (
                    <div className="he-slots">
                      {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                    </div>
                  )}
                </motion.div>
              )}

              {b.step === 3 && b.service && b.date && b.time && (
                <motion.div key="s3" {...anim}>
                  <Bar onBack={() => b.setStep(2)} t="Vaše údaje" />
                  <div className="he-form">
                    <label><span>Jméno a příjmení <i>*</i></span>
                      <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jana Nováková" /></label>
                    <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jana@email.cz" />
                      {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jana@email.cz</small>}</label>
                    <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
                      <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
                    <label><span>Poznámka <em>(nepovinné)</em></span>
                      <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
                    {b.paymentMethods > 1 && (
                      <div className="he-pay">
                        {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                        {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
                      </div>
                    )}
                  </div>
                  {b.submitErr && <p className="he-msg he-msg--err">{b.submitErr}</p>}
                  <button className="he-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                    {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                  </button>
                </motion.div>
              )}

              {b.step === 4 && b.done && b.service && b.date && b.time && (
                <motion.div key="s4" {...anim} className="he-done">
                  <span className="he-done__c">✓</span>
                  <h3>Rezervace potvrzena</h3>
                  <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                  <ul className="he-done__l">
                    <li><i>Služba</i><b>{b.service.name}</b></li>
                    <li><i>Kadeřník</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                    <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                    <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                  </ul>
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
    <div className="he-bar">
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <h3 className="he-h">{t}</h3>
      {meta && <button className="he-bar__m" onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

const CSS = `
.he{padding:0}
.he-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);min-height:600px}
@media(max-width:900px){.he-grid{grid-template-columns:1fr}}
.he-visual{position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:44px 40px;min-height:420px;overflow:hidden}
@media(max-width:900px){.he-visual{min-height:280px;padding:32px 24px}}
.he-visual__img{position:absolute;inset:0}
.he-visual__img img{width:100%;height:100%;object-fit:cover}
.he-visual__ph{display:block;width:100%;height:100%;background:linear-gradient(140deg,color-mix(in srgb,var(--color-primary) 55%,#000),color-mix(in srgb,var(--color-primary) 18%,#000))}
.he-visual__veil{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82) 8%,rgba(0,0,0,.35) 48%,rgba(0,0,0,.12) 100%)}
.he-visual__txt{position:relative;color:#fff}
.he-kicker{display:inline-block;font-size:.68rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#fff;opacity:.75;margin-bottom:12px}
.he-visual h2{font-size:clamp(1.8rem,3.6vw,2.7rem);font-weight:700;line-height:1.06;margin:0 0 12px;color:#fff;letter-spacing:-.02em}
.he-visual p{margin:0;color:rgba(255,255,255,.82);font-size:.95rem;line-height:1.5;max-width:34ch}
.he-visual__recap{display:flex;flex-direction:column;gap:3px}
.he-visual__recap b{font-size:1.05rem;color:#fff}
.he-visual__recap span{font-size:.86rem;color:rgba(255,255,255,.72)}
.he-visual__recap em{font-style:normal;font-weight:800;font-size:1.2rem;color:#fff;margin-top:5px}
.he-flow{padding:44px 40px;display:flex;flex-direction:column;background:var(--color-surface,#fff)}
@media(max-width:900px){.he-flow{padding:30px 24px}}
.he-rail{display:flex;gap:8px;margin-bottom:26px}
.he-rail span{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.74rem;font-weight:800;background:var(--color-bg);border:1px solid var(--color-border);color:var(--color-text-muted)}
.he-rail span.is-on{background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary,#fff)}
.he-rail span.is-done{border-color:var(--color-primary);color:var(--color-primary)}
.he-h{font-size:1.3rem;font-weight:700;margin:0 0 16px;color:var(--color-text);letter-spacing:-.01em}
.he-load{display:flex;justify-content:center;padding:50px 0}
.he-spin{width:26px;height:26px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.he-msg{color:var(--color-text-muted);font-size:.92rem;padding:20px 0;margin:0}
.he-msg--err{color:#c0392b}
.he-list{list-style:none;margin:0;padding:0}
.he-list li{border-bottom:1px solid var(--color-border)}
.he-list li:first-child{border-top:1px solid var(--color-border)}
.he-list button{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;background:none;border:none;padding:16px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:padding .16s}
.he-list button:hover{padding-left:10px}
.he-list b{display:block;font-size:1rem;font-weight:700}
.he-list i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.8rem;color:var(--color-text-muted);margin-top:2px}
.he-list__m{flex:0 0 auto;text-align:right}
.he-list__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary)}
.he-list__m small{font-size:.75rem;color:var(--color-text-muted)}
.he-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.he-bar button{width:36px;height:36px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-size:1.25rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.he-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.he-bar .he-h{margin:0}
.he-bar button.he-bar__m{width:auto!important;height:auto!important;border-radius:99px!important;padding:6px 12px;font-size:.74rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.he-staff{display:flex;flex-direction:column;gap:9px}
.he-staff button{display:flex;align-items:center;gap:13px;padding:11px 13px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*1.2);cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.he-staff button:hover{border-color:var(--color-primary)}
.he-staff b{display:block;font-size:.96rem;font-weight:700}
.he-staff i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.he-av{width:46px;height:46px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.he-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.he-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.he-mnav b{font-weight:700;color:var(--color-text)}
.he-mnav button{width:32px;height:32px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);cursor:pointer}
.he-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.he-mnav button:disabled{opacity:.25;cursor:not-allowed}
.he-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.he-dow span{text-align:center;font-size:.67rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.he-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.he-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.86rem;opacity:.3;border-radius:8px}
.he-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.he-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.he-empty{margin-top:13px;text-align:center}
.he-empty p{margin:0 0 9px;font-size:.85rem;color:var(--color-text-muted)}
.he-empty b{color:var(--color-text)}
.he-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.he-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.76rem;font-weight:700;cursor:pointer}
.he-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.he-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:7px}
.he-slots button{padding:11px 6px;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.88rem;border-radius:8px;cursor:pointer;transition:.12s}
.he-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.he-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.he-form{display:flex;flex-direction:column;gap:12px}
.he-form label{display:flex;flex-direction:column;gap:5px}
.he-form label>span{font-size:.76rem;font-weight:700;color:var(--color-text)}
.he-form label i{font-style:normal;color:var(--color-primary)}
.he-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.he-form input,.he-form textarea{border:none;border-bottom:1px solid var(--color-border);background:none;color:var(--color-text);padding:9px 2px;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .14s}
.he-form input:focus,.he-form textarea:focus{border-color:var(--color-primary)}
.he-form small{color:#c0392b;font-size:.72rem;font-weight:600}
.he-pay{display:flex;gap:9px;margin-top:4px}
.he-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:8px;padding:11px;font-weight:700;font-size:.86rem;cursor:pointer;transition:.14s}
.he-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.he-cta{margin-top:20px;padding:14px;border:none;border-radius:8px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.94rem;cursor:pointer;transition:.14s}
.he-cta:hover:not(:disabled){filter:brightness(1.07)}
.he-cta:disabled{opacity:.4;cursor:not-allowed}
.he-done__c{width:58px;height:58px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.he-done h3{font-size:1.5rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.he-done>p{color:var(--color-text-muted);margin:0 0 20px;font-size:.92rem}
.he-done__l{list-style:none;margin:0;padding:0;border-top:1px solid var(--color-border)}
.he-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--color-border)}
.he-done__l i{font-style:normal;font-size:.82rem;color:var(--color-text-muted)}
.he-done__l b{font-size:.9rem;font-weight:700;color:var(--color-text);text-align:right}
`;
