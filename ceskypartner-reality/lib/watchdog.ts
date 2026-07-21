import { prisma } from "./prisma";
import { sendMailSafe, emailLayout } from "./mailer";
import { getSetting } from "./settings";
import { unsubscribeFooterHtml } from "./unsubscribe";

const DEAL_LABEL: Record<string, string> = { SALE: "Prodej", RENT: "Pronájem", INVESTMENT: "Investice" };

/**
 * Hlídací pes — po publikaci inzerátu (status → ACTIVE) najde aktivní poptávky,
 * které inzerátu odpovídají, pošle klientům avízo a kanceláři přehled.
 * Fire-and-forget: nesmí zdržet ani shodit uložení inzerátu.
 */
export async function notifyMatchingDemands(listingId: string): Promise<void> {
  try {
    const l = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true, title: true, slug: true, deal: true, kind: true, region: true,
        disposition: true, price: true, location: true, status: true,
        agent: { select: { name: true, email: true } },
      },
    });
    if (!l || l.status !== "ACTIVE") return;

    const demands = await prisma.demand.findMany({
      where: {
        status: "ACTIVE",
        deal: l.deal,
        OR: [{ kind: null }, { kind: l.kind }],
        AND: [
          // Kraj se porovnává jen když ho inzerát má; poptávky bez kraje berou vše
          ...(l.region ? [{ OR: [{ region: null }, { region: l.region }] }] : []),
          { OR: [{ priceMax: null }, { priceMax: { gte: l.price } }] },
          { OR: [{ priceMin: null }, { priceMin: { lte: l.price } }] },
        ],
      },
      include: { person: { select: { name: true, email: true } } },
      take: 100,
    });

    const matches = demands.filter(
      (d) => d.dispositions.length === 0 || (l.disposition && d.dispositions.includes(l.disposition))
    );
    if (matches.length === 0) return;

    const esc = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const url = `https://ceskypartner.cz/nemovitost/${l.slug}`;
    const priceFmt = `${l.price.toLocaleString("cs-CZ")} Kč${l.deal === "RENT" ? " / měsíc" : ""}`;

    const tasks: Promise<boolean>[] = [];

    // Avízo klientům s hlídacím psem
    for (const d of matches) {
      const email = d.person?.email;
      if (!email) continue;
      tasks.push(sendMailSafe({
        to: email,
        subject: `Nová nemovitost podle vašich kritérií — ${l.title}`,
        text: `Dobrý den,\n\nprávě jsme zařadili nemovitost odpovídající vašemu hlídacímu psovi:\n\n${l.title}\n${l.location}\n${DEAL_LABEL[l.deal] || l.deal} · ${priceFmt}\n\n${url}\n\nČeský Partner`,
        html: emailLayout("Máme pro vás novou nemovitost", `
          <p>Dobrý den,</p>
          <p>právě jsme do nabídky zařadili nemovitost, která odpovídá vašemu hlídacímu psovi:</p>
          <p style="border-left:3px solid #A9885A;padding-left:14px;">
            <strong>${esc(l.title)}</strong><br>
            ${esc(l.location)}<br>
            ${DEAL_LABEL[l.deal] || l.deal} · <strong>${priceFmt}</strong>
          </p>
          <p><a href="${url}" style="display:inline-block;background:#14181A;color:#FAF9F6;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Zobrazit nemovitost</a></p>
          <p style="font-size:12px;color:#6E6A63;">Dostáváte to jako první — inzerát teprve míří na realitní portály.</p>
          ${unsubscribeFooterHtml("pes", d.id)}
        `),
      }));
    }

    // Přehled makléři / kanceláři
    const notifyTo = l.agent?.email || (await getSetting("company_email"));
    if (notifyTo) {
      const rows = matches
        .map((d) => `<li>${esc(d.person?.name || "—")} · ${esc(d.person?.email || "—")} — ${esc(d.title)}</li>`)
        .join("");
      tasks.push(sendMailSafe({
        to: notifyTo,
        subject: `Hlídací pes: ${matches.length} čekajících zájemců — ${l.title}`,
        text: `Inzerát ${l.title} odpovídá ${matches.length} aktivním poptávkám. Detail v administraci → Obecné poptávky.`,
        html: emailLayout(`${matches.length} čekajících zájemců`, `
          <p>Nově publikovaný inzerát <strong>${esc(l.title)}</strong> odpovídá těmto aktivním poptávkám:</p>
          <ul>${rows}</ul>
          <p style="font-size:12px;color:#6E6A63;">Klienti dostali avízo e-mailem. Kontakty najdete v administraci → Obecné poptávky.</p>
        `),
      }));
    }

    await Promise.allSettled(tasks);
  } catch (e: any) {
    console.error("notifyMatchingDemands:", e.message);
  }
}
