import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, RefreshCw, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { fetchChatMessages, fetchChatRooms, fetchMe, sendChatMessage, type BackendChatMessage, type BackendChatRoom } from '@/crm/services/backend';
import { cn } from '@/lib/utils';

const POLL_MS = 1200;

function formatTime(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return '--:--';
  return new Date(parsed).toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(firstName?: string, lastName?: string): string {
  const a = (firstName || '').trim().charAt(0).toUpperCase();
  const b = (lastName || '').trim().charAt(0).toUpperCase();
  return `${a}${b}`.trim() || 'U';
}

export function ChatSheet({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<BackendChatRoom | null>(null);
  const [messages, setMessages] = useState<BackendChatMessage[]>([]);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const loadChat = useCallback(async (withLoader = false) => {
    if (!userId) return;
    if (withLoader) setLoading(true);
    try {
      const rooms = await fetchChatRooms({ userId });
      const primaryRoom = Array.isArray(rooms) && rooms.length > 0 ? rooms[0] : null;
      setRoom(primaryRoom);
      if (!primaryRoom) {
        setMessages([]);
        return;
      }
      const rows = await fetchChatMessages(primaryRoom.id, 120);
      setMessages(Array.isArray(rows) ? rows : []);
    } catch {
      toast.error('Nepodařilo se načíst chat.');
    } finally {
      if (withLoader) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let alive = true;
    fetchMe()
      .then((me) => {
        if (!alive) return;
        setUserId(me?.id ?? null);
      })
      .catch((error) => {
        logFrontendError({
          area: 'store-chat-sheet',
          message: error instanceof Error ? error.message : 'Failed to resolve user for chat sheet',
          meta: { operation: 'fetch_me_chat_sheet' },
        });
        setUserId(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open || !userId) return;
    void loadChat(true);
    const timer = window.setInterval(() => {
      void loadChat(false);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [loadChat, open, userId]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages.length, open]);

  const canSend = useMemo(
    () => Boolean(userId && room?.id && text.trim().length > 0 && !sending),
    [room?.id, sending, text, userId],
  );

  const onSend = useCallback(async () => {
    if (!canSend || !room || !userId) return;
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      await sendChatMessage(room.id, { userId, content });
      setText('');
      await loadChat(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Odeslání zprávy selhalo.');
    } finally {
      setSending(false);
    }
  }, [canSend, room, userId, text, loadChat]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 gap-0 sm:w-[450px] sm:max-w-none inset-5 start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>Chat</SheetTitle>
            <Button
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={() => void loadChat(true)}
              disabled={loading}
              aria-label="Obnovit chat"
            >
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
            </Button>
          </div>
          <div className="mt-2 rounded-md border border-border bg-accent/30 px-3 py-2 text-sm flex items-center justify-between">
            <div>
              <div className="font-medium">{room?.name || 'CORE Team'}</div>
              <div className="text-xs text-muted-foreground">{room?.description || 'Interní konverzace týmu'}</div>
            </div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {room?.membersCount ?? 0}
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="overflow-auto grow p-0">
          <div ref={bodyRef} className="h-full overflow-auto space-y-3 p-4">
            {loading && messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin mr-2" />
                Načítám chat...
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Zatím žádné zprávy.
              </div>
            )}

            {messages.map((message) => {
              const own = Boolean(userId && message.userId === userId);
              const firstName = message.user?.firstName;
              const lastName = message.user?.lastName;
              const displayName = `${firstName || ''} ${lastName || ''}`.trim() || message.user?.email || 'Uživatel';
              const senderAvatar = message.user?.avatar
                ? (message.user.avatar.startsWith('/media/')
                  ? toAbsoluteUrl(message.user.avatar)
                  : message.user.avatar)
                : toAbsoluteUrl('/media/avatars/300-1.png');

              return (
                <div
                  key={message.id}
                  className={cn('flex items-end gap-2.5', own && 'justify-end')}
                >
                  {!own && (
                    <Avatar className="size-8">
                      <AvatarImage src={senderAvatar} alt="" />
                      <AvatarFallback>{initials(firstName, lastName)}</AvatarFallback>
                      <AvatarIndicator className="-end-1.5 -bottom-1.5">
                        <AvatarStatus variant="online" className="size-2.5" />
                      </AvatarIndicator>
                    </Avatar>
                  )}
                  <div className={cn('max-w-[80%] space-y-1', own && 'items-end')}>
                    {!own && <div className="text-[11px] text-muted-foreground">{displayName}</div>}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words',
                        own ? 'bg-primary text-primary-foreground' : 'bg-accent/60 text-foreground',
                      )}
                    >
                      {message.content}
                    </div>
                    <div className={cn('text-[11px] text-muted-foreground', own && 'text-right')}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetBody>

        <div className="border-t border-border p-3">
          <div className="relative">
            <Input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Napište zprávu..."
              className="pe-24"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void onSend();
                }
              }}
            />
            <Button
              size="sm"
              className="absolute end-1.5 top-1/2 -translate-y-1/2"
              onClick={() => void onSend()}
              disabled={!canSend}
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
