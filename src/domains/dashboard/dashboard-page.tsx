import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../app/observability';
import { useAccessContext, useCapabilities } from '../../lib/access-control';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const accessContext = useAccessContext();
  const capabilities = useCapabilities();
  const isPlatformMode = accessContext.isSysAdmin && accessContext.organizationType === 'none';

  useEffect(() => {
    if (!isPlatformMode) return;

    observability.telemetry.track({
      name: 'platform_route_entry',
      data: {
        routeId: 'dashboard.home',
        routeFamily: 'platform-landing',
        capabilityOutcome: capabilities.canViewDashboard ? 'allowed' : 'denied',
        mode: 'platform',
      },
    });
  }, [capabilities.canViewDashboard, isPlatformMode]);

  if (isPlatformMode) {
    return (
      <section aria-labelledby="platform-dashboard-title">
        <p>{t('platform.eyebrow')}</p>
        <h1 id="platform-dashboard-title">{t('platform.title')}</h1>
        <p>{t('platform.detail')}</p>
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
    </section>
  );
}
