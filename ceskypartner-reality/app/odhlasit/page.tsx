import type { Metadata } from "next";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken, type UnsubscribeType } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Odhlášení z odběru",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: { typ?: string; id?: string; t?: string };
};

async function performUnsubscribe(type: UnsubscribeType, id: string): Promise<boolean> {
  try {
    if (type === "pes") {
      await prisma.demand.update({ where: { id }, data: { status: "CLOSED" } });
      return true;
    }
    if (type === "newsletter") {
      await prisma.contact.update({ where: { id }, data: { status: "ARCHIVED" } });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { typ, id, t } = searchParams;
  const type = (typ === "pes" || typ === "newsletter" ? typ : null) as UnsubscribeType | null;
  const valid = Boolean(type && id && t && verifyUnsubscribeToken(type!, id!, t!));
  const done = valid ? await performUnsubscribe(type!, id!) : false;

  return (
    <>
      <Header variant="solid" />
      <main className="flex min-h-[70vh] items-center pt-16">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-24 text-center">
          {done ? (
            <>
              <CheckCircle2 size={44} strokeWidth={1.2} className="text-bronze" />
              <h1 className="mt-6 text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
                {type === "pes" ? "Hlídací pes byl zrušen" : "Jste odhlášeni z odběru"}
              </h1>
              <p className="mt-4 text-[15px] leading-[1.75] text-muted">
                Už vám nebudeme posílat žádné další e-maily. Kdykoli se můžete
                znovu přihlásit přímo na našem webu.
              </p>
            </>
          ) : (
            <>
              <TriangleAlert size={44} strokeWidth={1.2} className="text-bronze" />
              <h1 className="mt-6 text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
                Odkaz není platný
              </h1>
              <p className="mt-4 text-[15px] leading-[1.75] text-muted">
                Odhlašovací odkaz je poškozený nebo už byl použit. Pokud si přejete
                zrušit odběr, napište nám na info@ceskypartner.cz — vyřídíme to ručně.
              </p>
            </>
          )}
          <a
            href="/"
            className="mt-10 border border-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            Zpět na úvod
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
