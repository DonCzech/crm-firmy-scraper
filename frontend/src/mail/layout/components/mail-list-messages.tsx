import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Archive, CircleCheck, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLayout } from './context';
import { MailListHeader } from './mail-list-header';
import { MailListWrapper } from './mail-list-wrapper';
import { CategorySelector } from './category-selector';
import {
  BackendMailMessage,
  deleteMailMessage,
  fetchMailMessages,
  updateMailMessage,
} from '../../services/backend';
import { getSelectedMailAccountEmail } from '../../utils/account-selection';
import { getSelectedMailCategories, type MailCategoryId } from '../../utils/category-selection';

export interface EmailMessage {
  id: string;
  sender: string;
  senderInitial: string;
  senderEmail: string;
  subject: string;
  body: string;
  toEmail: string;
  cc?: string | null;
  bcc?: string | null;
  date: string;
  createdAt: string;
  folder: string;
  isUnread: boolean;
  isStarred: boolean;
  priority: string;
}

export let emailMessages: EmailMessage[] = [];

let currentSelectedEmail = '';

export function getCurrentSelectedEmail(): string {
  return currentSelectedEmail;
}

export function getSelectedEmailData(selectedId: string): EmailMessage | undefined {
  return emailMessages.find((email) => email.id === selectedId);
}

export function setCurrentSelectedEmail(id: string): void {
  currentSelectedEmail = id;
  window.dispatchEvent(new CustomEvent('emailSelected', { detail: { emailId: id } }));
}

function resolveFolder(pathname: string): string {
  if (pathname.includes('/mail/sent')) return 'sent';
  if (pathname.includes('/mail/draft')) return 'draft';
  return 'inbox';
}

function mapMessage(item: BackendMailMessage): EmailMessage {
  const createdDate = new Date(item.createdAt);
  const sender = item.fromName?.trim() || item.fromEmail || 'Unknown sender';
  return {
    id: item.id,
    sender,
    senderInitial: sender.charAt(0).toUpperCase() || 'U',
    senderEmail: item.fromEmail,
    subject: item.subject || '(No subject)',
    body: item.body || '',
    toEmail: item.toEmail || '',
    cc: item.cc ?? null,
    bcc: item.bcc ?? null,
    date: createdDate.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' }),
    createdAt: item.createdAt,
    folder: item.folder,
    isUnread: !item.isRead,
    isStarred: item.isStarred,
    priority: item.priority || 'normal',
  };
}

function buildFallbackMessages(): EmailMessage[] {
  return [];
}

function inferMessageCategories(message: EmailMessage): Set<MailCategoryId> {
  const text = `${message.subject} ${message.body} ${message.senderEmail} ${message.sender}`.toLowerCase();
  const categories = new Set<MailCategoryId>(['primary']);

  if (/(facebook|instagram|linkedin|x\.com|twitter|tiktok|social)/.test(text)) categories.add('social');
  if (/(sale|discount|offer|promo|coupon|deal|black friday|shop|store)/.test(text)) {
    categories.add('promotions');
    categories.add('shopping');
  }
  if (/(update|alert|notification|receipt|invoice|confirmed|status|ticket)/.test(text)) categories.add('updates');
  if (/(forum|thread|community|discussion)/.test(text)) categories.add('forums');
  if (/(flight|hotel|booking|reservation|trip|travel|itinerary)/.test(text)) categories.add('travel');
  if (/(bank|payment|card|transaction|billing|finance|iban|statement)/.test(text)) categories.add('finance');
  if (/(newsletter|digest|weekly|monthly|unsubscribe)/.test(text)) categories.add('newsletters');
  if (/(lottery|win money|crypto giveaway|urgent action required|spam)/.test(text)) categories.add('spam');

  return categories;
}

export function MailListMessages() {
  const { pathname } = useLocation();
  const folder = useMemo(() => resolveFolder(pathname), [pathname]);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<MailCategoryId[]>(() => getSelectedMailCategories());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile, showMailView, isMailViewExpanded } = useLayout();
  const selectedEmailRef = useRef('');

  useEffect(() => {
    selectedEmailRef.current = selectedEmail;
  }, [selectedEmail]);

  const syncGlobalMessages = (items: EmailMessage[]) => {
    emailMessages = items;
  };

  const visibleMessages = useMemo(() => {
    const selected = new Set(selectedCategories);
    if (selected.size === 0) return messages;
    return messages.filter((message) => {
      const inferred = inferMessageCategories(message);
      for (const category of selected) {
        if (inferred.has(category)) return true;
      }
      return false;
    });
  }, [messages, selectedCategories]);

  useEffect(() => {
    if (visibleMessages.length === 0) {
      if (selectedEmail !== '') {
        setSelectedEmail('');
        setCurrentSelectedEmail('');
      }
      return;
    }
    if (selectedEmail && visibleMessages.some((item) => item.id === selectedEmail)) return;
    const nextId = visibleMessages[0]?.id ?? '';
    setSelectedEmail(nextId);
    setCurrentSelectedEmail(nextId);
  }, [selectedEmail, visibleMessages]);

  const loadMessages = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMailMessages({
        folder,
        limit: 200,
        search: searchQuery || undefined,
        accountEmail: getSelectedMailAccountEmail() || undefined,
      });
      const mapped = (response?.data ?? []).map(mapMessage);
      setMessages(mapped);
      syncGlobalMessages(mapped);

      if (mapped.length === 0) {
        const syncWarning = response?.meta?.syncWarning?.trim();
        if (syncWarning) {
          setError(syncWarning);
        }
        setSelectedEmail('');
        setCurrentSelectedEmail('');
        return;
      }

      const preferredId = selectedEmailRef.current || currentSelectedEmail;
      const exists = mapped.some((item) => item.id === preferredId);
      const nextId = exists ? preferredId : mapped[0]?.id ?? '';
      setSelectedEmail(nextId);
      setCurrentSelectedEmail(nextId);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Failed to load mail messages.';
      setError(message);
      const fallback = buildFallbackMessages();
      setMessages(fallback);
      syncGlobalMessages(fallback);
      setSelectedEmail(fallback[0]?.id ?? '');
      setCurrentSelectedEmail(fallback[0]?.id ?? '');
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    void loadMessages(search);
  }, [loadMessages, search]);

  useEffect(() => {
    const onSearchChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      const query = detail?.query ?? '';
      setSearch(query);
      void loadMessages(query);
    };
    const onRefresh = () => {
      void loadMessages(search);
    };
    const onAccountsChanged = () => {
      void loadMessages(search);
    };
    const onAccountSelected = () => {
      void loadMessages(search);
    };
    const onToggleCategories = () => {
      setShowCategories((prev) => !prev);
    };
    const onCategoriesChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ categories?: MailCategoryId[] }>).detail;
      const next = Array.isArray(detail?.categories) ? detail.categories : getSelectedMailCategories();
      setSelectedCategories(next);
    };

    window.addEventListener('mailSearchChanged', onSearchChanged);
    window.addEventListener('mailRefresh', onRefresh);
    window.addEventListener('mailAccountsChanged', onAccountsChanged);
    window.addEventListener('mailAccountSelected', onAccountSelected);
    window.addEventListener('mailToggleCategories', onToggleCategories);
    window.addEventListener('mailCategoriesChanged', onCategoriesChanged);
    return () => {
      window.removeEventListener('mailSearchChanged', onSearchChanged);
      window.removeEventListener('mailRefresh', onRefresh);
      window.removeEventListener('mailAccountsChanged', onAccountsChanged);
      window.removeEventListener('mailAccountSelected', onAccountSelected);
      window.removeEventListener('mailToggleCategories', onToggleCategories);
      window.removeEventListener('mailCategoriesChanged', onCategoriesChanged);
    };
  }, [loadMessages, search]);

  const patchInState = (id: string, patch: Partial<EmailMessage>) => {
    setMessages((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item));
      syncGlobalMessages(next);
      return next;
    });
  };

  const removeFromState = (id: string) => {
    setMessages((prev) => {
      const next = prev.filter((item) => item.id !== id);
      syncGlobalMessages(next);
      return next;
    });
  };

  const handleMessageSelect = async (email: EmailMessage) => {
    setSelectedEmail(email.id);
    setCurrentSelectedEmail(email.id);

    if (isMobile) {
      showMailView();
    }

    if (email.isUnread) {
      patchInState(email.id, { isUnread: false });
      try {
        await updateMailMessage(email.id, { isRead: true });
      } catch {
        patchInState(email.id, { isUnread: true });
      }
    }
  };

  return (
    <MailListWrapper>
      <MailListHeader />
      {showCategories && (
        <div className={cn("px-4 pb-1", !isMobile && isMailViewExpanded && "hidden")}>
          <CategorySelector inline />
        </div>
      )}
      <div className={cn("px-4 py-1", !isMobile && isMailViewExpanded && "hidden")}>
        <ScrollArea className="lg:h-[calc(100vh-5.5rem)]">
          {loading ? (
            <div className="px-2 py-6 text-sm text-muted-foreground">Loading messages...</div>
          ) : error ? (
            <div className="px-2 py-6 text-sm text-destructive">{error}</div>
          ) : visibleMessages.length === 0 ? (
            <div className="px-2 py-6 text-sm text-muted-foreground">No messages in this folder.</div>
          ) : (
            <div className="space-y-1">
              {visibleMessages.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    'group flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors relative',
                    'hover:bg-secondary',
                    selectedEmail === email.id ? 'bg-secondary' : '',
                  )}
                  onClick={() => {
                    void handleMessageSelect(email);
                  }}
                >
                  <div className="shrink-0 flex items-center justify-center border rounded-full size-[30px] bg-background">
                    <Avatar className="size-[30px]">
                      <AvatarFallback className="bg-background">{email.senderInitial}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span
                        className={cn(
                          'font-medium text-sm text-foreground',
                          email.isUnread ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {email.sender}
                      </span>
                      {email.isUnread && (
                        <Badge appearance="ghost">
                          <BadgeDot className="size-2" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-normal truncate">{email.subject}</p>
                  </div>

                  <span className="text-xs text-secondary-foreground mb-5">{email.date}</span>

                  <div className="border border-border flex items-center gap-0.5 p-0.5 absolute top-1 end-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-md shadow-xs shadow-black/5">
                    <Button
                      variant="ghost"
                      mode="icon"
                      size="sm"
                      className="size-6"
                      onClick={async (event) => {
                        event.stopPropagation();
                        const nextStarred = !email.isStarred;
                        patchInState(email.id, { isStarred: nextStarred });
                        try {
                          await updateMailMessage(email.id, { isStarred: nextStarred });
                          toast.custom((t) => (
                            <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
                              <AlertIcon>
                                <CircleCheck />
                              </AlertIcon>
                              <AlertTitle>{nextStarred ? 'Email starred' : 'Star removed'}</AlertTitle>
                            </Alert>
                          ));
                        } catch {
                          patchInState(email.id, { isStarred: !nextStarred });
                        }
                      }}
                    >
                      <Star
                        className={cn(
                          'size-3.5',
                          email.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground',
                        )}
                      />
                    </Button>
                    <Button variant="ghost" mode="icon" size="sm" className="size-6">
                      <AlertCircle className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      mode="icon"
                      size="sm"
                      className="size-6"
                      onClick={async (event) => {
                        event.stopPropagation();
                        try {
                          await updateMailMessage(email.id, { folder: 'archive' });
                        } catch {
                          // keep local UX responsive even when API is temporarily unavailable
                        }
                        removeFromState(email.id);
                        if (selectedEmail === email.id) {
                          const nextId = visibleMessages.find((item) => item.id !== email.id)?.id ?? '';
                          setSelectedEmail(nextId);
                          setCurrentSelectedEmail(nextId);
                        }
                      }}
                    >
                      <Archive className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      mode="icon"
                      size="sm"
                      className="size-6"
                      onClick={async (event) => {
                        event.stopPropagation();
                        try {
                          await deleteMailMessage(email.id);
                        } catch {
                          // keep local UX responsive even when API is temporarily unavailable
                        } finally {
                          removeFromState(email.id);
                          if (selectedEmail === email.id) {
                            const nextId = messages.find((item) => item.id !== email.id)?.id ?? '';
                            setSelectedEmail(nextId);
                            setCurrentSelectedEmail(nextId);
                          }
                        }
                      }}
                    >
                      <Trash2 className="text-destructive size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </MailListWrapper>
  );
}
