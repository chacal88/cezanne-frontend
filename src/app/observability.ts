import { createNoopObservability, ensureCorrelationId } from '../lib/observability';

export const observability = createNoopObservability();

ensureCorrelationId();
