import { graphqlRequest, restApiGetJson } from '../../../lib/api-client';
import type { DashboardActivityItem, DashboardCalendarEvent, DashboardOverview, DashboardReadinessState } from '../dashboard-state';

export type DashboardApiAdapter = {
  contract: 'api' | 'fixture';
  loadOverview(token: string | null): Promise<DashboardOverview>;
};

type DashboardGraphqlResponse = {
  data?: {
    dashboard?: {
      liveJobsUuids?: string[];
      liveJobsCount?: number;
      liveCvsCount?: number;
      liveInterviewsScheduledCount?: number;
    };
    monolith?: {
      users?: Array<{ id?: string | number; uuid?: string; firstName?: string; lastName?: string }>;
      auth?: {
        uuid?: string;
        firstName?: string;
        occupopEmail?: string;
        occupopEmailConfirmed?: boolean | null;
        occupopEmailConfirmationLink?: string;
        calendarIntegration?: { status?: string; statusMessage?: string };
      };
    };
  };
};

type NotificationResponse = { notifications?: Array<{ id?: string | number; key?: string; data?: Record<string, unknown>; created_at?: string; createdAt?: string }> };
type CalendarGraphqlResponse = { data?: { interview?: { queryCalendar?: Array<Record<string, unknown>> } } };

export const dashboardOverviewQuery = `query DashboardOverview {
  dashboard { liveJobsUuids liveJobsCount liveCvsCount liveInterviewsScheduledCount }
  monolith {
    users { id uuid firstName lastName }
    auth { uuid firstName occupopEmail occupopEmailConfirmed occupopEmailConfirmationLink calendarIntegration { status statusMessage } }
  }
}`;

function calendarState(status?: string): DashboardReadinessState {
  if (!status) return 'unavailable';
  if (status === 'connected' || status === 'active') return 'ready';
  if (status === 'blocked' || status === 'error') return 'blocked';
  return 'degraded';
}

function notificationMessage(notification: { key?: string; data?: Record<string, unknown> }): string {
  const data = notification.data ?? {};
  const source = data.sourceName ?? data.provider ?? data.companyName ?? data.recruiterName;
  const job = (data.job && typeof data.job === 'object' && 'title' in data.job ? String((data.job as { title?: unknown }).title ?? '') : undefined) ?? data.jobTitle;
  if (notification.key?.includes('cv-received')) return `A CV has been received${source ? ` from ${source}` : ''}${job ? ` for ${job}` : ''}`;
  if (notification.key?.includes('interview')) return `Interview activity${job ? ` for ${job}` : ''}`;
  if (notification.key?.includes('offer')) return `Offer activity${job ? ` for ${job}` : ''}`;
  if (notification.key?.includes('job')) return `Job activity${job ? ` for ${job}` : ''}`;
  return notification.key ? notification.key.replace(/-/g, ' ') : 'Activity update';
}

function normalizeNotifications(response: NotificationResponse): DashboardActivityItem[] {
  return (response.notifications ?? []).slice(0, 20).map((item, index) => ({
    id: String(item.id ?? `activity-${index}`),
    message: notificationMessage(item),
    createdAt: item.created_at ?? item.createdAt,
  }));
}

function monthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function calendarQuery(userUuid?: string): string {
  const { start, end } = monthRange();
  const users = userUuid ? `\"${userUuid}\"` : '';
  return `query DashboardCalendar { interview { queryCalendar(usersUuid: [${users}], start: \"${start}\", end: \"${end}\") {
    ... on Schedule { uuid selectedDates { start unavailable durationMinutes } }
    ... on Interview { uuid status date { start durationMinutes } }
    ... on CalendarEntry { uuid date { start durationMinutes } }
  } } }`;
}

function normalizeCalendar(response: CalendarGraphqlResponse): DashboardCalendarEvent[] {
  const entries = response.data?.interview?.queryCalendar ?? [];
  const events: DashboardCalendarEvent[] = [];
  entries.forEach((entry, index) => {
    const uuid = String(entry.uuid ?? `calendar-${index}`);
    const selectedDates = Array.isArray(entry.selectedDates) ? entry.selectedDates as Array<Record<string, unknown>> : [];
    selectedDates.forEach((date, dateIndex) => {
      if (date.unavailable || typeof date.start !== 'string') return;
      events.push({ id: `${uuid}-${dateIndex}`, title: 'Pending', start: date.start, status: 'pending' });
    });
    const date = entry.date as Record<string, unknown> | undefined;
    if (date && typeof date.start === 'string') {
      const status = entry.status === 'Scheduled' && new Date(date.start).getTime() > Date.now() ? 'confirmed' : entry.status === 'Scheduled' ? 'completed' : 'busy';
      events.push({ id: uuid, title: status === 'busy' ? 'Busy' : status === 'confirmed' ? 'Confirmed' : 'Completed', start: date.start, status });
    }
  });
  return events;
}

export function normalizeDashboardGraphqlResponse(response: DashboardGraphqlResponse, activityItems: DashboardActivityItem[] = [], calendarEvents: DashboardCalendarEvent[] = []): DashboardOverview {
  const dashboard = response.data?.dashboard ?? {};
  const auth = response.data?.monolith?.auth ?? {};
  return {
    liveJobsUuids: Array.isArray(dashboard.liveJobsUuids) ? dashboard.liveJobsUuids : [],
    liveJobsCount: dashboard.liveJobsCount ?? 0,
    liveCvsCount: dashboard.liveCvsCount ?? 0,
    liveInterviewsScheduledCount: dashboard.liveInterviewsScheduledCount ?? 0,
    users: response.data?.monolith?.users ?? [],
    auth: {
      uuid: auth.uuid,
      firstName: auth.firstName,
      occupopEmail: auth.occupopEmail,
      occupopEmailConfirmed: auth.occupopEmailConfirmed,
      occupopEmailConfirmationLink: auth.occupopEmailConfirmationLink,
    },
    calendarIntegrationState: calendarState(auth.calendarIntegration?.status),
    notificationCount: activityItems.length,
    inboxConversationCount: undefined,
    activityItems,
    calendarEvents,
  };
}

export async function loadDashboardOverview(token: string | null): Promise<DashboardOverview> {
  if (!token) throw new Error('Dashboard overview requires an auth token.');
  const dashboardResponse = await graphqlRequest<DashboardGraphqlResponse>(dashboardOverviewQuery, undefined, { token, language: 'en' });
  const userUuid = dashboardResponse.data?.monolith?.auth?.uuid;
  const [notificationResponse, calendarResponse] = await Promise.allSettled([
    restApiGetJson<NotificationResponse>('/notification/notifications', { token }),
    graphqlRequest<CalendarGraphqlResponse>(calendarQuery(userUuid), undefined, { token, language: 'en' }),
  ]);
  const activityItems = notificationResponse.status === 'fulfilled' ? normalizeNotifications(notificationResponse.value) : [];
  const calendarEvents = calendarResponse.status === 'fulfilled' ? normalizeCalendar(calendarResponse.value) : [];
  return normalizeDashboardGraphqlResponse(dashboardResponse, activityItems, calendarEvents);
}

export const dashboardApiAdapter: DashboardApiAdapter = {
  contract: 'api',
  loadOverview: loadDashboardOverview,
};
