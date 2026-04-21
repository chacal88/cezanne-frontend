import { Link, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  buildReportFamilyViewModel,
  legacyReportCompatibilityTarget,
  parseReportFiltersFromUrl,
  reportFamilies,
  runReportCommand,
  type ReportCommandViewModel,
  type ReportFamily,
} from './support/report-state';

export function ReportsIndexPage() {
  return (
    <section>
      <h1>Reports</h1>
      <p>Product-depth report families with route-owned result, export, and scheduling states.</p>
      <ul>
        {reportFamilies.map((family) => (
          <li key={family.family} data-testid={`report-family-${family.family}`}>
            <Link to="/report/$family" params={{ family: family.family }} data-testid={`report-family-link-${family.family}`}>
              {family.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReportFamilyPage({ family }: { family: ReportFamily }) {
  const filters = parseReportFiltersFromUrl(window.location.search);
  const view = buildReportFamilyViewModel(family, filters);
  const [command, setCommand] = useState<ReportCommandViewModel | null>(null);

  return (
    <section>
      <p>Report family</p>
      <h1>{view.label}</h1>
      <p data-testid="report-family-id">{view.family}</p>
      <p data-testid="report-filter-period">{view.filters.period}</p>
      <p data-testid="report-filter-owner">{view.filters.owner ?? '—'}</p>
      <p data-testid="report-result-state">{view.resultState}</p>
      <p data-testid="report-result-message">{view.result.message}</p>
      <p data-testid="report-result-refresh-intent">{view.result.refreshIntent ?? 'none'}</p>
      <p data-testid="report-unknown-contracts">{view.result.unknownContractFields.join(', ')}</p>
      <p data-testid="report-telemetry-period">{view.telemetry.safeFilterSummary.period}</p>
      <p data-testid="report-export-state">{view.exportCommand.state}</p>
      <p data-testid="report-schedule-state">{view.scheduleCommand.state}</p>
      <button type="button" disabled={view.exportCommand.state !== 'available'} onClick={() => setCommand(runReportCommand({ family: view.family, kind: 'export' }))} data-testid="report-export-button">
        Export report
      </button>
      <button type="button" disabled={view.scheduleCommand.state !== 'available'} onClick={() => setCommand(runReportCommand({ family: view.family, kind: 'schedule' }))} data-testid="report-schedule-button">
        Schedule report
      </button>
      {command ? (
        <div>
          <p data-testid={`report-command-${command.kind}-state`}>{command.state}</p>
          <p data-testid={`report-command-${command.kind}-message`}>{command.message}</p>
        </div>
      ) : null}
      <Link to={view.parentTarget} data-testid="report-parent-link">
        Back to reports
      </Link>
    </section>
  );
}

export function LegacyReportCompatibilityPage({ reportId }: { reportId?: string }) {
  return <Navigate to={legacyReportCompatibilityTarget(reportId)} replace />;
}
