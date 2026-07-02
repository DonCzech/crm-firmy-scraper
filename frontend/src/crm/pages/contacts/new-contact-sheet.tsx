import { useEffect, useMemo, useState } from 'react';
import { useManagedAssigneeOptions } from '@/crm/hooks/use-managed-core-users';
import { ManagedAssigneeSelect } from '@/crm/components/managed-assignee-select';
import { createContact, fetchCompanies, fetchContacts } from '@/crm/services/backend';
import {
  CRM_COMPANIES_REFRESH_EVENT,
  CRM_CONTACTS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import {
  Avatar,
  AvatarImage
} from '@/components/ui/avatar';
import { Button, ButtonArrow } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandCheck,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

// Optionally import types if needed
// import { EstimatedArr } from '@/crm/types/estimated-arr';
// import { EmployeeRange } from '@/crm/types/employee-range';
// import { Company } from '@/crm/types/company';

const optionalTrimmedString = z.preprocess(
  (value) => coerceTrimmedString(value),
  z.string().optional(),
);

const FormSchema = z.object({
  name: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.string().min(1, 'Name is required'),
  ),
  company: optionalTrimmedString,
  position: optionalTrimmedString,
  socialLinks: optionalTrimmedString,
  logo: optionalTrimmedString,
  domain: optionalTrimmedString,
  email: z.preprocess(
    (value) => coerceTrimmedString(value),
    z
      .string()
      .email('Please enter a valid email')
      .optional()
      .or(z.literal('')),
  ),
  phone: optionalTrimmedString,
  description: optionalTrimmedString,
  categoryIds: z.array(z.string()).optional(),
  contactIds: z.array(z.string()).optional(),
  address: optionalTrimmedString,
  state: optionalTrimmedString,
  city: optionalTrimmedString,
  zip: optionalTrimmedString,
  country: optionalTrimmedString,
  angelList: optionalTrimmedString,
  linkedin: optionalTrimmedString,
  connectionStrengthId: optionalTrimmedString,
  x: optionalTrimmedString,
  instagram: optionalTrimmedString,
  facebook: optionalTrimmedString,
  telegram: optionalTrimmedString,
  foundedAt: optionalTrimmedString,
  estimatedArrId: optionalTrimmedString,
  employeeRangeId: optionalTrimmedString,
  teamId: optionalTrimmedString,
});

export function NewCompanySheet({
  open,
  onOpenChange,
  contactType = 'customer',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactType?: 'lead' | 'customer' | 'partner' | 'vendor';
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      position: '',
      logo: '',
      domain: '',
      email: '',
      phone: '',
      description: '',
      categoryIds: [],
      contactIds: [],
      address: '',
      state: '',
      city: '',
      zip: '',
      country: '',
      angelList: '',
      linkedin: '',
      connectionStrengthId: '',
      x: '',
      instagram: '',
      facebook: '',
      telegram: '',
      foundedAt: '',
      estimatedArrId: '',
      employeeRangeId: '',
      teamId: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const fullName = coerceTrimmedString(values.name);
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ').trim() || '-';
    const companyId = coerceTrimmedString(values.company);
    const email = coerceTrimmedString(values.email);
    const phone = coerceTrimmedString(values.phone);
    const title = coerceTrimmedString(values.position);
    const street = coerceTrimmedString(values.address);
    const city = coerceTrimmedString(values.city);
    const state = coerceTrimmedString(values.state);
    const zip = coerceTrimmedString(values.zip);
    const country = coerceTrimmedString(values.country);

    try {
      await createContact({
        firstName: firstName || 'Unknown',
        lastName,
        contactType,
        email: email || undefined,
        phone: phone || undefined,
        title: title || undefined,
        companyId: companyId || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zip: zip || undefined,
        country: country || undefined,
      });

      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_COMPANIES_REFRESH_EVENT);

      toast.custom((t) => (
        <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>
            {contactType === 'lead'
              ? 'Lead was saved to database'
              : 'Contact was saved to database'}
          </AlertTitle>
        </Alert>
      ));

      if (createMore) {
        form.reset();
        setComboBoxValue('');
      } else {
        form.reset();
        setComboBoxValue('');
        onOpenChange(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Saving contact failed';
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
    }
  };

  const handleReset = () => {
    form.reset();
    setComboBoxValue('');
  };

  const [companies, setCompanies] = useState<
    Array<{ value: string; label: string; logo: string }>
  >([]);
  const [contactHints, setContactHints] = useState<Array<{ id: string; email: string; address: string }>>([]);

  const users = useManagedAssigneeOptions();

  const [comboBoxValue, setComboBoxValue] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [createMore, setCreateMore] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      try {
        const response = await fetchCompanies({ limit: 300 });
        const mapped = (response?.data ?? []).map((company) => ({
          value: company.id,
          label: company.name,
          logo: '/media/brand-logos/1.svg',
        }));

        if (isMounted) {
          setCompanies(mapped);
        }
      } catch {
        if (isMounted) {
          setCompanies([]);
        }
      }
    };

    loadCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onRefresh = () => {
      void (async () => {
        try {
          const response = await fetchCompanies({ limit: 300 });
          const mapped = (response?.data ?? []).map((company) => ({
            value: company.id,
            label: company.name,
            logo: '/media/brand-logos/1.svg',
          }));
          setCompanies(mapped);
        } catch {
          setCompanies([]);
        }
      })();
    };

    window.addEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    };
  }, []);

  const uniqueEmailHints = useMemo(
    () => Array.from(new Set(contactHints.map((contact) => contact.email).filter(Boolean))),
    [contactHints],
  );
  const uniqueAddressHints = useMemo(
    () => Array.from(new Set(contactHints.map((contact) => contact.address).filter(Boolean))),
    [contactHints],
  );

  useEffect(() => {
    let isMounted = true;

    const loadContactHints = async () => {
      try {
        const response = await fetchContacts({ limit: 500 });
        const hints = (response?.data ?? []).map((contact) => ({
          id: contact.id,
          email: (contact.email ?? '').trim(),
          address:
            [contact.street, contact.city, contact.zip]
              .map((part) => (typeof part === 'string' ? part.trim() : ''))
              .filter(Boolean)
              .join(', ')
              .trim(),
        }));
        if (isMounted) setContactHints(hints);
      } catch {
        if (isMounted) setContactHints([]);
      }
    };

    void loadContactHints();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleComboBoxSelect = (value: string) => {
    setComboBoxValue(value);
    const user = users.find((u) => u.id === value);
    form.setValue('name', user?.name || '');
  };

  useEffect(() => {
    if (!comboBoxValue) return;
    const stillExists = users.some((user) => user.id === comboBoxValue);
    if (stillExists) return;
    setComboBoxValue('');
    if (form.getValues('name')) {
      form.setValue('name', '');
    }
  }, [comboBoxValue, users, form]);

  const [date] = useState<Date | undefined>(new Date());

  // Docs: https://www.reui.io/docs/date-picker#date--time
  const today = new Date();
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(
    today,
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const timeSlots = [
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '12:00', available: true },
    { time: '13:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:w-[600px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="flex items-center gap-2.5">
            <Users className="text-primary size-4" />
            {contactType === 'lead' ? 'New Lead' : 'New Contact'}
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="px-5 py-0">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] pe-3 -me-3">
            <Form {...form}>
              <form
                id="new-contact-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <ManagedAssigneeSelect
                          value={comboBoxValue}
                          onValueChange={handleComboBoxSelect}
                          placeholder="Select a user"
                          searchPlaceholder="Search user..."
                          emptyText="No users found."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company ComboBox */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="flex items-center justify-center size-5 border border-border rounded-full">
                                    <AvatarImage
                                      className="size-4"
                                      src={
                                        companies.find(
                                          (c) => c.value === field.value,
                                        )?.logo
                                      }
                                      alt={
                                        companies.find(
                                          (c) => c.value === field.value,
                                        )?.label
                                      }
                                    />
                                  </Avatar>
                                  <span className="text-sm">
                                    {
                                      companies.find(
                                        (c) => c.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  Select a company
                                </span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[300px] p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search company..." />
                              <CommandList>
                                <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
                                  <CommandEmpty>
                                    No companies found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {companies.map((company) => (
                                      <CommandItem
                                        key={company.value}
                                        value={company.value}
                                        onSelect={() =>
                                          field.onChange(company.value)
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="flex items-center justify-center size-5 border border-border rounded-full">
                                            <AvatarImage
                                              className="size-4"
                                              src={company.logo}
                                              alt={company.label}
                                            />
                                          </Avatar>
                                          <span className="text-sm">
                                            {company.label}
                                          </span>
                                        </div>
                                        <CommandCheck
                                          className={cn(
                                            field.value === company.value
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position ComboBox */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                <span className="capitalize">
                                  {field.value}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Select position
                                </span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[300px] p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search position..." />
                              <CommandList>
                                <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
                                  <CommandEmpty>
                                    No positions found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {[
                                      'CEO',
                                      'CTO',
                                      'COO',
                                      'CFO',
                                      'CMO',
                                      'VP of Engineering',
                                      'VP of Sales',
                                      'VP of Marketing',
                                      'Director',
                                      'Manager',
                                      'Senior Manager',
                                      'Team Lead',
                                      'Developer',
                                      'Designer',
                                      'Analyst',
                                      'Consultant',
                                      'Specialist',
                                    ].map((position) => (
                                      <CommandItem
                                        key={position}
                                        value={position}
                                        onSelect={() =>
                                          field.onChange(position)
                                        }
                                      >
                                        <span className="capitalize">
                                          {position}
                                        </span>
                                        <CommandCheck
                                          className={cn(
                                            field.value === position
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Links ComboBox */}
                <FormField
                  control={form.control}
                  name="socialLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Links</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                <span className="capitalize">
                                  {field.value}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Select social media
                                </span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[300px] p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search social media..." />
                              <CommandList>
                                <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
                                  <CommandEmpty>
                                    No social media found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {[
                                      'linkedin',
                                      'twitter',
                                      'github',
                                      'instagram',
                                      'facebook',
                                      'youtube',
                                      'medium',
                                      'stackoverflow',
                                    ].map((platform) => (
                                      <CommandItem
                                        key={platform}
                                        value={platform}
                                        onSelect={() =>
                                          field.onChange(platform)
                                        }
                                      >
                                        <span className="capitalize">
                                          {platform}
                                        </span>
                                        <CommandCheck
                                          className={cn(
                                            field.value === platform
                                              ? 'opacity-100'
                                              : 'opacity-0',
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email ComboBox */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Popover open={emailOpen} onOpenChange={setEmailOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={emailOpen}
                              className={cn(
                                'justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                <div className="flex items-center gap-1.5 truncate">
                                  {field.value}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  Select Email
                                </span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[280px] p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search Email..." />
                              <CommandEmpty>No Email found.</CommandEmpty>
                              <CommandList>
                                <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
                                  <CommandGroup>
                                    {uniqueEmailHints.map((email) => (
                                        <CommandItem
                                          key={email}
                                          value={email}
                                          onSelect={(currentValue) => {
                                            field.onChange(currentValue);
                                            setEmailOpen(false);
                                          }}
                                        >
                                          {email}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address ComboBox*/}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Popover
                          open={addressOpen}
                          onOpenChange={setAddressOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-60',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                <div className="flex items-center gap-1.5 truncate">
                                  {field.value}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  Select Address
                                </span>
                              )}
                              <ChevronDown className="h-4 w-4 opacity-60 -me-0.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[280px] p-0"
                          >
                            <Command>
                              <CommandInput placeholder="Search Address..." />
                              <CommandEmpty>No Address found.</CommandEmpty>
                              <CommandList>
                                <ScrollArea viewportClassName="max-h-[300px] [&>div]:block!">
                                  <CommandGroup>
                                    {uniqueAddressHints.map((address) => (
                                        <CommandItem
                                          key={address}
                                          value={address}
                                          onSelect={(currentValue) => {
                                            field.onChange(currentValue);
                                            setAddressOpen(false);
                                          }}
                                        >
                                          {address}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Due Date */}
                <div className="flex flex-col gap-2.5">
                  <Label className="flex w-full items-center gap-1 max-w-56">
                    Due Date
                  </Label>
                  {/*
                    Docs: https://www.reui.io/docs/date-picker#date--time
                  */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="grow relative">
                        <Button
                          type="button"
                          variant="outline"
                          mode="input"
                          placeholder={!date}
                          className="w-full"
                        >
                          <CalendarIcon />
                          {date ? (
                            format(date, 'PPP') +
                            (selectedTime ? ` - ${selectedTime}` : '')
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex max-sm:flex-col">
                        <Calendar
                          mode="single"
                          selected={availabilityDate}
                          onSelect={(newDate) => {
                            if (newDate) {
                              setAvailabilityDate(newDate);
                              setSelectedTime(undefined);
                            }
                          }}
                          className="p-2 sm:pe-5"
                          disabled={[{ before: today }]}
                        />
                        <div className="relative w-full max-sm:h-48 sm:w-40">
                          <div className="absolute inset-0 py-4 max-sm:border-t">
                            <ScrollArea className="h-full sm:border-s">
                              <div className="space-y-3">
                                <div className="flex h-5 shrink-0 items-center px-5">
                                  <p className="text-sm font-medium">
                                    {date
                                      ? format(date, 'EEEE, d')
                                      : 'Pick a date'}
                                    <span className="text-muted-foreground">
                                      {selectedTime ? ` - ${selectedTime}` : ''}
                                    </span>
                                  </p>
                                </div>
                                <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                                  {timeSlots.map(({ time, available }) => (
                                    <Button
                                      key={time}
                                      variant={
                                        selectedTime === time
                                          ? 'primary'
                                          : 'outline'
                                      }
                                      size="sm"
                                      className="w-full"
                                      onClick={() => setSelectedTime(time)}
                                      disabled={!available}
                                    >
                                      {time}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="flex items-center not-only-of-type:justify-between border-t py-3.5 px-5 border-border">
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="create-more"
              className="text-xs text-secondary-foreground"
            >
              Create more
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Switch
              id="create-more"
              size="sm"
              checked={createMore}
              onCheckedChange={(checked) => setCreateMore(checked === true)}
            />
            <Button type="submit" form="new-contact-form">
              Save Contact
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
