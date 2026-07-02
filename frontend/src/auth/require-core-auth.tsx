import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/screen-loader';
import { fetchMe, hasStoredAuthToken, logoutAuthSession } from '@/crm/services/backend';

type RequireCoreAuthProps = {
  children: ReactNode;
};

const SESSION_VERIFY_TIMEOUT_MS = 5000;

async function fetchMeWithTimeout(timeoutMs: number) {
  await Promise.race([
    fetchMe(),
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Session verification timed out')), timeoutMs);
    }),
  ]);
}

export function RequireCoreAuth({ children }: RequireCoreAuthProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        if (!hasStoredAuthToken()) {
          logoutAuthSession();
          if (!active) return;
          setAuthenticated(false);
          return;
        }

        // Token exists: allow app to load and validate session in background.
        if (active) setAuthenticated(true);
        await fetchMeWithTimeout(SESSION_VERIFY_TIMEOUT_MS);
        if (!active) return;
        setAuthenticated(true);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('(401)') || message.includes('401')) {
          logoutAuthSession();
          setAuthenticated(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    const onUnauthorized = () => {
      logoutAuthSession();
      if (!active) return;
      setAuthenticated(false);
      setLoading(false);
    };

    window.addEventListener('crm-auth:unauthorized', onUnauthorized);
    void verifySession();

    return () => {
      active = false;
      window.removeEventListener('crm-auth:unauthorized', onUnauthorized);
    };
  }, []);

  if (loading) return <ScreenLoader />;

  if (!authenticated) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/auth/sign-in?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
