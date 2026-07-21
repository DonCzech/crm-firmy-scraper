import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/apiAuth";
import { sendMailSafe, emailLayout } from "@/lib/mailer";
import { getSetting } from "@/lib/settings";
import { checkSpam } from "@/lib/antispam";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const spam = checkSpam(req, body);
  if (spam) return jsonError(spam, 429);
  const { name, email, phone, message, listingId } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return jsonError("Chybí povinné pole: jméno, e-mail, zpráva");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return jsonError("Neplatný e-mail");
  }

  // listingId ověřit — z veřejného webu nesmí projít neexistující reference
  const listing = listingId
    ? await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, title: true, slug: true, agent: { select: { name: true, email: true } } },
      })
    : null;

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message.trim(),
      source: "FORM",
      listingId: listing?.id || null,
    },
  });

  // Notifikace makléři (nebo kanceláři) + potvrzení klientovi.
  // Fire-and-forget — poptávka je uložená, e-mail nesmí blokovat odpověď.
  const companyEmail = await getSetting("company_email");
  const notifyTo = listing?.agent?.email || companyEmail;
  const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const detailUrl = listing ? `https://ceskypartner.cz/nemovitost/${listing.slug}` : null;

  const tasks: Promise<boolean>[] = [];
  if (notifyTo) {
    tasks.push(sendMailSafe({
      to: notifyTo,
      replyTo: email.trim(),
      subject: listing ? `Nová poptávka — ${listing.title}` : "Nová poptávka z webu",
      text: `Jméno: ${name}\nE-mail: ${email}\nTelefon: ${phone || "—"}\n\n${message}${detailUrl ? `\n\nInzerát: ${detailUrl}` : ""}`,
      html: emailLayout(listing ? `Nová poptávka — ${esc(listing.title)}` : "Nová poptávka z webu", `
        <p><strong>Jméno:</strong> ${esc(name)}<br>
        <strong>E-mail:</strong> ${esc(email)}<br>
        <strong>Telefon:</strong> ${esc(phone || "—")}</p>
        <p style="white-space:pre-line;border-left:3px solid #A9885A;padding-left:14px;">${esc(message)}</p>
        ${detailUrl ? `<p><a href="${detailUrl}" style="color:#8A6D43;">Zobrazit inzerát</a></p>` : ""}
        <p style="font-size:12px;color:#6E6A63;">Poptávka je uložená v administraci → Poptávky.</p>
      `),
    }));
  }
  tasks.push(sendMailSafe({
    to: email.trim(),
    subject: "Přijali jsme vaši poptávku — Český Partner",
    text: `Dobrý den, ${name},\n\nděkujeme za váš zájem${listing ? ` o nemovitost ${listing.title}` : ""}. Ozveme se vám do 24 hodin.\n\nČeský Partner — realitní kancelář`,
    html: emailLayout("Děkujeme za vaši poptávku", `
      <p>Dobrý den, ${esc(name)},</p>
      <p>děkujeme za váš zájem${listing ? ` o nemovitost <strong>${esc(listing.title)}</strong>` : ""}.
      ${listing?.agent?.name ? `Váš požadavek převzal/a makléř/ka <strong>${esc(listing.agent.name)}</strong>, ozveme se vám do 24 hodin.` : "Ozveme se vám do 24 hodin."}</p>
      ${detailUrl ? `<p><a href="${detailUrl}" style="color:#8A6D43;">Zobrazit inzerát</a></p>` : ""}
    `),
  }));
  Promise.allSettled(tasks);

  return jsonOk({ success: true, id: contact.id }, 201);
}
