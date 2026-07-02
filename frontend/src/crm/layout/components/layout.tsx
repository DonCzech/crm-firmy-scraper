import { Outlet } from 'react-router';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Header } from './header';
import { useLayout } from './layout-context';
import { Sidebar } from './sidebar';

export function Layout() {
  const { sidebarCollapse } = useLayout();
  const isMobile = useIsMobile();

  const rootProps = {
    className: cn(
      'flex grow h-screen min-w-0 flex-col overflow-hidden',
      '[--header-height:40px]',
      '[--content-header-height:54px]',
      '[--sidebar-width:250px] [--sidebar-width-collapsed:52px] [--sidebar-header-height:54px] [--sidebar-footer-height:45px] [--sidebar-footer-collapsed-height:90px]',
    ),
    ...(sidebarCollapse === true && { 'data-sidebar-collapsed': true }),
  };

  return (
    <div {...rootProps}>
      <Header />
      <div className="flex min-w-0 flex-1">
        {!isMobile && <Sidebar />}
        <main className="mt-(--header-height) flex min-w-0 flex-1 flex-col lg:mt-[calc(var(--header-height)+var(--content-header-height))] lg:ms-(--sidebar-width) lg:in-data-[sidebar-collapsed]:ms-(--sidebar-width-collapsed) transition-[margin] duration-200 ease-in-out pb-14 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
