import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { SaasLanding } from "@/components/SaasLanding";
import { LiveTemplatesCatalog } from "@/components/LiveTemplatesCatalog";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <PlatformHeader />
      <main>
        <SaasLanding />
        {/* Live catalog of approved templates from review queue.
            Renders only when at least one template has review_status='approved'. */}
        <LiveTemplatesCatalog heading="Aktuální šablony" limit={8} compact />
      </main>
      <PlatformFooter />
    </>
  );
}
