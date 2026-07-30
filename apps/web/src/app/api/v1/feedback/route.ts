import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { HttpRequestError, parseBoundedJson } from "@/lib/security/http";
import { createClient } from "@/lib/supabase/server";

const feedbackSchema = z.strictObject({
  kind: z.enum(["bug", "suggestion", "recipe_quality", "food_safety"]),
  message: z.string().trim().min(10).max(2000),
  pagePath: z
    .string()
    .regex(/^\/[a-zA-Z0-9/?=&._-]+$/)
    .max(300)
    .nullable()
    .default(null),
});

export async function POST(request: Request) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  let input: z.infer<typeof feedbackSchema>;
  try {
    input = await parseBoundedJson(request, feedbackSchema, 8_192);
  } catch (error) {
    const requestError = error instanceof HttpRequestError ? error : null;
    return NextResponse.json(
      { error: requestError?.code ?? "invalid_feedback" },
      { status: requestError?.status ?? 400 },
    );
  }
  const supabase = await createClient();
  const { error } = await supabase.from("beta_feedback").insert({
    user_id: user.id,
    kind: input.kind,
    message: input.message,
    page_path: input.pagePath,
  });
  return error
    ? NextResponse.json({ error: "feedback_not_saved" }, { status: 503 })
    : NextResponse.json({ saved: true }, { status: 201 });
}
