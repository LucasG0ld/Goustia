import { z } from "zod";

export const aiUsageKinds = ["text", "image"] as const;

export const aiUsageSchema = z.strictObject({
  kind: z.enum(aiUsageKinds),
  provider: z.enum(["fake", "groq", "cloudflare"]),
  model: z.string().trim().min(1).max(200),
  inputTokens: z.number().int().nonnegative().default(0),
  outputTokens: z.number().int().nonnegative().default(0),
  neurons: z.number().nonnegative().default(0),
  imageCount: z.number().int().nonnegative().default(0),
});

export const aiCostRatesSchema = z.strictObject({
  inputUsdPerMillionTokens: z.number().nonnegative().default(0),
  outputUsdPerMillionTokens: z.number().nonnegative().default(0),
  usdPerNeuron: z.number().nonnegative().default(0),
  usdPerImage: z.number().nonnegative().default(0),
});

export type AiUsage = z.input<typeof aiUsageSchema>;
export type AiCostRates = z.input<typeof aiCostRatesSchema>;

export function estimateAiCostUsd(
  rawUsage: AiUsage,
  rawRates: AiCostRates,
): number {
  const usage = aiUsageSchema.parse(rawUsage);
  const rates = aiCostRatesSchema.parse(rawRates);
  const amount =
    (usage.inputTokens * rates.inputUsdPerMillionTokens) / 1_000_000 +
    (usage.outputTokens * rates.outputUsdPerMillionTokens) / 1_000_000 +
    usage.neurons * rates.usdPerNeuron +
    usage.imageCount * rates.usdPerImage;
  return Math.round(amount * 1_000_000) / 1_000_000;
}

export function quotaAlertLevel(
  used: number,
  limit: number,
): 0 | 50 | 80 | 95 | 100 {
  if (limit <= 0 || used >= limit) return 100;
  const percent = (used / limit) * 100;
  if (percent >= 95) return 95;
  if (percent >= 80) return 80;
  if (percent >= 50) return 50;
  return 0;
}
