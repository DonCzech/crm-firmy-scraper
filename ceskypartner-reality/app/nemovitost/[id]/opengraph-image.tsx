import { ImageResponse } from "next/og";
import { getListingBySlug } from "@/lib/queries";
import { getListingDetail } from "@/data/details";
import { dealTypeLabel } from "@/lib/mappers";

// Brandovaná OG kartička pro sdílení detailu — fotka + gradient + logo + cena.
export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Český Partner — detail nemovitosti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: { id: string } };

async function loadData(id: string) {
  const db = await getListingBySlug(id).catch(() => null);
  if (db) {
    return {
      title: db.title,
      location: db.location,
      deal: dealTypeLabel(db.deal),
      price: db.priceHidden ? "Cena na vyžádání" : `${db.price.toLocaleString("cs-CZ")} Kč${db.deal === "RENT" ? " / měsíc" : ""}`,
      image: db.images[0]?.url || null,
    };
  }
  const detail = getListingDetail(id);
  if (!detail) return null;
  return {
    title: detail.listing.title,
    location: detail.listing.location,
    deal: detail.dealType,
    price: `${detail.listing.price.toLocaleString("cs-CZ")} Kč${detail.listing.priceSuffix ? ` ${detail.listing.priceSuffix}` : ""}`,
    image: detail.gallery[0] || null,
  };
}

export default async function OgImage({ params }: Props) {
  const data = await loadData(params.id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#14181A",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {data?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, objectFit: "cover", width: "100%", height: "100%" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(10,12,14,0.35) 0%, rgba(10,12,14,0.15) 40%, rgba(10,12,14,0.82) 100%)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", padding: "48px 56px 0" }}>
          <div style={{ color: "#FAF9F6", fontSize: 30, fontWeight: 600, letterSpacing: 8 }}>ČESKÝ PARTNER</div>
          <div style={{ color: "#A9885A", fontSize: 14, letterSpacing: 10, marginTop: 8 }}>REALITNÍ KANCELÁŘ</div>
        </div>

        {/* Spodní blok */}
        <div style={{ display: "flex", flexDirection: "column", padding: "0 56px 52px" }}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                backgroundColor: "#14181A",
                color: "#FAF9F6",
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: 4,
                padding: "10px 18px",
              }}
            >
              EXKLUZIVNĚ
            </div>
          </div>
          <div
            style={{
              color: "#FAF9F6",
              fontSize: 52,
              fontWeight: 600,
              lineHeight: 1.1,
              marginTop: 22,
              maxWidth: 1000,
            }}
          >
            {data?.title || "Prémiové nemovitosti v České republice"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 28, marginTop: 18 }}>
            {data?.location && (
              <div style={{ color: "rgba(250,249,246,0.75)", fontSize: 26 }}>
                {`${data.deal} · ${data.location}`}
              </div>
            )}
            {data?.price && (
              <div style={{ color: "#C9A96A", fontSize: 34, fontWeight: 600 }}>{data.price}</div>
            )}
          </div>
        </div>
      </div>
    ),
    size
  );
}
