import { useEffect, useMemo, useState } from 'react';
import { fetchMe } from '@/crm/services/backend';
import { logFrontendError } from '@/crm/services/frontend-logger';

type CurrentUserRoleState = {
  userId: string;
  role: string;
};

export function useCurrentUserRole() {
  const [state, setState] = useState<CurrentUserRoleState>({
    userId: '',
    role: 'agent',
  });

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then((me) => {
        if (!mounted) return;
        setState({
          userId: me?.id || '',
          role: (me?.role || 'agent').toLowerCase(),
        });
      })
      .catch((error) => {
        logFrontendError({
          area: 'crm-current-user-role',
          message: error instanceof Error ? error.message : 'Failed to resolve current user role',
          meta: { operation: 'fetch_me_role' },
        });
        if (!mounted) return;
        setState({ userId: '', role: 'agent' });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const flags = useMemo(() => {
    const canManageSensitiveActions = state.role === 'admin' || state.role === 'manager';
    return {
      canManageSensitiveActions,
      canDelete: canManageSensitiveActions,
    };
  }, [state.role]);

  return {
    ...state,
    ...flags,
  };
}
