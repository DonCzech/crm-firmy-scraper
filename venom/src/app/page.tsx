import { PlatformHomePage } from "@/components/PlatformHomePage";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <PlatformHomePage locale="en" />;
}
