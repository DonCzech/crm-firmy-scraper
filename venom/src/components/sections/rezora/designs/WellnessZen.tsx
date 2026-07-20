"use client";

/**
 * harmonie-01 „Zen" — spa klid: široké rozestupy, tenké linky místo rámů,
 * kroky jako jemná osa, žádné stíny. Vše dýchá.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.26 } };

export function WellnessZen({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Procedura", "Terapeut", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="wz" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="wz-wrap">
        <header className="wz-head">
          <span className="wz-kicker">Rezervace</span>
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        {!b.done && (
          <div className="wz-axis">
            {st.steps.map((l, i) => (
              <span key={l} className={i === st.vstep ? "is-on" : i < st.vstep ? "is-done" : ""}>{l}</span>
            ))}
          </div>
        )}

        {b.loading && <div className="wz-load"><span className="wz-spin" /></div>}
        {b.loadErr && !b.loading && <p className="wz-msg">{b.loadErr}</p>}
        {!b.providerSlug && !b.loading && <p className="wz-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

        {!b.loading && !b.loadErr && b.provider && (
          <AnimatePresence mode="wait" initial={false}>
            {b.step === 0 && (
              <motion.div key="s0" {...anim} className="wz-list">
                {b.services.map((svc) => (
                  <button key={svc.id} onClick={() => b.pickService(svc)}>
                    <span className="wz-list__b">
                      <b>{svc.name}</b>
                      {svc.description && <i>{svc.description}</i>}
                    </span>
                    <span className="wz-list__m">
                      <em>{fmtPrice(Number(svc.price), svc.currency)}</em>
                      <small>{fmtDuration(svc.duration_minutes)}</small>
                    </span>
                  </button>
                ))}
                {b.services.length === 0 && <p className="wz-msg">Momentálně nejsou k dispozici žádné služby.</p>}
              </motion.div>
            )}

            {st.showStaffPicker && b.service && (
              <motion.div key="s1a" {...anim}>
                <BackBar ns="wz" onBack={() => b.setStep(0)} title="Kdo se vám bude věnovat" />
                <div className="wz-staff">
                  <button onClick={() => st.pickStaff(null)}>
                    <span className="wz-av wz-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
                  </button>
                  {b.staff.map((m) => (
                    <button key={m.id} onClick={() => st.pickStaff(m)}>
                      {m.avatar_url ? <img className="wz-av" src={m.avatar_url} alt={m.name} />
                        : <span className="wz-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                      <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {st.showCalendar && b.service && (
              <motion.div key="s1b" {...anim}>
                <BackBar ns="wz" onBack={st.backFromCalendar} title="Vyberte datum"
                  meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                  onMeta={() => st.setStaffChosen(false)} />
                <div className="wz-cal-box">
                  <div className="wz-mnav">
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                    <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                  </div>
                  <div className="wz-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                  {b.datesLoading ? <div className="wz-load"><span className="wz-spin" /></div> : (
                    <>
                      <div className="wz-cal">
                        {b.cells.map((d, i) => {
                          if (!d) return <span key={`p${i}`} />;
                          const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                          return <button key={ds} className={`wz-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                        })}
                      </div>
                      {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="wz" who="terapeut" />}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {b.step === 2 && b.service && b.date && (
              <motion.div key="s2" {...anim}>
                <BackBar ns="wz" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                {b.slotsLoading ? <div className="wz-load"><span className="wz-spin" /></div> : b.slots.length === 0 ? (
                  <p className="wz-msg">Pro tento den nejsou volné termíny.</p>
                ) : (
                  <div className="wz-slots">
                    {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                  </div>
                )}
              </motion.div>
            )}

            {b.step === 3 && b.service && b.date && b.time && (
              <motion.div key="s3" {...anim}>
                <BackBar ns="wz" onBack={() => b.setStep(2)} title="Vaše údaje" />
                <div className="wz-recap">
                  <b>{b.service.name}</b>
                  <span>{b.selStaff ? `${b.selStaff.name} · ` : ""}{fmtLongDate(b.date)} · {b.time}–{addMinutes(b.time, b.totalDuration)}</span>
                  <em>{fmtPrice(Number(b.service.price), b.service.currency)}</em>
                </div>
                <BookingFields b={b} ns="wz" namePlaceholder="Jana Nováková" notesLabel="Přání nebo omezení" />
                {b.submitErr && <p className="wz-msg wz-msg--err">{b.submitErr}</p>}
                <button className="wz-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                  {b.submitting ? "Rezervuji…" : "Potvrdit rezervaci"}
                </button>
              </motion.div>
            )}

            {b.step === 4 && b.done && b.service && b.date && b.time && (
              <motion.div key="s4" {...anim} className="wz-done">
                <span className="wz-done__c">✓</span>
                <h3>Těšíme se na vás</h3>
                <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                <ul className="wz-done__l">
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
.wz{padding:96px 20px}
.wz-wrap{max-width:620px;margin:0 auto}
.wz-head{text-align:center;margin-bottom:44px}
.wz-kicker{display:block;font-size:.66rem;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:var(--color-primary);margin-bottom:18px}
.wz-head h2{font-size:clamp(1.7rem,3.8vw,2.4rem);font-weight:300;letter-spacing:.01em;margin:0 0 14px;color:var(--color-text);line-height:1.25}
.wz-head p{margin:0;color:var(--color-text-muted);font-size:.94rem;line-height:1.8;font-weight:300}
.wz-axis{display:flex;justify-content:center;flex-wrap:wrap;gap:26px;margin-bottom:44px}
.wz-axis span{font-size:.7rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--color-text-muted);opacity:.35;position:relative;padding-bottom:9px}
.wz-axis span.is-on,.wz-axis span.is-done{opacity:1}
.wz-axis span.is-on{color:var(--color-primary)}
.wz-axis span.is-on::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--color-primary)}
.wz-load{display:flex;justify-content:center;padding:52px 0}
.wz-spin{width:24px;height:24px;border-radius:50%;border:1px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin 1s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.wz-msg{text-align:center;color:var(--color-text-muted);font-size:.9rem;padding:24px 0;margin:0;font-weight:300}
.wz-msg--err{color:#b5654f}
.wz-list{display:flex;flex-direction:column}
.wz-list button{display:flex;align-items:baseline;justify-content:space-between;gap:20px;width:100%;background:none;border:none;border-top:1px solid var(--color-border);padding:24px 4px;cursor:pointer;color:var(--color-text);text-align:left;transition:.25s}
.wz-list button:last-child{border-bottom:1px solid var(--color-border)}
.wz-list button:hover{padding-left:14px}
.wz-list__b b{display:block;font-size:1.12rem;font-weight:400;letter-spacing:.01em}
.wz-list__b i{font-style:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.83rem;color:var(--color-text-muted);margin-top:6px;font-weight:300;line-height:1.6}
.wz-list__m{flex:0 0 auto;text-align:right}
.wz-list__m em{font-style:normal;display:block;font-weight:500;color:var(--color-primary);font-size:1rem}
.wz-list__m small{font-size:.76rem;color:var(--color-text-muted);font-weight:300}
.wz-bar{display:flex;align-items:center;gap:16px;margin-bottom:30px;flex-wrap:wrap}
.wz-bar button{width:38px;height:38px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.2rem;cursor:pointer;transition:.2s;flex:0 0 auto}
.wz-bar button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.wz-bar b{font-size:1.12rem;font-weight:400;color:var(--color-text);letter-spacing:.01em}
.wz-bar button.wz-bar__m{width:auto;height:auto;border-radius:99px;padding:7px 14px;font-size:.72rem;font-weight:500;margin-left:auto;color:var(--color-text-muted);letter-spacing:.05em}
.wz-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:20px}
.wz-staff button{display:flex;flex-direction:column;align-items:center;gap:10px;padding:6px;background:none;border:none;cursor:pointer;color:var(--color-text);text-align:center;transition:.2s}
.wz-staff button:hover{transform:translateY(-3px)}
.wz-staff b{font-size:.94rem;font-weight:400}
.wz-staff i{font-style:normal;font-size:.72rem;color:var(--color-text-muted);font-weight:300}
.wz-av{width:74px;height:74px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:400;font-size:1.4rem}
.wz-av--any{border:1px solid var(--color-border);color:var(--color-primary);background:none}
.wz-cal-box{max-width:420px;margin:0 auto}
.wz-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.wz-mnav b{font-weight:400;font-size:1.02rem;letter-spacing:.04em;color:var(--color-text)}
.wz-mnav button{width:32px;height:32px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer;transition:.2s}
.wz-mnav button:hover:not(:disabled){border-color:var(--color-primary);color:var(--color-primary)}
.wz-mnav button:disabled{opacity:.2;cursor:not-allowed}
.wz-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:10px}
.wz-dow span{text-align:center;font-size:.64rem;font-weight:500;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.12em}
.wz-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
.wz-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:300;font-size:.9rem;opacity:.25;border-radius:50%}
.wz-day.is-av{opacity:1;color:var(--color-text);border:1px solid var(--color-border);cursor:pointer;transition:.2s}
.wz-day.is-av:hover{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 10%,transparent);color:var(--color-primary)}
.wz-empty{margin-top:20px;text-align:center}
.wz-empty p{margin:0 0 12px;font-size:.86rem;color:var(--color-text-muted);font-weight:300}
.wz-empty b{color:var(--color-text);font-weight:400}
.wz-empty div{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.wz-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:9px 16px;font-size:.76rem;font-weight:500;cursor:pointer;letter-spacing:.03em}
.wz-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.wz-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:9px}
.wz-slots button{padding:14px 6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:400;font-size:.9rem;border-radius:99px;cursor:pointer;transition:.2s;letter-spacing:.02em}
.wz-slots button:hover:not(.is-off){border-color:var(--color-primary);color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 8%,transparent)}
.wz-slots button.is-off{opacity:.22;text-decoration:line-through;cursor:not-allowed}
.wz-recap{display:flex;flex-direction:column;gap:5px;border-top:1px solid var(--color-border);border-bottom:1px solid var(--color-border);padding:20px 2px;margin-bottom:28px}
.wz-recap b{font-size:1.05rem;font-weight:400;color:var(--color-text)}
.wz-recap span{font-size:.83rem;color:var(--color-text-muted);font-weight:300}
.wz-recap em{font-style:normal;font-weight:500;color:var(--color-primary);margin-top:5px}
.wz-form{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media(max-width:520px){.wz-form{grid-template-columns:1fr}}
.wz-wide{grid-column:1/-1}
.wz-form label{display:flex;flex-direction:column;gap:7px}
.wz-form label>span{font-size:.68rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--color-text-muted)}
.wz-form label i{font-style:normal;color:var(--color-primary)}
.wz-form label em{font-style:normal;font-weight:400;text-transform:none;letter-spacing:.02em}
.wz-form input,.wz-form textarea{border:none;border-bottom:1px solid var(--color-border);background:none;color:var(--color-text);padding:9px 2px;font-size:.98rem;font-family:inherit;font-weight:300;outline:none;transition:.25s}
.wz-form input:focus,.wz-form textarea:focus{border-color:var(--color-primary)}
.wz-form small{color:#b5654f;font-size:.72rem;font-weight:400}
.wz-pay{display:flex;gap:12px}
.wz-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:99px;padding:13px;font-weight:400;font-size:.86rem;cursor:pointer;transition:.2s;letter-spacing:.03em}
.wz-pay button.is-on{border-color:var(--color-primary);color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 8%,transparent)}
.wz-cta{width:100%;margin-top:32px;padding:17px;border:1px solid var(--color-primary);border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:500;font-size:.92rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:.25s}
.wz-cta:hover:not(:disabled){background:none;color:var(--color-primary)}
.wz-cta:disabled{opacity:.35;cursor:not-allowed}
.wz-done{text-align:center;padding:20px 0}
.wz-done__c{width:64px;height:64px;border-radius:50%;border:1px solid var(--color-primary);color:var(--color-primary);font-size:1.6rem;font-weight:300;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
.wz-done h3{font-size:1.6rem;font-weight:300;margin:0 0 12px;color:var(--color-text);letter-spacing:.01em}
.wz-done>p{color:var(--color-text-muted);margin:0 0 30px;font-size:.92rem;font-weight:300}
.wz-done__l{list-style:none;margin:0;padding:0;text-align:left}
.wz-done__l li{display:flex;justify-content:space-between;gap:16px;padding:15px 2px;border-top:1px solid var(--color-border)}
.wz-done__l li:last-child{border-bottom:1px solid var(--color-border)}
.wz-done__l i{font-style:normal;font-size:.68rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--color-text-muted)}
.wz-done__l b{font-size:.9rem;font-weight:400;color:var(--color-text);text-align:right}
`;
