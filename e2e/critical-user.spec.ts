import { expect, test } from "@playwright/test";

import { seededRecipe } from "./fixtures";

test.describe.configure({ mode: "serial" });

test("planning, recette, avis, favoris et courses forment un parcours continu", async ({
  page,
}) => {
  await page.goto("/planning");
  await expect(
    page.getByRole("heading", { name: "Planning hebdomadaire" }),
  ).toBeVisible();
  await page.getByRole("link", { name: seededRecipe.title }).click();
  await expect(
    page.getByRole("heading", { name: seededRecipe.title }),
  ).toBeVisible();

  const actions = page.getByRole("region", {
    name: "Actions sur la recette",
  });
  const like = actions.getByRole("button", { name: "J’aime" });
  await like.click();
  await expect(like).toHaveAttribute("aria-pressed", "true");
  await actions.getByRole("button", { name: "Ajouter aux favoris" }).click();
  await expect(
    actions.getByRole("button", { name: "Dans mes favoris" }),
  ).toBeVisible();
  await actions.getByRole("button", { name: "Ajouter aux courses" }).click();
  await expect(
    page.getByText("Ingrédients ajoutés aux courses."),
  ).toBeVisible();

  await page.goto("/favoris");
  await expect(page.getByText(seededRecipe.title)).toBeVisible();
  await page.goto("/courses");
  await expect(
    page.getByRole("heading", { name: "Liste de courses" }),
  ).toBeVisible();
});

test("un avis négatif reste modifiable et le remplacement est exposé", async ({
  page,
}) => {
  await page.goto(
    `/recettes/${seededRecipe.id}?repas=a1000000-0000-4000-8000-000000000004`,
  );
  const actions = page.getByRole("region", {
    name: "Actions sur la recette",
  });
  await actions.getByRole("button", { name: "Je n’aime pas" }).click();
  await page.getByLabel(/Pourquoi/).selectOption("too_long");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(
    page.getByRole("button", { name: "Annuler mon avis" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Remplacer ce repas" }),
  ).toBeVisible();
});
