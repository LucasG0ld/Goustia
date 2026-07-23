import { describe, expect, it } from "vitest";

import { redact, sanitizeSentryEvent } from "./redact";

describe("redact", () => {
  it("masque les clés et valeurs sensibles sans altérer les métriques", () => {
    expect(
      redact({
        email: "personne@example.test",
        nested: {
          allergy: "arachide",
          authorization: "Bearer secret-token",
          latencyMs: 42,
        },
      }),
    ).toEqual({
      email: "[REDACTED]",
      nested: {
        allergy: "[REDACTED]",
        authorization: "[REDACTED]",
        latencyMs: 42,
      },
    });
  });

  it("retire les informations de requête des événements Sentry", () => {
    const event = sanitizeSentryEvent({
      user: { email: "personne@example.test" },
      request: {
        url: "https://goustia.test/recette?email=personne@example.test",
        headers: { cookie: "session=secret" },
      },
    });

    expect(event.user).toBeUndefined();
    expect(event.request).toEqual({
      url: "https://goustia.test/recette",
    });
  });
});
