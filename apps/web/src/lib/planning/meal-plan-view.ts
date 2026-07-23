import "server-only";

import { createClient } from "@/lib/supabase/server";

export type MealPlanRecipeView = {
  recipeId: string;
  recipeVersionId: string;
  title: string;
  description: string;
  durationMinutes: number;
  difficulty: string;
  servings: number;
  caloriesKcal: number | null;
  proteinG: number | null;
  carbohydratesG: number | null;
  fatG: number | null;
  tags: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  recommendationExplanation: string;
};

export type PlannedMealView = {
  id: string;
  mealDate: string;
  mealType: "lunch" | "dinner";
  servings: number;
  isLocked: boolean;
  revision: number;
  recipe: MealPlanRecipeView | null;
};

export type MealPlanView = {
  id: string;
  weekStart: string;
  status: "draft" | "generating" | "ready" | "archived";
  revision: number;
  meals: PlannedMealView[];
};

const shortExplanation = (recipe: {
  preparation_minutes: number;
  cooking_minutes: number;
  cost_level: string | null;
}) => {
  const duration = recipe.preparation_minutes + recipe.cooking_minutes;
  if (duration <= 30)
    return `Prête en ${duration} min et compatible avec ton profil.`;
  if (recipe.cost_level === "low") {
    return "Une option économique qui varie les repas de la semaine.";
  }
  return "Compatible avec ton profil et choisie pour varier la semaine.";
};

export async function getActiveMealPlanView(
  userId: string,
): Promise<MealPlanView | null> {
  const supabase = await createClient();
  const { data: plan, error: planError } = await supabase
    .from("meal_plans")
    .select("id,week_start,status,revision")
    .eq("user_id", userId)
    .in("status", ["draft", "generating", "ready"])
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (planError) throw new Error("MEAL_PLAN_READ_FAILED", { cause: planError });
  if (!plan) return null;

  const { data: meals, error: mealsError } = await supabase
    .from("planned_meals")
    .select(
      "id,meal_date,meal_type,servings,is_locked,revision,recipe_version_id",
    )
    .eq("meal_plan_id", plan.id)
    .order("meal_date")
    .order("meal_type");
  if (mealsError) {
    throw new Error("PLANNED_MEALS_READ_FAILED", { cause: mealsError });
  }
  const versionIds = meals
    .map(({ recipe_version_id }) => recipe_version_id)
    .filter((id): id is string => Boolean(id));
  const { data: versions, error: versionsError } = versionIds.length
    ? await supabase
        .from("recipe_versions")
        .select(
          "id,recipe_id,title,description,servings,preparation_minutes,cooking_minutes,difficulty,cost_level",
        )
        .in("id", versionIds)
    : { data: [], error: null };
  if (versionsError) {
    throw new Error("RECIPE_VERSIONS_READ_FAILED", { cause: versionsError });
  }
  const recipeIds = versions.map(({ recipe_id }) => recipe_id);
  const [nutritionResult, imagesResult, tagAssignmentsResult] =
    await Promise.all([
      versionIds.length
        ? supabase
            .from("recipe_nutrition")
            .select(
              "recipe_version_id,calories_kcal,protein_g,carbohydrates_g,fat_g",
            )
            .in("recipe_version_id", versionIds)
        : Promise.resolve({ data: [], error: null }),
      versionIds.length
        ? supabase
            .from("recipe_images")
            .select("recipe_version_id,storage_bucket,storage_path,alt_text")
            .in("recipe_version_id", versionIds)
            .eq("is_primary", true)
            .eq("status", "ready")
        : Promise.resolve({ data: [], error: null }),
      recipeIds.length
        ? supabase
            .from("recipe_tag_assignments")
            .select("recipe_id,recipe_tags(name_fr)")
            .in("recipe_id", recipeIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
  if (
    nutritionResult.error ||
    imagesResult.error ||
    tagAssignmentsResult.error
  ) {
    throw new Error("MEAL_PLAN_DETAILS_READ_FAILED");
  }

  const recipeByVersion = new Map<string, MealPlanRecipeView>();
  for (const version of versions) {
    const nutrition = nutritionResult.data.find(
      ({ recipe_version_id }) => recipe_version_id === version.id,
    );
    const image = imagesResult.data.find(
      ({ recipe_version_id }) => recipe_version_id === version.id,
    );
    let imageUrl: string | null = null;
    if (image?.storage_path) {
      const { data } = await supabase.storage
        .from(image.storage_bucket)
        .createSignedUrl(image.storage_path, 3600);
      imageUrl = data?.signedUrl ?? null;
    }
    const tags = tagAssignmentsResult.data
      .filter(({ recipe_id }) => recipe_id === version.recipe_id)
      .flatMap(({ recipe_tags }) =>
        recipe_tags.flatMap((tag) =>
          typeof tag.name_fr === "string" ? [tag.name_fr] : [],
        ),
      );
    recipeByVersion.set(version.id, {
      recipeId: version.recipe_id,
      recipeVersionId: version.id,
      title: version.title,
      description: version.description,
      durationMinutes: version.preparation_minutes + version.cooking_minutes,
      difficulty: version.difficulty,
      servings: version.servings,
      caloriesKcal: nutrition?.calories_kcal ?? null,
      proteinG: nutrition?.protein_g ?? null,
      carbohydratesG: nutrition?.carbohydrates_g ?? null,
      fatG: nutrition?.fat_g ?? null,
      tags,
      imageUrl,
      imageAlt: image?.alt_text ?? null,
      recommendationExplanation: shortExplanation(version),
    });
  }

  return {
    id: plan.id,
    weekStart: plan.week_start,
    status: plan.status,
    revision: plan.revision,
    meals: meals.map((meal) => ({
      id: meal.id,
      mealDate: meal.meal_date,
      mealType: meal.meal_type,
      servings: meal.servings,
      isLocked: meal.is_locked,
      revision: meal.revision,
      recipe: meal.recipe_version_id
        ? (recipeByVersion.get(meal.recipe_version_id) ?? null)
        : null,
    })),
  };
}

export async function getAvailableRecipeOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipe_versions")
    .select("id,title,recipe_id")
    .eq("validation_status", "validated")
    .neq("publication_status", "archived")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("RECIPE_OPTIONS_READ_FAILED", { cause: error });
  return data.map((recipe) => ({
    recipeVersionId: recipe.id,
    recipeId: recipe.recipe_id,
    title: recipe.title,
  }));
}
