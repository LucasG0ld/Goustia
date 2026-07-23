import {
  buildRecipeImagePrompt,
  RECIPE_IMAGE_PROMPT_VERSION,
  type AiUsage,
  type GeneratedRecipe,
} from "@recettes/domain";

import type {
  RecipeImageGenerator,
  RecipeImageResponse,
} from "./providers/contracts";

export const RECIPE_IMAGE_STYLE_VERSION = "goustia-food-photo.v1";
export const RECIPE_IMAGE_PLACEHOLDER_PATH = "/images/recipe-placeholder.svg";

export type ProcessedRecipeImage = RecipeImageResponse & {
  checksumSha256: string;
};

export interface RecipeImageProcessor {
  process(image: RecipeImageResponse): Promise<ProcessedRecipeImage>;
}

export interface RecipeImageStorage {
  findReady(recipeId: string): Promise<{ path: string } | null>;
  store(options: {
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
  }): Promise<void>;
  resetForAdmin(recipeId: string, adminUserId: string): Promise<void>;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Bytes(value: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", value.slice().buffer);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export class DeterministicImageProcessor implements RecipeImageProcessor {
  async process(image: RecipeImageResponse): Promise<ProcessedRecipeImage> {
    if (image.bytes.byteLength === 0) throw new Error("IMAGE_EMPTY");
    return {
      ...image,
      checksumSha256: await sha256Bytes(image.bytes),
    };
  }
}

export class RecipeImagePipeline {
  constructor(
    private readonly generator: RecipeImageGenerator,
    private readonly processor: RecipeImageProcessor,
    private readonly storage: RecipeImageStorage,
    private readonly onUsage?: (usage: AiUsage) => Promise<void>,
  ) {}

  async generateForValidatedRecipe(
    recipeId: string,
    recipe: Pick<GeneratedRecipe, "titleFr" | "descriptionFr" | "visual">,
  ): Promise<"ready" | "cached" | "placeholder"> {
    if (await this.storage.findReady(recipeId)) return "cached";
    const prompt = buildRecipeImagePrompt({
      titleFr: recipe.titleFr,
      descriptionFr: recipe.descriptionFr,
      visualPromptFr: recipe.visual.promptFr,
    });
    const generationKey = await sha256(
      `${recipeId}:${RECIPE_IMAGE_PROMPT_VERSION}:${RECIPE_IMAGE_STYLE_VERSION}`,
    );
    try {
      const generated = await this.generator.generate({
        canonicalRecipeId: recipeId,
        prompt,
        promptVersion: RECIPE_IMAGE_PROMPT_VERSION,
        width: 1024,
        height: 768,
        seed: Number.parseInt(generationKey.slice(0, 8), 16),
      });
      await this.onUsage?.(generated.usage);
      const processed = await this.processor.process(generated);
      await this.storage.store({
        recipeId,
        bytes: processed.bytes,
        contentType: processed.contentType,
        width: processed.width,
        height: processed.height,
        altTextFr: recipe.visual.altTextFr,
        provider: processed.provider,
        model: processed.model,
        promptVersion: RECIPE_IMAGE_PROMPT_VERSION,
        generationKey,
        checksumSha256: processed.checksumSha256,
        illustrative: true,
      });
      return "ready";
    } catch {
      return "placeholder";
    }
  }

  regenerateAsAdmin(
    recipeId: string,
    adminUserId: string,
    recipe: Pick<GeneratedRecipe, "titleFr" | "descriptionFr" | "visual">,
  ): Promise<"ready" | "cached" | "placeholder"> {
    return this.storage
      .resetForAdmin(recipeId, adminUserId)
      .then(() => this.generateForValidatedRecipe(recipeId, recipe));
  }
}
