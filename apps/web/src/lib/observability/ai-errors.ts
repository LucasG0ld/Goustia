import "server-only";

import * as Sentry from "@sentry/nextjs";

import { serverEnv } from "@/lib/env/server";

import { logger } from "./logger";

type AiFailure = {
  correlationId: string;
  provider: string;
  model: string;
  kind: "recipe" | "image";
  errorCategory: string;
  retryCount: number;
};

export function reportAiGenerationFailure(failure: AiFailure): void {
  logger.error("ai_generation_failed", failure);

  if (serverEnv.OBSERVABILITY_ENABLED) {
    Sentry.captureMessage("ai_generation_failed", {
      level: "error",
      fingerprint: ["ai-generation", failure.provider, failure.kind],
      tags: {
        provider: failure.provider,
        model: failure.model,
        kind: failure.kind,
        errorCategory: failure.errorCategory,
      },
      extra: {
        correlationId: failure.correlationId,
        retryCount: failure.retryCount,
      },
    });
  }
}
