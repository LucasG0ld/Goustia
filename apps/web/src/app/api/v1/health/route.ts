export function GET() {
  return Response.json({
    status: "ok",
    service: "recettes-web",
    apiVersion: "v1",
  });
}
