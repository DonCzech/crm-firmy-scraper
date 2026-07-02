import { useState } from 'react';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { createContact } from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { saveLeadMeta } from '@/crm/services/lead-meta';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';

function LeadInitialsAvatar({ name }: { name: string }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <div className="w-full h-[200px] bg-accent/50 border border-border rounded-lg flex items-center justify-center">
      {initials ? (
        <span className="text-5xl font-bold text-muted-foreground">{initials}</span>
      ) : (
        <User className="size-[40px] text-muted-foreground" />
      )}
    </div>
  );
}

export function NewLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const [clientName, setClientName] = useState('');
  const [isCompany, setIsCompany] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneType, setPhoneType] = useState('mobile');
  const [website, setWebsite] = useState('');
  const [source, setSource] = useState('web');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [street, setStreet] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('cz');
  const [territory, setTerritory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setClientName('');
    setIsCompany(true);
    setEmail('');
    setPhone('');
    setPhoneType('mobile');
    setWebsite('');
    setSource('web');
    setPriority('normal');
    setCategory('');
    setNote('');
    setStreet('');
    setZip('');
    setCity('');
    setRegion('');
    setCountry('cz');
    setTerritory('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const saveLead = async (openAfterSave: boolean) => {
    const trimmedName = coerceTrimmedString(clientName);
    if (!trimmedName) {
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
          <AlertTitle>Doplňte jméno nebo název klienta</AlertTitle>
        </Alert>
      ));
      return;
    }

    const [firstName, ...last] = trimmedName.split(' ');
    const normalizedEmail = coerceTrimmedString(email);
    const normalizedPhone = coerceTrimmedString(phone);
    const normalizedWebsite = coerceTrimmedString(website);
    const normalizedStreet = coerceTrimmedString(street);
    const normalizedZip = coerceTrimmedString(zip);
    const normalizedCity = coerceTrimmedString(city);
    const normalizedRegion = coerceTrimmedString(region);
    const normalizedCountry = coerceTrimmedString(country).toUpperCase() || 'CZ';
    const normalizedCategory = coerceTrimmedString(category);
    const normalizedNote = coerceTrimmedString(note);
    const normalizedTerritory = coerceTrimmedString(territory);

    try {
      setSubmitting(true);
      const savedLead = await createContact({
        firstName: firstName || 'Lead',
        lastName: last.join(' ').trim() || (isCompany ? 'Firma' : 'Osoba'),
        contactType: 'lead',
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
        source,
        status: 'active',
        street: normalizedStreet || undefined,
        city: normalizedCity || undefined,
        state: normalizedRegion || undefined,
        zip: normalizedZip || undefined,
        country: normalizedCountry,
      });
      await saveLeadMeta(savedLead.id, {
        lead_priority: priority,
        lead_category: normalizedCategory,
        lead_note: normalizedNote,
        lead_website: normalizedWebsite,
        lead_phone_type: phoneType,
        lead_territory: normalizedTerritory,
        lead_is_company: String(isCompany),
      });

      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_COMPANIES_REFRESH_EVENT);

      toast.custom((t) => (
        <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
          <AlertIcon><RiCheckboxCircleFill /></AlertIcon>
          <AlertTitle>Lead byl vytvořen</AlertTitle>
        </Alert>
      ));

      onOpenChange(false);
      resetForm();

      if (openAfterSave) {
        navigate(`/core/crm/leads/${savedLead.id}`);
      }
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

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <SheetContent className="gap-0 lg:w-[820px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="font-medium">Nový lead</SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow">
          <ScrollArea
            className="flex flex-col h-[calc(100dvh-10rem)] mx-1.5"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
              {/* Left panel — initials preview */}
              <div className="w-full shrink-0 lg:w-[280px] py-5 lg:pe-5 space-y-4">
                <LeadInitialsAvatar name={clientName} />
                <p className="text-xs text-muted-foreground text-center">
                  Náhled iniciál leadu
                </p>
              </div>

              {/* Right panel — form */}
              <div className="grow lg:border-s border-border space-y-5 py-5 lg:ps-5">
                {/* Name */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Jméno / Název</Label>
                  <Input
                    placeholder="Jméno nebo název klienta"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Type toggle */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Typ</Label>
                  <div className="inline-flex overflow-hidden rounded-full border border-border bg-muted">
                    <button
                      type="button"
                      className={`h-8 px-4 text-sm transition-colors ${isCompany ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                      onClick={() => setIsCompany(true)}
                    >
                      Firma
                    </button>
                    <button
                      type="button"
                      className={`h-8 px-4 text-sm transition-colors ${!isCompany ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                      onClick={() => setIsCompany(false)}
                    >
                      Fyzická osoba
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Phone */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Telefon</Label>
                  <div className="flex flex-1 gap-2">
                    <Input
                      placeholder="+420 …"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={phoneType} onValueChange={setPhoneType}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Mobil</SelectItem>
                        <SelectItem value="work">Práce</SelectItem>
                        <SelectItem value="home">Domů</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">WWW</Label>
                  <Input
                    placeholder="https://…"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Source */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Zdroj</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
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

                {/* Priority */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Priorita</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Nízká</SelectItem>
                      <SelectItem value="normal">Normální</SelectItem>
                      <SelectItem value="high">Vysoká</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="flex items-center gap-10">
                  <Label className="text-xs font-medium w-28 shrink-0">Kategorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="— Vyberte —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="insurance">Pojišťovnictví</SelectItem>
                      <SelectItem value="financial">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Address — collapsible section */}
                <div className="border-t border-border pt-5 space-y-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adresa</p>

                  <div className="flex items-center gap-10">
                    <Label className="text-xs font-medium w-28 shrink-0">Ulice</Label>
                    <Input value={street} onChange={(e) => setStreet(e.target.value)} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-10">
                    <Label className="text-xs font-medium w-28 shrink-0">Město</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-10">
                    <Label className="text-xs font-medium w-28 shrink-0">Kraj</Label>
                    <Input value={region} onChange={(e) => setRegion(e.target.value)} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-10">
                    <Label className="text-xs font-medium w-28 shrink-0">PSČ</Label>
                    <Input value={zip} onChange={(e) => setZip(e.target.value)} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-10">
                    <Label className="text-xs font-medium w-28 shrink-0">Země</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cz">Česká republika</SelectItem>
                        <SelectItem value="sk">Slovensko</SelectItem>
                        <SelectItem value="de">Německo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-10">
                    <Label className="text-xs font-medium w-28 shrink-0">Teritorium</Label>
                    <Select value={territory} onValueChange={setTerritory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="— Vyberte —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="praha">Praha</SelectItem>
                        <SelectItem value="stredni-cechy">Střední Čechy</SelectItem>
                        <SelectItem value="morava">Morava</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Note */}
                <div className="border-t border-border pt-5 space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Poznámka</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Zapište kontext, průběh, co klient řeší…"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex-row border-t pb-4 p-5 border-border gap-2.5 lg:gap-0">
          <Button variant="ghost" onClick={handleClose}>Zavřít</Button>
          <Button variant="outline" disabled={submitting} onClick={handleClose}>Zrušit</Button>
          <Button variant="outline" disabled={submitting} onClick={() => saveLead(false)}>
            Vytvořit
          </Button>
          <Button variant="mono" disabled={submitting} onClick={() => saveLead(true)}>
            Vytvořit & otevřít
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
