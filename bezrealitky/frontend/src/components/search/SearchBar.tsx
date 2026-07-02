'use client';

import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/store/search.store';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const OFFER_TYPES = [{ value: 'RENT', label: 'Pronájem' }, { value: 'SALE', label: 'Prodej' }];
const ESTATE_TYPES = [
  { value: 'APARTMENT', label: 'Byt' },
  { value: 'HOUSE', label: 'Dům' },
  { value: 'LAND', label: 'Pozemek' },
  { value: 'COMMERCIAL', label: 'Komerční' },
];

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { filters, setFilters } = useSearchStore();

  const handleSearch = () => router.push('/vyhledat');

  return (
    <div className={cn('flex flex-wrap gap-2', compact ? 'items-center' : '')}>
      {/* Offer type */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {OFFER_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilters({ offerType: t.value as any })}
            className={cn(
              'px-4 py-2 text-sm font-medium transition',
              filters.offerType === t.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Estate type */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {ESTATE_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilters({ estateType: t.value as any })}
            className={cn(
              'px-4 py-2 text-sm font-medium transition',
              filters.estateType === t.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* City */}
      <input
        className="input flex-1 min-w-[180px]"
        placeholder="Město nebo lokalita..."
        value={filters.city ?? ''}
        onChange={(e) => setFilters({ city: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      <button onClick={handleSearch} className="btn-primary px-5 gap-2">
        <Search size={16} />
        {!compact && 'Hledat'}
      </button>
    </div>
  );
}
