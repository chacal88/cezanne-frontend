import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buildCloseTarget } from '../../lib/routing';

export function UserProfileShellOverlay() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const closeTarget = buildCloseTarget(pathname);
  const { t } = useTranslation('shell');

  return (
    <section style={{ maxWidth: 480, border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <p style={{ marginTop: 0, color: '#666' }}>{t('userProfile.eyebrow')}</p>
      <h2 style={{ marginTop: 0 }}>{t('userProfile.title')}</h2>
      <p>{t('userProfile.detail')}</p>
      <Link to={closeTarget as '/dashboard'} data-testid="user-profile-close-link">
        {t('userProfile.close')}
      </Link>
    </section>
  );
}
