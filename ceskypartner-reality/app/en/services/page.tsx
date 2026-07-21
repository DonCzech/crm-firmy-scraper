import type { Metadata } from "next";
import ServicesPageContent from "@/components/ServicesPageContent";

export const metadata: Metadata = {
  title: "Real estate services",
  description: "Property sales, lettings, management, investment advisory and coordinated legal support in the Czech Republic.",
  alternates: { canonical: "/en/services", languages: { "en-GB": "/en/services", "cs-CZ": "/sluzby", "x-default": "/sluzby" } },
  openGraph: { locale: "en_GB", alternateLocale: ["cs_CZ"] },
};
export default function EnglishServicesPage() { return <ServicesPageContent locale="en" />; }
