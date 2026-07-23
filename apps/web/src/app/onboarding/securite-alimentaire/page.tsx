import { OnboardingShell } from "@/components/onboarding-shell";
import { FoodSafetyForm } from "@/features/onboarding/food-safety-form";
import { OnboardingStepTracker } from "@/features/onboarding/step-tracker";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function FoodSafetyPage() {
  await requireVerifiedUser();
  const supabase = await createClient();
  const [{ data: allergens }, { data: ingredients }] = await Promise.all([
    supabase
      .from("allergens")
      .select("id,name_fr")
      .in("code", ["gluten", "peanuts", "milk", "eggs", "tree_nuts"])
      .order("name_fr"),
    supabase
      .from("ingredients")
      .select("id,name_fr,contains_alcohol")
      .in("slug", ["porc", "alcool", "lait-de-vache"])
      .order("name_fr"),
  ]);
  const commonItems = [
    ...(allergens ?? []).map((item) => ({
      id: item.id,
      label: item.name_fr,
      targetType: "allergen" as const,
    })),
    ...(ingredients ?? []).map((item) => ({
      id: item.id,
      label: item.name_fr,
      targetType: "ingredient" as const,
      containsAlcohol: item.contains_alcohol,
    })),
  ];
  return (
    <OnboardingShell
      currentStep={1}
      title="Ta sécurité alimentaire"
      description="Indique uniquement les éléments qui doivent réellement bloquer une recette. Tu pourras ajouter les simples goûts plus tard."
    >
      <OnboardingStepTracker step="food_safety" />
      <FoodSafetyForm commonItems={commonItems} />
    </OnboardingShell>
  );
}
