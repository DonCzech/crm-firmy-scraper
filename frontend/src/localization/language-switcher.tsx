import { useLocation } from "react-router-dom";
import { useLanguage } from "./language-context";

export function LanguageSwitcher() {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  if (!location.pathname.startsWith("/core")) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[1200] rounded-md border bg-background/95 shadow px-1 py-1 flex items-center gap-1"
      data-no-localize="true"
    >
      <button
        type="button"
        onClick={() => setLanguage("cs")}
        className={`h-8 px-2 rounded text-xs font-medium ${language === "cs" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
      >
        CZ
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`h-8 px-2 rounded text-xs font-medium ${language === "en" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
      >
        EN
      </button>
    </div>
  );
}
