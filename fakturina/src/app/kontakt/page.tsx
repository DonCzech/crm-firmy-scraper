import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktujte tým Fakturina — technická podpora a dotazy k fakturaci.",
  alternates: { canonical: "/kontakt" },
  openGraph: { title: "Kontakt | Fakturina", description: "Kontaktujte tým Fakturina.", url: "/kontakt" },
};

export default function ContactPage() {
  return <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
    <Link href="/">← Fakturina</Link><h1>Kontakt</h1>
    <p>Technická podpora a požadavky k osobním údajům: <a href="mailto:support@fakturina.cz">support@fakturina.cz</a>.</p>
    <p>Identifikační a sídelní údaje provozovatele musí být doplněny před veřejným spuštěním služby.</p>
  </main>;
}
