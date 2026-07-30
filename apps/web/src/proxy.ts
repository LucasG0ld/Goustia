import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshAuthSession } from "@/lib/supabase/proxy";
import {
  applySecurityHeaders,
  buildContentSecurityPolicy,
  isTrustedMutation,
} from "@/lib/security/http";
import { publicEnv } from "@/lib/env/public";

const CORRELATION_HEADER = "x-correlation-id";
const SAFE_CORRELATION_ID = /^[a-zA-Z0-9._-]{8,128}$/;

export async function proxy(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json(
      { error: "untrusted_request_origin" },
      { status: 403 },
    );
  }

  const incomingId = request.headers.get(CORRELATION_HEADER);
  const correlationId =
    incomingId && SAFE_CORRELATION_ID.test(incomingId)
      ? incomingId
      : crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_HEADER, correlationId);
  const nonce = btoa(crypto.randomUUID());
  const policy = buildContentSecurityPolicy({
    nonce,
    supabaseUrl: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    development: process.env.NODE_ENV !== "production",
  });
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", policy);

  const response = await refreshAuthSession(request, requestHeaders);
  response.headers.set(CORRELATION_HEADER, correlationId);
  applySecurityHeaders(
    response.headers,
    policy,
    process.env.NODE_ENV === "production",
  );
  const publicCacheCompatible =
    request.method === "GET" &&
    (request.nextUrl.pathname === "/api/v1/meta" ||
      request.nextUrl.pathname === "/api/v1/recipes" ||
      request.nextUrl.pathname.startsWith("/api/v1/recipes/"));
  if (
    request.nextUrl.pathname.startsWith("/api/v1/") &&
    !request.nextUrl.pathname.startsWith("/api/v1/health") &&
    !publicCacheCompatible
  ) {
    response.headers.set("cache-control", "private, no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
