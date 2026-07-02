import { useEffect, useMemo, useRef, useState } from 'react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { Globe, Mail, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useManagedAssigneeOptions } from '@/crm/hooks/use-managed-core-users';
import { ManagedAssigneeSelect } from '@/crm/components/managed-assignee-select';
import {
  fetchContacts,
  fetchContactById,
  updateContact,
  type BackendContact,
} from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { loadLeadMeta, saveLeadMeta } from '@/crm/services/lead-meta';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Content } from '../../../layout/components/content';
import { Customer360Timeline } from '@/crm/components/customer-360-timeline';
import { LeadMergeAuditPanel } from '@/crm/components/lead-merge-audit-panel';
import { getLeadOwnerOptions, normalizeLeadOwnerForSave, normalizeLeadOwnerValue } from './owner-utils';

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

const SECTION_LABEL_CLASS =
  'text-[8px] uppercase tracking-wide text-[#6d7891] font-semibold';
const FIELD_CLASS =
  'h-6 rounded-[4px] border border-[#d9dde5] bg-white text-[10px] text-[#7f8798] px-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0';

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

export function LeadDetailPage() {
  const latestLoadRequestRef = useRef(0);
  const params = useParams();
  const leadId = params.leadId ?? params.contactId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState<BackendContact | null>(null);
  const [form, setForm] = useState<LeadFormState | null>(null);
  const managedUsers = useManagedAssigneeOptions();

  useEffect(() => {
    let isMounted = true;

    const loadLead = async () => {
      if (!leadId) return;
      const requestId = latestLoadRequestRef.current + 1;
      latestLoadRequestRef.current = requestId;

      try {
        let data: BackendContact | null = null;

        try {
          data = await fetchContactById(leadId);
        } catch (error) {
          logFrontendError({
            area: 'crm-lead-detail-page',
            message: error instanceof Error ? error.message : 'Failed to load lead by id, falling back to list',
            meta: { leadId, operation: 'fetch_contact_by_id' },
          });
          try {
            const list = await fetchContacts({ limit: 1000 });
            data = (list?.data ?? []).find((item) => item.id === leadId) ?? null;
          } catch (fallbackError) {
            logFrontendError({
              area: 'crm-lead-detail-page',
              message: fallbackError instanceof Error ? fallbackError.message : 'Failed to load lead list fallback',
              meta: { leadId, operation: 'fetch_contacts_fallback' },
            });
            data = null;
          }
        }

        if (!data) {
          throw new Error('Lead nebyl nalezen');
        }

        let meta = {} as Awaited<ReturnType<typeof loadLeadMeta>>;
        try {
          meta = await loadLeadMeta(leadId);
        } catch (error) {
          logFrontendError({
            area: 'crm-lead-detail-page',
            message: error instanceof Error ? error.message : 'Failed to load lead meta',
            meta: { leadId, operation: 'load_lead_meta' },
          });
          meta = {};
        }
        if (!isMounted || requestId !== latestLoadRequestRef.current) return;

        setLead(data);
        setForm({
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
        });
      } catch (error) {
        if (requestId !== latestLoadRequestRef.current) return;
        logFrontendError({
          area: 'crm-lead-detail-page',
          message: error instanceof Error ? error.message : 'Failed to load lead detail page',
          meta: { leadId, operation: 'load_lead_detail_page' },
        });
        const message =
          error instanceof Error ? error.message : 'Načtení leadu selhalo';
        toast.custom((t) => (
          <Alert
            variant="mono"
            icon="destructive"
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>{message}</AlertTitle>
          </Alert>
        ));
      } finally {
        if (isMounted && requestId === latestLoadRequestRef.current) setLoading(false);
      }
    };

    loadLead();

    return () => {
      isMounted = false;
    };
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
  const saveLead = async (closeAfterSave: boolean) => {
    if (!leadId || !form) return;

    const trimmedName = form.clientName.trim();
    if (!trimmedName) {
      toast.custom((t) => (
        <Alert
          variant="mono"
          icon="destructive"
          onClose={() => toast.dismiss(t)}
        >
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
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
        status:
          form.status === 'active' ||
          form.status === 'inactive' ||
          form.status === 'archived'
            ? form.status
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

      setLead(updated);
      setForm((prev) =>
        prev
          ? {
              ...toInitialForm(updated),
              priority: prev.priority,
              category: prev.category,
              note: prev.note,
              website: prev.website,
              phoneType: prev.phoneType,
              territory: prev.territory,
              owner: prev.owner,
              ico: prev.ico,
              dic: prev.dic,
              contactPerson: prev.contactPerson,
              dataBox: prev.dataBox,
              phone2: prev.phone2,
              phoneType2: prev.phoneType2,
              email2: prev.email2,
              gps: prev.gps,
              isPerson: prev.isPerson,
            }
          : toInitialForm(updated),
      );
      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_COMPANIES_REFRESH_EVENT);

      if (metaSaveError) {
        toast.custom((t) => (
          <Alert variant="mono" icon="warning" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>Lead uložen, ale doplňková pole ne: {metaSaveError}</AlertTitle>
          </Alert>
        ));
      } else {
        toast.custom((t) => (
          <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
            <AlertIcon>
              <RiCheckboxCircleFill />
            </AlertIcon>
            <AlertTitle>Lead byl uložen</AlertTitle>
          </Alert>
        ));
      }

      if (closeAfterSave) {
        navigate('/core/crm/contacts');
      }
    } catch (error) {
      logFrontendError({
        area: 'crm-lead-detail-page',
        message: error instanceof Error ? error.message : 'Failed to save lead detail page',
        meta: { leadId, operation: 'save_lead_detail_page' },
      });
      const message =
        error instanceof Error ? error.message : 'Uložení leadu selhalo';
      toast.custom((t) => (
        <Alert
          variant="mono"
          icon="destructive"
          onClose={() => toast.dismiss(t)}
        >
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>{message}</AlertTitle>
        </Alert>
      ));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Content className="px-3.5 py-4">
        <div className="text-sm text-muted-foreground">Načítám lead...</div>
      </Content>
    );
  }

  if (!lead || !form) {
    return (
      <Content className="px-3.5 py-4">
        <div className="text-sm text-destructive">Lead nebyl nalezen.</div>
      </Content>
    );
  }

  return (
    <Content className="py-0">
      <div className="w-full overflow-hidden bg-[#edf0f4]">
        {/* Compact header */}
        <div className="border-b border-[#d7dde7] bg-[#f5f7fa] px-3.5 py-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Star className="size-3 text-[#8590a7] shrink-0" />
            <span className="text-[8px] text-[#8590a7] shrink-0">{leadCode}</span>
            <h1 className="text-[14px] font-semibold text-[#1f2938] truncate">
              {form.clientName || 'Lead'}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              disabled={submitting}
              variant="outline"
              size="sm"
              className="rounded-full border-[#d8dde8] bg-white text-[#7b859a]"
              onClick={() => saveLead(false)}
            >
              Uložit
            </Button>
            <Button
              disabled={submitting}
              size="sm"
              className="rounded-full"
              onClick={() => saveLead(true)}
            >
              Uložit & zavřít
            </Button>
          </div>
        </div>

        <div className="px-3.5 pb-3 pt-2">
          <Tabs defaultValue="lead">
            <TabsList variant="line" className="gap-1 border-b border-[#d7dde7] mb-2">
              <TabsTrigger value="lead" className="rounded-none border-b-0 bg-white px-3 py-1 text-[9px] data-[state=active]:text-[#00a7de]">
                Lead
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-none border-b-0 px-3 py-1 text-[9px]">
                Historie
              </TabsTrigger>
              <TabsTrigger value="discussion" className="rounded-none border-b-0 px-3 py-1 text-[9px]">
                Diskuze
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lead">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="rounded-sm border border-[#d7dde7] bg-[#e6e8ed]">
                    <div className="flex items-center justify-between bg-[#00a9df] px-2 py-1 text-[9px] font-semibold text-white uppercase">
                      <span>Základní údaje</span>
                      <span>{leadCode}</span>
                    </div>
                    <div className="space-y-1 p-2">
                      <div className="grid grid-cols-[63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Předmět:</Label>
                        <Input
                          value={form.subject}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, subject: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-[63px_1fr_63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Přijato:</Label>
                        <Input
                          value={new Date(lead.createdAt ?? Date.now()).toLocaleDateString(
                            'cs-CZ',
                          )}
                          readOnly
                          className={FIELD_CLASS}
                        />
                        <Label className={SECTION_LABEL_CLASS}>Stav:</Label>
                        <Select
                          value={form.status}
                          onValueChange={(value) =>
                            setForm((prev) =>
                              prev ? { ...prev, status: value } : prev,
                            )
                          }
                        >
                          <SelectTrigger className={FIELD_CLASS}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Nový</SelectItem>
                            <SelectItem value="inactive">Neaktivní</SelectItem>
                            <SelectItem value="archived">Archiv</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[63px_1fr_63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Vlastník:</Label>
                        <ManagedAssigneeSelect
                          value={form.owner}
                          onValueChange={(value) =>
                            setForm((prev) => (prev ? { ...prev, owner: value } : prev))
                          }
                          placeholder="- Vyberte vlastníka -"
                          className={FIELD_CLASS}
                        />
                        <Label className={SECTION_LABEL_CLASS}>Priorita:</Label>
                        <Select
                          value={form.priority}
                          onValueChange={(value) =>
                            setForm((prev) =>
                              prev ? { ...prev, priority: value } : prev,
                            )
                          }
                        >
                          <SelectTrigger className={FIELD_CLASS}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Nízká</SelectItem>
                            <SelectItem value="normal">Normální</SelectItem>
                            <SelectItem value="high">Vysoká</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[63px_1fr_auto] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Klient:</Label>
                        <Input
                          maxLength={60}
                          value={form.clientName}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, clientName: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                        <label className="inline-flex items-center gap-1.5 text-[10px] text-[#6d7891]">
                          <input
                            type="checkbox"
                            checked={form.isPerson}
                            onChange={(e) =>
                              setForm((prev) =>
                                prev ? { ...prev, isPerson: e.target.checked } : prev,
                              )
                            }
                          />
                          Fyzická osoba
                        </label>
                      </div>
                      <div className="grid grid-cols-[63px_1fr_63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>IČO:</Label>
                        <Input
                          value={form.ico}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, ico: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                        <Label className={SECTION_LABEL_CLASS}>DIČ:</Label>
                        <Input
                          value={form.dic}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, dic: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-[63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Kont. osoba:</Label>
                        <Input
                          value={form.contactPerson}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, contactPerson: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-[63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Zdroj:</Label>
                        <Select
                          value={form.source}
                          onValueChange={(value) =>
                            setForm((prev) =>
                              prev ? { ...prev, source: value } : prev,
                            )
                          }
                        >
                          <SelectTrigger className={FIELD_CLASS}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web">Web</SelectItem>
                            <SelectItem value="referral">Doporučení</SelectItem>
                            <SelectItem value="cold_call">Cold call</SelectItem>
                            <SelectItem value="campaign">Kampaň</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Kategorie:</Label>
                        <Select
                          value={form.category}
                          onValueChange={(value) =>
                            setForm((prev) =>
                              prev ? { ...prev, category: value } : prev,
                            )
                          }
                        >
                          <SelectTrigger className={FIELD_CLASS}>
                            <SelectValue placeholder="- Vyberte kategorii -" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="real_estate">Real Estate</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="financial">Financial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[63px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>D. schránka:</Label>
                        <Input
                          value={form.dataBox}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, dataBox: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-2 text-[#c2c7d1]">
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#d9dde5] text-[9px]">
                            f
                          </span>
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#d9dde5] text-[9px]">
                            x
                          </span>
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#d9dde5] text-[9px]">
                            in
                          </span>
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#d9dde5] text-[9px]">
                            p
                          </span>
                        </div>
                        <Link to="/core/crm/contacts" className="text-[10px] text-[#1e6ea9] underline">
                          Upravit
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-sm border border-[#d7dde7] bg-[#efe5bf] p-2">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase text-[#8a6f1a]">
                      Poznámka k leadu
                    </div>
                    <Textarea
                      value={form.note}
                      onChange={(e) =>
                        setForm((prev) =>
                          prev ? { ...prev, note: e.target.value } : prev,
                        )
                      }
                      className="min-h-[77px] rounded-[4px] border border-[#dccf9f] bg-[#efe5bf] text-[10px] text-[#5d5e62] focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-sm border border-[#d7dde7] bg-[#e6e8ed]">
                    <div className="flex items-center justify-between bg-[#00a9df] px-2 py-1 text-[9px] font-semibold text-white uppercase">
                      <span>Přílohy</span>
                      <div className="flex items-center gap-2 normal-case">
                        <Link to="/core/crm/contacts" className="underline">
                          Nahrát soubor
                        </Link>
                        <Link to="/core/crm/contacts" className="underline">
                          Další možnosti
                        </Link>
                      </div>
                    </div>
                    <div className="p-3 text-center text-[#b1b7c5] text-[10px]">
                      Zatím bez příloh
                    </div>
                  </div>

                  <div className="rounded-sm border border-[#d7dde7] bg-[#e6e8ed]">
                    <div className="bg-[#00a9df] px-2 py-1 text-[9px] font-semibold text-white uppercase">
                      Adresy a kontakty
                    </div>
                    <div className="space-y-1 p-2">
                      <div className="flex justify-end gap-3 text-[9px]">
                        <Link to="/core/crm/contacts" className="text-[#1e6ea9] underline">
                          Ukázat na mapě
                        </Link>
                        <Link to="/core/crm/contacts" className="text-[#1e6ea9] underline">
                          Ukázat trasu
                        </Link>
                      </div>

                      <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Ulice:</Label>
                        <Input
                          value={form.street}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, street: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Město:</Label>
                        <Input
                          maxLength={60}
                          value={form.city}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, city: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-[38px_1fr_32px_49px] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Kraj:</Label>
                        <Input
                          value={form.region}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, region: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                        <Label className={SECTION_LABEL_CLASS}>PSČ:</Label>
                        <Input
                          value={form.zip}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, zip: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>
                      <div className="grid grid-cols-[38px_1fr_auto] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Země:</Label>
                        <Select
                          value={form.country}
                          onValueChange={(value) =>
                            setForm((prev) =>
                              prev ? { ...prev, country: value } : prev,
                            )
                          }
                        >
                          <SelectTrigger className={FIELD_CLASS}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cz">Česká republika</SelectItem>
                            <SelectItem value="sk">Slovensko</SelectItem>
                            <SelectItem value="de">Německo</SelectItem>
                          </SelectContent>
                        </Select>
                        <Link to="/core/crm/contacts" className="text-[9px] text-[#1e6ea9] underline">
                          vybrat
                        </Link>
                      </div>
                      <div className="grid grid-cols-[81px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>Obchodní teritorium:</Label>
                        <Select
                          value={form.territory}
                          onValueChange={(value) =>
                            setForm((prev) =>
                              prev ? { ...prev, territory: value } : prev,
                            )
                          }
                        >
                          <SelectTrigger className={FIELD_CLASS}>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="praha">Praha</SelectItem>
                            <SelectItem value="stredni-cechy">Střední Čechy</SelectItem>
                            <SelectItem value="morava">Morava</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                        <Label className={SECTION_LABEL_CLASS}>GPS:</Label>
                        <Input
                          value={form.gps}
                          onChange={(e) =>
                            setForm((prev) =>
                              prev ? { ...prev, gps: e.target.value } : prev,
                            )
                          }
                          className={FIELD_CLASS}
                        />
                      </div>

                      <div className="mt-1 flex items-center gap-1">
                        <button className="border border-[#d7dde7] bg-white px-2 py-0.5 text-[10px] text-[#00a7de]">
                          Základní
                        </button>
                        <button className="border border-[#d7dde7] bg-[#f0f2f7] px-2 py-0.5 text-[10px] text-[#9299a8]">
                          Pokročilé
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="grid grid-cols-[38px_1fr_29px_56px] items-center gap-1.5">
                          <Label className={SECTION_LABEL_CLASS}>Tel 1:</Label>
                          <Input
                            value={form.phone}
                            onChange={(e) =>
                              setForm((prev) =>
                                prev ? { ...prev, phone: e.target.value } : prev,
                              )
                            }
                            className={FIELD_CLASS}
                          />
                          <Label className={SECTION_LABEL_CLASS}>Typ:</Label>
                          <Select
                            value={form.phoneType}
                            onValueChange={(value) =>
                              setForm((prev) =>
                                prev ? { ...prev, phoneType: value } : prev,
                              )
                            }
                          >
                            <SelectTrigger className={FIELD_CLASS}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile">Mobil</SelectItem>
                              <SelectItem value="work">Práce</SelectItem>
                              <SelectItem value="home">Domů</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-[38px_1fr_29px_56px] items-center gap-1.5">
                          <Label className={SECTION_LABEL_CLASS}>Tel 2:</Label>
                          <Input
                            value={form.phone2}
                            onChange={(e) =>
                              setForm((prev) =>
                                prev ? { ...prev, phone2: e.target.value } : prev,
                              )
                            }
                            className={FIELD_CLASS}
                          />
                          <Label className={SECTION_LABEL_CLASS}>Typ:</Label>
                          <Select
                            value={form.phoneType2}
                            onValueChange={(value) =>
                              setForm((prev) =>
                                prev ? { ...prev, phoneType2: value } : prev,
                              )
                            }
                          >
                            <SelectTrigger className={FIELD_CLASS}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile">Mobil</SelectItem>
                              <SelectItem value="work">Práce</SelectItem>
                              <SelectItem value="home">Domů</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                          <Label className={SECTION_LABEL_CLASS}>Email:</Label>
                          <div className="relative">
                            <Mail className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca5b6]" />
                            <Input
                              maxLength={80}
                              value={form.email}
                              onChange={(e) =>
                                setForm((prev) =>
                                  prev ? { ...prev, email: e.target.value } : prev,
                                )
                              }
                              className={`${FIELD_CLASS} ps-8`}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                          <Label className={SECTION_LABEL_CLASS}>Email 2:</Label>
                          <Input
                            maxLength={80}
                            value={form.email2}
                            onChange={(e) =>
                              setForm((prev) =>
                                prev ? { ...prev, email2: e.target.value } : prev,
                              )
                            }
                            className={FIELD_CLASS}
                          />
                        </div>
                        <div className="grid grid-cols-[38px_1fr] items-center gap-1.5">
                          <Label className={SECTION_LABEL_CLASS}>WWW:</Label>
                          <div className="relative">
                            <Globe className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca5b6]" />
                            <Input
                              value={form.website}
                              onChange={(e) =>
                                setForm((prev) =>
                                  prev ? { ...prev, website: e.target.value } : prev,
                                )
                              }
                              className={`${FIELD_CLASS} ps-8`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="history">
              {leadId ? (
                <div className="space-y-3">
                  <LeadMergeAuditPanel contactId={leadId} />
                  <Customer360Timeline contactId={leadId} />
                </div>
              ) : (
                <div className="rounded-sm border border-[#d7dde7] bg-white p-3 text-sm text-muted-foreground">
                  Historie není dostupná bez ID kontaktu.
                </div>
              )}
            </TabsContent>
            <TabsContent value="discussion">
              <div className="rounded-sm border border-[#d7dde7] bg-white p-3 text-sm text-muted-foreground">
                Diskuze bude doplněna v dalším kroku.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Content>
  );
}
