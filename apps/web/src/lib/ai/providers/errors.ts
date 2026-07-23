export const aiProviderErrorCodes = [
  "aborted",
  "timeout",
  "rate_limited",
  "authentication",
  "invalid_request",
  "invalid_response",
  "provider_unavailable",
  "circuit_open",
  "unknown",
] as const;

export type AiProviderErrorCode = (typeof aiProviderErrorCodes)[number];

export class AiProviderError extends Error {
  readonly code: AiProviderErrorCode;
  readonly provider: string;
  readonly retryable: boolean;
  readonly status: number | null;
  readonly retryAfterMs: number | null;

  constructor(options: {
    code: AiProviderErrorCode;
    provider: string;
    retryable: boolean;
    message?: string;
    status?: number | null;
    retryAfterMs?: number | null;
    cause?: unknown;
  }) {
    super(options.message ?? options.code, { cause: options.cause });
    this.name = "AiProviderError";
    this.code = options.code;
    this.provider = options.provider;
    this.retryable = options.retryable;
    this.status = options.status ?? null;
    this.retryAfterMs = options.retryAfterMs ?? null;
  }
}

export function normalizeProviderError(
  provider: string,
  error: unknown,
): AiProviderError {
  if (error instanceof AiProviderError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new AiProviderError({
      code: "aborted",
      provider,
      retryable: false,
      cause: error,
    });
  }
  return new AiProviderError({
    code: "unknown",
    provider,
    retryable: false,
    cause: error,
  });
}

export function errorFromHttpResponse(
  provider: string,
  status: number,
  retryAfter: string | null,
): AiProviderError {
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;
  const retryAfterMs = Number.isFinite(retryAfterSeconds)
    ? retryAfterSeconds * 1000
    : null;
  if (status === 401 || status === 403) {
    return new AiProviderError({
      code: "authentication",
      provider,
      retryable: false,
      status,
    });
  }
  if (status === 429) {
    return new AiProviderError({
      code: "rate_limited",
      provider,
      retryable: true,
      status,
      retryAfterMs,
    });
  }
  if ([408, 424, 425, 498, 500, 502, 503, 504].includes(status)) {
    return new AiProviderError({
      code: "provider_unavailable",
      provider,
      retryable: true,
      status,
      retryAfterMs,
    });
  }
  return new AiProviderError({
    code: "invalid_request",
    provider,
    retryable: false,
    status,
  });
}
