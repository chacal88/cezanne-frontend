import { describe, expect, it } from 'vitest';
import { getRouteMetadata } from './route-metadata';

describe('dashboard notification inbox route metadata', () => {
  it('registers R0 product-depth capabilities and implementation state', () => {
    expect(getRouteMetadata('/dashboard')).toMatchObject({ domain: 'dashboard', module: 'landing', requiredCapability: 'canViewDashboard', implementationState: 'implemented' });
    expect(getRouteMetadata('/notifications')).toMatchObject({ domain: 'shell', module: 'notifications', requiredCapability: 'canViewNotifications', implementationState: 'implemented' });
    expect(getRouteMetadata('/inbox')).toMatchObject({ domain: 'inbox', module: 'conversation-entry', requiredCapability: 'canUseInbox', mutationCapability: 'canOpenConversation', implementationState: 'implemented' });
  });
});
