import { describe, expect, it } from "vitest";

import { estimateAiCostUsd, quotaAlertLevel } from "./ai-usage";

describe("consommation et coûts IA", () => {
  it("calcule un coût déterministe à partir des unités fournisseur", () => {
    expect(
      estimateAiCostUsd(
        {
          kind: "text",
          provider: "groq",
          model: "openai/gpt-oss-120b",
          inputTokens: 1_000_000,
          outputTokens: 500_000,
        },
        {
          inputUsdPerMillionTokens: 0.15,
          outputUsdPerMillionTokens: 0.6,
        },
      ),
    ).toBe(0.45);
  });

  it.each([
    [0, 100, 0],
    [50, 100, 50],
    [80, 100, 80],
    [95, 100, 95],
    [100, 100, 100],
  ] as const)("retourne le seuil %s/%s", (used, limit, expected) => {
    expect(quotaAlertLevel(used, limit)).toBe(expected);
  });
});
