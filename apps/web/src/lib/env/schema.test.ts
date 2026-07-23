import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./schema";

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
  });

  it("échoue avec un message exploitable lorsqu'une variable manque", () => {
    expect(() =>
      parseServerEnv({
        ...validEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: undefined,
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
