import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Podmínky použití",
  description: "Obchodní podmínky služby Fakturina — pravidla užívání, platby a odpovědnost.",
  alternates: { canonical: "/podminky" },
};

export default function TermsPage() {
  return <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
    <Link href="/">← Fakturina</Link><h1>Podmínky použití</h1><p>Aktualizováno 13. 7. 2026.</p>
    <h2>Služba</h2><p>Fakturina je nástroj pro tvorbu a správu dokladů. Uživatel odpovídá za správnost účetních, daňových a kontaktních údajů a za zákonné použití služby.</p>
    <h2>Účet a bezpečnost</h2><p>Uživatel chrání přístupové údaje a bezodkladně hlásí podezření na zneužití. Zakázáno je narušovat službu, obcházet limity nebo rozesílat nevyžádanou poštu.</p>
    <h2>Tarify a platby</h2><p>Rozsah funkcí se řídí zvoleným tarifem. Předplatné a daňové doklady za službu zpracovává Stripe; změny a ukončení jsou dostupné v zákaznickém portálu.</p>
    <h2>Dostupnost a odpovědnost</h2><p>Službu průběžně udržujeme, nelze však zaručit nepřetržitou dostupnost. Před důležitým podáním doporučujeme doklady exportovat a ověřit.</p>
    <h2>Kontakt</h2><p><a href="mailto:support@fakturina.cz">support@fakturina.cz</a></p>
  </main>;
}
