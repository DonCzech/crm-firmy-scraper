'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { CREATE_INQUIRY, CREATE_CONVERSATION } from '@/graphql/mutations';
import toast from 'react-hot-toast';
import { MessageSquare, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function ContactOwnerCTA({ listing }: { listing: any }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Logged-in: just message
  const [message, setMessage] = useState('');

  // Anonymous: full form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [anonMessage, setAnonMessage] = useState('');
  const [sent, setSent] = useState(false);

  const { mutateAsync: startConversation, isPending: isPendingConv } = useMutation({
    mutationFn: () =>
      getClient().request(CREATE_CONVERSATION, {
        recipientId: listing.ownerId,
        listingId: listing.id,
        message,
      }),
    onSuccess: () => router.push('/zpravy'),
    onError: () => toast.error('Nepodařilo se zahájit konverzaci.'),
  });

  const { mutateAsync: sendInquiry, isPending: isPendingInq } = useMutation({
    mutationFn: () =>
      getClient().request(CREATE_INQUIRY, {
        input: {
          listingId: listing.id,
          senderName: name,
          senderEmail: email,
          senderPhone: phone || undefined,
          message: anonMessage,
        },
      }),
    onSuccess: () => setSent(true),
    onError: () => toast.error('Chyba při odesílání zprávy. Zkuste to znovu.'),
  });

  if (sent) {
    return (
      <div className="card p-5 text-center space-y-3">
        <div className="text-4xl">✅</div>
        <p className="font-semibold text-gray-900">Zpráva odeslána</p>
        <p className="text-sm text-gray-500">Prodejce vás bude kontaktovat na váš e-mail.</p>
        <p className="text-xs text-gray-400">
          Pro sledování konverzace se{' '}
          <Link href="/auth" className="text-primary-600 hover:underline">zaregistrujte</Link>.
        </p>
      </div>
    );
  }

  /* ── Přihlášený uživatel → Conversation ── */
  if (isAuthenticated) {
    return (
      <div className="card p-5 sticky top-24">
        <h3 className="mb-4 font-semibold text-gray-900">Napsat prodejci</h3>
        <div className="mb-3">
          <label className="label">Zpráva *</label>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="Dobrý den, mám zájem o váš inzerát..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            if (!message.trim()) { toast.error('Napište zprávu.'); return; }
            startConversation();
          }}
          disabled={isPendingConv}
          className="btn-primary w-full gap-2"
        >
          <MessageSquare size={16} />
          {isPendingConv ? 'Odesílám...' : 'Zahájit konverzaci'}
        </button>
        <p className="mt-2 text-xs text-gray-400 text-center">
          Zpráva bude dostupná v sekci Zprávy.
        </p>
      </div>
    );
  }

  /* ── Nepřihlášený uživatel → Inquiry ── */
  return (
    <div className="card p-5 sticky top-24">
      <h3 className="mb-1 font-semibold text-gray-900">Napsat prodejci</h3>
      <p className="mb-4 text-xs text-gray-400">
        Nebo se{' '}
        <Link href="/auth" className="text-primary-600 hover:underline">přihlaste</Link>{' '}
        pro plnohodnotnou konverzaci.
      </p>

      <div className="space-y-3 mb-3">
        <div>
          <label className="label">Jméno a příjmení *</label>
          <input className="input" placeholder="Jan Novák" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">E-mail *</label>
          <input className="input" type="email" placeholder="jan@example.cz" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" type="tel" placeholder="+420 123 456 789" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Zpráva *</label>
          <textarea
            className="input min-h-[90px] resize-none"
            placeholder="Dobrý den, mám zájem o váš inzerát..."
            value={anonMessage}
            onChange={(e) => setAnonMessage(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={() => {
          if (!name.trim()) { toast.error('Vyplňte jméno a příjmení.'); return; }
          if (!email.trim()) { toast.error('Vyplňte e-mail.'); return; }
          if (!anonMessage.trim()) { toast.error('Napište zprávu.'); return; }
          sendInquiry();
        }}
        disabled={isPendingInq}
        className="btn-primary w-full gap-2"
      >
        <MessageSquare size={16} />
        {isPendingInq ? 'Odesílám...' : 'Odeslat zprávu'}
      </button>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <LogIn size={14} className="text-primary-500 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          <Link href="/auth" className="text-primary-600 font-medium hover:underline">Přihlaste se</Link>{' '}
          a sledujte konverzaci přímo v aplikaci.
        </p>
      </div>
    </div>
  );
}
