import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { SaasLanding } from "@/components/SaasLanding";

export default function Home() {
  return (
    <>
      <PlatformHeader />
      <main>
        <SaasLanding />
      </main>
      <PlatformFooter />
    </>
  );
}
