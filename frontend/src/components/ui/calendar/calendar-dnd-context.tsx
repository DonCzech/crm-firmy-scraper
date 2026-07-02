"use client"

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { addHours } from "date-fns"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { addMinutes, differenceInMinutes } from "date-fns"

import type { CalendarEvent, SidebarTask } from "./types"
import { EventItem } from "./event-item"

// Define the context type
type CalendarDndContextType = {
  activeEvent: CalendarEvent | null
  activeId: UniqueIdentifier | null
  activeView: "month" | "week" | "day" | null
  currentTime: Date | null
  eventHeight: number | null
  isMultiDay: boolean
  multiDayWidth: number | null
  dragHandlePosition: {
    x?: number
    y?: number
    data?: {
      isFirstDay?: boolean
      isLastDay?: boolean
    }
  } | null
  isSidebarTask: boolean
}

// Create the context
const CalendarDndContext = createContext<CalendarDndContextType>({
  activeEvent: null,
  activeId: null,
  activeView: null,
  currentTime: null,
  eventHeight: null,
  isMultiDay: false,
  multiDayWidth: null,
  dragHandlePosition: null,
  isSidebarTask: false,
})

// Hook to use the context
export const useCalendarDnd = () => useContext(CalendarDndContext)

// Props for the provider
interface CalendarDndProviderProps {
  children: ReactNode
  onEventUpdate: (event: CalendarEvent) => void
  onSidebarTaskDrop?: (task: SidebarTask, start: Date, end: Date) => void
}

export function CalendarDndProvider({
  children,
  onEventUpdate,
  onSidebarTaskDrop,
}: CalendarDndProviderProps) {
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeView, setActiveView] = useState<"month" | "week" | "day" | null>(
    null
  )
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [eventHeight, setEventHeight] = useState<number | null>(null)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [multiDayWidth, setMultiDayWidth] = useState<number | null>(null)
  const [dragHandlePosition, setDragHandlePosition] = useState<{
    x?: number
    y?: number
    data?: {
      isFirstDay?: boolean
      isLastDay?: boolean
    }
  } | null>(null)
  const [isSidebarTask, setIsSidebarTask] = useState(false)
  const activeSidebarTask = useRef<SidebarTask | null>(null)

  // Store original event dimensions
  const eventDimensions = useRef<{ height: number }>({ height: 0 })

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 5px before activating
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      // Require the pointer to move by 5px before activating
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Generate a stable ID for the DndContext
  const dndContextId = useId()

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    // Add safety check for data.current
    if (!active.data.current) {
      console.error("Missing data in drag start event", event)
      return
    }

    // ── Sidebar task drag ──
    if (active.data.current.type === "sidebar-task") {
      const task = active.data.current.task as SidebarTask
      activeSidebarTask.current = task
      const fakeStart = new Date()
      fakeStart.setMinutes(0, 0, 0)
      const fakeEvent: CalendarEvent = {
        id: `sidebar-task:${task.id}`,
        title: task.title,
        description: task.description,
        start: fakeStart,
        end: addHours(fakeStart, 1),
        color: "sky",
        priority: task.priority,
      }
      setActiveEvent(fakeEvent)
      setActiveId(active.id)
      setActiveView("week")
      setCurrentTime(fakeStart)
      setIsSidebarTask(true)
      return
    }

    const {
      event: calendarEvent,
      view,
      height,
      isMultiDay: eventIsMultiDay,
      multiDayWidth: eventMultiDayWidth,
      dragHandlePosition: eventDragHandlePosition,
    } = active.data.current as {
      event: CalendarEvent
      view: "month" | "week" | "day"
      height?: number
      isMultiDay?: boolean
      multiDayWidth?: number
      dragHandlePosition?: {
        x?: number
        y?: number
        data?: {
          isFirstDay?: boolean
          isLastDay?: boolean
        }
      }
    }

    setActiveEvent(calendarEvent)
    setActiveId(active.id)
    setActiveView(view)
    setCurrentTime(new Date(calendarEvent.start))
    setIsMultiDay(eventIsMultiDay || false)
    setMultiDayWidth(eventMultiDayWidth || null)
    setDragHandlePosition(eventDragHandlePosition || null)

    // Store event height if provided
    if (height) {
      eventDimensions.current.height = height
      setEventHeight(height)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event

    if (over && activeEvent && over.data.current) {
      const { date, time } = over.data.current as { date: Date; time?: number }

      // Update time for week/day views
      if (time !== undefined && activeView !== "month") {
        const newTime = new Date(date)

        // Calculate hours and minutes with 15-minute precision
        const hours = Math.floor(time)
        const fractionalHour = time - hours

        // Map to nearest 15 minute interval (0, 0.25, 0.5, 0.75)
        let minutes = 0
        if (fractionalHour < 0.125) minutes = 0
        else if (fractionalHour < 0.375) minutes = 15
        else if (fractionalHour < 0.625) minutes = 30
        else minutes = 45

        newTime.setHours(hours, minutes, 0, 0)

        // Only update if time has changed
        if (
          !currentTime ||
          newTime.getHours() !== currentTime.getHours() ||
          newTime.getMinutes() !== currentTime.getMinutes() ||
          newTime.getDate() !== currentTime.getDate() ||
          newTime.getMonth() !== currentTime.getMonth() ||
          newTime.getFullYear() !== currentTime.getFullYear()
        ) {
          setCurrentTime(newTime)
        }
      } else if (activeView === "month") {
        // For month view, just update the date but preserve time
        const newTime = new Date(date)
        if (currentTime) {
          newTime.setHours(
            currentTime.getHours(),
            currentTime.getMinutes(),
            currentTime.getSeconds(),
            currentTime.getMilliseconds()
          )
        }

        // Only update if date has changed
        if (
          !currentTime ||
          newTime.getDate() !== currentTime.getDate() ||
          newTime.getMonth() !== currentTime.getMonth() ||
          newTime.getFullYear() !== currentTime.getFullYear()
        ) {
          setCurrentTime(newTime)
        }
      }
    }
  }

  const resetDragState = () => {
    setActiveEvent(null)
    setActiveId(null)
    setActiveView(null)
    setCurrentTime(null)
    setEventHeight(null)
    setIsMultiDay(false)
    setMultiDayWidth(null)
    setDragHandlePosition(null)
    setIsSidebarTask(false)
    activeSidebarTask.current = null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Add robust error checking
    if (!over || !activeEvent || !currentTime) {
      resetDragState()
      return
    }

    try {
      // Safely access data with checks
      if (!active.data.current || !over.data.current) {
        throw new Error("Missing data in drag event")
      }

      const overData = over.data.current as { date?: Date; time?: number }
      if (!overData.date) throw new Error("Missing drop target date")

      const date = overData.date
      const time = overData.time

      // Calculate new start time
      const newStart = new Date(date)

      if (time !== undefined) {
        const hours = Math.floor(time)
        const fractionalHour = time - hours
        let minutes = 0
        if (fractionalHour < 0.125) minutes = 0
        else if (fractionalHour < 0.375) minutes = 15
        else if (fractionalHour < 0.625) minutes = 30
        else minutes = 45
        newStart.setHours(hours, minutes, 0, 0)
      } else {
        newStart.setHours(
          currentTime.getHours(),
          currentTime.getMinutes(),
          currentTime.getSeconds(),
          currentTime.getMilliseconds()
        )
      }

      // ── Sidebar task drop ──
      if (active.data.current.type === "sidebar-task" && activeSidebarTask.current) {
        const newEnd = addMinutes(newStart, 60)
        onSidebarTaskDrop?.(activeSidebarTask.current, newStart, newEnd)
        return
      }

      // ── Regular event drag ──
      const activeData = active.data.current as { event?: CalendarEvent }
      if (!activeData.event) throw new Error("Missing required event data")

      const calendarEvent = activeData.event
      const originalStart = new Date(calendarEvent.start)
      const originalEnd = new Date(calendarEvent.end)
      const durationMinutes = differenceInMinutes(originalEnd, originalStart)
      const newEnd = addMinutes(newStart, durationMinutes)

      const hasStartTimeChanged =
        originalStart.getFullYear() !== newStart.getFullYear() ||
        originalStart.getMonth() !== newStart.getMonth() ||
        originalStart.getDate() !== newStart.getDate() ||
        originalStart.getHours() !== newStart.getHours() ||
        originalStart.getMinutes() !== newStart.getMinutes()

      if (hasStartTimeChanged) {
        onEventUpdate({ ...calendarEvent, start: newStart, end: newEnd })
      }
    } catch (error) {
      console.error("Error in drag end handler:", error)
    } finally {
      resetDragState()
    }
  }

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <CalendarDndContext.Provider
        value={{
          activeEvent,
          activeId,
          activeView,
          currentTime,
          eventHeight,
          isMultiDay,
          multiDayWidth,
          dragHandlePosition,
          isSidebarTask,
        }}
      >
        {children}

        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeEvent && activeView && (
            isSidebarTask ? (
              <div className="w-36 rounded-md border-l-[3px] border-sky-500 bg-sky-100 px-2 py-1.5 shadow-lg opacity-95 pointer-events-none">
                <p className="truncate text-xs font-semibold text-sky-900 leading-tight">{activeEvent.title}</p>
                <p className="text-[10px] text-sky-700 mt-0.5">Přetáhni do pole</p>
              </div>
            ) : (
              <div
                style={{
                  height: eventHeight ? `${eventHeight}px` : "auto",
                  width:
                    isMultiDay && multiDayWidth ? `${multiDayWidth}%` : "100%",
                }}
              >
                <EventItem
                  event={activeEvent}
                  view={activeView}
                  isDragging={true}
                  showTime={activeView !== "month"}
                  currentTime={currentTime || undefined}
                  isFirstDay={dragHandlePosition?.data?.isFirstDay !== false}
                  isLastDay={dragHandlePosition?.data?.isLastDay !== false}
                />
              </div>
            )
          )}
        </DragOverlay>
      </CalendarDndContext.Provider>
    </DndContext>
  )
}
