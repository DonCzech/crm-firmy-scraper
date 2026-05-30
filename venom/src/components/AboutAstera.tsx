"use client";
import { useContent } from "@/context/ContentContext";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";

export default function AboutAstera() {
  const { content } = useContent();
  const a = content.about;
  const hasBottomImage = Boolean(a.imageBottom);

  return (
    <section id="o-studiu" style={{ backgroundColor: "#f9f7f7", padding: "70px 0 30px", marginTop: "0", scrollMarginTop: "110px" }}>
      <div className="container-main">
        <div
          style={{ display: "grid", gridTemplateColumns: "6fr 1fr 5fr", gap: "0", alignItems: "center" }}
          className="about-grid"
        >
          {/* Text */}
          <div style={{ padding: "0 20px 0 0" }}>
            <EditableText
              section="about"
              field="title"
              tag="h2"
              style={{ marginTop: 0, marginBottom: "20px", fontSize: "26px", display: "block" }}
            />
            <EditableText
              section="about"
              field="body1"
              tag="p"
              richText
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", lineHeight: "1.7", color: "#1f1f1f", marginBottom: "16px", display: "block" }}
            />
            <EditableText
              section="about"
              field="body2"
              tag="p"
              richText
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", lineHeight: "1.7", color: "#1f1f1f", marginBottom: "32px", display: "block" }}
            />
            <a href={a.buttonHref} className="btn-primary">
              <EditableText section="about" field="buttonText" tag="span" />
            </a>
          </div>

          {/* Spacer */}
          <div />

          {/* Images */}
          <div style={{ position: "relative" }}>
            <EditableImg
              section="about"
              field="imageTop"
              alt={a.title}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "6px",
                marginTop: hasBottomImage ? "-60px" : "0",
                position: "relative",
                zIndex: 2,
              }}
            />
            {hasBottomImage && (
              <EditableImg
                section="about"
                field="imageBottom"
                alt={a.title}
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "6px", marginTop: "12px" }}
              />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .about-grid > :nth-child(2) { display: none; }
          .about-grid > :nth-child(3) { order: -1; }
          .about-grid > :nth-child(3) img:first-child { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  );
}
