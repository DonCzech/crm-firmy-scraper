import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewChatButton } from './new-chat-button';
import { PinnedChats } from './pinned-chats';
import { RecentChats } from './recent-chats';
import { useChats } from './chats-context';
import { useSearchParams } from 'react-router';

export function EmbeddedSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { setChats } = useChats();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');

  const handleChatDelete = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div
      className={cn(
        'shrink-0 border-r border-input flex flex-col transition-all duration-300 overflow-hidden',
        isOpen ? 'w-64' : 'w-12'
      )}
    >
      {/* Toggle button */}
      <div className={cn('flex items-center px-2 py-2.5 shrink-0', isOpen ? 'justify-between' : 'justify-center')}>
        {isOpen && (
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Chats
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className={cn('p-2 space-y-3', !isOpen && 'flex flex-col items-center')}>
          <NewChatButton isCollapsed={!isOpen} />

          {isOpen && (
            <>
              <PinnedChats
                selectedChat={chatId || selectedChat}
                onChatSelect={setSelectedChat}
              />

              {/* Only show separator if there are pinned chats */}
              <RecentChats
                selectedChat={chatId || selectedChat}
                onChatSelect={setSelectedChat}
                onChatDelete={handleChatDelete}
              />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
