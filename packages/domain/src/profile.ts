import { z } from "zod";

import { nutritionGoalSchema } from "./onboarding";
import { productPolicy } from "./product-policy";

export const onboardingStatuses = [
  "account_created",
  "food_safety_completed",
  "goals_completed",
  "initial_tastes_completed",
  "completed",
] as const;

export const dietaryPatterns = [
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "pork_free",
  "other",
] as const;

export const cookingSkills = ["beginner", "intermediate", "advanced"] as const;
export const budgetLevels = ["low", "moderate", "flexible"] as const;
export const preferenceSignals = ["liked", "disliked"] as const;

export const profilePreferencesSchema = z
  .object({
    nutritionGoal: nutritionGoalSchema,
    mealsPerWeek: z
      .number()
      .int()
      .min(productPolicy.mealsPerWeek.min)
      .max(productPolicy.mealsPerWeek.max),
    servingsPerMeal: z
      .number()
      .int()
      .min(productPolicy.servingsPerMeal.min)
      .max(productPolicy.servingsPerMeal.max),
    onboardingStatus: z.enum(onboardingStatuses),
    dietaryPattern: z.enum(dietaryPatterns).nullable().default(null),
    otherDietLabel: z.string().trim().min(1).max(100).nullable().default(null),
    cookingSkill: z.enum(cookingSkills).nullable().default(null),
    maxPreparationMinutes: z
      .number()
      .int()
      .min(5)
      .max(480)
      .nullable()
      .default(null),
    maxCookingMinutes: z
      .number()
      .int()
      .min(0)
      .max(720)
      .nullable()
      .default(null),
    maxTotalMinutes: z.number().int().min(5).max(720).nullable().default(null),
    budgetLevel: z.enum(budgetLevels).nullable().default(null),
    maxCostPerServingEur: z.number().min(0.5).max(500).nullable().default(null),
  })
  .superRefine((value, context) => {
    if (value.dietaryPattern === "other" && !value.otherDietLabel) {
      context.addIssue({
        code: "custom",
        path: ["otherDietLabel"],
        message: "Précise le régime alimentaire",
      });
    }

    if (value.dietaryPattern !== "other" && value.otherDietLabel) {
      context.addIssue({
        code: "custom",
        path: ["otherDietLabel"],
        message: "Le libellé personnalisé est réservé au régime autre",
      });
    }

    const knownDuration =
      (value.maxPreparationMinutes ?? 0) + (value.maxCookingMinutes ?? 0);
    if (
      value.maxTotalMinutes !== null &&
      knownDuration > value.maxTotalMinutes
    ) {
      context.addIssue({
        code: "custom",
        path: ["maxTotalMinutes"],
        message: "La durée totale doit couvrir préparation et cuisson",
      });
    }
  });

export const cuisinePreferenceSchema = z.object({
  cuisineCode: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  signal: z.enum(preferenceSignals),
  learnedFrom: z.enum(["explicit", "interaction", "inferred"]),
});

export const equipmentPreferenceSchema = z.object({
  equipmentId: z.uuid(),
  available: z.boolean(),
});

export type ProfilePreferences = z.infer<typeof profilePreferencesSchema>;
export type CuisinePreference = z.infer<typeof cuisinePreferenceSchema>;
export type EquipmentPreference = z.infer<typeof equipmentPreferenceSchema>;
