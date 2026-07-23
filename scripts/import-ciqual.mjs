import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readSheet } from "read-excel-file/node";

const SOURCE = {
  id: "ciqual-2025-11-03",
  name: "Table de composition nutritionnelle des aliments Ciqual 2025",
  url: "https://ciqual.anses.fr/cms/sites/default/files/inline-files/Table%20Ciqual%202025_FR_2025_11_03.xlsx",
  documentationUrl:
    "https://ciqual.anses.fr/cms/sites/default/files/inline-files/Table%20Ciqual%202025%20doc%20FR_2025_11_19.pdf",
  doi: "10.57745/RDMHWY",
  license: "Licence Ouverte / Open Licence 2.0",
  attribution:
    "Anses. Table de composition nutritionnelle des aliments Ciqual 2025, version du 3 novembre 2025.",
  publishedOn: "2025-11-03",
  sha256: "d2082938522d909119fbdc8772c028017163650dd81e31d13fdb8a8bd702f32e",
};

const DISPLAYED_CONSTITUENTS = [
  { code: "328", infoodsTag: "ENERC", column: 11, unit: "kcal" },
  { code: "25000", infoodsTag: "PROCNT", column: 15, unit: "g" },
  { code: "31000", infoodsTag: "CHOAVL", column: 17, unit: "g" },
  { code: "40000", infoodsTag: "FAT", column: 18, unit: "g" },
  { code: "34100", infoodsTag: "FIB-", column: 27, unit: "g" },
  { code: "10004", infoodsTag: null, column: 50, unit: "g" },
];

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

async function getSourceBuffer() {
  if (process.env.CIQUAL_SOURCE_FILE) {
    return readFile(path.resolve(process.env.CIQUAL_SOURCE_FILE));
  }

  const response = await fetch(SOURCE.url, {
    headers: { "user-agent": "Goustia-Ciqual-Importer/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  assert.equal(
    response.ok,
    true,
    `Téléchargement Ciqual impossible (${response.status})`,
  );
  return Buffer.from(await response.arrayBuffer());
}

function text(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function parseCiqualValue(value) {
  const rawValue = String(value ?? "").trim();
  const normalized = rawValue.toLocaleLowerCase("fr-FR");

  if (!rawValue || rawValue === "-") {
    return {
      raw_value: rawValue || "-",
      value_status: "missing",
      numeric_value: null,
      upper_bound: null,
    };
  }

  if (normalized === "traces" || normalized === "trace") {
    return {
      raw_value: rawValue,
      value_status: "trace",
      numeric_value: null,
      upper_bound: null,
    };
  }

  if (normalized.startsWith("<")) {
    const upperBound = Number(normalized.slice(1).trim().replace(",", "."));
    return {
      raw_value: rawValue,
      value_status: Number.isFinite(upperBound) ? "less_than" : "unparsed",
      numeric_value: null,
      upper_bound: Number.isFinite(upperBound) ? upperBound : null,
    };
  }

  const numericValue =
    typeof value === "number" ? value : Number(rawValue.replace(",", "."));
  return {
    raw_value: rawValue,
    value_status: Number.isFinite(numericValue) ? "exact" : "unparsed",
    numeric_value: Number.isFinite(numericValue) ? numericValue : null,
    upper_bound: null,
  };
}

async function upsertInChunks(table, rows, onConflict, chunkSize = 500) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const { error } = await supabase
      .from(table)
      .upsert(rows.slice(index, index + chunkSize), { onConflict });
    assert.ifError(error);
  }
}

const status =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? null
    : localStatus();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? status?.API_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? status?.SERVICE_ROLE_KEY;
assert.ok(url && serviceRoleKey, "Supabase local ou variables serveur requis");

const sourceBuffer = await getSourceBuffer();
assert.equal(
  createHash("sha256").update(sourceBuffer).digest("hex"),
  SOURCE.sha256,
  "L’empreinte du fichier Ciqual a changé : créer une nouvelle version avant import",
);

const [composition, infoods] = await Promise.all([
  readSheet(sourceBuffer, "composition nutritionnelle"),
  readSheet(sourceBuffer, "codes INFOODS"),
]);
assert.ok(
  composition.length > 1 && infoods.length > 1,
  "Onglets Ciqual 2025 attendus absents",
);

const sourceNames = new Map();
for (const row of infoods.slice(1)) {
  sourceNames.set(text(row[1]), text(row[2]));
}

const constituents = DISPLAYED_CONSTITUENTS.map((item) => ({
  source_version_id: SOURCE.id,
  code: item.code,
  infoods_tag: item.infoodsTag,
  name_fr: sourceNames.get(item.code),
  unit: item.unit,
  source_column: item.column,
  displayed: true,
}));
assert.ok(
  constituents.every((item) => item.name_fr),
  "Métadonnées des constituants affichés incomplètes",
);

const foods = [];
const nutrientValues = [];
for (const [index, row] of composition.slice(1).entries()) {
  const rowNumber = index + 2;
  const code = text(row[6]);
  const name = text(row[7]);
  assert.match(
    code,
    /^[0-9]+$/,
    `Code aliment invalide à la ligne ${rowNumber}`,
  );
  assert.ok(name, `Nom aliment absent à la ligne ${rowNumber}`);

  foods.push({
    source_version_id: SOURCE.id,
    code,
    name_fr: name,
    scientific_name: text(row[8]) || null,
    group_code: text(row[0]),
    subgroup_code: text(row[1]),
    subsubgroup_code: text(row[2]),
    group_name_fr: text(row[3]) || null,
    subgroup_name_fr: text(row[4]) || null,
    subsubgroup_name_fr: text(row[5]) || null,
  });

  for (const constituent of DISPLAYED_CONSTITUENTS) {
    nutrientValues.push({
      source_version_id: SOURCE.id,
      food_code: code,
      constituent_code: constituent.code,
      ...parseCiqualValue(row[constituent.column - 1]),
    });
  }
}

assert.equal(
  foods.length,
  3484,
  "Le millésime Ciqual doit contenir 3 484 aliments",
);
assert.equal(
  new Set(foods.map((food) => food.code)).size,
  foods.length,
  "Les codes aliments Ciqual doivent être uniques",
);
for (const knownCode of ["20507", "19016", "22000", "20385", "12120"]) {
  assert.ok(
    foods.some((food) => food.code === knownCode),
    `Aliment témoin ${knownCode} absent`,
  );
}

const mappingsSource = JSON.parse(
  await readFile(
    new URL("../data/ciqual-mappings.fr.v1.json", import.meta.url),
    "utf8",
  ),
);
assert.equal(mappingsSource.sourceVersion, SOURCE.id);

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error: sourceError } = await supabase
  .from("nutrition_source_versions")
  .upsert(
    {
      id: SOURCE.id,
      source_name: SOURCE.name,
      source_url: SOURCE.url,
      documentation_url: SOURCE.documentationUrl,
      doi: SOURCE.doi,
      license_name: SOURCE.license,
      attribution: SOURCE.attribution,
      source_sha256: SOURCE.sha256,
      published_on: SOURCE.publishedOn,
      is_current: false,
    },
    { onConflict: "id" },
  );
assert.ifError(sourceError);

await upsertInChunks(
  "ciqual_constituents",
  constituents,
  "source_version_id,code",
);
await upsertInChunks("ciqual_foods", foods, "source_version_id,code");
await upsertInChunks(
  "ciqual_nutrient_values",
  nutrientValues,
  "source_version_id,food_code,constituent_code",
);

const { data: ingredients, error: ingredientReadError } = await supabase
  .from("ingredients")
  .select("id,slug");
assert.ifError(ingredientReadError);
const ingredientBySlug = new Map(
  ingredients.map((ingredient) => [ingredient.slug, ingredient.id]),
);

const mappingRows = mappingsSource.mappings.map((mapping) => {
  const ingredientId = ingredientBySlug.get(mapping.ingredient);
  assert.ok(ingredientId, `Ingrédient interne absent : ${mapping.ingredient}`);
  assert.ok(
    foods.some((food) => food.code === mapping.foodCode),
    `Code Ciqual inconnu : ${mapping.foodCode}`,
  );
  return {
    ingredient_id: ingredientId,
    source_version_id: SOURCE.id,
    food_code: mapping.foodCode,
    status: mapping.status,
    confidence: mapping.confidence,
    rationale_fr: mapping.rationale,
  };
});

await upsertInChunks(
  "ingredient_ciqual_mappings",
  mappingRows,
  "ingredient_id,source_version_id",
);
for (const mapping of mappingsSource.mappings) {
  const { error } = await supabase
    .from("ingredients")
    .update({ ciqual_code: mapping.foodCode })
    .eq("slug", mapping.ingredient);
  assert.ifError(error);
}

const { error: unsetCurrentError } = await supabase
  .from("nutrition_source_versions")
  .update({ is_current: false })
  .eq("is_current", true)
  .neq("id", SOURCE.id);
assert.ifError(unsetCurrentError);
const { error: setCurrentError } = await supabase
  .from("nutrition_source_versions")
  .update({ is_current: true, imported_at: new Date().toISOString() })
  .eq("id", SOURCE.id);
assert.ifError(setCurrentError);

const { count: foodCount, error: foodCountError } = await supabase
  .from("ciqual_foods")
  .select("code", { count: "exact", head: true })
  .eq("source_version_id", SOURCE.id);
assert.ifError(foodCountError);
const { count: valueCount, error: valueCountError } = await supabase
  .from("ciqual_nutrient_values")
  .select("food_code", { count: "exact", head: true })
  .eq("source_version_id", SOURCE.id);
assert.ifError(valueCountError);
assert.equal(foodCount, foods.length);
assert.equal(valueCount, nutrientValues.length);

process.stdout.write(
  `Ciqual ${SOURCE.id} imported idempotently: ${foodCount} foods, ${valueCount} displayed values, ${mappingRows.length} mappings.\n`,
);
