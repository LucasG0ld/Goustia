import { describe, expect, it, vi } from "vitest";

import { AiProviderError } from "./errors";
import { executeWithResilience, ProviderCircuitBreaker } from "./resilience";

const options = {
  timeoutMs: 100,
  maximumAttempts: 3,
  baseDelayMs: 1,
  circuitFailureThreshold: 5,
  circuitResetMs: 1000,
  sleep: async () => undefined,
  now: () => 100,
};

describe("résilience des fournisseurs", () => {
  it("retente uniquement les erreurs temporaires", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(
        new AiProviderError({
          code: "rate_limited",
          provider: "groq",
          retryable: true,
        }),
      )
      .mockResolvedValue("ok");
    await expect(
      executeWithResilience(
        "groq",
        operation,
        options,
        new ProviderCircuitBreaker(),
      ),
    ).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("ouvre le circuit après le seuil d'échecs", async () => {
    const breaker = new ProviderCircuitBreaker();
    const failing = () =>
      Promise.reject(
        new AiProviderError({
          code: "provider_unavailable",
          provider: "cloudflare",
          retryable: true,
        }),
      );
    await expect(
      executeWithResilience(
        "cloudflare",
        failing,
        {
          ...options,
          maximumAttempts: 1,
          circuitFailureThreshold: 1,
        },
        breaker,
      ),
    ).rejects.toMatchObject({ code: "provider_unavailable" });
    await expect(
      executeWithResilience("cloudflare", failing, options, breaker),
    ).rejects.toMatchObject({ code: "circuit_open" });
  });

  it("transforme une expiration en erreur normalisée", async () => {
    await expect(
      executeWithResilience(
        "groq",
        (signal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            );
          }),
        { ...options, timeoutMs: 5, maximumAttempts: 1 },
        new ProviderCircuitBreaker(),
      ),
    ).rejects.toMatchObject({ code: "timeout", retryable: true });
  });

  it("ne démarre aucun appel lorsque le parent est déjà annulé", async () => {
    const controller = new AbortController();
    controller.abort();
    const operation = vi.fn(async () => "never");
    await expect(
      executeWithResilience(
        "groq",
        operation,
        options,
        new ProviderCircuitBreaker(),
        controller.signal,
      ),
    ).rejects.toMatchObject({ code: "aborted", retryable: false });
    expect(operation).not.toHaveBeenCalled();
  });
});
