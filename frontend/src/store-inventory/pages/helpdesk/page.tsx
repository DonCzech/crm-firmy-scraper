import { FormEvent, useEffect, useMemo, useState } from 'react';
import { LifeBuoy, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPlatformHelpdeskTicket,
  fetchPlatformHelpdeskTickets,
  type PlatformHelpdeskTicket,
  updatePlatformHelpdeskTicket,
} from '@/crm/services/backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SLA_MINUTES_BY_PRIORITY: Record<string, number> = {
  low: 24 * 60,
  medium: 8 * 60,
  high: 4 * 60,
  critical: 60,
};

const BREACH_STATUSES = new Set(['resolved', 'closed']);

type SlaState = 'no_sla' | 'ok' | 'at_risk' | 'breached';

function getSlaDeadlineMs(ticket: PlatformHelpdeskTicket): number | null {
  if (ticket.slaDeadline) {
    const ms = new Date(ticket.slaDeadline).getTime();
    if (Number.isFinite(ms)) return ms;
  }
  if (ticket.createdAt && typeof ticket.sla_minutes === 'number' && ticket.sla_minutes > 0) {
    const createdMs = new Date(ticket.createdAt).getTime();
    if (Number.isFinite(createdMs)) return createdMs + ticket.sla_minutes * 60_000;
  }
  return null;
}

function formatRemaining(deadlineMs: number): string {
  const diff = deadlineMs - Date.now();
  const abs = Math.abs(diff);
  const totalMinutes = Math.floor(abs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${hours}h ${minutes}m`;
  return diff >= 0 ? `zbývá ${value}` : `po termínu ${value}`;
}

function getSlaState(ticket: PlatformHelpdeskTicket): SlaState {
  if (BREACH_STATUSES.has(String(ticket.status).toLowerCase())) return 'ok';
  const deadlineMs = getSlaDeadlineMs(ticket);
  if (!deadlineMs) return 'no_sla';
  const diff = deadlineMs - Date.now();
  if (diff < 0) return 'breached';
  if (diff <= 30 * 60_000) return 'at_risk';
  return 'ok';
}

export function HelpdeskPage() {
  const [tickets, setTickets] = useState<PlatformHelpdeskTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [slaFilter, setSlaFilter] = useState<'all' | 'open' | 'at_risk' | 'breached'>('all');

  const openCount = useMemo(
    () => tickets.filter((item) => String(item.status).toLowerCase() !== 'closed').length,
    [tickets],
  );

  const slaStats = useMemo(() => {
    const stats = {
      breached: 0,
      atRisk: 0,
      noSla: 0,
      ok: 0,
    };
    for (const ticket of tickets) {
      const state = getSlaState(ticket);
      if (state === 'breached') stats.breached += 1;
      else if (state === 'at_risk') stats.atRisk += 1;
      else if (state === 'no_sla') stats.noSla += 1;
      else stats.ok += 1;
    }
    return stats;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (slaFilter === 'all') return tickets;
    if (slaFilter === 'open') {
      return tickets.filter((ticket) => !BREACH_STATUSES.has(String(ticket.status).toLowerCase()));
    }
    if (slaFilter === 'at_risk') {
      return tickets.filter((ticket) => getSlaState(ticket) === 'at_risk');
    }
    return tickets.filter((ticket) => getSlaState(ticket) === 'breached');
  }, [slaFilter, tickets]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchPlatformHelpdeskTickets(100);
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Načtení ticketů selhalo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    const safeTitle = title.trim();
    const safeClient = clientName.trim();
    if (!safeTitle || !safeClient) {
      toast.error('Vyplň název ticketu a jméno klienta.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createPlatformHelpdeskTicket({
        title: safeTitle,
        clientName: safeClient,
        clientEmail: clientEmail.trim() || undefined,
        priority,
        slaMinutes: SLA_MINUTES_BY_PRIORITY[priority] ?? SLA_MINUTES_BY_PRIORITY.medium,
        description: description.trim() || undefined,
      });
      setTickets((prev) => [created, ...prev]);
      setTitle('');
      setClientName('');
      setClientEmail('');
      setDescription('');
      toast.success('Ticket vytvořen.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Vytvoření ticketu selhalo.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onMarkResolved = async (ticket: PlatformHelpdeskTicket) => {
    setUpdatingTicketId(ticket.id);
    try {
      const updated = await updatePlatformHelpdeskTicket(ticket.id, { status: 'resolved' });
      setTickets((prev) => prev.map((item) => (item.id === ticket.id ? updated : item)));
      toast.success('Ticket označen jako vyřešený.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Aktualizace ticketu selhala.';
      toast.error(message);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const onEscalate = async (ticket: PlatformHelpdeskTicket) => {
    setUpdatingTicketId(ticket.id);
    try {
      const updated = await updatePlatformHelpdeskTicket(ticket.id, {
        priority: 'critical',
        status: 'in_progress',
        slaMinutes: 60,
      });
      setTickets((prev) => prev.map((item) => (item.id === ticket.id ? updated : item)));
      toast.success('Ticket byl eskalován.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Eskalace selhala.';
      toast.error(message);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const onExtendSla = async (ticket: PlatformHelpdeskTicket, extraMinutes: number) => {
    const deadlineMs = getSlaDeadlineMs(ticket);
    const remainingMinutes = deadlineMs ? Math.max(0, Math.ceil((deadlineMs - Date.now()) / 60_000)) : 0;
    setUpdatingTicketId(ticket.id);
    try {
      const updated = await updatePlatformHelpdeskTicket(ticket.id, {
        slaMinutes: remainingMinutes + extraMinutes,
      });
      setTickets((prev) => prev.map((item) => (item.id === ticket.id ? updated : item)));
      toast.success(`SLA prodlouženo o ${extraMinutes} minut.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Prodloužení SLA selhalo.';
      toast.error(message);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <div className="container-fluid space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Helpdesk</h1>
          <p className="text-sm text-muted-foreground">Ticketing a SLA vrstva nad platform API.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void loadTickets()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Obnovit
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nový ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={(event) => void onCreate(event)}>
              <div className="space-y-1.5">
                <Label htmlFor="hd-title">Název</Label>
                <Input id="hd-title" value={title} onChange={(event) => setTitle(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hd-client">Klient</Label>
                <Input id="hd-client" value={clientName} onChange={(event) => setClientName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hd-email">E-mail</Label>
                <Input
                  id="hd-email"
                  type="email"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Priorita</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Nízká</SelectItem>
                    <SelectItem value="medium">Střední</SelectItem>
                    <SelectItem value="high">Vysoká</SelectItem>
                    <SelectItem value="critical">Kritická</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hd-desc">Popis</Label>
                <Textarea id="hd-desc" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <Button type="submit" className="gap-2" disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <LifeBuoy className="size-4" />}
                Vytvořit ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Přehled SLA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Celkem ticketů:</span> {tickets.length}
            </div>
            <div>
              <span className="text-muted-foreground">Otevřených:</span> {openCount}
            </div>
            <div>
              <span className="text-muted-foreground">SLA OK:</span> {slaStats.ok}
            </div>
            <div>
              <span className="text-muted-foreground">SLA at-risk:</span> {slaStats.atRisk}
            </div>
            <div>
              <span className="text-muted-foreground">SLA breached:</span> {slaStats.breached}
            </div>
            <div>
              <span className="text-muted-foreground">Bez SLA:</span> {slaStats.noSla}
            </div>
            <div className="space-y-1.5 pt-2">
              <Label>Filtr</Label>
              <Select value={slaFilter} onValueChange={(value) => setSlaFilter(value as typeof slaFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  <SelectItem value="open">Otevřené</SelectItem>
                  <SelectItem value="at_risk">SLA at-risk</SelectItem>
                  <SelectItem value="breached">SLA breached</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Poslední tickety ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredTickets.length === 0 ? (
            <div className="text-sm text-muted-foreground">Žádné tickety.</div>
          ) : (
            filteredTickets.slice(0, 40).map((ticket) => {
              const slaState = getSlaState(ticket);
              const deadlineMs = getSlaDeadlineMs(ticket);
              const isWorking = updatingTicketId === ticket.id;

              return (
              <div key={ticket.id} className="rounded-md border p-3">
                <div className="mb-1 flex items-center gap-2">
                  <div className="font-medium">{ticket.title}</div>
                  <Badge variant="secondary">{ticket.priority}</Badge>
                  <Badge variant="outline">{ticket.status}</Badge>
                  {slaState === 'at_risk' && <Badge variant="secondary">SLA at-risk</Badge>}
                  {slaState === 'breached' && <Badge variant="destructive">SLA breached</Badge>}
                  {slaState === 'no_sla' && <Badge variant="outline">Bez SLA</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ticket.ticketNumber} • {ticket.clientName}
                </div>
                {deadlineMs ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    SLA deadline: {new Date(deadlineMs).toLocaleString('cs-CZ')} ({formatRemaining(deadlineMs)})
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-muted-foreground">SLA deadline není nastaven.</div>
                )}
                {String(ticket.status).toLowerCase() !== 'resolved' && String(ticket.status).toLowerCase() !== 'closed' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void onMarkResolved(ticket)}
                      disabled={isWorking}
                    >
                      Označit jako vyřešené
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void onEscalate(ticket)}
                      disabled={isWorking}
                    >
                      Eskalovat
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void onExtendSla(ticket, 60)}
                      disabled={isWorking}
                    >
                      +60 min SLA
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void onExtendSla(ticket, 240)}
                      disabled={isWorking}
                    >
                      +4 h SLA
                    </Button>
                  </div>
                )}
              </div>
            )})
          )}
        </CardContent>
      </Card>
    </div>
  );
}
