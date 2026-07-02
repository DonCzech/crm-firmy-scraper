import { BarChart2 } from 'lucide-react';
import { Content } from '../../layout/components/content';
import { ContentHeader } from '../../layout/components/content-header';
import { StatsScraperPanel } from './stats-scraper-panel';

export function StatsScraperPage() {
  return (
    <>
      <ContentHeader>
        <div className="flex items-center gap-2 py-2">
          <BarChart2 className="size-4 text-primary" />
          <span className="text-sm font-semibold">Sreality statistiky</span>
        </div>
      </ContentHeader>
      <Content className="py-0">
        <StatsScraperPanel defaultOpen />
      </Content>
    </>
  );
}
