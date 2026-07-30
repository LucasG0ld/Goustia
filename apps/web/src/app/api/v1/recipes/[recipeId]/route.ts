import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const recipeId = z.uuid().safeParse((await params).recipeId);
  if (!recipeId.success) {
    return NextResponse.json({ error: "invalid_recipe_id" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipe_versions")
    .select(
      "id,recipe_id,title,description,servings,preparation_minutes,cooking_minutes,resting_minutes,difficulty,cost_level,recipe_ingredients(position,quantity,unit,preparation_note,optional,ingredients(id,slug,name_fr)),recipe_steps(position,instruction,timer_seconds),recipe_nutrition(*)",
    )
    .eq("recipe_id", recipeId.data)
    .eq("validation_status", "validated")
    .eq("publication_status", "published")
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "recipe_unavailable" }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json({ error: "recipe_not_found" }, { status: 404 });
  }
  return NextResponse.json(data, {
    headers: {
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
