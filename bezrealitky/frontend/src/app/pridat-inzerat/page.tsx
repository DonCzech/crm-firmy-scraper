'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { CREATE_LISTING, PUBLISH_LISTING } from '@/graphql/mutations';
import { useAuthStore } from '@/store/auth.store';
import { ListingWizardStep1 } from '@/components/wizard/ListingWizardStep1';
import { ListingWizardStep2 } from '@/components/wizard/ListingWizardStep2';
import { ListingWizardStep3 } from '@/components/wizard/ListingWizardStep3';
import { ListingWizardStep4 } from '@/components/wizard/ListingWizardStep4';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const STEPS = ['Typ nemovitosti', 'Lokalita & cena', 'Popis & vybavení', 'Fotografie'];

export default function AddListingPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  // Wait for Zustand to hydrate from localStorage before checking auth
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !accessToken) {
      toast.error('Pro vložení inzerátu se musíte přihlásit.');
      router.push('/auth');
    }
  }, [mounted, isAuthenticated, accessToken, router]);

  const { mutateAsync: publishListing } = useMutation({
    mutationFn: (id: string) => getClient().request(PUBLISH_LISTING, { id }),
  });

  const handleDone = async () => {
    if (createdListingId) {
      try { await publishListing(createdListingId); } catch { /* ignore */ }
    }
    router.push('/ucet');
  };

  const { mutateAsync: createListing, isPending } = useMutation({
    mutationFn: (input: any) => getClient().request(CREATE_LISTING, { input }),
    onSuccess: (res: any) => {
      const id = (res as any)?.createListing?.id;
      setCreatedListingId(id ?? null);
      toast.success('Inzerát byl vytvořen! Nyní přidejte fotografie.');
      setStep(3);
    },
    onError: (e: any) => {
      console.error('createListing error:', e);
      const code = e?.response?.errors?.[0]?.extensions?.code;
      const msg = e?.response?.errors?.[0]?.message ?? e?.message;

      if (code === 'UNAUTHENTICATED' || msg === 'Unauthorized') {
        toast.error('Vaše přihlášení vypršelo. Přihlaste se znovu.');
        logout();
        router.push('/auth');
        return;
      }
      toast.error(msg ? `Chyba: ${msg}` : 'Chyba při vytváření inzerátu. Zkuste to znovu.');
    },
  });

  const updateData = (values: Record<string, any>) =>
    setData((prev) => ({ ...prev, ...values }));

  const handleNext = (values: Record<string, any>) => {
    const merged = { ...data, ...values };
    updateData(values);

    if (step === 2) {
      const input = {
        offerType: merged.offerType,
        estateType: merged.estateType,
        title: merged.title,
        description: merged.description,
        price: Number(merged.price),
        ...(merged.rooms && { rooms: merged.rooms }),
        ...(merged.area && { area: Number(merged.area) }),
        ...(merged.floor && { floor: Number(merged.floor) }),
        ...(merged.totalFloors && { totalFloors: Number(merged.totalFloors) }),
        ...(merged.furnished !== undefined && { furnished: Boolean(merged.furnished) }),
        ...(merged.parking !== undefined && { parking: Boolean(merged.parking) }),
        ...(merged.balcony !== undefined && { balcony: Boolean(merged.balcony) }),
        ...(merged.cellar !== undefined && { cellar: Boolean(merged.cellar) }),
        ...(merged.elevator !== undefined && { elevator: Boolean(merged.elevator) }),
        ...(merged.petFriendly !== undefined && { petFriendly: Boolean(merged.petFriendly) }),
        ...(merged.street && { street: merged.street }),
        city: merged.city,
        ...(merged.district && { district: merged.district }),
        ...(merged.region && { region: merged.region }),
        ...(merged.zip && { zip: merged.zip }),
      };
      createListing(input);
    } else if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  // Before hydration or while redirecting, show nothing meaningful
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Vložit inzerát</h1>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              i < step ? 'bg-primary-600 text-white' :
              i === step ? 'border-2 border-primary-600 text-primary-600' :
              'border-2 border-gray-200 text-gray-400',
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={cn('hidden text-xs sm:block truncate', i === step ? 'font-medium text-primary-700' : 'text-gray-400')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {step === 0 && <ListingWizardStep1 data={data} onNext={handleNext} />}
        {step === 1 && <ListingWizardStep2 data={data} onNext={handleNext} onBack={() => setStep(0)} />}
        {step === 2 && <ListingWizardStep3 data={data} onNext={handleNext} onBack={() => setStep(1)} isSubmitting={isPending} />}
        {step === 3 && <ListingWizardStep4 listingId={createdListingId} onDone={handleDone} />}
      </div>
    </div>
  );
}
