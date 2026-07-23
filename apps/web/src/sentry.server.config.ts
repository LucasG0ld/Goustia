import * as Sentry from "@sentry/nextjs";

import { sanitizeSentryEvent } from "@/lib/observability/redact";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const enabled = process.env.OBSERVABILITY_ENABLED === "true" && Boolean(dsn);

Sentry.init({
  dsn,
  enabled,
  environment: process.env.APP_ENV,
  release: process.env.SENTRY_RELEASE,
  sendDefaultPii: false,
  tracesSampleRate: enabled ? 0.1 : 0,
  beforeSend: sanitizeSentryEvent,
});
