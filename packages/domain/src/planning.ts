import { z } from "zod";

export const mealPlanStatuses = [
  "draft",
  "generating",
  "ready",
  "archived",
] as const;
export const mealTypes = ["lunch", "dinner"] as const;
export const reactionKinds = ["like", "dislike"] as const;
export const dislikeReasons = [
  "ingredient",
  "too_long",
  "too_complex",
  "too_expensive",
  "recently_eaten",
  "dish_type",
  "other",
] as const;

export const plannedMealSchema = z.object({
  id: z.uuid(),
  mealPlanId: z.uuid(),
  recipeVersionId: z.uuid().nullable(),
  mealDate: z.iso.date(),
  mealType: z.enum(mealTypes),
  servings: z.number().int().min(1).max(8),
  isLocked: z.boolean(),
});

export const mealPlanSchema = z.object({
  id: z.uuid(),
  weekStart: z.iso.date(),
  status: z.enum(mealPlanStatuses),
  meals: z.array(plannedMealSchema),
});

export const recipeReactionSchema = z
  .object({
    recipeId: z.uuid(),
    reaction: z.enum(reactionKinds),
    reason: z.enum(dislikeReasons).nullable().default(null),
    idempotencyKey: z.uuid(),
  })
  .superRefine((value, context) => {
    if (value.reaction === "like" && value.reason !== null) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Un motif est réservé aux recettes refusées",
      });
    }
  });

export const recipeSwapRequestSchema = z.object({
  plannedMealId: z.uuid(),
  fromRecipeVersionId: z.uuid(),
  reason: z.enum(dislikeReasons).nullable().default(null),
  requestSummary: z.string().trim().min(1).max(500).nullable().default(null),
  idempotencyKey: z.uuid(),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;
export type PlannedMeal = z.infer<typeof plannedMealSchema>;
export type RecipeReactionInput = z.infer<typeof recipeReactionSchema>;
export type RecipeSwapRequest = z.infer<typeof recipeSwapRequestSchema>;
