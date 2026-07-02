import { Badge } from '@/components/ui/badge';
import type { SensitiveActionsSummary24h } from '@/crm/hooks/use-sensitive-actions-summary-24h';

type ObservabilityBadgesProps = {
  role: string;
  frontendErrorCount24h: number;
  sensitiveActions24hSummary: SensitiveActionsSummary24h;
  className?: string;
};

export function ObservabilityBadges({
  role,
  frontendErrorCount24h,
  sensitiveActions24hSummary,
  className = '',
}: ObservabilityBadgesProps) {
  return (
    <div className={className}>
      <Badge variant="outline" className="text-[11px]">
        Role: {role}
      </Badge>
      <Badge variant="outline" className="ml-2 text-[11px]">
        Sensitive 24h: {sensitiveActions24hSummary.total}
      </Badge>
      <Badge variant="outline" className="ml-2 text-[11px]">
        OK {sensitiveActions24hSummary.success}
      </Badge>
      <Badge variant="outline" className="ml-2 text-[11px]">
        ERR {sensitiveActions24hSummary.error}
      </Badge>
      <Badge variant="outline" className="ml-2 text-[11px]">
        DENIED {sensitiveActions24hSummary.denied}
      </Badge>
      <Badge variant="outline" className="ml-2 text-[11px]">
        FE ERR 24h: {frontendErrorCount24h}
      </Badge>
    </div>
  );
}
