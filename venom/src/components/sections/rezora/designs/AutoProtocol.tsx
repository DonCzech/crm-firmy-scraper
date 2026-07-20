"use client";

/**
 * autoservis-01 „Protocol" — zakázkový list: tmavá hlavička s číslem zakázky,
 * tabulkové řádky s tabulárními číslicemi, technický a věcný tón.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle, BookingFields, EmptyMonth, BackBar } from "../common";
import { useStaffStep, pad, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, DAY_HEADERS, MONTHS_NOM } from "../core";

const anim = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } };

export function AutoProtocol({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Úkon", "Technik", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  return (
    <section id="rezervace" className="ap" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ap-wrap">
        <header className="ap-head">
          <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
          <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
        </header>

        <div className="ap-sheet">
          <div className="ap-top">
            <span>Objednávka servisu</span>
            {!b.done && <span className="ap-top__s">Krok {pad(st.vstep + 1)} / {pad(st.steps.length)} — {st.steps[st.vstep]}</span>}
          </div>

          <div className="ap-body">
            {b.loading && <div className="ap-load"><span className="ap-spin" /></div>}
            {b.loadErr && !b.loading && <p className="ap-msg">{b.loadErr}</p>}
            {!b.providerSlug && !b.loading && <p className="ap-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}

            {!b.loading && !b.loadErr && b.provider && (
              <AnimatePresence mode="wait" initial={false}>
                {b.step === 0 && (
                  <motion.div key="s0" {...anim} className="ap-table">
                    <div className="ap-table__h"><span>Kód</span><span>Úkon</span><span>Čas</span><span>Cena</span></div>
                    {b.services.map((svc, i) => (
                      <button key={svc.id} onClick={() => b.pickService(svc)}>
                        <span className="ap-c">{pad(i + 1)}</span>
                        <span className="ap-n"><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                        <span className="ap-d">{fmtDuration(svc.duration_minutes)}</span>
                        <span className="ap-p">{fmtPrice(Number(svc.price), svc.currency)}</span>
                      </button>
                    ))}
                    {b.services.length === 0 && <p className="ap-msg">Momentálně nejsou k dispozici žádné služby.</p>}
                  </motion.div>
                )}

                {st.showStaffPicker && b.service && (
                  <motion.div key="s1a" {...anim}>
                    <BackBar ns="ap" onBack={() => b.setStep(0)} title="Vyberte technika" />
                    <div className="ap-staff">
                      <button onClick={() => st.pickStaff(null)}><span className="ap-av ap-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i></button>
                      {b.staff.map((m) => (
                        <button key={m.id} onClick={() => st.pickStaff(m)}>
                          {m.avatar_url ? <img className="ap-av" src={m.avatar_url} alt={m.name} />
                            : <span className="ap-av" style={{ background: "var(--color-primary)" }}>{m.name[0]}</span>}
                          <b>{m.name}</b>{m.bio && <i>{m.bio}</i>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {st.showCalendar && b.service && (
                  <motion.div key="s1b" {...anim}>
                    <BackBar ns="ap" onBack={st.backFromCalendar} title="Vyberte datum"
                      meta={st.hasStaff ? (b.selStaff ? b.selStaff.name.split(" ")[0] : "Kdokoli") : undefined}
                      onMeta={() => st.setStaffChosen(false)} />
                    <div className="ap-mnav">
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
                      <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
                      <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
                    </div>
                    <div className="ap-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
                    {b.datesLoading ? <div className="ap-load"><span className="ap-spin" /></div> : (
                      <>
                        <div className="ap-cal">
                          {b.cells.map((d, i) => {
                            if (!d) return <span key={`p${i}`} />;
                            const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                            return <button key={ds} className={`ap-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                          })}
                        </div>
                        {b.dates.size === 0 && <EmptyMonth b={b} st={st} ns="ap" who="technik" />}
                      </>
                    )}
                  </motion.div>
                )}

                {b.step === 2 && b.service && b.date && (
                  <motion.div key="s2" {...anim}>
                    <BackBar ns="ap" onBack={() => b.setStep(1)} title={fmtLongDate(b.date)} />
                    {b.slotsLoading ? <div className="ap-load"><span className="ap-spin" /></div> : b.slots.length === 0 ? (
                      <p className="ap-msg">Pro tento den nejsou volné termíny.</p>
                    ) : (
                      <div className="ap-slots">
                        {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
                      </div>
                    )}
                  </motion.div>
                )}

                {b.step === 3 && b.service && b.date && b.time && (
                  <motion.div key="s3" {...anim}>
                    <BackBar ns="ap" onBack={() => b.setStep(2)} title="Kontaktní údaje" />
                    <dl className="ap-spec">
                      <div><dt>Úkon</dt><dd>{b.service.name}</dd></div>
                      {b.selStaff && <div><dt>Technik</dt><dd>{b.selStaff.name}</dd></div>}
                      <div><dt>Termín</dt><dd>{fmtLongDate(b.date)}, {b.time}–{addMinutes(b.time, b.totalDuration)}</dd></div>
                      <div><dt>Cena</dt><dd className="ap-spec__p">{fmtPrice(Number(b.service.price), b.service.currency)}</dd></div>
                    </dl>
                    <BookingFields b={b} ns="ap" notesLabel="Vozidlo a popis závady" notesPlaceholder="Značka, model, rok, SPZ, popis problému…" />
                    {b.submitErr && <p className="ap-msg ap-msg--err">{b.submitErr}</p>}
                    <button className="ap-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
                      {b.submitting ? "Odesílám…" : "Závazně objednat"}
                    </button>
                  </motion.div>
                )}

                {b.step === 4 && b.done && b.service && b.date && b.time && (
                  <motion.div key="s4" {...anim} className="ap-done">
                    <span className="ap-done__c">✓</span>
                    <h3>Objednávka přijata</h3>
                    <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
                    <dl className="ap-spec">
                      <div><dt>Úkon</dt><dd>{b.service.name}</dd></div>
                      <div><dt>Technik</dt><dd>{b.selStaff ? b.selStaff.name : b.provider.name}</dd></div>
                      <div><dt>Datum</dt><dd>{fmtLongDate(b.date)}</dd></div>
                      <div><dt>Čas</dt><dd>{b.time} – {addMinutes(b.time, b.totalDuration)}</dd></div>
                    </dl>
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
.ap{padding:64px 20px}
.ap-wrap{max-width:740px;margin:0 auto}
.ap-head{margin-bottom:20px}
.ap-head h2{font-size:clamp(1.6rem,3.5vw,2.1rem);font-weight:800;margin:0 0 7px;color:var(--color-text);letter-spacing:-.02em}
.ap-head p{margin:0;color:var(--color-text-muted);font-size:.92rem}
.ap-sheet{border:1px solid var(--color-border);border-radius:var(--radius,8px);overflow:hidden;background:var(--color-surface,#fff)}
.ap-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:var(--color-text);color:var(--color-bg);padding:11px 18px;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.ap-top__s{opacity:.72;letter-spacing:.08em;font-variant-numeric:tabular-nums}
.ap-body{padding:20px 18px}
.ap-load{display:flex;justify-content:center;padding:40px 0}
.ap-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .75s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.ap-msg{color:var(--color-text-muted);font-size:.9rem;padding:18px 0;margin:0}
.ap-msg--err{color:#c0392b}
.ap-table{display:flex;flex-direction:column}
.ap-table__h{display:grid;grid-template-columns:44px 1fr 76px 104px;gap:10px;padding:0 2px 7px;border-bottom:2px solid var(--color-text)}
.ap-table__h span{font-size:.63rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--color-text-muted)}
.ap-table__h span:nth-child(3),.ap-table__h span:nth-child(4){text-align:right}
.ap-table button{display:grid;grid-template-columns:44px 1fr 76px 104px;gap:10px;align-items:center;width:100%;background:none;border:none;border-bottom:1px solid var(--color-border);padding:12px 2px;cursor:pointer;color:var(--color-text);text-align:left;transition:.13s}
.ap-table button:hover{background:color-mix(in srgb,var(--color-primary) 8%,transparent)}
.ap-c{font-size:.78rem;font-weight:800;font-variant-numeric:tabular-nums;color:var(--color-primary)}
.ap-n b{display:block;font-size:.95rem;font-weight:700}
.ap-n i{font-style:normal;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;font-size:.76rem;color:var(--color-text-muted);margin-top:2px}
.ap-d{text-align:right;font-size:.82rem;color:var(--color-text-muted);font-variant-numeric:tabular-nums}
.ap-p{text-align:right;font-weight:800;font-variant-numeric:tabular-nums;color:var(--color-text)}
@media(max-width:560px){
  .ap-table__h{display:none}
  .ap-table button{grid-template-columns:36px 1fr auto;grid-template-areas:"c n p" "c d p"}
  .ap-c{grid-area:c}.ap-n{grid-area:n}.ap-d{grid-area:d;text-align:left}.ap-p{grid-area:p}
}
.ap-bar{display:flex;align-items:center;gap:11px;margin-bottom:15px;flex-wrap:wrap}
.ap-bar button{width:32px;height:32px;border-radius:5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-size:1.1rem;cursor:pointer;transition:.14s;flex:0 0 auto}
.ap-bar button:hover{background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ap-bar b{font-size:1.02rem;font-weight:800;color:var(--color-text)}
.ap-bar button.ap-bar__m{width:auto;height:auto;border-radius:99px;padding:5px 11px;font-size:.7rem;font-weight:800;margin-left:auto;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em}
.ap-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:9px}
.ap-staff button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 9px;background:none;border:1px solid var(--color-border);border-radius:5px;cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.ap-staff button:hover{border-color:var(--color-primary)}
.ap-staff b{font-size:.88rem;font-weight:800}
.ap-staff i{font-style:normal;font-size:.7rem;color:var(--color-text-muted)}
.ap-av{width:44px;height:44px;border-radius:5px;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.ap-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.ap-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;max-width:390px}
.ap-mnav b{font-weight:800;color:var(--color-text)}
.ap-mnav button{width:29px;height:29px;border-radius:5px;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.ap-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.ap-mnav button:disabled{opacity:.25;cursor:not-allowed}
.ap-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;max-width:390px}
.ap-dow span{text-align:center;font-size:.63rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase}
.ap-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;max-width:390px}
.ap-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.84rem;font-variant-numeric:tabular-nums;opacity:.28;border-radius:5px}
.ap-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 9%,transparent);cursor:pointer;transition:.12s}
.ap-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.ap-empty{margin-top:12px;max-width:390px;text-align:center}
.ap-empty p{margin:0 0 9px;font-size:.84rem;color:var(--color-text-muted)}
.ap-empty b{color:var(--color-text)}
.ap-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.ap-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:5px;padding:7px 12px;font-size:.73rem;font-weight:800;cursor:pointer}
.ap-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.ap-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:6px;max-width:460px}
.ap-slots button{padding:11px 5px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:800;font-size:.86rem;font-variant-numeric:tabular-nums;border-radius:5px;cursor:pointer;transition:.12s}
.ap-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.ap-slots button.is-off{opacity:.26;text-decoration:line-through;cursor:not-allowed}
.ap-spec{margin:0 0 16px;padding:0}
.ap-spec div{display:flex;justify-content:space-between;gap:14px;padding:8px 0;border-bottom:1px solid var(--color-border)}
.ap-spec dt{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--color-text-muted)}
.ap-spec dd{margin:0;font-size:.87rem;font-weight:700;color:var(--color-text);text-align:right}
.ap-spec__p{color:var(--color-primary)!important;font-variant-numeric:tabular-nums}
.ap-form{display:grid;grid-template-columns:1fr 1fr;gap:11px}
@media(max-width:520px){.ap-form{grid-template-columns:1fr}}
.ap-wide{grid-column:1/-1}
.ap-form label{display:flex;flex-direction:column;gap:4px}
.ap-form label>span{font-size:.67rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--color-text)}
.ap-form label i{font-style:normal;color:var(--color-primary)}
.ap-form label em{font-style:normal;font-weight:500;text-transform:none;letter-spacing:0;color:var(--color-text-muted)}
.ap-form input,.ap-form textarea{border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:5px;padding:9px 12px;font-size:.9rem;font-family:inherit;outline:none;transition:.14s}
.ap-form input:focus,.ap-form textarea:focus{border-color:var(--color-primary)}
.ap-form small{color:#c0392b;font-size:.7rem;font-weight:700}
.ap-pay{display:flex;gap:8px}
.ap-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:5px;padding:10px;font-weight:800;font-size:.83rem;text-transform:uppercase;cursor:pointer;transition:.14s}
.ap-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 11%,transparent)}
.ap-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:5px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.92rem;text-transform:uppercase;letter-spacing:.07em;cursor:pointer;transition:.14s}
.ap-cta:hover:not(:disabled){filter:brightness(1.07)}
.ap-cta:disabled{opacity:.4;cursor:not-allowed}
.ap-done{text-align:center}
.ap-done__c{width:54px;height:54px;border-radius:5px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:4px auto 14px}
.ap-done h3{font-size:1.35rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.ap-done>p{color:var(--color-text-muted);margin:0 0 18px;font-size:.9rem}
.ap-done .ap-spec{text-align:left;margin-bottom:0}
`;
