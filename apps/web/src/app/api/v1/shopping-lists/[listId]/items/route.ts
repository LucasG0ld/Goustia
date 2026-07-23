import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const unitSchema = z.enum([
  "g",
  "kg",
  "ml",
  "l",
  "piece",
  "teaspoon",
  "tablespoon",
  "pinch",
  "bunch",
  "slice",
  "clove",
  "to_taste",
]);
const mutationSchema = z.strictObject({
  action: z.enum(["add", "update", "toggle", "delete", "reset"]),
  idempotencyKey: z.uuid(),
  itemId: z.uuid().nullable().default(null),
  manualLabel: z.string().trim().min(1).max(160).nullable().default(null),
  quantity: z.number().positive().max(1_000_000).nullable().default(null),
  unit: unitSchema.nullable().default(null),
  aisle: z.string().trim().min(1).max(100).nullable().default(null),
  checked: z.boolean().nullable().default(null),
  available: z.boolean().nullable().default(null),
  confirmation: z.string().nullable().default(null),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ listId: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const listId = z.uuid().safeParse((await context.params).listId);
  const parsed = mutationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!listId.success || !parsed.success) {
    return NextResponse.json({ error: "invalid_mutation" }, { status: 400 });
  }
  const input = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mutate_shopping_list", {
    p_shopping_list_id: listId.data,
    p_action: input.action,
    p_idempotency_key: input.idempotencyKey,
    p_item_id: input.itemId,
    p_manual_label: input.manualLabel,
    p_quantity: input.quantity,
    p_unit: input.unit,
    p_aisle: input.aisle,
    p_checked: input.checked,
    p_available: input.available,
    p_confirmation: input.confirmation,
  });
  if (error) {
    return NextResponse.json(
      { error: "shopping_mutation_failed", message: error.message },
      { status: error.code === "P0002" ? 404 : 409 },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
