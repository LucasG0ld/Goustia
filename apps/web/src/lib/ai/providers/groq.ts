import { generatedRecipeBatchJsonSchema } from "@recettes/domain";
import { z } from "zod";

import type {
  RecipeGenerationRequest,
  RecipeGenerationResponse,
  RecipeGenerator,
} from "./contracts";
import { providerRecipePayloadSchema } from "./contracts";
import { AiProviderError } from "./errors";
import { fetchJson, type AiFetch } from "./http";

const groqResponseSchema = z.object({
  model: z.string(),
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable() }),
      }),
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().int().nonnegative().optional(),
      completion_tokens: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export class GroqRecipeGenerator implements RecipeGenerator {
  readonly provider = "groq" as const;

  constructor(
    readonly model: string,
    private readonly apiKey: string,
    private readonly fetchImplementation: AiFetch = fetch,
  ) {}

  async generate(
    request: RecipeGenerationRequest,
    signal?: AbortSignal,
  ): Promise<RecipeGenerationResponse> {
    const startedAt = performance.now();
    const { body } = await fetchJson(
      this.provider,
      this.fetchImplementation,
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal,
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "goustia_recipe_batch",
              strict: true,
              schema: generatedRecipeBatchJsonSchema,
            },
          },
        }),
      },
    );
    const response = groqResponseSchema.safeParse(body);
    if (!response.success || !response.data.choices[0].message.content) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: response.success ? undefined : response.error,
      });
    }
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: error,
      });
    }
    const payload = providerRecipePayloadSchema.safeParse(parsedJson);
    if (!payload.success) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: payload.error,
      });
    }
    return {
      recipes: payload.data.recipes,
      provider: this.provider,
      model: response.data.model,
      durationMs: Math.round(performance.now() - startedAt),
      usage: {
        kind: "text",
        provider: this.provider,
        model: response.data.model,
        inputTokens: response.data.usage?.prompt_tokens ?? 0,
        outputTokens: response.data.usage?.completion_tokens ?? 0,
        neurons: 0,
        imageCount: 0,
      },
    };
  }
}
