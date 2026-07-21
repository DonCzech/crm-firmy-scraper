import type { Metadata } from "next";
import AgentsPageContent from "@/components/AgentsPageContent";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Our real estate agents",
  description: "Meet the English-speaking Český Partner team — experienced agents with first-hand knowledge of every property they represent.",
  alternates: { canonical: "/en/agents", languages: { "en-GB": "/en/agents", "cs-CZ": "/makleri", "x-default": "/makleri" } },
  openGraph: { locale: "en_GB", alternateLocale: ["cs_CZ"] },
};

export default function EnglishAgentsPage() {
  return <AgentsPageContent locale="en" />;
}
