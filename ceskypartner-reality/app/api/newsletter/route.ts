import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/apiAuth";
import { checkSpam } from "@/lib/antispam";
import { sendMailSafe, emailLayout } from "@/lib/mailer";
import { unsubscribeFooterHtml } from "@/lib/unsubscribe";

/** Přihlášení k newsletteru — ukládá se jako Contact se zdrojem NEWSLETTER. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const spam = checkSpam(req, body);
  if (spam) return jsonError(spam, 429);

  const email = String(body.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Zadejte platný e-mail");
  }

  // Duplicitní přihlášení tiše projde — klient nemusí vědět, kdo je v databázi
  const existing = await prisma.contact.findFirst({
    where: { email, source: "NEWSLETTER" },
    select: { id: true },
  });
  if (!existing) {
    const created = await prisma.contact.create({
      data: {
        name: email,
        email,
        message: "Přihlášení k odběru newsletteru z webu",
        source: "NEWSLETTER",
      },
    });
    sendMailSafe({
      to: email,
      subject: "Vítejte v newsletteru — Český Partner",
      text: "Dobrý den,\n\nod teď vám jednou týdně pošleme výběr nejlepších nemovitostí a dění na trhu. Žádný spam.\n\nČeský Partner",
      html: emailLayout("Vítejte v našem newsletteru", `
        <p>Dobrý den,</p>
        <p>od teď vám jednou týdně pošleme výběr nejlepších nemovitostí z naší nabídky a krátké shrnutí dění na trhu. Žádný spam — slibujeme.</p>
        <p style="font-size:12px;color:#6E6A63;">Odhlásit se můžete kdykoli — odkaz najdete v patičce každého e-mailu.</p>
        ${unsubscribeFooterHtml("newsletter", created.id)}
      `),
    });
  }

  return jsonOk({ success: true }, 201);
}
