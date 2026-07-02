'use client';

import { useEffect, useState } from 'react';
import { fetchTasks } from '@/crm/services/backend';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/localization/language-context';

interface TaskData {
  progress: number;
  tasksDone: number;
  backlog: number;
  inProgress: number;
  inReview: number;
  prediction: string;
}

type BackendTask = {
  status?: string;
  createdAt?: string;
  dueDate?: string | null;
  updatedAt?: string;
};

function inSelectedRange(task: BackendTask, range: string, now: Date) {
  const rawDate = task.dueDate ?? task.updatedAt ?? task.createdAt;
  const date = rawDate ? new Date(rawDate) : null;
  if (!date || Number.isNaN(date.getTime())) return false;

  if (range === 'this-month') {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  if (range === 'last-month') {
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      date.getMonth() === last.getMonth() &&
      date.getFullYear() === last.getFullYear()
    );
  }

  if (range === 'this-year') {
    return date.getFullYear() === now.getFullYear();
  }

  const lastYear = now.getFullYear() - 1;
  return date.getFullYear() === lastYear;
}

function deriveTaskStats(tasks: BackendTask[]): TaskData {
  const done = tasks.filter((task) => task.status === 'done').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const pending = tasks.filter((task) => task.status !== 'done').length;
  const total = tasks.length;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;
  return {
    progress: completion,
    tasksDone: done,
    backlog: pending,
    inProgress,
    inReview: Math.max(0, pending - inProgress),
    prediction: pending > 0 ? `${Math.max(1, Math.round(pending / 3))}d` : '0d',
  };
}

export function TasksOverview() {
  const { language } = useLanguage();
  const t =
    language === 'cs'
      ? {
          title: 'Přehled úkolů',
          selectRange: 'Vybrat období',
          thisMonth: 'Tento měsíc',
          lastMonth: 'Minulý měsíc',
          thisYear: 'Tento rok',
          lastYear: 'Minulý rok',
          tasksDone: 'Splněné úkoly',
          followUps: 'Follow-upy',
          inProgress: 'Rozpracováno',
          pending: 'Čekající',
          aiPrediction: 'AI odhad dokončení všech úkolů:',
        }
      : {
          title: 'Tasks Overview',
          selectRange: 'Select range',
          thisMonth: 'This Month',
          lastMonth: 'Last Month',
          thisYear: 'This Year',
          lastYear: 'Last Year',
          tasksDone: 'Tasks Done',
          followUps: 'Follow-ups',
          inProgress: 'In Progress',
          pending: 'Pending',
          aiPrediction: 'AI prediction to complete all tasks:',
        };

  const [selectedRange, setSelectedRange] = useState('this-month');
  const [progress, setProgress] = useState(0);
  const [allTasks, setAllTasks] = useState<BackendTask[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadTaskStats = async () => {
      try {
        const tasksResponse = await fetchTasks({ limit: 500 });
        if (isMounted) setAllTasks((tasksResponse?.data ?? []) as BackendTask[]);
      } catch {
        if (isMounted) setAllTasks([]);
      }
    };

    loadTaskStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderedData = (() => {
    const now = new Date();
    const inRange = allTasks.filter((task) => inSelectedRange(task, selectedRange, now));
    return deriveTaskStats(inRange);
  })();

  useEffect(() => {
    const timer = setTimeout(() => setProgress(renderedData.progress), 800);
    return () => clearTimeout(timer);
  }, [renderedData.progress]);

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    setProgress(0);
  };

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardToolbar>
          <Select value={selectedRange} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t.selectRange} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">{t.thisMonth}</SelectItem>
              <SelectItem value="last-month">{t.lastMonth}</SelectItem>
              <SelectItem value="this-year">{t.thisYear}</SelectItem>
              <SelectItem value="last-year">{t.lastYear}</SelectItem>
            </SelectContent>
          </Select>
        </CardToolbar>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Progress bar and done tasks */}
        <div className="grow mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">
              {t.tasksDone}
            </span>
              <span className="text-sm font-semibold text-success">
                {renderedData.tasksDone}
              </span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Task summary */}
        <div className="space-y-6">
          {/* Tasks list */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col items-center justify-center bg-muted/60 rounded-lg py-3.5 px-2 gap-1">
              <span className="text-lg font-bold text-green-500">
                {renderedData.backlog}
              </span>
              <span className="text-xs text-accent-foreground">{t.followUps}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-muted/60 rounded-lg py-3.5 px-2 gap-1">
              <span className="text-lg font-bold text-yellow-500">
                {renderedData.inProgress}
              </span>
              <span className="text-xs text-accent-foreground">
                {t.inProgress}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center bg-muted/60 rounded-lg py-3.5 px-2 gap-1">
              <span className="text-lg font-bold text-violet-500">
                {renderedData.inReview}
              </span>
              <span className="text-xs text-accent-foreground">{t.pending}</span>
            </div>
          </div>

          {/* AI prediction footer */}
          <div className="text-xs text-muted-foreground text-center">
            {t.aiPrediction}{' '}
              <span className="font-semibold text-foreground">
                {renderedData.prediction}
              </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
