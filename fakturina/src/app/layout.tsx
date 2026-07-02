import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fakturina.cz — Chytrá česká fakturace",
  description: "Vystavujte profesionální české faktury, posílejte online upomínky a mějte platby pod kontrolou.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
