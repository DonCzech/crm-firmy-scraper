import { DealsOverview } from '@/crm/pages/dashboard/deals-overview';
import { LeadAnalytics } from '@/crm/pages/dashboard/lead-analytics';
import { RecentDeals } from '@/crm/pages/dashboard/recent-deals';
import { Stats } from '@/crm/pages/dashboard/stats';
import { TasksOverview } from '@/crm/pages/dashboard/tasks-overview';
import { TotalRevenue } from '@/crm/pages/dashboard/total-revenue';

export function CrmTab() {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Stats />
      <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5 items-stretch">
        <TotalRevenue />
        <TasksOverview />
      </div>
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-2">
          <DealsOverview />
        </div>
        <div className="lg:col-span-1">
          <LeadAnalytics />
        </div>
      </div>
      <RecentDeals />
    </div>
  );
}
