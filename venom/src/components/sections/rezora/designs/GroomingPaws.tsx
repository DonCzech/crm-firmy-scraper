"use client";

/**
 * grooming-01 „Paws" — přátelský a hravý: široké zaoblené řádky s velkým
 * kulatým náhledem, kroky jako tlapkové body, vlídné formulace.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.19 } };

export function GroomingPaws({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Salonér", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="gp" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gp-wrap">
        <header className="gp-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          {!b.done && (
            <div className="gp-dots">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}><i />{l}</span>
              ))}
            </div>
          )}
        </header>

        {b.loading && <div className="gp-load"><span className="gp-spin" /></div>}
        {b.loadErr && !b.loading && <p className="gp-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="gp-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="gp-list">
                {b.services.map((svc) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <span className="gp-thumb">
                      {svc.image_url ? <img src={svc.image_url} alt="" /> : <span className="gp-thumb__ph" aria-hidden />}
                    </span>
                    <span className="gp-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                    <span className="gp-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="gp-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim} className="gp-panel">
                <BackBar ns="gp" onBack={() => b.setStep(0)} title="Kdo se o mazlíčka postará?" />
                <div className="gp-staff">
                  <button onClick={() => st.pickStaff(null)}><span className="gp-av gp-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="gp-av" src={m.avatar_url} alt={m.name} />
                        : <span className="gp-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim} className="gp-panel">
                <BackBar ns="gp" onBack={st.backFromCalendar} title="Kdy se stavíte?"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="gp-cal-box">
                  <div className="gp-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="gp-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="gp-load"><span className="gp-spin" /></div> : (
                    <>
                      <div className="gp-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`gp-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="gp" who="salonér" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim} className="gp-panel">
                <BackBar ns="gp" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="gp-load"><span className="gp-spin" /></div> : b.slots.length === 0 ? (
                  <p className="gp-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="gp-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim} className="gp-panel">
                <BackBar ns="gp" onBack={() => b.setStep(2)} title="Vaše údaje" />
                <div className="gp-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="gp" notesLabel="O mazlíčkovi" notesPlaceholder="Jméno, plemeno, povaha, zvláštnosti…" />
                {b.submitErr && <p className="gp-msg gp-msg--err">{b.submitErr}</p>}
                <button className="gp-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="gp-panel gp-done">
                <span className="gp-done__c">✓</span>
                <h3>Těšíme se na návštěvu</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="gp-done__l">
                  <li><i>Služba</i><b>{b.service.name}</b></li>
                  <li><i>Salonér</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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

const CSS = `
.gp{padding:66px 20px}
.gp-wrap{max-width:620px;margin:0 auto}
.gp-head{text-align:center;margin-bottom:24px}
.gp-head h2{font-size:clamp(1.7rem,3.8vw,2.25rem);font-weight:800;margin:0 0 8px;color:var(--color-text);letter-spacing:-.015em}
.gp-head p{margin:0 0 18px;color:var(--color-text-muted);font-size:.93rem}
.gp-dots{display:flex;justify-content:center;flex-wrap:wrap;gap:16px}
.gp-dots span{display:inline-flex;align-items:center;gap:6px;font-size:.74rem;font-weight:700;color:var(--color-text-muted);opacity:.45}
.gp-dots span i{width:10px;height:10px;border-radius:50%;background:var(--color-border);display:block}
.gp-dots span.is-on,.gp-dots span.is-done{opacity:1}
.gp-dots span.is-on i,.gp-dots span.is-done i{background:var(--color-primary)}
.gp-dots span.is-on{color:var(--color-text)}
.gp-load{display:flex;justify-content:center;padding:44px 0}
.gp-spin{width:25px;height:25px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.gp-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.gp-msg--err{color:#c0392b}
.gp-list{display:flex;flex-direction:column;gap:11px}
.gp-list button{display:flex;align-items:center;gap:16px;width:100%;background:var(--color-surface,#fff);border:2px solid transparent;border-radius:99px;padding:12px 26px 12px 12px;cursor:pointer;color:var(--color-text);text-align:left;transition:.17s}
.gp-list button:hover{border-color:var(--color-primary);transform:translateY(-2px)}
.gp-thumb{width:62px;height:62px;border-radius:50%;overflow:hidden;flex:0 0 auto}
.gp-thumb img{width:100%;height:100%;object-fit:cover}
.gp-thumb__ph{display:block;width:100%;height:100%;background:color-mix(in srgb,var(--color-primary) 18%,transparent)}
.gp-list__b{flex:1;min-width:0}
.gp-list__b b{display:block;font-size:1.02rem;font-weight:700}
.gp-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.79rem;color:var(--color-text-muted);margin-top:2px}
.gp-list__m{flex:0 0 auto;text-align:right}
.gp-list__m em{font-style:normal;display:block;font-weight:800;color:var(--color-primary)}
.gp-list__m small{font-size:.75rem;color:var(--color-text-muted)}
.gp-panel{background:var(--color-surface,#fff);border-radius:calc(var(--radius,12px)*2);padding:24px}
@media(max-width:520px){.gp-panel{padding:17px}}
.gp-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.gp-bar button{width:36px;height:36px;border-radius:50%;border:none;background:var(--color-bg);color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.15s;flex:0 0 auto}
.gp-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.gp-bar b{font-size:1.08rem;font-weight:800;color:var(--color-text)}
.gp-bar button.gp-bar__m{width:auto;height:auto;border-radius:99px;padding:7px 13px;font-size:.72rem;font-weight:700;margin-left:auto;color:var(--color-text-muted)}
.gp-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:11px}
.gp-staff button{display:flex;flex-direction:column;align-items:center;gap:7px;padding:16px 9px;background:var(--color-bg);border:2px solid transparent;border-radius:calc(var(--radius,12px)*1.8);cursor:pointer;color:var(--color-text);text-align:center;transition:.15s}
.gp-staff button:hover{border-color:var(--color-primary)}
.gp-staff b{font-size:.91rem;font-weight:700}
.gp-staff i{font-style:normal;font-size:.71rem;color:var(--color-text-muted)}
.gp-av{width:56px;height:56px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem}
.gp-av--any{border:2px dashed var(--color-border);color:var(--color-primary);background:none}
.gp-cal-box{max-width:400px;margin:0 auto}
.gp-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.gp-mnav b{font-weight:800;color:var(--color-text)}
.gp-mnav button{width:31px;height:31px;border-radius:50%;border:none;background:var(--color-bg);color:var(--color-text);cursor:pointer}
.gp-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.gp-mnav button:disabled{opacity:.25;cursor:not-allowed}
.gp-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.gp-dow span{text-align:center;font-size:.65rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.gp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.gp-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.86rem;opacity:.3;border-radius:50%}
.gp-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.13s}
.gp-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.gp-empty{margin-top:13px;text-align:center}
.gp-empty p{margin:0 0 10px;font-size:.85rem;color:var(--color-text-muted)}
.gp-empty b{color:var(--color-text)}
.gp-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.gp-empty button{background:var(--color-bg);border:none;color:var(--color-text);border-radius:99px;padding:8px 14px;font-size:.76rem;font-weight:700;cursor:pointer}
.gp-empty button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.gp-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:8px}
.gp-slots button{padding:12px 6px;border:none;background:var(--color-bg);color:var(--color-text);font-weight:700;font-size:.88rem;border-radius:99px;cursor:pointer;transition:.13s}
.gp-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.gp-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.gp-recap{display:flex;flex-direction:column;gap:3px;background:var(--color-bg);border-radius:calc(var(--radius,12px)*1.5);padding:13px 17px;margin-bottom:16px}
.gp-recap b{font-size:.99rem;font-weight:700;color:var(--color-text)}
.gp-recap span{font-size:.81rem;color:var(--color-text-muted)}
.gp-recap em{font-style:normal;font-weight:800;color:var(--color-primary);margin-top:3px}
.gp-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.gp-form{grid-template-columns:1fr}}
.gp-wide{grid-column:1/-1}
.gp-form label{display:flex;flex-direction:column;gap:5px}
.gp-form label>span{font-size:.74rem;font-weight:700;color:var(--color-text);padding-left:14px}
.gp-form label i{font-style:normal;color:var(--color-primary)}
.gp-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.gp-form input,.gp-form textarea{border:none;background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:12px 18px;font-size:.91rem;font-family:inherit;outline:none;transition:.14s}
.gp-form textarea{border-radius:20px}
.gp-form input:focus,.gp-form textarea:focus{box-shadow:0 0 0 2px var(--color-primary)}
.gp-form small{color:#c0392b;font-size:.71rem;font-weight:600;padding-left:14px}
.gp-pay{display:flex;gap:9px}
.gp-pay button{flex:1;border:none;background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:12px;font-weight:700;font-size:.85rem;cursor:pointer;transition:.14s}
.gp-pay button.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.gp-cta{width:100%;margin-top:16px;padding:15px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.94rem;cursor:pointer;transition:.14s}
.gp-cta:hover:not(:disabled){filter:brightness(1.07)}
.gp-cta:disabled{opacity:.4;cursor:not-allowed}
.gp-done{text-align:center}
.gp-done__c{width:62px;height:62px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 15%,transparent);color:var(--color-primary);font-size:1.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:2px auto 15px}
.gp-done h3{font-size:1.45rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.gp-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.gp-done__l{list-style:none;margin:0;padding:0;text-align:left;background:var(--color-bg);border-radius:calc(var(--radius,12px)*1.5);overflow:hidden}
.gp-done__l li{display:flex;justify-content:space-between;gap:14px;padding:12px 18px;border-top:2px solid var(--color-surface,#fff)}
.gp-done__l li:first-child{border-top:none}
.gp-done__l i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.gp-done__l b{font-size:.87rem;font-weight:700;color:var(--color-text);text-align:right}
`;
