import { PanelRightClose } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLayout } from './layout-context';

export function ContentHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { embedded, setSidebarCollapse } = useLayout();

  if (embedded) {
    return (
      <div className="bg-background flex items-center border-b h-(--content-header-height)">
        <div className="container-fluid flex min-w-0 items-center">
          <div
            className={cn('flex min-w-0 grow items-center justify-between', className)}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex items-center border-b lg:fixed top-[var(--header-height)] start-(--sidebar-width) end-0 in-data-[sidebar-collapsed]:start-(--sidebar-width-collapsed) z-[10] h-(--content-header-height) pe-[var(--removed-body-scroll-bar-size,0px)]">
      <div className="container-fluid flex min-w-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="hidden in-data-[sidebar-collapsed]:inline-flex -ms-2.5 me-1"
          onClick={() => setSidebarCollapse(false)}
        >
          <PanelRightClose />
        </Button>
        <div
          className={cn('flex min-w-0 grow items-center justify-between', className)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
