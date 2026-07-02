import type { Metadata } from "next";
import { PickDesignPageContent } from "./PickDesignPageContent";

export const metadata: Metadata = {
  title: "Vybrat design — Webero",
  description:
    "Kompletní katalog šablon. Začněte konceptem webu místo prázdné stránky — 99+ designů pro každý obor, plně editovatelné.",
};

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default async function PickDesignPage() {
  return <PickDesignPageContent locale="cs" />;
}
