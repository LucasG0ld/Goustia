import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const recipeActionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.enum(["publish", "unpublish"]),
    versionId: z.uuid(),
    confirmation: z.enum(["PUBLIER", "DEPUBLIER"]),
    idempotencyKey: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("revise"),
    versionId: z.uuid(),
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().min(10).max(2_000),
    confirmation: z.literal("CORRIGER"),
    idempotencyKey: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("review"),
    versionId: z.uuid(),
    approve: z.boolean(),
    notes: z.string().trim().min(3).max(1_000),
    confirmation: z.enum(["VALIDER", "REJETER"]),
    idempotencyKey: z.uuid(),
  }),
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ recipeId: string }> },
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const recipeId = z.uuid().safeParse((await context.params).recipeId);
  const input = recipeActionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!recipeId.success || !input.success) {
    return NextResponse.json(
      { error: "invalid_recipe_action" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { data: belongs } = await supabase
    .from("recipe_versions")
    .select("id")
    .eq("id", input.data.versionId)
    .eq("recipe_id", recipeId.data)
    .maybeSingle();
  if (!belongs) {
    return NextResponse.json(
      { error: "recipe_version_not_found" },
      { status: 404 },
    );
  }
  const { data, error } =
    input.data.action === "revise"
      ? await supabase.rpc("admin_create_recipe_revision", {
          p_recipe_version_id: input.data.versionId,
          p_title: input.data.title,
          p_description: input.data.description,
          p_idempotency_key: input.data.idempotencyKey,
        })
      : input.data.action === "review"
        ? await supabase.rpc("admin_review_recipe_revision", {
            p_recipe_version_id: input.data.versionId,
            p_approve: input.data.approve,
            p_notes: input.data.notes,
            p_idempotency_key: input.data.idempotencyKey,
          })
        : await supabase.rpc("admin_set_recipe_publication", {
            p_recipe_version_id: input.data.versionId,
            p_action: input.data.action,
            p_confirmation: input.data.confirmation,
            p_idempotency_key: input.data.idempotencyKey,
          });
  return error
    ? NextResponse.json(
        { error: "recipe_admin_action_failed", message: error.message },
        { status: 409 },
      )
    : NextResponse.json({ updated: true, result: data });
}
