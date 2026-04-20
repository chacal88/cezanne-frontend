import { useTranslation } from 'react-i18next';
import {
  buildPlatformUserDetailState,
  buildPlatformUserEditState,
  buildPlatformUserListState,
  type PlatformUserListState,
} from './support/platform-users-state';
import { buildFavoriteRequestQueueState, getFavoriteRequestActionReadiness } from './support/favorite-request-queue-state';

export function PlatformUsersListPage({ search }: { search: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  const state = buildPlatformUserListState(search);
  return <PlatformUsersStateSection title={t('users.listTitle')} state={state} />;
}

export function PlatformUserCreatePage({ search }: { search: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  const state = buildPlatformUserListState(search);
  return <PlatformUsersStateSection title={t('users.createTitle')} state={{ ...state, kind: 'ready' }} />;
}

export function PlatformUserDetailPage({ userId, returnTo }: { userId: string; returnTo?: string }) {
  const { t } = useTranslation('sysadmin');
  const state = buildPlatformUserDetailState(userId, returnTo);
  return (
    <section aria-labelledby="platform-user-title">
      <p>{t('users.eyebrow')}</p>
      <h1 id="platform-user-title">{t('users.detailTitle', { id: userId })}</h1>
      <p>{t('users.detailCopy')}</p>
      <StateDescription state={state.kind} parent={state.parentTarget} />
    </section>
  );
}

export function PlatformUserEditPage({ userId, returnTo }: { userId: string; returnTo?: string }) {
  const { t } = useTranslation('sysadmin');
  const state = buildPlatformUserEditState(userId, returnTo);
  return (
    <section aria-labelledby="platform-user-title">
      <p>{t('users.eyebrow')}</p>
      <h1 id="platform-user-title">{t('users.editTitle', { id: userId })}</h1>
      <p>{t('users.editCopy')}</p>
      <StateDescription state={state.kind} parent={state.cancelTarget} />
    </section>
  );
}

export function PlatformFavoriteRequestsPage() {
  const { t } = useTranslation('sysadmin');
  const state = buildFavoriteRequestQueueState('pending');
  return (
    <section aria-labelledby="favorite-request-title">
      <p>{t('favoriteRequests.eyebrow')}</p>
      <h1 id="favorite-request-title">{t('favoriteRequests.listTitle')}</h1>
      <p>{t('favoriteRequests.listCopy')}</p>
      <StateDescription state={state.kind} parent={state.parentTarget} />
    </section>
  );
}

export function PlatformFavoriteRequestDetailPage({ requestId }: { requestId: string }) {
  const { t } = useTranslation('sysadmin');
  const state = buildFavoriteRequestQueueState('pending');
  const approve = getFavoriteRequestActionReadiness(state.kind, 'approve');
  return (
    <section aria-labelledby="favorite-request-title">
      <p>{t('favoriteRequests.eyebrow')}</p>
      <h1 id="favorite-request-title">{t('favoriteRequests.detailTitle', { id: requestId })}</h1>
      <p>{t('favoriteRequests.detailCopy')}</p>
      <StateDescription state={state.kind} parent={state.parentTarget} />
      <dl>
        <dt>{t('favoriteRequests.approveAction')}</dt>
        <dd data-testid="platform-favorite-request-action">{approve.available ? 'available' : approve.blockedReason}</dd>
      </dl>
    </section>
  );
}

function PlatformUsersStateSection({ title, state }: { title: string; state: PlatformUserListState }) {
  const { t } = useTranslation('sysadmin');
  return (
    <section aria-labelledby="platform-user-title">
      <p>{t('users.eyebrow')}</p>
      <h1 id="platform-user-title">{title}</h1>
      <p>{t('users.listCopy')}</p>
      <StateDescription state={state.kind} parent={state.returnTo} />
      <dl>
        <dt>{t('users.filtersLabel')}</dt>
        <dd data-testid="platform-user-filters">{JSON.stringify(state.filters)}</dd>
      </dl>
    </section>
  );
}

function StateDescription({ state, parent }: { state: string; parent: string }) {
  const { t } = useTranslation('sysadmin');
  return (
    <dl>
      <dt>{t('foundation.stateLabel')}</dt>
      <dd data-testid="platform-users-requests-state">{state}</dd>
      <dt>{t('users.parentTargetLabel')}</dt>
      <dd>{parent}</dd>
    </dl>
  );
}
