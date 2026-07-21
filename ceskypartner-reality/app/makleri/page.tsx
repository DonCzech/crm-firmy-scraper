import type { Metadata } from "next";
import AgentsPageContent from "@/components/AgentsPageContent";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Naši makléři",
  description: "Poznejte tým realitní kanceláře Český Partner — makléře, kteří znají každou nemovitost ve své nabídce osobně.",
  alternates: { canonical: "/makleri", languages: { "cs-CZ": "/makleri", "en-GB": "/en/agents", "x-default": "/makleri" } },
};

export default function AgentsPage() {
  return <AgentsPageContent />;
}
