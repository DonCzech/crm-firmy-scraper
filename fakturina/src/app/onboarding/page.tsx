export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { initDb } from "@/lib/db";
import OnboardingWizard from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  await initDb();
  const user = await getSession();
  if (!user) redirect("/login");

  const company = await getUserCompany(user.id);
  if (company?.onboarded) redirect("/dashboard");

  return <OnboardingWizard userName={user.name} existingCompany={company ?? null} />;
}
