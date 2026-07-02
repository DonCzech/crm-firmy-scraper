import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
} from '@/components/ui/accordion-menu';
import { cn } from "@/lib/utils";
import { LucideIcon, Settings, MessageSquare, Headset } from "lucide-react";
import { useLanguage } from "@/localization/language-context";

interface MenuConfig {
  title: string;
  icon?: LucideIcon;
  count?: number;
  path?: string;
  children?: MenuConfig[];
}

export function SidebarFooter() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const MENU_CONFIG: MenuConfig[] = [
    {
      title: language === "cs" ? "Podpora" : 'Support',
      path: '/core/mail/inbox',
      icon: Headset,
    },
    {
      title: language === "cs" ? "Nastavení" : 'Settings',
      path: '/core/mail/inbox',
      icon: Settings,
    },
    {
      title: language === "cs" ? "Zpětná vazba" : 'Feedback',
      path: '/core/mail/inbox',
      icon: MessageSquare,
    },
  ];

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname || (path.length > 1 && pathname.startsWith(path) && path !== '/layout-26'),
    [pathname],
  );

  return (
    <AccordionMenu
      selectedValue={pathname}
      matchPath={matchPath}
      type="multiple"
      className="space-y-7.5 in-data-[sidebar-collapsed=true]:flex items-center in-data-[sidebar-collapsed=true]:justify-center"
      classNames={{
        label: 'text-xs font-normal text-muted-foreground',
        item: cn(
          'flex items-center justify-center h-8 px-2 text-2sm font-normal text-foreground mx-4 in-data-[sidebar-collapsed=true]:mx-0', 
          'hover:text-primary hover:bg-background dark:hover:bg-zinc-900 in-data-[sidebar-collapsed=true]:w-8',
          'data-[selected=true]:bg-background dark:data-[selected=true]:bg-zinc-900 data-[selected=true]:text-primary [&[data-selected=true]_svg]:opacity-100',
        ),
        group: '',
      }}
    >
      <AccordionMenuGroup>
        {MENU_CONFIG.map((item, index) => {
          return (
            <AccordionMenuItem key={index} value={item.path || '/core/mail/inbox'}>
              <Link to={item.path || '/core/mail/inbox'}>
                {item.icon && <item.icon />}
                <span className="in-data-[sidebar-collapsed=true]:hidden">{item.title}</span>
              </Link>          
            </AccordionMenuItem>
          )
        })}
      </AccordionMenuGroup>
    </AccordionMenu>
  );
}
