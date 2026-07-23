import type { ServerEnv } from "@/lib/env/schema";

import {
  CloudflareImageGenerator,
  CloudflareRecipeGenerator,
} from "./cloudflare";
import type { RecipeGenerator, RecipeImageGenerator } from "./contracts";
import {
  FallbackRecipeGenerator,
  FallbackRecipeImageGenerator,
  ResilientRecipeGenerator,
  ResilientRecipeImageGenerator,
} from "./decorators";
import { FakeRecipeGenerator, FakeRecipeImageGenerator } from "./fake";
import { GroqRecipeGenerator } from "./groq";
import type { AiFetch } from "./http";

export type AiProviders = {
  recipes: RecipeGenerator;
  images: RecipeImageGenerator;
};

export function createAiProviders(
  environment: ServerEnv,
  fetchImplementation: AiFetch = fetch,
): AiProviders {
  const resilience = (timeoutMs: number) => ({
    timeoutMs,
    maximumAttempts: environment.AI_MAX_ATTEMPTS,
    baseDelayMs: 250,
    circuitFailureThreshold: 5,
    circuitResetMs: 60_000,
  });
  const fakeRecipes = new FakeRecipeGenerator();
  const fakeImages = new FakeRecipeImageGenerator();

  const recipeProvider = (name: ServerEnv["AI_TEXT_PROVIDER"]) => {
    if (name === "fake") return fakeRecipes;
    if (name === "groq") {
      return new GroqRecipeGenerator(
        environment.AI_TEXT_MODEL,
        environment.GROQ_API_KEY ?? "",
        fetchImplementation,
      );
    }
    return new CloudflareRecipeGenerator(
      environment.CLOUDFLARE_TEXT_MODEL,
      environment.CLOUDFLARE_ACCOUNT_ID ?? "",
      environment.CLOUDFLARE_API_TOKEN ?? "",
      fetchImplementation,
    );
  };

  const primaryRecipes = new ResilientRecipeGenerator(
    recipeProvider(environment.AI_TEXT_PROVIDER),
    resilience(environment.AI_TEXT_TIMEOUT_MS),
  );
  const fallbackRecipes = new ResilientRecipeGenerator(
    recipeProvider(environment.AI_TEXT_FALLBACK_PROVIDER),
    resilience(environment.AI_TEXT_TIMEOUT_MS),
  );

  if (environment.AI_IMAGE_PROVIDER === "fake") {
    return {
      recipes:
        environment.AI_TEXT_PROVIDER === environment.AI_TEXT_FALLBACK_PROVIDER
          ? primaryRecipes
          : new FallbackRecipeGenerator(primaryRecipes, fallbackRecipes),
      images: fakeImages,
    };
  }

  const primaryImages = new ResilientRecipeImageGenerator(
    new CloudflareImageGenerator(
      environment.AI_IMAGE_MODEL,
      environment.CLOUDFLARE_ACCOUNT_ID ?? "",
      environment.CLOUDFLARE_API_TOKEN ?? "",
      fetchImplementation,
    ),
    resilience(environment.AI_IMAGE_TIMEOUT_MS),
  );
  const fallbackImages = new ResilientRecipeImageGenerator(
    new CloudflareImageGenerator(
      environment.AI_IMAGE_FALLBACK_MODEL,
      environment.CLOUDFLARE_ACCOUNT_ID ?? "",
      environment.CLOUDFLARE_API_TOKEN ?? "",
      fetchImplementation,
    ),
    resilience(environment.AI_IMAGE_TIMEOUT_MS),
  );
  return {
    recipes:
      environment.AI_TEXT_PROVIDER === environment.AI_TEXT_FALLBACK_PROVIDER
        ? primaryRecipes
        : new FallbackRecipeGenerator(primaryRecipes, fallbackRecipes),
    images: new FallbackRecipeImageGenerator(primaryImages, fallbackImages),
  };
}
