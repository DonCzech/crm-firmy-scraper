"use client";

/**
 * massage-01 „Ritual" — teplé zemité pásy: každý krok má vlastní pruh s velkým
 * odsazením, služby jako široké karty s kulatým obrazovým kotoučem vlevo.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.22 } };

export function MassageRitual({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Procedura", "Terapeut", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="mr" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mr-wrap">
        <header className="mr-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
          {!b.done && (
            <div className="mr-steps">
              {st.steps.map((l, i) => (
                <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
              ))}
            </div>
          )}
        </header>

        {b.loading && <div className="mr-load"><span className="mr-spin" /></div>}
        {b.loadErr && !b.loading && <p className="mr-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="mr-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="mr-list">
                {b.services.map((svc) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <span className="mr-disc">
                      {svc.image_url ? <img src={svc.image_url} alt="" /> : <span className="mr-disc__ph" aria-hidden />}
                    </span>
                    <span className="mr-list__b"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                    <span className="mr-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><small>{fmtDuration(svc.duration_minutes)}</small></span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="mr-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim} className="mr-band">
                <BackBar ns="mr" onBack={() => b.setStep(0)} title="Kdo se vám bude věnovat" />
                <div className="mr-staff">
                  <button onClick={() => st.pickStaff(null)}><span className="mr-av mr-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="mr-av" src={m.avatar_url} alt={m.name} />
                        : <span className="mr-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim} className="mr-band">
                <BackBar ns="mr" onBack={st.backFromCalendar} title="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="mr-cal-box">
                  <div className="mr-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="mr-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="mr-load"><span className="mr-spin" /></div> : (
                    <>
                      <div className="mr-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`mr-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="mr" who="terapeut" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim} className="mr-band">
                <BackBar ns="mr" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="mr-load"><span className="mr-spin" /></div> : b.slots.length === 0 ? (
                  <p className="mr-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="mr-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim} className="mr-band">
                <BackBar ns="mr" onBack={() => b.setStep(2)} title="Vaše údaje" />
                <div className="mr-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="mr" namePlaceholder="Jana Nováková" notesLabel="Přání nebo omezení" />
                {b.submitErr && <p className="mr-msg mr-msg--err">{b.submitErr}</p>}
                <button className="mr-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="mr-band mr-done">
                <span className="mr-done__c">✓</span>
                <h3>Těšíme se na vás</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="mr-done__l">
                  <li><i>Procedura</i><b>{b.service.name}</b></li>
                  <li><i>Terapeut</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
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
.mr{padding:76px 20px}
.mr-wrap{max-width:660px;margin:0 auto}
.mr-head{text-align:center;margin-bottom:34px}
.mr-head h2{font-size:clamp(1.75rem,4vw,2.4rem);font-weight:500;margin:0 0 10px;color:var(--color-text);letter-spacing:-.01em}
.mr-head p{margin:0 0 22px;color:var(--color-text-muted);font-size:.95rem;line-height:1.7}
.mr-steps{display:flex;justify-content:center;flex-wrap:wrap;gap:20px}
.mr-steps span{font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--color-text-muted);opacity:.4}
.mr-steps span.is-on{opacity:1;color:var(--color-primary)}
.mr-steps span.is-done{opacity:.9;color:var(--color-text)}
.mr-load{display:flex;justify-content:center;padding:48px 0}
.mr-spin{width:24px;height:24px;border-radius:50%;border:2px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .8s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.mr-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:22px 0;margin:0}
.mr-msg--err{color:#b5654f}
.mr-list{display:flex;flex-direction:column;gap:14px}
.mr-list button{display:flex;align-items:center;gap:20px;width:100%;background:var(--color-surface,#fff);border:none;border-radius:99px;padding:14px 30px 14px 14px;cursor:pointer;color:var(--color-text);text-align:left;transition:.2s}
.mr-list button:hover{transform:translateY(-2px);box-shadow:0 14px 34px -22px rgba(0,0,0,.4)}
.mr-disc{width:74px;height:74px;border-radius:50%;overflow:hidden;flex:0 0 auto}
.mr-disc img{width:100%;height:100%;object-fit:cover}
.mr-disc__ph{display:block;width:100%;height:100%;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--color-primary) 34%,transparent),color-mix(in srgb,var(--color-primary) 12%,transparent))}
.mr-list__b{flex:1;min-width:0}
.mr-list__b b{display:block;font-size:1.06rem;font-weight:500}
.mr-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.81rem;color:var(--color-text-muted);margin-top:4px;line-height:1.5}
.mr-list__m{flex:0 0 auto;text-align:right}
.mr-list__m em{font-style:normal;display:block;font-weight:600;color:var(--color-primary);font-size:1rem}
.mr-list__m small{font-size:.76rem;color:var(--color-text-muted)}
.mr-band{background:var(--color-surface,#fff);border-radius:calc(var(--radius,12px)*2.4);padding:30px}
@media(max-width:520px){.mr-band{padding:20px}}
.mr-bar{display:flex;align-items:center;gap:14px;margin-bottom:22px;flex-wrap:wrap}
.mr-bar button{width:38px;height:38px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.18s;flex:0 0 auto}
.mr-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.mr-bar b{font-size:1.1rem;font-weight:500;color:var(--color-text)}
.mr-bar button.mr-bar__m{width:auto;height:auto;border-radius:99px;padding:7px 13px;font-size:.73rem;font-weight:600;margin-left:auto;color:var(--color-text-muted)}
.mr-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:14px}
.mr-staff button{display:flex;flex-direction:column;align-items:center;gap:9px;padding:16px 10px;background:var(--color-bg);border:none;border-radius:calc(var(--radius,12px)*1.8);cursor:pointer;color:var(--color-text);text-align:center;transition:.18s}
.mr-staff button:hover{transform:translateY(-2px)}
.mr-staff b{font-size:.94rem;font-weight:500}
.mr-staff i{font-style:normal;font-size:.72rem;color:var(--color-text-muted)}
.mr-av{width:64px;height:64px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:1.25rem}
.mr-av--any{border:1px dashed var(--color-border);color:var(--color-primary);background:none}
.mr-cal-box{max-width:400px;margin:0 auto}
.mr-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.mr-mnav b{font-weight:500;color:var(--color-text)}
.mr-mnav button{width:32px;height:32px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.mr-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.mr-mnav button:disabled{opacity:.22;cursor:not-allowed}
.mr-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px}
.mr-dow span{text-align:center;font-size:.66rem;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.07em}
.mr-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
.mr-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:400;font-size:.88rem;opacity:.28;border-radius:50%}
.mr-day.is-av{opacity:1;color:var(--color-text);background:var(--color-bg);cursor:pointer;transition:.15s}
.mr-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.mr-empty{margin-top:16px;text-align:center}
.mr-empty p{margin:0 0 11px;font-size:.86rem;color:var(--color-text-muted)}
.mr-empty b{color:var(--color-text)}
.mr-empty div{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}
.mr-empty button{background:var(--color-bg);border:none;color:var(--color-text);border-radius:99px;padding:9px 15px;font-size:.77rem;font-weight:600;cursor:pointer}
.mr-empty button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.mr-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:9px}
.mr-slots button{padding:13px 6px;border:none;background:var(--color-bg);color:var(--color-text);font-weight:500;font-size:.9rem;border-radius:99px;cursor:pointer;transition:.15s}
.mr-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.mr-slots button.is-off{opacity:.26;text-decoration:line-through;cursor:not-allowed}
.mr-recap{display:flex;flex-direction:column;gap:4px;background:var(--color-bg);border-radius:calc(var(--radius,12px)*1.6);padding:16px 20px;margin-bottom:22px}
.mr-recap b{font-size:1.02rem;font-weight:500;color:var(--color-text)}
.mr-recap span{font-size:.83rem;color:var(--color-text-muted)}
.mr-recap em{font-style:normal;font-weight:600;color:var(--color-primary);margin-top:4px}
.mr-form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:520px){.mr-form{grid-template-columns:1fr}}
.mr-wide{grid-column:1/-1}
.mr-form label{display:flex;flex-direction:column;gap:6px}
.mr-form label>span{font-size:.72rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--color-text-muted)}
.mr-form label i{font-style:normal;color:var(--color-primary)}
.mr-form label em{font-style:normal;font-weight:400;text-transform:none;letter-spacing:0}
.mr-form input,.mr-form textarea{border:none;background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:13px 18px;font-size:.93rem;font-family:inherit;outline:none;transition:.15s}
.mr-form textarea{border-radius:20px}
.mr-form input:focus,.mr-form textarea:focus{box-shadow:0 0 0 2px var(--color-primary)}
.mr-form small{color:#b5654f;font-size:.72rem;font-weight:600;padding-left:14px}
.mr-pay{display:flex;gap:10px}
.mr-pay button{flex:1;border:none;background:var(--color-bg);color:var(--color-text);border-radius:99px;padding:13px;font-weight:600;font-size:.86rem;cursor:pointer;transition:.15s}
.mr-pay button.is-on{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.mr-cta{width:100%;margin-top:22px;padding:16px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:600;font-size:.95rem;letter-spacing:.04em;cursor:pointer;transition:.15s}
.mr-cta:hover:not(:disabled){filter:brightness(1.06)}
.mr-cta:disabled{opacity:.38;cursor:not-allowed}
.mr-done{text-align:center}
.mr-done__c{width:64px;height:64px;border-radius:50%;background:color-mix(in srgb,var(--color-primary) 16%,transparent);color:var(--color-primary);font-size:1.8rem;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}
.mr-done h3{font-size:1.5rem;font-weight:500;margin:0 0 10px;color:var(--color-text)}
.mr-done>p{color:var(--color-text-muted);margin:0 0 22px;font-size:.92rem}
.mr-done__l{list-style:none;margin:0;padding:0;text-align:left}
.mr-done__l li{display:flex;justify-content:space-between;gap:14px;padding:13px 4px;border-top:1px solid var(--color-border)}
.mr-done__l li:first-child{border-top:none}
.mr-done__l i{font-style:normal;font-size:.75rem;color:var(--color-text-muted);letter-spacing:.04em}
.mr-done__l b{font-size:.9rem;font-weight:500;color:var(--color-text);text-align:right}
`;
