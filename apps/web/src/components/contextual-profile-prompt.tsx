import {
  contextualQuestionKeys,
  selectContextualQuestion,
} from "@recettes/domain";

import { ContextualQuestion } from "@/features/profile/contextual-question";
import { createClient } from "@/lib/supabase/server";

export async function ContextualProfilePrompt({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [
    { data: culinary },
    { data: duration },
    { data: budget },
    { count: cuisines },
    { count: equipment },
    { count: reactions },
    { count: cooked },
    { data: states },
  ] = await Promise.all([
    supabase
      .from("culinary_preferences")
      .select("cooking_skill")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("duration_preferences")
      .select("max_preparation_minutes")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("budget_preferences")
      .select("level")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("cuisine_preferences")
      .select("cuisine_code", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_equipment")
      .select("equipment_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("recipe_reaction_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("cooked_recipes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("contextual_question_state")
      .select("question_key,last_asked_at,snoozed_until")
      .eq("user_id", userId),
  ]);
  const missing: (typeof contextualQuestionKeys)[number][] = [];
  if (!culinary?.cooking_skill) missing.push("cooking_skill");
  if (!duration?.max_preparation_minutes) missing.push("max_preparation_time");
  if (!budget?.level) missing.push("budget");
  if (!equipment) missing.push("equipment");
  if (!cuisines) missing.push("favorite_cuisines");
  const latest = (states ?? [])
    .map((state) => state.last_asked_at)
    .filter(Boolean)
    .sort()
    .at(-1);
  const now = new Date();
  const available = missing.filter((key) => {
    const state = states?.find((item) => item.question_key === key);
    return !state?.snoozed_until || new Date(state.snoozed_until) <= now;
  });
  const question = selectContextualQuestion({
    missing: available,
    usefulActionCount: (reactions ?? 0) + (cooked ?? 0),
    lastAskedAt: latest ? new Date(latest) : null,
    now,
  });
  return question ? <ContextualQuestion questionKey={question} /> : null;
}
