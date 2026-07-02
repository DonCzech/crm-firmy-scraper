import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { initDb, query } from "@/lib/db";
import BankAccountsManager from "./BankAccountsManager";

export default async function BankAccountsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  await initDb();
  const { rows: accounts } = await query(
    "SELECT * FROM fak_bank_accounts WHERE company_id = $1 ORDER BY is_default DESC, created_at ASC",
    [company.id]
  );
  const { rows: connections } = await query(
    `SELECT bc.id, bc.bank_account_id, bc.provider, bc.name, bc.last_transaction_id,
            bc.last_sync_at, bc.active, bc.created_at, ba.name AS bank_account_name,
            ba.bank_account, ba.currency
     FROM fak_bank_connections bc
     JOIN fak_bank_accounts ba ON ba.id = bc.bank_account_id AND ba.company_id = bc.company_id
     WHERE bc.company_id = $1
     ORDER BY bc.active DESC, bc.created_at DESC`,
    [company.id]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bankovní účty</h1>
        <p className="text-slate-500 text-sm mt-1">Přidejte účty a napojte Fio API pro automatické párování plateb.</p>
      </div>
      <BankAccountsManager initialAccounts={accounts} initialConnections={connections} />
    </div>
  );
}
