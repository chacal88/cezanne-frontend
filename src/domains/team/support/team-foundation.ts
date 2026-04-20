export type OrgTeamRouteKind = 'team-index' | 'recruiter-visibility' | 'invite-foundation';
export type OrgTeamMemberState = 'active' | 'pending-invite' | 'disabled';
export type OrgTeamInviteState = 'draft' | 'pending' | 'sent' | 'revoked' | 'blocked';
export type OrgTeamInviteActionKind = 'send' | 'resend' | 'revoke';
export type OrgTeamMemberActionKind = 'change-role' | 'change-status';

export type OrgTeamMember = {
  id: string;
  name: string;
  role: 'admin' | 'recruiter';
  state: OrgTeamMemberState;
};

export type OrgTeamInvite = {
  id: string;
  email: string;
  state: OrgTeamInviteState;
  blockedReason?: string;
};

export type OrgTeamActionReadiness<ActionKind extends string> = {
  action: ActionKind;
  label: string;
  state: 'ready' | 'pending' | 'success' | 'blocked';
  nextState?: OrgTeamInviteState | OrgTeamMemberState;
  reason?: string;
};

export const orgTeamRoutes = {
  index: '/team',
  recruiters: '/team/recruiters',
  invite: '/users/invite',
} as const;

const members: OrgTeamMember[] = [
  { id: 'member-1', name: 'Alex Admin', role: 'admin', state: 'active' },
  { id: 'member-2', name: 'Riley Recruiter', role: 'recruiter', state: 'active' },
  { id: 'member-3', name: 'Pending Member', role: 'recruiter', state: 'pending-invite' },
];

const invites: OrgTeamInvite[] = [
  { id: 'invite-1', email: 'new.recruiter@example.test', state: 'draft' },
  { id: 'invite-2', email: 'pending.member@example.test', state: 'pending' },
  { id: 'invite-3', email: 'accepted.member@example.test', state: 'sent' },
  { id: 'invite-4', email: 'blocked.member@example.test', state: 'blocked', blockedReason: 'Missing recipient email confirmation' },
];

export function buildOrgInviteActionReadiness(invite: OrgTeamInvite): OrgTeamActionReadiness<OrgTeamInviteActionKind>[] {
  if (invite.state === 'draft') {
    return [
      { action: 'send', label: 'Send invite', state: 'ready', nextState: 'pending' },
      { action: 'resend', label: 'Resend invite', state: 'blocked', reason: 'Invite has not been sent yet' },
      { action: 'revoke', label: 'Revoke invite', state: 'blocked', reason: 'Invite has not been sent yet' },
    ];
  }

  if (invite.state === 'pending') {
    return [
      { action: 'send', label: 'Send invite', state: 'pending', reason: 'Invite send is already pending' },
      { action: 'resend', label: 'Resend invite', state: 'ready', nextState: 'pending' },
      { action: 'revoke', label: 'Revoke invite', state: 'ready', nextState: 'revoked' },
    ];
  }

  if (invite.state === 'sent') {
    return [
      { action: 'send', label: 'Send invite', state: 'success', reason: 'Invite was already sent' },
      { action: 'resend', label: 'Resend invite', state: 'ready', nextState: 'pending' },
      { action: 'revoke', label: 'Revoke invite', state: 'ready', nextState: 'revoked' },
    ];
  }

  const reason = invite.blockedReason ?? (invite.state === 'revoked' ? 'Invite was revoked' : 'Invite is blocked');
  return [
    { action: 'send', label: 'Send invite', state: 'blocked', reason },
    { action: 'resend', label: 'Resend invite', state: 'blocked', reason },
    { action: 'revoke', label: 'Revoke invite', state: 'blocked', reason },
  ];
}

export function buildOrgMembershipActionReadiness(member: OrgTeamMember): OrgTeamActionReadiness<OrgTeamMemberActionKind>[] {
  if (member.state === 'disabled') {
    return [
      { action: 'change-role', label: 'Change role', state: 'blocked', reason: 'Disabled members cannot change roles' },
      { action: 'change-status', label: 'Reactivate member', state: 'ready', nextState: 'active' },
    ];
  }

  if (member.state === 'pending-invite') {
    return [
      { action: 'change-role', label: 'Change role', state: 'blocked', reason: 'Pending members must accept their invite first' },
      { action: 'change-status', label: 'Cancel pending membership', state: 'ready', nextState: 'disabled' },
    ];
  }

  return [
    { action: 'change-role', label: member.role === 'admin' ? 'Move to recruiter' : 'Promote to admin', state: 'ready', nextState: 'active' },
    { action: 'change-status', label: 'Disable member', state: 'ready', nextState: 'disabled' },
  ];
}

export function buildOrgTeamViewModel(kind: OrgTeamRouteKind) {
  const inviteActionsByInvite = invites.map((invite) => ({
    invite,
    actions: buildOrgInviteActionReadiness(invite),
  }));
  const inviteActionStates = inviteActionsByInvite.flatMap(({ actions }) => actions);
  const membershipActionStates = members.flatMap(buildOrgMembershipActionReadiness);

  return {
    kind,
    members,
    invites,
    inviteActionsByInvite,
    activeCount: members.filter((member) => member.state === 'active').length,
    pendingInviteCount: members.filter((member) => member.state === 'pending-invite').length,
    recruiterCount: members.filter((member) => member.role === 'recruiter').length,
    inviteActionStates,
    inviteReadyActionCount: inviteActionStates.filter((action) => action.state === 'ready').length,
    inviteBlockedActionCount: inviteActionStates.filter((action) => action.state === 'blocked').length,
    membershipActionStates,
    membershipReadyActionCount: membershipActionStates.filter((action) => action.state === 'ready').length,
    membershipBlockedActionCount: membershipActionStates.filter((action) => action.state === 'blocked').length,
    fallbackTarget: '/dashboard' as const,
    platformScope: false,
  };
}
