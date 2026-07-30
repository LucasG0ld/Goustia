import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  HttpRequestError,
  applySecurityHeaders,
  buildContentSecurityPolicy,
  isTrustedMutation,
  parseBoundedJson,
} from "./http";

describe("HTTP security", () => {
  it("rejects oversized bodies before parsing", async () => {
    const request = new Request("https://goustia.test/api/v1/test", {
      method: "POST",
      headers: { "content-length": "1000" },
      body: "{}",
    });
    await expect(parseBoundedJson(request, z.object({}), 100)).rejects.toEqual(
      new HttpRequestError(413, "request_too_large"),
    );
  });

  it("validates JSON with a strict server schema", async () => {
    const request = new Request("https://goustia.test/api/v1/test", {
      method: "POST",
      body: JSON.stringify({ value: "ok", unexpected: true }),
    });
    await expect(
      parseBoundedJson(request, z.strictObject({ value: z.string().max(10) })),
    ).rejects.toMatchObject({ status: 400, code: "invalid_request" });
  });

  it("blocks cross-origin browser mutations", () => {
    expect(
      isTrustedMutation(
        new Request("https://goustia.test/api/v1/test", {
          method: "POST",
          headers: { origin: "https://attacker.test" },
        }),
      ),
    ).toBe(false);
    expect(
      isTrustedMutation(
        new Request("https://goustia.test/api/v1/test", {
          method: "POST",
          headers: { origin: "https://goustia.test" },
        }),
      ),
    ).toBe(true);
  });

  it("builds a nonce CSP and production headers", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "abc123",
      supabaseUrl: "https://project.supabase.co",
      development: false,
    });
    const headers = new Headers();
    applySecurityHeaders(headers, policy, true);
    expect(policy).toContain("script-src 'self' 'nonce-abc123'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(headers.get("strict-transport-security")).toContain("max-age=");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
  });
});
