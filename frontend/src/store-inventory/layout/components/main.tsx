import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { Breadcrumb } from './breadcrumb';
import { useLayout } from './context';
import { Footer } from './footer';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function Main() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { sidebarCollapse } = useLayout();
  const [headerFixedEnabled, setHeaderFixedEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const raw = window.localStorage.getItem('core_header_sticky_enabled_v1');
      return raw !== '0';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const onHeaderStickyChange = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (typeof detail?.enabled !== 'boolean') return;
      setHeaderFixedEnabled(detail.enabled);
    };
    window.addEventListener('core-header-sticky:changed', onHeaderStickyChange as EventListener);
    return () => {
      window.removeEventListener('core-header-sticky:changed', onHeaderStickyChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const bodyClass = document.body.classList;

    if (sidebarCollapse) {
      bodyClass.add('sidebar-collapse');
    } else {
      bodyClass.remove('sidebar-collapse');
    }
  }, [sidebarCollapse]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');
    bodyClass.add('sidebar-fixed');
    if (headerFixedEnabled) {
      bodyClass.add('header-fixed');
    } else {
      bodyClass.remove('header-fixed');
    }

    const timer = setTimeout(() => {
      bodyClass.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
      bodyClass.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, [headerFixedEnabled]);

  return (
    <>
      {!isMobile && <Sidebar />}

      <div className="wrapper flex grow flex-col lg:[&_.container-fluid]:px-10">
        <Header />

        <main className="grow pt-2.5 lg:pt-5 pb-14 lg:pb-0" role="content">
          {/* Mega Menu */}
          {isMobile && pathname !== '/core/dashboard' && <Breadcrumb />}

          <Outlet />
        </main>

        <Footer />
      </div>

    </>
  );
}
