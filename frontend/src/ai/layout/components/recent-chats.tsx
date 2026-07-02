import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MoreVertical,
  Star,
  Trash2,
  Pin,
  PinOff,
  Copy,
} from "lucide-react";
import { SectionHeader } from "./section-header";
import { ChatThread } from "@/ai/types";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useChats } from "./chats-context";
import { deleteConversationApi, updateConversation } from "@/ai/services/api";

interface RecentChatsProps {
  selectedChat: string | null;
  onChatSelect: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
}

function ChatItem({
  chat,
  isSelected,
  onSelect,
  onDelete,
  onPin,
  onFavorite,
  onCopyLink
}: {
  chat: ChatThread;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  onFavorite?: () => void;
  onCopyLink?: () => void;
}) {
  const Icon = chat.icon;
  const isPinned = chat.isPinned || false;
  const isFavorite = chat.isFavorite || false;

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-md hover:bg-muted px-2 py-1 has-data-[state=open]:bg-muted",
        isSelected ? "bg-primary/10 text-primary" : "bg-background hover:bg-muted"
      )}
    >
      <Button
        variant="ghost"
        onClick={onSelect}
        className={cn(
          "bg-transparent! justify-start text-foreground/80 flex-1 truncate text-ellipsis w-[195px] p-0 h-auto text-xs",
        )}
      >
        <Icon className="size-4 shrink-0 text-muted-foreground/60" />
        <span className="text-sm font-medium truncate text-start">{chat.title}</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ms-auto opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity size-6 -me-1"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onFavorite && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onFavorite();
              }}
            >
              <Star className={cn("size-4", isFavorite && "fill-yellow-400 text-yellow-400")} />
              <span>{isFavorite ? "Remove from Favorites" : "Add to Favorites"}</span>
            </DropdownMenuItem>
          )}
          {onPin && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
            >
              {isPinned ? (
                <>
                  <PinOff className="size-4" />
                  <span>Unpin Chat</span>
                </>
              ) : (
                <>
                  <Pin className="size-4" />
                  <span>Pin Chat</span>
                </>
              )}
            </DropdownMenuItem>
          )}
          {onCopyLink && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
            >
              <Copy className="size-4" />
              <span>Copy Link</span>
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RecentChats({ selectedChat, onChatSelect, onChatDelete }: RecentChatsProps) {
  const navigate = useNavigate();
  const { chats, setChats, refreshChats } = useChats();

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
    navigate(`/core/ai/chat?chatId=${chatId}`);
  };

  const handlePinChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    const wasPinned = chat?.isPinned || false;
    setChats((prev) =>
      prev.map((c) => c.id === chatId ? { ...c, isPinned: !wasPinned } : c)
    );
    updateConversation(chatId, { isPinned: !wasPinned }).catch(() => refreshChats());
    toast.success(wasPinned ? "Chat unpinned" : "Chat pinned");
  };

  const handleFavoriteChat = (chatId: string) => {
    setChats((prevChats) => {
      const chat = prevChats.find((c) => c.id === chatId);
      const isFavorite = chat?.isFavorite || false;
      const updatedChats = prevChats.map((chat) =>
        chat.id === chatId
          ? { ...chat, isFavorite: !isFavorite }
          : chat
      );
      toast.success(
        isFavorite
          ? "Removed from favorites"
          : "Added to favorites"
      );
      return updatedChats;
    });
  };

  const handleCopyLink = async () => {
    try {
      const chatUrl = `${window.location.origin}/core/ai/chat`;
      await navigator.clipboard.writeText(chatUrl);
      toast.success("Chat link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link. Please try again.");
      console.error("Failed to copy:", error);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    onChatDelete?.(chatId);
    deleteConversationApi(chatId).catch(() => refreshChats());
    toast.success("Chat deleted");
  };

  return (
    <div className="space-y-2">
      <SectionHeader label="Recent" />
      <div className="space-y-0.5">
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChat === chat.id}
            onSelect={() => handleChatClick(chat.id)}
            onDelete={() => handleDeleteChat(chat.id)}
            onPin={() => handlePinChat(chat.id)}
            onFavorite={() => handleFavoriteChat(chat.id)}
            onCopyLink={() => handleCopyLink()}
          />
        ))}
      </div>
    </div>
  );
}
