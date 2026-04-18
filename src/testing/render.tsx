import type { PropsWithChildren, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { AccessProvider } from '../lib/access-control';

export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <AccessProvider>{children}</AccessProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
