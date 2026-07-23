import { z } from "zod";

import { normalizeFrenchSearchTerm } from "./food";

export const foodSafetyFindingKinds = [
  "unknown_ingredient",
  "ambiguous_ingredient",
  "strict_exclusion",
  "family_exclusion",
  "allergen",
  "allergen_trace",
  "alcohol",
  "negative_preference",
] as const;

export const foodSafetyTaxonomySchema = z.object({
  ingredients: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        nameFr: z.string().trim().min(1),
        synonyms: z.array(z.string().trim().min(1)).default([]),
        familyIds: z.array(z.string().trim().min(1)).default([]),
        derivedFromIds: z.array(z.string().trim().min(1)).default([]),
        allergens: z
          .array(
            z.object({
              code: z.string().trim().min(1),
              relation: z.enum(["contains", "may_contain", "derived_from"]),
            }),
          )
          .default([]),
        containsAlcohol: z.boolean().default(false),
      }),
    )
    .min(1),
});

export const safetyRecipeIngredientSchema = z.object({
  sourceName: z.string().trim().min(1).max(300),
  canonicalIngredientId: z.string().trim().min(1).nullable().default(null),
  declaredAllergenCodes: z.array(z.string().trim().min(1)).default([]),
  mayContainAllergenCodes: z.array(z.string().trim().min(1)).default([]),
});

export const foodSafetyProfileSchema = z.object({
  alcoholAllowed: z.boolean(),
  strictIngredientIds: z.array(z.string().trim().min(1)).default([]),
  strictFamilyIds: z.array(z.string().trim().min(1)).default([]),
  allergyCodes: z.array(z.string().trim().min(1)).default([]),
  strictIntoleranceIngredientIds: z.array(z.string().trim().min(1)).default([]),
  negativePreferenceIngredientIds: z
    .array(z.string().trim().min(1))
    .default([]),
});

export const foodSafetyCheckInputSchema = z.object({
  recipeIngredients: z.array(safetyRecipeIngredientSchema).min(1).max(200),
  profile: foodSafetyProfileSchema,
  taxonomy: foodSafetyTaxonomySchema,
});

type Taxonomy = z.infer<typeof foodSafetyTaxonomySchema>;
type TaxonomyIngredient = Taxonomy["ingredients"][number];
type SafetyCheckInput = z.input<typeof foodSafetyCheckInputSchema>;
type FindingKind = (typeof foodSafetyFindingKinds)[number];

export type FoodSafetyFinding = {
  kind: FindingKind;
  severity: "block" | "warning";
  sourceName: string;
  canonicalIngredientId: string | null;
  matchedCodeOrId: string | null;
  explanationFr: string;
  relationPath: string[];
};

export type FoodSafetyReport = {
  status: "safe" | "blocked";
  checkedIngredientCount: number;
  normalizedIngredients: Array<{
    sourceName: string;
    canonicalIngredientId: string | null;
  }>;
  findings: FoodSafetyFinding[];
};

export class FoodSafetyValidationError extends Error {
  readonly report: FoodSafetyReport;

  constructor(boundary: "storage" | "display", report: FoodSafetyReport) {
    super(
      boundary === "storage"
        ? "Recette bloquée avant stockage par le contrôle alimentaire"
        : "Recette bloquée avant affichage par le contrôle alimentaire",
    );
    this.name = "FoodSafetyValidationError";
    this.report = report;
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function resolveIngredient(
  sourceName: string,
  canonicalIngredientId: string | null,
  taxonomy: Taxonomy,
): TaxonomyIngredient[] {
  if (canonicalIngredientId) {
    const direct = taxonomy.ingredients.find(
      (ingredient) => ingredient.id === canonicalIngredientId,
    );
    return direct ? [direct] : [];
  }

  const normalized = normalizeFrenchSearchTerm(sourceName);
  return taxonomy.ingredients.filter((ingredient) =>
    [ingredient.nameFr, ...ingredient.synonyms].some(
      (name) => normalizeFrenchSearchTerm(name) === normalized,
    ),
  );
}

function getAncestors(
  ingredient: TaxonomyIngredient,
  ingredientById: Map<string, TaxonomyIngredient>,
): { ids: string[]; paths: Map<string, string[]> } {
  const ids: string[] = [];
  const paths = new Map<string, string[]>();
  const queue = ingredient.derivedFromIds.map((id) => ({
    id,
    path: [ingredient.id, id],
  }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || paths.has(current.id)) continue;
    paths.set(current.id, current.path);
    ids.push(current.id);
    const parent = ingredientById.get(current.id);
    for (const ancestorId of parent?.derivedFromIds ?? []) {
      queue.push({
        id: ancestorId,
        path: [...current.path, ancestorId],
      });
    }
  }
  return { ids, paths };
}

function finding(
  kind: FindingKind,
  severity: "block" | "warning",
  sourceName: string,
  canonicalIngredientId: string | null,
  matchedCodeOrId: string | null,
  explanationFr: string,
  relationPath: string[] = [],
): FoodSafetyFinding {
  return {
    kind,
    severity,
    sourceName,
    canonicalIngredientId,
    matchedCodeOrId,
    explanationFr,
    relationPath,
  };
}

export function checkFoodSafety(input: SafetyCheckInput): FoodSafetyReport {
  const parsed = foodSafetyCheckInputSchema.parse(input);
  const ingredientById = new Map(
    parsed.taxonomy.ingredients.map((ingredient) => [
      ingredient.id,
      ingredient,
    ]),
  );
  const findings: FoodSafetyFinding[] = [];
  const normalizedIngredients: FoodSafetyReport["normalizedIngredients"] = [];

  for (const recipeIngredient of parsed.recipeIngredients) {
    const matches = resolveIngredient(
      recipeIngredient.sourceName,
      recipeIngredient.canonicalIngredientId,
      parsed.taxonomy,
    );

    if (matches.length === 0) {
      normalizedIngredients.push({
        sourceName: recipeIngredient.sourceName,
        canonicalIngredientId: null,
      });
      findings.push(
        finding(
          "unknown_ingredient",
          "block",
          recipeIngredient.sourceName,
          null,
          null,
          "Ingrédient inconnu : une vérification humaine ou une correction de taxonomie est requise.",
        ),
      );
      continue;
    }

    if (matches.length > 1) {
      normalizedIngredients.push({
        sourceName: recipeIngredient.sourceName,
        canonicalIngredientId: null,
      });
      findings.push(
        finding(
          "ambiguous_ingredient",
          "block",
          recipeIngredient.sourceName,
          null,
          null,
          `Le libellé correspond à plusieurs ingrédients : ${matches
            .map((match) => match.id)
            .join(", ")}.`,
        ),
      );
      continue;
    }

    const ingredient = matches[0];
    normalizedIngredients.push({
      sourceName: recipeIngredient.sourceName,
      canonicalIngredientId: ingredient.id,
    });
    const ancestors = getAncestors(ingredient, ingredientById);
    const relatedIds = unique([ingredient.id, ...ancestors.ids]);
    const relatedIngredients = relatedIds
      .map((id) => ingredientById.get(id))
      .filter((item): item is TaxonomyIngredient => Boolean(item));

    const excludedId = relatedIds.find(
      (id) =>
        parsed.profile.strictIngredientIds.includes(id) ||
        parsed.profile.strictIntoleranceIngredientIds.includes(id),
    );
    if (excludedId) {
      findings.push(
        finding(
          "strict_exclusion",
          "block",
          recipeIngredient.sourceName,
          ingredient.id,
          excludedId,
          `L’ingrédient correspond à l’exclusion stricte « ${excludedId} ».`,
          excludedId === ingredient.id
            ? [ingredient.id]
            : (ancestors.paths.get(excludedId) ?? []),
        ),
      );
    }

    const excludedFamily = relatedIngredients
      .flatMap((item) => item.familyIds)
      .find((familyId) => parsed.profile.strictFamilyIds.includes(familyId));
    if (excludedFamily) {
      findings.push(
        finding(
          "family_exclusion",
          "block",
          recipeIngredient.sourceName,
          ingredient.id,
          excludedFamily,
          `La famille « ${excludedFamily} » est strictement exclue.`,
          [ingredient.id, excludedFamily],
        ),
      );
    }

    const taxonomyAllergens = relatedIngredients.flatMap((item) =>
      item.allergens.map((allergen) => ({
        ...allergen,
        ingredientId: item.id,
      })),
    );
    for (const allergyCode of parsed.profile.allergyCodes) {
      const taxonomyMatch = taxonomyAllergens.find(
        (allergen) => allergen.code === allergyCode,
      );
      const declared =
        recipeIngredient.declaredAllergenCodes.includes(allergyCode);
      const mayContain =
        recipeIngredient.mayContainAllergenCodes.includes(allergyCode) ||
        taxonomyMatch?.relation === "may_contain";
      if (taxonomyMatch || declared || mayContain) {
        findings.push(
          finding(
            mayContain ? "allergen_trace" : "allergen",
            "block",
            recipeIngredient.sourceName,
            ingredient.id,
            allergyCode,
            mayContain
              ? `Une trace possible de l’allergène « ${allergyCode} » est incompatible avec le profil.`
              : `L’allergène « ${allergyCode} » est incompatible avec le profil.`,
            taxonomyMatch
              ? [
                  ingredient.id,
                  taxonomyMatch.ingredientId,
                  `allergen:${allergyCode}`,
                ]
              : [ingredient.id, `allergen:${allergyCode}`],
          ),
        );
      }
    }

    if (
      !parsed.profile.alcoholAllowed &&
      relatedIngredients.some((item) => item.containsAlcohol)
    ) {
      const alcoholIngredient = relatedIngredients.find(
        (item) => item.containsAlcohol,
      );
      findings.push(
        finding(
          "alcohol",
          "block",
          recipeIngredient.sourceName,
          ingredient.id,
          alcoholIngredient?.id ?? ingredient.id,
          "La recette contient de l’alcool alors que le profil ne l’autorise pas.",
          alcoholIngredient?.id === ingredient.id
            ? [ingredient.id]
            : (ancestors.paths.get(alcoholIngredient?.id ?? "") ?? []),
        ),
      );
    }

    const dislikedId = relatedIds.find((id) =>
      parsed.profile.negativePreferenceIngredientIds.includes(id),
    );
    if (dislikedId) {
      findings.push(
        finding(
          "negative_preference",
          "warning",
          recipeIngredient.sourceName,
          ingredient.id,
          dislikedId,
          "Préférence négative détectée : elle influence la recommandation mais ne constitue pas une exclusion de sécurité.",
          dislikedId === ingredient.id
            ? [ingredient.id]
            : (ancestors.paths.get(dislikedId) ?? []),
        ),
      );
    }
  }

  return {
    status: findings.some((item) => item.severity === "block")
      ? "blocked"
      : "safe",
    checkedIngredientCount: parsed.recipeIngredients.length,
    normalizedIngredients,
    findings,
  };
}

function assertBoundary(
  boundary: "storage" | "display",
  input: SafetyCheckInput,
): FoodSafetyReport {
  const report = checkFoodSafety(input);
  if (report.status === "blocked") {
    throw new FoodSafetyValidationError(boundary, report);
  }
  return report;
}

export function assertRecipeSafeForStorage(
  input: SafetyCheckInput,
): FoodSafetyReport {
  return assertBoundary("storage", input);
}

export function assertRecipeSafeForDisplay(
  input: SafetyCheckInput,
): FoodSafetyReport {
  return assertBoundary("display", input);
}
