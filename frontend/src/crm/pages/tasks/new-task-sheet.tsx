import React, { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { format } from 'date-fns';
import { CalendarIcon, CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ManagedAssigneeSelect } from '@/crm/components/managed-assignee-select';
import { createTask, fetchTasks } from '@/crm/services/backend';
import {
  CRM_CONTACTS_REFRESH_EVENT,
  CRM_TASKS_REFRESH_EVENT,
  dispatchCrmEvent,
} from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { appendTaskAudit } from '@/crm/services/task-audit';
import { coerceTrimmedString } from '@/crm/utils/coerce';
import { cn } from '@/lib/utils';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
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

const FormSchema = z.object({
  name: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.string().min(1, 'Name is required'),
  ),
  estimatedArrId: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.enum(['high', 'medium', 'low']).optional(),
  ),
  employeeRangeId: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.enum(['pending', 'in_progress', 'completed']).optional(),
  ),
  assigneeId: z.preprocess(
    (value) => coerceTrimmedString(value),
    z.string().optional(),
  ),
});

export function NewTaskSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const latestExistingTasksRequestRef = useRef(0);
  const [existingTasks, setExistingTasks] = useState<Array<{ id: string; title: string; dueAt?: string; assigneeId?: string | null }>>([]);
  const [duplicateConfirmArmed, setDuplicateConfirmArmed] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      estimatedArrId: 'medium',
      employeeRangeId: 'pending',
      assigneeId: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const title = values.name.trim();
    if (!title) return;

    const priority = values.estimatedArrId === 'high' || values.estimatedArrId === 'low'
      ? values.estimatedArrId
      : 'medium';

    const status = values.employeeRangeId === 'in_progress'
      ? 'in_progress'
      : values.employeeRangeId === 'completed'
        ? 'done'
        : 'todo';

    const dueDate = (() => {
      if (!availabilityDate) return undefined;
      const at = new Date(availabilityDate);
      if (availabilityTime) {
        const [h, m] = availabilityTime.split(':').map((v) => Number(v));
        if (Number.isFinite(h) && Number.isFinite(m)) {
          at.setHours(h, m, 0, 0);
        }
      }
      return at.toISOString();
    })();

    const exactDuplicateExists = existingTasks.some((task) => {
      const sameTitle = (task.title || '').trim().toLowerCase() === title.toLowerCase();
      const sameAssignee = (task.assigneeId || '') === (values.assigneeId || '');
      const sameDueDay =
        dueDate && task.dueAt
          ? new Date(task.dueAt).toDateString() === new Date(dueDate).toDateString()
          : false;
      return sameTitle && sameAssignee && sameDueDay;
    });

    if (exactDuplicateExists && !duplicateConfirmArmed) {
      setDuplicateConfirmArmed(true);
      toast.warning('Byla nalezena pravděpodobná přesná duplicita. Potvrď znovu kliknutím na Save Task.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await createTask({
        title: title.slice(0, 160),
        description: values.name,
        priority,
        status,
        dueDate,
        assigneeId: values.assigneeId || undefined,
      });
      appendTaskAudit(created.id, 'created', `Nový úkol: ${created.title}`);

      dispatchCrmEvent(CRM_TASKS_REFRESH_EVENT);
      dispatchCrmEvent(CRM_CONTACTS_REFRESH_EVENT);

      toast.custom((t) => (
        <Alert variant="mono" icon="primary" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>Task byl uložen do databáze</AlertTitle>
        </Alert>
      ));

      if (createMore) {
        form.reset({
          name: '',
          estimatedArrId: 'medium',
          employeeRangeId: 'pending',
          assigneeId: '',
        });
        setDuplicateConfirmArmed(false);
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Uložení úkolu selhalo';
      toast.custom((t) => (
        <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
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

  const handleReset = () => {
    form.reset();
    setDuplicateConfirmArmed(false);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const requestId = latestExistingTasksRequestRef.current + 1;
      latestExistingTasksRequestRef.current = requestId;
      try {
        const response = await fetchTasks({ limit: 400 });
        if (!mounted || requestId !== latestExistingTasksRequestRef.current) return;
        const rows = (response?.data ?? []).map((item: Record<string, unknown>) => ({
          id: String(item.id || ''),
          title: String(item.title || ''),
          dueAt: (item.dueDate as string) || (item.dueAt as string) || undefined,
          assigneeId: (item.assigneeId as string) || null,
        }));
        setExistingTasks(rows);
      } catch (error) {
        logFrontendError({
          area: 'crm-new-task-sheet',
          message: error instanceof Error ? error.message : 'Failed to load existing tasks for duplicate detection',
          meta: { operation: 'load_existing_tasks' },
        });
        if (mounted && requestId === latestExistingTasksRequestRef.current) setExistingTasks([]);
      }
    };
    void load();
    const onRefresh = () => void load();
    window.addEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    return () => {
      mounted = false;
      window.removeEventListener(CRM_TASKS_REFRESH_EVENT, onRefresh);
    };
  }, []);

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

  const [taskOpen, setTaskOpen] = React.useState(false);
  const watchName = form.watch('name');
  const selectedAssigneeId = String(form.watch('assigneeId') || '');
  const watchAssignee = selectedAssigneeId;
  const duplicateCandidates = useMemo(() => {
    const title = (watchName || '').trim().toLowerCase();
    if (!title) return [];
    const dueDay = availabilityDate ? new Date(availabilityDate).toDateString() : '';
    return existingTasks
      .filter((task) => {
        const taskTitle = (task.title || '').toLowerCase();
        const similarTitle = taskTitle.includes(title) || title.includes(taskTitle);
        const sameDueDay = dueDay && task.dueAt ? new Date(task.dueAt).toDateString() === dueDay : false;
        const sameAssignee = watchAssignee && (task.assigneeId || '') === watchAssignee;
        return similarTitle || (sameDueDay && sameAssignee);
      })
      .slice(0, 4);
  }, [watchName, watchAssignee, availabilityDate, existingTasks]);

  useEffect(() => {
    setDuplicateConfirmArmed(false);
  }, [watchName, watchAssignee, availabilityDate, availabilityTime]);
  const taskOptions = [
    {
      value: 'high',
      label: 'High',
      state: 'bg-red-500',
    },
    {
      value: 'medium',
      label: 'Medium',
      state: 'bg-yellow-500',
    },
    {
      value: 'low',
      label: 'Low',
      state: 'bg-green-500',
    },
  ];

  const [statusOpen, setStatusOpen] = React.useState(false);
  const statusOptions = [
    {
      value: 'pending',
      label: 'Pending',
      state: 'bg-yellow-500',
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      state: 'bg-blue-500',
    },
    {
      value: 'completed',
      label: 'Completed',
      state: 'bg-green-500',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:w-[600px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="flex items-center gap-2.5">
            <CheckSquare className="text-primary size-4" />
            New Task
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="p-0">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] ps-3 pe-2 me-1">
            <Form {...form}>
              <form
                id="new-task-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 px-2"
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Add Task</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Enter task details..."
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Task ComboBox */}
                <FormField
                  control={form.control}
                  name="estimatedArrId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Popover open={taskOpen} onOpenChange={setTaskOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              mode="input"
                              placeholder={!field.value}
                              aria-expanded={taskOpen}
                              className="w-full"
                            >
                              {field.value ? (
                                <span className="flex items-center gap-2.5">
                                  <span
                                    className={cn(
                                      'ms-0.5 size-1.5 rounded-full',
                                      taskOptions.find(
                                        (p) => p.value === field.value,
                                      )?.state,
                                    )}
                                  ></span>
                                  <span className="truncate">
                                    {
                                      taskOptions.find(
                                        (p) => p.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                </span>
                              ) : (
                                <span>Select task...</span>
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
                                  {taskOptions.map((task) => (
                                    <CommandItem
                                      key={task.value}
                                      value={task.value}
                                      onSelect={(currentValue) => {
                                        field.onChange(currentValue);
                                        setTaskOpen(false);
                                      }}
                                    >
                                      <span className="flex items-center gap-2.5">
                                        <span
                                          className={cn(
                                            'ms-0.5 size-1.5 rounded-full',
                                            task.state,
                                          )}
                                        ></span>
                                        <span className="truncate">
                                          {task.label}
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
                          placeholder={!availabilityDate}
                          className="w-full"
                        >
                          <CalendarIcon />
                          {availabilityDate ? (
                            format(availabilityDate, 'PPP') +
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
                                    {availabilityDate
                                      ? format(availabilityDate, 'EEEE, d')
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
          {duplicateCandidates.length > 0 ? (
            <div className="mr-3 max-w-md rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
              Možné duplicity:
              <ul className="mt-1 space-y-0.5">
                {duplicateCandidates.map((task) => (
                  <li key={task.id}>
                    {task.title}
                    {task.dueAt ? ` (${format(new Date(task.dueAt), 'PPP')})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex items-center space-x-2">
            <Switch
              id="create-more"
              size="sm"
              checked={createMore}
              onCheckedChange={(checked) => setCreateMore(checked === true)}
            />
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
            <Button type="submit" form="new-task-form" disabled={submitting}>
              {submitting ? 'Ukládám...' : duplicateConfirmArmed ? 'Potvrdit uložení duplicity' : 'Save Task'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
