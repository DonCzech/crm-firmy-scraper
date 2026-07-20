"use client";

import { useState } from "react";

export function BackInStockNotify({ tenantSlug, variantId }: { tenantSlug: string; variantId: number }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/shop/stock-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch { setStatus("error"); }
  }

  if (status === "done") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, fontSize: 13, color: "#166534" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
        Upozorníme vás, až bude opět skladem.
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 12 }}>
      <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>Momentálně vyprodáno</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Váš e-mail pro upozornění"
          required
          style={{
            flex: 1, height: 40, borderRadius: 8, border: "1px solid #e5e7eb",
            paddingLeft: 12, fontSize: 13, outline: "none",
          }}
        />
        <button type="submit" disabled={status === "loading"} style={{
          height: 40, padding: "0 16px", borderRadius: 8, border: "none",
          background: "#111", color: "#fff", fontSize: 13, fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap",
        }}>
          {status === "loading" ? "…" : "Upozornit mě"}
        </button>
      </div>
    </form>
  );
}
