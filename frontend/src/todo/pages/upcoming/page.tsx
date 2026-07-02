"use client"

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from "@/todo/layout/components/toolbar";
import { ToolbarSearch } from "@/todo/layout/components/toolbar-search";
import { useLayout } from "@/todo/layout/components/context";
import { TaskList } from "./task-list";
import { UpcomingTask } from "@/todo/types";
import { ScheduledCard, HighPriorityCard, TomorrowCard } from "./stats-cards";
import { useTodoTasks } from '@/todo/services/use-todo-tasks';
import { formatRelativeDayLabel, formatTimeLabel } from '@/todo/services/tasks';
import { NewTaskDialog } from '../components/new-task-dialog';
import { TodoNav } from '../components/todo-nav';
import { TaskEditDialog } from '../all-tasks/task-edit-dialog';

function isUpcoming(dateValue?: string): boolean {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return startDate >= startNow;
}

export function UpcomingPage() {
  const { isMobile, isAsideOpen, asideToggle } = useLayout();
  const { tasks: sourceTasks, isLoading, error, toggleCompleted, create, update } = useTodoTasks();
  const [search, setSearch] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const tasks = useMemo<UpcomingTask[]>(() => {
    const query = search.trim().toLowerCase();
    return sourceTasks
      .filter((task) => isUpcoming(task.dueDate))
      .filter((task) => !query || task.title.toLowerCase().includes(query))
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: formatRelativeDayLabel(task.dueDate),
        time: formatTimeLabel(task.dueDate),
        priority: task.priority,
        completed: task.status === 'done',
      }));
  }, [search, sourceTasks]);

  const editingTask = useMemo(
    () => sourceTasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, sourceTasks],
  );

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    try {
      await toggleCompleted(taskId, !task.completed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Uložení úkolu selhalo.');
    }
  };

  const pendingCount = tasks.filter(t => !t.completed).length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  const tomorrowCount = tasks.filter(t => t.date === 'Tomorrow' && !t.completed).length;

  return (
    <div className="container-fluid py-5">
      <TodoNav />
      <ToolbarSearch value={search} onChange={setSearch} />
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Upcoming Tasks</ToolbarPageTitle>
          <ToolbarDescription>{pendingCount} tasks scheduled</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <NewTaskDialog onCreate={async (payload) => { await create(payload); }} />
          {!isMobile && !isAsideOpen && <Button type="button" mode="icon" variant="outline" onClick={asideToggle}><Sparkles className="size-4" /></Button>}
        </ToolbarActions>
      </Toolbar>
      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

      {isLoading ? (
        <div className="rounded-md border bg-card p-5 text-sm text-muted-foreground">Loading tasks...</div>
      ) : (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ScheduledCard count={pendingCount} />
          <HighPriorityCard count={highPriorityCount} />
          <TomorrowCard count={tomorrowCount} />
        </div>

        <TaskList tasks={tasks} onToggleTask={handleToggleTask} onEditTask={setEditingTaskId} />
      </div>
      )}
      <TaskEditDialog
        open={Boolean(editingTaskId && editingTask)}
        task={editingTask}
        onOpenChange={(open) => {
          if (!open) setEditingTaskId(null);
        }}
        onSave={async (taskId, payload) => {
          try {
            await update(taskId, payload);
            toast.success('Úkol byl upraven.');
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Uložení úkolu selhalo.');
          }
        }}
      />
    </div>
  );
}
