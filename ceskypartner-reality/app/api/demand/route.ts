import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError } from "@/lib/apiAuth";
import { sendMailSafe, emailLayout } from "@/lib/mailer";
import { getSetting } from "@/lib/settings";
import { checkSpam } from "@/lib/antispam";
import { unsubscribeFooterHtml } from "@/lib/unsubscribe";
import type { DealType, PropertyKind } from "@prisma/client";

const DEALS: DealType[] = ["SALE", "RENT", "INVESTMENT"];
const KINDS: PropertyKind[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL"];

const DEAL_LABEL: Record<string, string> = { SALE: "Prodej", RENT: "Pronájem", INVESTMENT: "Investice" };
const KIND_LABEL: Record<string, string> = { APARTMENT: "Byt", HOUSE: "Dům", LAND: "Pozemek", COMMERCIAL: "Komerční" };

/** Hlídací pes — veřejná poptávka „hlídejte mi nemovitost podle kritérií". */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const spam = checkSpam(req, body);
  if (spam) return jsonError(spam, 429);
  const { name, email, phone, note, deal, kind, region, priceMax, disposition } = body;

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Zadejte platný e-mail");
  }
  const dealValue: DealType = DEALS.includes(deal) ? deal : "SALE";
  const kindValue: PropertyKind | null = KINDS.includes(kind) ? kind : null;
  const priceMaxValue = Number(priceMax) > 0 ? Math.round(Number(priceMax)) : null;

  const person = await prisma.person.create({
    data: {
      name: name?.trim() || email.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      type: "PROSPECT",
      gdprConsent: true,
      gdprConsentAt: new Date(),
      note: "Hlídací pes z webu",
    },
  });

  const titleParts = [
    DEAL_LABEL[dealValue],
    kindValue ? KIND_LABEL[kindValue] : null,
    disposition || null,
    region || null,
    priceMaxValue ? `do ${priceMaxValue.toLocaleString("cs-CZ")} Kč` : null,
  ].filter(Boolean);

  const demand = await prisma.demand.create({
    data: {
      title: `Hlídací pes — ${titleParts.join(", ")}`,
      deal: dealValue,
      kind: kindValue,
      region: region?.trim() || null,
      dispositions: disposition ? [String(disposition)] : [],
      priceMax: priceMaxValue,
      note: note?.trim() || null,
      status: "ACTIVE",
      personId: person.id,
    },
  });

  const companyEmail = await getSetting("company_email");
  const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const tasks: Promise<boolean>[] = [];
  if (companyEmail) {
    tasks.push(sendMailSafe({
      to: companyEmail,
      replyTo: email.trim(),
      subject: `Nový hlídací pes — ${titleParts.join(", ")}`,
      text: `Kontakt: ${name || "—"} · ${email} · ${phone || "—"}\nKritéria: ${titleParts.join(", ")}\nPoznámka: ${note || "—"}`,
      html: emailLayout("Nový hlídací pes", `
        <p><strong>Kontakt:</strong> ${esc(name || "—")} · ${esc(email)} · ${esc(phone || "—")}</p>
        <p><strong>Kritéria:</strong> ${esc(titleParts.join(", "))}</p>
        ${note ? `<p style="white-space:pre-line;border-left:3px solid #A9885A;padding-left:14px;">${esc(note)}</p>` : ""}
        <p style="font-size:12px;color:#6E6A63;">Uloženo v administraci → Obecné poptávky.</p>
      `),
    }));
  }
  tasks.push(sendMailSafe({
    to: email.trim(),
    subject: "Hlídací pes je aktivní — Český Partner",
    text: `Dobrý den,\n\nvaše kritéria (${titleParts.join(", ")}) hlídáme. Jakmile se objeví odpovídající nemovitost, ozveme se vám jako prvnímu.\n\nČeský Partner`,
    html: emailLayout("Váš hlídací pes je aktivní", `
      <p>Dobrý den,</p>
      <p>hlídáme pro vás: <strong>${esc(titleParts.join(", "))}</strong>.</p>
      <p>Jakmile se v naší nabídce objeví odpovídající nemovitost, ozveme se vám jako prvnímu — často ještě před zveřejněním na portálech.</p>
      ${unsubscribeFooterHtml("pes", demand.id)}
    `),
  }));
  Promise.allSettled(tasks);

  return jsonOk({ success: true, id: demand.id }, 201);
}
