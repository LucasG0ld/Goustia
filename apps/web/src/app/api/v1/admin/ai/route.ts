import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const aiAdminSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("configure"),
    provider: z.enum(["fake", "groq", "cloudflare"]),
    kind: z.enum(["text", "image"]),
    enabled: z.boolean(),
    model: z.string().trim().min(2).max(200),
    confirmation: z.literal("CONFIGURER IA"),
    idempotencyKey: z.uuid(),
  }),
  z.strictObject({
    action: z.enum(["retry", "purge"]),
    jobId: z.uuid(),
    confirmation: z.enum(["RELANCER", "PURGER"]),
    idempotencyKey: z.uuid(),
  }),
]);

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const input = aiAdminSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { error: "invalid_ai_admin_action" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { error } =
    input.data.action === "configure"
      ? await supabase.rpc("admin_set_ai_runtime", {
          p_provider: input.data.provider,
          p_kind: input.data.kind,
          p_enabled: input.data.enabled,
          p_model: input.data.model,
          p_confirmation: input.data.confirmation,
          p_idempotency_key: input.data.idempotencyKey,
        })
      : input.data.action === "retry"
        ? await supabase.rpc("admin_retry_ai_job", {
            p_job_id: input.data.jobId,
            p_confirmation: input.data.confirmation,
            p_idempotency_key: input.data.idempotencyKey,
          })
        : await supabase.rpc("admin_purge_ai_job", {
            p_job_id: input.data.jobId,
            p_confirmation: input.data.confirmation,
            p_idempotency_key: input.data.idempotencyKey,
          });
  return error
    ? NextResponse.json(
        { error: "ai_admin_action_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true });
}
