"use client";

/**
 * fyzio-02 „Chart" — pacientská karta: obsah vlevo, vpravo trvalý „záznam"
 * s vyplněnými poli, kroky jako svislé záložky na levé hraně karty.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.17 } };

export function FyzioChart({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Terapeut", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="fh" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fh-wrap">
        <header className="fh-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="fh-grid">
          <div className="fh-main">
            {!b.done && (
              <div className="fh-tabs">
                {st.steps.map((l, i) => (
                  <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                    <i>{pad(i + 1)}</i>{l}
                  </span>
                ))}
              </div>
            )}

            {b.loading && <div className="fh-load"><span className="fh-spin" /></div>}
            {b.loadErr && !b.loading && <p className="fh-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="fh-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="fh-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="fh-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="fh-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="fh-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <BackBar ns="fh" onBack={() => b.setStep(0)} title="Vyberte terapeuta" />
                    <div className="fh-staff">
                      <button onClick={() => st.pickStaff(null)}>
                        <span className="fh-av fh-av--any">✦</span><span><b>Kdokoli</b><i>nejbližší termín</i></span>
                      </button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="fh-av" src={m.avatar_url} alt={m.name} />
                            : <span className="fh-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                          <span><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <BackBar ns="fh" onBack={st.backFromCalendar} title="Vyberte datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="fh-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="fh-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="fh-load"><span className="fh-spin" /></div> : (
                      <>
                        <div className="fh-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`fh-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="fh" who="terapeut" />}
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <BackBar ns="fh" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                    {b.slotsLoading ? <div className="fh-load"><span className="fh-spin" /></div> : b.slots.length === 0 ? (
                      <p className="fh-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="fh-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <BackBar ns="fh" onBack={() => b.setStep(2)} title="Vaše údaje" />
                    <BookingFields b={b} ns="fh" notesLabel="Popis obtíží" notesPlaceholder="Co vás trápí, jak dlouho…" />
                    {b.submitErr && <p className="fh-msg fh-msg--err">{b.submitErr}</p>}
                    <button className="fh-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && (
                  <motion.div key="s4" {...anim} className="fh-done">
                    <span className="fh-done__c">✓</span>
                    <h3>Rezervace potvrzena</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>. Přijďte prosím 5 minut předem.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* trvalý záznam */}
          {!b.loading && !b.loadErr && b.provider && (
            <aside className="fh-chart">
              <span className="fh-chart__t">Záznam rezervace</span>
              <dl>
                <div className={b.service ? "is-set" : ""}><dt>Vyšetření</dt><dd>{b.service?.name || "—"}</dd></div>
                {st.hasStaff && <div className={st.staffChosen ? "is-set" : ""}><dt>Terapeut</dt><dd>{st.staffChosen ? (b.selStaff?.name || "Kdokoli") : "—"}</dd></div>}
                <div className={b.date ? "is-set" : ""}><dt>Datum</dt><dd>{b.date ? fmtLongDate(b.date) : "—"}</dd></div>
                <div className={b.time ? "is-set" : ""}><dt>Čas</dt><dd>{b.time ? `${b.time} – ${addMinutes(b.time, b.totalDuration)}` : "—"}</dd></div>
                <div className={b.service ? "is-set" : ""}><dt>Cena</dt><dd className="fh-chart__p">{b.service ? fmtPrice(Number(b.service.price), b.service.currency) : "—"}</dd></div>
              </dl>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}

const CSS = `
.fh{padding:64px 20px}
.fh-wrap{max-width:940px;margin:0 auto}
.fh-head{margin-bottom:22px}
.fh-head h2{font-size:clamp(1.65rem,3.6vw,2.15rem);font-weight:600;margin:0 0 7px;color:var(--color-text)}
.fh-head p{margin:0;color:var(--color-text-muted);font-size:.93rem}
.fh-grid{display:grid;grid-template-columns:minmax(0,1fr) 268px;gap:0;border:1px solid var(--color-border);border-radius:var(--radius,12px);overflow:hidden;background:var(--color-surface,#fff)}
@media(max-width:820px){.fh-grid{grid-template-columns:1fr}}
.fh-main{padding:22px}
.fh-tabs{display:flex;flex-wrap:wrap;gap:0;margin:-22px -22px 20px;border-bottom:1px solid var(--color-border)}
.fh-tabs span{display:flex;align-items:center;gap:6px;padding:12px 14px;font-size:.74rem;font-weight:600;color:var(--color-text-muted);border-right:1px solid var(--color-border);border-bottom:2px solid transparent}
.fh-tabs span i{font-style:normal;font-variant-numeric:tabular-nums;opacity:.55}
.fh-tabs span.is-on{color:var(--color-primary);border-bottom-color:var(--color-primary);font-weight:700}
.fh-tabs span.is-done{color:var(--color-text)}
.fh-load{display:flex;justify-content:center;padding:42px 0}
.fh-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.fh-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.fh-msg--err{color:#c0392b}
.fh-list{display:flex;flex-direction:column}
.fh-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:14px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.fh-list button:last-child{border-bottom:none}
.fh-list button:hover{padding-left:10px}
.fh-list__b b{display:block;font-size:.97rem;font-weight:600}
.fh-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.79rem;color:var(--color-text-muted);margin-top:2px}
.fh-list__m{flex:0 0 auto;text-align:right}
.fh-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.fh-list__m small{font-size:.74rem;color:var(--color-text-muted)}
.fh-bar{display:flex;align-items:center;gap:11px;margin-bottom:16px;flex-wrap:wrap}
.fh-bar button{width:32px;height:32px;border-radius:6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.1rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.fh-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.fh-bar b{font-size:1.05rem;font-weight:600;color:var(--color-text)}
.fh-bar button.fh-bar__m{width:auto;height:auto;border-radius:99px;padding:5px 11px;font-size:.71rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.fh-staff{display:flex;flex-direction:column;gap:8px}
.fh-staff button{display:flex;align-items:center;gap:12px;padding:10px 13px;background:none;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.fh-staff button:hover{border-color:var(--color-primary)}
.fh-staff b{display:block;font-size:.94rem;font-weight:600}
.fh-staff i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.fh-av{width:40px;height:40px;border-radius:8px;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.fh-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.fh-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;max-width:390px}
.fh-mnav b{font-weight:600;color:var(--color-text)}
.fh-mnav button{width:29px;height:29px;border-radius:6px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.fh-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fh-mnav button:disabled{opacity:.25;cursor:not-allowed}
.fh-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;max-width:390px}
.fh-dow span{text-align:center;font-size:.63rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.fh-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;max-width:390px}
.fh-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.83rem;font-variant-numeric:tabular-nums;opacity:.3;border-radius:6px}
.fh-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 8%,transparent);cursor:pointer;transition:.12s}
.fh-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.fh-empty{margin-top:12px;max-width:390px;text-align:center}
.fh-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.fh-empty b{color:var(--color-text)}
.fh-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.fh-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 12px;font-size:.75rem;font-weight:600;cursor:pointer}
.fh-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.fh-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px;max-width:430px}
.fh-slots button{padding:10px 5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:600;font-size:.86rem;font-variant-numeric:tabular-nums;border-radius:6px;cursor:pointer;transition:.12s}
.fh-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.fh-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.fh-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.fh-form{grid-template-columns:1fr}}
.fh-wide{grid-column:1/-1}
.fh-form label{display:flex;flex-direction:column;gap:4px}
.fh-form label>span{font-size:.72rem;font-weight:700;color:var(--color-text)}
.fh-form label i{font-style:normal;color:var(--color-primary)}
.fh-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.fh-form input,.fh-form textarea{border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.fh-form input:focus,.fh-form textarea:focus{border-color:var(--color-primary)}
.fh-form small{color:#c0392b;font-size:.71rem;font-weight:600}
.fh-pay{display:flex;gap:8px}
.fh-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:10px;font-weight:600;font-size:.84rem;cursor:pointer;transition:.14s}
.fh-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.fh-cta{width:100%;margin-top:16px;padding:13px;border:none;border-radius:6px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.92rem;cursor:pointer;transition:.14s}
.fh-cta:hover:not(:disabled){filter:brightness(1.06)}
.fh-cta:disabled{opacity:.4;cursor:not-allowed}
.fh-done{text-align:center;padding:20px 0}
.fh-done__c{width:54px;height:54px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 14%,transparent);color:var(--color-primary);font-size:1.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.fh-done h3{font-size:1.35rem;font-weight:600;margin:0 0 8px;color:var(--color-text)}
.fh-done>p{color:var(--color-text-muted);margin:0;font-size:.9rem;line-height:1.55}
.fh-chart{background:color-mix(in srgb,var(--color-primary) 5%,transparent);border-left:1px solid var(--color-border);padding:20px}
@media(max-width:820px){.fh-chart{border-left:none;border-top:1px solid var(--color-border)}}
.fh-chart__t{display:block;font-size:.66rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:var(--color-text-muted);margin-bottom:14px}
.fh-chart dl{margin:0;display:flex;flex-direction:column;gap:11px}
.fh-chart div{display:flex;flex-direction:column;gap:2px;opacity:.4;transition:opacity .2s}
.fh-chart div.is-set{opacity:1}
.fh-chart dt{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text-muted)}
.fh-chart dd{margin:0;font-size:.88rem;font-weight:600;color:var(--color-text)}
.fh-chart__p{color:var(--color-primary)!important;font-weight:800!important}
`;
