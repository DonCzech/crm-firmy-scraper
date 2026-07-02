export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession, getUserCompany, getSubscription } from "@/lib/auth";
import { initDb } from "@/lib/db";
import AppShell from "@/components/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await initDb();
  const user = await getSession();
  if (!user) redirect("/login");

  const company = await getUserCompany(user.id);
  if (!company || !company.onboarded) redirect("/onboarding");

  const subscription = await getSubscription(user.id);

  return (
    <AppShell
      userName={user.name}
      companyName={company?.name}
      plan={subscription?.plan ?? "free"}
    >
      {children}
    </AppShell>
  );
}
