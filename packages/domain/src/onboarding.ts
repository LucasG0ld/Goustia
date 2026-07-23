import { z } from "zod";

export const nutritionGoals = [
  "weight_loss",
  "balanced",
  "muscle_gain",
  "no_specific_goal",
] as const;

export const nutritionGoalSchema = z.enum(nutritionGoals);

export const restrictionKinds = [
  "allergy",
  "intolerance",
  "strict_exclusion",
] as const;

export const foodRestrictionSchema = z.object({
  ingredientId: z.string().trim().min(1),
  kind: z.enum(restrictionKinds),
});

export const onboardingProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  birthDate: z.iso.date(),
  nutritionGoal: nutritionGoalSchema,
  mealsPerWeek: z.number().int().min(1).max(35),
  servingsPerMeal: z.number().int().min(1).max(20),
  restrictions: z.array(foodRestrictionSchema).max(100),
  initialLikedRecipeIds: z.array(z.string().trim().min(1)).max(12).default([]),
});

export type NutritionGoal = z.infer<typeof nutritionGoalSchema>;
export type FoodRestriction = z.infer<typeof foodRestrictionSchema>;
export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;
