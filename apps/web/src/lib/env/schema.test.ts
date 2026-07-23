import { describe, expect, it } from "vitest";

import { getAiConfigurationReadiness, parseServerEnv } from "./schema";

const validEnvironment = {
  APP_ENV: "test",
  NEXT_PUBLIC_APP_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  NEXT_PUBLIC_OBSERVABILITY_ENABLED: "false",
};

describe("parseServerEnv", () => {
  it("applique des valeurs sûres aux options facultatives", () => {
    const result = parseServerEnv(validEnvironment);

    expect(result.OBSERVABILITY_ENABLED).toBe(false);
    expect(result.LOG_LEVEL).toBe("info");
    expect(result.AI_TEXT_PROVIDER).toBe("groq");
    expect(result.AI_GENERATION_ENABLED).toBe(false);
    expect(getAiConfigurationReadiness(result)).toEqual({
      ready: true,
      issues: [],
    });
  });

  it("échoue avec un message exploitable lorsqu'une variable manque", () => {
    expect(() =>
      parseServerEnv({
        ...validEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: undefined,
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("détecte les secrets absents sans appeler de fournisseur", () => {
    const result = parseServerEnv({
      ...validEnvironment,
      AI_GENERATION_ENABLED: "true",
    });
    expect(getAiConfigurationReadiness(result)).toEqual({
      ready: false,
      issues: [
        "GROQ_API_KEY manque pour le fournisseur sélectionné",
        "CLOUDFLARE_ACCOUNT_ID manque pour le fournisseur sélectionné",
        "CLOUDFLARE_API_TOKEN manque pour le fournisseur sélectionné",
      ],
    });
  });

  it("valide une configuration factice sans secret", () => {
    const result = parseServerEnv({
      ...validEnvironment,
      AI_GENERATION_ENABLED: "true",
      AI_TEXT_PROVIDER: "fake",
      AI_TEXT_FALLBACK_PROVIDER: "fake",
      AI_IMAGE_PROVIDER: "fake",
    });
    expect(getAiConfigurationReadiness(result)).toEqual({
      ready: true,
      issues: [],
    });
  });

  it("valide uniquement la présence des secrets réels", () => {
    const result = parseServerEnv({
      ...validEnvironment,
      AI_GENERATION_ENABLED: "true",
      GROQ_API_KEY: "test-only-groq-key",
      CLOUDFLARE_ACCOUNT_ID: "test-only-account",
      CLOUDFLARE_API_TOKEN: "test-only-cloudflare-token",
    });
    expect(getAiConfigurationReadiness(result)).toEqual({
      ready: true,
      issues: [],
    });
  });
});
