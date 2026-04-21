import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AccessProvider, publicAccessContext } from '../lib/access-control';
import { loadLocalAuthSession } from '../domains/auth/api';
import { router } from './router';
import { env } from './env';
import './i18n';

const queryClient = new QueryClient();
void env;

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessProvider initialValue={loadLocalAuthSession() ?? publicAccessContext}>
        <RouterProvider router={router} />
      </AccessProvider>
    </QueryClientProvider>
  );
}
