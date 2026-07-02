"use client"

import { useEffect, useMemo, useState } from "react"
import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"
import { RepeatIcon } from "lucide-react"

import { ExternalLinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  CalendarEvent,
  CalendarOption,
  EventColor,
  EventPriority,
  RecurrenceFrequency,
} from "./types"
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "./constants"

const PRIORITY_OPTIONS: { value: EventPriority; label: string; color: string; dot: string }[] = [
  { value: "low",    label: "Nízká",    color: "text-slate-500",  dot: "bg-slate-400" },
  { value: "medium", label: "Střední",  color: "text-yellow-600", dot: "bg-yellow-400" },
  { value: "high",   label: "Vysoká",   color: "text-orange-600", dot: "bg-orange-400" },
  { value: "urgent", label: "Urgentní", color: "text-rose-600",   dot: "bg-rose-500" },
]

const WEEKDAYS = [
  { label: "Po", value: 1 },
  { label: "Út", value: 2 },
  { label: "St", value: 3 },
  { label: "Čt", value: 4 },
  { label: "Pá", value: 5 },
  { label: "So", value: 6 },
  { label: "Ne", value: 0 },
]

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  availableCalendars?: CalendarOption[]
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableCalendars = [],
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`)
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`)
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState<EventColor>("sky")
  const [priority, setPriority] = useState<EventPriority | "">("")
  const [calendarId, setCalendarId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  // Recurrence state
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>("weekly")
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([])
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState(1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")

  const isRecurringInstance = Boolean(event?.recurringId)
  const isExistingEvent = Boolean(event?.id)

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description || "")
      const start = new Date(event.start)
      const end = new Date(event.end)
      setStartDate(start)
      setEndDate(end)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(end))
      setAllDay(event.allDay || false)
      setLocation(event.location || "")
      setColor((event.color as EventColor) || "sky")
      setPriority(event.priority || "")
      setCalendarId(event.calendarId || "")
      setError(null)

      // Restore recurrence if editing a recurring instance or rule
      if (event.recurrence) {
        setRecurrenceEnabled(true)
        setRecurrenceFrequency(event.recurrence.frequency)
        setRecurrenceDays(event.recurrence.daysOfWeek ?? [])
        setRecurrenceDayOfMonth(event.recurrence.dayOfMonth ?? 1)
        setRecurrenceEndDate(event.recurrence.endDate ?? "")
      } else {
        setRecurrenceEnabled(false)
        setRecurrenceDays([])
        setRecurrenceDayOfMonth(1)
        setRecurrenceEndDate("")
      }
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate(new Date())
    setEndDate(new Date())
    setStartTime(`${DefaultStartHour}:00`)
    setEndTime(`${DefaultEndHour}:00`)
    setAllDay(false)
    setLocation("")
    setColor("sky")
    setPriority("")
    setCalendarId("")
    setError(null)
    setRecurrenceEnabled(false)
    setRecurrenceDays([])
    setRecurrenceDayOfMonth(1)
    setRecurrenceEndDate("")
  }

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        const date = new Date(2000, 0, 1, hour, minute)
        const label = format(date, "H:mm")
        options.push({ value, label })
      }
    }
    return options
  }, [])

  const toggleWeekday = (day: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSave = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime.split(":").map(Number)
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number)

      if (
        startHours < StartHour || startHours > EndHour ||
        endHours < StartHour || endHours > EndHour
      ) {
        setError(`Čas musí být mezi ${StartHour}:00 a ${EndHour}:00`)
        return
      }

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    if (isBefore(end, start)) {
      setError("Konec nemůže být před začátkem")
      return
    }

    const recurrenceRule = recurrenceEnabled
      ? {
          frequency: recurrenceFrequency,
          ...(recurrenceFrequency === "weekly"
            ? { daysOfWeek: recurrenceDays }
            : { dayOfMonth: recurrenceDayOfMonth }),
          ...(recurrenceEndDate ? { endDate: recurrenceEndDate } : {}),
        }
      : undefined

    onSave({
      id: event?.id || "",
      title: title.trim() || "(bez názvu)",
      description,
      start,
      end,
      allDay,
      location,
      color,
      priority: priority || undefined,
      calendarId: calendarId || undefined,
      recurrence: recurrenceRule,
      recurringId: event?.recurringId,
    })
  }

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id)
    }
  }

  const colorOptions: Array<{
    value: EventColor
    label: string
    bgClass: string
    borderClass: string
  }> = [
    { value: "sky",     label: "Sky",     bgClass: "bg-sky-400",     borderClass: "border-sky-400" },
    { value: "amber",   label: "Amber",   bgClass: "bg-amber-400",   borderClass: "border-amber-400" },
    { value: "violet",  label: "Violet",  bgClass: "bg-violet-400",  borderClass: "border-violet-400" },
    { value: "rose",    label: "Rose",    bgClass: "bg-rose-400",    borderClass: "border-rose-400" },
    { value: "emerald", label: "Emerald", bgClass: "bg-emerald-400", borderClass: "border-emerald-400" },
    { value: "orange",  label: "Orange",  bgClass: "bg-orange-400",  borderClass: "border-orange-400" },
  ]

  const recurrenceSummary = () => {
    if (!event?.recurrence) return null
    const r = event.recurrence
    if (r.frequency === "weekly" && r.daysOfWeek?.length) {
      const dayNames = WEEKDAYS.filter((d) => r.daysOfWeek!.includes(d.value)).map((d) => d.label)
      return `Každý ${dayNames.join(", ")}`
    }
    if (r.frequency === "monthly" && r.dayOfMonth) {
      return `Každého ${r.dayOfMonth}. v měsíci`
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isExistingEvent ? "Upravit událost" : "Nová událost"}
            {isRecurringInstance && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                <RepeatIcon className="w-2.5 h-2.5" />
                Opakující se
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isExistingEvent ? "Upravit detaily události" : "Přidat novou událost do kalendáře"}
          </DialogDescription>
        </DialogHeader>

        {isRecurringInstance && recurrenceSummary() && (
          <div className="flex items-center gap-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
            <RepeatIcon className="w-3 h-3 shrink-0" />
            <span>{recurrenceSummary()} · Úpravy se projeví na všech výskytech</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-3 py-1">
          {/* Title */}
          <div className="*:not-first:mt-1">
            <Label htmlFor="title">Název</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Název události"
            />
          </div>

          {/* Description */}
          <div className="*:not-first:mt-1">
            <Label htmlFor="description">Popis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Start date + time */}
          <div className="flex gap-3">
            <div className="flex-1 *:not-first:mt-1">
              <Label htmlFor="start-date">Začátek</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant="outline"
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {startDate ? format(startDate, "d. M. yyyy") : "Vybrat datum"}
                    </span>
                    <RiCalendarLine size={16} className="text-muted-foreground/80 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date)
                        if (isBefore(endDate, date)) setEndDate(date)
                        setError(null)
                        setStartDateOpen(false)
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1">
                <Label htmlFor="start-time">Čas</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* End date + time */}
          <div className="flex gap-3">
            <div className="flex-1 *:not-first:mt-1">
              <Label htmlFor="end-date">Konec</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {endDate ? format(endDate, "d. M. yyyy") : "Vybrat datum"}
                    </span>
                    <RiCalendarLine size={16} className="text-muted-foreground/80 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date)
                        setError(null)
                        setEndDateOpen(false)
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1">
                <Label htmlFor="end-time">Čas</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* All day */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="all-day"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="all-day">Celý den</Label>
          </div>

          {/* Location */}
          <div className="*:not-first:mt-1">
            <Label htmlFor="location">Místo</Label>
            <AddressAutocomplete
              id="location"
              value={location}
              onChange={setLocation}
              placeholder="Hledat adresu nebo místo..."
            />
            {location.trim() && (
              <div className="flex gap-2 mt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLinkIcon className="w-3 h-3" />
                  Google Maps
                </a>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLinkIcon className="w-3 h-3" />
                  Apple Maps
                </a>
              </div>
            )}
          </div>

          {/* Calendar selector */}
          {availableCalendars.length > 0 && (
            <div className="*:not-first:mt-1">
              <Label htmlFor="calendar-select">Kalendář</Label>
              <Select value={calendarId || "__none__"} onValueChange={(v) => setCalendarId(v === "__none__" ? "" : v)}>
                <SelectTrigger id="calendar-select">
                  <SelectValue placeholder="Vybrat kalendář..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Výchozí (CRM) —</SelectItem>
                  {availableCalendars.map((cal) => (
                    <SelectItem key={cal.id} value={cal.id}>
                      {cal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-1.5">
            <Label>Priorita</Label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPriority("")}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                  priority === ""
                    ? "bg-muted border-foreground/20 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                Žádná
              </button>
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1",
                    priority === p.value
                      ? "bg-muted border-foreground/20 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full shrink-0", p.dot)} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color / Etiquette */}
          <fieldset className="space-y-1.5">
            <legend className="text-foreground text-sm leading-none font-medium">Barva</legend>
            <RadioGroup
              className="flex gap-1.5"
              value={color}
              onValueChange={(value: EventColor) => setColor(value)}
            >
              {colorOptions.map((colorOption) => (
                <RadioGroupItem
                  key={colorOption.value}
                  id={`color-${colorOption.value}`}
                  value={colorOption.value}
                  aria-label={colorOption.label}
                  className={cn(
                    "size-5 shadow-none",
                    colorOption.bgClass,
                    colorOption.borderClass
                  )}
                />
              ))}
            </RadioGroup>
          </fieldset>

          {/* Recurrence – only for new events or recurring instances */}
          {(!isExistingEvent || isRecurringInstance) && (
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recurrence-enabled"
                  checked={recurrenceEnabled}
                  onCheckedChange={(v) => setRecurrenceEnabled(v === true)}
                  disabled={isRecurringInstance}
                />
                <Label htmlFor="recurrence-enabled" className="flex items-center gap-1.5 cursor-pointer">
                  <RepeatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Opakovat
                </Label>
              </div>

              {recurrenceEnabled && (
                <div className="space-y-3 pt-1 border-t">
                  {/* Frequency */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecurrenceFrequency("weekly")}
                      className={cn(
                        "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                        recurrenceFrequency === "weekly"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      Týdně
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurrenceFrequency("monthly")}
                      className={cn(
                        "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                        recurrenceFrequency === "monthly"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      Měsíčně
                    </button>
                  </div>

                  {/* Weekly day picker */}
                  {recurrenceFrequency === "weekly" && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Ve které dny</p>
                      <div className="flex gap-1">
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWeekday(day.value)}
                            className={cn(
                              "flex-1 rounded-md py-1 text-xs font-medium border transition-colors",
                              recurrenceDays.includes(day.value)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-muted text-muted-foreground"
                            )}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Monthly day picker */}
                  {recurrenceFrequency === "monthly" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Každého</span>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={recurrenceDayOfMonth}
                        onChange={(e) => setRecurrenceDayOfMonth(Number(e.target.value))}
                        className="w-16 h-8 text-xs text-center"
                      />
                      <span className="text-xs text-muted-foreground">v měsíci</span>
                    </div>
                  )}

                  {/* End date */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Konec opakování</span>
                    <Input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    {recurrenceEndDate && (
                      <button
                        type="button"
                        onClick={() => setRecurrenceEndDate("")}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row sm:justify-between">
          {isExistingEvent && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              aria-label="Smazat událost"
            >
              <RiDeleteBinLine size={16} aria-hidden="true" />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Zrušit</Button>
            <Button variant="mono" onClick={handleSave}>Uložit</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
