import { describe, expect, it } from "vitest";

import {
  normalizeFrenchSearchTerm,
  recipeVersionSchema,
  userFoodConstraintSchema,
} from "./index";

const ingredientId = "30000000-0000-4000-8000-000000000001";
const recipeId = "80000000-0000-4000-8000-000000000001";

const validRecipeVersion = {
  recipeId,
  versionNumber: 1,
  title: "Bowl de pois chiches",
  description: "Une recette complète et rapide pour le dîner.",
  servings: 2,
  preparationMinutes: 15,
  cookingMinutes: 20,
  restingMinutes: 0,
  difficulty: "easy",
  costLevel: "low",
  estimatedCostEur: 8,
  origin: "editorial",
  aiProvider: null,
  aiModel: null,
  promptVersion: null,
  validationStatus: "validated",
  publicationStatus: "published",
  validatedAt: "2026-07-23T12:00:00.000Z",
  publishedAt: "2026-07-23T12:05:00.000Z",
  ingredients: [
    {
      ingredientId,
      position: 1,
      quantity: 250,
      unit: "g",
      preparationNote: null,
      optional: false,
    },
  ],
  steps: [
    {
      position: 1,
      instruction: "Rôtir les pois chiches au four.",
      timerSeconds: 1200,
    },
  ],
  nutrition: {
    source: "ciqual",
    sourceVersion: "2025",
    caloriesKcal: 520,
    proteinG: 22,
    carbohydratesG: 62,
    fatG: 18,
    fiberG: 14,
    saltG: 1.1,
    tolerancePercent: 10,
  },
  images: [],
};

describe("food and recipe data contracts", () => {
  it("normalizes French accents consistently with database search", () => {
    expect(normalizeFrenchSearchTerm("  Crème brûlée  ")).toBe("creme brulee");
  });

  it("keeps strict constraints separate from negative preferences", () => {
    expect(
      userFoodConstraintSchema.safeParse({
        ingredientId,
        allergenId: null,
        kind: "allergy",
        severity: "severe",
        isAbsolute: true,
        note: null,
      }).success,
    ).toBe(true);

    expect(
      userFoodConstraintSchema.safeParse({
        ingredientId,
        allergenId: null,
        kind: "negative_preference",
        severity: "severe",
        isAbsolute: true,
        note: null,
      }).success,
    ).toBe(false);
  });

  it("requires traceable AI provenance", () => {
    expect(recipeVersionSchema.safeParse(validRecipeVersion).success).toBe(
      true,
    );
    expect(
      recipeVersionSchema.safeParse({
        ...validRecipeVersion,
        origin: "ai_generated",
      }).success,
    ).toBe(false);
  });

  it("blocks publication before validation", () => {
    expect(
      recipeVersionSchema.safeParse({
        ...validRecipeVersion,
        validationStatus: "pending",
        validatedAt: null,
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate ingredient positions", () => {
    expect(
      recipeVersionSchema.safeParse({
        ...validRecipeVersion,
        ingredients: [
          validRecipeVersion.ingredients[0],
          {
            ...validRecipeVersion.ingredients[0],
            ingredientId: "30000000-0000-4000-8000-000000000002",
          },
        ],
      }).success,
    ).toBe(false);
  });
});
