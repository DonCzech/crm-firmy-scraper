"use client";
import { useContent } from "@/astera/context/ContentContext";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";

/** Titulek se edituje jako rich text — do alt patří holý text, ne značky. */
function htmlToText(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export default function MonthlyOracle() {
  const { content } = useContent();
  const o = content.oracle;

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "70px 0" }}>
      <div className="container-main">
        <div
          style={{ display: "grid", gridTemplateColumns: "3fr 9fr", gap: "48px", alignItems: "center" }}
          className="oracle-grid"
        >
          {/* Text */}
          <div>
            <EditableText
              section="oracle"
              field="title"
              tag="h2"
              style={{ marginTop: 0, marginBottom: "16px", fontSize: "26px", display: "block" }}
            />
            <EditableText
              section="oracle"
              field="body"
              tag="p"
              richText
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", lineHeight: "1.7", color: "#1f1f1f", display: "block" }}
            />
          </div>

          {/* Image — editovatelný, každý jazyk má vlastní obrázek i mobilní verzi */}
          <div>
            <EditableImg
              section="oracle"
              field="image"
              mobileField="mobileImage"
              alt={htmlToText(o.title)}
              sizes="(max-width: 768px) calc(100vw - 32px), 60vw"
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .oracle-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
