"use server";

import {
  foodSafetyStepSchema,
  goalsStepSchema,
  tastesStepSchema,
} from "@recettes/domain";
import type { Route } from "next";
import { redirect } from "next/navigation";

import type { ActionState } from "@/features/auth/state";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

function errorState(
  message: string,
  errors?: Record<string, string[] | undefined>,
): ActionState {
  return { status: "error", message, errors };
}

async function recordCompletion(
  userId: string,
  step: "food_safety" | "goals" | "initial_tastes",
  event: "completed" | "skipped" = "completed",
) {
  const supabase = await createClient();
  await supabase
    .from("onboarding_events")
    .insert({ user_id: userId, step, event });
}

export async function saveFoodSafetyAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVerifiedUser();
  let constraints: unknown = [];
  try {
    constraints = JSON.parse(String(formData.get("constraints") ?? "[]"));
  } catch {
    return errorState(
      "La sélection est illisible. Recharge la page et réessaie.",
    );
  }
  const parsed = foodSafetyStepSchema.safeParse({
    constraints,
    noConstraints: formData.get("noConstraints") === "true",
    confirmed: formData.get("confirmed") === "on",
  });
  if (!parsed.success) {
    return errorState(
      "Vérifie et confirme les contraintes.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_food_safety_onboarding", {
    p_constraints: parsed.data.constraints.map(
      ({ targetType, targetId, kind, severity }) => ({
        target_type: targetType,
        target_id: targetId,
        kind,
        severity,
      }),
    ),
    p_no_constraints: parsed.data.noConstraints,
  });
  if (error)
    return errorState(
      "Les contraintes n’ont pas pu être enregistrées en toute sécurité.",
    );

  await recordCompletion(user.id, "food_safety");
  redirect("/onboarding/objectifs");
}

export async function saveGoalsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVerifiedUser();
  const parsed = goalsStepSchema.safeParse({
    nutritionGoal: formData.get("nutritionGoal"),
    mealsPerWeek: Number(formData.get("mealsPerWeek")),
    servingsPerMeal: Number(formData.get("servingsPerMeal")),
  });
  if (!parsed.success) {
    return errorState(
      "Vérifie les valeurs indiquées.",
      parsed.error.flatten().fieldErrors,
    );
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_goals_onboarding", {
    p_nutrition_goal: parsed.data.nutritionGoal,
    p_meals_per_week: parsed.data.mealsPerWeek,
    p_servings_per_meal: parsed.data.servingsPerMeal,
  });
  if (error)
    return errorState(
      "L’étape précédente doit être confirmée avant de continuer.",
    );
  await recordCompletion(user.id, "goals");
  redirect("/onboarding/gouts");
}

export async function saveTastesAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireVerifiedUser();
  let likedDishIds: unknown = [];
  try {
    likedDishIds = JSON.parse(String(formData.get("likedDishIds") ?? "[]"));
  } catch {
    return errorState("La sélection est illisible.");
  }
  const skipped = formData.get("skipped") === "true";
  const parsed = tastesStepSchema.safeParse({
    likedDishIds: skipped ? [] : likedDishIds,
    skipped,
    idempotencyKey: formData.get("idempotencyKey"),
  });
  if (!parsed.success) {
    return errorState(
      "La sélection ne peut pas être enregistrée.",
      parsed.error.flatten().fieldErrors,
    );
  }
  const supabase = await createClient();
  const { data: jobId, error } = await supabase.rpc(
    "complete_tastes_and_request_plan",
    {
      p_liked_dish_ids: parsed.data.likedDishIds,
      p_skipped: parsed.data.skipped,
      p_idempotency_key: parsed.data.idempotencyKey,
    },
  );
  if (error || !jobId)
    return errorState("La première génération n’a pas pu démarrer.");

  await recordCompletion(
    user.id,
    "initial_tastes",
    parsed.data.skipped ? "skipped" : "completed",
  );
  redirect(`/onboarding/generation?job=${jobId}` as Route);
}
