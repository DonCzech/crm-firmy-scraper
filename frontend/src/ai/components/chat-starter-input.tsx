import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StarterModelOption } from "@/ai/types";
import { CHAT_STARTER_MODEL_OPTIONS } from "@/ai/mock";
import { cn } from "@/lib/utils";
import {
  Paperclip,
  Send,
  ChevronDown,
  Check,
  Search,
  BookOpen,
  Image,
  Mic,
} from "lucide-react";

interface ChatStarterInputProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  selectedModel: StarterModelOption;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  compact?: boolean;
}

// Action chips shown below input (like ChatGPT)
const ACTIONS = [
  { id: "search",  label: "Hledat",   icon: Search },
  { id: "study",   label: "Studovat", icon: BookOpen },
  { id: "image",   label: "Obrázek",  icon: Image },
  { id: "voice",   label: "Hlas",     icon: Mic },
];

export function ChatStarterInput({
  message,
  onMessageChange,
  onSend,
  selectedModel,
  selectedModelId,
  onModelChange,
  compact = false,
}: ChatStarterInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Auto-grow textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  };

  // Group models
  const groups = CHAT_STARTER_MODEL_OPTIONS.reduce<Record<string, StarterModelOption[]>>(
    (acc, m) => {
      const key = m.group ?? "Nastavení";
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {}
  );
  const groupOrder = Object.keys(groups);

  return (
    <div className={cn("w-full", !compact && "max-w-3xl mx-auto")}>
      {/* Main input box */}
      <div className="relative flex flex-col bg-background border border-input rounded-3xl shadow-sm overflow-hidden focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Zeptejte se na cokoli"
          rows={1}
          className="flex-1 resize-none border-0 bg-transparent px-5 pt-4 pb-2 text-sm placeholder:text-muted-foreground focus:outline-none leading-6 min-h-[52px] max-h-[180px]"
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          {/* Left: model selector + attach */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 rounded-full text-xs font-medium gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {React.createElement(selectedModel.icon, { className: "size-3.5" })}
                  <span>{selectedModel.name}</span>
                  <ChevronDown className="size-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-68" side="top">
                {groupOrder.map((group, gi) => (
                  <React.Fragment key={group}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wide px-3 py-1.5">
                      {group}
                    </DropdownMenuLabel>
                    {groups[group].map((model) => {
                      const Icon = model.icon;
                      const isSelected = model.id === selectedModelId;
                      return (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => !model.locked && !model.customize && onModelChange?.(model.id)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                            model.locked && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{model.name}</div>
                            {model.description && (
                              <div className="text-xs text-muted-foreground truncate">{model.description}</div>
                            )}
                          </div>
                          {model.customize && (
                            <Button variant="outline" size="sm" className="h-5 px-2 text-xs" onClick={(e) => e.stopPropagation()}>
                              Customize
                            </Button>
                          )}
                          {isSelected && !model.locked && !model.customize && (
                            <Check className="size-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Připojit soubor"
            >
              <Paperclip className="size-4" />
            </Button>
          </div>

          {/* Right: send */}
          <Button
            variant={message.trim() ? "default" : "secondary"}
            size="icon"
            className={cn(
              "size-9 rounded-full shrink-0 transition-all",
              !message.trim() && "opacity-40"
            )}
            onClick={onSend}
            disabled={!message.trim()}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>

      {/* Action chips — only on start page (not compact) */}
      {!compact && (
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          {ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="h-8 px-3.5 rounded-full text-xs gap-1.5 text-muted-foreground hover:text-foreground border-input"
            >
              <action.icon className="size-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
