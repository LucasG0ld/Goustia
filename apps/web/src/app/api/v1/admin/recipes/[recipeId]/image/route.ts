import { RECIPE_IMAGE_PROMPT_VERSION } from "@recettes/domain";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import {
  DeterministicImageProcessor,
  RecipeImagePipeline,
} from "@/lib/ai/image-pipeline";
import { configuredAiProviders } from "@/lib/ai/providers/configured";
import { SharpRecipeImageProcessor } from "@/lib/ai/sharp-image-processor";
import { SupabaseGenerationRepository } from "@/lib/ai/supabase-generation-repository";
import { SupabaseRecipeImageStorage } from "@/lib/ai/supabase-image-storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(
  _request: Request,
  context: { params: Promise<{ recipeId: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const recipeId = z.uuid().safeParse((await context.params).recipeId);
  if (!recipeId.success) {
    return NextResponse.json({ error: "invalid_recipe_id" }, { status: 400 });
  }
  const supabase = createAdminClient();
  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) {
    return NextResponse.json({ error: "admin_required" }, { status: 403 });
  }
  const { data: version, error: versionError } = await supabase
    .from("recipe_versions")
    .select("title, description, visual_prompt, visual_alt_text")
    .eq("recipe_id", recipeId.data)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  if (versionError || !version.visual_prompt || !version.visual_alt_text) {
    return NextResponse.json(
      { error: "recipe_visual_prompt_missing" },
      { status: 409 },
    );
  }

  const jobId = crypto.randomUUID();
  const { error: jobError } = await supabase.from("ai_generation_jobs").insert({
    id: jobId,
    user_id: user.id,
    kind: "recipe_image",
    status: "running",
    idempotency_key: crypto.randomUUID(),
    prompt_version: RECIPE_IMAGE_PROMPT_VERSION,
    progress_stage: "images",
    progress_percent: 50,
    started_at: new Date().toISOString(),
  });
  if (jobError) {
    return NextResponse.json(
      { error: "image_job_creation_failed" },
      { status: 500 },
    );
  }

  const repository = new SupabaseGenerationRepository();
  const storage = new SupabaseRecipeImageStorage();
  const pipeline = new RecipeImagePipeline(
    configuredAiProviders.images,
    configuredAiProviders.images.provider === "fake"
      ? new DeterministicImageProcessor()
      : new SharpRecipeImageProcessor(),
    storage,
    (usage) =>
      repository.recordUsage(jobId, user.id, `${jobId}:image:admin`, usage),
  );
  try {
    const result = await pipeline.regenerateAsAdmin(recipeId.data, user.id, {
      titleFr: version.title,
      descriptionFr: version.description,
      visual: {
        promptFr: version.visual_prompt,
        altTextFr: version.visual_alt_text,
        illustrative: true,
      },
    });
    await repository.completeJob(
      jobId,
      [recipeId.data],
      result === "placeholder" ? "without_image" : null,
    );
    return NextResponse.json({ jobId, imageStatus: result });
  } catch (error) {
    await repository.failJob(
      jobId,
      error instanceof Error ? error.message : "IMAGE_REGENERATION_FAILED",
      "La régénération de l’image a échoué.",
    );
    return NextResponse.json(
      { error: "image_regeneration_failed", jobId },
      { status: 502 },
    );
  }
}
