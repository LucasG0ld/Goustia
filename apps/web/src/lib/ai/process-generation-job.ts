import "server-only";

import {
  DeterministicImageProcessor,
  RecipeImagePipeline,
} from "./image-pipeline";
import { orchestrateRecipeGeneration } from "./orchestration";
import { configuredAiProviders } from "./providers/configured";
import { SharpRecipeImageProcessor } from "./sharp-image-processor";
import { SupabaseRecipeValidator } from "./supabase-generation-context";
import {
  assertAiCostCircuitClosed,
  findMatchingSafeCachedRecipes,
  SupabaseGenerationRepository,
} from "./supabase-generation-repository";
import { SupabaseRecipeImageStorage } from "./supabase-image-storage";
import type { RecipeGenerationInput } from "@recettes/domain";

export async function processGenerationJob(options: {
  jobId: string;
  userId: string;
  input: RecipeGenerationInput;
}): Promise<void> {
  const repository = new SupabaseGenerationRepository();
  try {
    await assertAiCostCircuitClosed();
  } catch (error) {
    const cached = await findMatchingSafeCachedRecipes(
      options.userId,
      options.input,
    );
    if (cached.length === options.input.request.recipeCount) {
      await repository.completeJob(options.jobId, cached, "cache");
      return;
    }
    await repository.failJob(
      options.jobId,
      error instanceof Error ? error.message : "AI_COST_CIRCUIT_OPEN",
      "Le service est temporairement limité. Réessayez plus tard.",
    );
    return;
  }

  let imageUsageIndex = 0;
  const imagePipeline = new RecipeImagePipeline(
    configuredAiProviders.images,
    configuredAiProviders.images.provider === "fake"
      ? new DeterministicImageProcessor()
      : new SharpRecipeImageProcessor(),
    new SupabaseRecipeImageStorage(),
    async (usage) => {
      imageUsageIndex += 1;
      await repository.recordUsage(
        options.jobId,
        options.userId,
        `${options.jobId}:image:${imageUsageIndex}`,
        usage,
      );
    },
  );
  try {
    await orchestrateRecipeGeneration(
      {
        jobId: options.jobId,
        userId: options.userId,
        generationInput: options.input,
      },
      {
        generator: configuredAiProviders.recipes,
        validator: new SupabaseRecipeValidator(options.userId),
        repository,
        images: imagePipeline,
        maximumGenerationRounds: 3,
      },
    );
  } catch {
    const cached = await findMatchingSafeCachedRecipes(
      options.userId,
      options.input,
    );
    if (cached.length === options.input.request.recipeCount) {
      await repository.completeJob(options.jobId, cached, "cache");
    }
  }
}
