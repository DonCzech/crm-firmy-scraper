import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const footer = {
  siteName: "SolarPro",
  tagline: "Tepelná čerpadla & fotovoltaika",
  brandLede: "Český výrobce energetických řešení. Vlastní servisní síť po celé republice a garantovaná návratnost do sedmi let.",
  ctaEyebrow: "Rozhodujete se?",
  ctaTitle: "Získejte nezávazný návrh systému do 48 hodin",
  ctaText: "Bezplatná konzultace",
  ctaHref: "/kontakt",
  phone: "+420 800 555 234",
  phoneNote: "Po–Pá 8:00–18:00",
  email: "info@solarpro.cz",
  emailNote: "Odpovídáme do 4 h",
  address: "Průmyslová 1428, 370 01 České Budějovice",
  addressNote: "Výrobní závod & showroom",
  copyright: "© 2026 SolarPro Energetika, s.r.o.",
  legal1: "Ochrana osobních údajů",
  legal1Href: "/kontakt",
  legal2: "Obchodní podmínky",
  legal2Href: "/kontakt",
  col1Title: "Řešení",
  col1Links: [
    { label: "Tepelná čerpadla",       href: "/sortiment"  },
    { label: "Fotovoltaika",           href: "/sortiment"  },
    { label: "Hybridní systémy",       href: "/sortiment"  },
    { label: "Dotační poradenství",    href: "/poradna"    },
    { label: "Realizace",              href: "/realizace"  }
  ],
  col2Title: "Produkty",
  col2Links: [
    { label: "EcoTherm Air 6",         href: "/sortiment" },
    { label: "EcoTherm Air 9",         href: "/sortiment" },
    { label: "EcoTherm Air 12",        href: "/sortiment" },
    { label: "EcoTherm Geo 8",         href: "/sortiment" },
    { label: "SolarPanel 550 W",       href: "/sortiment" },
    { label: "Bateriové úložiště",     href: "/sortiment" }
  ],
  col3Title: "Společnost",
  col3Links: [
    { label: "O firmě",                href: "/ofirme"    },
    { label: "Aktuality",              href: "/aktuality" },
    { label: "Monitoring provozu",     href: "/monitoring"},
    { label: "Poradna",                href: "/poradna"   },
    { label: "Kontakt",                href: "/kontakt"   }
  ],
  fbHref: "#",
  igHref: "#",
  ytHref: "#",
  liHref: "#"
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12280 RETURNING id",
  [JSON.stringify(footer)]
);
console.log("Updated footer section:", r.rows);
await c.end();
