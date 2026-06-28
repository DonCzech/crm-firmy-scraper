/**
 * PublicTrialLock — server-rendered page shown to ALL visitors when the
 * tenant's trial has expired and the subscription is not active. The actual
 * site content is never reached, so visitors don't get a half-broken site.
 *
 * Includes a friendly heads-up + a CTA for the tenant owner. Light theme,
 * no admin tokens needed (renders in browser context without provider).
 */
export function PublicTrialLock({
  tenantSlug, businessName,
}: { tenantSlug: string; businessName?: string | null }) {
  const name = businessName?.trim() || tenantSlug;
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#0f172a",
      }}
    >
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-6 py-24 text-center">
        <div
          style={{
            display: "flex",
            height: 72,
            width: 72,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 18,
            background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
            boxShadow: "0 18px 48px rgba(99,102,241,0.40)",
            color: "#ffffff",
          }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <p
          style={{
            marginTop: 18,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#64748b",
          }}
        >
          Web je dočasně pozastavený
        </p>
        <h1
          style={{
            marginTop: 6,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            color: "#0f172a",
          }}
        >
          {name}
        </h1>
        <p
          style={{
            marginTop: 12,
            maxWidth: 480,
            fontSize: 15,
            lineHeight: 1.6,
            color: "#475569",
          }}
        >
          Vlastník webu má pozastavené předplatné. Stránku znovu spustí, jakmile aktivuje plán.
          Pokud jsi vlastník, otevři{" "}
          <a
            href="/account/billing"
            style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}
          >
            Webero účet → Fakturace
          </a>{" "}
          a obnov si přístup.
        </p>

        <a
          href="/account/billing"
          style={{
            marginTop: 28,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 48,
            padding: "0 22px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 10px 28px rgba(99,102,241,0.40)",
          }}
        >
          Aktivovat předplatné
        </a>

        <p style={{ marginTop: 36, fontSize: 11, color: "#94a3b8" }}>
          Powered by <strong style={{ color: "#475569" }}>Webero</strong> · webero.co
        </p>
      </div>
    </div>
  );
}
