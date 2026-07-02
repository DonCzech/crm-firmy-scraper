import { redirect } from "next/navigation";
import { Activity, AlertTriangle, CheckCircle2, Clock, Mail, RefreshCw, WalletCards } from "lucide-react";
import { getSession, getUserCompany } from "@/lib/auth";
import { initDb, query } from "@/lib/db";

function fmtTs(value?: number | null) {
  if (!value) return "Nikdy";
  return new Date(value * 1000).toLocaleString("cs-CZ");
}

function statusClass(status: string) {
  if (status === "success" || status === "sent") return "bg-emerald-50 text-emerald-700";
  if (status === "running") return "bg-blue-50 text-blue-700";
  if (status === "dry_run") return "bg-slate-100 text-slate-700";
  return "bg-red-50 text-red-700";
}

export default async function AutomationPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  await initDb();

  const [{ rows: runs }, { rows: emails }, { rows: bankTransactions }, { rows: statsRows }] = await Promise.all([
    query(
      `SELECT *
       FROM fak_automation_runs
       WHERE company_id = $1 OR company_id IS NULL
       ORDER BY started_at DESC
       LIMIT 12`,
      [company.id]
    ),
    query(
      `SELECT el.*, i.number AS invoice_number, q.number AS quote_number
       FROM fak_email_log el
       LEFT JOIN fak_invoices i ON i.id = el.invoice_id
       LEFT JOIN fak_quotes q ON q.id = el.quote_id
       WHERE el.company_id = $1
       ORDER BY el.created_at DESC
       LIMIT 12`,
      [company.id]
    ),
    query(
      `SELECT bt.*, i.number AS invoice_number
       FROM fak_bank_transactions bt
       LEFT JOIN fak_invoices i ON i.id = bt.matched_invoice_id
       WHERE bt.company_id = $1
       ORDER BY bt.created_at DESC
       LIMIT 12`,
      [company.id]
    ),
    query(
      `SELECT
         (SELECT COUNT(*) FROM fak_email_log WHERE company_id = $1 AND status = 'sent') AS emails_sent,
         (SELECT COUNT(*) FROM fak_email_log WHERE company_id = $1 AND status = 'error') AS emails_error,
         (SELECT COUNT(*) FROM fak_bank_transactions WHERE company_id = $1 AND matched_invoice_id IS NOT NULL) AS payments_matched,
         (SELECT COUNT(*) FROM fak_bank_transactions WHERE company_id = $1 AND matched_invoice_id IS NULL) AS payments_unmatched`,
      [company.id]
    ),
  ]);

  const stats = statsRows[0] ?? {};
  const cards = [
    { label: "Odeslané e-maily", value: stats.emails_sent ?? 0, icon: Mail, tone: "text-blue-600" },
    { label: "Chyby e-mailů", value: stats.emails_error ?? 0, icon: AlertTriangle, tone: "text-red-600" },
    { label: "Spárované platby", value: stats.payments_matched ?? 0, icon: CheckCircle2, tone: "text-emerald-600" },
    { label: "Nespárované platby", value: stats.payments_unmatched ?? 0, icon: WalletCards, tone: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Automatizace</h1>
        <p className="text-slate-500 text-sm mt-1">Dohled nad upomínkami, Resendem a bankovním párováním.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">{card.label}</div>
                <Icon className={`w-5 h-5 ${card.tone}`} />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-3">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Běhy automatizací</h2>
          </div>
          <div className="space-y-3">
            {runs.length === 0 && <div className="text-sm text-slate-400">Zatím žádný běh.</div>}
            {runs.map((run) => (
              <div key={run.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{run.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(run.status)}`}>{run.status}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {fmtTs(run.started_at)} až {fmtTs(run.finished_at)}
                </div>
                {run.error && <div className="text-xs text-red-600 mt-2">{run.error}</div>}
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900">E-mail log</h2>
          </div>
          <div className="space-y-3">
            {emails.length === 0 && <div className="text-sm text-slate-400">Zatím žádné e-maily.</div>}
            {emails.map((email) => (
              <div key={email.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{email.subject ?? email.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(email.status)}`}>{email.status}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{email.recipient} · {fmtTs(email.created_at)}</div>
                {(email.invoice_number || email.quote_number) && (
                  <div className="text-xs text-slate-400 mt-1">Doklad: {email.invoice_number ?? email.quote_number}</div>
                )}
                {email.error && <div className="text-xs text-red-600 mt-2">{email.error}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Bankovní transakce</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 pr-4">Datum</th>
                <th className="py-2 pr-4">Částka</th>
                <th className="py-2 pr-4">VS</th>
                <th className="py-2 pr-4">Zpráva</th>
                <th className="py-2">Párování</th>
              </tr>
            </thead>
            <tbody>
              {bankTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-50">
                  <td className="py-2 pr-4 whitespace-nowrap">{tx.booking_date ?? "-"}</td>
                  <td className="py-2 pr-4 whitespace-nowrap font-semibold">{Number(tx.amount).toLocaleString("cs-CZ")} {tx.currency}</td>
                  <td className="py-2 pr-4">{tx.variable_symbol ?? "-"}</td>
                  <td className="py-2 pr-4 text-slate-500">{tx.message ?? "-"}</td>
                  <td className="py-2">
                    {tx.invoice_number ? (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">{tx.invoice_number}</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">Nespárováno</span>
                    )}
                  </td>
                </tr>
              ))}
              {bankTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">Zatím žádné importované transakce.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
