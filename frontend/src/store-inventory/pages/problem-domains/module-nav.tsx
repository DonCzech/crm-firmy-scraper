import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ITEMS = [
  { label: 'Dashboard', to: '/core/problem-domains' },
  { label: 'Katalog kategorií', to: '/core/problem-domains/categories' },
  { label: 'Databáze domén', to: '/core/problem-domains/domains' },
  { label: 'Žebříčky', to: '/core/problem-domains/rankings' },
  { label: 'Import / Update', to: '/core/problem-domains/import' },
];

export function ProblemDomainsModuleNav() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const active = pathname === item.to || (item.to !== '/core/problem-domains' && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors',
              active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
