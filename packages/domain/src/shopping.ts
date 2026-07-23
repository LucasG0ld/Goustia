import { z } from "zod";

import { recipeUnits } from "./recipe";

const quantitySchema = z.number().positive().finite();

export const shoppingSourceLineSchema = z.strictObject({
  ingredientId: z.string().min(1),
  label: z.string().trim().min(1).max(160),
  quantity: quantitySchema.nullable(),
  unit: z.enum(recipeUnits).nullable(),
  recipeVersionId: z.uuid(),
  recipeServings: z.number().int().min(1).max(8),
  plannedServings: z.number().int().min(1).max(8),
  familyCode: z.string().trim().min(1).max(100).nullable(),
  densityGPerMl: quantitySchema.nullable().default(null),
  gramsPerUnit: quantitySchema.nullable().default(null),
});

export type ShoppingSourceLine = z.infer<typeof shoppingSourceLineSchema>;

export type AggregatedShoppingItem = {
  key: string;
  ingredientId: string;
  label: string;
  quantity: number | null;
  unit: (typeof recipeUnits)[number] | null;
  aisle: string;
  sourceRecipeVersionIds: string[];
};

const aisleByFamily: Record<string, string> = {
  vegetables: "Fruits et légumes",
  aromatics: "Fruits et légumes",
  meat: "Boucherie",
  fish: "Poissonnerie",
  dairy: "Produits frais",
  cereals: "Épicerie",
  legumes: "Épicerie",
  nuts: "Épicerie",
};

const roundQuantity = (value: number) =>
  Math.round((value + Number.EPSILON) * 1000) / 1000;

function normalizeLine(line: ShoppingSourceLine) {
  if (
    line.quantity === null ||
    line.unit === null ||
    line.unit === "to_taste"
  ) {
    return {
      bucket: `unquantified:${line.unit ?? "none"}`,
      quantity: null,
      unit: line.unit,
    };
  }
  const scaled = line.quantity * (line.plannedServings / line.recipeServings);
  if (line.unit === "g") {
    return { bucket: "mass", quantity: scaled, unit: "g" as const };
  }
  if (line.unit === "kg") {
    return { bucket: "mass", quantity: scaled * 1000, unit: "g" as const };
  }
  if (line.unit === "ml" || line.unit === "l") {
    const milliliters = line.unit === "l" ? scaled * 1000 : scaled;
    if (line.densityGPerMl) {
      return {
        bucket: "mass",
        quantity: milliliters * line.densityGPerMl,
        unit: "g" as const,
      };
    }
    return { bucket: "volume", quantity: milliliters, unit: "ml" as const };
  }
  if (line.gramsPerUnit) {
    return {
      bucket: "mass",
      quantity: scaled * line.gramsPerUnit,
      unit: "g" as const,
    };
  }
  return {
    bucket: `unit:${line.unit}`,
    quantity: scaled,
    unit: line.unit,
  };
}

export function aggregateShoppingItems(
  sourceLines: readonly ShoppingSourceLine[],
): AggregatedShoppingItem[] {
  const parsed = z.array(shoppingSourceLineSchema).max(1000).parse(sourceLines);
  const groups = new Map<
    string,
    Omit<AggregatedShoppingItem, "quantity" | "unit"> & {
      quantity: number | null;
      unit: AggregatedShoppingItem["unit"];
      bucket: string;
      sourceIds: Set<string>;
    }
  >();

  for (const line of parsed) {
    const normalized = normalizeLine(line);
    const key = `${line.ingredientId}:${normalized.bucket}`;
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        key,
        ingredientId: line.ingredientId,
        label: line.label,
        quantity: normalized.quantity,
        unit: normalized.unit,
        bucket: normalized.bucket,
        aisle: aisleByFamily[line.familyCode ?? ""] ?? "Autres",
        sourceRecipeVersionIds: [],
        sourceIds: new Set([line.recipeVersionId]),
      });
      continue;
    }
    if (existing.quantity !== null && normalized.quantity !== null) {
      existing.quantity += normalized.quantity;
    }
    existing.sourceIds.add(line.recipeVersionId);
  }

  return [...groups.values()]
    .map((item) => {
      let quantity = item.quantity;
      let unit = item.unit;
      if (quantity !== null && item.bucket === "mass" && quantity >= 1000) {
        quantity /= 1000;
        unit = "kg";
      } else if (
        quantity !== null &&
        item.bucket === "volume" &&
        quantity >= 1000
      ) {
        quantity /= 1000;
        unit = "l";
      }
      return {
        key: item.key,
        ingredientId: item.ingredientId,
        label: item.label,
        quantity: quantity === null ? null : roundQuantity(quantity),
        unit,
        aisle: item.aisle,
        sourceRecipeVersionIds: [...item.sourceIds].sort(),
      };
    })
    .sort(
      (left, right) =>
        left.aisle.localeCompare(right.aisle, "fr") ||
        left.label.localeCompare(right.label, "fr"),
    );
}

export function shoppingListToText(
  items: readonly Pick<
    AggregatedShoppingItem,
    "aisle" | "label" | "quantity" | "unit"
  >[],
) {
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    grouped.set(item.aisle, [...(grouped.get(item.aisle) ?? []), item]);
  }
  return [...grouped.entries()]
    .map(
      ([aisle, aisleItems]) =>
        `${aisle}\n${aisleItems
          .map(
            (item) =>
              `- ${item.label}${
                item.quantity === null
                  ? ""
                  : ` : ${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
              }`,
          )
          .join("\n")}`,
    )
    .join("\n\n");
}
