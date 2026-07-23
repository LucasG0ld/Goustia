import { AiProviderError, normalizeProviderError } from "./errors";

export type ResilienceOptions = {
  timeoutMs: number;
  maximumAttempts: number;
  baseDelayMs: number;
  circuitFailureThreshold: number;
  circuitResetMs: number;
  sleep?: (durationMs: number) => Promise<void>;
  now?: () => number;
};

type CircuitState = {
  failures: number;
  openUntil: number;
};

export class ProviderCircuitBreaker {
  private readonly states = new Map<string, CircuitState>();

  assertClosed(key: string, now: number): void {
    const state = this.states.get(key);
    if (state && state.openUntil > now) {
      throw new AiProviderError({
        code: "circuit_open",
        provider: key,
        retryable: false,
      });
    }
    if (state?.openUntil && state.openUntil <= now) {
      this.states.delete(key);
    }
  }

  recordSuccess(key: string): void {
    this.states.delete(key);
  }

  recordFailure(
    key: string,
    now: number,
    threshold: number,
    resetMs: number,
  ): void {
    const current = this.states.get(key) ?? { failures: 0, openUntil: 0 };
    const failures = current.failures + 1;
    this.states.set(key, {
      failures,
      openUntil: failures >= threshold ? now + resetMs : 0,
    });
  }
}

const defaultSleep = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

export async function executeWithResilience<T>(
  provider: string,
  operation: (signal: AbortSignal) => Promise<T>,
  options: ResilienceOptions,
  breaker: ProviderCircuitBreaker,
  parentSignal?: AbortSignal,
): Promise<T> {
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;
  if (parentSignal?.aborted) {
    throw new AiProviderError({
      code: "aborted",
      provider,
      retryable: false,
      cause: parentSignal.reason,
    });
  }
  breaker.assertClosed(provider, now());
  let lastError: AiProviderError | undefined;

  for (let attempt = 1; attempt <= options.maximumAttempts; attempt += 1) {
    const timeoutController = new AbortController();
    const abortFromParent = () => timeoutController.abort(parentSignal?.reason);
    parentSignal?.addEventListener("abort", abortFromParent, { once: true });
    const timeout = setTimeout(
      () => timeoutController.abort(new Error("AI_PROVIDER_TIMEOUT")),
      options.timeoutMs,
    );
    try {
      const result = await operation(timeoutController.signal);
      breaker.recordSuccess(provider);
      return result;
    } catch (error) {
      const normalized =
        timeoutController.signal.aborted && !parentSignal?.aborted
          ? new AiProviderError({
              code: "timeout",
              provider,
              retryable: true,
              cause: error,
            })
          : normalizeProviderError(provider, error);
      lastError = normalized;
      breaker.recordFailure(
        provider,
        now(),
        options.circuitFailureThreshold,
        options.circuitResetMs,
      );
      if (!normalized.retryable || attempt === options.maximumAttempts) {
        throw normalized;
      }
      const exponentialDelay =
        options.baseDelayMs * 2 ** Math.max(0, attempt - 1);
      await sleep(normalized.retryAfterMs ?? exponentialDelay);
      breaker.assertClosed(provider, now());
    } finally {
      clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abortFromParent);
    }
  }

  throw lastError;
}
