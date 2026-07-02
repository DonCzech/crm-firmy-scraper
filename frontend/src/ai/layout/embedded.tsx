import { Outlet } from 'react-router-dom';
import { ChatsProvider } from './components/chats-context';

export function EmbeddedLayout() {
  return (
    <ChatsProvider>
      {/* Fill the remaining viewport height (below header ~60px + top padding ~20px) */}
      <div className="flex flex-col" style={{ height: 'calc(100vh - 60px - 20px)' }}>
        <Outlet />
      </div>
    </ChatsProvider>
  );
}
