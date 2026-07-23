import { z } from "zod";

export const swapPreservationSchema = z.strictObject({
  calories: z.boolean().default(false),
  protein: z.boolean().default(false),
  budget: z.boolean().default(false),
  duration: z.boolean().default(false),
});

export const swapAlternativeRequestSchema = z
  .strictObject({
    plannedMealId: z.uuid(),
    freeRequest: z.string().trim().max(500).nullable().default(null),
    preserve: swapPreservationSchema,
  })
  .superRefine((value, context) => {
    const request = value.freeRequest?.toLocaleLowerCase("fr-FR") ?? "";
    if (
      value.preserve.duration &&
      /(plus long|mijot|cuisson lente)/i.test(request)
    ) {
      context.addIssue({
        code: "custom",
        path: ["freeRequest"],
        message: "La demande contredit la conservation de la durée",
      });
    }
    if (
      value.preserve.budget &&
      /(plus cher|premium|gastronomique)/i.test(request)
    ) {
      context.addIssue({
        code: "custom",
        path: ["freeRequest"],
        message: "La demande contredit la conservation du budget",
      });
    }
  });

export function scaleRecipeQuantity(
  quantity: number | null,
  originalServings: number,
  requestedServings: number,
) {
  if (quantity === null) return null;
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isInteger(originalServings) ||
    originalServings < 1 ||
    !Number.isInteger(requestedServings) ||
    requestedServings < 1 ||
    requestedServings > 8
  ) {
    throw new RangeError("invalid recipe scaling input");
  }
  return (
    Math.round(quantity * (requestedServings / originalServings) * 1000) / 1000
  );
}

export function scaleNutritionValue(
  perPortionValue: number | null,
  requestedServings: number,
) {
  if (perPortionValue === null) return null;
  if (
    !Number.isFinite(perPortionValue) ||
    perPortionValue < 0 ||
    !Number.isInteger(requestedServings) ||
    requestedServings < 1 ||
    requestedServings > 8
  ) {
    throw new RangeError("invalid nutrition scaling input");
  }
  return Math.round(perPortionValue * requestedServings * 100) / 100;
}

export function expandIngredientIds(
  ingredientIds: readonly string[],
  relations: readonly {
    childIngredientId: string;
    parentIngredientId: string;
  }[],
) {
  const expanded = new Set(ingredientIds);
  let changed = true;
  while (changed) {
    changed = false;
    for (const relation of relations) {
      if (
        expanded.has(relation.childIngredientId) &&
        !expanded.has(relation.parentIngredientId)
      ) {
        expanded.add(relation.parentIngredientId);
        changed = true;
      }
    }
  }
  return [...expanded];
}

export type SwapPreservation = z.infer<typeof swapPreservationSchema>;
export type SwapAlternativeRequest = z.infer<
  typeof swapAlternativeRequestSchema
>;
