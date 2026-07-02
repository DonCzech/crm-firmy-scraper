import {
  Bot,
  CalendarDays,
  ContactRound,
  FolderKanban,
  Globe,
  Home,
  BarChart2,
  LayoutDashboard,
  Mail,
  LayoutGrid,
  ListTodo,
  Megaphone,
  ShoppingBag,
  Wallet,
  Clock,
  Wrench,
} from 'lucide-react';
import { MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig  = [
  {
    title: 'Nástěnka',
    icon: LayoutGrid,
    path: '/core/dashboard',
  },
  {
    title: 'CRM',
    icon: ContactRound,
    children: [
      {
        title: 'Leady',
        path: '/core/crm/leads',
      },
      {
        title: 'Pipeline',
        path: '/core/crm/pipeline',
      },
      {
        title: 'Přehled',
        path: '/core/crm/dashboard',
      },
      {
        title: 'Kontakty',
        path: '/core/crm/contacts',
      },
      {
        title: 'Firmy',
        path: '/core/crm/companies',
      },
      {
        title: 'Úkoly',
        path: '/core/crm/tasks',
      },
      {
        title: 'Poznámky',
        path: '/core/crm/notes',
      },
    ],
  },
  {
    title: 'Projektové řízení',
    icon: FolderKanban,
    children: [
      {
        title: 'Projekty',
        path: '/core/crm/pm',
      },
      {
        title: 'Dashboard',
        path: '/core/crm/pm/dashboard',
      },
      {
        title: 'Planner',
        path: '/core/crm/pm/planner',
      },
      {
        title: 'Weekly',
        path: '/core/crm/pm/weekly',
      },
    ],
  },
  {
    title: 'Finance',
    icon: Wallet,
    children: [
      {
        title: 'Přehled',
        path: '/core/crm/naklady',
      },
      {
        title: 'Náklady & Příjmy',
        path: '/core/crm/naklady/polozky',
      },
      {
        title: 'Rádce & Tipy',
        path: '/core/crm/naklady/radce',
      },
      {
        title: 'Kalkulačky',
        path: '/core/crm/naklady/kalkulacky',
      },
    ],
  },
  {
    title: 'Plánovač',
    icon: Clock,
    children: [
      {
        title: 'Dnes',
        path: '/core/crm/planovac',
      },
      {
        title: 'Týden',
        path: '/core/crm/planovac/tyden',
      },
      {
        title: 'Cíle & Návyky',
        path: '/core/crm/planovac/cile',
      },
      {
        title: 'Rádce',
        path: '/core/crm/planovac/radce',
      },
    ],
  },
  {
    title: 'Pošta',
    icon: Mail,
    children: [
      {
        title: 'Nový email',
        path: '/core/mail/new',
      },
      {
        title: 'Doručené',
        path: '/core/mail/inbox',
      },
      {
        title: 'Koncepty',
        path: '/core/mail/draft',
      },
      {
        title: 'Odeslané',
        path: '/core/mail/sent',
      },
    ],
  },
  {
    title: 'AI Chat',
    icon: Bot,
    children: [
      {
        title: 'Start',
        path: '/core/ai/start',
      },
      {
        title: 'Chat',
        path: '/core/ai/chat',
      },
    ],
  },
  {
    title: 'Úkoly',
    icon: ListTodo,
    children: [
      {
        title: 'Všechny úkoly',
        path: '/core/todo/all-tasks',
      },
      {
        title: 'Dnes',
        path: '/core/todo/today',
      },
      {
        title: 'Nadcházející',
        path: '/core/todo/upcoming',
      },
      {
        title: 'Priorita',
        path: '/core/todo/priority',
      },
      {
        title: 'Dokončeno',
        path: '/core/todo/completed',
      },
    ],
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    children: [
      {
        title: 'Google Ads Velín',
        path: '/core/marketing',
      },
      {
        title: 'Konkurence (myiq.com)',
        path: '/core/marketing?tab=competitor',
      },
    ],
  },
  {
    title: 'Kalendář',
    icon: CalendarDays,
    children: [
      {
        title: 'Kalendář',
        path: '/core/calendar/page',
      },
    ],
  },
  {
    title: 'E-commerce',
    icon: ShoppingBag,
    children: [
      {
        title: 'Sklad',
        path: '/core/all-stock',
      },
      {
        title: 'Produkty',
        path: '/core/product-list',
      },
      {
        title: 'Kategorie',
        path: '/core/category-list',
      },
      {
        title: 'Objednávky',
        path: '/core/order-list',
      },
      {
        title: 'Zákazníci',
        path: '/core/customer-list',
      },
    ],
  },
  {
    title: 'Projekty',
    icon: FolderKanban,
    children: [
      {
        title: 'Přehled projektů',
        icon: LayoutDashboard,
        path: '/core/projects',
      },
      {
        title: 'Nástěnka',
        icon: BarChart2,
        path: '/core/projects/dashboard',
      },
      {
        title: 'online-odhad.cz',
        icon: Globe,
        path: '/core/projects/online-odhad',
      },
      {
        title: 'bezrealitky',
        icon: Home,
        path: '/core/projects/bezrealitky',
      },
      {
        title: 'iqboost.eu',
        icon: BarChart2,
        path: '/core/projects/iqboost',
      },
      {
        title: 'core.ceskypartner.cz',
        icon: BarChart2,
        path: '/core/projects/core-ceskypartner',
      },
      {
        title: 'ceskypartner.cz',
        icon: Globe,
        path: '/core/projects/ceskypartner',
      },
    ],
  },
  {
    title: 'Nástroje',
    icon: Wrench,
    children: [
      {
        title: 'Volné domény',
        path: '/core/tools/free-domains',
      },
      {
        title: 'Kontrola databází',
        path: '/core/tools/kontrola-databaze',
      },
      {
        title: 'Monitoring domén',
        path: '/core/tools/monitoring-domen',
      },
      {
        title: 'Cron monitoring',
        path: '/core/tools/cron',
      },
      {
        title: 'Scrappery',
        path: '/core/tools/scrappery',
        children: [
          {
            title: 'Sreality',
            path: '/core/tools/scrappery/sreality',
          },
          {
            title: 'Bazoš Scrapper',
            path: '/core/tools/scrappery/bazos',
          },
          {
            title: 'Bezrealitky Scrapper',
            path: '/core/tools/scrappery/bezrealitky',
          },
          {
            title: 'Firmy.cz Scrapper',
            path: '/core/tools/scrappery/firmy',
          },
          {
            title: 'Resume.co Scrapper',
            path: '/core/tools/scrappery/resume',
          },
        ],
      },
      {
        title: 'Problémové domény',
        path: '/core/problem-domains',
      },
      {
        title: 'Zálohy',
        path: '/core/tools/zalohy',
      },
      {
        title: 'Smlouvy',
        path: '/core/contracts',
      },
      {
        title: 'Helpdesk',
        path: '/core/helpdesk',
      },
      {
        title: 'Automation',
        path: '/core/automation',
      },
      {
        title: 'Governance',
        path: '/core/governance',
      },
      {
        title: 'Core / Management',
        path: '/core/user-management',
      },
    ],
  },
];
