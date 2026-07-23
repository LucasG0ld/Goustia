import {
  generatedRecipeSchema,
  validGeneratedRecipeExample,
} from "@recettes/domain";

import type {
  RecipeGenerationRequest,
  RecipeGenerationResponse,
  RecipeGenerator,
  RecipeImageGenerator,
  RecipeImageRequest,
  RecipeImageResponse,
} from "./contracts";
import { decodeBase64 } from "./http";

function deterministicUuid(index: number): string {
  return `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

export class FakeRecipeGenerator implements RecipeGenerator {
  readonly provider = "fake" as const;
  readonly model = "fake-recipes-v1";

  async generate(
    request: RecipeGenerationRequest,
  ): Promise<RecipeGenerationResponse> {
    const recipes = Array.from(
      { length: request.input.request.recipeCount },
      (_, index) =>
        generatedRecipeSchema.parse({
          ...structuredClone(validGeneratedRecipeExample),
          clientRecipeId: deterministicUuid(index),
          titleFr:
            index === 0
              ? validGeneratedRecipeExample.titleFr
              : `${validGeneratedRecipeExample.titleFr} ${index + 1}`,
          servings: request.input.profile.servings,
          ingredients: validGeneratedRecipeExample.ingredients.map(
            (ingredient) => ({
              ...structuredClone(ingredient),
              quantity:
                (ingredient.quantity * request.input.profile.servings) / 2,
            }),
          ),
        }),
    );
    return {
      recipes,
      provider: this.provider,
      model: this.model,
      durationMs: 0,
      usage: {
        kind: "text",
        provider: this.provider,
        model: this.model,
        inputTokens: 0,
        outputTokens: 0,
        neurons: 0,
        imageCount: 0,
      },
    };
  }
}

const transparentPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

export class FakeRecipeImageGenerator implements RecipeImageGenerator {
  readonly provider = "fake" as const;
  readonly model = "fake-image-v1";

  async generate(request: RecipeImageRequest): Promise<RecipeImageResponse> {
    return {
      bytes: decodeBase64(transparentPng),
      contentType: "image/png",
      width: request.width,
      height: request.height,
      provider: this.provider,
      model: this.model,
      durationMs: 0,
      usage: {
        kind: "image",
        provider: this.provider,
        model: this.model,
        inputTokens: 0,
        outputTokens: 0,
        neurons: 0,
        imageCount: 1,
      },
    };
  }
}
