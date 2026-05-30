"use client";
import { useContent } from "@/context/ContentContext";
import EditableText from "./admin/EditableText";
import { cssImageUrl } from "@/lib/image-formats";

export default function MonthlyOracle() {
  const { content } = useContent();
  const o = content.oracle;
  const thumbnailImage = o.thumbnailImage || "/images/oracle-video-thumb.jpg";

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

          {/* Image */}
          <div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px" }}>
              <div className="oracle-video-thumb" role="img" aria-label={o.title} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .oracle-video-thumb {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: ${cssImageUrl(thumbnailImage)} center/cover no-repeat;
        }
        @media (max-width: 768px) {
          .oracle-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
