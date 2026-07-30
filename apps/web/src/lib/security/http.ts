import { z } from "zod";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class HttpRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

export async function parseBoundedJson<T extends z.ZodType>(
  request: Request,
  schema: T,
  maxBytes = 32_768,
): Promise<z.output<T>> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpRequestError(413, "request_too_large");
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw new HttpRequestError(413, "request_too_large");
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    throw new HttpRequestError(400, "invalid_json");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new HttpRequestError(400, "invalid_request");
  }
  return parsed.data;
}

export function isTrustedMutation(request: Request): boolean {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const expectedOrigin =
    forwardedHost && forwardedProto
      ? `${forwardedProto}://${forwardedHost}`
      : requestUrl.origin;

  try {
    return new URL(origin).origin === new URL(expectedOrigin).origin;
  } catch {
    return false;
  }
}

export function buildContentSecurityPolicy({
  nonce,
  supabaseUrl,
  development,
}: {
  nonce: string;
  supabaseUrl: string;
  development: boolean;
}): string {
  const supabaseOrigin = new URL(supabaseUrl).origin;
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(development ? ["'unsafe-eval'"] : []),
  ];
  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: blob: ${supabaseOrigin}`,
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseOrigin} https://*.sentry.io`,
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function applySecurityHeaders(
  headers: Headers,
  policy: string,
  production: boolean,
): void {
  headers.set("content-security-policy", policy);
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("x-goustia-api-version", "1");
  if (production) {
    headers.set(
      "strict-transport-security",
      "max-age=31536000; includeSubDomains",
    );
  }
}
