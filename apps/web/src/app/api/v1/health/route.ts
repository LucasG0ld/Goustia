import { serverEnv } from "@/lib/env/server";

export function GET() {
  return Response.json({
    status: "ok",
    service: "goustia-web",
    apiVersion: "v1",
    environment: serverEnv.APP_ENV,
  });
}
