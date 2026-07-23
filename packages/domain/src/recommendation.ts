import { z } from "zod";

import { dietaryPatterns } from "./profile";
import { nutritionGoals } from "./onboarding";

const identifierSchema = z.string().trim().min(1).max(160);

export const recommendationProfileSchema = z.strictObject({
  alcoholAllowed: z.boolean(),
  strictIngredientIds: z.array(identifierSchema).max(200),
  strictAllergenCodes: z.array(identifierSchema).max(50),
  dietaryPattern: z.enum(dietaryPatterns).nullable(),
  likedIngredientIds: z.array(identifierSchema).max(200),
  dislikedIngredientIds: z.array(identifierSchema).max(200),
  likedCuisineCodes: z.array(identifierSchema).max(50),
  maximumTotalMinutes: z.number().int().min(5).max(1440).nullable(),
  budgetLevel: z.enum(["low", "moderate", "flexible"]).nullable(),
  nutritionGoal: z.enum(nutritionGoals),
});

export const recommendationCandidateSchema = z.strictObject({
  recipeId: z.uuid(),
  recipeVersionId: z.uuid(),
  ingredientIds: z.array(identifierSchema).min(1).max(200),
  allergenCodes: z.array(identifierSchema).max(50),
  containsAlcohol: z.boolean(),
  compatibleDietaryPatterns: z.array(z.enum(dietaryPatterns)).max(6),
  cuisineCode: identifierSchema.nullable(),
  mainIngredientFamily: identifierSchema.nullable(),
  totalMinutes: z.number().int().min(0).max(1440),
  costLevel: z.enum(["low", "moderate", "high"]).nullable(),
  goalTags: z.array(z.enum(nutritionGoals)).max(4),
  lastProposedAt: z.iso.datetime().nullable(),
});

export const recommendationContextSchema = z.strictObject({
  now: z.iso.datetime(),
  recentCooldownDays: z.number().int().min(1).max(90).default(14),
  weekCuisineCounts: z.record(identifierSchema, z.number().int().nonnegative()),
  weekFamilyCounts: z.record(identifierSchema, z.number().int().nonnegative()),
});

export type RecommendationProfile = z.infer<typeof recommendationProfileSchema>;
export type RecommendationCandidate = z.infer<
  typeof recommendationCandidateSchema
>;
export type RecommendationContext = z.infer<typeof recommendationContextSchema>;

export type RecommendationExclusion =
  | "alcohol"
  | "allergen"
  | "ingredient"
  | "dietary_pattern";

export type RecommendationScoreBreakdown = {
  likedIngredients: number;
  likedCuisine: number;
  dislikedIngredients: number;
  recency: number;
  duration: number;
  budget: number;
  goal: number;
  weeklyDiversity: number;
};

export type RankedRecommendation = {
  candidate: RecommendationCandidate;
  score: number;
  breakdown: RecommendationScoreBreakdown;
  explanation: string;
};

const intersects = (left: readonly string[], right: readonly string[]) => {
  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
};

export function getRecommendationExclusion(
  profileInput: RecommendationProfile,
  candidateInput: RecommendationCandidate,
): RecommendationExclusion | null {
  const profile = recommendationProfileSchema.parse(profileInput);
  const candidate = recommendationCandidateSchema.parse(candidateInput);
  if (!profile.alcoholAllowed && candidate.containsAlcohol) return "alcohol";
  if (intersects(profile.strictAllergenCodes, candidate.allergenCodes)) {
    return "allergen";
  }
  if (intersects(profile.strictIngredientIds, candidate.ingredientIds)) {
    return "ingredient";
  }
  if (
    profile.dietaryPattern &&
    profile.dietaryPattern !== "omnivore" &&
    !candidate.compatibleDietaryPatterns.includes(profile.dietaryPattern)
  ) {
    return "dietary_pattern";
  }
  return null;
}

function recencyPenalty(
  lastProposedAt: string | null,
  now: Date,
  cooldownDays: number,
) {
  if (!lastProposedAt) return 0;
  const ageDays = Math.max(
    0,
    (now.getTime() - new Date(lastProposedAt).getTime()) / 86_400_000,
  );
  if (ageDays >= cooldownDays) return 0;
  return -Math.round(10 * (1 - ageDays / cooldownDays) * 100) / 100;
}

function budgetScore(
  preference: RecommendationProfile["budgetLevel"],
  cost: RecommendationCandidate["costLevel"],
) {
  if (!preference || !cost || preference === "flexible") return 0;
  if (preference === "low") {
    return cost === "low" ? 3 : cost === "moderate" ? -1 : -4;
  }
  return cost === "high" ? -1 : 2;
}

export function scoreEligibleRecommendation(
  profileInput: RecommendationProfile,
  candidateInput: RecommendationCandidate,
  contextInput: RecommendationContext,
): RankedRecommendation {
  const profile = recommendationProfileSchema.parse(profileInput);
  const candidate = recommendationCandidateSchema.parse(candidateInput);
  const context = recommendationContextSchema.parse(contextInput);
  const exclusion = getRecommendationExclusion(profile, candidate);
  if (exclusion) {
    throw new Error(`INELIGIBLE_RECOMMENDATION:${exclusion}`);
  }

  const likedCount = candidate.ingredientIds.filter((id) =>
    profile.likedIngredientIds.includes(id),
  ).length;
  const dislikedCount = candidate.ingredientIds.filter((id) =>
    profile.dislikedIngredientIds.includes(id),
  ).length;
  const duration =
    profile.maximumTotalMinutes === null
      ? 0
      : candidate.totalMinutes <= profile.maximumTotalMinutes
        ? 3
        : -Math.min(
            5,
            Math.ceil(
              (candidate.totalMinutes - profile.maximumTotalMinutes) / 15,
            ),
          );
  const breakdown: RecommendationScoreBreakdown = {
    likedIngredients: Math.min(9, likedCount * 3),
    likedCuisine:
      candidate.cuisineCode &&
      profile.likedCuisineCodes.includes(candidate.cuisineCode)
        ? 4
        : 0,
    dislikedIngredients:
      dislikedCount === 0 ? 0 : -Math.min(12, dislikedCount * 4),
    recency: recencyPenalty(
      candidate.lastProposedAt,
      new Date(context.now),
      context.recentCooldownDays,
    ),
    duration,
    budget: budgetScore(profile.budgetLevel, candidate.costLevel),
    goal: candidate.goalTags.includes(profile.nutritionGoal) ? 4 : 0,
    weeklyDiversity: (() => {
      const repeated =
        (candidate.cuisineCode
          ? (context.weekCuisineCounts[candidate.cuisineCode] ?? 0)
          : 0) +
        (candidate.mainIngredientFamily
          ? (context.weekFamilyCounts[candidate.mainIngredientFamily] ?? 0)
          : 0);
      return repeated === 0 ? 0 : -2 * repeated;
    })(),
  };
  const score =
    Math.round(
      Object.values(breakdown).reduce((total, value) => total + value, 0) * 100,
    ) / 100;
  const positiveReasons = [
    breakdown.likedIngredients > 0 ? "reprend des ingrédients appréciés" : null,
    breakdown.likedCuisine > 0 ? "correspond à une cuisine appréciée" : null,
    breakdown.duration > 0
      ? `se prépare en ${candidate.totalMinutes} min`
      : null,
    breakdown.budget > 0 ? "respecte le budget habituel" : null,
    breakdown.goal > 0 ? "correspond à l’objectif du moment" : null,
    breakdown.weeklyDiversity > -1 ? "varie les repas de la semaine" : null,
  ].filter(Boolean);

  return {
    candidate,
    score,
    breakdown,
    explanation:
      positiveReasons.slice(0, 2).join(" et ") ||
      "compatible avec les préférences actuelles",
  };
}

export function rankRecommendations(
  profile: RecommendationProfile,
  candidates: RecommendationCandidate[],
  context: RecommendationContext,
): RankedRecommendation[] {
  return candidates
    .filter((candidate) => !getRecommendationExclusion(profile, candidate))
    .map((candidate) =>
      scoreEligibleRecommendation(profile, candidate, context),
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.recipeId.localeCompare(right.candidate.recipeId) ||
        left.candidate.recipeVersionId.localeCompare(
          right.candidate.recipeVersionId,
        ),
    );
}
