import {
  buildOrgInviteActionReadiness,
  buildOrgMembershipActionReadiness,
  buildOrgTeamViewModel,
  orgTeamRoutes,
} from './team-foundation';

describe('org team foundation view model', () => {
  it('keeps org team foundation out of platform scope', () => {
    expect(orgTeamRoutes).toEqual({ index: '/team', recruiters: '/team/recruiters', invite: '/users/invite' });
    expect(buildOrgTeamViewModel('team-index')).toMatchObject({
      kind: 'team-index',
      activeCount: 2,
      pendingInviteCount: 1,
      recruiterCount: 2,
      inviteReadyActionCount: 5,
      inviteBlockedActionCount: 5,
      membershipReadyActionCount: 5,
      membershipBlockedActionCount: 1,
      fallbackTarget: '/dashboard',
      platformScope: false,
    });
  });

  it('models invite send resend and revoke readiness without platform scope', () => {
    expect(buildOrgInviteActionReadiness({ id: 'new', email: 'new@example.test', state: 'draft' })).toEqual([
      { action: 'send', label: 'Send invite', state: 'ready', nextState: 'pending' },
      { action: 'resend', label: 'Resend invite', state: 'blocked', reason: 'Invite has not been sent yet' },
      { action: 'revoke', label: 'Revoke invite', state: 'blocked', reason: 'Invite has not been sent yet' },
    ]);

    expect(buildOrgInviteActionReadiness({ id: 'pending', email: 'pending@example.test', state: 'pending' })).toContainEqual({
      action: 'revoke',
      label: 'Revoke invite',
      state: 'ready',
      nextState: 'revoked',
    });
  });

  it('models membership role and status action readiness for org team members', () => {
    expect(buildOrgMembershipActionReadiness({ id: 'admin', name: 'Admin', role: 'admin', state: 'active' })).toEqual([
      { action: 'change-role', label: 'Move to recruiter', state: 'ready', nextState: 'active' },
      { action: 'change-status', label: 'Disable member', state: 'ready', nextState: 'disabled' },
    ]);

    expect(buildOrgMembershipActionReadiness({ id: 'pending', name: 'Pending', role: 'recruiter', state: 'pending-invite' })).toContainEqual({
      action: 'change-role',
      label: 'Change role',
      state: 'blocked',
      reason: 'Pending members must accept their invite first',
    });
  });
});
