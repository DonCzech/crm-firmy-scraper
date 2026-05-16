import {
  BarChart2,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarClock,
  CheckSquare,
  CircleEllipsis,
  DatabaseBackup,
  FolderKanban,
  GalleryVerticalEnd,
  Globe,
  Home,
  LayoutDashboard,
  List,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  ShieldCheck,
} from 'lucide-react';

import { NavConfig } from '../types';

export const MAIN_NAV: NavConfig = [
  {
    icon: Target,
    title: 'Leady',
    path: '/crm/leads',
    id: 'leads',
  },
  {
    icon: BarChart2,
    title: 'Pipeline',
    path: '/crm/pipeline',
    id: 'pipeline',
  },
  {
    title: 'Dashboard',
    icon: Home,
    path: '/crm/dashboard',
    id: 'dashboard',
  },
  {
    icon: CheckSquare,
    title: 'Tasks',
    path: '/crm/tasks',
    pinnable: true,
    pinned: true,
    badge: '3',
    id: 'tasks',
    more: true,
    new: {
      tooltip: 'New Task',
      path: '/crm/tasks/new',
    },
  },
  {
    icon: GalleryVerticalEnd,
    title: 'Notes',
    path: '/crm/notes',
    pinnable: true,
    pinned: true,
    id: 'notes',
    new: {
      tooltip: 'New Notes',
      path: '/crm/notes',
    },
  },
  {
    icon: Users,
    title: 'Contacts',
    path: '/crm/contacts',
    pinnable: true,
    pinned: true,
    id: 'contacts',
    new: {
      tooltip: 'New Contact',
      path: '/crm/contacts',
    },
  },
  {
    icon: Building2,
    title: 'Companies',
    path: '/crm/companies',
    pinnable: true,
    pinned: true,
    id: 'companies',
    new: {
      tooltip: 'New Company',
      path: '/crm/companies',
    },
  },

  {
    icon: BriefcaseBusiness,
    title: 'Company',
    path: '/crm/company',
    pinnable: true,
    pinned: true,
    id: 'company',
  },

  {
    icon: Wallet,
    title: 'Finance',
    path: '/crm/naklady',
    pinnable: true,
    pinned: true,
    id: 'finance',
    children: [
      {
        id: 'finance-prehled',
        title: 'Přehled',
        icon: LayoutDashboard,
        path: '/crm/naklady',
      },
      {
        id: 'finance-polozky',
        title: 'Náklady & Příjmy',
        icon: List,
        path: '/crm/naklady/polozky',
      },
      {
        id: 'finance-kalkulacky',
        title: 'Kalkulačky',
        icon: Calculator,
        path: '/crm/naklady/kalkulacky',
      },
    ],
  },

  {
    icon: FolderKanban,
    title: 'Projekty',
    path: '/crm/projects',
    pinnable: true,
    pinned: true,
    id: 'projects',
    children: [
      {
        id: 'projects-overview',
        title: 'Přehled projektů',
        icon: List,
        path: '/crm/projects',
      },
      {
        id: 'projects-dashboard',
        title: 'Nástěnka',
        icon: LayoutDashboard,
        path: '/crm/projects/dashboard',
      },
      {
        id: 'projects-online-odhad',
        title: 'online-odhad.cz',
        icon: Globe,
        path: '/crm/projects/online-odhad',
      },
      {
        id: 'projects-bezrealitky',
        title: 'bezrealitky',
        icon: Home,
        path: '/crm/projects/bezrealitky',
      },
      {
        id: 'projects-iqboost',
        title: 'iqboost.eu',
        icon: BarChart2,
        path: '/crm/projects/iqboost',
      },
      {
        id: 'projects-core-ceskypartner',
        title: 'core.ceskypartner.cz',
        icon: BarChart2,
        path: '/crm/projects/core-ceskypartner',
      },
      {
        id: 'projects-ceskypartner',
        title: 'ceskypartner.cz',
        icon: Globe,
        path: '/crm/projects/ceskypartner',
      },
    ],
  },

  {
    icon: Zap,
    title: 'Projektové řízení',
    path: '/crm/pm',
    pinnable: true,
    pinned: true,
    id: 'pm',
    children: [
      {
        id: 'pm-dashboard',
        title: 'Projektové řízení Dashboard',
        icon: LayoutDashboard,
        path: '/crm/pm/dashboard',
      },
      {
        id: 'pm-portfolio',
        title: 'Projekty',
        icon: FolderKanban,
        path: '/crm/pm',
      },
      {
        id: 'pm-planner',
        title: 'Denní plánovač',
        icon: CalendarClock,
        path: '/crm/pm/planner',
      },
      {
        id: 'pm-weekly',
        title: 'Týdenní kapacity',
        icon: TrendingUp,
        path: '/crm/pm/weekly',
      },
    ],
  },

  {
    icon: DatabaseBackup,
    title: 'Zálohy',
    path: '/crm/backup',
    pinnable: true,
    pinned: true,
    id: 'backup',
  },

  {
    icon: ShieldCheck,
    title: 'Administrace',
    path: '/core/administrace',
    pinnable: true,
    pinned: true,
    id: 'administrace',
    children: [
      {
        id: 'administrace-overview',
        title: 'Přehled projektů',
        icon: LayoutDashboard,
        path: '/core/administrace',
      },
      {
        id: 'administrace-iq-boost',
        title: 'iq-boost.com',
        icon: BarChart2,
        path: '/core/administrace/projects/iq-boost/users',
      },
      {
        id: 'administrace-bettercv',
        title: 'cv-editor.com',
        icon: GalleryVerticalEnd,
        path: '/core/administrace/projects/bettercv/users',
      },
      {
        id: 'administrace-convee',
        title: 'convee.co',
        icon: Zap,
        path: '/core/administrace/projects/convee/users',
      },
      {
        id: 'administrace-venom',
        title: 'Venom SaaS',
        icon: Globe,
        path: '/core/administrace/projects/venom/users',
      },
    ],
  },

  {
    icon: CircleEllipsis,
    title: 'More',
    id: 'more',
    dropdown: true,
  },
];
