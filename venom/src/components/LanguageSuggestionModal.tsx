import type { PlatformLocale } from "@/lib/platform-i18n";

interface LanguageSuggestionModalProps {
  currentLocale: PlatformLocale;
  suggestedLocale: PlatformLocale | "";
}

export function LanguageSuggestionModal({
  currentLocale,
  suggestedLocale,
}: LanguageSuggestionModalProps) {
  if (currentLocale !== "en" || suggestedLocale !== "cs") return null;

  const stayJs = [
    "(function(){",
    "document.cookie='webero-locale-preference=en; path=/; max-age=31536000; samesite=lax';",
    "document.cookie='webero-locale-suggested=; path=/; max-age=0';",
    "try{localStorage.setItem('webero-locale-preference','en')}catch(e){}",
    "var m=document.getElementById('webero-lang-suggestion');if(m)m.style.display='none';",
    "})()",
  ].join("");

  const continueJs = [
    "(function(){",
    "document.cookie='webero-locale-preference=cs; path=/; max-age=31536000; samesite=lax';",
    "document.cookie='webero-locale-suggested=; path=/; max-age=0';",
    "try{localStorage.setItem('webero-locale-preference','cs')}catch(e){}",
    "var map={'/':'/cs','/en':'/cs','/en/products-and-solutions':'/produkty-a-reseni','/en/features':'/prehled-funkci','/en/choose-design':'/vybrat-design','/en/pricing':'/cenik','/en/admin/login':'/admin/login'};",
    "var p=window.location.pathname;",
    "var target=map[p]||'/cs';",
    "window.location.href=target+window.location.search+window.location.hash;",
    "})()",
  ].join("");

  const html = `
    <div style="position:relative;width:100%;max-width:30rem;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,.14);background:#0a0a0a;color:#fff;box-shadow:0 32px 90px rgba(0,0,0,.42)">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 0%,rgba(99,102,241,.42),transparent 34%),linear-gradient(135deg,rgba(255,255,255,.08),transparent 46%);pointer-events:none"></div>
      <button type="button" onclick="${stayJs}" aria-label="Close" style="position:absolute;right:14px;top:14px;z-index:2;display:flex;height:34px;width:34px;align-items:center;justify-content:center;border-radius:9999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);cursor:pointer">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="pointer-events:none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <div style="position:relative;z-index:1;padding:30px 26px 24px">
        <div style="margin:0 auto 18px;display:flex;height:66px;width:66px;align-items:center;justify-content:center;border-radius:18px;background:linear-gradient(135deg,#6366f1,#4338ca);box-shadow:0 18px 42px rgba(99,102,241,.38);font-size:30px">🇨🇿</div>
        <p style="margin:0;text-align:center;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#a5b4fc">Webero speaks Czech too</p>
        <h2 style="margin:10px 0 0;text-align:center;font-size:24px;line-height:1.12;font-weight:800;letter-spacing:-.02em;color:#fff">Webero je dostupné i v češtině</h2>
        <p style="margin:10px auto 0;max-width:22rem;text-align:center;font-size:14px;line-height:1.55;color:rgba(255,255,255,.68)">Vypadá to, že jste z Česka. Můžete pokračovat česky, nebo zůstat v anglické verzi.</p>
        <div style="margin-top:22px;display:grid;gap:10px">
          <button type="button" onclick="${continueJs}" style="width:100%;border-radius:9999px;border:none;background:#fff;padding:12px 18px;font-size:14px;font-weight:800;color:#0a0a0a;cursor:pointer;box-shadow:0 8px 26px rgba(255,255,255,.18)">Pokračovat česky</button>
          <button type="button" onclick="${stayJs}" style="width:100%;border-radius:9999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);padding:12px 18px;font-size:14px;font-weight:700;color:rgba(255,255,255,.82);cursor:pointer">Stay in English</button>
        </div>
      </div>
    </div>
  `;

  return (
    <div
      id="webero-lang-suggestion"
      role="dialog"
      aria-modal="true"
      aria-label="Language suggestion"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(8,10,18,.58)",
        backdropFilter: "blur(14px)",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
