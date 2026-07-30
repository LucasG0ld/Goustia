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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,first_name,last_name,birth_date,locale,onboarding_status,nutrition_goal,meals_per_week",
    )
    .eq("id", user.id)
    .single();
  return error
    ? NextResponse.json({ error: "profile_unavailable" }, { status: 503 })
    : NextResponse.json(data, {
        headers: { "cache-control": "private, no-store" },
      });
}
