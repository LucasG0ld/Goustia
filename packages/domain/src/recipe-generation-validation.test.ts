import { describe, expect, it } from "vitest";

import {
  generatedRecipeSchema,
  validGeneratedRecipeExample,
} from "./recipe-generation-contract";
import {
  canonicalRecipeSlug,
  recipeDeduplicationSignature,
  validateGeneratedRecipeConsistency,
} from "./recipe-generation-validation";

describe("validation et déduplication des recettes générées", () => {
  const validRecipe = generatedRecipeSchema.parse(validGeneratedRecipeExample);

  it("valide la cohérence ingrédients/étapes", () => {
    expect(validateGeneratedRecipeConsistency(validRecipe)).toEqual({
      valid: true,
      issues: [],
    });
  });

  it("rejette un ingrédient obligatoire inutilisé", () => {
    const recipe = structuredClone(validRecipe);
    recipe.steps = recipe.steps.map((step) => ({
      ...step,
      ingredientPositions: [1],
    }));
    expect(validateGeneratedRecipeConsistency(recipe)).toEqual({
      valid: false,
      issues: ["ingredient_non_utilise:2"],
    });
  });

  it("produit une signature stable indépendante de l'ordre des ingrédients", () => {
    const reversed = {
      ...structuredClone(validRecipe),
      ingredients: [...validRecipe.ingredients].reverse(),
    };
    expect(recipeDeduplicationSignature(reversed)).toBe(
      recipeDeduplicationSignature(validRecipe),
    );
    expect(canonicalRecipeSlug(validRecipe, "a".repeat(64))).toBe(
      "tofu-roti-a-la-tomate-aaaaaaaaaa",
    );
  });
});
