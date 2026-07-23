import "server-only";

import {
  canReceiveAlcoholRecipes,
  expandIngredientIds,
  type SwapPreservation,
} from "@recettes/domain";

import { createClient } from "@/lib/supabase/server";

export type SwapAlternative = {
  recipeVersionId: string;
  recipeId: string;
  title: string;
  explanation: string;
};

export async function getSafeSwapAlternatives({
  userId,
  plannedMealId,
  freeRequest,
  preserve,
}: {
  userId: string;
  plannedMealId: string;
  freeRequest: string | null;
  preserve: SwapPreservation;
}): Promise<{
  currentVersionId: string;
  alternatives: SwapAlternative[];
}> {
  const supabase = await createClient();
  const { data: meal, error: mealError } = await supabase
    .from("planned_meals")
    .select("recipe_version_id")
    .eq("id", plannedMealId)
    .eq("user_id", userId)
    .single();
  if (mealError || !meal.recipe_version_id) {
    throw new Error("PLANNED_MEAL_NOT_FOUND");
  }

  const [
    { data: current },
    { data: candidates },
    constraints,
    profile,
    taxonomy,
    relationResult,
  ] = await Promise.all([
    supabase
      .from("recipe_versions")
      .select(
        "id,preparation_minutes,cooking_minutes,cost_level,recipe_nutrition(calories_kcal,protein_g)",
      )
      .eq("id", meal.recipe_version_id)
      .single(),
    supabase
      .from("recipe_versions")
      .select(
        "id,recipe_id,title,preparation_minutes,cooking_minutes,cost_level,recipe_nutrition(calories_kcal,protein_g)",
      )
      .eq("validation_status", "validated")
      .neq("publication_status", "archived")
      .neq("id", meal.recipe_version_id)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("user_food_constraints")
      .select("ingredient_id,allergen_id,is_absolute")
      .eq("user_id", userId),
    supabase.from("profiles").select("birth_date").eq("id", userId).single(),
    supabase
      .from("ingredients")
      .select("id,contains_alcohol,ingredient_allergens(allergen_id)"),
    supabase
      .from("ingredient_relations")
      .select("child_ingredient_id,parent_ingredient_id"),
  ]);
  if (
    !current ||
    !candidates ||
    constraints.error ||
    profile.error ||
    taxonomy.error ||
    relationResult.error
  ) {
    throw new Error("SWAP_CANDIDATES_READ_FAILED");
  }

  const candidateIds = candidates.map((candidate) => candidate.id);
  const { data: ingredientRows, error: ingredientError } = await supabase
    .from("recipe_ingredients")
    .select("recipe_version_id,ingredient_id")
    .in("recipe_version_id", candidateIds);
  if (ingredientError) throw new Error("SWAP_SAFETY_READ_FAILED");

  const blockedIngredients = new Set(
    constraints.data
      .filter((item) => item.is_absolute && item.ingredient_id)
      .map((item) => item.ingredient_id!),
  );
  const blockedAllergens = new Set(
    constraints.data
      .filter((item) => item.is_absolute && item.allergen_id)
      .map((item) => item.allergen_id!),
  );
  const alcoholAllowed = canReceiveAlcoholRecipes(
    new Date(`${profile.data.birth_date}T00:00:00Z`),
  );
  const currentNutrition = current.recipe_nutrition[0];
  const currentDuration = current.preparation_minutes + current.cooking_minutes;
  const request = freeRequest?.toLocaleLowerCase("fr-FR") ?? "";

  const alternatives = candidates
    .filter((candidate) => {
      const ingredients = ingredientRows.filter(
        (row) => row.recipe_version_id === candidate.id,
      );
      if (
        ingredients.some((row) => {
          const relatedIds = expandIngredientIds(
            [row.ingredient_id],
            relationResult.data.map((relation) => ({
              childIngredientId: relation.child_ingredient_id,
              parentIngredientId: relation.parent_ingredient_id,
            })),
          );
          const relatedIngredients = taxonomy.data.filter((ingredient) =>
            relatedIds.includes(ingredient.id),
          );
          return (
            relatedIds.some((id) => blockedIngredients.has(id)) ||
            (!alcoholAllowed &&
              relatedIngredients.some(
                (ingredient) => ingredient.contains_alcohol,
              )) ||
            relatedIngredients.some((ingredient) =>
              ingredient.ingredient_allergens.some((allergen) =>
                blockedAllergens.has(allergen.allergen_id),
              ),
            )
          );
        })
      ) {
        return false;
      }
      const nutrition = candidate.recipe_nutrition[0];
      if (
        preserve.calories &&
        currentNutrition &&
        nutrition &&
        Math.abs(nutrition.calories_kcal - currentNutrition.calories_kcal) >
          Math.max(50, currentNutrition.calories_kcal * 0.15)
      ) {
        return false;
      }
      if (
        preserve.protein &&
        currentNutrition &&
        nutrition &&
        Math.abs(nutrition.protein_g - currentNutrition.protein_g) >
          Math.max(5, currentNutrition.protein_g * 0.2)
      ) {
        return false;
      }
      if (preserve.budget && candidate.cost_level !== current.cost_level) {
        return false;
      }
      const duration =
        candidate.preparation_minutes + candidate.cooking_minutes;
      if (
        preserve.duration &&
        Math.abs(duration - currentDuration) >
          Math.max(10, currentDuration * 0.25)
      ) {
        return false;
      }
      if (/rapide|vite|express/.test(request) && duration > currentDuration) {
        return false;
      }
      if (
        /économ|econom|moins cher/.test(request) &&
        candidate.cost_level !== "low"
      ) {
        return false;
      }
      return true;
    })
    .slice(0, 3)
    .map((candidate) => ({
      recipeVersionId: candidate.id,
      recipeId: candidate.recipe_id,
      title: candidate.title,
      explanation:
        [
          preserve.calories ? "calories proches" : null,
          preserve.protein ? "protéines proches" : null,
          preserve.budget ? "budget préservé" : null,
          preserve.duration ? "durée proche" : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Alternative compatible avec tes contraintes.",
    }));

  return { currentVersionId: meal.recipe_version_id, alternatives };
}
