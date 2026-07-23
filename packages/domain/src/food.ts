import { z } from "zod";

export const foodConstraintKinds = [
  "allergy",
  "intolerance",
  "strict_exclusion",
  "negative_preference",
] as const;

export const constraintSeverities = [
  "none",
  "mild",
  "moderate",
  "severe",
  "life_threatening",
] as const;

export const ingredientSchema = z.object({
  id: z.uuid(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameFr: z.string().trim().min(1).max(160),
  familyId: z.uuid().nullable(),
  parentIngredientId: z.uuid().nullable(),
  ciqualCode: z.string().trim().min(1).nullable(),
  containsAlcohol: z.boolean(),
  isActive: z.boolean(),
});

export const userFoodConstraintSchema = z
  .object({
    ingredientId: z.uuid().nullable().default(null),
    allergenId: z.uuid().nullable().default(null),
    kind: z.enum(foodConstraintKinds),
    severity: z.enum(constraintSeverities),
    isAbsolute: z.boolean(),
    note: z.string().trim().min(1).max(500).nullable().default(null),
  })
  .superRefine((value, context) => {
    if (
      Number(value.ingredientId !== null) +
        Number(value.allergenId !== null) !==
      1
    ) {
      context.addIssue({
        code: "custom",
        path: ["ingredientId"],
        message: "Cible exactement un ingrédient ou un allergène",
      });
    }

    if (
      (value.kind === "allergy" || value.kind === "strict_exclusion") &&
      !value.isAbsolute
    ) {
      context.addIssue({
        code: "custom",
        path: ["isAbsolute"],
        message: "Une allergie ou interdiction est toujours absolue",
      });
    }

    if (
      value.kind === "negative_preference" &&
      (value.isAbsolute || !["none", "mild"].includes(value.severity))
    ) {
      context.addIssue({
        code: "custom",
        path: ["kind"],
        message: "Une préférence négative ne doit pas devenir une exclusion",
      });
    }
  });

export function normalizeFrenchSearchTerm(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

export type Ingredient = z.infer<typeof ingredientSchema>;
export type UserFoodConstraint = z.infer<typeof userFoodConstraintSchema>;
