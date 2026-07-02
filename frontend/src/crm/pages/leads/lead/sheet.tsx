import { useEffect, useMemo, useState } from 'react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { Globe, Mail, MapPin, Phone, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useManagedAssigneeOptions } from '@/crm/hooks/use-managed-core-users';
import { ManagedAssigneeSelect } from '@/crm/components/managed-assignee-select';
import { logFrontendError } from '@/crm/services/frontend-logger';
import {
  fetchContacts,
  fetchContactById,
  updateContact,
  createActivity,
  fetchMe,
  type BackendContact,
  type BackendMe,
} from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { loadLeadMeta, saveLeadMeta } from '@/crm/services/lead-meta';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitiesTab } from './activities-tab';
import { HistoryTab } from './history-tab';
import { getLeadOwnerOptions, normalizeLeadOwnerForSave, normalizeLeadOwnerValue, resolveLeadOwnerLabel } from './owner-utils';

type LeadFormState = {
  subject: string;
  clientName: string;
  status: string;
  priority: string;
  owner: string;
  ico: string;
  dic: string;
  contactPerson: string;
  dataBox: string;
  isPerson: boolean;
  source: string;
  category: string;
  email: string;
  email2: string;
  phone: string;
  phone2: string;
  phoneType: string;
  phoneType2: string;
  website: string;
  street: string;
  zip: string;
  city: string;
  region: string;
  country: string;
  territory: string;
  gps: string;
  note: string;
};

function toInitialForm(lead: BackendContact): LeadFormState {
  return {
    subject: lead.title ?? '',
    clientName: `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim(),
    status: lead.status ?? 'active',
    priority: 'normal',
    owner: '',
    ico: '',
    dic: '',
    contactPerson: '',
    dataBox: '',
    isPerson: false,
    source: lead.source ?? 'web',
    category: '',
    email: lead.email ?? '',
    email2: '',
    phone: lead.phone ?? '',
    phone2: '',
    phoneType: 'mobile',
    phoneType2: 'mobile',
    website: '',
    street: lead.street ?? '',
    zip: lead.zip ?? '',
    city: lead.city ?? '',
    region: lead.state ?? '',
    country: (lead.country ?? 'CZ').toLowerCase(),
    territory: '',
    gps: '',
    note: '',
  };
}

const sourceLabels: Record<string, string> = {
  reality: 'Reality',
  firmy: 'Firmy.cz',
  web: 'Web',
  referral: 'Doporučení',
  cold_call: 'Cold call',
  campaign: 'Kampaň',
};

const TRACKED_LEAD_FIELDS: Array<{ key: keyof LeadFormState; label: string }> = [
  { key: 'clientName', label: 'Jméno / firma' },
  { key: 'email', label: 'E-mail' },
  { key: 'email2', label: 'E-mail 2' },
  { key: 'phone', label: 'Telefon' },
  { key: 'phone2', label: 'Telefon 2' },
  { key: 'status', label: 'Stav' },
  { key: 'source', label: 'Zdroj' },
  { key: 'website', label: 'Web' },
  { key: 'street', label: 'Ulice' },
  { key: 'zip', label: 'PSČ' },
  { key: 'city', label: 'Město' },
  { key: 'region', label: 'Kraj' },
  { key: 'country', label: 'Země' },
  { key: 'owner', label: 'Vlastník leadu' },
  { key: 'ico', label: 'IČO' },
  { key: 'dic', label: 'DIČ' },
  { key: 'contactPerson', label: 'Kontaktní osoba' },
  { key: 'dataBox', label: 'Datová schránka' },
  { key: 'gps', label: 'GPS' },
];

function normalizeLogValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Ano' : 'Ne';
  if (value == null) return '';
  const normalized = String(value).trim();
  return normalized;
}

function shortenLogValue(value: string): string {
  if (value.length <= 80) return value;
  return `${value.slice(0, 77)}...`;
}

function buildLeadChangeLines(previousForm: LeadFormState | null, nextForm: LeadFormState): string[] {
  if (!previousForm) return [];
  const lines: string[] = [];

  for (const { key, label } of TRACKED_LEAD_FIELDS) {
    const previousRaw = normalizeLogValue(previousForm[key]);
    const nextRaw = normalizeLogValue(nextForm[key]);
    if (previousRaw === nextRaw) continue;

    const previousValue = shortenLogValue(previousRaw);
    const nextValue = shortenLogValue(nextRaw);

    if (!previousValue && nextValue) {
      lines.push(`${label}: přidal "${nextValue}"`);
      continue;
    }
    if (previousValue && !nextValue) {
      lines.push(`${label}: smazal (původně "${previousValue}")`);
      continue;
    }
    lines.push(`${label}: upravil z "${previousValue}" na "${nextValue}"`);
  }

  return lines;
}

function formatAccountLabel(me: BackendMe | null, fallbackUserId: string): string {
  const fullName = `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim();
  if (fullName) return fullName;
  if (me?.email?.trim()) return me.email.trim();
  if (fallbackUserId.trim()) return fallbackUserId.trim();
  return 'neznámý účet';
}

export function LeadDetailSheet() {
  const params = useParams();
  const leadId = params.leadId ?? params.contactId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState<BackendContact | null>(null);
  const [form, setForm] = useState<LeadFormState | null>(null);
  const [initialFormState, setInitialFormState] = useState<LeadFormState | null>(null);
  const managedUsers = useManagedAssigneeOptions();
  const [myUserId, setMyUserId] = useState('');
  const [me, setMe] = useState<BackendMe | null>(null);

  useEffect(() => {
    fetchMe()
      .then((nextMe) => {
        setMe(nextMe ?? null);
        if (nextMe?.id) setMyUserId(nextMe.id);
      })
      .catch((error) => {
        logFrontendError({
          area: 'crm-lead-detail',
          message: error instanceof Error ? error.message : 'Failed to resolve current user for lead sheet',
          meta: { operation: 'fetch_me_for_lead_sheet' },
        });
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadLead = async () => {
      if (!leadId) return;
      try {
        let data: BackendContact | null = null;
        try {
          data = await fetchContactById(leadId);
        } catch (error) {
          logFrontendError({
            area: 'crm-lead-detail',
            message: error instanceof Error ? error.message : 'Failed to load lead by id, falling back to list',
            meta: { leadId, operation: 'fetch_contact_by_id' },
          });
          try {
            const list = await fetchContacts({ limit: 1000 });
            data = (list?.data ?? []).find((item) => item.id === leadId) ?? null;
          } catch (fallbackError) {
            logFrontendError({
              area: 'crm-lead-detail',
              message: fallbackError instanceof Error ? fallbackError.message : 'Failed to load lead list fallback',
              meta: { leadId, operation: 'fetch_contacts_fallback' },
            });
            data = null;
          }
        }
        if (!data) throw new Error('Lead nebyl nalezen');

        let meta = {} as Awaited<ReturnType<typeof loadLeadMeta>>;
        try {
          meta = await loadLeadMeta(leadId);
        } catch (error) {
          logFrontendError({
            area: 'crm-lead-detail',
            message: error instanceof Error ? error.message : 'Failed to load lead meta',
            meta: { leadId, operation: 'load_lead_meta' },
          });
          meta = {};
        }
        if (!isMounted) return;

        const nextForm = {
          ...toInitialForm(data),
          priority: meta.lead_priority ?? 'normal',
          category: meta.lead_category ?? '',
          note: meta.lead_note ?? '',
          website: meta.lead_website ?? '',
          phoneType: meta.lead_phone_type ?? 'mobile',
          territory: meta.lead_territory ?? '',
          owner: meta.lead_owner ?? '',
          ico: meta.lead_ico ?? '',
          dic: meta.lead_dic ?? '',
          contactPerson: meta.lead_contact_person ?? '',
          dataBox: meta.lead_databox ?? '',
          phone2: meta.lead_phone2 ?? '',
          phoneType2: meta.lead_phone_type ?? 'mobile',
          email2: meta.lead_email2 ?? '',
          gps: meta.lead_gps ?? '',
          isPerson: (meta.lead_is_person ?? 'false') === 'true',
        };
        setLead(data);
        setForm(nextForm);
        setInitialFormState(nextForm);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Načtení leadu selhalo';
        toast.custom((t) => (
          <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
            <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
            <AlertTitle>{message}</AlertTitle>
          </Alert>
        ));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadLead();
    return () => { isMounted = false; };
  }, [leadId]);

  const ownerOptions = useMemo(() => getLeadOwnerOptions(managedUsers), [managedUsers]);

  useEffect(() => {
    if (!form) return;
    const normalizedOwner = normalizeLeadOwnerValue(form.owner, ownerOptions);
    if (normalizedOwner && normalizedOwner !== form.owner) {
      setForm((prev) => (prev ? { ...prev, owner: normalizedOwner } : prev));
      return;
    }
    if (normalizedOwner) return;
    const firstOwner = ownerOptions[0]?.id?.trim();
    if (!firstOwner) return;
    setForm((prev) => (prev ? { ...prev, owner: firstOwner } : prev));
  }, [form, ownerOptions]);

  const leadCode = useMemo(() => {
    const short = lead?.id?.slice(0, 3).toUpperCase() ?? '000';
    return `L-26-${short}`;
  }, [lead?.id]);
  const handleClose = () => navigate('/core/crm/leads');

  const saveLead = async (closeAfterSave: boolean) => {
    if (!leadId || !form) return;
    const previousFormState = initialFormState;
    const trimmedName = form.clientName.trim();
    if (!trimmedName) {
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
          <AlertTitle>Doplňte jméno nebo název klienta</AlertTitle>
        </Alert>
      ));
      return;
    }
    const [firstName, ...rest] = trimmedName.split(' ');
    try {
      setSubmitting(true);
      const updated = await updateContact(leadId, {
        firstName: firstName || 'Lead',
        lastName: rest.join(' ').trim() || 'Klient',
        title: form.subject || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        status: (['active', 'inactive', 'archived'] as const).includes(form.status as 'active' | 'inactive' | 'archived')
          ? (form.status as 'active' | 'inactive' | 'archived')
          : 'active',
        source: form.source || undefined,
        street: form.street || undefined,
        city: form.city || undefined,
        state: form.region || undefined,
        zip: form.zip || undefined,
        country: form.country.toUpperCase(),
        contactType: 'lead',
      });
      let metaSaveError: string | null = null;
      try {
        await saveLeadMeta(leadId, {
          lead_priority: form.priority,
          lead_category: form.category,
          lead_note: form.note,
          lead_website: form.website,
          lead_phone_type: form.phoneType,
          lead_territory: form.territory,
          lead_owner: normalizeLeadOwnerForSave(form.owner, ownerOptions),
          lead_ico: form.ico,
          lead_dic: form.dic,
          lead_contact_person: form.contactPerson,
          lead_databox: form.dataBox,
          lead_phone2: form.phone2,
          lead_email2: form.email2,
          lead_gps: form.gps,
          lead_is_person: String(form.isPerson),
        });
      } catch (error) {
        metaSaveError =
          error instanceof Error ? error.message : 'Nepodařilo se uložit doplňková pole.';
      }

      const nextFormState: LeadFormState = {
        ...toInitialForm(updated),
        priority: form.priority,
        category: form.category,
        note: form.note,
        website: form.website,
        phoneType: form.phoneType,
        territory: form.territory,
        owner: form.owner,
        ico: form.ico,
        dic: form.dic,
        contactPerson: form.contactPerson,
        dataBox: form.dataBox,
        phone2: form.phone2,
        phoneType2: form.phoneType2,
        email2: form.email2,
        gps: form.gps,
        isPerson: form.isPerson,
      };

      setLead(updated);
      setForm(nextFormState);
      setInitialFormState(nextFormState);
      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_COMPANIES_REFRESH_EVENT);

      const changedFields = buildLeadChangeLines(previousFormState, nextFormState);
      const changeDescription = changedFields.length > 0
        ? changedFields.join('\n')
        : `Bez změn hodnot (uložil: ${formatAccountLabel(me, myUserId)}).`;

      // Log save event into history with field-level diff and account attribution.
      void createActivity({
        type: 'updated',
        subject: 'Lead upravil',
        description: changeDescription,
        contactId: leadId,
        isCompleted: false,
        userId: myUserId || undefined,
      }).catch((error) => {
        logFrontendError({
          area: 'crm-lead-detail',
          message: error instanceof Error ? error.message : 'Failed to write lead update activity',
          meta: { leadId, operation: 'create_lead_update_activity' },
        });
      });

      if (metaSaveError) {
        toast.custom((t) => (
          <Alert variant="mono" icon="warning" onClose={() => toast.dismiss(t)}>
            <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
            <AlertTitle>Lead uložen, ale doplňková pole ne: {metaSaveError}</AlertTitle>
          </Alert>
        ));
      } else {
        toast.custom((t) => (
          <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
            <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
            <AlertTitle>Lead byl uložen</AlertTitle>
          </Alert>
        ));
      }
      if (closeAfterSave) handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uložení leadu selhalo';
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
          <AlertTitle>{message}</AlertTitle>
        </Alert>
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const initials = form?.clientName
    ? form.clientName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'L';

  return (
    <Sheet open={true} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent className="gap-0 w-[calc(100vw-0.75rem)] sm:max-w-none lg:w-[1160px] inset-1.5 sm:inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5 [&_[data-slot=sheet-close]]:z-30">
        <SheetHeader className="border-b py-3.5 px-5 border-border flex-row items-center justify-start gap-3 pr-14">
          <div className="min-w-0 flex items-center gap-3">
            <SheetTitle className="font-medium shrink-0">Detail leadu</SheetTitle>
            {!loading && lead ? (
              <div className="text-2sm">
                <span className="font-normal text-muted-foreground">Lead ID:</span>{' '}
                <span className="font-medium text-foreground">{leadCode}</span>
              </div>
            ) : null}
          </div>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
              Načítám lead...
            </div>
          ) : !lead || !form ? (
            <div className="flex items-center justify-center h-40 text-sm text-destructive">
              Lead nebyl nalezen.
            </div>
          ) : (
            <>
              <ScrollArea
                className="flex flex-col h-[calc(100dvh-12.2rem)] mx-1.5"
                viewportClassName="[&>div]:h-full [&>div>div]:h-full"
              >
                <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
                  {/* Left panel */}
                  <div className="w-full shrink-0 lg:w-[260px] py-5 lg:pe-5 space-y-5">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-base">{form.clientName || 'Lead'}</div>
                        {form.subject && (
                          <div className="text-sm text-muted-foreground">{form.subject}</div>
                        )}
                      </div>
                    </div>

                    {/* Quick info */}
                    <div className="space-y-2.5 text-sm">
                      {form.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-4 shrink-0" />
                          <span className="text-foreground">{form.phone}</span>
                        </div>
                      )}
                      {form.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-4 shrink-0" />
                          <span className="text-foreground truncate">{form.email}</span>
                        </div>
                      )}
                      {form.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="size-4 shrink-0" />
                          <span className="text-foreground">{form.city}{form.region ? `, ${form.region}` : ''}</span>
                        </div>
                      )}
                      {form.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="size-4 shrink-0" />
                          <a href={form.website} target="_blank" rel="noreferrer" className="text-primary truncate hover:underline">
                            {form.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="space-y-2 text-sm border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vlastník:</span>
                        <span className="font-medium flex items-center gap-1.5">
                          <User className="size-3.5" />{resolveLeadOwnerLabel(form.owner, ownerOptions) || 'Nepřiřazeno'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priorita:</span>
                        <Badge
                          size="sm"
                          variant={form.priority === 'high' ? 'destructive' : form.priority === 'low' ? 'secondary' : 'warning'}
                          appearance="light"
                        >
                          {form.priority === 'high' ? 'Vysoká' : form.priority === 'low' ? 'Nízká' : 'Normální'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stav:</span>
                        <Badge
                          size="sm"
                          variant={form.status === 'active' ? 'success' : form.status === 'inactive' ? 'warning' : 'secondary'}
                          appearance="light"
                        >
                          {form.status === 'active' ? 'Aktivní' : form.status === 'inactive' ? 'Neaktivní' : 'Archiv'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Přidáno:</span>
                        <span className="font-medium">{new Date(lead.createdAt ?? Date.now()).toLocaleDateString('cs-CZ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zdroj:</span>
                        <span className="font-medium">{(sourceLabels[form.source] ?? form.source) || '—'}</span>
                      </div>
                      {form.category && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kategorie:</span>
                          <span className="font-medium">{form.category}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right panel */}
                  <div className="grow lg:border-s border-border space-y-5 py-5 lg:ps-5">
                    <Tabs defaultValue="basic" className="w-full text-sm text-muted-foreground">
                      <TabsList className="inline-flex w-auto grow-0 mb-2.5">
                        <TabsTrigger value="basic">Základní údaje</TabsTrigger>
                        <TabsTrigger value="contacts">Kontakty & Adresa</TabsTrigger>
                        <TabsTrigger value="activities">Aktivity</TabsTrigger>
                        <TabsTrigger value="history">Historie</TabsTrigger>
                      </TabsList>

                      {/* Basic info tab */}
                      <TabsContent value="basic">
                        <div className="space-y-4 max-w-lg">
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Předmět:</Label>
                            <Input
                              value={form.subject}
                              onChange={(e) => setForm((p) => p ? { ...p, subject: e.target.value } : p)}
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Přijato:</Label>
                            <Input
                              value={new Date(lead.createdAt ?? Date.now()).toLocaleDateString('cs-CZ')}
                              readOnly
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Stav:</Label>
                            <Select value={form.status} onValueChange={(v) => setForm((p) => p ? { ...p, status: v } : p)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Aktivní</SelectItem>
                                <SelectItem value="inactive">Neaktivní</SelectItem>
                                <SelectItem value="archived">Archiv</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Vlastník:</Label>
                            <ManagedAssigneeSelect
                              value={form.owner}
                              onValueChange={(value) =>
                                setForm((p) => (p ? { ...p, owner: value } : p))
                              }
                              placeholder="— Vyberte vlastníka —"
                            />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Priorita:</Label>
                            <Select value={form.priority} onValueChange={(v) => setForm((p) => p ? { ...p, priority: v } : p)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Nízká</SelectItem>
                                <SelectItem value="normal">Normální</SelectItem>
                                <SelectItem value="high">Vysoká</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Klient:</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                maxLength={60}
                                value={form.clientName}
                                onChange={(e) => setForm((p) => p ? { ...p, clientName: e.target.value } : p)}
                                className="flex-1"
                              />
                              <label className="inline-flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={form.isPerson}
                                  onChange={(e) => setForm((p) => p ? { ...p, isPerson: e.target.checked } : p)}
                                />
                                Fyzická osoba
                              </label>
                            </div>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">IČO:</Label>
                            <Input value={form.ico} onChange={(e) => setForm((p) => p ? { ...p, ico: e.target.value } : p)} />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">DIČ:</Label>
                            <Input value={form.dic} onChange={(e) => setForm((p) => p ? { ...p, dic: e.target.value } : p)} />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Kontakt. osoba:</Label>
                            <Input value={form.contactPerson} onChange={(e) => setForm((p) => p ? { ...p, contactPerson: e.target.value } : p)} />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Zdroj:</Label>
                            <Select value={form.source} onValueChange={(v) => setForm((p) => p ? { ...p, source: v } : p)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web">Web</SelectItem>
                                <SelectItem value="referral">Doporučení</SelectItem>
                                <SelectItem value="cold_call">Cold call</SelectItem>
                                <SelectItem value="campaign">Kampaň</SelectItem>
                                <SelectItem value="reality">Reality</SelectItem>
                                <SelectItem value="firmy">Firmy.cz</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Kategorie:</Label>
                            <Select value={form.category} onValueChange={(v) => setForm((p) => p ? { ...p, category: v } : p)}>
                              <SelectTrigger><SelectValue placeholder="— Vyberte —" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="real_estate">Real Estate</SelectItem>
                                <SelectItem value="insurance">Pojišťovnictví</SelectItem>
                                <SelectItem value="financial">Finance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-left md:text-right">Datová schránka:</Label>
                            <Input value={form.dataBox} onChange={(e) => setForm((p) => p ? { ...p, dataBox: e.target.value } : p)} />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Contacts & Address tab */}
                      <TabsContent value="contacts">
                        <div className="space-y-4 max-w-lg">
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-right">Telefon 1:</Label>
                            <div className="flex gap-2">
                              <Input value={form.phone} onChange={(e) => setForm((p) => p ? { ...p, phone: e.target.value } : p)} className="flex-1" />
                              <Select value={form.phoneType} onValueChange={(v) => setForm((p) => p ? { ...p, phoneType: v } : p)}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mobile">Mobil</SelectItem>
                                  <SelectItem value="work">Práce</SelectItem>
                                  <SelectItem value="home">Domů</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-right">Telefon 2:</Label>
                            <div className="flex gap-2">
                              <Input value={form.phone2} onChange={(e) => setForm((p) => p ? { ...p, phone2: e.target.value } : p)} className="flex-1" />
                              <Select value={form.phoneType2} onValueChange={(v) => setForm((p) => p ? { ...p, phoneType2: v } : p)}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mobile">Mobil</SelectItem>
                                  <SelectItem value="work">Práce</SelectItem>
                                  <SelectItem value="home">Domů</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-right">Email:</Label>
                            <Input maxLength={80} type="email" value={form.email} onChange={(e) => setForm((p) => p ? { ...p, email: e.target.value } : p)} />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-right">Email 2:</Label>
                            <Input maxLength={80} type="email" value={form.email2} onChange={(e) => setForm((p) => p ? { ...p, email2: e.target.value } : p)} />
                          </div>
                          <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                            <Label className="text-sm text-muted-foreground text-right">WWW:</Label>
                            <Input value={form.website} onChange={(e) => setForm((p) => p ? { ...p, website: e.target.value } : p)} />
                          </div>

                          <div className="border-t border-border pt-4 space-y-4">
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">Ulice:</Label>
                              <Input value={form.street} onChange={(e) => setForm((p) => p ? { ...p, street: e.target.value } : p)} />
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">Město:</Label>
                              <Input maxLength={60} value={form.city} onChange={(e) => setForm((p) => p ? { ...p, city: e.target.value } : p)} />
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">Kraj:</Label>
                              <Input value={form.region} onChange={(e) => setForm((p) => p ? { ...p, region: e.target.value } : p)} />
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">PSČ:</Label>
                              <Input value={form.zip} onChange={(e) => setForm((p) => p ? { ...p, zip: e.target.value } : p)} />
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">Země:</Label>
                              <Select value={form.country} onValueChange={(v) => setForm((p) => p ? { ...p, country: v } : p)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cz">Česká republika</SelectItem>
                                  <SelectItem value="sk">Slovensko</SelectItem>
                                  <SelectItem value="de">Německo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">Teritorium:</Label>
                              <Select value={form.territory} onValueChange={(v) => setForm((p) => p ? { ...p, territory: v } : p)}>
                                <SelectTrigger><SelectValue placeholder="— Vyberte —" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="praha">Praha</SelectItem>
                                  <SelectItem value="stredni-cechy">Střední Čechy</SelectItem>
                                  <SelectItem value="morava">Morava</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                              <Label className="text-sm text-muted-foreground text-right">GPS:</Label>
                              <Input value={form.gps} onChange={(e) => setForm((p) => p ? { ...p, gps: e.target.value } : p)} />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Activities tab */}
                      <TabsContent value="activities">
                        <ActivitiesTab contactId={leadId ?? ''} />
                      </TabsContent>

                      {/* History tab */}
                      <TabsContent value="history">
                        <HistoryTab
                          contactId={leadId ?? ''}
                          contactCreatedAt={lead?.createdAt}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetBody>

        <SheetFooter className="flex-row border-t pb-4 p-5 border-border gap-2.5 lg:gap-0">
          <Button variant="outline" disabled={submitting || !form} onClick={() => saveLead(false)}>Uložit</Button>
          <Button variant="mono" disabled={submitting || !form} onClick={() => saveLead(true)}>Uložit & zavřít</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
