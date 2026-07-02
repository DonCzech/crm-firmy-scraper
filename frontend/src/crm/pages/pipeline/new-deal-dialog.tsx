'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDeal, fetchContacts, type BackendContact } from '@/crm/services/backend';
import { CRM_DEALS_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { PIPELINE_STAGES } from './deal-pipeline-column';

interface NewDealDialogProps {
  onCreated: () => void;
}

export function NewDealDialog({ onCreated }: NewDealDialogProps) {
  const NO_CONTACT_VALUE = '__none__';
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [contacts, setContacts] = React.useState<BackendContact[]>([]);
  const [form, setForm] = React.useState({
    title: '',
    value: '',
    stage: 'new',
    contactId: NO_CONTACT_VALUE,
  });

  React.useEffect(() => {
    if (!open) return;
    fetchContacts({ limit: 200 })
      .then((res) => setContacts(res?.data ?? []))
      .catch((error) => {
        logFrontendError({
          area: 'crm-pipeline-new-deal-dialog',
          message: error instanceof Error ? error.message : 'Failed to load contacts for new deal dialog',
          meta: { operation: 'fetch_contacts_new_deal_dialog' },
        });
        setContacts([]);
      });
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = coerceTrimmedString(form.title);
    if (!title) {
      toast.error('Zadejte název leadu.');
      return;
    }
    const parsedValue = (() => {
      const normalized = coerceTrimmedString(form.value).replace(',', '.');
      if (!normalized) return undefined;
      const num = Number(normalized);
      return Number.isFinite(num) ? num : undefined;
    })();
    if (form.value && parsedValue === undefined) {
      toast.error('Hodnota leadu musí být číslo.');
      return;
    }
    const stage = Object.prototype.hasOwnProperty.call(PIPELINE_STAGES, form.stage)
      ? form.stage
      : 'new';
    const contactId = form.contactId === NO_CONTACT_VALUE ? undefined : coerceTrimmedString(form.contactId);
    try {
      setSubmitting(true);
      await createDeal({
        title,
        value: parsedValue,
        currency: 'CZK',
        stage,
        contactId,
      });
      dispatchCrmEvent(CRM_DEALS_REFRESH_EVENT);
      toast.success('Lead byl přidán do pipeline.');
      setOpen(false);
      setForm({ title: '', value: '', stage: 'new', contactId: NO_CONTACT_VALUE });
      onCreated();
    } catch (err) {
      logFrontendError({
        area: 'crm-pipeline-new-deal-dialog',
        message: err instanceof Error ? err.message : 'Failed to create new deal from dialog',
        meta: { operation: 'create_deal_from_dialog' },
      });
      toast.error(err instanceof Error ? err.message : 'Vytvoření leadu selhalo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Nový lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nový lead do pipeline</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Název *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Název obchodního případu"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="value">Hodnota (Kč)</Label>
            <Input
              id="value"
              type="number"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stage">Fáze</Label>
            <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v }))}>
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PIPELINE_STAGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact">Kontakt</Label>
            <Select value={form.contactId} onValueChange={(v) => setForm((f) => ({ ...f, contactId: v }))}>
              <SelectTrigger id="contact">
                <SelectValue placeholder="— bez kontaktu —" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CONTACT_VALUE}>— bez kontaktu —</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                    {c.company ? ` (${c.company.name})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Zrušit
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Ukládám...' : 'Přidat do pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
