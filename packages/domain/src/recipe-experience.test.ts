import { describe, expect, it } from "vitest";

import {
  expandIngredientIds,
  scaleNutritionValue,
  scaleRecipeQuantity,
  swapAlternativeRequestSchema,
} from "./recipe-experience";

describe("recipe experience", () => {
  it("rescales recipe quantities without accumulating rounding errors", () => {
    expect(scaleRecipeQuantity(333.333, 3, 2)).toBe(222.222);
    expect(scaleRecipeQuantity(null, 3, 2)).toBeNull();
    expect(() => scaleRecipeQuantity(100, 2, 9)).toThrow();
  });

  it("recalculates total nutrition from per-portion values", () => {
    expect(scaleNutritionValue(412.55, 3)).toBe(1237.65);
  });

  it("rejects contradictory swap requests", () => {
    expect(
      swapAlternativeRequestSchema.safeParse({
        plannedMealId: "10000000-0000-4000-8000-000000000001",
        freeRequest: "Je veux une cuisson plus longue",
        preserve: {
          calories: false,
          protein: false,
          budget: false,
          duration: true,
        },
      }).success,
    ).toBe(false);
  });

  it("keeps dangerous parent ingredients excluded from alternatives", () => {
    expect(
      expandIngredientIds(
        ["sauce-au-vin"],
        [
          {
            childIngredientId: "sauce-au-vin",
            parentIngredientId: "vin",
          },
          { childIngredientId: "vin", parentIngredientId: "alcool" },
        ],
      ),
    ).toEqual(["sauce-au-vin", "vin", "alcool"]);
  });
});
