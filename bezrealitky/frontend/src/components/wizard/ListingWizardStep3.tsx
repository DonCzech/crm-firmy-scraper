'use client';

import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface Props {
  data: any;
  onNext: (d: any) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const TOGGLES = [
  { key: 'furnished', label: 'Zařízeno' },
  { key: 'parking', label: 'Parkování' },
  { key: 'balcony', label: 'Balkón / terasa' },
  { key: 'cellar', label: 'Sklep' },
  { key: 'elevator', label: 'Výtah' },
  { key: 'petFriendly', label: 'Domácí zvířata povolena' },
];

export function ListingWizardStep3({ data, onNext, onBack, isSubmitting }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues: data });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label className="label">Popis inzerátu *</label>
        <textarea
          className="input min-h-[150px]"
          {...register('description', { required: true })}
          placeholder="Popište nemovitost – stav, vybavení, dostupnost MHD, možnost parkování..."
        />
      </div>
      <div>
        <label className="label mb-2">Vybavení a vlastnosti</label>
        <div className="grid grid-cols-2 gap-2">
          {TOGGLES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition">
              <input type="checkbox" {...register(key)} className="rounded text-primary-600" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} disabled={isSubmitting} className="btn-outline flex-1">
          Zpět
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Vytváření inzerátu...
            </>
          ) : (
            'Pokračovat'
          )}
        </button>
      </div>
    </form>
  );
}
