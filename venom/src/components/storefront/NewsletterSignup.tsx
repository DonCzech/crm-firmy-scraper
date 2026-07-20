"use client";

import { useState } from "react";

export function NewsletterSignup({ tenantSlug }: { tenantSlug: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setStatus("success"); setEmail(""); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  if (status === "success") {
    return (
      <div style={{
        padding: "40px 20px", textAlign: "center", background: "#f0fdf4", borderRadius: 16,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✉️</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#166534", margin: 0 }}>Děkujeme za přihlášení!</h3>
        <p style={{ fontSize: 14, color: "#15803d", marginTop: 6 }}>Budete dostávat novinky a speciální nabídky.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: "32px 24px", background: "#111", borderRadius: 16, textAlign: "center",
      color: "#fff",
    }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Buďte v obraze</h3>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>
        Přihlaste se k odběru novinek a získejte slevu na první nákup.
      </p>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          required
          style={{
            flex: 1, height: 44, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.08)", color: "#fff", paddingLeft: 14,
            fontSize: 14, outline: "none",
          }}
        />
        <button type="submit" disabled={status === "loading"} style={{
          height: 44, padding: "0 22px", borderRadius: 10, border: "none",
          background: "#2563eb", color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap",
        }}>
          {status === "loading" ? "Odesílám…" : "Odebírat"}
        </button>
      </form>
      {status === "error" && (
        <p style={{ fontSize: 13, color: "#f87171", marginTop: 10 }}>Něco se pokazilo, zkuste to znovu.</p>
      )}
    </div>
  );
}
