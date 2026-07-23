import {
  recipeGenerationInputSchema,
  validGeneratedRecipeExample,
  validRecipeGenerationInputExample,
} from "@recettes/domain";
import { describe, expect, it, vi } from "vitest";

import {
  CloudflareImageGenerator,
  CloudflareRecipeGenerator,
} from "./cloudflare";
import { GroqRecipeGenerator } from "./groq";

const request = {
  input: recipeGenerationInputSchema.parse(validRecipeGenerationInputExample),
  systemPrompt: "Instruction système de test",
  userPrompt: "Données de test",
  promptVersion: "recipe-prompt.v1",
};

describe("adaptateurs fournisseur sans réseau", () => {
  it("normalise une réponse structurée Groq", async () => {
    const mockedFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        model: "openai/gpt-oss-120b",
        choices: [
          {
            message: {
              content: JSON.stringify({
                recipes: [validGeneratedRecipeExample],
              }),
            },
          },
        ],
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      }),
    );
    const generator = new GroqRecipeGenerator(
      "openai/gpt-oss-120b",
      "secret-test",
      mockedFetch,
    );
    const result = await generator.generate(request);
    expect(result.recipes).toHaveLength(1);
    expect(result.usage.inputTokens).toBe(100);
    const init = mockedFetch.mock.calls[0][1];
    expect(init?.headers).toMatchObject({
      authorization: "Bearer secret-test",
    });
    expect(JSON.parse(String(init?.body)).response_format).toMatchObject({
      type: "json_schema",
      json_schema: { strict: true },
    });
  });

  it("normalise les réponses texte et image Cloudflare", async () => {
    const textFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        result: {
          response: JSON.stringify({
            recipes: [validGeneratedRecipeExample],
          }),
        },
      }),
    );
    const text = await new CloudflareRecipeGenerator(
      "@cf/qwen/qwen3-30b-a3b-fp8",
      "account",
      "token",
      textFetch,
    ).generate(request);
    expect(text.provider).toBe("cloudflare");

    const imageFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        result: { image: btoa("image") },
      }),
    );
    const image = await new CloudflareImageGenerator(
      "@cf/black-forest-labs/flux-2-klein-4b",
      "account",
      "token",
      imageFetch,
    ).generate({
      canonicalRecipeId: "recipe",
      prompt: "Photographie culinaire réaliste d'un plat fini",
      promptVersion: "recipe-image-prompt.v1",
      width: 1024,
      height: 768,
      seed: 42,
    });
    expect(new TextDecoder().decode(image.bytes)).toBe("image");
    expect(image.usage.imageCount).toBe(1);
    expect(imageFetch.mock.calls[0][1]?.body).toBeInstanceOf(FormData);

    const schnellFetch = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        success: true,
        result: { image: btoa("fallback") },
      }),
    );
    await new CloudflareImageGenerator(
      "@cf/black-forest-labs/flux-1-schnell",
      "account",
      "token",
      schnellFetch,
    ).generate({
      canonicalRecipeId: "recipe",
      prompt: "Photographie culinaire réaliste d'un plat fini",
      promptVersion: "recipe-image-prompt.v1",
      width: 1024,
      height: 768,
      seed: 42,
    });
    expect(JSON.parse(String(schnellFetch.mock.calls[0][1]?.body))).toEqual(
      expect.objectContaining({ prompt: expect.any(String), steps: 4 }),
    );
  });
});
