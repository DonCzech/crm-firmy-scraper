"use client";

/**
 * vet-01 „Topbar" — jeden sloupec s lepivou horní lištou, která drží průběžný
 * souhrn a postup i při rolování. Vlídné, ale věcné.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.17 } };

export function VetTopbar({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Veterinář", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;
  const pct = b.done ? 100 : ((st.vstep + 1) / st.steps.length) * 100;

  return (
    <section id="rezervace" className="vt" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* lepivá lišta */}
      {b.service && !b.done && (
        <div className="vt-sticky">
          <div className="vt-sticky__in">
            <span className="vt-sticky__t">
              <b>{b.service.name}</b>
              <i>
                {b.selStaff ? `${b.selStaff.name.split(" ")[0]} · ` : ""}
                {b.date ? fmtLongDate(b.date) : "vyberte termín"}{b.time ? ` · ${b.time}` : ""}
              </i>
            </span>
            <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
          </div>
          <span className="vt-sticky__p"><i style={{ width: `${pct}%` }} /></span>
        </div>
      )}

      <div className="vt-wrap">
        <header className="vt-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {b.loading && <div className="vt-load"><span className="vt-spin" /></div>}
        {b.loadErr && !b.loading && <p className="vt-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="vt-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim}>
                <p className="vt-lead">S čím k nám míříte?</p>
                <div className="vt-list">
                  {b.services.map((svc) => (
                    <button key={svc.id} onClick={() => b.pickService(svc)}>
                      <span className="vt-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                      <span className="vt-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                    </button>
                  ))}
                  {b.services.length === 0 && <p className="vt-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                </div>
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim}>
                <BackBar ns="vt" onBack={() => b.setStep(0)} title="Kdo se na mazlíčka podívá?" />
                <div className="vt-staff">
                  <button onClick={() => st.pickStaff(null)}>
                    <span className="vt-av vt-av--any">✦</span><span><b>Kdokoli</b><i>nejbližší volný termín</i></span>
                  </button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="vt-av" src={m.avatar_url} alt={m.name} />
                        : <span className="vt-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <span><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim}>
                <BackBar ns="vt" onBack={st.backFromCalendar} title="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="vt-cal-box">
                  <div className="vt-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="vt-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="vt-load"><span className="vt-spin" /></div> : (
                    <>
                      <div className="vt-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`vt-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="vt" who="veterinář" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim}>
                <BackBar ns="vt" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="vt-load"><span className="vt-spin" /></div> : b.slots.length === 0 ? (
                  <p className="vt-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="vt-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim}>
                <BackBar ns="vt" onBack={() => b.setStep(2)} title="Vaše údaje" />
                <BookingFields b={b} ns="vt" notesLabel="O mazlíčkovi" notesPlaceholder="Jméno, druh, věk, potíže…" />
                {b.submitErr && <p className="vt-msg vt-msg--err">{b.submitErr}</p>}
                <button className="vt-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="vt-done">
                <span className="vt-done__c">✓</span>
                <h3>Rezervace potvrzena</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="vt-done__l">
                  <li><i>Vyšetření</i><b>{b.service.name}</b></li>
                  <li><i>Veterinář</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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
.vt{padding:0 20px 66px;position:relative}
.vt-sticky{position:sticky;top:0;z-index:6;margin:0 -20px;background:color-mix(in srgb,var(--color-surface,#fff) 94%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--color-border)}
.vt-sticky__in{max-width:620px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 20px}
.vt-sticky__t{min-width:0}
.vt-sticky__t b{display:block;font-size:.9rem;font-weight:700;color:var(--color-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vt-sticky__t i{font-style:normal;display:block;font-size:.75rem;color:var(--color-text-muted)}
.vt-sticky__in em{font-style:normal;font-weight:800;color:var(--color-primary);flex:0 0 auto}
.vt-sticky__p{display:block;height:2px;background:var(--color-border)}
.vt-sticky__p i{display:block;height:100%;background:var(--color-primary);transition:width .35s cubic-bezier(.4,0,.2,1)}
.vt-wrap{max-width:620px;margin:0 auto;padding-top:50px}
.vt-head{margin-bottom:22px}
.vt-head h2{font-size:clamp(1.65rem,3.6vw,2.15rem);font-weight:700;margin:0 0 7px;color:var(--color-text)}
.vt-head p{margin:0;color:var(--color-text-muted);font-size:.93rem}
.vt-lead{margin:0 0 14px;font-size:1.02rem;font-weight:700;color:var(--color-text)}
.vt-load{display:flex;justify-content:center;padding:42px 0}
.vt-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.vt-msg{color:var(--color-text-muted);font-size:.9rem;padding:20px 0;margin:0}
.vt-msg--err{color:#c0392b}
.vt-list{display:flex;flex-direction:column;gap:8px}
.vt-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:15px 17px;cursor:pointer;color:var(--color-text);text-align:left;transition:.15s}
.vt-list button:hover{border-color:var(--color-primary)}
.vt-list__b b{display:block;font-size:.97rem;font-weight:600}
.vt-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.79rem;color:var(--color-text-muted);margin-top:3px;line-height:1.45}
.vt-list__m{flex:0 0 auto;text-align:right}
.vt-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.vt-list__m small{font-size:.75rem;color:var(--color-text-muted)}
.vt-bar{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
.vt-bar button{width:34px;height:34px;border-radius:50%;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-size:1.15rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.vt-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.vt-bar b{font-size:1.06rem;font-weight:700;color:var(--color-text)}
.vt-bar button.vt-bar__m{width:auto;height:auto;border-radius:99px;padding:6px 12px;font-size:.72rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.vt-staff{display:flex;flex-direction:column;gap:8px}
.vt-staff button{display:flex;align-items:center;gap:13px;padding:11px 14px;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.vt-staff button:hover{border-color:var(--color-primary)}
.vt-staff b{display:block;font-size:.95rem;font-weight:600}
.vt-staff i{font-style:normal;font-size:.77rem;color:var(--color-text-muted)}
.vt-av{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.vt-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.vt-cal-box{max-width:400px;background:var(--color-surface,#fff);border:1px solid var(--color-border);border-radius:var(--radius,12px);padding:16px}
.vt-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.vt-mnav b{font-weight:700;color:var(--color-text)}
.vt-mnav button{width:30px;height:30px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.vt-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.vt-mnav button:disabled{opacity:.25;cursor:not-allowed}
.vt-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.vt-dow span{text-align:center;font-size:.65rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.vt-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.vt-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.85rem;opacity:.3;border-radius:50%}
.vt-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 9%,transparent);cursor:pointer;transition:.12s}
.vt-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.vt-empty{margin-top:12px;text-align:center}
.vt-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.vt-empty b{color:var(--color-text)}
.vt-empty div{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.vt-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.75rem;font-weight:600;cursor:pointer}
.vt-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.vt-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px;max-width:460px}
.vt-slots button{padding:12px 6px;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);font-weight:600;font-size:.87rem;border-radius:var(--radius,12px);cursor:pointer;transition:.12s}
.vt-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.vt-slots button.is-off{opacity:.3;text-decoration:line-through;cursor:not-allowed}
.vt-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.vt-form{grid-template-columns:1fr}}
.vt-wide{grid-column:1/-1}
.vt-form label{display:flex;flex-direction:column;gap:5px}
.vt-form label>span{font-size:.75rem;font-weight:700;color:var(--color-text)}
.vt-form label i{font-style:normal;color:var(--color-primary)}
.vt-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.vt-form input,.vt-form textarea{border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:var(--radius,12px);padding:11px 14px;font-size:.91rem;font-family:inherit;outline:none;transition:.14s}
.vt-form input:focus,.vt-form textarea:focus{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 12%,transparent)}
.vt-form small{color:#c0392b;font-size:.71rem;font-weight:600}
.vt-pay{display:flex;gap:9px}
.vt-pay button{flex:1;border:1px solid var(--color-border);background:var(--color-surface,#fff);color:var(--color-text);border-radius:var(--radius,12px);padding:11px;font-weight:600;font-size:.85rem;cursor:pointer;transition:.14s}
.vt-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.vt-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:var(--radius,12px);background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.93rem;cursor:pointer;transition:.14s}
.vt-cta:hover:not(:disabled){filter:brightness(1.06)}
.vt-cta:disabled{opacity:.4;cursor:not-allowed}
.vt-done{text-align:center;padding:8px 0}
.vt-done__c{width:58px;height:58px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 14%,transparent);color:var(--color-primary);font-size:1.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.vt-done h3{font-size:1.4rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.vt-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.vt-done__l{list-style:none;margin:0;padding:0;text-align:left;border:1px solid var(--color-border);border-radius:var(--radius,12px);overflow:hidden}
.vt-done__l li{display:flex;justify-content:space-between;gap:14px;padding:11px 16px;border-top:1px solid var(--color-border)}
.vt-done__l li:first-child{border-top:none}
.vt-done__l i{font-style:normal;font-size:.78rem;color:var(--color-text-muted)}
.vt-done__l b{font-size:.87rem;font-weight:600;color:var(--color-text);text-align:right}
`;
