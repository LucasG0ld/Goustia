import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const referenceSchema = z.strictObject({
  action: z.enum(["add_synonym", "set_alcohol", "set_allergen", "set_ciqual"]),
  ingredientId: z.uuid(),
  relatedId: z.uuid().nullable().default(null),
  value: z.string().trim().max(160).nullable().default(null),
  relation: z
    .enum(["contains", "may_contain", "derived_from"])
    .nullable()
    .default(null),
  confidence: z.number().min(0).max(1).nullable().default(null),
  rationale: z.string().trim().min(3).max(1_000).nullable().default(null),
  confirmation: z.literal("MODIFIER LE REFERENTIEL"),
  idempotencyKey: z.uuid(),
});

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const input = referenceSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json(
      { error: "invalid_reference_action" },
      { status: 400 },
    );
  }
  const { error } = await (
    await createClient()
  ).rpc("admin_mutate_food_reference", {
    p_action: input.data.action,
    p_ingredient_id: input.data.ingredientId,
    p_related_id: input.data.relatedId as string,
    p_value: input.data.value as string,
    p_relation: input.data.relation as string,
    p_confidence: input.data.confidence as number,
    p_rationale: input.data.rationale as string,
    p_confirmation: input.data.confirmation,
    p_idempotency_key: input.data.idempotencyKey,
  });
  return error
    ? NextResponse.json(
        { error: "reference_action_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true });
}
