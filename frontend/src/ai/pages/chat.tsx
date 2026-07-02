"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import { ChatMessages } from "@/ai/components/chat-messages";
import { ChatStarterInput } from "@/ai/components/chat-starter-input";
import { Message } from "@/ai/types";
import { streamChat, getConversation } from "@/ai/services/api";
import { useChats } from "@/ai/layout/components/chats-context";
import { CHAT_STARTER_MODEL_OPTIONS } from "@/ai/mock";

export function AIChatPage() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");
  const [selectedModelId, setSelectedModelId] = useState<string>("auto");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { refreshChats } = useChats();

  const selectedModel =
    CHAT_STARTER_MODEL_OPTIONS.find((m) => m.id === selectedModelId) ??
    CHAT_STARTER_MODEL_OPTIONS[0];

  useEffect(() => {
    if (!chatId) return;
    getConversation(chatId).then((conv) => {
      if (!conv) return;
      setSelectedModelId(conv.model || "auto");
      setMessages(
        conv.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))
      );
    });
  }, [chatId]);

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

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      await streamChat(content.trim(), {
        conversationId: chatId ?? undefined,
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
  }, [isLoading, chatId, selectedModelId, messages, refreshChats]);

  const handleSend = () => {
    if (message.trim()) {
      handleSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full pt-6 pb-2">
          <ChatMessages messages={messages} />
          <div ref={messagesEndRef} />
        </div>
      </div>

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
    </div>
  );
}
