import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ochrana soukromí",
  description: "Zásady zpracování osobních údajů služby Fakturina — jaká data zpracováváme a jak je chráníme.",
  alternates: { canonical: "/ochrana-soukromi" },
};

export default function PrivacyPage() {
  return <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
    <Link href="/">← Fakturina</Link><h1>Ochrana soukromí</h1>
    <p>Aktualizováno 13. 7. 2026.</p>
    <h2>Jaká data zpracováváme</h2><p>Údaje účtu, firemní a fakturační údaje, klienty, doklady, provozní logy a údaje nezbytné pro platby, e-mailing a bankovní párování.</p>
    <h2>Účel a právní základ</h2><p>Data zpracováváme pro poskytování služby, plnění smlouvy, zabezpečení, plnění právních povinností a oprávněný zájem na spolehlivém provozu.</p>
    <h2>Zpracovatelé</h2><p>Infrastrukturu mohou zajišťovat Vercel, Neon, Stripe a Resend. Bankovní data jsou načítána jen po výslovném připojení uživatelem.</p>
    <h2>Uchování a práva</h2><p>Data uchováváme po dobu účtu a zákonných archivačních lhůt. Máte právo na přístup, opravu, export, omezení a výmaz, pokud tomu nebrání zákonná povinnost.</p>
    <h2>Kontakt</h2><p>Žádosti posílejte na <a href="mailto:support@fakturina.cz">support@fakturina.cz</a>.</p>
  </main>;
}
