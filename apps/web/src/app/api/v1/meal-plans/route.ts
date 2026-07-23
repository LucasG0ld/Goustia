import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const createPlanSchema = z.strictObject({
  idempotencyKey: z.uuid(),
  weekStart: z.iso.date(),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = createPlanSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_meal_plan" }, { status: 400 });
  }
  const date = new Date(`${parsed.data.weekStart}T12:00:00Z`);
  if (date.getUTCDay() !== 1) {
    return NextResponse.json(
      { error: "week_must_start_on_monday" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meal_plans")
    .upsert(
      {
        user_id: user.id,
        week_start: parsed.data.weekStart,
        idempotency_key: parsed.data.idempotencyKey,
      },
      { onConflict: "user_id,week_start", ignoreDuplicates: true },
    )
    .select("id,week_start,status,revision")
    .maybeSingle();
  if (error) {
    return NextResponse.json(
      { error: "meal_plan_creation_failed" },
      { status: 500 },
    );
  }
  if (data) return NextResponse.json(data, { status: 201 });
  const { data: existing, error: readError } = await supabase
    .from("meal_plans")
    .select("id,week_start,status,revision")
    .eq("user_id", user.id)
    .eq("week_start", parsed.data.weekStart)
    .single();
  if (readError) {
    return NextResponse.json(
      { error: "meal_plan_creation_failed" },
      { status: 500 },
    );
  }
  return NextResponse.json(existing);
}
