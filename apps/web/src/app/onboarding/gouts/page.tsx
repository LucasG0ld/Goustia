import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { OnboardingShell } from "@/components/onboarding-shell";
import { OnboardingStepTracker } from "@/features/onboarding/step-tracker";
import { TastesForm } from "@/features/onboarding/tastes-form";
import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function TastesPage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const [{ data: profile }, { data: dishes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_status,food_safety_confirmed_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("onboarding_dishes")
      .select("id,title_fr,description_fr")
      .order("display_order"),
  ]);
  if (!profile?.food_safety_confirmed_at)
    redirect("/onboarding/securite-alimentaire");
  if (profile.onboarding_status === "food_safety_completed")
    redirect("/onboarding/objectifs");
  return (
    <OnboardingShell
      currentStep={3}
      title="Quelques plats qui te parlent"
      description="Sélection facultative : nous enregistrons uniquement les cartes choisies. Une carte ignorée n’est jamais un dislike."
    >
      <OnboardingStepTracker step="initial_tastes" />
      <TastesForm dishes={dishes ?? []} idempotencyKey={randomUUID()} />
    </OnboardingShell>
  );
}
