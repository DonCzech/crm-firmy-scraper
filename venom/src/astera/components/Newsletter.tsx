"use client";
import { useState } from "react";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";
import { useContent } from "@/astera/context/ContentContext";
import { UI_STRINGS } from "@/astera/lib/i18n";

export default function Newsletter() {
  const { currentLang } = useContent();
  const ui = UI_STRINGS[currentLang];
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", { firstName, email });
  };

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "70px 0" }}>
      <div className="container-main">
        <div
          style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: "60px", alignItems: "center" }}
          className="newsletter-grid"
        >
          {/* Image */}
          <div>
            <EditableImg
              section="newsletter"
              field="image"
              mobileField="mobileImage"
              alt="Astera"
              sizes="(max-width: 768px) calc(100vw - 40px), 430px"
              style={{ width: "100%", height: "auto", borderRadius: "8px", display: "block" }}
            />
          </div>

          {/* Form */}
          <div>
            <EditableText
              section="newsletter"
              field="title"
              tag="h2"
              style={{ marginTop: 0, marginBottom: "16px", fontSize: "26px", display: "block" }}
            />
            <EditableText
              section="newsletter"
              field="body"
              tag="p"
              richText
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", color: "#1f1f1f", marginBottom: "28px", lineHeight: "1.6", display: "block" }}
            />

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <input type="text" placeholder={ui.namePlaceholder} value={firstName} onChange={e => setFirstName(e.target.value)} className="input-round" style={{ flex: "1 1 140px", minWidth: "120px" }} />
                <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="input-round" style={{ flex: "2 1 200px", minWidth: "160px" }} />
              </div>
              <div style={{ marginTop: "16px" }}>
                <button type="submit" className="btn-primary" style={{ padding: "12px 50px" }}>
                  <EditableText section="newsletter" field="buttonText" tag="span" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .newsletter-grid { grid-template-columns: 1fr !important; }
          .newsletter-grid > :first-child { display: none; }
        }
      `}</style>
    </section>
  );
}
