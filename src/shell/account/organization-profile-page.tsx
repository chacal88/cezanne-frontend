import { useSearch } from '@tanstack/react-router';
import { AccountSettingsPage } from '../../domains/settings/account/account-settings-page';

export function HiringCompanyProfilePage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  return <AccountSettingsPage routeKind="hiring-company-profile" titleKey="organizationProfile.hiringCompany.title" descriptionKey="organizationProfile.hiringCompany.detail" fixtureState={search.fixtureState} />;
}

export function RecruitmentAgencyProfilePage() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  return <AccountSettingsPage routeKind="recruitment-agency-profile" titleKey="organizationProfile.recruitmentAgency.title" descriptionKey="organizationProfile.recruitmentAgency.detail" fixtureState={search.fixtureState} />;
}
