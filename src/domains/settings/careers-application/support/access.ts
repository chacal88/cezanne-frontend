import type { Capabilities } from '../../../../lib/access-control';
import type { CareersApplicationDecision } from './models';

export function evaluateCareersPageAccess(
  capabilities: Capabilities,
  input: { brand?: string; featureEnabled: boolean },
): CareersApplicationDecision {
  if (!capabilities.canManageCareersPage) {
    return { family: 'careers-page', capabilityKey: 'canManageCareersPage', readiness: 'feature-disabled', canProceed: false, reason: 'missing capability' };
  }

  if (!input.featureEnabled) {
    return { family: 'careers-page', capabilityKey: 'canManageCareersPage', readiness: 'feature-disabled', canProceed: false, reason: 'careers page opt-in disabled' };
  }

  if (!input.brand) {
    return { family: 'careers-page', capabilityKey: 'canManageCareersPage', readiness: 'missing-brand', canProceed: false, reason: 'brand context is required' };
  }

  return { family: 'careers-page', capabilityKey: 'canManageCareersPage', readiness: 'ready', canProceed: true };
}

export function evaluateApplicationPageAccess(
  capabilities: Capabilities,
  input: { settingsId?: string; featureEnabled: boolean },
): CareersApplicationDecision {
  if (!capabilities.canManageApplicationPage) {
    return {
      family: 'application-page',
      capabilityKey: 'canManageApplicationPage',
      readiness: 'feature-disabled',
      canProceed: false,
      reason: 'missing capability',
    };
  }

  if (!input.featureEnabled) {
    return {
      family: 'application-page',
      capabilityKey: 'canManageApplicationPage',
      readiness: 'feature-disabled',
      canProceed: false,
      reason: 'application page opt-in disabled',
    };
  }

  if (!input.settingsId) {
    return {
      family: 'application-page',
      capabilityKey: 'canManageApplicationPage',
      readiness: 'missing-settings',
      canProceed: false,
      reason: 'settings context is required',
    };
  }

  return { family: 'application-page', capabilityKey: 'canManageApplicationPage', readiness: 'ready', canProceed: true };
}

export function evaluateJobListingsAccess(
  capabilities: Capabilities,
  input: { brand?: string; featureEnabled: boolean; publishReady: boolean; listingExists?: boolean },
): CareersApplicationDecision {
  if (!capabilities.canManageJobListings) {
    return { family: 'job-listings', capabilityKey: 'canManageJobListings', readiness: 'feature-disabled', canProceed: false, reason: 'missing capability' };
  }

  if (!input.featureEnabled) {
    return { family: 'job-listings', capabilityKey: 'canManageJobListings', readiness: 'feature-disabled', canProceed: false, reason: 'job listings opt-in disabled' };
  }

  if (!input.brand) {
    return { family: 'job-listings', capabilityKey: 'canManageJobListings', readiness: 'missing-brand', canProceed: false, reason: 'brand context is required' };
  }

  if (input.listingExists === false) {
    return { family: 'job-listings', capabilityKey: 'canManageJobListings', readiness: 'listing-missing', canProceed: false, reason: 'listing not found' };
  }

  if (!input.publishReady) {
    return { family: 'job-listings', capabilityKey: 'canManageJobListings', readiness: 'publish-blocked', canProceed: false, reason: 'publish prerequisites are not satisfied' };
  }

  return { family: 'job-listings', capabilityKey: 'canManageJobListings', readiness: 'ready', canProceed: true };
}

