import { expect, test } from "@playwright/test";

test("l'administration expose IA, quotas et référentiel sans secrets", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Administration", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "IA", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /IA, quotas et coûts/ }),
  ).toBeVisible();
  await expect(page.getByText(/Aucun secret/)).toBeVisible();
  await page.getByRole("link", { name: "Référentiel" }).click();
  await expect(
    page.getByRole("heading", { name: /Référentiel alimentaire/ }),
  ).toBeVisible();
});
