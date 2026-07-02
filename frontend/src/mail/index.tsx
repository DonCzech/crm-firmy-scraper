import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LayoutProvider } from './layout/components/context';
import { InboxPage } from './pages/inbox/page';
import { SentPage } from './pages/sent/page';
import { DraftPage } from './pages/draft/page';
import { NewMailPage } from './pages/new/page';

export default function MailModule() {
  return (
    <LayoutProvider
      sidebarCollapsed={false}
      bodyClassName="bg-zinc-100 dark:bg-zinc-900 lg:overflow-hidden"
      style={
        {
          '--sidebar-width': '240px',
          '--sidebar-width-collapse': '60px',
          '--sidebar-width-mobile': '240px',
          '--aside-width': '50px',
          '--aside-width-mobile': '50px',
          '--page-space': '10px',
          '--header-height-mobile': '60px',
          '--mail-list-width': '400px',
        } as React.CSSProperties
      }
    >
      <Routes>
        <Route index element={<Navigate to="inbox" replace />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="new" element={<NewMailPage />} />
        <Route path="sent" element={<SentPage />} />
        <Route path="draft" element={<DraftPage />} />
        <Route path="*" element={<Navigate to="inbox" replace />} />
      </Routes>
    </LayoutProvider>
  );
}
