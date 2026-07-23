import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { RecipeImageStorage } from "./image-pipeline";

export class SupabaseRecipeImageStorage implements RecipeImageStorage {
  private readonly supabase = createAdminClient();

  async findReady(recipeId: string): Promise<{ path: string } | null> {
    const { data, error } = await this.supabase
      .from("recipe_images")
      .select("storage_path")
      .eq("recipe_id", recipeId)
      .eq("status", "ready")
      .eq("is_primary", true)
      .maybeSingle();
    if (error) throw new Error("RECIPE_IMAGE_LOOKUP_FAILED", { cause: error });
    return data?.storage_path ? { path: data.storage_path } : null;
  }

  async store(options: {
    recipeId: string;
    bytes: Uint8Array;
    contentType: string;
    width: number;
    height: number;
    altTextFr: string;
    provider: string;
    model: string;
    promptVersion: string;
    generationKey: string;
    checksumSha256: string;
    illustrative: true;
  }): Promise<void> {
    const { data: version, error: versionError } = await this.supabase
      .from("recipe_versions")
      .select("id")
      .eq("recipe_id", options.recipeId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();
    if (versionError) {
      throw new Error("RECIPE_IMAGE_VERSION_MISSING", {
        cause: versionError,
      });
    }
    const path = `${options.recipeId}/${options.checksumSha256}.webp`;
    const { error: uploadError } = await this.supabase.storage
      .from("recipe-images")
      .upload(path, options.bytes.slice().buffer, {
        contentType: options.contentType,
        upsert: false,
        cacheControl: "31536000",
      });
    if (uploadError && !uploadError.message.toLowerCase().includes("exist")) {
      throw new Error("RECIPE_IMAGE_UPLOAD_FAILED", { cause: uploadError });
    }
    const { error } = await this.supabase.from("recipe_images").insert({
      recipe_id: options.recipeId,
      recipe_version_id: version.id,
      storage_bucket: "recipe-images",
      storage_path: path,
      alt_text: options.altTextFr,
      status: "ready",
      is_primary: true,
      provider: options.provider,
      model: options.model,
      prompt_version: options.promptVersion,
      width: options.width,
      height: options.height,
      content_type: options.contentType,
      byte_size: options.bytes.byteLength,
      checksum_sha256: options.checksumSha256,
      generation_key: options.generationKey,
      illustrative: options.illustrative,
      generated_at: new Date().toISOString(),
    });
    if (error) {
      if (await this.findReady(options.recipeId)) return;
      throw new Error("RECIPE_IMAGE_METADATA_FAILED", { cause: error });
    }
  }

  async resetForAdmin(recipeId: string, adminUserId: string): Promise<void> {
    const { data: role } = await this.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("ADMIN_REQUIRED");
    const { data: images, error: imageError } = await this.supabase
      .from("recipe_images")
      .select("id")
      .eq("recipe_id", recipeId);
    if (imageError) throw new Error("RECIPE_IMAGE_RESET_FAILED");
    const { error } = await this.supabase
      .from("recipe_images")
      .update({
        status: "failed",
        is_primary: false,
        generation_key: null,
        failure_code: "admin_regeneration",
      })
      .eq("recipe_id", recipeId)
      .eq("status", "ready");
    if (error) throw new Error("RECIPE_IMAGE_RESET_FAILED", { cause: error });
    await this.supabase.from("admin_audit_log").insert({
      admin_user_id: adminUserId,
      action: "recipe.image_regenerated",
      target_type: "recipe",
      target_id: recipeId,
      metadata: { supersededImageCount: images.length },
    });
  }
}
