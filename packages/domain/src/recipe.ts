import { z } from "zod";

export const recipeDifficulties = ["easy", "medium", "advanced"] as const;
export const recipeCostLevels = ["low", "moderate", "high"] as const;
export const recipeOrigins = ["editorial", "ai_generated", "user"] as const;
export const recipeValidationStatuses = [
  "draft",
  "pending",
  "validated",
  "rejected",
] as const;
export const recipePublicationStatuses = [
  "private",
  "unlisted",
  "published",
  "archived",
] as const;
export const recipeImageStatuses = [
  "pending",
  "generating",
  "ready",
  "failed",
  "rejected",
] as const;
export const recipeUnits = [
  "g",
  "kg",
  "ml",
  "l",
  "piece",
  "teaspoon",
  "tablespoon",
  "pinch",
  "bunch",
  "slice",
  "clove",
  "to_taste",
] as const;

const recipeIngredientSchema = z.object({
  ingredientId: z.uuid(),
  position: z.number().int().positive(),
  quantity: z.number().positive().nullable(),
  unit: z.enum(recipeUnits).nullable(),
  preparationNote: z.string().trim().min(1).max(300).nullable().default(null),
  optional: z.boolean().default(false),
});

const recipeStepSchema = z.object({
  position: z.number().int().positive(),
  instruction: z.string().trim().min(3).max(3000),
  timerSeconds: z.number().int().min(1).max(86400).nullable().default(null),
});

export const recipeNutritionSchema = z.object({
  source: z.enum(["ciqual", "manual"]),
  sourceVersion: z.string().trim().min(1),
  caloriesKcal: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbohydratesG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().nullable(),
  saltG: z.number().nonnegative().nullable(),
  tolerancePercent: z.number().min(0).max(100),
});

export const recipeImageSchema = z
  .object({
    storageBucket: z.string().trim().min(1),
    storagePath: z.string().trim().min(1).nullable(),
    altText: z.string().trim().min(1).max(300).nullable(),
    status: z.enum(recipeImageStatuses),
    provider: z.string().trim().min(1).nullable(),
    model: z.string().trim().min(1).nullable(),
    promptVersion: z.string().trim().min(1).nullable(),
    width: z.number().int().min(1).max(8192).nullable(),
    height: z.number().int().min(1).max(8192).nullable(),
  })
  .superRefine((value, context) => {
    if (value.status === "ready" && (!value.storagePath || !value.altText)) {
      context.addIssue({
        code: "custom",
        path: ["storagePath"],
        message: "Une image prête exige un chemin et un texte alternatif",
      });
    }
  });

export const recipeVersionSchema = z
  .object({
    recipeId: z.uuid(),
    versionNumber: z.number().int().positive(),
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().min(10).max(2000),
    servings: z.number().int().min(1).max(8),
    preparationMinutes: z.number().int().min(0).max(480),
    cookingMinutes: z.number().int().min(0).max(720),
    restingMinutes: z.number().int().min(0).max(720),
    difficulty: z.enum(recipeDifficulties),
    costLevel: z.enum(recipeCostLevels).nullable(),
    estimatedCostEur: z.number().min(0).max(10000).nullable(),
    origin: z.enum(recipeOrigins),
    aiProvider: z.string().trim().min(1).nullable(),
    aiModel: z.string().trim().min(1).nullable(),
    promptVersion: z.string().trim().min(1).nullable(),
    validationStatus: z.enum(recipeValidationStatuses),
    publicationStatus: z.enum(recipePublicationStatuses),
    validatedAt: z.iso.datetime().nullable(),
    publishedAt: z.iso.datetime().nullable(),
    ingredients: z.array(recipeIngredientSchema).min(1).max(100),
    steps: z.array(recipeStepSchema).min(1).max(100),
    nutrition: recipeNutritionSchema.nullable(),
    images: z.array(recipeImageSchema).max(10).default([]),
  })
  .superRefine((value, context) => {
    if (
      value.origin === "ai_generated" &&
      (!value.aiProvider || !value.aiModel || !value.promptVersion)
    ) {
      context.addIssue({
        code: "custom",
        path: ["aiProvider"],
        message: "La provenance IA doit être complète",
      });
    }

    if (value.validationStatus === "validated" && !value.validatedAt) {
      context.addIssue({
        code: "custom",
        path: ["validatedAt"],
        message: "Une recette validée exige une date",
      });
    }

    if (
      value.publicationStatus === "published" &&
      (value.validationStatus !== "validated" || !value.publishedAt)
    ) {
      context.addIssue({
        code: "custom",
        path: ["publicationStatus"],
        message: "Seule une recette validée et datée peut être publiée",
      });
    }

    for (const [field, positions] of [
      ["ingredients", value.ingredients.map((item) => item.position)],
      ["steps", value.steps.map((item) => item.position)],
    ] as const) {
      if (new Set(positions).size !== positions.length) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: "Les positions doivent être uniques",
        });
      }
    }
  });

export const recipeIdentitySchema = z.object({
  id: z.uuid(),
  canonicalSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  deduplicationHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export type RecipeVersion = z.infer<typeof recipeVersionSchema>;
export type RecipeIdentity = z.infer<typeof recipeIdentitySchema>;
