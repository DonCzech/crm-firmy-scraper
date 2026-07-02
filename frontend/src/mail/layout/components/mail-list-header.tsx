import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, RefreshCcw, Search, Settings, Tags } from "lucide-react";
import { useLayout } from "./context";
import { Input, InputWrapper } from "@/components/ui/input";
import { AccountSettingsDialog } from "./account-settings-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchMailAccounts, type BackendMailAccount } from "../../services/backend";
import { getSelectedMailAccountEmail, setSelectedMailAccountEmail } from "../../utils/account-selection";

export function MailListHeader() {
  const { isMailViewExpanded, toggleMailView } = useLayout();
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState<BackendMailAccount[]>([]);
  const [activeAccountEmail, setActiveAccountEmail] = useState<string>('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const rows = await fetchMailAccounts();
        if (!alive) return;
        const nextAccounts = Array.isArray(rows) ? rows : [];
        setAccounts(nextAccounts);

        const stored = getSelectedMailAccountEmail();
        const preferred = stored
          ? nextAccounts.find((item) => item.email.toLowerCase() === stored.toLowerCase())
          : null;
        const fallback = preferred?.email || nextAccounts[0]?.email || '';
        setActiveAccountEmail(fallback);
        if (fallback) {
          setSelectedMailAccountEmail(fallback);
        }
      } catch {
        if (!alive) return;
        setAccounts([]);
        setActiveAccountEmail('');
      }
    };

    void load();
    const onAccountsChanged = () => {
      void load();
    };
    const onAccountSelected = (event: Event) => {
      const detail = (event as CustomEvent<{ email?: string | null }>).detail;
      setActiveAccountEmail(detail?.email || '');
    };
    window.addEventListener('mailAccountsChanged', onAccountsChanged);
    window.addEventListener('mailAccountSelected', onAccountSelected);
    return () => {
      alive = false;
      window.removeEventListener('mailAccountsChanged', onAccountsChanged);
      window.removeEventListener('mailAccountSelected', onAccountSelected);
    };
  }, []);

  const activeAccountLabel = useMemo(() => {
    const account = accounts.find((item) => item.email === activeAccountEmail);
    return account?.email || 'Vyber účet';
  }, [accounts, activeAccountEmail]);

  return (
		<div className="flex items-center justify-between px-2 py-3 gap-1">
			<Button variant="ghost" mode="icon" onClick={toggleMailView} className="hidden lg:inline-flex">
				{isMailViewExpanded ? <PanelLeftOpen/> : <PanelLeftClose/>}
			</Button>
				<div className="flex items-center w-full gap-1">
          {!isMailViewExpanded && (
					<InputWrapper className="w-full">
						<Search />
						<Input
						type="text"
						placeholder="Search..."
						value={query}
						onChange={(event) => {
							const nextQuery = event.target.value;
							setQuery(nextQuery);
							window.dispatchEvent(
								new CustomEvent('mailSearchChanged', { detail: { query: nextQuery } }),
							);
						}}
						/>
						</InputWrapper>
          )}
						<div className="flex items-center gap-px ms-auto">
              <Select
                value={activeAccountEmail}
                onValueChange={(value) => {
                  setActiveAccountEmail(value);
                  setSelectedMailAccountEmail(value);
                  window.dispatchEvent(new CustomEvent('mailRefresh'));
                }}
              >
                <SelectTrigger className="h-8 w-56">
                  <SelectValue>{activeAccountLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.email}>
                      {account.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
	            <AccountSettingsDialog
                trigger={
                  <Button variant="ghost" size="sm" mode="icon" title="Správa e-mailového účtu">
                    <span className="sr-only">Správa e-mailového účtu</span>
                    <Settings className="size-4" />
                  </Button>
                }
              />
              {!isMailViewExpanded && (
                <Button
                  variant="ghost"
                  mode="icon"
                  title="Kategorie"
                  onClick={() => window.dispatchEvent(new CustomEvent('mailToggleCategories'))}
                >
                  <Tags className="size-4" />
                </Button>
              )}
						<Button
							variant="ghost"
							mode="icon"
						onClick={() => {
							window.dispatchEvent(new CustomEvent('mailRefresh'));
						}}
					>
						<RefreshCcw/>
					</Button>
				</div>
			</div>
		</div>
  );
}
