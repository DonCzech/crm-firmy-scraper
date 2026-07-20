"use client";

import { useCallback, useEffect, useState } from "react";

interface Review {
  id: number; author_name: string; rating: number;
  title: string | null; body: string | null; photo_url?: string | null; created_at: string;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= rating ? "#f59e0b" : "none"}
          stroke={s <= rating ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductReviews({ tenantSlug, productId, enablePhotos = false }: { tenantSlug: string; productId: number; enablePhotos?: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", rating: 5, title: "", body: "", photoUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/demo/${tenantSlug}/shop/reviews?productId=${productId}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setAvg(data.avgRating ?? 0);
    setTotal(data.totalReviews ?? 0);
  }, [tenantSlug, productId]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    await fetch(`/api/demo/${tenantSlug}/shop/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, authorName: form.name, authorEmail: form.email, rating: form.rating, title: form.title, body: form.body, photoUrl: enablePhotos ? form.photoUrl || undefined : undefined }),
    });
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
  }

  return (
    <section style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid #f3f4f6" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#111" }}>Hodnocení zákazníků</h3>
          {total > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Stars rating={Math.round(avg)} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{avg.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: "#6b7280" }}>({total} {total === 1 ? "recenze" : total < 5 ? "recenze" : "recenzí"})</span>
            </div>
          )}
        </div>
        {!showForm && !submitted && (
          <button onClick={() => setShowForm(true)} style={{
            height: 38, padding: "0 18px", borderRadius: 10, border: "1px solid #e5e7eb",
            background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#111",
          }}>
            Napsat recenzi
          </button>
        )}
      </div>

      {submitted && (
        <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 10, fontSize: 14, color: "#166534", marginBottom: 20 }}>
          Děkujeme za recenzi! Bude zobrazena po schválení.
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} style={{ padding: 20, background: "#f9fafb", borderRadius: 12, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Vaše jméno *" required
              style={{ height: 40, borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 14 }} />
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-mail (nepovinné)"
              style={{ height: 40, borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>Hodnocení</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: s }))} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={s <= form.rating ? "#f59e0b" : "none"} stroke={s <= form.rating ? "#f59e0b" : "#d1d5db"} strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Nadpis recenze"
            style={{ width: "100%", height: 40, borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />
          <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Vaše zkušenost s produktem…" rows={4}
            style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "10px 12px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
          {enablePhotos && (
            <input type="url" value={form.photoUrl} onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))} placeholder="Odkaz na fotku produktu (nepovinné) — https://…"
              style={{ width: "100%", height: 40, borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 14, marginTop: 12, boxSizing: "border-box" }} />
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit" disabled={submitting} style={{
              height: 38, padding: "0 20px", borderRadius: 10, border: "none",
              background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              {submitting ? "Odesílám…" : "Odeslat recenzi"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{
              height: 38, padding: "0 16px", borderRadius: 10, border: "1px solid #e5e7eb",
              background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#6b7280",
            }}>
              Zrušit
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ padding: "14px 16px", background: "#fafafa", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "#2563eb",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700,
                  }}>{r.author_name.charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.author_name}</span>
                </div>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(r.created_at).toLocaleDateString("cs-CZ")}</span>
              </div>
              <Stars rating={r.rating} size={14} />
              {r.title && <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{r.title}</div>}
              {r.body && <div style={{ fontSize: 14, color: "#4b5563", marginTop: 4, lineHeight: 1.5 }}>{r.body}</div>}
              {enablePhotos && r.photo_url && (
                <a href={r.photo_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.photo_url} alt={`Fotka od ${r.author_name}`} loading="lazy"
                    style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : !submitted && (
        <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
          Zatím žádné recenze. Buďte první, kdo ohodnotí tento produkt!
        </p>
      )}
    </section>
  );
}
