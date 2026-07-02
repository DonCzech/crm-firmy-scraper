import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import TagsManager from "./TagsManager";

export default async function TagsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows: tags } = await query(
    "SELECT * FROM fak_tags WHERE company_id = $1 ORDER BY name",
    [company.id]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Štítky</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kategorizujte faktury barevnými štítky pro lepší přehlednost.
        </p>
      </div>
      <TagsManager initialTags={tags} />
    </div>
  );
}
