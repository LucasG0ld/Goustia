import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const correctionSchema = z.strictObject({
  subjectKind: z.enum([
    "ingredient",
    "cuisine",
    "duration",
    "budget",
    "dish_type",
  ]),
  subjectCode: z.string().trim().min(1).max(160),
  correctedScore: z.number().min(-12).max(12).nullable(),
});

export async function PATCH(request: Request) {
  if (!(await getVerifiedUser())) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const input = correctionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success) {
    return NextResponse.json(
      { error: "invalid_preference_correction" },
      { status: 400 },
    );
  }
  const { data, error } = await (
    await createClient()
  ).rpc("correct_learned_preference", {
    p_subject_kind: input.data.subjectKind,
    p_subject_code: input.data.subjectCode,
    p_corrected_score: input.data.correctedScore,
  });
  if (error) {
    return NextResponse.json(
      { error: "preference_correction_failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ corrected: data });
}
