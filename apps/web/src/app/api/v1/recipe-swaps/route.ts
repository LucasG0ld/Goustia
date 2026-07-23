import {
  swapPreservationSchema,
  swapAlternativeRequestSchema,
} from "@recettes/domain";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { getSafeSwapAlternatives } from "@/lib/recipes/swap-alternatives";
import { createClient } from "@/lib/supabase/server";

const chooseSchema = z.strictObject({
  plannedMealId: z.uuid(),
  fromRecipeVersionId: z.uuid(),
  toRecipeVersionId: z.uuid(),
  idempotencyKey: z.uuid(),
  freeRequest: z.string().trim().max(500).nullable().default(null),
  preserve: swapPreservationSchema,
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = chooseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_swap" }, { status: 400 });
  }
  const input = parsed.data;
  const validatedRequest = swapAlternativeRequestSchema.safeParse({
    plannedMealId: input.plannedMealId,
    freeRequest: input.freeRequest,
    preserve: input.preserve,
  });
  if (!validatedRequest.success) {
    return NextResponse.json({ error: "contradictory_swap" }, { status: 400 });
  }

  try {
    const safe = await getSafeSwapAlternatives({
      userId: user.id,
      ...validatedRequest.data,
    });
    if (
      safe.currentVersionId !== input.fromRecipeVersionId ||
      !safe.alternatives.some(
        (candidate) => candidate.recipeVersionId === input.toRecipeVersionId,
      )
    ) {
      return NextResponse.json(
        { error: "unsafe_or_stale_alternative" },
        { status: 409 },
      );
    }
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("complete_recipe_swap", {
      p_planned_meal_id: input.plannedMealId,
      p_from_recipe_version_id: input.fromRecipeVersionId,
      p_to_recipe_version_id: input.toRecipeVersionId,
      p_request_summary: input.freeRequest ?? "",
      p_preserve_calories: input.preserve.calories,
      p_preserve_protein: input.preserve.protein,
      p_preserve_budget: input.preserve.budget,
      p_preserve_duration: input.preserve.duration,
      p_idempotency_key: input.idempotencyKey,
    });
    if (error) {
      const status = error.message.includes("quota") ? 429 : 409;
      return NextResponse.json(
        {
          error: "swap_failed",
          message:
            status === 429
              ? "Le quota quotidien de remplacements est atteint."
              : "Le repas a changé entre-temps. Le plat initial est conservé.",
        },
        { status },
      );
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "swap_failed" }, { status: 500 });
  }
}
