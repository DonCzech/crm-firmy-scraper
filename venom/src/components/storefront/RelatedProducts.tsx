"use client";

interface Product {
  id: number; slug: string; title: string; brand: string | null;
  price_cents: number; image_url: string | null;
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export function RelatedProducts({ products, tenantSlug, heading, currency = "CZK" }: { products: Product[]; tenantSlug: string; heading?: string; currency?: string }) {
  if (products.length === 0) return null;

  return (
    <section style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid #f3f4f6" }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#111" }}>{heading ?? "Mohlo by se vám líbit"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {products.map((p) => (
          <a key={p.id} href={`/demo/${tenantSlug}/obchod/${p.slug}`} style={{
            display: "block", textDecoration: "none", color: "#111",
            borderRadius: 12, overflow: "hidden", border: "1px solid #f3f4f6",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ aspectRatio: "1", background: "#f5f5f5", overflow: "hidden" }}>
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 13 }}>Bez fotky</div>
              )}
            </div>
            <div style={{ padding: "12px 14px" }}>
              {p.brand && <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.brand}</div>}
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
              <div className="rp-price" style={{ fontSize: 15, fontWeight: 700, color: "#2563eb", marginTop: 6 }}>{czk(p.price_cents, currency)}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
