"use client";
import { useState } from "react";
import { useContent } from "@/astera/context/ContentContext";
import { asteraContactUrl } from "@/astera/lib/host";

const purple = "#7c3bb2";
const gold = "#c9a84c";

const STRINGS = {
  cs: {
    heading: "Napište mi",
    sub: "Ráda vám odpovím na jakékoli otázky. Ozvu se obvykle do 2–3 pracovních dnů.",
    name: "Jméno",
    email: "E-mail",
    subject: "Předmět",
    message: "Zpráva",
    send: "Odeslat zprávu",
    sending: "Odesílám…",
    success: "Zpráva odeslána! Ozvu se co nejdříve. ✦",
    error: "Něco se nepovedlo. Zkuste to prosím znovu nebo mi napište přímo na",
    required: "Vyplňte prosím všechna povinná pole.",
  },
  en: {
    heading: "Get in touch",
    sub: "I'd love to hear from you. I usually reply within 2–3 working days.",
    name: "Name",
    email: "E-mail",
    subject: "Subject",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    success: "Message sent! I'll get back to you as soon as possible. ✦",
    error: "Something went wrong. Please try again or write directly to",
    required: "Please fill in all required fields.",
  },
  ua: {
    heading: "Написати мені",
    sub: "Буду рада відповісти на ваші запитання. Зазвичай відповідаю протягом 2–3 робочих днів.",
    name: "Ім'я",
    email: "E-mail",
    subject: "Тема",
    message: "Повідомлення",
    send: "Надіслати повідомлення",
    sending: "Надсилаю…",
    success: "Повідомлення надіслано! Відповім якнайшвидше. ✦",
    error: "Щось пішло не так. Спробуйте ще раз або напишіть безпосередньо на",
    required: "Будь ласка, заповніть усі обов'язкові поля.",
  },
};

type Field = { name: string; email: string; subject: string; message: string };

export default function ContactFormBlock() {
  const { currentLang } = useContent();
  const s = STRINGS[currentLang] ?? STRINGS.en;

  const [fields, setFields] = useState<Field>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [validationError, setValidationError] = useState(false);

  const set = (k: keyof Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields(prev => ({ ...prev, [k]: e.target.value }));
    setValidationError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.message) {
      setValidationError(true);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(asteraContactUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, lang: currentLang }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setFields({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid #e8ddd4",
    borderRadius: 10,
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    color: "#2a1a00",
    background: "#fdf8f3",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "48px 0 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 700,
          color: "#2a1a00",
          margin: "0 0 10px",
        }}>
          {s.heading}
        </h1>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, color: "#6b5a3a", margin: 0, lineHeight: 1.6 }}>
          {s.sub}
        </p>
        <div style={{ width: 48, height: 3, background: `linear-gradient(90deg, ${gold}, ${purple})`, borderRadius: 2, margin: "18px auto 0" }} />
      </div>

      {status === "success" ? (
        <div style={{
          background: `linear-gradient(135deg, #f0f7f4, #f7f0fb)`,
          border: `1.5px solid ${purple}44`,
          borderRadius: 14,
          padding: "32px 24px",
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
          fontSize: 16,
          color: purple,
          fontWeight: 500,
        }}>
          {s.success}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="contact-row">
            <div>
              <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: "#6b5a3a", marginBottom: 6 }}>
                {s.name} *
              </label>
              <input
                type="text"
                value={fields.name}
                onChange={set("name")}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = purple)}
                onBlur={e => (e.currentTarget.style.borderColor = "#e8ddd4")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: "#6b5a3a", marginBottom: 6 }}>
                {s.email} *
              </label>
              <input
                type="email"
                value={fields.email}
                onChange={set("email")}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = purple)}
                onBlur={e => (e.currentTarget.style.borderColor = "#e8ddd4")}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: "#6b5a3a", marginBottom: 6 }}>
              {s.subject}
            </label>
            <input
              type="text"
              value={fields.subject}
              onChange={set("subject")}
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = purple)}
              onBlur={e => (e.currentTarget.style.borderColor = "#e8ddd4")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: "#6b5a3a", marginBottom: 6 }}>
              {s.message} *
            </label>
            <textarea
              value={fields.message}
              onChange={set("message")}
              rows={7}
              style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
              onFocus={e => (e.currentTarget.style.borderColor = purple)}
              onBlur={e => (e.currentTarget.style.borderColor = "#e8ddd4")}
            />
          </div>

          {validationError && (
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: "#c0392b", margin: 0 }}>
              {s.required}
            </p>
          )}

          {status === "error" && (
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: "#c0392b", margin: 0 }}>
              {s.error} <a href="mailto:info@asteralight.cz" style={{ color: purple }}>info@asteralight.cz</a>
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              padding: "13px 40px",
              background: status === "sending" ? "#a68cc9" : `linear-gradient(135deg, ${purple}, #5f2a8d)`,
              color: "#fff",
              border: "none",
              borderRadius: 999,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: status === "sending" ? "default" : "pointer",
              alignSelf: "flex-start",
              transition: "opacity 0.2s",
              letterSpacing: 0.3,
            }}
          >
            {status === "sending" ? s.sending : s.send}
          </button>
        </form>
      )}

      <style>{`
        @media (max-width: 540px) {
          .contact-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
