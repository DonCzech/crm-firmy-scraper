"use client";

/**
 * autoservis-03 „Status" — tmavý dispečink: stavové odrážky u kroků, řádky
 * s indikátorem dostupnosti a monospace údaji. Technické, přehledné.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.16 } };

export function AutoStatus({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Úkon", "Technik", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="as" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="as-wrap">
        <header className="as-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="as-panel">
          {!b.done && (
            <div className="as-status">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>
                  <i aria-hidden />{l}
                </span>
              ))}
            </div>
          )}

          <div className="as-body">
            {b.loading && <div className="as-load"><span className="as-spin" /></div>}
            {b.loadErr && !b.loading && <p className="as-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="as-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="as-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="as-dot" aria-hidden />
                        <span className="as-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="as-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="as-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <BackBar ns="as" onBack={() => b.setStep(0)} title="Vyberte technika" />
                    <div className="as-staff">
                      <button onClick={() => st.pickStaff(null)}><span className="as-av as-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="as-av" src={m.avatar_url} alt={m.name} />
                            : <span className="as-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                          <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <BackBar ns="as" onBack={st.backFromCalendar} title="Vyberte datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="as-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="as-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="as-load"><span className="as-spin" /></div> : (
                      <>
                        <div className="as-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`as-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="as" who="technik" />}
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <BackBar ns="as" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                    {b.slotsLoading ? <div className="as-load"><span className="as-spin" /></div> : b.slots.length === 0 ? (
                      <p className="as-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <>
                        <p className="as-count"><b>{b.slots.filter((s) => s.available).length}</b> volných · <span>{b.slots.length - b.slots.filter((s) => s.available).length} obsazeno</span></p>
                        <div className="as-slots">
                          {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <BackBar ns="as" onBack={() => b.setStep(2)} title="Kontaktní údaje" />
                    <div className="as-recap">
                      <b>{b.service.name}</b>
                      <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                      <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                    </div>
                    <BookingFields b={b} ns="as" notesLabel="Vozidlo a popis závady" notesPlaceholder="Značka, model, rok, SPZ, popis problému…" />
                    {b.submitErr && <p className="as-msg as-msg--err">{b.submitErr}</p>}
                    <button className="as-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Odesílám…" : "Závazně objednat"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="as-done">
                    <span className="as-done__c">✓</span>
                    <h3>Objednávka přijata</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <ul className="as-done__l">
                      <li><i>Úkon</i><b>{b.service.name}</b></li>
                      <li><i>Technik</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
                      <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
                      <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.as{padding:64px 20px}
.as-wrap{max-width:720px;margin:0 auto}
.as-head{margin-bottom:20px}
.as-head h2{font-size:clamp(1.65rem,3.6vw,2.15rem);font-weight:800;margin:0 0 7px;color:var(--color-text);letter-spacing:-.015em}
.as-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.as-panel{background:var(--color-surface,#16181c);border:1px solid var(--color-border);border-radius:var(--radius,8px);overflow:hidden}
.as-status{display:flex;flex-wrap:wrap;gap:0;border-bottom:1px solid var(--color-border)}
.as-status span{display:inline-flex;align-items:center;gap:8px;padding:11px 15px;font-size:.72rem;font-weight:700;color:var(--color-text-muted);border-right:1px solid var(--color-border)}
.as-status span:last-child{border-right:none}
.as-status span i{width:7px;height:7px;border-radius:50%;background:var(--color-border);display:block;flex:0 0 auto}
.as-status span.is-on{color:var(--color-text)}
.as-status span.is-on i{background:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 25%,transparent)}
.as-status span.is-done i{background:var(--color-primary)}
.as-body{padding:20px 18px}
.as-load{display:flex;justify-content:center;padding:40px 0}
.as-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.as-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.as-msg--err{color:#ff7a5a}
.as-list{display:flex;flex-direction:column}
.as-list button{display:flex;align-items:center;gap:13px;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:13px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.as-list button:last-child{border-bottom:none}
.as-list button:hover{background:color-mix(in srgb,var(--color-primary) 8%,transparent);padding-left:10px}
.as-dot{width:7px;height:7px;border-radius:50%;background:var(--color-primary);flex:0 0 auto}
.as-list__b{flex:1;min-width:0}
.as-list__b b{display:block;font-size:.96rem;font-weight:700}
.as-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.77rem;color:var(--color-text-muted);margin-top:2px}
.as-list__m{flex:0 0 auto;text-align:right}
.as-list__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary);font-variant-numeric:tabular-nums}
.as-list__m small{font-size:.74rem;color:var(--color-text-muted)}
.as-bar{display:flex;align-items:center;gap:11px;margin-bottom:15px;flex-wrap:wrap}
.as-bar button{width:32px;height:32px;border-radius:5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.1rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.as-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.as-bar b{font-size:1.03rem;font-weight:800;color:var(--color-text)}
.as-bar button.as-bar__m{width:auto;height:auto;border-radius:99px;padding:5px 11px;font-size:.7rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.as-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:9px}
.as-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 9px;background:none;border:1px solid var(--color-border);border-radius:5px;cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.as-staff button:hover{border-color:var(--color-primary)}
.as-staff b{font-size:.88rem;font-weight:700}
.as-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.as-av{width:44px;height:44px;border-radius:5px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.as-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.as-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;max-width:390px}
.as-mnav b{font-weight:800;color:var(--color-text)}
.as-mnav button{width:29px;height:29px;border-radius:5px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.as-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.as-mnav button:disabled{opacity:.25;cursor:not-allowed}
.as-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;max-width:390px}
.as-dow span{text-align:center;font-size:.63rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.as-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;max-width:390px}
.as-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.84rem;font-variant-numeric:tabular-nums;opacity:.26;border-radius:5px}
.as-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 10%,transparent);cursor:pointer;transition:.12s}
.as-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.as-empty{margin-top:12px;max-width:390px;text-align:center}
.as-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.as-empty b{color:var(--color-text)}
.as-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.as-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:5px;padding:7px 12px;font-size:.73rem;font-weight:700;cursor:pointer}
.as-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.as-count{margin:0 0 11px;font-size:.8rem;color:var(--color-text-muted)}
.as-count b{color:var(--color-primary);font-weight:800}
.as-count span{opacity:.7}
.as-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px;max-width:460px}
.as-slots button{padding:11px 5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:700;font-size:.86rem;font-variant-numeric:tabular-nums;border-radius:5px;cursor:pointer;transition:.12s}
.as-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.as-slots button.is-off{opacity:.26;text-decoration:line-through;cursor:not-allowed}
.as-recap{display:flex;flex-direction:column;gap:3px;border-left:3px solid var(--color-primary);padding:3px 0 3px 13px;margin-bottom:16px}
.as-recap b{font-size:.98rem;font-weight:800;color:var(--color-text)}
.as-recap span{font-size:.8rem;color:var(--color-text-muted)}
.as-recap em{font-style:normal;font-weight:800;color:var(--color-primary);margin-top:3px;font-variant-numeric:tabular-nums}
.as-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.as-form{grid-template-columns:1fr}}
.as-wide{grid-column:1/-1}
.as-form label{display:flex;flex-direction:column;gap:4px}
.as-form label>span{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text)}
.as-form label i{font-style:normal;color:var(--color-primary)}
.as-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.as-form input,.as-form textarea{border:1px solid var(--color-border);background:color-mix(in srgb,var(--color-text) 4%,transparent);color:var(--color-text);border-radius:5px;padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.as-form input:focus,.as-form textarea:focus{border-color:var(--color-primary)}
.as-form small{color:#ff7a5a;font-size:.7rem;font-weight:700}
.as-pay{display:flex;gap:8px}
.as-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:5px;padding:10px;font-weight:700;font-size:.83rem;cursor:pointer;transition:.14s}
.as-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 13%,transparent)}
.as-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:5px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.92rem;letter-spacing:.05em;cursor:pointer;transition:.14s}
.as-cta:hover:not(:disabled){filter:brightness(1.1)}
.as-cta:disabled{opacity:.4;cursor:not-allowed}
.as-done{text-align:center}
.as-done__c{width:54px;height:54px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 16%,transparent);color:var(--color-primary);font-size:1.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.as-done h3{font-size:1.35rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.as-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.as-done__l{list-style:none;margin:0;padding:0;text-align:left}
.as-done__l li{display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid var(--color-border)}
.as-done__l li:first-child{border-top:none}
.as-done__l i{font-style:normal;font-size:.77rem;color:var(--color-text-muted)}
.as-done__l b{font-size:.87rem;font-weight:700;color:var(--color-text);text-align:right}
`;
