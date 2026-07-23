import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

function localStatus() {
  const executable = path.resolve(
    "node_modules",
    "supabase",
    "dist",
    "supabase.js",
  );
  return JSON.parse(
    execFileSync(process.execPath, [executable, "status", "-o", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
}

const status =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? null
    : localStatus();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? status?.API_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? status?.SERVICE_ROLE_KEY;
assert.ok(url && serviceRoleKey, "Supabase local ou variables serveur requis");

const source = JSON.parse(
  await readFile(
    new URL("../data/ingredient-taxonomy.fr.v1.json", import.meta.url),
    "utf8",
  ),
);
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const versionId = source.version.id;

const { error: familyError } = await supabase
  .from("ingredient_families")
  .upsert(
    source.families.map((family) => ({
      id: family.id,
      code: family.code,
      name_fr: family.name,
      taxonomy_version_id: versionId,
    })),
    { onConflict: "code" },
  );
assert.ifError(familyError);
const familyIds = new Map(
  source.families.map((family) => [family.code, family.id]),
);

const { error: ingredientError } = await supabase.from("ingredients").upsert(
  source.ingredients.map((ingredient) => ({
    id: ingredient.id,
    slug: ingredient.slug,
    name_fr: ingredient.name,
    family_id: ingredient.family ? familyIds.get(ingredient.family) : null,
    contains_alcohol: ingredient.containsAlcohol ?? false,
    taxonomy_version_id: versionId,
    source_reference:
      "Règlement UE 1169/2011 annexe II ou corpus benchmark Goustia v1",
  })),
  { onConflict: "slug" },
);
assert.ifError(ingredientError);
const ingredientIds = new Map(
  source.ingredients.map((ingredient) => [ingredient.slug, ingredient.id]),
);

for (const ingredient of source.ingredients) {
  const { error } = await supabase.from("ingredient_synonyms").upsert(
    ingredient.synonyms.map((name) => ({
      ingredient_id: ingredient.id,
      name_fr: name,
      taxonomy_version_id: versionId,
    })),
    { onConflict: "ingredient_id,search_name", ignoreDuplicates: true },
  );
  assert.ifError(error);
}

const units = source.ingredients.flatMap((ingredient) =>
  ingredient.units.map((unit, index) => ({
    ingredient_id: ingredient.id,
    unit,
    is_preferred: index === 0,
    taxonomy_version_id: versionId,
  })),
);
const { error: unitError } = await supabase
  .from("ingredient_units")
  .upsert(units, { onConflict: "ingredient_id,unit" });
assert.ifError(unitError);

const { data: allergens, error: allergenReadError } = await supabase
  .from("allergens")
  .select("id,code");
assert.ifError(allergenReadError);
const allergenIds = new Map(
  allergens.map((allergen) => [allergen.code, allergen.id]),
);
const { error: mappingError } = await supabase
  .from("ingredient_allergens")
  .upsert(
    source.allergenMappings.map((mapping) => ({
      ingredient_id: ingredientIds.get(mapping.ingredient),
      allergen_id: allergenIds.get(mapping.allergen),
      relation: mapping.relation,
    })),
    { onConflict: "ingredient_id,allergen_id" },
  );
assert.ifError(mappingError);

const { error: relationError } = await supabase
  .from("ingredient_relations")
  .upsert(
    source.relations.map((relation) => ({
      parent_ingredient_id: ingredientIds.get(relation.parent),
      child_ingredient_id: ingredientIds.get(relation.child),
      kind: relation.kind,
    })),
    { onConflict: "parent_ingredient_id,child_ingredient_id,kind" },
  );
assert.ifError(relationError);

const { count, error: countError } = await supabase
  .from("ingredients")
  .select("id", { count: "exact", head: true })
  .eq("taxonomy_version_id", versionId);
assert.ifError(countError);
assert.equal(count, source.ingredients.length);
process.stdout.write(
  `Taxonomy ${source.version.name} imported idempotently: ${count} ingredients.\n`,
);
