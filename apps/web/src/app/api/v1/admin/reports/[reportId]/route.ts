import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const reportSchema = z.strictObject({
  status: z.enum(["investigating", "resolved", "dismissed"]),
  confirmation: z.literal("TRAITER"),
  idempotencyKey: z.uuid(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ reportId: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const reportId = z.uuid().safeParse((await context.params).reportId);
  const input = reportSchema.safeParse(await request.json().catch(() => null));
  if (!reportId.success || !input.success) {
    return NextResponse.json(
      { error: "invalid_report_action" },
      { status: 400 },
    );
  }
  const { error } = await (
    await createClient()
  ).rpc("admin_resolve_report", {
    p_report_id: reportId.data,
    p_status: input.data.status,
    p_confirmation: input.data.confirmation,
    p_idempotency_key: input.data.idempotencyKey,
  });
  return error
    ? NextResponse.json(
        { error: "report_action_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true });
}
