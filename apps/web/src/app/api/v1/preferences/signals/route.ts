import {
  aggregatePreferenceSignals,
  preferenceSignalSchema,
} from "@recettes/domain";
import { after, NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.strictObject({
  idempotencyKey: z.uuid(),
  recipeId: z.uuid().nullable().default(null),
  interactionKind: z.enum([
    "like",
    "favorite",
    "cooked",
    "dislike",
    "swap",
    "ignored",
  ]),
  subjectKind: z.enum([
    "ingredient",
    "cuisine",
    "duration",
    "budget",
    "dish_type",
  ]),
  subjectCode: z.string().trim().min(1).max(160),
  dislikeReason: z
    .enum([
      "ingredient",
      "too_long",
      "too_complex",
      "too_expensive",
      "recently_eaten",
      "dish_type",
      "other",
    ])
    .nullable()
    .default(null),
});

const weights: Record<z.infer<typeof inputSchema>["interactionKind"], number> =
  {
    like: 3,
    favorite: 5,
    cooked: 4,
    dislike: -4,
    swap: -1.5,
    ignored: -0.25,
  };

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const input = inputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { error: "invalid_preference_signal" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  after(async () => {
    const contextualWeight =
      input.data.interactionKind === "dislike" &&
      ["recently_eaten", "other"].includes(input.data.dislikeReason ?? "")
        ? -1
        : weights[input.data.interactionKind];
    const { error } = await supabase.rpc("record_preference_learning_signal", {
      p_recipe_id: input.data.recipeId,
      p_interaction_kind: input.data.interactionKind,
      p_subject_kind: input.data.subjectKind,
      p_subject_code: input.data.subjectCode,
      p_dislike_reason: input.data.dislikeReason,
      p_weight: contextualWeight,
      p_idempotency_key: input.data.idempotencyKey,
    });
    if (error) return;

    const { data: events } = await supabase
      .from("preference_learning_events")
      .select(
        "id,interaction_kind,subject_kind,subject_code,occurred_at,dislike_reason,reverted_at",
      )
      .eq("subject_kind", input.data.subjectKind)
      .eq("subject_code", input.data.subjectCode)
      .order("occurred_at");
    const parsedEvents = (events ?? [])
      .map((event) =>
        preferenceSignalSchema.safeParse({
          id: event.id,
          kind: event.interaction_kind,
          subjectKind: event.subject_kind,
          subjectCode: event.subject_code,
          occurredAt: event.occurred_at,
          dislikeReason: event.dislike_reason,
          revertedAt: event.reverted_at,
        }),
      )
      .filter((result) => result.success)
      .map((result) => result.data);
    const learned = aggregatePreferenceSignals(
      parsedEvents,
      new Date().toISOString(),
    )[0];
    if (!learned) return;
    await supabase.from("learned_preferences").upsert({
      user_id: user.id,
      subject_kind: learned.subjectKind,
      subject_code: learned.subjectCode,
      score: learned.score,
      signal_count: learned.signalCount,
    });
    await supabase
      .from("preference_learning_events")
      .update({
        status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("idempotency_key", input.data.idempotencyKey);
  });
  return NextResponse.json({ status: "accepted" }, { status: 202 });
}
