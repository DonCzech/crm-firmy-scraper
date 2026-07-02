import { Trash2, Bell } from 'lucide-react';
import { OFFER_TYPE_LABELS, ESTATE_TYPE_LABELS, formatPrice } from '@/lib/utils';

interface Props {
  watchdogs: any[];
  onDelete: (id: string) => void;
}

export function WatchdogList({ watchdogs, onDelete }: Props) {
  if (!watchdogs.length) {
    return (
      <div className="card py-10 text-center text-gray-400">
        <Bell size={40} className="mx-auto mb-3 opacity-30" />
        <p>Žádní hlídací psi. Přidejte prvního výše.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {watchdogs.map((wd: any) => (
        <div key={wd.id} className="card p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Bell size={18} className={wd.active ? 'text-primary-600 mt-0.5' : 'text-gray-300 mt-0.5'} />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm">{wd.name ?? 'Hlídací pes'}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {wd.offerType && <Tag>{OFFER_TYPE_LABELS[wd.offerType]}</Tag>}
                {wd.estateType && <Tag>{ESTATE_TYPE_LABELS[wd.estateType]}</Tag>}
                {wd.city && <Tag>{wd.city}</Tag>}
                {wd.priceMin && <Tag>od {formatPrice(wd.priceMin)}</Tag>}
                {wd.priceMax && <Tag>do {formatPrice(wd.priceMax)}</Tag>}
                {wd.rooms?.map((r: string) => <Tag key={r}>{r}</Tag>)}
              </div>
            </div>
          </div>
          <button
            onClick={() => onDelete(wd.id)}
            className="btn-ghost p-1.5 text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{children}</span>
  );
}
