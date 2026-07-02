import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCompanies } from '@/crm/services/backend';
import { CRM_COMPANIES_REFRESH_EVENT } from '@/crm/services/events';
import { mapCompanyToUI } from '@/crm/services/mappers';
import type { Company } from '@/crm/types/company';

const CACHE_TTL_MS = 60_000;
let companiesCache: Company[] | null = null;
let companiesCacheAt = 0;
let companiesInFlight: Promise<Company[]> | null = null;

async function loadCompaniesCached(): Promise<Company[]> {
  const now = Date.now();
  if (companiesCache && now - companiesCacheAt < CACHE_TTL_MS) {
    return companiesCache;
  }
  if (companiesInFlight) return companiesInFlight;

  companiesInFlight = (async () => {
    const response = await fetchCompanies({ limit: 500 });
    const mapped = (response?.data ?? []).map(mapCompanyToUI);
    companiesCache = mapped;
    companiesCacheAt = Date.now();
    return mapped;
  })();

  try {
    return await companiesInFlight;
  } finally {
    companiesInFlight = null;
  }
}

function invalidateCompaniesCache(): void {
  companiesCache = null;
  companiesCacheAt = 0;
}

export function useCurrentCompany() {
  const { companyId } = useParams();
  const [companies, setCompanies] = useState<Company[]>(() => companiesCache ?? []);
  const [loading, setLoading] = useState(!companiesCache);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const items = await loadCompaniesCached();
        if (isMounted) setCompanies(items);
      } catch {
        if (isMounted) setCompanies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onRefresh = () => {
      invalidateCompaniesCache();
      setLoading(true);
      void loadCompaniesCached()
        .then((items) => {
          setCompanies(items);
        })
        .catch(() => {
          setCompanies([]);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    window.addEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    return () => {
      window.removeEventListener(CRM_COMPANIES_REFRESH_EVENT, onRefresh);
    };
  }, []);

  const company = useMemo(() => {
    if (companies.length === 0) return null;
    return companies.find((item) => item.id === companyId) || companies[0] || null;
  }, [companies, companyId]);

  return { company, loading };
}
