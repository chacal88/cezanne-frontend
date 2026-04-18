export type OrganizationType = 'hc' | 'ra' | 'none';

export type AccessContext = {
  isAuthenticated: boolean;
  organizationType: OrganizationType;
  isAdmin: boolean;
  isSysAdmin: boolean;
  pivotEntitlements: string[];
  subscriptionCapabilities: string[];
  rolloutFlags: string[];
};

export type Capabilities = {
  canEnterShell: boolean;
  canViewDashboard: boolean;
  canViewNotifications: boolean;
  canUseInbox: boolean;
  canOpenAccountArea: boolean;
  canLogout: boolean;
  canSeeNavSection: boolean;
};
