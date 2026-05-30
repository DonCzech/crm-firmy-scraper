"use client";
import { useContent } from "@/context/ContentContext";
import { ManifestCard } from "@/lib/content-types";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";

export default function ManifestCards() {
  const { content } = useContent();
  const { cards } = content.manifest;

  return (
    <section style={{ backgroundColor: "#f2f6fc", padding: "70px 0" }}>
      <div className="container-main">
        <EditableText
          section="manifest"
          field="sectionTitle"
          tag="h2"
          style={{ textAlign: "center", marginBottom: "48px", marginTop: 0, display: "block" }}
        />

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
          className="manifest-grid"
        >
          {cards.map((card: ManifestCard, i: number) => (
            <div
              key={i}
              style={{ backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 32px" }}
            >
              <div className="roundit" style={{ width: "100%", overflow: "hidden" }}>
                <EditableImg
                  section="manifest"
                  field={`cards.${i}.image`}
                  alt={card.title}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>

              <EditableText
                section="manifest"
                field={`cards.${i}.title`}
                tag="h2"
                style={{ fontSize: "22px", fontWeight: 700, textAlign: "center", marginTop: 0, marginBottom: "14px", padding: "28px 24px 0", display: "block" }}
              />

              <EditableText
                section="manifest"
                field={`cards.${i}.text`}
                tag="p"
                richText
                style={{ fontFamily: "'Poppins', sans-serif", fontSize: "14px", lineHeight: "1.6", color: "#1f1f1f", textAlign: "center", padding: "0 24px", marginBottom: "24px", flex: 1, display: "block" }}
              />

              <a href={card.btnHref} className="btn-primary">
                <EditableText section="manifest" field={`cards.${i}.btnText`} tag="span" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .manifest-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .manifest-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
