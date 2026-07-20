"use client";

/**
 * Eshop17Listing — Rozkvět (florea.cz DNA 1:1) stránka kategorie.
 * Breadcrumb → bordó Fraunces H1 + bohatý popis → USP řádek (4 ikony) →
 * foto dlaždice podkategorií → filtr lišta (Složení kytic / Délka / Dostupnost
 * / Řazení — plně funkční client-side) → grid florea karet (název nahoře,
 * badge vrstva, skladovost zeleně, přeškrtnutá cena, zelený Detail) →
 * stránkování → SEO blok „Jak vybrat" + FAQ akordeon + box zakladatele.
 */

import { useMemo, useState } from "react";

const BORDO = "#8f1d3d";
const BORDO_DK = "#611028";
const GOLD = "#c9a24b";
const GREEN = "#3c7d46";
const GREEN_DK = "#2f6238";
const INK = "#241a1d";
const MUTED = "#7d6d72";
const CREAM = "#f7f1e8";
const LINE = "#eadfd6";
const HEAD = "'Fraunces', Georgia, serif";
const SANS = "'Instrument Sans', 'Segoe UI', system-ui, sans-serif";

export interface Es17ListItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  price_min_cents: number;
  compare_at_max_cents: number | null;
  stock_total: number;
  bulk: number | null;
  featured: boolean;
  free_ship: boolean;
}

export interface Es17Category {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  product_count: number;
  image_url: string | null;
}

interface Props {
  items: Es17ListItem[];
  categories: Es17Category[];
  activeCategory: string | null;
  categoryName: string;
  categoryDescription: string | null;
  basePath: string;
  tenantSlug: string;
  currency: string;
  total: number;
  page: number;
  pages: number;
  perPage: number;
}

// Foto dlaždice podkategorií — stejná ověřená sada jako mega menu (kategorie v DB fotky nemají)
const TILE_IMG: Record<string, string> = {
  "kytice-ruzi": "photo-1494972308805-463bc619d34e",
  "michane-kytice": "photo-1452827073306-6e6e661baf57",
  "kytice-tvaru-srdce": "photo-1526047932273-341f2a7631f9",
  "kytice-100-kvetu": "photo-1487530811176-3780de880c2d",
  "svatebni-kytice": "photo-1465495976277-4387d4b0b4c6",
  "smutecni-kytice": "photo-1606041008023-472dfb5e530f",
  "levne-svazky": "photo-1561181286-d3fee7d55364",
  "sezonni-kytice": "photo-1522748906645-95d8adfd52c7",
  "cervene-ruze": "photo-1494972308805-463bc619d34e",
  "luxusni-ruze": "photo-1496062031456-07b8f162a322",
  "metrove-ruze": "photo-1599733594230-6b823276abcc",
  "barvene-ruze": "photo-1518895949257-7621c3c786d7",
  "bile-ruze": "photo-1563241527-3004b7be0ffd",
  "ruzove-ruze": "photo-1591886960571-74d43a9d4166",
  "trsove-ruze": "photo-1519378058457-4c29a0a2efac",
  "ruze-na-svatbu": "photo-1465495976277-4387d4b0b4c6",
  "zahradni-ruze": "photo-1457089328109-e5d9bd499191",
  "tulipany": "photo-1520763185298-1b434c919102",
  "pivonky": "photo-1591886960571-74d43a9d4166",
  "slunecnice": "photo-1470509037663-253afd7f0f51",
  "gerbery": "photo-1606041008023-472dfb5e530f",
  "lilie": "photo-1502977249166-824b3a8a4d6d",
  "eustomy": "photo-1469259943454-aa100abba749",
  "flowerboxy": "photo-1563241527-3004b7be0ffd",
  "srdcove-boxy": "photo-1526047932273-341f2a7631f9",
  "boxy-s-pralinkami": "photo-1549007994-cb92caebd54b",
  "susene-kvetiny": "photo-1477511801984-4ad318ed9846",
  "vazy": "photo-1533616688419-b7a585564566",
  "vence": "photo-1606041008023-472dfb5e530f",
  "stuhy-a-prani": "photo-1549465220-1a8b9238cd48",
  "svicky": "photo-1602523961358-f9f03dd557db",
  "kytice": "photo-1487530811176-3780de880c2d",
  "ruze": "photo-1494972308805-463bc619d34e",
  "kvetiny": "photo-1520763185298-1b434c919102",
  "krabicky": "photo-1563241527-3004b7be0ffd",
  "doplnky": "photo-1533616688419-b7a585564566",
  "vyprodej": "photo-1519378058457-4c29a0a2efac",
  "novinky": "photo-1522748906645-95d8adfd52c7",
};
const tileImg = (slug: string, fallback: string | null) =>
  fallback ?? (TILE_IMG[slug] ? `https://images.unsplash.com/${TILE_IMG[slug]}?w=280&h=210&fit=crop&auto=format&q=75` : null);

const USPS = [
  { title: "Vážeme na objednávku", sub: "Květiny nikde dlouho nestojí", icon: "bouquet" },
  { title: "Fotka před odesláním", sub: "Volitelná služba pro váš klid", icon: "camera" },
  { title: "Rozvoz po celé ČR", sub: "Sledování kurýra online", icon: "truck" },
  { title: "Ověřeno zákazníky", sub: "21 000+ recenzí, Cena kvality", icon: "people" },
];

const FAQ = [
  { q: "Jak si rychle vybrat kytici?", a: "Nechte to na nás — „Kytice — výběr od floristy“ je bohatý sezónní mix v ceně, kterou si zvolíte. Floristka vybere to nejčerstvější, co ráno dorazilo, a před odesláním vám pošleme fotku hotové vazby." },
  { q: "Jednodruhovou kytici, nebo míchanou?", a: "Jednodruhová (třeba jen růže) působí elegantně a jednoznačně, míchaná je bohatší a hravější. Pro výročí a vyznání volte růže, k narozeninám a poděkování se hodí míchaná." },
  { q: "Jakou délku stonků zvolit?", a: "40–50 cm je klasika do vázy, 60–70 cm působí reprezentativně a 80+ cm je gesto na velké příležitosti. Čím delší stonek, tím větší květ odrůda obvykle nese." },
  { q: "Musím řešit sudý nebo lichý počet květin?", a: "V Česku se tradičně daruje lichý počet, sudý patří na smuteční vazby. U kytic nad 25 květů už počet nikdo nepočítá — vnímá se celkový objem." },
];

export function Eshop17Listing({
  items, categories, activeCategory, categoryName, categoryDescription,
  basePath, tenantSlug, currency, total, page, pages, perPage,
}: Props) {
  const [composition, setComposition] = useState<"vse" | "jedno" | "michane">("vse");
  const [length, setLength] = useState<string>("vse");
  const [availability, setAvailability] = useState<"sklad" | "vse">("vse");
  const [sort, setSort] = useState<string>("oblibenost");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const fmt = (cents: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
  const deliveryDate = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" })
    .format(new Date(Date.now() + 24 * 3600 * 1000));

  const active = activeCategory ? categories.find((c) => c.slug === activeCategory) : null;
  const tiles = (active
    ? categories.filter((c) => c.parent_id === active.id)
    : categories.filter((c) => !c.parent_id && !["novinky", "vyprodej"].includes(c.slug))
  ).slice(0, 8);
  const catHref = (slug: string) => `${basePath}?kategorie=${slug}`;
  const pageHref = (n: number) => `${basePath}?${activeCategory ? `kategorie=${activeCategory}&` : ""}strana=${n}`;

  const stemLen = (title: string) => {
    const m = title.match(/(\d{2,3})\s*cm/i);
    return m ? parseInt(m[1], 10) : null;
  };

  const filtered = useMemo(() => {
    let out = [...items];
    if (composition === "jedno") out = out.filter((it) => !/míchan/i.test(it.title));
    if (composition === "michane") out = out.filter((it) => /míchan/i.test(it.title));
    if (length !== "vse") {
      out = out.filter((it) => {
        const l = stemLen(it.title);
        if (l == null) return false;
        if (length === "70+") return l >= 70;
        return l === parseInt(length, 10);
      });
    }
    if (availability === "sklad") out = out.filter((it) => it.stock_total > 0);
    if (sort === "nejlevnejsi") out.sort((a, b) => a.price_min_cents - b.price_min_cents);
    if (sort === "nejdrazsi") out.sort((a, b) => b.price_min_cents - a.price_min_cents);
    if (sort === "sleva") out.sort((a, b) => {
      const d = (x: Es17ListItem) => (x.compare_at_max_cents ? 1 - x.price_min_cents / x.compare_at_max_cents : 0);
      return d(b) - d(a);
    });
    return out;
  }, [items, composition, length, availability, sort]);

  const lengths = useMemo(() => {
    const set = new Set<number>();
    for (const it of items) { const l = stemLen(it.title); if (l != null) set.add(l >= 70 ? 70 : l); }
    return [...set].sort((a, b) => a - b);
  }, [items]);

  return (
    <div style={{ fontFamily: SANS, background: "#fff" }}>
      <style>{`
        .es17l-wrap { max-width: 1420px; margin: 0 auto; padding: 0 28px 50px; }
        .es17l-crumb { display: flex; align-items: center; gap: 8px; padding: 16px 0 6px; font-size: 13px; color: ${MUTED}; }
        .es17l-crumb a { color: ${BORDO}; text-decoration: none; font-weight: 600; }
        .es17l-crumb a:hover { text-decoration: underline; text-underline-offset: 3px; }

        .es17l-desc { max-width: 900px; font-size: 14.5px; line-height: 1.65; color: ${INK}; margin: 12px 0 0; }
        .es17l-desc strong { font-weight: 700; }

        .es17l-usps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; padding: 22px 0 6px; }
        @media (max-width: 900px) { .es17l-usps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .es17l-usp { display: flex; align-items: center; gap: 12px; }
        .es17l-usp-ico { width: 44px; height: 44px; border-radius: 999px; background: ${CREAM}; color: ${BORDO}; border: 1px solid ${LINE}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .es17l-usp b { display: block; font-size: 13.5px; font-weight: 700; color: ${BORDO}; }
        .es17l-usp span { display: block; font-size: 12.5px; color: ${MUTED}; }

        .es17l-tiles { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 12px; padding: 20px 0 8px; }
        @media (max-width: 1100px) { .es17l-tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .es17l-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .es17l-tile { text-decoration: none; text-align: center; border: 1px solid ${LINE}; border-radius: 12px; padding: 10px 10px 12px; background: #fff; transition: transform 0.16s, box-shadow 0.18s, border-color 0.16s; }
        .es17l-tile:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(46,10,24,0.1); border-color: #ddc9b4; }
        .es17l-tile-img { display: block; width: 100%; aspect-ratio: 4/3; border-radius: 8px; overflow: hidden; background: ${CREAM}; }
        .es17l-tile-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .es17l-tile-name { display: block; margin-top: 9px; font-size: 13px; font-weight: 700; color: ${BORDO}; line-height: 1.3; }

        .es17l-filters { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; padding: 18px 0 14px; border-top: 1px solid ${LINE}; margin-top: 16px; }
        .es17l-flabel { font-size: 13.5px; font-weight: 700; color: ${INK}; }
        .es17l-seg { display: inline-flex; border: 1px solid ${LINE}; border-radius: 999px; overflow: hidden; }
        .es17l-seg button { border: none; background: #fff; color: ${INK}; font-family: ${SANS}; font-size: 13px; font-weight: 600; padding: 8px 15px; cursor: pointer; transition: background 0.13s, color 0.13s; }
        .es17l-seg button.on { background: ${BORDO}; color: #fff; }
        .es17l-seg button:not(.on):hover { background: ${CREAM}; }
        .es17l-select { height: 36px; border: 1px solid ${LINE}; border-radius: 999px; background: #fff; color: ${INK}; font-family: ${SANS}; font-size: 13px; font-weight: 600; padding: 0 14px; cursor: pointer; outline: none; }
        .es17l-select:focus { border-color: ${BORDO}; }

        .es17l-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
        @media (max-width: 1100px) { .es17l-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 820px) { .es17l-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } }

        .es17l-card { background: #fff; border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: transform 0.18s, box-shadow 0.2s, border-color 0.18s; }
        .es17l-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px rgba(46,10,24,0.11); border-color: #ddc9b4; }
        .es17l-title { padding: 13px 15px 10px; font-size: 14px; font-weight: 700; color: ${INK}; line-height: 1.4;
          overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; min-height: calc(2.8em + 23px); transition: color 0.14s; }
        .es17l-card:hover .es17l-title { color: ${BORDO}; }
        .es17l-media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: ${CREAM}; }
        .es17l-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s cubic-bezier(0.16,1,0.3,1); }
        .es17l-card:hover .es17l-media img { transform: scale(1.06); }
        .es17l-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em;
          padding: 4.5px 9px; border-radius: 6px; line-height: 1.25; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.18); }
        .es17l-stock { font-size: 12.5px; line-height: 1.4; padding: 10px 15px 0; min-height: 2.2em; }
        .es17l-priceline { display: flex; align-items: center; gap: 9px; padding: 8px 15px 15px; margin-top: auto; }
        .es17l-detail { margin-left: auto; display: inline-flex; align-items: center; background: ${GREEN}; color: #fff; font-size: 13px;
          font-weight: 700; padding: 9px 17px; border-radius: 999px; transition: background 0.15s, transform 0.14s; }
        .es17l-card:hover .es17l-detail { background: ${GREEN_DK}; transform: translateY(-1px); }

        .es17l-page { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; height: 38px; padding: 0 8px; border-radius: 999px;
          font-size: 13.5px; font-weight: 600; color: ${INK}; text-decoration: none; border: 1px solid ${LINE}; transition: background 0.13s, color 0.13s; }
        .es17l-page:hover { background: ${CREAM}; }
        .es17l-page.on { background: ${BORDO}; color: #fff; border-color: ${BORDO}; }

        .es17l-seo { max-width: 900px; margin-top: 44px; border-top: 1px solid ${LINE}; padding-top: 30px; }
        .es17l-seo h2 { font-family: ${HEAD}; font-weight: 600; font-size: clamp(20px, 1.9vw, 26px); color: ${BORDO}; margin: 0 0 12px; }
        .es17l-seo li { font-size: 14.5px; line-height: 1.65; color: ${INK}; margin-bottom: 7px; }
        .es17l-seo li strong { font-weight: 700; }

        .es17l-faq { border: 1px solid ${LINE}; border-radius: 12px; overflow: hidden; margin-top: 16px; }
        .es17l-faq-q { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; border: none; background: #fff;
          font-family: ${SANS}; font-size: 14.5px; font-weight: 700; color: ${INK}; text-align: left; padding: 15px 18px; cursor: pointer; transition: background 0.13s; }
        .es17l-faq-q:hover { background: ${CREAM}; }
        .es17l-faq-a { padding: 0 18px 16px; font-size: 14px; line-height: 1.6; color: ${INK}; }
        .es17l-faq-item + .es17l-faq-item { border-top: 1px solid ${LINE}; }

        .es17l-founder { display: flex; gap: 18px; align-items: flex-start; background: ${CREAM}; border: 1px solid ${LINE}; border-radius: 14px; padding: 20px 22px; margin-top: 26px; }
        @media (max-width: 640px) { .es17l-founder { flex-direction: column; } }
      `}</style>

      <div className="es17l-wrap">
        {/* Breadcrumb */}
        <nav className="es17l-crumb" aria-label="Drobečková navigace">
          <a href={`/demo/${tenantSlug}`}>Rozkvět</a>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
          <span style={{ color: INK, fontWeight: 500 }}>{categoryName}</span>
        </nav>

        {/* H1 + popis */}
        <h1 style={{ margin: "6px 0 0", fontFamily: HEAD, fontSize: "clamp(30px, 3vw, 42px)", fontWeight: 600, letterSpacing: "-0.01em", color: BORDO, lineHeight: 1.1 }}>{categoryName}</h1>
        <p className="es17l-desc">
          {categoryDescription ?? <>Každou kytici vážeme až <strong>na vaši objednávku</strong> ze <strong>100% čerstvých květin</strong>. Neskladujeme žádné hotové kytice — obdarovaný dostane přesně to, co vidíte. Před odesláním vám rádi zašleme <strong>fotku hotové kytice</strong> a doručujeme vlastními <strong>chlazenými vozy po celé ČR</strong>.</>}
        </p>

        {/* USP řádek */}
        <div className="es17l-usps">
          {USPS.map((u) => (
            <div key={u.title} className="es17l-usp">
              <span className="es17l-usp-ico">
                {u.icon === "bouquet" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21v-8"/><path d="M12 13c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6Z"/><path d="M12 13c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6Z"/><path d="M9 21h6"/></svg>}
                {u.icon === "camera" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5a2 2 0 0 1 2-2h2l1.5-2.5h6L16.5 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9Z"/><circle cx="12" cy="12.5" r="3.4"/></svg>}
                {u.icon === "truck" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>}
                {u.icon === "people" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c1-2.8 3-4.2 5.5-4.2S13.5 16.2 14.5 19"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M16 14.6c2.2.2 3.7 1.5 4.5 3.9"/></svg>}
              </span>
              <span><b>{u.title}</b><span>{u.sub}</span></span>
            </div>
          ))}
        </div>

        {/* Dlaždice podkategorií */}
        {tiles.length > 0 && (
          <div className="es17l-tiles">
            {tiles.map((c) => {
              const img = tileImg(c.slug, c.image_url);
              return (
                <a key={c.id} href={catHref(c.slug)} className="es17l-tile">
                  <span className="es17l-tile-img">
                    {img && <img src={img} alt={c.name} loading="lazy" />}
                  </span>
                  <span className="es17l-tile-name">{c.name}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Filtr lišta */}
        <div className="es17l-filters">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span className="es17l-flabel">Složení kytic</span>
            <span className="es17l-seg">
              <button type="button" className={composition === "vse" ? "on" : ""} onClick={() => setComposition("vse")}>Vše</button>
              <button type="button" className={composition === "jedno" ? "on" : ""} onClick={() => setComposition("jedno")}>Jednodruhové</button>
              <button type="button" className={composition === "michane" ? "on" : ""} onClick={() => setComposition("michane")}>Míchané</button>
            </span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span className="es17l-flabel">Délka</span>
            <select className="es17l-select" value={length} onChange={(e) => setLength(e.target.value)} aria-label="Délka stonku">
              <option value="vse">Vše</option>
              {lengths.map((l) => (
                <option key={l} value={l >= 70 ? "70+" : String(l)}>{l >= 70 ? "70 cm a více" : `${l} cm`}</option>
              ))}
            </select>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span className="es17l-flabel">Dostupnost</span>
            <span className="es17l-seg">
              <button type="button" className={availability === "sklad" ? "on" : ""} onClick={() => setAvailability("sklad")}>Jen skladem</button>
              <button type="button" className={availability === "vse" ? "on" : ""} onClick={() => setAvailability("vse")}>Vše</button>
            </span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <span className="es17l-flabel">Řazení</span>
            <select className="es17l-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Řazení">
              <option value="oblibenost">Dle oblíbenosti</option>
              <option value="nejlevnejsi">Od nejlevnějších</option>
              <option value="nejdrazsi">Od nejdražších</option>
              <option value="sleva">Největší sleva</option>
            </select>
          </span>
        </div>

        <div style={{ fontSize: 13.5, color: MUTED, padding: "0 0 16px" }}>{filtered.length} z {total} produktů</div>

        {/* Grid produktů — florea karta */}
        {filtered.length === 0 ? (
          <div style={{ padding: "50px 0", color: MUTED, fontSize: 15 }}>Tomuto filtru neodpovídá žádný produkt — zkuste jej uvolnit.</div>
        ) : (
          <div className="es17l-grid">
            {filtered.map((it) => {
              const sale = it.compare_at_max_cents != null && it.compare_at_max_cents > it.price_min_cents;
              const salePct = sale ? Math.round((1 - it.price_min_cents / (it.compare_at_max_cents as number)) * 100) : 0;
              const inStock = it.stock_total > 50;
              return (
                <a key={it.id} className="es17l-card" href={`${basePath}/${it.slug}`}>
                  <span className="es17l-title">{it.title}</span>
                  <span className="es17l-media">
                    {it.image_url && <img src={it.image_url} alt={it.title} loading="lazy" />}
                    {it.bulk != null && (
                      <span className="es17l-badge" style={{ position: "absolute", top: 10, right: 10, background: BORDO }}>MNOŽSTEVNÍ SLEVA {it.bulk} %</span>
                    )}
                    <span style={{ position: "absolute", right: 10, bottom: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      {it.featured && (
                        <span className="es17l-badge" style={{ background: GOLD, color: BORDO_DK }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 3.5h7.6l9.4 9.4a1.7 1.7 0 0 1 0 2.4l-5.2 5.2a1.7 1.7 0 0 1-2.4 0L3.5 11V3.5Z"/><circle cx="8" cy="8" r="1.4"/></svg>
                          TIP
                        </span>
                      )}
                      {it.free_ship && (
                        <span className="es17l-badge" style={{ background: GREEN }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>
                          DOPRAVA ZDARMA
                        </span>
                      )}
                      {sale && salePct > 0 && (
                        <span className="es17l-badge" style={{ background: BORDO_DK }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 3.5h7.6l9.4 9.4a1.7 1.7 0 0 1 0 2.4l-5.2 5.2a1.7 1.7 0 0 1-2.4 0L3.5 11V3.5Z"/><circle cx="8" cy="8" r="1.4"/></svg>
                          −{salePct} %
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="es17l-stock">
                    {it.stock_total <= 0 ? (
                      <span style={{ color: MUTED, fontWeight: 600 }}>Vyprodáno</span>
                    ) : inStock ? (
                      <span style={{ color: GREEN_DK, fontWeight: 700 }}>Skladem {it.stock_total} {it.stock_total >= 5 ? "kusů" : it.stock_total === 1 ? "kus" : "kusy"}</span>
                    ) : (
                      <>
                        <span style={{ color: GREEN_DK, fontWeight: 700 }}>{it.stock_total} {it.stock_total >= 5 ? "kusů" : it.stock_total === 1 ? "kus" : "kusy"}</span>
                        <span style={{ display: "block", color: INK, fontWeight: 600 }}>dodání od {deliveryDate}</span>
                      </>
                    )}
                  </span>
                  <span className="es17l-priceline">
                    {sale && <s style={{ color: MUTED, fontSize: 12.5, fontWeight: 500 }}>{fmt(it.compare_at_max_cents as number)}</s>}
                    <span style={{ fontSize: 16.5, fontWeight: 700, color: sale ? BORDO : INK, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{fmt(it.price_min_cents)}</span>
                    <span className="es17l-detail">Detail</span>
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {/* Stránkování */}
        {pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 34, flexWrap: "wrap" }}>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((n) => (
              <a key={n} href={pageHref(n)} className={`es17l-page${n === page ? " on" : ""}`}>{n}</a>
            ))}
            {pages > 5 && <span className="es17l-page" style={{ cursor: "default", border: "none" }}>…</span>}
            {pages > 5 && <a href={pageHref(pages)} className="es17l-page">{pages}</a>}
          </div>
        )}

        {/* SEO blok + FAQ + zakladatel */}
        <div className="es17l-seo">
          <h2>Jak vybrat — {categoryName}</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Kytice růží</strong> — jednoznačné gesto pro výročí a vyznání; čím delší stonek, tím větší květ.</li>
            <li><strong>Míchané kytice</strong> (výběr od floristy) — bohatý vzhled a jistota plné kytice v ceně, kterou si zvolíte.</li>
            <li><strong>Kytice 100+ květů</strong> — z trsových růží dělají bohatý a přirozený dojem, na které se nezapomíná.</li>
            <li><strong>Delší stonky</strong> — reprezentativní dojem ve váze; 60–70 cm je jistota pro slavnostní příležitosti.</li>
            <li><strong>Kontrastní kombinace</strong> — výrazný efekt bez složitého vybírání, floristka sladí barvy za vás.</li>
          </ul>

          <h2 style={{ marginTop: 30 }}>Časté dotazy (FAQ) k výběru</h2>
          <div className="es17l-faq">
            {FAQ.map((f, i) => (
              <div key={i} className="es17l-faq-item">
                <button type="button" className="es17l-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}>
                  {f.q}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={BORDO} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: faqOpen === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {faqOpen === i && <div className="es17l-faq-a">{f.a}</div>}
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: 30 }}>Kdo stojí za výběrem těchto květin</h2>
          <div className="es17l-founder">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&auto=format&q=75"
              alt="Jiří Klas" loading="lazy"
              style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "3px solid #fff", boxShadow: `0 0 0 1px ${LINE}` }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: INK }}>
                Jiří Klas — zakladatel Rozkvětu a hlavní nákupčí květin <span style={{ fontWeight: 500, color: MUTED }}>(25+ let osobní praxe)</span>
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.6, color: INK }}>
                Více než <strong>25 let osobně nakupuje růže na holandských květinových burzách</strong> a přímo ve sklenících u pěstitelů.
                Každá doporučená odrůda je výsledkem <strong>dlouhodobé praxe, testování výdrže a zpětné vazby od zákazníků</strong>.
                Vybrané odrůdy dlouhodobě patří mezi ty se <strong>stabilní výdrží a velmi hezkým efektem po doručení</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
