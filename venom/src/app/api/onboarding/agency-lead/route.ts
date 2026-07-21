import { NextRequest } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/demo-auth";
import { query, initDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const BodySchema = z.object({
  projectType: z.string().trim().min(1).max(60),
  goal: z.string().trim().min(10, "Popište cíl projektu alespoň pár větami.").max(4000),
  inspiration: z.string().trim().max(2000).optional(),
  currentWeb: z.string().trim().max(300).optional(),
  budget: z.string().trim().min(1).max(60),
  timeline: z.string().trim().max(60).optional(),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email("Neplatný e-mail"),
  phone: z.string().trim().max(30).optional(),
  locale: z.enum(["cs", "en"]).default("cs"),
});

// Per-IP rate limit (max 5 poptávek za hodinu)
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Příliš mnoho poptávek. Zkuste to znovu později." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 400 });
  }

  const d = parsed.data;

  try {
    await initDb();
    const rows = await query<{ id: number }>(
      `INSERT INTO agency_leads
         (project_type, goal, inspiration, current_web, budget, timeline, name, company, email, phone, locale, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id`,
      [d.projectType, d.goal, d.inspiration ?? null, d.currentWeb ?? null, d.budget,
       d.timeline ?? null, d.name, d.company ?? null, d.email, d.phone ?? null, d.locale, ip]
    );
    const leadId = rows[0]?.id;

    // Interní notifikace (fire-and-forget; bez env se jen zaloguje)
    const notifyTo = process.env.AGENCY_LEADS_EMAIL;
    if (notifyTo) {
      const html = `
        <h2>Nová poptávka #${leadId} — Uděláme to za vás</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td><b>Typ projektu</b></td><td>${esc(d.projectType)}</td></tr>
          <tr><td><b>Cíl</b></td><td>${esc(d.goal)}</td></tr>
          <tr><td><b>Inspirace</b></td><td>${esc(d.inspiration ?? "—")}</td></tr>
          <tr><td><b>Stávající web</b></td><td>${esc(d.currentWeb ?? "—")}</td></tr>
          <tr><td><b>Rozpočet</b></td><td>${esc(d.budget)}</td></tr>
          <tr><td><b>Termín</b></td><td>${esc(d.timeline ?? "—")}</td></tr>
          <tr><td><b>Jméno</b></td><td>${esc(d.name)}</td></tr>
          <tr><td><b>Firma</b></td><td>${esc(d.company ?? "—")}</td></tr>
          <tr><td><b>E-mail</b></td><td>${esc(d.email)}</td></tr>
          <tr><td><b>Telefon</b></td><td>${esc(d.phone ?? "—")}</td></tr>
        </table>`;
      sendEmail({ to: notifyTo, subject: `Webero poptávka #${leadId}: ${d.projectType} (${d.budget})`, html })
        .catch((e) => console.error("[agency-lead] notify email failed:", e));
    }

    return Response.json({ ok: true, id: leadId }, { status: 201 });
  } catch (err) {
    console.error("[agency-lead] insert failed:", err);
    return Response.json({ error: "Poptávku se nepodařilo odeslat. Zkuste to znovu." }, { status: 500 });
  }
}
