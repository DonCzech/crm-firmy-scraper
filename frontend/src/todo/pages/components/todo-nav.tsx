import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/localization/language-context';

const linksByLanguage = {
  en: [
    { label: 'All Tasks', to: '/core/todo/all-tasks' },
    { label: 'Today', to: '/core/todo/today' },
    { label: 'Upcoming', to: '/core/todo/upcoming' },
    { label: 'Priority', to: '/core/todo/priority' },
    { label: 'Completed', to: '/core/todo/completed' },
  ],
  cs: [
    { label: 'Všechny úkoly', to: '/core/todo/all-tasks' },
    { label: 'Dnes', to: '/core/todo/today' },
    { label: 'Nadcházející', to: '/core/todo/upcoming' },
    { label: 'Priorita', to: '/core/todo/priority' },
    { label: 'Dokončeno', to: '/core/todo/completed' },
  ],
} as const;

export function TodoNav() {
  const { language } = useLanguage();
  const links = linksByLanguage[language];

  return (
    <div className="relative z-10 mb-4 overflow-x-auto">
      <div className="inline-flex rounded-lg border border-input bg-card p-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
