import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { Plus, RefreshCw, Pencil, Trash2, Pause, Play } from "lucide-react";
import RecurringDeleteBtn from "@/components/RecurringDeleteBtn";

const PERIOD_LABELS: Record<string, string> = {
  weekly: "Týdně",
  monthly: "Měsíčně",
  quarterly: "Čtvrtletně",
  yearly: "Ročně",
};

export default async function RecurringInvoicesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard/settings/company");

  const { rows } = await query(
    `SELECT r.*, c.name as client_name
     FROM fak_recurring_invoices r
     LEFT JOIN fak_clients c ON c.id = r.client_id
     WHERE r.company_id = $1
     ORDER BY r.created_at DESC`,
    [company.id]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pravidelné faktury</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Automaticky se opakující faktury pro stálé klienty
          </p>
        </div>
        <Link href="/dashboard/invoices/recurring/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nová pravidelná faktura
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-16 text-center">
          <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Žádné pravidelné faktury</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Pravidelné faktury jsou šablony pro opakované fakturování. Nastavte interval
            a Fakturina je bude vystavovat automaticky.
          </p>
          <Link
            href="/dashboard/invoices/recurring/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Vytvořit pravidelnou fakturu
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Název</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Klient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Perioda</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Příští vystavení</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stav</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{r.name}</td>
                  <td className="px-4 py-4 text-slate-600 hidden md:table-cell">{r.client_name ?? "—"}</td>
                  <td className="px-4 py-4 text-slate-600">{PERIOD_LABELS[r.period] ?? r.period}</td>
                  <td className="px-4 py-4 text-slate-500 hidden sm:table-cell">
                    {r.next_issue_date ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.active ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                      {r.active ? "Aktivní" : "Pozastaveno"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/dashboard/invoices/recurring/${r.id}/edit`}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Upravit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <RecurringDeleteBtn id={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
