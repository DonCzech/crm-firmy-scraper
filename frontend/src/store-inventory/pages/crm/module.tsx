import { Component, ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MAIN_NAV } from '@/crm/config/app.config';
import { LayoutProvider } from '@/crm/layout/components/layout-context';
import { CompanyPage } from '@/crm/pages/companies/company/page';
import { CompaniesListPage } from '@/crm/pages/companies/page';
import ContactsPage from '@/crm/pages/contacts/page';
import { Dashboard } from '@/crm/pages/dashboard/page';
import { DealsPage } from '@/crm/pages/deals/page';
import { LeadsPage } from '@/crm/pages/leads/page';
import { LeadDetailPage } from '@/crm/pages/leads/lead/page';
import { LeadDetailSheet } from '@/crm/pages/leads/lead/sheet';
import { NotesPage } from '@/crm/pages/notes/page';
import { PipelinePage } from '@/crm/pages/pipeline/page';
import { TasksPage } from '@/crm/pages/tasks/page';
import { RealityPage } from '@/crm/pages/reality/page';
import { RealityDetailPage } from '@/crm/pages/reality/detail';
import { BazosScraperPage } from '@/crm/pages/reality/bazos';
import { StatsScraperPage } from '@/crm/pages/reality/stats-scraper-page';
import { BezrealitkyScraperPage } from '@/crm/pages/reality/bezrealitky-scraper-page';
import { FirmyPage } from '@/crm/pages/firmy/page';
import { FirmyDetailPage } from '@/crm/pages/firmy/detail';
import { BackupPage } from '@/crm/pages/backup/page';
import { NakladyPage } from '@/crm/pages/naklady/page';
import { PlannerPage } from '@/crm/pages/planovac/page';
import { ProjectsPage } from '@/crm/pages/projects/page';
import { ProjectDetailPage } from '@/crm/pages/projects/detail';
import { ProjectsDashboard } from '@/crm/pages/projects/dashboard';
import { PmDashboardPage } from '@/crm/pages/pm/dashboard';
import { PmPortfolioPage } from '@/crm/pages/pm/portfolio';
import { PmDetailPage } from '@/crm/pages/pm/detail';
import { PmPlannerPage } from '@/crm/pages/pm/planner';
import { PmWeeklyPage } from '@/crm/pages/pm/weekly';

const crmQueryClient = new QueryClient();

type PmRuntimeBoundaryState = { hasError: boolean; message: string };

class PmRuntimeBoundary extends Component<{ children: ReactNode }, PmRuntimeBoundaryState> {
  state: PmRuntimeBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): PmRuntimeBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Neznámá runtime chyba v PM modulu.',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('[PM Runtime Error]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-4 my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-700">PM modul spadl na runtime chybě.</p>
          <p className="mt-1 break-all text-red-600">{this.state.message}</p>
          <p className="mt-2 text-xs text-red-600">Otevři Console pro přesný stacktrace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StoreEmbeddedCrmModule() {
  return (
    <QueryClientProvider client={crmQueryClient}>
      <LayoutProvider sidebarNavItems={MAIN_NAV} embedded>
        <Routes>
          <Route index element={<Navigate to="leads" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="leads" element={<LeadsPage />}>
            <Route path=":leadId" element={<LeadDetailSheet />} />
          </Route>
          <Route path="tasks" element={<TasksPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="companies" element={<CompaniesListPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="companies/:companyId" element={<CompanyPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="contacts/:contactId" element={<LeadDetailPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="reality" element={<RealityPage />} />
          <Route path="reality/bezrealitky" element={<BezrealitkyScraperPage />} />
          <Route path="reality/bazos" element={<BazosScraperPage />} />
          <Route path="reality/stats-scrape" element={<StatsScraperPage />} />
          <Route path="reality/:id" element={<RealityDetailPage />} />
          <Route path="firmy" element={<FirmyPage />} />
          <Route path="firmy/:id" element={<FirmyDetailPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="naklady" element={<NakladyPage />} />
          <Route path="naklady/polozky" element={<NakladyPage />} />
          <Route path="naklady/radce" element={<NakladyPage />} />
          <Route path="naklady/kalkulacky" element={<NakladyPage />} />
          <Route path="planovac" element={<PlannerPage />} />
          <Route path="planovac/tyden" element={<PlannerPage />} />
          <Route path="planovac/cile" element={<PlannerPage />} />
          <Route path="planovac/radce" element={<PlannerPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/dashboard" element={<ProjectsDashboard />} />
          <Route path="projects/:projectKey" element={<ProjectDetailPage />} />
          <Route path="pm" element={<PmRuntimeBoundary><PmPortfolioPage /></PmRuntimeBoundary>} />
          <Route path="pm/dashboard" element={<PmRuntimeBoundary><PmDashboardPage /></PmRuntimeBoundary>} />
          <Route path="pm/project/:id" element={<PmRuntimeBoundary><PmDetailPage /></PmRuntimeBoundary>} />
          <Route path="pm/project/:id/task/:taskId" element={<PmRuntimeBoundary><PmDetailPage /></PmRuntimeBoundary>} />
          <Route path="pm/project/:id/task/:taskId/subtask/:subtaskId" element={<PmRuntimeBoundary><PmDetailPage /></PmRuntimeBoundary>} />
          <Route path="pm/planner" element={<PmRuntimeBoundary><PmPlannerPage /></PmRuntimeBoundary>} />
          <Route path="pm/weekly" element={<PmRuntimeBoundary><PmWeeklyPage /></PmRuntimeBoundary>} />
        </Routes>
      </LayoutProvider>
    </QueryClientProvider>
  );
}
