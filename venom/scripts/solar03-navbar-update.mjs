import pg from "pg";
import { readFileSync } from "fs";
const url = readFileSync("/Users/apple/DEV/CRM/venom/.env.local","utf-8").match(/DATABASE_URL=(.+)/)[1].trim().replace(/^"|"$/g,"");
const c = new pg.Client({connectionString:url}); await c.connect();

const navbar = {
  siteName: "Demo SolarPro",
  tagline: "Tepelná čerpadla & fotovoltaika",
  announcementText: "SPECIÁLNÍ NABÍDKA PRO PRŮMYSLOVÉ OBJEKTY 2026 —",
  announcementLink: "ZAŽÁDAT O KONZULTACI",
  announcementHref: "/kontakt",
  links: [
    { label: "Realizace",  href: "/realizace"  },
    { label: "Monitoring", href: "/monitoring" },
    { label: "Aktuality",  href: "/aktuality"  },
    { label: "Sortiment",  href: "/sortiment"  },
    { label: "Poradna",    href: "/poradna"    },
    { label: "O firmě",    href: "/ofirme"     },
    { label: "Kontakt",    href: "/kontakt"    }
  ],
  navLinks: [
    { label: "Tepelná čerpadla", href: "/sortiment" },
    { label: "Fotovoltaika",     href: "/sortiment" },
    { label: "Realizace",        href: "/realizace" }
  ],
  ctaText: "Bezplatná konzultace",
  ctaHref: "/kontakt"
};

const r = await c.query(
  "UPDATE sections SET content_overrides = $1::jsonb, updated_at = NOW() WHERE id = 12273 RETURNING id",
  [JSON.stringify(navbar)]
);
console.log("Updated navbar section:", r.rows);
await c.end();
