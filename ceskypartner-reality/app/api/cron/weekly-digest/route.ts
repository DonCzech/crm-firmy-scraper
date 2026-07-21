import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/apiAuth";
import { sendMailSafe, emailLayout } from "@/lib/mailer";
import { unsubscribeFooterHtml } from "@/lib/unsubscribe";
import { absoluteUrl } from "@/lib/seo";

export const maxDuration = 300;

const DEAL_LABEL: Record<string, string> = { SALE: "Prodej", RENT: "Pronájem", INVESTMENT: "Investice" };

const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

function listingRowHtml(l: {
  title: string; slug: string; location: string; deal: string; price: number;
  image: string | null;
}): string {
  const price = `${l.price.toLocaleString("cs-CZ")} Kč${l.deal === "RENT" ? " / měsíc" : ""}`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;"><tr>
    ${l.image ? `<td width="120" valign="top"><a href="${absoluteUrl(`/nemovitost/${l.slug}`)}"><img src="${l.image}" width="120" height="80" alt="" style="display:block;object-fit:cover;border:0;"/></a></td>` : ""}
    <td valign="top" style="padding-left:14px;">
      <a href="${absoluteUrl(`/nemovitost/${l.slug}`)}" style="color:#14181A;font-size:14px;font-weight:600;text-decoration:none;">${esc(l.title)}</a><br>
      <span style="font-size:12px;color:#6E6A63;">${esc(l.location)} · ${DEAL_LABEL[l.deal] || l.deal}</span><br>
      <span style="font-size:13px;font-weight:600;color:#8A6D43;">${price}</span>
    </td>
  </tr></table>`;
}

/**
 * Týdenní digest — cron (doporučeno 1× týdně): GET /api/cron/weekly-digest?secret=CRON_SECRET
 * 1) odběratelům newsletteru pošle výběr nemovitostí zařazených za posledních 7 dní,
 * 2) aktivním hlídacím psům pošle jen nemovitosti odpovídající jejich kritériím.
 */
export async function GET(req: NextRequest) {
  // Secret v query (?secret=) nebo v hlavičce Authorization: Bearer — Vercel cron
  // posílá Bearer automaticky, když existuje env proměnná CRON_SECRET
  const secret = process.env.CRON_SECRET;
  const provided = req.nextUrl.searchParams.get("secret")
    || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || provided !== secret) {
    return jsonError("Neplatný nebo chybějící CRON_SECRET", 401);
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.listing.findMany({
    where: { status: "ACTIVE", publishedAt: { gte: since } },
    select: {
      id: true, title: true, slug: true, location: true, deal: true, kind: true,
      region: true, disposition: true, price: true,
      images: { select: { url: true }, orderBy: { order: "asc" as const }, take: 1 },
    },
    orderBy: { publishedAt: "desc" },
  });
  const fresh = rows.map((r) => ({ ...r, image: r.images[0]?.url || null }));

  if (fresh.length === 0) {
    return jsonOk({ sent: 0, message: "Žádné nové nemovitosti za posledních 7 dní." });
  }

  let sent = 0;

  // 1) Newsletter odběratelé — top 8 novinek
  const subscribers = await prisma.contact.findMany({
    where: { source: "NEWSLETTER", status: { not: "ARCHIVED" } },
    select: { id: true, email: true },
    distinct: ["email"],
  });
  const digestHtml = fresh.slice(0, 8).map(listingRowHtml).join("");
  for (const sub of subscribers) {
    const ok = await sendMailSafe({
      to: sub.email,
      subject: `${fresh.length} nových nemovitostí tento týden — Český Partner`,
      text: `Nové nemovitosti tohoto týdne:\n\n${fresh.slice(0, 8).map((l) => `${l.title} — ${l.location} — ${absoluteUrl(`/nemovitost/${l.slug}`)}`).join("\n")}`,
      html: emailLayout("Nové nemovitosti tohoto týdne", `
        <p>Dobrý den,</p>
        <p>tady je výběr nemovitostí, které jsme tento týden zařadili do nabídky:</p>
        ${digestHtml}
        <p><a href="${absoluteUrl("/nabidka/prodej")}" style="display:inline-block;background:#14181A;color:#FAF9F6;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Celá nabídka</a></p>
        ${unsubscribeFooterHtml("newsletter", sub.id)}
      `),
    });
    if (ok) sent++;
  }

  // 2) Hlídací psi — jen odpovídající nemovitosti
  const demands = await prisma.demand.findMany({
    where: { status: "ACTIVE" },
    include: { person: { select: { email: true } } },
    take: 500,
  });
  for (const d of demands) {
    const email = d.person?.email;
    if (!email) continue;
    const matches = fresh.filter((l) =>
      l.deal === d.deal &&
      (!d.kind || d.kind === l.kind) &&
      (!d.region || !l.region || d.region === l.region) &&
      (d.priceMax == null || l.price <= d.priceMax) &&
      (d.priceMin == null || l.price >= d.priceMin) &&
      (d.dispositions.length === 0 || (l.disposition && d.dispositions.includes(l.disposition)))
    );
    if (matches.length === 0) continue;
    const ok = await sendMailSafe({
      to: email,
      subject: `${matches.length === 1 ? "Nová nemovitost" : `${matches.length} nové nemovitosti`} podle vašich kritérií`,
      text: matches.map((l) => `${l.title} — ${l.location} — ${absoluteUrl(`/nemovitost/${l.slug}`)}`).join("\n"),
      html: emailLayout("Novinky podle vašeho hlídacího psa", `
        <p>Dobrý den,</p>
        <p>za poslední týden jsme zařadili ${matches.length === 1 ? "nemovitost odpovídající" : "nemovitosti odpovídající"} vašim kritériím:</p>
        ${matches.slice(0, 6).map(listingRowHtml).join("")}
        ${unsubscribeFooterHtml("pes", d.id)}
      `),
    });
    if (ok) sent++;
  }

  return jsonOk({ newListings: fresh.length, subscribers: subscribers.length, demands: demands.length, sent });
}
