import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation('dashboard');

  return (
    <section>
      <h1>{t('home.title')}</h1>
      <p>{t('home.detail')}</p>
    </section>
  );
}
