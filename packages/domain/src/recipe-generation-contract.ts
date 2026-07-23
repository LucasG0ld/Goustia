import { z } from "zod";

import { nutritionGoals } from "./onboarding";
import { recipeCostLevels, recipeDifficulties, recipeUnits } from "./recipe";

export const RECIPE_GENERATION_CONTRACT_VERSION = "recipe-generation.v1";

const identifierSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const boundedFrenchText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const recipeGenerationInputSchema = z
  .strictObject({
    contractVersion: z.literal(RECIPE_GENERATION_CONTRACT_VERSION),
    requestId: z.uuid(),
    locale: z.literal("fr-FR"),
    profile: z.strictObject({
      alcoholAllowed: z.boolean(),
      strictExcludedIngredientIds: z.array(identifierSchema).max(100),
      allergyCodes: z.array(identifierSchema).max(30),
      dislikedIngredientIds: z.array(identifierSchema).max(100),
      nutritionGoal: z.enum(nutritionGoals),
      servings: z.number().int().min(1).max(8),
      maximumPreparationMinutes: z.number().int().min(5).max(480).nullable(),
      budgetLevel: z.enum(["low", "moderate", "flexible"]).nullable(),
      equipmentCodes: z.array(identifierSchema).max(50),
      preferredCuisineCodes: z.array(identifierSchema).max(30),
    }),
    request: z.strictObject({
      recipeCount: z.number().int().min(1).max(14),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      avoidRecentRecipeIds: z.array(z.uuid()).max(100),
      requiredIngredientIds: z.array(identifierSchema).max(20),
    }),
  })
  .describe(
    "Entrée pseudonymisée : aucun nom, e-mail, date de naissance ou identifiant de compte.",
  );

export const generatedRecipeIngredientSchema = z.strictObject({
  sourceNameFr: boundedFrenchText(1, 200),
  canonicalIngredientId: identifierSchema.nullable(),
  quantity: z.number().positive(),
  unit: z.enum(recipeUnits),
  preparationNoteFr: boundedFrenchText(1, 300).nullable(),
  optional: z.boolean(),
  declaredAllergenCodes: z.array(identifierSchema).max(30),
  mayContainAllergenCodes: z.array(identifierSchema).max(30),
});

export const generatedRecipeStepSchema = z.strictObject({
  position: z.number().int().min(1).max(100),
  instructionFr: boundedFrenchText(3, 2000),
  timerSeconds: z.number().int().min(1).max(86400).nullable(),
  ingredientPositions: z.array(z.number().int().min(1).max(100)).max(50),
});

export const generatedRecipeSchema = z
  .strictObject({
    contractVersion: z.literal(RECIPE_GENERATION_CONTRACT_VERSION),
    clientRecipeId: z.uuid(),
    titleFr: boundedFrenchText(3, 180),
    descriptionFr: boundedFrenchText(10, 1000),
    servings: z.number().int().min(1).max(8),
    preparationMinutes: z.number().int().min(0).max(480),
    cookingMinutes: z.number().int().min(0).max(720),
    restingMinutes: z.number().int().min(0).max(720),
    difficulty: z.enum(recipeDifficulties),
    costLevel: z.enum(recipeCostLevels),
    ingredients: z.array(generatedRecipeIngredientSchema).min(1).max(100),
    steps: z.array(generatedRecipeStepSchema).min(1).max(100),
    nutritionExpectation: z.strictObject({
      calculateFromCiqual: z.literal(true),
      targetEnergyKcalPerPortion: z
        .strictObject({
          minimum: z.number().nonnegative(),
          maximum: z.number().positive(),
        })
        .nullable(),
      minimumProteinGPerPortion: z.number().nonnegative().nullable(),
    }),
    declaredAllergenCodes: z.array(identifierSchema).max(30),
    detectedExclusionIds: z.array(identifierSchema).max(100),
    visual: z.strictObject({
      promptFr: boundedFrenchText(20, 1200),
      altTextFr: boundedFrenchText(3, 300),
      illustrative: z.literal(true),
    }),
  })
  .superRefine((recipe, context) => {
    const positions = recipe.steps.map((step) => step.position);
    if (new Set(positions).size !== positions.length) {
      context.addIssue({
        code: "custom",
        path: ["steps"],
        message: "Les positions des étapes doivent être uniques",
      });
    }
    const validIngredientPositions = new Set(
      recipe.ingredients.map((_, index) => index + 1),
    );
    recipe.steps.forEach((step, stepIndex) => {
      if (
        step.ingredientPositions.some(
          (position) => !validIngredientPositions.has(position),
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["steps", stepIndex, "ingredientPositions"],
          message: "Une étape référence un ingrédient inexistant",
        });
      }
    });
    const target = recipe.nutritionExpectation.targetEnergyKcalPerPortion;
    if (target && target.minimum > target.maximum) {
      context.addIssue({
        code: "custom",
        path: ["nutritionExpectation", "targetEnergyKcalPerPortion"],
        message: "La borne minimale doit être inférieure à la borne maximale",
      });
    }
  });

export const recipeGenerationReportSchema = z.strictObject({
  contractVersion: z.literal(RECIPE_GENERATION_CONTRACT_VERSION),
  requestId: z.uuid(),
  provider: identifierSchema,
  model: boundedFrenchText(1, 200),
  promptVersion: identifierSchema,
  durationMs: z.number().int().nonnegative(),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
  schemaValidated: z.boolean(),
  foodSafetyValidated: z.boolean(),
  nutritionCalculated: z.boolean(),
  warnings: z.array(boundedFrenchText(1, 500)).max(100),
});

export const recipeGenerationResultSchema = z.strictObject({
  recipes: z.array(generatedRecipeSchema).min(1).max(14),
  report: recipeGenerationReportSchema,
});

export const generatedRecipeBatchSchema = z.strictObject({
  recipes: z.array(generatedRecipeSchema).min(1).max(14),
});

export const recipeGenerationInputJsonSchema = z.toJSONSchema(
  recipeGenerationInputSchema,
  {
    target: "draft-7",
    unrepresentable: "throw",
  },
);

export const generatedRecipeJsonSchema = z.toJSONSchema(generatedRecipeSchema, {
  target: "draft-7",
  unrepresentable: "throw",
});

export const generatedRecipeBatchJsonSchema = z.toJSONSchema(
  generatedRecipeBatchSchema,
  {
    target: "draft-7",
    unrepresentable: "throw",
  },
);

export const validRecipeGenerationInputExample = {
  contractVersion: RECIPE_GENERATION_CONTRACT_VERSION,
  requestId: "10000000-0000-4000-8000-000000000001",
  locale: "fr-FR",
  profile: {
    alcoholAllowed: false,
    strictExcludedIngredientIds: ["peanut"],
    allergyCodes: ["peanuts"],
    dislikedIngredientIds: ["celery"],
    nutritionGoal: "balanced",
    servings: 2,
    maximumPreparationMinutes: 30,
    budgetLevel: "moderate",
    equipmentCodes: ["oven"],
    preferredCuisineCodes: ["mediterranean"],
  },
  request: {
    recipeCount: 1,
    mealType: "dinner",
    avoidRecentRecipeIds: [],
    requiredIngredientIds: ["tomate"],
  },
} as const;

export const validGeneratedRecipeExample = {
  contractVersion: RECIPE_GENERATION_CONTRACT_VERSION,
  clientRecipeId: "10000000-0000-4000-8000-000000000002",
  titleFr: "Tofu rôti à la tomate",
  descriptionFr: "Un plat végétal simple, rapide et parfumé.",
  servings: 2,
  preparationMinutes: 15,
  cookingMinutes: 25,
  restingMinutes: 0,
  difficulty: "easy",
  costLevel: "low",
  ingredients: [
    {
      sourceNameFr: "Tofu nature",
      canonicalIngredientId: "tofu",
      quantity: 250,
      unit: "g",
      preparationNoteFr: "coupé en cubes",
      optional: false,
      declaredAllergenCodes: ["soybeans"],
      mayContainAllergenCodes: [],
    },
    {
      sourceNameFr: "Tomate",
      canonicalIngredientId: "tomate",
      quantity: 250,
      unit: "g",
      preparationNoteFr: "coupée en quartiers",
      optional: false,
      declaredAllergenCodes: [],
      mayContainAllergenCodes: [],
    },
  ],
  steps: [
    {
      position: 1,
      instructionFr:
        "Préchauffer le four puis disposer le tofu et les tomates.",
      timerSeconds: null,
      ingredientPositions: [1, 2],
    },
    {
      position: 2,
      instructionFr: "Cuire jusqu’à ce que le tofu soit légèrement doré.",
      timerSeconds: 1500,
      ingredientPositions: [1, 2],
    },
  ],
  nutritionExpectation: {
    calculateFromCiqual: true,
    targetEnergyKcalPerPortion: { minimum: 300, maximum: 550 },
    minimumProteinGPerPortion: 20,
  },
  declaredAllergenCodes: ["soybeans"],
  detectedExclusionIds: [],
  visual: {
    promptFr:
      "Photographie culinaire réaliste d’un tofu rôti aux tomates dans une assiette en grès, lumière naturelle.",
    altTextFr: "Assiette de tofu rôti accompagné de tomates.",
    illustrative: true,
  },
} as const;

export const invalidGeneratedRecipeExamples = [
  { ...validGeneratedRecipeExample, contractVersion: "recipe-generation.v0" },
  { ...validGeneratedRecipeExample, servings: 0 },
  {
    ...validGeneratedRecipeExample,
    nutritionExpectation: {
      ...validGeneratedRecipeExample.nutritionExpectation,
      calculateFromCiqual: false,
    },
  },
  { ...validGeneratedRecipeExample, unexpectedField: "forbidden" },
] as const;

export type RecipeGenerationInput = z.infer<typeof recipeGenerationInputSchema>;
export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>;
export type RecipeGenerationReport = z.infer<
  typeof recipeGenerationReportSchema
>;
