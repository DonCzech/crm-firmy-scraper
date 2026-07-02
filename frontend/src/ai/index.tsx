import { Routes, Route, Navigate } from 'react-router-dom';
import { EmbeddedLayout } from './layout/embedded';
import { AIChatPage } from './pages/chat';
import { AIStartPage } from './pages/start';

export default function AIModule() {
  return (
    <Routes>
      <Route element={<EmbeddedLayout />}>
        <Route index element={<Navigate to="start" replace />} />
        <Route path="start" element={<AIStartPage />} />
        <Route path="chat" element={<AIChatPage />} />
      </Route>
    </Routes>
  );
}
