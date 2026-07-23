import {
  buildRecipeGenerationPrompt,
  recipeDeduplicationSignature,
  validateGeneratedRecipeConsistency,
  type AiUsage,
  type CalculatedRecipeNutrition,
  type FoodSafetyReport,
  type GeneratedRecipe,
  type RecipeGenerationInput,
} from "@recettes/domain";

import type { RecipeGenerator } from "./providers/contracts";

export type GenerationStage =
  | "profile"
  | "generation"
  | "validation"
  | "nutrition"
  | "storage"
  | "images"
  | "completed"
  | "failed";

export type ValidatedRecipe = {
  recipe: GeneratedRecipe;
  safety: FoodSafetyReport;
  nutrition: CalculatedRecipeNutrition;
  deduplicationHash: string;
};

export interface GenerationValidationPort {
  validate(recipe: GeneratedRecipe): Promise<{
    safety: FoodSafetyReport;
    nutrition: CalculatedRecipeNutrition;
  }>;
}

export interface GenerationRepository {
  updateProgress(
    jobId: string,
    stage: GenerationStage,
    percent: number,
  ): Promise<void>;
  hashDeduplicationSignature(signature: string): Promise<string>;
  recipeExists(deduplicationHash: string): Promise<boolean>;
  saveValidatedRecipe(
    jobId: string,
    userId: string,
    validated: ValidatedRecipe,
    generation: { provider: string; model: string; promptVersion: string },
    position: number,
  ): Promise<string>;
  recordUsage(
    jobId: string,
    userId: string,
    eventKey: string,
    usage: AiUsage,
  ): Promise<void>;
  completeJob(
    jobId: string,
    recipeIds: string[],
    degradedMode: "cache" | "fallback_provider" | "without_image" | null,
  ): Promise<void>;
  failJob(jobId: string, code: string, message: string): Promise<void>;
}

export type GenerationImagePort = {
  generateForValidatedRecipe(
    recipeId: string,
    recipe: GeneratedRecipe,
  ): Promise<"ready" | "cached" | "placeholder">;
};

export type OrchestrateGenerationInput = {
  jobId: string;
  userId: string;
  generationInput: RecipeGenerationInput;
};

export type OrchestrationDependencies = {
  generator: RecipeGenerator;
  validator: GenerationValidationPort;
  repository: GenerationRepository;
  images: GenerationImagePort;
  maximumGenerationRounds?: number;
};

export async function orchestrateRecipeGeneration(
  input: OrchestrateGenerationInput,
  dependencies: OrchestrationDependencies,
): Promise<string[]> {
  const wanted = input.generationInput.request.recipeCount;
  const maximumRounds = dependencies.maximumGenerationRounds ?? 3;
  const accepted = new Map<string, ValidatedRecipe>();
  const basePrompt = buildRecipeGenerationPrompt(input.generationInput);
  let lastProvider = dependencies.generator.provider;
  let lastModel = dependencies.generator.model;
  let degradedMode: "fallback_provider" | "without_image" | null = null;

  try {
    await dependencies.repository.updateProgress(input.jobId, "profile", 10);
    for (
      let round = 1;
      round <= maximumRounds && accepted.size < wanted;
      round += 1
    ) {
      await dependencies.repository.updateProgress(
        input.jobId,
        "generation",
        15 + round * 10,
      );
      const roundInput = {
        ...input.generationInput,
        request: {
          ...input.generationInput.request,
          recipeCount: wanted - accepted.size,
        },
      };
      const prompt = buildRecipeGenerationPrompt(roundInput);
      const response = await dependencies.generator.generate({
        input: roundInput,
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        promptVersion: prompt.promptVersion,
      });
      if (response.provider !== dependencies.generator.provider) {
        degradedMode = "fallback_provider";
      }
      lastProvider = response.provider;
      lastModel = response.model;
      await dependencies.repository.recordUsage(
        input.jobId,
        input.userId,
        `${input.jobId}:text:${round}`,
        response.usage,
      );
      await dependencies.repository.updateProgress(
        input.jobId,
        "validation",
        50,
      );

      for (const recipe of response.recipes) {
        if (accepted.size >= wanted) break;
        const consistency = validateGeneratedRecipeConsistency(recipe);
        if (!consistency.valid) continue;
        const hash = await dependencies.repository.hashDeduplicationSignature(
          recipeDeduplicationSignature(recipe),
        );
        if (
          accepted.has(hash) ||
          (await dependencies.repository.recipeExists(hash))
        ) {
          continue;
        }
        try {
          const validated = await dependencies.validator.validate(recipe);
          if (!validated.nutrition.canDisplay) continue;
          accepted.set(hash, {
            recipe,
            safety: validated.safety,
            nutrition: validated.nutrition,
            deduplicationHash: hash,
          });
        } catch {
          // Un résultat non sûr n'est jamais stocké ; le prochain tour le remplace.
        }
      }
    }

    if (accepted.size < wanted) {
      throw new Error("INSUFFICIENT_SAFE_RECIPES");
    }

    await dependencies.repository.updateProgress(input.jobId, "storage", 75);
    const recipeIds: string[] = [];
    let position = 1;
    for (const validated of accepted.values()) {
      const recipeId = await dependencies.repository.saveValidatedRecipe(
        input.jobId,
        input.userId,
        validated,
        {
          provider: lastProvider,
          model: lastModel,
          promptVersion: basePrompt.promptVersion,
        },
        position,
      );
      recipeIds.push(recipeId);
      position += 1;
    }

    await dependencies.repository.updateProgress(input.jobId, "images", 88);
    const imageResults = await Promise.all(
      [...accepted.values()].map((validated, index) =>
        dependencies.images.generateForValidatedRecipe(
          recipeIds[index],
          validated.recipe,
        ),
      ),
    );
    if (imageResults.includes("placeholder")) {
      degradedMode = "without_image";
    }
    await dependencies.repository.completeJob(
      input.jobId,
      recipeIds,
      degradedMode,
    );
    return recipeIds;
  } catch (error) {
    await dependencies.repository.failJob(
      input.jobId,
      error instanceof Error ? error.message : "GENERATION_FAILED",
      "La génération n’a pas pu aboutir. Réessayez plus tard.",
    );
    throw error;
  }
}
