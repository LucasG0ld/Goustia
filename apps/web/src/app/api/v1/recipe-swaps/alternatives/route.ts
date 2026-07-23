import { swapAlternativeRequestSchema } from "@recettes/domain";
import { NextResponse } from "next/server";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { getSafeSwapAlternatives } from "@/lib/recipes/swap-alternatives";

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const parsed = swapAlternativeRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_swap_request",
        message:
          "La demande est invalide ou contredit les critères à préserver.",
      },
      { status: 400 },
    );
  }
  try {
    const result = await getSafeSwapAlternatives({
      userId: user.id,
      ...parsed.data,
    });
    if (result.alternatives.length === 0) {
      return NextResponse.json(
        {
          error: "no_safe_alternative",
          message:
            "Aucune alternative sûre ne respecte actuellement tous ces critères.",
        },
        { status: 422 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const status =
      error instanceof Error && error.message === "PLANNED_MEAL_NOT_FOUND"
        ? 404
        : 500;
    return NextResponse.json({ error: "swap_search_failed" }, { status });
  }
}
