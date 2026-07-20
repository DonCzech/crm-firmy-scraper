"use client";

import { useEffect, useState } from "react";

interface RecentProduct {
  slug: string; title: string; price: string; image?: string;
}

const KEY = "webero_recently_viewed";
const MAX = 12;

export function trackRecentlyViewed(tenantSlug: string, product: RecentProduct) {
  try {
    const key = `${KEY}_${tenantSlug}`;
    const saved: RecentProduct[] = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = saved.filter((p) => p.slug !== product.slug);
    filtered.unshift(product);
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, MAX)));
  } catch {}
}

function czk(cents: number): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(cents / 100);
}

export function RecentlyViewed({ tenantSlug, currentSlug }: { tenantSlug: string; currentSlug?: string }) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const saved: RecentProduct[] = JSON.parse(localStorage.getItem(`${KEY}_${tenantSlug}`) || "[]");
      setItems(saved.filter((p) => p.slug !== currentSlug).slice(0, 6));
    } catch {}
  }, [tenantSlug, currentSlug]);

  if (items.length === 0) return null;

  return (
    <section style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #f3f4f6" }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#111" }}>Nedávno prohlížené</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {items.map((p) => (
          <a key={p.slug} href={`/demo/${tenantSlug}/obchod/${p.slug}`} style={{
            display: "block", textDecoration: "none", color: "#111",
            borderRadius: 10, overflow: "hidden", border: "1px solid #f3f4f6",
            transition: "box-shadow 0.15s",
          }}>
            <div style={{ aspectRatio: "1", background: "#f5f5f5", overflow: "hidden" }}>
              {p.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", marginTop: 2 }}>{p.price}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
