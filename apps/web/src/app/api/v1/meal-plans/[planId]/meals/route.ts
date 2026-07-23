import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import {
  addMealSchema,
  applyMealMutation,
  mutationErrorResponse,
} from "@/lib/planning/mutation-api";

const planIdSchema = z.uuid();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  if (!(await getVerifiedUser())) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const { planId } = await params;
  const input = addMealSchema.safeParse(await request.json().catch(() => null));
  if (!planIdSchema.safeParse(planId).success || !input.success) {
    return NextResponse.json({ error: "invalid_meal" }, { status: 400 });
  }
  try {
    const result = await applyMealMutation({
      planId,
      kind: "add",
      ...input.data,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return mutationErrorResponse(error);
  }
}
