import { describe, expect, it } from "vitest";

import {
  calculateIngredientNutrition,
  calculateRecipeNutrition,
  convertQuantityToGrams,
  nutrientDatumSchema,
} from "./nutrition";

const completeNutrients = {
  energyKcal: { valuePer100g: 100, status: "exact" as const, confidence: 1 },
  proteinG: { valuePer100g: 10, status: "exact" as const, confidence: 1 },
  carbohydratesG: {
    valuePer100g: 20,
    status: "exact" as const,
    confidence: 1,
  },
  fatG: { valuePer100g: 5, status: "exact" as const, confidence: 1 },
  fiberG: { valuePer100g: 3, status: "exact" as const, confidence: 1 },
  saltG: { valuePer100g: 0.5, status: "exact" as const, confidence: 1 },
};

describe("conversions nutritionnelles", () => {
  it("convertit les unités de masse sans table externe", () => {
    expect(convertQuantityToGrams(1.25, "kg")).toEqual({
      ok: true,
      grams: 1250,
      confidence: 1,
    });
  });

  it("exige une densité explicite pour les volumes", () => {
    expect(convertQuantityToGrams(250, "ml")).toEqual({
      ok: false,
      reason: "density_required",
    });
    expect(
      convertQuantityToGrams(250, "ml", {
        densityGPerMl: 1.03,
        unitWeightsG: {},
        confidence: 0.95,
        source: "Mesure fournisseur",
      }),
    ).toEqual({ ok: true, grams: 257.5, confidence: 0.95 });
  });

  it("exige un poids unitaire explicite pour les pièces", () => {
    expect(convertQuantityToGrams(2, "piece")).toEqual({
      ok: false,
      reason: "unit_weight_required",
    });
    expect(
      convertQuantityToGrams(2, "piece", {
        unitWeightsG: { piece: 60 },
        confidence: 0.9,
        source: "Pesée éditoriale",
      }),
    ).toEqual({ ok: true, grams: 120, confidence: 0.9 });
  });

  it("ne quantifie jamais une quantité au goût", () => {
    expect(convertQuantityToGrams(1, "to_taste")).toEqual({
      ok: false,
      reason: "not_quantifiable",
    });
  });
});

describe("calcul nutritionnel", () => {
  it("calcule une contribution proportionnelle par ingrédient", () => {
    const result = calculateIngredientNutrition({
      ingredientId: "tofu",
      quantity: 250,
      unit: "g",
      nutrients: completeNutrients,
    });
    expect(result.grams).toBe(250);
    expect(result.nutrients.energyKcal.value).toBe(250);
    expect(result.nutrients.proteinG.value).toBe(25);
  });

  it("calcule les totaux et les valeurs par portion", () => {
    const result = calculateRecipeNutrition({
      servings: 2,
      ingredients: [
        {
          ingredientId: "a",
          quantity: 100,
          unit: "g",
          nutrients: completeNutrients,
        },
        {
          ingredientId: "b",
          quantity: 200,
          unit: "g",
          nutrients: completeNutrients,
        },
      ],
    });
    expect(result.total.energyKcal.value).toBe(300);
    expect(result.perPortion.energyKcal.value).toBe(150);
    expect(result.canDisplay).toBe(true);
    expect(result.estimateLabel).toContain("estimatives");
  });

  it("applique uniquement les facteurs de rétention explicitement fournis", () => {
    const result = calculateRecipeNutrition({
      servings: 1,
      ingredients: [
        {
          ingredientId: "a",
          quantity: 100,
          unit: "g",
          nutrients: completeNutrients,
        },
      ],
      cookingYieldFactor: 0.8,
      nutrientRetentionFactors: { proteinG: 0.9 },
    });
    expect(result.inputWeightG).toBe(100);
    expect(result.cookedWeightG).toBe(80);
    expect(result.total.proteinG.value).toBe(9);
    expect(result.total.energyKcal.value).toBe(100);
  });

  it("masque un nutriment sous le seuil de confiance", () => {
    const result = calculateRecipeNutrition({
      servings: 1,
      ingredients: [
        {
          ingredientId: "known",
          quantity: 70,
          unit: "g",
          nutrients: completeNutrients,
        },
        {
          ingredientId: "missing",
          quantity: 30,
          unit: "g",
          nutrients: {},
        },
      ],
    });
    expect(result.total.energyKcal).toEqual({
      value: null,
      confidence: 0.7,
      status: "hidden",
    });
    expect(result.canDisplay).toBe(false);
  });

  it("masque tout calcul contenant une quantité non convertible", () => {
    const result = calculateRecipeNutrition({
      servings: 1,
      ingredients: [
        {
          ingredientId: "unknown-piece",
          quantity: 1,
          unit: "piece",
          nutrients: completeNutrients,
        },
      ],
    });
    expect(result.inputWeightG).toBeNull();
    expect(result.unquantifiedIngredientIds).toEqual(["unknown-piece"]);
    expect(result.total.energyKcal.value).toBeNull();
  });

  it("refuse de transformer une trace ou une absence en zéro", () => {
    expect(
      nutrientDatumSchema.safeParse({
        valuePer100g: 0,
        status: "trace",
        confidence: 1,
      }).success,
    ).toBe(false);
    expect(
      nutrientDatumSchema.parse({
        valuePer100g: null,
        status: "trace",
        confidence: 1,
      }),
    ).toBeTruthy();
  });

  it("gère les arrondis numériques de manière stable", () => {
    const result = calculateRecipeNutrition({
      servings: 3,
      ingredients: [
        {
          ingredientId: "a",
          quantity: 33.333,
          unit: "g",
          nutrients: completeNutrients,
        },
      ],
    });
    expect(result.total.energyKcal.value).toBe(33.333);
    expect(result.perPortion.energyKcal.value).toBe(11.111);
  });
});
