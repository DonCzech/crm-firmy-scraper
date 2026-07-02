import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, pages, total, onPage }: Props) {
  if (pages <= 1) return null;

  const getPages = () => {
    const arr: (number | '...')[] = [];
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    arr.push(1);
    if (page > 3) arr.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) arr.push(i);
    if (page < pages - 2) arr.push('...');
    arr.push(pages);
    return arr;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn-ghost p-2 disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={cn(
              'h-9 w-9 rounded-lg text-sm font-medium transition',
              page === p
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className="btn-ghost p-2 disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
