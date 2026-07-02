import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCheck, CircleDot, Clock3, Filter, Info, RefreshCw, Settings, ShieldAlert, ShoppingCart, TrendingUp, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchMe, fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead, type BackendNotification } from '@/crm/services/backend';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/localization/language-context';

const POLL_MS = 25000;

type NotificationPriority = 'info' | 'warning' | 'success';

function parseNotificationData(item: BackendNotification): Record<string, unknown> {
  if (!item?.data) return {};
  try {
    const parsed = JSON.parse(item.data);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function getNotificationPriority(item: BackendNotification): NotificationPriority {
  const data = parseNotificationData(item);
  const candidate = typeof data.priority === 'string' ? data.priority.toLowerCase() : '';
  if (candidate === 'success' || candidate === 'warning' || candidate === 'info') {
    return candidate;
  }
  const type = (item.type || '').toLowerCase();
  if (type.includes('won') || type.includes('success')) return 'success';
  if (type.includes('lost') || type.includes('warning') || type.includes('failed')) return 'warning';
  return 'info';
}

function getNotificationIcon(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('task')) return Clock3;
  if (normalized.includes('order')) return ShoppingCart;
  if (normalized.includes('deal')) return TrendingUp;
  if (normalized.includes('security')) return ShieldAlert;
  if (normalized.includes('invite') || normalized.includes('user')) return UserPlus;
  return Info;
}

function formatRelativeDate(value: string, language: 'cs' | 'en') {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return language === 'cs' ? 'Neznámý čas' : 'Unknown time';
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return language === 'cs' ? 'právě teď' : 'just now';
  if (diffMin < 60) return language === 'cs' ? `před ${diffMin} min` : `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return language === 'cs' ? `před ${diffHours} h` : `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return language === 'cs' ? `před ${diffDays} d` : `${diffDays}d ago`;
  return new Date(timestamp).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationsSheet({ trigger }: { trigger: ReactNode }) {
  const { language } = useLanguage();
  const isCs = language === 'cs';
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | NotificationPriority>('all');
  const [loadErrorShown, setLoadErrorShown] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const readCount = useMemo(() => notifications.length - unreadCount, [notifications, unreadCount]);
  const filteredByPriority = useMemo(
    () =>
      priorityFilter === 'all'
        ? notifications
        : notifications.filter((item) => getNotificationPriority(item) === priorityFilter),
    [notifications, priorityFilter],
  );

  const loadNotifications = useCallback(async (withLoader = false, showErrorToast = true) => {
    if (!userId) return;
    if (withLoader) setLoading(true);
    try {
      const response = await fetchNotifications({ page: 1, limit: 50, userId });
      setNotifications(Array.isArray(response?.data) ? response.data : []);
      setLoadErrorShown(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isUnauthorized = message.includes('(401)');

      logFrontendError({
        area: 'store-notifications-sheet',
        message,
        meta: { operation: 'fetch_notifications_sheet', userId, withLoader, showErrorToast },
      });

      if (isUnauthorized) {
        setUserId(null);
        setNotifications([]);
        return;
      }

      if (showErrorToast && !loadErrorShown) {
        toast.error(isCs ? 'Nepodařilo se načíst notifikace.' : 'Failed to load notifications.');
        setLoadErrorShown(true);
      }
    } finally {
      if (withLoader) setLoading(false);
    }
  }, [isCs, loadErrorShown, userId]);

  const resolveCurrentUser = useCallback(() => {
    let alive = true;
    void fetchMe()
      .then((me) => {
        if (!alive) return;
        setUserId(me?.id ?? null);
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-notifications-sheet',
          message: error instanceof Error ? error.message : 'Failed to resolve user for notifications sheet',
          meta: { operation: 'fetch_me_notifications_sheet' },
        });
        setUserId(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return resolveCurrentUser();
  }, [resolveCurrentUser]);

  useEffect(() => {
    if (!open || userId) return;
    return resolveCurrentUser();
  }, [open, resolveCurrentUser, userId]);

  useEffect(() => {
    if (!userId) return;
    void loadNotifications(true);
    const timer = window.setInterval(() => {
      void loadNotifications(false, false);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [loadNotifications, userId]);

  useEffect(() => {
    if (!open || !userId) return;
    void loadNotifications(false);
  }, [loadNotifications, open, userId]);

  const handleReadOne = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      toast.error(isCs ? 'Nepodařilo se označit jako přečtené.' : 'Failed to mark as read.');
    }
  };

  const handleReadAll = async () => {
    if (!userId) return;
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(isCs ? 'Všechny notifikace označeny jako přečtené.' : 'All notifications marked as read.');
    } catch {
      toast.error(isCs ? 'Nepodařilo se označit vše jako přečtené.' : 'Failed to mark all as read.');
    }
  };

  const allLabel = isCs ? 'Vše' : 'All';
  const unreadLabel = isCs ? 'Nepřečtené' : 'Unread';
  const readLabel = isCs ? 'Přečtené' : 'Read';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {trigger}
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="p-0 gap-0 sm:w-[500px] sm:max-w-none inset-5 start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="mb-0">
          <SheetTitle className="p-3">{isCs ? 'Notifikace' : 'Notifications'}</SheetTitle>
        </SheetHeader>

        <SheetBody className="grow p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            <Tabs defaultValue="all" className="w-full relative">
              <TabsList variant="line" className="w-full px-5 mb-3">
                <TabsTrigger value="all">{allLabel}</TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  {unreadLabel}
                  {unreadCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500 absolute top-1 -end-1" />}
                </TabsTrigger>
                <TabsTrigger value="read">{readLabel}</TabsTrigger>
                <div className="grow flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" mode="icon" className="mb-1" aria-label={isCs ? 'Nastavení notifikací' : 'Notification settings'}>
                        <Settings className="size-4.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-52" side="bottom" align="end">
                      <DropdownMenuItem onClick={() => void loadNotifications(true)}>
                        <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
                        <span>{isCs ? 'Obnovit notifikace' : 'Refresh notifications'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleReadAll} disabled={unreadCount === 0}>
                        <CheckCheck className="size-4" />
                        <span>{isCs ? 'Označit vše jako přečtené' : 'Mark all as read'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Filter className="size-4" />
                        <span>{isCs ? `Filtr: ${filteredByPriority.length}/${notifications.length}` : `Filter: ${filteredByPriority.length}/${notifications.length}`}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('all')}>
                        <Filter className="size-4" />
                        <span>{isCs ? 'Priorita: vše' : 'Priority: all'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('success')}>
                        <CircleDot className="size-4 text-green-600" />
                        <span>{isCs ? 'Priorita: success' : 'Priority: success'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('warning')}>
                        <CircleDot className="size-4 text-amber-500" />
                        <span>{isCs ? 'Priorita: warning' : 'Priority: warning'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriorityFilter('info')}>
                        <CircleDot className="size-4 text-blue-500" />
                        <span>{isCs ? 'Priorita: info' : 'Priority: info'}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TabsList>

              {[
                { value: 'all', items: filteredByPriority },
                { value: 'unread', items: filteredByPriority.filter((item) => !item.isRead) },
                { value: 'read', items: filteredByPriority.filter((item) => item.isRead) },
              ].map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <div className="flex flex-col gap-3 pb-3">
                    {tab.items.length === 0 && !loading && (
                      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                        {isCs ? 'Žádné notifikace.' : 'No notifications.'}
                      </div>
                    )}

                    {tab.items.map((item, index) => {
                      const Icon = getNotificationIcon(item.type);
                      const priority = getNotificationPriority(item);
                      return (
                        <div key={item.id}>
                          <div className="flex grow gap-2.5 px-5">
                            <div
                              className={cn(
                                'mt-0.5 rounded-full p-2 shrink-0',
                                item.isRead
                                  ? 'bg-muted'
                                  : priority === 'success'
                                    ? 'bg-green-100'
                                    : priority === 'warning'
                                      ? 'bg-amber-100'
                                      : 'bg-primary/15',
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="flex flex-col gap-2.5 grow min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium mb-px flex items-center gap-1.5 min-w-0">
                                    <span className="font-semibold text-mono truncate">{item.title}</span>
                                    {!item.isRead && <CircleDot className="size-3 text-primary shrink-0" />}
                                  </div>
                                  <p className="text-sm text-secondary-foreground">{item.message}</p>
                                  <span className="flex items-center text-xs font-medium text-muted-foreground mt-1">
                                    {formatRelativeDate(item.createdAt, language)}
                                    <span className="rounded-full size-1 bg-mono/30 mx-1.5" />
                                    {item.type}
                                    <span className="rounded-full size-1 bg-mono/30 mx-1.5" />
                                    <span
                                      className={cn(
                                        priority === 'success'
                                          ? 'text-green-700'
                                          : priority === 'warning'
                                            ? 'text-amber-600'
                                            : 'text-blue-600',
                                      )}
                                    >
                                      {priority}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              {!item.isRead && (
                                <div className="flex justify-end">
                                  <Button variant="outline" size="sm" onClick={() => void handleReadOne(item.id)}>
                                    {isCs ? 'Označit jako přečtené' : 'Mark as read'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          {index < tab.items.length - 1 && <div className="border-b border-b-border mt-3" />}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t border-border p-5 grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => void loadNotifications(true)} disabled={loading}>
            <RefreshCw className={cn('size-4 mr-1.5', loading && 'animate-spin')} />
            {isCs ? 'Obnovit' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={handleReadAll} disabled={unreadCount === 0}>
            <CheckCheck className="size-4 mr-1.5" />
            {isCs ? `${unreadCount} nepřečtených` : `${readCount}/${notifications.length} read`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
