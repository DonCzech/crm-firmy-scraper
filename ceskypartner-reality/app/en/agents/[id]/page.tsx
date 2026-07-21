import type { Metadata } from "next";
import AgentDetailContent from "@/components/AgentDetailContent";
import { getAgentWithListings } from "@/lib/queries";

export const revalidate = 300;
type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getAgentWithListings(params.id).catch(() => null);
  if (!data) return {};
  const enPath = `/en/agents/${params.id}`;
  const csPath = `/makleri/${params.id}`;
  return {
    title: `${data.agent.name} — Real Estate Agent`,
    description: `${data.agent.name} is an English-speaking real estate agent at Český Partner in the Czech Republic.`,
    alternates: { canonical: enPath, languages: { "en-GB": enPath, "cs-CZ": csPath, "x-default": csPath } },
    openGraph: { locale: "en_GB", alternateLocale: ["cs_CZ"], ...(data.agent.avatar ? { images: [{ url: data.agent.avatar }] } : {}) },
  };
}

export default function EnglishAgentPage({ params }: PageProps) {
  return <AgentDetailContent id={params.id} locale="en" />;
}
