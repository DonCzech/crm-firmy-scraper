import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { ChatThread } from '@/ai/types';
import { getConversations } from '@/ai/services/api';
import { MessageSquare } from 'lucide-react';

interface ChatsContextValue {
  chats: ChatThread[];
  setChats: React.Dispatch<React.SetStateAction<ChatThread[]>>;
  refreshChats: () => void;
}

const ChatsContext = createContext<ChatsContextValue | undefined>(undefined);

function mapConversationToThread(conv: {
  id: string;
  title: string;
  model: string;
  isPinned: boolean;
  updatedAt: string;
  _count?: { messages: number };
}): ChatThread {
  return {
    id: conv.id,
    title: conv.title,
    model: conv.model,
    isPinned: conv.isPinned,
    timestamp: new Date(conv.updatedAt).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
    }),
    icon: MessageSquare,
    messageCount: conv._count?.messages,
  };
}

interface ChatsProviderProps {
  children: ReactNode;
}

export function ChatsProvider({ children }: ChatsProviderProps) {
  const [chats, setChats] = useState<ChatThread[]>([]);

  const refreshChats = useCallback(() => {
    getConversations()
      .then((convs) => setChats(convs.map(mapConversationToThread)))
      .catch(() => {});
  }, []);

  // Load on mount
  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  return (
    <ChatsContext.Provider value={{ chats, setChats, refreshChats }}>
      {children}
    </ChatsContext.Provider>
  );
}

export const useChats = () => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error('useChats must be used within a ChatsProvider');
  }
  return context;
};
