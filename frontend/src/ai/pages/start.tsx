"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessages } from "@/ai/components/chat-messages";
import { ChatStarterInput } from "@/ai/components/chat-starter-input";
import { Message, StarterPersona } from "@/ai/types";
import { streamChat, createConversation } from "@/ai/services/api";
import { useChats } from "@/ai/layout/components/chats-context";
import { CHAT_STARTER_MODEL_OPTIONS, CHAT_STARTER_PERSONAS } from "@/ai/mock";

export function AIStartPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>("auto");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { refreshChats } = useChats();

  const selectedModel =
    CHAT_STARTER_MODEL_OPTIONS.find((m) => m.id === selectedModelId) ??
    CHAT_STARTER_MODEL_OPTIONS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let convId = conversationId;
    if (!convId) {
      try {
        const conv = await createConversation(content.slice(0, 60), selectedModelId);
        convId = conv.id;
        setConversationId(convId);
        refreshChats?.();
      } catch { /* proceed without saving */ }
    }

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      await streamChat(content.trim(), {
        conversationId: convId ?? undefined,
        model: selectedModelId,
        history: messages.filter((m) => m.content).map((m) => ({ role: m.role, content: m.content })),
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
          );
        },
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: `⚠️ ${err}`, isStreaming: false } : m)
          );
        },
      });
    } finally {
      setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m));
      setIsLoading(false);
      refreshChats?.();
    }
  }, [isLoading, conversationId, selectedModelId, messages, refreshChats]);

  const handleSend = () => {
    if (message.trim()) {
      handleSendMessage(message);
      setMessage("");
    }
  };

  const handlePersonaSelect = (persona: StarterPersona) => {
    handleSendMessage(`Jednej jako ${persona.name}. ${persona.description}`);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] px-4 pb-4">
            <h1 className="text-2xl font-semibold mb-1 text-center">
              S čím ti mohu dnes pomoci?
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Jsem tady pro zodpovězení otázek nebo pomoc s jakýmkoliv úkolem.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-lg">
              {CHAT_STARTER_PERSONAS.map((persona) => {
                const Icon = persona.icon;
                return (
                  <button
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-input bg-background hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="size-3.5" />
                    <span>{persona.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="w-full max-w-2xl px-4">
              <ChatStarterInput
                message={message}
                onMessageChange={setMessage}
                onSend={handleSend}
                selectedModel={selectedModel}
                selectedModelId={selectedModelId}
                onModelChange={setSelectedModelId}
                compact={false}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full pt-6 pb-2">
            <ChatMessages messages={messages} />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky input when chatting */}
      {hasMessages && (
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="max-w-2xl mx-auto">
            <ChatStarterInput
              message={message}
              onMessageChange={setMessage}
              onSend={handleSend}
              selectedModel={selectedModel}
              selectedModelId={selectedModelId}
              onModelChange={setSelectedModelId}
              compact={true}
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              AI může dělat chyby. Ověřujte důležité informace.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
