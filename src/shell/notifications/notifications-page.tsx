import { useEffect } from 'react';
import { useCapabilities } from '../../lib/access-control';
import { useTranslation } from 'react-i18next';
import { buildNotificationCenterViewModel, buildShellNotificationTelemetry } from './notification-state';
import { observability } from '../../app/observability';

export function NotificationsPage() {
  const capabilities = useCapabilities();
  const { t } = useTranslation('shell');
  const center = buildNotificationCenterViewModel({ capabilities });

  useEffect(() => {
    center.items.forEach((item) => observability.telemetry.track(buildShellNotificationTelemetry(item)));
  }, [center.items]);

  return (
    <section>
      <h1>{t('notifications.title')}</h1>
      <p>
        {t('notifications.accessLabel')} <strong>{capabilities.canViewNotifications ? t('notifications.allowed') : t('notifications.denied')}</strong>
      </p>
      <p data-testid="notification-center-state">{center.state}</p>
      <p data-testid="notification-center-unread">{center.unreadCount}</p>
      <p data-testid="notification-center-adapter">{center.adapterContract}</p>
      {center.unknownContracts.length ? <p data-testid="notification-unknown-contracts">{center.unknownContracts.join(', ')}</p> : null}
      <ul>
        {center.items.map((item) => (
          <li key={item.id} data-testid={`notification-${item.id}`}>
            <strong>{t(item.labelKey)}</strong>
            <div><code>{item.target}</code></div>
            <p data-testid={`notification-message-${item.id}`}>{item.message}</p>
            <span data-testid={`notification-status-${item.id}`}>{item.state}</span>{' '}
            <span data-testid={`notification-read-${item.id}`}>{item.readState}</span>{' '}
            <span data-testid={`notification-refresh-${item.id}`}>{String(item.refreshRequired)}</span>{' '}
            {item.state === 'ready' ? (
              <a href={`${item.target}${item.target.includes('?') ? '&' : '?'}entry=notification`} data-testid={`notification-link-${item.id}`}>Open destination</a>
            ) : (
              <span>{t('notifications.safeFallback')} <code>{item.fallbackTarget}</code></span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
