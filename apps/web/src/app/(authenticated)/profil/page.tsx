import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { ProfileSettings } from "@/features/profile/profile-settings";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profil | Goustia",
  description: "Ton compte et tes préférences alimentaires.",
};

export default async function ProfileHubPage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const [
    profileResult,
    constraintsResult,
    ingredientsResult,
    allergensResult,
    learnedResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("nutrition_goal,meals_per_week,servings_per_meal")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_food_constraints")
      .select("id,kind,severity,ingredient_id,allergen_id")
      .eq("user_id", user.id)
      .neq("kind", "negative_preference")
      .order("created_at"),
    supabase
      .from("ingredients")
      .select("id,name_fr")
      .order("name_fr")
      .limit(200),
    supabase.from("allergens").select("id,name_fr").order("name_fr"),
    supabase
      .from("learned_preferences")
      .select("subject_kind,subject_code,score,corrected_score")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50),
  ]);
  if (!profileResult.data) throw new Error("Profil introuvable.");
  const ingredientNames = new Map(
    (ingredientsResult.data ?? []).map((item) => [item.id, item.name_fr]),
  );
  const allergenNames = new Map(
    (allergensResult.data ?? []).map((item) => [item.id, item.name_fr]),
  );

  return (
    <main
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      id="contenu-principal"
    >
      <h1 className="text-3xl font-semibold">Profil</h1>
      <p className="mt-2 text-muted">
        Pilote ton objectif, tes contraintes sûres et la personnalisation.
      </p>
      <nav
        className="mt-5 flex flex-wrap gap-3"
        aria-label="Rubriques du profil"
      >
        <Link className="font-semibold text-brand underline" href="/compte">
          Compte et sécurité
        </Link>
        <Link
          className="font-semibold text-brand underline"
          href={"/historique" as Route}
        >
          Historique
        </Link>
        <Link
          className="font-semibold text-brand underline"
          href="/profil-alimentaire"
        >
          Goûts, durée, budget et matériel
        </Link>
      </nav>
      <ProfileSettings
        allergens={(allergensResult.data ?? []).map((item) => ({
          id: item.id,
          label: item.name_fr,
        }))}
        constraints={(constraintsResult.data ?? []).map((item) => ({
          id: item.id,
          kind: item.kind,
          severity: item.severity,
          label:
            (item.ingredient_id && ingredientNames.get(item.ingredient_id)) ||
            (item.allergen_id && allergenNames.get(item.allergen_id)) ||
            "Contrainte",
        }))}
        ingredients={(ingredientsResult.data ?? []).map((item) => ({
          id: item.id,
          label: item.name_fr,
        }))}
        learned={(learnedResult.data ?? []).map((item) => ({
          subjectKind: item.subject_kind,
          subjectCode: item.subject_code,
          score: item.score,
          correctedScore: item.corrected_score,
        }))}
        profile={{
          nutritionGoal: profileResult.data.nutrition_goal,
          mealsPerWeek: profileResult.data.meals_per_week,
          servingsPerMeal: profileResult.data.servings_per_meal,
        }}
      />
    </main>
  );
}
