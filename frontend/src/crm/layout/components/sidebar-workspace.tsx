import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle,
  ChevronLeft,
  CreditCard,
  Crown,
  Globe,
  LogOut,
  Palette,
  Shield,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchMe, logoutAuthSession, type BackendMe } from '@/crm/services/backend';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Workspace {
  id: string;
  name: string;
  logo?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  members: number;
  role: 'owner' | 'admin' | 'member';
}

interface WorkspaceMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info';
}

const workspaceMenuItems: WorkspaceMenuItem[] = [
  {
    id: 'overview',
    title: 'Workspace Overview',
    description: 'Manage your workspace settings and preferences',
    icon: Building2,
    href: '/crm/settings/workspace',
  },
  {
    id: 'members',
    title: 'Team Members',
    description: 'Invite, manage, and organize your team',
    icon: Users,
    href: '/crm/settings/members',
  },
  {
    id: 'billing',
    title: 'Billing & Plans',
    description: 'Manage subscriptions, invoices, and payment methods',
    icon: CreditCard,
    href: '/crm/settings/billing',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with third-party tools and services',
    icon: Zap,
    href: '/crm/settings/integrations',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Manage authentication, permissions, and data protection',
    icon: Shield,
    href: '/crm/settings/security',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize themes, branding, and visual settings',
    icon: Palette,
    href: '/crm/settings/appearance',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure email, push, and in-app notifications',
    icon: Bell,
    href: '/crm/settings/notifications',
  },
  {
    id: 'regional',
    title: 'Regional Settings',
    description: 'Language, timezone, and localization preferences',
    icon: Globe,
    href: '/crm/settings/regional',
  },
];

interface SidebarWorkspaceProps {
  onSwitchToDefault: () => void;
}

export function SidebarWorkspace({ onSwitchToDefault }: SidebarWorkspaceProps) {
  const location = useLocation();
  const [me, setMe] = useState<BackendMe | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then((profile) => {
        if (!mounted) return;
        setMe(profile);
      })
      .catch(() => {
        if (!mounted) return;
        setMe(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const workspace = useMemo<Workspace>(() => {
    const plan = (me?.company?.plan || 'free').toLowerCase();
    const normalizedPlan: Workspace['plan'] =
      plan === 'enterprise' || plan === 'pro' ? plan : 'free';
    return {
      id: me?.company?.id || 'default-workspace',
      name: me?.company?.name || 'CRM Workspace',
      logo: me?.company?.logo || undefined,
      plan: normalizedPlan,
      status: 'active',
      members: 0,
      role: 'owner',
    };
  }, [me]);

  const currentUserName = useMemo(() => {
    const full = `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim();
    if (full.length > 0) return full;
    return me?.email || 'Uživatel';
  }, [me]);

  const currentUserInitials = useMemo(() => {
    const source = currentUserName.trim();
    if (!source) return 'U';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }, [currentUserName]);

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'destructive';
      case 'pro':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="size-3 text-emerald-500" />;
      case 'trial':
        return <AlertCircle className="size-3 text-amber-500" />;
      default:
        return <AlertCircle className="size-3 text-red-500" />;
    }
  };

  return (
    <>
      {/* Header - Same style as default sidebar */}
      <div className="group flex justify-between items-center gap-2.5 border-b border-border h-(--sidebar-header-height) shrink-0 px-2.5">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwitchToDefault}
            className="flex items-center gap-2 text-sm hover:bg-accent"
          >
            <ChevronLeft className="size-4" />
            <span className="in-data-[sidebar-collapsed]:hidden">
              Back to CRM
            </span>
          </Button>
        </div>
      </div>

      {/* Workspace Info - Compact version */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="size-8">
            <AvatarImage src={workspace.logo} alt={workspace.name} />
            <AvatarFallback className="text-sm font-semibold">
              {workspace.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {workspace.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge
                variant={getPlanBadgeVariant(workspace.plan)}
                size="sm"
              >
                {workspace.plan === 'enterprise' && (
                  <Crown className="size-3 mr-1" />
                )}
                {workspace.plan.charAt(0).toUpperCase() +
                  workspace.plan.slice(1)}
              </Badge>
              {getStatusIcon(workspace.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Same style as default sidebar */}
      <nav className="flex-1 p-2 space-y-1">
        {workspaceMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-4" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{item.title}</span>
                  {item.badge && (
                    <Badge variant={item.variant || 'secondary'} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Same style as default sidebar */}
      <div className="flex items-center justify-between p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={me?.avatar || ''} alt={currentUserName} />
            <AvatarFallback className="text-xs">{currentUserInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{currentUserName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logoutAuthSession();
            window.location.href = '/login';
          }}
        >
          <LogOut className="size-3 mr-2" />
          Log Out
        </Button>
      </div>
    </>
  );
}
