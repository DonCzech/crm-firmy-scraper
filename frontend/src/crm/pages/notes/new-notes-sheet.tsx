import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { format } from 'date-fns';
import { CalendarIcon, GalleryVerticalEnd } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ManagedAssigneeSelect } from '@/crm/components/managed-assignee-select';
import { createNote } from '@/crm/services/backend';
import { CRM_NOTES_REFRESH_EVENT, dispatchCrmEvent } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { NOTE_CATEGORY_OPTIONS } from './category-config';
import {
  NOTE_PRIORITY_OPTIONS,
  NOTE_PRIORITY_VALUES,
  NOTE_STATUS_OPTIONS,
  NOTE_STATUS_VALUES,
  type NotePriorityValue,
  type NoteStatusValue,
} from './meta-config';
import { cn } from '@/lib/utils';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
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
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { Textarea } from '@/components/ui/textarea';

// Form Types
export interface NoteFormValues {
  name: string;
  priority: NotePriorityValue;
  employeeRangeId: NoteStatusValue;
  assigneeId?: string;
  category?: string;
}

const priorityOptions = NOTE_PRIORITY_OPTIONS;

const categoryOptions = NOTE_CATEGORY_OPTIONS;

const statusOptions = NOTE_STATUS_OPTIONS;

const FormSchema = z.object({
  name: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.string().min(1, 'Note description is required'),
  ),
  priority: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.enum(NOTE_PRIORITY_VALUES).default('medium'),
  ),
  employeeRangeId: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.enum(NOTE_STATUS_VALUES),
  ),
  assigneeId: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.string().optional(),
  ),
  category: z.preprocess((value) => coerceTrimmedString(value), z.string().optional()),
});

export function NewNoteSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      assigneeId: '',
      category: 'client',
      priority: 'medium',
      employeeRangeId: 'pending',
    },
  });

  const [createMore, setCreateMore] = useState(false);

  const onSubmit = async (values: NoteFormValues) => {
    const content = String(values.name || '').trim();
    const assignedUserId = String(values.assigneeId || '').trim();
    if (!content) return;
    try {
      await createNote({
        content,
        isPinned: values.priority === 'high',
        userId: assignedUserId || undefined,
      });
      dispatchCrmEvent(CRM_NOTES_REFRESH_EVENT);
      toast.custom((t) => (
        <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>Poznámka byla uložena</AlertTitle>
        </Alert>
      ));
      if (createMore) {
        form.reset({
          name: '',
          assigneeId: '',
          category: values.category || 'client',
          priority: values.priority,
          employeeRangeId: values.employeeRangeId,
        });
      } else {
        form.reset();
        onOpenChange(false);
      }
    } catch (error) {
      logFrontendError({
        area: 'crm-new-note-sheet',
        message: error instanceof Error ? error.message : 'Create note failed',
        meta: { operation: 'create_note_from_sheet' },
      });
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>{error instanceof Error ? error.message : 'Uložení poznámky selhalo'}</AlertTitle>
        </Alert>
      ));
    }
  };

  const handleReset = () => {
    form.reset();
    onOpenChange(false);
  };

  const [date] = useState<Date | undefined>(new Date());

  // Docs: https://www.reui.io/docs/date-picker#date--time
  const today = new Date();
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(
    today,
  );
  const [availabilityTime, setAvailabilityTime] = useState<string | undefined>(
    '10:00',
  );
  const availabilityTimeSlots = [
    { time: '09:00', available: false },
    { time: '09:30', available: false },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: false },
    { time: '15:00', available: false },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: true },
    { time: '19:30', available: true },
    { time: '20:00', available: true },
    { time: '20:30', available: true },
    { time: '21:00', available: true },
    { time: '21:30', available: true },
    { time: '22:00', available: true },
    { time: '22:30', available: true },
    { time: '23:00', available: true },
    { time: '23:30', available: true },
    { time: '24:00', available: true },
  ];

  const [priorityOpen, setPriorityOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:w-[600px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="flex items-center gap-2.5">
            <GalleryVerticalEnd className="text-primary size-4" />
            New Note
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="py-0">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] ps-3 pe-2 me-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 px-2"
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Note</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Enter note details..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assign */}
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign</FormLabel>
                      <FormControl>
                        <ManagedAssigneeSelect
                          value={typeof field.value === 'string' ? field.value : ''}
                          onValueChange={field.onChange}
                          placeholder="Select users..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority ComboBox */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Popover
                          open={priorityOpen}
                          onOpenChange={setPriorityOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              mode="input"
                              placeholder={!field.value}
                              aria-expanded={priorityOpen}
                              className="w-full"
                            >
                              {field.value ? (
                                <span className="flex items-center gap-2.5">
                                  <span
                                    className={cn(
                                      'ms-0.5 size-1.5 rounded-full',
                                      priorityOptions.find(
                                        (p) => p.value === field.value,
                                      )?.state,
                                    )}
                                  ></span>
                                  <span className="truncate">
                                    {
                                      priorityOptions.find(
                                        (p) => p.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                </span>
                              ) : (
                                <span>Select priority...</span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[200px] p-0"
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignOffset={0}
                            avoidCollisions={true}
                            collisionPadding={8}
                          >
                            <Command>
                              <CommandList>
                                <CommandEmpty>
                                  No priorities found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {priorityOptions.map((priority) => (
                                    <CommandItem
                                      key={priority.value}
                                      value={priority.value}
                                      onSelect={(currentValue) => {
                                        field.onChange(currentValue);
                                        setPriorityOpen(false);
                                      }}
                                    >
                                      <span className="flex items-center gap-2.5">
                                        <span
                                          className={cn(
                                            'ms-0.5 size-1.5 rounded-full',
                                            priority.state,
                                          )}
                                        ></span>
                                        <span className="truncate">
                                          {priority.label}
                                        </span>
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category ComboBox */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Popover
                          open={categoryOpen}
                          onOpenChange={setCategoryOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              mode="input"
                              placeholder={!field.value}
                              aria-expanded={categoryOpen}
                              className="w-full"
                            >
                              {field.value ? (
                                <span className="flex items-center gap-2.5">
                                  <span
                                    className={cn(
                                      'ms-0.5 size-1.5 rounded-full',
                                      categoryOptions.find(
                                        (c) => c.value === field.value,
                                      )?.state,
                                    )}
                                  ></span>
                                  <span className="truncate">
                                    {
                                      categoryOptions.find(
                                        (c) => c.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                </span>
                              ) : (
                                <span>Select category...</span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[200px] p-0"
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignOffset={0}
                            avoidCollisions={true}
                            collisionPadding={8}
                          >
                            <Command>
                              <CommandInput placeholder="Search category..." />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {categoryOptions.map((category) => (
                                    <CommandItem
                                      key={category.value}
                                      value={category.value}
                                      onSelect={(currentValue) => {
                                        field.onChange(currentValue);
                                        setCategoryOpen(false);
                                      }}
                                    >
                                      <span className="flex items-center gap-2.5">
                                        <span
                                          className={cn(
                                            'ms-1 size-1.5 rounded-full',
                                            category.state,
                                          )}
                                        ></span>
                                        <span className="truncate">
                                          {category.label}
                                        </span>
                                      </span>
                                      {field.value === category.value && (
                                        <CommandCheck />
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status ComboBox */}
                <FormField
                  control={form.control}
                  name="employeeRangeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              mode="input"
                              placeholder={!field.value}
                              aria-expanded={statusOpen}
                              className="w-full"
                            >
                              {field.value ? (
                                <span className="flex items-center gap-2.5">
                                  <span
                                    className={cn(
                                      'ms-0.5 size-1.5 rounded-full',
                                      statusOptions.find(
                                        (r) => r.value === field.value,
                                      )?.state,
                                    )}
                                  ></span>
                                  <span className="truncate">
                                    {
                                      statusOptions.find(
                                        (r) => r.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                </span>
                              ) : (
                                <span>Select status...</span>
                              )}
                              <ButtonArrow />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[200px] p-0"
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignOffset={0}
                            avoidCollisions={true}
                            collisionPadding={8}
                          >
                            <Command>
                              <CommandList>
                                <CommandGroup>
                                  {statusOptions.map((range) => (
                                    <CommandItem
                                      key={range.value}
                                      value={range.value}
                                      onSelect={(currentValue) => {
                                        field.onChange(currentValue);
                                        setStatusOpen(false);
                                      }}
                                    >
                                      <span className="flex items-center gap-2.5">
                                        <span
                                          className={cn(
                                            'ms-0.5 size-1.5 rounded-full',
                                            range.state,
                                          )}
                                        ></span>
                                        <span className="truncate">
                                          {range.label}
                                        </span>
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
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
                            (availabilityTime ? ` - ${availabilityTime}` : '')
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
                              setAvailabilityTime(undefined);
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
                                  </p>
                                </div>
                                <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                                  {availabilityTimeSlots.map(
                                    ({ time: timeSlot, available }) => (
                                      <Button
                                        key={timeSlot}
                                        variant={
                                          availabilityTime === timeSlot
                                            ? 'primary'
                                            : 'outline'
                                        }
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                          setAvailabilityTime(timeSlot)
                                        }
                                        disabled={!available}
                                      >
                                        {timeSlot}
                                      </Button>
                                    ),
                                  )}
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
            <Switch
              id="create-more"
              size="sm"
              checked={createMore}
              onCheckedChange={setCreateMore}
            />
            <Label
              htmlFor="create-more"
              className="text-xs text-secondary-foreground"
            >
              Create more notes
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>Save Note</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
