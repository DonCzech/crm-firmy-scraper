"use client";
import { useContent } from "@/astera/context/ContentContext";
import EditableText from "./admin/EditableText";
import TestimonialsSlider from "./TestimonialsSlider";
import { localizeHref } from "@/astera/lib/i18n";

export default function AboutAstera() {
  const { content, currentLang } = useContent();
  const a = content.about;

  return (
    <section id="o-astere" style={{ backgroundColor: "#f9f7f7", padding: "70px 0 30px", marginTop: "0", scrollMarginTop: "110px" }}>
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
            <a href={localizeHref(a.buttonHref, currentLang)} className="btn-primary">
              <EditableText section="about" field="buttonText" tag="span" />
            </a>
          </div>

          {/* Spacer */}
          <div />

          {/* Testimonials slider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TestimonialsSlider />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-grid > :nth-child(2) { display: none; }
        }
      `}</style>
    </section>
  );
}
