import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const querySchema = z.strictObject({
  cursor: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    cursor: url.searchParams.get("cursor") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_pagination" }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from("recipe_versions")
    .select(
      "id,recipe_id,title,description,servings,preparation_minutes,cooking_minutes,difficulty,published_at",
    )
    .eq("validation_status", "validated")
    .eq("publication_status", "published")
    .order("published_at", { ascending: false })
    .limit(parsed.data.limit + 1);
  if (parsed.data.cursor) {
    query = query.lt("published_at", parsed.data.cursor);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });
  }

  const hasMore = data.length > parsed.data.limit;
  const items = data.slice(0, parsed.data.limit);
  return NextResponse.json(
    {
      items,
      nextCursor: hasMore ? (items.at(-1)?.published_at ?? null) : null,
    },
    {
      headers: {
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
