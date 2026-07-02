import type { Metadata } from "next";
import { ProductsPageContent } from "./ProductsPageContent";

export const metadata: Metadata = {
  title: "Produkty a řešení — Webero",
  description:
    "Čtyři produkty, jedna platforma. Webové stránky, landing pages, e-shop a content hub na vysokém standardu, bez vývojářů.",
};

export default function ProductsPage() {
  return <ProductsPageContent locale="cs" />;
}
