"use client"

import { useMemo, useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { differenceInCalendarDays, isToday } from "date-fns"
import { CheckCircle2, Circle, GripVertical, ListTodo, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { EventPriority, SidebarTask } from "./types"

// ── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<EventPriority, string> = {
  low:    "bg-slate-400",
  medium: "bg-yellow-400",
  high:   "bg-orange-400",
  urgent: "bg-rose-500",
}

// ── Draggable task chip ───────────────────────────────────────────────────────

function DraggableTaskChip({
  task,
  onToggleDone,
}: {
  task: SidebarTask
  onToggleDone?: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `sidebar-task:${task.id}`,
      data: {
        type: "sidebar-task",
        taskId: task.id,
        task,
      },
    })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const done = task.status === "done"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-sm transition-all",
        "cursor-grab touch-none select-none active:cursor-grabbing",
        "hover:border-sky-300 hover:shadow-sm hover:bg-sky-50/40",
        isDragging && "opacity-30",
        done && "opacity-50",
      )}
      title="Přetáhni do kalendáře pro naplánování"
    >
      {/* Done toggle – stopPropagation so click doesn't start drag */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onToggleDone?.(task.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        title={done ? "Označit jako nedokončeno" : "Dokončit"}
      >
        {done
          ? <CheckCircle2 className="size-4 text-emerald-500" />
          : <Circle className="size-4" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("truncate text-xs font-medium leading-tight", done && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.contactName && (
          <p className="truncate text-[10px] text-muted-foreground leading-tight mt-0.5">
            {task.contactName}
          </p>
        )}
      </div>

      {/* Priority dot */}
      {task.priority && PRIORITY_DOT[task.priority] && (
        <span className={cn("size-2 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />
      )}

      {/* Drag hint icon */}
      <GripVertical className="size-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity" />
    </div>
  )
}

// ── Group label ───────────────────────────────────────────────────────────────

type Group = "overdue" | "today" | "upcoming" | "nodate"

function groupTask(task: SidebarTask): Group {
  if (!task.dueDate) return "nodate"
  const d = new Date(task.dueDate)
  if (isToday(d)) return "today"
  if (differenceInCalendarDays(d, new Date()) < 0) return "overdue"
  return "upcoming"
}

const GROUP_ORDER: Group[] = ["overdue", "today", "upcoming", "nodate"]
const GROUP_LABELS: Record<Group, string> = {
  overdue:  "Po termínu",
  today:    "Dnes",
  upcoming: "Nadcházející",
  nodate:   "Bez data",
}
const GROUP_COLORS: Record<Group, string> = {
  overdue:  "text-rose-600",
  today:    "text-sky-600",
  upcoming: "text-foreground",
  nodate:   "text-muted-foreground",
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

interface TasksSidebarProps {
  tasks: SidebarTask[]
  onToggleDone?: (id: string) => void
  onClose?: () => void
}

export function TasksSidebar({ tasks, onToggleDone, onClose }: TasksSidebarProps) {
  const [showDone, setShowDone] = useState(false)

  const pending = useMemo(() => tasks.filter((t) => t.status !== "done"), [tasks])
  const done    = useMemo(() => tasks.filter((t) => t.status === "done"), [tasks])

  const grouped = useMemo(() => {
    const map: Record<Group, SidebarTask[]> = { overdue: [], today: [], upcoming: [], nodate: [] }
    for (const t of pending) map[groupTask(t)].push(t)
    return map
  }, [pending])

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ListTodo className="size-4 text-sky-500" />
          <span className="text-sm font-semibold">Úkoly</span>
          {pending.length > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
              {pending.length}
            </span>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Skrýt úkoly"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Hint */}
      <p className="px-4 pt-2 pb-1 text-[10px] text-muted-foreground">
        Přetáhni úkol do pole kalendáře pro naplánování
      </p>

      {/* Task groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 pt-2">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-8 text-emerald-400" />
            <p className="text-sm font-medium text-muted-foreground">Vše splněno!</p>
          </div>
        ) : (
          GROUP_ORDER.map((group) => {
            const items = grouped[group]
            if (!items.length) return null
            return (
              <div key={group}>
                <p className={cn("mb-1.5 text-[10px] font-semibold uppercase tracking-wide", GROUP_COLORS[group])}>
                  {GROUP_LABELS[group]} ({items.length})
                </p>
                <div className="space-y-1">
                  {items.map((task) => (
                    <DraggableTaskChip key={task.id} task={task} onToggleDone={onToggleDone} />
                  ))}
                </div>
              </div>
            )
          })
        )}

        {/* Completed section */}
        {done.length > 0 && (
          <div>
            <button
              type="button"
              className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowDone((v) => !v)}
            >
              {showDone ? "▾" : "▸"} Dokončeno ({done.length})
            </button>
            {showDone && (
              <div className="space-y-1">
                {done.map((task) => (
                  <DraggableTaskChip key={task.id} task={task} onToggleDone={onToggleDone} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
