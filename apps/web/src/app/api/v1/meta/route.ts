export function GET() {
  return Response.json(
    {
      apiVersion: "1",
      status: "stable",
      capabilities: [
        "public_recipe_catalog",
        "authenticated_profile",
        "meal_planning",
        "recipe_feedback",
      ],
      documentation: "/aide",
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
