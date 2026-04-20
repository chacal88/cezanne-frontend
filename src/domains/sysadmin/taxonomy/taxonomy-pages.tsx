import { useTranslation } from 'react-i18next';
import {
  buildSectorDetailState,
  buildSectorListState,
  buildSubsectorDetailState,
  buildSubsectorListState,
  type TaxonomyState,
} from './support/taxonomy-state';

export function SectorListPage() {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.sectorListTitle')} copy={t('taxonomy.sectorListCopy')} state={buildSectorListState()} />;
}

export function SectorDetailPage({ sectorId }: { sectorId: string }) {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.sectorDetailTitle', { id: sectorId })} copy={t('taxonomy.sectorDetailCopy')} state={buildSectorDetailState(sectorId)} />;
}

export function SubsectorListPage({ sectorId }: { sectorId: string }) {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.subsectorListTitle', { id: sectorId })} copy={t('taxonomy.subsectorListCopy')} state={buildSubsectorListState(sectorId)} />;
}

export function SubsectorDetailPage({ subsectorId }: { subsectorId: string }) {
  const { t } = useTranslation('sysadmin');
  return <TaxonomySection title={t('taxonomy.subsectorDetailTitle', { id: subsectorId })} copy={t('taxonomy.subsectorDetailCopy')} state={buildSubsectorDetailState(subsectorId)} />;
}

function TaxonomySection({ title, copy, state }: { title: string; copy: string; state: TaxonomyState }) {
  const { t } = useTranslation('sysadmin');
  return (
    <section aria-labelledby="platform-taxonomy-title">
      <p>{t('taxonomy.eyebrow')}</p>
      <h1 id="platform-taxonomy-title">{title}</h1>
      <p>{copy}</p>
      <dl>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-taxonomy-state">{state.kind}</dd>
        <dt>{t('taxonomy.surfaceLabel')}</dt>
        <dd>{state.surface}</dd>
        <dt>{t('taxonomy.parentTargetLabel')}</dt>
        <dd>{state.parentTarget}</dd>
      </dl>
    </section>
  );
}
