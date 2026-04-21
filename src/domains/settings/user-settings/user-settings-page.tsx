import { AccountSettingsPage } from '../account/account-settings-page';

export function UserSettingsPage() {
  return <AccountSettingsPage routeKind="user-settings" titleKey="accountSettings.user.title" descriptionKey="accountSettings.user.detail" />;
}
