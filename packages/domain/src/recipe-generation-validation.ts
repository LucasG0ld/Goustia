import {
  generatedRecipeSchema,
  type GeneratedRecipe,
} from "./recipe-generation-contract";

export type RecipeConsistencyReport = {
  valid: boolean;
  issues: string[];
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function validateGeneratedRecipeConsistency(
  rawRecipe: GeneratedRecipe,
): RecipeConsistencyReport {
  const recipe = generatedRecipeSchema.parse(rawRecipe);
  const referenced = new Set(
    recipe.steps.flatMap((step) => step.ingredientPositions),
  );
  const issues: string[] = [];

  recipe.ingredients.forEach((ingredient, index) => {
    if (!ingredient.optional && !referenced.has(index + 1)) {
      issues.push(`ingredient_non_utilise:${index + 1}`);
    }
  });
  if (recipe.preparationMinutes + recipe.cookingMinutes === 0) {
    issues.push("duree_totale_nulle");
  }
  if (recipe.steps.some((step, index) => step.position !== index + 1)) {
    issues.push("positions_etapes_non_sequentielles");
  }

  return { valid: issues.length === 0, issues };
}

export function recipeDeduplicationSignature(recipe: GeneratedRecipe): string {
  const parsed = generatedRecipeSchema.parse(recipe);
  return JSON.stringify({
    title: normalize(parsed.titleFr),
    servings: parsed.servings,
    ingredients: parsed.ingredients
      .map((ingredient) => ({
        id:
          ingredient.canonicalIngredientId ??
          normalize(ingredient.sourceNameFr),
        quantity: Math.round(ingredient.quantity * 1000) / 1000,
        unit: ingredient.unit,
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
  });
}

export function canonicalRecipeSlug(
  recipe: GeneratedRecipe,
  hash: string,
): string {
  const base = normalize(recipe.titleFr).replaceAll(" ", "-").slice(0, 70);
  return `${base || "recette"}-${hash.slice(0, 10)}`;
}
