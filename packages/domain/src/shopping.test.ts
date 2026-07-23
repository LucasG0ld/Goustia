import { describe, expect, it } from "vitest";

import { aggregateShoppingItems, shoppingListToText } from "./shopping";

const id = (suffix: number) =>
  `10000000-0000-4000-8000-${String(suffix).padStart(12, "0")}`;

describe("shopping list aggregation", () => {
  it("scales portions and merges compatible mass units", () => {
    const result = aggregateShoppingItems([
      {
        ingredientId: "flour",
        label: "Farine",
        quantity: 500,
        unit: "g",
        recipeVersionId: id(1),
        recipeServings: 4,
        plannedServings: 2,
        familyCode: "cereals",
        densityGPerMl: null,
        gramsPerUnit: null,
      },
      {
        ingredientId: "flour",
        label: "Farine",
        quantity: 0.75,
        unit: "kg",
        recipeVersionId: id(2),
        recipeServings: 3,
        plannedServings: 3,
        familyCode: "cereals",
        densityGPerMl: null,
        gramsPerUnit: null,
      },
    ]);
    expect(result[0]).toMatchObject({ quantity: 1, unit: "kg" });
    expect(result[0]?.sourceRecipeVersionIds).toEqual([id(1), id(2)]);
  });

  it("uses reviewed conversions when dimensions become compatible", () => {
    const result = aggregateShoppingItems([
      {
        ingredientId: "milk",
        label: "Lait",
        quantity: 500,
        unit: "ml",
        recipeVersionId: id(1),
        recipeServings: 2,
        plannedServings: 4,
        familyCode: "dairy",
        densityGPerMl: 1.03,
        gramsPerUnit: null,
      },
      {
        ingredientId: "milk",
        label: "Lait",
        quantity: 103,
        unit: "g",
        recipeVersionId: id(2),
        recipeServings: 2,
        plannedServings: 2,
        familyCode: "dairy",
        densityGPerMl: null,
        gramsPerUnit: null,
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ quantity: 1.133, unit: "kg" });
  });

  it("never merges incompatible or unquantified units", () => {
    const base = {
      ingredientId: "garlic",
      label: "Ail",
      recipeVersionId: id(1),
      recipeServings: 2,
      plannedServings: 2,
      familyCode: "aromatics",
      densityGPerMl: null,
      gramsPerUnit: null,
    };
    const result = aggregateShoppingItems([
      { ...base, quantity: 2, unit: "clove" },
      { ...base, quantity: 1, unit: "bunch" },
      { ...base, quantity: null, unit: "to_taste" },
    ]);
    expect(result).toHaveLength(3);
  });

  it("rounds only after aggregation and produces a grouped export", () => {
    const result = aggregateShoppingItems(
      Array.from({ length: 3 }, (_, index) => ({
        ingredientId: "tomato",
        label: "Tomate",
        quantity: 0.3333,
        unit: "kg" as const,
        recipeVersionId: id(index + 1),
        recipeServings: 1,
        plannedServings: 1,
        familyCode: "vegetables",
        densityGPerMl: null,
        gramsPerUnit: null,
      })),
    );
    expect(result[0]).toMatchObject({ quantity: 999.9, unit: "g" });
    expect(shoppingListToText(result)).toContain("Fruits et légumes");
  });

  it.each([
    [250, "g", 2, 4, 500, "g"],
    [1.5, "l", 4, 2, 750, "ml"],
    [3, "piece", 2, 4, 6, "piece"],
    [2, "tablespoon", 4, 1, 0.5, "tablespoon"],
    [1, "kg", 8, 2, 250, "g"],
  ] as const)(
    "rescales %s %s from %s to %s portions without early rounding",
    (
      quantity,
      unit,
      recipeServings,
      plannedServings,
      expectedQuantity,
      expectedUnit,
    ) => {
      const result = aggregateShoppingItems([
        {
          ingredientId: "ingredient",
          label: "Ingrédient",
          quantity,
          unit,
          recipeVersionId: id(1),
          recipeServings,
          plannedServings,
          familyCode: null,
          densityGPerMl: null,
          gramsPerUnit: null,
        },
      ]);
      expect(result[0]).toMatchObject({
        quantity: expectedQuantity,
        unit: expectedUnit,
      });
    },
  );

  it("deduplicates provenance while keeping deterministic aisle ordering", () => {
    const result = aggregateShoppingItems([
      {
        ingredientId: "rice",
        label: "Riz",
        quantity: 100,
        unit: "g",
        recipeVersionId: id(1),
        recipeServings: 2,
        plannedServings: 2,
        familyCode: "cereals",
        densityGPerMl: null,
        gramsPerUnit: null,
      },
      {
        ingredientId: "rice",
        label: "Riz",
        quantity: 50,
        unit: "g",
        recipeVersionId: id(1),
        recipeServings: 2,
        plannedServings: 2,
        familyCode: "cereals",
        densityGPerMl: null,
        gramsPerUnit: null,
      },
    ]);
    expect(result[0]).toMatchObject({
      aisle: "Épicerie",
      quantity: 150,
      sourceRecipeVersionIds: [id(1)],
    });
  });
});
