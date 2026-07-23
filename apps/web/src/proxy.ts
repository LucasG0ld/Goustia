import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CORRELATION_HEADER = "x-correlation-id";
const SAFE_CORRELATION_ID = /^[a-zA-Z0-9._-]{8,128}$/;

export function proxy(request: NextRequest) {
  const incomingId = request.headers.get(CORRELATION_HEADER);
  const correlationId =
    incomingId && SAFE_CORRELATION_ID.test(incomingId)
      ? incomingId
      : crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_HEADER, correlationId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(CORRELATION_HEADER, correlationId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
