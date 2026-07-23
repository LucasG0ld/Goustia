import { quotaAlertLevel } from "@recettes/domain";
import { NextResponse } from "next/server";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const now = new Date().toISOString();
  const { data, error } = await (await createClient())
    .from("usage_quotas")
    .select("used_count, limit_count, window_end")
    .eq("user_id", user.id)
    .eq("quota_key", "recipe_generation")
    .lte("window_start", now)
    .gt("window_end", now)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "quota_read_failed" }, { status: 500 });
  }
  const used = data?.used_count ?? 0;
  const limit = data?.limit_count ?? 0;
  return NextResponse.json(
    {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      alertLevel: limit === 0 ? 0 : quotaAlertLevel(used, limit),
      resetsAt: data?.window_end ?? null,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
