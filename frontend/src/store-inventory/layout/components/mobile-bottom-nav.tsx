import { Bot, CalendarDays, ContactRound, LayoutGrid, ListTodo } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Nástěnka', path: '/core/dashboard', match: '/core/dashboard' },
  { icon: ContactRound, label: 'CRM', path: '/core/crm/leads', match: '/core/crm' },
  { icon: Bot, label: 'AI', path: '/core/ai/chat', match: '/core/ai' },
  { icon: ListTodo, label: 'Úkoly', path: '/core/todo/today', match: '/core/todo' },
  { icon: CalendarDays, label: 'Kalendář', path: '/core/calendar/page', match: '/core/calendar' },
] as const;

export function MobileBottomNav() {
  const { pathname } = useLocation();

  const isActive = (match: string) =>
    pathname === match || pathname.startsWith(match + '/');

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-stretch justify-around h-14">
        {NAV_ITEMS.map(({ icon: Icon, label, path, match }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 text-[10px] transition-colors py-2',
              isActive(match)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary',
            )}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
