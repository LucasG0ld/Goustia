import {
  aggregateShoppingItems,
  type ShoppingSourceLine,
} from "@recettes/domain";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const generateSchema = z.strictObject({
  idempotencyKey: z.uuid(),
  mealPlanId: z.uuid().optional(),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = generateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_generation" }, { status: 400 });
  }
  const supabase = await createClient();
  let planQuery = supabase
    .from("meal_plans")
    .select("id,revision")
    .eq("user_id", user.id);
  planQuery = parsed.data.mealPlanId
    ? planQuery.eq("id", parsed.data.mealPlanId)
    : planQuery
        .in("status", ["draft", "ready", "generating"])
        .order("week_start", { ascending: false })
        .limit(1);
  const { data: plan, error: planError } = await planQuery.maybeSingle();
  if (planError || !plan) {
    return NextResponse.json({ error: "meal_plan_not_found" }, { status: 404 });
  }

  const { data: meals, error: mealsError } = await supabase
    .from("planned_meals")
    .select("recipe_version_id,servings")
    .eq("meal_plan_id", plan.id)
    .eq("user_id", user.id)
    .not("recipe_version_id", "is", null);
  if (mealsError || !meals?.length) {
    return NextResponse.json({ error: "meal_plan_empty" }, { status: 422 });
  }
  const versionIds = meals.flatMap((meal) =>
    meal.recipe_version_id ? [meal.recipe_version_id] : [],
  );
  const [{ data: versions }, { data: ingredients, error: ingredientError }] =
    await Promise.all([
      supabase
        .from("recipe_versions")
        .select("id,servings")
        .in("id", versionIds),
      supabase
        .from("recipe_ingredients")
        .select(
          "recipe_version_id,ingredient_id,quantity,unit,ingredients(name_fr,ingredient_families(code))",
        )
        .in("recipe_version_id", versionIds),
    ]);
  if (ingredientError || !versions || !ingredients) {
    return NextResponse.json(
      { error: "shopping_source_failed" },
      { status: 500 },
    );
  }
  const ingredientIds = [
    ...new Set(ingredients.map((item) => item.ingredient_id)),
  ];
  const { data: conversions, error: conversionError } = await supabase
    .from("ingredient_unit_conversions")
    .select("ingredient_id,unit,density_g_per_ml,grams_per_unit")
    .in("ingredient_id", ingredientIds);
  if (conversionError) {
    return NextResponse.json(
      { error: "shopping_conversion_failed" },
      { status: 500 },
    );
  }

  const lines: ShoppingSourceLine[] = meals.flatMap((meal) => {
    const version = versions.find(
      (entry) => entry.id === meal.recipe_version_id,
    );
    if (!meal.recipe_version_id || !version) return [];
    return ingredients
      .filter(
        (ingredient) => ingredient.recipe_version_id === meal.recipe_version_id,
      )
      .map((ingredient) => {
        const conversion = conversions.find(
          (entry) =>
            entry.ingredient_id === ingredient.ingredient_id &&
            entry.unit === ingredient.unit,
        );
        return {
          ingredientId: ingredient.ingredient_id,
          label: ingredient.ingredients[0]?.name_fr ?? "Ingrédient",
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          recipeVersionId: ingredient.recipe_version_id,
          recipeServings: version.servings,
          plannedServings: meal.servings,
          familyCode:
            ingredient.ingredients[0]?.ingredient_families[0]?.code ?? null,
          densityGPerMl: conversion?.density_g_per_ml ?? null,
          gramsPerUnit: conversion?.grams_per_unit ?? null,
        };
      });
  });
  const items = aggregateShoppingItems(lines);
  const { data, error } = await supabase.rpc(
    "replace_generated_shopping_items",
    {
      p_meal_plan_id: plan.id,
      p_plan_revision: plan.revision,
      p_items: items.map((item) => ({
        ingredientId: item.ingredientId,
        label: item.label,
        quantity: item.quantity,
        unit: item.unit,
        aisle: item.aisle,
        sourceRecipeVersionIds: item.sourceRecipeVersionIds,
      })),
      p_idempotency_key: parsed.data.idempotencyKey,
    },
  );
  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("changed")
          ? "meal_plan_conflict"
          : "shopping_generation_failed",
      },
      { status: error.message.includes("changed") ? 409 : 500 },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
