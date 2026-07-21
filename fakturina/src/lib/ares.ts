export interface AresCompany {
  name: string;
  ico: string;
  dic?: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export async function lookupCompanyByIco(ico: string): Promise<AresCompany | null> {
  const clean = ico.replace(/\s/g, "").padStart(8, "0");

  try {
    const res = await fetch(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${clean}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      }
    );

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`ARES vrátil HTTP ${res.status}`);

    const data = await res.json();
    const addr = data.sidlo;

    return {
      name: data.obchodniJmeno ?? "",
      ico: clean,
      dic: data.dic ?? undefined,
      address: [addr?.nazevUlice, addr?.cisloDomovni, addr?.cisloOrientacni]
        .filter(Boolean)
        .join(" "),
      city: addr?.nazevObce ?? "",
      zip: addr?.psc ? String(addr.psc) : "",
      country: "CZ",
    };
  } catch (error) {
    console.error("ARES lookup failed", error);
    return null;
  }
}
