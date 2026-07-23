import { performance } from "node:perf_hooks";

import {
  benchmarkCoverage,
  benchmarkProfiles,
} from "./ai-benchmark-corpus.mjs";

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, ...value] = argument.replace(/^--/, "").split("=");
    return [key, value.join("=") || "true"];
  }),
);
const providers = (args.get("providers") ?? "fake").split(",");
const limit = Math.min(
  benchmarkProfiles.length,
  Number(args.get("limit") ?? benchmarkProfiles.length),
);
const outputJson = args.get("json") === "true";

function fakeRecipe(profile, index) {
  const ingredientPool = [
    "tomato",
    "lentil",
    "rice",
    "chickpea",
    "zucchini",
    "carrot",
  ].filter(
    (ingredient) => !profile.strictExcludedIngredientIds.includes(ingredient),
  );
  return {
    titleFr: `${profile.expectedDishFamily} végétal ${index + 1}`,
    descriptionFr:
      "Une recette fictive équilibrée, simple et parfumée pour le benchmark.",
    servings: profile.servings,
    preparationMinutes: Math.min(profile.maximumPreparationMinutes ?? 30, 30),
    cookingMinutes: 20,
    ingredients: ingredientPool.slice(0, 4).map((canonicalIngredientId) => ({
      canonicalIngredientId,
      quantity: 100,
      unit: "g",
      declaredAllergenCodes: [],
    })),
    steps: [
      {
        instructionFr: "Préparer tous les ingrédients puis les rincer.",
        ingredientPositions: [1, 2, 3, 4],
      },
      {
        instructionFr: "Cuire doucement et servir sans attendre.",
        ingredientPositions: [1, 2, 3, 4],
      },
    ],
    declaredAllergenCodes: [],
    containsAlcohol: false,
    visual: {
      promptFr: `Photographie culinaire réaliste d'un ${profile.expectedDishFamily}, sans texte ni personne.`,
      illustrative: true,
    },
    usage: { inputTokens: 0, outputTokens: 0, neurons: 0 },
  };
}

async function callGroq(profile) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY_MISSING");
  const started = performance.now();
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_TEXT_MODEL ?? "openai/gpt-oss-120b",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu produis une seule recette française de benchmark au format JSON. Respecte strictement les allergies, exclusions et l'interdiction d'alcool.",
          },
          { role: "user", content: JSON.stringify(profile) },
        ],
      }),
    },
  );
  if (!response.ok) throw new Error(`GROQ_HTTP_${response.status}`);
  const payload = await response.json();
  return {
    recipe: JSON.parse(payload.choices[0].message.content),
    latencyMs: performance.now() - started,
    usage: {
      inputTokens: payload.usage?.prompt_tokens ?? 0,
      outputTokens: payload.usage?.completion_tokens ?? 0,
      neurons: 0,
    },
  };
}

async function callCloudflare(profile) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !token) throw new Error("CLOUDFLARE_CREDENTIALS_MISSING");
  const model =
    process.env.AI_TEXT_FALLBACK_MODEL ??
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const started = performance.now();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu produis une seule recette française de benchmark au format JSON. Respecte strictement les allergies, exclusions et l'interdiction d'alcool.",
          },
          { role: "user", content: JSON.stringify(profile) },
        ],
      }),
    },
  );
  if (!response.ok) throw new Error(`CLOUDFLARE_HTTP_${response.status}`);
  const payload = await response.json();
  const raw = payload.result?.response ?? payload.result;
  return {
    recipe: typeof raw === "string" ? JSON.parse(raw) : raw,
    latencyMs: performance.now() - started,
    usage: {
      inputTokens: payload.result?.usage?.prompt_tokens ?? 0,
      outputTokens: payload.result?.usage?.completion_tokens ?? 0,
      neurons: payload.result?.usage?.neurons ?? 0,
    },
  };
}

function evaluate(profile, recipe, latencyMs, usage) {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const ingredientIds = ingredients
    .map(({ canonicalIngredientId }) => canonicalIngredientId)
    .filter(Boolean);
  const allergens = new Set([
    ...(Array.isArray(recipe.declaredAllergenCodes)
      ? recipe.declaredAllergenCodes
      : []),
    ...ingredients.flatMap(({ declaredAllergenCodes }) =>
      Array.isArray(declaredAllergenCodes) ? declaredAllergenCodes : [],
    ),
  ]);
  const quantityValid =
    ingredients.length > 0 &&
    ingredients.every(
      ({ quantity }) => typeof quantity === "number" && quantity > 0,
    );
  const positionsCovered = ingredients.every((_, index) =>
    steps.some(({ ingredientPositions }) =>
      Array.isArray(ingredientPositions)
        ? ingredientPositions.includes(index + 1)
        : false,
    ),
  );
  const frenchText = `${recipe.titleFr ?? ""} ${recipe.descriptionFr ?? ""} ${steps
    .map(({ instructionFr }) => instructionFr ?? "")
    .join(" ")}`;
  const frenchQuality = /[àâçéèêëîïôûùüÿœ]| une | les | puis | cuire/i.test(
    frenchText,
  )
    ? 1
    : 0;
  const schema =
    typeof recipe.titleFr === "string" &&
    typeof recipe.descriptionFr === "string" &&
    Number.isInteger(recipe.servings) &&
    ingredients.length > 0 &&
    steps.length > 0;
  const exclusionSafe = !ingredientIds.some((id) =>
    profile.strictExcludedIngredientIds.includes(id),
  );
  const allergySafe = !profile.allergyCodes.some((code) => allergens.has(code));
  const alcoholSafe =
    profile.alcoholAllowed ||
    (!recipe.containsAlcohol &&
      !ingredientIds.some((id) => /wine|beer|rum|alcool|vin|biere/i.test(id)));
  return {
    schema: Number(schema),
    exclusions: Number(exclusionSafe && allergySafe),
    alcohol: Number(alcoholSafe),
    quantities: Number(quantityValid),
    ingredientSteps: Number(steps.length > 0 && positionsCovered),
    french: frenchQuality,
    imagePrompt: Number(
      typeof recipe.visual?.promptFr === "string" &&
        recipe.visual.promptFr.length >= 20 &&
        recipe.visual.illustrative === true,
    ),
    title: recipe.titleFr ?? "",
    latencyMs,
    usage,
  };
}

const adapters = {
  fake: async (profile, index) => ({
    recipe: fakeRecipe(profile, index),
    latencyMs: 0,
    usage: { inputTokens: 0, outputTokens: 0, neurons: 0 },
  }),
  groq: callGroq,
  cloudflare: callCloudflare,
};

const report = {
  generatedAt: new Date().toISOString(),
  corpus: benchmarkCoverage,
  providers: {},
  validationStatus: "human_thresholds_pending",
};

for (const provider of providers) {
  const adapter = adapters[provider];
  if (!adapter) throw new Error(`UNKNOWN_PROVIDER:${provider}`);
  const results = [];
  for (const [index, profile] of benchmarkProfiles.slice(0, limit).entries()) {
    const started = performance.now();
    const output = await adapter(profile, index);
    results.push(
      evaluate(
        profile,
        output.recipe,
        output.latencyMs ?? performance.now() - started,
        output.usage,
      ),
    );
  }
  const average = (field) =>
    results.reduce((sum, result) => sum + result[field], 0) / results.length;
  report.providers[provider] = {
    samples: results.length,
    schemaRate: average("schema"),
    exclusionRate: average("exclusions"),
    alcoholRate: average("alcohol"),
    quantityRate: average("quantities"),
    ingredientStepRate: average("ingredientSteps"),
    frenchRate: average("french"),
    imagePromptRate: average("imagePrompt"),
    uniqueTitleRate:
      new Set(results.map(({ title }) => title)).size / results.length,
    averageLatencyMs: average("latencyMs"),
    inputTokens: results.reduce(
      (sum, result) => sum + result.usage.inputTokens,
      0,
    ),
    outputTokens: results.reduce(
      (sum, result) => sum + result.usage.outputTokens,
      0,
    ),
    neurons: results.reduce((sum, result) => sum + result.usage.neurons, 0),
  };
}

if (outputJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.table(report.providers);
  console.log(
    "Résultats exploratoires uniquement : validation humaine des seuils requise.",
  );
}
