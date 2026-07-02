import { useEffect, useMemo, useState } from 'react';
import {
  getSensitiveActionsAudit,
  SENSITIVE_ACTIONS_AUDIT_REFRESH_EVENT,
} from '@/crm/services/sensitive-actions-audit';

export type SensitiveActionsSummary24h = {
  total: number;
  success: number;
  error: number;
  denied: number;
};

export function useSensitiveActionsSummary24h(area: string, limit = 500): SensitiveActionsSummary24h {
  const [snapshot, setSnapshot] = useState(() => getSensitiveActionsAudit(limit));

  useEffect(() => {
    const refresh = () => setSnapshot(getSensitiveActionsAudit(limit));
    window.addEventListener(SENSITIVE_ACTIONS_AUDIT_REFRESH_EVENT, refresh);
    return () => {
      window.removeEventListener(SENSITIVE_ACTIONS_AUDIT_REFRESH_EVENT, refresh);
    };
  }, [limit]);

  return useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    let success = 0;
    let error = 0;
    let denied = 0;
    for (const entry of snapshot) {
      if (entry.area !== area) continue;
      const ts = new Date(entry.createdAt).getTime();
      if (!Number.isFinite(ts) || ts < since) continue;
      if (entry.result === 'success') success += 1;
      else if (entry.result === 'error') error += 1;
      else if (entry.result === 'denied') denied += 1;
    }
    return { total: success + error + denied, success, error, denied };
  }, [area, snapshot]);
}
