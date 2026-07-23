import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const foodRuleSchema = z.strictObject({
  ruleId: z.uuid().nullable().default(null),
  ingredientId: z.uuid(),
  pairedIngredientId: z.uuid().nullable().default(null),
  reason: z.string().trim().min(3).max(500),
  active: z.boolean(),
  confirmation: z.literal("CONFIRMER LE BLOCAGE"),
  idempotencyKey: z.uuid(),
});

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const input = foodRuleSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json({ error: "invalid_food_rule" }, { status: 400 });
  }
  const { data, error } = await (
    await createClient()
  ).rpc("admin_set_blocked_food_rule", {
    p_rule_id: input.data.ruleId as string,
    p_ingredient_id: input.data.ingredientId,
    p_paired_ingredient_id: input.data.pairedIngredientId as string,
    p_reason: input.data.reason,
    p_active: input.data.active,
    p_confirmation: input.data.confirmation,
    p_idempotency_key: input.data.idempotencyKey,
  });
  return error
    ? NextResponse.json(
        { error: "food_rule_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true, ruleId: data });
}
