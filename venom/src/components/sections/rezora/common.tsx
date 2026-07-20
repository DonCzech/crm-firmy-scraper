"use client";

import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { isValidEmail, type RezoraBooking, type useStaffStep } from "./core";

export interface DesignProps {
  b: RezoraBooking;
  sectionId: number;
}

/** Editovatelný nadpis/podnadpis (v editoru), jinak čistý text. */
export function EditableTitle({ sectionId, value }: { sectionId: number; value: string }) {
  return <GenericEditableText sectionId={sectionId} field="title" value={value} tag="span" />;
}
export function EditableSubtitle({ sectionId, value }: { sectionId: number; value: string }) {
  return <GenericEditableText sectionId={sectionId} field="subtitle" value={value} tag="span" />;
}

/**
 * Sdílené stavební bloky. Struktura a chování jsou stejné pro všechny designy
 * (aby se nedaly zapomenout povinné stavy), vzhled si každý design řídí sám
 * přes vlastní prefix tříd `ns` — např. ns="fa" → .fa-form, .fa-wide, .fa-pay.
 */

/** Kontaktní pole vč. povinností dle nastavení poskytovatele a validace e-mailu. */
export function BookingFields({ b, ns, namePlaceholder = "Jan Novák", notesLabel = "Poznámka", notesPlaceholder }: {
  b: RezoraBooking; ns: string; namePlaceholder?: string; notesLabel?: string; notesPlaceholder?: string;
}) {
  return (
    <div className={`${ns}-form`}>
      <label>
        <span>Jméno a příjmení <i>*</i></span>
        <input value={b.form.clientName} onChange={(e) => b.setForm({ ...b.form, clientName: e.target.value })} placeholder={namePlaceholder} />
      </label>
      <label>
        <span>E-mail {b.rules.requireEmail ? <i>*</i> : <em>(nepovinné)</em>}</span>
        <input type="email" value={b.form.clientEmail} onChange={(e) => b.setForm({ ...b.form, clientEmail: e.target.value })} placeholder="jan@email.cz" />
        {b.form.clientEmail.length > 0 && !isValidEmail(b.form.clientEmail) && <small>Zadejte e-mail ve tvaru jan@email.cz</small>}
      </label>
      <label>
        <span>Telefon {b.rules.requirePhone ? <i>*</i> : <em>(nepovinné)</em>}</span>
        <input type="tel" value={b.form.clientPhone} onChange={(e) => b.setForm({ ...b.form, clientPhone: e.target.value })} placeholder="+420 777 123 456" />
      </label>
      <label className={`${ns}-wide`}>
        <span>{notesLabel} <em>(nepovinné)</em></span>
        <textarea rows={2} value={b.form.clientNotes} onChange={(e) => b.setForm({ ...b.form, clientNotes: e.target.value })} placeholder={notesPlaceholder} />
      </label>
      {b.paymentMethods > 1 && (
        <div className={`${ns}-pay ${ns}-wide`}>
          {b.provider?.payment_cash && (
            <button type="button" className={b.payment === "cash" ? "is-on" : ""} onClick={() => b.setPayment("cash")}>Hotově</button>
          )}
          {b.provider?.payment_transfer && (
            <button type="button" className={b.payment === "transfer" ? "is-on" : ""} onClick={() => b.setPayment("transfer")}>Převodem</button>
          )}
        </div>
      )}
    </div>
  );
}

/** Prázdný měsíc — vždy nabídne cestu ven (další měsíc / jiný pracovník). */
export function EmptyMonth({ b, st, ns, who }: {
  b: RezoraBooking; st: ReturnType<typeof useStaffStep>; ns: string; who: string;
}) {
  return (
    <div className={`${ns}-empty`}>
      <p>
        {b.selStaff
          ? <><b>{b.selStaff.name.split(" ")[0]}</b> nemá v tomto měsíci volný termín.</>
          : "V tomto měsíci nejsou volné termíny."}
      </p>
      <div>
        <button onClick={() => b.setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>Další měsíc →</button>
        {st.hasStaff && b.selStaff && <button onClick={() => st.setStaffChosen(false)}>Jiný {who}</button>}
      </div>
    </div>
  );
}

/** Lišta se šipkou zpět, nadpisem kroku a volitelným čipem „změnit". */
export function BackBar({ ns, onBack, title, meta, onMeta }: {
  ns: string; onBack: () => void; title: string; meta?: string; onMeta?: () => void;
}) {
  return (
    <div className={`${ns}-bar`}>
      <button onClick={onBack} aria-label="Zpět">‹</button>
      <b>{title}</b>
      {meta && <button className={`${ns}-bar__m`} onClick={onMeta}>{meta} · změnit</button>}
    </div>
  );
}

export function Spinner({ ns }: { ns: string }) {
  return <div className={`${ns}-load`}><span className={`${ns}-spin`} /></div>;
}
