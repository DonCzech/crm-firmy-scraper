import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutProvider } from './layout/components/context';
import { AllTasksPage } from './pages/all-tasks/page';
import { TodayPage } from './pages/today/page';
import { UpcomingPage } from './pages/upcoming/page';
import { PriorityPage } from './pages/priority/page';
import { CompletedPage } from './pages/completed/page';

export default function TodoModule() {
  return (
    <LayoutProvider>
      <Routes>
        <Route index element={<Navigate to="all-tasks" replace />} />
        <Route path="all-tasks" element={<AllTasksPage />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="upcoming" element={<UpcomingPage />} />
        <Route path="priority" element={<PriorityPage />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="*" element={<Navigate to="all-tasks" replace />} />
      </Routes>
    </LayoutProvider>
  );
}
