import {
  buildOrgTeamMemberListState,
  buildOrgInviteActionReadiness,
  buildOrgMembershipActionReadiness,
  buildRecruiterVisibilityListState,
  buildTeamTelemetryPayload,
  buildOrgTeamViewModel,
  orgTeamRoutes,
} from "./team-foundation";

describe("org team foundation view model", () => {
  it("keeps org team foundation out of platform scope", () => {
    expect(orgTeamRoutes).toEqual({
      index: "/team",
      recruiters: "/team/recruiters",
      invite: "/users/invite",
    });
    expect(buildOrgTeamViewModel("team-index")).toMatchObject({
      kind: "team-index",
      teamState: expect.objectContaining({
        readiness: "degraded",
        retryable: true,
      }),
      activeCount: 2,
      pendingInviteCount: 1,
      recruiterCount: 2,
      inviteReadyActionCount: 5,
      inviteBlockedActionCount: 5,
      membershipReadyActionCount: 5,
      membershipBlockedActionCount: 1,
      fallbackTarget: "/dashboard",
      platformScope: false,
    });
  });

  it("models member list readiness without requiring platform user capabilities", () => {
    expect(
      buildOrgTeamMemberListState({
        members: [],
        invites: [],
        recruiters: [],
        capabilities: {
          canViewOrgTeam: true,
          canViewRecruiterVisibility: true,
          canManageOrgInvites: true,
          canManagePlatformUsers: false,
        },
        personaClass: "hc-admin",
        loadState: "empty",
        unknownContractFields: ["member.apiContract"],
      }),
    ).toMatchObject({
      readiness: "empty",
      activeCount: 0,
      pendingInviteCount: 0,
      retryable: false,
      unknownContractFields: ["member.apiContract"],
    });

    expect(
      buildOrgTeamMemberListState({
        members: [],
        invites: [],
        recruiters: [],
        capabilities: {
          canViewOrgTeam: false,
          canViewRecruiterVisibility: false,
          canManageOrgInvites: false,
          canManagePlatformUsers: false,
        },
        personaClass: "unknown",
        loadState: "ready",
        unknownContractFields: [],
      }),
    ).toMatchObject({ readiness: "denied", retryable: false });
  });

  it("models recruiter visibility filters readiness and parent return state", () => {
    const state = buildRecruiterVisibilityListState({
      recruiters: [
        {
          id: "r-1",
          name: "Visible Recruiter",
          role: "recruiter",
          visibility: "visible",
          assignmentReadiness: "ready",
          linkedFavoriteCount: 2,
        },
        {
          id: "r-2",
          name: "Blocked Recruiter",
          role: "recruiter",
          visibility: "hidden",
          assignmentReadiness: "blocked",
          linkedFavoriteCount: 0,
        },
      ],
      capabilities: {
        canViewOrgTeam: true,
        canViewRecruiterVisibility: true,
        canManageOrgInvites: true,
        canManagePlatformUsers: false,
      },
      personaClass: "ra-admin",
      loadState: "stale",
      unknownContractFields: ["recruiterVisibility.filterContract"],
      filter: "hidden",
      parentTarget: "/team",
    });

    expect(state).toMatchObject({
      readiness: "stale",
      filter: "hidden",
      parentTarget: "/team",
      visibleCount: 1,
      hiddenCount: 1,
      assignmentReadyCount: 1,
      assignmentBlockedCount: 1,
      retryable: true,
    });
    expect(state.recruiters).toHaveLength(1);
  });

  it("models unavailable and refresh-required route-local states", () => {
    expect(
      buildOrgTeamMemberListState({
        members: [],
        invites: [],
        recruiters: [],
        capabilities: {
          canViewOrgTeam: true,
          canViewRecruiterVisibility: true,
          canManageOrgInvites: true,
          canManagePlatformUsers: false,
        },
        personaClass: "org-admin",
        loadState: "unavailable",
        unknownContractFields: ["member.apiContract"],
      }),
    ).toMatchObject({
      readiness: "unavailable",
      retryable: true,
      refreshRequired: false,
    });

    expect(
      buildRecruiterVisibilityListState({
        recruiters: [],
        capabilities: {
          canViewOrgTeam: true,
          canViewRecruiterVisibility: true,
          canManageOrgInvites: true,
          canManagePlatformUsers: false,
        },
        personaClass: "org-admin",
        loadState: "refresh-required",
        unknownContractFields: ["recruiterVisibility.filterContract"],
        filter: "all",
        parentTarget: "/team",
      }),
    ).toMatchObject({
      readiness: "refresh-required",
      retryable: true,
      refreshRequired: true,
      parentTarget: "/team",
    });
  });

  it("emits safe telemetry without raw user identifiers", () => {
    const telemetry = buildTeamTelemetryPayload({
      routeId: "team.org.recruiter-visibility",
      stateKind: "degraded",
      personaClass: "org-admin",
      capabilityOutcome: "allowed",
      counts: { members: 3, recruiters: 2 },
      unknownContractFields: ["member.apiContract"],
    });

    expect(telemetry).toEqual({
      routeId: "team.org.recruiter-visibility",
      stateKind: "degraded",
      personaClass: "org-admin",
      capabilityOutcome: "allowed",
      counts: { members: 3, recruiters: 2 },
      unknownContractFields: ["member.apiContract"],
    });
    expect(JSON.stringify(telemetry)).not.toContain("@");
    expect(JSON.stringify(telemetry)).not.toContain("invite-");
  });

  it("models invite send resend and revoke readiness without platform scope", () => {
    expect(
      buildOrgInviteActionReadiness({
        id: "new",
        email: "new@example.test",
        state: "draft",
      }),
    ).toEqual([
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
    ]);

    expect(
      buildOrgInviteActionReadiness({
        id: "pending",
        email: "pending@example.test",
        state: "pending",
      }),
    ).toContainEqual({
      action: "revoke",
      label: "Revoke invite",
      state: "ready",
      nextState: "revoked",
    });
  });

  it("models membership role and status action readiness for org team members", () => {
    expect(
      buildOrgMembershipActionReadiness({
        id: "admin",
        name: "Admin",
        role: "admin",
        state: "active",
      }),
    ).toEqual([
      {
        action: "change-role",
        label: "Move to recruiter",
        state: "ready",
        nextState: "active",
      },
      {
        action: "change-status",
        label: "Disable member",
        state: "ready",
        nextState: "disabled",
      },
    ]);

    expect(
      buildOrgMembershipActionReadiness({
        id: "pending",
        name: "Pending",
        role: "recruiter",
        state: "pending-invite",
      }),
    ).toContainEqual({
      action: "change-role",
      label: "Change role",
      state: "blocked",
      reason: "Pending members must accept their invite first",
    });
  });
});
