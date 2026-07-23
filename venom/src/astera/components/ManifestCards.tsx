"use client";
import { useContent } from "@/astera/context/ContentContext";
import { ManifestCard } from "@/astera/lib/content-types";
import EditableText from "./admin/EditableText";
import EditableImg from "./admin/EditableImg";
import { localizeHref } from "@/astera/lib/i18n";

export default function ManifestCards() {
  const { content, admin, currentLang } = useContent();
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
                {admin.isAdmin || !card.btnHref ? (
                  <EditableImg
                    section="manifest"
                    field={`cards.${i}.image`}
                    mobileField={`cards.${i}.mobileImage`}
                    alt={card.title}
                    sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 64px) / 2), 331px"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                ) : (
                  <a href={localizeHref(card.btnHref, currentLang)} aria-label={card.title} className="manifest-image-link">
                    <EditableImg
                      section="manifest"
                      field={`cards.${i}.image`}
                      mobileField={`cards.${i}.mobileImage`}
                      alt={card.title}
                      sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 64px) / 2), 331px"
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </a>
                )}
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

              <a href={localizeHref(card.btnHref, currentLang)} className="btn-primary">
                <EditableText section="manifest" field={`cards.${i}.btnText`} tag="span" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .manifest-image-link {
          display: block;
          width: 100%;
          color: inherit;
          text-decoration: none;
        }
        .manifest-image-link img {
          transition: transform 0.28s ease, filter 0.28s ease;
        }
        .manifest-image-link:hover img {
          transform: scale(1.025);
          filter: brightness(1.03);
        }
        @media (max-width: 900px) { .manifest-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .manifest-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
