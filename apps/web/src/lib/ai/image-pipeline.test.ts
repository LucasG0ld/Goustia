import {
  generatedRecipeSchema,
  validGeneratedRecipeExample,
} from "@recettes/domain";
import { describe, expect, it, vi } from "vitest";

import {
  DeterministicImageProcessor,
  RecipeImagePipeline,
  type RecipeImageStorage,
} from "./image-pipeline";
import { FakeRecipeImageGenerator } from "./providers/fake";

function storage(ready = false): RecipeImageStorage & {
  store: ReturnType<typeof vi.fn>;
  resetForAdmin: ReturnType<typeof vi.fn>;
} {
  return {
    findReady: vi.fn(async () =>
      ready ? { path: "recipe/image.webp" } : null,
    ),
    store: vi.fn(async () => undefined),
    resetForAdmin: vi.fn(async () => undefined),
  };
}

describe("pipeline d'images", () => {
  const validRecipe = generatedRecipeSchema.parse(validGeneratedRecipeExample);
  it("réutilise une image canonique existante", async () => {
    const generator = new FakeRecipeImageGenerator();
    const generate = vi.spyOn(generator, "generate");
    const pipeline = new RecipeImagePipeline(
      generator,
      new DeterministicImageProcessor(),
      storage(true),
    );
    await expect(
      pipeline.generateForValidatedRecipe(
        "60000000-0000-4000-8000-000000000001",
        validRecipe,
      ),
    ).resolves.toBe("cached");
    expect(generate).not.toHaveBeenCalled();
  });

  it("stocke une seule image avec la mention illustrative", async () => {
    const target = storage();
    const onUsage = vi.fn(async () => undefined);
    const pipeline = new RecipeImagePipeline(
      new FakeRecipeImageGenerator(),
      new DeterministicImageProcessor(),
      target,
      onUsage,
    );
    await expect(
      pipeline.generateForValidatedRecipe(
        "60000000-0000-4000-8000-000000000002",
        validRecipe,
      ),
    ).resolves.toBe("ready");
    expect(target.store).toHaveBeenCalledWith(
      expect.objectContaining({
        illustrative: true,
        promptVersion: "recipe-image-prompt.v1",
      }),
    );
    expect(onUsage).toHaveBeenCalledOnce();
  });

  it("retombe sur le placeholder et réserve la régénération à l'admin", async () => {
    const target = storage();
    const failingGenerator = new FakeRecipeImageGenerator();
    vi.spyOn(failingGenerator, "generate").mockRejectedValue(
      new Error("provider down"),
    );
    const pipeline = new RecipeImagePipeline(
      failingGenerator,
      new DeterministicImageProcessor(),
      target,
    );
    await expect(
      pipeline.generateForValidatedRecipe(
        "60000000-0000-4000-8000-000000000003",
        validRecipe,
      ),
    ).resolves.toBe("placeholder");
    await pipeline.regenerateAsAdmin(
      "60000000-0000-4000-8000-000000000003",
      "60000000-0000-4000-8000-000000000004",
      validRecipe,
    );
    expect(target.resetForAdmin).toHaveBeenCalledOnce();
  });
});
