import { cn } from '@/lib/utils';

export function Content({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex min-w-0 flex-1 py-5', className)}>{children}</div>;
}
