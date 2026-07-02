import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import ReminderSettingsForm from "@/components/ReminderSettingsForm";

export default async function RemindersSettingsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard/settings/company");

  const { rows } = await query(
    "SELECT * FROM fak_reminder_settings WHERE company_id = $1",
    [company.id]
  );
  const settings = rows[0] ?? null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Upomínky</h1>
        <p className="text-slate-500 text-sm mt-0.5">Nastavte automatické upomínky pro neplacené faktury</p>
      </div>
      <ReminderSettingsForm settings={settings} companyId={company.id} />
    </div>
  );
}
