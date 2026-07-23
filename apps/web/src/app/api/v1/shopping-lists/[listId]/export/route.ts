import { shoppingListToText } from "@recettes/domain";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getVerifiedUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

const csvCell = (value: string | number | null) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(
  request: Request,
  context: { params: Promise<{ listId: string }> },
) {
  const user = await getVerifiedUser();
  if (!user) {
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  }
  const listId = z.uuid().safeParse((await context.params).listId);
  const format = new URL(request.url).searchParams.get("format") ?? "txt";
  if (!listId.success || !["txt", "csv"].includes(format)) {
    return NextResponse.json({ error: "invalid_export" }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("shopping_list_items")
    .select("manual_label,quantity,unit,aisle,ingredients(name_fr)")
    .eq("shopping_list_id", listId.data)
    .eq("user_id", user.id)
    .order("aisle");
  if (error) {
    return NextResponse.json({ error: "export_failed" }, { status: 500 });
  }
  const normalized = items.map((item) => ({
    aisle: item.aisle ?? "Autres",
    label: item.manual_label ?? item.ingredients[0]?.name_fr ?? "Produit",
    quantity: item.quantity,
    unit: item.unit,
  }));
  const content =
    format === "csv"
      ? [
          ["Rayon", "Produit", "Quantité", "Unité"].map(csvCell).join(","),
          ...normalized.map((item) =>
            [item.aisle, item.label, item.quantity, item.unit]
              .map(csvCell)
              .join(","),
          ),
        ].join("\r\n")
      : shoppingListToText(normalized);
  return new NextResponse(content, {
    headers: {
      "content-disposition": `attachment; filename="courses-goustia.${format}"`,
      "content-type":
        format === "csv"
          ? "text/csv; charset=utf-8"
          : "text/plain; charset=utf-8",
      "cache-control": "private, no-store",
    },
  });
}
