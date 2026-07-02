import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router";
import {
  UserCircle,
  BarChart3,
  Settings,
  Users,
  ShieldUser,
  Plus,
} from 'lucide-react';

const menuItems = [
  {
    icon: UserCircle,
    tooltip: 'Profile',
    path: '/core/mail/inbox',
    rootPath: '/core/mail',
  },
  {
    icon: BarChart3,
    tooltip: 'Dashboard',
    path: '/core/mail/inbox',
    rootPath: '/core/mail'
  },
  {
    icon: Settings,
    tooltip: 'Account',
    path: '/core/mail/inbox',
    rootPath: '/core/mail',
  },
  {
    icon: Users,
    tooltip: 'Network',
    path: '/core/mail/inbox',
    rootPath: '/core/mail',
  },
  {
    icon: ShieldUser,
    tooltip: 'Authentication',
    path: '/core/mail/inbox',
    rootPath: '/core/mail',
  },
  {
    icon: Plus,
    tooltip: 'Security Logs',
    path: '/core/mail/inbox',
    rootPath: '/core/mail',
  },
];

export function AsideContent() {
  return (
    <div className="grow gap-3.5 shrink-0 flex items-center flex-col">
      {menuItems.map((item, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="outline"
              mode="icon"
              className="shadow-md shadow-black/5"
            >
              <Link to={item.path}>
                <item.icon/>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.tooltip}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
