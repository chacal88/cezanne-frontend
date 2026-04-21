import { AccountSettingsPage } from '../../domains/settings/account/account-settings-page';

export function HiringCompanyProfilePage() {
  return <AccountSettingsPage routeKind="hiring-company-profile" titleKey="organizationProfile.hiringCompany.title" descriptionKey="organizationProfile.hiringCompany.detail" />;
}

export function RecruitmentAgencyProfilePage() {
  return <AccountSettingsPage routeKind="recruitment-agency-profile" titleKey="organizationProfile.recruitmentAgency.title" descriptionKey="organizationProfile.recruitmentAgency.detail" />;
}
