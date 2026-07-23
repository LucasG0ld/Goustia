import { z } from "zod";

export const aiJobKinds = [
  "meal_plan",
  "recipe",
  "recipe_swap",
  "recipe_image",
] as const;
export const aiJobStatuses = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;
export const shoppingListStatuses = [
  "draft",
  "active",
  "completed",
  "archived",
] as const;

export const shoppingListItemSchema = z
  .object({
    ingredientId: z.uuid().nullable().default(null),
    manualLabel: z.string().trim().min(1).max(160).nullable().default(null),
    quantity: z.number().positive().nullable().default(null),
    unit: z
      .enum([
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
      ])
      .nullable()
      .default(null),
    checkedAt: z.iso.datetime().nullable().default(null),
  })
  .refine(
    (value) =>
      Number(value.ingredientId !== null) +
        Number(value.manualLabel !== null) ===
      1,
    {
      message: "Choisis un ingrédient ou saisis un libellé",
    },
  );

export const aiJobSchema = z.object({
  id: z.uuid(),
  kind: z.enum(aiJobKinds),
  status: z.enum(aiJobStatuses),
  attemptCount: z.number().int().min(0).max(10),
  userErrorCode: z.string().nullable(),
  userErrorMessage: z.string().trim().min(1).max(300).nullable(),
});

export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>;
export type AiJob = z.infer<typeof aiJobSchema>;
