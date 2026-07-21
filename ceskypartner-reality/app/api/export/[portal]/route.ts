import { NextResponse } from "next/server";
import { PORTAL_MAP } from "@/lib/portals";

export const dynamic = "force-dynamic";

// Generický XML feed byl odstraněn, protože jednotlivé portály používají
// rozdílná importní rozhraní a jeho existence vytvářela falešný dojem
// funkční integrace. Pull feed bude vrácen pouze portálům, které ho skutečně
// podporují, až v jejich konkrétním konektoru.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ portal: string }> },
) {
  const { portal } = await params;
  const portalKey = portal.replace(/\.xml$/i, "").toUpperCase();
  const portalInfo = PORTAL_MAP[portalKey];

  if (!portalInfo) {
    return NextResponse.json({ error: "Neznámý portál" }, { status: 404 });
  }

  return NextResponse.json(
    {
      error: "Generický XML feed není podporován.",
      portal: portalInfo.name,
      message:
        "Tento portál musí být synchronizován přes své skutečné importní rozhraní v administraci.",
    },
    { status: 410 },
  );
}
