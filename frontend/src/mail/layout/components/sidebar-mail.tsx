import { useCallback } from "react";
import { Link, useLocation } from "react-router";
import {
  AccordionMenu,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
} from '@/components/ui/accordion-menu';
import { cn } from "@/lib/utils";
import { LucideIcon, Send, Inbox, FileText, SquarePen } from "lucide-react";
import { useLanguage } from "@/localization/language-context";

interface NavItem {
  title: string;
  icon?: LucideIcon;
  count?: number;
  path?: string;
  children?: NavItem[];
}

export function SidebarMail() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const NAV_CONFIG: NavItem[] = [
    {
      title: language === "cs" ? "Pošta" : "Mail",
      children: [
        {
          title: language === "cs" ? "Nový email" : "New email",
          path: '/core/mail/new',
          icon: SquarePen,
        },
        {
          title: language === "cs" ? "Doručené" : "Inbox",
          path: '/core/mail/inbox',
          count: 3,
          icon: Inbox,
        },
        {
          title: language === "cs" ? "Koncepty" : "Draft",
          path: '/core/mail/draft',
          count: 45,
          icon: FileText,
        },
        {
          title: language === "cs" ? "Odeslané" : "Sent",
          path: '/core/mail/sent',
          count: 9,
          icon: Send,
        }
      ],
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
          'h-8 px-2 text-2sm font-normal text-foreground mx-2 flex items-center justify-center', 
          'hover:text-primary hover:bg-background dark:hover:bg-zinc-900',
          'data-[selected=true]:bg-background dark:data-[selected=true]:bg-zinc-900 data-[selected=true]:text-primary [&[data-selected=true]_svg]:opacity-100',
          '',
        ),
        group: 'space-y-1',
      }}
    >
      {NAV_CONFIG.map((item, index) => {
        return (
          <AccordionMenuGroup key={index}>
            <AccordionMenuLabel className="in-data-[sidebar-collapsed=true]:text-center">
              {item.title}
            </AccordionMenuLabel>
            {item.children?.map((child, index) => {
              return (
                <AccordionMenuItem key={index} value={child.path || '/core/mail/inbox'}>
                  <Link to={child.path || '/core/mail/inbox'} className="">
                    {child.icon && <child.icon />}
                    <span className="in-data-[sidebar-collapsed=true]:hidden">{child.title}</span>

                    {child.count && <span className="ms-auto text-xs text-muted-foreground in-data-[sidebar-collapsed=true]:hidden">{child.count}</span>}
                  </Link>          
                </AccordionMenuItem>
              )
            })}
          </AccordionMenuGroup>
        )
      })}
    </AccordionMenu>
  );
}
