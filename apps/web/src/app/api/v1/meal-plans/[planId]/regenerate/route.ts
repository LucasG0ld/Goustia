import { recipeGenerationInputSchema } from "@recettes/domain";
import { after, NextResponse } from "next/server";
import { z } from "zod";

import { buildPseudonymousGenerationInput } from "@/lib/ai/supabase-generation-context";
import { reserveGenerationJob } from "@/lib/ai/supabase-generation-repository";
import { processGenerationJob } from "@/lib/ai/process-generation-job";
import { getVerifiedUser } from "@/lib/auth/current-user";
import { getAiConfigurationReadiness } from "@/lib/env/schema";
import { serverEnv } from "@/lib/env/server";
import {
  applyMealMutation,
  mealMutationBaseSchema,
  mutationErrorResponse,
} from "@/lib/planning/mutation-api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 180;

const resultSchema = z.strictObject({
  planRevision: z.number().int().positive(),
  plannedMealId: z.uuid().nullable(),
  replayed: z.boolean(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const { planId } = await params;
  const path = z.uuid().safeParse(planId);
  const input = mealMutationBaseSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!path.success || !input.success) {
    return NextResponse.json(
      { error: "invalid_regeneration_request" },
      { status: 400 },
    );
  }
  const readiness = getAiConfigurationReadiness(serverEnv);
  if (!serverEnv.AI_GENERATION_ENABLED || !readiness.ready) {
    return NextResponse.json(
      { error: "ai_generation_unavailable" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const { data: unlocked, error: mealsError } = await supabase
    .from("planned_meals")
    .select("id,recipe_version_id")
    .eq("meal_plan_id", planId)
    .eq("user_id", user.id)
    .eq("is_locked", false)
    .order("meal_date")
    .order("meal_type");
  if (mealsError || unlocked.length < 1 || unlocked.length > 14) {
    return NextResponse.json(
      { error: "no_regenerable_meals" },
      { status: 400 },
    );
  }
  const versionIds = unlocked
    .map(({ recipe_version_id }) => recipe_version_id)
    .filter((value): value is string => Boolean(value));
  const { data: currentVersions } = versionIds.length
    ? await supabase
        .from("recipe_versions")
        .select("recipe_id")
        .in("id", versionIds)
    : { data: [] };

  try {
    const mutation = resultSchema.parse(
      await applyMealMutation({
        planId,
        kind: "regenerate",
        ...input.data,
      }),
    );
    const generationInput = recipeGenerationInputSchema.parse(
      await buildPseudonymousGenerationInput({
        userId: user.id,
        requestId: input.data.idempotencyKey,
        recipeCount: unlocked.length,
        mealType: "dinner",
        avoidRecentRecipeIds: (currentVersions ?? []).map(
          ({ recipe_id }) => recipe_id,
        ),
        requiredIngredientIds: [],
      }),
    );
    const jobId = await reserveGenerationJob({
      userId: user.id,
      idempotencyKey: input.data.idempotencyKey,
      requestPayload: generationInput,
      recipeCount: unlocked.length,
    });
    const admin = createAdminClient();
    await admin
      .from("meal_plans")
      .update({ generation_job_id: jobId })
      .eq("id", planId)
      .eq("user_id", user.id)
      .eq("revision", mutation.planRevision);

    after(async () => {
      await processGenerationJob({
        jobId,
        userId: user.id,
        input: generationInput,
      });
      const { data: job } = await admin
        .from("ai_generation_jobs")
        .select("status,result_recipe_ids")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .single();
      if (job?.status === "succeeded") {
        await admin.rpc("complete_plan_regeneration", {
          p_user_id: user.id,
          p_meal_plan_id: planId,
          p_expected_plan_revision: mutation.planRevision,
          p_recipe_ids: job.result_recipe_ids,
        });
      } else {
        await admin
          .from("meal_plans")
          .update({ status: "ready" })
          .eq("id", planId)
          .eq("user_id", user.id)
          .eq("revision", mutation.planRevision);
      }
    });
    return NextResponse.json(
      {
        jobId,
        planRevision: mutation.planRevision,
        status: "queued",
      },
      {
        status: 202,
        headers: {
          location: `/api/v1/recipe-generations/${jobId}`,
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    await createAdminClient()
      .from("meal_plans")
      .update({ status: "ready" })
      .eq("id", planId)
      .eq("user_id", user.id)
      .eq("status", "generating");
    return mutationErrorResponse(error);
  }
}
