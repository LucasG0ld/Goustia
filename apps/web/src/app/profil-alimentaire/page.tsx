import { getProfileCompletion } from "@recettes/domain";
import Link from "next/link";

import { ProgressiveProfileForm } from "@/features/profile/progressive-profile-form";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressiveProfilePage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const [
    { data: profile },
    { data: culinary },
    { data: duration },
    { data: budget },
    { data: cuisines },
    { data: userEquipment },
    { data: equipment },
    { data: ingredientPreferences },
    { data: tasteStep },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("food_safety_confirmed_at,onboarding_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("culinary_preferences")
      .select("dietary_pattern,cooking_skill")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("duration_preferences")
      .select("max_preparation_minutes")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("budget_preferences")
      .select("level")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("cuisine_preferences")
      .select("cuisine_code")
      .eq("user_id", user.id),
    supabase
      .from("user_equipment")
      .select("equipment_id")
      .eq("user_id", user.id)
      .eq("available", true),
    supabase.from("equipment").select("id,name_fr").order("name_fr"),
    supabase
      .from("user_ingredient_preferences")
      .select("ingredient_id,signal,ingredients(name_fr)")
      .eq("user_id", user.id),
    supabase
      .from("onboarding_steps")
      .select("completed_at,skipped_at")
      .eq("user_id", user.id)
      .eq("step", "initial_tastes")
      .maybeSingle(),
  ]);
  const completion = getProfileCompletion({
    foodSafetyConfirmed: Boolean(profile?.food_safety_confirmed_at),
    goalsCompleted: [
      "goals_completed",
      "initial_tastes_completed",
      "completed",
    ].includes(profile?.onboarding_status ?? ""),
    tastesCompleted: Boolean(tasteStep?.completed_at || tasteStep?.skipped_at),
    dietaryPattern: Boolean(culinary?.dietary_pattern),
    cookingSkill: Boolean(culinary?.cooking_skill),
    duration: Boolean(duration?.max_preparation_minutes),
    budget: Boolean(budget?.level),
    cuisines: Boolean(cuisines?.length),
    equipment: Boolean(userEquipment?.length),
    ingredientPreferences: Boolean(ingredientPreferences?.length),
  });
  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-12"
      id="contenu-principal"
    >
      <Link className="font-semibold text-brand underline" href="/compte">
        ← Mon compte
      </Link>
      <h1 className="mt-6 text-4xl font-semibold">
        Profil alimentaire progressif
      </h1>
      <p className="mt-3 text-muted">
        Complété à {completion} %. Tout est facultatif après les étapes
        essentielles et peut être corrigé.
      </p>
      <progress
        aria-label={`Profil complété à ${completion} %`}
        className="mt-4 h-3 w-full accent-brand"
        max={100}
        value={completion}
      />
      <div className="mt-10">
        <ProgressiveProfileForm
          defaults={{
            dietaryPattern: culinary?.dietary_pattern ?? null,
            cookingSkill: culinary?.cooking_skill ?? null,
            maxPreparationMinutes: duration?.max_preparation_minutes ?? null,
            budgetLevel: budget?.level ?? null,
            cuisineCodes: (cuisines ?? []).map((item) => item.cuisine_code),
            equipmentIds: (userEquipment ?? []).map(
              (item) => item.equipment_id,
            ),
            ingredientPreferences: (ingredientPreferences ?? []).flatMap(
              (item) => {
                const ingredient = item.ingredients[0];
                return ingredient
                  ? [
                      {
                        ingredientId: item.ingredient_id,
                        signal: item.signal,
                        label: ingredient.name_fr,
                      },
                    ]
                  : [];
              },
            ),
          }}
          equipment={equipment ?? []}
        />
      </div>
    </main>
  );
}
