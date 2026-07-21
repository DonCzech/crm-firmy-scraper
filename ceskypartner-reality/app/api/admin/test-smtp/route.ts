import { prisma } from "@/lib/prisma";
import { requireAuth, jsonOk, jsonError } from "@/lib/apiAuth";
import { createTransport } from "nodemailer";

export async function POST() {
  const { error, session } = await requireAuth("ADMIN");
  if (error) return error;

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "company_email"] } },
  });
  const cfg: Record<string, string> = {};
  settings.forEach((s) => { cfg[s.key] = s.value; });

  if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
    return jsonError("SMTP neni nakonfigurovan — vyplnte host, uzivatele a heslo");
  }

  try {
    const transport = createTransport({
      host: cfg.smtp_host,
      port: Number(cfg.smtp_port || 587),
      secure: Number(cfg.smtp_port || 587) === 465,
      auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
    });

    const to = (session!.user as any).email || cfg.company_email || cfg.smtp_user;

    await transport.sendMail({
      from: cfg.smtp_user,
      to,
      subject: "Cesky Partner — Test SMTP",
      text: "Tento e-mail potvrzuje, ze SMTP konfigurace funguje spravne.",
      html: "<h2>Test SMTP</h2><p>Tento e-mail potvrzuje, ze SMTP konfigurace funguje spravne.</p>",
    });

    return jsonOk({ sent: true, to });
  } catch (e: any) {
    return jsonError(`SMTP chyba: ${e.message}`);
  }
}
