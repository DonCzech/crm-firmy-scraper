import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { fetchDeals, fetchPlatformHelpdeskTickets, fetchTasks, type BackendDeal, type BackendTask } from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Recommendation = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  href: string;
  cta: string;
};

function isTaskOpen(task: BackendTask): boolean {
  const status = String(task.status || '').toLowerCase();
  return !['done', 'cancelled'].includes(status);
}

export function AiNextBestActionWidget() {
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<BackendDeal[]>([]);
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [openCriticalTickets, setOpenCriticalTickets] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const [dealsRes, tasksRes, ticketsRes] = await Promise.allSettled([
        fetchDeals({ limit: 400 }),
        fetchTasks({ limit: 400 }),
        fetchPlatformHelpdeskTickets(200),
      ]);

      setDeals(dealsRes.status === 'fulfilled' ? dealsRes.value?.data ?? [] : []);
      setTasks(tasksRes.status === 'fulfilled' ? tasksRes.value?.data ?? [] : []);

      if (ticketsRes.status === 'fulfilled') {
        const count = (ticketsRes.value ?? []).filter((ticket) => {
          const priority = String(ticket.priority || '').toLowerCase();
          const status = String(ticket.status || '').toLowerCase();
          return priority === 'critical' && !['resolved', 'closed'].includes(status);
        }).length;
        setOpenCriticalTickets(count);
      } else {
        setOpenCriticalTickets(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const recommendations = useMemo<Recommendation[]>(() => {
    const now = Date.now();
    const overdueTasks = tasks.filter((task) => {
      if (!isTaskOpen(task) || !task.dueDate) return false;
      const due = new Date(task.dueDate).getTime();
      return Number.isFinite(due) && due < now;
    });

    const urgentTasks = tasks.filter((task) => {
      if (!isTaskOpen(task)) return false;
      return String(task.priority || '').toLowerCase() === 'urgent';
    });

    const lateDeals = deals.filter((deal) => {
      const stage = String(deal.stage || '').toLowerCase();
      if (!['qualified', 'proposal', 'negotiation'].includes(stage)) return false;
      if (!deal.expectedCloseDate) return false;
      const expected = new Date(deal.expectedCloseDate).getTime();
      return Number.isFinite(expected) && expected < now;
    });

    const weakProbabilityDeals = deals.filter((deal) => {
      const stage = String(deal.stage || '').toLowerCase();
      if (!['qualified', 'proposal', 'negotiation'].includes(stage)) return false;
      if (typeof deal.probability !== 'number') return false;
      return deal.probability < 45;
    });

    const next: Recommendation[] = [];
    if (openCriticalTickets > 0) {
      next.push({
        id: 'critical-tickets',
        priority: 'high',
        title: 'Kritické helpdesk tickety čekají na řešení',
        detail: `${openCriticalTickets} otevřených ticketů s prioritou critical.`,
        href: '/core/helpdesk',
        cta: 'Řešit SLA',
      });
    }
    if (overdueTasks.length > 0) {
      next.push({
        id: 'overdue-tasks',
        priority: 'high',
        title: 'Přetažené úkoly blokují pipeline',
        detail: `${overdueTasks.length} úkolů je po termínu.`,
        href: '/core/crm/tasks',
        cta: 'Přeplánovat úkoly',
      });
    }
    if (lateDeals.length > 0) {
      next.push({
        id: 'late-deals',
        priority: 'medium',
        title: 'Dealy po plánovaném close date',
        detail: `${lateDeals.length} dealů je potřeba posunout nebo uzavřít.`,
        href: '/core/crm/pipeline',
        cta: 'Aktualizovat pipeline',
      });
    }
    if (urgentTasks.length > 0) {
      next.push({
        id: 'urgent-tasks',
        priority: 'medium',
        title: 'Urgentní úkoly bez dokončení',
        detail: `${urgentTasks.length} úkolů je v prioritě urgent.`,
        href: '/core/crm/tasks',
        cta: 'Delegovat urgenty',
      });
    }
    if (weakProbabilityDeals.length > 0) {
      next.push({
        id: 'weak-deals',
        priority: 'low',
        title: 'Slabé dealy v aktivních fázích',
        detail: `${weakProbabilityDeals.length} dealů má pravděpodobnost pod 45 %.`,
        href: '/core/crm/pipeline',
        cta: 'Rekvalifikovat dealy',
      });
    }

    if (next.length === 0) {
      next.push({
        id: 'all-good',
        priority: 'low',
        title: 'Aktuálně bez kritických rizik',
        detail: 'Žádný urgentní zásah nebyl detekován.',
        href: '/core/crm/dashboard',
        cta: 'Otevřít CRM',
      });
    }

    return next.slice(0, 5);
  }, [deals, openCriticalTickets, tasks]);

  return (
    <Card className="h-full">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="size-4" />
            AI Next Best Action
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Obnovit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((item) => (
          <div key={item.id} className="rounded-md border p-3">
            <div className="mb-1 flex items-center gap-2">
              <Badge
                variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
              >
                {item.priority}
              </Badge>
              <div className="text-sm font-medium">{item.title}</div>
            </div>
            <div className="text-xs text-muted-foreground">{item.detail}</div>
            {item.id !== 'overdue-tasks' && (
              <Button asChild variant="link" className="px-0 h-auto mt-1.5">
                <Link to={item.href} className="inline-flex items-center gap-1">
                  {item.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
