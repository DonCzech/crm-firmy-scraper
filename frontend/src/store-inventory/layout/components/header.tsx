import { useEffect, useState } from 'react';
import { Bell, LayoutGrid, Menu, MessageCircleMore } from 'lucide-react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AppsDropdownMenu } from './apps-dropdown-menu';
import { Breadcrumb } from './breadcrumb';
import { ChatSheet } from './chat-sheet';
import { NotificationsSheet } from './notifications-sheet';
import { SearchBar } from './search-bar';
import { SidebarMenu } from './sidebar-menu';
import { UserDropdownMenu } from './user-dropdown-menu';
import { WeatherIndicator } from './weather-indicator';

export function Header() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const [headerFixedEnabled, setHeaderFixedEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const raw = window.localStorage.getItem('core_header_sticky_enabled_v1');
      return raw !== '0';
    } catch {
      return true;
    }
  });

  const { pathname } = useLocation();
  const mobileMode = useIsMobile();

  const scrollPosition = useScrollPosition();
  const headerSticky: boolean = scrollPosition > 0;

  // Close sheet when route changes
  useEffect(() => {
    setIsSidebarSheetOpen(false);
  }, [pathname]);

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

  return (
    <header
      className={cn(
        'header z-10 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)]',
        headerFixedEnabled ? 'fixed top-0' : 'relative',
        headerSticky && 'border-b border-border',
      )}
    >
      <div className="container-fluid flex justify-between items-stretch lg:gap-4">
        {/* HeaderLogo */}
        <div className="flex lg:hidden items-center gap-1">
          {mobileMode && (
            <Sheet
              open={isSidebarSheetOpen}
              onOpenChange={setIsSidebarSheetOpen}
            >
              <SheetTrigger asChild>
                <Button variant="ghost" mode="icon">
                  <Menu className="text-muted-foreground/70" />
                </Button>
              </SheetTrigger>
              <SheetContent
                className="p-0 gap-0 w-[275px]"
                side="left"
                close={false}
              >
                <SheetHeader className="p-0 space-y-0" />
                <SheetBody className="p-0 overflow-y-auto">
                  <SidebarMenu />
                </SheetBody>
              </SheetContent>
            </Sheet>
          )}
          <Link to="/core" className="shrink-0">
            <img
              src={toAbsoluteUrl('/media/app/logo-cp.svg')}
              className="h-[73px] w-auto max-w-none"
              alt="mini-logo"
            />
          </Link>
        </div>

        {/* Mega Menu */}
        {!mobileMode && <Breadcrumb />}

        {/* HeaderTopbar */}
        <div className="flex items-center gap-1 lg:gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <WeatherIndicator />
            <SearchBar />
          </div>
          <NotificationsSheet
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                shape="circle"
                className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
              >
                <Bell className="size-4.5!" />
              </Button>
            }
          />
          <div className="hidden lg:block">
            <ChatSheet
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                >
                  <MessageCircleMore className="size-4.5!" />
                </Button>
              }
            />
          </div>
          <div className="hidden lg:block">
            <AppsDropdownMenu
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                >
                  <LayoutGrid className="size-4.5!" />
                </Button>
              }
            />
          </div>
          <UserDropdownMenu />
        </div>
      </div>
    </header>
  );
}
