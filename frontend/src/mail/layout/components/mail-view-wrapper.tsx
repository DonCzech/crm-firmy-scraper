'use client';

import { cn } from "@/lib/utils";
import { useLayout } from "./context";

export function MailViewWrapper({children, className}: {children: React.ReactNode, className?: string}) {
  const { isMailViewExpanded, isMobile } = useLayout();

  return (
    <div className={cn(
      'bg-background border border-input rounded-xl shadow-xs grow', 
      'flex-1 min-w-0',
      !isMobile && isMailViewExpanded && 'lg:flex-[1.6]',
      // Desktop: always visible
      'lg:block',
      // Mobile: positioned absolutely over the list when expanded
      isMobile && !isMailViewExpanded && 'hidden',
      isMobile && isMailViewExpanded && 'fixed inset-0 z-50 m-0 rounded-none',
      className
    )}>
      {children}
    </div>
  );
}
