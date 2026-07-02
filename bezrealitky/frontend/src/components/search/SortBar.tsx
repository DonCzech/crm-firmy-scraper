'use client';

import { useSearchStore } from '@/store/search.store';

const OPTIONS = [
  { label: 'Nejnovější', field: 'createdAt', dir: 'desc' },
  { label: 'Nejlevnější', field: 'price', dir: 'asc' },
  { label: 'Nejdražší', field: 'price', dir: 'desc' },
  { label: 'Největší plocha', field: 'area', dir: 'desc' },
];

export function SortBar() {
  const { sortField, sortDir, setSort } = useSearchStore();
  const current = OPTIONS.findIndex((o) => o.field === sortField && o.dir === sortDir);

  return (
    <select
      value={current}
      onChange={(e) => {
        const opt = OPTIONS[+e.target.value];
        setSort(opt.field, opt.dir as 'asc' | 'desc');
      }}
      className="input w-auto text-sm"
    >
      {OPTIONS.map((o, i) => (
        <option key={i} value={i}>{o.label}</option>
      ))}
    </select>
  );
}
