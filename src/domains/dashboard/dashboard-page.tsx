import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../app/observability';
import { buildDashboardOperationalState } from './dashboard-state';
import { useAccessContext, useCapabilities } from '../../lib/access-control';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const accessContext = useAccessContext();
  const capabilities = useCapabilities();
  const isPlatformMode = accessContext.isSysAdmin && accessContext.organizationType === 'none';
  const params = new URLSearchParams(window.location.search);
  const dashboard = buildDashboardOperationalState({
    reason: params.get('reason') ?? undefined,
    platformMode: isPlatformMode,
    fallbackTarget: params.get('fallbackTarget') ?? undefined,
    sourceHealth: params.get('sourceHealth') as never,
    calendarReadiness: params.get('calendarReadiness') as never,
    notificationCount: capabilities.canViewNotifications ? 3 : 0,
    inboxConversationCount: capabilities.canUseInbox ? 2 : 0,
  });

  useEffect(() => {
    observability.telemetry.track({
      name: isPlatformMode ? 'platform_route_entry' : 'dashboard_operational_entry',
      data: {
        routeId: 'dashboard.home',
        routeFamily: isPlatformMode ? 'platform-landing' : 'dashboard-landing',
        capabilityOutcome: capabilities.canViewDashboard ? 'allowed' : 'denied',
        mode: isPlatformMode ? 'platform' : 'org',
        reentryReason: dashboard.reason,
        sourceHealth: dashboard.sourceHealth,
      },
    });
  }, [capabilities.canViewDashboard, dashboard.reason, dashboard.sourceHealth, isPlatformMode]);

  const body = (
    <>
      <p data-testid="dashboard-reentry-state">{dashboard.reason}</p>
      <p data-testid="dashboard-reentry-message">{dashboard.message}</p>
      <dl aria-label="Dashboard operational state">
        <dt>{t('operational.sourceHealth')}</dt>
        <dd data-testid="dashboard-source-health">{dashboard.sourceHealth}</dd>
        <dt>{t('operational.calendarReadiness')}</dt>
        <dd data-testid="dashboard-calendar-readiness">{dashboard.calendarReadiness}</dd>
        <dt>{t('operational.notifications')}</dt>
        <dd data-testid="dashboard-notification-state">{dashboard.notificationState}</dd>
        <dt>{t('operational.inbox')}</dt>
        <dd data-testid="dashboard-inbox-state">{dashboard.inboxState}</dd>
        <dt>{t('operational.refreshRequired')}</dt>
        <dd data-testid="dashboard-refresh-required">{String(dashboard.refreshRequired)}</dd>
        <dt>{t('operational.adapter')}</dt>
        <dd data-testid="dashboard-adapter-contract">{dashboard.adapterContract}</dd>
      </dl>
      {dashboard.fallbackTarget ? <a href={dashboard.fallbackTarget} data-testid="dashboard-fallback-target">{dashboard.fallbackTarget}</a> : null}
      <ul aria-label="Dashboard safe actions">
        {dashboard.safeActions.map((action) => (
          <li key={`${action.kind}-${action.target}`}>
            <a href={action.target} data-testid={`dashboard-action-${action.kind}`}>{action.label}</a>
            {action.refreshIntent ? <span data-testid={`dashboard-action-refresh-${action.kind}`}>{action.refreshIntent}</span> : null}
          </li>
        ))}
      </ul>
      {dashboard.unknownContracts.length ? (
        <p data-testid="dashboard-unknown-contracts">{dashboard.unknownContracts.join(', ')}</p>
      ) : null}
    </>
  );

  if (isPlatformMode) {
    return (
      <section aria-labelledby="platform-dashboard-title">
        <p>{t('platform.eyebrow')}</p>
        <h1 id="platform-dashboard-title">{t('platform.title')}</h1>
        <p>{t('platform.detail')}</p>
        {body}
        <ul>
          <li>{t('platform.masterData')}</li>
          <li>{t('platform.usersAndRequests')}</li>
          <li>{t('platform.taxonomy')}</li>
        </ul>
      </section>
    );
  }

  return (
    <section>
      <h1>{t('home.title')}</h1>
      <p>{t('home.detail')}</p>
      {body}
    </section>
  );
}
