import { currentIsoWeekStart, addDaysToIsoDate } from "@recettes/domain";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.strictObject({
  recipeVersionId: z.uuid(),
  idempotencyKey: z.uuid(),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_recipe" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: version, error: versionError } = await supabase
    .from("recipe_versions")
    .select("id,recipe_id,servings")
    .eq("id", parsed.data.recipeVersionId)
    .single();
  if (versionError || !version) {
    return NextResponse.json({ error: "recipe_not_found" }, { status: 404 });
  }
  await supabase.rpc("refresh_user_recipe_eligibility", {
    p_user_id: user.id,
  });
  const { data: eligibility } = await supabase
    .from("user_recipe_eligibility")
    .select("eligible,reason")
    .eq("user_id", user.id)
    .eq("recipe_id", version.recipe_id)
    .maybeSingle();
  if (eligibility && !eligibility.eligible) {
    return NextResponse.json(
      { error: "recipe_incompatible", reason: eligibility.reason },
      { status: 409 },
    );
  }

  const weekStart = currentIsoWeekStart();
  let { data: plan } = await supabase
    .from("meal_plans")
    .select("id,revision")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (!plan) {
    const { data: created, error } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        week_start: weekStart,
        idempotency_key: parsed.data.idempotencyKey,
      })
      .select("id,revision")
      .single();
    if (error) {
      return NextResponse.json(
        { error: "plan_creation_failed" },
        { status: 500 },
      );
    }
    plan = created;
  }
  const { data: occupied } = await supabase
    .from("planned_meals")
    .select("meal_date,meal_type")
    .eq("meal_plan_id", plan.id)
    .eq("user_id", user.id);
  const occupiedKeys = new Set(
    (occupied ?? []).map((meal) => `${meal.meal_date}:${meal.meal_type}`),
  );
  const slots = Array.from({ length: 7 }, (_, day) =>
    (["lunch", "dinner"] as const).map((mealType) => ({
      mealDate: addDaysToIsoDate(weekStart, day),
      mealType,
    })),
  ).flat();
  const slot = slots.find(
    (candidate) =>
      !occupiedKeys.has(`${candidate.mealDate}:${candidate.mealType}`),
  );
  if (!slot) {
    return NextResponse.json({ error: "plan_full" }, { status: 409 });
  }
  const { data, error } = await supabase.rpc("apply_planned_meal_mutation", {
    p_meal_plan_id: plan.id,
    p_kind: "add",
    p_idempotency_key: parsed.data.idempotencyKey,
    p_expected_plan_revision: plan.revision,
    p_recipe_version_id: version.id,
    p_meal_date: slot.mealDate,
    p_meal_type: slot.mealType,
    p_servings: version.servings,
    p_is_locked: false,
  });
  if (error) {
    return NextResponse.json({ error: "reuse_failed" }, { status: 409 });
  }
  return NextResponse.json(data, { status: 201 });
}
