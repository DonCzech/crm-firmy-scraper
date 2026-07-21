import type { Metadata } from "next";
import AgentDetailContent from "@/components/AgentDetailContent";
import { getAgentWithListings } from "@/lib/queries";

export const revalidate = 300;
type PageProps = { params: { id: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getAgentWithListings(params.id).catch(() => null);
  if (!data) return {};
  return {
    title: `${data.agent.name} — realitní makléř`,
    description: data.agent.bio?.slice(0, 160) || `${data.agent.name}, realitní makléř kanceláře Český Partner. ${data.agent.activeCount} aktivních nabídek.`,
    alternates: {
      canonical: `/makleri/${params.id}`,
      languages: { "cs-CZ": `/makleri/${params.id}`, "en-GB": `/en/agents/${params.id}`, "x-default": `/makleri/${params.id}` },
    },
    ...(data.agent.avatar ? { openGraph: { images: [{ url: data.agent.avatar }] } } : {}),
  };
}

export default function AgentDetailPage({ params }: PageProps) {
  return <AgentDetailContent id={params.id} />;
}
