import { redirect } from "next/navigation";

import { requireVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const user = await requireVerifiedUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_status")
    .eq("id", user.id)
    .single();

  if (data?.onboarding_status === "completed") redirect("/compte");
  if (data?.onboarding_status === "goals_completed")
    redirect("/onboarding/gouts");
  if (data?.onboarding_status === "food_safety_completed")
    redirect("/onboarding/objectifs");
  redirect("/onboarding/securite-alimentaire");
}
