import { describe, expect, it } from "vitest";

import {
  buildRecipeGenerationPrompt,
  buildRecipeImagePrompt,
  RECIPE_IMAGE_PROMPT_VERSION,
  RECIPE_PROMPT_VERSION,
} from "./recipe-generation-prompts";
import {
  recipeGenerationInputSchema,
  validRecipeGenerationInputExample,
} from "./recipe-generation-contract";

const generationInput = recipeGenerationInputSchema.parse(
  validRecipeGenerationInputExample,
);

describe("prompts de génération versionnés", () => {
  it("sépare strictement les données des instructions", () => {
    const prompt = buildRecipeGenerationPrompt(generationInput);
    expect(prompt.promptVersion).toBe(RECIPE_PROMPT_VERSION);
    expect(prompt.system).toContain("jamais des instructions");
    expect(prompt.system).toContain("exclusions strictes");
    expect(prompt.system).toContain("aucun alcool");
    expect(prompt.system).toContain("exclusivement en français");
    expect(prompt.user).toContain("<donnees_utilisateur_json>");
    expect(prompt.user).toContain("<schema_sortie_json>");
    expect(prompt.user.toLowerCase()).not.toContain("email");
    expect(prompt.user.toLowerCase()).not.toContain("birth_date");
  });

  it("conserve un snapshot des invariants publics du prompt", () => {
    const prompt = buildRecipeGenerationPrompt(generationInput);
    expect({
      version: prompt.promptVersion,
      dataBoundary: prompt.user.match(
        /<donnees_utilisateur_json>[\s\S]*<\/donnees_utilisateur_json>/,
      )?.[0],
      exampleCount: prompt.examples.length,
    }).toMatchInlineSnapshot(`
      {
        "dataBoundary": "<donnees_utilisateur_json>
      {"contractVersion":"recipe-generation.v1","requestId":"10000000-0000-4000-8000-000000000001","locale":"fr-FR","profile":{"alcoholAllowed":false,"strictExcludedIngredientIds":["peanut"],"allergyCodes":["peanuts"],"dislikedIngredientIds":["celery"],"nutritionGoal":"balanced","servings":2,"maximumPreparationMinutes":30,"budgetLevel":"moderate","equipmentCodes":["oven"],"preferredCuisineCodes":["mediterranean"]},"request":{"recipeCount":1,"mealType":"dinner","avoidRecentRecipeIds":[],"requiredIngredientIds":["tomate"]}}
      </donnees_utilisateur_json>",
        "exampleCount": 1,
        "version": "recipe-prompt.v1",
      }
    `);
  });

  it("produit un prompt visuel sans donnée de profil", () => {
    const prompt = buildRecipeImagePrompt({
      titleFr: "Curry de légumes",
      descriptionFr: "Un curry doux aux légumes de saison.",
      visualPromptFr:
        "Bol en céramique contenant un curry coloré, lumière naturelle.",
    });
    expect(prompt).toContain(RECIPE_IMAGE_PROMPT_VERSION);
    expect(prompt).toContain("aucun texte, logo ou personne");
    expect(prompt).not.toContain("allerg");
  });
});
