"use client";

/**
 * peak-cut „Stack" — harmonika místo wizardu: všechny kroky jsou pod sebou,
 * dokončený se sbalí do shrnutí a jde rozkliknout zpět, aktivní je rozbalený.
 * Uživatel má celou rezervaci na jedné obrazovce.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { DesignProps } from "../common";
import { EditableTitle, EditableSubtitle } from "../common";
import { useStaffStep, ymd, fmtDuration, fmtPrice, fmtLongDate, addMinutes, isValidEmail, DAY_HEADERS, MONTHS_NOM } from "../core";

const open = { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.22 } };

export function PeakCutStack({ b, sectionId }: DesignProps) {
  const st = useStaffStep(b, ["Služba", "Barber", "Datum", "Čas", "Údaje"]);
  const editable = b.step === 0 && !b.done;

  if (b.loading || b.loadErr || !b.provider) {
    return (
      <section id="rezervace" className="pk" style={{ background: "var(--color-bg)" }}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="pk-wrap">
          <Header b={b} sectionId={sectionId} editable={editable} />
          {b.loading && <div className="pk-load"><span className="pk-spin" /></div>}
          {b.loadErr && <p className="pk-msg">{b.loadErr}</p>}
          {!b.providerSlug && !b.loading && <p className="pk-msg">{b.isAdmin ? "Zadejte ID rezervačního profilu (slug) v nastavení sekce." : ""}</p>}
        </div>
      </section>
    );
  }

  if (b.done && b.service && b.date && b.time) {
    return (
      <section id="rezervace" className="pk" style={{ background: "var(--color-bg)" }}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="pk-wrap">
          <div className="pk-done">
            <span className="pk-done__c">✓</span>
            <h3>Rezervace potvrzena</h3>
            <p>Potvrzení jsme poslali na <b>{b.form.clientEmail || b.form.clientPhone}</b>.</p>
            <ul className="pk-done__l">
              <li><i>Služba</i><b>{b.service.name}</b></li>
              <li><i>Barber</i><b>{b.selStaff ? b.selStaff.name : b.provider.name}</b></li>
              <li><i>Datum</i><b>{fmtLongDate(b.date)}</b></li>
              <li><i>Čas</i><b>{b.time} – {addMinutes(b.time, b.totalDuration)}</b></li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rezervace" className="pk" style={{ background: "var(--color-bg)" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pk-wrap">
        <Header b={b} sectionId={sectionId} editable={editable} />

        {/* 1 — Služba */}
        <Band n={1} title="Služba" done={b.step > 0} openNow={b.step === 0}
          summary={b.service ? `${b.service.name} · ${fmtPrice(Number(b.service.price), b.service.currency)}` : ""}
          onReopen={() => b.setStep(0)}>
          <div className="pk-list">
            {b.services.map((svc) => (
              <button key={svc.id} onClick={() => b.pickService(svc)}>
                <span><b>{svc.name}</b>{svc.description && <i>{svc.description}</i>}</span>
                <span className="pk-list__m"><em>{fmtPrice(Number(svc.price), svc.currency)}</em><i>{fmtDuration(svc.duration_minutes)}</i></span>
              </button>
            ))}
            {b.services.length === 0 && <p className="pk-msg">Momentálně nejsou k dispozici žádné služby.</p>}
          </div>
        </Band>

        {/* 2 — Barber */}
        {st.hasStaff && (
          <Band n={2} title="Barber" done={st.staffChosen} openNow={st.showStaffPicker}
            summary={st.staffChosen ? (b.selStaff ? b.selStaff.name : "Kdokoli") : ""}
            onReopen={() => st.setStaffChosen(false)} locked={b.step === 0}>
            <div className="pk-staff">
              <button onClick={() => st.pickStaff(null)}>
                <span className="pk-av pk-av--any">✦</span><b>Kdokoli</b><i>nejbližší termín</i>
              </button>
              {b.staff.map((m) => (
                <button key={m.id} onClick={() => st.pickStaff(m)}>
                  {m.avatar_url ? <img className="pk-av" src={m.avatar_url} alt={m.name} />
                    : <span className="pk-av" style={{ background: m.color || "var(--color-primary)" }}>{m.name[0]}</span>}
                  <b>{m.name.split(" ")[0]}</b>{m.bio && <i>{m.bio}</i>}
                </button>
              ))}
            </div>
          </Band>
        )}

        {/* 3 — Datum */}
        <Band n={st.hasStaff ? 3 : 2} title="Datum" done={!!b.date} openNow={st.showCalendar}
          summary={b.date ? fmtLongDate(b.date) : ""}
          onReopen={() => b.setStep(1)} locked={b.step === 0 || st.showStaffPicker}>
          <div className="pk-mnav">
            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} disabled={new Date(b.month.getFullYear(), b.month.getMonth(), 0) < b.today}>‹</button>
            <b>{MONTHS_NOM[b.month.getMonth()]} {b.month.getFullYear()}</b>
            <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="pk-dow">{DAY_HEADERS.map((d) => <span key={d}>{d}</span>)}</div>
          {b.datesLoading ? <div className="pk-load"><span className="pk-spin" /></div> : (
            <>
              <div className="pk-cal">
                {b.cells.map((d, i) => {
                  if (!d) return <span key={`p${i}`} />;
                  const ds = ymd(d); const av = b.dates.has(ds) && d >= b.today;
                  return <button key={ds} className={`pk-day ${av ? "is-av" : ""}`} disabled={!av} onClick={() => av && b.pickDate(ds)}>{d.getDate()}</button>;
                })}
              </div>
              {b.dates.size === 0 && (
                <div className="pk-empty">
                  <p>{b.selStaff ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volno.</> : "V tomto měsíci nejsou volné termíny."}</p>
                  <div>
                    <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
                    {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiný barber</button>}
                  </div>
                </div>
              )}
            </>
          )}
        </Band>

        {/* 4 — Čas */}
        <Band n={st.hasStaff ? 4 : 3} title="Čas" done={!!b.time} openNow={b.step === 2}
          summary={b.time ? `${b.time} – ${addMinutes(b.time, b.totalDuration)}` : ""}
          onReopen={() => b.setStep(2)} locked={!b.date}>
          {b.slotsLoading ? <div className="pk-load"><span className="pk-spin" /></div> : b.slots.length === 0 ? (
            <p className="pk-msg">Pro tento den nejsou volné termíny.</p>
          ) : (
            <div className="pk-slots">
              {b.slots.map((sl) => <button key={sl.time} className={sl.available ? "" : "is-off"} disabled={!sl.available} onClick={() => b.pickTime(sl.time)}>{sl.time}</button>)}
            </div>
          )}
        </Band>

        {/* 5 — Údaje */}
        <Band n={st.hasStaff ? 5 : 4} title="Údaje" done={false} openNow={b.step === 3} summary="" locked={!b.time}>
          <div className="pk-form">
            <label><span>Jméno a příjmení <i>*</i></span>
              <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder="Jan Novák" /></label>
            <label><span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
              <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
              {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}</label>
            <label><span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
              <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" /></label>
            <label className="pk-wide"><span>Poznámka <em>(nepovinné)</em></span>
              <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} /></label>
            {b.paymentMethods > 1 && (
              <div className="pk-pay pk-wide">
                {b.provider.payment_cash && <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>}
                {b.provider.payment_transfer && <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>}
              </div>
            )}
          </div>
          {b.submitErr && <p className="pk-msg pk-msg--err">{b.submitErr}</p>}
          <button className="pk-cta" disabled={b.submitting || !b.canSubmit} onClick={b.submit}>
            {b.submitting ? "Rezervuji…" : b.service ? `Potvrdit · ${fmtPrice(Number(b.service.price), b.service.currency)}` : "Potvrdit rezervaci"}
          </button>
        </Band>
      </div>
    </section>
  );
}

function Header({ b, sectionId, editable }: { b: DesignProps["b"]; sectionId: number; editable: boolean }) {
  return (
    <header className="pk-head">
      <h2>{editable ? <EditableTitle sectionId={sectionId} value={b.title} /> : b.title}</h2>
      <p>{editable ? <EditableSubtitle sectionId={sectionId} value={b.subtitle} /> : b.subtitle}</p>
    </header>
  );
}

function Band({ n, title, done, openNow, summary, onReopen, locked, children }: {
  n: number; title: string; done: boolean; openNow: boolean; summary: string;
  onReopen?: () => void; locked?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`pk-band ${openNow ? "is-open" : ""} ${locked ? "is-locked" : ""} ${done ? "is-done" : ""}`}>
      <div className="pk-band__h">
        <span className="pk-band__n">{done && !openNow ? "✓" : n}</span>
        <b>{title}</b>
        {!openNow && summary && <span className="pk-band__s">{summary}</span>}
        {!openNow && done && onReopen && !locked && (
          <button className="pk-band__e" onClick={onReopen}>změnit</button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {openNow && (
          <motion.div key="c" {...open} className="pk-band__c">
            <div className="pk-band__inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CSS = `
.pk{padding:66px 20px}
.pk-wrap{max-width:560px;margin:0 auto}
.pk-head{margin-bottom:22px}
.pk-head h2{font-size:clamp(1.7rem,4vw,2.3rem);font-weight:800;margin:0 0 8px;letter-spacing:-.02em;color:var(--color-text)}
.pk-head p{margin:0;color:var(--color-text-muted);font-size:.94rem}
.pk-load{display:flex;justify-content:center;padding:34px 0}
.pk-spin{width:24px;height:24px;border-radius:50%;border:3px solid var(--color-border);border-top-color:var(--color-primary);animation:rezspin .7s linear infinite;display:inline-block}
@keyframes rezspin{to{transform:rotate(360deg)}}
.pk-msg{color:var(--color-text-muted);font-size:.9rem;padding:14px 0;margin:0}
.pk-msg--err{color:#c0392b}
.pk-band{border:1px solid var(--color-border);border-radius:var(--radius,12px);background:var(--color-surface,#fff);margin-bottom:10px;overflow:hidden;transition:border-color .18s,box-shadow .18s}
.pk-band.is-open{border-color:var(--color-primary);box-shadow:0 8px 28px -18px rgba(0,0,0,.45)}
.pk-band.is-locked{opacity:.45}
.pk-band__h{display:flex;align-items:center;gap:12px;padding:15px 17px}
.pk-band__n{width:25px;height:25px;flex:0 0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.76rem;font-weight:800;background:var(--color-border);color:var(--color-text)}
.pk-band.is-open .pk-band__n{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.pk-band.is-done .pk-band__n{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.pk-band__h b{font-size:.95rem;font-weight:800;color:var(--color-text);flex:0 0 auto}
.pk-band__s{font-size:.84rem;color:var(--color-text-muted);margin-left:auto;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pk-band__e{flex:0 0 auto;margin-left:10px;background:none;border:1px solid var(--color-border);color:var(--color-text-muted);border-radius:99px;padding:5px 11px;font-size:.72rem;font-weight:800;cursor:pointer;transition:.14s}
.pk-band__e:hover{border-color:var(--color-primary);color:var(--color-primary)}
.pk-band__c{overflow:hidden}
.pk-band__inner{padding:2px 17px 18px}
.pk-list{display:flex;flex-direction:column}
.pk-list button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:none;border:none;border-top:1px solid var(--color-border);padding:13px 2px;cursor:pointer;color:var(--color-text);text-align:left}
.pk-list button:first-child{border-top:none}
.pk-list button:hover b{color:var(--color-primary)}
.pk-list b{display:block;font-size:.97rem;font-weight:700}
.pk-list i{font-style:normal;display:block;font-size:.79rem;color:var(--color-text-muted);margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.pk-list__m{flex:0 0 auto;text-align:right}
.pk-list__m em{font-style:normal;font-weight:800;color:var(--color-primary);display:block}
.pk-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(102px,1fr));gap:9px}
.pk-staff button{display:flex;flex-direction:column;align-items:center;gap:5px;padding:13px 8px;background:none;border:1px solid var(--color-border);border-radius:calc(var(--radius,12px)*.8);cursor:pointer;color:var(--color-text);text-align:center;transition:.14s}
.pk-staff button:hover{border-color:var(--color-primary)}
.pk-staff b{font-size:.87rem;font-weight:800}
.pk-staff i{font-style:normal;font-size:.68rem;color:var(--color-text-muted);line-height:1.25}
.pk-av{width:44px;height:44px;border-radius:50%;object-fit:cover;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800}
.pk-av--any{border:1.5px dashed var(--color-border);color:var(--color-primary);background:none}
.pk-mnav{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.pk-mnav b{font-weight:800;font-size:.97rem;color:var(--color-text)}
.pk-mnav button{width:32px;height:32px;border-radius:50%;border:1px solid var(--color-border);background:none;color:var(--color-text);cursor:pointer}
.pk-mnav button:hover:not(:disabled){background:var(--color-primary);color:var(--color-on-primary,#fff)}
.pk-mnav button:disabled{opacity:.25;cursor:not-allowed}
.pk-dow{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:5px}
.pk-dow span{text-align:center;font-size:.66rem;font-weight:800;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.06em}
.pk-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.pk-day{aspect-ratio:1;border:none;background:none;color:var(--color-text-muted);font-weight:700;font-size:.85rem;opacity:.3;border-radius:8px}
.pk-day.is-av{opacity:1;color:var(--color-text);background:color-mix(in srgb,var(--color-primary) 9%,transparent);cursor:pointer;transition:.12s}
.pk-day.is-av:hover{background:var(--color-primary);color:var(--color-on-primary,#fff)}
.pk-empty{margin-top:12px;text-align:center}
.pk-empty p{margin:0 0 9px;font-size:.85rem;color:var(--color-text-muted)}
.pk-empty b{color:var(--color-text)}
.pk-empty div{display:flex;gap:7px;justify-content:center;flex-wrap:wrap}
.pk-empty button{background:none;border:1px solid var(--color-border);color:var(--color-text);border-radius:99px;padding:7px 13px;font-size:.75rem;font-weight:700;cursor:pointer}
.pk-empty button:hover{border-color:var(--color-primary);color:var(--color-primary)}
.pk-slots{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:7px}
.pk-slots button{padding:11px 6px;border:1px solid var(--color-border);background:none;color:var(--color-text);font-weight:800;font-size:.87rem;border-radius:8px;cursor:pointer;transition:.12s}
.pk-slots button:hover:not(.is-off){background:var(--color-primary);color:var(--color-on-primary,#fff);border-color:var(--color-primary)}
.pk-slots button.is-off{opacity:.28;text-decoration:line-through;cursor:not-allowed}
.pk-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.pk-form{grid-template-columns:1fr}}
.pk-wide{grid-column:1/-1}
.pk-form label{display:flex;flex-direction:column;gap:5px}
.pk-form label>span{font-size:.76rem;font-weight:800;color:var(--color-text)}
.pk-form label i{font-style:normal;color:var(--color-primary)}
.pk-form label em{font-style:normal;font-weight:400;color:var(--color-text-muted)}
.pk-form input,.pk-form textarea{border:1px solid var(--color-border);background:var(--color-bg);color:var(--color-text);border-radius:8px;padding:10px 12px;font-size:.92rem;font-family:inherit;outline:none;transition:border-color .14s}
.pk-form input:focus,.pk-form textarea:focus{border-color:var(--color-primary)}
.pk-form small{color:#c0392b;font-size:.72rem;font-weight:700}
.pk-pay{display:flex;gap:8px}
.pk-pay button{flex:1;border:1px solid var(--color-border);background:none;color:var(--color-text);border-radius:8px;padding:10px;font-weight:800;font-size:.85rem;cursor:pointer;transition:.14s}
.pk-pay button.is-on{border-color:var(--color-primary);background:color-mix(in srgb,var(--color-primary) 12%,transparent)}
.pk-cta{width:100%;margin-top:16px;padding:14px;border:none;border-radius:99px;background:var(--color-primary);color:var(--color-on-primary,#fff);font-weight:800;font-size:.95rem;cursor:pointer;transition:.14s}
.pk-cta:hover:not(:disabled){filter:brightness(1.08)}
.pk-cta:disabled{opacity:.4;cursor:not-allowed}
.pk-done{text-align:center;padding:26px 0}
.pk-done__c{width:62px;height:62px;border-radius:50%;background:var(--color-primary);color:var(--color-on-primary,#fff);font-size:1.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.pk-done h3{font-size:1.6rem;font-weight:800;margin:0 0 8px;color:var(--color-text)}
.pk-done>p{color:var(--color-text-muted);margin:0 0 22px;font-size:.92rem}
.pk-done__l{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0;text-align:left;border:1px solid var(--color-border);border-radius:var(--radius,12px);overflow:hidden}
.pk-done__l li{display:flex;justify-content:space-between;gap:14px;padding:12px 16px;border-top:1px solid var(--color-border)}
.pk-done__l li:first-child{border-top:none}
.pk-done__l i{font-style:normal;font-size:.82rem;color:var(--color-text-muted)}
.pk-done__l b{font-size:.9rem;font-weight:700;color:var(--color-text);text-align:right}
`;
