import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export type Locale = 'cs' | 'en';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'online-odhad-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [locale, setLocaleState] = useState<Locale>('cs');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('lang');
    if (fromQuery === 'en' || fromQuery === 'cs') {
      setLocaleState(fromQuery);
      localStorage.setItem(STORAGE_KEY, fromQuery);
      return;
    }

    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage === 'en' || fromStorage === 'cs') {
      setLocaleState(fromStorage);
    }
  }, [location.search]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);

    const params = new URLSearchParams(location.search);
    params.set('lang', next);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return ctx;
}
