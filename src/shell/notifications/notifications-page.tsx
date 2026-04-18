import { resolveTypedDestinationForR0, type TypedDestination } from '../../lib/routing';
import { useCapabilities } from '../../lib/access-control';
import { useTranslation } from 'react-i18next';

const seededNotifications: { id: string; labelKey: 'notifications.seeded.candidateFollowUp' | 'notifications.seeded.offerAttention'; destination: TypedDestination }[] = [
  {
    id: 'n-1',
    labelKey: 'notifications.seeded.candidateFollowUp',
    destination: {
      kind: 'candidate.detail',
      candidateId: 'candidate-123',
      jobId: 'job-456',
      status: 'screening',
      order: '2',
      filters: 'remote',
      interview: 'interview-1',
    },
  },
  {
    id: 'n-2',
    labelKey: 'notifications.seeded.offerAttention',
    destination: { kind: 'job.offer', jobId: 'job-456', candidateId: 'candidate-123' },
  },
];

export function NotificationsPage() {
  const capabilities = useCapabilities();
  const { t } = useTranslation('shell');

  return (
    <section>
      <h1>{t('notifications.title')}</h1>
      <p>
        {t('notifications.accessLabel')} <strong>{capabilities.canViewNotifications ? t('notifications.allowed') : t('notifications.denied')}</strong>
      </p>
      <ul>
        {seededNotifications.map((item) => {
          const resolution = resolveTypedDestinationForR0(item.destination);

          return (
            <li key={item.id} data-testid={`notification-${item.id}`}>
              <strong>{t(item.labelKey)}</strong>
              <div>
                <code>{resolution.target}</code>
              </div>
              {resolution.status === 'available' ? (
                <span data-testid={`notification-status-${item.id}`}>
                  {t('notifications.ready')}{' '}
                  <a href={`${resolution.target}?entry=notification`} data-testid={`notification-link-${item.id}`}>
                    Open destination
                  </a>
                </span>
              ) : (
                <span data-testid={`notification-status-${item.id}`}>
                  {resolution.message} {t('notifications.safeFallback')} <code>{resolution.fallbackTarget}</code>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
