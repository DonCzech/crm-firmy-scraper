import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { Toaster } from '@/components/ui/sonner';
import { ModulesProvider } from './providers/modules-provider';
import { CoreCsLocalizer } from './localization/core-cs-localizer';
import { LanguageProvider, useLanguage } from './localization/language-context';

const { BASE_URL } = import.meta.env;

export function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}

function AppShell() {
  const { language } = useLanguage();

  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      logFrontendError({
        area: 'ui-runtime',
        message: event.message || 'Unhandled window error',
        meta: {
          file: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error instanceof Error ? event.error.stack : undefined,
          path: window.location.pathname,
        },
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? { message: event.reason.message, stack: event.reason.stack }
          : { message: String(event.reason ?? 'Unknown promise rejection') };
      logFrontendError({
        area: 'ui-runtime',
        message: 'Unhandled promise rejection',
        meta: {
          reason,
          path: window.location.pathname,
        },
      });
    };

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <LoadingBarContainer>
          <BrowserRouter basename={BASE_URL}>
            <Toaster />
            <CoreCsLocalizer language={language} />
            <ModulesProvider />
          </BrowserRouter>
        </LoadingBarContainer>
      </HelmetProvider>
    </ThemeProvider>
  );
}
