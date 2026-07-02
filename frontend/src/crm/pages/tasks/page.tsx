import { CalendarCheck, CalendarRange, ListChecks } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Content } from '../../layout/components/content';
import { PageHeader } from './page-header';
import { TaskList } from './task-list';

export function TasksPage() {
  return (
    <>
      <PageHeader />
      <Content className="py-0">
        <div className="flex grow min-w-0">
          <Tabs defaultValue="today" className="grow min-w-0 text-sm">
            <TabsList
              variant="line"
              className="px-5 gap-6 bg-transparent [&_button]:border-b [&_button_svg]:size-4 [&_button]:text-secondary-foreground"
            >
              <TabsTrigger value="today">
                <CalendarCheck /> Today
              </TabsTrigger>
              <TabsTrigger value="week">
                <CalendarRange /> Week
              </TabsTrigger>
              <TabsTrigger value="completed">
                <ListChecks />
                Completed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="min-w-0">
              <TaskList filter="today" />
            </TabsContent>
            <TabsContent value="week" className="min-w-0">
              <TaskList filter="week" />
            </TabsContent>
            <TabsContent value="completed" className="min-w-0">
              <TaskList filter="completed" />
            </TabsContent>
          </Tabs>
        </div>
      </Content>
    </>
  );
}
