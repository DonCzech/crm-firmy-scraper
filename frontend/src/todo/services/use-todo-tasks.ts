import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createTodoTask,
  getColumnByStatus,
  listTodoTasks,
  removeTodoTask,
  toggleTodoTask,
  updateTodoTask,
  updateTodoTaskStatus,
  type TodoColumn,
  type TodoPriority,
  type TodoStatus,
  type TodoTaskRecord,
} from '@/todo/services/tasks';

export function useTodoTasks() {
  const [tasks, setTasks] = useState<TodoTaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listTodoTasks();
      setTasks(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se načíst úkoly.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (payload: { title: string; description?: string; dueDate?: string; priority?: TodoPriority }) => {
      const created = await createTodoTask(payload);
      setTasks((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const moveToColumn = useCallback(async (taskId: string, column: TodoColumn) => {
    const targetStatus = column === 'done' ? 'done' : column === 'inProgress' ? 'in_progress' : 'todo';
    const previous = tasks;
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: targetStatus } : task)),
    );
    try {
      await updateTodoTaskStatus(taskId, targetStatus);
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  }, [tasks]);

  const toggleCompleted = useCallback(async (taskId: string, completed: boolean) => {
    const previous = tasks;
    const nextStatus = completed ? 'done' : 'todo';
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)),
    );
    try {
      await toggleTodoTask(taskId, completed);
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  }, [tasks]);

  const remove = useCallback(async (taskId: string) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    try {
      await removeTodoTask(taskId);
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  }, [tasks]);

  const update = useCallback(async (
    taskId: string,
    payload: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: TodoPriority;
      status?: TodoStatus;
    },
  ) => {
    const previous = tasks;
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...payload } : task)),
    );
    try {
      const updated = await updateTodoTask(taskId, payload);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
      return updated;
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  }, [tasks]);

  const groupedColumns = useMemo(
    () => ({
      review: tasks.filter((task) => getColumnByStatus(task.status) === 'review'),
      inProgress: tasks.filter((task) => getColumnByStatus(task.status) === 'inProgress'),
      done: tasks.filter((task) => getColumnByStatus(task.status) === 'done'),
    }),
    [tasks],
  );

  return {
    tasks,
    groupedColumns,
    isLoading,
    error,
    reload,
    create,
    moveToColumn,
    toggleCompleted,
    remove,
    update,
  };
}
