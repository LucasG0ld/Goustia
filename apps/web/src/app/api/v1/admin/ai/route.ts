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
  z.strictObject({
    action: z.literal("recover_stale"),
    confirmation: z.literal("RECUPERER LES TACHES"),
    idempotencyKey: z.uuid(),
    staleMinutes: z.number().int().min(5).max(180).default(15),
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
  let error: { message: string } | null = null;
  if (input.data.action === "configure") {
    ({ error } = await supabase.rpc("admin_set_ai_runtime", {
      p_provider: input.data.provider,
      p_kind: input.data.kind,
      p_enabled: input.data.enabled,
      p_model: input.data.model,
      p_confirmation: input.data.confirmation,
      p_idempotency_key: input.data.idempotencyKey,
    }));
  } else if (input.data.action === "recover_stale") {
    ({ error } = await supabase.rpc("admin_recover_stale_ai_jobs", {
      p_confirmation: input.data.confirmation,
      p_idempotency_key: input.data.idempotencyKey,
      p_stale_minutes: input.data.staleMinutes,
    }));
  } else if (input.data.action === "retry") {
    ({ error } = await supabase.rpc("admin_retry_ai_job", {
      p_job_id: input.data.jobId,
      p_confirmation: input.data.confirmation,
      p_idempotency_key: input.data.idempotencyKey,
    }));
  } else if (input.data.action === "purge") {
    ({ error } = await supabase.rpc("admin_purge_ai_job", {
      p_job_id: input.data.jobId,
      p_confirmation: input.data.confirmation,
      p_idempotency_key: input.data.idempotencyKey,
    }));
  }
  return error
    ? NextResponse.json(
        { error: "ai_admin_action_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true });
}
