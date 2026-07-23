"use server";

import { progressiveProfileSchema } from "@recettes/domain";

import type { ActionState } from "@/features/auth/state";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export async function saveProgressiveProfileAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireVerifiedUser();
  let cuisineCodes: unknown = [];
  let ingredientPreferences: unknown = [];
  let equipmentIds: unknown = [];
  try {
    cuisineCodes = JSON.parse(String(formData.get("cuisineCodes") ?? "[]"));
    ingredientPreferences = JSON.parse(
      String(formData.get("ingredientPreferences") ?? "[]"),
    );
    equipmentIds = JSON.parse(String(formData.get("equipmentIds") ?? "[]"));
  } catch {
    return {
      status: "error",
      message: "Une sélection est illisible. Recharge la page.",
    };
  }
  const nullable = (value: FormDataEntryValue | null) =>
    value ? String(value) : null;
  const parsed = progressiveProfileSchema.safeParse({
    dietaryPattern: nullable(formData.get("dietaryPattern")),
    cookingSkill: nullable(formData.get("cookingSkill")),
    maxPreparationMinutes: formData.get("maxPreparationMinutes")
      ? Number(formData.get("maxPreparationMinutes"))
      : null,
    budgetLevel: nullable(formData.get("budgetLevel")),
    cuisineCodes,
    ingredientPreferences,
    equipmentIds,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Vérifie les préférences indiquées.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_progressive_profile", {
    p_dietary_pattern: parsed.data.dietaryPattern,
    p_cooking_skill: parsed.data.cookingSkill,
    p_max_preparation_minutes: parsed.data.maxPreparationMinutes,
    p_budget_level: parsed.data.budgetLevel,
    p_cuisine_codes: parsed.data.cuisineCodes,
    p_ingredient_preferences: parsed.data.ingredientPreferences.map(
      (preference) => ({
        ingredient_id: preference.ingredientId,
        signal: preference.signal,
      }),
    ),
    p_equipment_ids: parsed.data.equipmentIds,
  });
  return error
    ? { status: "error", message: "Le profil n’a pas pu être enregistré." }
    : { status: "success", message: "Tes préférences ont été mises à jour." };
}
