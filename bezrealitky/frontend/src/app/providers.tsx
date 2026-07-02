'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { useListingModal } from '@/store/listing-modal.store';
import { ListingModal } from '@/components/listing/ListingModal';

function GlobalListingModal() {
  const { slug, close } = useListingModal();
  if (!slug) return null;
  return <ListingModal slug={slug} onClose={close} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GlobalListingModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '8px', fontSize: '14px' },
        }}
      />
    </QueryClientProvider>
  );
}
