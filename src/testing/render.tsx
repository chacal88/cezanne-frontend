import type { PropsWithChildren, ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { AccessProvider, type AccessContext } from '../lib/access-control';
import '../app/i18n';

export function renderWithProviders(ui: ReactElement, options: { accessContext?: AccessContext } = {}) {
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
        <AccessProvider value={options.accessContext}>{children}</AccessProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
