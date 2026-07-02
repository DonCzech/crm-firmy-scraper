"use client"

import * as React from 'react';
import { KanbanSquare, List, Sparkles, Table2 } from "lucide-react";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Kanban,
  KanbanBoard,
  type KanbanMoveEvent,
  KanbanOverlay,
} from "@/components/ui/kanban";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from "@/todo/layout/components/toolbar";
import { ToolbarSearch } from "@/todo/layout/components/toolbar-search";
import { useLayout } from "@/todo/layout/components/context";
import type { TodoColumn } from '@/todo/services/tasks';
import { Task } from "@/todo/types";
import { useTodoTasks } from '@/todo/services/use-todo-tasks';
import { TaskColumn } from "./task-column";
import { NewTaskDialog } from '../components/new-task-dialog';
import { TodoNav } from '../components/todo-nav';
import { TaskEditDialog } from './task-edit-dialog';
import { TaskRowsView, TaskTableView } from './task-list-views';

function toUiTask(task: {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString('cs-CZ', { day: '2-digit', month: 'short' })
      : undefined,
  };
}

export function AllTasksPage() {
  const { isMobile, isAsideOpen, asideToggle } = useLayout();
  const { tasks, groupedColumns, isLoading, error, create, moveToColumn, remove, update, reload } = useTodoTasks();
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'columns' | 'rows' | 'table'>('columns');
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [columns, setColumns] = React.useState<Record<string, Task[]>>({
    review: [],
    inProgress: [],
    done: [],
  });

  const filteredTaskRecords = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) =>
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description ?? '').toLowerCase().includes(query),
    );
  }, [search, tasks]);

  const editingTask = React.useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [editingTaskId, tasks],
  );

  React.useEffect(() => {
    const query = search.trim().toLowerCase();
    const filterBySearch = (task: Task) =>
      !query ||
      task.title.toLowerCase().includes(query) ||
      (task.description ?? '').toLowerCase().includes(query);

    setColumns({
      review: groupedColumns.review.map(toUiTask).filter(filterBySearch),
      inProgress: groupedColumns.inProgress.map(toUiTask).filter(filterBySearch),
      done: groupedColumns.done.map(toUiTask).filter(filterBySearch),
    });
  }, [groupedColumns, search]);

  const totalTasks = React.useMemo(() => 
    Object.values(columns).reduce((acc, tasks) => acc + tasks.length, 0), 
    [columns]
  );

  const handleKanbanChange = (next: Record<string, Task[]>) => {
    if (!next || typeof next !== 'object') return;
    setColumns(next);
  };

  const handleKanbanMove = ({ event, activeContainer, overContainer }: KanbanMoveEvent) => {
    if (activeContainer === overContainer) return;
    const taskId = String(event.active.id);
    const target = overContainer as TodoColumn;
    if (!['review', 'inProgress', 'done'].includes(target)) return;

    void moveToColumn(taskId, target)
      .then(() => {
        toast.success('Úkol byl přesunut.');
      })
      .catch(async (err) => {
        toast.error(err instanceof Error ? err.message : 'Uložení změny selhalo.');
        await reload();
      });
  };

  return (
    <div className="container-fluid py-5">
      <TodoNav />
      <ToolbarSearch value={search} onChange={setSearch} />
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle>All Tasks</ToolbarPageTitle>
          <ToolbarDescription>{totalTasks} tasks in total</ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <div className="hidden sm:flex items-center rounded-md border border-input p-0.5">
            <Button
              type="button"
              variant={viewMode === 'columns' ? 'mono' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('columns')}
            >
              <KanbanSquare className="size-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'rows' ? 'mono' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('rows')}
            >
              <List className="size-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'table' ? 'mono' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table2 className="size-4" />
            </Button>
          </div>
          <NewTaskDialog onCreate={async (payload) => { await create(payload); }} />
          {!isMobile && !isAsideOpen && (
            <Button type="button" mode="icon" variant="outline" onClick={asideToggle}>
              <Sparkles className="size-4" />
            </Button>
          )}
        </ToolbarActions>
      </Toolbar>

      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
      {isLoading ? (
        <div className="rounded-md border bg-card p-5 text-sm text-muted-foreground">Loading tasks...</div>
      ) : viewMode === 'rows' ? (
        <TaskRowsView
          tasks={filteredTaskRecords}
          onEdit={(task) => setEditingTaskId(task.id)}
          onDelete={(taskId) => {
            void remove(taskId).catch((err) => {
              toast.error(err instanceof Error ? err.message : 'Smazání úkolu selhalo.');
            });
          }}
        />
      ) : viewMode === 'table' ? (
        <TaskTableView
          tasks={filteredTaskRecords}
          onEdit={(task) => setEditingTaskId(task.id)}
          onDelete={(taskId) => {
            void remove(taskId).catch((err) => {
              toast.error(err instanceof Error ? err.message : 'Smazání úkolu selhalo.');
            });
          }}
        />
      ) : (
      <Kanban
        value={columns}
        onValueChange={handleKanbanChange}
        onMove={handleKanbanMove}
        getItemValue={(item) => item.id}
      >
        <KanbanBoard className="grid auto-rows-fr grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(columns).map(([columnValue, tasks]) => (
            <TaskColumn
              key={columnValue}
              value={columnValue}
              tasks={tasks}
              onEditTask={(task) => setEditingTaskId(task.id)}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          <div className="rounded-md bg-muted/60 size-full" />
        </KanbanOverlay>
      </Kanban>
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
