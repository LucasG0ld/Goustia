import { describe, expect, it } from "vitest";

import {
  assertRecipeSafeForDisplay,
  assertRecipeSafeForStorage,
  checkFoodSafety,
  FoodSafetyValidationError,
} from "./food-safety";

const taxonomy = {
  ingredients: [
    {
      id: "peanut",
      nameFr: "Cacahuète",
      synonyms: ["Arachide"],
      familyIds: ["nuts"],
      derivedFromIds: [],
      allergens: [{ code: "peanuts", relation: "contains" as const }],
      containsAlcohol: false,
    },
    {
      id: "peanut-butter",
      nameFr: "Beurre de cacahuète",
      synonyms: ["Pâte d’arachide"],
      familyIds: ["nuts"],
      derivedFromIds: ["peanut"],
      allergens: [{ code: "peanuts", relation: "derived_from" as const }],
      containsAlcohol: false,
    },
    {
      id: "milk",
      nameFr: "Lait",
      synonyms: ["Lait de vache"],
      familyIds: ["dairy"],
      derivedFromIds: [],
      allergens: [{ code: "milk", relation: "contains" as const }],
      containsAlcohol: false,
    },
    {
      id: "wine",
      nameFr: "Vin blanc",
      synonyms: ["Vin de cuisine"],
      familyIds: ["alcoholic-drinks"],
      derivedFromIds: [],
      allergens: [],
      containsAlcohol: true,
    },
    {
      id: "wine-sauce",
      nameFr: "Sauce au vin",
      synonyms: [],
      familyIds: ["sauces"],
      derivedFromIds: ["wine"],
      allergens: [],
      containsAlcohol: false,
    },
    {
      id: "tomato",
      nameFr: "Tomate",
      synonyms: ["Tomates"],
      familyIds: ["vegetables"],
      derivedFromIds: [],
      allergens: [],
      containsAlcohol: false,
    },
  ],
};

const safeProfile = {
  alcoholAllowed: true,
  strictIngredientIds: [],
  strictFamilyIds: [],
  allergyCodes: [],
  strictIntoleranceIngredientIds: [],
  negativePreferenceIngredientIds: [],
};

describe("moteur de sécurité alimentaire", () => {
  it("normalise les synonymes français", () => {
    const report = checkFoodSafety({
      recipeIngredients: [{ sourceName: "  ARACHIDE " }],
      profile: safeProfile,
      taxonomy,
    });
    expect(report.status).toBe("safe");
    expect(report.normalizedIngredients[0]?.canonicalIngredientId).toBe(
      "peanut",
    );
  });

  it("bloque un ingrédient strictement exclu", () => {
    const report = checkFoodSafety({
      recipeIngredients: [{ sourceName: "Tomate" }],
      profile: { ...safeProfile, strictIngredientIds: ["tomato"] },
      taxonomy,
    });
    expect(report.status).toBe("blocked");
    expect(report.findings[0]?.kind).toBe("strict_exclusion");
  });

  it("traverse les dérivés connus", () => {
    const report = checkFoodSafety({
      recipeIngredients: [{ sourceName: "Beurre de cacahuète" }],
      profile: { ...safeProfile, strictIngredientIds: ["peanut"] },
      taxonomy,
    });
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "strict_exclusion",
          relationPath: ["peanut-butter", "peanut"],
        }),
      ]),
    );
  });

  it("détecte plusieurs allergies directes et indirectes", () => {
    const report = checkFoodSafety({
      recipeIngredients: [
        { sourceName: "Pâte d’arachide" },
        { sourceName: "Lait" },
      ],
      profile: { ...safeProfile, allergyCodes: ["peanuts", "milk"] },
      taxonomy,
    });
    expect(
      report.findings.filter((item) => item.kind === "allergen"),
    ).toHaveLength(2);
  });

  it("bloque une trace déclarée d’allergène", () => {
    const report = checkFoodSafety({
      recipeIngredients: [
        {
          sourceName: "Tomate",
          mayContainAllergenCodes: ["peanuts"],
        },
      ],
      profile: { ...safeProfile, allergyCodes: ["peanuts"] },
      taxonomy,
    });
    expect(report.findings[0]?.kind).toBe("allergen_trace");
    expect(report.status).toBe("blocked");
  });

  it("détecte l’alcool caché dans un dérivé pour un mineur", () => {
    const report = checkFoodSafety({
      recipeIngredients: [{ sourceName: "Sauce au vin" }],
      profile: { ...safeProfile, alcoholAllowed: false },
      taxonomy,
    });
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "alcohol",
          relationPath: ["wine-sauce", "wine"],
        }),
      ]),
    );
  });

  it("bloque les ingrédients inconnus ou ambigus", () => {
    const unknown = checkFoodSafety({
      recipeIngredients: [{ sourceName: "Poudre mystérieuse" }],
      profile: safeProfile,
      taxonomy,
    });
    expect(unknown.findings[0]?.kind).toBe("unknown_ingredient");

    const ambiguousTaxonomy = {
      ingredients: [
        ...taxonomy.ingredients,
        {
          ...taxonomy.ingredients[5],
          id: "tomato-variety",
          nameFr: "Tomate ancienne",
          synonyms: ["Tomate"],
        },
      ],
    };
    const ambiguous = checkFoodSafety({
      recipeIngredients: [{ sourceName: "Tomate" }],
      profile: safeProfile,
      taxonomy: ambiguousTaxonomy,
    });
    expect(ambiguous.findings[0]?.kind).toBe("ambiguous_ingredient");
  });

  it("ne transforme jamais une préférence négative en blocage", () => {
    const report = checkFoodSafety({
      recipeIngredients: [{ sourceName: "Tomate" }],
      profile: {
        ...safeProfile,
        negativePreferenceIngredientIds: ["tomato"],
      },
      taxonomy,
    });
    expect(report.status).toBe("safe");
    expect(report.findings[0]).toMatchObject({
      kind: "negative_preference",
      severity: "warning",
    });
  });

  it("bloque aux deux frontières stockage et affichage", () => {
    const unsafeInput = {
      recipeIngredients: [{ sourceName: "Vin de cuisine" }],
      profile: { ...safeProfile, alcoholAllowed: false },
      taxonomy,
    };
    expect(() => assertRecipeSafeForStorage(unsafeInput)).toThrow(
      FoodSafetyValidationError,
    );
    expect(() => assertRecipeSafeForDisplay(unsafeInput)).toThrow(
      /avant affichage/,
    );
  });

  it("autorise une recette entièrement résolue et compatible", () => {
    expect(
      assertRecipeSafeForStorage({
        recipeIngredients: [{ sourceName: "Tomates" }],
        profile: safeProfile,
        taxonomy,
      }).status,
    ).toBe("safe");
  });
});
