import { recipeGenerationInputSchema } from "@recettes/domain";
import { after, NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { getAiConfigurationReadiness } from "@/lib/env/schema";
import { serverEnv } from "@/lib/env/server";
import { buildPseudonymousGenerationInput } from "@/lib/ai/supabase-generation-context";
import { reserveGenerationJob } from "@/lib/ai/supabase-generation-repository";
import { processGenerationJob } from "@/lib/ai/process-generation-job";
import { createAdminClient } from "@/lib/supabase/admin";
import { HttpRequestError, parseBoundedJson } from "@/lib/security/http";

export const runtime = "nodejs";
export const maxDuration = 180;

const requestSchema = z.strictObject({
  idempotencyKey: z.uuid(),
  recipeCount: z.number().int().min(1).max(14),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  avoidRecentRecipeIds: z.array(z.uuid()).max(100).default([]),
  requiredIngredientIds: z
    .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    .max(20)
    .default([]),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  let input: z.infer<typeof requestSchema>;
  try {
    input = await parseBoundedJson(request, requestSchema, 16_384);
  } catch (error) {
    const requestError = error instanceof HttpRequestError ? error : null;
    return NextResponse.json(
      {
        error:
          requestError?.code === "request_too_large"
            ? requestError.code
            : "invalid_generation_request",
      },
      { status: requestError?.status ?? 400 },
    );
  }
  const readiness = getAiConfigurationReadiness(serverEnv);
  if (!serverEnv.AI_GENERATION_ENABLED || !readiness.ready) {
    return NextResponse.json(
      { error: "ai_generation_unavailable" },
      { status: 503 },
    );
  }

  try {
    const { data: allowed, error: rateLimitError } =
      await createAdminClient().rpc("consume_api_rate_limit", {
        p_subject_id: user.id,
        p_bucket_key: "recipe_generation",
        p_limit: 6,
        p_window_seconds: 3600,
      });
    if (rateLimitError) throw new Error("RATE_LIMIT_CHECK_FAILED");
    if (!allowed) {
      return NextResponse.json(
        { error: "generation_rate_limited" },
        {
          status: 429,
          headers: { "retry-after": "3600" },
        },
      );
    }
    const generationInput = recipeGenerationInputSchema.parse(
      await buildPseudonymousGenerationInput({
        userId: user.id,
        requestId: input.idempotencyKey,
        recipeCount: input.recipeCount,
        mealType: input.mealType,
        avoidRecentRecipeIds: input.avoidRecentRecipeIds,
        requiredIngredientIds: input.requiredIngredientIds,
      }),
    );
    const jobId = await reserveGenerationJob({
      userId: user.id,
      idempotencyKey: input.idempotencyKey,
      requestPayload: generationInput,
      recipeCount: input.recipeCount,
    });
    const { data: job, error } = await createAdminClient()
      .from("ai_generation_jobs")
      .select("id, status, progress_stage, progress_percent")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();
    if (error) throw new Error("AI_JOB_READ_FAILED", { cause: error });
    if (job.status === "queued") {
      after(() =>
        processGenerationJob({
          jobId,
          userId: user.id,
          input: generationInput,
        }),
      );
    }
    return NextResponse.json(
      {
        jobId,
        status: job.status,
        stage: job.progress_stage,
        progressPercent: job.progress_percent,
      },
      {
        status: job.status === "succeeded" ? 200 : 202,
        headers: {
          location: `/api/v1/recipe-generations/${jobId}`,
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "AI_USER_QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "user_quota_exceeded" },
        { status: 429 },
      );
    }
    if (code === "AI_GLOBAL_QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "generation_temporarily_limited" },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "generation_request_failed" },
      { status: 500 },
    );
  }
}
