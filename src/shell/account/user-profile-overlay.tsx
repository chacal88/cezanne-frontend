import { useRouterState, useSearch } from '@tanstack/react-router';
import { AccountSettingsPage } from '../../domains/settings/account/account-settings-page';
import { buildCloseTarget } from '../../lib/routing';

export function UserProfileShellOverlay() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const closeTarget = buildCloseTarget(pathname);

  return <AccountSettingsPage routeKind="user-profile" titleKey="userProfile.title" descriptionKey="userProfile.detail" isOverlay parentTarget={closeTarget as '/dashboard'} fixtureState={search.fixtureState} />;
}
