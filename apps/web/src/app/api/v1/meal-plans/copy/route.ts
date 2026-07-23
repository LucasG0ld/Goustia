import { isoWeekStartSchema } from "@recettes/domain";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const copySchema = z
  .strictObject({
    idempotencyKey: z.uuid(),
    sourceWeekStart: isoWeekStartSchema,
    targetWeekStart: isoWeekStartSchema,
  })
  .refine((value) => value.sourceWeekStart !== value.targetWeekStart);

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = copySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_copy_request" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("copy_meal_plan_week", {
    p_source_week_start: parsed.data.sourceWeekStart,
    p_target_week_start: parsed.data.targetWeekStart,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) {
    const sourceEmpty = error.message.includes("source week empty");
    return NextResponse.json(
      {
        error: sourceEmpty ? "source_week_empty" : "copy_failed",
        message: sourceEmpty
          ? "La semaine précédente ne contient aucun repas à recopier."
          : "La semaine n’a pas pu être recopiée.",
      },
      { status: sourceEmpty ? 404 : 409 },
    );
  }
  return NextResponse.json(data, { status: 201 });
}
