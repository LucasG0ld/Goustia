import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.strictObject({
  action: z.literal("profile"),
  nutritionGoal: z.enum([
    "weight_loss",
    "balanced",
    "muscle_gain",
    "no_specific_goal",
  ]),
  mealsPerWeek: z.number().int().min(1).max(21),
  servingsPerMeal: z.number().int().min(1).max(12),
});
const addConstraintSchema = z.strictObject({
  action: z.literal("add_constraint"),
  targetType: z.enum(["ingredient", "allergen"]),
  targetId: z.uuid(),
  kind: z.enum(["allergy", "intolerance", "strict_exclusion"]),
  severity: z.enum(["none", "mild", "moderate", "severe", "life_threatening"]),
  note: z.string().trim().max(300).nullable().default(null),
});
const removeConstraintSchema = z.strictObject({
  action: z.literal("remove_constraint"),
  constraintId: z.uuid(),
  confirmation: z.literal("RETIRER"),
});
const settingsSchema = z.discriminatedUnion("action", [
  profileSchema,
  addConstraintSchema,
  removeConstraintSchema,
]);

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = settingsSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_profile_change" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const input = parsed.data;
  if (input.action === "profile") {
    const { error } = await supabase
      .from("profiles")
      .update({
        nutrition_goal: input.nutritionGoal,
        meals_per_week: input.mealsPerWeek,
        servings_per_meal: input.servingsPerMeal,
      })
      .eq("id", user.id);
    return error
      ? NextResponse.json({ error: "profile_update_failed" }, { status: 500 })
      : NextResponse.json({ updated: true });
  }

  if (input.action === "add_constraint") {
    const { error } = await supabase.from("user_food_constraints").insert({
      user_id: user.id,
      ingredient_id: input.targetType === "ingredient" ? input.targetId : null,
      allergen_id: input.targetType === "allergen" ? input.targetId : null,
      kind: input.kind,
      severity: input.severity,
      is_absolute: true,
      note: input.note,
    });
    if (error) {
      return NextResponse.json(
        { error: "constraint_addition_failed" },
        { status: 409 },
      );
    }
  } else {
    const { error } = await supabase
      .from("user_food_constraints")
      .delete()
      .eq("id", input.constraintId)
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json(
        { error: "constraint_removal_failed" },
        { status: 409 },
      );
    }
  }
  const { error: eligibilityError } = await supabase.rpc(
    "refresh_user_recipe_eligibility",
    { p_user_id: user.id },
  );
  if (eligibilityError) {
    return NextResponse.json(
      { error: "eligibility_refresh_failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ updated: true });
}
