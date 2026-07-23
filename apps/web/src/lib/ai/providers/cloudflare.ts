import { generatedRecipeBatchJsonSchema } from "@recettes/domain";
import { z } from "zod";

import {
  cloudflareEnvelopeSchema,
  providerRecipePayloadSchema,
  type RecipeGenerationRequest,
  type RecipeGenerationResponse,
  type RecipeGenerator,
  type RecipeImageGenerator,
  type RecipeImageRequest,
  type RecipeImageResponse,
} from "./contracts";
import { AiProviderError } from "./errors";
import { decodeBase64, fetchJson, type AiFetch } from "./http";

const textResultSchema = z.union([
  z.object({ response: z.string() }),
  z.object({
    choices: z
      .array(z.object({ message: z.object({ content: z.string() }) }))
      .min(1),
    usage: z
      .object({
        prompt_tokens: z.number().optional(),
        completion_tokens: z.number().optional(),
      })
      .optional(),
  }),
]);

const imageResultSchema = z.object({ image: z.string().min(1) });

function cloudflareUrl(accountId: string, model: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
    accountId,
  )}/ai/run/${model}`;
}

function unwrapCloudflare(body: unknown, provider = "cloudflare"): unknown {
  const envelope = cloudflareEnvelopeSchema.safeParse(body);
  if (!envelope.success || !envelope.data.success) {
    throw new AiProviderError({
      code: "invalid_response",
      provider,
      retryable: true,
      cause: envelope.success ? envelope.data.errors : envelope.error,
    });
  }
  return envelope.data.result;
}

export class CloudflareRecipeGenerator implements RecipeGenerator {
  readonly provider = "cloudflare" as const;

  constructor(
    readonly model: string,
    private readonly accountId: string,
    private readonly apiToken: string,
    private readonly fetchImplementation: AiFetch = fetch,
  ) {}

  async generate(
    request: RecipeGenerationRequest,
    signal?: AbortSignal,
  ): Promise<RecipeGenerationResponse> {
    const startedAt = performance.now();
    const { body, headers } = await fetchJson(
      this.provider,
      this.fetchImplementation,
      cloudflareUrl(this.accountId, this.model),
      {
        method: "POST",
        signal,
        headers: {
          authorization: `Bearer ${this.apiToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: request.systemPrompt },
            { role: "user", content: request.userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: generatedRecipeBatchJsonSchema,
          },
        }),
      },
    );
    const result = textResultSchema.safeParse(unwrapCloudflare(body));
    if (!result.success) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: result.error,
      });
    }
    const content =
      "response" in result.data
        ? result.data.response
        : result.data.choices[0].message.content;
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch (error) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: error,
      });
    }
    const payload = providerRecipePayloadSchema.safeParse(json);
    if (!payload.success) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: payload.error,
      });
    }
    const neurons = Number(headers.get("cf-ai-neurons") ?? 0);
    return {
      recipes: payload.data.recipes,
      provider: this.provider,
      model: this.model,
      durationMs: Math.round(performance.now() - startedAt),
      usage: {
        kind: "text",
        provider: this.provider,
        model: this.model,
        inputTokens:
          "usage" in result.data ? (result.data.usage?.prompt_tokens ?? 0) : 0,
        outputTokens:
          "usage" in result.data
            ? (result.data.usage?.completion_tokens ?? 0)
            : 0,
        neurons: Number.isFinite(neurons) ? neurons : 0,
        imageCount: 0,
      },
    };
  }
}

export class CloudflareImageGenerator implements RecipeImageGenerator {
  readonly provider = "cloudflare" as const;

  constructor(
    readonly model: string,
    private readonly accountId: string,
    private readonly apiToken: string,
    private readonly fetchImplementation: AiFetch = fetch,
  ) {}

  async generate(
    request: RecipeImageRequest,
    signal?: AbortSignal,
  ): Promise<RecipeImageResponse> {
    const startedAt = performance.now();
    const isSchnell = this.model.endsWith("/flux-1-schnell");
    const formData = new FormData();
    formData.set("prompt", request.prompt);
    formData.set("width", String(request.width));
    formData.set("height", String(request.height));
    formData.set("seed", String(request.seed));
    const { body, headers } = await fetchJson(
      this.provider,
      this.fetchImplementation,
      cloudflareUrl(this.accountId, this.model),
      {
        method: "POST",
        signal,
        headers: isSchnell
          ? {
              authorization: `Bearer ${this.apiToken}`,
              "content-type": "application/json",
            }
          : { authorization: `Bearer ${this.apiToken}` },
        body: isSchnell
          ? JSON.stringify({
              prompt: request.prompt,
              seed: request.seed,
              steps: 4,
            })
          : formData,
      },
    );
    const result = imageResultSchema.safeParse(unwrapCloudflare(body));
    if (!result.success) {
      throw new AiProviderError({
        code: "invalid_response",
        provider: this.provider,
        retryable: true,
        cause: result.error,
      });
    }
    const neurons = Number(headers.get("cf-ai-neurons") ?? 0);
    return {
      bytes: decodeBase64(result.data.image),
      contentType: "image/jpeg",
      width: request.width,
      height: request.height,
      provider: this.provider,
      model: this.model,
      durationMs: Math.round(performance.now() - startedAt),
      usage: {
        kind: "image",
        provider: this.provider,
        model: this.model,
        inputTokens: 0,
        outputTokens: 0,
        neurons: Number.isFinite(neurons) ? neurons : 0,
        imageCount: 1,
      },
    };
  }
}
