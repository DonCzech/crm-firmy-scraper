import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import CompanySettingsForm from "@/components/CompanySettingsForm";

export default async function CompanySettingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Moje firma</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tyto údaje se zobrazí na vašich fakturách</p>
      </div>
      <CompanySettingsForm company={company} />
    </div>
  );
}
