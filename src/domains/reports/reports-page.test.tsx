import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Link: ({ to, params, children, ...props }: { to: string; params?: Record<string, string>; children: ReactNode }) => {
      const href = params ? Object.entries(params).reduce((path, [key, value]) => path.replace(`$${key}`, value), to) : to;
      return <a href={href} {...props}>{children}</a>;
    },
  };
});

import { renderWithProviders } from '../../testing/render';
import { ReportFamilyPage, ReportsIndexPage } from './reports-page';

describe('Reports pages', () => {
  it('renders product-depth report families from the index route', () => {
    renderWithProviders(<ReportsIndexPage />);

    expect(screen.getByRole('heading', { name: 'Reports' })).toBeVisible();
    expect(screen.getByText('Product-depth report families with route-owned result, export, and scheduling states.')).toBeVisible();
    expect(screen.getByTestId('report-family-link-jobs')).toHaveAttribute('href', '/report/jobs');
    expect(screen.getByTestId('report-family-link-source')).toHaveAttribute('href', '/report/source');
  });

  it('renders partial result state with refresh intent, unknown contracts, command blocking, and safe telemetry', () => {
    window.history.pushState({}, '', '/report/jobs?period=custom-tenant-period&owner=alex@example.com&team=executive-search&result=partial');

    renderWithProviders(<ReportFamilyPage family="jobs" />);

    expect(screen.getByRole('heading', { name: 'Jobs report' })).toBeVisible();
    expect(screen.getByTestId('report-result-state')).toHaveTextContent('partial');
    expect(screen.getByTestId('report-result-refresh-intent')).toHaveTextContent('manual-refresh');
    expect(screen.getByTestId('report-unknown-contracts')).toHaveTextContent('backendResultSchema, rowDimensions, metricDefinitions');
    expect(screen.getByTestId('report-export-state')).toHaveTextContent('partial-result');
    expect(screen.getByTestId('report-schedule-state')).toHaveTextContent('partial-result');
    expect(screen.getByTestId('report-telemetry-period')).toHaveTextContent('custom');
  });

  it('renders unsupported schedule state and successful export lifecycle in the report route', () => {
    window.history.pushState({}, '', '/report/diversity?period=last-quarter');

    renderWithProviders(<ReportFamilyPage family="diversity" />);

    expect(screen.getByTestId('report-result-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('report-export-state')).toHaveTextContent('available');
    expect(screen.getByTestId('report-schedule-state')).toHaveTextContent('unsupported');
    expect(screen.getByTestId('report-schedule-button')).toBeDisabled();

    fireEvent.click(screen.getByTestId('report-export-button'));

    expect(screen.getByTestId('report-command-export-state')).toHaveTextContent('exported');
    expect(screen.getByTestId('report-command-export-message')).toHaveTextContent('export completed.');
  });
});
