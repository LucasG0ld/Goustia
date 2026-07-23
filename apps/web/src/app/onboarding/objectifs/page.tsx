import { redirect } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding-shell";
import { GoalsForm } from "@/features/onboarding/goals-form";
import { OnboardingStepTracker } from "@/features/onboarding/step-tracker";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function GoalsPage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "nutrition_goal,meals_per_week,servings_per_meal,food_safety_confirmed_at",
    )
    .eq("id", user.id)
    .single();
  if (!data?.food_safety_confirmed_at)
    redirect("/onboarding/securite-alimentaire");
  return (
    <OnboardingShell
      currentStep={2}
      title="Ton rythme"
      description="Trois choix suffisent pour dimensionner la première semaine. Ce n’est pas une prescription nutritionnelle."
    >
      <OnboardingStepTracker step="goals" />
      <GoalsForm
        defaults={{
          nutritionGoal: data.nutrition_goal,
          mealsPerWeek: data.meals_per_week,
          servingsPerMeal: data.servings_per_meal,
        }}
      />
    </OnboardingShell>
  );
}
