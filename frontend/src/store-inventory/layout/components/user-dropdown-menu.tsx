import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Clock,
  Globe,
  Keyboard,
  LogOut,
  Moon,
  PinOff,
  Settings,
  Sun,
  Users,
  VolumeX,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchMe, logoutAuthSession } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { useLanguage } from '@/localization/language-context';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Presence = 'online' | 'away' | 'busy' | 'offline';

const STATUS_KEY = 'core_user_presence';
const MUTE_UNTIL_KEY = 'core_notifications_mute_until';

const STATUS_LABELS: Record<Presence, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Do not disturb',
  offline: 'Offline',
};

const MUTE_OPTIONS: Array<{ label: string; minutes: number | null }> = [
  { label: 'For 30 minutes', minutes: 30 },
  { label: 'For 1 hour', minutes: 60 },
  { label: 'For 4 hours', minutes: 240 },
  { label: 'Until tomorrow', minutes: 24 * 60 },
  { label: 'Until next week', minutes: 7 * 24 * 60 },
  { label: 'Disable mute', minutes: null },
];

function readPresence(): Presence {
  try {
    const value = window.localStorage.getItem(STATUS_KEY) as Presence | null;
    if (!value) return 'online';
    if (value === 'online' || value === 'away' || value === 'busy' || value === 'offline') {
      return value;
    }
    return 'online';
  } catch {
    return 'online';
  }
}

function readMuteUntil(): number | null {
  try {
    const raw = window.localStorage.getItem(MUTE_UNTIL_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function UserDropdownMenu() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const t = language === 'cs'
    ? {
        setStatus: 'Nastavit status',
        mute: 'Ztišit oznámení',
        settings: 'Nastavení',
        users: 'Uživatelé a role',
        notificationSettings: 'Nastavení oznámení',
        stickyHeader: 'Pevná hlavička',
        language: 'Výběr jazyka',
        darkMode: 'Tmavý režim',
        lightMode: 'Světlý režim',
        keyboard: 'Klávesové zkratky',
        logout: 'Odhlásit',
      }
    : {
        setStatus: 'Set status',
        mute: 'Mute notifications',
        settings: 'Settings',
        users: 'Users & roles',
        notificationSettings: 'Notification settings',
        stickyHeader: 'Sticky header',
        language: 'Language',
        darkMode: 'Dark mode',
        lightMode: 'Light mode',
        keyboard: 'Keyboard shortcuts',
        logout: 'Log out',
      };

  const [presence, setPresence] = useState<Presence>('online');
  const [muteUntil, setMuteUntil] = useState<number | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [headerFixedEnabled, setHeaderFixedEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return window.localStorage.getItem('core_header_sticky_enabled_v1') !== '0';
    } catch {
      return true;
    }
  });
  const [me, setMe] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string | null;
    role?: string;
  } | null>(null);

  useEffect(() => {
    setPresence(readPresence());
    setMuteUntil(readMuteUntil());

    fetchMe()
      .then((user) => setMe(user ?? null))
      .catch((error) => {
        logFrontendError({
          area: 'store-user-dropdown-menu',
          message: error instanceof Error ? error.message : 'Failed to resolve current user for dropdown menu',
          meta: { operation: 'fetch_me_user_dropdown' },
        });
        setMe(null);
      });
  }, []);

  const isMuted = Boolean(muteUntil && muteUntil > Date.now());

  const muteLabel = useMemo(() => {
    if (!isMuted || !muteUntil) return 'Off';
    return new Date(muteUntil).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [isMuted, muteUntil]);

  const displayName = useMemo(() => {
    const first = me?.firstName?.trim() || 'User';
    const last = me?.lastName?.trim() || '';
    return `${first} ${last}`.trim();
  }, [me]);

  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [displayName]);

  const avatarSrc = me?.avatar ? me.avatar : toAbsoluteUrl('/media/avatars/300-2.png');
  const isAdmin = (me?.role ?? '').toLowerCase() === 'admin';

  const setStatus = (value: Presence) => {
    setPresence(value);
    try {
      window.localStorage.setItem(STATUS_KEY, value);
    } catch {
      // ignore
    }
    toast.success(`Status changed to ${STATUS_LABELS[value]}`);
  };

  const muteNotifications = (minutes: number | null) => {
    if (minutes === null) {
      setMuteUntil(null);
      try {
        window.localStorage.removeItem(MUTE_UNTIL_KEY);
      } catch {
        // ignore
      }
      toast.success('Notifications unmuted');
      return;
    }

    const until = Date.now() + minutes * 60 * 1000;
    setMuteUntil(until);
    try {
      window.localStorage.setItem(MUTE_UNTIL_KEY, String(until));
    } catch {
      // ignore
    }
    toast.success('Notifications muted');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logoutAuthSession();
    navigate('/auth/sign-in', { replace: true });
  };

  const toggleHeaderSticky = () => {
    const next = !headerFixedEnabled;
    setHeaderFixedEnabled(next);
    try {
      window.localStorage.setItem('core_header_sticky_enabled_v1', next ? '1' : '0');
      window.dispatchEvent(new CustomEvent('core-header-sticky:changed', { detail: { enabled: next } }));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar className="size-7">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
            <AvatarIndicator className="-end-2 -top-2">
              <AvatarStatus variant={presence} className="size-2.5" />
            </AvatarIndicator>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-72" side="bottom" align="end" sideOffset={11}>
          <div className="flex items-center gap-3 p-3">
            <Avatar>
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
              <AvatarIndicator className="-end-1.5 -top-1.5">
                <AvatarStatus variant={presence} className="size-2.5" />
              </AvatarIndicator>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">{STATUS_LABELS[presence]}</span>
            </div>
          </div>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Clock />
              <span>{t.setStatus}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              <DropdownMenuRadioGroup value={presence} onValueChange={(v) => setStatus(v as Presence)}>
                <DropdownMenuRadioItem value="online">Online</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="away">Away</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="busy">Do not disturb</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="offline">Offline</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <VolumeX />
              <span className="grow">{t.mute}</span>
              <Badge variant="outline" size="sm">{isMuted ? 'On' : 'Off'}</Badge>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              {MUTE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.label} onClick={() => muteNotifications(option.minutes)}>
                  {option.label}
                </DropdownMenuItem>
              ))}
              {isMuted && <div className="px-2 py-1 text-xs text-muted-foreground">Muted until: {muteLabel}</div>}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/core/user-management')}>
              <Users />
              <span>{t.users}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => navigate('/core/settings-modal?tab=notifications')}>
            <Bell />
            <span>{t.notificationSettings}</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Globe />
              <span>{t.language}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(v) => setLanguage(v as 'cs' | 'en')}
              >
                <DropdownMenuRadioItem value="cs">🇨🇿 CZ</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="en">🇬🇧 EN</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
            <span>{theme === 'light' ? t.darkMode : t.lightMode}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={toggleHeaderSticky}>
            <PinOff className="size-4" />
            <span className="grow">{t.stickyHeader}</span>
            <Badge variant="outline" size="sm">{headerFixedEnabled ? 'On' : 'Off'}</Badge>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShortcutsOpen(true)}>
            <Keyboard />
            <span>{t.keyboard}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => navigate('/core/settings-modal')}>
            <Settings />
            <span>{t.settings}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            <span>{t.logout}</span>
            <ChevronRight className="size-3 ms-auto text-muted-foreground" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Search</span><kbd className="px-2 py-1 rounded bg-muted">⌘ K</kbd></div>
              <div className="flex justify-between"><span>Dashboard</span><kbd className="px-2 py-1 rounded bg-muted">G D</kbd></div>
              <div className="flex justify-between"><span>Orders</span><kbd className="px-2 py-1 rounded bg-muted">G O</kbd></div>
              <div className="flex justify-between"><span>Products</span><kbd className="px-2 py-1 rounded bg-muted">G P</kbd></div>
              <div className="flex justify-between"><span>Customers</span><kbd className="px-2 py-1 rounded bg-muted">G C</kbd></div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
