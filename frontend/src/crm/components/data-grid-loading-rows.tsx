import { Skeleton } from '@/components/ui/skeleton';

type DataGridLoadingRowsProps = {
  rows?: number;
  rowClassName?: string;
  containerClassName?: string;
  idPrefix?: string;
};

export function DataGridLoadingRows({
  rows = 6,
  rowClassName = 'h-8 w-full',
  containerClassName = 'space-y-2 px-4 py-4',
  idPrefix = 'grid-loading-row',
}: DataGridLoadingRowsProps) {
  return (
    <div className={containerClassName}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={`${idPrefix}-${index}`} className={rowClassName} />
      ))}
    </div>
  );
}
