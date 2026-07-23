import "server-only";

import {
  canReceiveAlcoholRecipes,
  expandIngredientIds,
} from "@recettes/domain";

import { createClient } from "@/lib/supabase/server";

export type RecipeDetail = {
  recipeId: string;
  versionId: string;
  title: string;
  description: string;
  servings: number;
  preparationMinutes: number;
  cookingMinutes: number;
  restingMinutes: number;
  difficulty: string;
  costLevel: string | null;
  estimatedCostEur: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  tips: string[];
  variants: string[];
  storageInstructions: string | null;
  reheatingInstructions: string | null;
  ingredients: {
    id: string;
    ingredientId: string;
    name: string;
    quantity: number | null;
    unit: string | null;
    note: string | null;
    optional: boolean;
  }[];
  steps: {
    position: number;
    instruction: string;
    timerSeconds: number | null;
  }[];
  nutrition: {
    caloriesKcal: number;
    proteinG: number;
    carbohydratesG: number;
    fatG: number;
    fiberG: number | null;
    saltG: number | null;
  } | null;
  allergens: string[];
  equipment: string[];
  substitutions: string[];
  interaction: {
    reaction: "like" | "dislike" | null;
    favorite: boolean;
  };
};

export type RecipeDetailResult =
  | { status: "ready"; recipe: RecipeDetail }
  | { status: "not_found" | "withdrawn" | "incompatible" };

export async function getRecipeDetail(
  userId: string,
  recipeId: string,
): Promise<RecipeDetailResult> {
  const supabase = await createClient();
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .maybeSingle();
  if (recipeError || !recipe) return { status: "not_found" };

  const { data: version, error: versionError } = await supabase
    .from("recipe_versions")
    .select(
      "id,title,description,servings,preparation_minutes,cooking_minutes,resting_minutes,difficulty,cost_level,estimated_cost_eur,publication_status,tips,variants,storage_instructions,reheating_instructions",
    )
    .eq("recipe_id", recipeId)
    .eq("validation_status", "validated")
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionError || !version) return { status: "withdrawn" };
  if (version.publication_status === "archived") return { status: "withdrawn" };

  const [
    ingredientsResult,
    stepsResult,
    nutritionResult,
    imageResult,
    constraintsResult,
    profileResult,
    reactionResult,
    favoriteResult,
    equipmentResult,
    substitutionsResult,
    taxonomyResult,
    relationResult,
  ] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select(
        "id,ingredient_id,position,quantity,unit,preparation_note,optional,ingredients(name_fr,contains_alcohol,ingredient_allergens(allergen_id,allergens(name_fr)))",
      )
      .eq("recipe_version_id", version.id)
      .order("position"),
    supabase
      .from("recipe_steps")
      .select("position,instruction,timer_seconds")
      .eq("recipe_version_id", version.id)
      .order("position"),
    supabase
      .from("recipe_nutrition")
      .select("calories_kcal,protein_g,carbohydrates_g,fat_g,fiber_g,salt_g")
      .eq("recipe_version_id", version.id)
      .maybeSingle(),
    supabase
      .from("recipe_images")
      .select("storage_bucket,storage_path,alt_text")
      .eq("recipe_version_id", version.id)
      .eq("is_primary", true)
      .eq("status", "ready")
      .maybeSingle(),
    supabase
      .from("user_food_constraints")
      .select("ingredient_id,allergen_id,kind,is_absolute")
      .eq("user_id", userId),
    supabase.from("profiles").select("birth_date").eq("id", userId).single(),
    supabase
      .from("recipe_reactions")
      .select("reaction")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .maybeSingle(),
    supabase
      .from("favorite_recipes")
      .select("recipe_id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .maybeSingle(),
    supabase
      .from("recipe_equipment_requirements")
      .select("equipment(name_fr),optional")
      .eq("recipe_version_id", version.id),
    supabase
      .from("recipe_substitutions")
      .select(
        "note,ingredients!recipe_substitutions_substitute_ingredient_id_fkey(name_fr)",
      )
      .eq("recipe_version_id", version.id),
    supabase
      .from("ingredients")
      .select("id,contains_alcohol,ingredient_allergens(allergen_id)"),
    supabase
      .from("ingredient_relations")
      .select("child_ingredient_id,parent_ingredient_id"),
  ]);
  if (
    ingredientsResult.error ||
    stepsResult.error ||
    nutritionResult.error ||
    imageResult.error ||
    constraintsResult.error ||
    profileResult.error ||
    reactionResult.error ||
    favoriteResult.error ||
    equipmentResult.error ||
    substitutionsResult.error ||
    taxonomyResult.error ||
    relationResult.error
  ) {
    throw new Error("RECIPE_DETAIL_READ_FAILED");
  }

  const strictIngredientIds = new Set(
    constraintsResult.data
      .filter((item) => item.is_absolute)
      .flatMap((item) => (item.ingredient_id ? [item.ingredient_id] : [])),
  );
  const strictAllergenIds = new Set(
    constraintsResult.data
      .filter((item) => item.is_absolute)
      .flatMap((item) => (item.allergen_id ? [item.allergen_id] : [])),
  );
  const relatedIngredientsByRecipeRow = ingredientsResult.data.map((item) => {
    const ids = expandIngredientIds(
      [item.ingredient_id],
      relationResult.data.map((relation) => ({
        childIngredientId: relation.child_ingredient_id,
        parentIngredientId: relation.parent_ingredient_id,
      })),
    );
    return taxonomyResult.data.filter((ingredient) =>
      ids.includes(ingredient.id),
    );
  });
  const containsBlockedIngredient = relatedIngredientsByRecipeRow.some(
    (ingredients) =>
      ingredients.some((ingredient) => strictIngredientIds.has(ingredient.id)),
  );
  const containsBlockedAllergen = relatedIngredientsByRecipeRow.some(
    (ingredients) =>
      ingredients.some((ingredient) =>
        ingredient.ingredient_allergens.some((entry) =>
          strictAllergenIds.has(entry.allergen_id),
        ),
      ),
  );
  const containsAlcohol = relatedIngredientsByRecipeRow.some((ingredients) =>
    ingredients.some((ingredient) => ingredient.contains_alcohol),
  );
  const alcoholAllowed = canReceiveAlcoholRecipes(
    new Date(`${profileResult.data.birth_date}T00:00:00Z`),
  );
  if (
    containsBlockedIngredient ||
    containsBlockedAllergen ||
    (containsAlcohol && !alcoholAllowed)
  ) {
    return { status: "incompatible" };
  }

  let imageUrl: string | null = null;
  if (imageResult.data?.storage_path) {
    const { data } = await supabase.storage
      .from(imageResult.data.storage_bucket)
      .createSignedUrl(imageResult.data.storage_path, 3600);
    imageUrl = data?.signedUrl ?? null;
  }
  const nutrition = nutritionResult.data;
  return {
    status: "ready",
    recipe: {
      recipeId,
      versionId: version.id,
      title: version.title,
      description: version.description,
      servings: version.servings,
      preparationMinutes: version.preparation_minutes,
      cookingMinutes: version.cooking_minutes,
      restingMinutes: version.resting_minutes,
      difficulty: version.difficulty,
      costLevel: version.cost_level,
      estimatedCostEur: version.estimated_cost_eur,
      imageUrl,
      imageAlt: imageResult.data?.alt_text ?? null,
      tips: version.tips,
      variants: version.variants,
      storageInstructions: version.storage_instructions,
      reheatingInstructions: version.reheating_instructions,
      ingredients: ingredientsResult.data.map((item) => ({
        id: item.id,
        ingredientId: item.ingredient_id,
        name: item.ingredients[0]?.name_fr ?? "Ingrédient",
        quantity: item.quantity,
        unit: item.unit,
        note: item.preparation_note,
        optional: item.optional,
      })),
      steps: stepsResult.data.map((step) => ({
        position: step.position,
        instruction: step.instruction,
        timerSeconds: step.timer_seconds,
      })),
      nutrition: nutrition
        ? {
            caloriesKcal: nutrition.calories_kcal,
            proteinG: nutrition.protein_g,
            carbohydratesG: nutrition.carbohydrates_g,
            fatG: nutrition.fat_g,
            fiberG: nutrition.fiber_g,
            saltG: nutrition.salt_g,
          }
        : null,
      allergens: [
        ...new Set(
          ingredientsResult.data.flatMap((item) =>
            (item.ingredients[0]?.ingredient_allergens ?? []).flatMap(
              (entry) => entry.allergens[0]?.name_fr ?? [],
            ),
          ),
        ),
      ],
      equipment: equipmentResult.data.map(
        (item) =>
          `${item.equipment[0]?.name_fr ?? "Matériel"}${
            item.optional ? " (facultatif)" : ""
          }`,
      ),
      substitutions: substitutionsResult.data.map(
        (item) =>
          `${item.ingredients[0]?.name_fr ?? "Alternative"}${
            item.note ? ` — ${item.note}` : ""
          }`,
      ),
      interaction: {
        reaction: reactionResult.data?.reaction ?? null,
        favorite: Boolean(favoriteResult.data),
      },
    },
  };
}
