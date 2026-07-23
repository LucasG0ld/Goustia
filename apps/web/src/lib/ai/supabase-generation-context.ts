import "server-only";

import {
  assertRecipeSafeForStorage,
  calculateRecipeNutrition,
  canReceiveAlcoholRecipes,
  displayedNutrients,
  foodSafetyProfileSchema,
  type GeneratedRecipe,
  type RecipeGenerationInput,
} from "@recettes/domain";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

import type { GenerationValidationPort } from "./orchestration";

const profileRowSchema = z.object({
  birth_date: z.string(),
  nutrition_goal: z.enum([
    "weight_loss",
    "balanced",
    "muscle_gain",
    "no_specific_goal",
  ]),
  servings_per_meal: z.number().int().min(1).max(8),
});

const constraintRowsSchema = z.array(
  z.object({
    kind: z.enum([
      "allergy",
      "intolerance",
      "strict_exclusion",
      "negative_preference",
    ]),
    is_absolute: z.boolean(),
    ingredients: z.object({ slug: z.string() }).nullable(),
    allergens: z.object({ code: z.string() }).nullable(),
  }),
);

async function loadSafetyProfile(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_food_constraints")
    .select("kind, is_absolute, ingredients(slug), allergens(code)")
    .eq("user_id", userId);
  if (error) throw new Error("FOOD_CONSTRAINTS_LOAD_FAILED", { cause: error });
  const constraints = constraintRowsSchema.parse(data);
  return foodSafetyProfileSchema.parse({
    alcoholAllowed: false,
    strictIngredientIds: constraints
      .filter(
        (item) =>
          item.is_absolute &&
          ["strict_exclusion", "intolerance"].includes(item.kind),
      )
      .flatMap((item) => (item.ingredients ? [item.ingredients.slug] : [])),
    strictFamilyIds: [],
    allergyCodes: constraints.flatMap((item) =>
      item.kind === "allergy" && item.allergens ? [item.allergens.code] : [],
    ),
    strictIntoleranceIngredientIds: constraints
      .filter((item) => item.kind === "intolerance" && item.is_absolute)
      .flatMap((item) => (item.ingredients ? [item.ingredients.slug] : [])),
    negativePreferenceIngredientIds: constraints
      .filter((item) => item.kind === "negative_preference")
      .flatMap((item) => (item.ingredients ? [item.ingredients.slug] : [])),
  });
}

export async function buildPseudonymousGenerationInput(options: {
  userId: string;
  requestId: string;
  recipeCount: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  avoidRecentRecipeIds: string[];
  requiredIngredientIds: string[];
}): Promise<RecipeGenerationInput> {
  const supabase = createAdminClient();
  const [{ data: rawProfile, error: profileError }, rawSafety] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("birth_date, nutrition_goal, servings_per_meal")
        .eq("id", options.userId)
        .single(),
      loadSafetyProfile(options.userId),
    ]);
  if (profileError) {
    throw new Error("GENERATION_PROFILE_LOAD_FAILED", { cause: profileError });
  }
  const profile = profileRowSchema.parse(rawProfile);
  const alcoholAllowed = canReceiveAlcoholRecipes(
    new Date(`${profile.birth_date}T00:00:00.000Z`),
  );
  return {
    contractVersion: "recipe-generation.v1",
    requestId: options.requestId,
    locale: "fr-FR",
    profile: {
      alcoholAllowed,
      strictExcludedIngredientIds: rawSafety.strictIngredientIds,
      allergyCodes: rawSafety.allergyCodes,
      dislikedIngredientIds: rawSafety.negativePreferenceIngredientIds,
      nutritionGoal: profile.nutrition_goal,
      servings: profile.servings_per_meal,
      maximumPreparationMinutes: null,
      budgetLevel: null,
      equipmentCodes: [],
      preferredCuisineCodes: [],
    },
    request: {
      recipeCount: options.recipeCount,
      mealType: options.mealType,
      avoidRecentRecipeIds: options.avoidRecentRecipeIds,
      requiredIngredientIds: options.requiredIngredientIds,
    },
  };
}

const taxonomyIngredientRowsSchema = z.array(
  z.object({
    id: z.string(),
    slug: z.string(),
    name_fr: z.string(),
    family_id: z.string().nullable(),
    parent_ingredient_id: z.string().nullable(),
    contains_alcohol: z.boolean(),
    ingredient_synonyms: z.array(z.object({ name_fr: z.string() })),
    ingredient_allergens: z.array(
      z.object({
        relation: z.enum(["contains", "may_contain", "derived_from"]),
        allergens: z.object({ code: z.string() }),
      }),
    ),
  }),
);

const relationRowsSchema = z.array(
  z.object({
    parent_ingredient_id: z.string(),
    child_ingredient_id: z.string(),
  }),
);

const familyRowsSchema = z.array(
  z.object({ id: z.string(), code: z.string() }),
);

const nutrientCodeByKey = {
  energyKcal: "328",
  proteinG: "25000",
  carbohydratesG: "31000",
  fatG: "40000",
  fiberG: "34100",
  saltG: "10004",
} as const;

export class SupabaseRecipeValidator implements GenerationValidationPort {
  private readonly supabase = createAdminClient();

  constructor(private readonly userId: string) {}

  async validate(recipe: GeneratedRecipe) {
    const [safetyProfile, taxonomy] = await Promise.all([
      loadSafetyProfile(this.userId),
      this.loadTaxonomy(),
    ]);
    safetyProfile.alcoholAllowed = (
      await buildPseudonymousGenerationInput({
        userId: this.userId,
        requestId: "30000000-0000-4000-8000-000000000001",
        recipeCount: 1,
        mealType: "dinner",
        avoidRecentRecipeIds: [],
        requiredIngredientIds: [],
      })
    ).profile.alcoholAllowed;
    const safety = assertRecipeSafeForStorage({
      recipeIngredients: recipe.ingredients.map((ingredient) => ({
        sourceName: ingredient.sourceNameFr,
        canonicalIngredientId: ingredient.canonicalIngredientId,
        declaredAllergenCodes: ingredient.declaredAllergenCodes,
        mayContainAllergenCodes: ingredient.mayContainAllergenCodes,
      })),
      profile: safetyProfile,
      taxonomy,
    });
    const nutrition = await this.calculateNutrition(recipe);
    return { safety, nutrition };
  }

  private async loadTaxonomy() {
    const [ingredientsResult, relationsResult, familiesResult] =
      await Promise.all([
        this.supabase
          .from("ingredients")
          .select(
            "id, slug, name_fr, family_id, parent_ingredient_id, contains_alcohol, ingredient_synonyms(name_fr), ingredient_allergens(relation, allergens(code))",
          )
          .eq("is_active", true),
        this.supabase
          .from("ingredient_relations")
          .select("parent_ingredient_id, child_ingredient_id"),
        this.supabase.from("ingredient_families").select("id, code"),
      ]);
    if (
      ingredientsResult.error ||
      relationsResult.error ||
      familiesResult.error
    ) {
      throw new Error("FOOD_TAXONOMY_LOAD_FAILED");
    }
    const ingredients = taxonomyIngredientRowsSchema.parse(
      ingredientsResult.data,
    );
    const relations = relationRowsSchema.parse(relationsResult.data);
    const families = familyRowsSchema.parse(familiesResult.data);
    const slugById = new Map(ingredients.map((item) => [item.id, item.slug]));
    const familyById = new Map(families.map((item) => [item.id, item.code]));
    return {
      ingredients: ingredients.map((ingredient) => ({
        id: ingredient.slug,
        nameFr: ingredient.name_fr,
        synonyms: ingredient.ingredient_synonyms.map((item) => item.name_fr),
        familyIds: ingredient.family_id
          ? [familyById.get(ingredient.family_id)].filter(
              (item): item is string => Boolean(item),
            )
          : [],
        derivedFromIds: [
          ...(ingredient.parent_ingredient_id
            ? [slugById.get(ingredient.parent_ingredient_id)]
            : []),
          ...relations
            .filter((item) => item.child_ingredient_id === ingredient.id)
            .map((item) => slugById.get(item.parent_ingredient_id)),
        ].filter((item): item is string => Boolean(item)),
        allergens: ingredient.ingredient_allergens.map((item) => ({
          code: item.allergens.code,
          relation: item.relation,
        })),
        containsAlcohol: ingredient.contains_alcohol,
      })),
    };
  }

  private async calculateNutrition(recipe: GeneratedRecipe) {
    const inputs = [];
    for (const ingredient of recipe.ingredients) {
      if (!ingredient.canonicalIngredientId) {
        throw new Error("NUTRITION_INGREDIENT_UNRESOLVED");
      }
      const { data: canonical, error } = await this.supabase
        .from("ingredients")
        .select("id")
        .eq("slug", ingredient.canonicalIngredientId)
        .single();
      if (error) throw new Error("NUTRITION_INGREDIENT_UNRESOLVED");
      const [{ data: mapping }, { data: conversion }] = await Promise.all([
        this.supabase
          .from("ingredient_ciqual_mappings")
          .select("source_version_id, food_code, confidence, status")
          .eq("ingredient_id", canonical.id)
          .eq("source_version_id", "ciqual-2025-11-03")
          .maybeSingle(),
        this.supabase
          .from("ingredient_unit_conversions")
          .select(
            "density_g_per_ml, grams_per_unit, confidence, source_reference",
          )
          .eq("ingredient_id", canonical.id)
          .eq("unit", ingredient.unit)
          .maybeSingle(),
      ]);
      const nutrients: Record<string, unknown> = {};
      if (mapping?.food_code) {
        const { data: values, error: valuesError } = await this.supabase
          .from("ciqual_nutrient_values")
          .select("constituent_code, numeric_value, value_status")
          .eq("source_version_id", mapping.source_version_id)
          .eq("food_code", mapping.food_code)
          .in("constituent_code", Object.values(nutrientCodeByKey));
        if (valuesError) throw new Error("CIQUAL_VALUES_LOAD_FAILED");
        for (const nutrient of displayedNutrients) {
          const value = values.find(
            (item) => item.constituent_code === nutrientCodeByKey[nutrient],
          );
          nutrients[nutrient] = {
            valuePer100g:
              value?.value_status === "exact"
                ? Number(value.numeric_value)
                : null,
            status:
              value?.value_status === "exact"
                ? "exact"
                : value?.value_status === "trace"
                  ? "trace"
                  : value?.value_status === "less_than"
                    ? "less_than"
                    : "missing",
            confidence:
              value?.value_status === "exact" ? Number(mapping.confidence) : 0,
          };
        }
      }
      const unitWeightsG =
        conversion?.grams_per_unit === null ||
        conversion?.grams_per_unit === undefined
          ? {}
          : { [ingredient.unit]: Number(conversion.grams_per_unit) };
      inputs.push({
        ingredientId: ingredient.canonicalIngredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        conversion: conversion
          ? {
              densityGPerMl:
                conversion.density_g_per_ml === null
                  ? undefined
                  : Number(conversion.density_g_per_ml),
              unitWeightsG,
              confidence: Number(conversion.confidence),
              source: conversion.source_reference,
            }
          : undefined,
        nutrients,
      });
    }
    return calculateRecipeNutrition({
      servings: recipe.servings,
      ingredients: inputs,
    });
  }
}
