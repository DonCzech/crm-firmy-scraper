'use client';

import { useState } from 'react';
import { useSearchStore } from '@/store/search.store';
import { SlidersHorizontal, X } from 'lucide-react';

const ROOMS = ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+'];

export function FilterDrawer() {
  const [open, setOpen] = useState(false);
  const { filters, setFilters, resetFilters } = useSearchStore();

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-outline gap-2 text-sm">
        <SlidersHorizontal size={16} />
        Filtry
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-gray-900">Filtry</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-6">
              {/* Price */}
              <div>
                <h3 className="label mb-2">Cena (Kč)</h3>
                <div className="flex gap-2">
                  <input className="input" type="number" placeholder="Od" value={filters.priceMin ?? ''} onChange={(e) => setFilters({ priceMin: +e.target.value || undefined })} />
                  <input className="input" type="number" placeholder="Do" value={filters.priceMax ?? ''} onChange={(e) => setFilters({ priceMax: +e.target.value || undefined })} />
                </div>
              </div>

              {/* Area */}
              <div>
                <h3 className="label mb-2">Plocha (m²)</h3>
                <div className="flex gap-2">
                  <input className="input" type="number" placeholder="Od" value={filters.areaMin ?? ''} onChange={(e) => setFilters({ areaMin: +e.target.value || undefined })} />
                  <input className="input" type="number" placeholder="Do" value={filters.areaMax ?? ''} onChange={(e) => setFilters({ areaMax: +e.target.value || undefined })} />
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h3 className="label mb-2">Dispozice</h3>
                <div className="flex flex-wrap gap-2">
                  {ROOMS.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        const cur = filters.rooms ?? [];
                        setFilters({ rooms: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] });
                      }}
                      className={`rounded-lg border px-3 py-1 text-sm transition ${
                        filters.rooms?.includes(r)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div>
                <h3 className="label mb-2">Vybavení</h3>
                <div className="space-y-2">
                  {[
                    { key: 'furnished', label: 'Zařízeno' },
                    { key: 'parking', label: 'Parkování' },
                    { key: 'balcony', label: 'Balkon / terasa' },
                    { key: 'petFriendly', label: 'Domácí zvířata' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!(filters as any)[key]}
                        onChange={(e) => setFilters({ [key]: e.target.checked || undefined } as any)}
                        className="rounded text-primary-600"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t p-5 flex gap-3">
              <button onClick={resetFilters} className="btn-outline flex-1">Resetovat</button>
              <button onClick={() => setOpen(false)} className="btn-primary flex-1">Použít filtry</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
