import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("la découverte et l'authentification restent accessibles", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Se connecter" }).first().click();
  await expect(page.getByRole("heading", { name: "Bon retour" })).toBeVisible();
  await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await page.getByRole("link", { name: /mot de passe oublié/i }).click();
  await expect(
    page.getByRole("heading", { name: /mot de passe/i }),
  ).toBeVisible();
});

test("les pages légales et l'inscription sont navigables au clavier", async ({
  page,
}) => {
  await page.goto("/inscription");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await expect(page.getByLabel("Adresse e-mail")).toBeVisible();
  await page.goto("/confidentialite");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
