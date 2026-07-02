import { cn, formatDate } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

interface Props {
  conversations: any[];
  activeId: string | null;
  currentUserId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, currentUserId, onSelect }: Props) {
  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm">Konverzace</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
            <MessageSquare size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Zatím žádné zprávy</p>
          </div>
        ) : (
          conversations.map((conv: any) => {
            const lastMsg = conv.messages?.[0];
            const otherId = conv.participantAId === currentUserId ? conv.participantBId : conv.participantAId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-gray-100 transition hover:bg-gray-50',
                  activeId === conv.id && 'bg-primary-50 border-l-2 border-l-primary-500',
                )}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conv.listing?.title ?? 'Konverzace'}
                </p>
                {lastMsg && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.content}</p>
                )}
                {lastMsg && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(lastMsg.createdAt)}</p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
