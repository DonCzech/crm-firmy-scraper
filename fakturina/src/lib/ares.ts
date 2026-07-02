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

    if (!res.ok) return getMockCompany(clean);

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
  } catch {
    return getMockCompany(clean);
  }
}

function getMockCompany(ico: string): AresCompany {
  return {
    name: "Demo firma s.r.o.",
    ico,
    dic: `CZ${ico}`,
    address: "Příkladná 1",
    city: "Praha",
    zip: "11000",
    country: "CZ",
  };
}
