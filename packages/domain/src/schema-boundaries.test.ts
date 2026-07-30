import { describe, expect, it } from "vitest";

import {
  aiJobSchema,
  cuisinePreferenceSchema,
  equipmentPreferenceSchema,
  ingredientSchema,
  mealPlanSchema,
  profilePreferencesSchema,
  recipeIdentitySchema,
  recipeImageSchema,
  recipeNutritionSchema,
  recipeReactionSchema,
  recipeVersionSchema,
  shoppingListItemSchema,
  userFoodConstraintSchema,
} from "./index";

const id = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";

describe("schémas métier aux limites", () => {
  it("valide les identifiants et normalise les champs optionnels", () => {
    expect(
      ingredientSchema.parse({
        id,
        slug: "creme-fraiche",
        nameFr: "Crème fraîche",
        familyId: null,
        parentIngredientId: null,
        ciqualCode: null,
        containsAlcohol: false,
        isActive: true,
      }).slug,
    ).toBe("creme-fraiche");
    expect(
      recipeIdentitySchema.safeParse({
        id,
        canonicalSlug: "plat-teste",
        deduplicationHash: "a".repeat(64),
      }).success,
    ).toBe(true);
    expect(
      recipeIdentitySchema.safeParse({
        id,
        canonicalSlug: "Plat testé",
        deduplicationHash: "a".repeat(63),
      }).success,
    ).toBe(false);
  });

  it("impose une cible unique et la sévérité des contraintes", () => {
    const base = {
      ingredientId: id,
      allergenId: null,
      kind: "allergy" as const,
      severity: "severe" as const,
      isAbsolute: true,
      note: null,
    };
    expect(userFoodConstraintSchema.safeParse(base).success).toBe(true);
    expect(
      userFoodConstraintSchema.safeParse({
        ...base,
        allergenId: otherId,
      }).success,
    ).toBe(false);
    expect(
      userFoodConstraintSchema.safeParse({
        ...base,
        kind: "negative_preference",
        severity: "severe",
      }).success,
    ).toBe(false);
  });

  it("respecte les limites du profil et les durées cohérentes", () => {
    const base = {
      nutritionGoal: "balanced" as const,
      mealsPerWeek: 5,
      servingsPerMeal: 2,
      onboardingStatus: "completed" as const,
      dietaryPattern: "omnivore" as const,
      otherDietLabel: null,
      cookingSkill: "beginner" as const,
      maxPreparationMinutes: 20,
      maxCookingMinutes: 30,
      maxTotalMinutes: 50,
      budgetLevel: "moderate" as const,
      maxCostPerServingEur: 8,
    };
    expect(profilePreferencesSchema.safeParse(base).success).toBe(true);
    expect(
      profilePreferencesSchema.safeParse({
        ...base,
        maxTotalMinutes: 49,
      }).success,
    ).toBe(false);
    expect(
      profilePreferencesSchema.safeParse({
        ...base,
        dietaryPattern: "other",
      }).success,
    ).toBe(false);
  });

  it("valide les préférences de cuisine et d'équipement", () => {
    expect(
      cuisinePreferenceSchema.safeParse({
        cuisineCode: "asie_du_sud_est",
        signal: "liked",
        learnedFrom: "explicit",
      }).success,
    ).toBe(true);
    expect(
      cuisinePreferenceSchema.safeParse({
        cuisineCode: "Asie du Sud-Est",
        signal: "liked",
        learnedFrom: "explicit",
      }).success,
    ).toBe(false);
    expect(
      equipmentPreferenceSchema.safeParse({
        equipmentId: id,
        available: true,
      }).success,
    ).toBe(true);
  });

  it("interdit les éléments de courses ambigus", () => {
    expect(
      shoppingListItemSchema.safeParse({
        ingredientId: id,
        manualLabel: null,
        quantity: 0.01,
        unit: "g",
        checkedAt: null,
      }).success,
    ).toBe(true);
    expect(
      shoppingListItemSchema.safeParse({
        ingredientId: id,
        manualLabel: "Tomates",
      }).success,
    ).toBe(false);
    expect(
      shoppingListItemSchema.safeParse({
        ingredientId: null,
        manualLabel: null,
      }).success,
    ).toBe(false);
  });

  it("contrôle les réactions, plans et tâches IA", () => {
    expect(
      recipeReactionSchema.safeParse({
        recipeId: id,
        reaction: "like",
        reason: "too_long",
        idempotencyKey: otherId,
      }).success,
    ).toBe(false);
    expect(
      mealPlanSchema.safeParse({
        id,
        weekStart: "2026-07-27",
        status: "ready",
        meals: [
          {
            id: otherId,
            mealPlanId: id,
            recipeVersionId: null,
            mealDate: "2026-07-27",
            mealType: "dinner",
            servings: 8,
            isLocked: false,
          },
        ],
      }).success,
    ).toBe(true);
    expect(
      aiJobSchema.safeParse({
        id,
        kind: "recipe",
        status: "failed",
        attemptCount: 11,
        userErrorCode: null,
        userErrorMessage: null,
      }).success,
    ).toBe(false);
  });

  it("exige les métadonnées d'une image prête", () => {
    expect(
      recipeImageSchema.safeParse({
        storageBucket: "recipes",
        storagePath: null,
        altText: null,
        status: "ready",
        provider: "fake",
        model: "fake-image",
        promptVersion: "image-v1",
        width: 1024,
        height: 1024,
      }).success,
    ).toBe(false);
  });

  it("borne les valeurs nutritionnelles", () => {
    expect(
      recipeNutritionSchema.safeParse({
        source: "ciqual",
        sourceVersion: "2025",
        caloriesKcal: 0,
        proteinG: 0,
        carbohydratesG: 0,
        fatG: 0,
        fiberG: null,
        saltG: null,
        tolerancePercent: 100,
      }).success,
    ).toBe(true);
    expect(
      recipeNutritionSchema.safeParse({
        source: "ciqual",
        sourceVersion: "2025",
        caloriesKcal: -1,
        proteinG: 0,
        carbohydratesG: 0,
        fatG: 0,
        fiberG: null,
        saltG: null,
        tolerancePercent: 101,
      }).success,
    ).toBe(false);
  });

  it("préserve les invariants d'une version de recette", () => {
    const base = {
      recipeId: id,
      versionNumber: 1,
      title: "Plat de test",
      description: "Une description suffisamment longue.",
      servings: 2,
      preparationMinutes: 10,
      cookingMinutes: 20,
      restingMinutes: 0,
      difficulty: "easy" as const,
      costLevel: "low" as const,
      estimatedCostEur: 4,
      origin: "user" as const,
      aiProvider: null,
      aiModel: null,
      promptVersion: null,
      validationStatus: "draft" as const,
      publicationStatus: "private" as const,
      validatedAt: null,
      publishedAt: null,
      ingredients: [
        {
          ingredientId: otherId,
          position: 1,
          quantity: 100,
          unit: "g" as const,
          preparationNote: null,
          optional: false,
        },
      ],
      steps: [
        {
          position: 1,
          instruction: "Mélanger puis cuire.",
          timerSeconds: null,
        },
      ],
      nutrition: null,
      images: [],
    };
    expect(recipeVersionSchema.safeParse(base).success).toBe(true);
    expect(
      recipeVersionSchema.safeParse({
        ...base,
        origin: "ai_generated",
      }).success,
    ).toBe(false);
    expect(
      recipeVersionSchema.safeParse({
        ...base,
        publicationStatus: "published",
      }).success,
    ).toBe(false);
  });
});
