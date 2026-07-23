import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  step: z.enum(["food_safety", "goals", "initial_tastes"]),
  event: z.enum(["viewed", "abandoned"]),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_events")
    .insert({ user_id: user.id, ...parsed.data });
  return error
    ? NextResponse.json({ error: "event_not_recorded" }, { status: 500 })
    : new NextResponse(null, { status: 204 });
}
