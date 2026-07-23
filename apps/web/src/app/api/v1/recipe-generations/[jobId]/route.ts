import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const jobIdSchema = z.uuid();

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsedJobId = jobIdSchema.safeParse((await context.params).jobId);
  if (!parsedJobId.success) {
    return NextResponse.json({ error: "invalid_job_id" }, { status: 400 });
  }
  const { data, error } = await (await createClient())
    .from("ai_generation_jobs")
    .select(
      "id, status, progress_stage, progress_percent, result_recipe_ids, degraded_mode, user_error_code, user_error_message, created_at, updated_at",
    )
    .eq("id", parsedJobId.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "job_read_failed" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "job_not_found" }, { status: 404 });
  }
  return NextResponse.json(
    {
      jobId: data.id,
      status: data.status,
      stage: data.progress_stage,
      progressPercent: data.progress_percent,
      recipeIds: data.result_recipe_ids,
      degradedMode: data.degraded_mode,
      error:
        data.status === "failed"
          ? {
              code: data.user_error_code,
              message: data.user_error_message,
            }
          : null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
