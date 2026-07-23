import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const actionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("status"),
    status: z.enum(["active", "suspended"]),
    reason: z.string().trim().min(3).max(300),
    confirmation: z.enum(["SUSPENDRE", "REACTIVER"]),
    idempotencyKey: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("deletion"),
    requestId: z.uuid(),
    status: z.enum(["processing", "completed", "failed"]),
    confirmation: z.literal("TRAITER LA SUPPRESSION"),
    idempotencyKey: z.uuid(),
  }),
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const userId = z.uuid().safeParse((await context.params).userId);
  const input = actionSchema.safeParse(await request.json().catch(() => null));
  if (!userId.success || !input.success) {
    return NextResponse.json(
      { error: "invalid_admin_action" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { error } =
    input.data.action === "status"
      ? await supabase.rpc("admin_set_account_status", {
          p_user_id: userId.data,
          p_status: input.data.status,
          p_reason: input.data.reason,
          p_confirmation: input.data.confirmation,
          p_idempotency_key: input.data.idempotencyKey,
        })
      : await supabase.rpc("admin_process_deletion_request", {
          p_request_id: input.data.requestId,
          p_status: input.data.status,
          p_confirmation: input.data.confirmation,
          p_idempotency_key: input.data.idempotencyKey,
        });
  return error
    ? NextResponse.json(
        { error: "admin_action_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true });
}
