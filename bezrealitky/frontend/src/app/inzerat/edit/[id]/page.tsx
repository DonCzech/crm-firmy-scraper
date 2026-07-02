'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getClient } from '@/lib/graphql-client';
import { useAuthStore } from '@/store/auth.store';
import { GET_LISTING_BY_ID } from '@/graphql/queries';
import { UPDATE_LISTING, PUBLISH_LISTING } from '@/graphql/mutations';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const OFFER_TYPES = [{ value: 'RENT', label: 'Pronájem' }, { value: 'SALE', label: 'Prodej' }];
const ESTATE_TYPES = [
  { value: 'APARTMENT', label: 'Byt' }, { value: 'HOUSE', label: 'Dům' },
  { value: 'LAND', label: 'Pozemek' }, { value: 'COMMERCIAL', label: 'Komerční' },
  { value: 'GARAGE', label: 'Garáž' }, { value: 'OTHER', label: 'Jiné' },
];
const ROOMS = ['1+kk','1+1','2+kk','2+1','3+kk','3+1','4+kk','4+1','5+kk','5+1','6+','atypický'];

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, accessToken, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !accessToken) { router.push('/auth'); }
  }, [mounted, isAuthenticated, accessToken, router]);

  const { data: listingData } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getClient().request(GET_LISTING_BY_ID, { id }),
    enabled: !!id,
  });

  const listing = (listingData as any)?.listing;

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (listing) reset(listing);
  }, [listing, reset]);

  const { mutateAsync: updateListing, isPending } = useMutation({
    mutationFn: (input: any) => getClient().request(UPDATE_LISTING, { id, input }),
    onSuccess: () => {
      toast.success('Inzerát byl uložen.');
      router.push('/ucet');
    },
    onError: (e: any) => {
      const msg = e?.response?.errors?.[0]?.message ?? e?.message;
      toast.error(msg ? `Chyba: ${msg}` : 'Chyba při ukládání.');
    },
  });

  const { mutateAsync: publishListing, isPending: isPublishing } = useMutation({
    mutationFn: () => getClient().request(PUBLISH_LISTING, { id }),
    onSuccess: () => { toast.success('Inzerát byl publikován.'); router.push('/ucet'); },
    onError: (e: any) => toast.error(e?.response?.errors?.[0]?.message ?? 'Chyba při publikování.'),
  });

  const onSubmit = (data: any) => {
    const input = {
      offerType: data.offerType,
      estateType: data.estateType,
      title: data.title,
      description: data.description,
      price: Number(data.price),
      ...(data.area && { area: Number(data.area) }),
      ...(data.floor && { floor: Number(data.floor) }),
      ...(data.totalFloors && { totalFloors: Number(data.totalFloors) }),
      ...(data.rooms && { rooms: data.rooms }),
      furnished: Boolean(data.furnished),
      parking: Boolean(data.parking),
      balcony: Boolean(data.balcony),
      cellar: Boolean(data.cellar),
      elevator: Boolean(data.elevator),
      petFriendly: Boolean(data.petFriendly),
      ...(data.street && { street: data.street }),
      city: data.city,
      ...(data.district && { district: data.district }),
      ...(data.region && { region: data.region }),
      ...(data.zip && { zip: data.zip }),
    };
    updateListing(input);
  };

  if (!mounted || !isAuthenticated || !accessToken) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-gray-500">Načítám...</p></div>;
  }

  if (!listing) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-gray-500">Načítám inzerát...</p></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-outline p-2"><ArrowLeft size={18} /></button>
        <h1 className="text-2xl font-bold text-gray-900">Upravit inzerát</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Základní informace</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Typ nabídky</label>
              <select className="input" {...register('offerType')}>
                {OFFER_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Typ nemovitosti</label>
              <select className="input" {...register('estateType')}>
                {ESTATE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Název inzerátu</label>
            <input className="input" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="label">Popis</label>
            <textarea className="input min-h-[120px]" {...register('description', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cena (Kč)</label>
              <input className="input" type="number" {...register('price', { required: true })} />
            </div>
            <div>
              <label className="label">Plocha (m²)</label>
              <input className="input" type="number" {...register('area')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Dispozice</label>
              <select className="input" {...register('rooms')}>
                <option value="">—</option>
                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Podlaží</label>
              <input className="input" type="number" {...register('floor')} />
            </div>
            <div>
              <label className="label">Celkem podlaží</label>
              <input className="input" type="number" {...register('totalFloors')} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-1">
            {[['furnished','Zařízeno'],['parking','Parkování'],['balcony','Balkón'],['cellar','Sklep'],['elevator','Výtah'],['petFriendly','Zvířata OK']].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded" {...register(name)} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Lokalita</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ulice</label>
              <input className="input" {...register('street')} placeholder="Ulice a číslo" />
            </div>
            <div>
              <label className="label">Město *</label>
              <input className="input" {...register('city', { required: true })} />
            </div>
            <div>
              <label className="label">Okres</label>
              <input className="input" {...register('district')} />
            </div>
            <div>
              <label className="label">Kraj</label>
              <input className="input" {...register('region')} />
            </div>
            <div>
              <label className="label">PSČ</label>
              <input className="input" {...register('zip')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {listing.status === 'DRAFT' && (
            <button
              type="button"
              onClick={() => publishListing()}
              disabled={isPublishing}
              className="btn-outline flex-1 flex items-center justify-center gap-2"
            >
              {isPublishing ? 'Publikuji...' : 'Publikovat inzerát'}
            </button>
          )}
          <button type="submit" disabled={isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save size={16} /> {isPending ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </div>
      </form>
    </div>
  );
}
