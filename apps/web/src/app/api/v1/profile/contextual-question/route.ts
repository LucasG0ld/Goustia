import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  questionKey: z.enum([
    "cooking_skill",
    "max_preparation_time",
    "budget",
    "equipment",
    "favorite_cuisines",
  ]),
  action: z.enum(["asked", "snoozed"]),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_question" }, { status: 400 });
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("contextual_question_state")
    .select("ask_count")
    .eq("user_id", user.id)
    .eq("question_key", parsed.data.questionKey)
    .maybeSingle();
  const now = new Date();
  const { error } = await supabase.from("contextual_question_state").upsert({
    user_id: user.id,
    question_key: parsed.data.questionKey,
    ask_count: Math.min(
      (current?.ask_count ?? 0) + (parsed.data.action === "asked" ? 1 : 0),
      20,
    ),
    last_asked_at:
      parsed.data.action === "asked" ? now.toISOString() : undefined,
    snoozed_until:
      parsed.data.action === "snoozed"
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
  });
  return error
    ? NextResponse.json({ error: "question_not_recorded" }, { status: 500 })
    : new NextResponse(null, { status: 204 });
}
