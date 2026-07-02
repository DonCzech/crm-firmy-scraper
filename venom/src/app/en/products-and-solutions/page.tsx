import type { Metadata } from "next";
import { ProductsPageContent } from "@/app/produkty-a-reseni/ProductsPageContent";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

export const metadata: Metadata = {
  title: "Products and solutions - Webero",
  description: "Four products, one platform. Websites, landing pages, e-shop, and content hub at a high standard without developers.",
  alternates: {
    canonical: `${BASE}/en/products-and-solutions`,
    languages: {
      cs: `${BASE}/produkty-a-reseni`,
      en: `${BASE}/en/products-and-solutions`,
    },
  },
};

export default function EnglishProductsPage() {
  return <ProductsPageContent locale="en" />;
}
