import { useEffect, useMemo, useState } from 'react';
import {
  FRONTEND_LOG_REFRESH_EVENT,
  getFrontendLogs,
} from '@/crm/services/frontend-logger';

export function useFrontendErrorCount24h(limit = 500): number {
  const [frontendLogsSnapshot, setFrontendLogsSnapshot] = useState(() => getFrontendLogs(limit));

  useEffect(() => {
    const refresh = () => setFrontendLogsSnapshot(getFrontendLogs(limit));
    window.addEventListener(FRONTEND_LOG_REFRESH_EVENT, refresh);
    return () => {
      window.removeEventListener(FRONTEND_LOG_REFRESH_EVENT, refresh);
    };
  }, [limit]);

  return useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return frontendLogsSnapshot.filter((entry) => {
      if (entry.level !== 'error') return false;
      const ts = new Date(entry.ts).getTime();
      return Number.isFinite(ts) && ts >= since;
    }).length;
  }, [frontendLogsSnapshot]);
}
