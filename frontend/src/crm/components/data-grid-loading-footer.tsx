import { Skeleton } from '@/components/ui/skeleton';

export function DataGridLoadingFooter({ className = 'w-full py-2' }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-7 w-40" />
    </div>
  );
}
