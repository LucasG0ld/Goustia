import { z } from "zod";

import { recipeUnits } from "./recipe";

export const displayedNutrients = [
  "energyKcal",
  "proteinG",
  "carbohydratesG",
  "fatG",
  "fiberG",
  "saltG",
] as const;

export const nutritionValueStatuses = [
  "exact",
  "estimated",
  "less_than",
  "trace",
  "missing",
] as const;

export const nutritionConfidenceThreshold = 0.8;

export const nutrientDatumSchema = z
  .object({
    valuePer100g: z.number().nonnegative().nullable(),
    status: z.enum(nutritionValueStatuses),
    confidence: z.number().min(0).max(1),
  })
  .superRefine((value, context) => {
    const hasNumericValue = value.valuePer100g !== null;
    const requiresNumericValue = ["exact", "estimated"].includes(value.status);
    if (hasNumericValue !== requiresNumericValue) {
      context.addIssue({
        code: "custom",
        path: ["valuePer100g"],
        message:
          "Seules les valeurs exactes ou estimées peuvent fournir une valeur numérique",
      });
    }
  });

export const unitConversionSchema = z.object({
  densityGPerMl: z.number().positive().optional(),
  unitWeightsG: z
    .partialRecord(z.enum(recipeUnits), z.number().positive())
    .default({}),
  confidence: z.number().min(0).max(1).default(1),
  source: z.string().trim().min(1).max(300),
});

export const ingredientNutritionInputSchema = z.object({
  ingredientId: z.string().trim().min(1),
  quantity: z.number().positive(),
  unit: z.enum(recipeUnits),
  conversion: unitConversionSchema.optional(),
  nutrients: z
    .partialRecord(z.enum(displayedNutrients), nutrientDatumSchema)
    .default({}),
});

export const recipeNutritionInputSchema = z.object({
  servings: z.number().int().positive().max(100),
  ingredients: z.array(ingredientNutritionInputSchema).min(1).max(200),
  cookingYieldFactor: z.number().positive().max(5).default(1),
  nutrientRetentionFactors: z
    .partialRecord(z.enum(displayedNutrients), z.number().min(0).max(1))
    .default({}),
  confidenceThreshold: z
    .number()
    .min(0)
    .max(1)
    .default(nutritionConfidenceThreshold),
});

type RecipeUnit = (typeof recipeUnits)[number];
type NutrientKey = (typeof displayedNutrients)[number];

export type UnitConversion = z.infer<typeof unitConversionSchema>;
export type IngredientNutritionInput = z.infer<
  typeof ingredientNutritionInputSchema
>;
export type RecipeNutritionInput = z.input<typeof recipeNutritionInputSchema>;

export type QuantityConversionResult =
  | { ok: true; grams: number; confidence: number }
  | {
      ok: false;
      reason: "density_required" | "unit_weight_required" | "not_quantifiable";
    };

export type CalculatedNutrient = {
  value: number | null;
  confidence: number;
  status: "displayed" | "hidden";
};

export type CalculatedRecipeNutrition = {
  isEstimate: true;
  estimateLabel: "Valeurs nutritionnelles estimatives";
  canDisplay: boolean;
  confidenceThreshold: number;
  inputWeightG: number | null;
  cookedWeightG: number | null;
  unquantifiedIngredientIds: string[];
  total: Record<NutrientKey, CalculatedNutrient>;
  perPortion: Record<NutrientKey, CalculatedNutrient>;
};

function round(value: number, precision = 3): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function convertQuantityToGrams(
  quantity: number,
  unit: RecipeUnit,
  conversion?: UnitConversion,
): QuantityConversionResult {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, reason: "not_quantifiable" };
  }

  if (unit === "g") return { ok: true, grams: quantity, confidence: 1 };
  if (unit === "kg") return { ok: true, grams: quantity * 1000, confidence: 1 };

  if (unit === "ml" || unit === "l") {
    if (!conversion?.densityGPerMl) {
      return { ok: false, reason: "density_required" };
    }
    const milliliters = unit === "l" ? quantity * 1000 : quantity;
    return {
      ok: true,
      grams: milliliters * conversion.densityGPerMl,
      confidence: conversion.confidence,
    };
  }

  if (unit === "to_taste") {
    return { ok: false, reason: "not_quantifiable" };
  }

  const gramsPerUnit = conversion?.unitWeightsG[unit];
  if (!gramsPerUnit) {
    return { ok: false, reason: "unit_weight_required" };
  }
  return {
    ok: true,
    grams: quantity * gramsPerUnit,
    confidence: conversion.confidence,
  };
}

export function calculateIngredientNutrition(input: IngredientNutritionInput): {
  grams: number | null;
  conversionConfidence: number;
  nutrients: Record<NutrientKey, { value: number | null; confidence: number }>;
} {
  const parsed = ingredientNutritionInputSchema.parse(input);
  const converted = convertQuantityToGrams(
    parsed.quantity,
    parsed.unit,
    parsed.conversion,
  );

  return {
    grams: converted.ok ? round(converted.grams) : null,
    conversionConfidence: converted.ok ? converted.confidence : 0,
    nutrients: Object.fromEntries(
      displayedNutrients.map((nutrient) => {
        const datum = parsed.nutrients[nutrient];
        if (!converted.ok || !datum || datum.valuePer100g === null) {
          return [nutrient, { value: null, confidence: 0 }];
        }
        return [
          nutrient,
          {
            value: round((datum.valuePer100g * converted.grams) / 100),
            confidence: round(datum.confidence * converted.confidence, 4),
          },
        ];
      }),
    ) as Record<NutrientKey, { value: number | null; confidence: number }>,
  };
}

export function calculateRecipeNutrition(
  input: RecipeNutritionInput,
): CalculatedRecipeNutrition {
  const parsed = recipeNutritionInputSchema.parse(input);
  const calculatedIngredients = parsed.ingredients.map((ingredient) => ({
    id: ingredient.ingredientId,
    ...calculateIngredientNutrition(ingredient),
  }));
  const unquantifiedIngredientIds = calculatedIngredients
    .filter((ingredient) => ingredient.grams === null)
    .map((ingredient) => ingredient.id);
  const inputWeightG =
    unquantifiedIngredientIds.length === 0
      ? round(
          calculatedIngredients.reduce(
            (sum, ingredient) => sum + (ingredient.grams ?? 0),
            0,
          ),
        )
      : null;

  const total = Object.fromEntries(
    displayedNutrients.map((nutrient) => {
      if (inputWeightG === null || inputWeightG === 0) {
        return [
          nutrient,
          { value: null, confidence: 0, status: "hidden" as const },
        ];
      }

      let value = 0;
      let confidenceMass = 0;
      for (const ingredient of calculatedIngredients) {
        const nutrientValue = ingredient.nutrients[nutrient];
        if (nutrientValue.value !== null && ingredient.grams !== null) {
          value += nutrientValue.value;
          confidenceMass += ingredient.grams * nutrientValue.confidence;
        }
      }

      const confidence = round(confidenceMass / inputWeightG, 4);
      const display = confidence >= parsed.confidenceThreshold;
      const retention = parsed.nutrientRetentionFactors[nutrient] ?? 1;
      return [
        nutrient,
        {
          value: display ? round(value * retention) : null,
          confidence,
          status: display ? ("displayed" as const) : ("hidden" as const),
        },
      ];
    }),
  ) as Record<NutrientKey, CalculatedNutrient>;

  const perPortion = Object.fromEntries(
    displayedNutrients.map((nutrient) => {
      const nutrientTotal = total[nutrient];
      return [
        nutrient,
        {
          ...nutrientTotal,
          value:
            nutrientTotal.value === null
              ? null
              : round(nutrientTotal.value / parsed.servings),
        },
      ];
    }),
  ) as Record<NutrientKey, CalculatedNutrient>;

  return {
    isEstimate: true,
    estimateLabel: "Valeurs nutritionnelles estimatives",
    canDisplay: displayedNutrients
      .slice(0, 4)
      .every((nutrient) => total[nutrient].status === "displayed"),
    confidenceThreshold: parsed.confidenceThreshold,
    inputWeightG,
    cookedWeightG:
      inputWeightG === null
        ? null
        : round(inputWeightG * parsed.cookingYieldFactor),
    unquantifiedIngredientIds,
    total,
    perPortion,
  };
}
