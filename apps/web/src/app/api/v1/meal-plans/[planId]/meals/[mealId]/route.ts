import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import {
  applyMealMutation,
  mealMutationBaseSchema,
  mutationErrorResponse,
  updateMealSchema,
} from "@/lib/planning/mutation-api";

const pathSchema = z.strictObject({ planId: z.uuid(), mealId: z.uuid() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planId: string; mealId: string }> },
) {
  if (!(await getVerifiedUser())) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const path = pathSchema.safeParse(await params);
  const input = updateMealSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!path.success || !input.success) {
    return NextResponse.json({ error: "invalid_meal_update" }, { status: 400 });
  }
  try {
    const result = await applyMealMutation({
      planId: path.data.planId,
      mealId: path.data.mealId,
      kind: "update",
      ...input.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return mutationErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ planId: string; mealId: string }> },
) {
  if (!(await getVerifiedUser())) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const path = pathSchema.safeParse(await params);
  const input = mealMutationBaseSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!path.success || !input.success) {
    return NextResponse.json({ error: "invalid_meal_delete" }, { status: 400 });
  }
  try {
    const result = await applyMealMutation({
      planId: path.data.planId,
      mealId: path.data.mealId,
      kind: "remove",
      ...input.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return mutationErrorResponse(error);
  }
}
