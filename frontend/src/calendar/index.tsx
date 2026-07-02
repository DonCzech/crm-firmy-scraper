import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LayoutProvider } from './layout/components/context';
import { CalendarPage } from './pages/page';

export default function CalendarModule() {
  return (
    <LayoutProvider>
      <Routes>
        <Route index element={<Navigate to="page" replace />} />
        <Route path="page" element={<CalendarPage />} />
        <Route path="*" element={<Navigate to="page" replace />} />
      </Routes>
    </LayoutProvider>
  );
}
