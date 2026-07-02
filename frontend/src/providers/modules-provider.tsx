import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/screen-loader';
import { RequireCoreAuth } from '@/auth/require-core-auth';

const LazyStoreInventoryModule = lazy(() => import('@/store-inventory'));
const LazyRealEstateModule = lazy(() => import('@/real-estate'));
const LazyAuthModule = lazy(() => import('@/auth'));

export function ModulesProvider() {
  const location = useLocation();
  const path = location.pathname;
  const isDashboardAlias = path === '/dashboard' || path.startsWith('/dashboard/');
  const isLegacyStoreInventory = path === '/store-inventory' || path.startsWith('/store-inventory/');

  // Detect if current path is for CRM or Store
  const isCrm = path.startsWith('/crm');
  const isCore = path.startsWith('/core');
  const isTodo = path.startsWith('/todo');
  const isRealEstate = path.startsWith('/real-estate');
  const isAuth = path.startsWith('/auth');

  if (isDashboardAlias) {
    return (
      <Routes>
        <Route path="/dashboard/*" element={<Navigate to="/core/dashboard" replace />} />
      </Routes>
    );
  } else if (isLegacyStoreInventory) {
    const redirectedPath = path.replace(/^\/store-inventory/, '/core');
    return (
      <Routes>
        <Route path="/store-inventory/*" element={<Navigate to={redirectedPath} replace />} />
      </Routes>
    );
  } else if (isCrm) {
    const redirectedPath = path.replace(/^\/crm/, '/core/crm');
    return (
      <Routes>
        <Route path="/crm/*" element={<Navigate to={redirectedPath} replace />} />
      </Routes>
    );
  } else if (isCore) {
    return (
      <Routes>
        <Route
          path="/core/*"
          element={
            <RequireCoreAuth>
              <Suspense fallback={<ScreenLoader />}>
                <LazyStoreInventoryModule />
              </Suspense>
            </RequireCoreAuth>
          }
        />
      </Routes>
    );
  } else if (isAuth) {
    return (
      <Routes>
        <Route
          path="/auth/*"
          element={
            <Suspense fallback={<ScreenLoader />}>
              <LazyAuthModule />
            </Suspense>
          }
        />
      </Routes>
    );
  } else if (path.startsWith('/mail')) {
    const redirectedPath = path.replace(/^\/mail/, '/core/mail');
    return (
      <Routes>
        <Route path="/mail/*" element={<Navigate to={redirectedPath} replace />} />
      </Routes>
    );
  } else if (path.startsWith('/calendar')) {
    const redirectedPath = path.replace(/^\/calendar/, '/core/calendar');
    return (
      <Routes>
        <Route path="/calendar/*" element={<Navigate to={redirectedPath} replace />} />
      </Routes>
    );
  } else if (path.startsWith('/ai')) {
    const redirectedPath = path.replace(/^\/ai/, '/core/ai');
    return (
      <Routes>
        <Route path="/ai/*" element={<Navigate to={redirectedPath} replace />} />
      </Routes>
    );
  } else if (isTodo) {
    const redirectedPath = path.replace(/^\/todo/, '/core/todo');
    return (
      <Routes>
        <Route path="/todo/*" element={<Navigate to={redirectedPath} replace />} />
      </Routes>
    );
  } else if (isRealEstate) {
    return (
      <Routes>
        <Route
          path="/real-estate/*"
          element={
            <Suspense fallback={<ScreenLoader />}>
              <LazyRealEstateModule />
            </Suspense>
          }
        />
      </Routes>
    );
  }

  // Default to Store Inventory dashboard
  return <Navigate to="/dashboard" replace />;
}
