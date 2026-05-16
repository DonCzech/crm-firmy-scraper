import { Navigate, Route, Routes } from 'react-router-dom';
import { DefaultLayout } from './layout';
import { AllStock } from './pages/all-stock/page';
import { CategoryDetails } from './pages/category-details/page';
import { CategoryList } from './pages/category-list/page';
import { CreateCategoryPage } from './pages/create-category/page';
import { CreateProductPage } from './pages/create-product/page';
import { CreateShippingLabelPage } from './pages/create-shipping-label/page';
import { CurrentStock } from './pages/current-stock/page';
import { Dashboard } from './pages/dashboard/page';
import { InboundStock } from './pages/inbound-stock/page';
import { ManageVariantsPage } from './pages/manage-variants/page';
import { OrderList } from './pages/order-list/page';
import { OrderDetailsPage } from './pages/order-detials/page';
import { OrderTrackingPage } from './pages/order-tracking/page';
import { OutboundStock } from './pages/outbound-stock/page';
import { PerProductStockPage } from './pages/per-product-stock/page';
import { ProductDetailsPage } from './pages/product-details/page';
import { ProductList } from './pages/product-list/page';
import { StockPlanner } from './pages/stock-planner/page';
import { TrackShippingPage } from './pages/track-shipping/page';
import { EditCategoryPage } from './pages/edit-category/page';
import { EditProductPage } from './pages/edit-product/page';
import { ProductInfoPage } from './pages/product-info/page';
import { CustomerList } from './pages/customer-list/page';
import { CustomerListDetails } from './pages/customer-list-details/page';
import { OrderListProducts } from './pages/order-list-products/page';
import { SettingsModal } from './pages/settings-modal/page';
import StoreEmbeddedCrmModule from './pages/crm/module';
import TodoModule from '@/todo';
import CalendarModule from '@/calendar';
import MailModule from '@/mail';
import AIModule from '@/ai';
import { ProjectsPage } from '@/crm/pages/projects/page';
import { ProjectDetailPage } from '@/crm/pages/projects/detail';
import { ProjectsDashboard } from '@/crm/pages/projects/dashboard';
import { FreeDomainsPage } from './pages/tools/free-domains/page';
import { UserManagementPage } from './pages/user-management/page';
import { ContractsPage } from './pages/contracts/page';
import { HelpdeskPage } from './pages/helpdesk/page';
import { AutomationPage } from './pages/automation/page';
import { GovernancePage } from './pages/governance/page';
import { BackupsPage } from './pages/tools/zalohy/page';
import { DatabaseControlPage } from './pages/tools/kontrola-databaze/page';
import { DomainMonitoringPage } from './pages/tools/monitoring-domen/page';
import { CronToolPage } from './pages/tools/cron/page';
import { ProblemDomainsDashboardPage } from './pages/problem-domains/page';
import { ProblemDomainsCategoriesPage } from './pages/problem-domains/categories-page';
import { ProblemDomainsCategoryDetailPage } from './pages/problem-domains/category-detail-page';
import { ProblemDomainsSubcategoryDetailPage } from './pages/problem-domains/subcategory-detail-page';
import { ProblemDomainsDomainsPage } from './pages/problem-domains/domains-page';
import { ProblemDomainsDomainDetailPage } from './pages/problem-domains/domain-detail-page';
import { ProblemDomainsRankingsPage } from './pages/problem-domains/rankings-page';
import { ProblemDomainsImportPage } from './pages/problem-domains/import-page';
import { MarketingArticleDetailPage, MarketingPage } from './pages/marketing/page';
import { GoogleAdsMarketingPage } from './pages/marketing/google-ads-page';
import { AdministracePage } from './pages/administrace/page';
import { ProjectUsersPage } from './pages/administrace/project-users';
import { UserDetailPage } from './pages/administrace/user-detail';

export default function StoreInventoryModule() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="light-sidebar" element={<Dashboard />} />
        <Route path="dark-sidebar" element={<Dashboard />} />
        <Route path="crm/*" element={<StoreEmbeddedCrmModule />} />
        <Route path="mail/*" element={<MailModule />} />
        <Route path="ai/*" element={<AIModule />} />
        <Route path="todo/*" element={<TodoModule />} />
        <Route path="calendar/*" element={<CalendarModule />} />
        <Route path="all-stock" element={<AllStock />} />
        <Route path="current-stock" element={<CurrentStock />} />
        <Route path="inbound-stock" element={<InboundStock />} />
        <Route path="outbound-stock" element={<OutboundStock />} />
        <Route path="stock-planner" element={<StockPlanner />} />
        <Route path="product-list" element={<ProductList />} />
        <Route path="product-details" element={<ProductDetailsPage />} />
        <Route path="create-product" element={<CreateProductPage />} />
        <Route path="edit-product" element={<EditProductPage />} />
        <Route path="per-product-stock" element={<PerProductStockPage />} />
        <Route path="track-shipping" element={<TrackShippingPage />} />
        <Route path="product-info" element={<ProductInfoPage />} />
        <Route path="customer-list" element={<CustomerList />} />
        <Route path="customer-list-details" element={<CustomerListDetails />} />
        <Route path="settings-modal" element={<SettingsModal />} />
        <Route
          path="create-shipping-label"
          element={<CreateShippingLabelPage />}
        />
        <Route path="manage-variants" element={<ManageVariantsPage />} />
        <Route path="category-list" element={<CategoryList />} />
        <Route path="create-category" element={<CreateCategoryPage />} />
        <Route path="edit-category" element={<EditCategoryPage />} />
        <Route path="category-details" element={<CategoryDetails />} />
        <Route path="order-list" element={<OrderList />} />
        <Route path="order-list-products" element={<OrderListProducts />} />
        <Route path="order-details" element={<OrderDetailsPage />} />
        <Route path="order-tracking" element={<OrderTrackingPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/dashboard" element={<ProjectsDashboard />} />
        <Route path="projects/:projectKey" element={<ProjectDetailPage />} />
        <Route path="tools/free-domains" element={<FreeDomainsPage />} />
        <Route path="tools/scrappery" element={<Navigate to="/core/crm/reality" replace />} />
        <Route path="tools/scrappery/sreality" element={<Navigate to="/core/crm/reality" replace />} />
        <Route path="tools/scrappery/bazos" element={<Navigate to="/core/crm/reality/bazos" replace />} />
        <Route path="tools/scrappery/bezrealitky" element={<Navigate to="/core/crm/reality/bezrealitky" replace />} />
        <Route path="tools/scrappery/firmy" element={<Navigate to="/core/crm/firmy" replace />} />
        <Route path="tools/zalohy" element={<BackupsPage />} />
        <Route path="tools/kontrola-databaze" element={<DatabaseControlPage />} />
        <Route path="tools/monitoring-domen" element={<DomainMonitoringPage />} />
        <Route path="tools/cron" element={<CronToolPage />} />
        <Route path="user-management" element={<UserManagementPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="helpdesk" element={<HelpdeskPage />} />
        <Route path="automation" element={<AutomationPage />} />
        <Route path="governance" element={<GovernancePage />} />
        <Route path="problem-domains" element={<ProblemDomainsDashboardPage />} />
        <Route path="problem-domains/categories" element={<ProblemDomainsCategoriesPage />} />
        <Route path="problem-domains/categories/:categoryId" element={<ProblemDomainsCategoryDetailPage />} />
        <Route path="problem-domains/subcategories/:subcategoryId" element={<ProblemDomainsSubcategoryDetailPage />} />
        <Route path="problem-domains/domains" element={<ProblemDomainsDomainsPage />} />
        <Route path="problem-domains/domains/:domainId" element={<ProblemDomainsDomainDetailPage />} />
        <Route path="problem-domains/rankings" element={<ProblemDomainsRankingsPage />} />
        <Route path="problem-domains/import" element={<ProblemDomainsImportPage />} />
        <Route path="marketing" element={<GoogleAdsMarketingPage />} />
        <Route path="marketing/:domainKey" element={<GoogleAdsMarketingPage />} />
        <Route path="tools/scrappery/resume" element={<MarketingPage />} />
        <Route path="tools/scrappery/resume/:slug" element={<MarketingArticleDetailPage />} />
        <Route path="administrace" element={<AdministracePage />} />
        <Route path="administrace/projects/:projectId" element={<ProjectUsersPage />} />
        <Route path="administrace/projects/:projectId/users" element={<ProjectUsersPage />} />
        <Route path="administrace/projects/:projectId/users/:userId" element={<UserDetailPage />} />
        <Route path="administrace/projects/:projectId/users/:userId/edit" element={<UserDetailPage />} />
        <Route path="administrace/projects/:projectId/users/:userId/subscription" element={<UserDetailPage />} />
      </Route>
    </Routes>
  );
}
