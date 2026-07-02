'use client';

import { useForm } from 'react-hook-form';

const ROOMS = ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+'];

interface Props {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  defaults?: any;
}

export function WatchdogForm({ onSubmit, isLoading, defaults }: Props) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: defaults });
  const selectedRooms: string[] = watch('rooms') ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Název hlídacího psa (volitelné)</label>
        <input className="input" {...register('name')} placeholder="Např. Byt Praha 2+kk" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Typ nabídky</label>
          <select className="input" {...register('offerType')}>
            <option value="">Vše</option>
            <option value="RENT">Pronájem</option>
            <option value="SALE">Prodej</option>
          </select>
        </div>
        <div>
          <label className="label">Typ nemovitosti</label>
          <select className="input" {...register('estateType')}>
            <option value="">Vše</option>
            <option value="APARTMENT">Byt</option>
            <option value="HOUSE">Dům</option>
            <option value="LAND">Pozemek</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Město / lokalita</label>
        <input className="input" {...register('city')} placeholder="Praha, Brno..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Cena od (Kč)</label>
          <input className="input" type="number" {...register('priceMin', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Cena do (Kč)</label>
          <input className="input" type="number" {...register('priceMax', { valueAsNumber: true })} />
        </div>
      </div>
      <div>
        <label className="label">Dispozice</label>
        <div className="flex flex-wrap gap-2">
          {ROOMS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                setValue(
                  'rooms',
                  selectedRooms.includes(r) ? selectedRooms.filter((x) => x !== r) : [...selectedRooms, r],
                )
              }
              className={`rounded-lg border px-3 py-1 text-sm transition ${
                selectedRooms.includes(r) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" disabled={isLoading} className="btn-primary">
        {isLoading ? 'Ukládám...' : 'Přidat hlídacího psa'}
      </button>
    </form>
  );
}
