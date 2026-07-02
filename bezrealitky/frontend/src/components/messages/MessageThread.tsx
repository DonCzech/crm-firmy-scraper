'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

interface Props {
  messages: any[];
  currentUserId: string;
  conversationId: string | null;
  onSend: (content: string) => void;
}

export function MessageThread({ messages, currentUserId, conversationId, onSend }: Props) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !conversationId) return;
    onSend(text);
    setText('');
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Vyberte konverzaci</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: any) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[70%] rounded-2xl px-4 py-2 text-sm',
                isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm',
              )}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Napište zprávu..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button onClick={handleSend} disabled={!text.trim()} className="btn-primary px-3">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
