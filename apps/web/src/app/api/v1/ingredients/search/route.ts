import { normalizeFrenchSearchTerm } from "@recettes/domain";
import { type NextRequest, NextResponse } from "next/server";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!(await getVerifiedUser()))
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const normalized = normalizeFrenchSearchTerm(
    request.nextUrl.searchParams.get("q") ?? "",
  ).slice(0, 80);
  if (normalized.length < 2) return NextResponse.json({ items: [] });
  const supabase = await createClient();
  const [{ data: ingredients }, { data: synonyms }, { data: allergens }] =
    await Promise.all([
      supabase
        .from("ingredients")
        .select("id,name_fr,contains_alcohol")
        .eq("is_active", true)
        .ilike("search_name", `%${normalized}%`)
        .limit(12),
      supabase
        .from("ingredient_synonyms")
        .select(
          "ingredient_id,name_fr,ingredients!inner(name_fr,contains_alcohol,is_active)",
        )
        .ilike("search_name", `%${normalized}%`)
        .eq("ingredients.is_active", true)
        .limit(8),
      supabase
        .from("allergens")
        .select("id,name_fr")
        .ilike(
          "name_fr",
          `%${request.nextUrl.searchParams.get("q")?.slice(0, 80) ?? ""}%`,
        )
        .limit(8),
    ]);
  const seen = new Set<string>();
  const items = [
    ...(ingredients ?? []).map((item) => ({
      id: item.id,
      label: item.name_fr,
      targetType: "ingredient",
      containsAlcohol: item.contains_alcohol,
    })),
    ...(synonyms ?? []).flatMap((item) => {
      const ingredient = item.ingredients[0];
      return ingredient
        ? [
            {
              id: item.ingredient_id,
              label: ingredient.name_fr,
              matchedLabel: item.name_fr,
              targetType: "ingredient",
              containsAlcohol: ingredient.contains_alcohol,
            },
          ]
        : [];
    }),
    ...(allergens ?? []).map((item) => ({
      id: item.id,
      label: item.name_fr,
      targetType: "allergen",
    })),
  ].filter((item) => {
    const key = `${item.targetType}:${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return NextResponse.json(
    { items },
    { headers: { "cache-control": "private, max-age=30" } },
  );
}
