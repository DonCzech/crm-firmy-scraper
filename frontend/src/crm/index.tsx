import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { logFrontendError } from './services/frontend-logger';
import { DefaultLayout } from './layout';
import { CompanyPage } from './pages/companies/company/page';
import { CompaniesListPage } from './pages/companies/page';
import ContactsPage from './pages/contacts/page';
import { Dashboard } from './pages/dashboard/page';
import { DealsPage } from './pages/deals/page';
import { LeadDetailPage } from './pages/leads/lead/page';
import { NotesPage } from './pages/notes/page';
import { TasksPage } from './pages/tasks/page';
import { RealityPage } from './pages/reality/page';
import { RealityDetailPage } from './pages/reality/detail';
import { BazosScraperPage } from './pages/reality/bazos';
import { StatsScraperPage } from './pages/reality/stats-scraper-page';
import { BezrealitkyScraperPage } from './pages/reality/bezrealitky-scraper-page';
import { BezrealitkyDetailPage } from './pages/reality/bezrealitky-detail';
import { FirmyPage } from './pages/firmy/page';
import { FirmyDetailPage } from './pages/firmy/detail';
import { BackupPage } from './pages/backup/page';
import { PipelinePage } from './pages/pipeline/page';
import { PmDashboardPage } from './pages/pm/dashboard';
import { PmPortfolioPage } from './pages/pm/portfolio';
import { PmDetailPage } from './pages/pm/detail';
import { PmPlannerPage } from './pages/pm/planner';
import { PmWeeklyPage } from './pages/pm/weekly';

export default function CrmModule() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      logFrontendError({
        area: 'crm-ui',
        message: event.message || 'Unhandled runtime error',
        meta: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          pathname: window.location.pathname,
        },
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        typeof event.reason === 'string'
          ? event.reason
          : event.reason instanceof Error
            ? event.reason.message
            : 'Unhandled promise rejection';
      logFrontendError({
        area: 'crm-ui',
        message: reason,
        meta: {
          pathname: window.location.pathname,
        },
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tasks/" element={<TasksPage />} />
        <Route path="notes/" element={<NotesPage />} />
        <Route path="companies/" element={<CompaniesListPage />} />
        <Route path="company/" element={<CompanyPage />} />
        <Route path="companies/:companyId" element={<CompanyPage />} />
        <Route path="contacts/" element={<ContactsPage />} />
        <Route path="contacts/:contactId" element={<LeadDetailPage />} />
        <Route path="leads/:leadId" element={<LeadDetailPage />} />
        <Route path="deals/" element={<DealsPage />} />
        <Route path="pipeline/" element={<PipelinePage />} />
        <Route path="reality/" element={<RealityPage />} />
        <Route path="reality/bezrealitky" element={<BezrealitkyScraperPage />} />
        <Route path="reality/bezrealitky/:id" element={<BezrealitkyDetailPage />} />
        <Route path="reality/bazos" element={<BazosScraperPage />} />
        <Route path="reality/stats-scrape" element={<StatsScraperPage />} />
        <Route path="reality/:id" element={<RealityDetailPage />} />
        <Route path="firmy/" element={<FirmyPage />} />
        <Route path="firmy/:id" element={<FirmyDetailPage />} />
        <Route path="backup" element={<BackupPage />} />
        {/* PM Module */}
        <Route path="pm" element={<PmPortfolioPage />} />
        <Route path="pm/dashboard" element={<PmDashboardPage />} />
        <Route path="pm/project/:id" element={<PmDetailPage />} />
        <Route path="pm/project/:id/task/:taskId" element={<PmDetailPage />} />
        <Route path="pm/project/:id/task/:taskId/subtask/:subtaskId" element={<PmDetailPage />} />
        <Route path="pm/planner" element={<PmPlannerPage />} />
        <Route path="pm/weekly" element={<PmWeeklyPage />} />
      </Route>
    </Routes>
  );
}
