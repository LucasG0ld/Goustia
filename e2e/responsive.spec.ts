import { expect, test } from "@playwright/test";

test("les écrans clés ne débordent pas sur mobile", async ({ page }) => {
  for (const path of ["/planning", "/courses", "/profil", "/notifications"]) {
    await page.goto(path);
    await expect(page.locator("main").last()).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});
