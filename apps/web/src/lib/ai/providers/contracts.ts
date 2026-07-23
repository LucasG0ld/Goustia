import {
  generatedRecipeBatchSchema,
  type AiUsage,
  type GeneratedRecipe,
  type RecipeGenerationInput,
} from "@recettes/domain";
import { z } from "zod";

export const providerNames = ["fake", "groq", "cloudflare"] as const;
export type ProviderName = (typeof providerNames)[number];

export type RecipeGenerationRequest = {
  input: RecipeGenerationInput;
  systemPrompt: string;
  userPrompt: string;
  promptVersion: string;
};

export type RecipeGenerationResponse = {
  recipes: GeneratedRecipe[];
  provider: ProviderName;
  model: string;
  durationMs: number;
  usage: AiUsage;
};

export interface RecipeGenerator {
  readonly provider: ProviderName;
  readonly model: string;
  generate(
    request: RecipeGenerationRequest,
    signal?: AbortSignal,
  ): Promise<RecipeGenerationResponse>;
}

export type RecipeImageRequest = {
  canonicalRecipeId: string;
  prompt: string;
  promptVersion: string;
  width: number;
  height: number;
  seed: number;
};

export type RecipeImageResponse = {
  bytes: Uint8Array;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  width: number;
  height: number;
  provider: ProviderName;
  model: string;
  durationMs: number;
  usage: AiUsage;
};

export interface RecipeImageGenerator {
  readonly provider: ProviderName;
  readonly model: string;
  generate(
    request: RecipeImageRequest,
    signal?: AbortSignal,
  ): Promise<RecipeImageResponse>;
}

export const providerRecipePayloadSchema = generatedRecipeBatchSchema;

export const cloudflareEnvelopeSchema = z.object({
  success: z.boolean(),
  result: z.unknown().optional(),
  errors: z
    .array(
      z.object({
        code: z.number().optional(),
        message: z.string().optional(),
      }),
    )
    .optional(),
});
