import {
  generatedRecipeSchema,
  recipeGenerationInputSchema,
  validGeneratedRecipeExample,
  validRecipeGenerationInputExample,
  type AiUsage,
  type CalculatedRecipeNutrition,
  type GeneratedRecipe,
} from "@recettes/domain";
import { describe, expect, it, vi } from "vitest";

import {
  orchestrateRecipeGeneration,
  type GenerationRepository,
  type ValidatedRecipe,
} from "./orchestration";
import type {
  RecipeGenerationRequest,
  RecipeGenerator,
} from "./providers/contracts";

const nutrition: CalculatedRecipeNutrition = {
  isEstimate: true,
  estimateLabel: "Valeurs nutritionnelles estimatives",
  canDisplay: true,
  confidenceThreshold: 0.8,
  inputWeightG: 500,
  cookedWeightG: 450,
  unquantifiedIngredientIds: [],
  total: {
    energyKcal: { value: 800, confidence: 1, status: "displayed" },
    proteinG: { value: 40, confidence: 1, status: "displayed" },
    carbohydratesG: { value: 80, confidence: 1, status: "displayed" },
    fatG: { value: 20, confidence: 1, status: "displayed" },
    fiberG: { value: 10, confidence: 1, status: "displayed" },
    saltG: { value: 2, confidence: 1, status: "displayed" },
  },
  perPortion: {
    energyKcal: { value: 400, confidence: 1, status: "displayed" },
    proteinG: { value: 20, confidence: 1, status: "displayed" },
    carbohydratesG: { value: 40, confidence: 1, status: "displayed" },
    fatG: { value: 10, confidence: 1, status: "displayed" },
    fiberG: { value: 5, confidence: 1, status: "displayed" },
    saltG: { value: 1, confidence: 1, status: "displayed" },
  },
};

const generationInput = recipeGenerationInputSchema.parse(
  validRecipeGenerationInputExample,
);
const validRecipe = generatedRecipeSchema.parse(validGeneratedRecipeExample);

class SequenceGenerator implements RecipeGenerator {
  readonly provider = "fake" as const;
  readonly model = "sequence";
  readonly requests: RecipeGenerationRequest[] = [];

  constructor(private readonly batches: GeneratedRecipe[][]) {}

  async generate(request: RecipeGenerationRequest) {
    this.requests.push(request);
    const recipes = this.batches.shift();
    if (!recipes) throw new Error("PROVIDER_DOWN");
    return {
      recipes,
      provider: this.provider,
      model: this.model,
      durationMs: 1,
      usage: {
        kind: "text" as const,
        provider: this.provider,
        model: this.model,
      },
    };
  }
}

function createRepository() {
  const saved: ValidatedRecipe[] = [];
  const failed: string[] = [];
  const usage: AiUsage[] = [];
  const repository: GenerationRepository = {
    updateProgress: vi.fn(async () => undefined),
    hashDeduplicationSignature: vi.fn(async (value) =>
      value.includes("interdite") ? "b".repeat(64) : "a".repeat(64),
    ),
    recipeExists: vi.fn(async () => false),
    saveValidatedRecipe: vi.fn(async (_jobId, _userId, validated) => {
      saved.push(validated);
      return "40000000-0000-4000-8000-000000000001";
    }),
    recordUsage: vi.fn(async (_jobId, _userId, _key, value) => {
      usage.push(value);
    }),
    completeJob: vi.fn(async () => undefined),
    failJob: vi.fn(async (_jobId, code) => {
      failed.push(code);
    }),
  };
  return { repository, saved, failed, usage };
}

describe("orchestration de génération", () => {
  it("rejette puis régénère avant de stocker uniquement une recette sûre", async () => {
    const unsafe = {
      ...structuredClone(validRecipe),
      titleFr: "Recette interdite",
    };
    const safe = structuredClone(validRecipe);
    const generator = new SequenceGenerator([[unsafe], [safe]]);
    const state = createRepository();
    const validator = {
      validate: vi.fn(async (recipe: GeneratedRecipe) => {
        if (recipe.titleFr.includes("interdite")) {
          throw new Error("FOOD_SAFETY_BLOCKED");
        }
        return {
          safety: {
            status: "safe" as const,
            checkedIngredientCount: recipe.ingredients.length,
            normalizedIngredients: [],
            findings: [],
          },
          nutrition,
        };
      }),
    };
    await expect(
      orchestrateRecipeGeneration(
        {
          jobId: "50000000-0000-4000-8000-000000000001",
          userId: "50000000-0000-4000-8000-000000000002",
          generationInput,
        },
        {
          generator,
          validator,
          repository: state.repository,
          images: {
            generateForValidatedRecipe: vi.fn(async () => "ready" as const),
          },
        },
      ),
    ).resolves.toHaveLength(1);
    expect(generator.requests).toHaveLength(2);
    expect(state.saved.map((item) => item.recipe.titleFr)).toEqual([
      validGeneratedRecipeExample.titleFr,
    ]);
    expect(state.usage).toHaveLength(2);
    expect(state.failed).toEqual([]);
  });

  it("échoue proprement après le nombre maximal de tentatives", async () => {
    const generator = new SequenceGenerator([]);
    const state = createRepository();
    await expect(
      orchestrateRecipeGeneration(
        {
          jobId: "50000000-0000-4000-8000-000000000003",
          userId: "50000000-0000-4000-8000-000000000004",
          generationInput,
        },
        {
          generator,
          validator: {
            validate: vi.fn(),
          },
          repository: state.repository,
          images: {
            generateForValidatedRecipe: vi.fn(),
          },
        },
      ),
    ).rejects.toThrow("PROVIDER_DOWN");
    expect(state.saved).toEqual([]);
    expect(state.failed).toEqual(["PROVIDER_DOWN"]);
  });

  it("signale le mode sans image sans perdre la recette validée", async () => {
    const generator = new SequenceGenerator([[structuredClone(validRecipe)]]);
    const state = createRepository();
    await orchestrateRecipeGeneration(
      {
        jobId: "50000000-0000-4000-8000-000000000005",
        userId: "50000000-0000-4000-8000-000000000006",
        generationInput,
      },
      {
        generator,
        validator: {
          validate: vi.fn(async () => ({
            safety: {
              status: "safe" as const,
              checkedIngredientCount: 2,
              normalizedIngredients: [],
              findings: [],
            },
            nutrition,
          })),
        },
        repository: state.repository,
        images: {
          generateForValidatedRecipe: vi.fn(async () => "placeholder" as const),
        },
      },
    );
    expect(state.repository.completeJob).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      "without_image",
    );
  });
});
