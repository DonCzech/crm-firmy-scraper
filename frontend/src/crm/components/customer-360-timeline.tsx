import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import {
  fetchActivities,
  fetchContactById,
  fetchDeals,
  fetchNotes,
  fetchOrders,
  fetchPlatformHelpdeskTickets,
  fetchTasks,
  type BackendActivity,
  type BackendContact,
  type BackendDeal,
  type BackendNote,
  type BackendOrder,
  type BackendTask,
  type PlatformHelpdeskTicket,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimelineEventType = 'order' | 'deal' | 'task' | 'note' | 'activity' | 'ticket';

type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  title: string;
  subtitle: string;
  createdAt: string;
  href?: string;
};

type Customer360Data = {
  contact: BackendContact;
  deals: BackendDeal[];
  tasks: BackendTask[];
  notes: BackendNote[];
  activities: BackendActivity[];
  tickets: PlatformHelpdeskTicket[];
  orders: BackendOrder[];
};

function normalize(value?: string | null): string {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizePhone(value?: string | null): string {
  return (value || '').replace(/[^\d+]/g, '');
}

function formatWhen(value?: string): string {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'n/a';
  return date.toLocaleString('cs-CZ');
}

function toMoney(value?: number, currency = 'CZK'): string {
  if (typeof value !== 'number') return '0';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function badgeVariantByType(type: TimelineEventType): 'outline' | 'secondary' | 'default' {
  if (type === 'ticket') return 'default';
  if (type === 'order' || type === 'deal') return 'secondary';
  return 'outline';
}

function buildTimeline(data: Customer360Data): TimelineEvent[] {
  const dealItems: TimelineEvent[] = data.deals.map((deal) => ({
    id: `deal-${deal.id}`,
    type: 'deal',
    title: `Deal: ${deal.title}`,
    subtitle: `${deal.stage || 'unknown stage'} • ${toMoney(deal.value, deal.currency || 'CZK')}`,
    createdAt: deal.updatedAt || deal.createdAt,
    href: '/core/crm/pipeline',
  }));

  const taskItems: TimelineEvent[] = data.tasks.map((task) => ({
    id: `task-${task.id}`,
    type: 'task',
    title: `Úkol: ${task.title}`,
    subtitle: `${task.status || 'todo'}${task.dueDate ? ` • due ${formatWhen(task.dueDate)}` : ''}`,
    createdAt: task.updatedAt || task.createdAt,
    href: '/core/crm/tasks',
  }));

  const noteItems: TimelineEvent[] = data.notes.map((note) => ({
    id: `note-${note.id}`,
    type: 'note',
    title: 'Poznámka',
    subtitle: (note.content || '').slice(0, 110) || '(prázdná poznámka)',
    createdAt: note.updatedAt || note.createdAt,
    href: '/core/crm/notes',
  }));

  const activityItems: TimelineEvent[] = data.activities.map((activity) => ({
    id: `activity-${activity.id}`,
    type: 'activity',
    title: `Aktivita: ${activity.subject}`,
    subtitle: activity.type || activity.description || 'bez detailu',
    createdAt: activity.startDate || activity.updatedAt || activity.createdAt,
    href: '/core/crm/dashboard',
  }));

  const ticketItems: TimelineEvent[] = data.tickets.map((ticket) => ({
    id: `ticket-${ticket.id}`,
    type: 'ticket',
    title: `Ticket ${ticket.ticketNumber}`,
    subtitle: `${ticket.status} • ${ticket.priority} • ${ticket.title}`,
    createdAt: ticket.updatedAt || ticket.createdAt || '',
    href: '/core/helpdesk',
  }));

  const orderItems: TimelineEvent[] = data.orders.map((order) => ({
    id: `order-${order.id}`,
    type: 'order',
    title: `Objednávka ${order.orderNumber}`,
    subtitle: `${order.paymentStatus} • ${toMoney(order.total, order.currency || 'CZK')}`,
    createdAt: order.updatedAt || order.orderDate || order.createdAt,
    href: `/core/order-details?orderId=${encodeURIComponent(order.id)}`,
  }));

  return [...dealItems, ...taskItems, ...noteItems, ...activityItems, ...ticketItems, ...orderItems]
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function Customer360Timeline({ contactId }: { contactId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Customer360Data | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const contact = await fetchContactById(contactId);
        const [dealsRes, tasksRes, notesRes, activitiesRes, ticketsRes, ordersRes] = await Promise.allSettled([
          fetchDeals({ limit: 200, contactId }),
          fetchTasks({ limit: 200, contactId }),
          fetchNotes({ limit: 200, contactId }),
          fetchActivities({ limit: 200, contactId }),
          fetchPlatformHelpdeskTickets(300),
          fetchOrders({ page: 1, limit: 300 }),
        ]);

        const deals = dealsRes.status === 'fulfilled' ? dealsRes.value?.data ?? [] : [];
        const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value?.data ?? [] : [];
        const notes = notesRes.status === 'fulfilled' ? notesRes.value?.data ?? [] : [];
        const activities = activitiesRes.status === 'fulfilled' ? activitiesRes.value?.data ?? [] : [];
        const allTickets = ticketsRes.status === 'fulfilled' ? ticketsRes.value ?? [] : [];
        const allOrders = ordersRes.status === 'fulfilled' ? ordersRes.value?.data ?? [] : [];

        const fullName = normalize(`${contact.firstName || ''} ${contact.lastName || ''}`);
        const lastName = normalize(contact.lastName);
        const email = normalize(contact.email);
        const phone = normalizePhone(contact.phone);

        const tickets = allTickets.filter((item) => {
          const ticketName = normalize(item.clientName);
          const ticketEmail = normalize(item.clientEmail);
          const ticketPhone = normalizePhone(item.clientPhone);
          if (email && ticketEmail && email === ticketEmail) return true;
          if (phone && ticketPhone && phone === ticketPhone) return true;
          if (fullName && ticketName === fullName) return true;
          if (lastName && ticketName.includes(lastName)) return true;
          return false;
        });

        const orders = allOrders.filter((item) => {
          const customerName = normalize(item.customerName);
          const customerEmail = normalize(item.customerEmail);
          const customerPhone = normalizePhone(item.customerPhone);
          if (email && customerEmail && email === customerEmail) return true;
          if (phone && customerPhone && phone === customerPhone) return true;
          if (fullName && customerName === fullName) return true;
          if (lastName && customerName.includes(lastName)) return true;
          return false;
        });

        if (!active) return;
        setData({
          contact,
          deals,
          tasks,
          notes,
          activities,
          tickets,
          orders,
        });
      } catch (loadError) {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : 'Customer 360 se nepodařilo načíst.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [contactId]);

  const timeline = useMemo(() => {
    if (!data) return [];
    return buildTimeline(data);
  }, [data]);

  const openTasks = useMemo(() => {
    if (!data) return 0;
    return data.tasks.filter((item) => !['done', 'cancelled'].includes(String(item.status || '').toLowerCase())).length;
  }, [data]);

  const openTickets = useMemo(() => {
    if (!data) return 0;
    return data.tickets.filter((item) => !['resolved', 'closed'].includes(String(item.status || '').toLowerCase())).length;
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Načítám Customer 360...
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error || 'Nepodařilo se načíst Customer 360.'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Customer 360</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {`${data.contact.firstName || ''} ${data.contact.lastName || ''}`.trim() || data.contact.email || data.contact.id}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to={`/core/crm/contacts/${data.contact.id}`}>
              Otevřít CRM kartu
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Dealů</div>
            <div className="text-xl font-semibold">{data.deals.length}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Otevřené úkoly</div>
            <div className="text-xl font-semibold">{openTasks}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Otevřené tickety</div>
            <div className="text-xl font-semibold">{openTickets}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Objednávky</div>
            <div className="text-xl font-semibold">{data.orders.length}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline ({timeline.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {timeline.length === 0 ? (
            <div className="text-sm text-muted-foreground">Pro tento kontakt zatím nejsou dostupné žádné události.</div>
          ) : (
            timeline.slice(0, 40).map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant={badgeVariantByType(item.type)}>{item.type}</Badge>
                  <div className="font-medium">{item.title}</div>
                </div>
                <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatWhen(item.createdAt)}
                  {item.href ? (
                    <>
                      {' '}
                      •{' '}
                      <Link className="underline" to={item.href}>
                        Otevřít
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
