import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export const mealMutationBaseSchema = z.strictObject({
  idempotencyKey: z.uuid(),
  expectedPlanRevision: z.number().int().positive(),
});

export const addMealSchema = mealMutationBaseSchema.extend({
  recipeVersionId: z.uuid(),
  mealDate: z.iso.date(),
  mealType: z.enum(["lunch", "dinner"]),
  servings: z.number().int().min(1).max(8),
  isLocked: z.boolean().default(false),
});

export const updateMealSchema = mealMutationBaseSchema.extend({
  mealDate: z.iso.date().optional(),
  mealType: z.enum(["lunch", "dinner"]).optional(),
  servings: z.number().int().min(1).max(8).optional(),
  isLocked: z.boolean().optional(),
});

export function mutationErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (
    message.includes("MEAL_PLAN_CONFLICT") ||
    message.includes("MEAL_SLOT_CONFLICT") ||
    message.includes("duplicate key")
  ) {
    return NextResponse.json(
      {
        error: "meal_plan_conflict",
        message:
          "Le planning a changé. Recharge la semaine avant de réessayer.",
      },
      { status: 409 },
    );
  }
  if (message.includes("not found")) {
    return NextResponse.json({ error: "meal_not_found" }, { status: 404 });
  }
  return NextResponse.json(
    { error: "meal_plan_mutation_failed" },
    { status: 500 },
  );
}

export async function applyMealMutation(parameters: {
  planId: string;
  kind: "add" | "update" | "remove" | "regenerate";
  idempotencyKey: string;
  expectedPlanRevision: number;
  mealId?: string;
  recipeVersionId?: string;
  mealDate?: string;
  mealType?: "lunch" | "dinner";
  servings?: number;
  isLocked?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("apply_planned_meal_mutation", {
    p_meal_plan_id: parameters.planId,
    p_kind: parameters.kind,
    p_idempotency_key: parameters.idempotencyKey,
    p_expected_plan_revision: parameters.expectedPlanRevision,
    p_planned_meal_id: parameters.mealId,
    p_recipe_version_id: parameters.recipeVersionId,
    p_meal_date: parameters.mealDate,
    p_meal_type: parameters.mealType,
    p_servings: parameters.servings,
    p_is_locked: parameters.isLocked,
  });
  if (error) throw new Error(error.message, { cause: error });
  return data;
}
