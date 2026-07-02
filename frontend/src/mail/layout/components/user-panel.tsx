import { useEffect, useState } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Check, Moon, Sun, Laptop, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage, } from '@/components/ui/avatar';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { fetchMailAccounts } from '../../services/backend';
import { AccountSettingsDialog } from './account-settings-dialog';
import { getSelectedMailAccountEmail, setSelectedMailAccountEmail } from '../../utils/account-selection';

type Account = {
  name: string;
  email: string;
  avatar?: string;
  avatarFallback?: string;
  avatarFallbackClassName?: string;
};

const DEFAULT_ACCOUNT: Account = {
  name: 'Mail',
  email: 'Zatím bez účtu',
  avatar: toAbsoluteUrl('/media/avatars/300-2.png'),
  avatarFallback: 'M',
};

export function UserPanel() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const rows = await fetchMailAccounts();
        if (!alive) return;
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows.map((row) => ({
            name: row.name,
            email: row.email,
            avatar: row.avatar ?? undefined,
            avatarFallback: row.name.charAt(0).toUpperCase(),
          }));
          setAccounts(mapped);
          const stored = getSelectedMailAccountEmail();
          const active = mapped.find((account) => account.email.toLowerCase() === (stored || '').toLowerCase())?.email
            ?? mapped[0].email;
          setSelectedEmail(active);
          setSelectedMailAccountEmail(active);
        }
      } catch {
        // keep defaults
      }
    };
    void load();
    const onAccountsChanged = () => {
      void load();
    };
    window.addEventListener('mailAccountsChanged', onAccountsChanged);
    return () => {
      alive = false;
      window.removeEventListener('mailAccountsChanged', onAccountsChanged);
    };
  }, []);

  const primaryAccount = accounts[0] ?? DEFAULT_ACCOUNT;
  const visiblePrimary = accounts.find((item) => item.email === selectedEmail) ?? primaryAccount;

  return (
		<DropdownMenu>
			<DropdownMenuTrigger className={cn(
				'grow cursor-pointer justify-between flex items-center gap-2.5 lg:mx-2.5 lg:px-2 py-1 rounded-md ring-none outline-none',
				'hover:bg-background data-[state=open]:bg-background',
				'in-data-[sidebar-collapsed=true]:hover:bg-transparent in-data-[sidebar-collapsed=true]:data-[state=open]:bg-transparent',				
			)}>
				<div className="flex items-center gap-1.5">  
						<Avatar className="size-8 border border-background rounded-full overflow-hidden">
						<AvatarImage src={visiblePrimary.avatar || toAbsoluteUrl('/media/avatars/300-2.png')} alt={visiblePrimary.name}/>
						<AvatarFallback className="rounded-md">{(visiblePrimary.avatarFallback || visiblePrimary.name.charAt(0) || 'M').toUpperCase()}</AvatarFallback>
					</Avatar>
					<div className="hidden md:flex flex-col items-start gap-0.25 md:in-data-[sidebar-collapsed=true]:hidden">
						<span className="text-sm font-medium text-foreground leading-none">{visiblePrimary.name}</span>
						<span className="text-xs text-muted-foreground font-normal leading-none">{visiblePrimary.email}</span>
					</div>
				</div> 
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="!w-56 lg:w-(--radix-dropdown-menu-trigger-width)"> 
				<DropdownMenuGroup>  
					<DropdownMenuLabel>Accounts</DropdownMenuLabel>
					{accounts.length > 0 ? accounts.map((account, index) => (
						<DropdownMenuItem
              key={index}
              onClick={() => {
                setSelectedEmail(account.email);
                setSelectedMailAccountEmail(account.email);
                window.dispatchEvent(new CustomEvent('mailRefresh'));
              }}
            >
							<Avatar className="size-7">
								{account.avatar && <AvatarImage src={account.avatar} alt="@reui"/>} 
								{account.avatarFallback && <AvatarFallback className={cn('text-xs', account.avatarFallbackClassName)}>{account.avatarFallback}</AvatarFallback>}
							</Avatar>
							<div className="flex flex-col items-start gap-0.5">
								<span className="text-sm font-medium text-foreground leading-none">{account.name}</span>
								<span className="text-xs text-muted-foreground font-normal leading-none">{account.email}</span>
							</div>
              {selectedEmail === account.email && <Check className="ms-auto size-4 text-primary" />}
						</DropdownMenuItem>
					)) : (
            <DropdownMenuItem disabled>Žádný napojený účet</DropdownMenuItem>
          )}                         
						<DropdownMenuSeparator />
            <DropdownMenuItem className="ps-0 p-0 focus:bg-transparent" asChild>
              <div className="w-full">
                <AccountSettingsDialog
                  triggerClassName="w-full justify-start rounded-none px-3.5"
                  label="Add Account"
                />
              </div>
            </DropdownMenuItem>
					<DropdownMenuItem className="ps-3.5" asChild>
						<Link to="/logout">
							<LogOut />
							<span className="ps-1.5">Logout</span>
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>  
				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="ps-3.5">
						{resolvedTheme === 'light' ? <Sun /> : <Moon />}
						<span className="ps-1.5">
							{resolvedTheme === 'light' ? 'Light' : 'Dark'} Mode
						</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup
							className="w-36"
							value={theme ?? 'system'}
							onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
						>
							<DropdownMenuRadioItem value="system">
								<Laptop className="mr-2 h-4 w-4" />
								<span>System</span>
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="light">
								<Sun className="mr-2 h-4 w-4" />
								<span>Light</span>
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="dark">
								<Moon className="mr-2 h-4 w-4" />
								<span>Dark</span>
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSeparator />
				
				<div className="px-2 py-1 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
					<Link className="cursor-pointer hover:text-primary" to="/core/dashboard">Privacy</Link>
					<span className="rounded-full size-0.5 bg-muted-foreground/60"></span>
					<Link className="cursor-pointer hover:text-primary" to="/core/dashboard">Terms</Link>
				</div>                
			</DropdownMenuContent>
		</DropdownMenu>
  );
}
  
