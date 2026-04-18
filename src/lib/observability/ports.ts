export type TelemetryEvent = {
  name: string;
  data?: Record<string, unknown>;
};

export type TelemetryContext = {
  routeId?: string;
  routeClass?: string;
  domain?: string;
  module?: string;
  correlationId?: string;
};

export interface TelemetryPort {
  identify(actor: { id: string; organizationType?: string; isAdmin?: boolean }): void;
  setContext(context: TelemetryContext): void;
  track(event: TelemetryEvent): void;
  reset(): void;
}

export interface ErrorReportingPort {
  captureError(error: unknown, context?: Record<string, unknown>): void;
}

export interface RumPort {
  page(view: { routeId: string; routeClass: string }): void;
  startSpan(name: string, data?: Record<string, unknown>): { end: (data?: Record<string, unknown>) => void };
}

export interface ObservabilityPort {
  telemetry: TelemetryPort;
  errors: ErrorReportingPort;
  rum: RumPort;
}
