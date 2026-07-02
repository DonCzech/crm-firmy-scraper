/**
 * Webero credit — "Vytvořilo Webero" + logo link s UTM tracking.
 * Cílem je posílit organickou viditelnost webero.co (každá hotová stránka linkuje zpět).
 * Inspirováno Shoptet-style patičkou.
 */
const WEBERO_URL = "https://webero.co/?utm_source=footer&utm_medium=link&utm_campaign=created_by_webero";

export function WeberoCredit() {
  return (
    <a
      href={WEBERO_URL}
      target="_blank"
      rel="noopener"
      className="bc-webero-credit"
      title="Vytvořilo Webero"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.04em",
        color: "rgba(245,245,245,0.55)",
        textDecoration: "none",
        transition: "color 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{
        display: "inline-flex", width: 18, height: 18,
        color: "currentColor",
      }}>
        <svg width="18" height="18" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="30" rx="8" fill="rgba(255,255,255,0.12)"/>
          <path d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </span>
      <span>Vytvořilo <strong style={{ fontWeight: 700 }}>Webero</strong></span>
    </a>
  );
}
