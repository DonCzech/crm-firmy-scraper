"use client";

/**
 * clinic-02 „Portal" — profesionální portál: vlevo svislá navigace kroků
 * s odškrtáváním a shrnutím, vpravo obsah. Střízlivé, informačně husté.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.16 } };

export function ClinicPortal({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Vyšetření", "Lékař", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  const values = [
    b.service?.name || "",
    st.hasStaff ? (st.staffChosen ? (b.selStaff?.name || "Kdokoli") : "") : "",
    b.date ? fmtLongDate(b.date) : "",
    b.time ? `${b.time} – ${addMinutes(b.time, b.totalDuration)}` : "",
    "",
  ].filter((_, i) => st.hasStaff || i !== 1);

  return (
    <section id="rezervace" className="cp" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cp-wrap">
        <header className="cp-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="cp-grid">
          <nav className="cp-nav">
            {st.steps.map((l, i) => (
              <div key={l} className={i === st.vstep && !b.done ? "is-on" : i < st.vstep || b.done ? "is-done" : ""}>
                <span className="cp-nav__n">{(i < st.vstep || b.done) ? "✓" : i + 1}</span>
                <span className="cp-nav__t">
                  <b>{l}</b>
                  {values[i] && <i>{values[i]}</i>}
                </span>
              </div>
            ))}
          </nav>

          <div className="cp-main">
            {b.loading && <div className="cp-load"><span className="cp-spin" /></div>}
            {b.loadErr && !b.loading && <p className="cp-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="cp-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="cp-list">
                    {b.services.map((svc) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="cp-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="cp-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="cp-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <BackBar ns="cp" onBack={() => b.setStep(0)} title="Vyberte lékaře" />
                    <div className="cp-staff">
                      <button onClick={() => st.pickStaff(null)}>
                        <span className="cp-av cp-av--any">✦</span><span><b>Kdokoli</b><i>nejbližší volný termín</i></span>
                      </button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="cp-av" src={m.avatar_url} alt={m.name} />
                            : <span className="cp-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                          <span><b>{m.name}</b>{m.bio && <i>{m.bio}</i>}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <BackBar ns="cp" onBack={st.backFromCalendar} title="Vyberte datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="cp-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="cp-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="cp-load"><span className="cp-spin" /></div> : (
                      <>
                        <div className="cp-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`cp-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="cp" who="lékař" />}
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <BackBar ns="cp" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                    {b.slotsLoading ? <div className="cp-load"><span className="cp-spin" /></div> : b.slots.length === 0 ? (
                      <p className="cp-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="cp-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <BackBar ns="cp" onBack={() => b.setStep(2)} title="Vaše údaje" />
                    <BookingFields b={b} ns="cp" notesLabel="Poznámka pro lékaře" notesPlaceholder="Obtíže, alergie, léky…" />
                    {b.submitErr && <p className="cp-msg cp-msg--err">{b.submitErr}</p>}
                    <button className="cp-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Rezervuji…" : `Potvrdit rezervaci · ${fmtPrice(Number(b.service.price), b.service.currency)}`}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && (
                  <motion.div key="s4" {...anim} className="cp-done">
                    <span className="cp-done__c">✓</span>
                    <h3>Rezervace potvrzena</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>. Dostavte se prosím 10 minut před termínem.</p>
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
.cp{padding:62px 20px}
.cp-wrap{max-width:900px;margin:0 auto}
.cp-head{margin-bottom:20px}
.cp-head h2{font-size:clamp(1.6rem,3.4vw,2.05rem);font-weight:700;margin:0 0 6px;color:var(--color-text)}
.cp-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.cp-grid{display:grid;grid-template-columns:236px minmax(0,1fr);gap:0;border:1px solid var(--color-border);border-radius:var(--radius,12px);overflow:hidden;background:var(--color-surface,#fff)}
@media(max-width:800px){.cp-grid{grid-template-columns:1fr}}
.cp-nav{background:var(--color-bg);border-right:1px solid var(--color-border);padding:18px 0}
@media(max-width:800px){.cp-nav{border-right:none;border-bottom:1px solid var(--color-border);display:flex;overflow-x:auto;padding:12px}}
.cp-nav div{display:flex;align-items:flex-start;gap:11px;padding:11px 18px;opacity:.45;transition:opacity .2s;position:relative}
@media(max-width:800px){.cp-nav div{padding:6px 12px;flex:0 0 auto}}
.cp-nav div.is-on,.cp-nav div.is-done{opacity:1}
.cp-nav div.is-on::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:3px;background:var(--color-primary)}
@media(max-width:800px){.cp-nav div.is-on::before{display:none}}
.cp-nav__n{width:22px;height:22px;flex:0 0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;background:var(--color-border);color:var(--color-text)}
.cp-nav div.is-on .cp-nav__n,.cp-nav div.is-done .cp-nav__n{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.cp-nav__t{min-width:0}
.cp-nav__t b{display:block;font-size:.84rem;font-weight:600;color:var(--color-text)}
.cp-nav__t i{font-style:normal;display:block;font-size:.74rem;color:var(--color-text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:800px){.cp-nav__t i{display:none}}
.cp-main{padding:22px}
.cp-load{display:flex;justify-content:center;padding:42px 0}
.cp-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.cp-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.cp-msg--err{color:#c0392b}
.cp-list{display:flex;flex-direction:column}
.cp-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:14px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.cp-list button:last-child{border-bottom:none}
.cp-list button:hover{background:color-mix(in srgb,var(--color-primary) 6%,transparent);padding-left:10px}
.cp-list__b b{display:block;font-size:.96rem;font-weight:600}
.cp-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.78rem;color:var(--color-text-muted);margin-top:2px}
.cp-list__m{flex:0 0 auto;text-align:right}
.cp-list__m em{font-style:normal;display:block;font-weight:700;color:var(--color-primary)}
.cp-list__m small{font-size:.74rem;color:var(--color-text-muted)}
.cp-bar{display:flex;align-items:center;gap:11px;margin-bottom:15px;flex-wrap:wrap}
.cp-bar button{width:32px;height:32px;border-radius:6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.1rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.cp-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.cp-bar b{font-size:1.04rem;font-weight:700;color:var(--color-text)}
.cp-bar button.cp-bar__m{width:auto;height:auto;border-radius:99px;padding:5px 11px;font-size:.71rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.cp-staff{display:flex;flex-direction:column;gap:7px}
.cp-staff button{display:flex;align-items:center;gap:12px;padding:10px 13px;background:none;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;color:var(--color-text);text-align:left;transition:.14s}
.cp-staff button:hover{border-color:var(--color-primary)}
.cp-staff b{display:block;font-size:.94rem;font-weight:600}
.cp-staff i{font-style:normal;font-size:.76rem;color:var(--color-text-muted)}
.cp-av{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.cp-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.cp-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;max-width:380px}
.cp-mnav b{font-weight:700;color:var(--color-text)}
.cp-mnav button{width:29px;height:29px;border-radius:6px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.cp-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.cp-mnav button:disabled{opacity:.25;cursor:not-allowed}
.cp-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;max-width:380px}
.cp-dow span{text-align:center;font-size:.63rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase}
.cp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;max-width:380px}
.cp-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:600;font-size:.83rem;opacity:.3;border-radius:6px}
.cp-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.12s}
.cp-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.cp-empty{margin-top:12px;max-width:380px;text-align:center}
.cp-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.cp-empty b{color:var(--color-text)}
.cp-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.cp-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 12px;font-size:.74rem;font-weight:600;cursor:pointer}
.cp-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.cp-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px;max-width:440px}
.cp-slots button{padding:10px 5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:600;font-size:.86rem;border-radius:6px;cursor:pointer;transition:.12s}
.cp-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.cp-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.cp-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.cp-form{grid-template-columns:1fr}}
.cp-wide{grid-column:1/-1}
.cp-form label{display:flex;flex-direction:column;gap:4px}
.cp-form label>span{font-size:.72rem;font-weight:700;color:var(--color-text)}
.cp-form label i{font-style:normal;color:var(--color-primary)}
.cp-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.cp-form input,.cp-form textarea{border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.cp-form input:focus,.cp-form textarea:focus{border-color:var(--color-primary)}
.cp-form small{color:#c0392b;font-size:.71rem;font-weight:600}
.cp-pay{display:flex;gap:8px}
.cp-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:6px;padding:10px;font-weight:600;font-size:.84rem;cursor:pointer;transition:.14s}
.cp-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent)}
.cp-cta{width:100%;margin-top:16px;padding:13px;border:none;border-radius:6px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:700;font-size:.92rem;cursor:pointer;transition:.14s}
.cp-cta:hover:not(:disabled){filter:brightness(1.06)}
.cp-cta:disabled{opacity:.4;cursor:not-allowed}
.cp-done{text-align:center;padding:24px 0}
.cp-done__c{width:54px;height:54px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 13%,transparent);color:var(--color-primary);font-size:1.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.cp-done h3{font-size:1.35rem;font-weight:700;margin:0 0 8px;color:var(--color-text)}
.cp-done>p{color:var(--color-text-muted);margin:0;font-size:.9rem;line-height:1.6;max-width:44ch;margin:0 auto}
`;
