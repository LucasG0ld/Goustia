import { headers } from "next/headers";
import { z } from "zod";

import { logger } from "@/lib/observability/logger";

const webVitalSchema = z.object({
  id: z.string().trim().min(1).max(200),
  name: z.enum(["CLS", "FCP", "INP", "LCP", "TTFB"]),
  value: z.number().finite().nonnegative(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  navigationType: z.string().trim().min(1).max(50),
});

export async function POST(request: Request) {
  const result = webVitalSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!result.success) {
    return Response.json({ error: "invalid_metric" }, { status: 400 });
  }

  const requestHeaders = await headers();

  logger.info("web_vital_recorded", {
    correlationId: requestHeaders.get("x-correlation-id"),
    metric: result.data,
  });

  return new Response(null, { status: 202 });
}
