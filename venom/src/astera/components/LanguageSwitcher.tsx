"use client";
import { usePathname } from "next/navigation";
import { LANGUAGES, LangMeta, localizePath, Lang } from "@/astera/lib/i18n";
import { useContent } from "@/astera/context/ContentContext";

interface Props {
  compact?: boolean; // true = just flags, false = flag + name
}

export default function LanguageSwitcher({ compact = false }: Props) {
  const pathname = usePathname() ?? "/";
  const { currentLang } = useContent();

  function hrefFor(lang: Lang): string {
    return localizePath(pathname, lang);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: compact ? "6px" : "10px",
        alignItems: "center",
        flexWrap: "nowrap",
      }}
    >
      {LANGUAGES.map((lang: LangMeta) => {
        const active = lang.code === currentLang;
        return (
          <a
            key={lang.code}
            href={hrefFor(lang.code)}
            title={lang.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              padding: compact ? "4px 6px" : "5px 10px",
              borderRadius: "20px",
              border: active ? "2px solid #7c3bb2" : "1px solid #dde5f0",
              backgroundColor: active ? "#f5f0fb" : "transparent",
              cursor: active ? "default" : "pointer",
              transition: "all 0.2s",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "13px",
              fontWeight: active ? 600 : 400,
              color: active ? "#7c3bb2" : "#555",
              pointerEvents: active ? "none" : "auto",
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#7c3bb2";
                (e.currentTarget as HTMLAnchorElement).style.color = "#7c3bb2";
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#dde5f0";
                (e.currentTarget as HTMLAnchorElement).style.color = "#555";
              }
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>{lang.flag}</span>
            {!compact && (
              <span>{lang.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
