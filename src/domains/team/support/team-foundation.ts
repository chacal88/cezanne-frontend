export type OrgTeamRouteKind =
  | "team-index"
  | "recruiter-visibility"
  | "invite-foundation";
export type OrgTeamMemberState = "active" | "pending-invite" | "disabled";
export type OrgTeamInviteState =
  | "draft"
  | "pending"
  | "sent"
  | "revoked"
  | "blocked";
export type OrgTeamInviteActionKind = "send" | "resend" | "revoke";
export type OrgTeamMemberActionKind = "change-role" | "change-status";
export type OrgTeamPersonaClass =
  | "hc-admin"
  | "ra-admin"
  | "org-admin"
  | "unknown";
export type OrgTeamCapabilityOutcome = "allowed" | "denied" | "partial";
export type OrgTeamLoadState =
  | "ready"
  | "empty"
  | "partial"
  | "stale"
  | "unavailable"
  | "refresh-required";
export type OrgTeamReadinessKind =
  | "ready"
  | "empty"
  | "denied"
  | "unavailable"
  | "degraded"
  | "stale"
  | "retryable"
  | "refresh-required";
export type RecruiterVisibilityFilter =
  | "all"
  | "visible"
  | "limited"
  | "hidden";
export type RecruiterVisibility = "visible" | "limited" | "hidden";
export type RecruiterAssignmentReadiness = "ready" | "pending" | "blocked";

export type OrgTeamMember = {
  id: string;
  name: string;
  role: "admin" | "recruiter";
  state: OrgTeamMemberState;
};

export type OrgTeamInvite = {
  id: string;
  email: string;
  state: OrgTeamInviteState;
  blockedReason?: string;
};

export type OrgTeamRecruiterVisibility = {
  id: string;
  name: string;
  visibility: RecruiterVisibility;
  assignmentReadiness: RecruiterAssignmentReadiness;
  role: "admin" | "recruiter";
  linkedFavoriteCount: number;
};

export type OrgTeamActionReadiness<ActionKind extends string> = {
  action: ActionKind;
  label: string;
  state: "ready" | "pending" | "success" | "blocked";
  nextState?: OrgTeamInviteState | OrgTeamMemberState;
  reason?: string;
};

export type OrgTeamCapabilities = {
  canViewOrgTeam: boolean;
  canViewRecruiterVisibility: boolean;
  canManageOrgInvites: boolean;
  canManagePlatformUsers?: boolean;
};

export type OrgTeamAdapterSnapshot = {
  members: OrgTeamMember[];
  invites: OrgTeamInvite[];
  recruiters: OrgTeamRecruiterVisibility[];
  capabilities: OrgTeamCapabilities;
  personaClass: OrgTeamPersonaClass;
  loadState: OrgTeamLoadState;
  unknownContractFields: string[];
  refreshRequired?: boolean;
};

export type RecruiterVisibilityAdapterSnapshot = Pick<
  OrgTeamAdapterSnapshot,
  | "recruiters"
  | "capabilities"
  | "personaClass"
  | "loadState"
  | "unknownContractFields"
  | "refreshRequired"
> & {
  filter: RecruiterVisibilityFilter;
  parentTarget: typeof orgTeamRoutes.index;
};

export type OrgTeamAdapter = {
  getTeamSnapshot: () => OrgTeamAdapterSnapshot;
  getRecruiterVisibilitySnapshot: (
    filter?: RecruiterVisibilityFilter,
  ) => RecruiterVisibilityAdapterSnapshot;
};

export type OrgTeamListState = {
  readiness: OrgTeamReadinessKind;
  members: OrgTeamMember[];
  invites: OrgTeamInvite[];
  activeCount: number;
  pendingInviteCount: number;
  disabledCount: number;
  roleCounts: Record<OrgTeamMember["role"], number>;
  retryable: boolean;
  refreshRequired: boolean;
  unknownContractFields: string[];
};

export type RecruiterVisibilityListState = {
  readiness: OrgTeamReadinessKind;
  recruiters: OrgTeamRecruiterVisibility[];
  filter: RecruiterVisibilityFilter;
  availableFilters: RecruiterVisibilityFilter[];
  visibleCount: number;
  limitedCount: number;
  hiddenCount: number;
  assignmentReadyCount: number;
  assignmentBlockedCount: number;
  retryable: boolean;
  refreshRequired: boolean;
  parentTarget: typeof orgTeamRoutes.index;
  unknownContractFields: string[];
};

export type TeamTelemetryPayload = {
  routeId:
    | "team.org.index"
    | "team.org.recruiter-visibility"
    | "team.org.invite-foundation";
  stateKind: OrgTeamReadinessKind;
  personaClass: OrgTeamPersonaClass;
  capabilityOutcome: OrgTeamCapabilityOutcome;
  counts: Record<string, number>;
  unknownContractFields: string[];
};

export const orgTeamRoutes = {
  index: "/team",
  recruiters: "/team/recruiters",
  invite: "/users/invite",
} as const;

const members: OrgTeamMember[] = [
  { id: "member-1", name: "Alex Admin", role: "admin", state: "active" },
  {
    id: "member-2",
    name: "Riley Recruiter",
    role: "recruiter",
    state: "active",
  },
  {
    id: "member-3",
    name: "Pending Member",
    role: "recruiter",
    state: "pending-invite",
  },
];

const invites: OrgTeamInvite[] = [
  { id: "invite-1", email: "new.recruiter@example.test", state: "draft" },
  { id: "invite-2", email: "pending.member@example.test", state: "pending" },
  { id: "invite-3", email: "accepted.member@example.test", state: "sent" },
  {
    id: "invite-4",
    email: "blocked.member@example.test",
    state: "blocked",
    blockedReason: "Missing recipient email confirmation",
  },
];

const recruiters: OrgTeamRecruiterVisibility[] = [
  {
    id: "recruiter-1",
    name: "Riley Recruiter",
    role: "recruiter",
    visibility: "visible",
    assignmentReadiness: "ready",
    linkedFavoriteCount: 2,
  },
  {
    id: "recruiter-2",
    name: "Casey Coordinator",
    role: "recruiter",
    visibility: "limited",
    assignmentReadiness: "pending",
    linkedFavoriteCount: 1,
  },
  {
    id: "recruiter-3",
    name: "Jordan Hidden",
    role: "admin",
    visibility: "hidden",
    assignmentReadiness: "blocked",
    linkedFavoriteCount: 0,
  },
];

const defaultCapabilities: OrgTeamCapabilities = {
  canViewOrgTeam: true,
  canViewRecruiterVisibility: true,
  canManageOrgInvites: true,
  canManagePlatformUsers: false,
};

const unknownTeamContractFields = [
  "member.apiContract",
  "member.roleWritePolicy",
  "recruiterVisibility.filterContract",
];

export const fixtureOrgTeamAdapter: OrgTeamAdapter = {
  getTeamSnapshot: () => ({
    members,
    invites,
    recruiters,
    capabilities: defaultCapabilities,
    personaClass: "org-admin",
    loadState: "partial",
    unknownContractFields: unknownTeamContractFields,
  }),
  getRecruiterVisibilitySnapshot: (filter = "all") => ({
    recruiters,
    capabilities: defaultCapabilities,
    personaClass: "org-admin",
    loadState: "partial",
    unknownContractFields: unknownTeamContractFields,
    filter,
    parentTarget: orgTeamRoutes.index,
  }),
};

function capabilityOutcome(
  capabilities: OrgTeamCapabilities,
  capability: keyof OrgTeamCapabilities,
): OrgTeamCapabilityOutcome {
  if (capabilities[capability]) {
    return capabilities.canManagePlatformUsers ? "partial" : "allowed";
  }

  return "denied";
}

function resolveReadiness(
  loadState: OrgTeamLoadState,
  canView: boolean,
  itemCount: number,
  refreshRequired?: boolean,
): OrgTeamReadinessKind {
  if (!canView) {
    return "denied";
  }

  if (refreshRequired || loadState === "refresh-required") {
    return "refresh-required";
  }

  if (loadState === "unavailable") {
    return "unavailable";
  }

  if (loadState === "stale") {
    return "stale";
  }

  if (loadState === "partial") {
    return "degraded";
  }

  if (loadState === "empty" || itemCount === 0) {
    return "empty";
  }

  return "ready";
}

function buildRetryable(readiness: OrgTeamReadinessKind) {
  return (
    readiness === "unavailable" ||
    readiness === "stale" ||
    readiness === "degraded" ||
    readiness === "refresh-required"
  );
}

export function buildOrgTeamMemberListState(
  snapshot = fixtureOrgTeamAdapter.getTeamSnapshot(),
): OrgTeamListState {
  const readiness = resolveReadiness(
    snapshot.loadState,
    snapshot.capabilities.canViewOrgTeam,
    snapshot.members.length,
    snapshot.refreshRequired,
  );

  return {
    readiness,
    members: snapshot.members,
    invites: snapshot.invites,
    activeCount: snapshot.members.filter((member) => member.state === "active")
      .length,
    pendingInviteCount: snapshot.members.filter(
      (member) => member.state === "pending-invite",
    ).length,
    disabledCount: snapshot.members.filter(
      (member) => member.state === "disabled",
    ).length,
    roleCounts: {
      admin: snapshot.members.filter((member) => member.role === "admin")
        .length,
      recruiter: snapshot.members.filter(
        (member) => member.role === "recruiter",
      ).length,
    },
    retryable: buildRetryable(readiness),
    refreshRequired: readiness === "refresh-required",
    unknownContractFields: snapshot.unknownContractFields,
  };
}

export function buildRecruiterVisibilityListState(
  snapshot = fixtureOrgTeamAdapter.getRecruiterVisibilitySnapshot(),
): RecruiterVisibilityListState {
  const filteredRecruiters =
    snapshot.filter === "all"
      ? snapshot.recruiters
      : snapshot.recruiters.filter(
          (recruiter) => recruiter.visibility === snapshot.filter,
        );
  const readiness = resolveReadiness(
    snapshot.loadState,
    snapshot.capabilities.canViewRecruiterVisibility,
    filteredRecruiters.length,
    snapshot.refreshRequired,
  );

  return {
    readiness,
    recruiters: filteredRecruiters,
    filter: snapshot.filter,
    availableFilters: ["all", "visible", "limited", "hidden"],
    visibleCount: snapshot.recruiters.filter(
      (recruiter) => recruiter.visibility === "visible",
    ).length,
    limitedCount: snapshot.recruiters.filter(
      (recruiter) => recruiter.visibility === "limited",
    ).length,
    hiddenCount: snapshot.recruiters.filter(
      (recruiter) => recruiter.visibility === "hidden",
    ).length,
    assignmentReadyCount: snapshot.recruiters.filter(
      (recruiter) => recruiter.assignmentReadiness === "ready",
    ).length,
    assignmentBlockedCount: snapshot.recruiters.filter(
      (recruiter) => recruiter.assignmentReadiness === "blocked",
    ).length,
    retryable: buildRetryable(readiness),
    refreshRequired: readiness === "refresh-required",
    parentTarget: snapshot.parentTarget,
    unknownContractFields: snapshot.unknownContractFields,
  };
}

export function buildTeamTelemetryPayload(input: {
  routeId: TeamTelemetryPayload["routeId"];
  stateKind: OrgTeamReadinessKind;
  personaClass: OrgTeamPersonaClass;
  capabilityOutcome: OrgTeamCapabilityOutcome;
  counts: Record<string, number>;
  unknownContractFields?: string[];
}): TeamTelemetryPayload {
  return {
    routeId: input.routeId,
    stateKind: input.stateKind,
    personaClass: input.personaClass,
    capabilityOutcome: input.capabilityOutcome,
    counts: input.counts,
    unknownContractFields: input.unknownContractFields ?? [],
  };
}

export function buildOrgInviteActionReadiness(
  invite: OrgTeamInvite,
): OrgTeamActionReadiness<OrgTeamInviteActionKind>[] {
  if (invite.state === "draft") {
    return [
      {
        action: "send",
        label: "Send invite",
        state: "ready",
        nextState: "pending",
      },
      {
        action: "resend",
        label: "Resend invite",
        state: "blocked",
        reason: "Invite has not been sent yet",
      },
      {
        action: "revoke",
        label: "Revoke invite",
        state: "blocked",
        reason: "Invite has not been sent yet",
      },
    ];
  }

  if (invite.state === "pending") {
    return [
      {
        action: "send",
        label: "Send invite",
        state: "pending",
        reason: "Invite send is already pending",
      },
      {
        action: "resend",
        label: "Resend invite",
        state: "ready",
        nextState: "pending",
      },
      {
        action: "revoke",
        label: "Revoke invite",
        state: "ready",
        nextState: "revoked",
      },
    ];
  }

  if (invite.state === "sent") {
    return [
      {
        action: "send",
        label: "Send invite",
        state: "success",
        reason: "Invite was already sent",
      },
      {
        action: "resend",
        label: "Resend invite",
        state: "ready",
        nextState: "pending",
      },
      {
        action: "revoke",
        label: "Revoke invite",
        state: "ready",
        nextState: "revoked",
      },
    ];
  }

  const reason =
    invite.blockedReason ??
    (invite.state === "revoked" ? "Invite was revoked" : "Invite is blocked");
  return [
    { action: "send", label: "Send invite", state: "blocked", reason },
    { action: "resend", label: "Resend invite", state: "blocked", reason },
    { action: "revoke", label: "Revoke invite", state: "blocked", reason },
  ];
}

export function buildOrgMembershipActionReadiness(
  member: OrgTeamMember,
): OrgTeamActionReadiness<OrgTeamMemberActionKind>[] {
  if (member.state === "disabled") {
    return [
      {
        action: "change-role",
        label: "Change role",
        state: "blocked",
        reason: "Disabled members cannot change roles",
      },
      {
        action: "change-status",
        label: "Reactivate member",
        state: "ready",
        nextState: "active",
      },
    ];
  }

  if (member.state === "pending-invite") {
    return [
      {
        action: "change-role",
        label: "Change role",
        state: "blocked",
        reason: "Pending members must accept their invite first",
      },
      {
        action: "change-status",
        label: "Cancel pending membership",
        state: "ready",
        nextState: "disabled",
      },
    ];
  }

  return [
    {
      action: "change-role",
      label: member.role === "admin" ? "Move to recruiter" : "Promote to admin",
      state: "ready",
      nextState: "active",
    },
    {
      action: "change-status",
      label: "Disable member",
      state: "ready",
      nextState: "disabled",
    },
  ];
}

export function buildOrgTeamViewModel(
  kind: OrgTeamRouteKind,
  adapter = fixtureOrgTeamAdapter,
) {
  const teamSnapshot = adapter.getTeamSnapshot();
  const recruiterSnapshot = adapter.getRecruiterVisibilitySnapshot();
  const teamState = buildOrgTeamMemberListState(teamSnapshot);
  const recruiterVisibilityState =
    buildRecruiterVisibilityListState(recruiterSnapshot);
  const inviteActionsByInvite = teamSnapshot.invites.map((invite) => ({
    invite,
    actions: buildOrgInviteActionReadiness(invite),
  }));
  const inviteActionStates = inviteActionsByInvite.flatMap(
    ({ actions }) => actions,
  );
  const membershipActionStates = teamSnapshot.members.flatMap(
    buildOrgMembershipActionReadiness,
  );
  const routeId =
    kind === "recruiter-visibility"
      ? "team.org.recruiter-visibility"
      : kind === "invite-foundation"
        ? "team.org.invite-foundation"
        : "team.org.index";
  const stateKind =
    kind === "recruiter-visibility"
      ? recruiterVisibilityState.readiness
      : teamState.readiness;
  const telemetry = buildTeamTelemetryPayload({
    routeId,
    stateKind,
    personaClass: teamSnapshot.personaClass,
    capabilityOutcome: capabilityOutcome(
      teamSnapshot.capabilities,
      kind === "recruiter-visibility"
        ? "canViewRecruiterVisibility"
        : "canViewOrgTeam",
    ),
    counts: {
      members: teamSnapshot.members.length,
      pendingInvites: teamState.pendingInviteCount,
      recruiters: recruiterSnapshot.recruiters.length,
      visibleRecruiters: recruiterVisibilityState.visibleCount,
      blockedAssignments: recruiterVisibilityState.assignmentBlockedCount,
    },
    unknownContractFields: Array.from(
      new Set([
        ...teamState.unknownContractFields,
        ...recruiterVisibilityState.unknownContractFields,
      ]),
    ),
  });

  return {
    kind,
    members: teamSnapshot.members,
    invites: teamSnapshot.invites,
    recruiters: recruiterVisibilityState.recruiters,
    teamState,
    recruiterVisibilityState,
    telemetry,
    inviteActionsByInvite,
    activeCount: teamState.activeCount,
    pendingInviteCount: teamState.pendingInviteCount,
    recruiterCount: teamSnapshot.members.filter(
      (member) => member.role === "recruiter",
    ).length,
    inviteActionStates,
    inviteReadyActionCount: inviteActionStates.filter(
      (action) => action.state === "ready",
    ).length,
    inviteBlockedActionCount: inviteActionStates.filter(
      (action) => action.state === "blocked",
    ).length,
    membershipActionStates,
    membershipReadyActionCount: membershipActionStates.filter(
      (action) => action.state === "ready",
    ).length,
    membershipBlockedActionCount: membershipActionStates.filter(
      (action) => action.state === "blocked",
    ).length,
    fallbackTarget: "/dashboard" as const,
    platformScope: false,
    parentTarget: orgTeamRoutes.index,
  };
}
