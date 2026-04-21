import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../app/observability';
import { buildDashboardViewModel, type DashboardSourceHealth, type DashboardViewModel } from './dashboard-state';
import { useAccessContext, useCapabilities } from '../../lib/access-control';
import { dashboardApiAdapter, type DashboardApiAdapter } from './api';
import { loadAuthToken } from '../auth/api';
import './dashboard-page.css';

function DashboardCard({ card, isLoading }: { card: DashboardViewModel['cards'][number]; isLoading?: boolean }) {
  const icon = card.kind === 'jobs' ? '/assets/img/briefcase.svg' : card.kind === 'candidates' ? '/assets/img/people.svg' : '/assets/img/calendar.svg';
  return (
    <a className="dashboard-card" href={card.target} title={card.tooltip} data-testid={`dashboard-card-${card.kind}`}>
      <span className="dashboard-card__icon" aria-hidden="true"><img src={icon} alt="" /></span>
      <strong className="dashboard-card__title">{card.title}</strong>
      <span className="dashboard-card__bottom"><b>{isLoading ? <span className="dashboard-skeleton-number" aria-label="Loading" /> : card.count}</b><span>{card.subtitle}</span></span>
    </a>
  );
}


function monthLabel() {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date());
}

function buildCalendarCells(events: DashboardViewModel['calendarEvents'] = []) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const startOffset = first.getDay();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - startOffset + 1;
    return day > 0 && day <= daysInMonth ? day : undefined;
  });
  return cells.map((day, index) => {
    const dayEvents = day ? events.filter((event) => new Date(event.start).getDate() === day) : [];
    return { id: `${index}-${day ?? 'empty'}`, day, events: dayEvents.slice(0, 2), isToday: day === now.getDate() };
  });
}

function DashboardBody({ dashboard, isLoading = false }: { dashboard: DashboardViewModel; isLoading?: boolean }) {
  const { t } = useTranslation('dashboard');
  const calendarCells = buildCalendarCells(dashboard.calendarEvents);
  return (
    <>
      <p className="dashboard-reentry" data-testid="dashboard-reentry-state">{dashboard.reason}</p>
      <p className="dashboard-reentry-message" data-testid="dashboard-reentry-message">{dashboard.message}</p>

      <div className="dashboard-card-grid" aria-label={t('cards.label')}>
        {dashboard.cards.map((card) => <DashboardCard key={card.kind} card={card} isLoading={isLoading} />)}
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel dashboard-calendar" aria-labelledby="dashboard-calendar-title">
          <div className="dashboard-panel__header">
            <h2 id="dashboard-calendar-title">{t('calendar.title')}</h2>
            <span data-testid="dashboard-calendar-readiness">{dashboard.calendarReadiness}</span>
          </div>
          <div className="dashboard-calendar-toolbar"><strong>{monthLabel()}</strong><span>today</span><span>month</span><span>week</span><span>day</span></div>
          {dashboard.users.length ? <p data-testid="dashboard-calendar-users">{t('calendar.users', { count: dashboard.users.length })}</p> : null}
          <div className="dashboard-calendar-grid" aria-label={t('calendar.title')}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <b key={day}>{day}</b>)}
            {calendarCells.map((cell) => (
              <div key={cell.id} className={cell.isToday ? 'is-today' : undefined}>
                <span>{cell.day}</span>
                {cell.events.map((event) => <em key={event.id}>{event.title}</em>)}
              </div>
            ))}
          </div>
        </section>

        <aside className="dashboard-panel dashboard-activity" aria-labelledby="dashboard-activity-title">
          <h2 id="dashboard-activity-title">{t('activity.title')}</h2>
          {dashboard.activityItems.length ? (
            <div className="dashboard-activity-list" data-testid="dashboard-activity-list">
              {dashboard.activityItems.map((item) => (
                <a key={item.id} href={item.target ?? '#'}>
                  <strong>{item.message}</strong>
                  {item.createdAt ? <small>{new Date(item.createdAt).toLocaleString()}</small> : null}
                </a>
              ))}
            </div>
          ) : null}
          <dl aria-label="Dashboard operational state">
            <dt>{t('operational.sourceHealth')}</dt>
            <dd data-testid="dashboard-source-health">{dashboard.sourceHealth}</dd>
            <dt>{t('operational.notifications')}</dt>
            <dd data-testid="dashboard-notification-state">{dashboard.notificationState}</dd>
            <dt>{t('operational.inbox')}</dt>
            <dd data-testid="dashboard-inbox-state">{dashboard.inboxState}</dd>
            <dt>{t('operational.refreshRequired')}</dt>
            <dd data-testid="dashboard-refresh-required">{String(dashboard.refreshRequired)}</dd>
            <dt>{t('operational.adapter')}</dt>
            <dd data-testid="dashboard-adapter-contract">{dashboard.adapterContract}</dd>
          </dl>
          {dashboard.emailConfirmationRequired ? <p className="dashboard-warning" data-testid="dashboard-email-confirmation">{t('activity.emailConfirmationRequired')}</p> : null}
          {dashboard.fallbackTarget ? <a href={dashboard.fallbackTarget} data-testid="dashboard-fallback-target">{dashboard.fallbackTarget}</a> : null}
          <ul aria-label="Dashboard safe actions">
            {dashboard.safeActions.map((action) => (
              <li key={`${action.kind}-${action.target}`}>
                <a href={action.target} data-testid={`dashboard-action-${action.kind}`}>{action.label}</a>
                {action.refreshIntent ? <span data-testid={`dashboard-action-refresh-${action.kind}`}>{action.refreshIntent}</span> : null}
              </li>
            ))}
          </ul>
          {dashboard.unknownContracts.length ? <p data-testid="dashboard-unknown-contracts">{dashboard.unknownContracts.join(', ')}</p> : null}
        </aside>
      </div>
    </>
  );
}

export function DashboardPage({ adapter = dashboardApiAdapter }: { adapter?: DashboardApiAdapter } = {}) {
  const { t } = useTranslation('dashboard');
  const accessContext = useAccessContext();
  const capabilities = useCapabilities();
  const isPlatformMode = accessContext.isSysAdmin && accessContext.organizationType === 'none';
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason') ?? undefined;
  const fallbackTarget = params.get('fallbackTarget') ?? undefined;
  const forcedSourceHealth = params.get('sourceHealth') as DashboardSourceHealth | null;
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'degraded'>(isPlatformMode ? 'ready' : 'loading');
  const [dashboard, setDashboard] = useState(() => buildDashboardViewModel({
    reason,
    platformMode: isPlatformMode,
    fallbackTarget,
    sourceHealth: isPlatformMode ? 'ready' : 'loading',
    adapterContract: isPlatformMode ? 'fixture' : adapter.contract,
  }));

  useEffect(() => {
    let active = true;
    if (isPlatformMode) return undefined;

    setLoadState('loading');
    void adapter.loadOverview(loadAuthToken()).then((overview) => {
      if (!active) return;
      setDashboard(buildDashboardViewModel({ overview, reason, fallbackTarget, sourceHealth: forcedSourceHealth ?? 'ready', adapterContract: adapter.contract }));
      setLoadState('ready');
    }).catch(() => {
      if (!active) return;
      setDashboard(buildDashboardViewModel({ reason, fallbackTarget, sourceHealth: 'degraded', adapterContract: adapter.contract }));
      setLoadState('degraded');
    });

    return () => { active = false; };
  }, [adapter, fallbackTarget, forcedSourceHealth, isPlatformMode, reason]);

  useEffect(() => {
    observability.telemetry.track({
      name: isPlatformMode ? 'platform_route_entry' : 'dashboard_operational_entry',
      data: {
        routeId: 'dashboard.home',
        routeFamily: isPlatformMode ? 'platform-landing' : 'dashboard-landing',
        capabilityOutcome: capabilities.canViewDashboard ? 'allowed' : 'denied',
        mode: isPlatformMode ? 'platform' : 'org',
        reentryReason: dashboard.reason,
        sourceHealth: dashboard.sourceHealth,
      },
    });
  }, [capabilities.canViewDashboard, dashboard.reason, dashboard.sourceHealth, isPlatformMode]);

  if (isPlatformMode) {
    return (
      <section className="dashboard-page dashboard-page--platform" aria-labelledby="platform-dashboard-title">
        <p className="dashboard-eyebrow">{t('platform.eyebrow')}</p>
        <h1 id="platform-dashboard-title">{t('platform.title')}</h1>
        <p>{t('platform.detail')}</p>
        <DashboardBody dashboard={dashboard} isLoading={false} />
        <ul className="dashboard-platform-list">
          <li>{t('platform.masterData')}</li>
          <li>{t('platform.usersAndRequests')}</li>
          <li>{t('platform.taxonomy')}</li>
        </ul>
      </section>
    );
  }

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <h1 id="dashboard-title">{t('home.welcome')}, {dashboard.greetingName}<small>{t('home.greeting')}</small></h1>
        <p data-testid="dashboard-load-state">{loadState}</p>
      </header>
      <DashboardBody dashboard={dashboard} isLoading={loadState === 'loading'} />
    </section>
  );
}
