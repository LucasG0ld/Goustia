const REDACTED = "[REDACTED]";
const SENSITIVE_KEY =
  /(^|_)(authorization|cookie|password|secret|token|api_?key|email|first_?name|last_?name|full_?name|birth|allerg(?:y|ies|en|ens|ie|ies)?|intoler(?:ance|ances)?|restriction|prompt|ingredient)(_|$)/i;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BEARER_VALUE = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;

function redactString(value: string): string {
  return value.replace(EMAIL_VALUE, REDACTED).replace(BEARER_VALUE, REDACTED);
}

function redactUnknown(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (value instanceof Error) {
    return { errorType: value.name };
  }

  if (seen.has(value)) {
    return "[CIRCULAR]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactUnknown(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? REDACTED : redactUnknown(item, seen),
    ]),
  );
}

export function redact<T>(value: T): T {
  return redactUnknown(value, new WeakSet()) as T;
}

export function sanitizeSentryEvent<T>(event: T): T {
  const sanitized = redact(event) as T;
  const record = sanitized as Record<string, unknown>;

  delete record.user;

  if (record.request && typeof record.request === "object") {
    const request = record.request as Record<string, unknown>;
    delete request.cookies;
    delete request.data;
    delete request.env;
    delete request.headers;
    delete request.query_string;

    if (typeof request.url === "string") {
      request.url = request.url.split("?")[0];
    }
  }

  return sanitized;
}
