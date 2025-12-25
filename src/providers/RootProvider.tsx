import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react';

const queryClient = new QueryClient();

export default function RootProvider() {
  return (
    <>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <Suspense>
            <Outlet />
          </Suspense>
        </QueryClientProvider>
      </NuqsAdapter>
      <Toaster richColors />
    </>
  );
}
