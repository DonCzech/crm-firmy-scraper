"use client";
import { useContent } from "@/context/ContentContext";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";

export default function PickACard() {
  const { content } = useContent();
  const p = content.pickacard;

  return (
    <section style={{ backgroundColor: "#f9f7f7", padding: "70px 0" }}>
      <div className="container-main">
        <div
          style={{ display: "grid", gridTemplateColumns: "5fr 1fr 4fr", gap: "0", alignItems: "center" }}
          className="pick-grid"
        >
          {/* Portrait */}
          <div style={{ position: "relative" }}>
            <EditableImg
              section="pickacard"
              field="image"
              alt={p.title}
              style={{ width: "min(100%, 430px)", maxHeight: "620px", height: "auto", objectFit: "contain", display: "block", margin: "0 auto", position: "relative", zIndex: 1 }}
            />
          </div>

          {/* Spacer */}
          <div />

          {/* Text */}
          <div>
            <EditableText
              section="pickacard"
              field="title"
              tag="h2"
              style={{ marginTop: 0, marginBottom: "16px", fontSize: "26px", display: "block" }}
            />
            <EditableText
              section="pickacard"
              field="body"
              tag="p"
              richText
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", lineHeight: "1.7", color: "#1f1f1f", marginBottom: "28px", display: "block" }}
            />
            <a href={p.buttonHref} className="btn-primary">
              <EditableText section="pickacard" field="buttonText" tag="span" />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pick-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pick-grid > :nth-child(2) { display: none; }
          .pick-grid > :first-child img { bottom: 0 !important; margin-bottom: 0 !important; }
        }
      `}</style>
    </section>
  );
}
