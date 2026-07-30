import "server-only";

import { serverEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { createAiProviders } from "./factory";

export async function getConfiguredAiProviders() {
  const { data, error } = await createAdminClient()
    .from("ai_runtime_settings")
    .select("provider,kind,enabled,active_model");
  if (error)
    throw new Error("AI_RUNTIME_CONFIGURATION_FAILED", { cause: error });
  const selectedText = data.find(
    (item) =>
      item.kind === "text" && item.provider === serverEnv.AI_TEXT_PROVIDER,
  );
  const selectedImage = data.find(
    (item) =>
      item.kind === "image" && item.provider === serverEnv.AI_IMAGE_PROVIDER,
  );
  if (!selectedText?.enabled || !selectedImage?.enabled) {
    throw new Error("AI_PROVIDER_DISABLED");
  }
  const fallback = data.find(
    (item) =>
      item.kind === "text" &&
      item.provider === serverEnv.AI_TEXT_FALLBACK_PROVIDER &&
      item.enabled,
  );
  return createAiProviders({
    ...serverEnv,
    AI_TEXT_MODEL:
      selectedText.provider === "groq"
        ? selectedText.active_model
        : serverEnv.AI_TEXT_MODEL,
    CLOUDFLARE_TEXT_MODEL:
      selectedText.provider === "cloudflare"
        ? selectedText.active_model
        : serverEnv.CLOUDFLARE_TEXT_MODEL,
    AI_TEXT_FALLBACK_PROVIDER: fallback
      ? serverEnv.AI_TEXT_FALLBACK_PROVIDER
      : serverEnv.AI_TEXT_PROVIDER,
    AI_IMAGE_MODEL: selectedImage.active_model,
  });
}
