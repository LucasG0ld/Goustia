import "server-only";

import type { AggregatedShoppingItem } from "@recettes/domain";

import { createClient } from "@/lib/supabase/server";

export type ShoppingItemView = {
  id: string;
  label: string;
  quantity: number | null;
  unit: AggregatedShoppingItem["unit"];
  aisle: string;
  checked: boolean;
  available: boolean;
  manual: boolean;
  revision: number;
  sources: { recipeVersionId: string; title: string }[];
};

export type ShoppingListView = {
  id: string;
  title: string;
  revision: number;
  planRevision: number | null;
  items: ShoppingItemView[];
};

export async function getCurrentShoppingList(userId: string) {
  const supabase = await createClient();
  const { data: plan, error: planError } = await supabase
    .from("meal_plans")
    .select("id,revision,week_start")
    .eq("user_id", userId)
    .in("status", ["draft", "ready", "generating"])
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (planError) throw new Error("SHOPPING_PLAN_READ_FAILED");
  if (!plan) return { plan: null, list: null };

  const { data: list, error: listError } = await supabase
    .from("shopping_lists")
    .select("id,title,revision,plan_revision")
    .eq("user_id", userId)
    .eq("meal_plan_id", plan.id)
    .maybeSingle();
  if (listError) throw new Error("SHOPPING_LIST_READ_FAILED");
  if (!list) return { plan, list: null };

  const { data: items, error: itemError } = await supabase
    .from("shopping_list_items")
    .select(
      "id,ingredient_id,manual_label,quantity,unit,aisle,checked_at,is_available,revision,ingredients(name_fr),shopping_list_item_sources(recipe_version_id,recipe_versions(title))",
    )
    .eq("shopping_list_id", list.id)
    .eq("user_id", userId)
    .order("aisle")
    .order("created_at");
  if (itemError) throw new Error("SHOPPING_ITEMS_READ_FAILED");

  return {
    plan,
    list: {
      id: list.id,
      title: list.title,
      revision: list.revision,
      planRevision: list.plan_revision,
      items: items.map((item) => ({
        id: item.id,
        label:
          item.manual_label ??
          item.ingredients[0]?.name_fr ??
          "Produit sans libellé",
        quantity: item.quantity,
        unit: item.unit,
        aisle: item.aisle ?? "Autres",
        checked: Boolean(item.checked_at),
        available: item.is_available,
        manual: Boolean(item.manual_label),
        revision: item.revision,
        sources: item.shopping_list_item_sources.map((source) => ({
          recipeVersionId: source.recipe_version_id,
          title: source.recipe_versions[0]?.title ?? "Recette",
        })),
      })),
    } satisfies ShoppingListView,
  };
}
