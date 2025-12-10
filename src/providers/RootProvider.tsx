import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

const queryClient = new QueryClient();

export default function RootProvider() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Suspense>
          <Outlet />
        </Suspense>
      </QueryClientProvider>
      <Toaster richColors />
    </>
  );
}
