import * as Sentry from "@sentry/nextjs";

import { sanitizeSentryEvent } from "@/lib/observability/redact";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const enabled =
  process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "true" && Boolean(dsn);

Sentry.init({
  dsn,
  enabled,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  sendDefaultPii: false,
  tracesSampleRate: enabled ? 0.1 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend: sanitizeSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
