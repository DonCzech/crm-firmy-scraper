'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClient } from '@/lib/graphql-client';
import { MY_PROFILE, MY_SUBSCRIPTION, MY_LISTINGS, MY_INQUIRIES } from '@/graphql/queries';
import { UPDATE_PROFILE, CANCEL_SUBSCRIPTION, ARCHIVE_LISTING, MARK_INQUIRY_READ } from '@/graphql/mutations';
import { useAuthStore } from '@/store/auth.store';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { formatDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, CreditCard, LogOut, Home, Plus, Eye, Archive, Pencil, ChevronDown, ChevronUp, Mail, MailOpen } from 'lucide-react';

function isUnauthorized(e: any) {
  const code = e?.response?.errors?.[0]?.extensions?.code;
  const msg = e?.response?.errors?.[0]?.message ?? e?.message;
  return code === 'UNAUTHENTICATED' || msg === 'Unauthorized';
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, accessToken, logout } = useAuthStore();
  const qc = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !accessToken) {
      toast.error('Pro přístup k účtu se musíte přihlásit.');
      router.push('/auth');
    }
  }, [mounted, isAuthenticated, accessToken, router]);

  const handleUnauthorized = () => {
    toast.error('Vaše přihlášení vypršelo. Přihlaste se znovu.');
    logout();
    router.push('/auth');
  };

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getClient().request(MY_PROFILE),
    enabled: !!accessToken,
  });
  const { data: subData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getClient().request(MY_SUBSCRIPTION),
    enabled: !!accessToken,
  });

  const { data: listingsData, refetch: refetchListings } = useQuery({
    queryKey: ['myListings'],
    queryFn: () => getClient().request(MY_LISTINGS),
    enabled: !!accessToken,
  });

  const listings = (listingsData as any)?.myListings ?? [];

  const { data: inquiriesData, refetch: refetchInquiries } = useQuery({
    queryKey: ['myInquiries'],
    queryFn: () => getClient().request(MY_INQUIRIES),
    enabled: !!accessToken,
  });

  const inquiries = (inquiriesData as any)?.myInquiries ?? [];
  const unreadCount = inquiries.filter((i: any) => !i.read).length;

  const { mutateAsync: markRead } = useMutation({
    mutationFn: (id: string) => getClient().request(MARK_INQUIRY_READ, { id }),
    onSuccess: () => refetchInquiries(),
  });

  const { mutateAsync: archiveListing } = useMutation({
    mutationFn: (id: string) => getClient().request(ARCHIVE_LISTING, { id }),
    onSuccess: () => { refetchListings(); toast.success('Inzerát byl archivován.'); },
    onError: (e: any) => {
      if (isUnauthorized(e)) { handleUnauthorized(); return; }
      toast.error('Chyba při archivaci.');
    },
  });

  const profile = (profileData as any)?.myProfile;
  const subscription = (subData as any)?.mySubscription;

  const { register, handleSubmit } = useForm({ values: profile ?? {} });

  const { mutateAsync: updateProfile, isPending } = useMutation({
    mutationFn: ({ firstName, lastName, phone, bio, avatarUrl }: any) =>
      getClient().request(UPDATE_PROFILE, { input: { firstName, lastName, phone, bio, avatarUrl } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profil uložen.'); },
    onError: (e: any) => {
      if (isUnauthorized(e)) { handleUnauthorized(); return; }
      const msg = e?.response?.errors?.[0]?.message ?? e?.message;
      toast.error(msg ? `Chyba: ${msg}` : 'Chyba při ukládání profilu.');
    },
  });

  const { mutateAsync: cancelSub } = useMutation({
    mutationFn: () => getClient().request(CANCEL_SUBSCRIPTION),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription'] }); toast.success('Členství bude zrušeno na konci fakturačního období.'); },
    onError: (e: any) => {
      if (isUnauthorized(e)) { handleUnauthorized(); return; }
    },
  });

  const TIER_LABELS: Record<string, string> = { FREE: 'Základní', STANDARD: 'Standard', PREMIUM: 'Premium' };

  if (!mounted || !isAuthenticated || !accessToken) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          {!mounted ? 'Načítám...' : 'Přesměrovávám na přihlášení...'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Můj účet</h1>

      {/* Profile */}
      <div className="card p-6">
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <User size={20} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Osobní údaje</h2>
            {profile?.firstName && (
              <span className="text-sm text-gray-500">{profile.firstName} {profile.lastName}</span>
            )}
          </div>
          {profileOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {profileOpen && (
          <form onSubmit={handleSubmit((d) => updateProfile(d))} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Jméno</label>
                <input className="input" {...register('firstName')} placeholder="Jméno" />
              </div>
              <div>
                <label className="label">Příjmení</label>
                <input className="input" {...register('lastName')} placeholder="Příjmení" />
              </div>
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" {...register('phone')} placeholder="+420 000 000 000" />
            </div>
            <div>
              <label className="label">O sobě</label>
              <textarea className="input min-h-[80px]" {...register('bio')} placeholder="Krátké představení..." />
            </div>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? 'Ukládám...' : 'Uložit změny'}
            </button>
          </form>
        )}
      </div>

      {/* My Listings */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home size={20} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Moje inzeráty</h2>
          </div>
          <a href="/pridat-inzerat" className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3">
            <Plus size={14} /> Přidat inzerát
          </a>
        </div>
        {listings.length === 0 ? (
          <p className="text-sm text-gray-500">Zatím nemáte žádné inzeráty.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {listings.map((l: any) => (
              <li key={l.id} className="flex items-center gap-3 py-3">
                {l.media?.[0]?.url ? (
                  <img src={l.media[0].url} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <a href={`/inzerat/${l.slug}`} className="font-medium text-gray-900 hover:text-primary-700 truncate block">{l.title}</a>
                  <p className="text-sm text-gray-500">{l.city} · {l.price.toLocaleString('cs-CZ')} Kč</p>
                  <span className={`text-xs font-medium ${l.status === 'ACTIVE' ? 'text-green-600' : l.status === 'DRAFT' ? 'text-gray-400' : 'text-amber-500'}`}>
                    {l.status === 'ACTIVE' ? 'Aktivní' : l.status === 'DRAFT' ? 'Koncept' : l.status === 'ARCHIVED' ? 'Archivováno' : l.status}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a href={`/inzerat/${l.slug}`} className="btn-outline p-1.5" title="Zobrazit">
                    <Eye size={15} />
                  </a>
                  {l.status !== 'ARCHIVED' && (
                    <a href={`/inzerat/edit/${l.id}`} className="btn-outline p-1.5" title="Upravit">
                      <Pencil size={15} />
                    </a>
                  )}
                  {l.status !== 'ARCHIVED' && (
                    <button onClick={() => archiveListing(l.id)} className="btn-outline p-1.5 text-red-500 border-red-200 hover:bg-red-50" title="Archivovat">
                      <Archive size={15} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Inquiries */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail size={20} className="text-primary-600" />
          <h2 className="font-semibold text-gray-900">Zprávy od zájemců</h2>
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount} nové
            </span>
          )}
        </div>
        {inquiries.length === 0 ? (
          <p className="text-sm text-gray-500">Zatím žádné zprávy od zájemců.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {inquiries.map((inq: any) => (
              <li key={inq.id} className={`py-4 ${!inq.read ? 'bg-primary-50 -mx-6 px-6' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inq.read
                      ? <MailOpen size={16} className="text-gray-400 mt-0.5" />
                      : <Mail size={16} className="text-primary-600 mt-0.5" />
                    }
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        Zájemce — {inq.senderName}
                      </p>
                      <p className="text-xs text-gray-500">{inq.senderEmail}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatDate(inq.createdAt)}</p>
                    {inq.listing && (
                      <a href={`/inzerat/${inq.listing.slug}`} className="text-xs text-primary-600 hover:underline">
                        {inq.listing.title}
                      </a>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{inq.message}</p>
                {!inq.read && (
                  <button
                    onClick={() => markRead(inq.id)}
                    className="mt-2 text-xs text-primary-600 hover:underline"
                  >
                    Označit jako přečtené
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subscription */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-primary-600" />
          <h2 className="font-semibold text-gray-900">Členství</h2>
        </div>
        {subscription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Aktuální plán:</span>
              <span className="font-semibold text-primary-700">{TIER_LABELS[subscription.tier]}</span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Platí do:</span>
                <span>{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            )}
            {subscription.tier !== 'FREE' && !subscription.cancelAtPeriodEnd && (
              <button onClick={() => cancelSub()} className="btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50">
                Zrušit členství
              </button>
            )}
            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-amber-600">Členství bude zrušeno na konci tohoto období.</p>
            )}
            {subscription.tier === 'FREE' && (
              <a href="/cenik" className="btn-primary inline-block">Upgradovat na Standard / Premium</a>
            )}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Faktury</h2>
        <InvoiceTable />
      </div>

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="btn-outline text-red-600 border-red-200 hover:bg-red-50 gap-2"
      >
        <LogOut size={16} /> Odhlásit se
      </button>
    </div>
  );
}
