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
import { CompletedTask } from "@/todo/types";
import { TaskList } from "./task-list";
import { TotalCompletedCard, ThisWeekCard, ProductivityCard } from "./stats-cards";
import { useTodoTasks } from '@/todo/services/use-todo-tasks';
import { formatCompletedAtLabel } from '@/todo/services/tasks';
import { NewTaskDialog } from '../components/new-task-dialog';
import { TodoNav } from '../components/todo-nav';
import { TaskEditDialog } from '../all-tasks/task-edit-dialog';

export function CompletedPage() {
  const { isMobile, isAsideOpen, asideToggle } = useLayout();
  const { tasks: sourceTasks, isLoading, error, remove, create, update } = useTodoTasks();
  const [search, setSearch] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const tasks = useMemo<CompletedTask[]>(() => {
    const query = search.trim().toLowerCase();
    return sourceTasks
      .filter((task) => task.status === 'done')
      .filter((task) => !query || task.title.toLowerCase().includes(query))
      .map((task) => ({
        id: task.id,
        title: task.title,
        completedAt: formatCompletedAtLabel(task.updatedAt),
        priority: task.priority,
      }));
  }, [search, sourceTasks]);

  const editingTask = useMemo(
    () => sourceTasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, sourceTasks],
  );

  const totalCount = tasks.length;
  const thisWeekCount = sourceTasks.filter((task) => {
    if (task.status !== 'done') return false;
    const parsed = new Date(task.updatedAt);
    if (Number.isNaN(parsed.getTime())) return false;
    const now = new Date();
    return now.getTime() - parsed.getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const productivityScore = 85;

  const handleDeleteTask = async (taskId: string) => {
    try {
      await remove(taskId);
      toast.success('Úkol byl smazán.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Smazání úkolu selhalo.');
    }
  };

  return (
    <div className="container-fluid py-5">
      <TodoNav />
      <ToolbarSearch value={search} onChange={setSearch} />
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>Completed Tasks</ToolbarPageTitle>
          <ToolbarDescription>{totalCount} tasks completed</ToolbarDescription>
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
          <TotalCompletedCard count={totalCount} />
          <ThisWeekCard count={thisWeekCount} />
          <ProductivityCard percentage={productivityScore} />
        </div>

        <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} onEditTask={setEditingTaskId} />
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
