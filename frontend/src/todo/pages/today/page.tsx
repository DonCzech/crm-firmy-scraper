"use client"

import * as React from 'react';
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
import { useLayout } from "@/todo/layout/components/context";
import { ToolbarSearch } from "@/todo/layout/components/toolbar-search";
import { TodayTask } from "@/todo/types";
import { TaskList } from "./task-list";
import { ProgressCard, HighPriorityCard, StreakCard } from "./stats-cards";
import { useTodoTasks } from '@/todo/services/use-todo-tasks';
import { formatTimeLabel } from '@/todo/services/tasks';
import { NewTaskDialog } from '../components/new-task-dialog';
import { TodoNav } from '../components/todo-nav';
import { TaskEditDialog } from '../all-tasks/task-edit-dialog';

function isToday(dateValue?: string): boolean {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function TodayPage() {
  const { isMobile, isAsideOpen, asideToggle } = useLayout();
  const { tasks: sourceTasks, isLoading, error, toggleCompleted, create, update } = useTodoTasks();
  const [search, setSearch] = React.useState('');
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  const tasks = React.useMemo<TodayTask[]>(() => {
    const query = search.trim().toLowerCase();
    return sourceTasks
      .filter((task) => isToday(task.dueDate))
      .filter((task) => !query || task.title.toLowerCase().includes(query))
      .map((task) => ({
        id: task.id,
        title: task.title,
        time: formatTimeLabel(task.dueDate),
        priority: task.priority,
        completed: task.status === 'done',
      }));
  }, [sourceTasks, search]);

  const editingTask = React.useMemo(
    () => sourceTasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, sourceTasks],
  );

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    try {
      await toggleCompleted(taskId, !task.completed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Uložení úkolu selhalo.');
    }
  };

  return (
    <div className="container-fluid py-5">
      <TodoNav />
      <ToolbarSearch value={search} onChange={setSearch} />
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Today Activities</ToolbarPageTitle>
          <ToolbarDescription>Manage your reminders, to do list, events, etc.</ToolbarDescription>
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
          <ProgressCard 
            completedCount={completedCount} 
            totalCount={totalCount} 
            progressPercent={progressPercent} 
          />
          <HighPriorityCard count={highPriorityCount} />
          <StreakCard days={5} />
        </div>

        <TaskList tasks={tasks} onToggleTask={toggleTask} onEditTask={setEditingTaskId} />
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
