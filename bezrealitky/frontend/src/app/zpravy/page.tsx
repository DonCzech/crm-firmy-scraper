'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { MY_CONVERSATIONS, CONVERSATION_MESSAGES, MY_INQUIRIES } from '@/graphql/queries';
import { SEND_MESSAGE, MARK_INQUIRY_READ } from '@/graphql/mutations';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MessageSquare, Mail, MailOpen, BadgeCheck, Phone, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ItemType = 'inquiry' | 'conversation';

interface UnifiedItem {
  id: string;
  type: ItemType;
  name: string;
  preview: string;
  date: string;
  unread: boolean;
  verified: boolean;
  email: string | null;
  phone: string | null;
  raw: any;
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ItemType | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: inquiriesData } = useQuery({
    queryKey: ['myInquiries'],
    queryFn: () => getClient().request(MY_INQUIRIES),
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });
  const inquiries: any[] = (inquiriesData as any)?.myInquiries ?? [];

  const { mutateAsync: markRead } = useMutation({
    mutationFn: (id: string) => getClient().request(MARK_INQUIRY_READ, { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myInquiries'] }),
  });

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getClient().request(MY_CONVERSATIONS),
    enabled: isAuthenticated,
    refetchInterval: 10_000,
  });
  const conversations: any[] = (convData as any)?.myConversations ?? [];

  const activeConvId = activeType === 'conversation' ? activeId : null;
  const { data: msgData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => getClient().request(CONVERSATION_MESSAGES, { conversationId: activeConvId }),
    enabled: !!activeConvId,
    refetchInterval: 5_000,
  });
  const messages: any[] = (msgData as any)?.conversationMessages ?? [];

  const { mutateAsync: sendMessage, isPending: isSending } = useMutation({
    mutationFn: ({ conversationId, content }: any) =>
      getClient().request(SEND_MESSAGE, { conversationId, content }),
    onSuccess: () => { refetchMessages(); setReplyText(''); },
    onError: () => toast.error('Nepodařilo se odeslat zprávu.'),
  });

  const unifiedItems: UnifiedItem[] = [
    ...inquiries.map((inq: any): UnifiedItem => ({
      id: inq.id,
      type: 'inquiry',
      name: inq.senderName,
      preview: inq.message,
      date: inq.createdAt,
      unread: !inq.read,
      verified: false,
      email: inq.senderEmail,
      phone: inq.senderPhone ?? null,
      raw: inq,
    })),
    ...conversations.map((conv: any): UnifiedItem => {
      const lastMsg = conv.messages?.[0];
      const iAmA = user?.id === conv.participantAId;
      const otherEmail = iAmA ? conv.participantBEmail : conv.participantAEmail;
      const otherName = iAmA ? conv.participantBName : conv.participantAName;
      const otherPhone = iAmA ? conv.participantBPhone : conv.participantAPhone;
      return {
        id: conv.id,
        type: 'conversation',
        name: otherName ?? otherEmail ?? 'Uživatel',
        preview: lastMsg?.content ?? '',
        date: conv.updatedAt ?? lastMsg?.createdAt ?? '',
        unread: false,
        verified: true,
        email: otherEmail ?? null,
        phone: otherPhone ?? null,
        raw: conv,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeItem = activeId ? unifiedItems.find((i) => i.id === activeId) ?? null : null;

  const handleSelect = (item: UnifiedItem) => {
    setActiveId(item.id);
    setActiveType(item.type);
    setReplyText('');
    if (item.type === 'inquiry' && item.unread) markRead(item.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <MessageSquare className="text-primary-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Zprávy</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-20 text-center">
          <MessageSquare size={48} className="mb-4 text-gray-300" />
          <p className="mb-1 font-semibold text-gray-700">Pro zobrazení zpráv se přihlaste</p>
          <p className="mb-6 text-sm text-gray-400">Zprávy jsou dostupné pouze přihlášeným uživatelům.</p>
          <Link href="/auth" className="btn-primary px-6 py-2">Přihlásit se</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <MessageSquare className="text-primary-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Zprávy</h1>
      </div>

      <div className="flex border border-gray-200 rounded-xl overflow-hidden min-h-[580px]">

        {/* Left panel */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-y-auto">
          {unifiedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 p-6 text-center">
              <MessageSquare size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Zatím žádné zprávy</p>
            </div>
          ) : (
            unifiedItems.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-gray-100 transition hover:bg-gray-50',
                  activeId === item.id && 'bg-primary-50 border-l-2 border-l-primary-500',
                  item.unread && activeId !== item.id && 'bg-red-50',
                )}
              >
                <div className="flex items-center gap-2">
                  {item.type === 'inquiry'
                    ? (item.unread
                        ? <Mail size={13} className="text-red-500 flex-shrink-0" />
                        : <MailOpen size={13} className="text-gray-400 flex-shrink-0" />)
                    : <MessageSquare size={13} className="text-primary-500 flex-shrink-0" />
                  }
                  <p className={cn('text-sm truncate flex-1', item.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                    {item.name}
                  </p>
                  {item.verified && <BadgeCheck size={14} className="text-primary-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5 pl-5">{item.preview}</p>
                <p className="text-xs text-gray-300 mt-0.5 pl-5">{formatDate(item.date)}</p>
              </button>
            ))
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeItem ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900">
                    {activeItem.type === 'inquiry' ? activeItem.raw.senderName : activeItem.name}
                  </h2>
                  {activeItem.verified
                    ? <BadgeCheck size={16} className="text-primary-500" />
                    : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"><UserX size={11} /> Neregistrovaný uživatel</span>
                  }
                </div>
                {activeItem.type === 'inquiry' && activeItem.raw.listing && (
                  <a href={`/inzerat/${activeItem.raw.listing.slug}`} className="mt-0.5 inline-block text-xs text-primary-600 hover:underline">
                    🏠 {activeItem.raw.listing.title}
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(activeItem.date)}</p>
              </div>

              {/* INQUIRY — contact info + message, no reply buttons */}
              {activeItem.type === 'inquiry' && (
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Kontakt</p>
                    {activeItem.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={15} className="text-gray-400 flex-shrink-0" />
                        <span>{activeItem.email}</span>
                      </div>
                    )}
                    {activeItem.raw.senderPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={15} className="text-gray-400 flex-shrink-0" />
                        <span>{activeItem.raw.senderPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[72%] bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                      {activeItem.raw.message}
                    </div>
                  </div>
                </div>
              )}

              {/* CONVERSATION — contact bar + chat */}
              {activeItem.type === 'conversation' && (
                <>
                  {/* Contact info bar (same style as inquiry) */}
                  <div className="border-b border-gray-100 px-5 py-3 bg-gray-50">
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Jméno</span>
                        <span>{activeItem.name}</span>
                      </div>
                      {activeItem.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail size={14} className="text-gray-400 flex-shrink-0" />
                          <span>{activeItem.email}</span>
                        </div>
                      )}
                      {activeItem.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          <span>{activeItem.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                    {messages.map((msg: any) => {
                      const isMine = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            'max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                            isMine
                              ? 'bg-primary-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm',
                          )}>
                            <p>{msg.content}</p>
                            <p className={cn('mt-1 text-[10px]', isMine ? 'text-primary-200 text-right' : 'text-gray-400')}>
                              {formatDate(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 px-4 py-3 flex items-end gap-2">
                    <textarea
                      rows={1}
                      className="flex-1 resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-primary-400 transition"
                      placeholder="Napište zprávu…"
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyText.trim()) sendMessage({ conversationId: activeId, content: replyText });
                        }
                      }}
                      style={{ maxHeight: '120px' }}
                    />
                    <button
                      onClick={() => { if (replyText.trim()) sendMessage({ conversationId: activeId, content: replyText }); }}
                      disabled={isSending}
                      className="btn-primary px-4 py-2 text-sm flex-shrink-0"
                    >
                      {isSending ? 'Odesílám…' : 'Odeslat'}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <MessageSquare size={40} className="mb-3 opacity-20" />
              <p className="text-sm">Vyberte zprávu ze seznamu vlevo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
