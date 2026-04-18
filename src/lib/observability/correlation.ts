let activeCorrelationId: string | null = null;

export function createCorrelationId() {
  return `corr_${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureCorrelationId() {
  if (!activeCorrelationId) activeCorrelationId = createCorrelationId();
  return activeCorrelationId;
}

export function setActiveCorrelationId(correlationId: string) {
  activeCorrelationId = correlationId;
}

export function getActiveCorrelationId() {
  return activeCorrelationId;
}

export function resetCorrelationId() {
  activeCorrelationId = null;
}
