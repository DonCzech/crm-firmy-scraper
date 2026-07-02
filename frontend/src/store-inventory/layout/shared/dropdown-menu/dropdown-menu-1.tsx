import { ReactNode } from 'react';
import {
  Bell,
  CloudCog,
  Mail,
  MessageSquare,
  Send,
  Settings,
  Share2,
  ThumbsDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DropdownMenu1({ trigger }: { trigger: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[175px]" side="bottom" align="end">
        <DropdownMenuItem asChild>
          <Link to="/core/dashboard">
            <CloudCog />
            <span>Activity</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/core/dashboard">
            <Share2 />
            <span>Share</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Bell />
            <span>Notifications</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-[150px]">
            <DropdownMenuItem asChild>
              <Link to="/core/dashboard">
                <Mail />
                <span>Email</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/core/dashboard">
                <MessageSquare />
                <span>SMS</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/core/dashboard">
                <Send />
                <span>Push</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild>
          <Link to="/core/dashboard">
            <ThumbsDown />
            <span>Report</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/core/dashboard">
            <Settings />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
