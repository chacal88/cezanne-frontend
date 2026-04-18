import type { ErrorReportingPort, ObservabilityPort, RumPort, TelemetryContext, TelemetryEvent, TelemetryPort } from './ports';

class NoopTelemetryPort implements TelemetryPort {
  identify(): void {}
  setContext(_context: TelemetryContext): void {}
  track(_event: TelemetryEvent): void {}
  reset(): void {}
}

class NoopErrorReportingPort implements ErrorReportingPort {
  captureError(): void {}
}

class NoopRumPort implements RumPort {
  page(): void {}

  startSpan(): { end: () => void } {
    return { end: () => undefined };
  }
}

export function createNoopObservability(): ObservabilityPort {
  return {
    telemetry: new NoopTelemetryPort(),
    errors: new NoopErrorReportingPort(),
    rum: new NoopRumPort(),
  };
}
