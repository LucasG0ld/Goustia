import "server-only";

import { createHash } from "node:crypto";

import {
  canonicalRecipeSlug,
  estimateAiCostUsd,
  RECIPE_PROMPT_VERSION,
  recipeGenerationInputSchema,
  type RecipeGenerationInput,
  type AiUsage,
} from "@recettes/domain";

import { serverEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.generated";

import type {
  GenerationRepository,
  GenerationStage,
  ValidatedRecipe,
} from "./orchestration";

function estimatedRates(usage: AiUsage) {
  if (usage.provider === "groq") {
    return {
      inputUsdPerMillionTokens: 0.15,
      outputUsdPerMillionTokens: 0.6,
      usdPerNeuron: 0,
      usdPerImage: 0,
    };
  }
  if (usage.provider === "cloudflare") {
    return {
      inputUsdPerMillionTokens: 0,
      outputUsdPerMillionTokens: 0,
      usdPerNeuron: 0.000_011,
      usdPerImage: 0,
    };
  }
  return {
    inputUsdPerMillionTokens: 0,
    outputUsdPerMillionTokens: 0,
    usdPerNeuron: 0,
    usdPerImage: 0,
  };
}

export class SupabaseGenerationRepository implements GenerationRepository {
  private readonly supabase = createAdminClient();

  async updateProgress(
    jobId: string,
    stage: GenerationStage,
    percent: number,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("ai_generation_jobs")
      .update({
        status: "running",
        progress_stage: stage,
        progress_percent: percent,
        started_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    if (error) throw new Error("AI_JOB_PROGRESS_FAILED", { cause: error });
  }

  async hashDeduplicationSignature(signature: string): Promise<string> {
    return createHash("sha256").update(signature).digest("hex");
  }

  async recipeExists(deduplicationHash: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("recipes")
      .select("id")
      .eq("deduplication_hash", deduplicationHash)
      .maybeSingle();
    if (error) throw new Error("RECIPE_DEDUPLICATION_FAILED", { cause: error });
    return Boolean(data);
  }

  async saveValidatedRecipe(
    jobId: string,
    userId: string,
    validated: ValidatedRecipe,
    generation: { provider: string; model: string; promptVersion: string },
    position: number,
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc(
      "store_validated_ai_recipe",
      {
        p_job_id: jobId,
        p_user_id: userId,
        p_canonical_slug: canonicalRecipeSlug(
          validated.recipe,
          validated.deduplicationHash,
        ),
        p_deduplication_hash: validated.deduplicationHash,
        p_recipe: validated.recipe,
        p_nutrition: {
          ...validated.nutrition,
          sourceVersion: "ciqual-2025-11-03",
        },
        p_provider: generation.provider,
        p_model: generation.model,
        p_prompt_version: generation.promptVersion,
        p_position: position,
      },
    );
    if (error || !data) {
      throw new Error("VALIDATED_RECIPE_STORAGE_FAILED", { cause: error });
    }
    return data;
  }

  async recordUsage(
    jobId: string,
    userId: string,
    eventKey: string,
    usage: AiUsage,
  ): Promise<void> {
    const cost = estimateAiCostUsd(usage, estimatedRates(usage));
    const { error } = await this.supabase.rpc("record_ai_usage", {
      p_event_key: eventKey,
      p_job_id: jobId,
      p_user_id: userId,
      p_kind: usage.kind,
      p_provider: usage.provider,
      p_model: usage.model,
      p_input_tokens: usage.inputTokens ?? 0,
      p_output_tokens: usage.outputTokens ?? 0,
      p_neurons: usage.neurons ?? 0,
      p_image_count: usage.imageCount ?? 0,
      p_estimated_cost_usd: cost,
    });
    if (error) throw new Error("AI_USAGE_RECORD_FAILED", { cause: error });
  }

  async completeJob(
    jobId: string,
    recipeIds: string[],
    degradedMode: "cache" | "fallback_provider" | "without_image" | null,
  ): Promise<void> {
    const { error } = await this.supabase
      .from("ai_generation_jobs")
      .update({
        status: "succeeded",
        progress_stage: "completed",
        progress_percent: 100,
        result_recipe_ids: recipeIds,
        degraded_mode: degradedMode,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    if (error) throw new Error("AI_JOB_COMPLETION_FAILED", { cause: error });
  }

  async failJob(jobId: string, code: string, message: string): Promise<void> {
    await this.supabase
      .from("ai_generation_jobs")
      .update({
        status: "failed",
        progress_stage: "failed",
        user_error_code: code.slice(0, 100),
        user_error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}

export async function reserveGenerationJob(options: {
  userId: string;
  idempotencyKey: string;
  requestPayload: Json;
  recipeCount: number;
}): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("reserve_ai_generation_job", {
    p_user_id: options.userId,
    p_idempotency_key: options.idempotencyKey,
    p_prompt_version: RECIPE_PROMPT_VERSION,
    p_request_payload: options.requestPayload,
    p_recipe_count: options.recipeCount,
    p_user_daily_limit: serverEnv.AI_USER_DAILY_RECIPE_LIMIT,
    p_global_daily_limit: serverEnv.AI_GLOBAL_DAILY_RECIPE_LIMIT,
  });
  if (error || !data) {
    if (error?.message.includes("AI_USER_QUOTA_EXCEEDED")) {
      throw new Error("AI_USER_QUOTA_EXCEEDED");
    }
    if (error?.message.includes("AI_GLOBAL_QUOTA_EXCEEDED")) {
      throw new Error("AI_GLOBAL_QUOTA_EXCEEDED");
    }
    throw new Error("AI_JOB_RESERVATION_FAILED", { cause: error });
  }
  return data;
}

export async function assertAiCostCircuitClosed(): Promise<void> {
  const { data, error } = await createAdminClient().rpc(
    "is_ai_cost_circuit_open",
    {
      p_daily_cost_limit_usd: serverEnv.AI_GLOBAL_DAILY_COST_LIMIT_USD,
    },
  );
  if (error) throw new Error("AI_COST_CHECK_FAILED", { cause: error });
  if (data) throw new Error("AI_COST_CIRCUIT_OPEN");
}

export async function findMatchingSafeCachedRecipes(
  userId: string,
  input: RecipeGenerationInput,
): Promise<string[]> {
  const { data, error } = await createAdminClient()
    .from("ai_generation_jobs")
    .select("request_payload, result_recipe_ids")
    .eq("user_id", userId)
    .eq("kind", "recipe")
    .eq("status", "succeeded")
    .order("completed_at", { ascending: false })
    .limit(20);
  if (error) throw new Error("AI_CACHE_LOOKUP_FAILED", { cause: error });
  const currentSignature = JSON.stringify({
    profile: input.profile,
    request: {
      mealType: input.request.mealType,
      requiredIngredientIds: input.request.requiredIngredientIds,
    },
  });
  const avoided = new Set(input.request.avoidRecentRecipeIds);
  for (const candidate of data) {
    const cachedInput = recipeGenerationInputSchema.safeParse(
      candidate.request_payload,
    );
    if (!cachedInput.success) continue;
    const candidateSignature = JSON.stringify({
      profile: cachedInput.data.profile,
      request: {
        mealType: cachedInput.data.request.mealType,
        requiredIngredientIds: cachedInput.data.request.requiredIngredientIds,
      },
    });
    const recipeIds = candidate.result_recipe_ids.filter(
      (recipeId) => !avoided.has(recipeId),
    );
    if (
      candidateSignature === currentSignature &&
      recipeIds.length >= input.request.recipeCount
    ) {
      return recipeIds.slice(0, input.request.recipeCount);
    }
  }
  return [];
}
