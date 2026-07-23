import { describe, expect, it } from "vitest";

import {
  generatedRecipeJsonSchema,
  generatedRecipeSchema,
  invalidGeneratedRecipeExamples,
  recipeGenerationInputJsonSchema,
  recipeGenerationInputSchema,
  validGeneratedRecipeExample,
  validRecipeGenerationInputExample,
} from "./recipe-generation-contract";

function expectStrictObjects(schema: unknown): void {
  if (!schema || typeof schema !== "object") return;
  const record = schema as Record<string, unknown>;
  if (record.type === "object") {
    const properties = (record.properties ?? {}) as Record<string, unknown>;
    expect(record.additionalProperties).toBe(false);
    expect(new Set(record.required as string[])).toEqual(
      new Set(Object.keys(properties)),
    );
  }
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) {
      value.forEach(expectStrictObjects);
    } else {
      expectStrictObjects(value);
    }
  }
}

describe("contrat de génération de recettes v1", () => {
  it("valide l’entrée pseudonymisée de référence", () => {
    expect(
      recipeGenerationInputSchema.safeParse(validRecipeGenerationInputExample)
        .success,
    ).toBe(true);
  });

  it("interdit les champs d’identité et de date de naissance", () => {
    for (const forbidden of [
      { firstName: "Alice" },
      { email: "alice@example.test" },
      { birthDate: "2010-01-01" },
      { userId: "10000000-0000-4000-8000-000000000099" },
    ]) {
      expect(
        recipeGenerationInputSchema.safeParse({
          ...validRecipeGenerationInputExample,
          ...forbidden,
        }).success,
      ).toBe(false);
    }
  });

  it("valide une recette française structurée", () => {
    expect(generatedRecipeSchema.parse(validGeneratedRecipeExample)).toEqual(
      validGeneratedRecipeExample,
    );
  });

  it.each(invalidGeneratedRecipeExamples)(
    "rejette les exemples incompatibles %#",
    (example) => {
      expect(generatedRecipeSchema.safeParse(example).success).toBe(false);
    },
  );

  it("rejette une étape qui référence un ingrédient absent", () => {
    const result = generatedRecipeSchema.safeParse({
      ...validGeneratedRecipeExample,
      steps: [
        {
          ...validGeneratedRecipeExample.steps[0],
          ingredientPositions: [99],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("produit des JSON Schema stricts compatibles avec le fournisseur", () => {
    expect(recipeGenerationInputJsonSchema.$schema).toContain("draft-07");
    expect(recipeGenerationInputJsonSchema.additionalProperties).toBe(false);
    expect(generatedRecipeJsonSchema.$schema).toContain("draft-07");
    expect(generatedRecipeJsonSchema.additionalProperties).toBe(false);
    expect(JSON.stringify(generatedRecipeJsonSchema)).not.toContain(
      "undefined",
    );
    expectStrictObjects(recipeGenerationInputJsonSchema);
    expectStrictObjects(generatedRecipeJsonSchema);
  });
});
