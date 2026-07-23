import { z } from "zod";

import { canReceiveAlcoholRecipes } from "./age";
import { nutritionGoalSchema, restrictionKinds } from "./onboarding";
import { productPolicy } from "./product-policy";
import {
  budgetLevels,
  cookingSkills,
  dietaryPatterns,
  preferenceSignals,
} from "./profile";

export const constraintSeverities = [
  "none",
  "mild",
  "moderate",
  "severe",
] as const;

export const foodSafetyConstraintSchema = z.object({
  targetType: z.enum(["ingredient", "allergen"]),
  targetId: z.uuid(),
  label: z.string().trim().min(1).max(160),
  kind: z.enum(restrictionKinds),
  severity: z.enum(constraintSeverities),
});

export const foodSafetyStepSchema = z
  .object({
    constraints: z.array(foodSafetyConstraintSchema).max(100),
    noConstraints: z.boolean(),
    confirmed: z.literal(true, "Confirme les contraintes avant de continuer"),
  })
  .superRefine((value, context) => {
    if (value.noConstraints === value.constraints.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["constraints"],
        message:
          "Choisis au moins une contrainte ou indique que tu n’en as aucune",
      });
    }

    const targets = new Map<string, string>();
    for (const constraint of value.constraints) {
      const key = `${constraint.targetType}:${constraint.targetId}`;
      const previousKind = targets.get(key);
      if (previousKind) {
        context.addIssue({
          code: "custom",
          path: ["constraints"],
          message: `Une même cible ne peut pas être à la fois ${previousKind} et ${constraint.kind}`,
        });
      }
      targets.set(key, constraint.kind);
    }
  });

export const goalsStepSchema = z.object({
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
});

export const tastesStepSchema = z
  .object({
    likedDishIds: z.array(z.uuid()).max(12),
    skipped: z.boolean(),
    idempotencyKey: z.uuid(),
  })
  .refine((value) => !(value.skipped && value.likedDishIds.length > 0), {
    path: ["likedDishIds"],
    message: "Une étape ignorée ne doit enregistrer aucun signal",
  });

export const progressiveProfileSchema = z.object({
  dietaryPattern: z.enum(dietaryPatterns).nullable(),
  cookingSkill: z.enum(cookingSkills).nullable(),
  maxPreparationMinutes: z.number().int().min(5).max(480).nullable(),
  budgetLevel: z.enum(budgetLevels).nullable(),
  cuisineCodes: z.array(z.string().regex(/^[a-z0-9_]+$/)).max(12),
  ingredientPreferences: z
    .array(
      z.object({
        ingredientId: z.uuid(),
        signal: z.enum(preferenceSignals),
      }),
    )
    .max(50),
  equipmentIds: z.array(z.uuid()).max(30),
});

export function getSafeAgeContext(dateOfBirth: Date, at = new Date()) {
  return {
    isAdult: true as const,
    alcoholRecipesAllowed: canReceiveAlcoholRecipes(dateOfBirth, at),
  };
}

export type ProfileCompletionInput = {
  foodSafetyConfirmed: boolean;
  goalsCompleted: boolean;
  tastesCompleted: boolean;
  dietaryPattern: boolean;
  cookingSkill: boolean;
  duration: boolean;
  budget: boolean;
  cuisines: boolean;
  equipment: boolean;
  ingredientPreferences: boolean;
};

export function getProfileCompletion(input: ProfileCompletionInput): number {
  const requiredWeight = 60;
  const optionalWeight = 40;
  const required =
    [
      input.foodSafetyConfirmed,
      input.goalsCompleted,
      input.tastesCompleted,
    ].filter(Boolean).length / 3;
  const optional =
    [
      input.dietaryPattern,
      input.cookingSkill,
      input.duration,
      input.budget,
      input.cuisines,
      input.equipment,
      input.ingredientPreferences,
    ].filter(Boolean).length / 7;
  return Math.round(required * requiredWeight + optional * optionalWeight);
}

export const contextualQuestionKeys = [
  "cooking_skill",
  "max_preparation_time",
  "budget",
  "equipment",
  "favorite_cuisines",
] as const;

export function selectContextualQuestion({
  missing,
  usefulActionCount,
  lastAskedAt,
  now = new Date(),
}: {
  missing: readonly (typeof contextualQuestionKeys)[number][];
  usefulActionCount: number;
  lastAskedAt: Date | null;
  now?: Date;
}) {
  if (usefulActionCount < 3 || missing.length === 0) return null;
  if (
    lastAskedAt &&
    now.getTime() - lastAskedAt.getTime() < 7 * 24 * 60 * 60 * 1000
  ) {
    return null;
  }
  return missing[0] ?? null;
}

export type FoodSafetyStep = z.infer<typeof foodSafetyStepSchema>;
export type GoalsStep = z.infer<typeof goalsStepSchema>;
export type TastesStep = z.infer<typeof tastesStepSchema>;
export type ProgressiveProfile = z.infer<typeof progressiveProfileSchema>;
