'use client';

import { useForm } from 'react-hook-form';

interface Props { data: any; onNext: (d: any) => void; onBack: () => void; }

export function ListingWizardStep2({ data, onNext, onBack }: Props) {
  const { register, handleSubmit } = useForm({ defaultValues: data });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label className="label">Název inzerátu *</label>
        <input className="input" {...register('title', { required: true })} placeholder="Např. Pronájem bytu 2+kk, Praha 2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Cena (Kč) *</label>
          <input className="input" type="number" {...register('price', { required: true, valueAsNumber: true })} placeholder="15000" />
        </div>
        <div>
          <label className="label">Dispozice</label>
          <select className="input" {...register('rooms')}>
            {['1+kk','1+1','2+kk','2+1','3+kk','3+1','4+kk','4+1','5+'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Plocha (m²)</label>
          <input className="input" type="number" {...register('area', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Patro</label>
          <input className="input" type="number" {...register('floor', { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Ulice</label>
          <input className="input" {...register('street')} placeholder="Václavské náměstí 1" />
        </div>
        <div>
          <label className="label">Město *</label>
          <input className="input" {...register('city', { required: true })} placeholder="Praha" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Okres / MČ</label>
          <input className="input" {...register('district')} placeholder="Praha 2" />
        </div>
        <div>
          <label className="label">PSČ</label>
          <input className="input" {...register('zip')} placeholder="120 00" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-outline flex-1">Zpět</button>
        <button type="submit" className="btn-primary flex-1">Pokračovat</button>
      </div>
    </form>
  );
}
