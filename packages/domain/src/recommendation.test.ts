import { describe, expect, it } from "vitest";

import {
  getRecommendationExclusion,
  rankRecommendations,
  scoreEligibleRecommendation,
  type RecommendationCandidate,
  type RecommendationContext,
  type RecommendationProfile,
} from "./recommendation";

const profile: RecommendationProfile = {
  alcoholAllowed: false,
  strictIngredientIds: ["peanut"],
  strictAllergenCodes: ["milk"],
  dietaryPattern: "vegetarian",
  likedIngredientIds: ["tomato", "lentil"],
  dislikedIngredientIds: ["celery"],
  likedCuisineCodes: ["mediterranean"],
  maximumTotalMinutes: 35,
  budgetLevel: "low",
  nutritionGoal: "balanced",
};
const candidate: RecommendationCandidate = {
  recipeId: "10000000-0000-4000-8000-000000000001",
  recipeVersionId: "10000000-0000-4000-8000-000000000002",
  ingredientIds: ["tomato", "lentil"],
  allergenCodes: [],
  containsAlcohol: false,
  compatibleDietaryPatterns: ["omnivore", "vegetarian", "vegan"],
  cuisineCode: "mediterranean",
  mainIngredientFamily: "legumes",
  totalMinutes: 25,
  costLevel: "low",
  goalTags: ["balanced"],
  lastProposedAt: null,
};
const context: RecommendationContext = {
  now: "2026-07-23T12:00:00.000Z",
  recentCooldownDays: 14,
  weekCuisineCounts: {},
  weekFamilyCounts: {},
};

describe("deterministic recommendation engine", () => {
  it.each<[RecommendationCandidate, string]>([
    [{ ...candidate, containsAlcohol: true }, "alcohol"],
    [{ ...candidate, allergenCodes: ["milk"] }, "allergen"],
    [{ ...candidate, ingredientIds: ["peanut"] }, "ingredient"],
    [
      { ...candidate, compatibleDietaryPatterns: ["omnivore"] },
      "dietary_pattern",
    ],
  ])("never scores absolute exclusions", (unsafe, reason) => {
    expect(getRecommendationExclusion(profile, unsafe)).toBe(reason);
    expect(rankRecommendations(profile, [unsafe], context)).toEqual([]);
  });

  it("scores every declared factor and emits a non-sensitive explanation", () => {
    const result = scoreEligibleRecommendation(profile, candidate, context);
    expect(result.score).toBe(20);
    expect(result.breakdown).toEqual({
      likedIngredients: 6,
      likedCuisine: 4,
      dislikedIngredients: 0,
      recency: 0,
      duration: 3,
      budget: 3,
      goal: 4,
      weeklyDiversity: 0,
    });
    expect(result.explanation).toContain("ingrédients appréciés");
    expect(result.explanation).not.toMatch(/allerg|exclu|mineur/i);
  });

  it("penalizes recency, dislikes and weekly repetition", () => {
    const result = scoreEligibleRecommendation(
      profile,
      {
        ...candidate,
        ingredientIds: ["celery"],
        lastProposedAt: "2026-07-22T12:00:00.000Z",
      },
      {
        ...context,
        weekCuisineCounts: { mediterranean: 2 },
        weekFamilyCounts: { legumes: 1 },
      },
    );
    expect(result.breakdown.dislikedIngredients).toBe(-4);
    expect(result.breakdown.recency).toBeLessThan(-9);
    expect(result.breakdown.weeklyDiversity).toBe(-6);
  });

  it("uses stable identifiers to break exact ties", () => {
    const second = {
      ...candidate,
      recipeId: "20000000-0000-4000-8000-000000000001",
      recipeVersionId: "20000000-0000-4000-8000-000000000002",
    };
    expect(
      rankRecommendations(profile, [second, candidate], context).map(
        ({ candidate: item }) => item.recipeId,
      ),
    ).toEqual([candidate.recipeId, second.recipeId]);
  });
});
