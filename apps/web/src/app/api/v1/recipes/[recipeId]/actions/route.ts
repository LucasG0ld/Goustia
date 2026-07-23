import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const actionSchema = z
  .strictObject({
    action: z.enum([
      "like",
      "dislike",
      "clear_reaction",
      "favorite",
      "unfavorite",
      "cooked",
      "shopping",
      "report",
    ]),
    idempotencyKey: z.uuid(),
    surface: z.enum(["home", "planning", "recipe"]).default("recipe"),
    versionId: z.uuid().optional(),
    servings: z.number().int().min(1).max(8).optional(),
    reason: z
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
      .optional(),
    reasonDetail: z.string().trim().min(1).max(500).nullable().optional(),
    reportMessage: z.string().trim().min(10).max(1000).optional(),
  })
  .superRefine((value, context) => {
    if (value.action === "dislike" && value.reasonDetail && !value.reason) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "reason_required",
      });
    }
    if (
      ["cooked", "shopping"].includes(value.action) &&
      (!value.versionId || !value.servings)
    ) {
      context.addIssue({
        code: "custom",
        path: ["versionId"],
        message: "version_and_servings_required",
      });
    }
    if (value.action === "report" && !value.reportMessage) {
      context.addIssue({
        code: "custom",
        path: ["reportMessage"],
        message: "report_message_required",
      });
    }
  });

export async function POST(
  request: Request,
  context: { params: Promise<{ recipeId: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const { recipeId } = await context.params;
  if (!z.uuid().safeParse(recipeId).success) {
    return NextResponse.json({ error: "invalid_recipe" }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }
  const input = parsed.data;
  const supabase = await createClient();

  const { data: replay } = await supabase
    .from("recipe_action_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (replay) return NextResponse.json({ replayed: true });

  const { data: visibleRecipe } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .maybeSingle();
  if (!visibleRecipe) {
    return NextResponse.json({ error: "recipe_not_found" }, { status: 404 });
  }

  let operationError: unknown = null;
  if (input.action === "like" || input.action === "dislike") {
    const { error } = await supabase.from("recipe_reactions").upsert(
      {
        user_id: user.id,
        recipe_id: recipeId,
        reaction: input.action,
        reason: input.action === "dislike" ? (input.reason ?? null) : null,
        reason_detail:
          input.action === "dislike" ? (input.reasonDetail ?? null) : null,
        idempotency_key: input.idempotencyKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,recipe_id" },
    );
    operationError = error;
    if (!error) {
      await supabase.from("recipe_reaction_events").insert({
        user_id: user.id,
        recipe_id: recipeId,
        reaction: input.action,
        reason: input.action === "dislike" ? (input.reason ?? null) : null,
        source: "explicit",
        idempotency_key: input.idempotencyKey,
      });
      await supabase.from("preference_learning_events").insert({
        user_id: user.id,
        recipe_id: recipeId,
        interaction_kind: input.action,
        subject_kind: "dish_type",
        subject_code: `recipe:${recipeId}`,
        dislike_reason:
          input.action === "dislike" ? (input.reason ?? null) : null,
        weight: input.action === "like" ? 2 : -3,
        idempotency_key: input.idempotencyKey,
      });
    }
  } else if (input.action === "clear_reaction") {
    const { error } = await supabase
      .from("recipe_reactions")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
    operationError = error;
    if (!error) {
      const { data: latest } = await supabase
        .from("preference_learning_events")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .in("interaction_kind", ["like", "dislike"])
        .is("reverted_at", null)
        .order("occurred_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) {
        await supabase
          .from("preference_learning_events")
          .update({
            reverted_at: new Date().toISOString(),
            status: "pending",
            processed_at: null,
          })
          .eq("id", latest.id)
          .eq("user_id", user.id);
      }
    }
  } else if (input.action === "favorite") {
    const { error } = await supabase
      .from("favorite_recipes")
      .upsert(
        { user_id: user.id, recipe_id: recipeId },
        { onConflict: "user_id,recipe_id", ignoreDuplicates: true },
      );
    operationError = error;
    if (!error) {
      await supabase.from("preference_learning_events").insert({
        user_id: user.id,
        recipe_id: recipeId,
        interaction_kind: "favorite",
        subject_kind: "dish_type",
        subject_code: `recipe:${recipeId}`,
        weight: 3,
        idempotency_key: input.idempotencyKey,
      });
    }
  } else if (input.action === "unfavorite") {
    const { error } = await supabase
      .from("favorite_recipes")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
    operationError = error;
    if (!error) {
      const { data: latest } = await supabase
        .from("preference_learning_events")
        .select("id")
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId)
        .eq("interaction_kind", "favorite")
        .is("reverted_at", null)
        .order("occurred_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) {
        await supabase
          .from("preference_learning_events")
          .update({
            reverted_at: new Date().toISOString(),
            status: "pending",
            processed_at: null,
          })
          .eq("id", latest.id)
          .eq("user_id", user.id);
      }
    }
  } else if (input.action === "cooked") {
    const { error } = await supabase.from("cooked_recipes").upsert(
      {
        user_id: user.id,
        recipe_version_id: input.versionId!,
        servings: input.servings!,
        idempotency_key: input.idempotencyKey,
      },
      { onConflict: "user_id,idempotency_key", ignoreDuplicates: true },
    );
    operationError = error;
    if (!error) {
      await supabase.from("preference_learning_events").insert({
        user_id: user.id,
        recipe_id: recipeId,
        interaction_kind: "cooked",
        subject_kind: "dish_type",
        subject_code: `recipe:${recipeId}`,
        weight: 2.5,
        idempotency_key: input.idempotencyKey,
      });
    }
  } else if (input.action === "shopping") {
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .upsert(
        {
          user_id: user.id,
          title: "Recette à acheter",
          status: "active",
          idempotency_key: input.idempotencyKey,
        },
        { onConflict: "user_id,idempotency_key" },
      )
      .select("id")
      .single();
    operationError = listError;
    if (list && !listError) {
      const [{ data: ingredients }, { data: version }] = await Promise.all([
        supabase
          .from("recipe_ingredients")
          .select("ingredient_id,quantity,unit")
          .eq("recipe_version_id", input.versionId!),
        supabase
          .from("recipe_versions")
          .select("servings")
          .eq("id", input.versionId!)
          .single(),
      ]);
      const ratio = input.servings! / Math.max(1, version?.servings ?? 1);
      const { error } = await supabase.from("shopping_list_items").insert(
        (ingredients ?? []).map((ingredient) => ({
          shopping_list_id: list.id,
          user_id: user.id,
          ingredient_id: ingredient.ingredient_id,
          quantity: ingredient.quantity
            ? Math.round(ingredient.quantity * ratio * 1000) / 1000
            : null,
          unit: ingredient.unit,
          source_recipe_version_id: input.versionId!,
        })),
      );
      operationError = error;
    }
  } else if (input.action === "report") {
    const { error } = await supabase.from("content_reports").insert({
      reporter_id: user.id,
      recipe_id: recipeId,
      kind: "recipe_error",
      user_message: input.reportMessage!,
    });
    operationError = error;
  }

  if (operationError) {
    return NextResponse.json({ error: "action_failed" }, { status: 500 });
  }
  const { error: eventError } = await supabase
    .from("recipe_action_events")
    .insert({
      user_id: user.id,
      recipe_id: recipeId,
      action: input.action,
      surface: input.surface,
      reason_category: input.reason ?? null,
      idempotency_key: input.idempotencyKey,
    });
  if (eventError?.code === "23505") {
    return NextResponse.json({ replayed: true });
  }
  if (eventError) {
    return NextResponse.json({ error: "action_trace_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
