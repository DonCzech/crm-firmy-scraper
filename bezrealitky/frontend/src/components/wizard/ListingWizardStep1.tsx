'use client';

import { useForm } from 'react-hook-form';

const OFFER_TYPES = [{ value: 'RENT', label: 'Pronájem', desc: 'Hledám nájemníka.' }, { value: 'SALE', label: 'Prodej', desc: 'Chci prodat nemovitost.' }];
const ESTATE_TYPES = [
  { value: 'APARTMENT', label: 'Byt', icon: '🏢' },
  { value: 'HOUSE', label: 'Dům', icon: '🏡' },
  { value: 'LAND', label: 'Pozemek', icon: '🌿' },
  { value: 'COMMERCIAL', label: 'Komerční', icon: '🏪' },
  { value: 'GARAGE', label: 'Garáž', icon: '🚗' },
  { value: 'OTHER', label: 'Ostatní', icon: '📦' },
];

export function ListingWizardStep1({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: data });
  const offerType = watch('offerType');
  const estateType = watch('estateType');

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="label mb-3">Typ nabídky</label>
        <div className="grid grid-cols-2 gap-3">
          {OFFER_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue('offerType', t.value)}
              className={`rounded-xl border-2 p-4 text-left transition ${offerType === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <p className="font-semibold text-gray-900">{t.label}</p>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label mb-3">Typ nemovitosti</label>
        <div className="grid grid-cols-3 gap-3">
          {ESTATE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setValue('estateType', t.value)}
              className={`rounded-xl border-2 p-3 text-center transition ${estateType === t.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <p className="text-sm font-medium text-gray-900">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={!offerType || !estateType} className="btn-primary w-full py-3">
        Pokračovat
      </button>
    </form>
  );
}
